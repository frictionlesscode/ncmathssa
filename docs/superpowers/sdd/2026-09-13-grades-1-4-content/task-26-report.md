# Task 26 Report: Register Grade 1 and close out the plan

## What was built

- `src/curriculum/grade1/index.ts` — the `GRADE_1: GradeCurriculum` module,
  in the shape of Grade 2's: `grade: 1`, `label: 'Grade 1 Mathematics'`,
  `ssa: { passingPercent: 80, targetsGrade: 1 }`,
  `weighting: { kind: 'even-by-standard-count' }` (with the same explanatory
  comment as Grade 2), `contentComplete: true`, and the four content fields
  wired to `GRADE_1_DOMAINS`, `GRADE_1_STUDY_GUIDES`, `GRADE_1_QUIZZES`, and
  a `makeQuestionSource(GRADE_1_AUTHORED, GRADE_1_TEMPLATES)`.
- `src/curriculum/grade1/quizzes.ts` — `GRADE_1_QUIZZES`: a diagnostic
  (`g1-diagnostic-01`, 23 items, 30-minute limit), four module drills
  (`g1-mod-oa-01`, `g1-mod-nbt-01`, `g1-mod-md-01`, `g1-mod-g-01`), and a
  20-item mock assessment (`g1-mock-ssa-01`) allocated proportionally to
  each domain's share of the 23 standards.
- `src/curriculum/grade1/grade1.test.ts` — the grade's own test suite,
  mirroring `grade2.test.ts`, plus the cross-grade "completes the set" test.
- `src/curriculum/registry.ts` — added `1: GRADE_1` to `CURRICULA`.
- `src/curriculum/registry.test.ts` — updated per rulings 26-2/26-3 (below).
- `src/components/FirstRunScreen.test.tsx` — updated its grade-options pin
  (Ruling 21-9: "this pin moves as each grade registers"), which broke on
  the first full-suite run after registration and was fixed in scope, since
  finalizing the registry is exactly what this task does.
- `README.md` — updated to describe Grades 1–5 honestly (see below).
- `docs/superpowers/specs/2026-09-11-multi-grade-adaptive-math-design.md`
  §13 — recorded the process finding (Ruling 26-5).

## How each ruling was met

- **26-1** (`startsWith('g1-')`): `grade1.test.ts`'s item-id test asserts
  `id.startsWith('g1-')` for every quiz item, not `g1.`. All shipped Grade 1
  authored ids already use the hyphen form (`g1-oa1-01`, etc.), matching
  every prior grade's convention.
- **26-2** (`registry.test.ts` final value `[1,2,3,4,5]`): `'lists only
  grades that actually have modules'` now asserts
  `listCurricula().map((c) => c.grade)).toEqual([1, 2, 3, 4, 5])`.
- **26-3** (keep the throw test, repointed): `'throws for a grade with no
  curriculum module'` now asserts
  `expect(() => getCurriculum(6 as Grade)).toThrow(/no curriculum/i)`, with
  a comment explaining the cast simulates a future grade whose module does
  not exist yet, and why the test is kept rather than deleted.
- **26-4 / controller's generator-floor ruling** (name the exact 14
  standards, not a raise-the-floor number): `grade1.test.ts` has
  `'ships templates on exactly the expected 14 standards'`, which computes
  `standardsOf(GRADE_1).filter((s) => GRADE_1.source.hasGenerator(s.code))`
  and asserts it equals, sorted, exactly:
  `NC.1.OA.1, OA.2, OA.6, OA.8, OA.9` (5), all seven `NC.1.NBT.1`–`NBT.7`
  (7), and `NC.1.MD.2, MD.4` (2) — 14 total. I checked this against the
  real `GRADE_1_TEMPLATES` list in `templates/index.ts` before writing the
  test: the real generator-backed set matches the controller's list
  exactly, no difference to report.
- **26-5** (record the process finding in spec §13): appended two
  paragraphs to §13 — one restating the "machine-checked standards/weights
  vs. not-machine-checked authored-item correctness" sentence verbatim in
  substance, and one naming the specific classes the rulings caught
  (`NC.4.NBT.7`'s invented rounding standard, Grade 3's `NC.3.MD.2`
  customary/metric error, and Grade 1's three code swaps: `NC.1.OA.6`↔`OA.9`,
  `NC.1.NBT.1`↔`NBT.7`, `NC.1.MD.3`↔`MD.5`), noting that none of these is
  detectable by any test in the suite and that `standards.ts` was the only
  authority that caught them.
- **26-6** (every quiz `questionId` is an authored id, never a template
  id): `grade1.test.ts` has a dedicated test,
  `'references only AUTHORED item ids in its quizzes, never a template
  id'`, that builds the authored-id set via
  `GRADE_1.source.authoredFor(s.code)` (exactly how
  `integrity.test.ts` resolves quiz ids) and checks every quiz's
  `questionIds` against it. All quiz ids I wrote use `-01`/`-02` authored
  suffixes; none reference a template id (which would use a dot, e.g.
  `g1.oa1.compare-difference`).

## Quiz composition

All ids are Grade 1 authored items (hyphen form). Standard order follows
`standards.ts`'s own domain arrays (OA: 1,2,3,4,9,6,7,8; NBT: 1,7,2,3,4,5,6;
MD: 1,2,3,5,4; G: 1,2,3).

**`g1-diagnostic-01`** (23 items, one `-01` item per standard, 30 min):
one item each from OA.1, OA.2, OA.3, OA.4, OA.9, OA.6, OA.7, OA.8 (8);
NBT.1, NBT.7, NBT.2, NBT.3, NBT.4, NBT.5, NBT.6 (7); MD.1, MD.2, MD.3,
MD.5, MD.4 (5); G.1, G.2, G.3 (3).

**`g1-mod-oa-01`** (26 items, 20 min): every authored OA item —
OA.1(3), OA.2(3), OA.3(3), OA.4(3), OA.9(3), OA.6(4), OA.7(4), OA.8(3).

**`g1-mod-nbt-01`** (21 items, 20 min): every authored NBT item — 3 items
per each of the 7 NBT standards.

**`g1-mod-md-01`** (18 items, 15 min): every authored MD item —
MD.1(3), MD.2(3), MD.3(4), MD.5(4), MD.4(4).

**`g1-mod-g-01`** (12 items, 10 min): every authored G item — G.1(4),
G.2(4), G.3(4).

**`g1-mock-ssa-01`** (20 items, 20 min, all `-02` ids so nothing re-scores
the diagnostic's `-01` items): allocated to each domain's share of the 23
standards (`domainWeight`'s even-by-standard-count branch):
- OA 8/23 = 34.8% → 6.96 of 20 → rounds to **7** (one item each from 7 of
  8 OA standards: OA.1, OA.2, OA.3, OA.4, OA.9, OA.6, OA.8 — OA.7 skipped).
- NBT 7/23 = 30.4% → 6.09 of 20 → rounds to **6** (6 of 7 NBT standards:
  NBT.1, NBT.7, NBT.2, NBT.4, NBT.5, NBT.6 — NBT.3 skipped).
- MD 5/23 = 21.7% → 4.35 of 20 → rounds to **4** (4 of 5 MD standards:
  MD.2, MD.3, MD.5, MD.4 — MD.1 skipped).
- G 3/23 = 13.0% → 2.61 of 20 → rounds to **3** (all 3 G standards).
- 7 + 6 + 4 + 3 = 20 exactly; every domain's count falls within
  `[floor(ideal), ceil(ideal)]` of its `domainWeight` share, and G never
  rounds to zero.

## Privacy grep (Step 5)

```
grep -rn "fetch(\|XMLHttpRequest\|sendBeacon\|WebSocket\|navigator.send\|analytics\|gtag" src/
```

Output: **none.** The constraint that nothing leaves the browser holds
after this task's additions.

## Test / lint / tsc / build results

- `npm test -- --run`: **1624/1624 passed** (147 test files), up from the
  1597/1597 baseline. The delta is Grade 1's new 15-test file plus the
  registry-driven tests now running a fifth time, minus no removals.
- `npm run lint`: **0 errors.** Only pre-existing warnings unrelated to
  this task (react-hooks purity/fast-refresh warnings in
  `AdaptiveSessionCard.test.tsx`, `WeakSpotsView.tsx`, `ProgressContext.tsx`,
  and an unused catch parameter in `QuizResults.tsx` — none touched here).
- `npx tsc -b --noEmit`: clean, no output.
- `npm run build`: succeeds (`tsc -b && vite build`), same pre-existing
  "chunk larger than 500kB" advisory as before, unrelated to this change.

## TDD evidence

**RED** — `npx vitest run src/curriculum/grade1/grade1.test.ts` before any
implementation files existed:
```
FAIL src/curriculum/grade1/grade1.test.ts
Error: Failed to resolve import "./index" from
"src/curriculum/grade1/grade1.test.ts". Does the file exist?
```

**GREEN** — after adding `quizzes.ts`, `index.ts`, and registering
`GRADE_1` in `registry.ts`:
```
✓ src/curriculum/registry.test.ts (21 tests)
✓ src/curriculum/grade1/grade1.test.ts (15 tests)
Test Files  2 passed (2)
     Tests  36 passed (36)
```

One test elsewhere then went RED on the first full-suite run —
`FirstRunScreen.test.tsx`'s `'offers only grades that have a curriculum'`,
pinned to `['2','3','4','5']` — because it hard-coded the pre-Task-26
registered set (exactly what Ruling 21-9's own comment predicted: "this pin
moves as each grade registers"). Fixed and reverified GREEN in the full
1624/1624 run above.

## Files changed

- `src/curriculum/grade1/grade1.test.ts` (new)
- `src/curriculum/grade1/index.ts` (new)
- `src/curriculum/grade1/quizzes.ts` (new)
- `src/curriculum/registry.ts` (modified — registered `GRADE_1`)
- `src/curriculum/registry.test.ts` (modified — rulings 26-2, 26-3)
- `src/components/FirstRunScreen.test.tsx` (modified — grade-options pin)
- `README.md` (modified — Grades 1–5 honesty pass)
- `docs/superpowers/specs/2026-09-11-multi-grade-adaptive-math-design.md`
  (modified — §13 process finding, ruling 26-5)

Commit: `4bdd2ff` on `feat/multi-grade-adaptive` — "feat: register grade 1,
completing grades 1-5".

## Concerns

- None found in the generator-floor check: the real `GRADE_1_TEMPLATES` set
  matches the controller's named 14 standards exactly, so nothing to
  report there.
- The README pass was kept deliberately small per the controller's
  instruction: I updated the title, the "current scope" paragraph, the
  "Honest Blueprint" bullet, the architecture bullet's stale "(currently
  only `grade5/`)" parenthetical, and retitled/rewrote the "Roadmap: Grades
  1–4" section (now stale — all grades ship) as a "Status" section. I did
  NOT rewrite the "Program Structure: 5 Domains & 17 Standards (Grade 5)"
  section or the "Core Application Features" section, both of which still
  read as Grade-5-specific narrative (blueprint percentages, 17-standard
  counts, above-grade stretch questions into 6th grade). Those sections
  are still factually true of Grade 5 specifically and are flagged in the
  new intro paragraph as "written against Grade 5 first... but the same
  structure now backs Grades 1–4 as well" rather than being expanded
  grade-by-grade, to keep the change small as instructed. If the owner
  wants each domain/standard table itemized per grade in the README, that
  is a larger doc task, not part of this one.
- Step 6 (the browser check) was explicitly skipped per the controller's
  instruction; the controller runs it after this commit.
