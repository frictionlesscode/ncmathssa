import { describe, it, expect } from 'vitest';
import { GRADE_4 } from './index';
import { getCurriculum, listCurricula, standardsOf, domainWeight } from '../registry';

describe('grade 4 curriculum', () => {
  it('is registered and reachable by grade number', () => {
    expect(getCurriculum(4)).toBe(GRADE_4);
    expect(listCurricula().map((c) => c.grade)).toContain(4);
  });

  it('declares the WCPSS passing bar and what mastery skips', () => {
    expect(GRADE_4.ssa.passingPercent).toBe(80);
    expect(GRADE_4.ssa.targetsGrade).toBe(4);
  });

  it('cites the NCDPI blueprint, which exists at grade 4', () => {
    expect(GRADE_4.weighting.kind).toBe('ncdpi-blueprint');
  });

  it('totals its domain weights to 100 through domainWeight', () => {
    // Also checked generically over every registered curriculum in
    // ../integrity.test.ts. Repeated here deliberately (Ruling 11.3) so a
    // Grade 4 defect can be diagnosed from this one file rather than from a
    // parameterised failure that names a grade but not a cause.
    const total = GRADE_4.domains.reduce((sum, d) => sum + domainWeight(GRADE_4, d.id), 0);
    expect(total).toBeGreaterThan(99);
    expect(total).toBeLessThan(101);
  });

  it('has content for all 25 standards', () => {
    // The 25-standard count is this grade's own claim and exists nowhere
    // else; the coverage loop below duplicates ../integrity.test.ts's
    // content-complete check, kept here for the same diagnostic reason.
    expect(standardsOf(GRADE_4).length).toBe(25);
    const withContent = new Set(GRADE_4.source.allStandardsWithContent());
    for (const s of standardsOf(GRADE_4)) {
      expect(withContent.has(s.code), `no content for ${s.code}`).toBe(true);
    }
    expect(GRADE_4.contentComplete).toBe(true);
  });

  it('generates a renewable practice pool for most of the grade', () => {
    // Authored-only standards repeat; generated ones never do. A grade where
    // most standards are authored-only is the repetitive quiz the owner asked
    // us to fix, so this is a floor, not a nicety.
    const generated = standardsOf(GRADE_4).filter((s) => GRADE_4.source.hasGenerator(s.code));
    expect(generated.length).toBeGreaterThanOrEqual(12);
  });

  it('ships a diagnostic, a drill for every domain, and a mock assessment', () => {
    // The flags matter as much as the ids: Dashboard finds the diagnostic
    // and the simulation by `isDiagnostic`/`isMockAssessment`, and any UI
    // that filters by domain cannot tell a drill from a comprehensive quiz
    // without `domainId`.
    expect(GRADE_4.quizzes.filter((q) => q.isDiagnostic)).toHaveLength(1);
    expect(GRADE_4.quizzes.filter((q) => q.isMockAssessment)).toHaveLength(1);
    const drillDomains = GRADE_4.quizzes
      .filter((q) => !q.isDiagnostic && !q.isMockAssessment)
      .map((q) => q.domainId);
    expect([...drillDomains].sort()).toEqual(['G', 'MD', 'NBT', 'NF', 'OA']);

    const diagnostic = GRADE_4.quizzes.find((q) => q.isDiagnostic)!;
    expect(diagnostic.questionIds).toHaveLength(standardsOf(GRADE_4).length);
  });

  it('allocates the mock assessment to the blueprint bands', () => {
    // 30 items x each domain's share through domainWeight(), rounded to whole
    // items: OA 16% -> 5, NBT 27% -> 8, NF 32% -> 10, and the shared MD+G
    // 23-27% band -> 7, itself split 5/2 by standard count (MD holds 6 of the
    // group's 9 standards, G holds 3). Never summed from raw midpoints: MD and
    // G each carry 25, which would total 125.
    const mock = GRADE_4.quizzes.find((q) => q.isMockAssessment)!;
    const domainOfItem = new Map<string, string>();
    for (const s of standardsOf(GRADE_4)) {
      for (const ref of GRADE_4.source.authoredFor(s.code)) {
        domainOfItem.set((ref as { kind: 'authored'; id: string }).id, s.domainId);
      }
    }
    const counts: Record<string, number> = {};
    for (const id of mock.questionIds) {
      const d = domainOfItem.get(id)!;
      counts[d] = (counts[d] ?? 0) + 1;
    }
    expect(mock.questionIds).toHaveLength(30);
    expect(counts).toEqual({ OA: 5, NBT: 8, NF: 10, MD: 5, G: 2 });

    for (const [domainId, n] of Object.entries(counts)) {
      const expected = (domainWeight(GRADE_4, domainId as never) / 100) * 30;
      expect(Math.abs(n - expected), `${domainId} carries ${n} of 30 items, band wants ${expected}`)
        .toBeLessThanOrEqual(0.5);
    }
  });

  it("serves its own quizzes, not grade 5's", () => {
    // The separator is a HYPHEN: every committed Grade 4 item id is
    // `g4-nf1-01` form (Ruling 11.1). Template ids do use dots
    // (`g4.oa1.times-as-many`), but a quiz may only cite authored items.
    expect(GRADE_4.quizzes.length).toBeGreaterThan(0);
    for (const q of GRADE_4.quizzes) {
      for (const id of q.questionIds) {
        expect(id.startsWith('g4-'), `quiz ${q.id} carries non-grade-4 item ${id}`).toBe(true);
      }
    }
  });
});
