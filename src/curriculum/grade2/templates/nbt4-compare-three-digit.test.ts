import { describe, it, expect } from 'vitest';
import { assertTemplateSound } from '../../../engine/templateTesting';
import { makeRng } from '../../../engine/rng';
import { nbt4CompareThreeDigit, TENS_PAIRS, ONES_PAIRS } from './nbt4-compare-three-digit';

const shape = (g: {
  options: { label: string; text: string; isCorrect: boolean; misconception?: string }[];
}) => g.options.map((o) => [o.label, o.text, o.isCorrect, o.misconception ?? null]);

function parse(details: string | undefined): { a: number; b: number } {
  const m = /^Compare (\d+) and (\d+)$/.exec(details ?? '');
  if (!m) throw new Error(`unparsable figure: ${details}`);
  return { a: Number(m[1]), b: Number(m[2]) };
}

/** Decides whether a sentence like "842 > 828, because ..." asserts something
 *  true, using only the two numbers it names and the symbol between them. */
function claimIsTrue(text: string): boolean {
  const m = /^(\d+) ([<>=]) (\d+),/.exec(text);
  if (!m) throw new Error(`unparsable sentence: ${text}`);
  const [x, op, y] = [Number(m[1]), m[2], Number(m[3])];
  return op === '>' ? x > y : op === '<' ? x < y : x === y;
}

describe('g2.nbt4.compare-three-digit', () => {
  it('is sound at every seed', () => {
    assertTemplateSound(nbt4CompareThreeDigit);
  });

  it('is deterministic in its seed', () => {
    expect(nbt4CompareThreeDigit.generate(makeRng(42))).toEqual(
      nbt4CompareThreeDigit.generate(makeRng(42)),
    );
  });

  // LITERAL pins, copied from a real run at these two seeds.
  it('emits exactly this question at seed 7', () => {
    const g = nbt4CompareThreeDigit.generate(makeRng(7));
    expect(g.prompt).toBe('Which sentence is true?');
    expect(g.promptDetails).toBe('Compare 127 and 119');
    expect(g.answerText).toBe('127 > 119, because 2 tens is more than 1 ten');
    expect(shape(g)).toEqual([
      ['A', '127 = 119, because both numbers have three digits', false, 'compared-by-digit-count-not-place-value'],
      ['B', '127 > 119, because 2 tens is more than 1 ten', true, null],
      ['C', '127 < 119, because 7 ones is less than 9 ones', false, 'compared-the-wrong-place-first'],
      ['D', '127 = 119, because both numbers have 1 hundred', false, 'stopped-comparing-too-soon'],
    ]);
    expect(g.explanation.stepByStep[3]).toBe(
      'Step 4: 127 > 119, because 2 tens is more than 1 ten.',
    );
  });

  it('emits exactly this question at seed 123', () => {
    const g = nbt4CompareThreeDigit.generate(makeRng(123));
    expect(g.promptDetails).toBe('Compare 842 and 828');
    expect(g.answerText).toBe('842 > 828, because 4 tens is more than 2 tens');
    expect(shape(g)).toEqual([
      ['A', '842 = 828, because both numbers have three digits', false, 'compared-by-digit-count-not-place-value'],
      ['B', '842 = 828, because both numbers have 8 hundreds', false, 'stopped-comparing-too-soon'],
      ['C', '842 < 828, because 2 ones is less than 8 ones', false, 'compared-the-wrong-place-first'],
      ['D', '842 > 828, because 4 tens is more than 2 tens', true, null],
    ]);
  });

  // Exactly one of the four sentences is true, judged from its symbol alone —
  // an item where a second option also happens to be true marks a child wrong
  // for choosing it.
  it('offers exactly one true sentence, at every seed', () => {
    for (let seed = 0; seed < 500; seed++) {
      const g = nbt4CompareThreeDigit.generate(makeRng(seed));
      const trues = g.options.filter((o) => claimIsTrue(o.text));
      expect(trues.length, `seed ${seed}: ${g.options.map((o) => o.text).join(' | ')}`).toBe(1);
      expect(trues[0].isCorrect, `seed ${seed}`).toBe(true);
    }
  });

  // Both numbers are three digits and share a hundreds digit, so neither digit
  // count nor the hundreds place can settle it: the tens have to. And the ones
  // digits point the other way, so a child who starts there goes wrong rather
  // than right by luck.
  it('always turns on the tens, with the ones pointing the other way', () => {
    for (let seed = 0; seed < 500; seed++) {
      const { a, b } = parse(nbt4CompareThreeDigit.generate(makeRng(seed)).promptDetails);
      expect(a, `seed ${seed}`).toBeGreaterThan(b);
      expect(String(a).length, `seed ${seed}`).toBe(3);
      expect(String(b).length, `seed ${seed}`).toBe(3);
      expect(Math.floor(a / 100), `seed ${seed}`).toBe(Math.floor(b / 100));
      expect(Math.floor(a / 10) % 10, `seed ${seed}`).toBeGreaterThan(Math.floor(b / 10) % 10);
      expect(a % 10, `seed ${seed}`).toBeLessThan(b % 10);
    }
  });

  // The full draw space, not a sample.
  it('has no colliding option text anywhere in its draw space', () => {
    const failures: string[] = [];
    let drawn = 0;
    const plural = (c: number, w: string) => `${c} ${w}${c === 1 ? '' : 's'}`;
    for (let h = 1; h <= 9; h++) {
      for (const t of TENS_PAIRS) {
        for (const o of ONES_PAIRS) {
          const a = 100 * h + 10 * t.hi + o.hi;
          const b = 100 * h + 10 * t.lo + o.lo;
          const texts = [
            `${a} > ${b}, because ${plural(t.hi, 'ten')} is more than ${plural(t.lo, 'ten')}`,
            `${a} < ${b}, because ${plural(o.hi, 'one')} is less than ${plural(o.lo, 'one')}`,
            `${a} = ${b}, because both numbers have ${plural(h, 'hundred')}`,
            `${a} = ${b}, because both numbers have three digits`,
          ];
          if (new Set(texts).size !== 4) failures.push(`text collision at ${a} vs ${b}`);
          if (texts.filter(claimIsTrue).length !== 1) failures.push(`not one truth at ${a} vs ${b}`);
          drawn++;
        }
      }
    }
    expect(failures).toEqual([]);
    expect(TENS_PAIRS.length, 'tens pairs').toBe(45);
    expect(ONES_PAIRS.length, 'ones pairs').toBe(45);
    expect(drawn, 'draw space size').toBe(18225);
  });
});
