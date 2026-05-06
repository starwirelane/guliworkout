import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { loadPlan, loadCompletions, type Day } from "@/lib/plan-generator";

export default function PlanPage() {
  const navigate = useNavigate();
  const [openDay, setOpenDay] = useState(0);

  const plan = loadPlan();
  const completed = loadCompletions();

  useEffect(() => {
    if (!plan) navigate("/onboarding");
  }, [plan, navigate]);

  if (!plan) return null;

  const days: Day[] = plan.days;

  return (
    <div className="relative min-h-screen overflow-hidden bg-background paper">
      <div className="blob top-[-100px] left-[-100px] h-[400px] w-[400px] bg-accent/40" />
      <header className="relative z-10 mx-auto flex max-w-4xl items-center justify-between px-6 py-6">
        <Link to="/" className="serif text-2xl font-bold">Two<span className="italic-accent">week</span></Link>
        <Link to="/dashboard" className="rounded-full bg-foreground px-5 py-2 text-sm font-semibold text-background">Today →</Link>
      </header>

      <main className="relative z-10 mx-auto max-w-3xl px-6 py-8">
        <p className="text-sm font-semibold uppercase tracking-widest text-primary">Your story</p>
        <h1 className="mt-2 serif text-5xl font-bold md:text-6xl">14 days, <span className="italic-accent italic">all yours</span>.</h1>

        <div className="mt-10 space-y-3">
          {days.map((d, i) => {
            const allExercises = d.sessions?.flatMap(s => s.exercises) ?? d.exercises ?? [];
            const total = allExercises.length;
            const done = d.sessions
              ? d.sessions.reduce((sum, s, si) =>
                  sum + s.exercises.filter((_, ei) => completed[`${i}-${si}-${ei}`]).length, 0)
              : allExercises.filter((_, j) => completed[`${i}-0-${j}`]).length;
            const isDone = done === total && total > 0;
            const open = openDay === i;

            return (
              <div key={i} className={`rounded-2xl border-2 ${isDone ? "border-primary/40 bg-primary/5" : "border-foreground/10 bg-card"}`}>
                <button onClick={() => setOpenDay(open ? -1 : i)} className="flex w-full items-center gap-4 px-5 py-4 text-left">
                  <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full font-bold ${isDone ? "bg-primary text-primary-foreground" : "bg-foreground/10"}`}>
                    {isDone ? "✓" : i + 1}
                  </div>
                  <div className="flex-1">
                    <div className="serif text-xl font-bold">{d.title}</div>
                    <div className="text-sm text-foreground/60 capitalize">{d.focus} · {done}/{total} done</div>
                  </div>
                  <div className="text-foreground/40">{open ? "−" : "+"}</div>
                </button>

                {open && d.sessions && (
                  <div className="border-t border-foreground/10 px-5 py-4 space-y-4">
                    <p className="italic text-foreground/70">{d.motivation}</p>
                    {d.sessions.map((s, si) => (
                      <div key={si}>
                        <div className="mb-2 flex items-center gap-2">
                          <span className="text-sm font-bold text-foreground/80">{s.kind === "main" ? "🔥" : "🌿"} {s.title}</span>
                          <span className="text-xs text-foreground/50">· {s.suggested_time}</span>
                        </div>
                        <ul className="space-y-2">
                          {s.exercises.map((ex, j) => (
                            <li key={j} className="flex justify-between gap-4 rounded-xl bg-background px-4 py-3">
                              <div>
                                <div className="font-semibold">{ex.name}</div>
                                <div className="text-sm text-foreground/60">{ex.cue}</div>
                              </div>
                              <div className="shrink-0 text-sm font-semibold text-primary">
                                {ex.sets > 1 ? `${ex.sets}×` : ""} {ex.reps}
                              </div>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}
