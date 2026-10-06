import { describe, it, expect } from 'vitest';
import { assertTemplateSound } from '../../../engine/templateTesting';
import { makeRng } from '../../../engine/rng';
import { nbt6DivideOneDigit } from './nbt6-divide-one-digit';

const bare = (s: string): number => Number(s.replace(/,/g, ''));

function operands(details: string): { dividend: number; divisor: number } {
  const m = details.match(/^([\d,]+) ÷ (\d+)$/);
  if (!m) throw new Error(`unparsable promptDetails: ${details}`);
  return { dividend: bare(m[1]), divisor: Number(m[2]) };
}

const taggedText = (
  g: ReturnType<typeof nbt6DivideOneDigit.generate>,
  tag: string,
): string => {
  const opt = g.options.find((o) => o.misconception === tag);
  if (!opt) throw new Error(`no option tagged ${tag}`);
  return opt.text;
};

describe('g4.nbt6.divide-one-digit', () => {
  it('is sound at every seed', () => {
    assertTemplateSound(nbt6DivideOneDigit);
  });

  it('is deterministic in its seed', () => {
    expect(nbt6DivideOneDigit.generate(makeRng(42))).toEqual(
      nbt6DivideOneDigit.generate(makeRng(42)),
    );
  });

  it('produces a known question at a pinned seed', () => {
    const g = nbt6DivideOneDigit.generate(makeRng(23));
    expect(g.options.find((o) => o.isCorrect)!.text).toBe(g.answerText);
    expect(g.promptDetails!.length).toBeGreaterThan(0);
  });

  it('stays inside the standard: ONE-digit divisors, dividends under 1,000', () => {
    for (let seed = 0; seed < 300; seed++) {
      const { dividend, divisor } = operands(
        nbt6DivideOneDigit.generate(makeRng(seed)).promptDetails!,
      );
      // Two-digit divisors are NC.5.NBT.6, a grade above this template.
      expect(divisor, `seed ${seed}`).toBeGreaterThanOrEqual(2);
      expect(divisor, `seed ${seed}`).toBeLessThanOrEqual(9);
      expect(dividend, `seed ${seed}`).toBeLessThanOrEqual(999);
    }
  });

  it('the correct option is the quotient and a real, non-zero remainder', () => {
    for (let seed = 0; seed < 300; seed++) {
      const g = nbt6DivideOneDigit.generate(makeRng(seed));
      const { dividend, divisor } = operands(g.promptDetails!);
      const m = g.answerText.match(/^(\d+) R (\d+)$/);
      expect(m, `seed ${seed}: ${g.answerText}`).toBeTruthy();
      const q = Number(m![1]);
      const r = Number(m![2]);
      expect(divisor * q + r, `seed ${seed}`).toBe(dividend);
      // A remainder of zero would make "dropped the remainder" the answer.
      expect(r, `seed ${seed}`).toBeGreaterThan(0);
      expect(r, `seed ${seed}`).toBeLessThan(divisor);
    }
  });

  describe('every distractor is the value its tag names', () => {
    for (const seed of [6, 120, 3003, 44444, 91827]) {
      it(`seed ${seed}`, () => {
        const g = nbt6DivideOneDigit.generate(makeRng(seed));
        const { dividend, divisor } = operands(g.promptDetails!);
        const [q, r] = g.answerText.split(' R ').map(Number);

        expect(taggedText(g, 'ignored-remainder')).toBe(`${q}`);
        expect(bare(taggedText(g, 'multiplied-instead-of-divided'))).toBe(dividend * divisor);
        expect(taggedText(g, 'misplaced-digits-in-the-quotient')).toBe(`${q * 10} R ${r}`);
      });
    }
  });

  it('sweeps its whole parameter space without a collision', () => {
    const failures: string[] = [];
    let checked = 0;
    for (let d = 2; d <= 9; d++) {
      for (let q = 12; q <= 99; q++) {
        for (let r = 1; r <= d - 1; r++) {
          const n = d * q + r;
          const texts = new Set([`${q} R ${r}`, `${q}`, `${n * d}`, `${q * 10} R ${r}`]);
          if (texts.size !== 4) failures.push(`d=${d} q=${q} r=${r}`);
          if (n > 999) failures.push(`out of range d=${d} q=${q} r=${r} -> ${n}`);
          checked++;
        }
      }
    }
    expect(failures.slice(0, 5)).toEqual([]);
    expect(checked).toBe(88 * 36);
  });
});
