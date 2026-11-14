# Divine Mismanagement

You are a minor god with twelve worshippers, and every one of them is an idiot.

**Playtest build:** https://claude.ai/artifact/8jDtk9gwMTvE1joPgCJ3jA (private to the author until shared).

Status (2026-11-14): **playable, with match setup.** Story (three chapters) or
Custom (1-5 rivals, 1-5 regions, starting resources, 30-60 seasons). Rank, the
rare acts (High Prophet, holy objects, Wonders, Saints) and the Holy Book are in
(`docs/FRAME-expansion.md`). Earlier: One village of 36,
one rival, thirty seasons, the six offices, eight acts, Scripture carved by the
telephone, miracles told by a Witness, Works, rulings, the Registry and the
Review. Nothing authored is shown twice in a playthrough. Not yet played by the
author; the balance is measured, not felt (`docs/BALANCE.md`).

Read `docs/SPEC.md` (rules and every decision), `docs/FRAME-management.md` (the
approved management design and look), `docs/WORLD.md` (setting, story, tone),
`docs/DESIGN.md` (engine and screens, with an as-built section) and
`docs/BALANCE.md` (what the instruments measured, and what is still open).

## How to play

Each season you do one thing. You cannot speak to anyone directly.

- **Flock**: post your twelve people to six offices. Who holds an office
  decides how it is done; a trait shows once someone has worked an office,
  carried a message or been sent a dream.
- **Village**: rule on any problem brought to you, then take the season's act:
  a Revelation, a miracle, an answered prayer, a dream, a festival, a
  disputation, answering one of her neglected people, or silence.
- **Scripture**: what reaches the end of a Revelation's chain is carved and
  does what it now says, every season.
- **Heavens**: where you stand against the Review, and what she is up to.

Win by passing the Review after season 30, or by bringing the rival under four
souls for two seasons. Lose by falling under the Registry's line two years
running, or by her taking the village.

## Play as an app

Once the Pages workflow has run on the default branch: open
https://heirsofruin.github.io/Divine-Mismanagement/ on a phone and choose Install (Chrome)
or Share → Add to Home Screen (Safari). It plays with the network off. Saves
live in that browser; Menu → Copy a save code moves a game anywhere.

## Run

```
npm run serve        # then open http://localhost:8000
npm run build        # dist/<slug>.html (one file), dist/site/ (installable)
```

## Check

```
npm run check     # tests, a 50-game bot batch, the bundle, the bundle check, the phone smoke test
```

Must pass before every commit.

## Instruments

| Command | Question |
|---|---|
| `npm test` | Is it true? Invariants (ledger, souls, bounds, determinism), save contract, telephone, no repeats in 100 playthroughs |
| `npm run gate` | Are the decisions real? Policies, who suits which office, what stops a god (`--only=policies,offices,review`) |
| `npm run fork` | Which act is best from a given position? Plays every act from the same mid-game state |
| `npm run telephone` | Twenty chains to read; `--run` one playthrough; `--stats` repetition and length |
| `npm run sim -- --runs=200 --by=policy` | Batch runs by policy, ±1 SE (game-measure) |
| `npm run sim -- --trace --seed=3` | One game, season by season |
| `npm run smoke` | Does the real page work at 390px? |

## Layout

```
src/data/          logic-free tables: config, offices, lexicon, phrases, followers, traits
src/data/content/  authored lines: wants, incidents, legends, rulings, memos, rival, endings
src/engine/        pure: state, turn, acts, offices, scripture, meters, rival, derive,
                   telephone, render, deck, content, rng
src/ui/            screens and sprites; read the engine, compute nothing
sim/               bot policies, adapter, gate tables, fork tool, game-measure kit
prototypes/        the retired kill-gate model (Stage 2 record)
test/              invariants, save contract, telephone, fixtures
tools/             bundle, check-bundle, smoke, telephone, make-fixture, icons, stamp, browser
```

## Sources

None. The setting is invented and no figure in it is historical.
