import { describe, it, expect } from 'vitest';
import { assertTemplateSound } from '../../../engine/templateTesting';
import { makeRng } from '../../../engine/rng';
import {
  nbt7AddWithin1000,
  HUNDREDS_PAIRS,
  TENS_PAIRS,
  ONES_PAIRS,
} from './nbt7-add-within-1000';

const shape = (g: {
  options: { label: string; text: string; isCorrect: boolean; misconception?: string }[];
}) => g.options.map((o) => [o.label, o.text, o.isCorrect, o.misconception ?? null]);

function parse(details: string | undefined): { a: number; op: string; b: number } {
  const m = /^(\d+) ([+−]) (\d+)$/.exec(details ?? '');
  if (!m) throw new Error(`unparsable figure: ${details}`);
  return { a: Number(m[1]), op: m[2], b: Number(m[3]) };
}

const digit = (n: number, place: 1 | 10 | 100) => Math.floor(n / place) % 10;

describe('g2.nbt7.add-within-1000', () => {
  it('is sound at every seed', () => {
    assertTemplateSound(nbt7AddWithin1000);
  });

  it('is deterministic in its seed', () => {
    expect(nbt7AddWithin1000.generate(makeRng(42))).toEqual(nbt7AddWithin1000.generate(makeRng(42)));
  });

  // LITERAL pins, copied from a real run at these two seeds.
  it('emits exactly this question at seed 7', () => {
    const g = nbt7AddWithin1000.generate(makeRng(7));
    expect(g.prompt).toBe('Line the numbers up by place value, then add.');
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
    const g = nbt7AddWithin1000.generate(makeRng(123));
    expect(g.promptDetails).toBe('607 + 284');
    expect(g.answerText).toBe('891');
    expect(shape(g)).toEqual([
      ['A', '323', false, 'subtracted-instead-of-added'],
      ['B', '981', false, 'carried-into-the-wrong-column'],
      ['C', '881', false, 'added-without-carrying'],
      ['D', '891', true, null],
    ]);
    expect(g.explanation.stepByStep[3]).toBe('Step 4: 607 + 284 = 891.');
  });

  // The whole point of the split from the old combined template: this id now
  // means ONE skill, so a seedless review key can never re-serve it as the
  // other operation.
  it('never draws anything but addition', () => {
    for (let seed = 0; seed < 300; seed++) {
      expect(parse(nbt7AddWithin1000.generate(makeRng(seed)).promptDetails).op, `seed ${seed}`).toBe(
        '+',
      );
    }
  });

  // "Within 1,000", in both directions: no option may be negative and none may
  // run past 1,000.
  it('keeps every number it prints inside 0 and 1,000, and always regroups', () => {
    for (let seed = 0; seed < 600; seed++) {
      const g = nbt7AddWithin1000.generate(makeRng(seed));
      const { a, b } = parse(g.promptDetails);
      for (const n of [a, b, ...g.options.map((o) => Number(o.text))]) {
        expect(Number.isInteger(n), `seed ${seed}: ${n}`).toBe(true);
        expect(n, `seed ${seed}: ${n} is negative`).toBeGreaterThanOrEqual(0);
        expect(n, `seed ${seed}: ${n} is past 1,000`).toBeLessThanOrEqual(1000);
      }
      expect(a, `seed ${seed}`).toBeGreaterThan(b);
      expect(a + b, `seed ${seed}`).toBe(Number(g.answerText));
      expect(digit(a, 1) + digit(b, 1), `seed ${seed}: ones do not regroup`).toBeGreaterThanOrEqual(
        10,
      );
      expect(
        digit(a, 10) + digit(b, 10) + 1,
        `seed ${seed}: tens regroup too`,
      ).toBeLessThanOrEqual(9);
    }
  });

  it('gives each distractor the value its tag names, at every seed', () => {
    for (let seed = 0; seed < 600; seed++) {
      const g = nbt7AddWithin1000.generate(makeRng(seed));
      const { a, b } = parse(g.promptDetails);
      const byTag = (tag: string) => Number(g.options.find((o) => o.misconception === tag)!.text);
      expect(byTag('added-without-carrying'), `seed ${seed}`).toBe(a + b - 10);
      expect(byTag('carried-into-the-wrong-column'), `seed ${seed}`).toBe(a + b + 90);
      expect(byTag('subtracted-instead-of-added'), `seed ${seed}`).toBe(a - b);
    }
  });

  // The draw space in full.
  it('has no colliding option value anywhere in its draw space', () => {
    const failures: string[] = [];
    let drawn = 0;
    for (const h of HUNDREDS_PAIRS) {
      for (const t of TENS_PAIRS) {
        for (const o of ONES_PAIRS) {
          const a = 100 * h.hi + 10 * t.hi + o.hi;
          const b = 100 * h.lo + 10 * t.lo + o.lo;
          const values = [a + b, a + b - 10, a + b + 90, a - b];
          if (new Set(values).size !== 4) failures.push(`collision ${a}+${b}: ${values}`);
          if (Math.max(...values) > 1000) failures.push(`past 1,000: ${a}+${b}: ${values}`);
          if (Math.min(...values) < 0) failures.push(`negative: ${a}+${b}: ${values}`);
          drawn++;
        }
      }
    }
    expect(failures.slice(0, 10)).toEqual([]);
    expect(HUNDREDS_PAIRS.length, 'hundreds pairs').toBe(9);
    expect(TENS_PAIRS.length, 'tens pairs').toBe(45);
    expect(ONES_PAIRS.length, 'ones pairs').toBe(45);
    expect(drawn, 'draw space').toBe(18225);
  });
});
