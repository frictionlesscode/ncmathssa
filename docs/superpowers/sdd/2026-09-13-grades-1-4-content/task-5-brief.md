### Task 5: Grade 4 Operations & Algebraic Thinking, and the authored-bank test kit

**Files:**

- Create: `src/curriculum/authoredBank.testkit.ts`
- Create: `src/curriculum/grade4/authored.oa.ts`
- Create: `src/curriculum/grade4/authored.oa.test.ts`
- Create: `src/curriculum/grade4/templates/` (one file per generator, each with a sibling test)
- Modify: `src/curriculum/misconceptions.ts` (declare any new tags)
- Read: `src/curriculum/grade4/standards.ts` (Task 4), `src/curriculum/grade5/authored.ts` (the register to match)

**Standards covered (4):** `NC.4.OA.1`, `NC.4.OA.3`, `NC.4.OA.4`, `NC.4.OA.5`. Read each one's `description` and `keyConcepts` out of `src/curriculum/grade4/standards.ts` — that text is the sourced NCDPI wording and is the authority on what the item may ask.

**Interfaces:**

- Consumes: `GRADE_4_DOMAINS` from `./standards`; `Question`, `labelOptions` from `src/engine/questionModel.ts`; `QuestionTemplate`, `GeneratedQuestion` from `src/engine/template.ts`; `assertTemplateSound` from `src/engine/templateTesting.ts`.
- Produces: `assertAuthoredBankSound()` from `src/curriculum/authoredBank.testkit.ts` — **every later content task's test file calls this instead of rewriting the assertions**. `GRADE_4_OA_AUTHORED: Question[]`. Templates named `g4.oa<tail>.<slug>`, e.g. `g4.oa4.factor-pairs`.

- [ ] **Step 1: Write the test kit**

Create `src/curriculum/authoredBank.testkit.ts`:

```ts
import { expect } from 'vitest';
import type { Question } from '../engine/questionModel';
import type { DomainInfo } from './types';

/**
 * The invariants every authored bank must hold, asserted in one place so a
 * new domain's test file is three lines instead of forty. Mirrors what
 * assertTemplateSound() does for generators.
 */
export function assertAuthoredBankSound(
  items: Question[],
  domain: DomainInfo,
  opts: { itemsPerStandard?: number } = {},
): void {
  const floor = opts.itemsPerStandard ?? 3;
  const codes = new Set(domain.standards.map((s) => s.code));

  const ids = items.map((q) => q.id);
  expect(new Set(ids).size, `duplicate item ids in ${domain.id}`).toBe(ids.length);

  for (const q of items) {
    expect(codes.has(q.standardCode), `${q.id} is not a ${domain.id} standard`).toBe(true);
    expect(q.domainId, `${q.id} domainId`).toBe(domain.id);
    expect(q.options.length, `${q.id} must have 4 options`).toBe(4);
    expect(q.options.filter((o) => o.isCorrect).length, `${q.id} correct count`).toBe(1);
    for (const o of q.options) {
      expect(o.text.trim().length, `${q.id} option ${o.label} is blank`).toBeGreaterThan(0);
      if (!o.isCorrect) {
        expect(o.misconception, `${q.id} option ${o.label} has no misconception tag`).toBeTruthy();
      }
    }
    const texts = q.options.map((o) => o.text.trim());
    expect(new Set(texts).size, `${q.id} has duplicate option text`).toBe(4);
    expect(q.explanation.stepByStep.length, `${q.id} has no worked solution`).toBeGreaterThan(0);
    expect(q.explanation.conceptSummary.trim().length, `${q.id} concept summary`).toBeGreaterThan(0);
  }

  for (const s of domain.standards) {
    const mine = items.filter((q) => q.standardCode === s.code);
    expect(mine.length, `${s.code} has ${mine.length} items, needs ${floor}`)
      .toBeGreaterThanOrEqual(floor);
  }

  // A bank of nothing but mastery items never stretches a student, and a bank
  // of nothing but stretch items teaches nobody. Both tiers must be present.
  const difficulties = new Set(items.map((q) => q.difficulty));
  expect(difficulties.has('mastery'), `${domain.id} has no mastery-level items`).toBe(true);
  expect(
    difficulties.has('advanced') || difficulties.has('stretch'),
    `${domain.id} has no items above mastery level`,
  ).toBe(true);
}
```

- [ ] **Step 2: Write the failing domain test**

Create `src/curriculum/grade4/authored.oa.test.ts`:

```ts
import { describe, it } from 'vitest';
import { assertAuthoredBankSound } from '../authoredBank.testkit';
import { GRADE_4_DOMAINS } from './standards';
import { GRADE_4_OA_AUTHORED } from './authored.oa';

describe('grade 4 OA authored bank', () => {
  it('holds every authored-bank invariant', () => {
    const oa = GRADE_4_DOMAINS.find((d) => d.id === 'OA')!;
    assertAuthoredBankSound(GRADE_4_OA_AUTHORED, oa);
  });
});
```

- [ ] **Step 3: Run it and watch it fail**

Run: `npx vitest run src/curriculum/grade4/authored.oa.test.ts`
Expected: FAIL — `./authored.oa` does not exist.

- [ ] **Step 4: Author the bank**

Create `src/curriculum/grade4/authored.oa.ts` following The Content Contract above and the file-level doc comment style of `src/curriculum/grade5/authored.ts`. At least three items per standard, twelve minimum. Every wrong option is a value a Grade 4 student actually produces: for `NC.4.OA.1` the additive comparison ("6 more than 4") where a multiplicative one was asked ("6 times as many as 4"); for `NC.4.OA.4` a composite offered as prime because only 2 and 3 were tested as divisors; for `NC.4.OA.3` the result of answering the intermediate step rather than the question asked.

- [ ] **Step 5: Write the templates**

Write a template for each OA standard whose practice value comes from fresh numbers — at minimum `NC.4.OA.1` and `NC.4.OA.4`, whose items are computational. `NC.4.OA.3` (multi-step word problems) and `NC.4.OA.5` (patterns) stay authored: there the wording carries the mathematics.

Each template gets a sibling test:

```ts
import { describe, it, expect } from 'vitest';
import { assertTemplateSound } from '../../../engine/templateTesting';
import { makeRng } from '../../../engine/rng';
import { oa4FactorPairs } from './oa4-factor-pairs';

describe('g4.oa4.factor-pairs', () => {
  it('is sound at every seed', () => {
    assertTemplateSound(oa4FactorPairs);
  });

  it('is deterministic in its seed', () => {
    const a = oa4FactorPairs.generate(makeRng(42));
    const b = oa4FactorPairs.generate(makeRng(42));
    expect(a).toEqual(b);
  });

  it('produces a known question at a pinned seed', () => {
    const g = oa4FactorPairs.generate(makeRng(7));
    expect(g.options.find((o) => o.isCorrect)!.text).toBe(g.answerText);
    expect(g.prompt.length).toBeGreaterThan(0);
  });
});
```

Create `src/curriculum/grade4/templates/index.ts` exporting `GRADE_4_TEMPLATES: QuestionTemplate[]` with the same doc comment discipline as `src/curriculum/grade5/templates/index.ts`. Task 6 through Task 9 append to this array.

- [ ] **Step 6: Declare the new misconception tags**

For every tag your options use that `src/curriculum/misconceptions.ts` does not already declare, add an `entry(tag, family, description)` line in the existing alphabetical-ish grouping. Reuse an existing tag whenever it names the same error — the vocabulary is shared across grades on purpose, so "you did this six times this week" stays meaningful. Add a new `MisconceptionFamily` only if no existing family fits, and say why in a comment.

- [ ] **Step 7: Run the tests**

Run: `npx vitest run src/curriculum/grade4 src/curriculum/misconceptions.test.ts`
Expected: PASS. The orphan-tag test will fail if you declared a tag nothing uses.

- [ ] **Step 8: Lint, typecheck, commit**

```bash
npm run lint && npx tsc -b --noEmit
git add -A
git commit -m "feat: add grade 4 operations and algebraic thinking content"
```

---

