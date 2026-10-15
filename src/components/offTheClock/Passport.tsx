import { useCallback, useEffect, useRef, useState, type ComponentType } from "react";
import { useFragranceStatus } from "@/lib/fragrance";
import { PassportDefs } from "@/components/offTheClock/Stamp";
import { COFFEE_TOTAL, COUNTRIES, DETAIL_TEXT, GYM_STAMPS } from "@/components/offTheClock/passportData";
import {
  BackPage,
  Cover,
  DailyStampsPage,
  DeclarationPage,
  HolderPage,
  MatsContinuedPage,
  MatsPage,
  NightstandPage,
  TransitPage,
  type Detail,
  type PageProps,
} from "@/components/offTheClock/PassportPages";

/**
 * Off the clock as one passport. Wide screens get a book: the cover swings
 * open and leaves turn around the spine, two pages at a time. Narrow screens
 * get the same pages one at a time in a swipe row. Arrow keys turn pages in
 * both. Picking a stamp writes it out in full below the passport.
 */

type PageKey = "p1" | "p2" | "p3" | "p4" | "p5" | "p6" | "p7" | "p8";
const PAGES: Record<PageKey, ComponentType<PageProps>> = {
  p1: HolderPage,
  p2: MatsPage,
  p3: MatsContinuedPage,
  p4: TransitPage,
  p5: NightstandPage,
  p6: DailyStampsPage,
  p7: DeclarationPage,
  p8: BackPage,
};

// Each leaf: [front (a right-hand page), back (the left-hand page once turned)]
const LEAVES: ["cover" | PageKey, PageKey][] = [
  ["cover", "p1"],
  ["p2", "p3"],
  ["p4", "p5"],
  ["p6", "p7"],
];
const SPREADS = ["Cover", "Holder and mat stamps", "Mat stamps and coffee", "Reading and fragrance", "Declaration and back page"];
const STRIP: ("cover" | PageKey)[] = ["cover", "p1", "p2", "p3", "p4", "p5", "p6", "p7", "p8"];
const STRIP_NAMES = ["Cover", "Holder", "Mat stamps", "Mat stamps, continued", "Transit", "On the nightstand", "Daily stamps", "Declaration", "Back page"];
// [label, spread in the book, page in the swipe row]
const JUMPS: [string, number, number][] = [
  ["Holder", 1, 1],
  ["Mats", 1, 2],
  ["Coffee", 2, 4],
  ["Reading", 3, 5],
  ["Fragrance", 3, 6],
  ["Declaration", 4, 7],
];
const TURN_MS = 900;

const useMedia = (query: string) => {
  const [matches, setMatches] = useState(() => typeof window !== "undefined" && window.matchMedia(query).matches);
  useEffect(() => {
    const mq = window.matchMedia(query);
    const update = () => setMatches(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, [query]);
  return matches;
};

const Passport = () => {
  const narrow = useMedia("(max-width: 860px)");
  const reduce = useMedia("(prefers-reduced-motion: reduce)");
  const fragrance = useFragranceStatus();
  const fq = { data: fragrance.data, isLoading: fragrance.isLoading, isError: fragrance.isError };

  const [spread, setSpread] = useState(0); // book: 0 (closed) .. LEAVES.length
  const [index, setIndex] = useState(0); // swipe row: 0 .. STRIP.length - 1
  const [moving, setMoving] = useState<number | null>(null);
  const [inked, setInked] = useState<Set<string>>(() => new Set());
  const [detail, setDetail] = useState<Detail | null>(null);
  const bookRef = useRef<HTMLDivElement>(null);
  const stripRef = useRef<HTMLDivElement>(null);

  const last = narrow ? STRIP.length - 1 : LEAVES.length;
  const pos = narrow ? index : spread;

  const go = useCallback(
    (to: number) => {
      if (narrow) {
        const next = Math.max(0, Math.min(STRIP.length - 1, to));
        setIndex(next);
        const row = stripRef.current;
        const slots = row?.children;
        if (row && slots && slots.length > 1) {
          const stepWidth = (slots[1] as HTMLElement).offsetLeft - (slots[0] as HTMLElement).offsetLeft;
          row.scrollTo({ left: next * stepWidth, behavior: reduce ? "auto" : "smooth" });
        }
      } else {
        const next = Math.max(0, Math.min(LEAVES.length, to));
        if (next === spread) return;
        setMoving(Math.min(next, spread));
        setSpread(next);
      }
    },
    [narrow, reduce, spread],
  );
  const step = useCallback((d: number) => go(pos + d), [go, pos]);

  // The leaf that is turning stays on top until it has landed.
  useEffect(() => {
    if (moving === null) return;
    const t = window.setTimeout(() => setMoving(null), reduce ? 0 : TURN_MS);
    return () => window.clearTimeout(t);
  }, [moving, reduce]);

  // Which pages are showing right now
  const visible: string[] = narrow
    ? [STRIP[index]]
    : [spread > 0 ? LEAVES[spread - 1][1] : "", spread < LEAVES.length ? LEAVES[spread][0] : "p8"].filter(Boolean);
  const visibleKey = visible.join(",");

  // Ink the stamps on a page the first time it shows (not with reduced motion).
  useEffect(() => {
    if (reduce) return;
    const mode = narrow ? "s" : "b";
    const t = window.setTimeout(
      () =>
        setInked((prev) => {
          const next = new Set(prev);
          visibleKey.split(",").forEach((k) => next.add(`${mode}-${k}`));
          return next;
        }),
      narrow ? 0 : 450,
    );
    return () => window.clearTimeout(t);
  }, [visibleKey, narrow, reduce]);

  // Only the pages in view can take focus.
  useEffect(() => {
    const root = narrow ? stripRef.current : bookRef.current;
    root?.querySelectorAll<HTMLElement>("[data-face]").forEach((el) => {
      const on = visible.includes(el.dataset.face ?? "");
      el.toggleAttribute("inert", !on);
      el.setAttribute("aria-hidden", String(!on));
    });
  });

  // Arrow keys turn pages
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target;
      if (t instanceof Element && t.closest("input, textarea, select, [contenteditable='true']")) return;
      if (e.key === "ArrowRight") step(1);
      if (e.key === "ArrowLeft") step(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [step]);

  // Swiping the row moves the page position along
  const onStripScroll = useRef<number>();
  const handleScroll = () => {
    window.clearTimeout(onStripScroll.current);
    onStripScroll.current = window.setTimeout(() => {
      const row = stripRef.current;
      const slots = row?.children;
      if (!row || !slots || slots.length < 2) return;
      const stepWidth = (slots[1] as HTMLElement).offsetLeft - (slots[0] as HTMLElement).offsetLeft;
      const i = Math.max(0, Math.min(STRIP.length - 1, Math.round(row.scrollLeft / stepWidth)));
      setIndex(i);
    }, 120);
  };

  const page = (key: "cover" | PageKey, side: PageProps["side"], mode: "b" | "s") => {
    if (key === "cover") return <Cover onOpen={() => go(1)} />;
    const P = PAGES[key];
    return <P side={side} inked={inked.has(`${mode}-${key}`)} onSelect={setDetail} fragrance={fq} />;
  };

  const days = fq.data?.days_logged;

  return (
    <div className="pp">
      <PassportDefs />

      {narrow ? (
        <div ref={stripRef} className="pp-strip" onScroll={handleScroll} data-lenis-prevent aria-label="Passport pages">
          {STRIP.map((key) => (
            <div key={key} className="pp-slot" data-face={key}>
              <div className="pp-sheet">{page(key, "single", "s")}</div>
            </div>
          ))}
        </div>
      ) : (
        <div ref={bookRef} className="pp-book" data-state={spread}>
          <div className="pp-book-inner">
            <div className="pp-base" data-face="p8">
              {page("p8", "right", "b")}
            </div>
            {LEAVES.map(([front, back], i) => {
              const turned = i < spread;
              const z = moving === i ? 50 : turned ? i + 1 : LEAVES.length - i;
              return (
                <div key={front} className={`pp-leaf${turned ? " is-turned" : ""}`} style={{ zIndex: z }}>
                  <div className="pp-face pp-front" data-face={front}>
                    {page(front, "right", "b")}
                  </div>
                  <div className="pp-face pp-back" data-face={back}>
                    {page(back, "left", "b")}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="pp-controls">
        <button type="button" className="pp-ctl" onClick={() => step(-1)} disabled={pos === 0}>
          {pos === 1 ? "Close the passport" : "Previous page"}
        </button>
        <span className="pp-where" aria-live="polite">
          {narrow ? `${STRIP_NAMES[index]}${index ? `, page ${index} of 8` : ""}` : SPREADS[spread]}
        </span>
        <button type="button" className="pp-ctl" onClick={() => step(1)} disabled={pos === last}>
          {pos === 0 ? "Open the passport" : "Next page"}
        </button>
      </div>

      <div className="pp-jumps">
        {JUMPS.map(([label, s, i]) => (
          <button key={label} type="button" onClick={() => go(narrow ? i : s)} aria-current={(narrow ? i === index : s === spread) || undefined}>
            {label}
          </button>
        ))}
      </div>

      <div className="pp-detail" aria-live="polite">
        <DetailText detail={detail} days={days} />
      </div>
    </div>
  );
};

const DetailText = ({ detail, days }: { detail: Detail | null; days?: number }) => {
  if (!detail) {
    return (
      <p>
        <strong>
          {GYM_STAMPS.length} gyms in {COUNTRIES} countries.
        </strong>{" "}
        About {DETAIL_TEXT.km(COFFEE_TOTAL)} km of coffee, one book on the nightstand
        {days ? ` and ${days} days of fragrance` : ""}, all logged. Pick any stamp to read it.
      </p>
    );
  }
  switch (detail.kind) {
    case "gym":
      return (
        <>
          <p>
            <strong>{detail.gym}</strong>, {detail.city}, {detail.country}.{" "}
            {detail.home ? "Home mat." : `${DETAIL_TEXT.km(detail.km)} km from the home mat.`}
          </p>
          {detail.photo && (
            <figure className="pp-photo">
              <img src={detail.photo.src} alt={detail.photo.alt} loading="lazy" decoding="async" />
              <figcaption>{detail.photo.gym}</figcaption>
            </figure>
          )}
        </>
      );
    case "coffee":
      return (
        <p>
          <strong>Jamaican Blue Mountain.</strong> {DETAIL_TEXT.coffee[detail.step]}
        </p>
      );
    case "book":
      return (
        <p>
          <strong>The Mysterious Affair at Styles</strong>, Agatha Christie, 1920. Poirot&apos;s first case.
        </p>
      );
    case "scent":
      return (
        <p>
          <strong>{DETAIL_TEXT.longDate(detail.date)}:</strong> {detail.name}
          {detail.house ? ` by ${detail.house}` : ""}. Worn {detail.times}× in the last five weeks.
        </p>
      );
    case "declared":
      return (
        <p>
          <strong>
            {detail.bottles} bottles, {detail.houses} houses.
          </strong>{" "}
          {detail.notStated ? `${detail.notStated} of them have no concentration logged yet.` : "Every bottle has its concentration logged."}
        </p>
      );
  }
};

export default Passport;
