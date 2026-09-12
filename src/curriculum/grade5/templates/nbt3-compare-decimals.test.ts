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

/** The single highest-scoring value. Throws on a tie, so a rule that fails
 *  to pick one number outright is a failure rather than a silent first-wins. */
const maxBy = (values: string[], score: (v: string) => number): string => {
  const best = values.reduce((a, v) => (score(v) > score(a) ? v : a));
  const tied = values.filter((v) => score(v) === score(best));
  if (tied.length !== 1) throw new Error(`rule does not pick one value: ${tied.join(', ')}`);
  return best;
};

const tenthsDigit = (text: string) => decimalPart(text)[0];

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

  it('never lets the tenths place settle the comparison on its own', () => {
    // NC.5.NBT.3 asks for comparison to thousandths based on the meaning of
    // the digits in each place. If the answer's tenths digit were strictly
    // the largest at every draw, a student would never read past the first
    // decimal place and the item would be easier than the standard it is
    // filed under.
    for (let seed = 0; seed < 300; seed++) {
      const g = nbt3CompareDecimals.generate(makeRng(seed));
      const values = g.options.map((o) => o.text);
      const answer = g.answerText;
      const shareTenths = values.filter((v) => tenthsDigit(v) === tenthsDigit(answer));
      expect(shareTenths.length, `seed ${seed}: ${values.join(', ')}`).toBeGreaterThanOrEqual(2);
      // ...and the tie really is broken further right, not by length alone.
      for (const rival of shareTenths) {
        if (rival === answer) continue;
        expect(thousandths(answer), `seed ${seed}: ${answer} vs ${rival}`).toBeGreaterThan(
          thousandths(rival),
        );
        expect(decimalPart(answer)[1]).not.toBe(decimalPart(rival)[1]);
      }
    }
  });

  describe('every distractor value matches the error its tag names', () => {
    for (const seed of [0, 13, 404, 4912, 60007]) {
      it(`seed ${seed}`, () => {
        const g = nbt3CompareDecimals.generate(makeRng(seed));
        const values = (g.promptDetails ?? '').split(', ');
        expect(values).toHaveLength(4);

        // Each rule, re-run here over the four printed numbers, must land on
        // the option carrying that rule's tag.
        expect(g.answerText).toBe(maxBy(values, thousandths));
        expect(optionText(g, 'compared-by-digit-count')).toBe(maxBy(values, asWholeNumber));
        expect(optionText(g, 'compared-decimals-right-to-left')).toBe(maxBy(values, lastDigit));
        expect(optionText(g, 'omitted-placeholder-zero')).toBe(
          maxBy(values, withoutPlaceholderZero),
        );

        // And the shapes themselves, rebuilt from the answer's own digits:
        // w.{t}{a} against w.{t}0{z}, w.{b}9 and w.09{c}.
        const m = g.answerText.match(/^(\d)\.(\d)(\d)$/);
        expect(m, `answer should print to hundredths: ${g.answerText}`).toBeTruthy();
        const [, w, t, a] = m!;
        expect(Number(t)).toBeGreaterThanOrEqual(6);
        expect(Number(a)).toBeGreaterThanOrEqual(1);

        const digitTrap = optionText(g, 'compared-by-digit-count');
        expect(digitTrap).toMatch(new RegExp(`^${w}\\.${t}0[0-8]$`));
        expect(asWholeNumber(digitTrap)).toBeGreaterThan(asWholeNumber(g.answerText));
        expect(thousandths(digitTrap)).toBeLessThan(thousandths(g.answerText));

        const rightToLeft = optionText(g, 'compared-decimals-right-to-left');
        expect(rightToLeft).toMatch(new RegExp(`^${w}\\.[1-7]9$`));
        expect(Number(decimalPart(rightToLeft)[0])).toBeLessThan(Number(t));

        expect(optionText(g, 'omitted-placeholder-zero')).toMatch(new RegExp(`^${w}\\.09[0-8]$`));
      });
    }
  });
});
