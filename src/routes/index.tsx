import { Link } from "react-router-dom";
import { SiteHeader } from "@/components/site-header";
import { Marquee } from "@/components/marquee";

export default function Landing() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-background paper">
      <div className="blob top-[-120px] left-[-80px] h-[400px] w-[400px] bg-primary/40" />
      <div className="blob top-[300px] right-[-120px] h-[500px] w-[500px] bg-accent/50" />
      <div className="blob bottom-[200px] left-[20%] h-[350px] w-[350px] bg-blush/60" />

      <SiteHeader />

      {/* Hero */}
      <section className="relative z-10 mx-auto grid max-w-6xl gap-12 px-6 py-16 md:grid-cols-2 md:py-24">
        <div className="rise flex flex-col justify-center">
          <p className="mb-4 text-sm font-semibold uppercase tracking-widest text-primary">
            Chapter One — Begin
          </p>
          <h1 className="serif text-5xl font-bold leading-[0.95] text-foreground md:text-7xl">
            Two weeks.
            <br />
            <span className="italic-accent italic">Your</span> body.
            <br />
            One free plan.
          </h1>
          <p className="mt-6 max-w-md text-lg text-foreground/70">
            Tell us your story. We'll write you a 14-day workout plan that
            actually fits your life — built by AI, free forever, no strings.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              to="/auth"
              className="rounded-full bg-primary px-7 py-4 text-base font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition hover:scale-[1.02]"
            >
              Get my plan →
            </Link>
            <a
              href="#how"
              className="rounded-full border-2 border-foreground px-7 py-4 text-base font-semibold text-foreground transition hover:bg-foreground hover:text-background"
            >
              How it works
            </a>
          </div>
          <p className="mt-6 text-sm text-foreground/50">✦ No credit card. No ads. Ever.</p>
        </div>

        <div className="relative flex items-center justify-center">
          <div className="floaty">
            <img
              src="/hero.png"
              alt="Storybook illustration of a person stretching"
              className="w-full max-w-md"
            />
          </div>
        </div>
      </section>

      <Marquee />

      {/* How it works */}
      <section id="how" className="relative z-10 mx-auto max-w-6xl px-6 py-24">
        <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-primary">
          Chapter Two — How
        </p>
        <h2 className="serif text-4xl font-bold md:text-6xl">
          Three steps. <span className="italic-accent italic">Then go.</span>
        </h2>
        <div className="mt-14 grid gap-8 md:grid-cols-3">
          {[
            { n: "01", t: "Tell your story", d: "Name, body, fitness level, equipment, and the goal you're chasing." },
            { n: "02", t: "AI writes your plan", d: "A 14-day plan made for you. Strength, cardio, mobility — balanced." },
            { n: "03", t: "Show up daily", d: "Open the app each morning. Tick exercises off. Repeat for two weeks." },
          ].map((s) => (
            <div key={s.n} className="rounded-3xl border-2 border-foreground/10 bg-card p-8 shadow-sm">
              <div className="serif text-6xl font-black italic text-primary">{s.n}</div>
              <h3 className="mt-4 serif text-2xl font-bold">{s.t}</h3>
              <p className="mt-3 text-foreground/70">{s.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Goals */}
      <section className="relative z-10 mx-auto max-w-6xl px-6 py-24">
        <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-primary">
          Chapter Three — Pick a path
        </p>
        <h2 className="serif text-4xl font-bold md:text-6xl">
          Four goals. <span className="italic-accent italic">One you.</span>
        </h2>
        <div className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[
            { e: "🔥", t: "Lose weight", d: "Fat-burning circuits" },
            { e: "💪", t: "Build muscle", d: "Progressive strength" },
            { e: "🏃", t: "Endurance", d: "Cardio & conditioning" },
            { e: "🧘", t: "Flexibility", d: "Mobility & stretching" },
          ].map((g) => (
            <div key={g.t} className="group rounded-3xl bg-foreground p-8 text-background transition hover:bg-primary">
              <div className="text-5xl">{g.e}</div>
              <h3 className="mt-6 serif text-2xl font-bold">{g.t}</h3>
              <p className="mt-2 text-background/70">{g.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="relative z-10 mx-auto max-w-4xl px-6 py-32 text-center">
        <h2 className="serif text-5xl font-bold leading-tight md:text-7xl">
          Your <span className="italic-accent italic">first day</span>
          <br /> starts in 60 seconds.
        </h2>
        <Link
          to="/auth"
          className="mt-10 inline-block rounded-full bg-primary px-10 py-5 text-lg font-semibold text-primary-foreground shadow-xl shadow-primary/30 transition hover:scale-[1.03]"
        >
          Begin free →
        </Link>
      </section>

      <footer className="relative z-10 border-t border-foreground/10 py-8 text-center text-sm text-foreground/50">
        <p>Made with ✦ — No payments. No ads. Ever.</p>
      </footer>
    </div>
  );
}
