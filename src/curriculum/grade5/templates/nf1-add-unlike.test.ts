import { describe, it, expect } from 'vitest';
import { makeRng } from '../../../engine/rng';
import { assertTemplateSound } from '../../../engine/templateTesting';
import { nf1AddUnlike } from './nf1-add-unlike';

describe('nf1AddUnlike', () => {
  it('satisfies every template invariant across 300 seeds', () => {
    assertTemplateSound(nf1AddUnlike);
  });

  it('is deterministic in its seed', () => {
    const a = nf1AddUnlike.generate(makeRng(777));
    const b = nf1AddUnlike.generate(makeRng(777));
    expect(a).toEqual(b);
  });

  it('always uses related denominators, as NC.5.NF.1 requires', () => {
    // NC limits grade 5 to denominators where one is a multiple of the
    // other; a generator emitting 2/5 + 1/3 would be off-standard.
    for (let seed = 0; seed < 200; seed++) {
      const g = nf1AddUnlike.generate(makeRng(seed));
      const dens = [...(g.promptDetails ?? '').matchAll(/\d+\/(\d+)/g)].map((m) => Number(m[1]));
      expect(dens).toHaveLength(2);
      const [d1, d2] = dens;
      expect(Math.max(d1, d2) % Math.min(d1, d2), `seed ${seed}: ${d1}, ${d2}`).toBe(0);
      expect(d1).not.toBe(d2);
    }
  });

  it('produces the added-across distractor', () => {
    const g = nf1AddUnlike.generate(makeRng(3));
    const tags = g.options.filter((o) => !o.isCorrect).map((o) => o.misconception);
    expect(tags).toContain('added-numerators-and-denominators');
  });

  describe('every distractor value matches the error its tag names', () => {
    // Independently recomputed from the prompt's own numbers, not the
    // generator's internal variables, so this test can catch a distractor
    // whose value doesn't actually correspond to its misconception tag
    // (the class of bug that produced the original scaled-the-wrong-addend
    // collision).
    const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b));
    const simplify = (n: number, d: number): string => {
      const g = gcd(n, d) || 1;
      const sn = n / g;
      const sd = d / g;
      return sd === 1 ? `${sn}` : `${sn}/${sd}`;
    };

    const optionText = (g: ReturnType<typeof nf1AddUnlike.generate>, tag: string): string => {
      const opt = g.options.find((o) => o.misconception === tag);
      if (!opt) throw new Error(`no option tagged ${tag}`);
      return opt.text;
    };

    for (const seed of [1, 2, 3, 42, 999]) {
      it(`seed ${seed}`, () => {
        const g = nf1AddUnlike.generate(makeRng(seed));
        const match = (g.promptDetails ?? '').match(
          /^(\d+)\/(\d+) \+ (\d+)\/(\d+)$/,
        );
        expect(match, `unparsable promptDetails: ${g.promptDetails}`).toBeTruthy();
        const [, nSmallStr, dSmallStr, nLargeStr, dLargeStr] = match!;
        const nSmall = Number(nSmallStr);
        const dSmall = Number(dSmallStr);
        const nLarge = Number(nLargeStr);
        const dLarge = Number(dLargeStr);
        const factor = dLarge / dSmall;

        const answer = simplify(nSmall * factor + nLarge, dLarge);
        const addedAcross = simplify(nSmall + nLarge, dSmall + dLarge);
        const notScaled = simplify(nSmall + nLarge, dLarge);
        const wrongAddend = simplify(nSmall + nLarge * factor, dLarge);

        expect(g.answerText).toBe(answer);
        expect(optionText(g, 'added-numerators-and-denominators')).toBe(addedAcross);
        expect(optionText(g, 'common-denominator-numerator-not-scaled')).toBe(notScaled);
        expect(optionText(g, 'scaled-the-wrong-addend')).toBe(wrongAddend);
      });
    }
  });
});
