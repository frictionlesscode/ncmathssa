import { describe, it, expect } from 'vitest';
import { makeRng } from '../../../engine/rng';
import { assertTemplateSound } from '../../../engine/templateTesting';
import { nbt5MultiDigitMultiply } from './nbt5-multi-digit-multiply';

function parse(details: string) {
  const m = details.match(/^(\d+) × (\d+)$/);
  if (!m) throw new Error(`unparsable promptDetails: ${details}`);
  const a = Number(m[1]);
  const b = Number(m[2]);
  return { a, b, tens: Math.floor(b / 10), ones: b % 10 };
}

const optionText = (g: ReturnType<typeof nbt5MultiDigitMultiply.generate>, tag: string): string => {
  const opt = g.options.find((o) => o.misconception === tag);
  if (!opt) throw new Error(`no option tagged ${tag}`);
  return opt.text;
};

describe('nbt5MultiDigitMultiply', () => {
  it('satisfies every template invariant across 300 seeds', () => {
    assertTemplateSound(nbt5MultiDigitMultiply);
  });

  it('is deterministic in its seed', () => {
    const a = nbt5MultiDigitMultiply.generate(makeRng(777));
    const b = nbt5MultiDigitMultiply.generate(makeRng(777));
    expect(a).toEqual(b);
  });

  it('never draws a multiplier that is a multiple of ten', () => {
    // Ruling F7: at b % 10 === 0 the "stopped after the first partial
    // product" distractor is a * 0 = 0, which is not a partial product a
    // student would ever write down.
    for (let seed = 0; seed < 300; seed++) {
      const g = nbt5MultiDigitMultiply.generate(makeRng(seed));
      const { a, b } = parse(g.promptDetails ?? '');
      expect(b % 10, `seed ${seed}: b = ${b}`).not.toBe(0);
      expect(b).toBeGreaterThanOrEqual(12);
      expect(b).toBeLessThanOrEqual(99);
      expect(a).toBeGreaterThanOrEqual(112);
      expect(a).toBeLessThanOrEqual(989);
    }
  });

  describe('every distractor value matches the error its tag names', () => {
    for (const seed of [2, 88, 1234, 4912, 777777]) {
      it(`seed ${seed}`, () => {
        const g = nbt5MultiDigitMultiply.generate(makeRng(seed));
        const { a, b, tens, ones } = parse(g.promptDetails ?? '');

        expect(g.answerText).toBe(String(a * b));
        // Placeholder zero left off the tens row: a * tens instead of
        // a * tens * 10, added to the ones row.
        expect(optionText(g, 'dropped-partial-product-zero')).toBe(String(a * ones + a * tens));
        // Stopped after the ones row.
        expect(optionText(g, 'forgot-the-final-step')).toBe(String(a * ones));
        // Tens row done, then the ones digit added instead of multiplied.
        expect(optionText(g, 'added-the-ones-digit-instead-of-multiplying')).toBe(
          String(a * tens * 10 + ones),
        );
      });
    }
  });
});
