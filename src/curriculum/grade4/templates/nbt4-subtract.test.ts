import { describe, it, expect } from 'vitest';
import { assertTemplateSound } from '../../../engine/templateTesting';
import { makeRng } from '../../../engine/rng';
import { nbt4Subtract } from './nbt4-subtract';

const bare = (s: string): number => Number(s.replace(/,/g, ''));

function operands(details: string): { n: number; m: number } {
  const m = details.match(/^([\d,]+) − ([\d,]+)$/);
  if (!m) throw new Error(`unparsable promptDetails: ${details}`);
  return { n: bare(m[1]), m: bare(m[2]) };
}

/** Every number the child can see anywhere in the item — prompt, details,
 *  all four options, and every line of the worked solution. A bound on the
 *  KEY alone is not a bound on the item: a distractor is printed too. */
function everyPrintedNumber(g: ReturnType<typeof nbt4Subtract.generate>): number[] {
  const text = [
    g.prompt,
    g.promptDetails ?? '',
    ...g.options.map((o) => o.text),
    ...g.explanation.stepByStep,
    g.explanation.conceptSummary,
    g.explanation.commonMisconception ?? '',
  ].join(' ');
  return (text.match(/\d[\d,]*/g) ?? []).map(bare);
}

const taggedValue = (g: ReturnType<typeof nbt4Subtract.generate>, tag: string): number => {
  const opt = g.options.find((o) => o.misconception === tag);
  if (!opt) throw new Error(`no option tagged ${tag}`);
  return bare(opt.text);
};

describe('g4.nbt4.subtract', () => {
  it('is sound at every seed', () => {
    assertTemplateSound(nbt4Subtract);
  });

  it('is deterministic in its seed', () => {
    expect(nbt4Subtract.generate(makeRng(42))).toEqual(nbt4Subtract.generate(makeRng(42)));
  });

  it('produces a known question at a pinned seed', () => {
    const g = nbt4Subtract.generate(makeRng(8));
    expect(g.options.find((o) => o.isCorrect)!.text).toBe(g.answerText);
    expect(g.promptDetails!.length).toBeGreaterThan(0);
  });

  it('subtracts, and the key is right', () => {
    for (let seed = 0; seed < 300; seed++) {
      const g = nbt4Subtract.generate(makeRng(seed));
      const { n, m } = operands(g.promptDetails!);
      expect(n, `seed ${seed}`).toBeGreaterThanOrEqual(10000);
      expect(m, `seed ${seed}`).toBeGreaterThanOrEqual(1000);
      expect(m, `seed ${seed}`).toBeLessThanOrEqual(9999);
      expect(bare(g.answerText), `seed ${seed}`).toBe(n - m);
    }
  });

  it('nothing the item prints runs past the standard ceiling of 100,000', () => {
    // Over 2,000 seeds, not 300: the option that can break this bound is
    // n + m, and it needs n near the top of its range to do it.
    for (let seed = 0; seed < 2000; seed++) {
      const g = nbt4Subtract.generate(makeRng(seed));
      for (const value of everyPrintedNumber(g)) {
        expect(value, `seed ${seed}: ${JSON.stringify(g.options.map((o) => o.text))}`)
          .toBeLessThanOrEqual(100000);
      }
    }
  });

  it('always regroups in the ones column and nowhere else', () => {
    for (let seed = 0; seed < 300; seed++) {
      const g = nbt4Subtract.generate(makeRng(seed));
      const { n, m } = operands(g.promptDetails!);
      const digit = (x: number, place: number) => Math.floor(x / 10 ** place) % 10;
      expect(digit(n, 0), `seed ${seed}`).toBeLessThan(digit(m, 0));
      expect(digit(n, 1), `seed ${seed}`).toBeGreaterThan(digit(m, 1));
      for (const place of [2, 3]) {
        expect(digit(n, place), `seed ${seed} place ${place}`)
          .toBeGreaterThanOrEqual(digit(m, place));
      }
      // The one exclusion the collision algebra needs.
      expect(digit(m, 0) - digit(n, 0), `seed ${seed}`).not.toBe(5);
    }
  });

  it('emits only subtraction misconceptions, never addition ones', () => {
    // The split exists because these two sets are disjoint. If an addition
    // tag ever appears here, the two templates have drifted back together.
    const tags = new Set<string>();
    for (let seed = 0; seed < 300; seed++) {
      for (const o of nbt4Subtract.generate(makeRng(seed)).options) {
        if (o.misconception) tags.add(o.misconception);
      }
    }
    expect([...tags].sort()).toEqual([
      'added-instead-of-subtracted',
      'borrowed-without-reducing-the-next-column',
      'subtracted-without-regrouping',
    ]);
  });

  describe('every distractor is the value its tag names', () => {
    for (const seed of [0, 1, 250, 40404, 65432]) {
      it(`seed ${seed}`, () => {
        const g = nbt4Subtract.generate(makeRng(seed));
        const { n, m } = operands(g.promptDetails!);
        const digit = (x: number, place: number) => Math.floor(x / 10 ** place) % 10;
        const answer = bare(g.answerText);
        const gap = digit(m, 0) - digit(n, 0);

        // Smaller digit taken from larger in every column.
        expect(taggedValue(g, 'subtracted-without-regrouping')).toBe(answer + 2 * gap);
        // The ten borrowed but the tens digit never reduced.
        expect(taggedValue(g, 'borrowed-without-reducing-the-next-column')).toBe(answer + 10);
        expect(taggedValue(g, 'added-instead-of-subtracted')).toBe(n + m);
      });
    }
  });

  it('sweeps its whole collision space without a collision', () => {
    // The four values are answer, answer + 2d, answer + 10 and answer + 2m, so
    // every pairwise gap is a function of (d, m) alone and the answer cancels.
    // The collision space is therefore exactly the admissible (d, m) pairs:
    // d in 1..9 excluding 5, m a four-digit number.
    const failures: string[] = [];
    let checked = 0;
    for (let d = 1; d <= 9; d++) {
      if (d === 5) continue;
      for (let m = 1000; m <= 9999; m++) {
        if (new Set([0, 2 * d, 10, 2 * m]).size !== 4) failures.push(`d=${d} m=${m}`);
        checked++;
      }
    }
    expect(failures.slice(0, 5)).toEqual([]);
    expect(checked).toBe(8 * 9000);
  });

  it('d = 5 is the collision the draw excludes, and it is real', () => {
    // Without the exclusion, "no borrow" (answer + 2d) and "kept the ten"
    // (answer + 10) are the same number at every one of those 9,000 pairs.
    let collisions = 0;
    for (let m = 1000; m <= 9999; m++) {
      if (new Set([0, 2 * 5, 10, 2 * m]).size !== 4) collisions++;
    }
    expect(collisions).toBe(9000);
  });
});
