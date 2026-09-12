import { describe, it, expect } from 'vitest';
import { listCurricula, standardsOf } from './registry';

describe.each(listCurricula().map((c) => [c.grade, c] as const))(
  'grade %i curriculum integrity',
  (_grade, c) => {
    const codes = new Set(standardsOf(c).map((s) => s.code));

    it('has no duplicate standard codes', () => {
      expect(codes.size).toBe(standardsOf(c).length);
    });

    it('declares every standard under the domain that owns it', () => {
      for (const d of c.domains) {
        for (const s of d.standards) expect(s.domainId).toBe(d.id);
      }
    });

    it('has no content referencing a standard outside this grade', () => {
      for (const code of c.source.allStandardsWithContent()) {
        expect(codes.has(code), `content references unknown standard ${code}`).toBe(true);
      }
    });

    it('covers every standard when the grade is marked content-complete', () => {
      // Gated deliberately: asserting coverage unconditionally would leave
      // the suite red from the moment a grade's standards exist until its
      // last template is written, and a permanently red suite gets ignored.
      if (!c.contentComplete) return;
      const withContent = new Set(c.source.allStandardsWithContent());
      for (const code of codes) {
        expect(withContent.has(code), `grade ${c.grade} has no content for ${code}`).toBe(true);
      }
    });
  },
);
