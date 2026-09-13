import { describe, it, expect } from 'vitest';
import { assertTemplateSound } from '../../../engine/templateTesting';
import { makeRng } from '../../../engine/rng';
import { nf4MultiplyByWhole, admissibleProducts } from './nf4-multiply-by-whole';

const DENOMINATORS = [2, 3, 4, 5, 6, 8, 10, 12];

/** Parses "7/8" and "3 1/4" alike, so an option cannot slip past the
 *  same-quantity check by being written in the other form. */
const valueOf = (text: string): number => {
  const parts = text.split(' ');
  const [n, d] = parts[parts.length - 1].split('/').map(Number);
  return (parts.length === 2 ? Number(parts[0]) : 0) + n / d;
};

describe('g4.nf4.multiply-by-whole', () => {
  it('is sound at every seed', () => {
    assertTemplateSound(nf4MultiplyByWhole);
  });

  it('is deterministic in its seed', () => {
    expect(nf4MultiplyByWhole.generate(makeRng(13))).toEqual(
      nf4MultiplyByWhole.generate(makeRng(13)),
    );
  });

  it('the fraction is always less than one and the key is the product', () => {
    for (let seed = 0; seed < 300; seed++) {
      const g = nf4MultiplyByWhole.generate(makeRng(seed));
      const [whole, frac] = g.promptDetails!.split(' × ');
      const w = Number(whole);
      const [n, d] = frac.split('/').map(Number);
      // NC.4.NF.4 stops at "any fraction less than one".
      expect(n, `seed ${seed}`).toBeLessThan(d);
      expect(w, `seed ${seed}`).toBeGreaterThanOrEqual(2);
      expect(g.answerText, `seed ${seed}`).toBe(`${w * n}/${d}`);
    }
  });

  it('no two options name the same quantity', () => {
    for (let seed = 0; seed < 300; seed++) {
      const g = nf4MultiplyByWhole.generate(makeRng(seed));
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
      const g = nf4MultiplyByWhole.generate(makeRng(seed));
      const shown = [g.prompt, g.promptDetails!, ...g.options.map((o) => o.text),
        ...g.explanation.stepByStep, g.explanation.conceptSummary].join(' ');
      for (const numeral of shown.match(/\d+/g) ?? []) {
        // 72 is 6 × 12, the largest denominator the scaled-denominator
        // distractor can reach.
        expect(Number(numeral), `seed ${seed}: ${numeral}`).toBeLessThanOrEqual(72);
      }
    }
  });

  describe('every distractor is the value its tag names', () => {
    for (const seed of [2, 99, 5000, 70707, 313131]) {
      it(`seed ${seed}`, () => {
        const g = nf4MultiplyByWhole.generate(makeRng(seed));
        const [whole, frac] = g.promptDetails!.split(' × ');
        const w = Number(whole);
        const [n, d] = frac.split('/').map(Number);
        const tagged = (tag: string) => g.options.find((o) => o.misconception === tag)!.text;

        expect(tagged('multiplied-the-denominator-too')).toBe(`${w * n}/${w * d}`);
        expect(tagged('wrote-the-product-as-a-mixed-number')).toBe(`${w} ${n}/${d}`);
        expect(tagged('added-instead-of-multiplied')).toBe(`${w + n}/${d}`);

        // The scaled-denominator option is the ORIGINAL fraction rewritten,
        // which is exactly why an option tagged
        // forgot-to-scale-by-the-whole-number could never join it here.
        expect(valueOf(tagged('multiplied-the-denominator-too'))).toBeCloseTo(n / d, 10);
      });
    }
  });

  it('sweeps its whole parameter space without a collision', () => {
    // (w, n, d) is the entire space; only the option shuffle is left to the
    // seed, and that cannot change what the options say.
    const admissible = new Set(admissibleProducts().map(([w, n, d]) => `${w},${n},${d}`));
    let inRange = 0;
    let barred = 0;
    const failures: string[] = [];
    for (let w = 2; w <= 6; w++) {
      for (const d of DENOMINATORS) {
        for (let n = 1; n <= d - 1; n++) {
          inRange++;
          const values = [(w * n) / d, (w * n) / (w * d), w + n / d, (w + n) / d];
          const collides = new Set(values.map((v) => v.toFixed(12))).size !== 4;
          const where = `w=${w} n=${n} d=${d}`;
          if (!admissible.has(`${w},${n},${d}`)) {
            barred++;
            if (!collides) failures.push(`barred but sound: ${where}`);
            continue;
          }
          if (collides) failures.push(`collision: ${where}`);
          if (w * d > 72 || w * n > 72) failures.push(`out of range: ${where}`);
        }
      }
    }
    expect(failures.slice(0, 5)).toEqual([]);
    expect(inRange).toBe(210);
    expect(admissible.size).toBe(203);
    expect(barred).toBe(7);
  });
});
