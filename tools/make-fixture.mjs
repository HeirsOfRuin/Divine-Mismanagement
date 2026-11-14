// Writes test/fixtures/v<SAVE_VERSION>-save.json: a real game, five seasons in,
// saved by this build. Run it ONCE per save version, before the version changes,
// and commit the result (test/save-contract.test.js loads every fixture).
import { writeFileSync, existsSync } from 'node:fs';
import { newGame, advance } from '../src/engine/turn.js';
import { SAVE_VERSION, serialize } from '../src/engine/state.js';
import { decide } from '../sim/bot.js';

const path = `test/fixtures/v${SAVE_VERSION}-save.json`;
if (existsSync(path) && !process.argv.includes('--force')) { console.error(`${path} exists. A shipped fixture is never rewritten.`); process.exit(1); }
let s = newGame({ seed: 12345, name: 'the God of Doors That Stick' });
for (let i = 0; i < 5; i++) { const d = decide(s, 'adaptive'); s = advance(d.state, d.input).state; }
writeFileSync(path, JSON.stringify(JSON.parse(serialize(s)), null, 1) + '\n');
console.log(`wrote ${path}: season ${s.season}`);
