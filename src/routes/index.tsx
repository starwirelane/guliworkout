export default function Landing() {
  return (
    <main className="min-h-screen bg-background px-6 py-16 text-foreground">
      <section className="mx-auto flex max-w-5xl flex-col items-center text-center">
        <p className="text-sm font-semibold uppercase tracking-widest text-primary">
          Guliworkout
        </p>

        <h1 className="mt-4 text-5xl font-bold leading-tight md:text-7xl">
          Build your workout routine.
        </h1>

        <p className="mt-5 max-w-2xl text-lg text-foreground/70">
          Track workouts, stay consistent, and keep your progress moving.
        </p>

        <a
          href="/auth"
          className="mt-8 rounded-full bg-primary px-6 py-3 font-semibold text-primary-foreground transition hover:scale-[1.02]"
        >
          Get started
        </a>
      </section>
    </main>
  );
}
