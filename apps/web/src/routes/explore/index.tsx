import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/explore/")({
  component: ExploreComponent,
});

function ExploreComponent() {
  return (
    <div className="p-4">
      <h1 className="text-2xl">Explore</h1>
      <p>This is where you can explore new content.</p>
    </div>
  );
}
