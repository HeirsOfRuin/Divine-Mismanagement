// The telephone game: each trait does exactly its rewrite, the same seed gives
// the same verse, and no reachable verse renders broken.
import test from 'node:test';
import assert from 'node:assert/strict';
import { makeRng, streamFor } from '../src/engine/rng.js';
import { makeRevelation, applyTrait, transmit, carve } from '../src/engine/telephone.js';
import { spend } from '../src/engine/deck.js';
import { playthrough } from '../tools/telephone.mjs';
import { render, title, aftermath } from '../src/engine/render.js';
import { makeFlock } from '../src/engine/followers.js';
import { TEMPLATES, PHRASES, VERBS, POET_TAILS } from '../src/data/lexicon.data.js';
import { TRAIT_IDS } from '../src/data/traits.data.js';

const F = { id: 'f01', name: 'Wilf', trade: { id: 'carpenter', label: 'the Carpenter', good: 'a stool' }, household: 0, traits: [] };
const base = () => makeRevelation('wash', 'hands', 'before_meals');

test('a Revelation renders as sent', () => {
  assert.equal(render(base()), 'The faithful should wash their hands before meals.');
  assert.equal(render(makeRevelation('borrow', 'tools', 'without_asking')), 'The faithful should not borrow tools without asking.');
  assert.equal(render(makeRevelation('rest', null, 'midday')), 'The faithful may rest at midday.');
});

test('applying a trait never changes the verse it was given', () => {
  const v = base(); const before = JSON.stringify(v);
  for (const t of TRAIT_IDS) applyTrait(v, t, makeRng(5), F);
  assert.equal(JSON.stringify(v), before);
});

test('Zealot: at least "must", one scope wider, and a threat', () => {
  const { verse } = applyTrait(base(), 'zealot', makeRng(1), F);
  assert.equal(verse.modal.strength, 3);
  assert.equal(verse.who.scope, 3);
  assert.ok(verse.penalty);
  assert.match(render(verse), /^ALL must wash their hands before meals, or /);
  const again = applyTrait(verse, 'zealot', makeRng(1), F).verse;
  assert.equal(again.modal.strength, 4);
  assert.equal(again.penalty.twice, true);
});

test('Lazy: removes exactly one thing, and ends at one word', () => {
  for (let seed = 1; seed <= 50; seed++) {
    const { verse } = applyTrait(base(), 'lazy', makeRng(seed), F);
    assert.equal([verse.object, verse.tail].filter(Boolean).length, 1);
  }
  let v = makeRevelation('rest', null, 'midday');
  const texts = [];
  for (let i = 0; i < 4; i++) { v = applyTrait(v, 'lazy', makeRng(1), F).verse; texts.push(render(v)); }
  assert.deepEqual(texts, ['The faithful may rest.', 'The faithful may do something about resting.', 'Resting.', 'Resting.']);
  assert.equal(applyTrait(v, 'lazy', makeRng(1), F).note, null);
});

test('Lazy can drop the "not", and the verse says so', () => {
  let seen = false;
  for (let seed = 1; seed <= 200 && !seen; seed++) {
    const { verse } = applyTrait(makeRevelation('borrow', 'tools', 'without_asking'), 'lazy', makeRng(seed), F);
    if (verse.modal.negDropped) { seen = true; assert.equal(render(verse), 'The faithful should borrow tools without asking.'); }
  }
  assert.ok(seen);
});

test('Drunk: swaps one word for a listed sound-alike, once per slot', () => {
  for (let seed = 1; seed <= 50; seed++) {
    const v0 = base();
    const { verse } = applyTrait(v0, 'drunk', makeRng(seed), F);
    const changed = ['object', 'tail'].filter((k) => verse[k].cur !== v0[k].cur).length + (verse.verb.cur !== v0.verb.cur ? 1 : 0);
    assert.equal(changed, 1);
  }
  let v = base();
  for (let i = 0; i < 5; i++) v = applyTrait(v, 'drunk', makeRng(i + 1), F).verse;
  assert.equal(applyTrait(v, 'drunk', makeRng(9), F).note, null); // every slot already misheard
});

test('Poet: softens to "Let" and glosses one slot', () => {
  const { verse } = applyTrait(base(), 'poet', makeRng(1), F);
  assert.equal(verse.modal.let, true);
  assert.equal(verse.modal.strength, 1);
  assert.match(render(verse), /^Let the faithful wash /);
  assert.ok(verse.object.via === 'poet' || verse.tail.via === 'poet');
});

test('Literalist: takes the odd phrase at its word first', () => {
  const v = base(); v.tail.cur = 'before_eels'; v.tail.via = 'drunk';
  const { verse } = applyTrait(v, 'literalist', makeRng(1), F);
  assert.equal(render(verse), 'The faithful should wash their hands in front of an eel.');
});

test('Ambitious: adds a clause naming the speaker; a second speaker replaces it', () => {
  const { verse } = applyTrait(base(), 'ambitious', makeRng(1), F);
  assert.equal(verse.rider.by, 'f01');
  const other = { ...F, id: 'f02', name: 'Maud' };
  const r = applyTrait(verse, 'ambitious', makeRng(2), other);
  assert.equal(r.verse.rider.name, 'Maud');
  assert.match(r.note, /struck out Wilf/);
});

test('the same seed carves the same verse', () => {
  const run = () => {
    const rng = streamFor(7, 3, 'test');
    const flock = makeFlock(rng);
    return render(transmit(base(), flock.slice(0, 4), rng).final);
  };
  assert.equal(run(), run());
});

test('every data reference resolves', () => {
  for (const t of TEMPLATES) {
    assert.ok(VERBS[t.verb], t.verb);
    for (const id of [...t.objects, ...t.tails]) assert.ok(PHRASES[id], id);
  }
  for (const [id, p] of Object.entries(PHRASES)) {
    for (const ref of [...(p.drunk || []), ...(p.poet || [])]) assert.ok(PHRASES[ref], `${id} -> ${ref}`);
  }
  for (const v of Object.values(VERBS)) for (const ref of v.drunk || []) assert.ok(VERBS[ref], ref);
  for (const id of POET_TAILS) assert.ok(PHRASES[id].literal && PHRASES[id].after, id);
});

test('3,000 seeded chains: every step renders as a clean sentence', () => {
  for (let i = 1; i <= 3000; i++) {
    const rng = streamFor(11, i, 'sweep');
    const flock = makeFlock(rng);
    const t = rng.pick(TEMPLATES);
    const rev = makeRevelation(t.id, rng.pick(t.objects) ?? null, rng.pick(t.tails));
    const chain = rng.shuffle([...flock]).slice(0, rng.range(1, 4));
    const { steps, final } = transmit(rev, chain, rng);
    for (const text of [...steps.map((s) => s.text), title(final), aftermath(final, rev)]) {
      assert.doesNotMatch(text, /undefined|null|NaN|[{}]|  | ,|,,|\.\./, text);
    }
    for (const s of steps) {
      assert.match(s.text, /^[A-Z].*\.$/, s.text);
      assert.equal(s.changed, s.note !== null);
    }
  }
});

// The author: "I don't want any repeats of an event or scene in any play through."
test('200 playthroughs of 20 Revelations: nothing authored is shown twice', () => {
  for (let seed = 1; seed <= 200; seed++) {
    const { out } = playthrough(seed, 20);
    const drawn = new Set(), afters = new Set(), titles = new Set();
    for (const { steps, carved } of out) {
      for (const s of steps) for (const d of s.drew) {
        const key = `${d.deck}/${d.id}`;
        assert.ok(!drawn.has(key), `seed ${seed}: ${key} drawn twice`);
        drawn.add(key);
      }
      if (carved.after) { assert.ok(!afters.has(carved.after), `seed ${seed}: "${carved.after}" twice`); afters.add(carved.after); }
      assert.ok(!titles.has(carved.title), `seed ${seed}: ${carved.title} twice`); titles.add(carved.title);
    }
  }
});

test('a spent deck entry cannot be spent again, and the spent list is not changed in place', () => {
  const a = {}; const b = spend(a, 'threat', 'pond');
  assert.deepEqual(a, {});
  assert.throws(() => spend(b, 'threat', 'pond'));
});

test('a second verse with the same name is numbered', () => {
  const v = makeRevelation('wash', 'hands', 'before_meals');
  const first = carve(v, v, {});
  const second = carve(v, v, first.spent);
  assert.equal(first.title, 'the Verse of the Hand');
  assert.equal(second.title, 'the Second Verse of the Hand');
  assert.notEqual(first.after, second.after);
});
