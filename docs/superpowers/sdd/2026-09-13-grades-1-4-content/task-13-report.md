# Task 13 report — Grade 3 Number & Operations in Base Ten, and Fractions

Branch `feat/multi-grade-adaptive`. Two commits:

- `e196f39` feat: add grade 3 base ten and fractions content
- `a9183e0` fix: stop the first NC.3.NF.1 item from restating its own generator

## What I implemented

**Authored banks (21 items).**

`src/curriculum/grade3/authored.nbt.ts` — 7 items.

- `NC.3.NBT.2` × 4, one per keyConcept plus one applying the lot. `g3-nbt2-01` is
  estimation for reasonableness, `g3-nbt2-02` is the addition/subtraction inverse
  relationship (which equation *checks* 742 − 268 = 474), `g3-nbt2-03` is expanded-form
  decomposition, `g3-nbt2-04` is a word problem subtracting across a zero.
- `NC.3.NBT.3` × 3, the last of them sitting deliberately on 9 × 90 = 810, the top of
  the sourced range.

`src/curriculum/grade3/authored.nf.ts` — 14 items, 3 for NF.1, 3 for NF.2, 4 for NF.3
(one per keyConcept plus a decomposition item), 4 for NF.4 (two same-numerator — one
area model, one length model — one same-denominator, one on the same-whole rule).

**Generators (7), appended to `GRADE_3_TEMPLATES`.**

| id | shape | draw space |
|---|---|---|
| `g3.nbt2.add-within-1000` | `Add.` + figure, exactly one carry | 18,225 |
| `g3.nbt2.subtract-within-1000` | `Subtract.` + figure, always across a 0 | 4,050 |
| `g3.nbt3.multiply-by-multiple-of-ten` | pictorial ten-rods + `a × m` | 72 |
| `g3.nf1.unit-fraction-model` | model matching, four described pictures | 20 |
| `g3.nf2.fraction-on-a-number-line` | number line 0→1, point P | 10 |
| `g3.nf3.equivalent-fraction` | shaded bar, same amount in a related denominator | 6 |
| `g3.nf4.compare-like-parts` | four comparison statements, one true | 428 |

Addition and subtraction are two templates rather than one for the reason the
`index.ts` docstring already gives about OA: a review key is seedless, so one template
spanning both operations would let a child who cannot subtract across a zero be
re-served an addition question and retired as mastered.

**25 new misconception tags**, appended to `src/curriculum/misconceptions.ts` in the
same trailing block Task 12 used (the file is alphabetical through its original body and
appends afterwards). Five for Base Ten, twenty for Fractions. I reused
`larger-denominator-means-larger-fraction`, `compared-numerators-only`,
`added-to-both-parts-instead-of-multiplying`, `repeated-the-whole-fraction-not-the-unit-fraction`,
`added-without-carrying`, `carried-into-the-wrong-column`, `subtracted-without-regrouping`,
`added-instead-of-subtracted`, `subtracted-instead-of-added`, `added-instead-of-multiplied`,
`skip-counted-one-group-short`, `forgot-the-final-step`, `used-the-wrong-given-quantity` and
`wrong-power-of-ten` where they already named the right error.

Three tags I deliberately did NOT reuse, because the family label is the headline a
parent reads and each of these would have pointed somewhere wrong:

- `computed-exactly-instead-of-estimating` — its declared description is about benchmark
  *fractions*, so on a whole-number estimate it would be a mis-file. Declared
  `gave-the-exact-sum-instead-of-an-estimate` instead.
- `counted-endpoints-not-intervals` — family `coordinate-plane`. On a fraction number
  line that tells a parent their child has a graphing problem. Declared
  `counted-tick-marks-not-intervals` in `fraction-operations`.
- `reversed-the-inequality-symbol` — family `place-value-and-decimals`. Declared
  `compared-in-the-wrong-direction` in `fraction-operations`, which also absorbs the
  "picked the smaller one when asked for the greater" case so the two are one tag.

## Places the brief disagreed with `standards.ts` beyond the rulings

**None beyond the seven already ruled.** I checked every phrase of the brief's Steps 3
and 4 against the `description` and `keyConcepts` of all six standards. Two notes that
are not new findings but are worth recording:

1. The brief's Step 4 asks for a template "for equivalence and comparison
   (`NC.3.NF.3`, `NC.3.NF.4`)" — the exact phrasing ruling 13-1 identifies as the one a
   general comparator gets written from. Ruled, and followed.
2. The brief's Step 3 "NBT is only addition and subtraction within 1,000 and a one-digit
   number times a multiple of 10 — nothing else" reads as if the generators should *do
   the algorithm*. Ruling 13-5 corrects the emphasis, and the two are compatible: the
   generators compute and the authored items carry the three keyConcepts.

One judgement call that is mine rather than the rulings': **the brief's "nothing else"
clause forecloses rounding, but NC.3.NBT.2's own first keyConcept is "use estimation
strategies to assess reasonableness of answers."** I read ruling 13-7 as foreclosing
CCSS 3.NBT.A.1 — *round to the nearest 10 or 100* as a skill in its own right — and not
as foreclosing estimation, which is sourced text. So `g3-nbt2-01` estimates by asking
which hundred each number is *closest to*, never invokes a rounding rule, and
`authored.nbt.test.ts` asserts that no NBT item anywhere contains the word `round`.
If that reading is wrong, the fix is one item and one test.

## Rulings 13-1 and 13-2, verified by construction

**13-1 (NF.4 never becomes a general comparator).** `g3.nf4.compare-like-parts` draws a
denominator pair `(p, q)` from `DENOMINATOR_PAIRS`, which is enumerated from the two
sourced families `[2,4,8]` and `[3,6]` and can never cross them. It then builds exactly
two comparison pairs: a same-numerator pair `a/p` vs `a/q`, and a same-denominator pair
`b/q` vs `c/q`. Every statement it can print is one of those two pairs with one of three
symbols. There is no code path that puts a fraction from one pair against a fraction
from the other.

The test does not take that on trust. `nf4-compare-like-parts.test.ts` parses each
printed statement back into a claim with its own regex and then, over 3,000 seeds:

- asserts each claim's two fractions share a numerator or a denominator;
- asserts both denominators sit in the same family;
- **evaluates** all four claims arithmetically and asserts exactly one is true and that
  it is the one marked correct — so a wrong key would fail, not just a wrong shape;
- asserts over 300 seeds that all four of {same-numerator, same-denominator} × {>, <}
  actually occur, so the two coin flips cannot silently degenerate to one half of the
  standard.

`DENOMINATOR_PAIRS` is additionally pinned to its literal four entries.

On the authored side, `authored.nf.test.ts` takes the first fraction an NF.4 item writes
as the reference and asserts every other fraction in the item shares its numerator or
its denominator.

**13-2 (denominators).** Each NF generator's draw space is a small enumerated constant
and its sibling test sweeps the whole of it rather than sampling:

- `nf1`: `DENOMINATORS` pinned to `[2, 3, 4, 6, 8]`; 20-question space swept; 400 seeds
  scanned for any `a/b` anywhere in prompt, options, steps or summary.
- `nf2`: the flipped distractor is `d/n`, which puts the NUMERATOR in a denominator — so
  `n` is restricted to `{2,3,4,6}` as well as `d` to `{3,4,6,8}`, and the sweep asserts
  both. Without that, `8/5` and `6/7` would print fifths and sevenths in a distractor.
- `nf3`: sweeps all 6 triples and asserts every denominator printed is in the **same
  related family** as the base — a tighter condition than "in the five", because
  rescaling 1/2 into sixths is Grade 4 even though 6 is a Grade 3 denominator.
- `nf4`: as above.
- `authored.nf.test.ts` scans every authored item the same way.

**One deliberate carve-out, found by my own guard rather than by inspection.** The
strict denominator sweep went red on `8/1`: `wrote-the-fraction-upside-down` puts the
*count* underneath, and on a unit-fraction item the count is 1. A denominator of 1 is
not next year's mathematics the way a fifth is — NC.3.NF.3's own third keyConcept is
expressing whole numbers as fractions — so rather than weaken the guard I allowed a
denominator of 1 only in items that offer that distractor, and added a second test
pinning the list of such items to exactly `['g3-nf1-02', 'g3-nf3-02']` and asserting the
1 appears only on the flipped option. Both tests would go red if a future edit widened
the carve-out.

**Two denominators the generators cannot reach, on purpose.** `g3.nf2` cannot draw
halves (d = 2 leaves no legal n) and `g3.nf3` cannot draw 1/3 → sixths (the algebra
`d = n(k+1)` makes two options the same amount there). Both are excluded by construction
with the algebra in the file comment, per the Content Contract, and both gaps are covered
by authored items — `g3-nf1-03` and `g3-nf4-02` reason about halves, `g3-nf4-03` about
thirds and sixths.

## How the generators join the collision scheme

`templates/index.test.ts` already asserted that each generator's prompts match its own
sentinel regex and fail every other generator's, over a 400-seed sweep, plus an
800-seed pairwise disjointness check on `prompt + promptDetails`. I extended the
sentinel map from five entries to twelve; the test asserts the map's key set equals the
template id set, so a generator added without a sentinel fails immediately.

    g3.nbt2.add-within-1000              /^Add\.$/
    g3.nbt2.subtract-within-1000         /^Subtract\.$/
    g3.nbt3.multiply-by-multiple-of-ten  /^Each group below shows \d+ tens?\. What is \d+ × \d+\?$/
    g3.nf1.unit-fraction-model           /^Which one shows 1\/\d of a whole [a-z ]+\?$/
    g3.nf2.fraction-on-a-number-line     /^Which fraction does point P name\?$/
    g3.nf3.equivalent-fraction           /^Which fraction names the same amount as \d+\/\d+\?$/
    g3.nf4.compare-like-parts            /^Which comparison is true\?$/

The two NBT.2 templates share a constant prompt each and are separated by
`promptDetails` in the disjointness sweep. The `× ` in the NBT.3 sentinel is anchored
behind `Each group below shows`, so it cannot be confused with OA.7's `^What is \d+ ×
\d+\?$` in either direction — that near-miss is why NBT.3 does not simply ask
"What is 8 × 30?".

Both new authored banks call `assertNoGeneratorDuplicatesAuthored` over 2,000 seeds of
all twelve generators.

## TDD evidence

RED (brief Step 2), before any implementation existed:

    $ npx vitest run src/curriculum/grade3/authored.nbt.test.ts src/curriculum/grade3/authored.nf.test.ts
    FAIL  src/curriculum/grade3/authored.nf.test.ts
    Error: Failed to resolve import "./authored.nf" ... Does the file exist?
    FAIL  src/curriculum/grade3/authored.nbt.test.ts
    Error: Failed to resolve import "./authored.nbt" ... Does the file exist?
    Test Files  2 failed (2)

A second, more useful RED came from the ruling 13-2 sweep once the NF bank existed:

    × grade 3 NF authored bank > writes no fraction outside halves, thirds, fourths, sixths and eighths
      → g3-nf1-02 writes 8/1, and 1ths are not a Grade 3 denominator

resolved by the narrow carve-out described above rather than by loosening the assertion.

GREEN (brief Step 6, and then the whole suite):

    $ npx vitest run src/curriculum/grade3 src/curriculum/misconceptions.test.ts
    Test Files  17 passed (17)
    Tests  195 passed (195)

    $ npx tsc -b --noEmit
    TypeScript: No errors found         (exit 0)

    $ npx vitest run
    Test Files  76 passed (76)
    Tests  829 passed (829)

Baseline at `5dddce0` was 714 passing; this task adds 115.

    $ npm run lint
    exit code 0, 7 pre-existing warnings in AdaptiveSessionCard.test.tsx,
    ProgressContext.tsx, QuizResults.tsx and WeakSpotsView.tsx — none of which
    this task touches. Not fixed, per the dispatch.

## Fixed-seed pins (the STANDING RULING)

Every one of the seven templates has two fixed-seed tests pinning **literal strings**,
obtained by running the generator and copying the bytes — never hand-written. Each pin
holds the exact prompt, the exact `promptDetails` (including the number-line figure and
the shaded bar, character for character), the exact `answerText`, and the full option
list as `[label, text, isCorrect, misconception]` in order. Five of the seven also pin a
literal worked-solution step.

Running the generators to get those bytes is what surfaced five defects that every
derived assertion would have stayed green through:

1. `Each group below shows 1 tens.` — fixed with a `tens()` helper.
2. `no single part is a 2th of the rectangle` — fixed with a written-out `PART_NAMES` map.
3. `There were 1 shaded parts` and `1 of them are shaded` — fixed.
4. Subtraction could emit `8` as an option beside an answer of `98`; an option a child
   rules out on length alone is not a distractor. Tightened `a2 - 1 > b2`.
5. Addition could emit `81` beside `337` for the same reason. Same fix.

The full-space sweeps and per-distractor recomputation blocks are kept alongside the
pins, not in place of them.

## Self-review findings

**One real defect found and fixed in a second commit (`a9183e0`).** `g3-nf1-01` as first
written was "Which picture shows 1/3 of one whole circle?" with four described pictures
— which is `g3.nf1.unit-fraction-model`'s question with "pieces" for "parts" and a
different verb. `assertNoGeneratorDuplicatesAuthored` compares prompts and saw nothing,
but a child would meet the same question under two review keys. Replaced with a
judgement about one particular cut (a sandwich in four unequal pieces), which keeps the
same keyConcept and the same three misconceptions including the reachable "one and
four", and is a genuinely different question. This is the failure mode the duplicate
guard exists to prevent, arriving through the door the guard does not watch.

**Mathematics re-solved cold.** Every authored number was recomputed independently — all
28 whole-number checks and all 7 fraction option sets, each compared by VALUE. No item
has a second defensible answer; no option list contains two fractions naming one amount.
Every `stepByStep` ends on its key.

**Distractor reachability, item by item.** Every wrong option carries the arithmetic that
produces it in a `//` comment above it, and I checked each against the tag's declared
description. The ones I thought hardest about:

- `g3-nbt2-02`'s three distractors are all *true* equations that are not *checks*. That
  is deliberate and is the standard's own difficulty (the inverse relationship is
  structural, not arithmetical), but it is the item a reviewer should look at hardest.
- `g3-nf3-02` offers `0/8`, tagged `named-the-unshaded-part` — the slices left, of which
  there are none. Legitimate but unusual; flagging it.
- `g3-nbt2-01` offers the exact sum `801` as a distractor. The prompt says Lena "uses the
  hundred that each number is closest to", so 801 is not built from hundreds and is
  unambiguously not the answer — but this item depends on that sentence.

## Concerns

1. **`g3.nf4.compare-like-parts` can print two equivalent fractions in one item.** At
   seed 7 the options are `1/2 = 1/4`, `2/4 > 3/4`, `1/2 > 1/4`, `1/4 > 1/2`, and
   2/4 = 1/2. Each statement's truth value is unambiguous and the test evaluates all
   four, so there is no second correct answer — but a child may notice the coincidence.
   Constraining it away kills the `(2, 4)` denominator pair entirely, so I left it. Worth
   a second opinion.
2. **Small draw spaces on two NF generators.** `g3.nf3.equivalent-fraction` has 6
   questions and `g3.nf2.fraction-on-a-number-line` has 10. For NF.3 that is the complete
   set of legal related-family rescalings with a proper base, so it is a ceiling rather
   than a choice. For NF.2 it is a consequence of keeping the flipped distractor's
   denominator inside the Grade 3 set. Both are documented in their file comments.
3. **The estimation reading of ruling 13-7**, described above, is the one place I
   interpreted rather than followed.
4. **25 new misconception tags** is a large vocabulary addition — 20 of them in
   `fraction-operations`. Each is used, each names a distinct error, and I chose new tags
   over three near-misses rather than mis-file. But a reviewer may reasonably want
   `named-the-unshaded-part` / `named-the-whole-not-one-part` /
   `named-the-unit-fraction-not-the-count` looked at as a group.

## Files changed

Created:

    src/curriculum/grade3/authored.nbt.ts
    src/curriculum/grade3/authored.nbt.test.ts
    src/curriculum/grade3/authored.nf.ts
    src/curriculum/grade3/authored.nf.test.ts
    src/curriculum/grade3/templates/nbt2-add-within-1000.ts        (+ .test.ts)
    src/curriculum/grade3/templates/nbt2-subtract-within-1000.ts   (+ .test.ts)
    src/curriculum/grade3/templates/nbt3-multiply-by-multiple-of-ten.ts (+ .test.ts)
    src/curriculum/grade3/templates/nf1-unit-fraction-model.ts     (+ .test.ts)
    src/curriculum/grade3/templates/nf2-fraction-on-a-number-line.ts (+ .test.ts)
    src/curriculum/grade3/templates/nf3-equivalent-fraction.ts     (+ .test.ts)
    src/curriculum/grade3/templates/nf4-compare-like-parts.ts      (+ .test.ts)

Modified:

    src/curriculum/grade3/templates/index.ts        (7 templates + the docstring argument)
    src/curriculum/grade3/templates/index.test.ts   (7 sentinels)
    src/curriculum/misconceptions.ts                (25 tags)

---

# Review fixes (commit `e45e740`)

## Critical 1 — `g3-nf4-04`'s `1/6` distractor carried a tag that cannot produce it

Upheld and fixed, and the review is right that it was not a retag. In
"Which fraction is greater than 4/6?" every fraction that is greater than 4/6 AND shares
a numerator or denominator with it — `5/6`, `6/6`, `4/4`, `4/3` — is a correct answer,
so there was no fourth value left to move the option to. The item is reshaped.

It keeps its role (the same-denominator half of NC.3.NF.4, the only authored item
carrying it), its `mastery` tier and its option position, so the bank's difficulty and
answer-position distributions are unchanged. It is now a word problem: Raj eats 5/6 of
his sandwich, Sam eats 2/6 of an identical one, who ate more. The three wrong answers are
three different readings of the same two fractions, each one a thing a child says:

| option | error | reachable because |
|---|---|---|
| "Sam, because 2 is less than 5." | `compared-in-the-wrong-direction` | compared correctly, then answered with the other one — the tag's exact wording |
| "They ate the same, because both sandwiches were cut into 6 equal pieces." | `compared-denominators-only` | matching bottom numbers read as matching amounts |
| "Sam, because 4 pieces are left of Sam's sandwich and only 1 piece is left of Raj's." | `named-the-unshaded-part` | 6 − 2 = 4 and 6 − 5 = 1; counted what is left instead of what was eaten |

The last one fits its declared description word for word ("counting the pieces still
there rather than the pieces taken") and its arithmetic is checked.

On the review's second requirement — no step grouping two differently-tagged options
under one explanation — the old Step 2 lumped `1/6` and `2/6` together, which is what
exposed the bad tag in the first place. The new worked solution does not: Step 2 says
what to count (the pieces EATEN), Step 3 compares 5 against 2, and the two routes to
"Sam" are told apart explicitly in `commonMisconception` rather than merged.

`named-the-unit-fraction-not-the-count` keeps its correct use on `g3-nf3-02`, where the
description matches, so it is not orphaned; `misconceptions.test.ts` confirms.

## Also fix — the rounding guard overclaimed

Fixed by **strengthening the guard**, not by narrowing the comment — the guard was the
thing that was wrong. Three changes:

1. The regex now also catches `\bnearest (ten|hundred|thousand)s?\b`, which is how the
   rounding rule is stated when the word itself is avoided.
2. `g3-nbt2-01`'s `conceptSummary` said "swapped for the nearest hundred", i.e. the rule
   in other words. It now says "swapped for the hundred it sits closest to", matching the
   item's own worked solution, which already said "the hundred it is closest to".
3. The test comment now states exactly what the guard catches and what it cannot: it is
   lexical, it holds the two phrasings a rounding item written from recall actually
   arrives in, and the sourced-text boundary itself is held by reading rather than by the
   regex.

Checked that the guard is load-bearing rather than vacuous — it fires on the exact string
that was in the file before this fix, and on a real rounding item, and does not fire on
the replacement wording or on "around":

    FIRES  | swapped for the nearest hundred first
    FIRES  | Round 472 to the nearest 100
    FIRES  | rounding the factor
    FIRES  | nearest tens place
    passes | the hundred it sits closest to
    passes | around the corner

## Noted, not acted on

- **Important 2 withdrawn.** `g3-nf4-03` (3/4 vs 3/6) and `g3-nf4-04` (which no longer
  contains 4/8 anyway) are unchanged. Recording the reasoning for whoever reads this
  next: `NC.3.NF.3` says "using **related fractions**: halves, fourths and eighths;
  thirds and sixths"; `NC.3.NF.4` says "with denominators: halves, fourths and eighths;
  thirds and sixths" and omits "related". The list is NF.4's permitted denominator set,
  not a family constraint — otherwise 1/2 against 1/3 would be out of grade.
- `g3.nf4.compare-like-parts` is consequently **narrower than NC.3.NF.4 allows**: it
  draws both denominators from one family. Not changed, per instruction. Anyone widening
  it later should know the same-numerator pair would then also need `p` and `q` drawn
  across families, and that doing so would largely dissolve the incidental-equivalence
  coincidence, since equivalences arise precisely within a family.
- The four deferred items (`g3-nbt2-02`'s approximate tag, `nf1`'s d = 2 set-model
  ambiguity, the NF.4 two-claims shape, the small NF.2/NF.3 draw spaces) are untouched.

## Verification after the fixes

    $ npx tsc -b --noEmit
    TypeScript: No errors found                                  (exit 0)

    $ npx vitest run src/curriculum/grade3/authored.nf.test.ts \
        src/curriculum/grade3/authored.nbt.test.ts \
        src/curriculum/misconceptions.test.ts
    Test Files  3 passed (3)
    Tests  23 passed (23)

    $ npx vitest run
    Test Files  76 passed (76)
    Tests  829 passed (829)

    $ npm run lint
    exit code 0, the same 7 pre-existing warnings, none in files this task touches

No template files were changed, so no template test needed re-running beyond the full
suite, which covers them.
