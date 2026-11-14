// The Holy Book. Pure.
//
// The author: "getting them to eventually build a bible like book after a
// certain amount of time could be fun, seeing all of your previously
// misinterpreted commandments all brought together after some more
// mistranslations". So: at the first dawn from season BOOK.from with at
// least BOOK.verses carved (or at the backstop season with any), two of your
// people copy out every verse you ever gave them, Apocrypha included, taking
// alternate chapters, and each copy passes through its scribe's first trait:
// the telephone once more. (Playtest 2: with both scribes on every chapter,
// one Poet turned all six chapters into "Let..."; alternating shows two hands.)
// Each chapter is retitled by what it now says; the old title is kept.
// Every chapter keeps what you said, what was carved, and what the Book now
// says. Like a Tablet, a chapter is stored as structure and rendered on demand.

import { BOOK } from '../data/match.data.js';
import { BOOK_LINES } from '../data/content/grand.data.js';
import { applyTrait } from './telephone.js';
import { verseEffects } from './scripture.js';
import { fill } from './content.js';
import { title } from './render.js';

export const shortName = (name) => name.replace(/^the (God|Goddess) of /i, '').replace(/^the /i, '');

export function bookDue(s) {
  const g = s.gods[0];
  if (s.book) return false;
  const n = g.tablets.length + g.apocrypha.length;
  return (s.season >= BOOK.from && n >= BOOK.verses) || (s.season >= BOOK.backstop && n >= 1);
}

export function compileBook(s, rng) {
  const g = s.gods[0];
  const scribes = rng.shuffle([...g.flock]).slice(0, BOOK.scribes);
  for (const f of scribes) f.known = true;
  const all = [...g.apocrypha, ...g.tablets].sort((a, b) => a.season - b.season);
  const named = {};
  const chapters = all.map((t, i) => {
    let v = t.verse;
    const notes = [];
    for (const f of [scribes[i % scribes.length]]) {
      const r = applyTrait(v, f.traits[0], rng, f, s.spent);
      if (r.note) { s.spent = r.spent; v = r.verse; notes.push({ by: f.id, trait: f.traits[0], note: r.note }); }
    }
    g.exasperation += notes.length;
    const base = title(v).replace(/^the /, 'The ');
    named[base] = (named[base] || 0) + 1;
    const name = named[base] === 1 ? base : base.replace(/^The /, `The ${['', 'Second ', 'Third ', 'Fourth ', 'Fifth '][named[base] - 1] || `${named[base]}th `}`);
    return { tablet: t.id, title: name, formerly: t.title, said: t.said, carved: t.verse, verse: v, households: t.households, notes, by: scribes[i % scribes.length].id };
  });
  s.book = {
    title: `The Book of ${shortName(g.name)}`, season: s.season, scribes: scribes.map((f) => f.id), chapters,
    compiled: fill(BOOK_LINES.compiled, { a: scribes[0].name, b: scribes[1] ? scribes[1].name : scribes[0].name }),
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
