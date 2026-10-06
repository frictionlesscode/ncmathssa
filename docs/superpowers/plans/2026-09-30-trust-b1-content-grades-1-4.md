# Trust B1: Content Grades 1 to 4 and the contentVersion Mechanism Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Answers recorded against old content stop counting toward mastery, the trapezoid is exclusive in every grade, and every Critical, High and Medium content finding for grades 1 to 4 (plus the NC grade 1 to 4 rules) is fixed and pinned by a regression test that cites it.

**Architecture:** One small engine mechanism first: an optional `contentVersion` on authored questions and generator templates, recorded per answer on attempts and per question on saved sessions, read by `masteryByStandard` and `resolveSession`. Everything after it is content: authored items are rewritten in place (ids kept, `contentVersion: 2` where the key, options or math changed), generators are constrained at the source, study guides are corrected, and one cross-grade sweep test per NC rule keeps the fixes from drifting. Each task ends green, so the branch is releasable after any task.

**Tech Stack:** TypeScript, Vitest (`assertTemplateSound` runs fast-check over every generator), Testing Library, oxlint, Vite.

**Spec:** `docs/superpowers/specs/2026-09-30-quality-and-trust-design.md` (section 3.1 rules, 3.2 rewrites, 3.3 answers recorded against old content). Inputs: `docs/superpowers/audits/2026-09-30/content-g1.md` to `content-g4.md` and `docs/superpowers/audits/2026-09-30/nc-rules.md`.

## Global Constraints

- Commit trailer lines (end every commit message with both):
  `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`
  `Claude-Session: https://claude.ai/code/session_01X5HSDdHPWxvHxgBaoSTbLX`
- Commands: tests `npx vitest run <path>`, all tests `npm run test:run`, types `npm run typecheck`, lint `npm run lint`, build `npm run build`.
- Passing bar is always `curriculum.ssa.passingPercent`, never a literal 80 in logic.
- Question ids never change.
- **contentVersion policy (spec 3.3).** `contentVersion` is optional, absent means 1. Bump it to 2 on an authored question or a template only when its key, its options or its math changed. A wording-only fix (a typo, a comment, an explanation sentence) does not bump it. Recording is on every answer, so a bump costs the child that one question's history in the mastery math, nothing else; history screens still list every answer.
- **Coexistence with Plan A (built before this plan).** Plan A's Task 13 adds `type AnswerOrigin = 'new' | 'review'`, `QuizAttemptAnswer.origin?: AnswerOrigin`, and `ActiveSession.origins?: Record<string, AnswerOrigin>` (keyed by `Question.id`, only `'review'` stored). This plan adds two independent optional fields beside them: `QuizAttemptAnswer.contentVersion?: number` and `ActiveSession.versions?: Record<string, number>` (also keyed by `Question.id`). Neither feature reads or writes the other's field, `sessionToAttempt` gains one more property line, and `src/engine/contentVersion.test.ts` pins that an answer carrying `origin` is still counted. Plan A's `normaliseSession` spreads the stored session, so `versions` survives a reload; a malformed `versions` cannot crash `resolveSession` (pinned).
- **Applying the diffs.** The code below is given as unified-diff hunks against the tree as it stood before Plan A, and as whole files for new files. The `-` lines and the context lines identify the construct; if a hunk's surrounding lines have moved because an earlier plan touched the file, apply the change to the same construct. To apply a hunk with the Edit tool, `old_string` is the context plus the `-` lines with their prefix removed, and `new_string` is the context plus the `+` lines. Find every edit by its text, never by a line number. Working-tree files are CRLF (`core.autocrlf=true`, index is LF); if the Edit tool cannot match a multi-line block, edit it line by line, and never rewrite line endings of a file you did not change.
- **A tag lives and dies with its content.** `src/curriculum/misconceptions.test.ts` fails on an undeclared tag and on an orphan (declared, used nowhere). A task that adds a tag also adds the first use, and a task that removes the last use deletes the entry, in the same task.
- **Solve before you write.** Every rewritten item has its working in a comment beside the options, every distractor's value follows from its misconception tag, and that tag exists in the registry. The correct-option position is kept varied (no answer-shape tell).
- **Scope.** Grade 5 is Plan B2's except for the trapezoid item `g3-02`, the `NC.5.G.3` hierarchy keyConcept, and the trapezoid lines of the `NC.5.G.3` guide (Task 5 here). The KidPractice display bug and the promptDetails overflow in QuizRunner, QuizResults and WeakSpots are Plan A's (its `PromptDetails` component).
- `tsconfig.app.json` has `noUnusedLocals`, `noUnusedParameters` and `verbatimModuleSyntax`. `npm run lint` reports existing warnings in untouched files; add none.
- Test naming: every regression test name cites the finding or rule (`High g1-g2-02: ...`, `g3-g1-05: NC-R2 ...`, `NC-R12a ...`).

## Review Focus

Failure modes the spec implies that a per-item test would not catch, most likely first. Each has a test in the task that owns the code.

1. **A saved session or stored answer with no version, or a garbled one.** Sessions and attempts saved before this change have no version at all, and a hand-edited or foreign blob may hold a string, a number, `null` or an array. Absent means 1 everywhere, and nothing may throw. Pinned in Task 1 (`does not crash on a malformed versions value`, `treats a saved session with no versions as version 1 everywhere`, `treats an old stored answer with no version as version 1`).
2. **One rewritten question inside a 15-question session.** The spec says the whole session shows the "can't continue" screen, not that the one question is skipped or silently replaced (which would change what the child sees mid-session and make the score meaningless). Pinned in Task 1 for the engine and for both runners (`staleSession.test.tsx`).
3. **A child's old answers to an item that just flipped its key.** Under the old key a correct answer to the trapezoid item was "a square is a trapezoid". That answer must not count toward the new key's mastery, and a version-2 answer must. Pinned on the real items in Task 5 (`answers recorded against the inclusive key stop counting`).
4. **A generator whose draw space shrinks.** Capping `nbt5` at 89 (170 draws), capping `oa1` per context, and restricting the odd/even draws must never leave an empty pool, a colliding option, or a question whose stated fact is false for the drawn numbers. Pinned in Tasks 7, 9 and 13 with 500-plus-seed sweeps that recompute the truth from the prompt alone.
5. **A second true answer or a tell created by an edit.** Replacing a distractor can make it true by subset (a square is a rectangle) or make the key stand out (uniquely longest, the only option with a different conclusion). Pinned in Task 6 (no rectangle beside a square), Task 9 (two of four sentences end "even", two "odd", exactly one true by recomputation) and Task 12 (the key is never the uniquely longest option in the six flagged items).

---

## File map

| File | Change | Task |
|---|---|---|
| `src/engine/questionModel.ts`, `template.ts`, `questionSource.ts` | `contentVersion`, `contentVersionOf`, `versionOf` | 1 |
| `src/types/index.ts`, `src/engine/mastery.ts`, `src/engine/activeSession.ts`, `src/App.tsx` | record and read versions | 1 |
| `src/engine/contentVersion.test.ts`, `src/components/staleSession.test.tsx`, `src/App.contentVersion.test.tsx` | Create | 1 |
| `src/curriculum/ncRules.grades1to4.test.ts` | Create: NC-R12a/b, R13a/b/c, R14 sweep | 2 |
| `src/curriculum/grade3/authored.nf.ts` (g3-nf4-03), `src/curriculum/grade4/authored.nf.ts` (g4-nf4-02) | rewrite two off-scope items | 2 |
| `src/curriculum/misconceptions.ts` | tags: `inclusive-trapezoid-definition` (3), `mixed-up-trapezoid-and-parallelogram` (4), remove `exclusive-trapezoid-definition` (5), `said-the-same-number-twice-while-counting` (7), three odd/even tags (8), `swapped-the-words-odd-and-even` (9) | 3 to 9 |
| `src/curriculum/grade3/authored.g.ts`, `studyGuides.ts` | trapezoid | 3 |
| `src/curriculum/grade4/authored.g.ts`, `studyGuides.ts` | trapezoid, impossible triangle | 4 |
| `src/curriculum/grade5/authored.ts`, `standards.ts`, `studyGuides.ts`, `src/curriculum/trapezoid.test.ts` | trapezoid, sweep | 5 |
| `src/curriculum/grade1/*` | authored, guides, mock, generators | 6, 7 |
| `src/curriculum/grade2/*` | authored, tags, generators | 8, 9 |
| `src/curriculum/grade3/*` | authored, guides, NBT parent name, generators | 10, 11 |
| `src/curriculum/grade4/*` | authored, guides, generators | 12, 13 |
| `src/curriculum/gradeN/audit.test.ts` (N = 1, 2, 3, 4) | Create: one regression test per audit finding | 6, 8, 10, 12 |

---

### Task 1: The contentVersion mechanism (spec 3.3)

**Files:**
- Modify: `src/engine/questionModel.ts`, `src/engine/template.ts`, `src/engine/questionSource.ts`, `src/types/index.ts`, `src/engine/mastery.ts`, `src/engine/activeSession.ts`, `src/App.tsx`
- Create: `src/engine/contentVersion.test.ts`, `src/components/staleSession.test.tsx`, `src/App.contentVersion.test.tsx`

**Interfaces:**
- Consumes: `QuestionSource.resolve`, `parseQuestionRef`, `questionRefId`, `masteryByStandard`, `resolveSession`, `sessionToAttempt`, `App`'s `begin`.
- **Assumed shape from Plan A (spec 2.4, its Task 13), which this task must not disturb:** `type AnswerOrigin = 'new' | 'review'` in `src/types/index.ts`; `QuizAttemptAnswer.origin?: AnswerOrigin` (only `'review'` is written, absent means `'new'`); `ActiveSession.origins?: Record<string, AnswerOrigin>` keyed by `Question.id`, written by `pathSession`; `newSession` accepting `origins?`; `sessionToAttempt` appending `...(s.origins?.[q.id] === 'review' ? { origin: 'review' as const } : {})` after `flaggedForReview`. The version fields below are separate optional fields keyed the same way, so the two features compose: a session carries both `origins` and `versions`, an answer carries both `origin` and `contentVersion`, and `masteryByStandard` (all answers, filtered by version) and Plan A's round-exit windows (filtered by origin) never read each other's field. When editing `sessionToAttempt`, add the `contentVersion` line directly after the existing `flaggedForReview: s.flagged[q.id],` line, whatever Plan A has already appended after it. If Plan A's names differ, keep the two fields independent and adjust only the test `coexists with an origin flag on the answer (Plan A shape)`.
- Produces:
  - `Question.contentVersion?: number` and `QuestionTemplate.contentVersion?: number` (absent means 1; `realize` copies a template's version onto its questions only when it is above 1).
  - `contentVersionOf(x: { contentVersion?: number }): number` in `src/engine/questionModel.ts`. Returns `x.contentVersion` when it is an integer of at least 1, otherwise 1. It is the only place the default lives.
  - `QuestionSource.versionOf(ref: QuestionRef): number | undefined`: an authored item's own version, or the template's version for a generated ref, without realizing it; `undefined` when the ref names nothing.
  - `QuizAttemptAnswer.contentVersion?: number`, written by `sessionToAttempt` on every graded answer.
  - `isCurrentAnswer(ans: { questionId?: string; contentVersion?: number }, c: GradeCurriculum): boolean` in `src/engine/mastery.ts`. False only when the source knows the question and its current version differs from the answer's (absent means 1). `masteryByStandard` skips answers for which it is false. `path.ts` and `sessionSummary.ts` are not changed (spec 3.3 names only `masteryByStandard`; Plan A owns `path.ts`).
  - `ActiveSession.versions?: Record<string, number>` keyed by `Question.id`; `stampContentVersions(s: ActiveSession, c: GradeCurriculum): ActiveSession`, called once in `App`'s `begin`; `resolveSession` returns `[]` when any resolvable question's current version differs from `s.versions?.[q.id] ?? 1`, so both runners show their existing "can't continue" screen for the whole session.

- [ ] **Step 1: Write the failing tests**

**Create `src/App.contentVersion.test.tsx`**

```tsx
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { App } from './App';
import { DISCLAIMER_STORAGE_KEY, DISCLAIMER_VERSION } from './components/DisclaimerGate';
import { newProfile, saveState, loadState } from './state/storage';
import { questionRefId } from './engine/questionModel';

// Spec 3.3: every session records the content version of each of its
// questions the moment it starts, so a later deploy that rewrites one is
// noticed on resume.

describe('starting a session', () => {
  beforeEach(() => localStorage.clear());

  it('stamps the content version of every question (spec 3.3)', async () => {
    localStorage.setItem(
      DISCLAIMER_STORAGE_KEY,
      JSON.stringify({ version: DISCLAIMER_VERSION, acceptedAt: '2026-09-30T00:00:00.000Z' }),
    );
    const p = newProfile({ id: 'a', studentName: 'Alex', checkupSkipped: true, sessionSize: 5 });
    saveState(localStorage, { version: 2, profiles: [p], activeProfileId: 'a' });
    render(<App />);
    await userEvent.click(screen.getByRole('button', { name: /start today's practice \(round 1\)/i }));
    const s = loadState(localStorage).profiles[0].activeSession!;
    expect(Object.keys(s.versions ?? {}).sort()).toEqual(s.refs.map((r) => questionRefId(r)).sort());
    expect(Object.values(s.versions!).every((v) => v === 1)).toBe(true);
  });
});
```

**Create `src/components/staleSession.test.tsx`**

```tsx
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ProgressProvider } from '../context/ProgressContext';
import { KidPractice } from './KidPractice';
import { QuizRunner } from './QuizRunner';
import { getCurriculum } from '../curriculum/registry';
import { newSession, type ActiveSession } from '../engine/activeSession';

// Spec 3.3: a saved session whose question was rewritten since it started
// shows the existing "can't continue" discard screen, in both runners. The
// recorded version is set to 99 so this needs no rewritten content: the
// shipped Grade 5 items are version 1.

const c = getCurriculum(5);
const ids = c.quizzes.find((q) => q.isDiagnostic)!.questionIds.slice(0, 2);
const refs = ids.map((id) => ({ kind: 'authored' as const, id }));
const started = (kind: ActiveSession['kind']) =>
  newSession({ kind, quizId: 'x', title: 'x', refs, now: new Date('2026-09-30T12:00:00Z') });

describe('a session whose question was rewritten cannot continue', () => {
  beforeEach(() => localStorage.clear());

  it('KidPractice shows the discard screen', async () => {
    const onDiscard = vi.fn();
    render(
      <ProgressProvider>
        <KidPractice
          session={{ ...started('practice'), versions: { [ids[0]]: 99, [ids[1]]: 1 } }}
          studentName="Alex" onChange={vi.fn()} onFinish={vi.fn()} onDiscard={onDiscard}
        />
      </ProgressProvider>,
    );
    expect(screen.getByText(/can.t continue/i)).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: /discard this session/i }));
    expect(onDiscard).toHaveBeenCalledTimes(1);
  });

  it('QuizRunner shows the discard screen', async () => {
    const onDiscard = vi.fn();
    render(
      <ProgressProvider>
        <QuizRunner
          session={{ ...started('checkup'), versions: { [ids[0]]: 99 } }}
          onChange={vi.fn()} onFinish={vi.fn()} onPause={vi.fn()} onDiscard={onDiscard}
        />
      </ProgressProvider>,
    );
    expect(screen.getByText(/can't continue/i)).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: /discard/i }));
    expect(onDiscard).toHaveBeenCalledTimes(1);
  });

  it('a session with matching versions, or with none recorded, still runs', () => {
    render(
      <ProgressProvider>
        <QuizRunner session={started('checkup')} onChange={vi.fn()} onFinish={vi.fn()} onPause={vi.fn()} onDiscard={vi.fn()} />
      </ProgressProvider>,
    );
    expect(screen.queryByText(/can't continue/i)).not.toBeInTheDocument();
  });
});
```

**Create `src/engine/contentVersion.test.ts`**

```ts
import { describe, it, expect } from 'vitest';
import { getCurriculum } from '../curriculum/registry';
import type { GradeCurriculum } from '../curriculum/types';
import type { QuizAttempt, QuizAttemptAnswer } from '../types';
import { contentVersionOf, correctOption, labelOptions, type Question } from './questionModel';
import { makeQuestionSource } from './questionSource';
import { realize, type QuestionTemplate } from './template';
import { makeRng } from './rng';
import { isCurrentAnswer, masteryByStandard } from './mastery';
import {
  newSession, recordAnswer, resolveSession, sessionToAttempt, stampContentVersions,
} from './activeSession';

const base = getCurriculum(5);
const CODE = 'NC.5.NF.1';

function item(id: string, contentVersion?: number): Question {
  return {
    id, standardCode: CODE, domainId: 'NF', prompt: `prompt ${id}`,
    options: labelOptions([
      { text: 'right', isCorrect: true },
      { text: 'wrong', isCorrect: false, misconception: 'added-denominators' },
    ]),
    calculatorAllowed: false, isStretch: false, difficulty: 'mastery',
    explanation: { stepByStep: ['s'], conceptSummary: 'c' },
    ...(contentVersion === undefined ? {} : { contentVersion }),
  };
}

const template = (contentVersion?: number): QuestionTemplate => ({
  id: 't.cv', standardCode: CODE, domainId: 'NF', difficulty: 'mastery',
  calculatorAllowed: false, isStretch: false,
  ...(contentVersion === undefined ? {} : { contentVersion }),
  generate: () => ({
    prompt: 'p', options: labelOptions([
      { text: '1', isCorrect: true }, { text: '2', isCorrect: false, misconception: 'added-denominators' },
    ]),
    explanation: { stepByStep: ['s'], conceptSummary: 'c' }, answerText: '1',
  }),
});

/** Grade 5 with a bank of two authored items (one rewritten to v2) and one v2 template. */
function curriculumWith(authored: Question[], t: QuestionTemplate[] = []): GradeCurriculum {
  return { ...base, source: makeQuestionSource(authored, t) };
}

const answer = (questionId: string, isCorrect: boolean, contentVersion?: number): QuizAttemptAnswer => ({
  questionId, studentAnswer: 'A', isCorrect, standardCode: CODE,
  ...(contentVersion === undefined ? {} : { contentVersion }),
});

const attemptOf = (...answers: QuizAttemptAnswer[]): QuizAttempt => ({
  id: 'a1', quizId: 'q', quizTitle: 't', completedAt: '2026-09-30T12:00:00.000Z',
  scoreRaw: 0, scoreTotal: answers.length, scorePercent: 0, isPassingSSA: false, timeElapsedSeconds: 1,
  answers: Object.fromEntries(answers.map((a) => [a.questionId, a])),
});

describe('contentVersionOf (spec 3.3)', () => {
  it('defaults to 1 and rejects nonsense', () => {
    expect(contentVersionOf({})).toBe(1);
    expect(contentVersionOf({ contentVersion: 3 })).toBe(3);
    expect(contentVersionOf({ contentVersion: 0 })).toBe(1);
    expect(contentVersionOf({ contentVersion: 1.5 })).toBe(1);
    expect(contentVersionOf({ contentVersion: Number.NaN })).toBe(1);
  });
});

describe('QuestionSource.versionOf', () => {
  const c = curriculumWith([item('old'), item('new', 2)], [template(3)]);
  it('reads an authored item, a template and an unknown id', () => {
    expect(c.source.versionOf({ kind: 'authored', id: 'old' })).toBe(1);
    expect(c.source.versionOf({ kind: 'authored', id: 'new' })).toBe(2);
    expect(c.source.versionOf({ kind: 'generated', templateId: 't.cv', seed: 9 })).toBe(3);
    expect(c.source.versionOf({ kind: 'authored', id: 'gone' })).toBeUndefined();
    expect(c.source.versionOf({ kind: 'generated', templateId: 'gone', seed: 1 })).toBeUndefined();
  });

  it('realize carries a template version onto the question and omits the default', () => {
    expect(realize(template(3), 1, makeRng(1)).contentVersion).toBe(3);
    expect('contentVersion' in realize(template(), 1, makeRng(1))).toBe(false);
    expect('contentVersion' in realize(template(1), 1, makeRng(1))).toBe(false);
  });
});

describe('masteryByStandard ignores answers recorded against an older version', () => {
  const c = curriculumWith([item('old'), item('new', 2)], [template(3)]);
  const total = (attempts: QuizAttempt[]) => masteryByStandard(attempts, c).get(CODE)!;

  it('drops a v1 answer to a question that is now v2, and keeps a matching v2 answer', () => {
    expect(total([attemptOf(answer('new', false, 1))]).total).toBe(0);
    const kept = total([attemptOf(answer('new', true, 2))]);
    expect(kept.total).toBe(1);
    expect(kept.correct).toBe(1);
  });

  it('treats an old stored answer with no version as version 1', () => {
    expect(total([attemptOf(answer('new', true))]).total).toBe(0); // question is v2 now
    expect(total([attemptOf(answer('old', true))]).total).toBe(1); // question is still v1
  });

  it('applies to generated ids through the template version', () => {
    expect(total([attemptOf(answer('t.cv#7', true, 1))]).total).toBe(0);
    expect(total([attemptOf(answer('t.cv#7', true, 3))]).total).toBe(1);
  });

  it('keeps an answer whose id the source no longer knows', () => {
    expect(isCurrentAnswer({ questionId: 'gone', contentVersion: 1 }, c)).toBe(true);
    expect(total([attemptOf(answer('gone', true))]).total).toBe(1);
  });

  it('does not mutate the stored attempts, so history can still list stale answers', () => {
    const attempts = [attemptOf(answer('new', true, 1))];
    total(attempts);
    expect(Object.keys(attempts[0].answers)).toEqual(['new']);
  });

  it('coexists with an origin flag on the answer (Plan A shape)', () => {
    const withOrigin = { ...answer('old', true, 1), origin: 'review' } as QuizAttemptAnswer;
    expect(total([attemptOf(withOrigin)]).total).toBe(1);
  });
});

describe('sessions record and check content versions', () => {
  const refsOf = (...ids: string[]) => ids.map((id) => ({ kind: 'authored' as const, id }));
  const started = (c: GradeCurriculum, ...ids: string[]) =>
    stampContentVersions(
      newSession({ kind: 'practice', quizId: 'p', title: 't', refs: refsOf(...ids), now: new Date() }),
      c,
    );

  it('stamps the version of every question when a session starts', () => {
    const c = curriculumWith([item('old'), item('new', 2)]);
    expect(started(c, 'old', 'new').versions).toEqual({ old: 1, new: 2 });
  });

  it('resumes a session whose questions are unchanged', () => {
    const c = curriculumWith([item('old'), item('new', 2)]);
    expect(resolveSession(started(c, 'old', 'new'), c).map((q) => q.id)).toEqual(['old', 'new']);
  });

  it('cannot resume a session once one of its questions was rewritten', () => {
    const before = curriculumWith([item('a'), item('b')]);
    const s = started(before, 'a', 'b');
    const after = curriculumWith([item('a'), item('b', 2)]);
    expect(resolveSession(s, after)).toEqual([]);
  });

  it('treats a saved session with no versions as version 1 everywhere', () => {
    const legacy = newSession({ kind: 'practice', quizId: 'p', title: 't', refs: refsOf('a', 'b'), now: new Date() });
    expect(legacy.versions).toBeUndefined();
    expect(resolveSession(legacy, curriculumWith([item('a'), item('b')]))).toHaveLength(2);
    expect(resolveSession(legacy, curriculumWith([item('a'), item('b', 2)]))).toEqual([]);
  });

  // Review Focus 2: a stored blob edited by hand, or written by another build.
  it('does not crash on a malformed versions value', () => {
    const c = curriculumWith([item('a'), item('b')]);
    const s = newSession({ kind: 'practice', quizId: 'p', title: 't', refs: refsOf('a', 'b'), now: new Date() });
    for (const versions of ['oops', 7, null, [], { a: 'x' }, { a: -3 }]) {
      const bad = { ...s, versions } as unknown as typeof s;
      expect(() => resolveSession(bad, c)).not.toThrow();
    }
    // A string, number, null or array carries no version for any question, so
    // every question counts as version 1 and the session resumes.
    for (const versions of ['oops', 7, null, []]) {
      expect(resolveSession({ ...s, versions } as unknown as typeof s, c)).toHaveLength(2);
    }
    // A version that is not 1 for a question that is 1 is stale.
    expect(resolveSession({ ...s, versions: { a: 'x' } } as unknown as typeof s, c)).toEqual([]);
  });

  it('still skips a ref that no longer resolves, without calling the session stale', () => {
    const c = curriculumWith([item('a')]);
    expect(resolveSession(started(c, 'a', 'gone'), c).map((q) => q.id)).toEqual(['a']);
  });

  it('records the version on each graded answer', () => {
    const c = curriculumWith([item('a'), item('b', 2)]);
    const s0 = started(c, 'a', 'b');
    const [qa, qb] = resolveSession(s0, c);
    const s = recordAnswer(recordAnswer(s0, qa, correctOption(qa).label), qb, correctOption(qb).label);
    const attempt = sessionToAttempt(s, [qa, qb], 80, new Date(), { answeredOnly: false });
    expect(attempt.answers.a.contentVersion).toBe(1);
    expect(attempt.answers.b.contentVersion).toBe(2);
    // and the mastery reader accepts what the grader wrote
    expect(masteryByStandard([attempt], c).get(CODE)!.total).toBe(2);
  });
});
```


- [ ] **Step 2: Run them to verify they fail**

Run: `npx vitest run src/App.contentVersion.test.tsx src/components/staleSession.test.tsx src/engine/contentVersion.test.ts`
Expected: FAIL, 17 failed | 3 passed (20) (`contentVersionOf`, `versionOf`, `stampContentVersions`, `isCurrentAnswer` are not exported yet, and nothing stamps a session).

- [ ] **Step 3: Implement**

**Modify `src/App.tsx`**

```diff
@@ -15,7 +15,7 @@ import type { QuizAttempt, QuizDefinition } from './types';
 import { parseQuestionRef } from './engine/questionModel';
 import { buildPath, type NextStep, type Round } from './engine/path';
 import { sessionForStep } from './engine/pathSession';
-import { sessionFromQuiz, sessionSizeOf, type ActiveSession } from './engine/activeSession';
+import { sessionFromQuiz, sessionSizeOf, stampContentVersions, type ActiveSession } from './engine/activeSession';
 import { createStandardDrill } from './engine/drills';
 import { standardsOf } from './curriculum/registry';
 
@@ -52,7 +52,7 @@ const MainApp: React.FC = () => {
     }
     setNotice(null);
     if (profile.activeSession && !window.confirm('A session is already in progress. Throw it away and start this one?')) return;
-    updateActiveProfile({ activeSession: s });
+    updateActiveProfile({ activeSession: stampContentVersions(s, curriculum) });
     setScreen({ kind: 'session' });
   };
```

**Modify `src/engine/activeSession.ts`**

```diff
@@ -1,7 +1,9 @@
 import type { DomainId, GradeCurriculum, StandardCode } from '../curriculum/types';
 import type { QuizAttempt, QuizAttemptAnswer, QuizDefinition } from '../types';
 import { checkAnswer } from '../utils/answerChecker';
-import { parseQuestionRef, type Question, type QuestionRef } from './questionModel';
+import {
+  contentVersionOf, parseQuestionRef, questionRefId, type Question, type QuestionRef,
+} from './questionModel';
 
 export type SessionKind = 'checkup' | 'practice' | 'round3' | 'practice-test' | 'drill';
 
@@ -26,6 +28,10 @@ export interface ActiveSession {
   currentIndex: number;
   startedAt: string;
   secondsElapsed: number;
+  /** contentVersion of each question (keyed by Question.id) when the session
+   *  started. Absent on sessions saved before versions existed: every
+   *  question then counts as version 1. */
+  versions?: Record<string, number>;
 }
 
 export const DEFAULT_SESSION_SIZE = 15;
@@ -79,13 +85,30 @@ export function recordAnswer(s: ActiveSession, q: Question, selected: string): A
   return { ...s, answers: { ...s.answers, [q.id]: { selected, isCorrect: checkAnswer(q, selected) } } };
 }
 
+/** Records the current content version of every question in the session, so
+ *  a later deploy that rewrites one of them is noticed on resume. Call once,
+ *  where a session starts. A ref that does not resolve is left out. */
+export function stampContentVersions(s: ActiveSession, c: GradeCurriculum): ActiveSession {
+  const versions: Record<string, number> = {};
+  for (const ref of s.refs) {
+    const v = c.source.versionOf(ref);
+    if (v !== undefined) versions[questionRefId(ref)] = v;
+  }
+  return { ...s, versions };
+}
+
 /** The session's questions, skipping any ref the current content can no
- *  longer resolve (content changed, or the student's grade changed). */
+ *  longer resolve (content changed, or the student's grade changed). A
+ *  session in which ANY question was rewritten since it started (its content
+ *  version differs from the recorded one, absent meaning 1) yields nothing,
+ *  so callers show their "can't continue" screen for the whole session. */
 export function resolveSession(s: ActiveSession, c: GradeCurriculum): Question[] {
   const out: Question[] = [];
   for (const ref of s.refs) {
     try {
-      out.push(c.source.resolve(ref));
+      const q = c.source.resolve(ref);
+      if (contentVersionOf(q) !== (s.versions?.[q.id] ?? 1)) return [];
+      out.push(q);
     } catch {
       // Unresolvable: skip. Callers show a "can't continue" state when nothing is left.
     }
@@ -124,6 +147,7 @@ export function sessionToAttempt(
       standardCode: q.standardCode,
       misconception: chosen?.misconception,
       flaggedForReview: s.flagged[q.id],
+      contentVersion: contentVersionOf(q),
     };
   }
   const total = graded.length;
```

**Modify `src/engine/mastery.ts`**

```diff
@@ -2,6 +2,7 @@ import type { StandardCode, GradeCurriculum, DomainInfo } from '../curriculum/ty
 import { domainWeight, standardsOf } from '../curriculum/registry';
 import type { QuizAttempt } from '../types';
 import { familyOf, type MisconceptionFamily } from '../curriculum/misconceptions';
+import { contentVersionOf, parseQuestionRef } from './questionModel';
 
 export type MasteryStatus = 'acceleration-ready' | 'approaching' | 'needs-focus' | 'untested';
 
@@ -25,6 +26,21 @@ export function masteryStatus(percent: number, total: number, passing: number):
   return 'needs-focus';
 }
 
+/** False when the answer was recorded against a different content version
+ *  of its question than the one shipping now (the question was rewritten), so
+ *  it says nothing about today's question. An id the source no longer knows
+ *  has nothing to compare against and is kept. History screens still list
+ *  every answer; only the mastery arithmetic skips these. */
+export function isCurrentAnswer(
+  ans: { questionId?: string; contentVersion?: number },
+  c: GradeCurriculum,
+): boolean {
+  if (!ans.questionId) return true;
+  const current = c.source.versionOf(parseQuestionRef(ans.questionId));
+  if (current === undefined) return true;
+  return contentVersionOf(ans) === current;
+}
+
 export function masteryByStandard(
   attempts: QuizAttempt[],
   c: GradeCurriculum,
@@ -39,6 +55,7 @@ export function masteryByStandard(
 
   for (const attempt of attempts) {
     for (const ans of Object.values(attempt.answers)) {
+      if (!isCurrentAnswer(ans, c)) continue; // rewritten since it was answered
       const code = (ans as { standardCode?: StandardCode }).standardCode;
       if (!code) continue;
       const m = out.get(code);
```

**Modify `src/engine/questionModel.ts`**

```diff
@@ -29,6 +29,16 @@ export interface Question {
   isStretch: boolean;
   difficulty: Difficulty;
   explanation: Explanation;
+  /** Bump when a rewrite changes the key, the options or the math. Answers
+   *  recorded against an older version stop counting toward mastery, and a
+   *  saved session built on an older version cannot be resumed. Absent means 1. */
+  contentVersion?: number;
+}
+
+/** The content version of a question, an answer or a template: absent is 1. */
+export function contentVersionOf(x: { contentVersion?: number }): number {
+  const v = x.contentVersion;
+  return typeof v === 'number' && Number.isInteger(v) && v >= 1 ? v : 1;
 }
 
 export type QuestionRef =
```

**Modify `src/engine/questionSource.ts`**

```diff
@@ -1,5 +1,5 @@
 import type { StandardCode } from '../curriculum/types';
-import type { Question, QuestionRef } from './questionModel';
+import { contentVersionOf, type Question, type QuestionRef } from './questionModel';
 import type { QuestionTemplate } from './template';
 import { realize } from './template';
 import { makeRng } from './rng';
@@ -7,6 +7,10 @@ import { makeRng } from './rng';
 export interface QuestionSource {
   itemsFor(standardCode: StandardCode, opts: { count: number; seedBase: number }): QuestionRef[];
   resolve(ref: QuestionRef): Question;
+  /** The current content version behind a ref, without realizing it: an
+   *  authored item's own version, or the template's for a generated one.
+   *  undefined when the ref no longer names anything. */
+  versionOf(ref: QuestionRef): number | undefined;
   allStandardsWithContent(): StandardCode[];
   /** Every authored item for a standard, deterministically and in full -
    *  unlike itemsFor, which samples a mix of authored and generated items.
@@ -86,6 +90,15 @@ export function makeQuestionSource(
       return realize(t, ref.seed, makeRng(ref.seed));
     },
 
+    versionOf(ref) {
+      if (ref.kind === 'authored') {
+        const q = authoredById.get(ref.id);
+        return q ? contentVersionOf(q) : undefined;
+      }
+      const t = templateById.get(ref.templateId);
+      return t ? contentVersionOf(t) : undefined;
+    },
+
     allStandardsWithContent() {
       return [...new Set([...authoredByStandard.keys(), ...templatesByStandard.keys()])];
     },
```

**Modify `src/engine/template.ts`**

```diff
@@ -17,6 +17,8 @@ export interface QuestionTemplate {
   difficulty: Difficulty;
   calculatorAllowed: boolean;
   isStretch: boolean;
+  /** Bump when the template's key, options or math change (default 1). */
+  contentVersion?: number;
   generate(rng: Rng): GeneratedQuestion;
 }
 
@@ -47,5 +49,6 @@ export function realize(t: QuestionTemplate, seed: number, rng: Rng): Question {
     isStretch: t.isStretch,
     difficulty: t.difficulty,
     explanation: g.explanation,
+    ...(t.contentVersion && t.contentVersion > 1 ? { contentVersion: t.contentVersion } : {}),
   };
 }
```

**Modify `src/types/index.ts`**

```diff
@@ -48,6 +48,9 @@ export interface QuizAttemptAnswer {
   misconception?: string;        // tag of the distractor chosen, when wrong
   timeSpentSeconds?: number;
   flaggedForReview?: boolean;
+  /** contentVersion of the question when it was answered. Absent (attempts
+   *  saved before versions existed) means 1. */
+  contentVersion?: number;
 }
 
 export interface QuizAttempt {
```


- [ ] **Step 4: Run the tests, the whole suite and the types**

Run: `npx vitest run src/App.contentVersion.test.tsx src/components/staleSession.test.tsx src/engine/contentVersion.test.ts` then `npm run test:run` then `npm run typecheck`
Expected: PASS everywhere. Nothing changed for content that has no version: every existing answer, session and question resolves as version 1.

- [ ] **Step 5: Commit**

```bash
git add src/App.contentVersion.test.tsx src/components/staleSession.test.tsx src/engine/contentVersion.test.ts src/App.tsx src/engine/activeSession.ts src/engine/mastery.ts src/engine/questionModel.ts src/engine/questionSource.ts src/engine/template.ts src/types/index.ts
git commit -m "feat: contentVersion on questions, recorded per answer and per saved session (spec 3.3)" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01X5HSDdHPWxvHxgBaoSTbLX"
```

---

### Task 2: NC-R12a and NC-R13b, and the grade 1 to 4 rules sweep

Two items break a CONFIRMED rule and the audits did not list them: `g4-nf4-02` uses sevenths (Grade 4 denominators are 2, 3, 4, 5, 6, 8, 10, 12, 100, NC-R12a) and `g3-nf4-03` compares fourths with sixths (Grade 3 comparison stays inside halves/fourths/eighths and thirds/sixths, NC-R13b). A sweep over every authored question and 200 instances of every generator found both; it also pins NC-R12b, NC-R13a, NC-R13c and NC-R14, which were already met. Plan C generalises this file into the full rules suite.

**Files:**
- Modify: `src/curriculum/grade3/authored.nf.ts` (`g3-nf4-03`), `src/curriculum/grade4/authored.nf.ts` (`g4-nf4-02`)
- Create: `src/curriculum/ncRules.grades1to4.test.ts`

**Interfaces:**
- Consumes: Task 1's `Question.contentVersion` (both items are bumped to 2), `getCurriculum`, `c.source.authoredFor`, `c.source.templates`, `c.source.resolve`.
- Produces: bumped ids `g3-nf4-03`, `g4-nf4-02`.

Working for the two rewrites. `g4-nf4-02`: 2 × 3/4 = 6/4. Priya's 6/8 is 2 × 3 over 2 × 4, which equals 3/4 (the tag `multiplied-the-denominator-too`); 2 + 3 = 5 over 4 (`added-instead-of-multiplied`); the 2 written beside 3/4 is 2 3/4 (`wrote-the-product-as-a-mixed-number`). `g3-nf4-03`: 3/4 = 6/8, which is more than 3/8, so 3/4 is farther from 0 (fourths are longer steps than eighths).

- [ ] **Step 1: Write the failing tests**

**Create `src/curriculum/ncRules.grades1to4.test.ts`**

```ts
import { describe, it, expect } from 'vitest';
import { getCurriculum } from './registry';
import type { Grade } from './types';
import type { Question } from '../engine/questionModel';

// NC rules NC-R12a/b, NC-R13a/b/c and NC-R14 from
// docs/superpowers/audits/2026-09-30/nc-rules.md, checked over every authored
// question and 200 instances of every generator. Plan C generalises this into
// the full rules suite; these are the grade 1 to 4 rules Plan B1 applies.

const SEEDS = 200;

function everyQuestion(grade: Grade): Question[] {
  const c = getCurriculum(grade);
  const out: Question[] = [];
  for (const s of c.domains.flatMap((d) => d.standards)) {
    for (const ref of c.source.authoredFor(s.code)) out.push(c.source.resolve(ref));
  }
  for (const t of c.source.templates()) {
    for (let seed = 0; seed < SEEDS; seed++) {
      out.push(c.source.resolve({ kind: 'generated', templateId: t.id, seed }));
    }
  }
  return out;
}

/** What the child is asked and what the key says. Distractors and worked steps
 *  may name other denominators (a wrong answer, a common denominator). */
const asked = (q: Question) => `${q.prompt} ${q.promptDetails ?? ''} ${q.options.find((o) => o.isCorrect)!.text}`;

const denominatorsIn = (text: string) => [...text.matchAll(/\b(\d+)\s*\/\s*(\d+)\b/g)].map((m) => Number(m[2]));

describe('NC-R12a: Grade 4 fraction denominators', () => {
  const ALLOWED = [2, 3, 4, 5, 6, 8, 10, 12, 100];
  it('every fraction a Grade 4 fraction question asks or keys has a denominator in {2, 3, 4, 5, 6, 8, 10, 12, 100}', () => {
    for (const q of everyQuestion(4).filter((x) => x.standardCode.startsWith('NC.4.NF'))) {
      for (const d of denominatorsIn(asked(q))) {
        expect(ALLOWED, `${q.id}: denominator ${d} in "${asked(q)}"`).toContain(d);
      }
    }
  });

  it('g4-nf4-02: sevenths are gone', () => {
    const q = getCurriculum(4).source.resolve({ kind: 'authored', id: 'g4-nf4-02' });
    expect(asked(q)).not.toMatch(/\/7|\/21/);
    expect(q.contentVersion).toBe(2);
  });
});

describe('NC-R12b: Grade 4 whole numbers stop at 100,000', () => {
  it('no Grade 4 base-ten question asks a number above 100,000', () => {
    for (const q of everyQuestion(4).filter((x) => x.standardCode.startsWith('NC.4.NBT'))) {
      for (const m of `${q.prompt} ${q.promptDetails ?? ''}`.matchAll(/\b\d{1,3}(?:,\d{3})+\b|\b\d{4,}\b/g)) {
        expect(Number(m[0].replace(/,/g, '')), `${q.id}: ${m[0]}`).toBeLessThanOrEqual(100000);
      }
    }
  });
});

describe('NC-R13a: Grade 3 fraction denominators', () => {
  it('every fraction a Grade 3 fraction question asks or keys has a denominator in {2, 3, 4, 6, 8}', () => {
    for (const q of everyQuestion(3).filter((x) => x.standardCode.startsWith('NC.3.NF'))) {
      for (const d of denominatorsIn(asked(q))) {
        expect([2, 3, 4, 6, 8], `${q.id}: denominator ${d} in "${asked(q)}"`).toContain(d);
      }
    }
  });
});

describe('NC-R13b: Grade 3 equivalence and comparison use related families only', () => {
  it('g3-nf4-03: NC-R13b every NF.3 and NF.4 question stays inside {2, 4, 8} or inside {3, 6}', () => {
    for (const q of everyQuestion(3).filter((x) => x.standardCode === 'NC.3.NF.3' || x.standardCode === 'NC.3.NF.4')) {
      const dens = denominatorsIn(asked(q));
      const inFamily = (family: number[]) => dens.every((d) => family.includes(d));
      expect(inFamily([2, 4, 8]) || inFamily([3, 6]), `${q.id}: ${dens.join(', ')} in "${asked(q)}"`).toBe(true);
    }
  });
});

describe('NC-R13b: g3-nf4-03', () => {
  it('g3-nf4-03: NC-R13b compares fourths with eighths, not sixths, and bumps its version', () => {
    const q = getCurriculum(3).source.resolve({ kind: 'authored', id: 'g3-nf4-03' });
    expect(q.prompt).toMatch(/3\/4 or 3\/8/);
    expect(q.options.find((o) => o.isCorrect)!.text).toMatch(/fourths are longer steps than eighths/);
    expect(`${q.prompt} ${q.options.map((o) => o.text).join(' ')}`).not.toMatch(/sixths|\b\d+\/6\b/);
    expect(q.contentVersion).toBe(2);
  });
});

describe('NC-R13c: Grade 3 has no rounding standard', () => {
  it('no Grade 3 question asks a child to round', () => {
    for (const q of everyQuestion(3)) {
      const text = `${q.prompt} ${q.promptDetails ?? ''} ${q.options.map((o) => o.text).join(' ')}`;
      expect(text, q.id).not.toMatch(/\bround(?:s|ed|ing)?\b/i);
    }
  });
});

describe('NC-R14: Grade 1 addition stays within 100', () => {
  it('every NC.1.NBT.4 key is at most 100', () => {
    for (const q of everyQuestion(1).filter((x) => x.standardCode === 'NC.1.NBT.4')) {
      expect(Number(q.options.find((o) => o.isCorrect)!.text), q.id).toBeLessThanOrEqual(100);
    }
  });
});
```


- [ ] **Step 2: Run them to verify they fail**

Run: `npx vitest run src/curriculum/ncRules.grades1to4.test.ts`
Expected: FAIL, 4 failed | 4 passed (8). The four failures are the NC-R12a sweep (it names `g4-nf4-02` and denominator 7), `g4-nf4-02: sevenths are gone`, the NC-R13b sweep (it names `g3-nf4-03`), and `g3-nf4-03: NC-R13b compares fourths with eighths`. The R12b, R13a, R13c and R14 tests already pass: those rules were met.

- [ ] **Step 3: Rewrite the two items**

**Modify `src/curriculum/grade3/authored.nf.ts`**

```diff
@@ -577,16 +577,20 @@ export const GRADE_3_NF_AUTHORED: Question[] = [
     // SAME NUMERATOR again, but a LENGTH model rather than an area one — the
     // standard names both, and a child who can reason about pieces of a bar
     // does not automatically reason about steps along a line.
+    // NC-R13b: Grade 3 comparison uses related families only (halves, fourths
+    // and eighths; thirds and sixths). Fourths against eighths, not sixths.
+    // 3/4 = 6/8 > 3/8, so 3/4 is farther.
     prompt:
-      'Two number lines are the same length and both run from 0 to 1. One is cut into 4 equal parts and the other into 6 equal parts. Which point is farther from 0: 3/4 or 3/6?',
+      'Two number lines are the same length and both run from 0 to 1. One is cut into 4 equal parts and the other into 8 equal parts. Which point is farther from 0: 3/4 or 3/8?',
+    contentVersion: 2,
     options: labelOptions([
       {
-        text: '3/4, because fourths are longer steps than sixths, so 3 of them reach farther.',
+        text: '3/4, because fourths are longer steps than eighths, so 3 of them reach farther.',
         isCorrect: true,
       },
       // The larger bottom number read as the larger amount.
       {
-        text: '3/6, because 6 parts fit in the line and only 4 do.',
+        text: '3/8, because 8 parts fit in the line and only 4 do.',
         isCorrect: false,
         misconception: 'larger-denominator-means-larger-fraction',
       },
@@ -609,9 +613,9 @@ export const GRADE_3_NF_AUTHORED: Question[] = [
     explanation: {
       stepByStep: [
         'Step 1: Both lines are the same length and both run from 0 to 1, so the two distances can be compared fairly.',
-        'Step 2: The line cut into 4 parts has longer steps than the line cut into 6 parts.',
+        'Step 2: The line cut into 4 parts has longer steps than the line cut into 8 parts.',
         'Step 3: Each point is 3 steps from 0, so the one with the longer steps has travelled farther.',
-        'Step 4: 3/4, because fourths are longer steps than sixths, so 3 of them reach farther.',
+        'Step 4: 3/4, because fourths are longer steps than eighths, so 3 of them reach farther.',
       ],
       conceptSummary:
         'On a number line a fraction is a distance, and the bottom number sets the length of one step. Three long steps go farther than three short ones.',
```

**Modify `src/curriculum/grade4/authored.nf.ts`**

```diff
@@ -783,30 +783,32 @@ export const GRADE_4_NF_AUTHORED: Question[] = [
     id: 'g4-nf4-02',
     standardCode: 'NC.4.NF.4',
     domainId: 'NF',
-    prompt: 'Priya works out 3 × 2/7 and writes 6/21. What went wrong, and what is the product?',
+    // NC-R12a: Grade 4 denominators are 2, 3, 4, 5, 6, 8, 10, 12 and 100, so
+    // sevenths are out. 2 × 3/4 = 6/4; Priya's 6/8 is 3/4, the same amount.
+    prompt: 'Priya works out 2 × 3/4 and writes 6/8. What went wrong, and what is the product?',
     options: labelOptions([
       {
-        text: 'She multiplied the denominator by 3 as well; the product is 6/7.',
+        text: 'She multiplied the denominator by 2 as well; the product is 6/4.',
         isCorrect: true,
       },
-      // Accepts 6/21, which is 3 × 2 over 3 × 7 - and 6/21 is the same amount
-      // as 2/7, so three copies came out no bigger than one.
+      // Accepts 6/8, which is 2 × 3 over 2 × 4 - and 6/8 is the same amount
+      // as 3/4, so two copies came out no bigger than one.
       {
-        text: 'Nothing went wrong: multiplying by 3 multiplies the top and the bottom, so 6/21 is right.',
+        text: 'Nothing went wrong: multiplying by 2 multiplies the top and the bottom, so 6/8 is right.',
         isCorrect: false,
         misconception: 'multiplied-the-denominator-too',
       },
-      // 3 + 2 = 5 over 7: the whole number was added to the numerator rather
+      // 2 + 3 = 5 over 4: the whole number was added to the numerator rather
       // than multiplied through it.
       {
-        text: 'She should have added the 3 to the numerator; the product is 5/7.',
+        text: 'She should have added the 2 to the numerator; the product is 5/4.',
         isCorrect: false,
         misconception: 'added-instead-of-multiplied',
       },
-      // The 3 and the 2/7 written side by side, which is 3 + 2/7, not 3 copies
-      // of 2/7.
+      // The 2 and the 3/4 written side by side, which is 2 + 3/4, not 2 copies
+      // of 3/4.
       {
-        text: 'She should have written the 3 beside the fraction; the product is 3 2/7.',
+        text: 'She should have written the 2 beside the fraction; the product is 2 3/4.',
         isCorrect: false,
         misconception: 'wrote-the-product-as-a-mixed-number',
       },
@@ -814,15 +816,16 @@ export const GRADE_4_NF_AUTHORED: Question[] = [
     calculatorAllowed: false,
     isStretch: false,
     difficulty: 'advanced',
+    contentVersion: 2,
     explanation: {
       stepByStep: [
-        'Step 1: 3 × 2/7 means 2/7 + 2/7 + 2/7 — three copies of two sevenths.',
-        'Step 2: Every copy is measured in sevenths, so the answer is measured in sevenths too. The denominator stays 7.',
-        'Step 3: Count the sevenths: 3 × 2 = 6, so the product is 6/7. Priya multiplied the 7 by 3 as well, which is why she got 6/21.',
-        'Step 4: She multiplied the denominator by 3 as well; the product is 6/7.',
+        'Step 1: 2 × 3/4 means 3/4 + 3/4 — two copies of three fourths.',
+        'Step 2: Every copy is measured in fourths, so the answer is measured in fourths too. The denominator stays 4.',
+        'Step 3: Count the fourths: 2 × 3 = 6, so the product is 6/4. Priya multiplied the 4 by 2 as well, which is why she got 6/8.',
+        'Step 4: She multiplied the denominator by 2 as well; the product is 6/4.',
       ],
       conceptSummary:
-        'Scaling both the numerator and the denominator is how you RENAME a fraction, not how you multiply it. 6/21 and 2/7 are the same number, which is the clearest sign the operation never happened.',
+        'Scaling both the numerator and the denominator is how you RENAME a fraction, not how you multiply it. 6/8 and 3/4 are the same number, which is the clearest sign the operation never happened.',
       commonMisconception:
         'The rule "do the same thing to the top and the bottom" belongs to equivalent fractions. Applied to multiplication it undoes itself, and the answer comes back unchanged.',
     },
```


- [ ] **Step 4: Run the tests, the suite and the types**

Run: `npx vitest run src/curriculum/ncRules.grades1to4.test.ts` then `npm run test:run` then `npm run typecheck`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/curriculum/ncRules.grades1to4.test.ts src/curriculum/grade3/authored.nf.ts src/curriculum/grade4/authored.nf.ts
git commit -m "fix: g4-nf4-02 and g3-nf4-03 stay inside NC's denominator families (NC-R12a, NC-R13b)" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01X5HSDdHPWxvHxgBaoSTbLX"
```

---

### Task 3: NC-R2 at Grade 3: `g3-g1-05` and the geometry guide (content-g3 Critical)

NC's own note, identical in the grade 1 to 5 unpacking documents: "North Carolina has adopted the exclusive definition for a trapezoid. A trapezoid is a quadrilateral with exactly one pair of parallel sides." So a square is NOT a trapezoid. The key, the explanation, the study guide (rule, step, trap) and two comments taught the opposite, and a test pinned it. The misconception tag `exclusive-trapezoid-definition` described the correct answer as a slip; the new tag `inclusive-trapezoid-definition` names the real slip. The old tag stays in the registry until its last user (Grade 5) moves in Task 5.

**Files:**
- Modify: `src/curriculum/misconceptions.ts` (add the tag), `src/curriculum/grade3/authored.g.ts`, `src/curriculum/grade3/studyGuides.ts` (trapezoid lines only; the rest of this file is Task 10), `src/curriculum/grade3/authored.g.test.ts`

**Interfaces:**
- Consumes: Task 1's `contentVersion`.
- Produces: tag `inclusive-trapezoid-definition` (family `shape-classification`); bumped id `g3-g1-05` (key flipped).

- [ ] **Step 1: Write the failing tests** (these replace the test that enforced the inclusive definition)

**Modify `src/curriculum/grade3/authored.g.test.ts`**

```diff
@@ -79,21 +79,31 @@ describe('grade 3 G authored bank', () => {
     expect(blob.some((t) => /\bparallelogram\b/i.test(t)), 'no parallelogram item').toBe(true);
   });
 
-  // NC uses the INCLUSIVE definition of a trapezoid — at least one pair of
-  // parallel sides — so under it every parallelogram is a trapezoid. An item
-  // written from the exclusive definition would have a second correct answer.
-  it('never asserts the exclusive trapezoid definition as correct', () => {
+  // NC-R2: NC uses the EXCLUSIVE definition of a trapezoid — exactly one pair
+  // of parallel sides — so no parallelogram, rectangle, rhombus or square is
+  // a trapezoid. The inclusive definition may appear only inside a distractor,
+  // never in a key and never in an explanation.
+  it('g3-g1-05: NC-R2 the key uses the exclusive trapezoid definition', () => {
+    const q = GRADE_3_G_AUTHORED.find((i) => i.id === 'g3-g1-05')!;
+    const correct = q.options.find((o) => o.isCorrect)!;
+    expect(correct.text).toMatch(/not a trapezoid/i);
+    expect(correct.text).toMatch(/exactly one pair of parallel sides/i);
+    const inclusive = q.options.find((o) => /at least one pair/i.test(o.text))!;
+    expect(inclusive.isCorrect).toBe(false);
+    expect(inclusive.misconception).toBe('inclusive-trapezoid-definition');
+    expect(q.contentVersion, 'a flipped key bumps contentVersion').toBe(2);
+  });
+
+  it('g3-g1-05: NC-R2 no key or explanation teaches the inclusive definition', () => {
     for (const q of GRADE_3_G_AUTHORED) {
       const correct = q.options.find((o) => o.isCorrect)!;
-      expect(
-        /exactly one pair of parallel sides/i.test(correct.text),
-        `${q.id}'s key uses the exclusive trapezoid definition, which NC does not`,
-      ).toBe(false);
+      const taught = [correct.text, ...q.explanation.stepByStep, q.explanation.conceptSummary].join(' ');
+      expect(/at least one pair of parallel/i.test(taught), `${q.id} teaches the inclusive definition`).toBe(false);
     }
   });
 
-  // Shape hierarchies overlap — every square is a rectangle AND a rhombus, and
-  // under NC's inclusive definition a parallelogram is a trapezoid. A prose
+  // Shape hierarchies overlap — every square is a rectangle AND a rhombus,
+  // while under NC's exclusive definition no parallelogram is a trapezoid. A prose
   // classification bank is therefore one careless option away from two right
   // answers, and the shared kit cannot see it because prose has no value to
   // compare.
@@ -114,7 +124,7 @@ describe('grade 3 G authored bank', () => {
       'g3-g1-02': 'two squares joined on a full side make a 1-by-2 rectangle, nothing else',
       'g3-g1-03': 'a straight cut between the midpoints of two opposite sides makes two rectangles',
       'g3-g1-04': 'only "every square is also a rectangle" holds',
-      'g3-g1-05': 'a square is a rhombus and, inclusively, a trapezoid',
+      'g3-g1-05': 'a square is a rhombus, and it has two pairs of parallel sides, so it is not a trapezoid',
     };
     for (const q of GRADE_3_G_AUTHORED) {
       expect(falseBecause[q.id], `${q.id} is not pinned in the second-true-answer review`).toBeTruthy();
```


- [ ] **Step 2: Run them to verify they fail**

Run: `npx vitest run src/curriculum/grade3/authored.g.test.ts`
Expected: FAIL, 2 failed | 7 passed (9) (`g3-g1-05: NC-R2 the key uses the exclusive trapezoid definition` and `... no key or explanation teaches the inclusive definition`).

- [ ] **Step 3: Flip the item, the guide and the registry**

**Modify `src/curriculum/misconceptions.ts`**

```diff
@@ -524,6 +524,11 @@ export const MISCONCEPTIONS: Record<string, MisconceptionInfo> = Object.fromEntr
       'shape-classification',
       "Used the exclusive definition of a trapezoid (exactly one pair of parallel sides) instead of NC's inclusive definition (at least one pair).",
     ),
+    entry(
+      'inclusive-trapezoid-definition',
+      'shape-classification',
+      "Used the inclusive definition of a trapezoid (at least one pair of parallel sides) instead of NC's exclusive definition (exactly one pair), so a parallelogram, rectangle, rhombus or square was called a trapezoid.",
+    ),
     entry(
       'forgot-the-final-step',
       'incomplete-procedure',
```

**Modify `src/curriculum/grade3/authored.g.ts`**

```diff
@@ -35,18 +35,20 @@ import { labelOptions } from '../../engine/questionModel';
  *     (g3-g1-01, g3-g1-04)
  *   - a shape built from two shapes expected to keep their name (g3-g1-02,
  *     g3-g1-03)
- *   - the EXCLUSIVE definition of a trapezoid (g3-g1-05)
+ *   - the INCLUSIVE definition of a trapezoid, which NC does not use (g3-g1-05)
  *
- * ON THE TRAPEZOID. NC uses the INCLUSIVE definition — at least one pair of
- * parallel sides — which the shipped misconception tag
- * `exclusive-trapezoid-definition` already records. Under it every
- * parallelogram, and so every rectangle, rhombus and square, IS a trapezoid.
- * That makes a prose classification bank one careless option away from two
- * correct answers, because these categories overlap: every square is a
- * rectangle AND a rhombus. Every item below was re-solved option by option
- * against that hierarchy, and ./authored.g.test.ts pins each item in a
- * second-true-answer review so that adding one means restating why its three
- * wrong options are false.
+ * ON THE TRAPEZOID (NC-R2). NC uses the EXCLUSIVE definition: "North Carolina
+ * has adopted the exclusive definition for a trapezoid. A trapezoid is a
+ * quadrilateral with exactly one pair of parallel sides." (NC DPI Grade 3
+ * Unpacking, NC.3.G.1; see docs/superpowers/audits/2026-09-30/nc-rules.md.)
+ * Under it no parallelogram, rectangle, rhombus or square is a trapezoid, and
+ * the shipped misconception tag `inclusive-trapezoid-definition` records the
+ * slip of using the other book's definition. A prose classification bank is
+ * still one careless option away from two correct answers, because these
+ * categories overlap: every square is a rectangle AND a rhombus. Every item
+ * below was re-solved option by option against that hierarchy, and
+ * ./authored.g.test.ts pins each item in a second-true-answer review so that
+ * adding one means restating why its three wrong options are false.
  *
  * Age note: an eight-year-old reads these. Shapes are described in words, not
  * drawn, and every description carries the properties needed to answer.
@@ -262,19 +264,21 @@ export const GRADE_3_G_AUTHORED: Question[] = [
     standardCode: 'NC.3.G.1',
     domainId: 'G',
     // The trapezoid, which the standard names explicitly and which NC defines
-    // INCLUSIVELY: at least one pair of parallel sides. Under that definition
-    // a square is a trapezoid, which is the single most surprising fact in
-    // this standard and the one a bank written from memory gets backwards.
-    // Re-solved against the hierarchy: a square IS a rhombus (four equal
-    // sides, both pairs of opposite sides parallel), so option 3 is false, and
-    // a rhombus 2 units on a side with no square corners is no square, so
-    // option 4 is false.
+    // EXCLUSIVELY (NC-R2): exactly one pair of parallel sides. Under that
+    // definition a square is NOT a trapezoid, the fact a bank written from
+    // memory of the other definition gets backwards.
+    // Re-solved against the hierarchy: a square has two pairs of parallel
+    // sides, so it is not a trapezoid (the key). A square IS a rhombus (four
+    // equal sides, both pairs of opposite sides parallel), so option 2 is
+    // false, and a rhombus 2 units on a side with no square corners is no
+    // square, so option 4 is false. Option 1 uses the inclusive definition,
+    // which NC does not use, so it is false.
     prompt: 'Which statement about a square is true?',
     options: labelOptions([
       {
-        text: 'A square is not a trapezoid, because a trapezoid must have exactly one pair of parallel sides.',
+        text: 'A square is a trapezoid, because it has at least one pair of parallel sides.',
         isCorrect: false,
-        misconception: 'exclusive-trapezoid-definition',
+        misconception: 'inclusive-trapezoid-definition',
       },
       {
         text: 'A square is not a rhombus, because its corners are square corners.',
@@ -282,7 +286,7 @@ export const GRADE_3_G_AUTHORED: Question[] = [
         misconception: 'hierarchy-too-narrow',
       },
       {
-        text: 'A square is a trapezoid, because it has at least one pair of parallel sides.',
+        text: 'A square is not a trapezoid, because a trapezoid has exactly one pair of parallel sides and a square has two pairs.',
         isCorrect: true,
       },
       {
@@ -294,17 +298,18 @@ export const GRADE_3_G_AUTHORED: Question[] = [
     calculatorAllowed: false,
     isStretch: true,
     difficulty: 'stretch',
+    contentVersion: 2, // NC-R2: the key flipped from the inclusive to the exclusive definition
     explanation: {
       stepByStep: [
-        'Step 1: In North Carolina a trapezoid is a quadrilateral with AT LEAST one pair of parallel sides.',
-        'Step 2: A square has two pairs of parallel sides, and two pairs is certainly at least one.',
+        'Step 1: In North Carolina a trapezoid is a quadrilateral with EXACTLY one pair of parallel sides.',
+        'Step 2: A square has two pairs of parallel sides, and two pairs is not exactly one pair, so a square is not a trapezoid.',
         'Step 3: A square also has four equal sides, which is what a rhombus needs, so a square is a rhombus as well - square corners do not stop it.',
-        'Step 4: So the true statement is that A square is a trapezoid, because it has at least one pair of parallel sides.',
+        'Step 4: So the true statement is that A square is not a trapezoid, because a trapezoid has exactly one pair of parallel sides and a square has two pairs.',
       ],
       conceptSummary:
-        'A shape belongs to every group whose rules it follows, and it can belong to several at once. A square follows the rules for rectangles, rhombuses, parallelograms and trapezoids all at the same time.',
+        'A shape belongs to every group whose rules it follows, and it can belong to several at once. A square follows the rules for rectangles, rhombuses and parallelograms all at the same time. It does not follow the trapezoid rule, which asks for exactly one pair of parallel sides.',
       commonMisconception:
-        'Many books define a trapezoid as having EXACTLY one pair of parallel sides, which would leave squares out. North Carolina uses "at least one pair", so shapes with two pairs count too.',
+        'Some books define a trapezoid as having AT LEAST one pair of parallel sides, which would let squares in. North Carolina uses "exactly one pair", so a shape with two pairs is not a trapezoid.',
     },
   },
 ];
```

**Modify `src/curriculum/grade3/studyGuides.ts`**

```diff
@@ -732,29 +732,29 @@ export const GRADE_3_STUDY_GUIDES: Record<string, StudyGuideSection> = {
     standardCode: 'NC.3.G.1',
     title: 'Quadrilaterals: Shapes That Have More Than One Name',
     coreConcept:
-      'A quadrilateral is any closed shape with four straight sides. The different kinds - rectangle, square, rhombus, parallelogram, trapezoid - are named by what their sides and corners do, not by how they are turned on the page. A shape can belong to more than one group at once, and having something EXTRA never throws it out of a group.',
+      'A quadrilateral is any closed shape with four straight sides. The different kinds - rectangle, square, rhombus, parallelogram, trapezoid - are named by what their sides and corners do, not by how they are turned on the page. A shape can belong to more than one group at once - a square is also a rectangle and a rhombus - but a trapezoid is a group on its own: it has exactly one pair of parallel sides.',
     rulesAndFormulas: [
       { label: 'Quadrilateral', detail: 'Four straight sides, closed up, no gaps.' },
       { label: 'Rectangle', detail: 'A quadrilateral with four square corners.' },
       { label: 'Square', detail: 'Four square corners AND four equal sides. So every square is also a rectangle.' },
       { label: 'Rhombus', detail: 'Four equal sides. A tilted rhombus is still a rhombus - turning a shape never changes its name.' },
       { label: 'Parallelogram', detail: 'Two pairs of parallel sides - sides that stay the same distance apart forever.' },
-      { label: 'Trapezoid', detail: 'In North Carolina, a quadrilateral with AT LEAST one pair of parallel sides.' },
+      { label: 'Trapezoid', detail: 'In North Carolina, a quadrilateral with EXACTLY one pair of parallel sides. A parallelogram, rectangle, rhombus or square has two pairs, so it is not a trapezoid.' },
       { label: 'Composing and decomposing', detail: 'Two triangles can be joined into a quadrilateral, and a quadrilateral can be cut into smaller shapes.' },
     ],
     stepByStepMethod: [
       'Step 1: Count the sides. Four straight sides makes it a quadrilateral.',
       'Step 2: Check the corners: are they square corners, like the corner of a book?',
       'Step 3: Check the sides: which ones are the same length, and which pairs stay the same distance apart the whole way (parallel)?',
-      'Step 4: Match what you found against the names - rectangle for four square corners, square for four square corners and four equal sides, rhombus for four equal sides, parallelogram for two pairs of parallel sides, trapezoid for at least one pair.',
-      'Step 5: Remember that more than one name can be right at once, and that the special name never cancels the general one.',
+      'Step 4: Match what you found against the names - rectangle for four square corners, square for four square corners and four equal sides, rhombus for four equal sides, parallelogram for two pairs of parallel sides, trapezoid for exactly one pair.',
+      'Step 5: Remember that more than one name can be right at once - a square is a rectangle and a rhombus - and that a special name never cancels a general one.',
     ],
     commonTraps: [
       'Calling a square "not a rectangle" because its sides are all equal. A square has everything a rectangle needs and one thing more, so every square is a rectangle.',
       'Turning it round and saying every rectangle is a square. Containment runs one way only: the more special shape belongs to the more general group, never the reverse.',
       'Expecting two squares joined along a full side to make a bigger square. Joining them doubles the length but not the height, so the new shape is a rectangle.',
       'Assuming every cut across a quadrilateral makes two triangles. A cut from corner to corner does, but a cut from the middle of one side to the middle of the opposite side leaves two four-sided shapes.',
-      'Using the "exactly one pair of parallel sides" definition of a trapezoid from another book. North Carolina uses "at least one pair", so shapes with two pairs count too.',
+      'Calling a parallelogram, rectangle, rhombus or square a trapezoid. Some books say "at least one pair of parallel sides", but North Carolina says "exactly one pair", so a shape with two pairs is not a trapezoid.',
     ],
     workedExample: {
       problem: 'Jo says a square is not a rectangle, because a square has four equal sides. Is Jo right? Then say what shape you get when two identical squares are joined along a whole side.',
```


- [ ] **Step 4: Run the tests, the suite and the types**

Run: `npx vitest run src/curriculum/grade3 src/curriculum/misconceptions.test.ts` then `npm run test:run` then `npm run typecheck`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/curriculum/grade3/authored.g.test.ts src/curriculum/misconceptions.ts src/curriculum/grade3/authored.g.ts src/curriculum/grade3/studyGuides.ts
git commit -m "fix: a square is not a trapezoid in NC (grade 3): flip g3-g1-05 and its guide (NC-R2)" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01X5HSDdHPWxvHxgBaoSTbLX"
```

---

### Task 4: NC-R2 at Grade 4: `g4-g2-02`, the G.2 guide and its impossible triangle (content-g4 Critical and High)

`g4-g2-02` asked whether Riley is right that a shape with two pairs of parallel sides is not a trapezoid, and keyed "No". Under the exclusive definition Riley is right. The same guide worked example (`NC.4.G.2`) also gave a triangle with angles 40, 55, 85 and sides 5, 5, 7, which cannot exist (two equal sides force two equal angles); it is replaced by 40, 70, 70 with sides 6, 6 and about 4, which is consistent (6 / sin 70 = 6.4, 4.1 / sin 40 = 6.4).

**Files:**
- Modify: `src/curriculum/misconceptions.ts` (add `mixed-up-trapezoid-and-parallelogram`), `src/curriculum/grade4/authored.g.ts`, `src/curriculum/grade4/studyGuides.ts` (G.2 only), `src/curriculum/grade4/authored.g.test.ts`, `src/curriculum/grade4/studyGuides.test.ts`

**Interfaces:**
- Consumes: Task 3's `inclusive-trapezoid-definition` tag.
- Produces: tag `mixed-up-trapezoid-and-parallelogram`; bumped id `g4-g2-02`. The new item keeps the key in option B; option D uses the new tag (a child who takes "two pairs of parallel sides" as what a trapezoid needs).

- [ ] **Step 1: Write the failing tests**

**Modify `src/curriculum/grade4/authored.g.test.ts`**

```diff
@@ -80,30 +80,35 @@ describe('grade 4 G authored bank', () => {
     }
   });
 
-  // NC uses the INCLUSIVE definition: a trapezoid has AT LEAST one pair of
-  // parallel sides, so every parallelogram is a trapezoid. The exclusive
+  // NC-R2: NC uses the EXCLUSIVE definition: a trapezoid has EXACTLY one pair
+  // of parallel sides, so no parallelogram is a trapezoid. The inclusive
   // definition may appear only inside a distractor - never in a key and never
   // in an explanation, which is where a child goes to find out what is true.
-  it('teaches only the inclusive trapezoid definition', () => {
-    const exclusive = /exactly one pair of parallel/i;
+  it('g4-g2-02: NC-R2 teaches only the exclusive trapezoid definition', () => {
+    const inclusive = /at least one pair of parallel/i;
     for (const q of GRADE_4_G_AUTHORED) {
       const taught = [
         q.prompt,
         q.promptDetails ?? '',
         ...q.options.filter((o) => o.isCorrect).map((o) => o.text),
+        ...q.explanation.stepByStep,
+        q.explanation.conceptSummary,
       ].join(' ');
-      expect(exclusive.test(taught), `${q.id} teaches the exclusive trapezoid definition`).toBe(
-        false,
-      );
-      for (const step of q.explanation.stepByStep) {
-        expect(
-          /a trapezoid (must )?ha(s|ve) exactly one pair/i.test(step),
-          `${q.id} explanation asserts the exclusive definition: "${step}"`,
-        ).toBe(false);
-      }
+      expect(inclusive.test(taught), `${q.id} teaches the inclusive trapezoid definition`).toBe(false);
     }
   });
 
+  it('g4-g2-02: NC-R2 Riley is right, because PQRS has two pairs of parallel sides', () => {
+    const q = GRADE_4_G_AUTHORED.find((i) => i.id === 'g4-g2-02')!;
+    const key = q.options.find((o) => o.isCorrect)!;
+    expect(key.text).toMatch(/^Yes\./);
+    expect(key.text).toMatch(/exactly one pair of parallel sides/i);
+    expect(q.options.find((o) => o.misconception === 'inclusive-trapezoid-definition')!.text).toMatch(
+      /at least one pair/i,
+    );
+    expect(q.contentVersion, 'a flipped key bumps contentVersion').toBe(2);
+  });
+
   // Ruling 9.2: NC.4.G.1 is "Draw and identify points, lines, line segments,
   // rays, angles, and PERPENDICULAR AND PARALLEL LINES" - two of its four
   // keyConcepts are the parallel and perpendicular ones. A bank that only ever
```

**Modify `src/curriculum/grade4/studyGuides.test.ts`**

```diff
@@ -121,3 +121,28 @@ describe('grade 4 study guides', () => {
     }
   });
 });
+
+describe('grade 4 NC.4.G.2 worked example (content-g4 audit, High)', () => {
+  const guide = GRADE_4_STUDY_GUIDES['NC.4.G.2'];
+
+  // The old example gave angles 40/55/85 with sides 5/5/7: an isosceles
+  // triangle has two equal angles, so that triangle cannot exist.
+  it('G4 G.2: the triangle it describes can exist (law of sines)', () => {
+    const p = guide.workedExample.problem;
+    const angles = /angles of (\d+), (\d+) and (\d+) degrees/.exec(p)!.slice(1).map(Number).sort((a, b) => a - b);
+    const sides = /sides of (\d+) cm, (\d+) cm and (?:about )?(\d+) cm/.exec(p)!.slice(1).map(Number).sort((a, b) => a - b);
+    expect(angles.reduce((a, b) => a + b, 0)).toBe(180);
+    // Each side over the sine of its opposite angle is one constant; the
+    // smallest side faces the smallest angle. 5% allows for "about".
+    const ratio = angles.map((deg, i) => sides[i] / Math.sin((deg * Math.PI) / 180));
+    for (const r of ratio) expect(Math.abs(r / ratio[0] - 1), `ratios ${ratio.join(', ')}`).toBeLessThan(0.05);
+  });
+
+  it('G4 G.2: NC-R2 teaches the exclusive trapezoid definition everywhere', () => {
+    const text = JSON.stringify(guide);
+    expect(text).not.toMatch(/at least one pair of parallel sides - which/i);
+    expect(text).not.toMatch(/inclusive definition, which makes/i);
+    expect(text).not.toMatch(/NC inclusive/i);
+    expect(guide.rulesAndFormulas.find((r) => /trapezoid/i.test(r.label))!.detail).toMatch(/exactly one pair/i);
+  });
+});
```


- [ ] **Step 2: Run them to verify they fail**

Run: `npx vitest run src/curriculum/grade4/authored.g.test.ts src/curriculum/grade4/studyGuides.test.ts`
Expected: FAIL, 4 failed | 14 passed (18) (the two `g4-g2-02` tests and the two `G4 G.2` guide tests).

- [ ] **Step 3: Flip the item, the guide, fix the triangle**

**Modify `src/curriculum/misconceptions.ts`**

```diff
@@ -529,6 +529,11 @@ export const MISCONCEPTIONS: Record<string, MisconceptionInfo> = Object.fromEntr
       'shape-classification',
       "Used the inclusive definition of a trapezoid (at least one pair of parallel sides) instead of NC's exclusive definition (exactly one pair), so a parallelogram, rectangle, rhombus or square was called a trapezoid.",
     ),
+    entry(
+      'mixed-up-trapezoid-and-parallelogram',
+      'shape-classification',
+      "Took a parallelogram's two pairs of parallel sides as the requirement for a trapezoid, instead of exactly one pair.",
+    ),
     entry(
       'forgot-the-final-step',
       'incomplete-procedure',
```

**Modify `src/curriculum/grade4/authored.g.ts`**

```diff
@@ -37,11 +37,13 @@ import { labelOptions } from '../../engine/questionModel';
  *   plane at this grade - those are NC.5.MD and NC.5.G - and the test guards
  *   the vocabulary rather than trusting this paragraph.
  *
- * THE TRAPEZOID IS INCLUSIVE. North Carolina defines a trapezoid as a
- * quadrilateral with AT LEAST one pair of parallel sides, so every
- * parallelogram is a trapezoid. g4-g2-02 is built on that, and the exclusive
- * definition ("exactly one pair") appears only as a distractor, never in a key
- * and never in a worked solution.
+ * THE TRAPEZOID IS EXCLUSIVE (NC-R2). North Carolina defines a trapezoid as a
+ * quadrilateral with EXACTLY one pair of parallel sides ("North Carolina has
+ * adopted the exclusive definition for a trapezoid", NC DPI Grade 4 Unpacking,
+ * NC.4.G.2; docs/superpowers/audits/2026-09-30/nc-rules.md), so no
+ * parallelogram is a trapezoid. g4-g2-02 is built on that, and the inclusive
+ * definition ("at least one pair") appears only as a distractor, never in a
+ * key and never in a worked solution.
  *
  * FIGURES ARE TEXT. This app has no image assets and will not get any. Every
  * item that describes a figure puts the whole of it in `promptDetails`,
@@ -54,10 +56,8 @@ import { labelOptions } from '../../engine/questionModel';
  * checks instead that no two options state one fact in two wordings. The
  * hierarchy items are where this bites: "parallelogram" IS true of a
  * rectangle, so every such item asks for the MOST SPECIFIC name and the
- * broader-but-true option is tagged `named-a-broader-category`. Two places
+ * broader-but-true option is tagged `named-a-broader-category`. One place
  * where an option was deliberately rejected while writing this file:
- *   - g4-g2-02 could not offer "trapezoid" as a false option about a
- *     parallelogram, because under NC's inclusive definition it is true.
  *   - g4-g3-01 offers only ONE of the rectangle's two real fold lines as an
  *     option; offering both the vertical and the horizontal midline would put
  *     two correct answers in one item.
@@ -65,7 +65,7 @@ import { labelOptions } from '../../engine/questionModel';
  * EVERY DISTRACTOR'S `//` COMMENT NAMES THE ERROR THAT REACHES THAT OPTION.
  * Eighteen tags used here are new, declared in ../misconceptions.ts. The
  * registry had good names for the polygon hierarchy - `named-a-broader-
- * category`, `hierarchy-too-narrow`, `exclusive-trapezoid-definition` - and
+ * category`, `hierarchy-too-narrow`, `inclusive-trapezoid-definition` - and
  * none at all for this grade's other two standards: nothing for symmetry,
  * nothing for naming a ray, nothing for confusing parallel with perpendicular.
  * Stretching a hierarchy tag over a symmetry error would tell a parent their
@@ -279,7 +279,7 @@ export const GRADE_4_G_AUTHORED: Question[] = [
   // Standard: NC.4.G.2 — Classify Triangles & Quadrilaterals
   // Sourced: classify quadrilaterals AND TRIANGLES based on angle measure,
   // side lengths, and the presence or absence of parallel or perpendicular
-  // lines. NC's trapezoid definition is INCLUSIVE: at least one pair of
+  // lines. NC's trapezoid definition is EXCLUSIVE: exactly one pair of
   // parallel sides.
   // ==========================================
   {
@@ -329,25 +329,21 @@ export const GRADE_4_G_AUTHORED: Question[] = [
     standardCode: 'NC.4.G.2',
     domainId: 'G',
     prompt:
-      'Quadrilateral PQRS has two pairs of parallel sides. Riley says PQRS cannot be called a trapezoid. Is Riley right?',
+      'Quadrilateral PQRS has two pairs of parallel sides. Riley says PQRS is not a trapezoid. Is Riley right?',
+    // Solved: NC's trapezoid has exactly one pair of parallel sides (NC-R2).
+    // PQRS has two pairs, so it is a parallelogram and NOT a trapezoid, and
+    // Riley is right (option 2).
     options: labelOptions([
+      // Used the inclusive definition taught outside North Carolina, under
+      // which two pairs of parallel sides is "at least one" and so counts.
       {
         text: 'No. A trapezoid has at least one pair of parallel sides, and PQRS has two pairs.',
-        isCorrect: true,
-      },
-      // Used the exclusive definition taught outside North Carolina, under
-      // which a shape with two pairs of parallel sides is ruled out.
-      {
-        text: 'Yes. To be a trapezoid, a shape must have exactly one pair of parallel sides.',
         isCorrect: false,
-        misconception: 'exclusive-trapezoid-definition',
+        misconception: 'inclusive-trapezoid-definition',
       },
-      // Treated the quadrilateral groups as separate boxes, so a shape that is
-      // already a parallelogram cannot also be a trapezoid.
       {
-        text: 'Yes. PQRS is a parallelogram, and a shape cannot be in two quadrilateral groups at once.',
-        isCorrect: false,
-        misconception: 'hierarchy-too-narrow',
+        text: 'Yes. A trapezoid has exactly one pair of parallel sides, and PQRS has two pairs.',
+        isCorrect: true,
       },
       // Stretched the trapezoid group over every quadrilateral, which is wider
       // than its definition allows: a quadrilateral with no parallel sides at
@@ -357,22 +353,30 @@ export const GRADE_4_G_AUTHORED: Question[] = [
         isCorrect: false,
         misconception: 'hierarchy-too-broad',
       },
+      // Took the parallelogram's two pairs of parallel sides as what a
+      // trapezoid needs, so PQRS was accepted for having two pairs.
+      {
+        text: 'No. A trapezoid has two pairs of parallel sides, and PQRS has two pairs.',
+        isCorrect: false,
+        misconception: 'mixed-up-trapezoid-and-parallelogram',
+      },
     ]),
     calculatorAllowed: false,
     isStretch: false,
     difficulty: 'advanced',
+    contentVersion: 2, // NC-R2: the key flipped from the inclusive to the exclusive definition
     explanation: {
       stepByStep: [
-        'Step 1: North Carolina defines a trapezoid as a quadrilateral with AT LEAST one pair of parallel sides.',
-        'Step 2: PQRS has two pairs of parallel sides, and two pairs is certainly at least one pair, so PQRS fits that definition.',
-        'Step 3: Having a second name does not cancel the first. PQRS is a parallelogram and a trapezoid and a quadrilateral all at once, the way a robin is a bird and an animal at once.',
-        'Step 4: That does not make every quadrilateral a trapezoid. A quadrilateral with no parallel sides at all still fails the definition.',
-        'Step 5: Riley is wrong: No. A trapezoid has at least one pair of parallel sides, and PQRS has two pairs.',
+        'Step 1: North Carolina defines a trapezoid as a quadrilateral with EXACTLY one pair of parallel sides.',
+        'Step 2: PQRS has two pairs of parallel sides, and two pairs is not exactly one pair, so PQRS does not fit that definition.',
+        'Step 3: Trapezoids and parallelograms are two separate groups of quadrilaterals: exactly one pair of parallel sides is a trapezoid, and two pairs is a parallelogram.',
+        'Step 4: A quadrilateral with no parallel sides at all is not a trapezoid either.',
+        'Step 5: Riley is right: Yes. A trapezoid has exactly one pair of parallel sides, and PQRS has two pairs.',
       ],
       conceptSummary:
-        'Quadrilateral names are groups inside groups, not separate boxes. A shape belongs to every group whose definition it meets, and the definition of a trapezoid asks for at least one pair of parallel sides.',
+        'A trapezoid is defined by having exactly one pair of parallel sides. A quadrilateral with two pairs is a parallelogram instead, and one with no parallel sides is neither.',
       commonMisconception:
-        'Books outside North Carolina often define a trapezoid as having only one pair of parallel sides. The NC standards use the inclusive definition — at least one pair — which makes every parallelogram a trapezoid as well.',
+        'Books outside North Carolina often define a trapezoid as having at least one pair of parallel sides, which would make every parallelogram a trapezoid. The NC standards use the exclusive definition, exactly one pair, so a parallelogram is not a trapezoid.',
     },
   },
   {
```

**Modify `src/curriculum/grade4/studyGuides.ts`**

```diff
@@ -826,11 +826,11 @@ export const GRADE_4_STUDY_GUIDES: Record<string, StudyGuideSection> = {
     standardCode: 'NC.4.G.2',
     title: 'Classifying Triangles and Quadrilaterals',
     coreConcept:
-      'A shape is classified by checking its properties - the size of its angles, the lengths of its sides, and whether its sides are parallel or perpendicular - and a name is only correct once EVERY property it requires has been checked. North Carolina uses the inclusive definition of a trapezoid: at least one pair of parallel sides.',
+      'A shape is classified by checking its properties - the size of its angles, the lengths of its sides, and whether its sides are parallel or perpendicular - and a name is only correct once EVERY property it requires has been checked. North Carolina uses the exclusive definition of a trapezoid: exactly one pair of parallel sides.',
     rulesAndFormulas: [
       { label: 'Triangles by angle', detail: 'Acute: all three angles under 90 degrees. Right: exactly one 90 degree angle. Obtuse: one angle over 90 degrees.' },
       { label: 'Triangles by side', detail: 'Equilateral: three equal sides. Isosceles: at least two equal sides. Scalene: no two sides equal.' },
-      { label: 'Trapezoid (NC inclusive)', detail: 'At least one pair of parallel sides - which makes every parallelogram a trapezoid as well.' },
+      { label: 'Trapezoid (NC exclusive)', detail: 'Exactly one pair of parallel sides. A parallelogram has two pairs, so a parallelogram (and a rectangle, rhombus or square) is not a trapezoid.' },
       { label: 'Parallelogram', detail: 'Both pairs of opposite sides parallel. Opposite sides are also equal.' },
       { label: 'Rhombus', detail: 'A parallelogram with all FOUR sides equal. It need not have right angles.' },
       { label: 'Rectangle and square', detail: 'A rectangle is a parallelogram with four right angles. A square has four right angles AND four equal sides, so it is both a rectangle and a rhombus.' },
@@ -845,25 +845,25 @@ export const GRADE_4_STUDY_GUIDES: Record<string, StudyGuideSection> = {
     ],
     commonTraps: [
       'Classifying by one property only, so a name is chosen before every property has been checked.',
-      'Using the exclusive trapezoid definition. Books outside North Carolina often define a trapezoid as having only one pair of parallel sides; the NC standards use the inclusive definition, which makes every parallelogram a trapezoid as well.',
+      'Using the inclusive trapezoid definition. Books outside North Carolina often define a trapezoid as having at least one pair of parallel sides; the NC standards say exactly one pair, so a parallelogram is not a trapezoid.',
       'Confusing "opposite sides equal" with "all four sides equal". Only the second one makes a rhombus.',
       'Assuming equal sides force square corners. A rhombus can lean over as far as you like and still have four sides the same length.',
       'Naming a triangle by its two smaller angles. Every triangle has at least two acute angles, including every obtuse one, so the largest angle is the one that decides the name.',
       'Assuming the longest side makes an angle obtuse, or treating any unequal sides as scalene when two of the three sides still match.',
     ],
     workedExample: {
-      problem: 'Triangle RST has angles of 40, 55 and 85 degrees and sides of 5 cm, 5 cm and 7 cm. Quadrilateral JKLM has four sides of 6 cm each, both pairs of opposite sides parallel, and no right angles. Classify each shape as precisely as you can.',
+      problem: 'Triangle RST has angles of 40, 70 and 70 degrees and sides of 6 cm, 6 cm and about 4 cm. Quadrilateral JKLM has four sides of 6 cm each, both pairs of opposite sides parallel, and no right angles. Classify each shape as precisely as you can.',
       steps: [
-        '1. Triangle angles: 40 + 55 + 85 = 180, so the measurements are possible.',
-        '2. Every angle is under 90 degrees - including the largest, 85 - so RST is ACUTE. Two small angles alone would not have told us this.',
-        '3. Two of its sides are 5 cm and one is 7 cm, so exactly two sides match: RST is ISOSCELES.',
+        '1. Triangle angles: 40 + 70 + 70 = 180, so the angles are possible. The two equal angles sit opposite the two equal sides, so the measurements agree.',
+        '2. Every angle is under 90 degrees - including the largest, 70 - so RST is ACUTE. Two small angles alone would not have told us this.',
+        '3. Two of its sides are 6 cm and one is about 4 cm, so exactly two sides match: RST is ISOSCELES.',
         '4. JKLM has both pairs of opposite sides parallel, so it is a parallelogram.',
         '5. All four sides are equal, so it is more precisely a RHOMBUS. No right angles means it is not a square.',
-        '6. Under the NC inclusive definition it is also a trapezoid, because it has at least one pair of parallel sides.',
+        '6. It is not a trapezoid: the NC exclusive definition needs exactly one pair of parallel sides, and JKLM has two pairs.',
       ],
-      answer: 'Triangle RST is acute and isosceles. JKLM is a rhombus (also a parallelogram, and a trapezoid under the NC inclusive definition).',
+      answer: 'Triangle RST is acute and isosceles. JKLM is a rhombus (also a parallelogram, but not a trapezoid under the NC exclusive definition).',
       whyItMattersForSSA:
-        'Classification questions are a reliable part of Geometry, which NCDPI weights together with Measurement and Data as one 23–27% reporting category on the Grade 4 EOG, and the inclusive trapezoid definition is a place where a confident answer learned elsewhere can be the wrong one here.',
+        'Classification questions are a reliable part of Geometry, which NCDPI weights together with Measurement and Data as one 23–27% reporting category on the Grade 4 EOG, and the exclusive trapezoid definition is a place where a confident answer learned elsewhere can be the wrong one here.',
     },
   },
```


- [ ] **Step 4: Run the tests, the suite and the types**

Run: `npx vitest run src/curriculum/grade4 src/curriculum/misconceptions.test.ts` then `npm run test:run` then `npm run typecheck`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/curriculum/grade4/authored.g.test.ts src/curriculum/grade4/studyGuides.test.ts src/curriculum/misconceptions.ts src/curriculum/grade4/authored.g.ts src/curriculum/grade4/studyGuides.ts
git commit -m "fix: a parallelogram is not a trapezoid in NC (grade 4): flip g4-g2-02, fix the G.2 guide and its impossible triangle (NC-R2)" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01X5HSDdHPWxvHxgBaoSTbLX"
```

---

### Task 5: NC-R2 at Grade 5, and one sweep over every grade

Grade 5 taught the same inclusive definition in three places (item `g3-02`, the keyConcepts hierarchy line, the `NC.5.G.3` guide). Plan B2 owns the rest of Grade 5 and edits nothing here. The sweep test reads every authored question, 30 instances of every generator and every study guide in all five grades, so the definition cannot come back in any grade. The last `exclusive-trapezoid-definition` user is gone, so the entry is deleted.

**Files:**
- Modify: `src/curriculum/grade5/authored.ts` (`g3-02` only), `src/curriculum/grade5/standards.ts` (the one keyConcepts line), `src/curriculum/grade5/studyGuides.ts` (the `NC.5.G.3` trapezoid rule and one trap only), `src/curriculum/misconceptions.ts` (delete the old entry)
- Create: `src/curriculum/trapezoid.test.ts`

**Interfaces:**
- Consumes: Tasks 3 and 4's tags, Task 1's `versionOf` and `contentVersion`.
- Produces: bumped id `g3-02` (Grade 5); `src/curriculum/trapezoid.test.ts` (Plan C may fold it into its rules suite).

The `g3-02` claim is "All parallelograms are trapezoids, but not all trapezoids are parallelograms". A parallelogram has two pairs of parallel sides, which is not exactly one pair, so the first half is false and the claim is false. The key is option B; option A uses the inclusive definition (`inclusive-trapezoid-definition`).

- [ ] **Step 1: Write the failing test**

**Create `src/curriculum/trapezoid.test.ts`**

```ts
import { describe, it, expect } from 'vitest';
import { getCurriculum, listCurricula } from './registry';
import { masteryByStandard } from '../engine/mastery';
import type { QuizAttempt } from '../types';
import type { Question } from '../engine/questionModel';
import { GRADE_1_STUDY_GUIDES } from './grade1/studyGuides';
import { MISCONCEPTIONS } from './misconceptions';

// NC-R2 (docs/superpowers/audits/2026-09-30/nc-rules.md): "North Carolina has
// adopted the exclusive definition for a trapezoid. A trapezoid is a
// quadrilateral with exactly one pair of parallel sides." Identical note in
// the NC DPI unpacking documents for grades 1 to 5. No parallelogram,
// rectangle, rhombus or square is a trapezoid. This sweep is what would have
// caught the inclusive definition being taught in three grades at once.

const INCLUSIVE = /at least (?:one|1) pair of parallel/i;
const CALLS_A_PARALLELOGRAM_A_TRAPEZOID =
  /(?:parallelograms?|rectangles?|rhombus(?:es)?|squares?)\s+(?:is|are)\s+(?:also\s+)?(?:a\s+|an\s+)?trapezoids?/i;

function everyQuestion(): Question[] {
  const out: Question[] = [];
  for (const c of listCurricula()) {
    for (const d of c.domains) {
      for (const s of d.standards) {
        for (const ref of c.source.authoredFor(s.code)) out.push(c.source.resolve(ref));
      }
    }
    for (const t of c.source.templates()) {
      for (let seed = 0; seed < 30; seed++) out.push(c.source.resolve({ kind: 'generated', templateId: t.id, seed }));
    }
  }
  return out;
}

describe('NC-R2: the trapezoid is exclusive in every grade', () => {
  it('no key, explanation or concept summary teaches the inclusive definition', () => {
    for (const q of everyQuestion()) {
      const key = q.options.find((o) => o.isCorrect)!.text;
      const taught = [q.prompt.replace(/^A student claims:.*$/s, ''), key, ...q.explanation.stepByStep, q.explanation.conceptSummary].join(' ');
      expect(INCLUSIVE.test(taught), `${q.id} teaches the inclusive trapezoid definition`).toBe(false);
      expect(CALLS_A_PARALLELOGRAM_A_TRAPEZOID.test(taught), `${q.id} calls a parallelogram a trapezoid`).toBe(false);
    }
  });

  it('no study guide teaches it outside a "common trap" warning, and each guide that defines one says exactly one pair', () => {
    for (const c of listCurricula()) {
      for (const [code, g] of Object.entries(c.studyGuides)) {
        const taught = JSON.stringify({ ...g, commonTraps: [] });
        expect(INCLUSIVE.test(taught), `${code} teaches the inclusive trapezoid definition`).toBe(false);
        expect(CALLS_A_PARALLELOGRAM_A_TRAPEZOID.test(taught), `${code} calls a parallelogram a trapezoid`).toBe(false);
        const defines = g.rulesAndFormulas.find((r) => /^trapezoid/i.test(r.label));
        if (defines) expect(defines.detail, code).toMatch(/exactly (?:one|1) pair/i);
      }
    }
  });

  it('every trap that mentions the inclusive wording also says the NC rule', () => {
    for (const c of listCurricula()) {
      for (const [code, g] of Object.entries(c.studyGuides)) {
        for (const trap of g.commonTraps.filter((t) => INCLUSIVE.test(t))) {
          expect(trap, `${code}`).toMatch(/exactly (?:one|1) pair/i);
        }
      }
    }
  });

  it('no standard keyConcept states the inclusive definition', () => {
    for (const c of listCurricula()) {
      for (const d of c.domains) {
        for (const s of d.standards) {
          expect(INCLUSIVE.test(s.keyConcepts.join(' ')), s.code).toBe(false);
        }
      }
    }
  });

  it('the grades that name trapezoids still say so in their study guides', () => {
    // Grade 1 names trapezoids as a shape to build, without defining them.
    expect(JSON.stringify(GRADE_1_STUDY_GUIDES['NC.1.G.1'])).not.toMatch(INCLUSIVE);
    for (const [grade, code] of [[3, 'NC.3.G.1'], [4, 'NC.4.G.2'], [5, 'NC.5.G.3']] as const) {
      const c = listCurricula().find((x) => x.grade === grade)!;
      expect(JSON.stringify(c.studyGuides[code]), `grade ${grade}`).toMatch(/exactly (?:one|1) pair/i);
    }
  });

  it('the registry keeps the inclusive slip and no longer describes the exclusive one as a slip', () => {
    expect(MISCONCEPTIONS['inclusive-trapezoid-definition']?.description).toMatch(/at least one pair/i);
    expect(MISCONCEPTIONS['exclusive-trapezoid-definition']).toBeUndefined();
  });
});

// Spec 3.3: the three items whose key flipped are version 2, so an answer a
// child gave under the old key (stored with no version, meaning 1) stops
// counting toward mastery, and an answer recorded under the new key counts.
describe('NC-R2: answers recorded against the inclusive key stop counting', () => {
  const cases = [
    [3, 'g3-g1-05', 'NC.3.G.1'],
    [4, 'g4-g2-02', 'NC.4.G.2'],
    [5, 'g3-02', 'NC.5.G.3'],
  ] as const;
  const attemptWith = (id: string, code: string, contentVersion?: number): QuizAttempt => ({
    id: 'a', quizId: 'q', quizTitle: 't', completedAt: '2026-09-30T12:00:00.000Z',
    scoreRaw: 1, scoreTotal: 1, scorePercent: 100, isPassingSSA: true, timeElapsedSeconds: 1,
    answers: {
      [id]: { questionId: id, studentAnswer: 'A', isCorrect: true, standardCode: code, ...(contentVersion ? { contentVersion } : {}) },
    },
  });

  it.each(cases)('grade %s %s: a version-less answer is ignored and a version 2 answer counts', (grade, id, code) => {
    const c = getCurriculum(grade);
    expect(c.source.versionOf({ kind: 'authored', id })).toBe(2);
    expect(masteryByStandard([attemptWith(id, code)], c).get(code)!.total).toBe(0);
    expect(masteryByStandard([attemptWith(id, code, 2)], c).get(code)!.total).toBe(1);
  });
});
```


- [ ] **Step 2: Run it to verify it fails**

Run: `npx vitest run src/curriculum/trapezoid.test.ts`
Expected: FAIL, 6 failed | 3 passed (9) (Grade 5 item, guide, keyConcept, the registry entry, and the Grade 5 stale-answer case).

- [ ] **Step 3: Flip the Grade 5 item, guide line and keyConcept, and drop the retired tag**

**Modify `src/curriculum/misconceptions.ts`**

```diff
@@ -519,11 +519,6 @@ export const MISCONCEPTIONS: Record<string, MisconceptionInfo> = Object.fromEntr
       'fraction-operations',
       'Rounded a fraction to the wrong benchmark value, such as rounding down when it was closer to the next whole number.',
     ),
-    entry(
-      'exclusive-trapezoid-definition',
-      'shape-classification',
-      "Used the exclusive definition of a trapezoid (exactly one pair of parallel sides) instead of NC's inclusive definition (at least one pair).",
-    ),
     entry(
       'inclusive-trapezoid-definition',
       'shape-classification',
```

**Modify `src/curriculum/grade5/authored.ts`**

```diff
@@ -1382,27 +1382,31 @@ export const GRADE_5_AUTHORED: Question[] = [
     id: 'g3-02',
     standardCode: 'NC.5.G.3',
     domainId: 'G',
-    prompt: 'A student claims: "All parallelograms are trapezoids, but not all trapezoids are parallelograms." Under North Carolina\'s standard course of study definition (where a trapezoid is a quadrilateral with at least one pair of parallel sides), is the student\'s claim true or false?',
+    prompt: 'A student claims: "All parallelograms are trapezoids, but not all trapezoids are parallelograms." Under North Carolina\'s standard course of study definition (where a trapezoid is a quadrilateral with exactly one pair of parallel sides), is the student\'s claim true or false?',
+    // Solved: a parallelogram has two pairs of parallel sides, which is not
+    // exactly one pair, so no parallelogram is a trapezoid (NC-R2). The first
+    // half of the claim is false, so the whole claim is false.
     options: labelOptions([
-      // Applied the exclusive definition ("exactly one pair of parallel sides").
-      { text: 'False, because a trapezoid can never have more than 1 pair of parallel sides', isCorrect: false, misconception: 'exclusive-trapezoid-definition' },
-      // Denied that parallelograms sit inside the quadrilateral category at all.
+      // Applied the inclusive definition ("at least one pair of parallel sides"), which NC does not use.
+      { text: 'True, because parallelograms have 2 pairs of parallel sides, which satisfies the requirement of having at least 1 pair', isCorrect: false, misconception: 'inclusive-trapezoid-definition' },
+      { text: 'False, because a parallelogram has 2 pairs of parallel sides, and a trapezoid has exactly 1 pair', isCorrect: true },
+      // Right verdict, wrong reason: denied that parallelograms sit inside the quadrilateral category at all.
       { text: 'False, because parallelograms are not quadrilaterals', isCorrect: false, misconception: 'hierarchy-too-narrow' },
-      // Right verdict, wrong reason: a quadrilateral with no parallel sides is not a trapezoid.
+      // A quadrilateral with no parallel sides is not a trapezoid either.
       { text: 'True, because all four-sided shapes are trapezoids', isCorrect: false, misconception: 'hierarchy-too-broad' },
-      { text: 'True, because parallelograms have 2 pairs of parallel sides, which satisfies the requirement of having at least 1 pair', isCorrect: true },
     ]),
     calculatorAllowed: false,
     isStretch: false,
     difficulty: 'mastery',
+    contentVersion: 2, // NC-R2: the key flipped from the inclusive to the exclusive definition
     explanation: {
       stepByStep: [
-        'Step 1: In North Carolina (inclusive definition), a trapezoid is defined as having at least one pair of parallel sides.',
-        'Step 2: A parallelogram has two pairs of parallel sides, which fulfills the condition "at least one".',
-        'Step 3: Thus, all parallelograms are subcategories of trapezoids.'
+        'Step 1: In North Carolina (exclusive definition), a trapezoid is defined as having exactly one pair of parallel sides.',
+        'Step 2: A parallelogram has two pairs of parallel sides, which is not exactly one pair.',
+        'Step 3: So a parallelogram is not a trapezoid, and the claim is false. Trapezoids and parallelograms are separate branches of the quadrilateral family.'
       ],
-      conceptSummary: 'NC inclusive quadrilateral hierarchy definition for trapezoids.',
-      commonMisconception: 'Using the exclusive trapezoid definition ("exactly one pair of parallel sides").'
+      conceptSummary: 'NC exclusive trapezoid definition: exactly one pair of parallel sides, so trapezoids and parallelograms are separate groups of quadrilaterals.',
+      commonMisconception: 'Using the inclusive trapezoid definition ("at least one pair of parallel sides"), which North Carolina does not use.'
     }
   },
   {
```

**Modify `src/curriculum/grade5/standards.ts`**

```diff
@@ -277,7 +277,7 @@ export const GRADE_5_DOMAINS: DomainInfo[] = [
         description: 'Understand that attributes belonging to a category of 2D figures also belong to all subcategories; classify quadrilaterals by properties in a hierarchy.',
         weightCategory: 'Core (MD & G share 19–23%)',
         keyConcepts: [
-          'Quadrilateral hierarchy: Polygons -> Quadrilaterals -> Trapezoids (NC definition: at least one pair of parallel sides) / Parallelograms -> Rectangles & Rhombuses -> Squares',
+          'Quadrilateral hierarchy: Polygons -> Quadrilaterals -> Parallelograms -> Rectangles & Rhombuses -> Squares; Trapezoids are a separate branch (NC definition: exactly one pair of parallel sides)',
           'All squares are rectangles and rhombuses, but not all rectangles are squares',
           'Parallelogram properties: 2 pairs of parallel sides, opposite sides congruent, opposite angles congruent',
           'Rhombus properties: 4 equal sides; Rectangle properties: 4 right angles'
```

**Modify `src/curriculum/grade5/studyGuides.ts`**

```diff
@@ -514,7 +514,7 @@ export const GRADE_5_STUDY_GUIDES: Record<string, StudyGuideSection> = {
     rulesAndFormulas: [
       { label: 'Polygon', detail: 'Closed 2D figure made of straight line segments.' },
       { label: 'Quadrilateral', detail: '4-sided polygon.' },
-      { label: 'Trapezoid (NC Definition)', detail: 'A quadrilateral with AT LEAST ONE pair of parallel sides (inclusive definition: parallelograms are also trapezoids).' },
+      { label: 'Trapezoid (NC Definition)', detail: 'A quadrilateral with EXACTLY ONE pair of parallel sides (exclusive definition: parallelograms, rectangles, rhombuses and squares are not trapezoids).' },
       { label: 'Parallelogram', detail: 'A quadrilateral with 2 pairs of parallel sides and opposite sides equal.' },
       { label: 'Rectangle', detail: 'A parallelogram with 4 right angles.' },
       { label: 'Rhombus', detail: 'A parallelogram with 4 equal sides.' },
@@ -528,7 +528,8 @@ export const GRADE_5_STUDY_GUIDES: Record<string, StudyGuideSection> = {
       'Step 5: If both 4 equal sides AND 4 right angles = square.'
     ],
     commonTraps: [
-      'Thinking a shape can only have ONE name (a square is simultaneously a square, a rectangle, a rhombus, a parallelogram, a trapezoid, and a quadrilateral!).',
+      'Thinking a shape can only have ONE name (a square is simultaneously a square, a rectangle, a rhombus, a parallelogram, and a quadrilateral!).',
+      'Calling a parallelogram a trapezoid. North Carolina uses the exclusive definition, exactly one pair of parallel sides, so a shape with two pairs is a parallelogram, not a trapezoid.',
       'Thinking all rectangles are squares (False: rectangles do not necessarily have 4 equal sides).'
     ],
     workedExample: {
```


- [ ] **Step 4: Run the test, the suite and the types**

Run: `npx vitest run src/curriculum/trapezoid.test.ts src/curriculum/misconceptions.test.ts` then `npm run test:run` then `npm run typecheck`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/curriculum/trapezoid.test.ts src/curriculum/misconceptions.ts src/curriculum/grade5/authored.ts src/curriculum/grade5/standards.ts src/curriculum/grade5/studyGuides.ts
git commit -m "fix: the exclusive trapezoid in grade 5, and a sweep that keeps it exclusive in every grade (NC-R2)" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01X5HSDdHPWxvHxgBaoSTbLX"
```

---

### Task 6: Grade 1 content: authored items, study guides and a practice test that covers every standard

Findings (content-g1): High `g1-g2-02` (option A "a triangle and a rectangle" is also true, a square is a rectangle), High `g1-md5-03` (25 is exactly five times a nickel, a dime is visibly smaller than a quarter), High NBT.1 guide (129 to 130 crosses a ten, not a hundred), Medium `g1-g3-02` D (contradicts the stem), Medium `g1-g3-04` A ("four fourths" is true of any whole), Medium NBT.5 (`g1-nbt5-02` and its guide: 94 + 10 = 104 needs the Grade 2 hundreds trade), Medium `g1-mock-ssa-01` (omits OA.7, NBT.3, MD.1, and its one stretch item is an abstract text puzzle), and the Low one-line guide fixes (MD.3, NBT.4, G.1, OA.2). Judgement: the readability guard on `promptDetails` and drawn figures are Plan C and out of scope (see Deferred).

**Files:**
- Modify: `src/curriculum/grade1/authored.g.ts`, `authored.md.ts`, `authored.nbt.ts`, `studyGuides.ts`, `quizzes.ts`, `grade1.test.ts`, `authored.nbt.test.ts`
- Create: `src/curriculum/grade1/audit.test.ts`

**Interfaces:**
- Consumes: Task 1's `contentVersion`.
- Produces: bumped ids `g1-g2-02`, `g1-g3-02`, `g1-g3-04`, `g1-nbt5-02`. `GRADE_1_QUIZZES` mock now has 23 ids (every standard once, all `-02` items except `g1-md2-03` for MD.2), time limit 25. Working: `84 + 10 = 94`; distractors 74 (10 less), 85 (ones digit changed), 84 (restated).

- [ ] **Step 1: Write the failing tests**

**Create `src/curriculum/grade1/audit.test.ts`**

```ts
import { describe, it, expect } from 'vitest';
import { GRADE_1 } from './index';
import { GRADE_1_AUTHORED } from './authored';
import { GRADE_1_STUDY_GUIDES } from './studyGuides';
import { standardsOf } from '../registry';

// Regression tests for docs/superpowers/audits/2026-09-30/content-g1.md.
// One test per finding, named after it.

const item = (id: string) => GRADE_1_AUTHORED.find((q) => q.id === id)!;
const texts = (id: string) => item(id).options.map((o) => o.text);
const guide = (code: string) => JSON.stringify(GRADE_1_STUDY_GUIDES[code]);

describe('content-g1 audit: authored items', () => {
  it('High g1-g2-02: no wrong option is true by subset (a square is a rectangle)', () => {
    const q = item('g1-g2-02');
    expect(q.prompt).toMatch(/triangle and a square/);
    for (const o of q.options.filter((x) => !x.isCorrect)) {
      expect(o.text, o.text).not.toMatch(/rectangle/i);
    }
    expect(q.contentVersion).toBe(2);
  });

  it('High g1-md5-03: the explanation makes no false claim about 25 or coin sizes', () => {
    const q = item('g1-md5-03');
    const blob = `${q.explanation.conceptSummary} ${q.explanation.commonMisconception}`;
    expect(blob).not.toMatch(/more than five times/i);
    expect(blob).not.toMatch(/similar in size/i);
    expect(blob).toMatch(/exactly five times/i);
  });

  it('Medium g1-g3-02: no option contradicts the stem, which says the 4 pieces are equal', () => {
    expect(texts('g1-g3-02').join(' | ')).not.toMatch(/even though one piece is bigger/i);
    expect(item('g1-g3-02').contentVersion).toBe(2);
  });

  it('Medium g1-g3-04: "Four fourths" is not offered as a wrong answer for a whole cut in two', () => {
    expect(texts('g1-g3-04')).not.toContain('Four fourths');
    expect(texts('g1-g3-04')).toContain('Two halves');
    expect(item('g1-g3-04').contentVersion).toBe(2);
  });

  it('Medium g1-nbt5-02: 10 more stays a two-digit number', () => {
    const q = item('g1-nbt5-02');
    expect(Number(q.options.find((o) => o.isCorrect)!.text)).toBeLessThan(100);
    expect(q.explanation.stepByStep.join(' ')).not.toMatch(/hundred/i);
    expect(q.contentVersion).toBe(2);
  });
});

describe('content-g1 audit: the practice test covers every standard', () => {
  const mock = GRADE_1.quizzes.find((q) => q.isMockAssessment)!;
  const standardOf = new Map<string, string>();
  for (const q of GRADE_1_AUTHORED) standardOf.set(q.id, q.standardCode);

  it('Medium g1-mock-ssa-01: every one of the 23 standards is on the form, once', () => {
    const codes = mock.questionIds.map((id) => standardOf.get(id)!);
    expect(codes.slice().sort()).toEqual(standardsOf(GRADE_1).map((s) => s.code).sort());
    expect(mock.questionIds).toHaveLength(23);
  });

  it('Medium g1-md2-02: the abstract stretch item is not on the form', () => {
    expect(mock.questionIds).not.toContain('g1-md2-02');
    const stretch = mock.questionIds.filter((id) => item(id).difficulty === 'stretch');
    expect(stretch).toEqual([]);
  });
});

describe('content-g1 audit: study guides', () => {
  it('High NBT.1: 129 to 130 is a ten, and only 99 to 100 crosses into the hundreds', () => {
    const g = GRADE_1_STUDY_GUIDES['NC.1.NBT.1'];
    expect(g.coreConcept).not.toMatch(/new hundred \(99 to 100, or 129 to 130\)/);
    expect(g.coreConcept).toMatch(/129 to 130 crosses a ten/);
    const rule = g.rulesAndFormulas.find((r) => /hundreds/i.test(r.label))!;
    expect(rule.detail).toMatch(/129 comes 130, which crosses a ten/);
    expect(g.workedExample.whyItMattersForSSA).not.toMatch(/past 99 and past 129/);
  });

  it('Medium NBT.5: the guide no longer teaches 10 more crossing into a hundred', () => {
    expect(guide('NC.1.NBT.5')).not.toMatch(/104|new hundred|new, brand-new hundred/i);
  });

  it('Low MD.3: a digital clock has no hour hand', () => {
    expect(guide('NC.1.MD.3')).not.toMatch(/or a digital one/);
  });

  it('Low NBT.4: no forward claim to a later grade (the file rule 3)', () => {
    expect(guide('NC.1.NBT.4')).not.toMatch(/later grade/);
  });

  it('Low G.1: the rhombus is not among the NC.1.G.1 shapes', () => {
    expect(JSON.stringify(GRADE_1_STUDY_GUIDES['NC.1.G.1'].workedExample)).not.toMatch(/rhombus/i);
  });

  it('Low OA.2: "always totals 20 or less" is scoped to this standard', () => {
    expect(guide('NC.1.OA.2')).not.toMatch(/always totals 20 or less/);
  });
});
```

**Modify `src/curriculum/grade1/authored.nbt.test.ts`**

```diff
@@ -103,13 +103,15 @@ describe('grade 1 NBT authored bank', () => {
     }
   });
 
-  // Ruling 23-8: NC.1.NBT.5 draws two-digit numbers 10-99, and the bank
-  // includes both a crossing into a new hundred and a drop into single
-  // digits.
-  it('covers both edges of NC.1.NBT.5s range', () => {
+  // Ruling 23-8: NC.1.NBT.5 draws two-digit numbers, and the bank includes
+  // both the top of the range and a drop into single digits. content-g1
+  // audit: no result reaches 100, because trading 10 tens for a hundred is
+  // Grade 2 place value.
+  it('covers both edges of NC.1.NBT.5s range, all below 100', () => {
     const correctValues = itemsFor('NC.1.NBT.5').map((q) => Number(q.options.find((o) => o.isCorrect)!.text));
-    expect(correctValues.some((v) => v >= 100)).toBe(true);
+    expect(correctValues.some((v) => v >= 90 && v <= 99)).toBe(true);
     expect(correctValues.some((v) => v < 10)).toBe(true);
+    expect(correctValues.every((v) => v < 100)).toBe(true);
   });
 
   // The brief's own founding errors, named verbatim. Each is checked on the
```

**Modify `src/curriculum/grade1/grade1.test.ts`**

```diff
@@ -127,7 +127,7 @@ describe('grade 1 curriculum', () => {
       counts[d] = (counts[d] ?? 0) + 1;
     }
     expect(mock.questionIds.length).toBeGreaterThanOrEqual(18);
-    expect(mock.questionIds.length).toBeLessThanOrEqual(22);
+    expect(mock.questionIds.length).toBeLessThanOrEqual(23);
     expect(counts.G).toBeGreaterThan(0);
 
     for (const [domainId, n] of Object.entries(counts)) {
```


- [ ] **Step 2: Run them to verify they fail**

Run: `npx vitest run src/curriculum/grade1/audit.test.ts src/curriculum/grade1/authored.nbt.test.ts src/curriculum/grade1/grade1.test.ts`
Expected: FAIL, 14 failed | 30 passed (44).

- [ ] **Step 3: Apply the content fixes**

**Modify `src/curriculum/grade1/authored.g.ts`**

```diff
@@ -185,7 +185,9 @@ export const GRADE_1_G_AUTHORED: Question[] = [
     // "Naming the components of the new shape" — ruling 24-7.
     prompt: 'A new shape is made from a triangle and a square joined. Which shapes make it up?',
     options: labelOptions([
-      { text: 'A triangle and a rectangle', isCorrect: false, misconception: 'misidentified-a-component-shape' },
+      // A circle is no part of a triangle joined to a square. (The old option,
+      // "A triangle and a rectangle", was also true: a square is a rectangle.)
+      { text: 'A triangle and a circle', isCorrect: false, misconception: 'misidentified-a-component-shape' },
       { text: 'A pentagon', isCorrect: false, misconception: 'named-the-composite-shape-instead-of-its-parts' },
       { text: 'A square and a circle', isCorrect: false, misconception: 'misidentified-a-component-shape' },
       { text: 'A triangle and a square', isCorrect: true },
@@ -193,6 +195,7 @@ export const GRADE_1_G_AUTHORED: Question[] = [
     calculatorAllowed: false,
     isStretch: false,
     difficulty: 'advanced',
+    contentVersion: 2,
     explanation: {
       stepByStep: [
         'Step 1: The question asks which two shapes were joined, not what the new shape is called overall.',
@@ -302,11 +305,15 @@ export const GRADE_1_G_AUTHORED: Question[] = [
       { text: 'A half', isCorrect: false, misconception: 'miscounted-the-number-of-equal-shares' },
       { text: 'A fourth', isCorrect: true },
       { text: 'A whole', isCorrect: false, misconception: 'miscounted-the-number-of-equal-shares' },
-      { text: 'A fourth, even though one piece is bigger', isCorrect: false, misconception: 'called-unequal-parts-equal-shares' },
+      // Read "4 pieces" as the name of the share: four fourths is the whole
+      // rectangle, not one piece of it. (The old option contradicted the
+      // stem, which says the 4 pieces are EQUAL.)
+      { text: 'Four fourths', isCorrect: false, misconception: 'miscounted-the-number-of-equal-shares' },
     ]),
     calculatorAllowed: false,
     isStretch: false,
     difficulty: 'mastery',
+    contentVersion: 2,
     explanation: {
       stepByStep: [
         'Step 1: The rectangle is split into 4 equal pieces.',
@@ -356,7 +363,9 @@ export const GRADE_1_G_AUTHORED: Question[] = [
     domainId: 'G',
     prompt: 'A rectangle is cut into 2 equal pieces. What is the whole rectangle made of?',
     options: labelOptions([
-      { text: 'Four fourths', isCorrect: false, misconception: 'miscounted-the-number-of-equal-shares' },
+      // Counted one half too many. (The old option, "Four fourths", is true of
+      // any whole, so only the context ruled it out.)
+      { text: 'Three halves', isCorrect: false, misconception: 'miscounted-the-number-of-equal-shares' },
       { text: 'One half', isCorrect: false, misconception: 'miscounted-the-number-of-equal-shares' },
       { text: 'Two halves', isCorrect: true },
       { text: 'Two fourths', isCorrect: false, misconception: 'miscounted-the-number-of-equal-shares' },
@@ -364,6 +373,7 @@ export const GRADE_1_G_AUTHORED: Question[] = [
     calculatorAllowed: false,
     isStretch: false,
     difficulty: 'advanced',
+    contentVersion: 2,
     explanation: {
       stepByStep: [
         'Step 1: The rectangle is split into 2 equal pieces.',
@@ -374,7 +384,7 @@ export const GRADE_1_G_AUTHORED: Question[] = [
       conceptSummary:
         'Just as 4 equal pieces make "four fourths," 2 equal pieces make "two halves" — the count of equal pieces and the whole\'s description always match.',
       commonMisconception:
-        'Naming the whole "four fourths" describes a rectangle split into 4 pieces, not the 2 pieces this one was actually split into.',
+        'Naming the whole "three halves" counts more pieces than the rectangle was cut into. It was cut into 2 pieces, so it is two halves.',
     },
   },
 ];
```

**Modify `src/curriculum/grade1/authored.md.ts`**

```diff
@@ -428,9 +428,9 @@ export const GRADE_1_MD_AUTHORED: Question[] = [
         'Step 4: A quarter is worth 25 pennies.',
       ],
       conceptSummary:
-        'The quarter is worth the most of the four coins in pennies: 25, more than five times a nickel\'s value.',
+        'The quarter is worth the most of the four coins in pennies: 25, exactly five times a nickel\'s value.',
       commonMisconception:
-        'A dime looks similar in size to a quarter but is worth far fewer pennies: 10, not 25.',
+        'A dime is worth far fewer pennies than a quarter: 10, not 25.',
     },
   },
   {
```

**Modify `src/curriculum/grade1/authored.nbt.ts`**

```diff
@@ -36,9 +36,11 @@ import { unitCount, tensAndOnes } from './templates/placeValue';
  *               founding error — believing 19 + 1 is 110 — and the other two
  *               are word problems, where the generator only ever asks a bare
  *               "Find the total".
- *   NC.1.NBT.5  10 more or 10 less, as word problems, including a case that
- *               crosses into a new hundred (94 and 10 more) and a case that
- *               goes down into single digits (13 and 10 less).
+ *   NC.1.NBT.5  10 more or 10 less than a two-digit number, as word
+ *               problems, including a case at the top of the range (84 and 10
+ *               more is 94) and a case that goes down into single digits (13
+ *               and 10 less). Results stay below 100: trading 10 tens for a
+ *               hundred is Grade 2 place value.
  *   NC.1.NBT.6  subtract two multiples of 10, as word problems.
  *
  * Every prompt passes `assertGradeOneReadable` (under 90 characters, at most
@@ -462,24 +464,27 @@ export const GRADE_1_NBT_AUTHORED: Question[] = [
     id: 'g1-nbt5-02',
     standardCode: 'NC.1.NBT.5',
     domainId: 'NBT',
-    prompt: 'There are 94 pretzels, and 10 more are added. How many now?',
+    // 84 + 10 = 94: one more ten, the ones stay 4. Distractors: 84 - 10 = 74,
+    // 84 + 1 = 85, and the restated 84.
+    prompt: 'There are 84 pretzels, and 10 more are added. How many now?',
     options: labelOptions([
-      { text: '104', isCorrect: true },
-      { text: '84', isCorrect: false, misconception: 'gave-10-less-instead-of-10-more' },
-      { text: '95', isCorrect: false, misconception: 'changed-the-ones-digit-instead-of-the-tens-digit' },
-      { text: '94', isCorrect: false, misconception: 'restated-a-known-number-instead-of-solving' },
+      { text: '94', isCorrect: true },
+      { text: '74', isCorrect: false, misconception: 'gave-10-less-instead-of-10-more' },
+      { text: '85', isCorrect: false, misconception: 'changed-the-ones-digit-instead-of-the-tens-digit' },
+      { text: '84', isCorrect: false, misconception: 'restated-a-known-number-instead-of-solving' },
     ]),
     calculatorAllowed: false,
     isStretch: false,
     difficulty: 'advanced',
+    contentVersion: 2,
     explanation: {
       stepByStep: [
-        'Step 1: 94 is 9 tens and 4 ones.',
-        'Step 2: 10 more than 9 tens is 10 tens, which trades for 1 new hundred.',
-        'Step 3: 10 more than 94 is 104.',
+        'Step 1: 84 is 8 tens and 4 ones.',
+        'Step 2: 10 more than 8 tens is 9 tens.',
+        'Step 3: 10 more than 84 is 94.',
       ],
-      conceptSummary: '10 more still works the same way once a number is close to 100 — it just crosses into a new hundred, the same way 9 + 1 crosses into a new ten.',
-      commonMisconception: 'Giving 10 less instead of 10 more lands on 84, moving the wrong direction.',
+      conceptSummary: '10 more only changes the tens digit: one more ten. The ones digit stays the same, so there is no need to count.',
+      commonMisconception: 'Giving 10 less instead of 10 more lands on 74, moving the wrong direction.',
     },
   },
   {
```

**Modify `src/curriculum/grade1/quizzes.ts`**

```diff
@@ -76,28 +76,26 @@ const MOD_G_QUESTION_IDS = [
   'g1-g3-01', 'g1-g3-02', 'g1-g3-03', 'g1-g3-04',
 ];
 
-/** The full simulation, allocated to each domain's share of the 23
- *  standards - there is no blueprint to allocate against. Every id uses the
+/** The full simulation: one item for every one of the 23 standards, so each
+ *  domain carries exactly its share and a child cannot reach the passing bar
+ *  without meeting a standard (it used to leave out NC.1.OA.7, NC.1.NBT.3 and
+ *  NC.1.MD.1). There is no blueprint to allocate against. Every id uses the
  *  "-02" authored item so nothing here duplicates the diagnostic's "-01"
- *  items.
+ *  items, except NC.1.MD.2, whose "-02" item is an abstract stretch question
+ *  about the effect of gaps and is replaced by its plain "-03" item.
  *
- *    OA  8/23 = 34.8%  -> 6.96 of 20 items -> rounds to 7
- *    NBT 7/23 = 30.4%  -> 6.09 of 20 items -> rounds to 6
- *    MD  5/23 = 21.7%  -> 4.35 of 20 items -> rounds to 4
- *    G   3/23 = 13.0%  -> 2.61 of 20 items -> rounds to 3
- *
- *  7 + 6 + 4 + 3 = 20 exactly. Each domain contributes one item per standard
- *  except for one standard skipped in OA (8 standards, 7 items: NC.1.OA.7
- *  skipped), one in NBT (7 standards, 6 items: NC.1.NBT.3 skipped) and one
- *  in MD (5 standards, 4 items: NC.1.MD.1 skipped) - Geometry's 3 items
- *  cover all 3 of its standards. */
+ *    OA  8/23 = 34.8%  -> 8 of 23 items
+ *    NBT 7/23 = 30.4%  -> 7 of 23 items
+ *    MD  5/23 = 21.7%  -> 5 of 23 items
+ *    G   3/23 = 13.0%  -> 3 of 23 items
+ */
 const MOCK_SSA_01_QUESTION_IDS = [
-  // Operations & Algebraic Thinking - 7 of 8 standards
-  'g1-oa1-02', 'g1-oa2-02', 'g1-oa3-02', 'g1-oa4-02', 'g1-oa9-02', 'g1-oa6-02', 'g1-oa8-02',
-  // Base Ten - 6 of 7 standards
-  'g1-nbt1-02', 'g1-nbt7-02', 'g1-nbt2-02', 'g1-nbt4-02', 'g1-nbt5-02', 'g1-nbt6-02',
-  // Measurement & Data - 4 of 5 standards
-  'g1-md2-02', 'g1-md3-02', 'g1-md5-02', 'g1-md4-02',
+  // Operations & Algebraic Thinking - 8 of 8 standards
+  'g1-oa1-02', 'g1-oa2-02', 'g1-oa3-02', 'g1-oa4-02', 'g1-oa9-02', 'g1-oa6-02', 'g1-oa7-02', 'g1-oa8-02',
+  // Base Ten - 7 of 7 standards
+  'g1-nbt1-02', 'g1-nbt7-02', 'g1-nbt2-02', 'g1-nbt3-02', 'g1-nbt4-02', 'g1-nbt5-02', 'g1-nbt6-02',
+  // Measurement & Data - 5 of 5 standards
+  'g1-md1-02', 'g1-md2-03', 'g1-md3-02', 'g1-md5-02', 'g1-md4-02',
   // Geometry - 3 of 3 standards
   'g1-g1-02', 'g1-g2-02', 'g1-g3-02',
 ];
@@ -154,7 +152,7 @@ export const GRADE_1_QUIZZES: QuizDefinition[] = [
     subtitle: (c: GradeCurriculum) =>
       `Comprehensive ${MOCK_SSA_01_QUESTION_IDS.length}-item practice test with items allocated across domains in proportion to each domain's share of the ${c.domains.reduce((n, d) => n + d.standards.length, 0)} Grade ${c.grade} standards - there is no official state blueprint to allocate against at this grade. Benchmarked against the ${c.ssa.passingPercent}% passing bar.`,
     isMockAssessment: true,
-    timeLimitMinutes: 20,
+    timeLimitMinutes: 25,
     questionIds: MOCK_SSA_01_QUESTION_IDS,
   },
 ];
```

**Modify `src/curriculum/grade1/studyGuides.ts`**

```diff
@@ -86,7 +86,7 @@ export const GRADE_1_STUDY_GUIDES: Record<string, StudyGuideSection> = {
     coreConcept:
       'When a story adds three numbers whose total is 20 or less, the three numbers do not have to be added in the order the story tells them. Looking for two of the three that make 10 - wherever they sit in the story - turns the problem into 10 plus one more number, which is quicker to add.',
     rulesAndFormulas: [
-      { label: 'Three addends, one problem', detail: 'A Grade 1 sum of three whole numbers always totals 20 or less.' },
+      { label: 'Three addends, one problem', detail: 'In this standard, the three numbers in a problem total 20 or less.' },
       { label: 'Any order, any grouping', detail: 'The three numbers can be added in whatever order is easiest, and the total stays the same.' },
       { label: 'Look for a ten', detail: 'If two of the three numbers make 10, add those first, then add the third number to 10.' },
     ],
@@ -325,11 +325,11 @@ export const GRADE_1_STUDY_GUIDES: Record<string, StudyGuideSection> = {
     standardCode: 'NC.1.NBT.1',
     title: 'Counting All the Way to 150',
     coreConcept:
-      'Counting on by ones works the same way no matter where you start or how far you go - all the way to 150. Sometimes the very next number crosses into a new ten (89 to 90), and sometimes it crosses into a new hundred (99 to 100, or 129 to 130). Both are still just "the next number," counted the same way.',
+      'Counting on by ones works the same way no matter where you start or how far you go - all the way to 150. Sometimes the very next number crosses into a new ten (89 to 90), and sometimes it crosses into a new hundred (99 to 100). Going from 129 to 130 crosses a ten inside the hundred, and the hundreds digit stays 1. All of these are still just "the next number," counted the same way.',
     rulesAndFormulas: [
       { label: 'Start anywhere below 150', detail: 'Counting on by ones can begin at any number less than 150, not only at 1.' },
       { label: 'Crossing a ten', detail: 'After 89 comes 90 - the ones digit resets to 0 and the tens digit goes up by one.' },
-      { label: 'Crossing into the hundreds', detail: 'After 99 comes 100, and after 129 comes 130 - the count keeps going the same way even as a new hundred begins.' },
+      { label: 'Crossing into the hundreds', detail: 'After 99 comes 100, and the hundreds digit goes up by one. After 129 comes 130, which crosses a ten: the hundreds digit stays 1 and the tens digit goes up by one.' },
     ],
     stepByStepMethod: [
       'Step 1: Say the number you are on.',
@@ -350,7 +350,7 @@ export const GRADE_1_STUDY_GUIDES: Record<string, StudyGuideSection> = {
       ],
       answer: '130',
       whyItMattersForSSA:
-        'Number & Operations in Base Ten is 7 of the 23 Grade 1 standards, and counting past 99 and past 129 the same way the count crosses every other ten is what lets a child count all the way to 150 without getting stuck at the trickiest spots.',
+        'Number & Operations in Base Ten is 7 of the 23 Grade 1 standards, and counting past 99 into the hundreds, and past 129 into a new ten, the same way the count crosses every other ten is what lets a child count all the way to 150 without getting stuck at the trickiest spots.',
     },
   },
 
@@ -458,7 +458,7 @@ export const GRADE_1_STUDY_GUIDES: Record<string, StudyGuideSection> = {
     standardCode: 'NC.1.NBT.4',
     title: 'Adding within 100: a One-Digit Number or a Multiple of Ten',
     coreConcept:
-      'This standard adds a two-digit number to either a one-digit number or a multiple of 10 - never two arbitrary two-digit numbers added together, which is work for a later grade. Adding a one-digit number can add up to 10 or more in the ones place, which trades for a new ten. Adding a multiple of 10 only ever changes the tens digit.',
+      'This standard adds a two-digit number to either a one-digit number or a multiple of 10 - never two arbitrary two-digit numbers added together. Adding a one-digit number can add up to 10 or more in the ones place, which trades for a new ten. Adding a multiple of 10 only ever changes the tens digit.',
     rulesAndFormulas: [
       { label: 'A two-digit number plus a one-digit number', detail: 'Add onto the ones place; if the ones reach 10 or more, trade ten ones for one more ten.' },
       { label: 'A two-digit number plus a multiple of 10', detail: 'Add onto the tens place only - the ones digit does not change.' },
@@ -491,33 +491,33 @@ export const GRADE_1_STUDY_GUIDES: Record<string, StudyGuideSection> = {
     standardCode: 'NC.1.NBT.5',
     title: '10 More or 10 Less, Found Mentally',
     coreConcept:
-      '10 more or 10 less than a two-digit number is found without counting, and it usually only changes the tens digit - the ones digit stays the same. Right at the edges, this needs one more step: if the tens digit is already 9, 10 more trades into a brand-new hundred (94 + 10 = 104); if the tens digit is already 1, 10 less leaves only the ones (13 − 10 = 3).',
+      '10 more or 10 less than a two-digit number is found without counting, and it usually only changes the tens digit - the ones digit stays the same. Right at the edge, this needs one more step: if the tens digit is already 1, 10 less leaves only the ones (13 − 10 = 3). The number you start from is a two-digit number, so 10 more stays below 100.',
     rulesAndFormulas: [
       { label: 'Usually, only the tens digit moves', detail: '47 + 10 = 57 and 47 − 10 = 37: the 7 ones never change.' },
-      { label: 'Crossing into a new hundred', detail: 'When the tens digit is already 9, 10 more trades those 10 tens for 1 new hundred: 94 + 10 = 104.' },
+      { label: 'The biggest tens digit', detail: 'The tens digit can go up to 9 when you add 10 to a number in the eighties: 84 + 10 = 94.' },
       { label: 'Down to just the ones', detail: 'When the tens digit is 1, 10 less removes that whole ten, leaving only the ones: 13 − 10 = 3.' },
     ],
     stepByStepMethod: [
       'Step 1: Find the tens digit and the ones digit of the number.',
       'Step 2: Move the tens digit up by one for 10 more, or down by one for 10 less.',
-      'Step 3: Check the edge cases - a tens digit already at 9 (adding) or at 1 (subtracting) needs the extra trade above.',
+      'Step 3: Check the edge case - a tens digit already at 1 (subtracting) leaves only the ones, as in 13 − 10 = 3.',
       'Step 4: The ones digit stays exactly the same throughout.',
     ],
     commonTraps: [
       'Changing the ones digit instead of the tens digit, turning 10 more into just 1 more.',
       'Moving in the wrong direction - giving 10 less when 10 more was asked for, or the reverse.',
-      'Forgetting the extra trade when the tens digit is already 9, and reporting a number 100 too small.',
+      'Forgetting that taking 10 from a number in the teens leaves only the ones, and writing 0 or a wrong digit in the tens place.',
     ],
     workedExample: {
-      problem: 'There are 94 pretzels, and 10 more are added. How many now?',
+      problem: 'There are 84 pretzels, and 10 more are added. How many now?',
       steps: [
-        '1. 94 is 9 tens and 4 ones.',
-        '2. 10 more than 9 tens is 10 tens, which trades for 1 new hundred.',
-        '3. 10 more than 94 is 104.',
+        '1. 84 is 8 tens and 4 ones.',
+        '2. 10 more than 8 tens is 9 tens.',
+        '3. 10 more than 84 is 94.',
       ],
-      answer: '104',
+      answer: '94',
       whyItMattersForSSA:
-        'Number & Operations in Base Ten is 7 of the 23 Grade 1 standards, and trading 10 tens for a new hundred here is the same trade adding a one-digit number within 100, elsewhere in this domain, uses when the ones reach 10.',
+        'Number & Operations in Base Ten is 7 of the 23 Grade 1 standards, and knowing that 10 more only moves the tens digit is what lets a child add a multiple of 10 within 100, elsewhere in this domain, without counting.',
     },
   },
 
@@ -629,7 +629,7 @@ export const GRADE_1_STUDY_GUIDES: Record<string, StudyGuideSection> = {
     standardCode: 'NC.1.MD.3',
     title: 'Telling Time to the Hour and Half-Hour',
     coreConcept:
-      'The short hour hand names the hour, and the long minute hand shows whether it is exactly on the hour or half past. When the minute hand points at the 12, it is exactly on the hour. When the minute hand points at the 6, it is half past the hour - and at half past, the hour hand always sits halfway between the hour it just passed and the next one, on an analog clock or a digital one.',
+      'The short hour hand names the hour, and the long minute hand shows whether it is exactly on the hour or half past. When the minute hand points at the 12, it is exactly on the hour. When the minute hand points at the 6, it is half past the hour - and at half past, the hour hand always sits halfway between the hour it just passed and the next one, on an analog clock.',
     rulesAndFormulas: [
       { label: 'Minute hand at 12', detail: 'Exactly on the hour, written with :00.' },
       { label: 'Minute hand at 6', detail: 'Half past the hour, written with :30.' },
@@ -763,7 +763,7 @@ export const GRADE_1_STUDY_GUIDES: Record<string, StudyGuideSection> = {
       ],
       answer: 'No - it also needs 4 square corners',
       whyItMattersForSSA:
-        'Geometry is 3 of the 23 Grade 1 standards, and checking every defining attribute a shape\'s name requires - not just one - is what keeps a rhombus from being mistaken for a rectangle.',
+        'Geometry is 3 of the 23 Grade 1 standards, and checking every defining attribute a shape\'s name requires - not just one - is what keeps a four-sided shape with no square corners from being mistaken for a rectangle.',
     },
   },
```


- [ ] **Step 4: Run the tests, the suite and the types**

Run: `npx vitest run src/curriculum/grade1` then `npm run test:run` then `npm run typecheck`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/curriculum/grade1/audit.test.ts src/curriculum/grade1/authored.nbt.test.ts src/curriculum/grade1/grade1.test.ts src/curriculum/grade1/authored.g.ts src/curriculum/grade1/authored.md.ts src/curriculum/grade1/authored.nbt.ts src/curriculum/grade1/quizzes.ts src/curriculum/grade1/studyGuides.ts
git commit -m "fix: grade 1 items, guides and a practice test that covers all 23 standards (content-g1)" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01X5HSDdHPWxvHxgBaoSTbLX"
```

---

### Task 7: Grade 1 generators: nbt1, nbt5, oa9, md4

Findings: Medium `nbt1.count-past-a-ten` (the "side by side" distractor printed junk like `49, 410, 411`, replaced by a real slip: the second number said twice), Medium `oa9.add/subtract-within-10` (the misconception sentence always described the hop distractor although half the seeds offer the other slip, and named a number that was not an option), Medium `nbt5.ten-more-or-less` (results over 99), Low `md4` (`apples's`, lowercase sentence start). The two templates whose options or draw space changed are bumped to version 2.

**Files:**
- Modify: `src/curriculum/misconceptions.ts` (add `said-the-same-number-twice-while-counting`), `src/curriculum/grade1/templates/nbt1-count-past-a-ten.ts`, `nbt5-ten-more-or-less.ts`, `oa9-add-within-10.ts`, `oa9-subtract-within-10.ts`, `md4-read-the-data.ts`, and their `.test.ts` files

**Interfaces:**
- Consumes: Task 1's `QuestionTemplate.contentVersion`.
- Produces: templates `g1.nbt1.count-past-a-ten` and `g1.nbt5.ten-more-or-less` at version 2; `TEN_DRAWS.length === 170` (90 numbers times two directions, minus the ten "10 more" draws of 90 to 99). Tag `said-the-same-number-twice-while-counting` (family `patterns-and-sequences`) replaces the use of `wrote-the-digits-side-by-side-instead-of-adding-the-values` in this template only (that tag stays in use in `g1-nbt4-01` and Grade 2).

Fixed-seed pins below were obtained by running the generator, as the file's standing ruling requires; each was checked against its prompt by hand (`71 + 10 = 81`, opposite `61`, ones shift `72`, restated `71`).

- [ ] **Step 1: Write the failing tests**

**Modify `src/curriculum/grade1/templates/md4-read-the-data.test.ts`**

```diff
@@ -19,6 +19,18 @@ function typeOf(prompt: string): 'total' | 'category' | 'compare' {
 }
 
 describe('g1.md4.read-the-data', () => {
+  // content-g1 audit (Low): "Reading apples's count" and "apples and bananas
+  // are different categories" starting a sentence in lowercase.
+  it('Low: explanations capitalise a sentence start and never write a plural possessive', () => {
+    for (let seed = 0; seed < 300; seed++) {
+      const g = md4ReadTheData.generate(makeRng(seed));
+      for (const line of [...g.explanation.stepByStep, g.explanation.commonMisconception ?? '']) {
+        expect(line, `seed ${seed}`).not.toMatch(/s's /);
+        expect(line, `seed ${seed}: "${line}"`).not.toMatch(/(?:^|\. )[a-z]/);
+      }
+    }
+  });
+
   it('is sound at every seed', () => {
     assertTemplateSound(md4ReadTheData);
   });
```

**Modify `src/curriculum/grade1/templates/nbt1-count-past-a-ten.test.ts`**

```diff
@@ -35,8 +35,8 @@ function expected(start: number) {
     skip: from(ten + 10),
     omit: from(ten + 1),
     early: [start, start + 1, start + 2],
-    // Ten ones written beside the old tens: 119 -> "1110", then "1111".
-    sideBySide: key.map((n, i) => (i < at ? `${n}` : `${ten / 10 - 1}${10 + (i - at)}`)).join(', '),
+    // The second number said twice: 20, 21, 22 -> 20, 21, 21.
+    repeated: [key[0], key[1], key[1]],
   };
 }
 
@@ -46,13 +46,19 @@ const optionsOf = (d: CountDraw) => {
     e.key.join(', '),
     (d.tenSlip === 'back' ? e.back : e.skip).join(', '),
     (d.countSlip === 'early' ? e.early : e.omit).join(', '),
-    e.sideBySide,
+    e.repeated.join(', '),
   ];
 };
-/** Every number an option prints, except the side-by-side error form. */
+/** Every number an option prints, except the repeated-number error form (its
+ *  numbers are all ones the key prints). */
 const printed = (d: CountDraw) => optionsOf(d).slice(0, 3).flatMap(numbersIn);
 
 describe('g1.nbt1.count-past-a-ten', () => {
+  it('bumps its content version: a distractor was replaced', () => {
+    expect(nbt1CountPastATen.contentVersion).toBe(2);
+  });
+
+
   it('is sound at every seed', () => {
     assertTemplateSound(nbt1CountPastATen);
   });
@@ -109,9 +115,12 @@ describe('g1.nbt1.count-past-a-ten', () => {
       expect(!!early !== !!omit, `seed ${seed}: exactly one count slip`).toBe(true);
       if (early) expect(early.text, `seed ${seed}`).toBe(e.early.join(', '));
       if (omit) expect(omit.text, `seed ${seed}`).toBe(e.omit.join(', '));
-      expect(byTag(g, 'wrote-the-digits-side-by-side-instead-of-adding-the-values')!.text, `seed ${seed}`).toBe(
-        e.sideBySide,
+      expect(byTag(g, 'said-the-same-number-twice-while-counting')!.text, `seed ${seed}`).toBe(
+        e.repeated.join(', '),
       );
+      // content-g1 audit (Medium): the old side-by-side option printed junk
+      // such as "49, 410, 411", which no child writes.
+      expect(g.options.every((o) => numbersIn(o.text).every((n) => n <= 150)), `seed ${seed}`).toBe(true);
     }
   });
 
@@ -169,13 +178,13 @@ describe('g1.nbt1.count-past-a-ten', () => {
     const g = gen(7);
     expect(g.prompt).toBe('Count on from 19. What are the next three numbers?');
     expect(g.answerText).toBe('20, 21, 22');
-    expect(g.options.map((o) => o.text)).toEqual(['110, 111, 112', '10, 11, 12', '21, 22, 23', '20, 21, 22']);
+    expect(g.options.map((o) => o.text)).toEqual(['20, 21, 21', '10, 11, 12', '21, 22, 23', '20, 21, 22']);
   });
 
   it('pins seed 100', () => {
     const g = gen(100);
     expect(g.prompt).toBe('Count on from 38. What are the next three numbers?');
     expect(g.answerText).toBe('39, 40, 41');
-    expect(g.options.map((o) => o.text)).toEqual(['39, 40, 41', '39, 41, 42', '39, 310, 311', '39, 50, 51']);
+    expect(g.options.map((o) => o.text)).toEqual(['39, 40, 41', '39, 41, 42', '39, 40, 40', '39, 50, 51']);
   });
 });
```

**Modify `src/curriculum/grade1/templates/nbt5-ten-more-or-less.test.ts`**

```diff
@@ -17,6 +17,11 @@ function parse(prompt: string) {
 }
 
 describe('g1.nbt5.ten-more-or-less', () => {
+  it('bumps its content version: its draw space changed', () => {
+    expect(nbt5TenMoreOrLess.contentVersion).toBe(2);
+  });
+
+
   it('is sound at every seed', () => {
     assertTemplateSound(nbt5TenMoreOrLess);
   });
@@ -75,9 +80,17 @@ describe('g1.nbt5.ten-more-or-less', () => {
     }
   });
 
-  it('reaches into a new hundred for numbers in the nineties going up', () => {
-    const reachedTripleDigit = TEN_DRAWS.some((d) => d.direction === 'more' && d.n + 10 >= 100);
-    expect(reachedTripleDigit).toBe(true);
+  // content-g1 audit (Medium): "10 more than 94 = 104" needs the Grade 2 idea
+  // of trading ten tens for a hundred, and the old step "only the tens digit
+  // changes" was false there.
+  it('F: 10 more never reaches 100, so only the tens digit changes', () => {
+    expect(TEN_DRAWS.some((d) => d.direction === 'more' && d.n + 10 >= 100)).toBe(false);
+    for (let seed = 0; seed < 2000; seed++) {
+      const g = gen(seed);
+      const { direction, n } = parse(g.prompt);
+      if (direction === 'more') expect(Number(g.answerText), `seed ${seed}`).toBeLessThanOrEqual(99);
+      else expect(n, `seed ${seed}`).toBeGreaterThanOrEqual(10);
+    }
   });
 
   it('does not always put the correct answer at the same rank', () => {
@@ -91,10 +104,12 @@ describe('g1.nbt5.ten-more-or-less', () => {
   });
 
   it('has no colliding option anywhere in its draw space', () => {
-    // LITERAL: 90 numbers (10-99) x 2 directions, and none of them collide or
-    // go negative (10 less than 10 is 0, and its ones-shift distractor is 9).
+    // LITERAL: 90 numbers (10-99) x 2 directions = 180, minus the ten "10 more"
+    // draws of 90-99 that would reach 100 or more = 170. None of the 170
+    // collide or go negative (10 less than 10 is 0, and its ones-shift
+    // distractor is 9).
     expect(ALL_TEN_DRAWS.length).toBe(180);
-    expect(TEN_DRAWS.length).toBe(ALL_TEN_DRAWS.length);
+    expect(TEN_DRAWS.length).toBe(170);
     for (let seed = 0; seed < 3000; seed++) {
       const g = gen(seed);
       expect(new Set(g.options.map((o) => o.text)).size, `seed ${seed}`).toBe(4);
@@ -105,15 +120,15 @@ describe('g1.nbt5.ten-more-or-less', () => {
   // the generator, never hand-derived.
   it('pins seed 3', () => {
     const g = gen(3);
-    expect(g.prompt).toBe('What is 10 less than 74?');
-    expect(g.answerText).toBe('64');
-    expect(g.options.map((o) => o.text)).toEqual(['73', '74', '84', '64']);
+    expect(g.prompt).toBe('What is 10 more than 71?');
+    expect(g.answerText).toBe('81');
+    expect(g.options.map((o) => o.text)).toEqual(['72', '71', '61', '81']);
   });
 
   it('pins seed 50', () => {
     const g = gen(50);
-    expect(g.prompt).toBe('What is 10 less than 58?');
-    expect(g.answerText).toBe('48');
-    expect(g.options.map((o) => o.text)).toEqual(['57', '58', '68', '48']);
+    expect(g.prompt).toBe('What is 10 more than 56?');
+    expect(g.answerText).toBe('66');
+    expect(g.options.map((o) => o.text)).toEqual(['57', '56', '46', '66']);
   });
 });
```

**Modify `src/curriculum/grade1/templates/oa9-add-within-10.test.ts`**

```diff
@@ -123,9 +123,16 @@ describe('g1.oa9.add-within-10', () => {
         `Step 2: Count on ${small} more: ${counts.join(', ')}.`,
         `Step 3: ${a} + ${b} = ${sum}.`,
       ]);
-      expect(g.explanation.commonMisconception).toBe(
-        `Saying ${big} as the first count lands on ${sum - 1}, one short. The first number to say is ${big + 1}.`,
+      // Audit (Medium): the explanation must describe the distractor that is
+      // actually on offer, and the number it names must be one of the options.
+      const hop = byTag(g, 'counted-the-start-number-as-a-hop');
+      expect(g.explanation.commonMisconception, `seed ${seed}`).toBe(
+        hop
+          ? `Saying ${big} as the first count lands on ${sum - 1}, one short. The first number to say is ${big + 1}.`
+          : `Counting one more time than ${small} lands on ${sum + 1}, one too far. Stop after ${small} ${small === 1 ? 'count' : 'counts'}, at ${sum}.`,
       );
+      const named = Number(/lands on (\d+)/.exec(g.explanation.commonMisconception!)![1]);
+      expect(g.options.map((o) => Number(o.text)), `seed ${seed}: names ${named}`).toContain(named);
     }
   });
```

**Modify `src/curriculum/grade1/templates/oa9-subtract-within-10.test.ts`**

```diff
@@ -106,9 +106,16 @@ describe('g1.oa9.subtract-within-10', () => {
         `Step 2: Count on from ${b} to ${a}: ${counts.join(', ')}. That is ${diff} ${diff === 1 ? 'count' : 'counts'}.`,
         `Step 3: ${a} − ${b} = ${diff}.`,
       ]);
-      expect(g.explanation.commonMisconception).toBe(
-        `Counting back from ${a} and saying ${a} as the first count lands on ${diff + 1}. The first number to say is ${a - 1}.`,
+      // Audit (Medium): oa9.subtract seed 1, "3 - 2", said "lands on 2" while
+      // 2 was not an option. The named number must be on offer at every seed.
+      const hop = byTag(g, 'counted-the-start-number-as-a-hop');
+      expect(g.explanation.commonMisconception, `seed ${seed}`).toBe(
+        hop
+          ? `Counting back from ${a} and saying ${a} as the first count lands on ${diff + 1}. The first number to say is ${a - 1}.`
+          : `Counting back one time too many from ${a} lands on ${diff - 1}. Stop after ${b} ${b === 1 ? 'count' : 'counts'} back, at ${diff}.`,
       );
+      const named = Number(/lands on (\d+)/.exec(g.explanation.commonMisconception!)![1]);
+      expect(g.options.map((o) => Number(o.text)), `seed ${seed}: names ${named}`).toContain(named);
     }
   });
```


- [ ] **Step 2: Run them to verify they fail**

Run: `npx vitest run src/curriculum/grade1/templates/md4-read-the-data.test.ts src/curriculum/grade1/templates/nbt1-count-past-a-ten.test.ts src/curriculum/grade1/templates/nbt5-ten-more-or-less.test.ts src/curriculum/grade1/templates/oa9-add-within-10.test.ts src/curriculum/grade1/templates/oa9-subtract-within-10.test.ts`
Expected: FAIL, 12 failed | 58 passed (70).

- [ ] **Step 3: Change the generators**

**Modify `src/curriculum/misconceptions.ts`**

```diff
@@ -529,6 +529,11 @@ export const MISCONCEPTIONS: Record<string, MisconceptionInfo> = Object.fromEntr
       'shape-classification',
       "Took a parallelogram's two pairs of parallel sides as the requirement for a trapezoid, instead of exactly one pair.",
     ),
+    entry(
+      'said-the-same-number-twice-while-counting',
+      'patterns-and-sequences',
+      'While counting on by ones, said the same number twice in a row instead of moving on to the next number.',
+    ),
     entry(
       'forgot-the-final-step',
       'incomplete-procedure',
```

**Modify `src/curriculum/grade1/templates/md4-read-the-data.ts`**

```diff
@@ -41,6 +41,9 @@ import { labelOptions } from '../../../engine/questionModel';
  */
 export type DataTriple = readonly [number, number, number];
 
+/** "apples" -> "Apples": a sentence never starts in lowercase. */
+const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
+
 export const ALL_DATA_DRAWS: DataTriple[] = [];
 for (let a = 1; a <= 9; a++) {
   for (let b = a + 1; b <= 9; b++) {
@@ -137,12 +140,12 @@ export const md4ReadTheData: QuestionTemplate = {
           stepByStep: [
             `Step 1: Find ${target.name} on the graph.`,
             `Step 2: ${target.count} students picked ${target.name}.`,
-            `Step 3: ${others[0].name} and ${others[1].name} are different categories, not this one.`,
+            `Step 3: ${capitalize(others[0].name)} and ${others[1].name} are different categories, not this one.`,
             `Step 4: ${target.count} students picked ${target.name}.`,
           ],
           conceptSummary:
             'Each category on a graph has its own count. Answering a question about one category means reading that category\'s own row, not another one.',
-          commonMisconception: `Reading ${others[0].name}'s count instead answers about the wrong category.`,
+          commonMisconception: `Reading the count for ${others[0].name} instead answers about the wrong category.`,
         },
       };
     }
```

**Modify `src/curriculum/grade1/templates/nbt1-count-past-a-ten.ts`**

```diff
@@ -25,9 +25,10 @@ import { labelOptions } from '../../../engine/questionModel';
  *   or skipped-a-ten-while-counting                     ...counted on from ten+10
  *   listed-the-starting-number-as-the-first-count       start, start+1, start+2
  *   or skipped-a-number-while-counting                  ...counted on from ten+1
- *   wrote-the-digits-side-by-side-instead-of-adding-the-values
- *     the crossed ten's own tens digit (11 for 120) written beside "10", "11",
- *     "12" instead of trading up: 119, 1110, 1111 for a count crossing 120.
+ *   said-the-same-number-twice-while-counting
+ *     the second number of the count said again: 20, 21, 21 for a count of
+ *     20, 21, 22. It never equals a list that counts on, because those all
+ *     increase, so it cannot collide with another option.
  *
  * NO SIZE TELL. A draw whose printed numbers would exceed 150 is left out of
  * the pool entirely (never resampled), which the sibling test proves reaches
@@ -63,8 +64,8 @@ function lists(d: CountDraw) {
   const from = (first: number) => key.map((n, i) => (i < at0 ? n : first + (i - at0)));
   const tenList = d.tenSlip === 'back' ? from(d.ten - 10) : from(d.ten + 10);
   const countList = d.countSlip === 'early' ? [start, start + 1, start + 2] : from(d.ten + 1);
-  const sideBySide = key.map((n, i) => (i < at0 ? `${n}` : `${d.ten / 10 - 1}${10 + (i - at0)}`)).join(', ');
-  return { start, at0, key, tenList, countList, sideBySide };
+  const repeated = [key[0], key[1], key[1]];
+  return { start, at0, key, tenList, countList, repeated };
 }
 
 export const COUNT_DRAWS: CountDraw[] = ALL_COUNT_DRAWS.filter((d) => {
@@ -79,10 +80,11 @@ export const nbt1CountPastATen: QuestionTemplate = {
   difficulty: 'mastery',
   calculatorAllowed: false,
   isStretch: false,
+  contentVersion: 2, // the side-by-side distractor was replaced
 
   generate(rng: Rng): GeneratedQuestion {
     const d = rng.pick(COUNT_DRAWS);
-    const { start, key, tenList, countList, sideBySide } = lists(d);
+    const { start, key, tenList, countList, repeated } = lists(d);
 
     const answerText = key.join(', ');
     const candidates = [
@@ -93,7 +95,7 @@ export const nbt1CountPastATen: QuestionTemplate = {
       d.countSlip === 'early'
         ? { text: countList.join(', '), isCorrect: false, misconception: 'listed-the-starting-number-as-the-first-count' }
         : { text: countList.join(', '), isCorrect: false, misconception: 'skipped-a-number-while-counting' },
-      { text: sideBySide, isCorrect: false, misconception: 'wrote-the-digits-side-by-side-instead-of-adding-the-values' },
+      { text: repeated.join(', '), isCorrect: false, misconception: 'said-the-same-number-twice-while-counting' },
     ];
 
     const texts = candidates.map((c) => c.text);
```

**Modify `src/curriculum/grade1/templates/nbt5-ten-more-or-less.ts`**

```diff
@@ -12,10 +12,11 @@ import { unitCount } from './placeValue';
  * digit — the standard's own point, "without having to count" — so the ones
  * digit of every distractor still matches the ones digit of the number.
  *
- * 10 more of a number in the nineties crosses into a new hundred (94 -> 104);
- * 10 less of a number in the teens or twenties can reach single digits
- * (13 -> 3) but never goes below 0, since the smallest draw is 10 (10 less
- * than 10 is 0).
+ * "10 more" is only drawn for 10 to 89, so the answer stays a two-digit number
+ * (84 -> 94): trading 10 tens for a new hundred is Grade 2 place value, not
+ * NC.1.NBT.5. 10 less of a number in the teens or twenties can reach single
+ * digits (13 -> 3) but never goes below 0, since the smallest draw is 10 (10
+ * less than 10 is 0).
  *
  * ---------------------------------------------------------------------------
  *   answer                                          n + 10  or  n - 10
@@ -45,7 +46,11 @@ function optionsFor(n: number, direction: 'more' | 'less'): string[] {
 }
 
 export const TEN_DRAWS: TenMoreOrLessDraw[] = ALL_TEN_DRAWS.filter(
-  (d) => new Set(optionsFor(d.n, d.direction)).size === 4 && optionsFor(d.n, d.direction).every((t) => Number(t) >= 0),
+  (d) =>
+    new Set(optionsFor(d.n, d.direction)).size === 4 &&
+    optionsFor(d.n, d.direction).every((t) => Number(t) >= 0) &&
+    // Stay two-digit: 10 more than 90 or more would be a hundred.
+    (d.direction === 'less' || d.n + 10 <= 99),
 );
 
 export const nbt5TenMoreOrLess: QuestionTemplate = {
@@ -55,6 +60,7 @@ export const nbt5TenMoreOrLess: QuestionTemplate = {
   difficulty: 'mastery',
   calculatorAllowed: false,
   isStretch: false,
+  contentVersion: 2, // "10 more" no longer reaches 100 or more
 
   generate(rng: Rng): GeneratedQuestion {
     const { n, direction } = rng.pick(TEN_DRAWS);
```

**Modify `src/curriculum/grade1/templates/oa9-add-within-10.ts`**

```diff
@@ -105,7 +105,10 @@ export const oa9AddWithin10: QuestionTemplate = {
           a === b
             ? 'Facts within 10 are worth knowing by heart, so the answer comes without counting. Until then, start at one of the numbers and count on the other: the first number to say is one more than where you start.'
             : 'Facts within 10 are worth knowing by heart, so the answer comes without counting. Until then, start at the bigger number and count on: the first number to say is one more than where you start.',
-        commonMisconception: `Saying ${big} as the first count lands on ${sum - 1}, one short. The first number to say is ${big + 1}.`,
+        commonMisconception:
+          slip === 'hop'
+            ? `Saying ${big} as the first count lands on ${sum - 1}, one short. The first number to say is ${big + 1}.`
+            : `Counting one more time than ${small} lands on ${sum + 1}, one too far. Stop after ${small} ${small === 1 ? 'count' : 'counts'}, at ${sum}.`,
       },
     };
   },
```

**Modify `src/curriculum/grade1/templates/oa9-subtract-within-10.ts`**

```diff
@@ -98,7 +98,10 @@ export const oa9SubtractWithin10: QuestionTemplate = {
         ],
         conceptSummary:
           'Every take-away fact within 10 has an adding fact that undoes it, so knowing 3 + 4 = 7 means knowing 7 − 4 = 3. Facts within 10 are worth knowing by heart.',
-        commonMisconception: `Counting back from ${a} and saying ${a} as the first count lands on ${diff + 1}. The first number to say is ${a - 1}.`,
+        commonMisconception:
+          slip === 'hop'
+            ? `Counting back from ${a} and saying ${a} as the first count lands on ${diff + 1}. The first number to say is ${a - 1}.`
+            : `Counting back one time too many from ${a} lands on ${diff - 1}. Stop after ${b} ${b === 1 ? 'count' : 'counts'} back, at ${diff}.`,
       },
     };
   },
```


- [ ] **Step 4: Run the tests, the suite and the types**

Run: `npx vitest run src/curriculum/grade1` then `npm run test:run` then `npm run typecheck`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/curriculum/grade1/templates/md4-read-the-data.test.ts src/curriculum/grade1/templates/nbt1-count-past-a-ten.test.ts src/curriculum/grade1/templates/nbt5-ten-more-or-less.test.ts src/curriculum/grade1/templates/oa9-add-within-10.test.ts src/curriculum/grade1/templates/oa9-subtract-within-10.test.ts src/curriculum/misconceptions.ts src/curriculum/grade1/templates/md4-read-the-data.ts src/curriculum/grade1/templates/nbt1-count-past-a-ten.ts src/curriculum/grade1/templates/nbt5-ten-more-or-less.ts src/curriculum/grade1/templates/oa9-add-within-10.ts src/curriculum/grade1/templates/oa9-subtract-within-10.ts
git commit -m "fix: grade 1 generators: real counting slip, honest misconception text, two-digit results (content-g1)" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01X5HSDdHPWxvHxgBaoSTbLX"
```

---

### Task 8: Grade 2 authored items and the tags a child is shown (content-g2 High and Medium)

`QuizResults` shows the misconception tag to the child, so a wrong tag is wrong on screen. Findings: High `g2-oa3-03` A and `g2-oa3-04` A and B (tags that did not describe the error: `judged-the-total-by-the-count-of-pairs` on `6 + 8 = 14`, `miscounted-while-pairing-the-objects` on a false sum), Medium `g2-oa3-01/02/03` (distractors `16 crayons`, `6 pairs`, `18 buttons` were not answers to the question and were ruled out by form), Medium `g2-nbt4-04` and `g2-g3-04` (reading level: 15 to 20 word options with nested clauses), Low `g2-oa1-04` (a friend nobody mentioned) and `g2-nbt8-04` (muddled prose). Three tags are added and used here; the fourth odd/even tag is added with its template in Task 9.

**Files:**
- Modify: `src/curriculum/misconceptions.ts`, `src/curriculum/grade2/authored.oa.ts`, `authored.nbt.ts`, `authored.g.ts`
- Create: `src/curriculum/grade2/audit.test.ts`

**Interfaces:**
- Consumes: Task 1's `contentVersion`.
- Produces: tags `guessed-odd-or-even-from-the-size-of-the-number`, `split-into-unequal-groups-and-called-them-equal`, `wrote-a-sum-that-does-not-match-the-addends` (all `incomplete-procedure`); bumped ids `g2-oa3-01`, `g2-oa3-02`, `g2-oa3-03`, `g2-nbt4-04`, `g2-g3-04`. `g2-oa3-04` keeps its options and only its tags change, so it is not bumped.

Judgement on the audit: the `g2.nbt4.compare-three-digit` template options are already one short clause (about 12 words), so the "shorten the template options" half of that Medium finding is not changed (see the report).

- [ ] **Step 1: Write the failing tests**

**Create `src/curriculum/grade2/audit.test.ts`**

```ts
import { describe, it, expect } from 'vitest';
import { GRADE_2_AUTHORED } from './authored';
import { MISCONCEPTIONS } from '../misconceptions';

// Regression tests for docs/superpowers/audits/2026-09-30/content-g2.md.

const item = (id: string) => GRADE_2_AUTHORED.find((q) => q.id === id)!;
const tagOf = (id: string, text: string) => item(id).options.find((o) => o.text === text)?.misconception;

describe('content-g2 audit: authored odd/even and equal-groups items', () => {
  it('High g2-oa3-04: option A (6 + 8) is tagged for unequal addends, B (6 + 6 = 12) for a false sum', () => {
    expect(tagOf('g2-oa3-04', '6 + 8 = 14')).toBe('split-into-unequal-groups-and-called-them-equal');
    expect(tagOf('g2-oa3-04', '6 + 6 = 12')).toBe('wrote-a-sum-that-does-not-match-the-addends');
    // The registry text of the old tag on A was about PAIRS; the new ones must say what they mean.
    expect(MISCONCEPTIONS['split-into-unequal-groups-and-called-them-equal'].description).toMatch(/not the same size/i);
    expect(MISCONCEPTIONS['wrote-a-sum-that-does-not-match-the-addends'].description).toMatch(/do not add up/i);
  });

  it('High g2-oa3-03: "Yes, 10 and 8" is tagged for unequal groups, not for miscounting pairs', () => {
    expect(tagOf('g2-oa3-03', 'Yes — 10 buttons in one group and 8 in the other.')).toBe(
      'split-into-unequal-groups-and-called-them-equal',
    );
  });

  it('Medium g2-oa3-01/02/03: every option answers the question that was asked', () => {
    // The old distractors "16 crayons", "6 pairs" and "18 buttons" were not
    // answers to "odd or even?" or "yes or no?", so they were ruled out by form.
    for (const id of ['g2-oa3-01', 'g2-oa3-02']) {
      for (const o of item(id).options) expect(o.text, `${id}: ${o.text}`).toMatch(/^(Odd|Even), because /);
    }
    for (const o of item('g2-oa3-03').options) expect(o.text, o.text).toMatch(/^(Yes|No) — /);
    for (const id of ['g2-oa3-01', 'g2-oa3-02', 'g2-oa3-03']) expect(item(id).contentVersion, id).toBe(2);
  });

  it('Medium g2-nbt4-04: each option is one short clause', () => {
    for (const o of item('g2-nbt4-04').options) {
      expect(o.text.length, o.text).toBeLessThanOrEqual(62);
      expect((o.text.match(/because/g) ?? []).length, `${o.text}: one reason, no second clause`).toBe(1);
    }
    expect(item('g2-nbt4-04').explanation.stepByStep.at(-1)).toContain(
      item('g2-nbt4-04').options.find((o) => o.isCorrect)!.text,
    );
    expect(item('g2-nbt4-04').contentVersion).toBe(2);
  });

  it('Medium g2-g3-04: the key is one short clause, and the last step still quotes it', () => {
    const q = item('g2-g3-04');
    const key = q.options.find((o) => o.isCorrect)!.text;
    expect(key.length).toBeLessThanOrEqual(70);
    expect(key).not.toMatch(/even though the two pizzas/);
    expect(q.explanation.stepByStep.at(-1)).toContain(key);
    expect(q.contentVersion).toBe(2);
  });

  it('Low g2-oa1-04: the explanation does not invent a friend the story never mentions', () => {
    const q = item('g2-oa1-04');
    expect(JSON.stringify(q.explanation)).not.toMatch(/friend/i);
  });

  it('Low g2-nbt8-04: the misconception names what was swapped', () => {
    expect(item('g2-nbt8-04').explanation.commonMisconception).toMatch(/swapped/);
    expect(item('g2-nbt8-04').explanation.commonMisconception).not.toMatch(/applied to the tens/);
  });
});
```


- [ ] **Step 2: Run them to verify they fail**

Run: `npx vitest run src/curriculum/grade2/audit.test.ts`
Expected: FAIL, 7 failed (7).

- [ ] **Step 3: Rewrite the items and add the tags**

**Modify `src/curriculum/misconceptions.ts`**

```diff
@@ -1480,6 +1480,21 @@ export const MISCONCEPTIONS: Record<string, MisconceptionInfo> = Object.fromEntr
       'incomplete-procedure',
       'Lost track while pairing up a group of objects to check for odd or even, and reported the opposite of what the group actually pairs into.',
     ),
+    entry(
+      'guessed-odd-or-even-from-the-size-of-the-number',
+      'incomplete-procedure',
+      'Decided whether a number is odd or even from how big it looks, instead of pairing the objects up or splitting them into two equal groups.',
+    ),
+    entry(
+      'split-into-unequal-groups-and-called-them-equal',
+      'incomplete-procedure',
+      'Split a group into two parts that use every object but are not the same size, and called them the two EQUAL groups or equal addends the question asked for.',
+    ),
+    entry(
+      'wrote-a-sum-that-does-not-match-the-addends',
+      'incomplete-procedure',
+      'Wrote two addends and a total that do not add up, so the equation is false even though the addends look right.',
+    ),
     entry(
       'judged-the-total-by-the-count-of-pairs',
       'incomplete-procedure',
```

**Modify `src/curriculum/grade2/authored.g.ts`**

```diff
@@ -343,7 +343,7 @@ export const GRADE_2_G_AUTHORED: Question[] = [
       'Two identical square pizzas: Pizza 1 is cut into 2 matching rectangles, Pizza 2 corner to corner into 2 matching triangles. Are both cut into equal halves?',
     options: labelOptions([
       {
-        text: 'Yes, because each half is the same size, even though the two pizzas were cut into different shapes.',
+        text: 'Yes, because each half is the same size, even if the shapes differ.',
         isCorrect: true,
       },
       // Assumed equal shares from identical wholes must look alike.
@@ -368,12 +368,13 @@ export const GRADE_2_G_AUTHORED: Question[] = [
     calculatorAllowed: false,
     isStretch: true,
     difficulty: 'stretch',
+    contentVersion: 2,
     explanation: {
       stepByStep: [
         'Step 1: Both pizzas start out identical, and each is cut into exactly 2 pieces.',
         'Step 2: Pizza 1\'s straight cut makes 2 same-size rectangles; Pizza 2\'s corner-to-corner cut makes 2 same-size triangles.',
         'Step 3: In both pizzas, the two pieces from one pizza match each other in size, even though a rectangle and a triangle do not look alike.',
-        'Step 4: Yes, because each half is the same size, even though the two pizzas were cut into different shapes.',
+        'Step 4: Yes, because each half is the same size, even if the shapes differ.',
       ],
       conceptSummary:
         'Equal shares of the same whole do not have to look like each other, and equal shares of two identical wholes do not have to be cut the same way. What makes a share a half is being one of two equal-size pieces — not matching a particular shape.',
```

**Modify `src/curriculum/grade2/authored.nbt.ts`**

```diff
@@ -595,24 +595,25 @@ export const GRADE_2_NBT_AUTHORED: Question[] = [
     options: labelOptions([
       // Counted how many digits are written on each side instead of comparing
       // what the two sides are worth.
-      { text: '500 + 30 + 7 > 537, because 500 + 30 + 7 is written with more digits than 537', isCorrect: false, misconception: 'compared-by-digit-count-not-place-value' },
-      { text: '500 + 30 + 7 = 537, because 5 hundreds, 3 tens, and 7 ones is 537', isCorrect: true },
+      { text: '500 + 30 + 7 > 537, because it is written with more digits', isCorrect: false, misconception: 'compared-by-digit-count-not-place-value' },
+      { text: '500 + 30 + 7 = 537, because both are worth 537', isCorrect: true },
       // Added the first two parts, compared, and never came back for the 7.
-      { text: '500 + 30 + 7 < 537, because 500 + 30 is 530, and 530 is less than 537', isCorrect: false, misconception: 'forgot-the-final-step' },
+      { text: '500 + 30 + 7 < 537, because 500 + 30 is only 530', isCorrect: false, misconception: 'forgot-the-final-step' },
       // Wrote the counts of hundreds, tens, and ones down next to each other
       // instead of adding what each one is worth: 5, 30, and 7 concatenated
       // read as 5,307.
-      { text: '500 + 30 + 7 > 537, because 5, 30, and 7 written side by side make 5,307', isCorrect: false, misconception: 'wrote-the-digits-side-by-side-instead-of-adding-the-values' },
+      { text: '500 + 30 + 7 > 537, because 5, 30, and 7 make 5,307', isCorrect: false, misconception: 'wrote-the-digits-side-by-side-instead-of-adding-the-values' },
     ]),
     calculatorAllowed: false,
     isStretch: false,
     difficulty: 'mastery',
+    contentVersion: 2,
     explanation: {
       stepByStep: [
         'Step 1: 500 + 30 + 7 is 537 written out one place at a time: 5 hundreds, 3 tens, and 7 ones.',
         'Step 2: Add the parts back together. 500 + 30 = 530.',
         'Step 3: 530 + 7 = 537, which is exactly the number on the other side.',
-        'Step 4: 500 + 30 + 7 = 537, because 5 hundreds, 3 tens, and 7 ones is 537.',
+        'Step 4: 500 + 30 + 7 = 537, because both are worth 537.',
       ],
       conceptSummary:
         'The = symbol says the two sides are worth the same, not that they look the same. 500 + 30 + 7 and 537 are two ways of writing one number, so neither > nor < can be true of them.',
@@ -1136,7 +1137,7 @@ export const GRADE_2_NBT_AUTHORED: Question[] = [
       conceptSummary:
         'A hundred and a ten live in different places. Adding 100 moves the hundreds digit; taking 10 away moves the tens digit. Doing one after the other leaves the ones digit exactly where it started.',
       commonMisconception:
-        'Mixing the two amounts up gives 174 instead of 354 — a difference of 180 — because the 100 was applied to the tens and the 10 to the hundreds.',
+        'Adding 10 and then taking away 100 gives 174 instead of 354. The 100 and the 10 were swapped between the two steps.',
     },
   },
 ];
```

**Modify `src/curriculum/grade2/authored.oa.ts`**

```diff
@@ -184,12 +184,12 @@ export const GRADE_2_OA_AUTHORED: Question[] = [
     explanation: {
       stepByStep: [
         'Step 1: Ana started with 9 crayons and lost some — that loss is the ☐.',
-        'Step 2: After losing some, her friend gave her 4 more, and she ended with 8.',
+        'Step 2: After losing some, she got 4 more, and she ended with 8.',
         'Step 3: Work backward: 8 − 4 = 4 tells how many Ana had right after she lost the crayons.',
         'Step 4: 9 − 4 = 5, so the number that goes in the ☐ is 5.',
       ],
       conceptSummary:
-        'A two-step problem is solved one step at a time, in the order the story happens. Undoing the last event first — here, taking away the 4 crayons her friend gave — uncovers the middle amount before the first event can be undone too.',
+        'A two-step problem is solved one step at a time, in the order the story happens. Undoing the last event first — here, taking away the 4 crayons she got — uncovers the middle amount before the first event can be undone too.',
       commonMisconception:
         'Subtracting 9 − 8 = 1 only compares the start and the end; it skips over the 4 crayons Ana was given in between.',
     },
@@ -348,12 +348,19 @@ export const GRADE_2_OA_AUTHORED: Question[] = [
         isCorrect: false,
         misconception: 'judged-the-total-by-the-count-of-pairs',
       },
-      // Restates the number of crayons instead of answering odd or even.
-      { text: '16 crayons', isCorrect: false, misconception: 'restated-a-known-number-instead-of-solving' },
+      // Decided from the size of the number, not from any pairing. (The old
+      // option, "16 crayons", was not an answer to an odd-or-even question and
+      // could be ruled out on form alone.)
+      {
+        text: 'Odd, because 16 is a big number.',
+        isCorrect: false,
+        misconception: 'guessed-odd-or-even-from-the-size-of-the-number',
+      },
     ]),
     calculatorAllowed: false,
     isStretch: false,
     difficulty: 'mastery',
+    contentVersion: 2,
     explanation: {
       stepByStep: [
         'Step 1: Pairing objects up is a way to check odd or even: put them into groups of 2.',
@@ -389,12 +396,17 @@ export const GRADE_2_OA_AUTHORED: Question[] = [
         isCorrect: false,
         misconception: 'miscounted-while-pairing-the-objects',
       },
-      // Restates the number of pairs instead of answering odd or even.
-      { text: '6 pairs', isCorrect: false, misconception: 'restated-a-known-number-instead-of-solving' },
+      // Decided from the size of the number, not from the leftover block.
+      {
+        text: 'Even, because 13 is a big number.',
+        isCorrect: false,
+        misconception: 'guessed-odd-or-even-from-the-size-of-the-number',
+      },
     ]),
     calculatorAllowed: false,
     isStretch: false,
     difficulty: 'mastery',
+    contentVersion: 2,
     explanation: {
       stepByStep: [
         'Step 1: Pairing objects up checks odd or even: put them into groups of 2.',
@@ -416,15 +428,21 @@ export const GRADE_2_OA_AUTHORED: Question[] = [
     // distinct from pairing (groups of 2) per the standard's second bullet.
     prompt:
       'Dana has 18 buttons. Can she split them into two equal groups with none left over?',
+    contentVersion: 2,
     options: labelOptions([
       // Split into two groups that are not equal in size.
       {
         text: 'Yes — 10 buttons in one group and 8 in the other.',
         isCorrect: false,
-        misconception: 'miscounted-while-pairing-the-objects',
+        misconception: 'split-into-unequal-groups-and-called-them-equal',
+      },
+      // Decided from the size of the number. (The old option, "18 buttons",
+      // was not an answer to a yes-or-no question.)
+      {
+        text: 'No — 18 is too big a number to split evenly.',
+        isCorrect: false,
+        misconception: 'guessed-odd-or-even-from-the-size-of-the-number',
       },
-      // Restates the total instead of describing the two equal groups.
-      { text: '18 buttons', isCorrect: false, misconception: 'restated-a-known-number-instead-of-solving' },
       { text: 'Yes — 9 buttons in each of the two groups.', isCorrect: true },
       // Claims it cannot be done at all, contradicting that 18 is even.
       {
@@ -458,9 +476,9 @@ export const GRADE_2_OA_AUTHORED: Question[] = [
     prompt: 'Which equation shows 14 as the sum of two equal addends?',
     options: labelOptions([
       // Addends that sum correctly but are not equal to each other.
-      { text: '6 + 8 = 14', isCorrect: false, misconception: 'judged-the-total-by-the-count-of-pairs' },
-      // Halved 14 incorrectly, off by one in each addend.
-      { text: '6 + 6 = 12', isCorrect: false, misconception: 'miscounted-while-pairing-the-objects' },
+      { text: '6 + 8 = 14', isCorrect: false, misconception: 'split-into-unequal-groups-and-called-them-equal' },
+      // Two equal addends, but they add to 12, not 14: each is one less than half.
+      { text: '6 + 6 = 12', isCorrect: false, misconception: 'wrote-a-sum-that-does-not-match-the-addends' },
       // Equal addends, but the sum is wrong.
       { text: '7 + 7 = 15', isCorrect: false, misconception: 'counted-on-by-ones-one-too-many' },
       { text: '7 + 7 = 14', isCorrect: true },
```


- [ ] **Step 4: Run the tests, the suite and the types**

Run: `npx vitest run src/curriculum/grade2 src/curriculum/misconceptions.test.ts` then `npm run test:run` then `npm run typecheck`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/curriculum/grade2/audit.test.ts src/curriculum/misconceptions.ts src/curriculum/grade2/authored.g.ts src/curriculum/grade2/authored.nbt.ts src/curriculum/grade2/authored.oa.ts
git commit -m "fix: grade 2 odd/even and equal-groups items answer the question and carry the right tag (content-g2)" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01X5HSDdHPWxvHxgBaoSTbLX"
```

---

### Task 9: Grade 2 generators: skip-count, two-units, odd-or-even

Findings: High `nbt2.skip-count` (counting by 5s "ends in the same two digits", false in 33 percent of instances), Medium `md2.two-units` (no article: "Since foot is longer than an inch", every question), Medium `oa3.odd-or-even` (bare numerals, one generic tag for all three distractors, "1 pairs"). The odd/even template is rebuilt around a group of objects and sentence options and bumped to version 2. The hint sentence gains articles, which pushes the longest prompt to 161 characters against the 160 limit, so the second sentence is shortened ("First she uses yards, then feet.").

**Files:**
- Modify: `src/curriculum/misconceptions.ts` (add `swapped-the-words-odd-and-even`), `src/curriculum/grade2/templates/nbt2-skip-count.ts`, `md2-two-units.ts`, `oa3-odd-or-even.ts`, and their tests plus `templates/index.test.ts` (the prompt sentinel for `g2.oa3.odd-or-even`)

**Interfaces:**
- Consumes: Task 8's tags `judged-the-total-by-the-count-of-pairs` and `miscounted-while-pairing-the-objects` (unchanged) and Task 1's `contentVersion`.
- Produces: `EVEN_DRAWS = [2, 6, 10, 14, 18]` and `ODD_DRAWS = [5, 9, 13, 17]` exported from `oa3-odd-or-even.ts` (the parity of the pairs is opposite to the parity of the group in every draw); template `g2.oa3.odd-or-even` at version 2; tag `swapped-the-words-odd-and-even`.

Working for the odd/even options at N = 10 (even, H = 5 pairs, 5 is odd): key "They pair up with none left over, so 10 is even."; swapped word "…none left over, so 10 is odd."; miscounted leftover "…with 1 left over, so 10 is even." (false premise); pairs parity "They make 5 pairs, and 5 is odd, so 10 is odd." Two options end "even", two "odd", so the conclusion alone never points at the key.

- [ ] **Step 1: Write the failing tests**

**Modify `src/curriculum/grade2/templates/index.test.ts`**

```diff
@@ -86,7 +86,7 @@ describe('GRADE_2_TEMPLATES', () => {
     const sentinels: Record<string, RegExp> = {
       'g2.oa1.change-unknown': /^[A-Z][a-z]+ had \d+ [\w ]+\. [A-Z][a-z]+ (?:gave away|lost|traded away) some of them\./,
       'g2.oa2.fluency-fact': /^What is \d+ [+−] \d+\?$/,
-      'g2.oa3.odd-or-even': /^Which of these numbers is (?:EVEN|ODD)\?$/,
+      'g2.oa3.odd-or-even': /^[A-Z][a-z]+ has \d+ [a-z]+\. [A-Z][a-z]+ puts them into pairs\. Which sentence is true\?$/,
       'g2.oa4.array-repeated-addition': /^The \w+ below are arranged in equal rows\./,
       'g2.nbt1.various-groupings': /^Trade one hundred for ten tens\. Which grouping shows the same number\?$/,
       'g2.nbt2.skip-count': /^Skip-count\. What are the next three numbers\?$/,
```

**Modify `src/curriculum/grade2/templates/md2-two-units.test.ts`**

```diff
@@ -9,9 +9,9 @@ const shape = (g: {
 }) => g.options.map((o) => [o.label, o.text, o.isCorrect, o.misconception ?? null]);
 
 /** The pair of units an emitted prompt measures in, found from the two
- *  "measures it in X" sentences. */
+ *  "First she uses X, then Y." sentences. */
 function unitsOf(prompt: string): { first: string; second: string } {
-  const m = /First \w+ measures it in (\w+), then in (\w+)\./.exec(prompt);
+  const m = /First \w+ uses (\w+), then (\w+)\./.exec(prompt);
   if (!m) throw new Error(`unparsable prompt: ${prompt}`);
   return { first: m[1], second: m[2] };
 }
@@ -39,7 +39,7 @@ describe('g2.md2.two-units', () => {
   it('emits exactly this question at seed 7', () => {
     const g = md2TwoUnits.generate(makeRng(7));
     expect(g.prompt).toBe(
-      'Rosa measures the same rug two times. First she measures it in centimeters, then in inches. Since centimeter is shorter than an inch, which sentence is true?',
+      'Rosa measures the same rug two times. First she uses centimeters, then inches. Since a centimeter is shorter than an inch, which sentence is true?',
     );
     expect(g.promptDetails).toBe(undefined);
     expect(g.answerText).toBe('Rosa counts more centimeters than inches.');
@@ -72,7 +72,7 @@ describe('g2.md2.two-units', () => {
   it('emits exactly this question at seed 123', () => {
     const g = md2TwoUnits.generate(makeRng(123));
     expect(g.prompt).toBe(
-      'Nia measures the same rug two times. First she measures it in yards, then in feet. Since yard is longer than a foot, which sentence is true?',
+      'Nia measures the same rug two times. First she uses yards, then feet. Since a yard is longer than a foot, which sentence is true?',
     );
     expect(g.answerText).toBe('Nia counts more feet than yards.');
     expect(shape(g)).toEqual([
@@ -96,6 +96,18 @@ describe('g2.md2.two-units', () => {
     );
   });
 
+  // content-g2 audit (Medium): the hint read "Since foot is longer than an
+  // inch" in every question, with no article on the first noun.
+  it('F: the hint clause has an article on both nouns, at every seed', () => {
+    for (let seed = 0; seed < 600; seed++) {
+      const { prompt } = md2TwoUnits.generate(makeRng(seed));
+      expect(prompt, `seed ${seed}`).toMatch(
+        /Since (?:a|an) [a-z]+ is (?:shorter|longer) than (?:a|an) [a-z]+, which sentence is true\?$/,
+      );
+      expect(prompt.length, `seed ${seed}: ${prompt.length} characters`).toBeLessThanOrEqual(160);
+    }
+  });
+
   // Ruling 19-2: NC.2.MD.2 is measuring one object with TWO different units
   // and relating the counts to the unit size. It is its own standard and its
   // own review key, never folded into MD.1's ruler reading.
```

**Modify `src/curriculum/grade2/templates/nbt2-skip-count.test.ts`**

```diff
@@ -18,6 +18,22 @@ function parse(details: string | undefined): { start: number; step: number } {
 const numbersIn = (text: string) => text.split(', ').map(Number);
 
 describe('g2.nbt2.skip-count', () => {
+  // content-g2 audit (High): "Every number counted by 5s ... ends in the same two
+  // digits" was false in 33,307 of 100,000 instances.
+  it('High: counting by 5s alternates 0 and 5, and the explanation says so at every seed', () => {
+    let fives = 0;
+    for (let seed = 0; seed < 600; seed++) {
+      const g = nbt2SkipCount.generate(makeRng(seed));
+      const text = g.explanation.stepByStep.join(' ');
+      expect(text, `seed ${seed}`).not.toMatch(/same two digits/i);
+      if (/count by 5s/.test(g.promptDetails ?? '')) {
+        fives += 1;
+        expect(text, `seed ${seed}`).toContain('ends in a 0 or a 5');
+      }
+    }
+    expect(fives).toBeGreaterThan(50);
+  });
+
   it('is sound at every seed', () => {
     assertTemplateSound(nbt2SkipCount);
   });
```

**Modify `src/curriculum/grade2/templates/oa3-odd-or-even.test.ts`**

```diff
@@ -1,7 +1,18 @@
 import { describe, it, expect } from 'vitest';
 import { assertTemplateSound } from '../../../engine/templateTesting';
 import { makeRng } from '../../../engine/rng';
-import { oa3OddOrEven } from './oa3-odd-or-even';
+import { oa3OddOrEven, EVEN_DRAWS, ODD_DRAWS } from './oa3-odd-or-even';
+
+const gen = (seed: number) => oa3OddOrEven.generate(makeRng(seed));
+
+/** Reads the group size back out of the prompt, independently of the generator. */
+function groupSize(prompt: string): number {
+  const m = /^[A-Z][a-z]+ has (\d+) [a-z]+\. [A-Z][a-z]+ puts them into pairs\. Which sentence is true\?$/.exec(prompt);
+  if (!m) throw new Error(`unparsable prompt: ${prompt}`);
+  return Number(m[1]);
+}
+
+const byTag = (g: ReturnType<typeof gen>, tag: string) => g.options.find((o) => o.misconception === tag)!;
 
 describe('g2.oa3.odd-or-even', () => {
   it('is sound at every seed', () => {
@@ -9,45 +20,107 @@ describe('g2.oa3.odd-or-even', () => {
   });
 
   it('is deterministic in its seed', () => {
-    expect(oa3OddOrEven.generate(makeRng(42))).toEqual(oa3OddOrEven.generate(makeRng(42)));
+    expect(gen(42)).toEqual(gen(42));
   });
 
+  it('bumps its content version: it was rebuilt around objects', () => {
+    expect(oa3OddOrEven.contentVersion).toBe(2);
+  });
+
+  // LITERAL pins, copied from a real run.
   it('emits exactly this question at seed 7 (even)', () => {
-    const g = oa3OddOrEven.generate(makeRng(7));
-    expect(g.prompt).toBe('Which of these numbers is EVEN?');
-    expect(g.answerText).toBe('2');
+    const g = gen(7);
+    expect(g.prompt).toBe('Omar has 2 buttons. Omar puts them into pairs. Which sentence is true?');
+    expect(g.answerText).toBe('They pair up with none left over, so 2 is even.');
     expect(g.options.map((o) => [o.label, o.text, o.isCorrect, o.misconception ?? null])).toEqual([
-      ['A', '7', false, 'miscounted-while-pairing-the-objects'],
-      ['B', '15', false, 'miscounted-while-pairing-the-objects'],
-      ['C', '1', false, 'miscounted-while-pairing-the-objects'],
-      ['D', '2', true, null],
+      ['A', 'They make 1 pair, and 1 is odd, so 2 is odd.', false, 'judged-the-total-by-the-count-of-pairs'],
+      ['B', 'They pair up with none left over, so 2 is even.', true, null],
+      ['C', 'They pair up with none left over, so 2 is odd.', false, 'swapped-the-words-odd-and-even'],
+      ['D', 'They pair up with 1 left over, so 2 is even.', false, 'miscounted-while-pairing-the-objects'],
     ]);
   });
 
   it('emits exactly this question at seed 123 (odd)', () => {
-    const g = oa3OddOrEven.generate(makeRng(123));
-    expect(g.prompt).toBe('Which of these numbers is ODD?');
-    expect(g.answerText).toBe('3');
+    const g = gen(123);
+    expect(g.prompt).toBe('Maya has 5 stickers. Maya puts them into pairs. Which sentence is true?');
+    expect(g.answerText).toBe('They pair up with 1 left over, so 5 is odd.');
     expect(g.options.map((o) => [o.label, o.text, o.isCorrect, o.misconception ?? null])).toEqual([
-      ['A', '2', false, 'miscounted-while-pairing-the-objects'],
-      ['B', '18', false, 'miscounted-while-pairing-the-objects'],
-      ['C', '3', true, null],
-      ['D', '4', false, 'miscounted-while-pairing-the-objects'],
+      ['A', 'They pair up with 1 left over, so 5 is odd.', true, null],
+      ['B', 'They make 2 pairs, and 2 is even, so 5 is even.', false, 'judged-the-total-by-the-count-of-pairs'],
+      ['C', 'They pair up with none left over, so 5 is odd.', false, 'miscounted-while-pairing-the-objects'],
+      ['D', 'They pair up with 1 left over, so 5 is even.', false, 'swapped-the-words-odd-and-even'],
     ]);
   });
 
-  it('draws every option from 1-20, and only the correct option matches the asked-for parity', () => {
+  // content-g2 audit (Medium): the old item was four bare numerals, so all three
+  // distractors carried one generic tag and a last-digit rule answered it.
+  it('F: is about a group of objects, and each distractor has its own tag', () => {
+    for (let seed = 0; seed < 500; seed++) {
+      const g = gen(seed);
+      const tags = g.options.filter((o) => !o.isCorrect).map((o) => o.misconception);
+      expect(new Set(tags).size, `seed ${seed}: ${tags.join(', ')}`).toBe(3);
+      expect(g.prompt, `seed ${seed}`).not.toMatch(/Which of these numbers/);
+    }
+  });
+
+  it('F: exactly one option is true, and two end in "even", two in "odd"', () => {
+    for (let seed = 0; seed < 500; seed++) {
+      const g = gen(seed);
+      const n = groupSize(g.prompt);
+      const pairs = Math.floor(n / 2);
+      const leftOver = n % 2;
+      // Evaluate every sentence from the numbers in the prompt alone.
+      const truth = g.options.map((o) => {
+        const conclusion = /so \d+ is (even|odd)\.$/.exec(o.text)![1];
+        const claimsLeft = /with (none|1) left over/.exec(o.text);
+        const claimsPairs = /make (\d+) pairs?, and (\d+) is (even|odd)/.exec(o.text);
+        let premiseTrue = true;
+        if (claimsLeft) premiseTrue = (claimsLeft[1] === '1') === (leftOver === 1);
+        if (claimsPairs) premiseTrue = Number(claimsPairs[1]) === pairs && (claimsPairs[3] === 'even') === (pairs % 2 === 0);
+        const conclusionTrue = conclusion === (n % 2 === 0 ? 'even' : 'odd');
+        // The pairs-count sentence reasons from the parity of the pairs, so its
+        // conclusion is only sound if that parity matches: it never does here.
+        const sound = claimsPairs ? claimsPairs[3] === conclusion && conclusionTrue : conclusionTrue;
+        return premiseTrue && sound;
+      });
+      expect(truth.filter(Boolean).length, `seed ${seed}: ${g.options.map((o) => o.text).join(' | ')}`).toBe(1);
+      expect(g.options[truth.indexOf(true)].isCorrect, `seed ${seed}`).toBe(true);
+      const endsEven = g.options.filter((o) => o.text.endsWith('is even.')).length;
+      expect(endsEven, `seed ${seed}`).toBe(2);
+    }
+  });
+
+  it('F: the draw space keeps the parity of the pairs opposite to the parity of the group', () => {
+    for (const n of EVEN_DRAWS) {
+      expect(n % 2).toBe(0);
+      expect((n / 2) % 2, `${n}`).toBe(1);
+    }
+    for (const n of ODD_DRAWS) {
+      expect(n % 2).toBe(1);
+      expect(((n - 1) / 2) % 2, `${n}`).toBe(0);
+    }
+    expect(Math.max(...EVEN_DRAWS, ...ODD_DRAWS)).toBeLessThanOrEqual(20); // NC.2.OA.3: within 20
+  });
+
+  // content-g2 audit (Medium): "2 objects pair up into exactly 1 pairs".
+  it('F: never writes "1 pairs" or "1 objects" in a worked solution', () => {
+    for (let seed = 0; seed < 500; seed++) {
+      const g = gen(seed);
+      const text = [...g.options.map((o) => o.text), ...g.explanation.stepByStep, g.explanation.commonMisconception ?? ''].join(' ');
+      expect(text, `seed ${seed}`).not.toMatch(/\b1 (?:pairs|buttons|stickers|shells|pencils|marbles)\b/);
+    }
+  });
+
+  it('the correct option matches the group, never the size of the number', () => {
     for (let seed = 0; seed < 500; seed++) {
-      const g = oa3OddOrEven.generate(makeRng(seed));
-      const wantsEven = g.prompt.includes('EVEN');
-      for (const o of g.options) {
-        const n = Number(o.text);
-        expect(n, `seed ${seed}: ${n}`).toBeGreaterThanOrEqual(1);
-        expect(n).toBeLessThanOrEqual(20);
-        expect(n % 2 === 0, `seed ${seed}: ${n} even=${n % 2 === 0}, isCorrect=${o.isCorrect}`).toBe(
-          o.isCorrect ? wantsEven : !wantsEven,
-        );
-      }
+      const g = gen(seed);
+      const n = groupSize(g.prompt);
+      expect(g.answerText, `seed ${seed}`).toBe(
+        `They pair up with ${n % 2 === 0 ? 'none' : '1'} left over, so ${n} is ${n % 2 === 0 ? 'even' : 'odd'}.`,
+      );
+      expect(byTag(g, 'miscounted-while-pairing-the-objects').text, `seed ${seed}`).toContain(
+        n % 2 === 0 ? 'with 1 left over' : 'with none left over',
+      );
     }
   });
 });
```


- [ ] **Step 2: Run them to verify they fail**

Run: `npx vitest run src/curriculum/grade2/templates/index.test.ts src/curriculum/grade2/templates/md2-two-units.test.ts src/curriculum/grade2/templates/nbt2-skip-count.test.ts src/curriculum/grade2/templates/oa3-odd-or-even.test.ts`
Expected: FAIL, 16 failed | 42 passed (58).

- [ ] **Step 3: Change the generators**

**Modify `src/curriculum/misconceptions.ts`**

```diff
@@ -1495,6 +1495,11 @@ export const MISCONCEPTIONS: Record<string, MisconceptionInfo> = Object.fromEntr
       'incomplete-procedure',
       'Wrote two addends and a total that do not add up, so the equation is false even though the addends look right.',
     ),
+    entry(
+      'swapped-the-words-odd-and-even',
+      'incomplete-procedure',
+      'Paired the objects correctly but then named the result with the wrong word: called a group with none left over odd, or a group with one left over even.',
+    ),
     entry(
       'judged-the-total-by-the-count-of-pairs',
       'incomplete-procedure',
```

**Modify `src/curriculum/grade2/templates/md2-two-units.ts`**

```diff
@@ -100,8 +100,8 @@ export const md2TwoUnits: QuestionTemplate = {
     // Lowercase, period-free clause, for folding the hint into one question
     // sentence below (Fix 1, whole-branch review, Important).
     const hintClause = hintFromShorter
-      ? `${S.singular} is shorter than ${L.article.toLowerCase()} ${L.singular}`
-      : `${L.singular} is longer than ${S.article.toLowerCase()} ${S.singular}`;
+      ? `${S.article.toLowerCase()} ${S.singular} is shorter than ${L.article.toLowerCase()} ${L.singular}`
+      : `${L.article.toLowerCase()} ${L.singular} is longer than ${S.article.toLowerCase()} ${S.singular}`;
 
     const answerText = `${name} counts more ${S.plural} than ${L.plural}.`;
 
@@ -141,7 +141,7 @@ export const md2TwoUnits: QuestionTemplate = {
     // sentence the `templates/index.test.ts` sentinel pins
     // ("Name measures the same object two times.") untouched.
     return {
-      prompt: `${name} measures the same ${object} two times. First ${pronoun} measures it in ${first.plural}, then in ${second.plural}. Since ${hintClause}, which sentence is true?`,
+      prompt: `${name} measures the same ${object} two times. First ${pronoun} uses ${first.plural}, then ${second.plural}. Since ${hintClause}, which sentence is true?`,
       options: labelOptions(rng.shuffle(candidates)),
       answerText,
       explanation: {
```

**Modify `src/curriculum/grade2/templates/nbt2-skip-count.ts`**

```diff
@@ -117,7 +117,7 @@ export const nbt2SkipCount: QuestionTemplate = {
           ? crossesHundred
             ? 'The tens digit counts up until it passes 9, and then it rolls over into a new hundred — the hundreds digit goes up by one while the ones digit rides along unchanged.'
             : 'Only the tens digit changes across these three counts; the ones digit rides along unchanged.'
-          : 'Every number counted by 5s from here ends in the same two digits, over and over.';
+          : 'Every number counted by 5s ends in a 0 or a 5.';
 
     return {
       prompt: 'Skip-count. What are the next three numbers?',
```

**Modify `src/curriculum/grade2/templates/oa3-odd-or-even.ts`**

```diff
@@ -2,27 +2,41 @@ import type { Rng } from '../../../engine/rng';
 import type { QuestionTemplate, GeneratedQuestion } from '../../../engine/template';
 import { labelOptions } from '../../../engine/questionModel';
 
-const EVENS = [2, 4, 6, 8, 10, 12, 14, 16, 18, 20];
-const ODDS = [1, 3, 5, 7, 9, 11, 13, 15, 17, 19];
-
 /**
  * NC.2.OA.3 — "Determine whether a group of objects, within 20, has an odd
  * or even number of members," via pairing objects and counting by 2s.
  *
- * Covers the pairing/counting-by-2s half of the standard with fresh numbers
- * on every draw; the third bullet (writing an even number as a sum of two
- * equal addends) is a distinct skill authored by hand in
- * ../authored.oa.ts (g2-oa3-04), per ruling 17-2 — a generator that only
- * varied the number would not exercise writing the equation.
+ * The item is about a GROUP OF OBJECTS that a child pairs up, not four bare
+ * numerals (the old "Which of these numbers is EVEN?" invited a last-digit
+ * rule and gave all three distractors one generic tag). The four options are
+ * sentences, each one a different way to reason about the pairing:
+ *
+ *   key                  They pair up with <none|1> left over, so N is <even|odd>.
+ *   swapped-the-words-odd-and-even
+ *                        the pairing is read right, the word is swapped
+ *   miscounted-while-pairing-the-objects
+ *                        the leftover is claimed wrongly, the conclusion is
+ *                        the key's (so it is a false statement, not a slip of
+ *                        the answer alone)
+ *   judged-the-total-by-the-count-of-pairs
+ *                        "They make H pairs, and H is <odd|even>, so N is
+ *                        <odd|even>": the parity of the PAIRS is used
  *
- * Asks for EVEN about half the time and ODD the other half, rather than
- * always the same direction, so a child cannot learn "always pick the
- * biggest number" or any other position-based shortcut. All four candidate
- * numbers are drawn from 1-20 and are pairwise distinct by construction: the
- * three wrong numbers are a shuffled sample of the 10 numbers of the WRONG
- * parity, which can never collide with the correct number (which has the
- * target parity) or with each other (sampled without replacement).
+ * DRAW SPACE. The pairs-count distractor is only a wrong answer when the
+ * parity of H differs from the parity of N. For N = 2H that is H odd, so N is
+ * in {2, 6, 10, 14, 18}; for N = 2H + 1 it is H even, so N is in
+ * {5, 9, 13, 17} (1 is left out: it makes 0 pairs). That keeps every option
+ * false except the key, and it makes exactly two of the four sentences end in
+ * "even" and two in "odd", so the conclusion alone never points at the key.
  */
+export const EVEN_DRAWS = [2, 6, 10, 14, 18];
+export const ODD_DRAWS = [5, 9, 13, 17];
+
+const OBJECTS = ['pencils', 'stickers', 'shells', 'buttons', 'marbles'];
+const NAMES = ['Rosa', 'Kai', 'Maya', 'Leo', 'Nia', 'Omar'];
+
+const pairWord = (k: number) => `${k} ${k === 1 ? 'pair' : 'pairs'}`;
+
 export const oa3OddOrEven: QuestionTemplate = {
   id: 'g2.oa3.odd-or-even',
   standardCode: 'NC.2.OA.3',
@@ -30,25 +44,41 @@ export const oa3OddOrEven: QuestionTemplate = {
   difficulty: 'mastery',
   calculatorAllowed: false,
   isStretch: false,
+  contentVersion: 2, // rebuilt: objects and sentence options instead of four numerals
 
   generate(rng: Rng): GeneratedQuestion {
     const wantEven = rng.pick([true, false]);
-    const correctPool = wantEven ? EVENS : ODDS;
-    const wrongPool = wantEven ? ODDS : EVENS;
+    const n = rng.pick(wantEven ? EVEN_DRAWS : ODD_DRAWS);
+    const name = rng.pick(NAMES);
+    const objects = rng.pick(OBJECTS);
 
-    const correctNum = rng.pick(correctPool);
-    const wrongNums = rng.shuffle(wrongPool).slice(0, 3);
+    const pairs = Math.floor(n / 2);
+    const word = wantEven ? 'even' : 'odd';
+    const other = wantEven ? 'odd' : 'even';
+    const leftKey = wantEven ? 'none left over' : '1 left over';
+    const leftWrong = wantEven ? '1 left over' : 'none left over';
+    // By construction the parity of the pairs is the OTHER word.
+    const pairsParity = pairs % 2 === 0 ? 'even' : 'odd';
 
-    const answerText = `${correctNum}`;
-    const parityWord = wantEven ? 'even' : 'odd';
+    const answerText = `They pair up with ${leftKey}, so ${n} is ${word}.`;
 
     const candidates = [
       { text: answerText, isCorrect: true },
-      ...wrongNums.map((n) => ({
-        text: `${n}`,
+      {
+        text: `They pair up with ${leftKey}, so ${n} is ${other}.`,
+        isCorrect: false,
+        misconception: 'swapped-the-words-odd-and-even',
+      },
+      {
+        text: `They pair up with ${leftWrong}, so ${n} is ${word}.`,
         isCorrect: false,
         misconception: 'miscounted-while-pairing-the-objects',
-      })),
+      },
+      {
+        text: `They make ${pairWord(pairs)}, and ${pairs} is ${pairsParity}, so ${n} is ${pairsParity}.`,
+        isCorrect: false,
+        misconception: 'judged-the-total-by-the-count-of-pairs',
+      },
     ];
 
     const texts = candidates.map((x) => x.text);
@@ -56,25 +86,22 @@ export const oa3OddOrEven: QuestionTemplate = {
       throw new Error(`g2.oa3.odd-or-even: option collision [${texts.join(' | ')}]`);
     }
 
-    const half = Math.floor(correctNum / 2);
-
     return {
-      prompt: `Which of these numbers is ${parityWord.toUpperCase()}?`,
+      prompt: `${name} has ${n} ${objects}. ${name} puts them into pairs. Which sentence is true?`,
       options: labelOptions(rng.shuffle(candidates)),
       answerText,
       explanation: {
         stepByStep: [
-          `Step 1: A number is even if a group that size can be paired up with none left over, and odd if one is always left over.`,
+          `Step 1: To check odd or even, put the ${objects} into pairs and see if any is left without a partner.`,
+          `Step 2: ${n} ${objects} make ${pairWord(pairs)}, with ${wantEven ? 'none left over' : '1 left over'}.`,
           wantEven
-            ? `Step 2: ${correctNum} objects pair up into exactly ${half} pairs, with none left over.`
-            : `Step 2: ${correctNum} objects pair up into ${half} pairs, with 1 object left over.`,
-          `Step 3: The other numbers in the list are the opposite: each one always has ${wantEven ? 'one left over' : 'none left over'} when paired up.`,
-          `Step 4: The ${parityWord} number is ${answerText}.`,
+            ? 'Step 3: Nothing is left over, so the number is even.'
+            : 'Step 3: One is left over, so the number is odd.',
+          `Step 4: ${answerText}`,
         ],
         conceptSummary:
           'Pairing objects up and checking for a leftover is a direct test for odd or even: nothing left over means even, and one object left alone means odd.',
-        commonMisconception:
-          'A quick guess based on how big a number looks, instead of actually pairing it up, is the fastest way to mix up odd and even.',
+        commonMisconception: `Whether the number of pairs is odd or even does not decide it: the number of pairs, ${pairs}, is ${pairsParity}, but ${n} is ${word}. Look for an object left without a partner.`,
       },
     };
   },
```


- [ ] **Step 4: Run the tests, the suite and the types**

Run: `npx vitest run src/curriculum/grade2 src/curriculum/misconceptions.test.ts` then `npm run test:run` then `npm run typecheck`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/curriculum/grade2/templates/index.test.ts src/curriculum/grade2/templates/md2-two-units.test.ts src/curriculum/grade2/templates/nbt2-skip-count.test.ts src/curriculum/grade2/templates/oa3-odd-or-even.test.ts src/curriculum/misconceptions.ts src/curriculum/grade2/templates/md2-two-units.ts src/curriculum/grade2/templates/nbt2-skip-count.ts src/curriculum/grade2/templates/oa3-odd-or-even.ts
git commit -m "fix: grade 2 generators: true skip-count explanation, grammatical hint, odd/even about objects (content-g2)" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01X5HSDdHPWxvHxgBaoSTbLX"
```

---

### Task 10: Grade 3 authored items, study guides and the NBT parent name (content-g3 High and Medium, NC-R13c)

Findings: High NBT.3 guide (said 50 "holds a single ten", it is 5 tens), Medium `g3-md1-01` (at 2:43 the hour hand is most of the way to the 3, not "a little way past the 2"), Medium `g3-oa9-03` (rows printed to different lengths), Medium OA.2 and OA.9 guide text (10 is not a single digit; the row for 4 repeats its ones digits every FIVE steps), Medium unsourced item statistics in twelve `whyItMattersForSSA` lines (the band weights stay, "most-missed", "practically every form" and the rest go), Medium NC-R13c (the NBT domain parent name "Place value & rounding" contradicts the rule that Grade 3 has no rounding standard; renamed "Adding, subtracting & multiples of 10"), and the Low guide fixes (favorite, a crayon is not 5 inches). The trapezoid lines of this guide were Task 3.

**Files:**
- Modify: `src/curriculum/grade3/authored.md.ts`, `authored.oa.ts`, `standards.ts`, `studyGuides.ts`
- Create: `src/curriculum/grade3/audit.test.ts`

**Interfaces:**
- Consumes: `topicName(domain)` from `src/curriculum/registry.ts` (reads `parentName`).
- Produces: `GRADE_3_DOMAINS` NBT `parentName === 'Adding, subtracting & multiples of 10'`. No item is bumped: `g3-md1-01` and `g3-oa9-03` keep their key and options and only their supporting text changes.

- [ ] **Step 1: Write the failing tests**

**Create `src/curriculum/grade3/audit.test.ts`**

```ts
import { describe, it, expect } from 'vitest';
import { GRADE_3_DOMAINS } from './standards';
import { GRADE_3_STUDY_GUIDES } from './studyGuides';
import { GRADE_3_AUTHORED } from './authored';
import { topicName } from '../registry';

// Regression tests for docs/superpowers/audits/2026-09-30/content-g3.md.

const item = (id: string) => GRADE_3_AUTHORED.find((q) => q.id === id)!;
const guide = (code: string) => GRADE_3_STUDY_GUIDES[code];

describe('content-g3 audit: NC-R13c, no rounding standard at Grade 3', () => {
  it('Medium: no domain is named, described or shown to a parent as "rounding"', () => {
    for (const d of GRADE_3_DOMAINS) {
      const shown = [d.name, d.shortName, d.parentName ?? '', topicName(d), d.description].join(' ');
      expect(shown, d.id).not.toMatch(/round/i);
    }
    expect(GRADE_3_DOMAINS.find((d) => d.id === 'NBT')!.parentName).toBe('Adding, subtracting & multiples of 10');
  });
});

describe('content-g3 audit: authored items', () => {
  it('Medium g3-md1-01: the hour hand at 2:43 is most of the way to the 3', () => {
    const q = item('g3-md1-01');
    expect(q.options.find((o) => o.isCorrect)!.text).toBe('2:43');
    expect(q.promptDetails).toMatch(/most of the way to the 3/);
    expect(q.promptDetails).not.toMatch(/a little way past the 2/);
  });

  it('Medium g3-oa9-03: the two rows are printed to the same number, so the claim can be checked', () => {
    const p = item('g3-oa9-03').prompt;
    const row3 = /row for 3 reads ([\d, ]+),/.exec(p)![1].split(',').map((n) => Number(n.trim()));
    const row6 = /row for 6 reads ([\d, ]+)\./.exec(p)![1].split(',').map((n) => Number(n.trim()));
    expect(Math.max(...row3)).toBe(Math.max(...row6));
    for (const n of row6) expect(row3, `${n} is in the row for 6 but not printed in the row for 3`).toContain(n);
  });

});

describe('content-g3 audit: study guides', () => {
  it('High NBT.3: 50 is 5 tens, so no guide text says it holds a single ten', () => {
    const text = JSON.stringify(guide('NC.3.NBT.3'));
    expect(text).not.toMatch(/holds a single ten|contains only one ten|only one ten|because one ten/i);
    expect(guide('NC.3.NBT.3').rulesAndFormulas.some((r) => /one zero/i.test(r.label + r.detail))).toBe(true);
  });

  it('Medium OA.2: 10 is not a single digit', () => {
    expect(guide('NC.3.OA.2').coreConcept).not.toMatch(/single digits, 10 or less/);
  });

  it('Medium OA.9: the row for 4 repeats its ones digits every FIVE steps', () => {
    const trap = guide('NC.3.OA.9').commonTraps.find((t) => /ones digits start over/.test(t))!;
    expect(trap).toMatch(/after five steps/);
    // 4, 8, 12, 16, 20, 24: the ones digits 4, 8, 2, 6, 0 then 4 again.
    const ones = [1, 2, 3, 4, 5, 6].map((k) => (4 * k) % 10);
    expect(ones[5]).toBe(ones[0]);
  });

  it('Medium: no whyItMattersForSSA states an unsourced statistic about the EOG as fact', () => {
    const unsourced =
      /most[- ]missed|practically every|every year|asks? (?:about )?most often|almost always|nearly (?:all|every)|single most common|hardest (?:questions?|thing)|practise least|show(?:s)? up right across|all through|least class time|worth more marks/i;
    for (const [code, g] of Object.entries(GRADE_3_STUDY_GUIDES)) {
      expect(g.workedExample.whyItMattersForSSA, code).not.toMatch(unsourced);
    }
  });

  it('Low: American spelling, and a crayon is not 5 inches long', () => {
    const all = JSON.stringify(GRADE_3_STUDY_GUIDES);
    expect(all).not.toMatch(/favourite|practise/i);
    expect(all).not.toMatch(/crayon is about 5 inches/);
  });
});
```


- [ ] **Step 2: Run them to verify they fail**

Run: `npx vitest run src/curriculum/grade3/audit.test.ts`
Expected: FAIL, 8 failed (8).

- [ ] **Step 3: Apply the fixes**

**Modify `src/curriculum/grade3/authored.md.ts`**

```diff
@@ -77,7 +77,7 @@ export const GRADE_3_MD_AUTHORED: Question[] = [
     // misread before any arithmetic starts.
     prompt: 'What time does the clock show?',
     promptDetails:
-      'A clock with two hands. The short hour hand is a little way past the 2. The long minute hand is pointing at the third small mark after the 8. Each small mark on this clock is one minute, and four small marks sit between one number and the next, splitting that gap into five minutes.',
+      'A clock with two hands. The short hour hand is between the 2 and the 3, most of the way to the 3. The long minute hand is pointing at the third small mark after the 8. Each small mark on this clock is one minute, and four small marks sit between one number and the next, splitting that gap into five minutes.',
     options: labelOptions([
       // The minute hand at the 8 is 8 fives, which is 40 minutes; three small
       // marks more is 43. The hour hand is past the 2, so the hour is 2.
```

**Modify `src/curriculum/grade3/authored.oa.ts`**

```diff
@@ -811,7 +811,7 @@ export const GRADE_3_OA_AUTHORED: Question[] = [
     standardCode: 'NC.3.OA.9',
     domainId: 'OA',
     prompt:
-      'On a multiplication table, the row for 3 reads 3, 6, 9, 12, 15, 18, 21, 24, and the row for 6 reads 6, 12, 18, 24, 30, 36. Every number in the row for 6 also appears in the row for 3. Which statement explains why?',
+      'On a multiplication table, the row for 3 reads 3, 6, 9, 12, 15, 18, 21, 24, 27, 30, and the row for 6 reads 6, 12, 18, 24, 30. Every number in the row for 6 also appears in the row for 3. Which statement explains why?',
     options: labelOptions([
       // Both rows are said to be even, which is false for the row for 3
       // (3, 9, 15 and 21 are odd) - a rule taken from part of the pattern.
```

**Modify `src/curriculum/grade3/standards.ts`**

```diff
@@ -274,7 +274,7 @@ export const GRADE_3_DOMAINS: DomainInfo[] = [
     id: 'NBT',
     name: 'Number & Operations in Base Ten',
     shortName: 'Base Ten to 1,000',
-    parentName: 'Place value & rounding',
+    parentName: 'Adding, subtracting & multiples of 10',
     officialWeightRange: '9–13%',
     officialWeightMidpoint: 11,
     color: 'blue',
```

**Modify `src/curriculum/grade3/studyGuides.ts`**

```diff
@@ -73,7 +73,7 @@ export const GRADE_3_STUDY_GUIDES: Record<string, StudyGuideSection> = {
     standardCode: 'NC.3.OA.2',
     title: 'Division Means Sharing into Equal Groups',
     coreConcept:
-      'Division splits a total into equal groups. The total always goes first. The other number tells you one of two things - either how many groups to make, or how many to put in each group - and the answer tells you the one you were not told. In Grade 3 the divisor and the answer are both single digits, 10 or less.',
+      'Division splits a total into equal groups. The total always goes first. The other number tells you one of two things - either how many groups to make, or how many to put in each group - and the answer tells you the one you were not told. In Grade 3 the divisor and the answer are both 10 or less.',
     rulesAndFormulas: [
       { label: 'Total ÷ number of groups = size of each group', detail: '42 stickers shared fairly between 6 friends is 42 ÷ 6 = 7 stickers each. As a multiplication that is 6 × 7 = 42: 6 groups of 7.' },
       { label: 'Total ÷ size of each group = number of groups', detail: '42 stickers packed 6 to a bag is 42 ÷ 6 = 7 bags. As a multiplication that is 7 × 6 = 42: 7 groups of 6.' },
@@ -105,7 +105,7 @@ export const GRADE_3_STUDY_GUIDES: Record<string, StudyGuideSection> = {
       ],
       answer: '7 stickers each',
       whyItMattersForSSA:
-        'Division questions are all through the 32–36% Operations and Algebraic Thinking band on the Grade 3 EOG, and knowing which number counts the groups is what separates a right answer from one of the two numbers the question already gave you.',
+        'Division is part of the 32–36% Operations and Algebraic Thinking band on the Grade 3 EOG, and knowing which number counts the groups is what separates a right answer from one of the two numbers the question already gave you.',
     },
   },
 
@@ -147,7 +147,7 @@ export const GRADE_3_STUDY_GUIDES: Record<string, StudyGuideSection> = {
       ],
       answer: '63 fish',
       whyItMattersForSSA:
-        'Most of the 32–36% Operations and Algebraic Thinking band on the Grade 3 EOG is word problems rather than bare facts, so reading a story and choosing the operation is worth more marks than any single times table.',
+        'Word problems are part of the 32–36% Operations and Algebraic Thinking band on the Grade 3 EOG, so reading a story and choosing the operation matters as much as knowing any single times table.',
     },
   },
 
@@ -187,7 +187,7 @@ export const GRADE_3_STUDY_GUIDES: Record<string, StudyGuideSection> = {
       ],
       answer: '7',
       whyItMattersForSSA:
-        'Unknown-factor equations show up right across the 32–36% Operations and Algebraic Thinking band on the Grade 3 EOG, and the same move - swapping a multiplication for a division - is how every division fact you will ever meet gets checked.',
+        'Unknown-factor equations belong to the 32–36% Operations and Algebraic Thinking band on the Grade 3 EOG, and the same move - swapping a multiplication for a division - is how every division fact you will ever meet gets checked.',
     },
   },
 
@@ -227,7 +227,7 @@ export const GRADE_3_STUDY_GUIDES: Record<string, StudyGuideSection> = {
       ],
       answer: '36',
       whyItMattersForSSA:
-        'Fluency sits inside the 32–36% Operations and Algebraic Thinking band on the Grade 3 EOG, and it quietly decides the rest of the paper too - area, perimeter and fraction questions all stall if a times table has to be rebuilt from scratch each time.',
+        'Fluency sits inside the 32–36% Operations and Algebraic Thinking band on the Grade 3 EOG, and area, perimeter and fraction work all go more smoothly when a times table does not have to be rebuilt from scratch each time.',
     },
   },
 
@@ -269,7 +269,7 @@ export const GRADE_3_STUDY_GUIDES: Record<string, StudyGuideSection> = {
       ],
       answer: '37 markers',
       whyItMattersForSSA:
-        'Two-step problems are the hardest questions in the 32–36% Operations and Algebraic Thinking band on the Grade 3 EOG, because a child can do both calculations perfectly and still lose the mark by answering the middle question instead of the real one.',
+        'Two-step problems belong to the 32–36% Operations and Algebraic Thinking band on the Grade 3 EOG, and a child can do both calculations perfectly and still lose the mark by answering the middle question instead of the real one.',
     },
   },
 
@@ -295,7 +295,7 @@ export const GRADE_3_STUDY_GUIDES: Record<string, StudyGuideSection> = {
     commonTraps: [
       'Turning the statement round. "Every number in the row for 4 is even" is true, but "every even number is in the row for 4" is false - 6 is even and never appears in that row.',
       'Writing 44 as the last number in the row. The table stops at 10 × 4 = 40; counting 44 means counting eleven fours, which happens when the first number in the row is counted as a jump instead of as the first stop.',
-      'Spotting without interpreting. "They all end in 4, 8, 2, 6, 0" is a real pattern, but the standard asks why - because each step adds 4 more, and after ten steps the ones digits start over.',
+      'Spotting without interpreting. "They all end in 4, 8, 2, 6, 0" is a real pattern, but the standard asks why - because each step adds 4 more, and after five steps the ones digits start over.',
       'Trusting a pattern after one example. Two numbers in a row can agree by accident; check at least three, and check one that should fail.',
     ],
     workedExample: {
@@ -309,7 +309,7 @@ export const GRADE_3_STUDY_GUIDES: Record<string, StudyGuideSection> = {
       ],
       answer: 'Every number in the row is even, because each step adds another even group of 4 - but the reverse is false, since 6 is even and is not in the row.',
       whyItMattersForSSA:
-        'Pattern questions inside the 32–36% Operations and Algebraic Thinking band on the Grade 3 EOG almost always ask for the reason, not the pattern, so a child who can only point at it will lose a mark they very nearly had.',
+        'Pattern questions belong to the 32–36% Operations and Algebraic Thinking band on the Grade 3 EOG, and the standard asks for the reason behind a pattern, so a child who can only point at it has not finished the job.',
     },
   },
 
@@ -392,7 +392,7 @@ export const GRADE_3_STUDY_GUIDES: Record<string, StudyGuideSection> = {
       ],
       answer: '4/6',
       whyItMattersForSSA:
-        'Number-line fraction questions are some of the most-missed items in the 28–32% fractions band on the Grade 3 EOG, and nearly all of the misses come from counting marks instead of spaces.',
+        'Number-line fraction questions belong to the 28–32% fractions band on the Grade 3 EOG, and a common slip is counting the marks instead of the spaces.',
     },
   },
 
@@ -473,7 +473,7 @@ export const GRADE_3_STUDY_GUIDES: Record<string, StudyGuideSection> = {
       ],
       answer: '3/4 > 3/8',
       whyItMattersForSSA:
-        'Comparison items appear all through the 28–32% fractions band on the Grade 3 EOG, and the "bigger bottom number means smaller pieces" idea is the single most common place a child loses a fraction mark.',
+        'Comparison is part of the 28–32% fractions band on the Grade 3 EOG, and understanding that a bigger bottom number means smaller pieces is what makes those comparisons come out right.',
     },
   },
 
@@ -518,7 +518,7 @@ export const GRADE_3_STUDY_GUIDES: Record<string, StudyGuideSection> = {
       ],
       answer: '35 minutes',
       whyItMattersForSSA:
-        'Measurement and Data is weighted together with Geometry as one band worth 23–27% of the Grade 3 EOG, and time questions are on practically every form — usually asking how long something lasted rather than just what the clock says.',
+        'Measurement and Data is weighted together with Geometry as one band worth 23–27% of the Grade 3 EOG, and time questions include how long something lasted, not only what the clock says.',
     },
   },
 
@@ -546,7 +546,7 @@ export const GRADE_3_STUDY_GUIDES: Record<string, StudyGuideSection> = {
       'Answering 7 inches by adding the 4 whole inches to the 3 small marks. A small mark is only a quarter of an inch, so three of them are nowhere near three inches.',
       'Answering 4 and 3/8 inches. That counts the marks as eighths when this inch is cut into only 4 parts - count the SPACES inside one inch before naming what a mark is worth.',
       'Starting the measurement at the end of the ruler instead of at the 0 mark, which makes everything come out too short.',
-      'Picking a unit that does not fit the object. A crayon is about 5 inches long; a door is taller than a person, so a door is measured in feet.',
+      'Picking a unit that does not fit the object. A pencil is about 7 inches long; a door is taller than a person, so a door is measured in feet.',
     ],
     workedExample: {
       problem: 'A crayon is lined up with 0 on a ruler. Its tip is 3 small marks past the 4-inch line, and each inch on this ruler is split into 4 equal parts. How long is the crayon?',
@@ -559,7 +559,7 @@ export const GRADE_3_STUDY_GUIDES: Record<string, StudyGuideSection> = {
       ],
       answer: '4 and 3/4 inches',
       whyItMattersForSSA:
-        'Measurement and Data shares a single 23–27% band with Geometry on the Grade 3 EOG, and ruler questions are the ones children practise least, because most home practice is arithmetic on paper rather than measuring real objects.',
+        'Measurement and Data shares a single 23–27% band with Geometry on the Grade 3 EOG, and reading a ruler to the nearest half or quarter inch is part of that band.',
     },
   },
 
@@ -573,7 +573,7 @@ export const GRADE_3_STUDY_GUIDES: Record<string, StudyGuideSection> = {
       { label: 'Bar graphs have a scale too', detail: 'The numbers up the side may go up in 2s, 5s or 10s. One gridline is not always one.' },
       { label: 'How many more', detail: 'Change both rows into real amounts first, then subtract. Never subtract the pictures.' },
       { label: 'Half a picture', detail: 'Half a star is half of what a whole star is worth - with a key of 6, half a star is 3 books.' },
-      { label: 'A good data question', detail: 'Collecting data means asking a question with several different answers that sort into up to four groups, such as "which of these four fruits is your favourite?"' },
+      { label: 'A good data question', detail: 'Collecting data means asking a question with several different answers that sort into up to four groups, such as "which of these four fruits is your favorite?"' },
     ],
     stepByStepMethod: [
       'Step 1: Read the title so you know what is being counted.',
@@ -599,7 +599,7 @@ export const GRADE_3_STUDY_GUIDES: Record<string, StudyGuideSection> = {
       ],
       answer: 'Lin read 42 books, which is 18 more than Ravi',
       whyItMattersForSSA:
-        'Measurement and Data and Geometry share one 23–27% band on the Grade 3 EOG, and graph questions turn up in it every year — nearly every lost mark comes from counting the pictures instead of using the key.',
+        'Measurement and Data and Geometry share one 23–27% band on the Grade 3 EOG, and reading a scaled graph means using the key, not counting the pictures.',
     },
   },
 
@@ -681,7 +681,7 @@ export const GRADE_3_STUDY_GUIDES: Record<string, StudyGuideSection> = {
       ],
       answer: '52 square feet',
       whyItMattersForSSA:
-        'Splitting a shape into two rectangles is the hardest thing in the 23–27% band that Measurement and Data shares with Geometry on the Grade 3 EOG, and it is the idea Grade 4 and Grade 5 build every area formula on top of.',
+        'Splitting a shape into two rectangles and adding their areas is part of the 23–27% band that Measurement and Data shares with Geometry on the Grade 3 EOG, and the area formulas of later grades build on it.',
     },
   },
 
@@ -721,7 +721,7 @@ export const GRADE_3_STUDY_GUIDES: Record<string, StudyGuideSection> = {
       ],
       answer: '8 inches',
       whyItMattersForSSA:
-        'Finding a missing side is the version of perimeter the Grade 3 EOG asks about most often inside the 23–27% band that Measurement and Data shares with Geometry, because it needs both the adding and the subtracting rather than one lap round a shape.',
+        'Finding a missing side needs both adding and subtracting rather than one lap round a shape, and it sits inside the 23–27% band that Measurement and Data shares with Geometry on the Grade 3 EOG.',
     },
   },
 
@@ -767,7 +767,7 @@ export const GRADE_3_STUDY_GUIDES: Record<string, StudyGuideSection> = {
       ],
       answer: 'Jo is wrong: every square is a rectangle. Two squares joined along a full side make a rectangle.',
       whyItMattersForSSA:
-        'Geometry is a single standard at Grade 3 and it is weighted together with Measurement and Data in one 23–27% band on the EOG, so quadrilateral naming carries real marks even though it takes up the least class time.',
+        'Geometry is a single standard at Grade 3 and it is weighted together with Measurement and Data in one 23–27% band on the EOG, so quadrilateral naming counts toward that band.',
     },
   },
 
@@ -827,7 +827,7 @@ export const GRADE_3_STUDY_GUIDES: Record<string, StudyGuideSection> = {
       { label: 'Say the multiple of 10 as tens', detail: '50 is 5 tens, 30 is 3 tens, 90 is 9 tens.' },
       { label: 'Use the fact you know', detail: '7 × 50 becomes 7 × 5 tens, and 7 × 5 = 35.' },
       { label: 'Then write what those tens are worth', detail: '35 tens is 350, because 35 groups of ten is 3 hundreds and 5 tens.' },
-      { label: 'One zero, because one ten', detail: '50 holds a single ten, so the answer picks up a single zero at the end - never two.' },
+      { label: 'One place over, so one zero', detail: 'Multiplying by 10 moves every digit one place to the left, so the answer picks up a single zero at the end - never two.' },
       { label: 'The range at Grade 3', detail: 'Multiples of 10 from 10 to 90, with a one-digit number. The biggest one you will meet is 9 × 90 = 810.' },
     ],
     stepByStepMethod: [
@@ -840,7 +840,7 @@ export const GRADE_3_STUDY_GUIDES: Record<string, StudyGuideSection> = {
     commonTraps: [
       'Answering 35. That is the right count of the wrong unit: 35 is how many TENS there are, not how many pencils.',
       'Answering 57 by adding 7 and 50. Seven equal groups of 50 are joined by multiplying, not by adding once.',
-      'Answering 3,500 by putting on two zeros. 50 contains only one ten, so only one zero joins the answer.',
+      'Answering 3,500 by putting on two zeros. The 5 in 50 is already used in the fact 7 × 5 = 35, and only the ten adds a place, so only one zero joins the answer.',
       'Using the fact but forgetting what changed. 7 × 5 = 35 is right, and the 5 became 5 TENS, so the answer has to grow ten times as well.',
     ],
     workedExample: {
```


- [ ] **Step 4: Run the tests, the suite and the types**

Run: `npx vitest run src/curriculum/grade3` then `npm run test:run` then `npm run typecheck`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/curriculum/grade3/audit.test.ts src/curriculum/grade3/authored.md.ts src/curriculum/grade3/authored.oa.ts src/curriculum/grade3/standards.ts src/curriculum/grade3/studyGuides.ts
git commit -m "fix: grade 3 guides teach true things, no rounding domain, clock and table items fit their stems (content-g3)" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01X5HSDdHPWxvHxgBaoSTbLX"
```

---

### Task 11: Grade 3 generators: md7, md2, nbt2 and nf1

Findings (content-g3 Medium): `md7` drew the unit independently of the object ("bulletin board 8 yards long", "patio 3 inches wide"), `md2.customary-capacity` drew 30 to 99 units for any vessel ("soup pot 87 quarts"), `nbt2.add-within-1000` and `md2` wrote "1 tens" and "1 ones" (47 of 2000 and 797 of 2000 seeds), and `nf1.unit-fraction-model` offered "2 whole rectangles, with 1 of them shaded", which is 1/2 of a set and can be defended against "1/2 of a whole rectangle". A shared `count(n, unit)` helper (the private copy in `nbt2-subtract` moves into it) removes the plural slips.

**Files:**
- Create: `src/curriculum/grade3/templates/count.ts`
- Modify: `nbt2-add-within-1000.ts`, `nbt2-subtract-within-1000.ts`, `md2-customary-capacity-word-problem.ts`, `md7-area-by-multiplying-side-lengths.ts`, `nf1-unit-fraction-model.ts`, and the `.test.ts` for `md2`, `md7`, `nbt2-add` and `nf1`

**Interfaces:**
- Consumes: Task 1's `QuestionTemplate.contentVersion`.
- Produces: `count(n: number, unit: string): string` from `src/curriculum/grade3/templates/count.ts`; template `g3.nf1.unit-fraction-model` at version 2 (one option reworded). `md7` and `md2` change their context pairing and vessels only (the option arithmetic is untouched), so they are not bumped.

- [ ] **Step 1: Write the failing tests**

**Modify `src/curriculum/grade3/templates/md2-customary-capacity-word-problem.test.ts`**

```diff
@@ -64,17 +64,46 @@ describe('g3.md2.customary-capacity-word-problem', () => {
   it('emits exactly this question at seed 123', () => {
     const g = md2CustomaryCapacityWordProblem.generate(makeRng(123));
     expect(g.prompt).toBe(
-      'A juice jug holds 71 pints of juice. Omar pours out 48 pints. How many pints of juice are left in the juice jug?',
+      'A soup kettle holds 71 quarts of soup. Omar pours out 48 quarts. How many quarts of soup are left in the soup kettle?',
     );
-    expect(g.answerText).toBe('23 pints');
+    expect(g.answerText).toBe('23 quarts');
     expect(shape(g)).toEqual([
-      ['A', '33 pints', false, 'borrowed-without-reducing-the-next-column'],
-      ['B', '37 pints', false, 'subtracted-without-regrouping'],
-      ['C', '119 pints', false, 'added-instead-of-subtracted'],
-      ['D', '23 pints', true, null],
+      ['A', '33 quarts', false, 'borrowed-without-reducing-the-next-column'],
+      ['B', '37 quarts', false, 'subtracted-without-regrouping'],
+      ['C', '119 quarts', false, 'added-instead-of-subtracted'],
+      ['D', '23 quarts', true, null],
     ]);
   });
 
+  // content-g3 audit (Medium): "soup pot holds 87 quarts", "juice jug 93 pints".
+  it('F: every vessel is one that can hold 30 to 99 of its unit', () => {
+    const CAN_HOLD: Record<string, string> = {
+      'water tank': 'gallons',
+      'rain barrel': 'gallons',
+      'fish tank': 'gallons',
+      cooler: 'quarts',
+      'soup kettle': 'quarts',
+      'juice dispenser': 'pints',
+    };
+    for (let seed = 0; seed < 600; seed++) {
+      const { prompt } = md2CustomaryCapacityWordProblem.generate(makeRng(seed));
+      const m = /^An? (.+) holds \d+ (\w+) of /.exec(prompt);
+      expect(m, `seed ${seed}: ${prompt}`).not.toBeNull();
+      expect(CAN_HOLD[m![1]], `seed ${seed}: ${m![1]}`).toBe(m![2]);
+    }
+  });
+
+  // content-g3 audit (Medium): "1 ones" in 797 of 2000 seeds, "1 tens" in 383.
+  it('F: never writes "1 tens", "1 ones", "0 tens" as singular or "1 is" as "1 are"', () => {
+    for (let seed = 0; seed < 2000; seed++) {
+      const g = md2CustomaryCapacityWordProblem.generate(makeRng(seed));
+      const text = [...g.explanation.stepByStep, g.explanation.commonMisconception ?? ''].join(' ');
+      expect(text, `seed ${seed}`).not.toMatch(/\b1 (?:tens|ones)\b/);
+      expect(text, `seed ${seed}`).not.toMatch(/\b1 are\b/);
+      expect(text, `seed ${seed}`).not.toMatch(/\bare only 1 one\b/);
+    }
+  });
+
   // RULING 14-1, the most serious finding in the Grade 3 pre-flight. A metric
   // unit here is another curriculum's content under an NC code, and it would
   // pass every other test in this file.
```

**Modify `src/curriculum/grade3/templates/md7-area-by-multiplying-side-lengths.test.ts`**

```diff
@@ -88,6 +88,25 @@ describe('g3.md7.area-by-multiplying-side-lengths', () => {
     }
   });
 
+  // content-g3 audit (Medium): "bulletin board 8 yards long", "patio 3 inches wide".
+  it('F: the unit suits the thing, at every seed', () => {
+    const SMALL = ['postcard', 'picture frame'];
+    const BIG = ['vegetable garden', 'patio', 'flower bed', 'chicken run'];
+    let seen = new Set<string>();
+    for (let seed = 0; seed < 1000; seed++) {
+      const { prompt } = md7AreaByMultiplyingSideLengths.generate(makeRng(seed));
+      const m = /^\w+'s (.+) is a rectangle \d+ (\w+) long/.exec(prompt)!;
+      const [thing, unit] = [m[1], m[2]];
+      expect(unit === 'inches', `seed ${seed}: ${thing} in ${unit}`).toBe(SMALL.includes(thing));
+      if (unit === 'yards') expect(BIG, `seed ${seed}: ${thing} in yards`).toContain(thing);
+      seen = seen.add(`${thing}/${unit}`);
+    }
+    // all three units still appear
+    expect([...seen].some((s) => s.endsWith('/inches'))).toBe(true);
+    expect([...seen].some((s) => s.endsWith('/feet'))).toBe(true);
+    expect([...seen].some((s) => s.endsWith('/yards'))).toBe(true);
+  });
+
   // Ruling 14-5's other half. This generator must carry its two side lengths
   // as NUMBERS and no tiles, so that multiplying them is the skill; the tiling
   // generator carries tiles and no numbers. See
```

**Modify `src/curriculum/grade3/templates/nbt2-add-within-1000.test.ts`**

```diff
@@ -38,6 +38,15 @@ describe('g3.nbt2.add-within-1000', () => {
     );
   });
 
+  // content-g3 audit (Medium): "= 1 tens" in 47 of 2000 seeds.
+  it('F: never writes "1 tens" or "1 hundreds" in the worked solution', () => {
+    for (let seed = 0; seed < 4000; seed++) {
+      const g = nbt2AddWithin1000.generate(makeRng(seed));
+      const text = [...g.explanation.stepByStep, g.explanation.commonMisconception ?? ''].join(' ');
+      expect(text, `seed ${seed}`).not.toMatch(/\b1 (?:tens|hundreds|ones)\b/);
+    }
+  });
+
   // LITERAL pins. Every other test here reads the addends back out of the
   // generator's own figure, so it would stay green through a change to the
   // seed -> digits mapping, to rng.pick ordering, or to the whole wording.
```

**Modify `src/curriculum/grade3/templates/nf1-unit-fraction-model.test.ts`**

```diff
@@ -24,6 +24,17 @@ function textOf(g: ReturnType<typeof nf1UnitFractionModel.generate>): string {
 }
 
 describe('g3.nf1.unit-fraction-model', () => {
+  // content-g3 audit (Medium): "2 whole rectangles, with 1 of them shaded" is 1/2
+  // of a set of rectangles, which a careful child can defend against "1/2 of a
+  // whole rectangle".
+  it('F: no wrong option describes one of several shapes shaded', () => {
+    for (let seed = 0; seed < 400; seed++) {
+      const g = nf1UnitFractionModel.generate(makeRng(seed));
+      for (const o of g.options) expect(o.text, `seed ${seed}`).not.toMatch(/with 1 of them shaded/);
+      expect(nf1UnitFractionModel.contentVersion).toBe(2);
+    }
+  });
+
   it('is sound at every seed', () => {
     assertTemplateSound(nf1UnitFractionModel);
   });
@@ -51,7 +62,7 @@ describe('g3.nf1.unit-fraction-model', () => {
         false,
         'counted-parts-without-checking-they-are-equal',
       ],
-      ['C', '2 whole rectangles, with 1 of them shaded.', false, 'treated-the-denominator-as-a-count-of-wholes'],
+      ['C', '2 whole rectangles, all shaded.', false, 'treated-the-denominator-as-a-count-of-wholes'],
       [
         'D',
         '1 whole rectangle shaded, and 2 more rectangles beside it.',
@@ -75,7 +86,7 @@ describe('g3.nf1.unit-fraction-model', () => {
         false,
         'read-the-fraction-as-two-whole-numbers',
       ],
-      ['B', '6 whole rectangles, with 1 of them shaded.', false, 'treated-the-denominator-as-a-count-of-wholes'],
+      ['B', '6 whole rectangles, all shaded.', false, 'treated-the-denominator-as-a-count-of-wholes'],
       ['C', 'One rectangle cut into 6 equal parts, with 1 part shaded.', true, null],
       [
         'D',
```


- [ ] **Step 2: Run them to verify they fail**

Run: `npx vitest run src/curriculum/grade3/templates/md2-customary-capacity-word-problem.test.ts src/curriculum/grade3/templates/md7-area-by-multiplying-side-lengths.test.ts src/curriculum/grade3/templates/nbt2-add-within-1000.test.ts src/curriculum/grade3/templates/nf1-unit-fraction-model.test.ts`
Expected: FAIL, 8 failed | 46 passed (54).

- [ ] **Step 3: Change the generators**

**Create `src/curriculum/grade3/templates/count.ts`**

```ts
/** "1 ten" but "9 tens". Every count in a worked solution runs through this,
 *  because a solution that reads "1 tens" is read by an eight-year-old. */
export function count(n: number, unit: string): string {
  return `${n} ${unit}${n === 1 ? '' : 's'}`;
}
```

**Modify `src/curriculum/grade3/templates/md2-customary-capacity-word-problem.ts`**

```diff
@@ -1,6 +1,7 @@
 import type { Rng } from '../../../engine/rng';
 import type { QuestionTemplate, GeneratedQuestion } from '../../../engine/template';
 import { labelOptions } from '../../../engine/questionModel';
+import { count } from './count';
 
 /**
  * NC.3.MD.2 — "Solve problems involving CUSTOMARY measurement", whose third
@@ -91,13 +92,16 @@ interface Vessel {
   liquid: string;
 }
 
+/** Every amount drawn is 30 to 99 units, so each vessel has to be able to hold
+ *  that much: a "soup pot" of 87 quarts or a "juice jug" of 93 pints is not
+ *  a thing a child has seen. */
 const VESSELS: Vessel[] = [
   { container: 'water tank', unit: 'gallons', liquid: 'water' },
   { container: 'rain barrel', unit: 'gallons', liquid: 'rain water' },
-  { container: 'soup pot', unit: 'quarts', liquid: 'soup' },
+  { container: 'fish tank', unit: 'gallons', liquid: 'water' },
   { container: 'cooler', unit: 'quarts', liquid: 'lemonade' },
-  { container: 'juice jug', unit: 'pints', liquid: 'juice' },
-  { container: 'milk can', unit: 'pints', liquid: 'milk' },
+  { container: 'soup kettle', unit: 'quarts', liquid: 'soup' },
+  { container: 'juice dispenser', unit: 'pints', liquid: 'juice' },
 ];
 
 const NAMES = ['Maya', 'Omar', 'Priya', 'Diego', 'Lena', 'Jonah'];
@@ -163,13 +167,13 @@ export const md2CustomaryCapacityWordProblem: QuestionTemplate = {
       explanation: {
         stepByStep: [
           `Step 1: Something is being taken away, so subtract: ${A} - ${B}.`,
-          `Step 2: There are only ${a0} ones in ${A} and ${b0} ones are needed, so trade one ten from the ${a1} tens. That leaves ${a1 - 1} tens and makes ${a0 + 10} ones.`,
-          `Step 3: ${a0 + 10} - ${b0} = ${a0 + 10 - b0} ones, and ${a1 - 1} - ${b1} = ${a1 - 1 - b1} tens.`,
+          `Step 2: There ${a0 === 1 ? 'is' : 'are'} only ${count(a0, 'one')} in ${A} and ${b0} ${b0 === 1 ? 'is' : 'are'} needed, so trade one ten from the ${count(a1, 'ten')}. That leaves ${count(a1 - 1, 'ten')} and makes ${count(a0 + 10, 'one')}.`,
+          `Step 3: ${a0 + 10} - ${b0} = ${count(a0 + 10 - b0, 'one')}, and ${a1 - 1} - ${b1} = ${count(a1 - 1 - b1, 'ten')}.`,
           `Step 4: Both amounts are already in ${unit}, so the answer keeps that unit: ${answerText} left.`,
         ],
         conceptSummary:
           'A measurement word problem is solved the same way as any other word problem - the measuring units just come along for the ride. When both amounts are already in the same customary unit, subtract the numbers and keep the unit.',
-        commonMisconception: `Answering ${amount(10 * (a1 - b1) + (b0 - a0), unit)} comes from taking the smaller digit away from the larger one in the ones column. ${a0} ones is not enough to take ${b0} away from, so a ten has to be traded first.`,
+        commonMisconception: `Answering ${amount(10 * (a1 - b1) + (b0 - a0), unit)} comes from taking the smaller digit away from the larger one in the ones column. ${count(a0, 'one')} ${a0 === 1 ? 'is' : 'are'} not enough to take ${b0} away from, so a ten has to be traded first.`,
       },
     };
   },
```

**Modify `src/curriculum/grade3/templates/md7-area-by-multiplying-side-lengths.ts`**

```diff
@@ -81,28 +81,34 @@ for (let L = 2; L <= 9; L++) {
   }
 }
 
+type UnitKey = 'inches' | 'feet' | 'yards';
+
 /** Rectangular things in a child's world, each one something whose area is a
- *  reason to measure it. */
-const THINGS = [
-  'vegetable garden',
-  'sandbox',
-  'bedroom rug',
-  'patio',
-  'bulletin board',
-  'flower bed',
-  'chicken run',
-  'reading corner',
+ *  reason to measure it, with the customary units a side of 2 to 9 of them
+ *  makes sense in. "A bulletin board 8 yards long" and "a patio 3 inches
+ *  wide" are not things a child has seen. */
+const THINGS: { thing: string; units: UnitKey[] }[] = [
+  { thing: 'vegetable garden', units: ['feet', 'yards'] },
+  { thing: 'sandbox', units: ['feet'] },
+  { thing: 'bedroom rug', units: ['feet'] },
+  { thing: 'patio', units: ['feet', 'yards'] },
+  { thing: 'bulletin board', units: ['feet'] },
+  { thing: 'flower bed', units: ['feet', 'yards'] },
+  { thing: 'chicken run', units: ['feet', 'yards'] },
+  { thing: 'reading corner', units: ['feet'] },
+  { thing: 'postcard', units: ['inches'] },
+  { thing: 'picture frame', units: ['inches'] },
 ];
 
 const NAMES = ['Ana', 'Theo', 'Rosa', 'Malik', 'Nina', 'Caleb', 'Sofia', 'Isaac'];
 
 /** Customary length units only (ruling 14-1), each with the singular a
  *  "1 ___ on each side" sentence needs — "1 feet" is not English. */
-const UNITS: { plural: string; singular: string }[] = [
-  { plural: 'inches', singular: 'inch' },
-  { plural: 'feet', singular: 'foot' },
-  { plural: 'yards', singular: 'yard' },
-];
+const UNITS: Record<UnitKey, { plural: string; singular: string }> = {
+  inches: { plural: 'inches', singular: 'inch' },
+  feet: { plural: 'feet', singular: 'foot' },
+  yards: { plural: 'yards', singular: 'yard' },
+};
 
 export const md7AreaByMultiplyingSideLengths: QuestionTemplate = {
   id: 'g3.md7.area-by-multiplying-side-lengths',
@@ -114,8 +120,8 @@ export const md7AreaByMultiplyingSideLengths: QuestionTemplate = {
 
   generate(rng: Rng): GeneratedQuestion {
     const name = rng.pick(NAMES);
-    const thing = rng.pick(THINGS);
-    const { plural: unit, singular } = rng.pick(UNITS);
+    const { thing, units } = rng.pick(THINGS);
+    const { plural: unit, singular } = UNITS[rng.pick(units)];
     const { L, W } = rng.pick(RECTANGLES);
 
     const squareUnit = `square ${unit}`;
```

**Modify `src/curriculum/grade3/templates/nbt2-add-within-1000.ts`**

```diff
@@ -1,6 +1,7 @@
 import type { Rng } from '../../../engine/rng';
 import type { QuestionTemplate, GeneratedQuestion } from '../../../engine/template';
 import { labelOptions } from '../../../engine/questionModel';
+import { count } from './count';
 
 /**
  * NC.3.NBT.2 — "Add and subtract whole numbers up to and including 1,000."
@@ -132,7 +133,7 @@ export const nbt2AddWithin1000: QuestionTemplate = {
         stepByStep: [
           `Step 1: Line the numbers up by place value and start at the ones: ${o.hi} + ${o.lo} = ${onesSum}.`,
           `Step 2: ${onesSum} is more than 9, so write ${onesSum - 10} in the ones place and carry the ten into the TENS column, right next door.`,
-          `Step 3: Add the tens with that carried ten: ${t.hi} + ${t.lo} + 1 = ${t.hi + t.lo + 1} tens. Then add the hundreds: ${h.hi} + ${h.lo} = ${h.hi + h.lo} hundreds.`,
+          `Step 3: Add the tens with that carried ten: ${t.hi} + ${t.lo} + 1 = ${count(t.hi + t.lo + 1, 'ten')}. Then add the hundreds: ${h.hi} + ${h.lo} = ${count(h.hi + h.lo, 'hundred')}.`,
           `Step 4: ${a} + ${b} = ${answerText}.`,
         ],
         conceptSummary:
```

**Modify `src/curriculum/grade3/templates/nbt2-subtract-within-1000.ts`**

```diff
@@ -1,6 +1,7 @@
 import type { Rng } from '../../../engine/rng';
 import type { QuestionTemplate, GeneratedQuestion } from '../../../engine/template';
 import { labelOptions } from '../../../engine/questionModel';
+import { count } from './count';
 
 /**
  * NC.3.NBT.2 — "Add and subtract whole numbers up to and including 1,000."
@@ -75,12 +76,6 @@ for (let hi = 3; hi <= 7; hi++) {
   }
 }
 
-/** "1 ten" but "9 tens". Every count in the worked solution runs through this,
- *  because a solution that reads "1 hundreds" is read by an eight-year-old. */
-function count(n: number, unit: string): string {
-  return `${n} ${unit}${n === 1 ? '' : 's'}`;
-}
-
 /** b0 > a0, so the ones column always has to regroup. */
 export const ONES_PAIRS: DigitPair[] = [];
 for (let top = 0; top <= 8; top++) {
```

**Modify `src/curriculum/grade3/templates/nf1-unit-fraction-model.ts`**

```diff
@@ -77,6 +77,7 @@ export const nf1UnitFractionModel: QuestionTemplate = {
   difficulty: 'mastery',
   calculatorAllowed: false,
   isStretch: false,
+  contentVersion: 2, // one option was reworded so it cannot be read as 1/d of a set
 
   generate(rng: Rng): GeneratedQuestion {
     const d = rng.pick(DENOMINATORS);
@@ -93,8 +94,10 @@ export const nf1UnitFractionModel: QuestionTemplate = {
         misconception: 'counted-parts-without-checking-they-are-equal',
       },
       // The d read as a number of whole things instead of parts of one whole.
+      // (The old wording, "d whole shapes, with 1 of them shaded", is 1/d of a
+      // SET, which a careful child could defend against "1/d of a whole shape".)
       {
-        text: `${d} whole ${s.many}, with 1 of them shaded.`,
+        text: `${d} whole ${s.many}, all shaded.`,
         isCorrect: false,
         misconception: 'treated-the-denominator-as-a-count-of-wholes',
       },
```


- [ ] **Step 4: Run the tests, the suite and the types**

Run: `npx vitest run src/curriculum/grade3` then `npm run test:run` then `npm run typecheck`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/curriculum/grade3/templates/md2-customary-capacity-word-problem.test.ts src/curriculum/grade3/templates/md7-area-by-multiplying-side-lengths.test.ts src/curriculum/grade3/templates/nbt2-add-within-1000.test.ts src/curriculum/grade3/templates/nf1-unit-fraction-model.test.ts src/curriculum/grade3/templates/count.ts src/curriculum/grade3/templates/md2-customary-capacity-word-problem.ts src/curriculum/grade3/templates/md7-area-by-multiplying-side-lengths.ts src/curriculum/grade3/templates/nbt2-add-within-1000.ts src/curriculum/grade3/templates/nbt2-subtract-within-1000.ts src/curriculum/grade3/templates/nf1-unit-fraction-model.ts
git commit -m "fix: grade 3 generators: units that suit the thing, vessels that hold the amount, no 1 tens (content-g3)" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01X5HSDdHPWxvHxgBaoSTbLX"
```

---

### Task 12: Grade 4 authored items and study guides (content-g4 Medium and Low)

Findings: Medium `g4-oa5-04` (option C "add 9, then add 36, then add 144" is literally true of the four terms; the stem now asks for one rule that would keep working after 192), Low-Medium `g4-oa3-04` and the OA.3 guide (parentheses are NC.5.OA.2; the item now asks for a pair of equations `m + 27 = n` and `n ÷ 6 = 14`, solved: 6 × 14 = 84 members after joining, so m = 57), Medium (the key is the uniquely longest option in `g4-nf1-03`, `nf2-02`, `nf2-04`, `nf7-05`, `md1-03`, `g3-01`; keys shortened, distractors lengthened, each last worked step still quotes the key), and Low wording (`supplement` in `g4-md6-02` and the protractor trap, the clumsy `g4-nbt2-01` stem, the NBT.4 guide's claim about how the EOG is assessed). Judgement: the diagnostic's NF 24 percent and MD+G 36 percent is by design (one item per standard, nothing computes a weighted score from it), so it is pinned rather than rebalanced.

**Files:**
- Modify: `src/curriculum/grade4/authored.oa.ts`, `authored.nf.ts`, `authored.md.ts`, `authored.g.ts`, `authored.nbt.ts`, `studyGuides.ts`
- Create: `src/curriculum/grade4/audit.test.ts`

**Interfaces:**
- Consumes: Task 1's `contentVersion`; Task 2 already rewrote `g4-nf4-02`.
- Produces: bumped ids `g4-oa5-04`, `g4-oa3-04`, `g4-nf1-03`, `g4-nf2-02`, `g4-nf2-04`, `g4-nf7-05`, `g4-md1-03`, `g4-g3-01`.

- [ ] **Step 1: Write the failing tests**

**Create `src/curriculum/grade4/audit.test.ts`**

```ts
import { describe, it, expect } from 'vitest';
import { GRADE_4 } from './index';
import { GRADE_4_AUTHORED } from './authored';
import { GRADE_4_STUDY_GUIDES } from './studyGuides';
import { standardsOf } from '../registry';

// Regression tests for docs/superpowers/audits/2026-09-30/content-g4.md.

const item = (id: string) => GRADE_4_AUTHORED.find((q) => q.id === id)!;
const key = (id: string) => item(id).options.find((o) => o.isCorrect)!.text;

describe('content-g4 audit: authored items', () => {
  it('Medium g4-oa5-04: the stem asks for one rule that keeps working, so the list of steps is not an answer', () => {
    const q = item('g4-oa5-04');
    expect(q.prompt).toMatch(/single rule/);
    expect(q.prompt).toMatch(/keep working after 192/);
    expect(q.options.find((o) => /then add 36/.test(o.text))!.isCorrect).toBe(false);
    expect(q.contentVersion).toBe(2);
  });

  it('Low-Medium g4-oa3-04: Grade 4 uses no grouping symbols (they are NC.5.OA.2)', () => {
    const q = item('g4-oa3-04');
    for (const o of q.options) expect(o.text, o.text).not.toMatch(/[()]/);
    expect(key('g4-oa3-04')).toBe('m + 27 = n and n ÷ 6 = 14');
    // 6 teams of 14 is 84 members after joining, so the club started with 57.
    expect(6 * 14 - 27).toBe(57);
    expect(GRADE_4_STUDY_GUIDES['NC.4.OA.3'].rulesAndFormulas.map((r) => r.detail).join(' ')).not.toMatch(/Grouping matters/);
    expect(q.contentVersion).toBe(2);
  });

  it('Medium: the key is not the uniquely longest option in the six items the audit named', () => {
    for (const id of ['g4-nf1-03', 'g4-nf2-02', 'g4-nf2-04', 'g4-nf7-05', 'g4-md1-03', 'g4-g3-01']) {
      const others = item(id).options.filter((o) => !o.isCorrect).map((o) => o.text.length);
      expect(key(id).length, `${id}: key ${key(id).length} vs ${others.join(', ')}`).toBeLessThanOrEqual(Math.max(...others));
      // and the last worked step still quotes the (new) key
      expect(item(id).explanation.stepByStep.at(-1), id).toContain(key(id));
      expect(item(id).contentVersion, id).toBe(2);
    }
  });

  it('Low md6-02 and the protractor trap: no "supplement" in a Grade 4 explanation', () => {
    expect(item('g4-md6-02').explanation.commonMisconception).not.toMatch(/supplement/i);
    expect(JSON.stringify(GRADE_4_STUDY_GUIDES['NC.4.MD.6'])).not.toMatch(/supplement/i);
  });

  it('Low g4-nbt2-01: the stem quotes the number name instead of the clumsy "the number name"', () => {
    expect(item('g4-nbt2-01').prompt).toBe('Which numeral is "forty thousand, ninety-three"?');
  });
});

describe('content-g4 audit: study guides', () => {
  it('Low NBT.4: does not claim how the EOG is assessed', () => {
    expect(GRADE_4_STUDY_GUIDES['NC.4.NBT.4'].workedExample.whyItMattersForSSA).not.toMatch(/much of it is assessed/);
  });
});

describe('content-g4 audit: the check-up is one item per standard, by design', () => {
  // Medium in the audit: the diagnostic's domain mix is NF 24% / MD+G 36%
  // against a blueprint of 32% / 25%. It is deliberately unweighted: it exists
  // to give every standard a first reading, and nothing computes a weighted
  // score from it (overallReadiness weights per standard from mastery, and the
  // path reads the check-up per domain). This test pins the design.
  it('Medium: exactly one item per standard, so every standard gets a first reading', () => {
    const diagnostic = GRADE_4.quizzes.find((q) => q.isDiagnostic)!;
    const standardOf = new Map(GRADE_4_AUTHORED.map((q) => [q.id, q.standardCode]));
    const codes = diagnostic.questionIds.map((id) => standardOf.get(id)!);
    expect(codes.slice().sort()).toEqual(standardsOf(GRADE_4).map((s) => s.code).sort());
  });
});
```


- [ ] **Step 2: Run them to verify they fail**

Run: `npx vitest run src/curriculum/grade4/audit.test.ts`
Expected: FAIL, 6 failed | 1 passed (7).

- [ ] **Step 3: Rewrite the items and fix the guides**

**Modify `src/curriculum/grade4/authored.g.ts`**

```diff
@@ -534,12 +534,13 @@ export const GRADE_4_G_AUTHORED: Question[] = [
     id: 'g4-g3-01',
     standardCode: 'NC.4.G.3',
     domainId: 'G',
+    contentVersion: 2,
     prompt: 'Which statement about the rectangle described below is true?',
     promptDetails:
       'The rectangle is 12 centimeters long and 5 centimeters wide, so it is much longer than it is wide.',
     options: labelOptions([
       {
-        text: 'It has exactly 2 lines of symmetry: one straight down the middle and one straight across the middle.',
+        text: 'It has exactly 2 lines of symmetry, one down and one across the middle.',
         isCorrect: true,
       },
       // Counted the two diagonals as fold lines as well, 2 + 2 = 4. A diagonal
@@ -572,7 +573,7 @@ export const GRADE_4_G_AUTHORED: Question[] = [
         'Step 1: A line of symmetry is a fold line: fold the figure along it and the two halves have to land exactly on top of each other.',
         'Step 2: Fold this rectangle straight down the middle and the left half lands on the right half. Fold it straight across the middle and the top half lands on the bottom half. Both folds work.',
         'Step 3: Now try a diagonal, corner to opposite corner. It does cut the rectangle into two triangles of the same size, but folding along it lays a 12-centimeter side onto a 5-centimeter side, and those do not match.',
-        'Step 4: So there are two fold lines and no more: It has exactly 2 lines of symmetry: one straight down the middle and one straight across the middle.',
+        'Step 4: So there are two fold lines and no more: It has exactly 2 lines of symmetry, one down and one across the middle.',
       ],
       conceptSummary:
         'Symmetry is tested by folding, not by looking. A fold line counts only when every point of one half lands on a matching point of the other half.',
```

**Modify `src/curriculum/grade4/authored.md.ts`**

```diff
@@ -215,6 +215,7 @@ export const GRADE_4_MD_AUTHORED: Question[] = [
     id: 'g4-md1-03',
     standardCode: 'NC.4.MD.1',
     domainId: 'MD',
+    contentVersion: 2,
     prompt:
       'A recipe needs 250 milliliters of milk for one batch. Priya wants to know how much milk 5 batches need. She writes 250 × 5 = 1,250 and says the answer is 1,250 liters. Which statement about her work is correct?',
     // All four options are sentences, so the canonical parser returns null for
@@ -223,23 +224,23 @@ export const GRADE_4_MD_AUTHORED: Question[] = [
       // Her arithmetic is right, but she attached a unit that was never in the
       // problem: the measurements were given in millilitres.
       {
-        text: 'Her multiplication is right, and 1,250 liters is correct.',
+        text: 'Her multiplication is right, so 1,250 liters is the correct answer.',
         isCorrect: false,
         misconception: 'mislabeled-the-unit',
       },
       {
-        text: 'Her multiplication is right, but the answer is 1,250 milliliters, not liters.',
+        text: 'Her multiplication is right, but the unit should be milliliters.',
         isCorrect: true,
       },
       // Added the two numbers instead of multiplying: 250 + 5 = 255.
       {
-        text: 'She should have added: 250 + 5 = 255 milliliters.',
+        text: 'She should have added the two numbers: 250 + 5 = 255 milliliters.',
         isCorrect: false,
         misconception: 'added-instead-of-multiplied',
       },
       // Divided instead of multiplying: 250 ÷ 5 = 50.
       {
-        text: 'She should have divided: 250 ÷ 5 = 50 milliliters.',
+        text: 'She should have divided the two numbers: 250 ÷ 5 = 50 milliliters.',
         isCorrect: false,
         misconception: 'divided-instead-of-multiplied',
       },
@@ -252,7 +253,7 @@ export const GRADE_4_MD_AUTHORED: Question[] = [
         'Step 1: Five batches each needing the same amount is five equal groups, so multiplying is the right operation: 250 × 5.',
         'Step 2: 250 × 5 = 1,250, so Priya’s arithmetic is correct.',
         'Step 3: The 250 in the problem is 250 MILLILITERS, so the product is 1,250 milliliters. Nothing in the problem was measured in liters.',
-        'Step 4: Her multiplication is right, but the answer is 1,250 milliliters, not liters.',
+        'Step 4: Her multiplication is right, but the unit should be milliliters.',
       ],
       conceptSummary:
         'A measurement answer is a number AND a unit, and the unit comes from the measurements you multiplied — it is not chosen afterwards to suit the size of the number.',
@@ -1101,7 +1102,7 @@ export const GRADE_4_MD_AUTHORED: Question[] = [
       conceptSummary:
         'Reading a protractor is two steps: line one ray up with a zero, then read the scale that zero belongs to. Deciding first whether the angle is acute or obtuse tells you at once whether the number you read is believable.',
       commonMisconception:
-        'The two numbers where a ray crosses the protractor always add to 180, so picking the wrong one gives the supplement of the angle instead of the angle.',
+        'The two numbers where a ray crosses the protractor always add to 180, so picking the wrong one gives 180 minus the angle instead of the angle.',
     },
   },
   {
```

**Modify `src/curriculum/grade4/authored.nbt.ts`**

```diff
@@ -186,7 +186,7 @@ export const GRADE_4_NBT_AUTHORED: Question[] = [
     id: 'g4-nbt2-01',
     standardCode: 'NC.4.NBT.2',
     domainId: 'NBT',
-    prompt: 'Which numeral is the number name forty thousand, ninety-three?',
+    prompt: 'Which numeral is "forty thousand, ninety-three"?',
     options: labelOptions([
       // Wrote 9 and 3 straight after the comma, so the zero that has to hold
       // the empty hundreds place was pushed down into the ones place instead:
```

**Modify `src/curriculum/grade4/authored.nf.ts`**

```diff
@@ -200,7 +200,7 @@ export const GRADE_4_NF_AUTHORED: Question[] = [
         misconception: 'larger-denominator-means-larger-fraction',
       },
       {
-        text: 'They are the same size, but 3/6 is made of more parts and each of those parts is smaller.',
+        text: 'They are equal: 3/6 uses more parts, but each part is smaller.',
         isCorrect: true,
       },
       // Counted 3 shaded parts against 1 shaded part and stopped, never asking
@@ -221,12 +221,13 @@ export const GRADE_4_NF_AUTHORED: Question[] = [
     calculatorAllowed: false,
     isStretch: false,
     difficulty: 'advanced',
+    contentVersion: 2,
     explanation: {
       stepByStep: [
         'Step 1: The strips are the same length, so the two shaded amounts can be compared directly.',
         'Step 2: Each sixth is one third the size of a half, because 6 is 3 times 2.',
         'Step 3: There are 3 shaded sixths and only 1 shaded half, and 3 parts that are each one third the size cover exactly the same length.',
-        'Step 4: They are the same size, but 3/6 is made of more parts and each of those parts is smaller.',
+        'Step 4: They are equal: 3/6 uses more parts, but each part is smaller.',
       ],
       conceptSummary:
         'NC.4.NF.1 is about explaining WHY two fractions are equivalent: the number of parts and the size of the parts move in opposite directions by the same factor, so the amount they cover stays put.',
@@ -326,6 +327,7 @@ export const GRADE_4_NF_AUTHORED: Question[] = [
     id: 'g4-nf2-02',
     standardCode: 'NC.4.NF.2',
     domainId: 'NF',
+    contentVersion: 2,
     prompt:
       "Mr. Diaz's class walked 7/12 mile and Ms. Rowe's class walked 5/6 mile on the same trail. Which class walked farther, and why?",
     options: labelOptions([
@@ -333,19 +335,19 @@ export const GRADE_4_NF_AUTHORED: Question[] = [
       // walker; twelfths are smaller parts than sixths, which this never
       // accounts for.
       {
-        text: "Mr. Diaz's class, because 7 is greater than 5.",
+        text: "Mr. Diaz's class, because the numerator 7 is greater than 5.",
         isCorrect: false,
         misconception: 'compared-numerators-only',
       },
       // 12 > 6, so the fraction written with the bigger denominator was called
       // the bigger distance.
       {
-        text: "Mr. Diaz's class, because 12 is greater than 6.",
+        text: "Mr. Diaz's class, because the denominator 12 is greater than 6.",
         isCorrect: false,
         misconception: 'larger-denominator-means-larger-fraction',
       },
       {
-        text: "Ms. Rowe's class, because 5/6 is the same as 10/12, and 10/12 is more than 7/12.",
+        text: "Ms. Rowe's class, because 5/6 = 10/12, which is more than 7/12.",
         isCorrect: true,
       },
       // Both fractions clear the 1/2 benchmark - 7/12 > 6/12 and 5/6 > 3/6 -
@@ -365,7 +367,7 @@ export const GRADE_4_NF_AUTHORED: Question[] = [
         'Step 1: The two classes walked the same trail, so the fractions refer to the same whole mile and can be compared.',
         'Step 2: 12 is a multiple of 6, so rename the sixths as twelfths: 5/6 = 10/12.',
         'Step 3: Now the parts are the same size, so the numerators decide it: 10 twelfths against 7 twelfths.',
-        "Step 4: Ms. Rowe's class, because 5/6 is the same as 10/12, and 10/12 is more than 7/12.",
+        "Step 4: Ms. Rowe's class, because 5/6 = 10/12, which is more than 7/12.",
       ],
       conceptSummary:
         'Two fractions can only be compared by their numerators once their denominators match. Renaming one fraction so both count the same-size parts is usually less work than renaming both.',
@@ -420,6 +422,7 @@ export const GRADE_4_NF_AUTHORED: Question[] = [
     id: 'g4-nf2-04',
     standardCode: 'NC.4.NF.2',
     domainId: 'NF',
+    contentVersion: 2,
     prompt:
       'Rosa ate 1/4 of a small pizza. Her cousin ate 1/6 of a large pizza, and the large pizza is much bigger than the small one. Rosa says "I ate more, because fourths are bigger pieces than sixths." What is wrong with her reasoning?',
     options: labelOptions([
@@ -446,7 +449,7 @@ export const GRADE_4_NF_AUTHORED: Question[] = [
         misconception: 'compared-across-different-wholes',
       },
       {
-        text: 'The two pizzas are different sizes, so comparing 1/4 and 1/6 cannot tell you who ate more food.',
+        text: 'The pizzas are different sizes, so 1/4 and 1/6 cannot be compared.',
         isCorrect: true,
       },
     ]),
@@ -458,7 +461,7 @@ export const GRADE_4_NF_AUTHORED: Question[] = [
         'Step 1: Rosa is right about the fractions themselves: of one identical pizza, 1/4 is more than 1/6, because fourths are the bigger pieces.',
         'Step 2: But 1/4 and 1/6 are fractions OF something, and here they are fractions of two different pizzas.',
         'Step 3: A sixth of a very large pizza can easily be more food than a fourth of a small one, so the fractions alone do not settle it.',
-        'Step 4: The two pizzas are different sizes, so comparing 1/4 and 1/6 cannot tell you who ate more food.',
+        'Step 4: The pizzas are different sizes, so 1/4 and 1/6 cannot be compared.',
       ],
       conceptSummary:
         'NC.4.NF.2 says it directly: comparisons are valid only when the two fractions refer to the same whole. A fraction is not an amount until you know what it is a fraction of.',
@@ -1220,6 +1223,7 @@ export const GRADE_4_NF_AUTHORED: Question[] = [
     id: 'g4-nf7-05',
     standardCode: 'NC.4.NF.7',
     domainId: 'NF',
+    contentVersion: 2,
     prompt:
       'A juice carton is 0.4 full. A milk jug is 0.05 full. The carton and the jug are not the same size. Which statement is TRUE?',
     options: labelOptions([
@@ -1246,7 +1250,7 @@ export const GRADE_4_NF_AUTHORED: Question[] = [
         misconception: 'compared-across-different-wholes',
       },
       {
-        text: 'The carton is the greater fraction full, but which container holds more liquid cannot be told from 0.4 and 0.05 alone.',
+        text: 'The carton is fuller, but which one holds more liquid cannot be told.',
         isCorrect: true,
       },
     ]),
@@ -1258,7 +1262,7 @@ export const GRADE_4_NF_AUTHORED: Question[] = [
         'Step 1: Compare the two decimals by place value: 0.4 is 40 hundredths and 0.05 is 5 hundredths, so 0.4 is much the greater number.',
         'Step 2: That settles one of the two questions here — which container is the greater fraction full. It is the carton.',
         'Step 3: It does not settle the other. A decimal is a fraction OF something, and these are fractions of two different containers: if the jug holds ten times what the carton holds, 0.05 of the jug is half a carton — more liquid than the carton has in it.',
-        'Step 4: The carton is the greater fraction full, but which container holds more liquid cannot be told from 0.4 and 0.05 alone.',
+        'Step 4: The carton is fuller, but which one holds more liquid cannot be told.',
       ],
       conceptSummary:
         'NC.4.NF.7 says it directly: a comparison of two decimals is valid only when they refer to the same whole. Two questions hide in one here — which is fuller, and which holds more — and the decimals answer only the first.',
```

**Modify `src/curriculum/grade4/authored.oa.ts`**

```diff
@@ -290,33 +290,37 @@ export const GRADE_4_OA_AUTHORED: Question[] = [
     id: 'g4-oa3-04',
     standardCode: 'NC.4.OA.3',
     domainId: 'OA',
+    // One equation per step, with a letter for each unknown quantity. Grouping
+    // symbols are NC.5.OA.2, so nothing here needs parentheses. Solved: 6 teams
+    // of 14 is n = 6 x 14 = 84 members after joining, so m = 84 - 27 = 57.
     prompt:
-      'A club had some members. Then 27 new members joined. The club then split into 6 equal teams with 14 members on each team. Which equation uses m for the number of members the club started with?',
+      'A club had some members. Then 27 new members joined. The club then split into 6 equal teams with 14 members on each team. Let m be the members the club started with and n the members after 27 joined. Which pair of equations matches the story?',
     options: labelOptions([
-      { text: '(m + 27) ÷ 6 = 14', isCorrect: true },
-      // Without the parentheses only the 27 is divided by 6, so the new members
-      // are split into teams and the original members are not.
-      { text: 'm + 27 ÷ 6 = 14', isCorrect: false, misconception: 'ignored-grouping-symbols' },
+      // The 27 new members were taken away instead of added, which describes a
+      // club that got smaller.
+      { text: 'm − 27 = n and n ÷ 6 = 14', isCorrect: false, misconception: 'subtracted-instead-of-added' },
       // Splitting into equal teams is a division; multiplying by 6 instead
       // makes the club grow when it was being shared out.
-      { text: '(m + 27) × 6 = 14', isCorrect: false, misconception: 'multiplied-instead-of-divided' },
+      { text: 'm + 27 = n and n × 6 = 14', isCorrect: false, misconception: 'multiplied-instead-of-divided' },
+      { text: 'm + 27 = n and n ÷ 6 = 14', isCorrect: true },
       // "6 teams of 14" was written as 6 + 14 rather than 6 × 14.
-      { text: 'm + 27 = 6 + 14', isCorrect: false, misconception: 'added-instead-of-multiplied' },
+      { text: 'm + 27 = n and n = 6 + 14', isCorrect: false, misconception: 'added-instead-of-multiplied' },
     ]),
     calculatorAllowed: false,
     isStretch: true,
     difficulty: 'stretch',
+    contentVersion: 2,
     explanation: {
       stepByStep: [
-        'Step 1: Let m stand for the members the club started with.',
-        'Step 2: After 27 joined, the club has m + 27 members, and that whole amount is split into teams.',
-        'Step 3: Grouping symbols are what make the WHOLE amount get divided: (m + 27) ÷ 6.',
-        'Step 4: Each team has 14 members, so the equation is (m + 27) ÷ 6 = 14 (and m = 57).',
+        'Step 1: Let m stand for the members the club started with and n for the members after 27 joined.',
+        'Step 2: Joining adds members, so the first equation is m + 27 = n.',
+        'Step 3: Those n members were split into 6 equal teams of 14, so the second equation is n ÷ 6 = 14.',
+        'Step 4: So the pair is m + 27 = n and n ÷ 6 = 14 (and n = 84, so m = 57).',
       ],
       conceptSummary:
-        'NC.4.OA.3 asks students to represent the problem with an equation and a letter for the unknown. The parentheses are not decoration: they record that the joining happened before the splitting.',
+        'NC.4.OA.3 asks students to represent a multi-step problem with equations and a letter for the unknown. One equation for each step keeps the joining and the splitting apart.',
       commonMisconception:
-        'Writing m + 27 ÷ 6 = 14 divides only the 27, which describes a different story than the one in the problem.',
+        'Writing m − 27 = n takes the new members away instead of adding them, which describes a club that got smaller.',
     },
   },
   {
@@ -605,11 +609,14 @@ export const GRADE_4_OA_AUTHORED: Question[] = [
     domainId: 'OA',
     // "Which rule generates this pattern?" would have had two right answers:
     // "Add 9, then add 36, then add 144" really does produce these four terms.
-    // The stem now asks for the ONE rule that takes each term to the next, so
-    // a changing rule is unambiguously not an answer — and stays a good
-    // distractor for the child who read the gaps instead of the ratio.
+    // The stem now asks for the ONE rule that takes every term to the next and
+    // would keep working after 192, so a list of changing steps is
+    // unambiguously not an answer — and stays a good distractor for the child
+    // who read the gaps instead of the ratio. (The earlier stem, "takes each
+    // term to the next one", was still literally true of that list.)
     prompt:
-      'A number pattern begins 3, 12, 48, 192. Which rule takes each term of this pattern to the next one?',
+      'A number pattern begins 3, 12, 48, 192. Which single rule takes each term to the next and would keep working after 192?',
+    contentVersion: 2,
     options: labelOptions([
       { text: 'Multiply by 4', isCorrect: true },
       // 3 + 9 = 12 checks out, so the rule was accepted after testing only the
```

**Modify `src/curriculum/grade4/studyGuides.ts`**

```diff
@@ -429,7 +429,7 @@ export const GRADE_4_STUDY_GUIDES: Record<string, StudyGuideSection> = {
       ],
       answer: '6,125 tickets',
       whyItMattersForSSA:
-        'Multi-digit addition and subtraction is core Base Ten work, and Base Ten is 25–29% of the Grade 4 EOG; much of it is assessed without a calculator, so accuracy on paper is what counts.',
+        'Multi-digit addition and subtraction is core Base Ten work, and Base Ten is 25–29% of the Grade 4 EOG; every Base Ten question in this app is done without a calculator, so accuracy on paper is what counts.',
     },
   },
 
@@ -755,7 +755,7 @@ export const GRADE_4_STUDY_GUIDES: Record<string, StudyGuideSection> = {
       'Step 6: Check by adding the two parts back together - they must give the whole.',
     ],
     commonTraps: [
-      'Reading the wrong protractor scale. The two numbers where a ray crosses the protractor always add to 180, so picking the wrong one gives the supplement of the angle instead of the angle.',
+      'Reading the wrong protractor scale. The two numbers where a ray crosses the protractor always add to 180, so picking the wrong one gives 180 minus the angle instead of the angle.',
       'Assuming a straight angle. Answering 180 degrees assumes the two outer rays point in exactly opposite directions, which a diagram has to actually say.',
       'Assuming a right angle where the diagram never marked one.',
       'Answering with a part bigger than the whole. A part of an angle can never be bigger than the angle it sits inside.',
@@ -958,7 +958,7 @@ export const GRADE_4_STUDY_GUIDES: Record<string, StudyGuideSection> = {
     coreConcept:
       'A two-step problem hides a question inside a question: you have to answer the first one to get the number the second one needs. The commonest way to lose the mark is to solve step one correctly and hand it in, so the last thing to do before writing an answer is to reread what was actually asked.',
     rulesAndFormulas: [
-      { label: 'Write one equation', detail: 'Use a letter for the final unknown: m = 8 x 12 - 27. Grouping matters - m + 27 / 6 divides only the 27.' },
+      { label: 'Write one equation', detail: 'Use a letter for the final unknown: m = 8 x 12 - 27. Or write one equation for each step: n = m + 27, then n / 6 = 14.' },
       { label: 'Estimate for reasonableness', detail: 'Round the numbers and check the size of your answer, but only report the exact value if the question said "exactly".' },
       { label: 'Interpret the remainder', detail: 'Round up for vans and boxes, drop it when it cannot be used, or report it when the question asks what is left over.' },
       { label: 'Repeated groups multiply', detail: '8 trays of 12 is 8 x 12, not 8 + 12.' },
```


- [ ] **Step 4: Run the tests, the suite and the types**

Run: `npx vitest run src/curriculum/grade4` then `npm run test:run` then `npm run typecheck`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/curriculum/grade4/audit.test.ts src/curriculum/grade4/authored.g.ts src/curriculum/grade4/authored.md.ts src/curriculum/grade4/authored.nbt.ts src/curriculum/grade4/authored.nf.ts src/curriculum/grade4/authored.oa.ts src/curriculum/grade4/studyGuides.ts
git commit -m "fix: grade 4 items with a second true reading, a length tell or Grade 5 notation (content-g4)" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01X5HSDdHPWxvHxgBaoSTbLX"
```

---

### Task 13: Grade 4 generators: oa1 caps and the nf1 wording

Findings: Medium `oa1.times-as-many` (lengths up to 99 × 9 = 891 for every context: a bookshelf 891 centimeters tall), Low `nf1.equivalent-fraction` ("each of the a shaded parts" when the prompt shows no picture). The caps are per context (rope 300 feet, ribbon 300 inches, path 200 meters, shelf 250 centimeters) and only remove draws, so the collision algebra in the file header still holds; the template is bumped to version 2.

**Files:**
- Modify: `src/curriculum/grade4/templates/oa1-times-as-many.ts`, `nf1-equivalent-fraction.ts`, and their `.test.ts` files

**Interfaces:**
- Consumes: Task 1's `QuestionTemplate.contentVersion`.
- Produces: `admissibleMultipliers(k: number, maxProduct: number): number[]` and `MULTIPLIERS: Record<string, Record<number, number[]>>` (context name, then factor) exported from `oa1-times-as-many.ts`; template `g4.oa1.times-as-many` at version 2.

- [ ] **Step 1: Write the failing tests**

**Modify `src/curriculum/grade4/templates/nf1-equivalent-fraction.test.ts`**

```diff
@@ -30,6 +30,14 @@ const valueOf = (text: string): number => {
 };
 
 describe('g4.nf1.equivalent-fraction', () => {
+  // content-g4 audit (Low): "each of the a shaded parts", but the prompt shows no picture.
+  it('Low: the worked step does not refer to shading the prompt never showed', () => {
+    for (let seed = 0; seed < 200; seed++) {
+      const g = nf1EquivalentFraction.generate(makeRng(seed));
+      expect(g.explanation.stepByStep.join(' '), `seed ${seed}`).not.toMatch(/shaded/i);
+    }
+  });
+
   it('is sound at every seed', () => {
     assertTemplateSound(nf1EquivalentFraction);
   });
```

**Modify `src/curriculum/grade4/templates/oa1-times-as-many.test.ts`**

```diff
@@ -1,7 +1,7 @@
 import { describe, it, expect } from 'vitest';
 import { assertTemplateSound } from '../../../engine/templateTesting';
 import { makeRng } from '../../../engine/rng';
-import { oa1TimesAsMany } from './oa1-times-as-many';
+import { oa1TimesAsMany, MULTIPLIERS } from './oa1-times-as-many';
 
 /** Pulls the two numbers out of the prompt, independently of the generator,
  *  so this test cannot inherit a bug from the code it is checking. */
@@ -38,6 +38,30 @@ describe('g4.oa1.times-as-many', () => {
     expect(g.prompt.length).toBeGreaterThan(0);
   });
 
+  // content-g4 audit (Medium): b was 10 to 99 and k 2 to 9 for every context,
+  // so a bookshelf came out 891 centimeters tall.
+  it('F: no context is asked for a length beyond what that thing can be', () => {
+    const CAP: Record<string, number> = {
+      'climbing rope': 300,
+      ribbon: 300,
+      'garden path': 200,
+      bookshelf: 250,
+    };
+    for (let seed = 0; seed < 1000; seed++) {
+      const g = oa1TimesAsMany.generate(makeRng(seed));
+      const thing = Object.keys(CAP).find((t) => g.prompt.includes(` ${t} is `))!;
+      expect(thing, `seed ${seed}: ${g.prompt}`).toBeTruthy();
+      expect(Number(g.answerText.split(' ')[0]), `seed ${seed}: ${g.prompt}`).toBeLessThanOrEqual(CAP[thing]);
+    }
+  });
+
+  it('F: every context still has a multiplier for every factor, and the version is bumped', () => {
+    for (const perFactor of Object.values(MULTIPLIERS)) {
+      for (const list of Object.values(perFactor)) expect(list.length).toBeGreaterThan(0);
+    }
+    expect(oa1TimesAsMany.contentVersion).toBe(2);
+  });
+
   it('always picks a length whose ones digit really does carry', () => {
     // The one admissibility rule the collision algebra demands: without a
     // carry, the added-carry-before-multiplying distractor equals the answer.
```


- [ ] **Step 2: Run them to verify they fail**

Run: `npx vitest run src/curriculum/grade4/templates/nf1-equivalent-fraction.test.ts src/curriculum/grade4/templates/oa1-times-as-many.test.ts`
Expected: FAIL, 3 failed | 21 passed (24).

- [ ] **Step 3: Change the generators**

**Modify `src/curriculum/grade4/templates/nf1-equivalent-fraction.ts`**

```diff
@@ -159,7 +159,7 @@ export const nf1EquivalentFraction: QuestionTemplate = {
       explanation: {
         stepByStep: [
           `Step 1: Find how the parts change size: ${D} / ${b} = ${k}, so each of the ${b} parts splits into ${k} smaller parts.`,
-          `Step 2: Splitting every part into ${k} also splits each of the ${a} shaded parts into ${k}: ${a} x ${k} = ${a * k}.`,
+          `Step 2: Splitting every part into ${k} also splits each of the ${a} parts being counted into ${k}: ${a} x ${k} = ${a * k}.`,
           `Step 3: Both the numerator and the denominator were multiplied by ${k}, which is the factor ${k}/${k} — one whole — so the amount did not change.`,
           `Step 4: ${a}/${b} = ${answer}.`,
         ],
```

**Modify `src/curriculum/grade4/templates/oa1-times-as-many.ts`**

```diff
@@ -3,6 +3,9 @@ import type { QuestionTemplate, GeneratedQuestion } from '../../../engine/templa
 import { labelOptions } from '../../../engine/questionModel';
 
 interface Context {
+  /** The largest answer that is a length a child has seen for this thing:
+   *  99 x 9 = 891 made a bookshelf 891 centimeters tall. */
+  maxProduct: number;
   /** Plural noun for the thing being measured. */
   thing: string;
   /** Adjective for the shorter one, then the longer one. */
@@ -14,10 +17,10 @@ interface Context {
 }
 
 const CONTEXTS: Context[] = [
-  { thing: 'climbing rope', small: 'blue', large: 'red', unit: 'feet', measure: 'long' },
-  { thing: 'ribbon', small: 'green', large: 'yellow', unit: 'inches', measure: 'long' },
-  { thing: 'garden path', small: 'gravel', large: 'brick', unit: 'meters', measure: 'long' },
-  { thing: 'bookshelf', small: 'oak', large: 'pine', unit: 'centimeters', measure: 'tall' },
+  { maxProduct: 300, thing: 'climbing rope', small: 'blue', large: 'red', unit: 'feet', measure: 'long' },
+  { maxProduct: 300, thing: 'ribbon', small: 'green', large: 'yellow', unit: 'inches', measure: 'long' },
+  { maxProduct: 200, thing: 'garden path', small: 'gravel', large: 'brick', unit: 'meters', measure: 'long' },
+  { maxProduct: 250, thing: 'bookshelf', small: 'oak', large: 'pine', unit: 'centimeters', measure: 'tall' },
 ];
 
 const FACTORS = [2, 3, 4, 5, 6, 7, 8, 9];
@@ -64,19 +67,31 @@ const FACTORS = [2, 3, 4, 5, 6, 7, 8, 9];
  * output — authored and generated items carry different review keys, so a
  * question reachable both ways would reach a child twice under two identities.
  */
-function admissibleMultipliers(k: number): number[] {
+/**
+ * The multipliers m for which b = m*k is a two-digit length whose ones digit
+ * carries, and whose answer b*k stays within `maxProduct` (content-g4 audit:
+ * without the cap a bookshelf came out 891 centimeters tall). The cap removes
+ * draws and never adds one, so the collision argument above still holds.
+ */
+export function admissibleMultipliers(k: number, maxProduct: number): number[] {
   const out: number[] = [];
   for (let m = 2; m * k <= 99; m++) {
     const b = m * k;
     if (b < 10) continue;
+    if (b * k > maxProduct) continue;
     if ((b % 10) * k >= 10) out.push(m);
   }
   return out;
 }
 
-/** Precomputed once so the filter is not rerun on every generate() call. */
-const MULTIPLIERS: Record<number, number[]> = Object.fromEntries(
-  FACTORS.map((k) => [k, admissibleMultipliers(k)]),
+/** Precomputed once so the filter is not rerun on every generate() call. Per
+ *  context, per factor; every list is non-empty (the smallest length that
+ *  carries for k = 9 is 18, and 18 x 9 = 162 is within every cap). */
+export const MULTIPLIERS: Record<string, Record<number, number[]>> = Object.fromEntries(
+  CONTEXTS.map((c) => [
+    c.thing,
+    Object.fromEntries(FACTORS.map((k) => [k, admissibleMultipliers(k, c.maxProduct)])),
+  ]),
 );
 
 /**
@@ -96,11 +111,12 @@ export const oa1TimesAsMany: QuestionTemplate = {
   difficulty: 'mastery',
   calculatorAllowed: false,
   isStretch: false,
+  contentVersion: 2, // lengths are capped per context, so the numbers changed
 
   generate(rng: Rng): GeneratedQuestion {
     const ctx = rng.pick(CONTEXTS);
     const k = rng.pick(FACTORS);
-    const m = rng.pick(MULTIPLIERS[k]);
+    const m = rng.pick(MULTIPLIERS[ctx.thing][k]);
 
     const b = k * m;
     const t = Math.floor(b / 10);
```


- [ ] **Step 4: Run the tests, the suite, the types, lint and the build**

Run: `npx vitest run src/curriculum/grade4` then `npm run test:run` then `npm run typecheck` then `npm run lint` then `npm run build`
Expected: PASS; lint adds no new warning; the build succeeds.

- [ ] **Step 5: Commit**

```bash
git add src/curriculum/grade4/templates/nf1-equivalent-fraction.test.ts src/curriculum/grade4/templates/oa1-times-as-many.test.ts src/curriculum/grade4/templates/nf1-equivalent-fraction.ts src/curriculum/grade4/templates/oa1-times-as-many.ts
git commit -m "fix: grade 4 generators: plausible lengths per context, no invented shading (content-g4)" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01X5HSDdHPWxvHxgBaoSTbLX"
```

---

## Self-review

**1. Spec coverage.** Every section this plan owns maps to a task below.

| Spec item | Task |
|---|---|
| 3.3 optional `contentVersion` on authored questions (and templates), default 1 | 1 |
| 3.3 attempts record the version of each answered question | 1 (`sessionToAttempt`) |
| 3.3 `masteryByStandard` ignores answers of a different version; old answers count as 1; history still lists them | 1 (`isCurrentAnswer`), 5 (real items) |
| 3.3 saved sessions record the version; a changed question shows "can't continue" | 1 (`stampContentVersions`, `resolveSession`, both runners, `App.begin`) |
| 3.3 any rewrite that changes key, options or math bumps it | 2, 3, 4, 5, 6, 7, 8, 9, 11, 12, 13 (ids listed in each task's Interfaces) |
| 3.1 NC-R2 trapezoid, every grade | 3 (g3), 4 (g4), 5 (g5 + sweep), guides and keyConcepts in each |
| 3.1 NC-R12a/b (Grade 4 denominators, whole numbers to 100,000) | 2 (`g4-nf4-02` fix, sweep) |
| 3.1 NC-R13a/b (Grade 3 denominators, families) | 2 (`g3-nf4-03` fix, sweep) |
| 3.1 NC-R13c (rename the "rounding" domain) | 10 (parentName), 2 (no "round" in any Grade 3 question) |
| 3.1 NC-R14 (Grade 1 sums to 100) | 2 (sweep; already met) |
| 3.2 every Critical/High/Medium finding, grade 1 | 6, 7 |
| 3.2 every Critical/High/Medium finding, grade 2 | 8, 9 |
| 3.2 every Critical/High/Medium finding, grade 3 (the KidPractice display bug and the QuizRunner overflow are Plan A's `PromptDetails`) | 3, 10, 11 |
| 3.2 every Critical/High/Medium finding, grade 4 | 4, 12, 13 |
| 3.2 Low findings that are one-line wording fixes | 6, 7, 8, 10, 12, 13 |
| 3.2 generators constrained at the source | 7, 9, 11, 13 |
| 3.2 check-up and practice-test forms rebalanced where off | 6 (Grade 1 practice test covers all 23 standards); Grade 2, 3 forms were within bands; Grade 4 check-up pinned as one-per-standard by design (12) |
| 5 tests named after findings; each fix has a regression test | every task's `audit.test.ts` or template test |

**2. Placeholder scan.** No step says "TBD", "similar to Task N" or "add tests for the above"; every test and every code change is in the diff or file above it. The fixed-seed pin updates (Tasks 7, 9 and 11) carry their literal values, each produced by running the generator and checked by hand.

**3. Type consistency.** `contentVersionOf`, `versionOf`, `isCurrentAnswer`, `stampContentVersions`, `EVEN_DRAWS`, `ODD_DRAWS`, `count`, `admissibleMultipliers` and `MULTIPLIERS` are each defined once and used with the same signature everywhere.

**4. Review Focus.** Each of the five lines has its test in the owning task (Task 1, 1, 5, 7/9/13, 6/9/12).

## Deferred

Low findings, or findings outside this plan's scope, left on purpose.

- **content-g1:** retag or replace weak distractors in `g1-oa6-02` D, `g1-nbt2-01` D and `g1-md5-*` (needs new tags and is cosmetic); an authored NBT.3 item that uses the symbols `>`, `=`, `<` (a new question, out of scope for "rewrites only"); `md4` compare branch always uses the top two categories and `md2` states its answer in `promptDetails`; accepting "quarter" for "fourth". Medium, moved: extending `assertGradeOneReadable` to `promptDetails` and option text belongs to Plan C (spec 4.2), and clock and graph figures are out of scope (spec section 6).
- **content-g2:** Medium text-only figures for clock, ruler, number line and graph items (drawn figures are out of scope, spec section 6); Low `oa1-change-unknown` never states the end amount in words (its prompt sentence is pinned by the template sentinel), minus-glyph normalisation, weak `=` distractors in the nbt4 template, implausible md5 lengths, label distribution, `g2-g1-04` "rhombus" (the audit itself is unsure NC.2.G.1 names it), diagnostic coarseness copy.
- **content-g3:** Low distractors above 1,000 in `g3-nbt2-02`, three factors in `g3-oa1-03`, weak `g3-oa2` distractor and phrasing, `md7` explanation swap, the `4 and 3/8 inches` trap matching no option, the correct option often the longest sentence, `oa7` distractor above the 10 by 10 table, text-only figures.
- **content-g4:** Medium prose-only figures for MD.4 and MD.3 (out of scope); Low unrealistic sizes in `md1`, `md3-area`, `md3-perimeter`, retagging `g4-oa5-01`, `g4-oa4-01`, `g4-nbt2-01`, the `weightCategory` label wording, and the Grade 4 practice test omitting NC.4.MD.8 and NC.4.G.1.
- **Outside this plan:** the KidPractice display bug and the QuizRunner promptDetails overflow (Plan A's `PromptDetails`, which wraps prose and keeps diagrams unwrapped). Deferred (Low, controller ruling): `path.ts` round-exit windows still count answers to a rewritten item. They use each topic's last 8 answers, so old-version answers roll out within a session or two; `sessionSummary.ts` covers only the current session, whose questions are always current. `isCurrentAnswer` is exported so a later change can adopt it.
