// The telephone game. Pure: (verse, chain, rng) -> { steps, final }.
//
// A Revelation and a carved verse are the same structure. Each follower in the
// chain applies each of their traits, in order; every trait does exactly one
// kind of rewrite. The step records who did what, so the playback screen and
// the Scripture page can always show the cause (the brief's "opaque systems"
// risk).
//
// Verse:
//   who     { scope 1-4, zeal }
//   modal   { strength 1-4, neg, let, lit, negDropped }
//   verb    { base, cur }                       ids into VERBS
//   object  { base, cur, via, lit } | null      ids into PHRASES; via: 'drunk' | 'poet' | null
//   tail    same shape | null
//   rider   { by, name, good, trade, kind } | null
//   penalty { id, twice } | null
//   gist, bare                                  what Lazy leaves when nothing else is left

import { VERBS, PHRASES, POET_TAILS, TEMPLATES } from '../data/lexicon.data.js';
import { PENALTIES, RIDERS } from '../data/phrases.data.js';
import { render, slotText, riderText } from './render.js';

const slot = (id) => (id ? { base: id, cur: id, via: null, lit: false } : null);

export function makeRevelation(templateId, objectId, tailId) {
  const t = TEMPLATES.find((x) => x.id === templateId);
  if (!t) throw new Error(`No template "${templateId}"`);
  if (objectId && !t.objects.includes(objectId)) throw new Error(`"${objectId}" is not an object of ${templateId}`);
  if (tailId && !t.tails.includes(tailId)) throw new Error(`"${tailId}" is not a tail of ${templateId}`);
  return {
    template: t.id,
    who: { scope: t.who, zeal: false },
    modal: { strength: t.strength, neg: t.neg, let: false, lit: false, negDropped: false },
    verb: { base: t.verb, cur: t.verb },
    object: slot(objectId ?? t.objects[0] ?? null),
    tail: slot(tailId ?? t.tails[0] ?? null),
    rider: null,
    penalty: null,
    gist: false,
    bare: false,
  };
}

// Each returns a note saying what was done, or null when there was nothing for
// this trait to do. They change the verse they are given.
const OPS = {
  lazy(v, rng) {
    const c = [];
    // Add-ons go first: Lazy is the player's tool for trimming a rider or a threat.
    if (v.tail) c.push({ k: 'tail', weight: 2 });
    if (v.object) c.push({ k: 'object', weight: 2 });
    if (v.rider) c.push({ k: 'rider', weight: 3 });
    if (v.penalty) c.push({ k: 'penalty', weight: 3 });
    if (v.modal.neg && !v.gist) c.push({ k: 'neg', weight: 2 });
    const pick = rng.weighted(c);
    if (!pick) {
      if (v.bare) return null;
      if (v.gist) { v.bare = true; return 'kept one word'; }
      v.gist = true; v.modal.negDropped = false;
      return 'kept only the gist';
    }
    if (pick.k === 'neg') { v.modal.neg = false; v.modal.negDropped = true; return 'left out the "not"'; }
    if (pick.k === 'rider') { const was = riderText(v.rider); v.rider = null; return `left out "${was.replace(/^, /, '')}"`; }
    if (pick.k === 'penalty') { v.penalty = null; return 'left out the threat'; }
    const was = slotText(v[pick.k]);
    v[pick.k] = null;
    return `left out "${was}"`;
  },

  drunk(v, rng) {
    if (v.bare || v.gist) return null;
    const c = [];
    if (v.verb.cur === v.verb.base && VERBS[v.verb.base].drunk) c.push({ k: 'verb', weight: 1 });
    for (const k of ['object', 'tail']) {
      const s = v[k];
      if (s && !s.via && !s.lit && PHRASES[s.cur].drunk) c.push({ k, weight: 3 });
    }
    const pick = rng.weighted(c);
    if (!pick) return null;
    if (pick.k === 'verb') {
      const was = VERBS[v.verb.cur].text;
      v.verb.cur = rng.pick(VERBS[v.verb.base].drunk);
      return `heard "${VERBS[v.verb.cur].text}" for "${was}"`;
    }
    const s = v[pick.k];
    const was = slotText(s);
    s.cur = rng.pick(PHRASES[s.cur].drunk);
    s.via = 'drunk';
    return `heard "${slotText(s)}" for "${was}"`;
  },

  poet(v, rng) {
    const c = [];
    const o = v.object;
    if (o && !o.via && !o.lit && PHRASES[o.cur].poet) c.push({ k: 'object', weight: 4 });
    // The stock endings are few; reach for one mostly when the object offers nothing.
    if (!v.tail || v.tail.via !== 'poet') c.push({ k: 'tail', weight: 1 });
    const pick = rng.weighted(c);
    const softened = !v.modal.let;
    if (!pick && !softened) return null;
    v.bare = false;
    v.modal.let = true; v.modal.lit = false; v.modal.strength = 1;
    if (!pick) return 'softened it to "Let"';
    if (pick.k === 'object') {
      const was = slotText(o);
      o.cur = rng.pick(PHRASES[o.cur].poet); o.via = 'poet';
      return `improved "${was}" to "${slotText(o)}"`;
    }
    const was = v.tail ? slotText(v.tail) : null;
    const id = rng.pick(POET_TAILS);
    v.tail = { base: v.tail ? v.tail.base : null, cur: id, via: 'poet', lit: false };
    return was ? `improved "${was}" to "${slotText(v.tail)}"` : `added "${slotText(v.tail)}"`;
  },

  literalist(v, rng) {
    if (v.bare) return null;
    // Something odd already in the verse is taken at its word first.
    const odd = ['object', 'tail'].filter((k) => v[k] && v[k].via && !v[k].lit && PHRASES[v[k].cur].literal);
    let k = odd.length ? rng.pick(odd) : null;
    if (!k) {
      const c = [];
      for (const s of ['tail', 'object']) {
        if (v[s] && !v[s].lit && PHRASES[v[s].cur].literal) c.push({ k: s, weight: 3 });
      }
      if (!v.modal.lit) c.push({ k: 'modal', weight: 2 });
      const pick = rng.weighted(c);
      if (!pick) return null;
      k = pick.k;
    }
    if (k === 'modal') {
      const wasLet = v.modal.let;
      v.modal.let = false; v.modal.lit = true;
      return wasLet ? 'took "Let" to mean permission, and said so' : 'spelled out exactly how binding it is';
    }
    const was = slotText(v[k]);
    v[k].lit = true;
    return `took "${was}" at its word`;
  },

  zealot(v, rng) {
    const before = JSON.stringify([v.modal.strength, v.who.scope, v.penalty, v.modal.let, v.bare]);
    v.bare = false;
    v.modal.let = false;
    // A Zealot never passes on less than a law: at least "must", one step up if already there.
    v.modal.strength = Math.min(4, Math.max(3, v.modal.strength + 1));
    v.who.scope = Math.min(4, v.who.scope + 1);
    v.who.zeal = true;
    let threat = '';
    {
      if (!v.penalty) { v.penalty = { id: rng.pick(PENALTIES).id, twice: false }; threat = ', and added a threat'; }
      else if (!v.penalty.twice) { v.penalty.twice = true; threat = ', and doubled the threat'; }
    }
    if (before === JSON.stringify([v.modal.strength, v.who.scope, v.penalty, v.modal.let, v.bare])) return null;
    return `made it stricter and wider${threat}`;
  },

  ambitious(v, rng, f) {
    const prev = v.rider;
    const kind = rng.pick([...RIDERS.map((r) => r.id), 'trade', 'trade']);
    v.bare = false;
    v.rider = { by: f.id, name: f.name, good: f.trade.good, trade: f.trade.id, kind };
    return prev && prev.by !== f.id
      ? `struck out ${prev.name}'s clause and added their own`
      : 'added a clause of their own';
  },
};

export function applyTrait(verse, trait, rng, follower) {
  const v = structuredClone(verse);
  const note = OPS[trait](v, rng, follower);
  return { verse: v, note };
}

export function transmit(revelation, chain, rng) {
  let verse = structuredClone(revelation);
  const steps = [];
  for (const f of chain) {
    for (const trait of f.traits) {
      const r = applyTrait(verse, trait, rng, f);
      verse = r.verse;
      steps.push({ by: f.id, trait, note: r.note, changed: r.note !== null, text: render(verse) });
    }
  }
  return { steps, final: verse };
}
