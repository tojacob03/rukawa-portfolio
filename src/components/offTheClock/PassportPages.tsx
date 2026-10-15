import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { BJJ, COFFEE, READING, type MatPhoto } from "@/data/offTheClock";
import { addDays, colorOf, fmtWeekday, fragranceColors, isoWeekday, OTHER_COLOR, type FragranceStatus } from "@/lib/fragrance";
import { DayStampArt, StampArt, StampButton, type StampShape } from "@/components/offTheClock/Stamp";
import { COFFEE_LEGS, COFFEE_TOTAL, COUNTRIES, FARTHEST, GYM_STAMPS, splitLine } from "@/components/offTheClock/passportData";

// The pages of the Off the clock passport. Gyms, coffee and the book come
// from src/data/offTheClock.ts; the two fragrance pages read the live log.

export type Detail =
  | { kind: "gym"; gym: string; city: string; country: string; km: number; home: boolean; photo?: MatPhoto }
  | { kind: "coffee"; step: number }
  | { kind: "book" }
  | { kind: "scent"; date: string; name: string; house: string | null; times: number }
  | { kind: "declared"; bottles: number; houses: number; notStated: number };

export type FragranceQuery = { data?: FragranceStatus; isLoading: boolean; isError: boolean };

export type PageProps = {
  side: "left" | "right" | "single";
  inked: boolean;
  onSelect: (detail: Detail) => void;
  fragrance: FragranceQuery;
};

const nf = new Intl.NumberFormat("en-US");
const dayMonth = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", timeZone: "UTC" });
const longDate = new Intl.DateTimeFormat("en-GB", { weekday: "long", day: "numeric", month: "long", timeZone: "UTC" });
const asDate = (iso: string) => new Date(`${iso}T12:00:00Z`);

const GOLD = "hsl(var(--clash-gold))";
const INKS = [
  "hsl(var(--clash-blue))",
  "hsl(var(--negative))",
  "hsl(var(--clash-purple))",
  "hsl(var(--positive))",
  "hsl(var(--clash-silver))",
];
const SHAPES: StampShape[] = ["round", "rect", "oval", "octagon"];

// ---------- page frame ----------

const Sheet = ({ n, side, inked, className = "", children }: { n?: number; side: PageProps["side"]; inked: boolean; className?: string; children: ReactNode }) => (
  <div className={`pp-page pp-page-${side}${inked ? " is-inked" : ""} ${className}`}>
    <svg className="pp-print" aria-hidden="true">
      <rect width="100%" height="100%" fill="url(#pp-guilloche)" />
    </svg>
    {children}
    {n !== undefined && <span className="pp-num">{n}</span>}
  </div>
);

// ---------- cover ----------

export const Cover = ({ onOpen }: { onOpen: () => void }) => (
  <button type="button" className="pp-cover" onClick={onOpen} aria-label="Open the passport">
    <span className="pp-foil-top">PASSPORT</span>
    <span className="grid justify-items-center gap-[18px]">
      <svg width="112" height="112" viewBox="-60 -60 120 120" aria-hidden="true" fill="none" stroke={GOLD} strokeWidth={1.6}>
        <circle r={52} />
        <ellipse rx={22} ry={52} />
        <ellipse rx={40} ry={52} />
        <path d="M-52 0 H52 M-46 -24 H46 M-46 24 H46" />
        <circle cx={-14} cy={-30} r={3.2} fill={GOLD} />
      </svg>
      <span className="pp-cover-title">Off the clock</span>
      <span className="pp-foil-sub">RUKAWA</span>
    </span>
    <span className="grid justify-items-center gap-3.5">
      <span className="pp-chip" aria-hidden="true" />
      <span className="pp-cover-hint">Open the passport</span>
    </span>
  </button>
);

// ---------- 1: holder ----------

/** Machine readable zone: capitals and digits, everything else a filler "<". */
const mrz = (s: string) =>
  s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toUpperCase()
    .replace(/[^A-Z0-9<]/g, "<")
    .padEnd(44, "<")
    .slice(0, 44);

export const HolderPage = ({ side, inked }: PageProps) => (
  <Sheet n={1} side={side} inked={inked}>
    <h2 className="pp-h">Holder</h2>
    <dl className="pp-fields">
      <div>
        <dt>Name</dt>
        <dd>Till Oscar Jacob</dd>
      </div>
      <div>
        <dt>Known as</dt>
        <dd>Rukawa</dd>
      </div>
      <div className="pp-wide">
        <dt>Discipline</dt>
        <dd>Brazilian jiu-jitsu, {BJJ.style.charAt(0).toLowerCase() + BJJ.style.slice(1)}</dd>
      </div>
      <div>
        <dt>On the mat since</dt>
        <dd>{BJJ.since}</dd>
      </div>
      <div>
        <dt>Rank</dt>
        <dd>{BJJ.belt}</dd>
      </div>
      <div>
        <dt>Next rank</dt>
        <dd>{BJJ.goal}</dd>
      </div>
      <div>
        <dt>Home mat</dt>
        <dd>{BJJ.home}</dd>
      </div>
      <div className="pp-wide">
        <dt>Current favourite</dt>
        <dd className="font-medium">
          {BJJ.favourite}, {BJJ.favouriteExplainer.charAt(0).toLowerCase() + BJJ.favouriteExplainer.slice(1)} Changes about
          as often as the meta.
        </dd>
      </div>
    </dl>
    <div className="pp-mrz" aria-label="Machine readable zone">
      {mrz("P<OTC<JACOB<<TILL<OSCAR<<RUKAWA")}
      <br />
      {mrz(`NOGI<${BJJ.belt}<<${BJJ.home}<<${BJJ.since.slice(-4)}`)}
    </div>
  </Sheet>
);

// ---------- 2 and 3: mat stamps ----------

type Spot = { x: number; y: number; w: number; r: number };
const SPOTS_A: Spot[] = [
  { x: 3, y: 0, w: 42, r: -7 },
  { x: 53, y: 5, w: 44, r: 5 },
  { x: 5, y: 34, w: 43, r: 3 },
  { x: 52, y: 37, w: 43, r: -6 },
  { x: 2, y: 66, w: 43, r: 6 },
  { x: 53, y: 70, w: 43, r: -3 },
];
const SPOTS_B: Spot[] = [
  { x: 4, y: 2, w: 43, r: 4 },
  { x: 53, y: 4, w: 42, r: -5 },
  { x: 28, y: 34, w: 42, r: 7 },
  { x: 3, y: 68, w: 43, r: -4 },
  { x: 53, y: 66, w: 43, r: 3 },
];

const GymStamps = ({ from, spots, onSelect }: { from: number; spots: Spot[]; onSelect: PageProps["onSelect"] }) => (
  <div className="pp-field">
    {GYM_STAMPS.slice(from, from + spots.length).map((g, j) => {
      const k = from + j;
      const spot = spots[j];
      return (
        <StampButton
          key={g.gym}
          label={`${g.gym}, ${g.city}, ${g.country}`}
          onSelect={() => onSelect({ kind: "gym", ...g })}
          style={{ left: `${spot.x}%`, top: `${spot.y}%`, width: `${spot.w}%` }}
          rotate={spot.r}
          order={j}
        >
          <StampArt
            shape={g.home ? "round" : SHAPES[(k + 1) % SHAPES.length]}
            ink={g.home ? GOLD : INKS[k % INKS.length]}
            top={g.country.toUpperCase()}
            main={g.city}
            sub={splitLine(g.gym, 17)}
            bottom={g.home ? "HOME MAT" : `${nf.format(g.km)} KM`}
          />
        </StampButton>
      );
    })}
  </div>
);

export const MatsPage = ({ side, inked, onSelect }: PageProps) => (
  <Sheet n={2} side={side} inked={inked}>
    <h2 className="pp-h">Mat stamps</h2>
    <p className="pp-sub">One stamp per gym, with the distance from the home mat.</p>
    <GymStamps from={0} spots={SPOTS_A} onSelect={onSelect} />
  </Sheet>
);

export const MatsContinuedPage = ({ side, inked, onSelect }: PageProps) => (
  <Sheet n={3} side={side} inked={inked}>
    <h2 className="pp-h">Mat stamps, continued</h2>
    <p className="pp-sub">
      {GYM_STAMPS.length} gyms in {COUNTRIES} countries. Farthest: {FARTHEST.city}, {nf.format(FARTHEST.km)} km.
    </p>
    <GymStamps from={SPOTS_A.length} spots={SPOTS_B} onSelect={onSelect} />
  </Sheet>
);

// ---------- 4: transit (coffee) ----------

const ROUTE_STAMPS: { shape: StampShape; ink: string; bottom: string; rotate: number }[] = [
  { shape: "rect", ink: "hsl(var(--positive))", bottom: "ORIGIN", rotate: -4 },
  { shape: "round", ink: "hsl(var(--negative))", bottom: "ROASTERY", rotate: 3 },
  { shape: "oval", ink: GOLD, bottom: "IN THE CUP", rotate: -2 },
];

export const TransitPage = ({ side, inked, onSelect }: PageProps) => (
  <Sheet n={4} side={side} inked={inked}>
    <h2 className="pp-h">Transit</h2>
    <p className="pp-sub">
      {COFFEE.bean}, roasted in {COFFEE.route[1].place} and brought back from a trip. About {nf.format(COFFEE_TOTAL)} km
      from the tree to the cup.
    </p>
    <div className="pp-route">
      {COFFEE.route.map((stop, i) => (
        <div key={stop.place} className="contents">
          {i > 0 && <span className="pp-leg">{nf.format(COFFEE_LEGS[i - 1])} km</span>}
          <StampButton
            label={`${stop.place}, ${stop.country}: ${stop.step}`}
            onSelect={() => onSelect({ kind: "coffee", step: i })}
            rotate={ROUTE_STAMPS[i].rotate}
            order={i}
            className="pp-stamp-flow pp-stamp-route"
          >
            <StampArt
              shape={ROUTE_STAMPS[i].shape}
              ink={ROUTE_STAMPS[i].ink}
              top={stop.country.toUpperCase()}
              main={stop.place}
              sub={splitLine(stop.step, 12)}
              bottom={ROUTE_STAMPS[i].bottom}
            />
          </StampButton>
        </div>
      ))}
    </div>
  </Sheet>
);

// ---------- 5: nightstand (reading) ----------

export const NightstandPage = ({ side, inked, onSelect }: PageProps) => (
  <Sheet n={5} side={side} inked={inked}>
    <h2 className="pp-h">On the nightstand</h2>
    <div className="pp-card">
      <span className="pp-card-title">{READING.title}</span>
      <span className="text-muted-foreground">
        {READING.author}, {READING.year}
      </span>
      <div className="pp-card-lines">
        <span>
          <span>Borrower</span>
          <span>Rukawa</span>
        </span>
        <span>
          <span>Read before</span>
          <span>{READING.previous.length ? READING.previous.map((b) => b.title).join(", ") : "none logged yet"}</span>
        </span>
      </div>
    </div>
    <div className="pp-reading-stamp">
      <StampButton label="Reading now" onSelect={() => onSelect({ kind: "book" })} rotate={-5} className="pp-stamp-flow">
        <StampArt shape="rect" ink="hsl(var(--clash-purple))" top="POIROT'S FIRST CASE" main="Reading now" bottom="ONE ANSWER LEFT" />
      </StampButton>
    </div>
    <p className="pp-note">
      Small details, ruled-out suspects and one answer left at the end. Not far from working out which deck is still in
      someone&apos;s hand.
    </p>
  </Sheet>
);

// ---------- 6: daily stamps (fragrance, live) ----------

const FragranceState = ({ fragrance }: { fragrance: FragranceQuery }) => (
  <p className="pp-sub" aria-busy={fragrance.isLoading}>
    {fragrance.isLoading ? "Loading the fragrance log…" : "The fragrance log can't be loaded right now. Try again in a moment."}
  </p>
);

/** Longest run of the same scent on consecutive days in the window. */
const longestRun = (recent: [string, number][]) => {
  let best = { days: recent.length ? 1 : 0, id: recent[0]?.[1] };
  let run = 1;
  for (let i = 1; i < recent.length; i++) {
    const same = recent[i][1] === recent[i - 1][1] && addDays(recent[i - 1][0], 1) === recent[i][0];
    run = same ? run + 1 : 1;
    if (run > best.days) best = { days: run, id: recent[i][1] };
  }
  return best;
};

const WEEKDAYS = ["M", "T", "W", "T", "F", "S", "S"];

export const DailyStampsPage = ({ side, inked, onSelect, fragrance }: PageProps) => {
  const status = fragrance.data;
  if (!status) {
    return (
      <Sheet n={6} side={side} inked={false}>
        <h2 className="pp-h">Daily stamps</h2>
        <FragranceState fragrance={fragrance} />
      </Sheet>
    );
  }

  const colors = fragranceColors(status.collection);
  const byId = new Map(status.collection.map((f) => [f.id, f]));
  const logged = new Map(status.recent);
  const counts = new Map<number, number>();
  status.recent.forEach(([, id]) => counts.set(id, (counts.get(id) ?? 0) + 1));
  const worn = status.collection.filter((f) => f.worn_recent > 0);
  const named = worn.slice(0, 4);
  const others = worn.length - named.length;
  const run = longestRun(status.recent);
  const latest = status.latest;
  const wornToday = latest?.worn_on === status.today;

  const cells: ReactNode[] = [];
  if (status.recent.length) {
    const first = status.recent[0][0];
    let d = addDays(first, 1 - isoWeekday(first));
    const end = addDays(status.today, 7 - isoWeekday(status.today));
    let order = 0;
    while (d <= end) {
      const id = logged.get(d);
      const day = asDate(d).getUTCDate();
      if (id !== undefined) {
        const f = byId.get(id);
        const date = d;
        cells.push(
          <div key={d} className="pp-cell">
            <StampButton
              label={`${longDate.format(asDate(d))}: ${f?.name ?? "unknown scent"}`}
              onSelect={() => onSelect({ kind: "scent", date, name: f?.name ?? "Unknown", house: f?.house ?? null, times: counts.get(id) ?? 1 })}
              rotate={((order * 37) % 15) - 7}
              order={order}
              className="pp-stamp-fill"
            >
              <DayStampArt ink={colorOf(colors, id)} day={day} today={d === status.today} />
            </StampButton>
          </div>,
        );
        order++;
      } else {
        cells.push(
          <div key={d} className="pp-cell">
            <span className="pp-empty" aria-hidden="true">
              {d > status.today ? "" : day}
            </span>
          </div>,
        );
      }
      d = addDays(d, 1);
    }
  }

  return (
    <Sheet n={6} side={side} inked={inked}>
      <h2 className="pp-h">Daily stamps</h2>
      <p className="pp-sub">
        {latest && (wornToday ? `Today: ${latest.name}${latest.house ? `, ${latest.house}` : ""}. ` : `Last worn: ${latest.name}, on ${fmtWeekday(latest.worn_on)}. `)}
        {status.days_logged} days logged.{" "}
        {run.days > 1 ? `Longest run: ${run.days} days of ${byId.get(run.id ?? -1)?.name ?? "one scent"}.` : "No scent worn twice in a row."}
      </p>
      {cells.length ? (
        <div className="pp-cal">
          {WEEKDAYS.map((w, i) => (
            <span key={i} className="pp-wd" aria-hidden="true">
              {w}
            </span>
          ))}
          {cells}
        </div>
      ) : (
        <p className="pp-note">Nothing logged in the last five weeks.</p>
      )}
      <ul className="pp-legend">
        {named.map((f) => (
          <li key={f.id}>
            <span className="pp-dot" style={{ background: colorOf(colors, f.id) }} />
            <span className="truncate">{f.name}</span>
            <span className="pp-count">{counts.get(f.id) ?? f.worn_recent}×</span>
          </li>
        ))}
        {others > 0 && (
          <li>
            <span className="pp-dot" style={{ background: OTHER_COLOR }} />
            <span>
              {others} other {others === 1 ? "scent" : "scents"}
            </span>
          </li>
        )}
      </ul>
    </Sheet>
  );
};

// ---------- 7: declaration (fragrance shelf, live) ----------

export const DeclarationPage = ({ side, inked, onSelect, fragrance }: PageProps) => {
  const status = fragrance.data;
  if (!status) {
    return (
      <Sheet n={7} side={side} inked={false}>
        <h2 className="pp-h">Declaration</h2>
        <FragranceState fragrance={fragrance} />
      </Sheet>
    );
  }
  const shelf = status.collection;
  const houses = new Set(shelf.map((f) => f.house).filter(Boolean)).size;
  const everWorn = shelf.filter((f) => f.worn_total > 0).length;
  const byType = new Map<string, number>();
  shelf.forEach((f) => byType.set(f.concentration || "Not stated", (byType.get(f.concentration || "Not stated") ?? 0) + 1));
  const rows = [...byType.entries()].sort((a, b) => b[1] - a[1]);
  const today = asDate(status.today);

  return (
    <Sheet n={7} side={side} inked={inked}>
      <h2 className="pp-h">Declaration</h2>
      <p className="pp-sub">
        {shelf.length} bottles from {houses} houses on the shelf at home. {everWorn} of them worn since logging started.
      </p>
      <dl className="pp-decl">
        {rows.map(([type, n]) => (
          <div key={type}>
            <dt>{type}</dt>
            <dd>{n}</dd>
          </div>
        ))}
      </dl>
      <div className="pp-decl-stamp">
        <StampButton
          label="Declared"
          onSelect={() => onSelect({ kind: "declared", bottles: shelf.length, houses, notStated: byType.get("Not stated") ?? 0 })}
          rotate={-9}
          className="pp-stamp-flow"
        >
          <StampArt
            shape="octagon"
            ink="hsl(var(--clash-blue))"
            top="DECLARED"
            main={dayMonth.format(today)}
            sub={[String(today.getUTCFullYear())]}
            bottom={(status.weather_place ?? "Home").toUpperCase()}
          />
        </StampButton>
      </div>
    </Sheet>
  );
};

// ---------- 8: back page ----------

export const BackPage = ({ side, inked }: PageProps) => (
  <Sheet n={8} side={side} inked={inked} className="pp-backpage">
    <p className="pp-back-title">Back to the day job?</p>
    <div className="grid gap-1.5">
      <Link to="/#work" className="pp-back-link">
        See the analysis system
      </Link>
      <Link to="/#contact" className="pp-back-link">
        Say hi
      </Link>
    </div>
  </Sheet>
);
