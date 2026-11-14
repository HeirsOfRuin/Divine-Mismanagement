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
import { render, slotText, riderText, title, aftermathChoices } from './render.js';
import { unspent, spend } from './deck.js';

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
// this trait to do. They change the verse they are given. `x` carries the
// playthrough's spent decks (deck.js): authored wording is drawn only from what
// this run has not used yet, and `x.use(deck, id)` records the draw.
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

  drunk(v, rng, f, x) {
    if (v.bare || v.gist) return null;
    const c = [];
    const verbs = v.verb.cur === v.verb.base ? x.left('verb', VERBS[v.verb.base].drunk) : [];
    if (verbs.length) c.push({ k: 'verb', weight: 1 });
    for (const k of ['object', 'tail']) {
      const s = v[k];
      if (s && !s.via && !s.lit && x.left('phrase', PHRASES[s.cur].drunk).length) c.push({ k, weight: 3 });
    }
    const pick = rng.weighted(c);
    if (!pick) return null;
    if (pick.k === 'verb') {
      const was = VERBS[v.verb.cur].text;
      v.verb.cur = x.use('verb', rng.pick(verbs));
      return `heard "${VERBS[v.verb.cur].text}" for "${was}"`;
    }
    const s = v[pick.k];
    const was = slotText(s);
    s.cur = x.use('phrase', rng.pick(x.left('phrase', PHRASES[s.cur].drunk)));
    s.via = 'drunk';
    return `heard "${slotText(s)}" for "${was}"`;
  },

  poet(v, rng, f, x) {
    const c = [];
    const o = v.object;
    if (o && !o.via && !o.lit && x.left('phrase', PHRASES[o.cur].poet).length) c.push({ k: 'object', weight: 4 });
    // The stock endings are few; reach for one mostly when the object offers nothing.
    const endings = x.left('phrase', POET_TAILS);
    if ((!v.tail || v.tail.via !== 'poet') && endings.length) c.push({ k: 'tail', weight: 1 });
    const pick = rng.weighted(c);
    const softened = !v.modal.let;
    if (!pick && !softened) return null;
    v.bare = false;
    v.modal.let = true; v.modal.lit = false; v.modal.strength = 1;
    if (!pick) return 'softened it to "Let"';
    if (pick.k === 'object') {
      const was = slotText(o);
      o.cur = x.use('phrase', rng.pick(x.left('phrase', PHRASES[o.cur].poet))); o.via = 'poet';
      return `improved "${was}" to "${slotText(o)}"`;
    }
    const was = v.tail ? slotText(v.tail) : null;
    const id = x.use('phrase', rng.pick(endings));
    v.tail = { base: v.tail ? v.tail.base : null, cur: id, via: 'poet', lit: false };
    return was ? `improved "${was}" to "${slotText(v.tail)}"` : `added "${slotText(v.tail)}"`;
  },

  literalist(v, rng, f, x) {
    if (v.bare) return null;
    // Something odd already in the verse is taken at its word first.
    // A literal reading is authored wording too: each is read out once a run.
    const readable = (s) => s && !s.lit && PHRASES[s.cur].literal && x.left('literal', [s.cur]).length;
    const modalKey = () => `${v.modal.let ? 1 : v.modal.strength}${v.modal.neg && !v.gist ? 'n' : 'p'}`;
    const odd = ['object', 'tail'].filter((k) => v[k] && v[k].via && readable(v[k]));
    let k = odd.length ? rng.pick(odd) : null;
    if (!k) {
      const c = [];
      for (const s of ['tail', 'object']) {
        if (readable(v[s])) c.push({ k: s, weight: 3 });
      }
      if (!v.modal.lit && x.left('modal', [modalKey()]).length) c.push({ k: 'modal', weight: 2 });
      const pick = rng.weighted(c);
      if (!pick) return null;
      k = pick.k;
    }
    if (k === 'modal') {
      const wasLet = v.modal.let;
      x.use('modal', modalKey());
      if (wasLet) v.modal.strength = 1;
      v.modal.let = false; v.modal.lit = true;
      return wasLet ? 'took "Let" to mean permission, and said so' : 'spelled out exactly how binding it is';
    }
    const was = slotText(v[k]);
    x.use('literal', v[k].cur);
    v[k].lit = true;
    return `took "${was}" at its word`;
  },

  zealot(v, rng, f, x) {
    const before = JSON.stringify([v.modal.strength, v.who.scope, v.penalty, v.modal.let, v.bare]);
    v.bare = false;
    v.modal.let = false;
    // A Zealot never passes on less than a law: at least "must", one step up if already there.
    v.modal.strength = Math.min(4, Math.max(3, v.modal.strength + 1));
    v.who.scope = Math.min(4, v.who.scope + 1);
    v.who.zeal = true;
    let threat = '';
    {
      const threats = x.left('threat', PENALTIES.map((p) => p.id));
      if (!v.penalty) {
        if (threats.length) { v.penalty = { id: x.use('threat', rng.pick(threats)), twice: false }; threat = ', and added a threat'; }
      }
      else if (!v.penalty.twice) { v.penalty.twice = true; threat = ', and doubled the threat'; }
    }
    if (before === JSON.stringify([v.modal.strength, v.who.scope, v.penalty, v.modal.let, v.bare])) return null;
    return `made it stricter and wider${threat}`;
  },

  ambitious(v, rng, f, x) {
    const prev = v.rider;
    // Each follower has each clause in them once. The trade's own clause is
    // likelier, and is shared by everyone in that trade.
    const kinds = [...RIDERS.map((r) => r.id), 'trade', 'trade']
      .filter((k) => x.left('rider', [k === 'trade' ? `trade:${f.trade.id}` : `${k}:${f.id}`]).length);
    if (!kinds.length) return null;
    const kind = rng.pick(kinds);
    x.use('rider', kind === 'trade' ? `trade:${f.trade.id}` : `${kind}:${f.id}`);
    v.bare = false;
    v.rider = { by: f.id, name: f.name, good: f.trade.good, trade: f.trade.id, kind };
    return prev && prev.by !== f.id
      ? `struck out ${prev.name}'s clause and added their own`
      : 'added a clause of their own';
  },
};

// `spent` is the playthrough's spent decks; the new one is returned, never
// changed in place. `drew` lists the authored content this step used.
export function applyTrait(verse, trait, rng, follower, spent = {}) {
  const v = structuredClone(verse);
  const x = {
    spent,
    drew: [],
    left(deck, ids) { return ids ? unspent(this.spent, deck, ids) : []; },
    use(deck, id) { this.spent = spend(this.spent, deck, id); this.drew.push({ deck, id }); return id; },
  };
  const note = OPS[trait](v, rng, follower, x);
  return { verse: v, note, spent: x.spent, drew: x.drew };
}

export function transmit(revelation, chain, rng, spent = {}) {
  let verse = structuredClone(revelation);
  const steps = [];
  for (const f of chain) {
    for (const trait of f.traits) {
      const r = applyTrait(verse, trait, rng, f, spent);
      verse = r.verse; spent = r.spent;
      steps.push({ by: f.id, trait, note: r.note, changed: r.note !== null, text: render(verse), drew: r.drew });
    }
  }
  return { steps, final: verse, spent };
}

const ORDINALS = ['', 'Second ', 'Third ', 'Fourth ', 'Fifth ', 'Sixth ', 'Seventh ', 'Eighth ', 'Ninth ', 'Tenth '];

// What goes on the Tablet: the words, a title no other verse of this run has,
// and an aftermath line this run has not shown before (or none: silence is
// not a repeat).
export function carve(final, original, spent = {}) {
  const base = title(final);
  const n = (spent.title || []).filter((t) => t === base).length;
  const name = n === 0 ? base : base.replace(/^the /, `the ${ORDINALS[n] ?? `${n + 1}th `}`);
  spent = { ...spent, title: [...(spent.title || []), base] };
  const pick = aftermathChoices(final, original).find((a) => unspent(spent, 'after', [a.id]).length);
  if (pick) spent = spend(spent, 'after', pick.id);
  return { title: name, text: render(final), after: pick ? pick.text : null, spent };
}
