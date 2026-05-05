import { useEffect, useState, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { pickExerciseImage } from "@/lib/exercise-images";

type Exercise = { name: string; sets: number; reps: string; cue: string };
type Day = { title: string; focus: string; motivation: string; exercises: Exercise[] };

export default function Dashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [planId, setPlanId] = useState<string | null>(null);
  const [days, setDays] = useState<Day[] | null>(null);
  const [startDate, setStartDate] = useState<string>("");
  const [completed, setCompleted] = useState<Record<string, boolean>>({});
  const [activeIdx, setActiveIdx] = useState(0);
  const [regenerating, setRegenerating] = useState(false);

  const load = useCallback(async () => {
    const { data: session } = await supabase.auth.getSession();
    if (!session.session) { navigate("/auth"); return; }
    const userId = session.session.user.id;
    const [{ data: prof }, { data: plan }] = await Promise.all([
      supabase.from("profiles").select("name, goal").eq("id", userId).single(),
      supabase.from("plans").select("*").eq("user_id", userId).order("created_at", { ascending: false }).limit(1).maybeSingle(),
    ]);
    if (!prof || !prof.goal) { navigate("/onboarding"); return; }
    setName(prof.name);
    if (!plan) { navigate("/onboarding"); return; }
    setPlanId(plan.id);
    setDays(plan.days as unknown as Day[]);
    setStartDate(plan.start_date);
    const { data: comps } = await supabase.from("completions").select("*").eq("plan_id", plan.id);
    const map: Record<string, boolean> = {};
    (comps ?? []).forEach((c: any) => { map[`${c.day_index}-${c.exercise_index}`] = c.completed; });
    setCompleted(map);
    setLoading(false);
  }, [navigate]);

  useEffect(() => { load(); }, [load]);

  const todayIndex = (() => {
    if (!startDate) return 0;
    const start = new Date(startDate + "T00:00:00");
    const now = new Date();
    const diff = Math.floor((now.getTime() - start.getTime()) / 86400000);
    return Math.max(0, Math.min(13, diff));
  })();

  useEffect(() => {
    if (!days) return;
    const today = days[todayIndex];
    const firstIncomplete = today.exercises.findIndex((_, i) => !completed[`${todayIndex}-${i}`]);
    setActiveIdx(firstIncomplete === -1 ? 0 : firstIncomplete);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [days, todayIndex]);

  async function regenerate() {
    setRegenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-plan");
      if (error) throw error;
      if ((data as any)?.error) throw new Error((data as any).error);
      toast.success("Fresh plan generated!");
      await load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not regenerate");
    } finally {
      setRegenerating(false);
    }
  }

  async function toggle(exIdx: number) {
    if (!planId) return;
    const key = `${todayIndex}-${exIdx}`;
    const next = !completed[key];
    setCompleted({ ...completed, [key]: next });
    const userRes = await supabase.auth.getUser();
    const userId = userRes.data.user?.id;
    if (!userId) return;
    await supabase.from("completions").upsert({
      user_id: userId, plan_id: planId, day_index: todayIndex, exercise_index: exIdx, completed: next,
    }, { onConflict: "plan_id,day_index,exercise_index" });
  }

  async function signOut() {
    await supabase.auth.signOut();
    navigate("/");
  }

  if (loading || !days) {
    return <div className="flex min-h-screen items-center justify-center bg-background"><div className="serif text-3xl">✦ Loading...</div></div>;
  }

  const today = days[todayIndex];
  const totalToday = today.exercises.length;
  const doneToday = today.exercises.filter((_, i) => completed[`${todayIndex}-${i}`]).length;
  const allDone = doneToday === totalToday;
  const activeEx = today.exercises[activeIdx];
  const activeImg = pickExerciseImage(activeEx.name);

  return (
    <div className="relative min-h-screen overflow-hidden bg-background paper">
      <div className="blob top-[-150px] right-[-100px] h-[500px] w-[500px] bg-primary/25" />
      <div className="blob bottom-[-100px] left-[-100px] h-[450px] w-[450px] bg-accent/35" />
      <header className="relative z-20 mx-auto flex max-w-7xl items-center justify-between px-6 py-6">
        <Link to="/" className="serif text-2xl font-bold">Two<span className="italic-accent">week</span></Link>
        <div className="flex items-center gap-1 text-sm">
          <Link to="/plan" className="rounded-full px-4 py-2 font-semibold hover:bg-foreground/5">Full plan</Link>
          <button onClick={signOut} className="rounded-full px-4 py-2 font-semibold hover:bg-foreground/5">Sign out</button>
        </div>
      </header>
      <main className="relative z-10 mx-auto max-w-7xl px-6 pb-20">
        <div className="mb-10 max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-widest text-primary">
            Day {todayIndex + 1} of 14 · <span className="capitalize">{today.focus}</span>
          </p>
          <h1 className="mt-2 serif text-4xl font-bold leading-[1.05] md:text-6xl">
            Hi {name}, <span className="italic-accent italic">{today.title.toLowerCase()}</span>.
          </h1>
          <p className="mt-3 text-lg text-foreground/65 italic">"{today.motivation}"</p>
        </div>
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
          {/* LEFT: checklist */}
          <section className="rounded-3xl border-2 border-foreground/10 bg-card p-6 md:p-8">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="serif text-2xl font-bold">Your checklist</h2>
              <span className="text-sm font-semibold text-foreground/50">{doneToday}/{totalToday}</span>
            </div>
            <div className="mb-6 h-2 overflow-hidden rounded-full bg-foreground/10">
              <div className="h-full rounded-full bg-primary transition-all duration-500" style={{ width: `${totalToday ? (doneToday / totalToday) * 100 : 0}%` }} />
            </div>
            <ul className="space-y-2">
              {today.exercises.map((ex, i) => {
                const done = completed[`${todayIndex}-${i}`];
                const active = i === activeIdx;
                return (
                  <li key={i}>
                    <div className={`group flex items-start gap-3 rounded-2xl border-2 p-4 transition ${active ? "border-primary bg-primary/5" : done ? "border-foreground/5 bg-transparent" : "border-foreground/10 bg-background/50 hover:border-foreground/25"}`}>
                      <button onClick={(e) => { e.stopPropagation(); toggle(i); }}
                        aria-label={done ? "Mark incomplete" : "Mark complete"}
                        className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 transition ${done ? "border-primary bg-primary text-primary-foreground" : "border-foreground/30 hover:border-primary"}`}>
                        {done && <span className="text-sm">✓</span>}
                      </button>
                      <button onClick={() => setActiveIdx(i)} className="flex-1 text-left">
                        <div className="flex items-baseline justify-between gap-2">
                          <div className={`serif text-lg font-bold transition ${done ? "text-foreground/40 line-through" : "text-foreground"}`}>{ex.name}</div>
                          <div className="shrink-0 text-xs font-semibold text-primary">{ex.sets > 1 ? `${ex.sets} ×` : ""} {ex.reps}</div>
                        </div>
                        {active && !done && <p className="mt-1 text-sm text-foreground/60">{ex.cue}</p>}
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
            {allDone && (
              <div className="mt-6 rounded-2xl bg-primary/10 p-5 text-center">
                <p className="serif text-xl font-bold">Day complete. ✦</p>
                <p className="mt-1 text-sm text-foreground/60">Come back tomorrow.</p>
              </div>
            )}
          </section>
          {/* RIGHT: active exercise */}
          <section className="relative overflow-hidden rounded-3xl border-2 border-foreground/10 bg-gradient-to-br from-blush/40 via-card to-accent/30 p-6 md:p-10">
            <div className="absolute inset-0 paper opacity-40" />
            <div className="relative z-10 flex h-full flex-col">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-widest text-foreground/50">Exercise {activeIdx + 1} of {totalToday}</span>
                <span className="rounded-full bg-foreground px-3 py-1 text-xs font-bold uppercase tracking-wider text-background">
                  {activeEx.sets > 1 ? `${activeEx.sets} × ` : ""}{activeEx.reps}
                </span>
              </div>
              <div className="my-4 flex flex-1 items-center justify-center">
                <img key={activeEx.name + activeIdx} src={activeImg} alt={activeEx.name}
                  className="floaty max-h-[400px] w-auto object-contain" width={768} height={768} loading="lazy" />
              </div>
              <div>
                <h3 className="serif text-3xl font-bold leading-tight md:text-4xl">{activeEx.name}</h3>
                <p className="mt-2 text-base text-foreground/70">{activeEx.cue}</p>
                <div className="mt-5 flex flex-wrap gap-3">
                  <button onClick={() => toggle(activeIdx)}
                    className={`rounded-full px-6 py-3 text-sm font-semibold transition ${completed[`${todayIndex}-${activeIdx}`] ? "border-2 border-foreground/20 bg-transparent text-foreground hover:bg-foreground/5" : "bg-primary text-primary-foreground hover:scale-[1.02]"}`}>
                    {completed[`${todayIndex}-${activeIdx}`] ? "↺ Mark undone" : "✓ Mark done"}
                  </button>
                  {activeIdx < totalToday - 1 && (
                    <button onClick={() => setActiveIdx(activeIdx + 1)}
                      className="rounded-full border-2 border-foreground/20 px-6 py-3 text-sm font-semibold hover:bg-foreground/5">
                      Next exercise →
                    </button>
                  )}
                </div>
              </div>
            </div>
          </section>
        </div>
        {todayIndex >= 13 && allDone && (
          <div className="mt-10 rounded-3xl border-2 border-primary/30 bg-primary/10 p-8 text-center">
            <h3 className="serif text-3xl font-bold">Two weeks done. ✦</h3>
            <p className="mt-2 text-foreground/70">Time for a fresh chapter.</p>
            <button onClick={regenerate} disabled={regenerating}
              className="mt-5 rounded-full bg-primary px-7 py-3 font-semibold text-primary-foreground hover:scale-[1.02] disabled:opacity-60">
              {regenerating ? "Writing..." : "Generate next 14 days →"}
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
