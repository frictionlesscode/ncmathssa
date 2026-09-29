import { describe, it, expect } from 'vitest';
import {
  masteryStatus,
  overallReadiness,
  masteryByStandard,
  topMisconceptions,
  topMisconceptionFamilies,
} from './mastery';
import { getCurriculum } from '../curriculum/registry';
import type { QuizAttempt } from '../types';
import type { StandardMastery } from './mastery';

const c = getCurriculum(5);

describe('masteryStatus', () => {
  it('is untested with no attempts', () => {
    expect(masteryStatus(0, 0, 80)).toBe('untested');
  });

  it('is acceleration-ready at or above the passing mark', () => {
    expect(masteryStatus(80, 10, 80)).toBe('acceleration-ready');
    expect(masteryStatus(95, 10, 80)).toBe('acceleration-ready');
  });

  it('is approaching between 60 and the passing mark', () => {
    expect(masteryStatus(70, 10, 80)).toBe('approaching');
  });

  it('is needs-focus below 60', () => {
    expect(masteryStatus(45, 10, 80)).toBe('needs-focus');
  });

  it('does not award acceleration-ready on a single lucky answer', () => {
    // 1 for 1 is 100% but says nothing; require a minimum sample.
    expect(masteryStatus(100, 1, 80)).toBe('approaching');
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
