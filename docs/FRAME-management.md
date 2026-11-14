# Frame: a management sim, a grown-up look, and no repeats

Drafted 2026-11-14. **Status: proposal, awaiting the author's approval.** One
part is already built and measured (section 3, the no-repeat rule in the
telephone); the rest is design, to be tested by Gate B before any of it is
built.

## The author's request

> "Make sure this isn't the only interaction with the devotees. I want this to
> feel like a satirical management sim that uses his misunderstanding devotees
> to build his faith, expand his influence, perform miracles, and defeat other
> gods."

> "I want you to make sure it looks kinda cute and fun, but it also can't look
> like a children's game."

> "I don't want any repeats of an event or scene in any play through"

## The problem with what was specified

1. **The spec made the telephone the whole game.** One act a season, and four
   of the five acts were short. The devotees existed to garble Revelations and
   to pray. That is a toy with a resource bar, not a management sim: there was
   nothing to staff, build, grow or attack.
2. **Style tile 1 looked like a children's game.** Nursery pastels, big-head
   sprites with blushing cheeks, rounded buttons with drop shadows, a smiling
   cloud.
3. **Repeats were certain.** The spec budgeted 12 events for 30 seasons. Gate A
   printed "the Verse of Something" with the same line three times in twenty,
   and "with the boar" twice.

## The design rule

**Every lever is a person.** The god decides what should happen; a devotee is
always the one who does it, reports it or passes it on, and their trait bends
it. The telephone is one desk in the office, not the office.

---

## 1. The management sim

### 1.1 Six ways to work through devotees

| # | Interaction | What the player decides | What the devotee's trait bends |
|---|---|---|---|
| 1 | **Revelation** (built, Gate A) | The message and the chain | The wording, which becomes permanent Scripture |
| 2 | **Postings** | Who holds each office | How the office is run, every season |
| 3 | **Miracles** | Which miracle, on what, and **who witnesses it** | The account the village believes, which sets what the miracle was worth |
| 4 | **Prayers** | Answer, ignore, or answer a rival's neglected follower | What they ask for and how they take the answer |
| 5 | **Dreams** | One devotee, one nudge (1 Power) | What they make of it: it reveals a trait, or shifts their want |
| 6 | **Rulings** | Events arrive as a devotee's problem with two or three ways to settle it | Who brought it decides which options exist |

### 1.2 Postings: the staffing board

Six offices in v0.1. A devotee holds one office or sits in the pews (worships,
and can still be a link in a chain). Moving someone costs a season of settling
in, so the board is planned, not shuffled.

| Office | What it produces |
|---|---|
| **Prophet** | The first link of every Revelation |
| **Preacher** | Faith each season from the flock |
| **Missionary** | Souls: converts the Unbothered, then the rival's flock |
| **Collector** | Offerings, the material resource |
| **Builder** | Turns Offerings into Works |
| **Witness** | Records your miracles |

The trait decides how. This table is the heart of the management game, and it
is the claim Gate B must test: **every trait is the best holder of at least one
office and the worst of another.**

| | Preacher | Missionary | Collector | Builder | Witness |
|---|---|---|---|---|---|
| **Literalist** | Reads every verse aloud exactly. Heresy falls; Mystery falls | Few converts, and they stay | The exact tithe, no more, no grudges | Exactly what was asked, slowly | Reports precisely what happened. Full Faith, Mystery gone |
| **Drunk** | Lively services; devotion up. Now and then misquotes a Tablet and the Tablet changes | Many converts from the alehouse, none of them firm. May come back converted himself | Collects the wrong thing. Offerings swing | It leans. It works, and becomes an Oddity | Reports a different miracle from the one you did |
| **Ambitious** | Faith up; skims; gathers a following of their own | Converts people partly to themselves | Collects the most and keeps a cut | Bigger than asked, dearer, with their name on it | "It happened through me." Half the Faith is theirs |
| **Poet** | Nobody understands the sermon. Mystery up, Faith flat | No converts; the Unbothered are charmed and convert more easily later | Asks so beautifully nobody notices it was a request | Lovely and useless. Mystery, no function | Makes it grander. Mystery kept, expectations raised |
| **Lazy** | Short services. People like that; Faith dips | No converts, but befriends everyone: the rival's missionaries do worse | Collects from next door only | Half-built, cheap, stays half-built | Mentions it to two people. A quiet miracle: small Faith, Mystery untouched |
| **Zealot** | Faith up fast; the lukewarm leave | Quick converts by fear; the rival takes offence | Double the take; devotion falls | Finished in one season by pressing the neighbours | Reports it as a warning. Faith by fear; the rival's flock alarmed |

(The Prophet's column is the telephone.)

### 1.3 Build your faith: Works

Offerings and a Builder put up Works in the village. Six in v0.1:

| Work | Does |
|---|---|
| Shrine | Raises the Faith each worshipper gives |
| Bell | A Revelation reaches one extra household for free |
| Offering Box | Offerings without a Collector, at a lower rate |
| Feast Hall | Lets you hold a festival: devotion up, a place to out-shine the rival |
| Reliquary | Houses Oddities (the eel tub): they yield Mystery with no upkeep |
| Guest House | Converts settle faster and are harder to poach |

The builder's trait changes what actually goes up, so the village on screen is
a record of who you trusted with it.

### 1.4 Expand your influence

- **v0.1: one village, three camps.** Thirty-six souls: yours, the rival's and
  the Unbothered, shown as a bar and in the diorama (banners on houses change).
  Expanding means winning the Unbothered first, then poaching.
- **After v0.1: the Vale.** Four more villages, each with a resident god. A
  posted Missionary opens a village; a Preacher holds it. This is where
  "expand" becomes a map. It triples content, so it is not in v0.1.

### 1.5 Perform miracles

Three miracles in v0.1 (Bounty, Sign, Smiting), each costing Power. The player
also chooses the Witness, and the Witness's account is the miracle as far as
anyone knows. The account is stored as a **Legend**, the same way a verse is
stored as structure, and a Legend can later be cited, celebrated or quoted
against you.

A miracle of a kind the village has already seen, reported the same way, is
old news and worth less. That is the brief's "overuse breeds boredom and
entitlement", and it is also where the no-repeat rule becomes a rule of the
world instead of only a content rule.

### 1.6 Defeat other gods

The rival plays by the player's rules: her own idiots, postings, miracles and
mangled Scripture.

| Tool | How it hurts her |
|---|---|
| Missionary | Takes souls |
| Answering her neglected followers' prayers | Takes a named devotee, with their trait |
| Smiting her missionary | Sends them home singed; she loses a season |
| Festival | Out-shines hers; the Unbothered drift your way |
| Disputation | Your Prophet against hers at market: whoever has fewer contradictions in their Tablets wins the crowd |
| A better Witness | When both gods work a sign in one season, the accounts compete |

**She falls** when her flock stays under four for two seasons. She is then
absorbed into your faith as a minor saint with a feast day, which is exactly
what happens to you if you lose to her.

### 1.7 The season, revised

1. **Morning memo.** Pim's report, at most one new prayer, at most one event.
2. **Postings.** Change who holds which office.
3. **Divine acts: up to two.** Revelation, Miracle, Answer a prayer, Dream,
   Anoint. Taking none is Staying Silent.
4. **The offices work,** each bent by its holder.
5. **The rival's season,** through the same functions.
6. **Collection, Heresy, Chronicle** as before.

### 1.8 Meters, revised

Faith, Power, Mystery and Doctrine stay as the brief has them. Added:
**Offerings** (what Works and festivals cost) and **Souls** (yours of 36).
Removed: Bread and Cheer, the two village meters the spec already doubted;
their job is done by each devotee's devotion.

### 1.9 What this changes in the approved spec

| Spec | Was | Proposed |
|---|---|---|
| Acts per season | One | Up to two, plus postings. Gate B runs one against two |
| Pillar 1 | "Everything passes through unreliable people" | The same, now true of every action and not only Revelations |
| Win | Review: Faith, majority, Heresy | The same, **or** the rival falls first |
| Scope of v0.1 | 5 templates, 3 miracles, 1 rival | Adds 6 offices, 6 Works, Legends, Dreams, Offerings |
| Anoint | Prophet or Priest | Folded into Postings; Anoint remains for Saint (later eras) |

This roughly doubles the engine work of v0.1 and more than doubles the
writing. That is the cost of the request, stated plainly.

---

## 2. The look: cute and fun, not for children

`docs/style-tile.html` is redrawn (tile 2; tile 1 is in git history).

| | Tile 1 | Tile 2 |
|---|---|---|
| Idea | A sunny morning in a small heaven | A parish ledger at dusk |
| Palette | Sky blue, rose, mint, lilac | Parchment and ink; woad, oxblood, ochre, verdigris, plum |
| People | Big heads, blush, smiles | Smaller heads, longer bodies, dot eyes, no smiles. Small and tired |
| You | A smiling cloud | A small cloud with its halo askew, unimpressed |
| Controls | Rounded, bouncy, drop shadows | Forms, ruled lines, rubber stamps |
| Type | Stand-in pixel capitals | Serif small caps, typewriter for memos. No pixel lettering |
| Home screen | Five big buttons | A ledger row, a memo, the postings board |

The charm comes from scale and behaviour: very small people being very serious
about an eel. Nothing is drawn to be adorable.

**Tone moves with it.** Proposed dial: Warmth 4, Absurdity 4, Sass 4 (was 3),
Bite 3 (was 2), Darkness 2 (was 1): people may drink, skim the tithe, hold
grudges and die of old age off screen, and funerals may be funny. The hard
rules do not move: invented gods only, no real verse or commandment, never
cruel. The line "a twelve-year-old should be able to play it" is withdrawn; it
is written for adults and contains nothing that needs hiding.

---

## 3. No repeats in a playthrough

### The rule

**No authored event, scene or line is shown twice in one playthrough.** Every
piece of authored content has an id in a named deck. Using it spends it. The
spent list is in the save, so reloading cannot bring something back.

What counts, as proposed: events, rulings, prayers, memos, taunts, legends,
office incidents, mishearings, poetic phrases, threats, riders, literal
readings, aftermath lines, verse titles. What does not: numbers, button labels,
names, the player's own Revelation blocks, and the fixed frame of a sentence
("You said:").

When a deck is empty the mechanics go on and the prose is left out. Silence is
allowed; a repeat is not.

Not promised: that two different playthroughs share nothing. They will overlap
until the tables are several times deeper than one run can use.

### Built and measured (the telephone)

`src/engine/deck.js`, used by `telephone.js` and `carve()`. A test plays 200
playthroughs of 20 Revelations and fails on any repeated draw, aftermath line
or title. A second verse with the same name is numbered ("the Second Verse of
the Hand").

`node tools/telephone.mjs --run --stats`, 500 playthroughs, with the Gate A
tables at about half their target size:

| In a playthrough of | 10 Revelations | 20 Revelations |
|---|---|---|
| Poet found nothing new to say | 9.3% of turns | 11.9% |
| Literalist found nothing | 6.5% | 12.0% |
| Drunk found nothing | 5.3% | 8.1% |
| Ambitious found nothing | 0.1% | 6.8% |
| Carvings with no aftermath line left | 1.6% | 6.5% |
| Titles needing "Second", "Third" | 1.4% | 3.3% |

(Some of each "found nothing" is the trait having nothing to act on, which
happened before the rule too. The rise from 10 to 20 is the decks emptying.)

So the rule holds, and at half-size tables it costs about one rewrite in ten.
The target before release is under 1% for every row, checked by this tool.

### What it costs in writing

Worst-case draws in a 30-season playthrough, and the pool needed at 1.5 times
that:

| Deck | Draws per run | Was budgeted | Needed |
|---|---|---|---|
| Events and rulings | 30 | 12 | 45 |
| Prayers (one new a season) | 30 | 60 | 45 |
| Pim's memos (seasonal and year-end) | 37 | 60 | 60 |
| Office incidents (one per trait and office) | 30 | 0 | 30 authored cells |
| Legends (miracle by witness trait) | 18 | 0 | 18, then "old news" |
| Rival's taunts and moves | 15 | 0 | 25 |
| Mishearings | about 20 | 80 | 80 |
| Poetic phrases and endings | about 20 | 40 | 60 |
| Threats | about 12 | 20 | 24 |
| Literal readings, aftermath lines | one per phrase | per phrase | per phrase |

Offices report in numbers most seasons. Each trait-and-office pairing has one
authored incident that happens once; that keeps 30 seasons of six offices from
needing 180 unique paragraphs.

---

## Options

| Option | What | Verdict |
|---|---|---|
| A | Keep the approved spec; add postings later | Cheapest. Does not answer the request |
| **B (recommended)** | This frame: six interactions, the staffing board, Works, Legends, one village and one rival in v0.1, the Vale after | The request, at about twice v0.1's size |
| C | B plus the Vale and three rivals in v0.1 | Closest to "expand" and "defeat other gods", about four times the writing, and the first playable build moves a long way out |

## What will be measured (Gate B, extended)

1. Every trait is the best holder of one office and the worst of another
   (ablation: swap the holder, same seeds).
2. A staffing policy beats random staffing by more than the noise floor.
3. One act a season against two: which makes Staying Silent a real choice.
4. Neither "never post anyone" nor "never send a Revelation" wins.
5. The rival falls in some runs and absorbs the player in others.
6. Deck dry rates under 1% at full table size.

## Decision

| Date | The author's words | Decision |
|---|---|---|
| | | |
