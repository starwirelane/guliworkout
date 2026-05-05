import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const GOALS = [
  { id: "lose_weight", emoji: "🔥", title: "Lose weight" },
  { id: "build_muscle", emoji: "💪", title: "Build muscle" },
  { id: "endurance", emoji: "🏃", title: "Endurance" },
  { id: "flexibility", emoji: "🧘", title: "Flexibility" },
];

export default function Onboarding() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [userId, setUserId] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "", age: "", weight_kg: "", height_cm: "",
    fitness_level: "beginner", equipment: "bodyweight only", goal: "lose_weight",
  });
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) { navigate("/auth"); return; }
      setUserId(data.session.user.id);
      supabase.from("profiles").select("name").eq("id", data.session.user.id).single()
        .then(({ data: p }) => { if (p?.name) setForm((f) => ({ ...f, name: p.name })); });
    });
  }, [navigate]);

  async function finish() {
    if (!userId) return;
    setGenerating(true);
    try {
      const { error: upErr } = await supabase.from("profiles").update({
        name: form.name || "Friend",
        age: form.age ? Number(form.age) : null,
        weight_kg: form.weight_kg ? Number(form.weight_kg) : null,
        height_cm: form.height_cm ? Number(form.height_cm) : null,
        fitness_level: form.fitness_level, equipment: form.equipment, goal: form.goal,
      }).eq("id", userId);
      if (upErr) throw upErr;
      const { data, error } = await supabase.functions.invoke("generate-plan");
      if (error) throw error;
      if ((data as any)?.error) throw new Error((data as any).error);
      toast.success("Your plan is ready!");
      navigate("/dashboard");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not create plan");
      setGenerating(false);
    }
  }

  const steps = [
    { title: "What should we call you?", body: (
      <input autoFocus value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
        placeholder="Your name" className="w-full rounded-2xl border-2 border-foreground/15 bg-card px-5 py-4 text-xl outline-none focus:border-primary" />
    )},
    { title: "Tell us about your body.", body: (
      <div className="grid grid-cols-3 gap-3">
        {[
          { k: "age", l: "Age", p: "28" },
          { k: "weight_kg", l: "Weight (kg)", p: "70" },
          { k: "height_cm", l: "Height (cm)", p: "175" },
        ].map((f) => (
          <div key={f.k}>
            <label className="text-xs font-semibold uppercase tracking-wider text-foreground/60">{f.l}</label>
            <input type="number" value={(form as any)[f.k]} onChange={(e) => setForm({ ...form, [f.k]: e.target.value })}
              placeholder={f.p} className="mt-1 w-full rounded-2xl border-2 border-foreground/15 bg-card px-4 py-4 text-lg outline-none focus:border-primary" />
          </div>
        ))}
      </div>
    )},
    { title: "Your fitness level?", body: (
      <div className="grid gap-3">
        {["beginner", "intermediate", "advanced"].map((lvl) => (
          <button key={lvl} onClick={() => setForm({ ...form, fitness_level: lvl })}
            className={`rounded-2xl border-2 px-6 py-5 text-left text-lg font-semibold capitalize transition ${form.fitness_level === lvl ? "border-primary bg-primary/10" : "border-foreground/15 bg-card hover:border-foreground/40"}`}>
            {lvl}
          </button>
        ))}
      </div>
    )},
    { title: "What equipment do you have?", body: (
      <div className="grid gap-3">
        {["bodyweight only", "dumbbells at home", "full gym access"].map((eq) => (
          <button key={eq} onClick={() => setForm({ ...form, equipment: eq })}
            className={`rounded-2xl border-2 px-6 py-5 text-left text-lg font-semibold capitalize transition ${form.equipment === eq ? "border-primary bg-primary/10" : "border-foreground/15 bg-card hover:border-foreground/40"}`}>
            {eq}
          </button>
        ))}
      </div>
    )},
    { title: "Pick your goal.", body: (
      <div className="grid grid-cols-2 gap-3">
        {GOALS.map((g) => (
          <button key={g.id} onClick={() => setForm({ ...form, goal: g.id })}
            className={`rounded-2xl border-2 p-6 text-left transition ${form.goal === g.id ? "border-primary bg-primary/10" : "border-foreground/15 bg-card hover:border-foreground/40"}`}>
            <div className="text-4xl">{g.emoji}</div>
            <div className="mt-3 serif text-xl font-bold">{g.title}</div>
          </button>
        ))}
      </div>
    )},
  ];

  const current = steps[step];
  const last = step === steps.length - 1;

  if (generating) {
    return (
      <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background paper">
        <div className="blob top-[20%] left-[10%] h-[400px] w-[400px] bg-primary/40 floaty" />
        <div className="blob bottom-[10%] right-[10%] h-[400px] w-[400px] bg-accent/50 floaty-slow" />
        <div className="relative z-10 text-center">
          <div className="serif text-6xl">✦</div>
          <h2 className="mt-6 serif text-4xl font-bold">Writing your plan...</h2>
          <p className="mt-3 text-foreground/60">Personalizing 14 days just for {form.name || "you"}.</p>
        </div>
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

      <main className="relative z-10 mx-auto max-w-xl px-6 py-12">
        <div className="mb-8 flex gap-2">
          {steps.map((_, i) => (
            <div key={i} className={`h-1.5 flex-1 rounded-full transition ${i <= step ? "bg-primary" : "bg-foreground/15"}`} />
          ))}
        </div>
        <p className="text-sm font-semibold uppercase tracking-widest text-primary">Step {step + 1} of {steps.length}</p>
        <h1 className="mt-3 serif text-4xl font-bold leading-tight md:text-5xl">{current.title}</h1>
        <div className="mt-8">{current.body}</div>

        <div className="mt-10 flex gap-3">
          {step > 0 && (
            <button onClick={() => setStep(step - 1)} className="rounded-full border-2 border-foreground/20 px-6 py-3 font-semibold hover:bg-foreground/5">Back</button>
          )}
          <button onClick={() => last ? finish() : setStep(step + 1)}
            disabled={step === 0 && !form.name.trim()}
            className="ml-auto rounded-full bg-primary px-8 py-3 font-semibold text-primary-foreground transition hover:scale-[1.02] disabled:opacity-50">
            {last ? "Generate my plan ✦" : "Next →"}
          </button>
        </div>
      </main>
    </div>
  );
}
