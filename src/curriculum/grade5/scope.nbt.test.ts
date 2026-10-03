import { describe, it, expect } from 'vitest';
import { GRADE_5_AUTHORED } from './authored';
import { byId, keyText, optionFor } from './scope.testkit';
import { GRADE_5_STUDY_GUIDES } from './studyGuides';
import { GRADE_5_STANDARDS } from './standards';

const nbt7 = GRADE_5_AUTHORED.filter((q) => q.standardCode === 'NC.5.NBT.7');

describe('NBT.1 (NC-R4)', () => {
  it('nbt1-02: NC-R4 divides by 100, not by 10^3, and prints no exponent', () => {
    const q = byId('nbt1-02');
    expect(q.promptDetails).toBe('47.62 ÷ 100');
    expect(JSON.stringify(q)).not.toContain('^');
    // 47.62 ÷ 100 moves the decimal 2 places left.
    expect(keyText('nbt1-02')).toBe('0.4762');
    // Multiplied by 100 instead: 4,762.
    expect(optionFor('nbt1-02', 'place-value-shift-wrong-direction')).toBe('4,762');
    const wrongPower = q.options
      .filter((o) => o.misconception === 'wrong-power-of-ten')
      .map((o) => o.text)
      .sort();
    // One place (4.762) and three places (0.04762).
    expect(wrongPower).toEqual(['0.04762', '4.762']);
  });

  it('NBT.1 standard and study guide: NC-R4 no exponent notation, divide by 10 and 100 only', () => {
    const std = GRADE_5_STANDARDS.find((s) => s.code === 'NC.5.NBT.1')!;
    const guide = GRADE_5_STUDY_GUIDES['NC.5.NBT.1'];
    expect(JSON.stringify(std)).not.toContain('^');
    expect(JSON.stringify(guide)).not.toContain('^');
    expect(std.keyConcepts.join(' ')).toMatch(/Dividing by 10 or 100/);
    expect(guide.rulesAndFormulas.map((r) => r.label)).toContain('Multiplying by 0.1 or 0.01');
    expect(guide.workedExample.whyItMattersForSSA).not.toMatch(/calculator-inactive/i);
  });
});

describe('NBT.7 (NC-R3)', () => {
  it('nbt7-04: NC-R3 divides a whole number by a decimal, 6 ÷ 0.25', () => {
    const q = byId('nbt7-04');
    expect(q.prompt).toContain('6 meters');
    expect(q.prompt).toContain('0.25 meter');
    expect(keyText('nbt7-04')).toBe(`${6 / 0.25} bows`);
    // Shifted the divisor to 25 but left the dividend at 6.
    expect(optionFor('nbt7-04', 'decimal-point-misplaced')).toBe(`${6 / 25} bows`);
    // Shifted the divisor one place (2.5) instead of two.
    expect(optionFor('nbt7-04', 'wrong-power-of-ten')).toBe(`${6 / 2.5} bows`);
    // Multiplied instead of dividing.
    expect(optionFor('nbt7-04', 'multiplied-instead-of-divided')).toBe(`${6 * 0.25} bows`);
    expect(q.isStretch).toBe(false);
  });

  it('NC-R3: no NBT.7 item divides a decimal by a decimal', () => {
    for (const q of nbt7) {
      const text = `${q.prompt} ${q.promptDetails ?? ''}`;
      expect(text, q.id).not.toMatch(/\d\.\d+\s*÷\s*\d*\.\d+/);
    }
  });

  it('NBT.7 study guide and standard: NC-R3 whole ÷ decimal and decimal ÷ whole only', () => {
    const guide = GRADE_5_STUDY_GUIDES['NC.5.NBT.7'];
    const std = GRADE_5_STANDARDS.find((s) => s.code === 'NC.5.NBT.7')!;
    const guideText = JSON.stringify(guide);
    expect(guideText).toMatch(/whole number by a decimal/);
    expect(guideText).not.toMatch(/Divisor must be whole|decimal by a decimal/);
    expect(JSON.stringify(std)).toMatch(/repeated subtraction or area models/);
    expect(JSON.stringify(std)).not.toMatch(/shift decimal in divisor/);
  });

  it('nbt7-01: the misconception text describes the distractor it names (audit Low)', () => {
    const text = byId('nbt7-01').explanation.commonMisconception ?? '';
    expect(text).toContain('67.25');
    expect(text).not.toContain('.85');
    // 80.40 - 27.65 taking the smaller digit from the larger in every column.
    expect(optionFor('nbt7-01', 'subtracted-without-regrouping')).toBe('67.25');
  });
});

describe('NBT content versions', () => {
  it('rewritten NBT items carry contentVersion 2; untouched NBT items do not', () => {
    for (const id of ['nbt1-02', 'nbt7-04']) expect(byId(id).contentVersion, id).toBe(2);
    for (const id of ['nbt1-01', 'nbt1-03', 'nbt3-02', 'nbt7-01', 'nbt7-02', 'nbt7-03']) {
      expect(byId(id).contentVersion ?? 1, id).toBe(1);
    }
  });
});
