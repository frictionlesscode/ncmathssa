import type { QuestionRef, ReviewKey } from './questionModel';
import { reviewKeyOf, reviewKeyId } from './questionModel';

/** Expanding intervals. A miss returns an item to box 1 regardless of
 *  how far it had been promoted. */
export const BOX_INTERVALS_DAYS = [1, 3, 7, 16, 35] as const;

export interface ReviewEntry {
  key: ReviewKey;
  box: number;        // 1-based
  dueAt: string;      // ISO
  lastSeenAt: string; // ISO
}

export type ReviewQueue = Record<string, ReviewEntry>;

const addDays = (d: Date, n: number) => new Date(d.getTime() + n * 86400000);

export function recordResult(
  queue: ReviewQueue,
  ref: QuestionRef,
  wasCorrect: boolean,
  now: Date,
): ReviewQueue {
  const key = reviewKeyOf(ref);
  const id = reviewKeyId(key);
  const existing = queue[id];
  const next = { ...queue };

  if (!existing) {
    if (wasCorrect) return queue;      // nothing to remember about a hit
    next[id] = {
      key, box: 1,
      dueAt: addDays(now, BOX_INTERVALS_DAYS[0]).toISOString(),
      lastSeenAt: now.toISOString(),
    };
    return next;
  }

  if (!wasCorrect) {
    next[id] = {
      ...existing, box: 1,
      dueAt: addDays(now, BOX_INTERVALS_DAYS[0]).toISOString(),
      lastSeenAt: now.toISOString(),
    };
    return next;
  }

  const promoted = existing.box + 1;
  if (promoted > BOX_INTERVALS_DAYS.length) {
    delete next[id];                    // mastered; stop scheduling it
    return next;
  }
  next[id] = {
    ...existing, box: promoted,
    dueAt: addDays(now, BOX_INTERVALS_DAYS[promoted - 1]).toISOString(),
    lastSeenAt: now.toISOString(),
  };
  return next;
}

export function dueEntries(queue: ReviewQueue, now: Date): ReviewEntry[] {
  return Object.values(queue)
    .filter((e) => new Date(e.dueAt) <= now)
    .sort((a, b) => a.dueAt.localeCompare(b.dueAt));
}
