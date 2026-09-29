import { describe, it, expect } from 'vitest';
import { assertTemplateSound } from '../../../engine/templateTesting';
import { makeRng } from '../../../engine/rng';
import { nbt5SubtractWithin100, TENS_PAIRS, ONES_PAIRS } from './nbt5-subtract-within-100';

const shape = (g: {
  options: { label: string; text: string; isCorrect: boolean; misconception?: string }[];
}) => g.options.map((o) => [o.label, o.text, o.isCorrect, o.misconception ?? null]);

function parse(details: string | undefined): { a: number; op: string; b: number } {
  const m = /^(\d+) ([+−]) (\d+)$/.exec(details ?? '');
  if (!m) throw new Error(`unparsable figure: ${details}`);
  return { a: Number(m[1]), op: m[2], b: Number(m[3]) };
}

describe('g2.nbt5.subtract-within-100', () => {
  it('is sound at every seed', () => {
    assertTemplateSound(nbt5SubtractWithin100);
  });

  it('is deterministic in its seed', () => {
    expect(nbt5SubtractWithin100.generate(makeRng(42))).toEqual(
      nbt5SubtractWithin100.generate(makeRng(42)),
    );
  });

  // LITERAL pins, copied from a real run at these two seeds.
  it('emits exactly this question at seed 7', () => {
    const g = nbt5SubtractWithin100.generate(makeRng(7));
    expect(g.prompt).toBe('Subtract these numbers in your head.');
    expect(g.promptDetails).toBe('20 − 13');
    expect(g.answerText).toBe('7');
    expect(shape(g)).toEqual([
      ['A', '7', true, null],
      ['B', '13', false, 'subtracted-without-regrouping'],
      ['C', '17', false, 'borrowed-without-reducing-the-next-column'],
      ['D', '33', false, 'added-instead-of-subtracted'],
    ]);
    expect(g.explanation.stepByStep[3]).toBe('Step 4: 20 − 13 = 7.');
  });

  it('emits exactly this question at seed 123', () => {
    const g = nbt5SubtractWithin100.generate(makeRng(123));
    expect(g.promptDetails).toBe('60 − 19');
    expect(g.answerText).toBe('41');
    expect(shape(g)).toEqual([
      ['A', '79', false, 'added-instead-of-subtracted'],
      ['B', '51', false, 'borrowed-without-reducing-the-next-column'],
      ['C', '41', true, null],
      ['D', '59', false, 'subtracted-without-regrouping'],
    ]);
    expect(g.explanation.stepByStep[3]).toBe('Step 4: 60 − 19 = 41.');
  });

  // The whole point of the split from the old combined template: this id now
  // means ONE skill, so a seedless review key can never re-serve a failed
  // borrowing item as an addition item.
  it('never draws anything but subtraction', () => {
    for (let seed = 0; seed < 300; seed++) {
      expect(
        parse(nbt5SubtractWithin100.generate(makeRng(seed)).promptDetails).op,
        `seed ${seed}`,
      ).toBe('−');
    }
  });

  // "Within 100": both numbers in the figure, the answer, and the
  // wrong-operation distractor all stay under 100.
  it('keeps the figure and the answer within 100, and always regroups', () => {
    for (let seed = 0; seed < 600; seed++) {
      const g = nbt5SubtractWithin100.generate(makeRng(seed));
      const { a, b } = parse(g.promptDetails);
      for (const n of [a, b]) {
        expect(n, `seed ${seed}`).toBeGreaterThanOrEqual(10);
        expect(n, `seed ${seed}`).toBeLessThan(100);
      }
      const answer = Number(g.answerText);
      expect(answer, `seed ${seed}`).toBeGreaterThanOrEqual(0);
      expect(answer, `seed ${seed}`).toBeLessThan(100);
      expect(a - b, `seed ${seed}`).toBe(answer);
      expect(a % 10, `seed ${seed}: ones do not regroup`).toBeLessThan(b % 10);
      expect(a + b, `seed ${seed}: wrong-operation distractor past 100`).toBeLessThan(100);
    }
  });

  // The docstring's derived range for the difference: the tens gap is at most
  // 7 - 1 = 6 and the ones contribute between -9 and -1, so d is in [1,59].
  it('keeps the difference inside the derived [1,59]', () => {
    for (let seed = 0; seed < 600; seed++) {
      const d = Number(nbt5SubtractWithin100.generate(makeRng(seed)).answerText);
      expect(d, `seed ${seed}`).toBeGreaterThanOrEqual(1);
      expect(d, `seed ${seed}`).toBeLessThanOrEqual(59);
    }
    let max = 0;
    for (const t of TENS_PAIRS) {
      for (const o of ONES_PAIRS) {
        max = Math.max(max, 10 * t.hi + o.hi - (10 * t.lo + o.lo));
      }
    }
    expect(max, 'the greatest difference the draw space can produce').toBe(59);
  });

  it('gives each distractor the value its tag names, at every seed', () => {
    for (let seed = 0; seed < 600; seed++) {
      const g = nbt5SubtractWithin100.generate(makeRng(seed));
      const { a, b } = parse(g.promptDetails);
      const byTag = (tag: string) => Number(g.options.find((o) => o.misconception === tag)!.text);
      expect(byTag('added-instead-of-subtracted'), `seed ${seed}`).toBe(a + b);
      expect(byTag('borrowed-without-reducing-the-next-column'), `seed ${seed}`).toBe(a - b + 10);
      expect(byTag('subtracted-without-regrouping'), `seed ${seed}`).toBe(
        10 * (Math.floor(a / 10) - Math.floor(b / 10)) + ((b % 10) - (a % 10)),
      );
    }
  });

  // The draw space in full, with all four option values recomputed. The
  // `ob - oa !== 5` exclusion is what keeps the no-regroup value off d + 10:
  // the second loop proves the excluded gap really would have collided, so the
  // exclusion is not decoration.
  it('has no colliding option value anywhere in its draw space', () => {
    const failures: string[] = [];
    let drawn = 0;
    for (const t of TENS_PAIRS) {
      for (const o of ONES_PAIRS) {
        const a = 10 * t.hi + o.hi;
        const b = 10 * t.lo + o.lo;
        const d = a - b;
        const values = [d, 10 * (t.hi - t.lo) + (o.lo - o.hi), d + 10, a + b];
        if (new Set(values).size !== 4) failures.push(`collision ${a}-${b}: ${values}`);
        if (d < 1) failures.push(`not positive: ${a}-${b}=${d}`);
        if (a + b > 99) failures.push(`wrong-op past 100: ${a}+${b}`);
        drawn++;
      }
    }
    expect(failures).toEqual([]);
    expect(TENS_PAIRS.length, 'tens pairs').toBe(12);
    expect(ONES_PAIRS.length, 'ones pairs').toBe(40);
    expect(drawn, 'draw space').toBe(480);
    expect(ONES_PAIRS.filter((o) => o.lo - o.hi === 5), 'gap-5 ones pairs are excluded').toEqual([]);
  });

  it('would collide on exactly the excluded ones gap of 5', () => {
    const collided: string[] = [];
    for (const t of TENS_PAIRS) {
      for (let hi = 0; hi <= 4; hi++) {
        const lo = hi + 5;
        const a = 10 * t.hi + hi;
        const b = 10 * t.lo + lo;
        const d = a - b;
        if (10 * (t.hi - t.lo) + (lo - hi) === d + 10) collided.push(`${a}-${b}`);
      }
    }
    // 12 tens pairs x 5 gap-5 ones pairs (0-5, 1-6, 2-7, 3-8, 4-9).
    expect(collided.length, 'every gap-5 pair collides, which is why they are excluded').toBe(60);
  });
});
