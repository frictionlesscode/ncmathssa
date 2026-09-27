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

