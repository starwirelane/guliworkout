import { Link } from "react-router-dom";

export default function Landing() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-background paper">
      <div className="blob top-[-120px] right-[-120px] h-[420px] w-[420px] bg-primary/35" />
      <div className="blob bottom-[-140px] left-[-120px] h-[420px] w-[420px] bg-accent/40" />

      <header className="relative z-10 mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <div className="serif text-2xl font-bold">
          Guli<span className="italic-accent">workout</span>
        </div>
        <Link to="/onboarding" className="rounded-full bg-foreground px-5 py-2 text-sm font-semibold text-background">
          Start
        </Link>
      </header>

      <main className="relative z-10 mx-auto flex max-w-6xl flex-col px-6 py-16 md:py-24">
        <p className="text-sm font-semibold uppercase tracking-widest text-primary">14-day fitness plan</p>
        <h1 className="mt-4 max-w-4xl serif text-6xl font-bold leading-[0.95] md:text-8xl">
          Build a plan you can actually follow.
        </h1>
        <p className="mt-6 max-w-2xl text-lg text-foreground/65 md:text-xl">
          Pick your goal, level, equipment, and workout time. Guliworkout creates a simple 14-day plan right on your device.
        </p>
        <div className="mt-9 flex flex-wrap gap-3">
          <Link to="/onboarding" className="rounded-full bg-primary px-7 py-4 font-semibold text-primary-foreground transition hover:scale-[1.02]">
            Generate my plan →
          </Link>
          <Link to="/dashboard" className="rounded-full border-2 border-foreground/15 px-7 py-4 font-semibold hover:bg-foreground/5">
            Open dashboard
          </Link>
        </div>
      </main>
    </div>
  );
}
