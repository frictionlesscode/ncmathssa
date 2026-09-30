# Trust B2: Grade 5 Content in NC Scope Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Every Grade 5 question, generator, study-guide line and practice form matches the NC SCOS rules in `nc-rules.md` (NC-R1, R3-R11), and every Critical/High/Medium finding in `content-g5.md` (except the trapezoid work owned by Plan B1) is fixed and pinned by a test.

**Architecture:** Content-only. Authored items are rewritten in place (ids kept, `contentVersion: 2`), three generators are constrained at the source (nbt1, nf1, nf4), study guides and standards text are corrected, and `quizzes.ts` is recomposed from existing ids so each form's domain shares land in the blueprint bands. Regression tests read the real data; each one recomputes the key and every distractor with its own arithmetic instead of trusting the item's stored value.

**Tech Stack:** TypeScript, Vitest (with fast-check via `assertTemplateSound`), oxlint, Vite (`?raw` import for a source-text test).

**Spec:** `docs/superpowers/specs/2026-09-30-quality-and-trust-design.md` (section 3, Plan B). Inputs: `docs/superpowers/audits/2026-09-30/content-g5.md` and `docs/superpowers/audits/2026-09-30/nc-rules.md`.

## Global Constraints

- Commit trailer lines (end every commit message with both):
  `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`
  `Claude-Session: https://claude.ai/code/session_01X5HSDdHPWxvHxgBaoSTbLX`
- Commands: tests `npx vitest run <path>`, all tests `npm run test:run`, types `npm run typecheck`, lint `npm run lint`, build `npm run build`.
- Passing bar is always `curriculum.ssa.passingPercent`, never a literal 80 in logic.
- Question ids never change.
- Scope: rules NC-R1 and NC-R3 to NC-R11 in `docs/superpowers/audits/2026-09-30/nc-rules.md`. NC-R2 (trapezoid), `g3-02`, the `NC.5.G.3` keyConcepts hierarchy line and the trapezoid lines of the `NC.5.G.3` study guide belong to Plan B1 (built before this plan). Do not edit them.
- Plan B1 added `contentVersion?: number` to `Question` (absent means 1). This plan sets `contentVersion: 2` on every authored question whose key, options or math changes (17 ids, listed in Task 7). Generated templates carry no `contentVersion`; generator changes are covered by Plan C's snapshot.
- Every rewritten item must be solved independently. The working is in a comment beside the option, every distractor value follows from its misconception tag, and that tag exists in `src/curriculum/misconceptions.ts`. `src/curriculum/misconceptions.test.ts` fails on an undeclared tag and on an orphan (a declared tag nothing uses), so a task that stops using a tag deletes its entry in the same task.
- Find every edit by question id or exact old string, never by line number: Plan B1 shifted the files. Working-tree files are CRLF (`core.autocrlf=true`, index is LF). If the Edit tool cannot match a multi-line block, edit it line by line.
- `tsconfig.app.json` has `noUnusedLocals`, `noUnusedParameters`, `verbatimModuleSyntax` and `erasableSyntaxOnly`, and `types` is only `vite/client`. Tests must not import `node:fs`; read source text with a `?raw` import.
- Keep the correct-option position varied. `authored.test.ts` requires at least three distinct positions and none above half; the positions in this plan keep the current spread (A 10, B 13, C 14, D 12).
- Test naming: every regression test name cites the finding or rule (`oa2-01: NC-R1 ...`, `nf1 template: NC-R6 ...`).
- Grade 5 expressions use parentheses only, at most two operations, no exponent notation, no `line plot`, no `slope`, no 6th-grade wording (checked by Task 5's text scan).

## Review Focus

Failure modes the spec implies that a per-item test would not catch, most likely first. Each has a test in the task that owns the code.

1. **A generator drawing an extreme pair.** nf1 now draws `5` with `100` (numerators up to 99), and nbt1 now multiplies by `0.01` and by `1,000` (Task 2 and Task 3). Options must stay pairwise distinct exact text with no float artifacts, and the independent recompute must still equal the key. Templates get 500-seed distinctness and recompute tests, and a test that every allowed pair or move is actually reached.
2. **A child's saved answer to a changed item.** A key that changed under an unchanged id would silently re-grade old attempts. Task 7 pins the exact set of 17 bumped ids and that no other item was bumped.
3. **Equal-value or unsimplified fraction options.** nf1-01, nf1-02, nf1-04, nf4-03 and nf7-03 offer fractions and mixed numbers. Tests recompute each option with exact integer arithmetic, assert every option is in simplest form, and assert no option equals the exact sum in the estimation item (the audit's nf1-04 defect).
4. **Text diagrams on a phone.** md2-01 lists line-graph points in `promptDetails`, which renders monospace with preserved newlines. A test caps each line at 20 characters and checks the answer never depends on alignment.
5. **Forms that overlap or drift from the blueprint.** Only 12 fraction items exist, so two forms that each need about 40% fractions must share some. A test pins that the forms share only fraction items, that both mocks sit strictly inside every band, and that the diagnostic is within 5 points of every band while still covering all 17 standards.

## File map

| File | Change | Task |
|---|---|---|
| `src/curriculum/grade5/scope.testkit.ts` | Create: `byId`, `keyText`, `optionFor`, `operationCount`, `denominatorsIn`, `inOneFamily`, `NF1_FAMILIES` | 1 |
| `src/curriculum/grade5/scope.oa.test.ts` | Create: OA.2 and OA.3 regressions | 1 |
| `src/curriculum/grade5/scope.nbt.test.ts` | Create: NBT regressions | 2 |
| `src/curriculum/grade5/scope.nf.test.ts` | Create: NF regressions | 3 |
| `src/curriculum/grade5/scope.md.test.ts` | Create: MD regressions | 4 |
| `src/curriculum/grade5/scope.g.test.ts` | Create: g3-03 regression | 5 |
| `src/curriculum/grade5/scope.text.test.ts` | Create: text scan and unsupported-claims scan | 5 |
| `src/curriculum/grade5/quizzes.blueprint.test.ts` | Create: form shares vs bands | 6 |
| `src/curriculum/grade5/scope.contentVersion.test.ts` | Create: ledger of bumped ids | 7 |
| `src/curriculum/grade5/authored.ts` | Rewrite 17 items, wording on 4 more | 1-5 |
| `src/curriculum/grade5/standards.ts` | OA.2, NBT.1, NBT.7, NF.1, NF.4, MD domain, MD.1, MD.2 text | 1-4 |
| `src/curriculum/grade5/studyGuides.ts` | OA.2, OA.3, NBT.1, NBT.7, NF.1, MD.1, MD.2 entries plus claim fixes | 1-5 |
| `src/curriculum/grade5/quizzes.ts` | Recompose three forms, fix comments and subtitles | 6 |
| `src/curriculum/grade5/authored.test.ts` | Diagnostic "exactly once" becomes "at least once" | 6 |
| `src/curriculum/grade5/templates/nbt1-powers-of-ten.ts` and `.test.ts` | Rewrite generator and test | 2 |
| `src/curriculum/grade5/templates/nf1-add-unlike.ts` and `.test.ts` | Related families only | 3 |
| `src/curriculum/grade5/templates/nf4-multiply-fractions.ts` and `.test.ts` | Denominators 2, 3, 4 | 3 |
| `src/curriculum/grade5/templates/md1-unit-conversion.ts` and `.test.ts` | "same length" wording | 4 |
| `src/curriculum/misconceptions.ts` | Delete 7 orphaned entries, add `confused-the-kind-of-data` | 1, 3, 4 |

---

### Task 1: OA.2 and OA.3 (NC-R1)

**Files:**
- Create: `src/curriculum/grade5/scope.testkit.ts`
- Create: `src/curriculum/grade5/scope.oa.test.ts`
- Modify: `src/curriculum/grade5/authored.ts` (`oa2-01`, `oa2-02`, `oa2-03`, `oa3-02`, `oa3-03`)
- Modify: `src/curriculum/grade5/studyGuides.ts` (`NC.5.OA.2` workedExample, `NC.5.OA.3` whyItMattersForSSA)
- Modify: `src/curriculum/grade5/standards.ts` (`NC.5.OA.2` keyConcepts[0])
- Modify: `src/curriculum/misconceptions.ts` (delete `incomplete-grouping-evaluation`)

**Interfaces:**
- Consumes: `GRADE_5_AUTHORED` from `./authored`, `correctOption` from `../../engine/questionModel`.
- Produces (in `scope.testkit.ts`, used by Tasks 2 to 5):
  - `byId(id: string): Question`
  - `keyText(id: string): string`
  - `optionFor(id: string, tag: string): string` (throws unless exactly one option carries the tag)
  - `operationCount(expr: string): number`
  - `denominatorsIn(text: string): number[]`
  - `NF1_FAMILIES: readonly (readonly number[])[]`
  - `inOneFamily(dens: number[]): boolean`

Rules covered: NC-R1. Findings: oa2-01, oa2-03 (High), study-guide worked example (High), OA.2 keyConcepts, oa3-02 and oa3-03 wording (Medium). Beyond the audit: `oa2-02` reads "subtract 7 from the product of 9 and 6, then divide by 5", which is `(9 × 6 - 7) ÷ 5`, three operations. NC-R1 limits evaluated expressions to two, so it is rewritten too.

- [ ] **Step 1: Create the test kit**

Create `src/curriculum/grade5/scope.testkit.ts`:

```ts
import type { Question } from '../../engine/questionModel';
import { correctOption } from '../../engine/questionModel';
import { GRADE_5_AUTHORED } from './authored';

/** The authored Grade 5 item with this id; throws if there is none. */
export function byId(id: string): Question {
  const q = GRADE_5_AUTHORED.find((x) => x.id === id);
  if (!q) throw new Error(`no Grade 5 item ${id}`);
  return q;
}

/** Text of the item's marked-correct option. */
export function keyText(id: string): string {
  return correctOption(byId(id)).text;
}

/** Text of the single option carrying `tag`; throws unless exactly one does. */
export function optionFor(id: string, tag: string): string {
  const matches = byId(id).options.filter((o) => o.misconception === tag);
  if (matches.length !== 1) {
    throw new Error(`${id}: expected one option tagged ${tag}, found ${matches.length}`);
  }
  return matches[0].text;
}

/** Number of + − × ÷ operations written in `expr`. A hyphen counts as a minus
 *  only when spaces surround it, which is how every Grade 5 expression is
 *  written ("12 - 4"). */
export function operationCount(expr: string): number {
  return (expr.match(/[+×÷−]|\s-\s/g) ?? []).length;
}

/** Every denominator written as a slash fraction in `text` ("3/4" gives 4). */
export function denominatorsIn(text: string): number[] {
  return [...text.matchAll(/\d+\/(\d+)/g)].map((m) => Number(m[1]));
}

/** NC.5.NF.1 (NC-R6): unlike denominators are added only within one of these
 *  related families. */
export const NF1_FAMILIES: readonly (readonly number[])[] = [
  [2, 4, 8],
  [3, 6, 12],
  [5, 10, 100],
];

/** True when every denominator belongs to the same NC.5.NF.1 family. */
export function inOneFamily(dens: number[]): boolean {
  return NF1_FAMILIES.some((family) => dens.every((d) => family.includes(d)));
}
```

- [ ] **Step 2: Write the failing test**

Create `src/curriculum/grade5/scope.oa.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { byId, keyText, optionFor, operationCount } from './scope.testkit';
import { GRADE_5_STUDY_GUIDES } from './studyGuides';
import { GRADE_5_STANDARDS } from './standards';

const OA2_IDS = ['oa2-01', 'oa2-02', 'oa2-03', 'oa2-04'];

/** Every expression an OA.2 item shows a child: each line of promptDetails
 *  (minus a "Label:" prefix) and each option. */
function expressionsOf(id: string): string[] {
  const q = byId(id);
  const lines = (q.promptDetails ?? '').split('\n').map((l) => l.replace(/^[^:]*:\s*/, ''));
  return [...lines, ...q.options.map((o) => o.text)];
}

describe('OA.2 stays inside NC-R1 (parentheses only, at most two operations)', () => {
  it.each(OA2_IDS)('%s: NC-R1 no expression has more than two operations or a bracket', (id) => {
    for (const expr of expressionsOf(id)) {
      expect(operationCount(expr), `${id}: "${expr}"`).toBeLessThanOrEqual(2);
      expect(expr, `${id}: NC-R1 parentheses only`).not.toMatch(/[[\]{}]/);
    }
  });

  it('oa2-01: NC-R1 6 × (12 - 4), key and distractors follow their tags', () => {
    expect(byId('oa2-01').promptDetails).toBe('6 × (12 - 4)');
    expect(keyText('oa2-01')).toBe(String(6 * (12 - 4)));
    expect(optionFor('oa2-01', 'ignored-grouping-symbols')).toBe(String(6 * 12 - 4));
    expect(optionFor('oa2-01', 'forgot-the-final-step')).toBe(String(12 - 4));
    expect(optionFor('oa2-01', 'added-instead-of-multiplied')).toBe(String(6 + 12 - 4));
  });

  it('oa2-02: NC-R1 (32 - 8) ÷ 6 is the key and the four options have four different values', () => {
    expect(keyText('oa2-02')).toBe('(32 - 8) ÷ 6');
    expect(optionFor('oa2-02', 'ignored-grouping-symbols')).toBe('32 - 8 ÷ 6');
    expect(optionFor('oa2-02', 'reversed-the-subtraction')).toBe('(8 - 32) ÷ 6');
    expect(optionFor('oa2-02', 'misgrouped-the-subtraction')).toBe('32 ÷ (8 - 6)');
    const values = [(32 - 8) / 6, 32 - 8 / 6, (8 - 32) / 6, 32 / (8 - 6)];
    expect(new Set(values).size).toBe(4);
    expect(byId('oa2-02').prompt).toContain('Subtract 8 from 32, then divide the difference by 6');
  });

  it('oa2-03: NC-R1 5 × (1.5 + 0.75), key and distractors follow their tags', () => {
    const q = byId('oa2-03');
    expect(q.promptDetails).toBe('5 × (1.5 + 0.75)');
    expect(keyText('oa2-03')).toBe(String(5 * (1.5 + 0.75)));
    expect(optionFor('oa2-03', 'ignored-grouping-symbols')).toBe(String(5 * 1.5 + 0.75));
    expect(optionFor('oa2-03', 'forgot-the-final-step')).toBe(String(1.5 + 0.75));
    expect(optionFor('oa2-03', 'added-instead-of-multiplied')).toBe(String(5 + 1.5 + 0.75));
    // The item now sits inside NC scope, so it must not wear the above-grade badge.
    expect(q.isStretch).toBe(false);
  });

  it('OA.2 study guide: NC-R1 the worked example has two operations and its true answer', () => {
    const ex = GRADE_5_STUDY_GUIDES['NC.5.OA.2'].workedExample;
    expect(operationCount(ex.problem)).toBeLessThanOrEqual(2);
    expect(ex.problem).toContain('48 ÷ (10 - 4)');
    expect(ex.answer).toBe(String(48 / (10 - 4)));
  });

  it('OA.2 standard: NC-R1 the first keyConcept states the two-operation limit', () => {
    const oa2 = GRADE_5_STANDARDS.find((s) => s.code === 'NC.5.OA.2')!;
    expect(oa2.keyConcepts[0]).toMatch(/at most two operations/);
  });
});

describe('OA.3 wording (audit Medium)', () => {
  it('oa3-03: reading level has no "slope", and 48 ÷ 6 is calculator-off', () => {
    const q = byId('oa3-03');
    expect(q.explanation.conceptSummary).not.toMatch(/slope/i);
    expect(q.calculatorAllowed).toBe(false);
  });

  it('oa3-02: commonMisconception names an error, not a study tip', () => {
    const text = byId('oa3-02').explanation.commonMisconception ?? '';
    expect(text).not.toMatch(/unnecessary time/);
    expect(text).toContain('35 + 10 = 45');
  });

  it('OA.3 study guide: whyItMatters makes no 6th-grade or y = kx claim', () => {
    const why = GRADE_5_STUDY_GUIDES['NC.5.OA.3'].workedExample.whyItMattersForSSA;
    expect(why).not.toMatch(/6th grade|y = kx/);
  });
});

describe('OA content versions', () => {
  it('rewritten OA.2 items carry contentVersion 2; untouched OA items do not', () => {
    for (const id of ['oa2-01', 'oa2-02', 'oa2-03']) expect(byId(id).contentVersion, id).toBe(2);
    for (const id of ['oa2-04', 'oa3-01', 'oa3-02', 'oa3-03']) {
      expect(byId(id).contentVersion ?? 1, id).toBe(1);
    }
  });
});
```

- [ ] **Step 3: Run it to verify it fails**

Run: `npx vitest run src/curriculum/grade5/scope.oa.test.ts`
Expected: FAIL. oa2-01 is `36 ÷ (6 - 3) + 5 × 3` (four operations), oa2-02 has three operations, the guide example has four, `keyConcepts[0]` lacks "at most two operations", `contentVersion` is undefined.

- [ ] **Step 4: Rewrite `oa2-01` in `authored.ts`**

Replace the whole object with `id: 'oa2-01'` with:

```ts
  {
    id: 'oa2-01',
    standardCode: 'NC.5.OA.2',
    domainId: 'OA',
    prompt: 'Evaluate the expression below following the standard order of operations:',
    promptDetails: '6 × (12 - 4)',
    options: labelOptions([
      // Parentheses ignored: 6 × 12 = 72, then 72 - 4 = 68.
      { text: '68', isCorrect: false, misconception: 'ignored-grouping-symbols' },
      // Stopped after the parentheses: 12 - 4 = 8.
      { text: '8', isCorrect: false, misconception: 'forgot-the-final-step' },
      // Key: (12 - 4) = 8, then 6 × 8 = 48.
      { text: '48', isCorrect: true },
      // Added instead of multiplying: 6 + 12 - 4 = 14.
      { text: '14', isCorrect: false, misconception: 'added-instead-of-multiplied' },
    ]),
    calculatorAllowed: false,
    isStretch: false,
    difficulty: 'mastery',
    contentVersion: 2,
    explanation: {
      stepByStep: [
        'Step 1: Evaluate inside the parentheses first: (12 - 4) = 8. The expression is now: 6 × 8.',
        'Step 2: Multiply: 6 × 8 = 48.'
      ],
      conceptSummary: 'Operations inside parentheses take highest priority. Do them first, then finish the expression.',
      commonMisconception: 'Multiplying 6 × 12 = 72 first and then subtracting 4 gives 68, which ignores the parentheses.'
    }
  },
```

- [ ] **Step 5: Rewrite `oa2-02` in `authored.ts`**

Replace the whole object with `id: 'oa2-02'` with:

```ts
  {
    id: 'oa2-02',
    standardCode: 'NC.5.OA.2',
    domainId: 'OA',
    prompt: 'Which numerical expression represents the statement: "Subtract 8 from 32, then divide the difference by 6"?',
    options: labelOptions([
      // Key: the difference (32 - 8) is grouped, then divided by 6. Value 4.
      { text: '(32 - 8) ÷ 6', isCorrect: true },
      // Left the difference ungrouped, so only the 8 is divided by 6.
      { text: '32 - 8 ÷ 6', isCorrect: false, misconception: 'ignored-grouping-symbols' },
      // Read "subtract 8 from 32" as 8 - 32.
      { text: '(8 - 32) ÷ 6', isCorrect: false, misconception: 'reversed-the-subtraction' },
      // Grouped the 8 with the 6 instead of with the 32.
      { text: '32 ÷ (8 - 6)', isCorrect: false, misconception: 'misgrouped-the-subtraction' },
    ]),
    calculatorAllowed: false,
    isStretch: false,
    difficulty: 'mastery',
    contentVersion: 2,
    explanation: {
      stepByStep: [
        'Step 1: "Subtract 8 from 32" is written 32 - 8.',
        'Step 2: "The difference" is the whole result of that subtraction, so it needs grouping symbols: (32 - 8).',
        'Step 3: "Divide by 6" applies to the whole difference: (32 - 8) ÷ 6.'
      ],
      conceptSummary: 'Grouping symbols show which part of a statement is done first and treated as one quantity.',
      commonMisconception: 'Choice C reverses the subtraction ("subtract 8 from 32" starts with 32 and takes away 8).'
    }
  },
```

- [ ] **Step 6: Rewrite `oa2-03` in `authored.ts`**

Replace the whole object with `id: 'oa2-03'` with:

```ts
  {
    id: 'oa2-03',
    standardCode: 'NC.5.OA.2',
    domainId: 'OA',
    prompt: 'Evaluate the expression without using a calculator:',
    promptDetails: '5 × (1.5 + 0.75)',
    options: labelOptions([
      // Parentheses ignored: 5 × 1.5 = 7.5, then 7.5 + 0.75 = 8.25.
      { text: '8.25', isCorrect: false, misconception: 'ignored-grouping-symbols' },
      // Stopped after the parentheses: 1.5 + 0.75 = 2.25.
      { text: '2.25', isCorrect: false, misconception: 'forgot-the-final-step' },
      // Added instead of multiplying: 5 + 1.5 + 0.75 = 7.25.
      { text: '7.25', isCorrect: false, misconception: 'added-instead-of-multiplied' },
      // Key: (1.5 + 0.75) = 2.25, then 5 × 2.25 = 11.25.
      { text: '11.25', isCorrect: true },
    ]),
    calculatorAllowed: false,
    isStretch: false,
    difficulty: 'advanced',
    contentVersion: 2,
    explanation: {
      stepByStep: [
        'Step 1: Parentheses first. Line up the decimal points: 1.50 + 0.75 = 2.25. The expression is now: 5 × 2.25.',
        'Step 2: Multiply: 5 × 2 = 10 and 5 × 0.25 = 1.25, so 5 × 2.25 = 11.25.'
      ],
      conceptSummary: 'Evaluate the parentheses first, then finish the expression. The numbers inside can be decimals.',
      commonMisconception: 'Multiplying 5 × 1.5 = 7.5 first and then adding 0.75 gives 8.25, which ignores the parentheses.'
    }
  },
```

- [ ] **Step 7: Reword `oa3-02` and `oa3-03` in `authored.ts`**

In the `oa3-02` object, replace the line
`      commonMisconception: 'Listing terms one by one up to 35, which takes unnecessary time and risks counting errors.'`
with
`      commonMisconception: 'Adding the difference between the rules (35 + 10 = 45) instead of scaling: y is always 3 times x.'`

In the `oa3-03` object, replace the line
`    calculatorAllowed: true,`
with
`    calculatorAllowed: false,`
and replace the line
`      conceptSummary: 'Ordered pairs created by two arithmetic patterns form a straight line with slope equal to (rate 2) / (rate 1).',`
with
`      conceptSummary: 'When two patterns both start at 0, each y is the same number of times its x. Here y is always 1.5 times x, so the points line up in a straight line.',`

- [ ] **Step 8: Fix the study guide and standard**

In `studyGuides.ts`, inside `'NC.5.OA.2'`, replace the whole `workedExample` block with:

```ts
    workedExample: {
      problem: 'Evaluate the expression: 48 ÷ (10 - 4)',
      steps: [
        '1. Parentheses first: (10 - 4) = 6. The expression is now: 48 ÷ 6',
        '2. Divide: 48 ÷ 6 = 8.'
      ],
      answer: '8',
      whyItMattersForSSA: 'Parentheses change which step comes first. Working left to right without them would give 48 ÷ 10 - 4 = 0.8, which is not the same expression.'
    }
```

In `'NC.5.OA.3'` replace
`      whyItMattersForSSA: 'SSA tests student readiness for 6th grade algebraic proportional relationships (y = kx).'`
with
`      whyItMattersForSSA: 'Seeing that every y is the same number of times its x is what makes the points line up when they are graphed.'`

In `standards.ts`, inside `NC.5.OA.2`, replace the first keyConcepts line
`          'Order of Operations: Parentheses first, then multiplication & division (left to right), then addition & subtraction (left to right)',`
with
`          'Order of Operations with parentheses and at most two operations: parentheses first, then multiplication & division (left to right), then addition & subtraction (left to right)',`

- [ ] **Step 9: Delete the orphaned tag**

`incomplete-grouping-evaluation` was used only by the old `oa2-03`. In `src/curriculum/misconceptions.ts` delete this block (keep the neighbours):

```ts
    entry(
      'incomplete-grouping-evaluation',
      'order-of-operations',
      'Evaluated only part of what was inside a grouping symbol, dropping one of the operations that belonged inside it.',
    ),
```

- [ ] **Step 10: Run tests, types and lint**

Run: `npx vitest run src/curriculum/grade5 src/curriculum/misconceptions.test.ts`
Expected: PASS. Then `npm run typecheck` and `npm run lint`: clean.

- [ ] **Step 11: Commit**

```bash
git add src/curriculum/grade5/scope.testkit.ts src/curriculum/grade5/scope.oa.test.ts src/curriculum/grade5/authored.ts src/curriculum/grade5/studyGuides.ts src/curriculum/grade5/standards.ts src/curriculum/misconceptions.ts
git commit -m "fix(grade5): OA.2 items, guide and keyConcepts stay within two operations (NC-R1)" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01X5HSDdHPWxvHxgBaoSTbLX"
```

---

### Task 2: NBT.1 and NBT.7 (NC-R3, NC-R4)

**Files:**
- Create: `src/curriculum/grade5/scope.nbt.test.ts`
- Rewrite: `src/curriculum/grade5/templates/nbt1-powers-of-ten.ts`, `src/curriculum/grade5/templates/nbt1-powers-of-ten.test.ts`
- Modify: `src/curriculum/grade5/authored.ts` (`nbt1-02`, `nbt7-04`, `nbt7-01` wording, `nbt3-02` comment)
- Modify: `src/curriculum/grade5/standards.ts` (`NC.5.NBT.1`, `NC.5.NBT.7`)
- Modify: `src/curriculum/grade5/studyGuides.ts` (`NC.5.NBT.1`, `NC.5.NBT.7`)

**Interfaces:**
- Consumes: `byId`, `keyText`, `optionFor` from `./scope.testkit` (Task 1).
- Produces: `nbt1PowersOfTen` keeps its export name and `QuestionTemplate` shape; only the moves it can draw change.

Rules covered: NC-R3, NC-R4. Findings: nbt7-04 (High), nbt1-02 and the nbt1 template (High), NBT.7 study guide (High), nbt7-01 and nbt3-02 wording (Low, one-line).

- [ ] **Step 1: Write the failing item test**

Create `src/curriculum/grade5/scope.nbt.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { GRADE_5_AUTHORED } from './authored';
import { byId, keyText, optionFor } from './scope.testkit';
import { GRADE_5_STUDY_GUIDES } from './studyGuides';
import { GRADE_5_STANDARDS } from './standards';

const nbt7 = GRADE_5_AUTHORED.filter((q) => q.standardCode === 'NC.5.NBT.7');

describe('NBT.1 (NC-R4)', () => {
  it('nbt1-02: NC-R4 divides by 100, not by 10^3, and prints no exponent', () => {
    const q = byId('nbt1-02');
    expect(q.promptDetails).toBe('47.62 ÷ 100');
    expect(JSON.stringify(q)).not.toContain('^');
    // 47.62 ÷ 100 moves the decimal 2 places left.
    expect(keyText('nbt1-02')).toBe('0.4762');
    // Multiplied by 100 instead: 4,762.
    expect(optionFor('nbt1-02', 'place-value-shift-wrong-direction')).toBe('4,762');
    const wrongPower = q.options
      .filter((o) => o.misconception === 'wrong-power-of-ten')
      .map((o) => o.text)
      .sort();
    // One place (4.762) and three places (0.04762).
    expect(wrongPower).toEqual(['0.04762', '4.762']);
  });

  it('NBT.1 standard and study guide: NC-R4 no exponent notation, divide by 10 and 100 only', () => {
    const std = GRADE_5_STANDARDS.find((s) => s.code === 'NC.5.NBT.1')!;
    const guide = GRADE_5_STUDY_GUIDES['NC.5.NBT.1'];
    expect(JSON.stringify(std)).not.toContain('^');
    expect(JSON.stringify(guide)).not.toContain('^');
    expect(std.keyConcepts.join(' ')).toMatch(/Dividing by 10 or 100/);
    expect(guide.rulesAndFormulas.map((r) => r.label)).toContain('Multiplying by 0.1 or 0.01');
    expect(guide.workedExample.whyItMattersForSSA).not.toMatch(/calculator-inactive/i);
  });
});

describe('NBT.7 (NC-R3)', () => {
  it('nbt7-04: NC-R3 divides a whole number by a decimal, 6 ÷ 0.25', () => {
    const q = byId('nbt7-04');
    expect(q.prompt).toContain('6 meters');
    expect(q.prompt).toContain('0.25 meter');
    expect(keyText('nbt7-04')).toBe(`${6 / 0.25} bows`);
    // Shifted the divisor to 25 but left the dividend at 6.
    expect(optionFor('nbt7-04', 'decimal-point-misplaced')).toBe(`${6 / 25} bows`);
    // Shifted the divisor one place (2.5) instead of two.
    expect(optionFor('nbt7-04', 'wrong-power-of-ten')).toBe(`${6 / 2.5} bows`);
    // Multiplied instead of dividing.
    expect(optionFor('nbt7-04', 'multiplied-instead-of-divided')).toBe(`${6 * 0.25} bows`);
    expect(q.isStretch).toBe(false);
  });

  it('NC-R3: no NBT.7 item divides a decimal by a decimal', () => {
    for (const q of nbt7) {
      const text = `${q.prompt} ${q.promptDetails ?? ''}`;
      expect(text, q.id).not.toMatch(/\d\.\d+\s*÷\s*\d*\.\d+/);
    }
  });

  it('NBT.7 study guide and standard: NC-R3 whole ÷ decimal and decimal ÷ whole only', () => {
    const guide = GRADE_5_STUDY_GUIDES['NC.5.NBT.7'];
    const std = GRADE_5_STANDARDS.find((s) => s.code === 'NC.5.NBT.7')!;
    const guideText = JSON.stringify(guide);
    expect(guideText).toMatch(/whole number by a decimal/);
    expect(guideText).not.toMatch(/Divisor must be whole|decimal by a decimal/);
    expect(JSON.stringify(std)).toMatch(/repeated subtraction or area models/);
    expect(JSON.stringify(std)).not.toMatch(/shift decimal in divisor/);
  });

  it('nbt7-01: the misconception text describes the distractor it names (audit Low)', () => {
    const text = byId('nbt7-01').explanation.commonMisconception ?? '';
    expect(text).toContain('67.25');
    expect(text).not.toContain('.85');
    // 80.40 - 27.65 taking the smaller digit from the larger in every column.
    expect(optionFor('nbt7-01', 'subtracted-without-regrouping')).toBe('67.25');
  });
});

describe('NBT content versions', () => {
  it('rewritten NBT items carry contentVersion 2; untouched NBT items do not', () => {
    for (const id of ['nbt1-02', 'nbt7-04']) expect(byId(id).contentVersion, id).toBe(2);
    for (const id of ['nbt1-01', 'nbt1-03', 'nbt3-02', 'nbt7-01', 'nbt7-02', 'nbt7-03']) {
      expect(byId(id).contentVersion ?? 1, id).toBe(1);
    }
  });
});
```

- [ ] **Step 2: Rewrite the nbt1 template test (fails against the old generator)**

Replace the whole content of `src/curriculum/grade5/templates/nbt1-powers-of-ten.test.ts` with:

```ts
import { describe, it, expect } from 'vitest';
import { makeRng } from '../../../engine/rng';
import { assertTemplateSound } from '../../../engine/templateTesting';
import { nbt1PowersOfTen } from './nbt1-powers-of-ten';

/** Independent decimal formatter, written from scratch here so this test
 *  cannot inherit a bug from the generator's own helper. */
function shift(digits: string, exponent: number): string {
  if (exponent >= 0) return digits + '0'.repeat(exponent);
  const places = -exponent;
  const padded = digits.length <= places ? '0'.repeat(places - digits.length + 1) + digits : digits;
  const cut = padded.length - places;
  return `${padded.slice(0, cut)}.${padded.slice(cut)}`;
}

/** NC.5.NBT.1 (NC-R4) names exactly these moves: multiply by 1,000, 100, 10,
 *  0.1 and 0.01, divide by 10 and 100. The value is how many places the
 *  digits' value moves (positive = larger). Restated here, not imported. */
const ALLOWED_MOVES = new Map<string, number>([
  ['× 1,000', 3],
  ['× 100', 2],
  ['× 10', 1],
  ['× 0.1', -1],
  ['× 0.01', -2],
  ['÷ 10', -1],
  ['÷ 100', -2],
]);

function parse(details: string) {
  const m = details.match(/^([\d.]+) ([×÷]) ([\d.,]+)$/);
  if (!m) throw new Error(`unparsable promptDetails: ${details}`);
  const [, base, op, label] = m;
  const digits = base.replace('.', '');
  const places = base.length - base.indexOf('.') - 1;
  const move = `${op} ${label}`;
  const k = ALLOWED_MOVES.get(move);
  if (k === undefined) throw new Error(`out-of-scope move "${move}" in ${details}`);
  return { digits, places, move, k };
}

const optionText = (g: ReturnType<typeof nbt1PowersOfTen.generate>, tag: string): string => {
  const opt = g.options.find((o) => o.misconception === tag);
  if (!opt) throw new Error(`no option tagged ${tag}`);
  return opt.text;
};

describe('nbt1PowersOfTen', () => {
  it('satisfies every template invariant across 500 seeds', () => {
    assertTemplateSound(nbt1PowersOfTen, { runs: 500 });
  });

  it('is deterministic in its seed', () => {
    const a = nbt1PowersOfTen.generate(makeRng(777));
    const b = nbt1PowersOfTen.generate(makeRng(777));
    expect(a).toEqual(b);
  });

  it('nbt1 template: NC-R4 only the seven NC moves, never 10^n, and every move is reached', () => {
    const seen = new Set<string>();
    for (let seed = 0; seed < 500; seed++) {
      const g = nbt1PowersOfTen.generate(makeRng(seed));
      expect(JSON.stringify(g), `seed ${seed}: exponent notation`).not.toContain('^');
      const m = (g.promptDetails ?? '').match(/^[\d.]+ ([×÷] [\d.,]+)$/);
      expect(m, `seed ${seed}: ${g.promptDetails}`).toBeTruthy();
      const move = m![1];
      expect(ALLOWED_MOVES.has(move), `seed ${seed}: "${move}" is outside NC.5.NBT.1`).toBe(true);
      seen.add(move);
    }
    expect([...seen].sort()).toEqual([...ALLOWED_MOVES.keys()].sort());
  });

  it('changes only place value: every option keeps the same significant digits', () => {
    // NC.5.NBT.1 is about the decimal point moving, not about the digits
    // changing. An option whose digits differ would be a different kind of
    // error and would let a student eliminate it without reasoning about
    // place value at all.
    for (let seed = 0; seed < 200; seed++) {
      const g = nbt1PowersOfTen.generate(makeRng(seed));
      const { digits } = parse(g.promptDetails ?? '');
      for (const o of g.options) {
        const bare = o.text.replace('.', '').replace(/^0+/, '').replace(/0+$/, '');
        expect(bare, `seed ${seed}: option ${o.text} against base digits ${digits}`).toBe(digits);
      }
      expect(new Set(g.options.map((o) => o.text)).size).toBe(4);
    }
  });

  it('the last step states the answer and the direction matches the size change', () => {
    for (let seed = 0; seed < 200; seed++) {
      const g = nbt1PowersOfTen.generate(makeRng(seed));
      const { k } = parse(g.promptDetails ?? '');
      const steps = g.explanation.stepByStep.join(' ');
      expect(steps, `seed ${seed}`).toContain(k > 0 ? 'makes the number larger' : 'makes the number smaller');
      expect(steps, `seed ${seed}`).toContain(k > 0 ? 'to the left' : 'to the right');
    }
  });

  describe('every distractor value matches the error its tag names', () => {
    for (const seed of [1, 17, 205, 4912, 99991]) {
      it(`seed ${seed}`, () => {
        const g = nbt1PowersOfTen.generate(makeRng(seed));
        const { digits, places, k } = parse(g.promptDetails ?? '');
        const s = Math.sign(k);

        // Answer: the digits shift k places (left when the number grows).
        expect(g.answerText).toBe(shift(digits, -places + k));
        // Shifted the same distance the other way.
        expect(optionText(g, 'place-value-shift-wrong-direction')).toBe(shift(digits, -places - k));
        // Right direction, one place short.
        expect(optionText(g, 'decimal-point-misplaced')).toBe(shift(digits, -places + k - s));
        // Right direction, one place too far.
        expect(optionText(g, 'wrong-power-of-ten')).toBe(shift(digits, -places + k + s));
      });
    }
  });
});
```

- [ ] **Step 3: Run both to verify they fail**

Run: `npx vitest run src/curriculum/grade5/scope.nbt.test.ts src/curriculum/grade5/templates/nbt1-powers-of-ten.test.ts`
Expected: FAIL. The template prints `10^e`, so `parse` throws or the exponent check fails; nbt1-02 still shows `10^3`.

- [ ] **Step 4: Rewrite the nbt1 generator**

Replace the whole content of `src/curriculum/grade5/templates/nbt1-powers-of-ten.ts` with:

```ts
import type { Rng } from '../../../engine/rng';
import type { QuestionTemplate, GeneratedQuestion } from '../../../engine/template';
import { labelOptions } from '../../../engine/questionModel';
import { decimalString } from './decimalFormat';

/** One multiplier or divisor NC.5.NBT.1 names, and `k`, the signed number of
 *  places the number's digits move: positive moves them left (the number
 *  grows), negative moves them right (the number shrinks). */
interface Move {
  op: '×' | '÷';
  label: string;
  k: number;
}

/**
 * NC-R4: "multiplied by 1,000, 100, 10, 0.1, and 0.01 and/or divided by 10
 * and 100". Nothing else is drawn: no division by 1,000, none by 0.1 or 0.01,
 * and no exponent notation.
 */
const MOVES: readonly Move[] = [
  { op: '×', label: '1,000', k: 3 },
  { op: '×', label: '100', k: 2 },
  { op: '×', label: '10', k: 1 },
  { op: '×', label: '0.1', k: -1 },
  { op: '×', label: '0.01', k: -2 },
  { op: '÷', label: '10', k: -1 },
  { op: '÷', label: '100', k: -2 },
];

/**
 * NC.5.NBT.1 — multiplying or dividing by a power of ten shifts every digit
 * by that many places.
 *
 * Every value in the item is `digits × 10^e` for the SAME three digits, so
 * two options are equal exactly when their exponents are equal. With the
 * signed shift k of the drawn move (k is 1, 2 or 3 in size, never 0) and
 * s = sign of k, the four exponents are
 *
 *   answer      -p + k
 *   wrong way   -p - k
 *   one short   -p + k - s
 *   one too far -p + k + s
 *
 * and no two of those can coincide: k = -k needs k = 0; k = k ± s needs
 * s = 0; k - s = k + s needs s = 0; and k ± s = -k needs k = ∓1/2. Every
 * case is impossible for a non-zero integer k, so the four options are
 * distinct by construction at every seed, with no constraint on the digits.
 */
export const nbt1PowersOfTen: QuestionTemplate = {
  id: 'g5.nbt1.powers-of-ten',
  standardCode: 'NC.5.NBT.1',
  domainId: 'NBT',
  difficulty: 'mastery',
  calculatorAllowed: false,
  isStretch: false,

  generate(rng: Rng): GeneratedQuestion {
    // Draw the digits individually so the leading and trailing digits are
    // never zero: a base like 4.50 or 0.56 would print with a zero that
    // reads as a magnitude change rather than a digit.
    const d1 = rng.int(1, 9);
    const d2 = rng.int(0, 9);
    const d3 = rng.int(1, 9);
    const digits = d1 * 100 + d2 * 10 + d3;

    const places = rng.pick([1, 2]); // 45.6 or 4.56
    const { op, label, k } = rng.pick(MOVES);
    const s = Math.sign(k);
    const n = Math.abs(k);
    const larger = k > 0;

    const answer = decimalString(digits, -places + k);
    const wrongDirection = decimalString(digits, -places - k);
    // One place short of the required shift. At |k| = 1 this is the starting
    // number itself, which is exactly what a student who moves "no places"
    // writes down, so it stays an honest value for the tag.
    const oneShort = decimalString(digits, -places + k - s);
    const oneTooFar = decimalString(digits, -places + k + s);

    const base = decimalString(digits, -places);

    const candidates = [
      { text: answer, isCorrect: true },
      { text: wrongDirection, isCorrect: false, misconception: 'place-value-shift-wrong-direction' },
      { text: oneShort, isCorrect: false, misconception: 'decimal-point-misplaced' },
      { text: oneTooFar, isCorrect: false, misconception: 'wrong-power-of-ten' },
    ];

    // Distinct by construction (see the argument above); a collision would
    // mean a distractor's tag no longer names the error that produced it, so
    // fail loudly rather than patching the value.
    const texts = candidates.map((c) => c.text);
    if (new Set(texts).size !== texts.length) {
      throw new Error(`g5.nbt1.powers-of-ten: option collision [${texts.join(' | ')}]`);
    }

    const plural = n === 1 ? '' : 's';
    const verb = op === '×' ? 'Multiplying' : 'Dividing';

    return {
      prompt: 'Find the value of this expression.',
      promptDetails: `${base} ${op} ${label}`,
      options: labelOptions(rng.shuffle(candidates)),
      answerText: answer,
      explanation: {
        stepByStep: [
          `Step 1: ${verb} by ${label} makes the number ${larger ? 'larger' : 'smaller'}.`,
          `Step 2: Every digit moves ${n} place${plural} to the ${larger ? 'left' : 'right'}, so the decimal point moves ${n} place${plural} to the ${larger ? 'right' : 'left'}.`,
          `Step 3: The digits ${d1}, ${d2}, ${d3} stay in that order; only their place values change.`,
          `Step 4: ${base} ${op} ${label} = ${answer}.`,
        ],
        conceptSummary:
          'A power of ten never changes a number’s digits — it only changes what each digit is worth. Decide which way the value should move first, then count the places.',
        commonMisconception:
          'Checking the direction first catches a wrong-way answer: multiplying by 10, 100 or 1,000 makes the number larger, while multiplying by 0.1 or 0.01 and dividing by 10 or 100 make it smaller.',
      },
    };
  },
};
```

- [ ] **Step 5: Rewrite `nbt1-02` and `nbt7-04` in `authored.ts`**

Replace the whole object with `id: 'nbt1-02'` with:

```ts
  {
    id: 'nbt1-02',
    standardCode: 'NC.5.NBT.1',
    domainId: 'NBT',
    prompt: 'What is the value of the expression below?',
    promptDetails: '47.62 ÷ 100',
    options: labelOptions([
      // Multiplied by 100 instead of dividing: moved the decimal 2 places right.
      { text: '4,762', isCorrect: false, misconception: 'place-value-shift-wrong-direction' },
      // Moved the decimal left only 1 place.
      { text: '4.762', isCorrect: false, misconception: 'wrong-power-of-ten' },
      // Moved the decimal left 3 places.
      { text: '0.04762', isCorrect: false, misconception: 'wrong-power-of-ten' },
      // Key: 47.62 -> 4.762 (1 place) -> 0.4762 (2 places).
      { text: '0.4762', isCorrect: true },
    ]),
    calculatorAllowed: false,
    isStretch: false,
    difficulty: 'mastery',
    contentVersion: 2,
    explanation: {
      stepByStep: [
        'Step 1: 100 has two zeros, so dividing by 100 moves every digit 2 places to the right (the decimal point moves 2 places to the left).',
        'Step 2: 47.62 -> 4.762 (1 place) -> 0.4762 (2 places).',
        'Step 3: 47.62 ÷ 100 = 0.4762.'
      ],
      conceptSummary: 'Dividing by 10 or 100 moves the decimal point 1 or 2 places to the left, inserting a leading zero when needed.',
      commonMisconception: 'Moving the decimal 1 place or 3 places instead of 2, or moving it to the right instead of the left.'
    }
  },
```

Replace the whole object with `id: 'nbt7-04'` with:

```ts
  {
    id: 'nbt7-04',
    standardCode: 'NC.5.NBT.7',
    domainId: 'NBT',
    prompt: 'A roll holds 6 meters of ribbon. Each bow uses 0.25 meter of ribbon. How many bows can be made from the roll?',
    options: labelOptions([
      // 6 × 0.25 = 1.5: multiplied instead of dividing.
      { text: '1.5 bows', isCorrect: false, misconception: 'multiplied-instead-of-divided' },
      // Shifted the divisor to 25 but left the dividend at 6: 6 ÷ 25 = 0.24.
      { text: '0.24 bows', isCorrect: false, misconception: 'decimal-point-misplaced' },
      // Key: 6 ÷ 0.25 = 600 ÷ 25 = 24.
      { text: '24 bows', isCorrect: true },
      // Shifted the divisor one place (2.5) instead of two: 6 ÷ 2.5 = 2.4.
      { text: '2.4 bows', isCorrect: false, misconception: 'wrong-power-of-ten' },
    ]),
    calculatorAllowed: false,
    isStretch: false,
    difficulty: 'advanced',
    contentVersion: 2,
    explanation: {
      stepByStep: [
        'Step 1: The question asks how many 0.25-meter pieces fit into 6 meters: 6 ÷ 0.25.',
        'Step 2: 0.25 is one fourth, so 1 meter holds 4 bows (0.25 + 0.25 + 0.25 + 0.25 = 1).',
        'Step 3: 6 meters hold 6 × 4 = 24 bows. Repeated subtraction agrees: taking 0.25 away from 6 twenty-four times leaves 0.',
        'Step 4: 6 ÷ 0.25 = 24 bows.'
      ],
      conceptSummary: 'Dividing a whole number by a decimal asks how many of the decimal fit into the whole. Repeated subtraction or an area model shows it.',
      commonMisconception: 'Dividing 6 by 25 without also moving the decimal point in the dividend, which gives 0.24 instead of 24.'
    }
  },
```

- [ ] **Step 6: One-line wording fixes in `authored.ts`**

In `nbt7-01`, replace
`      commonMisconception: 'Subtracting 0 - 5 = 5 without regrouping, giving .85 or .25.'`
with
`      commonMisconception: 'Taking the smaller digit from the larger in every column (0 and 5 give 5) instead of regrouping, which gives 67.25.'`

In `nbt3-02`, replace
`      // Counted three placeholder zeros for "thousandths" before writing the 45.`
with
`      // Wrote two placeholder zeros before the 45 (one too many), as if it were ten-thousandths.`

- [ ] **Step 7: Fix `standards.ts`**

In `NC.5.NBT.1`, replace the `description` line with
`        description: 'Recognize place value patterns from one million to thousandths; 10x and 1/10 relationships; patterns when multiplying by 1,000, 100, 10, 0.1 and 0.01 and dividing by 10 and 100.',`
and replace the last two keyConcepts
```
          'Multiplying by 10^n moves the decimal point n places to the right',
          'Dividing by 10^n moves the decimal point n places to the left'
```
with
```
          'Multiplying by 10, 100 or 1,000 moves the decimal point 1, 2 or 3 places to the right; multiplying by 0.1 or 0.01 moves it 1 or 2 places to the left',
          'Dividing by 10 or 100 moves the decimal point 1 or 2 places to the left'
```
In `NC.5.NBT.7`, replace the `description` line with
`        description: 'Add, subtract, multiply, and divide multi-digit whole numbers and decimals (divide a whole number by a decimal, or a decimal by a whole number, to hundredths); use estimation to check reasonableness.',`
and replace the keyConcept
`          'Dividing decimals: shift decimal in divisor to make it whole, shift dividend by same amount',`
with
`          'Dividing a whole number by a decimal, or a decimal by a whole number, with decimals to hundredths, using repeated subtraction or area models',`

- [ ] **Step 8: Fix `studyGuides.ts`**

In `'NC.5.NBT.1'`, replace the two rules
```
      { label: 'Multiplying by 10^n', detail: 'Shifts all digits n places to the left (decimal moves n places right).' },
      { label: 'Dividing by 10^n', detail: 'Shifts all digits n places to the right (decimal moves n places left).' }
```
with
```
      { label: 'Multiplying by 10, 100 or 1,000', detail: 'Shifts all digits 1, 2 or 3 places to the left (the decimal point moves 1, 2 or 3 places right).' },
      { label: 'Multiplying by 0.1 or 0.01', detail: 'Shifts all digits 1 or 2 places to the right (the decimal point moves 1 or 2 places left), so the number gets smaller.' },
      { label: 'Dividing by 10 or 100', detail: 'Shifts all digits 1 or 2 places to the right (the decimal point moves 1 or 2 places left).' }
```
and replace
`      whyItMattersForSSA: 'Foundational place value reasoning appears throughout calculator-inactive sections.'`
with
`      whyItMattersForSSA: 'Every decimal and whole-number operation this year depends on knowing what a digit is worth in each place.'`

In `'NC.5.NBT.7'`, replace the rule
`      { label: 'Dividing by a Decimal', detail: 'Multiply both divisor and dividend by 10, 100, etc. so the divisor becomes a whole number before dividing.' }`
with
`      { label: 'Dividing with Decimals', detail: 'Grade 5 divides a whole number by a decimal (6 ÷ 0.25 asks how many 0.25s fit in 6) or a decimal by a whole number (4.5 ÷ 3), with decimals to hundredths. Use repeated subtraction or an area model.' }`
and replace the step
`      'Division: Divisor must be whole. Shift decimal right in divisor, shift dividend same number of places -> divide -> place decimal straight up into quotient.'`
with
`      'Division: Whole number ÷ decimal or decimal ÷ whole number (hundredths only) -> ask how many of the divisor fit in the dividend -> use repeated subtraction, an area model, or a place-value strategy -> check by multiplying back.'`

- [ ] **Step 9: Run tests, types and lint**

Run: `npx vitest run src/curriculum/grade5 src/curriculum/misconceptions.test.ts`
Expected: PASS (the nbt1 template still emits only tags that exist). Then `npm run typecheck` and `npm run lint`: clean.

- [ ] **Step 10: Commit**

```bash
git add src/curriculum/grade5/scope.nbt.test.ts src/curriculum/grade5/templates/nbt1-powers-of-ten.ts src/curriculum/grade5/templates/nbt1-powers-of-ten.test.ts src/curriculum/grade5/authored.ts src/curriculum/grade5/standards.ts src/curriculum/grade5/studyGuides.ts
git commit -m "fix(grade5): NBT.1 and NBT.7 follow NC moves and whole/decimal division (NC-R3, NC-R4)" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01X5HSDdHPWxvHxgBaoSTbLX"
```

---

### Task 3: Fractions (NC-R6, NC-R7, NC-R8)

**Files:**
- Create: `src/curriculum/grade5/scope.nf.test.ts`
- Modify: `src/curriculum/grade5/templates/nf1-add-unlike.ts`, `nf1-add-unlike.test.ts`
- Modify: `src/curriculum/grade5/templates/nf4-multiply-fractions.ts`, `nf4-multiply-fractions.test.ts`
- Modify: `src/curriculum/grade5/authored.ts` (`nf1-01`, `nf1-02`, `nf1-04`, `nf4-02`, `nf4-03`, `nf7-03`)
- Modify: `src/curriculum/grade5/standards.ts` (`NC.5.NF.1`, `NC.5.NF.4`)
- Modify: `src/curriculum/grade5/studyGuides.ts` (`NC.5.NF.1` entry)
- Modify: `src/curriculum/misconceptions.ts` (delete `converted-only-second-fraction`, `computed-exactly-instead-of-estimating`)

**Interfaces:**
- Consumes: `byId`, `keyText`, `optionFor`, `denominatorsIn`, `inOneFamily` from `./scope.testkit`.
- Produces: `nf1AddUnlike` and `nf4MultiplyFractions` keep their exports and shapes.

Rules covered: NC-R6, NC-R7, NC-R8. Findings: nf1-01, nf1-02, nf1-04 and the nf1 template (High/Medium), nf4 template and nf4-03 (Medium), nf7-03 (High), NF.1 study guide (High and Medium claim). Beyond the audit: `nf4-02` is fraction × whole number with `7/9`; NC-R7 allows denominators 2, 3, 4, 5, 6, 8, 10, 12 there, and 9 is not among them, so it becomes `7/8`.

- [ ] **Step 1: Write the failing item test**

Create `src/curriculum/grade5/scope.nf.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { byId, keyText, optionFor, denominatorsIn, inOneFamily } from './scope.testkit';
import { GRADE_5_STUDY_GUIDES } from './studyGuides';
import { GRADE_5_STANDARDS } from './standards';

const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b));

/** n/d as a simplified mixed number: 35/8 gives "4 3/8". */
function mixed(n: number, d: number): string {
  const g = gcd(n, d);
  const num = n / g;
  const den = d / g;
  const whole = Math.floor(num / den);
  const rem = num % den;
  if (rem === 0) return `${whole}`;
  return whole === 0 ? `${rem}/${den}` : `${whole} ${rem}/${den}`;
}

/** n/d as a simplified fraction, left improper: 18/8 gives "9/4". */
function fraction(n: number, d: number): string {
  const g = gcd(n, d);
  return d / g === 1 ? `${n / g}` : `${n / g}/${d / g}`;
}

/** True when a fraction or mixed-number option text is in simplest form. */
function inSimplestForm(text: string): boolean {
  const m = /(\d+)\/(\d+)/.exec(text);
  if (!m) return true;
  return gcd(Number(m[1]), Number(m[2])) === 1 && Number(m[1]) < Number(m[2]);
}

describe('NF.1 (NC-R6 related fractions)', () => {
  it('nf1-01: NC-R6 2 3/4 + 1 5/8 stays in halves/fourths/eighths; key and distractors follow their tags', () => {
    const q = byId('nf1-01');
    expect(q.promptDetails).toBe('2 3/4 + 1 5/8');
    // 2 3/4 = 22/8 and 1 5/8 = 13/8, so the sum is 35/8.
    expect(keyText('nf1-01')).toBe(mixed(22 + 13, 8));
    // (3 + 5)/(4 + 8) = 8/12, wholes 2 + 1.
    expect(optionFor('nf1-01', 'added-numerators-and-denominators')).toBe(mixed(3 * 12 + 8, 12));
    // Denominator changed to 8, numerator 3 left alone: 3/8 + 5/8 = 8/8.
    expect(optionFor('nf1-01', 'common-denominator-numerator-not-scaled')).toBe(mixed(3 * 8 + 8, 8));
    // Doubled the numerator of the fraction already in eighths: (3 + 10)/8.
    expect(optionFor('nf1-01', 'scaled-the-wrong-addend')).toBe(mixed(3 * 8 + 13, 8));
  });

  it('nf1-02: NC-R6 6 1/4 - 2 5/8 stays in one family; key and distractors follow their tags', () => {
    const q = byId('nf1-02');
    expect(q.promptDetails).toBe('6 1/4 - 2 5/8');
    // 6 1/4 = 50/8 and 2 5/8 = 21/8.
    expect(keyText('nf1-02')).toBe(mixed(50 - 21, 8));
    // No regrouping: 6 - 2 and 5/8 - 2/8.
    expect(optionFor('nf1-02', 'forgot-to-regroup')).toBe(mixed(4 * 8 + 3, 8));
    // 6 1/8 - 2 5/8 (1/4 written as 1/8): 49/8 - 21/8.
    expect(optionFor('nf1-02', 'common-denominator-numerator-not-scaled')).toBe(mixed(49 - 21, 8));
    // Regrouped to 6 10/8 without lowering the 6: 58/8 - 21/8.
    expect(optionFor('nf1-02', 'borrowed-without-reducing-the-whole')).toBe(mixed(58 - 21, 8));
  });

  it('nf1-04: NC-R6 7/12 + 5/6 estimate, and no option is the exact sum (audit nf1-04)', () => {
    const q = byId('nf1-04');
    expect(q.prompt).toContain('7/12 + 5/6');
    expect(keyText('nf1-04')).toBe('1 1/2');
    // Rounded one addend to the wrong benchmark: 1/2 + 1/2 and 1 + 1.
    const wrongBenchmark = q.options
      .filter((o) => o.misconception === 'estimated-to-the-wrong-benchmark')
      .map((o) => o.text)
      .sort();
    expect(wrongBenchmark).toEqual(['1', '2']);
    // Added straight across: (7 + 5)/(12 + 6).
    expect(optionFor('nf1-04', 'added-numerators-and-denominators')).toBe(fraction(7 + 5, 12 + 6));
    // 7/12 + 5/6 = 17/12 exactly; offering it would make a second defensible answer.
    const exactSum = mixed(7 + 10, 12);
    expect(q.options.map((o) => o.text)).not.toContain(exactSum);
  });

  it.each(['nf1-01', 'nf1-02', 'nf1-03', 'nf1-04'])(
    '%s: NC-R6 every denominator sits in one related family',
    (id) => {
      const q = byId(id);
      const dens = denominatorsIn(`${q.prompt} ${q.promptDetails ?? ''}`);
      expect(dens.length).toBeGreaterThan(0);
      expect(inOneFamily(dens), `${id}: ${dens.join(', ')}`).toBe(true);
    },
  );

  it.each(['nf1-01', 'nf1-02', 'nf1-04'])('%s: every fraction option is in simplest form', (id) => {
    for (const o of byId(id).options) expect(inSimplestForm(o.text), `${id}: ${o.text}`).toBe(true);
  });

  it('NF.1 study guide and standard: NC-R6 related denominators, no unsupported ranking claim', () => {
    const guide = GRADE_5_STUDY_GUIDES['NC.5.NF.1'];
    expect(inOneFamily(denominatorsIn(guide.workedExample.problem))).toBe(true);
    const text = JSON.stringify(guide);
    expect(text).not.toMatch(/#1|LCM is 12|for 4 and 6/);
    expect(text).toContain('Related Denominators');
    const std = GRADE_5_STANDARDS.find((s) => s.code === 'NC.5.NF.1')!;
    expect(std.keyConcepts[0]).toMatch(/Related denominators/);
  });
});

describe('NF.4 (NC-R7 denominators 2, 3, 4 for fraction × fraction)', () => {
  it('nf4-03: NC-R7 3/4 × 2/3, key and distractors follow their tags', () => {
    const q = byId('nf4-03');
    expect(q.prompt).toContain('3/4 × 2/3');
    expect(keyText('nf4-03')).toBe(fraction(3 * 2, 4 * 3));
    expect(optionFor('nf4-03', 'added-numerators-and-denominators')).toBe(fraction(3 + 2, 4 + 3));
    // Numerator of each times the denominator of the other: (3 × 3)/(4 × 2).
    expect(optionFor('nf4-03', 'multiplied-crosswise')).toBe(fraction(3 * 3, 4 * 2));
    // Common denominator 12 and added: 9/12 + 8/12.
    expect(optionFor('nf4-03', 'added-instead-of-multiplied')).toBe(fraction(9 + 8, 12));
  });

  it('NC-R7: fraction × fraction items use only denominators 2, 3, 4', () => {
    for (const id of ['nf4-01', 'nf4-03']) {
      const q = byId(id);
      const dens = denominatorsIn(`${q.prompt} ${q.promptDetails ?? ''}`);
      for (const d of dens) expect([2, 3, 4], `${id}: denominator ${d}`).toContain(d);
    }
  });

  it('nf4-02: NC-R7 fraction × whole number uses 7/8, an allowed denominator', () => {
    const q = byId('nf4-02');
    expect(JSON.stringify(q)).not.toContain('7/9');
    expect(q.prompt).toContain('16 × 7/8');
    for (const d of denominatorsIn(q.prompt)) expect([2, 3, 4, 5, 6, 8, 10, 12]).toContain(d);
  });

  it('NF.4 standard: NC-R7 states the denominator limits', () => {
    const std = GRADE_5_STANDARDS.find((s) => s.code === 'NC.5.NF.4')!;
    expect(std.keyConcepts.join(' ')).toMatch(/denominators 2, 3 and 4/);
  });
});

describe('NF.7 (NC-R8 one step, unit fractions only)', () => {
  it('nf7-03: NC-R8 5 ÷ 1/6 word problem, key and distractors follow their tags', () => {
    const q = byId('nf7-03');
    expect(q.prompt).not.toMatch(/Above-Grade|\[/);
    // Every fraction in the prompt is a unit fraction.
    for (const m of q.prompt.matchAll(/(\d+)\/\d+/g)) expect(m[1]).toBe('1');
    expect(q.prompt).toContain('5 yards');
    expect(q.prompt).toContain('1/6 yard');
    expect(keyText('nf7-03')).toBe(`${5 * 6} pieces`);
    // Found how many fit in 1 yard and never scaled to 5 yards.
    expect(optionFor('nf7-03', 'forgot-to-scale-by-the-whole-number')).toBe('6 pieces');
    // 5 × 1/6.
    expect(optionFor('nf7-03', 'multiplied-instead-of-divided')).toBe(`${fraction(5, 6)} of a piece`);
    // (1/6) ÷ 5.
    expect(optionFor('nf7-03', 'inverted-wrong-factor')).toBe(`${fraction(1, 6 * 5)} of a piece`);
    expect(JSON.stringify(q.explanation)).not.toMatch(/6th grade|reciprocal/i);
    expect(q.isStretch).toBe(false);
  });
});

describe('NF content versions', () => {
  it('rewritten NF items carry contentVersion 2; untouched NF items do not', () => {
    for (const id of ['nf1-01', 'nf1-02', 'nf1-04', 'nf4-02', 'nf4-03', 'nf7-03']) {
      expect(byId(id).contentVersion, id).toBe(2);
    }
    for (const id of ['nf1-03', 'nf3-01', 'nf3-02', 'nf4-01', 'nf7-01', 'nf7-02']) {
      expect(byId(id).contentVersion ?? 1, id).toBe(1);
    }
  });
});
```

- [ ] **Step 2: Add the failing template tests**

In `src/curriculum/grade5/templates/nf1-add-unlike.test.ts`, inside the top-level `describe('nf1AddUnlike', ...)` and directly after the existing test `'always uses related denominators, as NC.5.NF.1 requires'`, add:

```ts
  it('nf1 template: NC-R6 draws denominators only from the three NC families and reaches every pair', () => {
    // Audit: 55% of sampled instances were unrelated (2 and 6, 3 and 9, 4 and 12,
    // 4 and 16, 5 and 15, 5 and 20, 6 and 18, 6 and 24).
    const families = [
      [2, 4, 8],
      [3, 6, 12],
      [5, 10, 100],
    ];
    const seen = new Set<string>();
    for (let seed = 0; seed < 500; seed++) {
      const g = nf1AddUnlike.generate(makeRng(seed));
      const dens = [...(g.promptDetails ?? '').matchAll(/\d+\/(\d+)/g)].map((m) => Number(m[1]));
      expect(dens).toHaveLength(2);
      expect(
        families.some((f) => dens.every((d) => f.includes(d))),
        `seed ${seed}: ${dens.join(' and ')} are not in one NC family`,
      ).toBe(true);
      seen.add([...dens].sort((a, b) => a - b).join('/'));
    }
    expect([...seen].sort()).toEqual(
      ['10/100', '2/4', '2/8', '3/12', '3/6', '4/8', '5/10', '5/100', '6/12'].sort(),
    );
  });

  it('nf1 template: options stay distinct and the key is right over 500 seeds', () => {
    assertTemplateSound(nf1AddUnlike, { runs: 500 });
  });
```

In `src/curriculum/grade5/templates/nf4-multiply-fractions.test.ts` replace the whole test
`it('multiplies two proper fractions with grade 5 denominators', ...)` with:

```ts
  it('nf4 template: NC-R7 multiplies two proper fractions with denominators 2, 3 and 4 only', () => {
    // NC.5.NF.4: "Use area and length models to multiply two fractions, with
    // the denominators 2, 3, 4." Both factors stay proper so the product is
    // smaller than either one, the idea the standard is really about.
    const allowed = new Set([2, 3, 4]);
    const seen = new Set<number>();
    for (let seed = 0; seed < 500; seed++) {
      const g = nf4MultiplyFractions.generate(makeRng(seed));
      const { n1, d1, n2, d2 } = parse(g.promptDetails ?? '');
      expect(allowed.has(d1), `seed ${seed}: d1 = ${d1}`).toBe(true);
      expect(allowed.has(d2), `seed ${seed}: d2 = ${d2}`).toBe(true);
      seen.add(d1);
      seen.add(d2);
      expect(n1).toBeGreaterThanOrEqual(1);
      expect(n1).toBeLessThan(d1);
      expect(n2).toBeGreaterThanOrEqual(1);
      expect(n2).toBeLessThan(d2);
      // The mediant and the cross-product are the one pair that can
      // coincide; those draws must never be reachable.
      expect((n1 + n2) * d1 * n2, `seed ${seed}`).not.toBe((d1 + d2) * n1 * d2);
    }
    expect([...seen].sort()).toEqual([2, 3, 4]);
  });
```

- [ ] **Step 3: Run to verify failures**

Run: `npx vitest run src/curriculum/grade5/scope.nf.test.ts src/curriculum/grade5/templates/nf1-add-unlike.test.ts src/curriculum/grade5/templates/nf4-multiply-fractions.test.ts`
Expected: FAIL on the family test (the old generator emits 2 and 6, and so on), the nf4 denominator test (5, 6, 8 appear), and every rewritten item.

- [ ] **Step 4: Constrain the nf1 generator**

In `src/curriculum/grade5/templates/nf1-add-unlike.ts`, insert directly above `export const nf1AddUnlike`:

```ts
/**
 * NC-R6: "using related fractions: halves, fourths and eighths; thirds,
 * sixths, and twelfths; fifths, tenths, and hundredths". Every pair below is
 * two denominators from one family where the larger is a multiple of the
 * smaller, so the larger one is the common denominator.
 *
 * The four options stay distinct by construction. With small denominator s,
 * large denominator L = f * s, numerators a (over s) and b (over L), and
 * a != b: the answer is (f*a + b)/L, the added-across value is
 * (a + b)/(s + L), the not-scaled value is (a + b)/L and the wrong-addend
 * value is (a + f*b)/L. Setting any two equal and clearing denominators leaves
 * a positive term equal to zero, except answer = wrong-addend, which needs
 * (f - 1)(b - a) = 0, and a != b is enforced below.
 */
const RELATED_PAIRS: ReadonlyArray<readonly [number, number]> = [
  [2, 4],
  [2, 8],
  [4, 8],
  [3, 6],
  [3, 12],
  [6, 12],
  [5, 10],
  [5, 100],
  [10, 100],
];

```

Then replace these lines inside `generate`:

```ts
    // NC.5.NF.1 restricts grade 5 to related denominators, so build the
    // larger denominator as a multiple of the smaller one.
    const dSmall = rng.pick([2, 3, 4, 5, 6]);
    const factor = rng.int(2, 4);
    const dLarge = dSmall * factor;
```

with:

```ts
    // NC.5.NF.1 restricts grade 5 to related denominators (RELATED_PAIRS).
    const [dSmall, dLarge] = rng.pick(RELATED_PAIRS);
    const factor = dLarge / dSmall;
```

- [ ] **Step 5: Constrain the nf4 generator**

In `src/curriculum/grade5/templates/nf4-multiply-fractions.ts`, replace
`const DENOMINATORS = [2, 3, 4, 5, 6, 8];`
with
`const DENOMINATORS = [2, 3, 4];`

and replace the doc comment above `FACTOR_PAIRS` (the whole block starting `/**\n * Every pair of proper fractions over the grade 5 denominators` through its closing `*/`) with:

```ts
/**
 * Every pair of proper fractions over the denominators NC-R7 allows for
 * fraction × fraction (2, 3 and 4) whose four option values are pairwise
 * distinct.
 *
 * Writing p = n1*n2/(d1*d2) for the answer, the distractors are the mediant
 * (n1+n2)/(d1+d2), the cross product (n1*d2)/(d1*n2) and the double
 * reciprocal (d1*d2)/(n1*n2). Three of the six pairs are impossible outright:
 *
 *   answer = cross       => n2^2 = d2^2, and n2 < d2
 *   cross  = flip both   => n1^2 = d1^2, and n1 < d1
 *   answer = flip both   => the answer is a proper product, so below 1,
 *                           while its reciprocal is above 1
 *
 * The mediant is the only value that can tie anything, and an exhaustive
 * sweep of all 36 pairs shows it ties only the cross product, for exactly
 * two draws (1/2 x 3/4 and 1/3 x 2/3). Those satisfy
 * (n1+n2)*d1*n2 === (d1+d2)*n1*d2 and are left out of this table, so a
 * colliding draw is unreachable rather than merely unlikely. That leaves 34.
 */
```

- [ ] **Step 6: Rewrite the six authored items**

Replace the whole object with `id: 'nf1-01'` with:

```ts
  {
    id: 'nf1-01',
    standardCode: 'NC.5.NF.1',
    domainId: 'NF',
    prompt: 'Evaluate the sum. Express your answer as a simplified mixed number or fraction:',
    promptDetails: '2 3/4 + 1 5/8',
    options: labelOptions([
      // (3 + 5)/(4 + 8) = 8/12 = 2/3 added straight across, wholes 2 + 1 = 3.
      { text: '3 2/3', isCorrect: false, misconception: 'added-numerators-and-denominators' },
      // Denominators changed to 8 but 3/4 kept its numerator: 3/8 + 5/8 = 8/8 = 1; 3 + 1 = 4.
      { text: '4', isCorrect: false, misconception: 'common-denominator-numerator-not-scaled' },
      // Key: 3/4 = 6/8; 6/8 + 5/8 = 11/8 = 1 3/8; 2 + 1 + 1 3/8 = 4 3/8.
      { text: '4 3/8', isCorrect: true },
      // Doubled the numerator of the fraction already in eighths: (3 + 10)/8 = 13/8 = 1 5/8; 3 + 1 5/8.
      { text: '4 5/8', isCorrect: false, misconception: 'scaled-the-wrong-addend' },
    ]),
    calculatorAllowed: false,
    isStretch: false,
    difficulty: 'mastery',
    contentVersion: 2,
    explanation: {
      stepByStep: [
        'Step 1: 8 is a multiple of 4, so use eighths as the common denominator.',
        'Step 2: Convert 3/4 to eighths: 3/4 = 6/8 (multiply the top and bottom by 2). 5/8 stays the same.',
        'Step 3: Add the whole numbers: 2 + 1 = 3.',
        'Step 4: Add the fractions: 6/8 + 5/8 = 11/8.',
        'Step 5: Convert 11/8 to a mixed number: 1 3/8.',
        'Step 6: Combine: 3 + 1 3/8 = 4 3/8.'
      ],
      conceptSummary: 'Adding mixed numbers with related denominators by renaming to the larger denominator and regrouping an improper fraction sum.',
      commonMisconception: 'Adding across numerators and denominators, (3+5)/(4+8) = 8/12, which is incorrect.'
    }
  },
```

Replace the whole object with `id: 'nf1-02'` with:

```ts
  {
    id: 'nf1-02',
    standardCode: 'NC.5.NF.1',
    domainId: 'NF',
    prompt: 'Solve the subtraction problem. Express your answer as a fraction or mixed number in simplest form:',
    promptDetails: '6 1/4 - 2 5/8',
    options: labelOptions([
      // No borrowing: 6 - 2 = 4 and the smaller fraction taken from the larger, 5/8 - 2/8 = 3/8.
      { text: '4 3/8', isCorrect: false, misconception: 'forgot-to-regroup' },
      // Key: 6 2/8 = 5 10/8; 5 10/8 - 2 5/8 = 3 5/8.
      { text: '3 5/8', isCorrect: true },
      // Denominators changed to 8 but 1/4 kept its numerator: 6 1/8 - 2 5/8 = 5 9/8 - 2 5/8 = 3 4/8 = 3 1/2.
      { text: '3 1/2', isCorrect: false, misconception: 'common-denominator-numerator-not-scaled' },
      // Borrowed 8/8 to make 10/8 but forgot to drop the 6 to 5: 6 10/8 - 2 5/8 = 4 5/8.
      { text: '4 5/8', isCorrect: false, misconception: 'borrowed-without-reducing-the-whole' },
    ]),
    calculatorAllowed: false,
    isStretch: false,
    difficulty: 'mastery',
    contentVersion: 2,
    explanation: {
      stepByStep: [
        'Step 1: 8 is a multiple of 4, so use eighths as the common denominator.',
        'Step 2: Convert 1/4 to eighths: 1/4 = 2/8. The expression is: 6 2/8 - 2 5/8.',
        'Step 3: Since 2/8 < 5/8, regroup 1 whole (8/8) from the 6: 6 2/8 = 5 + 8/8 + 2/8 = 5 10/8.',
        'Step 4: Subtract the whole numbers: 5 - 2 = 3.',
        'Step 5: Subtract the fractions: 10/8 - 5/8 = 5/8.',
        'Step 6: Combine: 3 5/8.'
      ],
      conceptSummary: 'Regrouping mixed numbers requires converting 1 borrowed whole into equivalent units of the common denominator.',
      commonMisconception: 'Subtracting the smaller fraction from the larger one (5/8 - 2/8 = 3/8) instead of regrouping, which gives 4 3/8.'
    }
  },
```

Replace the whole object with `id: 'nf1-04'` with:

```ts
  {
    id: 'nf1-04',
    standardCode: 'NC.5.NF.1',
    domainId: 'NF',
    prompt: 'Using benchmark fractions (0, 1/2, 1), which is the best estimate of the sum 7/12 + 5/6?',
    options: labelOptions([
      // Rounded 5/6 down to 1/2 (it is closer to 1): 1/2 + 1/2 = 1.
      { text: '1', isCorrect: false, misconception: 'estimated-to-the-wrong-benchmark' },
      // Key: 7/12 is close to 1/2 and 5/6 is close to 1, so 1/2 + 1 = 1 1/2.
      { text: '1 1/2', isCorrect: true },
      // Rounded 7/12 up to 1 (it is closer to 1/2): 1 + 1 = 2.
      { text: '2', isCorrect: false, misconception: 'estimated-to-the-wrong-benchmark' },
      // (7 + 5)/(12 + 6) = 12/18 = 2/3: added straight across.
      { text: '2/3', isCorrect: false, misconception: 'added-numerators-and-denominators' },
    ]),
    calculatorAllowed: false,
    isStretch: false,
    difficulty: 'advanced',
    contentVersion: 2,
    explanation: {
      stepByStep: [
        'Step 1: 7/12 is slightly greater than 6/12, so it is approximately 1/2.',
        'Step 2: 5/6 is very close to 6/6, so it is approximately 1.',
        'Step 3: Sum of benchmarks: 1/2 + 1 = 1 1/2.',
        'Step 4: Reasonableness check: each addend is more than 1/2, so the sum must be more than 1. That rules out 1 and 2/3.'
      ],
      conceptSummary: 'Benchmark estimation tests number sense to check if computed answers are mathematically reasonable.',
      commonMisconception: 'Adding across, (7+5)/(12+6) = 2/3, gives a sum smaller than either addend, which cannot be right.'
    }
  },
```

Replace the whole object with `id: 'nf4-02'` with:

```ts
  {
    id: 'nf4-02',
    standardCode: 'NC.5.NF.4',
    domainId: 'NF',
    prompt: 'Without multiplying, choose the statement that correctly compares the product to the factor 16:\n\n16 × 7/8',
    options: labelOptions([
      { text: 'The product is less than 16 because 7/8 is less than 1', isCorrect: true },
      { text: 'The product is greater than 16 because multiplying always increases value', isCorrect: false, misconception: 'multiplication-always-increases' },
      { text: 'The product is equal to 16 because 7/8 is close to 1', isCorrect: false, misconception: 'rounded-the-factor-to-one' },
      // Read the numerator 7 as an amount to take away from 16.
      { text: 'The product is 7 less than 16', isCorrect: false, misconception: 'used-the-numerator-as-a-whole-number' },
    ]),
    calculatorAllowed: false,
    isStretch: false,
    difficulty: 'mastery',
    contentVersion: 2,
    explanation: {
      stepByStep: [
        'Step 1: Examine the multiplier: 7/8 is less than 1 whole (7/8 < 1).',
        'Step 2: Multiplying a non-zero quantity by a fraction less than 1 scales the quantity down.',
        'Step 3: Therefore, 16 × 7/8 will be strictly less than 16.'
      ],
      conceptSummary: 'Scaling reasoning: multiplying by a factor < 1 reduces the original value.',
      commonMisconception: 'Believing the 4th-grade rule of thumb that "multiplication always makes numbers bigger".'
    }
  },
```

Replace the whole object with `id: 'nf4-03'` with:

```ts
  {
    id: 'nf4-03',
    standardCode: 'NC.5.NF.4',
    domainId: 'NF',
    prompt: 'Solve and simplify: 3/4 × 2/3',
    options: labelOptions([
      // (3 + 2)/(4 + 3) = 5/7: added straight across instead of multiplying.
      { text: '5/7', isCorrect: false, misconception: 'added-numerators-and-denominators' },
      // Key: (3 × 2)/(4 × 3) = 6/12 = 1/2.
      { text: '1/2', isCorrect: true },
      // (3 × 3)/(4 × 2) = 9/8: multiplied crosswise instead of straight across.
      { text: '9/8', isCorrect: false, misconception: 'multiplied-crosswise' },
      // Found the common denominator 12 and added: 9/12 + 8/12 = 17/12.
      { text: '17/12', isCorrect: false, misconception: 'added-instead-of-multiplied' },
    ]),
    calculatorAllowed: false,
    isStretch: false,
    difficulty: 'mastery',
    contentVersion: 2,
    explanation: {
      stepByStep: [
        'Step 1: Multiply numerators: 3 × 2 = 6.',
        'Step 2: Multiply denominators: 4 × 3 = 12.',
        'Step 3: Simplify 6/12 by dividing numerator and denominator by 6: 6/12 = 1/2.',
        'Step 4: Alternatively, cross-cancel first: the 3 on top and the 3 on the bottom cancel, and the 2 on top and the 4 on the bottom become 1 and 2. That leaves (1 × 1) / (2 × 1) = 1/2.'
      ],
      conceptSummary: 'Multiplying proper fractions and simplifying by finding common factors.',
      commonMisconception: 'Finding a common denominator and adding (9/12 + 8/12 = 17/12) instead of multiplying.'
    }
  },
```

Replace the whole object with `id: 'nf7-03'` with:

```ts
  {
    id: 'nf7-03',
    standardCode: 'NC.5.NF.7',
    domainId: 'NF',
    prompt: 'A ribbon is 5 yards long. It is cut into pieces that are each 1/6 yard long. How many pieces are there?',
    options: labelOptions([
      // 1 yard holds 6 pieces; never scaled up to 5 yards.
      { text: '6 pieces', isCorrect: false, misconception: 'forgot-to-scale-by-the-whole-number' },
      // 5 × 1/6 = 5/6: multiplied instead of dividing.
      { text: '5/6 of a piece', isCorrect: false, misconception: 'multiplied-instead-of-divided' },
      // Key: 5 ÷ 1/6 = 5 × 6 = 30.
      { text: '30 pieces', isCorrect: true },
      // (1/6) ÷ 5 = 1/30: divided the piece size by the length.
      { text: '1/30 of a piece', isCorrect: false, misconception: 'inverted-wrong-factor' },
    ]),
    calculatorAllowed: false,
    isStretch: false,
    difficulty: 'advanced',
    contentVersion: 2,
    explanation: {
      stepByStep: [
        'Step 1: 5 ÷ 1/6 asks how many sixths fit into 5 yards.',
        'Step 2: Each yard holds 6 pieces that are 1/6 yard long.',
        'Step 3: 5 yards hold 5 × 6 = 30 pieces.',
        'Step 4: 5 ÷ 1/6 = 30 pieces.'
      ],
      conceptSummary: 'Dividing a whole number by a unit fraction counts how many of those pieces fit, so the answer is larger than the whole number.',
      commonMisconception: 'Stopping at 6 pieces (the number in 1 yard) and never scaling up to 5 yards.'
    }
  },
```

- [ ] **Step 7: Fix `standards.ts`**

In `NC.5.NF.1`, replace the first keyConcept
`          'Finding Common Denominators using multiples',`
with
`          'Related denominators: halves, fourths and eighths; thirds, sixths and twelfths; fifths, tenths and hundredths (the larger denominator is the common denominator)',`

In `NC.5.NF.4`, replace the `description` line with
`        description: 'Multiply a fraction or whole number by a fraction, including mixed numbers (fraction × fraction uses denominators 2, 3 and 4); use area and length models; reason about how factors affect the product.',`
and add a keyConcept after the first one, so the list starts:

```
        keyConcepts: [
          'Multiplying numerators and denominators: (a/b) × (c/d) = (a×c)/(b×d)',
          'Fraction × fraction uses denominators 2, 3 and 4 with area and length models; a fraction times a whole number may use denominators 2, 3, 4, 5, 6, 8, 10 and 12',
```

(the remaining three keyConcepts stay as they are).

- [ ] **Step 8: Replace the `NC.5.NF.1` study guide entry**

In `studyGuides.ts`, replace the whole `'NC.5.NF.1': { ... },` entry with:

```ts
  'NC.5.NF.1': {
    standardCode: 'NC.5.NF.1',
    title: 'Add & Subtract Fractions with Unlike Denominators',
    coreConcept: 'Fractions cannot be added or subtracted until they describe equal-sized parts (common denominator). In Grade 5 the denominators are related: one is a multiple of the other, so the larger one is the common denominator.',
    rulesAndFormulas: [
      { label: 'Related Denominators', detail: 'Grade 5 uses halves, fourths and eighths; thirds, sixths and twelfths; fifths, tenths and hundredths. The larger denominator is a multiple of the smaller one, so it is the common denominator (for 3 and 6, use 6).' },
      { label: 'Equivalent Fractions', detail: 'Multiply numerator and denominator by same factor: 3/4 = (3×2)/(4×2) = 6/8.' },
      { label: 'Borrowing for Subtraction', detail: 'If subtracting 1 3/4 from 4 1/4, borrow 1 from 4: 4 1/4 = 3 + 4/4 + 1/4 = 3 5/4.' }
    ],
    stepByStepMethod: [
      'Step 1: Find the common denominator: the larger denominator, when it is a multiple of the smaller one.',
      'Step 2: Rename the other fraction as an equivalent fraction with that denominator.',
      'Step 3: Add or subtract only the numerators; keep the denominator the same.',
      'Step 4: If mixed numbers, combine whole numbers and fractional parts. Simplify or convert improper fractions.'
    ],
    commonTraps: [
      'Adding across numerators AND denominators (e.g. 1/2 + 1/4 = 2/6 — this is FALSE!).',
      'Forgetting to borrow a whole correctly when the top fraction is smaller in subtraction.'
    ],
    workedExample: {
      problem: 'Solve: 5 1/3 - 2 5/6',
      steps: [
        '1. 6 is a multiple of 3, so the common denominator is 6.',
        '2. Convert: 1/3 = 2/6. The expression is: 5 2/6 - 2 5/6.',
        '3. Since 2/6 < 5/6, borrow 1 whole from 5: 5 2/6 = 4 + 6/6 + 2/6 = 4 8/6.',
        '4. Subtract whole numbers: 4 - 2 = 2.',
        '5. Subtract fractions: 8/6 - 5/6 = 3/6 = 1/2.',
        '6. Combine: 2 1/2.'
      ],
      answer: '2 1/2',
      whyItMattersForSSA: 'Fractions are the largest domain on the NC Grade 5 blueprint (39–43% of the test), and regrouping in mixed-number subtraction is a step worth practising on its own.'
    }
  },
```

- [ ] **Step 9: Delete the two orphaned tags**

`converted-only-second-fraction` (only the old nf1-01) and `computed-exactly-instead-of-estimating` (only the old nf1-04) are now unused. In `src/curriculum/misconceptions.ts` delete these two blocks:

```ts
    entry(
      'converted-only-second-fraction',
      'fraction-operations',
      'Rescaled only one of the two fractions to the common denominator and left the other unchanged.',
    ),
```
```ts
    entry(
      'computed-exactly-instead-of-estimating',
      'incomplete-procedure',
      'Calculated the exact answer instead of using benchmark fractions to estimate as the problem asked.',
    ),
```

- [ ] **Step 10: Run tests, types and lint**

Run: `npx vitest run src/curriculum/grade5 src/curriculum/misconceptions.test.ts`
Expected: PASS. Then `npm run typecheck` and `npm run lint`: clean.

- [ ] **Step 11: Commit**

```bash
git add src/curriculum/grade5/scope.nf.test.ts src/curriculum/grade5/templates/nf1-add-unlike.ts src/curriculum/grade5/templates/nf1-add-unlike.test.ts src/curriculum/grade5/templates/nf4-multiply-fractions.ts src/curriculum/grade5/templates/nf4-multiply-fractions.test.ts src/curriculum/grade5/authored.ts src/curriculum/grade5/standards.ts src/curriculum/grade5/studyGuides.ts src/curriculum/misconceptions.ts
git commit -m "fix(grade5): fractions use NC related families and denominators (NC-R6, NC-R7, NC-R8)" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01X5HSDdHPWxvHxgBaoSTbLX"
```

---

### Task 4: Measurement and data (NC-R5, NC-R9, NC-R10)

**Files:**
- Create: `src/curriculum/grade5/scope.md.test.ts`
- Modify: `src/curriculum/grade5/templates/md1-unit-conversion.ts`, `md1-unit-conversion.test.ts`
- Modify: `src/curriculum/grade5/authored.ts` (`md1-02`, `md1-03`, `md2-01`, `md2-02`, `md5-03`)
- Modify: `src/curriculum/grade5/standards.ts` (MD domain description, `NC.5.MD.1`, `NC.5.MD.2`)
- Modify: `src/curriculum/grade5/studyGuides.ts` (`NC.5.MD.1`, `NC.5.MD.2`)
- Modify: `src/curriculum/misconceptions.ts` (add `confused-the-kind-of-data`; delete `miscounted-the-frequency`, `misidentified-the-extreme`, `stopped-at-an-intermediate-unit`, `concatenated-the-mixed-units`)

**Interfaces:**
- Consumes: `byId`, `keyText`, `optionFor` from `./scope.testkit`.
- Produces: new misconception tag `confused-the-kind-of-data` (family `geometry-and-measurement`).

Rules covered: NC-R5, NC-R9, NC-R10. Findings: md1-02 and md1-03 (High), md1-02 "320 bowls" (High), md2-01 and md2-02 plus MD.2 standard and guide (High), md5-03 (Medium), MD.1 guide example (High), MD.2 "average" (Medium), md1 template "same length" (Low, one-line).

- [ ] **Step 1: Write the failing item test**

Create `src/curriculum/grade5/scope.md.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { GRADE_5_DOMAINS, GRADE_5_STANDARDS } from './standards';
import { byId, keyText, optionFor } from './scope.testkit';
import { GRADE_5_STUDY_GUIDES } from './studyGuides';

describe('MD.1 (NC-R9 one conversion step from a given chart)', () => {
  it('md1-02: NC-R9 7 quarts at 4 cups each, key and distractors follow their tags', () => {
    const q = byId('md1-02');
    expect(q.prompt).toContain('7 quarts');
    expect(q.promptDetails).toBe('Conversion chart: 1 quart = 4 cups');
    expect((q.promptDetails ?? '').match(/=/g)).toHaveLength(1);
    expect(keyText('md1-02')).toBe(`${7 * 4} bowls`);
    // 7 ÷ 4 = 1.75 = 1 3/4: converted the wrong way.
    expect(7 / 4).toBe(1.75);
    expect(optionFor('md1-02', 'unit-conversion-inverted')).toBe('1 3/4 bowls');
    // Used 2 cups per quart (the pint factor).
    expect(optionFor('md1-02', 'used-wrong-conversion-factor')).toBe(`${7 * 2} bowls`);
    // Chained a second doubling that the chart never asked for.
    expect(optionFor('md1-02', 'applied-an-extra-conversion-step')).toBe(`${7 * 4 * 2} bowls`);
    // The audit's "320 bowls" did not follow its tag.
    expect(JSON.stringify(q)).not.toContain('320');
  });

  it('md1-03: NC-R9 one conversion inside a two-step problem, key and distractors follow their tags', () => {
    const q = byId('md1-03');
    expect(q.promptDetails).toBe('Conversion chart: 1 foot = 12 inches');
    expect((q.promptDetails ?? '').match(/=/g)).toHaveLength(1);
    expect(q.prompt).toContain('4 feet');
    expect(q.prompt).toContain('15 inches');
    expect(keyText('md1-03')).toBe(`${4 * 12 - 15} inches`);
    expect(optionFor('md1-03', 'added-instead-of-subtracted')).toBe(`${4 * 12 + 15} inches`);
    // Subtracted 4 from 15 without converting feet to inches.
    expect(optionFor('md1-03', 'left-the-measurement-unconverted')).toBe(`${15 - 4} inches`);
    // Used 10 inches per foot.
    expect(optionFor('md1-03', 'used-wrong-conversion-factor')).toBe(`${4 * 10 - 15} inches`);
    expect(q.isStretch).toBe(false);
  });

  it('MD.1 study guide: NC-R9 the worked example is one step from a chart', () => {
    const ex = GRADE_5_STUDY_GUIDES['NC.5.MD.1'].workedExample;
    expect(ex.problem).toContain('1 quart = 4 cups');
    expect(ex.answer).toBe(`${6 * 4} cups`);
    expect(ex.whyItMattersForSSA).not.toMatch(/almost always/);
    const std = GRADE_5_STANDARDS.find((s) => s.code === 'NC.5.MD.1')!;
    expect(std.keyConcepts[0]).toMatch(/conversion chart/);
  });
});

describe('MD.2 (NC-R5 line graphs, data over time, kinds of data)', () => {
  it('md2-01: NC-R5 reads the change on a line graph, key and distractors follow their tags', () => {
    const q = byId('md2-01');
    expect(q.prompt).toContain('line graph');
    expect(q.prompt).not.toMatch(/line plot/i);
    expect(keyText('md2-01')).toBe(`${18 - 7} cm`);
    // Read the Week 5 point instead of the change.
    expect(optionFor('md2-01', 'reported-the-measurement-not-the-total')).toBe('18 cm');
    expect(optionFor('md2-01', 'added-instead-of-subtracted')).toBe(`${18 + 7} cm`);
    // Subtracted the weeks (5 - 2) instead of the heights.
    expect(optionFor('md2-01', 'used-the-wrong-given-quantity')).toBe(`${5 - 2} cm`);
    // The weekly growth from Week 2 to Week 5 adds up to the same change.
    expect(11 - 7 + (12 - 11) + (18 - 12)).toBe(18 - 7);
  });

  it('md2-01: the point list is short enough to read in monospace on a phone', () => {
    const lines = (byId('md2-01').promptDetails ?? '').split('\n');
    expect(lines).toHaveLength(5);
    for (const line of lines) expect(line.length, line).toBeLessThanOrEqual(20);
  });

  it('md2-02: NC-R5 picks the survey question that gives data over time', () => {
    const q = byId('md2-02');
    expect(q.prompt).toContain('changes over time');
    expect(keyText('md2-02')).toBe('How many minutes did you read each night this week?');
    const wrong = q.options.filter((o) => !o.isCorrect);
    expect(wrong).toHaveLength(3);
    for (const o of wrong) expect(o.misconception).toBe('confused-the-kind-of-data');
    expect(JSON.stringify(q)).not.toMatch(/line plot/i);
  });

  it('MD.2 standard, guide and domain: NC-R5 no fractional line plots and no "average"', () => {
    const std = GRADE_5_STANDARDS.find((s) => s.code === 'NC.5.MD.2')!;
    const md = GRADE_5_DOMAINS.find((d) => d.id === 'MD')!;
    const guide = GRADE_5_STUDY_GUIDES['NC.5.MD.2'];
    expect(std.title).toContain('Line Graphs');
    expect(JSON.stringify(std)).not.toMatch(/line plots?/i);
    expect(md.description).not.toMatch(/line plots?/i);
    expect(JSON.stringify(guide)).not.toMatch(/line plots?|average/i);
    expect(guide.title).toContain('Line Graphs');
  });
});

describe('MD.5 (NC-R10 one-digit dimensions in a composed solid)', () => {
  it('md5-03: NC-R10 every dimension is at most 9, key and distractors follow their tags', () => {
    const q = byId('md5-03');
    const dims = [...q.prompt.matchAll(/(\d+) inches/g)].map((m) => Number(m[1]));
    expect(dims).toEqual([9, 6, 4, 8, 6, 7]);
    for (const d of dims) expect(d, `dimension ${d}`).toBeLessThanOrEqual(9);
    expect(keyText('md5-03')).toBe(`${9 * 6 * 4 + 8 * 6 * 7} cubic inches`);
    // Prism 1 only.
    expect(optionFor('md5-03', 'omitted-one-part-of-composite')).toBe(`${9 * 6 * 4} cubic inches`);
    // Added every dimension.
    expect(optionFor('md5-03', 'used-perimeter-formula')).toBe(`${9 + 6 + 4 + 8 + 6 + 7} cubic inches`);
    // Multiplied every dimension together.
    expect(optionFor('md5-03', 'multiplied-all-dimensions-together')).toBe(
      `${(9 * 6 * 4 * 8 * 6 * 7).toLocaleString('en-US')} cubic inches`,
    );
    expect(q.isStretch).toBe(false);
  });
});

describe('MD content versions', () => {
  it('rewritten MD items carry contentVersion 2; untouched MD items do not', () => {
    for (const id of ['md1-02', 'md1-03', 'md2-01', 'md2-02', 'md5-03']) {
      expect(byId(id).contentVersion, id).toBe(2);
    }
    for (const id of ['md1-01', 'md4-01', 'md5-01', 'md5-02']) {
      expect(byId(id).contentVersion ?? 1, id).toBe(1);
    }
  });
});
```

- [ ] **Step 2: Add the failing template test**

In `src/curriculum/grade5/templates/md1-unit-conversion.test.ts`, inside its top-level `describe('md1UnitConversion', ...)`, add this test as the last one in the block:

```ts
  it('md1 template: the explanation never says "same length" (the units include weight and capacity)', () => {
    for (let seed = 0; seed < 300; seed++) {
      const g = md1UnitConversion.generate(makeRng(seed));
      expect(g.explanation.stepByStep.join(' '), `seed ${seed}`).not.toMatch(/same length/);
    }
  });
```

- [ ] **Step 3: Run to verify failures**

Run: `npx vitest run src/curriculum/grade5/scope.md.test.ts src/curriculum/grade5/templates/md1-unit-conversion.test.ts`
Expected: FAIL. The old items have the wrong prompts and `contentVersion` is undefined; the template's Step 2 says "the same length needs more of them".

- [ ] **Step 4: Fix the md1 template wording**

In `src/curriculum/grade5/templates/md1-unit-conversion.ts`, replace
`            ? \`Step 2: ${small.charAt(0).toUpperCase()}${small.slice(1)} are smaller than ${big}, so the same length needs more of them — multiply by ${factor}.\``
with
`            ? \`Step 2: ${small.charAt(0).toUpperCase()}${small.slice(1)} are smaller than ${big}, so the same amount needs more of them — multiply by ${factor}.\``

- [ ] **Step 5: Add and delete misconception entries**

In `src/curriculum/misconceptions.ts`, add this entry directly after the `confused-categorical-with-numerical` entry:

```ts
    entry(
      'confused-the-kind-of-data',
      'geometry-and-measurement',
      'Named the wrong kind of data for a survey question, mixing up categorical data (answers are names), numerical data (answers are numbers at one time) and data that changes over time (the same thing measured again and again).',
    ),
```

Delete these four blocks (their only uses were the old md1-02, md1-03, md2-01 and md2-02):

```ts
    entry(
      'miscounted-the-frequency',
      'geometry-and-measurement',
      'Miscounted how many data points shared a given measurement, undercounting the total.',
    ),
```
```ts
    entry(
      'misidentified-the-extreme',
      'geometry-and-measurement',
      'Picked the wrong data point as the maximum or minimum when finding a range.',
    ),
```
```ts
    entry(
      'stopped-at-an-intermediate-unit',
      'unit-conversion',
      'Converted partway through a chain of units and reported that intermediate unit instead of continuing to the requested unit.',
    ),
```
```ts
    entry(
      'concatenated-the-mixed-units',
      'unit-conversion',
      'Ran two units together as if they were digits of one number, instead of converting each unit separately.',
    ),
```

- [ ] **Step 6: Rewrite the five authored items**

Replace the whole object with `id: 'md1-02'` with:

```ts
  {
    id: 'md1-02',
    standardCode: 'NC.5.MD.1',
    domainId: 'MD',
    prompt: 'A school cafeteria prepares 7 quarts of vegetable soup and serves it in 1-cup bowls. How many full 1-cup bowls can it serve?',
    promptDetails: 'Conversion chart: 1 quart = 4 cups',
    options: labelOptions([
      // 7 ÷ 4 = 1 3/4: converted the wrong way (divided going to the smaller unit).
      { text: '1 3/4 bowls', isCorrect: false, misconception: 'unit-conversion-inverted' },
      // Used 2 cups per quart (the pint factor): 7 × 2.
      { text: '14 bowls', isCorrect: false, misconception: 'used-wrong-conversion-factor' },
      // Key: 7 × 4 = 28 cups, one cup per bowl.
      { text: '28 bowls', isCorrect: true },
      // Chained a second doubling the chart never asked for: 7 × 4 × 2.
      { text: '56 bowls', isCorrect: false, misconception: 'applied-an-extra-conversion-step' },
    ]),
    calculatorAllowed: false,
    isStretch: false,
    difficulty: 'mastery',
    contentVersion: 2,
    explanation: {
      stepByStep: [
        'Step 1: The chart says 1 quart = 4 cups.',
        'Step 2: Quarts are larger than cups, so there are more cups than quarts: multiply.',
        'Step 3: 7 × 4 = 28 cups.',
        'Step 4: Each bowl holds 1 cup, so the cafeteria can serve 28 bowls.'
      ],
      conceptSummary: 'One-step customary capacity conversion from a given chart: larger unit to smaller unit means multiply.',
      commonMisconception: 'Dividing 7 by 4 (converting the wrong way) gives 1 3/4, which is fewer cups than quarts.'
    }
  },
```

Replace the whole object with `id: 'md1-03'` with:

```ts
  {
    id: 'md1-03',
    standardCode: 'NC.5.MD.1',
    domainId: 'MD',
    prompt: 'A carpenter has a board that is 4 feet long. She cuts off a piece that is 15 inches long. How many inches of the board are left?',
    promptDetails: 'Conversion chart: 1 foot = 12 inches',
    options: labelOptions([
      // Key: 4 feet = 48 inches; 48 - 15 = 33.
      { text: '33 inches', isCorrect: true },
      // 48 + 15: added the cut piece instead of removing it.
      { text: '63 inches', isCorrect: false, misconception: 'added-instead-of-subtracted' },
      // 15 - 4: subtracted the numbers without converting feet to inches.
      { text: '11 inches', isCorrect: false, misconception: 'left-the-measurement-unconverted' },
      // Used 10 inches per foot: 40 - 15.
      { text: '25 inches', isCorrect: false, misconception: 'used-wrong-conversion-factor' },
    ]),
    calculatorAllowed: true,
    isStretch: false,
    difficulty: 'advanced',
    contentVersion: 2,
    explanation: {
      stepByStep: [
        'Step 1: The chart says 1 foot = 12 inches.',
        'Step 2: Convert the board to inches: 4 × 12 = 48 inches.',
        'Step 3: Subtract the piece that was cut off: 48 - 15 = 33 inches.'
      ],
      conceptSummary: 'A one-step conversion inside a two-step problem: convert to the smaller unit first, then subtract.',
      commonMisconception: 'Subtracting 15 - 4 = 11 without first converting the feet to inches.'
    }
  },
```

Replace the whole object with `id: 'md2-01'` with:

```ts
  {
    id: 'md2-01',
    standardCode: 'NC.5.MD.2',
    domainId: 'MD',
    prompt: 'A line graph shows the height of a bean plant at the end of each week. The points on the graph are listed below. How many centimeters did the plant grow from the end of Week 2 to the end of Week 5?',
    promptDetails: 'Week 1:  4 cm\nWeek 2:  7 cm\nWeek 3: 11 cm\nWeek 4: 12 cm\nWeek 5: 18 cm',
    options: labelOptions([
      // Read the Week 5 point (18) instead of the change between two points.
      { text: '18 cm', isCorrect: false, misconception: 'reported-the-measurement-not-the-total' },
      // Key: 18 - 7 = 11.
      { text: '11 cm', isCorrect: true },
      // 18 + 7: added the two heights instead of finding the change.
      { text: '25 cm', isCorrect: false, misconception: 'added-instead-of-subtracted' },
      // 5 - 2: subtracted the weeks (the times) instead of the heights.
      { text: '3 cm', isCorrect: false, misconception: 'used-the-wrong-given-quantity' },
    ]),
    calculatorAllowed: false,
    isStretch: false,
    difficulty: 'mastery',
    contentVersion: 2,
    explanation: {
      stepByStep: [
        'Step 1: Read the height at the end of Week 5: 18 cm.',
        'Step 2: Read the height at the end of Week 2: 7 cm.',
        'Step 3: The growth is the change between the two points: 18 - 7 = 11 cm.',
        'Step 4: Check by adding the weekly growth from Week 2 to Week 5: 4 + 1 + 6 = 11 cm.'
      ],
      conceptSummary: 'On a line graph, the change between two times is the later value minus the earlier value.',
      commonMisconception: 'Reading one point (18 cm) or subtracting the weeks (5 - 2 = 3) instead of subtracting the two heights.'
    }
  },
```

Replace the whole object with `id: 'md2-02'` with:

```ts
  {
    id: 'md2-02',
    standardCode: 'NC.5.MD.2',
    domainId: 'MD',
    prompt: 'Ms. Ortiz wants to make a line graph that shows how something changes over time. Which question would give her data that changes over time?',
    options: labelOptions([
      // Answers are names of kinds of books: categorical data.
      { text: 'What is your favorite kind of book?', isCorrect: false, misconception: 'confused-the-kind-of-data' },
      // One number collected once: numerical data at one time.
      { text: 'How many books are on your shelf right now?', isCorrect: false, misconception: 'confused-the-kind-of-data' },
      // Key: the same measurement collected again each night, so it changes over time.
      { text: 'How many minutes did you read each night this week?', isCorrect: true },
      // Answers are months: categorical data.
      { text: 'In which month is your birthday?', isCorrect: false, misconception: 'confused-the-kind-of-data' },
    ]),
    calculatorAllowed: false,
    isStretch: false,
    difficulty: 'mastery',
    contentVersion: 2,
    explanation: {
      stepByStep: [
        'Step 1: Categorical data has answers that are names, such as a favorite kind of book or a birthday month.',
        'Step 2: Numerical data has answers that are numbers. Books on a shelf right now is one number collected once.',
        'Step 3: Data that changes over time is the same thing measured again and again. Minutes read each night can be different every night, so it fits a line graph.'
      ],
      conceptSummary: 'A line graph needs data that is measured repeatedly over time, such as each day, week or month.',
      commonMisconception: 'Choosing a question whose answer is a name or a single count, which is measured once and does not change over time.'
    }
  },
```

Replace the whole object with `id: 'md5-03'` with:

```ts
  {
    id: 'md5-03',
    standardCode: 'NC.5.MD.5',
    domainId: 'MD',
    prompt: 'A solid wooden step structure is made of two joined rectangular prisms. Prism 1 measures 9 inches long, 6 inches wide, and 4 inches high. Prism 2 sits next to it and measures 8 inches long, 6 inches wide, and 7 inches high. What is the total combined volume of the wooden structure in cubic inches?',
    options: labelOptions([
      // 9 × 6 × 4 = 216: found Prism 1 only and never added Prism 2.
      { text: '216 cubic inches', isCorrect: false, misconception: 'omitted-one-part-of-composite' },
      // 9 + 6 + 4 + 8 + 6 + 7 = 40: added every dimension.
      { text: '40 cubic inches', isCorrect: false, misconception: 'used-perimeter-formula' },
      // Key: 216 + 8 × 6 × 7 = 216 + 336 = 552.
      { text: '552 cubic inches', isCorrect: true },
      // 9 × 6 × 4 × 8 × 6 × 7 = 72,576: multiplied the numbers together instead of decomposing.
      { text: '72,576 cubic inches', isCorrect: false, misconception: 'multiplied-all-dimensions-together' },
    ]),
    calculatorAllowed: true,
    isStretch: false,
    difficulty: 'advanced',
    contentVersion: 2,
    explanation: {
      stepByStep: [
        'Step 1: Calculate volume of Prism 1: 9 × 6 × 4 = 216 cubic inches.',
        'Step 2: Calculate volume of Prism 2: 8 × 6 × 7 = 336 cubic inches.',
        'Step 3: Add the two non-overlapping volumes: 216 + 336 = 552 cubic inches.'
      ],
      conceptSummary: 'Additive volume of composite rectangular prisms.',
      commonMisconception: 'Multiplying all numbers together (9 × 6 × 4 × 8 × 6 × 7) instead of decomposing into two distinct prisms.'
    }
  },
```

- [ ] **Step 7: Fix `standards.ts`**

In the `MD` domain, replace the `description` line with
`    description: 'Covers unit conversions (metric and customary) from a given chart, line graphs of data over time, and 3D volume concepts including additive volume of composed rectangular prisms.',`

Replace the whole `NC.5.MD.1` `description` line with
`        description: 'Given a conversion chart, use multiplicative reasoning to solve one-step conversion problems within a given measurement system (metric or customary).',`
and insert as the first keyConcept:
`          'Use the conversion chart you are given and convert in one step within one system (customary, metric, or time)',`

Replace the whole `NC.5.MD.2` standard object with:

```ts
      {
        code: 'NC.5.MD.2',
        domainId: 'MD',
        title: 'Represent & Interpret Data with Line Graphs',
        description: 'Collect, represent and interpret data that changes over time with line graphs; decide whether a survey question gives categorical data, numerical data, or data that changes over time.',
        weightCategory: 'Core (MD & G share 19–23%)',
        keyConcepts: [
          'A line graph shows how a measurement changes over time: time on the horizontal axis, the measurement on the vertical axis',
          'Finding the change between two points by subtracting the earlier value from the later value',
          'Sorting survey questions into categorical data (names), numerical data (numbers) and data that changes over time'
        ]
      },
```

- [ ] **Step 8: Fix `studyGuides.ts`**

In `'NC.5.MD.1'`, replace the `coreConcept` line with
`    coreConcept: 'Using a given conversion chart to convert between units within the same system, one step at a time. When converting from a larger unit to a smaller unit, multiply. When converting from a smaller unit to a larger unit, divide.',`
and replace the whole `workedExample` block with:

```ts
    workedExample: {
      problem: 'A jug holds 6 quarts of juice. Use the conversion chart: 1 quart = 4 cups. How many cups of juice does the jug hold?',
      steps: [
        '1. The chart gives 1 quart = 4 cups.',
        '2. Quarts are larger than cups, so the answer will be a larger number: multiply.',
        '3. 6 × 4 = 24.'
      ],
      answer: '24 cups',
      whyItMattersForSSA: 'A conversion chart is given, so the work is choosing whether to multiply or divide and carrying it out carefully.'
    }
```

Replace the whole `'NC.5.MD.2': { ... },` entry with:

```ts
  'NC.5.MD.2': {
    standardCode: 'NC.5.MD.2',
    title: 'Represent & Interpret Data with Line Graphs',
    coreConcept: 'A line graph shows how a measurement changes over time: time runs along the bottom and the measurement goes up the side. Every survey question gives one of three kinds of data: categorical (names), numerical (numbers), or data that changes over time.',
    rulesAndFormulas: [
      { label: 'Reading a Point', detail: 'Find the time on the horizontal axis, then go up to the point and across to read the value on the vertical axis.' },
      { label: 'Change Between Two Points', detail: 'Subtract the earlier value from the later value. Subtract the values, not the times.' },
      { label: 'Kinds of Data', detail: 'Categorical: answers are names (favorite kind of book). Numerical: answers are numbers (books on a shelf today). Over time: the same thing is measured again and again (minutes read each night).' }
    ],
    stepByStepMethod: [
      'Step 1: Read the title and both axis labels to see what is measured and when.',
      'Step 2: Find the two points the question names and read each value.',
      'Step 3: Subtract the earlier value from the later one to find the change.',
      'Step 4: For a survey question, ask: are the answers names, numbers, or the same thing measured at different times?'
    ],
    commonTraps: [
      'Reading one point when the question asks for the change between two points.',
      'Subtracting the times (Week 5 - Week 2 = 3) instead of the values.'
    ],
    workedExample: {
      problem: 'A line graph shows the noon temperature each day: Monday 60°F, Tuesday 64°F, Wednesday 71°F, Thursday 68°F. How many degrees warmer was Wednesday than Monday?',
      steps: [
        '1. Wednesday\'s point is at 71°F.',
        '2. Monday\'s point is at 60°F.',
        '3. The change is 71 - 60 = 11 degrees.'
      ],
      answer: '11 degrees warmer',
      whyItMattersForSSA: 'Reading a change between two points on a line graph means subtracting the two values, not reading either one.'
    }
  },
```

- [ ] **Step 9: Run tests, types and lint**

Run: `npx vitest run src/curriculum/grade5 src/curriculum/misconceptions.test.ts src/curriculum/integrity.test.ts`
Expected: PASS. Then `npm run typecheck` and `npm run lint`: clean.

- [ ] **Step 10: Commit**

```bash
git add src/curriculum/grade5/scope.md.test.ts src/curriculum/grade5/templates/md1-unit-conversion.ts src/curriculum/grade5/templates/md1-unit-conversion.test.ts src/curriculum/grade5/authored.ts src/curriculum/grade5/standards.ts src/curriculum/grade5/studyGuides.ts src/curriculum/misconceptions.ts
git commit -m "fix(grade5): measurement items use one-step charts, line graphs and one-digit prisms (NC-R5, NC-R9, NC-R10)" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01X5HSDdHPWxvHxgBaoSTbLX"
```

---

### Task 5: Geometry g3-03, unsupported study-guide claims, and the Grade 5 text scan (NC-R11)

**Files:**
- Create: `src/curriculum/grade5/scope.g.test.ts`
- Create: `src/curriculum/grade5/scope.text.test.ts`
- Modify: `src/curriculum/grade5/authored.ts` (`g3-03`)
- Modify: `src/curriculum/grade5/studyGuides.ts` (`whyItMattersForSSA` lines for NBT.3, NBT.5, NBT.6, NF.3, NF.7, MD.4, MD.5, G.3)

**Interfaces:**
- Consumes: `byId`, `keyText`, `optionFor` from `./scope.testkit`; `GRADE_5_AUTHORED`, `GRADE_5_STUDY_GUIDES`, `GRADE_5_DOMAINS`, `GRADE_5_QUIZZES`, `GRADE_5` (all exist).
- Produces: nothing later tasks import.

Rules covered: NC-R11 (drop diagonals and kite). Findings: g3-03 (Medium), study-guide unsupported claims (Medium). The trapezoid lines of the `NC.5.G.3` guide stay with Plan B1; this task edits only its `whyItMattersForSSA`.

- [ ] **Step 1: Write the failing geometry test**

Create `src/curriculum/grade5/scope.g.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { GRADE_5_AUTHORED } from './authored';
import { byId, keyText, optionFor } from './scope.testkit';
import { GRADE_5_STUDY_GUIDES } from './studyGuides';

describe('G.3 (NC-R11 sides, angles and symmetry only)', () => {
  it('g3-03: NC-R11 names the rhombus from sides and angles, key and distractors follow their tags', () => {
    const q = byId('g3-03');
    expect(q.prompt).toContain('4 sides that are all equal in length (12 cm)');
    expect(q.prompt).toContain('2 pairs of parallel sides');
    expect(q.prompt).toContain('none of its angles are right angles');
    expect(keyText('g3-03')).toBe('Rhombus');
    expect(optionFor('g3-03', 'ignored-a-constraint')).toBe('Square');
    expect(optionFor('g3-03', 'named-a-broader-category')).toBe('Parallelogram');
    expect(optionFor('g3-03', 'classified-by-one-property-only')).toBe('Rectangle');
    expect(q.isStretch).toBe(false);
  });

  it('NC-R11: no G.3 question or guide text mentions diagonals or kites', () => {
    const g3 = GRADE_5_AUTHORED.filter((q) => q.standardCode === 'NC.5.G.3');
    for (const q of g3) expect(JSON.stringify(q), q.id).not.toMatch(/diagonal|kite/i);
    expect(JSON.stringify(GRADE_5_STUDY_GUIDES['NC.5.G.3'])).not.toMatch(/diagonal|kite/i);
  });

  it('g3-03 carries contentVersion 2; g3-01 is untouched', () => {
    expect(byId('g3-03').contentVersion).toBe(2);
    expect(byId('g3-01').contentVersion ?? 1).toBe(1);
  });
});
```

- [ ] **Step 2: Write the failing text-scan test**

Create `src/curriculum/grade5/scope.text.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { GRADE_5 } from './index';
import { GRADE_5_AUTHORED } from './authored';
import { GRADE_5_STUDY_GUIDES } from './studyGuides';
import { GRADE_5_DOMAINS } from './standards';
import type { Question } from '../../engine/questionModel';
import type { StudyGuideSection } from '../../types';

function questionStrings(q: Question): string[] {
  return [
    q.prompt,
    q.promptDetails ?? '',
    ...q.options.map((o) => o.text),
    ...q.explanation.stepByStep,
    q.explanation.conceptSummary,
    q.explanation.commonMisconception ?? '',
  ];
}

function guideStrings(g: StudyGuideSection): string[] {
  return [
    g.title,
    g.coreConcept,
    ...g.rulesAndFormulas.flatMap((r) => [r.label, r.detail]),
    ...g.stepByStepMethod,
    ...g.commonTraps,
    g.workedExample.problem,
    ...g.workedExample.steps,
    g.workedExample.answer,
    g.workedExample.whyItMattersForSSA,
  ];
}

const standardStrings = GRADE_5_DOMAINS.flatMap((d) => [
  d.description,
  ...d.standards.flatMap((s) => [s.title, s.description, ...s.keyConcepts]),
]);

const quizStrings = GRADE_5.quizzes.flatMap((z) => [
  z.title,
  typeof z.subtitle === 'function' ? z.subtitle(GRADE_5) : z.subtitle,
]);

const everyString = [
  ...GRADE_5_AUTHORED.flatMap(questionStrings),
  ...Object.values(GRADE_5_STUDY_GUIDES).flatMap(guideStrings),
  ...standardStrings,
  ...quizStrings,
];

/** Text Grade 5 must never contain: it is outside the NC standard (rule id in the label). */
const OUT_OF_SCOPE: Array<[string, RegExp]> = [
  ['NC-R4 exponent notation', /\^/],
  ['NC-R1 brackets or braces', /[[\]{}]/],
  ['NC-R5 line plots', /line plots?/i],
  ['reading level: slope', /\bslope\b/i],
  ['grade 6 content named in Grade 5 text', /\b(6th|sixth)[- ]grade\b/i],
];

/** Claims the audit could not source: how often, how hard, or how a test is laid out. */
const UNSUPPORTED_CLAIMS =
  /most common|single most|#1|highest-discriminating|almost always|\blove\b|high-frequency|heavily assessed|will try to|tested concept|calculator-inactive|calculator inactive/i;

describe('Grade 5 text stays inside NC scope', () => {
  it.each(OUT_OF_SCOPE)('%s appears nowhere in Grade 5 questions, guides, standards or quizzes', (_label, pattern) => {
    const hits = everyString.filter((s) => pattern.test(s));
    expect(hits, `matched: ${hits.join(' || ')}`).toEqual([]);
  });

  it('no authored prompt wears an "Above-Grade" label', () => {
    for (const q of GRADE_5_AUTHORED) expect(q.prompt, q.id).not.toMatch(/Above-Grade/);
  });

  it('audit Medium: study guides make no unsupported frequency, difficulty or test-layout claims', () => {
    for (const [code, guide] of Object.entries(GRADE_5_STUDY_GUIDES)) {
      for (const s of guideStrings(guide)) {
        expect(s, `${code}: ${s}`).not.toMatch(UNSUPPORTED_CLAIMS);
      }
    }
  });
});
```

- [ ] **Step 3: Run to verify failures**

Run: `npx vitest run src/curriculum/grade5/scope.g.test.ts src/curriculum/grade5/scope.text.test.ts`
Expected: FAIL. g3-03 still mentions diagonals and a kite; the claim scan lists the NBT.3, NBT.5, NBT.6, NF.3, NF.7, MD.4, MD.5 and G.3 lines.

- [ ] **Step 4: Rewrite `g3-03` in `authored.ts`**

Replace the whole object with `id: 'g3-03'` with:

```ts
  {
    id: 'g3-03',
    standardCode: 'NC.5.G.3',
    domainId: 'G',
    prompt: 'A quadrilateral has 4 sides that are all equal in length (12 cm) and 2 pairs of parallel sides, but none of its angles are right angles. What is the most specific name for this quadrilateral?',
    options: labelOptions([
      // Used the 4 equal sides and ignored the stated "no right angles" condition.
      { text: 'Square', isCorrect: false, misconception: 'ignored-a-constraint' },
      // Key: a parallelogram with 4 equal sides is a rhombus, and there are no right angles.
      { text: 'Rhombus', isCorrect: true },
      // A true category for this figure, but not the most specific one.
      { text: 'Parallelogram', isCorrect: false, misconception: 'named-a-broader-category' },
      // Classified from the two pairs of parallel sides alone.
      { text: 'Rectangle', isCorrect: false, misconception: 'classified-by-one-property-only' },
    ]),
    calculatorAllowed: false,
    isStretch: false,
    difficulty: 'advanced',
    contentVersion: 2,
    explanation: {
      stepByStep: [
        'Step 1: 4 sides means the figure is a quadrilateral.',
        'Step 2: 2 pairs of parallel sides means it is a parallelogram.',
        'Step 3: 4 equal sides makes the parallelogram a rhombus.',
        'Step 4: A square or a rectangle needs 4 right angles, and none of the angles here are right angles, so the most specific name is rhombus.'
      ],
      conceptSummary: 'Classify a quadrilateral by its sides and angles: every rhombus is a parallelogram, and a rhombus with 4 right angles is a square.',
      commonMisconception: 'Naming a broader category (parallelogram) or a shape whose required right angles the figure does not have (square, rectangle).'
    }
  }
```

(Keep the trailing `]` that closes `GRADE_5_AUTHORED`; this object is the last element and has no trailing comma.)

- [ ] **Step 5: Replace the unsupported `whyItMattersForSSA` lines in `studyGuides.ts`**

Apply each replacement exactly (old line, then new line). Each old string is unique in the file.

| Entry | Old | New |
|---|---|---|
| NBT.3 | `whyItMattersForSSA: 'Decimals to thousandths are heavily assessed; precision in decimal place names is critical.'` | `whyItMattersForSSA: 'Decimal place names decide which digit is worth more, so one slip in a name changes every comparison that follows.'` |
| NBT.5 | `whyItMattersForSSA: 'Calculator-inactive section requires speed and 100% computational accuracy without a calculator.'` | `whyItMattersForSSA: 'Grade 5 asks for fluent multi-digit multiplication by hand, so each partial product has to be right.'` |
| NBT.6 | `whyItMattersForSSA: 'Forgetting the zero in the quotient (writing 23 instead of 203) is one of the single most common student mistakes on CASE assessments.'` | `whyItMattersForSSA: 'A missing zero in the quotient (writing 23 instead of 203) changes the answer, so check by multiplying the quotient by the divisor.'` |
| NF.3 | `whyItMattersForSSA: 'CASE tests will try to trick students into picking 7/4 = 1 3/4 by reversing the scenario.'` | `whyItMattersForSSA: 'Reversing the numbers (7/4 instead of 4/7) would give each student more than one whole bag, which cannot happen when 4 bags are shared by 7 students.'` |
| NF.7 | `whyItMattersForSSA: 'High-frequency question on NC assessments; word problems test conceptual reasoning.'` | `whyItMattersForSSA: 'Deciding whether the answer should be larger or smaller than the starting amount before dividing catches a reversed answer.'` |
| MD.4 | `whyItMattersForSSA: 'Builds the conceptual foundation for the volume formula tested on CASE.'` | `whyItMattersForSSA: 'Counting layers of cubes is the idea behind the volume formula V = B × h.'` |
| MD.5 | `whyItMattersForSSA: 'Composite figures are among the highest-discriminating items on the SSA math test.'` | `whyItMattersForSSA: 'The standard asks students to find the volume of a solid built from two non-overlapping rectangular prisms by adding the two volumes.'` |
| G.3 | `whyItMattersForSSA: 'CASE questions love logic tests: "All squares are rectangles, but not all rectangles are squares."'` | `whyItMattersForSSA: 'Deciding whether a statement about shapes is always true, sometimes true, or never true is the core skill of the hierarchy: all squares are rectangles, but not all rectangles are squares.'` |

Do not touch any other line of the `NC.5.G.3` guide; its trapezoid text belongs to Plan B1.

- [ ] **Step 6: Run tests, types and lint**

Run: `npx vitest run src/curriculum/grade5 src/curriculum/misconceptions.test.ts`
Expected: PASS. If the text scan still reports a string (for example a leftover `10^` or `line plot`), the message lists it; fix the wording to match the rule and re-run. Then `npm run typecheck` and `npm run lint`: clean.

- [ ] **Step 7: Commit**

```bash
git add src/curriculum/grade5/scope.g.test.ts src/curriculum/grade5/scope.text.test.ts src/curriculum/grade5/authored.ts src/curriculum/grade5/studyGuides.ts
git commit -m "fix(grade5): g3-03 drops kite and diagonals; study guides drop unsupported claims (NC-R11)" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01X5HSDdHPWxvHxgBaoSTbLX"
```

---

### Task 6: Rebalance the three forms to the blueprint

**Files:**
- Create: `src/curriculum/grade5/quizzes.blueprint.test.ts`
- Modify: `src/curriculum/grade5/quizzes.ts`
- Modify: `src/curriculum/grade5/authored.test.ts` (diagnostic test)

**Interfaces:**
- Consumes: `GRADE_5_QUIZZES` (`./quizzes`), `GRADE_5_AUTHORED` (`./authored`), `GRADE_5_DOMAINS` (`./standards`), `QuizDefinition` (`../../types`).
- Produces: nothing later tasks import. `diagnostic-01`, `mock-ssa-01` and `mock-ssa-02` keep their ids, so `path.test.ts`, `pathSession.test.ts` and `ParentHome.test.tsx` are unaffected.

Findings covered: quizzes.ts blueprint (Medium), false "Calculator Inactive/Active" comments (Medium), module subtitle and mock subtitle wording.

Design, computed from the existing authored bank (OA 7, NBT 15, NF 12, MD 9, G 6 items; bands OA 9-13, NBT 25-29, NF 39-43, MD+G 19-23):

| Form | Items | OA | NBT | NF | MD+G (MD/G) | Shares (OA, NBT, NF, MD+G) |
|---|---|---|---|---|---|---|
| mock-ssa-01 | 29 | 3 | 8 | 12 | 6 (4/2) | 10.3, 27.6, 41.4, 20.7 |
| mock-ssa-02 | 19 | 2 | 5 | 8 | 4 (3/1) | 10.5, 26.3, 42.1, 21.1 |
| diagnostic-01 | 22 | 2 | 5 | 9 | 6 (4/2) | 9.1, 22.7, 40.9, 27.3 |

Only 12 NF items exist, so the two mock forms, each needing about 40% NF, must share NF items: 8 shared, no other overlap. The diagnostic keeps one item for every standard (17) and adds five NF items; with 6 MD+G standards it cannot reach the 19-23% band for any length that also keeps OA at 9%, so it is held to within 5 points of every band (the audit's recommended tolerance). Adding new NF items would remove the overlap but is out of scope (spec section 6).

- [ ] **Step 1: Write the failing blueprint test**

Create `src/curriculum/grade5/quizzes.blueprint.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { GRADE_5_QUIZZES } from './quizzes';
import { GRADE_5_AUTHORED } from './authored';
import { GRADE_5_DOMAINS, GRADE_5_STANDARDS } from './standards';
import quizzesSource from './quizzes.ts?raw';

/** The audit's recommended tolerance for the diagnostic, in percentage points. */
const BLUEPRINT_TOLERANCE_POINTS = 5;

const domainOfItem = new Map(GRADE_5_AUTHORED.map((q) => [q.id, q.domainId] as const));
const standardOfItem = new Map(GRADE_5_AUTHORED.map((q) => [q.id, q.standardCode] as const));

/** MD and G share one published band, so they count as one group. */
const groupOfDomain = new Map(GRADE_5_DOMAINS.map((d) => [d.id, d.weightGroup ?? d.id] as const));

const bands = new Map(
  GRADE_5_DOMAINS.map((d) => {
    const m = /(\d+)\D+(\d+)%/.exec(d.officialWeightRange);
    if (!m) throw new Error(`unparsable band ${d.officialWeightRange}`);
    return [d.weightGroup ?? d.id, { low: Number(m[1]), high: Number(m[2]) }] as const;
  }),
);

function quiz(id: string) {
  const q = GRADE_5_QUIZZES.find((x) => x.id === id);
  if (!q) throw new Error(`no quiz ${id}`);
  return q;
}

/** Percent of a form's items in each blueprint group. */
function shares(ids: string[]): Map<string, number> {
  const counts = new Map<string, number>();
  for (const id of ids) {
    const domain = domainOfItem.get(id);
    if (!domain) throw new Error(`form cites unknown item ${id}`);
    const group = groupOfDomain.get(domain)!;
    counts.set(group, (counts.get(group) ?? 0) + 1);
  }
  return new Map([...bands.keys()].map((g) => [g, ((counts.get(g) ?? 0) / ids.length) * 100] as const));
}

describe('Grade 5 forms follow the NCDPI blueprint (audit Medium)', () => {
  it.each(['mock-ssa-01', 'mock-ssa-02'])('%s: every domain share is inside its published band', (id) => {
    const ids = quiz(id).questionIds;
    for (const [group, pct] of shares(ids)) {
      const band = bands.get(group)!;
      expect(pct, `${id}: ${group} is ${pct.toFixed(1)}% of ${ids.length} items`).toBeGreaterThanOrEqual(band.low);
      expect(pct, `${id}: ${group} is ${pct.toFixed(1)}% of ${ids.length} items`).toBeLessThanOrEqual(band.high);
    }
  });

  it('diagnostic-01: every share is within the tolerance of its band, and every standard appears', () => {
    const ids = quiz('diagnostic-01').questionIds;
    for (const [group, pct] of shares(ids)) {
      const band = bands.get(group)!;
      expect(pct, `${group} is ${pct.toFixed(1)}% of ${ids.length} items`).toBeGreaterThanOrEqual(band.low - BLUEPRINT_TOLERANCE_POINTS);
      expect(pct, `${group} is ${pct.toFixed(1)}% of ${ids.length} items`).toBeLessThanOrEqual(band.high + BLUEPRINT_TOLERANCE_POINTS);
    }
    const covered = new Set(ids.map((id) => standardOfItem.get(id)));
    for (const s of GRADE_5_STANDARDS) expect(covered.has(s.code), `no item for ${s.code}`).toBe(true);
  });

  it('no form repeats an item', () => {
    for (const id of ['diagnostic-01', 'mock-ssa-01', 'mock-ssa-02']) {
      const ids = quiz(id).questionIds;
      expect(new Set(ids).size, id).toBe(ids.length);
    }
  });

  it('the two practice tests share only fraction items (only 12 exist, so a 40% share cannot be disjoint)', () => {
    const a = new Set(quiz('mock-ssa-01').questionIds);
    const shared = quiz('mock-ssa-02').questionIds.filter((id) => a.has(id));
    expect(shared.length).toBeGreaterThan(0);
    for (const id of shared) expect(domainOfItem.get(id), `${id} is shared`).toBe('NF');
  });

  it('quizzes.ts describes no calculator sections (audit Medium: the app flags each question)', () => {
    expect(quizzesSource).not.toMatch(/Calculator (Inactive|Active)/i);
  });

  it('the module and mock subtitles name line graphs, not line plots or above-grade stretch items', () => {
    expect(quizzesSource).not.toMatch(/line plots?|above-grade stretch/i);
  });
});
```

- [ ] **Step 2: Update the existing diagnostic test in `authored.test.ts`**

Replace the whole test
`it('the baseline diagnostic covers every standard exactly once', () => { ... });`
(including its `// Ruling F9` comment line above it) with:

```ts
  // Ruling F9: the baseline diagnostic must assess all 17 standards. Plan B2 adds
  // extra fraction items so the form reaches the blueprint, so each standard is
  // covered at least once rather than exactly once.
  it('the baseline diagnostic covers every standard at least once', () => {
    const diagnostic = GRADE_5_QUIZZES.find((q) => q.id === 'diagnostic-01')!;
    const byId = new Map(GRADE_5_AUTHORED.map((q) => [q.id, q]));
    const covered = new Set(diagnostic.questionIds.map((id) => byId.get(id)!.standardCode));
    expect(covered.size).toBe(codes.size);
  });
```

- [ ] **Step 3: Run to verify failures**

Run: `npx vitest run src/curriculum/grade5/quizzes.blueprint.test.ts`
Expected: FAIL. mock-ssa-01 is OA 10%, NBT 33%, NF 27%, MD+G 30%; mock-ssa-02 has NF 21%; the diagnostic NF share is 24%; the source still says "Calculator Inactive section", "fractional line plots" and "above-grade stretch items".

- [ ] **Step 4: Recompose the forms in `quizzes.ts`**

Replace the two constants `DIAGNOSTIC_QUESTION_IDS` and `MOCK_SSA_01_QUESTION_IDS` (from the line `// Named so the subtitle functions below can cite` through the closing `];` of `MOCK_SSA_01_QUESTION_IDS`) with:

```ts
// Named so the subtitle functions below can cite `.length` without
// depending on `this` inside an object literal.
//
// Form composition follows the NCDPI blueprint bands in standards.ts
// (OA 9-13%, NBT 25-29%, NF 39-43%, MD and G together 19-23%). Each question
// carries its own calculatorAllowed flag and the app applies it per question,
// so the forms are not split into calculator sections.
//
// Only 12 fraction items exist, so a form that is about 40% fractions cannot be
// disjoint from another. The two practice tests therefore share 8 fraction
// items and nothing else. The check-up keeps one item for every standard and
// adds five fraction items; it is held to within 5 points of each band.
// quizzes.blueprint.test.ts computes every share.

// 22 items: OA 2, NBT 5, NF 9, MD+G 6.
const DIAGNOSTIC_QUESTION_IDS = [
  'oa2-01', 'oa3-01',
  'nbt1-01', 'nbt3-01', 'nbt5-01', 'nbt6-01', 'nbt7-01',
  'nf1-01', 'nf1-02', 'nf1-03', 'nf3-01', 'nf3-02', 'nf4-01', 'nf4-02', 'nf7-01', 'nf7-02',
  'md1-01', 'md2-01', 'md4-01', 'md5-01',
  'g1-01', 'g3-01'
];

// 29 items: OA 3, NBT 8, NF 12, MD+G 6.
const MOCK_SSA_01_QUESTION_IDS = [
  'oa2-01', 'oa2-02', 'oa3-01',
  'nbt1-01', 'nbt1-02', 'nbt3-01', 'nbt3-02', 'nbt5-01', 'nbt6-01', 'nbt7-01', 'nbt7-03',
  'nf1-01', 'nf1-02', 'nf1-03', 'nf1-04', 'nf3-01', 'nf3-02', 'nf4-01', 'nf4-02', 'nf4-03', 'nf7-01', 'nf7-02', 'nf7-03',
  'md1-01', 'md2-01', 'md4-01', 'md5-01',
  'g1-01', 'g3-01'
];

// 19 items: OA 2, NBT 5, NF 8, MD+G 4. The 8 fraction items are the only ones
// shared with Form A.
const MOCK_SSA_02_QUESTION_IDS = [
  'oa2-03', 'oa3-02',
  'nbt1-03', 'nbt3-03', 'nbt5-02', 'nbt6-02', 'nbt7-04',
  'nf1-03', 'nf1-04', 'nf3-01', 'nf3-02', 'nf4-02', 'nf4-03', 'nf7-02', 'nf7-03',
  'md1-03', 'md2-02', 'md5-03',
  'g3-03'
];
```

In the `diagnostic-01` quiz object change `timeLimitMinutes: 45,` to `timeLimitMinutes: 50,`.

In the `mod-md-01` object replace the subtitle line with
`    subtitle: 'One-step unit conversions from a chart, line graphs of data over time, cubic volume, and composed prisms.',`

In the `mock-ssa-02` object replace the subtitle and question list. The whole object becomes:

```ts
  {
    id: 'mock-ssa-02',
    title: 'Full NC SSA Challenge Assessment (Form B)',
    subtitle: 'Harder multi-step word problems and expression items at Grade 5 level.',
    isMockAssessment: true,
    timeLimitMinutes: 65,
    questionIds: MOCK_SSA_02_QUESTION_IDS
  }
```

- [ ] **Step 5: Run tests, types, lint and the wider suite**

Run: `npx vitest run src/curriculum src/engine src/components/ParentHome.test.tsx`
Expected: PASS (`path.test.ts`, `pathSession.test.ts` and `ParentHome.test.tsx` reference the quiz ids, which are unchanged; `integrity.test.ts` resolves every id). Then `npm run typecheck` and `npm run lint`: clean.

- [ ] **Step 6: Commit**

```bash
git add src/curriculum/grade5/quizzes.blueprint.test.ts src/curriculum/grade5/quizzes.ts src/curriculum/grade5/authored.test.ts
git commit -m "fix(grade5): rebalance check-up and both practice tests to the blueprint bands" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01X5HSDdHPWxvHxgBaoSTbLX"
```

---

### Task 7: Content-version ledger and final gates

**Files:**
- Create: `src/curriculum/grade5/scope.contentVersion.test.ts`

**Interfaces:**
- Consumes: `GRADE_5_AUTHORED` from `./authored`.
- Produces: a guard that fails if a later edit bumps, or forgets to bump, a Grade 5 item.

- [ ] **Step 1: Write the ledger test**

Create `src/curriculum/grade5/scope.contentVersion.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { GRADE_5_AUTHORED } from './authored';

/** Every Grade 5 item whose key, options or math changed in Plan B2 and now
 *  carries contentVersion 2. g3-02 (trapezoid) is Plan B1's and is excluded
 *  from both sides of the check. */
const BUMPED_BY_B2 = [
  'g3-03',
  'md1-02', 'md1-03', 'md2-01', 'md2-02', 'md5-03',
  'nbt1-02', 'nbt7-04',
  'nf1-01', 'nf1-02', 'nf1-04', 'nf4-02', 'nf4-03', 'nf7-03',
  'oa2-01', 'oa2-02', 'oa2-03',
];

describe('Grade 5 content versions', () => {
  it('audit ledger: exactly the 17 rewritten items carry contentVersion 2', () => {
    expect(BUMPED_BY_B2).toHaveLength(17);
    for (const id of BUMPED_BY_B2) {
      const q = GRADE_5_AUTHORED.find((x) => x.id === id);
      expect(q, `${id} exists`).toBeTruthy();
      expect(q!.contentVersion, id).toBe(2);
    }
  });

  it('no other Grade 5 item was bumped by this plan (a bump on an unchanged key re-grades saved answers)', () => {
    for (const q of GRADE_5_AUTHORED) {
      if (BUMPED_BY_B2.includes(q.id) || q.id === 'g3-02') continue;
      expect(q.contentVersion ?? 1, q.id).toBe(1);
    }
  });
});
```

- [ ] **Step 2: Run it, then the whole gate**

Run: `npx vitest run src/curriculum/grade5/scope.contentVersion.test.ts`
Expected: PASS (every task above already set the versions, so this is a guard, not a driver).

Then run, in order, and expect each to pass cleanly:
- `npm run test:run`
- `npm run typecheck`
- `npm run lint`
- `npm run build`

- [ ] **Step 3: Confirm nothing out of scope is left in Grade 5**

Run: `git grep -nE "10\^|line plot|Calculator (Inactive|Active)" -- src/curriculum/grade5 ":(exclude)*.test.ts"`
Expected: no output (the test files quote these patterns on purpose, so they are excluded).

- [ ] **Step 4: Record the manual check the spec requires**

This is not code. Before Plan B ships, a parent or teacher compares NC-R1, NC-R3, NC-R6 and NC-R7 with the June 2025 NC DPI 5th grade unpacking document, which could not be downloaded when the rules table was written (spec section 3.1, `nc-rules.md` Unverified). Record the outcome in the PR description. If the 2025 wording differs, stop and revise the rule before merging.

- [ ] **Step 5: Commit**

```bash
git add src/curriculum/grade5/scope.contentVersion.test.ts
git commit -m "test(grade5): pin the 17 rewritten items' contentVersion" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01X5HSDdHPWxvHxgBaoSTbLX"
```

---

## Spec coverage

| Spec / audit item | Task |
|---|---|
| NC-R1 two operations, parentheses only (oa2-01, oa2-03, study-guide example, keyConcepts; oa2-02 found on re-read) | 1 |
| oa3-02 tip-as-misconception, oa3-03 "slope" and calculator flag (Medium) | 1 |
| NC-R3 nbt7-04 whole ÷ decimal, NBT.7 guide and standard (High) | 2 |
| NC-R4 nbt1-02 and the nbt1 generator: divide by 10 and 100 only, ×0.1 and ×0.01 added, no exponent (High) | 2 |
| nbt7-01 misconception wording, nbt3-02 comment (Low, one line) | 2 |
| NC-R6 nf1-01, nf1-02, nf1-04, nf1 generator families, NF.1 guide and standard (High/Medium) | 3 |
| NC-R7 nf4 generator, nf4-03 (Medium); nf4-02 denominator 9 found on re-read | 3 |
| NC-R8 nf7-03 (High) | 3 |
| NF.1 "#1 tested concept" unsupported claim (Medium) | 3 |
| NC-R9 md1-02, md1-03, "320 bowls" distractor, MD.1 guide example (High) | 4 |
| NC-R5 md2-01, md2-02, MD.2 standard, guide and "average" (High/Medium) | 4 |
| NC-R10 md5-03 (Medium) | 4 |
| md1 template "same length" wording (Low, one line) | 4 |
| NC-R11 g3-03 diagonals and kite (Medium) | 5 |
| Study-guide unsupported claims (NBT.6 "most common mistake on CASE" and the rest) (Medium) | 5 |
| Spec 3.2: forms rebalanced to blueprint bands with a test that computes shares (diagnostic-01, mock-ssa-01, mock-ssa-02) (Medium) | 6 |
| False "Calculator Inactive/Active" comments in quizzes.ts (Medium) | 6 |
| Spec 3.3: `contentVersion` bumped on every changed key, options or math (17 ids) | 1-5, ledger in 7 |
| Spec 3.1 manual check against the June 2025 unpacking documents | 7 (step 4) |
| Spec section 5: every fixed finding has a regression test naming it | 1-7 |
| NC-R2 trapezoid, `g3-02`, `NC.5.G.3` hierarchy keyConcept and guide trapezoid lines | Plan B1 (not this plan) |

## Deferred

Low findings and choices intentionally left:

- **Large numbers printed without thousands separators in generated options** (audit Low, "templates print large numbers without commas"). Adding commas changes `answerText` formatting and every template test that re-derives text, so it is not a one-line wording fix.
- **"Above-Grade Stretch" badge on in-scope items** `oa3-03`, `nbt3-03` and `g1-03`. They are NC scope but still carry `isStretch: true`, so the quiz screens badge them "Above-Grade". Not in the audit; the six items this plan rewrites lose the flag. Worth a follow-up.
- **`NC.5.OA.2` distributive-property keyConcept and study-guide rule** state `a × (b + c) = (a × b) + (a × c)`, which is a property statement with three operations on one side, not an evaluated expression. The NC standard names the distributive property, so it stays.
- **`NC.5.NF.7` study-guide rule `W ÷ (1/d) = W × d`** stays: it is the unit-fraction case only, which NC-R8 allows, not a general reciprocal rule.
- **Removing the 8-item fraction overlap between the two practice tests** needs new fraction items (spec section 6 excludes new questions).
- **Diagnostic strictly inside every band** is unreachable while it keeps one item per standard (see Task 6); it stays within 5 points.
