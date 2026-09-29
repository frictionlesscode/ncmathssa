### Task 22: Grade 1 Operations & Algebraic Thinking

**Files:**

- Create: `src/curriculum/grade1/authored.oa.ts`, `src/curriculum/grade1/authored.oa.test.ts`
- Create: template files under `src/curriculum/grade1/templates/`, each with a sibling test, plus `src/curriculum/grade1/templates/index.ts`
- Modify: `src/curriculum/misconceptions.ts`

**Standards covered (8):** `NC.1.OA.1`, `NC.1.OA.2`, `NC.1.OA.3`, `NC.1.OA.4`, `NC.1.OA.9`, `NC.1.OA.6`, `NC.1.OA.7`, `NC.1.OA.8`.

**Interfaces:**

- Consumes: `assertAuthoredBankSound`, `GRADE_1_DOMAINS` from `./standards` (Task 4), `assertTemplateSound`.
- Produces: `GRADE_1_OA_AUTHORED`; `GRADE_1_TEMPLATES` from `src/curriculum/grade1/templates/index.ts`, which Tasks 23–24 append to. Templates named `g1.oa<tail>.<slug>`.

**The hardest audience in the project.** A six-year-old is reading these, often aloud with a parent. Every prompt is one short sentence. Numbers stay within 20 unless the standard says otherwise. No prompt uses a word a first-grader would not read — write "how many are left", not "determine the remaining quantity".

- [ ] **Step 1: Write the failing test**

Create `src/curriculum/grade1/authored.oa.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { assertAuthoredBankSound } from '../authoredBank.testkit';
import { GRADE_1_DOMAINS } from './standards';
import { GRADE_1_OA_AUTHORED } from './authored.oa';

describe('grade 1 OA authored bank', () => {
  it('holds every authored-bank invariant', () => {
    const oa = GRADE_1_DOMAINS.find((d) => d.id === 'OA')!;
    assertAuthoredBankSound(GRADE_1_OA_AUTHORED, oa);
  });

  it('keeps every prompt short enough for a six-year-old to read', () => {
    // Not a style preference. A first-grader who cannot read the question
    // gets it wrong for a reason the app would then misreport as a
    // mathematical misconception.
    for (const q of GRADE_1_OA_AUTHORED) {
      expect(q.prompt.length, `${q.id} prompt is ${q.prompt.length} chars`).toBeLessThan(120);
      const sentences = q.prompt.split(/[.?!]/).filter((s) => s.trim().length > 0);
      expect(sentences.length, `${q.id} has ${sentences.length} sentences`).toBeLessThanOrEqual(2);
    }
  });
});
```

- [ ] **Step 2: Run it and watch it fail**

Run: `npx vitest run src/curriculum/grade1/authored.oa.test.ts`
Expected: FAIL — `./authored.oa` does not exist.

- [ ] **Step 3: Author the bank**

At least three items per standard, twenty-four minimum. Grade 1 misconceptions are about counting and about what an equals sign means: counting the starting number as the first hop when counting on; answering `8 = 3 + ?` with 11 because the child added everything in sight; treating `=` as "here comes the answer" so `4 + 3 = ? + 2` gets 7; forgetting the last object when counting a set.

- [ ] **Step 4: Write the templates**

Templates for the computational standards: addition and subtraction word problems within 20 (`NC.1.OA.1`), three addends (`NC.1.OA.2`), fluency within 10 (`NC.1.OA.6`), and the unknown in any position (`NC.1.OA.8`). The property and equality standards (`NC.1.OA.3`, `NC.1.OA.4`, `NC.1.OA.7`, `NC.1.OA.9`) are reasoning and stay authored.

Create `src/curriculum/grade1/templates/index.ts` exporting `GRADE_1_TEMPLATES`. Each template gets a sibling test as in Task 12 Step 4, and each generated prompt must also satisfy the length rule above — assert it inside the template's own test.

- [ ] **Step 5: Declare any new misconception tags**

As in Task 5 Step 6.

- [ ] **Step 6: Run the tests**

Run: `npx vitest run src/curriculum/grade1 src/curriculum/misconceptions.test.ts`
Expected: PASS.

- [ ] **Step 7: Lint, typecheck, commit**

```bash
npm run lint && npx tsc -b --noEmit
git add -A
git commit -m "feat: add grade 1 operations and algebraic thinking content"
```

---

