import { describe, it, expect } from 'vitest';
import { assertTemplateSound } from '../../../engine/templateTesting';
import { makeRng } from '../../../engine/rng';
import {
  nbt7Within1000,
  HUNDREDS_PAIRS,
  ADD_TENS_PAIRS,
  ADD_ONES_PAIRS,
  SUB_TENS_PAIRS,
  SUB_ONES_PAIRS,
} from './nbt7-within-1000';

const shape = (g: {
  options: { label: string; text: string; isCorrect: boolean; misconception?: string }[];
}) => g.options.map((o) => [o.label, o.text, o.isCorrect, o.misconception ?? null]);

function parse(details: string | undefined): { a: number; op: string; b: number } {
  const m = /^(\d+) ([+−]) (\d+)$/.exec(details ?? '');
  if (!m) throw new Error(`unparsable figure: ${details}`);
  return { a: Number(m[1]), op: m[2], b: Number(m[3]) };
}

const digit = (n: number, place: 1 | 10 | 100) => Math.floor(n / place) % 10;

describe('g2.nbt7.within-1000', () => {
  it('is sound at every seed', () => {
    assertTemplateSound(nbt7Within1000);
  });

  it('is deterministic in its seed', () => {
    expect(nbt7Within1000.generate(makeRng(42))).toEqual(nbt7Within1000.generate(makeRng(42)));
  });

  // LITERAL pins, copied from a real run at these two seeds — one of each
  // operation.
  it('emits exactly this question at seed 7 (addition)', () => {
    const g = nbt7Within1000.generate(makeRng(7));
    expect(g.prompt).toBe('Line the numbers up by place value, then work it out.');
    expect(g.promptDetails).toBe('378 + 115');
    expect(g.answerText).toBe('493');
    expect(shape(g)).toEqual([
      ['A', '263', false, 'subtracted-instead-of-added'],
      ['B', '493', true, null],
      ['C', '483', false, 'added-without-carrying'],
      ['D', '583', false, 'carried-into-the-wrong-column'],
    ]);
    expect(g.explanation.stepByStep[3]).toBe('Step 4: 378 + 115 = 493.');
  });

  it('emits exactly this question at seed 123 (subtraction)', () => {
    const g = nbt7Within1000.generate(makeRng(123));
    expect(g.promptDetails).toBe('441 − 133');
    expect(g.answerText).toBe('308');
    expect(shape(g)).toEqual([
      ['A', '308', true, null],
      ['B', '574', false, 'added-instead-of-subtracted'],
      ['C', '318', false, 'borrowed-without-reducing-the-next-column'],
      ['D', '312', false, 'subtracted-without-regrouping'],
    ]);
    expect(g.explanation.stepByStep[3]).toBe('Step 4: 441 − 133 = 308.');
  });

  it('draws both operations', () => {
    const ops = new Set<string>();
    for (let seed = 0; seed < 200; seed++) {
      ops.add(parse(nbt7Within1000.generate(makeRng(seed)).promptDetails).op);
    }
    expect([...ops].sort()).toEqual(['+', '−']);
  });

  // "Within 1,000", in both directions: no option may be negative and none may
  // run past 1,000.
  it('keeps every number it prints inside 0 and 1,000, and always regroups', () => {
    for (let seed = 0; seed < 600; seed++) {
      const g = nbt7Within1000.generate(makeRng(seed));
      const { a, op, b } = parse(g.promptDetails);
      for (const n of [a, b, ...g.options.map((o) => Number(o.text))]) {
        expect(Number.isInteger(n), `seed ${seed}: ${n}`).toBe(true);
        expect(n, `seed ${seed}: ${n} is negative`).toBeGreaterThanOrEqual(0);
        expect(n, `seed ${seed}: ${n} is past 1,000`).toBeLessThanOrEqual(1000);
      }
      expect(a, `seed ${seed}`).toBeGreaterThan(b);
      if (op === '+') {
        expect(a + b, `seed ${seed}`).toBe(Number(g.answerText));
        expect(digit(a, 1) + digit(b, 1), `seed ${seed}: ones do not regroup`)
          .toBeGreaterThanOrEqual(10);
        expect(digit(a, 10) + digit(b, 10) + 1, `seed ${seed}: tens regroup too`)
          .toBeLessThanOrEqual(9);
      } else {
        expect(a - b, `seed ${seed}`).toBe(Number(g.answerText));
        expect(digit(a, 1), `seed ${seed}: ones do not regroup`).toBeLessThan(digit(b, 1));
        expect(digit(a, 10) - 1, `seed ${seed}: tens need a second trade`)
          .toBeGreaterThanOrEqual(digit(b, 10));
      }
    }
  });

  it('gives each distractor the value its tag names, at every seed', () => {
    for (let seed = 0; seed < 600; seed++) {
      const g = nbt7Within1000.generate(makeRng(seed));
      const { a, op, b } = parse(g.promptDetails);
      const byTag = (tag: string) => Number(g.options.find((o) => o.misconception === tag)!.text);
      if (op === '+') {
        expect(byTag('added-without-carrying'), `seed ${seed}`).toBe(a + b - 10);
        expect(byTag('carried-into-the-wrong-column'), `seed ${seed}`).toBe(a + b + 90);
        expect(byTag('subtracted-instead-of-added'), `seed ${seed}`).toBe(a - b);
      } else {
        expect(byTag('added-instead-of-subtracted'), `seed ${seed}`).toBe(a + b);
        expect(byTag('borrowed-without-reducing-the-next-column'), `seed ${seed}`).toBe(a - b + 10);
        expect(byTag('subtracted-without-regrouping'), `seed ${seed}`).toBe(
          100 * (digit(a, 100) - digit(b, 100)) +
            10 * (digit(a, 10) - digit(b, 10)) +
            (digit(b, 1) - digit(a, 1)),
        );
      }
    }
  });

  // Both draw spaces in full.
  it('has no colliding option value anywhere in either draw space', () => {
    const failures: string[] = [];
    let added = 0;
    for (const h of HUNDREDS_PAIRS) {
      for (const t of ADD_TENS_PAIRS) {
        for (const o of ADD_ONES_PAIRS) {
          const a = 100 * h.hi + 10 * t.hi + o.hi;
          const b = 100 * h.lo + 10 * t.lo + o.lo;
          const values = [a + b, a + b - 10, a + b + 90, a - b];
          if (new Set(values).size !== 4) failures.push(`add collision ${a}+${b}: ${values}`);
          if (Math.max(...values) > 1000) failures.push(`add past 1,000: ${a}+${b}: ${values}`);
          if (Math.min(...values) < 0) failures.push(`add negative: ${a}+${b}: ${values}`);
          added++;
        }
      }
    }
    let subtracted = 0;
    for (const h of HUNDREDS_PAIRS) {
      for (const t of SUB_TENS_PAIRS) {
        for (const o of SUB_ONES_PAIRS) {
          const a = 100 * h.hi + 10 * t.hi + o.hi;
          const b = 100 * h.lo + 10 * t.lo + o.lo;
          const d = a - b;
          const values = [
            d,
            100 * (h.hi - h.lo) + 10 * (t.hi - t.lo) + (o.lo - o.hi),
            d + 10,
            a + b,
          ];
          if (new Set(values).size !== 4) failures.push(`sub collision ${a}-${b}: ${values}`);
          if (Math.max(...values) > 1000) failures.push(`sub past 1,000: ${a}-${b}: ${values}`);
          if (Math.min(...values) < 0) failures.push(`sub negative: ${a}-${b}: ${values}`);
          subtracted++;
        }
      }
    }
    expect(failures.slice(0, 10)).toEqual([]);
    expect(HUNDREDS_PAIRS.length, 'hundreds pairs').toBe(9);
    expect(ADD_TENS_PAIRS.length, 'addition tens pairs').toBe(45);
    expect(ADD_ONES_PAIRS.length, 'addition ones pairs').toBe(45);
    expect(SUB_TENS_PAIRS.length, 'subtraction tens pairs').toBe(20);
    expect(SUB_ONES_PAIRS.length, 'subtraction ones pairs').toBe(40);
    expect(added, 'addition draw space').toBe(18225);
    expect(subtracted, 'subtraction draw space').toBe(7200);
  });
});
