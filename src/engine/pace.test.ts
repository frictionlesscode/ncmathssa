import { describe, it, expect } from 'vitest';
import { computePace } from './pace';
import { buildPath, type PathState } from './path';
import { getCurriculum } from '../curriculum/registry';
import type { QuizAttempt } from '../types';

const NOW = new Date(2026, 8, 30, 12);
const path = (over: Partial<PathState> = {}): PathState => ({
  topics: [], checkupDone: true, currentRound: 1, activeDomains: [], roundTopicsDone: 0,
  roundsFinished: 0, roundsTotal: 15, shortOnTime: false, round1Skipped: false, practiceTestRepeat: false, next: { kind: 'practice', round: 1 }, ...over,
});
const attemptAt = (iso: string) => ({ completedAt: iso }) as QuizAttempt;
const input = (over: Partial<Parameters<typeof computePace>[0]> = {}) => ({
  path: path(), attempts: [] as QuizAttempt[], testDate: '2026-11-25', now: NOW, sessionSize: 15, ...over,
});

describe('computePace', () => {
  it('reports no date', () => {
    expect(computePace(input({ testDate: '' }))).toEqual({ dateState: 'none', daysLeft: null });
  });

  it('reports a passed date with no status', () => {
    const p = computePace(input({ testDate: '2026-09-01' }));
    expect(p.dateState).toBe('passed');
    expect(p.status).toBeUndefined();
  });

  it('reports short when the path is short on time', () => {
    expect(computePace(input({ testDate: '2026-10-05', path: path({ shortOnTime: true }) })).dateState).toBe('short');
  });

  it('is on track with no history yet', () => {
    const p = computePace(input());
    expect(p.dateState).toBe('normal');
    expect(p.status).toBe('on-track');
  });

  it('is behind when most of the time is gone and little is done', () => {
    const p = computePace(input({ attempts: [attemptAt('2026-07-01T00:00:00Z')], testDate: '2026-10-10',
      path: path({ roundsFinished: 1 }) }));
    expect(p.status).toBe('behind');
  });

  it('is ahead when a lot is done early', () => {
    const p = computePace(input({
      attempts: [attemptAt('2026-09-29T00:00:00Z'), attemptAt('2026-09-29T06:00:00Z')],
      path: path({ roundsFinished: 10 }),
    }));
    expect(p.status).toBe('ahead');
  });

  it('F1: one or fewer attempts is never ahead, whatever the path says', () => {
    const p = computePace(input({ attempts: [attemptAt('2026-09-29T00:00:00Z')], path: path({ roundsFinished: 10 }) }));
    expect(p.status).toBe('on-track');
  });

  const shortPath = (testDate: string) =>
    buildPath({ curriculum: getCurriculum(5), attempts: [], checkupSkipped: true, testDate, now: NOW });

  it('F1: short-on-time pace with no attempts is on-track, never ahead', () => {
    const pace = computePace(input({ path: shortPath('2026-10-05'), attempts: [], testDate: '2026-10-05' }));
    expect(pace.dateState).toBe('short');
    expect(pace.status).toBe('on-track');
  });

  it('F1: short-on-time pace with one fresh attempt and nothing finished is on-track, never ahead', () => {
    const pace = computePace(input({
      path: shortPath('2026-10-05'), attempts: [attemptAt('2026-09-30T11:00:00Z')], testDate: '2026-10-05',
    }));
    expect(pace.dateState).toBe('short');
    expect(pace.status).toBe('on-track');
  });

  it('F1: test date today with 0 attempts is short-on-time and on-track, never ahead', () => {
    const pace = computePace(input({ path: shortPath('2026-09-30'), attempts: [], testDate: '2026-09-30' }));
    expect(pace.daysLeft).toBe(0);
    expect(pace.dateState).toBe('short');
    expect(pace.status).toBe('on-track');
  });

  it('F1: test date today with exactly 1 attempt is short-on-time and behind, never ahead', () => {
    const pace = computePace(input({
      path: shortPath('2026-09-30'), attempts: [attemptAt('2026-09-30T11:00:00Z')], testDate: '2026-09-30',
    }));
    expect(pace.daysLeft).toBe(0);
    expect(pace.dateState).toBe('short');
    expect(pace.status).toBe('behind');
  });

  it('suggests between 1 and 7 sessions a week', () => {
    const lots = computePace(input({ testDate: '2026-10-02', path: path({ roundsFinished: 0, roundsTotal: 15 }) }));
    expect(lots.sessionsPerWeek).toBe(7);
    const none = computePace(input({ path: path({ roundsFinished: 15, practiceTestPassedAt: 'x' }) }));
    expect(none.sessionsPerWeek).toBe(1);
  });

  it('estimates remaining sessions from rounds left and session size', () => {
    // 15 topic-rounds x 8 answers / (15 x 0.6 ≈ 9 new per session) = 14 sessions, +1 practice test = 15.
    // 56 days = 8 weeks -> ceil(15 / 8) = 2 a week.
    const p = computePace(input({ testDate: '2026-11-25' }));
    expect(p.sessionsPerWeek).toBe(2);
  });
});
