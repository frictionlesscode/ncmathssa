import { describe, it, expect } from 'vitest';
import {
  getCurriculum,
  listCurricula,
  standardsOf,
  domainWeight,
  weightLabel,
  weightHeading,
  weightValue,
  weightCompactLabel,
} from './registry';
import type { Grade, GradeCurriculum } from './types';
import { makeQuestionSource } from '../engine/questionSource';

describe('registry', () => {
  it('returns the grade 5 curriculum', () => {
    const c = getCurriculum(5);
    expect(c.grade).toBe(5);
    expect(c.domains.length).toBeGreaterThan(0);
  });

  it('throws for a grade with no curriculum module', () => {
    // Task 26 registers grade 1, the last unregistered member of `Grade`.
    // After that, no member of `Grade = 1|2|3|4|5` is unregistered, so
    // `getCurriculum(3)` (or any real grade) can no longer throw and the
    // failure path becomes inexpressible with a real grade number. Ruling
    // 26-3 keeps the test by simulating a future grade whose module does
    // not exist yet: the cast is deliberate. Deleting this test would
    // remove the only coverage of the registry's failure path on the very
    // task that finalises the registry, and that failure path is what
    // stops a missing module rendering as a blank app.
    expect(() => getCurriculum(6 as Grade)).toThrow(/no curriculum/i);
  });

  it('lists only grades that actually have modules', () => {
    expect(listCurricula().map((c) => c.grade)).toEqual([1, 2, 3, 4, 5]);
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

describe('weight headings', () => {
  it('calls a blueprint a blueprint only where one exists', () => {
    const g5 = getCurriculum(5);
    expect(weightHeading(g5)).toBe('NC Blueprint Weight');
  });

  it('calls an unweighted grade what it is', () => {
    const g2 = getCurriculum(2);
    expect(weightHeading(g2)).toBe('Share of Grade Standards');
    expect(weightHeading(g2)).not.toMatch(/blueprint/i);
  });
});

describe('weightValue', () => {
  it('cites the published band for a blueprint grade, same as weightLabel', () => {
    const g5 = getCurriculum(5);
    expect(weightValue(g5, 'NF')).toBe(weightLabel(g5, 'NF'));
    expect(weightValue(g5, 'MD')).toBe(weightLabel(g5, 'MD'));
  });

  it("renders domainWeight's computed share for an unweighted grade, never the placeholder string", () => {
    // Pairing weightHeading('Share of Grade Standards') with the raw
    // officialWeightRange placeholder would read "Share of Grade Standards:
    // No state assessment at this grade" - a heading promising a share
    // followed by a non-answer (Ruling 21-3).
    const g2 = getCurriculum(2);
    for (const d of g2.domains) {
      const value = weightValue(g2, d.id);
      expect(value, `${d.id} value is "${value}"`).toMatch(/^\d+%$/);
      expect(value).not.toMatch(/no state assessment/i);
    }
  });

  it('sums the unweighted grade\'s rendered values to 100', () => {
    const g2 = getCurriculum(2);
    const total = g2.domains.reduce((n, d) => n + Number(weightValue(g2, d.id).replace('%', '')), 0);
    expect(total).toBe(100);
  });

  it('agrees with weightLabel on an unknown domain: both empty, not a fabricated 0% (Finding F9)', () => {
    const g5 = getCurriculum(5);
    const g2 = getCurriculum(2);
    expect(weightValue(g5, 'ZZZ')).toBe(weightLabel(g5, 'ZZZ'));
    expect(weightValue(g5, 'ZZZ')).toBe('');
    expect(weightValue(g2, 'ZZZ')).toBe(weightLabel(g2, 'ZZZ'));
    expect(weightValue(g2, 'ZZZ')).toBe('');
  });
});

describe('weightCompactLabel (Finding F1)', () => {
  it('marks a grouped blueprint band as shared, one line, no nested parens', () => {
    const g5 = getCurriculum(5);
    expect(weightCompactLabel(g5, 'MD')).toBe('19–23% with G');
    expect(weightCompactLabel(g5, 'G')).toBe('19–23% with MD');
    expect(weightCompactLabel(g5, 'MD')).not.toMatch(/\(.*\(/); // no nested parens
    expect(weightCompactLabel(g5, 'MD')).not.toMatch(/\n/);
  });

  it('leaves an ungrouped blueprint domain exactly as weightValue renders it', () => {
    const g5 = getCurriculum(5);
    expect(weightCompactLabel(g5, 'NF')).toBe(weightValue(g5, 'NF'));
    expect(weightCompactLabel(g5, 'NF')).toBe('39–43%');
  });

  it("leaves grade 2's values exactly as they are ('17%'), unweighted grades have no group", () => {
    const g2 = getCurriculum(2);
    for (const d of g2.domains) {
      expect(weightCompactLabel(g2, d.id)).toBe(weightValue(g2, d.id));
    }
    const oa = g2.domains.find((d) => d.id === 'OA')!;
    expect(weightCompactLabel(g2, 'OA')).toBe(`${Math.round((oa.standards.length / standardsOf(g2).length) * 100)}%`);
  });

  it('returns empty for an unknown domain, agreeing with weightValue', () => {
    const g5 = getCurriculum(5);
    expect(weightCompactLabel(g5, 'ZZZ')).toBe('');
  });
});
