# Task 16 — Register Grade 3 — Report

Commit: `e8d86a7` — *feat: register grade 3 as a playable curriculum*
Branch: `feat/multi-grade-adaptive`. Baseline at `de352e7`: 946 passing. Now: **969 passing, 87 files, 0 failures.**

## What I implemented

1. **`src/curriculum/grade3/grade3.test.ts`** (new) — written first, watched fail (Step 2: `Failed to resolve import "./index"`). Eleven tests, modelled on `grade4.test.ts` including its deliberate overlap with `integrity.test.ts` (Ruling 16-5/16-6), each overlap carrying a comment saying why it is repeated. `id.startsWith('g3-')` — hyphen, per Ruling 16-1; I renamed no items.
2. **`src/curriculum/grade3/quizzes.ts`** (new) — `GRADE_3_QUIZZES`: diagnostic, five module drills, mock SSA.
3. **`src/curriculum/grade3/index.ts`** (new) — `GRADE_3: GradeCurriculum`, `contentComplete: true`, blueprint source string verbatim from `nc-eog-blueprint.json`, re-exporting `GRADE_3_DOMAINS / GRADE_3_STANDARDS / getStandardByCode / getDomainById` exactly as `grade4/index.ts` does. **Wires in `GRADE_3_STUDY_GUIDES`**, which Task 15 left unreferenced and therefore unreachable by the app. A test pins all 20 guides present.
4. **`src/curriculum/registry.ts`** — `3: GRADE_3` plus the import, ordered ahead of grade 4.
5. **`src/curriculum/registry.test.ts`** — two expected updates (Ruling 16-2).
6. **`src/components/FirstRunScreen.test.tsx`** — option-list expectation updated (Ruling 16-7).
7. **`src/curriculum/grade5/quizzes.ts`** — circular import fixed (Ruling 16-8).

### Quiz set

| Quiz | Items | Flags |
|---|---|---|
| `g3-diagnostic-01` | 20 (one per standard) | `isDiagnostic: true`, `timeLimitMinutes: 40`, subtitle a **function of the curriculum** (Ruling F11 — counts derived from `c.domains` and `DIAGNOSTIC_QUESTION_IDS.length`, no grade-3 literal) |
| `g3-mod-oa-01` | 21 | `domainId: 'OA'`, 35 min |
| `g3-mod-nbt-01` | 7 | `domainId: 'NBT'`, 20 min |
| `g3-mod-nf-01` | 14 | `domainId: 'NF'`, 30 min |
| `g3-mod-md-01` | 21 | `domainId: 'MD'`, 35 min |
| `g3-mod-g-01` | 5 | `domainId: 'G'`, 15 min |
| `g3-mock-ssa-01` | 28 | `isMockAssessment: true`, `timeLimitMinutes: 55`, curriculum-function subtitle citing `c.ssa.passingPercent` |

Every `questionIds` entry is an **authored** id (`g3-oa1-01` form); no template id appears. Verified beyond the test by a throwaway check: the five drills together cover all 68 authored items with no duplicate and no omission, and the diagnostic hits 20 distinct standard codes. The 28 simulation items are disjoint from the 20 diagnostic items.

Drill subtitles cite only their own domain's published band with the en dash (`32–36%`, `28–32%`); the MD and G drills cite no percentage at all, because neither has a band of its own.

## The mock exam's domain allocation and its arithmetic

Grade 3 bands from `standards.ts` / `nc-eog-blueprint.json`: OA 32–36 (mid 34), NF 28–32 (mid 30), NBT 9–13 (mid 11), and **one shared MD+G band 23–27 (mid 25)** — MD and G each carry `officialWeightMidpoint: 25` with `weightGroup: 'MD+G'`.

Raw midpoints sum to 34 + 30 + 11 + 25 + 25 = **125**. That is why the allocation goes through `domainWeight()`, which divides a group's midpoint by standard count. MD holds 6 of the group's 7 standards, G holds 1.

`domainWeight()`, printed from the running registry:

| Domain | `domainWeight()` | Ideal × 28 | Items | Share of the 28-item form | Band |
|---|---|---|---|---|---|
| OA | 34.0000 | 9.5200 | **10** | 35.71% | 32–36 ✓ |
| NF | 30.0000 | 8.4000 | **8** | 28.57% | 28–32 ✓ |
| NBT | 11.0000 | 3.0800 | **3** | 10.71% | 9–13 ✓ |
| MD | 21.4286 (= 25 × 6/7) | 6.0000 | **6** | 21.43% | MD+G 23–27 |
| G | 3.5714 (= 25 × 1/7) | 1.0000 | **1** | 3.57% | MD+G 23–27 |
| **MD+G** | **25.0000** | 7.0000 | **7** | **25.00%** | 23–27 ✓ — the band's exact midpoint |
| Total | 100.0000 | 28 | 28 | 100% | |

Every count is `floor(ideal)` or `ceil(ideal)`; MD and G land on exact integers with no rounding at all. This is Ruling 16-3's 10/3/8/7, not the brief's 9/3/8/8 (which puts MD+G at 28.6%, above its band). The test asserts the exact `{OA: 10, NBT: 3, NF: 8, MD: 6, G: 1}` map *and* the floor/ceil relation to `domainWeight()`, following Grade 4's precedent of avoiding a float tolerance.

## Every test that went red on registration

Exactly three, in two files — the three the rulings predicted, and nothing else.

| Test | Ruling | Why |
|---|---|---|
| `registry.test.ts > throws for a grade with no curriculum module` | 16-2 | Pinned `getCurriculum(3)`. Moved to **grade 1**. Grade 2 registers in Task 21, so pointing it there would have moved the pin again one task later; the new comment says so. |
| `registry.test.ts > lists only grades that actually have modules` | 16-2 | `[4, 5]` → `[3, 4, 5]`. |
| `FirstRunScreen.test.tsx > offers only grades that have a curriculum` | 16-7 | `['4','5']` → `['3','4','5']`. |

**The first-run default did not move.** `FirstRunScreen.test.tsx > pre-selects the highest registered grade` derives its expectation via `Math.max(...grades)` and stayed green untouched: `curricula[curricula.length - 1]` still yields 5. Registering Grade 3 at the *front* of the ascending list is exactly the case that would have broken a `curricula[0]` seed, and it did not.

`integrity.test.ts` now runs its 12 assertions over Grade 3 as a third `describe.each` case — all 12 green on the first run, including the quiz-id, study-guide-coverage, content-complete and weight-total checks.

**Note, contrary to the brief's expectation:** `sourcedStandards.test.ts` did **not** multiply. It is parameterised over `BY_GRADE` — all five grades' `standards.ts` modules, registered or not — so it has been running Grade 3 since Task 12. Only `integrity.test.ts` is registry-driven. Net +23 tests (11 new in `grade3.test.ts` + 12 from `integrity.test.ts`), which matches 946 → 969 exactly.

## `standards.test.ts` — decision: do not add one

Grade 4 has no `standards.test.ts` either; the arrangement is repo-wide, not an oversight. `src/curriculum/sourcedStandards.test.ts` already asserts, for Grade 3 specifically: the exact sourced domain set, the exact code set per domain, that no invented code appears, and — in a second `describe.each(['3','4','5'])` — that every domain's `officialWeightRange` and `officialWeightMidpoint` equal the blueprint's, and that exactly the domains sharing a band carry `weightGroup` + `weightGroupLabel`. That is the entire content of `standards.ts` checked against both source JSON files. A sibling file could only restate it against the same two sources, so it would add a second place to update and no new coverage. Task 12's forward flag is answered: covered, no gap.

## Brief/source disagreements

- **Item id separator** — the brief's `id.startsWith('g3.')` cannot pass against any shipped Grade 3 id. Used `g3-` (Ruling 16-1). No item renamed.
- **Mock allocation** — the brief's 9/3/8/8 breaks the MD+G band. Used 10/3/8/7 (Ruling 16-3).
- **Step 6's "Expected: PASS"** — three expected failures, per rulings 16-2 and 16-7.
- **Brief's `index.ts` sketch** omits `GRADE_3_STANDARDS`, `getStandardByCode` and `getDomainById` from the re-export. I matched `grade4/index.ts` and re-exported all four; `standards.ts` exports them and nothing else would reach them.
- No blueprint weight was invented. Every percentage in new code traces to `standards.ts`, which `sourcedStandards.test.ts` ties to `docs/sources/nc-eog-blueprint.json`.

## TDD evidence

1. Wrote `grade3.test.ts` first. Ran it: **FAIL**, `Failed to resolve import "./index" from "src/curriculum/grade3/grade3.test.ts"` — no tests collected.
2. Wrote `quizzes.ts`, then `index.ts`, then registered. `grade3.test.ts` green.
3. Full suite: 3 failures, all predicted. Updated the two pin files. Full suite: **969/969 green.**

## Ruling 16-8 — Grade 5's circular import

`grade5/quizzes.ts` imported `standardsOf` from `../registry` while `registry.ts` imports `./grade5` — and `registry.ts` now imports `./grade3` and `./grade4` ahead of it, so a `grade5/index` entry point would have produced `{3: …, 4: …, 5: undefined}`. Replaced with a four-line local `standardsOf(c)` counting off `c.domains`, matching `grade4/quizzes.ts`, with the reasoning in a file comment. Both call sites (the diagnostic subtitle and `createStandardDrill`) use it. `registry.ts` no longer appears in any grade module's import graph.

## Verification

- `npx tsc -b --noEmit` — **clean, exit 0**
- `npx vitest run` — **87 files, 969 tests, 0 failed**
- `npm run lint` — **exit 0**, 7 warnings, all pre-existing, none in a file I touched (`AdaptiveSessionCard.test.tsx`, `ProgressContext.tsx` ×4, `QuizResults.tsx`, `WeakSpotsView.tsx`)

## Files changed

| File | |
|---|---|
| `src/curriculum/grade3/grade3.test.ts` | new |
| `src/curriculum/grade3/quizzes.ts` | new |
| `src/curriculum/grade3/index.ts` | new |
| `src/curriculum/registry.ts` | +2 lines |
| `src/curriculum/registry.test.ts` | two pins updated |
| `src/components/FirstRunScreen.test.tsx` | option list updated |
| `src/curriculum/grade5/quizzes.ts` | circular import fixed |

## Self-review findings

- Caught and fixed a typo of my own before committing: the OA drill subtitle read `32–32%` instead of the sourced `32–36%`. Nothing in the suite would have caught it — drill subtitles are free text and no test reads them. Worth knowing that the band figures printed to a parent in a drill subtitle are unguarded at every grade.
- Verified out-of-band (throwaway test, since deleted): drills cover all 68 authored items exactly once; diagnostic covers 20 distinct codes; simulation ∩ diagnostic = ∅.
- Swept `App.tsx` and `Dashboard.tsx` for the class of grade-5 hardcode Task 11 found. **None.** `Dashboard` finds both special quizzes by flag, `App.findQuiz` searches `curriculum.quizzes`, and `createStandardDrill` / `createMissedQuestionsDrill` / `createAdaptiveSessionDrill` all take their data as parameters.

## Concerns (none blocking)

1. **`App.tsx` imports three curriculum-agnostic helpers from `src/curriculum/grade5/quizzes.ts`.** Not a defect — all three are parameterised and contain no grade-5 literal — but they are generic quiz factories living inside one grade's file, and they are now serving three grades. They belong somewhere like `src/curriculum/drills.ts`. Out of scope here; flagging for whoever touches quizzes next (Task 21 registers Grade 2 and will inherit this).
2. **Drill subtitles cite blueprint bands as free text with no test binding them to `standards.ts`.** My `32–32%` typo would have shipped. A cheap guard — every `\d+–\d+%` in a quiz subtitle must equal some domain's `officialWeightRange` — would cover all grades; the analogous guard already exists for `weightCategory` in `integrity.test.ts`. Not added, as it is outside this task's scope and would need the existing grades checked first.
3. **The `getCurriculum` throw pin now points at grade 1**, the last grade the plan registers. It will need moving one final time by whichever task registers Grade 1, at which point the assertion should probably become a type-level impossibility rather than a moving target.
