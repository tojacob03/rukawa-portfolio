import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { scrollToSection } from "@/lib/smoothScroll";
import { usePublicStats } from "@/hooks/usePublicStats";
import { MONTHLY_FINALS_RESULT } from "@/data/results";
import { EASE } from "@/lib/motion";

// The last word of the headline cycles through what the analysis produces.
const OUTCOMES = ["set decisions.", "Game 1 reads.", "deck orders.", "Game 3 calls."];

// Proof first, decoration second: these carry the hero, not artwork.
const PROOF = [
  { value: MONTHLY_FINALS_RESULT, label: "CRL Monthly Finals results of players I prepared, 2025-26" },
  { value: "2 of 2", label: "players I help prepare qualified for the CRL World Finals 2026" },
  { value: "Since 2019", label: "analyst for teams, a national team and players" },
];

// One headline line: the text slides up out of a clipping mask on load.
const Line = ({
  children,
  delay,
  className = "",
}: {
  children: React.ReactNode;
  delay: number;
  className?: string;
}) => (
  <span className="block overflow-hidden pb-[0.08em]">
    <motion.span
      className={`block ${className}`}
      initial={{ y: "105%" }}
      animate={{ y: "0%" }}
      transition={{ duration: 1, ease: EASE, delay }}
    >
      {children}
    </motion.span>
  </span>
);

const KineticHero = () => {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const { data } = usePublicStats();
  const [outcome, setOutcome] = useState(0);

  // Scroll-linked motion: the two big lines drift apart, the whole block
  // fades and lifts as the section leaves the viewport.
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const driftLeft = useTransform(scrollYProgress, [0, 1], ["0%", reduce ? "0%" : "-18%"]);
  const driftRight = useTransform(scrollYProgress, [0, 1], ["0%", reduce ? "0%" : "12%"]);
  const fade = useTransform(scrollYProgress, [0, 0.85], [1, reduce ? 1 : 0]);

  useEffect(() => {
    if (reduce) return;
    const id = setInterval(() => setOutcome((i) => (i + 1) % OUTCOMES.length), 2600);
    return () => clearInterval(id);
  }, [reduce]);

  const battles = data?.battlesAnalyzed30d ?? 0;

  return (
    <section ref={ref} className="relative flex min-h-[100svh] flex-col justify-center overflow-hidden pb-12 pt-24">
      <motion.div style={{ opacity: fade }} className="relative z-10 mx-auto w-full max-w-7xl px-5 sm:px-8">
        <h1 className="text-[clamp(3rem,min(9.5vw,13svh),9rem)] font-semibold leading-[0.92] tracking-[-0.045em] text-foreground">
          <motion.span style={{ x: driftLeft }} className="block">
            <Line delay={0.1}>I turn</Line>
            <Line delay={0.2}>battle logs</Line>
          </motion.span>
          <motion.span style={{ x: driftRight }} className="block">
            <span className="block overflow-hidden pb-[0.08em]">
              <motion.span
                className="flex flex-wrap items-baseline gap-x-[0.25em]"
                initial={{ y: "105%" }}
                animate={{ y: "0%" }}
                transition={{ duration: 1, ease: EASE, delay: 0.3 }}
              >
                <span className="text-muted-foreground/70">into</span>
                <span className="relative inline-grid overflow-hidden">
                  {/* Both words share one grid cell while they swap, so the line is never empty. */}
                  <AnimatePresence initial={false}>
                    <motion.span
                      key={OUTCOMES[outcome]}
                      initial={{ y: "100%", opacity: 0 }}
                      animate={{ y: "0%", opacity: 1 }}
                      exit={{ y: "-100%", opacity: 0 }}
                      transition={{ duration: 0.55, ease: EASE }}
                      className="pb-[0.08em] text-foreground [grid-area:1/1]"
                    >
                      {OUTCOMES[outcome]}
                    </motion.span>
                  </AnimatePresence>
                </span>
              </motion.span>
            </span>
          </motion.span>
        </h1>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: EASE, delay: 0.6 }}
          className="mt-8 flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between"
        >
          <p className="max-w-xl text-lg leading-relaxed text-muted-foreground sm:text-xl">
            I&apos;m Till Oscar Jacob, known as Rukawa: Clash Royale analyst for Solo CRL, currently helping to
            prepare two players for the CRL World Finals. I build the data tooling behind it myself, and use the same
            approach beyond esports.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={() => scrollToSection("work")}
              className="inline-flex items-center justify-center rounded-md bg-foreground px-7 py-4 text-sm font-semibold text-background transition-colors hover:bg-foreground/90"
            >
              See the system
            </button>
            <button
              type="button"
              onClick={() => scrollToSection("contact")}
              className="inline-flex items-center justify-center rounded-md border border-foreground/25 px-7 py-4 text-sm font-semibold text-foreground transition-colors hover:border-foreground/60"
            >
              Work together
            </button>
          </div>
        </motion.div>

        <motion.dl
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.9 }}
          className="mt-10 grid grid-cols-2 gap-x-6 gap-y-6 border-t border-border/60 pt-6 md:grid-cols-4"
        >
          {battles > 0 && (
            <div className="flex flex-col">
              <dt className="mt-2 flex max-w-[16rem] items-start gap-2 text-sm leading-relaxed text-muted-foreground">
                <span className="mt-[0.6em] h-1.5 w-1.5 shrink-0 rounded-full bg-positive" aria-hidden />
                battles parsed by my pipeline, last 30 days
              </dt>
              <dd className="tabular-stat order-first text-3xl font-semibold tracking-tight text-foreground">
                {battles.toLocaleString("en-US")}
              </dd>
            </div>
          )}
          {PROOF.map((item) => (
            <div key={item.value} className="flex flex-col">
              <dt className="mt-2 max-w-[16rem] text-sm leading-relaxed text-muted-foreground">{item.label}</dt>
              <dd className="order-first text-3xl font-semibold tracking-tight text-foreground">{item.value}</dd>
            </div>
          ))}
        </motion.dl>
      </motion.div>
    </section>
  );
};

export default KineticHero;
