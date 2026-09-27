### Task 14: Grade 3 Measurement, Geometry, and the authored aggregate

**Files:**

- Create: `src/curriculum/grade3/authored.md.ts`, `src/curriculum/grade3/authored.md.test.ts`
- Create: `src/curriculum/grade3/authored.g.ts`, `src/curriculum/grade3/authored.g.test.ts`
- Create: `src/curriculum/grade3/authored.ts`
- Create: template files under `src/curriculum/grade3/templates/`, each with a sibling test
- Modify: `src/curriculum/grade3/templates/index.ts`, `src/curriculum/misconceptions.ts`

**Standards covered (7):** MD — `NC.3.MD.1`, `NC.3.MD.2`, `NC.3.MD.3`, `NC.3.MD.5`, `NC.3.MD.7`, `NC.3.MD.8`. G — `NC.3.G.1`.

**Interfaces:**

- Consumes: `assertAuthoredBankSound`, `GRADE_3_DOMAINS`.
- Produces: `GRADE_3_MD_AUTHORED`, `GRADE_3_G_AUTHORED`, and `GRADE_3_AUTHORED: Question[]` from `src/curriculum/grade3/authored.ts`, which Task 16 passes to `makeQuestionSource`.

**Weight note:** MD and Geometry share one 23–27% band at Grade 3. Neither may cite a weight of its own.

- [ ] **Step 1: Write the failing tests**

Create `src/curriculum/grade3/authored.md.test.ts`:

```ts
import { describe, it } from 'vitest';
import { assertAuthoredBankSound } from '../authoredBank.testkit';
import { GRADE_3_DOMAINS } from './standards';
import { GRADE_3_MD_AUTHORED } from './authored.md';

describe('grade 3 MD authored bank', () => {
  it('holds every authored-bank invariant', () => {
    const md = GRADE_3_DOMAINS.find((d) => d.id === 'MD')!;
    assertAuthoredBankSound(GRADE_3_MD_AUTHORED, md);
  });
});
```

Create `src/curriculum/grade3/authored.g.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { assertAuthoredBankSound } from '../authoredBank.testkit';
import { GRADE_3_DOMAINS } from './standards';
import { GRADE_3_G_AUTHORED } from './authored.g';
import { GRADE_3_AUTHORED } from './authored';

describe('grade 3 G authored bank', () => {
  it('holds every authored-bank invariant', () => {
    const g = GRADE_3_DOMAINS.find((d) => d.id === 'G')!;
    assertAuthoredBankSound(GRADE_3_G_AUTHORED, g);
  });
});

describe('grade 3 authored aggregate', () => {
  it('carries every item exactly once', () => {
    const ids = GRADE_3_AUTHORED.map((q) => q.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('covers every grade 3 standard', () => {
    const covered = new Set(GRADE_3_AUTHORED.map((q) => q.standardCode));
    for (const s of GRADE_3_DOMAINS.flatMap((d) => d.standards)) {
      expect(covered.has(s.code), `no authored item for ${s.code}`).toBe(true);
    }
  });
});
```

- [ ] **Step 2: Run them and watch them fail**

Run: `npx vitest run src/curriculum/grade3`
Expected: FAIL — `./authored.md`, `./authored.g`, and `./authored` do not exist.

- [ ] **Step 3: Author both banks**

MD: at least three items per standard, eighteen minimum. Grade 3 is where area and perimeter first collide, so name that error rather than merely producing a wrong number; also worth naming are reading an elapsed-time problem as a subtraction of clock digits, and reading a scaled bar graph as if each unit were one.

G: at least three items, and prefer more — this domain has one standard carrying the whole Geometry share. Errors are definitional: calling a shape a rectangle because it "looks like one" rather than by its right angles; partitioning a shape into unequal parts and calling each a quarter.

- [ ] **Step 4: Write the templates**

Templates for elapsed time and mass or volume word problems (`NC.3.MD.1`, `NC.3.MD.2`), for area by tiling and by multiplication (`NC.3.MD.5`, `NC.3.MD.7`), and for perimeter (`NC.3.MD.8`). `NC.3.MD.3` (scaled graphs) and `NC.3.G.1` (shape classification) stay authored: a generated bar graph is a figure, not a number, and shape classification is vocabulary.

Each gets a sibling test as in Task 12 Step 4. Append to `GRADE_3_TEMPLATES`.

- [ ] **Step 5: Write the aggregator**

Create `src/curriculum/grade3/authored.ts`:

```ts
import type { Question } from '../../engine/questionModel';
import { GRADE_3_OA_AUTHORED } from './authored.oa';
import { GRADE_3_NBT_AUTHORED } from './authored.nbt';
import { GRADE_3_NF_AUTHORED } from './authored.nf';
import { GRADE_3_MD_AUTHORED } from './authored.md';
import { GRADE_3_G_AUTHORED } from './authored.g';

/** The whole Grade 3 authored bank, joined from the per-domain files. */
export const GRADE_3_AUTHORED: Question[] = [
  ...GRADE_3_OA_AUTHORED,
  ...GRADE_3_NBT_AUTHORED,
  ...GRADE_3_NF_AUTHORED,
  ...GRADE_3_MD_AUTHORED,
  ...GRADE_3_G_AUTHORED,
];
```

- [ ] **Step 6: Declare any new misconception tags**

As in Task 5 Step 6.

- [ ] **Step 7: Run the tests**

Run: `npx vitest run src/curriculum/grade3 src/curriculum/misconceptions.test.ts`
Expected: PASS, including "covers every grade 3 standard".

- [ ] **Step 8: Lint, typecheck, commit**

```bash
npm run lint && npx tsc -b --noEmit
git add -A
git commit -m "feat: add grade 3 measurement and geometry content"
```

---

