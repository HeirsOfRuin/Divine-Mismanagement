// The divine acts: what each costs and whether it is allowed (preview), and
// what it does (resolve). Pure, and the same for both gods: the rival works
// through exactly these functions (game-building rule 7).
//
// preview(s, gi, act) is what the screen shows and what the bot reads;
// resolve() refuses anything preview() refused, so a button the screen
// allows can never be one the engine rejects (rule 1).

import { CONFIG } from '../data/config.data.js';
import { MIRACLES, WITNESS } from '../data/offices.data.js';
import { TEMPLATES } from '../data/lexicon.data.js';
import { LEGENDS, WANTS } from '../data/content/people.data.js';
import { makeRevelation, transmit, carve } from './telephone.js';
import { render } from './render.js';
import { gain, moveSouls } from './meters.js';
import { hasWork, scriptureSum } from './scripture.js';
import { holder, traitOf, convert } from './offices.js';
import { draw, take, fill } from './content.js';

const C = CONFIG.costs;
const other = (gi) => 1 - gi;
const no = (why, cost = 0) => ({ ok: false, why, cost });
const yes = (cost, extra = {}) => ({ ok: true, why: null, cost, ...extra });

export const ACT_KINDS = ['reveal', 'miracle', 'answer', 'dream', 'festival', 'poach', 'dispute', 'silent'];

/** A god's standing in a disputation: Tablets that do good, less contradictions. */
export function disputeScore(g) {
  const sum = scriptureSum(g);
  return sum.doctrine - 2 * sum.contradictions.length;
}

export function preview(s, gi, act) {
  const g = s.gods[gi], o = s.gods[other(gi)];
  if (!act || !ACT_KINDS.includes(act.kind)) return no('Not something a god can do.');
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
      // Heard by the households it passed through, and one more for a Bell.
      return yes(cost, { households: Math.min(CONFIG.households, houses.size + (hasWork(g, 'bell') ? 1 : 0)) });
    }
    case 'miracle': {
      const m = MIRACLES[act.miracle];
      if (!m) return no('Choose a miracle.');
      if (act.miracle === 'smite' && o.missionaryOut > 0) return no(`${o.name}'s missionary is still recovering.`, C.smite);
      if (g.power < C[act.miracle]) return no(`Needs ${C[act.miracle]} Power; you have ${Math.floor(g.power)}.`, C[act.miracle]);
      return yes(C[act.miracle]);
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
      const old = o.prayers.find((p) => s.season - p.season >= CONFIG.neglectedAfter);
      if (!old) return no(`None of ${o.name}'s people has been ignored for ${CONFIG.neglectedAfter} seasons yet.`);
      if (o.souls < 1) return no('She has nobody left.');
      if (g.power < C.poach) return no(`Needs ${C.poach} Power.`, C.poach);
      return yes(C.poach);
    }
    case 'dispute': {
      if (!holder(g, 'prophet')) return no('You need a Prophet to argue for you.');
      if (!holder(o, 'prophet')) return no(`${o.name} has no Prophet to argue with.`);
      const wait = (g.lastDispute || -99) + CONFIG.disputeEvery - s.season;
      if (wait > 0) return no(`The village will not sit through another disputation for ${wait} season${wait > 1 ? 's' : ''}.`);
      if (g.power < C.dispute) return no(`Needs ${C.dispute} Power.`, C.dispute);
      const mine = disputeScore(g), hers = disputeScore(o);
      return yes(C.dispute, { mine, hers });
    }
  }
  return no('Not something a god can do.');
}

// ---- resolve ----------------------------------------------------------------
// Each writes what happened into `out` (the season record for this god).

export function resolve(s, gi, act, rng, out) {
  const p = preview(s, gi, act);
  if (!p.ok) throw new Error(`not allowed: ${p.why}`);
  const g = s.gods[gi], o = s.gods[other(gi)];
  if (p.cost) gain(s, gi, act.kind === 'festival' ? 'offerings' : 'power', -p.cost, act.kind);
  out.act = { kind: act.kind };
  if (act.kind !== 'silent') gain(s, gi, 'mystery', CONFIG.mysteryPerAct, 'being seen to act');
  g.n[act.kind] = (g.n[act.kind] || 0) + 1;

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
      const sent = transmit(rev, chain, rng, s.spent);
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
      return;
    }

    case 'miracle': {
      const wit = holder(g, 'witness');
      const trait = wit ? traitOf(wit) : 'none';
      const how = WITNESS[trait];
      g.seen[act.miracle] = (g.seen[act.miracle] || 0) + 1;
      const stale = (1 / (1 + (g.seen[act.miracle] - 1) * 0.5));   // each time this kind is seen, it is worth less
      const kind = how.swap ? rng.pick(Object.keys(MIRACLES)) : act.miracle;
      const m = MIRACLES[kind];
      gain(s, gi, 'faith', m.faith * how.faith * stale, `miracle`);
      gain(s, gi, 'mystery', how.mystery, 'miracle');
      if (m.off) gain(s, gi, 'offerings', m.off, 'miracle');
      if (m.dev) gain(s, gi, 'devotion', m.dev * stale, 'miracle');
      if (m.conv) convert(s, gi, m.conv * stale, rng, false, 'miracle');
      if (m.disable) o.missionaryOut = Math.max(o.missionaryOut, m.disable);
      if (how.alarm) convert(s, gi, how.alarm, rng, true, 'frightened over');
      if (how.heresy) gain(s, gi, 'heresy', how.heresy, 'miracle');
      gain(s, gi, 'entitlement', 1 + (how.entitlement || 0), 'miracle');
      if (wit) wit.known = true;
      if (how.legend) {
        const L = { id: `l${s.nextId++}`, kind, asked: act.miracle, by: wit ? wit.id : null, trait, season: s.season,
          left: how.legend.seasons, faith: how.legend.faith * (m.faith / 4) * stale, mystery: how.legend.mystery, text: null };
        // The account as told: once per playthrough per miracle and witness.
        const key = `${kind}:${trait}`;
        if (gi === 0 && LEGENDS[key] && take(s, 'legend', key)) {
          L.text = fill(LEGENDS[key], { name: wit ? wit.name : '', god: g.name, rival: o.name, asked: MIRACLES[act.miracle].label.toLowerCase() });
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
      if (f && gi === 0) {
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
      convert(s, gi, 1, rng, false, 'festival');
      return;

    case 'poach': {
      const old = o.prayers.find((p) => s.season - p.season >= CONFIG.neglectedAfter);
      o.prayers = o.prayers.filter((p) => p !== old);
      moveSouls(s, other(gi), gi, 1, 'answered a prayer not addressed to them');
      return;
    }

    case 'dispute': {
      // The crowd goes to whoever's Scripture holds together. One soul either way.
      const d = p.mine - p.hers;
      g.lastDispute = s.season;
      out.act.mine = p.mine; out.act.hers = p.hers;
      if (d > 0) out.act.won = moveSouls(s, other(gi), gi, 1, 'disputation');
      else if (d < 0) out.act.lost = moveSouls(s, gi, other(gi), 1, 'disputation');
      return;
    }
  }
}
