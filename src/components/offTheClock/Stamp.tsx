import { useId, type CSSProperties, type ReactNode } from "react";

// Passport stamps, drawn as SVG. The rough ink comes from one shared filter
// (PassportDefs), so every stamp looks pressed rather than printed.

export type StampShape = "round" | "rect" | "oval" | "octagon";

const FONT = "Geist, ui-sans-serif, system-ui, sans-serif";

/** Squeeze a line into `width` instead of letting it run out of the frame. */
const fit = (text: string, size: number, width: number) =>
  text.length * size * 0.6 > width ? { textLength: width, lengthAdjust: "spacingAndGlyphs" as const } : {};

type Row = { text: string; size: number; weight: number; spacing?: number };

/** Centred lines stacked around `centerY`. */
const Stack = ({ rows, width, centerY = 0 }: { rows: Row[]; width: number; centerY?: number }) => {
  const heights = rows.map((r) => r.size * 1.25);
  let y = centerY - heights.reduce((a, b) => a + b, 0) / 2;
  return (
    <>
      {rows.map((r, i) => {
        y += heights[i];
        return (
          <text
            key={i}
            x={0}
            y={y - r.size * 0.28}
            textAnchor="middle"
            fontSize={r.size}
            fontWeight={r.weight}
            letterSpacing={r.spacing ?? 0}
            {...fit(r.text, r.size + (r.spacing ?? 0), width)}
          >
            {r.text}
          </text>
        );
      })}
    </>
  );
};

type StampArtProps = {
  shape: StampShape;
  ink: string;
  top: string;
  main: string;
  sub?: string[];
  bottom: string;
};

export const StampArt = ({ shape, ink, top, main, sub = [], bottom }: StampArtProps) => {
  const id = useId().replace(/:/g, "");

  if (shape === "round") {
    return (
      <svg viewBox="-60 -60 120 120" aria-hidden="true">
        <g filter="url(#pp-ink)" fill={ink} stroke={ink}>
          <circle r={56} fill="none" strokeWidth={3} />
          <circle r={44} fill="none" strokeWidth={1.1} />
          <path id={`${id}t`} d="M -50 0 A 50 50 0 0 1 50 0" fill="none" stroke="none" />
          <path id={`${id}b`} d="M -50 0 A 50 50 0 0 0 50 0" fill="none" stroke="none" />
          <g stroke="none" fontFamily={FONT}>
            <text fontSize={9} fontWeight={600} letterSpacing={2} dominantBaseline="middle">
              <textPath href={`#${id}t`} startOffset="50%" textAnchor="middle">
                {top}
              </textPath>
            </text>
            <text fontSize={8.5} fontWeight={600} letterSpacing={1.6} dominantBaseline="middle">
              <textPath href={`#${id}b`} startOffset="50%" textAnchor="middle">
                {bottom}
              </textPath>
            </text>
            <Stack
              width={76}
              rows={[{ text: main, size: 15, weight: 700 }, ...sub.map((text) => ({ text, size: 7.4, weight: 500 }))]}
            />
          </g>
        </g>
      </svg>
    );
  }

  const frame =
    shape === "rect" ? (
      <>
        <rect x={-78} y={-48} width={156} height={96} rx={7} fill="none" strokeWidth={3} />
        <rect x={-71} y={-41} width={142} height={82} rx={4} fill="none" strokeWidth={1} />
      </>
    ) : shape === "oval" ? (
      <>
        <ellipse rx={78} ry={48} fill="none" strokeWidth={3} />
        <ellipse rx={70} ry={40} fill="none" strokeWidth={1} />
      </>
    ) : (
      <>
        <polygon points="-56,-48 56,-48 78,-26 78,26 56,48 -56,48 -78,26 -78,-26" fill="none" strokeWidth={3} />
        <polygon points="-51,-41 51,-41 70,-23 70,23 51,41 -51,41 -70,23 -70,-23" fill="none" strokeWidth={1} />
      </>
    );

  return (
    <svg viewBox="-80 -50 160 100" aria-hidden="true">
      <g filter="url(#pp-ink)" fill={ink} stroke={ink}>
        {frame}
        <g stroke="none" fontFamily={FONT}>
          <Stack
            width={shape === "oval" ? 112 : 128}
            rows={[
              { text: top, size: 8.5, weight: 600, spacing: 1.6 },
              { text: main, size: 17, weight: 700 },
              ...sub.map((text) => ({ text, size: 8, weight: 500 })),
              { text: bottom, size: 8.5, weight: 600, spacing: 1.4 },
            ]}
          />
        </g>
      </g>
    </svg>
  );
};

/** One logged day in the fragrance calendar: a small round stamp with the date. */
export const DayStampArt = ({ ink, day, today }: { ink: string; day: number; today: boolean }) => (
  <svg viewBox="-30 -30 60 60" aria-hidden="true">
    <g filter="url(#pp-ink)">
      <circle r={25} fill="none" stroke={ink} strokeWidth={today ? 4 : 2.6} />
      <circle r={19} fill="none" stroke={ink} strokeWidth={1} />
      <text y={6} textAnchor="middle" fontSize={16} fontWeight={700} fill="hsl(var(--foreground))" fontFamily={FONT}>
        {day}
      </text>
    </g>
  </svg>
);

/**
 * A stamp the visitor can pick. Position, size and tilt come from the page;
 * `order` staggers the landing when the page is first shown.
 */
export const StampButton = ({
  label,
  onSelect,
  style,
  rotate = 0,
  order = 0,
  className = "",
  children,
}: {
  label: string;
  onSelect: () => void;
  style?: CSSProperties;
  rotate?: number;
  order?: number;
  className?: string;
  children: ReactNode;
}) => (
  <button
    type="button"
    className={`pp-stamp ${className}`}
    aria-label={label}
    onClick={onSelect}
    style={{ ...style, ["--r" as string]: `${rotate}deg`, ["--i" as string]: order }}
  >
    {children}
  </button>
);

/** Shared SVG definitions: the ink filter and the security print on every page. */
export const PassportDefs = () => (
  <svg width="0" height="0" className="absolute" aria-hidden="true">
    <defs>
      <filter id="pp-ink" x="-8%" y="-8%" width="116%" height="116%">
        <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves={2} seed={7} result="noise" />
        <feDisplacementMap in="SourceGraphic" in2="noise" scale={1.8} xChannelSelector="R" yChannelSelector="G" result="rough" />
        <feTurbulence type="fractalNoise" baseFrequency="0.35" numOctaves={1} seed={2} result="patch" />
        <feComponentTransfer in="patch" result="holes">
          <feFuncA type="discrete" tableValues="1 1 1 1 0.35 1 1 1 1 0.55" />
        </feComponentTransfer>
        <feComposite in="rough" in2="holes" operator="in" />
      </filter>
      <pattern id="pp-guilloche" width="64" height="24" patternUnits="userSpaceOnUse">
        <path d="M0 12 C 16 0, 32 24, 48 12 S 64 0, 80 12" fill="none" stroke="var(--pp-guilloche)" strokeWidth={1} />
        <path d="M0 18 C 16 6, 32 30, 48 18 S 64 6, 80 18" fill="none" stroke="var(--pp-guilloche)" strokeWidth={0.6} />
      </pattern>
    </defs>
  </svg>
);
