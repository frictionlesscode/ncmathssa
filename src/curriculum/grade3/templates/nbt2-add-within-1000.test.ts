import { describe, it, expect } from 'vitest';
import { assertTemplateSound } from '../../../engine/templateTesting';
import { makeRng } from '../../../engine/rng';
import {
  nbt2AddWithin1000,
  HUNDREDS_PAIRS,
  TENS_PAIRS,
  ONES_PAIRS,
} from './nbt2-add-within-1000';

/** Reads the two addends back out of the figure, independently of the code. */
function parse(details: string | undefined): { a: number; b: number } {
  const m = /^(\d+) \+ (\d+)$/.exec(details ?? '');
  if (!m) throw new Error(`unparsable figure: ${details}`);
  return { a: Number(m[1]), b: Number(m[2]) };
}

/** The whole option list, in order, as plain data a literal pin can compare
 *  against: label, text, whether it is the key, and its misconception tag. */
const shape = (g: {
  options: { label: string; text: string; isCorrect: boolean; misconception?: string }[];
}) => g.options.map((o) => [o.label, o.text, o.isCorrect, o.misconception ?? null]);

const optionValue = (g: ReturnType<typeof nbt2AddWithin1000.generate>, tag: string): number => {
  const opt = g.options.find((o) => o.misconception === tag);
  if (!opt) throw new Error(`no option tagged ${tag}`);
  return Number(opt.text);
};

describe('g3.nbt2.add-within-1000', () => {
  it('is sound at every seed', () => {
    assertTemplateSound(nbt2AddWithin1000);
  });

  it('is deterministic in its seed', () => {
    expect(nbt2AddWithin1000.generate(makeRng(42))).toEqual(
      nbt2AddWithin1000.generate(makeRng(42)),
    );
  });

  // LITERAL pins. Every other test here reads the addends back out of the
  // generator's own figure, so it would stay green through a change to the
  // seed -> digits mapping, to rng.pick ordering, or to the whole wording.
  // These hold the exact bytes at two seeds, taken from a real run.
  it('emits exactly this question at seed 7', () => {
    const g = nbt2AddWithin1000.generate(makeRng(7));
    expect(g.prompt).toBe('Add.');
    expect(g.promptDetails).toBe('309 + 128');
    expect(g.answerText).toBe('437');
    expect(shape(g)).toEqual([
      ['A', '181', false, 'subtracted-instead-of-added'],
      ['B', '437', true, null],
      ['C', '427', false, 'added-without-carrying'],
      ['D', '527', false, 'carried-into-the-wrong-column'],
    ]);
    expect(g.explanation.stepByStep[3]).toBe('Step 4: 309 + 128 = 437.');
  });

  it('emits exactly this question at seed 123', () => {
    const g = nbt2AddWithin1000.generate(makeRng(123));
    expect(g.prompt).toBe('Add.');
    expect(g.promptDetails).toBe('607 + 284');
    expect(g.answerText).toBe('891');
    expect(shape(g)).toEqual([
      ['A', '323', false, 'subtracted-instead-of-added'],
      ['B', '981', false, 'carried-into-the-wrong-column'],
      ['C', '881', false, 'added-without-carrying'],
      ['D', '891', true, null],
    ]);
  });

  // NC.3.NBT.2 is "whole numbers up to and including 1,000", in both
  // directions: no option may be negative and none may run past 1,000.
  it('keeps every number it prints inside 0 and 1,000', () => {
    for (let seed = 0; seed < 400; seed++) {
      const g = nbt2AddWithin1000.generate(makeRng(seed));
      const { a, b } = parse(g.promptDetails);
      for (const n of [a, b, ...g.options.map((o) => Number(o.text))]) {
        expect(Number.isInteger(n), `seed ${seed}: ${n} is not a whole number`).toBe(true);
        expect(n, `seed ${seed}: ${n} is negative`).toBeGreaterThanOrEqual(0);
        expect(n, `seed ${seed}: ${n} is past 1,000`).toBeLessThanOrEqual(1000);
      }
    }
  });

  // Every question regroups the ones exactly once, which is what makes the two
  // carry distractors one arithmetic step apart rather than two.
  it('always regroups the ones and never the tens', () => {
    for (let seed = 0; seed < 400; seed++) {
      const { a, b } = parse(nbt2AddWithin1000.generate(makeRng(seed)).promptDetails);
      expect((a % 10) + (b % 10), `seed ${seed}: ones do not regroup`).toBeGreaterThanOrEqual(10);
      expect(
        (Math.floor(a / 10) % 10) + (Math.floor(b / 10) % 10) + 1,
        `seed ${seed}: tens regroup too`,
      ).toBeLessThanOrEqual(9);
      expect(a, `seed ${seed}: a - b would be negative`).toBeGreaterThan(b);
    }
  });

  // The full draw space, not a sample: every combination of the three digit
  // lists, with all four option values recomputed from the digits.
  it('has no colliding option values anywhere in its draw space', () => {
    let drawn = 0;
    for (const h of HUNDREDS_PAIRS) {
      for (const t of TENS_PAIRS) {
        for (const o of ONES_PAIRS) {
          const a = 100 * h.hi + 10 * t.hi + o.hi;
          const b = 100 * h.lo + 10 * t.lo + o.lo;
          const values = [a + b, a + b - 10, a + b + 90, a - b];
          expect(new Set(values).size, `${a} + ${b} collides: ${values.join(', ')}`).toBe(4);
          expect(Math.max(...values), `${a} + ${b} runs past 1,000`).toBeLessThanOrEqual(1000);
          expect(Math.min(...values), `${a} + ${b} goes negative`).toBeGreaterThanOrEqual(0);
          drawn++;
        }
      }
    }
    expect(HUNDREDS_PAIRS.length, 'hundreds pairs').toBe(9);
    expect(TENS_PAIRS.length, 'tens pairs').toBe(45);
    expect(ONES_PAIRS.length, 'ones pairs').toBe(45);
    expect(drawn, 'draw space size').toBe(18225);
  });

  describe('every distractor is the value its tag names', () => {
    for (const seed of [3, 61, 904, 15207, 88888]) {
      it(`seed ${seed}`, () => {
        const g = nbt2AddWithin1000.generate(makeRng(seed));
        const { a, b } = parse(g.promptDetails);
        expect(Number(g.answerText)).toBe(a + b);
        expect(optionValue(g, 'added-without-carrying')).toBe(a + b - 10);
        expect(optionValue(g, 'carried-into-the-wrong-column')).toBe(a + b + 90);
        expect(optionValue(g, 'subtracted-instead-of-added')).toBe(a - b);
      });
    }
  });
});
