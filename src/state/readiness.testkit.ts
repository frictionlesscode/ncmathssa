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
