// The staffing board, Works, and conversion. Pure; the same for both gods.
//
// A devotee holds one office or sits in the pews. Someone newly posted spends
// the next season settling in and does nothing (Gate B: moving people is a
// cost, so the board is planned, not shuffled). An office is worked by the
// holder's first trait.

import { CONFIG } from '../data/config.data.js';
import { OFFICE, OFFICE_IDS, WORKS } from '../data/offices.data.js';
import { INCIDENTS } from '../data/content/people.data.js';
import { applyTrait } from './telephone.js';
import { render } from './render.js';
import { gain, moveSouls } from './meters.js';
import { hasWork } from './scripture.js';
import { thresholds, stronghold, leaderAgainst } from './world.js';
import { isOpen, opensIn } from './guide.js';
import { take, fill } from './content.js';

export const holder = (g, office) => g.flock.find((f) => f.office === office && f.settling === 0) || null;
export const posted = (g, office) => g.flock.find((f) => f.office === office) || null;
export const traitOf = (f) => (f ? f.traits[0] : null);
// 1.3 expected becomes one, and a 30% chance of a second.
const whole = (x, rng) => (x <= 0 ? 0 : Math.floor(x) + (rng.chance(x - Math.floor(x)) ? 1 : 0));

/** Post a devotee (or nobody, id null) to an office. Returns the new state. */
export function postIn(s, gi, office, id) {
  if (!OFFICE_IDS.includes(office)) throw new Error(`no office "${office}"`);
  if (id != null && !isOpen(s, `office:${office}`)) throw new Error(`The ${office} opens in season ${opensIn(`office:${office}`)}.`);
  const g = s.gods[gi];
  const cur = posted(g, office);
  if ((cur ? cur.id : null) === (id ?? null)) return s;
  const next = id == null ? null : g.flock.find((f) => f.id === id);
  if (id != null && !next) throw new Error(`no devotee "${id}"`);
  if (cur) { cur.office = null; cur.settling = 0; }
  if (next) { next.office = office; next.settling = 1; }
  return s;
}

/** Choose what the Builder works on next (or nothing). */
export function commissionIn(s, gi, workId) {
  const g = s.gods[gi];
  if (workId != null && !WORKS[workId]) throw new Error(`no Work "${workId}"`);
  if (workId != null && g.works[workId]) throw new Error(`${WORKS[workId].label} is already built`);
  if (g.building && g.building.paid) return s;                  // paid for: it is going up whatever you say
  g.building = workId == null ? null : { id: workId, progress: 0, paid: false };
  return s;
}

/** How hard a god's souls are to take: their missionary, a Guest House, a
 *  devoted flock, a small flock closing ranks, holy objects. The same for every god. */
export function guardOf(s, gi) {
  const o = s.gods[gi];
  const art = Math.min(0.75, o.artifacts.reduce((a, x) => a + (x.effect.guard || 0), 0));
  const fewer = o.souls < thresholds(s).fair * CONFIG.closeRanks;
  return (o.guard || 1) * (hasWork(o, 'guest_house') ? 0.5 : 1) * (o.devotion > 6 ? 0.5 : 1) * (fewer ? 0.5 : 1) * (1 - art);
}

/**
 * Souls come from the Unbothered in the god's mission field while there are
 * any, then from whichever other god holds most there, at the poaching rate.
 * `from` names a victim directly (a Witness frightening her people over), at
 * the full rate, in the victim's stronghold if they have nobody in the field.
 */
export function convert(s, gi, expected, rng, { from = null, reason }) {
  const g = s.gods[gi];
  const ri = g.field;
  const r = s.villages[ri];
  const bonus = 1 + g.artifacts.reduce((a, x) => a + (x.effect.conv || 0), 0) + g.saints.reduce((a, x) => a + (x.virtue.conv || 0), 0);
  if (from === null && r.unbothered >= 1) return moveSouls(s, 'u', gi, whole(expected * bonus, rng), reason, ri);
  const victims = s.gods.map((x, i) => i).filter((i) => i !== gi && !s.gods[i].fallen && r.held[i] > 0);
  const v = from !== null ? from : victims.sort((a, b) => r.held[b] - r.held[a] || a - b)[0];
  if (v === undefined || v === null || s.gods[v].fallen) return 0;
  const where = r.held[v] > 0 ? ri : stronghold(s, v);
  const n = whole(expected * bonus * (from !== null ? 1 : CONFIG.poachFactor * guardOf(s, v)), rng);
  return moveSouls(s, v, gi, n, reason, where);
}

// What one office will yield this season: the screen's preview and the
// engine's resolution both come from here (rule 1). Random parts are given as
// ranges.
export function officeYield(g, office) {
  const f = holder(g, office);
  if (!f || office === 'prophet' || office === 'witness') return null;
  return { by: f.id, trait: traitOf(f), ...OFFICE[office][traitOf(f)] };
}

export function workOffices(s, gi, sc, rng, out) {
  const g = s.gods[gi];
  const o = s.gods[leaderAgainst(s, gi) ?? gi];
  out.offices = [];
  for (const f of g.flock) if (f.office && f.settling === 0) f.known = true;   // a season in office shows what they are
  const note = (office, f, extra = {}) => {
    const row = { office, by: f.id, trait: traitOf(f), ...extra };
    // The first season anyone of this trait holds this office, the village notices how.
    const key = `${office}:${traitOf(f)}`;
    if (gi === 0 && INCIDENTS[key] && take(s, 'incident', key)) row.text = fill(INCIDENTS[key], { name: f.name, god: g.name, rival: o.name });
    out.offices.push(row);
  };
  const add = (e, reason) => {
    if (e.faith) gain(s, gi, 'faith', e.faith, reason);
    if (e.mystery) gain(s, gi, 'mystery', e.mystery, reason);
    if (e.heresy) gain(s, gi, 'heresy', e.heresy, reason);
    if (e.dev) gain(s, gi, 'devotion', e.dev, reason);
    if (e.off) gain(s, gi, 'offerings', e.off, reason);
  };

  const pr = holder(g, 'preacher');
  if (pr) {
    const e = OFFICE.preacher[traitOf(pr)];
    add(e, 'preaching');
    const extra = {};
    if (e.garble && g.tablets.length && rng.chance(e.garble)) {
      // A drunk preacher misquotes a Tablet, and the misquotation is what is remembered.
      const t = rng.pick(g.tablets);
      const r = applyTrait(t.verse, 'drunk', rng, pr, s.spent);
      if (r.note) { s.spent = r.spent; t.verse = r.verse; t.history.push({ season: s.season, by: pr.id, note: r.note }); extra.misquoted = t.id; extra.now = render(t.verse); }
    }
    if (e.leave && rng.chance(e.leave)) extra.left = moveSouls(s, gi, 'u', 1, 'put off by the preaching', stronghold(s, gi));
    note('preacher', pr, extra);
  }

  const mi = holder(g, 'missionary');
  g.guard = 1; g.blunt = 1;
  if (mi && g.travelling > 0) out.offices.push({ office: 'missionary', by: mi.id, trait: traitOf(mi), road: g.field });
  else if (mi && g.missionaryOut === 0) {
    const e = OFFICE.missionary[traitOf(mi)];
    add(e, 'mission');
    g.charm = Math.max(-3, Math.min(5, g.charm + (e.charm || 0)));
    if (e.blunt) g.blunt = e.blunt;
    if (e.guard) g.guard = e.guard;
    // Blunted by a lazy missionary of anyone else working the same field.
    const blunt = Math.min(1, ...s.gods.filter((x, i) => i !== gi && !x.fallen && x.field === g.field).map((x) => x.bluntPrev || 1));
    const rate = e.conv * (1 + 0.1 * g.charm) * (1 + sc.convBonus) * blunt;
    const extra = { won: convert(s, gi, rate, rng, { reason: 'mission' }), field: g.field };
    if (e.defect && rng.chance(e.defect) && o !== g) { mi.office = null; extra.defected = true; extra.lost = moveSouls(s, gi, s.gods.indexOf(o), 1, 'the missionary went over', stronghold(s, gi)); }
    note('missionary', mi, extra);
  } else if (mi) out.offices.push({ office: 'missionary', by: mi.id, trait: traitOf(mi), out: g.missionaryOut });

  const co = holder(g, 'collector');
  if (co) {
    const e = OFFICE.collector[traitOf(co)];
    add(e, 'collection');
    if (e.offRange) gain(s, gi, 'offerings', rng.range(e.offRange[0], e.offRange[1]), 'collection');
    note('collector', co);
  }
  if (hasWork(g, 'box')) gain(s, gi, 'offerings', hasWork(g, 'box'), 'offering box');

  const bu = holder(g, 'builder');
  if (bu && g.building) {
    const e = OFFICE.builder[traitOf(bu)];
    const b = g.building, spec = WORKS[b.id];
    const cost = Math.round(spec.cost * (e.costMult || 1));
    const extra = { work: b.id };
    if (!b.paid && g.offerings >= cost) { gain(s, gi, 'offerings', -cost, `building: ${spec.label}`); b.paid = true; }
    if (b.paid) {
      b.progress += e.progress;
      if (e.heresy) gain(s, gi, 'heresy', e.heresy, 'building');
      if (b.progress >= spec.need) {
        g.works[b.id] = { crooked: Boolean(e.crooked), useless: Boolean(e.useless), by: bu.id, season: s.season };
        if (e.crooked) gain(s, gi, 'mystery', 5, 'a crooked building');
        if (e.useless) gain(s, gi, 'mystery', 10, 'a lovely useless building');
        if (e.devOnDone) gain(s, gi, 'devotion', e.devOnDone, 'pressed into building');
        extra.done = b.id;
        g.building = null;
      }
    } else extra.waiting = cost;
    note('builder', bu, extra);
  }

  // The Witness and the Prophet are named in the record when someone first fills them.
  for (const office of ['prophet', 'witness']) {
    const f = holder(g, office);
    if (f) note(office, f);
  }
}
