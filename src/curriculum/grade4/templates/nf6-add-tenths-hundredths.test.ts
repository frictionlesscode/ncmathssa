import { describe, it, expect } from 'vitest';
import { assertTemplateSound } from '../../../engine/templateTesting';
import { makeRng } from '../../../engine/rng';
import { nf6AddTenthsHundredths } from './nf6-add-tenths-hundredths';

const valueOf = (text: string): number => {
  const [n, d] = text.split('/').map(Number);
  return n / d;
};

describe('g4.nf6.add-tenths-hundredths', () => {
  it('is sound at every seed', () => {
    assertTemplateSound(nf6AddTenthsHundredths);
  });

  it('is deterministic in its seed', () => {
    expect(nf6AddTenthsHundredths.generate(makeRng(17))).toEqual(
      nf6AddTenthsHundredths.generate(makeRng(17)),
    );
  });

  it('the key really is the sum, written in hundredths', () => {
    for (let seed = 0; seed < 300; seed++) {
      const g = nf6AddTenthsHundredths.generate(makeRng(seed));
      const [left, right] = g.promptDetails!.split(' + ');
      const a = Number(left.split('/')[0]);
      const b = Number(right.split('/')[0]);
      expect(left.split('/')[1], `seed ${seed}`).toBe('10');
      expect(right.split('/')[1], `seed ${seed}`).toBe('100');
      expect(a, `seed ${seed}`).toBeGreaterThanOrEqual(1);
      expect(b, `seed ${seed}`).toBeGreaterThanOrEqual(1);
      expect(a, `seed ${seed}: a === b would collide two options`).not.toBe(b);
      expect(g.answerText, `seed ${seed}`).toBe(`${10 * a + b}/100`);
      expect(valueOf(g.answerText), `seed ${seed}`).toBeCloseTo(a / 10 + b / 100, 12);
    }
  });

  it('no two options name the same quantity', () => {
    for (let seed = 0; seed < 300; seed++) {
      const g = nf6AddTenthsHundredths.generate(makeRng(seed));
      const values = g.options.map((o) => valueOf(o.text));
      for (let i = 0; i < values.length; i++) {
        for (let j = i + 1; j < values.length; j++) {
          expect(
            Math.abs(values[i] - values[j]),
            `seed ${seed}: ${g.options[i].text} and ${g.options[j].text}`,
          ).toBeGreaterThan(1e-9);
        }
      }
    }
  });

  it('keeps every number it prints inside Grade 4', () => {
    for (let seed = 0; seed < 300; seed++) {
      const g = nf6AddTenthsHundredths.generate(makeRng(seed));
      const shown = [g.prompt, g.promptDetails!, ...g.options.map((o) => o.text),
        ...g.explanation.stepByStep, g.explanation.conceptSummary].join(' ');
      for (const numeral of shown.match(/\d+/g) ?? []) {
        // 110 is the denominator of the added-straight-across distractor.
        expect(Number(numeral), `seed ${seed}: ${numeral}`).toBeLessThanOrEqual(110);
      }
    }
  });

  describe('every distractor is the value its tag names', () => {
    for (const seed of [6, 120, 4321, 88888, 202020]) {
      it(`seed ${seed}`, () => {
        const g = nf6AddTenthsHundredths.generate(makeRng(seed));
        const [left, right] = g.promptDetails!.split(' + ');
        const a = Number(left.split('/')[0]);
        const b = Number(right.split('/')[0]);
        const tagged = (tag: string) => g.options.find((o) => o.misconception === tag)!.text;

        expect(tagged('added-numerators-and-denominators')).toBe(`${a + b}/110`);
        expect(tagged('common-denominator-numerator-not-scaled')).toBe(`${a + b}/100`);
        expect(tagged('scaled-the-wrong-addend')).toBe(`${a + 10 * b}/100`);
      });
    }
  });

  it('sweeps its whole parameter space without a collision', () => {
    // (a, b) in 1..9 x 1..9 is the entire space; only the option shuffle is
    // left to the seed, and that cannot change what the options say.
    let inRange = 0;
    let barred = 0;
    const failures: string[] = [];
    for (let a = 1; a <= 9; a++) {
      for (let b = 1; b <= 9; b++) {
        inRange++;
        const values = [(10 * a + b) / 100, (a + b) / 110, (a + b) / 100, (a + 10 * b) / 100];
        const collides = new Set(values.map((v) => v.toFixed(12))).size !== 4;
        const where = `a=${a} b=${b}`;
        if (a === b) {
          barred++;
          if (!collides) failures.push(`barred but sound: ${where}`);
          continue;
        }
        if (collides) failures.push(`collision: ${where}`);
        if (10 * a + b > 99 || a + 10 * b > 99) failures.push(`out of range: ${where}`);
      }
    }
    expect(failures.slice(0, 5)).toEqual([]);
    expect(inRange).toBe(81);
    expect(inRange - barred).toBe(72);
    expect(barred).toBe(9);
  });

  it('reaches every admissible parameter pair across seeds', () => {
    const seen = new Set<string>();
    for (let seed = 0; seed < 4000; seed++) {
      const g = nf6AddTenthsHundredths.generate(makeRng(seed));
      const [left, right] = g.promptDetails!.split(' + ');
      seen.add(`${left.split('/')[0]},${right.split('/')[0]}`);
    }
    // The deterministic nudge that keeps a !== b must not leave a hole in the
    // space it maps onto.
    expect(seen.size).toBe(72);
  });
});
