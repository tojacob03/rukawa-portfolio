// A tournament holds one or more divisions: its own fields are the first,
// `more` the rest (types.ts). Everything that counts matches or medals reads
// them through these helpers, so an entry with one division and one with four
// are read the same way.

import type { CompMatch, Competition, Division } from "./types.ts";

const PLACE = ["", "Gold", "Silber", "Bronze"];

/** Every division of a tournament, the first one first, each without the tournament's own fields. */
export const divisionsOf = (c: Competition): Division[] => [{ attire: c.attire, weight: c.weight, matches: c.matches, place: c.place }, ...(c.more ?? [])];

/** All matches of a tournament, over its divisions. */
export const matchesOf = (c: Competition): CompMatch[] => divisionsOf(c).flatMap((d) => d.matches);

/** Podium places reached, one per division: 1 gold, 2 silver, 3 bronze. */
export const placesOf = (c: Competition): number[] =>
  divisionsOf(c)
    .map((d) => d.place)
    .filter((p) => p >= 1 && p <= 3);

/** Best placement over the divisions, 0 for none. */
export function bestPlace(c: Competition): number {
  const p = placesOf(c);
  return p.length ? Math.min(...p) : 0;
}

/** Wins, losses and draws in a list of matches. */
export function record(ms: CompMatch[]) {
  const w = ms.filter((m) => m.result === "win").length;
  const l = ms.filter((m) => m.result === "loss").length;
  return { w, l, d: ms.length - w - l };
}

/** Short name of a division: its class, plus Gi or No-Gi when the tournament had both. */
export function divisionName(c: Competition, i: number): string {
  const all = divisionsOf(c);
  const d = all[i];
  const cls = d.weight || `Division ${i + 1}`;
  const mixed = all.some((x) => x.attire !== all[0].attire);
  return mixed ? `${cls}, ${d.attire === "gi" ? "Gi" : "No-Gi"}` : cls;
}

/** The medals in words: "Gold", or "Gold (-76 kg) und Bronze (Absolute)" with several divisions; empty without a podium. */
export function medalsText(c: Competition): string {
  const all = divisionsOf(c);
  const won = all.map((d, i) => ({ p: d.place, i })).filter((x) => x.p >= 1 && x.p <= 3);
  if (all.length === 1) return won.length ? PLACE[won[0].p] : "";
  const parts = won.map((x) => `${PLACE[x.p]} (${divisionName(c, x.i)})`);
  return parts.length > 1 ? `${parts.slice(0, -1).join(", ")} und ${parts[parts.length - 1]}` : (parts[0] ?? "");
}
