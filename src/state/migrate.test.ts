import { describe, it, expect } from 'vitest';
import { migrate, initialState, loadState, STORAGE_KEY_V1, STORAGE_KEY_V2 } from './storage';
import v1Real from './__fixtures__/v1-real.json';

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

  it('returns a clean state for null, garbage, or a non-object', () => {
    for (const bad of [null, undefined, 42, 'nope', [], { nothing: true }]) {
      const out = migrate(bad);
      expect(out.version).toBe(2);
      expect(out.profiles).toHaveLength(1);
      expect(out.profiles[0].attempts).toEqual([]);
    }
  });

  it('passes an already-v2 state through unchanged', () => {
    const v2 = initialState();
    expect(migrate(v2)).toEqual(v2);
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

  it('survives unparseable JSON', () => {
    const s = mem();
    s.setItem(STORAGE_KEY_V2, '{not json');
    expect(loadState(s).profiles).toHaveLength(1);
  });
});
