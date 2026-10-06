import { describe, it, expect } from 'vitest';
import { makeRng } from '../../../engine/rng';
import { assertTemplateSound } from '../../../engine/templateTesting';
import { nf7DivideUnitFractions } from './nf7-divide-unit-fractions';

const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b));
const simplify = (n: number, d: number): string => {
  const g = gcd(n, d) || 1;
  const sn = n / g;
  const sd = d / g;
  return sd === 1 ? `${sn}` : `${sn}/${sd}`;
};

function parse(details: string) {
  const m = details.match(/^(\d+|1\/\d+) ÷ (\d+|1\/\d+)$/);
  if (!m) throw new Error(`unparsable promptDetails: ${details}`);
  const [, left, right] = m;
  const fractionFirst = left.includes('/');
  const unit = fractionFirst ? left : right;
  const wholeText = fractionFirst ? right : left;
  return {
    fractionFirst,
    whole: Number(wholeText),
    denominator: Number(unit.split('/')[1]),
  };
}

const optionText = (g: ReturnType<typeof nf7DivideUnitFractions.generate>, tag: string): string => {
  const opt = g.options.find((o) => o.misconception === tag);
  if (!opt) throw new Error(`no option tagged ${tag}`);
  return opt.text;
};

describe('nf7DivideUnitFractions', () => {
  it('satisfies every template invariant across 300 seeds', () => {
    assertTemplateSound(nf7DivideUnitFractions);
  });

  it('is deterministic in its seed', () => {
    const a = nf7DivideUnitFractions.generate(makeRng(777));
    const b = nf7DivideUnitFractions.generate(makeRng(777));
    expect(a).toEqual(b);
  });

  it('always pairs a whole number with a unit fraction, never matching', () => {
    // NC.5.NF.7 is limited to unit fractions and whole numbers. The whole
    // number must also differ from the denominator: at whole === d the
    // multiplied-instead-of-divided distractor (w/d = 1) and the
    // added-across distractor ((w+1)/(d+1) = 1) are the same value.
    const allowed = new Set([2, 3, 4, 5, 6, 8]);
    let sawBoth = 0;
    for (let seed = 0; seed < 300; seed++) {
      const g = nf7DivideUnitFractions.generate(makeRng(seed));
      const { whole, denominator, fractionFirst } = parse(g.promptDetails ?? '');
      expect(allowed.has(denominator), `seed ${seed}: 1/${denominator}`).toBe(true);
      expect(whole).toBeGreaterThanOrEqual(2);
      expect(whole).toBeLessThanOrEqual(8);
      expect(whole, `seed ${seed}`).not.toBe(denominator);
      sawBoth |= fractionFirst ? 1 : 2;
    }
    expect(sawBoth, 'both division directions should appear').toBe(3);
  });

  describe('every distractor value matches the error its tag names', () => {
    for (const seed of [7, 58, 611, 4912, 2718281]) {
      it(`seed ${seed}`, () => {
        const g = nf7DivideUnitFractions.generate(makeRng(seed));
        const { whole, denominator, fractionFirst } = parse(g.promptDetails ?? '');

        // whole ÷ 1/d counts how many d-ths fit in the whole number;
        // 1/d ÷ whole splits one d-th into that many equal parts.
        expect(g.answerText).toBe(
          fractionFirst ? simplify(1, denominator * whole) : `${whole * denominator}`,
        );
        // Flipped the dividend rather than the divisor, which swaps the two
        // answers above.
        expect(optionText(g, 'inverted-wrong-factor')).toBe(
          fractionFirst ? `${whole * denominator}` : simplify(1, denominator * whole),
        );
        // Multiplied the two quantities instead of dividing.
        expect(optionText(g, 'multiplied-instead-of-divided')).toBe(simplify(whole, denominator));
        // Added straight across, reading the whole number as whole/1.
        expect(optionText(g, 'added-numerators-and-denominators')).toBe(
          simplify(whole + 1, denominator + 1),
        );
      });
    }
  });
});
