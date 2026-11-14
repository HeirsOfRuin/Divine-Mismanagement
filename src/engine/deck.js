// Nothing authored is shown twice in one playthrough.
//
// The author: "I don't want any repeats of an event or scene in any play
// through." Every piece of authored content (a mishearing, a poetic phrase, a
// threat, a rider, a literal reading, an aftermath line, and later every event,
// prayer and memo) has an id in a named deck. Once it has been used in a run it
// is spent, and the spent list lives in the save, so a reload cannot bring it
// back. Pure: these never change the object they are given.
//
// A deck running dry is a content shortfall, not a runtime surprise:
// `node tools/telephone.mjs --run` measures how often each deck empties.

export const unspent = (spent, deck, ids) => {
  const used = spent[deck];
  return used ? ids.filter((id) => !used.includes(id)) : ids;
};

export const isSpent = (spent, deck, id) => Boolean(spent[deck] && spent[deck].includes(id));

export function spend(spent, deck, id) {
  if (isSpent(spent, deck, id)) throw new Error(`Deck "${deck}": "${id}" was already used in this playthrough`);
  return { ...spent, [deck]: [...(spent[deck] || []), id] };
}
