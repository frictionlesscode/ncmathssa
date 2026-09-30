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
    expect(test.title).toBe('Practice test');
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
    const s = sessionForStep({
      ...common,
      size: 30,
      activeDomains: c.domains.map((d) => d.id),
      step: { kind: 'round3' },
    })!;
    expect(s.kind).toBe('round3');
    expect(s.title).toBe('Test-ready practice');
    expect(s.quizId.startsWith(ROUND3_QUIZ_PREFIX)).toBe(true);
    let answered = s;
    const qs = resolveSession(s, c);
    for (const q of qs) answered = recordAnswer(answered, q, correctOption(q).label);
    const attempt = sessionToAttempt(answered, qs, 80, NOW, { answeredOnly: false });
    const pathOf = (a: typeof attempt) =>
      buildPath({ curriculum: c, attempts: [a], checkupSkipped: true, testDate: '', now: NOW });
    const doneWith = pathOf(attempt).topics.filter((t) => t.round === 'done').map((t) => t.domainId);
    // The same answers under a non-Round-3 quiz id must not finish any topic.
    const doneWithout = pathOf({ ...attempt, quizId: 'other' }).topics.filter((t) => t.round === 'done');
    expect(doneWith.length).toBeGreaterThan(0);
    expect(doneWithout).toHaveLength(0);
  });

  it('returns null for an unknown quiz id', () => {
    expect(sessionForStep({ ...common, activeDomains: [], step: { kind: 'checkup', quizId: 'nope' } })).toBeNull();
  });
});
