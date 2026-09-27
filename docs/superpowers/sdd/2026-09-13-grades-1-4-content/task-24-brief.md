### Task 24: Grade 1 Measurement, Geometry, and the authored aggregate

**Files:**

- Create: `src/curriculum/grade1/authored.md.ts`, `src/curriculum/grade1/authored.md.test.ts`
- Create: `src/curriculum/grade1/authored.g.ts`, `src/curriculum/grade1/authored.g.test.ts`
- Create: `src/curriculum/grade1/authored.ts`
- Create: template files under `src/curriculum/grade1/templates/`, each with a sibling test
- Modify: `src/curriculum/grade1/templates/index.ts`, `src/curriculum/misconceptions.ts`

**Standards covered (8):** MD — `NC.1.MD.1`, `NC.1.MD.2`, `NC.1.MD.3`, `NC.1.MD.5`, `NC.1.MD.4`. G — `NC.1.G.1`, `NC.1.G.2`, `NC.1.G.3`.

**Interfaces:**

- Consumes: `assertAuthoredBankSound`, `GRADE_1_DOMAINS`.
- Produces: `GRADE_1_MD_AUTHORED`, `GRADE_1_G_AUTHORED`, and `GRADE_1_AUTHORED: Question[]` from `src/curriculum/grade1/authored.ts`, which Task 26 passes to `makeQuestionSource`.

- [ ] **Step 1: Write the failing tests**

Create `src/curriculum/grade1/authored.md.test.ts` and `src/curriculum/grade1/authored.g.test.ts`, each calling `assertAuthoredBankSound` for its domain and repeating the prompt-length assertion from Task 22 Step 1 over its own array. Put the aggregate assertions in the geometry test:

```ts
describe('grade 1 authored aggregate', () => {
  it('carries every item exactly once', () => {
    const ids = GRADE_1_AUTHORED.map((q) => q.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('covers every grade 1 standard', () => {
    const covered = new Set(GRADE_1_AUTHORED.map((q) => q.standardCode));
    for (const s of GRADE_1_DOMAINS.flatMap((d) => d.standards)) {
      expect(covered.has(s.code), `no authored item for ${s.code}`).toBe(true);
    }
  });
});
```

- [ ] **Step 2: Run them and watch them fail**

Run: `npx vitest run src/curriculum/grade1`
Expected: FAIL — the three new modules do not exist.

- [ ] **Step 3: Author both banks**

MD: at least three items per standard, fifteen minimum. Errors: ordering three objects by length by comparing only two of them; leaving gaps between the units when measuring by iteration; telling time to the half hour by reading the hour hand as if it pointed exactly at a number.

G: at least three items per standard, nine minimum. Errors: naming a shape by orientation; calling a shape a rectangle because it has four sides; splitting a circle into two unequal pieces and calling each a half; composing two shapes and expecting the new shape to keep both names.

- [ ] **Step 4: Write the templates**

Templates for ordering and measuring lengths (`NC.1.MD.1`, `NC.1.MD.2`) and for reading data (`NC.1.MD.4`). Time (`NC.1.MD.5`), money or coin recognition (`NC.1.MD.3`), and all three Geometry standards stay authored — they are described figures and vocabulary, where a generator would only shuffle labels.

Each gets a sibling test as in Task 12 Step 4, plus the prompt-length assertion. Append to `GRADE_1_TEMPLATES`.

- [ ] **Step 5: Write the aggregator**

Create `src/curriculum/grade1/authored.ts` joining `GRADE_1_OA_AUTHORED`, `GRADE_1_NBT_AUTHORED`, `GRADE_1_MD_AUTHORED`, and `GRADE_1_G_AUTHORED` into `GRADE_1_AUTHORED: Question[]`, in that order, with a doc comment matching Task 9's aggregator.

- [ ] **Step 6: Declare any new misconception tags**

As in Task 5 Step 6.

- [ ] **Step 7: Run the tests**

Run: `npx vitest run src/curriculum/grade1 src/curriculum/misconceptions.test.ts`
Expected: PASS, including "covers every grade 1 standard".

- [ ] **Step 8: Lint, typecheck, commit**

```bash
npm run lint && npx tsc -b --noEmit
git add -A
git commit -m "feat: add grade 1 measurement and geometry content"
```

---

