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

