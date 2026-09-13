import { describe, it, expect } from 'vitest';
import { assertTemplateSound } from '../../../engine/templateTesting';
import { makeRng } from '../../../engine/rng';
import { nbt7CompareNumbers } from './nbt7-compare-numbers';

const listOf = (text: string): number[] =>
  text.split('; ').map((t) => Number(t.replace(/,/g, '')));

const taggedList = (
  g: ReturnType<typeof nbt7CompareNumbers.generate>,
  tag: string,
): number[] => {
  const opt = g.options.find((o) => o.misconception === tag);
  if (!opt) throw new Error(`no option tagged ${tag}`);
  return listOf(opt.text);
};

describe('g4.nbt7.compare-numbers', () => {
  it('is sound at every seed', () => {
    assertTemplateSound(nbt7CompareNumbers);
  });

  it('is deterministic in its seed', () => {
    expect(nbt7CompareNumbers.generate(makeRng(42))).toEqual(
      nbt7CompareNumbers.generate(makeRng(42)),
    );
  });

  it('produces a known question at a pinned seed', () => {
    const g = nbt7CompareNumbers.generate(makeRng(19));
    expect(g.options.find((o) => o.isCorrect)!.text).toBe(g.answerText);
    expect(g.promptDetails!.length).toBeGreaterThan(0);
  });

  it('the correct option really is least to greatest, and inside 100,000', () => {
    for (let seed = 0; seed < 300; seed++) {
      const g = nbt7CompareNumbers.generate(makeRng(seed));
      const order = listOf(g.answerText);
      expect(order.length, `seed ${seed}`).toBe(3);
      expect([...order].sort((x, y) => x - y), `seed ${seed}`).toEqual(order);
      for (const v of order) expect(v, `seed ${seed}`).toBeLessThanOrEqual(100000);
      // One four-digit number against two five-digit ones: the comparison
      // turns on counting places before comparing any digit.
      expect(order[0], `seed ${seed}`).toBeLessThan(10000);
      expect(order[1], `seed ${seed}`).toBeGreaterThanOrEqual(10000);
    }
  });

  it('the numbers presented are the numbers offered, in a different order', () => {
    for (let seed = 0; seed < 300; seed++) {
      const g = nbt7CompareNumbers.generate(makeRng(seed));
      const shown = listOf(g.promptDetails!);
      expect([...shown].sort(), `seed ${seed}`).toEqual([...listOf(g.answerText)].sort());
      expect(g.promptDetails, `seed ${seed}: presented in the answer's order`).not.toBe(
        g.answerText,
      );
    }
  });

  describe('every distractor is the ordering its tag names', () => {
    for (const seed of [2, 45, 700, 31007, 77777]) {
      it(`seed ${seed}`, () => {
        const g = nbt7CompareNumbers.generate(makeRng(seed));
        const [small, middle, large] = listOf(g.answerText);

        // The right order run backwards.
        expect(taggedList(g, 'ordered-from-the-wrong-end')).toEqual([large, middle, small]);

        // Leading digits compared without counting places: the four-digit
        // number starts with the biggest digit, so it was pushed to the end.
        const byLeadingDigit = taggedList(g, 'compared-leading-digits-without-place-value');
        expect(byLeadingDigit).toEqual([middle, large, small]);
        expect(`${small}`[0] > `${middle}`[0]).toBe(true);

        // Ordered by the ones digit alone.
        const byOnes = taggedList(g, 'compared-the-wrong-place-first');
        expect(byOnes).toEqual([large, small, middle]);
        expect(byOnes.map((v) => v % 10)).toEqual(
          [...byOnes.map((v) => v % 10)].sort((x, y) => x - y),
        );
      });
    }
  });

  it('sweeps its whole parameter space without a collision', () => {
    // The four options are four different permutations of three numbers, so
    // the only way two could coincide is for two of the numbers to be equal.
    // The parameters that fix the ordering are the shared ten thousands digit
    // t, the four-digit number's leading digit s4, the two thousands digits
    // p < q, and the three ones digits o1 < o2 < o3. The six free hundreds and
    // tens digits are excluded from this space deliberately: the four-digit
    // number is below every five-digit one, and the other two already differ
    // at the thousands place, so no value of those six can change the order.
    let checked = 0;
    const failures: string[] = [];
    for (let t = 1; t <= 8; t++) {
      for (let s4 = t + 1; s4 <= 9; s4++) {
        for (let p = 0; p <= 8; p++) {
          for (let q = p + 1; q <= 9; q++) {
            for (let o1 = 0; o1 <= 7; o1++) {
              for (let o2 = o1 + 1; o2 <= 8; o2++) {
                for (let o3 = o2 + 1; o3 <= 9; o3++) {
                  // Middle digits fixed at 0 here; they cannot affect the
                  // ordering, and the ordering is the only thing at issue.
                  const small = s4 * 1000 + o2;
                  const middle = t * 10000 + p * 1000 + o3;
                  const large = t * 10000 + q * 1000 + o1;
                  const where = `t=${t} s4=${s4} p=${p} q=${q} ones=${o1}/${o2}/${o3}`;
                  if (!(small < middle && middle < large)) failures.push(`order ${where}`);
                  const orders = new Set([
                    `${small};${middle};${large}`,
                    `${large};${middle};${small}`,
                    `${middle};${large};${small}`,
                    `${large};${small};${middle}`,
                  ]);
                  if (orders.size !== 4) failures.push(`collision ${where}`);
                  checked++;
                }
              }
            }
          }
        }
      }
    }
    expect(failures.slice(0, 5)).toEqual([]);
    expect(checked).toBe(36 * 45 * 120);
  });
});
