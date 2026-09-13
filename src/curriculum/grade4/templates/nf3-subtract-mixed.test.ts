import { describe, it, expect } from 'vitest';
import { assertTemplateSound } from '../../../engine/templateTesting';
import { makeRng } from '../../../engine/rng';
import { nf3SubtractMixed, admissibleParts, admissibleWholes } from './nf3-subtract-mixed';

const DENOMINATORS = [3, 4, 5, 6, 8, 10, 12];

const valueOf = (text: string): number => {
  const [whole, frac] = text.split(' ');
  const [n, d] = frac.split('/').map(Number);
  return Number(whole) + n / d;
};

const partsOf = (text: string) => {
  const [whole, frac] = text.split(' ');
  const [n, d] = frac.split('/').map(Number);
  return { whole: Number(whole), n, d };
};

describe('g4.nf3.subtract-mixed', () => {
  it('is sound at every seed', () => {
    assertTemplateSound(nf3SubtractMixed);
  });

  it('is deterministic in its seed', () => {
    expect(nf3SubtractMixed.generate(makeRng(31))).toEqual(
      nf3SubtractMixed.generate(makeRng(31)),
    );
  });

  it('the key really is the difference, and the draw always needs regrouping', () => {
    for (let seed = 0; seed < 300; seed++) {
      const g = nf3SubtractMixed.generate(makeRng(seed));
      const [left, right] = g.promptDetails!.split(' - ');
      const a = partsOf(left);
      const b = partsOf(right);
      expect(b.d, `seed ${seed}: denominators must match`).toBe(a.d);
      // Regrouping is the skill; every draw must demand it.
      expect(a.n, `seed ${seed}`).toBeLessThan(b.n);
      expect(valueOf(g.answerText), `seed ${seed}`).toBeCloseTo(valueOf(left) - valueOf(right), 10);
      // Every option prints as a mixed number with a whole part of at least 1.
      for (const o of g.options) {
        expect(partsOf(o.text).whole, `seed ${seed}: ${o.text}`).toBeGreaterThanOrEqual(1);
        expect(partsOf(o.text).n, `seed ${seed}: ${o.text}`).toBeLessThan(a.d);
      }
    }
  });

  it('no two options name the same quantity', () => {
    for (let seed = 0; seed < 300; seed++) {
      const g = nf3SubtractMixed.generate(makeRng(seed));
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
      const g = nf3SubtractMixed.generate(makeRng(seed));
      // Question and options: whole numbers to 11, denominators to 12.
      const asked = [g.prompt, g.promptDetails!, ...g.options.map((o) => o.text)].join(' ');
      for (const numeral of asked.match(/\d+/g) ?? []) {
        expect(Number(numeral), `seed ${seed}: ${numeral}`).toBeLessThanOrEqual(12);
      }
      // The worked solution also shows the regrouped numerator f1 + d, which
      // tops out at 5 + 12 = 17 because f1 + f2 < d forces f1 <= (d - 2) / 2.
      const worked = [...g.explanation.stepByStep, g.explanation.conceptSummary,
        g.explanation.commonMisconception ?? ''].join(' ');
      for (const numeral of worked.match(/\d+/g) ?? []) {
        expect(Number(numeral), `seed ${seed}: ${numeral}`).toBeLessThanOrEqual(17);
      }
    }
  });

  describe('every distractor is the value its tag names', () => {
    for (const seed of [4, 77, 2048, 60606, 424242]) {
      it(`seed ${seed}`, () => {
        const g = nf3SubtractMixed.generate(makeRng(seed));
        const [left, right] = g.promptDetails!.split(' - ');
        const a = partsOf(left);
        const b = partsOf(right);
        const d = a.d;
        const tagged = (tag: string) => g.options.find((o) => o.misconception === tag)!.text;

        expect(g.answerText).toBe(`${a.whole - b.whole - 1} ${a.n + d - b.n}/${d}`);
        expect(tagged('forgot-to-regroup')).toBe(`${a.whole - b.whole} ${b.n - a.n}/${d}`);
        expect(tagged('borrowed-without-reducing-the-whole')).toBe(
          `${a.whole - b.whole} ${a.n + d - b.n}/${d}`,
        );
        expect(tagged('added-instead-of-subtracted')).toBe(
          `${a.whole + b.whole} ${a.n + b.n}/${d}`,
        );
      });
    }
  });

  // The sweep DRIVES generate() rather than recomputing what generate() ought
  // to print. A sweep that rebuilds the option texts inline is checking its own
  // arithmetic against itself, and that copy can drift from the generator in
  // silence — the same defect the shared numericValue() guard had while a
  // domain test kept a private copy of its patterns.
  it('covers its whole parameter space, checked on what it really generates', () => {
    const parts = new Set(admissibleParts().map(([d, f1, f2]) => `${d},${f1},${f2}`));
    const wholes = admissibleWholes();
    const admissible = new Set<string>();
    for (const p of parts) for (const [w1, w2] of wholes) admissible.add(`${p},${w1},${w2}`);

    const seen = new Set<string>();
    const failures: string[] = [];
    // 765 combinations, drawn as 51 fraction parts against 15 whole-number
    // pairs; 20,000 seeds is comfortably past the coupon-collector cost of
    // reaching all of them.
    for (let seed = 0; seed < 20000; seed++) {
      const g = nf3SubtractMixed.generate(makeRng(seed));
      const [left, right] = g.promptDetails!.split(' - ');
      const a = partsOf(left);
      const b = partsOf(right);
      const key = `${a.d},${a.n},${b.n},${a.whole},${b.whole}`;
      seen.add(key);
      const where = `seed ${seed} (${g.promptDetails})`;
      if (!admissible.has(key)) {
        failures.push(`${where}: drew a barred combination`);
        continue;
      }
      // Solved from the prompt, not rebuilt from the generator's expressions.
      const expected = valueOf(left) - valueOf(right);
      if (Math.abs(valueOf(g.answerText) - expected) > 1e-9) {
        failures.push(`${where}: key ${g.answerText} is not the difference`);
      }
      const texts = g.options.map((o) => o.text);
      if (new Set(texts).size !== 4) failures.push(`${where}: duplicate option text`);
      const values = texts.map(valueOf);
      if (new Set(values.map((v) => v.toFixed(12))).size !== 4) {
        failures.push(`${where}: two options name one quantity`);
      }
      for (const numeral of texts.join(' ').match(/\d+/g) ?? []) {
        if (Number(numeral) > 12) failures.push(`${where}: ${numeral} out of range`);
      }
    }
    expect(failures.slice(0, 5)).toEqual([]);
    expect(admissible.size).toBe(765);
    expect(seen.size).toBe(765);
  });

  // This one has to recompute, and says so: the generator never emits these
  // combinations, so there is no output to check them against. What it proves
  // is that nothing was excluded merely for tidiness.
  it('excludes only combinations that really would have collided', () => {
    const parts = new Set(admissibleParts().map(([d, f1, f2]) => `${d},${f1},${f2}`));
    const wholes = admissibleWholes();
    let inRange = 0;
    let barred = 0;
    const failures: string[] = [];
    for (const d of DENOMINATORS) {
      for (let f1 = 1; f1 < d; f1++) {
        for (let f2 = f1 + 1; f2 < d; f2++) {
          if (f1 + f2 > d - 1) continue;
          const admissible = parts.has(`${d},${f1},${f2}`);
          for (const [w1, w2] of wholes) {
            inRange++;
            if (admissible) continue;
            barred++;
            const values = [
              w1 - w2 - 1 + (f1 + d - f2) / d,
              w1 - w2 + (f2 - f1) / d,
              w1 - w2 + (f1 + d - f2) / d,
              w1 + w2 + (f1 + f2) / d,
            ];
            if (new Set(values.map((v) => v.toFixed(12))).size === 4) {
              failures.push(`barred but sound: d=${d} f1=${f1} f2=${f2} w1=${w1} w2=${w2}`);
            }
          }
        }
      }
    }
    expect(failures.slice(0, 5)).toEqual([]);
    expect(inRange).toBe(855);
    expect(parts.size * wholes.length).toBe(765);
    expect(barred).toBe(90);
  });
});
