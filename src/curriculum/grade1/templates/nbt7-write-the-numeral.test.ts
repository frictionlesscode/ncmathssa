import { describe, it, expect } from 'vitest';
import { assertTemplateSound } from '../../../engine/templateTesting';
import { makeRng } from '../../../engine/rng';
import { assertGradeOneReadable } from '../../authoredBank.testkit';
import { assertCountWordsAgree, assertStatedArithmeticHolds, explanationTexts } from '../placeValue.testkit';
import { nbt7WriteTheNumeral, NUMERAL_DRAWS } from './nbt7-write-the-numeral';

type G = ReturnType<typeof nbt7WriteTheNumeral.generate>;

const byTag = (g: G, tag: string) => g.options.find((o) => o.misconception === tag);
const gen = (seed: number) => nbt7WriteTheNumeral.generate(makeRng(seed));

// The test's own word lists, so a misspelled name in the template fails here.
const TENS = ['twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];
const ONES = ['one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine'];

function parse(prompt: string) {
  const m = /^Which number is ([a-z]+)-([a-z]+)\?$/.exec(prompt);
  if (!m) throw new Error(`unparsable prompt: ${prompt}`);
  const tens = TENS.indexOf(m[1]) + 2;
  const ones = ONES.indexOf(m[2]) + 1;
  if (tens < 2 || ones < 1) throw new Error(`not a number name: ${m[1]}-${m[2]}`);
  return { tens, ones, n: 10 * tens + ones };
}

/** The four option values for a numeral, from the tag formulas. */
const values = (tens: number, ones: number, leftOff: 'tens' | 'ones') => [
  `${10 * tens + ones}`,
  `${10 * ones + tens}`,
  `${10 * tens}${ones}`,
  leftOff === 'tens' ? `${10 * tens}` : `${ones}`,
];

describe('g1.nbt7.write-the-numeral', () => {
  it('is sound at every seed', () => {
    assertTemplateSound(nbt7WriteTheNumeral);
  });

  it('is deterministic in its seed', () => {
    expect(gen(42)).toEqual(gen(42));
  });

  it('keeps every prompt readable for a six-year-old, at every seed', () => {
    assertGradeOneReadable(Array.from({ length: 300 }, (_, seed) => ({ id: `seed ${seed}`, prompt: gen(seed).prompt })));
  });

  // Ruling 23-1: reading and writing numerals is NC.1.NBT.7, not NC.1.NBT.1.
  it('is filed under NC.1.NBT.7', () => {
    expect(nbt7WriteTheNumeral.standardCode).toBe('NC.1.NBT.7');
  });

  // Ruling 23-4: numerals to 100, not NC.1.NBT.1's 150.
  it('asks for a numeral from 21 to 99 that has two different digits and no 0', () => {
    for (let seed = 0; seed < 2000; seed++) {
      const g = gen(seed);
      const { tens, ones, n } = parse(g.prompt);
      expect(n, `seed ${seed}`).toBeGreaterThanOrEqual(21);
      expect(n, `seed ${seed}`).toBeLessThanOrEqual(99);
      expect(ones, `seed ${seed}: ${n} ends in 0`).not.toBe(0);
      expect(ones, `seed ${seed}: ${n} has two equal digits`).not.toBe(tens);
      expect(g.answerText, `seed ${seed}`).toBe(`${n}`);
    }
  });

  it('gives each distractor the value its tag names, at every seed', () => {
    for (let seed = 0; seed < 2000; seed++) {
      const g = gen(seed);
      const { tens, ones } = parse(g.prompt);
      expect(byTag(g, 'swapped-the-tens-and-the-ones')!.text, `seed ${seed}`).toBe(`${10 * ones + tens}`);
      // "forty-seven" written part by part: 40, then 7.
      expect(byTag(g, 'wrote-each-part-of-the-number-side-by-side')!.text, `seed ${seed}`).toBe(`${10 * tens}${ones}`);
      // Stopped after "forty", or wrote only the "seven".
      expect([`${10 * tens}`, `${ones}`], `seed ${seed}`).toContain(byTag(g, 'left-off-part-of-the-number-name')!.text);
    }
  });

  it('states only true things in its worked solution, at every seed', () => {
    let claims = 0;
    for (let seed = 0; seed < 2000; seed++) {
      const g = gen(seed);
      const { tens, ones, n } = parse(g.prompt);
      const texts = explanationTexts(g.explanation);
      claims += assertStatedArithmeticHolds(texts, `seed ${seed}`);
      assertCountWordsAgree(texts, `seed ${seed}`);
      // Its tens word and its ones word are named for what they are worth.
      const [tensWord, onesWord] = g.prompt.slice('Which number is '.length, -1).split('-');
      expect(g.explanation.stepByStep[0].toLowerCase(), `seed ${seed}`).toContain(`${tensWord} is ${tens} tens`);
      expect(g.explanation.stepByStep[1].toLowerCase(), `seed ${seed}`).toContain(
        `${onesWord} is ${ones} ${ones === 1 ? 'one' : 'ones'}`,
      );
      expect(g.explanation.stepByStep.at(-1), `seed ${seed}`).toContain(`is written ${n}`);
    }
    expect(claims).toBeGreaterThan(2000);
  });

  it('offers both ways of leaving part of the name off', () => {
    const seen = new Set<string>();
    for (let seed = 0; seed < 200; seed++) {
      const g = gen(seed);
      const { tens } = parse(g.prompt);
      seen.add(byTag(g, 'left-off-part-of-the-number-name')!.text === `${10 * tens}` ? 'tens' : 'ones');
    }
    expect([...seen].sort()).toEqual(['ones', 'tens']);
  });

  // The swapped numeral lands above the key when the ones digit is bigger and
  // below it when it is smaller, so the key's rank moves with the draw.
  it('does not always put the correct answer at the same rank', () => {
    const ranks = new Set<number>();
    for (let seed = 0; seed < 400; seed++) {
      const g = gen(seed);
      const sorted = g.options.map((o) => Number(o.text)).sort((x, y) => x - y);
      ranks.add(sorted.indexOf(Number(g.answerText)));
    }
    expect(ranks.size).toBeGreaterThanOrEqual(2);
  });

  it('has no colliding option anywhere in its draw space', () => {
    const failures = NUMERAL_DRAWS.filter(
      ({ tens, ones, leftOff }) => new Set(values(tens, ones, leftOff)).size !== 4,
    );
    expect(failures).toEqual([]);
    // LITERAL: tens 2..9 x ones 1..9, less the 8 with two equal digits, is
    // 64 numerals, each with both ways of leaving part of the name off.
    expect(new Set(NUMERAL_DRAWS.map((d) => 10 * d.tens + d.ones)).size).toBe(64);
    expect(NUMERAL_DRAWS.length).toBe(128);
  });

  // STANDING RULING: fixed-seed pins on LITERAL strings, obtained by running
  // the generator, never hand-derived.
  it('pins seed 7', () => {
    const g = gen(7);
    expect(g.prompt).toBe('Which number is twenty-one?');
    expect(g.answerText).toBe('21');
    expect(g.options.map((o) => o.text)).toEqual(['1', '12', '201', '21']);
  });

  it('pins seed 100', () => {
    const g = gen(100);
    expect(g.prompt).toBe('Which number is thirty-seven?');
    expect(g.answerText).toBe('37');
    expect(g.options.map((o) => o.text)).toEqual(['37', '307', '30', '73']);
  });
});
