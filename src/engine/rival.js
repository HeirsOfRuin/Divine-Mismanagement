// The rival gods. They play by the player's rules, through the same preview()
// and resolve() (game-building rule 7). Each follows one written policy,
// deliberately not clever, weighted by their persona (src/data/match.data.js):
//
//  - staffs blind for her first year, then by what she has seen, preferring
//    whoever brings in the most Faith (Gate B showed that is the wrong thing to want);
//  - builds in a fixed order;
//  - answers her people before anyone else can, and defends hardest when she
//    is down to her last few (open item 1 of docs/BALANCE.md);
//  - reveals when she lacks doctrine, argues when she would win, smites the
//    god who took her people last season, and likes a sign in the sky;
//  - settles her own troubles (rulings) by a fixed valuation, with no prose.

import { CONFIG } from '../data/config.data.js';
import { TEMPLATES } from '../data/lexicon.data.js';
import { OFFICE_IDS, WORK_IDS } from '../data/offices.data.js';
import { RIVALS } from '../data/match.data.js';
import { EVENTS } from '../data/content/world.data.js';
import { preview } from './acts.js';
import { holder } from './offices.js';
import { gain } from './meters.js';
import { thresholds, unbotheredTotal } from './world.js';

const HER_BELIEF = {
  preacher: ['zealot', 'ambitious', 'drunk', 'literalist', 'lazy', 'poet'],
  missionary: ['zealot', 'drunk', 'ambitious', 'literalist', 'poet', 'lazy'],
  collector: ['zealot', 'ambitious', 'literalist', 'drunk', 'poet', 'lazy'],
  prophet: ['zealot', 'ambitious', 'literalist', 'poet', 'drunk', 'lazy'],
  witness: ['zealot', 'poet', 'ambitious', 'literalist', 'drunk', 'lazy'],
  builder: ['zealot', 'literalist', 'ambitious', 'drunk', 'lazy', 'poet'],
};

export const personaOf = (g) => RIVALS.find((p) => p.id === g.persona) || RIVALS[0];

export function rivalPostings(g, season) {
  const blind = Object.fromEntries(OFFICE_IDS.map((office, i) => [office, g.flock[i * 2].id]));
  if (season <= 4) return blind;
  if (season % 4 !== 1) return {};
  // Once a year she reshuffles by what she has seen.
  const want = {}, taken = new Set();
  const score = (office, f) => (f.known ? HER_BELIEF[office].indexOf(f.traits[0]) : 2.5);
  for (const office of ['preacher', 'missionary', 'collector', 'prophet', 'witness', 'builder']) {
    const pool = g.flock.filter((f) => !taken.has(f.id));
    let best = pool[0];
    for (const f of pool) if (score(office, f) < score(office, best) - (best.office === office ? 0.9 : 0)) best = f;
    want[office] = best.id; taken.add(best.id);
  }
  return want;
}

export const rivalCommission = (g) => WORK_IDS.find((id) => !g.works[id]) || null;

function chainFor(g) {
  const prophet = holder(g, 'prophet') || g.flock[0];
  const chain = [prophet];
  for (let h = 0; h < 4 && chain.length < 3 && chain.length - 1 < Math.floor(g.power); h++) {
    if (h === prophet.household) continue;
    chain.push(g.flock.find((f) => f.household === h));
  }
  return chain.map((f) => f.id);
}

/** Who took her people last season, if anyone. */
function grievance(s, gi) {
  const last = s.chronicle[s.chronicle.length - 1];
  if (!last) return null;
  const rows = s.ledger.filter((r) => r[0] === last.season && r[2] === 'souls' && r[3] > 0 && r[1] !== gi);
  const lost = s.ledger.some((r) => r[0] === last.season && r[1] === gi && r[2] === 'souls' && r[3] < 0);
  if (!lost || !rows.length) return null;
  rows.sort((a, b) => b[3] - a[3]);
  return s.gods[rows[0][1]].fallen ? null : rows[0][1];
}

export function rivalAct(s, gi) {
  const g = s.gods[gi];
  const st = personaOf(g).style;
  const held = new Set(g.tablets.map((t) => t.verse.template));
  const t = TEMPLATES.find((x) => !held.has(x.id));
  const low = g.souls < thresholds(s).fair * CONFIG.closeRanks * 1.5;
  const tries = [];
  // Weighted order: each family of acts is placed by her persona's taste.
  const fam = { kindly: [], hostile: [], reveal: [], miracle: [] };
  const old = g.prayers.find((p) => s.season - p.season >= 2);
  if (old) fam.kindly.push({ kind: 'answer', prayer: old.id });
  fam.kindly.push({ kind: 'festival' });
  const wrong = grievance(s, gi);
  if (wrong !== null) fam.hostile.push({ kind: 'miracle', miracle: 'smite', target: wrong });
  const d = preview(s, gi, { kind: 'dispute' });
  if (d.ok && d.mine > d.hers) fam.hostile.push({ kind: 'dispute' });
  if (t && g.power >= 2) fam.reveal.push({ kind: 'reveal', template: t.id, chain: chainFor(g) });
  if (g.power >= 6 && g.entitlement < 2) fam.miracle.push({ kind: 'miracle', miracle: unbotheredTotal(s) >= 1 ? 'sign' : 'bounty' });
  // The rare acts, by the same rules: a Wonder for those who like a show, a blessing for the rest.
  if (preview(s, gi, { kind: 'wonder' }).ok) fam.miracle.unshift({ kind: 'wonder' });
  if (preview(s, gi, { kind: 'artifact' }).ok) fam.kindly.push({ kind: 'artifact' });
  // Down to her last few, she looks after her own first.
  const order = Object.keys(fam).sort((a, b) => (low && a === 'kindly' ? -1 : low && b === 'kindly' ? 1 : (st[b] || 0) - (st[a] || 0)));
  for (const k of order) tries.push(...fam[k]);
  if (g.prayers.length >= 2) tries.push({ kind: 'answer', prayer: g.prayers[0].id });
  for (const a of tries) if (preview(s, gi, a).ok) return a;
  return { kind: 'silent' };
}

// Her troubles: the same problems the player is brought, settled by a fixed
// valuation, effects only. No line is shown, so nothing is spent.
const value = (e) => (e.faith || 0) + 5 * (e.devotion || 0) + 0.5 * (e.offerings || 0) - 2 * (e.heresy || 0) + 0.1 * (e.mystery || 0);
export function rivalTrouble(s, gi, rng) {
  if (!rng.chance(CONFIG.eventChance)) return;
  const g = s.gods[gi];
  const ev = rng.pick(EVENTS.filter((e) => !e.who && !e.needs));
  const opts = ev.options.filter((o) => !o.need || Object.entries(o.need).every(([m, n]) => g[m] >= n));
  const o = opts.sort((a, b) => value(b.effects) - value(a.effects))[0];
  for (const m of ['faith', 'power', 'mystery', 'offerings', 'devotion', 'heresy']) if (o.effects[m]) gain(s, gi, m, o.effects[m], 'a ruling');
}
