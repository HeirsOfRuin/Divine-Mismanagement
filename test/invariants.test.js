// What can never be true. Impossibility assertions, not magnitudes: they
// survive every rebalance. Each test plays real games through the reference
// bots, so "it held" means it held over games that actually happened.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { newGame, advance, preview, ruleOn } from '../src/engine/turn.js';
import { METERS } from '../src/engine/meters.js';
import { CONFIG } from '../src/data/config.data.js';
import { decide } from '../sim/bot.js';

// Story Chapter 1, and two other shapes of match, so every invariant holds for any world.
const SHAPES = [{}, { mode: 'story', chapter: 'ch2' }, { mode: 'custom', rivals: 4, regions: 2, villages: 2, wealth: 'rich', seasons: 40, guided: false }];

function playThrough(seed, policy = 'adaptive', each = () => {}, shape = SHAPES[seed % SHAPES.length]) {
  let s = newGame({ seed, ...shape });
  for (let i = 0; !s.over && i < 80; i++) {
    const d = decide(s, policy);
    s = advance(d.state, d.input).state;
    each(s);
  }
  return s;
}

const POLICIES = ['adaptive', 'random', 'miracles', 'crusader', 'silent'];
const shapeOf = (s) => (s.match.mode === 'story' ? { mode: 'story', chapter: s.match.chapter } : { mode: 'custom', rivals: s.match.rivals, regions: s.match.regions, villages: s.match.villages, wealth: s.match.wealth, seasons: s.match.seasons, guided: s.match.guided });

test('every meter of every god equals its start plus its ledger, every season', () => {
  for (let seed = 1; seed <= 25; seed++) {
    let start = null;
    playThrough(seed, POLICIES[seed % POLICIES.length], (s) => {
      start ||= newGame({ seed: s.seed, ...shapeOf(s) }).gods;
      for (let gi = 0; gi < s.gods.length; gi++) for (const m of METERS) {
        const sum = s.ledger.filter((r) => r[1] === gi && r[2] === m).reduce((a, r) => a + r[3], start[gi][m] || 0);
        assert.ok(Math.abs(sum - s.gods[gi][m]) < 1e-6, `seed ${seed} season ${s.season} god ${gi} ${m}: ${s.gods[gi][m]} vs ledger ${sum}`);
      }
    });
  }
});

test('nobody is created or lost: in every region the gods and the Unbothered make the whole; a god is the sum of its regions', () => {
  for (let seed = 1; seed <= 25; seed++) {
    let sizes = null;
    playThrough(seed, POLICIES[seed % POLICIES.length], (s) => {
      const size = s.villages.map((r) => r.unbothered + r.held.reduce((a, b) => a + b, 0));
      sizes ||= size;
      assert.deepEqual(size, sizes, `seed ${seed} season ${s.season}: a region changed size`);
      for (const r of s.villages) { assert.ok(r.unbothered >= 0 && Number.isInteger(r.unbothered)); for (const h of r.held) assert.ok(h >= 0 && Number.isInteger(h)); }
      s.gods.forEach((g, gi) => assert.equal(g.souls, s.villages.reduce((a, r) => a + r.held[gi], 0), `seed ${seed} god ${gi}`));
      s.gods.forEach((g) => { if (g.fallen) assert.equal(g.souls, 0); });
    });
  }
});

test('no number is ever NaN or infinite, and every bounded meter stays in bounds', () => {
  for (let seed = 1; seed <= 25; seed++) {
    playThrough(seed, 'random', (s) => {
      for (const g of s.gods) {
        for (const m of METERS) assert.ok(Number.isFinite(g[m]), `${m} at seed ${seed}`);
        assert.ok(g.mystery >= 0 && g.mystery <= 100);
        assert.ok(g.devotion >= 0 && g.devotion <= 10);
        assert.ok(g.power >= 0 && g.power <= CONFIG.powerCap);
      }
    });
  }
});

test('the staffing board: one office each, one holder each; never more than seven Tablets', () => {
  for (let seed = 1; seed <= 25; seed++) {
    playThrough(seed, POLICIES[seed % POLICIES.length], (s) => {
      for (const g of s.gods) {
        const offices = g.flock.map((f) => f.office).filter(Boolean);
        assert.equal(new Set(offices).size, offices.length, `seed ${seed}: an office held twice`);
        assert.ok(g.tablets.length <= CONFIG.tablets);
      }
    });
  }
});

test('every game ends by the last season, and the clock moves every season', () => {
  for (let seed = 1; seed <= 30; seed++) {
    let last = 0;
    const s = playThrough(seed, POLICIES[seed % POLICIES.length], (st) => { assert.ok(st.chronicle.length > last); last = st.chronicle.length; });
    assert.ok(s.over, `seed ${seed} never ended`);
    assert.ok(s.chronicle.length <= s.match.seasons);
    assert.ok(['ascended', 'rival_fell', 'passed_over', 'absorbed', 'forgotten'].includes(s.outcome));
  }
});

test('same seed and same choices give the same game', () => {
  assert.deepEqual(playThrough(7, 'random'), playThrough(7, 'random'));
  assert.deepEqual(playThrough(8, 'adaptive'), playThrough(8, 'adaptive'));
});

test('an act the preview refuses is refused by the engine, with the same reason', () => {
  const s = newGame({ seed: 3 });
  const act = { kind: 'festival' };
  const p = preview(s, 0, act);
  assert.equal(p.ok, false);
  assert.throws(() => advance(s.event ? ruleOn(s, 0) : s, { act }), new RegExp(p.why.slice(0, 20)));
});

test('a problem brought to you must be ruled on before the season can end', () => {
  for (let seed = 1; seed <= 40; seed++) {
    const s = newGame({ seed });
    if (!s.event) continue;
    assert.throws(() => advance(s, { act: { kind: 'silent' } }), /ruling/);
    return;
  }
  assert.fail('no seed in 1-40 opened with a problem');
});

// The author, 2026-11-14: "I don't want any repeats of an event or scene in any play through."
test('no authored line is shown twice in a playthrough (100 games, every kind of line)', () => {
  for (let seed = 1; seed <= 100; seed++) {
    const s = playThrough(seed, POLICIES[seed % POLICIES.length]);
    const seen = new Map();
    const once = (text, where) => {
      if (!text) return;
      assert.ok(!seen.has(text), `seed ${seed}: "${text}" shown twice (${seen.get(text)} and ${where})`);
      seen.set(text, where);
    };
    for (const r of s.chronicle) {
      const at = `season ${r.season}`;
      once(r.memo, `${at} memo`);
      if (r.ruling) { once(r.ruling.text, `${at} ruling`); once(r.ruling.after, `${at} ruling outcome`); }
      if (r.me.act.kind === 'answer') once(r.me.act.text, `${at} answered prayer`);
      for (const o of r.me.offices || []) once(o.text, `${at} ${o.office}`);
    }
    for (const L of s.gods[0].legends) once(L.text, `legend ${L.id}`);
    for (const L of s.gods[0].artifacts) once(L.how, `holy object ${L.id}`);
    for (const r of s.chronicle) { once(r.headdesk, `season ${r.season} head in hands`); once(r.rankText, `season ${r.season} rank`); once(r.me.act.kind === 'canonize' ? r.me.act.text : null, `season ${r.season} saint`); once(r.line && r.line.text, `season ${r.season} rival`); }
    for (const t of s.gods.flatMap((g) => [...g.tablets, ...g.apocrypha])) {
      once(t.title, `title of ${t.id}`);
      once(t.after, `aftermath of ${t.id}`);
    }
  }
});

// The story (docs/FRAME-story.md): every scene once, in order, and every
// choice's consequence reached where the story says it comes back.
test('Story Chapter 1: each path through the scenes reaches its callback, once, in order', async () => {
  const { play } = await import('../sim/adapter.js');
  const { epilogue } = await import('../src/engine/story.js');
  const paths = [
    { stone: 'unstick', corridor: 'ask', committee: 'aldous', report_aldous: 'dissolve', expect: 'report_aldous' },
    { stone: 'silent', corridor: 'blank', committee: 'aldous', report_aldous: 'endorse', expect: 'report_aldous' },
    { stone: 'door', corridor: 'congratulate', committee: 'odo', expect: 'report_odo' },
    { stone: 'unstick', corridor: 'ask', committee: 'refuse', report_none: 'ignore', expect: 'report_none' },
  ];
  for (const [n, path] of paths.entries()) {
    const s = play(40 + n, { policy: 'adaptive', fixed: () => ({ __scenes: path }) });
    const seen = s.seenScenes.filter((x) => !x.startsWith('rank:'));
    assert.equal(new Set(s.seenScenes).size, s.seenScenes.length, 'a scene shown twice');
    assert.deepEqual(seen.slice(0, 4), ['prologue', 'stone', 'corridor', 'committee']);
    if (s.chronicle.length >= 16) assert.ok(seen.includes(path.expect), `path ${n}: ${seen.join(',')}`);
    assert.equal(s.flags.stone, path.stone === 'door' ? 'door' : path.stone);
    if (path.report_aldous === 'endorse' && s.book) assert.equal(s.gods[0].flock.find((f) => f.id === s.book.scribes[1]).cast, 'aldous', 'the endorsed Committee helps write the Book');
    const ep = epilogue(s).join(' ');
    assert.doesNotMatch(ep, /undefined|\{\w+\}/);
    assert.match(ep, /Odo the Miller/);
  }
});

// Chapters 2 and 3 (docs/STORY-chapters-2-3.md): each opens from how the
// chapter before ended, and a finished chapter hands that on.
test('Story Chapters 2 and 3: the legacy picks the prologue, and a finished chapter hands its own on', async () => {
  const { play } = await import('../sim/adapter.js');
  const { newGame, chooseScene } = await import('../src/engine/turn.js');
  const { currentScene, legacyOf } = await import('../src/engine/story.js');
  const opening = (chapter, legacy) => currentScene(newGame({ seed: 9, mode: 'story', chapter, legacy })).pages[0];
  assert.match(opening('ch2', null), /at your own request/, 'no legacy: the canonical one (won, stayed)');
  assert.match(opening('ch2', { chapter: 'ch1', outcome: 'ascended', final: 'thresholds' }), /God of Thresholds again/);
  assert.match(opening('ch2', { chapter: 'ch1', outcome: 'passed_over' }), /adjourned/);
  assert.match(opening('ch2', { chapter: 'ch1', outcome: 'absorbed' }), /Archive/);
  assert.match(opening('ch2', { chapter: 'ch2', outcome: 'passed_over' }), /at your own request/, 'a legacy from the wrong chapter is ignored');
  assert.match(opening('ch3', { chapter: 'ch2', outcome: 'ascended', final: 'move' }), /callus/);
  const ch1 = play(41, { policy: 'adaptive' });
  const L = legacyOf(ch1);
  assert.equal(L.chapter, 'ch1');
  assert.equal(L.outcome, ch1.outcome);
  assert.deepEqual(L.flags, Object.fromEntries(Object.entries(ch1.flags).filter(([k]) => k !== 'final')));
  for (const chapter of ['ch2', 'ch3']) {
    let s = newGame({ seed: 4, mode: 'story', chapter, legacy: L });
    const names = s.gods.flatMap((g) => g.flock.map((f) => f.name));
    assert.equal(new Set(names).size, names.length, 'a cast name shared');
    while (s.scenes.length) {
      const sc = currentScene(s);
      for (const p of sc.pages) assert.doesNotMatch(p, /undefined|\{\w+\}/);
      s = chooseScene(s, sc.choices[0].id);
    }
    const end = play(6, { policy: 'adaptive', match: { mode: 'story', chapter } });
    assert.equal(end.seenScenes[0], `${chapter}_prologue`);
    assert.equal(legacyOf(end).chapter, chapter);
  }
});
