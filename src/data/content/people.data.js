// What the flock wants, how each trait does each office, and how each Witness
// tells each miracle. Logic-free. Every line is drawn once a playthrough at
// most (src/engine/deck.js).
//
// House rules (docs/WORLD.md section 6): invented gods only; warm, never
// cruel; and the author's "don't try too hard, it should be clever":
// understate, report the absurd flatly, no exclamation marks.
// Tokens: {name} the devotee, {god} the player's god, {rival}, {asked}.

// A want drives a devotee's prayers. `text` is the prayer; `answered` is what
// happens when you grant it. 30 wants; a playthrough uses about 20.
export const WANTS = [
  { id: 'ladder',   text: '{name} would like the ladder back from whoever has it. It has been since spring.', answered: 'The ladder has been returned. Nobody admits to having had it.' },
  { id: 'pig',      text: '{name} asks for a bigger pig. Not a different pig. This pig, bigger.', answered: 'The pig is bigger. {name} is delighted and has started asking about the sty.' },
  { id: 'rain',     text: '{name} asks for rain on the bean rows and on nothing else.', answered: 'It rained on the bean rows. The rest of the village noticed, and has views.' },
  { id: 'roofer',   text: '{name} asks for a husband who can mend a roof.', answered: 'A roofer from the next valley stopped to ask the way. He has not left.' },
  { id: 'serious',  text: '{name} would like, once, to be taken seriously at the parish meeting.', answered: '{name} spoke at the parish meeting and nobody laughed. They found it unsettling.' },
  { id: 'hens',     text: "{name}'s hens have stopped laying, and {name} would like to know why, in writing.", answered: 'The hens are laying again. No explanation was given, which {name} has put in writing.' },
  { id: 'back',     text: '{name} has a bad back and would like it to be somebody else’s.', answered: "{name}'s back is better. The neighbour has started walking with a stoop. It may be unrelated." },
  { id: 'marrow',   text: "{name} would like their marrow to win at the fair, and the other marrows not to.", answered: "{name}'s marrow won. Two others were found to be hollow. Nobody is pointing fingers." },
  { id: 'dog',      text: '{name} asks for one night’s sleep without the dog next door.', answered: 'The dog next door has gone quiet. Everyone is watching it.' },
  { id: 'letter',   text: '{name} asks that their son in the city would write. Even a short one.', answered: "A letter came from {name}'s son. It was short. It asked for money." },
  { id: 'pennies',  text: '{name} asks that the well stop tasting of pennies.', answered: 'The well tastes of water again. Some people preferred the pennies.' },
  { id: 'leak',     text: '{name} asks for the roof to stop leaking onto the good chair.', answered: 'The leak has moved off the good chair. It is now over the bed.' },
  { id: 'apology',  text: '{name} is owed an apology by a neighbour and would like it delivered.', answered: 'The apology was delivered. It was worse than the original remark.' },
  { id: 'hair',     text: '{name} asks for their hair back, as it was.', answered: "{name}'s hair has come back in a different colour. {name} has decided it is a sign." },
  { id: 'goat',     text: '{name} asks that the goat be calmer.', answered: 'The goat is calmer. It is unsettling everyone.' },
  { id: 'wedding',  text: '{name} asks for a dry day for their daughter’s wedding.', answered: 'The day was dry. The wedding has been put off for other reasons.' },
  { id: 'bench',    text: '{name} would like to be remembered after they are gone. They are not going anywhere; they are planning ahead.', answered: "{name}'s name has been carved on the bench by the pond, slightly wrong." },
  { id: 'key',      text: '{name} has lost a key and asks where it is. Not what it opens. They know that.', answered: 'The key was in the other coat.' },
  { id: 'hedge',    text: "{name} asks that the neighbour's hedge stop advancing.", answered: 'The hedge has stopped. It is thought to be considering its position.' },
  { id: 'tooth',    text: '{name} asks for the toothache to go, and soon.', answered: 'The toothache has gone, along with the tooth.' },
  { id: 'bees',     text: '{name} asks the bees to come back from wherever they have gone.', answered: 'The bees came back. They seem to have had a good time.' },
  { id: 'singing',  text: '{name} asks to sing better at the temple, or at least less noticeably.', answered: '{name} now sings less noticeably. Attendance is up.' },
  { id: 'dice',     text: '{name} asks for luck at dice. Thursdays only. They are not greedy.', answered: '{name} won on Thursday and lost it on Friday, which they feel was not in the arrangement.' },
  { id: 'crow',     text: '{name} asks to be rid of a crow that has taken against them personally.', answered: 'The crow has moved on to somebody else. {name} feels slightly passed over.' },
  { id: 'spoon',    text: '{name} would like their good spoon back from the alehouse.', answered: 'The spoon is back. It has been used for things.' },
  { id: 'lambs',    text: '{name} asks for twin lambs, or one large one.', answered: 'Twin lambs, both small. {name} has asked whether they can be combined.' },
  { id: 'bread',    text: "{name} asks for their bread to rise, once, the way it does for other people.", answered: 'The bread rose. {name} looked at it for a long time and then sold it.' },
  { id: 'boots',    text: '{name} asks for new boots before the wet weather.', answered: 'New boots were found on the road. Both are left boots. {name} is managing.' },
  { id: 'children', text: '{name} asks for one quiet afternoon from the children.', answered: 'The children were quiet all afternoon. {name} spent it wondering why.' },
  { id: 'supper',   text: '{name} did something at the harvest supper and would like it forgotten.', answered: 'Nobody remembers what {name} did at the harvest supper. {name} has started reminding people.' },
];

// The first season anyone of a trait works an office, the village notices how.
// Each line says what the trait does there, so the player learns the board by
// watching it. Keyed office:trait.
export const INCIDENTS = {
  'prophet:literalist': '{name} is your Prophet. They will hear exactly what you say and repeat it as if it were a contract.',
  'prophet:drunk':      '{name} is your Prophet. Everything you tell them will reach someone, eventually, in some form.',
  'prophet:ambitious':  '{name} is your Prophet, and has asked whether there is a title that goes with it.',
  'prophet:poet':       '{name} is your Prophet. Your words will never sound better. They will rarely sound the same.',
  'prophet:lazy':       '{name} is your Prophet. They will pass on the important parts, as they see them.',
  'prophet:zealot':     '{name} is your Prophet, and has already been asked to keep their voice down.',

  'preacher:literalist': '{name} read every Tablet aloud, in order, twice. Nobody misunderstood anything. Nobody felt much, either.',
  'preacher:drunk':      "{name}'s sermon wandered off in the middle and came back with a better ending. People enjoyed it. Some of it may have been Scripture.",
  'preacher:ambitious':  '{name} preached on generosity and took the collection personally. Faith is up. So is {name}’s house.',
  'preacher:poet':       '{name} preached for an hour on the sorrow of rivers. Nobody understood it, and several people want to hear it again.',
  'preacher:lazy':       '{name} preached for four minutes and let everyone go early. It is the most popular thing the temple has ever done.',
  'preacher:zealot':     "{name} preached on other people's failings. The faithful left very sure of themselves, and one or two did not come back.",

  'missionary:literalist': '{name} knocked on every door in the lane and read out the Tablets, word for word. One person converted, to make it stop, and has stayed out of principle.',
  'missionary:drunk':      '{name} did the rounds of the alehouse and came home with new believers, none of whom remember agreeing.',
  'missionary:ambitious':  '{name} brings people in. Afterwards they tend to describe themselves as followers of {name}.',
  'missionary:poet':       '{name} described you to the Unbothered so beautifully that they asked to hear it again. Few converted. The rest will, if only to hear how it ends.',
  'missionary:lazy':       "{name} does not go out much, but is on good terms with everyone, including {rival}'s missionary, who now also does not go out much.",
  'missionary:zealot':     '{name} explained to the Unbothered what would happen to them otherwise. Several were persuaded. {rival} has sent a note.',

  'collector:literalist': '{name} collected exactly what was owed and gave receipts. People thanked them, which has never happened to a collector before.',
  'collector:drunk':      '{name} came back from the rounds with a goose, a sack of turnips and nothing else. Some seasons will be better. Some will not.',
  'collector:ambitious':  '{name} collects more than anyone ever has. {name} also has a new hat.',
  'collector:poet':       '{name} asked for Offerings in verse. People gave a little, mostly out of politeness, and went away moved.',
  'collector:lazy':       '{name} collected from the two nearest houses and called it a round.',
  'collector:zealot':     '{name} collected twice what was due and reminded everyone about the pond. The box is full. The faithful are less so.',

  'builder:literalist': '{name} builds exactly what was drawn, to the inch, including the mistake in the drawing.',
  'builder:drunk':      "{name}'s work leans. It stands, and people come to look at it lean, which is more than most buildings manage.",
  'builder:ambitious':  "{name}'s work comes in larger and dearer than asked, with {name}'s name over the door in larger letters than yours.",
  'builder:poet':       '{name} makes very beautiful things. It is not always clear what they are for, and nobody likes to ask.',
  'builder:lazy':       '{name} builds at half the price and half the speed, and has been seen sitting on the materials.',
  'builder:zealot':     '{name} presses the neighbours into building. Things go up quickly. The neighbours go down.',

  'witness:literalist': '{name} is your Witness. Asked what they saw, they say exactly what they saw, which is the trouble with miracles.',
  'witness:drunk':      '{name} is your Witness. {name} has seen a great many things, not all of them on the day.',
  'witness:ambitious':  "{name} is your Witness, and begins every account with 'I was standing right there'.",
  'witness:poet':       '{name} is your Witness. Whatever you do will be told better than it happened.',
  'witness:lazy':       '{name} is your Witness, and will mention it to anyone who asks.',
  'witness:zealot':     '{name} is your Witness. Every miracle will be reported as a warning to somebody.',
};

// How a miracle is told, by who told it. Keyed reported-miracle:witness-trait
// ('none' when nobody was posted). {asked} is the miracle you actually worked,
// which a drunk Witness may not have reported.
export const LEGENDS = {
  'bounty:literalist': '{name} reported a harvest about a tenth above the usual, measured by the bushel. People were grateful, and a little bored.',
  'bounty:drunk':      'You worked a {asked}. {name} told everyone it was a bumper harvest, and the village has gone with {name}.',
  'bounty:ambitious':  '{name} tells the story of the harvest with {name} at the middle of the field, arms raised.',
  'bounty:poet':       '{name} called it the year the barley sang. Everyone now remembers it singing.',
  'bounty:lazy':       '{name} mentioned the good harvest to a few people. It was a good harvest. That was about it.',
  'bounty:zealot':     '{name} described the harvest as a reward for the obedient, and named some who were not.',
  'bounty:none':       'Nobody was posted to witness it. The harvest was good, and people put it down to the weather.',

  'sign:literalist': '{name} reported a light in the sky, north-north-east, lasting about as long as a short prayer. Very precise. Nobody felt anything.',
  'sign:drunk':      'You worked a {asked}. {name} saw the sign, and several others. The account now includes a second moon.',
  'sign:ambitious':  "{name} reports that the sign appeared directly over {name}'s house, which is true from where {name} was standing.",
  'sign:poet':       '{name} said the sky opened like a held breath. People who were indoors at the time now say they saw it.',
  'sign:lazy':       '{name} saw the sign and mentioned it to their wife.',
  'sign:zealot':     "{name} has explained the sign as a warning, and has a list of who it was for. Some of {rival}'s people have come over, to be safe.",
  'sign:none':       'Something happened in the sky. With nobody to say what, people decided it was weather.',

  'smite:literalist': "{name} reported that {rival}'s missionary was struck at noon, singed on the left eyebrow, and has gone home. All true. None of it memorable.",
  'smite:drunk':      "You worked a {asked}. {name} tells it as a duel. {rival}'s missionary tells it as being singed. Most people prefer {name}'s version.",
  'smite:ambitious':  '{name} says the bolt passed close enough to warm their ear, which is how {name} knows it was meant.',
  'smite:poet':       "{name} told the smiting as a tragedy. {rival}'s missionary has been sent flowers.",
  'smite:lazy':       '{name} heard about the smiting and passed it on.',
  'smite:zealot':     "{name} has described the smiting at every door, in detail. Business at {rival}'s temple is down.",
  'smite:none':       "{rival}'s missionary was singed. Nobody saw it but the missionary, who is not saying.",
};
