import { describe, it, expect } from 'vitest';
import { assertTemplateSound } from '../../../engine/templateTesting';
import { makeRng } from '../../../engine/rng';
import { nbt3MultiplyByMultipleOfTen, FACTOR_PAIRS } from './nbt3-multiply-by-multiple-of-ten';

/** Reads the two factors back out of the prompt, independently of the code. */
function parse(prompt: string): { a: number; m: number } {
  const match = /^Each group below shows \d+ tens?\. What is (\d+) × (\d+)\?$/.exec(prompt);
  if (!match) throw new Error(`unparsable prompt: ${prompt}`);
  return { a: Number(match[1]), m: Number(match[2]) };
}

const shape = (g: {
  options: { label: string; text: string; isCorrect: boolean; misconception?: string }[];
}) => g.options.map((o) => [o.label, o.text, o.isCorrect, o.misconception ?? null]);

const optionValue = (
  g: ReturnType<typeof nbt3MultiplyByMultipleOfTen.generate>,
  tag: string,
): number => {
  const opt = g.options.find((o) => o.misconception === tag);
  if (!opt) throw new Error(`no option tagged ${tag}`);
  return Number(opt.text);
};

describe('g3.nbt3.multiply-by-multiple-of-ten', () => {
  it('is sound at every seed', () => {
    assertTemplateSound(nbt3MultiplyByMultipleOfTen);
  });

  it('is deterministic in its seed', () => {
    expect(nbt3MultiplyByMultipleOfTen.generate(makeRng(42))).toEqual(
      nbt3MultiplyByMultipleOfTen.generate(makeRng(42)),
    );
  });

  // LITERAL pins, taken from a real run.
  it('emits exactly this question at seed 7', () => {
    const g = nbt3MultiplyByMultipleOfTen.generate(makeRng(7));
    expect(g.prompt).toBe('Each group below shows 1 ten. What is 2 × 10?');
    expect(g.promptDetails).toBe('[10]\n[10]');
    expect(g.answerText).toBe('20');
    expect(shape(g)).toEqual([
      ['A', '10', false, 'skip-counted-one-group-short'],
      ['B', '2', false, 'dropped-the-zero-from-the-multiple-of-ten'],
      ['C', '12', false, 'added-instead-of-multiplied'],
      ['D', '20', true, null],
    ]);
    expect(g.explanation.stepByStep[3]).toBe('Step 4: 2 × 10 = 20.');
  });

  it('emits exactly this question at seed 123', () => {
    const g = nbt3MultiplyByMultipleOfTen.generate(makeRng(123));
    expect(g.prompt).toBe('Each group below shows 3 tens. What is 8 × 30?');
    expect(g.promptDetails).toBe(
      '[10] [10] [10]\n[10] [10] [10]\n[10] [10] [10]\n[10] [10] [10]\n[10] [10] [10]\n[10] [10] [10]\n[10] [10] [10]\n[10] [10] [10]',
    );
    expect(g.answerText).toBe('240');
    expect(shape(g)).toEqual([
      ['A', '38', false, 'added-instead-of-multiplied'],
      ['B', '210', false, 'skip-counted-one-group-short'],
      ['C', '24', false, 'dropped-the-zero-from-the-multiple-of-ten'],
      ['D', '240', true, null],
    ]);
  });

  // Ruling 13-4. NC.3.NBT.3 is "a one-digit whole number by a multiple of 10 IN
  // THE RANGE 10-90", so 100 is out and so is any second factor that is not a
  // multiple of 10. The largest product the standard permits is 9 x 90 = 810.
  it('never leaves the 10 to 90 range', () => {
    for (let seed = 0; seed < 400; seed++) {
      const g = nbt3MultiplyByMultipleOfTen.generate(makeRng(seed));
      const { a, m } = parse(g.prompt);
      expect(a, `seed ${seed}: a=${a}`).toBeGreaterThanOrEqual(2);
      expect(a, `seed ${seed}: a=${a}`).toBeLessThanOrEqual(9);
      expect(m, `seed ${seed}: m=${m}`).toBeGreaterThanOrEqual(10);
      expect(m, `seed ${seed}: m=${m}`).toBeLessThanOrEqual(90);
      expect(m % 10, `seed ${seed}: ${m} is not a multiple of 10`).toBe(0);
      expect(a * m, `seed ${seed}: product past 9 x 90`).toBeLessThanOrEqual(810);
    }
  });

  // Two rows of tens drawn for a = 2, nine for a = 9: the standard asks for a
  // PICTORIAL model, not just the numbers.
  it('draws one row of ten-rods per group', () => {
    for (let seed = 0; seed < 200; seed++) {
      const g = nbt3MultiplyByMultipleOfTen.generate(makeRng(seed));
      const { a, m } = parse(g.prompt);
      const rows = (g.promptDetails ?? '').split('\n');
      expect(rows.length, `seed ${seed}: rows`).toBe(a);
      for (const row of rows) {
        expect(row.split(' ').length, `seed ${seed}: rods per row`).toBe(m / 10);
      }
    }
  });

  // The full 72-pair draw space, not a sample.
  it('has no colliding option values anywhere in its draw space', () => {
    for (const { a, t } of FACTOR_PAIRS) {
      const m = 10 * t;
      const values = [a * m, a * t, a + m, (a - 1) * m];
      expect(new Set(values).size, `(a=${a}, m=${m}) collides: ${values.join(', ')}`).toBe(4);
      expect(Math.max(...values), `(a=${a}, m=${m}) exceeds 810`).toBeLessThanOrEqual(810);
    }
    expect(FACTOR_PAIRS.length, 'draw space size').toBe(72);
  });

  describe('every distractor is the value its tag names', () => {
    for (const seed of [3, 61, 904, 15207, 88888]) {
      it(`seed ${seed}`, () => {
        const g = nbt3MultiplyByMultipleOfTen.generate(makeRng(seed));
        const { a, m } = parse(g.prompt);
        expect(Number(g.answerText)).toBe(a * m);
        expect(optionValue(g, 'dropped-the-zero-from-the-multiple-of-ten')).toBe(a * (m / 10));
        expect(optionValue(g, 'added-instead-of-multiplied')).toBe(a + m);
        expect(optionValue(g, 'skip-counted-one-group-short')).toBe((a - 1) * m);
      });
    }
  });
});
