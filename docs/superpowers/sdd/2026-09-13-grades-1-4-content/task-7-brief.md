### Task 7: Grade 4 Number & Operations — Fractions

**Files:**

- Create: `src/curriculum/grade4/authored.nf.ts`, `src/curriculum/grade4/authored.nf.test.ts`
- Create: template files under `src/curriculum/grade4/templates/`, each with a sibling test
- Modify: `src/curriculum/grade4/templates/index.ts`, `src/curriculum/misconceptions.ts`

**Standards covered (6):** `NC.4.NF.1`, `NC.4.NF.2`, `NC.4.NF.3`, `NC.4.NF.4`, `NC.4.NF.6`, `NC.4.NF.7`.

**Interfaces:**

- Consumes: `assertAuthoredBankSound`, `GRADE_4_DOMAINS`, `assertTemplateSound`.
- Produces: `GRADE_4_NF_AUTHORED: Question[]`; templates named `g4.nf<tail>.<slug>`.

**Why this domain matters most:** NF carries the largest published band at Grade 4 — 30–34%, more than any other domain. It is also where the misconception vocabulary earns its keep, because fraction errors are procedural and nameable.

- [ ] **Step 1: Write the failing test**

Create `src/curriculum/grade4/authored.nf.test.ts`:

```ts
import { describe, it } from 'vitest';
import { assertAuthoredBankSound } from '../authoredBank.testkit';
import { GRADE_4_DOMAINS } from './standards';
import { GRADE_4_NF_AUTHORED } from './authored.nf';

describe('grade 4 NF authored bank', () => {
  it('holds every authored-bank invariant', () => {
    const nf = GRADE_4_DOMAINS.find((d) => d.id === 'NF')!;
    assertAuthoredBankSound(GRADE_4_NF_AUTHORED, nf);
  });
});
```

- [ ] **Step 2: Run it and watch it fail**

Run: `npx vitest run src/curriculum/grade4/authored.nf.test.ts`
Expected: FAIL — `./authored.nf` does not exist.

- [ ] **Step 3: Author the bank**

At least three items per standard, eighteen minimum, and given the domain's weight, prefer four. The distractors that matter here: adding denominators as well as numerators; judging `1/8 > 1/3` because eight exceeds three; comparing fractions with unlike denominators by numerator alone; multiplying a fraction by a whole number and multiplying the denominator too; reading `0.5` as smaller than `0.25` because it has fewer digits.

- [ ] **Step 4: Write the templates**

Templates for the computational standards — equivalence (`NC.4.NF.1`), comparison (`NC.4.NF.2`), addition and subtraction with like denominators (`NC.4.NF.3`), multiplication by a whole number (`NC.4.NF.4`), and decimal notation and comparison (`NC.4.NF.6`, `NC.4.NF.7`). `src/curriculum/grade5/templates/nf1-add-unlike.ts` and `nbt3-compare-decimals.ts` are the closest existing models.

Each gets a sibling test as in Task 5 Step 5.

- [ ] **Step 5: Register the templates**

Append to `GRADE_4_TEMPLATES`.

- [ ] **Step 6: Declare any new misconception tags**

As in Task 5 Step 6.

- [ ] **Step 7: Run the tests**

Run: `npx vitest run src/curriculum/grade4 src/curriculum/misconceptions.test.ts`
Expected: PASS.

- [ ] **Step 8: Lint, typecheck, commit**

```bash
npm run lint && npx tsc -b --noEmit
git add -A
git commit -m "feat: add grade 4 fractions content"
```

---

