import { describe, it, expect } from 'vitest';
import { assertTemplateSound } from '../../../engine/templateTesting';
import { makeRng } from '../../../engine/rng';
import { nbt2ExpandedForm } from './nbt2-expanded-form';

const numeralIn = (prompt: string): number => {
  const m = prompt.match(/Which shows ([\d,]+) written in expanded form\?/);
  if (!m) throw new Error(`unparsable prompt: ${prompt}`);
  return Number(m[1].replace(/,/g, ''));
};

/** The terms of an expanded-form option, as numbers. */
const terms = (text: string): number[] =>
  text.split(' + ').map((t) => Number(t.replace(/,/g, '')));

const taggedText = (
  g: ReturnType<typeof nbt2ExpandedForm.generate>,
  tag: string,
): string => {
  const opt = g.options.find((o) => o.misconception === tag);
  if (!opt) throw new Error(`no option tagged ${tag}`);
  return opt.text;
};

describe('g4.nbt2.expanded-form', () => {
  it('is sound at every seed', () => {
    assertTemplateSound(nbt2ExpandedForm);
  });

  it('is deterministic in its seed', () => {
    expect(nbt2ExpandedForm.generate(makeRng(42))).toEqual(
      nbt2ExpandedForm.generate(makeRng(42)),
    );
  });

  it('produces a known question at a pinned seed', () => {
    const g = nbt2ExpandedForm.generate(makeRng(5));
    expect(g.options.find((o) => o.isCorrect)!.text).toBe(g.answerText);
    expect(g.prompt.length).toBeGreaterThan(0);
  });

  it('stays inside the standard: whole numbers up to and including 100,000', () => {
    for (let seed = 0; seed < 300; seed++) {
      const n = numeralIn(nbt2ExpandedForm.generate(makeRng(seed)).prompt);
      expect(n, `seed ${seed}`).toBeLessThanOrEqual(100000);
      expect(n, `seed ${seed}`).toBeGreaterThanOrEqual(10000);
      // The hundreds place is always the empty one, and it is the only one.
      expect(Math.floor(n / 100) % 10, `seed ${seed}`).toBe(0);
      for (const place of [1, 1000, 10000]) {
        expect(Math.floor(n / place) % 10, `seed ${seed} place ${place}`).toBeGreaterThan(0);
      }
    }
  });

  it('the correct option sums back to the numeral', () => {
    for (let seed = 0; seed < 300; seed++) {
      const g = nbt2ExpandedForm.generate(makeRng(seed));
      const n = numeralIn(g.prompt);
      const summed = terms(g.answerText).reduce((a, b) => a + b, 0);
      expect(summed, `seed ${seed}`).toBe(n);
      // Four terms, one per non-empty place; expanded form does not write the
      // place that holds nothing.
      expect(terms(g.answerText).length, `seed ${seed}`).toBe(4);
    }
  });

  describe('every distractor is the expansion its tag names', () => {
    for (const seed of [1, 77, 512, 20233, 99999]) {
      it(`seed ${seed}`, () => {
        const g = nbt2ExpandedForm.generate(makeRng(seed));
        const n = numeralIn(g.prompt);
        const a = Math.floor(n / 10000);
        const b = Math.floor(n / 1000) % 10;
        const e = Math.floor(n / 10) % 10;
        const f = n % 10;

        // The zero place skipped: the numeral read as the four-digit "abef".
        expect(terms(taggedText(g, 'skipped-the-zero-place'))).toEqual([
          a * 1000,
          b * 100,
          e * 10,
          f,
        ]);
        // The digits themselves, including the 0 that stands for nothing.
        expect(terms(taggedText(g, 'wrote-the-digit-not-its-value'))).toEqual([a, b, 0, e, f]);
        // Every place counted one column too high.
        expect(terms(taggedText(g, 'wrong-power-of-ten'))).toEqual([
          a * 100000,
          b * 10000,
          e * 100,
          f * 10,
        ]);
      });
    }
  });

  it('sweeps its whole parameter space without a collision', () => {
    // The four option strings differ only in their first term, which is
    // a*10^4, a*10^3, a and a*10^5 — so a sweep over all admissible
    // (a, b, e, f) is the complete argument.
    let checked = 0;
    const failures: string[] = [];
    for (let a = 2; a <= 9; a++) {
      for (let b = 1; b <= 9; b++) {
        for (let e = 1; e <= 9; e++) {
          for (let f = 1; f <= 9; f++) {
            const texts = new Set([
              `${a * 10000} + ${b * 1000} + ${e * 10} + ${f}`,
              `${a * 1000} + ${b * 100} + ${e * 10} + ${f}`,
              `${a} + ${b} + 0 + ${e} + ${f}`,
              `${a * 100000} + ${b * 10000} + ${e * 100} + ${f * 10}`,
            ]);
            if (texts.size !== 4) failures.push(`a=${a} b=${b} e=${e} f=${f}`);
            checked++;
          }
        }
      }
    }
    expect(failures.slice(0, 5)).toEqual([]);
    expect(checked).toBe(5832);
  });
});
