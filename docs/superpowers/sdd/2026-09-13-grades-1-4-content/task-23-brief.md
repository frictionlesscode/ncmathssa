### Task 23: Grade 1 Number & Operations in Base Ten

**Files:**

- Create: `src/curriculum/grade1/authored.nbt.ts`, `src/curriculum/grade1/authored.nbt.test.ts`
- Create: template files under `src/curriculum/grade1/templates/`, each with a sibling test
- Modify: `src/curriculum/grade1/templates/index.ts`, `src/curriculum/misconceptions.ts`

**Standards covered (7):** `NC.1.NBT.1`, `NC.1.NBT.7`, `NC.1.NBT.2`, `NC.1.NBT.3`, `NC.1.NBT.4`, `NC.1.NBT.5`, `NC.1.NBT.6`.

**Interfaces:**

- Consumes: `assertAuthoredBankSound`, `GRADE_1_DOMAINS`, `assertTemplateSound`.
- Produces: `GRADE_1_NBT_AUTHORED`; templates named `g1.nbt<tail>.<slug>`.

- [ ] **Step 1: Write the failing test**

Create `src/curriculum/grade1/authored.nbt.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { assertAuthoredBankSound } from '../authoredBank.testkit';
import { GRADE_1_DOMAINS } from './standards';
import { GRADE_1_NBT_AUTHORED } from './authored.nbt';

describe('grade 1 NBT authored bank', () => {
  it('holds every authored-bank invariant', () => {
    const nbt = GRADE_1_DOMAINS.find((d) => d.id === 'NBT')!;
    assertAuthoredBankSound(GRADE_1_NBT_AUTHORED, nbt);
  });

  it('keeps every prompt short enough for a six-year-old to read', () => {
    for (const q of GRADE_1_NBT_AUTHORED) {
      expect(q.prompt.length, `${q.id} prompt is ${q.prompt.length} chars`).toBeLessThan(120);
      const sentences = q.prompt.split(/[.?!]/).filter((s) => s.trim().length > 0);
      expect(sentences.length, `${q.id} has ${sentences.length} sentences`).toBeLessThanOrEqual(2);
    }
  });
});
```

- [ ] **Step 2: Run it and watch it fail**

Run: `npx vitest run src/curriculum/grade1/authored.nbt.test.ts`
Expected: FAIL — `./authored.nbt` does not exist.

- [ ] **Step 3: Author the bank**

At least three items per standard, twenty-one minimum. The founding place-value errors: reading a teen number backwards (13 as 31); seeing 4 tens and 2 ones and writing 24; believing 19 + 1 is 110; comparing two-digit numbers by their ones digit.

- [ ] **Step 4: Write the templates**

Templates for counting and writing numerals (`NC.1.NBT.1`), tens and ones (`NC.1.NBT.2`), comparison (`NC.1.NBT.3`), addition within 100 (`NC.1.NBT.4`), adding and subtracting 10 mentally (`NC.1.NBT.5`), subtracting multiples of 10 (`NC.1.NBT.6`), and grouping to count (`NC.1.NBT.7`).

Each gets a sibling test as in Task 12 Step 4, plus the prompt-length assertion. Append to `GRADE_1_TEMPLATES`.

- [ ] **Step 5: Declare any new misconception tags**

As in Task 5 Step 6.

- [ ] **Step 6: Run the tests**

Run: `npx vitest run src/curriculum/grade1 src/curriculum/misconceptions.test.ts`
Expected: PASS.

- [ ] **Step 7: Lint, typecheck, commit**

```bash
npm run lint && npx tsc -b --noEmit
git add -A
git commit -m "feat: add grade 1 base ten content"
```

---

