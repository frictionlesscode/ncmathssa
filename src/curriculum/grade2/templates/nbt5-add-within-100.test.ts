import { describe, it, expect } from 'vitest';
import { assertTemplateSound } from '../../../engine/templateTesting';
import { makeRng } from '../../../engine/rng';
import { nbt5AddWithin100, TENS_PAIRS, ONES_PAIRS } from './nbt5-add-within-100';

const shape = (g: {
  options: { label: string; text: string; isCorrect: boolean; misconception?: string }[];
}) => g.options.map((o) => [o.label, o.text, o.isCorrect, o.misconception ?? null]);

function parse(details: string | undefined): { a: number; op: string; b: number } {
  const m = /^(\d+) ([+−]) (\d+)$/.exec(details ?? '');
  if (!m) throw new Error(`unparsable figure: ${details}`);
  return { a: Number(m[1]), op: m[2], b: Number(m[3]) };
}

describe('g2.nbt5.add-within-100', () => {
  it('is sound at every seed', () => {
    assertTemplateSound(nbt5AddWithin100);
  });

  it('is deterministic in its seed', () => {
    expect(nbt5AddWithin100.generate(makeRng(42))).toEqual(nbt5AddWithin100.generate(makeRng(42)));
  });

  // LITERAL pins, copied from a real run at these two seeds.
  it('emits exactly this question at seed 7', () => {
    const g = nbt5AddWithin100.generate(makeRng(7));
    expect(g.prompt).toBe('Add these numbers in your head.');
    expect(g.promptDetails).toBe('12 + 29');
    expect(g.answerText).toBe('41');
    expect(shape(g)).toEqual([
      ['A', '41', true, null],
      ['B', '31', false, 'added-without-carrying'],
      ['C', '17', false, 'subtracted-instead-of-added'],
      ['D', '311', false, 'wrote-the-digits-side-by-side-instead-of-adding-the-values'],
    ]);
    expect(g.explanation.stepByStep[3]).toBe('Step 4: 12 + 29 = 41.');
  });

  it('emits exactly this question at seed 123', () => {
    const g = nbt5AddWithin100.generate(makeRng(123));
    expect(g.promptDetails).toBe('54 + 18');
    expect(g.answerText).toBe('72');
    expect(shape(g)).toEqual([
      ['A', '612', false, 'wrote-the-digits-side-by-side-instead-of-adding-the-values'],
      ['B', '36', false, 'subtracted-instead-of-added'],
      ['C', '72', true, null],
      ['D', '62', false, 'added-without-carrying'],
    ]);
    expect(g.explanation.stepByStep[3]).toBe('Step 4: 54 + 18 = 72.');
  });

  // The whole point of the split from the old combined template: this id now
  // means ONE skill, so a seedless review key can never re-serve it as the
  // other operation.
  it('never draws anything but addition', () => {
    for (let seed = 0; seed < 300; seed++) {
      expect(parse(nbt5AddWithin100.generate(makeRng(seed)).promptDetails).op, `seed ${seed}`).toBe(
        '+',
      );
    }
  });

  // "Within 100": both numbers in the figure and the answer are two-digit or
  // smaller. The side-by-side distractor is deliberately outside, since it is
  // the value a child actually writes, and it is the only exception.
  it('keeps the figure and the answer within 100, and always regroups', () => {
    for (let seed = 0; seed < 600; seed++) {
      const g = nbt5AddWithin100.generate(makeRng(seed));
      const { a, b } = parse(g.promptDetails);
      for (const n of [a, b]) {
        expect(n, `seed ${seed}`).toBeGreaterThanOrEqual(10);
        expect(n, `seed ${seed}`).toBeLessThan(100);
      }
      const answer = Number(g.answerText);
      expect(answer, `seed ${seed}`).toBeGreaterThanOrEqual(0);
      expect(answer, `seed ${seed}`).toBeLessThan(100);
      expect(a + b, `seed ${seed}`).toBe(answer);
      expect((a % 10) + (b % 10), `seed ${seed}: ones do not regroup`).toBeGreaterThanOrEqual(10);
      expect(a, `seed ${seed}: a === b makes the difference 0`).not.toBe(b);
    }
  });

  it('gives each distractor the value its tag names, at every seed', () => {
    for (let seed = 0; seed < 600; seed++) {
      const g = nbt5AddWithin100.generate(makeRng(seed));
      const { a, b } = parse(g.promptDetails);
      const byTag = (tag: string) => Number(g.options.find((o) => o.misconception === tag)!.text);
      expect(byTag('added-without-carrying'), `seed ${seed}`).toBe(a + b - 10);
      expect(byTag('subtracted-instead-of-added'), `seed ${seed}`).toBe(Math.abs(a - b));
      expect(
        g.options.find(
          (o) => o.misconception === 'wrote-the-digits-side-by-side-instead-of-adding-the-values',
        )!.text,
        `seed ${seed}`,
      ).toBe(`${Math.floor(a / 10) + Math.floor(b / 10)}${(a % 10) + (b % 10)}`);
    }
  });

  // The draw space in full, with all four option values recomputed.
  it('has no colliding option value anywhere in its draw space', () => {
    const failures: string[] = [];
    let drawn = 0;
    for (const t of TENS_PAIRS) {
      for (const o of ONES_PAIRS) {
        const a = 10 * t.hi + o.hi;
        const b = 10 * t.lo + o.lo;
        const s = a + b;
        const values = [s, s - 10, Math.abs(a - b), 100 * (t.hi + t.lo) + (o.hi + o.lo)];
        if (new Set(values).size !== 4) failures.push(`collision ${a}+${b}: ${values}`);
        if (s > 99) failures.push(`sum past 100: ${a}+${b}=${s}`);
        if (a === b) failures.push(`difference 0: ${a}+${b}`);
        drawn++;
      }
    }
    expect(failures).toEqual([]);
    expect(TENS_PAIRS.length, 'tens pairs').toBe(24);
    expect(ONES_PAIRS.length, 'ones pairs').toBe(45);
    expect(drawn, 'draw space').toBe(1080);
  });
});
