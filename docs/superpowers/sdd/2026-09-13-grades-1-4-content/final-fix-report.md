# Final fix wave — task 22-26 whole-branch review

Branch: `feat/multi-grade-adaptive`
Commits: `0e004fb` (Fix 1, Important), `2eed97a` (Fix 2, polish)

## Fix 1 — Grade 2 readability guard (Important)

### The gap

Grade 1 enforces the Content Contract's age-appropriateness clause ("A Grade
1 or 2 item may not require reading a paragraph to find the arithmetic")
with `assertGradeOneReadable` in `src/curriculum/authoredBank.testkit.ts`.
Grade 2 had no equivalent. The review found 43+ Grade 2 authored prompts at
90+ characters.

### Distribution measured before touching anything

Measured over all 90 Grade 2 authored items (all four domains) and 300
seeds of every one of the 20 Grade 2 templates (checked with a scratch
vitest file, since deleted — not part of the shipped diff):

- Authored bank (90 items): 40 of 90 are at 90+ characters after the fix
  (was 43 before); max was 227 characters (`g2-g3-04`, the two-cuts-of-pizza
  item), with a real cluster of legitimate 100–170-character two/three
  sentence word problems.
- Authored sentence-count distribution (before): 1 sentence: 30, 2: 24,
  3: 17, 4: 14, 5: 4, 6: 1 (`g2-oa1-04`, the Ana-crayons two-step item).
- Long words (>10 letters) found anywhere in the corpus: `centimeters`,
  `rectangular`, `quadrilateral` — all three sourced from
  `grade2/standards.ts` vocabulary (NC.2.MD.3's "estimating in centimeters",
  NC.2.OA.4's "rectangular arrays" / NC.2.G.1's "rectangular prisms",
  NC.2.G.1's own shape list including "quadrilaterals").
- 3 of 20 templates failed a candidate 160-char / 3-sentence guard at some
  seed over a 300-seed sweep: `g2.oa1.change-unknown`, `g2.md2.two-units`,
  `g2.md5.shorter-length-unknown` (all three narrative, multi-clause
  generators; the other 17 template shapes are single-sentence or two short
  sentences by construction and never approached either limit).

### Chosen limits and why

`assertGradeTwoReadable` (new, next to `assertGradeOneReadable` in
`authoredBank.testkit.ts`):

- **At most 160 characters.** The distribution's long tail starts around 90
  characters; 160 catches the paragraph-length outliers (up to 227) while
  leaving every legitimate short multi-sentence word problem — including
  NC.2.OA.1's required two-step problems — alone. This was NOT picked to
  pass everything unchanged: at 160/3, 21 of 90 authored items and 3 of 20
  templates still failed and needed shortening (see below), well under the
  ~25-item mass-rewrite stop condition in scope.
- **At most 3 sentences, including the question** — one more than Grade 1's
  2, because a Grade 2 two-step problem legitimately needs a setup
  sentence, a change sentence, and a question. Verified directly:
  `g2-oa1-04` (the two-step Ana-crayons item) rewrites to 2 sentences by
  folding the narrative into one sentence and the equation into the
  question, without changing the two-step mathematics NC.2.OA.1 requires.
- **No word longer than 10 letters** — same cap as Grade 1; a seven- or
  eight-year-old is not meaningfully more tolerant of "quadrilateral" than a
  six-year-old is of "associative". `GRADE_2_VOCAB_ALLOWLIST` = `centimeters,
  rectangular, quadrilateral`, sourced from `grade2/standards.ts` exactly as
  the Grade 1 allowlist is.

### RED / GREEN evidence

RED (`authoredBank.testkit.test.ts`, before implementing `assertGradeTwoReadable`):
```
(0 , assertGradeTwoReadable) is not a function
Tests  8 failed | 21 passed (29)
```
Implemented the function and allowlist → GREEN, 29/29 in that file.

RED (per-domain authored test files, after wiring in the guard but before
shortening any prompt):
```
g2-g1-03: prompt is 161 characters, must be under 160: ...
g2-md2-01: prompt has 4 sentences, at most 3: ...
g2-nbt1-01: prompt has 4 sentences, at most 3: ...
g2-oa1-01: prompt has 5 sentences, at most 3: ...
Test Files  4 failed | 1 passed (5)
Tests  4 failed | 60 passed (64)
```
(Templates' `index.test.ts` was already GREEN at this point because the 3
failing template generators were fixed in the same pass as the guard was
added to `templates/index.test.ts`; their own per-template `.test.ts` files
went RED next, on the literal-pin and parsing-regex diffs, and are recorded
below.)

After shortening the 21 authored items and 3 templates, and updating the 3
templates' own `.test.ts` files (literal pins + parsing regexes) to match
the reworded prompts → GREEN:
```
npx vitest run src/curriculum/grade2
Test Files  32 passed (32)
Tests  263 passed (263)
```

### Rewritten authored items (before → after)

All 21 keep their numbers, correct answer, standard, and every distractor's
derivation unchanged; only the prose is shortened.

1. **g2-oa1-01** (NC.2.OA.1)
   - Before: "Some birds were on a fence. 8 more birds landed on the fence. Now there are 15 birds. The equation ☐ + 8 = 15 shows this. What number goes in the ☐?" (148 chars, 5 sentences)
   - After: "A fence had some birds. 8 more landed, and now there are 15. What number goes in ☐ + 8 = 15?" (92 chars, 3 sentences)

2. **g2-oa1-02** (NC.2.OA.1)
   - Before: "Maya has 6 stickers. Liam has 5 more stickers than Maya. The equation 6 + 5 = ☐ shows how many stickers Liam has. What number goes in the ☐?" (4 sentences)
   - After: "Maya has 6 stickers. Liam has 5 more than Maya. What number goes in ☐ in 6 + 5 = ☐?" (3 sentences)

3. **g2-oa1-03** (NC.2.OA.1)
   - Before: "Jon has 14 marbles. Priya has 6 fewer marbles than Jon. The equation 14 − 6 = ☐ shows how many marbles Priya has. What number goes in the ☐?" (4 sentences)
   - After: "Jon has 14 marbles. Priya has 6 fewer than Jon. What number goes in ☐ in 14 − 6 = ☐?" (3 sentences)

4. **g2-oa1-04** (NC.2.OA.1, two-step)
   - Before: "Ana had 9 crayons. She lost some crayons. Then her friend gave her 4 more crayons. Now Ana has 8 crayons. The equation 9 − ☐ + 4 = 8 shows this. How many crayons did Ana lose?" (175 chars, 6 sentences)
   - After: "Ana had 9 crayons, lost some, then got 4 more, ending with 8. In 9 − ☐ + 4 = 8, how many did Ana lose?" (102 chars, 2 sentences)

5. **g2-oa1-05** (NC.2.OA.1, two-step)
   - Before: "Leo has 7 toy cars. He buys 5 more toy cars. Then he gives 3 toy cars to his brother. The equation 7 + 5 − 3 = ☐ shows this. How many toy cars does Leo have now?" (161 chars, 5 sentences)
   - After: "Leo has 7 toy cars, buys 5 more, then gives 3 to his brother. In 7 + 5 − 3 = ☐, how many cars does Leo have now?" (112 chars, 2 sentences)

6. **g2-oa3-02** (NC.2.OA.3)
   - Before: "Priya has 13 blocks. She pairs them up: 2 blocks in every pair. She makes 6 pairs, and 1 block is left with no partner. Is 13 odd or even?" (4 sentences)
   - After: "Priya pairs up 13 blocks, 2 in each pair. She makes 6 pairs, with 1 block left over. Is 13 odd or even?" (3 sentences)

7. **g2-md2-01** (NC.2.MD.2)
   - Before: "Ben and Tia measure the same rug with their own shoes, heel to toe. The rug is 9 of Ben's shoes long. It is 12 of Tia's shoes long. What does this tell you?" (4 sentences)
   - After: "Ben and Tia measure the same rug in shoe lengths. It is 9 of Ben's shoes, but 12 of Tia's shoes. What does this tell you?" (3 sentences; keeps "the same", required by `authored.md.test.ts`)

8. **g2-md2-02** (NC.2.MD.2)
   - Before: "Jada measures the same table two times. In inches, the table is 48 inches long. In feet, it is 4 feet long. Why is the number of feet so much smaller?" (4 sentences)
   - After: "Jada measures the same table twice: 48 inches, or 4 feet. Why is the number of feet so much smaller?" (2 sentences)

9. **g2-md2-03** (NC.2.MD.2)
   - Before: "Hana measures the same rug two times. First she measures it in yards and gets 3. Then she measures it in inches. A yard is much longer than an inch. What will happen?" (166 chars, 5 sentences)
   - After: "Hana measures the same rug twice: 3 yards, then inches. A yard is much longer than an inch. What will happen when she counts inches?" (132 chars, 3 sentences)

10. **g2-md4-03** (NC.2.MD.4)
    - Before: "Kim measures a table and a desk with a measuring tape marked in feet. The table is 5 feet long. The desk is 3 feet long. Which sentence is true?" (4 sentences)
    - After: "Kim measures a table and a desk in feet: the table is 5 feet, the desk is 3 feet. Which sentence is true?" (2 sentences)

11. **g2-md5-02** (NC.2.MD.5)
    - Before: "The red ribbon is 26 inches long. The green ribbon is 30 inches long. The blue ribbon is 17 inches longer than the red ribbon. Which equation shows how long the blue ribbon is?" (176 chars, 4 sentences)
    - After: "The red ribbon is 26 inches, the green is 30 inches, and the blue is 17 inches longer than the red. Which equation shows the blue ribbon's length?" (146 chars, 2 sentences; keeps all three lengths, since the green ribbon's 30 is a live distractor input)

12. **g2-md5-03** (NC.2.MD.5)
    - Before: "Dad cuts 25 centimeters off a board. Now the board is 48 centimeters long. The equation ☐ − 25 = 48 shows this. How long was the board before Dad cut it?" (4 sentences)
    - After: "Dad cuts 25 centimeters off a board, leaving 48 centimeters. In ☐ − 25 = 48, how long was the board before?" (2 sentences)

13. **g2-md6-01** (NC.2.MD.6)
    - Before: "Ava starts at 23 on a number line. She makes one jump of 10. Then she makes 4 jumps of 1. Where does she land?" (4 sentences)
    - After: "Ava starts at 23 on a number line, jumps 10, then jumps 1 four times. Where does she land?" (2 sentences)

14. **g2-md8-02** (NC.2.MD.8)
    - Before: "Omar has $45. He earns $30 more. Then he spends $18 on a book. How much money does Omar have now?" (4 sentences)
    - After: "Omar has $45, earns $30 more, then spends $18 on a book. How much money does he have now?" (2 sentences)

15. **g2-md10-03** (NC.2.MD.10)
    - Before: "There are 20 students in Ms. Fox's class. Each student voted once for the best part of the school day. The bar for recess is missing from the graph. How many students voted for recess?" (184 chars, 5 sentences)
    - After: "20 students voted for their favorite part of the day, but the bar for recess is missing. How many voted for recess?" (115 chars, 2 sentences; keeps "missing", required by `authored.md.test.ts`)

16. **g2-nbt1-01** (NC.2.NBT.1)
    - Before: "A teacher has 10 bundles of straws. Each bundle holds 10 straws. She unties every bundle and puts all the straws in one pile. How many straws are in the pile?" (4 sentences)
    - After: "A teacher unties 10 bundles of straws, 10 straws in each bundle, into one pile. How many straws are in the pile?" (2 sentences)

17. **g2-nbt6-03** (NC.2.NBT.6)
    - Before: "Three classes collected cans. Class A collected 46 cans, Class B collected 38 cans, and Class C collected 57 cans. How many cans did the three classes collect in all?" (166 chars)
    - After: "Class A collected 46 cans, Class B collected 38, and Class C collected 57. How many cans did all three classes collect?" (119 chars; all three addends kept)

18. **g2-nbt7-01** (NC.2.NBT.7)
    - Before: "Sam adds 236 + 147 with base-ten blocks. He puts the hundreds together, the tens together, and the ones together. The 13 ones become 1 ten and 3 ones. What is 236 + 147?" (169 chars, 4 sentences)
    - After: "Sam adds 236 + 147 with base-ten blocks: hundreds with hundreds, tens with tens, ones with ones. The 13 ones become 1 ten and 3 ones. What is 236 + 147?" (152 chars, 3 sentences)

19. **g2-nbt8-04** (NC.2.NBT.8)
    - Before: "Start at 264. Add 100. Then take away 10. What number do you end on?" (4 sentences)
    - After: "Start at 264, add 100, then take away 10. What number do you end on?" (2 sentences)

20. **g2-g1-03** (NC.2.G.1)
    - Before: "A box shaped like a rectangular prism has a flat face on every side, including the sides hidden from view in a picture of it. How many faces does it have in all?" (161 chars)
    - After: "A rectangular prism has a flat face on every side, even ones hidden in a picture. How many faces does it have in all?" (117 chars)

21. **g2-g3-04** (NC.2.G.3)
    - Before: "Two identical square pizzas are each cut into halves. Pizza 1 is cut straight down the middle into two matching rectangles. Pizza 2 is cut corner to corner into two matching triangles. Are both pizzas correctly cut into halves?" (227 chars, 4 sentences)
    - After: "Pizza 1 is cut straight down the middle into 2 matching rectangles. Pizza 2 is cut corner to corner into 2 matching triangles. Are both cut into equal halves?" (158 chars, 3 sentences)

### Rewritten templates (generator wording, before → after)

Each keeps its draw space, option set, misconceptions, and its sentinel
regex in `templates/index.test.ts` (which pins the *leading* sentence(s) of
each generator's prompt shape) unchanged.

- **`g2.oa1.change-unknown`** (`templates/oa1-change-unknown.ts`)
  - Before: `` `${subject} had ${start} ${noun}. ${subject} ${verbPast} some of them. Now ${subject} has ${end} ${noun}. The equation ${start} − ☐ = ${end} shows this. How many ${noun} did ${subject} ${verbBase}?` `` (5 sentences; up to 175 chars, matching the authored `g2-oa1-04` shape)
  - After: `` `${subject} had ${start} ${noun}. ${subject} ${verbPast} some of them. In ${start} − ☐ = ${end}, how many ${noun} did ${subject} ${verbBase}?` `` (3 sentences)
  - Sibling test updated: literal pins at seeds 7 and 123, and the `end`-extraction regex (`/Now \S+ has (\d+)/` → `/− ☐ = (\d+)/`).

- **`g2.md2.two-units`** (`templates/md2-two-units.ts`)
  - Before: `` `${name} measures the same ${object} two times. First ${pronoun} measures it in ${first.plural}. Then ${pronoun} measures it in ${second.plural}. ${hint} Which sentence is true?` `` (4 sentences; up to 171 chars)
  - After: `` `${name} measures the same ${object} two times. First ${pronoun} measures it in ${first.plural}, then in ${second.plural}. Since ${hintClause}, which sentence is true?` `` (3 sentences) — added a lowercase, period-free `hintClause` alongside the existing `hint` display string (later removed as dead code once `hint` had no remaining use).
  - Sibling test updated: `unitsOf()`'s parsing regex, and the two literal-pin prompts at seeds 7 and 123.

- **`g2.md5.shorter-length-unknown`** (`templates/md5-shorter-length-unknown.ts`)
  - Before: `` `The ${longOne} is ${length(big)} long. It is ${length(diff)} longer than the ${shortOne}. The equation ☐ + ${diff} = ${big} shows this. How long is the ${shortOne}?` `` (4 sentences; up to 176 chars, e.g. "kite string")
  - After: `` `The ${longOne} is ${length(big)} long. It is ${length(diff)} longer than the ${shortOne}. In ☐ + ${diff} = ${big}, how long is the ${shortOne}?` `` (3 sentences)
  - Sibling test updated: `parse()`'s regex, and the two literal-pin prompts at seeds 7 and 123.

### Covering tests added

- `src/curriculum/authoredBank.testkit.ts`: `assertGradeTwoReadable` +
  `GRADE_2_VOCAB_ALLOWLIST`.
- `src/curriculum/authoredBank.testkit.test.ts`: 8 new tests — accepts a
  short one-step problem, accepts a 2-sentence two-step problem (the
  NC.2.OA.1 case named in the task), accepts exactly 160 chars, **rejects**
  161 chars, **rejects** a 4th sentence, **rejects** a long word, accepts
  the allowlisted words, and **still rejects a different long word** with
  the allowlist supplied (the negative control proving the allowlist
  doesn't loosen the cap itself).
- `src/curriculum/grade2/authored.oa.test.ts`,
  `authored.md.test.ts`, `authored.nbt.test.ts`, `authored.g.test.ts`: one
  `assertGradeTwoReadable(..., { allowlist: GRADE_2_VOCAB_ALLOWLIST })` test
  each, covering all four domains' authored banks.
- `src/curriculum/grade2/templates/index.test.ts`: one test sweeping all 20
  templates at 300 seeds each through the same guard.

## Fix 2 — Grade 1 study guide polish

a. **`studyGuides.test.ts`**: added `keeps every worked example readable
   for a six-year-old`, running `assertGradeOneReadable` (with
   `GRADE_1_G_VOCAB_ALLOWLIST`) over every guide's `workedExample.problem`.
   RED once the MD.3 question was added (91 characters); fixed by trimming
   2 characters ("points at" → "is", "points at 6" → "is at 6"). GREEN
   after.

b. **`NC.1.MD.2`**: `workedExample.problem` was "Ben measures his desk with
   8 blocks laid end to end, with no gaps." (a statement). Now: "Ben
   measures his desk with 8 blocks laid end to end, with no gaps. How long
   is the desk?" (2 sentences, 89 chars).

   **`NC.1.MD.3`**: was "The hour hand points halfway between 7 and 8. The
   minute hand points at 6." (a statement, already 2 sentences). Adding a
   third sentence for the question would have broken the 2-sentence cap, so
   the two setup sentences were merged into one: "The hour hand is halfway
   between 7 and 8, and the minute hand is at 6. What time is it?" (2
   sentences, 89 chars).

c. **`NC.1.G.1`** `commonTraps` named "pentagon and hexagon", but "pentagon"
   is not in G.1's `keyConcepts` (triangles, rectangles, squares,
   trapezoids, hexagons, circles — from `grade1/standards.ts`). Replaced
   with "square and rectangle", a pair from G.1's own shape list, per the
   task's suggestion.

## Commands and output

```
$ npx vitest run src/curriculum/authoredBank.testkit.test.ts   # after adding failing tests, before implementing the function
Tests  8 failed | 21 passed (29)

$ npx vitest run src/curriculum/authoredBank.testkit.test.ts   # after implementing assertGradeTwoReadable
Tests  29 passed (29)

$ npx vitest run src/curriculum/grade2/authored.oa.test.ts src/curriculum/grade2/authored.md.test.ts \
    src/curriculum/grade2/authored.nbt.test.ts src/curriculum/grade2/authored.g.test.ts \
    src/curriculum/grade2/templates/index.test.ts   # guard wired in, before shortening prompts
Test Files  4 failed | 1 passed (5)
Tests  4 failed | 60 passed (64)

$ npx vitest run src/curriculum/grade2   # after shortening all 21 authored items + 3 templates + their sibling tests
Test Files  32 passed (32)
Tests  263 passed (263)

$ npx vitest run src/curriculum/grade1/studyGuides.test.ts   # RED: NC.1.MD.3 at 91 chars
Tests  1 failed | 5 passed (6)

$ npx vitest run src/curriculum/grade1/studyGuides.test.ts   # GREEN after trimming 2 chars
Tests  6 passed (6)

$ npx vitest run   # full suite
Test Files  147 passed (147)
Tests  1638 passed (1638)

$ npm run lint
(0 errors; pre-existing warnings only, e.g. ProgressContext.tsx react(purity)/react(only-export-components),
 WeakSpotsView.tsx react(purity), QuizResults.tsx no-unused-vars, AdaptiveSessionCard.test.tsx react(globals) —
 none touched by this change)

$ npx tsc -b --noEmit
(clean, no output)
```

Baseline was 1624/1624, lint 0 errors, tsc clean. This wave adds 14 tests
(1638 total): 8 in `authoredBank.testkit.test.ts`, 4 domain-level
`assertGradeTwoReadable` tests (OA/MD/NBT/G), 1 template sweep, and 1 study
guide readability sweep.

## Files changed

Commit `0e004fb` (Fix 1):
- `src/curriculum/authoredBank.testkit.ts` — `assertGradeTwoReadable`, `GRADE_2_VOCAB_ALLOWLIST`
- `src/curriculum/authoredBank.testkit.test.ts` — negative controls for the new guard
- `src/curriculum/grade2/authored.oa.ts`, `authored.oa.test.ts`
- `src/curriculum/grade2/authored.md.ts`, `authored.md.test.ts`
- `src/curriculum/grade2/authored.nbt.ts`, `authored.nbt.test.ts`
- `src/curriculum/grade2/authored.g.ts`, `authored.g.test.ts`
- `src/curriculum/grade2/templates/oa1-change-unknown.ts`, `.test.ts`
- `src/curriculum/grade2/templates/md2-two-units.ts`, `.test.ts`
- `src/curriculum/grade2/templates/md5-shorter-length-unknown.ts`, `.test.ts`
- `src/curriculum/grade2/templates/index.test.ts`

Commit `2eed97a` (Fix 2):
- `src/curriculum/grade1/studyGuides.ts`
- `src/curriculum/grade1/studyGuides.test.ts`

## Concerns

- None outstanding. The 160-char / 3-sentence calibration required
  rewriting 21 authored prompts plus 3 template generators — under the
  ~25-item mass-rewrite threshold in scope, and each rewrite is a wording
  change only (numbers, answers, standards, and distractor derivations are
  byte-for-byte unchanged except where explicitly noted, e.g. keeping "the
  same" and "missing" for sibling-test keyword checks).
- One incidental cleanup: `md2-two-units.ts`'s old `hint` display string
  became dead code once the prompt switched to the lowercase `hintClause`
  form; it was removed to keep lint at 0 warnings introduced by this change
  (oxlint's `no-unused-vars` had flagged it).
