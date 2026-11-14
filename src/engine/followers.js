// Who is in the flock. Pure. Gate A needs only names, trades, traits and
// households; devotion, wants and family arrive with the follower generator
// (the brief's build item 4).

import { NAMES, TRADES } from '../data/followers.data.js';
import { TRAIT_IDS } from '../data/traits.data.js';

export const HOUSEHOLDS = 4;
export const PER_HOUSEHOLD = 3;
const SECOND_TRAIT = 0.2; // tuned, not measured

// `names` lets two gods share one draw of names so nobody appears in both
// flocks; `prefix` keeps their ids apart.
export function makeFlock(rng, names = rng.shuffle([...NAMES]), prefix = 'f') {
  const flock = [];
  for (let i = 0; i < HOUSEHOLDS * PER_HOUSEHOLD; i++) {
    const traits = [rng.pick(TRAIT_IDS)];
    if (rng.chance(SECOND_TRAIT)) {
      const other = rng.pick(TRAIT_IDS.filter((t) => t !== traits[0]));
      traits.push(other);
    }
    flock.push({
      id: `${prefix}${String(i + 1).padStart(2, '0')}`,
      name: names[i],
      trade: rng.pick(TRADES),
      household: Math.floor(i / PER_HOUSEHOLD),
      traits,
    });
  }
  return flock;
}
