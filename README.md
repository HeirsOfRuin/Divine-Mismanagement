# Divine Mismanagement

You are a minor god with twelve worshippers, and every one of them is an idiot.

Status (2026-11-14): both kill gates passed; no playable game yet (the page
still shows the scaffold's placeholder).

- Gate A: the telephone mechanic is funny (`docs/GATE-A.md`; `npm run telephone`).
- Gate B: the management decisions are real, with six faults open
  (`docs/KILLGATE.md`; `npm run gate`).

Read `docs/SPEC.md` (rules), `docs/FRAME-management.md` (the approved
management-sim design, the look, the no-repeat rule), `docs/WORLD.md` (setting,
story, tone) and `docs/DESIGN.md` (engine, screens, build plan). Next: the
engine.

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
| `npm test` | Is it true? Invariants and the save contract |
| `npm run sim -- --runs=200 --by=difficulty` | Is it balanced? Batch runs by cell, ±1 SE (game-measure) |
| `npm run sim -- --trace --seed=3` | One game, turn by turn |
| `npm run smoke` | Does the real page work at 390px? |

## Layout

```
src/data/     logic-free tables
src/engine/   pure: rng, state (save contract), turn, derive, ledger
src/ui/       screens; read the engine, compute nothing
sim/          bot, adapter, game-measure kit
test/         invariants, save contract, fixtures
tools/        bundle, check-bundle, smoke, icons, stamp, browser
```

## Sources
<!-- Real figures and their sources; "rounded for a game, do not cite". -->
