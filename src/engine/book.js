// The Holy Book. Pure.
//
// The author asked for a Book of "all of your previously misinterpreted
// commandments all brought together after some more mistranslations". The
// first version copied the Tablets out once more, and after playtest 3 the
// author said it was "the exact thing I had in my journal": nothing new. So
// the Book is now the village's account of what you did (docs/FRAME-story.md):
// how it began, the words you gave (each Tablet copied once more through a
// scribe, and retitled by what it now says), the wonders, the saints, the other
// god, the committee. Every passage is built from what actually happened in
// this game, then bent by the second scribe. You know what happened; the Book
// is what they believe.
//
// Compiled at the first dawn from season BOOK.from with BOOK.verses carved, or
// at the backstop season with any. In Story mode Hesper writes it (and the
// Committee checks it, if you endorsed the Committee).

import { BOOK } from '../data/match.data.js';
import { BOOK_LINES } from '../data/content/grand.data.js';
import { BOOK_OPENING, BOOK_PASSAGES, SCRIBE_CODAS } from '../data/content/story.data.js';
import { MIRACLES } from '../data/offices.data.js';
import { applyTrait } from './telephone.js';
import { verseEffects } from './scripture.js';
import { fill, draw } from './content.js';
import { title } from './render.js';
import { leaderAgainst } from './world.js';

export const shortName = (name) => name.replace(/^the (God|Goddess) of /i, '').replace(/^the /i, '');
const ORD = ['first', 'second', 'third', 'fourth', 'fifth', 'sixth', 'seventh', 'eighth', 'ninth', 'tenth', 'eleventh', 'twelfth', 'thirteenth', 'fourteenth', 'fifteenth'];
const yearWord = (season) => ORD[Math.ceil(season / 4) - 1] || `${Math.ceil(season / 4)}th`;

export function bookDue(s) {
  const g = s.gods[0];
  if (s.book) return false;
  const n = g.tablets.length + g.apocrypha.length;
  return (s.season >= BOOK.from && n >= BOOK.verses) || (s.season >= BOOK.backstop && n >= 1);
}

export function compileBook(s, rng) {
  const g = s.gods[0];
  const story = s.match.mode === 'story' && s.match.chapter === 'ch1';
  const hesper = g.flock.find((f) => f.cast === 'hesper');
  const aldous = g.flock.find((f) => f.cast === 'aldous');
  const author = story && hesper ? hesper : rng.pick(g.flock);
  const second = story && s.flags && s.flags.report === 'endorsed' && aldous ? aldous : rng.pick(g.flock.filter((f) => f !== author));
  const scribes = [author, second];
  for (const f of scribes) f.known = true;
  const lead = leaderAgainst(s, 0);
  const rivalName = lead !== null ? s.gods[lead].name : 'the other god';
  const codas = { ...SCRIBE_CODAS };
  const used = new Set();
  // The second scribe bends each passage with a coda, never the same one twice.
  const bend = (text) => {
    const tr = second.traits[0];
    const left = (codas[tr] || []).filter((c) => !used.has(c));
    if (!left.length) return text;
    const c = rng.pick(left);
    used.add(c);
    return `${text.replace(/\.$/, '')}, ${fill(c, { scribe: second.name })}.`;
  };
  const sections = [];

  // I. How it began.
  const opening = story ? BOOK_OPENING[(s.flags && s.flags.stone) || 'silent'] : BOOK_OPENING.none;
  sections.push({ heading: 'How it began', passages: [bend(opening)] });

  // II. The words: each Tablet copied once more by the scribes in turn, retitled.
  const all = [...g.apocrypha, ...g.tablets].sort((a, b) => a.season - b.season);
  const named = {};
  const chapters = all.map((t, i) => {
    let v = t.verse;
    const notes = [];
    const f = scribes[i % scribes.length];
    const r = applyTrait(v, f.traits[0], rng, f, s.spent);
    if (r.note) { s.spent = r.spent; v = r.verse; notes.push({ by: f.id, trait: f.traits[0], note: r.note }); }
    g.exasperation += notes.length;
    const base = title(v).replace(/^the /, 'The ');
    named[base] = (named[base] || 0) + 1;
    const name = named[base] === 1 ? base : base.replace(/^The /, `The ${['', 'Second ', 'Third ', 'Fourth ', 'Fifth '][named[base] - 1] || `${named[base]}th `}`);
    return { tablet: t.id, title: name, formerly: t.title, said: t.said, carved: t.verse, verse: v, households: t.households, notes, by: f.id };
  });
  sections.push({ heading: 'The words', passages: [bend(fill(BOOK_PASSAGES.words, { n: all.length }))], chapters: true });

  // III. The wonders, from the legends as they happened.
  const wonders = g.legends.map((L) => (L.kind === 'wonder'
    ? fill(BOOK_PASSAGES.wonder, { year: yearWord(L.season) })
    : fill(BOOK_PASSAGES.miracle, { year: yearWord(L.season), thing: MIRACLES[L.kind].label.toLowerCase(), name: L.by ? (g.flock.find((f) => f.id === L.by) || {}).name || 'somebody' : 'nobody' })));
  if (wonders.length) sections.push({ heading: 'The wonders', passages: wonders.slice(0, 5).map(bend) });

  // IV. The saints.
  const saints = g.saints.map((st) => {
    const f = g.flock.find((x) => x.id === st.id);
    return fill(f.saint.intended !== f.id ? BOOK_PASSAGES.wrongSaint : BOOK_PASSAGES.saint, { name: f.name, thing: f.saint.patron });
  });
  if (saints.length) sections.push({ heading: 'The saints', passages: saints.map(bend) });

  // V. The other god.
  const fights = (g.n.dispute || 0) + (g.n.poach || 0) + (g.seen.smite || 0);
  sections.push({ heading: `Of ${rivalName}`, passages: [bend(fill(fights ? BOOK_PASSAGES.rivalFight : BOOK_PASSAGES.rivalPeace, { n: fights, rival: rivalName }))] });

  // VI. The committee (Story mode).
  if (story && s.flags && s.flags.committee) {
    const k = { aldous: 'committeeAldous', odo: 'committeeOdo', none: 'committeeNone' }[s.flags.committee];
    sections.push({ heading: 'Of the Committee', passages: [bend(BOOK_PASSAGES[k])] });
  }

  s.book = {
    title: `The Book of ${shortName(g.name)}`, season: s.season, scribes: scribes.map((f) => f.id), chapters, sections,
    compiled: fill(BOOK_LINES.compiled, { a: author.name, b: second.name }),
    preface: fill(BOOK_LINES.preface, { god: g.name }),
  };
  return s.book;
}

/** What the Book does each season: Faith for each chapter that still does good, and one text to argue over less. */
export function bookEffects(s) {
  if (!s.book) return null;
  const g = s.gods[0];
  const good = s.book.chapters.filter((c) => verseEffects(c.verse, c.households, g).k > 0).length;
  return { faith: good * BOOK.faithPerChapter, heresy: BOOK.heresy, good, of: s.book.chapters.length };
}
