# Trust Plan A: Progress and Saved Data Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make every progress number and every saved byte trustworthy: readiness, badges, path and pace are computed by one set of threshold functions from real evidence, saved data can never be silently lost or crash the app, and a red CI can never publish.

**Architecture:** Threshold logic collapses into three exported functions in `engine/mastery.ts` (`isPassing`, `masteryStatus`, `readinessStatus`) plus one display formatter, and every screen reads them. The path engine separates "where the path sends the child" from "what the child actually finished", and tags due-review answers with an `origin` flag so they cannot pull a finished topic backwards. Storage gains a pure `normaliseState` (repair, never reject), a pure `mergeStates` (multi-tab), a memory fallback, a root `ErrorBoundary` and a not-saving banner.

**Tech Stack:** React 19 + TypeScript (`erasableSyntaxOnly`, `noUnusedLocals`), Vite, Tailwind, Vitest + Testing Library (`@testing-library/react`, `@testing-library/user-event`), `lucide-react`, oxlint, GitHub Actions.

**Spec:** `docs/superpowers/specs/2026-09-30-quality-and-trust-design.md` (section 2 in full, plus the cross-screen fixture test from section 5). Inputs: `docs/superpowers/audits/2026-09-30/logic-scoring.md` (F1-F15), `logic-flows.md`, and the KidPractice `promptDetails` finding in `content-g3.md`.

Out of this plan (other plans): content rewrites and `contentVersion` (Plan B1), answer-check, snapshot and E2E work (Plan C).

## Global Constraints

- Commit trailer lines, on every commit:
  ```
  Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
  Claude-Session: https://claude.ai/code/session_01X5HSDdHPWxvHxgBaoSTbLX
  ```
- Commands: tests `npx vitest run <path>`, all tests `npm run test:run`, types `npm run typecheck`, lint `npm run lint`, build `npm run build`.
- Passing bar is always `curriculum.ssa.passingPercent`, never a literal `80` in logic (display copy reads it too).
- Question ids never change.
- `mastery.ts` exports the only functions that decide pass/ready/strong: `isPassing(correct, total, passing)` (compares `correct * 100 >= passing * total`, no floating-point or rounding), `masteryStatus` (semantics unchanged: at or above passing with at least `MIN_SAMPLE_FOR_MASTERY` = 4 answers), and `readinessStatus(readiness, passing)`. No `Math.round` before a threshold compare anywhere.
- Display rule: readiness shows as `Math.floor(readiness)` so a value below the goal never displays as the goal (79.6 becomes "79%"). Every screen uses the one formatter `formatPercent`.
- `overallReadiness` = sum over domains of weight x mean over the domain's standards of `percent x min(1, total / MIN_SAMPLE_FOR_MASTERY)`. Untested standards stay 0. Weights and the blueprint mean are otherwise unchanged.
- **No storage schema version bump.** Every new stored field is optional (`Profile.activeSessionAt`, `Profile.historyClearedAt`, `AppStateV2.deletedProfileIds`, `ActiveSession.origins`, `QuizAttemptAnswer.origin`), so any stored v2 blob stays valid. A missing `origin` means `'new'`.
- The provider never writes before the first user-initiated change (no save-on-mount).
- An unparseable or repaired stored blob is copied to `ncmathssa_corrupt_<ISO time>` before anything else is written.
- Kid mode, kid-done and summary screens still show no NC codes, domain ids or blueprint weight bands.
- Every finding fixed has a regression test whose name cites it (`F1: ...`, `logic-flows High: ...`).
- Sequencing note: tasks run in order. A test that pins wrong behaviour is updated in the same task as the fix and is listed in that task.

## Review Focus

1. **Two tabs, one of them stale, after "Clear history" or "Delete student".** The merge on save must not resurrect erased attempts or a deleted student, and must not lose the other tab's attempts. Pinned in Task 11 (pure) and Task 12 (provider).
2. **Readiness at the pass boundary with floating-point noise** (79.6 everywhere, 79.99999999999999, exactly 80, 63 of 79 in a domain). Every screen must agree on the number and the ready state. Pinned in Tasks 6, 8 and 9.
3. **Short-on-time with a test date today, 0 attempts or exactly 1 attempt.** Pace is never "Ahead" and Round 1 shows "Skipped", never a check mark. Pinned in Task 2 (and Task 17 for another grade's old attempts).
4. **A profile saved before this change (attempts without `origin`, sessions without `origins`, no `reviewQueue`, a dangling active student, grade 6).** It loads, keeps its history, and treats missing flags as `'new'`. Pinned in Tasks 3 and 13.
5. **`localStorage` blocked or full.** The app keeps running in memory, shows the persistent banner, and Export still hands over the current state. Pinned in Task 10.

---

## File map

| File | Status | Responsibility |
|---|---|---|
| `src/components/PromptDetails.tsx` | create | monospace, exact-whitespace diagram box shared by four screens |
| `src/engine/attempts.ts` | create | `currentGradeAttempts` (pace start date, quizzes taken) |
| `src/engine/mastery.ts` | modify | `isPassing`, `masteryStatus` (counts), `readinessStatus`, `formatPercent`, `pointsToGoal`, evidence-scaled `overallReadiness` |
| `src/engine/path.ts` | modify | real vs navigated rounds, `round1Skipped`, exact pass compare, origin windows, latest-mock, `practiceTestRepeat`, `timeLeftText`, `localDayKey` |
| `src/engine/pace.ts` | modify | never "ahead" with 0-1 attempts, current-grade start date |
| `src/engine/sessionComposer.ts` | modify | `composeSession` returns each ref's `origin` |
| `src/engine/pathSession.ts` | modify | stores `origins` on the session |
| `src/engine/activeSession.ts` | modify | `origins`, exact `isPassingSSA`, random attempt-id suffix, answer `origin` |
| `src/engine/sessionSummary.ts` | modify | `alsoPracticed`, `notAnswered`, 3-answer rule for "strong" |
| `src/types/index.ts` | modify | `AnswerOrigin`, `QuizAttemptAnswer.origin` |
| `src/state/types.ts` | modify | optional merge fields |
| `src/state/memoryStorage.ts` | create | in-memory `Storage` (fallback and tests) |
| `src/state/storage.ts` | modify | `normaliseState`, repairing `loadState`, corrupt backup, `getBrowserStorage`, `saveState` returns `{ ok }`, `loadStoredState` |
| `src/state/merge.ts` | create | pure `mergeStates` |
| `src/state/exportData.ts` | create | `downloadText`, `exportFilename`, `rawStoredJson` |
| `src/state/readiness.testkit.ts` | create | seeded-attempt builder for readiness fixtures |
| `src/context/ProgressContext.tsx` | modify | dirty-gated save, merge on save, storage event, `saveOk`, day key, readiness summary |
| `src/components/ErrorBoundary.tsx` | create | root recovery screen |
| `src/components/SaveBanner.tsx` | create | "Progress isn't being saved" banner |
| `src/components/useEscapeKey.ts` | create | Escape-to-close hook for overlays |
| `src/components/KidPractice.tsx` | modify | `PromptDetails`, focus/status, `aria-pressed`, stop copy |
| `src/components/QuizRunner.tsx`, `Scratchpad.tsx`, `Calculator.tsx`, `StudyPaceModal.tsx` | modify | dialog semantics, Escape, aria-labels, 44px targets |
| `src/components/QuizResults.tsx`, `WeakSpotsView.tsx` | modify | `PromptDetails`; QuizResults claims a pass only for practice tests |
| `src/components/ParentHome.tsx`, `Dashboard.tsx`, `Navbar.tsx`, `PrintReportModal.tsx`, `SessionSummary.tsx`, `DetailedView.tsx` | modify | shared formatters, labels, badges |
| `src/App.tsx` | modify | `ErrorBoundary` + `SaveBanner` |
| `.github/workflows/deploy.yml` | modify | deploy only after CI succeeds on `master` |
| `src/ciWorkflow.test.ts` | create | pins the deploy gate |
| `README.md` | modify | CI/deploy note |

---

### Task 1: Text diagrams keep their spacing in kid mode (Critical, content-g3 display finding)

**Files:**
- Create: `src/components/PromptDetails.tsx`
- Create: `src/components/PromptDetails.test.tsx`
- Modify: `src/components/KidPractice.tsx` (line 101 and imports)
- Modify: `src/components/QuizRunner.tsx` (the `promptDetails` block near line 234)
- Modify: `src/components/QuizResults.tsx` (near line 300), `src/components/WeakSpotsView.tsx` (near line 334)
- Test: `src/components/KidPractice.test.tsx`, `src/components/QuizRunner.test.tsx`

**Interfaces:**
- Produces: `PromptDetails: React.FC<{ children: string; className?: string }>` (default export too) and `isTextDiagram(text: string): boolean`. Renders `<div data-testid="prompt-details">` in `font-mono` whose only child is one text node (Plan C's E2E measures that node). Text that is a diagram (`isTextDiagram`: a line with two or more spaces after a non-space, a line starting with two spaces, or a `|`) gets `whitespace-pre overflow-x-auto`: exact spacing, long lines scroll inside the box. Anything else is prose and gets `whitespace-pre-wrap`, so long sentences (e.g. grade 1 measurement scenarios) wrap on a phone. Controller ruling: the spec asks for both pre-wrap and horizontal scrolling; applying `whitespace-pre` to every `promptDetails` would stop prose from wrapping, so the choice is made per item.

- [ ] **Step 1: Write the failing tests.**

Create `src/components/PromptDetails.test.tsx`:

```tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PromptDetails, isTextDiagram } from './PromptDetails';

describe('PromptDetails', () => {
  it('keeps runs of spaces and scrolls long lines instead of wrapping', () => {
    const diagram = '0      1\n|--|--|--|\n     P';
    render(<PromptDetails>{diagram}</PromptDetails>);
    const box = screen.getByTestId('prompt-details');
    expect(box.textContent).toBe(diagram);
    expect(box.childNodes).toHaveLength(1);
    expect(box).toHaveClass('font-mono', 'whitespace-pre', 'overflow-x-auto');
    expect(box).not.toHaveClass('whitespace-pre-line', 'whitespace-pre-wrap');
  });

  it('lets prose wrap so long sentences stay on a phone screen', () => {
    const prose = 'Mia has a ribbon that is 12 inches long. She cuts off 5 inches.\nHow long is the ribbon now?';
    render(<PromptDetails>{prose}</PromptDetails>);
    const box = screen.getByTestId('prompt-details');
    expect(box.textContent).toBe(prose);
    expect(box).toHaveClass('font-mono', 'whitespace-pre-wrap');
    expect(box).not.toHaveClass('whitespace-pre');
  });

  it('tells diagrams from prose', () => {
    expect(isTextDiagram('0      1\n|--|--|')).toBe(true);
    expect(isTextDiagram('  ■ ■ ■\n  ■ ■')).toBe(true);
    expect(isTextDiagram('Row A: ■ ■ ■')).toBe(false);
    expect(isTextDiagram('Expression P: 4 × (12,840 + 675)\nExpression Q: 12,840 + 675')).toBe(false);
  });
});
```

Append to `src/components/KidPractice.test.tsx` (add `import { newProfile, saveState } from '../state/storage';` to the top imports):

```tsx
describe('KidPractice text diagrams (content-g3 CRITICAL display)', () => {
  beforeEach(() => localStorage.clear());

  it('g3 nf2: promptDetails render monospace with exact spacing', () => {
    saveState(localStorage, {
      version: 2, activeProfileId: 'p3',
      profiles: [newProfile({ id: 'p3', studentName: 'Sam', grade: 3 })],
    });
    const ref = { kind: 'generated' as const, templateId: 'g3.nf2.fraction-on-a-number-line', seed: 7 };
    const q = getCurriculum(3).source.resolve(ref);
    expect(q.promptDetails).toBeTruthy();
    setup(newSession({ kind: 'practice', quizId: 'path-practice-1', title: 't', refs: [ref], now: new Date() }));
    const box = screen.getByTestId('prompt-details');
    expect(box.textContent).toBe(q.promptDetails);
    expect(box).toHaveClass('font-mono', 'whitespace-pre', 'overflow-x-auto');
  });
});
```

Append to `src/components/QuizRunner.test.tsx` (add `import { newProfile, saveState } from '../state/storage';`):

```tsx
describe('QuizRunner text diagrams (content-g3 HIGH display)', () => {
  beforeEach(() => localStorage.clear());

  it('g3 nf2: a long number line scrolls instead of wrapping', () => {
    saveState(localStorage, {
      version: 2, activeProfileId: 'p3',
      profiles: [newProfile({ id: 'p3', studentName: 'Sam', grade: 3 })],
    });
    const ref = { kind: 'generated' as const, templateId: 'g3.nf2.fraction-on-a-number-line', seed: 7 };
    render(
      <ProgressProvider>
        <QuizRunner
          session={newSession({ kind: 'checkup', quizId: 'x', title: 'x', refs: [ref], now: new Date() })}
          onChange={vi.fn()} onFinish={vi.fn()} onPause={vi.fn()} onDiscard={vi.fn()}
        />
      </ProgressProvider>,
    );
    expect(screen.getByTestId('prompt-details')).toHaveClass('whitespace-pre', 'overflow-x-auto');
  });
});
```

- [ ] **Step 2: Run them and confirm they fail.** Run: `npx vitest run src/components/PromptDetails.test.tsx src/components/KidPractice.test.tsx src/components/QuizRunner.test.tsx`. Expected: FAIL (`./PromptDetails` missing; no `prompt-details` test id).

- [ ] **Step 3: Create the component.** `src/components/PromptDetails.tsx`:

```tsx
import React from 'react';

interface PromptDetailsProps {
  children: string;
  /** Padding, radius and text size, which differ per screen. */
  className?: string;
}

/** A text diagram (number line, shaded bar, array) is laid out with runs of
 *  spaces or tick marks; prose is not. */
export function isTextDiagram(text: string): boolean {
  return /\S {2,}|^ {2,}|\|/m.test(text);
}

/** Diagrams need exact whitespace, and their long lines scroll inside the
 *  box, because wrapping would misalign them. Prose wraps normally. The box
 *  holds a single text node so its layout can be measured. */
export const PromptDetails: React.FC<PromptDetailsProps> = ({ children, className = '' }) => {
  const layout = isTextDiagram(children) ? 'whitespace-pre overflow-x-auto' : 'whitespace-pre-wrap';
  return (
    <div
      data-testid="prompt-details"
      className={`font-mono font-semibold text-slate-800 bg-slate-50 border border-slate-200 ${layout} ${className}`}
    >
      {children}
    </div>
  );
};

export default PromptDetails;
```

- [ ] **Step 4: Use it in the four screens.**

`KidPractice.tsx`: add `import { PromptDetails } from './PromptDetails';` and replace line 101
`{q.promptDetails && <p className="mt-2 text-slate-700 whitespace-pre-line">{q.promptDetails}</p>}` with:

```tsx
          {q.promptDetails && (
            <PromptDetails className="mt-2 p-3 rounded-xl text-base">{q.promptDetails}</PromptDetails>
          )}
```

`QuizRunner.tsx`: add the import and replace the block
`<div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 font-mono text-base font-semibold text-slate-800 whitespace-pre-wrap">{currentQ.promptDetails}</div>` with
`<PromptDetails className="p-4 rounded-2xl text-base">{currentQ.promptDetails}</PromptDetails>`.

`QuizResults.tsx` (near line 300): replace the inner `<div className="p-3.5 ... whitespace-pre-wrap">{q.promptDetails}</div>` with `<PromptDetails className="p-3.5 rounded-xl text-sm">{q.promptDetails}</PromptDetails>` and import it.

`WeakSpotsView.tsx` (near line 334): replace the inner `<div className="p-3 ... text-xs ... whitespace-pre-wrap">{q.promptDetails}</div>` with `<PromptDetails className="p-3 rounded-xl text-xs">{q.promptDetails}</PromptDetails>` and import it.

- [ ] **Step 5: Run the tests.** Run: `npx vitest run src/components` then `npm run typecheck` and `npm run lint`. Expected: PASS.

- [ ] **Step 6: Commit.**

```bash
git add src/components
git commit -m "fix: kid mode and test runner keep text-diagram spacing (content-g3 promptDetails)" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01X5HSDdHPWxvHxgBaoSTbLX"
```

---

### Task 2: Short-on-time no longer credits skipped rounds (Critical, F1)

**Files:**
- Modify: `src/engine/path.ts` (`TopicProgress`, `PathState`, the topics map, the returned totals)
- Modify: `src/engine/pace.ts` (status guard)
- Modify: `src/components/ParentHome.tsx` (Round 1 marker and label)
- Modify tests: `src/engine/pace.test.ts` (helper and one test), `src/engine/path.test.ts` (append), `src/components/ParentHome.test.tsx` (append)

**Interfaces:**
- Produces: `TopicProgress.round1Skipped: boolean`; `PathState.round1Skipped: boolean`. `roundsFinished` now counts rounds the child actually finished; `roundsTotal` counts only rounds the child needs (a skipped Round 1 is excluded from both). `TopicProgress.round` (where the path sends the child) is unchanged.
- Pinned wrong tests updated: `pace.test.ts` `path()` helper gains `round1Skipped: false`; `'is ahead when a lot is done early'` now uses two attempts (the 0-1 attempt rule is new behaviour).

- [ ] **Step 1: Write the failing tests.** Append to `src/engine/path.test.ts`:

```ts
describe('F1: short-on-time progress', () => {
  const soon = { ...base, testDate: '2026-10-10', checkupSkipped: true };

  it('F1: a skipped Round 1 is not credited as finished', () => {
    const fresh = buildPath({ ...soon, attempts: [] });
    expect(fresh.shortOnTime).toBe(true);
    expect(fresh.roundsFinished).toBe(0);
    expect(fresh.roundsTotal).toBe(domainIds.length); // only Round 2 is needed per topic
    expect(fresh.round1Skipped).toBe(true);
    expect(fresh.topics.every((t) => t.round1Skipped && t.roundsFinished === 0)).toBe(true);
    expect(fresh.currentRound).toBe(2); // navigation is unchanged
  });

  it('F1: finished rounds count once the child does the work, and the total stays fair', () => {
    const d = domainIds[0];
    const p = buildPath({ ...soon, attempts: [attempt(`${PRACTICE_QUIZ_PREFIX}1`, many(d, needFor(d), true))] });
    const t = p.topics.find((x) => x.domainId === d)!;
    expect(t.round1Skipped).toBe(false); // real answers finished Round 1 for real
    expect(t.roundsFinished).toBe(2);
    expect(p.roundsFinished).toBe(2);
    expect(p.roundsTotal).toBe(2 + (domainIds.length - 1));
    expect(p.round1Skipped).toBe(false);
  });

  it('F1: outside short-on-time the counts are unchanged', () => {
    const p = buildPath({ ...base, checkupSkipped: true, attempts: [] });
    expect(p.round1Skipped).toBe(false);
    expect(p.roundsFinished).toBe(0);
    expect(p.roundsTotal).toBe(domainIds.length * 3);
  });
});
```

Edit `src/engine/pace.test.ts`: add `round1Skipped: false,` to the object returned by `path()` (next to `shortOnTime: false`), add `import { getCurriculum } from '../curriculum/registry';` and `import { buildPath } from './path';` (extend the existing `import type { PathState } from './path'` line to `import { buildPath, type PathState } from './path';`), change the `'is ahead when a lot is done early'` test to pass two attempts, and append the new tests:

```ts
  it('is ahead when a lot is done early', () => {
    const p = computePace(input({
      attempts: [attemptAt('2026-09-29T00:00:00Z'), attemptAt('2026-09-29T06:00:00Z')],
      path: path({ roundsFinished: 10 }),
    }));
    expect(p.status).toBe('ahead');
  });

  it('F1: one or fewer attempts is never ahead, whatever the path says', () => {
    const p = computePace(input({ attempts: [attemptAt('2026-09-29T00:00:00Z')], path: path({ roundsFinished: 10 }) }));
    expect(p.status).toBe('on-track');
  });

  it('F1: short-on-time pace is never ahead with no work done', () => {
    const soon = buildPath({ curriculum: getCurriculum(5), attempts: [], checkupSkipped: true, testDate: '2026-10-05', now: NOW });
    for (const attempts of [[], [attemptAt('2026-09-30T11:00:00Z')]]) {
      const pace = computePace(input({ path: soon, attempts, testDate: '2026-10-05' }));
      expect(pace.dateState).toBe('short');
      expect(pace.status).not.toBe('ahead');
    }
  });
```

(The first test replaces the existing test of the same name.) Append to `src/components/ParentHome.test.tsx`:

```tsx
describe('ParentHome short-on-time path (F1)', () => {
  beforeEach(() => localStorage.clear());

  it('F1: shows Round 1 as skipped, not finished, and never "Ahead"', () => {
    const { container } = renderHome({ targetExamDate: ymd(7), checkupSkipped: true });
    expect(screen.getByText(/round 1: try every topic \(skipped\)/i)).toBeInTheDocument();
    expect(container.textContent).not.toMatch(/✔ Round 1/);
    expect(container.textContent).not.toMatch(/ahead/i);
  });
});
```

- [ ] **Step 2: Run and confirm failure.** Run: `npx vitest run src/engine/path.test.ts src/engine/pace.test.ts src/components/ParentHome.test.tsx`. Expected: FAIL (`round1Skipped` undefined; pace and marker assertions).

- [ ] **Step 3: Implement in `path.ts`.** Add `round1Skipped: boolean;` to `TopicProgress` (after `roundsFinished`) and `round1Skipped: boolean;` to `PathState` (after `shortOnTime`). Delete the line `const maxRounds = shortOnTime ? 2 : 3;` (it becomes unused). Replace the round logic and returned object inside the `.map(({ d, codes }) => { ... })` (the lines from `const r1 = ...` through the `return {...} satisfies TopicProgress;`) with:

```ts
      // Round 1 finished for real: the child answered enough, or the check-up already showed strength.
      const round1Done = strongFromCheckup || xs.length >= need;
      // Short on time, Round 1 is skipped: it is not shown as finished and not counted toward pace.
      const round1Skipped = shortOnTime && !round1Done;
      // Navigation only: short on time never sends a child back to Round 1.
      const r1 = shortOnTime || round1Done;
      // Short on time: Round 2 is only for the red and yellow topics.
      const r2 = r1 && (passes(xs) || (shortOnTime && status === 'acceleration-ready'));
      const r3 = r2 && passes(r3xs);
      const position = r3 ? 3 : r2 ? 2 : r1 ? 1 : 0; // where the path sends the child
      const roundsFinished = (round1Done ? 1 : 0) + (r2 ? 1 : 0) + (r3 ? 1 : 0); // what the child did
      return {
        domainId: d.id,
        name: topicName(d),
        status,
        answered: xs.length,
        round: r3 ? 'done' : ((position + 1) as Round),
        roundsFinished,
        round1Skipped,
        strongFromCheckup,
      } satisfies TopicProgress;
```

Just before the final `return {` of `buildPath`, add:

```ts
  // A topic short on time needs Round 2 only (plus Round 1 when it was not skipped).
  const roundsNeeded = (t: TopicProgress) => (shortOnTime ? (t.round1Skipped ? 1 : 2) : 3);
```

and replace the last three fields of the returned object:

```ts
    roundsFinished: topics.reduce((n, t) => n + Math.min(t.roundsFinished, roundsNeeded(t)), 0),
    roundsTotal: topics.reduce((n, t) => n + roundsNeeded(t), 0),
    shortOnTime,
    round1Skipped: shortOnTime && topics.length > 0 && topics.every((t) => t.round1Skipped),
```

(keep `practiceTestQuizId`, `practiceTestPassedAt`, `next` as they are).

- [ ] **Step 4: Implement in `pace.ts`.** Replace the block that computes `status` (the `let status ...; if (first) {...}` block) with:

```ts
  let status: PaceStatus = 'on-track';
  if (first) {
    const start = new Date(first).getTime();
    const end = now.getTime() + daysLeft * DAY_MS;
    const elapsed = end > start ? ((now.getTime() - start) / (end - start)) * 100 : 100;
    const diff = progress - Math.min(100, Math.max(0, elapsed));
    status = diff > ON_TRACK_BAND ? 'ahead' : diff < -ON_TRACK_BAND ? 'behind' : 'on-track';
  }
  // With no real history yet there is nothing to be ahead of (F1).
  if (attempts.length < 2 && status === 'ahead') status = 'on-track';
```

- [ ] **Step 5: Implement in `ParentHome.tsx`.** Replace the `rounds` array and `marker` with:

```tsx
  const rounds: { round: Round; label: string }[] = [
    { round: 1, label: `Round 1: Try every topic${path.round1Skipped ? ' (skipped)' : ''}` },
    { round: 2, label: `Round 2: Get every topic to ${passing}%` },
    { round: 3, label: `Round 3: Test-ready${path.shortOnTime ? ' (optional)' : ''}` },
  ];
  const marker = (r: Round) =>
    r === 1 && path.round1Skipped ? '–' : roundRank(path.currentRound) > r ? '✔' : path.currentRound === r ? '●' : '○';
```

- [ ] **Step 6: Run and verify.** Run: `npx vitest run src/engine src/components/ParentHome.test.tsx` then `npm run typecheck`. Expected: PASS.

- [ ] **Step 7: Commit.**

```bash
git add src/engine src/components/ParentHome.tsx src/components/ParentHome.test.tsx
git commit -m "fix: short-on-time no longer counts skipped rounds as finished or reports Ahead (F1)" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01X5HSDdHPWxvHxgBaoSTbLX"
```

---

### Task 3: Saved data is repaired, never rejected (logic-flows High x2)

**Files:**
- Create: `src/state/memoryStorage.ts`
- Modify: `src/state/types.ts`
- Rewrite: `src/state/storage.ts`
- Create: `src/state/normalise.test.ts`
- Modify tests: `src/state/migrate.test.ts` (two tests that pinned "dangling id means unrecognized")

**Interfaces:**
- Produces:
  - `createMemoryStorage(): Storage` (`src/state/memoryStorage.ts`).
  - `normaliseState(raw: unknown, newId?: () => string): { state: AppStateV2; repaired: boolean } | null` (null when `raw` is not a v2 blob or no usable profile remains). Pure.
  - `CORRUPT_KEY_PREFIX = 'ncmathssa_corrupt_'`; `backupRaw(storage, raw, now)`.
  - `loadState(storage, opts)` keeps its signature, now repairs, and backs up unparseable/repaired/unusable v2 blobs before anything else is written.
  - Optional type fields (consumed by Tasks 11 and 12): `Profile.activeSessionAt?: string`, `Profile.historyClearedAt?: string`, `AppStateV2.deletedProfileIds?: string[]`.
- Pinned wrong tests updated in `migrate.test.ts`: `'treats a v2 blob whose activeProfileId does not resolve as unrecognized'` and `'a v2 blob with a dangling activeProfileId also falls through to v1'` (both now expect repair).

- [ ] **Step 1: Write the failing tests.** Create `src/state/normalise.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { normaliseState, loadState, newProfile, STORAGE_KEY_V2, CORRUPT_KEY_PREFIX } from './storage';
import { createMemoryStorage } from './memoryStorage';
import type { QuizAttempt } from '../types';

const gen = () => { let n = 0; return () => `gen_${++n}`; };
const attempt = (id: string, completedAt = '2026-09-01T00:00:00.000Z'): QuizAttempt => ({
  id, quizId: 'q', quizTitle: 'q', completedAt, scoreRaw: 1, scoreTotal: 1, scorePercent: 100,
  isPassingSSA: true, timeElapsedSeconds: 1,
  answers: { a: { questionId: 'a', studentAnswer: 'A', isCorrect: true, standardCode: 'NC.5.NF.1' } },
});
const blob = (over: Record<string, unknown> = {}) => ({
  version: 2,
  activeProfileId: 'a',
  profiles: [
    newProfile({ id: 'a', studentName: 'Alex', attempts: [attempt('x1')] }),
    newProfile({ id: 'b', studentName: 'Bea' }),
  ],
  ...over,
});
const corruptKeys = (s: Storage) =>
  Array.from({ length: s.length }, (_, i) => s.key(i) as string).filter((k) => k.startsWith(CORRUPT_KEY_PREFIX));

describe('normaliseState', () => {
  it('returns a clean blob unchanged and not marked repaired', () => {
    const raw = blob();
    const out = normaliseState(raw, gen())!;
    expect(out.repaired).toBe(false);
    expect(out.state).toEqual(raw);
  });

  it('logic-flows High: a dangling activeProfileId falls back to the first profile and keeps every attempt', () => {
    const out = normaliseState(blob({ activeProfileId: 'gone' }), gen())!;
    expect(out.repaired).toBe(true);
    expect(out.state.activeProfileId).toBe('a');
    expect(out.state.profiles[0].attempts).toHaveLength(1);
  });

  it('logic-flows High: a profile without id or studentName gets defaults and the others survive', () => {
    const raw = blob({ profiles: [{ grade: 5, attempts: [attempt('x1')] }, newProfile({ id: 'b', studentName: 'Bea', attempts: [attempt('x2')] })] });
    const out = normaliseState(raw, gen())!;
    expect(out.state.profiles).toHaveLength(2);
    expect(out.state.profiles[0].id).toBe('gen_1');
    expect(out.state.profiles[0].studentName).toBe('');
    expect(out.state.profiles[0].attempts).toHaveLength(1);
    expect(out.state.profiles[1].attempts).toHaveLength(1);
  });

  it('logic-flows High: drops null attempts and attempts without an answers object, keeps good ones', () => {
    const p = newProfile({ id: 'a', studentName: 'Alex' }) as unknown as Record<string, unknown>;
    p.attempts = [null, 7, { id: 'no-answers', completedAt: '2026-09-01T00:00:00.000Z' }, attempt('good')];
    const out = normaliseState({ version: 2, activeProfileId: 'a', profiles: [p] }, gen())!;
    expect(out.state.profiles[0].attempts.map((a) => a.id)).toEqual(['good']);
  });

  it('logic-flows High: drops a null answer inside an attempt but keeps the attempt', () => {
    const bad = attempt('mixed') as unknown as { answers: Record<string, unknown> };
    bad.answers.broken = null;
    const p = newProfile({ id: 'a', studentName: 'Alex', attempts: [bad as unknown as QuizAttempt] });
    const out = normaliseState({ version: 2, activeProfileId: 'a', profiles: [p] }, gen())!;
    expect(Object.keys(out.state.profiles[0].attempts[0].answers)).toEqual(['a']);
  });

  it('logic-flows High: drops an activeSession without refs and keeps one that has them', () => {
    const good = {
      kind: 'practice', quizId: 'path-practice-1', title: 't', refs: [{ kind: 'authored', id: 'nf1-01' }],
      answers: {}, flagged: {}, currentIndex: 0, startedAt: '2026-09-30T00:00:00.000Z', secondsElapsed: 0,
    };
    const { refs: _refs, ...noRefs } = good;
    const raw = blob({ profiles: [
      { ...newProfile({ id: 'a', studentName: 'Alex' }), activeSession: noRefs },
      { ...newProfile({ id: 'b', studentName: 'Bea' }), activeSession: good },
    ] });
    const out = normaliseState(raw, gen())!;
    expect(out.state.profiles[0].activeSession).toBeUndefined();
    expect(out.state.profiles[1].activeSession).toEqual(good);
  });

  it('logic-flows High: moves an unsupported grade to the nearest supported one', () => {
    const grades = [6, 0, undefined, 3].map((g, i) => ({ ...newProfile({ id: `p${i}`, studentName: 'x' }), grade: g }));
    const out = normaliseState({ version: 2, activeProfileId: 'p0', profiles: grades }, gen())!;
    expect(out.state.profiles.map((p) => p.grade)).toEqual([5, 1, 5, 3]);
  });

  it('fills a missing reviewQueue', () => {
    const p = { ...newProfile({ id: 'a', studentName: 'Alex' }) } as Record<string, unknown>;
    delete p.reviewQueue;
    const out = normaliseState({ version: 2, activeProfileId: 'a', profiles: [p] }, gen())!;
    expect(out.state.profiles[0].reviewQueue).toEqual({});
  });

  it('gives two profiles that share an id distinct ids', () => {
    const out = normaliseState(blob({ profiles: [newProfile({ id: 'dup', studentName: 'A' }), newProfile({ id: 'dup', studentName: 'B' })], activeProfileId: 'dup' }), gen())!;
    expect(new Set(out.state.profiles.map((p) => p.id)).size).toBe(2);
  });

  it('returns null when the blob is not v2 or has no usable profile', () => {
    expect(normaliseState(null)).toBeNull();
    expect(normaliseState({ version: 1 })).toBeNull();
    expect(normaliseState({ version: 2, profiles: [], activeProfileId: 'x' })).toBeNull();
    expect(normaliseState({ version: 2, profiles: [null, 3], activeProfileId: 'x' })).toBeNull();
  });
});

describe('loadState repair and backup', () => {
  it('logic-flows High: repairs a dangling active id without touching the v2 key, and keeps a backup', () => {
    const s = createMemoryStorage();
    const raw = JSON.stringify(blob({ activeProfileId: 'gone' }));
    s.setItem(STORAGE_KEY_V2, raw);
    const out = loadState(s);
    expect(out.profiles.find((p) => p.id === 'a')!.attempts).toHaveLength(1);
    expect(s.getItem(STORAGE_KEY_V2)).toBe(raw); // no write until the user changes something
    const keys = corruptKeys(s);
    expect(keys).toHaveLength(1);
    expect(s.getItem(keys[0])).toBe(raw);
  });

  it('logic-flows High: copies an unparseable blob to ncmathssa_corrupt_<time> and starts fresh', () => {
    const s = createMemoryStorage();
    s.setItem(STORAGE_KEY_V2, '{not json');
    const out = loadState(s);
    expect(out.profiles).toHaveLength(1);
    const keys = corruptKeys(s);
    expect(keys).toHaveLength(1);
    expect(keys[0]).toMatch(/^ncmathssa_corrupt_\d{4}-\d{2}-\d{2}T/);
    expect(s.getItem(keys[0])).toBe('{not json');
  });

  it('does not pile up identical backups on repeated loads', () => {
    const s = createMemoryStorage();
    s.setItem(STORAGE_KEY_V2, '{not json');
    loadState(s);
    loadState(s);
    expect(corruptKeys(s)).toHaveLength(1);
  });

  it('does not back up a healthy blob', () => {
    const s = createMemoryStorage();
    s.setItem(STORAGE_KEY_V2, JSON.stringify(blob()));
    loadState(s);
    expect(corruptKeys(s)).toHaveLength(0);
  });
});
```

Edit `src/state/migrate.test.ts`: replace the test `'treats a v2 blob whose activeProfileId does not resolve as unrecognized'` with:

```ts
  it('repairs a v2 blob whose activeProfileId does not resolve, instead of discarding it', () => {
    const out = migrate({
      version: 2,
      profiles: [{ id: 'p_1', studentName: 'X', grade: 5, targetExamDate: '', dailyQuestionGoal: 20, attempts: [], reviewQueue: {} }],
      activeProfileId: 'does-not-exist',
    });
    expect(out.profiles[0].studentName).toBe('X');
    expect(out.activeProfileId).toBe('p_1');
  });
```

and replace `'a v2 blob with a dangling activeProfileId also falls through to v1'` with:

```ts
  it('a v2 blob with a dangling activeProfileId is repaired and still wins over v1', () => {
    const s = mem();
    s.setItem(STORAGE_KEY_V2, JSON.stringify({
      version: 2,
      profiles: [{ id: 'p_x', studentName: 'Ghost', grade: 5, targetExamDate: '', dailyQuestionGoal: 20, attempts: [], reviewQueue: {} }],
      activeProfileId: 'not-p_x',
    }));
    s.setItem(STORAGE_KEY_V1, JSON.stringify(v1Real));

    const out = loadState(s);
    expect(out.profiles[0].studentName).toBe('Ghost');
    expect(out.activeProfileId).toBe('p_x');
  });
```

- [ ] **Step 2: Run and confirm failure.** Run: `npx vitest run src/state`. Expected: FAIL (`memoryStorage` and `normaliseState` missing).

- [ ] **Step 3: Create `src/state/memoryStorage.ts`.**

```ts
/** An in-memory Storage: the fallback when localStorage is blocked, and the
 *  test double. Lives only as long as the page. */
export function createMemoryStorage(): Storage {
  const m = new Map<string, string>();
  return {
    get length() { return m.size; },
    clear: () => m.clear(),
    getItem: (k: string) => m.get(k) ?? null,
    key: (i: number) => [...m.keys()][i] ?? null,
    removeItem: (k: string) => void m.delete(k),
    setItem: (k: string, v: string) => void m.set(k, String(v)),
  };
}
```

- [ ] **Step 4: Extend `src/state/types.ts`.** Add to `Profile` (after `sessionSize?`):

```ts
  /** When activeSession was last written or cleared. The multi-tab merge keeps the later one. */
  activeSessionAt?: string;
  /** Attempts completed at or before this instant were cleared by the parent; the multi-tab merge never resurrects them. */
  historyClearedAt?: string;
```

and to `AppStateV2` (after `activeProfileId`):

```ts
  /** Students deleted in some tab; the multi-tab merge never resurrects them. */
  deletedProfileIds?: string[];
```

- [ ] **Step 5: Rewrite `src/state/storage.ts`.** Replace the whole file with:

```ts
import type { AppStateV2, Profile } from './types';
import type { Grade } from '../curriculum/types';
import type { ActiveSession } from '../engine/activeSession';
import type { ReviewQueue } from '../engine/scheduler';
import type { QuizAttempt } from '../types';
import { reviewKeyId } from '../engine/questionModel';
import { listCurricula } from '../curriculum/registry';

export const STORAGE_KEY_V1 = 'nc_math_ssa_prep_state_v1';
export const STORAGE_KEY_V2 = 'nc_math_ssa_prep_state_v2';
/** A copy of a blob we could not use as-is is kept here before anything overwrites it. */
export const CORRUPT_KEY_PREFIX = 'ncmathssa_corrupt_';

/** Injectable so migrate() stays a pure, testable function: callers that
 *  care about determinism (tests) pass fixed values; production code gets
 *  the real clock and a random id, unchanged from before. */
export interface MigrateOptions {
  now?: Date;
  newId?: () => string;
}

const defaultNewId = () => `p_${Math.random().toString(36).slice(2, 10)}`;

export function newProfile(overrides: Partial<Profile> = {}): Profile {
  return {
    id: defaultNewId(),
    studentName: '',
    grade: 5,
    targetExamDate: '',
    dailyQuestionGoal: 20,
    attempts: [],
    reviewQueue: {},
    ...overrides,
  };
}

export function initialState(newId: () => string = defaultNewId): AppStateV2 {
  const p = newProfile({ id: newId() });
  return { version: 2, profiles: [p], activeProfileId: p.id };
}

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v);
}
const isString = (v: unknown): v is string => typeof v === 'string';
const isFiniteNumber = (v: unknown): v is number => typeof v === 'number' && Number.isFinite(v);

const SESSION_KINDS: readonly string[] = ['checkup', 'practice', 'round3', 'practice-test', 'drill'];

function nearestSupportedGrade(g: unknown): Grade {
  const grades = listCurricula().map((c) => c.grade);
  if (!isFiniteNumber(g)) return 5;
  return grades.reduce((best, x) => (Math.abs(x - g) < Math.abs(best - g) ? x : best), grades[0]);
}

function normaliseAttempt(v: unknown): QuizAttempt | null {
  if (!isRecord(v) || !isString(v.id) || !isString(v.completedAt) || !isRecord(v.answers)) return null;
  const answers: QuizAttempt['answers'] = {};
  for (const [k, a] of Object.entries(v.answers)) {
    if (isRecord(a)) answers[k] = a as unknown as QuizAttempt['answers'][string];
  }
  return {
    ...(v as unknown as QuizAttempt),
    quizId: isString(v.quizId) ? v.quizId : '',
    quizTitle: isString(v.quizTitle) ? v.quizTitle : '',
    scoreRaw: isFiniteNumber(v.scoreRaw) ? v.scoreRaw : 0,
    scoreTotal: isFiniteNumber(v.scoreTotal) ? v.scoreTotal : 0,
    scorePercent: isFiniteNumber(v.scorePercent) ? v.scorePercent : 0,
    isPassingSSA: v.isPassingSSA === true,
    timeElapsedSeconds: isFiniteNumber(v.timeElapsedSeconds) ? v.timeElapsedSeconds : 0,
    answers,
  };
}

function isRefLike(r: unknown): boolean {
  return isRecord(r) && ((r.kind === 'authored' && isString(r.id)) || (r.kind === 'generated' && isString(r.templateId) && isFiniteNumber(r.seed)));
}

function normaliseSession(v: unknown): ActiveSession | undefined {
  if (!isRecord(v) || !Array.isArray(v.refs) || !isString(v.quizId) || !isString(v.kind) || !SESSION_KINDS.includes(v.kind)) {
    return undefined;
  }
  const answers: ActiveSession['answers'] = {};
  if (isRecord(v.answers)) {
    for (const [k, a] of Object.entries(v.answers)) {
      if (isRecord(a) && isString(a.selected)) answers[k] = { ...(a as unknown as ActiveSession['answers'][string]), isCorrect: a.isCorrect === true };
    }
  }
  const out: ActiveSession = {
    ...(v as unknown as ActiveSession),
    title: isString(v.title) ? v.title : '',
    refs: v.refs.filter(isRefLike) as ActiveSession['refs'],
    answers,
    flagged: isRecord(v.flagged) ? (v.flagged as ActiveSession['flagged']) : {},
    currentIndex: isFiniteNumber(v.currentIndex) ? v.currentIndex : 0,
    startedAt: isString(v.startedAt) ? v.startedAt : '',
    secondsElapsed: isFiniteNumber(v.secondsElapsed) ? v.secondsElapsed : 0,
  };
  if (!isRecord(v.origins)) delete out.origins;
  return out;
}

function normaliseReviewQueue(v: unknown): ReviewQueue {
  if (!isRecord(v)) return {};
  const out: ReviewQueue = {};
  for (const [k, e] of Object.entries(v)) {
    if (isRecord(e) && isRecord(e.key) && isString(e.dueAt) && isString(e.lastSeenAt) && isFiniteNumber(e.box)) {
      out[k] = e as unknown as ReviewQueue[string];
    }
  }
  return out;
}

function normaliseProfile(v: unknown, newId: () => string, seen: Set<string>): Profile | null {
  if (!isRecord(v)) return null;
  let id = isString(v.id) && v.id ? v.id : newId();
  while (seen.has(id)) id = newId();
  seen.add(id);
  const out: Profile = {
    ...(v as unknown as Profile),
    id,
    studentName: isString(v.studentName) ? v.studentName : '',
    grade: nearestSupportedGrade(v.grade),
    targetExamDate: isString(v.targetExamDate) ? v.targetExamDate : '',
    dailyQuestionGoal: isFiniteNumber(v.dailyQuestionGoal) ? v.dailyQuestionGoal : 20,
    attempts: (Array.isArray(v.attempts) ? v.attempts : []).map(normaliseAttempt).filter((a): a is QuizAttempt => a !== null),
    reviewQueue: normaliseReviewQueue(v.reviewQueue),
  };
  const session = normaliseSession(v.activeSession);
  if (session) out.activeSession = session;
  else delete out.activeSession;
  if (typeof out.checkupSkipped !== 'boolean') delete out.checkupSkipped;
  if (!isFiniteNumber(out.sessionSize)) delete out.sessionSize;
  if (!isString(out.activeSessionAt)) delete out.activeSessionAt;
  if (!isString(out.historyClearedAt)) delete out.historyClearedAt;
  return out;
}

export interface NormalisedState {
  state: AppStateV2;
  /** True when anything was defaulted, dropped or re-pointed. */
  repaired: boolean;
}

/**
 * Repairs a stored v2 blob instead of rejecting it: a dangling
 * activeProfileId becomes the first profile, profiles missing id/studentName
 * get defaults, malformed attempts, answers and sessions are dropped, an
 * unsupported grade moves to the nearest supported one, a missing
 * reviewQueue becomes {}. Returns null only when `raw` is not v2 or no
 * usable profile remains. Pure: ids come from `newId`.
 */
export function normaliseState(raw: unknown, newId: () => string = defaultNewId): NormalisedState | null {
  if (!isRecord(raw) || raw.version !== 2 || !Array.isArray(raw.profiles)) return null;
  const seen = new Set<string>();
  const profiles = raw.profiles
    .map((p) => normaliseProfile(p, newId, seen))
    .filter((p): p is Profile => p !== null);
  if (profiles.length === 0) return null;
  const wanted = raw.activeProfileId;
  const activeProfileId = isString(wanted) && profiles.some((p) => p.id === wanted) ? wanted : profiles[0].id;
  const state: AppStateV2 = { ...(raw as unknown as AppStateV2), version: 2, profiles, activeProfileId };
  if (Array.isArray(raw.deletedProfileIds)) state.deletedProfileIds = raw.deletedProfileIds.filter(isString);
  else delete state.deletedProfileIds;
  return { state, repaired: JSON.stringify(state) !== JSON.stringify(raw) };
}

/**
 * v1 -> v2. The old loader caught parse errors and silently discarded the
 * payload; under the new schema that would destroy a student's history, so
 * migration is explicit and every branch is tested.
 *
 * Pure: no direct clock or RNG reads. `now`/`newId` default to the real
 * clock and a random id generator, but tests can inject fixed values.
 */
export function migrate(raw: unknown, opts: MigrateOptions = {}): AppStateV2 {
  const newId = opts.newId ?? defaultNewId;

  const repaired = normaliseState(raw, newId);
  if (repaired) return repaired.state;
  if (!isRecord(raw)) return initialState(newId);

  const settings = isRecord(raw.settings) ? raw.settings : {};
  const attempts = Array.isArray(raw.attempts) ? raw.attempts : [];
  const missed = Array.isArray(raw.missedQuestionIds) ? raw.missedQuestionIds : [];
  if (attempts.length === 0 && missed.length === 0 && !settings.studentName) {
    return initialState(newId);
  }

  // Missed questions become box-1 review entries due immediately, so the
  // error bank the student built up survives the schema change. The key
  // format is owned by reviewKeyId, not duplicated here (Ruling F3).
  const nowIso = (opts.now ?? new Date()).toISOString();
  const reviewQueue: ReviewQueue = {};
  for (const id of missed) {
    if (typeof id !== 'string') continue;
    const key = { kind: 'authored' as const, id };
    reviewQueue[reviewKeyId(key)] = { key, box: 1, dueAt: nowIso, lastSeenAt: nowIso };
  }

  const profile = newProfile({
    id: newId(),
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

/** Keeps a copy of a blob we cannot use as-is. Skips it when an identical
 *  copy is already stored, so repeated loads do not pile up backups. */
export function backupRaw(storage: Storage, raw: string, now: Date): void {
  try {
    for (let i = 0; i < storage.length; i++) {
      const k = storage.key(i);
      if (k && k.startsWith(CORRUPT_KEY_PREFIX) && storage.getItem(k) === raw) return;
    }
    storage.setItem(`${CORRUPT_KEY_PREFIX}${now.toISOString()}`, raw);
  } catch {
    // Nothing more can be done; the original blob is still untouched.
  }
}

export function loadState(storage: Storage, opts: MigrateOptions = {}): AppStateV2 {
  const now = opts.now ?? new Date();
  const newId = opts.newId ?? defaultNewId;
  const readRaw = (key: string): string | null => {
    try {
      return storage.getItem(key);
    } catch {
      return null;
    }
  };
  const parse = (s: string | null): unknown => {
    if (!s) return null;
    try {
      return JSON.parse(s);
    } catch {
      return null;
    }
  };

  // A v2 blob is repaired, not rejected. If we repaired it, or could not use
  // it at all, the original text is copied aside before anything overwrites it.
  const rawV2 = readRaw(STORAGE_KEY_V2);
  if (rawV2) {
    const n = normaliseState(parse(rawV2), newId);
    if (n) {
      if (n.repaired) backupRaw(storage, rawV2, now);
      return n.state;
    }
    backupRaw(storage, rawV2, now);
  }

  const v1 = parse(readRaw(STORAGE_KEY_V1));
  if (v1) return migrate(v1, opts);   // v1 key is deliberately left in place

  return initialState(newId);
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

- [ ] **Step 6: Run and verify.** Run: `npx vitest run src/state` then `npm run test:run` (the whole suite must stay green: `migrate.test.ts` idempotency test proves a clean blob is untouched) and `npm run typecheck`. Expected: PASS.

- [ ] **Step 7: Commit.**

```bash
git add src/state
git commit -m "fix: repair saved data instead of rejecting it, and back up unusable blobs" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01X5HSDdHPWxvHxgBaoSTbLX"
```

---

### Task 4: Root ErrorBoundary with Export and Start over (logic-flows High)

**Files:**
- Create: `src/state/exportData.ts`
- Create: `src/components/ErrorBoundary.tsx`, `src/components/ErrorBoundary.test.tsx`
- Modify: `src/App.tsx` (the `App` function)

**Interfaces:**
- Produces: `downloadText(filename: string, text: string): void`, `exportFilename(now?: Date): string`, `rawStoredJson(storage: Storage): string` (`src/state/exportData.ts`). `ErrorBoundary` props: `{ children; storage?: Storage; download?: (filename: string, text: string) => void; onReload?: () => void }` (the optional props are test seams; defaults are the real browser).
- Consumes: `STORAGE_KEY_V1/V2`, `backupRaw` (Task 3), `createMemoryStorage` (Task 3, tests).

- [ ] **Step 1: Write the failing test.** Create `src/components/ErrorBoundary.test.tsx`:

```tsx
import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ErrorBoundary } from './ErrorBoundary';
import { createMemoryStorage } from '../state/memoryStorage';
import { STORAGE_KEY_V2, CORRUPT_KEY_PREFIX } from '../state/storage';

const Boom: React.FC = () => { throw new Error('boom'); };
const STORED = '{"version":2,"profiles":[],"activeProfileId":"x"}';

describe('ErrorBoundary', () => {
  beforeEach(() => { vi.spyOn(console, 'error').mockImplementation(() => {}); });
  afterEach(() => { vi.restoreAllMocks(); });

  const setup = () => {
    const storage = createMemoryStorage();
    storage.setItem(STORAGE_KEY_V2, STORED);
    const download = vi.fn();
    const onReload = vi.fn();
    render(<ErrorBoundary storage={storage} download={download} onReload={onReload}><Boom /></ErrorBoundary>);
    return { storage, download, onReload };
  };

  it('renders its children when nothing throws', () => {
    render(<ErrorBoundary><p>fine</p></ErrorBoundary>);
    expect(screen.getByText('fine')).toBeInTheDocument();
  });

  it('logic-flows High: shows a recovery screen instead of a white screen', () => {
    setup();
    expect(screen.getByRole('heading', { name: /something went wrong/i })).toBeInTheDocument();
  });

  it('exports the raw stored JSON', async () => {
    const { download } = setup();
    await userEvent.click(screen.getByRole('button', { name: /export my data/i }));
    expect(download).toHaveBeenCalledTimes(1);
    expect(download.mock.calls[0][0]).toMatch(/^ncmath-progress-\d{4}-\d{2}-\d{2}\.json$/);
    expect(download.mock.calls[0][1]).toBe(STORED);
  });

  it('Start over keeps a backup copy, clears the live keys and reloads, after a confirm', async () => {
    const confirm = vi.spyOn(window, 'confirm').mockReturnValue(true);
    const { storage, onReload } = setup();
    await userEvent.click(screen.getByRole('button', { name: /start over/i }));
    expect(confirm).toHaveBeenCalled();
    expect(storage.getItem(STORAGE_KEY_V2)).toBeNull();
    const backups = Array.from({ length: storage.length }, (_, i) => storage.key(i) as string).filter((k) => k.startsWith(CORRUPT_KEY_PREFIX));
    expect(backups).toHaveLength(1);
    expect(storage.getItem(backups[0])).toBe(STORED);
    expect(onReload).toHaveBeenCalledTimes(1);
  });

  it('Start over does nothing when the parent cancels', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(false);
    const { storage, onReload } = setup();
    await userEvent.click(screen.getByRole('button', { name: /start over/i }));
    expect(storage.getItem(STORAGE_KEY_V2)).toBe(STORED);
    expect(onReload).not.toHaveBeenCalled();
  });
});
```

- [ ] **Step 2: Run and confirm failure.** Run: `npx vitest run src/components/ErrorBoundary.test.tsx`. Expected: FAIL (module missing).

- [ ] **Step 3: Create `src/state/exportData.ts`.**

```ts
import { STORAGE_KEY_V1, STORAGE_KEY_V2 } from './storage';

export const exportFilename = (now: Date = new Date()) => `ncmath-progress-${now.toISOString().slice(0, 10)}.json`;

/** Saves `text` as a file through a temporary link. */
export function downloadText(filename: string, text: string): void {
  const url = URL.createObjectURL(new Blob([text], { type: 'application/json' }));
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 0);
}

/** The stored progress exactly as saved (v2, else v1), or '' when there is none. */
export function rawStoredJson(storage: Storage): string {
  try {
    return storage.getItem(STORAGE_KEY_V2) ?? storage.getItem(STORAGE_KEY_V1) ?? '';
  } catch {
    return '';
  }
}
```

- [ ] **Step 4: Create `src/components/ErrorBoundary.tsx`.**

```tsx
import React from 'react';
import { STORAGE_KEY_V1, STORAGE_KEY_V2, backupRaw } from '../state/storage';
import { getBrowserStorage } from '../state/storage';
import { downloadText, exportFilename, rawStoredJson } from '../state/exportData';

interface ErrorBoundaryProps {
  children: React.ReactNode;
  /** Test seams; the defaults are the real browser. */
  storage?: Storage;
  download?: (filename: string, text: string) => void;
  onReload?: () => void;
}

interface ErrorBoundaryState {
  error: Error | null;
}

/** Last line of defence: a render crash shows a way to save the data and
 *  start over instead of a white screen. Stored progress is never touched
 *  unless the parent picks "Start over", and even then a copy is kept. */
export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error) {
    console.error('Unhandled render error', error);
  }

  private storage(): Storage {
    return this.props.storage ?? getBrowserStorage().storage;
  }

  private exportData = () => {
    const text = rawStoredJson(this.storage()) || '{}';
    (this.props.download ?? downloadText)(exportFilename(), text);
  };

  private startOver = () => {
    if (!window.confirm('Start over? A backup copy of your saved data stays on this device, but the app will start empty.')) return;
    const storage = this.storage();
    const now = new Date();
    try {
      for (const key of [STORAGE_KEY_V2, STORAGE_KEY_V1]) {
        const raw = storage.getItem(key);
        if (raw) backupRaw(storage, raw, now);
        storage.removeItem(key);
      }
    } catch {
      // Storage is unusable; reloading is still the best we can do.
    }
    (this.props.onReload ?? (() => window.location.reload()))();
  };

  render() {
    if (!this.state.error) return this.props.children;
    return (
      <div role="alert" className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-xl border border-slate-200 p-6 text-center space-y-4">
          <h1 className="text-xl font-bold text-slate-900">Something went wrong</h1>
          <p className="text-sm text-slate-600">
            Your saved progress has not been deleted. If you are unsure, export a copy first.
          </p>
          <div className="flex flex-col gap-2">
            <button onClick={this.exportData} className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700">
              Export my data
            </button>
            <button onClick={this.startOver} className="rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-50">
              Start over
            </button>
          </div>
        </div>
      </div>
    );
  }
}

export default ErrorBoundary;
```

`getBrowserStorage` is added in Task 10; to keep this task compiling, add it now to `src/state/storage.ts` (after `backupRaw`) together with the import of `createMemoryStorage`:

```ts
import { createMemoryStorage } from './memoryStorage';

export interface BrowserStorage {
  storage: Storage;
  /** True when reading the localStorage global itself threw (site data blocked). */
  blocked: boolean;
}

/** localStorage, or an in-memory stand-in when even touching it throws. */
export function getBrowserStorage(access: () => Storage = () => window.localStorage): BrowserStorage {
  try {
    return { storage: access(), blocked: false };
  } catch {
    return { storage: createMemoryStorage(), blocked: true };
  }
}
```

and merge the two `../state/storage` imports in `ErrorBoundary.tsx` into one line: `import { STORAGE_KEY_V1, STORAGE_KEY_V2, backupRaw, getBrowserStorage } from '../state/storage';`.

- [ ] **Step 5: Wire it into `App.tsx`.** Add `import { ErrorBoundary } from './components/ErrorBoundary';` and replace `App`:

```tsx
export function App() {
  return (
    <ErrorBoundary>
      <DisclaimerGate>
        <ProgressProvider>
          <MainApp />
        </ProgressProvider>
      </DisclaimerGate>
    </ErrorBoundary>
  );
}
```

- [ ] **Step 6: Run and verify.** Run: `npx vitest run src/components/ErrorBoundary.test.tsx src/App.test.tsx` then `npm run typecheck` and `npm run lint`. Expected: PASS.

- [ ] **Step 7: Commit.**

```bash
git add src/state src/components/ErrorBoundary.tsx src/components/ErrorBoundary.test.tsx src/App.tsx
git commit -m "feat: root ErrorBoundary with export and start-over" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01X5HSDdHPWxvHxgBaoSTbLX"
```

---

### Task 5: Settings modal no longer carries the previous student's values (logic-flows High)

**Files:**
- Modify: `src/components/DetailedView.tsx`
- Modify: `src/components/StudyPaceModal.tsx` (label association)
- Create: `src/components/DetailedView.test.tsx`

**Interfaces:**
- Consumes: `useProgress().profile`, `switchProfile`.
- Produces: `StudyPaceModal` mounts only while open in `DetailedView` (keyed by `profile.id`); its three text inputs have `label`/`id` pairs.

- [ ] **Step 1: Write the failing test.** Create `src/components/DetailedView.test.tsx`:

```tsx
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ProgressProvider, useProgress } from '../context/ProgressContext';
import { DetailedView } from './DetailedView';
import { newProfile, saveState } from '../state/storage';

const Switcher = () => {
  const { switchProfile } = useProgress();
  return <button onClick={() => switchProfile('b')}>switch to Sam</button>;
};

describe('DetailedView settings modal', () => {
  beforeEach(() => localStorage.clear());

  it('logic-flows High: opens with the ACTIVE student, not the one shown when the view mounted', async () => {
    saveState(localStorage, {
      version: 2, activeProfileId: 'a',
      profiles: [newProfile({ id: 'a', studentName: 'Alex' }), newProfile({ id: 'b', studentName: 'Sam' })],
    });
    render(<ProgressProvider><DetailedView onStartQuiz={vi.fn()} onBack={vi.fn()} /><Switcher /></ProgressProvider>);
    act(() => screen.getByText('switch to Sam').click());
    await userEvent.click(screen.getByTitle(/study pace & test date settings/i));
    expect(screen.getByLabelText(/student name/i)).toHaveValue('Sam');
    expect(screen.queryByDisplayValue('Alex')).not.toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run and confirm failure.** Run: `npx vitest run src/components/DetailedView.test.tsx`. Expected: FAIL (no label association and the stale value shows "Alex").

- [ ] **Step 3: Fix `DetailedView.tsx`.** Change `const { curriculum } = useProgress();` to `const { curriculum, profile } = useProgress();` and replace
`<StudyPaceModal isOpen={isPaceModalOpen} onClose={() => setIsPaceModalOpen(false)} />` with:

```tsx
      {isPaceModalOpen && <StudyPaceModal key={profile.id} isOpen onClose={() => setIsPaceModalOpen(false)} />}
```

(`PrintReportModal` keeps its always-mounted form: it holds no form state.)

- [ ] **Step 4: Associate the labels in `StudyPaceModal.tsx`.** Change the three labels and inputs:
  - Student Name: `<label htmlFor="pace-name" ...>` and add `id="pace-name"` to its `<input>`.
  - Test date: `<label htmlFor="pace-date" ...>` and `id="pace-date"` on its `<input type="date">`.
  - Daily Questions: `<label htmlFor="pace-daily" ...>` and `id="pace-daily"` on its `<input type="number">`.

- [ ] **Step 5: Run and verify.** Run: `npx vitest run src/components/DetailedView.test.tsx src/components/StudyPaceModal.test.tsx` then `npm run typecheck`. Expected: PASS.

- [ ] **Step 6: Commit.**

```bash
git add src/components/DetailedView.tsx src/components/DetailedView.test.tsx src/components/StudyPaceModal.tsx
git commit -m "fix: settings modal mounts only while open so it never shows or saves the wrong student" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01X5HSDdHPWxvHxgBaoSTbLX"
```

---

### Task 6: One set of exact threshold functions (F3, F5)

**Files:**
- Modify: `src/engine/mastery.ts`, `src/engine/path.ts`, `src/engine/activeSession.ts`
- Modify tests: `src/engine/mastery.test.ts` (the `masteryStatus` block), append to it; append to `src/engine/activeSession.test.ts`

**Interfaces:**
- Produces (all in `src/engine/mastery.ts`): `MIN_SAMPLE_FOR_MASTERY` (now exported), `APPROACHING_PERCENT = 60`, `isPassing(correct, total, passing): boolean`, `masteryStatus(correct, total, passing): MasteryStatus` (**signature changed from percent to counts**; same semantics), `type ReadinessStatus = 'ready' | 'building'`, `readinessStatus(readiness, passing): ReadinessStatus`, `displayPercent(value): number` (floor), `formatPercent(value): string` (`'79%'`), `pointsToGoal(readiness, passing): number`. `overallReadiness` now returns the unrounded value.
- Pinned wrong tests updated: the five `masteryStatus` cases in `mastery.test.ts` now pass counts.

- [ ] **Step 1: Write the failing tests.** In `src/engine/mastery.test.ts` replace the `describe('masteryStatus', ...)` block with:

```ts
describe('masteryStatus', () => {
  it('is untested with no attempts', () => {
    expect(masteryStatus(0, 0, 80)).toBe('untested');
  });

  it('is acceleration-ready at or above the passing mark', () => {
    expect(masteryStatus(8, 10, 80)).toBe('acceleration-ready');
    expect(masteryStatus(19, 20, 80)).toBe('acceleration-ready');
  });

  it('is approaching between 60 and the passing mark', () => {
    expect(masteryStatus(7, 10, 80)).toBe('approaching');
  });

  it('is needs-focus below 60', () => {
    expect(masteryStatus(9, 20, 80)).toBe('needs-focus');
  });

  it('does not award acceleration-ready on a single lucky answer', () => {
    // 1 for 1 is 100% but says nothing; require a minimum sample.
    expect(masteryStatus(1, 1, 80)).toBe('approaching');
  });

  it('F5: 63 of 79 (79.75%) is approaching, not ready', () => {
    expect(masteryStatus(63, 79, 80)).toBe('approaching');
  });

  it('F5: 119 of 200 (59.5%) is needs-focus, not approaching', () => {
    expect(masteryStatus(119, 200, 80)).toBe('needs-focus');
  });
});

describe('isPassing', () => {
  it('compares exactly, with no rounding', () => {
    expect(isPassing(4, 5, 80)).toBe(true);
    expect(isPassing(79, 100, 80)).toBe(false);
    expect(isPassing(63, 79, 80)).toBe(false);
    expect(isPassing(0, 0, 80)).toBe(false);
  });
  it('reads the bar it is given, not a literal 80', () => {
    expect(isPassing(3, 5, 60)).toBe(true);
    expect(isPassing(3, 5, 61)).toBe(false);
  });
});

describe('readiness thresholds and display (F3)', () => {
  it('F3: 79.6 is building and displays as 79%', () => {
    expect(readinessStatus(79.6, 80)).toBe('building');
    expect(formatPercent(79.6)).toBe('79%');
    expect(displayPercent(79.95)).toBe(79);
    expect(pointsToGoal(79.6, 80)).toBe(1);
  });
  it('F3: floating-point noise around 80 is ready and displays as 80%', () => {
    expect(readinessStatus(79.99999999999999, 80)).toBe('ready');
    expect(formatPercent(79.99999999999999)).toBe('80%');
    expect(readinessStatus(80, 80)).toBe('ready');
    expect(pointsToGoal(80, 80)).toBe(0);
  });
  it('F3: a uniform 79.6% accuracy is not ready anywhere', () => {
    const mastery = new Map(standardsOf(c).map((s) => [s.code, {
      standardCode: s.code, total: 500, correct: 398, percent: 79.6, status: 'approaching' as const, misconceptions: {},
    }]));
    const r = overallReadiness(mastery, c);
    expect(r).toBeCloseTo(79.6, 5);
    expect(readinessStatus(r, c.ssa.passingPercent)).toBe('building');
    expect(formatPercent(r)).toBe('79%');
  });
});

describe('domainStatsFor (F5)', () => {
  const domain = c.domains[0];
  const only = (correct: number, total: number) =>
    new Map([[domain.standards[0].code, {
      standardCode: domain.standards[0].code, total, correct, percent: (correct / total) * 100,
      status: 'approaching' as const, misconceptions: {},
    }]]);
  it('F5: 63 of 79 in a domain is approaching although it displays 80', () => {
    const s = domainStatsFor(domain, only(63, 79), 80);
    expect(s.masteryPercent).toBe(80);
    expect(s.status).toBe('approaching');
  });
  it('F5: 119 of 200 is needs-focus although it displays 60', () => {
    const s = domainStatsFor(domain, only(119, 200), 80);
    expect(s.masteryPercent).toBe(60);
    expect(s.status).toBe('needs-focus');
  });
});
```

and change the top imports of that file to:

```ts
import {
  masteryStatus,
  overallReadiness,
  masteryByStandard,
  topMisconceptions,
  topMisconceptionFamilies,
  isPassing,
  readinessStatus,
  formatPercent,
  displayPercent,
  pointsToGoal,
  domainStatsFor,
} from './mastery';
import { getCurriculum, standardsOf } from '../curriculum/registry';
```

(keep the rest of the imports.) Append to `src/engine/activeSession.test.ts` (add `newSession` etc. only if not already imported; the file already imports `newSession`, `recordAnswer`, `resolveSession`, `sessionToAttempt`, `correctOption`, and defines `c`, `diagnostic`, `NOW`):

```ts
describe('isPassingSSA is exact (F3)', () => {
  it('F3: 2 of 3 does not pass a 66.7 bar even though the 1-decimal score rounds to 66.7', () => {
    const refs = diagnostic.questionIds.slice(0, 3).map((id) => ({ kind: 'authored' as const, id }));
    let s = newSession({ kind: 'practice', quizId: 'x', title: 'x', refs, now: NOW });
    const [q1, q2, q3] = resolveSession(s, c);
    s = recordAnswer(s, q1, correctOption(q1).label);
    s = recordAnswer(s, q2, correctOption(q2).label);
    s = recordAnswer(s, q3, q3.options.find((o) => !o.isCorrect)!.label);
    const a = sessionToAttempt(s, [q1, q2, q3], 66.7, NOW, { answeredOnly: false });
    expect(a.scorePercent).toBe(66.7);
    expect(a.isPassingSSA).toBe(false);
  });
});
```

- [ ] **Step 2: Run and confirm failure.** Run: `npx vitest run src/engine/mastery.test.ts src/engine/activeSession.test.ts`. Expected: FAIL (new exports missing; count-based `masteryStatus`).

- [ ] **Step 3: Implement in `mastery.ts`.** Replace the constant and `masteryStatus` (top of file) with:

```ts
/** Below this many attempts, a perfect score is noise rather than mastery. */
export const MIN_SAMPLE_FOR_MASTERY = 4;
/** Accuracy at which a topic stops being "needs focus". */
export const APPROACHING_PERCENT = 60;
/** Weights sum to 100 only up to floating-point noise (Grade 4 sums to 99.99999999999999). */
const READINESS_EPSILON = 1e-9;

/** True when correct/total meets the bar exactly. Integer arithmetic, so no
 *  rounding or floating-point error can move a boundary. */
export function isPassing(correct: number, total: number, passing: number): boolean {
  return total > 0 && correct * 100 >= passing * total;
}

export function masteryStatus(correct: number, total: number, passing: number): MasteryStatus {
  if (total === 0) return 'untested';
  if (total >= MIN_SAMPLE_FOR_MASTERY && isPassing(correct, total, passing)) return 'acceleration-ready';
  if (correct * 100 >= APPROACHING_PERCENT * total) return 'approaching';
  return 'needs-focus';
}

export type ReadinessStatus = 'ready' | 'building';

/** The one place that decides whether an overall readiness value meets the goal. */
export function readinessStatus(readiness: number, passing: number): ReadinessStatus {
  return readiness + READINESS_EPSILON >= passing ? 'ready' : 'building';
}

/** Readiness as shown to people: floored, so a value below the goal never displays as the goal. */
export function displayPercent(value: number): number {
  return Math.floor(value + READINESS_EPSILON);
}

export function formatPercent(value: number): string {
  return `${displayPercent(value)}%`;
}

/** Whole points still needed to reach the goal (0 once reached). */
export function pointsToGoal(readiness: number, passing: number): number {
  return Math.max(0, Math.ceil(passing - readiness - READINESS_EPSILON));
}
```

In `masteryByStandard` change `m.status = masteryStatus(m.percent, m.total, c.ssa.passingPercent);` to `m.status = masteryStatus(m.correct, m.total, c.ssa.passingPercent);`. In `overallReadiness` change the last line `return Math.round(total * 10) / 10;` to `return total;` and update its doc comment to say "Unrounded: compare it with readinessStatus and show it with formatPercent." In `domainStatsFor` replace the returned `status:` line with `status: masteryStatus(totalCorrect, totalQuestionsAnswered, passingPercent),` (the rounded `masteryPercent` stays for display only).

- [ ] **Step 4: Implement in `path.ts`.** Import `isPassing` (`import { domainStatsFor, isPassing, masteryByStandard, type MasteryStatus } from './mastery';`). Replace the `percent` helper with:

```ts
/** True when the list is non-empty and meets the bar exactly (no rounding). */
function meetsBar(xs: boolean[], passing: number): boolean {
  return isPassing(xs.filter(Boolean).length, xs.length, passing);
}
```

Replace `const passes = (list: boolean[]) => list.length >= need && percent(list.slice(-need)) >= passing;` with `const passes = (list: boolean[]) => list.length >= need && meetsBar(list.slice(-need), passing);` and `if (percent(xs) >= passing) checkupStrong.add(d);` with `if (meetsBar(xs, passing)) checkupStrong.add(d);`.

- [ ] **Step 5: Implement in `activeSession.ts`.** Import `isPassing` from `./mastery` and replace `isPassingSSA: scorePercent >= passingPercent,` with `isPassingSSA: isPassing(raw, total, passingPercent),`.

- [ ] **Step 6: Run and verify.** Run: `npm run test:run` then `npm run typecheck`. Expected: PASS (the `ParentHome`, `SessionSummary` and `ProgressContext` tests still pass because display rounding is unchanged for their values).

- [ ] **Step 7: Commit.**

```bash
git add src/engine
git commit -m "fix: one exact threshold function set; no rounding before a pass/ready compare (F3, F5)" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01X5HSDdHPWxvHxgBaoSTbLX"
```

---

### Task 7: Readiness scaled by evidence (F2)

**Files:**
- Modify: `src/engine/mastery.ts` (`overallReadiness`)
- Modify tests: `src/engine/mastery.test.ts` (append), `src/components/SessionSummary.test.tsx` (one expected number)

**Interfaces:**
- Consumes: `MIN_SAMPLE_FOR_MASTERY`, `readinessStatus` (Task 6).
- Produces: `overallReadiness` weighs each standard by `percent x min(1, total / MIN_SAMPLE_FOR_MASTERY)`.
- Pinned wrong test updated: `SessionSummary.test.tsx` expects `readiness: 0% → 10%` for two right answers in one Fractions standard. New value: Fractions weight 41 (midpoint of the 39-43 band) x (100 x 2/4 evidence on 1 of 4 standards, mean 12.5) = 5.125, displayed `5%`. Expected text becomes `/readiness: 0% → 5%/i`. If a run shows a different number, recompute from `domainWeight(c, 'NF')`; do not loosen the assertion.

- [ ] **Step 1: Write the failing tests.** Append to `src/engine/mastery.test.ts`:

```ts
describe('F2: readiness scaled by evidence', () => {
  const attemptWith = (perStandard: number): QuizAttempt[] => [{
    id: 'a', quizId: 'q', quizTitle: 't', completedAt: '2026-01-01T00:00:00Z',
    scoreRaw: 0, scoreTotal: 0, scorePercent: 100, isPassingSSA: true, timeElapsedSeconds: 1,
    answers: Object.fromEntries(standardsOf(c).flatMap((s) =>
      Array.from({ length: perStandard }, (_, i) => [
        `${s.code}-${i}`,
        { questionId: `${s.code}-${i}`, standardCode: s.code, isCorrect: true, studentAnswer: 'A' },
      ]))),
  } as unknown as QuizAttempt];

  it('F2: a perfect one-answer-per-standard check-up is 25%, not 100%', () => {
    const r = overallReadiness(masteryByStandard(attemptWith(1), c), c);
    expect(r).toBeCloseTo(25, 5);
    expect(readinessStatus(r, c.ssa.passingPercent)).toBe('building');
  });

  it('F2: two answers per standard counts half', () => {
    expect(overallReadiness(masteryByStandard(attemptWith(2), c), c)).toBeCloseTo(50, 5);
  });

  it('F2: four answers per standard counts fully', () => {
    const r = overallReadiness(masteryByStandard(attemptWith(4), c), c);
    expect(r).toBeCloseTo(100, 5);
    expect(readinessStatus(r, c.ssa.passingPercent)).toBe('ready');
  });

  it('F2: untested standards stay 0', () => {
    expect(overallReadiness(masteryByStandard([], c), c)).toBe(0);
  });
});
```

In `src/components/SessionSummary.test.tsx` change `expect(screen.getByText(/readiness: 0% → 10%/i)).toBeInTheDocument();` to `expect(screen.getByText(/readiness: 0% → 5%/i)).toBeInTheDocument();`.

- [ ] **Step 2: Run and confirm failure.** Run: `npx vitest run src/engine/mastery.test.ts src/components/SessionSummary.test.tsx`. Expected: FAIL (25 vs 100; `10%` vs `5%` text).

- [ ] **Step 3: Implement.** Replace `overallReadiness` in `mastery.ts` with:

```ts
/** Weight a standard's accuracy by how much evidence backs it: below
 *  MIN_SAMPLE_FOR_MASTERY answers a perfect score counts proportionally
 *  less, so one lucky answer per standard cannot look like readiness (F2). */
function evidenceAdjustedPercent(m: StandardMastery | undefined): number {
  if (!m) return 0;
  return m.percent * Math.min(1, m.total / MIN_SAMPLE_FOR_MASTERY);
}

/** Blueprint-weighted composite, 0-100, unrounded. Untested standards count
 *  as 0: readiness means readiness for the whole assessment. Compare it with
 *  readinessStatus and show it with formatPercent. */
export function overallReadiness(
  mastery: Map<StandardCode, StandardMastery>,
  c: GradeCurriculum,
): number {
  let total = 0;
  for (const d of c.domains) {
    const weight = domainWeight(c, d.id);
    if (d.standards.length === 0) continue;
    const domainPercent =
      d.standards.reduce((sum, s) => sum + evidenceAdjustedPercent(mastery.get(s.code)), 0) /
      d.standards.length;
    total += (weight / 100) * domainPercent;
  }
  return total;
}
```

- [ ] **Step 4: Run and verify.** Run: `npm run test:run`. Expected: PASS.

- [ ] **Step 5: Commit.**

```bash
git add src/engine/mastery.ts src/engine/mastery.test.ts src/components/SessionSummary.test.tsx
git commit -m "fix: scale readiness by evidence so one answer per standard is not readiness (F2)" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01X5HSDdHPWxvHxgBaoSTbLX"
```

---

### Task 8: Every screen reads the shared formatter and ready flags (F3 UI, F4, F7)

**Files:**
- Create: `src/state/readiness.testkit.ts`
- Modify: `src/context/ProgressContext.tsx` (`ReadinessSummary`, `useReadinessSummary`)
- Modify: `src/components/ParentHome.tsx`, `Dashboard.tsx`, `Navbar.tsx`, `PrintReportModal.tsx`, `SessionSummary.tsx`
- Modify tests: `src/components/Dashboard.test.tsx` (append), `src/components/ParentHome.test.tsx` (append), `src/engine/path.test.ts` (append F7)

**Interfaces:**
- Consumes: `formatPercent`, `readinessStatus`, `pointsToGoal`, `isPassing`, `displayPercent` (Task 6).
- Produces: `ReadinessSummary.weightedScore` is now the floored display integer; new `ReadinessSummary.pointsToGoal: number`; `isAccelerationReady` comes from `readinessStatus`. Test ids used by the cross-screen fixture (Task 9): `readiness-tracker` (ParentHome section), `readiness-badge` (Dashboard badge), `readiness-pill` (Navbar pill), each with `data-readiness-state="ready" | "building"`. `buildReadinessAttempt(perStandard, correctPer, quizId?)` in `src/state/readiness.testkit.ts`.

- [ ] **Step 1: Create the test kit.** `src/state/readiness.testkit.ts`:

```ts
import { getCurriculum, standardsOf } from '../curriculum/registry';
import type { Grade } from '../curriculum/types';
import type { QuizAttempt, QuizAttemptAnswer } from '../types';

/** One attempt with `perStandard` answers on every standard of the grade,
 *  the first `correctPer` of them right. Uniform accuracy means the expected
 *  readiness is easy to state (e.g. 250 answers, 199 right = 79.6% everywhere). */
export function buildReadinessAttempt(
  perStandard: number,
  correctPer: number,
  quizId = 'fixture',
  grade: Grade = 5,
): QuizAttempt {
  const answers: Record<string, QuizAttemptAnswer> = {};
  for (const s of standardsOf(getCurriculum(grade))) {
    for (let i = 0; i < perStandard; i++) {
      const id = `${s.code}-${i}`;
      answers[id] = { questionId: id, studentAnswer: 'A', isCorrect: i < correctPer, standardCode: s.code };
    }
  }
  return {
    id: `fixture-${quizId}`, quizId, quizTitle: 'fixture', completedAt: '2026-09-30T12:00:00.000Z',
    scoreRaw: 0, scoreTotal: 0, scorePercent: 0, isPassingSSA: false, timeElapsedSeconds: 0, answers,
  };
}
```

- [ ] **Step 2: Write the failing tests.** Append to `src/components/Dashboard.test.tsx` (add `import { buildReadinessAttempt } from '../state/readiness.testkit';` and `import type { QuizAttempt } from '../types';` to the imports):

```tsx
describe('Dashboard readiness labels (F3, F4)', () => {
  beforeEach(() => localStorage.clear());

  it('F4: a domain with 3 of 3 right is not labelled Ready', () => {
    const code = getCurriculum(5).domains.find((d) => d.id === 'NF')!.standards[0].code;
    const attempt: QuizAttempt = {
      id: 'a1', quizId: 'x', quizTitle: 'x', completedAt: '2026-09-30T00:00:00.000Z',
      scoreRaw: 3, scoreTotal: 3, scorePercent: 100, isPassingSSA: true, timeElapsedSeconds: 1,
      answers: Object.fromEntries([0, 1, 2].map((i) => [`q${i}`, { questionId: `q${i}`, studentAnswer: 'A', isCorrect: true, standardCode: code }])),
    };
    saveState(localStorage, { version: 2, activeProfileId: 'p', profiles: [newProfile({ id: 'p', studentName: 'T', attempts: [attempt] })] });
    renderDashboard();
    expect(screen.getByText('Needs more answers')).toBeInTheDocument();
    expect(screen.queryByText('Ready')).not.toBeInTheDocument();
  });

  it('F3: at 79.6% the headline, badge and gap all say "not there yet"', () => {
    const diagnosticId = getCurriculum(5).quizzes.find((q) => q.isDiagnostic)!.id;
    saveState(localStorage, {
      version: 2, activeProfileId: 'p',
      profiles: [newProfile({ id: 'p', studentName: 'T', attempts: [buildReadinessAttempt(250, 199, diagnosticId)] })],
    });
    renderDashboard();
    expect(screen.getByTestId('readiness-badge')).toHaveAttribute('data-readiness-state', 'building');
    expect(screen.getByText(/Current Composite: 79%/)).toBeInTheDocument();
    expect(screen.getByText(/Need 1% more for SSA threshold/)).toBeInTheDocument();
    expect(screen.queryByText(/Acceleration Ready!/)).not.toBeInTheDocument();
    expect(screen.getByText(/Drill High-Weight Domains/)).toBeInTheDocument();
  });
});
```

Append to `src/components/ParentHome.test.tsx`:

```tsx
describe('ParentHome readiness and topic captions', () => {
  beforeEach(() => localStorage.clear());

  it('F3: 79.6% shows as 79% and not ready', () => {
    renderHome({ attempts: [buildReadinessAttempt(250, 199)] });
    expect(screen.getByTestId('readiness-tracker')).toHaveTextContent(/79% ready/);
    expect(screen.getByTestId('readiness-tracker')).toHaveAttribute('data-readiness-state', 'building');
  });

  it('F7: explains that topic labels use every answer while rounds use the recent ones', () => {
    renderHome();
    expect(screen.getByText(/topics are labelled from all answers so far/i)).toBeInTheDocument();
  });
});
```

(add `import { buildReadinessAttempt } from '../state/readiness.testkit';`). Append to `src/engine/path.test.ts`:

```ts
describe('F7: round exits use recent answers, labels use lifetime accuracy', () => {
  it('F7: 40 misses then a strong run finishes Round 2 while the topic label stays "needs-focus" (documented behaviour)', () => {
    const d = domainIds[0];
    const p = buildPath({ ...base, checkupSkipped: true,
      attempts: [attempt(`${PRACTICE_QUIZ_PREFIX}1`, [...many(d, 40, false), ...many(d, needFor(d), true)])] });
    const t = p.topics.find((x) => x.domainId === d)!;
    expect(t.round).toBe(3);
    expect(t.status).toBe('needs-focus');
  });
});
```

- [ ] **Step 3: Run and confirm failure.** Run: `npx vitest run src/components/Dashboard.test.tsx src/components/ParentHome.test.tsx src/engine/path.test.ts`. Expected: FAIL (test ids and caption missing; F4/F3 labels wrong). The F7 path test should already PASS: it pins existing behaviour.

- [ ] **Step 4: `ProgressContext.tsx`.** Import `displayPercent, readinessStatus, pointsToGoal` from `../engine/mastery` (extend the existing import). Add `pointsToGoal: number;` to `ReadinessSummary`, and in the returned object replace the two lines:

```ts
      weightedScore: displayPercent(readiness),
      isAccelerationReady: readinessStatus(readiness, curriculum.ssa.passingPercent) === 'ready',
      pointsToGoal: pointsToGoal(readiness, curriculum.ssa.passingPercent),
```

Rename the imported function usage to avoid shadowing the field: import it as `pointsToGoal as pointsToGoalFor` and write `pointsToGoal: pointsToGoalFor(readiness, curriculum.ssa.passingPercent),`.

- [ ] **Step 5: `ParentHome.tsx`.** Import `formatPercent, readinessStatus` from `../engine/mastery`. Change the tracker section opening tag to `<section data-testid="readiness-tracker" data-readiness-state={readinessStatus(readiness, passing)} className="bg-white rounded-xl border border-slate-200 p-5 space-y-3">` and the line `<strong>{Math.round(readiness)}% ready</strong> — goal: {passing}%` to `<strong>{formatPercent(readiness)} ready</strong> — goal: {passing}%`. Add under the Topics `<h2>` list (after the closing `</ul>`):

```tsx
          <p className="mt-2 text-xs text-slate-500">
            Topics are labelled from all answers so far. A round counts as finished when the most recent {ROUND_SAMPLE} answers are strong.
          </p>
```

(import `ROUND_SAMPLE` from `../engine/path` alongside the existing path import).

- [ ] **Step 6: `Dashboard.tsx`.** Import `isPassing` from `../engine/mastery`. Replace:
  - `Need {Math.max(0, passingPercent - readiness.weightedScore)}% more for SSA threshold` with `Need {readiness.pointsToGoal}% more for SSA threshold`.
  - `: readiness.weightedScore >= passingPercent` (hero condition) with `: readiness.isAccelerationReady`.
  - The badge `<span className={\`text-xs font-extrabold px-3 py-1 rounded-full border ${...}\`}>` opening tag gains `data-testid="readiness-badge" data-readiness-state={readiness.isAccelerationReady ? 'ready' : 'building'}`.
  - In the domain map: `const isReady = dm.masteryPercent >= passingPercent;` becomes
    ```tsx
            const isReady = dm.status === 'acceleration-ready';
            const meetsBarWithThinEvidence =
              !isReady && isPassing(dm.totalCorrect, dm.totalQuestionsAnswered, passingPercent);
    ```
    and the label `{isReady ? 'Ready' : \`Below ${passingPercent}%\`}` becomes `{isReady ? 'Ready' : meetsBarWithThinEvidence ? 'Needs more answers' : \`Below ${passingPercent}%\`}`.

- [ ] **Step 7: `Navbar.tsx`.** On the readiness pill's outer `<div onClick={onOpenReportModal} className="cursor-pointer hidden sm:flex ...">` add `data-testid="readiness-pill" data-readiness-state={readiness.isAccelerationReady ? 'ready' : 'building'}`.

- [ ] **Step 8: `PrintReportModal.tsx`.** Replace `${passingPercent - readiness.weightedScore}% below` with `${readiness.pointsToGoal}% below`.

- [ ] **Step 9: `SessionSummary.tsx`.** Import `formatPercent` from `../engine/mastery` and replace `Readiness: {Math.round(readinessBefore)}% → {Math.round(readiness)}%` with `Readiness: {formatPercent(readinessBefore)} → {formatPercent(readiness)}`.

- [ ] **Step 10: Run and verify.** Run: `npm run test:run`, `npm run typecheck`, `npm run lint`. Expected: PASS.

- [ ] **Step 11: Commit.**

```bash
git add src
git commit -m "fix: every screen uses the shared readiness formatter and ready flag (F3, F4, F7)" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01X5HSDdHPWxvHxgBaoSTbLX"
```

---

### Task 9: Cross-screen readiness fixture test (spec section 5)

**Files:**
- Create: `src/components/readinessConsistency.test.tsx`

**Interfaces:**
- Consumes: `buildReadinessAttempt` (Task 8), the three test ids and `data-readiness-state` attributes (Task 8).

- [ ] **Step 1: Write the test.** `src/components/readinessConsistency.test.tsx`:

```tsx
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ProgressProvider } from '../context/ProgressContext';
import { ParentHome } from './ParentHome';
import { Dashboard } from './Dashboard';
import { Navbar } from './Navbar';
import { newProfile, saveState } from '../state/storage';
import { buildReadinessAttempt } from '../state/readiness.testkit';

/** For one seeded profile, ParentHome, Dashboard and Navbar must show the
 *  same readiness number and the same ready / not-ready state. */
const cases = [
  { name: 'one perfect answer per standard', per: 1, correct: 1, shown: 25, state: 'building' },
  { name: '79.6% accuracy on every standard', per: 250, correct: 199, shown: 79, state: 'building' },
  { name: 'exactly 80% with enough answers per standard', per: 5, correct: 4, shown: 80, state: 'ready' },
] as const;

describe('cross-screen readiness', () => {
  beforeEach(() => localStorage.clear());

  it.each(cases)('$name: all three screens agree', ({ per, correct, shown, state }) => {
    saveState(localStorage, {
      version: 2, activeProfileId: 'p',
      profiles: [newProfile({ id: 'p', studentName: 'Alex', attempts: [buildReadinessAttempt(per, correct)], checkupSkipped: true })],
    });
    render(
      <ProgressProvider>
        <Navbar currentTab="dashboard" onSelectTab={vi.fn()} onOpenPaceModal={vi.fn()} onOpenReportModal={vi.fn()} />
        <ParentHome onStartStep={vi.fn()} onContinue={vi.fn()} onOpenDetailed={vi.fn()} onSwitchStudent={vi.fn()} onAddStudent={vi.fn()} />
        <Dashboard onStartQuiz={vi.fn()} onOpenStudyGuide={vi.fn()} onNavigateTab={vi.fn()} onOpenPaceModal={vi.fn()} onOpenReportModal={vi.fn()} />
      </ProgressProvider>,
    );

    const tracker = screen.getByTestId('readiness-tracker');
    expect(tracker).toHaveTextContent(new RegExp(`\\b${shown}% ready`));
    expect(screen.getByText(new RegExp(`Current Composite: ${shown}%`))).toBeInTheDocument();
    expect(screen.getByTestId('readiness-pill')).toHaveTextContent(new RegExp(`Readiness\\s*${shown}%`));

    for (const el of [tracker, screen.getByTestId('readiness-badge'), screen.getByTestId('readiness-pill')]) {
      expect(el).toHaveAttribute('data-readiness-state', state);
    }
  });
});
```

- [ ] **Step 2: Run it.** Run: `npx vitest run src/components/readinessConsistency.test.tsx`. Expected: PASS (Tasks 6-8 made the screens agree). If any case fails, the failing screen is reading a number or flag outside the shared functions: fix that screen, not the test.

- [ ] **Step 3: Prove it guards.** Temporarily change `Navbar.tsx` to render `{Math.round(readiness.weightedScore + 0.6)}%` for the pill, rerun, confirm the 79.6% case FAILS, then revert. (Confirms the fixture catches the F3 class of drift.)

- [ ] **Step 4: Commit.**

```bash
git add src/components/readinessConsistency.test.tsx
git commit -m "test: ParentHome, Dashboard and Navbar agree on readiness for seeded profiles" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01X5HSDdHPWxvHxgBaoSTbLX"
```

---

### Task 10: Saving can fail visibly, and never before the user acts (logic-flows Medium x2)

**Files:**
- Modify: `src/state/storage.ts` (`saveState`)
- Modify: `src/context/ProgressContext.tsx`
- Create: `src/components/SaveBanner.tsx`, `src/context/ProgressContext.storage.test.tsx`
- Modify: `src/App.tsx`
- Modify tests: `src/state/migrate.test.ts` (the quota test gains an `ok` assertion)

**Interfaces:**
- Consumes: `getBrowserStorage`, `createMemoryStorage`, `downloadText`, `exportFilename` (Tasks 3, 4).
- Produces: `saveState(storage, state): { ok: boolean }`. `ProgressProvider` prop `storageAccess?: () => Storage` (test seam; default `() => window.localStorage`). `ProgressContextValue.saveOk: boolean`. `SaveBanner` (no props). The provider marks itself dirty on any action and only then saves; every action goes through an internal `update(fn)`.

- [ ] **Step 1: Write the failing tests.** Create `src/context/ProgressContext.storage.test.tsx`:

```tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { ProgressProvider, useProgress } from './ProgressContext';
import { SaveBanner } from '../components/SaveBanner';
import { createMemoryStorage } from '../state/memoryStorage';
import { getBrowserStorage, saveState, newProfile, STORAGE_KEY_V2 } from '../state/storage';

function Probe() {
  const { state, updateActiveProfile } = useProgress();
  return (
    <div>
      <span data-testid="count">{state.profiles.length}</span>
      <button onClick={() => updateActiveProfile({ studentName: 'Changed' })}>change</button>
    </div>
  );
}
const renderWith = (access: () => Storage) =>
  render(<ProgressProvider storageAccess={access}><SaveBanner /><Probe /></ProgressProvider>);

describe('saving', () => {
  it('logic-flows High: does not write anything on mount, only after the first change', () => {
    const s = createMemoryStorage();
    saveState(s, { version: 2, activeProfileId: 'p', profiles: [newProfile({ id: 'p', studentName: 'Alex' })] });
    const setItem = vi.spyOn(s, 'setItem');
    renderWith(() => s);
    expect(setItem).not.toHaveBeenCalled();
    act(() => screen.getByText('change').click());
    expect(setItem).toHaveBeenCalledWith(STORAGE_KEY_V2, expect.any(String));
  });

  it('logic-flows Medium: a failing write shows the persistent banner and the app keeps running', () => {
    const s = createMemoryStorage();
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(s, 'setItem').mockImplementation(() => { throw new DOMException('QuotaExceededError'); });
    renderWith(() => s);
    expect(screen.queryByText(/isn't being saved/i)).not.toBeInTheDocument();
    act(() => screen.getByText('change').click());
    expect(screen.getByRole('alert')).toHaveTextContent("Progress isn't being saved on this device");
    expect(screen.getByRole('button', { name: /export/i })).toBeInTheDocument();
    expect(screen.getByTestId('count')).toHaveTextContent('1');
  });

  it('logic-flows Medium: blocked localStorage falls back to memory and shows the banner at once', () => {
    renderWith(() => { throw new DOMException('denied', 'SecurityError'); });
    expect(screen.getByRole('alert')).toHaveTextContent(/isn't being saved/i);
    act(() => screen.getByText('change').click());
    expect(screen.getByTestId('count')).toHaveTextContent('1');
  });
});

describe('getBrowserStorage', () => {
  it('returns the real storage when access works', () => {
    const s = createMemoryStorage();
    expect(getBrowserStorage(() => s)).toEqual({ storage: s, blocked: false });
  });
  it('logic-flows Medium: falls back to memory when the accessor throws', () => {
    const r = getBrowserStorage(() => { throw new Error('denied'); });
    expect(r.blocked).toBe(true);
    r.storage.setItem('k', 'v');
    expect(r.storage.getItem('k')).toBe('v');
  });
});
```

In `src/state/migrate.test.ts`, in the test `'does not throw when storage.setItem throws (e.g. quota exceeded)'` add after the `not.toThrow` line: `expect(saveState(throwingStorage, initialState())).toEqual({ ok: false });`.

- [ ] **Step 2: Run and confirm failure.** Run: `npx vitest run src/context/ProgressContext.storage.test.tsx src/state/migrate.test.ts`. Expected: FAIL (`SaveBanner` missing, `saveState` returns undefined).

- [ ] **Step 3: `saveState` returns `{ ok }`.** In `storage.ts` replace `saveState`:

```ts
export function saveState(storage: Storage, state: AppStateV2): { ok: boolean } {
  try {
    storage.setItem(STORAGE_KEY_V2, JSON.stringify(state));
    return { ok: true };
  } catch (e) {
    console.error('Failed to save state', e);
    return { ok: false };
  }
}
```

- [ ] **Step 4: Provider changes in `ProgressContext.tsx`.** Add `useRef` to the React import; import `getBrowserStorage` with `loadState, saveState, newProfile`. Add `saveOk: boolean;` to `ProgressContextValue` (doc: "False when the last write failed or localStorage is blocked"). Replace the head of `ProgressProvider` (from the component signature through the `useEffect` that saves) with:

```tsx
export const ProgressProvider: React.FC<{ children: React.ReactNode; storageAccess?: () => Storage }> = ({ children, storageAccess }) => {
  const [store] = useState(() => getBrowserStorage(storageAccess));
  const [state, setState] = useState<AppStateV2>(() => loadState(store.storage));
  const [saveOk, setSaveOk] = useState(!store.blocked);
  // Nothing is written until the user changes something: loading a repaired
  // or unfamiliar blob must never overwrite it.
  const dirty = useRef(false);
  const update = useCallback((fn: (prev: AppStateV2) => AppStateV2) => {
    dirty.current = true;
    setState(fn);
  }, []);

  useEffect(() => {
    if (!dirty.current) return;
    setSaveOk(saveState(store.storage, state).ok && !store.blocked);
  }, [state, store]);
```

In `switchProfile`, `addProfile`, `recordAttempt`, `completeSession`, `updateActiveProfile`, `clearActiveProfileHistory`, `deleteProfile`: replace each `setState(` with `update(` and each empty dependency array `[]` with `[update]`. Add `saveOk` to the context `value` object and to its `useMemo` dependency list.

- [ ] **Step 5: Create `src/components/SaveBanner.tsx`.**

```tsx
import React from 'react';
import { useProgress } from '../context/ProgressContext';
import { downloadText, exportFilename } from '../state/exportData';

/** Persistent warning when progress cannot be written to this device. Export
 *  hands over the CURRENT in-memory state, not the (stale) stored copy. */
export const SaveBanner: React.FC = () => {
  const { saveOk, state } = useProgress();
  if (saveOk) return null;
  return (
    <div role="alert" className="bg-rose-50 border-b border-rose-200 px-4 py-3 text-center text-sm text-rose-900">
      {"Progress isn't being saved on this device"}
      <button
        onClick={() => downloadText(exportFilename(), JSON.stringify(state, null, 2))}
        className="ml-3 rounded-md border border-rose-300 bg-white px-2 py-0.5 text-xs font-semibold text-rose-900 hover:bg-rose-100"
      >
        Export
      </button>
    </div>
  );
};

export default SaveBanner;
```

- [ ] **Step 6: Mount the banner.** In `App.tsx` import `SaveBanner` and render `<SaveBanner />` immediately before `<MainApp />` inside `ProgressProvider`.

- [ ] **Step 7: Run and verify.** Run: `npm run test:run`, `npm run typecheck`, `npm run lint`. Expected: PASS.

- [ ] **Step 8: Commit.**

```bash
git add src
git commit -m "feat: never save before the user acts, and show a banner when saving fails or storage is blocked" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01X5HSDdHPWxvHxgBaoSTbLX"
```

---

### Task 11: Pure multi-tab merge and unique attempt ids (logic-flows High, Low)

**Files:**
- Create: `src/state/merge.ts`, `src/state/merge.test.ts`
- Modify: `src/engine/activeSession.ts` (`sessionToAttempt` id), `src/engine/activeSession.test.ts` (append)

**Interfaces:**
- Produces: `mergeStates(stored: AppStateV2, mine: AppStateV2, opts?: { activeScalars: 'mine' | 'stored' }): AppStateV2` (pure). Rules: profiles by id (mine's order, then stored-only appended, minus `deletedProfileIds`); the active profile's scalar fields come from `opts.activeScalars` (default `'mine'`), every other profile's scalars from `stored`; attempts unioned by id (newest first, only re-sorted when the other side added attempts) minus anything at or before `historyClearedAt`; `activeSession` (+ `activeSessionAt`) from whichever side has the later `activeSessionAt` (tie goes to the scalar winner); `reviewQueue` follows the scalar winner (not merged key by key, because a queue entry deleted on mastery cannot be told apart from one added elsewhere without a base copy; attempts, the source of truth, are unioned); `activeProfileId` is mine's, or the first profile if it is gone; if every profile would be deleted, `mine` is returned.
- `sessionToAttempt` opts gain `idSuffix?: string`; the attempt id is `attempt-<ms>-<suffix>` with a random suffix by default.

- [ ] **Step 1: Write the failing tests.** `src/state/merge.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { mergeStates } from './merge';
import { newProfile } from './storage';
import type { AppStateV2, Profile } from './types';
import type { QuizAttempt } from '../types';

const att = (id: string, completedAt: string): QuizAttempt => ({
  id, quizId: 'q', quizTitle: 'q', completedAt, scoreRaw: 0, scoreTotal: 0, scorePercent: 0,
  isPassingSSA: false, timeElapsedSeconds: 0, answers: {},
});
const prof = (id: string, over: Partial<Profile> = {}) => newProfile({ id, studentName: id, ...over });
const st = (profiles: Profile[], active = profiles[0].id, extra: Partial<AppStateV2> = {}): AppStateV2 =>
  ({ version: 2, profiles, activeProfileId: active, ...extra });

describe('mergeStates', () => {
  it('multi-tab: attempts from both tabs survive', () => {
    const stored = st([prof('a', { attempts: [att('other', '2026-09-30T10:00:00.000Z')] })]);
    const mine = st([prof('a', { attempts: [att('mine', '2026-09-30T11:00:00.000Z')] })]);
    const out = mergeStates(stored, mine);
    expect(out.profiles[0].attempts.map((a) => a.id)).toEqual(['mine', 'other']);
  });

  it('multi-tab: an attempt present on both sides counts once', () => {
    const a = att('same', '2026-09-30T10:00:00.000Z');
    const out = mergeStates(st([prof('a', { attempts: [a] })]), st([prof('a', { attempts: [a] })]));
    expect(out.profiles[0].attempts).toHaveLength(1);
  });

  it('multi-tab: with nothing new in storage the merge is the identity (order preserved)', () => {
    const attempts = [att('old', '2026-09-01T00:00:00.000Z'), att('newer', '2026-09-02T00:00:00.000Z')];
    const mine = st([prof('a', { attempts })]);
    const stored = st([prof('a', { attempts: [attempts[0]] })]);
    expect(mergeStates(stored, mine)).toEqual(mine);
  });

  it('the active profile keeps this tab\'s scalars; other profiles take the stored ones', () => {
    const stored = st([prof('a', { studentName: 'A-stored' }), prof('b', { studentName: 'B-stored' })], 'a');
    const mine = st([prof('a', { studentName: 'A-mine' }), prof('b', { studentName: 'B-mine' })], 'a');
    const out = mergeStates(stored, mine);
    expect(out.profiles.map((p) => p.studentName)).toEqual(['A-mine', 'B-stored']);
  });

  it('a storage event prefers the stored scalars for the active profile too', () => {
    const stored = st([prof('a', { studentName: 'A-stored' })]);
    const mine = st([prof('a', { studentName: 'A-mine' })]);
    expect(mergeStates(stored, mine, { activeScalars: 'stored' }).profiles[0].studentName).toBe('A-stored');
  });

  it('keeps a student another tab added, in mine\'s order first', () => {
    const out = mergeStates(st([prof('a'), prof('new')]), st([prof('a')]));
    expect(out.profiles.map((p) => p.id)).toEqual(['a', 'new']);
  });

  it('does not resurrect a student deleted in either tab', () => {
    const stored = st([prof('a'), prof('gone')]);
    const mine = st([prof('a')], 'a', { deletedProfileIds: ['gone'] });
    const out = mergeStates(stored, mine);
    expect(out.profiles.map((p) => p.id)).toEqual(['a']);
    expect(out.deletedProfileIds).toEqual(['gone']);
    const other = st([prof('a')], 'a', { deletedProfileIds: ['gone'] });
    expect(mergeStates(other, st([prof('a'), prof('gone')])).profiles.map((p) => p.id)).toEqual(['a']);
  });

  it('never merges everyone away: falls back to mine', () => {
    const mine = st([prof('a')], 'a');
    const stored = st([prof('a')], 'a', { deletedProfileIds: ['a'] });
    expect(mergeStates(stored, mine)).toEqual(mine);
  });

  it('repoints activeProfileId when this tab\'s student was deleted elsewhere', () => {
    const stored = st([prof('a'), prof('b')], 'a', { deletedProfileIds: ['b'] });
    const mine = st([prof('a'), prof('b')], 'b');
    expect(mergeStates(stored, mine).activeProfileId).toBe('a');
  });

  it('the session from the tab that wrote it last wins, ties go to the scalar winner', () => {
    const sess = (title: string) => ({ kind: 'practice' as const, quizId: 'x', title, refs: [], answers: {}, flagged: {}, currentIndex: 0, startedAt: '', secondsElapsed: 0 });
    const stored = st([prof('a', { activeSession: sess('stored'), activeSessionAt: '2026-09-30T12:00:00.000Z' })]);
    const older = st([prof('a', { activeSession: sess('mine'), activeSessionAt: '2026-09-30T11:00:00.000Z' })]);
    expect(mergeStates(stored, older).profiles[0].activeSession?.title).toBe('stored');
    const newer = st([prof('a', { activeSession: sess('mine'), activeSessionAt: '2026-09-30T13:00:00.000Z' })]);
    expect(mergeStates(stored, newer).profiles[0].activeSession?.title).toBe('mine');
    const tie = st([prof('a', { activeSession: sess('mine'), activeSessionAt: '2026-09-30T12:00:00.000Z' })]);
    expect(mergeStates(stored, tie).profiles[0].activeSession?.title).toBe('mine');
    expect(mergeStates(stored, tie, { activeScalars: 'stored' }).profiles[0].activeSession?.title).toBe('stored');
  });

  it('a session finished here (cleared later) is not revived from an older stored copy', () => {
    const sess = { kind: 'practice' as const, quizId: 'x', title: 't', refs: [], answers: {}, flagged: {}, currentIndex: 0, startedAt: '', secondsElapsed: 0 };
    const stored = st([prof('a', { activeSession: sess, activeSessionAt: '2026-09-30T10:00:00.000Z' })]);
    const mine = st([prof('a', { activeSessionAt: '2026-09-30T11:00:00.000Z' })]);
    expect(mergeStates(stored, mine).profiles[0].activeSession).toBeUndefined();
  });

  it('cleared history is not resurrected, but newer attempts from the other tab are kept', () => {
    const stored = st([prof('a', { attempts: [att('after', '2026-09-30T12:00:00.000Z'), att('before', '2026-09-30T08:00:00.000Z')] })]);
    const mine = st([prof('a', { attempts: [], historyClearedAt: '2026-09-30T10:00:00.000Z' })]);
    const out = mergeStates(stored, mine);
    expect(out.profiles[0].attempts.map((a) => a.id)).toEqual(['after']);
    expect(out.profiles[0].historyClearedAt).toBe('2026-09-30T10:00:00.000Z');
  });
});
```

Append to `src/engine/activeSession.test.ts`:

```ts
describe('attempt ids', () => {
  it('logic-flows Low: two attempts finished in the same millisecond get different ids', () => {
    const s = newSession({ kind: 'practice', quizId: 'x', title: 'x', refs: [], now: NOW });
    const a = sessionToAttempt(s, [], 80, NOW, { answeredOnly: true });
    const b = sessionToAttempt(s, [], 80, NOW, { answeredOnly: true });
    expect(a.id).toMatch(/^attempt-\d+-[a-z0-9]+$/);
    expect(a.id).not.toBe(b.id);
  });
  it('accepts an injected suffix for deterministic tests', () => {
    const s = newSession({ kind: 'practice', quizId: 'x', title: 'x', refs: [], now: NOW });
    expect(sessionToAttempt(s, [], 80, NOW, { answeredOnly: true, idSuffix: 'abc' }).id).toBe(`attempt-${NOW.getTime()}-abc`);
  });
});
```

- [ ] **Step 2: Run and confirm failure.** Run: `npx vitest run src/state/merge.test.ts src/engine/activeSession.test.ts`. Expected: FAIL (`./merge` missing; id has no suffix).

- [ ] **Step 3: Create `src/state/merge.ts`.**

```ts
import type { AppStateV2, Profile } from './types';
import type { QuizAttempt } from '../types';

export interface MergeOptions {
  /** Who wins the ACTIVE profile's scalar fields. On save this tab wins
   *  ('mine'); after a storage event the other tab's newer write wins ('stored'). */
  activeScalars: 'mine' | 'stored';
}

type Winner = 'mine' | 'stored';

function maxIso(a?: string, b?: string): string | undefined {
  if (!a) return b;
  if (!b) return a;
  return a > b ? a : b;
}

function unionAttempts(mine: QuizAttempt[], stored: QuizAttempt[], clearedAt?: string): QuizAttempt[] {
  const mineIds = new Set(mine.map((a) => a.id));
  const extra = stored.filter((a) => !mineIds.has(a.id));
  const keep = (a: QuizAttempt) => !clearedAt || a.completedAt > clearedAt;
  // Nothing new from the other side: keep this tab's order exactly.
  if (extra.length === 0) return mine.filter(keep);
  return [...mine, ...extra].filter(keep).sort((x, y) => y.completedAt.localeCompare(x.completedAt));
}

function mergeProfile(stored: Profile, mine: Profile, winner: Winner): Profile {
  const base = winner === 'mine' ? mine : stored;
  const clearedAt = maxIso(stored.historyClearedAt, mine.historyClearedAt);
  const merged: Profile = {
    ...base,
    attempts: unionAttempts(mine.attempts, stored.attempts, clearedAt),
  };
  if (clearedAt) merged.historyClearedAt = clearedAt;

  const mineAt = mine.activeSessionAt ?? '';
  const storedAt = stored.activeSessionAt ?? '';
  const sessionFrom: Winner = mineAt > storedAt ? 'mine' : storedAt > mineAt ? 'stored' : winner;
  const source = sessionFrom === 'mine' ? mine : stored;
  if (source.activeSession) merged.activeSession = source.activeSession;
  else delete merged.activeSession;
  if (source.activeSessionAt) merged.activeSessionAt = source.activeSessionAt;
  else delete merged.activeSessionAt;
  return merged;
}

/**
 * Merges what is stored (possibly written by another tab) into this tab's
 * in-memory state. Pure. Attempts are the record of truth and are unioned;
 * deletions are tombstoned (`deletedProfileIds`, `historyClearedAt`) so a
 * stale tab cannot bring erased data back. The review queue follows the
 * scalar winner rather than being merged key by key: an entry removed on
 * mastery cannot be told apart from one added elsewhere without a base copy.
 */
export function mergeStates(
  stored: AppStateV2,
  mine: AppStateV2,
  opts: MergeOptions = { activeScalars: 'mine' },
): AppStateV2 {
  const deleted = [...new Set([...(stored.deletedProfileIds ?? []), ...(mine.deletedProfileIds ?? [])])];
  const gone = new Set(deleted);
  const storedById = new Map(stored.profiles.map((p) => [p.id, p]));
  const mineIds = new Set(mine.profiles.map((p) => p.id));

  const profiles: Profile[] = [];
  for (const p of mine.profiles) {
    if (gone.has(p.id)) continue;
    const s = storedById.get(p.id);
    profiles.push(s ? mergeProfile(s, p, p.id === mine.activeProfileId ? opts.activeScalars : 'stored') : p);
  }
  for (const s of stored.profiles) {
    if (!gone.has(s.id) && !mineIds.has(s.id)) profiles.push(s);
  }
  if (profiles.length === 0) return mine;

  const out: AppStateV2 = {
    ...mine,
    profiles,
    activeProfileId: profiles.some((p) => p.id === mine.activeProfileId) ? mine.activeProfileId : profiles[0].id,
  };
  if (deleted.length > 0) out.deletedProfileIds = deleted;
  else delete out.deletedProfileIds;
  return out;
}
```

- [ ] **Step 4: Unique attempt ids in `activeSession.ts`.** Change the `opts` parameter type of `sessionToAttempt` to `opts: { answeredOnly: boolean; idSuffix?: string }` and the id line to:

```ts
    id: `attempt-${now.getTime()}-${opts.idSuffix ?? Math.random().toString(36).slice(2, 8)}`,
```

- [ ] **Step 5: Run and verify.** Run: `npm run test:run` and `npm run typecheck`. Expected: PASS. (Existing tests never asserted the old id format: it is only used as identity.)

- [ ] **Step 6: Commit.**

```bash
git add src/state/merge.ts src/state/merge.test.ts src/engine/activeSession.ts src/engine/activeSession.test.ts
git commit -m "feat: pure multi-tab merge and collision-proof attempt ids" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01X5HSDdHPWxvHxgBaoSTbLX"
```

---

### Task 12: Two tabs stay in sync and never lose each other's data (logic-flows High)

**Files:**
- Modify: `src/state/storage.ts` (add `loadStoredState`)
- Modify: `src/context/ProgressContext.tsx`
- Create: `src/context/ProgressContext.multitab.test.tsx`

**Interfaces:**
- Consumes: `mergeStates` (Task 11), `normaliseState`, `STORAGE_KEY_V2`, the provider's `update`/`dirty`/`store` (Task 10).
- Produces: `loadStoredState(storage): AppStateV2 | null` (reads and normalises the v2 key only; never writes). Provider stamps `activeSessionAt` whenever `activeSession` is patched or cleared, `historyClearedAt` on "Clear history", and `deletedProfileIds` on delete; it merges with storage before every save and on `storage` events.

- [ ] **Step 1: Write the failing tests.** `src/context/ProgressContext.multitab.test.tsx`:

```tsx
import { describe, it, expect } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { ProgressProvider, useProgress } from './ProgressContext';
import { createMemoryStorage } from '../state/memoryStorage';
import { loadState, saveState, newProfile, STORAGE_KEY_V2 } from '../state/storage';
import type { AppStateV2 } from '../state/types';
import type { QuizAttempt } from '../types';

const att = (id: string, completedAt: string): QuizAttempt => ({
  id, quizId: 'q', quizTitle: 'q', completedAt, scoreRaw: 0, scoreTotal: 0, scorePercent: 0,
  isPassingSSA: false, timeElapsedSeconds: 0, answers: {},
});

function TabProbe() {
  const { profile, state, updateActiveProfile, clearActiveProfileHistory, deleteProfile } = useProgress();
  return (
    <div>
      <span data-testid="attempts">{profile.attempts.map((a) => a.id).join(',')}</span>
      <span data-testid="name">{profile.studentName}</span>
      <span data-testid="profiles">{state.profiles.map((p) => p.id).join(',')}</span>
      <span data-testid="session-at">{profile.activeSessionAt ?? ''}</span>
      <button onClick={() => updateActiveProfile({ studentName: 'Renamed' })}>rename</button>
      <button onClick={() => updateActiveProfile({ activeSession: undefined })}>drop-session</button>
      <button onClick={clearActiveProfileHistory}>clear</button>
      <button onClick={() => deleteProfile('p2')}>delete-p2</button>
    </div>
  );
}

const seed = (s: Storage, over: Partial<AppStateV2> = {}) => {
  const state: AppStateV2 = {
    version: 2, activeProfileId: 'p1',
    profiles: [newProfile({ id: 'p1', studentName: 'Alex' }), newProfile({ id: 'p2', studentName: 'Bea' })],
    ...over,
  };
  saveState(s, state);
  return state;
};
const mount = (s: Storage) => render(<ProgressProvider storageAccess={() => s}><TabProbe /></ProgressProvider>);
const click = (label: string) => act(() => screen.getByText(label).click());
const storageEvent = () => act(() => { window.dispatchEvent(new StorageEvent('storage', { key: STORAGE_KEY_V2 })); });

describe('multi-tab', () => {
  it('logic-flows High: another tab\'s attempt survives this tab\'s next save', () => {
    const s = createMemoryStorage();
    const base = seed(s);
    mount(s);
    // The other tab writes an attempt into the shared key.
    saveState(s, { ...base, profiles: [{ ...base.profiles[0], attempts: [att('other-tab', '2026-09-30T10:00:00.000Z')] }, base.profiles[1]] });
    click('rename');
    const saved = loadState(s);
    expect(saved.profiles[0].attempts.map((a) => a.id)).toEqual(['other-tab']);
    expect(saved.profiles[0].studentName).toBe('Renamed');
    expect(screen.getByTestId('attempts')).toHaveTextContent('other-tab');
  });

  it('a storage event brings the other tab\'s attempt and edits into view without a save', () => {
    const s = createMemoryStorage();
    const base = seed(s);
    mount(s);
    saveState(s, { ...base, profiles: [{ ...base.profiles[0], studentName: 'Alex2', attempts: [att('other-tab', '2026-09-30T10:00:00.000Z')] }, base.profiles[1]] });
    storageEvent();
    expect(screen.getByTestId('attempts')).toHaveTextContent('other-tab');
    expect(screen.getByTestId('name')).toHaveTextContent('Alex2');
  });

  it('logic-flows High: "Clear history" is not undone by a stale stored copy', () => {
    const s = createMemoryStorage();
    const base = seed(s);
    saveState(s, { ...base, profiles: [{ ...base.profiles[0], attempts: [att('old', '2020-01-01T00:00:00.000Z')] }, base.profiles[1]] });
    mount(s);
    expect(screen.getByTestId('attempts')).toHaveTextContent('old');
    click('clear');
    expect(screen.getByTestId('attempts')).toHaveTextContent('');
    expect(loadState(s).profiles[0].attempts).toEqual([]);
    expect(loadState(s).profiles[0].historyClearedAt).toBeTruthy();
  });

  it('logic-flows High: a deleted student is not brought back by a stale tab', () => {
    const s = createMemoryStorage();
    const base = seed(s);
    mount(s);
    click('delete-p2');
    expect(loadState(s).profiles.map((p) => p.id)).toEqual(['p1']);
    // A stale tab still holding both students writes its copy back.
    saveState(s, base);
    storageEvent();
    expect(screen.getByTestId('profiles')).toHaveTextContent('p1');
    expect(screen.getByTestId('profiles')).not.toHaveTextContent('p2');
  });

  it('stamps activeSessionAt when the saved session changes or is cleared', () => {
    const s = createMemoryStorage();
    seed(s);
    mount(s);
    expect(screen.getByTestId('session-at')).toHaveTextContent('');
    click('drop-session');
    expect(screen.getByTestId('session-at').textContent).toMatch(/^\d{4}-\d{2}-\d{2}T/);
  });
});
```

- [ ] **Step 2: Run and confirm failure.** Run: `npx vitest run src/context/ProgressContext.multitab.test.tsx`. Expected: FAIL (no merge on save, no event listener, no tombstones).

- [ ] **Step 3: Add `loadStoredState` to `storage.ts`.**

```ts
/** The stored v2 state, normalised, or null when absent or unusable. Read-only:
 *  used to merge another tab's writes; it never backs up or writes. */
export function loadStoredState(storage: Storage): AppStateV2 | null {
  try {
    const raw = storage.getItem(STORAGE_KEY_V2);
    return raw ? (normaliseState(JSON.parse(raw))?.state ?? null) : null;
  } catch {
    return null;
  }
}
```

- [ ] **Step 4: Provider changes in `ProgressContext.tsx`.** Import `loadStoredState, STORAGE_KEY_V2` from `../state/storage` and `mergeStates` from `../state/merge`.

Replace the save effect (from Task 10) with the merge-then-save effect and add the storage listener right after it:

```tsx
  useEffect(() => {
    if (!dirty.current) return;
    // Re-read what is stored (another tab may have written) and merge before writing.
    const stored = loadStoredState(store.storage);
    const merged = stored ? mergeStates(stored, state) : state;
    if (JSON.stringify(merged) !== JSON.stringify(state)) {
      setState(merged); // adopt the merge; this effect runs again and then saves
      return;
    }
    setSaveOk(saveState(store.storage, merged).ok && !store.blocked);
  }, [state, store]);

  // Another tab wrote: fold its changes in, preferring its newer scalar values.
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.storageArea && e.storageArea !== store.storage) return;
      if (e.key !== null && e.key !== STORAGE_KEY_V2) return;
      const stored = loadStoredState(store.storage);
      if (!stored) return;
      setState((prev) => {
        const next = mergeStates(stored, prev, { activeScalars: 'stored' });
        return JSON.stringify(next) === JSON.stringify(prev) ? prev : next;
      });
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, [store]);
```

In `withAttempt`, inside the `if (clearSession)` handling replace `if (clearSession) delete next.activeSession;` with:

```ts
      if (clearSession) {
        delete next.activeSession;
        next.activeSessionAt = now.toISOString();
      }
```

Replace `updateActiveProfile`:

```tsx
  const updateActiveProfile = useCallback(
    (patch: Partial<Omit<Profile, 'id' | 'attempts' | 'reviewQueue'>>) => {
      // A change to the saved session is stamped so the multi-tab merge keeps the latest writer's.
      const stamp = 'activeSession' in patch ? { activeSessionAt: new Date().toISOString() } : {};
      update((prev) => ({
        ...prev,
        profiles: prev.profiles.map((p) => (p.id === prev.activeProfileId ? { ...p, ...patch, ...stamp } : p)),
      }));
    },
    [update],
  );
```

Replace `clearActiveProfileHistory`:

```tsx
  const clearActiveProfileHistory = useCallback(() => {
    const at = new Date().toISOString();
    update((prev) => ({
      ...prev,
      profiles: prev.profiles.map((p) =>
        p.id === prev.activeProfileId
          ? { ...p, attempts: [], reviewQueue: {}, activeSession: undefined, checkupSkipped: undefined, historyClearedAt: at, activeSessionAt: at }
          : p,
      ),
    }));
  }, [update]);
```

Replace the last line of `deleteProfile`'s updater, `return { ...prev, profiles, activeProfileId };`, with:

```tsx
      return { ...prev, profiles, activeProfileId, deletedProfileIds: [...(prev.deletedProfileIds ?? []), id] };
```

- [ ] **Step 5: Run and verify.** Run: `npm run test:run`, `npm run typecheck`, `npm run lint`. Expected: PASS. (The existing `'clearActiveProfileHistory'` and `'persists across a remount'` tests must stay green: they prove the merge is the identity for a single tab.)

- [ ] **Step 6: Commit.**

```bash
git add src
git commit -m "fix: merge with storage on every save and on storage events so two tabs never lose data" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01X5HSDdHPWxvHxgBaoSTbLX"
```

---

### Task 13: Due-review answers cannot pull a finished topic back (F8, origin flag)

**Files:**
- Modify: `src/types/index.ts`, `src/engine/activeSession.ts`, `src/engine/sessionComposer.ts`, `src/engine/pathSession.ts`, `src/engine/path.ts`
- Create: `src/engine/origin.test.ts`

**Interfaces:**
- Produces: `type AnswerOrigin = 'new' | 'review'` and `QuizAttemptAnswer.origin?: AnswerOrigin` (`src/types/index.ts`); `ActiveSession.origins?: Record<string, AnswerOrigin>` keyed by `Question.id` (only `'review'` entries are stored; absent means `'new'`); `composeSession(input: SelectSessionInput): ComposedRef[]` with `ComposedRef = { ref: QuestionRef; origin: AnswerOrigin }`; `selectSession` is now `composeSession(...).map((c) => c.ref)` (same refs, same order); `newSession` args accept `origins?`. Attempts record `origin: 'review'` on review answers only; a missing `origin` is `'new'` everywhere, so every stored attempt and session from before this change loads and behaves as before.
- Round 2's last-N window and Round 3's last-N window exclude `origin === 'review'` answers; Round 1's volume count and all mastery/readiness math still count every answer.

- [ ] **Step 1: Write the failing tests.** `src/engine/origin.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { getCurriculum } from '../curriculum/registry';
import type { StandardCode } from '../curriculum/types';
import type { QuizAttempt, QuizAttemptAnswer, AnswerOrigin } from '../types';
import { masteryByStandard } from './mastery';
import { recordResult } from './scheduler';
import { composeSession, selectSession } from './sessionComposer';
import { sessionForStep } from './pathSession';
import { newSession, recordAnswer, resolveSession, sessionToAttempt } from './activeSession';
import { buildPath, sampleSizeFor, PRACTICE_QUIZ_PREFIX, ROUND3_QUIZ_PREFIX } from './path';
import { correctOption } from './questionModel';
import { normaliseState } from '../state/storage';
import { newProfile } from '../state/storage';

const c5 = getCurriculum(5);
const NOW = new Date(2026, 8, 30, 12);

describe('composeSession origin', () => {
  const queue = recordResult({}, { kind: 'authored', id: 'nf1-01' }, false, new Date(2026, 8, 1));
  const input = { curriculum: c5, mastery: masteryByStandard([], c5), queue, size: 10, now: NOW, seed: 1 };

  it('F8: due reviews are tagged review and everything else new', () => {
    const composed = composeSession(input);
    expect(composed).toHaveLength(10);
    expect(composed[0]).toEqual({ ref: { kind: 'authored', id: 'nf1-01' }, origin: 'review' });
    expect(composed.slice(1).every((x) => x.origin === 'new')).toBe(true);
  });

  it('selectSession still returns exactly the composed refs', () => {
    expect(selectSession(input)).toEqual(composeSession(input).map((x) => x.ref));
  });
});

describe('pathSession origins', () => {
  const all = c5.domains.map((d) => d.id);
  const build = (queue: Parameters<typeof sessionForStep>[0]['queue']) => sessionForStep({
    step: { kind: 'practice', round: 2 }, curriculum: c5, mastery: masteryByStandard([], c5),
    queue, activeDomains: all, size: 10, now: NOW, seed: 3,
  })!;

  it('F8: stores which refs are due reviews', () => {
    const s = build(recordResult({}, { kind: 'authored', id: 'nf1-01' }, false, new Date(2026, 8, 1)));
    expect(s.origins).toEqual({ 'nf1-01': 'review' });
  });

  it('stores no origins when nothing is a review', () => {
    expect(build({}).origins).toBeUndefined();
  });
});

describe('attempts record the origin', () => {
  it('F8: a review answer is marked, a new one is not', () => {
    const quiz = c5.quizzes.find((q) => q.isDiagnostic)!;
    const refs = quiz.questionIds.slice(0, 2).map((id) => ({ kind: 'authored' as const, id }));
    let s = newSession({ kind: 'practice', quizId: 'x', title: 'x', refs, now: NOW, origins: { [refs[0].id]: 'review' } });
    const [q1, q2] = resolveSession(s, c5);
    s = recordAnswer(recordAnswer(s, q1, correctOption(q1).label), q2, correctOption(q2).label);
    const a = sessionToAttempt(s, [q1, q2], 80, NOW, { answeredOnly: true });
    expect(a.answers[q1.id].origin).toBe('review');
    expect(a.answers[q2.id].origin).toBeUndefined();
  });
});

describe('saved data from before the flag', () => {
  it('loads unchanged: no origin on attempts, no origins on sessions', () => {
    const legacyAttempt = {
      id: 'a1', quizId: 'q', quizTitle: 'q', completedAt: '2026-09-01T00:00:00.000Z', scoreRaw: 1, scoreTotal: 1,
      scorePercent: 100, isPassingSSA: true, timeElapsedSeconds: 1,
      answers: { x: { questionId: 'x', studentAnswer: 'A', isCorrect: true, standardCode: 'NC.5.NF.1' } },
    };
    const legacySession = { kind: 'practice', quizId: 'path-practice-1', title: 't', refs: [{ kind: 'authored', id: 'nf1-01' }],
      answers: {}, flagged: {}, currentIndex: 0, startedAt: '2026-09-30T00:00:00.000Z', secondsElapsed: 0 };
    const raw = { version: 2, activeProfileId: 'a', profiles: [{ ...newProfile({ id: 'a', studentName: 'Alex' }), attempts: [legacyAttempt], activeSession: legacySession }] };
    const out = normaliseState(raw)!;
    expect(out.repaired).toBe(false);
    expect(out.state.profiles[0].attempts[0].answers.x.origin).toBeUndefined();
    expect(out.state.profiles[0].activeSession?.origins).toBeUndefined();
  });

  it('drops a malformed origins value but keeps the session', () => {
    const session = { kind: 'practice', quizId: 'p', title: 't', refs: [], answers: {}, flagged: {}, currentIndex: 0, startedAt: '', secondsElapsed: 0, origins: 'oops' };
    const raw = { version: 2, activeProfileId: 'a', profiles: [{ ...newProfile({ id: 'a', studentName: 'Alex' }), activeSession: session }] };
    expect(normaliseState(raw)!.state.profiles[0].activeSession?.origins).toBeUndefined();
  });
});

describe('F8: round exits ignore due-review answers', () => {
  const withContent = new Set(c5.source.allStandardsWithContent());
  const domainIds = c5.domains.filter((d) => d.standards.some((s) => withContent.has(s.code))).map((d) => d.id);
  const codeOf = (id: string): StandardCode => c5.domains.find((d) => d.id === id)!.standards.find((s) => withContent.has(s.code))!.code;
  const needFor = (id: string) =>
    sampleSizeFor(c5, c5.domains.find((d) => d.id === id)!.standards.map((s) => s.code).filter((c) => withContent.has(c)));
  const base = { curriculum: c5, checkupSkipped: true, testDate: '', now: NOW };

  let seq = 0;
  function attempt(quizId: string, rows: [StandardCode, boolean, AnswerOrigin?][]): QuizAttempt {
    seq += 1;
    const answers: Record<string, QuizAttemptAnswer> = {};
    rows.forEach(([code, ok, origin], i) => {
      answers[`q${seq}-${i}`] = { questionId: `q${seq}-${i}`, studentAnswer: 'A', isCorrect: ok, standardCode: code, ...(origin === 'review' ? { origin } : {}) };
    });
    return {
      id: `a${seq}`, quizId, quizTitle: quizId, completedAt: new Date(Date.UTC(2026, 8, 1, 0, 0, seq)).toISOString(),
      scoreRaw: 0, scoreTotal: rows.length, scorePercent: 0, isPassingSSA: false, timeElapsedSeconds: 0, answers,
    };
  }
  const rows = (d: string, n: number, ok: boolean, origin?: AnswerOrigin): [StandardCode, boolean, AnswerOrigin?][] =>
    Array.from({ length: n }, () => [codeOf(d), ok, origin]);
  const finishedTopics = () => [
    attempt(`${PRACTICE_QUIZ_PREFIX}1`, domainIds.flatMap((d) => rows(d, needFor(d), true))),
    attempt(`${ROUND3_QUIZ_PREFIX}1`, domainIds.flatMap((d) => rows(d, needFor(d), true))),
  ];

  it('F8: two wrong due-review answers in Round 3 do not un-finish a topic', () => {
    const d = domainIds[0];
    const bad = attempt(`${ROUND3_QUIZ_PREFIX}2`, rows(d, 2, false, 'review'));
    const p = buildPath({ ...base, attempts: [...finishedTopics(), bad] });
    expect(p.topics.find((t) => t.domainId === d)!.round).toBe('done');
    expect(p.currentRound).toBe('test');
  });

  it('F8: the same misses WITHOUT the flag (saved before this change) count as new answers, as before', () => {
    const d = domainIds[0];
    const legacy = attempt(`${ROUND3_QUIZ_PREFIX}2`, rows(d, 2, false));
    const p = buildPath({ ...base, attempts: [...finishedTopics(), legacy] });
    expect(p.topics.find((t) => t.domainId === d)!.round).not.toBe('done');
  });

  it('F8: wrong due-review answers do not block finishing Round 2', () => {
    const d = domainIds[0];
    const practice = attempt(`${PRACTICE_QUIZ_PREFIX}1`, [...rows(d, needFor(d), true), ...rows(d, 2, false, 'review')]);
    const p = buildPath({ ...base, attempts: [practice] });
    expect(p.topics.find((t) => t.domainId === d)!.round).toBe(3);
  });
});
```

(The two `../state/storage` imports may be merged into one line.)

- [ ] **Step 2: Run and confirm failure.** Run: `npx vitest run src/engine/origin.test.ts`. Expected: FAIL (`composeSession`, `AnswerOrigin` and `origins` missing).

- [ ] **Step 3: Types.** In `src/types/index.ts` add above `QuizAttemptAnswer`:

```ts
/** Where a question came from in its session: fresh content or a due review. Missing means 'new'. */
export type AnswerOrigin = 'new' | 'review';
```

and add `origin?: AnswerOrigin; // absent means 'new'; only 'review' is written` to `QuizAttemptAnswer` (after `flaggedForReview`).

- [ ] **Step 4: `sessionComposer.ts`.** Add `import type { AnswerOrigin } from '../types';`. Replace the function head:

```ts
export interface SelectSessionInput {
  curriculum: GradeCurriculum;
  mastery: Map<StandardCode, StandardMastery>;
  queue: ReviewQueue;
  size: number;
  now: Date;
  seed: number;
  plan?: SessionPlan;
}

export interface ComposedRef {
  ref: QuestionRef;
  origin: AnswerOrigin;
}

/** The refs of composeSession, for callers that do not care where each came from. */
export function selectSession(input: SelectSessionInput): QuestionRef[] {
  return composeSession(input).map((c) => c.ref);
}

export function composeSession(input: SelectSessionInput): ComposedRef[] {
```

(replacing `export function selectSession(input: {...}): QuestionRef[] {`). Inside the body change `const refs: QuestionRef[] = [];` to `const refs: ComposedRef[] = [];`, the review push `refs.push(ref);` to `refs.push({ ref, origin: 'review' });`, and the new-content push (the one just before `used.add(key);`) `refs.push(ref);` to `refs.push({ ref, origin: 'new' });`. Leave both `refs.slice(0, size)` returns as they are.

- [ ] **Step 5: `activeSession.ts`.** Import `type AnswerOrigin` (`import type { AnswerOrigin, QuizAttempt, QuizAttemptAnswer, QuizDefinition } from '../types';`). Add to `ActiveSession` (after `flagged`):

```ts
  /** Question.id -> 'review' for refs that came from the due-review queue. Absent means every ref is new. */
  origins?: Record<string, AnswerOrigin>;
```

add `origins?: Record<string, AnswerOrigin>;` to the `newSession` args type (after `standardCode?`), and in `sessionToAttempt` change the object assigned to `answers[q.id]` to append `...(s.origins?.[q.id] === 'review' ? { origin: 'review' as const } : {}),` after `flaggedForReview: s.flagged[q.id],`.

- [ ] **Step 6: `pathSession.ts`.** Replace the imports of `selectSession` and `newSession` lines and the tail of the function:

```ts
import { composeSession, type SessionPlan } from './sessionComposer';
import { PRACTICE_QUIZ_PREFIX, ROUND3_QUIZ_PREFIX, type NextStep } from './path';
import { newSession, sessionFromQuiz, type ActiveSession } from './activeSession';
import { questionRefId } from './questionModel';
import type { AnswerOrigin } from '../types';
```

and replace from `const refs = selectSession(...)` to the end:

```ts
  const composed = composeSession({ curriculum: c, mastery, queue, size, now, seed, plan });
  if (composed.length === 0) return null;
  const refs = composed.map((x) => x.ref);
  const origins: Record<string, AnswerOrigin> = {};
  for (const x of composed) if (x.origin === 'review') origins[questionRefId(x.ref)] = 'review';
  const withOrigins = Object.keys(origins).length > 0 ? { origins } : {};

  return step.kind === 'round3'
    ? newSession({ kind: 'round3', quizId: `${ROUND3_QUIZ_PREFIX}${now.getTime()}`, title: 'Test-ready practice', refs, now, ...withOrigins })
    : newSession({ kind: 'practice', quizId: `${PRACTICE_QUIZ_PREFIX}${now.getTime()}`, title: `Round ${step.round} practice`, refs, now, ...withOrigins });
```

- [ ] **Step 7: `path.ts` windows.** Replace the answer-collecting block:

```ts
  const all = new Map<DomainId, boolean[]>();      // every answer: Round 1 volume, topic label
  const fresh = new Map<DomainId, boolean[]>();    // without due reviews: the Round 2 exit window
  const round3 = new Map<DomainId, boolean[]>();   // Round 3 sessions without due reviews: the Round 3 exit window
  for (const a of chronological) {
    const isRound3 = a.quizId.startsWith(ROUND3_QUIZ_PREFIX);
    for (const ans of Object.values(a.answers)) {
      const d = domainByStandard.get(ans.standardCode);
      if (!d) continue; // another grade's content
      push(all, d, ans.isCorrect);
      if (ans.origin === 'review') continue; // due reviews of finished topics must not pull them back (F8)
      push(fresh, d, ans.isCorrect);
      if (isRound3) push(round3, d, ans.isCorrect);
    }
  }
```

In the topics map add `const freshXs = fresh.get(d.id) ?? [];` next to `const xs`, and change the round 2 line to use it: `const r2 = r1 && (passes(freshXs) || (shortOnTime && status === 'acceleration-ready'));`. (`xs` still drives `answered`, `round1Done` and the label.)

- [ ] **Step 8: Run and verify.** Run: `npm run test:run`, `npm run typecheck`, `npm run lint`. Expected: PASS.

- [ ] **Step 9: Commit.**

```bash
git add src
git commit -m "fix: due-review answers no longer count toward round exits; record answer origin (F8)" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01X5HSDdHPWxvHxgBaoSTbLX"
```

---

### Task 14: Session summary is honest about strength and skipped questions (F9, F15)

**Files:**
- Modify: `src/engine/sessionSummary.ts`, `src/components/SessionSummary.tsx`
- Modify tests: `src/engine/sessionSummary.test.ts`, `src/components/SessionSummary.test.tsx`

**Interfaces:**
- Produces: `MIN_ANSWERS_FOR_STRONG = 3`; `TopicResult.unanswered: number`; `SessionSummaryData.notAnswered: number` and `SessionSummaryData.alsoPracticed: TopicResult[]`. A topic is `strong` or `tricky` only with at least 3 answers; topics with 1-2 answers go to `alsoPracticed`. "Not answered" counts answers whose `studentAnswer` is empty (recorded wrong, as on the real test).
- Pinned wrong tests updated: `sessionSummary.test.ts` (`'splits topics...'` expects `unanswered: 0` on the tricky row; `'omits topics...'` expects the two new fields) and `SessionSummary.test.tsx` (rows raised to 3 answers per topic; expected `missed 3` and `readiness: 0% → 7%`, derived as Fractions weight 41 x (100 x 3/4 evidence on 1 of 4 standards, mean 18.75) = 7.69, displayed `7%`).

- [ ] **Step 1: Update and add the failing tests.** In `src/engine/sessionSummary.test.ts`: change the expectation in `'splits topics...'` to
`expect(s.tricky).toEqual([{ domainId: 'NBT', name: 'Decimals & place value', correct: 1, total: 3, unanswered: 0 }]);`, change `'omits topics...'` to
`expect(s).toEqual({ correct: 0, total: 0, notAnswered: 0, strong: [], tricky: [], alsoPracticed: [] });`, and append:

```ts
describe('F9 and F15', () => {
  it('F9: one or two answers is "also practiced", never strong or tricky', () => {
    const s = summarizeAttempt(attemptOf([['NF', true], ['NBT', true], ['NBT', true]]), c5);
    expect(s.strong).toEqual([]);
    expect(s.tricky).toEqual([]);
    expect(s.alsoPracticed.map((t) => `${t.name} ${t.correct}/${t.total}`)).toEqual(['Fractions 1/1', 'Decimals & place value 2/2']);
  });

  it('F9: three answers is enough to be strong', () => {
    const s = summarizeAttempt(attemptOf([['NF', true], ['NF', true], ['NF', true]]), c5);
    expect(s.strong.map((t) => t.name)).toEqual(['Fractions']);
  });

  it('F15: unanswered questions are counted separately from misses', () => {
    const a = attemptOf([['NF', true], ['NF', true], ['NF', false], ['NF', false], ['NF', false]]);
    a.answers.q3.studentAnswer = '';
    a.answers.q4.studentAnswer = '   ';
    const s = summarizeAttempt(a, c5);
    expect(s.notAnswered).toBe(2);
    expect(s.tricky).toEqual([{ domainId: 'NF', name: 'Fractions', correct: 2, total: 5, unanswered: 2 }]);
  });
});
```

In `src/components/SessionSummary.test.tsx` change the attempt in the first test to three answers per topic:
`const attempt = attemptOf([['NF', true], ['NF', true], ['NF', true], ['NBT', false], ['NBT', false], ['NBT', false]]);`, the missed assertion to `expect(screen.getByText(/missed 3/i)).toBeInTheDocument();` and the readiness assertion to `expect(screen.getByText(/readiness: 0% → 7%/i)).toBeInTheDocument();`, then append:

```tsx
describe('SessionSummary honesty', () => {
  beforeEach(() => localStorage.clear());
  const renderSummary = (rows: [string, boolean][], tweak?: (a: QuizAttempt) => void) => {
    const attempt = attemptOf(rows);
    tweak?.(attempt);
    const p = newProfile({ id: 'p1', studentName: 'Alex', attempts: [attempt], checkupSkipped: true });
    saveState(localStorage, { version: 2, profiles: [p], activeProfileId: 'p1' });
    return render(<ProgressProvider><SessionSummary attempt={attempt} readinessBefore={0} roundBefore={1} onHome={vi.fn()} /></ProgressProvider>);
  };

  it('F9: a topic with one answer is not "Strong today"', () => {
    renderSummary([['NF', true]]);
    expect(screen.queryByText(/strong today/i)).not.toBeInTheDocument();
    expect(screen.getByText(/also practiced/i)).toBeInTheDocument();
    expect(screen.getByText(/fractions/i)).toBeInTheDocument();
  });

  it('F15: an early-submitted session says "N not answered" apart from "missed"', () => {
    renderSummary([['NF', true], ['NF', true], ['NF', false], ['NF', false], ['NF', false]], (a) => {
      a.answers.q3.studentAnswer = '';
      a.answers.q4.studentAnswer = '';
    });
    expect(screen.getByText(/2 not answered/i)).toBeInTheDocument();
    expect(screen.getByText(/missed 1/i)).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run and confirm failure.** Run: `npx vitest run src/engine/sessionSummary.test.ts src/components/SessionSummary.test.tsx`. Expected: FAIL.

- [ ] **Step 3: `sessionSummary.ts`.** Replace the file body from the interfaces down with:

```ts
import type { DomainId, GradeCurriculum, StandardCode } from '../curriculum/types';
import { topicName } from '../curriculum/registry';
import type { QuizAttempt } from '../types';
import { isPassing } from './mastery';

/** A topic needs at least this many answers in a session to be called strong or tricky. */
export const MIN_ANSWERS_FOR_STRONG = 3;

export interface TopicResult {
  domainId: DomainId;
  name: string;
  correct: number;
  total: number;
  /** Answers left blank (recorded wrong, as on the real test). */
  unanswered: number;
}

export interface SessionSummaryData {
  correct: number;
  total: number;
  /** Questions left blank across the whole session. */
  notAnswered: number;
  strong: TopicResult[];
  tricky: TopicResult[];
  /** Topics with too few answers to judge (1-2). */
  alsoPracticed: TopicResult[];
}

/** Per-topic results for one finished session, for the parent summary. */
export function summarizeAttempt(attempt: QuizAttempt, c: GradeCurriculum): SessionSummaryData {
  const domainByStandard = new Map<StandardCode, DomainId>();
  for (const d of c.domains) for (const s of d.standards) domainByStandard.set(s.code, d.id);

  const tally = new Map<DomainId, { correct: number; total: number; unanswered: number }>();
  for (const ans of Object.values(attempt.answers)) {
    const d = domainByStandard.get(ans.standardCode);
    if (!d) continue;
    const t = tally.get(d) ?? { correct: 0, total: 0, unanswered: 0 };
    t.total += 1;
    if (ans.isCorrect) t.correct += 1;
    if ((ans.studentAnswer ?? '').trim() === '') t.unanswered += 1;
    tally.set(d, t);
  }

  const results: TopicResult[] = c.domains
    .filter((d) => tally.has(d.id))
    .map((d) => ({ domainId: d.id, name: topicName(d), ...tally.get(d.id)! }));
  const passing = c.ssa.passingPercent;
  const enough = (t: TopicResult) => t.total >= MIN_ANSWERS_FOR_STRONG;

  return {
    correct: results.reduce((n, t) => n + t.correct, 0),
    total: results.reduce((n, t) => n + t.total, 0),
    notAnswered: results.reduce((n, t) => n + t.unanswered, 0),
    strong: results.filter((t) => enough(t) && isPassing(t.correct, t.total, passing)),
    tricky: results.filter((t) => enough(t) && !isPassing(t.correct, t.total, passing)),
    alsoPracticed: results.filter((t) => !enough(t)),
  };
}
```

- [ ] **Step 4: `SessionSummary.tsx`.** Replace the line `<p className="text-slate-700">{summary.correct} out of {summary.total} right.</p>` with:

```tsx
        <p className="text-slate-700">{summary.correct} out of {summary.total} right.</p>
        {summary.notAnswered > 0 && <p className="text-slate-600">{summary.notAnswered} not answered</p>}
```

Replace the tricky `<li>`:

```tsx
              {summary.tricky.map((t) => {
                const missed = t.total - t.correct - t.unanswered;
                return (
                  <li key={t.domainId}>
                    {t.name}
                    {missed > 0 && <span className="text-slate-500"> (missed {missed})</span>}
                  </li>
                );
              })}
```

and add after the Tricky block (before the readiness line):

```tsx
        {summary.alsoPracticed.length > 0 && (
          <div>
            <h2 className="font-semibold text-slate-800">Also practiced</h2>
            <ul className="mt-1 space-y-1">
              {summary.alsoPracticed.map((t) => (
                <li key={t.domainId}>{t.name} <span className="text-slate-500">({t.correct} of {t.total} right)</span></li>
              ))}
            </ul>
          </div>
        )}
```

- [ ] **Step 5: Run and verify.** Run: `npm run test:run` and `npm run typecheck`. Expected: PASS.

- [ ] **Step 6: Commit.**

```bash
git add src/engine/sessionSummary.ts src/engine/sessionSummary.test.ts src/components/SessionSummary.tsx src/components/SessionSummary.test.tsx
git commit -m "fix: summary needs 3 answers for Strong today and separates not-answered from missed (F9, F15)" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01X5HSDdHPWxvHxgBaoSTbLX"
```

---

### Task 15: Drills no longer claim an SSA pass (F10)

**Files:**
- Modify: `src/components/QuizResults.tsx`, `src/components/Dashboard.tsx` (history chip)
- Create: `src/components/QuizResults.test.tsx`
- Modify tests: `src/components/Dashboard.test.tsx` (append)

**Interfaces:**
- Consumes: `curriculum.quizzes[].isMockAssessment` (already on `QuizDefinition`).
- Produces: `QuizResults` computes `isMock` from the quiz definition; only `isMock && attempt.isPassingSSA` shows the pass banner and confetti; drills show "Nice work" with the score. The "Wake County SSA" sentences and "Qualifying Bar" line appear only for practice tests. Dashboard history chips show "SSA Passed" / "Needs Practice" only for practice tests and "Practice" otherwise.

- [ ] **Step 1: Write the failing tests.** `src/components/QuizResults.test.tsx`:

```tsx
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import confetti from 'canvas-confetti';
import { ProgressProvider } from '../context/ProgressContext';
import { QuizResults } from './QuizResults';
import type { QuizAttempt } from '../types';

vi.mock('canvas-confetti', () => ({ default: vi.fn() }));

const attemptFor = (quizId: string, raw: number, total: number): QuizAttempt => ({
  id: 'a', quizId, quizTitle: 'Some quiz', completedAt: '2026-09-30T12:00:00.000Z',
  scoreRaw: raw, scoreTotal: total, scorePercent: (raw / total) * 100, isPassingSSA: raw * 100 >= 80 * total,
  timeElapsedSeconds: 60, answers: {},
});
const renderResults = (a: QuizAttempt) => render(
  <ProgressProvider>
    <QuizResults attempt={a} onRetake={vi.fn()} onStartStandardDrill={vi.fn()} onOpenStudyGuide={vi.fn()} onDone={vi.fn()} />
  </ProgressProvider>,
);

describe('QuizResults SSA claims (F10)', () => {
  beforeEach(() => { localStorage.clear(); vi.mocked(confetti).mockClear(); });

  it('F10: a 4/5 drill says "Nice work" with the score, no SSA pass, no confetti', () => {
    const { container } = renderResults(attemptFor('drill-nf1', 4, 5));
    expect(screen.getByText(/nice work/i)).toBeInTheDocument();
    expect(container.textContent).not.toMatch(/SSA Acceleration-Ready/);
    expect(container.textContent).not.toMatch(/Wake County/);
    expect(container.textContent).not.toMatch(/Qualifying Bar/);
    expect(container.textContent).toMatch(/4 of 5 Correct/);
    expect(confetti).not.toHaveBeenCalled();
  });

  it('F10: a passed full practice test still celebrates', () => {
    const { container } = renderResults(attemptFor('mock-ssa-01', 18, 20));
    expect(container.textContent).toMatch(/SSA Acceleration-Ready/);
    expect(confetti).toHaveBeenCalledTimes(1);
  });

  it('F10: a failed practice test says Needs Practice', () => {
    const { container } = renderResults(attemptFor('mock-ssa-01', 10, 20));
    expect(container.textContent).toMatch(/Needs Practice/);
    expect(confetti).not.toHaveBeenCalled();
  });
});
```

Append to `src/components/Dashboard.test.tsx`:

```tsx
describe('Dashboard history chips (F10)', () => {
  beforeEach(() => localStorage.clear());
  it('F10: a passed drill is not labelled "SSA Passed"', () => {
    const attempt: QuizAttempt = {
      id: 'd1', quizId: 'drill-nf1', quizTitle: 'NF drill', completedAt: '2026-09-30T00:00:00.000Z',
      scoreRaw: 4, scoreTotal: 5, scorePercent: 80, isPassingSSA: true, timeElapsedSeconds: 60, answers: {},
    };
    saveState(localStorage, { version: 2, activeProfileId: 'p', profiles: [newProfile({ id: 'p', studentName: 'T', attempts: [attempt] })] });
    renderDashboard();
    expect(screen.queryByText(/SSA Passed/)).not.toBeInTheDocument();
    expect(screen.getByText('Practice')).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run and confirm failure.** Run: `npx vitest run src/components/QuizResults.test.tsx src/components/Dashboard.test.tsx`. Expected: FAIL.

- [ ] **Step 3: `QuizResults.tsx`.** After `const passingPercent = ...` add:

```tsx
  // Only a full practice test can claim an SSA pass; a drill is just practice (F10).
  const isMock = Boolean(curriculum.quizzes.find((q) => q.id === attempt.quizId)?.isMockAssessment);
  const celebrate = isMock && attempt.isPassingSSA;
  const tone = isMock ? (attempt.isPassingSSA ? 'pass' : 'practice') : 'drill';
```

Change the confetti effect condition and dependency to `celebrate`: `if (celebrate) {` ... `}, [celebrate]);`. Replace the header card class conditional with:

```tsx
      <div className={`rounded-3xl p-6 sm:p-8 border shadow-lg relative overflow-hidden ${
        tone === 'pass'
          ? 'bg-gradient-to-br from-emerald-50 via-teal-50 to-white border-emerald-300'
          : tone === 'practice'
          ? 'bg-gradient-to-br from-amber-50 via-orange-50 to-white border-amber-300'
          : 'bg-gradient-to-br from-blue-50 via-sky-50 to-white border-blue-200'
      }`}>
```

the badge class with the same three tones (`'bg-emerald-600 text-white border-emerald-700'`, `'bg-amber-500 text-white border-amber-600'`, `'bg-blue-600 text-white border-blue-700'`) and its text with:

```tsx
                {tone === 'pass'
                  ? `★ SSA Acceleration-Ready (Passed ≥ ${passingPercent}%)`
                  : tone === 'practice'
                  ? `Needs Practice (Below ${passingPercent}% Cutoff)`
                  : 'Nice work'}
```

Replace the explanatory `<p>` contents with:

```tsx
              {tone === 'pass'
                ? `Excellent mastery! Scoring at or above ${passingPercent}% satisfies the Wake County Single Subject Acceleration performance benchmark on this module.`
                : tone === 'practice'
                ? `Wake County SSA requires a ${passingPercent}% or higher score to accelerate. Review the missed questions below to identify and master weak concepts.`
                : `You got ${attempt.scoreRaw} of ${attempt.scoreTotal} right. Review anything you missed below.`}
```

Change the score color line `attempt.isPassingSSA ? 'text-emerald-600' : 'text-amber-600'` to `tone === 'pass' ? 'text-emerald-600' : tone === 'practice' ? 'text-amber-600' : 'text-blue-700'` and wrap the `Qualifying Bar` div in `{isMock && (...)}`.

- [ ] **Step 4: `Dashboard.tsx` history.** Above the `return` add `const mockIds = new Set(curriculum.quizzes.filter((q) => q.isMockAssessment).map((q) => q.id));`. In the history row set `const isMock = mockIds.has(attempt.quizId);` (turn the arrow body of the `.map(attempt => (` into a block if needed) and change the chip:

```tsx
                    <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full border ${
                      !isMock
                        ? 'bg-blue-50 text-blue-800 border-blue-200'
                        : attempt.isPassingSSA
                        ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                        : 'bg-amber-100 text-amber-800 border-amber-300'
                    }`}>
                      {!isMock ? 'Practice' : attempt.isPassingSSA ? `SSA Passed (≥${passingPercent}%)` : `Needs Practice (<${passingPercent}%)`}
                    </span>
```

and the score color to `!isMock ? 'text-blue-700' : attempt.isPassingSSA ? 'text-emerald-600' : 'text-amber-600'`.

- [ ] **Step 5: Run and verify.** Run: `npm run test:run`, `npm run typecheck`, `npm run lint`. Expected: PASS.

- [ ] **Step 6: Commit.**

```bash
git add src/components
git commit -m "fix: only full practice tests claim an SSA pass; drills say Nice work (F10)" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01X5HSDdHPWxvHxgBaoSTbLX"
```

---

### Task 16: "Ready to try for SSA" tracks the latest practice test (F6)

**Files:**
- Modify: `src/engine/path.ts`, `src/components/ParentHome.tsx`
- Modify tests: `src/engine/pace.test.ts` (helper field), `src/engine/path.test.ts` (append), `src/components/ParentHome.test.tsx` (append)

**Interfaces:**
- Produces: `PathState.practiceTestPassedAt` is set only when the MOST RECENT practice-test attempt passed; `PathState.practiceTestRepeat: boolean` is true when the grade has exactly one practice-test form and it has been taken before. `ParentHome` shows "You've seen this test before — the score may be higher than on a new test." when `practiceTestRepeat` and no session is saved.
- `pace.test.ts` `path()` helper gains `practiceTestRepeat: false`.

- [ ] **Step 1: Write the failing tests.** Append to `src/engine/path.test.ts`:

```ts
describe('F6: practice-test readiness', () => {
  const mockAttempt = (quizId: string, passed: boolean, second: number): QuizAttempt => ({
    id: `m${second}`, quizId, quizTitle: quizId, completedAt: new Date(Date.UTC(2026, 8, 20, 0, 0, second)).toISOString(),
    scoreRaw: 0, scoreTotal: 0, scorePercent: 0, isPassingSSA: passed, timeElapsedSeconds: 0, answers: {},
  });

  it('F6: a pass followed by a failed practice test no longer counts as ready', () => {
    const p = buildPath({ ...base, attempts: [mockAttempt('mock-ssa-01', true, 1), mockAttempt('mock-ssa-02', false, 2)] });
    expect(p.practiceTestPassedAt).toBeUndefined();
  });

  it('F6: a failure followed by a pass counts, dated at the pass', () => {
    const pass = mockAttempt('mock-ssa-02', true, 2);
    const p = buildPath({ ...base, attempts: [mockAttempt('mock-ssa-01', false, 1), pass] });
    expect(p.practiceTestPassedAt).toBe(pass.completedAt);
  });

  it('F6: a grade with one practice-test form flags a repeat once it has been taken', () => {
    const c3 = getCurriculum(3);
    const forms = c3.quizzes.filter((q) => q.isMockAssessment);
    expect(forms).toHaveLength(1); // fixture guard: grades 1-4 have a single form
    const args = { curriculum: c3, checkupSkipped: true, testDate: '', now: NOW };
    expect(buildPath({ ...args, attempts: [] }).practiceTestRepeat).toBe(false);
    expect(buildPath({ ...args, attempts: [mockAttempt(forms[0].id, false, 1)] }).practiceTestRepeat).toBe(true);
  });

  it('F6: a grade with two forms never flags a repeat after one is taken', () => {
    expect(buildPath({ ...base, attempts: [mockAttempt('mock-ssa-01', false, 1)] }).practiceTestRepeat).toBe(false);
  });
});
```

In `src/engine/pace.test.ts` add `practiceTestRepeat: false,` to the `path()` helper. Append to `src/components/ParentHome.test.tsx`:

```tsx
describe('ParentHome practice-test banner (F6)', () => {
  beforeEach(() => localStorage.clear());
  const mock = (id: string, quizId: string, passed: boolean, day: number) => ({
    id, quizId, quizTitle: 'Mock', completedAt: new Date(2026, 10, day, 12).toISOString(),
    scoreRaw: 0, scoreTotal: 0, scorePercent: 0, isPassingSSA: passed, timeElapsedSeconds: 0, answers: {},
  });

  it('F6: no "Ready to try" after a later failed practice test', () => {
    renderHome({ attempts: [mock('m1', 'mock-ssa-01', true, 2), mock('m2', 'mock-ssa-02', false, 5)] });
    expect(screen.queryByText(/Ready to try for SSA/)).not.toBeInTheDocument();
  });

  it('F6: warns that a single form has been seen before', () => {
    const forms = getCurriculum(3).quizzes.filter((q) => q.isMockAssessment);
    renderHome({ grade: 3, attempts: [mock('m1', forms[0].id, false, 2)] });
    expect(screen.getByText(/seen this test before/i)).toBeInTheDocument();
  });

  it('F6: says nothing about repeats for a fresh student', () => {
    renderHome({ grade: 3 });
    expect(screen.queryByText(/seen this test before/i)).not.toBeInTheDocument();
  });
});
```

(add `import { getCurriculum } from '../curriculum/registry';` to the file's imports). In `src/engine/path.test.ts` the `getCurriculum` import already exists.

- [ ] **Step 2: Run and confirm failure.** Run: `npx vitest run src/engine/path.test.ts src/components/ParentHome.test.tsx`. Expected: FAIL.

- [ ] **Step 3: `path.ts`.** Add `practiceTestRepeat: boolean;` to `PathState` (after `practiceTestPassedAt?`). Replace the `passedMock` line with:

```ts
  // Only the most recent practice test says whether the child is ready now (F6).
  const lastMock = chronological.filter((a) => mockIds.has(a.quizId)).pop();
  const passedMock = lastMock?.isPassingSSA ? lastMock : undefined;
```

and add to the returned object, after `practiceTestPassedAt: passedMock?.completedAt,`:

```ts
    // One form only and it has been taken: a retake serves the same questions.
    practiceTestRepeat: mocks.length === 1 && nextMock !== undefined && lastTaken(nextMock.id) !== '',
```

- [ ] **Step 4: `ParentHome.tsx`.** In the `saved ? (...) : (...)` else-branch, directly after the opening `<div className="space-y-2">` of the not-saved case, add:

```tsx
              {path.practiceTestRepeat && (
                <p className="text-xs text-slate-600">
                  You&rsquo;ve seen this test before &mdash; the score may be higher than on a new test.
                </p>
              )}
```

- [ ] **Step 5: Run and verify.** Run: `npm run test:run` and `npm run typecheck`. Expected: PASS.

- [ ] **Step 6: Commit.**

```bash
git add src
git commit -m "fix: Ready to try for SSA reflects the latest practice test, and repeats are flagged (F6)" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01X5HSDdHPWxvHxgBaoSTbLX"
```

---

### Task 17: Day keys, current-grade counts and weeks (F11, F12, F13, F14)

**Files:**
- Create: `src/engine/attempts.ts`, `src/context/ProgressContext.day.test.tsx`, `src/components/ParentHome.day.test.tsx`
- Modify: `src/engine/path.ts` (`timeLeftText`, `localDayKey`), `src/engine/pace.ts`, `src/context/ProgressContext.tsx`, `src/components/ParentHome.tsx`, `src/components/Dashboard.tsx`
- Modify tests: `src/engine/pace.test.ts`, `src/engine/path.test.ts` (append), `src/components/Dashboard.test.tsx` (append)

**Interfaces:**
- Produces: `currentGradeAttempts(attempts, c): QuizAttempt[]` and `isCurrentGradeAttempt(a, c): boolean` (`src/engine/attempts.ts`; an attempt is current-grade when any answer's standard belongs to the curriculum); `timeLeftText(days: number): string`; `localDayKey(now: Date): string` (`'YYYY-MM-DD'`); `computePace` input gains `curriculum: GradeCurriculum` (**new required field**).
- Pinned wrong tests updated: `pace.test.ts` helper `attemptAt` now builds an attempt with one grade-5 answer (attempts with no current-grade answers are ignored) and `input()` supplies `curriculum: getCurriculum(5)`.

- [ ] **Step 1: Write the failing tests.**

In `src/engine/pace.test.ts` replace `attemptAt` and `input`:

```ts
const c5 = getCurriculum(5);
const attemptAt = (iso: string, code = 'NC.5.NF.1') => ({
  completedAt: iso,
  answers: { q: { questionId: 'q', studentAnswer: 'A', isCorrect: true, standardCode: code } },
}) as unknown as QuizAttempt;
const input = (over: Partial<Parameters<typeof computePace>[0]> = {}) => ({
  path: path(), attempts: [] as QuizAttempt[], testDate: '2026-11-25', now: NOW, sessionSize: 15, curriculum: c5, ...over,
});
```

(remove the now-duplicate `getCurriculum(5)` inside the F1 integration test by using `c5`) and append:

```ts
  it('F12: an old attempt from another grade does not stretch the elapsed time', () => {
    const p = computePace(input({
      attempts: [attemptAt('2026-01-01T00:00:00Z', 'NC.3.OA.1'), attemptAt('2026-09-29T00:00:00Z'), attemptAt('2026-09-29T06:00:00Z')],
      path: path({ roundsFinished: 10 }),
    }));
    expect(p.status).toBe('ahead'); // with the Jan attempt counted this read "behind"
  });
```

Append to `src/engine/path.test.ts` (extend its `./path` import with `timeLeftText, localDayKey`):

```ts
describe('timeLeftText (F13)', () => {
  it.each([
    [0, 'Test is today'], [1, '1 day left'], [13, '13 days left'],
    [14, '2 weeks left'], [17, '2 weeks left'], [18, '3 weeks left'], [20, '3 weeks left'], [42, '6 weeks left'],
  ])('F13: %i days reads "%s"', (days, text) => {
    expect(timeLeftText(days)).toBe(text);
  });
});

describe('localDayKey (F11)', () => {
  it('F11: is the local calendar day, zero padded', () => {
    expect(localDayKey(new Date(2026, 0, 5, 23, 59))).toBe('2026-01-05');
    expect(localDayKey(new Date(2026, 0, 6, 0, 1))).toBe('2026-01-06');
  });
});
```

Create `src/context/ProgressContext.day.test.tsx`:

```tsx
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { ProgressProvider, useReadinessSummary, useProgress } from './ProgressContext';
import { act } from '@testing-library/react';

describe('F11: day-dependent values refresh after midnight', () => {
  beforeEach(() => { localStorage.clear(); vi.useFakeTimers({ toFake: ['Date'] }); });
  afterEach(() => vi.useRealTimers());

  it('F11: daysUntilExam counts down when the day changes, without any data change', () => {
    vi.setSystemTime(new Date(2026, 8, 30, 23, 0));
    const wrapper = ({ children }: { children: React.ReactNode }) => <ProgressProvider>{children}</ProgressProvider>;
    const { result, rerender } = renderHook(() => ({ p: useProgress(), r: useReadinessSummary() }), { wrapper });
    act(() => result.current.p.updateActiveProfile({ targetExamDate: '2026-10-05' }));
    expect(result.current.r.daysUntilExam).toBe(5);
    vi.setSystemTime(new Date(2026, 9, 1, 0, 5));
    rerender();
    expect(result.current.r.daysUntilExam).toBe(4);
  });
});
```

(import `React` type as needed: add `import type React from 'react';`.) Create `src/components/ParentHome.day.test.tsx`:

```tsx
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ProgressProvider } from '../context/ProgressContext';
import { ParentHome } from './ParentHome';
import { newProfile, saveState } from '../state/storage';

const handlers = { onStartStep: vi.fn(), onContinue: vi.fn(), onOpenDetailed: vi.fn(), onSwitchStudent: vi.fn(), onAddStudent: vi.fn() };
const tree = () => <ProgressProvider><ParentHome {...handlers} /></ProgressProvider>;

describe('ParentHome after midnight (F11)', () => {
  beforeEach(() => { localStorage.clear(); vi.useFakeTimers({ toFake: ['Date'] }); });
  afterEach(() => vi.useRealTimers());

  it('F11: the short-on-time switch happens when the day rolls over', () => {
    vi.setSystemTime(new Date(2026, 8, 30, 12));
    saveState(localStorage, { version: 2, activeProfileId: 'p', profiles: [newProfile({ id: 'p', studentName: 'Alex', targetExamDate: '2026-10-15' })] });
    const { rerender } = render(tree());
    expect(screen.getByText(/15 days left|2 weeks left/)).toBeInTheDocument();
    expect(screen.queryByText(/short on time/i)).not.toBeInTheDocument();
    vi.setSystemTime(new Date(2026, 9, 2, 12));
    rerender(tree());
    expect(screen.getByText(/13 days left/)).toBeInTheDocument();
    expect(screen.getByText(/short on time/i)).toBeInTheDocument();
  });
});
```

Append to `src/components/Dashboard.test.tsx`:

```tsx
describe('Dashboard quizzes taken (F14)', () => {
  beforeEach(() => localStorage.clear());
  const at = (id: string, code: string): QuizAttempt => ({
    id, quizId: 'x', quizTitle: 'x', completedAt: '2026-09-30T00:00:00.000Z', scoreRaw: 1, scoreTotal: 1, scorePercent: 100,
    isPassingSSA: true, timeElapsedSeconds: 1,
    answers: { q: { questionId: 'q', studentAnswer: 'A', isCorrect: true, standardCode: code } },
  });
  it('F14: counts only the current grade\'s attempts', () => {
    saveState(localStorage, { version: 2, activeProfileId: 'p', profiles: [newProfile({
      id: 'p', studentName: 'T', grade: 5, attempts: [at('a', 'NC.5.NF.1'), at('b', 'NC.5.NBT.1'), at('c', 'NC.3.OA.1')],
    })] });
    renderDashboard();
    expect(screen.getByText('2 Quizzes Taken')).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run and confirm failure.** Run: `npx vitest run src/engine src/context/ProgressContext.day.test.tsx src/components/ParentHome.day.test.tsx src/components/Dashboard.test.tsx`. Expected: FAIL.

- [ ] **Step 3: Create `src/engine/attempts.ts`.**

```ts
import type { GradeCurriculum } from '../curriculum/types';
import { standardsOf } from '../curriculum/registry';
import type { QuizAttempt } from '../types';

/** An attempt belongs to the current grade when any answer assessed one of
 *  its standards. Standard codes never overlap across grades. */
export function currentGradeAttempts(attempts: QuizAttempt[], c: GradeCurriculum): QuizAttempt[] {
  const codes = new Set(standardsOf(c).map((s) => s.code));
  return attempts.filter((a) => Object.values(a.answers).some((ans) => codes.has(ans.standardCode)));
}

export function isCurrentGradeAttempt(a: QuizAttempt, c: GradeCurriculum): boolean {
  return currentGradeAttempts([a], c).length === 1;
}
```

- [ ] **Step 4: `path.ts` helpers.** Add after `countdownText`:

```ts
/** Weeks are rounded, so 20 days reads "3 weeks", not "2" (F13). */
export function timeLeftText(days: number): string {
  if (days === 0) return 'Test is today';
  if (days >= 14) return `${Math.round(days / 7)} weeks left`;
  return days === 1 ? '1 day left' : `${days} days left`;
}

/** The local calendar day, used as a memo key so day-dependent values refresh after midnight (F11). */
export function localDayKey(now: Date): string {
  const p = (n: number) => String(n).padStart(2, '0');
  return `${now.getFullYear()}-${p(now.getMonth() + 1)}-${p(now.getDate())}`;
}
```

- [ ] **Step 5: `pace.ts`.** Import `GradeCurriculum` (`import type { GradeCurriculum } from '../curriculum/types';`) and `currentGradeAttempts` from `./attempts`. Add `curriculum: GradeCurriculum;` to the input type and destructure it. Before computing `first`, add `const mine = currentGradeAttempts(attempts, curriculum);`, then use `mine` in the `reduce` for `first` and in the guard: `if (mine.length < 2 && status === 'ahead') status = 'on-track';`. (Replace the `attempts.reduce` and `attempts.length < 2` uses; nothing else in `computePace` reads `attempts`.)

- [ ] **Step 6: `ProgressContext.tsx`.** Import `localDayKey` with `daysUntil`. In `useReadinessSummary` add `const dayKey = localDayKey(new Date());` before the `useMemo`, and append `dayKey` to its dependency array.

- [ ] **Step 7: `ParentHome.tsx`.** Replace the local `timeLeft` function with an import of `timeLeftText` and `localDayKey` from `../engine/path` (delete `timeLeft`); change its use to `{timeLeftText(pace.daysLeft!)}`. Add `const dayKey = localDayKey(now);` after `const now = new Date();` and add `dayKey` to the `useMemo` dependency array (keeping the existing eslint-disable comment). Pass the curriculum to pace: `computePace({ path, attempts: profile.attempts, testDate: profile.targetExamDate, now, sessionSize: sessionSizeOf(profile), curriculum })`.

- [ ] **Step 8: `Dashboard.tsx`.** Import `currentGradeAttempts` from `../engine/attempts` and replace `{profile.attempts.length} Quizzes Taken` with `{currentGradeAttempts(profile.attempts, curriculum).length} Quizzes Taken`.

- [ ] **Step 9: Run and verify.** Run: `npm run test:run`, `npm run typecheck`, `npm run lint`. Expected: PASS.

- [ ] **Step 10: Commit.**

```bash
git add src
git commit -m "fix: day key for memos, current-grade pace and counts, rounded weeks (F11, F12, F13, F14)" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01X5HSDdHPWxvHxgBaoSTbLX"
```

---

### Task 18: Kid display and accessibility (spec 2.6; logic-flows Medium x2, Low)

**Files:**
- Create: `src/components/useEscapeKey.ts`
- Modify: `src/components/KidPractice.tsx`, `QuizRunner.tsx`, `Scratchpad.tsx`, `Calculator.tsx`, `StudyPaceModal.tsx`
- Modify tests: `src/components/KidPractice.test.tsx` (append), `src/components/QuizRunner.test.tsx` (append), `src/components/StudyPaceModal.test.tsx` (append)

**Interfaces:**
- Produces: `useEscapeKey(active: boolean, onEscape: () => void): void`. KidPractice: options have `aria-pressed`; the feedback block is `role="status"` and its heading (`<h2 tabIndex={-1}>`) receives focus when it appears; the stop confirm reads "Stop now? Your answers so far are saved and counted." QuizRunner: back and timer buttons have `aria-label`s (their `title`s stay), the navigator and confirm-submit overlays are `role="dialog"` closed by Escape, and unresolvable saved answers are kept in the snapshot. Scratchpad, Calculator and StudyPaceModal are `role="dialog"` with `aria-modal`, a name, an Escape close, and labelled close buttons. Icon buttons in the two runner headers have a 44px minimum target.
- Scope note: the spec (2.6) asks for dialog roles and Escape; a focus trap is not part of it (see Deferred).

- [ ] **Step 1: Write the failing tests.** Append to `src/components/KidPractice.test.tsx`:

```tsx
describe('KidPractice accessibility (logic-flows Medium)', () => {
  beforeEach(() => localStorage.clear());

  it('moves focus to the feedback heading, which sits in a status region', async () => {
    setup();
    await choose(correctOption(q1).label);
    const heading = screen.getByRole('heading', { name: /nice!/i });
    expect(heading).toHaveFocus();
    expect(screen.getByRole('status')).toContainElement(heading);
  });

  it('options expose selection with aria-pressed', async () => {
    setup();
    const label = q1.options[0].label;
    expect(option(label)).toHaveAttribute('aria-pressed', 'false');
    await userEvent.click(option(label));
    expect(option(label)).toHaveAttribute('aria-pressed', 'true');
  });

  it('spec 2.6: the stop confirm says answers are saved and counted', async () => {
    setup();
    await userEvent.click(screen.getByRole('button', { name: /stop for today/i }));
    expect(screen.getByText('Stop now? Your answers so far are saved and counted.')).toBeInTheDocument();
  });
});
```

Append to `src/components/QuizRunner.test.tsx`:

```tsx
describe('QuizRunner accessibility and saving (logic-flows Medium, Low)', () => {
  beforeEach(() => localStorage.clear());

  it('icon-only header buttons have real names', () => {
    renderRunner(base());
    expect(screen.getByRole('button', { name: /stop for today/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /pause timer/i })).toBeInTheDocument();
  });

  it('the question navigator is a dialog that Escape closes', async () => {
    renderRunner(base());
    await userEvent.click(screen.getByRole('button', { name: /question grid/i }));
    expect(screen.getByRole('dialog', { name: /question navigator/i })).toBeInTheDocument();
    await userEvent.keyboard('{Escape}');
    expect(screen.queryByRole('dialog', { name: /question navigator/i })).not.toBeInTheDocument();
  });

  it('the unanswered-questions confirm is a dialog that Escape closes', async () => {
    renderRunner(base());
    await userEvent.click(screen.getByRole('button', { name: /^submit$/i }));
    expect(screen.getByRole('dialog', { name: /unanswered questions/i })).toBeInTheDocument();
    await userEvent.keyboard('{Escape}');
    expect(screen.queryByRole('dialog', { name: /unanswered questions/i })).not.toBeInTheDocument();
  });

  it('logic-flows Low: answers for questions that no longer resolve are kept on the next save', async () => {
    const s0 = base();
    const s = { ...s0, answers: { ...s0.answers, 'gone-q': { selected: 'A', isCorrect: false } } };
    const h = renderRunner(s);
    const q = c.source.resolve(s.refs[0]);
    await userEvent.click(screen.getAllByText(q.options[0].text).find((e) => e.closest('button'))!);
    const last = h.onChange.mock.calls.at(-1)![0] as ActiveSession;
    expect(last.answers['gone-q']).toEqual({ selected: 'A', isCorrect: false });
  });
});
```

Append to `src/components/StudyPaceModal.test.tsx`:

```tsx
describe('StudyPaceModal accessibility (logic-flows Medium)', () => {
  beforeEach(() => localStorage.clear());

  it('is a labelled dialog that Escape closes, with associated field labels', async () => {
    seed();
    const onClose = vi.fn();
    render(<ProgressProvider><StudyPaceModal isOpen onClose={onClose} /><Probe /></ProgressProvider>);
    expect(screen.getByRole('dialog', { name: /study plan/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/student name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/testing date/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/daily questions/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /close/i })).toBeInTheDocument();
    await userEvent.keyboard('{Escape}');
    expect(onClose).toHaveBeenCalled();
  });
});
```

(add `vi` to that file's vitest import if missing.)

- [ ] **Step 2: Run and confirm failure.** Run: `npx vitest run src/components/KidPractice.test.tsx src/components/QuizRunner.test.tsx src/components/StudyPaceModal.test.tsx`. Expected: FAIL.

- [ ] **Step 3: Create `src/components/useEscapeKey.ts`.**

```ts
import { useEffect } from 'react';

/** Calls onEscape when Escape is pressed while `active`. */
export function useEscapeKey(active: boolean, onEscape: () => void): void {
  useEffect(() => {
    if (!active) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onEscape();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [active, onEscape]);
}
```

- [ ] **Step 4: `KidPractice.tsx`.** Change the React import to `import React, { useEffect, useRef, useState } from 'react';`. Above `KidPractice` add:

```tsx
/** Takes focus the moment feedback appears, so keyboard and screen-reader users land on the result. */
const FeedbackHeading: React.FC<{ className: string; children: React.ReactNode }> = ({ className, children }) => {
  const ref = useRef<HTMLHeadingElement>(null);
  useEffect(() => { ref.current?.focus(); }, []);
  return <h2 ref={ref} tabIndex={-1} className={`${className} outline-none`}>{children}</h2>;
};
```

Add `aria-pressed={Boolean(chosen)}` to the option `<button>` (after `aria-label`). Replace the answered feedback block (`<div className="space-y-4">` through its inner ternary) so the ternary sits inside a status region and uses the heading:

```tsx
          <div className="space-y-4">
            <div role="status">
              {answer.isCorrect ? (
                <FeedbackHeading className="text-2xl font-bold text-emerald-700">Nice!</FeedbackHeading>
              ) : (
                <div className="rounded-xl bg-amber-50 border border-amber-200 p-4 space-y-3">
                  <FeedbackHeading className="text-lg font-semibold text-amber-900">Not quite. The answer is {right.label}.</FeedbackHeading>
                  <ol className="list-decimal pl-5 space-y-1 text-slate-800">
                    {q.explanation.stepByStep.map((step, i) => <li key={i}>{step}</li>)}
                  </ol>
                  {q.explanation.commonMisconception && (
                    <p className="text-sm text-slate-700"><strong>Watch out:</strong> {q.explanation.commonMisconception}</p>
                  )}
                </div>
              )}
            </div>
            <button onClick={next} className="w-full rounded-xl bg-blue-600 px-4 py-3 text-lg font-semibold text-white hover:bg-blue-700">
              {isLast ? 'Finish' : 'Next'}
            </button>
          </div>
```

Change `<p className="text-sm text-slate-700">Stop and save your progress?</p>` to `<p className="text-sm text-slate-700">Stop now? Your answers so far are saved and counted.</p>`. Add `min-h-[44px]` to the two header buttons' class lists (Scratchpad, Calculator) and to `Yes, stop` / `Keep going`.

- [ ] **Step 5: `QuizRunner.tsx`.** Import `useEscapeKey` (`import { useEscapeKey } from './useEscapeKey';`). Directly after the `showConfirmSubmit` state add:

```tsx
  useEscapeKey(showNavigator, () => setShowNavigator(false));
  useEscapeKey(showConfirmSubmit, () => setShowConfirmSubmit(false));
```

Replace the `snapshot` body's first lines so unknown answers survive:

```tsx
  const snapshot = (): ActiveSession => {
    const saved: Record<string, SessionAnswer> = {};
    // Keep answers whose question no longer resolves: dropping them would lose them for good.
    const known = new Set(questions.map((q) => q.id));
    for (const [id, a] of Object.entries(session.answers)) if (!known.has(id)) saved[id] = a;
    for (const q of questions) {
      const sel = answers[q.id];
      if (sel?.trim()) saved[q.id] = { selected: sel, isCorrect: checkAnswer(q, sel) };
    }
    return { ...session, answers: saved, flagged, currentIndex, secondsElapsed: secondsRef.current };
  };
```

On the back button add `aria-label="Stop for today, your progress is saved"` and `min-h-[44px] min-w-[44px]`; on the timer button add `aria-label={isPaused ? \`Resume timer, paused at ${formatTime(secondsElapsed)}\` : \`Pause timer, ${formatTime(secondsElapsed)} elapsed\`}` and `min-h-[44px]`; on the Scratchpad button add `min-h-[44px]`. On the navigator overlay's inner card `<div className="bg-white rounded-3xl p-6 shadow-2xl ... max-w-xl ...">` add `role="dialog" aria-modal="true" aria-label="Question navigator"` and `aria-label="Close question navigator"` on its `X` button; on the confirm-submit inner card add `role="dialog" aria-modal="true" aria-label="Unanswered questions"`.

- [ ] **Step 6: `Scratchpad.tsx` and `Calculator.tsx`.** In each, `import { useEscapeKey } from './useEscapeKey';` and call `useEscapeKey(isOpen, onClose);` as the first line of the component body (before the `if (!isOpen) return null`). Add to the overlay's inner card (Scratchpad: the `<div className="bg-white rounded-2xl shadow-2xl ... h-[85vh] ...">`; Calculator: the element directly under its fixed overlay): `role="dialog" aria-modal="true" aria-label="Scratchpad"` / `aria-label="Calculator"`, and `aria-label="Close scratchpad"` / `aria-label="Close calculator"` on each `X` close button.

- [ ] **Step 7: `StudyPaceModal.tsx`.** Import `useEscapeKey`; call `useEscapeKey(isOpen, onClose);` directly above `if (!isOpen) return null;` (after the `useState` calls). Give the inner card `role="dialog" aria-modal="true" aria-labelledby="pace-title"`, the `<h3>` `id="pace-title"`, the header `X` button `aria-label="Close"`, and correct the date label text to keep `Testing Date` matched: leave the label text as is (it already contains "Testing Date").

- [ ] **Step 8: Run and verify.** Run: `npm run test:run`, `npm run typecheck`, `npm run lint`. Expected: PASS.

- [ ] **Step 9: Commit.**

```bash
git add src/components
git commit -m "feat: kid mode focus and status, aria-pressed, dialog semantics and Escape, stop copy" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01X5HSDdHPWxvHxgBaoSTbLX"
```

---

### Task 19: Deploy only after CI passes (logic-flows Process, spec 2.7)

**Files:**
- Modify: `.github/workflows/deploy.yml`
- Create: `src/ciWorkflow.test.ts`
- Modify: `README.md` (the CI/deploy paragraphs)

**Interfaces:**
- Consumes: `ci.yml`'s workflow name `CI`.
- Produces: `deploy.yml` triggers on `workflow_run` of `CI` (branch `master`, completed) and builds only when its conclusion is `success`, checking out the exact commit CI tested. `workflow_dispatch` is removed on purpose: a manual dispatch would bypass the gate (to redeploy, re-run the deploy workflow from the Actions page, or push).

- [ ] **Step 1: Write the failing test.** `src/ciWorkflow.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import ci from '../.github/workflows/ci.yml?raw';
import deploy from '../.github/workflows/deploy.yml?raw';

describe('deploy gate (logic-flows Process)', () => {
  it('CI is named CI, so deploy can depend on it', () => {
    expect(ci).toMatch(/^name: CI$/m);
  });

  it('deploy runs only after CI completes on master, never directly on push', () => {
    expect(deploy).toMatch(/workflow_run:/);
    expect(deploy).toMatch(/workflows: \["CI"\]/);
    expect(deploy).toMatch(/types: \[completed\]/);
    expect(deploy).toMatch(/branches: \[master\]/);
    expect(deploy).not.toMatch(/^\s{2}push:/m);
    expect(deploy).not.toMatch(/workflow_dispatch/);
  });

  it('only a successful CI run builds, and it builds the tested commit', () => {
    expect(deploy).toMatch(/github\.event\.workflow_run\.conclusion == 'success'/);
    expect(deploy).toMatch(/ref: \$\{\{ github\.event\.workflow_run\.head_sha \}\}/);
  });
});
```

- [ ] **Step 2: Run and confirm failure.** Run: `npx vitest run src/ciWorkflow.test.ts`. Expected: FAIL (deploy still triggers on push).

- [ ] **Step 3: Edit `.github/workflows/deploy.yml`.** Replace the `on:` block with:

```yaml
on:
  workflow_run:
    workflows: ["CI"]
    types: [completed]
    branches: [master]
```

and change the `build` job header and checkout to:

```yaml
jobs:
  build:
    # Red CI never publishes.
    if: ${{ github.event.workflow_run.conclusion == 'success' }}
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          ref: ${{ github.event.workflow_run.head_sha }}
```

(the rest of the `build` steps and the `deploy` job stay as they are).

- [ ] **Step 4: README.** In the "Tests and checks" section replace the sentence about `ci.yml` with: "`.github/workflows/ci.yml` runs lint, typecheck, `test:run`, and build on every pull request and on pushes to `master`." (unchanged) and in "Live Site" replace "by `.github/workflows/deploy.yml` on every push to `master`" with "by `.github/workflows/deploy.yml`, which runs only after the CI workflow succeeds on `master` (a red CI never publishes; to redeploy, re-run the deploy workflow from the Actions page)".

- [ ] **Step 5: Full verification.** Run: `npm run test:run`, `npm run typecheck`, `npm run lint`, `npm run build`. Expected: PASS. Then a manual smoke in the browser (`npm run dev`, open the printed `/ncmathssa/` URL):
  - grade 3 profile, a number-line item: the marker `P` sits under the right tick in kid mode;
  - open two tabs, answer in one, change the test date in the other, reload both: both changes present;
  - DevTools Application > Local Storage: set `nc_math_ssa_prep_state_v2` to `{bad`, reload: app starts fresh and an `ncmathssa_corrupt_...` key holds `{bad`;
  - a 7-day test date with no work: "Round 1 ... (skipped)", pace never "Ahead".
  Record any deviation as a fix before committing.

- [ ] **Step 6: Commit.**

```bash
git add .github/workflows/deploy.yml src/ciWorkflow.test.ts README.md
git commit -m "ci: deploy only after CI succeeds on master" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01X5HSDdHPWxvHxgBaoSTbLX"
```

---

## Spec coverage

| Spec section / finding | Task |
|---|---|
| 2.1 One source of truth for thresholds (`isPassing`, `masteryStatus`, `readinessStatus`, `formatPercent`, no round-before-compare) | 6, 8, 9 |
| 2.2 Readiness scaled by evidence | 7 |
| 2.3 Dashboard "Ready" from status (F4) | 8 |
| 2.3 "Strong today" needs 3 answers, "Also practiced" (F9) | 14 |
| 2.3 SSA pass banner and confetti only for practice tests (F10) | 15 |
| 2.3 "Ready to try for SSA" most recent test; repeat-form note (F6) | 16 |
| 2.3 "Quizzes taken" current grade (F14) | 17 |
| 2.4 Short-on-time pace and path markers (F1) | 2 |
| 2.4 Pace start date from current-grade attempts (F12) | 17 |
| 2.4 Round windows exclude due-review answers, `origin` flag (F8) | 13 |
| 2.4 Day key in day-dependent memos (F11) | 17 |
| 2.4 Weeks-left copy (F13) | 17 |
| 2.4 "N not answered" apart from "N missed" (F15) | 14 |
| 2.5 `normaliseState`, repair on load (logic-flows High x2) | 3 |
| 2.5 Corrupt-blob backup | 3 |
| 2.5 No save-on-mount | 10 |
| 2.5 Root ErrorBoundary (Export, Start over) | 4 |
| 2.5 Multi-tab merge (pure, unit-tested) and `storage` events, attempt-id suffix | 11, 12 |
| 2.5 `saveState` `{ ok }`, blocked-storage fallback, not-saving banner | 10 |
| 2.5 `StudyPaceModal` mounts only while open (logic-flows High) | 5 |
| 2.6 KidPractice `promptDetails` display (content-g3 Critical, and QuizRunner/Results/WeakSpots HIGH) | 1 |
| 2.6 Focus to feedback, `role="status"`, `aria-pressed`, `aria-label`s, dialogs with Escape, stop copy | 18 |
| 2.7 CI deploy gate (logic-flows Process) | 19 |
| Section 5 cross-screen readiness fixture | 9 |
| F2 (High) | 7 |
| F3 (High) | 6, 8, 9 |
| F5 (Medium) | 6 |
| F7 (Medium): decision is to keep round exits on the recent window and label topics from lifetime accuracy, explained on the home page and pinned by a test (spec is silent) | 8 |
| logic-flows Medium: quota/blocked storage banner | 10 |
| logic-flows Medium: "saved answers are option labels, content edits change meaning" | Plan B1 (`contentVersion`), not this plan |
| logic-flows Medium: focus after Check, aria-live, `aria-pressed` | 18 |
| logic-flows Medium: icon-button names, dialog roles, StudyPaceModal `htmlFor` | 5, 18 |
| logic-flows Low: answers for unresolved refs dropped on save | 18 |
| logic-flows Low: attempt ids not unique across tabs | 11 |
| logic-flows Low: Stop copy | 18 |

## Deferred

- logic-flows Low, timer: elapsed seconds are saved only on interaction, background-tab tick under-counts, pause is not persisted. Fixing it means storing timestamps and deriving elapsed time; the spec is silent and the "timers over time" E2E scenario is out of scope. A reload can lose the seconds since the last click.
- Focus trapping inside overlays and 44px targets on non-header controls (logic-flows Medium a11y): spec 2.6 specifies dialog roles and Escape only, which Task 18 delivers; header icon buttons get the 44px target. Trap and the remaining targets are left for a later accessibility pass.
- Per-standard percent labels in `CurriculumView` and `PrintReportModal` still use `Math.round` for display (no threshold decision depends on them; not an audit finding).
- The review queue is not merged key by key across tabs (Task 11 documents why); attempts, which drive mastery and readiness, are fully merged.
