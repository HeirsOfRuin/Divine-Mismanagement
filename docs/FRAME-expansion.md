# Frame: godhood, the rare acts, the Book, and more of the world

2026-11-14. **Status: built on the author's instruction, not yet played by
the author.** The playtest build is the artifact linked in the README.

## The author's request

> "Go with your recommendations on the open items, then build me the artifact
> so i can playtest it. I want the game to be fun by building your godhood to
> rival the most powerful! and also constantly smacking your head against the
> wall whenever your idiotic followers misinterpret anything you command! and
> add holy artifacts, sainthood, prophets, and miracles as rare events you can
> send to your followers at great cost. getting them to eventually build a
> bible like book after a certain amount of time could be fun, seeing all of
> your previously misinterpreted commandments all brought together after some
> more mistranslations could be hilarious."

> "begin the framework for expanding the number of regions and other rival
> deities. maybe we have the game start with match creation that allows
> players to either choose story mode, or custom match where they face a
> certain amount of rivals, with a certain amount of regions, and a certain
> amount of starting resources"

## What each part became

| Ask | Built | Where |
|---|---|---|
| Building your godhood to rival the most powerful | A rank ladder: Minor Deity, Local Deity, Deity of Some Standing, Regional God, Major God. Rank rises with souls and Faith (Major God also needs more souls than any rival), is never taken away, and opens the rare acts. Rivals climb it by the same rules | `RANKS` in `src/data/match.data.js`; `rankFor()` in `turn.js` |
| Smacking your head against the wall | When the carved verse has lost what you sent it for (verb changed, "not" dropped, reduced to a gist), or changed three or more times, or the wrong Saint is named: a head-in-hands line (12, once each), a facepalm sprite that knocks its head twice, and a running count shown in Heavens and at the ending | `HEADDESK` in `src/data/content/grand.data.js`; `rec.facepalm` |
| Prophets, as a rare act | **Anoint a High Prophet** (15 Faith, 4 Power, once a game): every Revelation reaches one more household, and the High Prophet's trait works on it twice | `GRAND.anoint` |
| Holy artifacts | **Bless a holy object** (8 Offerings, 3 Power, once a year): the faithful decide what was blessed (the Good Spoon, a boot, the Jar). Twelve objects, each with a lasting effect | `ARTIFACTS` |
| Miracles as rare events at great cost | **Work a Wonder** (20 Faith, 10 Power, every 8 seasons): converts, Faith, awe, and a legend told for 8 seasons; never stale. Six Wonders, once each | `GRAND.wonder`, `WONDERS` |
| Sainthood | **Make a Saint** (40 Faith, 5 Power, three a game): the name passes through your Prophet, so a Drunk Prophet names the wrong person half the time. A Saint gives Faith, pilgrims, and a virtue by trait; the village picks the patronage | `GRAND.canonize`, `MISHEARD_SAINT`, `SAINT_VIRTUE`, `PATRONAGES` |
| A bible-like book, mistranslated once more | **The Book**: from season 18 with six verses carved (or season 24 with any), two of your people copy out every verse you ever gave them, Apocrypha included, and each copy passes through both scribes' traits. Each chapter shows what you said, what was carved, and what the Book now says, with the scribes named. It gives Faith for each chapter that still does good, and steadies Heresy | `src/engine/book.js` |
| More regions and rival gods | Any number of gods (1 to 5 rivals) and regions (1 to 5). Each region has its own Unbothered and its own share of each god. Your missionary works a mission field you choose. Six rival personas with their own taste in acts. A rival under the fall line for two seasons falls and her people go back to being Unbothered | `src/engine/world.js`, `RIVALS`, `REGION_NAMES` |
| Match creation: story or custom | A setup screen: Story (three chapters) or Custom (rivals, regions, seasons, your starting resources) | `STORY`, `CUSTOM`; `setupScreen()` in `src/ui/app.js` |

## The open items from docs/BALANCE.md, as recommended

| Item | Done |
|---|---|
| 1. Careful play wins too often | A small flock closes ranks for every god (half as easy to convert from below 8 of a fair 18); rivals look after their own first when low; the Review asks Faith 185 and 23 souls. Careful play: 41% ±2.5 (400 seeds) |
| 2. Poet is best at nothing | A Poet's telling of a miracle never goes stale. The Poet is now level with the best Witness (39% against 42%, within the noise of 8) |
| 3. The bot under-uses miracles | Careful play now works a miracle when Mystery is 50 or more and the flock is not entitled, and uses the rare acts while keeping a Faith reserve toward the Review |
| 4. Rivals have no troubles | Each rival meets the same problems you do about half the seasons and settles them by a fixed valuation. No line is shown, so nothing is spent from your decks |

## Defaults I chose, for the author to overrule

1. **Starting resources apply to you only.** Rich is an easy mode and Lean a
   hard one; the rivals always start standard.
2. **Thresholds scale gently with the world**: Faith by (fair share / 18)^0.4,
   souls by (fair share / 18)^0.2. Measured, not derived (`world.js` says how).
3. **A fallen rival's people become Unbothered**, not yours. You still have to
   go and get them.
4. **The Book is compiled automatically**, not commissioned. Its chapter titles
   keep the Tablets' names even when the text has wandered off from them.
5. **Rivals use holy objects and Wonders** (rule 7), but not High Prophets or
   Saints yet.
6. **Story chapters do not carry anything over** between them yet.

## What is not built

- Chapter carry-over (your god, rank and Book into the next chapter).
- Regions with their own character (a fenced village, a river town).
- Rival-specific lines: rivals share one set of lines, filled with the acting
  rival's name.
- The rivals' Books.
- An animated telephone playback.
