### Task 3: Registry-driven misconception and weighting tests

**Files:**

- Modify: `src/curriculum/misconceptions.test.ts`
- Modify: `src/curriculum/integrity.test.ts`

**Interfaces:**

- Consumes: `listCurricula()`, `standardsOf()`, `domainWeight()` from `src/curriculum/registry.ts`.
- Produces: nothing importable. Every later task inherits these assertions automatically the moment its grade is registered.

**Why:** `misconceptions.test.ts` imports `GRADE_5_AUTHORED` and `GRADE_5_TEMPLATES` by name. Left alone, a Grade 4 tag would be reported as an orphan ("declared but unused") because the test never looks at Grade 4's content — so the very test meant to keep the vocabulary honest would start producing false failures on correct work.

- [ ] **Step 1: Rewrite the tag collector over the registry**

Replace the imports and `allUsedTags` in `src/curriculum/misconceptions.test.ts` with:

```ts
import { describe, it, expect } from 'vitest';
import { MISCONCEPTIONS } from './misconceptions';
import { listCurricula, standardsOf } from './registry';
import { makeRng } from '../engine/rng';

/** Tags used anywhere in any registered grade: authored items plus every
 *  misconception a generator can emit, sampled across many seeds so a rare
 *  distractor still counts as "used." Registry-driven so a new grade's tags
 *  count the moment that grade registers. */
function allUsedTags(): Set<string> {
  const used = new Set<string>();
  for (const c of listCurricula()) {
    for (const s of standardsOf(c)) {
      for (const ref of c.source.authoredFor(s.code)) {
        for (const o of c.source.resolve(ref).options) {
          if (o.misconception) used.add(o.misconception);
        }
      }
    }
    for (const t of c.source.templates()) {
      for (let seed = 0; seed < 100; seed++) {
        for (const o of t.generate(makeRng(seed)).options) {
          if (o.misconception) used.add(o.misconception);
        }
      }
    }
  }
  return used;
}
```

- [ ] **Step 2: Expose templates through the question source**

The test above calls `c.source.templates()`, which does not exist yet — that is the failure Step 3 clears. Add to the interface in `src/engine/questionSource.ts`:

```ts
  /** Every template this source can draw from. Exposed so the misconception
   *  registry test can sample the tags generators emit; not for quiz code,
   *  which should go through itemsFor(). */
  templates(): QuestionTemplate[];
```

and to the returned object: `templates() { return templates; },`. `QuestionTemplate` is already imported in that file.

- [ ] **Step 3: Run it**

Run: `npx vitest run src/curriculum/misconceptions.test.ts`
Expected: PASS with Grade 5 alone registered — it must find exactly the same tag set as before.

- [ ] **Step 4: Add the weighting assertions to the integrity test**

Append inside the `describe.each` callback in `src/curriculum/integrity.test.ts`:

```ts
    it('totals every domain weight to 100', () => {
      const total = c.domains.reduce((sum, d) => sum + domainWeight(c, d.id), 0);
      expect(total).toBeGreaterThan(99);
      expect(total).toBeLessThan(101);
    });

    it('cites one shared band across every member of a weight group', () => {
      const groups = new Map<string, typeof c.domains>();
      for (const d of c.domains) {
        if (!d.weightGroup) continue;
        groups.set(d.weightGroup, [...(groups.get(d.weightGroup) ?? []), d]);
      }
      for (const [group, members] of groups) {
        expect(members.length, `weight group ${group} has one member`).toBeGreaterThan(1);
        const ranges = new Set(members.map((d) => d.officialWeightRange));
        expect(ranges.size, `weight group ${group} cites ${ranges.size} different bands`).toBe(1);
        for (const d of members) {
          expect(d.weightGroupLabel, `${d.id} is grouped but unlabelled`).toBeTruthy();
        }
      }
    });

    it('claims no official blueprint below grade 3', () => {
      // NCDPI publishes no EOG, and therefore no blueprint, for grades 1-2.
      if (c.grade >= 3) return;
      expect(c.weighting.kind).toBe('even-by-standard-count');
      for (const d of c.domains) {
        expect(d.weightGroup, `grade ${c.grade} domain ${d.id} claims a blueprint band`).toBeUndefined();
      }
    });
```

Add `domainWeight` to the import from `./registry`.

- [ ] **Step 5: Run the full suite**

Run: `npm test -- --run`
Expected: PASS.

- [ ] **Step 6: Lint, typecheck, commit**

```bash
npm run lint && npx tsc -b --noEmit
git add -A
git commit -m "test: drive misconception and weighting checks from the registry"
```

---

# Batch B — Sourced standards for all four grades

