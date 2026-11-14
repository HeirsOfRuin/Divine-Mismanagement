// Vellamine, Goddess of Being Noticed: the house rival. She plays by the
// player's rules, through the same preview() and resolve() (game-building rule
// 7). Her policy is a written rule, deliberately not clever. She staffs blind
// for her first year, then by what she has seen, preferring whoever brings in
// the most Faith (which Gate B showed is the wrong thing to want). She builds
// in a fixed order, likes a sign in the sky, answers her people before anyone
// else can, and argues when she would win.

import { TEMPLATES } from '../data/lexicon.data.js';
import { OFFICE_IDS, WORK_IDS } from '../data/offices.data.js';
import { preview } from './acts.js';
import { holder } from './offices.js';

// Her beliefs about who suits what: the loudest, best first.
const HER_BELIEF = {
  preacher: ['zealot', 'ambitious', 'drunk', 'literalist', 'lazy', 'poet'],
  missionary: ['zealot', 'drunk', 'ambitious', 'literalist', 'poet', 'lazy'],
  collector: ['zealot', 'ambitious', 'literalist', 'drunk', 'poet', 'lazy'],
  prophet: ['zealot', 'ambitious', 'literalist', 'poet', 'drunk', 'lazy'],
  witness: ['zealot', 'poet', 'ambitious', 'literalist', 'drunk', 'lazy'],
  builder: ['zealot', 'literalist', 'ambitious', 'drunk', 'lazy', 'poet'],
};

export function rivalPostings(g, season) {
  const blind = Object.fromEntries(OFFICE_IDS.map((office, i) => [office, g.flock[i * 2].id]));
  if (season <= 4 || season % 4 !== 1) return season <= 4 ? blind : {};
  // Once a year she reshuffles by what she has seen.
  const want = {}, taken = new Set();
  const score = (office, f) => (f.known ? HER_BELIEF[office].indexOf(f.traits[0]) : 2.5);
  for (const office of ['preacher', 'missionary', 'collector', 'prophet', 'witness', 'builder']) {
    const pool = g.flock.filter((f) => !taken.has(f.id));
    const best = pool.reduce((a, f) => (score(office, f) < score(office, a) - (f.office === office ? -0.9 : 0) ? f : a), pool[0]);
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

export function rivalAct(s) {
  const g = s.gods[1], gi = 1;
  const held = new Set(g.tablets.filter((t) => t.verse).map((t) => t.verse.template));
  const t = TEMPLATES.find((x) => !held.has(x.id));
  const tries = [];
  const old = g.prayers.find((p) => s.season - p.season >= 2);
  if (old) tries.push({ kind: 'answer', prayer: old.id });
  const d = preview(s, gi, { kind: 'dispute' });
  if (d.ok && d.mine > d.hers) tries.push({ kind: 'dispute' });
  // Losing people to you: she singes your missionary.
  const lost = s.chronicle.length ? s.chronicle[s.chronicle.length - 1].souls.her < 0 : false;
  if (lost) tries.push({ kind: 'miracle', miracle: 'smite' });
  if (t && g.power >= 2) tries.push({ kind: 'reveal', template: t.id, chain: chainFor(g) });
  if (g.power >= 6 && g.entitlement < 2) tries.push({ kind: 'miracle', miracle: s.unbothered >= 1 ? 'sign' : 'bounty' });
  if (g.prayers.length >= 2) tries.push({ kind: 'answer', prayer: g.prayers[0].id });
  if (s.season % 5 === 0) tries.push({ kind: 'miracle', miracle: 'smite' });
  tries.push({ kind: 'festival' });
  for (const a of tries) if (preview(s, gi, a).ok) return a;
  return { kind: 'silent' };
}
