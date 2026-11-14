# Divine Mismanagement: working rules

- Read `docs/SPEC.md` first in every new session (the rules, the open questions
  and every decision in the author's words), then `docs/WORLD.md` (setting,
  cast, story, and the tone rules) and `docs/DESIGN.md` (engine, screens, look,
  build plan). `docs/CONCEPT.md` is the author's original brief, kept as
  written. Do not re-derive any of it from chat.
- Built with the HeirsOfRuin game-building skills (`Game-Workshop/skills/`).
  Read `game-building/SKILL.md` before writing game logic. Follow its stages
  and gates; skipping a stage is allowed, skipping it silently is not.
- The first gate is a human one: the author reads 20 mutated Revelations and
  says whether they are funny (`SPEC.md` section 11). No other system is built
  before that verdict.
- Tone is a rule, not a mood. Every phrase table is checked against the hard
  rules in `WORLD.md` section 6: invented gods only, no real verse or
  commandment quoted or paraphrased, warm, never cruel.
- Nothing authored is shown twice in one playthrough. Every authored line has
  an id in a deck (`src/engine/deck.js`); the spent list is in the save. A dry
  deck leaves the prose out; it never repeats. New content systems use the
  deck from their first commit.
- `docs/FRAME-management.md` proposes the management layer (offices, Works,
  Legends, defeating the rival) and the look. Check its Decision table before
  building any of it.
- A verse is stored as structure, never as a sentence. Its words and its
  effects are both computed from that one object.
- Content lives in `src/data/` tables, separate from logic.
- Every commit runs `npm run check` first. Numbers in a commit message carry
  their run counts.
- Decisions go in the SPEC's dated table with the author's words quoted.
- Scratch files are `tools/_*.mjs` or `*.tmp.*` and are never committed.
  `dist/`, `out/`, `release/` are output and never committed.
- Do not open a pull request unless the author asks.
- Write for a reader who was not there: plain words, the failure behind each
  rule, the number that was measured.
