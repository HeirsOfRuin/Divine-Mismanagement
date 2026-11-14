// Gate A: is one mutation funny? (docs/SPEC.md section 11)
//
// Prints N Revelations passed down seeded chains, every step shown. Nothing is
// asserted; a human reads it. The same seed always prints the same chains.
//
//   node tools/telephone.mjs                 20 chains, seed 1
//   node tools/telephone.mjs --n=40 --seed=7
//   node tools/telephone.mjs --md            Markdown, for docs/GATE-A.md

import { streamFor } from '../src/engine/rng.js';
import { makeFlock, HOUSEHOLDS } from '../src/engine/followers.js';
import { makeRevelation, transmit } from '../src/engine/telephone.js';
import { render, title, aftermath } from '../src/engine/render.js';
import { TEMPLATES } from '../src/data/lexicon.data.js';
import { TRAITS } from '../src/data/traits.data.js';

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

if (import.meta.url === `file://${process.argv[1]}`) {
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
      if (text.length > 140) over++;
      if (text === render(rev)) same++;
      count(afters, aftermath(final, rev)); count(titles, title(final));
    }
    lens.sort((a, b) => a - b);
    const pct = (n) => (100 * n / runs).toFixed(1) + '%';
    const top = (m, n) => [...m].sort((a, b) => b[1] - a[1]).slice(0, n).map(([k, v]) => `  ${pct(v).padStart(6)}  ${k}`).join('\n');
    console.log(`${runs} chains, seed ${SEED}`);
    console.log(`arrived unchanged: ${pct(same)}`);
    console.log(`verse length: median ${lens[runs >> 1]}, 90th pct ${lens[Math.floor(runs * 0.9)]}, max ${lens[runs - 1]}; over 140 characters: ${pct(over)}`);
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
