// The season: one input in, one new state and one record out. Pure: no DOM,
// no Date.now(), no Math.random(). Same seed and same inputs give the same
// game, which the bots, the tests and every measurement stand on.
//
// Postings, the Builder's commission and the mission field are standing
// orders, changed any time with orders() and costing no act. A problem brought
// to you at dawn is ruled on first, with ruleOn(). advance() ends the season.
//
// The season resolves in this written order (game-building F22):
//   1. (the ruling, already made)        2. your act
//   3. each rival still standing: postings, commission, her own troubles, her act
//   4. every god's offices work, read against their Scripture
//   5. collection: legends, saints, holy objects, the Book, Scripture, worship, decay, Power
//   6. drift: devotion, Mystery, entitlement, souls drifting in and out
//   7. heresy and schism
//   8. the Registry at a year's end; gods falling; ranks; the Review after the last season
//   9. the record, Pim's memo, a rival's doings, then the Book if it is due, then dawn

import { CONFIG, OUTCOMES } from '../data/config.data.js';
import { OFFICE_IDS } from '../data/offices.data.js';
import { RANKS, SAINT_FAITH, SAINT_PILGRIMS, TRAVEL_SEASONS } from '../data/match.data.js';
import { WANTS } from '../data/content/people.data.js';
import { EVENTS, MEMOS, RIVAL_LINES, ENDINGS } from '../data/content/world.data.js';
import { HEADDESK } from '../data/content/grand.data.js';
import { streamFor } from './rng.js';
import { gain, moveSouls, seasonAccount, METERS } from './meters.js';
import { scriptureSum } from './scripture.js';
import { preview, resolve } from './acts.js';
import { postIn, commissionIn, workOffices, convert } from './offices.js';
import { rivalPostings, rivalCommission, rivalAct, rivalTrouble, rivalField } from './rival.js';
import { openedNow } from './guide.js';
import { queueScenes, resolveScene, committeeEffects, finalChoice } from './story.js';
import { worship, isYearEnd, yearOf } from './derive.js';
import { thresholds, living, leaderAgainst, stronghold, unbotheredTotal } from './world.js';
import { bookDue, compileBook, bookEffects } from './book.js';
import { draw, take, fill } from './content.js';
import { newGame as blankGame } from './state.js';

// The state is plain JSON by contract (it is the save), and a JSON round trip
// is several times faster than structuredClone here (profiled: 3.5s of 3.8s).
const clone = (s) => JSON.parse(JSON.stringify(s));
// 1.3 expected becomes one, and a 30% chance of a second.
const whole = (x, rng) => (x <= 0 ? 0 : Math.floor(x) + (rng.chance(x - Math.floor(x)) ? 1 : 0));

/** A new game, at the dawn of the first season. See state.js for the options. */
export const newGame = (opts) => queueScenes(dawn(blankGame(opts)));

/** Answer the scene now waiting (Story mode, and rank scenes). Costs no act. */
export function chooseScene(prev, choiceId) {
  if (!prev.scenes || !prev.scenes.length) throw new Error('no scene is waiting');
  const s = clone(prev);
  s.sceneAfter = resolveScene(s, choiceId);
  return s;
}

/** After a won game: the last choice of the story. */
export function chooseEnding(prev, id) {
  const c = finalChoice(prev);
  if (!c || !c.options.some((o) => o.id === id)) throw new Error('nothing to choose');
  const s = clone(prev);
  s.flags.final = id;
  return s;
}

/** Several standing orders at once: { postings: { office: id }, commission: workId, field: regionIndex }. */
export function orders(prev, { postings = {}, commission: work, field } = {}) {
  if (prev.over) throw new Error('the game is over');
  const s = clone(prev);
  for (const [office, id] of Object.entries(postings)) postIn(s, 0, office, id);
  if (work !== undefined) commissionIn(s, 0, work);
  if (field !== undefined) moveField(s, 0, field);
  return s;
}
/** Send a god's missionary to work a village; another region costs a season on the road. */
export function moveField(s, gi, vi) {
  const g = s.gods[gi];
  if (!s.villages[vi]) throw new Error(`no village ${vi}`);
  if (vi === g.field) return s;
  if (s.villages[vi].region !== s.villages[g.field].region) g.travelling = TRAVEL_SEASONS;
  g.field = vi;
  return s;
}

export const post = (prev, office, id) => orders(prev, { postings: { [office]: id } });
export const commission = (prev, workId) => orders(prev, { commission: workId });
export const sendMissionary = (prev, ri) => orders(prev, { field: ri });

// ---- rulings ------------------------------------------------------------------

export function rulingOptions(s) {
  const ev = s.event && EVENTS.find((e) => e.id === s.event.id);
  if (!ev) return [];
  const g = s.gods[0];
  return ev.options.map((o, i) => {
    const n = o.need || {};
    const why = n.offerings > g.offerings ? `Needs ${n.offerings} Offerings.` : n.power > g.power ? `Needs ${n.power} Power.` : null;
    return { i, label: fill(o.label, s.event.vars), ok: !why, why, effects: o.effects || {} };
  });
}

/** Settle the problem brought to you this season. Costs no act. */
export function ruleOn(prev, choice) {
  if (prev.over) throw new Error('the game is over');
  if (!prev.event) throw new Error('nothing to rule on');
  const s = clone(prev);
  const ev = EVENTS.find((e) => e.id === s.event.id);
  const o = rulingOptions(s)[choice];
  if (!o) throw new Error('choose how to settle it');
  if (!o.ok) throw new Error(`not allowed: ${o.why}`);
  const eff = ev.options[choice].effects || {};
  const g = s.gods[0];
  const f = g.flock.find((x) => x.id === s.event.by);
  for (const m of ['faith', 'power', 'mystery', 'offerings', 'devotion', 'heresy']) if (eff[m]) gain(s, 0, m, eff[m], 'a ruling');
  if (eff.souls > 0) moveSouls(s, 'u', 0, eff.souls, 'a ruling', g.field);
  if (eff.souls < 0) moveSouls(s, 0, 'u', -eff.souls, 'a ruling', stronghold(s, 0));
  if (eff.reveal && f) f.known = true;
  if (eff.unpost && f) { f.office = null; f.settling = 0; }
  s.ruled = { id: ev.id, text: s.event.text, chose: o.label, after: ev.options[choice].after ? fill(ev.options[choice].after, s.event.vars) : null };
  s.event = null;
  return s;
}

// ---- ranks ----------------------------------------------------------------------

/** The highest rank a god now meets. Ranks are never taken away. */
export function rankFor(s, gi) {
  const g = s.gods[gi], T = thresholds(s);
  let r = g.rank;
  for (let i = g.rank + 1; i < RANKS.length; i++) {
    const R = RANKS[i];
    const leads = !R.leads || s.gods.every((x, j) => j === gi || x.fallen || x.souls < g.souls);
    if (g.souls >= R.souls * T.unit && g.faith >= R.faith * T.scale && leads) r = i; else break;
  }
  return r;
}

// ---- the season ---------------------------------------------------------------

export function advance(prev, input = {}) {
  if (prev.over) throw new Error('the game is over');
  const act = input.act || { kind: 'silent' };
  const p = preview(prev, 0, act);
  if (!p.ok) throw new Error(`not allowed: ${p.why}`);
  if (prev.event) throw new Error(`${prev.event.text} This needs a ruling first.`);
  if (prev.scenes && prev.scenes.length) throw new Error('A scene is waiting for you first.');
  const s = clone(prev);
  const me = s.gods[0];
  const T = thresholds(s);
  const before = { souls: s.gods.map((g) => g.souls), faith: me.faith, rank: s.gods.map((g) => g.rank) };
  const rec = { season: s.season, me: {}, rivals: {}, notes: [] };

  // 1. the ruling made at dawn
  if (s.ruled) { rec.ruling = s.ruled; delete s.ruled; }

  // 2. your act
  resolve(s, 0, act, streamFor(s.seed, s.season, 'act'), rec.me);

  // 3. the rivals, in order
  for (const gi of living(s).filter((i) => i > 0)) {
    const g = s.gods[gi];
    for (const [office, id] of Object.entries(rivalPostings(s, gi))) postIn(s, gi, office, id);
    const away = rivalField(s, gi);
    if (away !== null) moveField(s, gi, away);
    if (!g.building) { const w = rivalCommission(g); if (w) commissionIn(s, gi, w); }
    const rrng = streamFor(s.seed, s.season, `rival-${gi}`);
    rivalTrouble(s, gi, rrng);
    rec.rivals[gi] = {};
    resolve(s, gi, rivalAct(s, gi), rrng, rec.rivals[gi]);
  }

  // 4. offices, read against this season's Scripture
  const alive = living(s);
  const sc = {};
  for (const gi of alive) sc[gi] = scriptureSum(s.gods[gi]);
  const orng = streamFor(s.seed, s.season, 'offices');
  for (const gi of alive) workOffices(s, gi, sc[gi], orng, gi === 0 ? rec.me : rec.rivals[gi]);
  for (const gi of alive) { s.gods[gi].bluntPrev = s.gods[gi].blunt; s.gods[gi].travelling = Math.max(0, (s.gods[gi].travelling || 0) - 1); }

  // 5-7. collection, drift, heresy
  const drng = streamFor(s.seed, s.season, 'drift');
  for (const gi of alive) {
    const g = s.gods[gi], x = sc[gi], c = CONFIG;
    for (const L of g.legends) {
      if (L.left <= 0) continue;
      if (L.faith) gain(s, gi, 'faith', L.faith, 'legends');
      if (L.mystery) gain(s, gi, 'mystery', L.mystery, 'legends');
      L.left--;
    }
    for (const st of g.saints) {
      gain(s, gi, 'faith', SAINT_FAITH, 'saints');
      convert(s, gi, SAINT_PILGRIMS, drng, { reason: 'pilgrims' });
      for (const m of ['heresy', 'devotion', 'offerings', 'mystery', 'entitlement']) if (st.virtue[m]) gain(s, gi, m, st.virtue[m], 'saints');
    }
    for (const a of g.artifacts) for (const m of ['faith', 'heresy', 'devotion', 'offerings', 'mystery', 'entitlement']) if (a.effect[m]) gain(s, gi, m, a.effect[m], 'holy objects');
    if (gi === 0) { const b = bookEffects(s); if (b) { if (b.faith) gain(s, 0, 'faith', b.faith, 'the Book'); gain(s, 0, 'heresy', b.heresy, 'the Book'); } }
    if (gi === 0) { const ce = committeeEffects(s); if (ce) for (const [m, v] of Object.entries(ce)) gain(s, 0, m, v, 'the Committee'); }
    if (x.faith) gain(s, gi, 'faith', x.faith, 'Scripture');
    if (x.dev) gain(s, gi, 'devotion', x.dev, 'Scripture');
    if (x.off) gain(s, gi, 'offerings', x.off, 'Scripture');
    if (x.upkeep) gain(s, gi, 'offerings', -x.upkeep, 'upkeep of Oddities');
    if (x.heresy) gain(s, gi, 'heresy', x.heresy, x.contradictions.length ? 'contradictions' : 'Scripture');
    if (x.mystery) gain(s, gi, 'mystery', x.mystery, 'Oddities');
    if (g.missionaryOut > 0) g.missionaryOut--;

    gain(s, gi, 'entitlement', -c.entitlementDecay, 'forgetting');
    if (g.entitlement > c.entitlementLine) gain(s, gi, 'devotion', -(0.15 + (g.prayers.length >= 2 ? 0.1 : 0)), 'entitlement');
    if (g.prayers.length >= c.prayersMax) gain(s, gi, 'mystery', 1, 'unanswered prayers');
    gain(s, gi, 'devotion', (5 - g.devotion) * c.devotionPull, 'habit');
    gain(s, gi, 'mystery', (50 - g.mystery) * c.mysteryPull, 'habit');

    gain(s, gi, 'faith', worship(g), 'worship');
    gain(s, gi, 'faith', -g.faith * c.faithDecay, 'forgetting');
    const income = Object.values(seasonAccount(s, gi).faith || {}).filter((a) => a > 0).reduce((a, b) => a + b, 0);
    gain(s, gi, 'power', c.powerBase + income * c.powerPerFaithIncome, 'Faith');

    if (g.devotion < c.leakBelow) moveSouls(s, gi, 'u', whole((c.leakBelow - g.devotion) * c.leakRate, drng), 'drifting off', stronghold(s, gi));
    if (g.devotion > c.drawAbove && s.villages[g.field].unbothered >= 1 && drng.chance(c.drawRate)) moveSouls(s, 'u', gi, 1, 'drawn in', g.field);

    gain(s, gi, 'heresy', -c.heresyDecay, 'forgetting');
    if (g.heresy >= c.schismAt) {
      const n = moveSouls(s, gi, 'u', c.schismLoss, 'schism', stronghold(s, gi));
      gain(s, gi, 'heresy', c.schismHeresyAfter - g.heresy, 'schism');
      (gi === 0 ? rec.me : rec.rivals[gi]).schism = n;
    }
    g.low = g.souls < T.fallBelow ? g.low + 1 : 0;
  }

  // 8. the Registry, falls, ranks, and the Review
  if (isYearEnd(s.season, s.match.seasons)) {
    const min = T.registry[Math.min(yearOf(s.season), T.registry.length) - 1];
    for (const gi of alive) s.gods[gi].strikes = s.gods[gi].faith < min ? s.gods[gi].strikes + 1 : 0;
    rec.registry = { year: yearOf(s.season), min, faith: me.faith, strikes: me.strikes };
  }
  rec.fell = [];
  for (const gi of alive.filter((i) => i > 0)) {
    const g = s.gods[gi];
    if (g.low >= CONFIG.fallSeasons || g.strikes >= CONFIG.registryStrikes) {
      // A fallen god's people go back to being Unbothered, region by region.
      g.fallen = true;
      s.villages.forEach((r, ri) => moveSouls(s, gi, 'u', r.held[gi], 'their god fell', ri));
      rec.fell.push(gi);
    }
  }
  for (const gi of living(s)) s.gods[gi].rank = rankFor(s, gi);
  if (me.rank > before.rank[0]) rec.rankUp = me.rank;

  const c = CONFIG;
  if (me.strikes >= c.registryStrikes) s.outcome = 'forgotten';
  else if (me.low >= c.fallSeasons) { s.outcome = 'absorbed'; s.absorbedBy = leaderAgainst(s, 0); }
  else if (living(s).length === 1) s.outcome = 'rival_fell';
  else if (s.season >= s.match.seasons) {
    const doctrine = scriptureSum(me).doctrine, r = T.review;
    const leads = s.gods.every((g, i) => i === 0 || g.fallen || g.souls < me.souls);
    const top = leaderAgainst(s, 0);
    if (me.faith >= r.faith && me.souls >= r.souls && me.heresy < r.heresy && doctrine >= r.doctrine && leads) s.outcome = 'ascended';
    else if (top !== null && s.gods[top].souls >= r.souls && s.gods[top].souls > me.souls) { s.outcome = 'absorbed'; s.absorbedBy = top; }
    else s.outcome = 'passed_over';
  }

  // 9. the record
  rec.souls = { me: me.souls - before.souls[0], rivals: Object.fromEntries(s.gods.map((g, i) => [i, g.souls - before.souls[i]]).slice(1)) };
  rec.faith = me.faith - before.faith;
  rec.account = seasonAccount(s, 0);
  const crng = streamFor(s.seed, s.season, 'content');
  if (rec.me.act.ruined || rec.me.act.changed >= 3 || rec.me.act.wrong) {
    const k = draw(s, 'headdesk', HEADDESK.map((_, i) => String(i)), crng);
    rec.headdesk = k !== null ? HEADDESK[Number(k)] : null;
    rec.facepalm = true;
  }
  rec.memo = memo(s, rec, crng);
  rec.line = rivalLine(s, rec, crng);
  if (s.outcome) {
    s.over = true;
    const by = s.absorbedBy ?? leaderAgainst(s, 0);
    rec.ending = ENDINGS[s.outcome] ? fill(ENDINGS[s.outcome], { god: me.name, rival: by !== null && by !== undefined ? s.gods[by].name : 'the others' }) : null;
  }
  s.chronicle.push(rec);
  // A season has passed: whoever was settling in is now at work.
  for (const g of s.gods) for (const f of g.flock) f.settling = 0;
  if (!s.over) {
    s.season++;
    if (bookDue(s)) { compileBook(s, streamFor(s.seed, s.season, 'book')); rec.book = true; }
    dawn(s);
    queueScenes(s, rec.rankUp || 0);
    rec.opened = openedNow(s) ? openedNow(s).season : null;
  }
  return { state: s, record: rec };
}

// ---- dawn ----------------------------------------------------------------------

export function dawn(s) {
  const rng = streamFor(s.seed, s.season, 'dawn');
  const me = s.gods[0];
  for (const f of me.flock) {
    if (f.want) continue;
    f.want = draw(s, 'want', WANTS.map((w) => w.id), rng);
  }
  for (const gi of living(s)) {
    const g = s.gods[gi];
    if (g.prayers.length >= CONFIG.prayersMax || !rng.chance(CONFIG.prayerChance)) continue;
    const praying = new Set(g.prayers.map((p) => p.by));
    const can = g.flock.filter((f) => !praying.has(f.id) && (gi > 0 || f.want));
    if (!can.length) continue;
    const f = rng.pick(can);
    g.prayers.push({ id: `p${s.nextId++}`, by: f.id, want: gi === 0 ? f.want : null, season: s.season });
  }
  if (rng.chance(CONFIG.eventChance)) {
    const fits = EVENTS.filter((e) => bringerFor(s, e, rng, true));
    const id = draw(s, 'event', fits.map((e) => e.id), rng);
    if (id) {
      const ev = EVENTS.find((e) => e.id === id);
      const f = bringerFor(s, ev, rng);
      const lead = leaderAgainst(s, 0);
      const vars = { name: f.name, trade: f.trade.label, god: me.name, rival: lead !== null ? s.gods[lead].name : 'nobody' };
      s.event = { id, by: f.id, vars, text: fill(ev.text, vars) };
    }
  }
  return s;
}

function bringerFor(s, ev, rng, test = false) {
  const g = s.gods[0];
  const who = ev.who || {};
  if (ev.needs?.tablets && g.tablets.length < ev.needs.tablets) return null;
  if (ev.needs?.work && !g.works[ev.needs.work]) return null;
  if (/\{rival\}/.test(JSON.stringify(ev)) && leaderAgainst(s, 0) === null) return null;
  const fits = g.flock.filter((f) => (!who.trait || f.traits.includes(who.trait)) && (!who.office || f.office === who.office) && (!who.known || f.known));
  if (!fits.length) return null;
  return test ? true : rng.pick(fits);
}

// ---- words about the season --------------------------------------------------

function situations(s, rec) {
  const me = s.gods[0];
  const out = [];
  if (s.season === 1) out.push('first');
  if (rec.registry && rec.registry.strikes > 0) out.push('registry_warning');
  else if (rec.registry) out.push('year_end');
  if (rec.me.schism) out.push('schism');
  if (rec.me.act.stale) out.push('miracle_again');
  if (rec.me.act.kind === 'miracle') out.push('miracle');
  if (rec.me.act.kind === 'silent') out.push('silent');
  if (rec.me.act.kind === 'reveal') out.push('verse');
  if (rec.me.act.kind === 'dispute') out.push(rec.me.act.won ? 'dispute_won' : rec.me.act.lost ? 'dispute_lost' : 'dispute_drawn');
  if ((rec.me.offices || []).some((o) => o.misquoted)) out.push('misquoted');
  if ((rec.me.offices || []).some((o) => o.done)) out.push('work_done');
  if (rec.souls.me <= -2) out.push('souls_lost');
  if (rec.souls.me >= 2) out.push('souls_won');
  if (me.entitlement > CONFIG.entitlementLine) out.push('entitled');
  if (me.heresy >= 6) out.push('heresy_high');
  const lead = leaderAgainst(s, 0);
  if (lead !== null && s.gods[lead].souls > me.souls + 3) out.push('rival_ahead');
  if (rec.faith >= 1) out.push('faith_up');
  if (rec.faith <= -1) out.push('faith_down');
  out.push('quiet');
  return out;
}

function memo(s, rec, rng) {
  const lead = leaderAgainst(s, 0);
  for (const key of situations(s, rec)) {
    const lines = MEMOS[key];
    if (!lines) continue;
    const id = draw(s, 'memo', lines.map((_, i) => `${key}:${i}`), rng);
    if (id) return fill(lines[Number(id.split(':')[1])], { god: s.gods[0].name, rival: lead !== null ? s.gods[lead].name : 'nobody', faith: Math.round(Math.abs(rec.faith)), min: rec.registry ? rec.registry.min : '' });
  }
  return null;
}

// One rival's doings a season: the one with news, else the leader.
function rivalLine(s, rec, rng) {
  const me = s.gods[0], T = thresholds(s);
  const alive = living(s).filter((i) => i > 0);
  if (!alive.length) return null;
  const lead = leaderAgainst(s, 0);
  const tries = [];
  if (me.souls < T.fair * 0.45) tries.push([lead, 'absorb_offer']);
  for (const gi of alive) if (s.gods[gi].souls < T.fair / 3) tries.push([gi, 'falling']);
  for (const gi of [lead, ...alive.filter((i) => i !== lead)]) {
    if (rec.rivals[gi]) tries.push([gi, rec.rivals[gi].act.kind]);
    if ((rec.souls.rivals[gi] || 0) >= 2) tries.push([gi, 'gained']);
  }
  for (const [gi, key] of tries) {
    const lines = RIVAL_LINES[key];
    if (!lines) continue;
    const id = draw(s, 'rival', lines.map((_, i) => `${key}:${i}`), rng);
    if (id) return { by: gi, text: fill(lines[Number(id.split(':')[1])], { god: me.name, rival: s.gods[gi].name }) };
  }
  return null;
}

// ---- for the screens -------------------------------------------------------------

export { preview };
export const outcomeInfo = (id) => OUTCOMES[id] || null;
export const meters = METERS;
export const officeIds = OFFICE_IDS;
export { unbotheredTotal };
