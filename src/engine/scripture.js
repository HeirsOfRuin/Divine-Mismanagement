// What carved Scripture does. Pure.
//
// A verse's effects are computed from its structure every season, never
// stored, so the words on the Tablet and what it does cannot drift apart, and
// a Work built later (the Bell, the Reliquary) changes old verses too.

import { TEMPLATES } from '../data/lexicon.data.js';
import { VERSE } from '../data/offices.data.js';

const hasWork = (g, id) => (g.works[id] ? (g.works[id].useless ? 0 : g.works[id].crooked ? 0.75 : 1) : 0);

export function verseEffects(verse, households, g) {
  const t = TEMPLATES.find((x) => x.id === verse.template);
  let f = 1, odd = 0, tire = 0;
  for (const k of ['object', 'tail']) {
    const expected = k === 'object' ? t.objects.length > 0 : true;
    const slot = verse[k];
    if (!slot) { if (expected) f *= 0.5; continue; }
    if (slot.via) { f *= 0.5; odd++; }
    if (slot.lit) { f *= 1.2; tire += 0.05; }
  }
  if (verse.verb.cur !== verse.verb.base) { f = 0; odd++; }
  if (verse.gist) f *= 0.25;
  if (verse.bare) { f = 0; odd++; }
  if (verse.modal.negDropped) f = -f;            // it now commands what it was sent to forbid
  if (verse.modal.let) f *= 0.5;                 // lovely, and not clearly a rule
  const reach = households / 4;
  const k = f * VERSE.strength[verse.modal.strength] * VERSE.scope[verse.who.scope] * reach;
  const base = VERSE[verse.template];
  const reliquary = hasWork(g, 'reliquary');
  const e = {
    template: verse.template, k, sign: Math.sign(k), odd,
    dev: (base.dev || 0) * k - tire * reach,
    faith: (base.faith || 0) * k,
    off: (base.off || 0) * k,
    convBonus: (base.convBonus || 0) * k,
    heresy: (base.heresy || 0) * k,
    mystery: (verse.modal.let ? 1 : 0) + odd * VERSE.oddMystery * (reliquary ? 1.5 : 1),
    upkeep: reliquary ? 0 : odd * VERSE.oddUpkeep,
    fear: Boolean(verse.penalty || verse.modal.strength === 4),
  };
  if (e.fear) { e.dev += VERSE.fearDev * reach; e.heresy += VERSE.fearHeresy; }
  if (verse.rider) { e.off += VERSE.riderOff; e.heresy += VERSE.riderHeresy; }
  return e;
}

/** All Tablets together: totals, and which pairs contradict. */
export function scriptureSum(g) {
  const sum = { dev: 0, faith: 0, off: 0, convBonus: 0, heresy: 0, mystery: 0, upkeep: 0, doctrine: 0, contradictions: [] };
  const first = {};
  for (const t of g.tablets) {
    const e = verseEffects(t.verse, t.households, g);
    const prior = first[e.template];
    let share = 1;
    if (prior) {
      if (prior.e.sign * e.sign < 0) { sum.heresy += VERSE.contradiction; sum.contradictions.push([prior.id, t.id]); }
      share = VERSE.repeatShare;
    } else first[e.template] = { e, id: t.id };
    for (const k of ['dev', 'faith', 'off', 'convBonus']) sum[k] += e[k] * (e[k] > 0 ? share : 1);
    sum.heresy += e.heresy;
    sum.mystery += e.mystery;
    sum.upkeep += e.upkeep;
    if (e.k > 0) sum.doctrine++;
  }
  sum.faith += sum.doctrine * VERSE.doctrineFaith;
  return sum;
}

export { hasWork };
