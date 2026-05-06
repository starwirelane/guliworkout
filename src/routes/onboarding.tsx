import { useState } from "react";
        <div className="space-y-3">
          <p className="text-sm text-foreground/60">Your main workout will be shown around this time each day.</p>
          <div className="grid gap-3">
            {TIME_SLOTS.map((t) => (
              <button
                key={t.id}
                onClick={() => setForm({ ...form, workout_time: t.id })}
                className={`flex items-center gap-4 rounded-2xl border-2 px-6 py-4 text-left transition ${form.workout_time === t.id ? "border-primary bg-primary/10" : "border-foreground/15 bg-card hover:border-foreground/40"}`}
              >
                <span className="text-3xl">{t.emoji}</span>
                <div>
                  <div className="text-lg font-semibold">{t.label}</div>
                  <div className="text-sm text-foreground/60">{t.sub}</div>
                </div>
                {form.workout_time === t.id && <span className="ml-auto font-bold text-primary">✓</span>}
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
          <h2 className="mt-6 serif text-4xl font-bold">Building your plan...</h2>
          <p className="mt-3 text-foreground/60">Creating 14 days for {form.name || "you"}.</p>
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
          {steps.map((_, i) => (
            <div key={i} className={`h-1.5 flex-1 rounded-full transition ${i <= step ? "bg-primary" : "bg-foreground/15"}`} />
          ))}
        </div>

        <p className="text-sm font-semibold uppercase tracking-widest text-primary">Step {step + 1} of {steps.length}</p>
        <h1 className="mt-3 serif text-4xl font-bold leading-tight md:text-5xl">{current.title}</h1>
        <div className="mt-8">{current.body}</div>

        <div className="mt-10 flex gap-3">
          {step > 0 && (
            <button onClick={() => setStep(step - 1)} className="rounded-full border-2 border-foreground/20 px-6 py-3 font-semibold hover:bg-foreground/5">
              Back
            </button>
          )}
          <button
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
