import { describe, it, expect } from 'vitest';
import { GRADE_5_AUTHORED } from './authored';
import { byId, keyText, optionFor } from './scope.testkit';
import { GRADE_5_STUDY_GUIDES } from './studyGuides';

describe('G.3 (NC-R11 sides, angles and symmetry only)', () => {
  it('g3-03: NC-R11 names the rhombus from sides and angles, key and distractors follow their tags', () => {
    const q = byId('g3-03');
    expect(q.prompt).toContain('4 sides that are all equal in length (12 cm)');
    expect(q.prompt).toContain('2 pairs of parallel sides');
    expect(q.prompt).toContain('none of its angles are right angles');
    expect(keyText('g3-03')).toBe('Rhombus');
    expect(optionFor('g3-03', 'ignored-a-constraint')).toBe('Square');
    expect(optionFor('g3-03', 'named-a-broader-category')).toBe('Parallelogram');
    expect(optionFor('g3-03', 'classified-by-one-property-only')).toBe('Rectangle');
    expect(q.isStretch).toBe(false);
  });

  it('NC-R11: no G.3 question or guide text mentions diagonals or kites', () => {
    const g3 = GRADE_5_AUTHORED.filter((q) => q.standardCode === 'NC.5.G.3');
    for (const q of g3) expect(JSON.stringify(q), q.id).not.toMatch(/diagonal|kite/i);
    expect(JSON.stringify(GRADE_5_STUDY_GUIDES['NC.5.G.3'])).not.toMatch(/diagonal|kite/i);
  });

  it('g3-03 carries contentVersion 2; g3-01 is untouched', () => {
    expect(byId('g3-03').contentVersion).toBe(2);
    expect(byId('g3-01').contentVersion ?? 1).toBe(1);
  });
});
