import { describe, it, expect } from 'vitest';
import {
  masteryStatus,
  overallReadiness,
  masteryByStandard,
  topMisconceptions,
  topMisconceptionFamilies,
  isPassing,
  readinessStatus,
  formatPercent,
  displayPercent,
  pointsToGoal,
  domainStatsFor,
} from './mastery';
import { getCurriculum, standardsOf } from '../curriculum/registry';
import type { QuizAttempt } from '../types';
import type { StandardMastery } from './mastery';

const c = getCurriculum(5);

describe('masteryStatus', () => {
  it('is untested with no attempts', () => {
    expect(masteryStatus(0, 0, 80)).toBe('untested');
  });

  it('is acceleration-ready at or above the passing mark', () => {
    expect(masteryStatus(8, 10, 80)).toBe('acceleration-ready');
    expect(masteryStatus(19, 20, 80)).toBe('acceleration-ready');
  });

  it('is approaching between 60 and the passing mark', () => {
    expect(masteryStatus(7, 10, 80)).toBe('approaching');
  });

  it('is needs-focus below 60', () => {
    expect(masteryStatus(9, 20, 80)).toBe('needs-focus');
  });

  it('does not award acceleration-ready on a single lucky answer', () => {
    // 1 for 1 is 100% but says nothing; require a minimum sample.
    expect(masteryStatus(1, 1, 80)).toBe('approaching');
  });

  it('F5: 63 of 79 (79.75%) is approaching, not ready', () => {
    expect(masteryStatus(63, 79, 80)).toBe('approaching');
  });

  it('F5: 119 of 200 (59.5%) is needs-focus, not approaching', () => {
    expect(masteryStatus(119, 200, 80)).toBe('needs-focus');
  });
});

describe('isPassing', () => {
  it('compares exactly, with no rounding', () => {
    expect(isPassing(4, 5, 80)).toBe(true);
    expect(isPassing(79, 100, 80)).toBe(false);
    expect(isPassing(63, 79, 80)).toBe(false);
    expect(isPassing(0, 0, 80)).toBe(false);
  });
  it('reads the bar it is given, not a literal 80', () => {
    expect(isPassing(3, 5, 60)).toBe(true);
    expect(isPassing(3, 5, 61)).toBe(false);
  });
});

describe('readiness thresholds and display (F3)', () => {
  it('F3: 79.6 is building and displays as 79%', () => {
    expect(readinessStatus(79.6, 80)).toBe('building');
    expect(formatPercent(79.6)).toBe('79%');
    expect(displayPercent(79.95)).toBe(79);
    expect(pointsToGoal(79.6, 80)).toBe(1);
  });
  it('F3: floating-point noise around 80 is ready and displays as 80%', () => {
    expect(readinessStatus(79.99999999999999, 80)).toBe('ready');
    expect(formatPercent(79.99999999999999)).toBe('80%');
    expect(readinessStatus(80, 80)).toBe('ready');
    expect(pointsToGoal(80, 80)).toBe(0);
  });
  it('F3: a uniform 79.6% accuracy is not ready anywhere', () => {
    const mastery = new Map(standardsOf(c).map((s) => [s.code, {
      standardCode: s.code, total: 500, correct: 398, percent: 79.6, status: 'approaching' as const, misconceptions: {},
    }]));
    const r = overallReadiness(mastery, c);
    expect(r).toBeCloseTo(79.6, 5);
    expect(readinessStatus(r, c.ssa.passingPercent)).toBe('building');
    expect(formatPercent(r)).toBe('79%');
  });
});

describe('domainStatsFor (F5)', () => {
  const domain = c.domains[0];
  const only = (correct: number, total: number) =>
    new Map([[domain.standards[0].code, {
      standardCode: domain.standards[0].code, total, correct, percent: (correct / total) * 100,
      status: 'approaching' as const, misconceptions: {},
    }]]);
  it('F5: 63 of 79 in a domain is approaching although it displays 80', () => {
    const s = domainStatsFor(domain, only(63, 79), 80);
    expect(s.masteryPercent).toBe(80);
    expect(s.status).toBe('approaching');
  });
  it('F5: 119 of 200 is needs-focus although it displays 60', () => {
    const s = domainStatsFor(domain, only(119, 200), 80);
    expect(s.masteryPercent).toBe(60);
    expect(s.status).toBe('needs-focus');
  });
});

describe('overallReadiness', () => {
  it('is 0 when nothing has been attempted', () => {
    expect(overallReadiness(masteryByStandard([], c), c)).toBe(0);
  });

  it('weights fractions above geometry, per the NCDPI blueprint', () => {
    const perfectIn = (code: string): QuizAttempt[] => ([{
      id: 'a', quizId: 'q', quizTitle: 't', completedAt: '2026-01-01T00:00:00Z',
      scoreRaw: 8, scoreTotal: 8, scorePercent: 100, isPassingSSA: true, timeElapsedSeconds: 60,
      answers: Object.fromEntries(Array.from({ length: 8 }, (_, i) => [
        `${code}-${i}`,
        { questionId: `${code}-${i}`, standardCode: code, isCorrect: true, studentAnswer: 'A' },
      ])),
    } as unknown as QuizAttempt]);

    const nf = overallReadiness(masteryByStandard(perfectIn('NC.5.NF.1'), c), c);
    const g  = overallReadiness(masteryByStandard(perfectIn('NC.5.G.1'), c), c);
    expect(nf).toBeGreaterThan(g);
  });
});

describe('topMisconceptions', () => {
  it('ranks the most frequently chosen errors first', () => {
    const m = new Map<string, StandardMastery>([
      ['NC.5.NF.1', { standardCode: 'NC.5.NF.1', total: 6, correct: 2, percent: 33,
        status: 'needs-focus',
        misconceptions: { 'added-numerators-and-denominators': 3, 'forgot-to-regroup': 1 } }],
      ['NC.5.NF.4', { standardCode: 'NC.5.NF.4', total: 4, correct: 3, percent: 75,
        status: 'approaching',
        misconceptions: { 'added-numerators-and-denominators': 1 } }],
    ]);
    expect(topMisconceptions(m, 2)).toEqual([
      { tag: 'added-numerators-and-denominators', count: 4 },
      { tag: 'forgot-to-regroup', count: 1 },
    ]);
  });
});

describe('topMisconceptionFamilies', () => {
  it('returns [] for an empty mastery map', () => {
    expect(topMisconceptionFamilies(new Map(), 5)).toEqual([]);
  });

  it('rolls up two different tags in the same family', () => {
    // added-numerators-and-denominators and forgot-to-regroup are both
    // fraction-operations tags.
    const m = new Map<string, StandardMastery>([
      ['NC.5.NF.1', { standardCode: 'NC.5.NF.1', total: 6, correct: 2, percent: 33,
        status: 'needs-focus',
        misconceptions: { 'added-numerators-and-denominators': 3, 'forgot-to-regroup': 2 } }],
    ]);
    const result = topMisconceptionFamilies(m, 5);
    expect(result).toEqual([
      {
        family: 'fraction-operations',
        count: 5,
        tags: [
          { tag: 'added-numerators-and-denominators', count: 3 },
          { tag: 'forgot-to-regroup', count: 2 },
        ],
      },
    ]);
  });

  it('orders families by total count descending', () => {
    const m = new Map<string, StandardMastery>([
      ['NC.5.NF.1', { standardCode: 'NC.5.NF.1', total: 5, correct: 1, percent: 20,
        status: 'needs-focus',
        // fraction-operations: 1
        misconceptions: { 'forgot-to-regroup': 1 } }],
      ['NC.5.OA.2', { standardCode: 'NC.5.OA.2', total: 5, correct: 1, percent: 20,
        status: 'needs-focus',
        // operation-choice: 4
        misconceptions: { 'added-instead-of-multiplied': 4 } }],
    ]);
    const result = topMisconceptionFamilies(m, 5);
    expect(result.map((f) => f.family)).toEqual(['operation-choice', 'fraction-operations']);
  });

  it('breaks ties deterministically by family name', () => {
    const m = new Map<string, StandardMastery>([
      ['NC.5.NF.1', { standardCode: 'NC.5.NF.1', total: 5, correct: 4, percent: 80,
        status: 'acceleration-ready',
        // fraction-operations: 2
        misconceptions: { 'forgot-to-regroup': 2 } }],
      ['NC.5.OA.2', { standardCode: 'NC.5.OA.2', total: 5, correct: 3, percent: 60,
        status: 'approaching',
        // operation-choice: 2 (tie with fraction-operations)
        misconceptions: { 'added-instead-of-multiplied': 2 } }],
    ]);
    const result = topMisconceptionFamilies(m, 5);
    expect(result.map((f) => f.family)).toEqual(['fraction-operations', 'operation-choice']);
  });

  it('skips a tag with no registry entry rather than throwing', () => {
    const m = new Map<string, StandardMastery>([
      ['NC.5.NF.1', { standardCode: 'NC.5.NF.1', total: 5, correct: 2, percent: 40,
        status: 'needs-focus',
        misconceptions: { 'not-a-real-tag': 3, 'forgot-to-regroup': 1 } }],
    ]);
    expect(() => topMisconceptionFamilies(m, 5)).not.toThrow();
    const result = topMisconceptionFamilies(m, 5);
    expect(result).toEqual([
      { family: 'fraction-operations', count: 1, tags: [{ tag: 'forgot-to-regroup', count: 1 }] },
    ]);
  });

  it('respects the limit', () => {
    const m = new Map<string, StandardMastery>([
      ['NC.5.NF.1', { standardCode: 'NC.5.NF.1', total: 5, correct: 1, percent: 20,
        status: 'needs-focus', misconceptions: { 'forgot-to-regroup': 1 } }],
      ['NC.5.OA.2', { standardCode: 'NC.5.OA.2', total: 5, correct: 1, percent: 20,
        status: 'needs-focus', misconceptions: { 'added-instead-of-multiplied': 4 } }],
    ]);
    expect(topMisconceptionFamilies(m, 1)).toEqual([
      {
        family: 'operation-choice',
        count: 4,
        tags: [{ tag: 'added-instead-of-multiplied', count: 4 }],
      },
    ]);
  });
});
