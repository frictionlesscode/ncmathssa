import { describe, it, expect } from 'vitest';
import { assertTemplateSound } from '../../../engine/templateTesting';
import { makeRng } from '../../../engine/rng';
import { nf1EquivalentFraction, admissibleNumerators } from './nf1-equivalent-fraction';

const PAIRS: [number, number][] = [
  [2, 6],
  [2, 8],
  [2, 10],
  [2, 12],
  [2, 100],
  [3, 6],
  [3, 12],
  [4, 8],
  [4, 12],
  [4, 100],
  [5, 10],
  [5, 100],
  [6, 12],
];

const valueOf = (text: string): number => {
  const [n, d] = text.split('/').map(Number);
  return n / d;
};

describe('g4.nf1.equivalent-fraction', () => {
  it('is sound at every seed', () => {
    assertTemplateSound(nf1EquivalentFraction);
  });

  it('is deterministic in its seed', () => {
    expect(nf1EquivalentFraction.generate(makeRng(7))).toEqual(
      nf1EquivalentFraction.generate(makeRng(7)),
    );
  });

  it('the key really is equivalent to the fraction in the prompt', () => {
    for (let seed = 0; seed < 300; seed++) {
      const g = nf1EquivalentFraction.generate(makeRng(seed));
      const [given, target] = g.promptDetails!.split(' = ');
      expect(valueOf(g.answerText), `seed ${seed}`).toBeCloseTo(valueOf(given), 10);
      // The key is written over the denominator the prompt asked for.
      expect(g.answerText.split('/')[1], `seed ${seed}`).toBe(target.split('/')[1]);
    }
  });

  it('no two options name the same quantity', () => {
    for (let seed = 0; seed < 300; seed++) {
      const g = nf1EquivalentFraction.generate(makeRng(seed));
      const values = g.options.map((o) => valueOf(o.text));
      for (let i = 0; i < values.length; i++) {
        for (let j = i + 1; j < values.length; j++) {
          expect(Math.abs(values[i] - values[j]), `seed ${seed}`).toBeGreaterThan(1e-9);
        }
      }
    }
  });

  // A Grade 4 generator that prints a numerator in the hundreds has wandered
  // out of its grade. Bound EVERY number the child sees, not only the key.
  it('keeps every number it prints inside Grade 4', () => {
    for (let seed = 0; seed < 300; seed++) {
      const g = nf1EquivalentFraction.generate(makeRng(seed));
      const shown = [g.prompt, g.promptDetails!, ...g.options.map((o) => o.text),
        ...g.explanation.stepByStep, g.explanation.conceptSummary].join(' ');
      for (const numeral of shown.match(/\d+/g) ?? []) {
        expect(Number(numeral), `seed ${seed}: ${numeral} in "${shown}"`).toBeLessThanOrEqual(100);
      }
    }
  });

  describe('every distractor is the value its tag names', () => {
    for (const seed of [3, 61, 904, 22222, 91011]) {
      it(`seed ${seed}`, () => {
        const g = nf1EquivalentFraction.generate(makeRng(seed));
        const [given, target] = g.promptDetails!.split(' = ');
        const [a, b] = given.split('/').map(Number);
        const D = Number(target.split('/')[1]);
        const k = D / b;
        const tagged = (tag: string) =>
          g.options.find((o) => o.misconception === tag)!.text;

        expect(g.answerText).toBe(`${a * k}/${D}`);
        expect(tagged('scaled-the-denominator-only')).toBe(`${a}/${D}`);
        expect(tagged('added-to-both-parts-instead-of-multiplying')).toBe(
          `${a + (D - b)}/${D}`,
        );
        expect(tagged('used-the-denominator-as-the-new-numerator')).toBe(`${b}/${D}`);
      });
    }
  });

  it('sweeps its whole parameter space without a collision', () => {
    // Every option is written over the SAME denominator D, so two options name
    // the same quantity exactly when their numerators are equal. The parameter
    // space is therefore (b, D, a) in full — there is nothing else that could
    // move a numerator.
    let checked = 0;
    let barred = 0;
    const failures: string[] = [];
    for (const [b, D] of PAIRS) {
      const k = D / b;
      const admissible = new Set(admissibleNumerators(b, D));
      for (let a = 1; a <= b - 1; a++) {
        const numerators = [a * k, a, a + b * (k - 1), b];
        const collides = new Set(numerators).size !== 4;
        if (!admissible.has(a)) {
          barred++;
          // Nothing is excluded for tidiness: each barred value really would
          // have put two options on the same number.
          if (!collides) failures.push(`barred but sound: b=${b} D=${D} a=${a}`);
          continue;
        }
        if (collides) failures.push(`collision: b=${b} D=${D} a=${a} -> ${numerators}`);
        for (const n of numerators) {
          if (n > 100 || n < 1) failures.push(`out of range: b=${b} D=${D} a=${a} n=${n}`);
        }
        checked++;
      }
    }
    expect(failures.slice(0, 5)).toEqual([]);
    expect(checked).toBe(29);
    expect(barred).toBe(2);
  });
});
