import { useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { loadProfile, loadPlan, clearAll } from "@/lib/plan-generator";
import { toast } from "sonner";

export default function AuthPage() {
  const navigate = useNavigate();

  useEffect(() => {
    const profile = loadProfile();
    const plan = loadPlan();
    if (profile && plan) {
      navigate("/dashboard");
    } else if (profile) {
      navigate("/onboarding");
    }
  }, [navigate]);

  function handleStart() {
    navigate("/onboarding");
  }

  function handleReset() {
    clearAll();
    toast.success("Data cleared. Starting fresh!");
    navigate("/onboarding");
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-background paper">
      <div className="blob top-[-100px] right-[-100px] h-[400px] w-[400px] bg-primary/40" />
      <div className="blob bottom-[-100px] left-[-100px] h-[400px] w-[400px] bg-accent/50" />

      <header className="relative z-10 mx-auto max-w-6xl px-6 py-6">
        <Link to="/" className="serif text-2xl font-bold">Two<span className="italic-accent">week</span></Link>
      </header>

      <main className="relative z-10 mx-auto flex max-w-md flex-col px-6 py-12">
        <h1 className="serif text-5xl font-bold leading-tight">
          Begin your <span className="italic-accent italic">two weeks</span>.
        </h1>
        <p className="mt-3 text-foreground/60">
          No account needed. Your plan lives on this device.
        </p>

        <button onClick={handleStart}
          className="mt-8 w-full rounded-full bg-primary px-6 py-4 text-base font-semibold text-primary-foreground transition hover:scale-[1.01]">
          Create my plan →
        </button>

        <button onClick={handleReset}
          className="mt-4 text-center text-sm text-foreground/50 hover:text-foreground/70">
          Start over / reset my data
        </button>
      </main>
    </div>
  );
}
