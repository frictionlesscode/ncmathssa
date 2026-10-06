import { describe, it, expect } from 'vitest';
import { assertTemplateSound } from '../../../engine/templateTesting';
import { makeRng } from '../../../engine/rng';
import { nbt4Add } from './nbt4-add';

const bare = (s: string): number => Number(s.replace(/,/g, ''));

function operands(details: string): { n: number; m: number } {
  const m = details.match(/^([\d,]+) \+ ([\d,]+)$/);
  if (!m) throw new Error(`unparsable promptDetails: ${details}`);
  return { n: bare(m[1]), m: bare(m[2]) };
}

/** Every number the child can see anywhere in the item — prompt, details,
 *  all four options, and every line of the worked solution. A bound on the
 *  KEY alone is not a bound on the item: a distractor is printed too. */
function everyPrintedNumber(g: ReturnType<typeof nbt4Add.generate>): number[] {
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

const taggedValue = (g: ReturnType<typeof nbt4Add.generate>, tag: string): number => {
  const opt = g.options.find((o) => o.misconception === tag);
  if (!opt) throw new Error(`no option tagged ${tag}`);
  return bare(opt.text);
};

describe('g4.nbt4.add', () => {
  it('is sound at every seed', () => {
    assertTemplateSound(nbt4Add);
  });

  it('is deterministic in its seed', () => {
    expect(nbt4Add.generate(makeRng(42))).toEqual(nbt4Add.generate(makeRng(42)));
  });

  it('produces a known question at a pinned seed', () => {
    const g = nbt4Add.generate(makeRng(8));
    expect(g.options.find((o) => o.isCorrect)!.text).toBe(g.answerText);
    expect(g.promptDetails!.length).toBeGreaterThan(0);
  });

  it('adds, and the key is right', () => {
    for (let seed = 0; seed < 300; seed++) {
      const g = nbt4Add.generate(makeRng(seed));
      const { n, m } = operands(g.promptDetails!);
      expect(n, `seed ${seed}`).toBeGreaterThanOrEqual(10000);
      expect(m, `seed ${seed}`).toBeGreaterThanOrEqual(1000);
      expect(m, `seed ${seed}`).toBeLessThanOrEqual(9999);
      expect(bare(g.answerText), `seed ${seed}`).toBe(n + m);
    }
  });

  it('nothing the item prints runs past the standard ceiling of 100,000', () => {
    // Over 2,000 seeds, not 300: the option that comes closest to this bound
    // is answer + 90, and it needs n and m near the top of their ranges.
    for (let seed = 0; seed < 2000; seed++) {
      const g = nbt4Add.generate(makeRng(seed));
      for (const value of everyPrintedNumber(g)) {
        expect(value, `seed ${seed}: ${JSON.stringify(g.options.map((o) => o.text))}`)
          .toBeLessThanOrEqual(100000);
      }
    }
  });

  it('always carries out of the ones column and nowhere else', () => {
    for (let seed = 0; seed < 300; seed++) {
      const g = nbt4Add.generate(makeRng(seed));
      const { n, m } = operands(g.promptDetails!);
      const digit = (x: number, place: number) => Math.floor(x / 10 ** place) % 10;
      expect(digit(n, 0) + digit(m, 0), `seed ${seed}`).toBeGreaterThanOrEqual(10);
      // No other column carries. The tens and hundreds are held one tighter
      // still, so that a carry misplaced into the hundreds cannot cascade.
      for (const place of [1, 2]) {
        expect(digit(n, place) + digit(m, place), `seed ${seed} place ${place}`)
          .toBeLessThanOrEqual(8);
      }
      expect(digit(n, 3) + digit(m, 3), `seed ${seed}`).toBeLessThanOrEqual(9);
    }
  });

  it('emits only addition misconceptions, never subtraction ones', () => {
    // The split exists because these two sets are disjoint. If a subtraction
    // tag ever appears here, the two templates have drifted back together.
    const tags = new Set<string>();
    for (let seed = 0; seed < 300; seed++) {
      for (const o of nbt4Add.generate(makeRng(seed)).options) {
        if (o.misconception) tags.add(o.misconception);
      }
    }
    expect([...tags].sort()).toEqual([
      'added-without-carrying',
      'carried-into-the-wrong-column',
      'subtracted-instead-of-added',
    ]);
  });

  describe('every distractor is the value its tag names', () => {
    for (const seed of [0, 1, 250, 40404, 65432]) {
      it(`seed ${seed}`, () => {
        const g = nbt4Add.generate(makeRng(seed));
        const { n, m } = operands(g.promptDetails!);
        const answer = bare(g.answerText);

        // The ten was never carried into the tens column.
        expect(taggedValue(g, 'added-without-carrying')).toBe(answer - 10);
        // The carry landed above the hundreds instead of the tens: ten short
        // in one column, a hundred long in the next.
        expect(taggedValue(g, 'carried-into-the-wrong-column')).toBe(answer + 90);
        expect(taggedValue(g, 'subtracted-instead-of-added')).toBe(n - m);
      });
    }
  });

  it('sweeps its whole collision space without a collision', () => {
    // The four values are answer, answer - 10, answer + 90 and answer - 2m:
    // functions of m alone once the answer cancels, so the collision space is
    // every four-digit m.
    const failures: string[] = [];
    let checked = 0;
    for (let m = 1000; m <= 9999; m++) {
      if (new Set([0, -10, 90, -2 * m]).size !== 4) failures.push(`m=${m}`);
      checked++;
    }
    expect(failures.slice(0, 5)).toEqual([]);
    expect(checked).toBe(9000);
  });
});
