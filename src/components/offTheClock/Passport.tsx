import { useCallback, useEffect, useRef, useState } from "react";
import { useFragranceStatus } from "@/lib/fragrance";
import { PassportDefs } from "@/components/offTheClock/Stamp";
import PageFlipBook, { type BookState, type PageFlipBookHandle } from "@/components/offTheClock/PageFlipBook";
import { COFFEE_TOTAL, COUNTRIES, DETAIL_TEXT, GYM_STAMPS } from "@/components/offTheClock/passportData";
import {
  BackCover,
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
} from "@/components/offTheClock/PassportPages";

/**
 * Off the clock as one passport: a burgundy leather cover, eight paper pages
 * that curl when turned (StPageFlip) and a back cover. Wide screens show two
 * pages at a time, narrow ones one. Drag a corner, use the buttons or the
 * arrow keys. Picking a stamp writes it out in full below the passport.
 */

const PAPER = [HolderPage, MatsPage, MatsContinuedPage, TransitPage, NightstandPage, DailyStampsPage, DeclarationPage, BackPage];
const NAMES = ["Cover", "Holder", "Mat stamps", "Mat stamps, continued", "Coffee", "Reading", "Fragrance", "Fragrance shelf", "Back page", "Back cover"];
const PAGE_COUNT = NAMES.length;
const JUMPS: [string, number][] = [
  ["Holder", 1],
  ["Mats", 2],
  ["Coffee", 4],
  ["Reading", 5],
  ["Fragrance", 6],
  ["Shelf", 7],
];

/** The pages in view: one in portrait, a spread in landscape (the covers stand alone). */
const visiblePages = ({ index, count, orientation }: BookState) => {
  if (orientation === "portrait") return [index];
  if (index === 0) return [0];
  if (index >= count - 1) return [count - 1];
  return index % 2 ? [index, index + 1] : [index - 1, index];
};

const prefersReducedMotion = () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const Passport = () => {
  const fragrance = useFragranceStatus();
  const fq = { data: fragrance.data, isLoading: fragrance.isLoading, isError: fragrance.isError };
  const book = useRef<PageFlipBookHandle>(null);
  const hostRef = useRef<HTMLDivElement>(null);
  const [reduce] = useState(prefersReducedMotion);
  const [settings] = useState(() => ({
    width: 400,
    height: 569,
    size: "stretch" as const,
    minWidth: 260,
    maxWidth: 450,
    minHeight: 370,
    maxHeight: 640,
    showCover: true,
    usePortrait: true,
    mobileScrollSupport: true,
    maxShadowOpacity: 0.5,
    drawShadow: true,
    flippingTime: reduce ? 1 : 900,
    disableFlipByClick: true,
    clickEventForward: true,
    showPageCorners: true,
    startZIndex: 1,
  }));
  const [state, setState] = useState<BookState>({ index: 0, count: PAGE_COUNT, orientation: "landscape" });
  const [leaving, setLeaving] = useState(false);
  const [inked, setInked] = useState<Set<number>>(() => new Set());
  const [detail, setDetail] = useState<Detail | null>(null);

  const visible = visiblePages(state);
  const visibleKey = visible.join(",");
  const first = visible[0];
  const last = visible[visible.length - 1];

  const onChange = useCallback((s: BookState) => {
    setState(s);
    setLeaving(false);
  }, []);

  // A move by button or key slides the book to the middle while the page turns.
  const move = useCallback((turn: (b: PageFlipBookHandle) => void) => {
    if (!book.current) return;
    setLeaving(true);
    turn(book.current);
  }, []);

  // Stamps land the first time their page is in view.
  useEffect(() => {
    if (reduce) return;
    setInked((prev) => {
      const next = new Set(prev);
      visibleKey.split(",").forEach((i) => next.add(Number(i)));
      return next.size === prev.size ? prev : next;
    });
  }, [visibleKey, reduce]);

  // Pages out of view can't take focus.
  useEffect(() => {
    hostRef.current?.querySelectorAll<HTMLElement>("[data-page]").forEach((el) => {
      const on = visibleKey.split(",").includes(el.dataset.page ?? "");
      el.toggleAttribute("inert", !on);
      el.setAttribute("aria-hidden", String(!on));
    });
  }, [visibleKey]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof Element && e.target.closest("input, textarea, select, [contenteditable='true']")) return;
      if (e.key === "ArrowRight" && last < PAGE_COUNT - 1) move((b) => b.flipNext());
      if (e.key === "ArrowLeft" && first > 0) move((b) => b.flipPrev());
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [first, last, move]);

  const wide = state.orientation === "landscape";
  const alone = wide && !leaving && visible.length === 1;
  const deskClass = `pp-desk${alone && first === 0 ? " is-closed" : ""}${alone && first === PAGE_COUNT - 1 ? " is-back" : ""}`;

  return (
    <div className={`pp${reduce ? "" : " can-ink"}`} ref={hostRef}>
      <PassportDefs />

      <div className={deskClass}>
        <PageFlipBook ref={book} settings={settings} onChange={onChange}>
          <div className="pp-page" data-density="hard" data-page={0}>
            <Cover onOpen={() => move((b) => b.flipNext())} />
          </div>
          {PAPER.map((Page, i) => (
            <div key={NAMES[i + 1]} className="pp-page" data-density="soft" data-page={i + 1}>
              <Page inked={inked.has(i + 1)} onSelect={setDetail} fragrance={fq} />
            </div>
          ))}
          <div className="pp-page" data-density="hard" data-page={PAGE_COUNT - 1}>
            <BackCover />
          </div>
        </PageFlipBook>
      </div>

      <div className="pp-controls">
        <button type="button" className="pp-ctl" onClick={() => move((b) => b.flipPrev())} disabled={first === 0}>
          {visible.includes(1) ? "Close the passport" : "Previous page"}
        </button>
        <span className="pp-where" aria-live="polite">
          {visible.map((i) => NAMES[i]).join(" and ")}
        </span>
        <button type="button" className="pp-ctl" onClick={() => move((b) => b.flipNext())} disabled={last === PAGE_COUNT - 1}>
          {first === 0 ? "Open the passport" : "Next page"}
        </button>
      </div>

      <div className="pp-jumps">
        {JUMPS.map(([label, page]) => (
          <button key={label} type="button" onClick={() => move((b) => b.flip(page))} aria-current={visible.includes(page) || undefined}>
            {label}
          </button>
        ))}
      </div>

      <div className="pp-detail" aria-live="polite">
        <DetailText detail={detail} days={fq.data?.days_logged} />
      </div>

      <p className="pp-credit">
        Drag a page corner, use the buttons or the arrow keys to turn pages. Page turning:{" "}
        <a href="https://github.com/Nodlik/StPageFlip" target="_blank" rel="noopener noreferrer">
          StPageFlip
        </a>{" "}
        (MIT). Leather and paper:{" "}
        <a href="https://ambientcg.com" target="_blank" rel="noopener noreferrer">
          ambientCG
        </a>{" "}
        (CC0).
      </p>
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
