# Balance: what the instruments measured on the engine

The Gate B tables (`docs/KILLGATE.md`, now retired) re-run on the real game,
2026-11-14. Commands: `npm run gate` (`--only=policies|offices|review`,
`--runs=N`, `--office=`, `--policy=`) and `npm run fork`. Every rate carries one
standard error. The noise floor between two cells is about 6 points at 500
seeds, 7 at 400 and 8 at 300; a gap under it is not a result.

Nothing here has been checked by a person playing. These are the numbers a
careful playtest should argue with.

## Round 6 (2026-11-17): Chapter 2 to the Synod

Chapter 2 built to season 24 (the margins, the stone keeper, the lawsuit, the
pilgrims, Odo's funeral and the generation, the Synod). Careful play, 200
seeds each (floor ~10 points):

| Chapter 2 | Win |
|---|---|
| As built | 35.0% ±3.4 |
| Generation switched off (nobody dies) | 36.5% ±3.4 |
| Synod delegate Hesper / Wenna / Aldous | 35.0% / 41.0% / 41.5% |
| Lawsuit advocate Wenna / Aldous / yourself | 35.0% / 38.0% / 35.0% |

The design's two questions: a whole generation's drift does not make the
chapter swingy (1.5 points, under the floor; in a read-through game it
changed all seven of your Tablets, some for the better); and no delegate is
always right (6.5 points between them, under the floor). Round 5's fault is
closed without tuning: Chapter 2 is now below Chapter 1 (44.8%), where a later
chapter belongs. `hard` stays 1.

Where the 21 points went (56.0% with only the opening, 35.0% now): Hurm's
priest made a Literalist (Master Pale) is about 5 of them (40.0% ±3.5
without him, under the floor); no other single cause found, so the rest is
the new scenes' small costs together. Chapter 1 re-run after the `hard` knob:
44.8% ±2.5 (400 seeds), the same games seed for seed.

## Round 5 (2026-11-17): Chapters 2 and 3 open with a cast

Chapters 2 and 3 now have a fixed cast and an opening scene
(`docs/STORY-chapters-2-3.md`). Chapter 1 is unchanged: 44.8% ±2.5 (400
seeds), the same games seed for seed. The later chapters got easier, by more
than the noise (careful play, 200 seeds each, floor ~10):

| | Before | After |
|---|---|---|
| Chapter 2 | 35.5% ±3.4 | 56.0% ±3.5 |
| Chapter 3 | 44.0% ±3.5 | 57.5% ±3.5 |

Chapter 2 taken apart (200 seeds each): scenes without the cast 43.0% ±3.5;
cast and scenes with the scenes' meter effects removed 59.5% ±3.5. The cast is
most of it: five fixed people (two Literalists in Chapter 2) replace five
random ones, and the random flock was the harder one. Chapter 1's 41-45% was
measured with its cast in place, so Chapter 1 never showed this.

**Open, not tuned.** A later chapter should not be easier than the first. Not
tuned now because the rest of each chapter (generations, the lawsuit, the
Synod, the Church as an actor) is designed and not built, and will move these
numbers more than the opening does. Re-measure when Chapter 2's spine to the
Synod is built, and tune the chapter's thresholds then, aiming at or below
Chapter 1.

## Round 4 (2026-11-15): the story calibration

Registry goals removed; story scenes with small effects; the Committee's
standing effect. Chapter 1, careful play: 36% ±2.4 before softening the
Committee, 41% ±2.5 after (400 seeds); never silent 29%, crusader 38%, random
0% (400 seeds, before softening). Without the goals, careful play fell from 44%
to 36%: their rewards had been carrying it.

Story paths, careful play, 200 games each (floor ~10):

| Path | Win |
|---|---|
| Committee under Aldous, then dissolved (3 souls, Heresy +2) | 36% |
| ... dissolved, softened to 2 souls, Heresy +1 | 40% |
| Committee under Aldous, report endorsed | 49% |
| Committee under Odo | 50% |
| No committee | 47% |

## Round 3 (2026-11-14): after playtest 1

Guided start, Registry goals, villages in regions with travel
(`docs/FRAME-playtest-1.md`). Story Chapter 1, 400 seeds a policy (floor ~7):

| Policy | Win | Promoted | Rival fell | Passed over | Absorbed | Forgotten |
|---|---|---|---|---|---|---|
| silent | 0% ±0.3 | 0 | 0 | 0 | 0 | 100 |
| staff_blind / staff_aware | 0% ±0.3 | 0 | 0 | 19-22 | 2-11 | 70-76 |
| random | 1% ±0.4 | 0 | 1 | 38 | 40 | 23 |
| long_chain / short_chain / no_staff | 1-2% | 0 | 1-2 | 24-47 | 50-71 | 1-5 |
| miracles | 6% ±1.2 | 0 | 6 | 38 | 6 | 50 |
| no_scripture | 7% ±1.3 | 0 | 7 | 63 | 2 | 28 |
| rests_third | 26% ±2.2 | 17 | 10 | 58 | 16 | 0 |
| never_silent | 40% ±2.4 | 22 | 18 | 49 | 12 | 0 |
| no_rare | 44% ±2.5 | 22 | 22 | 49 | 8 | 0 |
| **adaptive** | **44% ±2.5** | 25 | 19 | 47 | 9 | 0 |
| crusader | 45% ±2.5 | 4 | 41 | 50 | 5 | 1 |

- **The guided start costs nothing measurable.** 44% against 41% before it,
  within noise: the goals' rewards make up for acts opening later.
- **Attacking the rival is now an equal route** (45%), won mostly by making her
  fall (41%) rather than at the Review.
- **Goals**: careful play meets 5.2 a game (200 games), the first by season 2.9
  on average.
- **Silence** is the best act in 8.2% of 159 mid-game positions, at higher
  entitlement (1.5 against 1.1).

Travel (120 games each): the missionary that moves when its village runs out
of the unclaimed, against one that never leaves home.

| Chapter | Travels | Stays home |
|---|---|---|
| 2: 3 villages, 2 rivals | 58% | 22% |
| 3: 6 villages in 3 regions, 4 rivals | 66% | 1% (absorbed 97%) |

So the map is a real decision. Those rates were too high, and the old
fair-share threshold scaling barely moved them, because a travelling player
ends with a third of a much larger world. Thresholds now scale from the share
of the whole population (`world.js`); Chapter 1 is unchanged by construction
(Faith 185, 23 souls). Re-measured, careful play: Chapter 2 36%, Chapter 3 46%,
custom two rivals in two villages on lean resources 15%, five rivals rich 51%;
random play 0-2% in every shape (120 games each).

## Round 2 (2026-11-14): rare acts, ranks, many gods and regions

After `docs/FRAME-expansion.md`. Story Chapter 1, 400 seeds a policy (floor ~7):

| Policy | Win | Promoted | Rival fell | Passed over | Absorbed | Forgotten |
|---|---|---|---|---|---|---|
| silent | 0% ±0.3 | 0 | 0 | 0 | 0 | 100 |
| staff_blind / staff_aware | 0% ±0.3 | 0 | 0 | 13-15 | 1-11 | 77-84 |
| short_chain / long_chain | 1% ±0.4 | 0 | 1 | 25-46 | 53-70 | 1-5 |
| random | 1% ±0.4 | 0 | 1 | 30 | 32 | 38 |
| miracles | 2% ±0.7 | 0 | 2 | 31 | 6 | 61 |
| no_staff | 3% ±0.8 | 0 | 3 | 25 | 68 | 5 |
| no_scripture | 3% ±0.9 | 0 | 3 | 52 | 1 | 45 |
| crusader | 16% ±1.8 | 1 | 14 | 69 | 6 | 10 |
| rests_third | 21% ±2.0 | 14 | 7 | 62 | 17 | 0 |
| never_silent | 41% ±2.5 | 25 | 16 | 49 | 10 | 0 |
| **adaptive** | **41% ±2.5** | 25 | 16 | 49 | 10 | 0 |
| no_rare (adaptive without the rare acts) | 43% ±2.5 | 23 | 21 | 47 | 10 | 0 |

- **On target.** Careful play wins 41%, the edge of the spec's 30-40%.
- **The rare acts pay for themselves, no more.** With them 41%, without 43%,
  within noise. They move wins from the rival falling (16% against 21%) to
  promotion (25% against 23%). Before the Saint's pilgrims and the bot's Faith
  reserve they cost 27 points (39% against 66% at the old Review line): the
  bot spent Faith the Review needed.

Offices (300 seeds a cell, floor ~8):

| Office | Literalist | Drunk | Ambitious | Poet | Lazy | Zealot |
|---|---|---|---|---|---|---|
| Prophet | 43 | 23 | 51 | 21 | 19 | **54** |
| Preacher | 23 | 27 | 30 | 22 | **42** | 32 |
| Missionary | 26 | **47** | 37 | 26 | 33 | 44 |
| Collector | 30 | 35 | **55** | 19 | 23 | 35 |
| Builder | 40 | 29 | 34 | 16 | 24 | **42** |
| Witness | 33 | 31 | 38 | 39 | 41 | **42** |

Lazy, Drunk and Ambitious each own an office; Poet is now level with the best
Witness (within noise); Literalist is within noise of the best Builder; Zealot
is best or level in three. Every trait is best or level-best somewhere.

Silence (`npm run fork`, 155 positions): the best act in 7.1%, up from 3.6%,
mostly where the flock is entitled (1.7 against 1.1 overall). A Sign is now the
most common best act (21%).

Other shapes (careful play, 150 games each; random play wins 1-3% in every one):

| Shape | Careful play | Promoted | Passed over | Absorbed |
|---|---|---|---|---|
| Chapter 2: 2 rivals, 3 regions, 40 seasons | 25% | 24% | 66% | 9% |
| Chapter 3: 4 rivals, 5 regions, 50 seasons | 41% | 41% | 49% | 10% |
| Custom: 2 rivals, 2 regions, lean, 30 | 25% | 25% | 49% | 25% |
| Custom: 5 rivals, 5 regions, rich, 60 | 66% | 66% | 3% | 31% |

With linear threshold scaling, Chapters 2 and 3 were won 2% and 0%; the gentler
scaling in `world.js` is what made them playable. They are lightly measured,
not balanced; the setup screen says so.

# Round 1 (superseded where round 2 differs)

## Table 1: policies (500 seeds each, 30 seasons, one act a season)

Win means promoted at the Review, or the rival fell.

| Policy | The rule | Win | Promoted | Rival fell | Passed over | Absorbed | Forgotten |
|---|---|---|---|---|---|---|---|
| silent | Posts nobody, does nothing | 0% ±0.2 | 0 | 0 | 0 | 0 | 100 |
| staff_blind | Six postings without looking; no acts | 1% ±0.3 | 0 | 1 | 17 | 16 | 67 |
| staff_aware | Best known fit; no acts | 1% ±0.3 | 0 | 1 | 24 | 2 | 73 |
| no_staff | Never posts anyone; otherwise careful | 2% ±0.7 | 0 | 2 | 18 | 73 | 7 |
| random | Random postings, acts and rulings | 3% ±0.8 | 0 | 3 | 30 | 34 | 32 |
| long_chain | Revelations through all four households | 4% ±0.8 | 1 | 2 | 29 | 61 | 6 |
| miracles | A miracle every season it can afford | 6% ±1.0 | 0 | 6 | 32 | 6 | 56 |
| short_chain | Revelations through two people | 7% ±1.2 | 4 | 3 | 49 | 42 | 2 |
| no_scripture | Careful, but never a Revelation | 7% ±1.1 | 0 | 7 | 62 | 2 | 29 |
| crusader | Careful postings; Power on the rival first | 34% ±2.1 | 4 | 31 | 45 | 5 | 15 |
| rests_third | Careful, silent every third season | 50% ±2.2 | 34 | 16 | 33 | 16 | 1 |
| never_silent | Careful, fills every season with something | 63% ±2.2 | 34 | 29 | 27 | 10 | 0 |
| adaptive | Careful postings, aimed chains, miracles when awe is high | 65% ±2.1 | 36 | 29 | 25 | 10 | 0 |

- **Both halves are needed.** Staffing alone wins 1%; acts with no staff 2%;
  everything but Scripture 7%. The management sim and the telephone each carry
  half the game.
- **Aiming the idiots matters.** Careful play wins 65%; the same acts through
  blind chains win 4-7%.
- **Attacking the rival is a different game, not a better one.** It wins half
  as often, is rarely absorbed (5%), and is Forgotten 15% of the time because
  it neglects Faith.

## Table 2: who should hold which office (400 seeds a cell)

Careful play with one office held all game by one devotee given one trait.

| Office | Literalist | Drunk | Ambitious | Poet | Lazy | Zealot | Spread |
|---|---|---|---|---|---|---|---|
| Prophet | **69** | 38 | 68 | 36 | 41 | **69** | 34 |
| Preacher | 47 | 53 | 44 | 46 | **67** | 46 | 24 |
| Missionary | 61 | **71** | 62 | 56 | 59 | 65 | 15 |
| Collector | 56 | 56 | **75** | 41 | 38 | 61 | 36 |
| Builder | **69** | 53 | 55 | 30 | 40 | 68 | 39 |
| Witness | 63 | 56 | 56 | 57 | 60 | **67** | 10 |

(The Witness row was measured in its own run after the last change to it;
the others in one run, all on the committed numbers.)

- Five of six traits are the best, or tied best, somewhere: Literalist
  (Prophet, Builder), Drunk (Missionary), Ambitious (Collector), Lazy
  (Preacher), Zealot (Prophet, Builder, Witness).
- No trait is a disaster anywhere. The worst cell is 30%; in Gate B a Poet
  missionary won 6%.
- Under miracle-heavy play (`--policy=miracles`) the Witness row spreads 12
  points, Zealot best (13%) and Poet second (7%), on a low base.

## Table 3: what stops a god (300 seeds)

Among games that reached the Review, the share missing each line; then how
many ended early.

| Policy | Reached | Missed Faith | Missed souls | Missed Heresy | Missed doctrine | Forgotten | Absorbed early |
|---|---|---|---|---|---|---|---|
| adaptive | 211 | 37% | 31% | 8% | 0% | 0% | 3% |
| never_silent | 214 | 39% | 34% | 7% | 0% | 0% | 3% |
| crusader | 155 | 93% | 48% | 4% | 5% | 15% | 3% |
| short_chain | 264 | 93% | 80% | 7% | 0% | 1% | 9% |
| random | 183 | 99% | 92% | 7% | 1% | 33% | 2% |

## Table 4: the best act, position by position (`npm run fork`)

196 mid-game positions (seeds 1-50 at seasons 6, 12, 18, 24). From each, every
act on a fixed menu is played for one season and careful play finishes the
game; same seed, so only the act differs. Ties go to acting.

| Best act | Positions |
|---|---|
| Revelation | 24.0% |
| Bounty | 19.9% |
| Answer a prayer | 15.8% |
| Smiting | 11.7% |
| Sign | 8.7% |
| Festival | 8.7% |
| Disputation | 7.7% |
| Silence | 3.6% |

Every act on the menu is the best one somewhere. Miracles together are best in
40% of positions, though careful play works only about four a game: the bot
under-uses them (game-building F13), which is why the Witness looks weak in
Table 2.

## The six Gate B faults, now

| # | Fault | Status | Evidence |
|---|---|---|---|
| 1 | Silence is never right | **Partly answered** | Silence is the best act in 3.6% of positions (7 of 196). As a strategy, never resting (63%) and resting when awe is low (65%) are level within noise. A mechanic that banked attention for the next act was built, measured inert (6.3% best with and without it), and removed |
| 2 | A second act is worth less than nothing | **Closed by decision** | One act a season (the author, 2026-11-14) |
| 3 | Ambitious best at nothing; Poet and Lazy missionaries catastrophic | **Mostly closed** | Ambitious is the best collector (75%); worst cell 30% (was 6%). **Poet is still best at nothing** |
| 4 | The Witness does not matter | **Partly answered** | Spread 10 points under careful play (floor 7), 12 under miracle-heavy play. Legends now pay for seasons. The rest looks like a bot that under-uses miracles (Table 4) |
| 5 | Forgotten never happens | **Closed** | The Registry's rising line: silent 100%, random 33%, crusader 15%, careful play 0% |
| 6 | Faith is never what binds | **Closed** | Faith is the Review line most often missed by every policy (37-99%) |

## Open, in order of what matters most

1. **Careful play wins 65%**, against the spec's target of 30-40%. Raising the
   Review line moves wins into "passed over" (measured at Faith 150 and 165);
   the rival falling (29%) does not move with it. The next step is a rival who
   defends her last few souls, then the Review line, measured together.
2. **Poet is best at nothing.** The Poet's currency is Mystery, and Mystery is
   not scarce enough to be worth a post.
3. **The reference bot under-uses miracles.** A bot that works them in the
   positions the fork tool favours would show whether the Witness matters.
4. **Rival devotees have no wants and the rival gets no rulings.** Her world is
   a little simpler than yours.
5. **None of this has been played by a person.**
