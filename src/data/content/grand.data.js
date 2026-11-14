// The rare things: holy objects, saints, Wonders, the Book, rank, and the
// god's own exasperation. Logic-free. Each line is used once a playthrough at
// most (src/engine/deck.js). House rules: docs/WORLD.md section 6, and the
// author's "don't try too hard, it should be clever".
// Tokens: {name} a devotee, {god}, {rival}, {saint}, {thing}.

// Holy objects. You bless something; the faithful decide what it was. Each
// keeps working for the rest of the game.
//   effect, per season: faith, mystery, heresy, devotion, offerings, entitlement
//   or a standing bonus: conv (share), guard (share of poaching resisted)
export const ARTIFACTS = [
  { id: 'spoon',    name: 'the Good Spoon',            how: 'You blessed the bread. {name} was holding the spoon at the time, and it is the spoon that is now holy.', effect: { devotion: 0.05 }, does: 'devotion +0.05 a season' },
  { id: 'ladder',   name: 'the Second-Best Ladder',     how: 'You meant the bell tower. The ladder was leaning on it. Pilgrims now climb the ladder halfway and come down moved.', effect: { mystery: 1 }, does: 'Mystery +1 a season' },
  { id: 'boot',     name: "{name}'s Left Boot",         how: 'A beam of light fell on the temple step. {name} had left a boot there. Nobody has been able to persuade them to wear it since.', effect: { faith: 2 }, does: 'Faith +2 a season' },
  { id: 'eel_tub',  name: 'the Tub',                    how: 'The light fell on the eel tub. The eel has been moved to a better tub. The old tub is now the holy one.', effect: { offerings: 1 }, does: 'an Offering a season from visitors' },
  { id: 'gate',     name: 'the Gate That Stays Shut',   how: 'You blessed the lych-gate. It has not opened since. People climb over it reverently.', effect: { guard: 0.25 }, does: 'your people are a quarter harder to poach' },
  { id: 'loaf',     name: 'the Loaf',                   how: 'A loaf on the altar was blessed. It has not gone stale. It has not gone anything. People are a little afraid of it.', effect: { heresy: -0.3 }, does: 'Heresy −0.3 a season' },
  { id: 'hat',      name: 'the Hat of {name}',          how: 'You blessed the congregation. {name} was the only one wearing a hat, and draws the obvious conclusion.', effect: { faith: 1, heresy: 0.2 }, does: 'Faith +1 and Heresy +0.2 a season' },
  { id: 'bell',     name: 'the Bell That Rings Itself', how: 'The bell rang on its own the morning after. It was the wind. Nobody wants to hear that it was the wind.', effect: { conv: 0.15 }, does: 'converts come 15% easier' },
  { id: 'stone',    name: 'the Little Stone',           how: 'You blessed the standing stone. A chip came off it. The chip is now carried in procession; the stone is felt to have rather let itself down.', effect: { mystery: 0.5, devotion: 0.03 }, does: 'Mystery +0.5 and devotion +0.03 a season' },
  { id: 'chair',    name: 'the Good Chair',             how: 'The blessing went through the roof and landed on a chair. It is the good chair. Nobody sits in it now, which is the same as before.', effect: { entitlement: -0.2 }, does: 'the faithful expect a little less' },
  { id: 'cloth',    name: 'the Altar Cloth, Mended',    how: 'The goat ate the altar cloth and you blessed what was left. The mending is now considered the holy part.', effect: { faith: 1, devotion: 0.03 }, does: 'Faith +1 and devotion +0.03 a season' },
  { id: 'jar',      name: 'the Jar',                    how: 'Nobody knows what was in the jar. Nobody is going to open it to find out.', effect: { mystery: 1.5, heresy: 0.2 }, does: 'Mystery +1.5 and Heresy +0.2 a season' },
];

// What a Saint is patron of. Decided by the village, not by you.
export const PATRONAGES = [
  'ladders returned late', 'things left in the other coat', 'the second sitting', 'mild weather, broadly',
  'people who were nearly on time', 'hens that are thinking about it', 'the back pew', 'arguments about fences',
  'loaves that did not quite rise', 'the stairs, going down', 'the last biscuit', 'people who meant to write',
  'marrows of reasonable size', 'the wrong key', 'quiet afternoons', 'standing about', 'the queue', 'damp',
];

export const CANONIZED = {
  right: 'Saint {saint} has been proclaimed, patron of {thing}. You had nothing to do with the patronage.',
  wrong: 'You named {name}. Your Prophet announced Saint {saint}, patron of {thing}. {saint} is very pleased. {name} has gone quiet.',
};

// Wonders: once in a long while, and told for years.
export const WONDERS = [
  'The pond stood up, looked around, and lay back down. Nobody in the parish has spoken of anything else since.',
  'Every bell in the parish rang at once, including two that are not bells. The faithful are still out in the lane.',
  'For one afternoon the rain fell upward. Several people have had their hats returned to them.',
  'The standing stone turned to face the temple. It had not moved in a thousand years and nobody saw it go.',
  'The whole village dreamt the same dream, about you, and woke agreeing on almost all of it.',
  "The moon came down low enough to see that it was smiling. {rival}'s people looked too, and some of them stayed.",
];

// When your words come back to you wrong. Shown once each, when the verse that
// was carved has lost what you sent it for.
export const HEADDESK = [
  'You put your head in your hands. Pim pretends not to notice.',
  'You rest your forehead on the edge of a cloud for a while.',
  'You make a sound that, at your level, registers as weather.',
  'You count to ten in several dead languages.',
  'Pim slides a form across: Request For Followers Who Listen. It is marked Pending.',
  'Somewhere above the parish, a small cloud sighs.',
  'You consider smiting the whole chain. You decide that would also be misunderstood.',
  'You lie down on the floor of Heaven. Pim steps over you, carefully, with the post.',
  'You ask Pim whether all gods have this problem. Pim says yes, and that the large ones have it louder.',
  'You look at the Tablet for a long time. It looks back.',
  'You draft a clarification. Then you remember how clarifications travel.',
  'There is a dent in the floor of the Lower Annex now. It is the shape of a forehead.',
];

// The Book. The faithful gather every verse you ever gave them and copy them
// out once more. Two scribes, one pass each.
export const BOOK_LINES = {
  compiled: '{a} and {b} have gathered every verse you ever gave them into one book, copying each out by hand. They were very careful. It shows, in places.',
  preface: 'Here are the words of {god}, as they were given, more or less.',
};

// Rank. Once each.
export const RANK_UP = [
  null,
  'The Registry has reclassified you as a Local Deity. You have a slightly larger desk. It also wobbles.',
  'You are now a Deity of Some Standing. The Middle Heavens have started nodding at you in the corridor.',
  'Regional God. Your file has been moved to a drawer with a lock on it. Pim is very proud and is pretending not to be.',
  'Major God. The other gods have stopped asking what you are god of. There is talk of the seventh seat.',
];
