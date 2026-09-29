import type { Grade } from '../curriculum/types';
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
}

export interface AppStateV2 {
  version: 2;
  profiles: Profile[];
  activeProfileId: string;
}
