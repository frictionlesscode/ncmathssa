# Task 15 report — Grade 3 study guides

Commit: `bb3dfdb feat: add grade 3 study guides`

## What I implemented

- `src/curriculum/grade3/studyGuides.ts` — `GRADE_3_STUDY_GUIDES: Record<string, StudyGuideSection>`,
  one entry per Grade 3 standard, 20 entries, keyed by code.
- `src/curriculum/grade3/studyGuides.test.ts` — 6 tests.

Every guide was written from `standards.ts` (`description` + `keyConcepts`), not from the
brief. The NC-specific constraints are visible in the content:

- `NC.3.OA.8` — two steps with addition, subtraction and multiplication only. No division
  anywhere in the guide, and no order-of-operations rule. Brackets appear only to show
  *which step happened first* in the child's own equation `(4 × 8) + 5 = m`, never as a
  precedence rule on a bare expression.
- `NC.3.NF.4` — same numerator or same denominator only; denominators used are 4, 6 and 8.
  No common-denominator method (that is Grade 4) and no benchmark comparator.
- `NC.3.NF.3` — all three bullets: related-family equivalence (fourths→eighths,
  thirds→sixths), "same top and bottom is one whole" (8/8 = 1), and whole numbers as
  fractions (3 = 12/4).
- `NC.3.MD.1` — both times in the same hour in every rule, method branch and trap.
- `NC.3.MD.2` — customary only: inches to the quarter-/half-inch, feet, yards, ounces,
  pounds, cups, pints, quarts, gallons. Guarded by the shared `METRIC_UNIT` pattern.
- `NC.3.NBT.2` — estimation for reasonableness (first keyConcept), the add/subtract inverse
  relationship, and expanded-form decomposition. **The words "round" and "rounding" appear
  nowhere** — the estimation strategy is written as "swap each number for a friendly number
  close to it that ends in 0", because NC has no rounding standard at any grade in this plan.
- `NC.3.NBT.3` — multiples of 10 stated as the range 10–90, with 9 × 90 = 810 named as the
  largest case (Ruling 13-4).
- `NC.3.G.1` — composing/decomposing and quadrilateral examples/non-examples, with NC's
  "at least one pair of parallel sides" trapezoid definition. No "unequal parts called a
  quarter" (Ruling 14-3).

`commonTraps` reuse the wording of the Grade 3 authored banks' `commonMisconception` lines
wherever the bank's error is reachable from *this guide's own* worked example — e.g.
NC.3.MD.2's "a small mark is only a quarter of an inch, so three of them are nowhere near
three inches", NC.3.MD.3's "seven stars is 7 × 6 = 42 books", NC.3.OA.8's
"adding the 5 before multiplying gives 52", NC.3.NBT.3's "35 is the right count of the
wrong unit".

## Test design (and what each guard is for)

1. one guide per standard, keyed by its own code
2. **fills every section** — Ruling 15-2. `.trim().length` on `title`, `coreConcept`,
   every `rulesAndFormulas[i].label` **and** `.detail`, every `stepByStepMethod[i]`, every
   `commonTraps[i]`, every `workedExample.steps[i]`, plus problem/answer/why.
3. distinct headings
4. **quotes only its own domain band, and quotes it** — both endpoints of the range are
   parsed and compared as a PAIR against the whole matched expression, so a substring hit
   such as `"32–36%".includes("3")` cannot pass. `80%`/`100%` are stripped first.
5. **names both domains whenever it cites the shared MD+G band** — Ruling 15-1,
   attribution not presence. The field is split into clauses on `;` **and** on `.!?`, and
   every clause carrying a percentage must name both Measurement and Geometry.
6. **teaches no metric unit anywhere** — the shared `./metricGuard.ts` `METRIC_UNIT` swept
   over every string of every guide (title, coreConcept, both halves of each rule, method,
   traps, and all five worked-example fields), not only the MD ones.

### Mutation checks (each guard verified in the failing direction, then reverted)

| Mutation | Result |
|---|---|
| MD.1 rewritten as `"Measurement and Data is worth 23–27% of the Grade 3 EOG; Geometry is tested alongside it…"` (the semicolon form that got past Grade 4's first fix) | FAILS: *"NC.3.MD.1 cites "23–27%" in a clause that does not name both Measurement and Geometry"* |
| OA.1's `32–36%` → `3%` (the substring that passed Grade 4's original `includes`) | FAILS: *"NC.3.OA.1 cites "3%", which is not the OA band 32–36%"* |
| G.1's first rule → `{ label: '', detail: '  ' }` | FAILS: *"NC.3.G.1 rulesAndFormulas[0].label: expected 0 to be greater than 0"* |
| MD.2's "Ounces" → "Grams" | FAILS: *"NC.3.MD.2 prints the metric unit "Grams""* |

## Every percentage written, and its blueprint line

`docs/sources/nc-eog-blueprint.json` → `bands."3"`:

```
{ domains: ["OA"],       range: "32–36%", midpoint: 34 }
{ domains: ["NBT"],      range: "9–13%",  midpoint: 11 }
{ domains: ["NF"],       range: "28–32%", midpoint: 30 }
{ domains: ["MD","G"],   range: "23–27%", midpoint: 25 }
```

| Guide | Figure written | Blueprint band |
|---|---|---|
| NC.3.OA.1, OA.2, OA.3, OA.6, OA.7, OA.8, OA.9 | `32–36%` (7 guides) | `bands."3"` OA |
| NC.3.NF.1, NF.2, NF.3, NF.4 | `28–32%` (4 guides) | `bands."3"` NF |
| NC.3.NBT.2, NBT.3 | `9–13%` (2 guides) | `bands."3"` NBT |
| NC.3.MD.1, MD.2, MD.3, MD.5, MD.7, MD.8, NC.3.G.1 | `23–27%` (7 guides), each in a sentence naming Measurement and Geometry together as one band | `bands."3"` MD+G |

All en dashes are U+2013, matching the blueprint and `standards.ts`. No other percentage
appears in any guide; no midpoint is quoted as a point value; no single-domain figure is
claimed for MD or G. No `80%`/`100%` framing was used in the end, so the carve-out is
belt-and-braces.

## Literal traces of every `stepByStepMethod`

Each method was followed word-for-word on one case of every shape it claims to handle.

**NC.3.OA.1** (equal groups).
- *Story:* 8 trays × 6 → S1 groups = 8; S2 size = 6; S3 `8 × 6`; S4 6,12,18,24,30,36,42,48 = 8 jumps; S5 "48 muffins". ✓
- *Array:* 4 rows of 7 → S1 groups = 4 rows; S2 = 7; S3 `4 × 7`; S4 7,14,21,28 = 4 jumps → 28. ✓

**NC.3.OA.2** (division, both readings of the second number).
- *Number of groups given:* 42 stickers, 6 friends → S1 total 42; S2 = groups; S3 `? × 6 = 42`; S4 6,12,…,42 = 7; S5 7 × 6 = 42 ✓ → 7 each.
- *Size of group given:* 42 stickers, 6 per bag → S1 total 42; S2 = size of each group; S3 `6 × ? = 42`; S4 → 7; S5 6 × 7 = 42 ✓ → 7 bags.

**NC.3.OA.3** (one-step word problems).
- *Total missing:* 7 tanks × 9 → S3 total missing → S4 multiply `7 × 9 = f` → S5 63 → S6 "63 fish". ✓
- *Number of groups missing:* 56 rolls, 8 per bag → S3 number of groups missing → S4 divide `8 × b = 56` → S5 7 → "7 bags". ✓

**NC.3.OA.6** (missing factor).
- *`6 × ? = 42`:* S1 "how many groups of 6 make 42"; S2 n/a; S3 42 ÷ 6; S4 6,12,18,24,30,36,42 = 7 jumps; S5 6 × 7 = 42 ✓.
- *`? × 5 = 45`:* S3 45 ÷ 5 = 9; S5 9 × 5 = 45 ✓.
- *`56 ÷ ? = 8` (the shape that needs S2):* S2 rewrite as `? × 8 = 56`; S3 56 ÷ 8 = 7; S5 7 × 8 = 56 ✓.

**NC.3.OA.7** (fluency; three branches, S2/S3/S4).
- *`7 × 8 = ?`* → S1 total missing → S2 multiply → 56; S5 family 7 × 8, 8 × 7, 56 ÷ 8, 56 ÷ 7 ✓.
- *`? × 6 = 54`* → S1 factor missing → S3 54 ÷ 6 = 9; S5 9 × 6 = 54 ✓.
- *`? ÷ 4 = 9`* → S1 total of a division missing → S4 9 × 4 = 36; S5 36 ÷ 4 = 9 ✓.
  (This is the branch Grade 4's time method lacked an equivalent of: every shape the
  standard produces has its own numbered step, and no step ever asks for a subtraction
  that cannot be done.)

**NC.3.OA.8** (two-step; the method is operation-agnostic, so it was traced on three
different pairs of operations).
- *× then +:* markers → S1 "how many in all"; S2 "how many in the packs?"; S3 4 × 8 = 32, labelled; S4 32 + 5 = 37; S5 `(4 × 8) + 5 = m`; S6 37 > 32 ✓.
- *× then −:* 6 trays of 9 rolls, 7 sold → S2 "how many rolls baked?"; S3 6 × 9 = 54; S4 54 − 7 = 47; S5 `(6 × 9) − 7 = r`; S6 47 < 54 ✓.
- *+ then −:* 24 crayons, 6 added, 9 lost → S3 24 + 6 = 30; S4 30 − 9 = 21; S5 `(24 + 6) − 9 = c`; S6 21 < 30 ✓.

**NC.3.OA.9** (patterns).
- *Multiplication table row:* row for 4 → S1 4,8,…,40; S2 step 4; S3 "all even"; S4 each step adds an even 4; S5 test 6 → absent, so the reverse is false ✓.
- *Hundreds board:* count by 5 → S1 5,10,…,100; S2 step 5; S3 two straight columns ending in 5 and 0; S4 two steps of 5 make one full row of ten; S5 test 52 → ends in 2, not shaded ✓.

**NC.3.NF.1** (unit fractions).
- *Area model:* pizza into 8 → S1 whole = pizza; S2 equal ✓; S3 8 on the bottom; S4 `1/8`; S5 8 > 4 so 1/8 < 1/4 ✓.
- *Length model:* 1-foot ruler into 3 equal lengths → S1 whole = ruler; S2 equal; S3 3; S4 `1/3` ✓.

**NC.3.NF.2** (reading fractions off a model).
- *Area:* 6 slices, 4 eaten → S1 area; S2 6 on the bottom; S3 4 on top; S4 "four one-sixths"; S5 3/6 is a half, so 4/6 is just over half ✓.
- *Length:* number line 0→1 with 8 equal spaces, 3 jumps → S2 count SPACES = 8; S3 3; S4 "three one-eighths"; S5 3/8 < 4/8 = a half ✓.

**NC.3.NF.3** (equivalence; S5 carries the other two bullets).
- *Fourths → eighths:* S1 same length ✓; S2 8 ÷ 4 = 2; S3 3 × 2 = 6; S4 3/4 = 6/8 ✓.
- *Thirds → sixths:* S2 6 ÷ 3 = 2; S3 2 × 2 = 4; S4 2/3 = 4/6 ✓.
- *Whole number as a fraction (S5):* 3 wholes in fourths → 3 × 4 = 12 → 12/4; and 8/8 = 1 ✓.

**NC.3.NF.4** (comparison; the two branches S3 and S4).
- *Same top:* 3/4 vs 3/8 → S1 same bar ✓; S2 tops match; S4 smaller bottom wins → 3/4 > 3/8; S5 symbol opens at 3/4 ✓.
- *Same bottom:* 5/6 vs 2/6 → S2 bottoms match; S3 more pieces wins → 5/6 > 2/6 ✓.
- *Equal:* 3/4 vs 3/4 → S3/S4 give neither bigger → `=` ✓.

**NC.3.MD.1** (time; all three missing-quantity branches, S4/S5/S6). This is the method
Grade 4 got wrong twice, so each branch was run and each was checked for a subtraction that
cannot be done.
- *Length missing:* 2:15 → 2:50 → S1 hours 2/2, minutes 15/50; S2 length; S3 drop the hour; S4 50 − 15 = 35; S7 count on from :15 in fives: 20,25,30,35,40,45,50 = seven fives = 35 ✓.
- *End missing:* start 2:15, lasts 35 → S2 end; S5 15 + 35 = 50 → 2:50; S7 ✓.
- *Start missing:* ends 2:50, lasted 35 → S2 start; S6 50 − 35 = 15 → 2:15; S7 ✓.
- Because both times are inside the same hour (the standard's own limit), S4's subtraction
  is always end-minutes minus the smaller start-minutes and S6's is always the end minutes
  minus a length no longer than them. No branch can be asked to take 35 from 15.

**NC.3.MD.2** (customary measurement; three shapes).
- *Ruler:* tip 3 marks past 4, 4 parts per inch → S1 length; S2 last whole inch 4, 3 marks, 4 parts; S3 4 and 3/4 inches; S5 nearly 5 inches, sensible for a crayon ✓.
- *Equal groups:* 3-pound bag × 7 → S1 weight; S4 same unit ✓, equal groups → 3 × 7 = 21 pounds; S5 ✓.
- *Sharing:* 24-cup cooler, 3 cups per bottle → S1 capacity; S4 sharing → 24 ÷ 3 = 8 bottles; S5 fewer than 24, sensible ✓.

**NC.3.MD.3** (scaled graphs).
- *"How many":* key 6, Lin 7 stars → S2 one star = 6; S3 7 × 6 = 42 books ✓.
- *"How many more":* Lin 42, Ravi 4 × 6 = 24 → S4 both in real units first, 42 − 24 = 18 ✓ (cross-check 3 extra stars × 6 = 18).
- *Bar graph:* gridlines every 10, bar ends on the third → S2 one gridline = 10; S3 30 ✓.

**NC.3.MD.5** (tiling).
- *4 rows of 6:* S1 same-size tiles, no gaps ✓; S2 6; S3 4; S4 6,12,18,24; S5 "24 square units" ✓.
- *2 rows of 9:* S2 9; S3 2; S4 9,18 → 18 square units ✓.

**NC.3.MD.7** (area by multiplying / decomposition).
- *Single rectangle:* 6 ft × 7 ft → S1 42 square feet, done ✓.
- *L-shape:* S2 one cut; S3 (8, 5) and (3, 4); S4 40 and 12; S5 52; S6 square feet ✓.

**NC.3.MD.8** (perimeter, both directions).
- *Perimeter missing:* sides 4, 6, 3, 5, 7 → S2 five numbers for five sides ✓ → 25 inches.
- *Side missing:* perimeter 30, sides 8, 5, 9 → S3 22; S4 30 − 22 = 8; S5 8 + 5 + 9 + 8 = 30 ✓.

**NC.3.G.1** (quadrilaterals).
- *Name the shape:* four sides, four square corners, four equal sides → S4 rectangle AND square (also rhombus, parallelogram); S5 both names stand ✓.
- *Non-example:* tilted shape, four equal sides, no square corners → rhombus and parallelogram, not a rectangle ✓.
- *Composing:* two identical squares joined → S1 four sides; S2 square corners; S3 sides no longer all equal → rectangle ✓.

**NC.3.NBT.2** (add/subtract to 1,000; both operations, including the trading branch in S4).
- *Addition:* 347 + 289 → S1 350 + 290 = 640; S2 300+40+7 / 200+80+9; S3 500, 120, 16; S4 500 + 120 = 620, + 16 = 636; S5 636 vs 640 ✓; S6 636 − 289 = 347 ✓.
- *Subtraction with a 0 in the tens:* 402 − 176 → S1 400 − 180 = 220; S2 400+0+2 / 100+70+6; S3 hundreds 400−100, tens 0−70 too small, ones 2−6 too small; S4 trade down: 402 = 300 + 90 + 12, giving 200 + 20 + 6; result 226; S5 226 vs 220 ✓; S6 226 + 176 = 402 ✓.

**NC.3.NBT.3** (one-digit × multiple of 10).
- 7 × 50 → S1 5 tens; S2 7 × 5 = 35; S3 35 tens; S4 350; S5 3 hundreds 5 tens ✓.
- 9 × 90 (the largest legal case) → 9 tens; 81; 81 tens; 810; 8 hundreds 1 ten ✓.
- 4 × 30 → 3 tens; 12; 12 tens; 120; 1 hundred 2 tens ✓.

## Brief / `standards.ts` disagreement beyond the rulings

None found. The brief's Step 3 is one sentence of guidance and the three rulings cover the
whole of it. Two notes rather than disagreements:

- The brief's Step 1 test is a strict subset of what shipped; the extra tests all come from
  Rulings 15-1, 15-2 and 14-1 plus Grade 4's distinct-title test.
- The brief says MD and G "may cite no percentage at all". Ruling 15-1 reverses that, and
  the Content Contract requires a real figure, so all seven cite the pair's band with both
  domains named. Implemented per the ruling.

## TDD evidence

**RED** (test written first, implementation absent):

```
$ npx vitest run src/curriculum/grade3/studyGuides.test.ts
Failed to resolve import "./studyGuides" from "src/curriculum/grade3/studyGuides.test.ts"
Test Files  1 failed (1)      Tests  no tests
```

**GREEN**:

```
$ npx vitest run src/curriculum/grade3/studyGuides.test.ts
Test Files  1 passed (1)      Tests  6 passed (6)
```

**Full gate**:

```
$ npx tsc -b --noEmit            → clean (TSC_OK)
$ npm run lint                   → exit code 0, 7 pre-existing warnings
                                   (ProgressContext.tsx x2, WeakSpotsView.tsx,
                                    QuizResults.tsx, and 3 others — none in files I touched)
$ npx vitest run                 → Test Files 86 passed (86)
                                   Tests 946 passed (946)
```

946 = the 940 baseline at `b77efb3` plus this task's 6.

## Files changed

- `src/curriculum/grade3/studyGuides.ts` (new)
- `src/curriculum/grade3/studyGuides.test.ts` (new)

Nothing else was touched. `GRADE_3_STUDY_GUIDES` is not yet wired into
`src/curriculum/grade3/index.ts` — that is Task 16's registration step, exactly as the
brief's Files list has it.

## Self-review findings

- **Arithmetic**: every worked example re-solved independently; each stated `answer` matches
  its own steps. Every number inside every `commonTraps` line was recomputed against the
  worked example in the *same* guide — this is the Grade 4 "280 from a different figure"
  defect, and the only figures that appear in a trap are ones the child can reach from the
  example directly above it. The two places where a trap needed a second figure
  (NC.3.MD.8's perimeter-vs-area contrast, NC.3.MD.3's bar-graph scale) name it explicitly
  as a *different* rectangle / a bar graph rather than the example's own numbers, and both
  are arithmetically true (6+4+6+4 = 20 and 6×4 = 24).
- **Voice**: sentences are short, every rule is illustrated with a concrete object (muffins,
  stickers, a crayon, stars on a graph), no algebra beyond a box or a single letter for the
  unknown, and no term is used before it is defined. No guide reads like the Grade 5 set.
- **No rounding vocabulary** anywhere, deliberately, including in NC.3.NBT.2 where the
  estimation keyConcept could easily have pulled it in.
- **Scope check**: I re-read each guide against its own `description` and `keyConcepts`
  after writing. Two edits came out of that pass — NC.3.NF.3 gained explicit "same top and
  bottom is one whole" and "whole numbers as fractions" material (its bullets 2 and 3, the
  two-thirds of the standard Ruling 13-3 warns is easy to drop), and NC.3.MD.7 was
  re-centred on the two-rectangle decomposition so it does not duplicate NC.3.MD.5's tiling.

## Concerns

1. The metric guard is applied to **all twenty** guides, not only the seven MD/G ones. Grade
   3 NC has no legitimate metric content in any domain, so this is strictly stronger and
   costs nothing today. If a future grade-3 guide ever needs the word "meter" in a
   non-measurement sense the pattern already excludes "perimeter" and "diameter", which are
   the only two realistic cases.
2. `GRADE_3_STUDY_GUIDES` is unreferenced by application code until Task 16 registers the
   grade. It is exercised by its own test, so it is not dead weight, but nothing renders it
   yet and no test asserts it is reachable from `index.ts`. That assertion belongs to
   Task 16.

---

# Review round 1 — four Important, two ruled-in Minors

All six addressed; nothing from the "do NOT fix" list touched.

## Important 1 — clause splitter now ends a clause at a comma

`studyGuides.test.ts` `clausesOf()` splits on `[,;:]`, on a **spaced** dash (` - `, ` – `,
` — `), and on `.!?`. The dash must be spaced: the unspaced en dash is the one inside
`23–27%`, and splitting there would tear every legitimate citation into `23` and `27%` and
turn the guard into a generator of false failures. That constraint is now a comment in the
function.

Five of the seven MD/G citations had the figure in a comma-chunk naming neither domain
("…, worth 23–27% of the Grade 3 EOG, and…") and went red under the new splitter. All seven
were rewritten so the figure sits in one comma-free stretch naming both domains, e.g.
`"Measurement and Data and Geometry share one 23–27% band on the Grade 3 EOG, and graph
questions turn up in it every year…"`.

**Mutation evidence (each reverted after):**

| Form | Injected text | Result |
|---|---|---|
| **comma** (the reviewer's own string) | `"Geometry alone is worth 23–27% of the Grade 3 EOG, and Measurement and Data is counted somewhere else."` | FAILS: *cites "23–27%" in a clause that does not name both … : "Geometry alone is worth 23–27% of the Grade 3 EOG"* |
| **colon + em dash** | `"One band on the Grade 3 EOG — Measurement and Data — is tested with another: Geometry is 23–27% of it…"` | FAILS: *… : "Geometry is 23–27% of it"* |
| control | unmutated file | 6 passed — the en dash inside all seven `23–27%` citations is untouched |

## Important 2 — NBT.2's trade-down test moved into the step that needs it

The method is now seven steps. **Step 3** is the check, and it runs *before* any subtracting:
"If it is a SUBTRACTION, check each part before you take anything away… Wherever it is not,
trade first… (If the tens part is 0, the hundred has to stop there on its way to the ones.)"
Step 4 then subtracts, and says why it is safe: "After Step 3 every part is big enough to
take from." Step 5 is the separate trade-**up**.

The branch is also now exercised inside the guide itself, not only in this report: the
"Trading down" rule carries the whole 402 − 176 case, and trap 4 is anchored to it.

**Both branches, followed literally:**

*Subtraction — 402 − 176 (the branch that stalled):*
- S1 estimate: 400 − 180 = 220.
- S2: 402 = 400 + 0 + 2; 176 = 100 + 70 + 6.
- S3 it IS a subtraction. Ones: is 2 big enough to take 6 from? No. Tens: is 0 big enough to
  take 70 from? No. Trade first, and because the tens part is 0 the hundred stops there on
  its way: 402 = 300 + 90 + 12. Rewrite the expanded form before going on.
- S4: hundreds 300 − 100 = 200; tens 90 − 70 = 20; ones 12 − 6 = 6. **No step ever asks for
  70 from 0.**
- S5: 200 + 20 + 6 = 226; no part reaches ten or more, so nothing trades up.
- S6: 226 against the estimate 220 — close. S7: 226 + 176 = 402. ✓

*Addition — 347 + 289:*
- S1: 350 + 290 = 640. S2: 300+40+7 / 200+80+9.
- S3: it is an addition, not a subtraction, so the check does not apply and nothing is traded
  down. (This is now step 3 of the worked example in the guide, so the reader sees the branch
  being skipped rather than silently missing.)
- S4: 500, 120, 16. S5: trading up, 500 + 120 = 620, 620 + 16 = 636.
- S6: 636 against 640 ✓. S7: 636 − 289 = 347. ✓

## Important 3 — one factor-role convention, held across OA.1, OA.2, OA.3 and OA.6

**Chosen: groups first, size of each group second** (`8 × 6` is 8 trays of 6).

Why that one: it is the order `NC.3.OA.1`'s own keyConcept uses — "the factors as
representing the number of equal groups **and** the number of objects in each group" — and
`NC.3.OA.2`'s repeats it for the divisor and quotient. It was also already OA.1's stated
rule, so the source and the majority of the shipped text agree.

Changes:

- **OA.1** now states it as a convention rather than a description: "The FIRST number always
  counts the groups and the SECOND always says how many are in one group."
- **OA.2** rule, method step 3 and worked steps 3 and 5 flipped: "6 friends" (6 groups) is
  now `6 × ? = 42`, and "6 in each bag" is `? × 6 = 42`. The check reads `6 × 7 = 42 - six
  friends with seven each`, which no longer contradicts the guide's own "swapping the two
  jobs" trap.
- **OA.3** `8 × b = 56` → `b × 8 = 56`, in both the rule and the unknown-symbol rule; the
  `7 × 9 = f` case was already groups-first.
- **OA.6** reads the bare equation groups-first too ("6 × ? = 42 is *6 groups of how many
  make 42?*"), and the skip-counting rule no longer says "seven groups of 6" for a `? = 7`
  that is a group **size** — it says "you said seven numbers, so the missing factor is 7",
  and names the commutative property as the reason counting by 6 finds it.

Answers are unchanged throughout; only the stories attached to the factors are.

## Important 4 — NBT.3 no longer claims a per-standard share

Was: "one of only two standards in the 9–13% Base Ten band … so it carries half of that band."
Now: "Base Ten is the smallest band on the Grade 3 EOG at 9–13%, and this is the standard that
turns a fact you already know into a three-digit answer - the place-value reasoning every bit
of Grade 4 multiplication is built on."

The band is stated and attributed to the domain, and nothing is asserted about the standard's
share. NBT.2's ruling-13-5 phrasing is untouched, so the two no longer contradict each other.

## Ruled-in Minor — NF.4's method can now reach `=`

A new step 5 — "If BOTH numbers match, the two fractions are the same fraction, so the answer
is =" — sits ahead of the symbol step, which became step 6 and now offers only `>` or `<`.
Literal trace of the third branch: 3/4 vs 3/4 → S1 same whole ✓; S2 both match; S3 bottoms
match, S4 tops match, neither gives a bigger one; S5 both numbers match → `=`. ✓ All three
symbols the keyConcept names are now reachable from the method.

## Ruled-in Minor — MD.1's trap 3 replaced

The `250 − 215` trap produced 35, the right answer, and then conceded the point. Replaced with
an error that lands somewhere genuinely wrong on this very example: "The long hand travels
from the 3 round to the 10, which is 7 steps, so the answer looks like 7 minutes - but each
step is worth five minutes, and seven fives are 35." At 2:15 the long hand is on the 3 and at
2:50 it is on the 10, so the 7 is reachable and wrong, and the correction lands on the guide's
own answer.

## Verification after the fixes

```
$ npx vitest run src/curriculum/grade3/studyGuides.test.ts → 6 passed (6)
$ npx tsc -b --noEmit                                      → clean (TSC_OK)
$ npm run lint                                             → exit code 0, 7 warnings (unchanged, none in my files)
$ npx vitest run                                           → 86 files, 946 passed (946)
```
