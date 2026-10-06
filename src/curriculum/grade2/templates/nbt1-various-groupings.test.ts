import { describe, it, expect } from 'vitest';
import { assertTemplateSound } from '../../../engine/templateTesting';
import { makeRng } from '../../../engine/rng';
import { nbt1VariousGroupings } from './nbt1-various-groupings';

/** The whole option list, in order, as plain data a literal pin can compare
 *  against: label, text, whether it is the key, and its misconception tag. */
const shape = (g: {
  options: { label: string; text: string; isCorrect: boolean; misconception?: string }[];
}) => g.options.map((o) => [o.label, o.text, o.isCorrect, o.misconception ?? null]);

/** Reads a grouping string back into the number it names, independently of the
 *  generator's own arithmetic. */
function valueOf(text: string): number {
  const m = /^(\d+) hundreds?, (\d+) tens?, and (\d+) ones?$/.exec(text);
  if (!m) throw new Error(`unparsable grouping: ${text}`);
  return 100 * Number(m[1]) + 10 * Number(m[2]) + Number(m[3]);
}

describe('g2.nbt1.various-groupings', () => {
  it('is sound at every seed', () => {
    assertTemplateSound(nbt1VariousGroupings);
  });

  it('is deterministic in its seed', () => {
    expect(nbt1VariousGroupings.generate(makeRng(42))).toEqual(
      nbt1VariousGroupings.generate(makeRng(42)),
    );
  });

  // LITERAL pins. Every other test in this file reads the figures back out of
  // the generator's own output, so it would stay green through a change to the
  // seed -> digit mapping, to rng.pick ordering, or to the whole wording.
  // These hold the exact bytes at two seeds, copied from a real run.
  it('emits exactly this question at seed 7', () => {
    const g = nbt1VariousGroupings.generate(makeRng(7));
    expect(g.prompt).toBe('Trade one hundred for ten tens. Which grouping shows the same number?');
    expect(g.promptDetails).toBe('2 hundreds, 1 ten, and 8 ones');
    expect(g.answerText).toBe('1 hundred, 11 tens, and 8 ones');
    expect(shape(g)).toEqual([
      ['A', '1 hundred, 2 tens, and 8 ones', false, 'traded-a-hundred-for-one-ten'],
      ['B', '1 hundred, 11 tens, and 8 ones', true, null],
      ['C', '1 hundred, 1 ten, and 8 ones', false, 'lost-the-hundred-in-the-trade'],
      ['D', '2 hundreds, 11 tens, and 8 ones', false, 'kept-the-hundred-and-the-ten-tens-both'],
    ]);
    expect(g.explanation.stepByStep[0]).toBe(
      'Step 1: The number starts as 2 hundreds, 1 ten, and 8 ones, which is 218.',
    );
    expect(g.explanation.stepByStep[3]).toBe(
      'Step 4: The same number, grouped a new way, is 1 hundred, 11 tens, and 8 ones.',
    );
  });

  it('emits exactly this question at seed 123', () => {
    const g = nbt1VariousGroupings.generate(makeRng(123));
    expect(g.promptDetails).toBe('7 hundreds, 2 tens, and 4 ones');
    expect(g.answerText).toBe('6 hundreds, 12 tens, and 4 ones');
    expect(shape(g)).toEqual([
      ['A', '6 hundreds, 3 tens, and 4 ones', false, 'traded-a-hundred-for-one-ten'],
      ['B', '7 hundreds, 12 tens, and 4 ones', false, 'kept-the-hundred-and-the-ten-tens-both'],
      ['C', '6 hundreds, 2 tens, and 4 ones', false, 'lost-the-hundred-in-the-trade'],
      ['D', '6 hundreds, 12 tens, and 4 ones', true, null],
    ]);
  });

  // The whole point of the standard: the traded grouping names the SAME number
  // the figure does, and the three distractors name numbers 100 too small,
  // 100 too large, and 90 too small.
  it('keeps the traded grouping equal to the figure, at every seed', () => {
    for (let seed = 0; seed < 400; seed++) {
      const g = nbt1VariousGroupings.generate(makeRng(seed));
      const n = valueOf(g.promptDetails!);
      expect(valueOf(g.answerText), `seed ${seed}`).toBe(n);
      const byTag = (tag: string) =>
        valueOf(g.options.find((o) => o.misconception === tag)!.text);
      expect(byTag('lost-the-hundred-in-the-trade'), `seed ${seed}`).toBe(n - 100);
      expect(byTag('kept-the-hundred-and-the-ten-tens-both'), `seed ${seed}`).toBe(n + 100);
      expect(byTag('traded-a-hundred-for-one-ten'), `seed ${seed}`).toBe(n - 90);
      expect(n, `seed ${seed}`).toBeGreaterThanOrEqual(211);
      expect(n, `seed ${seed}`).toBeLessThanOrEqual(888);
    }
  });

  // Never "1 tens". A seven-year-old reads these.
  it('writes every place name with the right plural, at every seed', () => {
    for (let seed = 0; seed < 400; seed++) {
      const g = nbt1VariousGroupings.generate(makeRng(seed));
      const all = [g.prompt, g.promptDetails ?? '', ...g.options.map((o) => o.text),
        ...g.explanation.stepByStep, g.explanation.conceptSummary,
        g.explanation.commonMisconception ?? ''].join(' ');
      // \b so that "11 tens" does not read as a stray "1 tens".
      for (const word of ['hundred', 'ten', 'one']) {
        expect(
          new RegExp(`\\b1 ${word}s\\b`).test(all),
          `seed ${seed}: plural after 1 ${word}`,
        ).toBe(false);
        expect(
          new RegExp(`\\b([02-9]|\\d\\d+) ${word}\\b`).test(all),
          `seed ${seed}: singular after a number that is not 1 (${word})`,
        ).toBe(false);
      }
    }
  });

  // The full draw space, not a sample: every (h, t, o) the generator can pick,
  // with all four option texts and values recomputed from the digits.
  it('has no colliding option text or value anywhere in its draw space', () => {
    const failures: string[] = [];
    let drawn = 0;
    for (let h = 2; h <= 8; h++) {
      for (let t = 1; t <= 8; t++) {
        for (let o = 1; o <= 8; o++) {
          const texts = [
            `${h - 1}H ${t + 10}T ${o}O`,
            `${h - 1}H ${t}T ${o}O`,
            `${h}H ${t + 10}T ${o}O`,
            `${h - 1}H ${t + 1}T ${o}O`,
          ];
          const n = 100 * h + 10 * t + o;
          const values = [n, n - 100, n + 100, n - 90];
          if (new Set(texts).size !== 4) failures.push(`text collision at ${h},${t},${o}`);
          if (new Set(values).size !== 4) failures.push(`value collision at ${h},${t},${o}`);
          if (Math.min(...values) < 100 || Math.max(...values) > 1000) {
            failures.push(`out of range at ${h},${t},${o}: ${values.join(', ')}`);
          }
          drawn++;
        }
      }
    }
    expect(failures).toEqual([]);
    expect(drawn, 'draw space size').toBe(448);
  });
});
