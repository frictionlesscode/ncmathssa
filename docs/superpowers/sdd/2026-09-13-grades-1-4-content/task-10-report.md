# Task 10 report — Grade 4 study guides

## What I implemented

`src/curriculum/grade4/studyGuides.ts` — `GRADE_4_STUDY_GUIDES: Record<string, StudyGuideSection>`,
one entry for each of the 25 Grade 4 standards (NF 6, NBT 6, MD 6, G 3, OA 4), every
field of `StudyGuideSection` filled: `title`, `coreConcept`, `rulesAndFormulas`,
`stepByStepMethod`, `commonTraps`, and a `workedExample` with `problem`, `steps`,
`answer` and `whyItMattersForSSA`.

`src/curriculum/grade4/studyGuides.test.ts` — five tests, retargeted per the rulings.

Every guide's mathematics was derived from `grade4/standards.ts` (`description` +
`keyConcepts`), not from the brief's prose. `commonTraps` were written against the
authored banks: I extracted every `explanation.commonMisconception` string and every
`misconception` tag per standard from `authored.{oa,nbt,nf,md,g}.ts` and wrote the traps
to echo that wording, so a child who missed an item meets the same sentence again here.

## Where the brief disagreed with `standards.ts` or the blueprint

**1. The brief's blanket ban on percentages in MD and G guides (brief step 3 / its third
test).** Overridden by Ruling 10.1, which I followed: the MD+G pair's `23–27%` band IS
published, so each MD and G guide cites it and names both domains in the same sentence.
The brief's own test regex would have rejected these compliant sentences.

**2. The brief's "title matching the standard's title" (step 3).** Dropped per Ruling
10.3. Several guide headings are deliberately reworded for a child ("Times As Many:
Multiplicative Comparison" for `Multiplicative Comparison Word Problems`; "Elapsed Time
That Crosses the Hour" for `Time Intervals That Cross the Hour`). The test asserts
non-empty and distinct, never equality.

**3. The brief tests no percentage outside MD/G.** Fixed per Ruling 10.2 — see below.

**4. No disagreement found between the brief and `standards.ts` on the mathematics
itself.** I checked the two places the plan flagged as historically wrong and both are
correct on disk and are what I wrote to: `NC.4.MD.3` is area & perimeter and `NC.4.MD.8`
is time intervals (I did NOT put area on MD.8); `NC.4.NBT.7` is comparison with
`>`, `=`, `<` and contains no rounding, so no guide mentions rounding as a standard —
rounding appears only as an estimation *check* inside NBT.4/NBT.5/OA.3, which is what
those standards' own `keyConcepts` ("use estimation strategies to assess reasonableness")
call for. `NC.4.G.2` covers triangles as well as quadrilaterals (Ruling 9.1), and the
G.2 guide and worked example classify both. `NC.4.G.1` covers parallel and perpendicular
lines, and the G.1 guide and worked example cover both alongside the ray/segment/line
distinction. NC's INCLUSIVE trapezoid definition is used and named explicitly.

**No figure was invented.** Every percentage below came from the blueprint. Nothing I
wanted was missing from it.

## Every percentage written, and its blueprint line

All from `docs/sources/nc-eog-blueprint.json`, `bands["4"]`:

| Blueprint entry | Written as | Guides |
| --- | --- | --- |
| `{ domains: ["NF"], range: "30–34%" }` | `30–34%` | NF.1, NF.2, NF.3, NF.4, NF.6, NF.7 (6) |
| `{ domains: ["NBT"], range: "25–29%" }` | `25–29%` | NBT.1, NBT.2, NBT.7, NBT.4, NBT.5, NBT.6 (6) |
| `{ domains: ["MD","G"], range: "23–27%" }` | `23–27%`, always in a sentence naming both Measurement and Geometry as one reporting category | MD.1, MD.2, MD.8, MD.3, MD.4, MD.6, G.1, G.2, G.3 (9) |
| `{ domains: ["OA"], range: "14–18%" }` | `14–18%` | OA.1, OA.3, OA.4, OA.5 (4) |

No other percentage appears in any `whyItMattersForSSA`. No single-domain claim is made
for MD or for G. The `80%` SSA bar and `100%` mastery framing are not used in any
`whyItMattersForSSA` (the test strips them regardless, per Ruling 10.4).

## What I tested

`src/curriculum/grade4/studyGuides.test.ts`, five tests:

1. **one guide per standard, keyed by its own code** — brief's test, unchanged.
2. **fills every section of every guide** — brief's test, unchanged.
3. **gives every guide its own distinct heading** (Ruling 10.3) — non-empty is covered by
   test 2; this adds uniqueness across all 25. No equality assertion.
4. **quotes only its own domain band, and quotes it** (Ruling 10.2) — for every guide,
   strips the `80%`/`100%` SSA framing (Ruling 10.4), extracts every remaining percentage
   expression, and asserts each number in it appears in that standard's own domain
   `officialWeightRange`. Also asserts each guide cites at least one figure, which is what
   makes the check meaningful and is required by the Content Contract
   ("`whyItMattersForSSA` must cite a real figure"). The failure message names the exact
   string it matched and the band it was checked against.
5. **names both domains whenever it cites the shared MD+G band** (Ruling 10.1) — for
   standards in a `weightGroup` domain, any percentage requires the sentence to mention
   both Measurement and Geometry. `"Geometry is 23–27%"` alone still fails.

### TDD evidence

**RED (module missing)** — `npx vitest run src/curriculum/grade4/studyGuides.test.ts`:

```
Failed to resolve import "./studyGuides" from "src/curriculum/grade4/studyGuides.test.ts"
 Test Files  1 failed (1)
      Tests  no tests
```

Expected: `studyGuides.ts` did not exist yet.

**GREEN** — same command after writing the guides:

```
 ✓ src/curriculum/grade4/studyGuides.test.ts (5 tests) 7ms
 Test Files  1 passed (1)
      Tests  5 passed (5)
```

**RED-on-purpose, mutation 1 (Ruling 10.2 guard).** Temporarily changed NF.1's
`whyItMattersForSSA` from `30–34%` to `40%` — the exact "Fractions are about 40% of the
Grade 4 test" defect the ruling names:

```
 × grade 4 study guides > quotes only its own domain band, and quotes it
   → NC.4.NF.1 cites "40%", which is not the NF band 30–34%
 Tests  1 failed | 4 passed (5)
```

Reverted.

**RED-on-purpose, mutation 2 (Ruling 10.1 guard).** Temporarily reworded MD.1's sentence
to `"Measurement and Data is worth 23–27% of the Grade 4 EOG"` — a real band attached to
one domain of the pair:

```
 × grade 4 study guides > names both domains whenever it cites the shared MD+G band
   → NC.4.MD.1 cites "23–27%" without naming both Measurement and Geometry,
     which claims a weight for one domain inside a combined band
 Tests  1 failed | 4 passed (5)
```

Reverted.

### Verification gate

- `npx vitest run` — **615 passed, 59 files, 0 failed**. Baseline at `304c5af` was 610;
  +5 is exactly this task's new tests. No pre-existing test changed.
- `npx tsc -b --noEmit` — `TypeScript: No errors found`.
- `npm run lint` — **exit 0**. The seven warnings printed are pre-existing, all in files
  I did not touch (`ProgressContext.tsx`, `WeakSpotsView.tsx`, `QuizResults.tsx`,
  `AdaptiveSessionCard.test.tsx`); they are identical at `304c5af`. Note: run through the
  Bash tool this command reports exit 1 for both my tree and the stashed baseline, while
  `oxlint` itself and `npm run lint` in PowerShell both exit 0 — a shell artifact, not a
  lint finding.
- Output is pristine: no warnings, no stray console output from the new test file.

## Files changed

- `src/curriculum/grade4/studyGuides.ts` (new, 1,082 lines — 25 guides at ~43 lines each;
  Grade 5's precedent is 17 guides in 547 lines, ~32 each, and the extra depth is in
  `rulesAndFormulas` and `commonTraps`, which are longer here because the Grade 4 banks
  supplied more distinct misconceptions per standard)
- `src/curriculum/grade4/studyGuides.test.ts` (new, 99 lines)

Nothing else touched. `GRADE_4_STUDY_GUIDES` is not yet wired into a curriculum — that is
Task 11's job, per the brief's Interfaces section.

## Self-review findings (all fixed before reporting)

Reading my own diff back caught five things:

1. **`NC.4.NF.2` taught a false transfer.** Its `whyItMattersForSSA` claimed comparing
   fractions uses "the same left-to-right place value habit" that comparing decimals uses.
   It does not — that habit belongs to NBT.7 and NF.7. Rewrote it to name the move that
   actually transfers: rewriting both fractions over a shared denominator, which is what
   Grade 5 needs before it can add unlike denominators.
2. **`NC.4.OA.4` made 1 a prime number.** "A number with exactly one factor pair, 1 and
   itself, is prime" is true of primes and also true of 1, which has the single pair
   1 × 1. Bounded both the `coreConcept` and method step 5 to numbers greater than 1 and
   said outright that 1 is neither. This is the kind of defect the brief warns about —
   a guide teaching a wrong rule to a child.
3. **`NC.4.NBT.2`'s zero-place rule was circular** ("has no thousands digit of its own
   beyond the 60"). Rewrote it to say plainly that the words say nothing about thousands,
   so a 0 must hold that place.
4. **A bulk `sed` produced `Maya'''s`** in the MD.4 problem text. Rewrote the sentence to
   avoid possessives entirely.
5. **British spellings** (`neighbour`, `labelled`, `favourite`, `memorised`, `centre`,
   `theatre`, `o clock`) inconsistent with the repo, whose standards text uses
   `meter`/`centimeter`. Normalised to American.

Arithmetic re-checked by hand, every worked example, answer matching its own steps:
2/3 = 8/12 · 15/24 < 16/24 · 3 1/5 − 1 4/5 = 1 2/5 (checked by adding back) ·
7 × 3/8 = 21/8 = 2 5/8 · 40/100 + 7/100 = 0.47 · 0.25 < 0.5 · 50,000 ÷ 5,000 = 10 ·
60,318 = 60,000 + 300 + 10 + 8 · 47,215 < 47,251 (tens place decides) ·
24,600 − 18,475 = 6,125 (checked by adding back) · 144 + 720 = 864 ·
175 ÷ 6 = 29 R1 (29 × 6 + 1 = 175) · 2,000 ÷ 8 = 250 · 6 kg = 6,000 g,
3 L 250 mL = 3,250 mL · 3:45 + 50 min = 4:35 · P = 44 m, A = 117 m² ·
35 − 20 = 15 · 130 − 55 = 75 (55 + 75 = 130) · ray AB, WX ∥ YZ, WX ⊥ XY ·
40 + 55 + 85 = 180, acute + isosceles, rhombus · 8×3 rectangle has 2 lines of symmetry ·
63 ÷ 7 = 9 · 8 × 12 − 27 = 69 · factor pairs of 45 are 1×45, 3×15, 5×9 ·
4 + 9 × 7 = 67 (listed out to the 10th term to confirm).

Each `stepByStepMethod` was checked by following it literally against its own worked
example; each produces the stated answer.

## Issues and concerns

1. **The Content Contract's "must cite a real figure" is enforced by my test, which the
   rulings did not explicitly ask for.** Ruling 10.2 says to assert that any percentage
   present is the right one; it does not say one must be present. I added the
   "cites no blueprint figure" assertion because without it the whole check is vacuous for
   a guide that simply omits the band, and because the Content Contract requires the
   citation. If the controller judges this overbuilding, it is one line to remove.
2. **File size.** 1,082 lines for 25 guides, against Grade 5's 547 for 17. Per-guide it is
   ~43 lines against ~32 — larger, but the same shape, so I did not split it. Flagging it
   rather than acting on it, as instructed.
3. **The MD+G sentence is necessarily repetitive.** All nine MD and G guides say some
   variant of "weighted together by NCDPI as one reporting category worth 23–27%". I
   varied the wording as far as the rulings allow, but the constraint that both domains be
   named in the same sentence as the figure keeps them similar by design.

---

# Task 10 fix report — review round 1

All five findings addressed. Deferred minors left alone except the NF.3 one the
coordinator reassigned.

## Critical 1 — `NC.4.MD.3` commonTrap, false arithmetic

Confirmed. The trap carried `280` and "nearly seven times" from `authored.md.ts:750`,
where they belong to the L-shaped figure of `g4-md3-03` (7 x 5 and 4 x 2 rectangles,
7 x 5 x 4 x 2 = 280 against a real area of 43, which genuinely is ~6.5x). Pasted onto the
guide's 13 x 9 room both numbers were false: 13 x 9 x 13 x 9 = 13,689, and 280 is 2.4x
117, not seven times.

Fixed by anchoring the trap to the figure the error actually occurs on, rather than
inventing new numbers for the rectangle — `multiplied-every-side-length-together` only
arises on a rectilinear figure, where "every side length" is more than two:

> 'Multiplying every side length together on an L-shape. For a figure made of a 7 by 5
> rectangle and a 4 by 2 rectangle, 7 x 5 x 4 x 2 = 280, nearly seven times its real area
> of 43 square meters - each rectangle uses only its OWN two dimensions, and the two areas
> are then ADDED.'

Checked: 7x5 = 35, 4x2 = 8, 35 + 8 = 43; 280 / 43 = 6.5.

## Critical 2 — `NC.4.NF.1` commonTrap, false arithmetic and a conflated misconception

Confirmed on all three counts. Keeping the old numerator on 2/3 re-cut into twelfths
gives 2/12, not 3/12; 3/12 is `used-the-denominator-as-the-new-numerator`, which was the
very next trap in the same list; and neither is "half".

Fixed both traps so they name different errors with true arithmetic against this guide's
own 2/3 -> 8/12 example:

> 'Keeping the old numerator after the parts are re-cut. Answering 2/12 leaves only a
> quarter of the shading there was before, and the new pencil lines cannot have removed
> any shading.'
>
> 'Using the denominator as the new numerator, as if the bottom number told you how many
> parts are shaded. On this rectangle that gives 3/12, which is less than half the 8/12
> that is really shaded.'

Checked: 2/12 against 8/12 is 2/8 = one quarter; 3 is less than half of 8.

## The sweep the coordinator asked for

Both Criticals were the same failure mode, so I re-checked every `commonTraps` entry in
all 25 guides that carries a specific figure against that guide's own worked example.
Eight more entries carried a number that was true of its bank item but not anchored to
anything in the guide around it. None was arithmetically false in the way the two
Criticals were, but each invited the same falsification, so all eight are now either
anchored to the guide's own example or made explicit about the different problem they
describe:

| Guide | Was | Now |
| --- | --- | --- |
| NBT.2 | "nearly a thousand too large" — in this guide's own example (60,318) the error makes the number *smaller* | names the guide's own number: gives 6,318, nearly ten times too small |
| NBT.2 | "about a hundred times too small", unanchored | a stated case: "sixty thousand eighteen" -> 6,018 instead of 60,018 |
| NBT.7 | "the smallest by about 61,000", relative to a number not in this guide | compared to 60,318, which IS in this guide: more than 50,000 smaller |
| NBT.4 | "what the library had after giving books away" — this guide's story is a stadium | generic: the number from step one is handed in |
| NBT.5 | "turns 40 x 8 into 90 x 8", from a different item | worked on this guide's own 36 x 4: 204 instead of 144 |
| NBT.6 | "26 x 4 = 104, nowhere near 824" with 824 unexplained | states the problem it belongs to: 824 / 4 comes out 26 instead of 206 |
| MD.2 | "so 4,000 is copied down to the 6 kilogram row" | same error, worded against this guide's own 1 / 4 / 6 table |
| OA.3 | "leaves four children standing" — the four is from a different item's numbers | "leaves children standing", no borrowed count |

## Important 3 — the Ruling 10.2 guard was a substring test

Confirmed, and worse than the finding claimed: `"30–34%".includes("3")` passes, so `3%`
shipped green, and `"25–29%".includes("25")` passes, so the unpublished point value `25%`
shipped green. My original `40%` mutation went red only by luck.

Replaced with a parse-and-compare. `bandEndpoints()` parses the two endpoints out of the
`officialWeightRange`, and the assertion requires the matched expression to carry exactly
two numbers equal to those endpoints in order — so a lone endpoint, a midpoint, or any
other figure fails.

**Mutation evidence.** Command in each case:
`npx vitest run src/curriculum/grade4/studyGuides.test.ts`

`NC.4.NF.1`'s `30–34%` changed to `3%`:

```
 × grade 4 study guides > quotes only its own domain band, and quotes it
   → NC.4.NF.1 cites "3%", which is not the NF band 30–34%
 Tests  1 failed | 4 passed (5)
```

`NC.4.NBT.1`'s `25–29%` changed to `25%` — a real endpoint, the case the substring test
could never catch:

```
 × grade 4 study guides > quotes only its own domain band, and quotes it
   → NC.4.NBT.1 cites "25%", which is not the NBT band 25–29%
 Tests  1 failed | 4 passed (5)
```

Both reverted.

## Important 4 — the Ruling 10.1 guard tested the field, not the sentence

Confirmed. Added `sentencesOf()` and moved the check inside a per-sentence loop, so the
sentence carrying the figure is the one that must name both domains. The failure message
now quotes that sentence.

**Mutation evidence**, using the coordinator's exact two-sentence string, on `NC.4.G.3`:

```
 × grade 4 study guides > names both domains whenever it cites the shared MD+G band
   → NC.4.G.3 cites "23–27%" in a sentence that does not name both Measurement and
     Geometry, which claims a weight for one domain inside a combined band:
     "Geometry is 23–27% of the Grade 4 EOG."
 Tests  1 failed | 4 passed (5)
```

Under the old field-scoped guard that string passed. Reverted.

## Important 5 — the `NC.4.MD.8` method was addition-only

Confirmed, and the sourced description does say "addition **and** subtraction of time
intervals". Rewrote the method to branch on which of the three things the question wants,
and extended the worked example to cover the duration direction as well as the end-time
direction.

Followed literally on one case of each:

- **End time, interval longer than the remainder** — 3:45 p.m. + 50 min. Step 2: 15.
  Step 3: 50 > 15, so reach 4:00 and add the remaining 35 -> **4:35 p.m.**
- **End time, interval shorter than the remainder** (the case that previously asked a
  child to take 15 out of 10) — 3:45 p.m. + 10 min. Step 3: 10 < 15, so just add it ->
  **3:55 p.m.**
- **How long** (previously had no interval to subtract from) — 5:10 p.m. to 6:05 p.m.
  Step 4: 50 minutes to 6:00, no whole hours, 5 minutes past -> **55 minutes**.
- **Start time** — ends 4:35 p.m. after 50 minutes. Step 5: 35 minutes back to 4:00, then
  the remaining 15 back from there -> **3:45 p.m.**

The worked example is now two parts, (a) the end-time case and (b) the duration case, each
checked in the other direction in its own final step.

## NF.3's "at Grade 4 they always will"

Taken as reassigned. It was false at `NC.4.NF.6`, three guides later in the same file,
which does add tenths to hundredths. Now: "In this standard they always do - tenths added
to hundredths is the separate skill in the decimals guide, NC.4.NF.6."

The other three deferred minors (array-length-only assertions, the British "marks"
register at three sites, the "1,250 liters would fill a small swimming pool"
overstatement) were left untouched as instructed.

## Verification

Covering test file: `src/curriculum/grade4/studyGuides.test.ts` (5 tests). The guard
changes are covered by tests 4 and 5 in it, with the mutation evidence above; the trap,
method and worked-example rewrites are prose correctness, which no test can check and
which I verified by hand as recorded above.

- `npx vitest run src/curriculum/grade4/studyGuides.test.ts` -> `Test Files 1 passed (1)`,
  `Tests 5 passed (5)`
- `npx vitest run` (whole suite) -> `Test Files 59 passed (59)`, `Tests 615 passed (615)`
- `npx tsc -b --noEmit` -> `TypeScript: No errors found`
- `npm run lint` -> exit 0, same seven pre-existing warnings, none in these two files

## Files changed in this round

- `src/curriculum/grade4/studyGuides.ts` — the two Criticals, the eight sweep entries, the
  MD.8 method and worked example, the NF.3 step
- `src/curriculum/grade4/studyGuides.test.ts` — findings 3 and 4

---

# Task 10 fix report — review round 2

Three findings, all fixed. No objection to the scope ruling on A and B: a nine-year-old
applies a method to whatever is in front of them, and step 3 already guarded its
non-crossing case, so the asymmetry was an oversight and not a decision.

## Important A — `NC.4.MD.8` step 5 had no smaller-interval guard

Confirmed, and exactly the shape of the defect it was written to fix. Step 5 now mirrors
step 3's guard:

> 'Step 5: For a START time, compare the interval with the minutes showing on the END
> time. If the interval is smaller, just take it off - you never leave the hour. If it is
> bigger, take off the minutes showing to drop to the full hour below, then take the rest
> of the interval off from there.'

Step 2 also had a latent version of the same problem: it told the child to compute the
minutes remaining "on the earlier time", which a start-time question does not give them.
It is now conditional ("If you know the start time...") and step 5 works from the end
time's own minutes instead.

## Important B — `NC.4.MD.8` step 4 had no same-hour case

Confirmed: 5:10 to 5:40 came out 90 against a true 30. Step 4 now branches:

> 'Step 4: For HOW LONG something lasted, look at the two hour numbers first. If both
> times are in the SAME hour, just subtract the minutes. If the end time is in a later
> hour, count in three parts: ...'

This does not contradict the guide's surviving commonTrap about "subtracting the start
minutes from the end minutes in columns". That trap is about the case where the END has
FEWER minutes, which only happens when the interval crosses the hour; the new branch fires
only when both times are in the same hour, where the end minutes are necessarily larger.

## The six literal traces of the finished method

Each run by following steps 1-6 exactly as written, with no interpretation:

| # | Case | Trace | Produces | True |
| --- | --- | --- | --- | --- |
| 1 | 3:45 p.m. + 50 min (END, crosses) | S2: 60−45=15. S3: 50>15 → use 15 to reach 4:00, add remaining 35 | **4:35 p.m.** | 4:35 p.m. |
| 2 | 3:45 p.m. + 10 min (END, same hour) | S2: 15. S3: 10<15 → just add it on | **3:55 p.m.** | 3:55 p.m. |
| 3 | 5:10 p.m. to 6:05 p.m. (HOW LONG, crosses) | S4: hours 5 and 6 differ → 50 to the full hour, 0 whole hours, 5 past 6:00; 50+0+5 | **55 minutes** | 55 minutes |
| 4 | 5:10 p.m. to 5:40 p.m. (HOW LONG, same hour) | S4: both in hour 5 → subtract the minutes, 40−10 | **30 minutes** | 30 minutes |
| 5 | ends 4:35 p.m. after 50 min (START, crosses) | S5: 50>35 → take off 35 to reach 4:00, take the remaining 15 off from there | **3:45 p.m.** | 3:45 p.m. |
| 6 | ends 4:35 p.m. after 20 min (START, same hour) | S5: 20<35 → just take it off | **4:15 p.m.** | 4:15 p.m. |

Step 6 holds on all six: no part of any answer holds 60 or more minutes, and each checks
out worked in the other direction (1 against 5, 2 against 6, 3 and 4 by adding back).

Cases 2, 4 and 6 are the three the method previously could not survive: case 2 was the
original round-1 finding, case 4 returned 90, and case 6 returned −15.

## Also fix — the clause splitter's semicolon hole

Confirmed. `sentencesOf()` split on `.!?` only, so a semicolon-joined single-domain claim
stayed one chunk and passed. Renamed to `clausesOf()` and split on semicolons as well —
a semicolon joins two independent clauses exactly as a period does. The failure message
and the test's own wording now say "clause" rather than "sentence", so the next reader
knows the guard's unit.

```ts
function clausesOf(text: string): string[] {
  return text.split(/\s*;\s*|(?<=[.!?])\s+/).filter((s) => s.trim().length > 0);
}
```

The semicolon branch matches regardless of surrounding whitespace, so it also closes the
no-space form `EOG;Measurement`.

**Mutation evidence**, with the exact semicolon string, on `NC.4.G.3`.
Command: `npx vitest run src/curriculum/grade4/studyGuides.test.ts`

```
 × grade 4 study guides > names both domains whenever it cites the shared MD+G band
   → NC.4.G.3 cites "23–27%" in a clause that does not name both Measurement and
     Geometry, which claims a weight for one domain inside a combined band:
     "Geometry is 23–27% of the Grade 4 EOG"
 Tests  1 failed | 4 passed (5)
```

Under the round-1 splitter this string passed all five tests. Reverted; the suite is green
again on the restored text.

## Left deferred as instructed

`NC.4.NBT.7` trap 1's unanchored digits; `NC.4.NF.1`'s "2/3 becomes 11/12" opacity; the
"1,250 liters / swimming pool" overstatement; the L-shape "four side lengths" wording
(which mirrors `authored.md.ts:750` on purpose); the array-length-only assertions; the
British "marks" register.

## Verification

Covering test file: `src/curriculum/grade4/studyGuides.test.ts` (5 tests). The splitter
change is covered by test 5 with the mutation above; the MD.8 method is prose, verified by
the six literal traces above.

- `npx vitest run src/curriculum/grade4/studyGuides.test.ts` -> `Test Files 1 passed (1)`,
  `Tests 5 passed (5)`
- `npx vitest run` (whole suite) -> `Test Files 59 passed (59)`, `Tests 615 passed (615)`
- `npx tsc -b --noEmit` -> `TypeScript: No errors found`
- `npm run lint` -> exit 0, same seven pre-existing warnings, none in these two files

## Files changed in this round

- `src/curriculum/grade4/studyGuides.ts` — `NC.4.MD.8` steps 2, 4 and 5
- `src/curriculum/grade4/studyGuides.test.ts` — `sentencesOf` -> `clausesOf`, semicolon
  split, message wording
