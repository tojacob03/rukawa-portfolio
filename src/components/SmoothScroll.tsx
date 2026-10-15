import { useEffect } from "react";
import Lenis from "lenis";
import { setLenis } from "@/lib/smoothScroll";

/**
 * Site-wide smooth scrolling.
 *
 * Lenis animates the NATIVE scroll position - it never transforms <body> or
 * a wrapper - so position:fixed and position:sticky keep resolving against
 * the viewport. It runs its own animation frame loop (autoRaf); nothing on
 * the portfolio needs GSAP's ticker any more, so GSAP stays out of the
 * main bundle (Waza Arc still uses it in its own bundle).
 */
const SmoothScroll = () => {
  useEffect(() => {
    // Respect the OS-level reduced-motion setting: plain native scrolling.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const lenis = new Lenis({
      duration: 1.15,
      // Exponential ease-out - fast start, long gentle settle.
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      // Touch devices keep native momentum scrolling; hijacking it tends
      // to feel worse than the platform default.
      syncTouch: false,
      autoRaf: true,
    });

    setLenis(lenis);

    return () => {
      lenis.destroy();
      setLenis(null);
    };
  }, []);

  return null;
};

export default SmoothScroll;
