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

