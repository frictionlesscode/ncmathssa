# Task 24 Report: Grade 1 Measurement & Data, Geometry, and the Grade 1 authored aggregate

Status: DONE. Commit: `4b5f524` "feat: add grade 1 measurement, geometry, and the authored aggregate" on `feat/multi-grade-adaptive`.

## What was implemented

- `src/curriculum/grade1/authored.md.ts` / `authored.md.test.ts` — `GRADE_1_MD_AUTHORED`, 18 items across the 5 MD standards (NC.1.MD.1, .2, .3, .5, .4), each with ≥3 items, mastery + advanced/stretch coverage per standard.
- `src/curriculum/grade1/authored.g.ts` / `authored.g.test.ts` — `GRADE_1_G_AUTHORED`, 12 items across the 3 G standards (NC.1.G.1, .2, .3), each with ≥3 items. This file also carries the aggregate test suite (`grade 1 authored aggregate`), per the brief's Step 1.
- `src/curriculum/grade1/authored.ts` — `GRADE_1_AUTHORED: Question[]`, joining OA, NBT, MD, G in that order, doc comment modeled on `grade2/authored.ts`.
- `src/curriculum/grade1/templates/md2-measure-with-units.ts` (+ test) — `NC.1.MD.2` generator: reads off a unit count from a correctly-iterated row; the "no gaps or overlaps" figure lives in `promptDetails` (ruling 24-9).
- `src/curriculum/grade1/templates/md4-read-the-data.ts` (+ test) — `NC.1.MD.4` generator: one template branching on the seed across the standard's three question types (total / per-category / more-or-less), always exactly three categories (ruling 24-5). Reuses six existing misconception tags with no new ones needed.
- `src/curriculum/grade1/templates/index.ts` / `index.test.ts` — the two new templates appended to `GRADE_1_TEMPLATES`, docstring extended with the Task 24 rationale, sentinel regexes added.
- `src/curriculum/misconceptions.ts` — 26 new tags declared (MD: 14, G: 8, MD.4-authored: 1, MD.5/coins: 4 — see breakdown below), each family-checked against its use; several existing tags reused (`left-one-of-the-addends-out`, `forgot-the-final-step`, `used-the-wrong-given-quantity`, `summed-all-data-points`, `added-instead-of-subtracted`, `subtracted-instead-of-added`, `gave-an-amount-instead-of-the-difference`, `swapped-the-hour-and-minute-hands`, `read-the-minute-hand-as-the-number-it-points-to`, `read-the-next-hour-from-the-hour-hand`, `called-unequal-parts-equal-shares`, `miscounted-the-number-of-equal-shares`, `confused-the-shape-name-with-its-side-count`).
- `src/curriculum/authoredBank.testkit.ts` / `authoredBank.testkit.test.ts` — `assertGradeOneReadable` gained an `opts.allowlist` parameter (never raising the 10-letter cap itself), and a new exported `GRADE_1_G_VOCAB_ALLOWLIST = ['rectangular', 'half-circles']`. Two new tests prove: (a) an allowlisted long word is accepted, (b) a *different* long word is still rejected even with the allowlist supplied.

## Per-standard item/template counts

| Standard | Authored items | Template |
|---|---|---|
| NC.1.MD.1 | 3 | none (ruling 24-2/24-3: fully authored) |
| NC.1.MD.2 | 3 | `g1.md2.measure-with-units` |
| NC.1.MD.3 | 4 | none (fully authored) |
| NC.1.MD.5 | 4 | none (fully authored) |
| NC.1.MD.4 | 4 | `g1.md4.read-the-data` |
| NC.1.G.1 | 4 | none |
| NC.1.G.2 | 4 | none |
| NC.1.G.3 | 4 | none |

MD total: 18 items (floor 15). G total: 12 items (floor 9). Two Measurement templates, as ruling 24-2/24-3 specifies ("Task 24 therefore contributes TWO templates, not three").

## How each ruling was satisfied

- **24-1** (`NC.1.MD.3`/`NC.1.MD.5` inversion): `authored.md.ts`'s doc comment states the swap explicitly; every MD.3 item is about clocks, every MD.5 item is about coins. `authored.md.test.ts`'s "files every clock-reading item under NC.1.MD.3 and every coin item under NC.1.MD.5" test asserts this on the live bank (clock vocabulary in MD.3 items, coin vocabulary in MD.5 items, and the reverse never appearing).
- **24-2/24-3** (`NC.1.MD.1` authored, only two templates): no `md1-*.ts` template file exists; `templates/index.ts`'s docstring states the reasoning verbatim (three-clause held state exceeds the two-sentence cap). `GRADE_1_MD_AUTHORED`'s three MD.1 items put the held facts in `promptDetails` and keep `prompt` to a short question, verified by "keeps NC.1.MD.1 and NC.1.MD.2 figures out of the prompt".
- **24-4** (value-in-pennies, no $/¢/word-problems): `g1-md5-02` is `"A dime is worth how many pennies?"`. The test "gives NC.1.MD.5 a value-in-pennies item and never uses $, ¢, or coin totals" asserts at least one such item exists and scans every MD.5 item's full text (prompt + details + options) for `$`, `¢`, and word-problem verbs (`buys`, `spends`, `change`, `costs`).
- **24-5** (three question types, ≤3 categories): `md4-read-the-data.ts` branches on `rng.pick(['total','category','compare'])`; `md4-read-the-data.test.ts` has "draws all three question types across its seed space", "never draws more than three categories", and one fixed-seed pin per type (seeds 1, 2, 7).
- **24-6** (NC.1.G.1 3-D item): `g1-g1-03` ("Which solid shape has 6 flat faces shaped like squares?" → cube). Test "gives NC.1.G.1 at least one 3-D item" scans for 3-D vocabulary.
- **24-7** (half-circles, 3-D composite, naming components): `g1-g2-01` uses half-circles; `g1-g2-03` is a cube+cone 3-D composite; `g1-g2-02` asks "Which shapes make it up?" (naming components, not the composite's own name). Test "gives NC.1.G.2 a half-circle item, a 3-D composite item, and a naming-the-components item" checks all three on the live bank.
- **24-8** (halves/fourths only, no thirds; "more shares = smaller shares"): every G item was hand-checked to avoid the word "third"; test "keeps NC.1.G.3 to two and four equal shares..." asserts `/\bthird[s]?\b/i` never appears anywhere in `GRADE_1_G_AUTHORED` and that at least one G.3 item discusses bigger/smaller shares (`g1-g3-03`, the cake item).
- **24-9** (MD.2 figure in `promptDetails`): `md2-measure-with-units.ts`'s prompt is `"How many X long is the Y?"`; the "no gaps or overlaps" description is in `promptDetails`. Template test "keeps the figure out of the readability-checked prompt" asserts `prompt` never matches `/gaps|overlaps/i` while `promptDetails` always does.
- **Allowlist ruling**: `assertGradeOneReadable(items, { allowlist })` implemented in `authoredBank.testkit.ts`; `GRADE_1_G_VOCAB_ALLOWLIST` exported and sourced in comment to `NC.1.G.1`/`NC.1.G.2`'s `keyConcepts` text. Two tests in `authoredBank.testkit.test.ts` prove the allowlist accepts its own words and still rejects an unrelated long word ("associative"). In practice no authored Grade 1 G/MD prompt actually needed the allowlist (I kept "rectangular" out of prompts, using "cube" instead), but the mechanism is proven and wired into `authored.g.test.ts`'s readability call.
- **"Apply assertGradeOneReadable to every MD and G prompt, authored and generated"**: both authored test files call it on their full bank; both new template test files call it across 300 seeds each; `templates/index.test.ts`'s net-level call already covers `GRADE_1_TEMPLATES` including the two new ones.
- **"standards.ts wins"**: every item's content was written against `grade1/standards.ts`'s `description`/`keyConcepts`, not the brief's prose (in particular the MD.3/MD.5 swap and the omitted 3-D/half-circle/thirds-out-of-scope bullets).

## Test results

Full suite: `npx vitest run` → **145 test files, 1592 tests, all passing** (up from the stated baseline of 1539; +53 net new tests across the new files and the testkit additions — some pre-existing files also changed slightly, e.g. `index.test.ts`'s single "prompt shape" test now covers more seeds/templates but is still one test).

`npm run lint` → 0 errors (7 pre-existing warnings, unrelated to this task, in files this task did not touch).

`npx tsc -b --noEmit` → clean, no output.

## TDD evidence

RED (misconceptions orphan-tag guard, before any MD/G content used the newly-declared tags):

```
$ npx vitest run src/curriculum/misconceptions.test.ts
 ❯ src/curriculum/misconceptions.test.ts (1 failed | 2 passed)
   × declared but unused: ...
     "expected-more-shares-to-be-bigger",
     "assumed-share-size-does-not-depend-on-the-count",
   ]
 Test Files  1 failed (1)
      Tests  1 failed | 2 passed (3)
```

GREEN (after authoring the MD/G banks that use every declared tag):

```
$ npx vitest run src/curriculum/misconceptions.test.ts
 ✓ src/curriculum/misconceptions.test.ts (3 tests)
 Test Files  1 passed (1)
      Tests  3 passed (3)
```

Additional RED→GREEN cycles during implementation (not full formal RED-first on every item, since the design was worked out on paper before writing code, but real failures were hit and fixed rather than guessed away):

- `authored.g.test.ts` initially failed on `assertAuthoredBankSound` ("G: more than half the answers sit at B") and `assertGradeOneReadable` (a 90-character prompt) — fixed by reordering option arrays to rebalance correct-answer position and moving two prompts' setup clauses into `promptDetails`.
- The STANDING RULING on fixed-seed literal pins was followed by running the generators first (a throwaway `_probe.test.ts`, deleted before commit) and copying the exact output strings into the pin tests, rather than hand-deriving them — this caught that my first hand-guessed `md2-measure-with-units` pin values were wrong before they were ever committed.

Final full run:

```
$ npx vitest run
 Test Files  145 passed (145)
      Tests  1592 passed (1592)
```

## Self-review findings

- Verified every MD/G authored item's last worked-solution step contains the exact correct-option text (case-sensitive substring), per `assertAuthoredBankSound`'s check — found and fixed three items (`g1-md2-01`, `g1-md2-02`, `g1-md3-04`) where the last step's wording had the right words but wrong case relative to a text-shaped (non-numeric) correct option.
- Verified answer-key position balance across both new banks manually (not just left to the automated check) after the automated check caught an initial B-heavy skew in the Geometry bank.
- Verified no authored MD/G item literally duplicates a generator prompt (`assertNoGeneratorDuplicatesAuthored` for MD; no such assertion exists for G since G has no generator to duplicate).
- Verified `NC.1.MD.4`'s draw-space algebra by hand (documented in the template's own doc comment) rather than relying only on the sweep test, since the "no colliding option" property depends on which specific values are subtracted/compared — the 2000-seed sweep test independently confirms this holds in practice.
- Confirmed `graphify-out/` was never staged.
- Confirmed no other file in the repo yet references `GRADE_1_AUTHORED`/`GRADE_1_MD_AUTHORED`/`GRADE_1_G_AUTHORED` outside this task's own files — wiring into `makeQuestionSource` is explicitly Task 26's job per the brief.

## Concerns

- None blocking. One minor observation: the `GRADE_1_G_VOCAB_ALLOWLIST` mechanism is fully implemented and tested per the controller ruling, but no authored Grade 1 prompt currently exercises it in practice (I avoided the word "rectangular" in prompts, using "cube"/"cylinder" instead, and "half-circles" never trips the cap on its own since its hyphen splits it into two under-cap tokens before the check even runs). If a future Grade 1 item needs "rectangular prism" spelled out in a prompt, the allowlist is ready to use.

---

## Fix round 1 (review findings I1, I2, M1, M2)

Commit: `418a65e` "fix: close task 24 review findings I1, I2, M1 and M2" on `feat/multi-grade-adaptive`.

### I1 — g1-md3-01's `4:00` distractor was dishonestly tagged

The clock in `g1-md3-01` shows exactly 3:00 (hour hand exactly on the 3, minute hand exactly on the 12) — no ambiguity about which hour the hand is near. The `4:00` distractor was tagged `read-the-next-hour-from-the-hour-hand`, whose declared description (`misconceptions.ts`) is specifically the *late-in-the-hour* case, where the hand genuinely sits close to the next number. That description does not honestly cover an exact-hour face.

Fix: declared a new tag `misread-the-hour-hand-by-one-number` (family `time-intervals`) whose description explicitly covers the case "even on a clock where the hand sits exactly on a number with nothing to make that ambiguous," and retagged the `4:00` option with it. The comment above the new tag cross-references `read-the-next-hour-from-the-hour-hand` and states why they're distinct. `stepByStep`/`conceptSummary`/`commonMisconception` for `g1-md3-01` did not reference `4:00` specifically, so no wording changes were needed there.

### I2 — four verbatim option-collision guards

`md4-read-the-data.ts` had three identical `if (new Set(texts).size !== texts.length) throw ...` blocks (one per question-type branch) and `md2-measure-with-units.ts` had a fourth. Extracted `assertNoOptionCollision(templateId, texts)` into `src/engine/template.ts` — the module that already defines `QuestionTemplate`/`GeneratedQuestion` and the one other cross-template runtime helper (`realize`) — and replaced all four inline blocks with calls to it. Note: this pattern is independently duplicated (with the same shape) across dozens of other templates in grades 1–5 that predate this task; per the finding's scope, only the four locations this task introduced were consolidated, not a codebase-wide refactor.

### M1 — g1-md4-04's take-apart distractors misused an additive tag

`g1-md4-04` is a take-apart problem (10 total, 4 and 3 known, 3 missing). Its `6` (= 10−4) and `7` (= 10−3) distractors were tagged `left-one-of-the-addends-out`, whose description ("Added only some of the numbers... left at least one addend out of the total entirely") is written for building a total by *adding* parts, not for a subtraction where one of two known parts is left out of what's subtracted.

Fix: declared `subtracted-only-one-of-two-known-parts` (family `geometry-and-measurement`), described precisely for this take-apart shape, and retagged both options.

### M2 — un-fireable `half-circles` allowlist entry

`GRADE_1_G_VOCAB_ALLOWLIST` contained `'half-circles'`, but `assertGradeOneReadable`'s tokenizer (`/[A-Za-z]+/g`) splits on the hyphen before the length check runs, producing `"half"` and `"circles"` — neither over ten letters — so that allowlist entry could never fire. Removed it from the array (now `['rectangular']`), kept and expanded the explanatory comment (in both the array's own doc comment and `assertGradeOneReadable`'s) to state explicitly why `half-circles` is deliberately excluded. The existing positive control ("accepts an allowlisted long word") and negative control ("still rejects a DIFFERENT long word even with the allowlist supplied") in `authoredBank.testkit.test.ts` needed no changes — neither ever depended on the `half-circles` entry — and both still pass, so the mechanism (including the negative control) remains proven.

### Covering tests run

```
$ npx vitest run src/curriculum/grade1/authored.md.test.ts src/curriculum/grade1/authored.g.test.ts src/curriculum/grade1/templates/md4-read-the-data.test.ts src/curriculum/grade1/templates/md2-measure-with-units.test.ts src/curriculum/authoredBank.testkit.test.ts

 ✓ src/curriculum/authoredBank.testkit.test.ts (21 tests)
 ✓ src/curriculum/grade1/authored.g.test.ts (13 tests)
 ✓ src/curriculum/grade1/templates/md4-read-the-data.test.ts (14 tests)
 ✓ src/curriculum/grade1/templates/md2-measure-with-units.test.ts (11 tests)
 ✓ src/curriculum/grade1/authored.md.test.ts (11 tests)

 Test Files  5 passed (5)
      Tests  70 passed (70)
```

```
$ npx vitest run src/curriculum/misconceptions.test.ts
 ✓ src/curriculum/misconceptions.test.ts (3 tests)
 Test Files  1 passed (1)
      Tests  3 passed (3)
```

### Full suite, lint, tsc

```
$ npx vitest run
 Test Files  145 passed (145)
      Tests  1592 passed (1592)
```

```
$ npm run lint
(same 7 pre-existing warnings as before this task, 0 errors, none in files this task touches)
```

```
$ npx tsc -b --noEmit
(no output — clean)
```

### Files changed in this fix round

- `src/curriculum/authoredBank.testkit.ts` — allowlist comment + array fix (M2).
- `src/curriculum/grade1/authored.md.ts` — retagged two distractors (I1, M1).
- `src/curriculum/grade1/templates/md2-measure-with-units.ts` — uses `assertNoOptionCollision` (I2).
- `src/curriculum/grade1/templates/md4-read-the-data.ts` — uses `assertNoOptionCollision`, 3 call sites (I2).
- `src/curriculum/misconceptions.ts` — 2 new tags declared (I1, M1).
- `src/engine/template.ts` — new `assertNoOptionCollision` helper (I2).
