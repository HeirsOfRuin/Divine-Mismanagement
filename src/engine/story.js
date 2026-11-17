// The story: each Story chapter's cast, scenes, consequences and ending, and
// the legacy one chapter hands the next. Pure.
//
// The author after playtest 3: "overall generic and the story was pointless,
// no real backstory, narrative, or feeling of investment or accomplishment"
// (docs/FRAME-story.md). So in Story mode four of your people are a fixed cast,
// scenes happen at set seasons and wait for you like a ruling does, each choice
// is stored as a flag, and later scenes, the Book and the ending read those
// flags back. Other matches get the rank scenes and the ending, not the cast.
//
// Chapters 2 and 3 (docs/STORY-chapters-2-3.md) are keyed the same way, from
// chapters.data.js. A finished chapter's legacy (legacyOf) starts the next
// one; without it, the canonical legacy stands in (CANON_LEGACY).

import { CAST, RIVAL_PRIEST, SCENES, RANK_SCENES, ENDING_LINES, FATES, FINAL_CHOICE } from '../data/content/story.data.js';
import { CHAPTER_STORIES, CANON_LEGACY } from '../data/content/chapters.data.js';
import { STORY } from '../data/match.data.js';
import { TRADES } from '../data/followers.data.js';
import { NAMES } from '../data/followers.data.js';
import { gain, moveSouls } from './meters.js';
import { fill } from './content.js';
import { leaderAgainst, stronghold } from './world.js';
import { shortName } from './book.js';

const CHAPTERS = {
  ch1: { cast: CAST, scenes: SCENES, ending: ENDING_LINES, final: FINAL_CHOICE,
    review: { caps: 'Your appeal', hint: 'The Registry hears your appeal after season {n}. What it will ask is on the World page.' } },
  ...CHAPTER_STORIES,
};
export const isStory = (s) => s.match.mode === 'story' && Boolean(CHAPTERS[s.match.chapter]);
const story = (s) => (isStory(s) ? CHAPTERS[s.match.chapter] : null);

/** What the Review is called in this match, and the line under it. */
export function reviewLabel(s) {
  const st = story(s);
  return st ? { caps: st.review.caps, hint: fill(st.review.hint, { n: s.match.seasons }) } : null;
}

// ---- the legacy: one chapter's ending, carried into the next -------------------------

/** A finished Story chapter, as the next chapter needs it. Null if not a finished story. */
export function legacyOf(s) {
  if (!isStory(s) || !s.over) return null;
  const g = s.gods[0];
  const { final = null, ...flags } = s.flags || {};
  return { chapter: s.match.chapter, outcome: s.outcome, final, flags, god: g.name, rank: g.rank,
    book: s.book ? s.book.title : null, saints: (g.saints || []).map((x) => g.flock.find((f) => f.id === x.id)?.name).filter(Boolean) };
}
/** Which of a page's legacy variants applies: the last choice if the chapter was won, else how it was lost. */
export function legacyKey(L) {
  if (!L) return null;
  if (L.outcome === 'ascended') return L.final || 'stay';
  return L.outcome === 'absorbed' || L.outcome === 'forgotten' ? 'lapsed' : L.outcome;
}
/** The chapter after this one, if there is one. */
export function nextChapter(s) {
  if (!isStory(s)) return null;
  const i = STORY.findIndex((c) => c.id === s.match.chapter);
  return STORY[i + 1] || null;
}
/** The legacy a chapter starts from: the one given if it is the chapter before, else the canonical one. */
function legacyFor(chapter, given) {
  const canon = CANON_LEGACY[chapter];
  if (!canon) return null;
  return given && given.chapter === canon.chapter ? given : { ...canon };
}

/** Put the cast into a new Story game's flock (and Gisla into Vellamine's). */
export function castFlock(s, legacy = null) {
  s.flags = {};
  s.scenes = [];
  s.legacy = null;
  if (!isStory(s)) return s;
  s.legacy = legacyFor(s.match.chapter, legacy);
  const cast = story(s).cast;
  const g = s.gods[0];
  for (const [key, c] of Object.entries(cast)) {
    const f = g.flock[c.slot];
    // Nobody else in the village may share a cast member's name.
    for (const x of s.gods.flatMap((y) => y.flock)) {
      if (x !== f && x.name === c.name) x.name = NAMES.find((n) => !s.gods.some((y) => y.flock.some((z) => z.name === n)) && !Object.values(cast).some((k) => k.name === n));
    }
    Object.assign(f, { name: c.name, trade: TRADES.find((t) => t.id === c.trade), traits: [c.trait], household: c.household, cast: key, known: Boolean(c.known) });
  }
  const priest = s.gods[1].flock[0];
  for (const x of s.gods.flatMap((y) => y.flock)) if (x !== priest && x.name === RIVAL_PRIEST) x.name = NAMES.find((n) => !s.gods.some((y) => y.flock.some((z) => z.name === n)));
  priest.name = RIVAL_PRIEST; priest.cast = 'gisla';
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
  for (const sc of story(s).scenes) {
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
  const sc = story(s).scenes.find((x) => x.id === id);
  const page = (p) => (typeof p === 'string' ? p : p.legacy[legacyKey(s.legacy)] || Object.values(p.legacy)[0]);
  return { id, title: sc.title, who: sc.who, pages: sc.pages.map((p) => fill(page(p), t)),
    choices: sc.choices.map((c) => ({ id: c.id, label: fill(c.label, t), note: c.note || null, effects: c.effects || {} })) };
}

/** Make a choice in the scene now waiting. Returns the line that follows, if any. Mutates s. */
export function resolveScene(s, choiceId) {
  const id = s.scenes[0];
  const t = tokens(s);
  s.scenes.shift();
  s.seenScenes.push(id);
  if (id.startsWith('rank:')) return null;
  const sc = story(s).scenes.find((x) => x.id === id);
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
  const st = story(s);
  const out = [fill((st ? st.ending : ENDING_LINES)[s.outcome] || '', t)];
  if (!st) { out.push(FATES.pim); return out; }
  // Chapters 2 and 3: the fates are designed, not yet written.
  if (s.match.chapter !== 'ch1') return out.filter(Boolean);
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
  const F = story(s) ? story(s).final : FINAL_CHOICE;
  const t = tokens(s);
  return { prompt: fill(F.prompt, t), options: F.options.map((o) => ({ id: o.id, label: fill(o.label, t) })) };
}
export function finalText(s) {
  const F = story(s) ? story(s).final : FINAL_CHOICE;
  const o = F.options.find((x) => x.id === (s.flags && s.flags.final));
  return o ? fill(o.text, tokens(s)) : null;
}
