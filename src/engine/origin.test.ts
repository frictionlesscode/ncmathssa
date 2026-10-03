import { describe, it, expect } from 'vitest';
import type { StandardCode } from '../curriculum/types';
import type { QuizAttempt, QuizAttemptAnswer, AnswerOrigin } from '../types';
import { masteryByStandard } from './mastery';
import { recordResult } from './scheduler';
import { composeSession, selectSession } from './sessionComposer';
import { sessionForStep } from './pathSession';
import { createAdaptiveSessionDrill } from './drills';
import { newSession, sessionFromQuiz, recordAnswer, resolveSession, sessionToAttempt, stampContentVersions } from './activeSession';
import { buildPath, PRACTICE_QUIZ_PREFIX, ROUND3_QUIZ_PREFIX } from './path';
import { correctOption } from './questionModel';
import { normaliseState, newProfile } from '../state/storage';
import { c5, codeOf, domainIds, needFor } from './path.testkit';

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
    let s = stampContentVersions(newSession({ kind: 'practice', quizId: 'x', title: 'x', refs, now: NOW, origins: { [refs[0].id]: 'review' } }), c5);
    const [q1, q2] = resolveSession(s, c5);
    s = recordAnswer(recordAnswer(s, q1, correctOption(q1).label), q2, correctOption(q2).label);
    const a = sessionToAttempt(s, [q1, q2], 80, NOW, { answeredOnly: true });
    expect(a.answers[q1.id].origin).toBe('review');
    expect(a.answers[q2.id].origin).toBeUndefined();
  });
});

describe('adaptive practice origins', () => {
  it('F8: a due review in an adaptive session is saved with origin review, new answers with none', () => {
    const queue = recordResult({}, { kind: 'authored', id: 'nf1-01' }, false, new Date(2026, 8, 1));
    const composed = composeSession({ curriculum: c5, mastery: masteryByStandard([], c5), queue, size: 10, now: NOW, seed: 1 });
    const drill = createAdaptiveSessionDrill(composed);
    let s = stampContentVersions(sessionFromQuiz(drill, 'drill', NOW), c5);
    const qs = resolveSession(s, c5);
    for (const q of qs) s = recordAnswer(s, q, correctOption(q).label);
    const a = sessionToAttempt(s, qs, 80, NOW, { answeredOnly: false });
    expect(a.answers['nf1-01'].origin).toBe('review');
    const others = Object.values(a.answers).filter((x) => x.questionId !== 'nf1-01');
    expect(others.length).toBeGreaterThan(0);
    expect(others.every((x) => x.origin === undefined)).toBe(true);
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

  it('F8: wrong due-review answers in Round 3 do not un-finish a topic', () => {
    const d = domainIds[0];
    const done = finishedTopics();
    const bad = attempt(`${ROUND3_QUIZ_PREFIX}2`, rows(d, needFor(d), false, 'review')); // made after, so it is the latest
    const p = buildPath({ ...base, attempts: [...done, bad] });
    expect(p.topics.find((t) => t.domainId === d)!.round).toBe('done');
    expect(p.currentRound).toBe('test');
  });

  it('F8: the same misses WITHOUT the flag (saved before this change) count as new answers, as before', () => {
    const d = domainIds[0];
    const done = finishedTopics();
    const legacy = attempt(`${ROUND3_QUIZ_PREFIX}2`, rows(d, needFor(d), false));
    const p = buildPath({ ...base, attempts: [...done, legacy] });
    expect(p.topics.find((t) => t.domainId === d)!.round).not.toBe('done');
  });

  it('F8: wrong due-review answers do not block finishing Round 2', () => {
    const d = domainIds[0];
    const practice = attempt(`${PRACTICE_QUIZ_PREFIX}1`, [...rows(d, needFor(d), true), ...rows(d, needFor(d), false, 'review')]);
    const p = buildPath({ ...base, attempts: [practice] });
    expect(p.topics.find((t) => t.domainId === d)!.round).toBe(3);
  });
});
