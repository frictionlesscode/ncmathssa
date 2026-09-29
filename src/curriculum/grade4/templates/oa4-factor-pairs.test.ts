import { describe, it, expect } from 'vitest';
import { assertTemplateSound } from '../../../engine/templateTesting';
import { makeRng } from '../../../engine/rng';
import { oa4FactorPairs } from './oa4-factor-pairs';

/** Independent factor-pair finder, written from scratch here so this test
 *  cannot inherit a bug from the generator's own helper. */
function pairsOf(n: number): string[] {
  const out: string[] = [];
  for (let a = 1; a <= n; a++) {
    if (n % a === 0 && a <= n / a) out.push(`${a} × ${n / a}`);
  }
  return out;
}

const numberIn = (prompt: string): number => {
  const m = prompt.match(/factor pairs of (\d+)\?/);
  if (!m) throw new Error(`unparsable prompt: ${prompt}`);
  return Number(m[1]);
};

const optionText = (g: ReturnType<typeof oa4FactorPairs.generate>, tag: string): string => {
  const opt = g.options.find((o) => o.misconception === tag);
  if (!opt) throw new Error(`no option tagged ${tag}`);
  return opt.text;
};

describe('g4.oa4.factor-pairs', () => {
  it('is sound at every seed', () => {
    assertTemplateSound(oa4FactorPairs);
  });

  it('is deterministic in its seed', () => {
    const a = oa4FactorPairs.generate(makeRng(42));
    const b = oa4FactorPairs.generate(makeRng(42));
    expect(a).toEqual(b);
  });

  it('produces a known question at a pinned seed', () => {
    const g = oa4FactorPairs.generate(makeRng(7));
    expect(g.options.find((o) => o.isCorrect)!.text).toBe(g.answerText);
    expect(g.prompt.length).toBeGreaterThan(0);
  });

  it('stays inside the standard: whole numbers up to and including 50', () => {
    for (let seed = 0; seed < 300; seed++) {
      const n = numberIn(oa4FactorPairs.generate(makeRng(seed)).prompt);
      expect(n, `seed ${seed}`).toBeLessThanOrEqual(50);
      expect(n, `seed ${seed}`).toBeGreaterThanOrEqual(2);
    }
  });

  it('lists exactly the real factor pairs, and always at least three', () => {
    for (let seed = 0; seed < 300; seed++) {
      const g = oa4FactorPairs.generate(makeRng(seed));
      const expected = pairsOf(numberIn(g.prompt));
      expect(expected.length, `seed ${seed}`).toBeGreaterThanOrEqual(3);
      expect(g.answerText, `seed ${seed}`).toBe(expected.join(', '));
    }
  });

  describe('every distractor is the list its tag names', () => {
    for (const seed of [3, 61, 904, 15207, 88888]) {
      it(`seed ${seed}`, () => {
        const g = oa4FactorPairs.generate(makeRng(seed));
        const n = numberIn(g.prompt);
        const expected = pairsOf(n);

        // Stopped one divisor short of finishing the search.
        expect(optionText(g, 'stopped-the-divisor-check-early')).toBe(
          expected.slice(0, -1).join(', '),
        );

        // Exactly one extra entry, and its first factor does not divide n.
        const bogus = optionText(g, 'counted-an-uneven-division-as-a-factor').split(', ');
        expect(bogus.length).toBe(expected.length + 1);
        const extra = bogus.filter((p) => !expected.includes(p));
        expect(extra.length).toBe(1);
        const d = Number(extra[0].split(' ')[0]);
        expect(n % d, `${d} should not divide ${n}`).not.toBe(0);

        // Multiples of n listed where its factors were asked for.
        expect(optionText(g, 'confused-factor-with-multiple')).toBe(
          `${n}, ${2 * n}, ${3 * n}, ${4 * n}`,
        );
      });
    }
  });
});
