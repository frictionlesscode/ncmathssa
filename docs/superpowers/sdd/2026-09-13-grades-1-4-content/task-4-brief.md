### Task 4: Standards data for grades 1, 2, 3, and 4

One task, four files of the same shape, all transcribed from the same two JSON sources. Batched deliberately: the work is mechanical, and the test is the same test four times.

**Files:**

- Create: `src/curriculum/grade1/standards.ts`, `src/curriculum/grade2/standards.ts`, `src/curriculum/grade3/standards.ts`, `src/curriculum/grade4/standards.ts`
- Create: `src/curriculum/sourcedStandards.test.ts`
- Read (do not modify): `docs/sources/nc-standards-1-5.json`, `docs/sources/nc-eog-blueprint.json`, `src/curriculum/grade5/standards.ts` (the shape to copy)

**Interfaces:**

- Consumes: `DomainInfo`, `StandardInfo` from `src/curriculum/types.ts`.
- Produces: `GRADE_1_DOMAINS`, `GRADE_2_DOMAINS`, `GRADE_3_DOMAINS`, `GRADE_4_DOMAINS`, each a `DomainInfo[]`. Tasks 5–26 read these for their standard lists.

**The exact standards, from `docs/sources/nc-standards-1-5.json`.** Transcribe in this order; the codes are not all in numeric order and that is how NCDPI publishes them:

| Grade | Domain | Count | Codes |
|---|---|---|---|
| 1 | OA | 8 | NC.1.OA.1, NC.1.OA.2, NC.1.OA.3, NC.1.OA.4, NC.1.OA.9, NC.1.OA.6, NC.1.OA.7, NC.1.OA.8 |
| 1 | NBT | 7 | NC.1.NBT.1, NC.1.NBT.7, NC.1.NBT.2, NC.1.NBT.3, NC.1.NBT.4, NC.1.NBT.5, NC.1.NBT.6 |
| 1 | MD | 5 | NC.1.MD.1, NC.1.MD.2, NC.1.MD.3, NC.1.MD.5, NC.1.MD.4 |
| 1 | G | 3 | NC.1.G.1, NC.1.G.2, NC.1.G.3 |
| 2 | OA | 4 | NC.2.OA.1, NC.2.OA.2, NC.2.OA.3, NC.2.OA.4 |
| 2 | NBT | 8 | NC.2.NBT.1, NC.2.NBT.2, NC.2.NBT.3, NC.2.NBT.4, NC.2.NBT.5, NC.2.NBT.6, NC.2.NBT.7, NC.2.NBT.8 |
| 2 | MD | 9 | NC.2.MD.1, NC.2.MD.2, NC.2.MD.3, NC.2.MD.4, NC.2.MD.5, NC.2.MD.6, NC.2.MD.7, NC.2.MD.8, NC.2.MD.10 |
| 2 | G | 2 | NC.2.G.1, NC.2.G.3 |
| 3 | OA | 7 | NC.3.OA.1, NC.3.OA.2, NC.3.OA.3, NC.3.OA.6, NC.3.OA.7, NC.3.OA.8, NC.3.OA.9 |
| 3 | NBT | 2 | NC.3.NBT.2, NC.3.NBT.3 |
| 3 | NF | 4 | NC.3.NF.1, NC.3.NF.2, NC.3.NF.3, NC.3.NF.4 |
| 3 | MD | 6 | NC.3.MD.1, NC.3.MD.2, NC.3.MD.3, NC.3.MD.5, NC.3.MD.7, NC.3.MD.8 |
| 3 | G | 1 | NC.3.G.1 |
| 4 | OA | 4 | NC.4.OA.1, NC.4.OA.3, NC.4.OA.4, NC.4.OA.5 |
| 4 | NBT | 6 | NC.4.NBT.1, NC.4.NBT.2, NC.4.NBT.7, NC.4.NBT.4, NC.4.NBT.5, NC.4.NBT.6 |
| 4 | NF | 6 | NC.4.NF.1, NC.4.NF.2, NC.4.NF.3, NC.4.NF.4, NC.4.NF.6, NC.4.NF.7 |
| 4 | MD | 6 | NC.4.MD.1, NC.4.MD.2, NC.4.MD.8, NC.4.MD.3, NC.4.MD.4, NC.4.MD.6 |
| 4 | G | 3 | NC.4.G.1, NC.4.G.2, NC.4.G.3 |

**The exact weights, from `docs/sources/nc-eog-blueprint.json`.** Grades 1 and 2 get none — see below.

| Grade | Domain | `officialWeightRange` | `officialWeightMidpoint` | `weightGroup` |
|---|---|---|---|---|
| 3 | OA | `'32–36%'` | 34 | — |
| 3 | NBT | `'9–13%'` | 11 | — |
| 3 | NF | `'28–32%'` | 30 | — |
| 3 | MD | `'23–27%'` | 25 | `'MD+G'` |
| 3 | G | `'23–27%'` | 25 | `'MD+G'` |
| 4 | OA | `'14–18%'` | 16 | — |
| 4 | NBT | `'25–29%'` | 27 | — |
| 4 | NF | `'30–34%'` | 32 | — |
| 4 | MD | `'23–27%'` | 25 | `'MD+G'` |
| 4 | G | `'23–27%'` | 25 | `'MD+G'` |

Every `MD+G` domain also gets `weightGroupLabel: 'Measurement & Data and Geometry combined'`. The dashes in the ranges are en dashes (`–`, U+2013), matching Grade 5 and the source document.

**Grades 1 and 2 have no published weights.** `DomainInfo` still requires `officialWeightRange` and `officialWeightMidpoint`, and `domainWeight()` ignores both when `weighting.kind` is `'even-by-standard-count'`. Set `officialWeightRange: 'No state assessment at this grade'` and `officialWeightMidpoint: 0` for every grade 1 and 2 domain, and set no `weightGroup`. The string is what the UI renders, so it must read as an honest sentence rather than a percentage.

- [ ] **Step 1: Write the failing test**

Create `src/curriculum/sourcedStandards.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import type { DomainInfo } from './types';
import sourced from '../../docs/sources/nc-standards-1-5.json';
import blueprint from '../../docs/sources/nc-eog-blueprint.json';
import { GRADE_1_DOMAINS } from './grade1/standards';
import { GRADE_2_DOMAINS } from './grade2/standards';
import { GRADE_3_DOMAINS } from './grade3/standards';
import { GRADE_4_DOMAINS } from './grade4/standards';
import { GRADE_5_DOMAINS } from './grade5/standards';

const BY_GRADE: Record<string, DomainInfo[]> = {
  '1': GRADE_1_DOMAINS,
  '2': GRADE_2_DOMAINS,
  '3': GRADE_3_DOMAINS,
  '4': GRADE_4_DOMAINS,
  '5': GRADE_5_DOMAINS,
};

// The standards a child practises are a claim about a published document.
// These tests are the only thing standing between a transcription slip and a
// child drilling a standard North Carolina does not teach at their grade.
describe.each(Object.keys(BY_GRADE))('grade %s standards match the source', (grade) => {
  const domains = BY_GRADE[grade];
  const src = (sourced as Record<string, { id: string; standards: { code: string }[] }[]>)[grade];

  it('declares exactly the sourced domains, in order', () => {
    expect(domains.map((d) => d.id).sort()).toEqual(src.map((d) => d.id).sort());
  });

  it('declares exactly the sourced codes in each domain', () => {
    for (const srcDomain of src) {
      const ours = domains.find((d) => d.id === srcDomain.id);
      expect(ours, `no ${srcDomain.id} domain`).toBeTruthy();
      expect(new Set(ours!.standards.map((s) => s.code)))
        .toEqual(new Set(srcDomain.standards.map((s) => s.code)));
    }
  });

  it('invents no standard the source does not list', () => {
    const sourcedCodes = new Set(src.flatMap((d) => d.standards.map((s) => s.code)));
    for (const d of domains) {
      for (const s of d.standards) {
        expect(sourcedCodes.has(s.code), `${s.code} appears in no NCDPI source`).toBe(true);
      }
    }
  });
});

describe.each(['3', '4', '5'])('grade %s weights match the blueprint', (grade) => {
  const domains = BY_GRADE[grade];
  const bands = (blueprint as {
    bands: Record<string, { domains: string[]; range: string; midpoint: number }[]>;
  }).bands[grade];

  it('cites the published band for every domain', () => {
    for (const band of bands) {
      for (const id of band.domains) {
        const d = domains.find((x) => x.id === id);
        expect(d, `no ${id} domain at grade ${grade}`).toBeTruthy();
        expect(d!.officialWeightRange, `${id} band`).toBe(band.range);
        expect(d!.officialWeightMidpoint, `${id} midpoint`).toBe(band.midpoint);
      }
    }
  });

  it('groups every domain that shares a band and no domain that does not', () => {
    for (const band of bands) {
      for (const id of band.domains) {
        const d = domains.find((x) => x.id === id)!;
        if (band.domains.length > 1) {
          expect(d.weightGroup, `${id} shares a band but is ungrouped`).toBeTruthy();
          expect(d.weightGroupLabel).toBeTruthy();
        } else {
          expect(d.weightGroup, `${id} has its own band but is grouped`).toBeUndefined();
        }
      }
    }
  });
});

describe.each(['1', '2'])('grade %s claims no blueprint', (grade) => {
  it('cites no percentage, because NCDPI publishes none below grade 3', () => {
    for (const d of BY_GRADE[grade]) {
      expect(d.officialWeightRange).not.toMatch(/%/);
      expect(d.weightGroup).toBeUndefined();
    }
  });
});
```

- [ ] **Step 2: Run it and watch it fail**

Run: `npx vitest run src/curriculum/sourcedStandards.test.ts`
Expected: FAIL — the four `grade<N>/standards.ts` modules do not exist.

The JSON imports need no config change — this was probed on 2026-09-13 against the real repo, and `vitest run`, `tsc -b --force --noEmit`, and `oxlint` all accept a test under `src/` importing `../../docs/sources/*.json` as it stands. If you find otherwise, say so rather than copying the JSON into `src/`: one source of truth is the whole point of this test.

- [ ] **Step 3: Write the four standards modules**

For each grade, follow `src/curriculum/grade5/standards.ts` exactly: a `DomainInfo[]` in descending weight order for grades 3–4 and in OA, NBT, MD, G order for grades 1–2, then the three trailing helpers renamed for the grade (`GRADE_<N>_STANDARDS`, `getStandardByCode`, `getDomainById`).

Per standard, `code` and `domainId` come from the source JSON verbatim. `description` is the source JSON's `text` field, lightly punctuated if it ends mid-clause, with the `bullets` array folded in as `keyConcepts` where they exist. `title` is yours to write — a short, parent-legible name for what the standard teaches, matching the Grade 5 register ("Add & Subtract Fractions with Unlike Denominators"). `weightCategory` is a short phrase naming the standard's priority; for grades 3–4 reference the domain's real band, and for grades 1–2 use a phrase with no percentage in it, such as `'Core (no state assessment at this grade)'`.

Reuse the Grade 5 `color`/`badgeBg` pairs by domain so a domain looks the same in every grade: NF emerald, NBT blue, OA amber, MD violet, G rose — read the exact Tailwind class strings out of `src/curriculum/grade5/standards.ts` rather than retyping them.

- [ ] **Step 4: Run the test**

Run: `npx vitest run src/curriculum/sourcedStandards.test.ts`
Expected: PASS, 13 tests.

- [ ] **Step 5: Confirm the new grades are still unregistered**

Run: `npx vitest run src/curriculum/integrity.test.ts`
Expected: PASS, still only describing grade 5 — Task 4 must not touch `registry.ts`.

- [ ] **Step 6: Lint, typecheck, commit**

```bash
npm run lint && npx tsc -b --noEmit
git add -A
git commit -m "feat: add sourced standards data for grades 1-4"
```

---
# Batch C — Grade 4

The proving run for the pipeline. Grade 4 is built completely before Grades 3, 2, and 1 start, so that anything wrong with the shape is found once rather than four times.

