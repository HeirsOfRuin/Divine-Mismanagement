// The shape of a match: how many gods, how many regions, how rich, and the
// thresholds scaled to that world. Pure.
//
// Story Chapter 1 (one rival, one village of 36) is the measured game; every
// other shape uses the same rules with its thresholds scaled by two factors:
//   fair  = the souls per god if the world were split evenly (18 in Chapter 1)
//   scale = (fair / 18)^0.4, applied to every Faith threshold
//   unit  = 18 * (fair / 18)^0.2, the soul count every souls threshold is measured in
// The exponents are measured, not derived: with more rivals a careful player
// ends near an even share rather than ahead of it (Chapter 2: 24 of a fair
// 24, against 24 of 18 in Chapter 1), so linear scaling made Chapters 2 and 3
// unwinnable (2% and 0% for careful play, 120 games each).
// Rough on purpose, and said so on the setup screen: a scaled threshold is a
// guess until a batch run has measured that shape.

import { CONFIG } from '../data/config.data.js';
import { STORY, CUSTOM, RIVALS, REGION_NAMES } from '../data/match.data.js';

const BASE_FAIR = 18;

export function matchFrom(opts = {}) {
  if (opts.mode === 'custom') {
    const rivals = clampTo(CUSTOM.rivals, opts.rivals ?? 1);
    const regions = clampTo(CUSTOM.regions, opts.regions ?? 1);
    const seasons = clampTo(CUSTOM.seasons, opts.seasons ?? 30);
    const wealth = CUSTOM.wealth[opts.wealth] ? opts.wealth : 'standard';
    const measured = rivals === 1 && regions === 1 && wealth === 'standard' && seasons === 30;
    return { mode: 'custom', chapter: null, rivals, regions, wealth, seasons, measured, label: `Custom: ${rivals} rival${rivals > 1 ? 's' : ''}, ${regions} region${regions > 1 ? 's' : ''}` };
  }
  const ch = STORY.find((c) => c.id === opts.chapter) || STORY[0];
  return { mode: 'story', chapter: ch.id, rivals: ch.rivals, regions: ch.regions, wealth: ch.wealth, seasons: ch.seasons, measured: ch.measured, label: ch.label };
}
const clampTo = (list, v) => (list.includes(Number(v)) ? Number(v) : list[0]);

/** Regions with their home gods: god i lives in region i mod R. 12 Unbothered in each, 12 souls per god at home. */
export function layout(match) {
  const gods = match.rivals + 1;
  const regions = [];
  for (let r = 0; r < match.regions; r++) {
    const homes = [...Array(gods).keys()].filter((i) => i % match.regions === r);
    const held = Array(gods).fill(0);
    for (const i of homes) held[i] = CONFIG.start.souls;
    regions.push({ id: `g${r}`, name: REGION_NAMES[r % REGION_NAMES.length], unbothered: 12 + (homes.length ? 0 : 12), held });
  }
  return regions;
}

/** The rival personas for a match: Vellamine first, always; the rest in order. */
export const personasFor = (match) => RIVALS.slice(0, match.rivals);

export const population = (s) => s.regions.reduce((a, r) => a + r.unbothered + r.held.reduce((x, y) => x + y, 0), 0);
export const fairShare = (s) => population(s) / s.gods.length;
export const faithScale = (s) => (fairShare(s) / BASE_FAIR) ** 0.4;
export const soulUnit = (s) => BASE_FAIR * (fairShare(s) / BASE_FAIR) ** 0.2;

/** Thresholds for this world (Chapter 1: exactly the measured CONFIG numbers). */
export function thresholds(s) {
  const f = faithScale(s), fair = fairShare(s), unit = soulUnit(s);
  const r = CONFIG.review;
  return {
    review: { faith: Math.round(r.faith * f), souls: Math.ceil((r.souls / BASE_FAIR) * unit), heresy: r.heresy, doctrine: r.doctrine },
    registry: CONFIG.registry.map((x) => Math.round(x * f)),
    fallBelow: Math.max(CONFIG.fallBelow, Math.round((CONFIG.fallBelow / BASE_FAIR) * fair)),
    fair, scale: f, unit,
  };
}

export const unbotheredTotal = (s) => s.regions.reduce((a, r) => a + r.unbothered, 0);
export const living = (s) => s.gods.map((g, i) => i).filter((i) => !s.gods[i].fallen);
export const rivalsOf = (s, gi) => living(s).filter((i) => i !== gi);
/** The strongest other god still standing. */
export const leaderAgainst = (s, gi) => rivalsOf(s, gi).sort((a, b) => s.gods[b].souls - s.gods[a].souls || a - b)[0] ?? null;
/** The region where a god holds most souls (ties: lowest index). */
export const stronghold = (s, gi) => s.regions.map((r, i) => i).sort((a, b) => s.regions[b].held[gi] - s.regions[a].held[gi] || a - b)[0];
