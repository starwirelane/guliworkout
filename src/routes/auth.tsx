import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/auth")({
  head: () => ({ meta: [{ title: "Begin — Twoweek" }] }),
  component: AuthPage,
});

const DOMAIN = "twoweek.app";

function slugify(name: string) {
  return name.toLowerCase().trim().replace(/[^a-z0-9]+/g, "").slice(0, 16) || "friend";
}
function randomCode(len = 4) {
  const a = "abcdefghjkmnpqrstuvwxyz23456789";
  let s = "";
  for (let i = 0; i < len; i++) s += a[Math.floor(Math.random() * a.length)];
  return s;
}
function codeToCreds(code: string) {
  return { email: `${code}@${DOMAIN}`, password: `tw_${code}_${code.length}` };
}

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"create" | "return">("create");
  const [name, setName] = useState("");
  const [returnCode, setReturnCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [createdCode, setCreatedCode] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/dashboard" });
    });
  }, [navigate]);

  async function createAccount(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);
    try {
      // Try a few times in the rare event of a collision
      for (let attempt = 0; attempt < 5; attempt++) {
        const code = `${slugify(name)}-${randomCode(4)}`;
        const { email, password } = codeToCreds(code);
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { name: name.trim() } },
        });
        if (error) {
          if (error.message?.toLowerCase().includes("registered")) continue;
          throw error;
        }
        if (data.session || data.user) {
          try { localStorage.setItem("twoweek_code", code); } catch {}
          setCreatedCode(code);
          return;
        }
      }
      throw new Error("Could not create your account, please try again.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  async function returnIn(e: React.FormEvent) {
    e.preventDefault();
    const code = returnCode.trim().toLowerCase();
    if (!code) return;
    setLoading(true);
    try {
      const { email, password } = codeToCreds(code);
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw new Error("That code didn't match. Double-check and try again.");
      try { localStorage.setItem("twoweek_code", code); } catch {}
      navigate({ to: "/dashboard" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not sign in");
    } finally {
      setLoading(false);
    }
  }

  // After account creation, show their code then move on.
  if (createdCode) {
    return (
      <div className="relative min-h-screen overflow-hidden bg-background paper">
        <div className="blob top-[-100px] right-[-100px] h-[400px] w-[400px] bg-primary/40" />
        <div className="blob bottom-[-100px] left-[-100px] h-[400px] w-[400px] bg-accent/50" />
        <header className="relative z-10 mx-auto max-w-6xl px-6 py-6">
          <Link to="/" className="serif text-2xl font-bold">Two<span className="italic-accent">week</span></Link>
        </header>
        <main className="relative z-10 mx-auto max-w-md px-6 py-12 text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-primary">Welcome, {name}</p>
          <h1 className="mt-3 serif text-4xl font-bold leading-tight">
            Save your <span className="italic-accent italic">return code</span>.
          </h1>
          <p className="mt-3 text-foreground/65">
            You're already signed in on this device. Use this code to come back from any other device.
          </p>
          <div className="mt-8 rounded-3xl border-2 border-dashed border-primary bg-card p-8">
            <div className="text-xs font-semibold uppercase tracking-widest text-foreground/50">Your code</div>
            <div className="mt-3 serif text-4xl font-bold tracking-wider md:text-5xl">{createdCode}</div>
            <button
              onClick={() => {
                navigator.clipboard.writeText(createdCode);
                toast.success("Copied!");
              }}
              className="mt-5 rounded-full border-2 border-foreground/20 px-5 py-2 text-sm font-semibold hover:bg-foreground/5"
            >
              Copy code
            </button>
          </div>
          <button
            onClick={() => navigate({ to: "/onboarding" })}
            className="mt-8 w-full rounded-full bg-primary px-6 py-4 font-semibold text-primary-foreground hover:scale-[1.01]"
          >
            I've saved it — let's begin →
          </button>
        </main>
      </div>
    );
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
          {mode === "create"
            ? <>Begin your <span className="italic-accent italic">two weeks</span>.</>
            : <>Welcome <span className="italic-accent italic">back</span>.</>}
        </h1>
        <p className="mt-3 text-foreground/60">
          {mode === "create" ? "Just your name. No email. No password." : "Enter the code we gave you last time."}
        </p>

        {mode === "create" ? (
          <form onSubmit={createAccount} className="mt-8 space-y-4">
            <div>
              <label className="text-sm font-semibold text-foreground/70">Your name</label>
              <input
                autoFocus
                required
                maxLength={40}
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Alex"
                className="mt-1 w-full rounded-2xl border-2 border-foreground/15 bg-card px-5 py-4 text-xl outline-none transition focus:border-primary"
              />
            </div>
            <button disabled={loading || !name.trim()} type="submit"
              className="w-full rounded-full bg-primary px-6 py-4 text-base font-semibold text-primary-foreground transition hover:scale-[1.01] disabled:opacity-60">
              {loading ? "Creating..." : "Create my account →"}
            </button>
          </form>
        ) : (
          <form onSubmit={returnIn} className="mt-8 space-y-4">
            <div>
              <label className="text-sm font-semibold text-foreground/70">Your return code</label>
              <input
                autoFocus
                required
                value={returnCode}
                onChange={(e) => setReturnCode(e.target.value)}
                placeholder="alex-7k2p"
                className="mt-1 w-full rounded-2xl border-2 border-foreground/15 bg-card px-5 py-4 text-xl tracking-wider outline-none transition focus:border-primary"
              />
            </div>
            <button disabled={loading || !returnCode.trim()} type="submit"
              className="w-full rounded-full bg-primary px-6 py-4 text-base font-semibold text-primary-foreground transition hover:scale-[1.01] disabled:opacity-60">
              {loading ? "..." : "Sign me in →"}
            </button>
          </form>
        )}

        <button onClick={() => setMode(mode === "create" ? "return" : "create")}
          className="mt-6 text-center text-sm text-foreground/60 hover:text-primary">
          {mode === "create" ? "Have a return code? Sign in" : "New here? Create an account"}
        </button>
      </main>
    </div>
  );
}
