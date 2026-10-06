import { describe, it, expect } from 'vitest';
import { GRADE_2 } from './index';
import { getCurriculum, listCurricula, standardsOf, domainWeight } from '../registry';

describe('grade 2 curriculum', () => {
  it('is registered and reachable by grade number', () => {
    expect(getCurriculum(2)).toBe(GRADE_2);
    expect(listCurricula().map((c) => c.grade)).toContain(2);
  });

  it('declares the WCPSS passing bar and what mastery skips', () => {
    expect(GRADE_2.ssa.passingPercent).toBe(80);
    expect(GRADE_2.ssa.targetsGrade).toBe(2);
  });

  it('has no blueprint, the honest state for a grade below the EOG', () => {
    // NCDPI publishes EOG blueprints for grades 3-8 only; there is no state
    // assessment below grade 3 to weight against.
    expect(GRADE_2.weighting.kind).toBe('even-by-standard-count');
  });

  it('claims no official weight anywhere in its domain data', () => {
    for (const d of GRADE_2.domains) {
      expect(d.officialWeightRange).not.toMatch(/%/);
      expect(d.weightGroup).toBeUndefined();
    }
  });

  it('totals its domain weights to 100 through domainWeight', () => {
    // Also checked generically over every registered curriculum in
    // ../integrity.test.ts. Repeated here deliberately (Ruling 16-5/16-6,
    // the Grade 3/4/5 precedent) so a Grade 2 defect can be diagnosed from
    // this one file rather than from a parameterised failure that names a
    // grade but not a cause.
    const total = GRADE_2.domains.reduce((sum, d) => sum + domainWeight(GRADE_2, d.id), 0);
    expect(total).toBeGreaterThan(99);
    expect(total).toBeLessThan(101);
  });

  it('has content for all 23 standards', () => {
    // The 23-standard count (OA 4, NBT 8, MD 9, G 2) is this grade's own
    // claim and exists nowhere else; the coverage loop below duplicates
    // ../integrity.test.ts's content-complete check, kept here for the same
    // diagnostic reason.
    expect(standardsOf(GRADE_2).length).toBe(23);
    const withContent = new Set(GRADE_2.source.allStandardsWithContent());
    for (const s of standardsOf(GRADE_2)) {
      expect(withContent.has(s.code), `no content for ${s.code}`).toBe(true);
    }
    expect(GRADE_2.contentComplete).toBe(true);
  });

  it('generates a renewable practice pool for most of the grade', () => {
    // Authored-only standards repeat; generated ones never do. A grade where
    // most standards are authored-only is the repetitive quiz the owner asked
    // us to fix, so this is a floor, not a nicety.
    const generated = standardsOf(GRADE_2).filter((s) => GRADE_2.source.hasGenerator(s.code));
    expect(generated.length).toBeGreaterThanOrEqual(10);
  });

  it('ships a diagnostic, a drill for every domain, and a mock assessment', () => {
    // The flags matter as much as the ids: Dashboard finds the diagnostic
    // and the simulation by `isDiagnostic`/`isMockAssessment`, and any UI
    // that filters by domain cannot tell a drill from a comprehensive quiz
    // without `domainId` (Ruling 21-5 - both fields are optional to the
    // compiler, so omitting one is silent).
    expect(GRADE_2.quizzes.filter((q) => q.isDiagnostic)).toHaveLength(1);
    expect(GRADE_2.quizzes.filter((q) => q.isMockAssessment)).toHaveLength(1);
    const drillDomains = GRADE_2.quizzes
      .filter((q) => !q.isDiagnostic && !q.isMockAssessment)
      .map((q) => q.domainId);
    expect([...drillDomains].sort()).toEqual(['G', 'MD', 'NBT', 'OA']);

    const diagnostic = GRADE_2.quizzes.find((q) => q.isDiagnostic)!;
    expect(diagnostic.questionIds).toHaveLength(standardsOf(GRADE_2).length);
    expect(diagnostic.timeLimitMinutes).toBeGreaterThan(0);
    const mock = GRADE_2.quizzes.find((q) => q.isMockAssessment)!;
    expect(mock.timeLimitMinutes).toBeGreaterThan(0);
  });

  it('derives its diagnostic and mock subtitles from the curriculum, never a baked grade-2 literal', () => {
    // Ruling F11 / 21-5: a subtitle must be a function of the active
    // curriculum so it cannot silently keep citing this grade's own numbers
    // if the definition were ever copied to another grade.
    const diagnostic = GRADE_2.quizzes.find((q) => q.isDiagnostic)!;
    const mock = GRADE_2.quizzes.find((q) => q.isMockAssessment)!;
    expect(typeof diagnostic.subtitle).toBe('function');
    expect(typeof mock.subtitle).toBe('function');
    const diagnosticText = (diagnostic.subtitle as (c: typeof GRADE_2) => string)(GRADE_2);
    const mockText = (mock.subtitle as (c: typeof GRADE_2) => string)(GRADE_2);
    expect(diagnosticText).toContain('23');
    expect(diagnosticText).toContain('Grade 2');
    expect(mockText).toContain('Grade 2');
    expect(mockText).toContain('80%');
    // And it must not claim a blueprint that does not exist.
    expect(diagnosticText).not.toMatch(/blueprint/i);
    expect(mockText).not.toMatch(/blueprint weight/i);
  });

  it('allocates the mock assessment to each domain\'s share of the 23 standards', () => {
    // 25 items x each domain's share through domainWeight() (Ruling 21-6):
    // OA 4/23 -> 4.3 -> 4, NBT 8/23 -> 8.7 -> 9, MD 9/23 -> 9.8 -> 10,
    // G 2/23 -> 2.2 -> 2. Geometry never rounds to zero. 4+9+10+2 = 25.
    const mock = GRADE_2.quizzes.find((q) => q.isMockAssessment)!;
    const domainOfItem = new Map<string, string>();
    for (const s of standardsOf(GRADE_2)) {
      for (const ref of GRADE_2.source.authoredFor(s.code)) {
        domainOfItem.set((ref as { kind: 'authored'; id: string }).id, s.domainId);
      }
    }
    const counts: Record<string, number> = {};
    for (const id of mock.questionIds) {
      const d = domainOfItem.get(id)!;
      counts[d] = (counts[d] ?? 0) + 1;
    }
    expect(mock.questionIds).toHaveLength(25);
    expect(counts).toEqual({ OA: 4, NBT: 9, MD: 10, G: 2 });
    expect(counts.G).toBeGreaterThan(0);

    // Asserted as "one of the two roundings of the ideal", matching the
    // Grade 3/4 precedent: floor/ceil is exact integer arithmetic and still
    // rejects e.g. G=0 or G=3.
    for (const [domainId, n] of Object.entries(counts)) {
      const ideal = (domainWeight(GRADE_2, domainId) / 100) * 25;
      expect(
        n >= Math.floor(ideal) && n <= Math.ceil(ideal),
        `${domainId} carries ${n} of 25 items; its share wants ${ideal}`,
      ).toBe(true);
    }
  });

  it('does not re-score the diagnostic items in the simulation', () => {
    const diagnostic = new Set(GRADE_2.quizzes.find((q) => q.isDiagnostic)!.questionIds);
    const mock = GRADE_2.quizzes.find((q) => q.isMockAssessment)!;
    for (const id of mock.questionIds) {
      expect(diagnostic.has(id), `${id} appears in both the diagnostic and the simulation`)
        .toBe(false);
    }
  });

  it("serves its own quizzes, not another grade's", () => {
    // The separator is a HYPHEN: every shipped Grade 2 item id is
    // `g2-oa1-01` form (Ruling 21-2), not `g2.oa1-01`. Template ids do use
    // dots (`g2.oa1.change-unknown`), but a quiz may only cite authored
    // items.
    expect(GRADE_2.quizzes.length).toBeGreaterThan(0);
    for (const q of GRADE_2.quizzes) {
      for (const id of q.questionIds) {
        expect(id.startsWith('g2-'), `quiz ${q.id} carries non-grade-2 item ${id}`).toBe(true);
      }
    }
  });

  it('wires the study guides written in task 20 into the curriculum', () => {
    // They were authored a task before registration and were unreachable by
    // the app until this module referenced them.
    expect(Object.keys(GRADE_2.studyGuides)).toHaveLength(23);
  });
});
