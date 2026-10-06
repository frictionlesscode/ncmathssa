# Task 22 Report: Grade 1 Operations & Algebraic Thinking

Branch `feat/multi-grade-adaptive`. Two commits on top of `80e94ac`:

- `f93ce23` test: add the shared Grade 1 readability guard to the testkit
- `ba3d99c` feat: add grade 1 operations and algebraic thinking content

Every standard was written from `src/curriculum/grade1/standards.ts`
(`description` + `keyConcepts`), not from the brief's prose.

## What I implemented

### The shared guard (rulings 22-7 and E.3)

`assertGradeOneReadable(items: { id: string; prompt: string }[])` is in
`src/curriculum/authoredBank.testkit.ts`. Its limits:

- `prompt.length < 90`;
- at most 2 sentences, splitting on `[.?!]` and ignoring empty pieces;
- no word longer than 10 letters, where a word matches `/[A-Za-z]+/`.

It does not check that a prompt is non-empty, because `assertAuthoredBankSound` and `assertTemplateSound` already do. Its docstring explains three things:

- why the guard exists: a child who cannot read the question gets misreported as having a mathematical misconception;
- why it is shared rather than copied: this is ruling E.3, following the existing `numericValue` docstring;
- how a template test should call it.

Where it is used:

- `authored.oa.test.ts` uses it in place of the brief's inline 120-character block.
- Every template's own test applies it to seeds 0 to 299.
- `templates/index.test.ts` also applies it to every registered template, as a safety net for the templates Tasks 23 and 24 will append.

I also added negative controls to `authoredBank.testkit.test.ts`, following that file's stated purpose of "checking the checker". They cover:

- an accepted word problem;
- an accepted 89-character prompt containing a 10-letter word;
- a rejected 90-character prompt;
- a rejected third sentence;
- a rejected 11-letter word ("associative").

Grade 2 is not retrofitted.

### Authored items: 26, in `src/curriculum/grade1/authored.oa.ts`

| Standard | Items | Difficulty | What they cover |
|---|---|---|---|
| NC.1.OA.1 | 3 | m, m, a | One item per named type (22-2): Take from/Change Unknown (`-01`), Take Apart/Addend Unknown (`-02`), Compare/Difference Unknown (`-03`) |
| NC.1.OA.2 | 3 | m, m, a | Three addends, sum 13 / 17 / 19 (at most 20, per 22-3). In `-03` the pair that makes 10 is not adjacent. |
| NC.1.OA.3 | 3 | m, m, a | Turn-around of a known fact; `2 + 9 = 9 + ☐`; three-addend regrouping "Which is the same as 7 + 6 + 3?" (22-5). No property is named anywhere. |
| NC.1.OA.4 | 3 | m, m, a | `13 − 8` via `8 + ☐ = 13`; "how many more to have 16"; make-ten jumps for `7 + ☐ = 16`. Every unknown is 20 or less (22-8). |
| NC.1.OA.9 | 3 | m, m, a | Pairs that make 10; a fact family; `7 − 7` (0 as the answer) |
| NC.1.OA.6 | 4 | m, a, m, a | Counting on; making ten (asked about the strategy itself); a doubles fact; counting on to subtract. Each worked solution names its strategy (22-4). |
| NC.1.OA.7 | 4 | m, m, a, a | Three "Which equation is true?" items, each with four equations and three false for a named reason (22-6), plus `6 + 5 = ☐ + 3` (the brief's `4 + 3 = ☐ + 2` trap with the numbers changed) |
| NC.1.OA.8 | 3 | m, m, a | `☐ = 9 − 3` and `☐ = 7 + 6` (result unknown, box on the left), and `9 = 9 + ☐` (0 as the unknown) |

- Correct answers sit at A 7, B 6, C 6 and D 7 times.
- Every standard has at least one mastery item and at least one advanced item, which is now tested per standard.

### Templates: 8, in `src/curriculum/grade1/templates/`

All eight are filed per ruling 22-1.

| Template id | Standard | Skill |
|---|---|---|
| `g1.oa1.compare-difference` | NC.1.OA.1 | Compare/Difference Unknown within 20. Draws "more" or "fewer" and which child is named first. |
| `g1.oa2.three-addends` | NC.1.OA.2 | Three addends from 2 to 9, sum at most 20. The worked solution groups a pair that makes 10 only when one exists. |
| `g1.oa6.make-ten-add` | NC.1.OA.6 | One-digit + one-digit crossing 10. Step 1 is "Use making ten." |
| `g1.oa6.get-to-ten-subtract` | NC.1.OA.6 | Teen number minus a one-digit number, crossing 10. Step 1 is "Get to 10 first." |
| `g1.oa8.missing-part` | NC.1.OA.8 | The missing part in six positions, with the equal sign on either side (`K + ☐ = W` … `K = W − ☐`) |
| `g1.oa8.missing-whole` | NC.1.OA.8 | The missing start: `☐ − b = c` or `c = ☐ − b` |
| `g1.oa9.add-within-10` | NC.1.OA.9 | Addition facts with sum at most 10 |
| `g1.oa9.subtract-within-10` | NC.1.OA.9 | Subtraction facts from 10 or less |

Each template uses exactly one counting-slip tag, chosen by coin flip, and never offers both ±1 slips in one question. *(Corrected in fix round 1, M2: this line first claimed "so the answer is never the middle of three consecutive numbers". That is false. Another distractor can land on the far side of the key. The get-to-ten pin at seed 7 offers 6, 7 and 8 with 7 keyed: 10 − b = 6 sits below the key and the hop 8 above it.)*

NC.1.OA.3, NC.1.OA.4 and NC.1.OA.7 have no template (22-1). `templates/index.ts` explains:

- the OA.6 / OA.9 swap;
- every split;
- why OA.3, OA.4 and OA.7 have no template;
- how authored items and generators divide the work.

### New misconception tags (9) and families (2)

New families:

- `'equal-sign'`, for OA.7 and OA.8 errors of reading `=` as "the answer goes next";
- `'addition-and-subtraction-strategies'`, for OA.6 errors inside a strategy.

Each family has a docstring that explains why no existing family fits.

| Tag | Family | Used by |
|---|---|---|
| `counted-the-start-number-as-a-hop` | incomplete-procedure | the brief's named error ("8, 9, 10" for 8 + 3); all templates and most authored items |
| `gave-an-amount-instead-of-the-difference` | incomplete-procedure | Compare items: answering how many Ana has instead of how many more |
| `added-one-number-twice` | multi-step-problems | OA.2 template, g1-oa2-01/02/03, g1-oa3-03 |
| `added-every-number-in-the-equation` | equal-sign | the brief's `8 = 3 + ☐ → 11`; OA.8 part template, OA.3/4/7/8 items |
| `read-the-equal-sign-as-the-answer-comes-next` | equal-sign | the brief's `4 + 3 = ☐ + 2 → 7`; OA.3-02, OA.7 |
| `used-the-whole-number-after-breaking-it-apart` | addition-and-subtraction-strategies | both OA.6 templates, g1-oa6-02, g1-oa6-03 |
| `used-the-wrong-part-after-making-ten` | addition-and-subtraction-strategies | make-ten template, g1-oa6-02 |
| `used-the-wrong-partner-to-make-ten` | addition-and-subtraction-strategies | g1-oa6-02 (`10 + 4` for 8 + 5) |
| `left-the-ten-out-of-a-teen-number` | place-value-and-decimals | g1-oa6-01 (`15 + 3 → 8`) |

Reused tags each name exactly the same error:

- `added-instead-of-subtracted`
- `subtracted-instead-of-added`
- `counted-on-by-ones-and-stopped-one-short`
- `counted-on-by-ones-one-too-many`
- `restated-a-known-number-instead-of-solving`
- `left-one-of-the-addends-out`
- `forgot-the-final-step`
- `subtracted-without-regrouping`

## Tests and results, with TDD evidence

### RED 1: the guard

The negative controls were written before the guard existed.

```
$ npx vitest run src/curriculum/authoredBank.testkit.test.ts
   × assertGradeOneReadable > accepts a short setup-and-question word problem
   × assertGradeOneReadable > accepts a prompt of exactly 89 characters, and a 10-letter word
   × assertGradeOneReadable > rejects a prompt of 90 characters
   × assertGradeOneReadable > rejects a third sentence
   × assertGradeOneReadable > rejects a word longer than 10 letters
+ (0 , __vite_ssr_import_1__.assertGradeOneReadable) is not a function
```

This was expected, because the function did not exist yet. The baseline full run at the same moment was 1271 passed; the only failures were these five.

### RED 2: all Grade 1 content

All tests were written before any content.

```
$ npx vitest run src/curriculum/grade1
 Test Files  10 failed (10)
Error: Failed to resolve import "./authored.oa" from "src/curriculum/grade1/authored.oa.test.ts". Does the file exist?
Error: Failed to resolve import "./index" from "src/curriculum/grade1/templates/index.test.ts". Does the file exist?
Error: Failed to resolve import "./oa1-compare-difference" ...   (and the same for all 8 templates)
```

This was expected, because none of the modules existed.

### GREEN

```
$ npx vitest run src/curriculum/authoredBank.testkit.test.ts
 ✓ src/curriculum/authoredBank.testkit.test.ts (19 tests)

$ npx vitest run src/curriculum/grade1/templates           # before pins
 Test Files  9 passed (9)      Tests  101 passed (101)
$ npx vitest run src/curriculum/grade1/templates           # after literal pins
 Test Files  9 passed (9)      Tests  117 passed (117)

$ npx vitest run src/curriculum/grade1 src/curriculum/misconceptions.test.ts src/curriculum/authoredBank.testkit
 Test Files  12 passed (12)    Tests  152 passed (152)

$ npm run lint            -> exit 0 (7 pre-existing warnings, none in files I touched)
$ npx tsc -b --noEmit     -> exit 0
$ npx vitest run
 Test Files  131 passed (131)  Tests  1406 passed (1406)
```

### Mutation check

This confirms the new authored checks can fail. I changed g1-oa7-02's keyed option to `6 + 2 = 5 + 4` and reran:

```
× holds every authored-bank invariant      (final step never states the answer)
× keys the one option that actually solves each computable item
  AssertionError: g1-oa7-02: expected [] to deeply equal [ '6 + 2 = 5 + 4' ]
```

Then I restored the file (13/13 pass).

### What the tests assert beyond the kit

`authored.oa.test.ts`:

- The bank is sound, and passes `assertGradeOneReadable`.
- Each standard has at least one mastery item and at least one advanced item.
- Every number in every prompt is 20 or less; NC.1.OA.9 prompts stay within 10.
- `assertNoGeneratorDuplicatesAuthored` over the OA templates, at 2000 seeds.
- **A cold solver.** It evaluates `+`/`−` expressions and solves any `☐` equation over 0 to 40. It rechecks the key of 17 of the 26 items: the unique solution, a unique equal expression, or a unique true equation. The count of 17 is pinned literally, so a prompt reworded out of the solver's reach shows up.
- Ruling checks:
  - 22-2: all three OA.1 types are present.
  - 22-3: OA.2 has 3 addends summing to 20 or less, and the key equals the sum.
  - 22-5: a three-addend OA.3 item exists, and nothing matches `/commutative|associative|property/`.
  - 22-8: OA.4 unknowns are 20 or less.
  - 22-4: every OA.6 `stepByStep` names a strategy, and both "making ten" and "counting on" appear.
  - 22-6: at least 3 "Which equation is true?" items, whose options are all equations.

Each template test:

- `assertTemplateSound`, determinism, and the readability guard over 300 seeds;
- two LITERAL seed pins (prompt, answer, and every `[label, text, isCorrect, tag]`);
- a range check: sum ≤ 20 over 300 runs for OA.2, and within 10 for OA.9;
- a per-tag value recomputation over 600 seeds;
- every worked-solution sentence rebuilt from the parsed numbers, checked against extra invariants such as `need + rest = small` and "the ☐ is bigger than both";
- that every coin-flipped mode is actually drawn;
- a pinned set of answer ranks, so no size tell;
- a full draw-space collision sweep with literal counts;
- a proof that each excluded draw really collides.

Pins were produced by running each generator (in a scratch test, since deleted), then checked by hand:

| Template | Seeds | Pinned questions |
|---|---|---|
| OA.1 | 7, 2024 | "Max has 20 beads and Kim has 16…" → 4; "…How many fewer beads does Mia have than Max?" → 6 |
| OA.2 | 7, 2024 | 2 + 2 + 7 = 11 (added in order); 7 + 9 + 3 = 19 (7 + 3 grouped first) |
| OA.6 add | 7, 123 | 4 + 7 = 11; 5 + 8 = 13 |
| OA.6 subtract | 7, 123 | 11 − 4 = 7; 12 − 7 = 5 |
| OA.8 part | 7, 123 | `5 = 8 − ☐` → 3; `11 = 6 + ☐` → 5, the brief's W = K + ☐ trap |
| OA.8 whole | 7, 123 | `☐ − 2 = 3` → 5; `9 = ☐ − 11` → 20 |
| OA.9 add | 7, 123 | 2 + 3; 1 + 9 |
| OA.9 subtract | 7, 123 | 4 − 3; 6 − 1 |

## Every collision exclusion, with its algebra

All exclusions are made when the draw lists are built. Nothing is resampled. Each file's docstring carries the full pairwise table, and each sibling test proves every excluded draw collides.

**`g1.oa1.compare-difference`**

Options: d = big − small; small + big; the asked child's amount (big for "more", small for "fewer"); and d + 1 (hop) or d − 1 (short). Draws have small ≥ 2 and d ≥ 2, giving 153 pairs.

- "More" mode never collides: big = d means small = 0, and big = d ± 1 means small = ∓1.
- "Fewer" mode:

| Collision | Condition | Excluded from | Pairs |
|---|---|---|---|
| small = d | big = 2·small | both "fewer" lists | 9 |
| small = d + 1 | big = 2·small − 1 | fewer-hop | 8 |
| small = d − 1 | big = 2·small + 1 | fewer-short | 8 |

- Pinned counts: 153 / 153 / 136 / 136.

**`g1.oa2.three-addends`**

Options: s; a + b; s + a; s ∓ 1.

- a + b = s − 1 needs c = 1, and s + a = s + 1 needs a = 1. Both are impossible because every addend is at least 2.
- Nothing is excluded. There are 428 triples: 512 minus the 84 with sum ≥ 21.

**`g1.oa6.make-ten-add`**

Terms: need = 10 − big and rest = small − need. Options: 10 + rest; 10 + need; 10 + small; and a + b ∓ 1.

| Collision | Condition | Excluded from | Facts |
|---|---|---|---|
| 10 + need = 10 + rest | small = 2·need: 9+2, 8+4, 7+6, both orders | always | 6 |
| 10 + need = a + b − 1 | small = 2·need + 1: 9+3 and 8+5 both orders, 7+7 | hop | 5 |
| 10 + need = a + b + 1 | small = 2·need − 1: 8+3 and 7+5, both orders | over-count | 4 |
| 10 + small = a + b + 1 | need = 1, so big = 9 | over-count | 15 facts, 2 already excluded |

- Pinned counts: 36 all / 25 hop / 13 over-count.

**`g1.oa6.get-to-ten-subtract`**

Terms: a = 10 + ones and rest = b − ones. Options: 10 − rest; 10 + rest; 10 − b; and a − b ± 1.

- 10 − b = a − b − 1 when a = 11, so 11 − 2 through 11 − 9 are excluded from the over-count (8 facts).
- Every other pair would need rest = 0, ones = 0, b < rest, or a half.
- Pinned counts: 36 / 36 / 28.

**`g1.oa8.missing-part`**

Options: x = W − K; W + K; K; x ± 1. Draws have K ≥ 2, x ≥ 2 and W ≤ 20, giving 153 pairs.

| Collision | Condition | Excluded from | Pairs |
|---|---|---|---|
| K = x | W = 2K | always | 9 |
| K = x + 1 | W = 2K − 1 | hop | 8 |
| K = x − 1 | W = 2K + 1 | short count | 8 |

- Pinned counts: 153 / 136 / 136.

**`g1.oa8.missing-whole`**

Options: x = b + c; |c − b|; c; x ∓ 1.

- b − c = c when b = 2c, so b = 2, 4, …, 12 are excluded (6 pairs).
- The other pairs would need b = 0 or 1, c = 0, or a half.
- b = c is kept, so |c − b| = 0, a real value.
- Pinned counts: 171 / 165.

**`g1.oa9.add-within-10`**

Options: a + b; |a − b|; max; a + b ∓ 1.

- max = a + b − 1 when min = 1, so every fact containing a 1 is excluded from the hop (17 facts).
- The other pairs would need min = 0, a negative, or a half.
- Pinned counts: 45 / 28 / 45.

**`g1.oa9.subtract-within-10`**

Options: d = a − b; a + b; b; d ± 1.

| Collision | Condition | Excluded from | Facts |
|---|---|---|---|
| b = d | a = 2b | always | 5 |
| b = d + 1 | a = 2b − 1: 3−2, 5−3, 7−4, 9−5 | hop | 4 |
| b = d − 1 | a = 2b + 1: 3−1, 5−2, 7−3, 9−4 | over-count | 4 |

- a + b never collides: it would need 2b = 0 or ±1, or a = 0.
- Pinned counts: 45 / 36 / 36.

## Files changed

Modified:

- `src/curriculum/authoredBank.testkit.ts`: adds `assertGradeOneReadable`.
- `src/curriculum/authoredBank.testkit.test.ts`: 5 negative/positive controls.
- `src/curriculum/misconceptions.ts`: 2 families and 9 tags, additions only.

Created:

- `src/curriculum/grade1/authored.oa.ts` and `authored.oa.test.ts`.
- `src/curriculum/grade1/templates/index.ts` and `index.test.ts`.
- `src/curriculum/grade1/templates/`, each with a sibling `.test.ts`:
  - `oa1-compare-difference.ts`
  - `oa2-three-addends.ts`
  - `oa6-make-ten-add.ts`
  - `oa6-get-to-ten-subtract.ts`
  - `oa8-missing-part.ts`
  - `oa8-missing-whole.ts`
  - `oa9-add-within-10.ts`
  - `oa9-subtract-within-10.ts`

`graphify-out/` was not staged, and all paths were staged explicitly.

## Deviations from the brief, and the rulings behind them

| Deviation | Ruling or lesson |
|---|---|
| Fluency within 10 is templated as OA.9. OA.6 is templated as strategies within 20. Authored-only standards are OA.3, OA.4 and OA.7. | 22-1 |
| Readability limits are 90 characters, 2 sentences and 10 letters, in one shared guard. The brief's inline 120-character block is not used. | 22-7, E.3 |
| One OA.1 item per problem type | 22-2 |
| OA.2 sum ≤ 20, asserted across 300 runs | 22-3 |
| OA.6 strategies are named in `stepByStep` | 22-4 |
| A three-addend OA.3 item; no property names | 22-5 |
| OA.7 as "Which equation is true?" | 22-6 |
| OA.4 unknowns within 20 | 22-8 |
| **8 templates, not 5.** OA.6, OA.8 and OA.9 each split into two ids. | The controller's "one template id tests one skill" lesson. Each pair's modes have different wrong operations. |
| Fixed-seed pins are literal. | Standing ruling |
| `commit`: explicit paths, not `git add -A` | The dispatch |

**One addition:** g1-oa7-04 (`6 + 5 = ☐ + 3`) is a fill-in-the-box OA.7 item, not a "Which equation is true?" item. Ruling 22-6 is about the true/false shape, which it prescribes for the three floor items. This fourth item is the brief's own named equal-sign misconception. It fits four options naturally, so I kept it as an extra item rather than force it into a different standard.

## Self-review findings, all fixed before committing

1. The first description of `used-the-whole-number-after-breaking-it-apart` said "to make or get to a ten". g1-oa6-03 uses the tag for a *doubles* fact (6 + 7 → 12 + 7 = 19). I reworded it to cover making a ten, getting to 10, or a doubles fact.
2. The OA.2 template's `conceptSummary` said "Finding two that make 10 first makes the last step easy" at every seed, including draws with no such pair. It now reads "When two of them make 10, adding those first…".
3. The `templates/index.ts` docstring claimed the authored bank covers "strategies other than making ten". g1-oa6-02 *is* a making-ten item, so I reworded the claim accurately.
4. Some collision tables in docstrings skipped a pair; examples are `|a − b|` vs `a + b` and `small + big` vs the amount. I completed them so every pair of options is accounted for.

## Concerns for the controller

1. **Ruling 22-7's stated rationale is off by one letter.** It says a 10-letter cap "is what actually catches 'determine', 'associative', 'represent'". "determine" and "represent" are 9 letters and pass. Only "associative" (11) is caught. I implemented the ruled limit of 10. The guard's docstring cites "associative" and "subtraction", which are both 11 letters. If the intent was to catch "determine", the cap would have to be 8.
2. **Answer-rank tells are reduced, not eliminated.** `g1.oa8.missing-whole` and `g1.oa9.add-within-10` put the key at rank 2 or 3 out of 0 to 3, never in the bottom half. The reason is mathematical: a sum or a start is bigger than its parts. The over-count distractor keeps "pick the biggest" right only half the time. The other six templates key across ranks {0, 1, 2} or {1, 2}. All eight rank sets are pinned in tests.
3. **`restated-a-known-number-instead-of-solving` on a bare fact.** `g1.oa9.add-within-10` uses it for answering 3 to "What is 2 + 3?" (starting at the bigger number and never counting on). The tag's description says "missing-number equation". A result-unknown fact qualifies, and Grade 2 already uses the tag this broadly, but it is the least diagnostic distractor in the set.
4. **OA.1 "represent … with equations".** None of the three OA.1 items asks the child to choose the representing equation. g1-oa1-01 and g1-oa1-02 model it in their worked solutions ("Write it as 12 − ☐ = 5"). I did not add a choose-the-equation item, because every clean fourth distractor I could build was either a true related equation (so the item became ambiguous) or needed a speculative tag.
5. **Out of scope, noticed in passing: Grade 2 authored/generator duplicates.**
   - g2-oa2-01 (`What is 8 + 5?`) and g2-oa2-02 (`What is 14 − 6?`) appear to be exact prompts that `g2.oa2.fluency-fact` can emit. Its draws are a, b in 2..9 for sums, and a in 11..19 with b in 2..9 for differences.
   - `grade2/authored.oa.test.ts` does not call `assertNoGeneratorDuplicatesAuthored`, so nothing catches this.
   - Not touched, because Grade 2 is not in this task.
6. The Task 26 generator floor (ruling 26-4) counts on Grade 1 generators. OA now contributes 8 template ids across 5 standards. If Task 26 names expected *standards*, OA's are NC.1.OA.1, .2, .6, .8 and .9.

---

## Fix round 1

Commit `2e147ac` fix: close task 22 review findings I1, I2, M1, M4-M7 and M9, on top of `ba3d99c`. It makes every change the findings file marked required. It does not touch the parked items M3, M8, M10 or the 22-7 cap.

### I1: g1-oa4-01 is now NC.1.OA.4, not CCSS 1.OA.4

`src/curriculum/grade1/authored.oa.ts:353` (g1-oa4-01).

- **Prompt.** It changed from "What is 13 − 8? Think: 8 + ☐ = 13." to "What number makes 8 + ☐ = 13 true? Think: 13 − 8." The item now starts as an unknown addend and is solved by changing it to a take-away. That is NC.1.OA.4's keyConcept 2, "Rewriting an unknown-addend problem as a subtraction problem". The "Think:" sentence keeps it off the missing-part generator's prompt shape, and `assertNoGeneratorDuplicatesAuthored` still passes.
- **Steps.** 8 + ☐ = 13 asks what goes with 8 to make 13. Then: change it to a take-away, the ☐ is 13 − 8. Then 13 − 3 = 10 and 10 − 5 = 5. Then: the ☐ is 5.
- **Distractors, each reachable on that route:**
  - 21: `added-instead-of-subtracted` (13 + 8, the take-away added instead).
  - 8: `restated-a-known-number-instead-of-solving`.
  - 4: `counted-on-by-ones-one-too-many` (counting back 8 from 13 one count too far: 12, 11, 10, 9, 8, 7, 6, 5, 4).
- **Docstrings** now say what OA.4 actually covers:
  - `authored.oa.ts:27-30`: g1-oa4-01 changes the unknown addend to a take-away; g1-oa4-02 and -03 add on by making a ten.
  - `templates/index.ts:59-61`: OA.4 is solving an unknown addend by the method the standard names, adding on or changing it to a take-away.
- **New test.** `authored.oa.test.ts:138` "rewrites an NC.1.OA.4 unknown addend as a take-away". It requires a `K + ☐ = W` prompt whose worked solution says "take-away" and contains `W − K`. It asserts the matching items are exactly `['g1-oa4-01']`.

### I2: no false "bigger" in a double, and the same class checked everywhere

- `templates/oa9-add-within-10.ts:100`: Step 1 branches on `a === b`. A double now says "Both numbers are 2. Start at 2." instead of "Start at the bigger number, 2."
- `oa9-add-within-10.ts:105`: the concept summary branches too, so a double's explanation never contains "bigger".
- `oa9-add-within-10.ts:110`: the common misconception now reads "…lands on 3, one short. The first number to say is 3." Without "one short", a double read confusingly with both numbers equal.

New tests:

- `oa9-add-within-10.test.ts:136` "never calls a number 'bigger' in a double, and names the real bigger one otherwise". It sweeps seeds 0–4999 and asserts both draw lists are covered in full: hop 28 facts, over-count 45. For every double, no explanation sentence matches `/bigger/i`, and Step 1 is the literal double form. For every other fact, the number called bigger is `max(a, b)`, checked against the parsed numbers rather than a copy of the template string.
- `oa9-add-within-10.test.ts:54`: a new LITERAL pin at seed 0, the reviewer's case, re-captured from a real run: `What is 2 + 2?` → `4`; options `0 / 2 / 3 / 4`; steps `Step 1: Both numbers are 2. Start at 2.`, `Step 2: Count on 2 more: 3, 4.`, `Step 3: 2 + 2 = 4.`

I read every generated sentence in all 8 templates against its full draw space for the same class of error. Two more were fixed:

- `templates/oa6-make-ten-add.ts:129`. The fixed concept summary said "fill the bigger number up to 10", but 6+6, 7+7, 8+8 and 9+9 are drawable. It now reads "fill one number up to 10 with part of the other". New test `oa6-make-ten-add.test.ts:115` asserts no "bigger" anywhere in a double's explanation.
- `templates/oa8-missing-whole.ts:108`. For b = c it said "bigger than both 5 and 5". That was true but garbled; it now says "bigger than 5".

The other templates are clean:

- The compare template's two amounts always differ by at least 2.
- The three-addends make-ten branch is computed from the numbers drawn.
- Missing-part, the subtraction facts and get-to-ten have no size wording that depends on the draw.

### M1: a Grade 1 tag for the error inside get-to-ten

New tag `added-the-rest-after-getting-to-ten` (`misconceptions.ts:1945`, family `addition-and-subtraction-strategies`): "Took part of a number away to get down to 10, then ADDED the rest instead of taking it away too — so 14 − 6 became 14 − 4 = 10, then 10 + 2 = 12." A comment above it says why the value's other cause, `subtracted-without-regrouping`, is the wrong tag at Grade 1.

It is used in both places:

- **The template.** `templates/oa6-get-to-ten-subtract.ts:80` gives the 10 + rest option the new tag. The misconception sentence (`:100`) now describes that error: "Getting to 10 and then adding the 3 gives 13. The 3 is part of the 4 being taken away, so it comes off too: 10 − 3 = 7." The docstring table (`:21`) matches.
- **g1-oa6-04** (`authored.oa.ts:632`). Its prompt described counting on, which cannot produce 15. It is now "Max gets to 10 first to find 14 − 9. Which is the same as 14 − 9?" Every wrong option is a slip made inside the strategy the prompt names:
  - `10 + 5`: `added-the-rest-after-getting-to-ten` (value 15).
  - `10 − 9`: `used-the-whole-number-after-breaking-it-apart` (value 1).
  - `10 − 4`: `used-the-wrong-part-after-making-ten` (value 6). That tag's description (`misconceptions.ts:1932`) was broadened to "make or get to a ten … or 14 − 9 became 10 − 4".
  - Key: `10 − 5` (value 5). The cold solver confirms it is the only option equal to 5.

`subtracted-without-regrouping` is no longer used anywhere in Grade 1. Grade 2 still uses it, so it is not orphaned.

### M2: the false claim in this report

Line 75 said the answer is "never the middle of three consecutive numbers". It is corrected in place, with a note on what was wrong. Your pin at `oa6-get-to-ten-subtract.test.ts:44-49` (options 6, 7, 8, key 7) disproves it. No code change was needed.

### M4: the authored answer-shape bias

Counting slips now use all three honest tags, chosen per item: `counted-the-start-number-as-a-hop`, `counted-on-by-ones-and-stopped-one-short` and `counted-on-by-ones-one-too-many`. In some items the story's numbers put a second honest error beside the slip, forming a run of three with the key at an end, never in the middle. In others no slip is offered and another honest error takes its place. Items changed:

| Item | Line | Before | After |
|---|---|---|---|
| g1-oa1-01 | 67 | hop 8 (7, 8) | stopped-short 6; run 5, 6, 7 |
| g1-oa1-02 | 99 | 15 fish / 9 red, hop 7 | 14 / 8, hop 7, restated 8; run 6, 7, 8 |
| g1-oa1-03 | 130 | hop 6 | no slip; both amounts (14, 9) as `gave-an-amount-instead-of-the-difference` |
| g1-oa2-01 | 165 | hop 12 | one-too-many 14 |
| g1-oa2-02 | 194 | 2 cats, 7 dogs, 8 birds | 6, 8, 2; run 14, 15, 16 |
| g1-oa2-03 | 223 | hop 18 | one-too-many 20 |
| g1-oa3-01 | 257 | hop 12 and over 14 (key in the middle of 12, 13, 14) | hop 12, and restated 9 in place of 14 |
| g1-oa3-02 | 287 | hop 3 | stopped-short 1 |
| g1-oa4-01 | 353 | (I1 rewrite) | one-too-many 4 |
| g1-oa4-02 | 387 | restated 16 | restated 9; run 7, 8, 9 |
| g1-oa4-03 | 416 | hop 10 | new tag `left-out-the-jump-to-ten` (6, only the jump past 10; `misconceptions.ts:1950`) |
| g1-oa9-01 | 450 | restated 10 | restated 6; run 4, 5, 6 |
| g1-oa9-02 | 479 | hop 6 | one-too-many 4; run 3, 4, 5 |
| g1-oa6-01 | 542 | hop 17 | one-too-many 19 |
| g1-oa6-04 | 632 | numeric | expression item (M1) |
| g1-oa7-04 | 760 | hop 9 | one-too-many 7 |

Counts are over the numeric items: every option is a whole number. A "lone pair" means the options contain exactly one pair of values 1 apart. Chance on a 4-option item is 25%.

| | Before (`ba3d99c`) | After (`2e147ac`) |
|---|---|---|
| Numeric items | 21 | 20 |
| Key in the lone ±1 pair | **20** | **12** |
| … key is the lower of that pair | **14** | **6** |
| … key is the upper of that pair | 6 | 6 |
| Two or more pairs (run of three) | 1 (key in the middle) | 6 (key at the top in 3, the bottom in 3, never the middle) |
| No ±1 pair at all | 0 | 2 |
| "Pick the lower of the lone pair, else guess" scores | **67.9%** | **40.0%** |
| "Pick either of the lone pair, else guess" scores | **48.8%** | **40.0%** |
| "Pick the upper of the lone pair, else guess" scores | 29.8% | 40.0% |

Correct-answer labels are still A7 / B6 / C6 / D7.

New test `authored.oa.test.ts:195` "does not key the numeric items by answer shape" holds two conditions:

- lower and upper are within 1 of each other;
- the key sits in a lone ±1 pair in at most 3 of every 5 numeric items.

**What remains, and why.** The 40% is the floor that honest counting-slip distractors set. A slip lands next to the key by definition, so any item offering one puts the key in a ±1 pair, and a pair-picker scores 50% on that item. Pushing lower would mean removing the commonest Grade 1 error from most items, or padding with ill-fitting tags, which the global constraints forbid. The shape-dependent part of the tell is gone: lower and upper are now even.

### M5: g1-oa7-01's odd-one-out key

`authored.oa.ts:676`: the false option "5 + 4 = 10" is now "10 = 5 + 4". It is the same error (`counted-on-by-ones-one-too-many`) and has the key's answer-first shape, so "9 = 5 + 4" and "10 = 5 + 4" differ only in the number. Step 2 (`:688`) is reworded to match.

New test `authored.oa.test.ts:179` "never keys the only equation of its shape". A shape is the count of numbers on each side of the `=`. Every "Which equation is true?" item must have a false option shaped like its key.

### M6: the OA.1 compare items write the equation

- `authored.oa.ts:150` (g1-oa1-03): "Step 2: Write it as 9 + ☐ = 14. The ☐ is how many more Ana read."
- `templates/oa1-compare-difference.ts:144`: "Step 2: Write it as `${small} + ☐ = ${big}`." It is true at every seed, for "more" and "fewer" alike. The worked solution is now 5 steps, and the last still states the answer.

Tests:

- `oa1-compare-difference.test.ts:158` asserts the step at 600 seeds, and that `small + answer = big`.
- New test `authored.oa.test.ts:96` "writes a ☐ equation in every NC.1.OA.1 worked solution, solved by the key". Each OA.1 item must contain a "Write it as …☐…" step whose equation's only solution, found by the shared solver, is the key. It covers 12 − ☐ = 5, 8 + ☐ = 14 and 9 + ☐ = 14.
- The compare template's two pins now pin all 5 steps, re-captured from a real run:
  - seed 7: `Step 2: Write it as 16 + ☐ = 20.`
  - seed 2024: `Step 2: Write it as 9 + ☐ = 15.`

### M7: g1-oa1-01 is one setup and one question

`authored.oa.ts:67`: "Mia had 12 grapes and now has 5. How many did she eat?"

- The setup is before-and-now. The eating, the unknown, lives in the question.
- It is 55 characters and passes `assertGradeOneReadable`.
- The problem type is still Take from, Change Unknown. The type check at `authored.oa.test.ts:88` now matches `had N … and now has N. How many did … eat?`.

### M9: one shared equation solver

- New file `src/curriculum/grade1/equations.testkit.ts` exports `evaluate`, `holds` and `solutions`. It is strict, throws on anything unrecognised, and has a docstring explaining why it is shared.
- `authored.oa.test.ts:10` and `templates/oa8-missing-part.test.ts:6` import it.
- Both local copies are deleted.
- The file sits outside the `allContent.ts` globs (`authored*.ts`, `templates/*.ts`), so it is never mistaken for content.

The `shape` / `byTag` / `gen` helpers were left alone, as instructed.

### Pins

Every pin was re-captured from a scratch run of the generators at seeds 0, 7, 123 and 2024. The scratch test was deleted afterwards.

- **Changed:** the compare template (both pins, now 5 steps) and the new add-within-10 seed-0 pin.
- **Tag changed, values and positions unchanged:** get-to-ten seed 7 (`B 13 added-the-rest-after-getting-to-ten`) and seed 123 (`D 15 …`). Both match the real run exactly.
- **Unchanged:** every other pin, confirmed by the run.
- **The solver's literal count** of items it can read rose from 17 to 18, because g1-oa6-04 is now a "Which is the same as" item.

### Tests, commands and output

Focused, after the fixes and before re-capturing pins. All three failures were expected: the old step numbering in two pins, and the solver count.

```
$ npx vitest run src/curriculum/grade1 src/curriculum/misconceptions.test.ts
   × keys the one option that actually solves each computable item   (expected 18 to be 17)
   × g1.oa1.compare-difference > emits exactly this question at seed 7 ("more", hop)
   × g1.oa1.compare-difference > emits exactly this question at seed 2024 ("fewer", short count)
      Tests  3 failed | 136 passed (139)
```

After re-capturing:

```
$ npx vitest run src/curriculum/grade1 src/curriculum/misconceptions.test.ts
 Test Files  11 passed (11)
      Tests  140 passed (140)
```

Mutation check: each fix was reverted temporarily, and the new tests catch it.

- Reverted: the doubles branch (I2); the OA.4 take-away step (I1); "10 = 5 + 4" (M5); one stopped-short and one one-too-many slip (M4); the compare equation step (M6).

```
   × g1.oa1.compare-difference > emits exactly this question at seed 7 ("more", hop)
   × g1.oa1.compare-difference > emits exactly this question at seed 2024 ("fewer", short count)
   × g1.oa1.compare-difference > states only true arithmetic in its worked solution, at every seed
   × g1.oa9.add-within-10 > emits exactly this question at seed 0 (a double, hop)
   × g1.oa9.add-within-10 > never calls a number "bigger" in a double, and names the real bigger one otherwise
   × grade 1 OA authored bank > rewrites an NC.1.OA.4 unknown addend as a take-away
   × grade 1 OA authored bank > never keys the only equation of its shape
   × grade 1 OA authored bank > does not key the numeric items by answer shape
      Tests  8 failed | 129 passed (137)
```

After restoring: `Tests 137 passed (137)` for `src/curriculum/grade1`.

Full gate, run once before committing:

```
$ npm run lint            -> exit 0 (the same 7 pre-existing warnings, none in files I touched)
$ npx tsc -b --noEmit     -> exit 0
$ npx vitest run
 Test Files  131 passed (131)
      Tests  1413 passed (1413)
```

### Files changed in this round

Modified:

- `src/curriculum/misconceptions.ts`: 2 new tags; `used-the-wrong-part-after-making-ten` broadened to getting to 10.
- `src/curriculum/grade1/authored.oa.ts`
- `src/curriculum/grade1/authored.oa.test.ts`
- `src/curriculum/grade1/templates/index.ts`: docstring only.
- `src/curriculum/grade1/templates/oa1-compare-difference.ts` and `.test.ts`
- `src/curriculum/grade1/templates/oa6-get-to-ten-subtract.ts` and `.test.ts`
- `src/curriculum/grade1/templates/oa6-make-ten-add.ts` and `.test.ts`
- `src/curriculum/grade1/templates/oa8-missing-part.test.ts`
- `src/curriculum/grade1/templates/oa8-missing-whole.ts` and `.test.ts`
- `src/curriculum/grade1/templates/oa9-add-within-10.ts` and `.test.ts`

Created: `src/curriculum/grade1/equations.testkit.ts`.

`graphify-out/` is still untracked, and all paths were staged explicitly.

### Concerns

1. **M4's residual.** Both picking strategies drop to 40.0%, not 25%. The rest is inherent to offering a counting-slip distractor at all, as explained above. If the controller wants it lower, the only honest route is fewer slip distractors per item. That trades away the commonest Grade 1 error, so I did not take it without a ruling.
2. **Two new tags this round.** `added-the-rest-after-getting-to-ten` is required by M1. `left-out-the-jump-to-ten` came out of M4: g1-oa4-03 needed a non-slip distractor, and none of the existing tags names "answered only the second jump". Both are used, and both carry parent-facing descriptions.
3. **A lost strategy.** g1-oa6-04 no longer demonstrates counting on for a take-away. That was the only OA.6 item on the addition–subtraction link. OA.6 still names counting on (g1-oa6-01), making ten, a doubles fact and getting to 10. The link is still covered in OA.4 (g1-oa4-01) and OA.9 (g1-oa9-02, the fact family).
