import { createFileRoute, Link } from "@tanstack/react-router";
import { motion, useInView } from "motion/react";
import { useRef } from "react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/download")({
  component: Download,
});

const platforms = [
  {
    icon: "🌐",
    name: "Web app",
    version: "v0.1",
    desc: "Use BookmarkReader in any modern browser, no installation needed.",
    status: "available" as const,
    href: "/web",
  },
  {
    icon: "🪟",
    name: "Windows",
    desc: "Native app for Windows 10 and later, built with Tauri.",
    status: "soon" as const,
  },
  {
    icon: "🍎",
    name: "macOS",
    desc: "Universal binary for Intel and Apple Silicon.",
    status: "soon" as const,
  },
  {
    icon: "🐧",
    name: "Linux",
    desc: "AppImage and .deb packages for Ubuntu and derivatives.",
    status: "soon" as const,
  },
  {
    icon: "📱",
    name: "iOS",
    desc: "iPhone and iPad app, available on the App Store.",
    status: "soon" as const,
  },
  {
    icon: "🤖",
    name: "Android",
    desc: "Available on Google Play Store.",
    status: "soon" as const,
  },
];

const availablePlatforms = platforms.filter((p) => p.status === "available");
const desktopPlatforms = platforms.filter(
  (p) => p.status === "soon" && ["Windows", "macOS", "Linux"].includes(p.name),
);
const mobilePlatforms = platforms.filter(
  (p) => p.status === "soon" && ["iOS", "Android"].includes(p.name),
);

function PlatformCard({
  platform,
  index,
  inView,
}: {
  platform: (typeof platforms)[0];
  index: number;
  inView: boolean;
}) {
  return (
    <motion.div
      className="flex items-center gap-4 rounded-xl border border-border bg-gradient-to-br from-card via-card to-accent-blue/[0.02] px-5 py-4 transition-colors hover:border-border-hover"
      initial={{ opacity: 0, y: 12 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.4, delay: 0.05 * index }}
    >
      <span className="w-10 shrink-0 text-center text-2xl">
        {platform.icon}
      </span>
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <span className="font-medium text-[13px] text-foreground/75">
            {platform.name}
          </span>
          {"version" in platform && platform.version && (
            <span className="rounded border border-border px-1.5 py-0.5 font-mono text-[9px] text-ink-tertiary">
              {platform.version}
            </span>
          )}
        </div>
        <p className="mt-0.5 text-[12px] text-ink-tertiary">{platform.desc}</p>
      </div>
      <div className="shrink-0">
        {platform.status === "available" ? (
          <Link to={platform.href ?? "#"}>
            <Button size="sm">Open app →</Button>
          </Link>
        ) : (
          <span className="rounded-lg border border-border px-3 py-1.5 font-mono text-[10px] text-ink-tertiary tracking-wider">
            Soon
          </span>
        )}
      </div>
    </motion.div>
  );
}

function Download() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.1 });

  return (
    <main className="relative min-h-screen">
      <div className="pointer-events-none fixed top-1/4 left-1/2 h-[60vw] w-[60vw] -translate-x-1/2 rounded-full bg-accent-blue/[0.03] blur-3xl" />
      <section className="px-6 pt-32 pb-12 text-center">
        <div className="mx-auto max-w-lg">
          <motion.span
            className="mb-4 block font-mono text-[10px] text-ink-tertiary uppercase tracking-[0.12em]"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            Download
          </motion.span>
          <motion.h1
            className="mb-4 font-display font-semibold text-3xl text-foreground tracking-tight sm:text-4xl"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            Get BookmarkReader
          </motion.h1>
          <motion.p
            className="text-[14px] text-ink-secondary leading-relaxed"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
          >
            Currently in early Phase 1. The web app is live and ready to use.
            Native desktop and mobile apps are in active development.
          </motion.p>
        </div>
      </section>

      <div ref={ref} className="mx-auto max-w-xl px-6 pb-24">
        <div className="mb-4 flex items-center gap-3">
          <span className="font-mono text-[10px] text-ink-tertiary uppercase tracking-widest">
            Available now
          </span>
          <div className="flex-1 border-border border-t" />
        </div>
        <div className="mb-8 space-y-2">
          {availablePlatforms.map((p, i) => (
            <PlatformCard key={p.name} platform={p} index={i} inView={inView} />
          ))}
        </div>

        <div className="mb-4 flex items-center gap-3">
          <span className="font-mono text-[10px] text-ink-tertiary uppercase tracking-widest">
            Desktop - coming soon
          </span>
          <div className="flex-1 border-border border-t" />
        </div>
        <div className="mb-8 space-y-2">
          {desktopPlatforms.map((p, i) => (
            <PlatformCard key={p.name} platform={p} index={i + 1} inView={inView} />
          ))}
        </div>

        <div className="mb-4 flex items-center gap-3">
          <span className="font-mono text-[10px] text-ink-tertiary uppercase tracking-widest">
            Mobile - coming soon
          </span>
          <div className="flex-1 border-border border-t" />
        </div>
        <div className="mb-10 space-y-2">
          {mobilePlatforms.map((p, i) => (
            <PlatformCard key={p.name} platform={p} index={i + 4} inView={inView} />
          ))}
        </div>

        <motion.div
          className="rounded-xl border border-border bg-gradient-to-br from-card via-card to-accent-blue/[0.02] p-5"
          initial={{ opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.35 }}
        >
          <div className="flex gap-3">
            <span className="mt-0.5 text-base">📧</span>
            <div className="flex-1">
              <p className="mb-1 font-medium text-[13px] text-foreground/70">
                Get notified when desktop apps launch
              </p>
              <p className="mb-4 text-[12px] text-ink-tertiary">
                One email when each platform ships. No newsletters.
              </p>
              <div className="flex flex-wrap gap-2">
                <input
                  type="email"
                  placeholder="your@email.com"
                  className="h-9 min-w-0 flex-1 rounded-lg border border-border bg-transparent px-3 font-mono text-[12px] text-foreground/60 placeholder-ink-tertiary outline-none focus:border-accent-blue/40 focus:ring-0"
                />
                <Button>Notify me</Button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </main>
  );
}
