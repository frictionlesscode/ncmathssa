// Types shared across the UI. The curriculum shape itself (DomainId,
// StandardInfo, DomainInfo) and the question/mastery models now live in
// src/curriculum and src/engine — they are re-exported here so existing
// imports of '../types' keep working (Ruling F12).

export type { DomainId, StandardCode, StandardInfo, DomainInfo } from '../curriculum/types';
export type { Question, AnswerOption, Explanation } from '../engine/questionModel';
export type { StandardMastery } from '../engine/mastery';

import type { DomainId, GradeCurriculum } from '../curriculum/types';

export interface StudyGuideSection {
  standardCode: string;
  title: string;
  coreConcept: string;
  rulesAndFormulas: { label: string; detail: string }[];
  stepByStepMethod: string[];
  commonTraps: string[];
  workedExample: {
    problem: string;
    steps: string[];
    answer: string;
    whyItMattersForSSA: string;
  };
}

export interface QuizDefinition {
  id: string;
  title: string;
  /** A plain string, or a function of the active curriculum for the rare
   *  subtitle that needs to cite a standard count or the passing cutoff -
   *  those must never be baked in as grade-5 literals (Ruling F11). */
  subtitle: string | ((curriculum: GradeCurriculum) => string);
  domainId?: DomainId; // Undefined if comprehensive / multi-domain
  standardCode?: string; // If standard-specific drill
  isDiagnostic?: boolean;
  isMockAssessment?: boolean;
  isCustomDrill?: boolean;
  timeLimitMinutes?: number;
  questionIds: string[];
  /** Question id -> 'review' for questions that came from the due-review queue (adaptive practice). */
  origins?: Record<string, AnswerOrigin>;
}

/** Where a question came from in its session: fresh content or a due review. Missing means 'new'. */
export type AnswerOrigin = 'new' | 'review';

export interface QuizAttemptAnswer {
  questionId: string;
  studentAnswer: string;
  isCorrect: boolean;
  standardCode: string;          // which standard this item assessed
  misconception?: string;        // tag of the distractor chosen, when wrong
  timeSpentSeconds?: number;
  flaggedForReview?: boolean;
  origin?: AnswerOrigin;         // absent means 'new'; only 'review' is written
}

export interface QuizAttempt {
  id: string;
  quizId: string;
  quizTitle: string;
  domainId?: DomainId;
  standardCode?: string;
  completedAt: string; // ISO string
  scoreRaw: number;
  scoreTotal: number;
  scorePercent: number;
  isPassingSSA: boolean; // >= curriculum.ssa.passingPercent
  timeElapsedSeconds: number;
  answers: Record<string, QuizAttemptAnswer>;
}

export interface DomainMastery {
  domainId: string;
  masteryPercent: number;
  totalQuestionsAnswered: number;
  totalCorrect: number;
  status: 'acceleration-ready' | 'approaching' | 'needs-focus' | 'untested';
  standardsCount: number;
  standardsMastered: number;
}
