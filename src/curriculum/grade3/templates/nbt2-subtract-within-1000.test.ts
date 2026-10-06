import { describe, it, expect } from 'vitest';
import { assertTemplateSound } from '../../../engine/templateTesting';
import { makeRng } from '../../../engine/rng';
import {
  nbt2SubtractWithin1000,
  HUNDREDS_PAIRS,
  ONES_PAIRS,
} from './nbt2-subtract-within-1000';

/** Reads the two numbers back out of the figure, independently of the code. */
function parse(details: string | undefined): { a: number; b: number } {
  const m = /^(\d+) − (\d+)$/.exec(details ?? '');
  if (!m) throw new Error(`unparsable figure: ${details}`);
  return { a: Number(m[1]), b: Number(m[2]) };
}

const shape = (g: {
  options: { label: string; text: string; isCorrect: boolean; misconception?: string }[];
}) => g.options.map((o) => [o.label, o.text, o.isCorrect, o.misconception ?? null]);

const optionValue = (
  g: ReturnType<typeof nbt2SubtractWithin1000.generate>,
  tag: string,
): number => {
  const opt = g.options.find((o) => o.misconception === tag);
  if (!opt) throw new Error(`no option tagged ${tag}`);
  return Number(opt.text);
};

describe('g3.nbt2.subtract-within-1000', () => {
  it('is sound at every seed', () => {
    assertTemplateSound(nbt2SubtractWithin1000);
  });

  it('is deterministic in its seed', () => {
    expect(nbt2SubtractWithin1000.generate(makeRng(42))).toEqual(
      nbt2SubtractWithin1000.generate(makeRng(42)),
    );
  });

  // LITERAL pins, taken from a real run. Everything else in this file reads the
  // numbers back out of the generator's own figure and would therefore stay
  // green through a change to the seed -> digits mapping or to the wording.
  it('emits exactly this question at seed 7', () => {
    const g = nbt2SubtractWithin1000.generate(makeRng(7));
    expect(g.prompt).toBe('Subtract.');
    expect(g.promptDetails).toBe('307 − 109');
    expect(g.answerText).toBe('198');
    expect(shape(g)).toEqual([
      ['A', '416', false, 'added-instead-of-subtracted'],
      ['B', '198', true, null],
      ['C', '202', false, 'subtracted-without-regrouping'],
      ['D', '108', false, 'lost-the-regrouping-across-a-zero'],
    ]);
    expect(g.explanation.stepByStep[3]).toBe('Step 4: 307 − 109 = 198.');
  });

  it('emits exactly this question at seed 123', () => {
    const g = nbt2SubtractWithin1000.generate(makeRng(123));
    expect(g.prompt).toBe('Subtract.');
    expect(g.promptDetails).toBe('602 − 218');
    expect(g.answerText).toBe('384');
    expect(shape(g)).toEqual([
      ['A', '820', false, 'added-instead-of-subtracted'],
      ['B', '314', false, 'lost-the-regrouping-across-a-zero'],
      ['C', '416', false, 'subtracted-without-regrouping'],
      ['D', '384', true, null],
    ]);
  });

  // The whole point of this generator: the top number always has a 0 in the
  // tens and always needs a trade in the ones, so the regroup has to come from
  // the hundreds and stop in the tens on its way. Lose that and the
  // lost-the-regrouping-across-a-zero distractor is no longer an error a child
  // can make on this question.
  it('always subtracts across a zero', () => {
    for (let seed = 0; seed < 400; seed++) {
      const { a, b } = parse(nbt2SubtractWithin1000.generate(makeRng(seed)).promptDetails);
      expect(Math.floor(a / 10) % 10, `seed ${seed}: ${a} has no 0 in the tens`).toBe(0);
      expect(b % 10, `seed ${seed}: ${a} - ${b} needs no trade`).toBeGreaterThan(a % 10);
      expect(a, `seed ${seed}: the difference is negative`).toBeGreaterThan(b);
    }
  });

  it('keeps every number it prints inside 0 and 1,000', () => {
    for (let seed = 0; seed < 400; seed++) {
      const g = nbt2SubtractWithin1000.generate(makeRng(seed));
      const { a, b } = parse(g.promptDetails);
      for (const n of [a, b, ...g.options.map((o) => Number(o.text))]) {
        expect(Number.isInteger(n), `seed ${seed}: ${n} is not a whole number`).toBe(true);
        expect(n, `seed ${seed}: ${n} is negative`).toBeGreaterThanOrEqual(0);
        expect(n, `seed ${seed}: ${n} is past 1,000`).toBeLessThanOrEqual(1000);
      }
    }
  });

  // The full draw space, not a sample.
  it('has no colliding option values anywhere in its draw space', () => {
    let drawn = 0;
    for (const h of HUNDREDS_PAIRS) {
      for (let b1 = 0; b1 <= 9; b1++) {
        for (const o of ONES_PAIRS) {
          const a = 100 * h.hi + o.hi;
          const b = 100 * h.lo + 10 * b1 + o.lo;
          const values = [
            a - b,
            100 * (h.hi - h.lo) + 10 * b1 + (o.lo - o.hi),
            100 * (h.hi - 1 - h.lo) + 10 * b1 + (o.hi + 10 - o.lo),
            a + b,
          ];
          expect(new Set(values).size, `${a} - ${b} collides: ${values.join(', ')}`).toBe(4);
          expect(Math.max(...values), `${a} - ${b} runs past 1,000`).toBeLessThanOrEqual(1000);
          // Three digits each, so no option can be ruled out on length alone.
          expect(Math.min(...values), `${a} - ${b} emits a short option`).toBeGreaterThanOrEqual(
            100,
          );
          drawn++;
        }
      }
    }
    expect(HUNDREDS_PAIRS.length, 'hundreds pairs').toBe(9);
    expect(ONES_PAIRS.length, 'ones pairs').toBe(45);
    expect(drawn, 'draw space size').toBe(4050);
  });

  describe('every distractor is the value its tag names', () => {
    for (const seed of [3, 61, 904, 15207, 88888]) {
      it(`seed ${seed}`, () => {
        const g = nbt2SubtractWithin1000.generate(makeRng(seed));
        const { a, b } = parse(g.promptDetails);
        const [a2, a0] = [Math.floor(a / 100), a % 10];
        const [b2, b1, b0] = [Math.floor(b / 100), Math.floor(b / 10) % 10, b % 10];

        expect(Number(g.answerText)).toBe(a - b);
        // Every column done smaller-from-larger, so nothing is ever traded.
        expect(optionValue(g, 'subtracted-without-regrouping')).toBe(
          100 * (a2 - b2) + 10 * b1 + (b0 - a0),
        );
        // A hundred traded straight past the 0 into the ones, so the tens digit
        // stays a 0 and b1 is taken from it as if it were a 9.
        expect(optionValue(g, 'lost-the-regrouping-across-a-zero')).toBe(
          100 * (a2 - 1 - b2) + 10 * b1 + (a0 + 10 - b0),
        );
        expect(optionValue(g, 'added-instead-of-subtracted')).toBe(a + b);
      });
    }
  });
});
