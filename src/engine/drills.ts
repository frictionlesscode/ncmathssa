import type { GradeCurriculum } from '../curriculum/types';
import { standardsOf } from '../curriculum/registry';
import type { QuizDefinition } from '../types';
import { questionRefId, type QuestionRef } from './questionModel';

/**
 * Creates a dynamic custom drill for a single standard, drawing every
 * authored question for that standard from the active curriculum's
 * question source rather than a specific grade's authored bank.
 */
export function createStandardDrill(standardCode: string, curriculum: GradeCurriculum): QuizDefinition {
  const refs = curriculum.source.authoredFor(standardCode);
  const standardInfo = standardsOf(curriculum).find(s => s.code === standardCode);
  return {
    id: `drill-${standardCode}`,
    title: `Targeted Practice: ${standardCode}`,
    subtitle: `Focused mastery drill on standard ${standardCode}`,
    standardCode,
    domainId: standardInfo?.domainId,
    isCustomDrill: true,
    questionIds: refs.map(r => (r as { kind: 'authored'; id: string }).id)
  };
}

/**
 * Creates a dynamic quiz containing all current missed questions.
 */
export function createMissedQuestionsDrill(missedIds: string[]): QuizDefinition {
  return {
    id: `drill-weakspots-${Date.now()}`,
    title: 'Weak Spots & Missed Questions Drill',
    subtitle: `Re-testing ${missedIds.length} question(s) previously answered incorrectly.`,
    isCustomDrill: true,
    questionIds: missedIds
  };
}

/**
 * Wraps the refs `selectSession` (Task 11) produces as a `QuizDefinition`
 * so the existing `QuizRunner`/`QuizAttempt` machinery can run an adaptive
 * practice session without any special-casing: every ref, authored or
 * generated, round-trips through `questionRefId`/`parseQuestionRef`.
 */
export function createAdaptiveSessionDrill(refs: QuestionRef[]): QuizDefinition {
  return {
    id: `adaptive-session-${Date.now()}`,
    title: 'Adaptive Practice Session',
    subtitle: `A ${refs.length}-question set built from your due reviews and current weak spots.`,
    isCustomDrill: true,
    questionIds: refs.map(questionRefId)
  };
}
