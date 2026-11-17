// Story Chapters 2 and 3: so far, each chapter's prologue, first scene, ending
// lines and last choice. Logic-free. docs/STORY-chapters-2-3.md is the design;
// the rest of each chapter's scenes are designed there and not yet written.
// Tokens as in story.data.js: {god}, {short}, {rival}.
//
// A page may be a string, or { legacy: { key: text } }: the text for how the
// last chapter ended (src/engine/story.js legacyKey). Keys: the last choice's
// id if that chapter was won, else rival_fell, passed_over, or lapsed
// (absorbed or forgotten).

export const CHAPTER_STORIES = {
  ch2: {
    cast: {
      odo:    { name: 'Odo',    trade: 'miller',    trait: 'literalist', household: 0, slot: 0, known: true },
      wenna:  { name: 'Wenna',  trade: 'miller',    trait: 'literalist', household: 0, slot: 1, known: true },
      cob:    { name: 'Cob',    trade: 'alewife',   trait: 'drunk',      household: 1, slot: 3 },
      aldous: { name: 'Aldous', trade: 'clerk',     trait: 'ambitious',  household: 2, slot: 6 },
      hesper: { name: 'Hesper', trade: 'beekeeper', trait: 'poet',       household: 3, slot: 9 },
    },
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
