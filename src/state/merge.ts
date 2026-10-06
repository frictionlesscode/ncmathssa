import type { AppStateV2, Profile } from './types';
import type { QuizAttempt } from '../types';

export interface MergeOptions {
  /** Who wins the ACTIVE profile's scalar fields. On save this tab wins
   *  ('mine'); after a storage event the other tab's newer write wins ('stored'). */
  activeScalars: 'mine' | 'stored';
}

type Winner = 'mine' | 'stored';

function maxIso(a?: string, b?: string): string | undefined {
  if (!a) return b;
  if (!b) return a;
  return a > b ? a : b;
}

function unionAttempts(mine: QuizAttempt[], stored: QuizAttempt[], clearedAt?: string): QuizAttempt[] {
  const mineIds = new Set(mine.map((a) => a.id));
  const extra = stored.filter((a) => !mineIds.has(a.id));
  const keep = (a: QuizAttempt) => !clearedAt || a.completedAt > clearedAt;
  // Nothing new from the other side: keep this tab's order exactly.
  if (extra.length === 0) return mine.filter(keep);
  return [...mine, ...extra].filter(keep).sort((x, y) => y.completedAt.localeCompare(x.completedAt));
}

function mergeProfile(stored: Profile, mine: Profile, winner: Winner): Profile {
  const base = winner === 'mine' ? mine : stored;
  const clearedAt = maxIso(stored.historyClearedAt, mine.historyClearedAt);
  const merged: Profile = {
    ...base,
    attempts: unionAttempts(mine.attempts, stored.attempts, clearedAt),
  };
  if (clearedAt) merged.historyClearedAt = clearedAt;

  // The other tab cleared history more recently than the winner knows about:
  // its (empty) review queue and checkup flag are the newer truth, so a stale
  // winner cannot bring them back.
  const other = winner === 'mine' ? stored : mine;
  if ((other.historyClearedAt ?? '') > (base.historyClearedAt ?? '')) {
    merged.reviewQueue = other.reviewQueue;
    if (other.checkupSkipped !== undefined) merged.checkupSkipped = other.checkupSkipped;
    else delete merged.checkupSkipped;
  }

  const mineAt = mine.activeSessionAt ?? '';
  const storedAt = stored.activeSessionAt ?? '';
  const sessionFrom: Winner = mineAt > storedAt ? 'mine' : storedAt > mineAt ? 'stored' : winner;
  const source = sessionFrom === 'mine' ? mine : stored;
  if (source.activeSession) merged.activeSession = source.activeSession;
  else delete merged.activeSession;
  if (source.activeSessionAt) merged.activeSessionAt = source.activeSessionAt;
  else delete merged.activeSessionAt;
  return merged;
}

/**
 * Merges what is stored (possibly written by another tab) into this tab's
 * in-memory state. Pure. Attempts are the record of truth and are unioned;
 * deletions are tombstoned (`deletedProfileIds`, `historyClearedAt`) so a
 * stale tab cannot bring erased data back. The review queue follows the
 * scalar winner rather than being merged key by key: an entry removed on
 * mastery cannot be told apart from one added elsewhere without a base copy.
 * The exception is a history clear the winner does not know about: then the
 * clearing side's review queue and checkup flag win, so a stale tab cannot
 * resurrect them.
 */
export function mergeStates(
  stored: AppStateV2,
  mine: AppStateV2,
  opts: MergeOptions = { activeScalars: 'mine' },
): AppStateV2 {
  const deleted = [...new Set([...(stored.deletedProfileIds ?? []), ...(mine.deletedProfileIds ?? [])])];
  const gone = new Set(deleted);
  const storedById = new Map(stored.profiles.map((p) => [p.id, p]));
  const mineIds = new Set(mine.profiles.map((p) => p.id));

  const profiles: Profile[] = [];
  for (const p of mine.profiles) {
    if (gone.has(p.id)) continue;
    const s = storedById.get(p.id);
    profiles.push(s ? mergeProfile(s, p, p.id === mine.activeProfileId ? opts.activeScalars : 'stored') : p);
  }
  for (const s of stored.profiles) {
    if (!gone.has(s.id) && !mineIds.has(s.id)) profiles.push(s);
  }
  if (profiles.length === 0) return mine;

  const out: AppStateV2 = {
    ...mine,
    profiles,
    activeProfileId: profiles.some((p) => p.id === mine.activeProfileId) ? mine.activeProfileId : profiles[0].id,
  };
  if (deleted.length > 0) out.deletedProfileIds = deleted;
  else delete out.deletedProfileIds;
  return out;
}
