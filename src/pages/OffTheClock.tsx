import { useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import SiteNav from "@/components/portfolio/SiteNav";
import Footer from "@/components/portfolio/Footer";
import FragranceChapter from "@/components/offTheClock/FragranceChapter";
import MatAtlas from "@/components/offTheClock/MatAtlas";
import CoffeeJourney from "@/components/offTheClock/CoffeeJourney";
import Book3D from "@/components/offTheClock/Book3D";
import { BJJ, COFFEE, READING } from "@/data/offTheClock";
import { EASE } from "@/lib/motion";

// The four chapters are not a sequence, so they carry a name, not a number.
const Chapter = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <section className="border-t border-border/60 py-16 sm:py-20">
    <div className="grid gap-6 lg:grid-cols-12 lg:gap-8">
      <p className="text-sm font-medium text-foreground lg:col-span-3">{label}</p>
      <div className="lg:col-span-9">{children}</div>
    </div>
  </section>
);

const OffTheClock = () => {
  useEffect(() => {
    const previous = document.title;
    document.title = "Off the clock | Rukawa Analytics";
    return () => {
      document.title = previous;
    };
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <SiteNav />
      <main id="main" tabIndex={-1} className="outline-none mx-auto max-w-7xl px-5 sm:px-8">
        <header className="pb-16 pt-16 sm:pb-24 sm:pt-24">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" /> Back to the work
          </Link>
          <h1 className="mt-12 overflow-hidden text-[clamp(3.5rem,11vw,10rem)] font-semibold leading-[0.9] tracking-[-0.05em] text-foreground">
            <motion.span
              className="block"
              initial={{ y: "105%" }}
              animate={{ y: "0%" }}
              transition={{ duration: 1, ease: EASE }}
            >
              Off the clock.
            </motion.span>
          </h1>
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3, ease: EASE }}
            className="mt-8 max-w-2xl text-lg leading-relaxed text-muted-foreground sm:text-xl"
          >
            What I do when I am not reading battle logs. Different arenas, same habit: study the position, then commit.
          </motion.p>
        </header>

        <Chapter label="Grappling">
          <h2 className="text-4xl font-semibold leading-[1.02] tracking-tight text-foreground sm:text-6xl">
            Positions before submissions.
          </h2>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground">
            Brazilian jiu-jitsu and submission grappling, almost all of it without the gi. On the mat it is positional
            chess under pressure: you drill a situation until the right decision comes without thinking. It is the same
            idea behind preparing a set.
          </p>

          <p className="mt-4 max-w-2xl text-lg leading-relaxed text-foreground">
            On the mat since {BJJ.since}, {BJJ.belt.toLowerCase()} working towards {BJJ.goal.toLowerCase()}. Home gym:{" "}
            {BJJ.home}.
          </p>

          <div className="mt-10">
            <p className="text-sm text-muted-foreground">Current favourite</p>
            <p className="mt-1 text-2xl font-semibold text-foreground">{BJJ.favourite}</p>
            <p className="mt-2 text-sm text-foreground/90">{BJJ.favouriteExplainer}</p>
            <p className="mt-1 text-sm text-muted-foreground">Changes about as often as the meta.</p>
          </div>

          <MatAtlas />
        </Chapter>

        <Chapter label="Coffee">
          <h2 className="text-4xl font-semibold leading-[1.02] tracking-tight text-foreground sm:text-6xl">
            {COFFEE.method}. Always.
          </h2>
          <div className="mt-8 max-w-xl rounded-2xl border border-border/60 bg-card/40 p-6 sm:p-8">
            <div className="flex items-baseline justify-between gap-4 border-b border-dashed border-border pb-4">
              <p className="text-sm text-muted-foreground">In the grinder</p>
              <p className="text-sm text-muted-foreground">{COFFEE.note}</p>
            </div>
            <p className="mt-5 text-3xl font-semibold tracking-tight text-foreground">{COFFEE.bean}</p>
            <dl className="mt-6 grid grid-cols-3 gap-4 text-sm">
              <div>
                <dt className="text-muted-foreground">Roaster</dt>
                <dd className="mt-1 font-medium text-foreground">{COFFEE.roaster}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">From</dt>
                <dd className="mt-1 font-medium text-foreground">{COFFEE.from}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Method</dt>
                <dd className="mt-1 font-medium text-foreground">{COFFEE.method}</dd>
              </div>
            </dl>
          </div>
          <CoffeeJourney />
        </Chapter>

        <Chapter label="Reading">
          <div className="flex flex-col gap-8 sm:flex-row sm:items-start sm:gap-10">
            <Book3D title={READING.title} author={READING.author} year={READING.year} />
            <div>
              <h2 className="text-4xl font-semibold leading-[1.02] tracking-tight text-foreground sm:text-5xl">
                {READING.title}
              </h2>
              <p className="mt-2 text-lg text-foreground/80">
                {READING.author}, {READING.year}
              </p>
              <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground">
                Poirot&apos;s first case. Small details, ruled-out suspects and one answer left at the end. Not far from
                working out which deck is still in someone&apos;s hand.
              </p>
              {READING.previous.length > 0 && (
                <div className="mt-8">
                  <h3 className="text-sm text-muted-foreground">Read before</h3>
                  <ul className="mt-2 space-y-1 text-sm">
                    {READING.previous.map((b) => (
                      <li key={b.title} className="text-foreground">
                        {b.title}, <span className="text-muted-foreground">{b.author}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </Chapter>

        <Chapter label="Fragrance">
          <FragranceChapter />
        </Chapter>

        <section className="border-t border-border/60 py-16 sm:py-20">
          <p className="text-2xl font-semibold text-foreground sm:text-3xl">Back to the day job?</p>
          <div className="mt-6 flex flex-wrap gap-x-8 gap-y-3 text-sm font-medium">
            <Link to="/#work" className="text-foreground underline decoration-foreground/30 underline-offset-4 transition-colors hover:decoration-foreground">
              See the analysis system
            </Link>
            <Link to="/#contact" className="text-muted-foreground transition-colors hover:text-foreground">
              Say hi
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default OffTheClock;
