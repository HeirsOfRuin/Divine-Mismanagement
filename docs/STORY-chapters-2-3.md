# Story framework: Chapters 2 and 3

2026-11-17. The author: "[Write up] the framework for the next 2 chapters of
the story". **Status: framework.** This file is the design for both chapters:
premise, stakes, cast, arc, scenes with their choices and callbacks, the new
mechanics each chapter needs, what carries over, and the endings. Built so far:
the engine support (chapters keyed in the story data, the legacy that carries
Chapter 1 into Chapter 2 and on), and each chapter's prologue and first scene,
written and playable. Everything else here is design, not yet written or built.

Read `docs/FRAME-story.md` first: Chapter 1's backstory, cast and scenes, which
these chapters continue. The author has not yet given a verdict on Chapter 1's
calibration; if that verdict changes the voice or the cast, this file changes
with it.

---

## The shape of the three chapters

The game's three themes (`docs/WORLD.md` section 1) become the three chapters:

| Chapter | Theme | What you are fighting | What you could lose |
|---|---|---|---|
| 1. Little Fretting | Message is not meaning | Being misunderstood | Your appeal; your name |
| 2. The Vale | Writing it down makes it worse | Your own Scripture, set in stone, outliving its reasons; and other gods' | Pim |
| 3. The Overcrowded Heavens | The institution does not need you | Your own Church | Your people, or the seventh seat |

Each chapter is one match with its own Review, ends with what became of
everyone and a last choice, and hands a **legacy** to the next.

## What carries over (the legacy)

At the end of a Story chapter the game keeps a legacy: the chapter, its
outcome, the story flags, the last choice, your name, your rank, the Book's
title, your Saints' names, and who is still alive. Starting the next chapter
from the ending screen carries it in. A chapter started from the menu without
one uses the canonical legacy:

| Chapter 1 ended | Chapter 2 opens with |
|---|---|
| Promoted, chose **Thresholds** | You are the God of Thresholds again, with a desk in the Middle Heavens, and the Registry's next idea arrives on it |
| Promoted, chose **to stay** (canonical) | You are still the God of Doors That Stick, by choice, which the Registry has filed under Eccentric |
| Rival fell | As "stay", and Vellamine is a minor saint in your faith who has asked for a transfer |
| Passed over | Your appeal is adjourned; Chapter 2 is the adjournment |
| Absorbed or Forgotten | Pim has found a procedure: a lapsed god may be reinstated on probation. Chapter 2 is the probation |

Mechanical carry-over is small on purpose, so no chapter is lost before it
starts: Saints from Chapter 1 begin Chapter 2 as founders (a shrine each, a
little Faith); the Book begins Chapter 2 as a relic Hesper guards; nothing
else. The flags are what matter: they decide which scenes happen and what
people say.

---

## Chapter 2: The Vale

**Forty seasons. Three villages along one river, one region. Rivals: Vellamine
and Hurm, God of Fences.**

### Premise

The Registry has a new idea: **consolidation**. Too many small parishes, too
many small gods. Little Fretting and the two villages downriver are now one
Vale, and in ten years the Registry will appoint **one Deity of the Vale**. The
others will be "re-assigned", which nobody has come back from to explain.

And Pim is being **audited**. The original misfiling has been noticed. The
auditor is Clement, seraph first class, who is very thorough and quite kind and
will archive Pim if the Vale goes to anyone but you, because then the misfiling
will have "produced no corrective outcome". You are the corrective outcome.

### What you are fighting

- **Hurm, God of Fences.** Owns the middle village. Litigious. His faith is
  boundaries: who may cross, who owes what. His followers have fenced the river
  path. He sues.
- **Vellamine**, consolidated into the Vale too, still at your old desk, and
  for the first time losing.
- **Your own Scripture.** Chapter 1's Tablets are now ten years old. Children
  who learned them from their parents recite them, a little wrong, as law.

### Cast

| Who | Trait | Part |
|---|---|---|
| **Odo the Miller** | Literalist | Old now. Still at the stone every morning. He dies in season 20 |
| **Wenna** | Literalist | Odo's daughter. Learned the Tablets from him, exactly as he said them, which is not quite as you said them |
| **Aldous** | Ambitious | Whatever Chapter 1 made him: Archdeacon of the Committee, leader of the Correct, or chair of a reading group with views |
| **Hesper** | Poet | Author of the Book, which has started drawing pilgrims; guards it, and is starting to believe it |
| **Cob** | Drunk | Brenna's son. Runs the alehouse now. Brenna has retired to the best chair in it |

Elsewhere: **Clement** the auditor; **Hurm**'s reeve, **Master Pale**, who
writes everything in triplicate; **Gisla**, still Vellamine's.

### The spine

| Season | Scene | Choice | Comes back |
|---|---|---|---|
| before 1 | **Prologue: consolidation.** The Registry's notice; Clement's audit; the Vale (by legacy) | none | the ending |
| 1 | **The fence.** Hurm's followers have fenced the river path between the villages. It is, technically, a threshold | go round it / tear it down (a miracle) / bless it as a gate, so it is yours | the lawsuit (12); how the middle village sees you |
| 4 | **Margins.** Somebody in the downriver village has copied your Book and written notes in the margins. The notes are better | burn the copy / adopt the notes / ask whose notes they are | the Synod (24) |
| 8 | **Who keeps the stone.** Odo asks who will keep the stone after him | Wenna / Aldous / nobody: let it belong to the village | Odo's death (20); the Primate in Chapter 3 |
| 12 | **The case of the river path.** Hurm sues in the Registry's court. Your advocate is whoever you send | Aldous / Wenna / defend yourself (a disputation, by Scripture) | how the fence ends; Clement's view of you |
| 16 | **The pilgrims.** Hesper's Book draws pilgrims to Little Fretting, who want to see the things in it. Some of those things did not happen | build what the Book describes / tell them the truth / let Hesper guide them | Hesper's fate; the Book in Chapter 3 |
| 20 | **Odo's funeral.** The first of the old ones. Wenna recites the Tablets at the stone, from memory, as her father taught her | none; then **the generation turns** (below) | everything after |
| 24 | **The Synod of the Vale.** Clement calls the three faiths to make one Harmonised Text for the Vale. Each god sends a delegate | Hesper / Aldous / Wenna | the shared Scripture for the rest of the chapter |
| 30 | **Hurm's fence.** Whatever came of the river path, Hurm comes to you directly: his people are fencing *him* in | help him / leave him / take his village | Hurm in Chapter 3 |
| 36 | **The audit.** Clement shows you the file. The misfiling can be pinned on Pim, or on you | take the blame (your file is marked; Pim is safe) / say nothing | the ending; Pim in Chapter 3 |
| end | **The appointment.** The Registry names the Deity of the Vale. What became of everyone | last choice (below) | Chapter 3 |

**Last choice:** if you are appointed, Little Fretting's stone may become the
Vale's high altar (moved downriver, where more people can see it) or stay
where Odo knelt.

### New mechanics Chapter 2 needs

1. **Generations.** At season 20 the generation turns: the oldest four of your
   people (and each rival's) pass on, and their heirs take their places with
   the same trait. Every Tablet is then recited once by an heir, through the
   telephone, and the result replaces it: the Scripture drifts by a
   generation. Measured question: does a whole drift pass make the chapter too
   swingy?
2. **The Harmonised Text.** At the Synod, each god's two best Tablets go
   through all three delegates in turn. What comes out is carved as shared
   Scripture: in force for every god in the Vale, and doing most good for
   whoever's verse survived best. Measured question: does the delegate choice
   move the win rate by more than the noise, and is any delegate always right?
3. **The lawsuit.** A disputation in the Registry's court: your advocate's
   trait bends your argument (a Literalist cites, a Poet moves the court, an
   Ambitious advocate asks for costs). Win and the fence goes; lose and you pay
   Offerings and the path stays closed (your missionary cannot reach the
   middle village without a season on the road).
4. **The audit.** Clement's opinion of you, a hidden number moved by the
   lawsuit, the Synod and the audit choice, read in the ending and Chapter 3.

### Endings

| Outcome | What it means here |
|---|---|
| Appointed (promoted) | Deity of the Vale. Clement closes the audit. Pim keeps the job |
| Every rival fell | The Vale is yours without a ruling; Clement notes it, slightly alarmed |
| Passed over | The Vale goes to someone else; you are "re-assigned" to Little Fretting alone, which you find you do not mind; Pim's audit stays open |
| Absorbed | You become a saint in the winner's Vale; Pim is archived, unless you took the blame |
| Forgotten | The Archive; Pim walks your file down, and stays |

Fates to write: Odo (by Chapter 1's stone and this chapter's stone keeper),
Wenna, Aldous (seven variants across both chapters), Hesper (by the pilgrims),
Cob and Brenna, Hurm, Vellamine (by the corridor, and how she lost), Clement,
Pim (by the audit).

---

## Chapter 3: The Overcrowded Heavens

**Fifty seasons. Six villages in three regions. Rivals: Vellamine, Hurm,
Ysolde (Goddess of Unsolicited Advice), Old Brannoch (God of Slightly Better
Bread).**

### Premise

The seventh seat of the High Pantheon, empty for an age, is to be filled. Every
god applies. The Registry's selection takes twelve years and a great many
forms. You are a candidate because Pim filled in your form without asking,
twice, to be sure.

You arrive at the start of the chapter as a guest at your own festival. Your
faith is now a Church: it has a Primate, a calendar, a budget, and opinions
about you. **The institution does not need you.** It only needs your name.

### What you are fighting

- **Your Church.** Kind, competent, and increasingly sure it understands you
  better than you do.
- **The other candidates**, each a god you know: Vellamine, at last going for
  something she actually wants; Hurm, who has sued the selection committee;
  Ysolde, whose followers correct yours in the margins; Brannoch, who wins on
  merit, which is infuriating.

### Cast

| Who | Trait | Part |
|---|---|---|
| **Wenna, the Primate** | Literalist | Odo's daughter, head of the Church (if Chapter 2 gave her the stone; otherwise the Primate is Aldous's successor, an Ambitious man called Prosper) |
| **Hesper** | Poet | Very old. Keeper of the Book, which is now Scripture in six villages and taught in a version she no longer recognises |
| **Cob** | Drunk | Lay brother. Thinks the Church has got above itself and says so at length |
| **Tamsin** | Lazy | A child, Old Tam's granddaughter. Cannot be bothered with the Church, and so hears you plainly |

Elsewhere: **Pim**, now running the selection's paperwork; **Clement**; the
four rivals in person.

### The spine

| Season | Scene | Choice | Comes back |
|---|---|---|---|
| before 1 | **Prologue: the seventh seat.** The vacancy; Pim's two forms; the Church (by legacy) | none | the ending |
| 1 | **A guest at your own festival.** The Church holds your feast day. You are given a seat near the back | sit where you are put / take the high seat / leave early | how the Church treats you; the Closing of the Canon (16) |
| 6 | **Slightly better bread.** Brannoch's followers simply bake better bread. People are noticing | compete (a festival) / ally / steal the recipe in a Revelation | Brannoch's part at the end |
| 10 | **The interview.** Pim conducts your interview for the seat. Every question is answered by quoting your own Book back at you | defend the Book / disown it / let Hesper answer | the Reformation (32); the seat |
| 16 | **The Closing of the Canon.** The Church's council votes that you have said enough: no further Revelations will be received | accept it / smite the council / speak to Tamsin instead, outside the Church | your Revelations for the rest of the chapter |
| 24 | **The corridor, again.** Vellamine comes to see you. She knew about the re-filing, all along, from the first week | forgive / don't / say you knew too (if you congratulated her in Chapter 1, it was true) | the seat; her ending |
| 32 | **The Original Words.** A movement reads the Book's footnotes and demands "what the god actually said". They are mostly right | lead it / suppress it / let the Church and the movement argue it out | schism or reform; Hesper's fate |
| 40 | **Pim's last form.** Pim is offered the post of Registrar if you withdraw from the selection | withdraw / don't / ask Pim | Pim's ending |
| end | **The seat.** The High Pantheon decides | last choice (below) | the end of the game |

**Last choice:** if the seat is yours, take it, and leave Little Fretting and
the Church to manage without you, or refuse it and stay the god of a stuck
door in a village nobody up there has heard of. Neither is the wrong answer;
the epilogue of all three chapters is written from it.

### New mechanics Chapter 3 needs

1. **The Church as an actor.** Your Church takes its own act each season, like
   a rival but on your side: it carves Tablets in your name, holds festivals,
   names saints. Its choices follow the Primate's trait. Some help. You cannot
   stop it, only steer it.
2. **The Closing of the Canon.** If accepted, Revelations through the Church
   stop; the only way to speak is through Tamsin (one link, a Lazy child, no
   households but hers), or a Wonder.
3. **Schism and reform.** The Original Words movement is a faction inside your
   faith with its own souls; it rejoins you, splits from you, or replaces the
   Church, by the season-32 choice. This is the schism ending the brief asked
   for: "two lesser gods sharing one desk" is one of Chapter 3's losses.
4. **The selection.** Instead of one Review, three stages (seasons 20, 35, 50):
   the field narrows from five candidates to three to one, by the same
   standing as the Review (Faith, souls, leading, Heresy, Tablets doing good),
   each stage a scene.

### Endings

| Outcome | What it means here |
|---|---|
| The seat (promoted) | The last choice: take it or refuse it |
| Every rival fell | The Pantheon gives you the seat by default; Pim insists on a proper ceremony anyway |
| Passed over | Brannoch gets it (or Vellamine, if she forgave you): you go home to Little Fretting |
| Absorbed | Your Church outgrows you and keeps your name |
| Schism | Two lesser gods, one desk, alternating days. Pim makes a rota |
| Forgotten | The Archive. Tamsin still talks to you. Some things are not on file |

The game's final epilogue reads all three legacies: Odo's door, Wenna's
Church, Hesper's Book, Aldous's minutes, Vellamine's postcard, Pim's career.

---

## Writing budget

| | Chapter 2 | Chapter 3 |
|---|---|---|
| Scenes (with outcomes) | 11 | 9 |
| Choice outcomes | about 28 | about 24 |
| Fates | about 25 lines | about 30 lines |
| New rival lines (Hurm; Ysolde, Brannoch) | 8 | 12 |
| Endings and last choices | 5 + 2 | 6 + 2 |

At Chapter 1's pace, each chapter is a full build of its own: write, play,
measure. Recommended order: Chapter 2's scenes up to the Synod (season 24), the
generation mechanic and the Harmonised Text, then a playtest, before the rest.
