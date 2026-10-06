### Task 19: Grade 2 Measurement & Data, and the authored aggregate

The largest single domain in the project: nine standards.

**Files:**

- Create: `src/curriculum/grade2/authored.md.ts`, `src/curriculum/grade2/authored.md.test.ts`
- Create: `src/curriculum/grade2/authored.ts`
- Create: template files under `src/curriculum/grade2/templates/`, each with a sibling test
- Modify: `src/curriculum/grade2/templates/index.ts`, `src/curriculum/misconceptions.ts`

**Standards covered (9):** `NC.2.MD.1`, `NC.2.MD.2`, `NC.2.MD.3`, `NC.2.MD.4`, `NC.2.MD.5`, `NC.2.MD.6`, `NC.2.MD.7`, `NC.2.MD.8`, `NC.2.MD.10`.

**Interfaces:**

- Consumes: `assertAuthoredBankSound`, `GRADE_2_DOMAINS`.
- Produces: `GRADE_2_MD_AUTHORED`; `GRADE_2_AUTHORED: Question[]` from `src/curriculum/grade2/authored.ts`, which Task 21 passes to `makeQuestionSource`.

- [ ] **Step 1: Write the failing tests**

Create `src/curriculum/grade2/authored.md.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { assertAuthoredBankSound } from '../authoredBank.testkit';
import { GRADE_2_DOMAINS } from './standards';
import { GRADE_2_MD_AUTHORED } from './authored.md';
import { GRADE_2_AUTHORED } from './authored';

describe('grade 2 MD authored bank', () => {
  it('holds every authored-bank invariant', () => {
    const md = GRADE_2_DOMAINS.find((d) => d.id === 'MD')!;
    assertAuthoredBankSound(GRADE_2_MD_AUTHORED, md);
  });
});

describe('grade 2 authored aggregate', () => {
  it('carries every item exactly once', () => {
    const ids = GRADE_2_AUTHORED.map((q) => q.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('covers every grade 2 standard', () => {
    const covered = new Set(GRADE_2_AUTHORED.map((q) => q.standardCode));
    for (const s of GRADE_2_DOMAINS.flatMap((d) => d.standards)) {
      expect(covered.has(s.code), `no authored item for ${s.code}`).toBe(true);
    }
  });
});
```

- [ ] **Step 2: Run it and watch it fail**

Run: `npx vitest run src/curriculum/grade2/authored.md.test.ts`
Expected: FAIL — `./authored.md` and `./authored` do not exist.

- [ ] **Step 3: Author the bank**

At least three items per standard, twenty-seven minimum. Grade 2 measurement errors to name: measuring from the end of a ruler rather than from zero; counting tick marks instead of intervals; reading a clock's minute hand as the hour; counting a coin collection by coin rather than by value; picking the wrong unit entirely (measuring a pencil in metres).

For any item involving a ruler, clock, coins, or a graph, describe it in `promptDetails` as text — no image assets. A coin problem states the coins in words.

- [ ] **Step 4: Write the templates**

Templates for measurement with a fixed unit (`NC.2.MD.1`, `NC.2.MD.2`), for measurement word problems (`NC.2.MD.5`), for time (`NC.2.MD.6`), for money (`NC.2.MD.7`), and for reading data (`NC.2.MD.10`). Standards whose item is inherently a described figure — estimating a length (`NC.2.MD.3`), comparing two lengths (`NC.2.MD.4`), and the number line representation (`NC.2.MD.8`) — may stay authored if a generated version would produce interchangeable items.

Each gets a sibling test as in Task 12 Step 4. Append to `GRADE_2_TEMPLATES`.

- [ ] **Step 5: Write the aggregator**

Create `src/curriculum/grade2/authored.ts` joining `GRADE_2_OA_AUTHORED`, `GRADE_2_NBT_AUTHORED`, `GRADE_2_MD_AUTHORED`, and `GRADE_2_G_AUTHORED` into `GRADE_2_AUTHORED: Question[]`, in that order, with a doc comment matching Task 9's aggregator.

- [ ] **Step 6: Declare any new misconception tags**

As in Task 5 Step 6.

- [ ] **Step 7: Run the tests**

Run: `npx vitest run src/curriculum/grade2 src/curriculum/misconceptions.test.ts`
Expected: PASS, including "covers every grade 2 standard".

- [ ] **Step 8: Lint, typecheck, commit**

```bash
npm run lint && npx tsc -b --noEmit
git add -A
git commit -m "feat: add grade 2 measurement and data content"
```

---

