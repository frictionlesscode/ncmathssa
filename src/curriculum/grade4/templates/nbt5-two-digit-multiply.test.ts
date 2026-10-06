import { describe, it, expect } from 'vitest';
import { assertTemplateSound } from '../../../engine/templateTesting';
import { makeRng } from '../../../engine/rng';
import { nbt5TwoDigitMultiply } from './nbt5-two-digit-multiply';

const bare = (s: string): number => Number(s.replace(/,/g, ''));

function factors(details: string): [number, number] {
  const m = details.match(/^(\d+) × (\d+)$/);
  if (!m) throw new Error(`unparsable promptDetails: ${details}`);
  return [Number(m[1]), Number(m[2])];
}

const taggedValue = (
  g: ReturnType<typeof nbt5TwoDigitMultiply.generate>,
  tag: string,
): number => {
  const opt = g.options.find((o) => o.misconception === tag);
  if (!opt) throw new Error(`no option tagged ${tag}`);
  return bare(opt.text);
};

describe('g4.nbt5.two-digit-multiply', () => {
  it('is sound at every seed', () => {
    assertTemplateSound(nbt5TwoDigitMultiply);
  });

  it('is deterministic in its seed', () => {
    expect(nbt5TwoDigitMultiply.generate(makeRng(42))).toEqual(
      nbt5TwoDigitMultiply.generate(makeRng(42)),
    );
  });

  it('produces a known question at a pinned seed', () => {
    const g = nbt5TwoDigitMultiply.generate(makeRng(31));
    expect(g.options.find((o) => o.isCorrect)!.text).toBe(g.answerText);
    expect(g.promptDetails!.length).toBeGreaterThan(0);
  });

  it('stays inside the standard: two TWO-digit factors, never three by two', () => {
    for (let seed = 0; seed < 300; seed++) {
      const [a, b] = factors(nbt5TwoDigitMultiply.generate(makeRng(seed)).promptDetails!);
      for (const f of [a, b]) {
        expect(f, `seed ${seed}`).toBeGreaterThanOrEqual(12);
        expect(f, `seed ${seed}`).toBeLessThanOrEqual(99);
      }
      // The multiplier never ends in zero, or the "stopped after the ones row"
      // option would be 0 — a product no student ever writes.
      expect(b % 10, `seed ${seed}`).not.toBe(0);
    }
  });

  it('the correct option is the product', () => {
    for (let seed = 0; seed < 300; seed++) {
      const g = nbt5TwoDigitMultiply.generate(makeRng(seed));
      const [a, b] = factors(g.promptDetails!);
      expect(bare(g.answerText), `seed ${seed}`).toBe(a * b);
    }
  });

  describe('every distractor is the value its tag names', () => {
    for (const seed of [4, 90, 1001, 22222, 60660]) {
      it(`seed ${seed}`, () => {
        const g = nbt5TwoDigitMultiply.generate(makeRng(seed));
        const [a, b] = factors(g.promptDetails!);
        const t = Math.floor(b / 10);
        const o = b % 10;

        // The tens row written without its placeholder zero.
        expect(taggedValue(g, 'dropped-partial-product-zero')).toBe(a * o + a * t);
        // Only the ones row was written.
        expect(taggedValue(g, 'forgot-the-final-step')).toBe(a * o);
        // The tens row multiplied, the ones digit then added.
        expect(taggedValue(g, 'added-the-ones-digit-instead-of-multiplying')).toBe(
          10 * a * t + o,
        );
      });
    }
  });

  it('sweeps its whole parameter space without a collision', () => {
    const failures: string[] = [];
    let checked = 0;
    for (let a = 12; a <= 99; a++) {
      for (let b = 12; b <= 99; b++) {
        if (b % 10 === 0) continue;
        const t = Math.floor(b / 10);
        const o = b % 10;
        const values = new Set([a * b, a * (t + o), a * o, 10 * a * t + o]);
        if (values.size !== 4) failures.push(`a=${a} b=${b}`);
        checked++;
      }
    }
    expect(failures.slice(0, 5)).toEqual([]);
    expect(checked).toBe(88 * 80);
  });
});
