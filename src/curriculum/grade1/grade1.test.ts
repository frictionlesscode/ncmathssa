import { describe, it, expect } from 'vitest';
import { GRADE_1 } from './index';
import { getCurriculum, listCurricula, standardsOf, domainWeight } from '../registry';

describe('grade 1 curriculum', () => {
  it('is registered and reachable by grade number', () => {
    expect(getCurriculum(1)).toBe(GRADE_1);
    expect(listCurricula().map((c) => c.grade)).toContain(1);
  });

  it('declares the WCPSS passing bar and what mastery skips', () => {
    expect(GRADE_1.ssa.passingPercent).toBe(80);
    expect(GRADE_1.ssa.targetsGrade).toBe(1);
  });

  it('has no blueprint, the honest state for a grade below the EOG', () => {
    // NCDPI publishes EOG blueprints for grades 3-8 only; there is no state
    // assessment below grade 3 to weight against.
    expect(GRADE_1.weighting.kind).toBe('even-by-standard-count');
  });

  it('claims no official weight anywhere in its domain data', () => {
    for (const d of GRADE_1.domains) {
      expect(d.officialWeightRange).not.toMatch(/%/);
      expect(d.weightGroup).toBeUndefined();
    }
  });

  it('totals its domain weights to 100 through domainWeight', () => {
    const total = GRADE_1.domains.reduce((sum, d) => sum + domainWeight(GRADE_1, d.id), 0);
    expect(total).toBeGreaterThan(99);
    expect(total).toBeLessThan(101);
  });

  it('has content for all 23 standards', () => {
    // OA 8, NBT 7, MD 5, G 3 = 23.
    expect(standardsOf(GRADE_1).length).toBe(23);
    const withContent = new Set(GRADE_1.source.allStandardsWithContent());
    for (const s of standardsOf(GRADE_1)) {
      expect(withContent.has(s.code), `no content for ${s.code}`).toBe(true);
    }
    expect(GRADE_1.contentComplete).toBe(true);
  });

  it('ships templates on exactly the expected 14 standards (Controller ruling: generator floor)', () => {
    // Named explicitly, not merely counted: a floor like ">= 12" can lose two
    // generators and stay green. This pins the exact set so no generator can
    // silently vanish. NC.1.OA.3, OA.4, OA.7 and NC.1.MD.1 are deliberately
    // authored-only (rulings 22-5/22-6 and 24-2/24-3); NC.1.MD.5 and all
    // three Geometry standards are fully authored too.
    const expected = [
      'NC.1.OA.1', 'NC.1.OA.2', 'NC.1.OA.6', 'NC.1.OA.8', 'NC.1.OA.9',
      'NC.1.NBT.1', 'NC.1.NBT.2', 'NC.1.NBT.3', 'NC.1.NBT.4', 'NC.1.NBT.5', 'NC.1.NBT.6', 'NC.1.NBT.7',
      'NC.1.MD.2', 'NC.1.MD.4',
    ];
    const generated = standardsOf(GRADE_1)
      .filter((s) => GRADE_1.source.hasGenerator(s.code))
      .map((s) => s.code);
    expect([...generated].sort()).toEqual([...expected].sort());
  });

  it('ships every quiz item id under the grade-1 namespace', () => {
    // Ruling 26-1: the separator is a hyphen (`g1-oa1-01`), not a dot
    // (dots are reserved for template ids, which a quiz may never cite).
    expect(GRADE_1.quizzes.length).toBeGreaterThan(0);
    for (const q of GRADE_1.quizzes) {
      for (const id of q.questionIds) {
        expect(id.startsWith('g1-'), `quiz ${q.id} carries non-grade-1 item ${id}`).toBe(true);
      }
    }
  });

  it('references only AUTHORED item ids in its quizzes, never a template id (Ruling 26-6)', () => {
    const authoredIds = new Set(
      standardsOf(GRADE_1).flatMap((s) =>
        GRADE_1.source.authoredFor(s.code).map((r) => (r as { kind: 'authored'; id: string }).id),
      ),
    );
    for (const q of GRADE_1.quizzes) {
      for (const id of q.questionIds) {
        expect(authoredIds.has(id), `quiz ${q.id} references non-authored id ${id}`).toBe(true);
      }
    }
  });

  it('ships a diagnostic, a drill for every domain, and a mock assessment', () => {
    expect(GRADE_1.quizzes.filter((q) => q.isDiagnostic)).toHaveLength(1);
    expect(GRADE_1.quizzes.filter((q) => q.isMockAssessment)).toHaveLength(1);
    const drillDomains = GRADE_1.quizzes
      .filter((q) => !q.isDiagnostic && !q.isMockAssessment)
      .map((q) => q.domainId);
    expect([...drillDomains].sort()).toEqual(['G', 'MD', 'NBT', 'OA']);

    const diagnostic = GRADE_1.quizzes.find((q) => q.isDiagnostic)!;
    expect(diagnostic.questionIds).toHaveLength(standardsOf(GRADE_1).length);
    expect(diagnostic.timeLimitMinutes).toBe(30); // a first-grader's attention, not a fifth-grader's
    const mock = GRADE_1.quizzes.find((q) => q.isMockAssessment)!;
    expect(mock.timeLimitMinutes).toBeGreaterThan(0);
  });

  it('derives its diagnostic and mock subtitles from the curriculum, never a baked grade-1 literal', () => {
    const diagnostic = GRADE_1.quizzes.find((q) => q.isDiagnostic)!;
    const mock = GRADE_1.quizzes.find((q) => q.isMockAssessment)!;
    expect(typeof diagnostic.subtitle).toBe('function');
    expect(typeof mock.subtitle).toBe('function');
    const diagnosticText = (diagnostic.subtitle as (c: typeof GRADE_1) => string)(GRADE_1);
    const mockText = (mock.subtitle as (c: typeof GRADE_1) => string)(GRADE_1);
    expect(diagnosticText).toContain('23');
    expect(diagnosticText).toContain('Grade 1');
    expect(mockText).toContain('Grade 1');
    expect(mockText).toContain('80%');
    expect(diagnosticText).not.toMatch(/blueprint/i);
    expect(mockText).not.toMatch(/blueprint weight/i);
  });

  it("allocates the mock assessment to each domain's share of the 23 standards", () => {
    const mock = GRADE_1.quizzes.find((q) => q.isMockAssessment)!;
    const domainOfItem = new Map<string, string>();
    for (const s of standardsOf(GRADE_1)) {
      for (const ref of GRADE_1.source.authoredFor(s.code)) {
        domainOfItem.set((ref as { kind: 'authored'; id: string }).id, s.domainId);
      }
    }
    const counts: Record<string, number> = {};
    for (const id of mock.questionIds) {
      const d = domainOfItem.get(id)!;
      counts[d] = (counts[d] ?? 0) + 1;
    }
    expect(mock.questionIds.length).toBeGreaterThanOrEqual(18);
    expect(mock.questionIds.length).toBeLessThanOrEqual(23);
    expect(counts.G).toBeGreaterThan(0);

    for (const [domainId, n] of Object.entries(counts)) {
      const ideal = (domainWeight(GRADE_1, domainId) / 100) * mock.questionIds.length;
      expect(
        n >= Math.floor(ideal) && n <= Math.ceil(ideal),
        `${domainId} carries ${n} of ${mock.questionIds.length} items; its share wants ${ideal}`,
      ).toBe(true);
    }
  });

  it('does not re-score the diagnostic items in the simulation', () => {
    const diagnostic = new Set(GRADE_1.quizzes.find((q) => q.isDiagnostic)!.questionIds);
    const mock = GRADE_1.quizzes.find((q) => q.isMockAssessment)!;
    for (const id of mock.questionIds) {
      expect(diagnostic.has(id), `${id} appears in both the diagnostic and the simulation`).toBe(false);
    }
  });

  it('wires the study guides into the curriculum', () => {
    expect(Object.keys(GRADE_1.studyGuides)).toHaveLength(23);
  });

  it('completes the set: every grade from 1 to 5 is now playable', () => {
    const grades = listCurricula().map((c) => c.grade);
    expect(grades).toEqual([1, 2, 3, 4, 5]);
    for (const c of listCurricula()) {
      expect(c.contentComplete, `grade ${c.grade} is registered but incomplete`).toBe(true);
    }
  });
});
