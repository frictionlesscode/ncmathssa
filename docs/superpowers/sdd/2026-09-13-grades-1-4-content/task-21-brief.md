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

