import { motion, useInView } from "motion/react";
import { useRef } from "react";

const steps = [
  {
    num: "01",
    chip: "Local-first",
    title: "Save to your device first",
    desc: "All bookmarks and feeds are stored locally in SQLite. Everything works offline, no account required to get started.",
    mockup: (
      <div className="w-[88%] rounded-t-md border border-border border-b-0 bg-black/40 p-3">
        <div className="mb-2 flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-ink-secondary" />
          <div className="h-1.5 w-24 rounded bg-white/10" />
        </div>
        <div className="space-y-1.5">
          <div className="h-1.5 w-full rounded bg-white/10" />
          <div className="h-1.5 w-4/5 rounded bg-white/10" />
          <div className="h-1.5 w-2/5 rounded bg-white/[0.04]" />
        </div>
      </div>
    ),
  },
  {
    num: "02",
    chip: "Auto-metadata",
    title: "Metadata fetched automatically",
    desc: "Paste a URL and ReadrSync fetches the title, description, favicon, and preview image, no manual editing needed.",
    mockup: (
      <div className="flex w-[88%] items-center gap-3 rounded-t-md border border-border border-b-0 bg-black/40 p-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md border border-border bg-white/5 text-lg">
          🔖
        </div>
        <div className="flex-1 space-y-1.5">
          <div className="h-2 w-4/5 rounded bg-white/[0.04]" />
          <div className="h-1.5 w-full rounded bg-white/10" />
          <div className="h-1.5 w-3/5 rounded bg-white/10" />
        </div>
      </div>
    ),
  },
  {
    num: "03",
    chip: "Sync everywhere",
    title: "Your data, your choice",
    desc: "Sync across desktop, web, and mobile when you choose. Your data is never sold. Cloud sync is optional and always encrypted.",
    mockup: (
      <div className="flex w-[88%] items-center justify-between rounded-t-md border border-border border-b-0 bg-black/40 p-4">
        <span className="text-xl">🪟</span>
        <div className="flex flex-col items-center gap-1">
          <div className="h-px w-8 bg-ink-tertiary/40" />
          <span className="font-mono text-[9px] text-ink-tertiary uppercase tracking-widest">sync</span>
          <div className="h-px w-8 bg-ink-tertiary/40" />
        </div>
        <span className="text-xl">📱</span>
      </div>
    ),
  },
];

export function HowItWorks() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.2 });

  return (
    <section id="how" className="border-border border-t py-24">
      <div className="mx-auto max-w-5xl px-6">
        <motion.div
          ref={ref}
          className="mb-14 text-center"
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          <span className="mb-3 block font-mono text-[10px] text-ink-tertiary uppercase tracking-[0.12em]">
            How it works
          </span>
          <h2 className="font-display font-semibold text-3xl text-foreground tracking-tight sm:text-4xl">
            A new way to manage your reading.
          </h2>
          <p className="mx-auto mt-4 max-w-md text-sm text-ink-secondary leading-relaxed">
            Save to your device first, sync in the background. Offline-ready from day one.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 gap-px overflow-hidden rounded-2xl border border-border bg-border md:grid-cols-3">
          {steps.map((s, i) => (
            <motion.div
              key={s.num}
              className="group relative flex flex-col overflow-hidden bg-gradient-to-br from-card via-card to-accent-blue/[0.02] transition-colors hover:bg-canvas-overlay"
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.1 + i * 0.1 }}
            >
              <div className="pointer-events-none absolute -top-10 -right-10 h-32 w-32 rounded-full bg-accent-blue/[0.03] blur-2xl" />
              <div className="flex flex-1 flex-col p-7 pb-4">
                <span className="mb-4 font-mono text-[10px] text-ink-tertiary uppercase tracking-widest">
                  {s.num}
                </span>
                <span className="mb-3 inline-block w-fit rounded-full border border-border px-2.5 py-1 font-mono text-[11px] text-ink-secondary uppercase tracking-wider">
                  {s.chip}
                </span>
                <h3 className="mb-2 font-display font-medium text-[15px] text-foreground/85 leading-snug">
                  {s.title}
                </h3>
                <p className="text-[13px] text-ink-secondary leading-relaxed">{s.desc}</p>
              </div>
              <div className="mt-4 flex justify-center overflow-hidden px-0 transition-transform duration-300 group-hover:translate-y-[-4px]">
                {s.mockup}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
