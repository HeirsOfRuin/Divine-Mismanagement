// The shape of a match: how many gods, regions and villages, how rich, and the
// thresholds scaled to that world. Pure.
//
// Story Chapter 1 (one rival, one village of 36) is the measured game; every
// other shape uses the same rules with its thresholds scaled by two factors:
//   fair  = the souls per god if the world were split evenly (18 in Chapter 1)
//   k     = the Review's souls line against Chapter 1's (see below)
// Rough on purpose, and said so on the setup screen: a scaled threshold is a
// guess until a batch run has measured that shape.

import { CONFIG } from '../data/config.data.js';
import { STORY, CUSTOM, RIVALS, REGION_NAMES, VILLAGE_NAMES } from '../data/match.data.js';

const BASE_FAIR = 18;

export function matchFrom(opts = {}) {
  const guided = opts.guided !== undefined ? Boolean(opts.guided) : true;
  if (opts.mode === 'custom') {
    const rivals = clampTo(CUSTOM.rivals, opts.rivals ?? 1);
    const regions = clampTo(CUSTOM.regions, opts.regions ?? 1);
    const villages = clampTo(CUSTOM.villages, opts.villages ?? 1);
    const seasons = clampTo(CUSTOM.seasons, opts.seasons ?? 30);
    const wealth = CUSTOM.wealth[opts.wealth] ? opts.wealth : 'standard';
    const measured = rivals === 1 && regions === 1 && villages === 1 && wealth === 'standard' && seasons === 30;
    const n = regions * villages;
    return { mode: 'custom', chapter: null, rivals, regions, villages, wealth, seasons, measured, guided,
      label: `Custom: ${rivals} rival${rivals > 1 ? 's' : ''}, ${n} village${n > 1 ? 's' : ''}` };
  }
  const ch = STORY.find((c) => c.id === opts.chapter) || STORY[0];
  return { mode: 'story', chapter: ch.id, rivals: ch.rivals, regions: ch.regions, villages: ch.villages, wealth: ch.wealth, seasons: ch.seasons, measured: ch.measured, guided, label: ch.label };
}
const clampTo = (list, v) => (list.includes(Number(v)) ? Number(v) : list[0]);

/**
 * Regions, and the villages in them, with places on the map. God i lives in
 * village floor(i * N / gods) of the N villages, so homes spread out. Each
 * village has 12 Unbothered, plus 12 more where no god lives, plus each home
 * god's 12. Map positions are fixed by the seed, in units of the map canvas.
 */
export function layout(match, rng) {
  const gods = match.rivals + 1;
  const n = match.regions * match.villages;
  // Your home is always Little Fretting; the rest are shuffled.
  const names = [VILLAGE_NAMES[0], ...rng.shuffle(VILLAGE_NAMES.slice(1))];
  const regions = [], villages = [];
  // Regions side by side in up to two rows.
  const cols = Math.min(match.regions, match.regions > 2 ? Math.ceil(match.regions / 2) : match.regions);
  const rows = Math.ceil(match.regions / cols);
  const W = 130, H = 90, pad = 6;
  const rw = (W - pad * (cols + 1)) / cols, rh = (H - pad * (rows + 1)) / rows;
  for (let r = 0; r < match.regions; r++) {
    const c = r % cols, row = Math.floor(r / cols);
    regions.push({ id: `r${r}`, name: REGION_NAMES[r % REGION_NAMES.length], x: pad + c * (rw + pad), y: pad + row * (rh + pad), w: rw, h: rh });
  }
  const homeOf = [...Array(gods).keys()].map((i) => (n >= gods ? Math.floor((i * n) / gods) : i % n));
  for (let v = 0; v < n; v++) {
    const ri = Math.floor(v / match.villages), k = v % match.villages, R = regions[ri];
    const homes = homeOf.map((h, i) => (h === v ? i : -1)).filter((i) => i >= 0);
    const held = Array(gods).fill(0);
    for (const i of homes) held[i] = CONFIG.start.souls;
    // Spread the villages across the region, a little jittered.
    const slots = match.villages;
    const x = R.x + R.w * ((k + 0.5) / slots) + rng.range(-3, 3);
    const y = R.y + R.h * (slots === 1 ? 0.55 : k % 2 ? 0.68 : 0.4) + rng.range(-3, 3);
    villages.push({ id: `v${v}`, name: names[v % names.length], region: ri, x: Math.round(x), y: Math.round(y), unbothered: 12 + (homes.length ? 0 : 12), held });
  }
  return { regions, villages, homeOf };
}

/** The rival personas for a match: Vellamine first, always; the rest in order. */
export const personasFor = (match) => RIVALS.slice(0, match.rivals);

export const population = (s) => s.villages.reduce((a, r) => a + r.unbothered + r.held.reduce((x, y) => x + y, 0), 0);
export const fairShare = (s) => population(s) / s.gods.length;
// The Review's souls line is a share of the whole population: 23 of 36 in
// Chapter 1 (two gods), shrinking as (2 / gods)^0.7 with more gods. Every other
// threshold scales with k, that line against Chapter 1's 23: Faith by k^0.8
// (Faith follows souls but decays), rank souls by k. Re-measured after
// playtest 1, once the missionary could travel (docs/BALANCE.md round 3); the
// earlier fair-share scaling was tuned to a bot that never left home.
const reviewSouls = (s) => Math.ceil((CONFIG.review.souls / 36) * (2 / s.gods.length) ** 0.7 * population(s));
const kOf = (s) => reviewSouls(s) / CONFIG.review.souls;
export const faithScale = (s) => kOf(s) ** 0.8;
export const soulUnit = (s) => BASE_FAIR * kOf(s);

/** Thresholds for this world (Chapter 1: exactly the measured CONFIG numbers). */
export function thresholds(s) {
  const f = faithScale(s), fair = fairShare(s), unit = soulUnit(s);
  const r = CONFIG.review;
  return {
    review: { faith: Math.round(r.faith * f), souls: reviewSouls(s), heresy: r.heresy, doctrine: r.doctrine },
    registry: CONFIG.registry.map((x) => Math.round(x * f)),
    fallBelow: Math.max(CONFIG.fallBelow, Math.round((CONFIG.fallBelow / BASE_FAIR) * fair)),
    fair, scale: f, unit,
  };
}

export const unbotheredTotal = (s) => s.villages.reduce((a, r) => a + r.unbothered, 0);
export const living = (s) => s.gods.map((g, i) => i).filter((i) => !s.gods[i].fallen);
export const rivalsOf = (s, gi) => living(s).filter((i) => i !== gi);
/** The strongest other god still standing. */
export const leaderAgainst = (s, gi) => rivalsOf(s, gi).sort((a, b) => s.gods[b].souls - s.gods[a].souls || a - b)[0] ?? null;
/** The village where a god holds most souls (ties: lowest index). */
export const stronghold = (s, gi) => s.villages.map((r, i) => i).sort((a, b) => s.villages[b].held[gi] - s.villages[a].held[gi] || a - b)[0];
