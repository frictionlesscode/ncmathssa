### Task 8: Grade 4 Measurement & Data

**Files:**

- Create: `src/curriculum/grade4/authored.md.ts`, `src/curriculum/grade4/authored.md.test.ts`
- Create: template files under `src/curriculum/grade4/templates/`, each with a sibling test
- Modify: `src/curriculum/grade4/templates/index.ts`, `src/curriculum/misconceptions.ts`

**Standards covered (6):** `NC.4.MD.1`, `NC.4.MD.2`, `NC.4.MD.8`, `NC.4.MD.3`, `NC.4.MD.4`, `NC.4.MD.6`.

**Interfaces:**

- Consumes: `assertAuthoredBankSound`, `GRADE_4_DOMAINS`, `assertTemplateSound`.
- Produces: `GRADE_4_MD_AUTHORED: Question[]`; templates named `g4.md<tail>.<slug>`.

**Weight note:** MD shares the 23–27% band with Geometry. Nothing in this task may describe 23–27% as MD's own weight.

- [ ] **Step 1: Write the failing test**

Create `src/curriculum/grade4/authored.md.test.ts`:

```ts
import { describe, it } from 'vitest';
import { assertAuthoredBankSound } from '../authoredBank.testkit';
import { GRADE_4_DOMAINS } from './standards';
import { GRADE_4_MD_AUTHORED } from './authored.md';

describe('grade 4 MD authored bank', () => {
  it('holds every authored-bank invariant', () => {
    const md = GRADE_4_DOMAINS.find((d) => d.id === 'MD')!;
    assertAuthoredBankSound(GRADE_4_MD_AUTHORED, md);
  });
});
```

- [ ] **Step 2: Run it and watch it fail**

Run: `npx vitest run src/curriculum/grade4/authored.md.test.ts`
Expected: FAIL — `./authored.md` does not exist.

- [ ] **Step 3: Author the bank**

At least three items per standard, eighteen minimum. Characteristic errors: converting a unit the wrong way (multiplying where dividing was needed); computing perimeter when area was asked, or the reverse; adding an angle instead of subtracting it when decomposing; reading a line plot's axis by tick count rather than by value.

For any item describing a figure, put the figure in `promptDetails` as text a screen reader can read — no image assets.

- [ ] **Step 4: Write the templates**

Templates for unit conversion (`NC.4.MD.1`, `NC.4.MD.2`), area and perimeter (`NC.4.MD.8`), and angle measure (`NC.4.MD.6`). `src/curriculum/grade5/templates/md1-unit-conversion.ts` is the model for the first two.

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
git commit -m "feat: add grade 4 measurement and data content"
```

---

