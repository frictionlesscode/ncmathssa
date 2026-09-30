import { describe, it, expect } from 'vitest';
import { normaliseState, loadState, backupRaw, newProfile, STORAGE_KEY_V2, CORRUPT_KEY_PREFIX } from './storage';
import { mergeStates } from './merge';
import { createMemoryStorage } from './memoryStorage';
import type { QuizAttempt } from '../types';

const attempt = (id: string, completedAt = '2026-09-01T00:00:00.000Z'): QuizAttempt => ({
  id, quizId: 'q', quizTitle: 'q', completedAt, scoreRaw: 1, scoreTotal: 1, scorePercent: 100,
  isPassingSSA: true, timeElapsedSeconds: 1,
  answers: { a: { questionId: 'a', studentAnswer: 'A', isCorrect: true, standardCode: 'NC.5.NF.1' } },
});
const blob = (over: Record<string, unknown> = {}) => ({
  version: 2,
  activeProfileId: 'a',
  profiles: [
    newProfile({ id: 'a', studentName: 'Alex', attempts: [attempt('x1')] }),
    newProfile({ id: 'b', studentName: 'Bea' }),
  ],
  ...over,
});
const corruptKeys = (s: Storage) =>
  Array.from({ length: s.length }, (_, i) => s.key(i) as string).filter((k) => k.startsWith(CORRUPT_KEY_PREFIX));

describe('normaliseState', () => {
  it('returns a clean blob unchanged and not marked repaired', () => {
    const raw = blob();
    const out = normaliseState(raw)!;
    expect(out.repaired).toBe(false);
    expect(out.state).toEqual(raw);
  });

  it('logic-flows High: a dangling activeProfileId falls back to the first profile and keeps every attempt', () => {
    const out = normaliseState(blob({ activeProfileId: 'gone' }))!;
    expect(out.repaired).toBe(true);
    expect(out.state.activeProfileId).toBe('a');
    expect(out.state.profiles[0].attempts).toHaveLength(1);
  });

  it('logic-flows High: a profile without id or studentName gets defaults and the others survive', () => {
    const raw = blob({ profiles: [{ grade: 5, attempts: [attempt('x1')] }, newProfile({ id: 'b', studentName: 'Bea', attempts: [attempt('x2')] })] });
    const out = normaliseState(raw)!;
    expect(out.state.profiles).toHaveLength(2);
    expect(out.state.profiles[0].id).toBe('legacy-profile-0');
    expect(out.state.profiles[0].studentName).toBe('');
    expect(out.state.profiles[0].attempts).toHaveLength(1);
    expect(out.state.profiles[1].attempts).toHaveLength(1);
  });

  it('logic-flows High: drops null attempts and attempts without an answers object, keeps good ones', () => {
    const p = newProfile({ id: 'a', studentName: 'Alex' }) as unknown as Record<string, unknown>;
    p.attempts = [null, 7, { id: 'no-answers', completedAt: '2026-09-01T00:00:00.000Z' }, attempt('good')];
    const out = normaliseState({ version: 2, activeProfileId: 'a', profiles: [p] })!;
    expect(out.state.profiles[0].attempts.map((a) => a.id)).toEqual(['good']);
  });

  it('logic-flows High: drops a null answer inside an attempt but keeps the attempt', () => {
    const bad = attempt('mixed') as unknown as { answers: Record<string, unknown> };
    bad.answers.broken = null;
    const p = newProfile({ id: 'a', studentName: 'Alex', attempts: [bad as unknown as QuizAttempt] });
    const out = normaliseState({ version: 2, activeProfileId: 'a', profiles: [p] })!;
    expect(Object.keys(out.state.profiles[0].attempts[0].answers)).toEqual(['a']);
  });

  it('logic-flows High: drops an activeSession without refs and keeps one that has them', () => {
    const good = {
      kind: 'practice', quizId: 'path-practice-1', title: 't', refs: [{ kind: 'authored', id: 'nf1-01' }],
      answers: {}, flagged: {}, currentIndex: 0, startedAt: '2026-09-30T00:00:00.000Z', secondsElapsed: 0,
    };
    const { refs: _refs, ...noRefs } = good;
    const raw = blob({ profiles: [
      { ...newProfile({ id: 'a', studentName: 'Alex' }), activeSession: noRefs },
      { ...newProfile({ id: 'b', studentName: 'Bea' }), activeSession: good },
    ] });
    const out = normaliseState(raw)!;
    expect(out.state.profiles[0].activeSession).toBeUndefined();
    expect(out.state.profiles[1].activeSession).toEqual(good);
  });

  it('logic-flows High: moves an unsupported grade to the nearest supported one', () => {
    const grades = [6, 0, undefined, 3].map((g, i) => ({ ...newProfile({ id: `p${i}`, studentName: 'x' }), grade: g }));
    const out = normaliseState({ version: 2, activeProfileId: 'p0', profiles: grades })!;
    expect(out.state.profiles.map((p) => p.grade)).toEqual([5, 1, 5, 3]);
  });

  it('fills a missing reviewQueue', () => {
    const p = { ...newProfile({ id: 'a', studentName: 'Alex' }) } as Record<string, unknown>;
    delete p.reviewQueue;
    const out = normaliseState({ version: 2, activeProfileId: 'a', profiles: [p] })!;
    expect(out.state.profiles[0].reviewQueue).toEqual({});
  });

  it('gives two profiles that share an id distinct ids', () => {
    const out = normaliseState(blob({ profiles: [newProfile({ id: 'dup', studentName: 'A' }), newProfile({ id: 'dup', studentName: 'B' })], activeProfileId: 'dup' }))!;
    expect(new Set(out.state.profiles.map((p) => p.id)).size).toBe(2);
  });

  it('returns null when the blob is not v2 or has no usable profile', () => {
    expect(normaliseState(null)).toBeNull();
    expect(normaliseState({ version: 1 })).toBeNull();
    expect(normaliseState({ version: 2, profiles: [], activeProfileId: 'x' })).toBeNull();
    expect(normaliseState({ version: 2, profiles: [null, 3], activeProfileId: 'x' })).toBeNull();
  });
});

describe('backupRaw pruning', () => {
  const at = (day: number) => new Date(Date.UTC(2026, 8, day));

  it('keeps only the 3 newest corrupt backups', () => {
    const s = createMemoryStorage();
    for (let d = 1; d <= 5; d++) backupRaw(s, `raw-${d}`, at(d));
    const keys = corruptKeys(s).sort();
    expect(keys.map((k) => s.getItem(k))).toEqual(['raw-3', 'raw-4', 'raw-5']);
  });

  it('never removes the backup it just wrote, even when it sorts oldest', () => {
    const s = createMemoryStorage();
    for (let d = 10; d <= 12; d++) backupRaw(s, `raw-${d}`, at(d));
    backupRaw(s, 'older', at(1));
    expect(corruptKeys(s).map((k) => s.getItem(k))).toContain('older');
  });

  it('swallows a failure while pruning', () => {
    const s = createMemoryStorage();
    for (let d = 1; d <= 4; d++) backupRaw(s, `raw-${d}`, at(d));
    s.removeItem = () => { throw new Error('nope'); };
    expect(backupRaw(s, 'raw-5', at(5))).toBe(true);
  });
});

describe('loadState repair and backup', () => {
  it('logic-flows High: repairs a dangling active id without touching the v2 key, and keeps a backup', () => {
    const s = createMemoryStorage();
    const raw = JSON.stringify(blob({ activeProfileId: 'gone' }));
    s.setItem(STORAGE_KEY_V2, raw);
    const out = loadState(s);
    expect(out.profiles.find((p) => p.id === 'a')!.attempts).toHaveLength(1);
    expect(s.getItem(STORAGE_KEY_V2)).toBe(raw); // no write until the user changes something
    const keys = corruptKeys(s);
    expect(keys).toHaveLength(1);
    expect(s.getItem(keys[0])).toBe(raw);
  });

  it('logic-flows High: copies an unparseable blob to ncmathssa_corrupt_<time> and starts fresh', () => {
    const s = createMemoryStorage();
    s.setItem(STORAGE_KEY_V2, '{not json');
    const out = loadState(s);
    expect(out.profiles).toHaveLength(1);
    const keys = corruptKeys(s);
    expect(keys).toHaveLength(1);
    expect(keys[0]).toMatch(/^ncmathssa_corrupt_\d{4}-\d{2}-\d{2}T/);
    expect(s.getItem(keys[0])).toBe('{not json');
  });

  it('does not pile up identical backups on repeated loads', () => {
    const s = createMemoryStorage();
    s.setItem(STORAGE_KEY_V2, '{not json');
    loadState(s);
    loadState(s);
    expect(corruptKeys(s)).toHaveLength(1);
  });

  it('does not back up a healthy blob', () => {
    const s = createMemoryStorage();
    s.setItem(STORAGE_KEY_V2, JSON.stringify(blob()));
    loadState(s);
    expect(corruptKeys(s)).toHaveLength(0);
  });
});

describe('attempt repair', () => {
  it('logic-flows High: an attempt without an id is kept with a deterministic repaired id', () => {
    const p = newProfile({ id: 'a', studentName: 'Alex' }) as unknown as Record<string, unknown>;
    const { id: _id, ...noId } = attempt('x');
    const { completedAt: _c, ...noDate } = attempt('y');
    p.attempts = [noId, noDate];
    const out = normaliseState({ version: 2, activeProfileId: 'a', profiles: [p] })!;
    expect(out.repaired).toBe(true);
    const [a1, a2] = out.state.profiles[0].attempts;
    expect(a1.id).toBe('legacy-a-0');
    expect(a2.id).toBe('y');
    expect(a2.completedAt).toBe('');
  });

  it('logic-flows High: repaired ids are deterministic so two tabs loading the same legacy blob agree and merge without duplicates', () => {
    const p = newProfile({ id: 'a', studentName: 'Alex' }) as unknown as Record<string, unknown>;
    const { id: _id, ...noId } = attempt('x');
    const { id: _id2, ...noId2 } = attempt('y', '2026-09-02T00:00:00.000Z');
    p.attempts = [noId, noId2];
    const { id: _pid, ...noIdProfile } = newProfile({ id: 'p', studentName: 'Bea' });
    const raw = { version: 2, activeProfileId: 'a', profiles: [p, noIdProfile, { ...noIdProfile }] };
    const one = normaliseState(raw)!.state;
    const two = normaliseState(raw)!.state;
    expect(one.profiles.map((x) => x.id)).toEqual(two.profiles.map((x) => x.id));
    expect(new Set(one.profiles.map((x) => x.id)).size).toBe(3);
    expect(one.profiles[0].attempts.map((x) => x.id)).toEqual(two.profiles[0].attempts.map((x) => x.id));
    expect(new Set(one.profiles[0].attempts.map((x) => x.id)).size).toBe(2);
    const merged = mergeStates(one, two);
    expect(merged.profiles).toHaveLength(3);
    expect(merged.profiles[0].attempts).toHaveLength(2);
  });
});
