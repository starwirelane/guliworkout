import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  component: Home,
});

function Home() {
  return (
    <main>
      <h1>Guliworkout</h1>
      <p>Your app is working.</p>
    </main>
  );
}
