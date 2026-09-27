# Task 7 review — Grade 4 Number & Operations: Fractions

**Commit** `3303f8e` (BASE `b2c0dda`), branch `feat/multi-grade-adaptive`.
**Verdict: CHANGES REQUESTED.** No blocker. The mathematics is sound where it
counts most — all 24 keys are correct, no item has a second right answer, and
every generator's collision algebra survives an independent exhaustive sweep —
but five defects should be fixed before this bank is put in front of a child,
one of them a distractor whose stated error does not produce the option it is
attached to.

Method: every item was solved from the prompt before the `isCorrect` flag was
read; every `//` distractor comment was recomputed; every option in every item
was converted to a single decimal and compared pairwise by hand (not only by
the kit's guard); every generator's parameter space was re-derived from scratch
in a standalone script that shares no code with the implementation or its
tests. That script is reproduced in §6.

---

## 1. The 24 authored items, solved independently

Solved first, then compared to the key. All 24 agree.

| id | my answer | key | agree |
|---|---|---|---|
| g4-nf1-01 | 6 parts (3/4 = 6/8) | 6 parts | yes |
| g4-nf1-02 | 8/20 | 8/20 | yes |
| g4-nf1-03 | same size, 3/6 more parts each smaller | same | yes |
| g4-nf1-04 | 3/5 = 9/15 | 3/5 = 9/15 | yes |
| g4-nf2-01 | 3/8 < 1/2 (0.375 < 0.5) | 3/8 < 1/2 | yes |
| g4-nf2-02 | Rowe, 5/6 = 10/12 > 7/12 | same | yes |
| g4-nf2-03 | 5/6 (0.833 > 0.7 > 0.667 > 0.417) | 5/6 | yes |
| g4-nf2-04 | different wholes, cannot compare | same | yes |
| g4-nf3-01 | 5/8 cup | 5/8 cup | yes |
| g4-nf3-02 | 2 3/5 L (21/5 − 8/5 = 13/5) | 2 3/5 | yes |
| g4-nf3-03 | 3 3/5 mi | 3 3/5 | yes |
| g4-nf3-04 | 7/12 lb | 7/12 | yes |
| g4-nf4-01 | 8/5 cup | 8/5 | yes |
| g4-nf4-02 | denominator also multiplied; 6/7 | same | yes |
| g4-nf4-03 | 21/8 mi | 21/8 | yes |
| g4-nf4-04 | 18/4 yd | 18/4 | yes |
| g4-nf6-01 | 0.18 m | 0.18 | yes |
| g4-nf6-02 | 60/100 | 60/100 | yes |
| g4-nf6-03 | 47/100 km (40/100 + 7/100) | 47/100 | yes |
| g4-nf6-04 | 0.09 | 0.09 | yes |
| g4-nf7-01 | 0.5 > 0.25 | 0.5 > 0.25 | yes |
| g4-nf7-02 | 0.4; 0.35; 0.09 | same | yes |
| g4-nf7-03 | 0.6 inch | 0.6 inch | yes |
| g4-nf7-04 | 0.40 = 0.4 | 0.40 = 0.4 | yes |

For the nine statement-style items (nf1-03, nf1-04, nf2-01, nf2-02, nf2-04,
nf4-02, nf7-01, nf7-02, nf7-04) every option was also evaluated for truth
independently: in each item exactly one option is a true statement. There is no
item with two defensible answers.

Key-position distribution is A×6, B×6, C×6, D×6 — no positional tell.
Difficulty mix: 13 mastery, 11 advanced, 0 stretch; `isStretch` agrees with
`difficulty` in all 24.

## 2. Second-correct-answer audit (the domain's likeliest defect) — CLEAN

### What `numericValue()` can and cannot parse

`src/curriculum/authoredBank.testkit.ts:15`. It strips a leading `$` and all
commas, then anchors three alternatives on the whole string:

1. `w n/d` plus an optional trailing unit word — `"2 3/5 liters"` → 2.6
2. `n/d` plus an optional trailing unit word — `"18/4 yards"` → 4.5
3. an integer or plain decimal plus an optional unit — `"0.09"`, `"6 parts"` → 0.09, 6

The trailing unit may only be letters and spaces. Everything else returns
`null` and is compared **by text only**. In this bank that means: any option
containing `<`, `>`, `=`, `;`, a comma-joined list, or prose is unguarded.

The 9 statement items above are exactly the unguarded set. I hand-checked all
of them by value (§1). The 15 numeric items were additionally checked by hand;
the closest pair anywhere in the bank is g4-nf6-03's `11/110` (0.1) against
`11/100` (0.11) — distinct.

The implementer's extra guard in `authored.nf.test.ts` ("0 of 4 or 4 of 4
options parse") is a good idea and does close the half-guarded-item hole. It
re-declares the three regexes inline rather than importing `numericValue`,
so the two can drift apart silently — see finding 8.

### The two named traps

Both are real and both are correctly avoided:

- `multiplied-the-denominator-too` on `w × n/d` yields `(wn)/(wd) = n/d`, the
  same value as `forgot-to-scale-by-the-whole-number`. g4-nf4-03 uses the
  latter and not the former; g4-nf4-01/-02/-04 use the former and not the
  latter. No item holds both. Confirmed by value.
- No item or generator produces a mixed-number **sum**, so the
  `3 7/5` = `4 2/5` shape never arises. Confirmed by reading all 24 items and
  all 7 `generate()` bodies.

### Unsimplified keys

`18/4 yards`, `8/5 cup`, `21/8 miles`, `60/100`, `15/12 pound` (a distractor)
and the generator's `wn/d` are all left unsimplified. In no item is the key
offered beside its own simplified or unsimplified twin. Adjudicated in §5.3.

## 3. Distractor comments, recomputed

Every `//` comment in `authored.nf.ts` was recomputed from the stated error.
All but one produce exactly the number attached to them. The full list of
verified derivations is omitted for length; the failures and the near-misses:

### DEFECT — g4-nf7-04 option `0.7 < 0.07`

Tagged `omitted-placeholder-zero`, comment: *"The zero holding the tenths place
in 0.07 was ignored, so it was read as 0.7 and came out ahead of 0.7's equal."*

Run the stated error: if 0.07 is re-read as 0.7, the child is comparing 0.7
with 0.7, which makes them **equal** — the child would assert `0.7 = 0.07`, not
`0.7 < 0.07`. The error described cannot produce the option it is attached to,
and the comment's final clause ("ahead of 0.7's equal") is incoherent on its
own terms.

The three sibling uses of this tag are all coherent — g4-nf7-01's `0.06 = 0.6`
(re-read makes them equal, so `=` is asserted), g4-nf7-02's `0.09` placed
first, g4-nf7-03's `0.07` picked as greatest. This one is the outlier.

What a child who picks `0.7 < 0.07` actually did is count digits (`07` looks
longer than `7`), which is `compared-by-digit-count` — already on option A of
the same item. The cheap fix is to change the option to `0.7 = 0.07`, which
makes the tag, the comment and the option agree and stays false. Cost of
leaving it: the app names a procedure to repair that the child did not use, and
the parent is shown that name.

### Near-misses, not defects

- **g4-nf3-02 `commonMisconception`** — *"Taking 1/5 from 3/5 to dodge the
  regrouping gives 3 2/5, which is MORE juice than was poured out of a jug."*
  The arithmetic clause is right (3/5 − 1/5 = 2/5). The check clause is
  vacuous: 3 2/5 is indeed more than the 1 3/5 poured out, but so is the
  correct answer 2 3/5, so the comparison rules nothing out. The sentence that
  follows it ("the answer has to be smaller than 4 1/5 by more than one whole
  liter") is the real check and is correct. Reword the first clause.
- **g4-nf3-04 `commonMisconception`** — *"7/8, which is MORE rice than the bag
  held after the recipe took some."* True on the intended parse (more than
  7/12), false on the other available parse (7/8 < 11/12, what the bag held).
  Ambiguous rather than wrong.
- **g4-nf4-03 `commonMisconception`** — *"3/8 is a bit less than 1/2, so 7 laps
  is a bit less than 3 1/2 miles."* The key is 21/8 = 2 5/8, which is 0.875
  below 3 1/2 — a quarter of the value, not "a bit". A child applying that
  estimate could reject the correct answer as too small. Step 4's "between 2
  and 3 miles" is the accurate statement; make the estimate match it.

## 4. Worked explanations

All 24 `stepByStep` sequences were checked step by step. Every step's
arithmetic is correct and every sequence lands on the key. Spot-checks worth
recording because they could easily have been wrong:

- g4-nf1-03 step 2, "each sixth is one third the size of a half, because 6 is 3
  times 2" — correct.
- g4-nf2-01 step 1, "half of 8 is 4, so 4/8 = 1/2" — correct, and the benchmark
  is the strategy NF.2 names.
- g4-nf2-03 step 2, common denominator 60: 5/6 = 50/60, 7/10 = 42/60,
  2/3 = 40/60 — all correct, 50 > 42 > 40 correct.
- g4-nf3-02 step 2, 4 1/5 = 3 + 5/5 + 1/5 = 3 6/5 — correct.
- g4-nf1-04 step 3, "3/5 is a little over half … while 3/15, 5/15 and 13/15 are
  not" — 0.2, 0.333, 0.867 against 0.6; correct.
- g4-nf4-04 step 4, "18/4 yards … which is 4 and a half yards" — correct.

The kit already enforces that the last step names the key, and it does in all
24.

## 5. The seven generators

Every parameter space was re-derived independently. My counts match the
implementer's exactly, and the barred-combination claims hold — nothing is
excluded for tidiness.

| template | space | admitted | barred | barred really collide | key correct | distractor can equal key |
|---|---|---|---|---|---|---|
| `g4.nf1.equivalent-fraction` | 31 (b,D,a) | **29** | 2 | yes, both | yes | no |
| `g4.nf2.order-fractions` | 12,167 ordered triples | **81** | — | n/a | yes | no |
| `g4.nf3.add-like` | 75 (d,a,b) | **63** | 12 | yes, all 12 | yes | no |
| `g4.nf3.subtract-mixed` | 855 (d,f1,f2,W1,W2) | **765** | 90 | yes, all 90 | yes | no |
| `g4.nf4.multiply-by-whole` | 210 (w,n,d) | **203** | 7 | yes, all 7 | yes | no |
| `g4.nf6.add-tenths-hundredths` | 81 (a,b) | **72** | 9 | yes, all 9 | yes | no |
| `g4.nf7.compare-decimals` | 3,150 (w,t,e,z,q) | **3,150** | 0 | n/a | yes | no |

**Are the sweeps really exhaustive, or sampled?** Yes, exhaustive, and the
claim that the tabulated space *is* the whole space holds in each case. The
only draws a seed makes beyond the tabulated parameters are (a) the option
shuffle, which cannot change what an option says, (b) in `nf2`, which of the
two unused permutations to print in `promptDetails` — I verified there are
always exactly 2, and that neither is an option, and (c) in `nf1`/`nf3`/`nf4`,
nothing else at all. `nf6`'s test additionally proves the deterministic `b`
shift reaches all 72 pairs with no hole; I confirmed the shift `b = bRaw < a ?
bRaw : bRaw + 1` is a bijection from 1..8 onto 1..9 \ {a}.

**Value collisions.** Checked by value, not by string, across every
combination of every space — zero collisions among admitted parameters, and
every barred combination verified to collide. The `nf7` sweep additionally
confirms at all 3,150 draws that (i) the key is the unique maximum, (ii) the
four texts are distinct, and (iii) each of the three faulty rules has a unique
winner which is never the key. I re-derived the inequality chain
`answer > digits > lastDig > zeroLed` from the ranges and it is strict
everywhere.

**Bounds.** Every numeral printed is bounded and the bounds are asserted over
prompts, promptDetails, all four options and the worked solution, not just the
answer — a lesson visibly carried over from the NBT.4 range escape. Maxima:
144 (`12×12`, `nf3-add` multiplied-denominators distractor), 120 (`nf2` LCM in
the explanation), 110 (`nf6`), 100/99 (`nf1`), 72 (`nf4`), 17 (`nf3-subtract`
regrouped numerator). All are distractor or working values; every *key* stays
inside the standard's own denominator list.

**Scope.** `nf4` draws `n ≤ d-1` at every seed, so the second factor is always
a fraction less than one, as NF.4's sourced text requires. `nf6` is the 10/100
pair only. Nothing multiplies two fractions, divides by a fraction, or adds
unlike denominators outside 10/100. No generator reaches thousandths.

**Minor generator observations**

- `g4.nf3.add-like` admits `a + b = d`, so roughly a sixth of its draws print
  the key as `8/8`, `12/12` and so on — one whole written as a fraction. Not
  wrong and no option competes with it, but worth a deliberate decision.
- `g4.nf2.order-fractions` always routes the worked solution through the LCM,
  which can be 120 (e.g. 1/8, 5/6, 7/10 → 15/120, 100/120, 84/120). NF.2's own
  listed strategies are benchmarks, models and common numerators; a 120ths
  conversion is the heaviest available route and is presented as the only one.
  Consider a benchmark first step where one applies, as g4-nf2-03 does.
- `g4.nf7.compare-decimals` prompts "These decimals all describe parts of the
  same size whole" while `w` ranges 0..9, so it can say that of `7.5`. Reword
  or restrict `w` to 0.

## 6. Independent verification script

Re-derives all seven parameter spaces from the docstrings' stated rules,
sharing no code with the implementation or its tests. Output:

```
NF1 admissible 29 barred 2
NF1 (10,100) would add 8 of which a=6 duplicates authored g4-nf6-02
NF2 pool 23
NF2 triples 81
NF3add inRange 75 adm 63 barred 12
NF3sub parts inRange 57 adm 51 barred 6 combos 765 of 855
NF4 inRange 210 adm 203 barred 7
NF6 inRange 81 adm 72 barred 9
NF7 checked 3150
ALL INDEPENDENT CHECKS PASS
```

`npx vitest run src/curriculum/grade4 src/curriculum/misconceptions.test.ts`:
21 files, 208 tests, all passing.

## 7. Scope against `standards.ts`

### Ruling on `g4-nf1-02`'s denominator of 20 — in scope, but inconsistent

NC.4.NF.1's sourced text names no denominators at all. The list 2, 3, 4, 5, 6,
8, 10, 12, 100 appears in NF.2's `description` and in NF.3's, and in neither
case is it stated as a grade-wide constraint. On the sourced text alone,
twentieths are therefore **not forbidden** at NF.1, and I decline to call this
an out-of-scope item.

Two things still make it a finding:

1. **`g4-nf1-04` does the same thing with fifteenths** (`3/5 = 9/15`), which
   the brief did not flag. Whatever is decided for 20 must be decided for 15.
2. **The generator for the same standard contradicts the items.**
   `nf1-equivalent-fraction.ts` restricts both members of every rescaling pair
   to the NF.2 list, with a docstring saying so. So within NC.4.NF.1 a child
   gets twentieths and fifteenths from the authored bank and never from the
   generator. One of the two is wrong about what the standard permits, and
   nothing in the code records which.

Recommendation: either bring nf1-02 and nf1-04 onto the list (2/5 → ?/10, or
3/5 → ?/100 would read the same and drill the same procedure), or relax the
generator and write the ruling down. The first is cheaper and is what the rest
of the domain already assumes. Note also that fifths into twentieths and fifths
into fifteenths are partitions a Grade 4 child has no area or length model for
in this curriculum, which is the practical argument for the first option.

### NF.3's decomposition key concept has no coverage

NC.4.NF.3's `description` is, in its entirety, *"Understand and justify
decompositions of fractions with denominators of 2, 3, 4, 5, 6, 8, 10, 12, and
100,"* and its second `keyConcept` is *"Decompose a fraction into a sum of unit
fractions, and into a sum of fractions with the same denominator, in more than
one way."* Nothing in Task 7 asks a child to decompose anything. The four
authored items are add, subtract-mixed, add-mixed, subtract; the two generators
are add and subtract-mixed. The standard's headline sentence is untested.

This is the largest content gap in the task and the one I would fix first after
the nf7-04 comment. It is also the standard's cheapest item to write ("Which
shows 5/8 broken into a sum in two different ways?"), and decomposition has its
own natural distractors (parts that do not sum to the whole; a decomposition
that changes the denominator).

### Thousandths — the file's own scope claim is false

`authored.nf.ts:30-33` states that nothing here *"reaches thousandths
(NC.5.NBT.3)."* Two options do: `g4-nf6-01`'s `0.018 m` and `g4-nf6-04`'s
`0.009`, both tagged `wrong-power-of-ten`.

I do not think the distractors themselves are wrong — writing 18/100 as 0.018
is a real and common Grade 4 error, and NF.6 is a notation standard where
showing the wrong notation is the point. But the header paragraph is the
document the next author will trust, and it is currently inaccurate about its
own contents. Correct the paragraph (and say why the exception is deliberate),
rather than removing the distractors.

### NF.1's "area and length models"

NF.1 as sourced is an *explain-with-models* standard. g4-nf1-01 (area) and
g4-nf1-03 (length) honour that; g4-nf1-02, g4-nf1-04 and the entire generator
are bare symbolic rescaling with the model appearing only in the prose of the
explanation. Defensible for a text-only multiple-choice app, and worth a
sentence in the file docstring so it reads as a decision rather than drift.

### NF.6's notation half has no generator

The NF.6 generator is addition (see §8.2). Notation — the skill of writing
9/100 as 0.09 — is covered by three authored items and nothing else, in the
highest-weighted domain of the grade. A `g4.nf6.write-the-decimal` generator
would be trivial (it is `nf7`'s option machinery with one number), would be a
distinct skill under §6.5, and would cover the standard's third key concept.
Not required by the brief's floor; recommended.

### Everything else in scope

No item multiplies two fractions (NC.5.NF.4), divides by a fraction
(NC.5.NF.7), or adds unlike denominators outside the 10/100 pair (NC.5.NF.1).
NF.2's same-whole clause is exercised (g4-nf2-04) and NF.7's is asserted in the
stems but never made the subject of an item — `compared-across-different-wholes`
is used once, on a fractions item only, though NF.7 states the rule in its own
sourced wording too. A fourth NF.7 item on that clause would close it.

## 8. The four concerns, adjudicated

### 8.1 Three places `standards.ts` was followed over the brief — upheld, with one correction

1. **NF.4 restricted to a fraction less than one — CONFIRMED.** The sourced
   `keyConcept` reads *"…using this understanding to multiply a whole number by
   any fraction less than one."* The phrase is literally in `standards.ts:59`.
   Every authored item and every generated draw honours it (`n ≤ d-1`, `w ≥ 2`).
   Following the sourced text over the brief's looser "multiplication by a whole
   number" was right.
2. **NF.6 generator is 10+100 addition — CONFIRMED.** `standards.ts:71` carries
   *"Use equivalent fractions to add two fractions with denominators of 10 or
   100"* as a `keyConcept` in its own right. The brief's "decimal notation"
   framing would have dropped the one piece of unlike-denominator addition the
   grade does. Right call. It does, however, leave notation without a
   generator — see §7.
3. **NF.3 split into two template ids — CORRECT, but not a `standards.ts`
   ruling.** `standards.ts` says nothing about template granularity; the split
   comes from spec §6.5 and from the seedless `ReviewKey` argument, which I
   verified independently: the two templates' misconception sets are disjoint
   (`forgot-to-regroup` and `borrowed-without-reducing-the-whole` cannot arise
   in `g4.nf3.add-like`, whose set is `operated-on-the-like-denominators-too`,
   `multiplied-the-denominators-instead-of-keeping-them`,
   `subtracted-instead-of-added`). The split is right; the report files it
   under "brief vs standards.ts", which it is not.

### 8.2 `g4.nf1.equivalent-fraction`'s 29 questions — count confirmed, justification overstated, and it is too small

29 verified independently. It is the smallest space of the seven by a factor of
two, and it is small in absolute terms: a child working NC.4.NF.1 will start
seeing repeats within a couple of sessions, and five of the 29 are the same
question (`1/2 = ?/D`) with a different D.

The report calls 29 *"a ceiling imposed by the standard's own denominator list
… not by the design."* That is not quite true. `(10, 100)` was dropped
wholesale to avoid duplicating authored `g4-nf6-02`, but only **a = 6** actually
duplicates it; `a ∈ {2,3,4,5,7,8,9}` are seven distinct questions the standard
permits and the design discards. (`a = 1` is separately barred by the
`a·k = b` collision.) Restoring `(10, 100)` with `a = 6` excluded takes the
space from 29 to **36**, a 24% increase for a two-line change, and the
exclusion is more precisely targeted and easier to explain than the current one.

Beyond that the ceiling is real, and the honest way to lift it further is a
second NF.1 template for the other direction (renaming into *larger* parts),
which the file already identifies as a separate skill. Recommended as
follow-up, not as part of this task.

### 8.3 Unsimplified results — acceptable, and no item offers the key beside its own simplified form

NC.4.NF nowhere requires simplest form; `NC.4.NF.1` is explicitly about two
names for one amount, so insisting on one canonical name would work against the
standard being taught. `18/4 yards` and `8/20 cup` are normal Grade 4
mathematics. Pedagogically fine.

More importantly, the defect that *would* matter is absent. I converted every
option of every item to a decimal: no key appears beside its own simplified or
unsimplified twin, and no distractor equals a key. The nearest thing is
deliberate and correct — g4-nf4-01's `8/20` (= 2/5, the per-serving amount from
the prompt) beside the key `8/5`, which is the trap, not a second answer.

One caveat rather than an objection: `18/4 yards` as a final answer in a
word problem reads oddly next to the explanation's own "which is 4 and a half
yards". That is a presentation choice worth a sentence in the docstring, not a
defect.

### 8.4 `wrote-the-digit-not-its-value` on `g4-nf6-04` — family right, sentence right, example wrong for this use

Current description: *"Reported a digit itself where the amount that digit
stands for in its place was asked for, such as answering 6 instead of 6,000."*

The abstract clause fits exactly: a child who answers `9.0` for nine shaded
hundredths has reported the digit 9 rather than what 9 in the hundredths place
is worth. The family `place-value-and-decimals` is correct — this is decimal
place value, not a fraction operation. So the reuse is sound.

The **example is not**, and the description is the string shown to a parent. A
parent whose child answered `9.0` is shown "such as answering 6 instead of
6,000" — an illustration that scales the wrong way (the value here is smaller
than the digit, not larger) and comes from a part of mathematics their child
was not doing. Extend the example: *"…such as answering 6 instead of 6,000, or
9 instead of 0.09."* Cheap, and it makes the tag honest across both its uses.

Secondary note: `9.0` is a slightly artificial rendering of this error — a
child committing it writes `9`, and the trailing `.0` exists only because the
stem asks for a decimal. Harmless, since no other option competes with it.

## 9. The eleven new `fraction-operations` tags, checked against every item that uses them

Not just the first use — every use.

| tag | uses | accurate for all? |
|---|---|---|
| `added-to-both-parts-instead-of-multiplying` | nf1-01, nf1-02, nf1-04, nf6-02, `nf1` generator | yes |
| `larger-denominator-means-larger-fraction` | nf1-03, nf2-01, nf2-02, nf2-03, nf2-04, `nf2` generator | yes — nf2-04's pair is 1/4 vs 1/6, literally the description's example shape |
| `applied-the-unit-fraction-rule-to-unlike-numerators` | nf1-03, nf2-01, nf2-03, `nf2` generator | yes — numerators genuinely differ in every use (1 vs 3, 5 vs 2, 5 vs 2) |
| `compared-numerators-only` | nf1-03, nf2-01, nf2-02, nf2-03, nf2-04, `nf2` generator | yes — nf2-04 is the equal-numerators case ("each ate 1 piece"), which "compared by numerators alone" still covers |
| `multiplied-the-denominator-too` | nf4-01, nf4-02, nf4-04, `nf4` generator | yes |
| `wrote-the-product-as-a-mixed-number` | nf4-01, nf4-02, nf4-03, nf4-04, `nf4` generator | yes |
| `multiplied-the-denominators-instead-of-keeping-them` | nf3-01, nf3-04, `nf3-add` generator | yes — description says "adding or subtracting", and nf3-04 is the subtraction |
| `scaled-the-denominator-only` | nf1-01, nf1-02, nf1-04, nf6-02, `nf1` generator | yes — and its claim "the renamed fraction is smaller" holds in every use, because every use rescales into smaller parts |
| `operated-on-the-like-denominators-too` | nf3-01, nf3-03, nf3-04, `nf3-add` generator | yes — naming it for the denominators rather than for addition was the right call; nf3-04 is `11/12 − 4/12 → 7/8`, which an "added…" description would have mis-stated |
| `benchmark-comparison-left-unfinished` | nf2-02 only | yes — both fractions genuinely clear 1/2 (7/12 > 6/12, 5/6 > 3/6) |
| `compared-across-different-wholes` | nf2-04 only | yes |

The twelve reused tags were checked the same way. All fit, and two deserve
explicit credit:

- `scaled-the-wrong-addend`'s existing description specifies *"the second
  fraction's numerator … instead of the first fraction's."* In g4-nf6-03 it is
  attached to `74/100`, which is exactly `4 + 10×7` — the second addend scaled.
  The direction matches; it would have been easy to get backwards.
- `added-numerators-and-denominators` is used only at g4-nf6-03 and the `nf6`
  generator, where the denominators really are unlike (10 and 100), so its
  "instead of finding a common denominator first" clause is true. The
  like-denominator cases correctly got the new tag instead.

The one reuse I would change is `omitted-placeholder-zero` on g4-nf7-04 —
see §3.

Two items carry the same tag on two options (g4-nf6-01 and g4-nf7-01, both
twice). Nothing forbids it and both derivations are distinct; noted only
because it means an item can report one misconception from two different
mistakes.

## 10. Findings

| # | severity | where | defect |
|---|---|---|---|
| 1 | SHOULD FIX | `g4-nf7-04` option `0.7 < 0.07` | Tagged `omitted-placeholder-zero`, but re-reading 0.07 as 0.7 makes the two **equal**, so the stated error yields `=`, not `<`; change the option to `0.7 = 0.07` (or retag) |
| 2 | SHOULD FIX | `NC.4.NF.3` coverage | The standard's headline `description` and second `keyConcept` are decomposition; no item or generator asks a child to decompose a fraction |
| 3 | SHOULD FIX | `authored.nf.ts:30-33` | The header asserts nothing reaches thousandths; `g4-nf6-01` offers `0.018 m` and `g4-nf6-04` offers `0.009` |
| 4 | SHOULD FIX | `g4-nf1-02` (20ths), `g4-nf1-04` (15ths) vs `nf1-equivalent-fraction.ts` | Denominators are permissible under NF.1's sourced text but contradict the same standard's own generator, which restricts itself to the NF.2 list; pick one and record the ruling |
| 5 | SHOULD FIX | `wrote-the-digit-not-its-value` in `misconceptions.ts` | Parent-facing example is whole-number only ("6 instead of 6,000") and scales the wrong way for its new hundredths use at `g4-nf6-04` |
| 6 | SHOULD FIX | `g4.nf1.equivalent-fraction` | Only 29 distinct questions; `(10,100)` was dropped whole when only `a=6` duplicates `g4-nf6-02`, discarding 7 valid questions (29 → 36 for a two-line change) |
| 7 | NOTE | `g4-nf4-03` `commonMisconception` | "7 laps is a bit less than 3 1/2 miles" for a key of 2 5/8 is loose enough to argue against the correct answer |
| 8 | NOTE | `authored.nf.test.ts` | The half-guarded-item check re-declares `numericValue()`'s three regexes inline instead of importing it; the two can drift apart silently |
| 9 | NOTE | `g4-nf3-02`, `g4-nf3-04` `commonMisconception` | Two reasonableness checks are vacuous or ambiguously worded (details in §3) |
| 10 | NOTE | `g4.nf3.add-like` | Admits `a+b=d`, so the key sometimes prints as `8/8`; correct and unambiguous, but worth a deliberate decision |
| 11 | NOTE | `g4.nf2.order-fractions` | Worked solution always routes through the LCM, up to 120ths, where NF.2's own listed strategies are benchmarks and models |
| 12 | NOTE | `g4.nf7.compare-decimals` | Says "parts of the same size whole" while the whole-number part ranges 0..9, so it can say that of `7.5` |
| 13 | NOTE | `NC.4.NF.6` / `NC.4.NF.7` coverage | Notation has no generator (3 authored items only); NF.7's same-whole clause is asserted in stems but never the subject of an item |

Nothing found is a wrong key, a second correct answer, an out-of-grade
requirement on a key, or a generator that can collide. Given that this bank
goes in front of real children, findings 1–6 should land before it ships;
7–13 are improvements.
