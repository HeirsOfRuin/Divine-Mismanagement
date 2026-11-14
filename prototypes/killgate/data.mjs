// Gate B: every tunable number in the kill-gate model. All of these are
// guesses made to be broken (docs/KILLGATE.md says which survived).
// The trait-by-office table is docs/FRAME-management.md section 1.2 as numbers.

export const CFG = {
  seasons: 30,
  acts: 2,                 // divine acts a season
  village: 36,
  start: { souls: 12, faith: 10, power: 3, mystery: 50, offerings: 3, devotion: 5 },
  faithPerSoul: 0.3,       // at devotion 5 and mystery 50
  faithDecay: 0.1,
  powerBase: 1, powerPerFaithIncome: 0.25, powerCap: 12,
  mysterySilence: 3,       // a season with no act
  mysteryPull: 0.08,       // each season Mystery moves this share of the way back to 50
  neglectDev: -0.1,
  mysteryPerAct: -2,       // being present is the opposite of being mysterious
  devotionPull: 0.15,      // each season devotion moves this share of the way back to 5        // a silent season: they wonder if anyone is there
  entitlementDecay: 0.3, entitlementLine: 3,
  heresyDecay: 1.5, schismAt: 10, schismLoss: 3,
  leakBelow: 4, leakRate: 0.4,      // souls lost a season per point of devotion under the line
  drawAbove: 7, drawRate: 0.2,
  fallBelow: 4, fallSeasons: 2,     // a god with under 4 souls for 2 seasons falls
  forgottenSeasons: 3,
  review: { faith: 110, souls: 19, heresy: 8, doctrine: 3 },   // doctrine: Tablets in force that do some good
  tablets: 7,
  poachFactor: 0.5,        // converting a rival's soul is half as easy as an Unbothered one
  costs: { link: 1, bounty: 3, sign: 4, smite: 3, answer: 1, poach: 3, dream: 1, festival: 4 },
};

// What each office yields a season, by the holder's trait.
//   faith, mystery, heresy, off (Offerings): added
//   dev: added to the flock's devotion
//   conv: expected converts
export const OFFICE = {
  preacher: {
    literalist: { faith: 2, mystery: -2, heresy: -2 },
    drunk:      { faith: 2, dev: 0.1, garble: 0.1 },        // garble: chance a Tablet is misquoted into an Oddity
    ambitious:  { faith: 4, off: -1, heresy: 1 },
    poet:       { faith: 0, mystery: 3 },
    lazy:       { faith: 1, dev: 0.15 },
    zealot:     { faith: 5, dev: -0.15, heresy: 0.5, leave: 0.1 },
  },
  missionary: {
    literalist: { conv: 0.4, dev: 0.05 },
    drunk:      { conv: 1.0, dev: -0.05, defect: 0.05 },
    ambitious:  { conv: 0.7, heresy: 0.5 },
    poet:       { conv: 0, charm: 1 },
    lazy:       { conv: 0, blunt: 0.5 },                    // the rival's missionary does half as well
    zealot:     { conv: 1.2, dev: -0.1, charm: -1 },
  },
  collector: {
    literalist: { off: 2 },
    drunk:      { offRange: [0, 5] },
    ambitious:  { off: 3, heresy: 0.5 },
    poet:       { off: 1, mystery: 1 },
    lazy:       { off: 1 },
    zealot:     { off: 4, dev: -0.15 },
  },
  builder: {
    literalist: { progress: 1 },
    drunk:      { progress: 1, crooked: true },             // works at 75%, and is an Oddity: Mystery +5 once
    ambitious:  { progress: 1, costMult: 1.5, heresy: 0.5 },
    poet:       { progress: 1, useless: true },             // no function; Mystery +10 once
    lazy:       { progress: 0.5, costMult: 0.75 },
    zealot:     { progress: 2, devOnDone: -0.5 },
  },
  // A miracle's worth, by who reports it.
  witness: {
    literalist: { faith: 1.0, mystery: -15 },
    drunk:      { faith: 0.8, mystery: -5, swap: true },    // reports a different miracle
    ambitious:  { faith: 0.5, mystery: -8, heresy: 1 },
    poet:       { faith: 1.0, mystery: 2, entitlement: 2 },
    lazy:       { faith: 0.3, mystery: 0 },
    zealot:     { faith: 1.3, mystery: -10, alarm: 0.5 },   // alarm: expected souls frightened over from the rival
    none:       { faith: 0.6, mystery: -10 },
  },
};

export const MIRACLES = {
  bounty: { faith: 4, off: 4, dev: 0.3 },
  sign:   { faith: 6, conv: 1 },
  smite:  { faith: 2, disable: 2 },                         // the rival's missionary is out for two seasons
};

export const WORKS = {
  shrine:     { cost: 6, need: 3 },   // Faith from worship x1.25
  bell:       { cost: 5, need: 3 },   // a Revelation reaches one more household
  box:        { cost: 4, need: 2 },   // Offerings +1 a season
  feast_hall: { cost: 8, need: 4 },   // allows a festival
  reliquary:  { cost: 5, need: 3 },   // Oddities cost no upkeep and give half again the Mystery
  guest_house:{ cost: 5, need: 3 },   // souls are half as easy to poach
};

// What an intact verse of each template does a season, at "should", for the
// faithful, heard by all four households.
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
  riderOff: -0.5, riderHeresy: 0.2,
  contradiction: 2,
  repeatShare: 0.3,       // a second verse on the same matter adds this much of its benefit
  doctrineFaith: 1,
};
