# Task 22 — fix round 1 findings

Source: the opus task review of `80e94ac..ba3d99c`. Every item below is REQUIRED this round.
Items the controller parked or ruled acceptable are listed at the end, so you don't act on them.

## I1: `authored.oa.ts:342-367` (g1-oa4-01) is written to CCSS 1.OA.4, not NC.1.OA.4 (Important)

The prompt "What is 13 − 8? Think: 8 + ☐ = 13." poses a subtraction and solves it through addition. That is
NC.1.OA.6's "relationship between addition and subtraction", and it duplicates g1-oa6-04's skill.

NC.1.OA.4 (`grade1/standards.ts:55-60`) poses an unknown-addend problem and solves it by adding on "and/or
changing it to a subtraction problem". No OA.4 item's worked solution does keyConcept 2, "Rewriting an
unknown-addend problem as a subtraction problem": g1-oa4-02 and -03 both add on by making ten.

Fix:
- Re-pose g1-oa4-01 as the unknown addend, solved by subtraction. For example: prompt
  "What number makes 8 + ☐ = 13 true? Think: 13 − 8." Steps: 8 + ☐ = 13 → 13 − 8 = 5. Keep the "Think:"
  sentence so it stays off the missing-part generator's prompt shape.
- Make its distractors honest for that route.
- Make the docstrings at `authored.oa.ts:27-28` and `templates/index.ts:59-60` describe what is actually
  covered.

## I2: `templates/oa9-add-within-10.ts:99` states a false step at drawable seeds (Important)

"Step 1: Start at the bigger number, ${big}." is false for the doubles 1+1 … 5+5 in the draw table (`:48-51`).
Seed 0 draws "What is 2 + 2?" and gives "Start at the bigger number, 2.", and 35 of seeds 0–299 draw equal
addends. The test at `oa9-add-within-10.test.ts:104` rebuilds the same template string, so it cannot catch this.

Fix:
- Branch on `a === b` (e.g. "Both numbers are 2. Start at 2.").
- Add a test that sweeps the draw space and asserts "bigger" never appears when a === b.
- Read every other generated sentence in all 8 templates against its full draw space for the same class.

## M1: the `subtracted-without-regrouping` tag is reused at Grade 1 (`oa6-get-to-ten-subtract.ts:82`; `authored.oa.ts:628`)

Its family, `multi-digit-algorithm`, tells a Grade 1 parent their child has a column-algorithm problem on a
"Get to 10 first" item, and first graders are not taught the column algorithm. In g1-oa6-04 the prompt says
Max *counts on*, and counting on cannot produce 15.

Fix:
- Declare a Grade-1 tag in the `addition-and-subtraction-strategies` family that names the actual error made
  inside a get-to-ten subtraction.
- Use it in both places.
- Make g1-oa6-04's distractor reachable by the strategy its prompt describes.

This follows the global constraint: never reuse a tag that names a different error.

## M2: a false claim in `task-22-report.md:75`

The report says "the answer is never the middle of three consecutive numbers". Your own pins contradict it
(`oa6-get-to-ten-subtract.test.ts:44-49`: options 6, 7, 8, key 7). Correct the claim in the report. No code
change is needed for this item on its own.

## M4: the authored bank has an answer-shape bias

In 20 of the 21 numeric items the key sits in the only ±1 pair, and in 14 of 21 it is the lower of that pair.
The cause: the bank uses the hop slip almost everywhere, one over-count, and no stopped-short slip.

Fix:
- Swap enough count-up distractors to the over-count slip or the stopped-short slip (each with its honest
  declared tag) that neither "the lower of the ±1 pair" nor "the ±1 pair" picks the key much above chance.
- Report the before and after counts.

## M5: `authored.oa.ts:660` (g1-oa7-01) has an odd-one-out key

"9 = 5 + 4" is the only option whose left side is a single number. Make at least one false option share that
shape, false for a named reason with a declared tag, so shape doesn't give the key away.

## M6: OA.1 compare items never write the equation

g1-oa1-03 (`authored.oa.ts:137-142`) and the compare template (`oa1-compare-difference.ts:140-142`) never write
the ☐ equation. g1-oa1-01 and g1-oa1-02 do. NC.1.OA.1 is solved "using … equations with a symbol for the
unknown". Add a step such as "Write it as 9 + ☐ = 14." to both, and make it true at every seed of the template.

## M7: `authored.oa.ts:60` (g1-oa1-01) packs three clauses into one sentence

"Mia had 12 grapes and ate some, so 5 are left" mixes tenses and holds three clauses of state. Rewrite it as one
short setup plus one question, within `assertGradeOneReadable`.

## M9 (part): the equation solver is duplicated verbatim

The solver appears at `authored.oa.test.ts:19-46` and again at `oa8-missing-part.test.ts:29-42`. Extract it to
one shared Grade 1 test helper and import it in both.

The small `shape`/`byTag`/`gen` helpers repeated across the 8 template tests are NOT required this round.

---

## Parked or ruled. Do not act on these.

- **M3:** the key's value rank in missing-whole and add-within-10 is acceptable. A shape guesser scores 43% and
  34%, and "a sum is bigger than its parts" is the mathematics.
- **M8:** OA.8's box side stays one template. NC.1.OA.8's keyConcept is "unknown in any position", so position
  is part of the one skill.
- **M10:** Grade 1 `counted-the-start-number-as-a-hop` and Grade 2 `counted-on-by-ones-and-stopped-one-short`
  describe the same value. This is ledgered for the final review.
- **22-7 cap:** stays at 10. See the ledger.

---

Covering tests while iterating: `npx vitest run src/curriculum/grade1 src/curriculum/misconceptions.test.ts`.
Before committing, run the full gate once: lint 0, `tsc -b --noEmit` clean, `vitest run` green. Re-capture any
literal pin a fix changes by running the generator. Never hand-write a pin.
