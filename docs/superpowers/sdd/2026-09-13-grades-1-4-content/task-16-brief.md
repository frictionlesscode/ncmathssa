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

