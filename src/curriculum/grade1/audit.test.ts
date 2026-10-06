import { describe, it, expect } from 'vitest';
import { GRADE_1 } from './index';
import { GRADE_1_AUTHORED } from './authored';
import { GRADE_1_STUDY_GUIDES } from './studyGuides';
import { standardsOf } from '../registry';

// Regression tests for docs/superpowers/audits/2026-09-30/content-g1.md.
// One test per finding, named after it.

const item = (id: string) => GRADE_1_AUTHORED.find((q) => q.id === id)!;
const texts = (id: string) => item(id).options.map((o) => o.text);
const guide = (code: string) => JSON.stringify(GRADE_1_STUDY_GUIDES[code]);

describe('content-g1 audit: authored items', () => {
  it('High g1-g2-02: no wrong option is true by subset (a square is a rectangle)', () => {
    const q = item('g1-g2-02');
    expect(q.prompt).toMatch(/triangle and a square/);
    for (const o of q.options.filter((x) => !x.isCorrect)) {
      expect(o.text, o.text).not.toMatch(/rectangle/i);
    }
    expect(q.contentVersion).toBe(2);
  });

  it('High g1-md5-03: the explanation makes no false claim about 25 or coin sizes', () => {
    const q = item('g1-md5-03');
    const blob = `${q.explanation.conceptSummary} ${q.explanation.commonMisconception}`;
    expect(blob).not.toMatch(/more than five times/i);
    expect(blob).not.toMatch(/similar in size/i);
    expect(blob).toMatch(/exactly five times/i);
  });

  it('Medium g1-g3-02: no option contradicts the stem, which says the 4 pieces are equal', () => {
    expect(texts('g1-g3-02').join(' | ')).not.toMatch(/even though one piece is bigger/i);
    expect(item('g1-g3-02').contentVersion).toBe(2);
  });

  it('Medium g1-g3-04: "Four fourths" is not offered as a wrong answer for a whole cut in two', () => {
    expect(texts('g1-g3-04')).not.toContain('Four fourths');
    expect(texts('g1-g3-04')).toContain('Two halves');
    expect(item('g1-g3-04').contentVersion).toBe(2);
  });

  it('Medium g1-nbt5-02: 10 more stays a two-digit number', () => {
    const q = item('g1-nbt5-02');
    expect(Number(q.options.find((o) => o.isCorrect)!.text)).toBeLessThan(100);
    expect(q.explanation.stepByStep.join(' ')).not.toMatch(/hundred/i);
    expect(q.contentVersion).toBe(2);
  });
});

describe('content-g1 audit: the practice test covers every standard', () => {
  const mock = GRADE_1.quizzes.find((q) => q.isMockAssessment)!;
  const standardOf = new Map<string, string>();
  for (const q of GRADE_1_AUTHORED) standardOf.set(q.id, q.standardCode);

  it('Medium g1-mock-ssa-01: every one of the 23 standards is on the form, once', () => {
    const codes = mock.questionIds.map((id) => standardOf.get(id)!);
    expect(codes.slice().sort()).toEqual(standardsOf(GRADE_1).map((s) => s.code).sort());
    expect(mock.questionIds).toHaveLength(23);
  });

  it('Medium g1-md2-02: the abstract stretch item is not on the form', () => {
    expect(mock.questionIds).not.toContain('g1-md2-02');
    const stretch = mock.questionIds.filter((id) => item(id).difficulty === 'stretch');
    expect(stretch).toEqual([]);
  });
});

describe('content-g1 audit: study guides', () => {
  it('High NBT.1: 129 to 130 is a ten, and only 99 to 100 crosses into the hundreds', () => {
    const g = GRADE_1_STUDY_GUIDES['NC.1.NBT.1'];
    expect(g.coreConcept).not.toMatch(/new hundred \(99 to 100, or 129 to 130\)/);
    expect(g.coreConcept).toMatch(/129 to 130 crosses a ten/);
    const rule = g.rulesAndFormulas.find((r) => /hundreds/i.test(r.label))!;
    expect(rule.detail).toMatch(/129 comes 130, which crosses a ten/);
    expect(g.workedExample.whyItMattersForSSA).not.toMatch(/past 99 and past 129/);
  });

  it('Medium NBT.5: the guide no longer teaches 10 more crossing into a hundred', () => {
    expect(guide('NC.1.NBT.5')).not.toMatch(/104|new hundred|new, brand-new hundred/i);
  });

  it('Medium NBT.4: the guide no longer points at a 9-tens-to-hundred trade', () => {
    expect(guide('NC.1.NBT.4')).not.toMatch(/9 tens|new hundred|hundred trade/i);
  });

  it('Low MD.3: a digital clock has no hour hand', () => {
    expect(guide('NC.1.MD.3')).not.toMatch(/or a digital one/);
  });

  it('Low NBT.4: no forward claim to a later grade (the file rule 3)', () => {
    expect(guide('NC.1.NBT.4')).not.toMatch(/later grade/);
  });

  it('Low G.1: the rhombus is not among the NC.1.G.1 shapes', () => {
    expect(JSON.stringify(GRADE_1_STUDY_GUIDES['NC.1.G.1'].workedExample)).not.toMatch(/rhombus/i);
  });

  it('Low OA.2: "always totals 20 or less" is scoped to this standard', () => {
    expect(guide('NC.1.OA.2')).not.toMatch(/always totals 20 or less/);
  });
});
