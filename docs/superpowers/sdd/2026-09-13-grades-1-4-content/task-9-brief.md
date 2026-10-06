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

