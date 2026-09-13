import { describe, it, expect } from 'vitest';
import type { DomainInfo } from './types';
import sourced from '../../docs/sources/nc-standards-1-5.json';
import blueprint from '../../docs/sources/nc-eog-blueprint.json';
import { GRADE_1_DOMAINS } from './grade1/standards';
import { GRADE_2_DOMAINS } from './grade2/standards';
import { GRADE_3_DOMAINS } from './grade3/standards';
import { GRADE_4_DOMAINS } from './grade4/standards';
import { GRADE_5_DOMAINS } from './grade5/standards';

const BY_GRADE: Record<string, DomainInfo[]> = {
  '1': GRADE_1_DOMAINS,
  '2': GRADE_2_DOMAINS,
  '3': GRADE_3_DOMAINS,
  '4': GRADE_4_DOMAINS,
  '5': GRADE_5_DOMAINS,
};

// The standards a child practises are a claim about a published document.
// These tests are the only thing standing between a transcription slip and a
// child drilling a standard North Carolina does not teach at their grade.
describe.each(Object.keys(BY_GRADE))('grade %s standards match the source', (grade) => {
  const domains = BY_GRADE[grade];
  const src = (sourced as Record<string, { id: string; standards: { code: string }[] }[]>)[grade];

  it('declares exactly the sourced domains, in order', () => {
    expect(domains.map((d) => d.id).sort()).toEqual(src.map((d) => d.id).sort());
  });

  it('declares exactly the sourced codes in each domain', () => {
    for (const srcDomain of src) {
      const ours = domains.find((d) => d.id === srcDomain.id);
      expect(ours, `no ${srcDomain.id} domain`).toBeTruthy();
      expect(new Set(ours!.standards.map((s) => s.code)))
        .toEqual(new Set(srcDomain.standards.map((s) => s.code)));
    }
  });

  it('invents no standard the source does not list', () => {
    const sourcedCodes = new Set(src.flatMap((d) => d.standards.map((s) => s.code)));
    for (const d of domains) {
      for (const s of d.standards) {
        expect(sourcedCodes.has(s.code), `${s.code} appears in no NCDPI source`).toBe(true);
      }
    }
  });
});

describe.each(['3', '4', '5'])('grade %s weights match the blueprint', (grade) => {
  const domains = BY_GRADE[grade];
  const bands = (blueprint as {
    bands: Record<string, { domains: string[]; range: string; midpoint: number }[]>;
  }).bands[grade];

  it('cites the published band for every domain', () => {
    for (const band of bands) {
      for (const id of band.domains) {
        const d = domains.find((x) => x.id === id);
        expect(d, `no ${id} domain at grade ${grade}`).toBeTruthy();
        expect(d!.officialWeightRange, `${id} band`).toBe(band.range);
        expect(d!.officialWeightMidpoint, `${id} midpoint`).toBe(band.midpoint);
      }
    }
  });

  it('groups every domain that shares a band and no domain that does not', () => {
    for (const band of bands) {
      for (const id of band.domains) {
        const d = domains.find((x) => x.id === id)!;
        if (band.domains.length > 1) {
          expect(d.weightGroup, `${id} shares a band but is ungrouped`).toBeTruthy();
          expect(d.weightGroupLabel).toBeTruthy();
        } else {
          expect(d.weightGroup, `${id} has its own band but is grouped`).toBeUndefined();
        }
      }
    }
  });
});

describe.each(['1', '2'])('grade %s claims no blueprint', (grade) => {
  it('cites no percentage, because NCDPI publishes none below grade 3', () => {
    for (const d of BY_GRADE[grade]) {
      expect(d.officialWeightRange).not.toMatch(/%/);
      expect(d.weightGroup).toBeUndefined();
    }
  });
});
