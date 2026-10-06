# Task 19 report — Grade 2 Measurement & Data, and the authored aggregate

**Status:** DONE (one concern for the reviewer's judgement, see the end)
**Base:** `3e32f7d` · **Commit:** `06e26d2 feat: add grade 2 measurement and data content and the authored aggregate`
**Result:** 1202/1202 passing (was 1102), `npm run lint` exit 0 (7 pre-existing warnings, none in touched files), `npx tsc -b --noEmit` clean.

## What I implemented

### Routing (ruling 19-1 — the brief's Step 4 is wrong)

Read from `grade2/standards.ts`, not the brief: **MD.6 = number line, MD.7 = time, MD.8 = money.**
Templates: MD.1, MD.2, MD.5, MD.7, MD.8, MD.10. Authored-only: MD.3, MD.4, MD.6.
Item ids use the hyphen form (`g2-md7-03`, ruling 21-2); template ids the dotted form (`g2.md7.<slug>`, ruling 19-7).

### Authored items — 32, in `src/curriculum/grade2/authored.md.ts`

| Standard | Items | Content |
|---|---|---|
| NC.2.MD.1 | 3 (M, A, M) | choosing the tool: hallway in feet (measuring tape), crayon in cm (cm ruler), rug in yards (yardstick) |
| NC.2.MD.2 | 3 (M, A, M) | same rug measured with two children's shoes; 48 in vs 4 ft, and why; predicting the count when cm becomes inches |
| NC.2.MD.3 | 4 (M, M, A, A) | crayon (inches), school bus (feet), classroom (meters), car (yards) |
| NC.2.MD.4 | 3 (M, A, A) | two objects on one inch ruler; one ribbon not starting at 0 (cm); "which sentence is true" with unit and direction |
| NC.2.MD.5 | 3 (M, A, A) | put-together (38 + 45 = ☐); **options are four candidate equations** (ruling 19-5); start-unknown (☐ − 25 = 48) |
| NC.2.MD.6 | 4 (M, M, A, A) | counting on (23 + 14), counting back (52 − 30), choosing a number-line diagram for 45 + 30, a length from 0 on a line marked in 5s |
| NC.2.MD.7 | 4 (M, A, M, A) | 8:15 a.m., 3:45 p.m. (hour hand near the next number), 8:00 p.m., 2:30 p.m. |
| NC.2.MD.8 | 4 (M, A, M, A) | 60¢ − 25¢; $45 + $30 − $18 (two-step); $28 + $45; 1 quarter + 2 dimes, how much more to 60¢ |
| NC.2.MD.10 | 4 (M, M, A, A) | **tally chart → which bar graph** (ruling 19-4, represent); put-together from a picture graph; take-apart (missing bar); compare ("how many fewer") |

Every standard has a mastery item and one above mastery. Correct answers are at A/B/C/D 8 times each.
Every figure (ruler, clock face, number line, graph, tally chart) is text in `promptDetails`; coins are named in words.
Units: MD.1 + MD.3 between them use inches, feet, yards, centimeters and meters (ruling 19-3). MD.3 options are written "About 4 inches" because the shared numeric guard reads "4 inches" and "4 feet" as the same value.

### Templates — 6, each with a sibling test (`src/curriculum/grade2/templates/`)

| Id | Standard | One skill | Distractor tags |
|---|---|---|---|
| `g2.md1.read-a-ruler` | MD.1 | read an object's length on an inch or cm ruler; the object **never starts at 0** | read-the-end-mark-without-starting-at-zero, added-instead-of-subtracted, and counted-the-ruler-marks-not-the-spaces **or** counted-only-the-marks-between-the-ends |
| `g2.md2.two-units` | MD.2 | same object in two units → which count is bigger (the prompt states which unit is shorter) | expected-a-longer-unit-to-give-a-bigger-count, expected-the-count-to-stay-the-same-in-a-new-unit, thought-the-object-changed-length-with-the-unit |
| `g2.md5.shorter-length-unknown` | MD.5 | compare, smaller unknown, within 100, one unit, `☐ + diff = big` printed | added-instead-of-subtracted, restated-a-known-number-instead-of-solving, subtracted-without-regrouping |
| `g2.md7.clock-to-five-minutes` | MD.7 | analog clock at :35–:55, a.m./p.m. from the part of the day | read-the-minute-hand-as-the-number-it-points-to, swapped-the-hour-and-minute-hands, read-the-next-hour-from-the-hour-hand |
| `g2.md8.count-coins` | MD.8 | value of a coin collection, 1–99¢, ¢ only | counted-the-coins-not-their-value, mixed-up-the-values-of-a-nickel-and-a-dime, kept-counting-by-the-last-coins-value |
| `g2.md10.bar-graph-how-many-more` | MD.10 | "how many more" from a 4-bar graph, scale of one, 0–15 | added-instead-of-subtracted, forgot-the-final-step, used-the-wrong-given-quantity |

All six are appended to `GRADE_2_TEMPLATES`. The `index.ts` docstring records the MD routing and the generator/authored split per standard.

**Applying the Task 18 lessons:**
- *One template id, one skill.* MD.5 draws one problem type; MD.10 one (compare); MD.8 coins only (whole dollars are authored). MD.1 is the one template with a coin flip, discussed under Concerns.
- *No shape tell.* All options in a template share one form: the same unit, the same a.m./p.m., the same ¢. I also checked **numeric rank**, since "always the smallest option" answers a template without any maths. Every generator's sibling test asserts that the key's rank varies across seeds. MD.1 needed the undercount flip for this, because every other ruler error overshoots.
- *Stated derivations produce their values.* Every distractor comment and every explanation string was checked against the formula. Each test's "gives each distractor the value its tag names" block recomputes the values from the printed figure at 600 seeds.

### Aggregate

`src/curriculum/grade2/authored.ts` joins `OA, NBT, MD, G` in that order, with the same doc comment as Grade 3's aggregator. It holds 88 items.

### New misconception tags (27) and one new family

Family **`money`**, with a doc comment following the precedent of families added for whole standards. The alternatives would mis-file: "Geometry And Measurement" or "Place Value And Decimals" as the headline for a nickel/dime mix-up.

- MD.1: read-the-end-mark-without-starting-at-zero, counted-the-ruler-marks-not-the-spaces, counted-only-the-marks-between-the-ends, chose-a-tool-too-short-for-the-job, chose-a-tool-that-measures-something-else, chose-a-tool-marked-in-the-wrong-unit, measured-with-a-non-standard-unit
- MD.2: expected-a-longer-unit-to-give-a-bigger-count, expected-the-count-to-stay-the-same-in-a-new-unit, thought-the-object-changed-length-with-the-unit
- MD.3: estimated-ten-times-too-small, measured-length-with-a-unit-of-time
- MD.4/5: reversed-which-one-is-longer, added-every-number-in-the-story
- MD.6: counted-the-number-line-marks-not-the-jumps, counted-each-jump-as-one-not-its-size, left-out-the-number-line-starting-point
- MD.7 (family `time-intervals`, where Grade 3 already filed the clock-reading tags): read-the-next-hour-from-the-hour-hand, mixed-up-a-m-and-p-m
- MD.8 (`money`): counted-the-coins-not-their-value, mixed-up-the-values-of-a-nickel-and-a-dime, kept-counting-by-the-last-coins-value, used-the-wrong-money-symbol
- MD.10: counted-a-tally-bundle-as-four, counted-a-tally-bundle-as-one-mark, put-a-count-on-the-wrong-bar

**Reused only where they name exactly the error:** chose-a-unit-of-the-wrong-size, estimated-ten-times-too-large, mislabeled-the-unit, read-the-minute-hand-as-the-number-it-points-to, swapped-the-hour-and-minute-hands, skip-counted-by-the-wrong-step, summed-all-data-points, used-the-wrong-given-quantity, forgot-the-final-step, left-one-of-the-addends-out, restated-a-known-number-instead-of-solving, added/subtracted-instead-of-…, added-without-carrying, subtracted-without-regrouping.

**Deliberately not reused:** counted-tick-marks-not-intervals names a *fraction* coming out one part too big, and counted-endpoints-not-intervals is in `coordinate-plane`. MD.6's own tag is separate from MD.1's ruler tag (ruling 19-5).

The brief's error list is mapped as follows:
- "measuring from the end of a ruler rather than from zero" → read-the-end-mark-without-starting-at-zero
- "counting tick marks instead of intervals" → counted-the-ruler-marks-not-the-spaces
- "reading a clock's minute hand as the hour" → swapped-the-hour-and-minute-hands
- "counting a coin collection by coin rather than by value" → counted-the-coins-not-their-value
- "picking the wrong unit entirely" → chose-a-unit-of-the-wrong-size

Ruling 19-5's added errors:
- MD.2 → expected-a-longer-unit-to-give-a-bigger-count
- MD.5 → operation choice plus restated-a-known-number (wrong unknown)
- MD.6 → counted-the-number-line-marks-not-the-jumps

## Tests and results

### New tests

- `authored.md.test.ts`, covering rulings 19-1..19-5 plus bank soundness:
  - `assertAuthoredBankSound`, and id format `g2-md<tail>-NN` matched against the item's own code
  - no generator reproduces an authored prompt
  - a mastery item and an above-mastery item per standard
  - a money-aware "all amounts or none" check plus a no-duplicate-amount check (the shared guard cannot read `35¢`)
  - **19-1 both ways:** every authored item and 200 draws of every MD generator are checked. If the text prints a clock time or a clock hand, the code must be MD.7. If it prints ¢, $ or a coin name, MD.8. If it says "number line", MD.6. Conversely, MD.6/7/8 items must be on those topics.
  - 19-2: MD.2 items measure "the same" object and offer the inverse-relationship error
  - 19-3 bounds: all five units across MD.1+MD.3; MD.4/MD.5 in a single unit; MD.5/MD.6 within 100; MD.7 keys on a 5-minute time with a.m./p.m.; MD.8 in cents ≤ 99¢ or whole dollars, never mixed, never `$1.25`; MD.10 ≤ 4 categories on a scale of one; no "line plot" anywhere
  - 19-4: a represent item, plus put-together, take-apart and compare items
  - 19-5: an item whose four options are all ☐-equations, plus the named tags
- `authored.test.ts` (ruling 19-6): every domain bank carried exactly once (membership loops, total length, OA/NBT/MD/G order); all **23** standards covered; the domain owns the standard; `g2-` hyphen ids; no two items share prompt+figure; a generator or authored item for every standard.
- Six template tests. Each has:
  - `assertTemplateSound` (300 runs) and a determinism check
  - **two LITERAL fixed-seed pins** (seeds 7 and 123: prompt, figure, key, full labelled option list with tags, final step), obtained by running the generator
  - range tests and per-distractor recomputation at 600 seeds
  - a key-rank-varies test
  - a full draw-space sweep with a pinned size
  - a counterfactual showing each excluded parameter really collides
- `templates/index.test.ts`:
  - six new sentinels (all pairwise disjoint across 400 seeds)
  - the naming regex widened from `\d` to `\d+` (see Deviations)
  - a new test: every template id's middle equals the tail of the code it is filed under (a 19-1 guard at the index level)

### TDD evidence

**RED:** `npx vitest run src/curriculum/grade2 src/curriculum/misconceptions.test.ts`, run after writing all tests and before any content:

```
FAIL src/curriculum/grade2/authored.md.test.ts
Error: Failed to resolve import "./authored.md" from "src/curriculum/grade2/authored.md.test.ts". Does the file exist?
FAIL src/curriculum/grade2/authored.test.ts
Error: Failed to resolve import "./authored" ...
FAIL src/curriculum/grade2/templates/md1-read-a-ruler.test.ts
Error: Failed to resolve import "./md1-read-a-ruler" ...
  (same for md2, md5, md7, md8, md10)
FAIL src/curriculum/grade2/templates/index.test.ts > GRADE_2_TEMPLATES > gives each generator a prompt shape no other one can produce
AssertionError: expected [ 'g2.md1.read-a-ruler', …(19) ] to deeply equal [ 'g2.nbt1.various-groupings', …(13) ]
 Test Files  9 failed | 18 passed (27)
      Tests  1 failed | 136 passed (137)
```

This was expected: none of the modules existed yet, and the sentinel table named six templates the index did not yet export.

The literal pins could not exist before their generators. They were added in GREEN, copied from a real run at seeds 7 and 123 (standing ruling).

**GREEN:**

```
npx vitest run src/curriculum/grade2 src/curriculum/misconceptions.test.ts
 Test Files  27 passed (27)
      Tests  236 passed (236)

npx vitest run
 Test Files  113 passed (113)
      Tests  1202 passed (1202)

npm run lint        -> exit 0 (7 warnings, all pre-existing, none in touched files)
npx tsc -b --noEmit -> exit 0
```

One intermediate red during GREEN was a defect in my own test, not the content. My first topic detector treated the word "clock" as a time topic. That flagged g2-md1-03, which offers "A clock" as a *wrong tool*. It also required ¢/$ in the coin template's prompt, which names coins in words. I tightened the detectors: time means a printed `h:mm` or a clock hand, and money means ¢, $ or a coin name.

## Collision exclusions and their algebra

Each exclusion is applied when the draw list is built. Nothing is resampled. Each is documented in the template docstring and proved real by a counterfactual test.

- **MD.1** (options d, e = s + d, 2s + d, d ± 1):
  - e = d + 1 ⇔ s = 1, so the start mark begins at 2. Every other pair reduces to s = 0, 2s = ±1, or s = −1.
  - A figure-level exclusion, d ≠ s, so the key is never the start mark printed in the figure.
  - Draw space: 4 × 6 − 4 = **20 spans**, × 2 flips.
- **MD.5** (small = big − diff; big + diff; diff; NR = small + 2(od − ob), with ob < od):
  - small = diff ⇔ big = 2·diff (10 pairs excluded).
  - diff = NR ⇔ ob = 10(tb − 2td), which forces ob = 0 and tb = 2td (18 pairs excluded).
  - Every other pair reduces to diff = 0, od = ob, big = 0 or 10·td = −ob.
  - 540 − 10 − 18 = **512** (the two families are disjoint).
- **MD.7** (H:5k, H:k, k:5H, (H+1):5k):
  - H:5k = k:5H ⇔ k = H, so 6 readings are excluded (morning 7, 8, 9, 10; evening 7, 8).
  - Every other pair needs 5k = k, H = H + 1, or two contradictory equalities.
  - 65 − 6 = **59** readings.
- **MD.8** (V, C = count, S = V + 5(n − d), K = V − p + p·v):
  - V = S ⇔ n = d, so that is excluded.
  - S = K ⇔ 5(n − d) = p(v − 1). For v = 5 this needs 5 | p, and p ≤ 4 rules it out. v = 10 and v = 25 are impossible by sign.
  - The other pairs need no silver coin, or p(v − 1) = 0.
  - Bounds: q 0–3, d 0–4, n 0–4, p 1–4, all options ≤ 99¢, giving **206** sets.
- **MD.10** (a − b, a + b, a, a − c):
  - The options are distinct whenever b, c ≥ 1 and b ≠ c.
  - Excluded so that no option except `a` is a bar height on the graph: a ≠ b + c (98 triples), and a ≠ 2b, a ≠ 2c (84 more).
  - 910 − 98 − 84 = **728** triples. The fourth bar d is drawn from heights not in {a, b, c, a−b, a−c, a+b}, and at least 9 of 15 always remain.
- **MD.2:** the options are distinct by construction (S ≠ L), so nothing is excluded.

## Files changed

Created:
- `src/curriculum/grade2/authored.md.ts`, `authored.md.test.ts`
- `src/curriculum/grade2/authored.ts`, `authored.test.ts`
- `src/curriculum/grade2/templates/md1-read-a-ruler.ts` + `.test.ts`
- `md2-two-units.ts` + test, `md5-shorter-length-unknown.ts` + test, `md7-clock-to-five-minutes.ts` + test, `md8-count-coins.ts` + test, `md10-bar-graph-how-many-more.ts` + test

Modified:
- `src/curriculum/grade2/templates/index.ts` (six templates, docstring)
- `src/curriculum/grade2/templates/index.test.ts` (sentinels, regex, filed-under test)
- `src/curriculum/misconceptions.ts` (the `money` family and 27 tags)

`graphify-out/` was not staged.

## Self-review findings, fixed before commit

Found by reading real generator output at the pin seeds:

1. `md10` seed 123 originally keyed "2 kids" while the Soccer bar was also 2, and offered "6 kids" (tagged wrong-bar subtraction) while the jump-rope bar was 6. A child who read the wrong bar could land on the key by accident. A child who read bar B and stopped would be reported with a different error. I rebuilt the draw as `BAR_TRIPLES` plus a filtered fourth bar, so no option except the intended `a` is ever a bar height. A new test checks this at 600 seeds.
2. `md1`: the key could equal the start mark printed in the figure (a 3-to-6 object gives 3). Excluded d = s.
3. `md2`: the hint read "shorter than a inch" for the cm/inch pair. Fixed the article, including in the explanation.
4. `md7`: the final step ended "6:50 a.m.." Fixed.
5. The `counted-the-ruler-marks-not-the-spaces` description was widened from "one end of an object to the other" to "between two points". g2-md4-01 uses it for the gap between two objects' ends; it is the same error.

Every authored item was solved cold. Each has exactly one correct option, and every distractor's value was recomputed from its named error (arithmetic is in the `//` comment above each option). The factual claims used as benchmarks were checked: a new crayon ≈ 3.6 in, a bus ≈ 35–45 ft, a car ≈ 4.5 m ≈ 5 yd, a meter slightly longer than a yard, a football field 100 yd / 360 ft, a soccer field ≈ 100 m.

## Deviations from the brief, and what justifies each

- **Code routing** (MD.6 number line, MD.7 time, MD.8 money): ruling 19-1.
- **MD.2 has its own template**, never merged with MD.1: ruling 19-2.
- **Aggregate tests live in `authored.test.ts`** with membership loops and 23-standard coverage: ruling 19-6. The brief's aggregate `describe` is not in `authored.md.test.ts`.
- **MD.10 represent item, and the per-standard bounds and tests:** rulings 19-3 and 19-4.
- **Additional named errors, and the ☐-equation-options item:** ruling 19-5.
- **Staged explicit paths** instead of `git add -A`: dispatch instruction.
- **`templates/index.test.ts` naming regex** changed from `/^g2\.[a-z]+\d\./` to `\d+`. The old pattern cannot match `g2.md10.<slug>`, which ruling 19-7's convention requires for NC.2.MD.10.
- **New `money` family:** Global Constraints ("never reuse a tag that names a different error … a mis-filed tag is worse than none"). This follows the pattern used when families were added for NC.4.OA.4, NC.4.OA.5, NC.4.MD.8 and NC.3.OA.8.
- **Aggregate uniqueness is on prompt + figure, not prompt alone** as in Grade 3. The pre-existing OA items `g2-oa4-01` and `g2-oa4-04` share the stem "The tiles below are arranged in equal rows…" with different array figures. Prompt-only would fail on Task 17 content that is legitimately two different questions.
- **Literal pins were written after the generators existed.** They must be copied from a real run (standing ruling), so they cannot precede the code. All structural tests were RED first.

## Concerns (for the reviewer's judgement)

1. **The `g2.md1.read-a-ruler` coin flip.** Every natural ruler error overshoots, so without an undercount the key would be the *smallest option at every seed*. That is a "pick the smallest" exploit a seven-year-old can find.
   - The fix is a flip between `d + 1` (counted-the-ruler-marks-not-the-spaces) and `d − 1` (counted-only-the-marks-between-the-ends). The two variants ask the identical question and share 2 of 3 distractor tags, so this is not the disjoint-mode split the Task 18 lesson forbids.
   - The cost: a child who chose `d + 1` may be re-served the variant where `d + 1` is not on offer. The docstring says so.
   - The only alternative I found keeps both off-by-ones. That makes the key the middle of three consecutive numbers at every seed, which is a worse tell. If the reviewer prefers the smallest-option tell to this, dropping the flip is a two-line change.
2. **Positional pattern across options.** Single-error distractors each share most features with the key. For example, `md7`'s key shares its hour with one distractor and its minutes with another. This is common to diagnostic multiple choice and is not a single surface feature, but a determined test-taker could exploit it. Not addressed.
3. **MD.7's generator only draws :35–:55.** This is deliberate: the next-hour error is live at every seed, and the earlier part of the hour is covered by authored items at :00, :15 and :30. It is still a narrower range than the whole standard.


---

# Fix round 1 — the eight required Minor findings (`task-19-fixes.md`)

**Commit:** `7a9bd66 fix: close the task 19 review's required minor findings` (on `06e26d2`).
**Result:** 1204/1204 passing (was 1202), lint exit 0 (the same 7 pre-existing warnings, none in touched files), `npx tsc -b --noEmit` clean.
Deferred review findings 2, 3, 11 and 12 were not touched. The rank-pinning `toEqual([0, 1])` tests are as they were, and still pass after F5.

The MD bank now holds **34 items** (was 32). Correct options sit at A 8, B 9, C 9, D 8.

## F1 — MD.7's :05–:25 marks

- **Added `g2-md7-05`** (mastery), keyed **10:25 a.m.** The clock face is "short hour hand a little past the 10, not yet halfway to the 11; long minute hand straight at the 5". Its distractors:
  - `10:05 a.m.`: read-the-minute-hand-as-the-number-it-points-to (the 5 read as 5 minutes)
  - `5:50 a.m.`: swapped-the-hour-and-minute-hands (long hand's 5 as the hour, the short hand's 10 as 10 fives)
  - `10:25 p.m.`: mixed-up-a-m-and-p-m (a morning trip written as p.m.)
  - The next-hour error is deliberately not offered. At :25 the hour hand is not near the 11, so no child reaches 11:25 by that error.
- **`md7-clock-to-five-minutes.ts` docstring.** It now says the authored items read exactly :00 (g2-md7-03), :15 (-01), :25 (-05) and :30 (-04). It also says plainly that :05, :10 and :20 appear in no MD.7 item, and that reading them is the same count by fives :25 asks for. The a.m./p.m. item list is corrected to -01, -02, -03, -05. The template's :35–:55 range is unchanged.
- **`templates/index.ts` docstring.** It now says "The authored items read :00, :15, :25 and :30 and carry the a.m.-against-p.m. choice", replacing the loose "earlier in the hour … are authored".
- **Covering test.** New in `authored.md.test.ts`: "keys an authored MD.7 item on a five-minute mark that is not a quarter or half" (the key's minutes must include one of 5, 10, 20, 25). I checked it against the pre-fix bank from `06e26d2`, whose MD.7 keys were only `15,45,0,30`, so the test would have failed there. The existing "keys every MD.7 question on a five-minute time with a.m. or p.m." also covers the new item.

## F2 — `g2-md8-04`'s 25¢ had several causes

- **Now:** "Rae has 1 quarter and 1 dime. A sticker costs 50¢. How much more money does Rae need?" The key is **15¢** (25 + 10 = 35, and 50 − 35 = 15). Distractors:
  - `35¢`: forgot-the-final-step (counted the coins, stopped)
  - `48¢`: counted-the-coins-not-their-value (2 coins as 2¢, 50 − 2)
  - `20¢`: mixed-up-the-values-of-a-nickel-and-a-dime (dime as 5¢: 25 + 5 = 30, 50 − 30)
- **How it was chosen.** A search over coin sets and prices modelled the other errors a child could make:
  - numbers the prompt prints (1, 1, 50)
  - each coin's value (25, 10)
  - each coin group's value
  - leaving one coin out (50 − 25 = 25, 50 − 10 = 40)
  - leaving a whole coin type out
  - adding the price on (85)
  - partial nickel/dime swaps

  None of 15, 35, 48 or 20 lands on any of those, and the no-regrouping slip on 50 − 35 gives 25, which is not an option. The item's `//` comment records this, and why the old 2-dime / 60¢ set failed: a dime counted as 5¢ and leaving one dime out both gave 25¢, and 25¢ was also the quarter's own value.
- **Explanation** updated to match: the 35¢ count, 50 − 35 = 15, and "Two coins is not 2¢".
- **Covering tests:** `assertAuthoredBankSound` (via "holds every authored-bank invariant"), the money-aware "never offers one amount twice", and "asks every MD.8 question in cents within 99¢ or in whole dollars, never both".

## F3 — the "minutes" rationale now matches the prompt

- `g2-md3-01` asks **"About how long is a new crayon?"** and `g2-md3-04` asks **"About how long is a car?"** (both previously "Which is the best estimate for the length of …").
- The option comments ("'How long' heard as …"), the explanations ("'How long' can be about time as well as length"; "'how long is a car' asks how far it stretches") and the tag description of `measured-length-with-a-unit-of-time` ("because 'how long' is asked about time as well as length") now all describe the words the child actually reads.
- The tag description needed no change. The item-header comments now say why the prompt is worded "how long".
- **Covering tests:** "holds every authored-bank invariant", the aggregate's prompt-and-figure uniqueness, and "shares no question with the generators".

## F4 — centimeters keyed in MD.3, and a test that guards it

- **Added `g2-md3-05`** (mastery): "Which is the best estimate for the length of a new pencil?" The key is **About 20 centimeters** (a new pencil is about 19 cm). Distractors:
  - About 20 meters: chose-a-unit-of-the-wrong-size
  - About 200 centimeters: estimated-ten-times-too-large
  - About 2 centimeters: estimated-ten-times-too-small

  Benchmarks in the explanation: a centimeter is about a little fingertip's width; 2 cm is shorter than a paper clip; 200 cm is taller than a grown-up; 20 m is longer than a classroom.
- **Test replaced.** The old "uses inches, feet, yards, centimeters and meters across MD.1 and MD.3" matched any text. The new "**keys an MD.3 estimate in each of inches, feet, yards, centimeters and meters**" reads only the correct option of each MD.3 item, so a unit that appears only as a rejected option or in an MD.1 tool name no longer counts. I checked it against the pre-fix bank: keyed units there were `foot,inch,meter,yard`, with no centimeter, so it fails exactly as the finding said the old test should have.

## F5 — the ruler's start-mark exclusion, applied consistently

- **Applied, not dropped.** The space stays healthy: 29 draws, 15 with the overcount and 14 with the undercount.
- **The rationale now covers every option except the end-mark reading.** The figure prints 0 and 12 at the ruler's ends and the start mark `s`. No option other than the end-mark reading `e` may be one of them, because reading `e` *is* that error. The draw list is now `RULER_DRAWS` of `{ s, d, over }`, with the exclusion made per flip when the list is built. Excluded:

  | Clash | Draws |
  |---|---|
  | key `d = s` | 4 spans × 2 flips = 8 |
  | overcount `d + 1 = s` | 3: (3,2) (4,3) (5,4) |
  | undercount `d − 1 = s` | 4: (2,3) (3,4) (4,5) (5,6) |
  | added `2s + d = 12` (the printed 12) | 4: (3,6), (5,2), both flips; (4,4) is already out as `d = s` |

  That is 48 − 19 = **29**. The `2s + d = 12` clash was not in the finding. It follows from the same stated rationale: a child answering the ruler's printed 12 would land on the added-instead-of-subtracted distractor. The docstring's "FIGURE COLLISIONS" section lists all four families.
- **Pins moved** because the draw list and rng sequence changed. They were re-captured from a real run, not hand-written:
  - seed 7 → ribbon, 5 to 12 mark; `['A','6 inches',…between-the-ends]`, `['B','7 inches',true]`, `['C','12 inches',…end-mark]`, `['D','17 inches',…added]`
  - seed 123 → leaf, 3 to 10; `A 6 inches (between)`, `B 13 inches (added)`, `C 10 inches (end-mark)`, `D 7 inches ✓`

  Both seeds now draw the undercount, so **seed 1** is pinned too, for the overcount: feather, 4 to 6; `A 6 inches (end-mark)`, `B 2 inches ✓`, `C 10 inches (added)`, `D 3 inches (counted-the-ruler-marks-not-the-spaces)`. That gives one literal pin per mark-counting error.
- **Covering tests** in `md1-read-a-ruler.test.ts`:
  - "has no colliding option value anywhere in its draw space" pins 29 / 15 / 14.
  - "offers no number the figure prints except the end-mark reading" replaces "never keys the start mark" and covers 600 seeds.
  - "keeps exactly the draws with no option or figure collision" is the F6 counterfactual below.
  - The three literal pins.
  - The unchanged rank test still gives `[0, 1]`.

## F6 — the three tautological "would collide" tests

Each is replaced by an md10-style counterfactual. It walks the space as it would be with no exclusions, computes the four options from the docstring's formulas, and asserts that the exported draw list keeps a parameter set exactly when its options do not collide. The formulas live in a helper (`optionsFor`, `clockOptions`, `coinOptions`). Each helper's comment points at the test that checks the same formulas against the generator's actual output at 600 seeds ("gives each distractor the value its tag names").

- **md1:** "keeps exactly the draws with no option or figure collision". For s = 2–5, kept ⇔ no figure collision, and no option collision occurs at all. At s = 1 every overcount draw collides (6 of them; the end-mark reading 1 + d equals the counted-marks d + 1), which is why the start marks begin at 2. The figure-collision count is pinned at 19.
- **md7:** "keeps exactly the readings whose four options are distinct". It walks all 65 part-of-day × hour × hand readings, asserting that kept ⇔ distinct and collides ⇔ hand = hour. The six collisions are pinned by name: morning 7:35, 8:40, 9:45, 10:50; evening 7:35, 8:40.
- **md8:** "keeps exactly the coin sets whose options are distinct and within 99¢". It walks every set in the count bounds with a silver coin, asserting that collides ⇔ nickels = dimes and kept ⇔ distinct ∧ all ≤ 99¢. The collision count is pinned at 76 (5 equal counts × 4 quarter counts × 4 penny counts = 80, less the 4 with no silver coin).
- The membership assertions are kept, now as the "kept" half of each equivalence.

## F7 — test title

`authored.test.ts`: "shares no prompt between any two authored items in the grade" is renamed "**shares no question — prompt and figure together — between any two authored items**". A comment names `g2-oa4-01` / `g2-oa4-04` as the reason it keys on both.

## F8 — `g2-md2-03` no longer mirrors the generator

The item now reads: "**Hana** measures the same rug two times. First she measures it in **yards** and gets 3. Then she measures it in **inches**. A yard is much longer than an inch. What will happen?"

- The key is **She will count more than 3 inches.** (A 3-yard rug is 108 inches.)
- The distractors keep the same three tags in the new direction:
  - fewer than 3 inches: expected-a-longer-unit-to-give-a-bigger-count
  - exactly 3: expected-the-count-to-stay-the-same-in-a-new-unit
  - the rug longer in inches: thought-the-object-changed-length-with-the-unit
- The generator never draws the yards/inches pair (it draws inch/foot, foot/yard, cm/m and cm/inch), and Hana is not one of its names. The hint wording ("much longer than") differs from its "shorter/longer than" sentences.
- The explanation and misconception text were rewritten for the shorter-unit direction.
- **Covering tests:** "measures the same object twice in every NC.2.MD.2 item" (still requires "the same" and the inverse-relationship tag), "shares no question with the generators", and "holds every authored-bank invariant".

## Commands and output

```
npx vitest run src/curriculum/grade2 src/curriculum/misconceptions.test.ts
 Test Files  27 passed (27)
      Tests  238 passed (238)

npm run lint          -> exit 0 (7 warnings, all pre-existing, none in touched files)
npx tsc -b --noEmit   -> exit 0

npx vitest run
 Test Files  113 passed (113)
      Tests  1204 passed (1204)
```

Guard check against the pre-fix bank (`git show 06e26d2:…/authored.md.ts`, in a scratch test deleted afterwards):

```
OLD keyed MD.3 units: foot,inch,meter,yard | NEW: centimeter,foot,inch,meter,yard
OLD MD.7 key minutes: 15,45,0,30 | NEW: 15,45,0,30,25
```

Test count: +2 net. md1 removed two tests and added three: the figure test, the counterfactual, and the seed-1 pin. md7 and md8 each swapped one test for one. `authored.md.test.ts` gained the MD.7 minute test.

## Files changed in this round

`src/curriculum/grade2/authored.md.ts`, `authored.md.test.ts`, `authored.test.ts`; `templates/index.ts`, `md1-read-a-ruler.ts` + `.test.ts`, `md7-clock-to-five-minutes.ts` + `.test.ts`, `md8-count-coins.test.ts`. `graphify-out/` was not staged.
