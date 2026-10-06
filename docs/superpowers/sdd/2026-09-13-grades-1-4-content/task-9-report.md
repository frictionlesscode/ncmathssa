# Task 9 report — Grade 4 Geometry and the authored aggregator

Commit: `304c5af feat: add grade 4 geometry content and the authored aggregate`
Branch: `feat/multi-grade-adaptive`

## What I implemented

**`src/curriculum/grade4/authored.g.ts`** — 12 authored items, no templates.

| Standard | Items | Difficulty | What they cover |
| --- | --- | --- | --- |
| NC.4.G.1 | `g4-g1-01` … `g4-g1-04` | mastery, mastery, advanced, advanced | naming a ray vs a line segment vs a line (01, 04); perpendicular identification (02); parallel AND perpendicular sides of a rectangle (03) |
| NC.4.G.2 | `g4-g2-01` … `g4-g2-05` | mastery, advanced, advanced, mastery, advanced | quadrilateral by angle measure (01); NC's inclusive trapezoid (02); rhombus by side length + absence of perpendicular sides (03); **triangle** by angle measure (04); **triangle** by side lengths and angles together (05) |
| NC.4.G.3 | `g4-g3-01` … `g4-g3-03` | mastery, advanced, advanced | counting a rectangle's fold lines (01); why a diagonal is a line of symmetry of a square but not of a long rectangle (02); horizontal vs vertical symmetry in block capitals (03) |

**`src/curriculum/grade4/authored.ts`** — the aggregator, exactly the brief's shape, concatenating OA, NBT, NF, MD and G.

**`src/curriculum/grade4/authored.test.ts`** — the aggregator's own sibling test (ruling 9.4), holding the two aggregate `describe` blocks the brief put in `authored.g.test.ts`, plus an item-count equality check (catches a bank concatenated twice or padded) and a domain-ownership check.

**`src/curriculum/grade4/authored.g.test.ts`** — kit soundness plus eight domain-specific guards (see Testing).

**`src/curriculum/misconceptions.ts`** — 18 new tags (ruling 9.3): 4 in `shape-classification`, 14 in `geometry-and-measurement`. Each inserted in its alphabetical position in the existing run, not appended as a block.

**`src/curriculum/grade4/templates/index.ts`** — replaced the stale closing sentence "Task 9 appends this grade's Geometry templates here" with a paragraph saying Geometry is authored-only by design and why (classification and vocabulary; a generator would only vary the letters naming the points).

## Where the brief disagreed with `standards.ts` — and what I did

Both disagreements were already ruled on, and in both cases `standards.ts` won.

1. **`NC.4.G.2` covers triangles (ruling 9.1).** Sourced description: *"Classify quadrilaterals **and triangles** based on angle measure, side lengths, and the presence or absence of parallel or perpendicular lines."* The brief names only quadrilaterals and offers only quadrilateral distractors. Two of the five G.2 items (`g4-g2-04`, `g4-g2-05`) are triangle classification, and `authored.g.test.ts` asserts that a triangle item exists, that a quadrilateral item exists, and that all three of the standard's criteria — angle measure, side lengths, parallel/perpendicular — appear somewhere in the G.2 items.
   NC's inclusive trapezoid definition is used throughout, and `g4-g2-02` is built on it (a parallelogram IS a trapezoid). The existing tag is spelled `exclusive-trapezoid-definition`, not `used-exclusive-trapezoid-definition` as the ruling quoted it; I used the spelling on disk.

2. **`NC.4.G.1` is a six-object standard (ruling 9.2).** Sourced: *"Draw and identify points, lines, line segments, rays, angles, and **perpendicular and parallel lines**"*, with two of its four `keyConcepts` being the parallel and perpendicular ones. The brief treats it as ray vocabulary. `g4-g1-02` and `g4-g1-03` cover parallel vs perpendicular; the test asserts G.1 has both an item distinguishing a ray from a line segment and an item on parallel versus perpendicular.

3. **The brief's misconception advice was wrong (ruling 9.3).** "The shape-classification family already exists for exactly this kind of error" is false for two of this domain's three standards: the registry had no tag for symmetry, for naming a ray, or for confusing parallel with perpendicular. I declared 18 new tags rather than borrowing. The four *classification* tags joined `shape-classification`; the line-vocabulary and symmetry tags joined `geometry-and-measurement`, and the bank docstring records why — they are not hierarchy errors, and a family is what a parent reads on a report, where "Geometry And Measurement" describes mistaking a diagonal for a fold line truthfully and "Shape Classification" would not. I did not add a new family: `geometry-and-measurement` already holds non-measurement geometry reasoning tags (`assumed-a-right-angle`, `assumed-a-straight-angle`), so it is a true superset rather than a mis-file.

No other disagreement found. In particular the G weighting is the combined MD+G band, and nothing in the new files claims a Geometry-only percentage.

## TDD evidence

**RED** — `npx vitest run src/curriculum/grade4/authored.g.test.ts src/curriculum/grade4/authored.test.ts`

```
FAIL src/curriculum/grade4/authored.test.ts
Error: Failed to resolve import "./authored" from "src/curriculum/grade4/authored.test.ts". Does the file exist?
FAIL src/curriculum/grade4/authored.g.test.ts
Error: Failed to resolve import "./authored.g" ...
 Test Files  2 failed (2)
      Tests  no tests
```

Expected: both test files were written before `authored.g.ts` and `authored.ts` existed, so the failure had to be an unresolved import of exactly those two modules — not an assertion failure, which at that point would have meant the test was passing against something it should not have found.

**GREEN** — `npx vitest run src/curriculum/grade4/authored.g.test.ts src/curriculum/grade4/authored.test.ts src/curriculum/misconceptions.test.ts`

```
 ✓ src/curriculum/grade4/authored.test.ts (3 tests) 7ms
 ✓ src/curriculum/misconceptions.test.ts (3 tests) 84ms
 ✓ src/curriculum/grade4/authored.g.test.ts (10 tests) 428ms
 Test Files  3 passed (3)
      Tests  16 passed (16)
```

`misconceptions.test.ts` passing in both directions is the real check on the 18 new tags: every one is used by content, and no content uses an undeclared one.

## Verification

- `npm run lint` — exit 0. Seven pre-existing warnings in `src/components` and `src/context`, none in any file this task touched.
- `npx tsc -b --noEmit` — clean.
- `npx vitest run` — **58 files, 610 tests, all passing.** Baseline at `ae39fdd` was 597; the 13 new tests are the 10 in `authored.g.test.ts` and the 3 in `authored.test.ts`.

### What the G test actually guards

Beyond `assertAuthoredBankSound`: every option is prose, so the kit's numeric second-right-answer guard is knowingly inert here — the test asserts that explicitly (a future numeric item goes red rather than inheriting a guard nobody re-read) and checks instead that no two options state one fact in two wordings. Then: 2-D scope only (no solid, no volume, no coordinate plane — those are Grade 5), no reference to a picture the app cannot render, the inclusive trapezoid definition never taught in a key or a worked solution, G.1's two halves, G.2's triangles + all three criteria, G.3 actually about symmetry, and no collision with the 22 Grade 4 templates across 2,000 seeds each.

## Self-review findings

Re-solved all 12 items cold. Three things caught and fixed while writing, recorded here because each was a real defect in a draft:

1. **A geometrically impossible item.** `g4-g2-05` was first drafted with sides 5, 5 and 8 cm and the statement "all three angles measure less than 90°". That triangle is obtuse (8² = 64 > 5² + 5² = 50), so the premise was false. Changed to 5, 5, 6 (36 < 50), which is genuinely acute.
2. **A second correct answer, avoided.** `g4-g3-01`'s rectangle has two real lines of symmetry. Offering both the vertical and the horizontal midline as separate options would have keyed two right answers; only one is offered, and the key names both lines in one sentence.
3. **A tag that did not fit.** `assumed-a-right-angle` reads "Used 90 degrees as the whole angle, reporting how far the given angle falls short…" — that is angle arithmetic, not classification, so reusing it for "assumed the corners are square" would have mis-described the error. Declared `assumed-square-corners-where-none-were-given` instead.

Also checked: every distractor is reachable by the exact error its `//` comment names; every `stepByStep` ends on the key, stated verbatim; correct answers sit 3 at A, 3 at B, 3 at C, 3 at D; every item's mathematics matches its standard's sourced description and `keyConcepts`; every prose option was re-read for a second true statement (the false clause in each is called out in its comment).

## Concerns

One, minor. In `g4-g2-04` the distractor "Scalene triangle" is wrong because the question asks for the classification **by angles** — the triangle's side lengths are not given, so scalene is not false so much as unanswerable. The prompt says "Based on its angles" explicitly and the worked solution says so again, and the tag (`classified-by-the-wrong-attribute`) names precisely that error, so I judged it sound; a reviewer who disagrees would want the option swapped for one that is flatly false.

Nothing else. No overbuilding: 12 items against a floor of 9, with the three extra items being exactly what rulings 9.1 and 9.2 require (the triangle items and the parallel/perpendicular items the brief omitted).
