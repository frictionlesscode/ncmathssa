import type { Grade } from '../curriculum/types';
import type { ActiveSession } from '../engine/activeSession';
import type { ReviewQueue } from '../engine/scheduler';
import type { QuizAttempt } from '../types';

export interface Profile {
  id: string;
  studentName: string;
  grade: Grade;
  targetExamDate: string;
  dailyQuestionGoal: number;
  attempts: QuizAttempt[];
  reviewQueue: ReviewQueue;
  /** In-progress session, saved after every answer (spec 7). */
  activeSession?: ActiveSession;
  /** The parent chose "Skip and start practicing" instead of the check-up. */
  checkupSkipped?: boolean;
  /** Questions per path session; read through sessionSizeOf(). */
  sessionSize?: number;
  /** When activeSession was last written or cleared. The multi-tab merge keeps the later one. */
  activeSessionAt?: string;
  /** Attempts completed at or before this instant were cleared by the parent; the multi-tab merge never resurrects them. */
  historyClearedAt?: string;
}

export interface AppStateV2 {
  version: 2;
  profiles: Profile[];
  activeProfileId: string;
  /** Students deleted in some tab; the multi-tab merge never resurrects them. */
  deletedProfileIds?: string[];
}
