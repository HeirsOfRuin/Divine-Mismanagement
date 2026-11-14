# Divine Mismanagement — design spec

You are a minor god with twelve worshippers, and every one of them is an idiot.
Grow your faith into a major religion, despite them.

Status: **Stage 1 spec, approved by the author 2026-11-14.** Gate A passed.
Gate B passed with six faults open (`docs/KILLGATE.md`). Next: the engine.
Source: the author's concept brief, kept verbatim in `docs/CONCEPT.md`. This
spec answers the brief's open questions with a default each (section 10); the
author approved the spec without changing one, so the defaults stand.
Next gate: the kill gate (section 11), results in `docs/KILLGATE.md`. Every
number in this file is a starting guess, marked *(tuned)*, until the gate
measures it.

**Read `docs/FRAME-management.md` and `docs/KILLGATE.md` with this file.** On
2026-11-14 the author asked for a management sim, a look that is not a
children's game, and no repeats in a playthrough, and approved the frame that
answers them. Where the frame and this spec differ on acts per season, the
village meters, the win condition or the v0.1 scope, **the frame wins**; where
the kill gate measured something, the kill gate wins over both. Sections 3 to 7
below describe the telephone correctly and the rest of the game incompletely.

Companion documents: `docs/WORLD.md` (setting, cast, story, tone and the satire
dial) and `docs/DESIGN.md` (stack, engine, screens, look, build plan).

---

## 1. Setting

The Overcrowded Heavens. There are too many gods and not enough worshippers.
Divinity runs on belief, the market is saturated, and Heaven has responded the
way every institution responds: with a Registry, quarterly reviews and a
shortage of desks. You are a newly registered minor god with an oddly specific
domain, one village and twelve followers. A rival with better hair works the
same village.

It is a game because belief is scarce, contested and perishable, and because
the only tool you have for getting more of it is other people's mouths.

The setting is shared with the sister TTRPG *Acts of God*. There the god is
unreliable and the followers suffer; here the followers are unreliable and the
god suffers.

## 2. Pillars

1. **Indirect control.** The player never commands a follower. Everything
   passes through unreliable people.
2. **Words become permanent.** Mangled messages become Scripture, and Scripture
   constrains every later turn.
3. **Emergent comedy.** The jokes come from systems colliding (traits,
   Scripture, the rival), not from authored punchlines alone.
4. **Real stakes.** You can fade, fracture or be absorbed. Losing is possible
   and funny.
5. **The idiots are instruments.** A skilled player uses the flaws: a timid
   suggestion sent through a Zealot arrives as law. Every trait is the best
   route for something. *(Added by this spec; it is what turns the telephone
   game from a slot machine into a decision.)*
6. **Light and kind.** Nobody in the village is contemptible. The butt of the
   joke is the institution, the rival, or you.

## 3. Core loop (one turn = one season; 30 turns in v0.1)

Resolution order. A quiet turn (Stay Silent) is one tap.

1. **Dawn.** Prayers arrive (0-2). At most one event is drawn.
2. **Divine act.** The player takes exactly one:
   Revelation, Miracle, Answer a Prayer, Anoint, or Stay Silent.
3. **Telephone** (if a Revelation was sent). The message passes down the chosen
   chain; each link's trait rewrites it; the result is carved as a verse.
4. **The village lives.** Followers obey the active Scripture as written;
   verse effects apply; devotion moves.
5. **The rival acts,** through the same functions the player uses, including
   her own idiots and her own telephone.
6. **Collection.** Faith accrues (times the Mystery multiplier) and decays;
   Mystery drifts; entitlement moves.
7. **Heresy check.** Contradicting verses raise Heresy; past the line, a
   household breaks away.
8. **Chronicle.** One record of the season is written; the turn digest is read
   from it.

Every fourth turn is year's end (a short Registry memo). Turn 30 is the Review.

### 3.1 The Revelation (answers brief question 1: modular blocks)

A Revelation is built from word blocks in fixed slots:

```
WHO          MODAL    VERB    OBJECT        WHEN
The faithful should   wash    their hands   before meals
```

The player picks a template for a village problem (hygiene, harvest, giving,
rest, welcome) and may swap blocks within it. Each block carries tags the engine
reads (who it covers, how strongly, which part of village life it touches).
Free text is out: it cannot be mutated reliably or turned into effects.

### 3.2 The chain (the per-turn decision lives here)

The village is four households of three. A verse is adopted only by households
the message passed through. The player picks the chain: the Prophet first, then
up to three more followers, one per household.

- A short chain is accurate and reaches few.
- A long chain reaches everyone and arrives as something else.
- The order matters: a Lazy link after a Zealot drops the threat; before, it
  drops the part the Zealot would have escalated.

### 3.3 The six traits (v0.1)

| Trait | Rewrite | Best used for |
|---|---|---|
| Literalist | Removes all judgement: "before meals" becomes "immediately before every meal, including snacks" | Making a verse stick exactly; high compliance |
| Drunk | Swaps one word for one that sounds like it | Nothing reliable. Cheap Mystery when it lands somewhere strange |
| Ambitious | Adds a rider that benefits the speaker | Fast Faith income (they collect hard), at the price of a future rival priest |
| Poet | Makes it beautiful and unclear | Mystery, and softening a verse you regret |
| Lazy | Drops a slot | Trimming a rider or a threat off a verse |
| Zealot | Raises the modal to at least "must", widens WHO and adds a threat | Getting law out of a suggestion without spending Power |

Traits are hidden until a follower has carried one message; after that the
trait is printed on their card for good *(answers brief question 3)*.

### 3.4 Scripture (answers brief question 2)

The verse the last link speaks is carved. It is stored as the same slot
structure the Revelation had, and **both the words on the Scripture page and the
verse's effects are computed from that one structure** (so the page can never
say one thing while the engine does another).

| Slot | What the engine reads | Effect |
|---|---|---|
| VERB | Its domain: hygiene, labour, giving, rest, welcome, praise, abstaining | Which village meter moves (Bread, Cheer) or Faith income |
| MODAL | Strength 1-4: may, should, must, must-or-else | Compliance and Faith per season; strength 4 adds fear (Cheer down, Heresy up when contradicted) |
| WHO | Scope: one household, the faithful, all, all including strangers | Multiplier; widest scope also annoys the rival's flock |
| OBJECT | Still in the verb's domain, or not | In domain: the practical benefit. Out of domain ("wash before eels"): the benefit is lost and an **Oddity** is created: a named ritual that yields Mystery and a little Faith and costs upkeep |
| WHEN | Frequency | Scales both benefit and burden |
| RIDER | Who profits | Coin and devotion flow to that follower; their standing as a future schism leader grows |

So a garbled verse is not simply a failed verse. It trades usefulness for
strangeness, and strange religions are memorable. That is the Mystery economy
from the other side.

**Active doctrine is capped at seven Tablets.** An eighth verse retires the
oldest to the Apocrypha, which is readable history and has no effect. (A capped
list is the brief's own answer to Scripture becoming noise.)

**Contradiction.** Two active verses in the same domain with opposite polarity,
or two claims on the same object, raise Heresy every season, by household.

## 4. The scarce resource

**Fidelity.** You have Power and can get Faith; what you cannot buy is being
understood. Reach costs accuracy, and every carved verse narrows what the next
one can say without contradiction.

The earlier games made coin, land, men, fame, fitness and legitimacy scarce.
None made the player's own instructions the unreliable thing.

Meters:

| Meter | Rises with | Spent on / drives | Trouble |
|---|---|---|---|
| **Faith** | Worship, answered prayers, obeyed verses | Converts to Power each season | At zero for 3 seasons: Forgotten |
| **Power** | Faith | Miracles, Revelations past the first link, Anointing | None left: you can only watch |
| **Mystery** (0-100) | Silence, ignored prayers, Oddities, rare miracles | Multiplies Faith income (x0.5 to x1.5 *(tuned)*) | Each miracle lowers it; low Mystery breeds Entitlement (prayers become demands, ignored demands cost devotion) |
| **Doctrine** | Active verses that do not contradict | Unlocks rituals; steadies devotion | Contradictions convert it to Heresy |
| Bread, Cheer (village) | Verse effects, miracles, events | Followers' devotion and wants | Hungry or miserable followers listen to the rival |

Whether the village needs both Bread and Cheer is a kill-gate question: a meter
that never changes a decision is deleted.

## 5. The per-turn decision

One act per season, so every act is paid for with the four you did not take.
The village has a problem (a want, a prayer, a rival's move, a verse gone
wrong). Fix it directly with a miracle and spend Power and Mystery; fix it
permanently with a Revelation and accept what your people do to the wording;
answer the prayer and be loved but ordinary; reshuffle who speaks for you; or
say nothing and let silence rebuild awe. Inside a Revelation, weigh reach
against fidelity, and which idiot to aim at which word.

## 6. The ways to lose

1. **Forgotten.** Faith at zero for three seasons. You are archived.
2. **Absorbed.** The rival holds a majority of the village (19 of 36). You
   become a minor saint in her faith, with a feast day nobody keeps.
3. **Schism** *(from the slice onward, not v0.1)*. Heresy splits the flock for
   good and you finish as two lesser gods sharing one desk. A loss with a
   consolation ending.

## 7. The one way to win

**Pass the Review.** At the end of the run the Registry audits you: Faith over
the line, a majority of the village, and Heresy under the line. In v0.1 that is
turn 30 and one village; in the full game it is the third Review and promotion
to the High Pantheon. The same test applies to every domain and start.

## 8. Starts, difficulties, backgrounds

- **v0.1:** one start. The player names their god; the village, followers and
  seed are generated.
- **Slice onward:** a choice of three domains, each a different lean with a
  measured difference (see `WORLD.md` section 4). A domain that does not move
  the numbers is cut *(answers brief question 4)*.
- **Meta-progression: none** *(answers brief question 5)*. A run is 30 to 60
  turns and should stand alone. What carries between runs is the keepsake: every
  finished run's Scripture can be copied out as text, and the title screen
  keeps a shelf of your past holy books.

## 9. What carries over from earlier games / what does not

Carries over:
- Pure seeded engine, named RNG streams, one ledger chokepoint, versioned saves
  with text export (all builds).
- The rival plays by the player's rules through the same functions (The Lists,
  Touchline). Her Scripture is mangled by her own idiots and the player can
  read it.
- Choices show what is at stake, computed from real effects (Knight of Adalia).
  Here: the Reveal screen shows what each link is *known* to do, never what the
  verse will become.
- Tutorial as predicates, saved with the game (Centennial Farm, The Company).
- Sprites animated in code from a master palette (Vikingr, Knight of Adalia).

Does not carry over:
- Historical grounding. This is the first invented, comic setting; there is no
  source table to be faithful to. The discipline moves to tone (`WORLD.md`).
- The dark, grounded palettes. This game is pastel daylight.

## 10. Open questions for the author

| # | Question | Default if unanswered |
|---|---|---|
| 1 | Modular word blocks for Revelations? | Yes (3.1) |
| 2 | Traits hidden until first witnessed? | Yes (3.3) |
| 3 | One divine act per season, or an action budget? | One act. Simpler, and it makes silence a real choice |
| 4 | Is garbling partly good (Oddities yield Mystery)? | Yes. Otherwise the best play is always the shortest chain |
| 5 | Does the rival run her own telephone with her own idiots? | Yes. Same function, nearly free, and reading her Scripture is a reward |
| 6 | What win rate should a competent player see in v0.1? | 30-40% for the adaptive bot, since losses are short and funny. This is a preference, not a finding; say the number you want |
| 7 | Domain choice in v0.1? | No. Name only; three domains arrive with the slice |
| 8 | Which canon from *Acts of God* is binding here (names of gods, how belief works, the Pantheon)? | None assumed. `WORLD.md` section 9 lists what this game invents so it can be reconciled |
| 9 | How sharp is the satire? | The dial in `WORLD.md` section 6: warm and absurd, low bite, no darkness |

## 11. The kill gate (two parts)

**Gate A: is one mutation funny?** The brief's own first test. A script prints
20 Revelations passed down seeded chains, each step shown. The author reads
them. If they are not funny, stop and fix the phrase tables before any other
work; no instrument can judge this.

**Gate B: are the decisions real?** Numbers only, no UI. Fixed policies x 200
seeds x 30 turns:

| Policy | What it tests |
|---|---|
| Silent god | Is doing nothing forever a loss? (It must be.) |
| Miracle spammer | Does Mystery and Entitlement actually punish it? |
| Short-chain revealer | Is fidelity without reach enough? (It must not be.) |
| Long-chain revealer | Is reach without fidelity enough? (It must not be.) |
| Trait-aware adaptive | Does aiming idiots beat every fixed policy? (It must.) |

Pass: the policies differ by more than the noise floor; the win is reachable
and not trivial; nothing fixed dominates; each trait is the best route for at
least one goal; removing either village meter changes outcomes (or the meter
is cut).

---

## Decisions log
Newest first. Quote the author; give the numbers with their run counts.

| Date | Decision |
|---|---|
| 2026-11-14 | **Gate B, round 1** (`docs/KILLGATE.md`). The three kill criteria pass: doing nothing wins 2%, staffing alone 2%, acts with no staff 1%, no Scripture 6%, miracles alone 13%, two-link chains 28%, four-link 13%, adaptive 51%, never resting 56% (1,000 seeds each, ±0.3 to ±1.6). Who holds an office moves the win rate 23 to 55 points in five offices of six (500 seeds a cell). Six faults open: silence is never the right choice; a second act is worth less than nothing; the Ambitious are best at nothing; the Witness does not matter; Forgotten never happens in 12,000 runs; Faith is never the binding constraint. Not tuned away. |
| 2026-11-14 | **Four answers from the author.** Gate A: "Yes, but don't try too hard, it should be clever." Scope: "Start with your recommendation" (frame option B). Style tile 2: "Looks better!" Tone dial: "Yes". Gate A passes; the frame is approved; "clever, not trying" is hard rule 8 in `WORLD.md`. |
| 2026-11-14 | **Three directions from the author** (`docs/FRAME-management.md`). "Make sure this isn't the only interaction with the devotees. I want this to feel like a satirical management sim that uses his misunderstanding devotees to build his faith, expand his influence, perform miracles, and defeat other gods." "I want you to make sure it looks kinda cute and fun, but it also can't look like a children's game." "I don't want any repeats of an event or scene in any play through". Done: the no-repeat rule is in the engine (`src/engine/deck.js`) and tested over 200 playthroughs of 20 Revelations with zero repeats; at the half-size Gate A tables it leaves a trait with nothing new to say in 8-12% of turns and 6.5% of carvings without an aftermath line (500 playthroughs). Style tile redrawn. Proposed, not approved: six ways to work through devotees, a staffing board of six offices, Works, Legends, Offerings, two acts a season, the rival can be defeated. No Gate A verdict was given with this message; the gate is still open. |
| 2026-11-14 | **Gate A built.** 20 seeded chains in `docs/GATE-A.md`, awaiting the verdict. Two rules changed from this spec while building, both after reading the first print: a Zealot always produces at least "must" and a threat (section 3.3 said one step up), and Lazy prefers riders and threats over the object and the ending. Measured over 2,000 chains: six stock poetic endings supply about a quarter of all verse titles; 8.8% of verses exceed 140 characters; 0.1% arrive unchanged. |
| 2026-11-14 | **Spec approved.** The author: "Approved, build Gate A and show me the 20 chains". No default in section 10 was changed, so all nine stand, including the 30-40% win-rate target, which is still the spec's guess and not the author's stated number. |
| 2026-11-14 | **Tone and look.** The author: "I want it to be light, airy, fun, humorous, and full of fun/cute pixel art". Recorded as pillar 6 and as the visual identity in `DESIGN.md` section 5. |
| 2026-11-14 | Spec drafted from the concept brief (`docs/CONCEPT.md`). The brief's five open questions are answered with defaults in sections 3, 8 and 10; none is approved yet. Repo scaffolded in shape B; the placeholder game is still in `src/`. |
