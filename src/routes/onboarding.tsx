import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "sonner";
import {
  generateLocalPlan,
  savePlan,
  saveProfile,
  type Equipment,
  type FitnessLevel,
  type Goal,
  type Profile,
} from "@/lib/plan-generator";

const GOALS: { id: Goal; emoji: string; title: string }[] = [
  { id: "lose_weight", emoji: "🔥", title: "Lose weight" },
  { id: "build_muscle", emoji: "💪", title: "Build muscle" },
  { id: "endurance", emoji: "🏃", title: "Endurance" },
  { id: "flexibility", emoji: "🧘", title: "Flexibility" },
];

const TIME_SLOTS = [
  { id: "06:00", label: "Early bird", sub: "6:00 AM", emoji: "🌅" },
  { id: "08:00", label: "Morning", sub: "8:00 AM", emoji: "☀️" },
  { id: "12:00", label: "Midday", sub: "12:00 PM", emoji: "🌤️" },
  { id: "17:00", label: "After work", sub: "5:00 PM", emoji: "🌇" },
  { id: "19:00", label: "Evening", sub: "7:00 PM", emoji: "🌙" },
];

const LEVELS: FitnessLevel[] = ["beginner", "intermediate", "advanced"];

const EQUIPMENT: Equipment[] = [
  "bodyweight only",
  "dumbbells at home",
  "full gym access",
];

export default function Onboarding() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [generating, setGenerating] = useState(false);

  const [form, setForm] = useState({
    name: "",
    age: "",
    weight_kg: "",
    height_cm: "",
    fitness_level: "beginner" as FitnessLevel,
    equipment: "bodyweight only" as Equipment,
    goal: "lose_weight" as Goal,
    workout_time: "17:00",
  });

  function finish() {
    if (!form.name.trim()) {
      toast.error("Add your name first.");
      return;
    }

    setGenerating(true);

    const profile: Profile = {
      name: form.name.trim(),
      age: form.age ? Number(form.age) : null,
      weight_kg: form.weight_kg ? Number(form.weight_kg) : null,
      height_cm: form.height_cm ? Number(form.height_cm) : null,
      fitness_level: form.fitness_level,
      equipment: form.equipment,
      goal: form.goal,
      workout_time: form.workout_time,
    };

    const plan = generateLocalPlan(profile);

    saveProfile(profile);
    savePlan(plan);

    window.setTimeout(() => {
      toast.success("Your plan is ready!");
      navigate("/dashboard");
    }, 500);
  }

  const steps = [
    {
      title: "What should we call you?",
      body: (
        <input
          autoFocus
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          placeholder="Your name"
          className="w-full rounded-2xl border-2 border-foreground/15 bg-card px-5 py-4 text-xl outline-none focus:border-primary"
        />
      ),
    },
    {
      title: "Tell us about your body.",
      body: (
        <div className="grid grid-cols-3 gap-3">
          {[
            { key: "age", label: "Age", placeholder: "28" },
            { key: "weight_kg", label: "Weight", placeholder: "70" },
            { key: "height_cm", label: "Height", placeholder: "175" },
          ].map((field) => (
            <div key={field.key}>
              <label className="text-xs font-semibold uppercase tracking-wider text-foreground/60">
                {field.label}
              </label>
              <input
                type="number"
                value={form[field.key as "age" | "weight_kg" | "height_cm"]}
                onChange={(e) =>
                  setForm({ ...form, [field.key]: e.target.value })
                }
                placeholder={field.placeholder}
                className="mt-1 w-full rounded-2xl border-2 border-foreground/15 bg-card px-4 py-4 text-lg outline-none focus:border-primary"
              />
            </div>
          ))}
        </div>
      ),
    },
    {
      title: "Your fitness level?",
      body: (
        <div className="grid gap-3">
          {LEVELS.map((level) => (
            <button
              key={level}
              type="button"
              onClick={() => setForm({ ...form, fitness_level: level })}
              className={`rounded-2xl border-2 px-6 py-5 text-left text-lg font-semibold capitalize transition ${
                form.fitness_level === level
                  ? "border-primary bg-primary/10"
                  : "border-foreground/15 bg-card hover:border-foreground/40"
              }`}
            >
              {level}
            </button>
          ))}
        </div>
      ),
    },
    {
      title: "What equipment do you have?",
      body: (
        <div className="grid gap-3">
          {EQUIPMENT.map((equipment) => (
            <button
              key={equipment}
              type="button"
              onClick={() => setForm({ ...form, equipment })}
              className={`rounded-2xl border-2 px-6 py-5 text-left text-lg font-semibold capitalize transition ${
                form.equipment === equipment
                  ? "border-primary bg-primary/10"
                  : "border-foreground/15 bg-card hover:border-foreground/40"
              }`}
            >
              {equipment}
            </button>
          ))}
        </div>
      ),
    },
    {
      title: "Pick your goal.",
      body: (
        <div className="grid grid-cols-2 gap-3">
          {GOALS.map((goal) => (
            <button
              key={goal.id}
              type="button"
              onClick={() => setForm({ ...form, goal: goal.id })}
              className={`rounded-2xl border-2 p-6 text-left transition ${
                form.goal === goal.id
                  ? "border-primary bg-primary/10"
                  : "border-foreground/15 bg-card hover:border-foreground/40"
              }`}
            >
              <div className="text-4xl">{goal.emoji}</div>
              <div className="mt-3 serif text-xl font-bold">{goal.title}</div>
            </button>
          ))}
        </div>
      ),
    },
    {
      title: "When is your main workout?",
      body: (
        <div className="space-y-3">
          <p className="text-sm text-foreground/60">
            Your main workout will be shown around this time each day.
          </p>

          <div className="grid gap-3">
            {TIME_SLOTS.map((time) => (
              <button
                key={time.id}
                type="button"
                onClick={() => setForm({ ...form, workout_time: time.id })}
                className={`flex items-center gap-4 rounded-2xl border-2 px-6 py-4 text-left transition ${
                  form.workout_time === time.id
                    ? "border-primary bg-primary/10"
                    : "border-foreground/15 bg-card hover:border-foreground/40"
                }`}
              >
                <span className="text-3xl">{time.emoji}</span>
                <div>
                  <div className="text-lg font-semibold">{time.label}</div>
                  <div className="text-sm text-foreground/60">{time.sub}</div>
                </div>
                {form.workout_time === time.id && (
                  <span className="ml-auto font-bold text-primary">✓</span>
                )}
              </button>
            ))}
          </div>
        </div>
      ),
    },
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
          <h2 className="mt-6 serif text-4xl font-bold">
            Building your plan...
          </h2>
          <p className="mt-3 text-foreground/60">
            Creating 14 days for {form.name || "you"}.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-background paper">
      <div className="blob top-[-100px] right-[-100px] h-[400px] w-[400px] bg-primary/40" />
      <div className="blob bottom-[-100px] left-[-100px] h-[400px] w-[400px] bg-accent/50" />

      <header className="relative z-10 mx-auto max-w-6xl px-6 py-6">
        <Link to="/" className="serif text-2xl font-bold">
          Guli<span className="italic-accent">workout</span>
        </Link>
      </header>

      <main className="relative z-10 mx-auto max-w-xl px-6 py-12">
        <div className="mb-8 flex gap-2">
          {steps.map((_, index) => (
            <div
              key={index}
              className={`h-1.5 flex-1 rounded-full transition ${
                index <= step ? "bg-primary" : "bg-foreground/15"
              }`}
            />
          ))}
        </div>

        <p className="text-sm font-semibold uppercase tracking-widest text-primary">
          Step {step + 1} of {steps.length}
        </p>

        <h1 className="mt-3 serif text-4xl font-bold leading-tight md:text-5xl">
          {current.title}
        </h1>

        <div className="mt-8">{current.body}</div>

        <div className="mt-10 flex gap-3">
          {step > 0 && (
            <button
              type="button"
              onClick={() => setStep(step - 1)}
              className="rounded-full border-2 border-foreground/20 px-6 py-3 font-semibold hover:bg-foreground/5"
            >
              Back
            </button>
          )}

          <button
            type="button"
            onClick={() => (last ? finish() : setStep(step + 1))}
            disabled={step === 0 && !form.name.trim()}
            className="ml-auto rounded-full bg-primary px-8 py-3 font-semibold text-primary-foreground transition hover:scale-[1.02] disabled:opacity-50"
          >
            {last ? "Generate my plan ✦" : "Next →"}
          </button>
        </div>
      </main>
    </div>
  );
}
