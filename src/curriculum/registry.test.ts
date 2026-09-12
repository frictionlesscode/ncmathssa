import { describe, it, expect } from 'vitest';
import { getCurriculum, listCurricula, standardsOf, domainWeight } from './registry';
import type { GradeCurriculum } from './types';

describe('registry', () => {
  it('returns the grade 5 curriculum', () => {
    const c = getCurriculum(5);
    expect(c.grade).toBe(5);
    expect(c.domains.length).toBeGreaterThan(0);
  });

  it('throws for a grade with no curriculum module', () => {
    // Grades 1-4 are a later plan; asking for one must fail loudly,
    // not return an empty curriculum that renders as a blank app.
    expect(() => getCurriculum(3)).toThrow(/no curriculum/i);
  });

  it('lists only grades that actually have modules', () => {
    expect(listCurricula().map((c) => c.grade)).toEqual([5]);
  });
});

describe('domainWeight', () => {
  const evenCurriculum: GradeCurriculum = {
    grade: 1,
    label: 'Test',
    ssa: { passingPercent: 80, targetsGrade: 1 },
    weighting: { kind: 'even-by-standard-count' },
    contentComplete: false,
    domains: [
      { id: 'A', name: 'A', shortName: 'A', officialWeightRange: '', officialWeightMidpoint: 0,
        description: '', color: 'blue', badgeBg: '',
        standards: [
          { code: 'X.1', domainId: 'A', title: '', description: '', weightCategory: '', keyConcepts: [] },
          { code: 'X.2', domainId: 'A', title: '', description: '', weightCategory: '', keyConcepts: [] },
          { code: 'X.3', domainId: 'A', title: '', description: '', weightCategory: '', keyConcepts: [] },
        ] },
      { id: 'B', name: 'B', shortName: 'B', officialWeightRange: '', officialWeightMidpoint: 0,
        description: '', color: 'red', badgeBg: '',
        standards: [
          { code: 'Y.1', domainId: 'B', title: '', description: '', weightCategory: '', keyConcepts: [] },
        ] },
    ],
  };

  it('uses the NCDPI midpoint when a blueprint exists', () => {
    const c = getCurriculum(5);
    const nf = c.domains.find((d) => d.id === 'NF')!;
    expect(domainWeight(c, 'NF')).toBe(nf.officialWeightMidpoint);
  });

  it('weights by standard count when no blueprint exists', () => {
    // 3 of 4 standards live in domain A, so A carries 75%.
    expect(domainWeight(evenCurriculum, 'A')).toBe(75);
    expect(domainWeight(evenCurriculum, 'B')).toBe(25);
  });

  it('returns 0 for an unknown domain rather than NaN', () => {
    expect(domainWeight(evenCurriculum, 'ZZZ')).toBe(0);
  });
});

describe('standardsOf', () => {
  it('flattens every domain into one list', () => {
    const c = getCurriculum(5);
    const total = c.domains.reduce((n, d) => n + d.standards.length, 0);
    expect(standardsOf(c)).toHaveLength(total);
  });
});
