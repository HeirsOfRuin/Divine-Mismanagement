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
import { castFlock } from './story.js';

export const SAVE_KEY = 'divine-mismanagement.save.v1'; // never rename
export const SAVE_VERSION = 1;
export const CODE_PREFIX = 'DVMM2.';

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
 * `regions`, `villages` (per region), `wealth` (your starting resources),
 * `seasons` and `guided` (things open one at a time; on by default).
 * Story Chapter 1 is the default and the measured game.
 */
export function newGame({ seed = 1, name = 'the God of Doors That Stick', ...opts } = {}) {
  seed = seed >>> 0;
  const match = matchFrom(opts);
  const rng = streamFor(seed, 0, 'flock');
  const names = rng.shuffle([...NAMES]);
  const { regions, villages, homeOf } = layout(match, streamFor(seed, 0, 'map'));
  const w = CUSTOM.wealth[match.wealth];
  const mine = { ...CONFIG.start, faith: CONFIG.start.faith * w.faith, power: Math.round(CONFIG.start.power * w.power), offerings: CONFIG.start.offerings * w.offerings };
  const gods = [newGod(name, makeFlock(rng, names.slice(0, 12), 'f'), mine, { home: homeOf[0], field: homeOf[0], travelling: 0 })];
  personasFor(match).forEach((p, i) => {
    const gi = i + 1;
    gods.push(newGod(p.name, makeFlock(rng, names.slice(12 * gi, 12 * gi + 12), `r${gi}-`), CONFIG.rivalStart, { persona: p.id, home: homeOf[gi], field: homeOf[gi], travelling: 0 }));
  });
  return castFlock({
    v: SAVE_VERSION, seed, season: 1, over: false, outcome: null, nextId: 1,
    match, regions, villages, gods,
    ledger: [], spent: {}, event: null, chronicle: [], book: null,
    flags: {}, scenes: [], seenScenes: [],
  });
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

// ---- save codes --------------------------------------------------------------
// A code moves a game between devices, or into a message. Playtest 2 found the
// old code was about 200,000 characters by season 30 (three quarters of it the
// ledger and every season's report) and arrived cut off, unloadable. So a code
// now carries the game, not its whole history, and is compressed:
//   - ledger rows before the current season are folded into one
//     "brought forward" row per god and meter, so start + ledger == meter still holds;
//   - the season records keep the last 12 (Pim's file shows 12), and only the
//     last keeps its account;
//   - DVMM2. is deflate + base64url. DVMM1. (plain) still loads, and is written
//     where the browser has no CompressionStream.
// The save in this browser's storage is untouched and keeps everything.

export const CODE_PREFIX_PLAIN = 'DVMM1.';
const KEEP_RECORDS = 12;

export function compactForCode(state) {
  const s = JSON.parse(JSON.stringify(state));
  const keep = [], carried = {};
  for (const r of s.ledger) {
    if (r[0] >= s.season) { keep.push(r); continue; }
    const k = `${r[1]}|${r[2]}`;
    carried[k] = (carried[k] || 0) + r[3];
  }
  const forward = Object.entries(carried).map(([k, a]) => { const [gi, m] = k.split('|'); return [s.season - 1, Number(gi), m, a, 'brought forward']; });
  s.ledger = [...forward, ...keep];
  s.chronicle = s.chronicle.slice(-KEEP_RECORDS).map((r, i, all) => (i === all.length - 1 ? r : { ...r, account: {} }));
  return s;
}

const b64url = (bytes) => { let bin = ''; for (const b of bytes) bin += String.fromCharCode(b); return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, ''); };
const unb64url = (text) => { const bin = atob(text.replace(/-/g, '+').replace(/_/g, '/')); return Uint8Array.from(bin, (c) => c.charCodeAt(0)); };
async function pipe(bytes, stream) { return new Uint8Array(await new Response(new Blob([bytes]).stream().pipeThrough(stream)).arrayBuffer()); }

/** A save code for this game. Async: compression is a stream in browsers. */
export async function toCode(state) {
  const json = serialize(compactForCode(state));
  if (typeof CompressionStream === 'undefined') return CODE_PREFIX_PLAIN + b64url(new TextEncoder().encode(json));
  return CODE_PREFIX + b64url(await pipe(new TextEncoder().encode(json), new CompressionStream('deflate')));
}

export async function fromCode(code) {
  const text = String(code).replace(/\s+/g, '');
  const damaged = 'That save code is incomplete or damaged. Copy all of it, from DVMM to the last character.';
  if (text.startsWith(CODE_PREFIX_PLAIN)) {
    try { return deserialize(new TextDecoder().decode(unb64url(text.slice(CODE_PREFIX_PLAIN.length)))); } catch { throw new Error(damaged); }
  }
  if (!text.startsWith(CODE_PREFIX)) throw new Error('That is not a save code for this game.');
  if (typeof DecompressionStream === 'undefined') throw new Error('This browser cannot read compressed save codes.');
  let json;
  try { json = new TextDecoder().decode(await pipe(unb64url(text.slice(CODE_PREFIX.length)), new DecompressionStream('deflate'))); }
  catch { throw new Error(damaged); }
  return deserialize(json);
}
