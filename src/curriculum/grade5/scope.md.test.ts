import { describe, it, expect } from 'vitest';
import { GRADE_5_DOMAINS, GRADE_5_STANDARDS } from './standards';
import { byId, keyText, optionFor } from './scope.testkit';
import { GRADE_5_STUDY_GUIDES } from './studyGuides';

describe('MD.1 (NC-R9 one conversion step from a given chart)', () => {
  it('md1-02: NC-R9 7 quarts at 4 cups each, key and distractors follow their tags', () => {
    const q = byId('md1-02');
    expect(q.prompt).toContain('7 quarts');
    expect(q.promptDetails).toBe('Conversion chart: 1 quart = 4 cups');
    expect((q.promptDetails ?? '').match(/=/g)).toHaveLength(1);
    expect(keyText('md1-02')).toBe(`${7 * 4} bowls`);
    // 7 ÷ 4 = 1.75 = 1 3/4: converted the wrong way.
    expect(7 / 4).toBe(1.75);
    expect(optionFor('md1-02', 'unit-conversion-inverted')).toBe('1 3/4 bowls');
    // Used 2 cups per quart (the pint factor).
    expect(optionFor('md1-02', 'used-wrong-conversion-factor')).toBe(`${7 * 2} bowls`);
    // Chained a second doubling that the chart never asked for.
    expect(optionFor('md1-02', 'applied-an-extra-conversion-step')).toBe(`${7 * 4 * 2} bowls`);
    // The audit's "320 bowls" did not follow its tag.
    expect(JSON.stringify(q)).not.toContain('320');
  });

  it('md1-03: NC-R9 one conversion inside a two-step problem, key and distractors follow their tags', () => {
    const q = byId('md1-03');
    expect(q.promptDetails).toBe('Conversion chart: 1 foot = 12 inches');
    expect((q.promptDetails ?? '').match(/=/g)).toHaveLength(1);
    expect(q.prompt).toContain('4 feet');
    expect(q.prompt).toContain('15 inches');
    expect(keyText('md1-03')).toBe(`${4 * 12 - 15} inches`);
    expect(optionFor('md1-03', 'added-instead-of-subtracted')).toBe(`${4 * 12 + 15} inches`);
    // Subtracted 4 from 15 without converting feet to inches.
    expect(optionFor('md1-03', 'left-the-measurement-unconverted')).toBe(`${15 - 4} inches`);
    // Used 10 inches per foot.
    expect(optionFor('md1-03', 'used-wrong-conversion-factor')).toBe(`${4 * 10 - 15} inches`);
    expect(q.isStretch).toBe(false);
  });

  it('MD.1 study guide: NC-R9 the worked example is one step from a chart', () => {
    const ex = GRADE_5_STUDY_GUIDES['NC.5.MD.1'].workedExample;
    expect(ex.problem).toContain('1 quart = 4 cups');
    expect(ex.answer).toBe(`${6 * 4} cups`);
    expect(ex.whyItMattersForSSA).not.toMatch(/almost always/);
    const std = GRADE_5_STANDARDS.find((s) => s.code === 'NC.5.MD.1')!;
    expect(std.keyConcepts[0]).toMatch(/conversion chart/);
  });
});

describe('MD.2 (NC-R5 line graphs, data over time, kinds of data)', () => {
  it('md2-01: NC-R5 reads the change on a line graph, key and distractors follow their tags', () => {
    const q = byId('md2-01');
    expect(q.prompt).toContain('line graph');
    expect(q.prompt).not.toMatch(/line plot/i);
    expect(keyText('md2-01')).toBe(`${18 - 7} cm`);
    // Read the Week 5 point instead of the change.
    expect(optionFor('md2-01', 'reported-the-measurement-not-the-total')).toBe('18 cm');
    expect(optionFor('md2-01', 'added-instead-of-subtracted')).toBe(`${18 + 7} cm`);
    // Subtracted the weeks (5 - 2) instead of the heights.
    expect(optionFor('md2-01', 'used-the-wrong-given-quantity')).toBe(`${5 - 2} cm`);
    // The weekly growth from Week 2 to Week 5 adds up to the same change.
    expect(11 - 7 + (12 - 11) + (18 - 12)).toBe(18 - 7);
  });

  it('md2-01: the point list is short enough to read in monospace on a phone', () => {
    const lines = (byId('md2-01').promptDetails ?? '').split('\n');
    expect(lines).toHaveLength(5);
    for (const line of lines) expect(line.length, line).toBeLessThanOrEqual(20);
  });

  it('md2-02: NC-R5 picks the survey question that gives data over time', () => {
    const q = byId('md2-02');
    expect(q.prompt).toContain('changes over time');
    expect(keyText('md2-02')).toBe('How many minutes did you read each night this week?');
    const wrong = q.options.filter((o) => !o.isCorrect);
    expect(wrong).toHaveLength(3);
    for (const o of wrong) expect(o.misconception).toBe('confused-the-kind-of-data');
    expect(JSON.stringify(q)).not.toMatch(/line plot/i);
  });

  it('MD.2 standard, guide and domain: NC-R5 no fractional line plots and no "average"', () => {
    const std = GRADE_5_STANDARDS.find((s) => s.code === 'NC.5.MD.2')!;
    const md = GRADE_5_DOMAINS.find((d) => d.id === 'MD')!;
    const guide = GRADE_5_STUDY_GUIDES['NC.5.MD.2'];
    expect(std.title).toContain('Line Graphs');
    expect(JSON.stringify(std)).not.toMatch(/line plots?/i);
    expect(md.description).not.toMatch(/line plots?/i);
    expect(JSON.stringify(guide)).not.toMatch(/line plots?|average/i);
    expect(guide.title).toContain('Line Graphs');
  });
});

describe('MD.5 (NC-R10 one-digit dimensions in a composed solid)', () => {
  it('md5-03: NC-R10 every dimension is at most 9, key and distractors follow their tags', () => {
    const q = byId('md5-03');
    const dims = [...q.prompt.matchAll(/(\d+) inches/g)].map((m) => Number(m[1]));
    expect(dims).toEqual([9, 6, 4, 8, 6, 7]);
    for (const d of dims) expect(d, `dimension ${d}`).toBeLessThanOrEqual(9);
    expect(keyText('md5-03')).toBe(`${9 * 6 * 4 + 8 * 6 * 7} cubic inches`);
    // Prism 1 only.
    expect(optionFor('md5-03', 'omitted-one-part-of-composite')).toBe(`${9 * 6 * 4} cubic inches`);
    // Added every dimension.
    expect(optionFor('md5-03', 'used-perimeter-formula')).toBe(`${9 + 6 + 4 + 8 + 6 + 7} cubic inches`);
    // Multiplied every dimension together.
    expect(optionFor('md5-03', 'multiplied-all-dimensions-together')).toBe(
      `${(9 * 6 * 4 * 8 * 6 * 7).toLocaleString('en-US')} cubic inches`,
    );
    expect(q.isStretch).toBe(false);
  });
});

describe('MD content versions', () => {
  it('rewritten MD items carry contentVersion 2; untouched MD items do not', () => {
    for (const id of ['md1-02', 'md1-03', 'md2-01', 'md2-02', 'md5-03']) {
      expect(byId(id).contentVersion, id).toBe(2);
    }
    for (const id of ['md1-01', 'md4-01', 'md5-01', 'md5-02']) {
      expect(byId(id).contentVersion ?? 1, id).toBe(1);
    }
  });
});
