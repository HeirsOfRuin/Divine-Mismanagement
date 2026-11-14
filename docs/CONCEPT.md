# Divine Mismanagement — Text Game Concept Brief

> **How to use this file:** Paste this into a new chat as the design brief. Tell the assistant which section to build next (see "Build Order" at the bottom). Treat everything here as the current design baseline; flag any changes so this file can be updated.

---

## 1. One-Line Pitch

You are a minor god with twelve worshippers, and every one of them is an idiot. Grow your faith into a major religion — despite them.

## 2. Tone and Design Pillars

- **Genre:** Satirical comedy, turn-based text/management game. Browser-playable.
- **Satire target:** Institutions and behavior — bureaucracy, zealotry, ego, doctrine creep. Gods are invented; no parody of real-world faiths.
- **Pillar 1 — Indirect control.** The player never commands followers directly. Everything passes through unreliable people.
- **Pillar 2 — Words become permanent.** Mangled messages become Scripture, and Scripture constrains the future.
- **Pillar 3 — Emergent comedy.** The humor comes from systems colliding (traits + Scripture + rivals), not just authored jokes.
- **Pillar 4 — Real stakes.** You can fade, fracture, or be absorbed. Losing must be possible and funny.

## 3. Shared Setting: The Overcrowded Heavens

There are too many gods and not enough worshippers. Divinity runs on belief, and the market is saturated. Every god competes for followers while managing their own ego, pettiness, and oddly specific domains.

This setting is shared with the sister TTRPG *Acts of God*. In the TTRPG, the god is unreliable and the followers suffer. In this game, the followers are unreliable and the god suffers.

## 4. Core Mechanic: The Telephone Game

1. The player issues a **Revelation** to their **Prophet** (chosen from templates or composed from parts).
2. The message passes down a chain of followers.
3. Each follower's **traits** mutate the message:
   - **Literalist** — takes it exactly at its word.
   - **Drunk** — swaps a word.
   - **Ambitious** — adds a rule that benefits themselves.
   - **Poet** — makes it beautiful and wrong.
   - **Lazy** — shortens it, dropping key parts.
   - **Zealot** — escalates it ("should" becomes "must, on pain of death").
4. The final version becomes **Scripture** — permanent, visible, and binding.
5. Scripture creates ongoing effects: rituals, taboos, behaviors, and conflicts that shape future turns.

**Design goal:** Mutating a single Revelation must be funny on its own. If it isn't, nothing else will save the game. Prototype this first.

## 5. Resources

| Resource | Source | Spent on / affects | Failure state |
|---|---|---|---|
| **Faith** | Worship, answered prayers, rituals | Converted to Power | Below zero: god begins fading |
| **Power** | Converted from Faith | Miracles, Revelations | Cannot act |
| **Mystery** | Rare or dramatic miracles | Faith generation multiplier | Overuse of miracles: followers get bored and entitled |
| **Doctrine** | Accumulated Scripture | Unlocks rituals and bonuses | Contradictions breed heresy |

## 6. Player Actions (per turn, draft)

- **Revelation** — Send a message through the chain (core action).
- **Miracle** — Spend Power for a direct effect: bless harvest, smite rival missionary, sign in the sky. Reduces Mystery if overused.
- **Answer a Prayer** — Followers petition you; answering builds Faith, ignoring builds Mystery (or resentment).
- **Anoint** — Promote a follower to Prophet, Priest, or Saint. Changes who sits where in the chain.
- **Do Nothing** — Valid and sometimes optimal. Divine silence has effects.

## 7. Pressures

- **Rival Gods** — Poach followers, plant missionaries, mock your Scripture.
- **Heresy** — Contradictory Scripture splits followers into factions. Schism risk.
- **Generational Turnover** — Followers die; descendants inherit traits and misremember Scripture. Saints get canonized, usually the wrong ones.
- **Entitlement** — Too many miracles and followers stop worshipping and start demanding.

## 8. Followers

Each follower is procedurally generated with:
- Name and occupation
- 1–2 traits (from the trait list above, expandable)
- Devotion level
- Relationships (family, rivalries)
- A personal want that drives prayers

## 9. Run Structure and End States

- **Length:** ~30–60 turns across several eras.
- **Win:** Ascend to the High Pantheon (Faith threshold + follower count + survived schism).
- **Lose — Forgotten:** Faith hits zero and stays there.
- **Lose — Absorbed:** A rival converts your majority; you become a minor saint in their faith.
- **Possible alternate ending:** Schism splits you into two lesser gods.

## 10. Minimum Playable Scope (v0.1)

- 1 village
- 12 followers
- 6 traits
- 5 Revelation templates
- 3 miracle types
- 1 rival god
- 30 turns
- 1 persistent Scripture page the player can reread

## 11. Technical Assumptions

- Single-page browser game (HTML/JS), playable on phone.
- Seeded RNG for reproducible runs and balance testing.
- Save state in local storage.
- Content (traits, mutation phrases, templates, events) stored as data tables, separate from logic.

## 12. Risks and Assumptions

- **Content cost:** The mutation phrase library is the biggest investment, not the code. Repetition kills the joke.
- **Readability:** Scripture must stay legible and consequential; long accumulated text can become noise. Consider a capped "active doctrine" list.
- **Opaque systems:** Players must understand why a mutation happened (show the chain).
- **Balance:** Miracles vs Mystery tension must be tuned so neither spam nor silence is dominant.

## 13. Open Design Questions

- Are Revelations free-text, template-based, or modular word blocks? (Recommended: modular blocks — easier to mutate reliably.)
- How exactly does Scripture translate into mechanical effects?
- How visible are follower traits to the player?
- Does the player pick a god (domains) at start, and how do domains change play?
- Single run vs meta-progression between runs?

## 14. Build Order (feed one at a time)

1. **Telephone mechanic prototype** — Revelation structure, 6 traits, mutation rules, 20 sample outputs. Judge: is it funny?
2. **Scripture effects system** — how mutated text becomes rules and modifiers.
3. **Resource loop** — Faith/Power/Mystery/Doctrine math and turn flow.
4. **Follower generator** — names, occupations, traits, wants, prayers.
5. **Rival god AI** — behaviors and escalation.
6. **Event tables** — random events per era.
7. **v0.1 build** — playable browser prototype at minimum scope.
8. **Balance pass** — seeded batch runs, tuning, playtest feedback.
