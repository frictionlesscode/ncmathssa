import { describe, it, expect } from 'vitest';
import { GRADE_3 } from './index';
import { getCurriculum, listCurricula, standardsOf, domainWeight } from '../registry';

describe('grade 3 curriculum', () => {
  it('is registered and reachable by grade number', () => {
    expect(getCurriculum(3)).toBe(GRADE_3);
    expect(listCurricula().map((c) => c.grade)).toContain(3);
  });

  it('declares the WCPSS passing bar and what mastery skips', () => {
    expect(GRADE_3.ssa.passingPercent).toBe(80);
    expect(GRADE_3.ssa.targetsGrade).toBe(3);
  });

  it('cites the NCDPI blueprint, the lowest grade that has one', () => {
    expect(GRADE_3.weighting.kind).toBe('ncdpi-blueprint');
  });

  it('totals its domain weights to 100 through domainWeight', () => {
    // Also checked generically over every registered curriculum in
    // ../integrity.test.ts. Repeated here deliberately (Ruling 16-5/16-6,
    // the Grade 4/5 precedent) so a Grade 3 defect can be diagnosed from
    // this one file rather than from a parameterised failure that names a
    // grade but not a cause.
    const total = GRADE_3.domains.reduce((sum, d) => sum + domainWeight(GRADE_3, d.id), 0);
    expect(total).toBeGreaterThan(99);
    expect(total).toBeLessThan(101);
  });

  it('has content for all 20 standards', () => {
    // The 20-standard count is this grade's own claim and exists nowhere
    // else; the coverage loop below duplicates ../integrity.test.ts's
    // content-complete check, kept here for the same diagnostic reason.
    expect(standardsOf(GRADE_3).length).toBe(20);
    const withContent = new Set(GRADE_3.source.allStandardsWithContent());
    for (const s of standardsOf(GRADE_3)) {
      expect(withContent.has(s.code), `no content for ${s.code}`).toBe(true);
    }
    expect(GRADE_3.contentComplete).toBe(true);
  });

  it('generates a renewable practice pool for most of the grade', () => {
    // Authored-only standards repeat; generated ones never do. A grade where
    // most standards are authored-only is the repetitive quiz the owner asked
    // us to fix, so this is a floor, not a nicety.
    const generated = standardsOf(GRADE_3).filter((s) => GRADE_3.source.hasGenerator(s.code));
    expect(generated.length).toBeGreaterThanOrEqual(10);
  });

  it('ships a diagnostic, a drill for every domain, and a mock assessment', () => {
    // The flags matter as much as the ids: Dashboard finds the diagnostic
    // and the simulation by `isDiagnostic`/`isMockAssessment`, and any UI
    // that filters by domain cannot tell a drill from a comprehensive quiz
    // without `domainId` (Ruling 16-4 - all three fields are optional to
    // the compiler, so omitting one is silent).
    expect(GRADE_3.quizzes.filter((q) => q.isDiagnostic)).toHaveLength(1);
    expect(GRADE_3.quizzes.filter((q) => q.isMockAssessment)).toHaveLength(1);
    const drillDomains = GRADE_3.quizzes
      .filter((q) => !q.isDiagnostic && !q.isMockAssessment)
      .map((q) => q.domainId);
    expect([...drillDomains].sort()).toEqual(['G', 'MD', 'NBT', 'NF', 'OA']);

    const diagnostic = GRADE_3.quizzes.find((q) => q.isDiagnostic)!;
    expect(diagnostic.questionIds).toHaveLength(standardsOf(GRADE_3).length);
    expect(diagnostic.timeLimitMinutes).toBeGreaterThan(0);
    expect(GRADE_3.quizzes.find((q) => q.isMockAssessment)!.timeLimitMinutes).toBeGreaterThan(0);
  });

  it('allocates the mock assessment to the blueprint bands', () => {
    // 28 items x each domain's share through domainWeight(), rounded to whole
    // items (Ruling 16-3): OA 34% -> 9.52 -> 10, NBT 11% -> 3.08 -> 3,
    // NF 30% -> 8.4 -> 8, and the shared MD+G 23-27% band -> 7.0, itself
    // split by standard count into MD 6.0 and G 1.0 (MD holds 6 of the
    // group's 7 standards, G holds 1). Never summed from raw midpoints: MD
    // and G each carry 25, which with OA 34 + NF 30 + NBT 11 totals 125.
    const mock = GRADE_3.quizzes.find((q) => q.isMockAssessment)!;
    const domainOfItem = new Map<string, string>();
    for (const s of standardsOf(GRADE_3)) {
      for (const ref of GRADE_3.source.authoredFor(s.code)) {
        domainOfItem.set((ref as { kind: 'authored'; id: string }).id, s.domainId);
      }
    }
    const counts: Record<string, number> = {};
    for (const id of mock.questionIds) {
      const d = domainOfItem.get(id)!;
      counts[d] = (counts[d] ?? 0) + 1;
    }
    expect(mock.questionIds).toHaveLength(28);
    expect(counts).toEqual({ OA: 10, NBT: 3, NF: 8, MD: 6, G: 1 });

    // Asserted as "one of the two roundings of the ideal", not as a distance
    // under a tolerance, matching the Grade 4 precedent: floor/ceil is exact
    // integer arithmetic and still rejects NF=7 or OA=9.
    for (const [domainId, n] of Object.entries(counts)) {
      const ideal = (domainWeight(GRADE_3, domainId as never) / 100) * 28;
      expect(
        n >= Math.floor(ideal) && n <= Math.ceil(ideal),
        `${domainId} carries ${n} of 28 items; its band wants ${ideal}`,
      ).toBe(true);
    }
  });

  it('does not re-score the diagnostic items in the simulation', () => {
    // A child who has just sat the baseline should meet fresh items in the
    // simulation, not the ones that set the baseline. Grade 4 holds the
    // same separation.
    const diagnostic = new Set(GRADE_3.quizzes.find((q) => q.isDiagnostic)!.questionIds);
    const mock = GRADE_3.quizzes.find((q) => q.isMockAssessment)!;
    for (const id of mock.questionIds) {
      expect(diagnostic.has(id), `${id} appears in both the diagnostic and the simulation`)
        .toBe(false);
    }
  });

  it("serves its own quizzes, not another grade's", () => {
    // The separator is a HYPHEN: every shipped Grade 3 item id is
    // `g3-oa1-01` form (Ruling 16-1 / 12-8). Template ids do use dots
    // (`g3.oa1.equal-groups-array`), but a quiz may only cite authored items.
    expect(GRADE_3.quizzes.length).toBeGreaterThan(0);
    for (const q of GRADE_3.quizzes) {
      for (const id of q.questionIds) {
        expect(id.startsWith('g3-'), `quiz ${q.id} carries non-grade-3 item ${id}`).toBe(true);
      }
    }
  });

  it('wires the study guides written in task 15 into the curriculum', () => {
    // They were authored a task before registration and were unreachable by
    // the app until this module referenced them.
    expect(Object.keys(GRADE_3.studyGuides)).toHaveLength(20);
  });
});
