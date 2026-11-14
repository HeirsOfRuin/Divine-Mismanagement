// New game, the save contract, and migrations.
//
// The save KEY is a contract: renaming it orphans every save on every device.
// The payload carries `v`; MIGRATIONS[v] upgrades version v to v + 1. Every
// version that ever shipped gets a fixture in test/fixtures/ that must load
// and play on. No build has shipped yet: v1 was the scaffold's placeholder and
// was redefined as this game on 2026-11-14, before anyone could have saved one.

import { CONFIG } from '../data/config.data.js';
import { NAMES } from '../data/followers.data.js';
import { CUSTOM } from '../data/match.data.js';
import { streamFor } from './rng.js';
import { makeFlock } from './followers.js';
import { matchFrom, layout, personasFor } from './world.js';

export const SAVE_KEY = 'divine-mismanagement.save.v1'; // never rename
export const SAVE_VERSION = 1;
export const CODE_PREFIX = 'DVMM1.';

function newGod(name, flock, start, extra = {}) {
  return {
    name, ...structuredClone(start), ...extra,
    heresy: 0, entitlement: 0, charm: 0, guard: 1, blunt: 1, bluntPrev: 1,
    flock: flock.map((f) => ({ ...f, known: false, office: null, settling: 0, want: null })),
    tablets: [], apocrypha: [], legends: [], works: {}, building: null,
    prayers: [], missionaryOut: 0, low: 0, strikes: 0, seen: {},
    rank: 0, artifacts: [], saints: [], cooldowns: {}, exasperation: 0, fallen: false,
    n: {},
  };
}

/**
 * A new game. `mode` 'story' with `chapter`, or 'custom' with `rivals`,
 * `regions`, `wealth` (your starting resources) and `seasons`.
 * Story Chapter 1 is the default and the measured game.
 */
export function newGame({ seed = 1, name = 'the God of Doors That Stick', ...opts } = {}) {
  seed = seed >>> 0;
  const match = matchFrom(opts);
  const rng = streamFor(seed, 0, 'flock');
  const names = rng.shuffle([...NAMES]);
  const regions = layout(match);
  const w = CUSTOM.wealth[match.wealth];
  const mine = { ...CONFIG.start, faith: CONFIG.start.faith * w.faith, power: Math.round(CONFIG.start.power * w.power), offerings: CONFIG.start.offerings * w.offerings };
  const gods = [newGod(name, makeFlock(rng, names.slice(0, 12), 'f'), mine, { home: 0, field: 0 })];
  personasFor(match).forEach((p, i) => {
    const gi = i + 1;
    gods.push(newGod(p.name, makeFlock(rng, names.slice(12 * gi, 12 * gi + 12), `r${gi}-`), CONFIG.rivalStart, { persona: p.id, home: gi % match.regions, field: gi % match.regions }));
  });
  return {
    v: SAVE_VERSION, seed, season: 1, over: false, outcome: null, nextId: 1,
    match, regions, gods,
    ledger: [], spent: {}, event: null, chronicle: [], book: null,
  };
}

/** MIGRATIONS[v](save) returns the save at version v + 1. Add one per version bump. */
export const MIGRATIONS = {};

export function migrate(save) {
  let s = save;
  if (!s || typeof s !== 'object' || !Number.isInteger(s.v)) throw new Error('not a save');
  if (s.v > SAVE_VERSION) throw new Error(`save is from a newer version (${s.v}) than this build (${SAVE_VERSION})`);
  while (s.v < SAVE_VERSION) {
    const step = MIGRATIONS[s.v];
    if (!step) throw new Error(`no migration from save version ${s.v}`);
    s = step(s);
  }
  return s;
}

export const serialize = (state) => JSON.stringify(state);
export const deserialize = (text) => migrate(JSON.parse(text));

export function toCode(state) {
  const b64 = btoa(unescape(encodeURIComponent(serialize(state))));
  return CODE_PREFIX + b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

export function fromCode(code) {
  const text = String(code).trim();
  if (!text.startsWith(CODE_PREFIX.slice(0, -2))) throw new Error('That is not a save code for this game.');
  const body = text.slice(text.indexOf('.') + 1).replace(/-/g, '+').replace(/_/g, '/');
  return deserialize(decodeURIComponent(escape(atob(body))));
}
