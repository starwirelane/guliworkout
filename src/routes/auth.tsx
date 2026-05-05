import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/auth")({
  head: () => ({ meta: [{ title: "Sign in — Twoweek" }] }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signup");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/dashboard" });
    });
  }, [navigate]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email, password,
          options: { emailRedirectTo: `${window.location.origin}/onboarding`, data: { name: email.split("@")[0] } },
        });
        if (error) throw error;
        if (data.session) navigate({ to: "/onboarding" });
        else toast.success("Check your email to confirm your account.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        navigate({ to: "/dashboard" });
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-background paper">
      <div className="blob top-[-100px] right-[-100px] h-[400px] w-[400px] bg-primary/40" />
      <div className="blob bottom-[-100px] left-[-100px] h-[400px] w-[400px] bg-accent/50" />

      <header className="relative z-10 mx-auto max-w-6xl px-6 py-6">
        <Link to="/" className="serif text-2xl font-bold">Two<span className="italic-accent">week</span></Link>
      </header>

      <main className="relative z-10 mx-auto flex max-w-md flex-col px-6 py-16">
        <h1 className="serif text-5xl font-bold leading-tight">
          {mode === "signup" ? <>Begin your <span className="italic-accent italic">two weeks</span>.</> : <>Welcome <span className="italic-accent italic">back</span>.</>}
        </h1>
        <p className="mt-3 text-foreground/60">{mode === "signup" ? "It's free. Always." : "Pick up where you left off."}</p>

        <form onSubmit={submit} className="mt-8 space-y-4">
          <div>
            <label className="text-sm font-semibold text-foreground/70">Email</label>
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded-2xl border-2 border-foreground/15 bg-card px-5 py-4 text-base outline-none transition focus:border-primary" />
          </div>
          <div>
            <label className="text-sm font-semibold text-foreground/70">Password</label>
            <input type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full rounded-2xl border-2 border-foreground/15 bg-card px-5 py-4 text-base outline-none transition focus:border-primary" />
          </div>
          <button disabled={loading} type="submit"
            className="w-full rounded-full bg-primary px-6 py-4 text-base font-semibold text-primary-foreground transition hover:scale-[1.01] disabled:opacity-60">
            {loading ? "..." : mode === "signup" ? "Create account →" : "Sign in →"}
          </button>
        </form>

        <button onClick={() => setMode(mode === "signup" ? "signin" : "signup")}
          className="mt-6 text-center text-sm text-foreground/60 hover:text-primary">
          {mode === "signup" ? "Already have an account? Sign in" : "New here? Create an account"}
        </button>
      </main>
    </div>
  );
}
