import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { scrollToSection, scrollToTop } from "@/lib/smoothScroll";

const links = [
  { id: "work", label: "Work" },
  { id: "method", label: "Method" },
  { id: "projects", label: "Projects" },
  { id: "experience", label: "Experience" },
  { id: "contact", label: "Contact" },
];

const SiteNav = () => {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Section ids only exist on the homepage. From any other route (e.g. a
  // case study), navigate home with the target hash instead, and let
  // Index.tsx's hash-scroll effect handle scrolling once it has mounted.
  // On the homepage, scrolling goes through Lenis (scrollToSection) so it
  // uses the same smooth motion as wheel scrolling instead of the browser's
  // own smooth-scroll, which would fight Lenis' interpolation.
  const goToSection = (id: string) => {
    setOpen(false);
    if (location.pathname === "/") {
      // The open mobile menu sits in the sticky nav and pushes the page
      // down; measuring the target while it's still open made every jump
      // land short by the menu's height. Scroll once it has closed.
      requestAnimationFrame(() => requestAnimationFrame(() => scrollToSection(id)));
    } else {
      navigate(`/#${id}`);
    }
  };

  const goHome = () => {
    setOpen(false);
    if (location.pathname === "/") {
      scrollToTop();
    } else {
      navigate("/");
    }
  };

  return (
    <nav className="sticky top-0 z-50 border-b border-border/50 bg-background/90 backdrop-blur-md">
      {/* First stop for keyboard users: past the nav, straight to the page's
          <main id="main">. Hidden until focused. */}
      <a
        href="#main"
        onClick={(e) => {
          e.preventDefault();
          document.getElementById("main")?.focus({ preventScroll: true });
          scrollToSection("main");
        }}
        className="sr-only rounded-full bg-foreground text-sm font-semibold text-background focus:not-sr-only focus:absolute focus:left-4 focus:top-2 focus:z-[60] focus:px-4 focus:py-2.5"
      >
        Skip to content
      </a>
      <div className="w-full px-5 sm:px-8 lg:px-12 xl:px-16 h-14 flex items-center justify-between gap-4">
        <button type="button" onClick={goHome} className="-mx-2 flex h-11 items-center px-2 text-lg font-bold text-foreground">
          Rukawa
        </button>
        <div className="hidden sm:flex items-center gap-6">
          {links.map((link) => (
            <button
              key={link.id}
              type="button"
              onClick={() => goToSection(link.id)}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              {link.label}
            </button>
          ))}
          <span className="h-4 w-px bg-border" aria-hidden />
          <Link
            to="/off-the-clock"
            className={`text-sm transition-colors ${
              location.pathname === "/off-the-clock" ? "text-foreground" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Off the clock
          </Link>
        </div>
        <button
          type="button"
          className="-mr-3 flex h-11 min-w-11 items-center justify-center px-3 text-sm text-muted-foreground sm:hidden"
          aria-expanded={open}
          aria-label="Menu"
          onClick={() => setOpen((v) => !v)}
        >
          Menu
        </button>
      </div>
      {open && (
        <div className="sm:hidden border-t border-border/50 px-5 py-1 flex flex-col bg-background">
          {links.map((link) => (
            <button
              key={link.id}
              type="button"
              onClick={() => goToSection(link.id)}
              className="flex min-h-11 items-center text-left text-sm text-muted-foreground"
            >
              {link.label}
            </button>
          ))}
          <Link
            to="/off-the-clock"
            onClick={() => setOpen(false)}
            className="flex min-h-11 items-center border-t border-border/50 text-sm text-foreground"
          >
            Off the clock
          </Link>
        </div>
      )}
    </nav>
  );
};

export default SiteNav;
