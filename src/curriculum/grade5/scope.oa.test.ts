import { describe, it, expect } from 'vitest';
import { byId, keyText, optionFor, operationCount } from './scope.testkit';
import { GRADE_5_STUDY_GUIDES } from './studyGuides';
import { GRADE_5_STANDARDS } from './standards';

const OA2_IDS = ['oa2-01', 'oa2-02', 'oa2-03', 'oa2-04'];

/** Every expression an OA.2 item shows a child: each line of promptDetails
 *  (minus a "Label:" prefix) and each option. */
function expressionsOf(id: string): string[] {
  const q = byId(id);
  const lines = (q.promptDetails ?? '').split('\n').map((l) => l.replace(/^[^:]*:\s*/, ''));
  return [...lines, ...q.options.map((o) => o.text)];
}

describe('OA.2 stays inside NC-R1 (parentheses only, at most two operations)', () => {
  it.each(OA2_IDS)('%s: NC-R1 no expression has more than two operations or a bracket', (id) => {
    for (const expr of expressionsOf(id)) {
      expect(operationCount(expr), `${id}: "${expr}"`).toBeLessThanOrEqual(2);
      expect(expr, `${id}: NC-R1 parentheses only`).not.toMatch(/[[\]{}]/);
    }
  });

  it('oa2-01: NC-R1 6 × (12 - 4), key and distractors follow their tags', () => {
    expect(byId('oa2-01').promptDetails).toBe('6 × (12 - 4)');
    expect(keyText('oa2-01')).toBe(String(6 * (12 - 4)));
    expect(optionFor('oa2-01', 'ignored-grouping-symbols')).toBe(String(6 * 12 - 4));
    expect(optionFor('oa2-01', 'forgot-the-final-step')).toBe(String(12 - 4));
    expect(optionFor('oa2-01', 'added-instead-of-multiplied')).toBe(String(6 + 12 - 4));
  });

  it('oa2-02: NC-R1 (32 - 8) ÷ 6 is the key and the four options have four different values', () => {
    expect(keyText('oa2-02')).toBe('(32 - 8) ÷ 6');
    expect(optionFor('oa2-02', 'ignored-grouping-symbols')).toBe('32 - 8 ÷ 6');
    expect(optionFor('oa2-02', 'reversed-the-subtraction')).toBe('(8 - 32) ÷ 6');
    expect(optionFor('oa2-02', 'misgrouped-the-subtraction')).toBe('32 ÷ (8 - 6)');
    const values = [(32 - 8) / 6, 32 - 8 / 6, (8 - 32) / 6, 32 / (8 - 6)];
    expect(new Set(values).size).toBe(4);
    expect(byId('oa2-02').prompt).toContain('Subtract 8 from 32, then divide the difference by 6');
  });

  it('oa2-03: NC-R1 5 × (1.5 + 0.75), key and distractors follow their tags', () => {
    const q = byId('oa2-03');
    expect(q.promptDetails).toBe('5 × (1.5 + 0.75)');
    expect(keyText('oa2-03')).toBe(String(5 * (1.5 + 0.75)));
    expect(optionFor('oa2-03', 'ignored-grouping-symbols')).toBe(String(5 * 1.5 + 0.75));
    expect(optionFor('oa2-03', 'forgot-the-final-step')).toBe(String(1.5 + 0.75));
    expect(optionFor('oa2-03', 'added-instead-of-multiplied')).toBe(String(5 + 1.5 + 0.75));
    // The item now sits inside NC scope, so it must not wear the above-grade badge.
    expect(q.isStretch).toBe(false);
  });

  it('OA.2 study guide: NC-R1 the worked example has two operations and its true answer', () => {
    const ex = GRADE_5_STUDY_GUIDES['NC.5.OA.2'].workedExample;
    expect(operationCount(ex.problem)).toBeLessThanOrEqual(2);
    expect(ex.problem).toContain('48 ÷ (10 - 4)');
    expect(ex.answer).toBe(String(48 / (10 - 4)));
  });

  it('OA.2 standard: NC-R1 the first keyConcept states the two-operation limit', () => {
    const oa2 = GRADE_5_STANDARDS.find((s) => s.code === 'NC.5.OA.2')!;
    expect(oa2.keyConcepts[0]).toMatch(/at most two operations/);
  });
});

describe('OA.3 wording (audit Medium)', () => {
  it('oa3-03: reading level has no "slope", and 48 ÷ 6 is calculator-off', () => {
    const q = byId('oa3-03');
    expect(q.explanation.conceptSummary).not.toMatch(/slope/i);
    expect(q.calculatorAllowed).toBe(false);
  });

  it('oa3-02: commonMisconception names an error, not a study tip', () => {
    const text = byId('oa3-02').explanation.commonMisconception ?? '';
    expect(text).not.toMatch(/unnecessary time/);
    expect(text).toContain('35 + 10 = 45');
  });

  it('OA.3 study guide: whyItMatters makes no 6th-grade or y = kx claim', () => {
    const why = GRADE_5_STUDY_GUIDES['NC.5.OA.3'].workedExample.whyItMattersForSSA;
    expect(why).not.toMatch(/6th grade|y = kx/);
  });
});

describe('OA content versions', () => {
  it('rewritten OA.2 items carry contentVersion 2; untouched OA items do not', () => {
    for (const id of ['oa2-01', 'oa2-02', 'oa2-03']) expect(byId(id).contentVersion, id).toBe(2);
    for (const id of ['oa2-04', 'oa3-01', 'oa3-02', 'oa3-03']) {
      expect(byId(id).contentVersion ?? 1, id).toBe(1);
    }
  });
});
