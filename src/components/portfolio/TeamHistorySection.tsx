import { ArrowRight } from "lucide-react";
import SectionIntro from "@/components/portfolio/SectionIntro";

// Newest first, like a CV.
const teamHistory = [
  {
    role: "Freelance Data Analyst",
    team: "Supporting Tier-1 CRL Pros (Morten & Viiper)",
    period: "May 2026 – Present",
    achievement: "CRL 2026 World Championship track",
  },
  {
    role: "Independent coach & analyst",
    team: "Freelance",
    period: "2025",
    description: "Deck picking and later analyst support during the CRL 2025 season, before a short break.",
    achievement: "CRL 2025 season",
  },
  {
    role: "Analyst",
    team: "Selección Colombia",
    period: "Supremacy League Copa América 2025",
    achievement: "Top 6 finish",
  },
  {
    role: "Analyst / coach",
    team: "Odyssey",
    period: "March 2025 – October 2025",
  },
  {
    role: "Analyst",
    team: "The Dark Empire",
    period: "2019–2021",
  },
];

/**
 * A vertical timeline beside a pinned heading - the same composition as the
 * testimonials. It replaced a horizontal scroll that held the page for about
 * 1,900 px on desktop to show five short entries.
 */
const TeamHistorySection = () => (
  <section id="experience" className="scroll-mt-14 px-5 py-20 sm:px-6 sm:py-28">
    <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-12 lg:gap-16">
      <div className="lg:col-span-4">
        <div className="lg:sticky lg:top-28">
          <SectionIntro
            title="Seven years in competitive Clash Royale."
            description="From The Dark Empire in 2019 to Selección Colombia and Tier-1 Solo CRL prep."
          />
        </div>
      </div>

      <ol className="relative lg:col-span-8">
        {/* The line runs from the first dot to the last. */}
        <span className="absolute bottom-3 left-[5px] top-2 w-px bg-border" aria-hidden />
        {teamHistory.map((item, i) => {
          const current = i === 0;
          return (
            <li key={`${item.team}-${item.period}`} className="relative pb-12 pl-10 last:pb-0 sm:pb-14">
              <span
                className={`absolute left-0 top-[0.2rem] h-[11px] w-[11px] rounded-full border-2 ${
                  current ? "border-clash-gold bg-clash-gold" : "border-muted-foreground/60 bg-background"
                }`}
                aria-hidden
              />
              <div className="flex flex-wrap items-center gap-3">
                <span className="label-caps text-clash-gold">{item.period}</span>
                {current && (
                  <span className="label-caps rounded-full border border-clash-gold/40 px-2 py-0.5 text-clash-gold">
                    Now
                  </span>
                )}
              </div>
              <h3 className="mt-3 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">{item.role}</h3>
              <p className="mt-1 text-lg text-foreground/80">{item.team}</p>
              {item.description && (
                <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">{item.description}</p>
              )}
              {item.achievement && (
                <p className="mt-3 flex items-center gap-2 text-sm font-medium text-foreground">
                  <ArrowRight className="h-3.5 w-3.5 text-clash-gold" aria-hidden />
                  {item.achievement}
                </p>
              )}
            </li>
          );
        })}
      </ol>
    </div>
  </section>
);

export default TeamHistorySection;
