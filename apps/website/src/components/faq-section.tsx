import { Minus, Plus } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";

export function FAQSection() {
  const [openItems, setOpenItems] = useState<number[]>([]);

  const toggleItem = (index: number) => {
    setOpenItems((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index],
    );
  };

  const faqs = [
    {
      question: "What is ReadrSync?",
      answer:
        "ReadrSync is a cross-platform bookmark and RSS manager that helps you organize your digital life. It works on desktop, web, and mobile devices, with local-first SQLite storage and optional Google Drive cloud sync.",
    },
    {
      question: "Is my data private and secure?",
      answer:
        "Yes! ReadrSync is local-first, meaning your data is stored on your device using SQLite. Everything works offline with no account required. If you enable optional Google Drive cloud sync, your data is stored in your own Google Drive and never on our servers.",
    },
    {
      question: "What platforms are supported?",
      answer:
        "All three platforms are available: a web app you can use in any browser, native desktop apps built with Tauri (Windows, macOS, Linux), and mobile apps built with Expo (iOS, Android). All platforms share the same features and sync capabilities.",
    },
    {
      question: "Can I import my existing bookmarks?",
      answer:
        "Yes! ReadrSync supports importing bookmarks from any browser's HTML export file, from OPML files (for RSS subscriptions), and from JSON. You can also export your entire library in any of these formats.",
    },
    {
      question: "How does the RSS reader work?",
      answer:
        "Subscribe to any RSS or Atom feed and ReadrSync automatically fetches and parses articles. You can read them offline, track read/unread states, highlight passages, and annotate articles with your own notes.",
    },
    {
      question: "Is ReadrSync open source?",
      answer:
        "Yes! ReadrSync is built with open-source technologies (React, TypeScript, Tauri, Expo) and the code is available on GitHub. We welcome contributions from the community.",
    },
    {
      question: "What's the pricing model?",
      answer:
        "ReadrSync is free and open source. All features including cloud sync and cross-platform access are available at no cost.",
    },
  ];

  return (
    <section id="faq" className="relative overflow-hidden py-24">
      <div className="absolute top-1/3 -right-20 -z-10 h-80 w-80 rounded-full bg-accent-blue/5 blur-3xl" />
      <div className="absolute top-2/3 -left-20 -z-10 h-80 w-80 rounded-full bg-accent-blue/5 blur-3xl" />

      <div className="container mx-auto max-w-5xl px-6">
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <span className="mb-3 block font-mono text-[10px] text-ink-tertiary uppercase tracking-[0.12em]">
            FAQ
          </span>
          <h2 className="font-display font-semibold text-3xl text-foreground tracking-tight sm:text-4xl">
            Questions? We&apos;ve got answers.
          </h2>
        </motion.div>

        <div className="mx-auto mt-12 flex max-w-xl flex-col gap-3">
          {faqs.map((faq, index) => (
            <motion.div
              key={faq.question}
              className="cursor-pointer rounded-xl border border-border bg-gradient-to-br from-card via-card to-accent-blue/[0.02] p-5 transition-colors hover:border-border-hover"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.05 }}
              viewport={{ once: true }}
              onClick={() => toggleItem(index)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  toggleItem(index);
                }
              }}
            >
              <div className="flex items-start justify-between">
                <h3 className="m-0 pr-4 font-medium text-sm text-foreground/85">
                  {faq.question}
                </h3>
                <motion.div
                  animate={{ rotate: openItems.includes(index) ? 180 : 0 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                >
                  {openItems.includes(index) ? (
                    <Minus className="size-4 shrink-0 text-ink-tertiary transition duration-300" />
                  ) : (
                    <Plus className="size-4 shrink-0 text-ink-tertiary transition duration-300" />
                  )}
                </motion.div>
              </div>
              <AnimatePresence>
                {openItems.includes(index) && (
                  <motion.div
                    className="overflow-hidden text-sm text-ink-secondary leading-relaxed"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto", marginTop: 16 }}
                    exit={{ opacity: 0, height: 0, marginTop: 0 }}
                    transition={{
                      duration: 0.3,
                      ease: "easeInOut",
                      opacity: { duration: 0.2 },
                    }}
                  >
                    {faq.answer}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
