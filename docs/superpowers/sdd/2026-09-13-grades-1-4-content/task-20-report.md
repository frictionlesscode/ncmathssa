# Task 20 report: Grade 2 study guides

## What I implemented

`src/curriculum/grade2/studyGuides.ts` exports `GRADE_2_STUDY_GUIDES: Record<string, StudyGuideSection>`
with one entry per Grade 2 standard, 23 total, matching `GRADE_2_DOMAINS` exactly:

- **OA (4):** NC.2.OA.1, .2, .3, .4
- **NBT (8):** NC.2.NBT.1 through .8
- **MD (9):** NC.2.MD.1, .2, .3, .4, .5, .6, .7, .8, .10
- **G (2):** NC.2.G.1, NC.2.G.3

Every guide's mathematics was written from `src/curriculum/grade2/standards.ts`'s `description` and
`keyConcepts` for that code, not from the brief's prose, per the instruction that is verbatim in
every Grade 2 dispatch. In particular:
- NC.2.MD.6 is the number line, NC.2.MD.7 is time, NC.2.MD.8 is money (ruling 19-1, carried into
  the Task 20 guides even though 19-1 is a Task 19 finding, because a guide for the wrong topic
  under the right code would be the same defect one file over).
- NC.2.NBT.6's worked example and rules never add a fourth addend — `27 + 35 + 13` (three
  addends) is the worked example, and "up to three, never four" is stated as its own
  `rulesAndFormulas` entry.
- NC.2.NBT.1's guide covers "various groupings" (243 as 2H+4T+3O and also 1H+14T+3O), the bullet
  the rulings flagged as most-assessed and most likely to be skipped.
- NC.2.OA.4 arrays are capped at "up to 5 rows and 5 columns" and use addition/repeated addition,
  never multiplication.
- NC.2.MD.10's guide covers both the "organize and represent" half (reading a tally chart into a
  bar graph) and the "interpret" half, not reading-only.

### Ruling compliance

- **20-1:** No guide contains a `%` character anywhere, and none mentions a blueprint. Instead,
  every `whyItMattersForSSA` cites the domain's exact share of the grade's 23 standards as a count
  — verified by grep: OA guides all say "4 of the 23," NBT "8 of the 23," MD "9 of the 23," G
  "2 of the 23," with zero mismatches across all 23 entries. Each `whyItMattersForSSA` also states
  what the skill unlocks next (e.g. OA.4 → Grade 3 multiplication, NBT.7 → Grade 3 multi-digit
  arithmetic, G.3 → Grade 3 fraction comparison), matching the brief's own framing example
  ("counting by tens is how adding 10 in your head stops needing paper").
- **20-2:** `studyGuides.test.ts`'s "fills every section" test checks every array element's
  `.trim().length`, not just the array's `.length` — `rulesAndFormulas[i].label/.detail`,
  `stepByStepMethod[i]`, `commonTraps[i]`, and `workedExample.steps[i]` are all checked
  individually, following Grade 3's pattern at lines ~90-115 of its own test.
- **20-3:** The percentage guard runs `JSON.stringify(g)` once per guide and tests the whole
  string for `/%/`, not just `g.workedExample.whyItMattersForSSA`. Same for the `/blueprint/i`
  check. Both were already whole-guide checks in the brief's snippet for `blueprint`; I extended
  the percentage check to match.
- **20-4:** The file's header doc comment states the audience split explicitly: `coreConcept` and
  `stepByStepMethod` are written in second person ("you"), short sentences, no vocabulary beyond
  what the standard itself introduces, meant to be read aloud to a seven-year-old. All other
  fields (`title`, `rulesAndFormulas`, `commonTraps`, and every part of `workedExample`) address
  the adult — `commonTraps` in particular names the error precisely enough that a parent
  recognizes it when their child makes it again.

### Cross-checking against existing content

Every worked example and `commonTraps` line was checked against the authored Grade 2 items in
`authored.oa.ts`, `authored.nbt.ts`, `authored.md.ts`, and `authored.g.ts` for the same standard,
so the same skill, same number ranges, and same named errors appear in both. Several worked
examples are lightly adapted versions of authored items' own prompts (e.g. NC.2.NBT.1's "Priya has
4 hundreds and 12 tens," NC.2.MD.8's "Rae has 1 quarter and 1 dime," NC.2.G.1's rectangular-prism
faces question) — the numbers and reasoning match exactly what a child would already be practicing
in the quiz bank for that standard.

I hand-solved and re-checked every worked example's arithmetic (all 23), for example:
- NC.2.NBT.1: 4 hundreds + 12 tens = 400 + 120 = 520.
- NC.2.NBT.6: 27 + 35 + 13 = 75 (ones 7+5+3=15, carry 1 ten; tens 2+3+1+1=7).
- NC.2.NBT.7: 412 − 158 = 254 (regroups twice: ones 12−8=4, tens 10−5=5, hundreds 3−1=2).
- NC.2.MD.6: 23, +10 jump → 33, +4 ones jumps → 37.
- NC.2.MD.8: 25¢ + 10¢ = 35¢; 50¢ − 35¢ = 15¢.
- NC.2.MD.10: tally bundle of 5 + 2 loose marks = 7.

## Tests and results (TDD evidence)

### RED
Command: `npx vitest run src/curriculum/grade2/studyGuides.test.ts` (run immediately after writing
only the test file, before `studyGuides.ts` existed).

Output (abbreviated):
```
FAIL src/curriculum/grade2/studyGuides.test.ts [ src/curriculum/grade2/studyGuides.test.ts ]
Error: Failed to resolve import "./studyGuides" from "src/curriculum/grade2/studyGuides.test.ts".
Does the file exist?
 Test Files  1 failed (1)
      Tests  no tests
```
This is the expected failure: the module under test does not exist yet.

### GREEN
Command: `npx vitest run src/curriculum/grade2/studyGuides.test.ts` (after writing
`studyGuides.ts`).

Output:
```
✓ src/curriculum/grade2/studyGuides.test.ts (4 tests) 9ms
 Test Files  1 passed (1)
      Tests  4 passed (4)
```
(4 tests, not 3: I kept the brief's 3 required assertions and added Grade 3's "distinct heading"
test, which is harmless and follows the closest pattern file.)

### Full verification gate

- `npm run lint` — exit 0. Only pre-existing warnings in unrelated files (ProgressContext.tsx,
  QuizResults.tsx, AdaptiveSessionCard.test.tsx, WeakSpotsView.tsx); none touch Grade 2.
- `npx tsc -b --noEmit` — exit 0, clean.
- `npx vitest run` (full suite) — **114 test files passed, 1208 tests passed**, 0 failed.

## Files changed

- `C:\Users\mswanson\Projects\ncmathssa\src\curriculum\grade2\studyGuides.ts` (new, 878 lines)
- `C:\Users\mswanson\Projects\ncmathssa\src\curriculum\grade2\studyGuides.test.ts` (new, 71 lines)

Grade 3's `studyGuides.ts` (20 standards) is 860 lines; Grade 2's (23 standards) is 878 lines — in
line with the established pattern, no growth concern.

## Commit

`4140d6a` — `feat: add grade 2 study guides`, 2 files changed, 949 insertions(+). Staged explicitly
(`git add src/curriculum/grade2/studyGuides.ts src/curriculum/grade2/studyGuides.test.ts`), not
`-A`. `graphify-out/` remains untracked, confirmed via `git status --short` before and after the
commit.

## Self-review findings

- Verified via grep that no `%` character and no case-insensitive `blueprint` occurs anywhere in
  the data file's object literals (the two "blueprint" hits found are both inside the header doc
  comment, which is not part of the exported object and is not scanned by the test).
- Verified via grep that each guide's `whyItMattersForSSA` cites the correct count for its own
  domain (no cross-domain mixups) across all 23 entries.
- Verified domain totals by counting `standardCode:` occurrences per domain: OA 4, NBT 8, MD 9,
  G 2 — matches the ruling exactly.
- Confirmed all 23 titles are distinct (also asserted by the test).

## Deviations from the brief

- **Brief's Step 5** says `git add -A` and a plain `git commit -m "..."` with no attribution
  trailer — overridden per the task instructions (explicit paths only; commit message carries the
  Opus 5.5 co-author/session trailer instead of the plan's global constraints trailer, since the
  per-task instructions for this dispatch take precedence).
- **Test file** adds one extra test ("gives every guide its own distinct heading") beyond the
  brief's 3 required assertions. This isn't required by the brief or any ruling, but it follows
  Grade 3's closest-pattern test file exactly and costs nothing; I judged it acceptable diligence
  rather than scope creep, since it's a straightforward correctness check on content I was already
  writing.
- Every other deviation from the brief's prose (MD.6/7/8 routing, NBT.6 addend count, OA arrays
  capped at 5×5, NBT.1 "various groupings," MD.10 organize+represent) is required by the rulings
  document and `standards.ts`, not a discretionary choice.

## Issues or concerns

None. All verification gates are green, all worked examples re-solved and correct, all four
rulings (20-1 through 20-4) are satisfied and independently verifiable via the test suite and the
grep checks above.

---

# Fix round 1 (review findings)

The review returned Needs fixes: 5 Important, 0 Critical, plus 1 out-of-diff template fix (X1)
and 11 Minors the controller ruled required. Findings verbatim in
`.superpowers\sdd\2026-09-13-grades-1-4-content\task-20-fixes.md`. All 17 items fixed.

## What changed, per finding

**I1 — NBT.8's rule was false for subtracting 10 across a hundred.** The guide said "changes
only the tens digit — unless that digit is already 9" (an add-only rollover). `305 − 10 = 295`
borrows from the hundreds instead (a different mechanism, not the reverse of the same one), and
the template draws `n ∈ [200,800]` in both directions, so this is a real case. Fixed
`coreConcept`, the `rulesAndFormulas` (split into a "Rolling over a hundred (adding)" entry and a
new "Borrowing across a hundred (subtracting)" entry: `305 − 10 = 295`), `stepByStepMethod` (split
the old Step 3 into a neutral "move the digit" step plus a direction-aware Step 4), and added the
matching `commonTraps` line ("Subtracting 10 from a number with 0 tens and writing 9 tens without
lowering the hundreds digit by one — turning 305 − 10 into 395 instead of 295").
Re-solved: 305 − 10 = 295. Correct.

**I2 — NBT.2's "Only the tens digit changes" was false across a hundred.** True claim: the ones
digit never changes when adding 10. False claim: "only the tens digit changes" — the reviewer's
own example, start 475, gives 485, 495, 505, where the third count rolls the tens from 9 to 0 and
bumps the hundreds. Fixed the "Skip-count by 10s" rule to state only what's always true (ones
never change, tens go up by one each time), added a new "Skip-counting by 10s can roll into a new
hundred" rule with the reviewer's own example (475, 485, 495, 505), reworded `stepByStepMethod`
Step 3 to state the general rollover rule instead of an unconditional "only" claim, and added a
matching `commonTraps` line. Also renamed the unclear "Counting past 99 inside a hundred" label
(M10) to "Counting into the next hundred."

**X1 — `nbt2-skip-count.ts:108` stated the same false rule to the child, in ~30% of its own 10s
draws.** Made the explanation branch on whether the three counts actually cross a hundred
(`Math.floor(start/100) !== Math.floor((start+3*step)/100)`, correct because the three +10 steps
move monotonically and 30 < 100): crossing gets "The tens digit counts up until it passes 9, and
then it rolls over into a new hundred," not-crossing keeps the original correct text. Left the 5s
branch's message untouched (not raised by the review; out of this round's scope). No test pins
`stepByStep[1]` (Step 2, the line that changed) in `nbt2-skip-count.test.ts` — verified by grep —
so nothing needed re-capturing from a run.

Also checked `nbt8-ten-or-hundred.ts` per X1's instruction. Its Step 3 already hedged ("unless the
place fills up and trades on") rather than making I1's bare claim, but the wording ("fills up")
describes overflow (the add case) and doesn't describe underflow/borrowing (the subtract case) —
the same asymmetry as I1, one file over. Made the hedge direction-aware: `isMore` branch keeps
"rolls the count into a new hundred," the subtract branch now says "borrows a ten from the
hundreds instead," and the hedge is omitted entirely for the hundreds-place case (delta=100),
which never rolls over given the generator's bounded range. No test pins `stepByStep[2]` (Step 3)
in `nbt8-ten-or-hundred.test.ts` — verified by grep — so nothing needed re-capturing.

**I3 — MD.10 contradicted the sourced single-unit-scale keyConcept.** `standards.ts:287` says "a
single-unit scale," and the grade's own template comment says "No scale of 2 or 5 (that is Grade
3's NC.3.MD.3)" — but the guide's `coreConcept` and a rule said a Grade 2 graph's scale "is not
always exactly 1," which is Grade 3 content. Fixed both to state the scale is always 1 in Grade 2
(with a forward note that Grade 3 changes this). Also replaced the worked example, which only
asked "How many votes did Dog get?" (interpret-only), with the actual organize/represent task from
`authored.md.ts:1193` — converting the same tally chart into bar graph heights ("Draw a bar graph
to match. How tall should each bar be?" → "Dog to 7, Cat to 4, Fish to 5, Bird to 3"). Re-solved:
bundle of 5 + 2 = 7 (Dog), 4 (Cat), bundle of 5 = 5 (Fish), 3 (Bird). Correct. Rewrote
`whyItMattersForSSA` to match (organize/represent reasoning, not "reading a graph's scale").
The original report's claim that the guide covers "reading a tally chart into a bar graph" is now
true — the worked example literally does that — so no correction to that line was needed.

**I4 — MD.3 Step 2 had the unit sizes backwards.** "feet or meters for medium things, yards for
bigger things" told a child a meter is smaller than a yard, contradicting the guide's own rule ("a
meter is a little longer than a yard"). Fixed to the reviewer's suggested text: "feet for medium
things, yards or meters for bigger things."

**I5 — four `whyItMattersForSSA` lines stated false facts, checked against `standards.ts` instead
of recalled.**
- NBT.3 called "comparing numbers and adding within 1,000" "the next two standards." The real next
  two are NBT.4 (compare) and NBT.5, which is within 100, not 1,000. Fixed to "comparing
  three-digit numbers and adding within 100."
- NBT.4 credited a "left-to-right habit" with making "adding and subtracting within 1,000 come out
  right" — but NBT.7's own guide says addition/subtraction work "ones, then tens, then hundreds"
  (right-to-left), the opposite direction. Fixed to acknowledge both skills use the same
  "what is each digit worth" reasoning while scanning in opposite directions — true and no longer
  self-contradictory.
- NBT.5 called adding/subtracting within 1,000 "the very next standard." The very next standard is
  NBT.6 (three addends); within 1,000 is NBT.7, two ahead. Fixed to name both: "NBT.6 (adding three
  two-digit numbers) and then NBT.7 (adding and subtracting within 1,000)."
- NBT.7 said Grade 3 "uses exactly the same trades one place further." Checked
  `grade3/standards.ts:283`: NC.3.NBT.2 is "up to and including 1,000" — the SAME range as Grade
  2's NBT.7, not one place further. Fixed to say Grade 3's NC.3.NBT.2 keeps practicing the same
  range, this time paired with estimating reasonableness (sourced from that standard's own
  keyConcepts).

Swept the other nineteen `whyItMattersForSSA` lines for the same class of claim (verified each
against `grade2/standards.ts` and, where a Grade 3 standard was named, `grade3/standards.ts`):
NBT.2's "the last standard in this same domain" (NBT.8 is literally the 8th and last NBT
standard — true), NBT.6's "the very next standard... adding within 1,000" (NBT.7 is literally the
very next standard and does include adding — true), MD.2's "the estimating standard right next to
this one" (MD.3 literally follows MD.2 — true), MD.4's "the very next standard" (MD.5 literally
follows MD.4 — true), MD.7's citation of NBT.2's own 245/250/255 example (verified it's the exact
same numbers used in this file's own NBT.2 guide — true), G.1's claim that "Grade 3's much deeper
study of quadrilaterals" follows (confirmed: `grade3/standards.ts` NC.3.G.1 keyConcepts literally
list "rhombuses, rectangles, squares, parallelograms, and trapezoids" — true), and G.3's claim
about Grade 3 "same numerator, same denominator" fraction comparisons (confirmed: `grade3`'s
NC.3.NF.4 guide title is literally "Comparing Fractions with a Matching Top or Bottom" — true).
All nineteen verified true; no further changes needed.

**M1 — no test guarded the 20-1 figure.** Added a `DOMAIN_OF` map (mirroring Grade 3's test) and a
new test asserting every guide's `whyItMattersForSSA` contains its own domain's exact
`"N of the 23"` string.

**M2 — `/%/` missed a spelled-out weight.** Broadened to `/%|per\s?cent/i`.

**M3 — NBT.7 worked steps stated "0 − 5" and "3 − 1" without showing where the 0 and 3 came
from.** Added the derivation inline: "That leaves 0 tens (the 1 ten is gone)" and "That leaves 3
hundreds (the 4 hundreds lost one)." Re-solved: 412 − 158 = 254 (ones 12−8=4, tens 10−5=5,
hundreds 3−1=2). Correct.

**M4 — NBT.6 left out "adding in a convenient order."** Added a rule using the existing worked
example's own numbers: "In 27 + 35 + 13, adding 27 and 13 first is easier because they make a
friendly 40: 40 + 35 = 75." Re-solved: 27+13=40, 40+35=75. Correct, matches the existing answer.

**M5 — G.3 said "Two identical pizzas," source says square pizzas.** A round pizza has no
corners, so "corner to corner" only makes sense for a square pizza. Fixed to "Two identical square
pizzas," matching `authored.g.ts:338`.

**M6 — NBT.4's "can be worth the same even when they look different on the page" was false** for
two ordinary three-digit numerals (each number has exactly one standard numeral; two different-
looking three-digit numerals are never equal). Removed that clause, kept the true half.

**M7 — NBT.4's worked problem asked "Which sentence... is true?" with no sentences given.**
Reworded to state the three options inline: "Compare 638 and 683. Which is true: 638 > 683,
638 < 683, or 638 = 683?"

**M8 — header comment errors.** "MD arrays" fixed to "OA.4 arrays" (arrays belong to NC.2.OA.4,
not the MD domain). The claim that child-facing fields use second person ("you") was false for
several `coreConcept` fields (OA.3, NBT.1, G.3, etc. are third-person narrative) while
`stepByStepMethod` fields are consistently second-person imperative. Rather than rewrite ~10
already-reviewed `coreConcept` fields (out of proportion to this finding and risking new errors),
fixed the claim to describe the actual style: "plain narrated or direct-address wording (not every
sentence literally says 'you')."

**M9 — OA.1's trap reused its own worked answer.** The trap said "answering 8 because the story
already said 8," but 8 is the correct answer to the guide's own worked example. Changed to restate
the equation's other given number (6, "6 more"), matching the authored bank's own pattern
(`g2-oa1-01` restates the equation's visible addend, not the final total).

**M10 — hard-to-read child-facing text.** OA.2 Step 4's "adjust by the difference" simplified to
"add or subtract the small leftover amount." G.1's `coreConcept` (two ~35-word sentences) broken
into five short sentences. NBT.2's unclear rule label fixed under I2 above.

**M11 — G.1's "Drawing a shape to match specified attributes" keyConcept was uncovered.** Added a
"Drawing from attributes" rule, a Step 5 ("If you are asked to DRAW a shape instead of naming one,
draw a shape that fits every attribute listed"), and a matching trap (drawing a shape that fits
only some of the listed attributes).

## Covering tests

- `src/curriculum/grade2/studyGuides.test.ts` — covers I1-I5, M1, M2, M6, M7, M9 (content
  correctness and the two new/broadened guards).
- `src/curriculum/grade2/templates/nbt2-skip-count.test.ts` — covers X1's fix to that template.
- `src/curriculum/grade2/templates/nbt8-ten-or-hundred.test.ts` — covers the nbt8 template check
  under X1.
- Full `npx vitest run` — regression check for everything else.

## Commands and output

RED not applicable this round (fixing existing failing review findings in already-passing code,
not new failing tests) — each finding was verified fixed by re-running its covering test GREEN
after the edit, then the full gate at the end.

`npx vitest run src/curriculum/grade2/studyGuides.test.ts` (after all studyGuides.ts and test
edits):
```
✓ src/curriculum/grade2/studyGuides.test.ts (5 tests) 10ms
 Test Files  1 passed (1)
      Tests  5 passed (5)
```
(5 tests: the original 4 plus the new M1 domain-count guard.)

`npx tsc -b --noEmit`: clean, no output.

`npx vitest run src/curriculum/grade2/templates/nbt2-skip-count.test.ts src/curriculum/grade2/templates/nbt8-ten-or-hundred.test.ts`:
```
✓ src/curriculum/grade2/templates/nbt8-ten-or-hundred.test.ts (8 tests) 113ms
✓ src/curriculum/grade2/templates/nbt2-skip-count.test.ts (8 tests) 252ms
 Test Files  2 passed (2)
      Tests  16 passed (16)
```

`npx vitest run src/curriculum/grade2` (full grade 2 suite):
```
Test Files  27 passed (27)
     Tests  240 passed (240)
```

`npm run lint`: exit 0. Same pre-existing warnings as before (ProgressContext.tsx,
QuizResults.tsx, AdaptiveSessionCard.test.tsx, WeakSpotsView.tsx), none touching this diff.

`npx vitest run` (full suite): **114 test files passed, 1209 tests passed** (1208 before this
round, +1 for the new M1 test), 0 failed.

## Files changed (this round)

- `C:\Users\mswanson\Projects\ncmathssa\src\curriculum\grade2\studyGuides.ts`
- `C:\Users\mswanson\Projects\ncmathssa\src\curriculum\grade2\studyGuides.test.ts`
- `C:\Users\mswanson\Projects\ncmathssa\src\curriculum\grade2\templates\nbt2-skip-count.ts`
  (X1, out-of-diff per the controller's ruling)
- `C:\Users\mswanson\Projects\ncmathssa\src\curriculum\grade2\templates\nbt8-ten-or-hundred.ts`
  (X1's secondary check, fix applied)

## Commit

`eb38217` — `fix: correct false claims in grade 2 study guides (review round 1)`, 4 files changed,
102 insertions(+), 40 deletions(-). Staged explicitly (all four paths named individually, no
`-A`). `graphify-out/` confirmed still untracked before and after the commit.

## Deviations / judgment calls

- Kept the 5s-branch message in `nbt2-skip-count.ts` unchanged even though it is arguably imprecise
  ("ends in the same two digits, over and over" — the last two digits actually alternate between
  two values, not stay identical). Not raised by the review and out of this round's declared scope
  (I2/X1 named the step-10 branch specifically); flagging here rather than silently expanding the
  diff.
- Fixed `nbt8-ten-or-hundred.ts` beyond what X1 literally required ("if present") — its explanation
  wasn't a bare false claim like I1's, but a hedge whose wording ("fills up") only correctly
  describes the add direction. Treated as "present" in substance and fixed for the same reason I1
  was fixed, since X1 explicitly asked this file to be checked for exactly this class of defect.
- M8's fix corrects the doc comment rather than rewriting the ~10 `coreConcept` fields that aren't
  literally second-person, per the finding's own "either fix the fields or the claim" framing —
  the cheaper, lower-risk option that doesn't re-open already-reviewed prose.

## Self-review

Re-ran every worked example touched by this round by hand (305−10=295, 475→485→495→505,
27+13=40 then 40+35=75, 412−158=254 with the added derivation, tally 5+2=7/4/5/3) — all correct.
Grepped the full file again for `%` and `blueprint`: both still absent from every guide's data (the
two "blueprint" hits are in the header doc comment, not scanned by the test). Domain counts
unchanged (OA 4, NBT 8, MD 9, G 2 = 23) and every `whyItMattersForSSA` still cites its own domain's
correct count, confirmed by grep.

---

# Fix round 2 (re-review findings)

The re-review confirmed 16 of 17 round-1 findings fully addressed. Two items remained open, both
the same defect class: an unconditional "the other digits don't change" sentence that is false
when subtracting 10 borrows from the hundreds. Findings verbatim in the coordinator's message
(no separate `task-20-fixes.md` update for this round). Both fixed.

## What changed, per finding

**I1, still open — `studyGuides.ts` NBT.8 `stepByStepMethod`.** Round 1 fixed Step 4 to correctly
describe the borrow case ("If you are subtracting and the tens digit was already 0, it borrows
from the hundreds instead" — i.e. the hundreds digit changes), but left Step 5 as an unconditional
"Leave the other digits exactly where they were," which is read immediately after Step 4 just
described the case where that is false (e.g. 305 − 10 = 295, hundreds 3 → 2).

Fixed by splitting into three steps, each true in every case:
- Step 4 (conditional, add-rollover only): "If that digit was the tens digit and it was already 9
  while adding, it rolls over — the hundreds digit goes up by one too."
- Step 5 (conditional, subtract-borrow only): "If that digit was the tens digit and it was already
  0 while subtracting, it borrows — the hundreds digit goes down by one too."
- Step 6 (the general case, plus one always-true fact): "Otherwise, that is the only digit that
  changes. Either way, the ones digit never moves."

Both Step 4 and Step 5 say "that digit was the tens digit" rather than just "the tens digit" —
tying back to Step 3's "that one digit" (which is the hundreds digit when delta = 100, per Step 2)
so the conditions cannot misfire in the delta = 100 branch, where the tens digit is irrelevant to
which digit is being moved. Verified all three branches by hand:
- Ordinary case (delta=10, tens digit not 9 while adding / not 0 while subtracting): Steps 4 and 5
  are vacuously true (their antecedents are false); Step 6 applies and is true (only the tens digit
  changes; ones never moves).
- Add-rollover (e.g. 395 + 10 = 405): Step 4's antecedent is true and its consequent is true
  (hundreds 3→4); Step 5 is vacuous; Step 6's "otherwise" correctly does not apply, and its
  unconditional second clause ("the ones digit never moves") is still true.
- Subtract-borrow (e.g. 305 − 10 = 295): Step 5's antecedent is true and its consequent is true
  (hundreds 3→2); Step 4 is vacuous; Step 6's "otherwise" correctly does not apply, second clause
  still true.
- delta = 100 (any n, any direction): Step 3 moves the hundreds digit, not the tens digit, so
  "that digit was the tens digit" is false in both Step 4 and Step 5 regardless of what the tens
  digit of n happens to be — both vacuous; Step 6 applies (hundreds is the only digit that
  changes, confirmed no delta=100 case ever rolls over given the generator's bounded n ∈
  [200,800] range) and its second clause holds.

**nbt8 template Step 3 (the unmet half of X1) — `nbt8-ten-or-hundred.ts:123`.** Round 1 added a
`rollover` hedge string, but it was grammatically attached only to the second sentence: `` `Step 3:
Only the ${place} change. The ${otherPlace} and the ones stay exactly where they are${rollover}.`
``. The leading sentence "Only the tens change." stood alone as an unqualified clause. At the
pinned seed 7 (n=207, tens digit 0, subtracting 10 → 197), the hundreds digit does change
(2 → 1), so that leading sentence was literally false in exactly the case the fix targeted.

Fixed by computing whether a rollover/borrow actually happens at the given `n`, mirroring the
pattern `nbt2-skip-count.ts` already uses:
```ts
const tensDigit = Math.floor(n / 10) % 10;
const crossesHundred = place === 'tens' && (isMore ? tensDigit === 9 : tensDigit === 0);
```
Step 3 is now a single computed string (`step3`) with three mutually exclusive branches — hundreds
place (never rolls over in this generator's bounded range, so a plain unconditioned sentence),
tens place with a rollover/borrow, and tens place without one — so the sentence printed is always
the one that actually happened, not a general claim with a hedge tacked onto a different sentence.
Removed the now-unused `otherPlace` variable (its only use was inside the old templated string).

Re-solved the pinned examples by hand against the new logic:
- Seed 7: n=207, delta=10, isMore=false. tensDigit = ⌊207/10⌋ mod 10 = 0. `isMore` is false, so
  the condition checks `tensDigit === 0` → true → `crossesHundred` = true → subtract-borrow branch:
  "The tens digit is already 0, so it borrows a ten from the hundreds — the hundreds change too,
  and the ones stay exactly where they are." Matches 207 (2 hundreds, 0 tens, 7 ones) → 197
  (1 hundred, 9 tens, 7 ones): hundreds changed, ones unchanged. Correct.
- Seed 123: n=673, delta=10, isMore=true. tensDigit = ⌊673/10⌋ mod 10 = 7. Condition checks
  `tensDigit === 9` → false → no-crossing branch: "Only the tens change. The hundreds and the ones
  stay exactly where they are." Matches 673 → 683: tens 7→8, hundreds and ones unchanged. Correct.

No pinned test covers `stepByStep[2]` (Step 3) at either seed — confirmed by grep before editing
(`grep -n "stepByStep\[" nbt8-ten-or-hundred.test.ts` shows only `stepByStep[1]` and
`stepByStep[3]` pinned) — so nothing needed re-capturing from a run; the existing pins continue to
pass unmodified because the fix didn't touch Steps 1, 2, or 4.

## Covering tests

- `src/curriculum/grade2/studyGuides.test.ts` — regression check that the NBT.8 guide still fills
  every section and cites no percentage/blueprint.
- `src/curriculum/grade2/templates/nbt8-ten-or-hundred.test.ts` — `assertTemplateSound` (300 runs,
  every seed), the determinism check, and both fixed-seed pins (7 and 123), none of which pin
  Step 3's text, so all pass unmodified against the new logic.
- Full `npx vitest run` — regression check for everything else.

## Commands and output

`npx vitest run src/curriculum/grade2`:
```
Test Files  27 passed (27)
     Tests  240 passed (240)
```

`npx tsc -b --noEmit`: clean, no output (also confirms removing `otherPlace` left no dangling
reference).

`npm run lint`: exit 0. Same pre-existing warnings as every prior run (ProgressContext.tsx,
QuizResults.tsx, AdaptiveSessionCard.test.tsx, WeakSpotsView.tsx) — no new warning from removing
`otherPlace`.

`npx vitest run` (full suite): **114 test files passed, 1209 tests passed**, 0 failed — same count
as after round 1 (no tests added or removed this round).

## Files changed (this round)

- `C:\Users\mswanson\Projects\ncmathssa\src\curriculum\grade2\studyGuides.ts`
- `C:\Users\mswanson\Projects\ncmathssa\src\curriculum\grade2\templates\nbt8-ten-or-hundred.ts`

## Commit

`5b4120b` — `fix: make every NBT.8 step true when subtracting 10 borrows (review round 2)`,
2 files changed, 25 insertions(+), 20 deletions(-). Staged explicitly (both paths named
individually, no `-A`). `graphify-out/` confirmed still untracked before and after the commit.

## Self-review

Traced all four cases (ordinary, add-rollover, subtract-borrow, delta=100) through both the study
guide's Step 4/5/6 and the template's `step3` branches by hand — no sentence is false in any case.
Re-solved both pinned template examples (207−10=197, 673+10=683) against the new branch logic and
confirmed they select the correct branch and produce the correct digit-change description. Grepped
for any other pin on the changed lines before editing (none found) rather than assuming and
re-capturing blind. Confirmed `otherPlace`'s removal left no unused-variable warning via a clean
`npm run lint` and `tsc` pass.
