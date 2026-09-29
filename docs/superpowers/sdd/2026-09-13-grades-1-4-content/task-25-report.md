# Task 25 Report: Grade 1 Study Guides

## What was built

- `src/curriculum/grade1/studyGuides.ts` — `GRADE_1_STUDY_GUIDES: Record<string, StudyGuideSection>`, one entry per each of the 23 Grade 1 standards (OA 8, NBT 7, MD 5, G 3).
- `src/curriculum/grade1/studyGuides.test.ts` — 5 tests, modeled on Grade 2's current (post-review-fix) `studyGuides.test.ts` shape rather than the brief's original Task 20 Step 1 excerpt, since the current file reflects the lessons the Task 20 review already forced.

Every guide's `coreConcept` and `commonTraps` are written to be read aloud or paraphrased by the parent sitting beside a six-year-old. Every `workedExample.problem` is pitched at the child's own reading level.

## How 25-1 / 25-2 / 25-3 were met

- **25-1 (no blueprint below Grade 3, Task 10 Step 3's second paragraph does not apply):** No guide cites a percentage or a blueprint anywhere. The test scans the *entire* guide via `JSON.stringify(g)` with `/%|per\s?cent/i` and `/blueprint/i`, not just `whyItMattersForSSA`, per the ruling's own warning that a field-scoped test would miss "roughly a quarter of the exam." I manually grepped the source file too (see Self-Review) to confirm no percentage-like phrasing slipped into prose fields.
- **25-2 (cite the domain's share as counts):** Every `whyItMattersForSSA` contains the literal substring `"<domain count> of the 23"` — OA guides say "8 of the 23 Grade 1 standards", NBT "7 of the 23", MD "5 of the 23", G "3 of the 23". A dedicated test (`states its own domain's share...`) derives the expected count per standard from `GRADE_1_DOMAINS` itself (not a hardcoded number), so it can't drift silently if a domain's standard count changes.
- **25-3 (reword "no state assessment" message for grade 1):** The percentage test's assertion messages and describe block say "grade 1" throughout, not "grade 2".

## Test results

### TDD evidence

RED (before `studyGuides.ts` existed):
```
$ npx vitest run src/curriculum/grade1/studyGuides.test.ts
FAIL src/curriculum/grade1/studyGuides.test.ts
Error: Failed to resolve import "./studyGuides" from "src/curriculum/grade1/studyGuides.test.ts". Does the file exist?
Test Files  1 failed (1)
     Tests  no tests
```

GREEN (after `studyGuides.ts` was written):
```
$ npx vitest run src/curriculum/grade1/studyGuides.test.ts
 ✓ src/curriculum/grade1/studyGuides.test.ts (5 tests) 9ms
Test Files  1 passed (1)
     Tests  5 passed (5)
```

### Full suite / lint / typecheck (run twice — once before, once after the readability fix described below)

```
$ npx vitest run
Test Files  146 passed (146)
     Tests  1597 passed (1597)
```
(Baseline was 1592/1592; +5 new tests, all passing, nothing else regressed.)

```
$ npm run lint
> oxlint
(7 pre-existing warnings in unrelated files: ProgressContext.tsx, WeakSpotsView.tsx,
 AdaptiveSessionCard.test.tsx, QuizResults.tsx — none touch grade1/studyGuides.*, 0 errors)
```

```
$ npx tsc -b --noEmit
(no output — clean)
```

## Files changed

- `src/curriculum/grade1/studyGuides.ts` (new, 921 lines combined with test)
- `src/curriculum/grade1/studyGuides.test.ts` (new)

## Self-review findings (and fixes made before commit)

I re-solved every worked example by hand and checked every stated rule at its edges (crossing a ten, crossing a hundred, equal numbers, zero, 120+) before writing it down, per the lessons from Task 20's review. Specific things I checked and, in two cases, changed:

1. **False-at-the-edges rules avoided by design.** `NC.1.NBT.5`'s "10 more or 10 less" rule explicitly states the exception rather than a silent "usually": the guide says outright that when the tens digit is already 9, 10 more trades into a new hundred (94 + 10 = 104, pinned in the worked example), and that 10 less can bring the tens digit down to leave only ones (13 − 10 = 3). `NC.1.NBT.1`'s counting guide explicitly calls out crossing 99→100 and 129→130, with 128/129/130 pinned ≥120 as the worked example, rather than stating a rule that only holds within one decade.
2. **Sequencing claims removed.** On first draft, two `whyItMattersForSSA` lines for `NC.1.OA.7`/`NC.1.OA.8` said "the next standard in this domain" and "the standard right before this one" — ordering claims not directly supported by anything in `standards.ts` beyond incidental array order (the exact class of defect the rulings warn against). I reworded both to "in this same domain" / "this same domain's equal-sign standard", dropping the positional claim while keeping the (verified, same-grade) cross-reference. All other "elsewhere in this domain" references describe standards that genuinely exist in the same grade/domain without claiming an order or timing.
3. **Readability guard applied to all 23 `workedExample.problem` fields.** The task note said to check with `assertGradeOneReadable` "if it fits the guide shape." I wrote an ad hoc script (not committed) applying the guard's exact rules (under 90 chars, ≤2 sentences, no word over 10 letters) to every `workedExample.problem`. Two initially failed — `NC.1.MD.1` (97 chars, 3 sentences) and `NC.1.G.3` (101 chars) — both because their natural shape needs to hold two given facts before the question, the same reason ruling 24-2/24-3 made `NC.1.MD.1` fully authored with a separate `promptDetails` field in the question bank (a field `StudyGuideSection.workedExample` doesn't have). I rewrote both to fit within the guard rather than skip it: `NC.1.MD.1`'s problem is now "The pencil is longer than the crayon, which is longer than the eraser. Which is longest?" (88 chars, 2 sentences), and `NC.1.G.3`'s is "Same-size cakes: Cake A is cut into 2 pieces, Cake B into 4. Which has bigger pieces?" (86 chars). Re-ran the script after the edit: all 23 pass.
4. **Scope discipline against the three code swaps.** I wrote every guide directly from `src/curriculum/grade1/standards.ts`'s `description` and `keyConcepts`, cross-checking against the ruling's three named swaps: `NC.1.OA.6` is "add/subtract within 20 using strategies" (all six named strategies appear as `rulesAndFormulas`, not the fluency content); `NC.1.OA.9` is fluency within 10 (not within 20); `NC.1.NBT.1` is counting to 150 (not numeral writing); `NC.1.NBT.7` is numerals to 0–100 (I deliberately did NOT inherit NBT.1's 150 ceiling anywhere in that guide); `NC.1.MD.3` is time; `NC.1.MD.5` is coins-to-pennies, with an explicit out-of-scope note (no `$`/`¢`, no adding coin values, no money word problems — that's `NC.2.MD.8`).
5. **NBT.4's addend-shape restriction stated explicitly** (ruling 23-2): the guide's `coreConcept` says outright that this standard adds a two-digit number to only a one-digit number or a multiple of 10 — never two arbitrary two-digit numbers — naming that later skill as out of scope without dating it to a specific future standard.
6. **G.3 excludes thirds** (ruling 24-8): the word "third"/"thirds" does not appear anywhere in the `NC.1.G.3` guide; only halves and fourths are taught, and the counter-intuitive "more shares = smaller shares" bullet is included with a correct worked example (2 pieces vs. 4 pieces of the same-size cake).
7. **Math re-verified for every worked example:** 14−9=5; 5+3+5=13; 7+6+3 via 7+3=10,10+6=16; 8+☐=13→5; 7−7=0; 15+3=18; 5+4=9 (true); 9−3=6; 128,129→130; "thirteen"→13; 13=1 ten+3 ones; 52 has 5 tens > 38's 3 tens; 19+1=20 (trade); 94+10=104 (trade to new hundred); 60−20=40; pencil>crayon>eraser→pencil longest; 8 blocks end-to-end=8; hour hand between 7&8 + minute at 6=7:30; dime=10 pennies; 4+3=7 days; 4-sided shape needs square corners too (rhombus counterexample) → No; two half-circles joined on straight edges → circle; Cake A (2 pieces) has bigger pieces than Cake B (4 pieces) of the same whole. All correct.
8. **No content borrowed from another grade.** Each guide's `rulesAndFormulas`/`stepByStepMethod`/`commonTraps` are traceable to that standard's own `keyConcepts` bullets in `standards.ts`; nothing from Grade 2 or Common Core's differently-scoped versions of the same-numbered standards was imported.

## Concerns

- None outstanding. All tests pass (1597/1597), lint is 0 errors (pre-existing warnings only, unrelated files), tsc is clean, and the diff has been read back sentence-by-sentence against the rulings and the Task 20 review lessons.
