import { Link } from "@tanstack/react-router";
import { motion, useInView } from "motion/react";
import { useRef } from "react";
import { ArrowRight } from "lucide-react";
import { Button } from "./ui/button";

export function PromoBand() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.3 });

  return (
    <section className="relative overflow-hidden border-border border-t py-24">
      <div className="pointer-events-none absolute top-1/2 left-1/2 h-80 w-80 -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent-blue/5 blur-3xl" />
      <motion.div
        ref={ref}
        className="mx-auto max-w-xl px-6 text-center"
        initial={{ opacity: 0, y: 24 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6 }}
      >
        <span className="mb-4 block font-mono text-[10px] text-ink-tertiary uppercase tracking-[0.12em]">
          Organize. Read. Sync.
        </span>
        <h2 className="font-display font-semibold text-3xl text-foreground tracking-tight sm:text-4xl">
          Your digital library,
          <br />
          reimagined.
        </h2>
        <p className="mx-auto mt-4 mb-8 max-w-sm text-sm text-ink-secondary leading-relaxed">
          Available on desktop, web, and mobile.
          <br />
          Your data, always under your control.
        </p>
        <Link to="/download">
          <Button size="xl">
            Get ReadrSync <ArrowRight className="ml-1 h-4 w-4" />
          </Button>
        </Link>
      </motion.div>
    </section>
  );
}
