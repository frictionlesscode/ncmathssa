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

