import { describe, it, expect } from 'vitest';
import { assertTemplateSound } from '../../../engine/templateTesting';
import { makeRng } from '../../../engine/rng';
import { md5ShorterLengthUnknown, LENGTH_PAIRS } from './md5-shorter-length-unknown';

const shape = (g: {
  options: { label: string; text: string; isCorrect: boolean; misconception?: string }[];
}) => g.options.map((o) => [o.label, o.text, o.isCorrect, o.misconception ?? null]);

function parse(prompt: string): { big: number; diff: number; unit: string } {
  const m =
    /^The [a-z]+ [a-z ]+ is (\d+) ([a-z]+) long\. It is (\d+) ([a-z]+) longer than the [a-z]+ [a-z ]+\. In ☐ \+ (\d+) = (\d+), how long is the [a-z]+ [a-z ]+\?$/.exec(
      prompt,
    );
  if (!m) throw new Error(`unparsable prompt: ${prompt}`);
  expect(m[2]).toBe(m[4]);
  expect(Number(m[5])).toBe(Number(m[3]));
  expect(Number(m[6])).toBe(Number(m[1]));
  return { big: Number(m[1]), diff: Number(m[3]), unit: m[2] };
}

const value = (text: string) => Number(text.split(' ')[0]);

/** Subtracting the smaller digit from the larger in each column. */
function noRegroup(big: number, diff: number): number {
  const tens = Math.floor(big / 10) - Math.floor(diff / 10);
  return 10 * tens + Math.abs((big % 10) - (diff % 10));
}

describe('g2.md5.shorter-length-unknown', () => {
  it('is sound at every seed', () => {
    assertTemplateSound(md5ShorterLengthUnknown);
  });

  it('is deterministic in its seed', () => {
    expect(md5ShorterLengthUnknown.generate(makeRng(42))).toEqual(
      md5ShorterLengthUnknown.generate(makeRng(42)),
    );
  });

  // LITERAL pins, copied from a real run at these two seeds.
  it('emits exactly this question at seed 7', () => {
    const g = md5ShorterLengthUnknown.generate(makeRng(7));
    expect(g.prompt).toBe(
      'The blue ribbon is 26 inches long. It is 18 inches longer than the red ribbon. In ☐ + 18 = 26, how long is the red ribbon?',
    );
    expect(g.answerText).toBe('8 inches');
    expect(shape(g)).toEqual([
      ['A', '8 inches', true, null],
      ['B', '44 inches', false, 'added-instead-of-subtracted'],
      ['C', '18 inches', false, 'restated-a-known-number-instead-of-solving'],
      ['D', '12 inches', false, 'subtracted-without-regrouping'],
    ]);
    expect(g.explanation.stepByStep[3]).toBe('Step 4: The red ribbon is 8 inches long.');
  });

  it('emits exactly this question at seed 123', () => {
    const g = md5ShorterLengthUnknown.generate(makeRng(123));
    expect(g.prompt).toBe(
      'The red kite string is 31 meters long. It is 28 meters longer than the yellow kite string. In ☐ + 28 = 31, how long is the yellow kite string?',
    );
    expect(g.answerText).toBe('3 meters');
    expect(shape(g)).toEqual([
      ['A', '17 meters', false, 'subtracted-without-regrouping'],
      ['B', '28 meters', false, 'restated-a-known-number-instead-of-solving'],
      ['C', '3 meters', true, null],
      ['D', '59 meters', false, 'added-instead-of-subtracted'],
    ]);
    expect(g.explanation.stepByStep[3]).toBe('Step 4: The yellow kite string is 3 meters long.');
  });

  it('is filed under NC.2.MD.5', () => {
    expect(md5ShorterLengthUnknown.standardCode).toBe('NC.2.MD.5');
  });

  // NC.2.MD.5: "within 100 ... lengths that are given in the same units,
  // using equations with a symbol for the unknown number". Every question
  // prints its equation, every length is in one unit, and every number —
  // including the added-instead-of-subtracted distractor — stays under 100.
  it('stays within 100, in one unit, with the equation printed', () => {
    for (let seed = 0; seed < 600; seed++) {
      const g = md5ShorterLengthUnknown.generate(makeRng(seed));
      const { big, diff, unit } = parse(g.prompt);
      expect(big + diff, `seed ${seed}`).toBeLessThan(100);
      expect(value(g.answerText) + diff, `seed ${seed}: ☐ + diff must equal big`).toBe(big);
      for (const o of g.options) {
        expect(o.text, `seed ${seed}`).toMatch(
          new RegExp(`^\\d+ (?:${unit}|${unit === 'feet' ? 'foot' : unit.replace(/(?:es|s)$/, '')})$`),
        );
      }
      // Every question regroups, which is what makes the no-regrouping
      // distractor a live error.
      expect(big % 10, `seed ${seed}: ones do not regroup`).toBeLessThan(diff % 10);
    }
  });

  it('gives each distractor the value its tag names, at every seed', () => {
    for (let seed = 0; seed < 600; seed++) {
      const g = md5ShorterLengthUnknown.generate(makeRng(seed));
      const { big, diff } = parse(g.prompt);
      const byTag = (tag: string) => value(g.options.find((o) => o.misconception === tag)!.text);
      expect(byTag('added-instead-of-subtracted'), `seed ${seed}`).toBe(big + diff);
      expect(byTag('restated-a-known-number-instead-of-solving'), `seed ${seed}`).toBe(diff);
      expect(byTag('subtracted-without-regrouping'), `seed ${seed}`).toBe(noRegroup(big, diff));
    }
  });

  // The answer is never the "odd one out" by size. The two overshooting errors
  // always sit above it, and the restated number sits sometimes above and
  // sometimes below, so the key moves between the smallest and second
  // smallest.
  it('does not always put the correct answer at the same rank', () => {
    const ranks = new Set<number>();
    for (let seed = 0; seed < 400; seed++) {
      const g = md5ShorterLengthUnknown.generate(makeRng(seed));
      const sorted = g.options.map((o) => value(o.text)).sort((a, b) => a - b);
      ranks.add(sorted.indexOf(value(g.answerText)));
    }
    expect([...ranks].sort()).toEqual([0, 1]);
  });

  it('has no colliding option value anywhere in its draw space', () => {
    const failures: string[] = [];
    for (const { big, diff } of LENGTH_PAIRS) {
      const small = big - diff;
      const values = [small, big + diff, diff, noRegroup(big, diff)];
      if (new Set(values).size !== 4) failures.push(`${big}-${diff}: ${values}`);
      if (small < 1) failures.push(`${big}-${diff}: no shorter length`);
      if (big + diff > 99) failures.push(`${big}+${diff}: past 100`);
    }
    expect(failures).toEqual([]);
    // 12 tens pairs x 45 regrouping ones pairs = 540, less 10 pairs with
    // big = 2 x diff and 18 with a 0 in big's ones and tb = 2 x td (the two
    // families share no pair).
    expect(LENGTH_PAIRS.length, 'draw space after both exclusions').toBe(512);
  });

  // Both exclusions, shown to be real: each removed pair really would have
  // put two options on one value.
  it('would collide on exactly the two excluded families', () => {
    const doubles: string[] = [];
    const zeroOnes: string[] = [];
    for (let tb = 2; tb <= 7; tb++) {
      for (let td = 1; td < tb && tb + td <= 8; td++) {
        for (let ob = 0; ob <= 8; ob++) {
          for (let od = ob + 1; od <= 9; od++) {
            const big = 10 * tb + ob;
            const diff = 10 * td + od;
            if (big === 2 * diff) {
              expect(big - diff).toBe(diff);
              doubles.push(`${big}-${diff}`);
            }
            if (ob === 0 && tb === 2 * td) {
              expect(noRegroup(big, diff)).toBe(diff);
              zeroOnes.push(`${big}-${diff}`);
            }
          }
        }
      }
    }
    expect(doubles.length).toBeGreaterThan(0);
    expect(zeroOnes.length).toBeGreaterThan(0);
    const kept = new Set(LENGTH_PAIRS.map((p) => `${p.big}-${p.diff}`));
    for (const x of [...doubles, ...zeroOnes]) expect(kept.has(x), x).toBe(false);
  });
});
