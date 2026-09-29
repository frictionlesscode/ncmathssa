import { describe, it, expect } from 'vitest';
import { assertTemplateSound } from '../../../engine/templateTesting';
import { makeRng } from '../../../engine/rng';
import { assertGradeOneReadable } from '../../authoredBank.testkit';
import { md4ReadTheData, ALL_DATA_DRAWS, DATA_DRAWS } from './md4-read-the-data';

const gen = (seed: number) => md4ReadTheData.generate(makeRng(seed));

function parseGraph(details: string): number[] {
  const m = /^A graph shows favorite \w+: (.+)\.$/.exec(details);
  if (!m) throw new Error(`unparsable promptDetails: ${details}`);
  return m[1].split(', ').map((part) => Number(/^(\d+) picked/.exec(part)![1]));
}

function typeOf(prompt: string): 'total' | 'category' | 'compare' {
  if (prompt === 'How many students answered in all?') return 'total';
  if (prompt.startsWith('How many more')) return 'compare';
  return 'category';
}

describe('g1.md4.read-the-data', () => {
  it('is sound at every seed', () => {
    assertTemplateSound(md4ReadTheData);
  });

  it('is deterministic in its seed', () => {
    expect(gen(42)).toEqual(gen(42));
  });

  it('keeps every prompt readable for a six-year-old, at every seed', () => {
    assertGradeOneReadable(
      Array.from({ length: 300 }, (_, seed) => ({ id: `seed ${seed}`, prompt: gen(seed).prompt })),
    );
  });

  it('is filed under NC.1.MD.4', () => {
    expect(md4ReadTheData.standardCode).toBe('NC.1.MD.4');
  });

  // Ruling 24-5: never more than three categories.
  it('never draws more than three categories', () => {
    for (let seed = 0; seed < 1000; seed++) {
      const counts = parseGraph(gen(seed).promptDetails!);
      expect(counts.length, `seed ${seed}`).toBe(3);
    }
  });

  it('draws all three question types across its seed space', () => {
    const seen = new Set<string>();
    for (let seed = 0; seed < 500; seed++) seen.add(typeOf(gen(seed).prompt));
    expect(seen).toEqual(new Set(['total', 'category', 'compare']));
  });

  it('answers "total" with the sum of every category, at every seed', () => {
    for (let seed = 0; seed < 2000; seed++) {
      const g = gen(seed);
      if (typeOf(g.prompt) !== 'total') continue;
      const counts = parseGraph(g.promptDetails!);
      expect(Number(g.answerText), `seed ${seed}`).toBe(counts.reduce((a, b) => a + b, 0));
    }
  });

  it('answers "category" questions with that category\'s own count, at every seed', () => {
    for (let seed = 0; seed < 2000; seed++) {
      const g = gen(seed);
      if (typeOf(g.prompt) !== 'category') continue;
      const counts = parseGraph(g.promptDetails!);
      expect(counts, `seed ${seed}`).toContain(Number(g.answerText));
      // The "used-the-wrong-given-quantity" distractors are literally the two
      // OTHER categories' counts, and "summed-all-data-points" is their sum.
      const wrongQty = g.options.filter((o) => o.misconception === 'used-the-wrong-given-quantity').map((o) => Number(o.text));
      const remaining = counts.filter((c) => c !== Number(g.answerText));
      expect(wrongQty.sort(), `seed ${seed}`).toEqual(remaining.sort());
      const summed = g.options.find((o) => o.misconception === 'summed-all-data-points')!;
      expect(Number(summed.text), `seed ${seed}`).toBe(counts.reduce((a, b) => a + b, 0));
    }
  });

  it('answers "compare" questions with the difference of the two largest categories, at every seed', () => {
    for (let seed = 0; seed < 2000; seed++) {
      const g = gen(seed);
      if (typeOf(g.prompt) !== 'compare') continue;
      const counts = parseGraph(g.promptDetails!).sort((a, b) => b - a);
      const [big, small] = counts;
      expect(Number(g.answerText), `seed ${seed}`).toBe(big - small);
      const added = g.options.find((o) => o.misconception === 'added-instead-of-subtracted')!;
      expect(Number(added.text), `seed ${seed}`).toBe(big + small);
      const amounts = g.options
        .filter((o) => o.misconception === 'gave-an-amount-instead-of-the-difference')
        .map((o) => Number(o.text))
        .sort((a, b) => a - b);
      expect(amounts, `seed ${seed}`).toEqual([small, big].sort((a, b) => a - b));
    }
  });

  it('does not always put the correct answer at the same rank', () => {
    const ranks = new Set<number>();
    for (let seed = 0; seed < 500; seed++) {
      const g = gen(seed);
      const sorted = g.options.map((o) => Number(o.text)).sort((x, y) => x - y);
      ranks.add(sorted.indexOf(Number(g.answerText)));
    }
    expect(ranks.size).toBeGreaterThanOrEqual(2);
  });

  it('has no colliding option anywhere in its draw space', () => {
    // LITERAL: every ascending distinct triple 1-9, minus those where
    // c3 = 2*c2 (the 'compare' collision).
    expect(ALL_DATA_DRAWS.length).toBe(84);
    expect(DATA_DRAWS.length).toBeGreaterThan(0);
    expect(DATA_DRAWS.length).toBeLessThan(ALL_DATA_DRAWS.length);
    for (let seed = 0; seed < 2000; seed++) {
      const g = gen(seed);
      expect(new Set(g.options.map((o) => o.text)).size, `seed ${seed}`).toBe(4);
    }
  });

  // STANDING RULING: fixed-seed pins on LITERAL strings, obtained by running
  // the generator, never hand-derived. One pin per question type.
  it('pins seed 1 (category)', () => {
    const g = gen(1);
    expect(g.prompt).toBe('How many students picked grapes?');
    expect(g.promptDetails).toBe('A graph shows favorite fruit: 8 picked apples, 7 picked bananas, 2 picked grapes.');
    expect(g.answerText).toBe('2');
    expect(g.options.map((o) => o.text)).toEqual(['17', '2', '7', '8']);
  });

  it('pins seed 2 (compare)', () => {
    const g = gen(2);
    expect(g.prompt).toBe('How many more students picked dogs than cats?');
    expect(g.promptDetails).toBe('A graph shows favorite pet: 8 picked dogs, 1 picked fish, 7 picked cats.');
    expect(g.answerText).toBe('1');
    expect(g.options.map((o) => o.text)).toEqual(['8', '1', '7', '15']);
  });

  it('pins seed 7 (total)', () => {
    const g = gen(7);
    expect(g.prompt).toBe('How many students answered in all?');
    expect(g.promptDetails).toBe('A graph shows favorite fruit: 9 picked apples, 6 picked bananas, 8 picked grapes.');
    expect(g.answerText).toBe('23');
    expect(g.options.map((o) => o.text)).toEqual(['9', '15', '17', '23']);
  });
});
