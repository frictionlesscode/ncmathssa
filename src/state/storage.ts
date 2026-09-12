import type { AppStateV2, Profile } from './types';
import type { ReviewQueue } from '../engine/scheduler';
import { reviewKeyId } from '../engine/questionModel';

export const STORAGE_KEY_V1 = 'nc_math_ssa_prep_state_v1';
export const STORAGE_KEY_V2 = 'nc_math_ssa_prep_state_v2';

/** Injectable so migrate() stays a pure, testable function: callers that
 *  care about determinism (tests) pass fixed values; production code gets
 *  the real clock and a random id, unchanged from before. */
export interface MigrateOptions {
  now?: Date;
  newId?: () => string;
}

const defaultNewId = () => `p_${Math.random().toString(36).slice(2, 10)}`;

export function newProfile(overrides: Partial<Profile> = {}): Profile {
  return {
    id: defaultNewId(),
    studentName: 'Student',
    grade: 5,
    targetExamDate: '',
    dailyQuestionGoal: 20,
    attempts: [],
    reviewQueue: {},
    ...overrides,
  };
}

export function initialState(newId: () => string = defaultNewId): AppStateV2 {
  const p = newProfile({ id: newId() });
  return { version: 2, profiles: [p], activeProfileId: p.id };
}

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v);
}

/** A v2 blob only counts as recognized if it is actually usable: at least
 *  one profile, each with a string id, and an activeProfileId that
 *  resolves to one of them. Anything less (e.g. `{version:2, profiles:[]}`)
 *  is treated as unrecognized so callers can fall back to v1 instead of
 *  handing consumers a state whose active profile lookup silently fails. */
function isPopulatedV2(raw: unknown): raw is AppStateV2 {
  if (!isRecord(raw) || raw.version !== 2) return false;
  const profiles = raw.profiles;
  if (!Array.isArray(profiles) || profiles.length === 0) return false;
  if (!profiles.every((p) => isRecord(p) && typeof p.id === 'string')) return false;
  if (typeof raw.activeProfileId !== 'string') return false;
  return profiles.some((p) => (p as { id: string }).id === raw.activeProfileId);
}

/**
 * v1 -> v2. The old loader caught parse errors and silently discarded the
 * payload; under the new schema that would destroy a student's history, so
 * migration is explicit and every branch is tested.
 *
 * Pure: no direct clock or RNG reads. `now`/`newId` default to the real
 * clock and a random id generator, but tests can inject fixed values.
 */
export function migrate(raw: unknown, opts: MigrateOptions = {}): AppStateV2 {
  const newId = opts.newId ?? defaultNewId;

  if (isPopulatedV2(raw)) {
    return raw;
  }
  if (!isRecord(raw)) return initialState(newId);

  const settings = isRecord(raw.settings) ? raw.settings : {};
  const attempts = Array.isArray(raw.attempts) ? raw.attempts : [];
  const missed = Array.isArray(raw.missedQuestionIds) ? raw.missedQuestionIds : [];
  if (attempts.length === 0 && missed.length === 0 && !settings.studentName) {
    return initialState(newId);
  }

  // Missed questions become box-1 review entries due immediately, so the
  // error bank the student built up survives the schema change. The key
  // format is owned by reviewKeyId, not duplicated here (Ruling F3).
  const nowIso = (opts.now ?? new Date()).toISOString();
  const reviewQueue: ReviewQueue = {};
  for (const id of missed) {
    if (typeof id !== 'string') continue;
    const key = { kind: 'authored' as const, id };
    reviewQueue[reviewKeyId(key)] = { key, box: 1, dueAt: nowIso, lastSeenAt: nowIso };
  }

  const profile = newProfile({
    id: newId(),
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

export function loadState(storage: Storage, opts: MigrateOptions = {}): AppStateV2 {
  const readJson = (key: string): unknown => {
    try {
      const s = storage.getItem(key);
      return s ? JSON.parse(s) : null;
    } catch {
      return null;
    }
  };

  // Only a recognized, populated v2 blob short-circuits the fall-through to
  // v1. A corrupt or unrecognized v2 value must not shadow an intact v1
  // payload sitting one key over -- the child's history would otherwise be
  // invisible to the app even though it is still on disk.
  const v2 = readJson(STORAGE_KEY_V2);
  if (isPopulatedV2(v2)) return migrate(v2, opts);

  const v1 = readJson(STORAGE_KEY_V1);
  if (v1) return migrate(v1, opts);   // v1 key is deliberately left in place

  return initialState(opts.newId ?? defaultNewId);
}

export function saveState(storage: Storage, state: AppStateV2): void {
  try {
    storage.setItem(STORAGE_KEY_V2, JSON.stringify(state));
  } catch (e) {
    console.error('Failed to save state', e);
  }
}

export type { AppStateV2, Profile };
