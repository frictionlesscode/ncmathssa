import { describe, it, expect } from 'vitest';
import { assertTemplateSound } from '../../../engine/templateTesting';
import { makeRng } from '../../../engine/rng';
import { nf3AddLike, admissibleAddends } from './nf3-add-like';

const DENOMINATORS = [3, 4, 5, 6, 8, 10, 12];

const valueOf = (text: string): number => {
  const [n, d] = text.split('/').map(Number);
  return n / d;
};

describe('g4.nf3.add-like', () => {
  it('is sound at every seed', () => {
    assertTemplateSound(nf3AddLike);
  });

  it('is deterministic in its seed', () => {
    expect(nf3AddLike.generate(makeRng(23))).toEqual(nf3AddLike.generate(makeRng(23)));
  });

  it('the key really is the sum, over the denominator both addends share', () => {
    for (let seed = 0; seed < 300; seed++) {
      const g = nf3AddLike.generate(makeRng(seed));
      const [left, right] = g.promptDetails!.split(' + ');
      const [a, d] = left.split('/').map(Number);
      const [b, d2] = right.split('/').map(Number);
      expect(d2, `seed ${seed}: denominators must match`).toBe(d);
      expect(g.answerText, `seed ${seed}`).toBe(`${a + b}/${d}`);
      // The sum stays a proper fraction, so no Grade 4 child is asked to
      // convert an improper result they have not been taught to write.
      expect(a + b, `seed ${seed}`).toBeLessThanOrEqual(d);
      expect(a, `seed ${seed}`).toBeGreaterThan(b);
    }
  });

  it('no two options name the same quantity', () => {
    for (let seed = 0; seed < 300; seed++) {
      const g = nf3AddLike.generate(makeRng(seed));
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
      const g = nf3AddLike.generate(makeRng(seed));
      const shown = [g.prompt, g.promptDetails!, ...g.options.map((o) => o.text),
        ...g.explanation.stepByStep, g.explanation.conceptSummary].join(' ');
      for (const numeral of shown.match(/\d+/g) ?? []) {
        // 144 is 12 x 12, the largest denominator the multiplied-denominators
        // distractor can reach.
        expect(Number(numeral), `seed ${seed}: ${numeral}`).toBeLessThanOrEqual(144);
      }
    }
  });

  describe('every distractor is the value its tag names', () => {
    for (const seed of [1, 64, 3000, 51234, 999999]) {
      it(`seed ${seed}`, () => {
        const g = nf3AddLike.generate(makeRng(seed));
        const [left, right] = g.promptDetails!.split(' + ');
        const [a, d] = left.split('/').map(Number);
        const b = Number(right.split('/')[0]);
        const tagged = (tag: string) => g.options.find((o) => o.misconception === tag)!.text;

        expect(tagged('operated-on-the-like-denominators-too')).toBe(`${a + b}/${2 * d}`);
        expect(tagged('multiplied-the-denominators-instead-of-keeping-them')).toBe(
          `${a + b}/${d * d}`,
        );
        expect(tagged('subtracted-instead-of-added')).toBe(`${a - b}/${d}`);
      });
    }
  });

  it('sweeps its whole parameter space without a collision', () => {
    // (d, a, b) is the entire space: the only other draw a seed makes is the
    // shuffle of the four options, which cannot change what they say.
    const admissible = new Set(admissibleAddends().map(([d, a, b]) => `${d},${a},${b}`));
    let inRange = 0;
    let barred = 0;
    const failures: string[] = [];
    for (const d of DENOMINATORS) {
      for (let a = 2; a <= d - 1; a++) {
        for (let b = 1; b < a; b++) {
          if (a + b > d) continue;
          inRange++;
          const values = [(a + b) / d, (a + b) / (2 * d), (a + b) / (d * d), (a - b) / d];
          const collides = new Set(values.map((v) => v.toFixed(12))).size !== 4;
          const where = `d=${d} a=${a} b=${b}`;
          if (!admissible.has(`${d},${a},${b}`)) {
            barred++;
            if (!collides) failures.push(`barred but sound: ${where}`);
            continue;
          }
          if (collides) failures.push(`collision: ${where}`);
          if (d * d > 144) failures.push(`out of range: ${where}`);
        }
      }
    }
    expect(failures.slice(0, 5)).toEqual([]);
    expect(inRange).toBe(75);
    expect(admissible.size).toBe(63);
    expect(barred).toBe(12);
  });
});
