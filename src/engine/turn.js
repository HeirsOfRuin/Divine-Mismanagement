// The season: one input in, one new state and one record out. Pure: no DOM,
// no Date.now(), no Math.random(). Same seed and same inputs give the same
// game, which the bot, the tests and every measurement stand on.
//
// Postings and the Builder's commission are standing orders, changed any time
// with post() and commission() and costing no act. advance() ends the season.
//
// A problem brought to you at dawn is ruled on first, with ruleOn(), before
// the act is chosen, so the act is previewed against the state the ruling left.
//
// The season resolves in this written order (game-building F22):
//   1. (the ruling, already made with ruleOn)
//   2. your act
//   3. the rival's postings, commission and act (the same functions)
//   4. both gods' offices work, read against their Scripture
//   5. collection: legends, Scripture, worship, decay, Power
//   6. drift: devotion, Mystery, entitlement, souls drifting in and out
//   7. heresy and schism
//   8. the Registry at a year's end; the Review after the last season
//   9. the record, Pim's memo, then dawn: prayers, wants, the next problem

import { CONFIG, OUTCOMES } from '../data/config.data.js';
import { OFFICE_IDS } from '../data/offices.data.js';
import { WANTS } from '../data/content/people.data.js';
import { EVENTS, MEMOS, RIVAL_LINES, ENDINGS } from '../data/content/world.data.js';
import { streamFor } from './rng.js';
import { gain, moveSouls, seasonAccount, METERS } from './meters.js';
import { scriptureSum } from './scripture.js';
import { preview, resolve } from './acts.js';
import { postIn, commissionIn, workOffices } from './offices.js';
import { rivalPostings, rivalCommission, rivalAct } from './rival.js';
import { worship, isYearEnd, yearOf, registryMinimum } from './derive.js';
import { draw, fill } from './content.js';
import { newGame as blankGame } from './state.js';

/** A new game, at the dawn of the first season (prayers, wants, maybe a problem). */
export const newGame = (opts) => dawn(blankGame(opts));

// The state is plain JSON by contract (it is the save), and a JSON round trip
// is several times faster than structuredClone here (profiled: 3.5s of 3.8s).
const clone = (s) => JSON.parse(JSON.stringify(s));
// 1.3 expected becomes one, and a 30% chance of a second.
const whole = (x, rng) => (x <= 0 ? 0 : Math.floor(x) + (rng.chance(x - Math.floor(x)) ? 1 : 0));

/** Change a posting. Costs no act; the newly posted settle in for a season. */
export function post(prev, office, id) {
  if (prev.over) throw new Error('the game is over');
  return postIn(clone(prev), 0, office, id);
}

/** Several standing orders at once: { postings: { office: id }, commission: workId }. */
export function orders(prev, { postings = {}, commission: work } = {}) {
  if (prev.over) throw new Error('the game is over');
  const s = clone(prev);
  for (const [office, id] of Object.entries(postings)) postIn(s, 0, office, id);
  if (work !== undefined) commissionIn(s, 0, work);
  return s;
}

/** Tell the Builder what to put up next. */
export function commission(prev, workId) {
  if (prev.over) throw new Error('the game is over');
  return commissionIn(clone(prev), 0, workId);
}

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
  s.ruled = rule(s, choice, streamFor(s.seed, s.season, 'ruling'));
  return s;
}

function rule(s, choice, rng) {
  const ev = EVENTS.find((e) => e.id === s.event.id);
  const opts = rulingOptions(s);
  const o = opts[choice];
  if (!o) throw new Error('choose how to settle it');
  if (!o.ok) throw new Error(`not allowed: ${o.why}`);
  const eff = ev.options[choice].effects || {};
  const g = s.gods[0];
  const f = g.flock.find((x) => x.id === s.event.by);
  for (const m of ['faith', 'power', 'mystery', 'offerings', 'devotion', 'heresy']) if (eff[m]) gain(s, 0, m, eff[m], 'a ruling');
  if (eff.souls > 0) moveSouls(s, 'u', 0, eff.souls, 'a ruling');
  if (eff.souls < 0) moveSouls(s, 0, 'u', -eff.souls, 'a ruling');
  if (eff.rivalSouls < 0) moveSouls(s, 1, 'u', -eff.rivalSouls, 'a ruling');
  if (eff.reveal && f) f.known = true;
  if (eff.unpost && f) { f.office = null; f.settling = 0; }
  const ruled = { id: ev.id, text: s.event.text, chose: o.label,
    after: ev.options[choice].after ? fill(ev.options[choice].after, s.event.vars) : null };
  s.event = null;
  return ruled;
}

// ---- the season ---------------------------------------------------------------

export function advance(prev, input = {}) {
  if (prev.over) throw new Error('the game is over');
  const act = input.act || { kind: 'silent' };
  const p = preview(prev, 0, act);
  if (!p.ok) throw new Error(`not allowed: ${p.why}`);
  if (prev.event) throw new Error(`${prev.event.text} This needs a ruling first.`);
  const s = clone(prev);
  const [me, her] = s.gods;
  const before = { souls: [me.souls, her.souls], faith: me.faith };
  const rec = { season: s.season, me: {}, her: {}, notes: [] };

  // 1. the ruling made at dawn
  if (s.ruled) { rec.ruling = s.ruled; delete s.ruled; }

  // 2. your act
  resolve(s, 0, act, streamFor(s.seed, s.season, 'act'), rec.me);

  // 3. the rival
  for (const [office, id] of Object.entries(rivalPostings(her, s.season))) postIn(s, 1, office, id);
  if (!her.building) { const w = rivalCommission(her); if (w) commissionIn(s, 1, w); }
  resolve(s, 1, rivalAct(s), streamFor(s.seed, s.season, 'rival'), rec.her);

  // 4. offices, read against this season's Scripture
  const sc = [scriptureSum(me), scriptureSum(her)];
  const orng = streamFor(s.seed, s.season, 'offices');
  workOffices(s, 0, sc[0], orng, rec.me);
  workOffices(s, 1, sc[1], orng, rec.her);
  for (const g of s.gods) g.bluntPrev = g.blunt;

  // 5-7. collection, drift, heresy
  const drng = streamFor(s.seed, s.season, 'drift');
  for (const gi of [0, 1]) {
    const g = s.gods[gi], x = sc[gi], c = CONFIG;
    for (const L of g.legends) {
      if (L.left <= 0) continue;
      if (L.faith) gain(s, gi, 'faith', L.faith, 'legends');
      if (L.mystery) gain(s, gi, 'mystery', L.mystery, 'legends');
      L.left--;
    }
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

    const w = worship(g);
    gain(s, gi, 'faith', w, 'worship');
    gain(s, gi, 'faith', -g.faith * c.faithDecay, 'forgetting');
    const income = Object.values(seasonAccount(s, gi).faith || {}).filter((a) => a > 0).reduce((a, b) => a + b, 0);
    gain(s, gi, 'power', c.powerBase + income * c.powerPerFaithIncome, 'Faith');

    if (g.devotion < c.leakBelow) moveSouls(s, gi, 'u', whole((c.leakBelow - g.devotion) * c.leakRate, drng), 'drifting off');
    if (g.devotion > c.drawAbove && s.unbothered >= 1 && drng.chance(c.drawRate)) moveSouls(s, 'u', gi, 1, 'drawn in');

    gain(s, gi, 'heresy', -c.heresyDecay, 'forgetting');
    if (g.heresy >= c.schismAt) {
      const n = moveSouls(s, gi, 'u', c.schismLoss, 'schism');
      gain(s, gi, 'heresy', c.schismHeresyAfter - g.heresy, 'schism');
      (gi === 0 ? rec.me : rec.her).schism = n;
    }
    g.low = g.souls < c.fallBelow ? g.low + 1 : 0;
  }

  // 8. the Registry, and the Review
  if (isYearEnd(s.season)) {
    const min = registryMinimum(s.season);
    for (const g of s.gods) g.strikes = g.faith < min ? g.strikes + 1 : 0;
    rec.registry = { year: yearOf(s.season), min, faith: me.faith, strikes: me.strikes };
  }
  const c = CONFIG;
  if (me.strikes >= c.registryStrikes) s.outcome = 'forgotten';
  else if (me.low >= c.fallSeasons) s.outcome = 'absorbed';
  else if (her.low >= c.fallSeasons || her.strikes >= c.registryStrikes) s.outcome = 'rival_fell';
  else if (s.season >= c.seasons) {
    const doctrine = scriptureSum(me).doctrine, r = c.review;
    if (me.faith >= r.faith && me.souls >= r.souls && me.heresy < r.heresy && doctrine >= r.doctrine) s.outcome = 'ascended';
    else if (her.souls >= r.souls) s.outcome = 'absorbed';
    else s.outcome = 'passed_over';
  }

  // 9. the record
  rec.souls = { me: me.souls - before.souls[0], her: her.souls - before.souls[1] };
  rec.faith = me.faith - before.faith;
  rec.account = seasonAccount(s, 0);
  const crng = streamFor(s.seed, s.season, 'content');
  rec.memo = memo(s, rec, crng);
  rec.her.line = rivalLine(s, rec, crng);
  if (s.outcome) {
    s.over = true;
    rec.ending = ENDINGS[s.outcome] ? fill(ENDINGS[s.outcome], { god: me.name, rival: her.name }) : null;
  }
  s.chronicle.push(rec);
  // A season has passed: whoever was settling in is now at work.
  for (const g of s.gods) for (const f of g.flock) f.settling = 0;
  if (!s.over) { s.season++; dawn(s); }
  return { state: s, record: rec };
}

// ---- dawn ----------------------------------------------------------------------

export function dawn(s) {
  const rng = streamFor(s.seed, s.season, 'dawn');
  const [me, her] = s.gods;
  // Everyone without a want acquires one. A want is never handed out twice.
  for (const f of me.flock) {
    if (f.want) continue;
    const id = draw(s, 'want', WANTS.map((w) => w.id), rng);
    f.want = id;
  }
  // One new prayer a season, from someone not already praying.
  for (const [gi, g] of [[0, me], [1, her]]) {
    if (g.prayers.length >= CONFIG.prayersMax || !rng.chance(CONFIG.prayerChance)) continue;
    const praying = new Set(g.prayers.map((p) => p.by));
    const can = g.flock.filter((f) => !praying.has(f.id) && (gi === 1 || f.want));
    if (!can.length) continue;
    const f = rng.pick(can);
    g.prayers.push({ id: `p${s.nextId++}`, by: f.id, want: gi === 0 ? f.want : null, season: s.season });
  }
  // At most one problem brought to you.
  if (rng.chance(CONFIG.eventChance)) {
    const fits = EVENTS.filter((e) => bringerFor(s, e, rng, true));
    const id = draw(s, 'event', fits.map((e) => e.id), rng);
    if (id) {
      const ev = EVENTS.find((e) => e.id === id);
      const f = bringerFor(s, ev, rng);
      const vars = { name: f.name, trade: f.trade.label, god: me.name, rival: her.name };
      s.event = { id, by: f.id, vars, text: fill(ev.text, vars) };
    }
  }
  return s;
}

function bringerFor(s, ev, rng, test = false) {
  const g = s.gods[0];
  const who = ev.who || {};
  const fits = g.flock.filter((f) => (!who.trait || f.traits.includes(who.trait)) && (!who.office || f.office === who.office) && (!who.known || f.known));
  if (ev.needs?.tablets && g.tablets.length < ev.needs.tablets) return null;
  if (ev.needs?.work && !g.works[ev.needs.work]) return null;
  if (!fits.length) return null;
  return test ? true : rng.pick(fits);
}

// ---- words about the season --------------------------------------------------

function situations(s, rec) {
  const [me, her] = s.gods;
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
  if (rec.me.offices.some((o) => o.misquoted)) out.push('misquoted');
  if (rec.me.offices.some((o) => o.done)) out.push('work_done');
  if (rec.souls.me <= -2) out.push('souls_lost');
  if (rec.souls.me >= 2) out.push('souls_won');
  if (me.entitlement > CONFIG.entitlementLine) out.push('entitled');
  if (me.heresy >= 6) out.push('heresy_high');
  if (her.souls > me.souls + 3) out.push('rival_ahead');
  if (rec.faith >= 1) out.push('faith_up');
  if (rec.faith <= -1) out.push('faith_down');
  out.push('quiet');
  return out;
}

function memo(s, rec, rng) {
  for (const key of situations(s, rec)) {
    const lines = MEMOS[key];
    if (!lines) continue;
    const id = draw(s, 'memo', lines.map((_, i) => `${key}:${i}`), rng);
    if (id) {
      const text = lines[Number(id.split(':')[1])];
      return fill(text, { god: s.gods[0].name, rival: s.gods[1].name, faith: Math.round(Math.abs(rec.faith)), min: rec.registry ? rec.registry.min : '' });
    }
  }
  return null;
}

function rivalLine(s, rec, rng) {
  const [me, her] = s.gods;
  const keys = [];
  if (me.souls < 8) keys.push('absorb_offer');
  if (her.souls < 6) keys.push('falling');
  keys.push(rec.her.act.kind);
  if (rec.souls.her >= 2) keys.push('gained');
  for (const key of keys) {
    const lines = RIVAL_LINES[key];
    if (!lines) continue;
    const id = draw(s, 'rival', lines.map((_, i) => `${key}:${i}`), rng);
    if (id) return fill(lines[Number(id.split(':')[1])], { god: me.name, rival: her.name });
  }
  return null;
}

// ---- the view ------------------------------------------------------------------

export { preview };
export const outcomeInfo = (id) => OUTCOMES[id] || null;
export const meters = METERS;
export const officeIds = OFFICE_IDS;
