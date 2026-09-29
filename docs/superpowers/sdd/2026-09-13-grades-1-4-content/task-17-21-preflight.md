# Pre-flight audit — Tasks 17–21 (Grade 2)

Read-only audit, branch `feat/multi-grade-adaptive`. Method: every Grade 2
standard's requirement was derived from `src/curriculum/grade2/standards.ts`
first (and `standards.ts` itself spot-checked against
`docs/sources/nc-standards-1-5.json`), then each brief compared against it.

**Source fidelity check (prerequisite).** `docs/sources/nc-standards-1-5.json`
key `"2"` was dumped in full and compared line-by-line with
`src/curriculum/grade2/standards.ts`. All 23 codes, all `description` texts and
every `keyConcepts` bullet match the JSON, modulo two harmless normalisations:
`NC.2.MD.3`'s JSON typo "Estimate lengths in using standard units" is smoothed
to "Estimate lengths using standard units", and the trailing-colon lead-ins
("…when solving:", "…within 100, by:") are folded into the bullets.
`standards.ts` is therefore a faithful proxy and is used as the source of truth
below.

**Grade 2 standard inventory (the ground truth used throughout):**
OA 4 — `NC.2.OA.1/2/3/4`. NBT 8 — `NC.2.NBT.1`…`.8`. MD 9 — `NC.2.MD.1`…`.8`
plus `NC.2.MD.10` (no `MD.9`). G 2 — `NC.2.G.1`, `NC.2.G.3` (no `G.2`).
Total 23.

---

## Task 17 — Grade 2 OA and Geometry

### 17-1. `NC.2.OA.1`: the two-step half of the standard is silently dropped

1. **The brief says** (Step 3): "OA: at least three items per standard, twelve
   minimum. Errors worth naming: counting on by ones and landing one short;
   choosing addition because the word 'more' appeared, in a problem that needed
   subtraction; …" and (Step 4) "Templates for addition and subtraction within
   100 in a word-problem frame (`NC.2.OA.1`)". Nothing in the brief mentions
   two-step problems or unknown position.
2. **The source says** — `standards.ts`, `NC.2.OA.1`:
   > description: 'Represent and solve addition and subtraction word problems,
   > within 100, **with unknowns in all positions**, by using representations and
   > equations **with a symbol for the unknown number** to represent the problem.'
   > keyConcepts: [
   >   'One-step problems: Add to/Take from-Start Unknown',
   >   'One-step problems: Compare-Bigger Unknown',
   >   'One-step problems: Compare-Smaller Unknown',
   >   '**Two-step problems involving single digits**: Add to/Take from-Change Unknown',
   >   '**Two-step problems involving single digits**: Add to/Take From-Result Unknown'
   > ]
3. **The source is right.** Five of the five bullets name a problem *type*, and
   two of them are two-step. A "word-problem frame" generator plus three items
   satisfies `assertAuthoredBankSound`'s three-item floor while covering only
   Start-Unknown one-steppers — a third of the standard, with a green suite.
   Start Unknown and Compare-Smaller Unknown are also the two hardest types in
   the list; an implementer left to choose will pick Result Unknown, the one
   type the standard does *not* list for one-step problems.
4. **Correction.** Rewrite Step 3's OA.1 sentence to require coverage of all
   five named bullets: at least one item each for Start Unknown, Compare-Bigger
   Unknown, Compare-Smaller Unknown, and at least one two-step single-digit item
   (Change Unknown or Result Unknown). Raise OA.1's floor from 3 to 5 and state
   it. Require every item to show an equation with a symbol for the unknown
   (in `promptDetails` or the prompt), since the description mandates it.
5. **Cost if wrong.** If the correction over-specifies, Grade 2 OA carries two
   extra authored items. If it is omitted, the standard ships a third covered
   and the gap is invisible to every test in the repo.

### 17-2. `NC.2.OA.3` number range unstated, and the equation bullet dropped

1. **The brief says** (Step 4): "for odd and even and for arrays (`NC.2.OA.3`,
   `NC.2.OA.4`)". No range. Step 3's only OA.3 error is "calling an odd number
   even because it ends in a digit the child associates with pairs."
2. **The source says** — `NC.2.OA.3`:
   > description: 'Determine whether a group of objects, **within 20**, has an odd
   > or even number of members.'
   > keyConcepts: ['Pairing objects, then counting them by 2s',
   >   'Determining whether objects can be placed into two equal groups',
   >   '**Writing an equation to express an even number as a sum of two equal addends**']
3. **The source is right.** Two defects: (a) the range `within 20` is unstated,
   so a generator will happily emit "Is 137 odd or even?" — outside the
   standard and, per the Content Contract's age rule, outside what a Grade 2
   item may ask; (b) bullet 3 (write `14 = 7 + 7`) is a distinct skill the brief
   never mentions.
4. **Correction.** State `within 20` as a hard bound on the OA.3 generator's
   sampled group size. Add to Step 3: at least one OA.3 item asking the student
   to pick the equation expressing an even number as a sum of two equal addends.
5. **Cost if wrong.** Near zero to add the bound. Omitting it ships an
   out-of-grade generator that no test can catch, because no test knows the
   range.

### 17-3. `NC.2.OA.4` array bound unstated, the equation bullet dropped, and the named error is unconstructible

1. **The brief says** (Step 4): "…and for arrays (`NC.2.OA.3`, `NC.2.OA.4`)".
   Step 3's OA.4 error: "miscounting an array by counting a shared row or column
   twice."
2. **The source says** — `NC.2.OA.4`:
   > 'Use addition to find the total number of objects arranged in rectangular
   > arrays with **up to 5 rows and up to 5 columns**; **write an equation to express
   > the total as a sum of equal addends**.'
   > keyConcepts: ['Arrays with up to 5 rows and up to 5 columns',
   >   'Finding the total by adding, not by counting every object',
   >   'Writing an equation expressing the total as a sum of equal addends']
3. **The source is right.** The 5×5 ceiling is stated twice in the source and
   zero times in the brief; a generator sampling 3–8 rows is out of grade. The
   equation-as-repeated-addition bullet is the *point* of the standard (it is
   the bridge to Grade 3 multiplication, as the domain description says) and the
   brief never asks for it. Worse, Step 3's named error — "counting a shared row
   or column twice" — is a *perimeter/overlap* error, not an array error; in a
   rectangular array no row or column is shared, so the named error cannot
   produce an offerable distractor. That is a Category-F defect: the implementer
   must invent something to fill it.
4. **Correction.** Bound the OA.4 generator to rows ∈ [2,5], cols ∈ [2,5].
   Require at least one OA.4 item whose four options are candidate *equations*
   (`4 + 4 + 4 = 12` vs `4 + 3 = 7` vs `3 + 3 + 3 + 3 = 12` …). Replace the
   "shared row or column" error with one that actually occurs: adding rows +
   columns instead of repeatedly adding (3 rows of 4 → "7"), or repeating the
   wrong addend (4 + 4 + 4 for a 4-row × 3-column array counted the other way).
5. **Cost if wrong.** A distractor that cannot be constructed forces the
   implementer to fabricate a filler number, which `labelOptions()` will accept
   as long as *some* tag is attached — and a mis-filed tag tells a parent their
   child made an error they did not make (Global Constraints).

### 17-4. `NC.2.OA.2` is a mental-strategy standard; range and calculator flag unstated

1. **The brief says** (Step 4): "for fluency within 20 (`NC.2.OA.2`)".
2. **The source says** — `NC.2.OA.2`:
   > 'Demonstrate fluency with addition and subtraction, within 20, **using mental
   > strategies**.'
   > keyConcepts: ['**Mental strategies rather than counting one by one**', …]
3. **The brief is right to template it** — fluency is exactly the case where
   fresh numbers are the practice — but the range and the calculator flag are
   unstated. `calculatorAllowed` must be `false` for every OA.2 item; a fluency
   standard answered with a calculator assesses nothing.
4. **Correction.** Add to Step 4: OA.2's generator samples both addends so the
   sum stays ≤ 20 and minuends ≤ 20, and emits `calculatorAllowed: false`.
   State the same for OA.1 and OA.3.
5. **Cost if wrong.** Low either way; but an uncapped fluency generator emitting
   `13 + 14` is out of grade and nothing fails.

### 17-5. Geometry: `NC.2.G.3`'s third bullet is the standard's one reasoning idea and is absent

1. **The brief says** (Step 3): "G: … Errors are definitional: naming a shape by
   its orientation …; counting a cube's faces as four because only four are
   visible in the picture; partitioning a rectangle into unequal parts and
   calling them halves."
2. **The source says** — `NC.2.G.3`:
   > 'Partition circles and rectangles into two, three, or four equal shares.'
   > keyConcepts: ['Describe the shares using the words halves, thirds, half of,
   >   a third of, fourths, fourth of, quarter of',
   >   'Describe the whole as two halves, three thirds, four fourths',
   >   '**Explain that equal shares of identical wholes need not have the same shape**']
3. **The source is right.** Bullet 3 is the only non-routine idea in Grade 2
   Geometry (a rectangle halved diagonally and one halved vertically are both
   halves) and is the classic NC/CCSS assessment item for this standard. The
   brief's three errors all speak to G.1 and to bullet 1 only. Also absent: the
   "describe the whole as two halves / three thirds / four fourths" bullet,
   which is a different question from naming a share.
4. **Correction.** Require, of G.3's three items: one naming a share
   (halves/thirds/fourths), one describing the whole ("four fourths make one
   whole"), and one on equal shares of identical wholes having different shapes.
5. **Cost if wrong.** One extra authored item. Omitted, `NC.2.G.3` ships as
   vocabulary drill and the grade's only reasoning standard goes untaught.

### 17-6. `NC.2.G.1` covers 2-D polygons *and* 3-D solids; a floor of 3 cannot cover both

1. **The brief says** (Step 3): "G: at least three items per standard, six
   minimum."
2. **The source says** — `NC.2.G.1`:
   > 'Recognize and draw triangles, quadrilaterals, pentagons, and hexagons,
   > having specified attributes; recognize and describe attributes of
   > rectangular prisms and cubes.'
3. **The source is right.** This is two standards wearing one code: four named
   polygon families *plus* two named solids. Three items cannot cover both
   halves and leave any of the four polygon names tested.
4. **Correction.** Raise `NC.2.G.1`'s floor to 5 and state the split: at least
   three polygon items covering triangle/quadrilateral/pentagon/hexagon by
   attribute (side count, vertex count), and at least two on rectangular prisms
   and cubes (faces, edges, vertices). `assertAuthoredBankSound` takes one floor
   for the whole domain, so add an explicit per-standard count assertion for G.1
   in `authored.g.test.ts`.
5. **Cost if wrong.** Two extra items. Omitted, the "draw a shape with specified
   attributes" half of the standard, which is where NC actually assesses it,
   never appears.

### 17-7. The brief never says these items must be non-image, and the whole domain is figural

1. **The brief says** nothing about how a shape is presented. Task 19 *does*
   say "no image assets"; Task 17 does not, and Geometry is the domain that most
   needs it.
2. **The source** is silent (it is a standards document), but the Content
   Contract requires `promptDetails` "for an expression, a table, or a figure
   description", and the repo has no image pipeline.
3. **The contract is right.** Without the instruction, an implementer writing
   "Look at the shape below" produces an unanswerable item.
4. **Correction.** Copy Task 19's sentence into Task 17: every shape, array or
   solid is described in `promptDetails` as text ("a closed figure with 5
   straight sides"), never referenced as a picture.
5. **Cost if wrong.** None to add. Omitted, it produces items that render as a
   prompt with nothing to look at — and no test detects it.

---

## Task 18 — Grade 2 Number & Operations in Base Ten

### 18-1. **`NC.2.NBT.6` says THREE two-digit numbers. The brief says four. This is imported Common Core.** *(most serious finding in the batch)*

1. **The brief says** (Step 4): "adding up to **four** two-digit numbers
   (`NC.2.NBT.6`)".
2. **The source says** — `standards.ts`, `NC.2.NBT.6`:
   > title: 'Add Up to **Three** Two-Digit Numbers',
   > description: 'Add up to **three** two-digit numbers using strategies based on
   > place value and properties of operations.'
   > keyConcepts: ['Adding **three** two-digit numbers in one problem', …]

   And `docs/sources/nc-standards-1-5.json`, key `"2"`:
   > "code": "NC.2.NBT.6", "text": "Add up to **three** two-digit numbers using
   > strategies based on place value and properties of operations."
3. **The source is right, and the brief is quoting CCSS.** CCSS 2.NBT.B.6 is
   "Add up to **four** two-digit numbers using strategies based on place value
   and properties of operations" — NC's revision reduced it to three, and the
   brief reproduced the Common Core wording verbatim. Same defect class as
   `NC.4.NBT.7` "rounding": model recall of CCSS overwriting the NC text.
   Concretely: four two-digit addends total up to 396, so a "four addends"
   generator routinely emits sums above 300 with two regroupings — out of grade
   for `NBT.6` and harder than anything `NBT.5` (within 100) permits.
4. **Correction.** Change Step 4 to "adding up to **three** two-digit numbers
   (`NC.2.NBT.6`)", and bound the generator: two or three addends, each in
   [10,99]. The Global Constraint applies verbatim — "when a brief and
   `standards.ts` disagree, `standards.ts` wins."
5. **Cost if wrong.** If the standard genuinely said four and we cut to three,
   students practise a slightly easier case. If we ship four, the app teaches
   NC Grade 2 a Common Core requirement NC removed, in the domain the plan has
   already shipped one fabricated standard into.

### 18-2. `NC.2.NBT.1`: the "various groupings" bullet — the hardest and most-assessed idea — is dropped

1. **The brief says** (Step 4): "three-digit place value (`NC.2.NBT.1`)".
   Step 3 names only "reading 407 as 'forty-seven'".
2. **The source says** — `NC.2.NBT.1`:
   > keyConcepts: ['**Unitize by making a hundred from a collection of ten tens**',
   >   'Demonstrate that the numbers 100, 200, …, 900 refer to one, …, nine
   >   hundreds, with 0 tens and 0 ones',
   >   '**Compose and decompose numbers using various groupings of hundreds, tens,
   >   and ones**']
3. **The source is right.** "Various groupings" means 243 = 2 hundreds + 4 tens
   + 3 ones *and* 1 hundred + 14 tens + 3 ones. That non-standard decomposition
   is what makes regrouping in `NBT.7` make sense, and it is the single item
   type NC assesses this standard with. "Three-digit place value" as written
   yields nothing but "what digit is in the tens place".
4. **Correction.** Add to Step 3: at least one `NBT.1` item on non-standard
   decomposition (which grouping also equals 243?), and one on unitizing ten
   tens as one hundred. Keep the digit-value item as the third.
5. **Cost if wrong.** One or two items. Omitted, `NBT.1` ships as digit-naming
   and the regrouping standards downstream have no conceptual base.

### 18-3. `NC.2.NBT.2`: "Count within 1000" is dropped and the skip-count set is unstated

1. **The brief says** (Step 4): "skip counting (`NC.2.NBT.2`)".
2. **The source says** — `NC.2.NBT.2`:
   > 'Count within 1000; skip-count by **5s, 10s, and 100s**.'
   > keyConcepts: ['**Counting within 1,000**', 'Skip-counting by 5s',
   >   'Skip-counting by 10s and 100s']
3. **The source is right.** Two things: the plain counting-within-1000 bullet
   (count on from 697) is a separate skill from skip-counting, and the three
   permitted step sizes are 5, 10, 100 — *not* 2s, 3s or 25s, which a generator
   left unbounded will produce.
4. **Correction.** State: the `NBT.2` generator samples its step from exactly
   {5, 10, 100} and its start so the whole displayed sequence stays within
   1–1000; add at least one authored count-on-within-1000 item.
5. **Cost if wrong.** Nil to add. Omitted, a generator emitting "skip-count by
   3s" teaches a Grade 3 skill under a Grade 2 code.

### 18-4. Step 3's fourth named error is arithmetically impossible

1. **The brief says** (Step 3): "counting by tens from 380 and going to 390,
   400, 410 but writing **300, 400, 500**."
2. **The source** is not the issue — arithmetic is. 300, 400, 500 is counting by
   *hundreds* starting at 300, and no process starting at 380 and stepping by
   ten produces 300 as its first output.
3. **The brief is wrong.** As stated the error cannot generate an offerable
   distractor, so an implementer will either fabricate one (a filler number with
   a tag that names an error the child did not make — explicitly forbidden by
   Global Constraints) or quietly drop the tag.
4. **Correction.** Replace with an error that is real and reachable: stepping by
   ten but failing to carry across the hundred, 380 → 390 → **3100** or 380 →
   390 → **300**; or confusing the step size, 380 → 480 → 580 (counting by
   hundreds when asked for tens). Any of these is a constructible distractor.
5. **Cost if wrong.** If the replacement error is less common than intended, a
   distractor is merely under-chosen. If the impossible one is left in, the
   misconception vocabulary gains a tag no item can honestly carry.

### 18-5. Ranges unstated on five of the eight NBT generators

1. **The brief says** (Step 4) one clause per standard with no numeric bounds
   for `NBT.1`, `NBT.2`, `NBT.3`, `NBT.4`, `NBT.8`.
2. **The source says**, respectively:
   > `NBT.1` — 'the **three digits of a three-digit number**' (100–999)
   > `NBT.3` — 'Read and write numbers, **within 1000**, using base-ten numerals,
   >   number names, and expanded form.'
   > `NBT.4` — 'Compare **two three-digit numbers** … using **>, =, and <** symbols'
   > `NBT.8` — 'Mentally add 10 or 100 to a given number **100–900**, and mentally
   >   subtract 10 or 100 from a given number **100–900**.'
   >   keyConcepts: [… '**Numbers in the range 100–900**']
3. **The source is right on every one.** `NBT.8` is the sharpest: 100–900 is
   stated twice, and a generator sampling 100–999 will emit "920 + 100", whose
   answer 1020 is outside the grade's number system entirely. `NBT.4` names the
   three symbols `>`, `=`, `<` — the `=` case (two equal three-digit numbers) is
   the one implementers always skip, and without it "compare" degenerates to
   "which is bigger". `NBT.3` names three forms, so the generator must rotate
   among numeral, word form and expanded form rather than pick one.
4. **Correction.** Add explicit bounds to Step 4: `NBT.1` 100–999; `NBT.2` start
   and full sequence within 1–1000, step ∈ {5,10,100}; `NBT.3` 100–999 with the
   presented form and asked form drawn from {numeral, number name, expanded
   form} and never equal; `NBT.4` both operands 100–999, with at least one
   fixed-seed test pinning an `=` case; `NBT.5` within 100; `NBT.6` two or three
   addends in [10,99]; `NBT.7` within 1000, result ≥ 0; `NBT.8` given number
   100–900 and delta ∈ {+10, −10, +100, −100}.
5. **Cost if wrong.** Tightening a range costs variety. Leaving them unstated
   ships generators whose out-of-grade output no test in the repo can see, since
   `assertTemplateSound()` checks structure, not curricular range.

### 18-6. Minor: `NC.2.NBT.8` is "10 **or** 100", not "10 and 100"

The brief's Step 4 reads "adding or subtracting 10 and 100 mentally". The source
is "Mentally add 10 **or** 100 … and mentally subtract 10 **or** 100". Read
literally the brief asks for a single item doing both. Correction: "adding or
subtracting 10 or 100 mentally". Cost: cosmetic, but it is the phrasing that
leads to a two-step item under a one-step standard.

### 18-7. `NC.2.NBT.5` and `NC.2.NBT.7` are strategy standards; the brief templates them without the strategy

1. **The brief says** (Step 4): "addition and subtraction within 100
   (`NC.2.NBT.5`) … addition and subtraction within 1000 (`NC.2.NBT.7`)", and
   opens with "Every NBT standard here is computational and gets a template."
2. **The source says** — `NBT.7`:
   > 'Add and subtract, within 1000, **relating the strategy to a written method**.'
   > keyConcepts: ['Concrete models or drawings', 'Strategies based on place
   >   value', 'Properties of operations', 'Relationship between addition and
   >   subtraction']

   and `NBT.5` keyConcepts include '**Comparing addition and subtraction
   strategies, and explaining why they work**' and '**Selecting an appropriate
   strategy** in order to efficiently compute sums and differences'.
3. **The source is right.** Both standards contain an explain/select component
   that a bare computation generator cannot express — this is precisely the
   "reasoning standards stay authored" case in the Content Contract.
4. **Correction.** Keep the generators (the computation half genuinely needs
   fresh numbers) but require, in Step 3, at least one authored item per
   standard where the four options are *strategies* or *written methods* rather
   than values: "Which shows a way to find 428 + 265?", or an error-analysis
   item showing a worked method and asking where it went wrong.
5. **Cost if wrong.** Two extra authored items. Omitted, half of each standard's
   bullets are untested while `assertAuthoredBankSound` reports full coverage.

---

## Task 19 — Grade 2 Measurement & Data, and the authored aggregate

### 19-1. **Three MD codes are mis-assigned: the brief's time / money / number-line mapping is shifted by one.** *(second most serious)*

1. **The brief says** (Step 4): "Templates for measurement with a fixed unit
   (`NC.2.MD.1`, `NC.2.MD.2`), for measurement word problems (`NC.2.MD.5`), for
   **time (`NC.2.MD.6`)**, for **money (`NC.2.MD.7`)**, and for reading data
   (`NC.2.MD.10`). Standards whose item is inherently a described figure —
   estimating a length (`NC.2.MD.3`), comparing two lengths (`NC.2.MD.4`), and
   **the number line representation (`NC.2.MD.8`)** — may stay authored…"
2. **The source says** — `standards.ts`:
   > `NC.2.MD.6` — 'Represent whole numbers as lengths from 0 on a **number line**
   > diagram with equally spaced points and represent whole-number sums and
   > differences, within 100, on a number line.'
   > `NC.2.MD.7` — 'Tell and write **time** from analog and digital clocks to the
   > nearest five minutes, using a.m. and p.m.'
   > `NC.2.MD.8` — 'Solve word problems involving **money**.' keyConcepts:
   > ['Quarters, dimes, nickels, and pennies within 99¢, using ¢ symbols
   > appropriately', 'Whole dollar amounts, using the $ symbol appropriately']
3. **The source is right.** The brief has cycled the three: it assigns time to
   MD.6 (actually number line), money to MD.7 (actually time), and number line
   to MD.8 (actually money). The consequence is not cosmetic — the brief's
   routing *also decides templated vs. authored*, so as written, money and time
   generators would carry the wrong `standardCode` and the number-line standard
   is exiled to "authored" under a code that is about coins. A clock template
   emitting `standardCode: 'NC.2.MD.6'` passes `integrity.test.ts`'s "has no
   content referencing a standard outside this grade" (the code exists) and
   passes `templates/index.test.ts`'s equivalent — the mis-filing reaches the
   student's mastery record, where a child who cannot read a clock is recorded
   as weak on number lines.
4. **Correction.** Rewrite Step 4 as: templates for `NC.2.MD.1` / `NC.2.MD.2`
   (see 19-2), `NC.2.MD.5` (length word problems), **`NC.2.MD.7` (time)**,
   **`NC.2.MD.8` (money)**, `NC.2.MD.10` (reading data); authored-only:
   `NC.2.MD.3` (estimating), `NC.2.MD.4` (comparing two lengths), **`NC.2.MD.6`
   (number line)**. Note that a number-line generator is in fact feasible (fresh
   start, jump and direction) and worth reconsidering — but the authored ruling
   is defensible; the code is not.
5. **Cost if wrong.** There is no cost to the correction: it is a transcription
   fix against the sourced file. Left in, items land on the wrong standard and
   every downstream mastery figure, study-guide link and parent report misleads.

### 19-2. `NC.2.MD.2` is *two different units*; the brief calls it "a fixed unit" and merges it with MD.1

1. **The brief says** (Step 4): "Templates for **measurement with a fixed unit**
   (`NC.2.MD.1`, `NC.2.MD.2`)".
2. **The source says** — `NC.2.MD.2`:
   > 'Measure the length of an object **twice, using length units of different
   > lengths for the two measurements**; describe how the two measurements relate
   > to the size of the unit chosen.'
   > keyConcepts: ['Measuring the same object with two different-sized units',
   >   'Describing how the two measurements relate to the size of the unit
   >   chosen', '**A smaller unit gives a larger count for the same length**']
3. **The source is right, and the brief inverts the standard.** `MD.2` is the
   inverse-relationship standard — its entire content is that measuring in
   centimetres gives a *bigger number* than measuring the same pencil in inches.
   "Fixed unit" is `MD.1`'s frame, and folding `MD.2` into it deletes `MD.2`
   entirely. This is also the standard most likely to be lost silently, because
   an implementer can write three ruler-reading items tagged `NC.2.MD.2` and
   pass every test.
4. **Correction.** Split Step 4: one template for `MD.1` (choose the appropriate
   tool / read a described ruler in one standard unit) and a separate template
   for `MD.2` whose generated item gives the same object measured in two units
   and asks which count is larger, or why. State that they must not share a
   `templateId` — per the `nbt4-add` / `nbt4-subtract` precedent documented in
   `src/curriculum/grade4/templates/index.ts`, a seedless review key makes one
   template spanning two skills unable to re-test the failed one.
5. **Cost if wrong.** One extra generator. Omitted, `NC.2.MD.2` ships as a
   duplicate of `MD.1`.

### 19-3. Unit systems and ranges unstated across MD — and NC Grade 2 uses **both** customary and metric

1. **The brief says** nothing about units anywhere except Step 3's example
   "measuring a pencil in metres" (offered as a *wrong* answer), and nothing
   about ranges.
2. **The source says**:
   > `NC.2.MD.1` — 'selecting and using appropriate tools such as **rulers,
   > yardsticks, meter sticks, and measuring tapes**'
   > `NC.2.MD.3` — 'Estimate lengths using standard units of **inches, feet,
   > yards, centimeters, and meters**.'
   > `NC.2.MD.4` — 'expressing the length difference in terms of **a standard
   > length unit**'
   > `NC.2.MD.5` — 'Use addition and subtraction, **within 100**, … lengths that
   > are **given in the same units**'
   > `NC.2.MD.6` — 'sums and differences, **within 100**, on a number line'
   > `NC.2.MD.7` — 'to the **nearest five minutes**, using **a.m. and p.m.**'
   > `NC.2.MD.8` — 'Quarters, dimes, nickels, and pennies **within 99¢**, using
   > **¢** symbols appropriately' / 'Whole dollar amounts, using the **$** symbol'
   > `NC.2.MD.10` — 'interpret data with **up to four categories**' / '**single-unit
   > scale**'
3. **The source is right, and these are exactly the divergence points the plan
   warns about.** NC Grade 2 is explicitly *bi-systemic* — inches/feet/yards
   **and** centimetres/metres — unlike NC Grade 3 (customary capacity and mass)
   and NC Grade 4 (metric). An implementer carrying the Grade 3/4 habit forward
   will pick one system and lose half of `MD.3`. Each other bound has a concrete
   failure: an unbounded `MD.5` generator emits sums over 100; an unbounded
   `MD.7` generator emits 3:47 (Grade 3); an unbounded `MD.8` generator emits
   $1.25 mixed coin-and-dollar amounts, which the standard deliberately
   separates into coins-under-99¢ and whole dollars; an unbounded `MD.10`
   generator emits six categories or a scale of 2 (Grade 3's scaled graphs).
4. **Correction.** State per standard in Step 4: `MD.1` / `MD.3` must between
   them cover inches, feet, yards, centimetres and metres — at least one item in
   each system; `MD.4` differences in a single named standard unit; `MD.5` all
   lengths in the same unit and all sums and differences within 100; `MD.6`
   within 100 with equally spaced whole-number points; `MD.7` minutes restricted
   to multiples of 5, every item carrying a.m. or p.m.; `MD.8` either a coin
   collection totalling ≤ 99¢ written with ¢, or whole dollars written with $,
   never mixed; `MD.10` at most four categories, single-unit scale.
5. **Cost if wrong.** Each bound narrows variety slightly. Unstated, seven of
   nine MD generators can emit out-of-grade items invisibly — and the money and
   time bounds are the ones a parent would notice first.

### 19-4. `NC.2.MD.10` drops the "organize and represent" half

1. **The brief says** (Step 4): "for **reading data** (`NC.2.MD.10`)".
2. **The source says**:
   > 'Organize, represent, and interpret data with up to four categories.'
   > keyConcepts: ['**Draw a picture graph and a bar graph with a single-unit
   > scale to represent a data set**', 'Solve simple put-together, take-apart,
   > and compare problems using information presented in a picture and a bar
   > graph']
3. **The source is right.** "Reading data" is bullet 2 only. Bullet 1 —
   *building* the graph from a data set — is a distinct skill, and in a
   four-option format it is askable: given a tally, which bar graph is correct?
   (options described in `promptDetails` as text).
4. **Correction.** Require at least one `MD.10` item where the data set is given
   and the options are candidate graphs, and at least one put-together /
   take-apart / compare question read *off* a described graph. State explicitly
   that NC Grade 2 has **no line plots** — `NC.2.MD.9` does not exist in NC
   (CCSS 2.MD.D.9 does). An implementer reaching for line plots here would
   repeat the Grade 4 fractional-line-plot defect one grade down.
5. **Cost if wrong.** One extra item. Omitted, half the standard is untested and
   the missing half is the one with a natural four-option form.

### 19-5. Step 3's error list is about rulers and clocks; three standards get none

1. **The brief says** (Step 3): "Grade 2 measurement errors to name: measuring
   from the end of a ruler rather than from zero; counting tick marks instead of
   intervals; reading a clock's minute hand as the hour; counting a coin
   collection by coin rather than by value; picking the wrong unit entirely
   (measuring a pencil in metres)."
2. **The source says** — `NC.2.MD.5`:
   > 'Use addition and subtraction, within 100, to solve word problems involving
   > lengths … using **equations with a symbol for the unknown number** to
   > represent the problem.'
3. **The source is right.** Five errors are listed for nine standards, and none
   of them is an `MD.2`, `MD.5` or `MD.6` error. `MD.5`'s characteristic errors
   are operation choice (adding when the question asks how much *longer*) and
   solving for the wrong unknown; `MD.6`'s is counting the number line's tick
   marks rather than its jumps (distinct from `MD.1`'s ruler version); `MD.2`'s
   is expecting the *larger* unit to give the larger count.
4. **Correction.** Add those four errors to Step 3, and require an `MD.5` item
   whose four options are candidate *equations* with a symbol for the unknown,
   since the description mandates that representation.
5. **Cost if wrong.** Nil to add. Omitted, three standards get distractors
   borrowed from a different standard's error set and their tags mis-attribute.

### 19-6. The aggregate test lives in the MD domain file and under-asserts

1. **The brief says** (Step 1) to put `describe('grade 2 authored aggregate')`,
   including "carries every item exactly once" and "covers every grade 2
   standard", inside `src/curriculum/grade2/authored.md.test.ts`.
2. **The source says** — Task 9's equivalent aggregate test, quoted in
   `task-9-brief.md` Step 1:
   > ```ts
   > it('carries every domain bank exactly once', () => {
   >   const ids = GRADE_4_AUTHORED.map((q) => q.id);
   >   expect(new Set(ids).size).toBe(ids.length);
   >   for (const q of GRADE_4_G_AUTHORED) {
   >     expect(ids).toContain(q.id);
   >   }
   > });
   > ```
3. **Task 9's version is right and Task 19 dropped the membership loop.** An
   aggregator that forgets `GRADE_2_G_AUTHORED` still passes "carries every item
   exactly once", and "covers every grade 2 standard" only catches it because a
   *standard* is then orphaned — which it would be here, but would not be if a
   domain were partially included. The one job of an aggregator is that nothing
   was left out, and that is the assertion missing.
4. **Correction.** Move the aggregate `describe` into its own
   `src/curriculum/grade2/authored.test.ts` (matching Grade 5's layout, so a
   failure names the right file), and add four membership loops, one per domain
   bank.
5. **Cost if wrong.** Small. Omitted, the aggregator's only real invariant is
   untested.

### 19-7. No template naming convention is stated for MD

Tasks 17 and 18 state `g2.<domain><tail>.<slug>` and `g2.nbt<tail>.<slug>`;
Task 19 states none. Correction: state `g2.md<tail>.<slug>` (e.g.
`g2.md7.clock-to-five`), matching the shipped Grade 4 form
`g4.oa1.times-as-many` (`src/curriculum/grade4/templates/oa1-times-as-many.ts:93`).
Cost: nil; omitted, `templates/index.test.ts`'s unique-id check still passes but
the ids drift across three tasks.

---

## Task 20 — Grade 2 study guides

### 20-1. "Cite no percentage at all" contradicts the Content Contract's "cite the domain's share of the grade's standards"

1. **The brief says**: "**No guide may cite a percentage at all** — NCDPI
   publishes no blueprint below Grade 3, so there is no weight to cite for any
   Grade 2 domain," and (Step 3) "`whyItMattersForSSA` says what the skill
   unlocks next … **rather than citing a test**."
2. **The source says** — the plan's Content Contract (lines 13–92):
   > "`whyItMattersForSSA` must cite a real figure — the domain's blueprint band
   > for grades 3–5, **or the domain's share of the grade's standards for grades
   > 1–2** — and never a weight for a single domain inside a combined band."
3. **Both are right, and a count resolves it.** The contract asks for a *share
   of standards*; the brief forbids a *percentage*. "Measurement & Data is 9 of
   the 23 Grade 2 standards — more than any other domain" satisfies both. The
   part that genuinely conflicts is "rather than citing a test", which reads as
   forbidding the figure entirely — and a guide with no figure is what the
   contract was written to prevent. Note that `10/23` written as `39%` would
   correctly trip the brief's own `/%/` assertion, since a percentage reads as a
   blueprint weight.
4. **Correction.** Replace the brief's sentence with: "`whyItMattersForSSA`
   states the domain's share of the grade's standards **as a count, never a
   percentage** — 'this is one of the 9 Measurement & Data standards, the
   largest group in Grade 2' — and then what the skill unlocks next. It may not
   cite a test weight, because none exists." Add a test assertion that every
   `whyItMattersForSSA` contains a digit, so a guide with no figure goes red.
5. **Cost if wrong.** If the contract's requirement is dropped, Grade 2's guides
   are the only ones with no grounding figure and the contract silently does not
   apply to two of five grades. If a percentage slips in, it reads to a parent
   as an official weight — the exact defect Task 21 exists to prevent.

### 20-2. Four of the nine section assertions pass on whitespace

1. **The brief says** (Step 1):
   ```ts
   expect(g.rulesAndFormulas.length, `${code} rulesAndFormulas`).toBeGreaterThan(0);
   expect(g.stepByStepMethod.length, `${code} stepByStepMethod`).toBeGreaterThan(1);
   expect(g.commonTraps.length, `${code} commonTraps`).toBeGreaterThan(0);
   expect(g.workedExample.steps.length, `${code} worked steps`).toBeGreaterThan(1);
   ```
2. **The source says** — `src/types/index.ts`:
   > rulesAndFormulas: { label: string; detail: string }[];
   > stepByStepMethod: string[];
   > commonTraps: string[];
   > workedExample: { problem: string; steps: string[]; answer: string;
   >   whyItMattersForSSA: string };
3. **These four assert nothing about content.** They are *array* length checks,
   so `stepByStepMethod: [' ', ' ']` passes, as does
   `rulesAndFormulas: [{ label: '', detail: '' }]`. The other five assertions in
   the same block correctly use `.trim().length`; these four were not converted.
   This test is the only gate on 23 guides.
4. **Correction.** Keep the array-length checks and add element checks:
   ```ts
   for (const r of g.rulesAndFormulas) {
     expect(r.label.trim().length, `${code} rule label`).toBeGreaterThan(0);
     expect(r.detail.trim().length, `${code} rule detail`).toBeGreaterThan(0);
   }
   for (const s of [...g.stepByStepMethod, ...g.commonTraps, ...g.workedExample.steps]) {
     expect(s.trim().length, `${code} blank entry`).toBeGreaterThan(0);
   }
   ```
5. **Cost if wrong.** Nil to add. Omitted, 23 guides can ship with padded arrays
   and a green suite — and study guides are the artefact a parent reads directly.

### 20-3. The percentage check covers one field; `/blueprint/i` covers the whole guide

1. **The brief says**:
   ```ts
   expect(/%/.test(g.workedExample.whyItMattersForSSA), …).toBe(false);
   expect(/blueprint/i.test(JSON.stringify(g)), …).toBe(false);
   ```
2. **The source** — the no-blueprint rule (Global Constraints) applies to every
   claim the app makes, not to one field.
3. **The asymmetry is a defect.** A percentage in `coreConcept` ("this domain is
   about 39% of Grade 2 maths") passes, while the word "blueprint" anywhere
   fails. The looser of the two guards is on the field the rule is about.
4. **Correction.** Change the first assertion to
   `expect(/%/.test(JSON.stringify(g)), …).toBe(false)` and add
   `/EOG|end-of-grade|state test/i` to the forbidden set — Grade 2 has no EOG,
   so a guide promising one is the same fabrication in different words.
5. **Cost if wrong.** A legitimate percentage inside a *mathematical* guide
   would trip it — but no Grade 2 standard involves percent (percent enters at
   Grade 6), so the false-positive risk at this grade is zero.

### 20-4. The guides address two readers and the brief only half says which is which

1. **The brief says** (Step 3): "at the depth described in Task 10 Step 3 but
   pitched at a seven-year-old **and the adult sitting beside them**."
2. **The source says** — the Content Contract: "A Grade 1 or 2 item may not
   require reading a paragraph to find the arithmetic," and the shipped Grade 5
   guides, `src/curriculum/grade5/studyGuides.ts:32`:
   > whyItMattersForSSA: 'CASE questions frequently test nested grouping symbols
   > to verify that the student does not make left-to-right priority errors.'
3. **The brief is right in intent but ambiguous in effect.** Grade 5's guides
   are written entirely for an adult; an implementer mirroring that file will
   produce 23 adult-only guides, and nothing in the test suite measures reading
   level.
4. **Correction.** State the split: `coreConcept`, `stepByStepMethod` and
   `workedExample.problem` / `steps` / `answer` are read by or to the child —
   short sentences, one clause, numbers inside the standard's range;
   `commonTraps`, `rulesAndFormulas` and `whyItMattersForSSA` address the adult.
   Add that `workedExample.problem` must satisfy the same age rule as an item
   prompt.
5. **Cost if wrong.** If over-specified, some guides read slightly simply.
   Omitted, the child-facing half of 23 guides is unreadable by its audience.

---

## Task 21 — Register Grade 2, and stop the UI claiming a blueprint

### 21-1. **Two existing `registry.test.ts` assertions go red on registration, and the brief expects a green suite.** *(the unlisted breakage the Grade 3 and Grade 4 audits both found)*

1. **The brief says** — Files: "Test: `src/curriculum/registry.test.ts`", and
   Step 1 appends only a new `describe('weight headings')` block. Step 7: "Run:
   `npm test -- --run`. Expected: PASS."
2. **The source says** — `src/curriculum/registry.test.ts` as it stands today:
   > ```ts
   > it('throws for a grade with no curriculum module', () => {
   >   expect(() => getCurriculum(3)).toThrow(/no curriculum/i);
   > });
   > it('lists only grades that actually have modules', () => {
   >   expect(listCurricula().map((c) => c.grade)).toEqual([5]);
   > });
   > ```

   and `task-12-16-rulings.md` line 149:
   > "**16-2** Add `src/curriculum/registry.test.ts` to the Files list. TWO
   > assertions go red … the `getCurriculum(3)` throw case **moves to a grade
   > that still has no module (1 or 2)**, and `listCurricula()` becomes …"
3. **The existing test is right and is about to be stale again.** Task 16's
   ruling moves the throw case to grade 1 *or 2* — if the Task 16 implementer
   picks 2, Task 21 turns it red; if they picked 1 it survives. Either way
   `listCurricula()` is pinned to an explicit array Task 21 must extend by one
   element. Neither is mentioned. This is the third consecutive registration
   task to carry the same omission.
4. **Correction.** Add to Task 21's Files: "Modify:
   `src/curriculum/registry.test.ts`", and insert a step before Step 7: update
   the `getCurriculum(…)` throw case to grade 1 — the only grade still without a
   module after this task — and update the `listCurricula()` expectation to
   include `2` in sorted position. Change Step 7's expectation to name these two
   edits rather than "PASS".
5. **Cost if wrong.** If the throw case is re-pointed at a grade that later
   registers (Task 26, Grade 1), the same defect recurs one task later — so the
   correction should also note that after Task 26 the assertion is a type-level
   impossibility and should be deleted rather than re-pointed. Left unlisted,
   Task 21 ends with a red suite against its own verification gate.

### 21-2. **Quiz item ids: the brief asserts `g2.` (dot); all 84 shipped Grade 4 item ids use a hyphen**

1. **The brief says** (Step 6): "…and **every quiz item id starting with `g2.`**."
   The same step's own quiz ids use hyphens: `g2-diagnostic-01`,
   `g2-mod-oa-01`, `g2-mock-ssa-01`.
2. **The source says** — the plan's Content Contract (lines 13–92):
   > "Item ids follow the Grade 5 convention … `g4-nf1-01`, `g3-oa7-02`. The
   > separator after the grade prefix is a **HYPHEN, not a dot** — this sentence
   > said `g4.nf1-01` until Task 9-11 pre-flight found all 84 committed Grade 4
   > ids using the hyphen and a Task 11 test asserting the dot, which could not
   > have passed."

   and the shipped code, `src/curriculum/grade4/authored.nf.ts`:
   > `id: 'g4-nf1-01'`, `id: 'g4-nf1-02'`, `id: 'g4-nf1-03'`, …

   Template ids, by contrast, *do* use dots —
   `src/curriculum/grade4/templates/oa1-times-as-many.ts:93`:
   > `id: 'g4.oa1.times-as-many',`
3. **The contract and the shipped code are right.** Item ids take a hyphen,
   template ids take dots; Task 21 has applied the template rule to items. This
   is the identical defect Task 9-11 pre-flight caught in Task 11 and Task 12-16
   pre-flight caught in Task 16 (finding 16-1, `startsWith('g3.')`) — it has now
   propagated to a third registration brief unchanged.
4. **Correction.** Change Step 6 to `expect(id.startsWith('g2-'))`. Additionally
   give Tasks 17–19 the item-id rule explicitly, since **none of the three
   states it**: `g2-oa1-01`, `g2-nbt6-02`, `g2-md7-03` — the standard's tail
   lowercased, then a two-digit ordinal. Leave the template convention
   (`g2.oa1.<slug>`) alone; it is correct in Tasks 17 and 18.
5. **Cost if wrong.** If items were renamed to dots to satisfy the assertion,
   Grade 2 would be the only grade whose item ids differ from every other
   grade's, and the shared testkit's id checks would not notice. As written, the
   assertion cannot pass and the task ends red.

### 21-3. The heading is fixed but the **value** beside it still reads "No state assessment at this grade"

1. **The brief says** (Step 5): "replace the hardcoded `NC Blueprint Weight`
   label text with `{weightHeading(curriculum)}`".
2. **The source says** — `src/components/CurriculumView.tsx:94`:
   > `NC Blueprint Weight: {weightLabel(curriculum, domain.id)}`

   `src/curriculum/grade2/standards.ts`, every domain:
   > `officialWeightRange: 'No state assessment at this grade',`

   and `src/curriculum/registry.ts`:
   > `export function weightLabel(c, domainId) { … return domain.officialWeightRange; }`
3. **The source is right and the brief's fix is incomplete.** After the change a
   Grade 2 parent reads **"Share of Grade Standards: No state assessment at this
   grade"** — a heading promising a share, followed by a non-answer. The same
   string lands in the printed report's weight column
   (`PrintReportModal.tsx:157`). `domainWeight(curriculum, domain.id)` already
   computes the right number for an unweighted grade (standards in domain ÷
   total × 100): MD 39.13, NBT 34.78, OA 17.39, G 8.70.
4. **Correction.** Extend `weightLabel` (or add a sibling) so that for
   `weighting.kind === 'even-by-standard-count'` it returns the share as a
   count — e.g. `9 of 23 standards` — and use it in both components. Prefer the
   count form over a bare percentage, which would sit beside a mastery
   percentage in the print table and read as official (and matches 20-1). Add an
   assertion to `registry.test.ts` pinning `weightLabel(getCurriculum(2), 'MD')`
   so it cannot regress to the "No state assessment" string.
5. **Cost if wrong.** If the count form is judged too verbose for the table
   column, a percentage is the fallback — but it must then carry the "Share of
   Grade Standards" heading in both components without exception. Left unfixed,
   the column is meaningless for a whole grade.

### 21-4. `Dashboard.tsx` makes the same blueprint claim, is not in the Files list, and breaks the brief's own grep gate

1. **The brief says** (Step 5): "Run `grep -rn \"Blueprint Weight\\|blueprint weight\" src/`
   afterwards; every remaining occurrence must sit inside `weightHeading` or
   behind a `weighting.kind` check." Its Files list names only
   `CurriculumView.tsx` and `PrintReportModal.tsx`.
2. **The source says** — that grep, run today, returns six hits:
   > `src/components/CurriculumView.tsx:94` — `NC Blueprint Weight: {weightLabel(…)}`
   > `src/components/Dashboard.tsx:91` — `<p className="text-xs text-slate-500">Weighted by official NC EOG blueprint domain weights</p>`
   > `src/components/PrintReportModal.tsx:142` — `<th className="p-2.5 font-bold">NC Blueprint Weight</th>`
   > `src/components/PrintReportModal.tsx:273` — `1. <strong>Focus by Blueprint Weight:</strong> Prioritize the domains with the highest NC EOG blueprint weight above, …`
   > `src/curriculum/grade5/grade5.test.ts:22, 40` — test prose

   `Dashboard.tsx:91` sits directly under the heading "Overall SSA Readiness
   Gauge" and is rendered for every grade unconditionally.
3. **The source is right on both counts.** For Grade 2 that line asserts the
   readiness figure is "Weighted by official NC EOG blueprint domain weights",
   which is false in the same way the column heading is — and it is a *larger*
   claim, because it describes the number the parent acts on. The brief's grep
   gate therefore cannot be satisfied while it stands, so the task's own
   verification step fails on a file the task is not permitted to touch.
   (`grade5.test.ts:40`'s "blueprint weights summing" also matches and is
   benign — the gate should be scoped to `src/components/` or exclude `*.test.ts`.)
4. **Correction.** Add `src/components/Dashboard.tsx` to Task 21's Files and
   make line 91 conditional on `curriculum.weighting.kind`: blueprint grades keep
   the sentence, an even-by-standard-count grade reads "Weighted by each domain's
   share of this grade's standards". Also note in Step 5 that
   `PrintReportModal.tsx:273` contains **two** claims on one line — the bold
   label "Focus by Blueprint Weight:" as well as the sentence — and both must be
   conditional. Scope the grep to `src/components/`.
5. **Cost if wrong.** A conditional sentence costs four lines. Left as is, the
   task ships having declared the UI honest while the most prominent number on
   the dashboard still cites a blueprint that does not exist — precisely the
   defect the task was written to remove.

### 21-5. The diagnostic quiz is specified without `isDiagnostic`, which `integrity.test.ts` requires

1. **The brief says** (Step 4): "`g2-diagnostic-01` (one item per standard, 23
   items, `timeLimitMinutes: 35`), four module drills …, and `g2-mock-ssa-01` of
   roughly 25 items".
2. **The source says** — `src/curriculum/integrity.test.ts`:
   > ```ts
   > it('gives every grade at least a diagnostic', () => {
   >   expect(c.quizzes.some((q) => q.isDiagnostic), `grade ${c.grade} has no diagnostic`).toBe(true);
   > });
   > ```

   and `src/types/index.ts`, `QuizDefinition`: `isDiagnostic?: boolean;`,
   `isMockAssessment?: boolean;`, and
   > `subtitle: string | ((curriculum: GradeCurriculum) => string);` — "A plain
   > string, or a function of the active curriculum for the rare subtitle that
   > needs to cite a standard count or the passing cutoff — those must never be
   > baked in as grade-5 literals (Ruling F11)."

   Task 16's equivalent step *does* say "`isDiagnostic: true` … subtitle a
   function of the curriculum"; Task 21's does not.
3. **The source is right.** `isDiagnostic` is optional in the type, so omitting
   it compiles; the grade then registers with `contentComplete: true` and
   `integrity.test.ts` goes red on a `describe.each` block that only runs for
   *registered* curricula — so the failure appears for the first time inside
   Task 21's Step 7 with no obvious cause.
4. **Correction.** Restore Task 16's wording: `g2-diagnostic-01` carries
   `isDiagnostic: true` and a subtitle that is a function of the curriculum;
   `g2-mock-ssa-01` carries `isMockAssessment: true` and `timeLimitMinutes`.
   Also state that every `questionIds` entry must name an **authored** item —
   `integrity.test.ts`'s "defines quizzes that only reference this grade's own
   questions" builds its id set from `c.source.authoredFor(code)` alone, so a
   quiz citing a template id fails.
5. **Cost if wrong.** Nil to add. Omitted, the task hits two integrity failures
   whose messages ("grade 2 has no diagnostic"; "quiz g2-mock-ssa-01 references
   unknown question …") arrive only after all the content is written.

### 21-6. The mock SSA's "proportion to standard count" is left uncomputed, and Geometry can round to zero

1. **The brief says**: "`g2-mock-ssa-01` of roughly 25 items split in proportion
   to each domain's standard count, since no blueprint exists to weight it by."
2. **The source says** — the standard counts are OA 4, NBT 8, MD 9, G 2 of 23.
   Proportionally over 25 items: OA 4.3, NBT 8.7, MD 9.8, G 2.2.
3. **The brief's rule is right** and is the correct analogue of Task 16's
   "allocated by band" — but Task 16 stated its resulting numbers and Task 21
   does not. Geometry rounds to 2, the minimum that still covers the domain, and
   a careless rounding gives it 1 or 0.
4. **Correction.** State the split explicitly: 4 OA, 9 NBT, 10 MD, 2 G = 25, and
   require that the two Geometry slots be one item per Geometry standard.
5. **Cost if wrong.** If the split is left to the implementer, Geometry can
   round away and the mock silently stops covering a domain.

### 21-7. Interface claims in Task 21's code blocks — verified, with two notes

The `index.ts` block in Step 4 type-checks against the repo as it stands:
`GradeCurriculum` is exported from `src/curriculum/types.ts` (the `'../types'`
path from `grade2/` resolves there, matching `grade5/index.ts`),
`makeQuestionSource` from `'../../engine/questionSource'`, and
`weighting: { kind: 'even-by-standard-count' }` is a valid member of the
`Weighting` union with no other required field. The `weightHeading` helper in
Step 3 narrows on the same discriminant `domainWeight` and `weightLabel` already
use, so it compiles as written. Two notes: (a) `grade5/index.ts` re-exports
`GRADE_5_STANDARDS`, `getStandardByCode` and `getDomainById` alongside the
domains, and `grade2/standards.ts` exports all three, so Task 21's single
re-export line is narrower than the established pattern — harmless but
inconsistent; (b) Step 6's `expect(d.officialWeightRange).not.toMatch(/%/)`
passes because every Grade 2 domain's range is the literal string
`'No state assessment at this grade'` — confirmed against the file, not assumed.

---

## E. Cross-task consistency

### E1. One row per pair sharing a file or interface

| # | Pair | Shared artefact | What one produces | What the other consumes | Agree? |
|---|---|---|---|---|---|
| 1 | 17 → 18 | `src/curriculum/grade2/templates/index.ts` | T17 **creates** it exporting `GRADE_2_TEMPLATES` | T18 **modifies** it ("Append to `GRADE_2_TEMPLATES`") | **Yes** on the contract. But neither brief asks for `templates/index.test.ts`; Grade 4 has one (unique ids, real standard codes, declared misconceptions, `assertTemplateSound` per template) and nobody creates the Grade 2 equivalent. **Gap.** |
| 2 | 17 → 19 | same file | T17 creates | T19 appends | **Yes**, same gap; plus T19 states no template id convention (19-7). |
| 3 | 18 → 19 | same file | T18 appends | T19 appends | **Yes.** Three tasks writing one file is a merge hazard in parallel; safe in the plan's sequential order. |
| 4 | 17 / 18 / 19 ↔ each other | `src/curriculum/misconceptions.ts` | each declares new tags | each reads `MISCONCEPTIONS` via the testkit | **Yes** structurally — `misconceptions.test.ts` reads `allContent.ts` (all content on disk, registered or not), so a tag declared in T17 and first used in T19 is legal. **Risk:** three tasks independently inventing Grade 2 counting and place-value tags will produce near-duplicates (`counts-tick-marks` vs `counts-marks-not-gaps`); no brief assigns ownership of the shared vocabulary. |
| 5 | 17 / 18 → 19 | `GRADE_2_OA_AUTHORED`, `GRADE_2_G_AUTHORED`, `GRADE_2_NBT_AUTHORED` | T17 and T18 export them | T19's `authored.ts` concatenates all four | **Yes** — names match exactly across the three briefs. |
| 6 | 19 → 21 | `GRADE_2_AUTHORED` from `./authored` | T19 produces | T21's `index.ts` passes to `makeQuestionSource` | **Yes.** |
| 7 | 17 / 18 / 19 → 21 | `GRADE_2_TEMPLATES` from `./templates` | T17–19 produce | T21's `index.ts` imports | **Yes.** T21's "at least 10 standards with a generator" is satisfiable: T17 promises 4, T18 8, T19 5 (after 19-1) = 17. |
| 8 | 20 → 21 | `GRADE_2_STUDY_GUIDES` | T20 produces 23 entries | T21's `index.ts` imports; `integrity.test.ts` requires one per standard when `contentComplete` | **Yes.** |
| 9 | 17 / 18 / 19 → 21 | authored **item** ids | T17–19 are given **no** id convention at all | T21 asserts `startsWith('g2.')` | **NO.** T21 is wrong (21-2) *and* T17–19 are silent, so there is no agreed convention for T21 to assert. Both ends need fixing. |
| 10 | 21 → existing `registry.test.ts` | `listCurricula()`, the `getCurriculum(n)` throw case | T21 registers grade 2 | two pinned assertions | **NO.** (21-1.) |
| 11 | 21 → existing `integrity.test.ts` | `describe.each(listCurricula())` | T21 adds another registered curriculum | the whole block, incl. "claims no official blueprint below grade 3" and "totals every domain weight to 100" | **Yes** — `grade2/standards.ts` already satisfies both: no `weightGroup` on any domain, and `domainWeight` sums (4+8+9+2)/23 → 100. Verified, not assumed. |
| 12 | 21 → `CurriculumView.tsx` / `PrintReportModal.tsx` | `weightHeading`, `weightLabel` | T21 adds `weightHeading` | both components render a heading **and** a value | **Partly.** Heading agreed; value not (21-3). |
| 13 | 21 → `Dashboard.tsx` | the blueprint claim | T21 claims to remove all of them | `Dashboard.tsx:91` still asserts one, for every grade | **NO.** (21-4.) |
| 14 | 16 → 21 | `registry.ts` `CURRICULA` | T16 adds `3: GRADE_3` | T21 adds `2: GRADE_2` | **Yes** — independent keys, and `listCurricula()` sorts by grade. |
| 15 | 4 → 17 / 18 / 19 / 20 / 21 | `GRADE_2_DOMAINS` from `./standards` | Task 4 produced it (already on disk) | all five consume it | **Yes** — `GRADE_2_DOMAINS`, `GRADE_2_STANDARDS`, `getStandardByCode`, `getDomainById` all exist with those names and shapes. |

### E2. One row per task: does its own text agree with itself?

| Task | Self-consistent? |
|---|---|
| 17 | **Mostly.** Counts are right (OA 4 + G 2 = 6; 12 and 6 minimums correct). But Step 3's array error is unconstructible (17-3), and Step 4's template list covers standards whose halves Step 3 never asks for (17-1, 17-2, 17-5). |
| 18 | **No.** Step 4 says "four two-digit numbers" while the standard it cites says three (18-1); Step 3's skip-count error is arithmetically impossible (18-4); "Every NBT standard here is computational" contradicts `NBT.1`'s compose/decompose and `NBT.5` / `NBT.7`'s explain-the-strategy bullets (18-7). Counts are right: 8 standards, 24 minimum. |
| 19 | **No.** Step 4's code-to-topic mapping contradicts `standards.ts` for three of nine standards (19-1) and inverts a fourth (19-2); Step 3's error list addresses five of nine standards (19-5). Counts are right: 9 standards, 27 minimum, `MD.9` correctly absent. |
| 20 | **Partly.** The "no percentage" rule is internally consistent and its test enforces it, but it contradicts the Content Contract (20-1), and four of nine assertions do not test what they appear to (20-2). Count is right: 23. |
| 21 | **No.** Step 4 names quiz ids with hyphens while Step 6 asserts item ids with a dot (21-2); Step 5's grep gate cannot pass given the files Step 5 is permitted to touch (21-4); Step 7's "Expected: PASS" contradicts the state of `registry.test.ts` (21-1). |

---

## Verified accurate

Claims checked against the source and found correct. Listed so the controller
knows the audit's coverage, not only its complaints.

**Standard codes and counts**

- All 23 codes named across Tasks 17–21 exist in
  `src/curriculum/grade2/standards.ts`: `NC.2.OA.1–4`, `NC.2.NBT.1–8`,
  `NC.2.MD.1–8` plus `NC.2.MD.10`, `NC.2.G.1`, `NC.2.G.3`. **No invented code in
  any of the five briefs.**
- Task 17: "OA has four standards, G has two"; "Standards covered (6)" — correct.
- Task 18: "Standards covered (8)" — correct.
- Task 19: "The largest single domain in the project: nine standards";
  "Standards covered (9)" — correct; MD is 9 of Grade 2's 23.
- Task 20: "23 Grade 2 standards"; Task 21: "23 standards all with content" —
  correct (4 + 8 + 9 + 2).
- **`NC.2.MD.9` is correctly absent** from Task 19. CCSS 2.MD.D.9 (line plots of
  measurement data) is not in NC's Grade 2, and no brief reaches for it — the
  Grade 4 fractional-line-plot defect is **not** repeated here.
- **`NC.2.G.2` is correctly absent** from Task 17. CCSS 2.G.A.2 (partition a
  rectangle into rows and columns of same-size squares) is not an NC standard;
  the briefs name only `G.1` and `G.3`.
- No brief mentions rounding anywhere — correct; rounding is in no NC grade 1–5
  standard.
- Item minimums 12 (OA), 6 (G), 24 (NBT), 27 (MD) all equal 3 × standard count,
  matching the Content Contract's floor and `assertAuthoredBankSound`'s default.

**Source fidelity**

- `src/curriculum/grade2/standards.ts` matches `docs/sources/nc-standards-1-5.json`
  key `"2"` for all 23 codes, all descriptions and all bullets. Safe as proxy.

**Weight-shaped claims (C)**

- Task 20's "NCDPI publishes no blueprint below Grade 3, so there is no weight to
  cite for any Grade 2 domain" — correct, and matches both the plan's Global
  Constraints and `src/curriculum/types.ts`'s `Weighting` docstring.
- Task 21's `weighting: { kind: 'even-by-standard-count' }` — correct and
  type-valid.
- Task 21's `weightHeading` returning `'Share of Grade Standards'` for a
  non-blueprint grade and `'NC Blueprint Weight'` for grade 5 — correct
  behaviour, correct discriminant, compiles.
- Task 21 Step 6's `expect(d.officialWeightRange).not.toMatch(/%/)` and
  `expect(d.weightGroup).toBeUndefined()` — both pass against the shipped
  `grade2/standards.ts`.
- Every Grade 2 domain's `weightCategory` is
  `'Core (no state assessment at this grade)'` — no percentage, so
  `integrity.test.ts`'s "quotes no percentage in weightCategory" passes on
  registration.
- Task 21's "Grade 2 is the first curriculum with
  `weighting.kind === 'even-by-standard-count'`" — correct; grade 5 is
  `ncdpi-blueprint` and grades 3–4 will be.
- Task 21's diagnosis that `CurriculumView.tsx` and `PrintReportModal.tsx` label
  the column "NC Blueprint Weight" unconditionally — correct, at lines 94 and
  142 respectively.
- Task 21's claim about `PrintReportModal.tsx:273` — correct; the line and its
  wording are exactly as quoted, and it does sit beside the
  `weightLabel(curriculum, domain.id)` call.

**Interfaces (D)**

- `assertAuthoredBankSound(items, domain, opts?)` exists in
  `src/curriculum/authoredBank.testkit.ts` with that signature; the
  two-argument calls in Tasks 17–19 are valid.
- `assertTemplateSound` exists in `src/engine/templateTesting.ts` and is used as
  Tasks 17 and 18 describe.
- `GRADE_2_DOMAINS` is exported from `src/curriculum/grade2/standards.ts`, and
  `d.id === 'OA' | 'NBT' | 'MD' | 'G'` all match the lookups in the briefs' tests.
- `StudyGuideSection` in `src/types/index.ts` has exactly the fields Task 20's
  test reads, and `whyItMattersForSSA` **is** nested inside `workedExample` as
  the test assumes — verified, an easy thing to get wrong.
- `GradeCurriculum` in `src/curriculum/types.ts` has every field Task 21's
  `index.ts` sets and no required field it omits.
- `makeQuestionSource(authored, templates)` at `src/engine/questionSource` —
  path and arity as used.
- `getCurriculum`, `listCurricula`, `standardsOf`, `domainWeight`, `weightLabel`
  are all exported from `src/curriculum/registry.ts`; Task 21's added import of
  `weightHeading` and `getCurriculum` into `registry.test.ts` is coherent
  (`getCurriculum` is already imported there).
- `CURRICULA` is `Partial<Record<Grade, GradeCurriculum>>`, so adding `2:` needs
  no type change; `Grade` includes `2`.
- Template id form `g2.<domain><tail>.<slug>` in Tasks 17 and 18 — **correct**,
  matching the shipped `g4.oa1.times-as-many`. Only the *item* id in Task 21 is
  wrong.
- Task 19's aggregator ordering (OA, NBT, MD, G) and its instruction to match
  "Task 9's aggregator" — Task 9's aggregator block exists in `task-9-brief.md`
  Step 4 with exactly that shape.

**Age-appropriateness (G)**

- Task 17's "Reading level is a correctness requirement here. A seven-year-old
  is the reader. Short sentences, one clause each, numbers within the range the
  standard names, and no prompt that takes longer to read than to solve." —
  correct and correctly emphasised; it restates the Content Contract's rule.
- Task 19's "For any item involving a ruler, clock, coins, or a graph, describe
  it in `promptDetails` as text — no image assets. A coin problem states the
  coins in words." — correct and necessary (and the reason 17-7 asks for the
  same sentence in Task 17).
- Task 20's "pitched at a seven-year-old and the adult sitting beside them" —
  right intent; see 20-4 for the ambiguity.
- **No brief instructs anything that would produce a multi-clause or
  paragraph-length Grade 2 prompt.** The age risk in this batch comes entirely
  from unstated number ranges (17-2, 17-3, 18-5, 19-3), not from prose.

**Item id convention (H)**

- Template ids: dots, `g2.<domain><tail>.<slug>` — Tasks 17 and 18 correct;
  Task 19 silent (19-7).
- Item ids: hyphen after the grade — Task 21 wrong (21-2); Tasks 17–19 silent.
- Quiz ids in Task 21 Step 4 (`g2-diagnostic-01`, `g2-mod-oa-01`,
  `g2-mock-ssa-01`) use the hyphen and match Task 16's Grade 3 forms — correct.

**Named errors checked and found constructible**

- Task 17: "counting on by ones and landing one short"; "choosing addition
  because the word 'more' appeared, in a problem that needed subtraction" (the
  classic Compare-Bigger-Unknown trap `NC.2.OA.1` names); "naming a shape by its
  orientation"; "counting a cube's faces as four because only four are visible".
- Task 18: "reading 407 as 'forty-seven'" (the zero-tens case `NBT.1`'s second
  bullet is about); "adding tens to ones when the columns are misaligned";
  "failing to regroup and writing the larger digit minus the smaller".
- Task 19: "measuring from the end of a ruler rather than from zero"; "counting
  tick marks instead of intervals"; "reading a clock's minute hand as the hour";
  "counting a coin collection by coin rather than by value"; "picking the wrong
  unit entirely".

**Other**

- No verbatim duplication between briefs; the four authored banks and their
  tests are distinct files with distinct exports.
- No brief asks for a value absent from a source document: no invented blueprint
  weight, no invented `ssa` figure (`passingPercent: 80`, `targetsGrade: 2`
  match the Global Constraint).
