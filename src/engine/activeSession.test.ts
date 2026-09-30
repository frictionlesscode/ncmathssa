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

  it('keeps every hostile value inside 5-30', () => {
    expect(sessionSizeOf({ sessionSize: undefined })).toBe(DEFAULT_SESSION_SIZE);
    expect(sessionSizeOf({ sessionSize: '' })).toBe(DEFAULT_SESSION_SIZE);
    expect(sessionSizeOf({ sessionSize: NaN })).toBe(DEFAULT_SESSION_SIZE);
    expect(sessionSizeOf({ sessionSize: null })).toBe(DEFAULT_SESSION_SIZE);
    expect(sessionSizeOf({ sessionSize: {} })).toBe(DEFAULT_SESSION_SIZE);
    expect(sessionSizeOf({ sessionSize: '20' })).toBe(DEFAULT_SESSION_SIZE);
    expect(sessionSizeOf({ sessionSize: Infinity })).toBe(DEFAULT_SESSION_SIZE);
    expect(sessionSizeOf({ sessionSize: -10 })).toBe(5);
    expect(sessionSizeOf({ sessionSize: 5 })).toBe(5);
    expect(sessionSizeOf({ sessionSize: 30 })).toBe(30);
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
