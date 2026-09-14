import { describe, it, expect } from 'vitest';
import { getCurriculum, listCurricula, standardsOf, domainWeight, weightLabel } from './registry';
import type { GradeCurriculum } from './types';
import { makeQuestionSource } from '../engine/questionSource';

describe('registry', () => {
  it('returns the grade 5 curriculum', () => {
    const c = getCurriculum(5);
    expect(c.grade).toBe(5);
    expect(c.domains.length).toBeGreaterThan(0);
  });

  it('throws for a grade with no curriculum module', () => {
    // Grade 1 is a later batch; asking for one must fail loudly, not
    // return an empty curriculum that renders as a blank app. This pin
    // moves down as each grade registers - it was grade 3 until Task 16
    // and must name a grade that still has no module, so grade 2 (which
    // registers in Task 21) would only move it again one task later.
    expect(() => getCurriculum(1)).toThrow(/no curriculum/i);
  });

  it('lists only grades that actually have modules', () => {
    expect(listCurricula().map((c) => c.grade)).toEqual([3, 4, 5]);
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
    quizzes: [],
    studyGuides: {},
    source: makeQuestionSource([], []),
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

describe('NCDPI blueprint bands', () => {
  // NCDPI weights Measurement & Data together with Geometry as a single
  // band (grade 5: 19-23%). Neither domain has a published weight of its
  // own, so neither may claim one - the app prints these as "NC Blueprint
  // Weight", including in the parent report.
  it('cites the combined band for both domains in the group', () => {
    const c = getCurriculum(5);
    const md = c.domains.find((d) => d.id === 'MD')!;
    const g = c.domains.find((d) => d.id === 'G')!;
    expect(md.officialWeightRange).toBe('19–23%');
    expect(g.officialWeightRange).toBe('19–23%');
    expect(md.weightGroup).toBe('MD+G');
    expect(g.weightGroup).toBe('MD+G');
  });

  it('labels a grouped band so the reader knows it is shared', () => {
    const c = getCurriculum(5);
    expect(weightLabel(c, 'MD')).toBe('19–23% (Measurement & Data and Geometry combined)');
    expect(weightLabel(c, 'NF')).toBe('39–43%');
  });

  it('splits a shared band across its domains by standard count', () => {
    // Group midpoint 21; MD holds 4 standards, G holds 2.
    const c = getCurriculum(5);
    expect(domainWeight(c, 'MD')).toBeCloseTo(14, 6);
    expect(domainWeight(c, 'G')).toBeCloseTo(7, 6);
  });

  it('sums every domain weight to 100', () => {
    const c = getCurriculum(5);
    const total = c.domains.reduce((n, d) => n + domainWeight(c, d.id), 0);
    expect(total).toBeCloseTo(100, 6);
  });
});
