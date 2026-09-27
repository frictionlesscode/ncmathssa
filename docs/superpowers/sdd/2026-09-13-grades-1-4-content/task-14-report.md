# Task 14 report — Grade 3 Measurement & Data, Geometry, and the authored aggregate

Branch `feat/multi-grade-adaptive`. Commits `5868eef` and `e42b4f8`.

## What I implemented

**Authored banks (26 items).**

- `src/curriculum/grade3/authored.md.ts` — 21 items: NC.3.MD.1 ×3, NC.3.MD.2 ×5,
  NC.3.MD.3 ×4, NC.3.MD.5 ×3, NC.3.MD.7 ×3, NC.3.MD.8 ×3. Floor is 18.
- `src/curriculum/grade3/authored.g.ts` — 5 items for NC.3.G.1 (the floor is 3;
  the brief asked for more, and G is a one-standard domain carrying half a
  23–27% band).
- `src/curriculum/grade3/authored.ts` — the aggregator, joining OA, NBT, NF, MD
  and G. Nothing is authored in it.

**Generators (6 new, taking `GRADE_3_TEMPLATES` from 12 to 18).**

| id | standard | question shape |
| --- | --- | --- |
| `g3.md1.elapsed-time-within-the-hour` | NC.3.MD.1 | two clock times in one hour, interval asked for |
| `g3.md2.customary-capacity-word-problem` | NC.3.MD.2 | capacity word problem, one customary unit throughout |
| `g3.md5.tile-and-count-unit-squares` | NC.3.MD.5 | a tiled figure, **no numbers in the question at all** |
| `g3.md7.area-by-multiplying-side-lengths` | NC.3.MD.7 | two side lengths as numerals, **no figure** |
| `g3.md8.perimeter-of-a-rectangle` | NC.3.MD.8 | all four sides labeled, perimeter asked for |
| `g3.md8.unknown-side-length` | NC.3.MD.8 | perimeter given, short side asked for |

Each has a sibling test with `assertTemplateSound`, a determinism check, **two
literal-string fixed-seed pins** (per the STANDING RULING — prompt, answerText,
the full `[label, text, isCorrect, misconception]` shape, and a pinned worked
step), a full-draw-space collision sweep asserting the excluded set in **both
directions**, and per-distractor recomputation at five scattered seeds.

**Tests.** `authored.md.test.ts`, `authored.g.test.ts`, `authored.test.ts`
(ruling 14-7: the aggregate assertions live in their own file, not inside
`authored.g.test.ts` as the brief wrote them). `templates/index.test.ts` gained
six sentinel entries; its key-set equality assertion means all 18 generators are
accounted for.

**Misconceptions.** 22 new tags in `src/curriculum/misconceptions.ts`: six in
`time-intervals` (the existing three were all written for NC.4.MD.8's
hour-crossing and describe an error a Grade 3 child is never asked to make),
eleven in `geometry-and-measurement`, five in `shape-classification`. Every one
is used; `misconceptions.test.ts` checks both directions.

## Where the brief disagreed with `standards.ts` beyond the rulings

One, and it is the same defect class as ruling 13-3.

**`NC.3.MD.3` has three keyConcepts and the brief covers one.** The brief
describes MD.3 only as "scaled graphs" and names one error ("reading a scaled
bar graph as if each unit were one"). The sourced text's FIRST bullet is
"Collect data by asking a question that yields data in **up to four
categories**" — a survey-design skill, not a graph-reading one. Three
graph-reading items would have cleared the floor with a third of the standard
unwritten. I added `g3-md3-04`, a survey-question item, and a test asserting
MD.3 covers it; it reuses Grade 4's shipped `asked-for-a-single-total-not-data`
and `confused-categorical-with-numerical` tags plus one new one,
`left-the-categories-open`.

Two smaller places where I followed the source past the brief:

- The brief's Step 4 asks for one perimeter template; ruling 14-6 splits it, and
  `standards.ts`'s second keyConcept ("find an unknown side length given the
  perimeter") is what makes the split right rather than merely tidy.
- `NC.3.MD.2`'s third bullet says "add, subtract, multiply, **or divide**". The
  generator subtracts, so the authored bank carries one multiplication item
  (`g3-md2-03`, pounds) and one division item (`g3-md2-04`, quarts), rather than
  three of one operation.

## How I verified rulings 14-1, 14-4 and 14-5 by construction

### 14-1 — NC.3.MD.2 is CUSTOMARY

The brief's "mass or volume word problems" is CCSS 3.MD.A.2's vocabulary. NC's
text is cups, pints, quarts, gallons, ounces, pounds, and lengths to the
quarter-/half-inch plus feet and yards. Nothing in this task prints a metric
unit.

- **By construction:** every MD generator draws its unit from a literal list of
  customary units (`gallons/quarts/pints` for capacity, `inches/feet/yards` for
  length). There is no code path that can produce another unit.
- **By guard:** `authored.md.test.ts` runs
  `/\b(gram|kilogram|kg|liter|litre|centimeter|metre|meter|milliliter|…)\b/i`
  over the prompt, figure, every option, every worked step, the concept summary
  and the common-misconception line of all 21 authored MD items, **and** over
  400 seeds of every MD generator. Each generator's own sibling test repeats the
  sweep at 600 seeds.
- **The guard is itself tested.** `\bmeter\b` does not match "perimeter" or
  "diameter" (there is a word character before the `m`), and the test asserts
  that in both directions with four worked examples, so the guard cannot be
  quietly weakened into one that matches nothing.
- **Same-unit, per the third bullet:** a separate test normalizes the customary
  unit words in each MD.2 item's question and asserts at most one distinct unit.
  `g3-md2-02` is the named exception — its whole question is *which* unit fits —
  and the test names it explicitly rather than skipping items by accident. The
  MD.2 generator's test asserts every option carries the same unit the prompt
  drew.
- **Ruling 14-2's length strand:** tests assert MD.2 has an item reading a length
  to the quarter-inch (`g3-md2-01`, ruler described in `promptDetails`), an item
  in feet, an item in yards, a capacity item and a weight item.

### 14-4 — MD.1 intervals stay inside one hour

- **By construction, not by resampling.** The generator draws **one** hour `h`
  and substitutes it into *both* printed times, so the two times name the same
  hour by substitution and not by arithmetic. The end minute is bounded at 59
  **on the draw** (`TIME_PAIRS` is a static list built once at module load), so
  no seed can produce a time no clock shows, and the answer `e - s` can never
  reach 60. The algebra — the draw conditions, the four option formulas and the
  six pairwise non-collision proofs — is written out in the file comment.
- **By guard:** the sibling test parses both clock times back out of the prompt
  at 800 seeds and asserts same hour, end after start, end minute under 60,
  answer equal to `e - s`, and that no worked solution ever mentions "60
  minutes" or "the next hour" (the arithmetic that defines NC.4.MD.8).
  `authored.md.test.ts` repeats the parse at 600 generator seeds and over the
  authored items' questions and worked solutions.
  - The authored guard deliberately reads the **question and the worked
    solution**, not the distractors: `g3-md1-01`'s swapped-hands distractor
    (2:43 misread as 8:10) names another hour, and that wrong hour *is* the
    error rather than an interval crossing into it. The comment says so.
- **The standard's first half** — "tell and write time to the nearest minute" —
  is `g3-md1-01`, a clock face described in `promptDetails`, with a test
  asserting some MD.1 item mentions both hands. The generator's end minute is
  never a multiple of 5, which is what makes "read it only to the nearest five"
  a reachable wrong answer and not a decoration.

### 14-5 — MD.5 and MD.7 are different skills

The separation is in the **data each generator gives the child**, not in the
wording:

- `g3.md5.tile-and-count-unit-squares` puts **no digit anywhere** in its prompt
  or its figure. The tiles are the only data. There is no pair of side lengths
  to multiply, so counting is the only route. The prompt is a fixed sentence.
- `g3.md7.area-by-multiplying-side-lengths` prints both side lengths as numerals
  in a sentence and emits **no `promptDetails` at all**.

Neither can emit the other's question because neither contains the other's data.
This is asserted three times over: MD.5's test sweeps 600 seeds for any digit in
the question and cross-checks 600 MD.7 questions against the MD.5 question set;
MD.7's test asserts every prompt names both side lengths and that
`promptDetails` is always `undefined`; and `index.test.ts`'s sentinel map
requires each generator's prompt to match its own frame and fail all seventeen
others, with a key-set equality assertion so a generator added without a
sentinel fails immediately.

On the authored side, a test asserts no MD.5 item prints a `×` in its question,
and MD.5's three items are a tiling-validity judgement, a comparison of two tile
counts, and a count of an L-shaped figure that **no single multiplication
reaches** — so none of them is MD.7's skill, and none is the generator's
question in other words (the generator always draws a complete rectangle).
`assertNoGeneratorDuplicatesAuthored` runs over the MD bank against all 18
generators at 2,000 seeds each.

NC.3.MD.7's third keyConcept — the two-rectangle decomposition, which the brief
never mentions — is `g3-md7-02`, with a test asserting MD.7 covers it.

## Ruling 14-3 — Geometry

No item partitions a shape or names a fractional part of one. A test fails the
bank if any G item matches
`/\b(one[- ]fourth|a fourth of|quarters?|one[- ]third|a third of|one[- ]half of|partition)\b/i`
or writes any `a/b` at all. The errors used instead are the ones NC.3.G.1
produces: a square denied the name "rectangle" (`hierarchy-too-narrow`), a
tilted rectangle or rhombus denied its name (`judged-the-shape-by-its-orientation`),
a shape judged by how it looks (`classified-the-shape-by-how-it-looks`), a
joined or cut shape expected to keep the old name, and the exclusive trapezoid
definition.

**Second-true-answer review.** Shape hierarchies overlap, and the shared kit
cannot see it (prose options have no value to compare). I re-solved every option
of all five items against NC's inclusive trapezoid definition:

- `g3-g1-01` — the three wrong options are all genuine rectangles (a square, a
  tilted one, a 10:1 one); only the no-right-angles quadrilateral is not.
- `g3-g1-02` — two squares joined on a full side give a 1×2 rectangle: not a
  square, not 8-sided, not a rhombus.
- `g3-g1-03` — a cut between the midpoints of two opposite sides gives two
  congruent rectangles, neither of them square; not triangles, not squares, and
  not one-of-each (that would ignore "from the middle").
- `g3-g1-04` — "every rectangle is a square" is false, "a tilted rhombus is not
  a parallelogram" is false, "four sides means rectangle" is false. Only "every
  square is also a rectangle" holds.
- `g3-g1-05` — a square **is** a rhombus and, inclusively, **is** a trapezoid,
  so options 2 and 3 are false; "every rhombus is a square" is false.

A test pins all five ids in that review, so adding a sixth item means restating
why its wrong options are false rather than letting it in unexamined.

## TDD evidence

**RED.** After writing `authored.md.test.ts`, `authored.g.test.ts` and
`authored.test.ts` and before writing any implementation:

```
FAIL src/curriculum/grade3/authored.md.test.ts — Failed to resolve import "./authored.md"
FAIL src/curriculum/grade3/authored.g.test.ts  — Failed to resolve import "./authored.g"
FAIL src/curriculum/grade3/authored.test.ts    — Failed to resolve import "./authored"
Test Files  3 failed | 16 passed (19)
```

**Intermediate RED, twice, both real findings rather than test noise:**

1. `g3-md1-01 prints clock times in hours 2, 8 — crossing the hour is NC.4.MD.8`.
   The hour guard, as first written, read the distractors too. The swapped-hands
   distractor legitimately names another hour. I narrowed the authored guard to
   the question and the worked solution and documented why, and added a
   *separate* generator guard where a second hour has no excuse at all.
2. `expected [ '3x6', '4x2', '4x8', '6x3', …(2) ] to deeply equal [ '3x6', '4x2', '6x3' ]`.
   **My algebra in `md7-area-by-multiplying-side-lengths.ts` was wrong**: I
   solved `2(L+W) = (L-1)W` as `L = 3W/(W-3)` when it is `L = 3W/(W-2)`, missing
   three collisions — (9,3), (6,4), (4,8). The generator itself was already
   correct, because it filters the draw space by actual option-value
   distinctness rather than by the hand-derived list; the test caught the
   *comment*. Both are now right, and the test asserts the excluded set in both
   directions so a pair silently dropped later also fails.

**GREEN.**

```
npx vitest run                     85 files, 940 tests passing   (baseline 829 at e45e740)
npx tsc -b --noEmit                clean
npm run lint                       exit 0, 7 pre-existing warnings
```

`npm run lint`'s **actual exit code is 0**, with exactly the seven pre-existing
warnings (`AdaptiveSessionCard.test.tsx`, `WeakSpotsView.tsx`,
`ProgressContext.tsx` ×4, `QuizResults.tsx`) in files I did not touch. Note that
running it through the rtk wrapper prints "ESLint output (JSON parse failed)"
and a nonzero wrapper status; `rtk proxy npm run lint` shows the real exit 0.

## Files changed

Created:

- `src/curriculum/grade3/authored.md.ts`, `authored.md.test.ts`
- `src/curriculum/grade3/authored.g.ts`, `authored.g.test.ts`
- `src/curriculum/grade3/authored.ts`, `authored.test.ts`
- `src/curriculum/grade3/templates/md1-elapsed-time-within-the-hour.ts` + test
- `src/curriculum/grade3/templates/md2-customary-capacity-word-problem.ts` + test
- `src/curriculum/grade3/templates/md5-tile-and-count-unit-squares.ts` + test
- `src/curriculum/grade3/templates/md7-area-by-multiplying-side-lengths.ts` + test
- `src/curriculum/grade3/templates/md8-perimeter-of-a-rectangle.ts` + test
- `src/curriculum/grade3/templates/md8-unknown-side-length.ts` + test

Modified:

- `src/curriculum/grade3/templates/index.ts` — six imports, the array, the
  re-exports, and a docstring block covering the MD generators and why Geometry
  and NC.3.MD.3 have none
- `src/curriculum/grade3/templates/index.test.ts` — six sentinel regexes
- `src/curriculum/misconceptions.ts` — 22 new entries

Nothing outside Grade 3 and the shared misconception registry was touched.
`registry.ts`, `contentComplete` and the study guides are Tasks 15 and 16.

## Self-review findings

- **Every item re-solved cold.** All 26 authored items were re-computed from
  their prompts, and every distractor was checked to be the exact value its tag
  names (arithmetic shown in a `//` comment above each). No item has a second
  defensible answer.
- **Answer positions.** My first draft had the key at option A in all 21 MD and
  all 5 G items — the shared kit's ≥3-distinct-labels rule would have caught the
  MD bank but not the G one (it only applies at 8+ items). Fixed: MD is A×4,
  B×6, C×6, D×5; G is A, B, C×2, D.
- **Singular units.** `1 gallons` and `1 feet` were both reachable. Both
  generators now singularize, and seed 7 of the MD.2 generator (`90 - 89 = 1
  gallon`) is a literal pin, so it stays fixed.
- **Spelling.** The MD generator printed "labeled" while the authored figures
  said "labelled", and one figure title said "Favourite". Normalized to US in
  `e42b4f8`.

## Concerns

1. **`g3-md2-03` is a multiplication word problem, and so is
   `g3.oa3.one-step-word-problem`.** The frames are different ("Each bag of
   apples weighs 3 pounds. Mr. Chen buys 7 bags." vs OA.3's "… has N …. Each …
   holds M …"), the contexts are different, and the prompt-level duplicate guard
   passes — but they exercise the same arithmetic. NC.3.MD.2's third bullet
   explicitly asks for multiplying measurements, so I judged this in-standard
   and worth having; a reviewer may reasonably want the MD.2 multiplication item
   pushed further from OA.3's shape.
2. **The MD.2 generator's numbers can read oddly at the edges** — seed 7 gives
   "A water tank holds 90 gallons … pours out 89 gallons", leaving 1. It is
   correct and in range, but it is not the most natural sentence in the draw
   space. Constraining `A - B` away from very small values would shrink the
   space and need the algebra redone, so I left it.
3. **22 new misconception tags is a lot for one task.** Three of them
   (`left-gaps-between-the-tiles`, `overlapped-the-tiles`,
   `used-tiles-of-different-sizes`) are spent on the single item `g3-md5-01`.
   I judged that right because NC.3.MD.5's own first keyConcept is "tiling
   without gaps or overlaps" and a lumped "bad tiling" tag would tell a parent
   less than nothing — but it is the place a reviewer is most likely to disagree.
4. **The G bank's second-true-answer test is a review pin, not a proof.** It
   asserts one correct option per item and requires each id to be listed with
   the reason its alternatives are false; it cannot itself decide whether a new
   prose option is true. Nothing can, short of a shape-hierarchy model, and I did
   not think building one was in scope.

---

# Fix report — review round 1

Commit `<see below>`. All four items addressed; nothing else touched.

## Important 1 — test name promised a guarantee the repo does not provide

`authored.g.test.ts`: `offers exactly one true statement per item` renamed to
**`pins every item in the second-true-answer review`**. The body is unchanged
and the test is kept, as directed. Its docstring now states plainly what it does
and does not do: it does not decide whether an option is true — nothing here can
— it forces every item through the human review, and the one-correct-option line
is acknowledged as a repeat of `assertAuthoredBankSound`, kept only so the test
fails loudly rather than vacuously if the bank is restructured.

## Important 2 — a `unit-conversion` family label on a Grade 3 ruler error

`g3-md2-01`'s "7 inches" distractor no longer borrows `added-without-converting`
(family `unit-conversion`, which is NC.4.MD.1 — exactly what ruling 14-1 puts a
grade away). New tag, in `geometry-and-measurement`:

```
counted-each-ruler-mark-as-a-whole-unit
  "Counted each small mark on the ruler as a whole unit and added it to the
   whole inches, so three quarter-inch marks past the 4 were read as three
   more inches."
```

The declaration carries a comment saying why `added-without-converting` was not
reused and citing Task 12's `order-of-operations` precedent; the option carries
a short version of the same. **`added-without-converting` is not orphaned** —
`grade4/authored.md.ts:384` still uses it, and `misconceptions.test.ts` is green
in both directions.

## Minor ruled in — the clock figure stated something false

`g3-md1-01`'s figure said "there are five small marks between one number and the
next". Between consecutive numerals there are **four** marks, splitting the gap
into five one-minute intervals. Now:

> "Each small mark on this clock is one minute, and four small marks sit between
> one number and the next, splitting that gap into five minutes."

The answer was already determinate; a child counting the marks will now find the
figure consistent. I re-checked the other ruler figure while I was there:
`g3-md2-01` says "three small marks, which split every inch into 4 equal parts",
which is correct.

## Minor ruled in — metric guard gaps

The pattern now also catches `millilitre(s)`, `millimeter(s)/millimetre(s)`,
`centimetre(s)`, `kilometer(s)/kilometre(s)`, `cm`, `mm` and `km`, alongside the
existing gram/kilogram/kg/liter/litre/milliliter/mL/centimeter/meter/metre.

I deliberately did **not** add bare `g` or bare `m`: `\bg\b` and `\bm\b` would
fire on stray single letters, and a guard with false positives gets weakened by
the next person who hits one. `kg` and `mL` cover the abbreviations children's
material actually uses.

Rather than widen five copies, the patterns moved to a new non-test module
`src/curriculum/grade3/metricGuard.ts` exporting `METRIC_UNIT` and
`CUSTOMARY_UNIT`, imported by `authored.md.test.ts` and the four MD template
tests. Same reasoning `authoredBank.testkit.ts` gives for `numericValue`: five
copies drift, and a copy that quietly stops matching anything is the failure the
guard exists to prevent. The file is at `grade3/metricGuard.ts`, which matches
neither of `allContent.ts`'s globs (`./grade*/authored*.ts`,
`./grade*/templates/*.ts`), so it is not discovered as content.

The both-directions test is widened to match: **21 strings it must catch**
(every metric unit, spelled both American and British, plus the abbreviations)
and **7 it must not** (perimeter, diameter, and one real string from each of the
bank's customary units). A future edit that narrows the pattern into one
matching nothing now goes red.

## Verification

```
npx tsc -b --noEmit                                    clean
npx vitest run src/curriculum/grade3 \
               src/curriculum/misconceptions.test.ts   26 files, 306 tests passing
npx vitest run                                         85 files, 940 tests passing
npm run lint                                           exit 0, the same 7 pre-existing warnings
```

`npm run lint`'s **actual exit code is 0**. (For the record on the wrapper: the
`rtk` hook parses the linter's output as JSON and reports its own failure when
that parse fails, which is what produced the earlier nonzero reading.
`rtk proxy npm run lint` bypasses it and returns the real status.)

## Files changed in this round

- `src/curriculum/grade3/metricGuard.ts` — new
- `src/curriculum/grade3/authored.md.ts` — clock figure, MD.2 distractor tag
- `src/curriculum/grade3/authored.md.test.ts` — shared guard, widened both-directions test
- `src/curriculum/grade3/authored.g.test.ts` — test renamed, docstring rewritten
- `src/curriculum/grade3/templates/md2|md7|md8-perimeter|md8-unknown` tests — shared guard
- `src/curriculum/misconceptions.ts` — one new tag
