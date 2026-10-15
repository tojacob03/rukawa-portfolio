import { BJJ, COFFEE, MAT_STOPS } from "@/data/offTheClock";

// Numbers and words the passport pages share: distances from the home mat,
// the coffee route and the texts shown when a stamp is picked.

const nf = new Intl.NumberFormat("en-US");
const longDate = new Intl.DateTimeFormat("en-GB", { weekday: "long", day: "numeric", month: "long", timeZone: "UTC" });

/** Split a long name at the space nearest its middle. */
export const splitLine = (s: string, max: number) => {
  if (s.length <= max) return [s];
  let best = -1;
  for (let i = 0; i < s.length; i++) {
    if (s[i] === " " && (best < 0 || Math.abs(i - s.length / 2) < Math.abs(best - s.length / 2))) best = i;
  }
  return best < 0 ? [s] : [s.slice(0, best), s.slice(best + 1)];
};

export const greatCircleKm = ([lon1, lat1]: [number, number], [lon2, lat2]: [number, number]) => {
  const rad = Math.PI / 180;
  const a =
    Math.sin(((lat2 - lat1) * rad) / 2) ** 2 +
    Math.cos(lat1 * rad) * Math.cos(lat2 * rad) * Math.sin(((lon2 - lon1) * rad) / 2) ** 2;
  return 2 * 6371 * Math.asin(Math.sqrt(a));
};

const homeStop = MAT_STOPS.find((s) => s.home) ?? MAT_STOPS[0];

/** One stamp per gym, in the order of the gym list, with the distance from the home mat. */
export const GYM_STAMPS = BJJ.gyms.flatMap((g) => {
  const stop = MAT_STOPS.find((s) => s.city === g.city);
  if (!stop || !g.city || !g.country) return [];
  return [
    {
      gym: g.name,
      city: g.city,
      country: g.country,
      home: Boolean(g.home),
      km: g.home ? 0 : Math.round(greatCircleKm(homeStop.coords, stop.coords) / 10) * 10,
      photo: stop.photos?.find((p) => p.gym === g.name),
    },
  ];
});
export const COUNTRIES = new Set(GYM_STAMPS.map((g) => g.country)).size;
export const FARTHEST = GYM_STAMPS.reduce((a, b) => (b.km > a.km ? b : a), GYM_STAMPS[0]);

export const COFFEE_LEGS = COFFEE.route.slice(1).map((stop, i) => Math.round(greatCircleKm(COFFEE.route[i].coords, stop.coords) / 100) * 100);
export const COFFEE_TOTAL = Math.round(COFFEE.route.slice(1).reduce((sum, stop, i) => sum + greatCircleKm(COFFEE.route[i].coords, stop.coords), 0) / 100) * 100;

export const DETAIL_TEXT = {
  coffee: [
    `${COFFEE.route[0].place}, ${COFFEE.route[0].country}. Where the beans were grown.`,
    `${COFFEE.route[1].place}, ${COFFEE.route[1].country}. Roasted locally by ${COFFEE.roaster} and brought back from a trip. ${nf.format(COFFEE_LEGS[0])} km from the ${COFFEE.route[0].place}.`,
    `${COFFEE.route[2].place}, ${COFFEE.route[2].country}. Pulled as ${COFFEE.method.toLowerCase()}, ${nf.format(COFFEE_LEGS[1])} km after the roastery.`,
  ],
  longDate: (iso: string) => longDate.format(new Date(`${iso}T12:00:00Z`)),
  km: (n: number) => nf.format(n),
};
