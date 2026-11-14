// Gate A: is one mutation funny? (docs/SPEC.md section 11)
//
// Prints N Revelations passed down seeded chains, every step shown. Nothing is
// asserted; a human reads it. The same seed always prints the same chains.
//
//   node tools/telephone.mjs                 20 chains, seed 1
//   node tools/telephone.mjs --n=40 --seed=7
//   node tools/telephone.mjs --md            Markdown, for docs/GATE-A.md
//   node tools/telephone.mjs --run           one playthrough: one flock, 20 Revelations,
//                                            nothing authored shown twice
//   node tools/telephone.mjs --run --stats   how often the decks run dry, over many playthroughs

import { streamFor } from '../src/engine/rng.js';
import { makeFlock, HOUSEHOLDS } from '../src/engine/followers.js';
import { makeRevelation, transmit, carve } from '../src/engine/telephone.js';
import { render, title, aftermath } from '../src/engine/render.js';
import { TEMPLATES } from '../src/data/lexicon.data.js';
import { TRAITS } from '../src/data/traits.data.js';
import { CONFIG } from '../src/data/config.data.js';

const arg = (k, d) => {
  const hit = process.argv.find((a) => a.startsWith(`--${k}=`));
  return hit ? hit.split('=')[1] : d;
};
const N = Number(arg('n', 20));
const SEED = Number(arg('seed', 1));
const MD = process.argv.includes('--md');

export function chainFor(seed, i) {
  const rng = streamFor(seed, i, 'gateA');
  const flock = makeFlock(rng);
  const t = TEMPLATES[(i - 1) % TEMPLATES.length]; // every template gets equal turns
  const rev = makeRevelation(t.id, rng.pick(t.objects) ?? null, rng.pick(t.tails));
  const length = rng.weighted([{ n: 2, weight: 3 }, { n: 3, weight: 4 }, { n: 4, weight: 2 }]).n;
  // One speaker per household, as the game will require.
  const houses = rng.shuffle([...Array(HOUSEHOLDS).keys()]).slice(0, length);
  const chain = houses.map((h) => rng.pick(flock.filter((f) => f.household === h)));
  const { steps, final } = transmit(rev, chain, rng);
  return { rev, chain, steps, final, flock };
}

// One playthrough's worth of Revelations: the same twelve people, and one set
// of spent decks, so nothing authored can come round twice (src/engine/deck.js).
export function playthrough(seed, revelations) {
  const rng = streamFor(seed, 0, 'playthrough');
  const flock = makeFlock(rng);
  let spent = {};
  const out = [];
  for (let i = 1; i <= revelations; i++) {
    const t = rng.pick(TEMPLATES);
    const rev = makeRevelation(t.id, rng.pick(t.objects) ?? null, rng.pick(t.tails));
    const length = rng.weighted([{ n: 2, weight: 3 }, { n: 3, weight: 4 }, { n: 4, weight: 2 }]).n;
    const houses = rng.shuffle([...Array(HOUSEHOLDS).keys()]).slice(0, length);
    const chain = houses.map((h) => rng.pick(flock.filter((f) => f.household === h)));
    const sent = transmit(rev, chain, rng, spent);
    const carved = carve(sent.final, rev, sent.spent);
    spent = carved.spent;
    out.push({ rev, chain, steps: sent.steps, final: sent.final, carved });
  }
  return { flock, out, spent };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  if (process.argv.includes('--run') && process.argv.includes('--stats')) {
    const runs = Number(arg('n', 500)), R = Number(arg('revelations', 20));
    const idle = {}, total = {};
    let silent = 0, carvings = 0, ordinal = 0;
    for (let r = 1; r <= runs; r++) {
      for (const { steps, carved } of playthrough(SEED + r, R).out) {
        for (const s of steps) { total[s.trait] = (total[s.trait] || 0) + 1; if (!s.changed) idle[s.trait] = (idle[s.trait] || 0) + 1; }
        carvings++; if (!carved.after) silent++; if (/the (Second|Third|Fourth|Fifth|\d)/.test(carved.title)) ordinal++;
      }
    }
    const pct = (a, b) => (100 * a / b).toFixed(1) + '%';
    console.log(`${runs} playthroughs of ${R} Revelations, seeds ${SEED + 1}-${SEED + runs}. Repeats of authored content: 0 (a repeat throws).`);
    console.log('trait had nothing left to do (deck dry, or nothing to act on):');
    for (const t of Object.keys(total)) console.log(`  ${t.padEnd(11)} ${pct(idle[t] || 0, total[t]).padStart(6)} of ${total[t]} turns`);
    console.log(`carvings with no aftermath line left to show: ${pct(silent, carvings)}`);
    console.log(`carvings whose title needed "Second", "Third"...: ${pct(ordinal, carvings)}`);
    process.exit(0);
  }
  if (process.argv.includes('--run')) {
    const { out } = playthrough(SEED, N);
    out.forEach(({ rev, chain, steps, carved }, i) => {
      const who = Object.fromEntries(chain.map((f) => [f.id, f]));
      console.log(`#${i + 1}\n  You said:  ${render(rev)}`);
      for (const s of steps) {
        const f = who[s.by];
        console.log(`  ${f.name} ${f.trade.label} (${TRAITS[s.trait].label}) ${s.changed ? s.note : 'had nothing to add'}:\n             ${s.text}`);
      }
      console.log(`  CARVED, ${carved.title}:\n             ${carved.text}${carved.after ? `\n             ${carved.after}` : ''}\n`);
    });
    process.exit(0);
  }
  if (process.argv.includes('--stats')) {
    // Not a gate, a reading: how long verses get, and how often the same
    // ending comes round. A number here is a reason to write more phrases.
    const runs = Number(arg('n', 2000));
    const count = (m, k) => m.set(k, (m.get(k) || 0) + 1);
    const afters = new Map(), titles = new Map(), lens = [];
    let same = 0, over = 0;
    for (let i = 1; i <= runs; i++) {
      const { rev, final } = chainFor(SEED, i);
      const text = render(final);
      lens.push(text.length);
      if (text.length > CONFIG.verseCap) over++;
      if (text === render(rev)) same++;
      count(afters, aftermath(final, rev)); count(titles, title(final));
    }
    lens.sort((a, b) => a - b);
    const pct = (n) => (100 * n / runs).toFixed(1) + '%';
    const top = (m, n) => [...m].sort((a, b) => b[1] - a[1]).slice(0, n).map(([k, v]) => `  ${pct(v).padStart(6)}  ${k}`).join('\n');
    console.log(`${runs} chains, seed ${SEED}`);
    console.log(`arrived unchanged: ${pct(same)}`);
    console.log(`verse length: median ${lens[runs >> 1]}, 90th pct ${lens[Math.floor(runs * 0.9)]}, max ${lens[runs - 1]}; over the ${CONFIG.verseCap}-character cap: ${pct(over)}`);
    console.log(`distinct titles: ${titles.size}; distinct aftermath lines: ${afters.size}`);
    console.log(`most common titles:\n${top(titles, 5)}`);
    console.log(`most common aftermath lines:\n${top(afters, 5)}`);
    process.exit(0);
  }
  const out = [];
  for (let i = 1; i <= N; i++) {
    const { rev, chain, steps, final } = chainFor(SEED, i);
    const who = Object.fromEntries(chain.map((f) => [f.id, f]));
    if (MD) {
      out.push(`### ${i}. ${title(final).replace(/^the/, 'The')}`, '');
      out.push(`**You said:** ${render(rev)}`, '');
      for (const s of steps) {
        const f = who[s.by];
        out.push(`- **${f.name} ${f.trade.label}** (${TRAITS[s.trait].label}) ${s.changed ? s.note : 'had nothing to add'}:  `);
        out.push(`  *${s.text}*`);
      }
      out.push('', `**Carved:** ${render(final)}  `, `${aftermath(final, rev)}`, '');
    } else {
      out.push(`#${i}`);
      out.push(`  You said:  ${render(rev)}`);
      for (const s of steps) {
        const f = who[s.by];
        out.push(`  ${f.name} ${f.trade.label} (${TRAITS[s.trait].label}) ${s.changed ? s.note : 'had nothing to add'}:`);
        out.push(`             ${s.text}`);
      }
      out.push(`  CARVED, ${title(final)}:`);
      out.push(`             ${render(final)}`);
      out.push(`             ${aftermath(final, rev)}`, '');
    }
  }
  console.log(out.join('\n'));
}
