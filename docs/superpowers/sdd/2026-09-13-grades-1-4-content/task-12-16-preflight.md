# Pre-flight audit: Tasks 12–16 (Grade 3)

Read-only audit, branch `feat/multi-grade-adaptive`. Method: the required mathematics for each
Grade 3 standard was derived from `src/curriculum/grade3/standards.ts` and re-checked against
`docs/sources/nc-standards-1-5.json` **before** the briefs were read; the briefs were then compared
to that derivation. Weights were derived from `docs/sources/nc-eog-blueprint.json`. Interfaces were
checked against the tree as it stands (Grade 4 MD/G work is in flight and was not treated as a
finding).

`src/curriculum/grade3/standards.ts` is verbatim-faithful to `nc-standards-1-5.json` for all 20
Grade 3 codes — every `description` matches the source `text` and every `keyConcepts` entry matches
a source `bullets` entry. So `standards.ts` is a safe proxy for the source throughout, and the
governing rule ("when a brief and `standards.ts` disagree, `standards.ts` wins") applies cleanly.

Grade 3 standard inventory (20): OA 1,2,3,6,7,8,9 · NBT 2,3 · NF 1,2,3,4 · MD 1,2,3,5,7,8 · G 1.
Blueprint bands, grade 3: OA 32–36% (34) · NBT 9–13% (11) · NF 28–32% (30) · MD+G 23–27% (25).

---

## Task 12 — Grade 3 Operations & Algebraic Thinking

### 12-1. A template for `NC.3.OA.8` contradicts the Content Contract and the Grade 4 precedent

1. **Brief says** (Step 4): "Templates for … two-step word problems with a fixed frame and fresh
   numbers (`NC.3.OA.8`)."
2. **Source says** — the plan's Content Contract, "Templates (seeded generators)":
   > "Reasoning standards, classification standards, and **multi-step word problems stay authored** —
   > there the wording carries the mathematics."
   And the landed Grade 4 precedent, `src/curriculum/grade4/templates/index.ts`:
   > "NC.4.OA.3 (two-step word problems) and NC.4.OA.5 (patterns) are authored for exactly that
   > reason: swapping the numbers in a two-step problem does not change what it teaches."
   `NC.3.OA.8` is "Solve **two-step** word problems…" — a multi-step word problem by definition.
3. **The contract is right.** The brief is a local instruction; the contract binds Tasks 5–26 and
   the analogous Grade 4 standard was already decided the other way in shipped code. A "fixed frame
   with fresh numbers" two-step generator produces the same problem with different digits, which is
   precisely what the contract rules out.
4. **Correction:** `NC.3.OA.8` stays authored. Drop the OA.8 template from Step 4. Task 16's
   `generated.length >= 10` still holds comfortably (see 16-3 note: 16 standards remain generated).
5. **Cost if wrong:** low. If OA.8 were in fact templatable, authoring it costs three hand-written
   items instead of one generator — a few hundred lines and no correctness risk. The reverse error
   (templating it) ships a standard whose practice value is fake variety.

### 12-2. The brief's two-step language invites division and order-of-operations, which `NC.3.OA.8` excludes

1. **Brief says** (Step 3): distractors include "applying the order of operations left to right in a
   two-step problem."
2. **Source says** (`NC.3.OA.8`, verbatim):
   > "Solve two-step word problems using **addition, subtraction, and multiplication**, representing
   > problems using equations with a symbol for the unknown number."
   No division. No parentheses. No mention of order of operations. CCSS 3.OA.8 says "using the four
   operations" and pairs with 3.OA.D.8's order-of-operations note — that is the Common Core version
   of this standard, and it is what an implementer working from recall will write.
3. **`standards.ts` is right.** This is the same defect class as the `NC.4.NBT.7` rounding incident:
   the brief's phrasing carries a Common Core feature NC dropped.
4. **Correction:** state explicitly in the brief that `NC.3.OA.8` two-step problems use **only +, −,
   and ×** — never division — and that the "order of operations" distractor must be expressed as
   *doing the two steps in the wrong order* (e.g. adding before multiplying in "buy 4 packs of 6,
   then give away 5"), not as a PEMDAS item. A bare expression item like `3 + 4 × 2` is not this
   standard.
5. **Cost if wrong:** medium-high. Division two-step items at Grade 3 are off-standard practice a
   child will not meet on the EOG, and a PEMDAS item is Grade 5 (`NC.5.OA.2`) content.

### 12-3. The "division is commutative" distractor cannot produce an offerable option

1. **Brief says** (Step 3): "treating division as commutative (`12 ÷ 3` answered as if `3 ÷ 12`)."
2. **Source says** — the Content Contract:
   > "Each incorrect option: **the value a student actually reaches** by making one named error,
   > with that error as its `misconception` tag and a `//` comment above it showing the arithmetic
   > that produces it."
   `3 ÷ 12` is `0.25`. A Grade 3 child has no decimals (`NC.3.NF` denominators are 2,3,4,6,8 and
   decimals do not appear until `NC.4.NF.6`), so `0.25` is not a value a Grade 3 student reaches and
   is not an option that can be printed.
3. **The contract is right.** As written the instruction forces the implementer to either print an
   out-of-grade decimal or invent a filler number and tag it with this misconception — the exact
   "mis-filed tag" the Global Constraints forbid.
4. **Correction:** replace with an error that *does* land on a whole number. For `12 ÷ 3`: answering
   with the divisor (`3`) or the dividend (`12`) because the child read "3 groups" as the answer;
   subtracting instead of dividing (`12 − 3 = 9`); or dividing into the wrong role of the
   equal-groups structure (12 shared among 3 answered as 3 shared among 12 → "not enough", recast as
   a picture-matching item). Name whichever is chosen in `misconceptions.ts` with its own tag.
5. **Cost if wrong:** medium. `assertAuthoredBankSound` will not catch a plausible-looking filler
   number; it only checks that a tag exists. A mis-filed tag tells a parent their child made an
   error they did not make.

### 12-4. Five templates for five standards that all reduce to one bare fact

1. **Brief says** (Step 4): "Templates for the computational standards — the multiplication and
   division facts and their relationship (`NC.3.OA.1`, `NC.3.OA.2`, `NC.3.OA.3`, `NC.3.OA.6`,
   `NC.3.OA.7`)."
2. **Source says** — the four standards are *not* the same task:
   - `NC.3.OA.1`: "**Interpret** the factors as representing the number of equal groups and the
     number of objects in each group"; "**Illustrate and explain** strategies including arrays,
     repeated addition, decomposing a factor…"
   - `NC.3.OA.2`: the same, for divisor and quotient.
   - `NC.3.OA.3`: "Solve multiplication **word problems**… Represent the problem using arrays,
     pictures, and/or equations with a symbol for the unknown number."
   - `NC.3.OA.6`: "Solve an **unknown-factor** problem, by using division strategies and/or changing
     it to a multiplication problem."
   - `NC.3.OA.7`: "Demonstrate **fluency**… Know from memory all products with factors up to and
     including 10."
   And the Grade 4 template index states the operating rule: *"One template, one skill … a review
   key is seedless"* — two templates that can emit the same question let a child who failed one
   skill be reviewed and retired on another.
3. **`standards.ts` is right.** Only `NC.3.OA.7` is bare-fact recall. A generator that prints
   "What is 6 × 7?" satisfies OA.7 and nothing else; if OA.1, OA.2, OA.3 and OA.6 get generators of
   the same shape, four standards share one question and the mastery scheduler is measuring one
   skill under five review keys.
4. **Correction:** specify the distinct question *shape* per generator in the brief:
   - OA.1 — an array/equal-groups picture described in `promptDetails`; ask which expression
     matches, or how many groups/how many in each group. Not a bare product.
   - OA.2 — the same for sharing/grouping division, **with a one-digit divisor and a one-digit
     quotient** (see 12-5).
   - OA.3 — a one-step word problem with fresh numbers (word problems that are *one*-step are not
     excluded by the contract, only multi-step ones).
   - OA.6 — an equation with the factor missing: `6 × ? = 42`.
   - OA.7 — bare fluency, both directions.
   Additionally require `assertNoGeneratorDuplicatesAuthored` in each OA bank test (see 12-7).
5. **Cost if wrong:** high, and silent. Every template test passes; the damage appears only as a
   child being served the same question under five standards and being marked mastered in all five.

### 12-5. `NC.3.OA.2`'s number range is never stated

1. **Brief says:** nothing about the range for division.
2. **Source says** (`NC.3.OA.2`): "…whole-number quotients of whole numbers with a **one-digit
   divisor and a one-digit quotient**." `NC.3.OA.7` likewise caps "factors, quotients and divisors
   up to and including 10." So the largest dividend at this standard is 81 (9 × 9), and 100 ÷ 4 is
   out of range even though it is "easy".
3. **`standards.ts` is right** and the brief is silent, which for a generator means the implementer
   picks the range.
4. **Correction:** state that OA.1/OA.2/OA.6/OA.7 generators draw factors, divisors and quotients
   from 1–10 inclusive, and that dividends are therefore at most 100 (10 × 10) with both divisor and
   quotient single-digit for OA.2.
5. **Cost if wrong:** low-medium. Out-of-range items are unfairly hard but not conceptually wrong;
   the Content Contract makes "numbers within the standard's stated range" part of correctness.

### 12-6. `NC.3.OA.9` omits the hundreds board

1. **Brief says** (Step 4): "`NC.3.OA.9` (patterns in the multiplication table) is a reasoning
   standard and stays authored."
2. **Source says** (`NC.3.OA.9`): "Interpret patterns of multiplication on a **hundreds board
   and/or** multiplication table."
3. **`standards.ts` is right.** The "stays authored" ruling is correct; the description is
   incomplete.
4. **Correction:** the OA.9 bank should include at least one hundreds-board item alongside the
   multiplication-table items, and the brief should say "hundreds board and/or multiplication
   table".
5. **Cost if wrong:** low. Three table items still cover the standard's main idea; the hundreds
   board is a representation NC names explicitly and EOG items use.

### 12-7. No guard against a generator reproducing an authored item

1. **Brief says** (Step 1): the OA test file is three lines, `assertAuthoredBankSound` only.
2. **Source says** — `src/curriculum/authoredBank.testkit.ts` also exports
   `assertNoGeneratorDuplicatesAuthored`, and the landed `grade4/authored.nf.test.ts` uses it with
   this rationale:
   > "An item a generator can also produce reaches the scheduler under two review keys —
   > {authored, id} and {generated, templateId} — and a child is served it twice."
3. **The Grade 4 precedent is right.** Grade 3 OA is the *worst* case in the plan: five of seven
   standards would carry both an authored bank and a generator over a tiny number space (factors
   1–10 gives 100 products total), so collisions are near-certain, not hypothetical.
4. **Correction:** add to `authored.oa.test.ts` (and to the NBT/NF/MD banks in Tasks 13–14 wherever
   the same standard has both):
   ```ts
   it('shares no question with the generators', () => {
     assertNoGeneratorDuplicatesAuthored(GRADE_3_OA_AUTHORED, GRADE_3_TEMPLATES);
   });
   ```
   Note the import cycle risk: this makes `authored.oa.test.ts` import `./templates`, which Task 12
   also creates — fine within one task, but Tasks 13/14 must re-run it after appending.
5. **Cost if wrong:** medium. Nothing goes red; the symptom is duplicate practice and inflated
   mastery.

### 12-8. Template `id` convention is right; authored item `id` convention is not stated

1. **Brief says:** "Templates named `g3.oa<tail>.<slug>`." Authored item ids: unstated.
2. **Source says** — landed Grade 4 template ids are `g4.oa1.times-as-many`, `g4.nbt4.add` (dots),
   so the template convention checks out. Landed Grade 4 **item** ids are `g4-nf1-01` (hyphens),
   while the plan's Content Contract writes them with a dot: "`g4.nf1-01`, `g3.oa7-02`".
3. **The landed code is right** for the purposes of Grade 3: Grade 3 must match the grade that
   precedes it in the tree, and Grade 4's ids are already committed. This matters because Task 16
   asserts a prefix — see finding 16-1, where the mismatch becomes a red test.
4. **Correction:** state in Task 12 that authored item ids are `g3-oa1-01` style (hyphen after the
   grade), matching `grade4/authored.*.ts`, and fix Task 16's assertion to `startsWith('g3-')`.
5. **Cost if wrong:** low to fix, certain to bite. Whichever convention is chosen, Task 16's test
   must agree with it.

### 12-9. `templates/index.test.ts` is never specified

1. **Brief says** (Step 4): "Create `src/curriculum/grade3/templates/index.ts` exporting
   `GRADE_3_TEMPLATES`. Each template gets a sibling test…" — a test for the index itself is not
   mentioned in any of Tasks 12–16.
2. **Source says** — `grade4/templates/index.test.ts` exists and is the only place that asserts
   template id uniqueness, that every template points at a real standard of the grade, and that
   every generated distractor's tag is declared.
3. **The Grade 4 precedent is right.** Per-template tests cannot see id collisions across files.
4. **Correction:** Task 12 also creates `src/curriculum/grade3/templates/index.test.ts` mirroring
   `grade4/templates/index.test.ts` (unique ids, real Grade 3 codes, declared misconceptions,
   `assertTemplateSound` over each). Tasks 13 and 14 add to `templates/index.ts` and re-run it.
5. **Cost if wrong:** medium. A template file that never gets imported into `index.ts` is invisible
   to the app but still visible to `allContent.ts` — so it can pass the misconception test while
   serving nothing.

**Task 12 findings: 9.**

---

## Task 13 — Grade 3 Base Ten and Fractions

### 13-1. One template spanning `NC.3.NF.3` and `NC.3.NF.4` will generate a Grade 4 comparison

1. **Brief says** (Step 4): "…and for **equivalence and comparison** (`NC.3.NF.3`, `NC.3.NF.4`)."
2. **Source says** (`NC.3.NF.4`, verbatim):
   > "Compare two fractions **with the same numerator or the same denominator** by reasoning about
   > their size, using area and length models, and using the >, <, and = symbols. Recognize that
   > comparisons are valid only when the two fractions refer to the same whole **with denominators:
   > halves, fourths and eighths; thirds and sixths**."
   Comparing two fractions that share *neither* numerator nor denominator — 2/3 vs 3/4 — is
   `NC.4.NF.2` ("Compare two fractions with different numerators and different denominators"), and
   there is already a landed generator for it: `grade4/templates/nf2-order-fractions.ts`.
3. **`standards.ts` is right.** This is the Task-8 defect class repeating: a brief phrase that
   quietly imports the next grade's skill. A general fraction comparator is the single most natural
   thing to write from the words "equivalence and comparison", and it is Grade 4 content.
4. **Correction:** split into two templates and constrain both.
   - `g3.nf3.equivalent-fraction` — draws only from the *related* families the standard names:
     {2, 4, 8} and {3, 6}. Legal: 1/2 = 2/4 = 4/8, 1/3 = 2/6. Illegal: anything involving 5, 10, 12,
     100.
   - `g3.nf4.compare` — draws two fractions that share a numerator **or** share a denominator,
     denominators again from {2,4,8} ∪ {3,6}, and prints the answer with `>`, `<` or `=`.
   Add a file comment on `g3.nf4.compare` naming the exclusion and why.
5. **Cost if wrong:** high. A Grade 3 child drilling 2/3 vs 3/4 is being taught a strategy
   (cross-multiplying or common denominators) NC does not introduce for another year, and the
   distractor set for that item is a Grade 4 distractor set.

### 13-2. The denominator set for `NC.3.NF.1`/`NC.3.NF.2` is never stated

1. **Brief says** (Step 4): "for identifying a unit fraction of a whole (`NC.3.NF.1`), for locating a
   fraction on a number line (`NC.3.NF.2`)" — no denominators named.
2. **Source says** (`NC.3.NF.1` and `NC.3.NF.2`, both): "…with denominators of **2, 3, 4, 6, and 8**."
   Fifths, tenths, twelfths and hundredths are Grade 4 (`NC.4.NF.1`/`NC.4.NF.6`).
3. **`standards.ts` is right.** A generator drawing "a denominator between 2 and 10" produces 1/5,
   1/7, 1/9, 1/10 — four of nine draws off-standard.
4. **Correction:** state `DENOMINATORS = [2, 3, 4, 6, 8] as const` in the brief for NF.1, NF.2, and
   as the superset for NF.3/NF.4 (which narrow it further per 13-1). Make the per-template test
   sweep the whole draw space and assert every emitted denominator is in the set.
5. **Cost if wrong:** medium-high. Off-standard number ranges are practice a child cannot use, and
   for fractions specifically the denominator set is the standard's whole boundary.

### 13-3. `NC.3.NF.3` is described as equivalence only; two of its three bullets are dropped

1. **Brief says** (Steps 3–4): NF.3 appears only as "equivalence".
2. **Source says** (`NC.3.NF.3` bullets):
   > "Composing and decomposing fractions into equivalent fractions using related fractions: halves,
   > fourths and eighths; thirds and sixths."
   > "**Explaining that a fraction with the same numerator and denominator equals one whole.**"
   > "**Expressing whole numbers as fractions, and recognizing fractions that are equivalent to
   > whole numbers.**"
3. **`standards.ts` is right.** Two thirds of this standard — 4/4 = 1, and 3 = 6/2 — is absent from
   the brief. With a three-item floor an implementer who reads only the brief writes three
   equivalence items and calls the standard covered.
4. **Correction:** require the NF.3 authored bank to cover all three bullets — at least one item on
   "same numerator and denominator = one whole" and at least one on whole numbers written as
   fractions — and keep the generator to the composing/decomposing bullet only.
5. **Cost if wrong:** medium. The standard is marked covered by `allStandardsWithContent()` while a
   third of what it asks is untested; nothing goes red.

### 13-4. `NC.3.NBT.3`'s range cap (multiples of 10 in 10–90) is never stated

1. **Brief says:** "a one-digit number times a multiple of 10 (`NC.3.NBT.3`)".
2. **Source says** (`NC.3.NBT.3`, verbatim): "…to find the product of a one-digit whole number by a
   multiple of 10 **in the range 10–90**."
3. **`standards.ts` is right.** "A multiple of 10" unqualified admits 100, 200, 500; the standard
   stops at 90, so the largest legal product is 9 × 90 = 810.
4. **Correction:** state the generator draws the multiple from {10, 20, …, 90} and the other factor
   from 1–9.
5. **Cost if wrong:** low-medium. Products past 810 are not harder in kind, but they cross into
   `NC.4.NBT.5` territory and exceed the stated range, which the Content Contract makes a
   correctness matter.

### 13-5. `NC.3.NBT.2`'s three bullets are reduced to two arithmetic slips

1. **Brief says** (Step 3): "Grade 3 NBT is only addition and subtraction within 1,000
   (`NC.3.NBT.2`)… Losing a regrouping across a zero, and multiplying the tens digit while dropping
   its place, are the two errors worth naming."
2. **Source says** (`NC.3.NBT.2` bullets):
   > "**Use estimation strategies to assess reasonableness of answers.**"
   > "Model and explain how the relationship between addition and subtraction can be applied to
   > solve addition and subtraction problems."
   > "**Use expanded form to decompose numbers and then find sums and differences.**"
3. **`standards.ts` is right.** NBT.2 at NC is not "do the algorithm"; it is estimation,
   inverse-operation reasoning, and expanded-form decomposition. A bank of three
   compute-the-sum items covers none of the three bullets as *stated*.
4. **Correction:** require at least one estimation-for-reasonableness item ("Which is the best
   estimate of 487 + 296?"), at least one expanded-form item, and one inverse-relationship item, in
   addition to whatever the generator produces. Keep the generator on straight computation.
5. **Cost if wrong:** medium. `NC.3.NBT.2` carries most of an 9–13% band on its own (NBT has two
   standards), and estimation items are a recognizable EOG shape.

### 13-6. "Reading `1/4` as 'one and four'" cannot be a distractor on a numeric item

1. **Brief says** (Step 3): name the misconception "reading `1/4` as 'one and four'".
2. **Source says** — the Content Contract: every incorrect option is "**the value a student actually
   reaches**". There is no numeric value corresponding to "one and four"; as a tag on a numeric
   four-option item it has no arithmetic to show in the required `//` comment.
3. **The contract is right,** though the misconception itself is real and worth naming.
4. **Correction:** keep the tag but bind it to an item shape where it *is* reachable — a
   model-matching item ("Which picture shows 1/4?") whose distractor is the picture showing 1 whole
   and 4 parts, or 4 wholes; or a number-line item where the distractor is the point at 1.4 / at
   tick 4. Say so in the brief so the implementer does not attach it to "What is 1/4 of 8?".
5. **Cost if wrong:** medium. This is exactly the mis-filed tag the Global Constraints call worse
   than no tag.

### 13-7. Verified correct and worth preserving: the "nothing else" clause

The brief's sentence "Grade 3 NBT is only addition and subtraction within 1,000 (`NC.3.NBT.2`) and a
one-digit number times a multiple of 10 (`NC.3.NBT.3`) — **nothing else**" is accurate and is doing
real work: it forecloses CCSS 3.NBT.1 (rounding to the nearest 10 or 100), which NC does not have at
any grade in this plan. Keep the sentence and, if anything, make the exclusion explicit ("in
particular, no rounding") so the next reader does not have to infer it.

**Task 13 findings: 6 defects + 1 confirmation.**

---

## Task 14 — Grade 3 Measurement, Geometry, and the authored aggregate

### 14-1. **`NC.3.MD.2` is customary measurement. The brief asks for "mass or volume" — the Common Core metric version.** (most serious finding)

1. **Brief says** (Step 4): "Templates for elapsed time and **mass or volume** word problems
   (`NC.3.MD.1`, `NC.3.MD.2`)."
2. **Source says** (`NC.3.MD.2`, verbatim from `nc-standards-1-5.json`):
   > "Solve problems involving **customary measurement**."
   > • "Estimate and measure **lengths in customary units to the quarter-inch and half-inch, and
   >   feet and yards to the whole unit**."
   > • "Estimate and measure **capacity and weight in customary units** to a whole number: **cups,
   >   pints, quarts, gallons, ounces, and pounds**."
   > • "Add, subtract, multiply, or divide to solve one-step word problems involving whole number
   >   measurements of length, weight, and capacity **in the same customary units**."
   CCSS 3.MD.A.2 is "Measure and estimate liquid volumes and **masses** of objects using standard
   units of **grams (g), kilograms (kg), and liters (l)**." The words "mass" and "volume" in the
   brief are CCSS's vocabulary, not NC's. NC's metric work is Grade 4 (`NC.4.MD.1`, already landed as
   `grade4/templates/md2-metric-convert.ts`).
3. **`standards.ts` is right.** This is the `NC.4.NBT.7`-rounding defect in its purest form: two
   words of recall-sourced vocabulary that redirect a whole standard to another curriculum and
   another grade. An implementer told to write "mass or volume word problems" writes grams,
   kilograms and liters, and Grade 3 ships with no cups, pints, quarts, gallons, ounces or pounds at
   all.
4. **Correction:** rewrite the Step 4 line as "**customary capacity and weight** word problems
   (`NC.3.MD.2`) — cups, pints, quarts, gallons, ounces, pounds, kept in the *same* unit within one
   problem" and add the length strand (14-2). Forbid grams, kilograms, liters, meters and
   centimeters anywhere in the Grade 3 MD bank; consider a test asserting no Grade 3 MD prompt
   matches `/\b(gram|kilogram|kg|liter|litre|centimeter|meter|milliliter)\b/i`.
5. **Cost if wrong:** highest of any finding here. If it is wrong (i.e. NC really did want metric),
   the cost is rewriting one template and three items. If it ships uncorrected, an entire standard
   inside a 23–27% band teaches units North Carolina does not assess at Grade 3, and — as with the
   Task 8 line-plot defect — it is a *Grade 4* skill written as Grade 3 content.

### 14-2. `NC.3.MD.2`'s length strand is missing entirely

1. **Brief says:** MD.2 appears only as "mass or volume".
2. **Source says** (first bullet): "Estimate and measure lengths in customary units **to the
   quarter-inch and half-inch**, and **feet and yards** to the whole unit."
3. **`standards.ts` is right.** Measuring to the quarter-inch on a ruler is a distinct, very
   assessable Grade 3 skill and is a third of this standard.
4. **Correction:** require at least one authored MD.2 item on reading a length to the nearest
   quarter- or half-inch (a ruler described in `promptDetails`), and at least one on feet/yards.
5. **Cost if wrong:** medium. Same silent-coverage problem as 13-3.

### 14-3. The Geometry misconception is `CCSS 3.G.2`, a standard NC does not have

1. **Brief says** (Step 3): "Errors are definitional: calling a shape a rectangle because it 'looks
   like one' rather than by its right angles; **partitioning a shape into unequal parts and calling
   each a quarter**."
2. **Source says** (`NC.3.G.1`, the *only* Grade 3 Geometry standard, verbatim):
   > "Reason with two-dimensional shapes and their attributes."
   > • "Investigate, describe, and reason about composing triangles and quadrilaterals and
   >   decomposing quadrilaterals."
   > • "Recognize and draw examples and non-examples of types of quadrilaterals including rhombuses,
   >   rectangles, squares, parallelograms, and trapezoids."
   Partitioning a shape into equal-area parts and naming each part a unit fraction of the whole is
   CCSS 3.G.A.2. It is not in `nc-standards-1-5.json` at Grade 3 in any domain; the nearest NC
   analogue is `NC.3.NF.1` ("quantities formed when a whole is partitioned into equal parts"), which
   is a Fractions standard, not Geometry.
3. **`standards.ts` is right.** The first named error (rectangle by appearance, not right angles) is
   squarely on-standard. The second is not.
4. **Correction:** replace the partition error with one `NC.3.G.1` actually produces — e.g. calling a
   rhombus "not a parallelogram" because it is tilted; believing a square is not a rectangle;
   naming a trapezoid a parallelogram; composing two triangles and mis-naming the quadrilateral
   formed. If the partitioning misconception is wanted, file it under `NC.3.NF.1` in Task 13, not
   under G.
5. **Cost if wrong:** high and structurally awkward. `integrity.test.ts` ("has no content
   referencing a standard outside this grade") would catch a wrong *code*, but an on-code item
   testing off-standard mathematics passes every test. G is a one-standard domain, so a third of a
   three-item bank being off-standard is a third of the whole Geometry share.

### 14-4. The elapsed-time template must stay within the same hour

1. **Brief says** (Step 4): "Templates for **elapsed time**…(`NC.3.MD.1`)".
2. **Source says** (`NC.3.MD.1`, verbatim): "Tell and write time to the nearest minute. Solve word
   problems involving addition and subtraction of time intervals **within the same hour**."
3. **`standards.ts` is right.** "Elapsed time" unqualified is the Grade 4 skill (`NC.4.MD.2`
   includes intervals of time in multi-step problems). A generator that adds 45 minutes to 2:40 and
   crosses to 3:25 is out of standard at Grade 3.
4. **Correction:** the MD.1 generator draws a start time and a duration such that start + duration
   stays inside the same clock hour, and the file comment states the constraint by construction (as
   `md5-prism-volume.ts` does) rather than resampling in a loop. Also require at least one plain
   "tell the time to the nearest minute" item, which is the first half of the standard and which an
   elapsed-time-only template omits.
5. **Cost if wrong:** medium. Crossing the hour is the harder skill and a child metered as failing
   MD.1 may be failing a Grade 4 skill.

### 14-5. `NC.3.MD.5` and `NC.3.MD.7` are templated as one line and will collide

1. **Brief says** (Step 4): "Templates for **area by tiling and by multiplication** (`NC.3.MD.5`,
   `NC.3.MD.7`)."
2. **Source says** — these are deliberately different standards:
   - `NC.3.MD.5`: "Find the area of a rectangle with whole-number side lengths **by tiling without
     gaps or overlaps and counting unit squares**."
   - `NC.3.MD.7`: "Relate area to the operations of multiplication and addition", whose third bullet
     is "…the area of a rectangle can be found by **partitioning it into two smaller rectangles**,
     and that the area of the large rectangle is the **sum of the two smaller rectangles**"
     (the distributive property, area model).
   And the Grade 4 index states the rule: "One template, one skill — a review key is seedless."
3. **`standards.ts` is right.** "6 × 4 = 24 square units" satisfies both standards as a string and
   neither as a skill. MD.5 must show a tiled figure and ask for a count; MD.7's distinctive content
   is the two-rectangle decomposition, which the brief never mentions.
4. **Correction:** two templates with disjoint shapes — `g3.md5.tile-count` (figure described in
   `promptDetails`, answer is a count of unit squares) and `g3.md7.area-multiply` — plus at least one
   authored MD.7 item on partitioning a rectangle into two smaller rectangles and summing their
   areas. Guard with `assertNoGeneratorDuplicatesAuthored`.
5. **Cost if wrong:** medium-high, and silent for the same reason as 12-4.

### 14-6. `NC.3.MD.8`'s unknown-side-length half is unmentioned

1. **Brief says** (Step 4): "and for perimeter (`NC.3.MD.8`)".
2. **Source says** (`NC.3.MD.8`): "Solve problems involving perimeters of polygons, including
   finding the perimeter given the side lengths, **and finding an unknown side length**."
3. **`standards.ts` is right.** The inverse direction is named in the standard's own text and is the
   harder, more assessed half.
4. **Correction:** the MD.8 generator alternates between the two directions, or two templates are
   written (given-sides → perimeter; given-perimeter → missing side). The latter is preferable under
   the one-template-one-skill rule since the two go wrong differently.
5. **Cost if wrong:** low-medium.

### 14-7. The aggregate tests live in the wrong file, and `authored.test.ts` is never created

1. **Brief says** (Step 1): `authored.g.test.ts` contains both the Geometry bank assertions **and**
   the `GRADE_3_AUTHORED` aggregate assertions; the Files list creates `authored.ts` but no
   `authored.test.ts`.
2. **Source says** — the Grade 5 precedent is `src/curriculum/grade5/authored.test.ts`, a file whose
   name says what it tests; and the plan's File Structure section lists `authored.ts` as "a thin
   aggregator" alongside per-domain files "each with a sibling test".
3. **The precedent is right,** though this is structural rather than mathematical. A future Task 17+
   reader looking for the aggregate's coverage test will not find it under `authored.g`.
4. **Correction:** move the two aggregate `describe` blocks into a new
   `src/curriculum/grade3/authored.test.ts` and add it to the Files list. Behaviour is identical;
   only the filename changes.
5. **Cost if wrong:** very low. Purely locational.

### 14-8. Verified correct: MD.3 and G.1 stay authored

"`NC.3.MD.3` (scaled graphs) and `NC.3.G.1` (shape classification) stay authored: a generated bar
graph is a figure, not a number, and shape classification is vocabulary" — correct and consistent
with the Content Contract's "reasoning standards, classification standards … stay authored" and with
Grade 4's treatment of `NC.4.OA.5`. The MD.3 note is also faithful to the standard's own "one and
two-step 'how many more' and 'how many less' problems … with axes provided".

**Task 14 findings: 7 defects + 1 confirmation.**

---

## Task 15 — Grade 3 study guides

### 15-1. The combined-band test forbids the very figure the Content Contract requires

1. **Brief says** — Step 3: "for MD and G it **may cite no percentage at all**", enforced by the
   third test:
   ```ts
   expect(
     /\d+\s*[-–]\s*\d+\s*%|\b\d+\s*%/.test(g.workedExample.whyItMattersForSSA),
     `${code} cites a percentage for a domain that shares a band`,
   ).toBe(false);
   ```
   i.e. **any** percentage anywhere in an MD or G guide fails the suite.
2. **Source says** — the plan's Content Contract, "Study guides":
   > "`whyItMattersForSSA` **must cite a real figure** — the domain's blueprint band for grades 3–5,
   > or the domain's share of the grade's standards for grades 1–2 — and **never a weight for a
   > single domain inside a combined band**."
   And the Global Constraints: "Both domains carry the same `officialWeightRange` … plus
   `weightGroup: 'MD+G'`". `weightLabel()` in `registry.ts` already renders the correct form:
   `'23–27% (Measurement & Data and Geometry combined)'`. The existing `registry.test.ts` asserts
   exactly that string shape for Grade 5.
3. **The Content Contract is right.** The prohibition is on *attributing* the band to one domain,
   not on naming the band. As written the brief's test makes the correct sentence — "Measurement &
   Data and Geometry together are 23–27% of the NC End-of-Grade test" — a test failure, and pushes
   seven of twenty guides (six MD + one G) into having no figure at all, which violates the "must
   cite a real figure" clause.
4. **Correction:** replace the third test with one that checks *attribution*, not presence:
   ```ts
   it('cites a combined band only as a combined band', () => {
     for (const [code, g] of Object.entries(GRADE_3_STUDY_GUIDES)) {
       if (!grouped.has(code)) continue;
       const why = g.workedExample.whyItMattersForSSA;
       const pcts = why.match(/\d+\s*[-–]\s*\d+\s*%|~?\d+\s*%/g) ?? [];
       for (const p of pcts) {
         expect(p.replace(/^~/, ''), `${code} cites ${p}, not the MD+G band`).toBe('23–27%');
       }
       if (pcts.length) {
         expect(/combined|together/i.test(why), `${code} cites 23–27% without saying it is shared`)
           .toBe(true);
       }
     }
   });
   ```
   and change Step 3 to: "for MD and G, cite **23–27%, and say in the same sentence that the figure
   covers Measurement & Data and Geometry together**." Note the en dash: `standards.ts` and the
   blueprint both use `–` (U+2013), not `-`, so the literal must match.
5. **Cost if wrong:** medium. If the test is left as written, the suite is green but seven guides
   carry no SSA figure, which is the contract violation the whole `whyItMattersForSSA` rule exists
   to prevent — and it is the second time the MD/G band has caused a fabricated or missing figure in
   this codebase (see the `integrity.test.ts` comment about Grade 5's "seventeen invented
   per-standard shares").

### 15-2. The "fills every section" test lets `rulesAndFormulas` be empty strings

1. **Brief says:** `expect(g.rulesAndFormulas.length).toBeGreaterThan(0)`.
2. **Source says** — `StudyGuideSection.rulesAndFormulas` is `{ label: string; detail: string }[]`.
   An array containing `{ label: '', detail: '' }` has length 1 and passes.
3. **The interface is right;** the assertion is weaker than the neighbouring ones, which *do* check
   `.trim().length` on every scalar field. Under check E this is an assertion that can be satisfied
   without doing the thing it is meant to verify.
4. **Correction:** add, inside the same loop:
   ```ts
   for (const r of g.rulesAndFormulas) {
     expect(r.label.trim().length, `${code} rule label`).toBeGreaterThan(0);
     expect(r.detail.trim().length, `${code} rule detail`).toBeGreaterThan(0);
   }
   ```
   Same for `stepByStepMethod`, `commonTraps` and `workedExample.steps`, which are `string[]` and
   currently only length-checked.
5. **Cost if wrong:** low. It costs six lines; without them a placeholder guide ships green.

### 15-3. Verified correct: the three single-domain band figures

Step 3's "For OA, NBT, and NF standards `whyItMattersForSSA` may cite **32–36%, 9–13%, and 28–32%**
respectively" matches `nc-eog-blueprint.json` grade 3 exactly (`OA 32–36% / 34`, `NBT 9–13% / 11`,
`NF 28–32% / 30`), and all three are ungrouped domains with bands of their own, so citing them
directly is correct. "One entry for each of the **20** Grade 3 standards" is also correct
(7 + 2 + 4 + 6 + 1 = 20).

**Task 15 findings: 2 defects + 1 confirmation.**

---

## Task 16 — Register Grade 3

### 16-1. `id.startsWith('g3.')` will fail against the id convention Grade 4 actually shipped

1. **Brief says** (Step 1):
   ```ts
   expect(id.startsWith('g3.'), `quiz ${q.id} carries non-grade-3 item ${id}`).toBe(true);
   ```
2. **Source says** — landed `src/curriculum/grade4/authored.nf.ts` uses `id: 'g4-nf1-01'`,
   `'g4-nf1-02'`, … (hyphen). Template ids use dots (`g4.nf1.equivalent-fraction`), but quiz
   `questionIds` are **authored item** ids — `integrity.test.ts` requires it:
   > "defines quizzes that only reference this grade's own questions" … builds its id set from
   > `c.source.authoredFor(s.code)`.
   The plan's Content Contract writes item ids with a dot (`g3.oa7-02`), so the plan, the landed
   code, and this test are three-way inconsistent. Task 11's brief carries the identical bug with
   `'g4.'`.
3. **The landed Grade 4 code wins** for Grade 3's purposes: Grade 3 should look like the grade
   beside it in the tree, and renaming Grade 4's ids is out of scope.
4. **Correction:** Grade 3 authored ids are `g3-oa1-01` style (fix this in Task 12 per 12-8), and
   Task 16's assertion becomes `id.startsWith('g3-')`. Flag the same fix to whoever runs Task 11.
5. **Cost if wrong:** low to fix, certain to occur. Every quiz id in the file fails the test; the
   implementer's likely "fix" is to rename Grade 3's items to `g3.` and leave Grade 3 inconsistent
   with Grade 4 forever.

### 16-2. Registering Grade 3 turns two existing assertions in `registry.test.ts` red, and the brief neither lists the file nor expects the failure

1. **Brief says** — Files: "Modify: `src/curriculum/registry.ts`" only. Step 6: "Run:
   `npm test -- --run`. Expected: PASS."
2. **Source says** — `src/curriculum/registry.test.ts`, as it stands on this branch:
   ```ts
   it('throws for a grade with no curriculum module', () => {
     // Grades 1-4 are a later plan; asking for one must fail loudly...
     expect(() => getCurriculum(3)).toThrow(/no curriculum/i);
   });

   it('lists only grades that actually have modules', () => {
     expect(listCurricula().map((c) => c.grade)).toEqual([5]);
   });
   ```
   The first names grade **3** specifically and cannot survive Task 16. The second is already
   invalidated by Task 11 (Grade 4), so by Task 16 it will read `[4, 5]` and must become `[3, 4, 5]`.
3. **`registry.test.ts` is right to have existed and is now stale.** The brief's "Expected: PASS" is
   wrong: the suite will be red at Step 6 through no fault of the Grade 3 content.
4. **Correction:** add `src/curriculum/registry.test.ts` to Task 16's Files ("Modify"), and specify
   the two edits: change the throw case to a grade that still has no module (grade 1 or 2, until
   their own registration tasks), and update the `listCurricula()` expectation to `[3, 4, 5]`.
   Also note in Step 6 that `integrity.test.ts` and `sourcedStandards.test.ts` now run Grade 3
   through the full `describe.each`, and that any failure there is a real Grade 3 finding — the same
   warning Task 11 Step 6 carries and Task 16's does not.
5. **Cost if wrong:** medium. An implementer hitting an unexpected red suite at the last step of a
   five-task batch will either edit the test without understanding it or start debugging Grade 3
   content that is fine.

### 16-3. The mock SSA allocation puts MD+G outside its published band

1. **Brief says** (Step 3): "`g3-mock-ssa-01`, roughly 28 items allocated by band — about **9 OA,
   3 NBT, 8 NF, and 8 across MD and Geometry together**."
2. **Source says** (`nc-eog-blueprint.json`, grade 3): OA 32–36%, NBT 9–13%, NF 28–32%,
   MD+G 23–27%. Against 28 items: 9/28 = 32.1% OA (just inside), 3/28 = 10.7% NBT (inside),
   8/28 = 28.6% NF (inside), **8/28 = 28.6% MD+G — above the 23–27% band**. The four numbers also
   sum to 28, so the overshoot is not a rounding artifact of the total.
3. **The blueprint is right.** The brief's own weight note in Task 14 says "MD and Geometry share one
   23–27% band"; a mock assessment that over-weights it by 1.6 points misrepresents the test it
   simulates, and it does so at the expense of OA, the largest band.
4. **Correction:** **10 OA, 3 NBT, 8 NF, 7 MD+G = 28.** That gives 35.7% / 10.7% / 28.6% / 25.0%,
   every one inside its band and MD+G exactly on its midpoint. Within the 7 MD+G items, split by
   `domainWeight()` rather than by hand: MD holds 6 of the group's 7 standards and G holds 1, so 6
   MD + 1 G. Never sum raw midpoints to check this — 34 + 11 + 30 + 25 + 25 = 125; the correct total
   comes from `domainWeight()`, which splits the group band by standard count (MD 21.43, G 3.57).
5. **Cost if wrong:** medium. The mock SSA is the artifact a parent reads as "this is what the test
   looks like"; a band-inaccurate simulation is a claim about a published document that the document
   does not support.

### 16-4. `domainId` on module drills and `isMockAssessment` on the mock are not specified

1. **Brief says** (Step 3): "five module drills `g3-mod-oa-01`, … `g3-mod-g-01`; and
   `g3-mock-ssa-01`" — no `domainId`, no `isMockAssessment`.
2. **Source says** — `QuizDefinition` in `src/types/index.ts` carries `domainId?: DomainId`
   ("Undefined if comprehensive / multi-domain") and `isMockAssessment?: boolean`. Task 11's brief
   for the identical Grade 4 work says "One module drill per domain … **each with its `domainId`
   set**".
3. **The type and the Task 11 precedent are right.** These fields are optional to the compiler, so
   omitting them is silent; a module drill with no `domainId` is indistinguishable from a
   comprehensive quiz to any UI that filters on it.
4. **Correction:** state that each `g3-mod-*` drill sets `domainId` to its domain, and that
   `g3-mock-ssa-01` sets `isMockAssessment: true`. Also require the diagnostic's `subtitle` to be a
   function of the curriculum — the brief says "subtitle a function of the curriculum", which is
   correct and matches `GRADE_5_QUIZZES`' Ruling F11 comment; keep that wording.
5. **Cost if wrong:** low-medium. No test catches it; the symptom is a drill that filters to nothing.

### 16-5. Verified correct: the module literal, the blueprint source string, the totals, and the flag/registration pairing

- Every field of the `GRADE_3` literal matches `GradeCurriculum` in `src/curriculum/types.ts`
  (`grade`, `label`, `ssa`, `weighting`, `contentComplete`, `domains`, `studyGuides`, `quizzes`,
  `source`) with nothing missing and nothing invented.
- `weighting.source: 'NCDPI EOG Mathematics Grades 3-8 Test Specifications, April 2026'` is the
  `source` string in `nc-eog-blueprint.json`, character for character. (Grade 5's landed module uses
  an older string; nothing asserts the two match, so this is not a conflict.)
- `weighting.kind: 'ncdpi-blueprint'` is correct — the blueprint's own note says "NCDPI publishes no
  blueprint for grades 1-2; there is no EOG below grade 3", so the test comment "the lowest grade
  that has one" is accurate.
- "totals its domain weights to 100 through `domainWeight`" passes: `domainWeight()` divides a
  `weightGroup` midpoint by standard count, giving MD 25 × 6/7 = 21.43 and G 25 × 1/7 = 3.57, so the
  five domains total 34 + 11 + 30 + 21.43 + 3.57 = 100.00.
- `standardsOf(GRADE_3).length === 20` is correct.
- `generated.length >= 10` is satisfiable: Tasks 12–14 as corrected still give generators to OA.1,
  OA.2, OA.3, OA.6, OA.7, NBT.2, NBT.3, NF.1, NF.2, NF.3, NF.4, MD.1, MD.2, MD.5, MD.7, MD.8 — 16 of
  20, comfortably above the floor even after OA.8 moves to authored (12-1).
- The plan's rule "a grade is registered in `registry.ts` only in the same task that flips
  `contentComplete: true`" is honoured: Task 16 does both, in Steps 4 and 5, and no earlier task in
  the batch touches either.
- `import { GRADE_3_TEMPLATES } from './templates'` resolves to `templates/index.ts` (Task 12), and
  `GRADE_3_AUTHORED` to `authored.ts` (Task 14); both exist by Task 16.

### 16-6. Note, not a defect: `grade3.test.ts` re-asserts four things `integrity.test.ts` already asserts

Four of the seven cases in the new file (weights total 100; content for every standard when
content-complete; quizzes reference only this grade's questions; a study guide per standard) are
already run over every registered curriculum by `src/curriculum/integrity.test.ts`. The duplication
is deliberate in the Grade 4/Grade 5 precedent — a per-grade file that fails by name is easier to
read than a `describe.each` row — so leave it. Flagging it only so a reviewer does not report it as
copy-paste.

**Task 16 findings: 4 defects + 2 notes.**

---

## D. Cross-task consistency

### Pairs sharing a file or interface

| # | Pair | Produced | Consumed | Agree? |
|---|------|----------|----------|--------|
| 1 | 12 → 13 | `templates/index.ts` exporting `GRADE_3_TEMPLATES` (T12 Step 4) | T13 Step 4 "Append them all to `GRADE_3_TEMPLATES`" | **Yes.** T13 lists `templates/index.ts` under Modify. Note neither task specifies `templates/index.test.ts`, which Grade 4 has (12-9). |
| 2 | 12 → 14 | same | T14 Step 4 "Append to `GRADE_3_TEMPLATES`" | **Yes**, same caveat. |
| 3 | 12 → 14 | `GRADE_3_OA_AUTHORED` | T14 Step 5 `authored.ts` spreads it | **Yes.** Export name matches exactly. |
| 4 | 13 → 14 | `GRADE_3_NBT_AUTHORED`, `GRADE_3_NF_AUTHORED` | T14 Step 5 spreads both | **Yes.** Names match exactly. |
| 5 | 14 (self) | `GRADE_3_MD_AUTHORED`, `GRADE_3_G_AUTHORED`, `GRADE_3_AUTHORED` | own aggregator + own test | **Yes**, but the aggregate test is housed in `authored.g.test.ts` and no `authored.test.ts` is created (14-7). |
| 6 | 12+13+14 → 14's coverage test | 20 standards across three tasks | `authored.g.test.ts` "covers every grade 3 standard" | **Yes.** 7 + 6 + 7 = 20 = the full Grade 3 inventory; no code is claimed twice and none is missed. |
| 7 | 12/13/14 → 16 | authored item ids | T16 `id.startsWith('g3.')` | **NO.** Tasks 12–14 never state an id convention and Grade 4 shipped `g4-…`. See 12-8 / 16-1. |
| 8 | 14 → 16 | `GRADE_3_AUTHORED` from `./authored` | T16 `makeQuestionSource(GRADE_3_AUTHORED, …)` | **Yes.** Signature matches `makeQuestionSource(authored: Question[], templates: QuestionTemplate[])`. |
| 9 | 12 → 16 | `GRADE_3_TEMPLATES` from `./templates` | T16 `import { GRADE_3_TEMPLATES } from './templates'` | **Yes.** |
| 10 | 15 → 16 | `GRADE_3_STUDY_GUIDES: Record<string, StudyGuideSection>` | T16 `studyGuides: GRADE_3_STUDY_GUIDES` | **Yes.** Shape matches `GradeCurriculum.studyGuides`. |
| 11 | 15 → 16 | 20 guides, one per standard | `integrity.test.ts` "writes a study guide for every standard when content-complete" fires once T16 flips the flag | **Yes**, provided T15 really writes 20 — its own test enforces the count. |
| 12 | 12/13/14 → 16 | generators for 16 standards | T16 `generated.length >= 10` | **Yes**, with margin (see 16-5). |
| 13 | 12/13/14 → 16 | authored coverage of all 20 | T16 "has content for all 20 standards" + `contentComplete: true` | **Yes.** |
| 14 | 12/13/14 → `misconceptions.ts` | each task modifies it | `misconceptions.test.ts` reads `allContent.ts` (all files on disk, registered or not) | **Yes.** A tag declared in T12 and first used in T12 is green immediately; nothing forces tag reuse. |
| 15 | 16 → existing `registry.test.ts` | registration of grade 3 | `expect(() => getCurriculum(3)).toThrow(...)`, `listCurricula() === [5]` | **NO.** Both go red; the file is not in T16's Files list (16-2). |
| 16 | 16 → existing `integrity.test.ts` / `sourcedStandards.test.ts` | a third registered curriculum | `describe.each(listCurricula())` | **Yes** structurally — Grade 3's `standards.ts` already passes `sourcedStandards.test.ts`, which runs on all five grades regardless of registration. |

### Each task against itself

| Task | Self-consistent? |
|---|---|
| 12 | **Mostly.** Files list, test imports (`../authoredBank.testkit`, `./standards`, `./authored.oa`) and produced exports all line up; paths verified in tree. Two internal disagreements: Step 4 templates `NC.3.OA.8` while the governing contract says multi-step word problems stay authored (12-1); and Step 4 creates `templates/index.ts` but the Files list's "each with a sibling test" never yields an index test (12-9). |
| 13 | **Yes.** Two test files, two banks, matching export names and floors (6 NBT / 12 NF against 2 and 4 standards × 3). Step 2's "Expected: FAIL — neither `./authored.nbt` nor `./authored.nf` exists" is accurate given Task 12 already landed `authored.oa`. Defects are content-accuracy, not internal contradiction. |
| 14 | **Mostly.** Step 1's test file creates the aggregate assertions before Step 5 writes `authored.ts`, which is correct TDD order; Step 2's expected failure names all three missing modules correctly. The one internal mismatch is the aggregate test's file home vs. the Files list (14-7). |
| 15 | **No.** Step 3 says MD/G guides "may cite no percentage at all" while the plan's contract says `whyItMattersForSSA` "must cite a real figure"; the Step 1 test hard-enforces the former and makes the latter impossible (15-1). |
| 16 | **No.** Step 1's `startsWith('g3.')` contradicts the id convention Tasks 12–14 will inherit from Grade 4 (16-1); Step 6's "Expected: PASS" contradicts the state of `registry.test.ts` (16-2); Step 3's mock allocation contradicts its own "allocated by band" framing (16-3). |

---

## Verified accurate — claims checked and found correct

**Standard codes.** All 20 codes named across Tasks 12–16 exist in `src/curriculum/grade3/standards.ts`
and in `docs/sources/nc-standards-1-5.json`: `NC.3.OA.1/.2/.3/.6/.7/.8/.9`, `NC.3.NBT.2/.3`,
`NC.3.NF.1/.2/.3/.4`, `NC.3.MD.1/.2/.3/.5/.7/.8`, `NC.3.G.1`. **No brief invents a code.** The
briefs also correctly avoid every NC-absent Common Core code: no 3.OA.4, 3.OA.5, 3.NBT.1 (rounding),
3.MD.4 (line plots), 3.MD.6, 3.G.2. The domain split (OA 7, NBT 2, NF 4, MD 6, G 1) matches
`standards.ts` exactly, as do the per-task counts "7", "6", "7" and Task 15's "20".

**Standard descriptions that are correct as given.**
- T12: `NC.3.OA.9` "patterns in the multiplication table … is a reasoning standard" — correct as a
  ruling (incomplete only in dropping "hundreds board", 12-6).
- T12: multiplication/division "begin" at Grade 3 and OA is "the centre of Grade 3" — matches the
  domain description and the 32–36% band.
- T13: "Grade 3 NBT is only addition and subtraction within 1,000 and a one-digit number times a
  multiple of 10 — nothing else" — correct, and correctly excludes rounding.
- T13: "this is a child's first year of fractions" — matches the NF domain description.
- T13: the misconceptions "a larger denominator means a larger fraction", "counting tick marks
  rather than equal intervals" (`NC.3.NF.2`'s number-line bullet), and additive equivalence
  reasoning are all on-standard and all produce reachable values.
- T14: "Grade 3 is where area and perimeter first collide" — correct (`MD.5`/`MD.7` area, `MD.8`
  perimeter, all new at Grade 3).
- T14: "reading an elapsed-time problem as a subtraction of clock digits" (`MD.1`) and "reading a
  scaled bar graph as if each unit were one" (`MD.3`, "scaled picture and bar graphs") — both
  on-standard.
- T14: "calling a shape a rectangle because it 'looks like one' rather than by its right angles" —
  on-standard for `NC.3.G.1`'s "examples and non-examples of types of quadrilaterals".
- T14: `NC.3.MD.3` and `NC.3.G.1` stay authored — correct per the Content Contract.

**Weights.**
- T12 "OA carries 32–36% at Grade 3 — the largest band in the grade, larger than Fractions" —
  correct (OA 34 > NF 30), band string matches the blueprint.
- T14 "MD and Geometry share one 23–27% band at Grade 3. Neither may cite a weight of its own" —
  correct, and matches `weightGroup: 'MD+G'` on both domains in `standards.ts`.
- T15 OA 32–36% / NBT 9–13% / NF 28–32% — all three match the blueprint exactly, and all three are
  ungrouped domains entitled to cite their own band.
- T16 "totals its domain weights to 100 through `domainWeight`" — verified by hand through
  `registry.ts`'s group-splitting implementation: 34 + 11 + 30 + 21.43 + 3.57 = 100.
- T16 `weighting.kind: 'ncdpi-blueprint'` and "the lowest grade that has one" — correct per the
  blueprint's own note.
- No brief anywhere describes the MD+G band as MD's own weight or as G's own weight.

**Interfaces confirmed present with the named shape.**
`assertAuthoredBankSound(items, domain, opts?)` and `numericValue` in
`src/curriculum/authoredBank.testkit.ts`; `assertNoGeneratorDuplicatesAuthored` in the same file
(exists, but unused by these briefs — 12-7); `assertTemplateSound(t, { runs })` in
`src/engine/templateTesting.ts`; `QuestionTemplate` / `GeneratedQuestion` / `realize` in
`src/engine/template.ts`; `labelOptions` and `Question` in `src/engine/questionModel.ts`;
`makeQuestionSource(authored, templates)` with `allStandardsWithContent()`, `hasGenerator()`,
`authoredFor()` in `src/engine/questionSource.ts`; `GradeCurriculum`, `DomainInfo`, `StandardInfo`,
`Weighting`, `DomainId` in `src/curriculum/types.ts`; `StudyGuideSection` and `QuizDefinition` in
`src/types/index.ts`; `getCurriculum`, `listCurricula`, `standardsOf`, `domainWeight`, `weightLabel`
and `CURRICULA` in `src/curriculum/registry.ts`; `GRADE_3_DOMAINS` in
`src/curriculum/grade3/standards.ts`. Every import path written in the briefs' code blocks resolves
from the file it is written into. The only interface claim that does not hold is Task 16's implicit
one about the `g3.` id prefix (16-1) and its silence about `registry.test.ts` (16-2).

**Age-appropriateness.** Nothing in Tasks 12–16 mandates a prompt a nine-year-old could not read;
Task 15's "Write for a nine-year-old. A Grade 3 guide that reads like the Grade 5 guides has failed
even if every field is filled" is the right instruction and should be kept verbatim. The
age-appropriateness hazards found are all **number-range** hazards, not reading-level ones, and are
filed above: OA.2/OA.7 factor and quotient caps (12-5), NF denominators 2/3/4/6/8 (13-2), NF.3 and
NF.4's narrower related-fraction families (13-1), NBT.3's 10–90 cap (13-4), and MD.1's
"within the same hour" (14-4).
