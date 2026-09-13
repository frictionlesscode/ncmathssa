import { describe, it, expect } from 'vitest';
import { domainWeight } from '../registry';
import { GRADE_5 } from './index';

describe('GRADE_5', () => {
  it('has the five NC grade 5 domains', () => {
    expect(GRADE_5.domains.map((d) => d.id).sort()).toEqual(['G', 'MD', 'NBT', 'NF', 'OA']);
  });

  it('has all 17 standards', () => {
    // NOTE: the task brief's draft test asserted 16 standards, but the
    // source data (src/data/ncStandards.ts, relocated verbatim here) has
    // 17: NF has 4 (NF.1, NF.3, NF.4, NF.7), NBT has 5, MD has 4, OA has 2,
    // G has 2. Per the "pure relocation, no content changes" constraint,
    // this test is adjusted to match the real, unaltered data rather than
    // the data being trimmed to fit the brief's example count.
    const codes = GRADE_5.domains.flatMap((d) => d.standards.map((s) => s.code));
    expect(codes).toHaveLength(17);
    expect(new Set(codes).size).toBe(17);
  });

  it('uses the NCDPI blueprint weighting and cites a source', () => {
    expect(GRADE_5.weighting.kind).toBe('ncdpi-blueprint');
    if (GRADE_5.weighting.kind === 'ncdpi-blueprint') {
      expect(GRADE_5.weighting.source.length).toBeGreaterThan(0);
    }
  });

  it('carries the WCPSS 80% SSA cutoff and targets grade 5', () => {
    expect(GRADE_5.ssa.passingPercent).toBe(80);
    expect(GRADE_5.ssa.targetsGrade).toBe(5);
  });

  it('declares every standard under its own domain', () => {
    for (const d of GRADE_5.domains) {
      for (const s of d.standards) expect(s.domainId).toBe(d.id);
    }
  });

  it('has blueprint weights summing to roughly 100', () => {
    // Summed through domainWeight, not officialWeightMidpoint: domains that
    // share a published band (MD and G) each carry the whole band's midpoint,
    // so adding the raw midpoints double-counts the band.
    const sum = GRADE_5.domains.reduce((n, d) => n + domainWeight(GRADE_5, d.id), 0);
    expect(sum).toBeGreaterThanOrEqual(98);
    expect(sum).toBeLessThanOrEqual(102);
  });

  it('gives each domain in a shared band a share of it, not the whole band', () => {
    const md = domainWeight(GRADE_5, 'MD');
    const g = domainWeight(GRADE_5, 'G');
    const band = GRADE_5.domains.find((d) => d.id === 'MD')!.officialWeightMidpoint;
    expect(md + g).toBeCloseTo(band, 6);
    expect(md).toBeLessThan(band);
    expect(g).toBeLessThan(band);
  });
});
