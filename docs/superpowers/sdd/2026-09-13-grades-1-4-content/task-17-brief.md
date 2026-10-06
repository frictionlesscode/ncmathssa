### Task 17: Grade 2 Operations & Algebraic Thinking and Geometry

Two small domains in one task: OA has four standards, G has two.

**Files:**

- Create: `src/curriculum/grade2/authored.oa.ts`, `src/curriculum/grade2/authored.oa.test.ts`
- Create: `src/curriculum/grade2/authored.g.ts`, `src/curriculum/grade2/authored.g.test.ts`
- Create: template files under `src/curriculum/grade2/templates/`, each with a sibling test, plus `src/curriculum/grade2/templates/index.ts`
- Modify: `src/curriculum/misconceptions.ts`

**Standards covered (6):** OA — `NC.2.OA.1`, `NC.2.OA.2`, `NC.2.OA.3`, `NC.2.OA.4`. G — `NC.2.G.1`, `NC.2.G.3`.

**Interfaces:**

- Consumes: `assertAuthoredBankSound`, `GRADE_2_DOMAINS` from `./standards` (Task 4), `assertTemplateSound`.
- Produces: `GRADE_2_OA_AUTHORED`, `GRADE_2_G_AUTHORED`; `GRADE_2_TEMPLATES` from `src/curriculum/grade2/templates/index.ts`, which Tasks 18–19 append to. Templates named `g2.<domain><tail>.<slug>`.

**Reading level is a correctness requirement here.** A seven-year-old is the reader. Short sentences, one clause each, numbers within the range the standard names, and no prompt that takes longer to read than to solve.

- [ ] **Step 1: Write the failing tests**

Create `src/curriculum/grade2/authored.oa.test.ts`:

```ts
import { describe, it } from 'vitest';
import { assertAuthoredBankSound } from '../authoredBank.testkit';
import { GRADE_2_DOMAINS } from './standards';
import { GRADE_2_OA_AUTHORED } from './authored.oa';

describe('grade 2 OA authored bank', () => {
  it('holds every authored-bank invariant', () => {
    const oa = GRADE_2_DOMAINS.find((d) => d.id === 'OA')!;
    assertAuthoredBankSound(GRADE_2_OA_AUTHORED, oa);
  });
});
```

Create `src/curriculum/grade2/authored.g.test.ts` with the same shape for `G` and `GRADE_2_G_AUTHORED`.

- [ ] **Step 2: Run them and watch them fail**

Run: `npx vitest run src/curriculum/grade2`
Expected: FAIL — neither authored file exists.

- [ ] **Step 3: Author both banks**

OA: at least three items per standard, twelve minimum. Errors worth naming: counting on by ones and landing one short; choosing addition because the word "more" appeared, in a problem that needed subtraction; miscounting an array by counting a shared row or column twice; calling an odd number even because it ends in a digit the child associates with pairs.

G: at least three items per standard, six minimum. Errors are definitional: naming a shape by its orientation ("that triangle is upside down so it isn't a triangle"); counting a cube's faces as four because only four are visible in the picture; partitioning a rectangle into unequal parts and calling them halves.

- [ ] **Step 4: Write the templates**

Templates for addition and subtraction within 100 in a word-problem frame (`NC.2.OA.1`), for fluency within 20 (`NC.2.OA.2`), and for odd and even and for arrays (`NC.2.OA.3`, `NC.2.OA.4`). Geometry stays authored.

Create `src/curriculum/grade2/templates/index.ts` exporting `GRADE_2_TEMPLATES`. Each template gets a sibling test as in Task 12 Step 4.

- [ ] **Step 5: Declare any new misconception tags**

As in Task 5 Step 6. Grade 2 will need genuinely new tags — the existing vocabulary was built for Grade 5 and has nothing for counting errors or for keyword-driven operation choice at this level.

- [ ] **Step 6: Run the tests**

Run: `npx vitest run src/curriculum/grade2 src/curriculum/misconceptions.test.ts`
Expected: PASS.

- [ ] **Step 7: Lint, typecheck, commit**

```bash
npm run lint && npx tsc -b --noEmit
git add -A
git commit -m "feat: add grade 2 operations and geometry content"
```

---

