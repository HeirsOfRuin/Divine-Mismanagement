// The save contract. Every save version that ever shipped has a fixture in
// test/fixtures/v<N>-save.json; each must load through migrate() and play on.
// When SAVE_VERSION goes up: add MIGRATIONS[old], and commit a fixture saved by
// the old build BEFORE changing it (The Lists keeps v1 to v6).

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';
import { SAVE_VERSION, MIGRATIONS, deserialize, serialize, toCode, fromCode, newGame } from '../src/engine/state.js';
import { advance } from '../src/engine/turn.js';
import { decide } from '../sim/bot.js';

const dir = new URL('./fixtures/', import.meta.url);
const fixtures = readdirSync(dir).filter((f) => /^v\d+-save\.json$/.test(f)).sort();

test('there is a fixture for every save version up to the current one', () => {
  for (let v = 1; v <= SAVE_VERSION; v++) assert.ok(fixtures.includes(`v${v}-save.json`), `missing test/fixtures/v${v}-save.json`);
});

test('there is a migration from every older version', () => {
  for (let v = 1; v < SAVE_VERSION; v++) assert.equal(typeof MIGRATIONS[v], 'function', `no MIGRATIONS[${v}]`);
});

for (const f of fixtures) {
  test(`${f} loads and plays on`, () => {
    let s = deserialize(readFileSync(new URL(f, dir), 'utf8'));
    assert.equal(s.v, SAVE_VERSION);
    for (let i = 0; i < 3 && !s.over; i++) {
      const d = decide(s, 'adaptive');
      s = advance(d.state, d.input).state;
    }
  });
}

test('a save code round-trips at the start', async () => {
  const s = newGame({ seed: 99 });
  assert.deepEqual(await fromCode(await toCode(s)), s);
  assert.deepEqual(deserialize(serialize(s)), s);
});

// Playtest 2: a season-30 code was ~200,000 characters and arrived cut off.
test('a late-game code is short, loads, keeps the ledger true, and plays the same as the full save', async () => {
  let s = newGame({ seed: 5 });
  for (let i = 0; i < 25 && !s.over; i++) { const d = decide(s, 'adaptive'); s = advance(d.state, d.input).state; }
  const code = await toCode(s);
  assert.ok(code.startsWith('DVMM2.'));
  assert.ok(code.length < 25000, `${code.length} characters`);
  const back = await fromCode(code);
  const start = newGame({ seed: 5 }).gods;
  for (let gi = 0; gi < back.gods.length; gi++) for (const m of ['faith', 'power', 'mystery', 'offerings', 'devotion', 'heresy', 'entitlement', 'souls']) {
    const sum = back.ledger.filter((r) => r[1] === gi && r[2] === m).reduce((a, r) => a + r[3], start[gi][m] || 0);
    assert.ok(Math.abs(sum - back.gods[gi][m]) < 1e-6, `${m} of god ${gi}`);
  }
  // Same decisions from the full save and from the code give the same game.
  let a = s, b = back;
  for (let i = 0; i < 5 && !a.over; i++) { const da = decide(a, 'adaptive'), db = decide(b, 'adaptive'); a = advance(da.state, da.input).state; b = advance(db.state, db.input).state; }
  assert.deepEqual([a.outcome, a.season, a.gods.map((g) => [g.souls, g.faith])], [b.outcome, b.season, b.gods.map((g) => [g.souls, g.faith])]);
});

test('an old plain DVMM1 code still loads', async () => {
  const s = newGame({ seed: 7 });
  const old = 'DVMM1.' + btoa(unescape(encodeURIComponent(serialize(s)))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  assert.deepEqual(await fromCode(old), s);
});

test('a code cut off in the middle is refused with a reason, not loaded wrongly', async () => {
  const code = await toCode(newGame({ seed: 8 }));
  await assert.rejects(fromCode(code.slice(0, Math.floor(code.length / 2))), /incomplete|damaged/);
  const old = 'DVMM1.' + btoa(unescape(encodeURIComponent(serialize(newGame({ seed: 8 }))))).replace(/=+$/, '');
  await assert.rejects(fromCode(old.slice(0, 301)), /incomplete|damaged/);
});

test('a save from a newer build is refused with a reason, not loaded wrongly', () => {
  assert.throws(() => deserialize(JSON.stringify({ ...newGame(), v: SAVE_VERSION + 1 })), /newer version/);
});
