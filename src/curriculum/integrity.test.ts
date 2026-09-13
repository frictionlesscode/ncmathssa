import { describe, it, expect } from 'vitest';
import { listCurricula, standardsOf, domainWeight } from './registry';

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

    it('defines quizzes that only reference this grade\'s own questions', () => {
      const ids = new Set(
        standardsOf(c).flatMap((s) =>
          c.source.authoredFor(s.code).map((r) => (r as { kind: 'authored'; id: string }).id),
        ),
      );
      for (const quiz of c.quizzes) {
        for (const qid of quiz.questionIds) {
          expect(ids.has(qid), `quiz ${quiz.id} references unknown question ${qid}`).toBe(true);
        }
      }
    });

    it('gives every grade at least a diagnostic', () => {
      expect(c.quizzes.some((q) => q.isDiagnostic), `grade ${c.grade} has no diagnostic`).toBe(true);
    });

    it('keys every study guide to a standard of this grade', () => {
      for (const [code, guide] of Object.entries(c.studyGuides)) {
        expect(codes.has(code), `study guide ${code} is not a grade ${c.grade} standard`).toBe(true);
        expect(guide.standardCode, `study guide ${code} disagrees with its own key`).toBe(code);
      }
    });

    it('writes a study guide for every standard when content-complete', () => {
      if (!c.contentComplete) return;
      for (const code of codes) {
        expect(c.studyGuides[code], `grade ${c.grade} has no study guide for ${code}`).toBeTruthy();
      }
    });

    it('totals every domain weight to 100', () => {
      const total = c.domains.reduce((sum, d) => sum + domainWeight(c, d.id), 0);
      expect(total).toBeGreaterThan(99);
      expect(total).toBeLessThan(101);
    });

    it('cites one shared band across every member of a weight group', () => {
      const groups = new Map<string, typeof c.domains>();
      for (const d of c.domains) {
        if (!d.weightGroup) continue;
        groups.set(d.weightGroup, [...(groups.get(d.weightGroup) ?? []), d]);
      }
      for (const [group, members] of groups) {
        expect(members.length, `weight group ${group} has one member`).toBeGreaterThan(1);
        const ranges = new Set(members.map((d) => d.officialWeightRange));
        expect(ranges.size, `weight group ${group} cites ${ranges.size} different bands`).toBe(1);
        for (const d of members) {
          expect(d.weightGroupLabel, `${d.id} is grouped but unlabelled`).toBeTruthy();
        }
      }
    });

    it('claims no official blueprint below grade 3', () => {
      // NCDPI publishes no EOG, and therefore no blueprint, for grades 1-2.
      if (c.grade >= 3) return;
      expect(c.weighting.kind).toBe('even-by-standard-count');
      for (const d of c.domains) {
        expect(d.weightGroup, `grade ${c.grade} domain ${d.id} claims a blueprint band`).toBeUndefined();
      }
    });
  },
);
