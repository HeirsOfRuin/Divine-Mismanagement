# Divine Mismanagement — Phase 0 design proposal

Stage 3 of the workflow: stack, architecture, engine, schema, screens, look and
build plan, for the author's approval before game code. Inputs: `SPEC.md`
(rules), `WORLD.md` (setting and tone), `CONCEPT.md` (the author's brief).

Drafted 2026-11-14, **ahead of the kill gate**, because the author asked for
the whole outline at once. That is a skipped-order stage, said out loud: the
sections on engine and build plan stand, but any rule the gate changes is
changed here afterwards, and `KILLGATE.md` wins where they differ.

Where a later "as built" section differs from the plan above it, the later
section wins.

---

## 1. Decisions already made

| Decision | Source |
|---|---|
| Phone first, installable, offline, no accounts, turn-based | All previous builds |
| Browser game, seeded RNG, local saves, content as data tables | Concept brief, section 11 |
| Shape B: vanilla ES modules, no build step, bundled to one file | game-scaffold, 2026-11-14 |
| Light, airy, humorous, cute pixel art | The author, 2026-11-14 |
| Satire aims at institutions and behaviour; invented gods only | Concept brief, section 2 |

## 2. Stack

| Choice | Decision | Why |
|---|---|---|
| Shape | B: ES modules, no build step, one-file bundle | The game is a simulation with generated text, not authored scenes. The engine must run headless in Node for the bot and batch runs. Shape C (YAML scenes, Preact) earns its cost only with tens of thousands of authored words; this game's words live in phrase tables |
| Content | Logic-free tables in `src/data/*.data.js` | Brief section 11. Phrase tables can grow without touching logic |
| Rendering | DOM for text and controls; one `<canvas>` for the village diorama and the telephone playback | Text must stay selectable, resizable and screen-readable; pixels stay crisp on a canvas at integer scale |
| Art | Sprites drawn from data (layered paper dolls) by a committed tool; backdrops from supplied sources converted to the master palette | Twelve generated followers need generated sprites. See section 5 |
| Saves | Guarded localStorage, key `divine-mismanagement.save.v1`, `v` in the payload, migrations, text export `DVMM1.` | Every past build's contract |
| Tests | `npm run check`: invariants, save contract, bot batch, bundle, phone smoke, plus the text tools in section 6 | |
| Deploy | GitHub Pages from the default branch by Actions; itch.io zip | game-release |
| Dependencies | None at runtime. No web fonts from a third party | The kit's audit flags Google Fonts; the pixel face is self-hosted |

## 3. Architecture

```
src/data/        logic-free tables
  config.data.js     every tunable number, one place
  lexicon.data.js    the word blocks, each with tags
  templates.data.js  Revelation templates (slots and allowed blocks)
  traits.data.js     the six traits: which slot each rewrites, and how
  phrases.data.js    drunk pairs, poet metaphors, riders, penalties, expansions
  oddities.data.js   what a garbled object turns into
  followers.data.js  names, trades, wants, prayers
  miracles.data.js   three miracles
  rival.data.js      Vellamine: thresholds and lines
  events.data.js     the event table
  pim.data.js        Pim's lines, keyed to state predicates
src/engine/      pure: (state, input) -> state. No DOM, no Date, no Math.random
  rng.js           named streams, state in the save
  state.js         newGame, save contract, migrations
  turn.js          the eight-phase pipeline (SPEC section 3), one record out
  telephone.js     (verse, chain, rng) -> { steps[], final }
  scripture.js     carve, the seven-Tablet cap, contradictions, effects of a verse
  render.js        verse structure -> words. The only place a verse becomes text
  followers.js     generator, devotion, wants, households
  faith.js         the ledger: the only place Faith and Power move
  rival.js         the rival's policy; calls the same telephone/miracle functions
  prayers.js       petitions, answers, entitlement
  events.js        draws and resolves
  derive.js        every number and every "at stake" line the UI shows
src/ui/          reads the engine, computes nothing
  app.js, screens/*.js, sprites.js (canvas), styles.css
sim/             reference bot with written policies, batch runner (game-measure)
test/            invariants, save contract, telephone golden cases
tools/           bundle, checks, smoke, icons, sprite sheet, text tools
```

Import direction: `ui -> engine -> data`. The facade stays `newGame`, `advance`,
`view`.

### 3.1 The verse (the one structure everything hangs on)

```js
// A Revelation and a carved verse are the same shape.
{
  id: 'v7',
  who:   { id: 'faithful', scope: 2 },
  modal: { id: 'should',   strength: 2, polarity: +1 },
  verb:  { id: 'wash',     domain: 'hygiene' },
  object:{ id: 'hands',    domain: 'hygiene' },      // domain mismatch => Oddity
  when:  { id: 'before_meals', freq: 3 } | null,     // Lazy can null a slot
  rider: { by: 'f04', kind: 'buy_from' } | null,     // Ambitious adds
  penalty: { id: 'pond' } | null,                    // Zealot adds at strength 4
  gloss: 'poet_17' | null,                           // Poet's wording, by phrase id
  heardBy: ['h1','h3'],                              // households that adopted it
  trail: [ { by:'f02', trait:'lazy', slot:'object', before:'their hands', after:null }, ... ]
}
```

- `render.js` turns this into the sentence on the Scripture page.
- `scripture.js` turns the same object into effects.
- `trail` is what the playback screen animates and what the Scripture page
  shows on tap ("who did this"). The brief's risk of opaque systems is answered
  by storing the cause with the result.

Nothing stores the sentence itself. A stored sentence would be a second
derivation and would drift from the effects (game-building rule 1).

### 3.2 A mutation, as data

```js
// traits.data.js
zealot: {
  prop: 'torch',
  steps: [
    { slot: 'modal', op: 'raise', by: 1, max: 4 },
    { slot: 'who',   op: 'widen', by: 1 },
    { slot: 'penalty', op: 'add_if', when: 'modal.strength==4', from: 'penalties' },
  ],
},
drunk: { prop: 'mug', steps: [ { slot: 'any_word', op: 'soundalike', from: 'drunkPairs' } ] },
```

Six traits are six small rule lists over the same five or six operations
(raise, widen, drop, swap, add, gloss). New traits are data, plus an operation
only if they do something no existing trait does.

### 3.3 Turn pipeline

`turn.js` runs the eight phases of `SPEC.md` section 3 in written order and
returns one season record. The digest, the Chronicle and Pim's line are read
from that record.

### 3.4 Starting numbers

All in `config.data.js`, all *(tuned)* until the gate: Faith 10, Power 3,
Mystery 50, twelve followers at devotion 4-7, a Revelation costs 1 Power per
link after the Prophet, miracles cost 3-5 Power and 5-15 Mystery, Faith to
Power converts at a quarter per season. They exist so the gate has something to
break.

## 4. Screens

Five tabs along the bottom, thumb reach, 44 px targets. The top third of the
main screen is always the diorama.

| Screen | What it shows | Notes |
|---|---|---|
| **Title** | New god (name it), Continue, the shelf of past holy books, "saves will not be kept" warning when storage is blocked | |
| **Village** (home) | Diorama: sky, your cloud, the village row with twelve sprites going about their day. Below: Pim's line for the season, the HUD (Faith, Power, Mystery, season), and the five acts as large buttons | Tap a sprite for its card: name, trade, known traits, devotion, want, household |
| **Reveal** | Step 1 pick a template and swap blocks. Step 2 pick the chain, one follower per household, with each known trait shown as "tends to..." | Shows what is known, never the outcome. Unknown traits show "?" |
| **Playback** | The showpiece. The speech bubble hops from sprite to sprite along the chain; the changed words flash and the trait prop bounces; then the carving and the one-line consequence | Tap to step, hold to skip. The same data is on the Scripture page afterwards |
| **Scripture** | The seven Tablets, newest first, each with a "Counts for" line computed from its effects, and contradiction marks linking the verses that clash. Apocrypha folded below. Copy as text | Tap a verse for its trail |
| **Prayers** | The inbox: who, what they want, what answering costs and gives, what ignoring does | Demands (entitlement) are visibly different from prayers |
| **Heavens** | The rival's standing and her Scripture, the village split 12/12/12 as a bar, turns to the Review and where you stand against each test | |
| **Menu** | Save code, settings (text size, reduced motion, sound), how to play, hints back on | |
| **Review / Ending** | The Registry's findings, the verse that did the most damage, the follower responsible, the whole Scripture | |

Rules for every screen: empty and locked states name the reason and the lever;
every meter has its change this season beside it; nothing is conveyed by colour
alone (trait props and icons carry it); reduced-motion turns playback into a
stepped list.

## 5. Visual identity

**Idea: a sunny morning in a small heaven.** Pastel, bright, roomy. Nothing
like the dark manuscript and runestone looks of the earlier games.

| Token | Value | Use |
|---|---|---|
| `--sky` | `#bfe3f5` | Diorama sky, page top |
| `--cloud` | `#fff8e7` | Page background, panels |
| `--ink` | `#3b2a4a` | Text and sprite outlines (plum; no pure black) |
| `--ink-dim` | `#7a6a86` | Secondary text |
| `--halo` | `#f2b84b` | You, Faith, primary buttons |
| `--rose` | `#f4a6b0` | The rival, warnings that are not alarms |
| `--mint` | `#a8dcc0` | Good news, growth |
| `--lilac` | `#c9b6e8` | Mystery |
| `--alarm` | `#d9604c` | Heresy, loss |
| `--grass` | `#9fd18b` | Ground |

- **Type.** Headings and the HUD in a self-hosted pixel face; body text and all
  Scripture in the system sans at 16 px or more. Scripture is the thing players
  reread, so it is never set in pixels.
- **Sprites.** 16 x 16, big head, two-pixel eyes, plum outline, drawn at 3x or
  4x with `image-rendering: pixelated`. Followers are paper dolls: body, tunic
  colour by household, hair, hat by trade, and **one prop per trait** so the
  village is readable at a glance:

  | Trait | Prop |
  |---|---|
  | Literalist | Measuring stick |
  | Drunk | Mug |
  | Ambitious | A hat one size too grand |
  | Poet | Quill |
  | Lazy | Pillow |
  | Zealot | Torch |

- **Motion, all in code.** Two-frame idle bob, clouds drifting, the bubble hop,
  a sparkle on a miracle, singed eyebrows on a smiting. No sprite needs more
  than two authored frames.
- **Pipeline.** `tools/make-sprites.mjs` builds the sheet from part tables;
  `tools/contact-sheet.mjs` shows every part combination at true size before
  anything is approved. Backdrops, Pim, the gods and the title art are either
  hand-authored grids or sources the author supplies, converted to this
  palette (the Vikingr and Knight of Adalia pipeline).
- **Style tile:** `docs/style-tile.html`, with a screenshot in
  `docs/style-tile.png`. The sprites on it are drawn from code as a first
  pass to judge direction; they are placeholders for the calibration round, not
  final art.

## 6. Instruments

| Tool | Question it answers | Must assert |
|---|---|---|
| `test/invariants.test.js` | What can never be true? | Faith ledger sums; never more than seven Tablets; a verse's text and effects come from one object; no follower in two households |
| `test/save-contract.test.js` | Does every old save load and play on? | One fixture per save version |
| `test/telephone.test.js` | Does each trait do exactly its rewrite? | Golden cases per trait and per order; same seed, same verse |
| `sim/run.js` | What do N games look like? | Progress: refuses runs that did not advance |
| `sim/` policies | Are the decisions real? | The five policies of `SPEC.md` section 11 differ beyond the noise floor |
| `tools/telephone.mjs` | Is it funny? (Gate A) | Nothing; a human reads it. Prints N seeded chains step by step |
| `tools/repeats.mjs` | Does the joke repeat? | Across 1,000 chains: no phrase above a set share; no repeat within a run |
| `tools/verses.mjs` | Is every verse legible? | Every reachable verse renders under 140 characters with no raw token |
| inert check | Does every trait, block and miracle change the end state? | Byte-different end state per knob |
| `tools/smoke.mjs` | Does the real page work at 390 px? | Clock advances through the UI; no horizontal scroll |

## 7. Build plan

Maps the brief's build order onto the workflow stages.

| Phase | Delivers | Brief item | Exit criteria |
|---|---|---|---|
| **A. Gate A** | `lexicon`, `templates`, `traits`, `phrases` tables at half size; `telephone.js`, `render.js`; `tools/telephone.mjs`; 20 printed chains | 1 | **The author reads them and laughs.** If not, fix tables and repeat; nothing else starts |
| **B. Gate B** | `scripture.js`, `faith.js`, a bare `turn.js`, five bot policies, `KILLGATE.md` | 2, 3 | Policies differ; win reachable, not trivial; no dominant policy; both village meters earn their place or one is cut |
| **1. Engine + instruments** | Followers, prayers, rival, events, save contract, all tools in section 6, placeholder UI replaced by plain working screens | 4, 5, 6 | Bot plays 200 full runs, no stalls; installs on a phone |
| **2. Calibration** | Three things at full polish: the Playback screen, the Scripture page, one sprite sheet | | The author's verdict on voice, look and option count |
| **3. v0.1 slice** | Era I complete at the brief's minimum scope, tutorial by Pim, the Review, three endings | 7 | The author plays 30 turns and wants another run |
| **4. Balance** | Seeded batches, tuning, playtest fixes | 8 | Win rate at the author's target with its error; phrase repetition under target |
| Later | Domains, Era II (generations, saints, schism), Era III, more rivals, itch release | | Each by a frame document |

## 8. Scope pushback and risks

Pushback on the brief's v0.1 list:

1. **Generational turnover and saints do not fit 30 seasons** (seven and a half
   years). They move to Era II. v0.1 Anoint covers Prophet and Priest only.
2. **Schism as an ending needs factions with memory.** v0.1 has Heresy as a
   pressure that costs a household; the two-gods ending arrives with Era II.
3. **"Eras" in a 30-turn run** would be three ten-turn eras with nothing in
   them. v0.1 is Era I only.

Risks, in order:

1. **It is not funny in volume.** One chain is easy; the fortieth must still
   land. Mitigation: Gate A first, draws without replacement, the repeats
   tool, and a content budget (`WORLD.md` section 7) treated as the real cost.
2. **Shortest chain always wins,** or longest always wins. Mitigation: reach by
   household, Oddities paying Mystery, and Gate B's two revealer policies.
3. **Mutation feels random, not caused.** Mitigation: known traits shown before
   sending, the trail stored on every verse, golden tests so a trait never does
   anything but its rewrite.
4. **Scripture becomes noise.** Mitigation: seven Tablets, 140 characters, a
   "Counts for" line on each.
5. **Tone slips** into mocking belief or a real faith. Mitigation: the hard
   rules in `WORLD.md` section 6, applied to every table at review.
6. **Pixel art from code looks cheap.** Mitigation: the style tile now, a
   contact sheet at calibration, and supplied sources for anything larger than
   a sprite.
7. **Canon drift from *Acts of God*.** Mitigation: `WORLD.md` section 9.

## 9. Questions for the author (with the default if unanswered)

The rules questions are in `SPEC.md` section 10. These are the build questions.

| # | Question | Default |
|---|---|---|
| 1 | Sprites drawn from code, or will you supply pixel art sources as on Vikingr? | Code for followers and props; supplied or commissioned sources for Pim, the gods, the title and backdrops if the calibration verdict on code-drawn ones is "not good enough" |
| 2 | Sound? | None in v0.1; a setting reserved |
| 3 | Is `docs/CONCEPT.md` still the baseline to keep updated, or does `SPEC.md` replace it? | `SPEC.md` replaces it as the working document; `CONCEPT.md` stays as the dated original |
| 4 | Pages on for this repo? | Yes; switch Settings > Pages > Source to "GitHub Actions" once the default branch exists |

---

## 10. As built

**Gate A (2026-11-14).** `telephone.js`, `render.js`, `followers.js` (names,
trades, traits and households only) and the word tables exist, with 12 tests.
Details and the measured readings are in `docs/GATE-A.md`. Differences from the
plan above:

- The six rewrites are functions in `telephone.js`, not rule lists in
  `traits.data.js` (section 3.2). Each needed its own choice of what to act on,
  and a rule language for six cases would have been more code than the cases.
  The words are still all in data.
- A verse has `object` and `tail` slots holding `{ base, cur, via, lit }`
  rather than the flat ids of section 3.1, so it records whether a phrase was
  misheard, made poetic or taken literally. `trail` is returned by
  `transmit()` as `steps`, not stored on the verse yet.
- `phrases.data.js` holds threats and riders; sound-alikes and poetic glosses
  live beside the phrase they replace in `lexicon.data.js`.

Everything else in `src/` is still the scaffold's placeholder game (24 turns,
three actions). The telephone is not wired into a turn or a screen.
