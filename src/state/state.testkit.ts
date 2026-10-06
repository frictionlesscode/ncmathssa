import type { QuizAttempt } from '../types';

/** A minimal attempt identified by `id`, completed at `completedAt` (ISO). */
export const att = (id: string, completedAt: string): QuizAttempt => ({
  id, quizId: 'q', quizTitle: 'q', completedAt, scoreRaw: 0, scoreTotal: 0, scorePercent: 0,
  isPassingSSA: false, timeElapsedSeconds: 0, answers: {},
});
