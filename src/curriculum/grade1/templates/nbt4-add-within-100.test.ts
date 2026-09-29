import { describe, it, expect } from 'vitest';
import { assertTemplateSound } from '../../../engine/templateTesting';
import { makeRng } from '../../../engine/rng';
import { assertGradeOneReadable } from '../../authoredBank.testkit';
import { assertCountWordsAgree, assertStatedArithmeticHolds, explanationTexts } from '../placeValue.testkit';
import { nbt4AddWithin100, ADD_DRAWS, ALL_ADD_DRAWS } from './nbt4-add-within-100';

type G = ReturnType<typeof nbt4AddWithin100.generate>;

const byTag = (g: G, tag: string) => g.options.find((o) => o.misconception === tag);
const gen = (seed: number) => nbt4AddWithin100.generate(makeRng(seed));

function parse(prompt: string) {
  const m = /^Find the total: (\d+) \+ (\d+)\.$/.exec(prompt);
  if (!m) throw new Error(`unparsable prompt: ${prompt}`);
  return { a: Number(m[1]), b: Number(m[2]) };
}

describe('g1.nbt4.add-within-100', () => {
  it('is sound at every seed', () => {
    assertTemplateSound(nbt4AddWithin100);
  });

  it('is deterministic in its seed', () => {
    expect(gen(42)).toEqual(gen(42));
  });

  it('keeps every prompt readable for a six-year-old, at every seed', () => {
    assertGradeOneReadable(Array.from({ length: 300 }, (_, seed) => ({ id: `seed ${seed}`, prompt: gen(seed).prompt })));
  });

  it('is filed under NC.1.NBT.4', () => {
    expect(nbt4AddWithin100.standardCode).toBe('NC.1.NBT.4');
  });

  // Ruling 23-2: the second addend is a one-digit number OR a multiple of 10,
  // never an arbitrary two-digit number, and the sum never exceeds 99.
  it('keeps the second addend one-digit or a multiple of 10, and the sum within 100', () => {
    for (let seed = 0; seed < 3000; seed++) {
      const g = gen(seed);
      const { a, b } = parse(g.prompt);
      expect(a, `seed ${seed}`).toBeGreaterThanOrEqual(10);
      expect(a, `seed ${seed}`).toBeLessThanOrEqual(89);
      const isOneDigit = b >= 1 && b <= 9;
      const isMultipleOfTen = b >= 10 && b <= 90 && b % 10 === 0;
      expect(isOneDigit || isMultipleOfTen, `seed ${seed}: b=${b}`).toBe(true);
      expect(a + b, `seed ${seed}`).toBeLessThanOrEqual(99);
      expect(Number(g.answerText), `seed ${seed}`).toBe(a + b);
    }
  });

  it('gives each distractor the value its tag names, at every seed', () => {
    for (let seed = 0; seed < 3000; seed++) {
      const g = gen(seed);
      const { a, b } = parse(g.prompt);
      const tens = Math.floor(a / 10);
      const ones = a % 10;
      expect(byTag(g, 'left-one-of-the-addends-out')!.text, `seed ${seed}`).toBe(`${a}`);
      if (b <= 9) {
        expect(byTag(g, 'added-the-second-addend-into-the-tens-place')!.text, `seed ${seed}`).toBe(
          `${(tens + b) * 10 + ones}`,
        );
        expect(byTag(g, 'dropped-the-tens-digit-when-adding')!.text, `seed ${seed}`).toBe(`${ones + b}`);
      } else {
        expect(byTag(g, 'used-the-tens-digit-as-ones')!.text, `seed ${seed}`).toBe(`${a + b / 10}`);
        expect(byTag(g, 'dropped-the-ones-digit-of-the-two-digit-number')!.text, `seed ${seed}`).toBe(
          `${a - ones + b}`,
        );
      }
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
    expect(claims).toBeGreaterThan(2000);
  });

  it('does not always put the correct answer at the same rank', () => {
    const ranks = new Set<number>();
    for (let seed = 0; seed < 400; seed++) {
      const g = gen(seed);
      const sorted = g.options.map((o) => Number(o.text)).sort((x, y) => x - y);
      ranks.add(sorted.indexOf(Number(g.answerText)));
    }
    expect(ranks.size).toBeGreaterThanOrEqual(2);
  });

  it('draws both addend shapes across its seed space', () => {
    let ones = 0;
    let tens = 0;
    for (let seed = 0; seed < 500; seed++) {
      const { b } = parse(gen(seed).prompt);
      if (b <= 9) ones++;
      else tens++;
    }
    expect(ones).toBeGreaterThan(0);
    expect(tens).toBeGreaterThan(0);
  });

  it('has no colliding option anywhere in its draw space', () => {
    // LITERAL: every (a,b) with a 10-89, b one-digit 1-9 or a multiple of 10
    // 10-90 with a + b <= 99. Excluded draws are the ones where two of the
    // four options land on the same value.
    expect(ALL_ADD_DRAWS.length).toBe(1080);
    expect(ADD_DRAWS.length).toBeGreaterThan(0);
    expect(ADD_DRAWS.length).toBeLessThan(ALL_ADD_DRAWS.length);
    for (let seed = 0; seed < 3000; seed++) {
      const g = gen(seed);
      expect(new Set(g.options.map((o) => o.text)).size, `seed ${seed}`).toBe(4);
    }
  });

  // STANDING RULING: fixed-seed pins on LITERAL strings, obtained by running
  // the generator, never hand-derived.
  it('pins seed 7', () => {
    const g = gen(7);
    expect(g.prompt).toBe('Find the total: 11 + 4.');
    expect(g.answerText).toBe('15');
    expect(g.options.map((o) => o.text)).toEqual(['5', '11', '51', '15']);
  });

  it('pins seed 100', () => {
    const g = gen(100);
    expect(g.prompt).toBe('Find the total: 23 + 10.');
    expect(g.answerText).toBe('33');
    expect(g.options.map((o) => o.text)).toEqual(['33', '24', '30', '23']);
  });
});
