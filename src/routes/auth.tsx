import { Link, useNavigate } from "react-router-dom";
import { clearLocalAppData } from "@/lib/plan-generator";

export default function AuthPage() {
  const navigate = useNavigate();

  function reset() {
    clearLocalAppData();
    navigate("/onboarding");
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-background paper">
      <div className="blob top-[-100px] right-[-100px] h-[400px] w-[400px] bg-primary/35" />
      <div className="blob bottom-[-100px] left-[-100px] h-[400px] w-[400px] bg-accent/45" />

      <header className="relative z-10 mx-auto max-w-6xl px-6 py-6">
        <Link to="/" className="serif text-2xl font-bold">
          Guli<span className="italic-accent">workout</span>
        </Link>
      </header>

      <main className="relative z-10 mx-auto max-w-md px-6 py-16 text-center">
        <p className="text-sm font-semibold uppercase tracking-widest text-primary">No login needed</p>
        <h1 className="mt-3 serif text-5xl font-bold leading-tight">
          Your plan saves on this device.
        </h1>
        <p className="mt-4 text-foreground/65">
          Guliworkout now works without accounts, passwords, Supabase, or a backend. Your plan is stored in your browser.
        </p>

        <div className="mt-8 grid gap-3">
          <Link to="/onboarding" className="rounded-full bg-primary px-6 py-4 font-semibold text-primary-foreground transition hover:scale-[1.01]">
            Create a plan
          </Link>
          <Link to="/dashboard" className="rounded-full border-2 border-foreground/15 px-6 py-4 font-semibold hover:bg-foreground/5">
            Continue current plan
          </Link>
          <button onClick={reset} className="rounded-full px-6 py-3 text-sm font-semibold text-foreground/55 hover:text-foreground">
            Reset and start over
          </button>
        </div>
      </main>
    </div>
  );
}
