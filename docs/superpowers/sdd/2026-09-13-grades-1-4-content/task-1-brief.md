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

