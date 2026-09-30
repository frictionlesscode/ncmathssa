# Parent Path Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the four-tab dashboard with a parent home page (readiness tracker, topics, path, one "Start next step" button), a distraction-free kid mode with instant feedback, and a breadth-first path of an optional check-up, three rounds and a practice test, with every in-progress session saved as it is answered.

**Architecture:** Four new pure engine modules derive everything from existing data: `path.ts` (where the child is on the path), `pace.ts` (on-track status and weekly plan), `sessionSummary.ts` (end-of-session results) and `pathSession.ts` (builds the next session). `activeSession.ts` defines a persisted in-progress session stored on the profile. `App.tsx` switches on a `Screen` union. Today's tab UI moves unchanged into `DetailedView.tsx`.

**Tech Stack:** React 19 + TypeScript, Vite, Tailwind, Vitest + Testing Library (`@testing-library/react`, `@testing-library/user-event`), `lucide-react` icons, oxlint.

**Spec:** `docs/superpowers/specs/2026-09-29-parent-path-design.md`

## Global Constraints

- No NC standard codes (`NC.5.NF.1`), domain ids (`NF`) or blueprint weight bands on the parent home page, kid mode, kid-done or summary screens. Topic names come from `topicName(domain)`.
- Passing bar is always `curriculum.ssa.passingPercent`, never a literal `80` in logic (display copy reads it too).
- Round exit sample: `ROUND_SAMPLE = 8`. Short-on-time threshold: `SHORT_ON_TIME_DAYS = 14`. On-track band: `ON_TRACK_BAND = 10` points. Default session size: `DEFAULT_SESSION_SIZE = 15`, clamped to 5–30.
- Review share of any composed session stays capped at `MAX_REVIEW_FRACTION` (0.4). Ruling F17 dedup (no repeated `questionRefId` in a session) must hold.
- Path position is **derived** from `profile.attempts` + `profile.checkupSkipped` on every render. Never persist a round or step.
- No retry of a missed question in kid mode. No parent lock.
- **No storage schema version bump.** All new `Profile` fields are optional, so a stored v2 blob is already valid. This deliberately deviates from spec §11 (which proposed `AppStateV3`): a bump would buy nothing and churn ten test fixtures.
- **Stopping a test-style session (check-up, Round 3, practice test, drill) pauses it**: the session stays saved and home shows "Continue". Only instant-feedback practice is graded on "Stop for today". This makes spec §6.3's "stopped early" rule concrete. Grading a half-finished practice test would record a misleading score.
- Encouragement lines are a fixed list.
- Every storage read/write keeps the existing try/catch behaviour in `state/storage.ts`.
- Commits end with:
  ```
  Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
  Claude-Session: https://claude.ai/code/session_01X5HSDdHPWxvHxgBaoSTbLX
  ```
- Commands: tests `npx vitest run <path>`, all tests `npm run test:run`, types `npm run typecheck`, lint `npm run lint`, build `npm run build`.

## Review Focus

1. **Saved session whose questions no longer resolve** (content changed between deploys, or the student's grade was changed). Kid mode and the test runner must show a "can't continue" message with a discard button, not crash. Pinned in Task 10 (KidPractice) and Task 9 (QuizRunner).
2. **Tab closed after "Check my answer" but before "Next".** On resume the child sees the feedback for that answered question, not the question again (no retry). Pinned in Task 10.
3. **Double click on the last "Next"/"Got it".** Must record exactly one attempt. Pinned in Task 10.
4. **Out-of-range session size** (0, 500, empty, non-number from the settings input or old data) is clamped to 5–30. Pinned in Task 6.
5. **Switching student while one student has a saved session.** The other student's home shows no "Continue". Pinned in Task 14.

---

## File map

| File | Status | Responsibility |
|---|---|---|
| `src/curriculum/types.ts` | modify | `DomainInfo.parentName?` |
| `src/curriculum/grade{1..5}/standards.ts` | modify | a `parentName` per domain |
| `src/curriculum/registry.ts` | modify | `topicName()` |
| `src/engine/mastery.ts` | modify | gains `domainStatsFor` + `DomainStats` (moved from context) |
| `src/context/ProgressContext.tsx` | modify | re-exports `domainStatsFor`; adds `completeSession` |
| `src/engine/path.ts` | create | `buildPath`, `daysUntil`, `isShortOnTime`, `sampleSizeFor`, constants |
| `src/engine/pace.ts` | create | `computePace` |
| `src/engine/sessionSummary.ts` | create | `summarizeAttempt` |
| `src/engine/sessionComposer.ts` | modify | optional `plan` input |
| `src/engine/activeSession.ts` | create | `ActiveSession` model, grading, `sessionSizeOf` |
| `src/state/types.ts` | modify | optional `activeSession`, `checkupSkipped`, `sessionSize` |
| `src/engine/drills.ts` | create | drill factories moved out of `curriculum/grade5/quizzes.ts` |
| `src/engine/pathSession.ts` | create | `sessionForStep` |
| `src/components/QuizRunner.tsx` | modify | reads/writes `ActiveSession`; "Stop for today" pauses |
| `src/components/KidPractice.tsx` | create | instant-feedback runner |
| `src/components/KidDone.tsx` | create | child's end screen |
| `src/components/SessionSummary.tsx` | create | parent's end-of-session summary |
| `src/components/ParentHome.tsx` | create | tracker, topics, path, footer |
| `src/components/WhoIsPracticing.tsx` | create | student picker |
| `src/components/FirstRunScreen.tsx` | modify | optional `onCancel` |
| `src/components/StudyPaceModal.tsx` | modify | "Questions per session" field |
| `src/components/DetailedView.tsx` | create | today's Navbar + tabs + modals, moved from `App.tsx` |
| `src/App.tsx` | rewrite | `Screen` union and flow |
| `README.md` | modify | describe the new flow |

---

### Task 1: Plain-English topic names

**Files:**
- Modify: `src/curriculum/types.ts` (the `DomainInfo` interface)
- Modify: `src/curriculum/grade1/standards.ts`, `grade2/standards.ts`, `grade3/standards.ts`, `grade4/standards.ts`, `grade5/standards.ts`
- Modify: `src/curriculum/registry.ts`
- Test: `src/curriculum/registry.test.ts`

**Interfaces:**
- Produces: `DomainInfo.parentName?: string`; `topicName(domain: DomainInfo): string` exported from `src/curriculum/registry.ts` (returns `parentName`, falling back to `shortName`).

- [ ] **Step 1: Write the failing test.** Append to `src/curriculum/registry.test.ts` (add `topicName` to its existing import from `./registry`, and import `listCurricula`/`getCurriculum` if not already imported):

```ts
describe('parent-facing topic names', () => {
  it('gives every domain in every grade a plain parentName with no codes', () => {
    for (const c of listCurricula()) {
      for (const d of c.domains) {
        expect(d.parentName, `grade ${c.grade} ${d.id}`).toBeTruthy();
        expect(d.parentName).not.toMatch(/NC\.|\b(OA|NBT|NF|MD|G)\b/);
      }
    }
  });

  it('topicName prefers parentName and falls back to shortName', () => {
    const d = getCurriculum(5).domains[0];
    expect(topicName(d)).toBe(d.parentName);
    expect(topicName({ ...d, parentName: undefined })).toBe(d.shortName);
  });
});
```

- [ ] **Step 2: Run it and confirm it fails.** Run: `npx vitest run src/curriculum/registry.test.ts`. Expected: FAIL (`topicName` is not exported).

- [ ] **Step 3: Add the field.** In `src/curriculum/types.ts`, inside `interface DomainInfo`, directly after `shortName: string;` add:

```ts
  /** What a parent sees on the home page: plain words, no codes. Optional in
   *  the type so hand-built test fixtures stay valid; the registry test
   *  asserts every shipped domain has one. Read it through topicName(). */
  parentName?: string;
```

- [ ] **Step 4: Add the names.** In each file, add a `parentName` line directly after the domain's `shortName:` line (same indentation):

| File | Domain `id` | `parentName` |
|---|---|---|
| grade1/standards.ts | OA | `'Adding & subtracting'` |
| grade1/standards.ts | NBT | `'Tens & ones'` |
| grade1/standards.ts | MD | `'Measuring, time & money'` |
| grade1/standards.ts | G | `'Shapes'` |
| grade2/standards.ts | OA | `'Adding & subtracting'` |
| grade2/standards.ts | NBT | `'Place value to 1,000'` |
| grade2/standards.ts | MD | `'Measuring, time & money'` |
| grade2/standards.ts | G | `'Shapes'` |
| grade3/standards.ts | OA | `'Multiplying & dividing'` |
| grade3/standards.ts | NF | `'Fractions'` |
| grade3/standards.ts | MD | `'Measuring, area & perimeter'` |
| grade3/standards.ts | G | `'Shapes'` |
| grade3/standards.ts | NBT | `'Place value & rounding'` |
| grade4/standards.ts | NF | `'Fractions & decimals'` |
| grade4/standards.ts | NBT | `'Big numbers & place value'` |
| grade4/standards.ts | MD | `'Measuring & angles'` |
| grade4/standards.ts | G | `'Lines, angles & symmetry'` |
| grade4/standards.ts | OA | `'Patterns & word problems'` |
| grade5/standards.ts | NF | `'Fractions'` |
| grade5/standards.ts | NBT | `'Decimals & place value'` |
| grade5/standards.ts | MD | `'Measurement & volume'` |
| grade5/standards.ts | OA | `'Expressions & patterns'` |
| grade5/standards.ts | G | `'Graphing & shapes'` |

Example (grade5, NF):

```ts
    shortName: 'Fractions Operations',
    parentName: 'Fractions',
```

- [ ] **Step 5: Add `topicName`.** In `src/curriculum/registry.ts` add (import `DomainInfo` from `./types` if it is not already imported):

```ts
/** The parent-facing name of a topic (domain): plain words, never a code. */
export function topicName(domain: DomainInfo): string {
  return domain.parentName ?? domain.shortName;
}
```

- [ ] **Step 6: Run the tests.** Run: `npx vitest run src/curriculum`. Expected: PASS.

- [ ] **Step 7: Commit.**

```bash
git add src/curriculum
git commit -m "feat: plain-English topic names for parents" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01X5HSDdHPWxvHxgBaoSTbLX"
```

---

### Task 2: Path engine (`src/engine/path.ts`)

**Files:**
- Modify: `src/engine/mastery.ts` (receives `domainStatsFor`)
- Modify: `src/context/ProgressContext.tsx` (re-exports it)
- Create: `src/engine/path.ts`
- Test: `src/engine/path.test.ts`

**Interfaces:**
- Consumes: `topicName` (Task 1); `masteryByStandard`, `masteryStatus`, `MasteryStatus` from `engine/mastery.ts`.
- Produces (all exported from `src/engine/path.ts`):
  ```ts
  export const ROUND_SAMPLE = 8;
  export const SHORT_ON_TIME_DAYS = 14;
  export const PRACTICE_QUIZ_PREFIX = 'path-practice-';
  export const ROUND3_QUIZ_PREFIX = 'path-round3-';
  export type Round = 1 | 2 | 3;
  export interface TopicProgress { domainId: DomainId; name: string; status: MasteryStatus; answered: number; round: Round | 'done'; roundsFinished: number; strongFromCheckup: boolean }
  export type NextStep =
    | { kind: 'checkup'; quizId: string }
    | { kind: 'practice'; round: 1 | 2 }
    | { kind: 'round3' }
    | { kind: 'practice-test'; quizId: string };
  export interface PathState { topics: TopicProgress[]; checkupDone: boolean; checkupQuizId?: string; currentRound: Round | 'test'; activeDomains: DomainId[]; roundTopicsDone: number; roundsFinished: number; roundsTotal: number; shortOnTime: boolean; practiceTestQuizId?: string; practiceTestPassedAt?: string; next: NextStep }
  export function daysUntil(date: string, now: Date): number | null;
  export function isShortOnTime(testDate: string, now: Date): boolean;
  export function sampleSizeFor(c: GradeCurriculum, standards: StandardCode[]): number;
  export function buildPath(input: { curriculum: GradeCurriculum; attempts: QuizAttempt[]; checkupSkipped: boolean; testDate: string; now: Date }): PathState;
  ```
- Produces: `domainStatsFor(domain, mastery, passingPercent): DomainStats` and `DomainStats` now exported from `src/engine/mastery.ts` (still re-exported from `ProgressContext.tsx`, so existing imports keep working).

- [ ] **Step 1: Move `domainStatsFor` into the engine.** An engine module must not import the React context. Cut the `DomainStats` interface and the `domainStatsFor` function (with its doc comment) out of `src/context/ProgressContext.tsx` and paste them unchanged at the end of `src/engine/mastery.ts`. In `mastery.ts`, add `DomainInfo` to the type import from `'../curriculum/types'`. In `ProgressContext.tsx`, where the functions were, add:

```ts
// Moved to the engine so pure modules (engine/path.ts) can use it without
// importing React context; re-exported so existing imports keep working.
export { domainStatsFor } from '../engine/mastery';
export type { DomainStats } from '../engine/mastery';
```

If `ProgressContext.tsx` itself calls `domainStatsFor` elsewhere, also add `domainStatsFor` to its existing `import { ... } from '../engine/mastery'`. Run: `npx vitest run && npm run typecheck`. Expected: PASS (pure move).

- [ ] **Step 2: Write the failing tests.** Create `src/engine/path.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { getCurriculum } from '../curriculum/registry';
import type { GradeCurriculum, StandardCode } from '../curriculum/types';
import type { QuizAttempt, QuizAttemptAnswer } from '../types';
import {
  buildPath, daysUntil, isShortOnTime, sampleSizeFor,
  ROUND_SAMPLE, ROUND3_QUIZ_PREFIX, PRACTICE_QUIZ_PREFIX,
} from './path';

const c5 = getCurriculum(5);
const NOW = new Date(2026, 8, 30, 12); // 30 Sep 2026, local noon
const withContent = new Set(c5.source.allStandardsWithContent());
const domainIds = c5.domains.filter((d) => d.standards.some((s) => withContent.has(s.code))).map((d) => d.id);
const codeOf = (domainId: string): StandardCode =>
  c5.domains.find((d) => d.id === domainId)!.standards.find((s) => withContent.has(s.code))!.code;
const needFor = (domainId: string) =>
  sampleSizeFor(c5, c5.domains.find((d) => d.id === domainId)!.standards.map((s) => s.code).filter((c) => withContent.has(c)));

let seq = 0;
function attempt(quizId: string, answers: [StandardCode, boolean][], passing?: boolean): QuizAttempt {
  seq += 1;
  const at = new Date(Date.UTC(2026, 8, 1, 0, 0, seq)).toISOString();
  const rec: Record<string, QuizAttemptAnswer> = {};
  answers.forEach(([code, ok], i) => {
    rec[`q${seq}-${i}`] = { questionId: `q${seq}-${i}`, studentAnswer: 'A', isCorrect: ok, standardCode: code };
  });
  const correct = answers.filter(([, ok]) => ok).length;
  const pct = answers.length ? (correct / answers.length) * 100 : 0;
  return {
    id: `a${seq}`, quizId, quizTitle: quizId, completedAt: at,
    scoreRaw: correct, scoreTotal: answers.length, scorePercent: pct,
    isPassingSSA: passing ?? pct >= c5.ssa.passingPercent, timeElapsedSeconds: 0, answers: rec,
  };
}
const many = (domainId: string, n: number, ok: boolean): [StandardCode, boolean][] =>
  Array.from({ length: n }, () => [codeOf(domainId), ok]);
const everyTopic = (n: number, ok: boolean) => domainIds.flatMap((d) => many(d, n, ok));
const diagnosticId = c5.quizzes.find((q) => q.isDiagnostic)!.id;
const base = { curriculum: c5, checkupSkipped: false, testDate: '', now: NOW };

describe('daysUntil / isShortOnTime', () => {
  it('returns null for an empty or malformed date', () => {
    expect(daysUntil('', NOW)).toBeNull();
    expect(daysUntil('next week', NOW)).toBeNull();
  });
  it('counts whole local days', () => {
    expect(daysUntil('2026-09-30', NOW)).toBe(0);
    expect(daysUntil('2026-10-01', NOW)).toBe(1);
    expect(daysUntil('2026-09-20', NOW)).toBe(-10);
  });
  it('is short on time from today through 14 days out, not after the date', () => {
    expect(isShortOnTime('2026-10-14', NOW)).toBe(true);
    expect(isShortOnTime('2026-10-15', NOW)).toBe(false);
    expect(isShortOnTime('2026-09-29', NOW)).toBe(false);
    expect(isShortOnTime('', NOW)).toBe(false);
  });
});

describe('sampleSizeFor', () => {
  const stub = (hasGen: boolean, authored: number) =>
    ({ source: {
      hasGenerator: () => hasGen,
      authoredFor: () => Array.from({ length: authored }, (_, i) => ({ kind: 'authored', id: `x${i}` })),
    } }) as unknown as GradeCurriculum;
  it('is ROUND_SAMPLE when any standard has a generator', () => {
    expect(sampleSizeFor(stub(true, 0), ['a'])).toBe(ROUND_SAMPLE);
  });
  it('shrinks to the authored count for a thin topic, never below 1', () => {
    expect(sampleSizeFor(stub(false, 3), ['a'])).toBe(3);
    expect(sampleSizeFor(stub(false, 0), ['a'])).toBe(1);
  });
});

describe('buildPath', () => {
  it('offers the check-up first to a fresh student', () => {
    const p = buildPath({ ...base, attempts: [] });
    expect(p.next).toEqual({ kind: 'checkup', quizId: diagnosticId });
    expect(p.checkupDone).toBe(false);
    expect(p.currentRound).toBe(1);
    expect(p.topics.map((t) => t.domainId)).toEqual(domainIds);
    expect(p.topics.every((t) => t.round === 1 && t.status === 'untested')).toBe(true);
  });

  it('goes straight to Round 1 practice when the check-up is skipped', () => {
    const p = buildPath({ ...base, checkupSkipped: true, attempts: [] });
    expect(p.next).toEqual({ kind: 'practice', round: 1 });
  });

  it('starts a topic the check-up found strong at Round 2', () => {
    const [strong, ...rest] = domainIds;
    const checkup = attempt(diagnosticId, [...many(strong, 2, true), ...rest.flatMap((d) => many(d, 2, false))]);
    const p = buildPath({ ...base, attempts: [checkup] });
    const t = p.topics.find((x) => x.domainId === strong)!;
    expect(p.checkupDone).toBe(true);
    expect(t.strongFromCheckup).toBe(true);
    expect(t.round).toBe(2);
    expect(p.currentRound).toBe(1);
    expect(p.activeDomains).not.toContain(strong);
    expect(p.roundTopicsDone).toBe(1);
    expect(p.next).toEqual({ kind: 'practice', round: 1 });
  });

  it('finishes Round 1 for a topic once it has enough answers, right or wrong', () => {
    const answers = domainIds.flatMap((d) => [...many(d, needFor(d), false)]);
    const p = buildPath({ ...base, checkupSkipped: true, attempts: [attempt(`${PRACTICE_QUIZ_PREFIX}1`, answers)] });
    expect(p.topics.every((t) => t.round === 2)).toBe(true);
    expect(p.currentRound).toBe(2);
    expect(p.next).toEqual({ kind: 'practice', round: 2 });
  });

  it('keeps the whole path in Round 1 while any topic is still in it', () => {
    const [lagging, ...rest] = domainIds;
    const answers = rest.flatMap((d) => many(d, needFor(d), true));
    const p = buildPath({ ...base, checkupSkipped: true, attempts: [attempt(`${PRACTICE_QUIZ_PREFIX}1`, answers)] });
    expect(p.currentRound).toBe(1);
    expect(p.activeDomains).toEqual([lagging]);
  });

  it('finishes Round 2 on the last N answers, not the lifetime average', () => {
    const d = domainIds[0];
    const n = needFor(d);
    const improved = buildPath({ ...base, checkupSkipped: true,
      attempts: [attempt(`${PRACTICE_QUIZ_PREFIX}1`, [...many(d, n, false), ...many(d, n, true)])] });
    expect(improved.topics[0].round).toBe(3);
    const slipped = buildPath({ ...base, checkupSkipped: true,
      attempts: [attempt(`${PRACTICE_QUIZ_PREFIX}1`, [...many(d, n, true), ...many(d, n, false)])] });
    expect(slipped.topics[0].round).toBe(2);
  });

  it('counts only Round 3 sessions toward Round 3, then offers the practice test forms in turn', () => {
    const practice = attempt(`${PRACTICE_QUIZ_PREFIX}1`, domainIds.flatMap((d) => many(d, needFor(d), true)));
    const inRound3 = buildPath({ ...base, checkupSkipped: true, attempts: [practice] });
    expect(inRound3.currentRound).toBe(3);
    expect(inRound3.next).toEqual({ kind: 'round3' });

    const r3 = attempt(`${ROUND3_QUIZ_PREFIX}1`, domainIds.flatMap((d) => many(d, needFor(d), true)));
    const done = buildPath({ ...base, checkupSkipped: true, attempts: [practice, r3] });
    expect(done.currentRound).toBe('test');
    expect(done.topics.every((t) => t.round === 'done')).toBe(true);
    expect(done.next).toEqual({ kind: 'practice-test', quizId: 'mock-ssa-01' });

    const tookA = attempt('mock-ssa-01', everyTopic(1, true), false);
    const after = buildPath({ ...base, checkupSkipped: true, attempts: [practice, r3, tookA] });
    expect(after.next).toEqual({ kind: 'practice-test', quizId: 'mock-ssa-02' });
    expect(after.practiceTestPassedAt).toBeUndefined();
  });

  it('records when a practice test was passed', () => {
    const passed = attempt('mock-ssa-01', everyTopic(1, true), true);
    const p = buildPath({ ...base, attempts: [passed] });
    expect(p.practiceTestPassedAt).toBe(passed.completedAt);
  });

  it('in short-on-time mode skips Round 1, then offers the practice test instead of Round 3', () => {
    const soon = { ...base, testDate: '2026-10-10', checkupSkipped: true };
    const fresh = buildPath({ ...soon, attempts: [] });
    expect(fresh.shortOnTime).toBe(true);
    expect(fresh.currentRound).toBe(2);
    expect(fresh.next).toEqual({ kind: 'practice', round: 2 });

    const allGood = attempt(`${PRACTICE_QUIZ_PREFIX}1`, domainIds.flatMap((d) => many(d, needFor(d), true)));
    const ready = buildPath({ ...soon, attempts: [allGood] });
    expect(ready.currentRound).toBe('test');
    expect(ready.next.kind).toBe('practice-test');
    expect(ready.roundsTotal).toBe(domainIds.length * 2);
  });

  it('ignores answers whose standard is not in this grade', () => {
    const p = buildPath({ ...base, checkupSkipped: true,
      attempts: [attempt(`${PRACTICE_QUIZ_PREFIX}1`, [['NC.3.OA.1', true], ['NC.3.OA.1', true]])] });
    expect(p.topics.every((t) => t.answered === 0)).toBe(true);
  });
});
```

- [ ] **Step 3: Run and confirm failure.** Run: `npx vitest run src/engine/path.test.ts`. Expected: FAIL (module `./path` not found).

- [ ] **Step 4: Implement `src/engine/path.ts`.**

```ts
import type { DomainId, GradeCurriculum, StandardCode } from '../curriculum/types';
import { topicName } from '../curriculum/registry';
import type { QuizAttempt } from '../types';
import { domainStatsFor, masteryByStandard, type MasteryStatus } from './mastery';

/** How many recent answers a round's exit rule looks at (spec 5.3). */
export const ROUND_SAMPLE = 8;
/** A test date this close switches the path to short-on-time mode (spec 5.5). */
export const SHORT_ON_TIME_DAYS = 14;
/** quizId prefixes for sessions the path composes, so history can tell a
 *  Round 3 (test-style) session apart from ordinary practice. */
export const PRACTICE_QUIZ_PREFIX = 'path-practice-';
export const ROUND3_QUIZ_PREFIX = 'path-round3-';

export type Round = 1 | 2 | 3;

export interface TopicProgress {
  domainId: DomainId;
  name: string;
  status: MasteryStatus;
  answered: number;
  /** The first round this topic has not finished, or 'done'. */
  round: Round | 'done';
  roundsFinished: number;
  strongFromCheckup: boolean;
}

export type NextStep =
  | { kind: 'checkup'; quizId: string }
  | { kind: 'practice'; round: 1 | 2 }
  | { kind: 'round3' }
  | { kind: 'practice-test'; quizId: string };

export interface PathState {
  topics: TopicProgress[];
  checkupDone: boolean;
  checkupQuizId?: string;
  currentRound: Round | 'test';
  /** Topics still working on currentRound; what the next session draws from. */
  activeDomains: DomainId[];
  roundTopicsDone: number;
  /** Topic-rounds finished and available, for the pace estimate. */
  roundsFinished: number;
  roundsTotal: number;
  shortOnTime: boolean;
  /** The practice-test form to offer next (least recently taken). */
  practiceTestQuizId?: string;
  practiceTestPassedAt?: string;
  next: NextStep;
}

const DAY_MS = 86_400_000;

/** Whole local days from today to a 'YYYY-MM-DD' date (negative once it has
 *  passed), or null when no valid date is set. */
export function daysUntil(date: string, now: Date): number | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return null;
  const [y, m, d] = date.split('-').map(Number);
  const target = new Date(y, m - 1, d);
  if (Number.isNaN(target.getTime())) return null;
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return Math.round((target.getTime() - today.getTime()) / DAY_MS);
}

export function isShortOnTime(testDate: string, now: Date): boolean {
  const d = daysUntil(testDate, now);
  return d !== null && d >= 0 && d <= SHORT_ON_TIME_DAYS;
}

/** The answer count a round's exit rule uses for one topic: ROUND_SAMPLE,
 *  or fewer when the topic has fewer distinct questions than that, so a
 *  thin topic can never stall the path (spec 5.3). */
export function sampleSizeFor(c: GradeCurriculum, standards: StandardCode[]): number {
  if (standards.some((s) => c.source.hasGenerator(s))) return ROUND_SAMPLE;
  const authored = standards.reduce((n, s) => n + c.source.authoredFor(s).length, 0);
  return Math.max(1, Math.min(ROUND_SAMPLE, authored));
}

function percent(xs: boolean[]): number {
  return xs.length === 0 ? 0 : (xs.filter(Boolean).length / xs.length) * 100;
}

function push<K, V>(m: Map<K, V[]>, k: K, v: V) {
  const list = m.get(k);
  if (list) list.push(v);
  else m.set(k, [v]);
}

export function buildPath(input: {
  curriculum: GradeCurriculum;
  attempts: QuizAttempt[];
  checkupSkipped: boolean;
  testDate: string;
  now: Date;
}): PathState {
  const { curriculum: c, attempts, checkupSkipped, testDate, now } = input;
  const passing = c.ssa.passingPercent;
  const shortOnTime = isShortOnTime(testDate, now);
  const withContent = new Set(c.source.allStandardsWithContent());

  const domainByStandard = new Map<StandardCode, DomainId>();
  for (const d of c.domains) for (const s of d.standards) domainByStandard.set(s.code, d.id);

  // Stored newest-first; the exit rules need oldest-first.
  const chronological = [...attempts].sort((a, b) => a.completedAt.localeCompare(b.completedAt));

  const diagnostic = c.quizzes.find((q) => q.isDiagnostic);
  const checkups = diagnostic ? chronological.filter((a) => a.quizId === diagnostic.id) : [];
  const lastCheckup = checkups[checkups.length - 1];

  const all = new Map<DomainId, boolean[]>();
  const round3 = new Map<DomainId, boolean[]>();
  for (const a of chronological) {
    const isRound3 = a.quizId.startsWith(ROUND3_QUIZ_PREFIX);
    for (const ans of Object.values(a.answers)) {
      const d = domainByStandard.get(ans.standardCode);
      if (!d) continue; // another grade's content
      push(all, d, ans.isCorrect);
      if (isRound3) push(round3, d, ans.isCorrect);
    }
  }

  const checkupStrong = new Set<DomainId>();
  if (lastCheckup) {
    const byDomain = new Map<DomainId, boolean[]>();
    for (const ans of Object.values(lastCheckup.answers)) {
      const d = domainByStandard.get(ans.standardCode);
      if (d) push(byDomain, d, ans.isCorrect);
    }
    for (const [d, xs] of byDomain) if (percent(xs) >= passing) checkupStrong.add(d);
  }

  const mastery = masteryByStandard(attempts, c);
  const maxRounds = shortOnTime ? 2 : 3;

  const topics: TopicProgress[] = c.domains
    .map((d) => ({ d, codes: d.standards.map((s) => s.code).filter((code) => withContent.has(code)) }))
    .filter(({ codes }) => codes.length > 0)
    .map(({ d, codes }) => {
      const need = sampleSizeFor(c, codes);
      const xs = all.get(d.id) ?? [];
      const r3xs = round3.get(d.id) ?? [];
      const passes = (list: boolean[]) => list.length >= need && percent(list.slice(-need)) >= passing;
      const status = domainStatsFor(d, mastery, passing).status;
      const strongFromCheckup = checkupStrong.has(d.id);

      const r1 = shortOnTime || strongFromCheckup || xs.length >= need;
      // Short on time: Round 2 is only for the red and yellow topics.
      const r2 = r1 && (passes(xs) || (shortOnTime && status === 'acceleration-ready'));
      const r3 = r2 && passes(r3xs);
      const roundsFinished = r3 ? 3 : r2 ? 2 : r1 ? 1 : 0;
      return {
        domainId: d.id,
        name: topicName(d),
        status,
        answered: xs.length,
        round: r3 ? 'done' : ((roundsFinished + 1) as Round),
        roundsFinished,
        strongFromCheckup,
      } satisfies TopicProgress;
    });

  // Short on time, Round 3 is optional, so it never holds the path back.
  const open = topics.filter((t) => t.round !== 'done' && !(shortOnTime && t.round === 3));
  const currentRound: Round | 'test' =
    open.length === 0 ? 'test' : (Math.min(...open.map((t) => t.round as Round)) as Round);
  const activeDomains =
    currentRound === 'test' ? [] : topics.filter((t) => t.round === currentRound).map((t) => t.domainId);

  const mocks = c.quizzes.filter((q) => q.isMockAssessment);
  const lastTaken = (id: string) => {
    const xs = chronological.filter((a) => a.quizId === id);
    return xs.length ? xs[xs.length - 1].completedAt : '';
  };
  // Stable sort: never-taken forms keep their declared order.
  const nextMock = [...mocks].sort((a, b) => lastTaken(a.id).localeCompare(lastTaken(b.id)))[0];
  const mockIds = new Set(mocks.map((m) => m.id));
  const passedMock = chronological.filter((a) => mockIds.has(a.quizId) && a.isPassingSSA).pop();

  const checkupDone = checkups.length > 0;
  let next: NextStep;
  if (diagnostic && !checkupDone && !checkupSkipped) next = { kind: 'checkup', quizId: diagnostic.id };
  else if (currentRound === 1 || currentRound === 2) next = { kind: 'practice', round: currentRound };
  else if (currentRound === 3) next = { kind: 'round3' };
  else next = nextMock ? { kind: 'practice-test', quizId: nextMock.id } : { kind: 'round3' };

  return {
    topics,
    checkupDone,
    checkupQuizId: diagnostic?.id,
    currentRound,
    activeDomains,
    roundTopicsDone: topics.length - activeDomains.length,
    roundsFinished: topics.reduce((n, t) => n + Math.min(t.roundsFinished, maxRounds), 0),
    roundsTotal: topics.length * maxRounds,
    shortOnTime,
    practiceTestQuizId: nextMock?.id,
    practiceTestPassedAt: passedMock?.completedAt,
    next,
  };
}
```

- [ ] **Step 5: Run the tests.** Run: `npx vitest run src/engine/path.test.ts`. Expected: PASS. If the "strong from check-up" test fails because a Grade 5 domain has fewer answers than expected, re-read the test's assumptions rather than loosening the implementation.

- [ ] **Step 6: Run everything and typecheck.** Run: `npm run test:run && npm run typecheck`. Expected: PASS.

- [ ] **Step 7: Commit.**

```bash
git add src/engine/mastery.ts src/context/ProgressContext.tsx src/engine/path.ts src/engine/path.test.ts
git commit -m "feat: derive the check-up, rounds and practice-test path from history" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01X5HSDdHPWxvHxgBaoSTbLX"
```

---

### Task 3: Pace engine (`src/engine/pace.ts`)

**Files:**
- Create: `src/engine/pace.ts`
- Test: `src/engine/pace.test.ts`

**Interfaces:**
- Consumes: `PathState`, `daysUntil`, `ROUND_SAMPLE` from `./path` (Task 2).
- Produces:
  ```ts
  export const ON_TRACK_BAND = 10;
  export const NEW_QUESTION_SHARE = 0.6;
  export type DateState = 'none' | 'passed' | 'short' | 'normal';
  export type PaceStatus = 'on-track' | 'behind' | 'ahead';
  export interface Pace { dateState: DateState; daysLeft: number | null; status?: PaceStatus; sessionsPerWeek?: number }
  export function computePace(input: { path: PathState; attempts: QuizAttempt[]; testDate: string; now: Date; sessionSize: number }): Pace;
  ```

- [ ] **Step 1: Write the failing tests.** Create `src/engine/pace.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { computePace } from './pace';
import type { PathState } from './path';
import type { QuizAttempt } from '../types';

const NOW = new Date(2026, 8, 30, 12);
const path = (over: Partial<PathState> = {}): PathState => ({
  topics: [], checkupDone: true, currentRound: 1, activeDomains: [], roundTopicsDone: 0,
  roundsFinished: 0, roundsTotal: 15, shortOnTime: false, next: { kind: 'practice', round: 1 }, ...over,
});
const attemptAt = (iso: string) => ({ completedAt: iso }) as QuizAttempt;
const input = (over: Partial<Parameters<typeof computePace>[0]> = {}) => ({
  path: path(), attempts: [] as QuizAttempt[], testDate: '2026-11-25', now: NOW, sessionSize: 15, ...over,
});

describe('computePace', () => {
  it('reports no date', () => {
    expect(computePace(input({ testDate: '' }))).toEqual({ dateState: 'none', daysLeft: null });
  });

  it('reports a passed date with no status', () => {
    const p = computePace(input({ testDate: '2026-09-01' }));
    expect(p.dateState).toBe('passed');
    expect(p.status).toBeUndefined();
  });

  it('reports short when the path is short on time', () => {
    expect(computePace(input({ testDate: '2026-10-05', path: path({ shortOnTime: true }) })).dateState).toBe('short');
  });

  it('is on track with no history yet', () => {
    const p = computePace(input());
    expect(p.dateState).toBe('normal');
    expect(p.status).toBe('on-track');
  });

  it('is behind when most of the time is gone and little is done', () => {
    const p = computePace(input({ attempts: [attemptAt('2026-07-01T00:00:00Z')], testDate: '2026-10-10',
      path: path({ roundsFinished: 1 }) }));
    expect(p.status).toBe('behind');
  });

  it('is ahead when a lot is done early', () => {
    const p = computePace(input({ attempts: [attemptAt('2026-09-29T00:00:00Z')],
      path: path({ roundsFinished: 10 }) }));
    expect(p.status).toBe('ahead');
  });

  it('suggests between 1 and 7 sessions a week', () => {
    const lots = computePace(input({ testDate: '2026-10-02', path: path({ roundsFinished: 0, roundsTotal: 15 }) }));
    expect(lots.sessionsPerWeek).toBe(7);
    const none = computePace(input({ path: path({ roundsFinished: 15, practiceTestPassedAt: 'x' }) }));
    expect(none.sessionsPerWeek).toBe(1);
  });

  it('estimates remaining sessions from rounds left and session size', () => {
    // 15 topic-rounds x 8 answers / (15 x 0.6 ≈ 9 new per session) = 14 sessions, +1 practice test = 15.
    // 56 days = 8 weeks -> ceil(15 / 8) = 2 a week.
    const p = computePace(input({ testDate: '2026-11-25' }));
    expect(p.sessionsPerWeek).toBe(2);
  });
});
```

- [ ] **Step 2: Run and confirm failure.** Run: `npx vitest run src/engine/pace.test.ts`. Expected: FAIL (module not found).

- [ ] **Step 3: Implement `src/engine/pace.ts`.**

```ts
import type { QuizAttempt } from '../types';
import { daysUntil, ROUND_SAMPLE, type PathState } from './path';

/** Within this many percentage points of where the calendar says the child
 *  should be counts as "On track" (spec 4.1). */
export const ON_TRACK_BAND = 10;
/** Share of a composed session that is new content rather than review
 *  (1 - MAX_REVIEW_FRACTION), for the sessions-left estimate. */
export const NEW_QUESTION_SHARE = 0.6;

export type DateState = 'none' | 'passed' | 'short' | 'normal';
export type PaceStatus = 'on-track' | 'behind' | 'ahead';

export interface Pace {
  dateState: DateState;
  daysLeft: number | null;
  status?: PaceStatus;
  sessionsPerWeek?: number;
}

const DAY_MS = 86_400_000;

export function computePace(input: {
  path: PathState;
  attempts: QuizAttempt[];
  testDate: string;
  now: Date;
  sessionSize: number;
}): Pace {
  const { path, attempts, testDate, now, sessionSize } = input;
  const daysLeft = daysUntil(testDate, now);
  if (daysLeft === null) return { dateState: 'none', daysLeft: null };
  if (daysLeft < 0) return { dateState: 'passed', daysLeft };
  const dateState: DateState = path.shortOnTime ? 'short' : 'normal';

  const remainingRounds = Math.max(0, path.roundsTotal - path.roundsFinished);
  const newPerSession = Math.max(1, Math.round(sessionSize * NEW_QUESTION_SHARE));
  const sessionsLeft =
    Math.ceil((remainingRounds * ROUND_SAMPLE) / newPerSession) + (path.practiceTestPassedAt ? 0 : 1);
  const weeks = Math.max(1, daysLeft / 7);
  const sessionsPerWeek = Math.min(7, Math.max(1, Math.ceil(sessionsLeft / weeks)));

  const progress = path.roundsTotal === 0 ? 100 : (path.roundsFinished / path.roundsTotal) * 100;
  const first = attempts.reduce<string | null>(
    (min, a) => (min === null || a.completedAt < min ? a.completedAt : min),
    null,
  );
  let status: PaceStatus = 'on-track';
  if (first) {
    const start = new Date(first).getTime();
    const end = now.getTime() + daysLeft * DAY_MS;
    const elapsed = end > start ? ((now.getTime() - start) / (end - start)) * 100 : 100;
    const diff = progress - Math.min(100, Math.max(0, elapsed));
    status = diff > ON_TRACK_BAND ? 'ahead' : diff < -ON_TRACK_BAND ? 'behind' : 'on-track';
  }
  return { dateState, daysLeft, status, sessionsPerWeek };
}
```

- [ ] **Step 4: Run the tests.** Run: `npx vitest run src/engine/pace.test.ts`. Expected: PASS.

- [ ] **Step 5: Commit.**

```bash
git add src/engine/pace.ts src/engine/pace.test.ts
git commit -m "feat: on-track status and weekly session plan from the test date" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01X5HSDdHPWxvHxgBaoSTbLX"
```

---

### Task 4: Session summary engine (`src/engine/sessionSummary.ts`)

**Files:**
- Create: `src/engine/sessionSummary.ts`
- Test: `src/engine/sessionSummary.test.ts`

**Interfaces:**
- Consumes: `topicName` (Task 1).
- Produces:
  ```ts
  export interface TopicResult { domainId: DomainId; name: string; correct: number; total: number }
  export interface SessionSummaryData { correct: number; total: number; strong: TopicResult[]; tricky: TopicResult[] }
  export function summarizeAttempt(attempt: QuizAttempt, c: GradeCurriculum): SessionSummaryData;
  ```
  A topic is `strong` when its percent in this attempt is ≥ passing, otherwise `tricky`. Topics appear in the curriculum's declared domain order. Topics with no answers in this attempt appear in neither list.

- [ ] **Step 1: Write the failing tests.** Create `src/engine/sessionSummary.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { getCurriculum } from '../curriculum/registry';
import type { QuizAttempt, QuizAttemptAnswer } from '../types';
import { summarizeAttempt } from './sessionSummary';

const c5 = getCurriculum(5);
const code = (domainId: string) => c5.domains.find((d) => d.id === domainId)!.standards[0].code;
function attemptOf(rows: [string, boolean][]): QuizAttempt {
  const answers: Record<string, QuizAttemptAnswer> = {};
  rows.forEach(([d, ok], i) => {
    answers[`q${i}`] = { questionId: `q${i}`, studentAnswer: 'A', isCorrect: ok, standardCode: code(d) };
  });
  return { id: 'a', quizId: 'path-practice-1', quizTitle: 'x', completedAt: '2026-09-30T00:00:00Z',
    scoreRaw: 0, scoreTotal: rows.length, scorePercent: 0, isPassingSSA: false, timeElapsedSeconds: 0, answers };
}

describe('summarizeAttempt', () => {
  it('splits topics into strong and tricky with plain names and counts', () => {
    const s = summarizeAttempt(attemptOf([
      ['NF', true], ['NF', true], ['NF', true], ['NF', true], ['NF', true],
      ['NBT', true], ['NBT', false], ['NBT', false],
    ]), c5);
    expect(s.correct).toBe(6);
    expect(s.total).toBe(8);
    expect(s.strong.map((t) => t.name)).toEqual(['Fractions']);
    expect(s.tricky).toEqual([{ domainId: 'NBT', name: 'Decimals & place value', correct: 1, total: 3 }]);
  });

  it('omits topics with no answers and handles an empty attempt', () => {
    const s = summarizeAttempt(attemptOf([]), c5);
    expect(s).toEqual({ correct: 0, total: 0, strong: [], tricky: [] });
  });

  it('ignores answers from another grade', () => {
    const a = attemptOf([['NF', true]]);
    a.answers.stray = { questionId: 'stray', studentAnswer: 'A', isCorrect: false, standardCode: 'NC.3.OA.1' };
    const s = summarizeAttempt(a, c5);
    expect(s.total).toBe(1);
  });
});
```

- [ ] **Step 2: Run and confirm failure.** Run: `npx vitest run src/engine/sessionSummary.test.ts`. Expected: FAIL.

- [ ] **Step 3: Implement `src/engine/sessionSummary.ts`.**

```ts
import type { DomainId, GradeCurriculum, StandardCode } from '../curriculum/types';
import { topicName } from '../curriculum/registry';
import type { QuizAttempt } from '../types';

export interface TopicResult {
  domainId: DomainId;
  name: string;
  correct: number;
  total: number;
}

export interface SessionSummaryData {
  correct: number;
  total: number;
  strong: TopicResult[];
  tricky: TopicResult[];
}

/** Per-topic results for one finished session, for the parent summary. */
export function summarizeAttempt(attempt: QuizAttempt, c: GradeCurriculum): SessionSummaryData {
  const domainByStandard = new Map<StandardCode, DomainId>();
  for (const d of c.domains) for (const s of d.standards) domainByStandard.set(s.code, d.id);

  const tally = new Map<DomainId, { correct: number; total: number }>();
  for (const ans of Object.values(attempt.answers)) {
    const d = domainByStandard.get(ans.standardCode);
    if (!d) continue;
    const t = tally.get(d) ?? { correct: 0, total: 0 };
    t.total += 1;
    if (ans.isCorrect) t.correct += 1;
    tally.set(d, t);
  }

  const results: TopicResult[] = c.domains
    .filter((d) => tally.has(d.id))
    .map((d) => ({ domainId: d.id, name: topicName(d), ...tally.get(d.id)! }));
  const isStrong = (t: TopicResult) => (t.correct / t.total) * 100 >= c.ssa.passingPercent;

  return {
    correct: results.reduce((n, t) => n + t.correct, 0),
    total: results.reduce((n, t) => n + t.total, 0),
    strong: results.filter(isStrong),
    tricky: results.filter((t) => !isStrong(t)),
  };
}
```

- [ ] **Step 4: Run the tests.** Run: `npx vitest run src/engine/sessionSummary.test.ts`. Expected: PASS.

- [ ] **Step 5: Commit.**

```bash
git add src/engine/sessionSummary.ts src/engine/sessionSummary.test.ts
git commit -m "feat: per-topic results for the end-of-session summary" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01X5HSDdHPWxvHxgBaoSTbLX"
```

---

### Task 5: Session composer `plan` input

**Files:**
- Modify: `src/engine/sessionComposer.ts`
- Test: `src/engine/sessionComposer.test.ts` (append)

**Interfaces:**
- Produces: `export interface SessionPlan { domains: ReadonlySet<DomainId>; prefer?: readonly Difficulty[] }` and an optional `plan?: SessionPlan` on `selectSession`'s input. With no `plan`, output for a given seed is unchanged.

- [ ] **Step 1: Write the failing tests.** Append to `src/engine/sessionComposer.test.ts` (add imports at top if missing):

```ts
import { selectSession, MAX_REVIEW_FRACTION } from './sessionComposer';
import { getCurriculum } from '../curriculum/registry';
import { masteryByStandard } from './mastery';
import { questionRefId } from './questionModel';
import type { ReviewQueue } from './scheduler';

describe('selectSession with a plan', () => {
  const c = getCurriculum(5);
  const now = new Date('2026-09-30T12:00:00Z');
  const mastery = masteryByStandard([], c);
  const domainOf = (code: string) => c.domains.find((d) => d.standards.some((s) => s.code === code))!.id;
  const run = (plan?: Parameters<typeof selectSession>[0]['plan'], queue: ReviewQueue = {}) =>
    selectSession({ curriculum: c, mastery, queue, size: 12, now, seed: 42, plan });

  it('draws new content only from the planned domains', () => {
    const refs = run({ domains: new Set(['NF']) });
    expect(refs.length).toBeGreaterThan(0);
    for (const r of refs) expect(domainOf(c.source.resolve(r).standardCode)).toBe('NF');
  });

  it('leans toward preferred difficulties', () => {
    const count = (refs: ReturnType<typeof run>) =>
      refs.filter((r) => c.source.resolve(r).difficulty === 'stretch').length;
    const preferred = count(run({ domains: new Set(c.domains.map((d) => d.id)), prefer: ['stretch'] }));
    const plain = count(run({ domains: new Set(c.domains.map((d) => d.id)) }));
    expect(preferred).toBeGreaterThan(0);
    expect(preferred).toBeGreaterThanOrEqual(plain);
  });

  it('keeps the review cap and never repeats a question', () => {
    const queue: ReviewQueue = {};
    for (const code of c.source.allStandardsWithContent().slice(0, 12)) {
      const [ref] = c.source.itemsFor(code, { count: 1, seedBase: 1 });
      if (ref.kind !== 'authored') continue;
      queue[`a:${ref.id}`] = { key: { kind: 'authored', id: ref.id }, box: 1, dueAt: '2026-09-01T00:00:00Z', lastSeenAt: '2026-09-01T00:00:00Z' };
    }
    const refs = run({ domains: new Set(['NF']) }, queue);
    const reviewIds = new Set(Object.values(queue).map((e) => (e.key.kind === 'authored' ? e.key.id : '')));
    const reviews = refs.filter((r) => r.kind === 'authored' && reviewIds.has(r.id));
    expect(reviews.length).toBeLessThanOrEqual(Math.ceil(12 * MAX_REVIEW_FRACTION));
    expect(new Set(refs.map(questionRefId)).size).toBe(refs.length);
  });

  it('is unchanged when no plan is given', () => {
    expect(run(undefined)).toEqual(selectSession({ curriculum: c, mastery, queue: {}, size: 12, now, seed: 42 }));
  });
});
```

- [ ] **Step 2: Run and confirm failure.** Run: `npx vitest run src/engine/sessionComposer.test.ts`. Expected: FAIL (the `plan` domain test fails, since the composer ignores `plan`).

- [ ] **Step 3: Implement.** In `src/engine/sessionComposer.ts`:

Add imports:

```ts
import type { DomainId } from '../curriculum/types';
import type { Difficulty } from './questionModel';
```

(`DomainId` joins the existing `'../curriculum/types'` import; `Difficulty` joins the existing `./questionModel` type import.)

Add above `selectSession`:

```ts
/** Narrows a composed session to the path's current round (spec 5.3). Due
 *  reviews are not filtered: spaced review of any topic stays valuable. */
export interface SessionPlan {
  domains: ReadonlySet<DomainId>;
  /** A draw outside these is retried up to PREFER_RETRIES times, then kept,
   *  so thin content degrades to "any difficulty" rather than a short session. */
  prefer?: readonly Difficulty[];
}

const PREFER_RETRIES = 3;
```

Add `plan?: SessionPlan;` to the input type and destructure it: `const { curriculum: c, mastery, queue, size, now, seed, plan } = input;`

Change the `eligible` line to:

```ts
  const eligible = standardsOf(c).filter(
    (s) => withContent.has(s.code) && (!plan || plan.domains.has(s.domainId)),
  );
```

Before `let i = 0;` add `let preferMisses = 0;` and `const maxDraws = size * (plan?.prefer ? 40 : 10);`. Change `if (i > size * 10)` to `if (i > maxDraws)`. After the `if (!ref) { stall += 1; continue; }` line, add:

```ts
      if (
        plan?.prefer &&
        preferMisses < PREFER_RETRIES &&
        !plan.prefer.includes(c.source.resolve(ref).difficulty)
      ) {
        preferMisses += 1;
        continue;
      }
      preferMisses = 0;
```

With no `plan`, none of these branches runs and no extra RNG draws happen, so output is unchanged.

- [ ] **Step 4: Run the tests.** Run: `npx vitest run src/engine`. Expected: PASS, including every pre-existing composer test.

- [ ] **Step 5: Commit.**

```bash
git add src/engine/sessionComposer.ts src/engine/sessionComposer.test.ts
git commit -m "feat: let the session composer focus on a round's topics and difficulty" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01X5HSDdHPWxvHxgBaoSTbLX"
```

---

### Task 6: Saved sessions (`src/engine/activeSession.ts`, profile fields, `completeSession`)

**Files:**
- Create: `src/engine/activeSession.ts`
- Modify: `src/state/types.ts`
- Modify: `src/context/ProgressContext.tsx`
- Test: `src/engine/activeSession.test.ts`, `src/state/migrate.test.ts` (append), `src/context/ProgressContext.test.tsx` (append)

**Interfaces:**
- Produces (from `src/engine/activeSession.ts`):
  ```ts
  export type SessionKind = 'checkup' | 'practice' | 'round3' | 'practice-test' | 'drill';
  export interface SessionAnswer { selected: string; isCorrect: boolean }
  export interface ActiveSession { kind: SessionKind; quizId: string; title: string; domainId?: DomainId; standardCode?: StandardCode; refs: QuestionRef[]; answers: Record<string, SessionAnswer>; flagged: Record<string, boolean>; currentIndex: number; startedAt: string; secondsElapsed: number }
  export const DEFAULT_SESSION_SIZE = 15;
  export function sessionSizeOf(profile: { sessionSize?: unknown }): number; // clamps 5–30
  export function isTestStyle(kind: SessionKind): boolean; // everything except 'practice'
  export function newSession(args: { kind: SessionKind; quizId: string; title: string; refs: QuestionRef[]; now: Date; domainId?: DomainId; standardCode?: StandardCode }): ActiveSession;
  export function sessionFromQuiz(quiz: QuizDefinition, kind: SessionKind, now: Date): ActiveSession;
  export function answeredCount(s: ActiveSession): number;
  export function recordAnswer(s: ActiveSession, q: Question, selected: string): ActiveSession;
  export function resolveSession(s: ActiveSession, c: GradeCurriculum): Question[]; // drops refs that no longer resolve
  export function sessionToAttempt(s: ActiveSession, questions: Question[], passingPercent: number, now: Date, opts: { answeredOnly: boolean }): QuizAttempt;
  ```
  `answers` and `flagged` are keyed by `Question.id` (equal to `questionRefId(ref)`).
- Produces (profile): `Profile.activeSession?: ActiveSession`, `Profile.checkupSkipped?: boolean`, `Profile.sessionSize?: number`.
- Produces (context): `completeSession(attempt: QuizAttempt, results: { ref: QuestionRef; wasCorrect: boolean }[]): void`. It records the attempt exactly like `recordAttempt` **and** clears `activeSession`, in one state update.

- [ ] **Step 1: Write the failing engine tests.** Create `src/engine/activeSession.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { getCurriculum } from '../curriculum/registry';
import {
  answeredCount, isTestStyle, newSession, recordAnswer, resolveSession,
  sessionFromQuiz, sessionSizeOf, sessionToAttempt, DEFAULT_SESSION_SIZE,
} from './activeSession';
import { correctOption } from './questionModel';

const c = getCurriculum(5);
const NOW = new Date('2026-09-30T12:00:00Z');
const diagnostic = c.quizzes.find((q) => q.isDiagnostic)!;

describe('sessionSizeOf', () => {
  it('defaults and clamps to 5-30', () => {
    expect(sessionSizeOf({})).toBe(DEFAULT_SESSION_SIZE);
    expect(sessionSizeOf({ sessionSize: 0 })).toBe(5);
    expect(sessionSizeOf({ sessionSize: 500 })).toBe(30);
    expect(sessionSizeOf({ sessionSize: 'x' })).toBe(DEFAULT_SESSION_SIZE);
    expect(sessionSizeOf({ sessionSize: 12.7 })).toBe(13);
  });
});

describe('active session', () => {
  it('builds from a quiz with refs in order and nothing answered', () => {
    const s = sessionFromQuiz(diagnostic, 'checkup', NOW);
    expect(s.refs).toHaveLength(diagnostic.questionIds.length);
    expect(s.quizId).toBe(diagnostic.id);
    expect(s.startedAt).toBe(NOW.toISOString());
    expect(answeredCount(s)).toBe(0);
    expect(isTestStyle(s.kind)).toBe(true);
    expect(isTestStyle('practice')).toBe(false);
  });

  it('records answers with correctness and grades only answered ones on request', () => {
    const s0 = sessionFromQuiz(diagnostic, 'practice', NOW);
    const [q1, q2] = resolveSession(s0, c);
    const wrong = q2.options.find((o) => !o.isCorrect)!;
    const s = recordAnswer(recordAnswer(s0, q1, correctOption(q1).label), q2, wrong.label);
    expect(s.answers[q1.id]).toEqual({ selected: correctOption(q1).label, isCorrect: true });
    expect(s.answers[q2.id].isCorrect).toBe(false);
    expect(answeredCount(s)).toBe(2);

    const partial = sessionToAttempt(s, resolveSession(s, c), 80, NOW, { answeredOnly: true });
    expect(partial.scoreTotal).toBe(2);
    expect(partial.scoreRaw).toBe(1);
    expect(partial.answers[q2.id].misconception).toBe(wrong.misconception);
    expect(partial.quizId).toBe(diagnostic.id);

    const full = sessionToAttempt(s, resolveSession(s, c), 80, NOW, { answeredOnly: false });
    expect(full.scoreTotal).toBe(diagnostic.questionIds.length);
  });

  it('drops refs that no longer resolve instead of throwing', () => {
    const s = newSession({ kind: 'practice', quizId: 'x', title: 'x', now: NOW,
      refs: [{ kind: 'authored', id: 'no-such-question' }, ...sessionFromQuiz(diagnostic, 'practice', NOW).refs.slice(0, 1)] });
    expect(resolveSession(s, c)).toHaveLength(1);
  });
});
```

- [ ] **Step 2: Run and confirm failure.** Run: `npx vitest run src/engine/activeSession.test.ts`. Expected: FAIL.

- [ ] **Step 3: Implement `src/engine/activeSession.ts`.**

```ts
import type { DomainId, GradeCurriculum, StandardCode } from '../curriculum/types';
import type { QuizAttempt, QuizAttemptAnswer, QuizDefinition } from '../types';
import { checkAnswer } from '../utils/answerChecker';
import { parseQuestionRef, type Question, type QuestionRef } from './questionModel';

export type SessionKind = 'checkup' | 'practice' | 'round3' | 'practice-test' | 'drill';

export interface SessionAnswer {
  selected: string;
  isCorrect: boolean;
}

/** A session in progress, saved on the profile after every interaction so a
 *  closed tab or "Stop for today" loses nothing (spec 7). refs are frozen at
 *  start, so resuming replays exactly the same questions. */
export interface ActiveSession {
  kind: SessionKind;
  quizId: string;
  title: string;
  domainId?: DomainId;
  standardCode?: StandardCode;
  refs: QuestionRef[];
  /** Keyed by Question.id (equal to questionRefId(ref)). */
  answers: Record<string, SessionAnswer>;
  flagged: Record<string, boolean>;
  currentIndex: number;
  startedAt: string;
  secondsElapsed: number;
}

export const DEFAULT_SESSION_SIZE = 15;
const MIN_SESSION_SIZE = 5;
const MAX_SESSION_SIZE = 30;

/** The profile's questions-per-session, defaulted and clamped: the value
 *  comes from a free-typed settings field and from older saved data. */
export function sessionSizeOf(profile: { sessionSize?: unknown }): number {
  const n = profile.sessionSize;
  if (typeof n !== 'number' || !Number.isFinite(n)) return DEFAULT_SESSION_SIZE;
  return Math.min(MAX_SESSION_SIZE, Math.max(MIN_SESSION_SIZE, Math.round(n)));
}

/** Test-style sessions hide feedback until the end and pause (not grade) on
 *  "Stop for today". Only path practice is instant-feedback. */
export function isTestStyle(kind: SessionKind): boolean {
  return kind !== 'practice';
}

export function newSession(args: {
  kind: SessionKind;
  quizId: string;
  title: string;
  refs: QuestionRef[];
  now: Date;
  domainId?: DomainId;
  standardCode?: StandardCode;
}): ActiveSession {
  const { now, ...rest } = args;
  return { ...rest, answers: {}, flagged: {}, currentIndex: 0, startedAt: now.toISOString(), secondsElapsed: 0 };
}

export function sessionFromQuiz(quiz: QuizDefinition, kind: SessionKind, now: Date): ActiveSession {
  return newSession({
    kind,
    quizId: quiz.id,
    title: quiz.title,
    refs: quiz.questionIds.map(parseQuestionRef),
    now,
    domainId: quiz.domainId,
    standardCode: quiz.standardCode,
  });
}

export function answeredCount(s: ActiveSession): number {
  return Object.keys(s.answers).length;
}

export function recordAnswer(s: ActiveSession, q: Question, selected: string): ActiveSession {
  return { ...s, answers: { ...s.answers, [q.id]: { selected, isCorrect: checkAnswer(q, selected) } } };
}

/** The session's questions, skipping any ref the current content can no
 *  longer resolve (content changed, or the student's grade changed). */
export function resolveSession(s: ActiveSession, c: GradeCurriculum): Question[] {
  const out: Question[] = [];
  for (const ref of s.refs) {
    try {
      out.push(c.source.resolve(ref));
    } catch {
      // Unresolvable: skip. Callers show a "can't continue" state when nothing is left.
    }
  }
  return out;
}

/** Grades a session into a QuizAttempt. answeredOnly grades just the
 *  answered questions (instant practice stopped early); otherwise every
 *  question counts and unanswered ones are wrong, as on the real test. */
export function sessionToAttempt(
  s: ActiveSession,
  questions: Question[],
  passingPercent: number,
  now: Date,
  opts: { answeredOnly: boolean },
): QuizAttempt {
  const graded = opts.answeredOnly ? questions.filter((q) => s.answers[q.id]) : questions;
  const answers: Record<string, QuizAttemptAnswer> = {};
  let raw = 0;
  for (const q of graded) {
    const selected = s.answers[q.id]?.selected ?? '';
    const isCorrect = checkAnswer(q, selected);
    if (isCorrect) raw += 1;
    const chosen = isCorrect
      ? undefined
      : q.options.find(
          (o) =>
            o.label.toLowerCase() === selected.trim().toLowerCase() ||
            o.text.trim().toLowerCase() === selected.trim().toLowerCase(),
        );
    answers[q.id] = {
      questionId: q.id,
      studentAnswer: selected,
      isCorrect,
      standardCode: q.standardCode,
      misconception: chosen?.misconception,
      flaggedForReview: s.flagged[q.id],
    };
  }
  const total = graded.length;
  const scorePercent = total === 0 ? 0 : Math.round((raw / total) * 1000) / 10;
  return {
    id: `attempt-${now.getTime()}`,
    quizId: s.quizId,
    quizTitle: s.title,
    domainId: s.domainId,
    standardCode: s.standardCode,
    completedAt: now.toISOString(),
    scoreRaw: raw,
    scoreTotal: total,
    scorePercent,
    isPassingSSA: scorePercent >= passingPercent,
    timeElapsedSeconds: s.secondsElapsed,
    answers,
  };
}
```

- [ ] **Step 4: Add the profile fields.** In `src/state/types.ts`, add `import type { ActiveSession } from '../engine/activeSession';` and, inside `interface Profile` after `reviewQueue: ReviewQueue;`:

```ts
  /** In-progress session, saved after every answer (spec 7). */
  activeSession?: ActiveSession;
  /** The parent chose "Skip and start practicing" instead of the check-up. */
  checkupSkipped?: boolean;
  /** Questions per path session; read through sessionSizeOf(). */
  sessionSize?: number;
```

- [ ] **Step 5: Run the engine tests.** Run: `npx vitest run src/engine/activeSession.test.ts && npm run typecheck`. Expected: PASS.

- [ ] **Step 6: Write the failing storage and context tests.** Append to `src/state/migrate.test.ts` (reuse its existing imports; add `newProfile`, `saveState`, `loadState` to the `./storage` import if missing):

```ts
describe('saved sessions in storage (no version bump)', () => {
  it('loads a v2 blob without the new fields and keeps it intact', () => {
    const p = newProfile({ id: 'p1', studentName: 'Ada' });
    const out = migrate({ version: 2, profiles: [p], activeProfileId: 'p1' });
    expect(out.profiles[0]).toEqual(p);
    expect(out.profiles[0].activeSession).toBeUndefined();
  });

  it('round-trips an active session through save and load', () => {
    const store = new Map<string, string>();
    const storage = {
      getItem: (k: string) => store.get(k) ?? null,
      setItem: (k: string, v: string) => void store.set(k, v),
    } as unknown as Storage;
    const activeSession = {
      kind: 'practice' as const, quizId: 'path-practice-1', title: 'Round 1 practice',
      refs: [{ kind: 'authored' as const, id: 'nf1-01' }],
      answers: { 'nf1-01': { selected: 'B', isCorrect: true } }, flagged: {},
      currentIndex: 0, startedAt: '2026-09-30T00:00:00.000Z', secondsElapsed: 42,
    };
    const p = newProfile({ id: 'p1', studentName: 'Ada', activeSession, checkupSkipped: true, sessionSize: 10 });
    saveState(storage, { version: 2, profiles: [p], activeProfileId: 'p1' });
    expect(loadState(storage).profiles[0]).toEqual(p);
  });
});
```

Append to `src/context/ProgressContext.test.tsx` (follow the file's existing render-hook pattern; this uses `renderHook` from `@testing-library/react`, so add that to its import if missing):

```ts
describe('completeSession', () => {
  it('records the attempt and clears the saved session in one step', () => {
    localStorage.clear();
    const wrapper = ({ children }: { children: React.ReactNode }) => <ProgressProvider>{children}</ProgressProvider>;
    const { result } = renderHook(() => useProgress(), { wrapper });
    act(() => result.current.updateActiveProfile({
      activeSession: { kind: 'practice', quizId: 'path-practice-1', title: 't', refs: [], answers: {}, flagged: {},
        currentIndex: 0, startedAt: '2026-09-30T00:00:00.000Z', secondsElapsed: 0 },
    }));
    expect(result.current.profile.activeSession).toBeDefined();
    act(() => result.current.completeSession({
      id: 'a1', quizId: 'path-practice-1', quizTitle: 't', completedAt: '2026-09-30T00:01:00.000Z',
      scoreRaw: 1, scoreTotal: 1, scorePercent: 100, isPassingSSA: true, timeElapsedSeconds: 5,
      answers: { 'nf1-01': { questionId: 'nf1-01', studentAnswer: 'B', isCorrect: true, standardCode: 'NC.5.NF.1' } },
    }, [{ ref: { kind: 'authored', id: 'nf1-01' }, wasCorrect: true }]));
    expect(result.current.profile.activeSession).toBeUndefined();
    expect(result.current.profile.attempts).toHaveLength(1);
    expect(Object.keys(result.current.profile.reviewQueue)).toContain('a:nf1-01');
  });
});
```

(If the file has no `React` import, add `import React from 'react';`; add `act` to the `@testing-library/react` import.)

- [ ] **Step 7: Run and confirm failure.** Run: `npx vitest run src/state src/context`. Expected: the storage tests PASS (the fields are optional and already round-trip). The context test FAILS (`completeSession` is not a function).

- [ ] **Step 8: Implement `completeSession`.** In `src/context/ProgressContext.tsx`:
  - Add to `ProgressContextValue`:
    ```ts
    /** Records a finished session's attempt and clears profile.activeSession
     *  in one state update, so a crash between the two can't leave a
     *  finished session resumable. */
    completeSession(attempt: QuizAttempt, results: { ref: QuestionRef; wasCorrect: boolean }[]): void;
    ```
  - Refactor `recordAttempt`'s updater into a module-level pure helper and use it twice:
    ```ts
    function withAttempt(
      prev: AppStateV2,
      attempt: QuizAttempt,
      results: { ref: QuestionRef; wasCorrect: boolean }[],
      clearSession: boolean,
    ): AppStateV2 {
      const now = new Date();
      return {
        ...prev,
        profiles: prev.profiles.map((p) => {
          if (p.id !== prev.activeProfileId) return p;
          let queue = p.reviewQueue;
          for (const r of results) queue = recordResult(queue, r.ref, r.wasCorrect, now);
          const next = { ...p, attempts: [attempt, ...p.attempts], reviewQueue: queue };
          if (clearSession) delete next.activeSession;
          return next;
        }),
      };
    }
    ```
    ```ts
    const recordAttempt = useCallback(
      (attempt: QuizAttempt, results: { ref: QuestionRef; wasCorrect: boolean }[]) =>
        setState((prev) => withAttempt(prev, attempt, results, false)),
      [],
    );
    const completeSession = useCallback(
      (attempt: QuizAttempt, results: { ref: QuestionRef; wasCorrect: boolean }[]) =>
        setState((prev) => withAttempt(prev, attempt, results, true)),
      [],
    );
    ```
  - Add `completeSession` to the `value` object and to the `useMemo` dependency list.

- [ ] **Step 9: Run tests and typecheck.** Run: `npm run test:run && npm run typecheck`. Expected: PASS.

- [ ] **Step 10: Commit.**

```bash
git add src/engine/activeSession.ts src/engine/activeSession.test.ts src/state src/context
git commit -m "feat: saved in-progress sessions on the profile" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01X5HSDdHPWxvHxgBaoSTbLX"
```

---

### Task 7: Move drill factories out of Grade 5 (`src/engine/drills.ts`)

**Files:**
- Create: `src/engine/drills.ts`
- Modify: `src/curriculum/grade5/quizzes.ts` (remove the three factories)
- Modify: `src/App.tsx` (import path only)
- Modify: `docs/superpowers/RULINGS.md` (mark the parked ruling closed)
- Test: `src/engine/drills.test.ts`

**Interfaces:**
- Produces: `createStandardDrill(standardCode: string, curriculum: GradeCurriculum): QuizDefinition`, `createMissedQuestionsDrill(missedIds: string[]): QuizDefinition`, `createAdaptiveSessionDrill(refs: QuestionRef[]): QuizDefinition`, all from `src/engine/drills.ts`, with bodies unchanged.

- [ ] **Step 1: Write the failing test.** Create `src/engine/drills.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { getCurriculum, standardsOf } from '../curriculum/registry';
import { createAdaptiveSessionDrill, createMissedQuestionsDrill, createStandardDrill } from './drills';

describe('drill factories work for any grade', () => {
  it('builds a standard drill from grade 3 content', () => {
    const c = getCurriculum(3);
    const code = c.source.allStandardsWithContent().find((s) => c.source.authoredFor(s).length > 0)!;
    const drill = createStandardDrill(code, c);
    expect(drill.standardCode).toBe(code);
    expect(drill.domainId).toBe(standardsOf(c).find((s) => s.code === code)!.domainId);
    expect(drill.questionIds.length).toBeGreaterThan(0);
  });

  it('encodes generated refs in adaptive drills and keeps missed ids', () => {
    expect(createAdaptiveSessionDrill([{ kind: 'generated', templateId: 't', seed: 7 }]).questionIds).toEqual(['t#7']);
    expect(createMissedQuestionsDrill(['a', 'b']).questionIds).toEqual(['a', 'b']);
  });
});
```

- [ ] **Step 2: Run and confirm failure.** Run: `npx vitest run src/engine/drills.test.ts`. Expected: FAIL (module not found).

- [ ] **Step 3: Move the code.** Create `src/engine/drills.ts` containing the three functions and their doc comments cut verbatim from `src/curriculum/grade5/quizzes.ts`, with these imports:

```ts
import type { GradeCurriculum } from '../curriculum/types';
import { standardsOf } from '../curriculum/registry';
import type { QuizDefinition } from '../types';
import { questionRefId, type QuestionRef } from './questionModel';
```

If `createStandardDrill` in `grade5/quizzes.ts` called a local helper instead of `standardsOf` (the file avoids importing the registry because of an import cycle), replace that call with `standardsOf(curriculum)`. The cycle doesn't apply in `engine/`. Delete the three functions from `grade5/quizzes.ts` and remove any imports there that become unused (`QuestionRef`, `questionRefId`). In `src/App.tsx`, change the import to `from './engine/drills'`.

- [ ] **Step 4: Close the ruling.** In `docs/superpowers/RULINGS.md`, find the parked entry about `App.tsx` importing `curriculum/grade5/quizzes` directly and append: `**Closed 2026-09-30:** factories moved to src/engine/drills.ts (parent-path plan, Task 7).`

- [ ] **Step 5: Verify.** Run: `npm run test:run && npm run typecheck && npm run lint`. Expected: PASS, with no remaining imports of the factories from `curriculum/grade5/quizzes` (`grep -rn "grade5/quizzes" src` shows only curriculum-internal imports).

- [ ] **Step 6: Commit.**

```bash
git add src/engine/drills.ts src/engine/drills.test.ts src/curriculum/grade5/quizzes.ts src/App.tsx docs/superpowers/RULINGS.md
git commit -m "refactor: move drill factories from grade 5 into the engine" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01X5HSDdHPWxvHxgBaoSTbLX"
```

---

### Task 8: Build the next session (`src/engine/pathSession.ts`)

**Files:**
- Create: `src/engine/pathSession.ts`
- Test: `src/engine/pathSession.test.ts`

**Interfaces:**
- Consumes: `NextStep`, `PRACTICE_QUIZ_PREFIX`, `ROUND3_QUIZ_PREFIX`, `buildPath` (Task 2); `selectSession` + `plan` (Task 5); `newSession`, `sessionFromQuiz`, `ActiveSession` (Task 6).
- Produces:
  ```ts
  export function sessionForStep(input: {
    step: NextStep; curriculum: GradeCurriculum; mastery: Map<StandardCode, StandardMastery>;
    queue: ReviewQueue; activeDomains: DomainId[]; size: number; now: Date; seed: number;
  }): ActiveSession | null; // null only when a quiz id is unknown or no questions could be drawn
  ```
  Titles: check-up `'Check-up'`, practice `` `Round ${round} practice` ``, Round 3 `'Test-ready practice'`, practice test `'Practice test'`.

- [ ] **Step 1: Write the failing tests.** Create `src/engine/pathSession.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { getCurriculum } from '../curriculum/registry';
import { masteryByStandard } from './mastery';
import { sessionForStep } from './pathSession';
import { buildPath, ROUND3_QUIZ_PREFIX, PRACTICE_QUIZ_PREFIX } from './path';
import { resolveSession, recordAnswer, sessionToAttempt } from './activeSession';
import { correctOption } from './questionModel';

const c = getCurriculum(5);
const NOW = new Date('2026-09-30T12:00:00Z');
const common = { curriculum: c, mastery: masteryByStandard([], c), queue: {}, size: 10, now: NOW, seed: 1 };
const domainOf = (code: string) => c.domains.find((d) => d.standards.some((s) => s.code === code))!.id;

describe('sessionForStep', () => {
  it('wraps the check-up and practice-test quizzes', () => {
    const checkup = sessionForStep({ ...common, activeDomains: [], step: { kind: 'checkup', quizId: 'diagnostic-01' } })!;
    expect(checkup.kind).toBe('checkup');
    expect(checkup.title).toBe('Check-up');
    expect(checkup.quizId).toBe('diagnostic-01');
    const test = sessionForStep({ ...common, activeDomains: [], step: { kind: 'practice-test', quizId: 'mock-ssa-02' } })!;
    expect(test.kind).toBe('practice-test');
    expect(test.quizId).toBe('mock-ssa-02');
  });

  it('composes round practice from the active topics only', () => {
    const s = sessionForStep({ ...common, activeDomains: ['NF', 'MD'], step: { kind: 'practice', round: 1 } })!;
    expect(s.kind).toBe('practice');
    expect(s.title).toBe('Round 1 practice');
    expect(s.quizId.startsWith(PRACTICE_QUIZ_PREFIX)).toBe(true);
    expect(s.refs.length).toBeGreaterThan(0);
    for (const q of resolveSession(s, c)) expect(['NF', 'MD']).toContain(domainOf(q.standardCode));
  });

  it('marks Round 3 sessions so the path counts them', () => {
    const s = sessionForStep({ ...common, activeDomains: c.domains.map((d) => d.id), step: { kind: 'round3' } })!;
    expect(s.kind).toBe('round3');
    expect(s.quizId.startsWith(ROUND3_QUIZ_PREFIX)).toBe(true);
    let answered = s;
    const qs = resolveSession(s, c);
    for (const q of qs) answered = recordAnswer(answered, q, correctOption(q).label);
    const attempt = sessionToAttempt(answered, qs, 80, NOW, { answeredOnly: false });
    const p = buildPath({ curriculum: c, attempts: [attempt], checkupSkipped: true, testDate: '', now: NOW });
    expect(p.topics.some((t) => t.answered > 0)).toBe(true);
  });

  it('returns null for an unknown quiz id', () => {
    expect(sessionForStep({ ...common, activeDomains: [], step: { kind: 'checkup', quizId: 'nope' } })).toBeNull();
  });
});
```

- [ ] **Step 2: Run and confirm failure.** Run: `npx vitest run src/engine/pathSession.test.ts`. Expected: FAIL.

- [ ] **Step 3: Implement `src/engine/pathSession.ts`.**

```ts
import type { DomainId, GradeCurriculum, StandardCode } from '../curriculum/types';
import type { StandardMastery } from './mastery';
import type { ReviewQueue } from './scheduler';
import { selectSession, type SessionPlan } from './sessionComposer';
import { PRACTICE_QUIZ_PREFIX, ROUND3_QUIZ_PREFIX, type NextStep } from './path';
import { newSession, sessionFromQuiz, type ActiveSession } from './activeSession';

/** Builds the saved session for the path's next step (spec 5). */
export function sessionForStep(input: {
  step: NextStep;
  curriculum: GradeCurriculum;
  mastery: Map<StandardCode, StandardMastery>;
  queue: ReviewQueue;
  activeDomains: DomainId[];
  size: number;
  now: Date;
  seed: number;
}): ActiveSession | null {
  const { step, curriculum: c, mastery, queue, activeDomains, size, now, seed } = input;

  if (step.kind === 'checkup' || step.kind === 'practice-test') {
    const quiz = c.quizzes.find((q) => q.id === step.quizId);
    if (!quiz) return null;
    const s = sessionFromQuiz(quiz, step.kind, now);
    return { ...s, title: step.kind === 'checkup' ? 'Check-up' : 'Practice test' };
  }

  const plan: SessionPlan =
    step.kind === 'round3'
      ? { domains: new Set(activeDomains), prefer: ['stretch', 'advanced'] }
      : { domains: new Set(activeDomains), prefer: step.round === 1 ? ['mastery'] : undefined };
  const refs = selectSession({ curriculum: c, mastery, queue, size, now, seed, plan });
  if (refs.length === 0) return null;

  return step.kind === 'round3'
    ? newSession({ kind: 'round3', quizId: `${ROUND3_QUIZ_PREFIX}${now.getTime()}`, title: 'Test-ready practice', refs, now })
    : newSession({ kind: 'practice', quizId: `${PRACTICE_QUIZ_PREFIX}${now.getTime()}`, title: `Round ${step.round} practice`, refs, now });
}
```

- [ ] **Step 4: Run the tests.** Run: `npx vitest run src/engine/pathSession.test.ts`. Expected: PASS.

- [ ] **Step 5: Commit.**

```bash
git add src/engine/pathSession.ts src/engine/pathSession.test.ts
git commit -m "feat: build the saved session for the path's next step" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01X5HSDdHPWxvHxgBaoSTbLX"
```

---

### Task 9: Test-style runner reads and writes the saved session (`QuizRunner.tsx`)

**Files:**
- Modify: `src/components/QuizRunner.tsx`
- Test: `src/components/QuizRunner.test.tsx` (create)

**Interfaces:**
- Consumes: `ActiveSession`, `SessionAnswer`, `resolveSession`, `sessionToAttempt` (Task 6).
- Produces: new props, replacing `quiz`/`onExit`:
  ```ts
  interface QuizRunnerProps {
    session: ActiveSession;
    onChange: (s: ActiveSession) => void;   // called after every answer, navigate, flag, pause
    onFinish: (attempt: QuizAttempt) => void;
    onPause: () => void;                    // "Stop for today": session stays saved
    onDiscard: () => void;                  // only offered when no question resolves
  }
  ```

- [ ] **Step 1: Write the failing tests.** Create `src/components/QuizRunner.test.tsx`:

```tsx
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ProgressProvider } from '../context/ProgressContext';
import { QuizRunner } from './QuizRunner';
import { getCurriculum } from '../curriculum/registry';
import { sessionFromQuiz, newSession, type ActiveSession } from '../engine/activeSession';

const c = getCurriculum(5);
const base = () => sessionFromQuiz(c.quizzes.find((q) => q.isDiagnostic)!, 'checkup', new Date('2026-09-30T12:00:00Z'));
const renderRunner = (session: ActiveSession, handlers: Partial<Record<'onChange' | 'onFinish' | 'onPause' | 'onDiscard', ReturnType<typeof vi.fn>>> = {}) => {
  const h = { onChange: vi.fn(), onFinish: vi.fn(), onPause: vi.fn(), onDiscard: vi.fn(), ...handlers };
  render(<ProgressProvider><QuizRunner session={session} {...h} /></ProgressProvider>);
  return h;
};

describe('QuizRunner with a saved session', () => {
  beforeEach(() => localStorage.clear());

  it('saves the selected answer to the session', async () => {
    const s = base();
    const h = renderRunner(s);
    const q = c.source.resolve(s.refs[0]);
    // If the option text also appears elsewhere (e.g. the prompt), click the
    // option's button instead: getAllByText(text).find((el) => el.closest('button')).
    await userEvent.click(screen.getByText(q.options[0].text));
    const last = h.onChange.mock.calls.at(-1)![0] as ActiveSession;
    expect(last.answers[q.id].selected).toBe(q.options[0].label);
  });

  it('resumes at the saved question with the saved answers', () => {
    const s = { ...base(), currentIndex: 2 };
    renderRunner(s);
    expect(screen.getByText(new RegExp(`^3 of ${s.refs.length}$`))).toBeInTheDocument();
  });

  it('"Stop for today" saves and pauses without asking to confirm', async () => {
    const confirm = vi.spyOn(window, 'confirm');
    const h = renderRunner(base());
    await userEvent.click(screen.getByTitle(/stop for today/i));
    expect(h.onChange).toHaveBeenCalled();
    expect(h.onPause).toHaveBeenCalledTimes(1);
    expect(confirm).not.toHaveBeenCalled();
  });

  it('offers a discard when none of the saved questions resolve', async () => {
    const s = newSession({ kind: 'checkup', quizId: 'x', title: 'x', now: new Date(), refs: [{ kind: 'authored', id: 'gone' }] });
    const h = renderRunner(s);
    await userEvent.click(screen.getByRole('button', { name: /discard/i }));
    expect(h.onDiscard).toHaveBeenCalledTimes(1);
  });
});
```

- [ ] **Step 2: Run and confirm failure.** Run: `npx vitest run src/components/QuizRunner.test.tsx`. Expected: FAIL (the `session` prop is unknown and the runner reads `quiz`).

- [ ] **Step 3: Rewire `QuizRunner.tsx`.** Make these edits:

1. Imports: replace `import { parseQuestionRef } from '../engine/questionModel';` with
   ```ts
   import { resolveSession, sessionToAttempt, type ActiveSession, type SessionAnswer } from '../engine/activeSession';
   ```
   Change `import React, { useState, useEffect } from 'react';` to include `useRef`. Remove `QuizAttemptAnswer` and `QuizDefinition` from the `../types` import if they become unused.
2. Replace the props interface with the one in **Interfaces** above and the signature with `({ session, onChange, onFinish, onPause, onDiscard })`.
3. Replace the `questions` computation (the `quiz.questionIds.map(...)` block and its comment) with:
   ```ts
   const questions: Question[] = resolveSession(session, curriculum);
   ```
4. Initialise state from the session:
   ```ts
   const [currentIndex, setCurrentIndex] = useState(() => Math.min(session.currentIndex, Math.max(0, questions.length - 1)));
   const [answers, setAnswers] = useState<Record<string, string>>(() =>
     Object.fromEntries(Object.entries(session.answers).map(([id, a]) => [id, a.selected])));
   const [flagged, setFlagged] = useState<Record<string, boolean>>(session.flagged);
   const [secondsElapsed, setSecondsElapsed] = useState(session.secondsElapsed);
   ```
5. After the state declarations add the snapshot and persistence:
   ```ts
   const secondsRef = useRef(secondsElapsed);
   secondsRef.current = secondsElapsed;

   const snapshot = (): ActiveSession => {
     const saved: Record<string, SessionAnswer> = {};
     for (const q of questions) {
       const sel = answers[q.id];
       if (sel?.trim()) saved[q.id] = { selected: sel, isCorrect: checkAnswer(q, sel) };
     }
     return { ...session, answers: saved, flagged, currentIndex, secondsElapsed: secondsRef.current };
   };

   // Persist on every interaction (spec 7): answer, navigate, flag, pause.
   // Not on the per-second tick; `snapshot` reads the latest seconds via ref.
   useEffect(() => {
     onChange(snapshot());
     // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [answers, flagged, currentIndex, isPaused]);
   ```
6. Replace the no-questions early return's content: heading `This session can't continue`, text `Its questions are no longer available. Discard it to get back on track.`, and a button `Discard this session` with `onClick={onDiscard}`.
7. Replace the whole body of `handleSubmit` with:
   ```ts
   onFinish(sessionToAttempt(snapshot(), questions, passingPercent, new Date(), { answeredOnly: false }));
   ```
8. The header exit button: replace its `onClick` with `onClick={() => { onChange(snapshot()); onPause(); }}` and its `title` with `"Stop for today (your progress is saved)"`.
9. Replace `{quiz.title}` with `{session.title}`. Confirm no `quiz.` references remain (`grep -n "quiz\." src/components/QuizRunner.tsx` shows nothing).

- [ ] **Step 4: Temporarily adapt `App.tsx`** so the app still compiles until Task 14 replaces it. At the `activeQuiz` render branch, build a session on the fly:
  ```tsx
  if (activeQuiz) {
    return (
      <QuizRunner
        session={sessionFromQuiz(activeQuiz, 'drill', new Date())}
        onChange={() => {}}
        onFinish={handleFinishQuiz}
        onPause={() => setActiveQuiz(null)}
        onDiscard={() => setActiveQuiz(null)}
      />
    );
  }
  ```
  Import `sessionFromQuiz` from `./engine/activeSession`. Saving isn't wired yet; Task 14 replaces this.

  Note: `sessionFromQuiz` in render would reset the session every render. It's harmless here because QuizRunner only reads it for initial state, and Task 14 deletes this branch.

- [ ] **Step 5: Verify.** Run: `npx vitest run src/components/QuizRunner.test.tsx && npm run test:run && npm run typecheck`. Expected: PASS.

- [ ] **Step 6: Commit.**

```bash
git add src/components/QuizRunner.tsx src/components/QuizRunner.test.tsx src/App.tsx
git commit -m "feat: test-style runner saves progress and pauses on stop" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01X5HSDdHPWxvHxgBaoSTbLX"
```

---

### Task 10: Kid mode practice screen (`KidPractice.tsx`)

**Files:**
- Create: `src/components/KidPractice.tsx`
- Test: `src/components/KidPractice.test.tsx`

**Interfaces:**
- Consumes: `ActiveSession`, `recordAnswer`, `resolveSession`, `sessionToAttempt`, `answeredCount` (Task 6); `correctOption` from `engine/questionModel`; `Scratchpad`, `Calculator` (props `{ isOpen: boolean; onClose: () => void }`).
- Produces:
  ```ts
  interface KidPracticeProps {
    session: ActiveSession;          // controlled: re-rendered with whatever onChange saved
    studentName: string;
    onChange: (s: ActiveSession) => void;
    onFinish: (attempt: QuizAttempt) => void;  // called at most once
    onDiscard: () => void;           // stop with nothing answered, or unresolvable session
  }
  export const KidPractice: React.FC<KidPracticeProps>;
  ```

Behaviour:
- Current question = `questions[session.currentIndex]`. If it is in `session.answers`, the **feedback** view shows (this also covers resuming after the tab closed mid-feedback). Otherwise the **answering** view shows.
- Answering: options as large buttons, each with an `aria-label` of `Answer {label}: {text}` (tests and screen readers rely on it). The selected one is highlighted (local state). "Check my answer" is disabled until one is chosen. Checking calls `onChange(recordAnswer(session, q, selected))`.
- Feedback when right: "Nice!". When wrong: "Not quite. The answer is {label}." then `explanation.stepByStep` as a numbered list, and `explanation.commonMisconception` under "Watch out:" when present. Option buttons are disabled in feedback (no retry). The button reads "Next", or "Finish" on the last question.
- "Next" calls `onChange({ ...session, currentIndex: i + 1 })`. "Finish" calls `onFinish(sessionToAttempt(session, questions, passing, new Date(), { answeredOnly: true }))`, guarded by a `finishedRef` so it fires once.
- Header: `{studentName}'s practice`, one dot per question (filled ⭐ for correct, filled grey for wrong, empty for not yet), `{i + 1} of {n}`, a Scratchpad button, a Calculator button only when `q.calculatorAllowed`.
- "Stop for today" button shows an inline confirm, "Stop and save your progress?", with "Yes, stop" and "Keep going". "Yes, stop": with 0 answers calls `onDiscard()`, otherwise `onFinish(... answeredOnly: true)` (same once-guard).
- No questions resolve: "This session can't continue" plus a button "Discard this session" → `onDiscard`.

- [ ] **Step 1: Write the failing tests.** Create `src/components/KidPractice.test.tsx`:

```tsx
import React, { useState } from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ProgressProvider } from '../context/ProgressContext';
import { KidPractice } from './KidPractice';
import { getCurriculum } from '../curriculum/registry';
import { newSession, recordAnswer, type ActiveSession } from '../engine/activeSession';
import { correctOption } from '../engine/questionModel';

const c = getCurriculum(5);
const diagnostic = c.quizzes.find((q) => q.isDiagnostic)!;
const refs = diagnostic.questionIds.slice(0, 2).map((id) => ({ kind: 'authored' as const, id }));
const q1 = c.source.resolve(refs[0]);
const q2 = c.source.resolve(refs[1]);
const fresh = () => newSession({ kind: 'practice', quizId: 'path-practice-1', title: 'Round 1 practice', refs, now: new Date() });

function Harness({ initial, onFinish, onDiscard }: { initial: ActiveSession; onFinish: (a: unknown) => void; onDiscard: () => void }) {
  const [s, setS] = useState(initial);
  return <KidPractice session={s} studentName="Alex" onChange={setS} onFinish={onFinish} onDiscard={onDiscard} />;
}
const setup = (initial = fresh()) => {
  const onFinish = vi.fn();
  const onDiscard = vi.fn();
  render(<ProgressProvider><Harness initial={initial} onFinish={onFinish} onDiscard={onDiscard} /></ProgressProvider>);
  return { onFinish, onDiscard };
};
const option = (label: string) => screen.getByRole('button', { name: new RegExp(`^Answer ${label}:`) });
const choose = async (label: string) => {
  await userEvent.click(option(label));
  await userEvent.click(screen.getByRole('button', { name: /check my answer/i }));
};

describe('KidPractice', () => {
  beforeEach(() => localStorage.clear());

  it('praises a right answer', async () => {
    setup();
    await choose(correctOption(q1).label);
    expect(screen.getByText(/nice!/i)).toBeInTheDocument();
  });

  it('explains a wrong answer and does not allow a retry', async () => {
    setup();
    const wrong = q1.options.find((o) => !o.isCorrect)!;
    await choose(wrong.label);
    expect(screen.getByText(new RegExp(`the answer is ${correctOption(q1).label}`, 'i'))).toBeInTheDocument();
    expect(screen.getByText(q1.explanation.stepByStep[0])).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /check my answer/i })).not.toBeInTheDocument();
    for (const o of q1.options) expect(option(o.label)).toBeDisabled();
  });

  it('resumes into the feedback for an answered question (tab closed before Next)', () => {
    setup(recordAnswer(fresh(), q1, correctOption(q1).label));
    expect(screen.getByText(/nice!/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /next/i })).toBeInTheDocument();
  });

  it('finishes once, even on a double click', async () => {
    const { onFinish } = setup();
    await choose(correctOption(q1).label);
    await userEvent.click(screen.getByRole('button', { name: /next/i }));
    await choose(correctOption(q2).label);
    const finish = screen.getByRole('button', { name: /finish/i });
    await userEvent.dblClick(finish);
    expect(onFinish).toHaveBeenCalledTimes(1);
    expect(onFinish.mock.calls[0][0].scoreTotal).toBe(2);
  });

  it('stopping with nothing answered discards', async () => {
    const { onDiscard, onFinish } = setup();
    await userEvent.click(screen.getByRole('button', { name: /stop for today/i }));
    expect(screen.getByText(/stop and save your progress\?/i)).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: /yes, stop/i }));
    expect(onDiscard).toHaveBeenCalledTimes(1);
    expect(onFinish).not.toHaveBeenCalled();
  });

  it('stopping after one answer grades just that answer', async () => {
    const { onFinish } = setup();
    await choose(correctOption(q1).label);
    await userEvent.click(screen.getByRole('button', { name: /stop for today/i }));
    await userEvent.click(screen.getByRole('button', { name: /yes, stop/i }));
    expect(onFinish.mock.calls[0][0].scoreTotal).toBe(1);
  });

  it('offers a discard when the saved questions no longer exist', async () => {
    const { onDiscard } = setup(newSession({ kind: 'practice', quizId: 'x', title: 'x', now: new Date(), refs: [{ kind: 'authored', id: 'gone' }] }));
    await userEvent.click(screen.getByRole('button', { name: /discard this session/i }));
    expect(onDiscard).toHaveBeenCalledTimes(1);
  });

  it('shows the calculator only where the question allows it', () => {
    setup();
    expect(Boolean(screen.queryByRole('button', { name: /calculator/i }))).toBe(q1.calculatorAllowed);
  });
});
```

- [ ] **Step 2: Run and confirm failure.** Run: `npx vitest run src/components/KidPractice.test.tsx`. Expected: FAIL (module not found).

- [ ] **Step 3: Implement `src/components/KidPractice.tsx`.**

```tsx
import React, { useRef, useState } from 'react';
import { Calculator as CalcIcon, Pen } from 'lucide-react';
import type { QuizAttempt } from '../types';
import { useProgress } from '../context/ProgressContext';
import {
  answeredCount, recordAnswer, resolveSession, sessionToAttempt, type ActiveSession,
} from '../engine/activeSession';
import { correctOption } from '../engine/questionModel';
import { Scratchpad } from './Scratchpad';
import { Calculator } from './Calculator';

interface KidPracticeProps {
  session: ActiveSession;
  studentName: string;
  onChange: (s: ActiveSession) => void;
  onFinish: (attempt: QuizAttempt) => void;
  onDiscard: () => void;
}

/** Instant-feedback practice for the child (spec 6.2): one question at a
 *  time, no navigator, no retry. Controlled by `session`. */
export const KidPractice: React.FC<KidPracticeProps> = ({ session, studentName, onChange, onFinish, onDiscard }) => {
  const { curriculum } = useProgress();
  const questions = resolveSession(session, curriculum);
  const [selected, setSelected] = useState<string | null>(null);
  const [confirmStop, setConfirmStop] = useState(false);
  const [scratchOpen, setScratchOpen] = useState(false);
  const [calcOpen, setCalcOpen] = useState(false);
  const finishedRef = useRef(false);

  const finish = () => {
    if (finishedRef.current) return;
    finishedRef.current = true;
    onFinish(sessionToAttempt(session, questions, curriculum.ssa.passingPercent, new Date(), { answeredOnly: true }));
  };

  if (questions.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-xl border border-slate-200 p-6 text-center space-y-4">
          <h1 className="text-lg font-bold text-slate-900">This session can&rsquo;t continue</h1>
          <p className="text-sm text-slate-600">Its questions are no longer available. Discard it to get back on track.</p>
          <button onClick={onDiscard} className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700">
            Discard this session
          </button>
        </div>
      </div>
    );
  }

  const index = Math.min(session.currentIndex, questions.length - 1);
  const q = questions[index];
  const answer = session.answers[q.id];
  const isLast = index === questions.length - 1;
  const right = correctOption(q);

  const check = () => {
    if (!selected) return;
    onChange(recordAnswer(session, q, selected));
    setSelected(null);
  };
  const next = () => {
    if (isLast) finish();
    else onChange({ ...session, currentIndex: index + 1 });
  };
  const stop = () => {
    if (answeredCount(session) === 0) onDiscard();
    else finish();
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="bg-white border-b border-slate-200 px-4 py-3 flex flex-wrap items-center gap-3 justify-between">
        <span className="font-semibold text-slate-800">{studentName}&rsquo;s practice</span>
        <div className="flex items-center gap-1" aria-hidden="true">
          {questions.map((x) => {
            const a = session.answers[x.id];
            return (
              <span key={x.id} className="text-sm">
                {a ? (a.isCorrect ? '⭐' : '●') : '○'}
              </span>
            );
          })}
        </div>
        <span className="text-sm text-slate-600">{index + 1} of {questions.length}</span>
        <div className="flex gap-2">
          <button onClick={() => setScratchOpen(true)} className="flex items-center gap-1 rounded-md border border-slate-300 px-2 py-1 text-sm">
            <Pen className="w-4 h-4" /> Scratchpad
          </button>
          {q.calculatorAllowed && (
            <button onClick={() => setCalcOpen(true)} className="flex items-center gap-1 rounded-md border border-slate-300 px-2 py-1 text-sm">
              <CalcIcon className="w-4 h-4" /> Calculator
            </button>
          )}
        </div>
      </header>

      <main className="flex-1 w-full max-w-2xl mx-auto px-4 py-8 space-y-6">
        <div>
          <p className="text-xl font-semibold text-slate-900 whitespace-pre-line">{q.prompt}</p>
          {q.promptDetails && <p className="mt-2 text-slate-700 whitespace-pre-line">{q.promptDetails}</p>}
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          {q.options.map((o) => {
            const chosen = answer ? answer.selected === o.label : selected === o.label;
            const reveal = answer && o.isCorrect;
            return (
              <button
                key={o.label}
                aria-label={`Answer ${o.label}: ${o.text}`}
                disabled={Boolean(answer)}
                onClick={() => setSelected(o.label)}
                className={`rounded-xl border-2 px-4 py-3 text-left text-lg ${
                  reveal ? 'border-emerald-500 bg-emerald-50'
                    : chosen ? 'border-blue-500 bg-blue-50' : 'border-slate-200 bg-white'
                } disabled:cursor-default`}
              >
                <span className="font-bold mr-2">{o.label}</span>{o.text}
              </button>
            );
          })}
        </div>

        {!answer ? (
          <button
            onClick={check}
            disabled={!selected}
            className="w-full rounded-xl bg-blue-600 px-4 py-3 text-lg font-semibold text-white disabled:opacity-50 hover:bg-blue-700"
          >
            Check my answer
          </button>
        ) : (
          <div className="space-y-4">
            {answer.isCorrect ? (
              <p className="text-2xl font-bold text-emerald-700">Nice!</p>
            ) : (
              <div className="rounded-xl bg-amber-50 border border-amber-200 p-4 space-y-3">
                <p className="text-lg font-semibold text-amber-900">Not quite. The answer is {right.label}.</p>
                <ol className="list-decimal pl-5 space-y-1 text-slate-800">
                  {q.explanation.stepByStep.map((step, i) => <li key={i}>{step}</li>)}
                </ol>
                {q.explanation.commonMisconception && (
                  <p className="text-sm text-slate-700"><strong>Watch out:</strong> {q.explanation.commonMisconception}</p>
                )}
              </div>
            )}
            <button onClick={next} className="w-full rounded-xl bg-blue-600 px-4 py-3 text-lg font-semibold text-white hover:bg-blue-700">
              {isLast ? 'Finish' : 'Next'}
            </button>
          </div>
        )}

        <div className="pt-4 text-center">
          {!confirmStop ? (
            <button onClick={() => setConfirmStop(true)} className="text-sm text-slate-500 underline">
              Stop for today
            </button>
          ) : (
            <div className="space-y-2">
              <p className="text-sm text-slate-700">Stop and save your progress?</p>
              <div className="flex justify-center gap-3">
                <button onClick={stop} className="rounded-md bg-slate-800 px-3 py-1.5 text-sm text-white">Yes, stop</button>
                <button onClick={() => setConfirmStop(false)} className="rounded-md border border-slate-300 px-3 py-1.5 text-sm">Keep going</button>
              </div>
            </div>
          )}
        </div>
      </main>

      <Scratchpad isOpen={scratchOpen} onClose={() => setScratchOpen(false)} />
      <Calculator isOpen={calcOpen} onClose={() => setCalcOpen(false)} />
    </div>
  );
};

export default KidPractice;
```

- [ ] **Step 4: Run the tests.** Run: `npx vitest run src/components/KidPractice.test.tsx`. Expected: PASS.

- [ ] **Step 5: Commit.**

```bash
git add src/components/KidPractice.tsx src/components/KidPractice.test.tsx
git commit -m "feat: kid-mode practice with instant feedback and no retry" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01X5HSDdHPWxvHxgBaoSTbLX"
```

---

### Task 11: End-of-session screens (`KidDone.tsx`, `SessionSummary.tsx`)

**Files:**
- Create: `src/components/KidDone.tsx`, `src/components/SessionSummary.tsx`
- Test: `src/components/KidDone.test.tsx`, `src/components/SessionSummary.test.tsx`

**Interfaces:**
- Consumes: `summarizeAttempt` (Task 4); `buildPath`, `Round` (Task 2).
- Produces:
  ```ts
  export const ENCOURAGEMENT: { high: string[]; mid: string[]; low: string[] };
  export function encouragementFor(correct: number, total: number): string; // high ≥ 80%, mid ≥ 50%, else low; picks index total % list.length
  export const KidDone: React.FC<{ attempt: QuizAttempt; onHandBack: () => void }>;
  export const SessionSummary: React.FC<{ attempt: QuizAttempt; readinessBefore: number; roundBefore: Round | 'test'; onHome: () => void }>;
  ```
  `SessionSummary` reads the current readiness and path from `useProgress()` (the attempt is already recorded when it renders).

- [ ] **Step 1: Write the failing tests.** Create `src/components/KidDone.test.tsx`:

```tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { KidDone, encouragementFor, ENCOURAGEMENT } from './KidDone';
import type { QuizAttempt } from '../types';

const attempt = { scoreRaw: 12, scoreTotal: 15 } as QuizAttempt;

describe('KidDone', () => {
  it('shows the score and hands back to the grown-up', async () => {
    const onHandBack = vi.fn();
    render(<KidDone attempt={attempt} onHandBack={onHandBack} />);
    expect(screen.getByText(/12 out of 15/)).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: /hand back to your grown-up/i }));
    expect(onHandBack).toHaveBeenCalledTimes(1);
  });

  it('picks encouragement by score band', () => {
    expect(ENCOURAGEMENT.high).toContain(encouragementFor(9, 10));
    expect(ENCOURAGEMENT.mid).toContain(encouragementFor(6, 10));
    expect(ENCOURAGEMENT.low).toContain(encouragementFor(1, 10));
    expect(ENCOURAGEMENT.low).toContain(encouragementFor(0, 0));
  });
});
```

Create `src/components/SessionSummary.test.tsx`:

```tsx
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ProgressProvider } from '../context/ProgressContext';
import { SessionSummary } from './SessionSummary';
import { newProfile, saveState } from '../state/storage';
import { getCurriculum } from '../curriculum/registry';
import type { QuizAttempt, QuizAttemptAnswer } from '../types';

const c = getCurriculum(5);
const code = (d: string) => c.domains.find((x) => x.id === d)!.standards[0].code;
function attemptOf(rows: [string, boolean][]): QuizAttempt {
  const answers: Record<string, QuizAttemptAnswer> = {};
  rows.forEach(([d, ok], i) => { answers[`q${i}`] = { questionId: `q${i}`, studentAnswer: 'A', isCorrect: ok, standardCode: code(d) }; });
  return { id: 'a1', quizId: 'path-practice-1', quizTitle: 'Round 1 practice', completedAt: '2026-09-30T12:00:00Z',
    scoreRaw: rows.filter(([, ok]) => ok).length, scoreTotal: rows.length, scorePercent: 0, isPassingSSA: false, timeElapsedSeconds: 0, answers };
}

describe('SessionSummary', () => {
  beforeEach(() => localStorage.clear());

  it('names strong and tricky topics in plain words and shows readiness change', async () => {
    const attempt = attemptOf([['NF', true], ['NF', true], ['NBT', false], ['NBT', false]]);
    const p = newProfile({ id: 'p1', studentName: 'Alex', attempts: [attempt], checkupSkipped: true });
    saveState(localStorage, { version: 2, profiles: [p], activeProfileId: 'p1' });
    const onHome = vi.fn();
    const { container } = render(<ProgressProvider><SessionSummary attempt={attempt} readinessBefore={0} roundBefore={1} onHome={onHome} /></ProgressProvider>);
    expect(screen.getByText(/strong today/i)).toBeInTheDocument();
    expect(screen.getByText('Fractions')).toBeInTheDocument();
    expect(screen.getByText(/decimals & place value/i)).toBeInTheDocument();
    expect(screen.getByText(/missed 2/i)).toBeInTheDocument();
    expect(screen.getByText(/these will come back next time/i)).toBeInTheDocument();
    expect(screen.getByText(/readiness: 0% →/i)).toBeInTheDocument();
    expect(container.textContent).not.toMatch(/NC\.\d/);
    await userEvent.click(screen.getByRole('button', { name: /back to home/i }));
    expect(onHome).toHaveBeenCalledTimes(1);
  });
});
```

- [ ] **Step 2: Run and confirm failure.** Run: `npx vitest run src/components/KidDone.test.tsx src/components/SessionSummary.test.tsx`. Expected: FAIL.

- [ ] **Step 3: Implement `src/components/KidDone.tsx`.**

```tsx
import React from 'react';
import type { QuizAttempt } from '../types';

export const ENCOURAGEMENT = {
  high: ['Amazing work today!', 'You are on fire!', 'Math superstar!'],
  mid: ['Great effort. Keep it up!', 'You are getting stronger every time.', 'Nice job sticking with it!'],
  low: ['Tough ones today, and you kept going!', 'Every question makes your brain stronger.', 'Practice is how we grow. Great job trying!'],
};

export function encouragementFor(correct: number, total: number): string {
  const pct = total === 0 ? 0 : (correct / total) * 100;
  const list = pct >= 80 ? ENCOURAGEMENT.high : pct >= 50 ? ENCOURAGEMENT.mid : ENCOURAGEMENT.low;
  return list[total % list.length];
}

/** The child's end-of-session screen (spec 6.3). */
export const KidDone: React.FC<{ attempt: QuizAttempt; onHandBack: () => void }> = ({ attempt, onHandBack }) => (
  <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
    <div className="max-w-md w-full bg-white rounded-2xl border border-slate-200 p-8 text-center space-y-4">
      <h1 className="text-3xl font-bold text-slate-900">You did it!</h1>
      <p className="text-2xl text-slate-800">{attempt.scoreRaw} out of {attempt.scoreTotal} ⭐</p>
      <p className="text-slate-600">{encouragementFor(attempt.scoreRaw, attempt.scoreTotal)}</p>
      <button onClick={onHandBack} className="w-full rounded-xl bg-blue-600 px-4 py-3 text-lg font-semibold text-white hover:bg-blue-700">
        Hand back to your grown-up
      </button>
    </div>
  </div>
);

export default KidDone;
```

- [ ] **Step 4: Implement `src/components/SessionSummary.tsx`.**

```tsx
import React, { useMemo } from 'react';
import type { QuizAttempt } from '../types';
import { useProgress } from '../context/ProgressContext';
import { summarizeAttempt } from '../engine/sessionSummary';
import { buildPath, type Round } from '../engine/path';

interface SessionSummaryProps {
  attempt: QuizAttempt;
  readinessBefore: number;
  roundBefore: Round | 'test';
  onHome: () => void;
}

const roundRank = (r: Round | 'test') => (r === 'test' ? 4 : r);

/** The parent's plain-English end-of-session summary (spec 6.3). */
export const SessionSummary: React.FC<SessionSummaryProps> = ({ attempt, readinessBefore, roundBefore, onHome }) => {
  const { curriculum, readiness, profile } = useProgress();
  const summary = useMemo(() => summarizeAttempt(attempt, curriculum), [attempt, curriculum]);
  const path = useMemo(
    () => buildPath({ curriculum, attempts: profile.attempts, checkupSkipped: Boolean(profile.checkupSkipped),
      testDate: profile.targetExamDate, now: new Date() }),
    [curriculum, profile.attempts, profile.checkupSkipped, profile.targetExamDate],
  );
  const finishedRound = roundRank(path.currentRound) > roundRank(roundBefore) && roundBefore !== 'test' ? roundBefore : null;

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-10">
      <div className="max-w-lg w-full bg-white rounded-xl border border-slate-200 p-6 space-y-5">
        <h1 className="text-xl font-bold text-slate-900">{profile.studentName}&rsquo;s session</h1>
        <p className="text-slate-700">{summary.correct} out of {summary.total} right.</p>

        {finishedRound !== null && <p className="text-lg font-semibold text-emerald-700">Round {finishedRound} finished! 🎉</p>}

        {summary.strong.length > 0 && (
          <div>
            <h2 className="font-semibold text-slate-800">Strong today ✅</h2>
            <ul className="mt-1 space-y-1">{summary.strong.map((t) => <li key={t.domainId}>{t.name}</li>)}</ul>
          </div>
        )}

        {summary.tricky.length > 0 && (
          <div>
            <h2 className="font-semibold text-slate-800">Tricky</h2>
            <ul className="mt-1 space-y-1">
              {summary.tricky.map((t) => (
                <li key={t.domainId}>{t.name} <span className="text-slate-500">(missed {t.total - t.correct})</span></li>
              ))}
            </ul>
            <p className="mt-1 text-sm text-slate-600">These will come back next time.</p>
          </div>
        )}

        <p className="text-slate-700">Readiness: {Math.round(readinessBefore)}% → {Math.round(readiness)}%</p>

        <button onClick={onHome} className="w-full rounded-md bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-700">
          Back to home
        </button>
      </div>
    </div>
  );
};

export default SessionSummary;
```

- [ ] **Step 5: Run the tests.** Run: `npx vitest run src/components/KidDone.test.tsx src/components/SessionSummary.test.tsx`. Expected: PASS.

- [ ] **Step 6: Commit.**

```bash
git add src/components/KidDone.tsx src/components/KidDone.test.tsx src/components/SessionSummary.tsx src/components/SessionSummary.test.tsx
git commit -m "feat: child and parent end-of-session screens" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01X5HSDdHPWxvHxgBaoSTbLX"
```

---

### Task 12: Parent home page (`ParentHome.tsx`)

**Files:**
- Create: `src/components/ParentHome.tsx`
- Test: `src/components/ParentHome.test.tsx`

**Interfaces:**
- Consumes: `buildPath`, `NextStep` (Task 2); `computePace` (Task 3); `answeredCount`, `sessionSizeOf` (Task 6); `StudyPaceModal`, `PrintReportModal` (existing, `{ isOpen; onClose }`); `useProgress()`.
- Produces:
  ```ts
  interface ParentHomeProps {
    onStartStep: (step: NextStep) => void;
    onContinue: () => void;
    onOpenDetailed: () => void;
    onSwitchStudent: () => void;  // link only shown when state.profiles.length > 1
    onAddStudent: () => void;
  }
  export const ParentHome: React.FC<ParentHomeProps>;
  ```
  Discarding a saved session happens inside ParentHome (`window.confirm`, then `updateActiveProfile({ activeSession: undefined })`), as does "Skip and start practicing" (`updateActiveProfile({ checkupSkipped: true })`) and the inline test-date input.

Exact copy (tests depend on it):
- Header: `{name} · Grade {grade} math`
- Readiness: `{round(readiness)}% ready` and `goal: {passing}%`, then small print `This is practice readiness, not a prediction of the real test.`
- Date line, `none`: `Add a test date to get a weekly plan` plus `<input type="date" aria-label="Test date">`
- `passed`: `Test date passed — update it?` plus the same input
- `normal`/`short`: `Test date: {Mon D} · {left} · {status}`, where `{left}` is `{n} weeks left` when daysLeft ≥ 14, `{n} days left` when 1–13 (`1 day left` for 1), `Test is today` for 0. `{status}` is `✅ On track` / `⚠️ A bit behind` / `🚀 Ahead`.
- Plan line, `normal`: `Plan: about {n} sessions a week, ~20 minutes each` (`1 session a week` for 1). `short`: `Short on time: focus on the 🔴 topics, then take the practice test.`
- Passed practice test: `Ready to try for SSA 🎉`
- Topic status labels: `✅ Strong`, `🟡 Getting there`, `🔴 Needs work`, `Not checked yet`
- Path steps: `Check-up`, `Round 1: Try every topic`, `Round 2: Get every topic to {passing}%`, `Round 3: Test-ready` (plus ` (optional)` when short on time), `Practice test`. The current round shows `({roundTopicsDone} of {topics.length} topics)`.
- Main button: `Start the check-up` / `Start today's practice (Round {n})` / `Start test-ready practice (Round 3)` / `Start the practice test`; with a saved session: `Continue — {answered} of {total} done` plus a link `Start fresh instead`.
- Under a check-up button: link `Skip and start practicing`.
- Always, when a practice-test id exists and no session is saved: link `Try a practice test now`.
- Footer links: `Detailed view`, `Print report`, `Settings`, `Switch student` (2+ students only), `Add another student`.

- [ ] **Step 1: Write the failing tests.** Create `src/components/ParentHome.test.tsx`:

```tsx
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ProgressProvider } from '../context/ProgressContext';
import { ParentHome } from './ParentHome';
import { newProfile, saveState } from '../state/storage';
import type { Profile } from '../state/types';

const ymd = (daysFromNow: number) => {
  const d = new Date();
  d.setDate(d.getDate() + daysFromNow);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};
function renderHome(over: Partial<Profile> = {}, extraProfiles: Profile[] = []) {
  const p = newProfile({ id: 'p1', studentName: 'Alex', grade: 5, ...over });
  saveState(localStorage, { version: 2, profiles: [p, ...extraProfiles], activeProfileId: 'p1' });
  const h = { onStartStep: vi.fn(), onContinue: vi.fn(), onOpenDetailed: vi.fn(), onSwitchStudent: vi.fn(), onAddStudent: vi.fn() };
  const utils = render(<ProgressProvider><ParentHome {...h} /></ProgressProvider>);
  return { ...h, ...utils };
}

describe('ParentHome', () => {
  beforeEach(() => localStorage.clear());

  it('shows the tracker and never "0 days" without a date', () => {
    const { container } = renderHome();
    expect(screen.getByText('Alex · Grade 5 math')).toBeInTheDocument();
    expect(screen.getByText(/0% ready/)).toBeInTheDocument();
    expect(screen.getByText(/goal: 80%/)).toBeInTheDocument();
    expect(screen.getByText(/add a test date to get a weekly plan/i)).toBeInTheDocument();
    expect(container.textContent).not.toMatch(/0 days/);
  });

  it('never shows NC codes or domain ids', () => {
    const { container } = renderHome();
    expect(container.textContent).not.toMatch(/NC\.\d|\bNBT\b|\bOA\b/);
  });

  it('starts with the check-up and can skip it', async () => {
    const h = renderHome();
    await userEvent.click(screen.getByRole('button', { name: /start the check-up/i }));
    expect(h.onStartStep).toHaveBeenCalledWith({ kind: 'checkup', quizId: 'diagnostic-01' });
    await userEvent.click(screen.getByRole('button', { name: /skip and start practicing/i }));
    expect(screen.getByRole('button', { name: /start today's practice \(round 1\)/i })).toBeInTheDocument();
  });

  it('offers Continue for a saved session and can discard it', async () => {
    const confirm = vi.spyOn(window, 'confirm').mockReturnValue(true);
    const h = renderHome({ activeSession: {
      kind: 'practice', quizId: 'path-practice-1', title: 'Round 1 practice',
      refs: [{ kind: 'authored', id: 'a' }, { kind: 'authored', id: 'b' }],
      answers: { a: { selected: 'A', isCorrect: true } }, flagged: {}, currentIndex: 1,
      startedAt: '2026-09-30T00:00:00Z', secondsElapsed: 0,
    } });
    await userEvent.click(screen.getByRole('button', { name: /continue — 1 of 2 done/i }));
    expect(h.onContinue).toHaveBeenCalledTimes(1);
    await userEvent.click(screen.getByRole('button', { name: /start fresh instead/i }));
    expect(confirm).toHaveBeenCalled();
    expect(screen.getByRole('button', { name: /start the check-up/i })).toBeInTheDocument();
  });

  it('shows weeks left and a weekly plan for a date far out', () => {
    renderHome({ targetExamDate: ymd(42) });
    expect(screen.getByText(/6 weeks left/)).toBeInTheDocument();
    expect(screen.getByText(/on track/i)).toBeInTheDocument();
    expect(screen.getByText(/plan: about \d+ sessions? a week/i)).toBeInTheDocument();
  });

  it('switches to short-on-time advice within 14 days', () => {
    renderHome({ targetExamDate: ymd(7) });
    expect(screen.getByText(/7 days left/)).toBeInTheDocument();
    expect(screen.getByText(/short on time/i)).toBeInTheDocument();
    expect(screen.getByText(/round 3: test-ready \(optional\)/i)).toBeInTheDocument();
  });

  it('asks to update a passed date', () => {
    renderHome({ targetExamDate: ymd(-3) });
    expect(screen.getByText(/test date passed/i)).toBeInTheDocument();
  });

  it('saves a test date typed inline', async () => {
    renderHome();
    const input = screen.getByLabelText(/test date/i);
    await userEvent.type(input, ymd(42));
    expect(screen.getByText(/weeks left/)).toBeInTheDocument();
  });

  it('shows Switch student only with more than one student', () => {
    const first = renderHome();
    expect(screen.queryByRole('button', { name: /switch student/i })).not.toBeInTheDocument();
    first.unmount();
    localStorage.clear();
    renderHome({}, [newProfile({ id: 'p2', studentName: 'Sam' })]);
    expect(screen.getByRole('button', { name: /switch student/i })).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run and confirm failure.** Run: `npx vitest run src/components/ParentHome.test.tsx`. Expected: FAIL.

- [ ] **Step 3: Implement `src/components/ParentHome.tsx`.**

```tsx
import React, { useMemo, useState } from 'react';
import { useProgress } from '../context/ProgressContext';
import { buildPath, type NextStep, type Round } from '../engine/path';
import { computePace, type PaceStatus } from '../engine/pace';
import { answeredCount, sessionSizeOf } from '../engine/activeSession';
import type { MasteryStatus } from '../engine/mastery';
import { StudyPaceModal } from './StudyPaceModal';
import { PrintReportModal } from './PrintReportModal';

interface ParentHomeProps {
  onStartStep: (step: NextStep) => void;
  onContinue: () => void;
  onOpenDetailed: () => void;
  onSwitchStudent: () => void;
  onAddStudent: () => void;
}

const STATUS_LABEL: Record<MasteryStatus, string> = {
  'acceleration-ready': '✅ Strong',
  approaching: '🟡 Getting there',
  'needs-focus': '🔴 Needs work',
  untested: 'Not checked yet',
};
const PACE_LABEL: Record<PaceStatus, string> = {
  'on-track': '✅ On track',
  behind: '⚠️ A bit behind',
  ahead: '🚀 Ahead',
};

function timeLeft(days: number): string {
  if (days === 0) return 'Test is today';
  if (days >= 14) return `${Math.floor(days / 7)} weeks left`;
  return days === 1 ? '1 day left' : `${days} days left`;
}

function formatDate(ymd: string): string {
  const [y, m, d] = ymd.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

function stepLabel(step: NextStep): string {
  switch (step.kind) {
    case 'checkup': return 'Start the check-up';
    case 'practice': return `Start today's practice (Round ${step.round})`;
    case 'round3': return 'Start test-ready practice (Round 3)';
    case 'practice-test': return 'Start the practice test';
  }
}

const link = 'text-sm text-blue-700 underline hover:text-blue-900';

/** The parent's home page (spec 4): tracker, topics, path, one button. */
export const ParentHome: React.FC<ParentHomeProps> = ({
  onStartStep, onContinue, onOpenDetailed, onSwitchStudent, onAddStudent,
}) => {
  const { state, profile, curriculum, readiness, updateActiveProfile } = useProgress();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const passing = curriculum.ssa.passingPercent;

  const now = new Date();
  const path = useMemo(
    () => buildPath({ curriculum, attempts: profile.attempts, checkupSkipped: Boolean(profile.checkupSkipped),
      testDate: profile.targetExamDate, now }),
    // `now` changes every render; the inputs that matter are listed.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [curriculum, profile.attempts, profile.checkupSkipped, profile.targetExamDate],
  );
  const pace = computePace({ path, attempts: profile.attempts, testDate: profile.targetExamDate, now,
    sessionSize: sessionSizeOf(profile) });
  const saved = profile.activeSession;

  const dateInput = (
    <input
      type="date"
      aria-label="Test date"
      value={profile.targetExamDate}
      onChange={(e) => updateActiveProfile({ targetExamDate: e.target.value })}
      className="ml-2 rounded border border-slate-300 px-2 py-1 text-sm"
    />
  );

  const discard = () => {
    if (window.confirm('Start fresh? The unfinished session will be thrown away.')) {
      updateActiveProfile({ activeSession: undefined });
    }
  };

  const rounds: { round: Round; label: string }[] = [
    { round: 1, label: 'Round 1: Try every topic' },
    { round: 2, label: `Round 2: Get every topic to ${passing}%` },
    { round: 3, label: `Round 3: Test-ready${path.shortOnTime ? ' (optional)' : ''}` },
  ];
  const rank = (r: Round | 'test') => (r === 'test' ? 4 : r);
  const marker = (r: Round) => (rank(path.currentRound) > r ? '✔' : path.currentRound === r ? '●' : '○');

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
        {/* 1. Tracker */}
        <section className="bg-white rounded-xl border border-slate-200 p-5 space-y-3">
          <h1 className="text-xl font-bold text-slate-900">{profile.studentName} · Grade {curriculum.grade} math</h1>
          <div>
            <div className="relative h-3 rounded-full bg-slate-200 overflow-hidden" aria-hidden="true">
              <div className="h-full bg-blue-600" style={{ width: `${Math.min(100, readiness)}%` }} />
              <div className="absolute top-0 h-full w-0.5 bg-slate-800" style={{ left: `${passing}%` }} />
            </div>
            <p className="mt-2 text-slate-800">
              <strong>{Math.round(readiness)}% ready</strong> — goal: {passing}%
            </p>
            <p className="text-xs text-slate-500">This is practice readiness, not a prediction of the real test.</p>
          </div>
          {path.practiceTestPassedAt && <p className="font-semibold text-emerald-700">Ready to try for SSA 🎉</p>}
          <div className="text-sm text-slate-700">
            {pace.dateState === 'none' && <p>Add a test date to get a weekly plan {dateInput}</p>}
            {pace.dateState === 'passed' && <p>Test date passed — update it? {dateInput}</p>}
            {(pace.dateState === 'normal' || pace.dateState === 'short') && (
              <>
                <p>
                  Test date: {formatDate(profile.targetExamDate)} · {timeLeft(pace.daysLeft!)} · {PACE_LABEL[pace.status!]}
                </p>
                {pace.dateState === 'normal' ? (
                  <p>
                    Plan: about {pace.sessionsPerWeek} {pace.sessionsPerWeek === 1 ? 'session' : 'sessions'} a week, ~20 minutes each
                  </p>
                ) : (
                  <p>Short on time: focus on the 🔴 topics, then take the practice test.</p>
                )}
              </>
            )}
          </div>
        </section>

        {/* 2. Topics */}
        <section className="bg-white rounded-xl border border-slate-200 p-5">
          <h2 className="font-semibold text-slate-900 mb-2">Topics</h2>
          <ul className="divide-y divide-slate-100">
            {path.topics.map((t) => (
              <li key={t.domainId} className="flex justify-between py-2 text-sm">
                <span className="text-slate-800">{t.name}</span>
                <span className="text-slate-600">{STATUS_LABEL[t.status]}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* 3. Path */}
        <section className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
          <h2 className="font-semibold text-slate-900">The path</h2>
          <ol className="space-y-1 text-sm text-slate-700">
            <li>{path.checkupDone ? '✔' : profile.checkupSkipped ? '–' : '●'} Check-up{profile.checkupSkipped && !path.checkupDone ? ' (skipped)' : ''}</li>
            {rounds.map(({ round, label }) => (
              <li key={round} className={path.currentRound === round ? 'font-semibold text-slate-900' : ''}>
                {marker(round)} {label}
                {path.currentRound === round && ` (${path.roundTopicsDone} of ${path.topics.length} topics)`}
              </li>
            ))}
            <li className={path.currentRound === 'test' ? 'font-semibold text-slate-900' : ''}>
              {path.practiceTestPassedAt ? '✔' : path.currentRound === 'test' ? '●' : '○'} Practice test
            </li>
          </ol>

          {saved ? (
            <div className="space-y-2">
              <button onClick={onContinue} className="w-full rounded-xl bg-blue-600 px-4 py-3 text-lg font-semibold text-white hover:bg-blue-700">
                Continue — {answeredCount(saved)} of {saved.refs.length} done
              </button>
              <button onClick={discard} className={link}>Start fresh instead</button>
            </div>
          ) : (
            <div className="space-y-2">
              <button onClick={() => onStartStep(path.next)} className="w-full rounded-xl bg-blue-600 px-4 py-3 text-lg font-semibold text-white hover:bg-blue-700">
                {stepLabel(path.next)} ▶
              </button>
              {path.next.kind === 'checkup' && (
                <button onClick={() => updateActiveProfile({ checkupSkipped: true })} className={link}>
                  Skip and start practicing
                </button>
              )}
              {path.practiceTestQuizId && path.next.kind !== 'practice-test' && (
                <div>
                  <button onClick={() => onStartStep({ kind: 'practice-test', quizId: path.practiceTestQuizId! })} className={link}>
                    Try a practice test now
                  </button>
                </div>
              )}
            </div>
          )}
        </section>

        {/* 4. Footer */}
        <footer className="flex flex-wrap gap-4 justify-center">
          <button onClick={onOpenDetailed} className={link}>Detailed view</button>
          <button onClick={() => setReportOpen(true)} className={link}>Print report</button>
          <button onClick={() => setSettingsOpen(true)} className={link}>Settings</button>
          {state.profiles.length > 1 && <button onClick={onSwitchStudent} className={link}>Switch student</button>}
          <button onClick={onAddStudent} className={link}>Add another student</button>
        </footer>
      </div>

      <StudyPaceModal isOpen={settingsOpen} onClose={() => setSettingsOpen(false)} />
      <PrintReportModal isOpen={reportOpen} onClose={() => setReportOpen(false)} />
    </div>
  );
};

export default ParentHome;
```

- [ ] **Step 4: Run the tests.** Run: `npx vitest run src/components/ParentHome.test.tsx`. Expected: PASS. Two known sensitivities:
  - `6 weeks left` needs `daysUntil` = 42 → `Math.floor(42/7)` = 6.
  - The "on track" test has no attempts, so status is `on-track` by definition.
  If the inline date test fails because `userEvent.type` on a date input behaves differently in jsdom, use `fireEvent.change(input, { target: { value: ymd(42) } })` instead (import `fireEvent` from `@testing-library/react`).

- [ ] **Step 5: Commit.**

```bash
git add src/components/ParentHome.tsx src/components/ParentHome.test.tsx
git commit -m "feat: parent home page with tracker, topics and path" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01X5HSDdHPWxvHxgBaoSTbLX"
```

---

### Task 13: Student picker, add-student setup, questions-per-session setting

**Files:**
- Create: `src/components/WhoIsPracticing.tsx`, `src/components/WhoIsPracticing.test.tsx`
- Modify: `src/components/FirstRunScreen.tsx`, `src/components/FirstRunScreen.test.tsx` (append)
- Modify: `src/components/StudyPaceModal.tsx`
- Test: `src/components/StudyPaceModal.test.tsx` (create)

**Interfaces:**
- Produces: `WhoIsPracticing: React.FC<{ onChosen: () => void; onAddStudent: () => void }>` (calls `switchProfile(id)` then `onChosen()`); `FirstRunScreenProps.onCancel?: () => void` (renders a "Cancel" button when given); StudyPaceModal gains a "Questions per session" number input saved as `sessionSize` via `sessionSizeOf`.

- [ ] **Step 1: Write the failing tests.** Create `src/components/WhoIsPracticing.test.tsx`:

```tsx
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ProgressProvider, useProgress } from '../context/ProgressContext';
import { WhoIsPracticing } from './WhoIsPracticing';
import { newProfile, saveState } from '../state/storage';

const ActiveName = () => <p data-testid="active">{useProgress().profile.studentName}</p>;

describe('WhoIsPracticing', () => {
  beforeEach(() => localStorage.clear());

  it('switches to the chosen student', async () => {
    saveState(localStorage, { version: 2, activeProfileId: 'a',
      profiles: [newProfile({ id: 'a', studentName: 'Alex', grade: 5 }), newProfile({ id: 's', studentName: 'Sam', grade: 3 })] });
    const onChosen = vi.fn();
    render(<ProgressProvider><WhoIsPracticing onChosen={onChosen} onAddStudent={vi.fn()} /><ActiveName /></ProgressProvider>);
    expect(screen.getByRole('heading', { name: /who's practicing today\?/i })).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: /sam/i }));
    expect(screen.getByTestId('active')).toHaveTextContent('Sam');
    expect(onChosen).toHaveBeenCalledTimes(1);
  });
});
```

Append to `src/components/FirstRunScreen.test.tsx`, inside the existing `describe`:

```tsx
  it('offers Cancel only when adding another student', async () => {
    const onCancel = vi.fn();
    const { unmount } = render(<FirstRunScreen onComplete={vi.fn()} />);
    expect(screen.queryByRole('button', { name: /cancel/i })).not.toBeInTheDocument();
    unmount();
    render(<FirstRunScreen onComplete={vi.fn()} onCancel={onCancel} />);
    await userEvent.click(screen.getByRole('button', { name: /cancel/i }));
    expect(onCancel).toHaveBeenCalledTimes(1);
  });
```

Create `src/components/StudyPaceModal.test.tsx`:

```tsx
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ProgressProvider, useProgress } from '../context/ProgressContext';
import { StudyPaceModal } from './StudyPaceModal';

const Size = () => <p data-testid="size">{String(useProgress().profile.sessionSize)}</p>;

describe('StudyPaceModal questions per session', () => {
  beforeEach(() => localStorage.clear());

  it('saves a clamped session size', async () => {
    render(<ProgressProvider><StudyPaceModal isOpen onClose={() => {}} /><Size /></ProgressProvider>);
    const input = screen.getByLabelText(/questions per session/i);
    await userEvent.clear(input);
    await userEvent.type(input, '99');
    await userEvent.click(screen.getByRole('button', { name: /save/i }));
    expect(screen.getByTestId('size')).toHaveTextContent('30');
  });
});
```

- [ ] **Step 2: Run and confirm failure.** Run: `npx vitest run src/components/WhoIsPracticing.test.tsx src/components/FirstRunScreen.test.tsx src/components/StudyPaceModal.test.tsx`. Expected: FAIL.

- [ ] **Step 3: Implement `src/components/WhoIsPracticing.tsx`.**

```tsx
import React from 'react';
import { useProgress } from '../context/ProgressContext';

/** Shown on startup when a family has two or more students (spec 8). */
export const WhoIsPracticing: React.FC<{ onChosen: () => void; onAddStudent: () => void }> = ({ onChosen, onAddStudent }) => {
  const { state, switchProfile } = useProgress();
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-xl border border-slate-200 p-6 space-y-4">
        <h1 className="text-xl font-bold text-slate-900">Who&rsquo;s practicing today?</h1>
        <div className="space-y-2">
          {state.profiles.map((p) => (
            <button
              key={p.id}
              onClick={() => { switchProfile(p.id); onChosen(); }}
              className="w-full rounded-lg border border-slate-200 px-4 py-3 text-left hover:bg-slate-50"
            >
              <span className="font-semibold text-slate-900">{p.studentName || 'Unnamed student'}</span>
              <span className="ml-2 text-sm text-slate-500">Grade {p.grade}</span>
            </button>
          ))}
        </div>
        <button onClick={onAddStudent} className="text-sm text-blue-700 underline">Add another student</button>
      </div>
    </div>
  );
};

export default WhoIsPracticing;
```

- [ ] **Step 4: Add `onCancel` to `FirstRunScreen.tsx`.** Add `onCancel?: () => void;` to `FirstRunScreenProps`, destructure it, and directly after the submit `<button>` inside the form add:

```tsx
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="w-full rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
          )}
```

- [ ] **Step 5: Add the session-size field to `StudyPaceModal.tsx`.**
  - Import: `import { sessionSizeOf } from '../engine/activeSession';`
  - State: `const [sessionSize, setSessionSize] = useState(String(sessionSizeOf(profile)));`
  - In `handleSave`'s `updateActiveProfile({...})` add `sessionSize: sessionSizeOf({ sessionSize: Number(sessionSize) }),`
  - In the form, after the existing daily-goal field block, add (match the neighbouring label/input classes):
    ```tsx
    <div>
      <label htmlFor="pace-session-size" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
        Questions per session
      </label>
      <input
        id="pace-session-size"
        type="number"
        min={5}
        max={30}
        value={sessionSize}
        onChange={(e) => setSessionSize(e.target.value)}
        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm"
      />
    </div>
    ```
  - Make sure the submit button's accessible name contains "Save". If it doesn't, change the test's button query to match the existing label rather than renaming the button.

- [ ] **Step 6: Run the tests.** Run: `npx vitest run src/components`. Expected: PASS.

- [ ] **Step 7: Commit.**

```bash
git add src/components/WhoIsPracticing.tsx src/components/WhoIsPracticing.test.tsx src/components/FirstRunScreen.tsx src/components/FirstRunScreen.test.tsx src/components/StudyPaceModal.tsx src/components/StudyPaceModal.test.tsx
git commit -m "feat: student picker, add-student setup and questions-per-session setting" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01X5HSDdHPWxvHxgBaoSTbLX"
```

---

### Task 14: Detailed view and the new app flow (`DetailedView.tsx`, `App.tsx`)

**Files:**
- Create: `src/components/DetailedView.tsx`
- Rewrite: `src/App.tsx`
- Test: `src/App.test.tsx` (create)

**Interfaces:**
- Consumes: everything above. `createStandardDrill`, `createMissedQuestionsDrill`, `createAdaptiveSessionDrill` from `engine/drills` (Task 7); `sessionForStep` (Task 8); `sessionFromQuiz`, `sessionSizeOf`, `isTestStyle` (Task 6); `buildPath` (Task 2); `completeSession` (Task 6); all screens.
- Produces: `DetailedView: React.FC<{ onStartQuiz: (quiz: QuizDefinition) => void; onBack: () => void }>`.

- [ ] **Step 1: Write the failing flow tests.** Create `src/App.test.tsx`:

```tsx
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { App } from './App';
import { DISCLAIMER_STORAGE_KEY, DISCLAIMER_VERSION } from './components/DisclaimerGate';
import { newProfile, saveState, loadState } from './state/storage';
import { getCurriculum } from './curriculum/registry';
import { correctOption } from './engine/questionModel';
import type { Profile } from './state/types';

const c = getCurriculum(5);
const accept = () => localStorage.setItem(DISCLAIMER_STORAGE_KEY,
  JSON.stringify({ version: DISCLAIMER_VERSION, acceptedAt: '2026-09-30T00:00:00.000Z' }));
const seed = (profiles: Profile[]) => saveState(localStorage, { version: 2, profiles, activeProfileId: profiles[0].id });
const activeSession = () => loadState(localStorage).profiles.find((p) => p.id === loadState(localStorage).activeProfileId)!.activeSession;
const answerCurrent = async () => {
  const s = activeSession()!;
  const q = c.source.resolve(s.refs[s.currentIndex]);
  const label = correctOption(q).label;
  await userEvent.click(screen.getByRole('button', { name: new RegExp(`^Answer ${label}:`) }));
  await userEvent.click(screen.getByRole('button', { name: /check my answer/i }));
  return q;
};

describe('App flow', () => {
  beforeEach(() => localStorage.clear());

  it('takes a fresh visitor from the disclaimer to setup to the parent home', async () => {
    render(<App />);
    await userEvent.click(screen.getByRole('checkbox'));
    await userEvent.click(screen.getByRole('button', { name: /agree and continue/i }));
    await userEvent.type(screen.getByLabelText(/student.s name/i), 'Alex');
    await userEvent.click(screen.getByRole('button', { name: /start practicing/i }));
    expect(screen.getByText(/alex · grade \d math/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /start the check-up/i })).toBeInTheDocument();
  });

  it('asks who is practicing when there are two students', async () => {
    accept();
    seed([newProfile({ id: 'a', studentName: 'Alex' }), newProfile({ id: 's', studentName: 'Sam', grade: 3 })]);
    render(<App />);
    await userEvent.click(screen.getByRole('button', { name: /sam/i }));
    expect(screen.getByText(/sam · grade 3 math/i)).toBeInTheDocument();
  });

  it('does not show another student\'s saved session', async () => {
    accept();
    const saved = { kind: 'practice' as const, quizId: 'path-practice-1', title: 'Round 1 practice',
      refs: [{ kind: 'authored' as const, id: c.quizzes[0].questionIds[0] }], answers: {}, flagged: {},
      currentIndex: 0, startedAt: '2026-09-30T00:00:00Z', secondsElapsed: 0 };
    seed([newProfile({ id: 'a', studentName: 'Alex', activeSession: saved }), newProfile({ id: 's', studentName: 'Sam' })]);
    render(<App />);
    await userEvent.click(screen.getByRole('button', { name: /sam/i }));
    expect(screen.queryByRole('button', { name: /continue —/i })).not.toBeInTheDocument();
  });

  it('runs a practice session to the summary, and resumes a saved one after reload', async () => {
    accept();
    seed([newProfile({ id: 'a', studentName: 'Alex', checkupSkipped: true, sessionSize: 5 })]);
    const first = render(<App />);
    await userEvent.click(screen.getByRole('button', { name: /start today's practice \(round 1\)/i }));
    await answerCurrent();
    await userEvent.click(screen.getByRole('button', { name: /^next$/i }));

    // "Reload": unmount and render from storage.
    first.unmount();
    render(<App />);
    await userEvent.click(screen.getByRole('button', { name: /continue — 1 of \d+ done/i }));
    const total = activeSession()!.refs.length;
    expect(screen.getByText(new RegExp(`^2 of ${total}$`))).toBeInTheDocument();

    for (let i = 1; i < total; i++) {
      await answerCurrent();
      await userEvent.click(screen.getByRole('button', { name: i === total - 1 ? /finish/i : /^next$/i }));
    }
    expect(screen.getByText(/you did it!/i)).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: /hand back to your grown-up/i }));
    expect(screen.getByText(/readiness:/i)).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: /back to home/i }));
    expect(screen.getByText(/alex · grade 5 math/i)).toBeInTheDocument();
    expect(loadState(localStorage).profiles[0].attempts).toHaveLength(1);
    expect(activeSession()).toBeUndefined();
  });

  it('opens the detailed view and comes back', async () => {
    accept();
    seed([newProfile({ id: 'a', studentName: 'Alex' })]);
    render(<App />);
    await userEvent.click(screen.getByRole('button', { name: /detailed view/i }));
    const back = screen.getByRole('button', { name: /back to home/i });
    expect(within(document.body).getByRole('navigation')).toBeInTheDocument();
    await userEvent.click(back);
    expect(screen.getByText(/alex · grade 5 math/i)).toBeInTheDocument();
  });
});
```

(If `Navbar` doesn't render a `<nav>` element, replace the `navigation` role assertion with a check for a Navbar tab label you can see in `Navbar.tsx`, such as its "Dashboard" tab text.)

- [ ] **Step 2: Run and confirm failure.** Run: `npx vitest run src/App.test.tsx`. Expected: FAIL (setup leads to today's dashboard, and no parent home exists yet).

- [ ] **Step 3: Create `src/components/DetailedView.tsx`.** Move today's tab shell out of `App.tsx` unchanged, adding a back bar:

```tsx
import React, { useState } from 'react';
import { useProgress } from '../context/ProgressContext';
import { Navbar, type NavTab } from './Navbar';
import { Dashboard } from './Dashboard';
import { CurriculumView } from './CurriculumView';
import { QuizzesListView } from './QuizzesListView';
import { WeakSpotsView } from './WeakSpotsView';
import { StudyGuideModal } from './StudyGuideModal';
import { StudyPaceModal } from './StudyPaceModal';
import { PrintReportModal } from './PrintReportModal';
import type { QuizDefinition } from '../types';
import type { QuestionRef } from '../engine/questionModel';
import { createAdaptiveSessionDrill, createMissedQuestionsDrill, createStandardDrill } from '../engine/drills';

/** Today's full tab UI (codes, study guides, per-standard drills), kept for
 *  parents who want the detail, reached from the home page footer (spec 4.4). */
export const DetailedView: React.FC<{ onStartQuiz: (quiz: QuizDefinition) => void; onBack: () => void }> = ({ onStartQuiz, onBack }) => {
  const { curriculum } = useProgress();
  const [currentTab, setCurrentTab] = useState<NavTab>('dashboard');
  const [studyGuideStandard, setStudyGuideStandard] = useState<string | null>(null);
  const [isPaceModalOpen, setIsPaceModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  const startQuizById = (quizId: string) => {
    const quiz = curriculum.quizzes.find((q) => q.id === quizId);
    if (quiz) onStartQuiz(quiz);
  };
  const startStandardDrill = (code: string) => onStartQuiz(createStandardDrill(code, curriculum));
  const startCustom = (ids: string[]) => onStartQuiz(createMissedQuestionsDrill(ids));
  const startAdaptive = (refs: QuestionRef[]) => onStartQuiz(createAdaptiveSessionDrill(refs));

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col selection:bg-blue-500 selection:text-white">
      <div className="bg-slate-800 px-4 py-2">
        <button onClick={onBack} className="text-sm text-white underline">← Back to home</button>
      </div>
      <Navbar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        onOpenPaceModal={() => setIsPaceModalOpen(true)}
        onOpenReportModal={() => setIsReportModalOpen(true)}
      />
      <main className="flex-1">
        {currentTab === 'dashboard' && (
          <Dashboard
            onStartQuiz={startQuizById}
            onOpenStudyGuide={setStudyGuideStandard}
            onNavigateTab={setCurrentTab}
            onOpenPaceModal={() => setIsPaceModalOpen(true)}
            onOpenReportModal={() => setIsReportModalOpen(true)}
          />
        )}
        {currentTab === 'curriculum' && (
          <CurriculumView onStartStandardDrill={startStandardDrill} onOpenStudyGuide={setStudyGuideStandard} />
        )}
        {currentTab === 'quizzes' && (
          <QuizzesListView
            onStartQuiz={startQuizById}
            onStartStandardDrill={startStandardDrill}
            onStartAdaptiveSession={startAdaptive}
          />
        )}
        {currentTab === 'weakspots' && (
          <WeakSpotsView onStartCustomQuiz={startCustom} onOpenStudyGuide={setStudyGuideStandard} />
        )}
      </main>
      <StudyGuideModal
        standardCode={studyGuideStandard}
        onClose={() => setStudyGuideStandard(null)}
        onStartStandardDrill={startStandardDrill}
      />
      <StudyPaceModal isOpen={isPaceModalOpen} onClose={() => setIsPaceModalOpen(false)} />
      <PrintReportModal isOpen={isReportModalOpen} onClose={() => setIsReportModalOpen(false)} />
    </div>
  );
};

export default DetailedView;
```

- [ ] **Step 4: Rewrite `src/App.tsx`.**

```tsx
import React, { useState } from 'react';
import { ProgressProvider, useProgress } from './context/ProgressContext';
import { DisclaimerGate } from './components/DisclaimerGate';
import { FirstRunScreen } from './components/FirstRunScreen';
import { WhoIsPracticing } from './components/WhoIsPracticing';
import { ParentHome } from './components/ParentHome';
import { KidPractice } from './components/KidPractice';
import { KidDone } from './components/KidDone';
import { SessionSummary } from './components/SessionSummary';
import { QuizRunner } from './components/QuizRunner';
import { QuizResults } from './components/QuizResults';
import { StudyGuideModal } from './components/StudyGuideModal';
import { DetailedView } from './components/DetailedView';
import type { QuizAttempt, QuizDefinition } from './types';
import { parseQuestionRef } from './engine/questionModel';
import { buildPath, type NextStep, type Round } from './engine/path';
import { sessionForStep } from './engine/pathSession';
import { sessionFromQuiz, sessionSizeOf, type ActiveSession } from './engine/activeSession';
import { createStandardDrill } from './engine/drills';
import { standardsOf } from './curriculum/registry';

type Screen =
  | { kind: 'who' }
  | { kind: 'setup' }            // adding another student
  | { kind: 'home' }
  | { kind: 'session' }          // reads profile.activeSession
  | { kind: 'kid-done'; attempt: QuizAttempt; readinessBefore: number; roundBefore: Round | 'test' }
  | { kind: 'summary'; attempt: QuizAttempt; readinessBefore: number; roundBefore: Round | 'test' }
  | { kind: 'detailed' }
  | { kind: 'results'; attempt: QuizAttempt };

const MainApp: React.FC = () => {
  const {
    state, profile, curriculum, mastery, readiness,
    updateActiveProfile, addProfile, completeSession,
  } = useProgress();
  const [screen, setScreen] = useState<Screen>(() => (state.profiles.length > 1 ? { kind: 'who' } : { kind: 'home' }));
  const [studyGuideStandard, setStudyGuideStandard] = useState<string | null>(null);

  const currentPath = () =>
    buildPath({ curriculum, attempts: profile.attempts, checkupSkipped: Boolean(profile.checkupSkipped),
      testDate: profile.targetExamDate, now: new Date() });

  const begin = (s: ActiveSession | null) => {
    if (!s) return;
    if (profile.activeSession && !window.confirm('A session is already in progress. Throw it away and start this one?')) return;
    updateActiveProfile({ activeSession: s });
    setScreen({ kind: 'session' });
  };

  const startStep = (step: NextStep) =>
    begin(sessionForStep({
      step, curriculum, mastery, queue: profile.reviewQueue,
      activeDomains: currentPath().activeDomains,
      size: sessionSizeOf(profile), now: new Date(), seed: Date.now() % 2 ** 31,
    }));

  const startDrill = (quiz: QuizDefinition) => begin(sessionFromQuiz(quiz, 'drill', new Date()));

  const finish = (session: ActiveSession, attempt: QuizAttempt) => {
    const readinessBefore = readiness;
    const roundBefore = currentPath().currentRound;
    const results = Object.entries(attempt.answers).map(([id, a]) => ({ ref: parseQuestionRef(id), wasCorrect: a.isCorrect }));
    completeSession(attempt, results);
    setScreen(session.kind === 'drill'
      ? { kind: 'results', attempt }
      : { kind: 'kid-done', attempt, readinessBefore, roundBefore });
  };

  const discardSession = () => {
    updateActiveProfile({ activeSession: undefined });
    setScreen({ kind: 'home' });
  };

  const homeScreen = (
    <ParentHome
      onStartStep={startStep}
      onContinue={() => setScreen({ kind: 'session' })}
      onOpenDetailed={() => setScreen({ kind: 'detailed' })}
      onSwitchStudent={() => setScreen({ kind: 'who' })}
      onAddStudent={() => setScreen({ kind: 'setup' })}
    />
  );

  // First run: nothing typed yet and no history for this profile.
  if (!profile.studentName.trim() && profile.attempts.length === 0) {
    return <FirstRunScreen onComplete={({ studentName, grade }) => updateActiveProfile({ studentName, grade })} />;
  }

  switch (screen.kind) {
    case 'who':
      return <WhoIsPracticing onChosen={() => setScreen({ kind: 'home' })} onAddStudent={() => setScreen({ kind: 'setup' })} />;

    case 'setup':
      return (
        <FirstRunScreen
          onComplete={({ studentName, grade }) => { addProfile(studentName, grade); setScreen({ kind: 'home' }); }}
          onCancel={() => setScreen({ kind: 'home' })}
        />
      );

    case 'session': {
      const s = profile.activeSession;
      if (!s) return homeScreen;
      const save = (next: ActiveSession) => updateActiveProfile({ activeSession: next });
      return s.kind === 'practice' ? (
        <KidPractice
          session={s}
          studentName={profile.studentName}
          onChange={save}
          onFinish={(a) => finish(s, a)}
          onDiscard={discardSession}
        />
      ) : (
        <QuizRunner
          key={s.startedAt}
          session={s}
          onChange={save}
          onFinish={(a) => finish(s, a)}
          onPause={() => setScreen(s.kind === 'drill' ? { kind: 'detailed' } : { kind: 'home' })}
          onDiscard={discardSession}
        />
      );
    }

    case 'kid-done':
      return <KidDone attempt={screen.attempt} onHandBack={() => setScreen({ ...screen, kind: 'summary' })} />;

    case 'summary':
      return (
        <SessionSummary
          attempt={screen.attempt}
          readinessBefore={screen.readinessBefore}
          roundBefore={screen.roundBefore}
          onHome={() => setScreen({ kind: 'home' })}
        />
      );

    case 'detailed':
      return <DetailedView onStartQuiz={startDrill} onBack={() => setScreen({ kind: 'home' })} />;

    case 'results': {
      const attempt = screen.attempt;
      const retake = () => {
        const fallback = attempt.standardCode ?? standardsOf(curriculum)[0]?.code;
        const quiz = curriculum.quizzes.find((q) => q.id === attempt.quizId)
          ?? (fallback ? createStandardDrill(fallback, curriculum) : undefined);
        if (quiz) startDrill(quiz);
      };
      return (
        <>
          <QuizResults
            attempt={attempt}
            onRetake={retake}
            onStartStandardDrill={(code) => startDrill(createStandardDrill(code, curriculum))}
            onOpenStudyGuide={setStudyGuideStandard}
            onDone={() => setScreen({ kind: 'detailed' })}
          />
          <StudyGuideModal
            standardCode={studyGuideStandard}
            onClose={() => setStudyGuideStandard(null)}
            onStartStandardDrill={(code) => startDrill(createStandardDrill(code, curriculum))}
          />
        </>
      );
    }

    case 'home':
    default:
      return homeScreen;
  }
};

export function App() {
  return (
    <DisclaimerGate>
      <ProgressProvider>
        <MainApp />
      </ProgressProvider>
    </DisclaimerGate>
  );
}

export default App;
```

Notes for the implementer:
- `homeScreen` is a JSX value, not a nested component, so React doesn't remount ParentHome (and reset its open modals) on every render.
- `key={s.startedAt}` makes QuizRunner remount when a different session starts. That matters because QuizRunner seeds local state from the session only on mount.
- The old `beforeunload` guard is gone on purpose (spec 7): every answer is saved.

- [ ] **Step 5: Run the flow tests.** Run: `npx vitest run src/App.test.tsx`. Expected: PASS.

- [ ] **Step 6: Run everything.** Run: `npm run test:run && npm run typecheck && npm run lint`. Expected: PASS. Remove any imports lint reports as unused.

- [ ] **Step 7: Commit.**

```bash
git add src/components/DetailedView.tsx src/App.tsx src/App.test.tsx
git commit -m "feat: parent home, kid mode and saved sessions replace the tab dashboard" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01X5HSDdHPWxvHxgBaoSTbLX"
```

---

### Task 15: README, build and hands-on check

**Files:**
- Modify: `README.md`

- [ ] **Step 1: Update the README.** In `README.md`, replace the section that describes the dashboard and tabs (keep install and dev instructions) with:

```markdown
## How it works

1. **Set up.** After agreeing to the disclaimer, enter the student's name and grade.
2. **Parent home.** One page shows how ready the student is (goal: 80%), how they're doing on each topic, and whether they're on track for the test date. One button always says what to do next.
3. **Check-up (optional).** A short test that finds topics the student already knows, so practice skips them.
4. **Three rounds across every topic.**
   - Round 1: try every topic.
   - Round 2: get every topic to 80%.
   - Round 3: test-ready practice under test conditions.
5. **Practice test.** A full practice test. Scoring 80% or better shows "Ready to try for SSA".

Hand the device to the student for each session. Practice gives feedback after every question, and missed questions come back in later sessions. At the end the student hands it back and the parent sees a short summary. Progress is saved after every answer, so closing the tab loses nothing.

**Short on time?** Set a test date within two weeks and the path skips ahead to the weakest topics, then the practice test.

The "Detailed view" link on the home page keeps the full breakdown by NC standard, study guides and per-standard drills.
```

- [ ] **Step 2: Full verification.** Run: `npm run test:run && npm run typecheck && npm run lint && npm run build`. Expected: all PASS; build writes `dist/`.

- [ ] **Step 3: Hands-on check.** Run `npm run dev`. In a fresh browser profile (or after clearing site data), walk through the flow and confirm each point:
  - disclaimer → setup → parent home with "Start the check-up"
  - skip → Round 1 practice: feedback after each answer, "Stop for today" returns to home with the summary
  - reload mid-session → "Continue — N of M done" resumes the same question
  - set a date 7 days out → "Short on time" copy
  - "Detailed view" → today's tabs, and "Back to home" returns
  - add a second student → reload → "Who's practicing today?"
  - no NC codes on home, kid mode or summary

  Record anything that doesn't match the spec as a fix before committing.

- [ ] **Step 4: Commit.**

```bash
git add README.md
git commit -m "docs: describe the parent path in the README" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01X5HSDdHPWxvHxgBaoSTbLX"
```

---

## Spec coverage check

| Spec section | Task |
|---|---|
| 4.1 Tracker (readiness, 80% marker, note, pace, plan, no date, short, passed) | 3, 12 |
| 4.2 Topics with plain names and four statuses | 1, 2, 12 |
| 4.3 Path + one button + practice-test link + Continue / Start fresh | 2, 12 |
| 4.4 Footer: detailed view, print, settings, switch, add | 12, 13, 14 |
| 5.1 Topics = domains with content | 2 |
| 5.2 Check-up offered, skippable, ✅ domains start at Round 2 | 2, 12 |
| 5.3 Rounds, exit rules, breadth-first, review cap, thin content | 2, 5, 8 |
| 5.4 Practice test finish line, always available, form rotation, "Ready" | 2, 12 |
| 5.5 Short-on-time mode | 2, 3, 12 |
| 6.1 Session types (instant vs test-style) | 6, 9, 10, 14 |
| 6.2 Practice screen, no retry, stop confirm | 10 |
| 6.3 Kid-done + parent summary; early stop | 10, 11, 14 |
| 7 Session persistence, no expiry, beforeunload removed, one session | 6, 9, 10, 14 |
| 8 Screen union, startup order, who screen | 13, 14 |
| 9 Drill factories moved; composer `plan` | 5, 7 |
| 10 New units | 2–4, 8, 10–14 |
| 11 State (no bump, see Global Constraints), `parentName` + integrity test | 1, 6 |
| 12 Testing | every task |
