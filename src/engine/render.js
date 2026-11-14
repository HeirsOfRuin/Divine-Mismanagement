// The only place a verse becomes words. Pure.
//
// A verse is stored as structure (docs/DESIGN.md 3.1), never as a sentence, so
// the Scripture page and the verse's effects cannot drift apart: both read the
// same object. Anything that needs a verse's text calls render().

import { WHO, MODALS, VERBS, PHRASES } from '../data/lexicon.data.js';
import { PENALTIES, RIDERS, RIDER_AFTER } from '../data/phrases.data.js';
import { TRADES } from '../data/followers.data.js';

const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);
const capAll = (s) => s.split(' ').map(cap).join(' ');
const penaltyOf = (id) => PENALTIES.find((p) => p.id === id);
const fill = (text, rider) => text.replaceAll('{name}', rider.name).replaceAll('{good}', rider.good);

export function slotText(slot) {
  if (!slot) return '';
  const p = PHRASES[slot.cur];
  return slot.lit ? p.literal : p.text;
}

export function riderText(rider) {
  if (!rider) return '';
  const src = rider.kind === 'trade'
    ? TRADES.find((t) => t.id === rider.trade).rider
    : RIDERS.find((r) => r.id === rider.kind).text;
  return fill(src, rider);
}

function subject(verse) {
  const s = WHO[verse.who.scope];
  return verse.who.zeal ? s.replace(/^all/, 'ALL') : s;
}

export function render(verse) {
  const verb = VERBS[verse.verb.cur];
  if (verse.bare) return cap(verb.gerund) + '.';

  const m = verse.modal;
  // "should not do something about borrowing" reads as nonsense; the negative
  // of a gist is "do nothing about".
  const predicate = verse.gist
    ? `${m.neg ? 'do nothing about' : 'do something about'} ${verb.gerund}`
    : verb.text;
  const negInModal = m.neg && !verse.gist;

  const parts = [];
  if (m.let) {
    parts.push('Let', subject(verse));
    if (negInModal) parts.push('not');
  } else {
    const table = MODALS[(negInModal ? 'neg' : 'pos') + (m.lit ? 'Lit' : '')];
    parts.push(cap(subject(verse)), table[m.strength]);
  }
  parts.push(predicate);
  if (verse.object) parts.push(slotText(verse.object));
  if (verse.tail) parts.push(slotText(verse.tail));

  let out = parts.join(' ') + riderText(verse.rider);
  if (verse.penalty) out += ', ' + penaltyOf(verse.penalty.id).text + (verse.penalty.twice ? ', twice' : '');
  return out + '.';
}

// "the Verse of the Eel". Named after the oddest thing left in it.
export function title(verse) {
  const verb = VERBS[verse.verb.cur];
  if (verse.bare) return `the Verse of ${capAll(verb.gerund)}`;
  if (verse.gist) return 'the Verse of Something';
  for (const slot of [verse.tail, verse.object]) {
    if (slot && slot.via) return `the Verse of the ${PHRASES[slot.cur].noun}`;
  }
  if (verse.verb.cur !== verse.verb.base) return `the Verse of ${capAll(verb.gerund)}`;
  if (verse.penalty) return `the Verse of the ${penaltyOf(verse.penalty.id).noun}`;
  for (const slot of [verse.object, verse.tail]) {
    if (slot) return `the Verse of the ${PHRASES[slot.cur].noun}`;
  }
  return `the Verse of ${capAll(verb.gerund)}`;
}

// The lines that could go under the carving, best first, each with an id so a
// playthrough shows it once (deck.js; telephone.js carve() picks the first one
// this run has not used). Gate A: authored flavour, chosen from what survived
// in the verse. They claim no numbers; the Scripture effects system (Gate B)
// will compute those from the same structure.
export function aftermathChoices(verse, original) {
  const out = [];
  const add = (id, text) => { if (text) out.push({ id, text }); };
  if (verse.bare) add('bare', 'The whole teaching is now one word. It is chanted.');
  else if (verse.gist) add('gist', 'Nobody recalls the details. Something is done about it weekly, to be safe.');
  if (verse.modal.negDropped) add('negDropped', 'The verse now commands what it was sent to forbid. Compliance is excellent.');
  // Misheard and poetic phrases first: they are what the verse is named after.
  for (const slot of [verse.tail, verse.object]) {
    if (!slot || !slot.via) continue;
    const p = PHRASES[slot.cur];
    if (slot.lit) add(`${slot.cur}:lit`, p.litAfter);
    add(slot.cur, p.after);
  }
  const verb = VERBS[verse.verb.cur];
  if (verse.verb.cur !== verse.verb.base) add(`verb:${verse.verb.cur}`, verb.after);
  for (const slot of [verse.tail, verse.object]) {
    if (slot && slot.lit) add(`${slot.cur}:lit`, PHRASES[slot.cur].litAfter);
  }
  if (verse.rider) add('rider', fill(RIDER_AFTER, verse.rider));
  if (verse.penalty) add('threat', 'The threat has not yet been carried out. People are being careful.');
  if (verse.modal.lit) add('modalLit', 'It is observed to the letter. So are the complaints.');
  if (!verse.object && !verse.tail && !verse.gist && !verse.bare) add('empty', 'Nobody is sure what, or when. They are doing it anyway.');
  if (verse.modal.let) add('let', 'It is recited beautifully. Nobody is sure whether it is a rule.');
  if (original && render(original) === render(verse)) add('same', 'It arrived exactly as you sent it. Pim has checked twice and is uneasy.');
  add('close', 'Close enough. The Registry has seen worse.');
  // The same line can qualify twice (a literal reading of a misheard phrase).
  return out.filter((a, n) => out.findIndex((b) => b.id === a.id) === n);
}

export const aftermath = (verse, original) => aftermathChoices(verse, original)[0].text;
