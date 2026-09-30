import { describe, it, expect } from 'vitest';
import { mergeStates } from './merge';
import { newProfile } from './storage';
import type { AppStateV2, Profile } from './types';
import { att } from './state.testkit';

const prof = (id: string, over: Partial<Profile> = {}) => newProfile({ id, studentName: id, ...over });
const st = (profiles: Profile[], active = profiles[0].id, extra: Partial<AppStateV2> = {}): AppStateV2 =>
  ({ version: 2, profiles, activeProfileId: active, ...extra });

describe('mergeStates', () => {
  it('logic-flows High (multi-tab): attempts from both tabs survive', () => {
    const stored = st([prof('a', { attempts: [att('other', '2026-09-30T10:00:00.000Z')] })]);
    const mine = st([prof('a', { attempts: [att('mine', '2026-09-30T11:00:00.000Z')] })]);
    const out = mergeStates(stored, mine);
    expect(out.profiles[0].attempts.map((a) => a.id)).toEqual(['mine', 'other']);
  });

  it('logic-flows High (multi-tab): an attempt present on both sides counts once', () => {
    const a = att('same', '2026-09-30T10:00:00.000Z');
    const out = mergeStates(st([prof('a', { attempts: [a] })]), st([prof('a', { attempts: [a] })]));
    expect(out.profiles[0].attempts).toHaveLength(1);
  });

  it('logic-flows High (multi-tab): with nothing new in storage the merge is the identity (order preserved)', () => {
    const attempts = [att('old', '2026-09-01T00:00:00.000Z'), att('newer', '2026-09-02T00:00:00.000Z')];
    const mine = st([prof('a', { attempts })]);
    const stored = st([prof('a', { attempts: [attempts[0]] })]);
    expect(mergeStates(stored, mine)).toEqual(mine);
  });

  it('logic-flows High (multi-tab): the active profile keeps this tab\'s scalars; other profiles take the stored ones', () => {
    const stored = st([prof('a', { studentName: 'A-stored' }), prof('b', { studentName: 'B-stored' })], 'a');
    const mine = st([prof('a', { studentName: 'A-mine' }), prof('b', { studentName: 'B-mine' })], 'a');
    const out = mergeStates(stored, mine);
    expect(out.profiles.map((p) => p.studentName)).toEqual(['A-mine', 'B-stored']);
  });

  it('logic-flows High (multi-tab): a storage event prefers the stored scalars for the active profile too', () => {
    const stored = st([prof('a', { studentName: 'A-stored' })]);
    const mine = st([prof('a', { studentName: 'A-mine' })]);
    expect(mergeStates(stored, mine, { activeScalars: 'stored' }).profiles[0].studentName).toBe('A-stored');
  });

  it('logic-flows High (multi-tab): keeps a student another tab added, in mine\'s order first', () => {
    const out = mergeStates(st([prof('a'), prof('new')]), st([prof('a')]));
    expect(out.profiles.map((p) => p.id)).toEqual(['a', 'new']);
  });

  it('logic-flows High (multi-tab): does not resurrect a student deleted in either tab', () => {
    const stored = st([prof('a'), prof('gone')]);
    const mine = st([prof('a')], 'a', { deletedProfileIds: ['gone'] });
    const out = mergeStates(stored, mine);
    expect(out.profiles.map((p) => p.id)).toEqual(['a']);
    expect(out.deletedProfileIds).toEqual(['gone']);
    const other = st([prof('a')], 'a', { deletedProfileIds: ['gone'] });
    expect(mergeStates(other, st([prof('a'), prof('gone')])).profiles.map((p) => p.id)).toEqual(['a']);
  });

  it('logic-flows High (multi-tab): never merges everyone away: falls back to mine', () => {
    const mine = st([prof('a')], 'a');
    const stored = st([prof('a')], 'a', { deletedProfileIds: ['a'] });
    expect(mergeStates(stored, mine)).toEqual(mine);
  });

  it('logic-flows High (multi-tab): repoints activeProfileId when this tab\'s student was deleted elsewhere', () => {
    const stored = st([prof('a'), prof('b')], 'a', { deletedProfileIds: ['b'] });
    const mine = st([prof('a'), prof('b')], 'b');
    expect(mergeStates(stored, mine).activeProfileId).toBe('a');
  });

  it('logic-flows High (multi-tab): the session from the tab that wrote it last wins, ties go to the scalar winner', () => {
    const sess = (title: string) => ({ kind: 'practice' as const, quizId: 'x', title, refs: [], answers: {}, flagged: {}, currentIndex: 0, startedAt: '', secondsElapsed: 0 });
    const stored = st([prof('a', { activeSession: sess('stored'), activeSessionAt: '2026-09-30T12:00:00.000Z' })]);
    const older = st([prof('a', { activeSession: sess('mine'), activeSessionAt: '2026-09-30T11:00:00.000Z' })]);
    expect(mergeStates(stored, older).profiles[0].activeSession?.title).toBe('stored');
    const newer = st([prof('a', { activeSession: sess('mine'), activeSessionAt: '2026-09-30T13:00:00.000Z' })]);
    expect(mergeStates(stored, newer).profiles[0].activeSession?.title).toBe('mine');
    const tie = st([prof('a', { activeSession: sess('mine'), activeSessionAt: '2026-09-30T12:00:00.000Z' })]);
    expect(mergeStates(stored, tie).profiles[0].activeSession?.title).toBe('mine');
    expect(mergeStates(stored, tie, { activeScalars: 'stored' }).profiles[0].activeSession?.title).toBe('stored');
  });

  it('logic-flows High (multi-tab): a session finished here (cleared later) is not revived from an older stored copy', () => {
    const sess = { kind: 'practice' as const, quizId: 'x', title: 't', refs: [], answers: {}, flagged: {}, currentIndex: 0, startedAt: '', secondsElapsed: 0 };
    const stored = st([prof('a', { activeSession: sess, activeSessionAt: '2026-09-30T10:00:00.000Z' })]);
    const mine = st([prof('a', { activeSessionAt: '2026-09-30T11:00:00.000Z' })]);
    expect(mergeStates(stored, mine).profiles[0].activeSession).toBeUndefined();
  });

  it('logic-flows High (multi-tab): cleared history is not resurrected, but newer attempts from the other tab are kept', () => {
    const stored = st([prof('a', { attempts: [att('after', '2026-09-30T12:00:00.000Z'), att('before', '2026-09-30T08:00:00.000Z')] })]);
    const mine = st([prof('a', { attempts: [], historyClearedAt: '2026-09-30T10:00:00.000Z' })]);
    const out = mergeStates(stored, mine);
    expect(out.profiles[0].attempts.map((a) => a.id)).toEqual(['after']);
    expect(out.profiles[0].historyClearedAt).toBe('2026-09-30T10:00:00.000Z');
    expect(out.profiles[0].reviewQueue).toEqual({});
    expect(out.profiles[0].checkupSkipped).toBeUndefined();
  });

  const T = '2026-09-30T10:00:00.000Z';
  const staleTab = () => prof('a', {
    attempts: [att('after', '2026-09-30T12:00:00.000Z'), att('before', '2026-09-30T08:00:00.000Z')],
    reviewQueue: { k: { key: { kind: 'authored', id: 'k' }, box: 1, dueAt: T, lastSeenAt: T } } as Profile['reviewQueue'],
    checkupSkipped: true,
  });
  const clearedTab = () => prof('a', { attempts: [], historyClearedAt: T });

  it('logic-flows High (multi-tab): a stale tab that wins scalars cannot bring back a cleared review queue or checkup flag', () => {
    const out = mergeStates(st([clearedTab()]), st([staleTab()]));
    const p = out.profiles[0];
    expect(p.reviewQueue).toEqual({});
    expect(p.checkupSkipped).toBeUndefined();
    expect(p.attempts.map((a) => a.id)).toEqual(['after']);
    expect(p.historyClearedAt).toBe(T);
  });

  it('logic-flows High (multi-tab): the mirror: a stale stored copy that wins scalars cannot bring them back either', () => {
    const out = mergeStates(st([staleTab()]), st([clearedTab()]), { activeScalars: 'stored' });
    const p = out.profiles[0];
    expect(p.reviewQueue).toEqual({});
    expect(p.checkupSkipped).toBeUndefined();
    expect(p.attempts.map((a) => a.id)).toEqual(['after']);
    expect(p.historyClearedAt).toBe(T);
  });
});
