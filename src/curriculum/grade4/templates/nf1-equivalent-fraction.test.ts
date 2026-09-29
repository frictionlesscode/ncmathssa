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
  [10, 100],
];

/** Draws barred because `../authored.nf.ts` already asks them with the same
 *  three distractors — not because their four options would collide. */
const OWNED_BY_AUTHORED_BANK = new Set(['10,100,6', '3,12,2']);

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

  // The sweep DRIVES generate() rather than recomputing what generate() ought
  // to print. A sweep that rebuilds the option texts inline is checking its own
  // arithmetic against itself, and that copy can drift from the generator in
  // silence — the same defect the shared numericValue() guard had while a
  // domain test kept a private copy of its patterns.
  it('covers its whole parameter space, checked on what it really generates', () => {
    const admissible = new Set<string>();
    for (const [b, D] of PAIRS) {
      for (const a of admissibleNumerators(b, D)) admissible.add(`${b},${D},${a}`);
    }

    const seen = new Set<string>();
    const failures: string[] = [];
    for (let seed = 0; seed < 2000; seed++) {
      const g = nf1EquivalentFraction.generate(makeRng(seed));
      const [given, target] = g.promptDetails!.split(' = ');
      const [a, b] = given.split('/').map(Number);
      const D = Number(target.split('/')[1]);
      const key = `${b},${D},${a}`;
      seen.add(key);
      if (!admissible.has(key)) {
        failures.push(`seed ${seed} drew a barred combination: ${key}`);
        continue;
      }
      // Solved here from the prompt alone, not rebuilt from the generator's
      // own expressions.
      if (g.answerText !== `${(a * D) / b}/${D}`) {
        failures.push(`seed ${seed}: key ${g.answerText} is not equivalent to ${a}/${b}`);
      }
      const texts = g.options.map((o) => o.text);
      if (new Set(texts).size !== 4) failures.push(`seed ${seed}: duplicate option text`);
      const values = texts.map(valueOf);
      if (new Set(values.map((v) => v.toFixed(12))).size !== 4) {
        failures.push(`seed ${seed}: two options name one quantity at ${key}`);
      }
      for (const text of texts) {
        const [n, d] = text.split('/').map(Number);
        if (d !== D) failures.push(`seed ${seed}: option ${text} is not over ${D}`);
        if (n < 1 || n > 100) failures.push(`seed ${seed}: numerator ${n} out of range`);
      }
    }
    expect(failures.slice(0, 5)).toEqual([]);
    // 40 (b, D, a) combinations are in range; 3 are barred by the a = b/k
    // collision and 2 more are owned by the authored bank, leaving 35 — and
    // 2,000 seeds reach every one of them.
    expect(admissible.size).toBe(35);
    expect(seen.size).toBe(35);
  });

  // This one has to recompute, and says so: the generator never emits these
  // combinations, so there is no output to check them against. What it proves
  // is that nothing was excluded merely for tidiness.
  it('excludes only combinations that really would have collided', () => {
    let barredByCollision = 0;
    let barredByAuthoredBank = 0;
    const failures: string[] = [];
    for (const [b, D] of PAIRS) {
      const k = D / b;
      const admissible = new Set(admissibleNumerators(b, D));
      for (let a = 1; a <= b - 1; a++) {
        if (admissible.has(a)) continue;
        if (OWNED_BY_AUTHORED_BANK.has(`${b},${D},${a}`)) {
          barredByAuthoredBank++;
          continue;
        }
        barredByCollision++;
        const numerators = [a * k, a, a + b * (k - 1), b];
        if (new Set(numerators).size === 4) {
          failures.push(`barred but sound: b=${b} D=${D} a=${a} -> ${numerators}`);
        }
      }
    }
    expect(failures).toEqual([]);
    expect(barredByCollision).toBe(3);
    expect(barredByAuthoredBank).toBe(2);
  });
});
