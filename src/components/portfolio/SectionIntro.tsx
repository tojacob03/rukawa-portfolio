import { motion } from "framer-motion";

type SectionIntroProps = {
  title: string;
  description?: string;
  align?: "left" | "center";
  titleClassName?: string;
  descriptionClassName?: string;
};

// Shared easing across the site's motion language (matches --ease-out-expo).
const EASE = [0.16, 1, 0.3, 1] as const;

// Heading and description only. No eyebrow or rule above the heading: every
// section opening the same way made the page read like a template, and the
// labels repeated what the heading and the nav already say.
const SectionIntro = ({
  title,
  description,
  align = "left",
  // Display scale carries its own tracking/leading - no font-bold here, the
  // display face at 600 reads stronger and cleaner than a faux-bolded 700.
  titleClassName = "text-display-md font-semibold",
  descriptionClassName = "mt-5 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg",
}: SectionIntroProps) => {
  const centered = align === "center";

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.45 }}
      variants={{
        hidden: {},
        visible: {
          transition: {
            staggerChildren: 0.08,
          },
        },
      }}
      className={centered ? "text-center" : ""}
    >
      <motion.h2
        variants={{
          hidden: { opacity: 0, y: 12 },
          visible: { opacity: 1, y: 0 },
        }}
        transition={{ duration: 0.6, ease: EASE }}
        className={`${titleClassName} ${centered ? "mx-auto" : ""}`}
      >
        {title}
      </motion.h2>

      {description && (
        <motion.p
          variants={{
            hidden: { opacity: 0, y: 10 },
            visible: { opacity: 1, y: 0 },
          }}
          transition={{ duration: 0.5, ease: EASE }}
          className={`${descriptionClassName} ${centered ? "mx-auto" : ""}`}
        >
          {description}
        </motion.p>
      )}
    </motion.div>
  );
};

export default SectionIntro;
