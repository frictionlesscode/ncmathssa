# Task 7 fix round 1 — report

**Status: DONE.** All eleven items addressed, plus the one "deliberately not changing"
instruction. Nothing in the fix list disagreed with `standards.ts`; where it referred to
sourced text (F2, F7, F8) `standards.ts` confirmed it, and I followed it.

## What changed, item by item

**F1 — the real defect.** `g4-nf7-04` option C is now `0.7 = 0.07`, tagged
`omitted-placeholder-zero`, with the comment rewritten to state the error plainly: the
zero holding the tenths place is ignored, 0.07 is read as 0.7, and 0.7 against 0.7 looks
like a match. The ruling is right and the reasoning matters more than the patch — a
child who drops that zero concludes the two are EQUAL, so a `<` could not be reached by
that route and the app would have named an error the child did not make. Step 3 of the
worked solution now also separates the two kinds of zero (a trailing zero that changes
nothing, a leading zero that holds a place), because the item now shows two `=`
statements and the child needs to know why one is true and the other is not.

**F2 — decomposition.** Two authored items added, NC.4.NF.3 now six deep.
`g4-nf3-05` asks for 3/4 as a sum of unit fractions; `g4-nf3-06` asks for a valid
non-unit decomposition of 9/10. Both were checked for a second correct answer with more
care than usual, because decomposition items invite one: `1/2 + 1/4` is a perfectly good
sum of unit fractions equal to 3/4, and `1/10 + 8/10` is a perfectly good decomposition
of 9/10. Neither appears as a distractor. Two new tags were needed and are declared:
`repeated-the-whole-fraction-not-the-unit-fraction` (3/4 given as 3/4 + 3/4 + 3/4) and
`decomposed-the-denominator-too` (9/10 given as 4/5 + 5/5), the exact inverse of
`operated-on-the-like-denominators-too`.

**F3 — the false thousandths claim.** Narrowed. The header now says no item REQUIRES
working in thousandths, names the two distractors that print them, and says why they are
deliberate: ruling out `0.018` for 18/100 needs no arithmetic in thousandths, only the
knowledge that hundredths live in the second decimal place.

**F4 — off-list denominators.** `g4-nf1-02` moved from 20ths to 12ths (2/3 = 8/12) and
`g4-nf1-04` from 15ths to 12ths (3/4 = 9/12). Every fraction in the bank now uses a
denominator from NF.2's sourced list, and the header says so and says why.

**F5 — `wrote-the-digit-not-its-value`.** Example now runs both ways: "answering 6
instead of 6,000, or 9.0 instead of 0.09."

**F6 — the NF.1 generator's space.** `(10, 100)` restored to the pair list and the
exclusion narrowed from the whole pair to the single draw that clashes. 29 → **35**, not
the 36 the fix list predicted, and the difference is deliberate: reworking `g4-nf1-02`
onto 2/3 = ?/12 (F4) put a second authored item inside the generator's space with the
same three distractors, so `(3, 12, 2)` is barred alongside `(10, 100, 6)`. Both bars are
listed with the item they protect. `(4, 12, 3)` is explicitly NOT barred even though
`g4-nf1-04` uses those numbers — that item offers four equations, not four fractions, so
a child never sees the strings this template prints.

**F7 — the Grade 5 method.** The NF.2 worked solution now leads with the benchmark 1/2
(classifying each fraction by doubling its numerator) and settles each adjacent pair with
whichever of the standard's strategies applies: the benchmark where it separates the
pair, a common denominator where it does not. To make that always possible, the triple
table now admits only triples whose adjacent pairs are settleable that way — 81 → **46**.
No denominator outside NF.2's list is printed anywhere, and the test asserts it directly
by checking every numeral that follows a slash, not merely by bounding magnitudes. The
LCM helper is gone.

**F8 — the NF.7 stem and the same-whole requirement.** The generator's stem is now
"Which of these decimals is the greatest?" — the false clause is gone, with a comment
saying why. `g4-nf7-05` added: 0.6 of a small watering can against 0.08 of a large one,
where the child's comparison of the numbers is correct and the conclusion still does not
follow. It reuses `compared-across-different-wholes`, whose description already covered
decimals.

**F9 — the duplicated guard.** `numericValue` is now exported from
`authoredBank.testkit.ts` and imported by `authored.nf.test.ts`; the local regex copy is
deleted. The export carries a docstring explaining what a caller may legitimately ask it
(which options are value-guarded at all) and why a second copy is dangerous.

**F10 — wording.** `g4-nf4-03` now brackets the answer instead of arguing against it:
3/8 is between 1/4 and 1/2, so 7 laps lands between 1 3/4 and 3 1/2 miles, and only
21/8 = 2 5/8 is inside. `g4-nf3-02` and `g4-nf3-04` now both check by adding the answer
back, and each names a number the check produces (5 liters; more than a whole pound).
The old `g4-nf3-04` line claimed 7/8 was "MORE rice than the bag held" — 7/8 is 0.875 and
the bag held 11/12 = 0.917, so the claim was simply false. Caught while rewriting it.

**F11 — NF.6 notation generator.** `g4.nf6.decimal-notation` added: a 10 by 10 grid with
a two-digit count of shaded squares, asking for the decimal. Distractors are the point
shifted each way (`0.0tu` and `t.u`, both `wrong-power-of-ten`) and the digits swapped
(`0.ut`). One exclusion carries the collision argument, `t ≠ u`, proved for all six pairs
in the file. 81 pairs in range, 9 barred by that, 1 more (`t=1, u=8`) barred because it
reproduces `g4-nf6-01`'s four numbers exactly — **71** admissible, swept exhaustively.
Single-digit counts are excluded by construction, not by accident: their distractor set
turns on the placeholder zero rather than on where the point goes, which would be a
second skill in one template. That case stays authored, as `g4-nf6-04`.

**Not changed, as instructed.** `g4.nf3.add-like` still prints a key of `8/8`. A fifth
step now appears exactly when the sum fills the whole: "8/8 is all 8 of the 8 parts that
make one whole, so 8/8 is exactly 1." The test asserts the step appears when and only
when the sum reaches one, and that at least one seed in 2,000 reaches it.

## Constraint compliance

- **Every new or reworked item checked BY VALUE.** The kit's `numericValue` guard runs
  over all 27 items, and the imported-not-copied version now also backs the
  all-numeric-or-all-prose check that keeps any item from being half-guarded.
- **Every distractor comment recomputes to its option.** All 27 items re-derived by hand
  after editing, including the three new ones and the two reworked ones.
- **Every tag description accurate for every item using it.** Three were broadened rather
  than duplicated: `dropped-a-fraction-part` and
  `used-the-denominator-as-the-new-numerator` now cover decomposition as well as their
  original uses, and `multiplied-the-denominator-too` is worded for repetition rather
  than for multiplication alone, because `g4-nf3-05` commits it while decomposing with no
  multiplication sign in sight. `swapped-the-decimal-place-values` had a
  thousandths-only example that scaled wrongly for its two Grade 4 uses; the example now
  names both.
- **Exhaustive sweeps on every generator touched**, with counts asserted in the tests:
  NF.1 35 of 40 (3 collision-barred, 2 authored-barred), NF.2 46 of 12,167 examined,
  NF.6 notation 71 of 81 (9 collision-barred, 1 authored-barred). Untouched generators
  keep their earlier counts.
- **Bounds asserted on every printed number**, not just the answer, including the new
  denominator-membership assertion on NF.2.

## Gates

| gate | result |
|---|---|
| `npm run lint` | exit 0 |
| `npx tsc -b --noEmit` | exit 0, clean |
| `npm test -- --run` | **50 files, 538 tests, all passing** (baseline 524, +14) |

Bank is now 27 authored items (NF.1 4, NF.2 4, NF.3 6, NF.4 4, NF.6 4, NF.7 5) and eight
generators. `src/curriculum/registry.ts` untouched.

## Concerns

1. **The NF.2 table halved, 81 → 46.** That is the price of F7's ruling and I think it is
   the right price — the worked solution is now a Grade 4 method rather than a Grade 5
   one. But it is a real reduction in variety, and it came from a constraint on the
   EXPLANATION rather than on the questions: the 35 triples dropped are perfectly good
   comparisons whose worked solution I could not write inside the standard's strategies.
   If variety there matters more than I judged, the alternative is a per-pair
   common-numerator step, which would readmit some of them at the cost of printing
   denominators like 16 and 9 — worse, on F7's own logic.
2. **`(4, 12, 3)` is left drawable by the NF.1 generator** while `g4-nf1-04` uses those
   numbers. My reasoning is in the file: the authored item offers four equations and the
   generator offers four fractions, so no child sees the same four strings. If the
   reviewer's line is "same numbers, same distractors, bar it" regardless of presentation,
   this is the one place I did not apply it, and barring it costs one question.
3. **Two options in `g4.nf6.decimal-notation` share `wrong-power-of-ten`** (the point
   shifted each way). That follows the precedent of `g4-nf6-01` and of
   `md5-prism-volume.ts` — two options may share a tag, never a value — but it means a
   child who picks either is told the same thing, when "you wrote three decimal places"
   and "you wrote one" are different repairs. Splitting them would need a second tag
   whose only distinction from `wrong-power-of-ten` is direction, and `decimal-point-
   misplaced` is too near a synonym to carry that weight honestly.

---

# Task 7 fix round 2 — report

**Status: DONE.** All five items plus the three "park, do not fix" comments. Nothing in
the round-2 list disagreed with `standards.ts`.

## The pattern worth naming

Three of these five were the same defect: **the claim about the fix went stale in the
same commit as the fix**. G1 is a header paragraph I narrowed one round ago for exactly
this reason, invalidated by a generator I added in the same commit. G3 is a verification
copy that can drift from the thing it verifies — the same shape as `numericValue`'s
inline copy before F9, reintroduced in the sweeps I wrote alongside it. G2 is a
reasonableness line I rewrote last round after finding the old one false, whose
replacement was true but out of grade.

The common cause is that prose and tests describing a thing were written before the
thing was finished, and not re-read after. Both surviving claims now carry a note saying
so, in the hope the next author re-reads rather than re-derives: the thousandths
paragraph says explicitly that it has been wrong twice and that anything printing a third
decimal place belongs in its list, and each sweep says why it drives `generate()` rather
than rebuilding what `generate()` ought to print.

## Item by item

**G1 — thousandths.** Both places updated. The domain paragraph in `authored.nf.ts` now
names `g4.nf6.decimal-notation`'s `0.0tu` option alongside the two authored distractors,
says nothing in the domain requires COMPUTING in thousandths, and carries the note above.
`nf6-decimal-notation.ts` gains a paragraph stating that it prints thousandths on every
one of its 71 draws, why that is the point of the option, and where the domain-level
statement lives.

**G2 — `g4-nf3-04` out of grade.** The check no longer adds 7/8 to 4/12. It now adds the
answer back within twelfths (7/12 + 4/12 = 11/12) and rules the distractor out by
comparison instead: 7/8 is more than 10/12, so almost none of the rice would have been
used — true, and NC.4.NF.2 comparison rather than NC.5.NF.1 addition.

**G3 — sweeps that tested a copy.** All eight NF sweeps rewritten. Each now drives
`generate()` across enough seeds to reach every admissible combination, recovers the
parameters from the PROMPT, solves the question independently, and checks distinct texts,
distinct values, bounds, and that no barred combination is ever drawn. Coverage is
asserted as `seen.size === admissible.size`, which is what makes "exhaustive" a claim the
test can fail rather than a claim the comment makes. Seed counts were measured, not
guessed — full coverage first occurs at seed 200 (NF.1), 301 (NF.2), 353 (NF.3 add),
5,158 (NF.3 subtract), 1,133 (NF.4), 295 (NF.6 add), 316 (NF.6 notation) and 28,118
(NF.7) — and each test runs comfortably past its figure. The NF.6 notation gap the
re-review found (69 of 71 at 300 seeds) is closed at 2,000.

Where a check genuinely cannot use real output — proving that each BARRED combination
really would have collided, which the generator by definition never emits — it is split
into its own test whose name and comment say that it recomputes and why.

**G4 — `g4-nf7-05` twinned with `g4-nf2-04`.** Rewritten to a different shape as well as
a different context. It is no longer a "what is wrong with X's reasoning" item: it asks
which of four statements is TRUE, and its key separates the two questions hiding in one —
the carton is the greater fraction full, and which container holds more liquid cannot be
told from 0.4 and 0.05 alone. Distractors are the placeholder-zero misread, the
digit-count misread, and the same-whole error.

**G5 — two slips.** The garbled "8 is one digit" comment is gone with the rewrite; the
new comments are written against the new options. `g4-nf3-02` now says the dodge gives a
total "4/5 of a liter more than the jug ever held" instead of "a liter more".

**Parked, commented.** `g4-nf1-04`, `g4-nf3-05` and `g4-nf3-06` each carry a comment
saying their options are equations or sums, that `numericValue` therefore returns null
for all four, that the automatic guard does not cover them, and what the four values are.
The two decomposition items also record the second-right-answer check by hand: that
`1/2 + 1/4` is a valid unit-fraction decomposition of 3/4 and is not offered, and that no
other valid decomposition of 9/10 is offered.

## Gates

| gate | result |
|---|---|
| `npm run lint` | exit 0 |
| `npx tsc -b --noEmit` | exit 0, clean |
| `npm test -- --run` | **50 files, 543 tests, all passing** (baseline 538, +5) |

## Concerns

1. **The NF.7 sweep runs 60,000 seeds and takes about 1 second** — by far the slowest
   test in the Grade 4 suite. That is the price of covering 3,150 combinations by
   sampling rather than by enumeration, and it is the price G3 asks for. If suite time
   ever matters more than this coverage, the honest lever is fewer whole-number parts
   (w is 0..9 and contributes a factor of 10 while teaching nothing), not fewer seeds.
2. **Coverage is asserted by observation, so it depends on the RNG.** `seen.size === 71`
   proves 2,000 seeds happened to reach all 71 draws; it does not prove a 2,001st seed
   cannot produce something outside the admissible set. The per-seed check that the drawn
   combination IS admissible covers that direction, so the two together are as strong as
   the old enumeration was — but they are two assertions now, and both are load-bearing.
