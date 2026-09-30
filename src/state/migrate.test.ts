import { describe, it, expect, vi } from 'vitest';
import { migrate, newProfile, initialState, loadState, saveState, STORAGE_KEY_V1, STORAGE_KEY_V2 } from './storage';
import { reviewKeyId } from '../engine/questionModel';
import type { AppStateV2 } from './types';
import v1Real from './__fixtures__/v1-real.json';

const FIXED_NOW = new Date('2026-01-01T00:00:00.000Z');
let idCounter = 0;
const fixedNewId = () => `fixed-${idCounter++}`;

describe('migrate', () => {
  it('carries a real v1 payload into one profile without losing attempts', () => {
    const out = migrate(v1Real);
    expect(out.version).toBe(2);
    expect(out.profiles).toHaveLength(1);
    expect(out.profiles[0].attempts).toHaveLength((v1Real as { attempts: unknown[] }).attempts.length);
    expect(out.activeProfileId).toBe(out.profiles[0].id);
  });

  it('keeps the student name from v1 settings', () => {
    const out = migrate({ settings: { studentName: 'Sam', currentGrade: 4 }, attempts: [], missedQuestionIds: [] });
    expect(out.profiles[0].studentName).toBe('Sam');
  });

  it('defaults the migrated profile to grade 5', () => {
    expect(migrate(v1Real).profiles[0].grade).toBe(5);
  });

  it('seeds the review queue from v1 missed questions so history is not lost', () => {
    const out = migrate({
      settings: { studentName: 'A' }, attempts: [],
      missedQuestionIds: ['nf1-01', 'nbt5-02'],
    });
    expect(Object.keys(out.profiles[0].reviewQueue)).toEqual(['a:nf1-01', 'a:nbt5-02']);
  });

  it("seeds the review queue from the real fixture's own missed questions", () => {
    const missed = (v1Real as { missedQuestionIds: string[] }).missedQuestionIds;
    expect(missed.length).toBeGreaterThanOrEqual(3);
    const out = migrate(v1Real);
    const expectedKeys = missed.map((id) => reviewKeyId({ kind: 'authored', id }));
    expect(Object.keys(out.profiles[0].reviewQueue).sort()).toEqual(expectedKeys.sort());
    for (const key of expectedKeys) {
      expect(out.profiles[0].reviewQueue[key].box).toBe(1);
    }
  });

  it('returns a clean state for null, garbage, or a non-object', () => {
    for (const bad of [null, undefined, 42, 'nope', [], { nothing: true }]) {
      const out = migrate(bad);
      expect(out.version).toBe(2);
      expect(out.profiles).toHaveLength(1);
      expect(out.profiles[0].attempts).toEqual([]);
    }
  });

  it('coerces a non-array attempts or missedQuestionIds instead of throwing', () => {
    const out = migrate({
      settings: { studentName: 'Jo' },
      attempts: 'oops-not-an-array',
      missedQuestionIds: 123,
    });
    expect(out.profiles[0].attempts).toEqual([]);
    expect(out.profiles[0].reviewQueue).toEqual({});
    expect(out.profiles[0].studentName).toBe('Jo');
  });

  it('skips non-string entries in missedQuestionIds but keeps the valid ones', () => {
    const out = migrate({
      settings: { studentName: 'Jo' },
      attempts: [],
      missedQuestionIds: ['nf1-01', 42, null, 'nbt5-02', {}],
    });
    expect(Object.keys(out.profiles[0].reviewQueue)).toEqual(['a:nf1-01', 'a:nbt5-02']);
  });

  it('passes an already-v2 state through unchanged (real idempotency check)', () => {
    const populated: AppStateV2 = {
      version: 2,
      activeProfileId: 'p_1',
      profiles: [
        {
          id: 'p_1',
          studentName: 'Ada',
          grade: 5,
          targetExamDate: '2026-05-15',
          dailyQuestionGoal: 20,
          attempts: migrate(v1Real).profiles[0].attempts,
          reviewQueue: {
            'a:nf1-01': {
              key: { kind: 'authored', id: 'nf1-01' },
              box: 2,
              dueAt: '2026-01-05T00:00:00.000Z',
              lastSeenAt: '2026-01-01T00:00:00.000Z',
            },
          },
        },
        {
          id: 'p_2',
          studentName: 'Grace',
          grade: 4,
          targetExamDate: '',
          dailyQuestionGoal: 10,
          attempts: [],
          reviewQueue: {},
        },
      ],
    };
    const out = migrate(populated);
    expect(out).toEqual(populated);
    expect(out.profiles).toHaveLength(2);
    expect(out.profiles[0].attempts).toHaveLength(2);
    expect(out.profiles[0].reviewQueue['a:nf1-01'].box).toBe(2);
  });

  it('treats an unpopulated v2-shaped blob (empty profiles) as unrecognized', () => {
    const out = migrate({ version: 2, profiles: [], activeProfileId: 'nope' });
    expect(out.profiles).toHaveLength(1);
    expect(out.profiles[0].attempts).toEqual([]);
  });

  it('repairs a v2 blob whose activeProfileId does not resolve, instead of discarding it', () => {
    const out = migrate({
      version: 2,
      profiles: [{ id: 'p_1', studentName: 'X', grade: 5, targetExamDate: '', dailyQuestionGoal: 20, attempts: [], reviewQueue: {} }],
      activeProfileId: 'does-not-exist',
    });
    expect(out.profiles[0].studentName).toBe('X');
    expect(out.activeProfileId).toBe('p_1');
  });

  it('accepts injected now/newId so it is a pure, deterministic function', () => {
    const out = migrate(
      { settings: { studentName: 'Deterministic' }, attempts: [], missedQuestionIds: ['nf1-01'] },
      { now: FIXED_NOW, newId: fixedNewId },
    );
    expect(out.profiles[0].id).toMatch(/^fixed-/);
    expect(out.profiles[0].reviewQueue['a:nf1-01'].dueAt).toBe(FIXED_NOW.toISOString());
    expect(out.profiles[0].reviewQueue['a:nf1-01'].lastSeenAt).toBe(FIXED_NOW.toISOString());
  });

  it('initialState accepts an injected id generator', () => {
    const out = initialState(() => 'fixed-initial');
    expect(out.profiles[0].id).toBe('fixed-initial');
    expect(out.activeProfileId).toBe('fixed-initial');
  });
});

describe('loadState', () => {
  const mem = (): Storage => {
    const m = new Map<string, string>();
    return {
      getItem: (k) => m.get(k) ?? null,
      setItem: (k, v) => void m.set(k, v),
      removeItem: (k) => void m.delete(k),
      clear: () => m.clear(), key: () => null, length: 0,
    } as Storage;
  };

  it('prefers v2 when present', () => {
    const s = mem();
    const state = initialState();
    state.profiles[0].studentName = 'FromV2';
    s.setItem(STORAGE_KEY_V2, JSON.stringify(state));
    s.setItem(STORAGE_KEY_V1, JSON.stringify(v1Real));
    expect(loadState(s).profiles[0].studentName).toBe('FromV2');
  });

  it('migrates v1 when v2 is absent', () => {
    const s = mem();
    s.setItem(STORAGE_KEY_V1, JSON.stringify(v1Real));
    expect(loadState(s).profiles[0].attempts.length)
      .toBe((v1Real as { attempts: unknown[] }).attempts.length);
  });

  it('leaves the v1 key in place after migrating', () => {
    // If v2 writing fails later, the original history must still exist.
    const s = mem();
    s.setItem(STORAGE_KEY_V1, JSON.stringify(v1Real));
    loadState(s);
    expect(s.getItem(STORAGE_KEY_V1)).not.toBeNull();
  });

  it('survives unparseable JSON in v2 with no v1 present', () => {
    const s = mem();
    s.setItem(STORAGE_KEY_V2, '{not json');
    expect(loadState(s).profiles).toHaveLength(1);
  });

  it('survives unparseable JSON in v1 specifically', () => {
    const s = mem();
    s.setItem(STORAGE_KEY_V1, '{not json either');
    const out = loadState(s);
    expect(out.profiles).toHaveLength(1);
    expect(out.profiles[0].attempts).toEqual([]);
  });

  it('a corrupt/unrecognized v2 blob does not shadow a healthy v1 payload (Finding 1)', () => {
    const s = mem();
    // Valid JSON, but not a usable v2 state: no profiles.
    s.setItem(STORAGE_KEY_V2, JSON.stringify({ version: 2, profiles: [], activeProfileId: 'ghost' }));
    s.setItem(STORAGE_KEY_V1, JSON.stringify(v1Real));

    const out = loadState(s);

    expect(out.profiles).toHaveLength(1);
    expect(out.profiles[0].attempts).toHaveLength((v1Real as { attempts: unknown[] }).attempts.length);
    expect(out.profiles[0].studentName).toBe((v1Real as { settings: { studentName: string } }).settings.studentName);
    // v1 must still be untouched on disk.
    expect(s.getItem(STORAGE_KEY_V1)).not.toBeNull();
  });

  it('a v2 blob with a dangling activeProfileId is repaired and still wins over v1', () => {
    const s = mem();
    s.setItem(STORAGE_KEY_V2, JSON.stringify({
      version: 2,
      profiles: [{ id: 'p_x', studentName: 'Ghost', grade: 5, targetExamDate: '', dailyQuestionGoal: 20, attempts: [], reviewQueue: {} }],
      activeProfileId: 'not-p_x',
    }));
    s.setItem(STORAGE_KEY_V1, JSON.stringify(v1Real));

    const out = loadState(s);
    expect(out.profiles[0].studentName).toBe('Ghost');
    expect(out.activeProfileId).toBe('p_x');
  });
});

describe('saveState', () => {
  it('does not throw when storage.setItem throws (e.g. quota exceeded)', () => {
    const throwingStorage = {
      getItem: () => null,
      setItem: () => { throw new DOMException('QuotaExceededError'); },
      removeItem: () => {},
      clear: () => {},
      key: () => null,
      length: 0,
    } as Storage;

    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => saveState(throwingStorage, initialState())).not.toThrow();
    expect(consoleErrorSpy).toHaveBeenCalled();
    consoleErrorSpy.mockRestore();
  });
});

describe('saved sessions in storage (no version bump)', () => {
  it('loads a v2 blob without the new fields and keeps it intact', () => {
    const p = newProfile({ id: 'p1', studentName: 'Ada' });
    const out = migrate({ version: 2, profiles: [p], activeProfileId: 'p1' });
    expect(out.profiles[0]).toEqual(p);
    expect(out.profiles[0].activeSession).toBeUndefined();
  });

  it('round-trips an active session through save and load', () => {
    const store = new Map<string, string>();
    const storage = {
      getItem: (k: string) => store.get(k) ?? null,
      setItem: (k: string, v: string) => void store.set(k, v),
    } as unknown as Storage;
    const activeSession = {
      kind: 'practice' as const, quizId: 'path-practice-1', title: 'Round 1 practice',
      refs: [{ kind: 'authored' as const, id: 'nf1-01' }],
      answers: { 'nf1-01': { selected: 'B', isCorrect: true } }, flagged: {},
      currentIndex: 0, startedAt: '2026-09-30T00:00:00.000Z', secondsElapsed: 42,
    };
    const p = newProfile({ id: 'p1', studentName: 'Ada', activeSession, checkupSkipped: true, sessionSize: 10 });
    saveState(storage, { version: 2, profiles: [p], activeProfileId: 'p1' });
    expect(loadState(storage).profiles[0]).toEqual(p);
  });
});
