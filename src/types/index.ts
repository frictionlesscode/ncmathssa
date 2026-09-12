// Types shared across the UI. The curriculum shape itself (DomainId,
// StandardInfo, DomainInfo) and the question/mastery models now live in
// src/curriculum and src/engine — they are re-exported here so existing
// imports of '../types' keep working (Ruling F12).

export type { DomainId, StandardCode, StandardInfo, DomainInfo } from '../curriculum/types';
export type { Question, AnswerOption, Explanation } from '../engine/questionModel';
export type { StandardMastery } from '../engine/mastery';

import type { DomainId } from '../curriculum/types';

export interface QuizDefinition {
  id: string;
  title: string;
  subtitle: string;
  domainId?: DomainId; // Undefined if comprehensive / multi-domain
  standardCode?: string; // If standard-specific drill
  isDiagnostic?: boolean;
  isMockAssessment?: boolean;
  isCustomDrill?: boolean;
  timeLimitMinutes?: number;
  questionIds: string[];
}

export interface QuizAttemptAnswer {
  questionId: string;
  studentAnswer: string;
  isCorrect: boolean;
  standardCode: string;          // which standard this item assessed
  misconception?: string;        // tag of the distractor chosen, when wrong
  timeSpentSeconds?: number;
  flaggedForReview?: boolean;
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
