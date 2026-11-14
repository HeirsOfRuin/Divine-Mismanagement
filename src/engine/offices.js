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
import { take, fill } from './content.js';

export const holder = (g, office) => g.flock.find((f) => f.office === office && f.settling === 0) || null;
export const posted = (g, office) => g.flock.find((f) => f.office === office) || null;
export const traitOf = (f) => (f ? f.traits[0] : null);
// 1.3 expected becomes one, and a 30% chance of a second.
const whole = (x, rng) => (x <= 0 ? 0 : Math.floor(x) + (rng.chance(x - Math.floor(x)) ? 1 : 0));

/** Post a devotee (or nobody, id null) to an office. Returns the new state. */
export function postIn(s, gi, office, id) {
  if (!OFFICE_IDS.includes(office)) throw new Error(`no office "${office}"`);
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

/** Souls come from the Unbothered while there are any, then from the other god. */
export function convert(s, gi, expected, rng, fromRivalOnly, reason) {
  const o = s.gods[1 - gi];
  if (!fromRivalOnly && s.unbothered >= 1) return moveSouls(s, 'u', gi, whole(expected, rng), reason);
  const guard = (o.guard || 1) * (hasWork(o, 'guest_house') ? 0.5 : 1) * (o.devotion > 6 ? 0.5 : 1);
  const n = whole(expected * (fromRivalOnly ? 1 : CONFIG.poachFactor * guard), rng);
  return moveSouls(s, 1 - gi, gi, n, reason);
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
  const g = s.gods[gi], o = s.gods[1 - gi];
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
    if (e.leave && rng.chance(e.leave)) extra.left = moveSouls(s, gi, 'u', 1, 'put off by the preaching');
    note('preacher', pr, extra);
  }

  const mi = holder(g, 'missionary');
  g.guard = 1; g.blunt = 1;
  if (mi && g.missionaryOut === 0) {
    const e = OFFICE.missionary[traitOf(mi)];
    add(e, 'mission');
    g.charm = Math.max(-3, Math.min(5, g.charm + (e.charm || 0)));
    if (e.blunt) g.blunt = e.blunt;
    if (e.guard) g.guard = e.guard;
    const rate = e.conv * (1 + 0.1 * g.charm) * (1 + sc.convBonus) * (o.bluntPrev || 1);
    const extra = { won: convert(s, gi, rate, rng, false, 'mission') };
    if (e.defect && rng.chance(e.defect)) { mi.office = null; extra.defected = true; extra.lost = moveSouls(s, gi, 1 - gi, 1, 'the missionary went over'); }
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
