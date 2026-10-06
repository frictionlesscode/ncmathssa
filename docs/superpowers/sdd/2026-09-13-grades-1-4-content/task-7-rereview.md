# Task 7 fix round 1 — scoped re-review

**Verdict: APPROVED.**

Reviewed `3303f8e..bbf25a7` on `feat/multi-grade-adaptive` against
`task-7-fixes.md`, `task-7-fix-report.md` and `src/curriculum/grade4/standards.ts`.
Nothing in the fix round contradicts `standards.ts`; where the fix list quoted sourced
text (F2, F7, F8) I checked the quotation against the file and it is accurate.

All eleven fixes landed and the one "deliberately not changing" instruction was honoured.
Every piece of new or reworked mathematics was solved cold from the prompt before the key
was read, every option converted to a decimal and compared, every distractor `//` comment
recomputed, and every worked explanation walked step by step. **No wrong key, no second
correct answer, no distractor comment that fails to produce its option.** Seven NOTE-level
findings follow; none blocks.

Gates re-run independently: `npx vitest run` → **50 files, 538 tests, all passing**
(baseline 524, +14, matching the report).

---

## Part 1 — did each fix land?

| fix | verdict | evidence |
|---|---|---|
| **F1** `g4-nf7-04` option C | **ADDRESSED** | Option C is now `0.7 = 0.07` with the comment rewritten to state the error plainly ("the zero holding the tenths place in 0.07 was ignored, so 0.07 was read as 0.7 — and 0.7 against 0.7 looks like a match"); the tag is kept, and `0.40 = 0.4` remains the only true statement of the four. |
| **F2** NF.3 decomposition | **ADDRESSED** | `g4-nf3-05` (3/4 as a sum of unit fractions) and `g4-nf3-06` (9/10 as a non-unit decomposition) added; NC.4.NF.3 goes 4 → 6 items. Exactly the two shapes F2 named. |
| **F3** thousandths claim | **ADDRESSED** | Header narrowed to "No item REQUIRES working in thousandths", naming `g4-nf6-01`'s `0.018 m` and `g4-nf6-04`'s `0.009` as deliberate. (See NOTE 3 — the new generator also prints thousandths and is not named.) |
| **F4** off-list denominators | **ADDRESSED** | `g4-nf1-02` is now 2/3 = 8/12 and `g4-nf1-04` is now 3/4 = 9/12. I swept every fraction printed in `authored.nf.ts` and every Grade 4 NF generator: no denominator outside {2,3,4,5,6,8,10,12,100} remains. |
| **F5** `wrote-the-digit-not-its-value` | **ADDRESSED** | Description now runs both directions: "answering 6 instead of 6,000, or 9.0 instead of 0.09." Checked against all four uses — see Part 4. |
| **F6** NF.1 generator space | **ADDRESSED** | `(10,100)` restored to `RESCALINGS`; the exclusion is now a per-draw `OWNED_BY_AUTHORED_BANK` list. I re-derived the space independently: 40 in range, 3 collision-barred, 2 authored-barred, **35** admissible. The 36 in the fix list predates F4 — see adjudication 1. |
| **F7** NF.2 Grade 5 method | **ADDRESSED** | `lcm()` deleted; Step 1 now classifies each fraction against the benchmark 1/2 and Steps 2–3 settle each adjacent pair by benchmark or by a common denominator that is the larger of the two. Table 81 → **46**. Test asserts denominator membership directly. |
| **F8** NF.7 stem + same-whole | **ADDRESSED** | Generator stem is now "Which of these decimals is the greatest?" with the false clause gone and a comment saying why; `g4-nf7-05` added with the same-whole requirement as its subject. |
| **F9** duplicated `numericValue` | **ADDRESSED** | `numericValue` exported from `authoredBank.testkit.ts`, local regex copy deleted from `authored.nf.test.ts`. See Part 4. |
| **F10** wording | **ADDRESSED** | `g4-nf4-03` now brackets the answer (1 3/4 … 3 1/2) instead of arguing against it; `g4-nf3-02` and `g4-nf3-04` both check by adding the answer back and name the number the check produces. (NOTE 2 on one loose clause.) |
| **F11** NF.6 notation generator | **ADDRESSED** | `g4.nf6.decimal-notation` added, registered in `templates/index.ts`, 71 admissible draws, all reachable. |
| **do-not-change**: `g4.nf3.add-like` may print `8/8` | **HONOURED** | Driving the generator over 5,000 seeds I get keys of `5/5`, `6/6`, `8/8`, `10/10` and `12/12` — the key is still `d/d`, unsimplified — each followed by "Step 5: 8/8 is all 8 of the 8 parts that make one whole, so 8/8 is exactly 1." The test asserts the fifth step appears when and only when `sum === d`. Nothing was "fixed" that should not have been. |

---

## Part 2 — the new mathematics

Method for each item: read the prompt, solve it, write down the answer, *then* open the
options; convert every option to a decimal; recompute each `//` comment's arithmetic and
check it lands on that exact option text; then walk the explanation.

### `g4-nf3-05` — 3/4 as a sum of unit fractions — **CLEAN**

Solved cold: 3/4 = three copies of 1/4.

| option | value | verdict |
|---|---|---|
| `1/4 + 1/4 + 1/4` | **0.75** | the key, and correct |
| `1/4 + 1/4 + 1/4 + 1/4` | 1.0 | unit fractions, but decomposes the whole |
| `1/12 + 1/12 + 1/12` | 0.25 | unit fractions, but equals 1/4 |
| `3/4 + 3/4 + 3/4` | 2.25 | not unit fractions and not 3/4 |

Four distinct values; exactly one satisfies both halves of the prompt ("sum of unit
fractions" **and** "= 3/4"). **The decomposition trap was checked explicitly**: the
obvious second correct answer for a unit-fraction decomposition of 3/4 would be a finer
partition such as six copies of 1/8, or the non-unit `1/2 + 1/4`. Neither is offered.

Comments recompute: denominator 4 taken as the count → four copies ✓; count kept at 3 but
denominator scaled by 3 → 4 × 3 = 12 ✓; three copies of the whole fraction → 9/4, "three
times too much" ✓. Explanation Steps 1–4 all true; the commonMisconception ("Writing 4
copies of 1/4 decomposes the WHOLE, not the 3/4") is exactly right.

### `g4-nf3-06` — a valid non-unit decomposition of 9/10 — **CLEAN**

Solved cold: any pair of tenths whose numerators sum to 9.

| option (RHS) | value | verdict |
|---|---|---|
| `4/5 + 5/5` | 1.8 = 9/5 | false |
| `3/10 + 5/10` | 0.8 | false |
| **`4/10 + 5/10`** | **0.9** | the key, and correct |
| `5/10 + 5/10` | 1.0 | false |

**This is the item most exposed to the "more than one valid decomposition" failure, and it
survives.** Exactly one of the four offered RHS values equals 9/10. The other valid
decompositions (1/10 + 8/10, 2/10 + 7/10, 3/10 + 6/10) are absent from the options — and
Step 4 volunteers two of them, which is the right way to teach "in more than one way"
without putting a second right answer on the screen.

All three comments recompute exactly (4/5 + 5/5 = 9/5 ✓; 3 + 5 = 8 ✓; 5/10 + 5/10 = one
whole ✓). commonMisconception: 9/5 is 1.8, "nearly two wholes" ✓.

### `g4-nf7-05` — the same-whole requirement for decimals — **CLEAN**

Solved cold: Theo's arithmetic is right and his conclusion does not follow, because the
two decimals are fractions of different wholes.

Option C ("Nothing is wrong: 0.08 is less than 0.6, so Theo has less water") is the one
that could compete with the key. It cannot: it asserts a conclusion that is not entailed,
and the prompt states the large can "holds far more". The key is the only option that
identifies the actual flaw. Options A and B are both false as stated (0.08 < 0.6).

Explanation Step 3 checks out: if the large can is 10× the small one, 0.08 of it is 0.8 of
a small can, which is more than Maya's 0.6 — so the numeric comparison genuinely inverts.

### `g4-nf1-02` reworked — 2/3 = ?/12 — **CLEAN**

Values 8/12 = 0.667 (key), 2/12 = 0.167, 11/12 = 0.917, 3/12 = 0.25 — four distinct, and
no option is an unsimplified equivalent of 2/3. Comments: 12/3 = 4, numerator copied →
2/12 ✓; 12 − 3 = 9 added to both → 11/12 ✓; denominator 3 as numerator → 3/12 ✓.
Explanation Steps 1–4 correct. commonMisconception's size check ("11/12 nearly a whole,
2/3 a little over half") is true.

All four options parse under `numericValue`, so this item **is** value-guarded by the kit.

### `g4-nf1-04` reworked — which equation is true — **CLEAN**

`3/4 = 9/12` is the only true equation (0.75 = 0.75); the other three are 0.75 vs 0.25,
0.75 vs 0.333, 0.75 vs 0.917. Comments recompute ✓. Step 3's length-model check is
accurate on all four: 3/12 is a quarter, 4/12 is a third, 11/12 is nearly the whole strip.

### `g4.nf6.decimal-notation` — the new generator — **CLEAN**

Read `generate()` before the test. It draws `(t, u)` from `PAIRS`, shades `10t + u` of 100
squares, and answers `0.tu`. **Answer matches the prompt**: `shaded/100 = (10t+u)/100 = 0.tu`.

I re-derived the collision algebra independently over all 81 `(t, u)` pairs rather than
trusting the docstring, and it is right — `t = u` is the sole live collision:

| pair | condition | status |
|---|---|---|
| key = tooFarDown | 10t+u = 0 | impossible |
| key = swapped | t = u | **the one exclusion** |
| key = tooFarUp | key < 1 ≤ tooFarUp | impossible |
| tooFarDown = tooFarUp | ≤ 0.098 vs ≥ 1.1 | impossible |
| tooFarDown = swapped | u = 0 | excluded by construction |
| tooFarUp = swapped | ≥ 1.1 vs ≤ 0.98 | impossible |

Swept all 71 admissible draws myself: every key equals `shaded/100`, every distractor
equals the value its comment names, no two option values coincide, **no distractor can
ever equal the key**. Bounds: `shaded ∈ [12, 98]`, the largest numeral printed anywhere is
100, every option value is < 10, and the answer always has exactly two decimal places.
All 71 draws are reachable from seeds.

The test's sweep loops `t = 1..9 × u = 1..9` — **all 81 pairs, exhaustive, not sampled** —
and pins `inRange 81`, `admissible 71`, `barredByCollision 9`, `barredByAuthoredBank 1`.
I reproduce all four numbers. It also checks that each of the 9 collision-barred pairs
really would have collided, so nothing is excluded for tidiness. See NOTE 4 for the one
caveat about how the sweep is written.

The authored bar `'1,8'` is real: `g4-nf6-01` offers 0.18 / 1.8 / 0.018 / 0.81, the exact
four numbers this template prints at `t=1, u=8`. Excluding single-digit counts by
construction (so `g4-nf6-04`'s 0.09 stays authored) is the right call — that case's
distractor set turns on the placeholder zero, a different skill.

### Cross-bank check I ran beyond what was asked

I compared the **option set** of every one of the 27 authored NF items against the option
set of every one of the 17 Grade 4 templates over 3,000 seeds each. **Zero clashes.** The
two `OWNED_BY_AUTHORED_BANK` bars and the one NF.6 bar are doing their job, and no
un-barred draw reproduces an authored item's four options.

---

## Part 3 — the four implementer concerns

**1. F6 landed at 35, not 36. — ACCEPT, count verified.**
Independently re-derived: the 14 rescaling pairs admit 40 `(b, D, a)` combinations;
`a·k = b` bars 3 of them — `(4,8,2)`, `(6,12,3)`, `(10,100,1)` — and the authored bank bars
2 more, leaving **35**. F6's prediction of 36 was written before F4 moved `g4-nf1-02` onto
2/3 = 8/12, which put a second authored item inside the generator's space; 35 is the
arithmetically correct consequence of the two rulings together, not a shortfall. Both bars
carry the item they protect in an inline comment, and I verified each bar is genuine:
`(10,100,6)` generates numerators [60, 6, 96, 10] = `g4-nf6-02`'s four options exactly, and
`(3,12,2)` generates [8, 2, 11, 3] = `g4-nf1-02`'s four options exactly.

**2. `(4,12,3)` left drawable beside `g4-nf1-04`. — SOUND, with a recommendation.**
The argument holds on its own terms. The generator at `(4,12,3)` prints `9/12`, `3/12`,
`11/12`, `4/12` under "Which fraction with a denominator of 12 names the same amount as
3/4?"; `g4-nf1-04` prints `3/4 = 9/12`, `3/4 = 3/12`, `3/4 = 11/12`, `3/4 = 4/12` under
"Which equation is true?". No string a child reads is shared, and verifying four equations
is a different task from selecting a renaming. My option-set sweep confirms no clash. The
line the implementer drew — **bar when the option strings coincide, not when the numbers
do** — is principled, and it is the line that correctly separates `(3,12,2)` (barred,
identical strings) from `(4,12,3)` (not barred). The residual is perceived repetition
rather than a question served twice under two review keys, which is what the bar exists to
prevent. I would still bar it, because the cost is one draw out of 35 and a child who meets
both in a session sees the same renaming twice; but leaving it is defensible and not a
defect.

**3. NF.2 table 81 → 46. — RIGHT TRADE, and 46 is enough.**
F7's ruling comes straight out of `standards.ts`: NC.4.NF.2's keyConcepts name benchmark
fractions, common numerators and common denominators, and nothing else. A worked solution
printing 120ths is outside the grade whatever else it gets right, so constraining the table
to triples whose adjacent pairs are settleable inside those strategies is correct, and
paying 35 triples for it is the right price. The rejected alternative (a per-pair
common-numerator step) would print denominators like 16 and 9 — worse on F7's own logic, as
the implementer says.

I verified all 46 triples independently, driving `generate()` and checking every claim it
prints: every benchmark classification is right; every "the benchmark has already separated
them" sentence is true (I proved the complement — when that branch is not taken, both
fractions really are on the same side of 1/2); every common denominator used is a genuine
common denominator drawn from the standard's list; every rescaling is integral and in the
right order; no denominator outside the list and no numeral above 22 is printed anywhere;
the prompt's listed order never matches an option. **46 of 46 correct.**

46 distinct questions, all reachable from seeds, each with shuffled options and two possible
prompt orderings, is ample variety — comparable to the NF.1 generator's 35 and well inside
the range the other Grade 4 templates occupy.

**4. `g4-nf3-04`'s old reasonableness check was false. — CONFIRMED, and the replacement is
true.**
The old claim was that 7/8 is "MORE rice than the bag held after the recipe took some".
7/8 = 0.875 and the bag held 11/12 = 0.9167, so 7/8 was *less*: the claim was false, and the
implementer was right to catch it. The replacement checks out on both halves:
7/12 + 4/12 = 11/12, exactly what the bag held ✓; and 7/8 + 4/12 = 21/24 + 8/24 = 29/24 ≈
1.208, which is indeed "more than a whole pound" and therefore more than the 11/12 the bag
ever contained ✓. Both statements are true.

---

## Part 4 — regression check

### `numericValue` export

The exported function is **byte-identical** to the private one it replaces — the diff adds
only the `export` keyword and docstring, no change to the body.

Against the predicate the test previously declared inline, it is **not** literally identical:
`numericValue` first strips a leading `$` and all commas, which the inline `parses()` did
not, so `"$1,200"` and `"6,000 meters"` are now seen as quantities where the local copy
called them prose. I checked every option text in `GRADE_4_NF_AUTHORED` for a `$` or a comma
in a numeric position: **there is none**, so on this bank the two agree option for option and
the assertion means exactly what it meant before. Where they differ, the export is strictly
the more capable parser — more options get value-guarded, never fewer — which is the
direction F9 wanted. The test suite confirms: 538 passing, nothing newly skipped.

The only other caller of `numericValue` is `assertAuthoredBankSound` in the same file, whose
behaviour is untouched.

### `wrote-the-digit-not-its-value` — accurate for every use, at every grade

Grepped the whole `src/` tree. The tag has exactly four uses, all Grade 4, none in Grades
1–3 or 5:

| use | what the option is | covered by the new description? |
|---|---|---|
| `grade4/authored.nbt.ts:159` (`g4-nbt1-03`) | `6` where 6,000 was asked | **yes** — it is the first example verbatim |
| `grade4/templates/nbt1-ten-times.ts:92` | the digit `d` where `d × 10^k` was asked | yes |
| `grade4/templates/nbt2-expanded-form.ts:83` | `a + b + e + f`, digits instead of their place values | yes |
| `grade4/authored.nf.ts:1025` (`g4-nf6-04`) | `9.0` where 0.09 was asked | **yes** — the second example verbatim |

The first three scale one way (the digit is smaller than its value) and the fourth the
other (9.0 is a hundred times 0.09). The old single example described only the first
direction, which is exactly what F5 flagged; the new two-example form covers both. **A
parent reading this string now gets an accurate account whichever item their child missed.**

### The four other descriptions broadened in the same commit

The fix list's constraint ("every tag description accurate for EVERY item using it") applies
to these too, so I checked them the same way:

- **`dropped-a-fraction-part`** — 3 uses: `g4-nf3-03`, the new `g4-nf3-06`, and
  `grade5/authored.ts:738` (`1 5/8 pounds`, "added only the whole 2, dropping the 1/4").
  The new "when combining the whole-number parts of a mixed-number problem, **or** when
  breaking a fraction into pieces that have to add back to it" covers all three, including
  the Grade 5 one. ✓
- **`used-the-denominator-as-the-new-numerator`** — 8 uses across Grade 4 and
  `grade5/authored.ts:740` (`1 1/8`, "rescaled 1/4 to 4/8 instead of 2/8"). The first clause
  covers every renaming use including the Grade 5 one; the second covers both new
  decomposition uses (`g4-nf3-05` decomposes 4/4 instead of 3/4; `g4-nf3-06` splits the 10).
  ✓
- **`multiplied-the-denominator-too`** — 5 uses. Four are NF.4 multiplications and the fifth
  is `g4-nf3-05`'s `1/12 + 1/12 + 1/12`. "when a fraction was being repeated — multiplied by
  a whole number, or written out as a sum of copies" covers both. ✓
- **`swapped-the-decimal-place-values`** — 3 uses: `g4-nf6-01` (0.81 for 0.18), the new
  generator (`0.ut` for `0.tu`), and `grade5/authored.ts:378` (`74.802` for 74.208, tenths
  and thousandths traded). The new two-example form names both scales; the old
  thousandths-only example did not describe either Grade 4 use. ✓

Two genuinely new tags are declared and their descriptions match their single use each:
`repeated-the-whole-fraction-not-the-unit-fraction` and `decomposed-the-denominator-too`.
Tags reused without change (`compared-across-different-wholes`,
`compared-by-digit-count`, `omitted-placeholder-zero`, `wrong-power-of-ten`) were checked
against their new Grade 4 uses and all four descriptions already fit —
`compared-across-different-wholes` in particular already reads "two fractions **or
decimals**", so `g4-nf7-05` needed no edit, as the report says.

---

## New findings

None blocks. Listed worst-first.

**NOTE 1 — `g4-nf7-05` option B's `//` comment names the wrong digit.**
It reads "The decimal parts read as whole numbers: 8 is one digit and 0.08 shows two, so the
longer one was called the larger." The one-digit decimal part belongs to **0.6**, not to 8.
The option itself is exactly what `compared-by-digit-count` produces, so this is not the F1
class of defect — the error does reach the option — but the sentence as written is confusing
and should say "0.6 shows one digit and 0.08 shows two".

**NOTE 2 — `g4-nf3-02`'s new reasonableness line overstates by 1/5 litre.**
"3 2/5 + 1 3/5 = 5 litres — a litre more juice than was ever in the jug." The arithmetic is
right (the sum is exactly 5) and the check is a good one, but the jug held 4 1/5, so 5 is
**4/5** of a litre more, not a litre. F10 exists because a loose reasonableness clause was
arguable against the key; this replacement is not arguable against the key, but it is loose
in the same way, in the very item F10 asked to tighten. Either drop the clause or say
"nearly a litre more".

**NOTE 3 — the new NF.6 generator prints thousandths on all 71 draws, and nothing says so.**
The `0.0tu` distractor is a three-decimal-place number, exactly like `g4-nf6-01`'s `0.018`.
`authored.nf.ts`'s newly narrowed F3 paragraph enumerates only two places thousandths appear,
which is true of the authored bank but no longer a complete account of the grade's fraction
content; and `nf6-decimal-notation.ts`'s own "Largest number printed: 100" says nothing about
decimal places. The distractor is right and F3's reasoning endorses it — this is a
documentation gap, of precisely the kind F3 was raised about.

**NOTE 4 — the "exhaustive sweep" tests sweep the algebra, not the generator.**
`nf6-decimal-notation.test.ts` and `nf1-equivalent-fraction.test.ts` both re-derive the option
texts inline (`[\`0.${t}${u}\`, \`0.0${t}${u}\`, …]`) rather than calling `generate()`, so a
drift between the generator and the sweep's formula would not turn either test red. The
value and bounds tests that *do* call `generate()` run 300 seeds, which reach only **69 of
the 71** NF.6 draws (2,000 seeds reach all 71; NF.1's 300 seeds do reach all 35). I drove
`nf6DecimalNotation.generate()` over 50,000 seeds and confirmed it agrees with the sweep's
formula at every draw, so there is no live defect — but raising the sampled tests to 2,000
seeds, or having the sweep call `generate()`, would close the gap the constraint intended to
close.

**NOTE 5 — the three highest-risk new items are outside the kit's value guard.**
`g4-nf3-05`, `g4-nf3-06` and `g4-nf1-04` present all four options as expressions or
equations, so `numericValue` returns null for every one and they are compared by text alone.
The half-guarded test passes precisely *because* they are uniformly unguarded (0 of 4 parse),
which is correct by its own rule — but decomposition items are the shape most likely to carry
a second correct answer, and they now rest entirely on hand-checking. I hand-checked all
three by value and all three are clean. Worth considering an expression-aware evaluator for
this shape.

**NOTE 6 — `g4-nf3-04`'s replacement crosses unlike denominators in prose.**
"7/8 + 4/12 comes to more than a whole pound" is true (29/24), but adding eighths to twelfths
is NC.5.NF.1, which the file header says this bank never asks. It is asserted rather than
computed, and a child can reach it from "7/8 is nearly 1, and adding a third pushes past 1",
so it is acceptable as written — but it is the one sentence in the bank a Grade 4 child cannot
verify with Grade 4 tools.

**NOTE 7 — `g4-nf7-05` is a near word-for-word twin of `g4-nf2-04`.**
Both are four-option error-analysis items about the same-whole requirement, with the same
tag set and near-identical option phrasing ("Nothing is wrong: 1/4 is always more than
1/6 …" / "Nothing is wrong: 0.08 is less than 0.6 …"; "The two pizzas are different sizes,
so comparing 1/4 and 1/6 cannot tell you who ate more food." / "The two cans are different
sizes, so comparing 0.08 and 0.6 cannot tell you who has more water."). Both standards
genuinely carry the same-whole keyConcept, so covering both is right and they are separate
review keys — but a child who meets both in one session reads the same sentence twice.
Varying the second item's wording would cost nothing.

---

## Scope

Per the brief, the 24 previously reviewed items were not re-examined except where the fix
diff touched them (`g4-nf1-02`, `g4-nf1-04`, `g4-nf3-02`, `g4-nf3-04`, `g4-nf4-03`,
`g4-nf7-04`). Grade 4 MD, G, OA, NBT content and Grades 1–3 were out of scope except for
the cross-grade tag-description audit in Part 4, which the fix list's constraint required.
