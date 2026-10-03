import { describe, it, expect } from 'vitest';
import { GRADE_4 } from './index';
import { GRADE_4_AUTHORED } from './authored';
import { GRADE_4_STUDY_GUIDES } from './studyGuides';
import { standardsOf } from '../registry';

// Regression tests for docs/superpowers/audits/2026-09-30/content-g4.md.

const item = (id: string) => GRADE_4_AUTHORED.find((q) => q.id === id)!;
const key = (id: string) => item(id).options.find((o) => o.isCorrect)!.text;

describe('content-g4 audit: authored items', () => {
  it('Medium g4-oa5-04: the stem asks for one rule that keeps working, so the list of steps is not an answer', () => {
    const q = item('g4-oa5-04');
    expect(q.prompt).toMatch(/single rule/);
    expect(q.prompt).toMatch(/keep working after 192/);
    expect(q.options.find((o) => /then add 36/.test(o.text))!.isCorrect).toBe(false);
    expect(q.contentVersion).toBe(2);
  });

  it('Low-Medium g4-oa3-04: Grade 4 uses no grouping symbols (they are NC.5.OA.2)', () => {
    const q = item('g4-oa3-04');
    for (const o of q.options) expect(o.text, o.text).not.toMatch(/[()]/);
    expect(key('g4-oa3-04')).toBe('m + 27 = n and n ÷ 6 = 14');
    // 6 teams of 14 is 84 members after joining, so the club started with 57.
    expect(6 * 14 - 27).toBe(57);
    expect(GRADE_4_STUDY_GUIDES['NC.4.OA.3'].rulesAndFormulas.map((r) => r.detail).join(' ')).not.toMatch(/Grouping matters/);
    expect(q.contentVersion).toBe(2);
  });

  it('Medium: the key is not the uniquely longest option in the six items the audit named', () => {
    for (const id of ['g4-nf1-03', 'g4-nf2-02', 'g4-nf2-04', 'g4-nf7-05', 'g4-md1-03', 'g4-g3-01']) {
      const others = item(id).options.filter((o) => !o.isCorrect).map((o) => o.text.length);
      expect(key(id).length, `${id}: key ${key(id).length} vs ${others.join(', ')}`).toBeLessThanOrEqual(Math.max(...others));
      // and the last worked step still quotes the (new) key
      expect(item(id).explanation.stepByStep.at(-1), id).toContain(key(id));
      expect(item(id).contentVersion, id).toBe(2);
    }
  });

  it('Low md6-02 and the protractor trap: no "supplement" in a Grade 4 explanation', () => {
    expect(item('g4-md6-02').explanation.commonMisconception).not.toMatch(/supplement/i);
    expect(JSON.stringify(GRADE_4_STUDY_GUIDES['NC.4.MD.6'])).not.toMatch(/supplement/i);
  });

  it('Low g4-nbt2-01: the stem quotes the number name instead of the clumsy "the number name"', () => {
    expect(item('g4-nbt2-01').prompt).toBe('Which numeral is "forty thousand, ninety-three"?');
  });
});

describe('content-g4 audit: study guides', () => {
  it('Low NBT.4: does not claim how the EOG is assessed', () => {
    expect(GRADE_4_STUDY_GUIDES['NC.4.NBT.4'].workedExample.whyItMattersForSSA).not.toMatch(/much of it is assessed/);
  });
});

describe('content-g4 audit: the check-up is one item per standard, by design', () => {
  // Medium in the audit: the diagnostic's domain mix is NF 24% / MD+G 36%
  // against a blueprint of 32% / 25%. It is deliberately unweighted: it exists
  // to give every standard a first reading, and nothing computes a weighted
  // score from it (overallReadiness weights per standard from mastery, and the
  // path reads the check-up per domain). This test pins the design.
  it('Medium: exactly one item per standard, so every standard gets a first reading', () => {
    const diagnostic = GRADE_4.quizzes.find((q) => q.isDiagnostic)!;
    const standardOf = new Map(GRADE_4_AUTHORED.map((q) => [q.id, q.standardCode]));
    const codes = diagnostic.questionIds.map((id) => standardOf.get(id)!);
    expect(codes.slice().sort()).toEqual(standardsOf(GRADE_4).map((s) => s.code).sort());
  });
});
