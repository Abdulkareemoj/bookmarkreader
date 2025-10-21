import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/explore")({
  component: ExploreComponent,
});

function ExploreComponent() {
  return (
    <main className="flex-1 overflow-hidden">
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <h2 className="mb-2 font-bold text-2xl text-foreground">Explore</h2>
          <p className="text-foreground/60">Coming soon...</p>
        </div>
      </div>
    </main>
  );
}
