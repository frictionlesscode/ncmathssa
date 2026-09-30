import type { AppStateV2, Profile } from './types';
import type { Grade } from '../curriculum/types';
import type { ActiveSession } from '../engine/activeSession';
import type { ReviewQueue } from '../engine/scheduler';
import type { QuizAttempt } from '../types';
import { reviewKeyId } from '../engine/questionModel';
import { listCurricula } from '../curriculum/registry';
import { createMemoryStorage } from './memoryStorage';

export const STORAGE_KEY_V1 = 'nc_math_ssa_prep_state_v1';
export const STORAGE_KEY_V2 = 'nc_math_ssa_prep_state_v2';
/** A copy of a blob we could not use as-is is kept here before anything overwrites it. */
export const CORRUPT_KEY_PREFIX = 'ncmathssa_corrupt_';

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
    studentName: '',
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
const isString = (v: unknown): v is string => typeof v === 'string';
const isFiniteNumber = (v: unknown): v is number => typeof v === 'number' && Number.isFinite(v);

const SESSION_KINDS: readonly string[] = ['checkup', 'practice', 'round3', 'practice-test', 'drill'];

function nearestSupportedGrade(g: unknown): Grade {
  const grades = listCurricula().map((c) => c.grade);
  if (!isFiniteNumber(g)) return 5;
  return grades.reduce((best, x) => (Math.abs(x - g) < Math.abs(best - g) ? x : best), grades[0]);
}

function normaliseAttempt(v: unknown, fallbackId: string): QuizAttempt | null {
  if (!isRecord(v) || !isRecord(v.answers)) return null;
  const answers: QuizAttempt['answers'] = {};
  for (const [k, a] of Object.entries(v.answers)) {
    if (isRecord(a)) answers[k] = a as unknown as QuizAttempt['answers'][string];
  }
  return {
    ...(v as unknown as QuizAttempt),
    id: isString(v.id) && v.id ? v.id : fallbackId,
    completedAt: isString(v.completedAt) ? v.completedAt : '',
    quizId: isString(v.quizId) ? v.quizId : '',
    quizTitle: isString(v.quizTitle) ? v.quizTitle : '',
    scoreRaw: isFiniteNumber(v.scoreRaw) ? v.scoreRaw : 0,
    scoreTotal: isFiniteNumber(v.scoreTotal) ? v.scoreTotal : 0,
    scorePercent: isFiniteNumber(v.scorePercent) ? v.scorePercent : 0,
    isPassingSSA: v.isPassingSSA === true,
    timeElapsedSeconds: isFiniteNumber(v.timeElapsedSeconds) ? v.timeElapsedSeconds : 0,
    answers,
  };
}

function isRefLike(r: unknown): boolean {
  return isRecord(r) && ((r.kind === 'authored' && isString(r.id)) || (r.kind === 'generated' && isString(r.templateId) && isFiniteNumber(r.seed)));
}

function normaliseSession(v: unknown): ActiveSession | undefined {
  if (!isRecord(v) || !Array.isArray(v.refs) || !isString(v.quizId) || !isString(v.kind) || !SESSION_KINDS.includes(v.kind)) {
    return undefined;
  }
  const answers: ActiveSession['answers'] = {};
  if (isRecord(v.answers)) {
    for (const [k, a] of Object.entries(v.answers)) {
      if (isRecord(a) && isString(a.selected)) answers[k] = { ...(a as unknown as ActiveSession['answers'][string]), isCorrect: a.isCorrect === true };
    }
  }
  const out: ActiveSession = {
    ...(v as unknown as ActiveSession),
    title: isString(v.title) ? v.title : '',
    refs: v.refs.filter(isRefLike) as ActiveSession['refs'],
    answers,
    flagged: isRecord(v.flagged) ? (v.flagged as ActiveSession['flagged']) : {},
    currentIndex: isFiniteNumber(v.currentIndex) ? v.currentIndex : 0,
    startedAt: isString(v.startedAt) ? v.startedAt : '',
    secondsElapsed: isFiniteNumber(v.secondsElapsed) ? v.secondsElapsed : 0,
  };
  if (!isRecord(v.origins)) delete out.origins;
  return out;
}

function normaliseReviewQueue(v: unknown): ReviewQueue {
  if (!isRecord(v)) return {};
  const out: ReviewQueue = {};
  for (const [k, e] of Object.entries(v)) {
    if (isRecord(e) && isRecord(e.key) && isString(e.dueAt) && isString(e.lastSeenAt) && isFiniteNumber(e.box)) {
      out[k] = e as unknown as ReviewQueue[string];
    }
  }
  return out;
}

/** Smallest `base`, `base-2`, `base-3`... not in `taken`; deterministic. */
function uniqueId(base: string, taken: Set<string>): string {
  let id = base;
  for (let n = 2; taken.has(id); n++) id = `${base}-${n}`;
  return id;
}

function normaliseProfile(v: unknown, index: number, seen: Set<string>): Profile | null {
  if (!isRecord(v)) return null;
  // Repaired ids come from position, not randomness, so two tabs that repair
  // the same stored blob agree and a merge does not duplicate the records.
  const id = uniqueId(isString(v.id) && v.id ? v.id : `legacy-profile-${index}`, seen);
  seen.add(id);
  const rawAttempts = Array.isArray(v.attempts) ? v.attempts : [];
  const takenAttemptIds = new Set<string>(
    rawAttempts.flatMap((a) => (isRecord(a) && isString(a.id) && a.id ? [a.id] : [])),
  );
  const out: Profile = {
    ...(v as unknown as Profile),
    id,
    studentName: isString(v.studentName) ? v.studentName : '',
    grade: nearestSupportedGrade(v.grade),
    targetExamDate: isString(v.targetExamDate) ? v.targetExamDate : '',
    dailyQuestionGoal: isFiniteNumber(v.dailyQuestionGoal) ? v.dailyQuestionGoal : 20,
    attempts: rawAttempts.map((a, i) => {
      const fallback = uniqueId(`legacy-${id}-${i}`, takenAttemptIds);
      takenAttemptIds.add(fallback);
      return normaliseAttempt(a, fallback);
    }).filter((a): a is QuizAttempt => a !== null),
    reviewQueue: normaliseReviewQueue(v.reviewQueue),
  };
  const session = normaliseSession(v.activeSession);
  if (session) out.activeSession = session;
  else delete out.activeSession;
  if (typeof out.checkupSkipped !== 'boolean') delete out.checkupSkipped;
  if (!isFiniteNumber(out.sessionSize)) delete out.sessionSize;
  if (!isString(out.activeSessionAt)) delete out.activeSessionAt;
  if (!isString(out.historyClearedAt)) delete out.historyClearedAt;
  return out;
}

export interface NormalisedState {
  state: AppStateV2;
  /** True when anything was defaulted, dropped or re-pointed. */
  repaired: boolean;
}

/**
 * Repairs a stored v2 blob instead of rejecting it: a dangling
 * activeProfileId becomes the first profile, profiles missing id/studentName
 * get defaults, malformed attempts, answers and sessions are dropped, an
 * unsupported grade moves to the nearest supported one, a missing
 * reviewQueue becomes {}. Returns null only when `raw` is not v2 or no
 * usable profile remains. Pure: repaired ids are derived from position, so repeated runs agree.
 */
export function normaliseState(raw: unknown): NormalisedState | null {
  if (!isRecord(raw) || raw.version !== 2 || !Array.isArray(raw.profiles)) return null;
  const seen = new Set<string>();
  const profiles = raw.profiles
    .map((p, i) => normaliseProfile(p, i, seen))
    .filter((p): p is Profile => p !== null);
  if (profiles.length === 0) return null;
  const wanted = raw.activeProfileId;
  const activeProfileId = isString(wanted) && profiles.some((p) => p.id === wanted) ? wanted : profiles[0].id;
  const state: AppStateV2 = { ...(raw as unknown as AppStateV2), version: 2, profiles, activeProfileId };
  if (Array.isArray(raw.deletedProfileIds)) state.deletedProfileIds = raw.deletedProfileIds.filter(isString);
  else delete state.deletedProfileIds;
  return { state, repaired: JSON.stringify(state) !== JSON.stringify(raw) };
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

  const repaired = normaliseState(raw);
  if (repaired) return repaired.state;
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

/** Keeps a copy of a blob we cannot use as-is. Skips it when an identical
 *  copy is already stored, so repeated loads do not pile up backups.
 *  Returns true when a copy of `raw` exists afterwards (including the
 *  already-backed-up case), false when it could not be saved. */
export function backupRaw(storage: Storage, raw: string, now: Date): boolean {
  try {
    for (let i = 0; i < storage.length; i++) {
      const k = storage.key(i);
      if (k && k.startsWith(CORRUPT_KEY_PREFIX) && storage.getItem(k) === raw) return true;
    }
    storage.setItem(`${CORRUPT_KEY_PREFIX}${now.toISOString()}`, raw);
    return true;
  } catch {
    // Nothing more can be done; the original blob is still untouched.
    return false;
  }
}

export interface BrowserStorage {
  storage: Storage;
  /** True when reading the localStorage global itself threw (site data blocked). */
  blocked: boolean;
}

/** localStorage, or an in-memory stand-in when even touching it throws. */
export function getBrowserStorage(access: () => Storage = () => window.localStorage): BrowserStorage {
  try {
    return { storage: access(), blocked: false };
  } catch {
    return { storage: createMemoryStorage(), blocked: true };
  }
}

export function loadState(storage: Storage, opts: MigrateOptions = {}): AppStateV2 {
  const now = opts.now ?? new Date();
  const newId = opts.newId ?? defaultNewId;
  const readRaw = (key: string): string | null => {
    try {
      return storage.getItem(key);
    } catch {
      return null;
    }
  };
  const parse = (s: string | null): unknown => {
    if (!s) return null;
    try {
      return JSON.parse(s);
    } catch {
      return null;
    }
  };

  // A v2 blob is repaired, not rejected. If we repaired it, or could not use
  // it at all, the original text is copied aside before anything overwrites it.
  const rawV2 = readRaw(STORAGE_KEY_V2);
  if (rawV2) {
    const n = normaliseState(parse(rawV2));
    if (n) {
      if (n.repaired) backupRaw(storage, rawV2, now);
      return n.state;
    }
    backupRaw(storage, rawV2, now);
  }

  const v1 = parse(readRaw(STORAGE_KEY_V1));
  if (v1) return migrate(v1, opts);   // v1 key is deliberately left in place

  return initialState(newId);
}

/** The stored v2 state, normalised, or null when absent or unusable. Read-only:
 *  used to merge another tab's writes; it never backs up or writes. */
export function loadStoredState(storage: Storage): AppStateV2 | null {
  try {
    const raw = storage.getItem(STORAGE_KEY_V2);
    return raw ? (normaliseState(JSON.parse(raw))?.state ?? null) : null;
  } catch {
    return null;
  }
}

export function saveState(storage: Storage, state: AppStateV2): { ok: boolean } {
  try {
    storage.setItem(STORAGE_KEY_V2, JSON.stringify(state));
    return { ok: true };
  } catch (e) {
    console.error('Failed to save state', e);
    return { ok: false };
  }
}

export type { AppStateV2, Profile };
