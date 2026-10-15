import { type ReactNode } from "react";
import { motion } from "framer-motion";
import { EASE } from "@/lib/motion";

/**
 * Wraps a route's content so it cross-fades on navigation. Paired with
 * <AnimatePresence mode="wait"> in App.tsx, which holds the outgoing page
 * until its exit finishes before mounting the next one.
 *
 * DELIBERATELY OPACITY-ONLY - do not add transform/filter/blur here.
 * Any element with a `transform` or `filter` becomes the containing block
 * for `position: fixed` descendants and can break `position: sticky`
 * (the nav, the scroll story). And framer-motion leaves `filter: blur(0px)`
 * on the node after the animation settles - still a filter value, still a
 * containing block - so the breakage outlives the transition.
 *
 * `opacity` creates a stacking context but NOT a containing block for
 * fixed positioning, so it is safe to animate here.
 */
const PageTransition = ({ children }: { children: ReactNode }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    transition={{
      duration: 0.45,
      ease: EASE,
      // Exit is quicker than enter: a slow fade-out feels sluggish, a slow
      // fade-in feels considered.
      exit: { duration: 0.25, ease: "easeIn" },
    }}
  >
    {children}
  </motion.div>
);

export default PageTransition;
