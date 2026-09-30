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
