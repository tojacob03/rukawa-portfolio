import { useId, type CSSProperties, type ReactNode } from "react";

// Passport stamps, drawn as SVG. The rough ink comes from one shared filter
// (PassportDefs), so every stamp looks pressed rather than printed.

export type StampShape = "round" | "rect" | "oval" | "octagon";

const FONT = "Geist, ui-sans-serif, system-ui, sans-serif";

/** Squeeze a line into `width` instead of letting it run out of the frame. */
const fit = (text: string, size: number, width: number) =>
  text.length * size * 0.6 > width ? { textLength: width, lengthAdjust: "spacingAndGlyphs" as const } : {};

type Row = { text: string; size: number; weight: number; spacing?: number };
type Line = Row & { y: number };

/** Centred lines stacked around `centerY`, each with the baseline it sits on. */
const stack = (rows: Row[], centerY = 0): Line[] => {
  const heights = rows.map((r) => r.size * 1.25);
  let y = centerY - heights.reduce((a, b) => a + b, 0) / 2;
  return rows.map((r, i) => {
    y += heights[i];
    return { ...r, y: y - r.size * 0.28 };
  });
};

const Lines = ({ lines, width }: { lines: Line[]; width: number }) => (
  <>
    {lines.map((r) => (
      <text
        key={r.y}
        x={0}
        y={r.y}
        textAnchor="middle"
        fontSize={r.size}
        fontWeight={r.weight}
        letterSpacing={r.spacing ?? 0}
        {...fit(r.text, r.size + (r.spacing ?? 0), width)}
      >
        {r.text}
      </text>
    ))}
  </>
);

/** Small print (gym names, coffee steps) takes the finer ink, so it stays legible. */
const SUB = { size: 10, weight: 600 };
const ROUND_SUB = { size: 9.5, weight: 600 };

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
    const lines = stack([{ text: main, size: 15, weight: 700 }, ...sub.map((text) => ({ text, ...ROUND_SUB }))]);
    return (
      <svg viewBox="-60 -60 120 120" aria-hidden="true">
        <g filter="url(#pp-ink)" fill={ink} stroke={ink}>
          <circle r={56} fill="none" strokeWidth={3} />
          <circle r={44} fill="none" strokeWidth={1.1} />
          {/* Capitals grow away from their baseline: outwards on the top arc, inwards on the
              bottom one. So the top baseline sits near the inner ring and the bottom one near
              the outer ring, and both lines of text stay between the rings. */}
          <path id={`${id}t`} d="M -46.5 0 A 46.5 46.5 0 0 1 46.5 0" fill="none" stroke="none" />
          <path id={`${id}b`} d="M -52 0 A 52 52 0 0 0 52 0" fill="none" stroke="none" />
          <g stroke="none" fontFamily={FONT}>
            <text fontSize={8.5} fontWeight={600} letterSpacing={1.8}>
              <textPath href={`#${id}t`} startOffset="50%" textAnchor="middle">
                {top}
              </textPath>
            </text>
            <text fontSize={8} fontWeight={600} letterSpacing={1.5}>
              <textPath href={`#${id}b`} startOffset="50%" textAnchor="middle">
                {bottom}
              </textPath>
            </text>
            <Lines lines={lines.slice(0, 1)} width={76} />
          </g>
        </g>
        <g filter="url(#pp-ink-fine)" fill={ink} fontFamily={FONT}>
          <Lines lines={lines.slice(1)} width={76} />
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

  const width = shape === "oval" ? 112 : 128;
  const lines = stack([
    { text: top, size: 8.5, weight: 600, spacing: 1.6 },
    { text: main, size: 17, weight: 700 },
    ...sub.map((text) => ({ text, ...SUB })),
    { text: bottom, size: 8.5, weight: 600, spacing: 1.4 },
  ]);
  const fine = lines.slice(2, 2 + sub.length);

  return (
    <svg viewBox="-80 -50 160 100" aria-hidden="true">
      <g filter="url(#pp-ink)" fill={ink} stroke={ink}>
        {frame}
        <g stroke="none" fontFamily={FONT}>
          <Lines lines={lines.filter((l) => !fine.includes(l))} width={width} />
        </g>
      </g>
      <g filter="url(#pp-ink-fine)" fill={ink} fontFamily={FONT}>
        <Lines lines={fine} width={width} />
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
      <text y={6} textAnchor="middle" fontSize={16} fontWeight={700} fill="var(--pp-ink)" fontFamily={FONT}>
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

/** Shared SVG definitions: the ink filter, the security print on every page and the cover's foil. */
export const PassportDefs = () => (
  <svg width="0" height="0" className="absolute" aria-hidden="true">
    <defs>
      <filter id="pp-ink" x="-8%" y="-8%" width="116%" height="116%">
        <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves={2} seed={7} result="noise" />
        <feDisplacementMap in="SourceGraphic" in2="noise" scale={1.6} xChannelSelector="R" yChannelSelector="G" result="rough" />
        <feTurbulence type="fractalNoise" baseFrequency="0.4" numOctaves={1} seed={2} result="patch" />
        <feComponentTransfer in="patch" result="holes">
          <feFuncA type="discrete" tableValues="1 1 1 1 0.4 1 1 1 1 0.6" />
        </feComponentTransfer>
        <feComposite in="rough" in2="holes" operator="in" />
      </filter>
      {/* The same ink, pressed lighter: for small print that the full roughness would break up. */}
      <filter id="pp-ink-fine" x="-8%" y="-8%" width="116%" height="116%">
        <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves={2} seed={7} result="noise" />
        <feDisplacementMap in="SourceGraphic" in2="noise" scale={0.6} xChannelSelector="R" yChannelSelector="G" result="rough" />
        <feTurbulence type="fractalNoise" baseFrequency="0.4" numOctaves={1} seed={2} result="patch" />
        <feComponentTransfer in="patch" result="holes">
          <feFuncA type="discrete" tableValues="1 1 1 1 0.75 1 1 1 1 0.85" />
        </feComponentTransfer>
        <feComposite in="rough" in2="holes" operator="in" />
      </filter>
      <pattern id="pp-guilloche" width="72" height="26" patternUnits="userSpaceOnUse">
        <path d="M0 13 C 18 0, 36 26, 54 13 S 72 0, 90 13" fill="none" stroke="var(--pp-guilloche)" strokeWidth={0.8} />
        <path d="M0 20 C 18 7, 36 33, 54 20 S 72 7, 90 20" fill="none" stroke="var(--pp-guilloche)" strokeWidth={0.5} />
      </pattern>
      <linearGradient id="pp-foil" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor="#A8823A" />
        <stop offset="0.4" stopColor="#EBD28C" />
        <stop offset="0.6" stopColor="#C49A4A" />
        <stop offset="1" stopColor="#E8CF88" />
      </linearGradient>
    </defs>
  </svg>
);
