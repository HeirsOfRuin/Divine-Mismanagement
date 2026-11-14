// Gate B: are the decisions real? (docs/SPEC.md section 11, FRAME-management.md)
//   node prototypes/killgate/gate.mjs            every table, 200 seeds a cell
//   node prototypes/killgate/gate.mjs --runs=500 --only=policies|offices|acts
import { play } from './model.mjs';
import { CFG, OFFICE } from './data.mjs';
import { POLICIES, RIVAL, staffAware, adaptiveActs, buildNext } from './policies.mjs';
import { seRate, noiseFloor, summarize } from '../../sim/stats.js';

const arg = (k, d) => { const h = process.argv.find((a) => a.startsWith(`--${k}=`)); return h ? h.split('=')[1] : d; };
const RUNS = Number(arg('runs', 200));
const ONLY = arg('only', '');
const pc = (p) => (100 * p).toFixed(0).padStart(3) + '%';
const mean = (a) => a.reduce((x, y) => x + y, 0) / a.length;

function batch(policy, cfg = CFG, setup = null, rival = RIVAL) {
  const runs = [];
  for (let seed = 1; seed <= RUNS; seed++) runs.push(play(seed, policy, rival, cfg, setup));
  const share = (o) => runs.filter((r) => r.outcome === o).length / RUNS;
  const win = runs.filter((r) => r.win).length / RUNS;
  return { runs, win, se: seRate(win, RUNS), share, faith: mean(runs.map((r) => r.faith)), souls: mean(runs.map((r) => r.souls)),
    heresy: mean(runs.map((r) => r.heresy)), mystery: mean(runs.map((r) => r.mystery)), silent: mean(runs.map((r) => r.n.silent)),
    reveal: mean(runs.map((r) => r.n.reveal)), miracle: mean(runs.map((r) => r.n.miracle)), schism: mean(runs.map((r) => r.n.schism)), works: mean(runs.map((r) => r.works)) };
}
const row = (name, b) => `${name.padEnd(14)} ${pc(b.win)} ±${b.se.toFixed(1).padStart(4)}  | asc ${pc(b.share('ascended'))} fell ${pc(b.share('rival_fell'))} | passed ${pc(b.share('passed_over'))} absorbed ${pc(b.share('absorbed'))} forgot ${pc(b.share('forgotten'))} | faith ${b.faith.toFixed(0).padStart(3)} souls ${b.souls.toFixed(1).padStart(4)} heresy ${b.heresy.toFixed(1)} myst ${b.mystery.toFixed(0)} | rev ${b.reveal.toFixed(1)} mir ${b.miracle.toFixed(1)} silent ${b.silent.toFixed(0)} schism ${b.schism.toFixed(2)} works ${b.works.toFixed(1)}`;

console.log(`Gate B. ${RUNS} seeds a cell, ${CFG.seasons} seasons, ${CFG.acts} acts a season. Noise floor between two cells near 30%: ${noiseFloor(0.3, RUNS).toFixed(0)} points.\n`);

if (!ONLY || ONLY === 'policies') {
  console.log('POLICIES (win = passed the Review or the rival fell)');
  for (const [name, p] of Object.entries(POLICIES)) console.log(row(name, batch(p)));
  console.log();
}

if (!ONLY || ONLY === 'offices') {
  // One devotee is given a single trait and held in one office for the whole
  // run; everything else is the adaptive policy on the same seeds.
  console.log('OFFICES: adaptive play with one office held by one trait throughout (win %, then mean souls / faith)');
  const traits = Object.keys(OFFICE.preacher);
  console.log(' '.repeat(12) + traits.map((t) => t.padStart(13)).join(''));
  for (const office of ['prophet', 'preacher', 'missionary', 'collector', 'builder', 'witness']) {
    const cells = traits.map((trait) => {
      const setup = (w) => { const f = w.gods[0].flock[0]; f.traits = [trait]; f.known = true; };
      const policy = { ...POLICIES.adaptive, postings: (g) => staffAware(g, undefined, { [office]: g.flock[0].id }) };
      return batch(policy, CFG, setup);
    });
    const best = Math.max(...cells.map((c) => c.win)), worst = Math.min(...cells.map((c) => c.win));
    console.log(office.padEnd(12) + cells.map((c) => `${pc(c.win)} ${c.souls.toFixed(0).padStart(2)}/${c.faith.toFixed(0).padStart(3)}`.padStart(13)).join('') + `   spread ${(100 * (best - worst)).toFixed(0)}`);
  }
  console.log();
}

if (!ONLY || ONLY === 'acts') {
  console.log('ACTS A SEASON (adaptive, and adaptive that never rests)');
  for (const acts of [1, 2, 3]) {
    const cfg = { ...CFG, acts };
    console.log(row(`${acts} act, rests`, batch(POLICIES.adaptive, cfg)));
    console.log(row(`${acts} act, never`, batch(POLICIES.never_silent, cfg)));
  }
}
