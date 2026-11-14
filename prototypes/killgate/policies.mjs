// Gate B: fixed policies, each a written rule. A policy may read a devotee's
// trait only once it is known (f.known): traits are hidden until a devotee has
// carried a message, held an office for a season, or been sent a dream.

import { TEMPLATES } from '../../src/data/lexicon.data.js';
import { OFFICES } from './model.mjs';

const seen = (f) => (f.known ? f.traits[0] : null);

// What the careful bot believes about who suits what, best first. The
// ablation in gate.mjs measures whether the beliefs are true.
export const BELIEF = {
  prophet:    ['literalist', 'zealot', 'ambitious', 'poet', 'lazy', 'drunk'],
  preacher:   ['zealot', 'ambitious', 'drunk', 'literalist', 'lazy', 'poet'],
  missionary: ['drunk', 'zealot', 'ambitious', 'literalist', 'poet', 'lazy'],
  collector:  ['zealot', 'ambitious', 'literalist', 'drunk', 'lazy', 'poet'],
  builder:    ['zealot', 'literalist', 'drunk', 'ambitious', 'lazy', 'poet'],
  witness:    ['poet', 'zealot', 'literalist', 'drunk', 'lazy', 'ambitious'],
};
const CARRIER = ['literalist', 'zealot', 'ambitious', 'poet', 'lazy', 'drunk'];   // who to trust with a message
const rank = (list, f) => { const t = seen(f); return t ? list.indexOf(t) : 2.5; };

const staffNone = () => ({});
// Six people picked without looking, and left there.
const staffBlind = (g) => Object.fromEntries(OFFICES.map((o, i) => [o, g.flock[i * 2].id]));
// Best known fit for each office, most valuable office first. A holder is
// replaced only by someone known to be clearly better: moving costs a season.
function staffAware(g, belief = BELIEF, fixed = {}) {
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

const BUILD = ['shrine', 'bell', 'box', 'feast_hall', 'guest_house', 'reliquary'];
const buildNext = (g) => BUILD.find((id) => !g.works[id]) || null;

const nextTemplate = (g) => {
  const held = new Set(g.tablets.filter((t) => t.effects.k > 0).map((t) => t.verse.template));
  return TEMPLATES.find((t) => !held.has(t.id)) || null;
};
const onePerHouse = (g, n) => [0, 1, 2, 3].slice(0, n).map((h) => g.flock.find((f) => f.household === h).id);

function revealAct(g, links) {
  const t = nextTemplate(g) || TEMPLATES[g.n.reveal % TEMPLATES.length];
  return { type: 'reveal', template: t.id, chain: onePerHouse(g, links) };
}

// Aims the idiots: the Prophet, then from each other household the most
// trustworthy known carrier, leaving out a household whose best is a liability.
function aimedReveal(g, template) {
  const prophet = g.flock.find((f) => f.office === 'prophet' && f.settling === 0) || g.flock[0];
  const chain = [prophet];
  for (let h = 0; h < 4 && chain.length - 1 < Math.floor(g.power); h++) {
    if (h === prophet.household) continue;
    const best = g.flock.filter((f) => f.household === h).sort((x, y) => rank(CARRIER, x) - rank(CARRIER, y))[0];
    if (rank(CARRIER, best) <= 2.5) chain.push(best);
  }
  return { type: 'reveal', template, chain: chain.map((f) => f.id) };
}

function need(g) {
  const held = new Set(g.tablets.filter((t) => t.effects.k > 0).map((t) => t.verse.template));
  const order = [];
  if (g.heresy > 4) order.push('borrow');
  if (g.devotion < 5) order.push('rest', 'wash');
  order.push('welcome', 'share', 'rest', 'wash', 'borrow');
  return order.find((id) => !held.has(id)) || null;
}

function adaptiveActs(g, o, w, { silence = true } = {}) {
  const c = w.cfg.costs, acts = [];
  let power = g.power;
  if (silence && g.mystery < 35) return [];                      // let awe recover
  const stranger = g.flock.find((f) => !f.known);
  if (w.season <= 4 && stranger && power >= c.dream + 2) { acts.push({ type: 'dream', id: stranger.id }); power -= c.dream; }
  const t = need(g);
  if (t && power >= 2) { const a = aimedReveal(g, t); acts.push(a); power -= a.chain.length - 1; }
  if (g.works.feast_hall && g.offerings >= c.festival + 2) acts.push({ type: 'festival' });
  if (o.prayers >= 3 && power >= c.poach + 1) { acts.push({ type: 'poach' }); power -= c.poach; }
  if (g.mystery >= 55 && g.entitlement < 2) {
    const kind = w.unbothered >= 1 ? 'sign' : (o.missionaryOut === 0 ? 'smite' : 'bounty');
    if (power >= c[kind]) { acts.push({ type: 'miracle', kind }); power -= c[kind]; }
  }
  if (g.prayers >= 2 && g.entitlement < 2.5 && power >= c.answer) acts.push({ type: 'answer' });
  return acts;
}

const miracleSpam = (g, o, w) => ['sign', 'bounty', 'smite'].map((kind, i) => ({ type: 'miracle', kind: ['sign', 'bounty', 'smite'][(w.season + i) % 3] })).slice(0, 2);

function crusade(g, o, w) {
  const c = w.cfg.costs, acts = [];
  let power = g.power;
  if (o.prayers >= 3 && power >= c.poach) { acts.push({ type: 'poach' }); power -= c.poach; }
  if (o.missionaryOut === 0 && power >= c.smite) { acts.push({ type: 'miracle', kind: 'smite' }); power -= c.smite; }
  return acts.length < 2 ? [...acts, ...adaptiveActs({ ...g, power }, o, w)] : acts;
}

export const POLICIES = {
  silent:        { note: 'Posts nobody, does nothing', postings: staffNone, acts: () => [] },
  staff_blind:   { note: 'Six postings picked without looking; no acts', postings: staffBlind, acts: () => [], build: buildNext },
  staff_aware:   { note: 'Best known fit in each office; no acts', postings: (g) => staffAware(g), acts: () => [], build: buildNext },
  miracles:      { note: 'Blind postings; two miracles a season while Power lasts', postings: staffBlind, acts: miracleSpam, build: buildNext },
  short_chain:   { note: 'Blind postings; a Revelation through two people whenever one is missing', postings: staffBlind, acts: (g) => (nextTemplate(g) ? [revealAct(g, 2)] : []), build: buildNext },
  long_chain:    { note: 'Blind postings; a Revelation through all four households', postings: staffBlind, acts: (g) => (nextTemplate(g) ? [revealAct(g, 4)] : []), build: buildNext },
  no_staff:      { note: 'Never posts anyone; otherwise plays the adaptive acts', postings: staffNone, acts: (g, o, w) => adaptiveActs(g, o, w) },
  no_scripture:  { note: 'Adaptive, but never sends a Revelation', postings: (g) => staffAware(g), acts: (g, o, w) => adaptiveActs(g, o, w).filter((a) => a.type !== 'reveal'), build: buildNext },
  adaptive:      { note: 'Aware postings, aimed chains, miracles when awe is high, silence when it is low', postings: (g) => staffAware(g), acts: (g, o, w) => adaptiveActs(g, o, w), build: buildNext },
  rests_third:   { note: 'Adaptive, and says nothing every third season', postings: (g) => staffAware(g), acts: (g, o, w) => (w.season % 3 === 0 ? [] : adaptiveActs(g, o, w, { silence: false })), build: buildNext },
  crusader:      { note: 'Adaptive postings; spends Power on the rival first: smites her missionary, takes her neglected followers', postings: (g) => staffAware(g), acts: crusade, build: buildNext },
  never_silent:  { note: 'Adaptive, but never rests', postings: (g) => staffAware(g), acts: (g, o, w) => adaptiveActs(g, o, w, { silence: false }), build: buildNext },
};

// The house rival: staffs without looking, builds, and works a sign when she
// has Power to spare. Popular, not clever.
export const RIVAL = {
  note: 'Vellamine',
  postings: staffBlind,
  build: buildNext,
  acts: (g, o, w) => {
    const acts = [];
    if (g.power >= 6 && g.entitlement < 2) acts.push({ type: 'miracle', kind: w.unbothered >= 1 ? 'sign' : 'bounty' });
    if (w.season % 4 === 0 && nextTemplate(g)) acts.push(revealAct(g, 3));
    if (g.prayers >= 2 && g.power >= 2) acts.push({ type: 'answer' });
    return acts;
  },
};

export { staffAware, adaptiveActs, buildNext };
