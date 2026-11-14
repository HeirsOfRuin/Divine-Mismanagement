// The divine acts: what each costs and whether it is allowed (preview), and
// what it does (resolve). Pure, and the same for every god: the rivals work
// through exactly these functions (game-building rule 7).
//
// preview(s, gi, act) is what the screen shows and what the bots read;
// resolve() refuses anything preview() refused, so a button the screen allows
// can never be one the engine rejects (rule 1).
//
// Acts aimed at another god (smite, poach, dispute) take `target`, a god's
// index; without one they go at the strongest god still standing.

import { CONFIG } from '../data/config.data.js';
import { MIRACLES, WITNESS } from '../data/offices.data.js';
import { TEMPLATES } from '../data/lexicon.data.js';
import { GRAND, RANKS, MISHEARD_SAINT, SAINT_VIRTUE, WONDER } from '../data/match.data.js';
import { LEGENDS, WANTS } from '../data/content/people.data.js';
import { ARTIFACTS, PATRONAGES, CANONIZED, WONDERS } from '../data/content/grand.data.js';
import { makeRevelation, transmit, carve } from './telephone.js';
import { render } from './render.js';
import { gain, moveSouls } from './meters.js';
import { hasWork, scriptureSum } from './scripture.js';
import { holder, traitOf, convert } from './offices.js';
import { draw, take, fill } from './content.js';
import { leaderAgainst, stronghold } from './world.js';
import { isOpen, opensIn } from './guide.js';

const C = CONFIG.costs;
const no = (why, cost = 0) => ({ ok: false, why, cost });
const yes = (cost, extra = {}) => ({ ok: true, why: null, cost, ...extra });
const HOSTILE = ['smite', 'poach', 'dispute'];

export const ACT_KINDS = ['reveal', 'miracle', 'answer', 'dream', 'festival', 'poach', 'dispute', 'silent', 'anoint', 'artifact', 'wonder', 'canonize'];

/** A god's standing in a disputation: Tablets that do good, less contradictions. */
export function disputeScore(g) {
  const sum = scriptureSum(g);
  return sum.doctrine - 2 * sum.contradictions.length;
}

/** Who an act aimed at another god is aimed at. */
export function targetOf(s, gi, act) {
  const t = act && act.target;
  if (Number.isInteger(t) && t !== gi && s.gods[t] && !s.gods[t].fallen) return t;
  return leaderAgainst(s, gi);
}

/** Whether a rare act is open to this god yet, and if not, why. */
export function grandOpen(s, gi, kind) {
  const g = s.gods[gi], spec = GRAND[kind];
  const need = RANKS.findIndex((r) => (r.unlocks || []).includes(kind));
  if (g.rank < need) return `Opens at the rank of ${RANKS[need].title}.`;
  if (spec.once && g.n[kind]) return 'Done once already. It is not done twice.';
  if (spec.max && g.saints.length >= spec.max) return `You have ${spec.max} Saints. The calendar is full.`;
  const wait = (g.cooldowns[kind] || 0) - s.season;
  if (wait > 0) return `Not again for ${wait} season${wait > 1 ? 's' : ''}.`;
  for (const [m, n] of Object.entries(spec.cost)) if (g[m] < n) return `Needs ${n} ${m === 'faith' ? 'Faith' : m === 'power' ? 'Power' : 'Offerings'}; you have ${Math.floor(g[m])}.`;
  return null;
}

export function preview(s, gi, act) {
  const g = s.gods[gi];
  if (!act || !ACT_KINDS.includes(act.kind)) return no('Not something a god can do.');
  if (g.fallen) return no('You have fallen.');
  // A guided match opens acts one at a time, for every god alike.
  const key = act.kind === 'miracle' && act.miracle === 'smite' ? 'act:smite' : `act:${act.kind}`;
  if (!GRAND[act.kind] && !isOpen(s, key)) return no(`Opens in season ${opensIn(key)}.`);
  const target = HOSTILE.includes(act.kind === 'miracle' && act.miracle === 'smite' ? 'smite' : act.kind) ? targetOf(s, gi, act) : null;
  const o = target !== null ? s.gods[target] : null;
  switch (act.kind) {
    case 'silent': return yes(0);
    case 'reveal': {
      const t = TEMPLATES.find((x) => x.id === act.template);
      if (!t) return no('Choose what the Revelation is about.');
      if (act.object && !t.objects.includes(act.object)) return no('That does not belong in this Revelation.');
      if (act.tail && !t.tails.includes(act.tail)) return no('That does not belong in this Revelation.');
      const chain = (act.chain || []).map((id) => g.flock.find((f) => f.id === id));
      if (!chain.length || chain.some((f) => !f)) return no('Choose who carries it.');
      const prophet = holder(g, 'prophet');
      if (prophet && chain[0] !== prophet) return no(`${prophet.name} is your Prophet and must hear it first.`);
      const houses = new Set(chain.map((f) => f.household));
      if (houses.size !== chain.length) return no('One carrier from each household.');
      const cost = (chain.length - 1) * C.link;
      if (g.power < cost) return no(`Needs ${cost} Power; you have ${Math.floor(g.power)}.`, cost);
      // Heard by the households it passed through, one more for a Bell, one more for a High Prophet.
      const high = prophet && prophet.high ? 1 : 0;
      return yes(cost, { households: Math.min(CONFIG.households, houses.size + (hasWork(g, 'bell') ? 1 : 0) + high) });
    }
    case 'miracle': {
      const m = MIRACLES[act.miracle];
      if (!m) return no('Choose a miracle.');
      if (act.miracle === 'smite') {
        if (target === null) return no('There is nobody left to smite.');
        if (o.missionaryOut > 0) return no(`${o.name}'s missionary is still recovering.`, C.smite);
      }
      if (g.power < C[act.miracle]) return no(`Needs ${C[act.miracle]} Power; you have ${Math.floor(g.power)}.`, C[act.miracle]);
      return yes(C[act.miracle], { target });
    }
    case 'answer': {
      if (!g.prayers.some((p) => p.id === act.prayer)) return no('Nobody is praying for that.');
      if (g.power < C.answer) return no(`Needs ${C.answer} Power.`, C.answer);
      return yes(C.answer);
    }
    case 'dream': {
      const f = g.flock.find((x) => x.id === act.id);
      if (!f) return no('Choose who to visit.');
      if (f.known) return no(`You already know what ${f.name} is like.`);
      if (g.power < C.dream) return no(`Needs ${C.dream} Power.`, C.dream);
      return yes(C.dream);
    }
    case 'festival': {
      if (!hasWork(g, 'feast_hall')) return no('There is nowhere to hold one. Build a Feast Hall.');
      if (g.offerings < C.festival) return no(`Needs ${C.festival} Offerings; you have ${Math.floor(g.offerings)}.`, C.festival);
      return yes(C.festival);
    }
    case 'poach': {
      if (target === null) return no('There is nobody left to take people from.');
      const old = o.prayers.find((p) => s.season - p.season >= CONFIG.neglectedAfter);
      if (!old) return no(`None of ${o.name}'s people has been ignored for ${CONFIG.neglectedAfter} seasons yet.`);
      if (o.souls < 1) return no('She has nobody left.');
      if (g.power < C.poach) return no(`Needs ${C.poach} Power.`, C.poach);
      return yes(C.poach, { target });
    }
    case 'dispute': {
      if (target === null) return no('There is nobody left to argue with.');
      if (!holder(g, 'prophet')) return no('You need a Prophet to argue for you.');
      if (!holder(o, 'prophet')) return no(`${o.name} has no Prophet to argue with.`);
      const wait = (g.lastDispute || -99) + CONFIG.disputeEvery - s.season;
      if (wait > 0) return no(`The village will not sit through another disputation for ${wait} season${wait > 1 ? 's' : ''}.`);
      if (g.power < C.dispute) return no(`Needs ${C.dispute} Power.`, C.dispute);
      return yes(C.dispute, { target, mine: disputeScore(g), hers: disputeScore(o) });
    }
    case 'anoint': {
      const why = grandOpen(s, gi, 'anoint');
      if (why) return no(why);
      const f = g.flock.find((x) => x.id === act.id);
      if (!f) return no('Choose who to anoint.');
      return yes(0, { grand: GRAND.anoint.cost });
    }
    case 'artifact': case 'wonder': {
      const why = grandOpen(s, gi, act.kind);
      return why ? no(why) : yes(0, { grand: GRAND[act.kind].cost });
    }
    case 'canonize': {
      const why = grandOpen(s, gi, 'canonize');
      if (why) return no(why);
      const f = g.flock.find((x) => x.id === act.id);
      if (!f) return no('Choose who to make a Saint.');
      if (f.saint) return no(`${f.name} is a Saint already.`);
      return yes(0, { grand: GRAND.canonize.cost });
    }
  }
  return no('Not something a god can do.');
}

// ---- resolve ----------------------------------------------------------------
// Each writes what happened into `out` (the season record for this god).

const tokens = (s, gi, extra = {}) => {
  const lead = leaderAgainst(s, gi);
  return { god: s.gods[gi].name, rival: lead !== null ? s.gods[lead].name : 'nobody', ...extra };
};

export function resolve(s, gi, act, rng, out) {
  const p = preview(s, gi, act);
  if (!p.ok) throw new Error(`not allowed: ${p.why}`);
  const g = s.gods[gi];
  const target = p.target ?? null;
  const o = target !== null ? s.gods[target] : null;
  if (p.cost) gain(s, gi, act.kind === 'festival' ? 'offerings' : 'power', -p.cost, act.kind);
  if (p.grand) for (const [m, n] of Object.entries(p.grand)) gain(s, gi, m, -n, GRAND[act.kind].label);
  out.act = { kind: act.kind, target };
  if (act.kind !== 'silent') gain(s, gi, 'mystery', CONFIG.mysteryPerAct, 'being seen to act');
  g.n[act.kind] = (g.n[act.kind] || 0) + 1;
  if (GRAND[act.kind] && GRAND[act.kind].every) g.cooldowns[act.kind] = s.season + GRAND[act.kind].every;
  const mine = gi === 0;   // authored lines are drawn for the player only

  switch (act.kind) {
    case 'silent':
      gain(s, gi, 'mystery', CONFIG.mysterySilence, 'silence');
      gain(s, gi, 'devotion', CONFIG.silenceDevotion, 'silence');
      gain(s, gi, 'entitlement', CONFIG.silenceEntitlement, 'silence');
      return;

    case 'reveal': {
      const t = TEMPLATES.find((x) => x.id === act.template);
      const rev = makeRevelation(t.id, act.object ?? (t.objects.length ? t.objects[0] : null), act.tail ?? t.tails[0]);
      const chain = act.chain.map((id) => g.flock.find((f) => f.id === id));
      // A High Prophet is confident: their trait works on the message twice.
      const carriers = chain.map((f) => (f.high ? { ...f, traits: [f.traits[0], ...f.traits] } : f));
      const sent = transmit(rev, carriers, rng, s.spent);
      const carved = carve(sent.final, rev, sent.spent);
      s.spent = carved.spent;
      for (const f of chain) f.known = true;
      const tablet = {
        id: `t${s.nextId++}`, season: s.season, verse: sent.final, households: p.households,
        title: carved.title, after: carved.after, said: render(rev), chain: act.chain,
        steps: sent.steps.map((x) => ({ by: x.by, trait: x.trait, note: x.note, text: x.text })), history: [],
      };
      g.tablets.push(tablet);
      if (g.tablets.length > CONFIG.tablets) g.apocrypha.push(g.tablets.shift());
      out.act.tablet = tablet.id;
      const changed = sent.steps.filter((x) => x.changed).length;
      g.exasperation += changed;
      out.act.changed = changed;
      out.act.ruined = Boolean(sent.final.verb.cur !== sent.final.verb.base || sent.final.modal.negDropped || sent.final.gist || sent.final.bare);
      return;
    }

    case 'miracle': {
      const wit = holder(g, 'witness');
      const trait = wit ? traitOf(wit) : 'none';
      const how = WITNESS[trait];
      g.seen[act.miracle] = (g.seen[act.miracle] || 0) + 1;
      // Each time the village sees this kind it is worth less; a Poet's telling never goes stale.
      const stale = how.fresh ? 1 : 1 / (1 + (g.seen[act.miracle] - 1) * 0.5);
      const kind = how.swap ? rng.pick(Object.keys(MIRACLES)) : act.miracle;
      const m = MIRACLES[kind];
      gain(s, gi, 'faith', m.faith * how.faith * stale, 'miracle');
      gain(s, gi, 'mystery', how.mystery, 'miracle');
      if (m.off) gain(s, gi, 'offerings', m.off, 'miracle');
      if (m.dev) gain(s, gi, 'devotion', m.dev * stale, 'miracle');
      if (m.conv) convert(s, gi, m.conv * stale, rng, { reason: 'miracle' });
      const victim = kind === 'smite' ? (target ?? leaderAgainst(s, gi)) : null;
      if (m.disable && victim !== null) s.gods[victim].missionaryOut = Math.max(s.gods[victim].missionaryOut, m.disable);
      if (how.alarm) { const v = leaderAgainst(s, gi); if (v !== null) convert(s, gi, how.alarm, rng, { from: v, reason: 'frightened over' }); }
      if (how.heresy) gain(s, gi, 'heresy', how.heresy, 'miracle');
      gain(s, gi, 'entitlement', 1 + (how.entitlement || 0), 'miracle');
      if (wit) { wit.known = true; g.n.witnessed = (g.n.witnessed || 0) + 1; }
      if (how.legend) {
        const L = { id: `l${s.nextId++}`, kind, asked: act.miracle, by: wit ? wit.id : null, trait, season: s.season,
          left: how.legend.seasons, faith: how.legend.faith * (m.faith / 4) * stale, mystery: how.legend.mystery, text: null };
        const key = `${kind}:${trait}`;
        if (mine && LEGENDS[key] && take(s, 'legend', key)) {
          L.text = fill(LEGENDS[key], tokens(s, gi, { name: wit ? wit.name : '', asked: MIRACLES[act.miracle].label.toLowerCase() }));
        }
        g.legends.push(L);
        out.act.legend = L.id;
      }
      out.act.miracle = act.miracle; out.act.reported = kind; out.act.stale = stale < 1;
      return;
    }

    case 'answer': {
      const pr = g.prayers.find((x) => x.id === act.prayer);
      g.prayers = g.prayers.filter((x) => x !== pr);
      gain(s, gi, 'faith', 2, 'answered prayer');
      gain(s, gi, 'devotion', 0.15, 'answered prayer');
      gain(s, gi, 'entitlement', 0.3, 'answered prayer');
      const f = g.flock.find((x) => x.id === pr.by);
      out.act.prayer = pr.id; out.act.by = pr.by;
      if (f && mine) {
        const w = WANTS.find((x) => x.id === f.want);
        out.act.text = w ? fill(w.answered, { name: f.name, god: g.name }) : null;
        f.want = null;   // a new want is drawn at dawn
      }
      return;
    }

    case 'dream': {
      const f = g.flock.find((x) => x.id === act.id);
      f.known = true;
      out.act.id = f.id;
      return;
    }

    case 'festival':
      gain(s, gi, 'devotion', 0.5 * hasWork(g, 'feast_hall'), 'festival');
      convert(s, gi, 1, rng, { reason: 'festival' });
      return;

    case 'poach': {
      const old = o.prayers.find((pp) => s.season - pp.season >= CONFIG.neglectedAfter);
      o.prayers = o.prayers.filter((pp) => pp !== old);
      moveSouls(s, target, gi, 1, 'answered a prayer not addressed to them', stronghold(s, target));
      return;
    }

    case 'dispute': {
      // The crowd goes to whoever's Scripture holds together. One soul either way.
      const d = p.mine - p.hers;
      g.lastDispute = s.season;
      out.act.mine = p.mine; out.act.hers = p.hers;
      if (d > 0) { out.act.won = moveSouls(s, target, gi, 1, 'disputation', stronghold(s, target)); g.n.disputeWon = (g.n.disputeWon || 0) + 1; }
      else if (d < 0) out.act.lost = moveSouls(s, gi, target, 1, 'disputation', stronghold(s, gi));
      return;
    }

    case 'anoint': {
      const f = g.flock.find((x) => x.id === act.id);
      for (const x of g.flock) if (x.office === 'prophet' && x !== f) x.office = null;
      f.office = 'prophet'; f.settling = 0; f.high = true; f.known = true;
      out.act.id = f.id;
      return;
    }

    case 'artifact': {
      // Blessed in the season's light; the faithful decide what it was.
      const id = draw(s, mine ? 'artifact' : `artifact-${gi}`, ARTIFACTS.map((a) => a.id), rng);
      if (!id) { gain(s, gi, 'faith', 5, 'a blessing'); out.act.none = true; return; }
      const a = ARTIFACTS.find((x) => x.id === id);
      const f = rng.pick(g.flock);
      const v = tokens(s, gi, { name: f.name });
      g.artifacts.push({ id, name: fill(a.name, v), how: fill(a.how, v), effect: a.effect, does: a.does, season: s.season });
      out.act.artifact = id;
      return;
    }

    case 'wonder': {
      const W = WONDER;
      gain(s, gi, 'faith', W.faith, 'a Wonder');
      gain(s, gi, 'mystery', W.mystery, 'a Wonder');
      gain(s, gi, 'devotion', W.devotion, 'a Wonder');
      gain(s, gi, 'entitlement', W.entitlement, 'a Wonder');
      out.act.won = convert(s, gi, W.conv, rng, { reason: 'a Wonder' });
      let text = null;
      if (mine) { const k = draw(s, 'wonder', WONDERS.map((_, i) => String(i)), rng); if (k !== null) text = fill(WONDERS[Number(k)], tokens(s, gi)); }
      const L = { id: `l${s.nextId++}`, kind: 'wonder', asked: 'wonder', by: null, trait: 'none', season: s.season, left: W.legendSeasons, faith: W.legendFaith, mystery: 1, text };
      g.legends.push(L);
      out.act.legend = L.id;
      return;
    }

    case 'canonize': {
      // The name goes through the Prophet. It may not be the name you said.
      const chosen = g.flock.find((x) => x.id === act.id);
      const prophet = holder(g, 'prophet');
      const slip = MISHEARD_SAINT[prophet ? traitOf(prophet) : 'none'];
      const others = g.flock.filter((x) => x !== chosen && !x.saint);
      const f = others.length && rng.chance(slip) ? rng.pick(others) : chosen;
      const virtue = SAINT_VIRTUE[traitOf(f)];
      const thing = mine ? (draw(s, 'patronage', PATRONAGES, rng) || 'nothing in particular') : 'nothing in particular';
      f.saint = { season: s.season, patron: thing, intended: chosen.id };
      g.saints.push({ id: f.id, virtue, season: s.season });
      out.act.id = f.id; out.act.meant = chosen.id; out.act.wrong = f !== chosen;
      if (f !== chosen) g.exasperation += 3;
      if (mine) out.act.text = fill(f === chosen ? CANONIZED.right : CANONIZED.wrong, { name: chosen.name, saint: f.name, thing });
      return;
    }
  }
}
