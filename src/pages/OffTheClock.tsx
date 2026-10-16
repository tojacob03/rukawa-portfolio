import { useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import SiteNav from "@/components/portfolio/SiteNav";
import Footer from "@/components/portfolio/Footer";
import Passport from "@/components/offTheClock/Passport";
import { EASE } from "@/lib/motion";

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
        <header className="pb-10 pt-12 sm:pb-12 sm:pt-16">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" /> Back to the work
          </Link>
          <h1 className="mt-10 overflow-hidden text-[clamp(3rem,7vw,5.5rem)] font-semibold leading-[0.95] tracking-[-0.045em] text-foreground">
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
            className="mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground sm:text-xl"
          >
            What I do when I am not reading battle logs. Different arenas, same habit: study the position, then commit.
            Everything in this passport is logged.
          </motion.p>
        </header>

        <section aria-label="Passport" className="pb-20 sm:pb-24">
          <Passport />
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default OffTheClock;
