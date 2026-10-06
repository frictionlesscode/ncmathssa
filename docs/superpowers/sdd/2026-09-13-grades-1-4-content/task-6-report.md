# Task 6 Report: Grade 4 Number & Operations in Base Ten

## 1. TDD — the exact first failure

`src/curriculum/grade4/authored.nbt.test.ts` was written first and run before any
implementation file existed. `npx vitest run src/curriculum/grade4/authored.nbt.test.ts`:

```
 FAIL  src/curriculum/grade4/authored.nbt.test.ts [ src/curriculum/grade4/authored.nbt.test.ts ]
Error: Failed to resolve import "./authored.nbt" from "src/curriculum/grade4/authored.nbt.test.ts". Does the file exist?
  Plugin: vite:import-analysis
  File: src/curriculum/grade4/authored.nbt.test.ts:7:37

 Test Files  1 failed (1)
      Tests  no tests
```

Red for the right reason: the module under test did not exist.

## 2. Scope note — NC.4.NBT.7 is COMPARISON, not rounding

The task brief and the dispatch instructions both describe `NC.4.NBT.7` as
"rounding". The sourced NCDPI wording in `src/curriculum/grade4/standards.ts`
says otherwise:

> **NC.4.NBT.7 — Compare Multi-Digit Numbers to 100,000.** "Compare two
> multi-digit numbers up to and including 100,000 based on the values of the
> digits in each place, using >, =, and < symbols to record the results of
> comparisons."

and `NC.4.NBT.2` is "Read & Write Numbers to 100,000" (numerals, number names,
expanded form) — not comparison. NC's 2018 revision dropped the rounding
standard from Grade 4 NBT entirely; there is no rounding standard in this
domain's data. **The sourced standard text bounds what an item may ask, so it
won.** The six generators are: place value (NBT.1), read/write incl. expanded
form (NBT.2), comparison (NBT.7), add & subtract (NBT.4), multiply (NBT.5),
divide with remainders (NBT.6). Nothing rounds, and nothing tagged a distractor
with a rounding error except where rounding is genuinely the slip
(`reported-the-estimate` on g4-nbt5-03, where a child rounds 27 to 30).

## 3. Files

Created:

- `src/curriculum/grade4/authored.nbt.ts` — 18 items, 3 per standard
- `src/curriculum/grade4/authored.nbt.test.ts`
- `src/curriculum/grade4/templates/numberFormat.ts` — `fmt()`, comma grouping
  (no sibling test, matching the precedent of `grade5/templates/decimalFormat.ts`)
- `src/curriculum/grade4/templates/nbt1-ten-times.{ts,test.ts}`
- `src/curriculum/grade4/templates/nbt2-expanded-form.{ts,test.ts}`
- `src/curriculum/grade4/templates/nbt7-compare-numbers.{ts,test.ts}`
- `src/curriculum/grade4/templates/nbt4-add-subtract.{ts,test.ts}`
- `src/curriculum/grade4/templates/nbt5-two-digit-multiply.{ts,test.ts}`
- `src/curriculum/grade4/templates/nbt6-divide-one-digit.{ts,test.ts}`

Modified:

- `src/curriculum/grade4/templates/index.ts` — six templates appended to `GRADE_4_TEMPLATES`
- `src/curriculum/misconceptions.ts` — ten new tags

`src/curriculum/registry.ts` untouched. No NC code and no percentage invented.

## 4. Misconception tags

### New (10)

Base Ten is the algorithm-heavy domain, and the existing place-value vocabulary
was written first for Grade 5, where *every* place-value tag is about the
**decimal part** of a number. A Grade 4 child comparing 62,408 with 62,480 has
not made a decimal error, and filing them there would tell a parent their child
struggles with decimals — material the child has not met. That is exactly the
mis-filing the OA bank spent two review rounds unpicking, so these were declared
rather than forced into a near neighbour.

| Tag | Family | Why this family, and why not an existing tag |
|---|---|---|
| `compared-the-wrong-place-first` | `place-value-and-decimals` | Comparing from the ones digit instead of the greatest place. Nearest existing tag is `compared-decimals-right-to-left`, whose description is explicitly about decimals. Family is right: it is a place-value failure, not a choice of operation. |
| `compared-leading-digits-without-place-value` | `place-value-and-decimals` | 9,984 called larger than 62,480 because 9 > 6. `compared-by-digit-count` names the *opposite* whole-number-ish error and is decimal-worded. |
| `stopped-comparing-too-soon` | `place-value-and-decimals` | Quit before reaching the first differing place and called the numbers equal. `same-digits-read-as-equal` is about decimals sharing a digit set — a different reason for the same wrong conclusion. |
| `ordered-from-the-wrong-end` | `place-value-and-decimals` | Right order, wrong direction. `reversed-the-inequality-symbol` names a misread *symbol*; these items have no symbol. |
| `wrote-the-digit-not-its-value` | `place-value-and-decimals` | Answering 6 where 6,000 was asked for. `used-place-value-as-the-factor` names reporting the *place value* (10,000), which is a different number and a different confusion — both appear as distinct options in g4-nbt1-01 and g4-nbt1-03. |
| `skipped-the-zero-place` | `place-value-and-decimals` | Reading/writing/computing past an empty place so later digits drop a column. `omitted-placeholder-zero` and `word-form-place-value-shifted` are both worded for decimal places. Deliberately worded to cover computation too (405 × 7 worked as 45 × 7). |
| `borrowed-without-reducing-the-next-column` | `multi-digit-algorithm` | Took the ten, never reduced the tens digit. `borrowed-without-reducing-the-whole` is the *fraction* version and sits in `fraction-operations` — a parent shown that would be told their child has a fractions problem. |
| `carried-into-the-wrong-column` | `multi-digit-algorithm` | Carry written above the wrong column: one place short, the next long. Nothing existing names a *misplaced* carry, only a dropped one (`added-without-carrying`). |
| `multiplied-each-digit-without-carrying` | `multi-digit-algorithm` | 247 × 8 written as 626. The addition analogue existed; the multiplication one did not. |
| `subtracted-instead-of-added` | `operation-choice` | The exact mirror of the already-declared `added-instead-of-subtracted`, which existed only in one direction. |

Families were chosen by what the weak-spots view should group, not by
convenience: the four comparison/place-value tags group with place value; the
three algorithm slips group with the multi-digit algorithm; the operation swap
groups with operation choice.

### Reused (19)

`wrong-power-of-ten`, `used-place-value-as-the-factor`,
`additive-instead-of-multiplicative-relationship`,
`place-value-shift-wrong-direction`, `forgot-the-final-step`,
`subtracted-without-regrouping`, `added-instead-of-subtracted`,
`added-without-carrying`, `added-carry-before-multiplying`,
`added-instead-of-multiplied`, `dropped-partial-product-zero`,
`added-the-ones-digit-instead-of-multiplying`, `reported-the-estimate`,
`ignored-remainder`, `reported-remainder-without-interpreting`,
`dropped-zero-in-quotient`, `multiplied-instead-of-divided`,
`subtracted-instead-of-divided`, `misplaced-digits-in-the-quotient`.

Each was reused only where it names the error the child actually made. All ten
new tags are used by content, so the orphan check stays green.

## 5. Collision algebra and exhaustive sweeps

Every generator proves distinctness by construction, throws on a collision as a
belt-and-braces guard, and never resamples. Each sweep is a real loop in the
sibling test, asserted, not a claim in prose.

### `g4.nbt1.ten-times` — no exclusions

Values are `d·10^lo`, `d·10^(lo+1)`, `d·10^(lo+2)`, `d·10^0` with `d ∈ 2..9`,
`lo ∈ {1,2}`. `d·10^i = d·10^j` with `d ≥ 2` forces `i = j`; the exponent set is
`{lo, lo+1, lo+2, 0}` = `{1,2,3,0}` or `{2,3,4,0}` — four distinct exponents
either way.

**Sweep:** option values depend only on `(d, lo)` (the numeral's other three
digits appear in the prompt only), so the space is **8 × 2 = 16** pairs. All 16
checked; 0 collisions. Largest value printed anywhere: 90,000.

### `g4.nbt2.expanded-form` — no exclusions

The four strings differ in their **first term**: `a·10⁴`, `a·10³`, `a`, `a·10⁵`.
For any `a ≥ 1` those are four distinct numbers, so the strings differ at their
first token.

**Sweep:** all **8 × 9 × 9 × 9 = 5,832** admissible `(a,b,e,f)`; 0 collisions.

### `g4.nbt7.compare-numbers` — no exclusions

The four options are four *different permutations* — `SAB`, `BAS`, `ABS`, `BSA`
— of three numbers that are forced pairwise distinct (`S` is four-digit, `A` and
`B` are five-digit and differ at the thousands place, `p < q`). Distinctness is
structural; no algebra over the digits is needed.

**Sweep:** the parameters that could break `S < A < B` are `(t, s4)` — 36 pairs
— `(p, q)` — 45 pairs — and the ones triple `o1 < o2 < o3` — C(10,3) = 120.
**36 × 45 × 120 = 194,400** combinations checked; 0 collisions and 0 ordering
failures. The six free hundreds/tens digits are excluded from that space *by
argument, not omission*: `S` is below every five-digit number and `A`, `B`
already differ at the thousands place, so no value of those six can change the
ordering.

### `g4.nbt4.add-subtract` — one exclusion, `d ≠ 5`

**SUBTRACT mode.** With `d = m₀ − n₀`: `answer`, `answer + 2d` (no regrouping
anywhere: the ones gave `d` instead of `10 − d`, and the tens was never reduced
— `(d − (10−d)) + 10 = 2d`), `answer + 10` (borrowed but the tens digit never
reduced), `answer + 2m` (added instead). Pairwise:

- `2d = 0` → `d ≥ 1`, impossible
- `10 = 0`, `2m = 0` → `m ≥ 1000`, impossible
- `2d = 10` → **`d = 5`. Excluded by construction**: `admissibleOnesGaps()`
  never offers 5, and `d = 1` always survives, so the list is never empty.
- `2d = 2m` → `m = d ≤ 9`, impossible
- `2m = 10` → `m = 5`, impossible

**ADD mode.** `answer`, `answer − 10` (carry never made), `answer + 90` (carry
written above the hundreds instead of the tens: −10 there, +100 next door; the
hundreds column is held to `n₂+m₂ ≤ 8` so the misplaced carry cannot cascade),
`answer − 2m`. Gaps `−10`, `+90`, `−2m` are pairwise different for every
`m ≥ 1000`. **No exclusion needed.**

**Sweep:** every pairwise gap is a function of `(d, m)` alone — the answer
cancels out of all six — so the collision space is exactly those pairs.
Subtract: **8 × 9,000 = 72,000** pairs, 0 collisions. Add: **9,000** values of
`m`, 0 collisions. A negative test also confirms the exclusion is real: at
`d = 5`, all 9,000 `m` values collide.

### `g4.nbt5.two-digit-multiply` — one exclusion, `o ≠ 0`

`a ∈ 12..99`, `b = 10t + o`. Values `a(10t+o)`, `a(t+o)`, `a·o`, `10at + o`:

- `answer = no zero` → `9at = 0`; `answer = stopped` → `10at = 0`;
  `no zero = stopped` → `at = 0` — all impossible for `a ≥ 12`, `t ≥ 1`
- `added ones = answer` → `o(a−1) = 0`, impossible
- `added ones = no zero` → `9at = o(a−1)`, and `o(a−1) ≤ 9(a−1) < 9a ≤ 9at`
- `added ones = stopped` → `10at = o(a−1) < 9a < 10a ≤ 10at`

`o ≥ 1` is enforced by filtering multiples of ten out of the multiplier pool at
module load (not resampled); at `o = 0` the "stopped after the ones row" option
would be 0, a product no student writes.

**Sweep:** all **88 × 80 = 7,040** admissible `(a, b)`; 0 collisions.

### `g4.nbt6.divide-one-digit` — no exclusions beyond `r ≥ 1`

Two of the four texts carry `" R "` and two do not, so only two pairs can meet:

- `answer = shifted` → `q = 10q` → `q = 0`, and `q ≥ 12`
- `no leftover = multiplied` → `q = n·d = d²q + dr ≥ 4q > q` since `d ≥ 2`

`r` is drawn from `1..d−1` because at `r = 0` the "remainder thrown away" option
*is* the answer.

**Sweep:** every admissible `(d, q, r)` — `Σ_{d=2..9} 88(d−1) = 88 × 36 =`
**3,168** triples; 0 collisions, and every dividend ≤ 899 (three digits, as the
standard requires).

## 6. Authored bank

18 items, 3 per standard. 13 mastery, 5 advanced (g4-nbt1-03, g4-nbt7-03,
g4-nbt4-03, g4-nbt5-03, g4-nbt6-03); no stretch items — the kit requires
mastery plus at least one tier above it. Correct-answer labels: A×5, B×5, C×4,
D×4 across 18 items.

Every distractor carries a `//` comment showing the arithmetic that produces it.
All of that arithmetic was re-derived independently after writing and confirmed
numerically (e.g. 24,600 − 18,475 = 6,125; the no-regrouping column walk gives
14,275; the un-reduced borrow gives 16,125; 36,847 + 28,596 with every carry
dropped gives 54,333; the carry misplaced from hundreds to ten thousands gives
74,443; 247 × 8 with each carry added before multiplying gives 7,226).

### Duplicate avoidance

`assertNoGeneratorDuplicatesAuthored(GRADE_4_NBT_AUTHORED, GRADE_4_TEMPLATES)`
runs in `authored.nbt.test.ts` against 2,000 seeds of **all eight** Grade 4
templates (OA's two included). It passes. Structurally: every NBT generator
emits either a bare computational prompt (`Add.`, `Subtract.`, `Multiply.`,
`Divide. Write the quotient and the remainder.`, `Order these numbers from LEAST
to GREATEST.`) or one fixed sentence shape about a numeral; every authored item
is a word problem, an error analysis, or a differently worded stem. The
NC.4.NBT.5 authored items also stay off the generator's shape on the maths as
well as the wording: two use 3-digit × 1-digit, which the generator never emits.

### Distinct answers, not just distinct text

Checked against the kit's numeric-equality guard. Items carrying units keep
their units consistent within the item (`1 roll` / `29 rolls` / `7 rolls` /
`29 R 1 rolls`), and no item offers two options naming the same quantity.

## 7. Verification gate

| Gate | Result |
|---|---|
| `npm run lint` | **exit 0** (7 pre-existing warnings, all in `src/components` and `src/context`, none in files touched here) |
| `npx tsc -b --noEmit` | **exit 0**, clean |
| `npm test -- --run` | **40 files, 421 passed, 0 failed** (baseline 345 → 421, +76) |

Targeted run of `npx vitest run src/curriculum/grade4 src/curriculum/misconceptions.test.ts`:
12 files, 105 tests, all passing.

---

# Review fixes

All eight requested fixes applied in one follow-up commit, plus both "minor if
cheap" items. No item was re-authored.

**1. `g4.nbt4.subtract` no longer breaks the 100,000 bound.** The ten-thousands
digit of `n` is now capped at 8, so with `n <= 89,999` and `m <= 9,999` the
`added-instead-of-subtracted` distractor `n + m` is at most 99,998. The cap
touches no part of the collision algebra — every pairwise gap is still a
function of `(d, m)` alone — so the 72,000-pair sweep is unchanged. The sibling
test's bound check now runs over **every number the item prints** (prompt,
promptDetails, all four options, every solution line, concept summary and
common-misconception line), not the key, and over 2,000 seeds rather than 300.
Re-measured over 200,000 seeds: **0 out of range, max 99,974** (was 4,395 over,
max 109,925). The same all-numbers check was added to `g4.nbt4.add` (max 99,988,
matching its docstring bound exactly) and to `g4.nbt2.expanded-form`.

**2. `g4.nbt2.expanded-form`'s `wrong-power-of-ten` option no longer reaches
900,000.** Rather than shifting every place one column up, it now closes the
empty hundreds place up from the RIGHT: `a*10^4 + b*10^3 + e*10^2 + f`, so the
tens digit is expanded as hundreds. Same slip, one place too high, entirely
inside the standard — the option's largest possible sum is 99,909, and the
largest term is `a*10^4 <= 90,000`. The distinctness argument changed with it
and is rewritten in the docstring: the leading terms are now `a*10^4` (twice),
`a*10^3` and `a`, which separates two options, and the pair sharing a leading
term differ at their third term, `e*10` against `e*10^2`, for every `e >= 1`.
Still no exclusions; the 5,832-quadruple sweep is unchanged and still green.

**3. `g4.nbt4.add-subtract` split into `g4.nbt4.add` and `g4.nbt4.subtract`.**
Two files, two sibling tests, two entries in `GRADE_4_TEMPLATES`; the merged
file and its test are deleted. The reasoning — seedless `ReviewKey`, fresh-seed
re-realization in the session composer, a borrowing failure retired as mastered
without retest — is written into the docstring of `nbt4-subtract.ts` and
summarised in `templates/index.ts`, so the next author inherits the rule rather
than the conclusion. Each test now also asserts its own template's misconception
set is exactly the three tags of its operation, with a comment saying that if a
tag from the other operation ever appears, the two templates have drifted back
together — the disjointness is now a guarded invariant, not an observation.

**4. `borrowed-without-reducing-the-next-column` reworded.** Was column-specific
("into the ONES column … the TENS digit … TEN too large") while the name and the
authored use at `g4-nbt4-01` are not — there the borrow is into the thousands
from the ten thousands and the answer is 10,000 too large. Now: "Regrouped into
a column of a subtraction but never reduced the digit in the place to its left
that the amount was taken from, so the answer came out one unit of that place
too large."

**5. `skipped-the-zero-place` reworded.** Was directional ("landed one place too
low"), which is backwards for `g4-nbt2-01`, where "forty thousand, ninety-three"
written 40,930 pushes digits one place too HIGH. Now: "Closed up a place holding
a zero instead of letting it hold that place open, so the digits past it landed
in the wrong columns." The declaration comment records why the description must
not name a direction the error only sometimes has. The distractor keeps its tag.

**6. `g4-nbt7-01` conceptSummary corrected.** "80 more can never overturn a
difference of 80 in the tens" → "8 more in the ones can never overturn a
difference of 80 in the tens".

**7. The impossible check in the addition explanation is gone.** A
nearest-thousand estimate cannot resolve a 90 discrepancy, and the printed
estimate could itself exceed 100,000. Replaced with a check that actually
catches both carry slips: they leave the ones digit correct and the tens digit
wrong, so the child is told to re-add the tens column and asked whether the ten
from the ones column was counted in it, with the specific sum shown both ways.

**8. `g4.nbt5.two-digit-multiply`'s estimate claim is gone.** "not near a tenth
of it" was wrong — the dropped-zero value is `a(t+o)` against `a(10t+o)`, which
reaches 53% at `t=1, o=9` — and rounding each factor to the nearest ten presents
`15 × 15` as "near 400" against an actual 225. Replaced with the exact
statement: writing the tens row as `a × t` instead of `a × 10t` loses exactly
`9at` from the product, with all three numbers printed, plus the structural
check (the second partial product must end in a zero).

**Minor.** `nbt1-ten-times.ts`'s docstring bound corrected from 98,999 to the
true maximum 99,889, with the witness named (`d = 8` in the tens and hundreds,
9s in the three free places); confirmed by the 200,000-seed audit, which reports
exactly 99,889. And `g4.nbt2.expanded-form`'s options now all carry exactly four
terms — the "digits" option dropped its `+ 0` — so the key can no longer be
picked by term count without doing the mathematics. A new test asserts the
four-term shape at every seed.

**Tags left alone as instructed:** `compared-the-wrong-place-first` and
`ordered-from-the-wrong-end` are unchanged.

## Gates after the fixes

| Gate | Result |
|---|---|
| `npm run lint` | **exit 0** (same 7 pre-existing warnings, none in files touched here) |
| `npx tsc -b --noEmit` | **exit 0**, clean |
| `npm test -- --run` | **41 files, 438 passed, 0 failed** (was 421) |

`GRADE_4_TEMPLATES` now holds 9 templates (2 OA, 7 NBT).
