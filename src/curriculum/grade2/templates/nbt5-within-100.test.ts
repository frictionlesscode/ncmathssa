import { describe, it, expect } from 'vitest';
import { assertTemplateSound } from '../../../engine/templateTesting';
import { makeRng } from '../../../engine/rng';
import {
  nbt5Within100,
  ADD_TENS_PAIRS,
  ADD_ONES_PAIRS,
  SUB_TENS_PAIRS,
  SUB_ONES_PAIRS,
} from './nbt5-within-100';

const shape = (g: {
  options: { label: string; text: string; isCorrect: boolean; misconception?: string }[];
}) => g.options.map((o) => [o.label, o.text, o.isCorrect, o.misconception ?? null]);

function parse(details: string | undefined): { a: number; op: string; b: number } {
  const m = /^(\d+) ([+−]) (\d+)$/.exec(details ?? '');
  if (!m) throw new Error(`unparsable figure: ${details}`);
  return { a: Number(m[1]), op: m[2], b: Number(m[3]) };
}

describe('g2.nbt5.within-100', () => {
  it('is sound at every seed', () => {
    assertTemplateSound(nbt5Within100);
  });

  it('is deterministic in its seed', () => {
    expect(nbt5Within100.generate(makeRng(42))).toEqual(nbt5Within100.generate(makeRng(42)));
  });

  // LITERAL pins, copied from a real run at these two seeds — one of each
  // operation.
  it('emits exactly this question at seed 7 (addition)', () => {
    const g = nbt5Within100.generate(makeRng(7));
    expect(g.prompt).toBe('Work this out in your head.');
    expect(g.promptDetails).toBe('19 + 38');
    expect(g.answerText).toBe('57');
    expect(shape(g)).toEqual([
      ['A', '417', false, 'wrote-the-digits-side-by-side-instead-of-adding-the-values'],
      ['B', '57', true, null],
      ['C', '47', false, 'added-without-carrying'],
      ['D', '19', false, 'subtracted-instead-of-added'],
    ]);
    expect(g.explanation.stepByStep[3]).toBe('Step 4: 19 + 38 = 57.');
  });

  it('emits exactly this question at seed 123 (subtraction)', () => {
    const g = nbt5Within100.generate(makeRng(123));
    expect(g.promptDetails).toBe('32 − 28');
    expect(g.answerText).toBe('4');
    expect(shape(g)).toEqual([
      ['A', '60', false, 'added-instead-of-subtracted'],
      ['B', '14', false, 'borrowed-without-reducing-the-next-column'],
      ['C', '16', false, 'subtracted-without-regrouping'],
      ['D', '4', true, null],
    ]);
    expect(g.explanation.stepByStep[3]).toBe('Step 4: 32 − 28 = 4.');
  });

  it('draws both operations', () => {
    const ops = new Set<string>();
    for (let seed = 0; seed < 200; seed++) {
      ops.add(parse(nbt5Within100.generate(makeRng(seed)).promptDetails).op);
    }
    expect([...ops].sort()).toEqual(['+', '−']);
  });

  // "Within 100": both numbers in the figure and the answer are two-digit or
  // smaller. The side-by-side distractor is deliberately outside, since it is
  // the value a child actually writes, and it is the only exception.
  it('keeps the figure and the answer within 100, and always regroups', () => {
    for (let seed = 0; seed < 600; seed++) {
      const g = nbt5Within100.generate(makeRng(seed));
      const { a, op, b } = parse(g.promptDetails);
      for (const n of [a, b]) {
        expect(n, `seed ${seed}`).toBeGreaterThanOrEqual(10);
        expect(n, `seed ${seed}`).toBeLessThan(100);
      }
      const answer = Number(g.answerText);
      expect(answer, `seed ${seed}`).toBeGreaterThanOrEqual(0);
      expect(answer, `seed ${seed}`).toBeLessThan(100);
      if (op === '+') {
        expect(a + b, `seed ${seed}`).toBe(answer);
        expect((a % 10) + (b % 10), `seed ${seed}: ones do not regroup`).toBeGreaterThanOrEqual(10);
        expect(a, `seed ${seed}: a === b makes the difference 0`).not.toBe(b);
      } else {
        expect(a - b, `seed ${seed}`).toBe(answer);
        expect(a % 10, `seed ${seed}: ones do not regroup`).toBeLessThan(b % 10);
        expect(a + b, `seed ${seed}: wrong-operation distractor past 100`).toBeLessThan(100);
      }
    }
  });

  it('gives each distractor the value its tag names, at every seed', () => {
    for (let seed = 0; seed < 600; seed++) {
      const g = nbt5Within100.generate(makeRng(seed));
      const { a, op, b } = parse(g.promptDetails);
      const byTag = (tag: string) => Number(g.options.find((o) => o.misconception === tag)!.text);
      if (op === '+') {
        expect(byTag('added-without-carrying'), `seed ${seed}`).toBe(a + b - 10);
        expect(byTag('subtracted-instead-of-added'), `seed ${seed}`).toBe(Math.abs(a - b));
        expect(
          g.options.find(
            (o) => o.misconception === 'wrote-the-digits-side-by-side-instead-of-adding-the-values',
          )!.text,
          `seed ${seed}`,
        ).toBe(`${Math.floor(a / 10) + Math.floor(b / 10)}${(a % 10) + (b % 10)}`);
      } else {
        expect(byTag('added-instead-of-subtracted'), `seed ${seed}`).toBe(a + b);
        expect(byTag('borrowed-without-reducing-the-next-column'), `seed ${seed}`).toBe(a - b + 10);
        expect(byTag('subtracted-without-regrouping'), `seed ${seed}`).toBe(
          10 * (Math.floor(a / 10) - Math.floor(b / 10)) + ((b % 10) - (a % 10)),
        );
      }
    }
  });

  // Both draw spaces in full, with all four option values recomputed.
  it('has no colliding option value anywhere in either draw space', () => {
    const failures: string[] = [];
    let added = 0;
    for (const t of ADD_TENS_PAIRS) {
      for (const o of ADD_ONES_PAIRS) {
        const a = 10 * t.hi + o.hi;
        const b = 10 * t.lo + o.lo;
        const s = a + b;
        const values = [s, s - 10, Math.abs(a - b), 100 * (t.hi + t.lo) + (o.hi + o.lo)];
        if (new Set(values).size !== 4) failures.push(`add collision ${a}+${b}: ${values}`);
        if (s > 99) failures.push(`add sum past 100: ${a}+${b}=${s}`);
        if (a === b) failures.push(`add difference 0: ${a}+${b}`);
        added++;
      }
    }
    let subtracted = 0;
    for (const t of SUB_TENS_PAIRS) {
      for (const o of SUB_ONES_PAIRS) {
        const a = 10 * t.hi + o.hi;
        const b = 10 * t.lo + o.lo;
        const d = a - b;
        const values = [d, 10 * (t.hi - t.lo) + (o.lo - o.hi), d + 10, a + b];
        if (new Set(values).size !== 4) failures.push(`sub collision ${a}-${b}: ${values}`);
        if (d < 1) failures.push(`sub not positive: ${a}-${b}=${d}`);
        if (a + b > 99) failures.push(`sub wrong-op past 100: ${a}+${b}`);
        subtracted++;
      }
    }
    expect(failures).toEqual([]);
    expect(ADD_TENS_PAIRS.length, 'addition tens pairs').toBe(24);
    expect(ADD_ONES_PAIRS.length, 'addition ones pairs').toBe(45);
    expect(SUB_TENS_PAIRS.length, 'subtraction tens pairs').toBe(12);
    expect(SUB_ONES_PAIRS.length, 'subtraction ones pairs').toBe(40);
    expect(added, 'addition draw space').toBe(1080);
    expect(subtracted, 'subtraction draw space').toBe(480);
  });
});
