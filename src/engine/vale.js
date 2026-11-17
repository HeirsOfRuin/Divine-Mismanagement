// Chapter 2's three mechanics (docs/STORY-chapters-2-3.md): the lawsuit, the
// generation turning, and the Synod's Harmonised Text. Pure; each takes the
// state and a named RNG stream and mutates the state, like resolve().

import { applyTrait } from './telephone.js';
import { verseEffects } from './scripture.js';
import { disputeScore } from './acts.js';
import { gain } from './meters.js';
import { living } from './world.js';
import { NAMES } from '../data/followers.data.js';
import { LAWSUIT, GENERATION } from '../data/content/chapters.data.js';

const hurmOf = (s) => s.gods.findIndex((g) => g.persona === 'hurm');

/** The case of the river path. The advocate's trait sets the odds; returns 'won' or 'lost'. */
export function lawsuit(s, advocate, rng) {
  const L = LAWSUIT[advocate];
  const hi = hurmOf(s);
  let p = L.chance;
  if (advocate === 'wenna') p += L.byFence[s.flags.fence] || 0;
  if (advocate === 'self') p += L.perPoint * (disputeScore(s.gods[0]) - (hi > 0 ? disputeScore(s.gods[hi]) : 0));
  p = Math.min(L.max, Math.max(L.min, p));
  const won = rng.chance(p);
  for (const [m, v] of Object.entries(won ? L.won : L.lost)) gain(s, 0, m, v, 'the case of the river path');
  if (hi > 0 && won) gain(s, hi, 'faith', LAWSUIT.hurmLoses, 'the case of the river path');
  s.flags.lawsuit = won ? 'won' : 'lost';
  s.flags.clement = (s.flags.clement || 0) + (won ? 1 : -1);
  return s.flags.lawsuit;
}

/**
 * The generation turns: in every faith the oldest few die and their heirs take
 * their places (same slot and id, trait, household, trade and office, a season
 * settling in), and every Tablet is recited once by one of the heirs, through
 * the telephone; what they say replaces it. Cast members, Saints and High
 * Prophets are not among the dead, except Odo. Returns how many of your
 * Tablets changed.
 */
export function generation(s, rng) {
  const used = new Set(s.gods.flatMap((g) => g.flock.map((f) => f.name)));
  const fresh = rng.shuffle(NAMES.filter((n) => !used.has(n)));
  let mine = 0;
  for (const gi of living(s)) {
    const g = s.gods[gi];
    const can = g.flock.filter((f) => (!f.cast || f.cast === 'odo') && !f.saint && !f.high);
    const odo = can.filter((f) => f.cast === 'odo');
    const dead = [...odo, ...rng.shuffle(can.filter((f) => f.cast !== 'odo'))].slice(0, GENERATION.dies);
    const heirs = [];
    for (const f of dead) {
      const name = fresh.shift();
      g.departed = [...(g.departed || []), { id: f.id, name: f.name, season: s.season }];
      Object.assign(f, { name, known: false, want: null, heirOf: f.name, settling: f.office ? 1 : 0 });
      delete f.cast;
      heirs.push(f);
    }
    if (!heirs.length) continue;
    for (const t of g.tablets) {
      const h = rng.pick(heirs);
      const r = applyTrait(t.verse, h.traits[0], rng, h, s.spent);
      s.spent = r.spent;
      if (!r.note) continue;
      t.verse = r.verse;
      t.history.push({ season: s.season, by: h.id, note: r.note, where: 'teaching it to the next generation' });
      if (gi === 0) mine++;
    }
  }
  s.flags.generation = s.season;
  return mine;
}

/**
 * The Synod: each faith's two best Tablets go round the table through every
 * delegate (yours, then each rival's priest), and come back as the Harmonised
 * Text, replacing what they were. Returns whose verses came through best.
 */
export function synod(s, delegateCast, rng) {
  const me = s.gods[0];
  const mine = me.flock.find((f) => f.cast === delegateCast) || me.flock[0];
  const table = [mine, ...living(s).filter((i) => i > 0).map((i) => s.gods[i].flock[0])];
  const worth = (g, t) => verseEffects(t.verse, t.households, g).k;
  const kept = {};
  for (const gi of living(s)) {
    const g = s.gods[gi];
    const best = [...g.tablets].sort((a, b) => worth(g, b) - worth(g, a)).slice(0, GENERATION.synodTablets);
    let before = 0, after = 0;
    for (const t of best) {
      before += worth(g, t);
      for (const d of table) {
        const r = applyTrait(t.verse, d.traits[0], rng, d, s.spent);
        s.spent = r.spent;
        if (r.note) { t.verse = r.verse; t.history.push({ season: s.season, by: d.id, note: r.note, where: 'at the Synod of the Vale' }); }
      }
      t.harmonised = s.season;
      after += worth(g, t);
    }
    kept[gi] = best.length ? after - before : -Infinity;
  }
  const top = Object.keys(kept).map(Number).sort((a, b) => kept[b] - kept[a] || a - b)[0];
  s.flags.synod = delegateCast;
  s.flags.clement = (s.flags.clement || 0) + (top === 0 ? 1 : 0);
  return top;
}
