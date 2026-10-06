# Task 7 fix round 1

The content review confirmed the mathematics: all 24 items were solved cold and agree
with their keys, no item has a second correct answer, every explanation lands on its key,
and all seven generator spaces were re-derived independently. Nothing below is a wrong
answer. Do not re-author items that are not named here.

## Must fix

**F1. `g4-nf7-04` option C is tagged with an error that does not produce it.**
Option C is `0.7 < 0.07` tagged `omitted-placeholder-zero`. Applying that error to 0.07
reads it as 0.7, and 0.7 vs 0.7 is EQUAL, so the error produces `=`, not `<`. The `//`
comment above it is garbled for the same reason ("came out ahead of 0.7's equal").
RULING: change the option text to `0.7 = 0.07` and rewrite the comment to state the
error plainly. Keep the tag — placeholder zeros are this item's whole subject, and the
key `0.40 = 0.4` stays the only TRUE statement. Two options showing `=` is fine.

**F2. `NC.4.NF.3` has no decomposition content.** The standard's headline description is
"Understand and justify decompositions of fractions" and its second keyConcept is
decomposing into a sum of unit fractions "in more than one way". No item or generator
asks for it. Add two authored items that do — one choosing the correct decomposition of
a fraction into unit fractions, one recognising a valid non-unit decomposition.

**F3. The file header's thousandths claim is false.** `authored.nf.ts:30-33` says nothing
reaches thousandths; `g4-nf6-01` offers `0.018 m` and `g4-nf6-04` offers `0.009`. The
ITEMS are fine — a thousandths distractor is exactly the shifted-place error NF.6 should
catch, and no child has to compute in thousandths. The COMMENT is what is wrong. Narrow
it to say no item requires working in thousandths, and that those two distractors print
thousandths deliberately.

**F4. NF.1 authored items use denominators outside the grade's working list.**
`g4-nf1-02` uses 20ths and `g4-nf1-04` uses 15ths, while the same standard's own
generator restricts every fraction to NF.2's sourced list (2, 3, 4, 5, 6, 8, 10, 12,
100). NF.1's own text names no list, so this is a judgment call and the ruling is:
align the authored items with the list, because a standard contradicting its own
generator is worse than a slightly narrower set of equivalence practice. Rework both
items onto list denominators.

**F5. `wrote-the-digit-not-its-value` description is wrong for its new use.** Its
parent-facing example is whole-number only ("6 instead of 6,000") and scales the wrong
direction for `g4-nf6-04`, where the error writes 9.0 instead of 0.09. Extend the
example to cover both directions. A parent reads this string.

**F6. `g4.nf1.equivalent-fraction` drops more of its space than it needs to.** The
`(10,100)` pair was excluded whole to avoid colliding with `g4-nf6-02`, but only `a=6`
actually collides. Narrow the exclusion to that one case: 29 questions becomes 36.

**F7. `g4.nf2.order-fractions` teaches a Grade 5 method.** Its worked solution always
routes through the LCM, printing denominators as large as 120ths. NF.2's sourced
strategies are benchmark fractions (0, 1/2, a whole), common numerators, and common
denominators — in that spirit. RULING: the worked solution must lead with benchmark
reasoning and may use a common denominator only as confirmation, and must never print a
denominator outside the NF.2 list.

**F8. `g4.nf7.compare-decimals` stem contradicts its own values.** It says "parts of the
same size whole" while the whole-number part ranges 0-9, so most values are not parts of
a whole at all. Reword the stem to drop the mismatched clause. Separately, NF.7's
same-whole requirement is a sourced keyConcept that no item covers — add one authored
item whose subject IS that requirement (two measurements compared against different
wholes are not comparable).

**F9. `authored.nf.test.ts` re-declares `numericValue()`'s regexes inline.** That is the
guard that keeps a second correct answer out of a fractions bank, and a local copy can
drift from the kit silently. Export `numericValue` from `authoredBank.testkit.ts` and
import it.

**F10. Wording.** `g4-nf4-03`'s commonMisconception ("7 laps is a bit less than
3 1/2 miles" against a key of 2 5/8) is loose enough to argue against the correct answer
— tighten it. `g4-nf3-02` and `g4-nf3-04` have reasonableness checks that are vacuous or
ambiguous — make them say something.

## Add

**F11. NF.6 has no generator for decimal notation** — only three authored items and the
addition generator. Notation is the larger half of that standard. Add one, on the
established pattern (a 10x10 grid or a metre stick divided into 100 parts, asking for
the decimal). Bar any seed that reproduces an authored item.

## Deliberately NOT changing

`g4.nf3.add-like` printing a key of `8/8`: leave it. NC.4.NF.3 never requires simplest
form and 8/8 is a true and useful thing for a child to see. Instead add a closing step to
that generator's worked solution noting that 8/8 is one whole.

## Constraints

- `standards.ts` remains the authority. If anything above disagrees with it, it wins and
  you say so in your report.
- Every new or reworked item: check BY VALUE that no two options name the same quantity.
- Every distractor's `//` comment must recompute to that exact option. F1 exists because
  one did not.
- Every tag description must be accurate for EVERY item using it, not just the newest.
- Exhaustive parameter sweeps for any generator you touch, and assert bounds on every
  printed number, not just the answer.
- Run `npx vitest run`, `npm run lint`, `npx tsc -b --noEmit`. Baseline is 524 passing.
