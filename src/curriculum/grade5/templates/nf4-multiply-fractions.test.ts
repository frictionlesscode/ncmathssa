import { describe, it, expect } from 'vitest';
import { makeRng } from '../../../engine/rng';
import { assertTemplateSound } from '../../../engine/templateTesting';
import { nf4MultiplyFractions } from './nf4-multiply-fractions';

const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b));
const simplify = (n: number, d: number): string => {
  const g = gcd(n, d) || 1;
  const sn = n / g;
  const sd = d / g;
  return sd === 1 ? `${sn}` : `${sn}/${sd}`;
};

function parse(details: string) {
  const m = details.match(/^(\d+)\/(\d+) × (\d+)\/(\d+)$/);
  if (!m) throw new Error(`unparsable promptDetails: ${details}`);
  const [, n1, d1, n2, d2] = m.map(Number);
  return { n1, d1, n2, d2 };
}

const optionText = (g: ReturnType<typeof nf4MultiplyFractions.generate>, tag: string): string => {
  const opt = g.options.find((o) => o.misconception === tag);
  if (!opt) throw new Error(`no option tagged ${tag}`);
  return opt.text;
};

describe('nf4MultiplyFractions', () => {
  it('satisfies every template invariant across 300 seeds', () => {
    assertTemplateSound(nf4MultiplyFractions);
  });

  it('is deterministic in its seed', () => {
    const a = nf4MultiplyFractions.generate(makeRng(777));
    const b = nf4MultiplyFractions.generate(makeRng(777));
    expect(a).toEqual(b);
  });

  it('nf4 template: NC-R7 multiplies two proper fractions with denominators 2, 3 and 4 only', () => {
    // NC.5.NF.4: "Use area and length models to multiply two fractions, with
    // the denominators 2, 3, 4." Both factors stay proper so the product is
    // smaller than either one, the idea the standard is really about.
    const allowed = new Set([2, 3, 4]);
    const seen = new Set<number>();
    for (let seed = 0; seed < 500; seed++) {
      const g = nf4MultiplyFractions.generate(makeRng(seed));
      const { n1, d1, n2, d2 } = parse(g.promptDetails ?? '');
      expect(allowed.has(d1), `seed ${seed}: d1 = ${d1}`).toBe(true);
      expect(allowed.has(d2), `seed ${seed}: d2 = ${d2}`).toBe(true);
      seen.add(d1);
      seen.add(d2);
      expect(n1).toBeGreaterThanOrEqual(1);
      expect(n1).toBeLessThan(d1);
      expect(n2).toBeGreaterThanOrEqual(1);
      expect(n2).toBeLessThan(d2);
      // The mediant and the cross-product are the one pair that can
      // coincide; those draws must never be reachable.
      expect((n1 + n2) * d1 * n2, `seed ${seed}`).not.toBe((d1 + d2) * n1 * d2);
    }
    expect([...seen].sort()).toEqual([2, 3, 4]);
  });

  describe('every distractor value matches the error its tag names', () => {
    for (const seed of [6, 44, 815, 4912, 31415926]) {
      it(`seed ${seed}`, () => {
        const g = nf4MultiplyFractions.generate(makeRng(seed));
        const { n1, d1, n2, d2 } = parse(g.promptDetails ?? '');

        expect(g.answerText).toBe(simplify(n1 * n2, d1 * d2));
        // Added straight across instead of multiplying.
        expect(optionText(g, 'added-numerators-and-denominators')).toBe(simplify(n1 + n2, d1 + d2));
        // Numerator of each times the denominator of the other.
        expect(optionText(g, 'multiplied-crosswise')).toBe(simplify(n1 * d2, d1 * n2));
        // Keep-change-flip applied to both fractions, in a problem that
        // needs no flip at all.
        expect(optionText(g, 'inverted-both-fractions')).toBe(simplify(d1 * d2, n1 * n2));
      });
    }
  });
});
