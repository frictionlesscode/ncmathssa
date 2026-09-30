import type { GradeCurriculum } from '../curriculum/types';

/** True when the quiz is a full practice test (the only kind that can claim an SSA pass). */
export function isMockQuiz(curriculum: GradeCurriculum, quizId: string): boolean {
  return Boolean(curriculum.quizzes.find((q) => q.id === quizId)?.isMockAssessment);
}
