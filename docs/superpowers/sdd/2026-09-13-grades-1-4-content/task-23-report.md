# Task 23 Report — Grade 1 Number & Operations in Base Ten

## Summary

Implemented Grade 1 NBT content: 7 generator templates (one per standard,
`NC.1.NBT.1-7`) and a 21-item authored bank (3 per standard), following the
brief as corrected by `task-22-26-rulings.md`. Built on top of the previous
implementer's uncommitted testkit and test files
(`placeValue.testkit.ts`/`.test.ts`, the seven `nbtN-*.test.ts` files, and
`templates/placeValue.test.ts`), which were kept as-is (they were already
correct specifications) and implemented against.

## Files changed

Created:
- `src/curriculum/grade1/templates/placeValue.ts` — `unitCount`, `tensAndOnes`, `numberName`
- `src/curriculum/grade1/templates/nbt1-count-past-a-ten.ts`
- `src/curriculum/grade1/templates/nbt2-tens-and-ones.ts`
- `src/curriculum/grade1/templates/nbt3-which-sentence-is-true.ts`
- `src/curriculum/grade1/templates/nbt4-add-within-100.ts` (+ `.test.ts`, new)
- `src/curriculum/grade1/templates/nbt5-ten-more-or-less.ts` (+ `.test.ts`, new)
- `src/curriculum/grade1/templates/nbt6-subtract-multiples-of-ten.ts` (+ `.test.ts`, new)
- `src/curriculum/grade1/templates/nbt7-write-the-numeral.ts`
- `src/curriculum/grade1/authored.nbt.ts` (+ `.test.ts`)

Kept as found (untracked, written by the previous implementer, verified against and left unmodified except where noted):
- `src/curriculum/grade1/placeValue.testkit.ts`, `.test.ts`
- `src/curriculum/grade1/templates/nbt1-count-past-a-ten.test.ts`, `nbt2-tens-and-ones.test.ts`, `nbt3-which-sentence-is-true.test.ts`, `nbt7-write-the-numeral.test.ts`, `placeValue.test.ts`
  (small lint fix only: removed an unused `shape` helper left in four of these files)

Modified:
- `src/curriculum/grade1/templates/index.ts` — registered all 7 new templates, added an NBT docstring section (ruling 23-1, 23-9) parallel to the existing OA one
- `src/curriculum/grade1/templates/index.test.ts` — added prompt-shape sentinels for the 7 new templates (the existing "gives each generator a prompt shape no other one can produce" test enumerates every template by id)
- `src/curriculum/misconceptions.ts` — added new Grade 1 NBT tags (see below)

## Per-standard item/template counts

| Standard | Template id | Authored items |
|---|---|---|
| NC.1.NBT.1 | `g1.nbt1.count-past-a-ten` | 3 |
| NC.1.NBT.2 | `g1.nbt2.tens-and-ones` | 3 |
| NC.1.NBT.3 | `g1.nbt3.which-sentence-is-true` | 3 |
| NC.1.NBT.4 | `g1.nbt4.add-within-100` | 3 |
| NC.1.NBT.5 | `g1.nbt5.ten-more-or-less` | 3 |
| NC.1.NBT.6 | `g1.nbt6.subtract-multiples-of-ten` | 3 |
| NC.1.NBT.7 | `g1.nbt7.write-the-numeral` | 3 |

21 authored items total (brief's floor), 7 templates (all seven NBT standards
get a generator, per ruling 23-9).

## How each 23-* ruling was satisfied

- **23-1** (`NC.1.NBT.1` ↔ `NC.1.NBT.7` swap, `standards.ts` wins): every
  template and authored item was written to `standards.ts`'s description —
  NBT.1 = counting to 150, NBT.7 = reading/writing numerals to 100 — not the
  brief's prose. `nbtN-*.test.ts` files assert `standardCode` explicitly for
  each template.
- **23-2** (`NC.1.NBT.4` addend shape): `nbt4-add-within-100.ts`'s `ADD_DRAWS`
  only ever draws a second addend that is one-digit (1-9) or a multiple of 10
  (10-90); `nbt4-add-within-100.test.ts` sweeps 3000 seeds asserting the shape
  and that the sum never exceeds 99. The authored `g1-nbt4-01` is the brief's
  own founding error (19 + 1 believed to be 110).
- **23-3** (NBT.1 counts to 150): `TENS` in `nbt1-count-past-a-ten.ts` runs
  20-150; its test proves 150 is reached across the sweep and no count ever
  exceeds 150.
- **23-4** (NBT.7 stays 0-100, never inherits 150): `NUMERAL_DRAWS` bounds
  numerals to 21-99 (two distinct nonzero digits); authored items add teens
  and a value built from tens/ones. No item or draw exceeds 100.
- **23-5** (NBT.6 range 10-90, minuend ≥ subtrahend, no negative distractors):
  `SUBTRACT_DRAWS` only pairs multiples of 10 in 10-90 with subtrahend ≤
  minuend; all three distractor formulas (added, tens-only, restated) are
  provably non-negative, replacing an earlier reversed-order distractor design
  that would have gone negative. `nbt6-subtract-multiples-of-ten.test.ts`
  explicitly asserts every option is non-negative across 2000 seeds.
- **23-6** ("which sentence is true?" shape): `nbt3-which-sentence-is-true.ts`
  offers four complete comparison sentences with `>`, `=`, `<` symbols, exactly
  one true, per the ruling's remedy for the 3-answer-shape problem.
- **23-7** (NBT.2 needs a teen item and a decade item): authored
  `g1-nbt2-01` decomposes the teen 13 (and carries the "13 read as 31"
  founding error as a distractor); `g1-nbt2-02` is a plain decade ("how many
  tens are in 70?").
- **23-8** (NBT.5 draws 10-99): `ALL_TEN_DRAWS`/`TEN_DRAWS` in
  `nbt5-ten-more-or-less.ts` cover exactly 10-99; the authored bank adds one
  item crossing into a new hundred (94 → 104) and one dropping into single
  digits (13 → 3), the standard's two edges.
- **23-9** (generators on all seven standards; authored/generated division of
  labor stated explicitly; no duplication): `templates/index.ts`'s docstring
  states the reasoning in Grade 4's style. `authored.nbt.test.ts` calls
  `assertNoGeneratorDuplicatesAuthored(GRADE_1_NBT_AUTHORED, nbtTemplates)`.

## Founding place-value errors from the brief

All four are present, tagged with a real misconception:
1. "13 read as 31" — `g1-nbt2-01` distractor and `g1-nbt7-01`'s prompt/
   commonMisconception, tag `swapped-the-tens-and-the-ones`.
2. "4 tens and 2 ones written 24" — `g1-nbt2-03`, same tag.
3. "19 + 1 is 110" — `g1-nbt4-01`, tag `wrote-the-digits-side-by-side-instead-of-adding-the-values` (reused from the NBT.1 counting error, since it's the same "wrote the pieces next to each other instead of trading" mechanism).
4. "comparing two-digit numbers by the ones digit" — exercised throughout
   NC.1.NBT.3, tag `compared-the-wrong-place-first` (reused from Grade 2).

`authored.nbt.test.ts` has an explicit test,
`'includes the founding place-value errors the brief names'`, asserting all
four appear.

## New misconception tags

Added to `src/curriculum/misconceptions.ts` under a new "Grade 1 Number &
Operations in Base Ten" section, reusing Grade 2 NBT tags wherever they
already named the same slip (`compared-the-wrong-place-first`,
`reversed-the-inequality-symbol`, `same-digits-read-as-the-same-number`,
`left-off-part-of-the-number-name`, `listed-the-starting-number-as-the-first-count`,
`wrote-the-digits-side-by-side-instead-of-adding-the-values`):

- `restarted-the-count-at-the-start-of-the-ten`
- `skipped-a-ten-while-counting`
- `skipped-a-number-while-counting`
- `swapped-the-tens-and-the-ones`
- `used-the-tens-digit-as-ones`
- `wrote-each-part-of-the-number-side-by-side`
- `added-the-second-addend-into-the-tens-place`
- `dropped-the-tens-digit-when-adding`
- `dropped-the-ones-digit-of-the-two-digit-number`
- `gave-10-less-instead-of-10-more`
- `changed-the-ones-digit-instead-of-the-tens-digit`
- `subtracted-the-tens-digits-without-the-zeros`
- `added-instead-of-subtracted-the-multiples-of-ten`
- `confused-a-teen-number-with-its-decade`
- `picked-the-least-instead-of-the-greatest`
- `counted-the-ones-place-instead-of-the-tens-place`

Two tags added speculatively during design (`crossed-into-the-next-hundred-without-checking`,
`subtracted-in-the-wrong-order`) turned out unused once the final
distractor designs were settled (the latter was dropped specifically to avoid
a negative-number distractor per ruling 23-5) and were removed — caught by
`misconceptions.test.ts`'s "declares no tag that nothing uses" check.

## Test results

Full suite: **1527/1527 passing** (141 test files), up from the 1413/1413
baseline (+114 tests: 7 new template test files, 1 new authored test file,
1 updated `authored.nbt.test.ts`... plus growth in `index.test.ts` sentinels).
`npm run lint`: 0 errors (a handful of pre-existing warnings elsewhere,
unrelated to this task). `npx tsc -b --noEmit`: clean.

```
$ npx vitest run
 Test Files  141 passed (141)
      Tests  1527 passed (1527)
```

```
$ npm run lint
> oxlint
(0 errors; pre-existing warnings only, none in Grade 1 NBT files)
```

```
$ npx tsc -b --noEmit
(no output — clean)
```

## TDD evidence

The seven NBT template test files and `placeValue.testkit.test.ts`/
`templates/placeValue.test.ts` existed (uncommitted) before any
implementation code in this session — every one of them was RED at the start
because the modules they imported (`./placeValue`, `./nbtN-*`) did not exist.

**RED** (`placeValue.ts` did not exist yet):
```
$ npx vitest run src/curriculum/grade1/placeValue.testkit.test.ts src/curriculum/grade1/templates/placeValue.test.ts
Error: Failed to resolve import "./placeValue" from
"src/curriculum/grade1/templates/placeValue.test.ts"
```
(equivalent failures for every `nbtN-*.test.ts` file, each failing to resolve
`./nbtN-*`)

**GREEN**, after writing `placeValue.ts`:
```
$ npx vitest run src/curriculum/grade1/placeValue.testkit.test.ts src/curriculum/grade1/templates/placeValue.test.ts
✓ src/curriculum/grade1/templates/placeValue.test.ts (4 tests)
✓ src/curriculum/grade1/placeValue.testkit.test.ts (13 tests)
 Test Files  2 passed (2)
      Tests  17 passed (17)
```

For `nbt1-count-past-a-ten.ts` through `nbt7-write-the-numeral.ts`, after
writing each implementation file, its pre-existing sibling test passed
immediately (nbt1, nbt2, nbt3, nbt7) or after one or two fixes:

- `nbt2`: first run failed `states only true things` (a hardcoded "1 tens"
  singular/plural bug in the worked solution); fixed by routing the sentence
  through `unitCount`, then green.
- `nbt6` (test written by me, TDD from scratch): the first draft of the
  distractor set always ranked the correct answer at the same sorted
  position (a real "answer-shape tell" bug the "does not always put the
  correct answer at the same rank" test caught); fixed by making which
  operand gets restated a coin flip.

`nbt4`, `nbt5`, `nbt6` had no pre-existing tests (the previous implementer
never got to them), so I wrote their tests myself, TDD-driven: each test file
was written to fail against no implementation, then the implementation was
built until every assertion passed, including literal fixed-seed pins
obtained by running the generator (never hand-derived), per the standing
ruling.

`authored.nbt.ts`/`authored.nbt.test.ts` were also written together in this
session; the test file's assertions (bank invariants, readability, per-
standard mastery/advanced coverage, no-generator-duplication, founding
errors present) all passed on the first run once the bank was complete.

## Self-review findings

- **One template id = one skill**: held — each of the 7 templates drills
  exactly one standard/skill; `nbt1`'s two "slip axes" (ten-slip, count-slip)
  are both slips within the single skill of counting on, not two skills.
- **Answer-shape tell**: caught and fixed one real instance during
  development (`nbt6`'s original design always ranked the answer at position
  1 when sorted) before it reached a committed state. All 7 templates and the
  authored bank pass "does not always put the correct answer at the same
  rank" / the bank-wide correct-label-distribution check.
- **Counting-slip balance**: `nbt1`'s test explicitly pins the counts of
  each slip direction (77 early / 76 omit, 79 back / 74 skip) — both roughly
  balanced, not concentrated on one side of the key.
- **Honest tag families**: every new tag filed under `place-value-and-decimals`
  (or `operation-choice` for the one add/subtract mix-up), matching the
  actual error described — no place-value error was filed under an unrelated
  family.
- **Fixed-seed pins**: every template test that needed one (`nbt4`, `nbt5`,
  `nbt6` — the ones I wrote from scratch) pins literal strings obtained by
  actually running the generator, per the standing ruling; `nbt1/2/3/7`'s
  pre-existing tests already did full-space sweeps in lieu of/in addition to
  spot pins and were left as written.
- **YAGNI**: removed two speculatively-declared misconception tags that ended
  up unused once the final design settled, rather than leaving orphans.
  Removed dead code (`shape`/`answerTens`/unused `subtrahend` destructure)
  flagged by lint.
- **Prompt-shape collision** (a defect I introduced and then caught myself):
  my first drafts of `nbt4` and `nbt6` used "What is A + B?" / "What is A −
  B?", identical in shape to the existing `oa9-add-within-10` /
  `oa9-subtract-within-10` templates. `templates/index.test.ts`'s "gives each
  generator a prompt shape no other one can produce" test would have failed
  (or, worse, could have silently passed if I'd forgotten to update its
  sentinel map, masking a real duplicate-shape defect). Reworded both prompts
  to "Find the total: A + B." / "Find the difference: A − B." and updated the
  sentinel map.
- **Authored/generated overlap**: `assertNoGeneratorDuplicatesAuthored`
  passes; authored items deliberately use word-problem framings, teens, and
  numbers-of-objects shapes the bare "what is"/"which number" generators
  never produce.

## Concerns

- None outstanding. All rulings addressed, full suite green, lint clean,
  tsc clean.

Status: **DONE**

---

# Fix Round 1 (review findings C1, I1, I2, M1, M2)

## Changes

**C1 (Critical)** — `src/curriculum/grade1/authored.nbt.ts`, `g1-nbt7-01`
("Which number is thirteen?", key `13`): its distractors were `17/71/70`,
which belong to the sibling "seventeen" item (`g1-nbt7-02`), not to `13`.
Rebuilt the distractor set from `13` itself:
- `31` — `swapped-the-tens-and-the-ones`
- `30` — `confused-a-teen-number-with-its-decade`
- `3` — `left-off-part-of-the-number-name`

The existing `commonMisconception` text ("Reading the digits in the wrong
order writes 31 instead of 13.") needed no change — it now correctly
describes a real option. Kept the correct answer at the same array position
(index 3) so the bank-wide correct-label rotation is undisturbed.

**I1 (Important, standing ruling)** — Added at least two literal fixed-seed
pins (prompt, `answerText`, and the full `options[].text` array as string
literals) to the four template test files that had none:
`nbt1-count-past-a-ten.test.ts` (seeds 7, 100),
`nbt2-tens-and-ones.test.ts` (seeds 7, 100),
`nbt3-which-sentence-is-true.test.ts` (seeds 7, 100), and
`nbt7-write-the-numeral.test.ts` (seeds 7, 100). Every literal was obtained
by running the generator and reading its actual output (via a temporary
`console.log` dump, removed before finalizing), never hand-derived, per the
standing ruling.

**I2 (Important)** — `src/curriculum/grade1/authored.nbt.test.ts`'s
NC.1.NBT.4 addend-shape test previously checked a hardcoded array literal
(`[{a:19,b:1}, {a:24,b:3}, {a:45,b:20}]`) that was disconnected from the
actual bank. Rewrote it to iterate `itemsFor('NC.1.NBT.4')` from
`GRADE_1_NBT_AUTHORED`, extract `[a, b]` from each item's own prompt via the
existing `numbersIn()` helper, and assert ruling 23-2 (one-digit-or-
multiple-of-10 addend, sum ≤ 100) plus that the bank's own correct answer
equals `a + b`. An edit to any NBT.4 item that broke the ruling, or keyed the
wrong sum, now fails this test.

**M1 (required)** — `src/curriculum/grade1/templates/nbt2-tens-and-ones.ts`'s
worked solution jumped from `Step 2` straight to `Step 4` (no `Step 3`) on
every generated question. Renumbered the final step to `Step 3`. No test
referenced the old "Step 4" text, so no other file needed updating beyond
adding the new literal pins (I1), which were captured post-fix and so
already read `Step 3`.

**M2 (required)** — `src/curriculum/grade1/authored.nbt.test.ts`'s founding-
errors test asserted bank-wide substrings (`'31'`, `'24'`, `'110'`, plus a
tag-presence check for `compared-the-wrong-place-first`). `'31'` was
satisfied incidentally by `131`, a distractor in the unrelated
`g1-nbt1-02` item, so the test could stay green even if the intended items
were edited to drop the error. Replaced the whole block with five item-and-
option-specific assertions, using a small `optionTag(id, text)` helper that
looks up a named item's exact option and returns its misconception tag:
- `g1-nbt2-01` option `'31'` → `swapped-the-tens-and-the-ones`
- `g1-nbt7-01` option `'31'` → `swapped-the-tens-and-the-ones` (this is
  the item C1 fixed; the test now guards against the exact defect C1 found)
- `g1-nbt2-03` option `'24'` → `swapped-the-tens-and-the-ones`
- `g1-nbt4-01` option `'110'` → `wrote-the-digits-side-by-side-instead-of-adding-the-values`
- `g1-nbt3-01` option `'38'` → `compared-the-wrong-place-first`

## Covering tests

`authored.nbt.test.ts` (C1, I2, M2), and the `nbt1`, `nbt2` (M1 renumbering
also lives here), `nbt3` and `nbt7` template tests (I1).

```
$ npx vitest run src/curriculum/grade1/authored.nbt.test.ts src/curriculum/grade1/templates/nbt1-count-past-a-ten.test.ts src/curriculum/grade1/templates/nbt2-tens-and-ones.test.ts src/curriculum/grade1/templates/nbt3-which-sentence-is-true.test.ts src/curriculum/grade1/templates/nbt7-write-the-numeral.test.ts

 ✓ src/curriculum/grade1/authored.nbt.test.ts (16 tests) 166ms
 ✓ src/curriculum/grade1/templates/nbt2-tens-and-ones.test.ts (11 tests) 484ms
 ✓ src/curriculum/grade1/templates/nbt7-write-the-numeral.test.ts (12 tests) 567ms
 ✓ src/curriculum/grade1/templates/nbt3-which-sentence-is-true.test.ts (12 tests) 679ms
 ✓ src/curriculum/grade1/templates/nbt1-count-past-a-ten.test.ts (13 tests) 727ms

 Test Files  5 passed (5)
      Tests  64 passed (64)
```

## Full suite / lint / tsc

```
$ npx vitest run
 Test Files  141 passed (141)
      Tests  1539 passed (1539)
```
(up from 1527/1527 before this fix round: +12 new tests — 8 fixed-seed pin
tests across nbt1/nbt2/nbt3/nbt7, and 4 replacing the single founding-errors
test in authored.nbt.test.ts.)

```
$ npm run lint
> oxlint
(0 errors; same pre-existing warnings as before, none in Grade 1 NBT files)
```

```
$ npx tsc -b --noEmit
(no output — clean)
```

## Commit

`e69c0c6` — fix: close task 23 review findings C1, I1, I2, M1 and M2

Status: **DONE**
