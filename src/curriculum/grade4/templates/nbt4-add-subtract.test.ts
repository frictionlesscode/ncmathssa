import { describe, it, expect } from 'vitest';
import { assertTemplateSound } from '../../../engine/templateTesting';
import { makeRng } from '../../../engine/rng';
import { nbt4AddSubtract } from './nbt4-add-subtract';

const bare = (s: string): number => Number(s.replace(/,/g, ''));

function operands(details: string): { n: number; m: number; op: '+' | '−' } {
  const m = details.match(/^([\d,]+) ([+−]) ([\d,]+)$/);
  if (!m) throw new Error(`unparsable promptDetails: ${details}`);
  return { n: bare(m[1]), m: bare(m[3]), op: m[2] as '+' | '−' };
}

const taggedValue = (
  g: ReturnType<typeof nbt4AddSubtract.generate>,
  tag: string,
): number => {
  const opt = g.options.find((o) => o.misconception === tag);
  if (!opt) throw new Error(`no option tagged ${tag}`);
  return bare(opt.text);
};

describe('g4.nbt4.add-subtract', () => {
  it('is sound at every seed', () => {
    assertTemplateSound(nbt4AddSubtract);
  });

  it('is deterministic in its seed', () => {
    expect(nbt4AddSubtract.generate(makeRng(42))).toEqual(nbt4AddSubtract.generate(makeRng(42)));
  });

  it('produces a known question at a pinned seed', () => {
    const g = nbt4AddSubtract.generate(makeRng(8));
    expect(g.options.find((o) => o.isCorrect)!.text).toBe(g.answerText);
    expect(g.promptDetails!.length).toBeGreaterThan(0);
  });

  it('offers both operations across seeds, because the standard names both', () => {
    const ops = new Set<string>();
    for (let seed = 0; seed < 100; seed++) {
      ops.add(operands(nbt4AddSubtract.generate(makeRng(seed)).promptDetails!).op);
    }
    expect([...ops].sort()).toEqual(['+', '−']);
  });

  it('stays inside the standard, and the arithmetic is right', () => {
    for (let seed = 0; seed < 300; seed++) {
      const g = nbt4AddSubtract.generate(makeRng(seed));
      const { n, m, op } = operands(g.promptDetails!);
      expect(n, `seed ${seed}`).toBeGreaterThanOrEqual(10000);
      expect(m, `seed ${seed}`).toBeGreaterThanOrEqual(1000);
      expect(m, `seed ${seed}`).toBeLessThanOrEqual(9999);
      const answer = op === '+' ? n + m : n - m;
      expect(answer, `seed ${seed}`).toBeLessThanOrEqual(100000);
      expect(bare(g.answerText), `seed ${seed}`).toBe(answer);
    }
  });

  it('always regroups in the ones column and nowhere else', () => {
    for (let seed = 0; seed < 300; seed++) {
      const g = nbt4AddSubtract.generate(makeRng(seed));
      const { n, m, op } = operands(g.promptDetails!);
      const digit = (x: number, place: number) => Math.floor(x / 10 ** place) % 10;
      if (op === '+') {
        expect(digit(n, 0) + digit(m, 0), `seed ${seed}`).toBeGreaterThanOrEqual(10);
        // No other column carries. The tens and hundreds are held one tighter
        // still, so that a carry misplaced into the hundreds cannot cascade.
        for (const place of [1, 2]) {
          expect(digit(n, place) + digit(m, place), `seed ${seed} place ${place}`)
            .toBeLessThanOrEqual(8);
        }
        expect(digit(n, 3) + digit(m, 3), `seed ${seed}`).toBeLessThanOrEqual(9);
      } else {
        expect(digit(n, 0), `seed ${seed}`).toBeLessThan(digit(m, 0));
        expect(digit(n, 1), `seed ${seed}`).toBeGreaterThan(digit(m, 1));
        for (const place of [2, 3]) {
          expect(digit(n, place), `seed ${seed} place ${place}`)
            .toBeGreaterThanOrEqual(digit(m, place));
        }
        // The one exclusion the collision algebra needs.
        expect(digit(m, 0) - digit(n, 0), `seed ${seed}`).not.toBe(5);
      }
    }
  });

  describe('every distractor is the value its tag names', () => {
    for (const seed of [0, 1, 250, 40404, 65432]) {
      it(`seed ${seed}`, () => {
        const g = nbt4AddSubtract.generate(makeRng(seed));
        const { n, m, op } = operands(g.promptDetails!);
        const digit = (x: number, place: number) => Math.floor(x / 10 ** place) % 10;
        const answer = bare(g.answerText);

        if (op === '+') {
          // The ten was never carried into the tens column.
          expect(taggedValue(g, 'added-without-carrying')).toBe(answer - 10);
          // The carry landed above the hundreds instead of the tens: ten short
          // in one column, a hundred long in the next.
          expect(taggedValue(g, 'carried-into-the-wrong-column')).toBe(answer + 90);
          expect(taggedValue(g, 'subtracted-instead-of-added')).toBe(n - m);
        } else {
          const gap = digit(m, 0) - digit(n, 0);
          // Smaller digit taken from larger in every column.
          expect(taggedValue(g, 'subtracted-without-regrouping')).toBe(answer + 2 * gap);
          // The ten borrowed but the tens digit never reduced.
          expect(taggedValue(g, 'borrowed-without-reducing-the-next-column')).toBe(answer + 10);
          expect(taggedValue(g, 'added-instead-of-subtracted')).toBe(n + m);
        }
      });
    }
  });

  it('sweeps its whole collision space without a collision', () => {
    // SUBTRACT mode. The four values are answer, answer + 2d, answer + 10 and
    // answer + 2m, so every pairwise gap is a function of (d, m) alone and the
    // answer cancels. The collision space is therefore exactly the admissible
    // (d, m) pairs: d in 1..9 excluding 5, m a four-digit number.
    const failures: string[] = [];
    let subtractChecked = 0;
    for (let d = 1; d <= 9; d++) {
      if (d === 5) continue;
      for (let m = 1000; m <= 9999; m++) {
        const gaps = new Set([0, 2 * d, 10, 2 * m]);
        if (gaps.size !== 4) failures.push(`subtract d=${d} m=${m}`);
        subtractChecked++;
      }
    }
    expect(failures.slice(0, 5)).toEqual([]);
    expect(subtractChecked).toBe(8 * 9000);

    // ADD mode. The four values are answer, answer - 10, answer + 90 and
    // answer - 2m: functions of m alone, so the collision space is every
    // four-digit m.
    let addChecked = 0;
    for (let m = 1000; m <= 9999; m++) {
      const gaps = new Set([0, -10, 90, -2 * m]);
      if (gaps.size !== 4) failures.push(`add m=${m}`);
      addChecked++;
    }
    expect(failures.slice(0, 5)).toEqual([]);
    expect(addChecked).toBe(9000);
  });

  it('d = 5 is the collision the subtract mode excludes, and it is real', () => {
    // Without the exclusion, "no borrow" (answer + 2d) and "kept the ten"
    // (answer + 10) are the same number at every one of those 9,000 pairs.
    let collisions = 0;
    for (let m = 1000; m <= 9999; m++) {
      if (new Set([0, 2 * 5, 10, 2 * m]).size !== 4) collisions++;
    }
    expect(collisions).toBe(9000);
  });
});
