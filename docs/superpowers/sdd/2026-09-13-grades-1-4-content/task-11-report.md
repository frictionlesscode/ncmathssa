# Task 11 — Register Grade 4 — Report

Commit: `dcdd0bc feat: register grade 4 as a playable curriculum` on `feat/multi-grade-adaptive`.

## What I implemented

**Created**

- `src/curriculum/grade4/quizzes.ts` — `GRADE_4_QUIZZES`: a diagnostic, five module
  drills (one per domain), and a mock simulation. 7 quizzes, 156 item references,
  every one an authored `g4-…` id.
- `src/curriculum/grade4/index.ts` — `GRADE_4: GradeCurriculum`, `contentComplete: true`,
  re-exporting `GRADE_4_DOMAINS`, `GRADE_4_STANDARDS`, `getStandardByCode`,
  `getDomainById` the way `grade5/index.ts` does.
- `src/curriculum/grade4/grade4.test.ts` — 9 tests.

**Modified**

- `src/curriculum/registry.ts` — `4: GRADE_4` in `CURRICULA`.
- `src/curriculum/registry.test.ts` — the pinned `toEqual([5])` → `toEqual([4, 5])`
  (ruling 11.2), and its sibling comment corrected from "Grades 1-4 are a later plan"
  to "Grades 1-3 are a later batch".
- `src/components/FirstRunScreen.test.tsx` — a second pinned single-grade expectation
  (see "Tests that went red").
- `src/App.tsx`, `src/components/Dashboard.tsx`, `src/curriculum/grade5/quizzes.ts` —
  three grade-5 literals that registration made live (see "Real findings").

### The quiz set

| id | kind | items | time |
|---|---|---|---|
| `g4-diagnostic-01` | `isDiagnostic: true` | 25 (one per standard) | 45 min |
| `g4-mod-oa-01` | `domainId: 'OA'` | 18 | 30 min |
| `g4-mod-nbt-01` | `domainId: 'NBT'` | 18 | 35 min |
| `g4-mod-nf-01` | `domainId: 'NF'` | 27 | 45 min |
| `g4-mod-md-01` | `domainId: 'MD'` | 21 | 35 min |
| `g4-mod-g-01` | `domainId: 'G'` | 12 | 25 min |
| `g4-mock-ssa-01` | `isMockAssessment: true` | 30 | 60 min |

Each module drill carries the whole authored bank for its domain. The diagnostic and
the mock subtitles are **functions of the curriculum** (Ruling F11): the diagnostic
derives the standard count from `c.domains`, the mock cites `c.ssa.passingPercent`.
Neither bakes in a literal. Nothing in the mock overlaps the diagnostic — a child who
just sat the baseline meets fresh items in the simulation.

## The mock exam's domain allocation, and the arithmetic

Grade 4 weights from `src/curriculum/grade4/standards.ts`, which traces to
`docs/sources/nc-eog-blueprint.json`:

| domain | band | midpoint | standards | `domainWeight()` |
|---|---|---|---|---|
| OA | 14–18% | 16 | 4 | 16 |
| NBT | 25–29% | 27 | 6 | 27 |
| NF | 30–34% | 32 | 6 | 32 |
| MD | 23–27% (`weightGroup: 'MD+G'`) | 25 | 6 | 25 × 6/9 = **16.667** |
| G | 23–27% (`weightGroup: 'MD+G'`) | 25 | 3 | 25 × 3/9 = **8.333** |

Total through `domainWeight()`: 16 + 27 + 32 + 16.667 + 8.333 = **100**. Summing raw
midpoints would give 16 + 27 + 32 + 25 + 25 = 125, because MD and G each carry the
whole shared band.

30 items × each share:

| domain | share | ideal items | allocated | error |
|---|---|---|---|---|
| OA | 16% | 4.8 | **5** | +0.2 |
| NBT | 27% | 8.1 | **8** | −0.1 |
| NF | 32% | 9.6 | **10** | +0.4 |
| MD | 16.667% | 5.0 | **5** | 0.0 |
| G | 8.333% | 2.5 | **2** | −0.5 |
| | | 30.0 | **30** | |

MD + G = 7, which is the brief's "about 7 across MD and Geometry together"; the 5/2
split inside that 7 comes from `domainWeight()`, not from a judgement call. Every
domain lands within half an item of its band. `grade4.test.ts`'s
*"allocates the mock assessment to the blueprint bands"* asserts exactly this: it
recovers each item's domain from `source.authoredFor()`, pins the counts
`{ OA: 5, NBT: 8, NF: 10, MD: 5, G: 2 }`, and then independently checks each count
against `domainWeight(GRADE_4, d) / 100 × 30` with a ±0.5 tolerance — so the pinned
counts cannot drift away from the blueprint without going red.

## Ruling 11.4 — were Task 8's MD templates registered?

**Yes, verified by reading `src/curriculum/grade4/templates/index.ts`.** All five MD
generators are imported, listed in `GRADE_4_TEMPLATES`, and re-exported:
`md1MetricWordProblem`, `md2MetricConvert`, `md3RectangleArea`,
`md3RectanglePerimeter`, `md6MissingAnglePart`.

Resulting generator coverage — 22 templates over **18 distinct standards**:

- OA: OA.1, OA.4 (2)
- NBT: NBT.1, NBT.2, NBT.4, NBT.5, NBT.6, NBT.7 (6, all of Base Ten)
- NF: NF.1, NF.2, NF.3, NF.4, NF.6, NF.7 (6, all of Fractions)
- MD: MD.1, MD.2, MD.3, MD.6 (4)
- G: none — Grade 4 Geometry is authored-only by design, documented in the
  `templates/index.ts` docstring.

18 ≥ 12, so the `hasGenerator >= 12` floor passes with six standards of headroom.
Grade 4 has a renewable pool for 18 of its 25 standards; the seven authored-only ones
(OA.3, OA.5, MD.4, MD.8, G.1, G.2, G.3) are all the reasoning/classification/wording
cases the Content Contract says should stay authored.

## Where the brief disagreed with the source

**One disagreement, already anticipated by ruling 11.1, and I followed the ruling and
the source.** The brief's Step 1 asserts `id.startsWith('g4.')`. Every committed
Grade 4 item id uses the hyphen (`g4-nf1-01`); `grep "id: 'g4\."` over the grade
returns nothing. The assertion is `id.startsWith('g4-')`, with a comment recording
that template ids genuinely do use dots (`g4.oa1.times-as-many`) but that a quiz may
only cite authored items, so the two conventions cannot collide here. No item was
renamed.

Everything else in the brief checked out against the source:

- `weighting.source` — the brief's string
  `'NCDPI EOG Mathematics Grades 3-8 Test Specifications, April 2026'` is **verbatim**
  the `source` field of `docs/sources/nc-eog-blueprint.json`. Not invented, and I
  noted the provenance in a comment in `index.ts`.
- The brief's 5/8/10/7 mock allocation is correct against the blueprint, as ruling
  11.4 said; I kept it and derived the 5/2 split inside the 7.
- `standardsOf(GRADE_4).length === 25` — confirmed against `standards.ts`
  (NF 6, NBT 6, MD 6, G 3, OA 4).

One deliberate departure from the brief's literal Step 4 code: the brief's `index.ts`
re-exports only `GRADE_4_DOMAINS`. I matched `grade5/index.ts` and also re-exported
`GRADE_4_STANDARDS`, `getStandardByCode` and `getDomainById`, which `standards.ts`
already exports and which the Grade 5 module surface exposes.

## Every test that went red on registration

**Expected (1, per ruling 11.2):**

1. `src/curriculum/registry.test.ts` — *"lists only grades that actually have modules"*:
   `expected [ '4', '5' ] to deeply equal [ '5' ]`. Updated to `toEqual([4, 5])`.
   Its sibling `getCurriculum(3)` throw-test stayed valid and stayed green.

**Real findings (3) — none of them a content defect in Tasks 5–10:**

2. **A second pinned single-grade expectation the rulings did not anticipate.**
   `src/components/FirstRunScreen.test.tsx` — *"offers only grades that have a
   curriculum"*: `expected [ '4', '5' ] to deeply equal [ '5' ]`. Same class as (1):
   the component derives its `<option>` list from `listCurricula()` and is behaving
   correctly; only the pin was stale. Updated to `['4', '5']` with a comment saying
   why grades 1–3 must stay absent. **Worth flagging for Grade 3's batch: this file
   has to be updated alongside `registry.test.ts` every time a grade registers, and
   ruling 11.2 named only one of the two.**

3. **A circular import that left `CURRICULA[4]` undefined.** `grade4.test.ts`'s very
   first test failed with `No curriculum module for grade 4` *while `registry.test.ts`
   and `integrity.test.ts` both passed against a correctly registered Grade 4* — the
   giveaway. The cycle is `grade4/index → grade4/quizzes → ../registry → grade4/index`:
   when `grade4/index` is the entry module, `registry.ts` evaluates against a
   half-initialised `./grade4`, binds `4: undefined`, and `getCurriculum(4)` throws.
   Grade 5 has the identical cycle (`grade5/quizzes.ts` imports `standardsOf`) and has
   only ever been masked by import order — `grade5.test.ts` happens to import
   `../registry` on its first line. I broke the cycle in Grade 4 rather than reproduce
   it: `grade4/quizzes.ts` imports no registry at all and counts standards off
   `c.domains` directly, with a comment explaining why. See "Concerns" — Grade 5's copy
   of the cycle is still there.

4. **Two grade-5 quiz-id literals in the UI, which registration made live.** Not test
   failures (there are no `App`/`Dashboard` tests), found by grepping the app for
   grade-5 literals after the suite went green:
   - `src/App.tsx` imported `getQuizById` from `./curriculum/grade5/quizzes`, which
     searches `GRADE_5_QUIZZES` only. **No Grade 4 quiz could have started** —
     `handleStartQuiz('g4-mod-nf-01')` would have returned `undefined` and silently
     done nothing, and retake would have fallen back to an unrelated drill. Replaced
     with a local `findQuiz` over `curriculum.quizzes`.
   - `src/components/Dashboard.tsx` found the mock by `q.id === 'mock-ssa-01'` and
     "has taken the diagnostic" by `a.quizId === 'diagnostic-01'`. For Grade 4 the
     simulation card would have rendered blank and the "take your diagnostic" prompt
     would have shown forever. Both now go through the `isMockAssessment` /
     `isDiagnostic` flags — which already existed on `QuizDefinition` and which the
     new `grade4.test.ts` quiz-shape test pins Grade 4 as setting.
   - `getQuizById` was then dead, and it is a landmine of exactly the kind just fixed
     (a grade-5-only lookup with a grade-neutral name), so I removed it.

## TDD evidence

**RED (Step 2)** — `npx vitest run src/curriculum/grade4/grade4.test.ts`, before
`index.ts`/`quizzes.ts` existed:

```
Failed to resolve import "./index" from "src/curriculum/grade4/grade4.test.ts"
Test Files  1 failed (1)
     Tests  no tests
```

**RED again after Steps 3–5**, the circular-import finding — quizzes, the module and
the registration all in place, yet:

```
FAIL  src/curriculum/grade4/grade4.test.ts > is registered and reachable by grade number
Error: No curriculum module for grade 4
  ❯ getCurriculum src/curriculum/registry.ts:12:17
Test Files  1 failed | 2 passed (3)
     Tests  1 failed | 41 passed (42)
```

(`integrity.test.ts` already at 24 tests here — 12 × 2 curricula — which is what
proved the registration itself was fine and the fault was module init order.)

**GREEN** — after breaking the cycle, whole suite:

```
Test Files  60 passed (60)
     Tests  636 passed (636)
```

Baseline at `d5f4283` was 615. +21 = 12 new `integrity.test.ts` assertions (the
`describe.each` doubling) + 2 new `sourcedStandards.test.ts` + 9 in `grade4.test.ts`,
less the 2 that were already counted.

## Verification

- `npx vitest run` — **60 files, 636 tests, 0 failures.**
- `npx tsc -b --noEmit` — `TypeScript: No errors found`.
- `npm run build` — succeeds (`built in 753ms`); only the pre-existing
  chunk-size advisory.
- `npm run lint` — **exit 1, unchanged from baseline.** I verified this by stashing my
  work and rerunning: `oxlint` exits 1 at `d5f4283` too, on five pre-existing warnings
  in `ProgressContext.tsx`, `QuizResults.tsx` and `WeakSpotsView.tsx`. **Zero findings
  in any file this task touched** — the warning list is byte-identical before and
  after. The plan's "lint exits 0" gate is not currently met by the repo and this task
  neither improved nor worsened it.
- Step 8, no network calls: `grep -rn "fetch(\|XMLHttpRequest\|sendBeacon\|WebSocket\|navigator.send" src/`
  → no output.
- **Step 7 (browser) was NOT performed** — this session has no browser. The build
  succeeds, the registry-driven tests pass against both grades, and the three UI
  grade-5 literals found by grep are fixed, but *"switch to Grade 4 and run a quiz end
  to end"* has not been done by a human. See "Concerns".

## Files changed

```
src/curriculum/grade4/quizzes.ts        | new, 156 lines
src/curriculum/grade4/index.ts          | new,  25 lines
src/curriculum/grade4/grade4.test.ts    | new,  98 lines
src/curriculum/registry.ts              | +2
src/curriculum/registry.test.ts         | +2 -2
src/components/FirstRunScreen.test.tsx  | +3 -1
src/App.tsx                             | +8 -4
src/components/Dashboard.tsx            | +7 -2
src/curriculum/grade5/quizzes.ts        | -4 (dead getQuizById)
```

## Self-review findings

- Re-read the diff against the "things that will bite you" list. Every `questionIds`
  entry is an authored id (`integrity.test.ts`'s *"defines quizzes that only reference
  this grade's own questions"* is green over 156 references); `isDiagnostic` and
  `isMockAssessment` are both set and now pinned by a test rather than left to compile
  silently; every module drill has `domainId`, also pinned; no raw midpoint is summed
  anywhere; `contentComplete: true` ships in the same commit as the registration.
- Per ruling 11.3 I kept the weight-total and content-coverage assertions that
  `integrity.test.ts` also makes generically, each with a comment saying so and why.
- I checked I had not overbuilt: no `getQuizById`-style helper, no second mock form
  (Grade 5 has a Form B; the brief specifies one form for Grade 4 and I did not add a
  second), no new `QuestionSource` method for the allocation test — it reuses
  `authoredFor()` the way `integrity.test.ts` does.
- The NF drill subtitle cites "30-34%", which is NF's own `officialWeightRange`; no
  single-domain percentage is claimed for MD or G anywhere in the quiz set.

## Concerns

1. **Grade 5 still has the circular import I removed from Grade 4.**
   `grade5/quizzes.ts` imports `standardsOf` from `../registry`, and `registry.ts`
   imports `./grade5`. It is green only because every current entry point reaches
   `registry` before `grade5/index`. A future `import { GRADE_5 } from './grade5'` as
   the first module of some graph will produce the same
   `No curriculum module for grade 5` that cost me a debugging cycle here. I left it
   alone as out of scope; it is a one-line fix identical to the one in
   `grade4/quizzes.ts` and Grade 3's task will hit it again.
2. **`FirstRunScreen.test.tsx` is a second registration pin** that ruling 11.2 did not
   list. Grade 3's brief should name both files.
3. **Step 7 was not executed.** The two UI fixes in this commit are argued from reading
   the code, not from a browser; nobody has watched a Grade 4 quiz run end to end or
   confirmed the Curriculum tab labels MD and G "23–27% (Measurement & Data and
   Geometry combined)". A five-minute manual pass is worth doing before this branch
   merges.
4. `npm run lint` does not exit 0 in this repo and has not since before this task.
   Worth a separate cleanup task rather than being absorbed silently into content
   commits.

---

# Fix report — coordinator review round 1

Commit: `1c15278 fix: default first-run to the highest grade, and harden the band guard`. Both Important/Also-fix items addressed; the two
"do not fix" items left alone (`QuizzesListView.tsx:200`'s bare grouped band, Grade 5's
circular import).

## 1. The first-run default grade — fixed, and pinned

**Accepted the ruling without reservation.** Highest-registered-grade is right, and the
third reason is the one I find decisive: `curricula[0]` is not merely wrong today, it is
a default that *keeps getting worse* as the plan succeeds. Grade 3's batch would have
moved it to 3, and Task 26 would have landed every new family on a Grade 1 profile — each
time silently, each time invisible to the suite. I have no push-back.

`src/components/FirstRunScreen.tsx` — `curricula[0]?.grade ?? 5` became
`curricula[curricula.length - 1]?.grade ?? 5`, bound to a named `defaultGrade` with a
comment stating the rule, why ascending order makes `[0]` a trap, and why SSA's oldest
cohort makes the top of the list the right answer. Nothing is hardcoded to 5: the
expression stays correct as grades 3, 2 and 1 register, and the `?? 5` is only the
empty-registry fallback that was already there.

**The pin** — `FirstRunScreen.test.tsx`, *"pre-selects the highest registered grade"*:

- derives `highest` from `listCurricula()`, so it does not need editing as grades
  register;
- guards its own vacuity — `expect(grades.length).toBeGreaterThan(1)` — so it cannot
  quietly become a tautology if the registry ever holds one grade;
- reads the `<select>`'s `value` on a **fresh render with nothing selected**. It calls
  `selectOptions` nowhere, which is exactly what let the flip through;
- then types a name and submits **without touching the picker**, asserting
  `onComplete` receives `grade: highest`. The value the parent actually gets is what
  matters, not just the rendered attribute.

**Mutation-checked, not assumed.** I reverted the component to `curricula[0]` and re-ran:
`FAIL … pre-selects the highest registered grade — expected '4' to be '5'`. Restored,
green.

## 2. The Geometry allocation tolerance — fixed

**Choice: assert the count is one of the two roundings of the ideal
(`floor(ideal) <= n <= ceil(ideal)`), not a distance under a tolerance.**

Why that rather than `< 0.5 + 1e-9`: Geometry's ideal is exactly 2.5, which is a
*genuine* tie between 2 and 3, not a float artefact. A ±0.5 window round a value sitting
on the boundary is the wrong shape of assertion however the epsilon is nudged — it either
admits both (and clears by an ULP, as reported) or, if the float had landed at
2.5000000000000004, rejects a perfectly correct allocation. floor/ceil is exact integer
arithmetic with no tolerance to tune and no ULP to depend on: it says "2 or 3 are both
faithful roundings of 2.5, anything else is not", which is the actual mathematical claim.

I probed its discriminating power rather than asserting it has some:

```
G  2 accept  G  3 accept  G  1 REJECT  G  4 REJECT
NF 10 accept NF  9 accept NF  8 REJECT NF 11 REJECT
MD  5 accept MD  4 accept MD  3 REJECT
OA  5 accept OA  4 accept OA  6 REJECT
NBT 8 accept NBT 9 accept NBT 7 REJECT
```

Exactly the two admissible roundings at every domain, everything else rejected — including
at Geometry, where the old guard had effectively none. It is deliberately *not* tighter
than that: the sibling `toEqual({ OA: 5, NBT: 8, NF: 10, MD: 5, G: 2 })` pins the exact
allocation, and this loop is the independent re-derivation from `domainWeight()`, so its
job is to catch an allocation that is not a rounding of the bands at all. Both were
mutation-checked together (`G: 4, NF: 8`) and both went red.

Taking the point behind the ruling: a guard that clears by 4×10⁻¹⁶ is a guard that reads
as tested and is not, and the substring check that admitted "Fractions are 3% of the test"
is the same failure dressed differently. Reported-Minor was the wrong call on my part.

## Verification

- `npx vitest run src/components/FirstRunScreen.test.tsx src/curriculum/grade4/grade4.test.ts`
  — 2 files, 15 tests, all passing (FirstRunScreen 5 → 6 tests).
- Whole suite: **60 files, 637 tests, 0 failures** (was 636; +1 for the new pin).
- `npx tsc -b --noEmit` — `TypeScript: No errors found`.
- **`npm run lint` — exit code 1**, 7 warnings, all in `ProgressContext.tsx`,
  `QuizResults.tsx` and `WeakSpotsView.tsx`, none of which this task has touched.
  Pre-existing and unchanged. **Not 0.** (My first report said "five pre-existing
  warnings" from a truncated `tail`; the count is 7. Correcting it rather than repeating
  it — same class of error as the "156 item references" miscount, which was 151.)

## Files changed in this round

```
src/components/FirstRunScreen.tsx       | +8 -1   (default grade)
src/components/FirstRunScreen.test.tsx  | +22     (the pin)
src/curriculum/grade4/grade4.test.ts    | +12 -4  (floor/ceil guard)
```
