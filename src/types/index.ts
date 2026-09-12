// NCSCOS Grade 5 Mathematics & WCPSS SSA Types

export type DomainId = 'OA' | 'NBT' | 'NF' | 'MD' | 'G';

export interface StandardInfo {
  code: string; // e.g. 'NC.5.NF.1'
  domainId: DomainId;
  title: string;
  description: string;
  weightCategory: string; // e.g. '39-43% of EOG Blueprint'
  keyConcepts: string[];
}

export interface DomainInfo {
  id: DomainId;
  name: string;
  shortName: string;
  officialWeightRange: string;
  officialWeightMidpoint: number;
  description: string;
  color: string;
  badgeBg: string;
  standards: StandardInfo[];
}

/** The question model lives in src/engine/questionModel.ts. Every item is
 *  multiple choice, so there is no `questionType` discriminator any more. */
export type { Question, AnswerOption, Explanation } from '../engine/questionModel';

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
  isPassingSSA: boolean; // >= 80%
  timeElapsedSeconds: number;
  answers: Record<string, QuizAttemptAnswer>;
}

export interface StandardMastery {
  standardCode: string;
  totalAttempts: number;
  correctAttempts: number;
  masteryPercent: number;
  status: 'acceleration-ready' | 'approaching' | 'needs-focus' | 'untested';
  lastTestedAt?: string;
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

export interface UserSettings {
  studentName: string;
  currentGrade: number; // 4
  targetGrade: number; // 5 -> into 6
  targetExamDate: string; // e.g. '2026-05-15'
  weeklyStudyGoalHours: number;
  dailyQuestionGoal: number;
}

export interface AppState {
  settings: UserSettings;
  attempts: QuizAttempt[];
  missedQuestionIds: string[];
  activeQuizAttempt: QuizAttempt | null;
}
