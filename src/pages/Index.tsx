import { useEffect } from "react";
import { scrollToSection } from "@/lib/smoothScroll";
import SiteNav from "@/components/portfolio/SiteNav";
import KineticHero from "@/components/portfolio/KineticHero";
import MetaPulse from "@/components/portfolio/MetaPulse";
import SystemStory from "@/components/portfolio/SystemStory";
import ApproachSection from "@/components/portfolio/ApproachSection";
import SideProjectSection from "@/components/portfolio/SideProjectSection";
import TeamHistorySection from "@/components/portfolio/TeamHistorySection";
import AchievementsSection from "@/components/portfolio/AchievementsSection";
import ShanghaiRoadmap from "@/components/portfolio/ShanghaiRoadmap";
import TestimonialsSection from "@/components/portfolio/TestimonialsSection";
import OffTheClockTeaser from "@/components/portfolio/OffTheClockTeaser";
import ContactSection from "@/components/portfolio/ContactSection";
import Footer from "@/components/portfolio/Footer";

const Index = () => {
  // Handles arriving here as /#section-id (e.g. from SiteNav on a case study
  // page). The section only exists once Index has mounted.
  // The short delay lets the page lay out before the jump is measured.
  useEffect(() => {
    const hash = window.location.hash?.replace("#", "");
    if (!hash) return;
    const timer = setTimeout(() => scrollToSection(hash), 350);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <SiteNav />
      <main id="main" tabIndex={-1} className="outline-none">
        <KineticHero />
        <MetaPulse />
        <SystemStory />
        <ApproachSection />
        <SideProjectSection />
        <TeamHistorySection />
        <AchievementsSection />
        <ShanghaiRoadmap />
        <TestimonialsSection />
        <OffTheClockTeaser />
        <ContactSection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
