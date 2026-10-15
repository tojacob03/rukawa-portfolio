import type { ComponentType } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import SectionIntro from "@/components/portfolio/SectionIntro";
import { EASE } from "@/lib/motion";

// Non-esports projects: the same pipeline pattern as my esports tooling
// (collect -> clean -> analyse -> decide), applied to other domains.

// Real data for the card previews, so the cards show what each project
// actually produces.
// Average day-ahead price by hour, Sep 2025 - Aug 2026 (docs/strompreis-kompass/analysis.sql, query 1).
const HOURLY_PRICE = [103.4, 98.1, 94.6, 93.4, 94.4, 99.6, 112.5, 122.3, 116.1, 96.3, 76.7, 62.5,
  52.2, 47.0, 51.7, 65.7, 84.4, 110.3, 133.9, 150.7, 146.6, 133.5, 122.0, 108.3];
// Tyre stints of the top 5, Singapore Grand Prix 2026 (racing.stints,
// session 11388).
const RACE_LAPS = 62;
const STINTS: [string, [string, number, number][]][] = [
  ["VER", [["SOFT", 1, 32], ["MEDIUM", 33, 62]]],
  ["LEC", [["SOFT", 1, 24], ["MEDIUM", 25, 39], ["SOFT", 40, 62]]],
  ["ANT", [["SOFT", 1, 23], ["MEDIUM", 24, 39], ["SOFT", 40, 62]]],
  ["NOR", [["SOFT", 1, 32], ["MEDIUM", 33, 62]]],
  ["PIA", [["SOFT", 1, 33], ["MEDIUM", 34, 41], ["SOFT", 42, 62]]],
];
const COMPOUND: Record<string, string> = { SOFT: "#E8002D", MEDIUM: "#FFD12E", HARD: "#EDEDE8" };

const PriceProfile = () => (
  <figure>
    <div className="flex h-28 items-end gap-[3px]" aria-hidden>
      {HOURLY_PRICE.map((p, h) => (
        <motion.div
          key={h}
          className="flex-1 origin-bottom rounded-t-[2px] transition-opacity duration-300 group-hover:opacity-100"
          style={{
            height: `${(p / 160) * 100}%`,
            background: p < 70 ? "#3DBE9E" : p > 125 ? "#E8705F" : "#5B6474",
            opacity: 0.85,
          }}
          initial={{ scaleY: 0 }}
          whileInView={{ scaleY: 1 }}
          viewport={{ once: true, amount: 0.6 }}
          transition={{ duration: 0.6, delay: h * 0.02, ease: EASE }}
        />
      ))}
    </div>
    <figcaption className="mt-2 text-xs text-muted-foreground">
      Average price by hour: cheapest at 13:00, 3.2x as expensive at 19:00
    </figcaption>
  </figure>
);

const StintPreview = () => (
  <figure>
    <div className="space-y-2" aria-hidden>
      {STINTS.map(([code, stints], row) => (
        <div key={code} className="flex items-center gap-3">
          <span className="w-9 font-mono text-[11px] text-muted-foreground">{code}</span>
          <div className="relative h-3.5 flex-1">
            {stints.map(([c, a, b]) => (
              <motion.span
                key={a}
                className="absolute inset-y-0 origin-left rounded-sm"
                style={{
                  left: `${((a - 1) / RACE_LAPS) * 100}%`,
                  width: `calc(${((b - a + 1) / RACE_LAPS) * 100}% - 2px)`,
                  background: COMPOUND[c],
                }}
                initial={{ scaleX: 0 }}
                whileInView={{ scaleX: 1 }}
                viewport={{ once: true, amount: 0.6 }}
                transition={{ duration: 0.6, delay: row * 0.06 + a * 0.004, ease: EASE }}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
    <figcaption className="mt-2 text-xs text-muted-foreground">Tyre stints of the top 5, Singapore Grand Prix 2026</figcaption>
  </figure>
);

// Prognosebuch backtest, 1 Oct 2025 - 28 Sep 2026: mean absolute error of the
// day-ahead forecast per model, EUR/MWh per quarter-hour (README, backtest table).
const FORECAST_MAE: [string, number][] = [
  ["Gradient boosting", 19.3],
  ["LEAR (Lasso)", 22.0],
  ["Yesterday again", 30.2],
  ["Similar day (reference)", 32.7],
];

const ForecastPreview = () => (
  <figure>
    <div className="space-y-2.5" aria-hidden>
      {FORECAST_MAE.map(([model, mae], i) => (
        // Phones: label above the bar, so the bars keep their width.
        <div key={model} className="grid grid-cols-[1fr_2.5rem] items-center gap-x-3 gap-y-1 sm:grid-cols-[11rem_1fr_2.5rem]">
          <span className="col-span-2 text-xs text-muted-foreground sm:col-span-1 sm:truncate">{model}</span>
          <div className="relative h-3">
            <motion.span
              className="absolute inset-y-0 left-0 origin-left rounded-sm"
              style={{ width: `${(mae / 35) * 100}%`, background: i === 0 ? "hsl(var(--clash-gold))" : "#5B6474" }}
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true, amount: 0.6 }}
              transition={{ duration: 0.6, delay: i * 0.08, ease: EASE }}
            />
          </div>
          <span className="text-right font-mono text-xs text-foreground">{mae.toFixed(1)}</span>
        </div>
      ))}
    </div>
    <figcaption className="mt-3 text-xs text-muted-foreground">
      Day-ahead error per model, EUR/MWh (lower is better), one-year backtest
    </figcaption>
  </figure>
);

// Two bars with a caption - for the share and count comparisons below.
const Comparison = ({
  rows,
  max,
  caption,
}: {
  rows: { label: string; value: number; display: string }[];
  max: number;
  caption: string;
}) => (
  <figure>
    <div className="space-y-3" aria-hidden>
      {rows.map((row, i) => (
        <div key={row.label}>
          <div className="flex items-baseline justify-between gap-3 text-xs">
            <span className="text-muted-foreground">{row.label}</span>
            <span className="font-mono text-foreground">{row.display}</span>
          </div>
          <div className="relative mt-1.5 h-3">
            <motion.span
              className="absolute inset-y-0 left-0 origin-left rounded-sm"
              style={{ width: `${(row.value / max) * 100}%`, background: i === 0 ? "hsl(var(--clash-gold))" : "#5B6474" }}
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true, amount: 0.6 }}
              transition={{ duration: 0.6, delay: i * 0.1, ease: EASE }}
            />
          </div>
        </div>
      ))}
    </div>
    <figcaption className="mt-3 text-xs text-muted-foreground">{caption}</figcaption>
  </figure>
);

// Letzte Bahn, Saarland pilot: people the median resident reaches by bus and
// train within 45 minutes (README, key findings).
const TransitPreview = () => (
  <Comparison
    max={27854}
    rows={[
      { label: "Weekday morning", value: 27854, display: "27,854" },
      { label: "Sunday", value: 9839, display: "9,839" },
    ]}
    caption={"People reachable within 45 min by public transport, median resident, Saarland. 65\u00a0% fewer on Sundays"}
  />
);

// Themenkompass, University of Oldenburg 2017-2026 (README, key findings).
const ResearchPreview = () => (
  <Comparison
    max={100}
    rows={[
      { label: "Works with external co-authors", value: 74, display: "74 %" },
      { label: "Works with international co-authors", value: 43, display: "43 %" },
    ]}
    caption="18,278 works of the University of Oldenburg, 2017–2026"
  />
);

// Three screens of the app (Today, the skill branch, the character), taken
// from its demo dōjō.
const ArcPreview = () => (
  <figure>
    <img
      src="/projects/waza-arc.jpg"
      alt=""
      width={1200}
      height={640}
      loading="lazy"
      decoding="async"
      className="h-auto w-full rounded-md"
    />
    <figcaption className="mt-2 text-xs text-muted-foreground">Today, the skill branch and your fighter, from the demo dōjō</figcaption>
  </figure>
);

type Project = {
  title: string;
  href: string;
  /** Outside the portfolio's router: a separate app (/arc/) or another site. */
  external?: boolean;
  /** Another site - opens in a new tab. */
  offsite?: boolean;
  /** Public repository with the code */
  code?: string;
  tags: string[];
  linkLabel: string;
  caseStudy: { href: string; label: string } | null;
  Chart: ComponentType;
  body: string;
};

type FeaturedProject = Project & {
  /** Spans both columns, with the preview beside the text. */
  wide?: boolean;
  note: string | null;
  facts: { value: string; label: string }[];
};

// Two tiers, so the section stays short: the strongest data work as full
// cards, everything else as compact cards (a swipe row below lg). The first
// featured card spans both columns, so the other two pair up.
const featured: FeaturedProject[] = [
  {
    title: "Prognosebuch",
    href: "https://tojacob03.github.io/Prognosebuch/",
    external: true,
    offsite: true,
    code: "https://github.com/tojacob03/Prognosebuch",
    wide: true,
    linkLabel: "Open Prognosebuch",
    caseStudy: null,
    Chart: ForecastPreview,
    tags: ["Python", "Gradient boosting", "Quantile regression", "GitHub Actions"],
    body: "A probabilistic forecast of German day-ahead electricity prices, published every morning before the auction: a median and an 80 % band for every quarter-hour of the next day. Each forecast is committed unchanged, scored automatically against the real prices and added to a public track record, misses and incidents included. It also says where it falls short: the bands are slightly too narrow.",
    note: "Live since 30 September 2026. In German, with an English version. Not investment advice.",
    facts: [
      { value: "Daily, 09:00", label: "forecast published before the auction" },
      { value: "+0.41", label: "skill vs. the reference model, day-ahead backtest" },
    ],
  },
  {
    title: "Letzte Bahn",
    href: "https://tojacob03.github.io/Letzte-Bahn/",
    external: true,
    offsite: true,
    code: "https://github.com/tojacob03/Letzte-Bahn",
    linkLabel: "Open Letzte Bahn",
    caseStudy: null,
    Chart: TransitPreview,
    tags: ["Python", "r5py", "dbt", "DuckDB", "GitHub Actions"],
    body: "An accessibility atlas for public transport: for every inhabited 500 m square, the travel time by bus and train to everyday destinations, from the GP to the nearest station, on a weekday morning, a weekday evening and a Sunday. Built from the German timetable feed, OpenStreetMap and the 2022 census; piloted in Saarland and built to scale to all of Germany.",
    note: null,
    facts: [
      { value: "3.7×", label: "longer than by car to a supermarket, median resident" },
      { value: "7", label: "everyday destinations per 500 m square" },
    ],
  },
  {
    title: "Themenkompass",
    href: "https://themenkompass.to-jacob.workers.dev",
    external: true,
    offsite: true,
    code: "https://github.com/tojacob03/Themenkompass",
    linkLabel: "Open Themenkompass",
    caseStudy: null,
    Chart: ResearchPreview,
    tags: ["Python", "OpenAlex", "TypeScript", "Cytoscape"],
    body: "Who researches what at a university, how actively and with whom: topic maps, faculty and researcher profiles, full-text search and co-author networks, built from open OpenAlex data and refreshed every month. A static site without a server, with a page that shows its own data quality and known gaps.",
    note: "In German and English.",
    facts: [
      { value: "18,278", label: "works mapped, University of Oldenburg" },
      { value: "94 of 96", label: "sample works confirmed against ORCID" },
    ],
  },
];

const more: Project[] = [
  {
    title: "Race Strategy Lab",
    href: "/race-strategy",
    linkLabel: "Open Race Strategy Lab",
    caseStudy: { href: "/work/race-strategy-lab", label: "Case study" },
    Chart: StintPreview,
    tags: ["SQL", "Postgres", "pg_cron"],
    body: "Tyre strategy, tyre wear and race pace for every Grand Prix since 2023. A database job loads each race; SQL cleans the laps and fits tyre wear per stint.",
  },
  {
    title: "Strompreis-Kompass",
    href: "/strompreis",
    linkLabel: "Open Strompreis-Kompass (German)",
    caseStudy: { href: "/work/strompreis-kompass", label: "Case study (German)" },
    Chart: PriceProfile,
    tags: ["SQL", "Postgres", "pg_cron"],
    body: "When electricity is cheapest on the exchange, how wind and solar push prices down and how often they turn negative, on official Bundesnetzagentur data refreshed every 3 hours.",
  },
  {
    title: "Waza Arc",
    href: "/arc/",
    external: true,
    linkLabel: "Open Waza Arc (German)",
    caseStudy: null,
    Chart: ArcPreview,
    tags: ["React", "TypeScript", "three.js"],
    body: "A Brazilian jiu-jitsu training log that plays like an anime RPG: log a session in about 30 seconds, and the app turns it into progress per technique, a skill branch and a 3D fighter. Try it in the demo dōjō, no account needed.",
  },
];

// min-h-11: a 44px tap target on phones; the rows sit closer to make up for it.
const linkClass = "inline-flex min-h-11 items-center gap-2 text-sm font-medium transition-colors hover:text-foreground";

const ProjectLinks = ({ p }: { p: Project }) => (
  <div className="flex flex-wrap gap-x-6">
    {p.external ? (
      <a
        href={p.href}
        {...(p.offsite ? { target: "_blank", rel: "noopener noreferrer" } : {})}
        className={`${linkClass} text-foreground`}
      >
        {p.linkLabel}
        {p.offsite && <ArrowUpRight className="h-4 w-4" />}
      </a>
    ) : (
      <Link to={p.href} className={`${linkClass} text-foreground`}>
        {p.linkLabel}
      </Link>
    )}
    {p.code && (
      <a href={p.code} target="_blank" rel="noopener noreferrer" className={`${linkClass} text-muted-foreground`}>
        Code on GitHub
        <ArrowUpRight className="h-4 w-4" />
      </a>
    )}
    {p.caseStudy && (
      <Link to={p.caseStudy.href} className={`${linkClass} text-muted-foreground`}>
        {p.caseStudy.label}
      </Link>
    )}
  </div>
);

const Tags = ({ tags }: { tags: string[] }) => (
  <p className="mt-2 text-sm text-muted-foreground">Built with {tags.join(", ")}</p>
);

// Flat surfaces: a tone step from the page, no border, gradient, shadow or hover lift.
const cardClass = "group flex flex-col border-0 bg-card/60 shadow-none";
const previewClass = "rounded-xl bg-background/60 p-4";

const FeaturedCard = ({ p }: { p: FeaturedProject }) => (
  <Card className={`${cardClass}${p.wide ? " lg:col-span-2" : ""} p-6 sm:p-8`}>
    <div className={p.wide ? "lg:grid lg:grid-cols-[1fr_1.05fr] lg:items-start lg:gap-10" : "contents"}>
      <div className={`mb-7 ${previewClass}${p.wide ? " lg:order-last lg:mb-0 lg:mt-1" : ""}`}>
        <p.Chart />
      </div>
      <div>
        <h3 className="text-2xl font-semibold text-foreground">{p.title}</h3>
        <Tags tags={p.tags} />
        <p className="mt-3 max-w-3xl leading-relaxed text-muted-foreground">{p.body}</p>
        {p.note && <p className="mt-3 text-sm leading-relaxed text-muted-foreground/80">{p.note}</p>}

        <dl className="mt-6 grid grid-cols-2 gap-4 border-t border-border/50 pt-5">
          {p.facts.map((fact) => (
            <div key={fact.label}>
              <dt className="sr-only">{fact.label}</dt>
              <dd>
                <span className="block text-xl font-semibold text-foreground">{fact.value}</span>
                <span className="text-sm text-muted-foreground">{fact.label}</span>
              </dd>
            </div>
          ))}
        </dl>

        <div className="mt-4">
          <ProjectLinks p={p} />
        </div>
      </div>
    </div>
  </Card>
);

const CompactCard = ({ p }: { p: Project }) => (
  <Card
    className={`${cardClass} w-[85%] shrink-0 snap-start p-5 sm:w-[22rem] lg:w-auto lg:shrink`}
  >
    {/* Same height for every preview, so the titles line up. */}
    <div className={`mb-5 flex min-h-60 flex-col justify-center ${previewClass}`}>
      <p.Chart />
    </div>
    <h4 className="text-xl font-semibold text-foreground">{p.title}</h4>
    <Tags tags={p.tags} />
    <p className="mt-3 flex-1 text-sm leading-relaxed text-muted-foreground">{p.body}</p>
    <div className="mt-3">
      <ProjectLinks p={p} />
    </div>
  </Card>
);

const SideProjectSection = () => {
  return (
    <section id="projects" className="scroll-mt-14 px-5 py-14 sm:px-6 sm:py-20">
      <div className="mx-auto max-w-6xl">
        <SectionIntro
          title="Other projects"
          description="The same approach as my esports tooling (collect, clean, analyse, publish), applied to electricity prices, public transport, research and sport. Each one is live."
        />

        <div className="mt-10 grid gap-4 lg:grid-cols-2">
          {featured.map((p) => (
            <FeaturedCard key={p.title} p={p} />
          ))}
        </div>

        <h3 className="mt-16 text-xl font-semibold text-foreground">More projects</h3>
        {/* Below lg a swipe row (the next card peeks in), from lg three columns.
            The negative margin lets the row run to the screen edge. */}
        <div className="-mx-5 mt-5 flex snap-x snap-mandatory scroll-px-5 gap-4 overflow-x-auto px-5 pb-3 pt-1 [scrollbar-width:none] sm:-mx-6 sm:scroll-px-6 sm:px-6 lg:mx-0 lg:grid lg:snap-none lg:grid-cols-3 lg:overflow-visible lg:px-0 lg:pb-0 lg:pt-0 [&::-webkit-scrollbar]:hidden">
          {more.map((p) => (
            <CompactCard key={p.title} p={p} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default SideProjectSection;
