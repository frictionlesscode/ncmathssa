import { describe, it, expect } from 'vitest';
import { makeRng } from '../../../engine/rng';
import { assertTemplateSound } from '../../../engine/templateTesting';
import { nbt3CompareDecimals } from './nbt3-compare-decimals';

/** Independent re-implementations of the three comparison rules, derived
 *  from the printed decimals alone. */
const decimalPart = (text: string) => text.slice(text.indexOf('.') + 1);
const thousandths = (text: string) => Number(decimalPart(text).padEnd(3, '0'));

/** Reads the digits after the point as though they were a whole number:
 *  ".195" beats ".8" because 195 beats 8. */
const asWholeNumber = (text: string) => Number(decimalPart(text));

/** Compares starting from the rightmost printed digit. */
const lastDigit = (text: string) => Number(decimalPart(text).slice(-1));

/** Drops a placeholder zero sitting straight after the point, so ".093"
 *  is read as ".93". */
const withoutPlaceholderZero = (text: string) => {
  const part = decimalPart(text);
  return part.startsWith('0') ? Number(part.slice(1).padEnd(3, '0')) : Number(part.padEnd(3, '0'));
};

const maxBy = (values: string[], score: (v: string) => number) =>
  values.reduce((best, v) => (score(v) > score(best) ? v : best));

const optionText = (g: ReturnType<typeof nbt3CompareDecimals.generate>, tag: string): string => {
  const opt = g.options.find((o) => o.misconception === tag);
  if (!opt) throw new Error(`no option tagged ${tag}`);
  return opt.text;
};

describe('nbt3CompareDecimals', () => {
  it('satisfies every template invariant across 300 seeds', () => {
    assertTemplateSound(nbt3CompareDecimals);
  });

  it('is deterministic in its seed', () => {
    const a = nbt3CompareDecimals.generate(makeRng(777));
    const b = nbt3CompareDecimals.generate(makeRng(777));
    expect(a).toEqual(b);
  });

  it('forces the comparison into the decimal places', () => {
    // NC.5.NBT.3 is about place value after the point. If the whole-number
    // parts differed, or if a number ran past thousandths, the item would
    // be testing something else.
    for (let seed = 0; seed < 200; seed++) {
      const g = nbt3CompareDecimals.generate(makeRng(seed));
      const values = g.options.map((o) => o.text);
      const wholes = new Set(values.map((v) => v.slice(0, v.indexOf('.'))));
      expect(wholes.size, `seed ${seed}: ${values.join(', ')}`).toBe(1);
      for (const v of values) {
        expect(decimalPart(v).length, `seed ${seed}: ${v}`).toBeLessThanOrEqual(3);
        expect(decimalPart(v).length).toBeGreaterThan(0);
      }
      expect(new Set(values).size).toBe(4);
      // The listed numbers are exactly the four options.
      expect(new Set((g.promptDetails ?? '').split(', '))).toEqual(new Set(values));
    }
  });

  describe('every distractor value matches the error its tag names', () => {
    for (const seed of [0, 13, 404, 4912, 60007]) {
      it(`seed ${seed}`, () => {
        const g = nbt3CompareDecimals.generate(makeRng(seed));
        const values = (g.promptDetails ?? '').split(', ');
        expect(values).toHaveLength(4);

        expect(g.answerText).toBe(maxBy(values, thousandths));
        expect(optionText(g, 'compared-by-digit-count')).toBe(maxBy(values, asWholeNumber));
        expect(optionText(g, 'compared-decimals-right-to-left')).toBe(maxBy(values, lastDigit));
        expect(optionText(g, 'omitted-placeholder-zero')).toBe(
          maxBy(values, withoutPlaceholderZero),
        );
      });
    }
  });
});
