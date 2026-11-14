// The only place a god's numbers change. Every change writes a ledger row in
// the same call, so the numbers on screen and the ledger cannot disagree
// (test/invariants.test.js: start + sum(ledger) == value, for every meter of
// both gods, every season). Rows for the same season, god, meter and reason
// are added together so the save stays small.
//
// A clamped change records what actually happened, not what was asked for:
// Mystery at 99 plus 5 is a row of +1.

import { CONFIG } from '../data/config.data.js';

export const METERS = ['faith', 'power', 'mystery', 'offerings', 'devotion', 'heresy', 'entitlement', 'souls'];
const LIMITS = {
  faith: [0, Infinity], power: [0, CONFIG.powerCap], mystery: [0, 100], offerings: [0, Infinity],
  devotion: [0, 10], heresy: [0, Infinity], entitlement: [0, Infinity], souls: [0, Infinity],
};

export function gain(s, gi, meter, amount, reason) {
  if (!Number.isFinite(amount)) throw new Error(`gain: ${meter} by a non-finite amount for "${reason}"`);
  const g = s.gods[gi];
  const [lo, hi] = LIMITS[meter];
  const next = Math.min(hi, Math.max(lo, g[meter] + amount));
  const d = next - g[meter];
  if (d === 0) return 0;
  g[meter] = next;
  const L = s.ledger;
  for (let i = L.length - 1; i >= 0 && L[i][0] === s.season; i--) {
    const r = L[i];
    if (r[1] === gi && r[2] === meter && r[4] === reason) { r[3] += d; return d; }
  }
  L.push([s.season, gi, meter, d, reason]);
  return d;
}

// Souls move between gods and the Unbothered, always within one region; every
// move writes the gods' ledger rows. `from`/`to` are a god's index or 'u'.
export function moveSouls(s, from, to, n, reason, ri) {
  const r = s.regions[ri];
  if (!r) throw new Error(`moveSouls: no region ${ri}`);
  const have = from === 'u' ? r.unbothered : r.held[from];
  n = Math.max(0, Math.min(Math.floor(n), have));
  if (!n) return 0;
  if (from === 'u') r.unbothered -= n; else { r.held[from] -= n; gain(s, from, 'souls', -n, reason); }
  if (to === 'u') r.unbothered += n; else { r.held[to] += n; gain(s, to, 'souls', n, reason); }
  return n;
}

/** This season's rows for one god, as { meter: { reason: amount } }. */
export function seasonAccount(s, gi, season = s.season) {
  const out = {};
  // A season's rows are at the end of the ledger; read back until an older season.
  for (let i = s.ledger.length - 1; i >= 0 && s.ledger[i][0] >= season; i--) {
    const [t, g, m, a, r] = s.ledger[i];
    if (t !== season || g !== gi) continue;
    (out[m] ||= {})[r] = (out[m][r] || 0) + a;
  }
  return out;
}
