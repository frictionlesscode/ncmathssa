# Grades 1–4 Curriculum Content Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship Grades 1, 2, 3, and 4 as fully playable curricula — sourced standards, authored multiple-choice items with engineered distractors, seeded generators, study guides, and static quizzes — so the app serves every elementary grade instead of only Grade 5.

**Architecture:** Grade 5 already proves the shape: a `GradeCurriculum` module registered in `src/curriculum/registry.ts`, feeding domains, standards, weights, and a `QuestionSource` to components that read the active curriculum from context. Two data modules (`src/data/quizzes.ts`, `src/data/studyGuides.ts`) never made that move and are still Grade 5 globals; they become curriculum fields first. Then each new grade is built as a directory of per-domain content files, registered only once its every standard has content.

**Tech Stack:** React 19, TypeScript ~6.0.2, Vite 8, Tailwind 4, Vitest 3 + jsdom + @testing-library/react, fast-check, oxlint.

**Spec:** `docs/superpowers/specs/2026-09-11-multi-grade-adaptive-math-design.md`

## Global Constraints

- **Rounding is not in NC's grades 1–5 mathematics standards.** CCSS has it at 4.NBT.A.3; North Carolina's revised NCSCOS does not, at any grade in this plan. This plan named `NC.4.NBT.7` "rounding" in its first draft — that came from model recall, not from the source, and the Grade 4 Base Ten implementer caught it by reading the sourced text instead of the brief. `NC.4.NBT.7` is comparison with `>`, `=` and `<`. When a brief and `standards.ts` disagree, **`standards.ts` wins** — it is transcribed from the published document and this plan is not.
- **Never invent an NC standard code, a standard's text, or a blueprint weight.** Every code and every domain weight in this plan comes from `docs/sources/nc-standards-1-5.json` and `docs/sources/nc-eog-blueprint.json`, transcribed from published NCDPI documents and described in `docs/sources/PROVENANCE.md`. Tests assert the TypeScript against those JSON files. If a value you need is not in them, stop and say so — do not supply it from memory.
- **Codes, weights, and `ssa` figures are three separate claims against three documents** (spec §5.3). Verifying one does not verify another.
- **Grades 1–2 have no NCDPI blueprint** — no EOG exists below grade 3. Their `weighting` is `{ kind: 'even-by-standard-count' }` and their UI must not imply an official weight exists.
- **Grades 3–5 weight Measurement & Data together with Geometry as one band.** Both domains carry the same `officialWeightRange` and `officialWeightMidpoint` plus `weightGroup: 'MD+G'` and `weightGroupLabel: 'Measurement & Data and Geometry combined'`. Any total must be computed through `domainWeight()`, never by adding raw midpoints.
- **`ssa: { passingPercent: 80, targetsGrade: N }`** for every grade. 80% is the WCPSS Single Subject Acceleration qualifying bar; the owner has confirmed it applies at each grade, and practice targets 100% mastery regardless.
- **Every question is multiple choice with exactly four options** (spec §4.1) — the NC EOG and the CASE assessment used for SSA are multiple choice.
- **Every incorrect option carries a `misconception` tag naming the specific error that produces it.** Never a filler number. `labelOptions()` throws if a wrong option has no tag.
- **Every misconception tag must be declared in `src/curriculum/misconceptions.ts`** with a family and a one-sentence description addressed to a parent, and every declared tag must be used by some content — `misconceptions.test.ts` fails in both directions. That check reads **all content on disk, registered or not** (`src/curriculum/allContent.ts`), so a content task may freely declare a new tag long before its grade registers. **Never reuse a tag that names a different error just to avoid declaring one** — a mis-filed tag tells a parent their child made a mistake they did not make, which is worse than no tag at all.
- **The app makes zero network calls.** Users are children; nothing leaves the browser (COPPA). No `fetch`, `XMLHttpRequest`, `sendBeacon`, `WebSocket`, or analytics import may enter the codebase.
- **`contentComplete: true` is flipped only when every standard in the grade has at least one authored item or template**, and a grade is registered in `registry.ts` only in the same task that flips it.
- Commit with the repo-local no-reply identity already configured. End every commit message with:

      Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>
      Claude-Session: https://claude.ai/code/session_01H1td136Jg4sYcrRxZDFbg1

- Verification gate for every task: `npm run lint` exits 0, `npx tsc -b --noEmit` is clean, and `npm test -- --run` is fully green. A task is not done with a red suite.

---

## The Content Contract

Tasks 5–26 all author curriculum content. They differ only in which grade and domain they cover; the contract below binds all of them and is not repeated in each task.

### Authored items

Each authored file exports `const GRADE_<N>_<DOMAIN>_AUTHORED: Question[]`, typed from `src/engine/questionModel.ts`, built with `labelOptions()`. Per standard, **at least three items**: one at `difficulty: 'mastery'`, one at `'advanced'`, and at least one more at either. Item ids follow the Grade 5 convention — the standard's tail, lowercased, then a two-digit ordinal, prefixed by grade for every grade except 5: `g4-nf1-01`, `g3-oa7-02`. The separator after the grade prefix is a HYPHEN, not a dot — this sentence said `g4.nf1-01` until Task 9-11 pre-flight found all 84 committed Grade 4 ids using the hyphen and a Task 11 test asserting the dot, which could not have passed. (Grade 5's existing ids stay bare — `nf1-01` — and must not be renamed.)

Every item needs:

- `prompt` — the question. `promptDetails` for an expression, a table, or a figure description.
- Four `options`; the correct one at a varied position, never always A.
- Each incorrect option: the value a student actually reaches by making one named error, with that error as its `misconception` tag and a `//` comment above it showing the arithmetic that produces it.
- `explanation.stepByStep` — the worked solution, the last step stating the answer.
- `explanation.conceptSummary` — one or two sentences on the underlying idea.
- `explanation.commonMisconception` — the trap, in a sentence.
- `calculatorAllowed`, `isStretch`, `difficulty`.

**Age-appropriateness is part of correctness.** A Grade 1 item's prompt must be readable by a six-year-old: short sentences, numbers within the standard's stated range, no multi-clause setups. A Grade 1 or 2 item may not require reading a paragraph to find the arithmetic.

### Templates (seeded generators)

A standard whose practice value comes from fresh numbers gets a template in `src/curriculum/grade<N>/templates/<domain-tail>-<slug>.ts` exporting a `QuestionTemplate`. Reasoning standards, classification standards, and multi-step word problems stay authored — there the wording carries the mathematics.

Every template must be deterministic in its seed, emit exactly four options with distinct texts at **every** seed, and pass `assertTemplateSound()` from `src/engine/templateTesting.ts` at 300 runs. Where two distractor formulas could collide at some seeds, exclude the colliding parameters by construction and document the algebra in a file comment, as `md5-prism-volume.ts` does — do not paper over it by resampling in a loop.

### Study guides

Each grade exports `const GRADE_<N>_STUDY_GUIDES: Record<string, StudyGuideSection>` keyed by standard code, one entry per standard, shaped by the `StudyGuideSection` interface. `whyItMattersForSSA` must cite a real figure — the domain's blueprint band for grades 3–5, or the domain's share of the grade's standards for grades 1–2 — and never a weight for a single domain inside a combined band.

### Tests

Every authored file gets a sibling `.test.ts` asserting, over that file's items: unique ids, exactly one correct option each, four options each, every wrong option tagged, every `standardCode` belonging to this grade's domain, and each standard in the domain having its floor of three items. Every template gets a sibling `.test.ts` calling `assertTemplateSound()` plus at least two fixed-seed tests pinning a known question and its correct answer.

---

## File Structure

**Moved (Tasks 1–2):**

- `src/data/quizzes.ts` → `src/curriculum/grade5/quizzes.ts` (export renamed `GRADE_5_QUIZZES`)
- `src/data/studyGuides.ts` → `src/curriculum/grade5/studyGuides.ts` (export renamed `GRADE_5_STUDY_GUIDES`; the `StudyGuideSection` interface moves to `src/types/index.ts`)

**Per grade N in {1,2,3,4}, under `src/curriculum/grade<N>/`:**

- `standards.ts` — `GRADE_<N>_DOMAINS: DomainInfo[]`, the sourced codes and weights
- `standards.test.ts` — asserts the module against the two source JSON files
- `authored.oa.ts`, `authored.nbt.ts`, `authored.nf.ts` (grades 3–4 only), `authored.md.ts`, `authored.g.ts` — one per domain, each with a sibling test
- `authored.ts` — a thin aggregator concatenating the per-domain arrays
- `templates/` — one file per generator plus `index.ts` aggregating them
- `studyGuides.ts` — `GRADE_<N>_STUDY_GUIDES`
- `quizzes.ts` — `GRADE_<N>_QUIZZES`
- `index.ts` — the `GradeCurriculum` export

Splitting authored content per domain keeps each file near Grade 5's per-domain size instead of reproducing its 1,438-line monolith.

---

# Batch A — Make the shell grade-agnostic

Three preconditions. Until these land, registering a second grade ships wrong content to a child: `Dashboard.tsx:38` would offer a Grade 4 student Grade 5's diagnostic, and `StudyGuideModal` would open Grade 5's guides.

### Task 1: Quizzes become curriculum data

**Files:**

- Create: `src/curriculum/grade5/quizzes.ts` (moved from `src/data/quizzes.ts`)
- Delete: `src/data/quizzes.ts`
- Modify: `src/curriculum/types.ts` (add `quizzes` to `GradeCurriculum`)
- Modify: `src/curriculum/grade5/index.ts`
- Modify: `src/components/Dashboard.tsx:14,38,39,292`
- Modify: `src/components/QuizzesListView.tsx:12,39,40,41`
- Modify: `src/curriculum/grade5/authored.test.ts:5,95`
- Test: `src/curriculum/integrity.test.ts`

**Interfaces:**

- Consumes: `GradeCurriculum`, `QuizDefinition` from `src/types/index.ts`, `useProgress()` from `src/context/ProgressContext.tsx`.
- Produces: `GradeCurriculum.quizzes: QuizDefinition[]`; `GRADE_5_QUIZZES` exported from `src/curriculum/grade5/quizzes.ts`. Tasks 10, 15, 20, 25 each add a `quizzes` field to their grade's module.

- [ ] **Step 1: Write the failing test**

Append to `src/curriculum/integrity.test.ts`, inside the existing `describe.each` callback:

```ts
    it('defines quizzes that only reference this grade\'s own questions', () => {
      const ids = new Set(
        standardsOf(c).flatMap((s) => c.source.authoredFor(s.code).map((r) => r.id)),
      );
      for (const quiz of c.quizzes) {
        for (const qid of quiz.questionIds) {
          expect(ids.has(qid), `quiz ${quiz.id} references unknown question ${qid}`).toBe(true);
        }
      }
    });

    it('gives every grade at least a diagnostic', () => {
      expect(c.quizzes.some((q) => q.isDiagnostic), `grade ${c.grade} has no diagnostic`).toBe(true);
    });
```

- [ ] **Step 2: Run it and watch it fail**

Run: `npx vitest run src/curriculum/integrity.test.ts`
Expected: FAIL — `c.quizzes` is `undefined`, so `c.quizzes.some` throws.

- [ ] **Step 3: Add the field to the type**

In `src/curriculum/types.ts`, import `QuizDefinition` and add to `GradeCurriculum`, after `domains`:

```ts
  /** The grade's static quizzes: its diagnostic, module drills, and mock
   *  assessments. Per-grade because their questionIds name that grade's own
   *  authored items — a Grade 5 quiz served to a Grade 4 profile is a blank
   *  screen (spec 5.4). */
  quizzes: QuizDefinition[];
```

Add at the top of the file: `import type { QuizDefinition } from '../types';`

- [ ] **Step 4: Move the file**

```bash
git mv src/data/quizzes.ts src/curriculum/grade5/quizzes.ts
```

In the moved file, rename the export `STATIC_QUIZZES` → `GRADE_5_QUIZZES` and fix the now-shallower relative imports:

```ts
import type { QuizDefinition } from '../../types';
import type { GradeCurriculum } from '../types';
import { standardsOf } from '../registry';
import type { QuestionRef } from '../../engine/questionModel';
import { questionRefId } from '../../engine/questionModel';
```

- [ ] **Step 5: Wire it into the Grade 5 curriculum**

In `src/curriculum/grade5/index.ts`, add `import { GRADE_5_QUIZZES } from './quizzes';` and add `quizzes: GRADE_5_QUIZZES,` to the `GRADE_5` object after `domains`.

- [ ] **Step 6: Rewire the two components**

In `src/components/Dashboard.tsx`, delete the `STATIC_QUIZZES` import and read from the curriculum already destructured on line 33:

```ts
  const diagnosticQuiz = curriculum.quizzes.find(q => q.isDiagnostic);
  const mockQuiz = curriculum.quizzes.find(q => q.id === 'mock-ssa-01');
```

and at line 292: `const drillQuiz = curriculum.quizzes.find(q => q.domainId === domain.id);`

In `src/components/QuizzesListView.tsx`, delete the import and replace the three reads with `curriculum.quizzes.…`, taking `curriculum` from the `useProgress()` call already on line 28.

In `src/curriculum/grade5/authored.test.ts`, change the import to `import { GRADE_5_QUIZZES } from './quizzes';` and line 95 to use `GRADE_5_QUIZZES`.

- [ ] **Step 7: Run the suite**

Run: `npm test -- --run`
Expected: PASS, including the two new integrity tests.

- [ ] **Step 8: Verify nothing still imports the old path**

Run: `grep -rn "data/quizzes\|STATIC_QUIZZES" src/`
Expected: no output.

- [ ] **Step 9: Lint, typecheck, commit**

```bash
npm run lint && npx tsc -b --noEmit
git add -A
git commit -m "refactor: make static quizzes per-grade curriculum data"
```

---

### Task 2: Study guides become curriculum data

**Files:**

- Create: `src/curriculum/grade5/studyGuides.ts` (moved from `src/data/studyGuides.ts`)
- Delete: `src/data/studyGuides.ts`
- Modify: `src/types/index.ts` (receives the `StudyGuideSection` interface)
- Modify: `src/curriculum/types.ts`
- Modify: `src/curriculum/grade5/index.ts`
- Modify: `src/components/StudyGuideModal.tsx:3,22`
- Test: `src/curriculum/integrity.test.ts`

**Interfaces:**

- Consumes: `GradeCurriculum`, `StandardCode`.
- Produces: `GradeCurriculum.studyGuides: Record<StandardCode, StudyGuideSection>`; `StudyGuideSection` exported from `src/types/index.ts`; `GRADE_5_STUDY_GUIDES` from `src/curriculum/grade5/studyGuides.ts`. Tasks 10, 15, 20, 25 each supply their grade's record.

- [ ] **Step 1: Write the failing test**

Append inside the same `describe.each` callback in `src/curriculum/integrity.test.ts`:

```ts
    it('keys every study guide to a standard of this grade', () => {
      for (const [code, guide] of Object.entries(c.studyGuides)) {
        expect(codes.has(code), `study guide ${code} is not a grade ${c.grade} standard`).toBe(true);
        expect(guide.standardCode, `study guide ${code} disagrees with its own key`).toBe(code);
      }
    });

    it('writes a study guide for every standard when content-complete', () => {
      if (!c.contentComplete) return;
      for (const code of codes) {
        expect(c.studyGuides[code], `grade ${c.grade} has no study guide for ${code}`).toBeTruthy();
      }
    });
```

- [ ] **Step 2: Run it and watch it fail**

Run: `npx vitest run src/curriculum/integrity.test.ts`
Expected: FAIL — `Object.entries(undefined)` throws.

- [ ] **Step 3: Move the interface to the shared types module**

Cut the `StudyGuideSection` interface (lines 1–14 of `src/data/studyGuides.ts`) and paste it into `src/types/index.ts`, exported.

- [ ] **Step 4: Add the field to the type**

In `src/curriculum/types.ts`, extend the existing `import type { QuizDefinition } from '../types';` to `import type { QuizDefinition, StudyGuideSection } from '../types';` and add to `GradeCurriculum`:

```ts
  /** Standard-by-standard revision notes, keyed by code. Per-grade for the
   *  same reason quizzes are: NC.5.NF.1's guide means nothing to a Grade 2
   *  student (spec 5.4). */
  studyGuides: Record<StandardCode, StudyGuideSection>;
```

- [ ] **Step 5: Move the data file**

```bash
git mv src/data/studyGuides.ts src/curriculum/grade5/studyGuides.ts
```

Rename the export `STUDY_GUIDES` → `GRADE_5_STUDY_GUIDES` and add `import type { StudyGuideSection } from '../../types';` at the top.

- [ ] **Step 6: Wire it in and rewire the modal**

In `src/curriculum/grade5/index.ts`, import `GRADE_5_STUDY_GUIDES` and add `studyGuides: GRADE_5_STUDY_GUIDES,` to the `GRADE_5` object.

In `src/components/StudyGuideModal.tsx`, delete the `STUDY_GUIDES` import and change line 22 to `const guide = curriculum.studyGuides[standardCode];` — `curriculum` is already destructured from `useProgress()` on line 18.

- [ ] **Step 7: Run the suite**

Run: `npm test -- --run`
Expected: PASS.

- [ ] **Step 8: Verify the directory is gone**

Run: `ls src/data 2>/dev/null; grep -rn "data/studyGuides\|STUDY_GUIDES\b" src/`
Expected: `src/data` no longer exists and grep returns nothing. If `src/data` is now empty, remove it.

- [ ] **Step 9: Lint, typecheck, commit**

```bash
npm run lint && npx tsc -b --noEmit
git add -A
git commit -m "refactor: make study guides per-grade curriculum data"
```

---

### Task 3: Registry-driven misconception and weighting tests

**Files:**

- Modify: `src/curriculum/misconceptions.test.ts`
- Modify: `src/curriculum/integrity.test.ts`

**Interfaces:**

- Consumes: `listCurricula()`, `standardsOf()`, `domainWeight()` from `src/curriculum/registry.ts`.
- Produces: nothing importable. Every later task inherits these assertions automatically the moment its grade is registered.

**Why:** `misconceptions.test.ts` imports `GRADE_5_AUTHORED` and `GRADE_5_TEMPLATES` by name. Left alone, a Grade 4 tag would be reported as an orphan ("declared but unused") because the test never looks at Grade 4's content — so the very test meant to keep the vocabulary honest would start producing false failures on correct work.

- [ ] **Step 1: Rewrite the tag collector over the registry**

Replace the imports and `allUsedTags` in `src/curriculum/misconceptions.test.ts` with:

```ts
import { describe, it, expect } from 'vitest';
import { MISCONCEPTIONS } from './misconceptions';
import { listCurricula, standardsOf } from './registry';
import { makeRng } from '../engine/rng';

/** Tags used anywhere in any registered grade: authored items plus every
 *  misconception a generator can emit, sampled across many seeds so a rare
 *  distractor still counts as "used." Registry-driven so a new grade's tags
 *  count the moment that grade registers. */
function allUsedTags(): Set<string> {
  const used = new Set<string>();
  for (const c of listCurricula()) {
    for (const s of standardsOf(c)) {
      for (const ref of c.source.authoredFor(s.code)) {
        for (const o of c.source.resolve(ref).options) {
          if (o.misconception) used.add(o.misconception);
        }
      }
    }
    for (const t of c.source.templates()) {
      for (let seed = 0; seed < 100; seed++) {
        for (const o of t.generate(makeRng(seed)).options) {
          if (o.misconception) used.add(o.misconception);
        }
      }
    }
  }
  return used;
}
```

- [ ] **Step 2: Expose templates through the question source**

The test above calls `c.source.templates()`, which does not exist yet — that is the failure Step 3 clears. Add to the interface in `src/engine/questionSource.ts`:

```ts
  /** Every template this source can draw from. Exposed so the misconception
   *  registry test can sample the tags generators emit; not for quiz code,
   *  which should go through itemsFor(). */
  templates(): QuestionTemplate[];
```

and to the returned object: `templates() { return templates; },`. `QuestionTemplate` is already imported in that file.

- [ ] **Step 3: Run it**

Run: `npx vitest run src/curriculum/misconceptions.test.ts`
Expected: PASS with Grade 5 alone registered — it must find exactly the same tag set as before.

- [ ] **Step 4: Add the weighting assertions to the integrity test**

Append inside the `describe.each` callback in `src/curriculum/integrity.test.ts`:

```ts
    it('totals every domain weight to 100', () => {
      const total = c.domains.reduce((sum, d) => sum + domainWeight(c, d.id), 0);
      expect(total).toBeGreaterThan(99);
      expect(total).toBeLessThan(101);
    });

    it('cites one shared band across every member of a weight group', () => {
      const groups = new Map<string, typeof c.domains>();
      for (const d of c.domains) {
        if (!d.weightGroup) continue;
        groups.set(d.weightGroup, [...(groups.get(d.weightGroup) ?? []), d]);
      }
      for (const [group, members] of groups) {
        expect(members.length, `weight group ${group} has one member`).toBeGreaterThan(1);
        const ranges = new Set(members.map((d) => d.officialWeightRange));
        expect(ranges.size, `weight group ${group} cites ${ranges.size} different bands`).toBe(1);
        for (const d of members) {
          expect(d.weightGroupLabel, `${d.id} is grouped but unlabelled`).toBeTruthy();
        }
      }
    });

    it('claims no official blueprint below grade 3', () => {
      // NCDPI publishes no EOG, and therefore no blueprint, for grades 1-2.
      if (c.grade >= 3) return;
      expect(c.weighting.kind).toBe('even-by-standard-count');
      for (const d of c.domains) {
        expect(d.weightGroup, `grade ${c.grade} domain ${d.id} claims a blueprint band`).toBeUndefined();
      }
    });
```

Add `domainWeight` to the import from `./registry`.

- [ ] **Step 5: Run the full suite**

Run: `npm test -- --run`
Expected: PASS.

- [ ] **Step 6: Lint, typecheck, commit**

```bash
npm run lint && npx tsc -b --noEmit
git add -A
git commit -m "test: drive misconception and weighting checks from the registry"
```

---

# Batch B — Sourced standards for all four grades

### Task 4: Standards data for grades 1, 2, 3, and 4

One task, four files of the same shape, all transcribed from the same two JSON sources. Batched deliberately: the work is mechanical, and the test is the same test four times.

**Files:**

- Create: `src/curriculum/grade1/standards.ts`, `src/curriculum/grade2/standards.ts`, `src/curriculum/grade3/standards.ts`, `src/curriculum/grade4/standards.ts`
- Create: `src/curriculum/sourcedStandards.test.ts`
- Read (do not modify): `docs/sources/nc-standards-1-5.json`, `docs/sources/nc-eog-blueprint.json`, `src/curriculum/grade5/standards.ts` (the shape to copy)

**Interfaces:**

- Consumes: `DomainInfo`, `StandardInfo` from `src/curriculum/types.ts`.
- Produces: `GRADE_1_DOMAINS`, `GRADE_2_DOMAINS`, `GRADE_3_DOMAINS`, `GRADE_4_DOMAINS`, each a `DomainInfo[]`. Tasks 5–26 read these for their standard lists.

**The exact standards, from `docs/sources/nc-standards-1-5.json`.** Transcribe in this order; the codes are not all in numeric order and that is how NCDPI publishes them:

| Grade | Domain | Count | Codes |
|---|---|---|---|
| 1 | OA | 8 | NC.1.OA.1, NC.1.OA.2, NC.1.OA.3, NC.1.OA.4, NC.1.OA.9, NC.1.OA.6, NC.1.OA.7, NC.1.OA.8 |
| 1 | NBT | 7 | NC.1.NBT.1, NC.1.NBT.7, NC.1.NBT.2, NC.1.NBT.3, NC.1.NBT.4, NC.1.NBT.5, NC.1.NBT.6 |
| 1 | MD | 5 | NC.1.MD.1, NC.1.MD.2, NC.1.MD.3, NC.1.MD.5, NC.1.MD.4 |
| 1 | G | 3 | NC.1.G.1, NC.1.G.2, NC.1.G.3 |
| 2 | OA | 4 | NC.2.OA.1, NC.2.OA.2, NC.2.OA.3, NC.2.OA.4 |
| 2 | NBT | 8 | NC.2.NBT.1, NC.2.NBT.2, NC.2.NBT.3, NC.2.NBT.4, NC.2.NBT.5, NC.2.NBT.6, NC.2.NBT.7, NC.2.NBT.8 |
| 2 | MD | 9 | NC.2.MD.1, NC.2.MD.2, NC.2.MD.3, NC.2.MD.4, NC.2.MD.5, NC.2.MD.6, NC.2.MD.7, NC.2.MD.8, NC.2.MD.10 |
| 2 | G | 2 | NC.2.G.1, NC.2.G.3 |
| 3 | OA | 7 | NC.3.OA.1, NC.3.OA.2, NC.3.OA.3, NC.3.OA.6, NC.3.OA.7, NC.3.OA.8, NC.3.OA.9 |
| 3 | NBT | 2 | NC.3.NBT.2, NC.3.NBT.3 |
| 3 | NF | 4 | NC.3.NF.1, NC.3.NF.2, NC.3.NF.3, NC.3.NF.4 |
| 3 | MD | 6 | NC.3.MD.1, NC.3.MD.2, NC.3.MD.3, NC.3.MD.5, NC.3.MD.7, NC.3.MD.8 |
| 3 | G | 1 | NC.3.G.1 |
| 4 | OA | 4 | NC.4.OA.1, NC.4.OA.3, NC.4.OA.4, NC.4.OA.5 |
| 4 | NBT | 6 | NC.4.NBT.1, NC.4.NBT.2, NC.4.NBT.7, NC.4.NBT.4, NC.4.NBT.5, NC.4.NBT.6 |
| 4 | NF | 6 | NC.4.NF.1, NC.4.NF.2, NC.4.NF.3, NC.4.NF.4, NC.4.NF.6, NC.4.NF.7 |
| 4 | MD | 6 | NC.4.MD.1, NC.4.MD.2, NC.4.MD.8, NC.4.MD.3, NC.4.MD.4, NC.4.MD.6 |
| 4 | G | 3 | NC.4.G.1, NC.4.G.2, NC.4.G.3 |

**The exact weights, from `docs/sources/nc-eog-blueprint.json`.** Grades 1 and 2 get none — see below.

| Grade | Domain | `officialWeightRange` | `officialWeightMidpoint` | `weightGroup` |
|---|---|---|---|---|
| 3 | OA | `'32–36%'` | 34 | — |
| 3 | NBT | `'9–13%'` | 11 | — |
| 3 | NF | `'28–32%'` | 30 | — |
| 3 | MD | `'23–27%'` | 25 | `'MD+G'` |
| 3 | G | `'23–27%'` | 25 | `'MD+G'` |
| 4 | OA | `'14–18%'` | 16 | — |
| 4 | NBT | `'25–29%'` | 27 | — |
| 4 | NF | `'30–34%'` | 32 | — |
| 4 | MD | `'23–27%'` | 25 | `'MD+G'` |
| 4 | G | `'23–27%'` | 25 | `'MD+G'` |

Every `MD+G` domain also gets `weightGroupLabel: 'Measurement & Data and Geometry combined'`. The dashes in the ranges are en dashes (`–`, U+2013), matching Grade 5 and the source document.

**Grades 1 and 2 have no published weights.** `DomainInfo` still requires `officialWeightRange` and `officialWeightMidpoint`, and `domainWeight()` ignores both when `weighting.kind` is `'even-by-standard-count'`. Set `officialWeightRange: 'No state assessment at this grade'` and `officialWeightMidpoint: 0` for every grade 1 and 2 domain, and set no `weightGroup`. The string is what the UI renders, so it must read as an honest sentence rather than a percentage.

- [ ] **Step 1: Write the failing test**

Create `src/curriculum/sourcedStandards.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import type { DomainInfo } from './types';
import sourced from '../../docs/sources/nc-standards-1-5.json';
import blueprint from '../../docs/sources/nc-eog-blueprint.json';
import { GRADE_1_DOMAINS } from './grade1/standards';
import { GRADE_2_DOMAINS } from './grade2/standards';
import { GRADE_3_DOMAINS } from './grade3/standards';
import { GRADE_4_DOMAINS } from './grade4/standards';
import { GRADE_5_DOMAINS } from './grade5/standards';

const BY_GRADE: Record<string, DomainInfo[]> = {
  '1': GRADE_1_DOMAINS,
  '2': GRADE_2_DOMAINS,
  '3': GRADE_3_DOMAINS,
  '4': GRADE_4_DOMAINS,
  '5': GRADE_5_DOMAINS,
};

// The standards a child practises are a claim about a published document.
// These tests are the only thing standing between a transcription slip and a
// child drilling a standard North Carolina does not teach at their grade.
describe.each(Object.keys(BY_GRADE))('grade %s standards match the source', (grade) => {
  const domains = BY_GRADE[grade];
  const src = (sourced as Record<string, { id: string; standards: { code: string }[] }[]>)[grade];

  it('declares exactly the sourced domains, in order', () => {
    expect(domains.map((d) => d.id).sort()).toEqual(src.map((d) => d.id).sort());
  });

  it('declares exactly the sourced codes in each domain', () => {
    for (const srcDomain of src) {
      const ours = domains.find((d) => d.id === srcDomain.id);
      expect(ours, `no ${srcDomain.id} domain`).toBeTruthy();
      expect(new Set(ours!.standards.map((s) => s.code)))
        .toEqual(new Set(srcDomain.standards.map((s) => s.code)));
    }
  });

  it('invents no standard the source does not list', () => {
    const sourcedCodes = new Set(src.flatMap((d) => d.standards.map((s) => s.code)));
    for (const d of domains) {
      for (const s of d.standards) {
        expect(sourcedCodes.has(s.code), `${s.code} appears in no NCDPI source`).toBe(true);
      }
    }
  });
});

describe.each(['3', '4', '5'])('grade %s weights match the blueprint', (grade) => {
  const domains = BY_GRADE[grade];
  const bands = (blueprint as {
    bands: Record<string, { domains: string[]; range: string; midpoint: number }[]>;
  }).bands[grade];

  it('cites the published band for every domain', () => {
    for (const band of bands) {
      for (const id of band.domains) {
        const d = domains.find((x) => x.id === id);
        expect(d, `no ${id} domain at grade ${grade}`).toBeTruthy();
        expect(d!.officialWeightRange, `${id} band`).toBe(band.range);
        expect(d!.officialWeightMidpoint, `${id} midpoint`).toBe(band.midpoint);
      }
    }
  });

  it('groups every domain that shares a band and no domain that does not', () => {
    for (const band of bands) {
      for (const id of band.domains) {
        const d = domains.find((x) => x.id === id)!;
        if (band.domains.length > 1) {
          expect(d.weightGroup, `${id} shares a band but is ungrouped`).toBeTruthy();
          expect(d.weightGroupLabel).toBeTruthy();
        } else {
          expect(d.weightGroup, `${id} has its own band but is grouped`).toBeUndefined();
        }
      }
    }
  });
});

describe.each(['1', '2'])('grade %s claims no blueprint', (grade) => {
  it('cites no percentage, because NCDPI publishes none below grade 3', () => {
    for (const d of BY_GRADE[grade]) {
      expect(d.officialWeightRange).not.toMatch(/%/);
      expect(d.weightGroup).toBeUndefined();
    }
  });
});
```

- [ ] **Step 2: Run it and watch it fail**

Run: `npx vitest run src/curriculum/sourcedStandards.test.ts`
Expected: FAIL — the four `grade<N>/standards.ts` modules do not exist.

The JSON imports need no config change — this was probed on 2026-09-13 against the real repo, and `vitest run`, `tsc -b --force --noEmit`, and `oxlint` all accept a test under `src/` importing `../../docs/sources/*.json` as it stands. If you find otherwise, say so rather than copying the JSON into `src/`: one source of truth is the whole point of this test.

- [ ] **Step 3: Write the four standards modules**

For each grade, follow `src/curriculum/grade5/standards.ts` exactly: a `DomainInfo[]` in descending weight order for grades 3–4 and in OA, NBT, MD, G order for grades 1–2, then the three trailing helpers renamed for the grade (`GRADE_<N>_STANDARDS`, `getStandardByCode`, `getDomainById`).

Per standard, `code` and `domainId` come from the source JSON verbatim. `description` is the source JSON's `text` field, lightly punctuated if it ends mid-clause, with the `bullets` array folded in as `keyConcepts` where they exist. `title` is yours to write — a short, parent-legible name for what the standard teaches, matching the Grade 5 register ("Add & Subtract Fractions with Unlike Denominators"). `weightCategory` is a short phrase naming the standard's priority; for grades 3–4 reference the domain's real band, and for grades 1–2 use a phrase with no percentage in it, such as `'Core (no state assessment at this grade)'`.

Reuse the Grade 5 `color`/`badgeBg` pairs by domain so a domain looks the same in every grade: NF emerald, NBT blue, MD amber, OA violet, G rose — and read the exact Tailwind class strings out of `src/curriculum/grade5/standards.ts` rather than retyping them, because that file is the ground truth if this sentence and it ever disagree.

- [ ] **Step 4: Run the test**

Run: `npx vitest run src/curriculum/sourcedStandards.test.ts`
Expected: PASS, 13 tests.

- [ ] **Step 5: Confirm the new grades are still unregistered**

Run: `npx vitest run src/curriculum/integrity.test.ts`
Expected: PASS, still only describing grade 5 — Task 4 must not touch `registry.ts`.

- [ ] **Step 6: Lint, typecheck, commit**

```bash
npm run lint && npx tsc -b --noEmit
git add -A
git commit -m "feat: add sourced standards data for grades 1-4"
```

---
# Batch C — Grade 4

The proving run for the pipeline. Grade 4 is built completely before Grades 3, 2, and 1 start, so that anything wrong with the shape is found once rather than four times.

### Task 5: Grade 4 Operations & Algebraic Thinking, and the authored-bank test kit

**Files:**

- Create: `src/curriculum/authoredBank.testkit.ts`
- Create: `src/curriculum/grade4/authored.oa.ts`
- Create: `src/curriculum/grade4/authored.oa.test.ts`
- Create: `src/curriculum/grade4/templates/` (one file per generator, each with a sibling test)
- Modify: `src/curriculum/misconceptions.ts` (declare any new tags)
- Read: `src/curriculum/grade4/standards.ts` (Task 4), `src/curriculum/grade5/authored.ts` (the register to match)

**Standards covered (4):** `NC.4.OA.1`, `NC.4.OA.3`, `NC.4.OA.4`, `NC.4.OA.5`. Read each one's `description` and `keyConcepts` out of `src/curriculum/grade4/standards.ts` — that text is the sourced NCDPI wording and is the authority on what the item may ask.

**Interfaces:**

- Consumes: `GRADE_4_DOMAINS` from `./standards`; `Question`, `labelOptions` from `src/engine/questionModel.ts`; `QuestionTemplate`, `GeneratedQuestion` from `src/engine/template.ts`; `assertTemplateSound` from `src/engine/templateTesting.ts`.
- Produces: `assertAuthoredBankSound()` from `src/curriculum/authoredBank.testkit.ts` — **every later content task's test file calls this instead of rewriting the assertions**. `GRADE_4_OA_AUTHORED: Question[]`. Templates named `g4.oa<tail>.<slug>`, e.g. `g4.oa4.factor-pairs`.

- [ ] **Step 1: Write the test kit**

Create `src/curriculum/authoredBank.testkit.ts`:

```ts
import { expect } from 'vitest';
import type { Question } from '../engine/questionModel';
import type { DomainInfo } from './types';

/**
 * The invariants every authored bank must hold, asserted in one place so a
 * new domain's test file is three lines instead of forty. Mirrors what
 * assertTemplateSound() does for generators.
 */
export function assertAuthoredBankSound(
  items: Question[],
  domain: DomainInfo,
  opts: { itemsPerStandard?: number } = {},
): void {
  const floor = opts.itemsPerStandard ?? 3;
  const codes = new Set(domain.standards.map((s) => s.code));

  const ids = items.map((q) => q.id);
  expect(new Set(ids).size, `duplicate item ids in ${domain.id}`).toBe(ids.length);

  for (const q of items) {
    expect(codes.has(q.standardCode), `${q.id} is not a ${domain.id} standard`).toBe(true);
    expect(q.domainId, `${q.id} domainId`).toBe(domain.id);
    expect(q.options.length, `${q.id} must have 4 options`).toBe(4);
    expect(q.options.filter((o) => o.isCorrect).length, `${q.id} correct count`).toBe(1);
    for (const o of q.options) {
      expect(o.text.trim().length, `${q.id} option ${o.label} is blank`).toBeGreaterThan(0);
      if (!o.isCorrect) {
        expect(o.misconception, `${q.id} option ${o.label} has no misconception tag`).toBeTruthy();
      }
    }
    const texts = q.options.map((o) => o.text.trim());
    expect(new Set(texts).size, `${q.id} has duplicate option text`).toBe(4);
    expect(q.explanation.stepByStep.length, `${q.id} has no worked solution`).toBeGreaterThan(0);
    expect(q.explanation.conceptSummary.trim().length, `${q.id} concept summary`).toBeGreaterThan(0);
  }

  for (const s of domain.standards) {
    const mine = items.filter((q) => q.standardCode === s.code);
    expect(mine.length, `${s.code} has ${mine.length} items, needs ${floor}`)
      .toBeGreaterThanOrEqual(floor);
  }

  // A bank of nothing but mastery items never stretches a student, and a bank
  // of nothing but stretch items teaches nobody. Both tiers must be present.
  const difficulties = new Set(items.map((q) => q.difficulty));
  expect(difficulties.has('mastery'), `${domain.id} has no mastery-level items`).toBe(true);
  expect(
    difficulties.has('advanced') || difficulties.has('stretch'),
    `${domain.id} has no items above mastery level`,
  ).toBe(true);
}
```

- [ ] **Step 2: Write the failing domain test**

Create `src/curriculum/grade4/authored.oa.test.ts`:

```ts
import { describe, it } from 'vitest';
import { assertAuthoredBankSound } from '../authoredBank.testkit';
import { GRADE_4_DOMAINS } from './standards';
import { GRADE_4_OA_AUTHORED } from './authored.oa';

describe('grade 4 OA authored bank', () => {
  it('holds every authored-bank invariant', () => {
    const oa = GRADE_4_DOMAINS.find((d) => d.id === 'OA')!;
    assertAuthoredBankSound(GRADE_4_OA_AUTHORED, oa);
  });
});
```

- [ ] **Step 3: Run it and watch it fail**

Run: `npx vitest run src/curriculum/grade4/authored.oa.test.ts`
Expected: FAIL — `./authored.oa` does not exist.

- [ ] **Step 4: Author the bank**

Create `src/curriculum/grade4/authored.oa.ts` following The Content Contract above and the file-level doc comment style of `src/curriculum/grade5/authored.ts`. At least three items per standard, twelve minimum. Every wrong option is a value a Grade 4 student actually produces: for `NC.4.OA.1` the additive comparison ("6 more than 4") where a multiplicative one was asked ("6 times as many as 4"); for `NC.4.OA.4` a composite offered as prime because only 2 and 3 were tested as divisors; for `NC.4.OA.3` the result of answering the intermediate step rather than the question asked.

- [ ] **Step 5: Write the templates**

Write a template for each OA standard whose practice value comes from fresh numbers — at minimum `NC.4.OA.1` and `NC.4.OA.4`, whose items are computational. `NC.4.OA.3` (multi-step word problems) and `NC.4.OA.5` (patterns) stay authored: there the wording carries the mathematics.

Each template gets a sibling test:

```ts
import { describe, it, expect } from 'vitest';
import { assertTemplateSound } from '../../../engine/templateTesting';
import { makeRng } from '../../../engine/rng';
import { oa4FactorPairs } from './oa4-factor-pairs';

describe('g4.oa4.factor-pairs', () => {
  it('is sound at every seed', () => {
    assertTemplateSound(oa4FactorPairs);
  });

  it('is deterministic in its seed', () => {
    const a = oa4FactorPairs.generate(makeRng(42));
    const b = oa4FactorPairs.generate(makeRng(42));
    expect(a).toEqual(b);
  });

  it('produces a known question at a pinned seed', () => {
    const g = oa4FactorPairs.generate(makeRng(7));
    expect(g.options.find((o) => o.isCorrect)!.text).toBe(g.answerText);
    expect(g.prompt.length).toBeGreaterThan(0);
  });
});
```

Create `src/curriculum/grade4/templates/index.ts` exporting `GRADE_4_TEMPLATES: QuestionTemplate[]` with the same doc comment discipline as `src/curriculum/grade5/templates/index.ts`. Task 6 through Task 9 append to this array.

- [ ] **Step 6: Declare the new misconception tags**

For every tag your options use that `src/curriculum/misconceptions.ts` does not already declare, add an `entry(tag, family, description)` line in the existing alphabetical-ish grouping. Reuse an existing tag whenever it names the same error — the vocabulary is shared across grades on purpose, so "you did this six times this week" stays meaningful. Add a new `MisconceptionFamily` only if no existing family fits, and say why in a comment.

- [ ] **Step 7: Run the tests**

Run: `npx vitest run src/curriculum/grade4 src/curriculum/misconceptions.test.ts`
Expected: PASS. The orphan-tag test will fail if you declared a tag nothing uses.

- [ ] **Step 8: Lint, typecheck, commit**

```bash
npm run lint && npx tsc -b --noEmit
git add -A
git commit -m "feat: add grade 4 operations and algebraic thinking content"
```

---

### Task 6: Grade 4 Number & Operations in Base Ten

**Files:**

- Create: `src/curriculum/grade4/authored.nbt.ts`, `src/curriculum/grade4/authored.nbt.test.ts`
- Create: template files under `src/curriculum/grade4/templates/`, each with a sibling test
- Modify: `src/curriculum/grade4/templates/index.ts`, `src/curriculum/misconceptions.ts`

**Standards covered (6):** `NC.4.NBT.1`, `NC.4.NBT.2`, `NC.4.NBT.7`, `NC.4.NBT.4`, `NC.4.NBT.5`, `NC.4.NBT.6`.

**Interfaces:**

- Consumes: `assertAuthoredBankSound` (Task 5), `GRADE_4_DOMAINS`, `assertTemplateSound`.
- Produces: `GRADE_4_NBT_AUTHORED: Question[]`; templates named `g4.nbt<tail>.<slug>`.

- [ ] **Step 1: Write the failing test**

Create `src/curriculum/grade4/authored.nbt.test.ts`, identical in shape to the OA test from Task 5 but for NBT:

```ts
import { describe, it } from 'vitest';
import { assertAuthoredBankSound } from '../authoredBank.testkit';
import { GRADE_4_DOMAINS } from './standards';
import { GRADE_4_NBT_AUTHORED } from './authored.nbt';

describe('grade 4 NBT authored bank', () => {
  it('holds every authored-bank invariant', () => {
    const nbt = GRADE_4_DOMAINS.find((d) => d.id === 'NBT')!;
    assertAuthoredBankSound(GRADE_4_NBT_AUTHORED, nbt);
  });
});
```

- [ ] **Step 2: Run it and watch it fail**

Run: `npx vitest run src/curriculum/grade4/authored.nbt.test.ts`
Expected: FAIL — `./authored.nbt` does not exist.

- [ ] **Step 3: Author the bank**

At least three items per standard, eighteen minimum. This is the algorithm-heavy domain, so distractors are the classic procedural slips: a regrouping dropped in multi-digit subtraction; a carried digit added before multiplying rather than after; a partial product not shifted a place; a remainder discarded when the question asks what to do with it; a comparison made on digit count rather than place value.

- [ ] **Step 4: Write the templates**

Every NBT standard here is computational and gets a template: place-value relationship (`NC.4.NBT.1`), reading and writing including expanded form (`NC.4.NBT.2`), comparison with >, = and < (`NC.4.NBT.7`), multi-digit addition and subtraction (`NC.4.NBT.4`), multiplication (`NC.4.NBT.5`), and division with remainders (`NC.4.NBT.6`). Study `src/curriculum/grade5/templates/nbt5-multi-digit-multiply.ts` and `nbt6-divide-two-digit.ts` first — the Grade 4 versions are the same generators at a smaller number range.

Each gets a sibling test calling `assertTemplateSound()` at the default 300 runs plus a determinism check and a pinned seed, exactly as in Task 5 Step 5. Where two distractor formulas can collide, exclude the colliding parameters by construction and document the algebra in a file comment.

- [ ] **Step 5: Register the templates**

Append each template to `GRADE_4_TEMPLATES` in `src/curriculum/grade4/templates/index.ts`.

- [ ] **Step 6: Declare any new misconception tags**

As in Task 5 Step 6.

- [ ] **Step 7: Run the tests**

Run: `npx vitest run src/curriculum/grade4 src/curriculum/misconceptions.test.ts`
Expected: PASS.

- [ ] **Step 8: Lint, typecheck, commit**

```bash
npm run lint && npx tsc -b --noEmit
git add -A
git commit -m "feat: add grade 4 base ten content"
```

---

### Task 7: Grade 4 Number & Operations — Fractions

**Files:**

- Create: `src/curriculum/grade4/authored.nf.ts`, `src/curriculum/grade4/authored.nf.test.ts`
- Create: template files under `src/curriculum/grade4/templates/`, each with a sibling test
- Modify: `src/curriculum/grade4/templates/index.ts`, `src/curriculum/misconceptions.ts`

**Standards covered (6):** `NC.4.NF.1`, `NC.4.NF.2`, `NC.4.NF.3`, `NC.4.NF.4`, `NC.4.NF.6`, `NC.4.NF.7`.

**Interfaces:**

- Consumes: `assertAuthoredBankSound`, `GRADE_4_DOMAINS`, `assertTemplateSound`.
- Produces: `GRADE_4_NF_AUTHORED: Question[]`; templates named `g4.nf<tail>.<slug>`.

**Why this domain matters most:** NF carries the largest published band at Grade 4 — 30–34%, more than any other domain. It is also where the misconception vocabulary earns its keep, because fraction errors are procedural and nameable.

- [ ] **Step 1: Write the failing test**

Create `src/curriculum/grade4/authored.nf.test.ts`:

```ts
import { describe, it } from 'vitest';
import { assertAuthoredBankSound } from '../authoredBank.testkit';
import { GRADE_4_DOMAINS } from './standards';
import { GRADE_4_NF_AUTHORED } from './authored.nf';

describe('grade 4 NF authored bank', () => {
  it('holds every authored-bank invariant', () => {
    const nf = GRADE_4_DOMAINS.find((d) => d.id === 'NF')!;
    assertAuthoredBankSound(GRADE_4_NF_AUTHORED, nf);
  });
});
```

- [ ] **Step 2: Run it and watch it fail**

Run: `npx vitest run src/curriculum/grade4/authored.nf.test.ts`
Expected: FAIL — `./authored.nf` does not exist.

- [ ] **Step 3: Author the bank**

At least three items per standard, eighteen minimum, and given the domain's weight, prefer four. The distractors that matter here: adding denominators as well as numerators; judging `1/8 > 1/3` because eight exceeds three; comparing fractions with unlike denominators by numerator alone; multiplying a fraction by a whole number and multiplying the denominator too; reading `0.5` as smaller than `0.25` because it has fewer digits.

- [ ] **Step 4: Write the templates**

Templates for the computational standards — equivalence (`NC.4.NF.1`), comparison (`NC.4.NF.2`), addition and subtraction with like denominators (`NC.4.NF.3`), multiplication by a whole number (`NC.4.NF.4`), and decimal notation and comparison (`NC.4.NF.6`, `NC.4.NF.7`). `src/curriculum/grade5/templates/nf1-add-unlike.ts` and `nbt3-compare-decimals.ts` are the closest existing models.

Each gets a sibling test as in Task 5 Step 5.

- [ ] **Step 5: Register the templates**

Append to `GRADE_4_TEMPLATES`.

- [ ] **Step 6: Declare any new misconception tags**

As in Task 5 Step 6.

- [ ] **Step 7: Run the tests**

Run: `npx vitest run src/curriculum/grade4 src/curriculum/misconceptions.test.ts`
Expected: PASS.

- [ ] **Step 8: Lint, typecheck, commit**

```bash
npm run lint && npx tsc -b --noEmit
git add -A
git commit -m "feat: add grade 4 fractions content"
```

---

### Task 8: Grade 4 Measurement & Data

**Files:**

- Create: `src/curriculum/grade4/authored.md.ts`, `src/curriculum/grade4/authored.md.test.ts`
- Create: template files under `src/curriculum/grade4/templates/`, each with a sibling test
- Modify: `src/curriculum/grade4/templates/index.ts`, `src/curriculum/misconceptions.ts`

**Standards covered (6):** `NC.4.MD.1`, `NC.4.MD.2`, `NC.4.MD.8`, `NC.4.MD.3`, `NC.4.MD.4`, `NC.4.MD.6`.

**Interfaces:**

- Consumes: `assertAuthoredBankSound`, `GRADE_4_DOMAINS`, `assertTemplateSound`.
- Produces: `GRADE_4_MD_AUTHORED: Question[]`; templates named `g4.md<tail>.<slug>`.

**Weight note:** MD shares the 23–27% band with Geometry. Nothing in this task may describe 23–27% as MD's own weight.

- [ ] **Step 1: Write the failing test**

Create `src/curriculum/grade4/authored.md.test.ts`:

```ts
import { describe, it } from 'vitest';
import { assertAuthoredBankSound } from '../authoredBank.testkit';
import { GRADE_4_DOMAINS } from './standards';
import { GRADE_4_MD_AUTHORED } from './authored.md';

describe('grade 4 MD authored bank', () => {
  it('holds every authored-bank invariant', () => {
    const md = GRADE_4_DOMAINS.find((d) => d.id === 'MD')!;
    assertAuthoredBankSound(GRADE_4_MD_AUTHORED, md);
  });
});
```

- [ ] **Step 2: Run it and watch it fail**

Run: `npx vitest run src/curriculum/grade4/authored.md.test.ts`
Expected: FAIL — `./authored.md` does not exist.

- [ ] **Step 3: Author the bank**

At least three items per standard, eighteen minimum. Characteristic errors: converting a unit the wrong way (multiplying where dividing was needed); computing perimeter when area was asked, or the reverse; adding an angle instead of subtracting it when decomposing; reading a line plot's axis by tick count rather than by value.

For any item describing a figure, put the figure in `promptDetails` as text a screen reader can read — no image assets.

- [ ] **Step 4: Write the templates**

Templates for unit conversion (`NC.4.MD.1`, `NC.4.MD.2`), area and perimeter (`NC.4.MD.8`), and angle measure (`NC.4.MD.6`). `src/curriculum/grade5/templates/md1-unit-conversion.ts` is the model for the first two.

Each gets a sibling test as in Task 5 Step 5.

- [ ] **Step 5: Register the templates**

Append to `GRADE_4_TEMPLATES`.

- [ ] **Step 6: Declare any new misconception tags**

As in Task 5 Step 6.

- [ ] **Step 7: Run the tests**

Run: `npx vitest run src/curriculum/grade4 src/curriculum/misconceptions.test.ts`
Expected: PASS.

- [ ] **Step 8: Lint, typecheck, commit**

```bash
npm run lint && npx tsc -b --noEmit
git add -A
git commit -m "feat: add grade 4 measurement and data content"
```

---

### Task 9: Grade 4 Geometry

**Files:**

- Create: `src/curriculum/grade4/authored.g.ts`, `src/curriculum/grade4/authored.g.test.ts`
- Create: `src/curriculum/grade4/authored.ts` (the aggregator)
- Modify: `src/curriculum/misconceptions.ts`

**Standards covered (3):** `NC.4.G.1`, `NC.4.G.2`, `NC.4.G.3`.

**Interfaces:**

- Consumes: `assertAuthoredBankSound`, `GRADE_4_DOMAINS`.
- Produces: `GRADE_4_G_AUTHORED: Question[]`; `GRADE_4_AUTHORED: Question[]` from `src/curriculum/grade4/authored.ts`, which Task 11 passes to `makeQuestionSource`.

**Templates:** none. Grade 4 Geometry is classification and vocabulary — what a ray is, which quadrilateral a figure is, where a line of symmetry falls. Generated numbers add nothing, and a generator would produce the kind of interchangeable item the owner asked us to get away from. These stay authored, and `CurriculumView` will badge them "Fixed Question Set" honestly.

- [ ] **Step 1: Write the failing tests**

Create `src/curriculum/grade4/authored.g.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { assertAuthoredBankSound } from '../authoredBank.testkit';
import { GRADE_4_DOMAINS } from './standards';
import { GRADE_4_G_AUTHORED } from './authored.g';
import { GRADE_4_AUTHORED } from './authored';

describe('grade 4 G authored bank', () => {
  it('holds every authored-bank invariant', () => {
    const g = GRADE_4_DOMAINS.find((d) => d.id === 'G')!;
    assertAuthoredBankSound(GRADE_4_G_AUTHORED, g);
  });
});

describe('grade 4 authored aggregate', () => {
  it('carries every domain bank exactly once', () => {
    const ids = GRADE_4_AUTHORED.map((q) => q.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const q of GRADE_4_G_AUTHORED) {
      expect(ids).toContain(q.id);
    }
  });

  it('covers every grade 4 standard', () => {
    const covered = new Set(GRADE_4_AUTHORED.map((q) => q.standardCode));
    for (const s of GRADE_4_DOMAINS.flatMap((d) => d.standards)) {
      expect(covered.has(s.code), `no authored item for ${s.code}`).toBe(true);
    }
  });
});
```

- [ ] **Step 2: Run it and watch it fail**

Run: `npx vitest run src/curriculum/grade4/authored.g.test.ts`
Expected: FAIL — `./authored.g` and `./authored` do not exist.

- [ ] **Step 3: Author the bank**

At least three items per standard, nine minimum. The distractors here are definitional, not arithmetic: a line segment called a ray; a rhombus called a square; a diagonal of a rectangle offered as a line of symmetry (it is not, unless the rectangle is a square); a figure judged symmetric because it merely looks balanced.

- [ ] **Step 4: Write the aggregator**

Create `src/curriculum/grade4/authored.ts`:

```ts
import type { Question } from '../../engine/questionModel';
import { GRADE_4_OA_AUTHORED } from './authored.oa';
import { GRADE_4_NBT_AUTHORED } from './authored.nbt';
import { GRADE_4_NF_AUTHORED } from './authored.nf';
import { GRADE_4_MD_AUTHORED } from './authored.md';
import { GRADE_4_G_AUTHORED } from './authored.g';

/** The whole Grade 4 authored bank. Split by domain on disk because one
 *  file per domain stays readable; joined here because the question source
 *  wants a single array. */
export const GRADE_4_AUTHORED: Question[] = [
  ...GRADE_4_OA_AUTHORED,
  ...GRADE_4_NBT_AUTHORED,
  ...GRADE_4_NF_AUTHORED,
  ...GRADE_4_MD_AUTHORED,
  ...GRADE_4_G_AUTHORED,
];
```

- [ ] **Step 5: Declare any new misconception tags**

As in Task 5 Step 6. The shape-classification family already exists for exactly this kind of error.

- [ ] **Step 6: Run the tests**

Run: `npx vitest run src/curriculum/grade4 src/curriculum/misconceptions.test.ts`
Expected: PASS, including "covers every grade 4 standard".

- [ ] **Step 7: Lint, typecheck, commit**

```bash
npm run lint && npx tsc -b --noEmit
git add -A
git commit -m "feat: add grade 4 geometry content and the authored aggregate"
```

---

### Task 10: Grade 4 study guides

**Files:**

- Create: `src/curriculum/grade4/studyGuides.ts`, `src/curriculum/grade4/studyGuides.test.ts`
- Read: `src/curriculum/grade5/studyGuides.ts` (the register and depth to match)

**Interfaces:**

- Consumes: `StudyGuideSection` from `src/types/index.ts` (moved there in Task 2); `GRADE_4_DOMAINS`.
- Produces: `GRADE_4_STUDY_GUIDES: Record<string, StudyGuideSection>` — Task 11 puts it on the curriculum.

One entry for each of the 25 Grade 4 standards. The audience is a child revising alone and a parent helping at the kitchen table, so each guide must stand on its own.

- [ ] **Step 1: Write the failing test**

Create `src/curriculum/grade4/studyGuides.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { GRADE_4_DOMAINS } from './standards';
import { GRADE_4_STUDY_GUIDES } from './studyGuides';

const STANDARDS = GRADE_4_DOMAINS.flatMap((d) => d.standards);

describe('grade 4 study guides', () => {
  it('writes one guide per standard, keyed by its own code', () => {
    for (const s of STANDARDS) {
      const guide = GRADE_4_STUDY_GUIDES[s.code];
      expect(guide, `no study guide for ${s.code}`).toBeTruthy();
      expect(guide.standardCode).toBe(s.code);
    }
    expect(Object.keys(GRADE_4_STUDY_GUIDES).length).toBe(STANDARDS.length);
  });

  it('fills every section of every guide', () => {
    for (const [code, g] of Object.entries(GRADE_4_STUDY_GUIDES)) {
      expect(g.title.trim().length, `${code} title`).toBeGreaterThan(0);
      expect(g.coreConcept.trim().length, `${code} coreConcept`).toBeGreaterThan(0);
      expect(g.rulesAndFormulas.length, `${code} rulesAndFormulas`).toBeGreaterThan(0);
      expect(g.stepByStepMethod.length, `${code} stepByStepMethod`).toBeGreaterThan(1);
      expect(g.commonTraps.length, `${code} commonTraps`).toBeGreaterThan(0);
      expect(g.workedExample.problem.trim().length, `${code} worked problem`).toBeGreaterThan(0);
      expect(g.workedExample.steps.length, `${code} worked steps`).toBeGreaterThan(1);
      expect(g.workedExample.answer.trim().length, `${code} worked answer`).toBeGreaterThan(0);
      expect(g.workedExample.whyItMattersForSSA.trim().length, `${code} why`).toBeGreaterThan(0);
    }
  });

  it('quotes no weight for a domain inside a combined band', () => {
    // MD and Geometry share one 23-27% band at grade 4. A guide claiming a
    // percentage for either alone would be citing a figure NCDPI never
    // published - the exact defect corrected in commit 6a851cf.
    const grouped = new Set(
      GRADE_4_DOMAINS.filter((d) => d.weightGroup).flatMap((d) => d.standards.map((s) => s.code)),
    );
    for (const [code, g] of Object.entries(GRADE_4_STUDY_GUIDES)) {
      if (!grouped.has(code)) continue;
      expect(
        /\d+\s*[-–]\s*\d+\s*%|\b\d+\s*%/.test(g.workedExample.whyItMattersForSSA),
        `${code} cites a percentage for a domain that shares a band`,
      ).toBe(false);
    }
  });
});
```

- [ ] **Step 2: Run it and watch it fail**

Run: `npx vitest run src/curriculum/grade4/studyGuides.test.ts`
Expected: FAIL — `./studyGuides` does not exist.

- [ ] **Step 3: Write the guides**

25 entries. For each: `title` matching the standard's `title` in `standards.ts`; `coreConcept` in two or three sentences; `rulesAndFormulas` as `{ label, detail }` pairs; `stepByStepMethod` as a numbered procedure a child can follow; `commonTraps` naming the same errors the authored distractors use, in the same words, so the guide and the quiz feedback reinforce each other; and a `workedExample` with a real problem, its steps, its answer, and `whyItMattersForSSA`.

For OA, NBT, and NF standards, `whyItMattersForSSA` may cite the domain band — 14–18%, 25–29%, 30–34% respectively. For MD and G standards it may not cite a percentage at all, because their band is shared; say instead that measurement and geometry are assessed together as one of the four reporting categories.

- [ ] **Step 4: Run the test**

Run: `npx vitest run src/curriculum/grade4/studyGuides.test.ts`
Expected: PASS, 3 tests.

- [ ] **Step 5: Lint, typecheck, commit**

```bash
npm run lint && npx tsc -b --noEmit
git add -A
git commit -m "feat: add grade 4 study guides"
```

---

### Task 11: Register Grade 4

The task that makes Grade 4 real. Everything before it was inert files; this one puts a second option in the navbar's grade picker.

**Files:**

- Create: `src/curriculum/grade4/quizzes.ts`, `src/curriculum/grade4/index.ts`, `src/curriculum/grade4/grade4.test.ts`
- Modify: `src/curriculum/registry.ts`
- Read: `src/curriculum/grade5/quizzes.ts`, `src/curriculum/grade5/index.ts`, `src/curriculum/grade5/grade5.test.ts`

**Interfaces:**

- Consumes: everything Tasks 4–10 produced; `makeQuestionSource` from `src/engine/questionSource.ts`.
- Produces: `GRADE_4: GradeCurriculum` from `src/curriculum/grade4/index.ts`, registered under key `4` in `CURRICULA`.

- [ ] **Step 1: Write the failing test**

Create `src/curriculum/grade4/grade4.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { GRADE_4 } from './index';
import { getCurriculum, listCurricula, standardsOf, domainWeight } from '../registry';

describe('grade 4 curriculum', () => {
  it('is registered and reachable by grade number', () => {
    expect(getCurriculum(4)).toBe(GRADE_4);
    expect(listCurricula().map((c) => c.grade)).toContain(4);
  });

  it('declares the WCPSS passing bar and what mastery skips', () => {
    expect(GRADE_4.ssa.passingPercent).toBe(80);
    expect(GRADE_4.ssa.targetsGrade).toBe(4);
  });

  it('cites the NCDPI blueprint, which exists at grade 4', () => {
    expect(GRADE_4.weighting.kind).toBe('ncdpi-blueprint');
  });

  it('totals its domain weights to 100 through domainWeight', () => {
    const total = GRADE_4.domains.reduce((sum, d) => sum + domainWeight(GRADE_4, d.id), 0);
    expect(total).toBeGreaterThan(99);
    expect(total).toBeLessThan(101);
  });

  it('has content for all 25 standards', () => {
    expect(standardsOf(GRADE_4).length).toBe(25);
    const withContent = new Set(GRADE_4.source.allStandardsWithContent());
    for (const s of standardsOf(GRADE_4)) {
      expect(withContent.has(s.code), `no content for ${s.code}`).toBe(true);
    }
    expect(GRADE_4.contentComplete).toBe(true);
  });

  it('generates a renewable practice pool for most of the grade', () => {
    // Authored-only standards repeat; generated ones never do. A grade where
    // most standards are authored-only is the repetitive quiz the owner asked
    // us to fix, so this is a floor, not a nicety.
    const generated = standardsOf(GRADE_4).filter((s) => GRADE_4.source.hasGenerator(s.code));
    expect(generated.length).toBeGreaterThanOrEqual(12);
  });

  it('serves its own quizzes, not grade 5\'s', () => {
    expect(GRADE_4.quizzes.length).toBeGreaterThan(0);
    for (const q of GRADE_4.quizzes) {
      for (const id of q.questionIds) {
        expect(id.startsWith('g4.'), `quiz ${q.id} carries non-grade-4 item ${id}`).toBe(true);
      }
    }
  });
});
```

- [ ] **Step 2: Run it and watch it fail**

Run: `npx vitest run src/curriculum/grade4/grade4.test.ts`
Expected: FAIL — `./index` does not exist.

- [ ] **Step 3: Write the quizzes**

Create `src/curriculum/grade4/quizzes.ts` exporting `GRADE_4_QUIZZES: QuizDefinition[]`, mirroring the set in `src/curriculum/grade5/quizzes.ts`:

- `g4-diagnostic-01` — `isDiagnostic: true`, one item per standard (25), `timeLimitMinutes: 45`, with a `subtitle` function of the curriculum rather than a baked-in count, exactly as Grade 5's does.
- One module drill per domain: `g4-mod-oa-01`, `g4-mod-nbt-01`, `g4-mod-nf-01`, `g4-mod-md-01`, `g4-mod-g-01`, each with its `domainId` set.
- `g4-mock-ssa-01` — a full simulation, roughly 30 items, allocated across domains in proportion to the blueprint bands: about 5 OA, 8 NBT, 10 NF, and 7 across MD and Geometry together.

Every id in `questionIds` must be a real authored item id from Tasks 5–9. The integrity test added in Task 1 will reject any that is not.

- [ ] **Step 4: Write the curriculum module**

Create `src/curriculum/grade4/index.ts`:

```ts
import type { GradeCurriculum } from '../types';
import { GRADE_4_DOMAINS } from './standards';
import { makeQuestionSource } from '../../engine/questionSource';
import { GRADE_4_AUTHORED } from './authored';
import { GRADE_4_TEMPLATES } from './templates';
import { GRADE_4_STUDY_GUIDES } from './studyGuides';
import { GRADE_4_QUIZZES } from './quizzes';

export { GRADE_4_DOMAINS } from './standards';

export const GRADE_4: GradeCurriculum = {
  grade: 4,
  label: 'Grade 4 Mathematics',
  ssa: { passingPercent: 80, targetsGrade: 4 },
  weighting: {
    kind: 'ncdpi-blueprint',
    source: 'NCDPI EOG Mathematics Grades 3-8 Test Specifications, April 2026',
  },
  contentComplete: true,
  domains: GRADE_4_DOMAINS,
  studyGuides: GRADE_4_STUDY_GUIDES,
  quizzes: GRADE_4_QUIZZES,
  source: makeQuestionSource(GRADE_4_AUTHORED, GRADE_4_TEMPLATES),
};
```

- [ ] **Step 5: Register it**

In `src/curriculum/registry.ts`:

```ts
import { GRADE_4 } from './grade4';
import { GRADE_5 } from './grade5';

const CURRICULA: Partial<Record<Grade, GradeCurriculum>> = {
  4: GRADE_4,
  5: GRADE_5,
};
```

- [ ] **Step 6: Run the whole suite**

Run: `npm test -- --run`
Expected: PASS. The registry-driven tests from Task 3 and the integrity tests from Tasks 1–2 now run against Grade 4 as well; this is the first moment they have two grades to compare, so read any failure as a real finding about Grade 4, not as noise.

- [ ] **Step 7: Verify the app in a browser**

Run `npm run dev`, open `http://localhost:5173/math/app/`, and confirm: the navbar grade picker offers Grade 4 and Grade 5; switching to Grade 4 shows 25 standards and Grade 4 quizzes; the Curriculum tab shows MD and Geometry both labelled "23–27% (Measurement & Data and Geometry combined)"; a Grade 4 quiz runs end to end and its results name Grade 4 standards.

- [ ] **Step 8: Confirm nothing phones home**

Run: `grep -rn "fetch(\|XMLHttpRequest\|sendBeacon\|WebSocket\|navigator.send" src/`
Expected: no output. Users are children; nothing leaves the browser.

- [ ] **Step 9: Lint, typecheck, commit**

```bash
npm run lint && npx tsc -b --noEmit
git add -A
git commit -m "feat: register grade 4 as a playable curriculum"
```

---
# Batch D — Grade 3

Grade 3 is the lowest grade with an EOG, so it is the last grade with a real blueprint. It also introduces Fractions, which is why its NF domain is small but heavily weighted.

### Task 12: Grade 3 Operations & Algebraic Thinking

**Files:**

- Create: `src/curriculum/grade3/authored.oa.ts`, `src/curriculum/grade3/authored.oa.test.ts`
- Create: `src/curriculum/grade3/templates/` files, each with a sibling test, plus `src/curriculum/grade3/templates/index.ts`
- Modify: `src/curriculum/misconceptions.ts`

**Standards covered (7):** `NC.3.OA.1`, `NC.3.OA.2`, `NC.3.OA.3`, `NC.3.OA.6`, `NC.3.OA.7`, `NC.3.OA.8`, `NC.3.OA.9`.

**Interfaces:**

- Consumes: `assertAuthoredBankSound` (Task 5), `GRADE_3_DOMAINS` from `./standards` (Task 4), `assertTemplateSound`.
- Produces: `GRADE_3_OA_AUTHORED: Question[]`; `GRADE_3_TEMPLATES: QuestionTemplate[]` from `src/curriculum/grade3/templates/index.ts`, which Tasks 13–14 append to. Templates named `g3.oa<tail>.<slug>`.

**Weight note:** OA carries 32–36% at Grade 3 — the largest band in the grade, larger than Fractions. Multiplication and division reasoning is the centre of Grade 3.

- [ ] **Step 1: Write the failing test**

Create `src/curriculum/grade3/authored.oa.test.ts`:

```ts
import { describe, it } from 'vitest';
import { assertAuthoredBankSound } from '../authoredBank.testkit';
import { GRADE_3_DOMAINS } from './standards';
import { GRADE_3_OA_AUTHORED } from './authored.oa';

describe('grade 3 OA authored bank', () => {
  it('holds every authored-bank invariant', () => {
    const oa = GRADE_3_DOMAINS.find((d) => d.id === 'OA')!;
    assertAuthoredBankSound(GRADE_3_OA_AUTHORED, oa);
  });
});
```

- [ ] **Step 2: Run it and watch it fail**

Run: `npx vitest run src/curriculum/grade3/authored.oa.test.ts`
Expected: FAIL — `./authored.oa` does not exist.

- [ ] **Step 3: Author the bank**

At least three items per standard, twenty-one minimum. Grade 3 distractors are about what multiplication and division *mean*, not just what they compute: adding the two factors instead of multiplying; treating division as commutative (`12 ÷ 3` answered as if `3 ÷ 12`); solving for the wrong unknown in an equal-groups problem; applying the order of operations left to right in a two-step problem.

- [ ] **Step 4: Write the templates**

Templates for the computational standards — the multiplication and division facts and their relationship (`NC.3.OA.1`, `NC.3.OA.2`, `NC.3.OA.3`, `NC.3.OA.6`, `NC.3.OA.7`) and two-step word problems with a fixed frame and fresh numbers (`NC.3.OA.8`). `NC.3.OA.9` (patterns in the multiplication table) is a reasoning standard and stays authored.

Create `src/curriculum/grade3/templates/index.ts` exporting `GRADE_3_TEMPLATES`. Each template gets a sibling test calling `assertTemplateSound()` at 300 runs, a determinism check on a repeated seed, and a pinned-seed assertion that the correct option's text equals `answerText`.

- [ ] **Step 5: Declare any new misconception tags**

As in Task 5 Step 6.

- [ ] **Step 6: Run the tests**

Run: `npx vitest run src/curriculum/grade3 src/curriculum/misconceptions.test.ts`
Expected: PASS.

- [ ] **Step 7: Lint, typecheck, commit**

```bash
npm run lint && npx tsc -b --noEmit
git add -A
git commit -m "feat: add grade 3 operations and algebraic thinking content"
```

---

### Task 13: Grade 3 Base Ten and Fractions

Two small domains in one task: NBT has two standards and NF has four.

**Files:**

- Create: `src/curriculum/grade3/authored.nbt.ts`, `src/curriculum/grade3/authored.nbt.test.ts`
- Create: `src/curriculum/grade3/authored.nf.ts`, `src/curriculum/grade3/authored.nf.test.ts`
- Create: template files under `src/curriculum/grade3/templates/`, each with a sibling test
- Modify: `src/curriculum/grade3/templates/index.ts`, `src/curriculum/misconceptions.ts`

**Standards covered (6):** NBT — `NC.3.NBT.2`, `NC.3.NBT.3`. NF — `NC.3.NF.1`, `NC.3.NF.2`, `NC.3.NF.3`, `NC.3.NF.4`.

**Interfaces:**

- Consumes: `assertAuthoredBankSound`, `GRADE_3_DOMAINS`, `assertTemplateSound`.
- Produces: `GRADE_3_NBT_AUTHORED`, `GRADE_3_NF_AUTHORED`, both `Question[]`. Templates named `g3.nbt<tail>.<slug>` and `g3.nf<tail>.<slug>`.

- [ ] **Step 1: Write the two failing tests**

Create `src/curriculum/grade3/authored.nbt.test.ts`:

```ts
import { describe, it } from 'vitest';
import { assertAuthoredBankSound } from '../authoredBank.testkit';
import { GRADE_3_DOMAINS } from './standards';
import { GRADE_3_NBT_AUTHORED } from './authored.nbt';

describe('grade 3 NBT authored bank', () => {
  it('holds every authored-bank invariant', () => {
    const nbt = GRADE_3_DOMAINS.find((d) => d.id === 'NBT')!;
    assertAuthoredBankSound(GRADE_3_NBT_AUTHORED, nbt);
  });
});
```

Create `src/curriculum/grade3/authored.nf.test.ts`:

```ts
import { describe, it } from 'vitest';
import { assertAuthoredBankSound } from '../authoredBank.testkit';
import { GRADE_3_DOMAINS } from './standards';
import { GRADE_3_NF_AUTHORED } from './authored.nf';

describe('grade 3 NF authored bank', () => {
  it('holds every authored-bank invariant', () => {
    const nf = GRADE_3_DOMAINS.find((d) => d.id === 'NF')!;
    assertAuthoredBankSound(GRADE_3_NF_AUTHORED, nf);
  });
});
```

- [ ] **Step 2: Run them and watch them fail**

Run: `npx vitest run src/curriculum/grade3`
Expected: FAIL — neither `./authored.nbt` nor `./authored.nf` exists.

- [ ] **Step 3: Author both banks**

NBT: at least three items per standard, six minimum. Grade 3 NBT is only addition and subtraction within 1,000 (`NC.3.NBT.2`) and a one-digit number times a multiple of 10 (`NC.3.NBT.3`) — nothing else. Losing a regrouping across a zero, and multiplying the tens digit while dropping its place, are the two errors worth naming.

NF: at least three items per standard, twelve minimum — and this is a child's first year of fractions, so the misconceptions are foundational. Name them precisely: reading `1/4` as "one and four"; believing a larger denominator means a larger fraction; placing a fraction on a number line by counting tick marks rather than by counting equal intervals; calling two fractions equivalent because their numerators differ by the same amount as their denominators.

- [ ] **Step 4: Write the templates**

Templates for addition and subtraction within 1,000 (`NC.3.NBT.2`) and for a one-digit number times a multiple of 10 (`NC.3.NBT.3`), for identifying a unit fraction of a whole (`NC.3.NF.1`), for locating a fraction on a number line (`NC.3.NF.2`), and for equivalence and comparison (`NC.3.NF.3`, `NC.3.NF.4`). Each gets a sibling test as in Task 12 Step 4. Append them all to `GRADE_3_TEMPLATES`.

- [ ] **Step 5: Declare any new misconception tags**

As in Task 5 Step 6.

- [ ] **Step 6: Run the tests**

Run: `npx vitest run src/curriculum/grade3 src/curriculum/misconceptions.test.ts`
Expected: PASS.

- [ ] **Step 7: Lint, typecheck, commit**

```bash
npm run lint && npx tsc -b --noEmit
git add -A
git commit -m "feat: add grade 3 base ten and fractions content"
```

---

### Task 14: Grade 3 Measurement, Geometry, and the authored aggregate

**Files:**

- Create: `src/curriculum/grade3/authored.md.ts`, `src/curriculum/grade3/authored.md.test.ts`
- Create: `src/curriculum/grade3/authored.g.ts`, `src/curriculum/grade3/authored.g.test.ts`
- Create: `src/curriculum/grade3/authored.ts`
- Create: template files under `src/curriculum/grade3/templates/`, each with a sibling test
- Modify: `src/curriculum/grade3/templates/index.ts`, `src/curriculum/misconceptions.ts`

**Standards covered (7):** MD — `NC.3.MD.1`, `NC.3.MD.2`, `NC.3.MD.3`, `NC.3.MD.5`, `NC.3.MD.7`, `NC.3.MD.8`. G — `NC.3.G.1`.

**Interfaces:**

- Consumes: `assertAuthoredBankSound`, `GRADE_3_DOMAINS`.
- Produces: `GRADE_3_MD_AUTHORED`, `GRADE_3_G_AUTHORED`, and `GRADE_3_AUTHORED: Question[]` from `src/curriculum/grade3/authored.ts`, which Task 16 passes to `makeQuestionSource`.

**Weight note:** MD and Geometry share one 23–27% band at Grade 3. Neither may cite a weight of its own.

- [ ] **Step 1: Write the failing tests**

Create `src/curriculum/grade3/authored.md.test.ts`:

```ts
import { describe, it } from 'vitest';
import { assertAuthoredBankSound } from '../authoredBank.testkit';
import { GRADE_3_DOMAINS } from './standards';
import { GRADE_3_MD_AUTHORED } from './authored.md';

describe('grade 3 MD authored bank', () => {
  it('holds every authored-bank invariant', () => {
    const md = GRADE_3_DOMAINS.find((d) => d.id === 'MD')!;
    assertAuthoredBankSound(GRADE_3_MD_AUTHORED, md);
  });
});
```

Create `src/curriculum/grade3/authored.g.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { assertAuthoredBankSound } from '../authoredBank.testkit';
import { GRADE_3_DOMAINS } from './standards';
import { GRADE_3_G_AUTHORED } from './authored.g';
import { GRADE_3_AUTHORED } from './authored';

describe('grade 3 G authored bank', () => {
  it('holds every authored-bank invariant', () => {
    const g = GRADE_3_DOMAINS.find((d) => d.id === 'G')!;
    assertAuthoredBankSound(GRADE_3_G_AUTHORED, g);
  });
});

describe('grade 3 authored aggregate', () => {
  it('carries every item exactly once', () => {
    const ids = GRADE_3_AUTHORED.map((q) => q.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('covers every grade 3 standard', () => {
    const covered = new Set(GRADE_3_AUTHORED.map((q) => q.standardCode));
    for (const s of GRADE_3_DOMAINS.flatMap((d) => d.standards)) {
      expect(covered.has(s.code), `no authored item for ${s.code}`).toBe(true);
    }
  });
});
```

- [ ] **Step 2: Run them and watch them fail**

Run: `npx vitest run src/curriculum/grade3`
Expected: FAIL — `./authored.md`, `./authored.g`, and `./authored` do not exist.

- [ ] **Step 3: Author both banks**

MD: at least three items per standard, eighteen minimum. Grade 3 is where area and perimeter first collide, so name that error rather than merely producing a wrong number; also worth naming are reading an elapsed-time problem as a subtraction of clock digits, and reading a scaled bar graph as if each unit were one.

G: at least three items, and prefer more — this domain has one standard carrying the whole Geometry share. Errors are definitional: calling a shape a rectangle because it "looks like one" rather than by its right angles; partitioning a shape into unequal parts and calling each a quarter.

- [ ] **Step 4: Write the templates**

Templates for elapsed time and mass or volume word problems (`NC.3.MD.1`, `NC.3.MD.2`), for area by tiling and by multiplication (`NC.3.MD.5`, `NC.3.MD.7`), and for perimeter (`NC.3.MD.8`). `NC.3.MD.3` (scaled graphs) and `NC.3.G.1` (shape classification) stay authored: a generated bar graph is a figure, not a number, and shape classification is vocabulary.

Each gets a sibling test as in Task 12 Step 4. Append to `GRADE_3_TEMPLATES`.

- [ ] **Step 5: Write the aggregator**

Create `src/curriculum/grade3/authored.ts`:

```ts
import type { Question } from '../../engine/questionModel';
import { GRADE_3_OA_AUTHORED } from './authored.oa';
import { GRADE_3_NBT_AUTHORED } from './authored.nbt';
import { GRADE_3_NF_AUTHORED } from './authored.nf';
import { GRADE_3_MD_AUTHORED } from './authored.md';
import { GRADE_3_G_AUTHORED } from './authored.g';

/** The whole Grade 3 authored bank, joined from the per-domain files. */
export const GRADE_3_AUTHORED: Question[] = [
  ...GRADE_3_OA_AUTHORED,
  ...GRADE_3_NBT_AUTHORED,
  ...GRADE_3_NF_AUTHORED,
  ...GRADE_3_MD_AUTHORED,
  ...GRADE_3_G_AUTHORED,
];
```

- [ ] **Step 6: Declare any new misconception tags**

As in Task 5 Step 6.

- [ ] **Step 7: Run the tests**

Run: `npx vitest run src/curriculum/grade3 src/curriculum/misconceptions.test.ts`
Expected: PASS, including "covers every grade 3 standard".

- [ ] **Step 8: Lint, typecheck, commit**

```bash
npm run lint && npx tsc -b --noEmit
git add -A
git commit -m "feat: add grade 3 measurement and geometry content"
```

---

### Task 15: Grade 3 study guides

**Files:**

- Create: `src/curriculum/grade3/studyGuides.ts`, `src/curriculum/grade3/studyGuides.test.ts`

**Interfaces:**

- Consumes: `StudyGuideSection`, `GRADE_3_DOMAINS`.
- Produces: `GRADE_3_STUDY_GUIDES: Record<string, StudyGuideSection>`.

One entry for each of the 20 Grade 3 standards.

- [ ] **Step 1: Write the failing test**

Create `src/curriculum/grade3/studyGuides.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { GRADE_3_DOMAINS } from './standards';
import { GRADE_3_STUDY_GUIDES } from './studyGuides';

const STANDARDS = GRADE_3_DOMAINS.flatMap((d) => d.standards);

describe('grade 3 study guides', () => {
  it('writes one guide per standard, keyed by its own code', () => {
    for (const s of STANDARDS) {
      const guide = GRADE_3_STUDY_GUIDES[s.code];
      expect(guide, `no study guide for ${s.code}`).toBeTruthy();
      expect(guide.standardCode).toBe(s.code);
    }
    expect(Object.keys(GRADE_3_STUDY_GUIDES).length).toBe(STANDARDS.length);
  });

  it('fills every section of every guide', () => {
    for (const [code, g] of Object.entries(GRADE_3_STUDY_GUIDES)) {
      expect(g.title.trim().length, `${code} title`).toBeGreaterThan(0);
      expect(g.coreConcept.trim().length, `${code} coreConcept`).toBeGreaterThan(0);
      expect(g.rulesAndFormulas.length, `${code} rulesAndFormulas`).toBeGreaterThan(0);
      expect(g.stepByStepMethod.length, `${code} stepByStepMethod`).toBeGreaterThan(1);
      expect(g.commonTraps.length, `${code} commonTraps`).toBeGreaterThan(0);
      expect(g.workedExample.problem.trim().length, `${code} worked problem`).toBeGreaterThan(0);
      expect(g.workedExample.steps.length, `${code} worked steps`).toBeGreaterThan(1);
      expect(g.workedExample.answer.trim().length, `${code} worked answer`).toBeGreaterThan(0);
      expect(g.workedExample.whyItMattersForSSA.trim().length, `${code} why`).toBeGreaterThan(0);
    }
  });

  it('quotes no weight for a domain inside a combined band', () => {
    const grouped = new Set(
      GRADE_3_DOMAINS.filter((d) => d.weightGroup).flatMap((d) => d.standards.map((s) => s.code)),
    );
    for (const [code, g] of Object.entries(GRADE_3_STUDY_GUIDES)) {
      if (!grouped.has(code)) continue;
      expect(
        /\d+\s*[-–]\s*\d+\s*%|\b\d+\s*%/.test(g.workedExample.whyItMattersForSSA),
        `${code} cites a percentage for a domain that shares a band`,
      ).toBe(false);
    }
  });
});
```

- [ ] **Step 2: Run it and watch it fail**

Run: `npx vitest run src/curriculum/grade3/studyGuides.test.ts`
Expected: FAIL — `./studyGuides` does not exist.

- [ ] **Step 3: Write the guides**

20 entries, to the depth described in Task 10 Step 3. For OA, NBT, and NF standards `whyItMattersForSSA` may cite 32–36%, 9–13%, and 28–32% respectively; for MD and G it may cite no percentage at all.

Write for a nine-year-old. A Grade 3 guide that reads like the Grade 5 guides has failed even if every field is filled.

- [ ] **Step 4: Run the test**

Run: `npx vitest run src/curriculum/grade3/studyGuides.test.ts`
Expected: PASS, 3 tests.

- [ ] **Step 5: Lint, typecheck, commit**

```bash
npm run lint && npx tsc -b --noEmit
git add -A
git commit -m "feat: add grade 3 study guides"
```

---

### Task 16: Register Grade 3

**Files:**

- Create: `src/curriculum/grade3/quizzes.ts`, `src/curriculum/grade3/index.ts`, `src/curriculum/grade3/grade3.test.ts`
- Modify: `src/curriculum/registry.ts`

**Interfaces:**

- Consumes: everything Tasks 12–15 produced.
- Produces: `GRADE_3: GradeCurriculum`, registered under key `3`.

- [ ] **Step 1: Write the failing test**

Create `src/curriculum/grade3/grade3.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { GRADE_3 } from './index';
import { getCurriculum, listCurricula, standardsOf, domainWeight } from '../registry';

describe('grade 3 curriculum', () => {
  it('is registered and reachable by grade number', () => {
    expect(getCurriculum(3)).toBe(GRADE_3);
    expect(listCurricula().map((c) => c.grade)).toContain(3);
  });

  it('declares the WCPSS passing bar and what mastery skips', () => {
    expect(GRADE_3.ssa.passingPercent).toBe(80);
    expect(GRADE_3.ssa.targetsGrade).toBe(3);
  });

  it('cites the NCDPI blueprint, the lowest grade that has one', () => {
    expect(GRADE_3.weighting.kind).toBe('ncdpi-blueprint');
  });

  it('totals its domain weights to 100 through domainWeight', () => {
    const total = GRADE_3.domains.reduce((sum, d) => sum + domainWeight(GRADE_3, d.id), 0);
    expect(total).toBeGreaterThan(99);
    expect(total).toBeLessThan(101);
  });

  it('has content for all 20 standards', () => {
    expect(standardsOf(GRADE_3).length).toBe(20);
    const withContent = new Set(GRADE_3.source.allStandardsWithContent());
    for (const s of standardsOf(GRADE_3)) {
      expect(withContent.has(s.code), `no content for ${s.code}`).toBe(true);
    }
    expect(GRADE_3.contentComplete).toBe(true);
  });

  it('generates a renewable practice pool for most of the grade', () => {
    const generated = standardsOf(GRADE_3).filter((s) => GRADE_3.source.hasGenerator(s.code));
    expect(generated.length).toBeGreaterThanOrEqual(10);
  });

  it('serves its own quizzes, not another grade\'s', () => {
    expect(GRADE_3.quizzes.length).toBeGreaterThan(0);
    for (const q of GRADE_3.quizzes) {
      for (const id of q.questionIds) {
        expect(id.startsWith('g3.'), `quiz ${q.id} carries non-grade-3 item ${id}`).toBe(true);
      }
    }
  });
});
```

- [ ] **Step 2: Run it and watch it fail**

Run: `npx vitest run src/curriculum/grade3/grade3.test.ts`
Expected: FAIL — `./index` does not exist.

- [ ] **Step 3: Write the quizzes**

Create `src/curriculum/grade3/quizzes.ts` exporting `GRADE_3_QUIZZES`: `g3-diagnostic-01` (one item per standard, 20 items, `isDiagnostic: true`, `timeLimitMinutes: 40`, subtitle a function of the curriculum); five module drills `g3-mod-oa-01`, `g3-mod-nbt-01`, `g3-mod-nf-01`, `g3-mod-md-01`, `g3-mod-g-01`; and `g3-mock-ssa-01`, roughly 28 items allocated by band — about 9 OA, 3 NBT, 8 NF, and 8 across MD and Geometry together.

- [ ] **Step 4: Write the curriculum module**

Create `src/curriculum/grade3/index.ts`:

```ts
import type { GradeCurriculum } from '../types';
import { GRADE_3_DOMAINS } from './standards';
import { makeQuestionSource } from '../../engine/questionSource';
import { GRADE_3_AUTHORED } from './authored';
import { GRADE_3_TEMPLATES } from './templates';
import { GRADE_3_STUDY_GUIDES } from './studyGuides';
import { GRADE_3_QUIZZES } from './quizzes';

export { GRADE_3_DOMAINS } from './standards';

export const GRADE_3: GradeCurriculum = {
  grade: 3,
  label: 'Grade 3 Mathematics',
  ssa: { passingPercent: 80, targetsGrade: 3 },
  weighting: {
    kind: 'ncdpi-blueprint',
    source: 'NCDPI EOG Mathematics Grades 3-8 Test Specifications, April 2026',
  },
  contentComplete: true,
  domains: GRADE_3_DOMAINS,
  studyGuides: GRADE_3_STUDY_GUIDES,
  quizzes: GRADE_3_QUIZZES,
  source: makeQuestionSource(GRADE_3_AUTHORED, GRADE_3_TEMPLATES),
};
```

- [ ] **Step 5: Register it**

Add `3: GRADE_3,` to `CURRICULA` in `src/curriculum/registry.ts`, with the matching import.

- [ ] **Step 6: Run the whole suite**

Run: `npm test -- --run`
Expected: PASS.

- [ ] **Step 7: Lint, typecheck, commit**

```bash
npm run lint && npx tsc -b --noEmit
git add -A
git commit -m "feat: register grade 3 as a playable curriculum"
```

---

# Batch E — Grade 2

The first grade with no EOG and therefore no blueprint. Task 21 carries a UI change the earlier grades did not need.

### Task 17: Grade 2 Operations & Algebraic Thinking and Geometry

Two small domains in one task: OA has four standards, G has two.

**Files:**

- Create: `src/curriculum/grade2/authored.oa.ts`, `src/curriculum/grade2/authored.oa.test.ts`
- Create: `src/curriculum/grade2/authored.g.ts`, `src/curriculum/grade2/authored.g.test.ts`
- Create: template files under `src/curriculum/grade2/templates/`, each with a sibling test, plus `src/curriculum/grade2/templates/index.ts`
- Modify: `src/curriculum/misconceptions.ts`

**Standards covered (6):** OA — `NC.2.OA.1`, `NC.2.OA.2`, `NC.2.OA.3`, `NC.2.OA.4`. G — `NC.2.G.1`, `NC.2.G.3`.

**Interfaces:**

- Consumes: `assertAuthoredBankSound`, `GRADE_2_DOMAINS` from `./standards` (Task 4), `assertTemplateSound`.
- Produces: `GRADE_2_OA_AUTHORED`, `GRADE_2_G_AUTHORED`; `GRADE_2_TEMPLATES` from `src/curriculum/grade2/templates/index.ts`, which Tasks 18–19 append to. Templates named `g2.<domain><tail>.<slug>`.

**Reading level is a correctness requirement here.** A seven-year-old is the reader. Short sentences, one clause each, numbers within the range the standard names, and no prompt that takes longer to read than to solve.

- [ ] **Step 1: Write the failing tests**

Create `src/curriculum/grade2/authored.oa.test.ts`:

```ts
import { describe, it } from 'vitest';
import { assertAuthoredBankSound } from '../authoredBank.testkit';
import { GRADE_2_DOMAINS } from './standards';
import { GRADE_2_OA_AUTHORED } from './authored.oa';

describe('grade 2 OA authored bank', () => {
  it('holds every authored-bank invariant', () => {
    const oa = GRADE_2_DOMAINS.find((d) => d.id === 'OA')!;
    assertAuthoredBankSound(GRADE_2_OA_AUTHORED, oa);
  });
});
```

Create `src/curriculum/grade2/authored.g.test.ts` with the same shape for `G` and `GRADE_2_G_AUTHORED`.

- [ ] **Step 2: Run them and watch them fail**

Run: `npx vitest run src/curriculum/grade2`
Expected: FAIL — neither authored file exists.

- [ ] **Step 3: Author both banks**

OA: at least three items per standard, twelve minimum. Errors worth naming: counting on by ones and landing one short; choosing addition because the word "more" appeared, in a problem that needed subtraction; miscounting an array by counting a shared row or column twice; calling an odd number even because it ends in a digit the child associates with pairs.

G: at least three items per standard, six minimum. Errors are definitional: naming a shape by its orientation ("that triangle is upside down so it isn't a triangle"); counting a cube's faces as four because only four are visible in the picture; partitioning a rectangle into unequal parts and calling them halves.

- [ ] **Step 4: Write the templates**

Templates for addition and subtraction within 100 in a word-problem frame (`NC.2.OA.1`), for fluency within 20 (`NC.2.OA.2`), and for odd and even and for arrays (`NC.2.OA.3`, `NC.2.OA.4`). Geometry stays authored.

Create `src/curriculum/grade2/templates/index.ts` exporting `GRADE_2_TEMPLATES`. Each template gets a sibling test as in Task 12 Step 4.

- [ ] **Step 5: Declare any new misconception tags**

As in Task 5 Step 6. Grade 2 will need genuinely new tags — the existing vocabulary was built for Grade 5 and has nothing for counting errors or for keyword-driven operation choice at this level.

- [ ] **Step 6: Run the tests**

Run: `npx vitest run src/curriculum/grade2 src/curriculum/misconceptions.test.ts`
Expected: PASS.

- [ ] **Step 7: Lint, typecheck, commit**

```bash
npm run lint && npx tsc -b --noEmit
git add -A
git commit -m "feat: add grade 2 operations and geometry content"
```

---

### Task 18: Grade 2 Number & Operations in Base Ten

**Files:**

- Create: `src/curriculum/grade2/authored.nbt.ts`, `src/curriculum/grade2/authored.nbt.test.ts`
- Create: template files under `src/curriculum/grade2/templates/`, each with a sibling test
- Modify: `src/curriculum/grade2/templates/index.ts`, `src/curriculum/misconceptions.ts`

**Standards covered (8):** `NC.2.NBT.1`, `NC.2.NBT.2`, `NC.2.NBT.3`, `NC.2.NBT.4`, `NC.2.NBT.5`, `NC.2.NBT.6`, `NC.2.NBT.7`, `NC.2.NBT.8`.

**Interfaces:**

- Consumes: `assertAuthoredBankSound`, `GRADE_2_DOMAINS`, `assertTemplateSound`.
- Produces: `GRADE_2_NBT_AUTHORED: Question[]`; templates named `g2.nbt<tail>.<slug>`.

- [ ] **Step 1: Write the failing test**

Create `src/curriculum/grade2/authored.nbt.test.ts`:

```ts
import { describe, it } from 'vitest';
import { assertAuthoredBankSound } from '../authoredBank.testkit';
import { GRADE_2_DOMAINS } from './standards';
import { GRADE_2_NBT_AUTHORED } from './authored.nbt';

describe('grade 2 NBT authored bank', () => {
  it('holds every authored-bank invariant', () => {
    const nbt = GRADE_2_DOMAINS.find((d) => d.id === 'NBT')!;
    assertAuthoredBankSound(GRADE_2_NBT_AUTHORED, nbt);
  });
});
```

- [ ] **Step 2: Run it and watch it fail**

Run: `npx vitest run src/curriculum/grade2/authored.nbt.test.ts`
Expected: FAIL — `./authored.nbt` does not exist.

- [ ] **Step 3: Author the bank**

At least three items per standard, twenty-four minimum. This is place value's founding year, so the distractors are place-value errors stated precisely: reading 407 as "forty-seven"; adding tens to ones when the columns are misaligned; failing to regroup and writing the larger digit minus the smaller in each column regardless of which is on top; counting by tens from 380 and going to 390, 400, 410 but writing 300, 400, 500.

- [ ] **Step 4: Write the templates**

Every NBT standard here is computational and gets a template: three-digit place value (`NC.2.NBT.1`), skip counting (`NC.2.NBT.2`), reading and writing numbers in several forms (`NC.2.NBT.3`), comparison (`NC.2.NBT.4`), addition and subtraction within 100 (`NC.2.NBT.5`), adding up to four two-digit numbers (`NC.2.NBT.6`), addition and subtraction within 1000 (`NC.2.NBT.7`), and adding or subtracting 10 and 100 mentally (`NC.2.NBT.8`).

Each gets a sibling test as in Task 12 Step 4. Append to `GRADE_2_TEMPLATES`.

- [ ] **Step 5: Declare any new misconception tags**

As in Task 5 Step 6.

- [ ] **Step 6: Run the tests**

Run: `npx vitest run src/curriculum/grade2 src/curriculum/misconceptions.test.ts`
Expected: PASS.

- [ ] **Step 7: Lint, typecheck, commit**

```bash
npm run lint && npx tsc -b --noEmit
git add -A
git commit -m "feat: add grade 2 base ten content"
```

---

### Task 19: Grade 2 Measurement & Data, and the authored aggregate

The largest single domain in the project: nine standards.

**Files:**

- Create: `src/curriculum/grade2/authored.md.ts`, `src/curriculum/grade2/authored.md.test.ts`
- Create: `src/curriculum/grade2/authored.ts`
- Create: template files under `src/curriculum/grade2/templates/`, each with a sibling test
- Modify: `src/curriculum/grade2/templates/index.ts`, `src/curriculum/misconceptions.ts`

**Standards covered (9):** `NC.2.MD.1`, `NC.2.MD.2`, `NC.2.MD.3`, `NC.2.MD.4`, `NC.2.MD.5`, `NC.2.MD.6`, `NC.2.MD.7`, `NC.2.MD.8`, `NC.2.MD.10`.

**Interfaces:**

- Consumes: `assertAuthoredBankSound`, `GRADE_2_DOMAINS`.
- Produces: `GRADE_2_MD_AUTHORED`; `GRADE_2_AUTHORED: Question[]` from `src/curriculum/grade2/authored.ts`, which Task 21 passes to `makeQuestionSource`.

- [ ] **Step 1: Write the failing tests**

Create `src/curriculum/grade2/authored.md.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { assertAuthoredBankSound } from '../authoredBank.testkit';
import { GRADE_2_DOMAINS } from './standards';
import { GRADE_2_MD_AUTHORED } from './authored.md';
import { GRADE_2_AUTHORED } from './authored';

describe('grade 2 MD authored bank', () => {
  it('holds every authored-bank invariant', () => {
    const md = GRADE_2_DOMAINS.find((d) => d.id === 'MD')!;
    assertAuthoredBankSound(GRADE_2_MD_AUTHORED, md);
  });
});

describe('grade 2 authored aggregate', () => {
  it('carries every item exactly once', () => {
    const ids = GRADE_2_AUTHORED.map((q) => q.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('covers every grade 2 standard', () => {
    const covered = new Set(GRADE_2_AUTHORED.map((q) => q.standardCode));
    for (const s of GRADE_2_DOMAINS.flatMap((d) => d.standards)) {
      expect(covered.has(s.code), `no authored item for ${s.code}`).toBe(true);
    }
  });
});
```

- [ ] **Step 2: Run it and watch it fail**

Run: `npx vitest run src/curriculum/grade2/authored.md.test.ts`
Expected: FAIL — `./authored.md` and `./authored` do not exist.

- [ ] **Step 3: Author the bank**

At least three items per standard, twenty-seven minimum. Grade 2 measurement errors to name: measuring from the end of a ruler rather than from zero; counting tick marks instead of intervals; reading a clock's minute hand as the hour; counting a coin collection by coin rather than by value; picking the wrong unit entirely (measuring a pencil in metres).

For any item involving a ruler, clock, coins, or a graph, describe it in `promptDetails` as text — no image assets. A coin problem states the coins in words.

- [ ] **Step 4: Write the templates**

Templates for measurement with a fixed unit (`NC.2.MD.1`, `NC.2.MD.2`), for measurement word problems (`NC.2.MD.5`), for time (`NC.2.MD.6`), for money (`NC.2.MD.7`), and for reading data (`NC.2.MD.10`). Standards whose item is inherently a described figure — estimating a length (`NC.2.MD.3`), comparing two lengths (`NC.2.MD.4`), and the number line representation (`NC.2.MD.8`) — may stay authored if a generated version would produce interchangeable items.

Each gets a sibling test as in Task 12 Step 4. Append to `GRADE_2_TEMPLATES`.

- [ ] **Step 5: Write the aggregator**

Create `src/curriculum/grade2/authored.ts` joining `GRADE_2_OA_AUTHORED`, `GRADE_2_NBT_AUTHORED`, `GRADE_2_MD_AUTHORED`, and `GRADE_2_G_AUTHORED` into `GRADE_2_AUTHORED: Question[]`, in that order, with a doc comment matching Task 9's aggregator.

- [ ] **Step 6: Declare any new misconception tags**

As in Task 5 Step 6.

- [ ] **Step 7: Run the tests**

Run: `npx vitest run src/curriculum/grade2 src/curriculum/misconceptions.test.ts`
Expected: PASS, including "covers every grade 2 standard".

- [ ] **Step 8: Lint, typecheck, commit**

```bash
npm run lint && npx tsc -b --noEmit
git add -A
git commit -m "feat: add grade 2 measurement and data content"
```

---

### Task 20: Grade 2 study guides

**Files:**

- Create: `src/curriculum/grade2/studyGuides.ts`, `src/curriculum/grade2/studyGuides.test.ts`

**Interfaces:**

- Consumes: `StudyGuideSection`, `GRADE_2_DOMAINS`.
- Produces: `GRADE_2_STUDY_GUIDES: Record<string, StudyGuideSection>`.

One entry for each of the 23 Grade 2 standards. **No guide may cite a percentage at all** — NCDPI publishes no blueprint below Grade 3, so there is no weight to cite for any Grade 2 domain.

- [ ] **Step 1: Write the failing test**

Create `src/curriculum/grade2/studyGuides.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { GRADE_2_DOMAINS } from './standards';
import { GRADE_2_STUDY_GUIDES } from './studyGuides';

const STANDARDS = GRADE_2_DOMAINS.flatMap((d) => d.standards);

describe('grade 2 study guides', () => {
  it('writes one guide per standard, keyed by its own code', () => {
    for (const s of STANDARDS) {
      const guide = GRADE_2_STUDY_GUIDES[s.code];
      expect(guide, `no study guide for ${s.code}`).toBeTruthy();
      expect(guide.standardCode).toBe(s.code);
    }
    expect(Object.keys(GRADE_2_STUDY_GUIDES).length).toBe(STANDARDS.length);
  });

  it('fills every section of every guide', () => {
    for (const [code, g] of Object.entries(GRADE_2_STUDY_GUIDES)) {
      expect(g.title.trim().length, `${code} title`).toBeGreaterThan(0);
      expect(g.coreConcept.trim().length, `${code} coreConcept`).toBeGreaterThan(0);
      expect(g.rulesAndFormulas.length, `${code} rulesAndFormulas`).toBeGreaterThan(0);
      expect(g.stepByStepMethod.length, `${code} stepByStepMethod`).toBeGreaterThan(1);
      expect(g.commonTraps.length, `${code} commonTraps`).toBeGreaterThan(0);
      expect(g.workedExample.problem.trim().length, `${code} worked problem`).toBeGreaterThan(0);
      expect(g.workedExample.steps.length, `${code} worked steps`).toBeGreaterThan(1);
      expect(g.workedExample.answer.trim().length, `${code} worked answer`).toBeGreaterThan(0);
      expect(g.workedExample.whyItMattersForSSA.trim().length, `${code} why`).toBeGreaterThan(0);
    }
  });

  it('cites no assessment weight, because grade 2 has no state assessment', () => {
    for (const [code, g] of Object.entries(GRADE_2_STUDY_GUIDES)) {
      expect(/%/.test(g.workedExample.whyItMattersForSSA), `${code} cites a percentage`).toBe(false);
      expect(/blueprint/i.test(JSON.stringify(g)), `${code} mentions a blueprint`).toBe(false);
    }
  });
});
```

- [ ] **Step 2: Run it and watch it fail**

Run: `npx vitest run src/curriculum/grade2/studyGuides.test.ts`
Expected: FAIL — `./studyGuides` does not exist.

- [ ] **Step 3: Write the guides**

23 entries, at the depth described in Task 10 Step 3 but pitched at a seven-year-old and the adult sitting beside them. `whyItMattersForSSA` says what the skill unlocks next — "counting by tens is how adding 10 in your head stops needing paper" — rather than citing a test.

- [ ] **Step 4: Run the test**

Run: `npx vitest run src/curriculum/grade2/studyGuides.test.ts`
Expected: PASS, 3 tests.

- [ ] **Step 5: Lint, typecheck, commit**

```bash
npm run lint && npx tsc -b --noEmit
git add -A
git commit -m "feat: add grade 2 study guides"
```

---

### Task 21: Register Grade 2, and stop the UI claiming a blueprint that does not exist

Grade 2 is the first curriculum with `weighting.kind === 'even-by-standard-count'`. Two components label the weight column **"NC Blueprint Weight"** unconditionally. Registering Grade 2 without changing them would put a fabricated claim of officialness on screen — the same class of defect as the corrected Grade 5 weights, arrived at from the other direction.

**Files:**

- Create: `src/curriculum/grade2/quizzes.ts`, `src/curriculum/grade2/index.ts`, `src/curriculum/grade2/grade2.test.ts`
- Modify: `src/curriculum/registry.ts` (register, and add `weightHeading`)
- Modify: `src/components/CurriculumView.tsx`, `src/components/PrintReportModal.tsx`
- Test: `src/curriculum/registry.test.ts`

**Interfaces:**

- Consumes: everything Tasks 17–20 produced.
- Produces: `GRADE_2: GradeCurriculum` registered under key `2`; `weightHeading(c: GradeCurriculum): string` from `src/curriculum/registry.ts`, used by both components.

- [ ] **Step 1: Write the failing heading test**

Append to `src/curriculum/registry.test.ts`:

```ts
describe('weight headings', () => {
  it('calls a blueprint a blueprint only where one exists', () => {
    const g5 = getCurriculum(5);
    expect(weightHeading(g5)).toBe('NC Blueprint Weight');
  });

  it('calls an unweighted grade what it is', () => {
    const g2 = getCurriculum(2);
    expect(weightHeading(g2)).toBe('Share of Grade Standards');
    expect(weightHeading(g2)).not.toMatch(/blueprint/i);
  });
});
```

Add `weightHeading` and `getCurriculum` to the imports from `./registry`.

- [ ] **Step 2: Run it and watch it fail**

Run: `npx vitest run src/curriculum/registry.test.ts`
Expected: FAIL — `weightHeading` is not exported, and grade 2 is not registered.

- [ ] **Step 3: Add the helper**

In `src/curriculum/registry.ts`:

```ts
/** What to call the weight column for this grade. NCDPI publishes EOG
 *  blueprints for grades 3-8 only, so below grade 3 the figure is our own
 *  even split by standard count and must not be labelled official. */
export function weightHeading(c: GradeCurriculum): string {
  return c.weighting.kind === 'ncdpi-blueprint'
    ? 'NC Blueprint Weight'
    : 'Share of Grade Standards';
}
```

- [ ] **Step 4: Write the quizzes and the curriculum module**

Create `src/curriculum/grade2/quizzes.ts` exporting `GRADE_2_QUIZZES`: `g2-diagnostic-01` (one item per standard, 23 items, `timeLimitMinutes: 35`), four module drills `g2-mod-oa-01`, `g2-mod-nbt-01`, `g2-mod-md-01`, `g2-mod-g-01`, and `g2-mock-ssa-01` of roughly 25 items split in proportion to each domain's standard count, since no blueprint exists to weight it by.

Create `src/curriculum/grade2/index.ts`:

```ts
import type { GradeCurriculum } from '../types';
import { GRADE_2_DOMAINS } from './standards';
import { makeQuestionSource } from '../../engine/questionSource';
import { GRADE_2_AUTHORED } from './authored';
import { GRADE_2_TEMPLATES } from './templates';
import { GRADE_2_STUDY_GUIDES } from './studyGuides';
import { GRADE_2_QUIZZES } from './quizzes';

export { GRADE_2_DOMAINS } from './standards';

export const GRADE_2: GradeCurriculum = {
  grade: 2,
  label: 'Grade 2 Mathematics',
  ssa: { passingPercent: 80, targetsGrade: 2 },
  // NCDPI publishes no EOG blueprint below grade 3; there is no state
  // assessment to weight against, so domains share weight by standard count.
  weighting: { kind: 'even-by-standard-count' },
  contentComplete: true,
  domains: GRADE_2_DOMAINS,
  studyGuides: GRADE_2_STUDY_GUIDES,
  quizzes: GRADE_2_QUIZZES,
  source: makeQuestionSource(GRADE_2_AUTHORED, GRADE_2_TEMPLATES),
};
```

Register it: add `2: GRADE_2,` to `CURRICULA`.

- [ ] **Step 5: Rewire the two components**

In `src/components/CurriculumView.tsx`, replace the hardcoded `NC Blueprint Weight` label text with `{weightHeading(curriculum)}` and add `weightHeading` to the existing `../curriculum/registry` import. Do the same in `src/components/PrintReportModal.tsx`, whose label sits beside the `weightLabel(curriculum, domain.id)` call added in commit `6a851cf`.

`PrintReportModal.tsx:273` also advises the parent to "Prioritize the domains with the highest NC EOG blueprint weight above" — untrue for a grade with no blueprint. Make that sentence conditional on `curriculum.weighting.kind`, telling an unweighted grade's parent to prioritise the domains furthest below the qualifying bar instead.

Run `grep -rn "Blueprint Weight\|blueprint weight" src/` afterwards; every remaining occurrence must sit inside `weightHeading` or behind a `weighting.kind` check.

- [ ] **Step 6: Write the grade 2 curriculum test**

Create `src/curriculum/grade2/grade2.test.ts`, mirroring `grade3.test.ts` from Task 16 Step 1 but asserting: `getCurriculum(2) === GRADE_2`; `ssa.passingPercent` 80 and `ssa.targetsGrade` 2; `weighting.kind === 'even-by-standard-count'`; weights totalling 100 through `domainWeight`; 23 standards all with content and `contentComplete: true`; at least 10 standards with a generator; and every quiz item id starting with `g2.`.

Add one assertion the blueprint grades do not need:

```ts
  it('claims no official weight anywhere in its domain data', () => {
    for (const d of GRADE_2.domains) {
      expect(d.officialWeightRange).not.toMatch(/%/);
      expect(d.weightGroup).toBeUndefined();
    }
  });
```

- [ ] **Step 7: Run the whole suite**

Run: `npm test -- --run`
Expected: PASS.

- [ ] **Step 8: Verify in a browser**

Run `npm run dev`, switch the profile to Grade 2, and confirm the Curriculum tab reads "Share of Grade Standards" with no percentage claimed as official, that the printed parent report says the same, and that Grade 5 still reads "NC Blueprint Weight".

- [ ] **Step 9: Lint, typecheck, commit**

```bash
npm run lint && npx tsc -b --noEmit
git add -A
git commit -m "feat: register grade 2 and label unweighted grades honestly"
```

---

# Batch F — Grade 1

### Task 22: Grade 1 Operations & Algebraic Thinking

**Files:**

- Create: `src/curriculum/grade1/authored.oa.ts`, `src/curriculum/grade1/authored.oa.test.ts`
- Create: template files under `src/curriculum/grade1/templates/`, each with a sibling test, plus `src/curriculum/grade1/templates/index.ts`
- Modify: `src/curriculum/misconceptions.ts`

**Standards covered (8):** `NC.1.OA.1`, `NC.1.OA.2`, `NC.1.OA.3`, `NC.1.OA.4`, `NC.1.OA.9`, `NC.1.OA.6`, `NC.1.OA.7`, `NC.1.OA.8`.

**Interfaces:**

- Consumes: `assertAuthoredBankSound`, `GRADE_1_DOMAINS` from `./standards` (Task 4), `assertTemplateSound`.
- Produces: `GRADE_1_OA_AUTHORED`; `GRADE_1_TEMPLATES` from `src/curriculum/grade1/templates/index.ts`, which Tasks 23–24 append to. Templates named `g1.oa<tail>.<slug>`.

**The hardest audience in the project.** A six-year-old is reading these, often aloud with a parent. Every prompt is one short sentence. Numbers stay within 20 unless the standard says otherwise. No prompt uses a word a first-grader would not read — write "how many are left", not "determine the remaining quantity".

- [ ] **Step 1: Write the failing test**

Create `src/curriculum/grade1/authored.oa.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { assertAuthoredBankSound } from '../authoredBank.testkit';
import { GRADE_1_DOMAINS } from './standards';
import { GRADE_1_OA_AUTHORED } from './authored.oa';

describe('grade 1 OA authored bank', () => {
  it('holds every authored-bank invariant', () => {
    const oa = GRADE_1_DOMAINS.find((d) => d.id === 'OA')!;
    assertAuthoredBankSound(GRADE_1_OA_AUTHORED, oa);
  });

  it('keeps every prompt short enough for a six-year-old to read', () => {
    // Not a style preference. A first-grader who cannot read the question
    // gets it wrong for a reason the app would then misreport as a
    // mathematical misconception.
    for (const q of GRADE_1_OA_AUTHORED) {
      expect(q.prompt.length, `${q.id} prompt is ${q.prompt.length} chars`).toBeLessThan(120);
      const sentences = q.prompt.split(/[.?!]/).filter((s) => s.trim().length > 0);
      expect(sentences.length, `${q.id} has ${sentences.length} sentences`).toBeLessThanOrEqual(2);
    }
  });
});
```

- [ ] **Step 2: Run it and watch it fail**

Run: `npx vitest run src/curriculum/grade1/authored.oa.test.ts`
Expected: FAIL — `./authored.oa` does not exist.

- [ ] **Step 3: Author the bank**

At least three items per standard, twenty-four minimum. Grade 1 misconceptions are about counting and about what an equals sign means: counting the starting number as the first hop when counting on; answering `8 = 3 + ?` with 11 because the child added everything in sight; treating `=` as "here comes the answer" so `4 + 3 = ? + 2` gets 7; forgetting the last object when counting a set.

- [ ] **Step 4: Write the templates**

Templates for the computational standards: addition and subtraction word problems within 20 (`NC.1.OA.1`), three addends (`NC.1.OA.2`), fluency within 10 (`NC.1.OA.6`), and the unknown in any position (`NC.1.OA.8`). The property and equality standards (`NC.1.OA.3`, `NC.1.OA.4`, `NC.1.OA.7`, `NC.1.OA.9`) are reasoning and stay authored.

Create `src/curriculum/grade1/templates/index.ts` exporting `GRADE_1_TEMPLATES`. Each template gets a sibling test as in Task 12 Step 4, and each generated prompt must also satisfy the length rule above — assert it inside the template's own test.

- [ ] **Step 5: Declare any new misconception tags**

As in Task 5 Step 6.

- [ ] **Step 6: Run the tests**

Run: `npx vitest run src/curriculum/grade1 src/curriculum/misconceptions.test.ts`
Expected: PASS.

- [ ] **Step 7: Lint, typecheck, commit**

```bash
npm run lint && npx tsc -b --noEmit
git add -A
git commit -m "feat: add grade 1 operations and algebraic thinking content"
```

---

### Task 23: Grade 1 Number & Operations in Base Ten

**Files:**

- Create: `src/curriculum/grade1/authored.nbt.ts`, `src/curriculum/grade1/authored.nbt.test.ts`
- Create: template files under `src/curriculum/grade1/templates/`, each with a sibling test
- Modify: `src/curriculum/grade1/templates/index.ts`, `src/curriculum/misconceptions.ts`

**Standards covered (7):** `NC.1.NBT.1`, `NC.1.NBT.7`, `NC.1.NBT.2`, `NC.1.NBT.3`, `NC.1.NBT.4`, `NC.1.NBT.5`, `NC.1.NBT.6`.

**Interfaces:**

- Consumes: `assertAuthoredBankSound`, `GRADE_1_DOMAINS`, `assertTemplateSound`.
- Produces: `GRADE_1_NBT_AUTHORED`; templates named `g1.nbt<tail>.<slug>`.

- [ ] **Step 1: Write the failing test**

Create `src/curriculum/grade1/authored.nbt.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { assertAuthoredBankSound } from '../authoredBank.testkit';
import { GRADE_1_DOMAINS } from './standards';
import { GRADE_1_NBT_AUTHORED } from './authored.nbt';

describe('grade 1 NBT authored bank', () => {
  it('holds every authored-bank invariant', () => {
    const nbt = GRADE_1_DOMAINS.find((d) => d.id === 'NBT')!;
    assertAuthoredBankSound(GRADE_1_NBT_AUTHORED, nbt);
  });

  it('keeps every prompt short enough for a six-year-old to read', () => {
    for (const q of GRADE_1_NBT_AUTHORED) {
      expect(q.prompt.length, `${q.id} prompt is ${q.prompt.length} chars`).toBeLessThan(120);
      const sentences = q.prompt.split(/[.?!]/).filter((s) => s.trim().length > 0);
      expect(sentences.length, `${q.id} has ${sentences.length} sentences`).toBeLessThanOrEqual(2);
    }
  });
});
```

- [ ] **Step 2: Run it and watch it fail**

Run: `npx vitest run src/curriculum/grade1/authored.nbt.test.ts`
Expected: FAIL — `./authored.nbt` does not exist.

- [ ] **Step 3: Author the bank**

At least three items per standard, twenty-one minimum. The founding place-value errors: reading a teen number backwards (13 as 31); seeing 4 tens and 2 ones and writing 24; believing 19 + 1 is 110; comparing two-digit numbers by their ones digit.

- [ ] **Step 4: Write the templates**

Templates for counting and writing numerals (`NC.1.NBT.1`), tens and ones (`NC.1.NBT.2`), comparison (`NC.1.NBT.3`), addition within 100 (`NC.1.NBT.4`), adding and subtracting 10 mentally (`NC.1.NBT.5`), subtracting multiples of 10 (`NC.1.NBT.6`), and grouping to count (`NC.1.NBT.7`).

Each gets a sibling test as in Task 12 Step 4, plus the prompt-length assertion. Append to `GRADE_1_TEMPLATES`.

- [ ] **Step 5: Declare any new misconception tags**

As in Task 5 Step 6.

- [ ] **Step 6: Run the tests**

Run: `npx vitest run src/curriculum/grade1 src/curriculum/misconceptions.test.ts`
Expected: PASS.

- [ ] **Step 7: Lint, typecheck, commit**

```bash
npm run lint && npx tsc -b --noEmit
git add -A
git commit -m "feat: add grade 1 base ten content"
```

---

### Task 24: Grade 1 Measurement, Geometry, and the authored aggregate

**Files:**

- Create: `src/curriculum/grade1/authored.md.ts`, `src/curriculum/grade1/authored.md.test.ts`
- Create: `src/curriculum/grade1/authored.g.ts`, `src/curriculum/grade1/authored.g.test.ts`
- Create: `src/curriculum/grade1/authored.ts`
- Create: template files under `src/curriculum/grade1/templates/`, each with a sibling test
- Modify: `src/curriculum/grade1/templates/index.ts`, `src/curriculum/misconceptions.ts`

**Standards covered (8):** MD — `NC.1.MD.1`, `NC.1.MD.2`, `NC.1.MD.3`, `NC.1.MD.5`, `NC.1.MD.4`. G — `NC.1.G.1`, `NC.1.G.2`, `NC.1.G.3`.

**Interfaces:**

- Consumes: `assertAuthoredBankSound`, `GRADE_1_DOMAINS`.
- Produces: `GRADE_1_MD_AUTHORED`, `GRADE_1_G_AUTHORED`, and `GRADE_1_AUTHORED: Question[]` from `src/curriculum/grade1/authored.ts`, which Task 26 passes to `makeQuestionSource`.

- [ ] **Step 1: Write the failing tests**

Create `src/curriculum/grade1/authored.md.test.ts` and `src/curriculum/grade1/authored.g.test.ts`, each calling `assertAuthoredBankSound` for its domain and repeating the prompt-length assertion from Task 22 Step 1 over its own array. Put the aggregate assertions in the geometry test:

```ts
describe('grade 1 authored aggregate', () => {
  it('carries every item exactly once', () => {
    const ids = GRADE_1_AUTHORED.map((q) => q.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('covers every grade 1 standard', () => {
    const covered = new Set(GRADE_1_AUTHORED.map((q) => q.standardCode));
    for (const s of GRADE_1_DOMAINS.flatMap((d) => d.standards)) {
      expect(covered.has(s.code), `no authored item for ${s.code}`).toBe(true);
    }
  });
});
```

- [ ] **Step 2: Run them and watch them fail**

Run: `npx vitest run src/curriculum/grade1`
Expected: FAIL — the three new modules do not exist.

- [ ] **Step 3: Author both banks**

MD: at least three items per standard, fifteen minimum. Errors: ordering three objects by length by comparing only two of them; leaving gaps between the units when measuring by iteration; telling time to the half hour by reading the hour hand as if it pointed exactly at a number.

G: at least three items per standard, nine minimum. Errors: naming a shape by orientation; calling a shape a rectangle because it has four sides; splitting a circle into two unequal pieces and calling each a half; composing two shapes and expecting the new shape to keep both names.

- [ ] **Step 4: Write the templates**

Templates for ordering and measuring lengths (`NC.1.MD.1`, `NC.1.MD.2`) and for reading data (`NC.1.MD.4`). Time (`NC.1.MD.5`), money or coin recognition (`NC.1.MD.3`), and all three Geometry standards stay authored — they are described figures and vocabulary, where a generator would only shuffle labels.

Each gets a sibling test as in Task 12 Step 4, plus the prompt-length assertion. Append to `GRADE_1_TEMPLATES`.

- [ ] **Step 5: Write the aggregator**

Create `src/curriculum/grade1/authored.ts` joining `GRADE_1_OA_AUTHORED`, `GRADE_1_NBT_AUTHORED`, `GRADE_1_MD_AUTHORED`, and `GRADE_1_G_AUTHORED` into `GRADE_1_AUTHORED: Question[]`, in that order, with a doc comment matching Task 9's aggregator.

- [ ] **Step 6: Declare any new misconception tags**

As in Task 5 Step 6.

- [ ] **Step 7: Run the tests**

Run: `npx vitest run src/curriculum/grade1 src/curriculum/misconceptions.test.ts`
Expected: PASS, including "covers every grade 1 standard".

- [ ] **Step 8: Lint, typecheck, commit**

```bash
npm run lint && npx tsc -b --noEmit
git add -A
git commit -m "feat: add grade 1 measurement and geometry content"
```

---

### Task 25: Grade 1 study guides

**Files:**

- Create: `src/curriculum/grade1/studyGuides.ts`, `src/curriculum/grade1/studyGuides.test.ts`

**Interfaces:**

- Consumes: `StudyGuideSection`, `GRADE_1_DOMAINS`.
- Produces: `GRADE_1_STUDY_GUIDES: Record<string, StudyGuideSection>`.

One entry for each of the 23 Grade 1 standards. **No guide may cite a percentage**, for the same reason as Grade 2.

At this grade the study guide's real reader is the parent. Write `coreConcept` and `commonTraps` to be read aloud or paraphrased by an adult; keep `workedExample.problem` at the child's reading level.

- [ ] **Step 1: Write the failing test**

Create `src/curriculum/grade1/studyGuides.test.ts`, identical in shape to Task 20 Step 1's test but importing `GRADE_1_DOMAINS` and `GRADE_1_STUDY_GUIDES` and naming grade 1 in its `describe` block — including the third test asserting no percentage and no mention of a blueprint anywhere in any guide.

- [ ] **Step 2: Run it and watch it fail**

Run: `npx vitest run src/curriculum/grade1/studyGuides.test.ts`
Expected: FAIL — `./studyGuides` does not exist.

- [ ] **Step 3: Write the guides**

23 entries at the depth described in Task 10 Step 3, pitched as above.

- [ ] **Step 4: Run the test**

Run: `npx vitest run src/curriculum/grade1/studyGuides.test.ts`
Expected: PASS, 3 tests.

- [ ] **Step 5: Lint, typecheck, commit**

```bash
npm run lint && npx tsc -b --noEmit
git add -A
git commit -m "feat: add grade 1 study guides"
```

---

### Task 26: Register Grade 1 and close out the plan

**Files:**

- Create: `src/curriculum/grade1/quizzes.ts`, `src/curriculum/grade1/index.ts`, `src/curriculum/grade1/grade1.test.ts`
- Modify: `src/curriculum/registry.ts`
- Modify: `docs/superpowers/specs/2026-09-11-multi-grade-adaptive-math-design.md` (§13, the verification list)

**Interfaces:**

- Consumes: everything Tasks 22–25 produced.
- Produces: `GRADE_1: GradeCurriculum` registered under key `1`. After this task `listCurricula()` returns all five grades.

- [ ] **Step 1: Write the failing test**

Create `src/curriculum/grade1/grade1.test.ts`, mirroring `grade2.test.ts` from Task 21 Step 6: `getCurriculum(1) === GRADE_1`; `ssa.passingPercent` 80 and `ssa.targetsGrade` 1; `weighting.kind === 'even-by-standard-count'`; weights totalling 100 through `domainWeight`; 23 standards all with content and `contentComplete: true`; at least 8 standards with a generator; every quiz item id starting with `g1.`; and no `%` in any domain's `officialWeightRange`.

Add one test the other grades cannot make:

```ts
  it('completes the set: every grade from 1 to 5 is now playable', () => {
    const grades = listCurricula().map((c) => c.grade);
    expect(grades).toEqual([1, 2, 3, 4, 5]);
    for (const c of listCurricula()) {
      expect(c.contentComplete, `grade ${c.grade} is registered but incomplete`).toBe(true);
    }
  });
```

- [ ] **Step 2: Run it and watch it fail**

Run: `npx vitest run src/curriculum/grade1/grade1.test.ts`
Expected: FAIL — `./index` does not exist.

- [ ] **Step 3: Write the quizzes and the curriculum module**

Create `src/curriculum/grade1/quizzes.ts` exporting `GRADE_1_QUIZZES`: `g1-diagnostic-01` (one item per standard, 23 items, `timeLimitMinutes: 30` — a first-grader's attention, not a fifth-grader's), four module drills `g1-mod-oa-01`, `g1-mod-nbt-01`, `g1-mod-md-01`, `g1-mod-g-01`, and `g1-mock-ssa-01` of roughly 20 items split by standard count.

Create `src/curriculum/grade1/index.ts` in the shape of Task 21's Grade 2 module: `grade: 1`, `label: 'Grade 1 Mathematics'`, `ssa: { passingPercent: 80, targetsGrade: 1 }`, `weighting: { kind: 'even-by-standard-count' }` with the same explanatory comment, `contentComplete: true`, and the four content fields.

Register it: add `1: GRADE_1,` to `CURRICULA`.

- [ ] **Step 4: Run the whole suite**

Run: `npm test -- --run`
Expected: PASS. Every registry-driven test from Task 3 now runs five times.

- [ ] **Step 5: Confirm the privacy constraint one last time**

Run: `grep -rn "fetch(\|XMLHttpRequest\|sendBeacon\|WebSocket\|navigator.send\|analytics\|gtag" src/`
Expected: no output. This plan added thousands of lines of content; the constraint that nothing leaves the browser must survive all of it.

- [ ] **Step 6: Verify every grade in a browser**

Run `npm run dev` and, for each of grades 1 through 5: switch the profile to that grade, confirm the standard count matches the table in Task 4, open one study guide, run one quiz to its results screen, and print the parent report. Confirm grades 1 and 2 never use the word "blueprint" and never show a percentage as an official weight.

- [ ] **Step 7: Update the spec's verification list**

In §13 of `docs/superpowers/specs/2026-09-11-multi-grade-adaptive-math-design.md`, record what this plan verified and what still needs a human: the standards and weights are machine-checked against `docs/sources/`, but **the mathematical correctness of the authored items themselves is not** — no test can tell whether a distractor really is what a child would compute. Name that as owner verification.

- [ ] **Step 8: Lint, typecheck, build, commit**

```bash
npm run lint && npx tsc -b --noEmit && npm run build
git add -A
git commit -m "feat: register grade 1, completing grades 1-5"
```

---

## Self-Review

Checked after writing, against the spec.

**Spec coverage.** §5 curriculum data model — Task 4. §5.1 sourcing, and grades 1–2 having no blueprint — Task 4 and Tasks 21, 26. §5.2 four domains at grades 1–2, five at 3–5 — Task 4's table. §5.3 combined bands — Task 4's weight table, the Task 3 group test, and the study-guide percentage tests. §5.4 quizzes and study guides as curriculum data — Tasks 1–2. §6 question sources — every content task. §6.1 deterministic generators — the template tests. §6.3 engineered distractors — The Content Contract and `assertAuthoredBankSound`. §6.4 integrity test — Tasks 1–3. §7.4 static quizzes retained — Tasks 11, 16, 21, 26. §8.2 curriculum from context — Tasks 1, 2, 21. §10 testing — throughout.

Not covered here, deliberately: §8.3 migration, §8.4 first run, §9 landing page, §11 repo and deploy. Those are the previous plan's work or the owner's, and none of them blocks a grade from shipping.

**Known gap carried forward.** Grade 5 has seven standards with authored items but no generator, and `NC.5.MD.4` has a single authored question. This plan does not fix that — it is Grade 5 content work, not multi-grade work — and the `hasGenerator` floors here are written per grade so they do not silently mask it.

**Ordering.** Tasks 1–3 must precede every other task: Task 5's test kit assumes Task 3's registry-driven tests exist, and Tasks 11, 16, 21, and 26 each register a grade whose quizzes and study guides are only reachable through the fields Tasks 1–2 add. Task 4 must precede every content task. Within a grade, the aggregator task (9, 14, 19, 24) must follow that grade's other domain tasks, and the register task (11, 16, 21, 26) must come last.
