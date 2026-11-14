// sim/adapter.js: connects this game to the game-measure kit (sim/run.js).
import { newGame, advance } from '../src/engine/turn.js';
import { OUTCOMES } from '../src/data/config.data.js';
import { decide, POLICIES } from './bot.js';

export const axes = { policy: Object.keys(POLICIES) };
export const defaults = { policy: 'adaptive' };

export function play(seed, opts = {}) {
  let s = newGame({ seed, ...(opts.match || {}) });
  if (opts.setup) s = opts.setup(s);
  for (let guard = 0; !s.over && guard < 100; guard++) {
    const d = decide(s, opts.policy || 'adaptive', opts.fixed ? opts.fixed(s) : {});
    s = advance(d.state, d.input).state;
  }
  return s;
}

export function progress(s) {
  const missing = [];
  if (!s.over) missing.push('never ended');
  if (s.chronicle.length < 1) missing.push('no season was played');
  if (s.chronicle.some((r, i) => r.season !== i + 1)) missing.push('a season was skipped or repeated');
  return missing;
}

export function metrics(s) {
  const g = s.gods[0];
  const n = (k) => g.n[k] || 0;
  return {
    win: OUTCOMES[s.outcome].win,
    ascended: s.outcome === 'ascended', rival_fell: s.outcome === 'rival_fell', passed_over: s.outcome === 'passed_over',
    absorbed: s.outcome === 'absorbed', forgotten: s.outcome === 'forgotten',
    seasons: s.chronicle.length, faith: g.faith, souls: g.souls, heresy: g.heresy, mystery: g.mystery,
    reveal: n('reveal'), miracle: n('miracle'), silent: n('silent'), works: Object.keys(g.works).length,
    rank: g.rank, saints: g.saints.length, artifacts: g.artifacts.length, wonders: n('wonder'), book: Boolean(s.book), exasperation: g.exasperation,
  };
}

export const digest = (s) => JSON.stringify([s.outcome, s.season, s.gods.map((g) => [g.souls, g.faith.toFixed(6)])]);

export function trace(s) {
  return s.chronicle.map((r) => `S${String(r.season).padStart(2)} ${r.me.act.kind.padEnd(8)} souls ${String(r.souls.me).padStart(2)} faith ${r.faith.toFixed(1).padStart(6)} | rivals ${Object.values(r.rivals).map((x) => x.act.kind).join(',')}${r.ruling ? ` | ruled: ${r.ruling.chose}` : ''}${r.registry ? ` | Registry: ${r.registry.faith.toFixed(0)} vs ${r.registry.min}` : ''}`).join('\n') + `\n${s.outcome}`;
}
