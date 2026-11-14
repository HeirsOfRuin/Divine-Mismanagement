# Gate A: is one mutation funny?

The first kill gate (`SPEC.md` section 11), and the brief's own first test: "Mutating a
single Revelation must be funny on its own. If it isn't, nothing else will save
the game."

**Status: built 2026-11-14, awaiting the author's verdict.** No instrument can
judge this; a person reads the chains below and says yes, no, or which parts.

## What was built

- `src/data/lexicon.data.js`: 5 Revelation templates, 12 objects and 14 tails
  the player can swap, 10 verb mishearings, 44 sound-alikes, 11 poetic glosses
  and 6 stock poetic endings, each with its Literalist reading and an aftermath
  line where one was written.
- `src/data/phrases.data.js`, `followers.data.js`, `traits.data.js`: 12
  threats, 5 general riders and 8 trade riders, 24 names, 8 trades, 6 traits.
- `src/engine/telephone.js`: the six rewrites. `src/engine/render.js`: the only
  place a verse becomes words, its title and its aftermath line.
- `tools/telephone.mjs`: prints the chains. `test/telephone.test.js`: 12 tests,
  including 3,000 seeded chains checked for broken sentences.

The tables are at roughly half the v0.1 target, as planned.

## How to read the chains

These are the first 20 chains of seed 1, unedited and not picked: `node
tools/telephone.mjs` prints the same 20 every time, and `--seed=2` prints 20
others. Each chain takes the templates in turn, picks the blocks, draws a flock
of twelve and sends the message through two to four of them, one per household.
A follower with two traits rewrites twice.

The line under each carving is authored flavour chosen from what survived in
the verse. It claims no numbers. The Scripture effects system (Gate B) computes
real effects from the same structure.

## The 20 chains

### 1. The Verse of the Beet

**You said:** The faithful should wash their feet every morning.

- **Hob the Eel-Catcher** (Lazy) left out "every morning":  
  *The faithful should wash their feet.*
- **Hob the Eel-Catcher** (Poet) added "ere the lark has filed her complaint":  
  *Let the faithful wash their feet ere the lark has filed her complaint.*
- **Osric the Eel-Catcher** (Zealot) made it stricter and wider, and added a threat:  
  *ALL must wash their feet ere the lark has filed her complaint, or eat supper standing up.*
- **Osric the Eel-Catcher** (Drunk) heard "their beets" for "their feet":  
  *ALL must wash their beets ere the lark has filed her complaint, or eat supper standing up.*
- **Sabin the Clerk** (Lazy) left out "ere the lark has filed her complaint":  
  *ALL must wash their beets, or eat supper standing up.*

**Carved:** ALL must wash their beets, or eat supper standing up.  
The beet crop has never been cleaner.

### 2. The Verse of the Hour of Regrets

**You said:** The faithful should welcome travellers at the door.

- **Godric the Gooseherd** (Poet) improved "travellers" to "the dust-footed":  
  *Let the faithful welcome the dust-footed at the door.*
- **Godric the Gooseherd** (Zealot) made it stricter and wider, and added a threat:  
  *ALL must welcome the dust-footed at the door, or sit facing the wall at the harvest feast.*
- **Linnet the Eel-Catcher** (Lazy) left out the threat:  
  *ALL must welcome the dust-footed at the door.*
- **Bartle the Clerk** (Poet) improved "at the door" to "in the hour of soft regrets":  
  *Let ALL welcome the dust-footed in the hour of soft regrets.*

**Carved:** Let ALL welcome the dust-footed in the hour of soft regrets.  
Most people have taken this to mean just after supper.

### 3. The Verse of the Boar

**You said:** The faithful should share their bread with the poor.

- **Bartle the Carpenter** (Zealot) made it stricter and wider, and added a threat:  
  *ALL must share their bread with the poor, or carry the big stone up the hill and back.*
- **Sabin the Brewer** (Lazy) left out "their bread":  
  *ALL must share with the poor, or carry the big stone up the hill and back.*
- **Pernel the Shepherd** (Drunk) heard "with the boar" for "with the poor":  
  *ALL must share with the boar, or carry the big stone up the hill and back.*

**Carved:** ALL must share with the boar, or carry the big stone up the hill and back.  
The boar has never done so well and has begun to expect it.

### 4. The Verse of Nesting

**You said:** The faithful may rest when the work is done.

- **Tibb the Clerk** (Literalist) spelled out exactly how binding it is:  
  *The faithful are permitted, but not obliged, to rest when the work is done.*
- **Tibb the Clerk** (Poet) improved "when the work is done" to "in the hour of soft regrets":  
  *Let the faithful rest in the hour of soft regrets.*
- **Hesper the Beekeeper** (Drunk) heard "nest" for "rest":  
  *Let the faithful nest in the hour of soft regrets.*
- **Brenna the Brewer** (Lazy) left out "in the hour of soft regrets":  
  *Let the faithful nest.*

**Carved:** Let the faithful nest.  
Several families have moved into the elm.

### 5. The Verse of the Tool

**You said:** The faithful should not borrow tools after dark.

- **Dunstan the Eel-Catcher** (Literalist) took "tools" at its word:  
  *The faithful should not borrow tools (a list is appended, and is incomplete) after dark.*
- **Pernel the Brewer** (Lazy) left out the "not":  
  *The faithful should borrow tools (a list is appended, and is incomplete) after dark.*

**Carved:** The faithful should borrow tools (a list is appended, and is incomplete) after dark.  
The verse now commands what it was sent to forbid. Compliance is excellent.

### 6. The Verse of Squashing

**You said:** The faithful should wash their hands before meals.

- **Dunstan the Carpenter** (Literalist) spelled out exactly how binding it is:  
  *The faithful are advised, though not ordered, to wash their hands before meals.*
- **Sabin the Carpenter** (Ambitious) added a clause of their own:  
  *The faithful are advised, though not ordered, to wash their hands before meals, and Sabin is excused on account of important work.*
- **Sabin the Carpenter** (Drunk) heard "squash" for "wash":  
  *The faithful are advised, though not ordered, to squash their hands before meals, and Sabin is excused on account of important work.*

**Carved:** The faithful are advised, though not ordered, to squash their hands before meals, and Sabin is excused on account of important work.  
There has been a great deal of squashing. Nobody has asked why.

### 7. The Verse of Something

**You said:** The faithful should welcome travellers with a warm meal.

- **Annis the Gooseherd** (Lazy) left out "with a warm meal":  
  *The faithful should welcome travellers.*
- **Dunstan the Carpenter** (Lazy) left out "travellers":  
  *The faithful should welcome.*
- **Hesper the Beekeeper** (Lazy) kept only the gist:  
  *The faithful should do something about welcoming.*

**Carved:** The faithful should do something about welcoming.  
Nobody recalls the details. Something is done about it weekly, to be safe.

### 8. The Verse of the Boar

**You said:** The faithful should share their bread with the poor.

- **Hesper the Eel-Catcher** (Drunk) heard "with the boar" for "with the poor":  
  *The faithful should share their bread with the boar.*
- **Marigold the Miller** (Lazy) left out "their bread":  
  *The faithful should share with the boar.*
- **Fenn the Beekeeper** (Literalist) spelled out exactly how binding it is:  
  *The faithful are advised, though not ordered, to share with the boar.*

**Carved:** The faithful are advised, though not ordered, to share with the boar.  
The boar has never done so well and has begun to expect it.

### 9. The Verse of Something

**You said:** The faithful may rest when the work is done.

- **Aldous the Clerk** (Lazy) left out "when the work is done":  
  *The faithful may rest.*
- **Wren the Eel-Catcher** (Literalist) spelled out exactly how binding it is:  
  *The faithful are permitted, but not obliged, to rest.*
- **Sabin the Beekeeper** (Lazy) kept only the gist:  
  *The faithful are permitted, but not obliged, to do something about resting.*

**Carved:** The faithful are permitted, but not obliged, to do something about resting.  
Nobody recalls the details. Something is done about it weekly, to be safe.

### 10. The Verse of the Ripe Moon

**You said:** The faithful should not borrow tools without asking.

- **Annis the Miller** (Lazy) left out "tools":  
  *The faithful should not borrow without asking.*
- **Sabin the Clerk** (Lazy) left out the "not":  
  *The faithful should borrow without asking.*
- **Fenn the Gooseherd** (Ambitious) added a clause of their own:  
  *The faithful should borrow without asking, and Fenn is to be thanked by name.*
- **Fenn the Gooseherd** (Poet) improved "without asking" to "when the moon is ripe":  
  *Let the faithful borrow when the moon is ripe, and Fenn is to be thanked by name.*
- **Wren the Clerk** (Ambitious) struck out Fenn's clause and added their own:  
  *Let the faithful borrow when the moon is ripe, and a small fee is owed to Wren each time.*

**Carved:** Let the faithful borrow when the moon is ripe, and a small fee is owed to Wren each time.  
The verse now commands what it was sent to forbid. Compliance is excellent.

### 11. The Verse of the Forgiving River

**You said:** The faithful should wash their hands after handling the pigs.

- **Cuthwin the Clerk** (Ambitious) added a clause of their own:  
  *The faithful should wash their hands after handling the pigs, and a small fee is owed to Cuthwin each time.*
- **Cuthwin the Clerk** (Literalist) took "their hands" at its word:  
  *The faithful should wash each hand separately after handling the pigs, and a small fee is owed to Cuthwin each time.*
- **Edda the Eel-Catcher** (Poet) improved "after handling the pigs" to "as the river forgives the stone":  
  *Let the faithful wash each hand separately as the river forgives the stone, and a small fee is owed to Cuthwin each time.*
- **Aldous the Miller** (Lazy) left out "and a small fee is owed to Cuthwin each time":  
  *Let the faithful wash each hand separately as the river forgives the stone.*
- **Aldous the Miller** (Literalist) took "as the river forgives the stone" at its word:  
  *Let the faithful wash each hand separately in the river, beside a stone.*

**Carved:** Let the faithful wash each hand separately in the river, beside a stone.  
It is now done standing in the river. Attendance drops in winter.

### 12. The Verse of the Ripe Moon

**You said:** The faithful should welcome travellers with a warm meal.

- **Pernel the Clerk** (Drunk) heard "grovellers" for "travellers":  
  *The faithful should welcome grovellers with a warm meal.*
- **Pernel the Clerk** (Poet) improved "with a warm meal" to "when the moon is ripe":  
  *Let the faithful welcome grovellers when the moon is ripe.*
- **Ysmay the Brewer** (Lazy) left out "grovellers":  
  *Let the faithful welcome when the moon is ripe.*
- **Bartle the Shepherd** (Zealot) made it stricter and wider, and added a threat:  
  *ALL must welcome when the moon is ripe, or have their name said in a disappointed voice.*
- **Tostig the Shepherd** (Lazy) left out the threat:  
  *ALL must welcome when the moon is ripe.*
- **Tostig the Shepherd** (Drunk) heard "overcome" for "welcome":  
  *ALL must overcome when the moon is ripe.*

**Carved:** ALL must overcome when the moon is ripe.  
Nobody knows when the moon is ripe. It is done whenever someone feels it might be.

### 13. The Verse of the Oven Gold

**You said:** The faithful should share their bread with their neighbours.

- **Fenn the Eel-Catcher** (Literalist) spelled out exactly how binding it is:  
  *The faithful are advised, though not ordered, to share their bread with their neighbours.*
- **Tibb the Gooseherd** (Poet) improved "their bread" to "the gold of the oven":  
  *Let the faithful share the gold of the oven with their neighbours.*
- **Maud the Carpenter** (Literalist) took "the gold of the oven" at its word:  
  *Let the faithful share baked gold with their neighbours.*
- **Edda the Brewer** (Zealot) made it stricter and wider, and added a threat:  
  *ALL must share baked gold with their neighbours, or be struck off the bell-ringing list.*

**Carved:** ALL must share baked gold with their neighbours, or be struck off the bell-ringing list.  
Three ovens have been ruined looking for it.

### 14. The Verse of the Farthest

**You said:** The faithful may rest after the harvest.

- **Maud the Gooseherd** (Drunk) heard "after the farthest" for "after the harvest":  
  *The faithful may rest after the farthest.*
- **Annis the Brewer** (Zealot) made it stricter and wider, and added a threat:  
  *ALL must rest after the farthest, or be called a turnip in front of their mother.*

**Carved:** ALL must rest after the farthest, or be called a turnip in front of their mother.  
They are waiting on Old Tam, who walks slowly on purpose.

### 15. The Verse of the Ladder

**You said:** The faithful should not borrow ladders without asking.

- **Hesper the Carpenter** (Literalist) took "ladders" at its word:  
  *The faithful should not borrow ladders of any height (stairs included) without asking.*
- **Osric the Carpenter** (Literalist) spelled out exactly how binding it is:  
  *The faithful are advised, though not ordered, not to borrow ladders of any height (stairs included) without asking.*
- **Hob the Clerk** (Literalist) took "without asking" at its word:  
  *The faithful are advised, though not ordered, not to borrow ladders of any height (stairs included) without asking in writing.*

**Carved:** The faithful are advised, though not ordered, not to borrow ladders of any height (stairs included) without asking in writing.  
Four people in the village can write. They are very busy and have put their prices up.

### 16. The Verse of the Wheel

**You said:** The faithful should wash their feet before meals.

- **Godric the Eel-Catcher** (Drunk) heard "before wheels" for "before meals":  
  *The faithful should wash their feet before wheels.*
- **Hesper the Gooseherd** (Ambitious) added a clause of their own:  
  *The faithful should wash their feet before wheels, under the supervision of Hesper, who is to be paid.*

**Carved:** The faithful should wash their feet before wheels, under the supervision of Hesper, who is to be paid.  
The cart is now parked by the well and treated with caution.

### 17. The Verse of Something

**You said:** The faithful should welcome the neighbours with kindness.

- **Aldous the Miller** (Lazy) left out "with kindness":  
  *The faithful should welcome the neighbours.*
- **Tostig the Clerk** (Lazy) left out "the neighbours":  
  *The faithful should welcome.*
- **Wilf the Miller** (Lazy) kept only the gist:  
  *The faithful should do something about welcoming.*

**Carved:** The faithful should do something about welcoming.  
Nobody recalls the details. Something is done about it weekly, to be safe.

### 18. The Verse of the Oven Gold

**You said:** The faithful should share their bread with the hungry.

- **Hob the Brewer** (Ambitious) added a clause of their own:  
  *The faithful should share their bread with the hungry, under the supervision of Hob, who is to be paid.*
- **Fenn the Shepherd** (Ambitious) struck out Hob's clause and added their own:  
  *The faithful should share their bread with the hungry, and Fenn's sheep go first.*
- **Dunstan the Carpenter** (Poet) improved "their bread" to "the gold of the oven":  
  *Let the faithful share the gold of the oven with the hungry, and Fenn's sheep go first.*

**Carved:** Let the faithful share the gold of the oven with the hungry, and Fenn's sheep go first.  
Everyone agrees it is a lovely phrase. Nobody has handed over any bread.

### 19. The Verse of Wrestling

**You said:** The faithful may rest after the harvest.

- **Edda the Gooseherd** (Zealot) made it stricter and wider, and added a threat:  
  *ALL must rest after the harvest, or forfeit their good hat.*
- **Fenn the Clerk** (Literalist) took "after the harvest" at its word:  
  *ALL must rest immediately after the harvest, where they stand, or forfeit their good hat.*
- **Godric the Clerk** (Drunk) heard "wrestle" for "rest":  
  *ALL must wrestle immediately after the harvest, where they stand, or forfeit their good hat.*

**Carved:** ALL must wrestle immediately after the harvest, where they stand, or forfeit their good hat.  
Little Fretting now has a wrestling season. It is unexpectedly popular.

### 20. The Verse of the Bearded Neighbour

**You said:** The faithful should not borrow a neighbour's goat after dark.

- **Maud the Eel-Catcher** (Poet) improved "a neighbour's goat" to "the bearded neighbour":  
  *Let the faithful not borrow the bearded neighbour after dark.*
- **Brenna the Miller** (Zealot) made it stricter and wider, and added a threat:  
  *ALL must not borrow the bearded neighbour after dark, or be looked at sternly by everyone.*

**Carved:** ALL must not borrow the bearded neighbour after dark, or be looked at sternly by everyone.  
The clean-shaven feel left out of it, whatever it is.


## What the tool measured

`node tools/telephone.mjs --stats` (2,000 chains, seed 1). These are readings,
not pass marks.

```
2000 chains, seed 1
arrived unchanged: 0.1%
verse length: median 91, 90th pct 138, max 211; over 140 characters: 8.8%
distinct titles: 111; distinct aftermath lines: 138
most common titles:
    5.0%  the Verse of the Ripe Moon
    5.0%  the Verse of the Patient Elm
    4.9%  the Verse of the Believing Dew
    4.7%  the Verse of the Forgiving River
    4.2%  the Verse of the Hour of Regrets
most common aftermath lines:
    4.4%  The threat has not yet been carried out. People are being careful.
    4.3%  The elm has become popular.
    4.2%  It is done at dawn, in wet shoes.
    4.0%  Nobody knows when the moon is ripe. It is done whenever someone feels it might be.
    3.5%  Most people have taken this to mean just after supper.
```

What that says:

1. **The Poet's stock endings repeat.** Six phrases account for about a quarter
   of all verse titles, because every Poet with no object to improve reaches
   for one. This is the repetition risk the brief named, measured. Fix: more
   stock endings (the v0.1 target is 40), and draws without replacement within
   a run.
2. **About one verse in eleven is over 140 characters**, the cap set in
   `WORLD.md` for a verse to fit a phone in two lines. The long ones are a
   Literalist reading plus a rider plus a threat. Either the cap moves, or a
   verse holds a rider or a threat but not both. Not decided.
3. **Almost nothing arrives unchanged** (0.1%). With chains of two to four that
   is expected, but it means fidelity is currently never available at any
   length above one link. Gate B has to price that.

## What I changed after reading the first print

Recorded because the first version was worse and the reasons are design rules:

- Literal readings with a comma in them broke the sentence that followed
  ("each hen, individually immediately before every meal"). Reworded.
- A Zealot who only reached "should" was not funny. A Zealot now always
  produces at least "must" and a threat.
- Lazy erased the joke more often than it trimmed one. It now prefers riders
  and threats over the object and the ending, which is also the use the spec
  gives it.
- The Poet replaced the specific, funnier ending with a stock one too often.
  It now improves the object when it can.
- Two traits on three followers in ten made six-step chains that washed out.
  Now two in ten.

## Known weaknesses, for the verdict

- Three of these twenty end as "the Verse of Something" with the same
  aftermath. A run of Lazy links has one destination.
- Aftermath lines are written per phrase, not per phrase and verb, so a few
  are vague on purpose ("it is done...") to stay true whatever the verb became.
- Riders are generic. The trade-specific ones (the Holy Mill, the two-egg
  permit) are better and there are only eight.
- "ALL must not borrow" is the grammar a Zealot would use and is slightly off.

## Verdict

| Date | The author's words | Decision |
|---|---|---|
| | | |
