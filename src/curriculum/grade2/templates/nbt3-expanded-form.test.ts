import { describe, it, expect } from 'vitest';
import { assertTemplateSound } from '../../../engine/templateTesting';
import { makeRng } from '../../../engine/rng';
import { nbt3ExpandedForm } from './nbt3-expanded-form';

const shape = (g: {
  options: { label: string; text: string; isCorrect: boolean; misconception?: string }[];
}) => g.options.map((o) => [o.label, o.text, o.isCorrect, o.misconception ?? null]);

const sumOf = (text: string) => text.split(' + ').reduce((a, b) => a + Number(b), 0);

describe('g2.nbt3.expanded-form', () => {
  it('is sound at every seed', () => {
    assertTemplateSound(nbt3ExpandedForm);
  });

  it('is deterministic in its seed', () => {
    expect(nbt3ExpandedForm.generate(makeRng(42))).toEqual(nbt3ExpandedForm.generate(makeRng(42)));
  });

  // LITERAL pins, copied from a real run at these two seeds.
  it('emits exactly this question at seed 7', () => {
    const g = nbt3ExpandedForm.generate(makeRng(7));
    expect(g.prompt).toBe('Which one shows this number in expanded form?');
    expect(g.promptDetails).toBe('119');
    expect(g.answerText).toBe('100 + 10 + 9');
    expect(shape(g)).toEqual([
      ['A', '900 + 10 + 1', false, 'put-a-digit-in-the-wrong-place'],
      ['B', '100 + 10 + 9', true, null],
      ['C', '1 + 1 + 9', false, 'wrote-the-digit-not-its-value'],
      ['D', '100 + 100 + 900', false, 'wrong-power-of-ten'],
    ]);
    expect(g.explanation.stepByStep[3]).toBe('Step 4: 119 in expanded form is 100 + 10 + 9.');
  });

  it('emits exactly this question at seed 123', () => {
    const g = nbt3ExpandedForm.generate(makeRng(123));
    expect(g.promptDetails).toBe('824');
    expect(g.answerText).toBe('800 + 20 + 4');
    expect(shape(g)).toEqual([
      ['A', '400 + 20 + 8', false, 'put-a-digit-in-the-wrong-place'],
      ['B', '800 + 200 + 400', false, 'wrong-power-of-ten'],
      ['C', '8 + 2 + 4', false, 'wrote-the-digit-not-its-value'],
      ['D', '800 + 20 + 4', true, null],
    ]);
  });

  it('expands to the number in the figure, at every seed', () => {
    for (let seed = 0; seed < 400; seed++) {
      const g = nbt3ExpandedForm.generate(makeRng(seed));
      const n = Number(g.promptDetails);
      expect(n, `seed ${seed}`).toBeGreaterThanOrEqual(111);
      expect(n, `seed ${seed}`).toBeLessThanOrEqual(999);
      expect(sumOf(g.answerText), `seed ${seed}: ${g.answerText}`).toBe(n);
      // No distractor may also add back to n, or the item has two right answers.
      for (const o of g.options) {
        if (o.isCorrect) continue;
        expect(sumOf(o.text), `seed ${seed}: "${o.text}" also equals ${n}`).not.toBe(n);
      }
    }
  });

  // Every digit is non-zero, so no expanded form ever contains a "0 +" term —
  // that is a different question, and it is authored by hand (g2-nbt3-04).
  it('never draws a number with a zero digit', () => {
    for (let seed = 0; seed < 400; seed++) {
      const n = Number(nbt3ExpandedForm.generate(makeRng(seed)).promptDetails);
      expect(String(n).includes('0'), `seed ${seed}: ${n}`).toBe(false);
    }
  });

  // The full draw space: every (h, t, o) with h != o, all four option strings
  // and their sums recomputed from the digits.
  it('has no colliding option text anywhere in its draw space', () => {
    const failures: string[] = [];
    let drawn = 0;
    for (let h = 1; h <= 9; h++) {
      for (let t = 1; t <= 9; t++) {
        for (let o = 1; o <= 9; o++) {
          if (o === h) continue;
          const n = 100 * h + 10 * t + o;
          const texts = [
            `${100 * h} + ${10 * t} + ${o}`,
            `${h} + ${t} + ${o}`,
            `${100 * h} + ${100 * t} + ${100 * o}`,
            `${100 * o} + ${10 * t} + ${h}`,
          ];
          if (new Set(texts).size !== 4) failures.push(`text collision at ${h},${t},${o}`);
          // Only the key may add back to n.
          for (let i = 1; i < texts.length; i++) {
            if (sumOf(texts[i]) === n) failures.push(`"${texts[i]}" also equals ${n}`);
          }
          drawn++;
        }
      }
    }
    expect(failures).toEqual([]);
    expect(drawn, 'draw space size').toBe(648);
  });
});
