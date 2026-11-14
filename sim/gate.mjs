// The Gate B tables, run on the real engine (docs/BALANCE.md). Replaces the
// kill-gate model's prototypes/killgate/gate.mjs, which is now retired.
//   node sim/gate.mjs                      every table, 300 seeds a cell
//   node sim/gate.mjs --runs=1000 --only=policies|offices|silence|faith
import { play, metrics } from './adapter.js';
import { POLICIES, staffAware } from './bot.js';
import { OFFICE_IDS } from '../src/data/offices.data.js';
import { TRAIT_IDS } from '../src/data/traits.data.js';
import { seRate, noiseFloor } from './stats.js';
import { reviewStanding, doctrineOf } from '../src/engine/derive.js';

const arg = (k, d) => { const h = process.argv.find((a) => a.startsWith(`--${k}=`)); return h ? h.split('=')[1] : d; };
const RUNS = Number(arg('runs', 300));
const ONLY = arg('only', '');
const SEED0 = Number(arg('seed0', 1));
const pc = (p) => `${(100 * p).toFixed(0).padStart(3)}%`;
const mean = (a) => a.reduce((x, y) => x + y, 0) / a.length;

export function batch(opts) {
  const rows = [];
  for (let seed = SEED0; seed < SEED0 + RUNS; seed++) rows.push(metrics(play(seed, opts)));
  const rate = (k) => rows.filter((r) => r[k]).length / RUNS;
  const avg = (k) => mean(rows.map((r) => r[k]));
  return { rows, win: rate('win'), se: seRate(rate('win'), RUNS), rate, avg };
}
const line = (name, b) => `${name.padEnd(14)} ${pc(b.win)} ±${b.se.toFixed(1).padStart(4)} | promoted ${pc(b.rate('ascended'))} rival fell ${pc(b.rate('rival_fell'))} | passed over ${pc(b.rate('passed_over'))} absorbed ${pc(b.rate('absorbed'))} forgotten ${pc(b.rate('forgotten'))} | faith ${b.avg('faith').toFixed(0).padStart(3)} souls ${b.avg('souls').toFixed(1).padStart(4)} | rev ${b.avg('reveal').toFixed(1)} mir ${b.avg('miracle').toFixed(1)} silent ${b.avg('silent').toFixed(1)}`;

if (import.meta.url === `file://${process.argv[1]}`) {
  console.log(`${RUNS} seeds a cell from seed ${SEED0}. Noise floor between two cells near 40%: ${noiseFloor(0.4, RUNS).toFixed(1)} points.\n`);
  if (!ONLY || ONLY === 'policies') {
    console.log('POLICIES');
    for (const name of Object.keys(POLICIES)) console.log(line(name, batch({ policy: name })));
    console.log();
  }
  if (!ONLY || ONLY === 'offices') {
    console.log('OFFICES: adaptive play, one office held all game by one devotee given one trait (win %)');
    console.log(' '.repeat(11) + TRAIT_IDS.map((t) => t.padStart(11)).join('') + '   spread');
    const only = arg('office', '');
    const policy = arg('policy', 'adaptive');
    if (policy !== 'adaptive') console.log(`(policy: ${policy})`);
    for (const office of OFFICE_IDS.filter((o) => !only || only.split(',').includes(o))) {
      const cells = TRAIT_IDS.map((trait) => batch({
        policy,
        setup: (s) => { const f = s.gods[0].flock[0]; f.traits = [trait]; f.known = true; return s; },
        fixed: (s) => ({ ...staffAware(s.gods[0], undefined, { [office]: s.gods[0].flock[0].id }) }),
      }).win);
      const best = Math.max(...cells), worst = Math.min(...cells);
      console.log(office.padEnd(11) + cells.map((w) => (w === best ? `*${pc(w)}` : ` ${pc(w)}`).padStart(11)).join('') + `   ${(100 * (best - worst)).toFixed(0)}`);
    }
    console.log();
  }
  if (!ONLY || ONLY === 'review') {
    // Fault 6: is Faith ever what stops a god? Among games that reached the
    // Review, how often each line was missed; and how games ended early.
    console.log('WHAT STOPS A GOD (games that reached the Review: share missing each line; then early endings)');
    for (const name of ['adaptive', 'never_silent', 'crusader', 'short_chain', 'random']) {
      const miss = { faith: 0, souls: 0, heresy: 0, doctrine: 0 };
      let reached = 0, forgotten = 0, absorbedEarly = 0;
      for (let seed = SEED0; seed < SEED0 + RUNS; seed++) {
        const s = play(seed, { policy: name });
        if (s.outcome === 'forgotten') forgotten++;
        if (s.outcome === 'absorbed' && s.chronicle.length < 30) absorbedEarly++;
        if (s.chronicle.length < 30 || s.outcome === 'rival_fell') continue;
        reached++;
        for (const x of reviewStanding(s.gods[0], doctrineOf(s.gods[0]))) if (!x.ok) miss[x.id]++;
      }
      const p = (k) => (reached ? pc(miss[k] / reached) : '  -');
      console.log(`${name.padEnd(14)} reached ${String(reached).padStart(4)} | missed Faith ${p('faith')} souls ${p('souls')} heresy ${p('heresy')} doctrine ${p('doctrine')} | forgotten ${pc(forgotten / RUNS)} absorbed early ${pc(absorbedEarly / RUNS)}`);
    }
    console.log();
  }
  if (!ONLY || ONLY === 'silence') {
    console.log('SILENCE');
    for (const name of ['adaptive', 'never_silent', 'rests_third']) console.log(line(name, batch({ policy: name })));
  }
}
