import { useMemo, useState } from "react";
import { Gift, Minus, Plus, RotateCcw, ScanEye, Trophy } from "lucide-react";
import type { ArcData, ArcState, Attire, Belt as BeltId, CompMatch, Competition, Division } from "../core/types.ts";
import type { ItemDef } from "../core/items.ts";
import { inventory, itemById } from "../core/items.ts";
import { TECH } from "../core/techniques.ts";
import { SEALS } from "../core/lore.ts";
import type { ArcState as State } from "../core/types.ts";
import { compute, diff } from "../core/model.ts";
import type { Diff } from "../core/model.ts";
import { divisionName, divisionsOf, matchesOf, placesOf, record } from "../core/divisions.ts";
import { BELTS, nf0, signed } from "../format.ts";
import { deleteCompetition, rememberWeightClass, saveCompetition } from "../actions.ts";
import { go, uid } from "../store.ts";
import { useGear } from "../useGear.ts";
import { openScouter } from "../scan.ts";
import ChapterEnd from "../components/ChapterEnd.tsx";
import OwnAvatar from "../components/OwnAvatar.tsx";
import type { SeaStep } from "../core/reward.ts";
import { seaFor } from "../reward.ts";
import { newlyOpen, stillClosed } from "../core/unlocks.ts";
import type { Feature, Opening } from "../core/unlocks.ts";
import { compWays } from "../chapterRows.tsx";
import { LvlStep, SecTitle, Seg } from "../components/ui.tsx";
import { METHODS, ORGS, PLACE_NAME, RESULTS, SUBS, WEIGHTS } from "../compText.ts";

/** Weight class and absolute, in the gi and in no-gi: more brackets on one day are rare. */
const MAX_DIVISIONS = 4;
const STEP_KANJI = ["一", "二", "三", "四", "五"];
/** Gi chokes do not exist in a no-gi bracket. */
const NOGI_SUBS = new Set(SUBS.filter((x) => x.nogi).map((x) => x.id));

interface DivDraft {
  attire: Attire;
  weight: string;
  /** What was typed into "Eigene Klasse". */
  custom: string;
  place: number;
  matches: CompMatch[];
}

interface Draft {
  name: string;
  date: string;
  org: string;
  divs: DivDraft[];
}

const newMatch = (belt: BeltId): CompMatch => ({ result: "win", method: "points", oppBelt: belt });

/** The division people usually add next: the absolute, then the same class in the other attire. */
function nextDivision(divs: DivDraft[], belt: BeltId): DivDraft {
  const last = divs[divs.length - 1];
  const hasAbsolute = divs.some((d) => d.attire === last.attire && d.weight === "Absolute");
  const attire: Attire = hasAbsolute ? (last.attire === "gi" ? "nogi" : "gi") : last.attire;
  return { attire, weight: hasAbsolute ? divs[0].weight : "Absolute", custom: "", place: 0, matches: [newMatch(belt)] };
}

const toDivision = (d: DivDraft): Division => ({
  attire: d.attire,
  weight: d.weight || undefined,
  place: d.place,
  matches: d.matches.map((m) => ({ ...m, tech: m.method === "sub" ? m.tech ?? null : null })),
});

function toComp(draft: Draft, id: string): Competition {
  const [first, ...more] = draft.divs.map(toDivision);
  return {
    id,
    date: draft.date,
    name: draft.name.trim() || "Turnier",
    org: draft.org || undefined,
    ...first,
    ...(more.length ? { more } : {}),
    createdAt: Date.now(),
  };
}

export default function Turnier({ data, st, today }: { data: ArcData; st: ArcState; today: string }) {
  const own = data.profile?.belt ?? "weiss";
  const lastAttire = [...data.sessions].sort((a, b) => (a.date < b.date ? 1 : -1))[0]?.attire ?? "gi";
  const [draft, setDraft] = useState<Draft>({ name: "", date: today, org: "", divs: [{ attire: lastAttire, weight: "", custom: "", place: 0, matches: [newMatch(own)] }] });
  const [result, setResult] = useState<{ c: Competition; D: Diff; loot: ItemDef[]; before: State; after: State; sea: SeaStep; opened: Opening[]; closed: Feature[] } | null>(null);
  const knownW = [...WEIGHTS, ...(data.profile?.weightClasses ?? []).filter((w) => !WEIGHTS.includes(w))];
  const { owned } = useGear(data, st);
  const set = (patch: Partial<Draft>) => setDraft((d) => ({ ...d, ...patch }));
  const setDiv = (k: number, patch: Partial<DivDraft>) =>
    setDraft((d) => ({
      ...d,
      divs: d.divs.map((x, j) => {
        if (j !== k) return x;
        const next = { ...x, ...patch };
        return next.attire === "nogi" ? { ...next, matches: next.matches.map((m) => (m.tech && !NOGI_SUBS.has(m.tech) ? { ...m, tech: null } : m)) } : next;
      }),
    }));
  const setMatch = (k: number, i: number, patch: Partial<CompMatch>) =>
    setDraft((d) => ({ ...d, divs: d.divs.map((x, j) => (j === k ? { ...x, matches: x.matches.map((m, n) => (n === i ? { ...m, ...patch } : m)) } : x)) }));
  const asOf = draft.date > today ? draft.date : today;

  const preview = useMemo(() => {
    const c = toComp(draft, "preview");
    const before = compute(data, asOf);
    const after = compute({ ...data, competitions: [...(data.competitions ?? []), c] }, asOf);
    return { c, D: diff(before, after) };
  }, [draft, data, asOf]);

  const save = () => {
    const c = toComp(draft, uid());
    const next = { ...data, competitions: [...(data.competitions ?? []), c] };
    const before = compute(data, asOf);
    const after = compute(next, asOf);
    const D = diff(before, after);
    const loot = [...inventory(next, after).keys()]
      .filter((id) => !owned.has(id))
      .map((id) => itemById(id, next, after))
      .filter((x): x is ItemDef => !!x);
    saveCompetition(c);
    for (const d of divisionsOf(c)) if (d.weight && !WEIGHTS.includes(d.weight)) rememberWeightClass(d.weight);
    setResult({ c, D, loot, before, after, sea: seaFor(data, next, asOf, c.date, "comp"), opened: newlyOpen(data, next), closed: stillClosed(next).map((o) => o.id) });
    window.scrollTo({ top: 0 });
  };

  if (result) {
    return (
      <ChapterEnd
        kanji="試合"
        seal={{ kind: "試合", date: result.c.date }}
        title="Turnier eingetragen"
        before={result.before}
        after={result.after}
        ways={compWays(result.c, result.D, result.after)}
        sea={result.sea}
        opened={result.opened}
        closed={result.closed}
        fighter={(mood) => <OwnAvatar data={data} st={result.after} crop="icon" size={150} still mood={mood} />}
        loot={result.loot}
        belt={own}
        actions={
          <>
            <button type="button" className="btn primary" onClick={() => go("held", "turniere")}>
              <Trophy size={18} aria-hidden="true" /> <span>Kampfrekord</span>
            </button>
            {result.loot.length ? (
              <button type="button" className="btn" onClick={() => go("held", "ausruestung")}>
                <Gift size={18} aria-hidden="true" /> <span>Beute ausrüsten</span>
              </button>
            ) : null}
            <button
              type="button"
              className="btn ghost"
              onClick={() => {
                deleteCompetition(result.c.id);
                setResult(null);
              }}
            >
              <RotateCcw size={16} aria-hidden="true" /> Rückgängig
            </button>
          </>
        }
      />
    );
  }

  return (
    <div className="page log">
      <SecTitle h1 kanji="試合" eyebrow="Wettkampf" title="Turnier eintragen">
        Ein Turnier zählt doppelt: jeder Kampf bewegt dein Power Level stärker als ein Roll, Aufgabe-Siege gelten als harter Beleg für die Technik.
      </SecTitle>
      <LogSwitch value="turnier" />
      <div className="log-grid">
        <form
          className="log-form washi-sheet"
          onSubmit={(e) => {
            e.preventDefault();
            save();
          }}
        >
          <fieldset className="step">
            <legend>
              <b aria-hidden="true">一</b> <span className="sr-only">1.</span> Turnier
            </legend>
            <label className="field">
              <span className="fl">Name</span>
              <input id="arc-comp-name" value={draft.name} maxLength={60} placeholder="z. B. Berlin Open" onChange={(e) => set({ name: e.target.value })} />
            </label>
            <label className="field">
              <span className="fl">Datum</span>
              <input id="arc-comp-date" type="date" value={draft.date} max={today} onChange={(e) => set({ date: e.target.value || today })} />
            </label>
            <div className="field">
              <span className="fl">Veranstalter oder Regelwerk</span>
              <div className="chips">
                {ORGS.map((o) => (
                  <button key={o} type="button" className={`chip${draft.org === o ? " on" : ""}`} aria-pressed={draft.org === o} onClick={() => set({ org: draft.org === o ? "" : o })}>
                    {o}
                  </button>
                ))}
              </div>
            </div>
          </fieldset>

          {draft.divs.map((dv, k) => (
            <DivisionStep
              key={k}
              dv={dv}
              k={k}
              count={draft.divs.length}
              own={own}
              knownW={knownW}
              setDiv={(patch) => setDiv(k, patch)}
              setMatch={(i, patch) => setMatch(k, i, patch)}
              remove={k > 0 ? () => set({ divs: draft.divs.filter((_, j) => j !== k) }) : null}
            />
          ))}

          <div className="add-div">
            <button
              type="button"
              className="btn ghost small"
              disabled={draft.divs.length >= MAX_DIVISIONS}
              onClick={() => set({ divs: [...draft.divs, nextDivision(draft.divs, own)] })}
            >
              <Plus size={14} aria-hidden="true" /> Weitere Division
            </button>
            <small className="muted">Absolute oder No-Gi am selben Turnier: eigene Kämpfe, eigene Medaille.</small>
          </div>

          <div className="savebar">
            <span className="eta">
              <b>+{nf0.format(preview.D.xp)} XP</b>
              <small>fürs Antreten in jeder Division, jeden Kampf, die Platzierungen und was deine Techniken dabei beweisen</small>
            </span>
            <button type="submit" className="btn primary big seal-btn">
              <span className="seal" aria-hidden="true">
                試
              </span>
              <span>Turnier speichern</span>
            </button>
          </div>
        </form>
        <aside className="log-side">
          <CompResultPanel c={preview.c} D={preview.D} />
        </aside>
      </div>
    </div>
  );
}

/** One bracket of the tournament: attire, class, the fights and the placement. */
function DivisionStep({
  dv,
  k,
  count,
  own,
  knownW,
  setDiv,
  setMatch,
  remove,
}: {
  dv: DivDraft;
  k: number;
  count: number;
  own: BeltId;
  knownW: string[];
  setDiv: (patch: Partial<DivDraft>) => void;
  setMatch: (i: number, patch: Partial<CompMatch>) => void;
  remove: (() => void) | null;
}) {
  const title = count > 1 ? `Division ${k + 1}` : "Division";
  // Screen readers hear which division a control belongs to once there are several.
  const of = count > 1 ? `, Division ${k + 1}` : "";
  const n = dv.matches.length;
  const summary = [dv.weight || null, dv.attire === "gi" ? "Gi" : "No-Gi", `${n} ${n === 1 ? "Kampf" : "Kämpfe"}`].filter(Boolean).join(" · ");
  return (
    <fieldset className="step division">
      <legend>
        <b aria-hidden="true">{STEP_KANJI[k + 1]}</b> <span className="sr-only">{k + 2}.</span> {title} <small>{summary}</small>
      </legend>
      <div className="field">
        <span className="fl">Gi oder No-Gi</span>
        <Seg label={`Gi oder No-Gi${of}`} value={dv.attire} onChange={(v) => setDiv({ attire: v })} options={[{ v: "gi", label: "Gi" }, { v: "nogi", label: "No-Gi" }]} />
      </div>
      <div className="field">
        <span className="fl">Gewichtsklasse</span>
        <div className="chips">
          {knownW.map((w) => (
            <button key={w} type="button" className={`chip${dv.weight === w ? " on" : ""}`} aria-pressed={dv.weight === w} onClick={() => setDiv({ weight: dv.weight === w ? "" : w })}>
              {w}
            </button>
          ))}
        </div>
        <div className="row wrap">
          <label className="field grow">
            <span className="fl">Eigene Klasse</span>
            <input
              id={`arc-comp-weight-${k}`}
              value={dv.custom}
              maxLength={20}
              placeholder="z. B. -73 kg oder Master -85 kg"
              onChange={(e) => setDiv({ custom: e.target.value, weight: e.target.value.trim() })}
            />
          </label>
        </div>
        {k === 0 ? <small className="muted">Eigene Klassen merkt sich die App und bietet sie beim nächsten Turnier an.</small> : null}
      </div>

      <div className="field">
        <span className="fl">Kämpfe</span>
        <div className="rolls">
          {dv.matches.map((m, i) => (
            <div key={i} className="roll match">
              <span className="rnum">#{i + 1}</span>
              <div className="field">
                <span className="fl">Ergebnis</span>
                <Seg label={`Ergebnis Kampf ${i + 1}${of}`} value={m.result} onChange={(v) => setMatch(i, { result: v })} options={RESULTS} />
              </div>
              <div className="field">
                <span className="fl">Entschieden durch</span>
                <div className="chips" role="radiogroup" aria-label={`Methode Kampf ${i + 1}${of}`}>
                  {METHODS.map((o) => (
                    <button key={o.v} type="button" role="radio" aria-checked={m.method === o.v} className={`chip${m.method === o.v ? " on" : ""}`} onClick={() => setMatch(i, { method: o.v })}>
                      {o.label}
                    </button>
                  ))}
                </div>
              </div>
              {m.method === "sub" ? (
                <label className="field">
                  <span className="fl">{m.result === "loss" ? "Aufgegeben gegen" : "Technik"}</span>
                  <select value={m.tech ?? ""} onChange={(e) => setMatch(i, { tech: e.target.value || null })}>
                    <option value="">nicht angegeben</option>
                    {SUBS.filter((x) => dv.attire === "gi" || x.nogi).map((x) => (
                      <option key={x.id} value={x.id}>
                        {x.name}
                      </option>
                    ))}
                  </select>
                </label>
              ) : null}
              <div className="field">
                <span className="fl">Gegner</span>
                <div className="row wrap">
                  <div className="belt-dots" role="radiogroup" aria-label={`Gürtel Gegner Kampf ${i + 1}${of}`}>
                    {BELTS.map((b) => (
                      <button
                        key={b.id}
                        type="button"
                        role="radio"
                        aria-checked={(m.oppBelt ?? own) === b.id}
                        aria-label={b.name}
                        title={b.name}
                        className={`belt-dot${(m.oppBelt ?? own) === b.id ? " on" : ""}`}
                        style={{ ["--bc" as string]: b.color, ["--bar" as string]: b.bar }}
                        onClick={() => setMatch(i, { oppBelt: b.id as BeltId })}
                      />
                    ))}
                  </div>
                  <button type="button" className="btn small scan" onClick={() => openScouter({ mode: "gegner", belt: m.oppBelt ?? own, attire: dv.attire, label: `Gegner ${i + 1}` })}>
                    <ScanEye size={14} aria-hidden="true" /> <span>Scannen</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="row">
          <button type="button" className="btn ghost small" disabled={n >= 10} onClick={() => setDiv({ matches: [...dv.matches, newMatch(own)] })}>
            <Plus size={14} aria-hidden="true" /> Kampf
          </button>
          <button type="button" className="btn ghost small" disabled={n <= 1} onClick={() => setDiv({ matches: dv.matches.slice(0, -1) })}>
            <Minus size={14} aria-hidden="true" /> Kampf
          </button>
        </div>
      </div>

      <div className="field">
        <span className="fl">Platzierung</span>
        <div className="podium" role="radiogroup" aria-label={`Platzierung${of}`}>
          {[2, 1, 3].map((p) => (
            <button key={p} type="button" role="radio" aria-checked={dv.place === p} className={`p${p}${dv.place === p ? " on" : ""}`} onClick={() => setDiv({ place: dv.place === p ? 0 : p })}>
              {p}
              <small>{PLACE_NAME[p]}</small>
            </button>
          ))}
        </div>
        <div className="row wrap">
          <button type="button" className={`chip${dv.place === 0 ? " on" : ""}`} aria-pressed={dv.place === 0} onClick={() => setDiv({ place: 0 })}>
            Keine Platzierung
          </button>
          {remove ? (
            <button type="button" className="linkish" onClick={remove}>
              {title} entfernen
            </button>
          ) : null}
        </div>
      </div>
    </fieldset>
  );
}

export function LogSwitch({ value }: { value: "training" | "turnier" | "nebensport" }) {
  return (
    <Seg
      label="Was eintragen?"
      value={value}
      onChange={(v) => go("log", v === "training" ? undefined : v)}
      options={[
        { v: "training", label: "BJJ-Training" },
        { v: "turnier", label: "Turnier" },
        { v: "nebensport", label: "Nebensport" },
      ]}
    />
  );
}

function CompResultPanel({ c, D }: { c: Competition; D: Diff }) {
  const ups = D.dataLevels.filter((l) => l.to > l.from);
  const matches = matchesOf(c);
  const { w, l, d } = record(matches);
  const subs = matches.filter((m) => m.result === "win" && m.method === "sub").length;
  const divs = divisionsOf(c);
  return (
    <section className="panel result" aria-label="Vorschau">
      <p className="eyebrow">Vorschau, noch nicht gespeichert</p>
      <p className="xp-gain">
        +{nf0.format(D.xp)}
        <small>XP</small>
      </p>
      <div className="comp-score">
        {placesOf(c).map((p, i) => (
          <span key={i} className={`medal m${p}`}>
            {p}
          </span>
        ))}
        <b aria-label={`${w} Siege, ${l} Niederlagen${d ? `, ${d} unentschieden` : ""}`}>
          {w}-{l}
          {d ? `-${d}` : ""}
        </b>
        {subs ? <small>{subs} per Aufgabe</small> : null}
      </div>
      {divs.length > 1 ? (
        <ul className="parts">
          {divs.map((x, i) => {
            const r = record(x.matches);
            return (
              <li key={i}>
                <span>{divisionName(c, i)}</span>
                <b>
                  {r.w}-{r.l}
                  {r.d ? `-${r.d}` : ""}
                  {x.place ? `, ${PLACE_NAME[x.place]}` : ""}
                </b>
              </li>
            );
          })}
        </ul>
      ) : null}
      <ul className="deltas">
        {D.lvlTo > D.lvlFrom ? (
          <li className="up big">
            Level-Aufstieg <LvlStep from={D.lvlFrom} to={D.lvlTo} label="Level" />
          </li>
        ) : null}
        <li className={D.power >= 0 ? "up" : "down"}>Power Level {signed(D.power)}</li>
        {ups.map((u) => (
          <li key={u.id} className="up">
            {TECH[u.id].name} <LvlStep from={u.from} to={u.to} label="Stufe" />
          </li>
        ))}
        {D.seals.map((id) => (
          <li key={id} className="up">
            Siegel „{SEALS.find((x) => x.id === id)?.name}“
          </li>
        ))}
      </ul>
    </section>
  );
}
