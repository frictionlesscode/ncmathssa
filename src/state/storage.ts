import type { AppStateV2, Profile } from './types';
import type { ReviewQueue } from '../engine/scheduler';
import { reviewKeyId } from '../engine/questionModel';

export const STORAGE_KEY_V1 = 'nc_math_ssa_prep_state_v1';
export const STORAGE_KEY_V2 = 'nc_math_ssa_prep_state_v2';

export function newProfile(overrides: Partial<Profile> = {}): Profile {
  return {
    id: `p_${Math.random().toString(36).slice(2, 10)}`,
    studentName: 'Student',
    grade: 5,
    targetExamDate: '',
    dailyQuestionGoal: 20,
    attempts: [],
    reviewQueue: {},
    ...overrides,
  };
}

export function initialState(): AppStateV2 {
  const p = newProfile();
  return { version: 2, profiles: [p], activeProfileId: p.id };
}

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v);
}

/**
 * v1 -> v2. The old loader caught parse errors and silently discarded the
 * payload; under the new schema that would destroy a student's history, so
 * migration is explicit and every branch is tested.
 */
export function migrate(raw: unknown): AppStateV2 {
  if (isRecord(raw) && raw.version === 2 && Array.isArray(raw.profiles)) {
    return raw as unknown as AppStateV2;
  }
  if (!isRecord(raw)) return initialState();

  const settings = isRecord(raw.settings) ? raw.settings : {};
  const attempts = Array.isArray(raw.attempts) ? raw.attempts : [];
  const missed = Array.isArray(raw.missedQuestionIds) ? raw.missedQuestionIds : [];
  if (attempts.length === 0 && missed.length === 0 && !settings.studentName) {
    return initialState();
  }

  // Missed questions become box-1 review entries due immediately, so the
  // error bank the student built up survives the schema change. The key
  // format is owned by reviewKeyId, not duplicated here (Ruling F3).
  const nowIso = new Date().toISOString();
  const reviewQueue: ReviewQueue = {};
  for (const id of missed) {
    if (typeof id !== 'string') continue;
    const key = { kind: 'authored' as const, id };
    reviewQueue[reviewKeyId(key)] = { key, box: 1, dueAt: nowIso, lastSeenAt: nowIso };
  }

  const profile = newProfile({
    studentName: typeof settings.studentName === 'string' && settings.studentName
      ? settings.studentName : 'Student',
    grade: 5,
    targetExamDate: typeof settings.targetExamDate === 'string' ? settings.targetExamDate : '',
    dailyQuestionGoal: typeof settings.dailyQuestionGoal === 'number'
      ? settings.dailyQuestionGoal : 20,
    attempts: attempts as Profile['attempts'],
    reviewQueue,
  });

  return { version: 2, profiles: [profile], activeProfileId: profile.id };
}

export function loadState(storage: Storage): AppStateV2 {
  const readJson = (key: string): unknown => {
    try {
      const s = storage.getItem(key);
      return s ? JSON.parse(s) : null;
    } catch {
      return null;
    }
  };

  const v2 = readJson(STORAGE_KEY_V2);
  if (v2) return migrate(v2);

  const v1 = readJson(STORAGE_KEY_V1);
  if (v1) return migrate(v1);   // v1 key is deliberately left in place

  return initialState();
}

export function saveState(storage: Storage, state: AppStateV2): void {
  try {
    storage.setItem(STORAGE_KEY_V2, JSON.stringify(state));
  } catch (e) {
    console.error('Failed to save state', e);
  }
}

export type { AppStateV2, Profile };
