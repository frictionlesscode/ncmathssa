### Task 18: Grade 2 Number & Operations in Base Ten

**Files:**

- Create: `src/curriculum/grade2/authored.nbt.ts`, `src/curriculum/grade2/authored.nbt.test.ts`
- Create: template files under `src/curriculum/grade2/templates/`, each with a sibling test
- Modify: `src/curriculum/grade2/templates/index.ts`, `src/curriculum/misconceptions.ts`

**Standards covered (8):** `NC.2.NBT.1`, `NC.2.NBT.2`, `NC.2.NBT.3`, `NC.2.NBT.4`, `NC.2.NBT.5`, `NC.2.NBT.6`, `NC.2.NBT.7`, `NC.2.NBT.8`.

**Interfaces:**

- Consumes: `assertAuthoredBankSound`, `GRADE_2_DOMAINS`, `assertTemplateSound`.
- Produces: `GRADE_2_NBT_AUTHORED: Question[]`; templates named `g2.nbt<tail>.<slug>`.

- [ ] **Step 1: Write the failing test**

Create `src/curriculum/grade2/authored.nbt.test.ts`:

```ts
import { describe, it } from 'vitest';
import { assertAuthoredBankSound } from '../authoredBank.testkit';
import { GRADE_2_DOMAINS } from './standards';
import { GRADE_2_NBT_AUTHORED } from './authored.nbt';

describe('grade 2 NBT authored bank', () => {
  it('holds every authored-bank invariant', () => {
    const nbt = GRADE_2_DOMAINS.find((d) => d.id === 'NBT')!;
    assertAuthoredBankSound(GRADE_2_NBT_AUTHORED, nbt);
  });
});
```

- [ ] **Step 2: Run it and watch it fail**

Run: `npx vitest run src/curriculum/grade2/authored.nbt.test.ts`
Expected: FAIL — `./authored.nbt` does not exist.

- [ ] **Step 3: Author the bank**

At least three items per standard, twenty-four minimum. This is place value's founding year, so the distractors are place-value errors stated precisely: reading 407 as "forty-seven"; adding tens to ones when the columns are misaligned; failing to regroup and writing the larger digit minus the smaller in each column regardless of which is on top; counting by tens from 380 and going to 390, 400, 410 but writing 300, 400, 500.

- [ ] **Step 4: Write the templates**

Every NBT standard here is computational and gets a template: three-digit place value (`NC.2.NBT.1`), skip counting (`NC.2.NBT.2`), reading and writing numbers in several forms (`NC.2.NBT.3`), comparison (`NC.2.NBT.4`), addition and subtraction within 100 (`NC.2.NBT.5`), adding up to four two-digit numbers (`NC.2.NBT.6`), addition and subtraction within 1000 (`NC.2.NBT.7`), and adding or subtracting 10 and 100 mentally (`NC.2.NBT.8`).

Each gets a sibling test as in Task 12 Step 4. Append to `GRADE_2_TEMPLATES`.

- [ ] **Step 5: Declare any new misconception tags**

As in Task 5 Step 6.

- [ ] **Step 6: Run the tests**

Run: `npx vitest run src/curriculum/grade2 src/curriculum/misconceptions.test.ts`
Expected: PASS.

- [ ] **Step 7: Lint, typecheck, commit**

```bash
npm run lint && npx tsc -b --noEmit
git add -A
git commit -m "feat: add grade 2 base ten content"
```

---

