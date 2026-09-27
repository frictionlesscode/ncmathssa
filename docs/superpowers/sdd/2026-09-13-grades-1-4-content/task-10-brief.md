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

