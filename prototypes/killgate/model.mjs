// Gate B: a numbers-only model of the management game. No screen, no prose.
//
// Two gods work one village of 36 by the same rules (the world plays by the
// player's rules: game-building rule 7). Each has twelve named devotees with
// traits, six offices to staff, up to CFG.acts divine acts a season, and
// Scripture carved by the real telephone (src/engine/telephone.js), so the
// verses here are the verses of the game.
//
// Simplified on purpose, and said so in docs/KILLGATE.md: the flock's devotion
// is one number, not twelve; converts beyond the named twelve are a count;
// prayers are one a season with no content; there are no events.
//
// This file is the Stage 2 record. When the engine exists it is retired.

import { streamFor } from '../../src/engine/rng.js';
import { makeFlock } from '../../src/engine/followers.js';
import { makeRevelation, transmit } from '../../src/engine/telephone.js';
import { TEMPLATES } from '../../src/data/lexicon.data.js';
import { CFG, OFFICE, MIRACLES, WORKS, VERSE } from './data.mjs';

export const OFFICES = ['prophet', 'preacher', 'missionary', 'collector', 'builder', 'witness'];
const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
// 1.3 expected converts is one, and a 30% chance of a second.
const whole = (x, rng) => (x <= 0 ? 0 : Math.floor(x) + (rng.chance(x - Math.floor(x)) ? 1 : 0));

function newGod(id, rng, policy) {
  return {
    id, policy,
    flock: makeFlock(rng).map((f) => ({ ...f, known: false, office: null, settling: 0 })),
    ...structuredClone(CFG.start),
    heresy: 0, entitlement: 0, charm: 0,
    tablets: [], works: {}, building: null,
    prayers: 0, missionaryOut: 0, low: 0, starved: 0, fell: false, forgotten: false,
    spent: {},
    n: { reveal: 0, miracle: 0, answer: 0, poach: 0, dream: 0, festival: 0, silent: 0, schism: 0, garbled: 0 },
  };
}

export function newWorld(seed, playerPolicy, rivalPolicy, cfg = CFG) {
  const rng = streamFor(seed, 0, 'world');
  const gods = [newGod(0, rng, playerPolicy), newGod(1, rng, rivalPolicy)];
  return { seed, cfg, season: 0, gods, unbothered: cfg.village - gods[0].souls - gods[1].souls, over: null };
}

const holder = (g, office) => g.flock.find((f) => f.office === office && f.settling === 0) || null;
const traitOf = (f) => (f ? f.traits[0] : null);
const hasWork = (g, id) => (g.works[id] ? (g.works[id].useless ? 0 : g.works[id].crooked ? 0.75 : 1) : 0);

// ---- Scripture: what a carved verse does each season --------------------
// Read from the same structure the Scripture page will render.
export function verseEffects(verse, households, g) {
  const t = TEMPLATES.find((x) => x.id === verse.template);
  let f = 1, odd = 0, tire = 0;
  for (const k of ['object', 'tail']) {
    const expected = k === 'object' ? t.objects.length > 0 : true;
    const s = verse[k];
    if (!s) { if (expected) f *= 0.5; continue; }
    if (s.via) { f *= 0.5; odd++; }
    if (s.lit) { f *= 1.2; tire += 0.05; }
  }
  if (verse.verb.cur !== verse.verb.base) { f = 0; odd++; }
  if (verse.gist) f *= 0.25;
  if (verse.bare) { f = 0; odd++; }
  if (verse.modal.negDropped) f = -f;            // it now commands what it was sent to forbid
  if (verse.modal.let) f *= 0.5;                 // lovely, and not clearly a rule
  const reach = households / 4;
  const k = f * VERSE.strength[verse.modal.strength] * VERSE.scope[verse.who.scope] * reach;
  const base = VERSE[verse.template];
  const e = {
    template: verse.template, sign: Math.sign(k), k,
    dev: (base.dev || 0) * k - tire * reach,
    faith: (base.faith || 0) * k,
    off: (base.off || 0) * k,
    convBonus: (base.convBonus || 0) * k,
    heresy: (base.heresy || 0) * k,
    mystery: (verse.modal.let ? 1 : 0) + odd * VERSE.oddMystery * (hasWork(g, 'reliquary') ? 1.5 : 1),
    upkeep: hasWork(g, 'reliquary') ? 0 : odd * VERSE.oddUpkeep,
    odd,
  };
  if (verse.penalty || verse.modal.strength === 4) { e.dev += VERSE.fearDev * reach; e.heresy += VERSE.fearHeresy; }
  if (verse.rider) { e.off += VERSE.riderOff; e.heresy += VERSE.riderHeresy; }
  return e;
}

function scripture(g) {
  const sum = { dev: 0, faith: 0, off: 0, convBonus: 0, heresy: 0, mystery: 0, doctrine: 0 };
  const best = {};
  for (const t of g.tablets) {
    const e = t.effects;
    // A second verse on the same matter adds little; an opposite one is a contradiction.
    const prior = best[e.template];
    let share = 1;
    if (prior) {
      if (prior.sign * e.sign < 0) sum.heresy += VERSE.contradiction;
      share = VERSE.repeatShare;
    } else best[e.template] = e;
    for (const k of ['dev', 'faith', 'off', 'convBonus']) sum[k] += e[k] * (e[k] > 0 ? share : 1);
    sum.heresy += e.heresy;
    sum.mystery += e.mystery;
    sum.off -= e.upkeep;
    if (e.k > 0) sum.doctrine++;
  }
  return sum;
}

// ---- Divine acts -------------------------------------------------------
function reveal(w, g, act, rng) {
  const t = TEMPLATES.find((x) => x.id === act.template);
  const chain = act.chain.map((id) => g.flock.find((f) => f.id === id)).filter(Boolean);
  const prophet = holder(g, 'prophet');
  if (prophet && chain[0] !== prophet) { const i = chain.indexOf(prophet); if (i > 0) chain.splice(i, 1); chain.unshift(prophet); }
  const cost = Math.max(0, chain.length - 1) * w.cfg.costs.link;
  if (!chain.length || g.power < cost) return false;
  g.power -= cost;
  const rev = makeRevelation(t.id, act.object ?? (t.objects.length ? rng.pick(t.objects) : null), act.tail ?? rng.pick(t.tails));
  const sent = transmit(rev, chain, rng, g.spent);
  g.spent = sent.spent;
  for (const f of chain) f.known = true;
  const households = Math.min(4, new Set(chain.map((f) => f.household)).size + (hasWork(g, 'bell') ? 1 : 0));
  g.tablets.push({ verse: sent.final, households, effects: verseEffects(sent.final, households, g) });
  if (g.tablets.length > w.cfg.tablets) g.tablets.shift();
  g.n.reveal++;
  return true;
}

function miracle(w, g, o, act, rng) {
  const cost = w.cfg.costs[act.kind];
  if (g.power < cost) return false;
  g.power -= cost;
  const wit = holder(g, 'witness');
  if (wit) wit.known = true;
  const how = OFFICE.witness[traitOf(wit) || 'none'];
  // The seen-it-before rule: each kind is worth less every time.
  g.seen = g.seen || {};
  const stale = 1 / (1 + (g.seen[act.kind] || 0) * 0.5);
  g.seen[act.kind] = (g.seen[act.kind] || 0) + 1;
  const kind = how.swap ? rng.pick(Object.keys(MIRACLES)) : act.kind;
  const m = MIRACLES[kind];
  g.faith += m.faith * how.faith * stale;
  g.mystery += how.mystery;
  g.offerings += (m.off || 0);
  g.devotion += (m.dev || 0) * stale;
  if (m.conv) convert(w, g, o, m.conv * stale, rng);
  if (m.disable) o.missionaryOut = Math.max(o.missionaryOut, m.disable);
  if (how.alarm) convert(w, g, o, how.alarm, rng, true);
  g.heresy += how.heresy || 0;
  g.entitlement += 1 + (how.entitlement || 0);
  g.n.miracle++;
  return true;
}

// Souls come from the Unbothered while there are any, then from the rival.
function convert(w, g, o, expected, rng, fromRivalOnly = false) {
  let n = 0;
  if (!fromRivalOnly && w.unbothered >= 1) {
    n = Math.min(whole(expected, rng), Math.floor(w.unbothered));
    w.unbothered -= n;
  } else {
    const hard = w.cfg.poachFactor * (hasWork(o, 'guest_house') ? 0.5 : 1) * (o.devotion > 6 ? 0.5 : 1);
    n = Math.min(whole(expected * (fromRivalOnly ? 1 : hard), rng), Math.floor(o.souls));
    o.souls -= n;
  }
  g.souls += n;
  return n;
}

function act(w, g, o, a, rng) {
  const c = w.cfg.costs;
  switch (a.type) {
    case 'reveal': return reveal(w, g, a, rng);
    case 'miracle': return miracle(w, g, o, a, rng);
    case 'answer':
      if (g.prayers < 1 || g.power < c.answer) return false;
      g.power -= c.answer; g.prayers--; g.faith += 2; g.devotion += 0.15; g.mystery -= 2; g.entitlement += 0.3; g.n.answer++;
      return true;
    case 'poach':                                  // answer one of the rival's neglected followers
      // Only works on a follower the rival has been ignoring, and once a season.
      if (g.power < c.poach || o.prayers < 3 || o.souls < 1 || g.poached === w.season) return false;
      g.poached = w.season; o.prayers--;
      g.power -= c.poach; o.souls--; g.souls++; g.n.poach++;
      return true;
    case 'dream': {
      const f = g.flock.find((x) => x.id === a.id);
      if (!f || f.known || g.power < c.dream) return false;
      g.power -= c.dream; f.known = true; g.n.dream++;
      return true;
    }
    case 'festival':
      if (!hasWork(g, 'feast_hall') || g.offerings < c.festival) return false;
      g.offerings -= c.festival; g.devotion += 0.5 * hasWork(g, 'feast_hall'); convert(w, g, o, 1, rng); g.n.festival++;
      return true;
    default: return false;
  }
}

// ---- The offices work --------------------------------------------------
function offices(w, g, o, s, rng) {
  const add = (e) => {
    g.faithIn += e.faith || 0; g.mystery += e.mystery || 0; g.heresy += e.heresy || 0;
    g.devotion += e.dev || 0; g.offerings += e.off || 0;
  };
  for (const f of g.flock) if (f.office && f.settling === 0) f.known = true;   // a season in office shows what they are

  const pr = holder(g, 'preacher');
  if (pr) {
    const e = OFFICE.preacher[traitOf(pr)]; add(e);
    if (e.garble && g.tablets.length && rng.chance(e.garble)) {
      const t = rng.pick(g.tablets);
      t.effects = { ...t.effects, dev: 0, faith: 0, off: 0, convBonus: 0, heresy: Math.max(0, t.effects.heresy), k: 0, sign: 0, mystery: t.effects.mystery + VERSE.oddMystery, odd: t.effects.odd + 1 };
      g.n.garbled++;
    }
    if (e.leave && g.souls > 0 && rng.chance(e.leave)) { g.souls--; w.unbothered++; }
  }

  const mi = holder(g, 'missionary');
  g.blunt = 1;
  if (mi && g.missionaryOut === 0) {
    const e = OFFICE.missionary[traitOf(mi)]; add(e);
    g.charm = clamp(g.charm + (e.charm || 0), -3, 5);
    if (e.blunt) g.blunt = e.blunt;
    const rate = e.conv * (1 + 0.1 * g.charm) * (1 + s.convBonus) * (o.bluntPrev || 1);
    convert(w, g, o, rate, rng);
    if (e.defect && rng.chance(e.defect)) { mi.office = null; if (g.souls > 0) { g.souls--; o.souls++; } }
  }

  const co = holder(g, 'collector');
  if (co) {
    const e = OFFICE.collector[traitOf(co)]; add(e);
    if (e.offRange) g.offerings += rng.range(e.offRange[0], e.offRange[1]);
  }
  if (hasWork(g, 'box')) g.offerings += hasWork(g, 'box');

  const bu = holder(g, 'builder');
  if (bu && g.building) {
    const e = OFFICE.builder[traitOf(bu)];
    const b = g.building, spec = WORKS[b.id];
    const cost = spec.cost * (e.costMult || 1);
    if (!b.paid && g.offerings >= cost) { g.offerings -= cost; b.paid = true; }
    if (b.paid) {
      b.progress += e.progress; g.heresy += e.heresy || 0;
      if (b.progress >= spec.need) {
        g.works[b.id] = { crooked: Boolean(e.crooked), useless: Boolean(e.useless) };
        if (e.crooked) g.mystery += 5;
        if (e.useless) g.mystery += 10;
        g.devotion += e.devOnDone || 0;
        g.building = null;
      }
    }
  }
}

// ---- One season --------------------------------------------------------
export function season(w) {
  w.season++;
  const rng = streamFor(w.seed, w.season, 'season');
  const [a, b] = w.gods;

  for (const g of w.gods) {
    const o = g === a ? b : a;
    g.prayers = Math.min(3, g.prayers + 1);
    for (const f of g.flock) if (f.settling > 0) f.settling--;

    // Postings: a newly posted devotee spends this season settling in.
    const want = g.policy.postings ? g.policy.postings(g, o, w) : {};
    for (const office of OFFICES) {
      if (!(office in want)) continue;
      const cur = g.flock.find((f) => f.office === office);
      if ((cur ? cur.id : null) === want[office]) continue;
      if (cur) cur.office = null;
      const next = g.flock.find((f) => f.id === want[office]);
      if (next) { next.office = office; next.settling = 1; }
    }
    if (!g.building && g.policy.build) { const id = g.policy.build(g, o, w); if (id && !g.works[id]) g.building = { id, progress: 0, paid: false }; }

    const acts = (g.policy.acts ? g.policy.acts(g, o, w) : []).slice(0, w.cfg.acts);
    let done = 0;
    for (const x of acts) if (act(w, g, o, x, rng)) done++;
    g.acted = done;
    g.mystery += done * w.cfg.mysteryPerAct;
    if (done === 0) { g.mystery += w.cfg.mysterySilence; g.devotion += w.cfg.neglectDev; g.n.silent++; }
  }

  for (const g of w.gods) { g.faithIn = 0; g.s = scripture(g); }
  for (const g of w.gods) { const o = g === a ? b : a; offices(w, g, o, g.s, rng); }
  for (const g of w.gods) g.bluntPrev = g.blunt;

  for (const g of w.gods) {
    const s = g.s, c = w.cfg;
    g.devotion += s.dev; g.offerings = Math.max(0, g.offerings + s.off); g.heresy += s.heresy; g.mystery += s.mystery; g.mystery += (50 - g.mystery) * c.mysteryPull;
    if (g.missionaryOut > 0) g.missionaryOut--;

    // Entitlement: too many favours and they stop being grateful.
    g.entitlement = Math.max(0, g.entitlement - c.entitlementDecay);
    if (g.entitlement > c.entitlementLine) g.devotion -= 0.15 + (g.prayers >= 2 ? 0.1 : 0);
    if (g.prayers >= 3) g.mystery += 1;            // unanswered prayers: awe, up to a point

    g.devotion = clamp(g.devotion + (5 - g.devotion) * c.devotionPull, 0, 10);
    g.mystery = clamp(g.mystery, 0, 100);

    // Collection.
    const worship = g.souls * c.faithPerSoul * (g.devotion / 5) * (0.5 + g.mystery / 100) * (1 + 0.25 * hasWork(g, 'shrine'));
    const income = worship + g.faithIn + s.faith + s.doctrine * VERSE.doctrineFaith;
    g.income = income;
    g.faith = Math.max(0, g.faith * (1 - c.faithDecay) + income);
    g.power = Math.min(c.powerCap, g.power + c.powerBase + income * c.powerPerFaithIncome);

    // People drift off a god they do not much care for, and towards one they do.
    if (g.devotion < c.leakBelow) { const n = Math.min(Math.floor(g.souls), whole((c.leakBelow - g.devotion) * c.leakRate, rng)); g.souls -= n; w.unbothered += n; }
    if (g.devotion > c.drawAbove && w.unbothered >= 1 && rng.chance(c.drawRate)) { g.souls++; w.unbothered--; }

    // Heresy.
    g.heresy = Math.max(0, g.heresy - c.heresyDecay);
    if (g.heresy >= c.schismAt) { const n = Math.min(Math.floor(g.souls), c.schismLoss); g.souls -= n; w.unbothered += n; g.heresy = 4; g.n.schism++; }

    g.low = g.souls < c.fallBelow ? g.low + 1 : 0;
    g.starved = g.faith < 1 ? g.starved + 1 : 0;
    if (g.low >= c.fallSeasons) g.fell = true;
    if (g.starved >= c.forgottenSeasons) g.forgotten = true;
  }

  if (a.forgotten) w.over = 'forgotten';
  else if (a.fell) w.over = 'absorbed';
  else if (b.fell || b.forgotten) w.over = 'rival_fell';
  else if (w.season >= w.cfg.seasons) {
    const r = w.cfg.review;
    const doctrine = a.tablets.filter((t) => t.effects.k > 0).length;
    if (a.faith >= r.faith && a.souls >= r.souls && a.heresy < r.heresy && doctrine >= r.doctrine) w.over = 'ascended';
    else if (b.souls >= r.souls) w.over = 'absorbed';
    else w.over = 'passed_over';
  }
  return w;
}

export function play(seed, playerPolicy, rivalPolicy, cfg = CFG, setup = null) {
  const w = newWorld(seed, playerPolicy, rivalPolicy, cfg);
  if (setup) setup(w);
  let guard = 0;
  while (!w.over) {
    const before = w.season;
    season(w);
    if (w.season === before || ++guard > cfg.seasons + 1) throw new Error(`Seed ${seed}: the clock did not advance`);
  }
  const g = w.gods[0];
  return { seed, outcome: w.over, win: w.over === 'ascended' || w.over === 'rival_fell', seasons: w.season,
    faith: g.faith, souls: g.souls, heresy: g.heresy, mystery: g.mystery, devotion: g.devotion, rivalSouls: w.gods[1].souls, n: g.n,
    works: Object.keys(g.works).length, tablets: g.tablets.length };
}
