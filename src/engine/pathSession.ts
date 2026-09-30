import type { DomainId, GradeCurriculum, StandardCode } from '../curriculum/types';
import type { StandardMastery } from './mastery';
import type { ReviewQueue } from './scheduler';
import { selectSession, type SessionPlan } from './sessionComposer';
import { PRACTICE_QUIZ_PREFIX, ROUND3_QUIZ_PREFIX, type NextStep } from './path';
import { newSession, sessionFromQuiz, type ActiveSession } from './activeSession';

/** Builds the saved session for the path's next step (spec 5). */
export function sessionForStep(input: {
  step: NextStep;
  curriculum: GradeCurriculum;
  mastery: Map<StandardCode, StandardMastery>;
  queue: ReviewQueue;
  activeDomains: DomainId[];
  size: number;
  now: Date;
  seed: number;
}): ActiveSession | null {
  const { step, curriculum: c, mastery, queue, activeDomains, size, now, seed } = input;

  if (step.kind === 'checkup' || step.kind === 'practice-test') {
    const quiz = c.quizzes.find((q) => q.id === step.quizId);
    if (!quiz) return null;
    const s = sessionFromQuiz(quiz, step.kind, now);
    return { ...s, title: step.kind === 'checkup' ? 'Check-up' : 'Practice test' };
  }

  const plan: SessionPlan =
    step.kind === 'round3'
      ? { domains: new Set(activeDomains), prefer: ['stretch', 'advanced'] }
      : { domains: new Set(activeDomains), prefer: step.round === 1 ? ['mastery'] : undefined };
  const refs = selectSession({ curriculum: c, mastery, queue, size, now, seed, plan });
  if (refs.length === 0) return null;

  return step.kind === 'round3'
    ? newSession({ kind: 'round3', quizId: `${ROUND3_QUIZ_PREFIX}${now.getTime()}`, title: 'Test-ready practice', refs, now })
    : newSession({ kind: 'practice', quizId: `${PRACTICE_QUIZ_PREFIX}${now.getTime()}`, title: `Round ${step.round} practice`, refs, now });
}
