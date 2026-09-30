import type { QuizAttempt } from '../types';
import { daysUntil, DAY_MS, ROUND_SAMPLE, type PathState } from './path';

/** Within this many percentage points of where the calendar says the child
 *  should be counts as "On track" (spec 4.1). */
export const ON_TRACK_BAND = 10;
/** Share of a composed session that is new content rather than review
 *  (1 - MAX_REVIEW_FRACTION), for the sessions-left estimate. */
export const NEW_QUESTION_SHARE = 0.6;

export type DateState = 'none' | 'passed' | 'short' | 'normal';
export type PaceStatus = 'on-track' | 'behind' | 'ahead';

export interface Pace {
  dateState: DateState;
  daysLeft: number | null;
  status?: PaceStatus;
  sessionsPerWeek?: number;
}

export function computePace(input: {
  path: PathState;
  attempts: QuizAttempt[];
  testDate: string;
  now: Date;
  sessionSize: number;
}): Pace {
  const { path, attempts, testDate, now, sessionSize } = input;
  const daysLeft = daysUntil(testDate, now);
  if (daysLeft === null) return { dateState: 'none', daysLeft: null };
  if (daysLeft < 0) return { dateState: 'passed', daysLeft };
  const dateState: DateState = path.shortOnTime ? 'short' : 'normal';

  const remainingRounds = Math.max(0, path.roundsTotal - path.roundsFinished);
  const newPerSession = Math.max(1, Math.round(sessionSize * NEW_QUESTION_SHARE));
  const sessionsLeft =
    Math.ceil((remainingRounds * ROUND_SAMPLE) / newPerSession) + (path.practiceTestPassedAt ? 0 : 1);
  const weeks = Math.max(1, daysLeft / 7);
  const sessionsPerWeek = Math.min(7, Math.max(1, Math.ceil(sessionsLeft / weeks)));

  const progress = path.roundsTotal === 0 ? 100 : (path.roundsFinished / path.roundsTotal) * 100;
  const first = attempts.reduce<string | null>(
    (min, a) => (min === null || a.completedAt < min ? a.completedAt : min),
    null,
  );
  let status: PaceStatus = 'on-track';
  if (first) {
    const start = new Date(first).getTime();
    const end = now.getTime() + daysLeft * DAY_MS;
    const elapsed = end > start ? ((now.getTime() - start) / (end - start)) * 100 : 100;
    const diff = progress - Math.min(100, Math.max(0, elapsed));
    status = diff > ON_TRACK_BAND ? 'ahead' : diff < -ON_TRACK_BAND ? 'behind' : 'on-track';
  }
  // With no real history yet there is nothing to be ahead of (F1).
  if (attempts.length < 2 && status === 'ahead') status = 'on-track';
  return { dateState, daysLeft, status, sessionsPerWeek };
}
