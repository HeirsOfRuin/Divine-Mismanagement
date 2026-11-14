// Problems brought to you, Pim's memos, the rival's doings, and the endings.
// Logic-free. Every line is drawn once a playthrough at most (deck.js).
// House rules: docs/WORLD.md section 6, including "clever, not trying".
// Tokens: {name} {trade} the devotee who brought it, {god}, {rival},
// {faith} this season's change in Faith, {min} the Registry's line.

// ---- rulings -------------------------------------------------------------------
// At most one a season, about half the seasons. `who` limits who can bring it.
// Effects are small on purpose: a ruling colours a season, it does not decide
// the game. souls take from or return to the Unbothered.
export const EVENTS = [
  { id: 'bell_rope', who: { trait: 'drunk' }, text: '{name} has sold the temple bell rope to a man from the next valley.', options: [
    { label: 'Buy it back', need: { offerings: 2 }, effects: { offerings: -2, devotion: 0.1 }, after: 'The rope is back. It is shorter than it was.' },
    { label: 'Let the bell be', effects: { mystery: 3 }, after: 'The bell is silent. People have started listening for it.' } ] },
  { id: 'pond', text: '{name} reports that the eel-catchers and the millers both claim the pond, and asks you to settle it.', options: [
    { label: 'The eel-catchers', effects: { devotion: 0.1, heresy: 1 }, after: 'The millers have taken it badly, which is how millers take things.' },
    { label: 'The millers', effects: { offerings: 2, devotion: -0.1 }, after: 'The eel-catchers have taken it quietly, which is worse.' },
    { label: 'Divide the pond', effects: { heresy: 0.5, mystery: 2 }, after: 'A rope has been stretched across the pond. The eels ignore it.' } ] },
  { id: 'old_shrine', text: '{name} has found a shrine to an archived god behind the barn, with fresh flowers on it.', options: [
    { label: 'Leave it', effects: { mystery: 3, heresy: 0.5 }, after: 'Nobody has said who brings the flowers. Somebody still does.' },
    { label: 'Take it down', effects: { heresy: -1, devotion: -0.1 }, after: 'The shrine is gone. The flowers turned up the next morning on the spot where it stood.' } ] },
  { id: 'robes', who: { trait: 'ambitious' }, text: '{name} would like special robes, at the temple’s expense, to show how close they are to you.', options: [
    { label: 'Allow it', need: { offerings: 2 }, effects: { offerings: -2, faith: 2, heresy: 1 }, after: '{name} looks magnificent. Several people now ask {name} to pray for them rather than doing it themselves.' },
    { label: 'Refuse', effects: { devotion: -0.1 }, after: '{name} has taken it well, in public.' } ] },
  { id: 'dice', who: { trait: 'zealot' }, text: "{name} wants to burn the alehouse's dice, as they are plainly against your teaching.", options: [
    { label: 'Let them', effects: { faith: 2, heresy: 1, devotion: -0.2 }, after: 'The dice are burnt. Dice are now played with knucklebones, which {name} has not heard about yet.' },
    { label: 'Forbid it', effects: { devotion: 0.1 }, after: '{name} has gone home to consider whether you meant it.' } ] },
  { id: 'feast_day', who: { trait: 'lazy' }, text: '{name} proposes a feast day in your honour, mainly so as to have the day off.', options: [
    { label: 'Grant it', need: { offerings: 1 }, effects: { devotion: 0.3, offerings: -1 }, after: 'The feast day went well. Nobody was sure what was being celebrated, and it did not slow anyone down.' },
    { label: 'Decline', effects: { mystery: 2 }, after: '{name} took the day off anyway, in a spirit of devotion.' } ] },
  { id: 'hymn', who: { trait: 'poet' }, text: '{name} has written you a hymn. It has forty verses.', options: [
    { label: 'Adopt it', effects: { mystery: 4, devotion: -0.1 }, after: 'The hymn is sung at every service. Verse twenty-three has been quietly dropped.' },
    { label: 'Ask for a shorter one', effects: { devotion: 0.1 }, after: '{name} has written a shorter one. It has thirty-nine verses.' } ] },
  { id: 'audit', who: { trait: 'literalist' }, text: '{name} has counted the Offerings, found them two short, and would like to know where they went.', options: [
    { label: 'Look into it', effects: { offerings: 2, heresy: -1, devotion: -0.1 }, after: 'The two Offerings were under the box. By then everyone had been suspected of something.' },
    { label: 'Let it go', effects: { heresy: 0.5 }, after: '{name} has let it go, and keeps a note of having let it go.' } ] },
  { id: 'missionary_supper', text: "{rival}'s missionary has been invited to supper by {name}'s family.", options: [
    { label: 'Let them', effects: { devotion: -0.1, souls: 1 }, after: 'The missionary talked about {rival} until the candles went out. A neighbour at the table found it so tiresome that she came over to you.' },
    { label: 'Forbid it', effects: { devotion: -0.1, mystery: 2 }, after: "{name}'s family ate alone and talked about you, quite warmly in the circumstances." } ] },
  { id: 'shoe', text: '{name} has dug up a very old shoe and believes it to be holy.', options: [
    { label: 'Declare it a relic', effects: { mystery: 5, heresy: 1 }, after: 'The shoe has a cushion now. People touch it for luck.' },
    { label: 'It is a shoe', effects: { heresy: -0.5, devotion: -0.1 }, after: '{name} has kept the shoe anyway.' } ] },
  { id: 'late_harvest', text: 'The harvest is late, and {name} asks whether you could do something.', options: [
    { label: 'Promise rain', effects: { faith: 3, mystery: -4 }, after: 'People are waiting for rain with the air of having been told.' },
    { label: 'Say nothing', effects: { mystery: 3, devotion: -0.1 }, after: 'The rain came when it came. People disagree about whether that was you.' } ] },
  { id: 'reeve', text: "The lord's reeve has come for a share of the Offerings. {name} has kept him talking.", options: [
    { label: 'Pay him', need: { offerings: 3 }, effects: { offerings: -3, devotion: 0.1 }, after: 'The reeve has gone. He took the good candlesticks too, as a courtesy.' },
    { label: 'Refuse', effects: { heresy: 1, faith: 2 }, after: 'The reeve has gone away to write to someone about it. It may take him years.' } ] },
  { id: 'twins', text: '{name} has had twins and would like to name one after you.', options: [
    { label: 'Accept', effects: { faith: 2, devotion: 0.1 }, after: 'The one named after you is the louder one.' },
    { label: 'Suggest another name', effects: { mystery: 2 }, after: 'They have named it after {rival}, to be fair to everyone.' } ] },
  { id: 'pilgrims', text: "Two pilgrims looking for {rival}'s temple have come to yours by mistake. {name} has given them soup.", options: [
    { label: 'Keep them', effects: { souls: 2, devotion: -0.1 }, after: 'They have stayed. They are not sure they are in the right place, but they like the soup.' },
    { label: 'Point the way', effects: { devotion: 0.1, mystery: 1 }, after: 'They have gone on to {rival}. They sent a card.' } ] },
  { id: 'front_bench', text: "There was a fight at the service over who sits nearest the front. {name}'s household started it.", options: [
    { label: 'Seat them apart', effects: { heresy: -0.5, devotion: -0.1 }, after: 'The households sit apart and glare across the aisle. Attendance is up.' },
    { label: 'Lengthen the front bench', need: { offerings: 2 }, effects: { offerings: -2, devotion: 0.2 }, after: 'The front bench now runs the length of the temple. People sit on the back of it.' } ] },
  { id: 'cheese', text: '{name} has found your face in a cheese.', options: [
    { label: 'Endorse the cheese', effects: { mystery: 3, faith: 2, heresy: 0.5 }, after: 'The cheese is on display. It is going off slowly and reverently.' },
    { label: 'Deny it', effects: { mystery: -2 }, after: '{name} has eaten the cheese, with regret.' } ] },
  { id: 'readings', needs: { tablets: 2 }, text: '{name} says people are reading the Tablets two different ways and asks which is right.', options: [
    { label: 'The older reading', effects: { heresy: -1.5, devotion: -0.1 }, after: 'The older reading stands. The other one is now read quietly at home.' },
    { label: 'Both readings', effects: { heresy: 1, devotion: 0.2 }, after: 'Both readings are right. People have taken this as permission for a third.' } ] },
  { id: 'gift_goat', text: '{name} wants to give you a goat.', options: [
    { label: 'Accept the goat', effects: { offerings: 2 }, after: 'The goat has eaten the altar cloth. The goat considers it a good omen.' },
    { label: 'Decline', effects: { devotion: -0.1, mystery: 1 }, after: '{name} has given the goat to {rival} instead.' } ] },
  { id: 'confession', text: '{name} has confessed to praying to {rival}, once, when it was raining.', options: [
    { label: 'Forgive', effects: { devotion: 0.2 }, after: '{name} is forgiven. It has rained since, and {name} has been very careful.' },
    { label: 'Make an example', effects: { heresy: -1, devotion: -0.2 }, after: 'Several others have since confessed to things nobody had asked about.' } ] },
  { id: 'standing_stone', text: '{name} wants to move the old standing stone, which is in the way of the new road.', options: [
    { label: 'Move it', effects: { offerings: 1, mystery: -3 }, after: 'The stone is moved. Nothing happened, which some people found worse.' },
    { label: 'Leave it', effects: { mystery: 2 }, after: 'The road now goes round the stone. The stone looks pleased about it.' } ] },
  { id: 'where_you_live', text: 'A child has asked {name} where you live, and {name} does not know.', options: [
    { label: 'In the clouds', effects: { faith: 1 }, after: 'The child has asked which one.' },
    { label: 'Everywhere', effects: { mystery: 2 }, after: 'The child has started checking cupboards.' },
    { label: 'Nowhere in particular', effects: { heresy: 1, mystery: 4 }, after: 'The child seemed satisfied. {name} has not slept.' } ] },
  { id: 'her_festival', text: "{rival} is holding a festival, and {name} asks whether the faithful may go, for the food.", options: [
    { label: 'Let them go', effects: { devotion: -0.2, offerings: 1 }, after: 'They went for the food. Most came back.' },
    { label: 'Hold a better supper', need: { offerings: 3 }, effects: { offerings: -3, devotion: 0.3 }, after: 'Your supper was better. {rival} sent round her leftovers, pointedly.' } ] },
  { id: 'prophet_asks', who: { office: 'prophet' }, text: '{name}, your Prophet, would like to know whether you have anything to say, as people keep asking.', options: [
    { label: 'Tell them to wait', effects: { mystery: 3, devotion: -0.1 }, after: '{name} has told them to wait. They are waiting with great dignity.' },
    { label: 'Let {name} improvise', effects: { faith: 2, heresy: 1 }, after: '{name} made something up. It is quite good. It may end up carved.' } ] },
  { id: 'inspector', text: 'An inspector from the Registry has come to count your faithful. {name} is showing him round.', options: [
    { label: 'Count honestly', effects: { heresy: -1 }, after: 'The inspector counted everyone twice and wrote down a third number.' },
    { label: 'Fill the temple for him', need: { offerings: 1 }, effects: { offerings: -1, faith: 3 }, after: 'The temple was full for the inspector. He noted that it was full, and that it was a Tuesday.' } ] },
];

// ---- Pim's memo ------------------------------------------------------------------
// One a season, chosen from the first situation that applies and still has an
// unused line. With every line used, the memo is left out: silence is not a repeat.
export const MEMOS = {
  first: [
    'Welcome to the Lower Annex. You have twelve believers. The Registry considers that a rounding error, but I have seen worse. Not much worse.',
  ],
  registry_warning: [
    'The Registry looked at your Faith at the year end and found it under {min}. This is a notice of concern. A second one is a notice of something else.',
    'Under the line at the year end. I have been asked to tell you that the Archive is very peaceful. I am telling you.',
    'The Registry would like to see more Faith by next year. They have not said how much more. They have said it in writing.',
  ],
  year_end: [
    'End of the year. The Registry asked for {min} and you had more. They did not say well done. They do not say that.',
    'Another year. The Registry’s minimum goes up each year, as minimums do.',
    'Year end. You cleared the line. I have filed it under Cleared The Line, which is a real drawer.',
    'The year is out. You are still on the books, which at this level is the main thing.',
    'Year end. The Registry has noted your continued existence and has no further comment at this time.',
  ],
  schism: [
    'Part of the flock has left over a point of doctrine. They took the good hymn book.',
    'A schism. I have seen gods survive worse. I have also seen them not.',
  ],
  miracle_again: [
    'Another one of those. They have stopped saying thank you and started saying "and another thing".',
    'The village has seen this miracle before. They were polite about it.',
    'They are getting used to miracles. That is the trouble with miracles.',
  ],
  miracle: [
    'A miracle. The Registry logs all miracles. I have logged it. It is in a drawer with the others.',
    'People are talking about you. That is the idea.',
    'Well done. Try not to make a habit of it; they will.',
  ],
  silent: [
    'You said nothing this season. They found it very moving.',
    'A quiet season. They are wondering what you are thinking. So am I.',
    'Nothing from you this season. Some of them took it as approval, which is the risk.',
    'Silence. The faithful have begun to fill it in for you.',
    'Another quiet one. I have marked you down as Contemplative, which is a real box.',
  ],
  verse: [
    'A new Tablet. The Registry asks me to remind you that Tablets are permanent. I have reminded you.',
    'Carved. I read it twice. I am not going to ask.',
    'Another verse. You will notice it is not quite what you said. That is normal. That is, in fact, the job.',
    'A new Tablet. It will outlive everyone who carved it, including, possibly, you.',
    'The stonemason asked me whether it was meant to say that. I said it was now.',
  ],
  dispute_won: [
    'Your Prophet won the argument in the market. The crowd followed the winner home, as crowds do.',
    'Another disputation won. Consistent Scripture is very persuasive. Nobody expected that, least of all me.',
  ],
  dispute_lost: [
    'Your Prophet lost the argument. It turns out people prefer Scripture that agrees with itself.',
    'Lost in the market. {rival}’s Prophet quoted your Tablets back at yours. Accurately, which hurt.',
  ],
  dispute_drawn: [
    'The disputation was a draw. Everybody went home certain they had won.',
  ],
  misquoted: [
    'A Tablet was misquoted from the pulpit, and the misquotation has stuck. I have amended the record. In pencil.',
    'Your preacher misremembered a verse in front of everyone. It is now the verse.',
  ],
  work_done: [
    'A new building. The Registry likes buildings. They are easy to count.',
    'Finished. It is roughly what you asked for, which by local standards is a triumph.',
    'The builders have finished and gone. One of them left his hat, which is now also a relic.',
  ],
  souls_lost: [
    'Some of the faithful have wandered off. Nobody saw them go, which is how it usually happens.',
    'Fewer of them this season. I counted twice and it was still fewer.',
    'You have lost people this season. Not dead. Just elsewhere.',
  ],
  souls_won: [
    'More souls this season. The Registry counts souls, not reasons.',
    'Newcomers. They sit at the back and look around a lot.',
    'The flock is growing. The temple will need more chairs, or fewer opinions.',
  ],
  entitled: [
    'They have started asking for things in a tone. I would hold off on the miracles for a while.',
    'The faithful now expect a miracle most weeks, and have begun to comment on the quality.',
  ],
  heresy_high: [
    'There is a good deal of disagreement about what you meant. I would not add to it.',
    'People are reading the Tablets against each other. Heresy is when that becomes a hobby.',
  ],
  rival_ahead: [
    '{rival} has more followers than you. She has also started saying so.',
    "{rival}'s temple has a queue. Yours has a draught.",
  ],
  faith_up: [
    'Faith is up {faith}. I would like to say it was something you did.',
    'Faith up {faith}. I have noted it, in case it becomes a pattern.',
    'Up {faith}. Not bad, for a season with that wind.',
    'Faith rose by {faith}. The Registry has been informed. It was not visibly moved.',
    'Up {faith} this season. Belief is a little like damp: it gets in everywhere if you leave it.',
    'Faith is up {faith}. Several people have said your name without being asked.',
    'Up {faith}. Somebody named a cow after you.',
  ],
  faith_down: [
    'Faith is down {faith}. These things go in seasons. This was one of them.',
    'Down {faith}. I checked the arithmetic. It is the Faith that is wrong, not the arithmetic.',
    'Faith down {faith}. Belief leaks. It is not personal.',
    'Faith fell by {faith}. People have a lot on. It is lambing.',
  ],
  quiet: [
    'Nothing to report. I have reported it.',
    'A season. Things happened in it, broadly as expected.',
    'Nothing much. Some of the best seasons are like that, and so are some of the worst.',
  ],
};

// ---- the rival ---------------------------------------------------------------------
export const RIVAL_LINES = {
  miracle: [
    '{rival} lit up the sky again. It was very well attended.',
    '{rival} worked a miracle this season and has had it painted.',
    "{rival}'s miracle was mostly lighting. It worked.",
    '{rival} made it rain on her own people only. It was a very small cloud, and a pointed one.',
  ],
  reveal: [
    '{rival} has carved a new verse. Her people got it wrong too. It is some comfort.',
    "{rival}'s newest Tablet says something about lamps. Nobody can agree what.",
    '{rival} has read your Scripture and called it brave.',
  ],
  answer: [
    '{rival} answered a prayer this season and made sure everyone heard about it.',
    '{rival} granted somebody a new hat. She is very good at hats.',
  ],
  festival: [
    '{rival} held a festival. There were banners, and banners about the banners.',
    "{rival}'s festival had a band. Yours, if you had one, would not.",
  ],
  dispute: [
    "{rival}'s Prophet argued with yours in the market. She has had the transcript copied out.",
  ],
  poach: [
    '{rival} answered a prayer that was addressed to you. She sent a note saying no hard feelings.',
  ],
  silent: [
    '{rival} was quiet this season. Pim understands she was having her portrait done.',
  ],
  gained: [
    '{rival} gained followers this season. She thanked them individually, by name, from a balcony.',
    'More people for {rival}. Her temple has a waiting list now, which she mentions.',
  ],
  absorb_offer: [
    "{rival} has written to offer you a place in her faith 'as a valued sub-brand'. Pim has filed the letter under No.",
    'She has asked whether you would consider a merger. She would be the larger partner. She was very nice about it.',
  ],
  falling: [
    "{rival}'s temple was half empty this season. She blamed the weather, and the weather blamed her.",
    "{rival} looks tired. Her halo has been seen at an angle.",
  ],
};

// ---- endings -------------------------------------------------------------------------
export const ENDINGS = {
  ascended: 'The Registry has reviewed your file and found nothing it can object to, which is the highest praise it gives. You are promoted. Pim has been reassigned to a new minor god and has sent you a form to sign.',
  rival_fell: "{rival}'s flock is gone, mostly to you. She has been taken into your faith as a minor saint, with a feast day nobody keeps. She sends a card every year.",
  passed_over: 'The Review is over. You did not fail, exactly, and you were not promoted, exactly. Your file has been moved to a slightly different drawer.',
  absorbed: '{rival} has the village. You have been taken into her faith as a minor saint of something small. Your feast day is a Tuesday.',
  forgotten: 'Two years under the Registry’s line. Your file has gone to the Archive, between a god of a river that moved and a god of a word nobody uses. It is quiet there. Nobody visits.',
};
