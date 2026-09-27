# Task 7 report — Grade 4 Number & Operations: Fractions

## 1. TDD: the exact first failure

`src/curriculum/grade4/authored.nf.test.ts` was written first and run before any
implementation file existed. Command and verbatim failure:

```
$ npx vitest run src/curriculum/grade4/authored.nf.test.ts

 FAIL  src/curriculum/grade4/authored.nf.test.ts [ src/curriculum/grade4/authored.nf.test.ts ]
Error: Failed to resolve import "./authored.nf" from "src/curriculum/grade4/authored.nf.test.ts". Does the file exist?
  Plugin: vite:import-analysis
  File: C:/Users/mswanson/Projects/ncmathssa/src/curriculum/grade4/authored.nf.test.ts:4:36

 Test Files  1 failed (1)
      Tests  no tests
```

Red for the right reason — the module under test did not exist — then the bank
was authored and the same command went green.

## 2. Where the brief and `standards.ts` disagreed

No outright contradiction of the `NC.4.NBT.7` kind. Three places where the
brief was looser than the sourced text, and `standards.ts` was followed:

1. **`NC.4.NF.4`.** The brief calls it "multiplication by a whole number".
   The sourced text is narrower: "multiplying a whole number by a unit
   fraction, using this understanding to multiply a whole number by any
   fraction **less than one**". Every authored item and every generated draw
   therefore has a proper fraction as the second factor; nothing multiplies by
   a mixed number or an improper fraction, and no item multiplies two
   fractions together (that is `NC.5.NF.4`).

2. **`NC.4.NF.6`.** The brief describes it as "decimal notation". The sourced
   `keyConcepts` carry three things, and the middle one — "use equivalent
   fractions to add two fractions with denominators of 10 or 100" — is an
   *addition* standard hiding inside a notation standard. The generator
   `g4.nf6.add-tenths-hundredths` is written to that key concept; the notation
   itself is covered by the authored items (`g4-nf6-01`, `-02`, `-04`). Had I
   followed only the brief's wording, the one piece of unlike-denominator
   addition Grade 4 actually does would have been left out.

3. **`NC.4.NF.3`.** The brief asks for one template covering "addition and
   subtraction with like denominators". Spec §6.5 forbids it, and the two
   procedures emit disjoint misconception sets (`forgot-to-regroup` and
   `borrowed-without-reducing-the-whole` cannot arise in an addition item at
   all), so they are two skills and got two template ids. See §5.

Also: the brief's floor is "at least three per standard, eighteen minimum,
prefer four". The bank has **24 items, four per standard**, and the test calls
`assertAuthoredBankSound(..., { itemsPerStandard: 4 })` so the floor is
enforced at four rather than at the kit's default of three.

## 3. Misconception tags

Eleven new, all `fraction-operations`, plus twelve reused. The existing
fraction vocabulary was written for Grade 5, where every operation has unlike
denominators; it has good names for failing to find a common denominator and no
name for the errors that define Grade 4.

### New (11)

| tag | family | why new |
|---|---|---|
| `operated-on-the-like-denominators-too` | fraction-operations | `added-numerators-and-denominators` names the UNLIKE-denominator case ("instead of finding a common denominator first") — a step this problem never has. Named for the denominators, not for addition, because the same instinct fires subtracting: `11/12 - 4/12` written `7/8` (`g4-nf3-04`). A description saying only "added" would have been wrong for that item. |
| `larger-denominator-means-larger-fraction` | fraction-operations | The `1/8 > 1/3` error. No existing tag names it. |
| `applied-the-unit-fraction-rule-to-unlike-numerators` | fraction-operations | Its mirror image, and a rule that is TRUE for unit fractions. Carried over to unlike numerators it fails: `5/6 < 2/3`. Genuinely a different repair from the tag above — one child needs to learn what a denominator means, the other needs to learn when their correct rule applies. |
| `compared-numerators-only` | fraction-operations | Comparing by the count of parts with no account of their size. |
| `multiplied-the-denominator-too` | fraction-operations | `w × n/d` written `(wn)/(wd)`. |
| `wrote-the-product-as-a-mixed-number` | fraction-operations | `4 × 2/5` written `4 2/5`. |
| `multiplied-the-denominators-instead-of-keeping-them` | fraction-operations | Applying the multiplication rule to denominators that already match. |
| `scaled-the-denominator-only` | fraction-operations | Distinct from `common-denominator-numerator-not-scaled`, which is the same slip committed DURING an addition, where a common denominator is being sought. Here renaming IS the task. |
| `added-to-both-parts-instead-of-multiplying` | fraction-operations | `2/5 = 17/20` by adding 15 to both parts. |
| `benchmark-comparison-left-unfinished` | fraction-operations | `NC.4.NF.2` lists benchmarks as a strategy, so this is the error the strategy invites: both fractions land above 1/2 and the comparison is abandoned. `stopped-comparing-too-soon` is about place value in whole numbers and lives in `place-value-and-decimals`. |
| `compared-across-different-wholes` | fraction-operations | Both `NC.4.NF.2` and `NC.4.NF.7` state in their own sourced wording that a comparison is valid only against the same whole. Not a comparison error — the child's rule may be sound — but a failure to notice it does not apply. |

### Reused (12), each checked against its existing description

`used-the-denominator-as-the-new-numerator`, `added-numerators-and-denominators`
(used only where the denominators really are unlike: 10 and 100),
`common-denominator-numerator-not-scaled`, `scaled-the-wrong-addend`,
`forgot-to-regroup`, `borrowed-without-reducing-the-whole`,
`forgot-to-scale-by-the-whole-number`, `dropped-a-fraction-part`,
`added-instead-of-subtracted`, `subtracted-instead-of-added`,
`added-instead-of-multiplied`, plus the four decimal tags
`compared-by-digit-count`, `omitted-placeholder-zero`,
`compared-decimals-right-to-left`, `swapped-the-decimal-place-values`,
`wrong-power-of-ten`, `wrote-the-digit-not-its-value`, and
`ordered-from-the-wrong-end`.

### One family judgement worth flagging

`ordered-from-the-wrong-end` sits in `place-value-and-decimals`. It is used
here **only** in `g4-nf7-02`, a decimals item, where that family is right. It
is deliberately **not** offered by the NF.2 fraction-ordering generator, even
though the reverse ordering would have been the easiest fourth option to build:
a child who mixed up the direction on a *fractions* item would have been
reported to a parent as having a place-value problem. The generator uses
`applied-the-unit-fraction-rule-to-unlike-numerators` for its fourth ordering
instead, which costs nothing and is filed correctly.

## 4. No two options naming the same quantity

This is the defect I treated as most likely, and it is checked three ways.

**By the shared kit.** `assertAuthoredBankSound` runs `numericValue()` over
every option of every item and fails on any pair within 1e-9. I read that
parser first: it anchors on the whole string, handles `w n/d`, `n/d` and
decimals, allows a trailing unit word, and returns `null` for anything else —
so prose options are compared by text and are *not* value-guarded.

**The gap in that guard, closed.** An item mixing parseable and unparseable
options would be silently half-guarded. `authored.nf.test.ts` therefore asserts
that every item is all-numeric or all-prose — 0 of 4 or 4 of 4 options parse.
All 24 items satisfy it.

**Two specific traps found and designed around:**

- `multiplied-the-denominator-too` on `w × n/d` gives `(wn)/(wd)`, which is
  **exactly `n/d`** — the same value as `forgot-to-scale-by-the-whole-number`.
  Those two tags can never share an item. `g4-nf4-03` uses the second and not
  the first for that reason, and the note is written into both
  `authored.nf.ts` and `nf4-multiply-by-whole.ts` so the next author hits it.
- Mixed-number sums are dangerous in a way bare fraction sums are not: an
  unreduced improper fraction part (`3 7/5`) names the same number as the
  reduced answer (`4 2/5`). No item or generator here produces a mixed-number
  *sum*; the mixed-number generator subtracts, where the shape does not arise.

**In the generators**, distinctness is proved by algebra, never by resampling,
and each sibling test re-checks it by value across 300 seeds plus an exhaustive
sweep. `nf4`'s test additionally asserts that the scaled-denominator option
really equals the original fraction, pinning the trap above in place.

## 5. Generators — collision algebra and exhaustive sweeps

Seven templates, appended to `GRADE_4_TEMPLATES`. Every one excludes colliding
parameters **by construction**; none contains a resampling loop. Every sibling
test sweeps the full parameter space (not 300 sampled seeds) and asserts the
count, and — where anything is barred — asserts that each barred combination
really would have collided, so nothing is excluded for tidiness.

| template | standard | collision exclusion | sweep |
|---|---|---|---|
| `g4.nf1.equivalent-fraction` | NF.1 | All four options share denominator `D`, so collision ⇔ equal numerators. Five of six pairs are impossible for `k ≥ 2`, `1 ≤ a ≤ b-1`; the live one is `a·k = b`, excluded. | **29** of 31 (b,D,a) combinations; **2 barred**, both verified to collide. `(2,4)` and `(10,100)` excluded from the pair list, with reasons in the file. |
| `g4.nf2.order-fractions` | NF.2 | Structural, not algebraic: the four options are four *permutations* of three fractions that are pairwise distinct in value and in lowest terms, so two options collide only if they are the same permutation — which the table build forbids. | Table built by exhaustive enumeration of all **12,167** ordered triples (23 lowest-terms proper fractions cubed); **81** admitted. |
| `g4.nf3.add-like` | NF.3 | Six pairs solved: three impossible, `(a+b)/2d = (a+b)/d²` ⇒ `d = 2` (excluded by the denominator list), `a = 3b` excluded, `a(d-1) = b(d+1)` excluded. | **63** admissible of **75** in range; **12 barred**, all verified to collide. |
| `g4.nf3.subtract-mixed` | NF.3 | One exclusion carries it: `f2 - f1 ≠ d/2`. The other five pairs are impossible given `W2 ≥ 1` and `f1 < f2` — worked in the file docstring. | **765** admissible of **855**; **90 barred**, all verified to collide. |
| `g4.nf4.multiply-by-whole` | NF.4 | Five pairs impossible for `w ≥ 2`, `n ≤ d-1`; `w·n = w + n` ⇒ `(w-1)(n-1) = 1` ⇒ `(2,2)`, excluded. | **203** of **210**; **7 barred**, all verified to collide. |
| `g4.nf6.add-tenths-hundredths` | NF.6 | Five pairs impossible for `a, b ≥ 1`; `a ≠ b` is the single exclusion, applied by a deterministic index shift, not a loop. | **72** of **81**; **9 barred**, all verified to collide. A further test confirms the shift reaches all 72 pairs and leaves no hole. |
| `g4.nf7.compare-decimals` | NF.7 | Ranges are the exclusion: `t ∈ 3..7`, `e ∈ 1..t-2`, `z ∈ t+1..8`, `q ∈ 0..8` force `answer > digits > lastDig > zeroLed` strictly and give each faulty rule a unique, different winner. Proved in hundredths in the docstring. | **3,150** combinations, all checked: texts distinct, values distinct, key is the max, and each of the three faulty rules has a unique winner that is not the key. |

### One template, one skill (spec §6.5)

`NC.4.NF.3` gets **two** template ids, `g4.nf3.add-like` and
`g4.nf3.subtract-mixed`. A `ReviewKey` is seedless and a due review is
re-realized at a fresh seed, so one template branching between the two would
file one review key for two procedures: a child who failed at regrouping could
be reviewed with an addition item, promoted, and retired as mastered with the
regrouping never retested. The spec's own test applies — the two emit disjoint
misconception sets. Every other template runs one procedure with no branch;
`nf4` covers the unit-fraction case as `n = 1` inside the same procedure rather
than as a mode.

### Bounds on every number printed

Each test bounds *every* numeral in the prompt, promptDetails, all four
options, and the worked solution — not just the answer. Where the worked
solution legitimately exceeds the option range the two are bounded separately
and the reason is written down: `nf3-subtract-mixed` prints the regrouped
numerator `f1 + d ≤ 17` in the explanation while options stay ≤ 12;
`nf2-order-fractions` prints a common denominator up to 120 in the explanation
while options stay ≤ 12; `nf7-compare-decimals` prints padded two-digit decimal
parts. Largest numbers anywhere: 144 (`12 × 12`, the multiplied-denominators
distractor), 120 (largest LCM of three of the standard's denominators), 110,
100, 99, 72.

### Generator/authored separation

`authored.nf.test.ts` calls `assertNoGeneratorDuplicatesAuthored` against all
sixteen Grade 4 templates over 2,000 seeds each. Passes. Beyond the mechanical
check, `(10, 100)` was dropped from the NF.1 generator's rescaling list because
it would have produced `6/10 = 60/100` with the same three distractors as the
authored `g4-nf6-02` — the prompts differ, so the guard would not have fired,
but the question would have been the same question.

## 6. Verification gate

| gate | result |
|---|---|
| `npm run lint` | exit 0 (pre-existing warnings in `src/components` and `src/context` only; none in `src/curriculum`) |
| `npx tsc -b --noEmit` | exit 0, clean |
| `npm test -- --run` | **49 files, 524 tests, all passing.** Baseline was 438; +86, none lost. |

`src/curriculum/registry.ts` was not touched. No NC standard code or percentage
was invented; the NF band quoted is the published 30–34%.

## 7. Concerns for review

1. **`g4.nf1.equivalent-fraction` has a small parameter space** — 29 distinct
   questions. That is a ceiling imposed by the standard's own denominator list
   (the pairs must both come from 2, 3, 4, 5, 6, 8, 10, 12, 100 and one must
   divide the other), not by the design, but it is the smallest space of the
   seven and worth knowing.
2. **Unsimplified results are printed** — `18/4 yards`, `8/20 cup`, sums like
   `4/8`. `NC.4.NF` nowhere requires simplest form, and Grade 4 materials
   routinely leave such results; the key is never offered alongside its own
   simplified form, which is the thing that would actually be wrong. Flagging
   it as a deliberate choice rather than an oversight.
3. **`g4-nf6-04` uses `wrote-the-digit-not-its-value`** (family
   `place-value-and-decimals`) for the option `9.0` — the child reports the
   count of shaded squares instead of what nine hundredths is worth. The
   description fits and the family is right for a decimal place-value error,
   but it is the one reused tag in this bank whose first uses were all
   whole-number place value.
