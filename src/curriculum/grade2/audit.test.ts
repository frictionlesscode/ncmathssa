import { describe, it, expect } from 'vitest';
import { GRADE_2_AUTHORED } from './authored';
import { MISCONCEPTIONS } from '../misconceptions';

// Regression tests for docs/superpowers/audits/2026-09-30/content-g2.md.

const item = (id: string) => GRADE_2_AUTHORED.find((q) => q.id === id)!;
const tagOf = (id: string, text: string) => item(id).options.find((o) => o.text === text)?.misconception;

describe('content-g2 audit: authored odd/even and equal-groups items', () => {
  it('High g2-oa3-04: option A (6 + 8) is tagged for unequal addends, B (6 + 6 = 12) for a false sum', () => {
    expect(tagOf('g2-oa3-04', '6 + 8 = 14')).toBe('split-into-unequal-groups-and-called-them-equal');
    expect(tagOf('g2-oa3-04', '6 + 6 = 12')).toBe('wrote-equal-addends-with-the-wrong-total');
    // The registry text of the old tag on A was about PAIRS; the new ones must say what they mean.
    expect(MISCONCEPTIONS['split-into-unequal-groups-and-called-them-equal'].description).toMatch(/not the same size/i);
    expect(MISCONCEPTIONS['wrote-equal-addends-with-the-wrong-total'].description).toMatch(/not the number the question asked/i);
  });

  it('High g2-oa3-03: "Yes, 10 and 8" is tagged for unequal groups, not for miscounting pairs', () => {
    expect(tagOf('g2-oa3-03', 'Yes — 10 buttons in one group and 8 in the other.')).toBe(
      'split-into-unequal-groups-and-called-them-equal',
    );
  });

  it('Medium g2-oa3-01/02/03: every option answers the question that was asked', () => {
    // The old distractors "16 crayons", "6 pairs" and "18 buttons" were not
    // answers to "odd or even?" or "yes or no?", so they were ruled out by form.
    for (const id of ['g2-oa3-01', 'g2-oa3-02']) {
      for (const o of item(id).options) expect(o.text, `${id}: ${o.text}`).toMatch(/^(Odd|Even), because /);
    }
    for (const o of item('g2-oa3-03').options) expect(o.text, o.text).toMatch(/^(Yes|No) — /);
    for (const id of ['g2-oa3-01', 'g2-oa3-02', 'g2-oa3-03']) expect(item(id).contentVersion, id).toBe(2);
  });

  it('Medium g2-nbt4-04: each option is one short clause', () => {
    for (const o of item('g2-nbt4-04').options) {
      expect(o.text.length, o.text).toBeLessThanOrEqual(62);
      expect((o.text.match(/because/g) ?? []).length, `${o.text}: one reason, no second clause`).toBe(1);
    }
    expect(item('g2-nbt4-04').explanation.stepByStep.at(-1)).toContain(
      item('g2-nbt4-04').options.find((o) => o.isCorrect)!.text,
    );
    expect(item('g2-nbt4-04').contentVersion).toBe(2);
  });

  it('Medium g2-g3-04: the key is one short clause, and the last step still quotes it', () => {
    const q = item('g2-g3-04');
    const key = q.options.find((o) => o.isCorrect)!.text;
    expect(key.length).toBeLessThanOrEqual(70);
    expect(key).not.toMatch(/even though the two pizzas/);
    expect(q.explanation.stepByStep.at(-1)).toContain(key);
    expect(q.contentVersion).toBe(2);
  });

  it('Low g2-oa1-04: the explanation does not invent a friend the story never mentions', () => {
    const q = item('g2-oa1-04');
    expect(JSON.stringify(q.explanation)).not.toMatch(/friend/i);
  });

  it('Low g2-nbt8-04: the misconception names what was swapped', () => {
    expect(item('g2-nbt8-04').explanation.commonMisconception).toMatch(/swapped/);
    expect(item('g2-nbt8-04').explanation.commonMisconception).not.toMatch(/applied to the tens/);
  });
});
