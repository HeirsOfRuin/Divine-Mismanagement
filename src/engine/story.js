// The story: Story Chapter 1's cast, scenes, consequences and ending. Pure.
//
// The author after playtest 3: "overall generic and the story was pointless,
// no real backstory, narrative, or feeling of investment or accomplishment"
// (docs/FRAME-story.md). So in Story mode four of your people are a fixed cast,
// scenes happen at set seasons and wait for you like a ruling does, each choice
// is stored as a flag, and later scenes, the Book and the ending read those
// flags back. Other matches get the rank scenes and the ending, not the cast.

import { CAST, RIVAL_PRIEST, SCENES, RANK_SCENES, ENDING_LINES, FATES, FINAL_CHOICE } from '../data/content/story.data.js';
import { TRADES } from '../data/followers.data.js';
import { NAMES } from '../data/followers.data.js';
import { gain, moveSouls } from './meters.js';
import { fill } from './content.js';
import { leaderAgainst, stronghold } from './world.js';
import { shortName } from './book.js';

export const isStory = (s) => s.match.mode === 'story' && s.match.chapter === 'ch1';

/** Put the cast into a new Story game's flock (and Gisla into Vellamine's). */
export function castFlock(s) {
  if (!isStory(s)) return s;
  const g = s.gods[0];
  for (const [key, c] of Object.entries(CAST)) {
    const f = g.flock[c.slot];
    // Nobody else in the village may share a cast member's name.
    for (const x of s.gods.flatMap((y) => y.flock)) {
      if (x !== f && x.name === c.name) x.name = NAMES.find((n) => !s.gods.some((y) => y.flock.some((z) => z.name === n)) && !Object.values(CAST).some((k) => k.name === n));
    }
    Object.assign(f, { name: c.name, trade: TRADES.find((t) => t.id === c.trade), traits: [c.trait], household: c.household, cast: key, known: Boolean(c.known) });
  }
  const priest = s.gods[1].flock[0];
  for (const x of s.gods.flatMap((y) => y.flock)) if (x !== priest && x.name === RIVAL_PRIEST) x.name = NAMES.find((n) => !s.gods.some((y) => y.flock.some((z) => z.name === n)));
  priest.name = RIVAL_PRIEST; priest.cast = 'gisla';
  s.flags = {};
  s.scenes = [];
  return s;
}

const tokens = (s) => {
  const lead = leaderAgainst(s, 0);
  return { god: s.gods[0].name, short: shortName(s.gods[0].name), rival: lead !== null ? s.gods[lead].name : 'Vellamine' };
};

/** At dawn: queue the scenes due this season (and a rank scene, if a rank was reached). */
export function queueScenes(s, rankUp = 0) {
  s.scenes ||= [];
  s.seenScenes ||= [];
  s.flags ||= {};
  if (rankUp && RANK_SCENES[rankUp]) s.scenes.push(`rank:${rankUp}`);
  if (!isStory(s)) return s;
  for (const sc of SCENES) {
    if (s.seenScenes.includes(sc.id) || s.scenes.includes(sc.id) || sc.when > s.season) continue;
    if (sc.requires && !Object.entries(sc.requires).every(([k, v]) => s.flags[k] === v)) continue;
    s.scenes.push(sc.id);
  }
  return s;
}

/** The scene now waiting, as the screen shows it, or null. */
export function currentScene(s) {
  const id = (s.scenes || [])[0];
  if (!id) return null;
  const t = tokens(s);
  if (id.startsWith('rank:')) {
    const R = RANK_SCENES[Number(id.slice(5))];
    return { id, title: R.title, who: ['pim'], pages: R.pages.map((p) => fill(p, t)), choices: [{ id: 'continue', label: 'Continue' }] };
  }
  const sc = SCENES.find((x) => x.id === id);
  return { id, title: sc.title, who: sc.who, pages: sc.pages.map((p) => fill(p, t)),
    choices: sc.choices.map((c) => ({ id: c.id, label: fill(c.label, t), note: c.note || null, effects: c.effects || {} })) };
}

/** Make a choice in the scene now waiting. Returns the line that follows, if any. Mutates s. */
export function resolveScene(s, choiceId) {
  const id = s.scenes[0];
  const t = tokens(s);
  s.scenes.shift();
  s.seenScenes.push(id);
  if (id.startsWith('rank:')) return null;
  const sc = SCENES.find((x) => x.id === id);
  const c = sc.choices.find((x) => x.id === choiceId);
  if (!c) throw new Error(`no choice "${choiceId}" in ${id}`);
  for (const [m, v] of Object.entries(c.effects || {})) gain(s, 0, m, v, sc.title);
  Object.assign(s.flags, c.flag || {});
  if (c.do === 'dissolve') {
    // Measured: three souls and Heresy +2 cost 13 points of win rate against every
    // other path (200 games each); two and +1 keeps it a cost, not a verdict.
    gain(s, 0, 'heresy', 1, sc.title);
    const lead = leaderAgainst(s, 0);
    if (lead !== null) moveSouls(s, 0, lead, 2, 'the Correct left', stronghold(s, 0));
  }
  if (id === 'stone' && choiceId === 'unstick') { const odo = s.gods[0].flock.find((f) => f.cast === 'odo'); if (odo) odo.known = true; }
  return c.after ? fill(c.after, t) : null;
}

/** What a standing committee does each season: order, at a price. */
export function committeeEffects(s) {
  const c = s.flags && s.flags.committee;
  if (c === 'aldous' && s.flags.report !== 'dissolved') return { heresy: -0.3, offerings: -0.3 };
  if (c === 'odo') return { heresy: -0.2 };
  return null;
}

/** The ending, as paragraphs: the hearing, then what became of each of them. */
export function epilogue(s) {
  const t = tokens(s);
  const g = s.gods[0];
  const out = [fill(ENDING_LINES[s.outcome] || '', t)];
  if (!isStory(s)) { out.push(FATES.pim); return out; }
  const f = s.flags || {};
  out.push(FATES.odo[f.stone || 'silent']);
  out.push(FATES.aldous[f.report || (f.committee === 'aldous' ? 'chair' : f.committee === 'odo' ? 'odo' : 'none')]);
  out.push(s.book ? FATES.hesper.book : FATES.hesper.nobook);
  out.push(fill(g.souls >= s.gods[1].souls ? FATES.brenna.yours : FATES.brenna.lost, t));
  out.push(fill(FATES.vellamine[f.corridor || 'none'], t));
  out.push(FATES.pim);
  return out.filter(Boolean);
}

export function finalChoice(s) {
  if (s.outcome !== 'ascended' || (s.flags && s.flags.final)) return null;
  const t = tokens(s);
  return { prompt: fill(FINAL_CHOICE.prompt, t), options: FINAL_CHOICE.options.map((o) => ({ id: o.id, label: fill(o.label, t) })) };
}
export function finalText(s) {
  const o = FINAL_CHOICE.options.find((x) => x.id === (s.flags && s.flags.final));
  return o ? fill(o.text, tokens(s)) : null;
}
