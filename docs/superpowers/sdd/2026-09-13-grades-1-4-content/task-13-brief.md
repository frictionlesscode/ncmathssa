### Task 13: Grade 3 Base Ten and Fractions

Two small domains in one task: NBT has two standards and NF has four.

**Files:**

- Create: `src/curriculum/grade3/authored.nbt.ts`, `src/curriculum/grade3/authored.nbt.test.ts`
- Create: `src/curriculum/grade3/authored.nf.ts`, `src/curriculum/grade3/authored.nf.test.ts`
- Create: template files under `src/curriculum/grade3/templates/`, each with a sibling test
- Modify: `src/curriculum/grade3/templates/index.ts`, `src/curriculum/misconceptions.ts`

**Standards covered (6):** NBT — `NC.3.NBT.2`, `NC.3.NBT.3`. NF — `NC.3.NF.1`, `NC.3.NF.2`, `NC.3.NF.3`, `NC.3.NF.4`.

**Interfaces:**

- Consumes: `assertAuthoredBankSound`, `GRADE_3_DOMAINS`, `assertTemplateSound`.
- Produces: `GRADE_3_NBT_AUTHORED`, `GRADE_3_NF_AUTHORED`, both `Question[]`. Templates named `g3.nbt<tail>.<slug>` and `g3.nf<tail>.<slug>`.

- [ ] **Step 1: Write the two failing tests**

Create `src/curriculum/grade3/authored.nbt.test.ts`:

```ts
import { describe, it } from 'vitest';
import { assertAuthoredBankSound } from '../authoredBank.testkit';
import { GRADE_3_DOMAINS } from './standards';
import { GRADE_3_NBT_AUTHORED } from './authored.nbt';

describe('grade 3 NBT authored bank', () => {
  it('holds every authored-bank invariant', () => {
    const nbt = GRADE_3_DOMAINS.find((d) => d.id === 'NBT')!;
    assertAuthoredBankSound(GRADE_3_NBT_AUTHORED, nbt);
  });
});
```

Create `src/curriculum/grade3/authored.nf.test.ts`:

```ts
import { describe, it } from 'vitest';
import { assertAuthoredBankSound } from '../authoredBank.testkit';
import { GRADE_3_DOMAINS } from './standards';
import { GRADE_3_NF_AUTHORED } from './authored.nf';

describe('grade 3 NF authored bank', () => {
  it('holds every authored-bank invariant', () => {
    const nf = GRADE_3_DOMAINS.find((d) => d.id === 'NF')!;
    assertAuthoredBankSound(GRADE_3_NF_AUTHORED, nf);
  });
});
```

- [ ] **Step 2: Run them and watch them fail**

Run: `npx vitest run src/curriculum/grade3`
Expected: FAIL — neither `./authored.nbt` nor `./authored.nf` exists.

- [ ] **Step 3: Author both banks**

NBT: at least three items per standard, six minimum. Grade 3 NBT is only addition and subtraction within 1,000 (`NC.3.NBT.2`) and a one-digit number times a multiple of 10 (`NC.3.NBT.3`) — nothing else. Losing a regrouping across a zero, and multiplying the tens digit while dropping its place, are the two errors worth naming.

NF: at least three items per standard, twelve minimum — and this is a child's first year of fractions, so the misconceptions are foundational. Name them precisely: reading `1/4` as "one and four"; believing a larger denominator means a larger fraction; placing a fraction on a number line by counting tick marks rather than by counting equal intervals; calling two fractions equivalent because their numerators differ by the same amount as their denominators.

- [ ] **Step 4: Write the templates**

Templates for addition and subtraction within 1,000 (`NC.3.NBT.2`) and for a one-digit number times a multiple of 10 (`NC.3.NBT.3`), for identifying a unit fraction of a whole (`NC.3.NF.1`), for locating a fraction on a number line (`NC.3.NF.2`), and for equivalence and comparison (`NC.3.NF.3`, `NC.3.NF.4`). Each gets a sibling test as in Task 12 Step 4. Append them all to `GRADE_3_TEMPLATES`.

- [ ] **Step 5: Declare any new misconception tags**

As in Task 5 Step 6.

- [ ] **Step 6: Run the tests**

Run: `npx vitest run src/curriculum/grade3 src/curriculum/misconceptions.test.ts`
Expected: PASS.

- [ ] **Step 7: Lint, typecheck, commit**

```bash
npm run lint && npx tsc -b --noEmit
git add -A
git commit -m "feat: add grade 3 base ten and fractions content"
```

---

