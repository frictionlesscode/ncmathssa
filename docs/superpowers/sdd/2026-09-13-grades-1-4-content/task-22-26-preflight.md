# Pre-flight audit: Tasks 22–26 (Grade 1) + plan close-out

Read-only audit. Method: the Grade 1 requirement for each standard was derived from
`src/curriculum/grade1/standards.ts` (spot-checked faithful against
`docs/sources/nc-standards-1-5.json`, see "Verified accurate" §V.0) BEFORE reading any brief
claim. Governing rule: when a brief and `standards.ts` disagree, `standards.ts` wins.

Grade 1 has **23 standards**: OA 8, NBT 7, MD 5, G 3. No NCDPI blueprint exists below grade 3.

---

## Task 22 — Grade 1 Operations & Algebraic Thinking

### 22-1. `NC.1.OA.6` and `NC.1.OA.9` are swapped. **(most serious in this task)**

1. **Brief says** (Step 4): "Templates for the computational standards: … fluency within 10
   (`NC.1.OA.6`) … The property and equality standards (`NC.1.OA.3`, `NC.1.OA.4`, `NC.1.OA.7`,
   `NC.1.OA.9`) are reasoning and stay authored."
2. **Source says** (`standards.ts` L64–88):
   - `NC.1.OA.9` — "Demonstrate fluency with addition and subtraction within 10."
   - `NC.1.OA.6` — "Add and subtract, within 20, using strategies." keyConcepts: "Counting on",
     "Making ten", "Decomposing a number leading to a ten", "Using the relationship between
     addition and subtraction", "Using a number line", "Creating equivalent but simpler or known
     sums".
3. **Source is right.** NC renumbers CCSS here — CCSS 1.OA.6 is the fluency-within-10 standard,
   which is exactly the recall the brief reproduced. NC moved fluency to `NC.1.OA.9` and gave
   `NC.1.OA.6` the strategies-within-20 text. This is the `NC.4.NBT.7`-rounding defect class
   repeating at a different code.
4. **Correction:** the fluency template is `NC.1.OA.9` (range **within 10**). `NC.1.OA.6` is
   add/subtract **within 20 using strategies** and is the more template-worthy of the two — give
   it at least one generator (making-ten / counting-on shaped), and drop it from the
   "reasoning, stays authored" list. Authored-only list becomes `NC.1.OA.3`, `NC.1.OA.4`,
   `NC.1.OA.7`.
5. **Cost if the correction is wrong:** every fluency template and every item it seeds is filed
   under a standard code that does not describe it. The scheduler reviews a child on `NC.1.OA.6`
   using within-10 facts and retires the within-20 strategy work as mastered without ever testing
   it, and the parent report names the wrong standard. Both banks would be green.

### 22-2. `NC.1.OA.1`'s three required problem types are silently dropped

1. **Brief says:** "addition and subtraction word problems within 20 (`NC.1.OA.1`)". Nothing else.
2. **Source says** (L21–25), keyConcepts: "Add to/Take from-Change Unknown";
   "Put together/Take Apart-Addend Unknown"; "Compare-Difference Unknown".
3. **Source is right** — these three are the whole substance of the standard; the description's
   "with unknowns" is only meaningful through them.
4. **Correction:** require at least one item (or template branch) per problem type, and say so in
   the brief. With the three-item floor, "three items" should mean one of each.
5. **Cost if wrong:** three Add-to/Result-Unknown items satisfy every test and cover one third of
   the standard. Compare–Difference Unknown is the type first-graders fail most; it would ship
   untested.

### 22-3. `NC.1.OA.2`'s range is unstated

1. **Brief says:** "three addends (`NC.1.OA.2`)".
2. **Source says:** "addition of three whole numbers whose **sum is less than or equal to 20**";
   keyConcepts: "Sums less than or equal to 20".
3. **Source is right.**
4. **Correction:** state `sum ≤ 20` as a hard generator bound, and assert it in the template test
   across all 300 runs.
5. **Cost if wrong:** a seeded generator drifts to 8+9+7=24, outside the standard and outside what
   a first-grader has been taught to add.

### 22-4. `NC.1.OA.6`'s six named strategies are dropped

1. **Brief says:** nothing about strategies (it has OA.6 mislabeled — see 22-1).
2. **Source says:** the six keyConcepts quoted in 22-1.
3. **Source is right.** This is the dropped-bullet case: the standard is *about* the strategies.
4. **Correction:** the `NC.1.OA.6` bank must name the strategy in the explanation
   (`stepByStep`), and at least "making ten" and "counting on" must each appear.
5. **Cost if wrong:** items that are bare arithmetic within 20 with no strategy anywhere; the
   study guide's `stepByStepMethod` for this standard has nothing to reinforce.

### 22-5. `NC.1.OA.3` — associative property has no stated vehicle

1. **Brief says:** groups OA.3 as a "property" standard, authored. No further detail.
2. **Source says:** "Apply the commutative **and associative** properties as strategies";
   keyConcepts: "Associative property: addends can be grouped in any way"; "Using the properties
   as a strategy, **not just naming them**".
3. **Source is right.**
4. **Correction:** at least one of the three OA.3 items must use three addends and regrouping
   (e.g. 7 + 3 + 8 grouped as (7+3)+8), and no item may ask the child to *name* the property —
   the source explicitly says strategy, not vocabulary. A six-year-old is not reading the word
   "associative" (see 22-7 / §G).
5. **Cost if wrong:** all three items are commutative turn-arounds; the associative half ships
   uncovered, and any item asking for the property's *name* is both off-standard and unreadable
   at this grade.

### 22-6. `NC.1.OA.7` cannot be a four-option item in its natural shape

1. **Brief says:** nothing about item shape; it lists OA.7 as authored and gives the
   `4 + 3 = ? + 2 → 7` misconception.
2. **Source says:** "determine if equations involving addition and subtraction are **true**";
   keyConcepts include "Deciding whether an equation is **true or false**".
3. **Both are right, and that is the problem.** The standard's natural item is a true/false
   binary. The Global Constraints require **exactly four options**, and
   `assertAuthoredBankSound` asserts four options with four distinct texts.
4. **Correction:** brief the shape explicitly — "Which equation is true?" with four candidate
   equations, three of them false for a named reason (one per misconception tag). Never
   "True or False".
5. **Cost if wrong:** the implementer pads a true/false item to four options with filler like
   "Maybe"/"Cannot tell", which has no misconception tag, and `labelOptions()` throws — or worse,
   they invent a tag for a non-error.

### 22-7. The prompt-readability test contradicts the brief's own prose, and is weak at one end

1. **Brief says** (prose): "Every prompt is one short sentence." **Brief's test says:**
   `expect(sentences.length).toBeLessThanOrEqual(2)` and `expect(q.prompt.length).toBeLessThan(120)`.
2. **Contract says** (plan L?, Content Contract): "A Grade 1 item's prompt must be readable by a
   six-year-old: short sentences … no multi-clause setups."
3. **The prose is right and the test is looser than it.** Two sentences at 119 characters is a
   five-line prompt for a first-grader.
4. **Correction:** either relax the prose to match the test (two sentences is defensible for a
   word problem: one setup, one question) or tighten the test. Pick one and say so. Recommended:
   keep `<= 2` sentences but drop the length cap to **90** characters, and add a word-length
   guard (`no word longer than 10 letters`) which is what actually catches "determine",
   "associative", "represent".
   Separately: `toBeLessThan(120)` is satisfied by `''`. It is *not* a no-op assertion overall —
   `assertAuthoredBankSound` already asserts `q.prompt.trim().length > 0` — so this is a
   redundancy note, not a defect. Do not add a second emptiness check.
5. **Cost if wrong:** either the suite goes red on legitimate two-sentence word problems, or
   prompts ship that the audience cannot read, and every wrong answer is misreported to the
   parent as a mathematical misconception.

### 22-8. `NC.1.OA.4`'s range is unstated

1. **Brief says:** "`NC.1.OA.4` … reasoning and stays authored."
2. **Source says:** "Solve an unknown-addend problem, **within 20**".
3. **Source is right.**
4. **Correction:** state within 20 for the authored bank.
5. **Cost if wrong:** low — but an unknown-addend item at 30 − ? = 12 is out of grade.

---

## Task 23 — Grade 1 Number & Operations in Base Ten

### 23-1. `NC.1.NBT.1` and `NC.1.NBT.7` are conflated and their content swapped

1. **Brief says** (Step 4): "Templates for **counting and writing numerals** (`NC.1.NBT.1`) …
   and **grouping to count** (`NC.1.NBT.7`)."
2. **Source says:**
   - `NC.1.NBT.1` — "Count to 150, starting at any number less than 150." (L130)
   - `NC.1.NBT.7` — "Read and write numerals, and represent a number of objects with a written
     numeral, to 100." (L142)
3. **Source is right.** Writing numerals belongs to NBT.7, not NBT.1; and "grouping to count" is
   nowhere in `NC.1.NBT.7` — it is a paraphrase of `NC.1.NBT.2`'s "Unitize by making a ten from a
   collection of ten ones". The brief has invented a description for NBT.7 and attached NBT.7's
   real content to NBT.1. (CCSS is the likely source: CCSS 1.NBT.1 folds counting *and* writing
   numerals into one standard, to 120. NC splits them and raises the count to 150.)
4. **Correction:** NBT.1's template is **counting sequence only** — "What number comes next?"
   starting from any number below 150, crossing decade boundaries (its third keyConcept).
   NBT.7's template is **matching a set of objects to its written numeral, to 100**.
5. **Cost if wrong:** two standards each covered by content belonging to the other. Every test
   passes — `assertAuthoredBankSound` only checks that the code belongs to the domain, never that
   the item matches the standard's text. This is precisely how `NC.4.NBT.7` shipped as "rounding".

### 23-2. `NC.1.NBT.4`'s addend restriction is dropped — the most consequential range error here

1. **Brief says:** "addition within 100 (`NC.1.NBT.4`)".
2. **Source says** (L178–185): "…add within 100", keyConcepts: "**A two-digit number and a
   one-digit number**"; "**A two-digit number and a multiple of 10**"; "Concrete models or
   drawings, and strategies based on place value"; "Explaining the reasoning used".
3. **Source is right.** "Within 100" is the ceiling, not the licence. NC Grade 1 never adds two
   arbitrary two-digit numbers; 47 + 38 is Grade 2 (`NC.2.NBT.5`).
4. **Correction:** the generator must draw its second addend from {one-digit} ∪ {10,20,…,90}
   only, with the sum ≤ 100. Assert the addend shape in the template test, not just the sum.
5. **Cost if wrong:** a template that emits 47 + 38 to a six-year-old who has not been taught
   two-digit regrouping. Every test is green: sum < 100, four distinct options, valid tags. The
   child fails a standard they were never asked to learn, and the app reports a place-value
   misconception.

### 23-3. `NC.1.NBT.1`'s range (150) is unstated — and 120 is the recall trap

1. **Brief says:** no number at all.
2. **Source says:** "Count to **150**, starting at any number less than 150."
3. **Source is right.** CCSS 1.NBT.1 says 120. An implementer working from recall writes 120.
4. **Correction:** state 150 explicitly in the brief and pin it in the template test (a fixed-seed
   case at or above 120).
5. **Cost if wrong:** a silent 20% under-coverage of the standard that no test can see.

### 23-4. `NC.1.NBT.7`'s range (100) is unstated

1. **Brief says:** nothing. 2. **Source says:** "…to 100." 3. **Source is right.**
4. **Correction:** numerals 0–100; do not exceed 100 even though NBT.1 counts to 150.
5. **Cost if wrong:** numeral-writing items at 137, mixing the two standards' ranges.

### 23-5. `NC.1.NBT.6`'s double range is unstated, and negative distractors are reachable

1. **Brief says:** "subtracting multiples of 10 (`NC.1.NBT.6`)".
2. **Source says:** "Subtract multiples of 10 **in the range 10–90** from multiples of 10 **in the
   range 10–90**"; keyConcepts: "Concrete models and drawings", "Number lines", "Strategies based
   on place value", "Properties of operations", "The relationship between addition and
   subtraction".
3. **Source is right.** Both operands are bounded, and the standard is implicitly non-negative —
   negative numbers are not in NC's K–5 standards at all.
4. **Correction:** generator draws minuend and subtrahend from {10,…,90} with minuend ≥
   subtrahend. **And**: a "subtracted in the wrong direction" distractor (20 − 50 = −30) cannot be
   offered — a six-year-old has not met negative numbers. Use the absolute value framed as the
   reversal error, or use a different named error (off-by-one-ten: answer ± 10).
5. **Cost if wrong:** either an out-of-range item, or a distractor a child cannot even read, which
   makes the item effectively three-option and inflates the measured mastery.

### 23-6. A `NC.1.NBT.3` comparison template in its natural shape cannot produce four options

1. **Brief says:** "comparison (`NC.1.NBT.3`)" gets a template.
2. **Source says:** "…recording the results of comparisons with the symbols **>, =, and <**."
3. **Both right; the shape is the problem.** "Which symbol goes in the box: 43 __ 38?" has exactly
   three possible options. `assertTemplateSound()` requires four options with distinct texts at
   **every** seed, so the natural item shape cannot pass.
4. **Correction:** brief the shape — "Which sentence is true?" offering four complete comparison
   statements (e.g. `43 > 38`, `43 < 38`, `43 = 38`, `38 > 43`), three false for a named reason.
   That keeps the symbols the standard demands and yields four distinct texts at every seed.
5. **Cost if wrong:** the implementer discovers this at Step 4, invents a fourth symbol option, or
   abandons the template and quietly drops the required symbol recording.

### 23-7. `NC.1.NBT.2`'s two named sub-cases are dropped

1. **Brief says:** "tens and ones (`NC.1.NBT.2`)".
2. **Source says** keyConcepts: "Unitize by making a ten from a collection of ten ones"; "**Model
   the numbers from 11 to 19** as composed of a ten and one…nine ones"; "**Demonstrate that the
   numbers 10, 20, 30, …, 90** refer to one…nine tens, with 0 ones".
3. **Source is right.** The teen case and the decade case are named separately because they fail
   separately — the teens are where "13 read as 31" lives (which the brief itself cites as a
   misconception, without connecting it to the bullet that requires it).
4. **Correction:** the NBT.2 bank/template must cover both: at least one teen-decomposition item
   and at least one decade item, plus the general two-digit case.
5. **Cost if wrong:** three items all of the form "4 tens and 2 ones is what number?" — a third of
   the standard, fully green.

### 23-8. `NC.1.NBT.5` range unstated; "explain the reasoning" not templatable

1. **Brief says:** "adding and subtracting 10 mentally (`NC.1.NBT.5`)".
2. **Source says:** "**Given a two-digit number**, mentally find 10 more or 10 less than the
   number, **without having to count; explain the reasoning used**."
3. **Source is right.** The brief's phrasing is acceptable shorthand but drops the two-digit
   bound and the explanation requirement.
4. **Correction:** generator draws from 10–99 (note: crossing 100 is not in this standard's text —
   90 + 10 is at the boundary, decide and document). The explanation requirement is satisfied by
   `explanation.stepByStep` naming the tens-digit change, not by asking the child to write.
5. **Cost if wrong:** items on one-digit or three-digit numbers; explanations that just restate
   the answer.

### 23-9. All seven NBT standards get a template, including the three whose text is "explain"

1. **Brief says** (Step 4): templates for NBT.1, 2, 3, 4, 5, 6, 7 — every standard in the domain.
2. **Contract says:** "Reasoning standards, classification standards, and multi-step word problems
   stay authored — there the wording carries the mathematics."
3. **Defensible either way, but the brief should say so.** Grade 4's `templates/index.ts` gives
   all six NBT standards a generator on exactly this argument ("these are procedures, and a
   procedure is learned on numbers a student has not seen before") and documents it in a
   docstring. Grade 1 NBT is the same case.
4. **Correction:** keep all seven, and require the `templates/index.ts` docstring to state the
   reasoning, as Grade 4's does — plus an authored bank alongside each that does what the
   generator cannot (the "explain the reasoning" half of NBT.4/5/6). The briefs already require
   both; make the division of labour explicit so the authored NBT bank is not a duplicate of the
   generator output. Task 23's test list should include
   `assertNoGeneratorDuplicatesAuthored(GRADE_1_NBT_AUTHORED, nbtTemplates)` — it exists in
   `src/curriculum/authoredBank.testkit.ts` and no Grade 1 brief calls it.
5. **Cost if wrong:** a child is served the same question twice under two review keys (authored id
   and template id) and the second serving teaches nothing — the exact defect the testkit helper
   was generalised out of Grade 4 OA to prevent.

---

## Task 24 — Grade 1 Measurement, Geometry, and the authored aggregate

### 24-2 first, because it is the worst finding in the whole audit:

### 24-1. `NC.1.MD.3` and `NC.1.MD.5` are swapped. **(most serious finding overall)**

1. **Brief says** (Step 4): "**Time (`NC.1.MD.5`)**, **money or coin recognition (`NC.1.MD.3`)**,
   and all three Geometry standards stay authored."
2. **Source says:**
   - `NC.1.MD.3` — "**Tell and write time in hours and half-hours** using analog and digital
     clocks." (L252)
   - `NC.1.MD.5` — "**Identify quarters, dimes, and nickels and relate their values to
     pennies**." (L264)
3. **Source is right.** The brief has inverted both codes. Note that Task 24's own "Standards
   covered" line lists `NC.1.MD.3` and `NC.1.MD.5` correctly as codes — the swap is only in Step
   4's descriptions, which is exactly where an implementer reads what to write.
4. **Correction:** Time is `NC.1.MD.3`. Coins are `NC.1.MD.5`. Both stay authored (correct call —
   both are figure/vocabulary standards).
5. **Cost if wrong:** every clock item ships tagged `NC.1.MD.5` and every coin item tagged
   `NC.1.MD.3`. Nothing goes red: `assertAuthoredBankSound` checks only that the code is *in the
   MD domain*, and the aggregate test checks only that *some* item exists per code. The study
   guide for "Identify Coins" would be reinforced by clock quizzes, and a parent told their child
   is weak at telling time when they are weak at coins. This is the `NC.4.NBT.7`-rounding failure
   mode with both halves of the swap shipping green.

### 24-2. `NC.1.MD.1` is templated against the brief's own stated rule

1. **Brief says:** "Templates for ordering and measuring lengths (`NC.1.MD.1`, `NC.1.MD.2`)"; and
   in the same sentence, Geometry stays authored because "a generator would only shuffle labels".
2. **Source says** (`NC.1.MD.1`): "Order three objects by length; compare the lengths of two
   objects indirectly by using a third object"; keyConcepts: "**Transitivity**: if A is longer
   than B and B is longer than C, A is longer than C."
3. **The brief contradicts itself.** MD.1 is transitive reasoning over *described* objects; a
   generator can only shuffle the object names — the exact reason given for excluding Geometry.
4. **Correction:** `NC.1.MD.1` stays **authored**. Keep the `NC.1.MD.2` template (iterating a
   length unit has real numbers in it) and the `NC.1.MD.4` data template. That leaves Task 24
   contributing two templates, not three — which affects Task 26's generator floor (see 26-4).
5. **Cost if wrong:** see 24-3 — the generated prompt is unreadable at this grade, and the
   template's own prompt-length assertion will fail at Step 4, after the work is done.

### 24-3. A `NC.1.MD.1` transitivity prompt cannot meet the age rule

1. **Brief says:** MD.1 templated, and "each generated prompt must also satisfy the length rule"
   (< 120 chars, ≤ 2 sentences).
2. **Contract says:** "A Grade 1 or 2 item may not require reading a paragraph to find the
   arithmetic"; "no multi-clause setups."
3. **The contract wins.** "The pencil is longer than the crayon. The crayon is longer than the
   eraser. Which is longest?" is three sentences, ~105 characters, and three clauses of held
   state — over the sentence cap and squarely a multi-clause setup.
4. **Correction:** as 24-2 — author it, and use `promptDetails` for the comparison facts so the
   `prompt` stays one short question ("Which object is longest?") with the givens in
   `promptDetails`. `promptDetails` is an optional field on `Question` and on `GeneratedQuestion`
   and exists for exactly this.
5. **Cost if wrong:** a template that cannot pass its own test, discovered at the end of the task.

### 24-4. `NC.1.MD.5` drops "relate their values to pennies", and invites a CCSS Grade 2 import

1. **Brief says:** "money or coin recognition".
2. **Source says:** "Identify quarters, dimes, and nickels **and relate their values to
   pennies**"; keyConcepts: "Relating each coin value to a number of pennies"; "**The penny as the
   unit of value**".
3. **Source is right.** "Recognition" is half the standard.
4. **Correction:** at least one of the three items must be value-in-pennies ("A dime is worth how
   many pennies?"). And state the out-of-scope boundary explicitly: NC Grade 1 does **not** add
   coin values, does not use the `$` or `¢` symbols, and does not solve money word problems —
   that is CCSS 2.MD.8 / `NC.2.MD.8`. The brief's phrase "money … recognition" is the doorway to
   importing it.
5. **Cost if wrong:** three "which coin is this?" items covering half a standard, or money word
   problems a grade early.

### 24-5. `NC.1.MD.4`'s three question types are dropped

1. **Brief says:** "reading data (`NC.1.MD.4`)".
2. **Source says** keyConcepts: "…questions about the **total** number of data points";
   "…questions about **how many in each category**"; "…questions about **how many more or less**
   are in one category than in another." Plus the description's "**up to three categories**".
3. **Source is right** — the three question types *are* the standard.
4. **Correction:** the MD.4 template must produce all three question types (branch on the seed),
   or be split. Category count ≤ 3 is a hard bound. Pin one fixed-seed test per question type.
5. **Cost if wrong:** a generator that only ever asks "how many in all", passing 300 runs of
   `assertTemplateSound()` while covering one of three bullets.

### 24-6. `NC.1.G.1` drops the three-dimensional half

1. **Brief says** (G errors): "naming a shape by orientation; calling a shape a rectangle because
   it has four sides" — 2-D only.
2. **Source says** (`NC.1.G.1` keyConcepts): "Building and drawing triangles, rectangles, squares,
   trapezoids, hexagons, circles"; "**Building cubes, rectangular prisms, cones, spheres, and
   cylinders**".
3. **Source is right.**
4. **Correction:** at least one `NC.1.G.1` item on a three-dimensional shape (cube / rectangular
   prism / cone / sphere / cylinder) and its defining attribute.
5. **Cost if wrong:** a whole named list of solids ships untested under a standard that lists them
   explicitly.

### 24-7. `NC.1.G.2` drops the 3-D half and "naming the components"

1. **Brief says** (G errors): "composing two shapes and expecting the new shape to keep both
   names."
2. **Source says:** "Making a two-dimensional composite shape using rectangles, squares,
   trapezoids, triangles, and **half-circles**, **naming the components** of the new shape";
   "Making a **three-dimensional** composite shape using cubes, rectangular prisms, cones, and
   cylinders, naming the components of the new shape."
3. **Source is right.** Note the half-circle is named in the source and nowhere in the brief.
4. **Correction:** three items must include one 2-D compose (including at least one using
   half-circles) and one 3-D compose, and at least one must ask *which shapes it is made of*
   (naming the components) rather than *what is the new shape*.
5. **Cost if wrong:** half the standard uncovered; the component-naming skill, which is the part
   that transfers to area in Grade 3, never appears.

### 24-8. `NC.1.G.3` — scope boundary and a dropped bullet

1. **Brief says:** "splitting a circle into two unequal pieces and calling each a half."
2. **Source says:** "Partition circles and rectangles into **two and four** equal shares";
   keyConcepts: "Describe the shares as halves and fourths, as half of and fourth of"; "Describe
   the whole as two of, or four of the shares"; "**Explain that decomposing into more equal
   shares creates smaller shares**."
3. **Source is right.**
4. **Correction:** (a) **Thirds are out of scope** — two and four only. Say so; "partition into
   equal shares" is a CCSS/Grade-2-shaped phrase that pulls thirds in. (b) One item must carry the
   third bullet: fourths are *smaller* than halves. That is the counter-intuitive one and is
   currently unmentioned. (c) "Describe the whole as two of / four of the shares" is also
   unmentioned.
5. **Cost if wrong:** thirds ship a grade early; and the "more shares means smaller shares"
   misconception — the single most common fraction error in the primary grades — is absent from
   the one standard that names it.

### 24-9. `NC.1.MD.2` measurement-by-iteration needs a figure channel

1. **Brief says:** MD.2 templated, with the prompt-length assertion.
2. **Source says:** "Measure by laying multiple copies of a shorter object (the length unit) end
   to end (iterating) **with no gaps or overlaps**."
3. **Both right.** Expressing "here is a pencil measured with 6 paper clips laid end to end, one
   with a gap" in a `prompt` under 120 characters is not possible.
4. **Correction:** put the figure description in `promptDetails` (exempt from the prompt-length
   rule, since the rule as written tests `q.prompt` only) and keep the `prompt` to the question.
   State this in the brief so the implementer does not cram it into `prompt` and fail their own
   test.
5. **Cost if wrong:** the "no gaps or overlaps" bullet — the whole point of the standard — is
   dropped to fit the character budget.

### 24-10. The aggregate test snippet is incomplete as written

1. **Brief says:** the Step 1 snippet uses `GRADE_1_AUTHORED` and `GRADE_1_DOMAINS` with no
   import block, and places it in `authored.g.test.ts`.
2. **Repo says:** `src/curriculum/grade1/authored.ts` will export `GRADE_1_AUTHORED`;
   `./standards` exports `GRADE_1_DOMAINS` (verified, L4).
3. **Brief is right in substance**, incomplete in form.
4. **Correction:** note that `authored.g.test.ts` must import `GRADE_1_AUTHORED` from
   `./authored` and `GRADE_1_DOMAINS` from `./standards`. Low severity.
5. **Cost if wrong:** a compile error caught immediately at Step 2. No risk.

---

## Task 25 — Grade 1 study guides

### 25-1. Pointing at Task 10 Step 3 imports Grade 4's blueprint percentages

1. **Brief says:** "23 entries **at the depth described in Task 10 Step 3**, pitched as above."
2. **Task 10 Step 3 says** (verbatim): "For OA, NBT, and NF standards, `whyItMattersForSSA` may
   cite the domain band — **14–18%, 25–29%, 30–34%** respectively." Plan Global Constraints say:
   "Grades 1–2 have no NCDPI blueprint — no EOG exists below grade 3."
3. **The constraint wins.** Task 10 is the **Grade 4** study-guide task; its second paragraph is a
   licence to cite three specific percentages that do not exist at Grade 1.
4. **Correction:** rewrite the pointer to name only the *structural* depth (title matching
   `standards.ts`, `coreConcept` in two or three sentences, `rulesAndFormulas` as `{label,
   detail}` pairs, `stepByStepMethod` as a numbered procedure, `commonTraps` in the same words as
   the authored distractors, a full `workedExample`) and to state explicitly that **Task 10 Step
   3's second paragraph does not apply to Grade 1**. Better: point at Task 20 Step 3 (Grade 2),
   which is the no-blueprint case.
5. **Cost if wrong:** fabricated official weights in 23 study guides. The Step 1 test would catch
   a literal `%` in `whyItMattersForSSA` — but not "roughly a quarter of the exam", and not a
   percentage placed in `coreConcept` or `commonTraps`, which the `%` regex does not scan (it
   tests `g.workedExample.whyItMattersForSSA` only; the `/blueprint/i` check does scan the whole
   guide). Partially caught, not fully.

### 25-2. The brief states the prohibition but drops the Content Contract's positive requirement

1. **Brief says:** "**No guide may cite a percentage**, for the same reason as Grade 2."
2. **Contract says:** "`whyItMattersForSSA` must cite a **real figure** — the domain's blueprint
   band for grades 3–5, **or the domain's share of the grade's standards for grades 1–2**."
3. **Contract is right**, and the brief only communicates half of it.
4. **Correction:** give the implementer the four figures, computed from `standards.ts` and stated
   as counts (not percentages, so the `%` test stays green):
   - OA — **8 of the 23 Grade 1 standards**
   - NBT — **7 of 23**
   - MD — **5 of 23**
   - G — **3 of 23**
   Each guide's `whyItMattersForSSA` cites its own domain's count. Note these are *standard-count
   shares*, matching `weighting: { kind: 'even-by-standard-count' }` and `domainWeight()`'s
   even branch (`domain.standards.length / total * 100`), which is the same arithmetic.
5. **Cost if wrong:** the Step 1 test asserts only
   `whyItMattersForSSA.trim().length > 0`, so 23 guides of generic filler ("this standard matters
   for the SSA") ship fully green, and the field that was supposed to carry a real figure carries
   nothing.

### 25-3. "Identical in shape to Task 20 Step 1's test" — verify the three renames

1. **Brief says:** identical, but importing `GRADE_1_DOMAINS` / `GRADE_1_STUDY_GUIDES` and naming
   grade 1 in `describe`.
2. **Task 20 Step 1** (read): test asserts one guide per standard keyed by code, every section
   non-empty, and the two prohibition checks.
3. **Brief is right.** No defect.
4. **Correction:** none. Note only that the third test's message strings say "grade 2" inside
   Task 20's copy ("because grade 2 has no state assessment") and must be reworded, or the failure
   message will name the wrong grade.
5. **Cost if wrong:** a misleading failure message. Cosmetic.

---

## Task 26 — Register Grade 1 and close out the plan

### 26-1. The quiz-item-id assertion uses the dot convention; the repo uses a hyphen

1. **Brief says** (Step 1): "…and **every quiz item id starting with `g1.`**".
2. **Repo says:** all 84 shipped Grade 4 item ids use a hyphen —
   `grep -o "id: 'g4[^']*'" src/curriculum/grade4/authored.nf.ts` → `g4-nf1-01`, `g4-nf1-02`,
   `g4-nf1-03`, … Template ids use dots (`g4.md3.rectangle-area`, `g4.md1.metric-word-problem`).
   The Content Contract now says: "The separator after the grade prefix is a HYPHEN, not a dot —
   this sentence said `g4.nf1-01` until Task 9-11 pre-flight found all 84 committed Grade 4 ids
   using the hyphen and a Task 11 test asserting the dot, which could not have passed."
3. **The repo wins.** Task 26 has reproduced the exact defect the contract was corrected to
   prevent, inherited from Task 21 Step 6 (which says `g2.`).
4. **Correction:** `expect(qid.startsWith('g1-')).toBe(true)`. Quiz ids themselves
   (`g1-diagnostic-01`, `g1-mod-oa-01`, `g1-mock-ssa-01`) already use the hyphen in Step 3 and are
   correct — the defect is only in the Step 1 assertion about **item** ids.
5. **Cost if wrong:** Step 4's full suite is red with no bug in the content, and the likely
   "fix" is to rename Grade 1's item ids to `g1.oa1-01`, breaking the convention four other
   grades hold and diverging the one naming rule that cross-grade review depends on.

### 26-2. `registry.test.ts` is not in Task 26's Files list, but holds an assertion that must change

1. **Brief says:** Files — Create `grade1/quizzes.ts`, `grade1/index.ts`, `grade1/grade1.test.ts`;
   Modify `registry.ts` and the spec. `registry.test.ts` is absent.
2. **Repo says** (`src/curriculum/registry.test.ts`):
   ```ts
   it('lists only grades that actually have modules', () => {
     expect(listCurricula().map((c) => c.grade)).toEqual([5]);
   });
   ```
3. **The repo wins** — this assertion is pinned to `[5]` and goes red the moment Grade 1
   registers. (Tasks 16 and 21 will have walked it to `[3,4,5]` and `[2,3,4,5]`; Task 26 is the
   last step and does not mention it.) Both the Grade 3 and Grade 4 audits found this unlisted;
   it is unlisted a third time.
4. **Correction:** add `src/curriculum/registry.test.ts` to Task 26's Files list, with the
   expected final value spelled out: `expect(listCurricula().map((c) => c.grade)).toEqual([1, 2,
   3, 4, 5]);`.
5. **Cost if wrong:** Step 4 ("Run the whole suite … Expected: PASS") is red on the final task of
   the plan, and the implementer is debugging a registry they just correctly wired.

### 26-3. The "throws for an unregistered grade" test becomes inexpressible at Task 26

1. **Brief says:** nothing about it.
2. **Repo says:**
   ```ts
   it('throws for a grade with no curriculum module', () => {
     expect(() => getCurriculum(3)).toThrow(/no curriculum/i);
   });
   ```
   and `src/curriculum/types.ts`: `export type Grade = 1 | 2 | 3 | 4 | 5;`
3. **This is a real gap.** After Task 26 **no** member of `Grade` is unregistered, so there is no
   valid argument that makes `getCurriculum` throw. The test cannot be repointed to another grade.
4. **Correction:** brief it explicitly. Keep the test — the throw is the guard that stops a
   missing module rendering as a blank app — and express it as
   `expect(() => getCurriculum(6 as Grade)).toThrow(/no curriculum/i);` with a comment saying the
   cast is deliberate: it simulates a future grade whose module does not exist yet. Verified: the
   thrown message is `` `No curriculum module for grade ${grade}` ``, which matches
   `/no curriculum/i`.
5. **Cost if wrong:** an implementer facing an unfixable red test deletes it, removing the only
   coverage of the registry's failure path on the very task that finalises the registry.

### 26-4. The generator floor is set below Grade 2's, and Task 24 will not meet the brief's own count

1. **Brief says:** "at least **8** standards with a generator".
2. **Repo/plan says:** Task 21 Step 6 sets Grade 2's floor at **10**, for the same 23 standards.
   Tasks 22–24 as written specify generators for 14 standards (OA 4, NBT 7, MD 3).
3. **The floor is not wrong, it is uninformative** — 8 of 14 is a floor that cannot fail. With
   correction 24-2 applied (MD.1 becomes authored) the real count is 13.
4. **Correction:** raise the floor to **12** and state the expected standards, so a task that
   silently drops a generator goes red. Make sure the floor accounts for 24-2.
5. **Cost if wrong:** set too high, the suite is red until the last template lands (the exact
   failure mode `integrity.test.ts` documents and gates against with `contentComplete`); set at 8,
   a third of the generators could vanish with everything green.

### 26-5. "Close out the plan" — which closing claims are verifiable

Audited per the instruction. Step by step:

- **Step 4** ("Every registry-driven test from Task 3 now runs five times") — **verifiable and
  true by construction.** `src/curriculum/integrity.test.ts` opens with
  `describe.each(listCurricula().map((c) => [c.grade, c] as const))`, so registering the fifth
  grade multiplies its 12 `it` blocks by five automatically. No action needed.
- **Step 5** (privacy grep, "Expected: no output") — **verifiable, and true today.** I ran the
  exact grep from the brief against `src/`: no output. The claim is falsifiable and currently
  holds; it will hold after Tasks 22–25 unless one of them introduces a network call, which
  nothing in them does.
- **Step 6** (browser verification of all five grades) — **not machine-verifiable, and correctly
  so** — it is owner work. One sub-claim is checkable: "confirm the standard count matches the
  table in Task 4" → Grade 1 is 23 (8+7+5+3), confirmed against `standards.ts`. The other
  sub-claim, "Confirm grades 1 and 2 never use the word 'blueprint' and never show a percentage as
  an official weight", is **partly automated already** and the brief does not say so:
  `integrity.test.ts` has `claims no official blueprint below grade 3` (asserts
  `weighting.kind === 'even-by-standard-count'` and no `weightGroup` for grades < 3), Task 21 adds
  `weightHeading()` plus its two tests, and Task 25's study-guide test bans `/blueprint/i`. Step 6
  should say the browser pass is confirming the *rendered* result of checks that already exist,
  not discovering them.
- **Step 7** (spec §13) — **verifiable.** `docs/superpowers/specs/2026-09-11-multi-grade-adaptive-math-design.md`
  line 437 is `## 13. Verification the author must perform`. The section exists and is the right
  target. The claim it asks to record — "the standards and weights are machine-checked against
  `docs/sources/`, but the mathematical correctness of the authored items themselves is not" — is
  **true and well-stated**: `sourcedStandards.test.ts` checks the former;
  `assertAuthoredBankSound` checks structure (four options, one correct, tagged distractors,
  no two options of equal numeric value, final step states the answer) and never checks whether a
  distractor is the number a child would actually compute. This is the single most honest claim in
  the plan and should stay exactly as written.
- **What close-out does NOT specify, and should:** nothing in Step 7 requires recording the
  **standard-by-standard defect classes this plan's audits found** (the `NC.4.NBT.7` rounding
  ship, the Grade 3 `NC.3.MD.2` customary/metric error, the 28 Grade 3 defects). If the close-out
  is the last word, the one durable lesson — *briefs written from recall describe mathematics NC
  does not teach; `standards.ts` is the only authority* — should be recorded in §13 as a process
  finding, not just the item-correctness gap. Recommend adding it.

### 26-6. `contentComplete: true` gating — verified satisfiable

`integrity.test.ts` turns on four assertions when `contentComplete` flips: content for every
standard, a study guide for every standard, quizzes referencing only this grade's authored ids,
and a diagnostic present. Tasks 22–25 supply all four (23 standards × ≥3 authored items, 23 study
guides, `g1-diagnostic-01` marked `isDiagnostic`). No gap. Note the quiz check resolves ids
through `c.source.authoredFor(code)`, so **every quiz `questionId` must be an authored item id —
never a template id**; Task 26 Step 3 does not say this and an implementer building a 20-item mock
from generators would go red.

---

## E. Cross-task consistency

### E.1 — Pairs sharing a file or interface

| Pair | Shared file / interface | Producer says | Consumer says | Agree? |
|---|---|---|---|---|
| 22 → 23 | `grade1/templates/index.ts` (`GRADE_1_TEMPLATES`) | T22 creates it exporting `GRADE_1_TEMPLATES` | T23 "Append to `GRADE_1_TEMPLATES`", lists it under Modify | **Yes** |
| 22 → 24 | `grade1/templates/index.ts` | same | T24 "Append to `GRADE_1_TEMPLATES`", under Modify | **Yes** |
| 22 → 24 | `GRADE_1_OA_AUTHORED` | T22 produces it | T24 Step 5 joins it first into `GRADE_1_AUTHORED` | **Yes** |
| 23 → 24 | `GRADE_1_NBT_AUTHORED` | T23 produces it | T24 Step 5 joins it second | **Yes** |
| 22/23/24 → 26 | `GRADE_1_TEMPLATES` | 14 template standards specified (13 after fix 24-2) | T26 asserts "at least 8 standards with a generator" | **Weak, not contradictory** — see 26-4 |
| 24 → 26 | `GRADE_1_AUTHORED` | T24 produces `Question[]` | T26 passes it to `makeQuestionSource` | **Yes** — verified against `grade5/index.ts`, which calls `makeQuestionSource(GRADE_5_AUTHORED, GRADE_5_TEMPLATES)` |
| 22/23/24 → 26 | item id convention | items are `g1-oa1-01` (contract) | T26 asserts quiz item ids start with `g1.` | **NO** — finding 26-1 |
| 22/23/24 → — | `src/curriculum/misconceptions.ts` | all three modify it; tags reach the registry test via `allContent.ts` | — | **Yes, no wiring needed** — `allContent.ts` discovers `./grade*/authored*.ts` and `./grade*/templates/*.ts` **by eager glob**, so no brief needs to register Grade 1 there. Verified. |
| 22 → 23/24 | prompt-length test | T22 Step 1 defines it inline | T23 copies it verbatim; T24 says "repeating the prompt-length assertion from Task 22 Step 1" | **Yes, but** — verbatim duplication across three test files with no shared helper (finding E.3) |
| 24 → 25 | `commonTraps` wording | T24 authors distractor misconceptions | T25 (via T10 Step 3) requires `commonTraps` "naming the same errors the authored distractors use, in the same words" | **Yes**, but only reachable through the T10 pointer that also carries the percentage defect (25-1) |
| 25 → 26 | `GRADE_1_STUDY_GUIDES` | T25 produces `Record<string, StudyGuideSection>` | T26 index.ts consumes as `studyGuides` | **Yes** — `GradeCurriculum.studyGuides` is `Record<StandardCode, StudyGuideSection>`; `StudyGuideSection` is exported from `src/types/index.ts` as T25 claims |
| 21 → 26 | `registry.ts` `CURRICULA` | T21 adds `2: GRADE_2` | T26 adds `1: GRADE_1` | **Yes** — `CURRICULA` is `Partial<Record<Grade, GradeCurriculum>>`, verified |
| 21 → 26 | `registry.test.ts` | T21 lists it under Test/Modify | T26 does not list it at all | **NO** — finding 26-2 |

### E.2 — Each task against itself

| Task | Internally consistent? | Where it disagrees with itself |
|---|---|---|
| 22 | **No** | Prose: "Every prompt is **one** short sentence." Test: `sentences.length <= 2`. (22-7) Also: Step 4's standard list assigns OA.6/OA.9 contrary to its own Step-heading claim that it is templating "the computational standards" — OA.6 (within 20, strategies) *is* the computational one it excludes. (22-1) |
| 23 | **No** | Step 4 templates every one of the seven NBT standards while the Content Contract it inherits reserves reasoning standards for authoring, and three of the seven (NBT.4, 5, 6) have "explain the reasoning" in their sourced text. Not fatal — Grade 4 makes the same call and documents it — but undocumented here. (23-9) |
| 24 | **No** | Step 4 excludes Geometry because "a generator would only shuffle labels", then templates `NC.1.MD.1`, where a generator can only shuffle labels. (24-2) Also: the "Standards covered" header lists MD.3/MD.5 correctly while Step 4 describes them inverted. (24-1) |
| 25 | **No** | Forbids citing a percentage while inheriting a contract requiring a real figure, and gives no figure. (25-2) Points at a Grade 4 step that licenses three percentages. (25-1) |
| 26 | **No** | Step 3 writes quiz ids with a hyphen (`g1-diagnostic-01`) while Step 1 asserts item ids with a dot (`g1.`). (26-1) |

### E.3 — Verbatim duplication (category F)

The prompt-readability test is specified to be copied verbatim into `authored.oa.test.ts`,
`authored.nbt.test.ts`, `authored.md.test.ts`, `authored.g.test.ts`, and every template test —
seven-plus copies of the same two assertions with the same magic numbers. `authoredBank.testkit.ts`
documents precisely why this is a defect, about a different guard: "A domain test that re-declared
these patterns locally could drift from this copy without anything going red — which is precisely
the failure the guard exists to prevent — so there is one definition and everything imports it."

**Correction:** add `assertGradeOneReadable(items: { id: string; prompt: string }[])` to
`src/curriculum/authoredBank.testkit.ts` (or a `gradeOneReadability.testkit.ts`) in Task 22, and
have Tasks 23 and 24 import it. One definition, one place to tune the character cap when 22-7 is
settled. Cost if not done: the cap is tuned in one file and the other six drift, and Grade 2
(Tasks 17–20) duplicates it again.

---

## Verified accurate

Claims checked against the source or the repo and found **correct**. This is what was actually
checked, not a summary of what passed.

**V.0 — `standards.ts` faithfulness (spot-check against `docs/sources/nc-standards-1-5.json`).**
All 23 Grade 1 codes, all 23 description texts, and every keyConcepts bullet were dumped from the
JSON and compared to `src/curriculum/grade1/standards.ts`. **Exact match**, including the two
places NC diverges from CCSS most quietly: `NC.1.NBT.1` "to 150" (CCSS: 120) and the existence of
`NC.1.MD.5` (coins; CCSS has no Grade 1 money standard). `standards.ts` is a faithful proxy and
was used as such for everything above.

**Task 22**
- The 8 codes listed (`NC.1.OA.1/2/3/4/9/6/7/8`) all exist in `standards.ts`, all in domain `OA`.
  NC has no `NC.1.OA.5` and the brief does not claim one. ✔
- "twenty-four minimum" = 8 standards × 3-item floor. ✔
- `assertAuthoredBankSound` exists at `src/curriculum/authoredBank.testkit.ts` with signature
  `(items: Question[], domain: DomainInfo, opts?)`. ✔
- `GRADE_1_DOMAINS` is exported from `src/curriculum/grade1/standards.ts` L4. ✔
- `assertTemplateSound` exists at `src/engine/templateTesting.ts` L11, signature
  `(t: QuestionTemplate, opts: { runs?: number })`. ✔
- Template id shape `g1.oa<tail>.<slug>` matches the shipped convention —
  `g4.md3.rectangle-area`, `g4.nf3-…` style confirmed as dots for templates. ✔
- Misconception examples are arithmetically real: `8 = 3 + ?` → 11 (8+3); `4 + 3 = ? + 2` → 7. ✔
- Classifying `NC.1.OA.3` and `NC.1.OA.7` as reasoning/authored is correct per the contract. ✔

**Task 23**
- The 7 codes listed all exist in domain `NBT`. ✔ "twenty-one minimum" = 7 × 3. ✔
- The four named place-value errors are all real Grade 1 errors and all map to sourced content:
  teen reversal (NBT.2 bullet 2), 4 tens + 2 ones → 24 (NBT.2), 19+1 → 110 (NBT.4), comparing by
  the ones digit (NBT.3 bullet 1). ✔
- `NC.1.NBT.5` phrased as "adding and subtracting 10 mentally" is an accurate gloss of "mentally
  find 10 more or 10 less". ✔

**Task 24**
- "Standards covered (8): MD — MD.1, MD.2, MD.3, MD.5, MD.4. G — G.1, G.2, G.3" — all 8 codes
  exist under the right domains, count correct. (The *descriptions* in Step 4 are swapped; the
  codes here are right.) ✔
- "fifteen minimum" (MD 5×3) and "nine minimum" (G 3×3). ✔
- Keeping all three Geometry standards authored is correct — they are classification and figure
  standards, which the contract reserves for authoring. ✔
- Keeping time and coins authored is correct (regardless of the code swap). ✔
- All four MD/G misconceptions named are real and on-standard: comparing only two of three
  (MD.1 transitivity), gaps when iterating (MD.2 bullet 2), hour hand between numbers (MD.3),
  shape-named-by-orientation and four-sides-means-rectangle (G.1 defining attributes), unequal
  halves (G.3), composite keeping both names (G.2). ✔
- Aggregator order OA → NBT → MD → G, and `GRADE_1_AUTHORED: Question[]`, match the Grade 5/4
  pattern. ✔
- The aggregate "covers every grade 1 standard" test is genuinely additive — it is the only check
  that spans domains; `assertAuthoredBankSound` is per-domain. ✔

**Task 25**
- "One entry for each of the **23** Grade 1 standards" — correct count. ✔
- `StudyGuideSection` exists in `src/types/index.ts` L12 with exactly the fields Task 20's test
  asserts: `standardCode`, `title`, `coreConcept`, `rulesAndFormulas: {label, detail}[]`,
  `stepByStepMethod: string[]`, `commonTraps: string[]`, `workedExample: {problem, steps, answer,
  whyItMattersForSSA}`. ✔
- `GRADE_1_STUDY_GUIDES: Record<string, StudyGuideSection>` matches
  `GradeCurriculum.studyGuides: Record<StandardCode, StudyGuideSection>`. ✔
- "pitched at the parent" is consistent with the contract's age rule for the child-facing field
  (`workedExample.problem` at the child's reading level). ✔
- "3 tests" expected at Step 4 matches Task 20's test file exactly. ✔

**Task 26**
- `CURRICULA` exists in `src/curriculum/registry.ts` as
  `Partial<Record<Grade, GradeCurriculum>>`; adding `1: GRADE_1,` is the correct registration. ✔
- `Grade = 1 | 2 | 3 | 4 | 5` — key `1` is valid. ✔
- `GradeCurriculum` has exactly the fields Task 26 names: `grade`, `label`, `ssa {passingPercent,
  targetsGrade}`, `weighting`, `contentComplete`, `domains`, `quizzes`, `studyGuides`, `source`. ✔
- `Weighting` union includes `{ kind: 'even-by-standard-count' }`. ✔
- `listCurricula()` sorts by grade, so `[1,2,3,4,5]` is the correct expected value for the
  completion test. ✔
- `domainWeight()`'s even-by-standard-count branch returns `standards.length / total * 100`,
  which sums to exactly 100 over four domains — the "weights totalling 100" assertion is sound. ✔
- "no `%` in any domain's `officialWeightRange`" — Grade 1's four domains all carry
  `officialWeightRange: 'No state assessment at this grade'` and `officialWeightMidpoint: 0`, with
  **no `weightGroup`**. Both the Task 26 assertion and `integrity.test.ts`'s "claims no official
  blueprint below grade 3" will pass unchanged. **No weight-shaped claim in Tasks 22–26 asserts a
  percentage of a test at Grade 1** — the only percentage exposure is the indirect one in 25-1. ✔
- `weightCategory: 'Core (no state assessment at this grade)'` on all 23 standards contains no
  digits, so `integrity.test.ts`'s "quotes no percentage in weightCategory" passes. ✔
- Quiz id shape `g1-diagnostic-01` / `g1-mod-<domain>-01` / `g1-mock-ssa-01` is the Grade 2
  pattern (Grade 5's bare `diagnostic-01` is the pre-prefix legacy and must not be copied). ✔
- Four module drills for four domains (OA, NBT, MD, G) — correct, Grade 1 has no NF domain. ✔
- Diagnostic of 23 items = one per standard. ✔ `timeLimitMinutes: 30` is a judgement call and
  defensible.
- `ssa: { passingPercent: 80, targetsGrade: 1 }` matches the Global Constraint. ✔
- `label: 'Grade 1 Mathematics'` matches the Grade 5/2 pattern. ✔
- The privacy grep at Step 5 currently returns **no output** over `src/` — verified by running it. ✔
- Spec §13 exists at line 437, `## 13. Verification the author must perform`. ✔
- The Self-Review's ordering claim ("the register task (11, 16, 21, 26) must come last") is
  consistent with the Global Constraint that a grade registers in the same task that flips
  `contentComplete`. ✔

**Not a finding (in-flight work, per instruction):** `src/curriculum/grade4/authored.md.ts`,
`authored.g.ts`, `src/curriculum/grade4/templates/*`, `src/curriculum/misconceptions.ts` were read
only as pattern references; their uncommitted state was not assessed.
