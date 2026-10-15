type SectionIntroProps = {
  title: string;
  description?: string;
  align?: "left" | "center";
  titleClassName?: string;
  descriptionClassName?: string;
};

// Heading and description only. No eyebrow or rule above the heading: every
// section opening the same way made the page read like a template, and the
// labels repeated what the heading and the nav already say. No entrance
// animation either: a fade-up on every section read as a template too.
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
    <div className={centered ? "text-center" : ""}>
      <h2 className={`${titleClassName} ${centered ? "mx-auto" : ""}`}>{title}</h2>

      {description && <p className={`${descriptionClassName} ${centered ? "mx-auto" : ""}`}>{description}</p>}
    </div>
  );
};

export default SectionIntro;
