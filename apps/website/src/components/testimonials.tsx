import { Marquee } from "./marquee";
import { Button } from "./ui/button";

const testimonials = [
  {
    name: "Alex Chen",
    username: "@alexchen",
    body: "BookmarkReader has completely changed how I organize my research. The auto-fetched metadata saves me so much time.",
    img: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
  },
  {
    name: "Maria Rodriguez",
    username: "@mariacodes",
    body: "Finally, a bookmark manager that works seamlessly across all my devices. The RSS reader integration is brilliant.",
    img: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&h=150&fit=crop&crop=face",
  },
  {
    name: "David Kim",
    username: "@davidk",
    body: "The local-first approach gives me peace of mind about my data. Plus the interface is incredibly intuitive.",
    img: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
  },
  {
    name: "Sarah Johnson",
    username: "@sarahj",
    body: "I love that I can read my RSS feeds offline. Perfect for my daily commute without using mobile data.",
    img: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face",
  },
  {
    name: "Tom Wilson",
    username: "@tomwilson",
    body: "The tagging system and collections make organizing hundreds of bookmarks effortless. Can't imagine my workflow without it.",
    img: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
  },
  {
    name: "Emma Liu",
    username: "@emmaliu",
    body: "As a developer, I appreciate the clean tech stack. The app is fast, responsive, and just works perfectly.",
    img: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&h=150&fit=crop&crop=face",
  },
  {
    name: "James Park",
    username: "@jamespark",
    body: "The cross-platform sync is a game changer. I can start reading on desktop and continue on mobile seamlessly.",
    img: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face",
  },
  {
    name: "Lisa Anderson",
    username: "@lisaa",
    body: "Finally, an RSS reader that doesn't feel bloated. Clean, fast, and focuses on what matters, reading content.",
    img: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face",
  },
  {
    name: "Robert Taylor",
    username: "@robtt",
    body: "The offline-first approach means I can access my bookmarks anywhere. Essential for my field work.",
    img: "https://images.unsplash.com/photo-1507591064344-4c6ce005b128?w=150&h=150&fit=crop&crop=face",
  },
];

const firstColumn = testimonials.slice(0, 3);
const secondColumn = testimonials.slice(3, 6);
const thirdColumn = testimonials.slice(6, 9);

function TestimonialCard({
  img,
  name,
  username,
  body,
}: {
  img: string;
  name: string;
  username: string;
  body: string;
}) {
  return (
    <div className="relative w-full max-w-xs overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-card via-card to-accent-blue/[0.02] p-6">
      <div className="pointer-events-none absolute -top-10 -right-10 h-32 w-32 rounded-full bg-accent-blue/[0.04] blur-2xl" />

      <div className="text-sm text-foreground/85 leading-relaxed">{body}</div>

      <div className="mt-5 flex items-center gap-2">
        <img src={img || "/placeholder.svg"} alt={name} height="40" width="40" className="h-10 w-10 rounded-full" />
        <div className="flex flex-col">
          <div className="font-medium text-sm text-foreground leading-5 tracking-tight">
            {name}
          </div>
          <div className="text-xs text-ink-secondary leading-5 tracking-tight">
            {username}
          </div>
        </div>
      </div>
    </div>
  );
}

export function TestimonialsSection() {
  return (
    <section id="testimonials" className="relative overflow-hidden py-24">
      <div className="pointer-events-none absolute top-1/2 left-1/2 h-[60vw] w-[60vw] -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent-blue/[0.02] blur-3xl" />
      <div className="mx-auto max-w-7xl px-6">
        <div className="mx-auto max-w-[540px] text-center">
          <span className="mb-3 block font-mono text-[10px] text-ink-tertiary uppercase tracking-[0.12em]">
            Testimonials
          </span>
          <h2 className="font-display font-semibold text-3xl text-foreground tracking-tight sm:text-4xl">
            What our users say
          </h2>
          <p className="mt-3 text-sm text-ink-secondary">
            From bookmark organization to RSS reading, our users love how BookmarkReader simplifies their digital life.
          </p>
        </div>

        <div className="my-16 flex max-h-[738px] justify-center gap-6 overflow-hidden [mask-image:linear-gradient(to_bottom,transparent,black_25%,black_75%,transparent)]">
          <div>
            <Marquee pauseOnHover vertical className="[--duration:20s]">
              {firstColumn.map((testimonial) => (
                <TestimonialCard key={testimonial.username} {...testimonial} />
              ))}
            </Marquee>
          </div>
          <div className="hidden md:block">
            <Marquee reverse pauseOnHover vertical className="[--duration:25s]">
              {secondColumn.map((testimonial) => (
                <TestimonialCard key={testimonial.username} {...testimonial} />
              ))}
            </Marquee>
          </div>
          <div className="hidden lg:block">
            <Marquee pauseOnHover vertical className="[--duration:30s]">
              {thirdColumn.map((testimonial) => (
                <TestimonialCard key={testimonial.username} {...testimonial} />
              ))}
            </Marquee>
          </div>
        </div>

        <div className="flex justify-center">
          <Button variant="secondary" size="lg">
            <svg className="h-4 w-4 text-ink-secondary" fill="currentColor" viewBox="0 0 24 24" aria-label="X logo">
              <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
            </svg>
            Share your experience
          </Button>
        </div>
      </div>
    </section>
  );
}
