// Story Chapters 2 and 3: so far, each chapter's prologue, first scene, ending
// lines and last choice. Logic-free. docs/STORY-chapters-2-3.md is the design;
// the rest of each chapter's scenes are designed there and not yet written.
// Tokens as in story.data.js: {god}, {short}, {rival}.
//
// A page may be a string; { legacy: { key: text } }, the text for how the
// last chapter ended (src/engine/story.js legacyKey: the last choice's id if
// that chapter was won, else rival_fell, passed_over, or lapsed); or
// { flag: name, is: { value: text }, else: text }, by this chapter's choices
// (a page with no text for the value is left out). A choice's `after` may be
// keyed by what its `do` returned.

export const CHAPTER_STORIES = {
  ch2: {
    cast: {
      odo:    { name: 'Odo',    trade: 'miller',    trait: 'literalist', household: 0, slot: 0, known: true },
      wenna:  { name: 'Wenna',  trade: 'miller',    trait: 'literalist', household: 0, slot: 1, known: true },
      cob:    { name: 'Cob',    trade: 'alewife',   trait: 'drunk',      household: 1, slot: 3 },
      aldous: { name: 'Aldous', trade: 'clerk',     trait: 'ambitious',  household: 2, slot: 6 },
      hesper: { name: 'Hesper', trade: 'beekeeper', trait: 'poet',       household: 3, slot: 9 },
    },
    priests: { hurm: { name: 'Master Pale', trait: 'literalist', cast: 'pale' } },
    review: { caps: 'The appointment', hint: 'The Registry names one Deity of the Vale after season {n}. What it will ask is on the World page.' },
    scenes: [
      {
        id: 'ch2_prologue', when: 1, title: 'Ten years on', who: ['you', 'pim'],
        pages: [
          { legacy: {
            thresholds: 'You have been the God of Thresholds again for ten years. The desk does not wobble. The market towns keep your feast. Once a month Pim brings you news of Little Fretting, which you did not ask for and read twice.',
            stay: 'Ten years on, you are still the God of Doors That Stick, at your own request, which the Registry has filed under Eccentric. Little Fretting has grown. So, a little, has the paperwork.',
            rival_fell: 'Ten years on, Little Fretting is entirely yours. Vellamine is a minor saint in your faith, patron of being noticed, and has asked twice for a transfer. The Registry has lost both requests.',
            passed_over: 'Ten years on, your appeal is still adjourned. Pim has explained that an adjournment is not a refusal. Pim explains it every spring.',
            lapsed: 'Ten years ago your file went to the Archive. Pim has since found a procedure: a lapsed god may be reinstated on probation, if a sponsoring officer will vouch for them. Pim is the sponsoring officer. Nobody else applied.',
          } },
          'Then the Registry had a new idea. It is called consolidation. There are too many small parishes, the Registry finds, and far too many small gods. Little Fretting and the two villages downriver are now one Vale, and in ten years the Registry will appoint one Deity of the Vale. The others will be re-assigned. Nobody has come back from re-assignment to say what it is like.',
          'Downriver is Hurm, God of Fences, who has a village, a reeve called Master Pale, and a grievance about most things. Vellamine has been consolidated too, and is taking it personally.',
          'And Pim is being audited. Somebody has noticed the misfiling. The auditor, Clement, seraph first class, is thorough and kind, and has explained that if the Vale goes to anyone else, the misfiling will have "produced no corrective outcome" and Pim will be archived. You are the corrective outcome. Pim has asked you not to worry about it, in a letter of eleven pages.',
          'Odo is old now. He still goes to the stone every morning. His daughter Wenna goes with him, and says the Tablets as he taught her, word for word, which is not quite word for word.',
        ],
        choices: [{ id: 'begin', label: 'Begin' }],
      },
      {
        id: 'fence', when: 1, title: 'The fence', who: ['wenna'],
        pages: [
          'Hurm\'s people have put a fence across the river path between Little Fretting and the villages downriver. It is a good fence: oak posts, three rails, a sign. The sign says PRIVATE, and under it, in a smaller hand, BY ORDER OF THE GOD OF FENCES.',
          'Wenna stands at it with a basket of flour for the market. "Father says a fence is not a door," she says. "But it has a gap in it, and the gap has a gate, and the gate is stuck."',
        ],
        choices: [
          { id: 'round', label: 'Go round it', note: 'Nothing spent. The long way is long.', flag: { fence: 'round' },
            after: 'Wenna goes round by the ford, which takes the morning and one shoe. By evening the whole village goes that way and calls it the Pilgrims\' Path, out of spite. Master Pale writes down that the fence is respected.' },
          { id: 'tear', label: 'Tear it down', note: '2 Power. Hurm will not forget.', effects: { power: -2, mystery: 3 }, flag: { fence: 'torn' },
            after: 'At dawn the fence is lying in the river, every post, the rails stacked tidily on the bank. Nobody saw it happen. Master Pale saw it not happen in great detail, and has written to the Registry in triplicate.' },
          { id: 'gate', label: 'Bless the gate. A gate is a threshold', note: '1 Power. The gate is yours, and so is the argument.', effects: { power: -1, faith: 2 }, flag: { fence: 'gate' },
            after: 'The gate unsticks, and opens, and stays open, and will not close for Hurm\'s people however hard they push. Wenna walks through it as though she had always meant to. On the Registry\'s map the gate is now, technically, yours, and the fence on either side of it is now, technically, a dispute.' },
        ],
      },
      {
        id: 'margins', when: 4, title: 'Margins', who: ['hesper'],
        pages: [
          'Somebody in the downriver village has copied out your Tablets, all of them, on good paper, and written in the margins. Beside the one about the eel, in a small neat hand: "Surely he means on feast days only." Beside another: "Unclear. Possibly about bees."',
          'Hesper brings the copy to the stone, holding it the way you hold something the cat has brought in. "The notes are better," she says. "That is not the point. But they are."',
        ],
        choices: [
          { id: 'burn', label: 'Burn the copy', note: 'Heresy falls. People notice what burns.', effects: { heresy: -1, devotion: -0.1 }, flag: { margins: 'burned' },
            after: 'The copy goes on the fire at the stone. It burns slowly, being good paper. By the next market day there are four more copies downriver, each with a note in the margin about the burning.' },
          { id: 'adopt', label: 'Adopt the notes', note: 'Faith rises. So does the argument.', effects: { faith: 3, heresy: 1 }, flag: { margins: 'adopted' },
            after: 'From now on the eel is for feast days only, and one Tablet is officially about bees. Nobody downriver will say who wrote the notes. Several people upriver are sure it was them.' },
          { id: 'ask', label: 'Ask whose notes they are', note: 'A dream. Somebody will be embarrassed.', effects: { mystery: 2 }, flag: { margins: 'aldous' },
            after: 'You ask in a dream, and the answer arrives at the stone next morning, very red in the face. It is Aldous. He has been annotating the Tablets for years, "for clarity". He has three more copies, and an index.' },
        ],
      },
      {
        id: 'keeper', when: 8, title: 'Who keeps the stone', who: ['odo', 'wenna'],
        pages: [
          'Odo is at the stone earlier than usual, and sits down to pray, which he has never done. "I am eighty," he says. "Or near it. Somebody will have to keep the stone after me. Sweep it. Say the words. Know which way it faces."',
          '"Wenna knows the words. Aldous knows the forms. And there is a view in the village that it should belong to all of us, which is the view of the people who do not want to sweep it."',
        ],
        choices: [
          { id: 'wenna', label: 'Wenna', note: 'The words will be kept exactly as Odo says them.', effects: { devotion: 0.1 }, flag: { keeper: 'wenna' },
            after: 'Odo nods as though you had told him the time. Wenna takes the broom next morning and has not put it down since. She says the words at the stone exactly as her father says them, including the cough.' },
          { id: 'aldous', label: 'Aldous', note: 'Better accounts. A keeper with plans.', effects: { offerings: 3 }, flag: { keeper: 'aldous' },
            after: 'Aldous accepts with a short speech he has clearly had ready for some years. By the end of the month the stone has a collecting box, a rota and a small sign giving its opening hours.' },
          { id: 'village', label: 'Nobody. Let it belong to the village', note: 'Faith rises. Nobody sweeps.', effects: { faith: 2, mystery: 1 }, flag: { keeper: 'village' },
            after: 'Odo looks at the stone for a while. "All of us, then," he says. Everybody agrees, warmly. The stone is not swept again for some time, moss starts on the north side, and somebody decides that is holy too.' },
        ],
      },
      {
        id: 'lawsuit', when: 12, title: 'The case of the river path', who: ['you'],
        pages: [
          { flag: 'fence', is: {
            torn: 'Hurm has sued. The claim is for one fence, oak, three-railed, "removed by a party unknown, being {god}". Master Pale has itemised the posts.',
            gate: 'Hurm has sued. The claim is that his fence has been "annexed by means of a gate", and that a gate is not a threshold but a part of a fence, as any child knows. Master Pale has supplied diagrams.',
            round: 'Hurm has sued. The claim is that your people\'s new path round by the ford "passes within sight of the fence in a manner calculated to mock it". Master Pale has supplied a list of the looks.',
          } },
          'The Registry\'s court sits in a tent by the river. Clement is there, taking notes for the audit. You may send an advocate, or speak for yourself, which the court allows and does not recommend.',
        ],
        choices: [
          { id: 'wenna', label: 'Send Wenna', note: 'A Literalist cites. Strong if the gate is yours, weak if you tore the fence down.', do: 'lawsuit',
            after: { won: 'Wenna reads the court the relevant Tablets, word for word, slowly, twice. By the second reading Master Pale has stopped taking notes. The court finds for you, mainly so that she will stop.',
              lost: 'Wenna reads the court the relevant Tablets, word for word. Unfortunately the words do not say what she thinks they say, and Master Pale reads them back to her, also word for word. The court finds for Hurm.' } },
          { id: 'aldous', label: 'Send Aldous', note: 'He will ask for costs. Win more, lose more.', do: 'lawsuit',
            after: { won: 'Aldous wins the case in an afternoon and spends the evening on his claim for costs, which is longer than the case. The court awards them, to be rid of him.',
              lost: 'Aldous loses the case, and asks for costs anyway. The court awards them, to Hurm.' } },
          { id: 'self', label: 'Speak for yourself', note: 'By Scripture: strong if your Tablets agree with each other and Hurm\'s do not.', do: 'lawsuit',
            after: { won: 'You speak for yourself. Nobody in the tent can see you, but everyone can hear you, and the court has never been addressed by a party who is also, technically, weather. It finds for you.',
              lost: 'You speak for yourself, and Master Pale reads your own Tablets back at you, one contradicting the next. The court finds for Hurm, and adds a note about the eel.' } },
        ],
      },
      {
        id: 'pilgrims', when: 16, title: 'The pilgrims', who: ['hesper'],
        pages: [
          'Hesper\'s hymns have got out. People are walking to Little Fretting from three valleys over to see the things in them: the stone, the door, the mill, the tree where the god sat down. There is no tree where the god sat down. Hesper needed a rhyme.',
          'They have come a long way, and they would like to see the tree.',
        ],
        choices: [
          { id: 'tree', label: 'Give them a tree', note: '3 Offerings. Faith rises.', effects: { offerings: -3, faith: 4 }, flag: { pilgrims: 'tree' },
            after: 'An oak is moved, at some expense, to a spot by the stone. Within a year it has a fence, a stall, and a branch that is supposed to be the one. Hesper writes a new verse about it, which also mentions a well.' },
          { id: 'truth', label: 'Tell them the truth', note: 'Heresy falls. Most of them go home.', effects: { heresy: -1, mystery: -2, devotion: 0.1 }, flag: { pilgrims: 'truth' },
            after: 'Odo tells them, precisely: there is no tree. Most of the pilgrims go home. Three stay, on the grounds that a god who admits there is no tree is a god worth staying for.' },
          { id: 'hesper', label: 'Let Hesper show them round', note: 'Faith rises. So does what did not happen.', effects: { faith: 2, heresy: 1 }, flag: { pilgrims: 'hesper' },
            after: 'Hesper shows them the place where the tree was, and describes it so well that several of them weep. By evening there have been two trees, and a lake, and the god sat under both.' },
        ],
      },
      {
        id: 'funeral', when: 20, title: 'Odo', who: ['wenna'],
        pages: [
          { flag: 'keeper', is: {
            wenna: 'Odo died in his sleep in the spring, with the mill wheel turning. Wenna swept the stone that morning anyway, because it was a Tuesday.',
            aldous: 'Odo died in his sleep in the spring. Aldous arranged the funeral, which was excellent, and ran to an order of service of six pages, two of them about Aldous.',
            village: 'Odo died in his sleep in the spring. The whole village came to the stone for him, which it had always said it would do on Sundays and had not.',
          } },
          'At the graveside Wenna says the Tablets over him, from memory, as he taught her. They are not quite the Tablets you gave. They are not quite the Tablets he said, either. They are the Tablets as they now are, and a whole generation is standing round the stone learning them that way.',
          'Three more of the old ones go that year. Their children take their places, their trades, and their own way of getting things slightly wrong. Downriver, the other gods\' people are burying theirs.',
        ],
        choices: [{ id: 'continue', label: 'Continue', do: 'generation',
          after: { none: 'Every one of your Tablets came through the generation as it was. Wenna checks, twice.', some: '{changed} of your Tablets came through the generation changed. The new words are on the Scripture page, with who said them.' } }],
      },
      {
        id: 'synod', when: 24, title: 'The Synod of the Vale', who: ['you', 'pim'],
        pages: [
          'Clement has called a Synod. Three faiths in one Vale cannot go on with three Scriptures, he says, kindly, the way people say things that have already been decided. Each god sends a delegate. Each faith\'s two best Tablets will go round the table, through every delegate in turn, and what comes out will be the Harmonised Text of the Vale.',
          { flag: 'margins', is: { aldous: 'Aldous has already prepared an index, and a seating plan.' } },
          'Vellamine is sending Gisla. Hurm is sending Master Pale, who has brought his own ink. Your delegate goes first, and touches every text at the table, theirs as well as yours.',
        ],
        choices: [
          { id: 'hesper', label: 'Send Hesper', note: 'A Poet: every text comes out lovelier, and less like a rule.', do: 'synod',
            after: 'Hesper reads each text aloud before passing it on, and improves it slightly, as a favour.' },
          { id: 'aldous', label: 'Send Aldous', note: 'Ambitious: every text comes out with a clause in his favour.', do: 'synod',
            after: 'Aldous passes on each text with a small amendment, for clarity, mostly about who should be consulted.' },
          { id: 'wenna', label: 'Send Wenna', note: 'A Literalist: every text comes out exactly. Possibly too exactly.', do: 'synod',
            after: 'Wenna passes on each text exactly as she received it, then corrects Master Pale\'s copy, then her own.' },
        ],
        best: { 0: 'When the Harmonised Text is carved, your verses have come through it best.', other: 'When the Harmonised Text is carved, {best}\'s verses have come through it best. Clement notes it.' },
      },
    ],
    ending: {
      ascended: 'The Registry names the Deity of the Vale in a room with a river view. Clement reads the finding, which is short, and then closes the audit, which is long. Pim keeps the job.',
      rival_fell: 'The Vale is yours before the Registry can rule on it. Clement writes in the file that the outcome was corrective, and then, after some thought, that it was also slightly alarming.',
      passed_over: 'The Vale goes to {rival}. You are re-assigned, which turns out to mean Little Fretting, alone, with a smaller desk. Pim\'s audit stays open. Pim says this is fine, and has taken up knitting.',
      absorbed: 'The Vale goes over to {rival}. You become a saint in {rival}\'s faith, patron of something with a gate in it. Pim is archived the same week, and sends you a postcard from the Archive. It is quieter than expected, the postcard says.',
      forgotten: 'Your name drops under the Registry\'s line. Pim walks your file down to the Archive, and asks to stay there with it, and is allowed.',
    },
    final: {
      prompt: 'You are Deity of the Vale. The cathedral chapter downriver would like Odo\'s stone moved to be its high altar, where more people can see it. Wenna would like it to stay where her father knelt.',
      options: [
        { id: 'move', label: 'Move the stone downriver', text: 'The stone goes downriver on a cart, with Wenna walking beside it the whole way. It looks smaller on the altar than it did in the field. A great many people see it. The flattened grass where Odo knelt stays flat, and the village mows around it.' },
        { id: 'stay', label: 'Leave it where Odo knelt', text: 'The stone stays in the field. The cathedral is built downriver anyway, with a very good replica. On weekday mornings there is nobody at the real one but Wenna, and on most of them, you.' },
      ],
    },
  },

  ch3: {
    cast: {
      wenna:  { name: 'Wenna',  trade: 'miller',    trait: 'literalist', household: 0, slot: 0, known: true },
      cob:    { name: 'Cob',    trade: 'alewife',   trait: 'drunk',      household: 1, slot: 3 },
      tamsin: { name: 'Tamsin', trade: 'gooseherd', trait: 'lazy',       household: 2, slot: 6 },
      hesper: { name: 'Hesper', trade: 'beekeeper', trait: 'poet',       household: 3, slot: 9 },
    },
    review: { caps: 'The selection', hint: 'The High Pantheon fills the seventh seat after season {n}. What it will ask is on the World page.' },
    scenes: [
      {
        id: 'ch3_prologue', when: 1, title: 'Twenty years on', who: ['you', 'pim'],
        pages: [
          { legacy: {
            move: 'Twenty years ago the Registry made you Deity of the Vale, and Odo\'s stone went downriver to be the high altar, where more people could see it. More people did. A cathedral has grown up around it, slowly, like a callus.',
            stay: 'Twenty years ago the Registry made you Deity of the Vale. Odo\'s stone stayed where he knelt. The cathedral downriver keeps its replica in a glass case. The replica is better attended.',
            rival_fell: 'Twenty years ago the Vale became yours without a ruling, which alarmed Clement slightly. It has been yours since. The paperwork has never caught up, and has stopped trying.',
            passed_over: 'Twenty years ago the Vale went to someone else and you were re-assigned to Little Fretting alone. You found you did not mind. Your faith, it turns out, did not mind either, and grew without asking.',
            lapsed: 'Twenty years ago you lost the Vale. It did not, it turns out, lose you: your people kept the Tablets, the Tablets kept your name, and the Registry has reinstated you on the grounds that a faith this large must have a god in it somewhere.',
          } },
          'Now the seventh seat of the High Pantheon is to be filled. It has been empty for an age; the last occupant retired to be a mountain. Every god in the Registry has applied. The selection will take twelve years and a great many forms.',
          'You are a candidate because Pim filled in your form without asking, twice, to be sure. Pim now runs the selection\'s paperwork, has declared an interest, and has been told that declaring it is enough.',
          'The other candidates are gods you know. Vellamine, going for something she actually wants. Hurm, who has sued the selection committee. Ysolde, Goddess of Unsolicited Advice, whose followers correct yours in the margins. And Old Brannoch, God of Slightly Better Bread, who is going to win on merit, which is unbearable.',
          'And your faith is now a Church. It has a Primate, a calendar, a budget, a choir and opinions about you. The Primate is Wenna. She learned the Tablets from her father, has made them into a liturgy, and is sure, in the kindest way, that she knows what you meant.',
        ],
        choices: [{ id: 'begin', label: 'Begin' }],
      },
      {
        id: 'festival', when: 1, title: 'Your feast day', who: ['wenna'],
        pages: [
          'It is your feast day. The Church has kept it for twenty years and has got good at it: banners, a procession, a choir of forty, and bread from somewhere that is, people agree, slightly better than usual.',
          'There is a seat for you, as there always is: a carved chair at the back, by the door, left empty in your honour. Wenna explained it in a sermon once. The god, she said, is humble, and would not wish to be in the way.',
        ],
        choices: [
          { id: 'back', label: 'Sit where you are put', note: 'The Church likes you better for it.', effects: { devotion: 0.2 }, flag: { festival: 'back' },
            after: 'You sit by the door. Nobody notices, which is the point of the chair. The sermon is about you, and is very good, and is mostly about somebody else. Afterwards Wenna thanks the empty chair for coming.' },
          { id: 'high', label: 'Take the high seat', note: '2 Power. The Church will not forget it.', effects: { power: -2, mystery: 4, heresy: 1 }, flag: { festival: 'high' },
            after: 'The high seat by the altar is suddenly occupied by a bright light and a smell of oak. The choir stops. Wenna does not. She finishes the reading, word for word, and has the light written into next year\'s order of service, under Optional.' },
          { id: 'leave', label: 'Leave early', note: 'Somebody will notice.', effects: { mystery: 2 }, flag: { festival: 'left' },
            after: 'You leave before the sermon. One person sees you go: a girl by the door called Tamsin, who could not be bothered to stand for the procession. She waves. Nobody has waved at you in twenty years.' },
        ],
      },
    ],
    ending: {
      ascended: 'The High Pantheon sits in a hall with no ceiling, which saves on repairs. The seventh seat is offered to you. Pim reads the citation, and gets through it, nearly.',
      rival_fell: 'Every other candidate has withdrawn, lapsed or been absorbed. The Pantheon offers you the seat by default. Pim insists on a proper ceremony anyway, and writes one, and it is four hours long.',
      passed_over: 'The seat goes to {rival}. You go home. Little Fretting has not heard about the selection, and would not have been impressed.',
      absorbed: 'Your Church outgrows you. It keeps your name, your feast day and your stone, and appoints a committee to speak for you. The committee is very good. You are not on it.',
      forgotten: 'Your name drops under the line, and your file goes to the Archive. A girl called Tamsin goes on talking to you anyway, at the stone, about nothing much. Some things are not on file.',
    },
    final: {
      prompt: 'The seventh seat is yours if you will take it: a place among the oldest gods, above every Registry, where nobody re-files anyone. You would have to leave. Little Fretting and the Church would manage without you, which is the trouble.',
      options: [
        { id: 'take', label: 'Take the seat', text: 'You take the seventh seat. It is very high and very quiet, and the view takes in everything, including, if you lean, a stone in a field and a door that sticks. You lean, most days.' },
        { id: 'refuse', label: 'Stay the God of {short}', text: 'You refuse the seat. The Pantheon has not been refused in an age and has no form for it; Pim writes one. You go back down to Little Fretting, where a door is sticking, and somebody says your name, and means it.' },
      ],
    },
  },
};

// Starting a chapter without having played the one before: the canonical
// legacy, a won chapter with the quieter last choice.
export const CANON_LEGACY = {
  ch2: { chapter: 'ch1', outcome: 'ascended', final: 'stay', canonical: true },
  ch3: { chapter: 'ch2', outcome: 'ascended', final: 'stay', canonical: true },
};

// The case of the river path (Chapter 2, season 12): the chance each advocate
// wins, and what winning and losing cost. Tuned, not measured.
export const LAWSUIT = {
  wenna:  { chance: 0.45, byFence: { gate: 0.3, torn: -0.15 }, min: 0.1, max: 0.9, won: { faith: 3 }, lost: { offerings: -2 } },
  aldous: { chance: 0.5, min: 0.5, max: 0.5, won: { offerings: 5 }, lost: { offerings: -5 } },
  self:   { chance: 0.5, perPoint: 0.08, min: 0.15, max: 0.85, won: { faith: 2, mystery: 3 }, lost: { devotion: -0.1, offerings: -2 } },
  hurmLoses: -3,
};

// The generation turning (season 20) and the Synod (season 24).
export const GENERATION = { dies: 4, synodTablets: 2 };
