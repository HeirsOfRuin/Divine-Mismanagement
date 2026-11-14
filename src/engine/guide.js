// The guided start and the Registry's goals. Pure.
//
// The author, after the first playtest: "It needs more complexity that is
// introduced properly and with just enough visible so as not to overwhelm."
// So in a guided match an act or office opens in the season GUIDE gives it,
// for every god alike, and Pim says what it is when it opens. Separately, the
// Registry keeps one or two short goals in front of the player, each with a
// small reward, each drawn once a playthrough (docs/FRAME-playtest-1.md).

import { GUIDE, PETITIONS_ACTIVE } from '../data/match.data.js';
import { GUIDE_NOTES, PETITIONS } from '../data/content/guide.data.js';
import { gain } from './meters.js';
import { scriptureSum } from './scripture.js';
import { draw, fill } from './content.js';
import { leaderAgainst, soulUnit } from './world.js';

export function isOpen(s, key) {
  if (!s.match.guided) return true;
  return GUIDE.some((g) => g.season <= s.season && g.opens.includes(key));
}
export const opensIn = (key) => (GUIDE.find((g) => g.opens.includes(key)) || {}).season ?? 1;
export const openedNow = (s) => (s.match.guided ? (GUIDE.find((g) => g.season === s.season) || null) : null);
export const noteFor = (s) => { const g = openedNow(s); return g ? GUIDE_NOTES[g.season] || null : null; };

const filled = (g) => g.flock.filter((f) => f.office).length;

function needMet(s, p) {
  if (!p.needs) return true;
  if (p.needs === 'villages') return s.villages.length > 1;
  return isOpen(s, p.needs);
}

/** Has this goal been met, now? `p.base` holds the counters when it was set. */
function met(s, p) {
  const g = s.gods[0];
  const n = (k) => (g.n[k] || 0) - (p.base[k] || 0);
  const last = s.chronicle[s.chronicle.length - 1];
  switch (p.id) {
    case 'two_offices': return filled(g) >= 2;
    case 'four_offices': return filled(g) >= 4;
    case 'all_offices': return filled(g) >= 6;
    case 'tablet_good': case 'two_good': return scriptureSum(g).doctrine >= (p.id === 'two_good' ? 2 : 1);
    case 'answer_two': return n('answer') >= 2;
    case 'souls_n': case 'souls_m': return g.souls >= p.n;
    case 'work_done': return Object.keys(g.works).length > (p.base.works || 0);
    case 'witnessed': return n('witnessed') >= 1;
    case 'know_five': return g.flock.filter((f) => f.known).length >= 5;
    case 'lead_rival': { const l = leaderAgainst(s, 0); return l !== null && g.souls > s.gods[l].souls; }
    case 'convert_three': return Boolean(last && last.souls.me >= 3);
    case 'heresy_calm': return g.tablets.length >= 3 && g.heresy < 2;
    case 'legends_two': return g.legends.filter((L) => L.left > 0).length >= 2;
    case 'festival': return n('festival') >= 1;
    case 'dispute_won': return n('disputeWon') >= 1;
    case 'rank_one': return g.rank >= 1;
    case 'field_away': return g.field !== g.home;
    case 'hold_two': return s.villages.filter((v) => v.held[0] > 0 && v.held.every((h, i) => i === 0 || h < v.held[0])).length >= 2;
    default: return false;
  }
}

/** At dawn: keep up to two goals in front of the player. */
export function issuePetitions(s, rng) {
  const g = s.gods[0];
  s.petitions ||= [];
  while (s.petitions.length < PETITIONS_ACTIVE) {
    const ids = PETITIONS.filter((p) => needMet(s, p) && !s.petitions.some((x) => x.id === p.id)).map((p) => p.id);
    const id = draw(s, 'petition', ids, rng);
    if (!id) return;
    const P = PETITIONS.find((p) => p.id === id);
    const n = P.scaled ? Math.round(P.n * soulUnit(s) / 18) : P.n;
    const l = leaderAgainst(s, 0);
    const p = { id, n, reward: P.reward, season: s.season, base: { ...g.n, works: Object.keys(g.works).length },
      text: fill(P.text, { n, rival: l !== null ? s.gods[l].name : 'every other god' }) };
    if (met(s, p)) continue;   // already true: not a goal
    s.petitions.push(p);
  }
}

/** At a season's end: pay out any goal now met. Returns those met. */
export function settlePetitions(s) {
  const done = [];
  for (const p of s.petitions || []) {
    if (!met(s, p)) continue;
    for (const [m, v] of Object.entries(p.reward)) gain(s, 0, m, v, 'the Registry');
    done.push(p);
  }
  s.petitions = (s.petitions || []).filter((p) => !done.includes(p));
  return done;
}

export const rewardText = (r) => Object.entries(r).map(([m, v]) => `+${v} ${m === 'faith' ? 'Faith' : m === 'power' ? 'Power' : 'Offerings'}`).join(', ');
