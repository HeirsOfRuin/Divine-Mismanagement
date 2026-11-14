// Which act is best, position by position? (docs/BALANCE.md, fault 1)
//
// Plays the reference policy to a season, then from that exact position tries
// every act on a fixed menu for one season and lets the same policy finish the
// game from each branch. Same seed, same everything else: only the one act
// differs. Over many positions it reports how often each act was the best
// choice (by the end score), and how often silence was. A strategy table can
// say "never resting does as well as resting" while silence is still the right
// move in particular positions; this tool asks the particular question.
//
//   node sim/fork.mjs --runs=60 --at=6,12,18,24
import { newGame, advance, preview } from '../src/engine/turn.js';
import { decide } from './bot.js';
import { OUTCOMES } from '../src/data/config.data.js';

const arg = (k, d) => { const h = process.argv.find((a) => a.startsWith(`--${k}=`)); return h ? h.split('=')[1] : d; };
const RUNS = Number(arg('runs', 60));
const AT = arg('at', '6,12,18,24').split(',').map(Number);
const POLICY = arg('policy', 'adaptive');

// The end score: a win is worth most; otherwise how close it came.
const score = (s) => (OUTCOMES[s.outcome].win ? 100 : 0) + s.gods[0].faith / 3 + 2 * s.gods[0].souls - 2 * s.gods[1].souls;

function finish(s) {
  for (let g = 0; !s.over && g < 60; g++) { const d = decide(s, POLICY); s = advance(d.state, d.input).state; }
  return s;
}

function menu(s) {
  const g = s.gods[0];
  const prophet = g.flock.find((f) => f.office === 'prophet' && f.settling === 0);
  const chain = [prophet || g.flock[0]];
  for (let h = 0; h < 4; h++) if (!chain.some((f) => f.household === h)) chain.push(g.flock.find((f) => f.household === h && f.known && f.traits[0] !== 'drunk') || g.flock.find((f) => f.household === h));
  const held = new Set(g.tablets.map((t) => t.verse.template));
  const t = ['welcome', 'share', 'rest', 'wash', 'borrow'].find((x) => !held.has(x)) || 'welcome';
  return {
    silent: { kind: 'silent' },
    reveal: { kind: 'reveal', template: t, chain: chain.slice(0, Math.max(1, Math.min(chain.length, 1 + Math.floor(g.power)))).map((f) => f.id) },
    sign: { kind: 'miracle', miracle: 'sign' },
    bounty: { kind: 'miracle', miracle: 'bounty' },
    smite: { kind: 'miracle', miracle: 'smite' },
    answer: g.prayers.length ? { kind: 'answer', prayer: g.prayers[0].id } : null,
    festival: { kind: 'festival' },
    poach: { kind: 'poach' },
    dispute: { kind: 'dispute' },
  };
}

const best = {}, silentBest = [], positions = [];
for (let seed = 1; seed <= RUNS; seed++) {
  for (const at of AT) {
    let s = newGame({ seed });
    for (let g = 0; !s.over && s.season < at && g < 60; g++) { const d = decide(s, POLICY); s = advance(d.state, d.input).state; }
    if (s.over) continue;
    const d = decide(s, POLICY);
    const base = d.state;
    const results = [];
    for (const [name, act] of Object.entries(menu(base))) {
      if (!act || !preview(base, 0, act).ok) continue;
      results.push({ name, score: score(finish(advance(base, { act }).state)) });
    }
    if (results.length < 2) continue;
    results.sort((a, b) => b.score - a.score);
    // A tie with silence counts for whichever is listed first; break ties toward acting.
    const top = results.filter((r) => r.score === results[0].score);
    const winner = top.find((r) => r.name !== 'silent') || top[0];
    best[winner.name] = (best[winner.name] || 0) + 1;
    positions.push({ seed, at, winner: winner.name, g: base.gods[0] });
    if (winner.name === 'silent') silentBest.push({ seed, at, mystery: base.gods[0].mystery, ent: base.gods[0].entitlement, power: base.gods[0].power });
  }
}
const n = positions.length;
console.log(`${n} positions (seeds 1-${RUNS} at seasons ${AT.join(', ')}), policy ${POLICY}. Best act from each position, ties broken toward acting:`);
for (const [k, v] of Object.entries(best).sort((a, b) => b[1] - a[1])) console.log(`  ${k.padEnd(9)} ${String(v).padStart(4)}  ${(100 * v / n).toFixed(1)}%`);
if (silentBest.length) {
  const m = (k) => (silentBest.reduce((a, x) => a + x[k], 0) / silentBest.length).toFixed(1);
  const all = (k) => (positions.reduce((a, x) => a + x.g[k], 0) / n).toFixed(1);
  console.log(`Where silence was best: Mystery ${m('mystery')} (all positions ${all('mystery')}), entitlement ${m('ent')} (${all('entitlement')}), Power ${m('power')} (${all('power')}).`);
}
