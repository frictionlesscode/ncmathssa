### Task 12: Grade 3 Operations & Algebraic Thinking

**Files:**

- Create: `src/curriculum/grade3/authored.oa.ts`, `src/curriculum/grade3/authored.oa.test.ts`
- Create: `src/curriculum/grade3/templates/` files, each with a sibling test, plus `src/curriculum/grade3/templates/index.ts`
- Modify: `src/curriculum/misconceptions.ts`

**Standards covered (7):** `NC.3.OA.1`, `NC.3.OA.2`, `NC.3.OA.3`, `NC.3.OA.6`, `NC.3.OA.7`, `NC.3.OA.8`, `NC.3.OA.9`.

**Interfaces:**

- Consumes: `assertAuthoredBankSound` (Task 5), `GRADE_3_DOMAINS` from `./standards` (Task 4), `assertTemplateSound`.
- Produces: `GRADE_3_OA_AUTHORED: Question[]`; `GRADE_3_TEMPLATES: QuestionTemplate[]` from `src/curriculum/grade3/templates/index.ts`, which Tasks 13–14 append to. Templates named `g3.oa<tail>.<slug>`.

**Weight note:** OA carries 32–36% at Grade 3 — the largest band in the grade, larger than Fractions. Multiplication and division reasoning is the centre of Grade 3.

- [ ] **Step 1: Write the failing test**

Create `src/curriculum/grade3/authored.oa.test.ts`:

```ts
import { describe, it } from 'vitest';
import { assertAuthoredBankSound } from '../authoredBank.testkit';
import { GRADE_3_DOMAINS } from './standards';
import { GRADE_3_OA_AUTHORED } from './authored.oa';

describe('grade 3 OA authored bank', () => {
  it('holds every authored-bank invariant', () => {
    const oa = GRADE_3_DOMAINS.find((d) => d.id === 'OA')!;
    assertAuthoredBankSound(GRADE_3_OA_AUTHORED, oa);
  });
});
```

- [ ] **Step 2: Run it and watch it fail**

Run: `npx vitest run src/curriculum/grade3/authored.oa.test.ts`
Expected: FAIL — `./authored.oa` does not exist.

- [ ] **Step 3: Author the bank**

At least three items per standard, twenty-one minimum. Grade 3 distractors are about what multiplication and division *mean*, not just what they compute: adding the two factors instead of multiplying; treating division as commutative (`12 ÷ 3` answered as if `3 ÷ 12`); solving for the wrong unknown in an equal-groups problem; applying the order of operations left to right in a two-step problem.

- [ ] **Step 4: Write the templates**

Templates for the computational standards — the multiplication and division facts and their relationship (`NC.3.OA.1`, `NC.3.OA.2`, `NC.3.OA.3`, `NC.3.OA.6`, `NC.3.OA.7`) and two-step word problems with a fixed frame and fresh numbers (`NC.3.OA.8`). `NC.3.OA.9` (patterns in the multiplication table) is a reasoning standard and stays authored.

Create `src/curriculum/grade3/templates/index.ts` exporting `GRADE_3_TEMPLATES`. Each template gets a sibling test calling `assertTemplateSound()` at 300 runs, a determinism check on a repeated seed, and a pinned-seed assertion that the correct option's text equals `answerText`.

- [ ] **Step 5: Declare any new misconception tags**

As in Task 5 Step 6.

- [ ] **Step 6: Run the tests**

Run: `npx vitest run src/curriculum/grade3 src/curriculum/misconceptions.test.ts`
Expected: PASS.

- [ ] **Step 7: Lint, typecheck, commit**

```bash
npm run lint && npx tsc -b --noEmit
git add -A
git commit -m "feat: add grade 3 operations and algebraic thinking content"
```

---

