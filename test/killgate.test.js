// The kill-gate model (prototypes/killgate) stays runnable and deterministic
// until the engine replaces it.
import test from 'node:test';
import assert from 'node:assert/strict';
import { play } from '../prototypes/killgate/model.mjs';
import { POLICIES, RIVAL } from '../prototypes/killgate/policies.mjs';

test('kill-gate model: every policy plays 20 seeds to an ending, the same way twice', () => {
  for (const [name, p] of Object.entries(POLICIES)) {
    for (let seed = 1; seed <= 20; seed++) {
      const a = play(seed, p, RIVAL), b = play(seed, p, RIVAL);
      assert.deepEqual(a, b, `${name} seed ${seed}`);
      assert.ok(['ascended', 'rival_fell', 'passed_over', 'absorbed', 'forgotten'].includes(a.outcome));
      assert.ok(a.seasons >= 1 && a.seasons <= 30);
      assert.ok(a.souls >= 0 && a.souls + a.rivalSouls <= 36, `${name} seed ${seed}: souls ${a.souls} + ${a.rivalSouls}`);
    }
  }
});
