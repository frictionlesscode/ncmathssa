# Task 1-3 Report

## Task 1: Quizzes become curriculum data

**What changed and why:** Moved `src/data/quizzes.ts` to `src/curriculum/grade5/quizzes.ts`, renamed `STATIC_QUIZZES` to `GRADE_5_QUIZZES`, added `quizzes: QuizDefinition[]` to `GradeCurriculum` in `src/curriculum/types.ts`, wired `GRADE_5_QUIZZES` into `GRADE_5.quizzes` in `src/curriculum/grade5/index.ts`, and rewired `src/components/Dashboard.tsx` and `src/components/QuizzesListView.tsx` to read `curriculum.quizzes` instead of importing the static constant. This makes quiz definitions per-grade so a future Grade 4 profile never gets served Grade 5 question IDs.

**Failing test message (Step 2, as expected):**
```
TypeError: c.quizzes is not iterable
 ❯ src/curriculum/integrity.test.ts:40:28
TypeError: Cannot read properties of undefined (reading 'some')
 ❯ src/curriculum/integrity.test.ts:48:24
```

**Deviations from the brief:**
- `src/App.tsx` was not in the brief's file list but imports `createAdaptiveSessionDrill`, `createMissedQuestionsDrill`, `createStandardDrill`, and `getQuizById` from `./data/quizzes`. Since the file moved, this import path had to be updated to `./curriculum/grade5/quizzes` or the build would break. Updated it.
- The brief's exact test snippet (`c.source.authoredFor(s.code).map((r) => r.id)`) does not typecheck: `authoredFor` returns `QuestionRef[]`, a union where only the `'authored'` branch has `.id`. Fixed by casting, matching the existing pattern already used in `createStandardDrill` in the same quizzes module: `.map((r) => (r as { kind: 'authored'; id: string }).id)`.
- `src/curriculum/registry.test.ts` (not in the brief's file list) constructs a bare `GradeCurriculum` test fixture (`evenCurriculum`) that needed a new `quizzes: []` field added to satisfy the type after the interface change; otherwise `tsc -b --noEmit` fails.

**Final results:** 276/276 tests passing, `npm run lint` exit 0 (only pre-existing warnings, no errors), `npx tsc -b --noEmit` exit 0. Verified `grep -rn "data/quizzes\|STATIC_QUIZZES" src/` returns nothing. Committed as `045f4d6`.

---

## Task 2: Study guides become curriculum data

**What changed and why:** Moved the `StudyGuideSection` interface out of `src/data/studyGuides.ts` into `src/types/index.ts` (exported), moved the data file to `src/curriculum/grade5/studyGuides.ts` renaming `STUDY_GUIDES` to `GRADE_5_STUDY_GUIDES`, extended the `GradeCurriculum` import in `src/curriculum/types.ts` to `import type { QuizDefinition, StudyGuideSection } from '../types';` (single import line, per instructions) and added `studyGuides: Record<StandardCode, StudyGuideSection>`. Wired the data into `GRADE_5.studyGuides` in `src/curriculum/grade5/index.ts`, and rewired `src/components/StudyGuideModal.tsx` to read `curriculum.studyGuides[standardCode]` using the `curriculum` already destructured from `useProgress()` on line 18.

**Failing test message (Step 2, as expected):**
```
TypeError: Cannot convert undefined or null to object
 ❯ src/curriculum/integrity.test.ts:54:42 (Object.entries(c.studyGuides))
TypeError: Cannot read properties of undefined (reading 'NC.5.NF.1')
 ❯ src/curriculum/integrity.test.ts:63:18 (c.studyGuides[code])
```

**Deviations from the brief:**
- Same `registry.test.ts` fixture needed a further `studyGuides: {}` added after Task 1's `quizzes: []`, again due to the interface growing and not being in the brief's file list.
- After moving the file, `src/data/` was empty; removed the directory with `rmdir` as instructed (Step 8).

**Final results:** 278/278 tests passing, lint exit 0, `tsc -b --noEmit` exit 0. Verified `grep -rn "data/studyGuides\|STUDY_GUIDES\b" src/` returns nothing, and `src/data` no longer exists. Committed as `0e65e75`.

---

## Task 3: Registry-driven misconception and weighting tests

**What changed and why:** Rewrote `src/curriculum/misconceptions.test.ts` to derive `allUsedTags()` from `listCurricula()`/`standardsOf()`/`c.source.authoredFor()`/`c.source.resolve()`/`c.source.templates()` instead of importing `GRADE_5_AUTHORED`/`GRADE_5_TEMPLATES` by name, so a newly-registered grade's tags are picked up automatically. Added a `templates(): QuestionTemplate[]` method to the `QuestionSource` interface and its implementation in `src/engine/questionSource.ts` (returning the existing closed-over `templates` array; `QuestionTemplate` was already imported at the top, no duplicate added). Added three new assertions to `src/curriculum/integrity.test.ts`: domain weights total 100, weight-group members cite one shared band and are labelled, and grades below 3 claim no official blueprint. Added `domainWeight` to the `./registry` import in `integrity.test.ts`.

**Failing test / verification step:** Per the brief, Step 3 (`npx vitest run src/curriculum/misconceptions.test.ts`) is expected to PASS immediately with Grade 5 alone registered, finding the same tag set as before — this is not a TDD-red step, it's a regression check that the registry-driven rewrite is behavior-preserving. Ran it and it passed with 3/3 tests immediately, confirming no regression. The weighting assertions added to `integrity.test.ts` in Step 4 likewise passed immediately (the underlying `domainWeight`/`weightLabel`/domain data already existed and satisfy the invariants) — there was no failing-test step described for that part in the brief, and none was needed since nothing to implement changes any runtime code path.

**What the brief got wrong / notable findings:** Nothing incorrect found — all file paths, existing exports (`QuestionTemplate` already imported in `questionSource.ts`), and code snippets in this brief matched the repository exactly.

**Final results:** 281/281 tests passing (comes from 278 + 3 new weighting/blueprint assertions across the single Grade 5 `describe.each` block), lint exit 0, `tsc -b --noEmit` exit 0. Committed as `ad03d11`.

---

## Summary across all three tasks

- Baseline was 274/274. Final: 281/281 passing.
- No network APIs (`fetch`, `XMLHttpRequest`, `sendBeacon`, `WebSocket`) were added anywhere.
- No NC standard codes or blueprint weights were invented; only existing data was relocated and referenced through the registry.
- Three commits, in order: `045f4d6`, `0e65e75`, `ad03d11`.
- The only real deviations from the briefs were (a) fixing `src/App.tsx`'s import path after the quizzes-file move (not listed in Task 1's brief but required for the app to build), (b) a type-cast fix in the Task 1 integrity test to satisfy `QuestionRef`'s discriminated union, and (c) adding the new `quizzes`/`studyGuides` fields to the `registry.test.ts` fixture object (not listed in either brief's file list) to keep `tsc -b --noEmit` clean.
