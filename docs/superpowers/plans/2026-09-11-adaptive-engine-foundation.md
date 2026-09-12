# Adaptive Engine Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Convert the hardwired Grade 5 study app into a multi-grade, adaptive practice platform — with Grade 5 fully working under the new architecture and deployed publicly — leaving Grades 1–4 as a content-only follow-on.

**Architecture:** Curriculum becomes data (one module per grade) rather than a TypeScript union. Questions resolve through a single `QuestionSource` interface backed by two implementations: hand-authored items and parameterized templates that are pure functions of a seed. An adaptive layer of three pure modules (mastery, Leitner scheduler, session composer) selects what to practice. All state stays in `localStorage`, migrated from the existing v1 shape into a v2 multi-profile shape.

**Tech Stack:** React 19, Vite 8, TypeScript 6, Tailwind 4, Vitest, @testing-library/react, fast-check (property-based testing), GitHub Actions + GitHub Pages.

**Spec:** `docs/superpowers/specs/2026-09-11-multi-grade-adaptive-math-design.md`

## Global Constraints

- **No backend, no accounts, no network persistence.** All state in `localStorage`. Users are children; nothing leaves the browser.
- **All questions are multiple choice.** Every incorrect option carries a `misconception` tag naming the error that produces it.
- **Never invent NC standard codes.** Only `NC.5.*` codes already present in `src/data/ncStandards.ts` may be used in this plan. Grades 1–4 are out of scope here.
- **Generators are pure functions of their seed.** No `Math.random()`, no `Date.now()` inside `generate`.
- **Worked solutions derive from the same parameters as the question.** Never hand-write a solution string that restates a computed value independently.
- **Git identity:** `Michael Swanson <8681739+frictionlesscode@users.noreply.github.com>`.
- **Branch:** all work lands on `feat/multi-grade-adaptive`.
- **Commit message trailer** on every commit:
  ```
  Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>
  Claude-Session: https://claude.ai/code/session_01H1td136Jg4sYcrRxZDFbg1
  ```
- **Existing behavior must not regress.** `npm run build` passes at the end of every task.

---

## File Structure

**New:**

| File | Responsibility |
|---|---|
| `src/engine/rng.ts` | Seeded deterministic RNG (`mulberry32`) and the `Rng` helper interface |
| `src/curriculum/types.ts` | `GradeCurriculum`, `DomainInfo`, `StandardInfo`, `Grade` |
| `src/curriculum/registry.ts` | `getCurriculum(grade)`, `ALL_CURRICULA` |
| `src/curriculum/grade5/index.ts` | The Grade 5 `GradeCurriculum` object |
| `src/curriculum/grade5/standards.ts` | Grade 5 domains + standards (moved from `data/ncStandards.ts`) |
| `src/curriculum/grade5/authored.ts` | Grade 5 hand-authored MC items (moved from `data/questions.ts`) |
| `src/curriculum/grade5/templates/*.ts` | One generator per fluency standard |
| `src/engine/questionModel.ts` | `AnswerOption`, `Question`, `QuestionRef`, `ReviewKey` |
| `src/engine/questionSource.ts` | `QuestionSource` interface, authored + generated resolution |
| `src/engine/templateTesting.ts` | Shared property-test harness for all templates |
| `src/engine/mastery.ts` | Mastery percent, status tiers, misconception tallies |
| `src/engine/scheduler.ts` | Leitner review queue |
| `src/engine/sessionComposer.ts` | `selectSession` |
| `src/state/types.ts` | `AppStateV2`, `Profile`, `ProgressState` |
| `src/state/migrate.ts` | v1 → v2 migration |
| `src/state/storage.ts` | Load/save with migration on read |

**Modified:** `src/types/index.ts` (slimmed to re-exports), `src/context/ProgressContext.tsx`, all nine components reading Grade 5 constants, `vite.config.ts`, `package.json`.

**Deleted at the end of Task 5:** `src/data/ncStandards.ts`, `src/data/questions.ts` (content moved, not lost).

---

### Task 1: Test infrastructure and the seeded RNG

Nothing can be TDD'd until a test runner exists. This task delivers the runner plus the first real unit it protects — the RNG every generator depends on.

**Files:**
- Modify: `package.json`
- Create: `vitest.config.ts`
- Create: `src/engine/rng.ts`
- Test: `src/engine/rng.test.ts`

**Interfaces:**
- Consumes: nothing.
- Produces:
  ```ts
  export function mulberry32(seed: number): () => number
  export interface Rng {
    next(): number;                       // [0, 1)
    int(min: number, max: number): number; // inclusive both ends
    pick<T>(items: readonly T[]): T;
    shuffle<T>(items: readonly T[]): T[];  // returns a new array
  }
  export function makeRng(seed: number): Rng
  ```

- [ ] **Step 1: Install test dependencies**

```bash
npm install -D vitest@^3 @vitest/coverage-v8@^3 jsdom@^26 \
  @testing-library/react@^16 @testing-library/jest-dom@^6 \
  @testing-library/user-event@^14 fast-check@^4
```

- [ ] **Step 2: Add the Vitest config**

Create `vitest.config.ts`:

```ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test-setup.ts'],
    include: ['src/**/*.test.{ts,tsx}'],
  },
});
```

Create `src/test-setup.ts`:

```ts
import '@testing-library/jest-dom/vitest';
```

- [ ] **Step 3: Add test scripts to `package.json`**

Add to the `scripts` block:

```json
"test": "vitest",
"test:run": "vitest run",
"typecheck": "tsc -b --noEmit"
```

- [ ] **Step 4: Write the failing test**

Create `src/engine/rng.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { makeRng, mulberry32 } from './rng';

describe('mulberry32', () => {
  it('produces the same sequence for the same seed', () => {
    const a = mulberry32(12345);
    const b = mulberry32(12345);
    const seqA = [a(), a(), a(), a(), a()];
    const seqB = [b(), b(), b(), b(), b()];
    expect(seqA).toEqual(seqB);
  });

  it('produces different sequences for different seeds', () => {
    const a = mulberry32(1);
    const b = mulberry32(2);
    expect([a(), a(), a()]).not.toEqual([b(), b(), b()]);
  });

  it('always returns values in [0, 1)', () => {
    fc.assert(
      fc.property(fc.integer({ min: 0, max: 2 ** 31 }), (seed) => {
        const r = mulberry32(seed);
        for (let i = 0; i < 50; i++) {
          const v = r();
          expect(v).toBeGreaterThanOrEqual(0);
          expect(v).toBeLessThan(1);
        }
      }),
      { numRuns: 200 },
    );
  });
});

describe('makeRng', () => {
  it('int() stays within the inclusive bounds', () => {
    fc.assert(
      fc.property(fc.integer({ min: 0, max: 10000 }), (seed) => {
        const rng = makeRng(seed);
        for (let i = 0; i < 50; i++) {
          const v = rng.int(3, 7);
          expect(v).toBeGreaterThanOrEqual(3);
          expect(v).toBeLessThanOrEqual(7);
          expect(Number.isInteger(v)).toBe(true);
        }
      }),
      { numRuns: 200 },
    );
  });

  it('int() can reach both endpoints', () => {
    const seen = new Set<number>();
    const rng = makeRng(99);
    for (let i = 0; i < 500; i++) seen.add(rng.int(1, 4));
    expect(seen).toEqual(new Set([1, 2, 3, 4]));
  });

  it('shuffle() preserves every element and does not mutate the input', () => {
    const input = [1, 2, 3, 4, 5, 6, 7, 8];
    const frozen = [...input];
    const out = makeRng(7).shuffle(input);
    expect(input).toEqual(frozen);
    expect([...out].sort((a, b) => a - b)).toEqual(frozen);
  });

  it('is fully reproducible from the seed', () => {
    const run = (seed: number) => {
      const r = makeRng(seed);
      return [r.int(1, 100), r.pick(['a', 'b', 'c']), r.shuffle([1, 2, 3, 4])];
    };
    expect(run(42)).toEqual(run(42));
  });
});
```

- [ ] **Step 5: Run test to verify it fails**

Run: `npm run test:run -- src/engine/rng.test.ts`
Expected: FAIL — `Failed to resolve import "./rng"`.

- [ ] **Step 6: Write the implementation**

Create `src/engine/rng.ts`:

```ts
/**
 * mulberry32 — a small, fast, well-distributed 32-bit PRNG.
 * Chosen because it is deterministic, dependency-free, and its entire
 * state is one integer, so a question is fully reproducible from a seed.
 */
export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return function () {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export interface Rng {
  next(): number;
  int(min: number, max: number): number;
  pick<T>(items: readonly T[]): T;
  shuffle<T>(items: readonly T[]): T[];
}

export function makeRng(seed: number): Rng {
  const next = mulberry32(seed);
  const rng: Rng = {
    next,
    int(min, max) {
      return min + Math.floor(next() * (max - min + 1));
    },
    pick(items) {
      if (items.length === 0) throw new Error('pick() called on an empty array');
      return items[rng.int(0, items.length - 1)];
    },
    shuffle(items) {
      const out = [...items];
      for (let i = out.length - 1; i > 0; i--) {
        const j = rng.int(0, i);
        [out[i], out[j]] = [out[j], out[i]];
      }
      return out;
    },
  };
  return rng;
}
```

- [ ] **Step 7: Run tests to verify they pass**

Run: `npm run test:run -- src/engine/rng.test.ts`
Expected: PASS, 8 tests.

- [ ] **Step 8: Verify the build still works**

Run: `npm run build`
Expected: build succeeds.

- [ ] **Step 9: Commit**

```bash
git add package.json package-lock.json vitest.config.ts src/test-setup.ts src/engine/rng.ts src/engine/rng.test.ts
git commit -m "$(cat <<'EOF'
test: add Vitest and fast-check, plus the seeded RNG

Generators must be pure functions of a seed so worked solutions cannot
drift from their questions and attempt history can store {templateId,
seed} instead of full question text. mulberry32 gives that with a
single-integer state and no dependency.

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01H1td136Jg4sYcrRxZDFbg1
EOF
)"
```

---

### Task 2: Curriculum types and registry

**Files:**
- Create: `src/curriculum/types.ts`
- Create: `src/curriculum/registry.ts`
- Test: `src/curriculum/registry.test.ts`

**Interfaces:**
- Consumes: nothing.
- Produces:
  ```ts
  export type Grade = 1 | 2 | 3 | 4 | 5;
  export type DomainId = string;
  export type StandardCode = string;

  export interface StandardInfo {
    code: StandardCode;
    domainId: DomainId;
    title: string;
    description: string;
    weightCategory: string;
    keyConcepts: string[];
  }

  export interface DomainInfo {
    id: DomainId;
    name: string;
    shortName: string;
    officialWeightRange: string;
    officialWeightMidpoint: number;
    description: string;
    color: string;
    badgeBg: string;
    standards: StandardInfo[];
  }

  export type Weighting =
    | { kind: 'ncdpi-blueprint'; source: string }
    | { kind: 'even-by-standard-count' };

  export interface GradeCurriculum {
    grade: Grade;
    label: string;
    ssa: { passingPercent: number; targetsGrade: number };
    weighting: Weighting;
    contentComplete: boolean;
    domains: DomainInfo[];
  }

  export function getCurriculum(grade: Grade): GradeCurriculum;
  export function listCurricula(): GradeCurriculum[];
  export function standardsOf(c: GradeCurriculum): StandardInfo[];
  export function domainWeight(c: GradeCurriculum, domainId: DomainId): number;
  ```

- [ ] **Step 1: Write the failing test**

Create `src/curriculum/registry.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { getCurriculum, listCurricula, standardsOf, domainWeight } from './registry';
import type { GradeCurriculum } from './types';

describe('registry', () => {
  it('returns the grade 5 curriculum', () => {
    const c = getCurriculum(5);
    expect(c.grade).toBe(5);
    expect(c.domains.length).toBeGreaterThan(0);
  });

  it('throws for a grade with no curriculum module', () => {
    // Grades 1-4 are a later plan; asking for one must fail loudly,
    // not return an empty curriculum that renders as a blank app.
    expect(() => getCurriculum(3)).toThrow(/no curriculum/i);
  });

  it('lists only grades that actually have modules', () => {
    expect(listCurricula().map((c) => c.grade)).toEqual([5]);
  });
});

describe('domainWeight', () => {
  const evenCurriculum: GradeCurriculum = {
    grade: 1,
    label: 'Test',
    ssa: { passingPercent: 80, targetsGrade: 1 },
    weighting: { kind: 'even-by-standard-count' },
    contentComplete: false,
    domains: [
      { id: 'A', name: 'A', shortName: 'A', officialWeightRange: '', officialWeightMidpoint: 0,
        description: '', color: 'blue', badgeBg: '',
        standards: [
          { code: 'X.1', domainId: 'A', title: '', description: '', weightCategory: '', keyConcepts: [] },
          { code: 'X.2', domainId: 'A', title: '', description: '', weightCategory: '', keyConcepts: [] },
          { code: 'X.3', domainId: 'A', title: '', description: '', weightCategory: '', keyConcepts: [] },
        ] },
      { id: 'B', name: 'B', shortName: 'B', officialWeightRange: '', officialWeightMidpoint: 0,
        description: '', color: 'red', badgeBg: '',
        standards: [
          { code: 'Y.1', domainId: 'B', title: '', description: '', weightCategory: '', keyConcepts: [] },
        ] },
    ],
  };

  it('uses the NCDPI midpoint when a blueprint exists', () => {
    const c = getCurriculum(5);
    const nf = c.domains.find((d) => d.id === 'NF')!;
    expect(domainWeight(c, 'NF')).toBe(nf.officialWeightMidpoint);
  });

  it('weights by standard count when no blueprint exists', () => {
    // 3 of 4 standards live in domain A, so A carries 75%.
    expect(domainWeight(evenCurriculum, 'A')).toBe(75);
    expect(domainWeight(evenCurriculum, 'B')).toBe(25);
  });

  it('returns 0 for an unknown domain rather than NaN', () => {
    expect(domainWeight(evenCurriculum, 'ZZZ')).toBe(0);
  });
});

describe('standardsOf', () => {
  it('flattens every domain into one list', () => {
    const c = getCurriculum(5);
    const total = c.domains.reduce((n, d) => n + d.standards.length, 0);
    expect(standardsOf(c)).toHaveLength(total);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test:run -- src/curriculum/registry.test.ts`
Expected: FAIL — cannot resolve `./registry`.

- [ ] **Step 3: Write `src/curriculum/types.ts`**

```ts
export type Grade = 1 | 2 | 3 | 4 | 5;

/** A domain key such as 'NF'. Deliberately a string, not a union:
 *  grades 1-2 have no Fractions domain and grades 6+ use different
 *  domains entirely. Validity is asserted by the integrity test. */
export type DomainId = string;

/** A standard code such as 'NC.5.NF.1'. */
export type StandardCode = string;

export interface StandardInfo {
  code: StandardCode;
  domainId: DomainId;
  title: string;
  description: string;
  weightCategory: string;
  keyConcepts: string[];
}

export interface DomainInfo {
  id: DomainId;
  name: string;
  shortName: string;
  officialWeightRange: string;
  officialWeightMidpoint: number;
  description: string;
  color: string;
  badgeBg: string;
  standards: StandardInfo[];
}

/**
 * NCDPI publishes EOG blueprints for grades 3-8 only. Grades 1-2 have no
 * state assessment, so there is no official weight to cite and the UI must
 * not imply one exists.
 */
export type Weighting =
  | { kind: 'ncdpi-blueprint'; source: string }
  | { kind: 'even-by-standard-count' };

export interface GradeCurriculum {
  grade: Grade;
  label: string;
  ssa: {
    /** WCPSS SSA policy figure; per-grade, not a global constant. */
    passingPercent: number;
    /** Mastering this curriculum accelerates past this grade. */
    targetsGrade: number;
  };
  weighting: Weighting;
  /** Gates the coverage assertion in the integrity test. Flip to true
   *  only when every standard in this grade has at least one source. */
  contentComplete: boolean;
  domains: DomainInfo[];
}
```

- [ ] **Step 4: Write `src/curriculum/registry.ts`**

```ts
import type { Grade, GradeCurriculum, DomainId, StandardInfo } from './types';
import { GRADE_5 } from './grade5';

const CURRICULA: Partial<Record<Grade, GradeCurriculum>> = {
  5: GRADE_5,
};

export function getCurriculum(grade: Grade): GradeCurriculum {
  const c = CURRICULA[grade];
  if (!c) throw new Error(`No curriculum module for grade ${grade}`);
  return c;
}

export function listCurricula(): GradeCurriculum[] {
  return Object.values(CURRICULA).sort((a, b) => a.grade - b.grade);
}

export function standardsOf(c: GradeCurriculum): StandardInfo[] {
  return c.domains.flatMap((d) => d.standards);
}

/** Percentage weight of a domain within its grade, 0-100. */
export function domainWeight(c: GradeCurriculum, domainId: DomainId): number {
  const domain = c.domains.find((d) => d.id === domainId);
  if (!domain) return 0;
  if (c.weighting.kind === 'ncdpi-blueprint') return domain.officialWeightMidpoint;
  const total = standardsOf(c).length;
  if (total === 0) return 0;
  return (domain.standards.length / total) * 100;
}
```

- [ ] **Step 5: Run tests to verify they pass**

Run: `npm run test:run -- src/curriculum/registry.test.ts`
Expected: FAIL — `./grade5` does not exist yet. This is expected; Task 3 creates it. Do not proceed to commit until Task 3 completes. If you are executing tasks independently, implement Task 3 before re-running.

- [ ] **Step 6: Commit (after Task 3 makes the suite green)**

Tasks 2 and 3 land as one commit because the registry cannot compile without a grade module. See Task 3, Step 6.

---

### Task 3: Move Grade 5 standards into the curriculum module

Pure relocation. No content changes — this is the task that must not alter behavior, so that anything that breaks later is known to be new code, not a botched move.

**Files:**
- Create: `src/curriculum/grade5/standards.ts` (content from `src/data/ncStandards.ts`)
- Create: `src/curriculum/grade5/index.ts`
- Test: `src/curriculum/grade5/grade5.test.ts`

**Interfaces:**
- Consumes: `GradeCurriculum`, `DomainInfo` from Task 2.
- Produces: `export const GRADE_5: GradeCurriculum`, `export const GRADE_5_DOMAINS: DomainInfo[]`.

- [ ] **Step 1: Write the failing test**

Create `src/curriculum/grade5/grade5.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { GRADE_5 } from './index';

describe('GRADE_5', () => {
  it('has the five NC grade 5 domains', () => {
    expect(GRADE_5.domains.map((d) => d.id).sort()).toEqual(['G', 'MD', 'NBT', 'NF', 'OA']);
  });

  it('has all 16 standards', () => {
    const codes = GRADE_5.domains.flatMap((d) => d.standards.map((s) => s.code));
    expect(codes).toHaveLength(16);
    expect(new Set(codes).size).toBe(16);
  });

  it('uses the NCDPI blueprint weighting and cites a source', () => {
    expect(GRADE_5.weighting.kind).toBe('ncdpi-blueprint');
    if (GRADE_5.weighting.kind === 'ncdpi-blueprint') {
      expect(GRADE_5.weighting.source.length).toBeGreaterThan(0);
    }
  });

  it('carries the WCPSS 80% SSA cutoff and targets grade 5', () => {
    expect(GRADE_5.ssa.passingPercent).toBe(80);
    expect(GRADE_5.ssa.targetsGrade).toBe(5);
  });

  it('declares every standard under its own domain', () => {
    for (const d of GRADE_5.domains) {
      for (const s of d.standards) expect(s.domainId).toBe(d.id);
    }
  });

  it('has blueprint midpoints summing to roughly 100', () => {
    const sum = GRADE_5.domains.reduce((n, d) => n + d.officialWeightMidpoint, 0);
    expect(sum).toBeGreaterThanOrEqual(98);
    expect(sum).toBeLessThanOrEqual(102);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test:run -- src/curriculum/grade5/`
Expected: FAIL — cannot resolve `./index`.

- [ ] **Step 3: Move the standards data**

```bash
git mv src/data/ncStandards.ts src/curriculum/grade5/standards.ts
```

Then in `src/curriculum/grade5/standards.ts`:
- Change the import to `import type { DomainInfo, StandardInfo } from '../types';`
- Rename the export `NC_DOMAINS` to `GRADE_5_DOMAINS`.
- Keep `ALL_STANDARDS` and the lookup helper, but rename `ALL_STANDARDS` to `GRADE_5_STANDARDS`.
- Change **no** titles, descriptions, weights, or key concepts.

- [ ] **Step 4: Write `src/curriculum/grade5/index.ts`**

```ts
import type { GradeCurriculum } from '../types';
import { GRADE_5_DOMAINS } from './standards';

export { GRADE_5_DOMAINS, GRADE_5_STANDARDS } from './standards';

export const GRADE_5: GradeCurriculum = {
  grade: 5,
  label: 'Grade 5 Mathematics',
  ssa: { passingPercent: 80, targetsGrade: 5 },
  weighting: {
    kind: 'ncdpi-blueprint',
    source: 'NCDPI Grade 5 Mathematics EOG Assessment Blueprint',
  },
  contentComplete: true,
  domains: GRADE_5_DOMAINS,
};
```

- [ ] **Step 5: Fix imports across the app**

Run: `npx tsc -b --noEmit` and repair every reported import of `../data/ncStandards`, repointing it at `../curriculum/grade5` and renaming `NC_DOMAINS` → `GRADE_5_DOMAINS`. Do not change component logic in this task.

- [ ] **Step 6: Run the full suite and build**

Run: `npm run test:run && npm run build`
Expected: all tests PASS (registry tests from Task 2 now green), build succeeds.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "$(cat <<'EOF'
refactor: make curriculum data per-grade rather than a fixed union

DomainId becomes a string validated by tests instead of a 5-member
union, because grades 1-2 have no Fractions domain and cannot be
expressed otherwise. Weighting becomes explicit: grades 1-2 have no
published NCDPI blueprint, so the model must be able to say that
rather than imply an official weight exists.

Grade 5 content is moved verbatim; no titles, weights, or standards
are altered.

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01H1td136Jg4sYcrRxZDFbg1
EOF
)"
```

---

### Task 4: The multiple-choice question model

**Files:**
- Create: `src/engine/questionModel.ts`
- Test: `src/engine/questionModel.test.ts`

**Interfaces:**
- Consumes: `StandardCode`, `DomainId` from `src/curriculum/types.ts`.
- Produces:
  ```ts
  export type Difficulty = 'mastery' | 'advanced' | 'stretch';

  export interface AnswerOption {
    label: string;            // 'A' | 'B' | 'C' | 'D'
    text: string;
    isCorrect: boolean;
    misconception?: string;   // required on every incorrect option
  }

  export interface Explanation {
    stepByStep: string[];
    conceptSummary: string;
    commonMisconception?: string;
  }

  export interface Question {
    id: string;
    standardCode: StandardCode;
    domainId: DomainId;
    prompt: string;
    promptDetails?: string;
    options: AnswerOption[];
    calculatorAllowed: boolean;
    isStretch: boolean;
    difficulty: Difficulty;
    explanation: Explanation;
  }

  export type QuestionRef =
    | { kind: 'authored'; id: string }
    | { kind: 'generated'; templateId: string; seed: number };

  export type ReviewKey =
    | { kind: 'authored'; id: string }
    | { kind: 'generated'; templateId: string };

  export function reviewKeyOf(ref: QuestionRef): ReviewKey;
  export function reviewKeyId(key: ReviewKey): string;
  export function correctOption(q: Question): AnswerOption;
  export function labelOptions(texts: {text: string; isCorrect: boolean; misconception?: string}[]): AnswerOption[];
  ```

- [ ] **Step 1: Write the failing test**

Create `src/engine/questionModel.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { reviewKeyOf, reviewKeyId, correctOption, labelOptions } from './questionModel';
import type { Question } from './questionModel';

const q: Question = {
  id: 'x-1', standardCode: 'NC.5.NF.1', domainId: 'NF',
  prompt: 'p', options: [
    { label: 'A', text: '5/6', isCorrect: true },
    { label: 'B', text: '3/9', isCorrect: false, misconception: 'added-denominators' },
  ],
  calculatorAllowed: false, isStretch: false, difficulty: 'mastery',
  explanation: { stepByStep: ['s'], conceptSummary: 'c' },
};

describe('reviewKeyOf', () => {
  it('drops the seed from a generated ref', () => {
    // The scheduler must match a fresh instance of the same template.
    // Keying on the seed would mean a re-served question never matched
    // its own queue entry and stayed due forever.
    expect(reviewKeyOf({ kind: 'generated', templateId: 't1', seed: 42 }))
      .toEqual({ kind: 'generated', templateId: 't1' });
  });

  it('keeps an authored id', () => {
    expect(reviewKeyOf({ kind: 'authored', id: 'nf1-01' }))
      .toEqual({ kind: 'authored', id: 'nf1-01' });
  });

  it('gives two different seeds of one template the same key id', () => {
    const a = reviewKeyId(reviewKeyOf({ kind: 'generated', templateId: 't1', seed: 1 }));
    const b = reviewKeyId(reviewKeyOf({ kind: 'generated', templateId: 't1', seed: 999 }));
    expect(a).toBe(b);
  });

  it('never collides an authored id with a template id', () => {
    expect(reviewKeyId({ kind: 'authored', id: 'same' }))
      .not.toBe(reviewKeyId({ kind: 'generated', templateId: 'same' }));
  });
});

describe('correctOption', () => {
  it('returns the option marked correct', () => {
    expect(correctOption(q).text).toBe('5/6');
  });

  it('throws when no option is correct', () => {
    const bad = { ...q, options: q.options.map((o) => ({ ...o, isCorrect: false })) };
    expect(() => correctOption(bad)).toThrow(/exactly one/i);
  });

  it('throws when more than one option is correct', () => {
    const bad = { ...q, options: q.options.map((o) => ({ ...o, isCorrect: true })) };
    expect(() => correctOption(bad)).toThrow(/exactly one/i);
  });
});

describe('labelOptions', () => {
  it('assigns A, B, C, D in order', () => {
    const out = labelOptions([
      { text: '1', isCorrect: true },
      { text: '2', isCorrect: false, misconception: 'm1' },
      { text: '3', isCorrect: false, misconception: 'm2' },
      { text: '4', isCorrect: false, misconception: 'm3' },
    ]);
    expect(out.map((o) => o.label)).toEqual(['A', 'B', 'C', 'D']);
  });

  it('rejects an incorrect option with no misconception tag', () => {
    expect(() => labelOptions([
      { text: '1', isCorrect: true },
      { text: '2', isCorrect: false },
    ])).toThrow(/misconception/i);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test:run -- src/engine/questionModel.test.ts`
Expected: FAIL — cannot resolve `./questionModel`.

- [ ] **Step 3: Write the implementation**

Create `src/engine/questionModel.ts`:

```ts
import type { StandardCode, DomainId } from '../curriculum/types';

export type Difficulty = 'mastery' | 'advanced' | 'stretch';

export interface AnswerOption {
  label: string;
  text: string;
  isCorrect: boolean;
  /** Names the specific error that produces this option. Required on
   *  every incorrect option: it is what makes a wrong answer diagnostic
   *  rather than merely wrong. */
  misconception?: string;
}

export interface Explanation {
  stepByStep: string[];
  conceptSummary: string;
  commonMisconception?: string;
}

export interface Question {
  id: string;
  standardCode: StandardCode;
  domainId: DomainId;
  prompt: string;
  promptDetails?: string;
  options: AnswerOption[];
  calculatorAllowed: boolean;
  isStretch: boolean;
  difficulty: Difficulty;
  explanation: Explanation;
}

export type QuestionRef =
  | { kind: 'authored'; id: string }
  | { kind: 'generated'; templateId: string; seed: number };

/** A schedulable identity. Deliberately seedless: review re-serves a
 *  fresh instance of a template, which must match the same queue entry. */
export type ReviewKey =
  | { kind: 'authored'; id: string }
  | { kind: 'generated'; templateId: string };

export function reviewKeyOf(ref: QuestionRef): ReviewKey {
  return ref.kind === 'authored'
    ? { kind: 'authored', id: ref.id }
    : { kind: 'generated', templateId: ref.templateId };
}

export function reviewKeyId(key: ReviewKey): string {
  return key.kind === 'authored' ? `a:${key.id}` : `g:${key.templateId}`;
}

export function correctOption(q: Question): AnswerOption {
  const correct = q.options.filter((o) => o.isCorrect);
  if (correct.length !== 1) {
    throw new Error(
      `Question ${q.id} must have exactly one correct option, found ${correct.length}`,
    );
  }
  return correct[0];
}

const LABELS = ['A', 'B', 'C', 'D', 'E', 'F'];

export function labelOptions(
  texts: { text: string; isCorrect: boolean; misconception?: string }[],
): AnswerOption[] {
  return texts.map((t, i) => {
    if (!t.isCorrect && !t.misconception) {
      throw new Error(`Incorrect option "${t.text}" is missing a misconception tag`);
    }
    return { label: LABELS[i], text: t.text, isCorrect: t.isCorrect, misconception: t.misconception };
  });
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm run test:run -- src/engine/questionModel.test.ts`
Expected: PASS, 9 tests.

- [ ] **Step 5: Commit**

```bash
git add src/engine/questionModel.ts src/engine/questionModel.test.ts
git commit -m "$(cat <<'EOF'
feat: add the multiple-choice question model

NC EOG mathematics is multiple choice, so all items become MC. The
weakness of MC for practice is that a student can eliminate or
back-solve and post a score that overstates mastery; the mitigation is
that every incorrect option carries a misconception tag naming the
error that produces it, making the chosen wrong answer diagnostic.

ReviewKey drops the seed so a freshly generated instance of a template
matches its own scheduler entry.

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01H1td136Jg4sYcrRxZDFbg1
EOF
)"
```

---

### Task 5: Convert the 49 authored questions to multiple choice

Content work with a mechanical test gate. 15 items are already MC and need their options restructured into `AnswerOption` with misconception tags; 34 are open-response and need three engineered distractors each.

**Files:**
- Create: `src/curriculum/grade5/authored.ts` (from `src/data/questions.ts`)
- Test: `src/curriculum/grade5/authored.test.ts`
- Delete: `src/data/questions.ts`

**Interfaces:**
- Consumes: `Question`, `AnswerOption`, `labelOptions` (Task 4); `GRADE_5_STANDARDS` (Task 3).
- Produces: `export const GRADE_5_AUTHORED: Question[]`.

- [ ] **Step 1: Write the failing test**

Create `src/curriculum/grade5/authored.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { GRADE_5_AUTHORED } from './authored';
import { GRADE_5 } from './index';
import { correctOption } from '../../engine/questionModel';

const codes = new Set(GRADE_5.domains.flatMap((d) => d.standards.map((s) => s.code)));

describe('GRADE_5_AUTHORED', () => {
  it('retains all 49 items', () => {
    expect(GRADE_5_AUTHORED).toHaveLength(49);
  });

  it('has unique ids', () => {
    const ids = GRADE_5_AUTHORED.map((q) => q.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it.each(GRADE_5_AUTHORED.map((q) => [q.id, q] as const))(
    '%s is a well-formed multiple-choice item',
    (_id, q) => {
      expect(codes.has(q.standardCode)).toBe(true);
      expect(q.options.length).toBe(4);
      expect(() => correctOption(q)).not.toThrow();

      const texts = q.options.map((o) => o.text.trim());
      expect(new Set(texts).size).toBe(4);           // no duplicate options

      for (const o of q.options) {
        expect(o.text.trim().length).toBeGreaterThan(0);
        if (!o.isCorrect) expect(o.misconception, `${q.id} option ${o.label}`).toBeTruthy();
      }

      expect(q.explanation.stepByStep.length).toBeGreaterThan(0);
      expect(q.explanation.conceptSummary.length).toBeGreaterThan(0);
    },
  );

  it('covers every grade 5 standard', () => {
    const covered = new Set(GRADE_5_AUTHORED.map((q) => q.standardCode));
    for (const code of codes) expect(covered.has(code), `no item for ${code}`).toBe(true);
  });

  it('assigns each question to the domain that owns its standard', () => {
    const ownerOf = new Map(
      GRADE_5.domains.flatMap((d) => d.standards.map((s) => [s.code, d.id] as const)),
    );
    for (const q of GRADE_5_AUTHORED) expect(q.domainId).toBe(ownerOf.get(q.standardCode));
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test:run -- src/curriculum/grade5/authored.test.ts`
Expected: FAIL — cannot resolve `./authored`.

- [ ] **Step 3: Move and convert the question bank**

```bash
git mv src/data/questions.ts src/curriculum/grade5/authored.ts
```

Rename the export `QUESTIONS_BANK` → `GRADE_5_AUTHORED`. Import `Question` from `../../engine/questionModel`.

For each of the 15 existing multiple-choice items: convert the `options: string[]` array into `AnswerOption[]`, stripping the `'A) '` prefix from each `text`, marking the one matching `correctAnswer` as `isCorrect`, and adding a `misconception` tag to the other three. Delete the now-unused `correctAnswer`, `acceptableAnswers`, `questionType`, and `unit` fields.

For each of the 34 open-response items: keep the prompt and explanation; the existing `correctAnswer` becomes the correct option's `text`; write three distractors, each the result of one named error.

**Worked example** — converting `nf1-03`, an open-response item whose answer is `5/6`:

```ts
{
  id: 'nf1-03',
  standardCode: 'NC.5.NF.1',
  domainId: 'NF',
  prompt: 'A recipe needs 2/3 cup of flour and 1/6 cup of cornmeal. How much dry ingredient is needed in all?',
  options: labelOptions([
    { text: '5/6 cup', isCorrect: true },
    { text: '3/9 cup', isCorrect: false, misconception: 'added-numerators-and-denominators' },
    { text: '1/2 cup', isCorrect: false, misconception: 'common-denominator-numerator-not-scaled' },
    { text: '3/6 cup', isCorrect: false, misconception: 'converted-only-second-fraction' },
  ]),
  calculatorAllowed: false,
  isStretch: false,
  difficulty: 'mastery',
  explanation: {
    stepByStep: [
      'Step 1: 6 is a multiple of 3, so the common denominator is 6.',
      'Step 2: Rescale 2/3 by 2/2 to get 4/6. The 1/6 is already in sixths.',
      'Step 3: Add the numerators over the common denominator: 4/6 + 1/6 = 5/6.',
    ],
    conceptSummary: 'Fractions can only be added once they name parts of the same size, so rescale to a common denominator first and add numerators only.',
    commonMisconception: 'Adding denominators as well as numerators gives 3/9, which is smaller than either addend — a quick sanity check that catches this error.',
  },
},
```

**Use this misconception vocabulary** so tallies aggregate across items. Reuse these exact strings:

| Tag | Error |
|---|---|
| `added-numerators-and-denominators` | Added straight across instead of finding a common denominator |
| `common-denominator-numerator-not-scaled` | Found the common denominator but left the numerator unchanged |
| `converted-only-second-fraction` | Rescaled one addend only |
| `forgot-to-regroup` | Subtracted without borrowing a whole from the mixed number |
| `inverted-wrong-factor` | Reciprocated the dividend instead of the divisor |
| `multiplied-instead-of-divided` | Applied the wrong operation |
| `place-value-shift-wrong-direction` | Moved the decimal the wrong way for a power of 10 |
| `decimal-point-misplaced` | Correct digits, wrong magnitude |
| `compared-by-digit-count` | Judged 0.45 > 0.5 because it has more digits |
| `ignored-remainder` | Dropped the remainder rather than interpreting it |
| `used-perimeter-formula` | Added dimensions instead of multiplying |
| `used-area-not-volume` | Multiplied two dimensions instead of three |
| `unit-conversion-inverted` | Multiplied where division was needed |
| `coordinates-reversed` | Plotted (y, x) instead of (x, y) |
| `order-of-operations-left-to-right` | Evaluated strictly left to right |
| `hierarchy-too-narrow` | Denied that a square is a rectangle |

If an item needs an error not on this list, add a row here in the same commit.

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm run test:run -- src/curriculum/grade5/authored.test.ts`
Expected: PASS — 49 parameterized cases plus 4 aggregate assertions.

- [ ] **Step 5: Repair the app's imports and build**

Run: `npx tsc -b --noEmit`, repoint every import of `../data/questions` at `../curriculum/grade5/authored`, and update `QuizRunner`/`QuizResults` to render `q.options` as `AnswerOption[]`. Answer checking becomes an option-label comparison.

Run: `npm run test:run && npm run build`
Expected: all PASS, build succeeds.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "$(cat <<'EOF'
feat: convert the question bank to multiple choice with tagged distractors

NC EOG mathematics is multiple choice; the bank was inverted, with 34
of 49 items open-response. Every wrong option is now the answer
produced by one named misconception drawn from a shared vocabulary, so
tallies aggregate across items and a consistently chosen distractor
names the error to fix.

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01H1td136Jg4sYcrRxZDFbg1
EOF
)"
```

---

### Task 6: Template interface and the property-test harness

The harness lands before any generator, so every generator is written against it.

**Files:**
- Create: `src/engine/template.ts`
- Create: `src/engine/templateTesting.ts`
- Create: `src/curriculum/grade5/templates/nf1-add-unlike.ts`
- Test: `src/curriculum/grade5/templates/nf1-add-unlike.test.ts`

**Interfaces:**
- Consumes: `Rng`, `makeRng` (Task 1); `Question`, `AnswerOption`, `labelOptions` (Task 4).
- Produces:
  ```ts
  export interface QuestionTemplate {
    id: string;
    standardCode: StandardCode;
    domainId: DomainId;
    difficulty: Difficulty;
    calculatorAllowed: boolean;
    isStretch: boolean;
    /** Pure in rng. The returned answer value must also appear as the
     *  final element of explanation.stepByStep. */
    generate(rng: Rng): GeneratedQuestion;
  }

  export interface GeneratedQuestion {
    prompt: string;
    promptDetails?: string;
    options: AnswerOption[];
    explanation: Explanation;
    /** The canonical answer, used by the harness to check the solution. */
    answerText: string;
  }

  export function assertTemplateSound(t: QuestionTemplate, opts?: { runs?: number }): void;
  ```

- [ ] **Step 1: Write `src/engine/template.ts`**

```ts
import type { Rng } from './rng';
import type { StandardCode, DomainId } from '../curriculum/types';
import type { AnswerOption, Explanation, Difficulty, Question } from './questionModel';

export interface GeneratedQuestion {
  prompt: string;
  promptDetails?: string;
  options: AnswerOption[];
  explanation: Explanation;
  answerText: string;
}

export interface QuestionTemplate {
  id: string;
  standardCode: StandardCode;
  domainId: DomainId;
  difficulty: Difficulty;
  calculatorAllowed: boolean;
  isStretch: boolean;
  generate(rng: Rng): GeneratedQuestion;
}

/** Materialize a template at a seed into a full Question. */
export function realize(t: QuestionTemplate, seed: number, rng: Rng): Question {
  const g = t.generate(rng);
  return {
    id: `${t.id}#${seed}`,
    standardCode: t.standardCode,
    domainId: t.domainId,
    prompt: g.prompt,
    promptDetails: g.promptDetails,
    options: g.options,
    calculatorAllowed: t.calculatorAllowed,
    isStretch: t.isStretch,
    difficulty: t.difficulty,
    explanation: g.explanation,
  };
}
```

- [ ] **Step 2: Write the harness `src/engine/templateTesting.ts`**

```ts
import { expect } from 'vitest';
import fc from 'fast-check';
import { makeRng } from './rng';
import type { QuestionTemplate } from './template';

/**
 * A template correct at seeds 1-10 can still emit a broken question at
 * seed 4912, so every template is checked across hundreds of seeds.
 * These are the invariants that make generated practice trustworthy.
 */
export function assertTemplateSound(t: QuestionTemplate, opts: { runs?: number } = {}): void {
  fc.assert(
    fc.property(fc.integer({ min: 0, max: 2 ** 31 - 1 }), (seed) => {
      const g = t.generate(makeRng(seed));
      const where = `${t.id} @ seed ${seed}`;

      expect(g.prompt.trim().length, `${where}: empty prompt`).toBeGreaterThan(0);
      expect(g.options.length, `${where}: expected 4 options`).toBe(4);

      const correct = g.options.filter((o) => o.isCorrect);
      expect(correct.length, `${where}: exactly one correct option`).toBe(1);
      expect(correct[0].text, `${where}: answerText must match the correct option`)
        .toBe(g.answerText);

      const texts = g.options.map((o) => o.text.trim());
      expect(new Set(texts).size, `${where}: duplicate option text ${texts.join(' | ')}`).toBe(4);

      for (const o of g.options) {
        expect(o.text.trim().length, `${where}: blank option`).toBeGreaterThan(0);
        if (!o.isCorrect) {
          expect(o.misconception, `${where}: option ${o.label} has no misconception tag`)
            .toBeTruthy();
        }
      }

      expect(g.explanation.stepByStep.length, `${where}: no worked solution`).toBeGreaterThan(0);
      const lastStep = g.explanation.stepByStep[g.explanation.stepByStep.length - 1];
      expect(
        lastStep.includes(g.answerText),
        `${where}: final solution step "${lastStep}" does not state the answer "${g.answerText}"`,
      ).toBe(true);

      expect(
        /NaN|Infinity|undefined|null/.test(JSON.stringify(g)),
        `${where}: numeric or template corruption in output`,
      ).toBe(false);
    }),
    { numRuns: opts.runs ?? 300 },
  );
}
```

- [ ] **Step 3: Write the failing test for the first generator**

Create `src/curriculum/grade5/templates/nf1-add-unlike.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { makeRng } from '../../../engine/rng';
import { assertTemplateSound } from '../../../engine/templateTesting';
import { nf1AddUnlike } from './nf1-add-unlike';

describe('nf1AddUnlike', () => {
  it('satisfies every template invariant across 300 seeds', () => {
    assertTemplateSound(nf1AddUnlike);
  });

  it('is deterministic in its seed', () => {
    const a = nf1AddUnlike.generate(makeRng(777));
    const b = nf1AddUnlike.generate(makeRng(777));
    expect(a).toEqual(b);
  });

  it('always uses related denominators, as NC.5.NF.1 requires', () => {
    // NC limits grade 5 to denominators where one is a multiple of the
    // other; a generator emitting 2/5 + 1/3 would be off-standard.
    for (let seed = 0; seed < 200; seed++) {
      const g = nf1AddUnlike.generate(makeRng(seed));
      const dens = [...g.prompt.matchAll(/\d+\/(\d+)/g)].map((m) => Number(m[1]));
      expect(dens).toHaveLength(2);
      const [d1, d2] = dens;
      expect(Math.max(d1, d2) % Math.min(d1, d2), `seed ${seed}: ${d1}, ${d2}`).toBe(0);
      expect(d1).not.toBe(d2);
    }
  });

  it('produces the added-across distractor', () => {
    const g = nf1AddUnlike.generate(makeRng(3));
    const tags = g.options.filter((o) => !o.isCorrect).map((o) => o.misconception);
    expect(tags).toContain('added-numerators-and-denominators');
  });
});
```

- [ ] **Step 4: Run test to verify it fails**

Run: `npm run test:run -- src/curriculum/grade5/templates/`
Expected: FAIL — cannot resolve `./nf1-add-unlike`.

- [ ] **Step 5: Write the generator**

Create `src/curriculum/grade5/templates/nf1-add-unlike.ts`:

```ts
import type { Rng } from '../../../engine/rng';
import type { QuestionTemplate, GeneratedQuestion } from '../../../engine/template';
import { labelOptions } from '../../../engine/questionModel';

const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b));

function simplify(n: number, d: number): string {
  const g = gcd(n, d) || 1;
  const sn = n / g;
  const sd = d / g;
  return sd === 1 ? `${sn}` : `${sn}/${sd}`;
}

export const nf1AddUnlike: QuestionTemplate = {
  id: 'g5.nf1.add-unlike',
  standardCode: 'NC.5.NF.1',
  domainId: 'NF',
  difficulty: 'mastery',
  calculatorAllowed: false,
  isStretch: false,

  generate(rng: Rng): GeneratedQuestion {
    // NC.5.NF.1 restricts grade 5 to related denominators, so build the
    // larger denominator as a multiple of the smaller one.
    const dSmall = rng.pick([2, 3, 4, 5, 6]);
    const factor = rng.int(2, 4);
    const dLarge = dSmall * factor;

    const nSmall = rng.int(1, dSmall - 1);
    const nLarge = rng.int(1, dLarge - 1);

    // Rescale the small-denominator fraction up to the common denominator.
    const scaled = nSmall * factor;
    const sumNum = scaled + nLarge;

    const answer = simplify(sumNum, dLarge);

    // Each distractor is the result of one specific error.
    const addedAcross = simplify(nSmall + nLarge, dSmall + dLarge);
    const notScaled = simplify(nSmall + nLarge, dLarge);
    const scaledBoth = simplify(scaled + nLarge * factor, dLarge * factor);

    const candidates = [
      { text: answer, isCorrect: true },
      { text: addedAcross, isCorrect: false, misconception: 'added-numerators-and-denominators' },
      { text: notScaled, isCorrect: false, misconception: 'common-denominator-numerator-not-scaled' },
      { text: scaledBoth, isCorrect: false, misconception: 'converted-only-second-fraction' },
    ];

    // Distinctness is an invariant the harness enforces; nudge collisions
    // deterministically rather than rejecting the seed.
    const seen = new Set<string>();
    for (const c of candidates) {
      let bump = 1;
      while (seen.has(c.text)) {
        c.text = simplify(sumNum + bump, dLarge);
        bump += 1;
      }
      seen.add(c.text);
    }

    return {
      prompt: `Add the fractions and write the sum in simplest form:`,
      promptDetails: `${nSmall}/${dSmall} + ${nLarge}/${dLarge}`,
      options: labelOptions(rng.shuffle(candidates)),
      answerText: answer,
      explanation: {
        stepByStep: [
          `Step 1: ${dLarge} is a multiple of ${dSmall}, so use ${dLarge} as the common denominator.`,
          `Step 2: Rescale ${nSmall}/${dSmall} by ${factor}/${factor} to get ${scaled}/${dLarge}.`,
          `Step 3: Add the numerators over the common denominator: ${scaled}/${dLarge} + ${nLarge}/${dLarge} = ${sumNum}/${dLarge}.`,
          `Step 4: In simplest form, the sum is ${answer}.`,
        ],
        conceptSummary:
          'Fractions can only be added once they name parts of the same size. Rescale to a common denominator, then add the numerators only.',
        commonMisconception:
          'Adding denominators as well as numerators produces a sum smaller than one of the addends — a fast sanity check.',
      },
    };
  },
};
```

- [ ] **Step 6: Run tests to verify they pass**

Run: `npm run test:run -- src/curriculum/grade5/templates/`
Expected: PASS, 4 tests (one of which is 300 property runs).

- [ ] **Step 7: Commit**

```bash
git add src/engine/template.ts src/engine/templateTesting.ts src/curriculum/grade5/templates/
git commit -m "$(cat <<'EOF'
feat: add the template interface and property-test harness

Unit tests are the wrong tool for generators: one correct at seeds 1-10
can still emit a broken question at seed 4912. Every template is checked
across 300 seeds for exactly one correct option, distinct option text, a
verified misconception tag on each distractor, and a final solution step
that actually states the answer.

The first generator (NC.5.NF.1) ships with it, including the related-
denominator constraint the standard requires.

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01H1td136Jg4sYcrRxZDFbg1
EOF
)"
```

---

### Task 7: The remaining Grade 5 generators

One generator per fluency standard, each written the same way as Task 6: failing property test first, then the implementation. Every one ends green under `assertTemplateSound`.

**Files:**
- Create: `src/curriculum/grade5/templates/<id>.ts` and a `.test.ts` beside each
- Create: `src/curriculum/grade5/templates/index.ts`
- Test: `src/curriculum/grade5/templates/index.test.ts`

**Interfaces:**
- Consumes: `QuestionTemplate`, `assertTemplateSound`, `labelOptions`, `Rng`.
- Produces: `export const GRADE_5_TEMPLATES: QuestionTemplate[]`.

Build these nine, in order. Each row gives the generator's parameters, the answer derivation, and its three distractors. **For each one: write the `.test.ts` first (the same four tests as Task 6, with the standard-specific constraint), watch it fail, implement, watch it pass, commit.**

- [ ] **Step 1: `g5.nbt1.powers-of-ten`** — NC.5.NBT.1, calculator off.
  Params: `base` = a 1–3 digit decimal, `exp` = `rng.int(1, 3)`, `dir` = multiply or divide.
  Answer: `base × 10^exp` or `base ÷ 10^exp`.
  Distractors: `place-value-shift-wrong-direction` (shift the other way); `decimal-point-misplaced` (shift `exp ± 1`); `compared-by-digit-count` (drop trailing zeros wrongly, e.g. `4.50` → `4.5` presented as a magnitude change).

- [ ] **Step 2: `g5.nbt3.compare-decimals`** — NC.5.NBT.3, calculator off.
  Params: two decimals to thousandths sharing a leading digit.
  Answer: the correct comparison symbol, presented as four statements.
  Distractors: `compared-by-digit-count`; `decimal-point-misplaced`; `place-value-shift-wrong-direction`.

- [ ] **Step 3: `g5.nbt5.multi-digit-multiply`** — NC.5.NBT.5, calculator off.
  Params: `a` = `rng.int(112, 989)`, `b` = `rng.int(12, 99)`.
  Answer: `a * b`.
  Distractors: `decimal-point-misplaced` (partial product shifted by 10); `order-of-operations-left-to-right` (omit the second partial product entirely: `a * (b % 10)`); `forgot-to-regroup` (sum partials without carrying, computed explicitly).

- [ ] **Step 4: `g5.nbt6.divide-two-digit`** — NC.5.NBT.6, calculator off.
  Params: `divisor` = `rng.int(12, 45)`, `quotient` = `rng.int(11, 99)`, `remainder` = `rng.int(0, divisor - 1)`; `dividend = divisor * quotient + remainder`.
  Answer: quotient with remainder stated.
  Distractors: `ignored-remainder`; `multiplied-instead-of-divided`; `decimal-point-misplaced` (quotient off by a factor of 10).

- [ ] **Step 5: `g5.nbt7.decimal-arithmetic`** — NC.5.NBT.7, calculator off.
  Params: two decimals to hundredths, `op` = add or subtract.
  Answer: exact result, computed in integer cents to avoid floating-point drift — **divide by 100 only at formatting time.**
  Distractors: `decimal-point-misplaced`; `place-value-shift-wrong-direction` (aligned right instead of on the decimal point); `forgot-to-regroup`.

- [ ] **Step 6: `g5.nf4.multiply-fractions`** — NC.5.NF.4, calculator off.
  Params: two proper fractions with denominators from `[2,3,4,5,6,8]`.
  Answer: `simplify(n1*n2, d1*d2)`.
  Distractors: `added-numerators-and-denominators`; `common-denominator-numerator-not-scaled` (cross-multiplied); `inverted-wrong-factor` (multiplied by the reciprocal).

- [ ] **Step 7: `g5.nf7.divide-unit-fractions`** — NC.5.NF.7, calculator off.
  Params: `whole` = `rng.int(2, 8)`, `unit` = `1/rng.pick([2,3,4,5,6,8])`, `dir` = whole÷unit or unit÷whole.
  Answer: `whole * d` or `simplify(1, d * whole)`.
  Distractors: `inverted-wrong-factor`; `multiplied-instead-of-divided`; `added-numerators-and-denominators`.

- [ ] **Step 8: `g5.md1.unit-conversion`** — NC.5.MD.1, calculator on.
  Params: a `(from, to, factor)` triple drawn from a fixed table of customary and metric pairs, plus a quantity.
  Answer: `qty * factor` or `qty / factor` by direction.
  Distractors: `unit-conversion-inverted`; `place-value-shift-wrong-direction`; `decimal-point-misplaced`.

- [ ] **Step 9: `g5.md5.prism-volume`** — NC.5.MD.5, calculator on.
  Params: `l`, `w`, `h` each `rng.int(2, 12)`.
  Answer: `l * w * h`.
  Distractors: `used-area-not-volume` (`l * w`); `used-perimeter-formula` (`2*(l+w+h)`); `multiplied-instead-of-divided` (`l * w * h / h`, stated as a plausible slip).

- [ ] **Step 10: Write the barrel and its coverage test**

Create `src/curriculum/grade5/templates/index.ts` exporting `GRADE_5_TEMPLATES` as an array of all ten templates (Task 6's plus these nine).

Create `src/curriculum/grade5/templates/index.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { GRADE_5_TEMPLATES } from './index';
import { GRADE_5 } from '../index';
import { assertTemplateSound } from '../../../engine/templateTesting';

const codes = new Set(GRADE_5.domains.flatMap((d) => d.standards.map((s) => s.code)));

describe('GRADE_5_TEMPLATES', () => {
  it('has unique template ids', () => {
    const ids = GRADE_5_TEMPLATES.map((t) => t.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('references only real grade 5 standards', () => {
    for (const t of GRADE_5_TEMPLATES) {
      expect(codes.has(t.standardCode), `${t.id} -> ${t.standardCode}`).toBe(true);
    }
  });

  it.each(GRADE_5_TEMPLATES.map((t) => [t.id, t] as const))(
    '%s satisfies every template invariant',
    (_id, t) => assertTemplateSound(t, { runs: 200 }),
  );
});
```

- [ ] **Step 11: Run the full suite and build**

Run: `npm run test:run && npm run build`
Expected: all PASS.

- [ ] **Step 12: Commit**

```bash
git add src/curriculum/grade5/templates/
git commit -m "$(cat <<'EOF'
feat: add generators for the grade 5 fluency standards

Nine parameterized templates covering NBT.1/3/5/6/7, NF.4, NF.7, MD.1
and MD.5, each verified across 200+ seeds. Decimal arithmetic is
computed in integer cents and divided only at formatting time, so
floating-point drift cannot produce a wrong "correct" answer.

Reasoning and multi-step word problems stay hand-authored, where the
wording carries the mathematics.

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01H1td136Jg4sYcrRxZDFbg1
EOF
)"
```

---

### Task 8: Question source and the curriculum integrity test

**Files:**
- Create: `src/engine/questionSource.ts`
- Test: `src/engine/questionSource.test.ts`
- Create: `src/curriculum/integrity.test.ts`
- Modify: `src/curriculum/grade5/index.ts` (attach sources)

**Interfaces:**
- Consumes: `GRADE_5_AUTHORED` (Task 5), `GRADE_5_TEMPLATES` (Task 7), `realize` (Task 6).
- Produces:
  ```ts
  export interface QuestionSource {
    itemsFor(standardCode: StandardCode, opts: { count: number; seedBase: number }): QuestionRef[];
    resolve(ref: QuestionRef): Question;
    allStandardsWithContent(): StandardCode[];
  }
  export function makeQuestionSource(
    authored: Question[], templates: QuestionTemplate[],
  ): QuestionSource;
  ```
  `GradeCurriculum` gains `source: QuestionSource`.

- [ ] **Step 1: Write the failing test**

Create `src/engine/questionSource.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { makeQuestionSource } from './questionSource';
import { GRADE_5_AUTHORED } from '../curriculum/grade5/authored';
import { GRADE_5_TEMPLATES } from '../curriculum/grade5/templates';

const src = makeQuestionSource(GRADE_5_AUTHORED, GRADE_5_TEMPLATES);

describe('makeQuestionSource', () => {
  it('returns the requested number of refs', () => {
    expect(src.itemsFor('NC.5.NF.1', { count: 5, seedBase: 1 })).toHaveLength(5);
  });

  it('returns an empty list for a standard with no content', () => {
    expect(src.itemsFor('NC.9.ZZ.9', { count: 3, seedBase: 1 })).toEqual([]);
  });

  it('never repeats an authored item within one request', () => {
    const refs = src.itemsFor('NC.5.NF.1', { count: 4, seedBase: 7 });
    const authored = refs.filter((r) => r.kind === 'authored').map((r) => (r as {id: string}).id);
    expect(new Set(authored).size).toBe(authored.length);
  });

  it('gives distinct seeds to repeated uses of one template', () => {
    const refs = src.itemsFor('NC.5.NBT.5', { count: 6, seedBase: 100 });
    const gen = refs.filter((r) => r.kind === 'generated') as
      { kind: 'generated'; templateId: string; seed: number }[];
    const keys = gen.map((r) => `${r.templateId}:${r.seed}`);
    expect(new Set(keys).size).toBe(keys.length);
  });

  it('is reproducible for the same seedBase', () => {
    const a = src.itemsFor('NC.5.NF.1', { count: 5, seedBase: 55 });
    const b = src.itemsFor('NC.5.NF.1', { count: 5, seedBase: 55 });
    expect(a).toEqual(b);
  });

  it('resolves a generated ref to the same question every time', () => {
    const ref = { kind: 'generated' as const, templateId: 'g5.nf1.add-unlike', seed: 4912 };
    expect(src.resolve(ref)).toEqual(src.resolve(ref));
  });

  it('resolves an authored ref to its item', () => {
    const q = src.resolve({ kind: 'authored', id: GRADE_5_AUTHORED[0].id });
    expect(q.id).toBe(GRADE_5_AUTHORED[0].id);
  });

  it('throws on an unknown ref rather than returning a blank question', () => {
    expect(() => src.resolve({ kind: 'authored', id: 'nope' })).toThrow(/unknown/i);
    expect(() => src.resolve({ kind: 'generated', templateId: 'nope', seed: 1 }))
      .toThrow(/unknown/i);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test:run -- src/engine/questionSource.test.ts`
Expected: FAIL — cannot resolve `./questionSource`.

- [ ] **Step 3: Write the implementation**

Create `src/engine/questionSource.ts`:

```ts
import type { StandardCode } from '../curriculum/types';
import type { Question, QuestionRef } from './questionModel';
import type { QuestionTemplate } from './template';
import { realize } from './template';
import { makeRng } from './rng';

export interface QuestionSource {
  itemsFor(standardCode: StandardCode, opts: { count: number; seedBase: number }): QuestionRef[];
  resolve(ref: QuestionRef): Question;
  allStandardsWithContent(): StandardCode[];
}

export function makeQuestionSource(
  authored: Question[],
  templates: QuestionTemplate[],
): QuestionSource {
  const authoredById = new Map(authored.map((q) => [q.id, q]));
  const templateById = new Map(templates.map((t) => [t.id, t]));

  const authoredByStandard = new Map<StandardCode, Question[]>();
  for (const q of authored) {
    const list = authoredByStandard.get(q.standardCode) ?? [];
    list.push(q);
    authoredByStandard.set(q.standardCode, list);
  }

  const templatesByStandard = new Map<StandardCode, QuestionTemplate[]>();
  for (const t of templates) {
    const list = templatesByStandard.get(t.standardCode) ?? [];
    list.push(t);
    templatesByStandard.set(t.standardCode, list);
  }

  return {
    itemsFor(standardCode, { count, seedBase }) {
      const rng = makeRng(seedBase);
      const pool = authoredByStandard.get(standardCode) ?? [];
      const temps = templatesByStandard.get(standardCode) ?? [];
      if (pool.length === 0 && temps.length === 0) return [];

      const refs: QuestionRef[] = [];
      const shuffledAuthored = rng.shuffle(pool);
      let authoredTaken = 0;

      for (let i = 0; i < count; i++) {
        // Prefer an unused authored item; fall back to a template, which
        // can supply unlimited fresh instances.
        const useAuthored =
          authoredTaken < shuffledAuthored.length && (temps.length === 0 || rng.next() < 0.4);

        if (useAuthored) {
          refs.push({ kind: 'authored', id: shuffledAuthored[authoredTaken++].id });
        } else if (temps.length > 0) {
          const t = rng.pick(temps);
          refs.push({ kind: 'generated', templateId: t.id, seed: rng.int(0, 2 ** 31 - 1) });
        } else {
          break; // authored pool exhausted and no templates exist
        }
      }
      return refs;
    },

    resolve(ref) {
      if (ref.kind === 'authored') {
        const q = authoredById.get(ref.id);
        if (!q) throw new Error(`Unknown authored question id: ${ref.id}`);
        return q;
      }
      const t = templateById.get(ref.templateId);
      if (!t) throw new Error(`Unknown template id: ${ref.templateId}`);
      return realize(t, ref.seed, makeRng(ref.seed));
    },

    allStandardsWithContent() {
      return [...new Set([...authoredByStandard.keys(), ...templatesByStandard.keys()])];
    },
  };
}
```

Attach it in `src/curriculum/grade5/index.ts`:

```ts
import { makeQuestionSource } from '../../engine/questionSource';
import { GRADE_5_AUTHORED } from './authored';
import { GRADE_5_TEMPLATES } from './templates';

// ...inside GRADE_5:
  source: makeQuestionSource(GRADE_5_AUTHORED, GRADE_5_TEMPLATES),
```

and add `source: QuestionSource;` to `GradeCurriculum` in `src/curriculum/types.ts`.

Adding a required field to `GradeCurriculum` breaks the hand-built `evenCurriculum`
fixture in `src/curriculum/registry.test.ts` from Task 2. Add a source to it:

```ts
import { makeQuestionSource } from '../engine/questionSource';
// ...inside evenCurriculum:
  source: makeQuestionSource([], []),
```

An empty source is correct there: that fixture exists to test weighting arithmetic, not
content.

- [ ] **Step 4: Write the curriculum integrity test**

Create `src/curriculum/integrity.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { listCurricula, standardsOf } from './registry';

describe.each(listCurricula().map((c) => [c.grade, c] as const))(
  'grade %i curriculum integrity',
  (_grade, c) => {
    const codes = new Set(standardsOf(c).map((s) => s.code));

    it('has no duplicate standard codes', () => {
      expect(codes.size).toBe(standardsOf(c).length);
    });

    it('declares every standard under the domain that owns it', () => {
      for (const d of c.domains) {
        for (const s of d.standards) expect(s.domainId).toBe(d.id);
      }
    });

    it('has no content referencing a standard outside this grade', () => {
      for (const code of c.source.allStandardsWithContent()) {
        expect(codes.has(code), `content references unknown standard ${code}`).toBe(true);
      }
    });

    it('covers every standard when the grade is marked content-complete', () => {
      // Gated deliberately: asserting coverage unconditionally would leave
      // the suite red from the moment a grade's standards exist until its
      // last template is written, and a permanently red suite gets ignored.
      if (!c.contentComplete) return;
      const withContent = new Set(c.source.allStandardsWithContent());
      for (const code of codes) {
        expect(withContent.has(code), `grade ${c.grade} has no content for ${code}`).toBe(true);
      }
    });
  },
);
```

- [ ] **Step 5: Run the full suite and build**

Run: `npm run test:run && npm run build`
Expected: all PASS.

- [ ] **Step 6: Commit**

```bash
git add src/engine/questionSource.ts src/engine/questionSource.test.ts src/curriculum/
git commit -m "$(cat <<'EOF'
feat: unify authored and generated questions behind one source

The quiz engine asks for N items on a standard and never learns which
source answered. Resolution is pure, so a {templateId, seed} pair is a
complete record: attempt history stays small and any past question can
be reproduced exactly for the parent report.

The integrity test gates coverage on contentComplete so grades in
progress do not hold the suite red.

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01H1td136Jg4sYcrRxZDFbg1
EOF
)"
```

---

### Task 9: Mastery computation

**Files:**
- Create: `src/engine/mastery.ts`
- Modify: `src/types/index.ts` (extend `QuizAttemptAnswer`)
- Test: `src/engine/mastery.test.ts`

**Interfaces:**
- Consumes: `GradeCurriculum`, `domainWeight` (Task 2); `QuizAttempt` from `src/types/index.ts`.

- [ ] **Step 0: Extend `QuizAttemptAnswer` before writing the test**

Mastery tallies key off the standard a question belongs to and the misconception the
student picked, neither of which the recorded answer currently carries. In
`src/types/index.ts`, add both fields to `QuizAttemptAnswer`:

```ts
export interface QuizAttemptAnswer {
  questionId: string;
  studentAnswer: string;
  isCorrect: boolean;
  standardCode: string;          // which standard this item assessed
  misconception?: string;        // tag of the distractor chosen, when wrong
  timeSpentSeconds?: number;
  flaggedForReview?: boolean;
}
```

Existing code that constructs a `QuizAttemptAnswer` will fail typecheck until it supplies
`standardCode`; fix each site by reading it from the question being answered.
- Produces:
  ```ts
  export type MasteryStatus = 'acceleration-ready' | 'approaching' | 'needs-focus' | 'untested';
  export interface StandardMastery {
    standardCode: StandardCode; total: number; correct: number;
    percent: number; status: MasteryStatus; lastTestedAt?: string;
    misconceptions: Record<string, number>;
  }
  export function masteryByStandard(attempts: QuizAttempt[], c: GradeCurriculum): Map<StandardCode, StandardMastery>;
  export function masteryStatus(percent: number, total: number, passing: number): MasteryStatus;
  export function overallReadiness(m: Map<StandardCode, StandardMastery>, c: GradeCurriculum): number;
  export function topMisconceptions(m: Map<StandardCode, StandardMastery>, limit: number): {tag: string; count: number}[];
  ```

- [ ] **Step 1: Write the failing test**

Create `src/engine/mastery.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { masteryStatus, overallReadiness, masteryByStandard, topMisconceptions } from './mastery';
import { getCurriculum } from '../curriculum/registry';
import type { QuizAttempt } from '../types';

const c = getCurriculum(5);

describe('masteryStatus', () => {
  it('is untested with no attempts', () => {
    expect(masteryStatus(0, 0, 80)).toBe('untested');
  });

  it('is acceleration-ready at or above the passing mark', () => {
    expect(masteryStatus(80, 10, 80)).toBe('acceleration-ready');
    expect(masteryStatus(95, 10, 80)).toBe('acceleration-ready');
  });

  it('is approaching between 60 and the passing mark', () => {
    expect(masteryStatus(70, 10, 80)).toBe('approaching');
  });

  it('is needs-focus below 60', () => {
    expect(masteryStatus(45, 10, 80)).toBe('needs-focus');
  });

  it('does not award acceleration-ready on a single lucky answer', () => {
    // 1 for 1 is 100% but says nothing; require a minimum sample.
    expect(masteryStatus(100, 1, 80)).toBe('approaching');
  });
});

describe('overallReadiness', () => {
  it('is 0 when nothing has been attempted', () => {
    expect(overallReadiness(masteryByStandard([], c), c)).toBe(0);
  });

  it('weights fractions above geometry, per the NCDPI blueprint', () => {
    const perfectIn = (code: string): QuizAttempt[] => ([{
      id: 'a', quizId: 'q', quizTitle: 't', completedAt: '2026-01-01T00:00:00Z',
      scoreRaw: 8, scoreTotal: 8, scorePercent: 100, isPassingSSA: true, timeElapsedSeconds: 60,
      answers: Object.fromEntries(Array.from({ length: 8 }, (_, i) => [
        `${code}-${i}`,
        { questionId: `${code}-${i}`, standardCode: code, isCorrect: true, studentAnswer: 'A' },
      ])),
    } as unknown as QuizAttempt]);

    const nf = overallReadiness(masteryByStandard(perfectIn('NC.5.NF.1'), c), c);
    const g  = overallReadiness(masteryByStandard(perfectIn('NC.5.G.1'), c), c);
    expect(nf).toBeGreaterThan(g);
  });
});

describe('topMisconceptions', () => {
  it('ranks the most frequently chosen errors first', () => {
    const m = new Map([
      ['NC.5.NF.1', { standardCode: 'NC.5.NF.1', total: 6, correct: 2, percent: 33,
        status: 'needs-focus' as const,
        misconceptions: { 'added-numerators-and-denominators': 3, 'forgot-to-regroup': 1 } }],
      ['NC.5.NF.4', { standardCode: 'NC.5.NF.4', total: 4, correct: 3, percent: 75,
        status: 'approaching' as const,
        misconceptions: { 'added-numerators-and-denominators': 1 } }],
    ]);
    expect(topMisconceptions(m, 2)).toEqual([
      { tag: 'added-numerators-and-denominators', count: 4 },
      { tag: 'forgot-to-regroup', count: 1 },
    ]);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test:run -- src/engine/mastery.test.ts`
Expected: FAIL — cannot resolve `./mastery`.

- [ ] **Step 3: Write the implementation**

Create `src/engine/mastery.ts`:

```ts
import type { StandardCode, GradeCurriculum } from '../curriculum/types';
import { domainWeight, standardsOf } from '../curriculum/registry';
import type { QuizAttempt } from '../types';

export type MasteryStatus = 'acceleration-ready' | 'approaching' | 'needs-focus' | 'untested';

/** Below this many attempts, a perfect score is noise rather than mastery. */
const MIN_SAMPLE_FOR_MASTERY = 4;

export interface StandardMastery {
  standardCode: StandardCode;
  total: number;
  correct: number;
  percent: number;
  status: MasteryStatus;
  lastTestedAt?: string;
  misconceptions: Record<string, number>;
}

export function masteryStatus(percent: number, total: number, passing: number): MasteryStatus {
  if (total === 0) return 'untested';
  if (percent >= passing && total >= MIN_SAMPLE_FOR_MASTERY) return 'acceleration-ready';
  if (percent >= 60) return 'approaching';
  return 'needs-focus';
}

export function masteryByStandard(
  attempts: QuizAttempt[],
  c: GradeCurriculum,
): Map<StandardCode, StandardMastery> {
  const out = new Map<StandardCode, StandardMastery>();
  for (const s of standardsOf(c)) {
    out.set(s.code, {
      standardCode: s.code, total: 0, correct: 0, percent: 0,
      status: 'untested', misconceptions: {},
    });
  }

  for (const attempt of attempts) {
    for (const ans of Object.values(attempt.answers)) {
      const code = (ans as { standardCode?: StandardCode }).standardCode;
      if (!code) continue;
      const m = out.get(code);
      if (!m) continue;               // content from another grade; ignore
      m.total += 1;
      if (ans.isCorrect) m.correct += 1;
      const tag = (ans as { misconception?: string }).misconception;
      if (!ans.isCorrect && tag) m.misconceptions[tag] = (m.misconceptions[tag] ?? 0) + 1;
      if (!m.lastTestedAt || attempt.completedAt > m.lastTestedAt) {
        m.lastTestedAt = attempt.completedAt;
      }
    }
  }

  for (const m of out.values()) {
    m.percent = m.total === 0 ? 0 : (m.correct / m.total) * 100;
    m.status = masteryStatus(m.percent, m.total, c.ssa.passingPercent);
  }
  return out;
}

/** Blueprint-weighted composite, 0-100. Untested standards count as 0:
 *  readiness means readiness for the whole assessment. */
export function overallReadiness(
  mastery: Map<StandardCode, StandardMastery>,
  c: GradeCurriculum,
): number {
  let total = 0;
  for (const d of c.domains) {
    const weight = domainWeight(c, d.id);
    if (d.standards.length === 0) continue;
    const domainPercent =
      d.standards.reduce((sum, s) => sum + (mastery.get(s.code)?.percent ?? 0), 0) /
      d.standards.length;
    total += (weight / 100) * domainPercent;
  }
  return Math.round(total * 10) / 10;
}

export function topMisconceptions(
  mastery: Map<StandardCode, StandardMastery>,
  limit: number,
): { tag: string; count: number }[] {
  const tally = new Map<string, number>();
  for (const m of mastery.values()) {
    for (const [tag, n] of Object.entries(m.misconceptions)) {
      tally.set(tag, (tally.get(tag) ?? 0) + n);
    }
  }
  return [...tally.entries()]
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag))
    .slice(0, limit);
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm run test:run -- src/engine/mastery.test.ts`
Expected: PASS, 9 tests.

- [ ] **Step 5: Commit**

```bash
git add src/engine/mastery.ts src/engine/mastery.test.ts
git commit -m "$(cat <<'EOF'
feat: add blueprint-weighted mastery with misconception tallies

Mastery requires a minimum sample, so one lucky answer cannot mark a
standard acceleration-ready. Readiness counts untested standards as
zero, because readiness means readiness for the whole assessment rather
than for the parts already practiced.

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01H1td136Jg4sYcrRxZDFbg1
EOF
)"
```

---

### Task 10: The Leitner review scheduler

**Files:**
- Create: `src/engine/scheduler.ts`
- Test: `src/engine/scheduler.test.ts`

**Interfaces:**
- Consumes: `ReviewKey`, `reviewKeyOf`, `reviewKeyId` (Task 4).
- Produces:
  ```ts
  export const BOX_INTERVALS_DAYS = [1, 3, 7, 16, 35] as const;
  export interface ReviewEntry { key: ReviewKey; box: number; dueAt: string; lastSeenAt: string; }
  export type ReviewQueue = Record<string, ReviewEntry>;   // keyed by reviewKeyId
  export function recordResult(q: ReviewQueue, ref: QuestionRef, wasCorrect: boolean, now: Date): ReviewQueue;
  export function dueEntries(q: ReviewQueue, now: Date): ReviewEntry[];
  ```

- [ ] **Step 1: Write the failing test**

Create `src/engine/scheduler.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { recordResult, dueEntries, BOX_INTERVALS_DAYS } from './scheduler';
import type { ReviewQueue } from './scheduler';

const T0 = new Date('2026-01-01T12:00:00Z');
const days = (n: number) => new Date(T0.getTime() + n * 86400000);
const ref = { kind: 'generated' as const, templateId: 'g5.nf1.add-unlike', seed: 11 };

describe('recordResult', () => {
  it('puts a missed item in box 1, due in one day', () => {
    const q = recordResult({}, ref, false, T0);
    const e = Object.values(q)[0];
    expect(e.box).toBe(1);
    expect(new Date(e.dueAt).toISOString()).toBe(days(1).toISOString());
  });

  it('does not enqueue an item answered correctly the first time', () => {
    expect(recordResult({}, ref, true, T0)).toEqual({});
  });

  it('promotes a correct review through the intervals', () => {
    let q: ReviewQueue = recordResult({}, ref, false, T0);
    for (let box = 1; box < BOX_INTERVALS_DAYS.length; box++) {
      q = recordResult(q, ref, true, days(0));
      expect(Object.values(q)[0].box).toBe(box + 1);
    }
  });

  it('retires an item promoted past the last box', () => {
    let q: ReviewQueue = recordResult({}, ref, false, T0);
    for (let i = 0; i < BOX_INTERVALS_DAYS.length; i++) q = recordResult(q, ref, true, T0);
    expect(q).toEqual({});
  });

  it('demotes a missed item back to box 1 from any box', () => {
    let q: ReviewQueue = recordResult({}, ref, false, T0);
    q = recordResult(q, ref, true, T0);
    q = recordResult(q, ref, true, T0);
    expect(Object.values(q)[0].box).toBe(3);
    q = recordResult(q, ref, false, T0);
    expect(Object.values(q)[0].box).toBe(1);
  });

  it('matches a different seed of the same template', () => {
    // The whole point of the seedless ReviewKey: review serves a fresh
    // instance, which must land on the same queue entry.
    let q = recordResult({}, { ...ref, seed: 1 }, false, T0);
    q = recordResult(q, { ...ref, seed: 99999 }, true, T0);
    expect(Object.keys(q)).toHaveLength(1);
    expect(Object.values(q)[0].box).toBe(2);
  });

  it('keeps authored items separate from templates with the same name', () => {
    let q = recordResult({}, { kind: 'authored', id: 'dup' }, false, T0);
    q = recordResult(q, { kind: 'generated', templateId: 'dup', seed: 1 }, false, T0);
    expect(Object.keys(q)).toHaveLength(2);
  });
});

describe('dueEntries', () => {
  it('returns nothing before the due date', () => {
    const q = recordResult({}, ref, false, T0);
    expect(dueEntries(q, days(0.5))).toEqual([]);
  });

  it('returns the entry once due', () => {
    const q = recordResult({}, ref, false, T0);
    expect(dueEntries(q, days(1))).toHaveLength(1);
    expect(dueEntries(q, days(9))).toHaveLength(1);
  });

  it('orders the most overdue first', () => {
    let q = recordResult({}, { kind: 'authored', id: 'old' }, false, T0);
    q = recordResult(q, { kind: 'authored', id: 'new' }, false, days(3));
    const due = dueEntries(q, days(10));
    expect(due.map((e) => (e.key as { id: string }).id)).toEqual(['old', 'new']);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test:run -- src/engine/scheduler.test.ts`
Expected: FAIL — cannot resolve `./scheduler`.

- [ ] **Step 3: Write the implementation**

Create `src/engine/scheduler.ts`:

```ts
import type { QuestionRef, ReviewKey } from './questionModel';
import { reviewKeyOf, reviewKeyId } from './questionModel';

/** Expanding intervals. A miss returns an item to box 1 regardless of
 *  how far it had been promoted. */
export const BOX_INTERVALS_DAYS = [1, 3, 7, 16, 35] as const;

export interface ReviewEntry {
  key: ReviewKey;
  box: number;        // 1-based
  dueAt: string;      // ISO
  lastSeenAt: string; // ISO
}

export type ReviewQueue = Record<string, ReviewEntry>;

const addDays = (d: Date, n: number) => new Date(d.getTime() + n * 86400000);

export function recordResult(
  queue: ReviewQueue,
  ref: QuestionRef,
  wasCorrect: boolean,
  now: Date,
): ReviewQueue {
  const key = reviewKeyOf(ref);
  const id = reviewKeyId(key);
  const existing = queue[id];
  const next = { ...queue };

  if (!existing) {
    if (wasCorrect) return queue;      // nothing to remember about a hit
    next[id] = {
      key, box: 1,
      dueAt: addDays(now, BOX_INTERVALS_DAYS[0]).toISOString(),
      lastSeenAt: now.toISOString(),
    };
    return next;
  }

  if (!wasCorrect) {
    next[id] = {
      ...existing, box: 1,
      dueAt: addDays(now, BOX_INTERVALS_DAYS[0]).toISOString(),
      lastSeenAt: now.toISOString(),
    };
    return next;
  }

  const promoted = existing.box + 1;
  if (promoted > BOX_INTERVALS_DAYS.length) {
    delete next[id];                    // mastered; stop scheduling it
    return next;
  }
  next[id] = {
    ...existing, box: promoted,
    dueAt: addDays(now, BOX_INTERVALS_DAYS[promoted - 1]).toISOString(),
    lastSeenAt: now.toISOString(),
  };
  return next;
}

export function dueEntries(queue: ReviewQueue, now: Date): ReviewEntry[] {
  return Object.values(queue)
    .filter((e) => new Date(e.dueAt) <= now)
    .sort((a, b) => a.dueAt.localeCompare(b.dueAt));
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm run test:run -- src/engine/scheduler.test.ts`
Expected: PASS, 10 tests.

- [ ] **Step 5: Commit**

```bash
git add src/engine/scheduler.ts src/engine/scheduler.test.ts
git commit -m "$(cat <<'EOF'
feat: add the Leitner review scheduler

Missed items resurface on expanding intervals until mastered, then stop
being scheduled. Entries are keyed seedlessly, so review can serve a
fresh instance of a template rather than the identical numbers, which
would teach the answer instead of the method.

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01H1td136Jg4sYcrRxZDFbg1
EOF
)"
```

---

### Task 11: The session composer

**Files:**
- Create: `src/engine/sessionComposer.ts`
- Test: `src/engine/sessionComposer.test.ts`

**Interfaces:**
- Consumes: mastery (Task 9), scheduler (Task 10), question source (Task 8), `domainWeight` (Task 2).
- Produces:
  ```ts
  export const MAX_REVIEW_FRACTION = 0.4;
  export function selectSession(input: {
    curriculum: GradeCurriculum;
    mastery: Map<StandardCode, StandardMastery>;
    queue: ReviewQueue;
    size: number;
    now: Date;
    seed: number;
  }): QuestionRef[];
  ```

- [ ] **Step 1: Write the failing test**

Create `src/engine/sessionComposer.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { selectSession, MAX_REVIEW_FRACTION } from './sessionComposer';
import { getCurriculum } from '../curriculum/registry';
import { masteryByStandard } from './mastery';
import { recordResult } from './scheduler';
import type { ReviewQueue } from './scheduler';
import { reviewKeyId } from './questionModel';

const c = getCurriculum(5);
const NOW = new Date('2026-03-01T09:00:00Z');
const empty = masteryByStandard([], c);

describe('selectSession', () => {
  it('returns exactly the requested number of items', () => {
    expect(selectSession({ curriculum: c, mastery: empty, queue: {}, size: 12, now: NOW, seed: 1 }))
      .toHaveLength(12);
  });

  it('is reproducible for the same seed', () => {
    const args = { curriculum: c, mastery: empty, queue: {}, size: 10, now: NOW, seed: 42 };
    expect(selectSession(args)).toEqual(selectSession(args));
  });

  it('varies with the seed', () => {
    const base = { curriculum: c, mastery: empty, queue: {}, size: 10, now: NOW };
    expect(selectSession({ ...base, seed: 1 })).not.toEqual(selectSession({ ...base, seed: 2 }));
  });

  it('caps reviews so a bad week is not all remediation', () => {
    let queue: ReviewQueue = {};
    for (let i = 0; i < 40; i++) {
      queue = recordResult(queue, { kind: 'authored', id: `nf1-0${i % 4 + 1}` }, false,
        new Date('2026-02-01T09:00:00Z'));
    }
    const size = 10;
    const refs = selectSession({ curriculum: c, mastery: empty, queue, size, now: NOW, seed: 5 });
    const queued = new Set(Object.values(queue).map((e) => reviewKeyId(e.key)));
    const reviewCount = refs.filter((r) =>
      queued.has(r.kind === 'authored' ? `a:${r.id}` : `g:${r.templateId}`)).length;
    expect(reviewCount).toBeLessThanOrEqual(Math.ceil(size * MAX_REVIEW_FRACTION));
  });

  it('does not schedule reviews that are not yet due', () => {
    const queue = recordResult({}, { kind: 'authored', id: 'nf1-01' }, false, NOW);
    const refs = selectSession({
      curriculum: c, mastery: empty, queue, size: 8,
      now: new Date(NOW.getTime() + 3600_000), seed: 3,
    });
    // Due tomorrow; an hour later it must not appear as a review.
    expect(refs.length).toBe(8);
  });

  it('favors the weakest standards', () => {
    const attempts = [{
      id: 'a', quizId: 'q', quizTitle: 't', completedAt: '2026-02-01T00:00:00Z',
      scoreRaw: 0, scoreTotal: 8, scorePercent: 0, isPassingSSA: false, timeElapsedSeconds: 60,
      answers: Object.fromEntries(Array.from({ length: 8 }, (_, i) => [
        `k${i}`, { questionId: `k${i}`, standardCode: 'NC.5.NBT.5', isCorrect: false, studentAnswer: 'A' },
      ])),
    }];
    const m = masteryByStandard(attempts as never, c);
    const src = c.source;
    const refs = selectSession({ curriculum: c, mastery: m, queue: {}, size: 20, now: NOW, seed: 9 });
    const codes = refs.map((r) => src.resolve(r).standardCode);
    expect(codes.filter((x) => x === 'NC.5.NBT.5').length).toBeGreaterThan(1);
  });

  it('never returns a ref the source cannot resolve', () => {
    const refs = selectSession({ curriculum: c, mastery: empty, queue: {}, size: 30, now: NOW, seed: 4 });
    for (const r of refs) expect(() => c.source.resolve(r)).not.toThrow();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test:run -- src/engine/sessionComposer.test.ts`
Expected: FAIL — cannot resolve `./sessionComposer`.

- [ ] **Step 3: Write the implementation**

Create `src/engine/sessionComposer.ts`:

```ts
import type { GradeCurriculum, StandardCode } from '../curriculum/types';
import { domainWeight, standardsOf } from '../curriculum/registry';
import type { QuestionRef } from './questionModel';
import type { StandardMastery } from './mastery';
import type { ReviewQueue } from './scheduler';
import { dueEntries } from './scheduler';
import { makeRng } from './rng';

/** A bad week should not turn every session into remediation. */
export const MAX_REVIEW_FRACTION = 0.4;

export function selectSession(input: {
  curriculum: GradeCurriculum;
  mastery: Map<StandardCode, StandardMastery>;
  queue: ReviewQueue;
  size: number;
  now: Date;
  seed: number;
}): QuestionRef[] {
  const { curriculum: c, mastery, queue, size, now, seed } = input;
  const rng = makeRng(seed);
  const refs: QuestionRef[] = [];

  // 1. Due reviews, most overdue first, capped.
  const reviewCap = Math.ceil(size * MAX_REVIEW_FRACTION);
  for (const entry of dueEntries(queue, now).slice(0, reviewCap)) {
    refs.push(
      entry.key.kind === 'authored'
        ? { kind: 'authored', id: entry.key.id }
        : { kind: 'generated', templateId: entry.key.templateId, seed: rng.int(0, 2 ** 31 - 1) },
    );
  }

  // 2-4. Fill the rest by priority score across standards that have content.
  const withContent = new Set(c.source.allStandardsWithContent());
  const scored = standardsOf(c)
    .filter((s) => withContent.has(s.code))
    .map((s) => {
      const m = mastery.get(s.code);
      const weight = domainWeight(c, s.domainId);
      // Untested sits between "weak" and "solid": worth covering, but a
      // standard he is actively failing matters more.
      const gap = m && m.total > 0 ? (100 - m.percent) : 70;
      return { code: s.code, score: gap * (weight / 100) + rng.next() * 5 };
    })
    .sort((a, b) => b.score - a.score);

  let i = 0;
  while (refs.length < size && scored.length > 0) {
    const s = scored[i % scored.length];
    const [ref] = c.source.itemsFor(s.code, { count: 1, seedBase: rng.int(0, 2 ** 31 - 1) });
    if (ref) refs.push(ref);
    i += 1;
    if (i > size * 10) break;   // every standard exhausted; stop rather than spin
  }

  return refs.slice(0, size);
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm run test:run -- src/engine/sessionComposer.test.ts`
Expected: PASS, 7 tests.

- [ ] **Step 5: Commit**

```bash
git add src/engine/sessionComposer.ts src/engine/sessionComposer.test.ts
git commit -m "$(cat <<'EOF'
feat: compose adaptive sessions from weakness and review debt

Due reviews come first but are capped at 40% of a session, so a bad week
does not turn every sitting into remediation. The remainder is scored by
mastery gap times blueprint weight, which is why fractions outrank
geometry when both are weak.

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01H1td136Jg4sYcrRxZDFbg1
EOF
)"
```

---

### Task 12: State v2, profiles, and migration

**Files:**
- Create: `src/state/types.ts`
- Create: `src/state/migrate.ts`
- Create: `src/state/storage.ts`
- Test: `src/state/migrate.test.ts`
- Create: `src/state/__fixtures__/v1-real.json`

**Interfaces:**
- Consumes: `ReviewQueue` (Task 10), `Grade` (Task 2), `QuizAttempt` (existing).
- Produces:
  ```ts
  export const STORAGE_KEY_V1 = 'nc_math_ssa_prep_state_v1';
  export const STORAGE_KEY_V2 = 'nc_math_ssa_prep_state_v2';
  export interface Profile {
    id: string; studentName: string; grade: Grade;
    targetExamDate: string; dailyQuestionGoal: number;
    attempts: QuizAttempt[]; reviewQueue: ReviewQueue;
  }
  export interface AppStateV2 { version: 2; profiles: Profile[]; activeProfileId: string; }
  export function migrate(raw: unknown): AppStateV2;
  export function initialState(): AppStateV2;
  export function loadState(storage: Storage): AppStateV2;
  export function saveState(storage: Storage, state: AppStateV2): void;
  ```

- [ ] **Step 1: Capture a real v1 payload as the fixture**

In a browser with the current app open, run `copy(localStorage.getItem('nc_math_ssa_prep_state_v1'))` and save the result to `src/state/__fixtures__/v1-real.json`. If no real payload is available, construct one containing at least two attempts and three missed question ids, matching the `AppState` interface in `src/types/index.ts`.

- [ ] **Step 2: Write the failing test**

Create `src/state/migrate.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { migrate, initialState, loadState, STORAGE_KEY_V1, STORAGE_KEY_V2 } from './storage';
import v1Real from './__fixtures__/v1-real.json';

describe('migrate', () => {
  it('carries a real v1 payload into one profile without losing attempts', () => {
    const out = migrate(v1Real);
    expect(out.version).toBe(2);
    expect(out.profiles).toHaveLength(1);
    expect(out.profiles[0].attempts).toHaveLength((v1Real as { attempts: unknown[] }).attempts.length);
    expect(out.activeProfileId).toBe(out.profiles[0].id);
  });

  it('keeps the student name from v1 settings', () => {
    const out = migrate({ settings: { studentName: 'Sam', currentGrade: 4 }, attempts: [], missedQuestionIds: [] });
    expect(out.profiles[0].studentName).toBe('Sam');
  });

  it('defaults the migrated profile to grade 5', () => {
    expect(migrate(v1Real).profiles[0].grade).toBe(5);
  });

  it('seeds the review queue from v1 missed questions so history is not lost', () => {
    const out = migrate({
      settings: { studentName: 'A' }, attempts: [],
      missedQuestionIds: ['nf1-01', 'nbt5-02'],
    });
    expect(Object.keys(out.profiles[0].reviewQueue)).toEqual(['a:nf1-01', 'a:nbt5-02']);
  });

  it('returns a clean state for null, garbage, or a non-object', () => {
    for (const bad of [null, undefined, 42, 'nope', [], { nothing: true }]) {
      const out = migrate(bad);
      expect(out.version).toBe(2);
      expect(out.profiles).toHaveLength(1);
      expect(out.profiles[0].attempts).toEqual([]);
    }
  });

  it('passes an already-v2 state through unchanged', () => {
    const v2 = initialState();
    expect(migrate(v2)).toEqual(v2);
  });
});

describe('loadState', () => {
  const mem = (): Storage => {
    const m = new Map<string, string>();
    return {
      getItem: (k) => m.get(k) ?? null,
      setItem: (k, v) => void m.set(k, v),
      removeItem: (k) => void m.delete(k),
      clear: () => m.clear(), key: () => null, length: 0,
    } as Storage;
  };

  it('prefers v2 when present', () => {
    const s = mem();
    const state = initialState();
    state.profiles[0].studentName = 'FromV2';
    s.setItem(STORAGE_KEY_V2, JSON.stringify(state));
    s.setItem(STORAGE_KEY_V1, JSON.stringify(v1Real));
    expect(loadState(s).profiles[0].studentName).toBe('FromV2');
  });

  it('migrates v1 when v2 is absent', () => {
    const s = mem();
    s.setItem(STORAGE_KEY_V1, JSON.stringify(v1Real));
    expect(loadState(s).profiles[0].attempts.length)
      .toBe((v1Real as { attempts: unknown[] }).attempts.length);
  });

  it('leaves the v1 key in place after migrating', () => {
    // If v2 writing fails later, the original history must still exist.
    const s = mem();
    s.setItem(STORAGE_KEY_V1, JSON.stringify(v1Real));
    loadState(s);
    expect(s.getItem(STORAGE_KEY_V1)).not.toBeNull();
  });

  it('survives unparseable JSON', () => {
    const s = mem();
    s.setItem(STORAGE_KEY_V2, '{not json');
    expect(loadState(s).profiles).toHaveLength(1);
  });
});
```

- [ ] **Step 3: Run test to verify it fails**

Run: `npm run test:run -- src/state/migrate.test.ts`
Expected: FAIL — cannot resolve `./storage`.

- [ ] **Step 4: Write `src/state/types.ts` and `src/state/storage.ts`**

`src/state/types.ts`:

```ts
import type { Grade } from '../curriculum/types';
import type { ReviewQueue } from '../engine/scheduler';
import type { QuizAttempt } from '../types';

export interface Profile {
  id: string;
  studentName: string;
  grade: Grade;
  targetExamDate: string;
  dailyQuestionGoal: number;
  attempts: QuizAttempt[];
  reviewQueue: ReviewQueue;
}

export interface AppStateV2 {
  version: 2;
  profiles: Profile[];
  activeProfileId: string;
}
```

`src/state/storage.ts`:

```ts
import type { AppStateV2, Profile } from './types';
import type { ReviewQueue } from '../engine/scheduler';

export const STORAGE_KEY_V1 = 'nc_math_ssa_prep_state_v1';
export const STORAGE_KEY_V2 = 'nc_math_ssa_prep_state_v2';

export function newProfile(overrides: Partial<Profile> = {}): Profile {
  return {
    id: `p_${Math.random().toString(36).slice(2, 10)}`,
    studentName: 'Student',
    grade: 5,
    targetExamDate: '',
    dailyQuestionGoal: 20,
    attempts: [],
    reviewQueue: {},
    ...overrides,
  };
}

export function initialState(): AppStateV2 {
  const p = newProfile();
  return { version: 2, profiles: [p], activeProfileId: p.id };
}

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v);
}

/**
 * v1 -> v2. The old loader caught parse errors and silently discarded the
 * payload; under the new schema that would destroy a student's history, so
 * migration is explicit and every branch is tested.
 */
export function migrate(raw: unknown): AppStateV2 {
  if (isRecord(raw) && raw.version === 2 && Array.isArray(raw.profiles)) {
    return raw as unknown as AppStateV2;
  }
  if (!isRecord(raw)) return initialState();

  const settings = isRecord(raw.settings) ? raw.settings : {};
  const attempts = Array.isArray(raw.attempts) ? raw.attempts : [];
  const missed = Array.isArray(raw.missedQuestionIds) ? raw.missedQuestionIds : [];
  if (attempts.length === 0 && missed.length === 0 && !settings.studentName) {
    return initialState();
  }

  // Missed questions become box-1 review entries due immediately, so the
  // error bank the student built up survives the schema change.
  const nowIso = new Date().toISOString();
  const reviewQueue: ReviewQueue = {};
  for (const id of missed) {
    if (typeof id !== 'string') continue;
    reviewQueue[`a:${id}`] = {
      key: { kind: 'authored', id },
      box: 1, dueAt: nowIso, lastSeenAt: nowIso,
    };
  }

  const profile = newProfile({
    studentName: typeof settings.studentName === 'string' && settings.studentName
      ? settings.studentName : 'Student',
    grade: 5,
    targetExamDate: typeof settings.targetExamDate === 'string' ? settings.targetExamDate : '',
    dailyQuestionGoal: typeof settings.dailyQuestionGoal === 'number'
      ? settings.dailyQuestionGoal : 20,
    attempts: attempts as Profile['attempts'],
    reviewQueue,
  });

  return { version: 2, profiles: [profile], activeProfileId: profile.id };
}

export function loadState(storage: Storage): AppStateV2 {
  const readJson = (key: string): unknown => {
    try {
      const s = storage.getItem(key);
      return s ? JSON.parse(s) : null;
    } catch {
      return null;
    }
  };

  const v2 = readJson(STORAGE_KEY_V2);
  if (v2) return migrate(v2);

  const v1 = readJson(STORAGE_KEY_V1);
  if (v1) return migrate(v1);   // v1 key is deliberately left in place

  return initialState();
}

export function saveState(storage: Storage, state: AppStateV2): void {
  try {
    storage.setItem(STORAGE_KEY_V2, JSON.stringify(state));
  } catch (e) {
    console.error('Failed to save state', e);
  }
}

export type { AppStateV2, Profile };
```

- [ ] **Step 5: Run tests to verify they pass**

Run: `npm run test:run -- src/state/migrate.test.ts`
Expected: PASS, 11 tests.

- [ ] **Step 6: Commit**

```bash
git add src/state/
git commit -m "$(cat <<'EOF'
feat: add multi-profile state with a tested v1 migration

One device, several students. Migration is a pure function tested
against a real captured v1 payload, and the v1 key is left in place
after reading so a failed v2 write cannot lose a student's history.
Missed questions from v1 become box-1 review entries rather than being
discarded.

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01H1td136Jg4sYcrRxZDFbg1
EOF
)"
```

---

### Task 13: Rewire the app to curriculum-from-context

**Files:**
- Modify: `src/context/ProgressContext.tsx`
- Modify: `src/components/Dashboard.tsx`, `CurriculumView.tsx`, `QuizzesListView.tsx`, `WeakSpotsView.tsx`, `PrintReportModal.tsx`, `StudyGuideModal.tsx`, `StudyPaceModal.tsx`, `Navbar.tsx`, `QuizResults.tsx`
- Modify: `src/types/index.ts` (re-export from the new modules; delete moved types)
- Test: `src/context/ProgressContext.test.tsx`

**Interfaces:**
- Consumes: everything from Tasks 2–12.
- Produces: context value
  ```ts
  interface ProgressContextValue {
    state: AppStateV2;
    profile: Profile;
    curriculum: GradeCurriculum;
    mastery: Map<StandardCode, StandardMastery>;
    readiness: number;
    switchProfile(id: string): void;
    addProfile(name: string, grade: Grade): void;
    recordAttempt(attempt: QuizAttempt, results: {ref: QuestionRef; wasCorrect: boolean}[]): void;
  }
  ```

- [ ] **Step 1: Write the failing test**

Create `src/context/ProgressContext.test.tsx`:

```tsx
import { describe, it, expect } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { ProgressProvider, useProgress } from './ProgressContext';

function Probe() {
  const { profile, curriculum, readiness, addProfile, switchProfile, state } = useProgress();
  return (
    <div>
      <span data-testid="name">{profile.studentName}</span>
      <span data-testid="grade">{curriculum.grade}</span>
      <span data-testid="pass">{curriculum.ssa.passingPercent}</span>
      <span data-testid="readiness">{readiness}</span>
      <span data-testid="count">{state.profiles.length}</span>
      <button onClick={() => addProfile('Second', 5)}>add</button>
      <button onClick={() => switchProfile(state.profiles[0].id)}>first</button>
    </div>
  );
}

const renderApp = () => render(<ProgressProvider><Probe /></ProgressProvider>);

describe('ProgressProvider', () => {
  beforeEach(() => localStorage.clear());

  it('supplies the active profile curriculum, not a hardcoded grade 5 import', () => {
    renderApp();
    expect(screen.getByTestId('grade')).toHaveTextContent('5');
    expect(screen.getByTestId('pass')).toHaveTextContent('80');
  });

  it('starts at zero readiness with no attempts', () => {
    renderApp();
    expect(screen.getByTestId('readiness')).toHaveTextContent('0');
  });

  it('adds and switches profiles', () => {
    renderApp();
    act(() => screen.getByText('add').click());
    expect(screen.getByTestId('count')).toHaveTextContent('2');
    expect(screen.getByTestId('name')).toHaveTextContent('Second');
    act(() => screen.getByText('first').click());
    expect(screen.getByTestId('name')).not.toHaveTextContent('Second');
  });

  it('persists across a remount', () => {
    const { unmount } = renderApp();
    act(() => screen.getByText('add').click());
    unmount();
    renderApp();
    expect(screen.getByTestId('count')).toHaveTextContent('2');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test:run -- src/context/`
Expected: FAIL — `useProgress` does not expose `curriculum`.

- [ ] **Step 3: Rewrite `ProgressContext.tsx`**

Replace the `useState`/`localStorage` block with `loadState(localStorage)` and `saveState(localStorage, state)`. Derive `profile` from `activeProfileId`, `curriculum` via `getCurriculum(profile.grade)`, `mastery` via `masteryByStandard(profile.attempts, curriculum)` inside `useMemo`, and `readiness` via `overallReadiness(mastery, curriculum)`. Implement `recordAttempt` to append the attempt and fold each result through `recordResult` into the profile's `reviewQueue`.

- [ ] **Step 4: Rewire the nine components**

Run `npx tsc -b --noEmit` and work through the errors. In each component, replace direct imports of `GRADE_5_DOMAINS` / `GRADE_5_STANDARDS` and every literal `80` cutoff with values read from `useProgress().curriculum`. Add a profile picker to `Navbar.tsx`. In `PrintReportModal.tsx`, add a section listing `topMisconceptions(mastery, 5)`.

- [ ] **Step 5: Slim `src/types/index.ts`**

Delete the types now owned elsewhere (`DomainId`, `StandardInfo`, `DomainInfo`, `Question`, `QuestionType`, `StandardMastery`, `UserSettings`, `AppState`) and re-export from their new homes so untouched imports keep working. Keep `QuizAttempt`, `QuizAttemptAnswer`, `QuizDefinition`, `DomainMastery`. `QuizAttemptAnswer` already gained `standardCode` and `misconception` in Task 9, Step 0 — leave those fields alone.

- [ ] **Step 6: Run the full suite and build**

Run: `npm run test:run && npm run build`
Expected: all PASS.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "$(cat <<'EOF'
refactor: read curriculum from context instead of importing grade 5

Nine components imported grade 5 constants or the literal 80% cutoff
directly, which is what made the app single-grade. They now read the
active profile's curriculum, so adding a grade is a data change rather
than a component change.

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01H1td136Jg4sYcrRxZDFbg1
EOF
)"
```

---

### Task 14: Adaptive practice mode in the UI

**Files:**
- Create: `src/components/AdaptiveSessionCard.tsx`
- Modify: `src/components/QuizzesListView.tsx`, `src/components/QuizRunner.tsx`, `src/App.tsx`
- Test: `src/components/AdaptiveSessionCard.test.tsx`

**Interfaces:**
- Consumes: `selectSession` (Task 11), `useProgress` (Task 13).
- Produces: `<AdaptiveSessionCard onStart={(refs: QuestionRef[]) => void} />`.

- [ ] **Step 1: Write the failing test**

Create `src/components/AdaptiveSessionCard.test.tsx`:

```tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ProgressProvider } from '../context/ProgressContext';
import { AdaptiveSessionCard } from './AdaptiveSessionCard';

const renderCard = (onStart = vi.fn()) => {
  render(<ProgressProvider><AdaptiveSessionCard onStart={onStart} /></ProgressProvider>);
  return onStart;
};

describe('AdaptiveSessionCard', () => {
  beforeEach(() => localStorage.clear());

  it('offers a practice session', () => {
    renderCard();
    expect(screen.getByRole('button', { name: /start.*practice/i })).toBeInTheDocument();
  });

  it('hands back the requested number of question refs', async () => {
    const onStart = renderCard();
    await userEvent.click(screen.getByRole('button', { name: /start.*practice/i }));
    expect(onStart).toHaveBeenCalledTimes(1);
    expect(onStart.mock.calls[0][0]).toHaveLength(10);
  });

  it('says nothing is due when the review queue is empty', () => {
    renderCard();
    expect(screen.getByText(/no reviews due/i)).toBeInTheDocument();
  });

  it('lets the student choose a session length', async () => {
    const onStart = renderCard();
    await userEvent.selectOptions(screen.getByLabelText(/questions/i), '20');
    await userEvent.click(screen.getByRole('button', { name: /start.*practice/i }));
    expect(onStart.mock.calls[0][0]).toHaveLength(20);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test:run -- src/components/AdaptiveSessionCard.test.tsx`
Expected: FAIL — cannot resolve `./AdaptiveSessionCard`.

- [ ] **Step 3: Write the component**

Create `src/components/AdaptiveSessionCard.tsx`. It reads `curriculum`, `profile`, and `mastery` from `useProgress`, counts `dueEntries(profile.reviewQueue, new Date()).length`, renders that count (or "No reviews due"), offers a `<select>` of 10 / 20 / 30 labelled "Questions", and on click calls `onStart(selectSession({...}))` with `seed: Date.now()`.

- [ ] **Step 4: Wire it into the app**

Render `<AdaptiveSessionCard>` at the top of `QuizzesListView`. Extend `QuizRunner` to accept `refs: QuestionRef[]` directly in addition to a `QuizDefinition`, resolving each through `curriculum.source.resolve`. On submit, pass per-question `{ref, wasCorrect}` plus the selected option's `misconception` into `recordAttempt`.

- [ ] **Step 5: Run the full suite and build**

Run: `npm run test:run && npm run build`
Expected: all PASS.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "$(cat <<'EOF'
feat: add adaptive practice sessions alongside the static quizzes

Static quizzes stay: the diagnostic, module drills and both full
simulations are the right tool for sitting a realistic test. Adaptive
sessions are a separate daily-practice mode built from demonstrated
weakness and review debt.

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01H1td136Jg4sYcrRxZDFbg1
EOF
)"
```

---

### Task 15: First-run screen, quiz guard, and build base path

**Files:**
- Create: `src/components/FirstRunScreen.tsx`
- Modify: `src/App.tsx`, `vite.config.ts`
- Test: `src/components/FirstRunScreen.test.tsx`

- [ ] **Step 1: Write the failing test**

Create `src/components/FirstRunScreen.test.tsx`:

```tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FirstRunScreen } from './FirstRunScreen';

describe('FirstRunScreen', () => {
  it('explains what SSA is and that the tool is NC-specific', () => {
    render(<FirstRunScreen onComplete={vi.fn()} />);
    expect(screen.getByText(/single subject acceleration/i)).toBeInTheDocument();
    expect(screen.getByText(/north carolina/i)).toBeInTheDocument();
  });

  it('states plainly that no data leaves the browser', () => {
    // The users are children; this claim is load-bearing and must be
    // visible before anyone types a name.
    render(<FirstRunScreen onComplete={vi.fn()} />);
    expect(screen.getByText(/stays (in|on) (your|this) (browser|device)/i)).toBeInTheDocument();
  });

  it('will not continue without a name', async () => {
    const onComplete = vi.fn();
    render(<FirstRunScreen onComplete={onComplete} />);
    await userEvent.click(screen.getByRole('button', { name: /start/i }));
    expect(onComplete).not.toHaveBeenCalled();
  });

  it('passes the name and chosen grade back', async () => {
    const onComplete = vi.fn();
    render(<FirstRunScreen onComplete={onComplete} />);
    await userEvent.type(screen.getByLabelText(/name/i), 'Alex');
    await userEvent.selectOptions(screen.getByLabelText(/grade/i), '5');
    await userEvent.click(screen.getByRole('button', { name: /start/i }));
    expect(onComplete).toHaveBeenCalledWith({ studentName: 'Alex', grade: 5 });
  });

  it('offers only grades that have a curriculum', () => {
    render(<FirstRunScreen onComplete={vi.fn()} />);
    const options = screen.getAllByRole('option').map((o) => (o as HTMLOptionElement).value);
    expect(options).toEqual(['5']);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test:run -- src/components/FirstRunScreen.test.tsx`
Expected: FAIL — cannot resolve `./FirstRunScreen`.

- [ ] **Step 3: Write the component and wire it up**

Create `FirstRunScreen.tsx` with the explanatory copy, a name input, and a grade `<select>` built from `listCurricula()`. In `App.tsx`, render it when the active profile has an empty `studentName` and no attempts.

- [ ] **Step 4: Add the quiz guard and base path**

In `App.tsx`, add:

```tsx
useEffect(() => {
  if (!activeQuiz) return;
  const warn = (e: BeforeUnloadEvent) => { e.preventDefault(); e.returnValue = ''; };
  window.addEventListener('beforeunload', warn);
  return () => window.removeEventListener('beforeunload', warn);
}, [activeQuiz]);
```

In `vite.config.ts`, add `base: '/math/app/'` to the config object.

- [ ] **Step 5: Run the full suite and build**

Run: `npm run test:run && npm run build`
Expected: all PASS. Confirm `dist/index.html` references assets under `/math/app/`.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "$(cat <<'EOF'
feat: add the first-run screen, quiz guard, and deploy base path

Someone arriving from the public site needs to know what SSA is, that
this is NC-specific, and that nothing they enter leaves their browser —
stated before they type a child's name. The grade picker offers only
grades that actually have a curriculum.

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01H1td136Jg4sYcrRxZDFbg1
EOF
)"
```

---

### Task 16: CI, repository, and deployment

**Files:**
- Create: `.github/workflows/ci.yml`
- Modify: `README.md`
- Modify (other repo): `frictionlesscode.com/.github/workflows/deploy.yml`
- Create (other repo): `frictionlesscode.com/src/pages/math.astro`

- [ ] **Step 1: Add the CI workflow**

Create `.github/workflows/ci.yml`:

```yaml
name: CI

on:
  pull_request:
  push:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: read

concurrency:
  group: ci-${{ github.ref }}
  cancel-in-progress: true

jobs:
  verify:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
      - run: npm ci
      - name: Lint
        run: npm run lint
      - name: Type check
        run: npm run typecheck
      - name: Test
        run: npm run test:run
      - name: Build
        run: npm run build
```

- [ ] **Step 2: Update the README**

Rewrite the "Running the Web App Locally" section to include `npm run test:run`, and add a short section describing the curriculum/engine split and how to add a grade. Correct the claim that the app supports open-response answers — it no longer does.

- [ ] **Step 3: Verify everything green locally**

Run: `npm run lint && npm run typecheck && npm run test:run && npm run build`
Expected: all four PASS. Do not proceed until they do.

- [ ] **Step 4: Merge to main and create the public repository**

```bash
git checkout master
git merge --no-ff feat/multi-grade-adaptive
git branch -m master main
gh repo create frictionlesscode/ncmathssa --public --source=. --remote=origin \
  --description="Adaptive NC math practice for Single Subject Acceleration — standards-aligned, runs entirely in the browser"
git push -u origin main
git tag v0.1.0 && git push origin v0.1.0
```

**STOP HERE and confirm with the repository owner before running this step** — it is the first public, hard-to-reverse action in the plan.

- [ ] **Step 5: Add the landing page to the site repo**

In `C:\Users\mswanson\Projects\frictionlesscode.com`, create `src/pages/math.astro` following the existing page layout conventions in that repo. Content: what NC Single Subject Acceleration is, who the tool is for, that it is built against published NCSCOS standards rather than secure CASE items, that all data stays in the browser, and a prominent link to `/math/app/`.

- [ ] **Step 6: Wire the app build into the site deploy**

In `frictionlesscode.com/.github/workflows/deploy.yml`, add these steps to the `build` job **before** the Astro build step:

```yaml
      - name: Check out the math app at its pinned release
        uses: actions/checkout@v4
        with:
          repository: frictionlesscode/ncmathssa
          ref: v0.1.0          # pinned: bump to release a new app version
          path: .mathapp
      - name: Build the math app
        working-directory: .mathapp
        run: npm ci && npm run build
      - name: Stage the math app into the site
        run: |
          mkdir -p public/math/app
          cp -r .mathapp/dist/* public/math/app/
```

Pinning to a tag is deliberate: tracking `main` would let a failing app build take the blog offline and let unrelated app commits silently redeploy the site.

- [ ] **Step 7: Verify the site builds with the app embedded**

In the site repo: `npm run build`, then confirm `dist/math/app/index.html` exists and `dist/math/index.html` (the Astro landing page) exists.

- [ ] **Step 8: Commit both repos**

```bash
# in ncmathssa
git add .github/workflows/ci.yml README.md
git commit -m "$(cat <<'EOF'
ci: add the verification workflow and refresh the README

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01H1td136Jg4sYcrRxZDFbg1
EOF
)"
git push

# in frictionlesscode.com, on a branch
git checkout -b feat/math-app
git add src/pages/math.astro .github/workflows/deploy.yml
git commit -m "$(cat <<'EOF'
feat: publish the NC math practice app at /math/

The landing page is Astro rather than a screen in the SPA so search
engines can index it. The app is built from a pinned tag of
frictionlesscode/ncmathssa, so an app regression cannot take the site
down and an unrelated app commit cannot silently redeploy it.

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01H1td136Jg4sYcrRxZDFbg1
EOF
)"
```

- [ ] **Step 9: Owner verification**

After the site deploys, the repository owner must confirm in a browser that `frictionlesscode.com/math/` renders the landing page and `frictionlesscode.com/math/app/` loads the working app with assets resolving correctly. This cannot be verified from the development environment.

---

## Out of Scope — Follow-on Plan

Grades 1–4 are deliberately excluded. They require the NCSCOS standards for those grades to be transcribed from published documents rather than recalled (spec §5.1), which is a prerequisite this plan cannot satisfy on its own. Once those documents are in hand, the follow-on plan is mechanical and repeats Tasks 3, 5, 6, 7 and 8 per grade:

1. Transcribe the grade's domains and standards into `src/curriculum/gradeN/standards.ts`, verified against the source document.
2. Set `weighting` to `even-by-standard-count` for grades 1–2, and label the gauge accordingly in the UI.
3. Author reasoning items; write fluency generators; hold `contentComplete: false` until the integrity test's coverage assertion would pass.
4. Register the grade in `src/curriculum/registry.ts`, which automatically adds it to the first-run picker and the profile grade selector.
