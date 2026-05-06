import { useEffect, useState, useCallback, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { pickExerciseImage } from "@/lib/exercise-images";

type Exercise = { name: string; sets: number; reps: string; cue: string };
type Session = { kind: "main" | "movement"; title: string; suggested_time: string; exercises: Exercise[] };
type Day = { title: string; focus: string; motivation: string; sessions?: Session[]; exercises?: Exercise[] };

function useNow() {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(interval);
  }, []);
  return now;
}

function getWorkoutStatus(workoutTime: string, now: Date) {
  const [h, m] = workoutTime.split(":").map(Number);
  const target = new Date(now);
  target.setHours(h, m, 0, 0);
  const diffMs = target.getTime() - now.getTime();
  const isPast = diffMs < 0;
  const isTime = isPast && Math.abs(diffMs) < 3 * 60 * 60 * 1000;
  if (isTime) return { isTime: true, countdown: "Now", isPast: true };
  if (isPast) return { isTime: false, countdown: "Missed — do it now!", isPast: true };
  const hrs = Math.floor(diffMs / 3600000);
  const mins = Math.floor((diffMs % 3600000) / 60000);
  return { isTime: false, countdown: hrs === 0 ? `in ${mins}m` : `in ${hrs}h ${mins}m`, isPast: false };
}

function scheduleNotification(workoutTime: string, name: string) {
  if (!("Notification" in window) || Notification.permission !== "granted") return;
  const [h, m] = workoutTime.split(":").map(Number);
  const target = new Date();
  target.setHours(h, m, 0, 0);
  if (target <= new Date()) target.setDate(target.getDate() + 1);
  setTimeout(() => {
    new Notification("Time for your main workout! 🔥", {
      body: `Hey ${name}, your main session is ready. Let's go!`,
      icon: "/favicon.ico",
    });
  }, target.getTime() - Date.now());
}

export default function Dashboard() {
  const navigate = useNavigate();
  const now = useNow();
  const notifScheduled = useRef(false);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [workoutTime, setWorkoutTime] = useState("17:00");
  const [planId, setPlanId] = useState<string | null>(null);
  const [days, setDays] = useState<Day[] | null>(null);
  const [startDate, setStartDate] = useState("");
  const [completed, setCompleted] = useState<Record<string, boolean>>({});
  const [activeSession, setActiveSession] = useState(0);
  const [activeExIdx, setActiveExIdx] = useState(0);
  const [regenerating, setRegenerating] = useState(false);
  const [notifGranted, setNotifGranted] = useState("Notification" in window && Notification.permission === "granted");

  const load = useCallback(async () => {
    const { data: session } = await supabase.auth.getSession();
    if (!session.session) { navigate("/auth"); return; }
    const userId = session.session.user.id;
    const [{ data: prof }, { data: plan }] = await Promise.all([
      supabase.from("profiles").select("name, goal, workout_time").eq("id", userId).single(),
      supabase.from("plans").select("*").eq("user_id", userId).order("created_at", { ascending: false }).limit(1).maybeSingle(),
    ]);
    if (!prof || !prof.goal) { navigate("/onboarding"); return; }
    setName(prof.name);
    setWorkoutTime(prof.workout_time ?? "17:00");
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

  useEffect(() => {
    if (notifGranted && name && !notifScheduled.current) {
      scheduleNotification(workoutTime, name);
      notifScheduled.current = true;
    }
  }, [notifGranted, name, workoutTime]);

  const todayIndex = (() => {
    if (!startDate) return 0;
    const start = new Date(startDate + "T00:00:00");
    const diff = Math.floor((now.getTime() - start.getTime()) / 86400000);
    return Math.max(0, Math.min(13, diff));
  })();

  async function handleRequestNotif() {
    if (!("Notification" in window)) { toast.error("Your browser doesn't support notifications."); return; }
    const result = await Notification.requestPermission();
    if (result === "granted") {
      setNotifGranted(true);
      toast.success("Notifications on! We'll remind you at workout time.");
      scheduleNotification(workoutTime, name);
      notifScheduled.current = true;
    } else {
      toast.error("Notifications blocked. Enable them in browser settings.");
    }
  }

  async function toggle(sessionIdx: number, exIdx: number) {
    if (!planId) return;
    const key = `${todayIndex}-${sessionIdx}-${exIdx}`;
    const next = !completed[key];
    setCompleted(prev => ({ ...prev, [key]: next }));
    const userRes = await supabase.auth.getUser();
    const userId = userRes.data.user?.id;
    if (!userId) return;
    const dbExIdx = sessionIdx * 100 + exIdx;
    await supabase.from("completions").upsert({
      user_id: userId, plan_id: planId, day_index: todayIndex, exercise_index: dbExIdx, completed: next,
    }, { onConflict: "plan_id,day_index,exercise_index" });
  }

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

  async function signOut() {
    await supabase.auth.signOut();
    navigate("/");
  }

  if (loading || !days) {
    return <div className="flex min-h-screen items-center justify-center bg-background"><div className="serif text-3xl">✦ Loading...</div></div>;
  }

  const today = days[todayIndex];
  const sessions: Session[] = today.sessions ?? [
    { kind: "main", title: "Main Workout", suggested_time: "Anytime", exercises: today.exercises ?? [] }
  ];
  const mainSession = sessions.find(s => s.kind === "main") ?? sessions[0];
  const lightSessions = sessions.filter(s => s.kind === "movement");
  const orderedSessions = [mainSession, ...lightSessions];
  const { isTime, countdown, isPast } = getWorkoutStatus(workoutTime, now);
  const currentSession = orderedSessions[activeSession] ?? orderedSessions[0];
  const currentExercises = currentSession?.exercises ?? [];
  const activeEx = currentExercises[activeExIdx];
  const activeImg = activeEx ? pickExerciseImage(activeEx.name) : "";
  const totalAll = orderedSessions.reduce((sum, s) => sum + s.exercises.length, 0);
  const doneAll = orderedSessions.reduce((sum, s, si) =>
    sum + s.exercises.filter((_, ei) => completed[`${todayIndex}-${si}-${ei}`]).length, 0);
  const allDone = doneAll === totalAll && totalAll > 0;
  const workoutTimeLabel = new Date(new Date().setHours(...(workoutTime.split(":").map(Number) as [number, number]))).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });

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
        <div className="mb-8 max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-widest text-primary">
            Day {todayIndex + 1} of 14 · <span className="capitalize">{today.focus}</span>
          </p>
          <h1 className="mt-2 serif text-4xl font-bold leading-[1.05] md:text-6xl">
            Hi {name}, <span className="italic-accent italic">{today.title.toLowerCase()}</span>.
          </h1>
          <p className="mt-3 text-lg text-foreground/65 italic">"{today.motivation}"</p>
        </div>

        {/* Workout time banner */}
        <div className={`mb-8 flex items-center justify-between rounded-2xl border-2 px-6 py-4 transition-all ${isTime ? "border-primary bg-primary/10 shadow-lg shadow-primary/20" : "border-foreground/10 bg-card"}`}>
          <div className="flex items-center gap-3">
            <span className="text-2xl">{isTime ? "🔥" : "⏰"}</span>
            <div>
              <div className="font-semibold">{isTime ? "It's time for your main workout!" : `Main workout at ${workoutTimeLabel}`}</div>
              <div className="text-sm text-foreground/60">{isPast && isTime ? "Window open — do it now" : countdown}</div>
            </div>
          </div>
          {!notifGranted && "Notification" in window && (
            <button onClick={handleRequestNotif}
              className="rounded-full border-2 border-primary/30 px-4 py-2 text-sm font-semibold text-primary hover:bg-primary/10">
              🔔 Remind me
            </button>
          )}
          {notifGranted && <span className="text-sm text-foreground/50 font-semibold">🔔 On</span>}
        </div>

        {/* Session tabs */}
        <div className="mb-6 flex gap-2 overflow-x-auto pb-1">
          {orderedSessions.map((s, si) => {
            const done = s.exercises.filter((_, ei) => completed[`${todayIndex}-${si}-${ei}`]).length;
            const isMain = s.kind === "main";
            return (
              <button key={si} onClick={() => { setActiveSession(si); setActiveExIdx(0); }}
                className={`flex shrink-0 items-center gap-2 rounded-full border-2 px-5 py-2.5 text-sm font-semibold transition ${activeSession === si ? isMain ? "border-primary bg-primary text-primary-foreground" : "border-foreground bg-foreground text-background" : "border-foreground/15 bg-card hover:border-foreground/30"}`}>
                {isMain ? "🔥 Main workout" : si === 1 ? "🌤️ Morning move" : "🌙 Evening move"}
                <span className={`rounded-full px-1.5 py-0.5 text-xs ${activeSession === si ? "bg-white/20" : "bg-foreground/10"}`}>{done}/{s.exercises.length}</span>
              </button>
            );
          })}
        </div>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
          <section className="rounded-3xl border-2 border-foreground/10 bg-card p-6 md:p-8">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="serif text-2xl font-bold">{currentSession.title}</h2>
              <span className="text-sm font-semibold text-foreground/50">
                {currentExercises.filter((_, i) => completed[`${todayIndex}-${activeSession}-${i}`]).length}/{currentExercises.length}
              </span>
            </div>
            <div className="mb-2 text-xs font-semibold uppercase tracking-widest text-foreground/40">
              {currentSession.kind === "main" ? "🎯 Goal-focused session" : `🕐 ${currentSession.suggested_time}`}
            </div>
            <div className="mb-6 h-2 overflow-hidden rounded-full bg-foreground/10">
              <div className="h-full rounded-full bg-primary transition-all duration-500"
                style={{ width: `${currentExercises.length ? (currentExercises.filter((_, i) => completed[`${todayIndex}-${activeSession}-${i}`]).length / currentExercises.length) * 100 : 0}%` }} />
            </div>
            <ul className="space-y-2">
              {currentExercises.map((ex, i) => {
                const done = completed[`${todayIndex}-${activeSession}-${i}`];
                const active = i === activeExIdx;
                return (
                  <li key={i}>
                    <div className={`flex items-start gap-3 rounded-2xl border-2 p-4 transition ${active ? "border-primary bg-primary/5" : done ? "border-foreground/5 bg-transparent" : "border-foreground/10 bg-background/50 hover:border-foreground/25"}`}>
                      <button onClick={(e) => { e.stopPropagation(); toggle(activeSession, i); }}
                        className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 transition ${done ? "border-primary bg-primary text-primary-foreground" : "border-foreground/30 hover:border-primary"}`}>
                        {done && <span className="text-sm">✓</span>}
                      </button>
                      <button onClick={() => setActiveExIdx(i)} className="flex-1 text-left">
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
            {currentExercises.length > 0 && currentExercises.every((_, i) => completed[`${todayIndex}-${activeSession}-${i}`]) && (
              <div className="mt-6 rounded-2xl bg-primary/10 p-5 text-center">
                <p className="serif text-xl font-bold">{currentSession.kind === "main" ? "Main workout done. ✦" : "Movement break done! 🌿"}</p>
              </div>
            )}
          </section>

          <section className="relative overflow-hidden rounded-3xl border-2 border-foreground/10 bg-gradient-to-br from-blush/40 via-card to-accent/30 p-6 md:p-10">
            <div className="absolute inset-0 paper opacity-40" />
            {activeEx ? (
              <div className="relative z-10 flex h-full flex-col">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-widest text-foreground/50">Exercise {activeExIdx + 1} of {currentExercises.length}</span>
                  <span className="rounded-full bg-foreground px-3 py-1 text-xs font-bold uppercase tracking-wider text-background">{activeEx.sets > 1 ? `${activeEx.sets} × ` : ""}{activeEx.reps}</span>
                </div>
                <div className="my-4 flex flex-1 items-center justify-center">
                  <img key={activeEx.name + activeExIdx} src={activeImg} alt={activeEx.name}
                    className="floaty max-h-[400px] w-auto object-contain" width={768} height={768} loading="lazy" />
                </div>
                <div>
                  <h3 className="serif text-3xl font-bold leading-tight md:text-4xl">{activeEx.name}</h3>
                  <p className="mt-2 text-base text-foreground/70">{activeEx.cue}</p>
                  <div className="mt-5 flex flex-wrap gap-3">
                    <button onClick={() => toggle(activeSession, activeExIdx)}
                      className={`rounded-full px-6 py-3 text-sm font-semibold transition ${completed[`${todayIndex}-${activeSession}-${activeExIdx}`] ? "border-2 border-foreground/20 bg-transparent hover:bg-foreground/5" : "bg-primary text-primary-foreground hover:scale-[1.02]"}`}>
                      {completed[`${todayIndex}-${activeSession}-${activeExIdx}`] ? "↺ Mark undone" : "✓ Mark done"}
                    </button>
                    {activeExIdx < currentExercises.length - 1 && (
                      <button onClick={() => setActiveExIdx(activeExIdx + 1)}
                        className="rounded-full border-2 border-foreground/20 px-6 py-3 text-sm font-semibold hover:bg-foreground/5">
                        Next →
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="relative z-10 flex h-full items-center justify-center">
                <p className="serif text-2xl text-foreground/40">Select an exercise</p>
              </div>
            )}
          </section>
        </div>

        <div className="mt-6 rounded-2xl border-2 border-foreground/10 bg-card px-6 py-4">
          <div className="flex items-center justify-between text-sm font-semibold">
            <span className="text-foreground/60">Today's overall progress</span>
            <span className="text-primary">{doneAll}/{totalAll} exercises</span>
          </div>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-foreground/10">
            <div className="h-full rounded-full bg-primary transition-all duration-700" style={{ width: `${totalAll ? (doneAll / totalAll) * 100 : 0}%` }} />
          </div>
        </div>

        {allDone && (
          <div className="mt-6 rounded-2xl bg-primary/10 p-5 text-center">
            <p className="serif text-xl font-bold">All sessions complete. ✦</p>
            <p className="mt-1 text-sm text-foreground/60">Amazing work — see you tomorrow.</p>
          </div>
        )}

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
