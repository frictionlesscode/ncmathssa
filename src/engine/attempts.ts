import type { GradeCurriculum } from '../curriculum/types';
import { standardsOf } from '../curriculum/registry';
import type { QuizAttempt } from '../types';

/** An attempt belongs to the current grade when any answer assessed one of
 *  its standards. Standard codes never overlap across grades. */
export function currentGradeAttempts(attempts: QuizAttempt[], c: GradeCurriculum): QuizAttempt[] {
  const codes = new Set(standardsOf(c).map((s) => s.code));
  return attempts.filter((a) => Object.values(a.answers).some((ans) => codes.has(ans.standardCode)));
}

/** True when the quiz is a full practice test (the only kind that can claim an SSA pass). */
export function isMockQuiz(curriculum: GradeCurriculum, quizId: string): boolean {
  return Boolean(curriculum.quizzes.find((q) => q.id === quizId)?.isMockAssessment);
}
