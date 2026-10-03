import { describe, it, expect } from 'vitest';
import { byId, keyText, optionFor, denominatorsIn, inOneFamily } from './scope.testkit';
import { GRADE_5_STUDY_GUIDES } from './studyGuides';
import { GRADE_5_STANDARDS } from './standards';

const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b));

/** n/d as a simplified mixed number: 35/8 gives "4 3/8". */
function mixed(n: number, d: number): string {
  const g = gcd(n, d);
  const num = n / g;
  const den = d / g;
  const whole = Math.floor(num / den);
  const rem = num % den;
  if (rem === 0) return `${whole}`;
  return whole === 0 ? `${rem}/${den}` : `${whole} ${rem}/${den}`;
}

/** n/d as a simplified fraction, left improper: 18/8 gives "9/4". */
function fraction(n: number, d: number): string {
  const g = gcd(n, d);
  return d / g === 1 ? `${n / g}` : `${n / g}/${d / g}`;
}

/** True when a fraction or mixed-number option text is in simplest form. */
function inSimplestForm(text: string): boolean {
  const m = /(\d+)\/(\d+)/.exec(text);
  if (!m) return true;
  return gcd(Number(m[1]), Number(m[2])) === 1 && Number(m[1]) < Number(m[2]);
}

describe('NF.1 (NC-R6 related fractions)', () => {
  it('nf1-01: NC-R6 2 3/4 + 1 5/8 stays in halves/fourths/eighths; key and distractors follow their tags', () => {
    const q = byId('nf1-01');
    expect(q.promptDetails).toBe('2 3/4 + 1 5/8');
    // 2 3/4 = 22/8 and 1 5/8 = 13/8, so the sum is 35/8.
    expect(keyText('nf1-01')).toBe(mixed(22 + 13, 8));
    // (3 + 5)/(4 + 8) = 8/12, wholes 2 + 1.
    expect(optionFor('nf1-01', 'added-numerators-and-denominators')).toBe(mixed(3 * 12 + 8, 12));
    // Denominator changed to 8, numerator 3 left alone: 3/8 + 5/8 = 8/8.
    expect(optionFor('nf1-01', 'common-denominator-numerator-not-scaled')).toBe(mixed(3 * 8 + 8, 8));
    // Doubled the numerator of the fraction already in eighths: (3 + 10)/8.
    expect(optionFor('nf1-01', 'scaled-the-wrong-addend')).toBe(mixed(3 * 8 + 13, 8));
  });

  it('nf1-02: NC-R6 6 1/4 - 2 5/8 stays in one family; key and distractors follow their tags', () => {
    const q = byId('nf1-02');
    expect(q.promptDetails).toBe('6 1/4 - 2 5/8');
    // 6 1/4 = 50/8 and 2 5/8 = 21/8.
    expect(keyText('nf1-02')).toBe(mixed(50 - 21, 8));
    // No regrouping: 6 - 2 and 5/8 - 2/8.
    expect(optionFor('nf1-02', 'forgot-to-regroup')).toBe(mixed(4 * 8 + 3, 8));
    // 6 1/8 - 2 5/8 (1/4 written as 1/8): 49/8 - 21/8.
    expect(optionFor('nf1-02', 'common-denominator-numerator-not-scaled')).toBe(mixed(49 - 21, 8));
    // Regrouped to 6 10/8 without lowering the 6: 58/8 - 21/8.
    expect(optionFor('nf1-02', 'borrowed-without-reducing-the-whole')).toBe(mixed(58 - 21, 8));
  });

  it('nf1-04: NC-R6 7/12 + 5/6 estimate, and no option is the exact sum (audit nf1-04)', () => {
    const q = byId('nf1-04');
    expect(q.prompt).toContain('7/12 + 5/6');
    expect(keyText('nf1-04')).toBe('1 1/2');
    // Rounded one addend to the wrong benchmark: 1/2 + 1/2 and 1 + 1.
    const wrongBenchmark = q.options
      .filter((o) => o.misconception === 'estimated-to-the-wrong-benchmark')
      .map((o) => o.text)
      .sort();
    expect(wrongBenchmark).toEqual(['1', '2']);
    // Added straight across: (7 + 5)/(12 + 6).
    expect(optionFor('nf1-04', 'added-numerators-and-denominators')).toBe(fraction(7 + 5, 12 + 6));
    // 7/12 + 5/6 = 17/12 exactly; offering it would make a second defensible answer.
    const exactSum = mixed(7 + 10, 12);
    expect(q.options.map((o) => o.text)).not.toContain(exactSum);
  });

  it.each(['nf1-01', 'nf1-02', 'nf1-03', 'nf1-04'])(
    '%s: NC-R6 every denominator sits in one related family',
    (id) => {
      const q = byId(id);
      // The benchmark list "(0, 1/2, 1)" in nf1-04 names the benchmarks, not an addend.
      const benchmarks = /\(0, 1\/2, 1\)/;
      if (id === 'nf1-04') expect(q.prompt).toMatch(benchmarks);
      const dens = denominatorsIn(`${q.prompt.replace(benchmarks, '')} ${q.promptDetails ?? ''}`);
      expect(dens.length).toBeGreaterThan(0);
      expect(inOneFamily(dens), `${id}: ${dens.join(', ')}`).toBe(true);
    },
  );

  it.each(['nf1-01', 'nf1-02', 'nf1-04'])('%s: every fraction option is in simplest form', (id) => {
    for (const o of byId(id).options) expect(inSimplestForm(o.text), `${id}: ${o.text}`).toBe(true);
  });

  it('NF.1 study guide and standard: NC-R6 related denominators, no unsupported ranking claim', () => {
    const guide = GRADE_5_STUDY_GUIDES['NC.5.NF.1'];
    expect(inOneFamily(denominatorsIn(guide.workedExample.problem))).toBe(true);
    const text = JSON.stringify(guide);
    expect(text).not.toMatch(/#1|LCM is 12|for 4 and 6/);
    expect(text).toContain('Related Denominators');
    const std = GRADE_5_STANDARDS.find((s) => s.code === 'NC.5.NF.1')!;
    expect(std.keyConcepts[0]).toMatch(/Related denominators/);
  });
});

describe('NF.4 (NC-R7 denominators 2, 3, 4 for fraction × fraction)', () => {
  it('nf4-03: NC-R7 3/4 × 2/3, key and distractors follow their tags', () => {
    const q = byId('nf4-03');
    expect(q.prompt).toContain('3/4 × 2/3');
    expect(keyText('nf4-03')).toBe(fraction(3 * 2, 4 * 3));
    expect(optionFor('nf4-03', 'added-numerators-and-denominators')).toBe(fraction(3 + 2, 4 + 3));
    // Numerator of each times the denominator of the other: (3 × 3)/(4 × 2).
    expect(optionFor('nf4-03', 'multiplied-crosswise')).toBe(fraction(3 * 3, 4 * 2));
    // Common denominator 12 and added: 9/12 + 8/12.
    expect(optionFor('nf4-03', 'added-instead-of-multiplied')).toBe(fraction(9 + 8, 12));
  });

  it('NC-R7: fraction × fraction items use only denominators 2, 3, 4', () => {
    for (const id of ['nf4-01', 'nf4-03']) {
      const q = byId(id);
      const dens = denominatorsIn(`${q.prompt} ${q.promptDetails ?? ''}`);
      for (const d of dens) expect([2, 3, 4], `${id}: denominator ${d}`).toContain(d);
    }
  });

  it('nf4-02: NC-R7 fraction × whole number uses 7/8, an allowed denominator', () => {
    const q = byId('nf4-02');
    expect(JSON.stringify(q)).not.toContain('7/9');
    expect(q.prompt).toContain('16 × 7/8');
    for (const d of denominatorsIn(q.prompt)) expect([2, 3, 4, 5, 6, 8, 10, 12]).toContain(d);
  });

  it('NF.4 standard: NC-R7 states the denominator limits', () => {
    const std = GRADE_5_STANDARDS.find((s) => s.code === 'NC.5.NF.4')!;
    expect(std.keyConcepts.join(' ')).toMatch(/denominators 2, 3 and 4/);
  });
});

describe('NF.7 (NC-R8 one step, unit fractions only)', () => {
  it('nf7-03: NC-R8 5 ÷ 1/6 word problem, key and distractors follow their tags', () => {
    const q = byId('nf7-03');
    expect(q.prompt).not.toMatch(/Above-Grade|\[/);
    // Every fraction in the prompt is a unit fraction.
    for (const m of q.prompt.matchAll(/(\d+)\/\d+/g)) expect(m[1]).toBe('1');
    expect(q.prompt).toContain('5 yards');
    expect(q.prompt).toContain('1/6 yard');
    expect(keyText('nf7-03')).toBe(`${5 * 6} pieces`);
    // Found how many fit in 1 yard and never scaled to 5 yards.
    expect(optionFor('nf7-03', 'forgot-to-scale-by-the-whole-number')).toBe('6 pieces');
    // 5 × 1/6.
    expect(optionFor('nf7-03', 'multiplied-instead-of-divided')).toBe(`${fraction(5, 6)} of a piece`);
    // (1/6) ÷ 5.
    expect(optionFor('nf7-03', 'inverted-wrong-factor')).toBe(`${fraction(1, 6 * 5)} of a piece`);
    expect(JSON.stringify(q.explanation)).not.toMatch(/6th grade|reciprocal/i);
    expect(q.isStretch).toBe(false);
  });
});

describe('NF content versions', () => {
  it('rewritten NF items carry contentVersion 2; untouched NF items do not', () => {
    for (const id of ['nf1-01', 'nf1-02', 'nf1-04', 'nf4-02', 'nf4-03', 'nf7-03']) {
      expect(byId(id).contentVersion, id).toBe(2);
    }
    for (const id of ['nf1-03', 'nf3-01', 'nf3-02', 'nf4-01', 'nf7-01', 'nf7-02']) {
      expect(byId(id).contentVersion ?? 1, id).toBe(1);
    }
  });
});
