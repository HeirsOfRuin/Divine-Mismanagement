// What can never be true. Impossibility assertions, not magnitudes: they
// survive every rebalance. Each test plays real games through the reference
// bots, so "it held" means it held over games that actually happened.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { newGame, advance, preview, ruleOn } from '../src/engine/turn.js';
import { METERS } from '../src/engine/meters.js';
import { CONFIG } from '../src/data/config.data.js';
import { decide } from '../sim/bot.js';

const START = [CONFIG.start, CONFIG.rivalStart];

function playThrough(seed, policy = 'adaptive', each = () => {}) {
  let s = newGame({ seed });
  for (let i = 0; !s.over && i < 60; i++) {
    const d = decide(s, policy);
    s = advance(d.state, d.input).state;
    each(s);
  }
  return s;
}

const POLICIES = ['adaptive', 'random', 'miracles', 'crusader', 'silent'];

test('every meter of both gods equals its start plus its ledger, every season', () => {
  for (let seed = 1; seed <= 25; seed++) {
    playThrough(seed, POLICIES[seed % POLICIES.length], (s) => {
      for (const gi of [0, 1]) for (const m of METERS) {
        const sum = s.ledger.filter((r) => r[1] === gi && r[2] === m).reduce((a, r) => a + r[3], START[gi][m] || 0);
        assert.ok(Math.abs(sum - s.gods[gi][m]) < 1e-6, `seed ${seed} season ${s.season} god ${gi} ${m}: ${s.gods[gi][m]} vs ledger ${sum}`);
      }
    });
  }
});

test('nobody is created or lost: your souls, hers and the Unbothered always make the village', () => {
  for (let seed = 1; seed <= 25; seed++) {
    playThrough(seed, POLICIES[seed % POLICIES.length], (s) => {
      assert.equal(s.gods[0].souls + s.gods[1].souls + s.unbothered, CONFIG.village, `seed ${seed} season ${s.season}`);
      assert.ok(s.unbothered >= 0 && Number.isInteger(s.unbothered));
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
    assert.ok(s.chronicle.length <= CONFIG.seasons);
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
      once(r.her.line, `${at} rival`);
      if (r.ruling) { once(r.ruling.text, `${at} ruling`); once(r.ruling.after, `${at} ruling outcome`); }
      once(r.me.act.text, `${at} answered prayer`);
      for (const o of r.me.offices || []) once(o.text, `${at} ${o.office}`);
    }
    for (const L of s.gods[0].legends) once(L.text, `legend ${L.id}`);
    for (const t of [...s.gods[0].tablets, ...s.gods[0].apocrypha, ...s.gods[1].tablets, ...s.gods[1].apocrypha]) {
      once(t.title, `title of ${t.id}`);
      once(t.after, `aftermath of ${t.id}`);
    }
  }
});
