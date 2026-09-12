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

export type QuestionType = 'multiple-choice' | 'open-response';

export interface Question {
  id: string;
  standardCode: string; // e.g. 'NC.5.NF.1'
  domainId: DomainId;
  questionType: QuestionType;
  prompt: string;
  promptDetails?: string; // Optional context, diagram description, or data table
  options?: string[]; // 4 choices for multiple choice
  correctAnswer: string; // Canonical answer string e.g. 'B' or '3/4' or '48'
  acceptableAnswers?: string[]; // Equivalent representations e.g. ['0.75', '3/4', '75%']
  unit?: string; // e.g. 'inches', 'cubic cm', '$'
  calculatorAllowed: boolean; // false for mental/algorithm math, true for complex word problems
  isStretch: boolean; // Flagged as above-grade / 6th-grade stretch problem
  difficulty: 'mastery' | 'advanced' | 'stretch';
  explanation: {
    stepByStep: string[];
    conceptSummary: string;
    commonMisconception?: string;
  };
}

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
