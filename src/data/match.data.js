// Match setup: Story chapters and Custom matches, the rival gods, the regions,
// the rank ladder, and the rare acts. Logic-free.
//
// Story Chapter 1 is the measured game (docs/BALANCE.md). Chapters 2 and 3 and
// every Custom match run on the same rules with thresholds scaled to the size
// of the world (src/engine/world.js), and are NOT yet balanced: the screens say
// so. That is the framework the author asked to begin (2026-11-14).

export const STORY = [
  { id: 'ch1', label: 'Chapter 1: Little Fretting', rivals: 1, regions: 1, wealth: 'standard', seasons: 30, measured: true,
    intro: 'One village, thirty-six souls, and Vellamine, who arrived the same week you did and already has a logo.' },
  { id: 'ch2', label: 'Chapter 2: The Vale', rivals: 2, regions: 3, wealth: 'standard', seasons: 40, measured: false,
    intro: 'Three villages along one river, and two gods who got there first. Hurm has fenced his.' },
  { id: 'ch3', label: 'Chapter 3: The Overcrowded Heavens', rivals: 4, regions: 5, wealth: 'standard', seasons: 50, measured: false,
    intro: 'Five parishes, four rivals, and one seat on the High Pantheon that everyone has been measuring for curtains.' },
];

export const CUSTOM = {
  rivals: [1, 2, 3, 4, 5],
  regions: [1, 2, 3, 4, 5],
  seasons: [30, 40, 50, 60],
  wealth: {
    lean:     { label: 'Lean',     faith: 0.5, power: 0.67, offerings: 0 },
    standard: { label: 'Standard', faith: 1,   power: 1,    offerings: 1 },
    rich:     { label: 'Rich',     faith: 2,   power: 1.67, offerings: 3 },
  },
};

// The rival gods. `style` weights their written policy (src/engine/rival.js):
// miracle, reveal, hostile (smiting, disputes, poaching), kindly (prayers, festivals).
export const RIVALS = [
  { id: 'vellamine', name: 'Vellamine', title: 'Goddess of Being Noticed', colour: '#9c3d34', rays: '#f3c969', style: { miracle: 3, reveal: 1, hostile: 1, kindly: 1 } },
  { id: 'hurm',      name: 'Hurm',      title: 'God of Fences',            colour: '#3f5a8a', rays: '#b7aebb', style: { miracle: 1, reveal: 1, hostile: 3, kindly: 0 } },
  { id: 'ysolde',    name: 'Ysolde',    title: 'Goddess of Unsolicited Advice', colour: '#6b4a73', rays: '#e9dcba', style: { miracle: 1, reveal: 3, hostile: 1, kindly: 1 } },
  { id: 'brannoch',  name: 'Old Brannoch', title: 'God of Slightly Better Bread', colour: '#8a6242', rays: '#e6c3a0', style: { miracle: 1, reveal: 1, hostile: 0, kindly: 3 } },
  { id: 'ottoline',  name: 'Ottoline',  title: 'Goddess of Queues',        colour: '#4f8f83', rays: '#cfc8b8', style: { miracle: 1, reveal: 2, hostile: 1, kindly: 2 } },
  { id: 'grist',     name: 'Grist',     title: 'God of Small Complaints',  colour: '#5a3d28', rays: '#c98f1f', style: { miracle: 2, reveal: 1, hostile: 2, kindly: 1 } },
];

export const REGION_NAMES = ['Little Fretting', 'Nether Dither', 'Great Muddle', 'Puddlecombe', 'Long Sulking', 'Grudgeworth', 'Ashby-under-Fence', 'Middle Wending'];

// Your standing in the Heavens. Thresholds are in units of the world's fair
// share (souls) and its Faith scale (src/engine/world.js), so a rank means the
// same thing in a small match and a large one. Ranks are never taken away:
// the Registry does not demote; it files.
export const RANKS = [
  { title: 'Minor Deity' },
  { title: 'Local Deity',               souls: 0.9,  faith: 40,  unlocks: ['anoint', 'artifact'] },
  { title: 'Deity of Some Standing',    souls: 1.05, faith: 75,  unlocks: ['wonder'] },
  { title: 'Regional God',              souls: 1.2,  faith: 110, unlocks: ['canonize'] },
  { title: 'Major God',                 souls: 1.35, faith: 150, leads: true },
];

// The rare acts: great cost, long waits. Faith spent here is Faith the
// Registry will not see at the year's end.
export const GRAND = {
  anoint:   { label: 'Anoint a High Prophet', cost: { faith: 15, power: 4 }, once: true,
    does: 'Your Prophet becomes High Prophet: every Revelation reaches one more household, and their trait works on it twice.' },
  artifact: { label: 'Bless a holy object', cost: { offerings: 8, power: 3 }, every: 4,
    does: 'Something ordinary is blessed. The faithful decide what it is, and it keeps working for the rest of the game.' },
  wonder:   { label: 'Work a Wonder', cost: { faith: 20, power: 10 }, every: 8,
    does: 'A great miracle. Converts, Faith and awe, and it is told for years. It never goes stale, because nobody has seen one.' },
  canonize: { label: 'Make a Saint', cost: { faith: 40, power: 5 }, max: 3,
    does: 'Name one of your people a Saint. The name passes through your Prophet first, so it may not be the one you meant.' },
};

// Wrong saints: the chance the Prophet passes on a different name.
export const MISHEARD_SAINT = { drunk: 0.5, lazy: 0.3, poet: 0.2, literalist: 0.05, ambitious: 0.25, zealot: 0.1, none: 0.15 };

// What a Saint does every season, by their first trait, plus Faith from the
// people who pray to them.
export const SAINT_VIRTUE = {
  literalist: { heresy: -0.5, label: 'Heresy falls a little every season' },
  drunk:      { devotion: 0.05, label: 'devotion rises a little every season' },
  ambitious:  { offerings: 1, label: 'an Offering every season, collected in their name' },
  poet:       { mystery: 1, label: 'Mystery rises every season' },
  lazy:       { entitlement: -0.3, label: 'the faithful expect less of you' },
  zealot:     { conv: 0.15, label: 'converts come a little easier' },
};
export const SAINT_FAITH = 2;
export const SAINT_PILGRIMS = 0.25;   // expected converts a season, per Saint: people come to see where it happened

export const WONDER = { faith: 15, conv: 3, mystery: 10, devotion: 0.5, entitlement: 2, legendSeasons: 8, legendFaith: 1.5 };

// The Holy Book: compiled at the first dawn from this season on with at least
// this many verses carved, or at the backstop season with any.
export const BOOK = { from: 18, verses: 6, backstop: 24, scribes: 2, faithPerChapter: 0.5, heresy: -0.5 };
