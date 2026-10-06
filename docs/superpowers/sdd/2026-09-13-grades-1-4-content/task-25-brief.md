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

