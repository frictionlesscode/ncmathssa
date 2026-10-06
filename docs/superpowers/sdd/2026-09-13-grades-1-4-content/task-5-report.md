# Task 5 report — Grade 4 Operations & Algebraic Thinking, and the authored-bank test kit

## The exact first failure

TDD order was honoured: test kit first, then the domain test, then run, then author.

```
npx vitest run src/curriculum/grade4/authored.oa.test.ts

FAIL  src/curriculum/grade4/authored.oa.test.ts [ src/curriculum/grade4/authored.oa.test.ts ]
Error: Failed to resolve import "./authored.oa" from "src/curriculum/grade4/authored.oa.test.ts". Does the file exist?
  Plugin: vite:import-analysis
  File: src/curriculum/grade4/authored.oa.test.ts:4:36

Test Files  1 failed (1)
     Tests  no tests
```

Failed for the right reason — the bank did not exist — not because of a bad assertion.

## Files

| File | Status |
| --- | --- |
| `src/curriculum/authoredBank.testkit.ts` | new — verbatim from the brief, it is the contract 21 later tasks call |
| `src/curriculum/grade4/authored.oa.ts` | new — 17 authored items |
| `src/curriculum/grade4/authored.oa.test.ts` | new — brief's test plus one declared-tag guard (see below) |
| `src/curriculum/grade4/templates/oa1-times-as-many.ts` + `.test.ts` | new |
| `src/curriculum/grade4/templates/oa4-factor-pairs.ts` + `.test.ts` | new |
| `src/curriculum/grade4/templates/index.ts` + `.test.ts` | new — `GRADE_4_TEMPLATES`, Tasks 6–9 append |
| `src/curriculum/misconceptions.ts` | **untouched** — see the finding below |
| `src/curriculum/registry.ts` | untouched, as instructed |

Item counts: NC.4.OA.1 → 4, NC.4.OA.3 → 5, NC.4.OA.4 → 4, NC.4.OA.5 → 4. Seventeen items against a floor of twelve.

Correct-answer positions across the 17 items: A×5, B×4, C×4, D×4. Never predictable, and never
the same position twice running within a standard.

## THE FINDING THAT CHANGED STEP 6: no new misconception tags could be declared

The brief's Step 6 says to declare any new tags. **I declared none, and could not have.**

`misconceptions.test.ts` builds `allUsedTags()` by walking `listCurricula()` — i.e. *registered*
grades only. `registry.ts` registers Grade 5 and nothing else, and I was told not to touch it
(Grade 4 registers several tasks from now, when its content is complete). So any tag I added for
Grade 4 would be declared-but-unused, and the second test —

```
it('declares no tag that nothing uses', ...)
```

— would have failed. The brief's Step 6 and the "must stay green" gate are in direct conflict for
as long as Grade 4 is unregistered.

Resolution: **every tag in this task is an existing, reused tag.** That is the outcome the brief
and the instructions both prefer anyway ("reuse an existing tag whenever it names the same error;
the vocabulary is shared across grades on purpose"), so nothing was lost except in the two places
noted under *Tag strain* below.

Because the registry cannot see this bank yet, nothing in the suite would have caught an
undeclared tag here. I added one guard to `authored.oa.test.ts` (not to the shared test kit, which
I kept byte-for-byte as the brief specified) asserting every authored distractor's tag exists in
`MISCONCEPTIONS`. The template index test already does the same for generators.

**For whoever registers Grade 4:** the moment `registry.ts` gains Grade 4, these tags start
counting as used, and any *new* tag a later content task wants becomes declarable. Tasks 6–9 face
the same restriction until then.

## Every misconception tag used — all reused, none new

| Tag | Family | Where |
| --- | --- | --- |
| `confused-times-with-more` | operation-choice | oa1-01, oa1-03, oa1-04, oa5-03, `g4.oa1.times-as-many` |
| `divided-instead-of-multiplied` | operation-choice | oa1-01, oa5-04, `g4.oa1.times-as-many` |
| `added-carry-before-multiplying` | multi-digit-algorithm | oa1-01, `g4.oa1.times-as-many` |
| `additive-instead-of-multiplicative-relationship` | operation-choice | oa1-02, oa1-03, oa1-04, oa4-03, oa5-01, oa5-02, oa5-04 |
| `multiplied-instead-of-divided` | operation-choice | oa1-02, oa1-03, oa3-04, oa5-02 |
| `divided-by-only-one-digit-of-the-divisor` | multi-digit-algorithm | oa1-02 |
| `reversed-the-relationship` | operation-choice | oa1-04, oa4-02, oa4-03, oa4-04, `g4.oa4.factor-pairs` |
| `forgot-the-final-step` | incomplete-procedure | oa3-01, oa3-03, oa3-05, oa4-01, oa4-02, oa5-01, oa5-02, oa5-03, oa5-04, `g4.oa4.factor-pairs` |
| `added-instead-of-subtracted` | operation-choice | oa3-01 |
| `subtracted-without-regrouping` | multi-digit-algorithm | oa3-01 |
| `ignored-remainder` | remainder-handling | oa3-02, oa3-03, oa4-02, oa4-03, oa4-04, `g4.oa4.factor-pairs` |
| `reported-remainder-without-interpreting` | remainder-handling | oa3-02, oa3-03 |
| `reported-the-estimate` | remainder-handling | oa3-02, oa3-05 |
| `ignored-grouping-symbols` | order-of-operations | oa3-04 |
| `added-instead-of-multiplied` | operation-choice | oa3-04, oa5-01 |
| `added-without-carrying` | multi-digit-algorithm | oa3-05 |

Sixteen tags, **all reused, zero new**, drawn from six existing families. No new
`MisconceptionFamily` was needed either — `operation-choice`, `incomplete-procedure` and
`remainder-handling` carry nearly all of Grade 4 OA, which is a real signal that the Grade 5
vocabulary generalises downward well.

### Tag strain — two places where a new tag would genuinely be better

Recorded so a later task can add them once Grade 4 registers:

1. **`stopped-the-divisor-check-early`** (incomplete-procedure). `g4-oa4-01` ("exactly one of
   these is prime": 49, 47✓, 51, 33) has all three distractors on `forgot-the-final-step`. That is
   honest — every wrong choice is the same error, a divisor search abandoned too soon, and the
   remediation message is identical for all three — but the tag's own wording ("reported that
   intermediate result") is about multi-step arithmetic, not about divisor testing. A dedicated
   tag would make the parent-facing sentence sharper. The *item* is fine: all three distractors are
   odd and none ends in 5, so a student running only the even/ends-in-5 checks cannot eliminate
   any of them, and 49 specifically survives testing 2, 3 and 5.
2. **A "counted terms instead of steps" tag.** The most common Grade 4 pattern error — computing
   `start + step × n` instead of `start + step × (n−1)` — has no honest home. The closest existing
   tag is `counted-endpoints-not-intervals`, whose description matches it exactly but whose family
   is `coordinate-plane`; a Grade 4 pattern error surfacing to a parent under the heading
   "Coordinate Plane" would be misinformation. **I deliberately designed that distractor out of
   every OA.5 item** rather than mis-file it. oa5-02 addresses the same idea in prose instead
   ("three steps separate the 1st term from the 4th, not four").

## Which standards got templates, and why the others did not

| Standard | Template | Reason |
| --- | --- | --- |
| NC.4.OA.1 | `g4.oa1.times-as-many` | Computational. "k times as long" is the same question at every seed; only the numbers should move, and fresh numbers stop a student memorising the answer instead of the comparison. |
| NC.4.OA.4 | `g4.oa4.factor-pairs` | Computational. A new number means a genuinely new divisor search — the entire point of the standard — and the distractor structure regenerates cleanly for any number ≤ 50 with three or more pairs. |
| NC.4.OA.3 | **authored only** | Two-step word problems. Swapping the numbers does not change what the item teaches; the difficulty lives in the wording — which step is asked for, what the remainder *means* here, whether "exactly" or "about" was said. A generator would produce arithmetic drill wearing a word problem's clothes. |
| NC.4.OA.5 | **authored only** | Patterns. The mathematics is carried by how the rule is phrased ("multiply by 3" vs "twice as many" vs "which rule generates this") and by the direction it is run. Fresh values produce no new thinking. |

This matches the Grade 5 split and is documented in the `GRADE_4_TEMPLATES` doc comment.

## Collision algebra

`assertTemplateSound()` demands four distinct option texts at all 300 seeds, so both generators
exclude collisions **by construction**. Neither resamples.

### `g4.oa1.times-as-many`

With the given length `b = 10t + u`, the comparison factor `k`, `b = k·m` by construction, and
`c = floor(u·k / 10)` the carry out of the ones column:

```
A (answer)                    = b·k
B (confused-times-with-more)  = b + k
C (divided-instead-of-mult)   = b / k  = m
D (added-carry-before-mult)   = 10·((t + c)·k) + (u·k mod 10)
```

All six pairs:

| Pair | Solve | Result |
| --- | --- | --- |
| A = B | `b(k−1) = k` → `b = k/(k−1) ≤ 2`, but `b ≥ 10` | never |
| A = C | `k² = 1` | never |
| A = D | `t·k + c = (t + c)·k = t·k + c·k` → `c(k−1) = 0` → `c = 0` | **the one real collision** |
| B = C | `k·m + k = m` → `m(k−1) = −k`, negative | never |
| B = D | `D ≥ 10k(t+1) ≥ 20t + 20` and `B = 10t + u + k ≤ 10t + 18` → `D > B` | never |
| C = D | `C ≤ (10t+9)/k`, `D ≥ 10k(t+1)`; ×k gives `10k²t + 10k² > 10t + 9` for `k ≥ 2` | never |

So the whole admissibility rule is **`(b mod 10)·k ≥ 10`** — a real carry must exist, otherwise
the carry-before-multiplying distractor *is* the correct answer. `admissibleMultipliers(k)`
filters the multiplier list once at module load and `rng.pick` draws from what survives; every
`k` in 2..9 keeps at least eight multipliers, so the list is never empty. A sibling test re-derives
all four values from the prompt across 300 seeds and asserts the carry condition directly.

### `g4.oa4.factor-pairs`

Distinctness here is structural rather than numeric, which is stronger — the four options are
lists, and three of them differ in *length*:

```
A (answer)      complete list                       P entries
B (stopped)     A minus its last pair               P − 1 entries   (a strict prefix of A)
C (remainder)   A plus one bogus pair d × ⌊n/d⌋     P + 1 entries
D (multiples)   "n, 2n, 3n, 4n"                     contains no "×" at all
```

`P−1`, `P` and `P+1` are pairwise different, which settles A/B/C; the missing `×` settles D. C's
extra entry can never coincide with a real pair because `firstNonDivisor(n)` returns a `d` that by
definition does *not* divide `n`, while every real pair's first factor does.

The only way this breaks is `P` being too small, so the candidate pool is filtered at module load
to `n` in 12..50 with **at least three factor pairs** — B then always keeps two or more entries and
is never the empty string. The 50 ceiling is the standard's own wording ("up to and including 50"),
and a test asserts it at 300 seeds.

## Content notes

- Every distractor carries a `//` comment showing the arithmetic that produces it, matching the
  Grade 5 register. No filler numbers; nothing is "the answer ± 1".
- Scope was held to the sourced NCDPI `description` and `keyConcepts` in `grade4/standards.ts`.
  Most notably, **no OA.5 item compares two patterns' corresponding terms** — that is NC.5.OA.3, a
  grade above. Grade 4's wording is about generating and analysing *one* pattern from *one* rule.
- `calculatorAllowed: false` on all 17 items and both templates: the NC EOG mathematics assessment
  is calculator-inactive at grades 3–5.
- **No percentage or weight appears anywhere in this task's output.** The OA band is 14–18% per
  `docs/sources/nc-eog-blueprint.json`, and it was not needed; `weightCategory` strings already
  live in `standards.ts` from Task 4 and were not edited.
- Difficulty spread: 11 mastery, 5 advanced, 1 stretch (`g4-oa3-04`, the equation-with-a-letter
  item), satisfying the kit's both-tiers assertion with room to spare.

## Verification gate

| Gate | Command | Result |
| --- | --- | --- |
| Lint | `npm run lint` | **exit 0** — 7 pre-existing warnings in `src/components` and `src/context`, none from any file in this task |
| Typecheck | `npx tsc -b --noEmit` | **exit 0**, clean |
| Tests | `npm test -- --run` | **32 files, 331 passed, 0 failed** |

Baseline was 305. The +26 is exactly this task's five new test files: `authored.oa.test.ts` (2),
`oa1-times-as-many.test.ts` (9), `oa4-factor-pairs.test.ts` (10), `templates/index.test.ts` (5).
No existing test changed behaviour and none was modified.

---

# Follow-up: tags unblocked

`15a9b78` replaced the registry walk in `misconceptions.test.ts` with `allContent.ts`, which globs
every authored file and template on disk whether or not its grade is registered. The conflict
documented above is gone, so the tagging was redone properly. **The tag table earlier in this
report is superseded by this section.**

## Four new tags, in two new families

Both families are topic families, which is what most of the existing set already is
(`fraction-operations`, `place-value-and-decimals`, `geometry-and-measurement`, `coordinate-plane`,
`shape-classification`, …), so they sit naturally beside what was there.

### `factors-and-multiples` (new family)

NC.4.OA.4 is an entire standard about this and had nowhere to file its errors. They are not a
choice of operation — the child knows to divide — and not a slip in an algorithm; the division is
usually correct. What goes wrong is the divisor *search*, or which end of the factor/multiple
relationship a number sits on. Grades 3 and 5 touch the same topic, so it will not stay a
one-standard family.

| Tag | Description (parent-facing) |
| --- | --- |
| `stopped-the-divisor-check-early` | "Stopped testing divisors too soon, so a factor the number really has was never found and the number was called prime or its list of factor pairs came up short." |
| `confused-factor-with-multiple` | "Mixed up factors and multiples, naming a number the pattern counts UP to where a number that divides into it was needed (or the other way round)." |

### `patterns-and-sequences` (new family)

NC.4.OA.5. The commonest Grade 4 pattern error had no honest tag, and the nearest match,
`counted-endpoints-not-intervals`, lives in `coordinate-plane` — that would tell a parent their
child has a graphing problem when they have a counting-the-steps problem.

| Tag | Description (parent-facing) |
| --- | --- |
| `counted-terms-not-steps` | "Counted the terms of a pattern instead of the steps between them, so the pattern's rule was applied one time too many." |
| `ignored-the-starting-term` | "Applied the rule the right number of times but started from zero, leaving out the number the pattern actually began with." |

`ignored-the-starting-term` was not in my original two. It surfaced while writing the restored
distractor: for "start at 4, add 7, what is the 10th term", answering `7 × 9 = 63` and leaving off
the 4 is as common as the off-by-one, and it is a different error needing a different repair. It is
declared rather than folded into an approximate neighbour, per "an accurate vocabulary over a small
one".

## The restored distractor, and a new item to hold it

- **`g4-oa5-03`** — the weaker of its two `forgot-the-final-step` distractors ("6 squares", doubled
  once and stopped) is replaced by **"96 squares"**: `3 × 2⁵`, doubling once per *figure* across
  Figures 1–5 instead of once per *step*. Tagged `counted-terms-not-steps`. This removes a
  duplicated tag and adds the real error in one move.
- **`g4-oa5-05` (new item, advanced)** — "rule: add 7, first term 4, what is the 10th term?",
  answer 67. It is the purest instance of the error: `74` = `4 + 7×10` (`counted-terms-not-steps`),
  `63` = `7×9` (`ignored-the-starting-term`), `60` = the 9th term (`forgot-the-final-step`). It
  also gives NC.4.OA.5 an additive-rule item; the other four are all multiplicative.

The bank is now **18 items** (OA.1×4, OA.3×5, OA.4×4, OA.5×5). Correct-answer positions: A×5, B×5,
C×4, D×4.

## Re-check of the 16 reused tags

Two were the nearest available fit rather than the right name, and both were replaced:

| Was | Now | Where | Why |
| --- | --- | --- | --- |
| `forgot-the-final-step` | `stopped-the-divisor-check-early` | `g4-oa4-01` (all three distractors), `g4-oa4-02` truncated list, `g4.oa4.factor-pairs` truncated list | "Reported an intermediate result" describes multi-step arithmetic, not an abandoned divisor search. The prime item's three distractors now carry a tag that says what the child actually did — and one that produces a correct remediation message rather than a vague one. |
| `reversed-the-relationship` | `confused-factor-with-multiple` | `g4-oa4-02` multiples list, `g4-oa4-03`, `g4-oa4-04` "90 rows", `g4.oa4.factor-pairs` multiples list | "Found the correct ratio but assigned it to the wrong quantity" is about comparison, not about the factor/multiple relation. |

`reversed-the-relationship` remains correct and in use at `g4-oa1-04` (`n = 63 × 7` applies the
comparison factor to the taller plant), so it is not orphaned.

The other 14 were re-examined and kept; each names exactly what the child did.

## One thing left unresolved (not mine to change)

`reported-the-estimate` is filed under family **`remainder-handling`**, which is wrong — estimation
has nothing to do with remainders. It is wrong for my two uses (`g4-oa3-02`, `g4-oa3-05`) and also
for the Grade 5 use it was written for (`nbt6-02`, "estimated 1,500 ÷ 30 = 50"). The *tag name* is
exactly right for my items, so I did not swap it; only the family is mis-filed. I have not moved it
because doing so changes what Grade 5 parents already see in their reports, which is a decision
above this task. `incomplete-procedure` would be the better home. Flagging for whoever owns the
vocabulary.

Also noted but left alone: `ignored-grouping-symbols` at `g4-oa3-04` is about *omitting* needed
parentheses when writing an equation rather than *ignoring* them when evaluating one. Close enough
that a fifth new tag felt like inflation; recorded here in case a later task disagrees.

## Verification gate (unchanged commands)

| Gate | Result |
| --- | --- |
| `npm run lint` | **exit 0**, same 7 pre-existing warnings, none from this task |
| `npx tsc -b --noEmit` | **exit 0**, clean |
| `npm test -- --run` | **32 files, 331 passed, 0 failed** |

331 was the new baseline and it holds. The count is flat because this follow-up added a question to
an existing bank and two families to an existing union — no new test files.

---

# Review fixes

All six, plus the optional one. Baseline held at 331.

## 1. `g4-oa5-04` — a correct student could be marked wrong

Real defect, and the worst of the six: "Add 9, then add 36, then add 144" genuinely does generate
3, 12, 48, 192, so the stem "Which rule generates this pattern?" had two right answers.

Stem is now **"Which rule takes each term of this pattern to the next one?"** A rule that changes at
every step is then unambiguously not an answer, and the distractor keeps its diagnostic value for
the child who read the gaps instead of the ratio. Explanation reworded to match, and the
`conceptSummary` now says out loud that a rule which changes at every step is not a rule.

## 2. `g4-oa4-01` exceeded the standard's ceiling

51 → **39** (= 3 × 13). Still odd, still not ending in 5, digit sum still a multiple of 3, so the
screen the item teaches is untouched. Everything offered is now ≤ 50, which is NC.4.OA.4's own
wording — and the same bound `g4.oa4.factor-pairs` already enforces and tests. Worked solution
updated (3 + 3 = 6 and 3 + 9 = 12).

## 3. `g4-oa1-02`'s "48" was tagged with an untaught procedure

Correct catch: `divided-by-only-one-digit-of-the-divisor` is a long-division-by-a-two-digit-divisor
error, i.e. NC.5.NBT.6. Grade 4 divides by one-digit divisors only, so the tag accused the child of
mishandling a procedure they have never been shown.

Option kept, retagged to a new tag **`halved-instead-of-dividing`** (`operation-choice`): "Halved
the bigger number instead of dividing it by the number the problem actually gave, because halving
is the division they can do in their head." That is what a Grade 4 child reaching for 96 ÷ 12
actually does.

## 4. Two authored items were reproducible by their own generators

Both fixed by moving the authored item outside an invariant the generator already enforces and
tests, so the separation is structural rather than a coincidence of numbers:

- **`g4-oa1-01`** — rewritten as a garden-club item with a **three-digit** quantity (132 marigolds,
  4 times as many sunflowers, answer 528). `g4.oa1.times-as-many` only ever emits `10 ≤ b ≤ 99`,
  asserted in its own test at 300 seeds, so a three-digit stem is unreachable. All four distractor
  mechanisms survive intact, including the carry error (132 × 4 with each carry added before
  multiplying gives 828).
- **`g4-oa4-02`** — moved from 24 to **49**. The generator's pool is numbers with at least three
  factor pairs (the filter that stops its truncated-list distractor going empty); 49 has two. The
  swap also improves the item: 49 is precisely the number the prime item above catches you on, so
  "1 × 49" is now a strong stopped-early distractor rather than a token one, and the two OA.4 items
  now teach one lesson together.

A test in `authored.oa.test.ts` now asserts the separation directly: no prompt from either
generator, across 2,000 seeds each, matches any authored prompt. Both generator files say in a
comment which invariant is doing the work and why it matters (two review keys, one question).

## 5. `ignored-remainder` on the factor-pair items

Same argument I used for `forgot-the-final-step` and `reversed-the-relationship`, and it applies
here too: the name is literally true but "Remainder Handling" is not what a parent needs to be told
when the child cannot identify a factor.

New tag **`counted-an-uneven-division-as-a-factor`** (`factors-and-multiples`): "Counted a number as
a factor even though dividing by it left something over, so the pair does not multiply back to the
number they started with." Applied at `g4-oa4-02`, `g4-oa4-03` and the generator's bogus-pair
option.

`g4-oa4-04`'s 6-rows and 4-rows options keep `ignored-remainder`, as instructed — there the child
really is mishandling a leftover in a sharing situation, and the family reads correctly.

## 6. Three descriptions that did not describe the use

- **`ignored-grouping-symbols`** — description broadened rather than split, since the family was
  right: "Treated the expression as if the parentheses were not there — either ignoring them when
  working it out, or leaving them out when writing an equation that needed them to group the whole
  quantity." Covers both `g4-oa3-04` (writing) and the Grade 5 order-of-operations items
  (evaluating).
- **`g4-oa5-04` "Divide by 4"** — `divided-instead-of-multiplied` → **`reversed-the-relationship`**.
  My own comment already said "right factor, wrong direction", which is that tag's language; the
  child divided nothing.
- **`g4-oa5-04` "Add 9"** — `forgot-the-final-step` → new tag **`checked-only-the-first-step`**
  (`patterns-and-sequences`): "Accepted a rule because it worked for the first pair of terms,
  without checking that it still works for the rest of the pattern." Structurally the same mistake
  as `stopped-the-divisor-check-early`, one domain over.

All three tags that lost a use — `divided-instead-of-multiplied`, `forgot-the-final-step`,
`ignored-remainder` — remain correct and in use elsewhere, so none is orphaned.

## Optional: exhaustive sweeps stated

Both generator files now state the sweep the way `md5-prism-volume.ts` does, rather than citing the
300-seed test as the argument. Re-derived independently here before writing them down:

- **`g4.oa1.times-as-many`** — all **97** admissible (k, m) combinations, **zero** collisions.
  Unconstrained, **67 of 164** collide, which is the measure of what the `(b mod 10)·k ≥ 10` rule is
  buying. The four CONTEXTS multiply the surface but not the algebra: option values depend only on
  (k, m), so a context can neither create nor remove a collision.
- **`g4.oa4.factor-pairs`** — all **15** numbers in the pool (12, 16, 18, 20, 24, 28, 30, 32, 36,
  40, 42, 44, 45, 48, 50), **zero** collisions.

Both spaces are small enough to check in full, so the property test is now described as a
regression guard rather than as the proof.

## Test kit change under me

`1686899` hardened `authoredBank.testkit.ts` (numeric-equivalence guard, empty prompt, undeclared
tag, final step must state the answer, `isStretch`/`difficulty` agreement). The bank passed it
before these edits and passes after; every changed option text was re-checked against the final
`stepByStep` entry. The hand-copied declared-tag guard is dropped from `authored.oa.test.ts`, since
the kit now owns it — replaced in the same slot by the generator-overlap check from fix 4, which
belongs to the bank rather than to the kit.

Also resolved without me: `8021dbf` refiled `reported-the-estimate` out of `remainder-handling`,
which was the one item I left open last round.

## Verification gate

| Gate | Result |
| --- | --- |
| `npm run lint` | **exit 0**, same 7 pre-existing warnings, none from this task |
| `npx tsc -b --noEmit` | **exit 0**, clean |
| `npm test -- --run` | **32 files, 331 passed, 0 failed** |

Flat at 331: one test was removed from `authored.oa.test.ts` and one added.
