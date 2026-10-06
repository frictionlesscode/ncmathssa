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

  // The sweep DRIVES generate() rather than recomputing what generate() ought
  // to print. A sweep that rebuilds the option texts inline is checking its own
  // arithmetic against itself, and that copy can drift from the generator in
  // silence — the same defect the shared numericValue() guard had while a
  // domain test kept a private copy of its patterns.
  it('covers its whole parameter space, checked on what it really generates', () => {
    const seen = new Set<string>();
    const failures: string[] = [];
    for (let seed = 0; seed < 2000; seed++) {
      const g = nf6AddTenthsHundredths.generate(makeRng(seed));
      const [left, right] = g.promptDetails!.split(' + ');
      const a = Number(left.split('/')[0]);
      const b = Number(right.split('/')[0]);
      seen.add(`${a},${b}`);
      const where = `seed ${seed} (${g.promptDetails})`;
      // The deterministic nudge that keeps a !== b must hold on real output,
      // not merely in the docstring.
      if (a === b) failures.push(`${where}: a === b would collide two options`);
      if (a < 1 || a > 9 || b < 1 || b > 9) failures.push(`${where}: digit out of range`);
      // Solved from the prompt, not rebuilt from the generator's expressions.
      if (g.answerText !== `${10 * a + b}/100`) failures.push(`${where}: key is ${g.answerText}`);
      const texts = g.options.map((o) => o.text);
      if (new Set(texts).size !== 4) failures.push(`${where}: duplicate option text`);
      const values = texts.map(valueOf);
      if (new Set(values.map((v) => v.toFixed(12))).size !== 4) {
        failures.push(`${where}: two options name one quantity`);
      }
      for (const numeral of texts.join(' ').match(/\d+/g) ?? []) {
        if (Number(numeral) > 110) failures.push(`${where}: ${numeral} out of range`);
      }
    }
    expect(failures.slice(0, 5)).toEqual([]);
    // 81 (a, b) pairs are in range and 72 survive a !== b — and 2,000 seeds
    // reach every one of the 72, so the nudge leaves no hole in the space it
    // maps onto.
    expect(seen.size).toBe(72);
  });

  // This one has to recompute, and says so: the generator never emits a === b,
  // so there is no output to check it against. What it proves is that nothing
  // was excluded merely for tidiness.
  it('excludes only pairs that really would have collided', () => {
    let barred = 0;
    const failures: string[] = [];
    for (let a = 1; a <= 9; a++) {
      for (let b = 1; b <= 9; b++) {
        if (a !== b) continue;
        barred++;
        const values = [(10 * a + b) / 100, (a + b) / 110, (a + b) / 100, (a + 10 * b) / 100];
        if (new Set(values.map((v) => v.toFixed(12))).size === 4) {
          failures.push(`barred but sound: a=${a} b=${b}`);
        }
      }
    }
    expect(failures).toEqual([]);
    expect(barred).toBe(9);
  });
});
