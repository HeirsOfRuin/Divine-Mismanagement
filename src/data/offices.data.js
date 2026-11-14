// The staffing board (docs/FRAME-management.md 1.2). Logic-free.
// The Prophet's column is the telephone (src/engine/telephone.js).
//
// What each office yields a season, by the holder's first trait:
//   faith, mystery, heresy, off (Offerings): added each season
//   dev: added to the flock's devotion
//   conv: expected converts a season
// Started from the kill-gate table; changes for faults 3 and 4 are marked.

export const OFFICES = {
  prophet:    { label: 'Prophet',    does: 'Hears your Revelations first.' },
  preacher:   { label: 'Preacher',   does: 'Keeps the flock believing.' },
  missionary: { label: 'Missionary', does: 'Brings in new souls.' },
  collector:  { label: 'Collector',  does: 'Gathers Offerings.' },
  builder:    { label: 'Builder',    does: 'Puts up Works.' },
  witness:    { label: 'Witness',    does: 'Reports your miracles.' },
};
export const OFFICE_IDS = Object.keys(OFFICES);

export const OFFICE = {
  preacher: {
    literalist: { faith: 2, mystery: -2, heresy: -2 },
    drunk:      { faith: 2, dev: 0.1, garble: 0.1 },   // garble: chance a Tablet is misquoted into an Oddity
    ambitious:  { faith: 4, off: -1, heresy: 1 },
    poet:       { faith: 0, mystery: 3 },
    lazy:       { faith: 1, dev: 0.15 },
    zealot:     { faith: 5, dev: -0.15, heresy: 0.5, leave: 0.1 },
  },
  missionary: {
    literalist: { conv: 0.4, dev: 0.05 },
    drunk:      { conv: 1.1, dev: -0.05, defect: 0.05 },
    ambitious:  { conv: 0.6, heresy: 0.5 },
    poet:       { conv: 0.3, charm: 1 },              // fault 3: was conv 0
    lazy:       { conv: 0.2, blunt: 0.5, guard: 0.5 }, // fault 3: was conv 0, no guard
    zealot:     { conv: 1.2, dev: -0.1, charm: -1 },
  },
  collector: {
    literalist: { off: 2 },
    drunk:      { offRange: [0, 5] },
    ambitious:  { off: 4, heresy: 0.3 },               // fault 3: was off 3, heresy 0.5
    poet:       { off: 1, mystery: 1 },
    lazy:       { off: 1 },
    zealot:     { off: 4, dev: -0.15 },
  },
  builder: {
    literalist: { progress: 1 },
    drunk:      { progress: 1, crooked: true },        // works at 75%, and is an Oddity: Mystery +5 once
    ambitious:  { progress: 1, costMult: 1.5, heresy: 0.5 },
    poet:       { progress: 1, useless: true },        // no function; Mystery +10 once
    lazy:       { progress: 0.5, costMult: 0.75 },
    zealot:     { progress: 2, devOnDone: -0.5 },
  },
};

// A miracle's worth, by who reports it. The report becomes a Legend, which
// keeps paying while it is told (fault 4: the Witness did not matter when a
// miracle was worth one season).
//   faith: share of the miracle's Faith; mystery: added once
//   legend: { faith, mystery, seasons } paid each season while it is told
export const WITNESS = {
  literalist: { faith: 1.0, mystery: -8,  legend: { faith: 0.5, mystery: 0, seasons: 3 } },
  drunk:      { faith: 0.8, mystery: -3,  legend: { faith: 0.5, mystery: 1, seasons: 4 }, swap: true },
  ambitious:  { faith: 0.6, mystery: -5,  legend: { faith: 1.0, mystery: 0, seasons: 4 }, heresy: 1, credit: true },
  poet:       { faith: 1.0, mystery: 4,   legend: { faith: 1.0, mystery: 1.5, seasons: 8 }, entitlement: 0.5 },
  lazy:       { faith: 0.4, mystery: 0,   legend: { faith: 0.3, mystery: 0.5, seasons: 2 } },
  zealot:     { faith: 1.0, mystery: -6,  legend: { faith: 0.5, mystery: 0, seasons: 3 }, alarm: 0.25 },
  none:       { faith: 0.5, mystery: -8,  legend: null },
};

export const MIRACLES = {
  bounty: { label: 'Bounty', does: 'A good harvest. Offerings and goodwill.', faith: 4, off: 4, dev: 0.3 },
  sign:   { label: 'Sign',   does: 'Something unmistakable in the sky. Converts.', faith: 6, conv: 1 },
  smite:  { label: 'Smiting', does: "Singes the rival's missionary. She loses two seasons of converts.", faith: 2, disable: 2 },
};

export const WORKS = {
  shrine:      { label: 'Shrine',      cost: 6, need: 3, does: 'Worship gives a quarter more Faith.' },
  bell:        { label: 'Bell',        cost: 5, need: 3, does: 'A Revelation reaches one more household.' },
  box:         { label: 'Offering Box', cost: 4, need: 2, does: 'One Offering a season with nobody collecting.' },
  feast_hall:  { label: 'Feast Hall',  cost: 8, need: 4, does: 'You can hold a festival.' },
  reliquary:   { label: 'Reliquary',   cost: 5, need: 3, does: 'Oddities cost nothing to keep and give half again the Mystery.' },
  guest_house: { label: 'Guest House', cost: 5, need: 3, does: 'Your souls are half as easy to poach.' },
};
export const WORK_IDS = Object.keys(WORKS);

// What an intact verse of each template does a season, at "should", for the
// faithful, heard by all four households (gate).
export const VERSE = {
  wash:    { dev: 0.1 },
  welcome: { convBonus: 0.5 },
  share:   { off: 1.5 },
  rest:    { dev: 0.05, faith: 2 },
  borrow:  { heresy: -1 },
  strength: { 1: 0.5, 2: 1, 3: 1.3, 4: 1.5 },
  scope:    { 1: 0.5, 2: 1, 3: 1.2, 4: 1.3 },
  oddMystery: 1.5, oddUpkeep: 0.5,
  fearDev: -0.1, fearHeresy: 0.2,
  riderOff: -0.5, riderHeresy: 0.35,      // an Ambitious clause: the speaker's following grows
  contradiction: 2,
  repeatShare: 0.3,
  doctrineFaith: 1,
};
