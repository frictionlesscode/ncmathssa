import { describe, it, expect } from 'vitest';
import { getCurriculum } from '../curriculum/registry';
import type { GradeCurriculum, StandardCode } from '../curriculum/types';
import type { QuizAttempt, QuizAttemptAnswer } from '../types';
import {
  buildPath, daysUntil, isShortOnTime, sampleSizeFor,
  ROUND_SAMPLE, ROUND3_QUIZ_PREFIX, PRACTICE_QUIZ_PREFIX, roundRank,
} from './path';
import { c5, codeOf, domainIds, needFor } from './path.testkit';

const NOW = new Date(2026, 8, 30, 12); // 30 Sep 2026, local noon

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

describe('roundRank', () => {
  it('orders rounds 1-3 before the practice test', () => {
    expect([roundRank(1), roundRank(2), roundRank(3), roundRank('test')]).toEqual([1, 2, 3, 4]);
  });
});


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
