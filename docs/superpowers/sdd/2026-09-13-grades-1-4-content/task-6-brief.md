### Task 6: Grade 4 Number & Operations in Base Ten

**Files:**

- Create: `src/curriculum/grade4/authored.nbt.ts`, `src/curriculum/grade4/authored.nbt.test.ts`
- Create: template files under `src/curriculum/grade4/templates/`, each with a sibling test
- Modify: `src/curriculum/grade4/templates/index.ts`, `src/curriculum/misconceptions.ts`

**Standards covered (6):** `NC.4.NBT.1`, `NC.4.NBT.2`, `NC.4.NBT.7`, `NC.4.NBT.4`, `NC.4.NBT.5`, `NC.4.NBT.6`.

**Interfaces:**

- Consumes: `assertAuthoredBankSound` (Task 5), `GRADE_4_DOMAINS`, `assertTemplateSound`.
- Produces: `GRADE_4_NBT_AUTHORED: Question[]`; templates named `g4.nbt<tail>.<slug>`.

- [ ] **Step 1: Write the failing test**

Create `src/curriculum/grade4/authored.nbt.test.ts`, identical in shape to the OA test from Task 5 but for NBT:

```ts
import { describe, it } from 'vitest';
import { assertAuthoredBankSound } from '../authoredBank.testkit';
import { GRADE_4_DOMAINS } from './standards';
import { GRADE_4_NBT_AUTHORED } from './authored.nbt';

describe('grade 4 NBT authored bank', () => {
  it('holds every authored-bank invariant', () => {
    const nbt = GRADE_4_DOMAINS.find((d) => d.id === 'NBT')!;
    assertAuthoredBankSound(GRADE_4_NBT_AUTHORED, nbt);
  });
});
```

- [ ] **Step 2: Run it and watch it fail**

Run: `npx vitest run src/curriculum/grade4/authored.nbt.test.ts`
Expected: FAIL — `./authored.nbt` does not exist.

- [ ] **Step 3: Author the bank**

At least three items per standard, eighteen minimum. This is the algorithm-heavy domain, so distractors are the classic procedural slips: a regrouping dropped in multi-digit subtraction; a carried digit added before multiplying rather than after; a partial product not shifted a place; a remainder discarded when the question asks what to do with it; a number rounded to the wrong place.

- [ ] **Step 4: Write the templates**

Every NBT standard here is computational and gets a template: place-value relationship (`NC.4.NBT.1`), comparison (`NC.4.NBT.2`), rounding (`NC.4.NBT.7`), multi-digit addition and subtraction (`NC.4.NBT.4`), multiplication (`NC.4.NBT.5`), and division with remainders (`NC.4.NBT.6`). Study `src/curriculum/grade5/templates/nbt5-multi-digit-multiply.ts` and `nbt6-divide-two-digit.ts` first — the Grade 4 versions are the same generators at a smaller number range.

Each gets a sibling test calling `assertTemplateSound()` at the default 300 runs plus a determinism check and a pinned seed, exactly as in Task 5 Step 5. Where two distractor formulas can collide, exclude the colliding parameters by construction and document the algebra in a file comment.

- [ ] **Step 5: Register the templates**

Append each template to `GRADE_4_TEMPLATES` in `src/curriculum/grade4/templates/index.ts`.

- [ ] **Step 6: Declare any new misconception tags**

As in Task 5 Step 6.

- [ ] **Step 7: Run the tests**

Run: `npx vitest run src/curriculum/grade4 src/curriculum/misconceptions.test.ts`
Expected: PASS.

- [ ] **Step 8: Lint, typecheck, commit**

```bash
npm run lint && npx tsc -b --noEmit
git add -A
git commit -m "feat: add grade 4 base ten content"
```

---

