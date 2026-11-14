// Drawing authored content. Pure. Every draw spends the id for the rest of the
// playthrough (deck.js): nothing authored is shown twice. Tokens ({name},
// {god}, {rival}...) are filled once, when drawn, and the filled line is what
// the record keeps, so a name can never be resolved twice against different
// people (game-building F7).

import { unspent, spend } from './deck.js';

export function draw(s, deck, ids, rng) {
  const left = unspent(s.spent, deck, ids);
  if (!left.length) return null;
  const id = rng.pick(left);
  s.spent = spend(s.spent, deck, id);
  return id;
}

/** Spend one specific id if it is still unspent; true if it was. */
export function take(s, deck, id) {
  if (!unspent(s.spent, deck, [id]).length) return false;
  s.spent = spend(s.spent, deck, id);
  return true;
}

export const fill = (text, vars) => text.replace(/\{(\w+)\}/g, (m, k) => (k in vars ? vars[k] : m));
