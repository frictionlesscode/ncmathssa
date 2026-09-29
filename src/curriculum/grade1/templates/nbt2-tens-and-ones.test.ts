import { describe, it, expect } from 'vitest';
import { assertTemplateSound } from '../../../engine/templateTesting';
import { makeRng } from '../../../engine/rng';
import { assertGradeOneReadable } from '../../authoredBank.testkit';
import { assertCountWordsAgree, assertStatedArithmeticHolds, explanationTexts } from '../placeValue.testkit';
import { nbt2TensAndOnes, TENS_AND_ONES } from './nbt2-tens-and-ones';

type G = ReturnType<typeof nbt2TensAndOnes.generate>;

const byTag = (g: G, tag: string) => g.options.find((o) => o.misconception === tag);
const gen = (seed: number) => nbt2TensAndOnes.generate(makeRng(seed));

function parse(prompt: string) {
  const m = /^What number is (\d) (tens?) and (\d) (ones?)\?$/.exec(prompt);
  if (!m) throw new Error(`unparsable prompt: ${prompt}`);
  return { tens: Number(m[1]), tensWord: m[2], ones: Number(m[3]), onesWord: m[4] };
}

/** The four option values, from the tag formulas. */
const values = (tens: number, ones: number) => [
  `${10 * tens + ones}`,
  `${10 * ones + tens}`,
  `${tens + ones}`,
  `${10 * tens}${ones}`,
];

describe('g1.nbt2.tens-and-ones', () => {
  it('is sound at every seed', () => {
    assertTemplateSound(nbt2TensAndOnes);
  });

  it('is deterministic in its seed', () => {
    expect(gen(42)).toEqual(gen(42));
  });

  it('keeps every prompt readable for a six-year-old, at every seed', () => {
    assertGradeOneReadable(Array.from({ length: 300 }, (_, seed) => ({ id: `seed ${seed}`, prompt: gen(seed).prompt })));
  });

  it('is filed under NC.1.NBT.2', () => {
    expect(nbt2TensAndOnes.standardCode).toBe('NC.1.NBT.2');
  });

  // Two digits that differ (so the swap is a different number) and no 0 (a
  // decade is the bank's). The teens are in: "13 read as 31" lives there.
  it('asks about 1 to 9 tens and 1 to 9 ones, teens included, never the same digit twice', () => {
    let teens = 0;
    for (let seed = 0; seed < 2000; seed++) {
      const g = gen(seed);
      const { tens, tensWord, ones, onesWord } = parse(g.prompt);
      expect(tens, `seed ${seed}`).toBeGreaterThanOrEqual(1);
      expect(ones, `seed ${seed}`).toBeGreaterThanOrEqual(1);
      expect(ones, `seed ${seed}`).not.toBe(tens);
      expect(tensWord, `seed ${seed}`).toBe(tens === 1 ? 'ten' : 'tens');
      expect(onesWord, `seed ${seed}`).toBe(ones === 1 ? 'one' : 'ones');
      expect(g.answerText, `seed ${seed}`).toBe(`${10 * tens + ones}`);
      if (tens === 1) teens++;
    }
    expect(teens).toBeGreaterThan(0);
  });

  it('gives each distractor the value its tag names, at every seed', () => {
    for (let seed = 0; seed < 2000; seed++) {
      const g = gen(seed);
      const { tens, ones } = parse(g.prompt);
      expect(byTag(g, 'swapped-the-tens-and-the-ones')!.text, `seed ${seed}`).toBe(`${10 * ones + tens}`);
      // Each ten counted as a single one: 4 tens and 7 ones as 4 + 7.
      expect(byTag(g, 'used-the-tens-digit-as-ones')!.text, `seed ${seed}`).toBe(`${tens + ones}`);
      // 4 tens written as 40, then the 7 after it.
      expect(byTag(g, 'wrote-each-part-of-the-number-side-by-side')!.text, `seed ${seed}`).toBe(
        `${10 * tens}${ones}`,
      );
    }
  });

  it('states only true things in its worked solution, at every seed', () => {
    let claims = 0;
    for (let seed = 0; seed < 2000; seed++) {
      const g = gen(seed);
      const texts = explanationTexts(g.explanation);
      claims += assertStatedArithmeticHolds(texts, `seed ${seed}`);
      assertCountWordsAgree(texts, `seed ${seed}`);
    }
    expect(claims).toBeGreaterThan(4000);
  });

  // The swap lands above the key when the ones digit is the bigger one and
  // below it otherwise.
  it('does not always put the correct answer at the same rank', () => {
    const ranks = new Set<number>();
    for (let seed = 0; seed < 400; seed++) {
      const g = gen(seed);
      const sorted = g.options.map((o) => Number(o.text)).sort((x, y) => x - y);
      ranks.add(sorted.indexOf(Number(g.answerText)));
    }
    expect([...ranks].sort()).toEqual([1, 2]);
  });

  it('has no colliding option anywhere in its draw space', () => {
    const failures = TENS_AND_ONES.filter(({ tens, ones }) => new Set(values(tens, ones)).size !== 4);
    expect(failures).toEqual([]);
    // LITERAL: 9 x 9 digit pairs less the 9 with two equal digits.
    expect(TENS_AND_ONES.length).toBe(72);
  });
});
