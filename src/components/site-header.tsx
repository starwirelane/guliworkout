import { Link } from "@tanstack/react-router";

export function SiteHeader() {
  return (
    <header className="relative z-20 mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
      <Link to="/" className="flex items-center gap-2">
        <span className="text-2xl">✦</span>
        <span className="serif text-2xl font-bold tracking-tight">
          Two<span className="italic-accent">week</span>
        </span>
      </Link>
      <nav className="flex items-center gap-3">
        <Link
          to="/auth"
          className="hidden rounded-full px-4 py-2 text-sm font-medium text-foreground/70 hover:text-foreground sm:block"
        >
          Sign in
        </Link>
        <Link
          to="/auth"
          className="rounded-full bg-foreground px-5 py-2.5 text-sm font-semibold text-background transition hover:opacity-90"
        >
          Start free
        </Link>
      </nav>
    </header>
  );
}
