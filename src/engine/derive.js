// Every number the player is shown that is not simply a meter, computed here
// and nowhere else. The season (turn.js) resolves with the same functions, so
// the number shown and the number resolved cannot drift (rule 1).

import { CONFIG } from '../data/config.data.js';
import { hasWork, verseEffects, scriptureSum } from './scripture.js';
import { OFFICE, WITNESS } from '../data/offices.data.js';
import { TRAITS } from '../data/traits.data.js';
import { WANTS } from '../data/content/people.data.js';
import { fill } from './content.js';
import { thresholds, population } from './world.js';

export const yearOf = (season) => Math.ceil(season / CONFIG.seasonsPerYear);
export const isYearEnd = (season, seasons = CONFIG.seasons) => season % CONFIG.seasonsPerYear === 0 && season < seasons;

/** The Faith the Registry expects to see at the end of the current year, in this world. */
export function registryMinimum(s) {
  const reg = thresholds(s).registry;
  return reg[Math.min(yearOf(s.season), reg.length) - 1];
}
export const nextCheck = (s) => Math.min(s.match.seasons, Math.ceil(s.season / CONFIG.seasonsPerYear) * CONFIG.seasonsPerYear);

/** Faith from worship: souls, how devoted they are, how much awe, and a Shrine. */
export function worship(g) {
  return g.souls * CONFIG.faithPerSoul * (g.devotion / 5) * (0.5 + g.mystery / 100) * (1 + 0.25 * hasWork(g, 'shrine'));
}

/** Where a god stands against each test of the Review, in this world. */
export function reviewStanding(s, gi = 0) {
  const g = s.gods[gi], r = thresholds(s).review;
  const doctrine = scriptureSum(g).doctrine;
  const top = s.gods.reduce((m, x, i) => (i === gi || x.fallen ? m : Math.max(m, x.souls)), 0);
  return [
    { id: 'faith', label: 'Faith', need: `${r.faith} or more`, have: g.faith, ok: g.faith >= r.faith },
    { id: 'souls', label: 'Souls', need: `${r.souls} of ${population(s)}`, have: g.souls, ok: g.souls >= r.souls },
    { id: 'leads', label: 'More souls than any rival', need: `more than ${top}`, have: g.souls, ok: g.souls > top },
    { id: 'heresy', label: 'Heresy', need: `under ${r.heresy}`, have: g.heresy, ok: g.heresy < r.heresy },
    { id: 'doctrine', label: 'Tablets doing good', need: `${r.doctrine} or more`, have: doctrine, ok: doctrine >= r.doctrine },
  ];
}

// ---- words for numbers (the screen formats; it does not calculate) -----------


const SEASONS = ['Spring', 'Summer', 'Autumn', 'Winter'];
export const seasonName = (season) => `${SEASONS[(season - 1) % 4]}, year ${yearOf(season)}`;

const signed = (v, digits = 1) => `${v > 0 ? '+' : v < 0 ? '−' : ''}${Math.abs(v).toFixed(digits).replace(/\.0+$/, '')}`;
const LABEL = { faith: 'Faith', power: 'Power', mystery: 'Mystery', offerings: 'Offerings', devotion: 'devotion', heresy: 'Heresy', souls: 'souls', rivalSouls: 'her souls', off: 'Offerings', dev: 'devotion', convBonus: 'converts' };

/** "Offerings −2 · devotion +0.1" for a set of effects. */
export function effectsText(e) {
  return Object.entries(e).filter(([k, v]) => LABEL[k] && typeof v === 'number' && Math.abs(v) >= 0.01)
    .map(([k, v]) => `${LABEL[k]} ${signed(v, k === 'devotion' || k === 'dev' ? 2 : 1)}`).join(' · ');
}

/** What one Tablet does each season, as the Scripture page shows it. */
export function tabletCounts(g, t) {
  const e = verseEffects(t.verse, t.households, g);
  const parts = [];
  if (e.k < 0) parts.push('works against what you sent it for');
  else if (e.k === 0 && e.odd) parts.push('does nothing useful');
  for (const [k, label, d] of [['faith', 'Faith', 1], ['dev', 'devotion', 2], ['off', 'Offerings', 1], ['convBonus', 'converts', 2], ['mystery', 'Mystery', 1]]) {
    if (Math.abs(e[k]) >= 0.01) parts.push(`${label} ${signed(e[k] * (k === 'convBonus' ? 100 : 1), d)}${k === 'convBonus' ? '%' : ''}`);
  }
  if (Math.abs(e.heresy) >= 0.01) parts.push(`Heresy ${signed(e.heresy)}`);
  if (e.upkeep) parts.push(`upkeep ${e.upkeep.toFixed(1)} Offerings`);
  return { text: parts.join(' · ') || 'nothing yet', good: e.k > 0, households: t.households };
}

/** What an office will do this season, by who holds it, in words. */
export function officeText(office, trait) {
  if (office === 'prophet') return `Your words, as they pass on: ${TRAITS[trait].tends.charAt(0).toLowerCase()}${TRAITS[trait].tends.slice(1)}`;
  if (office === 'witness') {
    const w = WITNESS[trait];
    const parts = [`a miracle counts ${Math.round(w.faith * 100)}% of its Faith`, w.legend ? `retold for ${w.legend.seasons} seasons` : 'soon forgotten'];
    if (w.mystery > 0) parts.push('Mystery up'); else if (w.mystery < 0) parts.push('Mystery down');
    if (w.swap) parts.push('may report the wrong miracle');
    if (w.credit) parts.push('takes some of the credit');
    if (w.alarm) parts.push("frightens some of her people over");
    if (w.entitlement) parts.push('raises expectations');
    return parts.join(', ');
  }
  const e = OFFICE[office] && OFFICE[office][trait];
  if (!e) return '';
  const bits = [];
  if (e.faith) bits.push(`Faith ${signed(e.faith)}`);
  if (e.conv !== undefined) bits.push(`about ${e.conv} converts`);
  if (e.off) bits.push(`Offerings ${signed(e.off)}`);
  if (e.offRange) bits.push(`Offerings ${e.offRange[0]} to ${e.offRange[1]}`);
  if (e.dev) bits.push(`devotion ${signed(e.dev, 2)}`);
  if (e.mystery) bits.push(`Mystery ${signed(e.mystery)}`);
  if (e.heresy) bits.push(`Heresy ${signed(e.heresy)}`);
  if (e.progress !== undefined) bits.push(e.progress >= 2 ? 'builds fast' : e.progress < 1 ? 'builds slowly' : 'builds steadily');
  if (e.costMult) bits.push(e.costMult > 1 ? 'costs more' : 'costs less');
  if (e.crooked) bits.push('builds crooked');
  if (e.useless) bits.push('builds beautifully and uselessly');
  if (e.garble) bits.push('sometimes misquotes a Tablet');
  if (e.leave) bits.push('puts some people off');
  if (e.defect) bits.push('may go over to her');
  if (e.blunt) bits.push("slows her missionary");
  if (e.guard) bits.push('makes your people harder to poach');
  if (e.charm > 0) bits.push('charms the Unbothered');
  if (e.charm < 0) bits.push('puts the Unbothered off');
  if (e.devOnDone) bits.push('wears out the neighbours');
  return bits.join(', ');
}

/** For the ending: the Tablet that did the most harm, and whose doing it mostly was. */
export function worstVerse(g) {
  const all = [...g.apocrypha, ...g.tablets];
  if (!all.length) return null;
  const score = (t) => { const e = verseEffects(t.verse, t.households, g); return e.k - e.heresy - e.upkeep; };
  const t = all.reduce((a, b) => (score(b) < score(a) ? b : a));
  const blame = {};
  for (const st of t.steps) if (st.note) blame[st.by] = (blame[st.by] || 0) + 1;
  const by = Object.entries(blame).sort((a, b) => b[1] - a[1])[0];
  return { tablet: t, by: by ? g.flock.find((f) => f.id === by[0]) : null };
}

export const doctrineOf = (g) => scriptureSum(g).doctrine;

/** A devotee's prayer, in words. Tokens are filled here and nowhere else. */
export function wantText(f) {
  const w = WANTS.find((x) => x.id === f.want);
  return w ? fill(w.text, { name: f.name }) : null;
}
