import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { motion } from "motion/react";
import { Button } from "@/components/ui/button";

export default function Hero() {
  return (
    <section className="relative flex min-h-screen w-full flex-col items-center justify-center overflow-hidden px-6 py-32 text-center">
      <div className="pointer-events-none absolute top-[30%] left-1/2 h-[60vw] w-[60vw] -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent-blue/5 blur-3xl" />
      <div className="pointer-events-none absolute top-[60%] left-[30%] h-[40vw] w-[40vw] -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent-blue/[0.03] blur-3xl" />
      <div className="absolute top-0 left-1/2 h-px w-4/5 -translate-x-1/2 bg-linear-to-r from-transparent via-accent-blue/20 to-transparent" />
      <div className="absolute bottom-0 left-1/2 h-px w-3/5 -translate-x-1/2 bg-linear-to-r from-transparent via-white/5 to-transparent" />

      <motion.div
        className="mb-8 flex items-center gap-2 rounded-full border border-border px-4 py-1.5"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-ink-secondary" />
        <span className="font-mono text-[11px] text-ink-secondary uppercase tracking-widest">
          Early access · Phase 1
        </span>
      </motion.div>

      <motion.h1
        className="max-w-4xl font-display font-semibold text-[clamp(3rem,8vw,7rem)] leading-[0.9] tracking-[-0.05em] text-foreground"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.1 }}
      >
        Your bookmarks.
        <br />
        Your feeds.
        <br />
        <span className="text-ink-secondary">All in one place.</span>
      </motion.h1>

      <motion.p
        className="mx-auto mt-6 max-w-md text-[15px] text-ink-secondary leading-relaxed"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.2 }}
      >
        A local-first bookmark manager and RSS reader that works across desktop,
        web, and mobile with your data always under your control.
      </motion.p>

      <motion.div
        className="mt-10 flex flex-wrap justify-center gap-3"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.3 }}
      >
        <Link to="/download">
          <Button size="xl" className="shadow-lg shadow-white/5">
            Download, it&apos;s free
          </Button>
        </Link>
        <a href="#how">
          <Button variant="secondary" size="xl">
            See how it works <ArrowRight className="ml-1 h-4 w-4" />
          </Button>
        </a>
      </motion.div>

      <motion.div
        className="mt-12 flex flex-wrap justify-center gap-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.5 }}
      >
        {[
          "SQLite · local-first",
          "React + Tauri + Expo",
          "Open source",
          "Desktop · Web · Mobile",
        ].map((tag) => (
          <span
            key={tag}
            className="rounded-full border border-border px-3 py-1 font-mono text-[10px] text-ink-tertiary uppercase tracking-widest"
          >
            {tag}
          </span>
        ))}
      </motion.div>
    </section>
  );
}
