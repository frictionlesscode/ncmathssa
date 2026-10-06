import { describe, it, expect } from 'vitest';
import { assertTemplateSound } from '../../../engine/templateTesting';
import { makeRng } from '../../../engine/rng';
import { assertGradeOneReadable } from '../../authoredBank.testkit';
import { assertCountWordsAgree, assertStatedArithmeticHolds, explanationTexts } from '../placeValue.testkit';
import { nbt6SubtractMultiplesOfTen, SUBTRACT_DRAWS, ALL_SUBTRACT_DRAWS } from './nbt6-subtract-multiples-of-ten';

type G = ReturnType<typeof nbt6SubtractMultiplesOfTen.generate>;

const byTag = (g: G, tag: string) => g.options.find((o) => o.misconception === tag);
const gen = (seed: number) => nbt6SubtractMultiplesOfTen.generate(makeRng(seed));

function parse(prompt: string) {
  const m = /^Find the difference: (\d+) − (\d+)\.$/.exec(prompt);
  if (!m) throw new Error(`unparsable prompt: ${prompt}`);
  return { minuend: Number(m[1]), subtrahend: Number(m[2]) };
}

describe('g1.nbt6.subtract-multiples-of-ten', () => {
  it('is sound at every seed', () => {
    assertTemplateSound(nbt6SubtractMultiplesOfTen);
  });

  it('is deterministic in its seed', () => {
    expect(gen(42)).toEqual(gen(42));
  });

  it('keeps every prompt readable for a six-year-old, at every seed', () => {
    assertGradeOneReadable(Array.from({ length: 300 }, (_, seed) => ({ id: `seed ${seed}`, prompt: gen(seed).prompt })));
  });

  it('is filed under NC.1.NBT.6', () => {
    expect(nbt6SubtractMultiplesOfTen.standardCode).toBe('NC.1.NBT.6');
  });

  // Ruling 23-5: both multiples of 10 in 10-90, minuend >= subtrahend.
  it('draws two multiples of 10 in 10-90, minuend at least the subtrahend', () => {
    for (let seed = 0; seed < 2000; seed++) {
      const g = gen(seed);
      const { minuend, subtrahend } = parse(g.prompt);
      for (const n of [minuend, subtrahend]) {
        expect(n, `seed ${seed}`).toBeGreaterThanOrEqual(10);
        expect(n, `seed ${seed}`).toBeLessThanOrEqual(90);
        expect(n % 10, `seed ${seed}: ${n} is not a multiple of 10`).toBe(0);
      }
      expect(minuend, `seed ${seed}`).toBeGreaterThanOrEqual(subtrahend);
      expect(Number(g.answerText), `seed ${seed}`).toBe(minuend - subtrahend);
    }
  });

  // Ruling 23-5: no negative distractors anywhere.
  it('never offers a negative option', () => {
    for (let seed = 0; seed < 2000; seed++) {
      const g = gen(seed);
      for (const o of g.options) expect(Number(o.text), `seed ${seed}: ${o.text}`).toBeGreaterThanOrEqual(0);
    }
  });

  it('gives each distractor the value its tag names, at every seed', () => {
    for (let seed = 0; seed < 2000; seed++) {
      const g = gen(seed);
      const { minuend, subtrahend } = parse(g.prompt);
      expect(byTag(g, 'added-instead-of-subtracted-the-multiples-of-ten')!.text, `seed ${seed}`).toBe(
        `${minuend + subtrahend}`,
      );
      expect(byTag(g, 'subtracted-the-tens-digits-without-the-zeros')!.text, `seed ${seed}`).toBe(
        `${minuend / 10 - subtrahend / 10}`,
      );
      const restated = byTag(g, 'restated-a-known-number-instead-of-solving')!.text;
      expect([`${minuend}`, `${subtrahend}`], `seed ${seed}`).toContain(restated);
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
    expect(claims).toBeGreaterThan(0);
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

  it('offers both restated operands across its seed space', () => {
    const restated = new Set<string>();
    for (let seed = 0; seed < 500; seed++) {
      const g = gen(seed);
      const { minuend } = parse(g.prompt);
      const text = byTag(g, 'restated-a-known-number-instead-of-solving')!.text;
      restated.add(text === `${minuend}` ? 'minuend' : 'subtrahend');
    }
    expect([...restated].sort()).toEqual(['minuend', 'subtrahend']);
  });

  it('has no colliding option anywhere in its draw space', () => {
    // LITERAL: 9 multiples of 10 (10-90) x 9, restricted to subtrahend <=
    // minuend, is 45 pairs, x 2 for which operand gets restated, is 90.
    // Excluded: the 18 where minuend equals subtrahend (both restate choices
    // collide, 0 answer = 0 tens-only), plus the 4 where the minuend is
    // exactly double the subtrahend and restating the subtrahend happens to
    // equal the answer (20-10, 40-20, 60-30, 80-40).
    expect(ALL_SUBTRACT_DRAWS.length).toBe(90);
    expect(SUBTRACT_DRAWS.length).toBe(68);
    for (let seed = 0; seed < 3000; seed++) {
      const g = gen(seed);
      expect(new Set(g.options.map((o) => o.text)).size, `seed ${seed}`).toBe(4);
    }
  });

  // STANDING RULING: fixed-seed pins on LITERAL strings, obtained by running
  // the generator, never hand-derived.
  it('pins seed 5', () => {
    const g = gen(5);
    expect(g.prompt).toBe('Find the difference: 80 − 50.');
    expect(g.answerText).toBe('30');
    expect(g.options.map((o) => o.text)).toEqual(['3', '130', '30', '80']);
  });

  it('pins seed 20', () => {
    const g = gen(20);
    expect(g.prompt).toBe('Find the difference: 80 − 70.');
    expect(g.answerText).toBe('10');
    expect(g.options.map((o) => o.text)).toEqual(['1', '10', '70', '150']);
  });
});
