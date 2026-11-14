// The word blocks a Revelation is built from. Logic-free.
//
// A PHRASE is one piece of wording for a slot:
//   text    what is carved
//   noun    what the verse is named after if this phrase is the odd one
//   literal what a Literalist turns it into (optional)
//   after   the aftermath line when this phrase survives to the carving (optional)
//   litAfter  the aftermath when the literal form survives (optional)
// A base phrase also lists the phrases a Drunk may mishear it as (`drunk`) and
// the ones a Poet may reach for (`poet`).
//
// Tone rules: docs/WORLD.md section 6. Invented gods only; no real verse or
// commandment quoted or paraphrased; warm, never cruel; nobody suffers.
//
// Gate A holds these at about half the v0.1 target (WORLD.md section 7).

export const WHO = {
  1: 'the elders',
  2: 'the faithful',
  3: 'all',
  4: 'all, and their livestock,',
};

// strength 1-4. `lit` is the Literalist's reading of the same strength.
export const MODALS = {
  pos: { 1: 'may', 2: 'should', 3: 'must', 4: 'must always' },
  neg: { 1: 'need not', 2: 'should not', 3: 'must not', 4: 'must never' },
  posLit: {
    1: 'are permitted, but not obliged, to',
    2: 'are advised, though not ordered, to',
    3: 'must, in all weathers,',
    4: 'must always, in all weathers,',
  },
  negLit: {
    1: 'are not obliged to',
    2: 'are advised, though not ordered, not to',
    3: 'must not, in any weather,',
    4: 'must never, in any weather,',
  },
};

export const VERBS = {
  wash:    { text: 'wash', gerund: 'washing', drunk: ['watch', 'squash'] },
  watch:   { text: 'watch', gerund: 'watching', after: 'Nobody is sure what they are watching for. Attendance is excellent.' },
  squash:  { text: 'squash', gerund: 'squashing', after: 'There has been a great deal of squashing. Nobody has asked why.' },

  welcome: { text: 'welcome', gerund: 'welcoming', drunk: ['overcome', 'wheel_home'] },
  overcome:   { text: 'overcome', gerund: 'overcoming', after: 'Visitors are now wrestled to the ground, courteously.' },
  wheel_home: { text: 'wheel home', gerund: 'wheeling home', after: 'Visitors are met at the parish bounds with a barrow.' },

  share:   { text: 'share', gerund: 'sharing', drunk: ['shear', 'spare'] },
  shear:   { text: 'shear', gerund: 'shearing', after: 'It turns out most things can be sheared if you are devout enough.' },
  spare:   { text: 'spare', gerund: 'sparing', after: 'It has been spared. It was in no danger, but it has been spared.' },

  rest:    { text: 'rest', gerund: 'resting', drunk: ['wrestle', 'nest'] },
  wrestle: { text: 'wrestle', gerund: 'wrestling', after: 'Little Fretting now has a wrestling season. It is unexpectedly popular.' },
  nest:    { text: 'nest', gerund: 'nesting', after: 'Several families have moved into the elm.' },

  borrow:  { text: 'borrow', gerund: 'borrowing', drunk: ['bury', 'barrow'] },
  bury:    { text: 'bury', gerund: 'burying', after: 'Things are now buried only with permission. The queue is long.' },
  barrow:  { text: 'barrow', gerund: 'barrowing', after: 'Wheelbarrow use has become a matter of conscience.' },
};

export const PHRASES = {
  // ---- wash: objects
  hands: { text: 'their hands', noun: 'Hand', literal: 'each hand separately', drunk: ['hams', 'hens'], poet: ['labourers'] },
  hams:  { text: 'their hams', noun: 'Ham', literal: 'every ham in the house', after: 'Every ham in Little Fretting is now spotless. Hands are as they were.' },
  hens:  { text: 'their hens', noun: 'Hen', literal: 'each hen individually', after: 'The hens are furious and very clean.' },
  labourers: { text: 'the ten small labourers', noun: 'Ten Labourers', literal: 'ten small labourers (to be hired for the purpose)',
    after: 'Nobody knows who the ten small labourers are. Everyone has washed something, to be safe.',
    litAfter: 'Ten small labourers have been advertised for. Two have applied. One is a child in a hat.' },

  feet:  { text: 'their feet', noun: 'Foot', literal: 'each foot (left first)', drunk: ['beets', 'sheets'], poet: ['twins'] },
  beets: { text: 'their beets', noun: 'Beet', after: 'The beet crop has never been cleaner.' },
  sheets: { text: 'their sheets', noun: 'Sheet', after: 'Every line in the village is hung with sheets. It looks like a surrender.' },
  twins: { text: 'the humble twins', noun: 'Humble Twins', literal: 'any humble twins in the parish',
    after: 'The village has one pair of twins. They are getting a great deal of attention and are no longer humble.' },

  children: { text: 'the children', noun: 'Child', literal: "every child (including other people's)", drunk: ['chickens'], poet: ['blessings'] },
  chickens: { text: 'the chickens', noun: 'Chicken', after: 'The chickens were not asked.' },
  blessings: { text: 'the small loud blessings', noun: 'Loud Blessings', literal: 'anything small and loud',
    after: 'It is unclear which blessings are meant. The children have hidden, in case.',
    litAfter: 'The bell, two geese and somebody’s nephew have all been seen to.' },

  // ---- wash: tails
  before_meals: { text: 'before meals', noun: 'Meal', literal: 'immediately before every meal, including snacks', drunk: ['before_eels', 'before_seals', 'before_wheels'],
    litAfter: 'Eating an apple now takes two trips to the well.' },
  before_eels:  { text: 'before eels', noun: 'Eel', literal: 'in front of an eel', after: 'An eel is now kept in a tub by the temple door so that it can be done in front of it.' },
  before_seals: { text: 'before seals', noun: 'Seal', after: 'Nobody in Little Fretting has seen a seal. The matter is suspended until one turns up.' },
  before_wheels: { text: 'before wheels', noun: 'Wheel', literal: 'in front of a wheel', after: 'The cart is now parked by the well and treated with caution.' },

  every_morning: { text: 'every morning', noun: 'Morning', literal: 'every morning, at the first moment of it', drunk: ['every_mourning', 'every_warning'],
    litAfter: 'There is a dispute about when morning starts. A cockerel has been appointed.' },
  every_mourning: { text: 'every mourning', noun: 'Mourning', after: 'Funerals now begin with it. The bereaved say it helps.' },
  every_warning: { text: 'every warning', noun: 'Warning', after: 'Shouting "look out" in Little Fretting now sets the whole village to it.' },

  after_pigs: { text: 'after handling the pigs', noun: 'Pig', literal: 'after each pig, individually', drunk: ['after_figs', 'after_wigs'],
    litAfter: 'The swineherd has not got past the third pig all week.' },
  after_figs: { text: 'after handling the figs', noun: 'Fig', after: 'There are no figs in Little Fretting. The verse is considered a prophecy.' },
  after_wigs: { text: 'after handling the wigs', noun: 'Wig', after: 'The village owns one wig. It is now kept under guard.' },

  // ---- welcome: objects
  strangers: { text: 'strangers', noun: 'Stranger', literal: 'anyone they cannot name', drunk: ['rangers', 'mangers'], poet: ['loaf'],
    litAfter: 'Old Tam, who forgets names, now applies it to his own family.' },
  rangers: { text: 'rangers', noun: 'Ranger', after: 'A man who once walked to the next valley has been declared a ranger and is worn out by the attention.' },
  mangers: { text: 'mangers', noun: 'Manger', after: 'Every feeding trough in the parish has been attended to personally.' },
  loaf: { text: 'every stranger like a warm loaf', noun: 'Loaf', literal: 'every stranger exactly as they would a warm loaf',
    after: 'Strangers report being held, admired and sniffed.',
    litAfter: "Vellamine's missionary was buttered on arrival and has asked to be reassigned." },

  travellers: { text: 'travellers', noun: 'Traveller', literal: 'anyone seen walking', drunk: ['grovellers'], poet: ['dustfoot'],
    litAfter: 'A woman fetching water was ambushed three times before the well.' },
  grovellers: { text: 'grovellers', noun: 'Groveller', after: 'People have taken up grovelling. It works.' },
  dustfoot: { text: 'the dust-footed', noun: 'Dusty Feet', literal: 'anyone with dusty feet', after: 'Feet are inspected at the parish bounds. Nearly everyone qualifies.' },

  neighbours: { text: 'the neighbours', noun: 'Neighbour', literal: 'persons living within one fence of them', drunk: ['naysayers'],
    litAfter: 'Several fences have been moved in the night.' },
  naysayers: { text: 'the naysayers', noun: 'Naysayer', after: 'Complaining is now the surest way to get attention in Little Fretting. More than before, that is.' },

  // ---- welcome: tails
  with_kindness: { text: 'with kindness', noun: 'Kindness', literal: 'with kindness (a smile of no fewer than three teeth)', drunk: ['with_blindness'],
    litAfter: 'Teeth are being counted. Old Tam is exempt.' },
  with_blindness: { text: 'with blindness', noun: 'Blindfold', literal: 'with their eyes shut', after: 'It is done eyes shut. There have been collisions, and one cow has been included by mistake.' },

  warm_meal: { text: 'with a warm meal', noun: 'Warm Meal', literal: 'with a meal of the correct warmth', drunk: ['warm_eel', 'worm_meal'],
    litAfter: 'Nobody knows the correct warmth. A thumb is used.' },
  warm_eel:  { text: 'with a warm eel', noun: 'Warm Eel', after: 'The eel-catchers cannot believe their luck.' },
  worm_meal: { text: 'with a worm meal', noun: 'Worm Meal', literal: 'with a meal of worms', after: 'Visitors have stopped coming. The Unbothered count this a success.' },

  at_door: { text: 'at the door', noun: 'Door', literal: 'at the door, and no further in', drunk: ['at_boar'],
    litAfter: 'Guests stand on the step in all weathers. The doorways are very sociable.' },
  at_boar: { text: 'at the boar', noun: 'Boar', after: "It all takes place beside the miller's boar, who was not consulted." },

  // ---- share: objects
  bread: { text: 'their bread', noun: 'Bread', literal: 'exactly half their bread', drunk: ['beards', 'beds'], poet: ['oven_gold'],
    litAfter: 'Loaves are measured with string. Arguments about crust are ongoing.' },
  beards: { text: 'their beards', noun: 'Beard', after: 'Beards are now held in common. There is a rota.' },
  beds: { text: 'their beds', noun: 'Bed', after: 'Sleeping arrangements in Little Fretting have become complicated.' },
  oven_gold: { text: 'the gold of the oven', noun: 'Oven Gold', literal: 'baked gold',
    after: 'Everyone agrees it is a lovely phrase. Nobody has handed over any bread.',
    litAfter: 'Three ovens have been ruined looking for it.' },

  harvest: { text: 'their harvest', noun: 'Harvest', literal: 'exactly half the harvest counted by the grain', drunk: ['harness'], poet: ['summer_wages'],
    litAfter: 'The count began in autumn. They are on the second sack.' },
  harness: { text: 'their harness', noun: 'Harness', after: 'One harness is being passed solemnly from house to house.' },
  summer_wages: { text: "summer's wages", noun: "Summer's Wages", literal: 'all wages earned in summer',
    after: 'Whatever it means, people have become vague about what they earned in summer.' },

  ale: { text: 'their ale', noun: 'Ale', literal: 'their ale to the last drop', drunk: ['owl', 'ails'], poet: ['barley_sigh'],
    litAfter: 'A dropper has been made. Evenings are slow.' },
  owl: { text: 'their owl', noun: 'Owl', after: 'The village has one owl. It is passed along on Tuesdays and resents it.' },
  ails: { text: 'their ails', noun: 'Ailment', literal: 'their ailments', after: 'Colds are now given away freely, as commanded.' },
  barley_sigh: { text: "the barley's sigh", noun: "Barley's Sigh", literal: 'a sigh',
    after: 'People stand in the barley and listen. It is thought to be going well.',
    litAfter: 'Everyone sighs at their neighbour once a day. It is surprisingly bonding.' },

  // ---- share: tails
  with_hungry: { text: 'with the hungry', noun: 'Hungry', literal: 'with whoever is hungriest at the time, to be settled by a show of ribs', drunk: ['with_angry'],
    litAfter: 'The show of ribs is held on Fridays. It draws a crowd.' },
  with_angry: { text: 'with the angry', noun: 'Angry', after: 'Losing your temper is now the surest way to be given things.' },

  with_poor: { text: 'with the poor', noun: 'Poor', literal: 'with the poor, in order of poverty', drunk: ['with_boar', 'with_moor'],
    litAfter: 'A ranking of the poor has been drawn up. Nobody is pleased with their place in it.' },
  with_boar: { text: 'with the boar', noun: 'Boar', after: 'The boar has never done so well and has begun to expect it.' },
  with_moor: { text: 'with the moor', noun: 'Moor', literal: 'with the moor itself', after: 'It is left out on the moor each evening. Something up there is getting fat.' },

  with_neighbours: { text: 'with their neighbours', noun: 'Neighbour', literal: 'with the neighbour on each side, equally', drunk: ['with_naysayers'],
    litAfter: 'The house at the end of the lane, having one neighbour, has asked for a ruling.' },
  with_naysayers: { text: 'with their naysayers', noun: 'Naysayer', after: 'Everyone has been asked to name their naysayers. The lists are long and overlap.' },

  // ---- rest: tails (rest has no object)
  after_harvest: { text: 'after the harvest', noun: 'Harvest', literal: 'immediately after the harvest, where they stand', drunk: ['after_hardest', 'after_farthest'],
    litAfter: 'The village spent the night in the barley, where it stood. Three colds.' },
  after_hardest: { text: 'after the hardest', noun: 'Hardest', after: 'Nobody can agree which was the hardest, so nobody has started.' },
  after_farthest: { text: 'after the farthest', noun: 'Farthest', literal: 'once the farthest of them has arrived', after: 'They are waiting on Old Tam, who walks slowly on purpose.' },

  midday: { text: 'at midday', noun: 'Midday', literal: 'at exactly midday, mid-step if need be', drunk: ['mid_hay'],
    litAfter: 'At noon the whole village stops where it is. A ladder was involved.' },
  mid_hay: { text: 'at mid-hay', noun: 'Mid-Hay', literal: 'halfway through the hay', after: 'Haymaking stops at the exact middle. Finding the middle takes most of a day.' },

  work_done: { text: 'when the work is done', noun: 'Work', literal: 'only once all work everywhere is done', drunk: ['cork_done'],
    litAfter: 'Nobody has begun. They are waiting on news from abroad.' },
  cork_done: { text: 'when the cork is done', noun: 'Cork', after: 'It begins when the barrel is empty, which gives everyone something to work towards.' },

  // ---- borrow: objects
  tools: { text: 'tools', noun: 'Tool', literal: 'tools (a list is appended, and is incomplete)', drunk: ['stools', 'fools', 'mules'], poet: ['iron_children'],
    litAfter: 'The list of tools leaves off the spade. The spade is now beyond the law.' },
  stools: { text: 'stools', noun: 'Stool', after: 'Sitting down has become a legal question.' },
  fools: { text: 'fools', noun: 'Fool', after: 'This has made things awkward, since nobody knows who is meant.' },
  mules: { text: 'mules', noun: 'Mule', after: 'The village has one mule, and it has never been so respected.' },
  iron_children: { text: 'the iron children of toil', noun: 'Iron Children', literal: 'iron children',
    after: 'The smith believes it is about him and has become unbearable.',
    litAfter: 'A search for the iron children continues. The smith is being watched.' },

  ladders: { text: 'ladders', noun: 'Ladder', literal: 'ladders of any height (stairs included)', drunk: ['adders', 'bladders'], poet: ['poor_stairs'],
    litAfter: 'Going upstairs in another man’s house now needs a witness.' },
  adders: { text: 'adders', noun: 'Adder', after: 'Nobody had thought of it before. People have now started, to see what the fuss is about.' },
  bladders: { text: 'bladders', noun: 'Bladder', after: 'The less said the better. Doctrine is doctrine.' },
  poor_stairs: { text: 'the stairways of the poor', noun: 'Poor Stairs', literal: "poor people's stairs",
    after: 'The poor have been asked to guard their stairs. Most of them have a ladder.' },

  goat: { text: "a neighbour's goat", noun: 'Goat', literal: "a neighbour's goat (or any part of one)", drunk: ['coat', 'boat'], poet: ['bearded_neighbour'],
    litAfter: 'A man who borrowed some milk has turned himself in.' },
  coat: { text: "a neighbour's coat", noun: 'Coat', after: "Coats are now nailed to their owners' doors for safety." },
  boat: { text: "a neighbour's boat", noun: 'Boat', after: 'There is one boat. It is on the pond. It is now sacred.' },
  bearded_neighbour: { text: 'the bearded neighbour', noun: 'Bearded Neighbour', literal: 'any neighbour with a beard',
    after: 'The clean-shaven feel left out of it, whatever it is.' },

  // ---- borrow: tails
  without_asking: { text: 'without asking', noun: 'Asking', literal: 'without asking in writing', drunk: ['without_basking', 'without_masking'],
    litAfter: 'Four people in the village can write. They are very busy and have put their prices up.' },
  without_basking: { text: 'without basking', noun: 'Basking', literal: 'without first lying in the sun', after: 'It now needs an hour in the sun beforehand. Winter business has collapsed.' },
  without_masking: { text: 'without masking', noun: 'Mask', literal: 'without wearing a mask', after: 'People now turn up masked. It has not made anyone feel safer.' },

  after_dark: { text: 'after dark', noun: 'Dark', literal: 'after dark, as judged against the darkest night on record', drunk: ['after_bark', 'after_lark'],
    litAfter: 'It has not been dark enough since. People do as they like until midnight.' },
  after_bark: { text: 'after bark', noun: 'Bark', literal: 'after a dog has barked', after: 'Everything stops when a dog barks. The dogs have noticed.' },
  after_lark: { text: 'after lark', noun: 'Lark', literal: 'once a lark has sung', after: 'Mornings are spent listening for larks.' },

  // ---- the Poet's all-purpose endings (may replace or add any tail)
  ripe_moon: { text: 'when the moon is ripe', noun: 'Ripe Moon', literal: 'when the moon is ripe, which is to be checked nightly',
    after: 'Nobody knows when the moon is ripe. It is done whenever someone feels it might be.',
    litAfter: 'A moon-ripeness committee meets nightly. It has not yet said yes.' },
  lark_complaint: { text: 'ere the lark has filed her complaint', noun: "Lark's Complaint", literal: 'before any lark complains',
    after: 'It is done very early, and resentfully.',
    litAfter: 'Larks are shooed off at dawn, to be on the safe side.' },
  believing_dew: { text: 'while the dew still believes', noun: 'Believing Dew', literal: 'while the dew is still devout',
    after: 'It is done at dawn, in wet shoes.',
    litAfter: 'The dew is questioned each morning. It has not answered.' },
  soft_regrets: { text: 'in the hour of soft regrets', noun: 'Hour of Regrets', literal: 'during the Hour of Regrets, to be held daily',
    after: 'Most people have taken this to mean just after supper.',
    litAfter: 'The Hour of Regrets is well attended. People bring a list.' },
  forgiving_river: { text: 'as the river forgives the stone', noun: 'Forgiving River', literal: 'in the river, beside a stone',
    after: 'It is now done slowly, and with a faraway look.',
    litAfter: 'It is now done standing in the river. Attendance drops in winter.' },
  patient_elm: { text: 'beneath the patient elm', noun: 'Patient Elm', literal: 'under the elm, and only that elm',
    after: 'The elm has become popular.',
    litAfter: 'There is a queue for the elm.' },
};

export const POET_TAILS = ['ripe_moon', 'lark_complaint', 'believing_dew', 'soft_regrets', 'forgiving_river', 'patient_elm'];

// Five Revelation templates (the brief's v0.1 minimum). `who`, `strength` and
// `neg` are the defaults; the player may swap `objects` and `tails`.
export const TEMPLATES = [
  { id: 'wash',    problem: 'Sickness',  verb: 'wash',    who: 2, strength: 2, neg: false, objects: ['hands', 'feet', 'children'],     tails: ['before_meals', 'every_morning', 'after_pigs'] },
  { id: 'welcome', problem: 'Suspicion', verb: 'welcome', who: 2, strength: 2, neg: false, objects: ['strangers', 'travellers', 'neighbours'], tails: ['with_kindness', 'warm_meal', 'at_door'] },
  { id: 'share',   problem: 'Hunger',    verb: 'share',   who: 2, strength: 2, neg: false, objects: ['bread', 'harvest', 'ale'],       tails: ['with_hungry', 'with_poor', 'with_neighbours'] },
  { id: 'rest',    problem: 'Overwork',  verb: 'rest',    who: 2, strength: 1, neg: false, objects: [],                                tails: ['after_harvest', 'midday', 'work_done'] },
  { id: 'borrow',  problem: 'Quarrels',  verb: 'borrow',  who: 2, strength: 2, neg: true,  objects: ['tools', 'ladders', 'goat'],      tails: ['without_asking', 'after_dark'] },
];
