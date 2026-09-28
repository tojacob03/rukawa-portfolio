// Tournaments with several divisions: the weight class and the absolute, or
// the gi and the no-gi bracket of the same event.
import { test } from "node:test";
import assert from "node:assert/strict";
import { compXp, compute } from "./model.ts";
import { inventory } from "./items.ts";
import { matchesVs } from "./scouter.ts";
import { logbook } from "./voyage.ts";
import { bestPlace, divisionName, divisionsOf, matchesOf, medalsText, placesOf } from "./divisions.ts";
import type { ArcData, Competition } from "./types.ts";

const TODAY = "2026-09-24";

const base = (): ArcData => ({
  v: 1,
  profile: { name: "Test", belt: "blau", stripes: 0, startBelt: "blau", weeklyGoal: 2, createdAt: "2026-09-01", homeSea: "morgen" },
  onboarding: { date: "2026-09-01", known: ["g_closed"] },
  sessions: [],
  pauses: [],
  promotions: [],
  ui: {},
});

/** Gold in the weight class, silver in the absolute, both in the gi. */
const open: Competition = {
  id: "c1",
  date: "2026-09-20",
  name: "Test Open",
  org: "IBJJF",
  attire: "gi",
  weight: "-76 kg",
  place: 1,
  matches: [
    { result: "win", method: "sub", tech: "s_triangle", oppBelt: "blau" },
    { result: "win", method: "points", oppBelt: "blau" },
  ],
  more: [
    {
      attire: "gi",
      weight: "Absolute",
      place: 2,
      matches: [
        { result: "win", method: "points", oppBelt: "lila" },
        { result: "loss", method: "sub", tech: "s_bowarrow", oppBelt: "braun" },
      ],
    },
  ],
  createdAt: 1,
};

/** The same tournament as two entries without divisions, the way it had to be logged before. */
const asTwo = (c: Competition): Competition[] =>
  divisionsOf(c).map((d, i) => ({ id: `${c.id}-${i}`, date: c.date, name: c.name, org: c.org, ...d, createdAt: c.createdAt + i }));

test("divisions: helpers read old entries and entries with several divisions alike", () => {
  const { more: _more, ...single } = open;
  assert.equal(divisionsOf(single).length, 1);
  assert.deepEqual(placesOf(single), [1]);
  assert.equal(medalsText(single), "Gold");
  assert.equal(medalsText({ ...single, place: 0 }), "");

  assert.equal(divisionsOf(open).length, 2);
  assert.equal(matchesOf(open).length, 4);
  assert.deepEqual(placesOf(open), [1, 2]);
  assert.equal(bestPlace(open), 1);
  assert.equal(divisionName(open, 1), "Absolute");
  assert.equal(medalsText(open), "Gold (-76 kg) und Silber (Absolute)");

  const mixed: Competition = { ...open, more: [{ ...open.more![0], attire: "nogi", weight: "-76 kg", place: 0 }] };
  assert.equal(divisionName(mixed, 0), "-76 kg, Gi");
  assert.equal(divisionName(mixed, 1), "-76 kg, No-Gi");
  assert.equal(medalsText(mixed), "Gold (-76 kg, Gi)");
  assert.equal(divisionName({ ...open, weight: undefined }, 0), "Division 1");
});

test("divisions: one tournament, medals and matches from every division", () => {
  const d = base();
  const before = compute(d, TODAY);
  const after = compute({ ...d, competitions: [open] }, TODAY);
  assert.equal(after.comps.events, 1, "one tournament, however many brackets");
  assert.deepEqual(after.comps.medals, [1, 1, 0]);
  assert.equal(after.comps.w, 3);
  assert.equal(after.comps.l, 1);
  assert.equal(after.comps.subs, 1);
  assert.ok(after.seals.find((s) => s.id === "arena")?.got && after.seals.find((s) => s.id === "podium")?.got);

  // XP: every division as if logged on its own; only the weekly goal counts the day once.
  const split = compute({ ...d, competitions: asTwo(open) }, TODAY);
  assert.equal(compXp(open), asTwo(open).reduce((s, c) => s + compXp(c), 0));
  assert.ok(after.xp - before.xp >= compXp(open));
  assert.equal(split.xp - after.xp, 100, "two entries reached the weekly goal of two, one tournament does not");
  assert.equal(split.comps.events, 2);
  assert.equal(after.ru, split.ru, "the same matches move the Power Level the same way");
  assert.equal(after.nodes.s_triangle.rawSucc, 1);
});

test("divisions: the gi/no-gi filter picks divisions, not whole tournaments", () => {
  const both: Competition = { ...open, more: [{ attire: "nogi", weight: "-76 kg", place: 3, matches: [{ result: "loss", method: "points", oppBelt: "blau" }] }] };
  const d = { ...base(), competitions: [both] };
  const gi = compute(d, TODAY, { attire: "gi" });
  const nogi = compute(d, TODAY, { attire: "nogi" });
  assert.deepEqual([gi.comps.events, gi.comps.w, gi.comps.l], [1, 2, 0]);
  assert.deepEqual(gi.comps.medals, [1, 0, 0]);
  assert.deepEqual([nogi.comps.events, nogi.comps.w, nogi.comps.l], [1, 0, 1]);
  assert.deepEqual(nogi.comps.medals, [0, 0, 1]);
});

test("divisions: items, scouter and logbook see the second division", () => {
  const d = { ...base(), competitions: [open] };
  const st = compute(d, TODAY);
  const inv = inventory(d, st);
  assert.ok(inv.has("ex_gold") && inv.has("ex_silber"), "a medal for each podium");
  assert.ok(!inv.has("ex_bronze"));
  assert.deepEqual(matchesVs(d, "braun"), { w: 0, l: 1, d: 0 });
  assert.deepEqual(matchesVs(d, "blau"), { w: 2, l: 0, d: 0 });
  const entry = logbook(d, TODAY).find((e) => e.kind === "comp");
  assert.ok(entry?.text.endsWith("Test Open, Gold (-76 kg) und Silber (Absolute)."), entry?.text);
});
