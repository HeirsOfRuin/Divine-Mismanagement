# Kill gate B: are the decisions real?

**Retired 2026-11-14.** The engine now runs the same tables (`npm run gate`,
`sim/gate.mjs`) and its results are in `docs/BALANCE.md`, which supersedes
the numbers below. `prototypes/killgate/` is kept as the Stage 2 record and is
not maintained.

Stage 2 of the workflow. A numbers-only model of the management game proposed
in `FRAME-management.md`: two gods, one village of 36, twelve named devotees
each, six offices, three miracles, six Works, Scripture carved by the real
telephone. No screen, no prose. It asks whether the choices matter as a table
of numbers before anything is built on them.

**Verdict (round 1, 2026-11-14): the three kill criteria pass; six design
faults are open.** Strategies differ by far more than the noise, the win is
reachable and not trivial, and no fixed strategy dominates. But several things
the frame claims are not true in the numbers yet, listed under "Faults". The
recommendation is to go on to the engine with those six carried as open, not
to tune them away here.

## How it was measured

Files in `prototypes/killgate/`. Command: `npm run gate` (add `--runs=1000`,
`--only=policies|offices|acts`).

| File | What |
|---|---|
| `data.mjs` | Every tunable number. The trait-by-office table of the frame, as numbers |
| `model.mjs` | The rules. Deterministic (named RNG streams); refuses a run whose clock stops |
| `policies.mjs` | Twelve fixed policies and the house rival, each a written rule |
| `gate.mjs` | The three tables below |

Verses are made by `src/engine/telephone.js`, so the Scripture in the model is
the Scripture of the game. A policy may read a devotee's trait only once it is
known (they carried a message, held office a season, or were sent a dream).

Simplified on purpose: the flock's devotion is one number, not twelve; converts
beyond the named twelve are a count; a prayer has no content; there are no
events. The rival is the same model under a fixed policy ("staffs without
looking, builds, works a sign when she has Power to spare").

Every rate carries one standard error. The noise floor between two cells is
about 4 points at 1,000 seeds, 6 at 500.

## What was wrong with the first model

Four rounds. The first print was badly broken, which is the point of the gate:

| Found | Cause | Change |
|---|---|---|
| A god who did nothing won 40% | The rival destroyed herself: her miracles drove entitlement to 45 and her flock left | Rival works a sign only when her flock is not already spoiled; she answers prayers |
| A silent god's Faith climbed to 84 | Silence added Mystery without limit, and Mystery multiplies worship | Mystery is pulled back toward 50 each season; a fully silent season costs a little devotion |
| Never sending a Revelation won 87%, sending them 54% | Fear and riders each added half a point of Heresy per verse per season: seven Tablets meant a schism every few years | Both cut to 0.2; Heresy fades faster |
| "Answer a rival's neglected follower" won games alone | It worked whenever her devotion was under 5, twice a season | Needs three unanswered prayers on her side; once a season; costs 3 |
| Two zealots in office emptied a flock | Office effects on devotion outweighed its pull back to 5 by ten to one | Effects halved, pull tripled |
| Faith 45 at the Review was met by everyone | Decay was too slow | Decay 10%; Review asks 110, and three Tablets in force that do some good |

## Table 1: policies

1,000 seeds each, 30 seasons, two acts a season. Win means passed the Review
or the rival fell.

| Policy | The rule | Win | Passed Review | Rival fell | Passed over | Absorbed |
|---|---|---|---|---|---|---|
| silent | Posts nobody, does nothing | 2% ±0.4 | 0% | 2% | 34% | 64% |
| staff_blind | Six postings picked without looking; no acts | 2% ±0.5 | 0% | 2% | 51% | 47% |
| staff_aware | Best known fit in each office; no acts | 2% ±0.5 | 0% | 2% | 58% | 40% |
| no_staff | Never posts anyone; otherwise adaptive | 1% ±0.3 | 0% | 1% | 25% | 74% |
| no_scripture | Adaptive, but never a Revelation | 6% ±0.8 | 0% | 6% | 77% | 17% |
| miracles | Blind postings; two miracles a season | 13% ±1.1 | 0% | 13% | 66% | 21% |
| long_chain | Blind postings; Revelations through all four households | 13% ±1.1 | 12% | 1% | 17% | 70% |
| short_chain | Blind postings; Revelations through two people | 28% ±1.4 | 25% | 2% | 22% | 51% |
| rests_third | Adaptive, silent every third season | 44% ±1.6 | 37% | 6% | 16% | 41% |
| adaptive | Aware postings, aimed chains, miracles when awe is high, rests when it is low | 51% ±1.6 | 44% | 7% | 13% | 36% |
| crusader | Adaptive postings; Power goes on the rival first | 51% ±1.6 | 36% | 14% | 39% | 10% |
| never_silent | Adaptive, never rests | 56% ±1.6 | 46% | 10% | 12% | 32% |

What it shows:

- **Both halves are needed.** Staffing with no acts wins 2%. Acts with no
  staff win 1%. Staff and acts without Scripture win 6%. The management layer
  and the telephone are each necessary, which is what the frame set out to do.
- **Reach against fidelity is real.** Two links beat four by 15 points; aiming
  the chain by known traits beats both by another 23.
- **Miracles alone do not carry a religion** (13%), and they never pass a
  Review.
- **Fighting the rival is a different game, not a better one.** The crusader
  wins as often as the adaptive god, but is absorbed 10% of the time instead
  of 36%, and is passed over 39% instead of 13%: safe, and stuck.
- **Nobody is ever Forgotten.** See Faults.

## Table 2: who should hold which office

Adaptive play, one devotee given one trait and held in one office all run. 500
seeds a cell. Win %, with the spread between best and worst.

| Office | Literalist | Drunk | Ambitious | Poet | Lazy | Zealot | Spread |
|---|---|---|---|---|---|---|---|
| Prophet | 58 | 24 | 58 | 24 | 30 | **59** | 36 |
| Preacher | 59 | 73 | 52 | 67 | **75** | 56 | 24 |
| Missionary | 37 | 56 | 47 | 6 | 8 | **61** | 55 |
| Collector | 51 | 51 | 55 | 41 | 40 | **63** | 23 |
| Builder | **59** | 53 | 49 | 26 | 31 | 58 | 32 |
| Witness | 54 | 50 | 53 | 50 | 51 | 57 | 7 |

What it shows:

- **Staffing matters.** Five of six offices move the win rate by 23 to 55
  points depending on who holds them. The staffing board is a real decision.
- **The best preacher is the lazy one.** Short services keep people fond of
  you; the zealot and the ambitious preacher bring in the most Faith and are
  the worst, because Faith is not what runs short. Nobody would guess that,
  and it is the kind of result the game wants.
- **The careful bot's beliefs were wrong** in three offices (it prefers a
  zealot preacher). A player will have to learn this too.

## Table 3: acts a season

Adaptive play, 500 seeds.

| Acts allowed | Rests when awe is low | Never rests |
|---|---|---|
| 1 | 65% ±2.1 | 65% ±2.1 |
| 2 | 51% ±2.2 | 57% ±2.2 |
| 3 | 49% ±2.2 | 55% ±2.2 |

Being allowed more acts makes the bot worse. Read with care: when a result
surprises, suspect the bot first. The bot fills its second act with small
things (answering a prayer, a dream), and each act costs 2 Mystery. So this
says the small acts are priced below zero, and it may also say the bot is
careless. It does not yet say one act is the right number.

## Faults (carried forward, not tuned away)

1. **Staying Silent is not a decision.** Resting when Mystery is low loses 5
   points to never resting (51 against 56, floor 4), and resting every third
   season loses 12. The brief says silence should be "valid and sometimes
   optimal". In these numbers it never is. Scripture's Oddities keep Mystery
   high without it.
2. **A second act is worth less than nothing** as priced (Table 3).
   Answering a prayer returns 2 Faith and a little devotion and costs 4
   Mystery in all.
3. **The Ambitious are never the best at anything, and a Poet or a Lazy
   missionary is a catastrophe** (6% and 8%). Their intended compensations
   (a charmed village, a blunted rival) do not pay. The frame's claim "every
   trait is the best holder of one office" holds for Zealot (three offices),
   Lazy and Drunk (preacher) and Literalist (builder), and fails for Ambitious
   and, within noise, Poet.
4. **The Witness does not matter** (spread 7, at the noise floor). The bot
   works 0.6 miracles a run, so who reports them cannot matter. Either
   miracles need to be worth doing more often, or the Witness is decoration.
5. **Forgotten never happens** in 12,000 runs. Worship continues at any
   devotion, so Faith never reaches zero. As specified it is a loss state that
   cannot occur.
6. **Faith is not the binding constraint.** The adaptive god finishes on 158
   against a Review line of 110. Souls and Doctrine decide the Review. The
   meter the game is named around is the one that never runs short.

Also noted: the adaptive win rate (51%) is above the 30-40% the spec guessed
at. That is a threshold to set once the faults are fixed, not before.

## What this means for the build

- Go ahead with the engine on the frame's shape: offices, Works, miracles with
  a witness, Scripture effects from verse structure, a rival on the same rules.
- Treat faults 1 to 6 as the first design work inside it, each with its own
  measurement. Faults 1, 2 and 6 are one knot (what Mystery and Faith are
  for); 3 and 4 are the trait-by-office table needing a second pass.
- This model is retired when the engine can run the same tables.

## Decisions wanted from the author

| # | Question | Recommendation |
|---|---|---|
| 1 | One act a season or two? | One act plus the staffing board, until a second act can be shown to be worth taking |
| 2 | Should Forgotten stay as a way to lose? | Yes, redefined: you are Forgotten when Faith falls under a floor that rises each year (the Registry's minimum), so a drifting god is archived instead of merely passed over |
| 3 | Is "the laziest preacher is the best one" the tone you want from the numbers? | Yes. It is the game's joke stated as a balance result |
