// Story Chapter 1: the backstory, the cast, the scenes, the ending, and the
// Book's voice. Logic-free. docs/FRAME-story.md is the design; this is the
// calibration set the author will judge before the rest is written.
// House rules: docs/WORLD.md section 6, and "don't try too hard, it should be
// clever". Tokens: {god} your name, {short} your domain, {rival}, and cast
// names are fixed. Every line here is shown once a game, by construction.

// The four fixed members of your flock in Story mode, replacing four of the
// twelve generated. Household, trade and trait are fixed; so is their part.
export const CAST = {
  odo:    { name: 'Odo',    trade: 'miller',    trait: 'literalist', household: 0, slot: 0, known: true },
  brenna: { name: 'Brenna', trade: 'alewife',   trait: 'drunk',      household: 1, slot: 3 },
  aldous: { name: 'Aldous', trade: 'clerk',     trait: 'ambitious',  household: 2, slot: 6 },
  hesper: { name: 'Hesper', trade: 'beekeeper', trait: 'poet',       household: 3, slot: 9 },
};
export const RIVAL_PRIEST = 'Gisla';

// A scene: pages of text, then choices. `when` is the season it can happen
// from; `requires` a flag it needs; `who` the portraits. A choice may set
// flags, change meters (effects), or apply a named consequence (do).
// Scenes without choices end with a single Continue.
export const SCENES = [
  {
    id: 'prologue', when: 1, title: 'Before', who: ['you', 'pim'],
    pages: [
      'Until last spring you were the God of Thresholds. Doors, gates, stiles, the moment before a decision. A respectable middle-sized god, with a temple in two market towns and a feast day people actually kept.',
      'Then the Registry re-filed everything. Your form went through three clerks. The first wrote "Thresholds That Stick". The second tidied that to "Doors That Stick". The third, who liked things short, struck out both your temples as a duplicate entry.',
      'Your old desk in the Middle Heavens went to a newcomer called Vellamine, Goddess of Being Noticed, who had applied for something else and did not complain. You were sent down to the Lower Annex, given a desk with a wobble and twelve believers in a village called Little Fretting, and assigned a caseworker.',
      'The caseworker is Pim, seraph third class, who copied your form. Pim is very sorry. Pim has found the appeal procedure: at the Review, seven years from now, the Registry will hear your case, if you can show it a religion worth correcting a file for. Pim has put the forms in order. There are a great many forms.',
      'The Registry has you down as {god}. Little Fretting has never heard of you. One of them, a miller called Odo, has been praying at the old standing stone, because the stone used to belong to somebody and he thought it worth a try.',
    ],
    choices: [{ id: 'begin', label: 'Begin' }],
  },
  {
    id: 'stone', when: 1, title: 'Is anyone there?', who: ['odo'],
    pages: [
      'Odo the Miller kneels at the old stone with his cap in his hands. "I don\'t know who\'s listening," he says. "This used to be somebody\'s. If it\'s you now: the mill wheel sticks. It has stuck since Lammas. I have tried fat and I have tried shouting."',
      'Odo is the only person in Little Fretting who is praying to you, and he is not sure he is.',
    ],
    choices: [
      { id: 'unstick', label: 'Unstick the mill wheel', note: '1 Power. Odo believes.', effects: { power: -1, faith: 3, devotion: 0.2 }, flag: { stone: 'unstick' },
        after: 'The wheel turns. Odo stands very still, then goes to tell everyone, and is precise about it: the wheel, the time, the noise it made. He has decided you are real, and he is going to do exactly what you say.' },
      { id: 'silent', label: 'Say nothing', note: 'Mystery rises.', effects: { mystery: 4 }, flag: { stone: 'silent' },
        after: 'Odo waits until dark and goes home. He comes back the next morning. Not answering, it turns out, is also an answer, and Odo has written it down.' },
      { id: 'door', label: 'Make his door stick as well', note: 'It is, after all, your domain.', effects: { mystery: 2, faith: 1 }, flag: { stone: 'door' },
        after: 'Odo\'s front door sticks that evening and will not open. He climbs out of the window, looks at the door for a long time, and understands that he has been heard. He has not used the door since. He uses it as an altar.' },
    ],
  },
  {
    id: 'corridor', when: 3, title: 'The corridor', who: ['you', 'vellamine'],
    pages: [
      'You are in the Middle Heavens on Registry business, which means waiting in a corridor. Vellamine comes the other way carrying a box. In the box are your old things: the brass threshold plate, the good pen, a postcard from a market town that kept your feast.',
      '"Oh," she says. "These were in the desk. I wasn\'t sure where to send them." She is very good at being noticed, and is being noticed now, by you, and does not seem to mind.',
    ],
    choices: [
      { id: 'ask', label: 'Ask for your things back', flag: { corridor: 'ask' }, effects: { faith: 2 },
        after: 'She hands you the box at once, which is worse than if she had refused. "Good luck down there," she says, and means it, which is also worse.' },
      { id: 'blank', label: 'Pretend not to know her', flag: { corridor: 'blank' }, effects: { mystery: 3 },
        after: 'You look straight through her. She stands in the corridor holding your postcard. Later you hear she kept it, and that she reads it sometimes.' },
      { id: 'congratulate', label: 'Congratulate her on the promotion', flag: { corridor: 'congratulate' }, effects: { devotion: 0.1 },
        after: '"It wasn\'t a promotion," she says. "I applied for Goddess of Being Noted. Somebody tidied it." For a moment you are two gods in a corridor with the same clerk. Then her name is called, and she goes in.' },
    ],
  },
  {
    id: 'committee', when: 5, title: 'A committee', who: ['aldous'],
    pages: [
      'Aldous the Clerk has asked to see you, which in practice means he has knelt at the stone with a folder. "Things are being misunderstood," he says. "Your words are passed from one person to the next and arrive changed. I have a proposal."',
      '"A Committee for the Correct Understanding of Revelations. Everything you say is brought to the Committee, which decides what you meant. I would be willing to chair it. I have already had the minutes book bound."',
    ],
    choices: [
      { id: 'aldous', label: 'Let him chair it', note: 'Heresy falls every season. The Committee costs Offerings.', flag: { committee: 'aldous' },
        after: 'Aldous chairs the first meeting that evening. It runs until midnight. Heresy is down. So, slightly, is everyone.' },
      { id: 'refuse', label: 'Refuse', note: 'Aldous will not take this well.', flag: { committee: 'none' }, effects: { devotion: -0.1 },
        after: 'Aldous closes the folder very carefully. "Of course," he says. "Of course." He has the minutes book under his arm as he goes, and he does not throw it away.' },
      { id: 'odo', label: 'Let Odo chair it', note: 'Heresy falls a little. Aldous will remember.', flag: { committee: 'odo' },
        after: 'Odo accepts, and asks what a committee is. At the first meeting he reads out exactly what you said, and asks whether anyone disagrees. Nobody does. The meeting lasts four minutes. Aldous takes the minutes, with feeling.' },
    ],
  },
  {
    id: 'report_aldous', when: 16, requires: { committee: 'aldous' }, title: 'The Committee reports', who: ['aldous'],
    pages: [
      'The Committee for the Correct Understanding of Revelations has met two hundred and eleven times. It has produced a report. The report concludes that you meant everything you said, in the version the Committee prefers, and that the version you actually said was an early draft.',
      'Several households now quote the report instead of the Tablets. They call themselves the Correct. Aldous asks whether you would care to endorse it.',
    ],
    choices: [
      { id: 'dissolve', label: 'Dissolve the Committee', note: 'Heresy rises now; some of the Correct leave.', do: 'dissolve', flag: { report: 'dissolved' },
        after: 'Aldous takes the news standing up. That night two households of the Correct walk to {rival}\'s temple, where nobody has ever asked them what anything meant. Aldous stays. He says somebody has to.' },
      { id: 'endorse', label: 'Endorse the report', note: 'Heresy spikes once; the Committee will help write your Book.', effects: { heresy: 3 }, flag: { report: 'endorsed' },
        after: 'Your endorsement is read out at the next meeting, and minuted, and amended slightly. Aldous asks Hesper whether the Committee might assist with any future book. Hesper says that is very kind.' },
    ],
  },
  {
    id: 'report_odo', when: 16, requires: { committee: 'odo' }, title: 'The Committee reports', who: ['odo'],
    pages: [
      'Odo\'s Committee has met every season since he took the chair. Every meeting he reads out what you said and asks whether anyone disagrees. It has never lasted longer than five minutes, and it has never once decided you meant something else.',
      'Little Fretting has started saying "as Odo says" to mean "exactly".',
    ],
    choices: [{ id: 'continue', label: 'Continue', effects: { faith: 6, heresy: -1 }, flag: { report: 'odo' },
      after: 'Aldous has resigned as secretary to found a society of his own. It meets in his kitchen. It has two members, and the other one is his mother.' }],
  },
  {
    id: 'report_none', when: 16, requires: { committee: 'none' }, title: 'A reading group', who: ['aldous'],
    pages: [
      'Aldous has started a reading group. It meets in his kitchen on Thursdays and discusses the Tablets "without prejudice". The minutes book he had bound is finally in use.',
      'It is small. It is growing. Its members have started finishing each other\'s sentences, and some of the endings are not yours.',
    ],
    choices: [
      { id: 'attend', label: 'Send Aldous a dream about it', note: 'Devotion; Aldous is flattered.', effects: { devotion: 0.2, power: -1 }, flag: { report: 'dreamed' },
        after: 'Aldous wakes convinced you attended. He minutes it. The reading group becomes, in his words, "officially recognised", and stops being a problem by becoming a committee.' },
      { id: 'ignore', label: 'Leave it alone', note: 'Heresy rises a little.', effects: { heresy: 1.5 }, flag: { report: 'ignored' },
        after: 'The reading group carries on without you. By spring it has a hymn, which nobody can remember agreeing to.' },
    ],
  },
];

// Pim's office: a short scene at each rank. No choices; the desk moves.
export const RANK_SCENES = [
  null,
  { title: 'Local Deity', pages: ['Pim meets you at the Lower Annex with a trolley. "You have been reclassified," Pim says. "Local Deity. It comes with a slightly larger desk." The slightly larger desk also wobbles. Pim has brought a folded beer mat for it, which is the nicest thing anyone has done for you since the re-filing.'] },
  { title: 'Deity of Some Standing', pages: ['You are moved up a floor. The Middle Heavens have started nodding to you in the corridor. Vellamine nods too, from further off, as if not quite sure the nod will be accepted. Pim has started stamping your forms with a stamp that says SOME STANDING, and does it slowly, so it lasts.'] },
  { title: 'Regional God', pages: ['Regional God. Your file has been moved to a drawer that locks. "This is the drawer the appeals go in," Pim says, not looking at you. "I put it in myself. I checked the spelling twice." Then Pim checks it a third time while you watch.'] },
  { title: 'Major God', pages: ['Major God. The other gods have stopped asking what you are the god of. Somebody in the Middle Heavens is said to have asked whether the seventh seat might go to you. Pim heard it in the canteen and has not been able to eat since.'] },
];

// The ending. A heading line per outcome; then what became of each of them,
// chosen by what happened; then, if you won, the last choice.
export const ENDING_LINES = {
  ascended: 'The Registry hears your appeal in a long room with good light. Pim reads out your file. It takes all morning, because Pim reads every Tablet aloud, as written, including the parts about the eel. The Registry finds that a religion has been built, and that the file was wrong.',
  rival_fell: '{rival}\'s temple in Little Fretting closes on a Tuesday. Her people are nobody\'s for a while, and then, mostly, yours. The Registry does not hold a Review for a god who has the whole village. It sends a letter. The letter is short, and Pim frames it.',
  passed_over: 'The Registry hears your appeal and finds that the file is wrong, but not wrong enough. Your case is adjourned. Pim takes the forms home to read again, which is not allowed, and does not tell anyone.',
  absorbed: 'Little Fretting goes over to {rival}. You are taken into her faith as a minor saint of something small. At the service where it is announced, she says your name correctly, which nobody at the Registry ever managed.',
  forgotten: 'Two years under the Registry\'s line. Your file goes to the Archive. Pim walks it down personally, which nobody does, and puts it at the front of the drawer.',
};

export const FATES = {
  odo: {
    unstick: 'Odo the Miller kept the mill wheel turning for thirty years and never once allowed it to be oiled by anyone else. He told everyone exactly what you said, which was the trouble and the point.',
    silent: 'Odo the Miller kept coming to the stone every morning, whether or not you answered. Eventually other people started coming too, mainly to see what Odo was looking at.',
    door: 'Odo the Miller never opened his front door again. Pilgrims come to look at it. Odo is happy to show them, through the window.',
  },
  aldous: {
    dissolved: 'Aldous the Clerk stayed when the Correct left, and took the minutes of every meeting held afterwards, including the ones he was not invited to.',
    endorsed: 'Aldous the Clerk is remembered as the Book\'s co-author. He would be the first to tell you, and generally is.',
    odo: 'Aldous the Clerk\'s society still meets in his kitchen. His mother has been made secretary, over his objections.',
    dreamed: 'Aldous the Clerk chairs a committee you once visited in a dream. He has the minute framed.',
    ignored: 'Aldous the Clerk\'s reading group outlived its founder\'s interest. It meets on Thursdays still, and reads the Tablets "without prejudice", and has very strong views.',
    chair: 'Aldous the Clerk chaired the Committee to the end, and is chairing it still. Nobody has found the courage to tell him the end has come.',
    none: 'Aldous the Clerk never did get his committee. He keeps the minutes book on the mantelpiece, blank, in case.',
  },
  hesper: {
    book: 'Hesper the Beekeeper wrote your Book. It is very beautiful. Large parts of it did not happen.',
    nobook: 'Hesper the Beekeeper wrote you forty hymns. The best one is about a door.',
  },
  brenna: {
    yours: 'Brenna the Brewer never stopped doubting you out loud, and never once missed a service. She says somebody has to keep you honest, and serves the only honest ale in the parish.',
    lost: 'Brenna the Brewer went over to {rival} in the end, for the singing. She still pours you a drink at harvest, and leaves it on the stone.',
  },
  vellamine: {
    ask: '{rival} sent your postcard back, years later, with a note: "You will want this." You did.',
    blank: '{rival} kept your postcard. You know, because Pim saw it on her desk, propped against the lamp.',
    congratulate: '{rival} came to the hearing and sat at the back. Afterwards she said, "Same clerk," and you both laughed, which surprised the clerk.',
    none: '{rival} never mentioned the re-filing. Neither did you. It sat between you at every meeting like a third god.',
  },
  pim: 'Pim was promoted to seraph second class, which nobody expected, Pim least of all. Pim still checks your file once a month, in case.',
};

// If you won: the last choice, after everything else.
export const FINAL_CHOICE = {
  prompt: 'The Registry offers to correct your file. You may be the God of Thresholds again: two market towns, a feast day people keep, a desk that does not wobble. Or you may stay what the clerks made you.',
  options: [
    { id: 'thresholds', label: 'Be the God of Thresholds again', text: 'Your file is corrected in red ink. You go up to the Middle Heavens and sit at your old desk, which still smells faintly of Vellamine. On your first morning you find yourself listening, out of habit, for the sound of a mill wheel in a village nobody up here has heard of.' },
    { id: 'stay', label: 'Stay the God of {short}', text: 'You ask the Registry to leave the file as it is. Pim has to sit down. In Little Fretting, a door sticks, and somebody says your name, and you find that it is the right one after all.' },
  ],
};

// ---- the Book's voice ---------------------------------------------------------
// The Book is the village's account of what you did, set down years later.
// Openings by how season 1 went; then passages built from what happened.
export const BOOK_OPENING = {
  unstick: 'In the beginning was the stone, and the stone belonged to nobody. And Odo the Miller came to it, for his wheel was stuck, and he called upon whoever was there. And the god was there, and the wheel turned, and Odo told it exactly, as Odo tells everything.',
  silent: 'In the beginning was the stone, and Odo the Miller called upon it, and there was no answer. And he came again, and there was no answer, and in the silence Odo understood that the god was listening very hard.',
  door: 'In the beginning was the stone, and Odo the Miller asked it to unstick his wheel. And the god of doors heard him, and stuck his door, so that he would know. And he knew.',
  none: 'In the beginning there was a village that had never heard of the god, which was the village\'s loss, though it did not know it yet.',
};

// One passage per kind of thing that happened. Tokens: {n} a count,
// {name} a person, {rival}, {thing}, {year}.
export const BOOK_PASSAGES = {
  words: 'And the god gave them words, {n} times, and the words went from mouth to mouth and were set in stone, and they are these.',
  miracle: 'And in the {year} year the god worked a {thing} among them, and {name} saw it, and has told it ever since.',
  wonder: 'And in the {year} year there was a Wonder, and nobody who saw it agrees what it was, which is how they know it was a Wonder.',
  saint: 'And {name} was made holy, and is the patron of {thing}.',
  wrongSaint: 'And {name} was made holy, and is the patron of {thing}. Some say the god meant somebody else. They are not invited to things.',
  rivalFight: 'And the god and {rival} contended {n} times, in the market and in the sky, and the god was the more correct.',
  rivalPeace: 'And there was another god in the village, called {rival}, and the god let her be, which was very gracious, and which {rival} did not deserve.',
  committeeAldous: 'And Aldous the Clerk made a Committee, and the Committee decided what the god had meant, and wrote it down, and this book has been checked against it.',
  committeeOdo: 'And Odo the Miller was set over the Committee, and read out what the god had said, and nobody disagreed, and they went home.',
  committeeNone: 'And Aldous the Clerk asked to make a Committee, and the god said no, and Aldous was patient, as you can see.',
};

// How each second scribe bends a passage: something added at the end.
// Drawn without repeats within the Book.
export const SCRIBE_CODAS = {
  poet: ['as the river forgives the stone', 'and the evening was very golden', 'and the bees knew', 'and nobody who was there has been quite the same', 'and the barley leaned in to listen', 'and it was the colour of a held breath'],
  ambitious: ['and {scribe} was there, and saw it best', 'as {scribe} has always maintained', 'and {scribe} was the first to understand it', 'and {scribe} was thanked, afterwards, at length', 'and {scribe} would like that noted', 'and {scribe} was nearly in charge of it'],
  zealot: ['and those who doubted it were put in the pond', 'and the doubters were looked at sternly', 'and there were no further questions', 'and it was compulsory', 'and nobody laughed, and nobody has since', 'and those who were absent were spoken about'],
  drunk: ['or possibly on a Thursday', 'and there was a goose involved', 'at the alehouse, more or less', 'and everybody stood a round', 'and somebody\'s hat went missing', 'and it rained, or nearly'],
  lazy: ['and so on', 'and the rest is much the same', 'etcetera', 'and other things besides', 'and so forth', 'and then the usual'],
  literalist: ['at about the fourth hour', 'on a Tuesday', 'in front of eleven witnesses', 'on the west side of the stone', 'before the second bell, but after the first', 'with the door shut'],
};
