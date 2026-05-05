import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/dashboard")({
  head: () => ({ meta: [{ title: "Today — Twoweek" }] }),
  component: Dashboard,
});

type Exercise = { name: string; sets: number; reps: string; cue: string };
type Day = { title: string; focus: string; motivation: string; exercises: Exercise[] };

function Dashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [planId, setPlanId] = useState<string | null>(null);
  const [days, setDays] = useState<Day[] | null>(null);
  const [startDate, setStartDate] = useState<string>("");
  const [completed, setCompleted] = useState<Record<string, boolean>>({});
  const [regenerating, setRegenerating] = useState(false);

  const load = useCallback(async () => {
    const { data: session } = await supabase.auth.getSession();
    if (!session.session) { navigate({ to: "/auth" }); return; }
    const userId = session.session.user.id;
    const [{ data: prof }, { data: plan }] = await Promise.all([
      supabase.from("profiles").select("name, goal").eq("id", userId).single(),
      supabase.from("plans").select("*").eq("user_id", userId).order("created_at", { ascending: false }).limit(1).maybeSingle(),
    ]);
    if (!prof || !prof.goal) { navigate({ to: "/onboarding" }); return; }
    setName(prof.name);
    if (!plan) { navigate({ to: "/onboarding" }); return; }
    setPlanId(plan.id);
    setDays(plan.days as unknown as Day[]);
    setStartDate(plan.start_date);
    const { data: comps } = await supabase.from("completions").select("*").eq("plan_id", plan.id);
    const map: Record<string, boolean> = {};
    (comps ?? []).forEach((c) => { map[`${c.day_index}-${c.exercise_index}`] = c.completed; });
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

  async function toggle(dayIdx: number, exIdx: number) {
    if (!planId) return;
    const key = `${dayIdx}-${exIdx}`;
    const next = !completed[key];
    setCompleted({ ...completed, [key]: next });
    const userRes = await supabase.auth.getUser();
    const userId = userRes.data.user?.id;
    if (!userId) return;
    await supabase.from("completions").upsert({
      user_id: userId, plan_id: planId, day_index: dayIdx, exercise_index: exIdx, completed: next,
    }, { onConflict: "plan_id,day_index,exercise_index" });
  }

  async function signOut() {
    await supabase.auth.signOut();
    navigate({ to: "/" });
  }

  if (loading || !days) {
    return <div className="flex min-h-screen items-center justify-center bg-background"><div className="serif text-3xl">✦ Loading...</div></div>;
  }

  const today = days[todayIndex];
  const totalToday = today.exercises.length;
  const doneToday = today.exercises.filter((_, i) => completed[`${todayIndex}-${i}`]).length;

  return (
    <div className="relative min-h-screen overflow-hidden bg-background paper">
      <div className="blob top-[-100px] right-[-100px] h-[400px] w-[400px] bg-primary/30" />
      <div className="blob bottom-[10%] left-[-100px] h-[400px] w-[400px] bg-accent/40" />

      <header className="relative z-10 mx-auto flex max-w-4xl items-center justify-between px-6 py-6">
        <Link to="/" className="serif text-2xl font-bold">Two<span className="italic-accent">week</span></Link>
        <div className="flex items-center gap-2">
          <Link to="/plan" className="rounded-full px-4 py-2 text-sm font-semibold hover:bg-foreground/5">Full plan</Link>
          <button onClick={signOut} className="rounded-full px-4 py-2 text-sm font-semibold hover:bg-foreground/5">Sign out</button>
        </div>
      </header>

      <main className="relative z-10 mx-auto max-w-2xl px-6 py-8">
        <p className="text-sm font-semibold uppercase tracking-widest text-primary">
          Day {todayIndex + 1} of 14
        </p>
        <h1 className="mt-2 serif text-5xl font-bold leading-[1.05] md:text-6xl">
          Hi {name}, <span className="italic-accent italic">{today.title.toLowerCase()}</span>.
        </h1>
        <p className="mt-4 text-lg text-foreground/70">{today.motivation}</p>

        <div className="mt-8 flex items-center gap-3 text-sm font-semibold text-foreground/60">
          <div className="flex-1 overflow-hidden rounded-full bg-foreground/10">
            <div className="h-2 rounded-full bg-primary transition-all" style={{ width: `${totalToday ? (doneToday / totalToday) * 100 : 0}%` }} />
          </div>
          <span>{doneToday}/{totalToday}</span>
        </div>

        <ul className="mt-8 space-y-3">
          {today.exercises.map((ex, i) => {
            const done = completed[`${todayIndex}-${i}`];
            return (
              <li key={i}>
                <button onClick={() => toggle(todayIndex, i)}
                  className={`flex w-full items-start gap-4 rounded-2xl border-2 p-5 text-left transition ${done ? "border-primary/40 bg-primary/5" : "border-foreground/10 bg-card hover:border-foreground/30"}`}>
                  <div className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 transition ${done ? "border-primary bg-primary text-primary-foreground" : "border-foreground/30"}`}>
                    {done && "✓"}
                  </div>
                  <div className="flex-1">
                    <div className={`serif text-xl font-bold ${done ? "text-foreground/50 line-through" : ""}`}>{ex.name}</div>
                    <div className="mt-1 text-sm font-semibold text-primary">{ex.sets > 1 ? `${ex.sets} × ` : ""}{ex.reps}</div>
                    <div className="mt-1 text-sm text-foreground/60">{ex.cue}</div>
                  </div>
                </button>
              </li>
            );
          })}
        </ul>

        {todayIndex >= 13 && (
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
