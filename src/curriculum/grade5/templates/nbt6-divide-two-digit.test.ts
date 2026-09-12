import { describe, it, expect } from 'vitest';
import { makeRng } from '../../../engine/rng';
import { assertTemplateSound } from '../../../engine/templateTesting';
import { nbt6DivideTwoDigit } from './nbt6-divide-two-digit';

function parse(details: string) {
  const m = details.match(/^(\d+) ÷ (\d+)$/);
  if (!m) throw new Error(`unparsable promptDetails: ${details}`);
  const dividend = Number(m[1]);
  const divisor = Number(m[2]);
  return {
    dividend,
    divisor,
    quotient: Math.floor(dividend / divisor),
    remainder: dividend % divisor,
  };
}

const optionText = (g: ReturnType<typeof nbt6DivideTwoDigit.generate>, tag: string): string => {
  const opt = g.options.find((o) => o.misconception === tag);
  if (!opt) throw new Error(`no option tagged ${tag}`);
  return opt.text;
};

describe('nbt6DivideTwoDigit', () => {
  it('satisfies every template invariant across 300 seeds', () => {
    assertTemplateSound(nbt6DivideTwoDigit);
  });

  it('is deterministic in its seed', () => {
    const a = nbt6DivideTwoDigit.generate(makeRng(777));
    const b = nbt6DivideTwoDigit.generate(makeRng(777));
    expect(a).toEqual(b);
  });

  it('never produces a remainder of zero', () => {
    // Ruling F5: at remainder 0 the ignored-remainder distractor is the
    // correct answer. Exact division is covered by the authored NBT.6 items
    // instead.
    for (let seed = 0; seed < 300; seed++) {
      const g = nbt6DivideTwoDigit.generate(makeRng(seed));
      const { dividend, divisor, remainder, quotient } = parse(g.promptDetails ?? '');
      expect(remainder, `seed ${seed}: ${dividend} / ${divisor}`).toBeGreaterThan(0);
      expect(remainder).toBeLessThan(divisor);
      expect(divisor).toBeGreaterThanOrEqual(12);
      expect(divisor).toBeLessThanOrEqual(45);
      expect(quotient).toBeGreaterThanOrEqual(11);
      expect(quotient).toBeLessThanOrEqual(99);
      expect(g.answerText).toBe(`${quotient} R ${remainder}`);
    }
  });

  describe('every distractor value matches the error its tag names', () => {
    for (const seed of [5, 61, 900, 4912, 123456]) {
      it(`seed ${seed}`, () => {
        const g = nbt6DivideTwoDigit.generate(makeRng(seed));
        const { dividend, divisor, quotient, remainder } = parse(g.promptDetails ?? '');

        expect(g.answerText).toBe(`${quotient} R ${remainder}`);
        // Threw the leftover away.
        expect(optionText(g, 'ignored-remainder')).toBe(`${quotient}`);
        // Multiplied the two numbers instead of dividing.
        expect(optionText(g, 'multiplied-instead-of-divided')).toBe(`${dividend * divisor}`);
        // Quotient digits written one column too far left.
        expect(optionText(g, 'misplaced-digits-in-the-quotient')).toBe(
          `${quotient * 10} R ${remainder}`,
        );
        // Nothing in this item contains a decimal point, so no option may
        // claim a decimal error — these tags feed the parent diagnostic.
        expect(g.promptDetails).not.toContain('.');
        for (const o of g.options) {
          expect(o.text).not.toContain('.');
          expect(o.misconception).not.toBe('decimal-point-misplaced');
        }
      });
    }
  });
});
