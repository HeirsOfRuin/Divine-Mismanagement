// The reference players. They do not need to play WELL; they need to play
// CONSISTENTLY, each by a written rule, so two runs are comparable.
//  - They act only through what the engine previews as allowed.
//  - They answer every decision explicitly (postings, commission, act, ruling).
//  - They read a devotee's trait only once it is known, as a player must.
// Ported from the kill-gate policies (prototypes/killgate/policies.mjs), with
// one act a season (the author's decision of 2026-11-14).

import { TEMPLATES } from '../src/data/lexicon.data.js';
import { OFFICE_IDS, WORK_IDS } from '../src/data/offices.data.js';
import { CONFIG } from '../src/data/config.data.js';
import { preview, orders, rulingOptions, ruleOn } from '../src/engine/turn.js';
import { streamFor } from '../src/engine/rng.js';

const seen = (f) => (f.known ? f.traits[0] : null);

// Who suits which office, best first, as a player who has learnt the game
// believes it. Gate B measured the kill-gate version; docs/BALANCE.md measures
// this one against the engine.
export const BELIEF = {
  prophet:    ['literalist', 'zealot', 'ambitious', 'lazy', 'poet', 'drunk'],
  preacher:   ['lazy', 'drunk', 'poet', 'literalist', 'zealot', 'ambitious'],
  missionary: ['zealot', 'drunk', 'ambitious', 'literalist', 'poet', 'lazy'],
  collector:  ['ambitious', 'zealot', 'literalist', 'drunk', 'poet', 'lazy'],
  builder:    ['literalist', 'zealot', 'drunk', 'ambitious', 'lazy', 'poet'],
  witness:    ['poet', 'zealot', 'literalist', 'ambitious', 'drunk', 'lazy'],
};
const CARRIER = ['literalist', 'zealot', 'ambitious', 'poet', 'lazy', 'drunk'];
const rank = (list, f) => { const t = seen(f); return t ? list.indexOf(t) : 2.5; };

const staffNone = () => ({});
const staffBlind = (g) => Object.fromEntries(OFFICE_IDS.map((o, i) => [o, g.flock[i * 2].id]));
// Best known fit, most valuable office first; a holder is replaced only by
// someone known to be clearly better, because moving costs a season.
export function staffAware(g, belief = BELIEF, fixed = {}) {
  const want = { ...fixed }, taken = new Set(Object.values(fixed));
  for (const office of ['preacher', 'missionary', 'collector', 'prophet', 'witness', 'builder']) {
    if (office in fixed) continue;
    const cur = g.flock.find((f) => f.office === office && !taken.has(f.id));
    const free = g.flock.filter((f) => !taken.has(f.id) && (!f.office || f.office === office));
    let best = cur || free[0];
    for (const f of free) if (rank(belief[office], f) < rank(belief[office], best) - (best === cur ? 0.9 : 0)) best = f;
    if (best) { want[office] = best.id; taken.add(best.id); }
  }
  return want;
}
const buildNext = (g) => (g.building ? g.building.id : WORK_IDS.find((id) => !g.works[id]) || null);

const goodHeld = (g) => new Set(g.tablets.filter((t) => t.verse.verb.cur === t.verse.verb.base && !t.verse.modal.negDropped).map((t) => t.verse.template));
const nextTemplate = (g) => TEMPLATES.find((t) => !goodHeld(g).has(t.id)) || null;
const onePerHouse = (g, n) => {
  const prophet = g.flock.find((f) => f.office === 'prophet' && f.settling === 0);
  const chain = prophet ? [prophet] : [];
  for (let h = 0; h < 4 && chain.length < n; h++) if (!chain.some((f) => f.household === h)) chain.push(g.flock.find((f) => f.household === h));
  return chain.map((f) => f.id);
};
const plainReveal = (g, n) => { const t = nextTemplate(g); return t ? { kind: 'reveal', template: t.id, chain: onePerHouse(g, n) } : null; };

function need(g) {
  const held = goodHeld(g);
  const order = [];
  if (g.heresy > 4) order.push('borrow');
  if (g.devotion < 5) order.push('rest', 'wash');
  order.push('welcome', 'share', 'rest', 'wash', 'borrow');
  return order.find((id) => !held.has(id)) || null;
}

// The Prophet, then from each other household the most trustworthy known
// carrier, leaving out a household whose best is a known liability.
function aimedReveal(g, template) {
  const prophet = g.flock.find((f) => f.office === 'prophet' && f.settling === 0) || g.flock[0];
  const chain = [prophet];
  for (let h = 0; h < 4 && chain.length - 1 < Math.floor(g.power); h++) {
    if (h === prophet.household) continue;
    const best = g.flock.filter((f) => f.household === h).sort((x, y) => rank(CARRIER, x) - rank(CARRIER, y))[0];
    if (rank(CARRIER, best) <= 2.5) chain.push(best);
  }
  return { kind: 'reveal', template, chain: chain.map((f) => f.id) };
}

function adaptive(s, { rest = true } = {}) {
  const [g, o] = s.gods, c = CONFIG.costs;
  if (rest && g.mystery < 35) return { kind: 'silent' };
  const t = need(g);
  const tries = [];
  if (t && g.power >= 2) tries.push(aimedReveal(g, t));
  tries.push({ kind: 'festival' });
  if (g.power >= c.poach + 1) tries.push({ kind: 'poach' });
  if (g.mystery >= 55 && g.entitlement < 2) tries.push({ kind: 'miracle', miracle: s.unbothered >= 1 ? 'sign' : o.missionaryOut === 0 ? 'smite' : 'bounty' });
  if (g.prayers.length >= 2 && g.entitlement < 2.5) tries.push({ kind: 'answer', prayer: g.prayers[0].id });
  tries.push({ kind: 'dispute' });
  return tries;
}

function crusade(s) {
  const [g, o] = s.gods;
  const tries = [];
  tries.push({ kind: 'poach' });
  if (o.missionaryOut === 0) tries.push({ kind: 'miracle', miracle: 'smite' });
  tries.push({ kind: 'dispute' });
  const rest = adaptive(s);
  return Array.isArray(rest) ? [...tries, ...rest] : [...tries, rest];
}

// Something to do rather than nothing: any prayer, then a dream, then a bounty.
const fillers = (s) => [...s.gods[0].prayers.map((p) => ({ kind: 'answer', prayer: p.id })), ...s.gods[0].flock.map((f) => ({ kind: 'dream', id: f.id })), { kind: 'miracle', miracle: 'bounty' }];

const miracleSpam = (s) => [{ kind: 'miracle', miracle: ['sign', 'bounty', 'smite'][s.season % 3] }, { kind: 'miracle', miracle: 'bounty' }];

export const POLICIES = {
  silent:       { note: 'Posts nobody, does nothing', staff: staffNone, act: () => [] },
  staff_blind:  { note: 'Six postings picked without looking; no acts', staff: staffBlind, act: () => [], build: buildNext },
  staff_aware:  { note: 'Best known fit in each office; no acts', staff: (g) => staffAware(g), act: () => [], build: buildNext },
  miracles:     { note: 'Blind postings; a miracle every season it can afford', staff: staffBlind, act: miracleSpam, build: buildNext },
  short_chain:  { note: 'Blind postings; a Revelation through two people when one is missing', staff: staffBlind, act: (s) => [plainReveal(s.gods[0], 2)], build: buildNext },
  long_chain:   { note: 'Blind postings; a Revelation through all four households', staff: staffBlind, act: (s) => [plainReveal(s.gods[0], 4)], build: buildNext },
  no_staff:     { note: 'Never posts anyone; otherwise adaptive', staff: staffNone, act: (s) => adaptive(s) },
  no_scripture: { note: 'Adaptive, but never a Revelation', staff: (g) => staffAware(g), act: (s) => [].concat(adaptive(s)).filter((a) => a.kind !== 'reveal'), build: buildNext },
  adaptive:     { note: 'Aware postings, aimed chains, miracles when awe is high, rests when it is low', staff: (g) => staffAware(g), act: (s) => adaptive(s), build: buildNext },
  never_silent: { note: 'Adaptive, but never silent: with nothing better to do it answers a prayer or sends a dream', staff: (g) => staffAware(g), act: (s) => [...[].concat(adaptive(s, { rest: false })), ...fillers(s)], build: buildNext },
  rests_third:  { note: 'Adaptive, and silent every third season', staff: (g) => staffAware(g), act: (s) => (s.season % 3 === 0 ? [] : adaptive(s, { rest: false })), build: buildNext },
  crusader:     { note: 'Adaptive postings; goes after the rival first', staff: (g) => staffAware(g), act: crusade, build: buildNext },
  random:       { note: 'Random postings, random allowed acts, random rulings', random: true },
};

// A ruling is scored by a fixed valuation of its effects, best allowed option taken.
const value = (e) => (e.faith || 0) + 3 * (e.souls || 0) + 5 * (e.devotion || 0) + 0.5 * (e.offerings || 0) - 2 * (e.heresy || 0) + 0.1 * (e.mystery || 0) + (e.power || 0) + 2 * -(e.rivalSouls || 0);

/** One season of decisions: returns { state (with postings applied), input }. */
export function decide(s, policyName = 'adaptive', fixed = {}) {
  const pol = POLICIES[policyName];
  if (!pol) throw new Error(`no policy ${policyName}`);
  const g = s.gods[0];
  if (s.event) {
    const opts = rulingOptions(s).filter((o) => o.ok);
    s = ruleOn(s, pol.random ? streamFor(s.seed, s.season, 'bot-ruling').pick(opts).i : opts.sort((a, b) => value(b.effects) - value(a.effects) || a.i - b.i)[0].i);
  }
  if (pol.random) return decideRandom(s);
  const want = { ...(pol.staff ? pol.staff(g) : {}), ...fixed };
  if (Object.keys(fixed).length && pol.staff === undefined) Object.assign(want, fixed);
  const postings = Object.fromEntries(OFFICE_IDS.filter((o) => o in want).map((o) => [o, want[o]]));
  let work;
  if (pol.build) { const w = pol.build(g); if (w && !g.works[w] && (!g.building || !g.building.paid)) work = w; }
  s = orders(s, { postings, commission: work });
  const tries = [].concat(pol.act(s) || []).filter(Boolean);
  const act = tries.find((a) => preview(s, 0, a).ok) || { kind: 'silent' };
  return { state: s, input: { act } };
}

function decideRandom(s) {
  const rng = streamFor(s.seed, s.season, 'bot');
  const g = s.gods[0];
  const postings = Object.fromEntries(OFFICE_IDS.filter(() => rng.chance(0.3)).map((o) => [o, rng.pick(g.flock).id]));
  const free = WORK_IDS.filter((id) => !g.works[id]);
  s = orders(s, { postings, commission: free.length && !g.building ? rng.pick(free) : undefined });
  const t = rng.pick(TEMPLATES);
  const me = s.gods[0];
  const options = [
    { kind: 'silent' }, { kind: 'reveal', template: t.id, chain: onePerHouse(me, rng.range(1, 4)) },
    { kind: 'miracle', miracle: rng.pick(['bounty', 'sign', 'smite']) }, { kind: 'festival' }, { kind: 'poach' }, { kind: 'dispute' },
    me.prayers.length ? { kind: 'answer', prayer: rng.pick(me.prayers).id } : null,
    { kind: 'dream', id: rng.pick(me.flock).id },
  ].filter((a) => a && preview(s, 0, a).ok);
  return { state: s, input: { act: rng.pick(options) } };
}
