import SectionIntro from "@/components/portfolio/SectionIntro";
import ContributionGraph from "@/components/portfolio/ContributionGraph";

// Replaces the former About, Method and Stack sections, which told the same
// story three times.
const METHOD = [
  {
    title: "Battle-log profiling",
    body: "Official API ingest across main and alt tags, stored battles, season and mode filters.",
  },
  {
    title: "Duel & Game 1 models",
    body: "Detect CRL and friendly duels and read first-game deck habits in Bo3 and Bo5.",
  },
  {
    title: "Remaining-deck support",
    body: "Score what a player still has after burned cards, mid-set and under time pressure.",
  },
  {
    title: "Prep hub",
    body: "Tools around the same data: draft practice, clutch scenarios, tower math.",
  },
];

const STACK = [
  "React",
  "TypeScript",
  "Supabase",
  "PostgreSQL",
  "pg_cron",
  "SQL",
  "Python (Pandas)",
  "Claude Code",
  "GitHub Actions",
  "Tailwind",
  "Framer Motion",
  "GSAP",
];

const ApproachSection = () => (
  <section id="method" className="scroll-mt-14 px-5 py-20 sm:px-6 sm:py-28">
    <div className="mx-auto grid max-w-7xl gap-14 lg:grid-cols-12">
      <div className="lg:col-span-5">
        <SectionIntro
          title="Analysis only counts if it changes the next game."
          description="I turn scattered match history into a smaller, sharper set of decisions: what a player tends to do, what is already exposed, and what is still worth planning around."
        />

        <div className="mt-10 rounded-2xl bg-card/60 p-6">
          <h3 className="text-lg font-semibold text-foreground">How I build</h3>
          <p className="mt-3 leading-relaxed text-foreground/90">
            I decide what gets built and design the data model and the analysis logic. Coding agents write most of
            the code, first in Lovable and today mainly Claude Code. I review every change, and CI checks lint,
            types and the build before anything ships. I run the systems myself: scheduled data jobs, database
            migrations, access rules, privacy retention.
          </p>
          <p className="mt-5 text-sm leading-relaxed text-muted-foreground">Stack: {STACK.join(", ")}</p>
          <ContributionGraph />
        </div>
      </div>

      {/* A plain list: the three steps above already tell the story, so these
          read as a toolkit, not as numbered cards. */}
      <ul className="self-start border-t border-border/60 lg:col-span-7">
        {METHOD.map((m) => (
          <li
            key={m.title}
            className="grid gap-1 border-b border-border/60 py-6 sm:grid-cols-[13rem_1fr] sm:gap-8 sm:py-7"
          >
            <h3 className="text-lg font-semibold text-foreground">{m.title}</h3>
            <p className="leading-relaxed text-muted-foreground">{m.body}</p>
          </li>
        ))}
      </ul>
    </div>
  </section>
);

export default ApproachSection;
