import { describe, it, expect } from 'vitest';
import { assertTemplateSound } from '../../../engine/templateTesting';
import { makeRng } from '../../../engine/rng';
import { assertGradeOneReadable } from '../../authoredBank.testkit';
import { assertCountWordsAgree, assertStatedArithmeticHolds, explanationTexts } from '../placeValue.testkit';
import { nbt5TenMoreOrLess, TEN_DRAWS, ALL_TEN_DRAWS } from './nbt5-ten-more-or-less';

type G = ReturnType<typeof nbt5TenMoreOrLess.generate>;

const byTag = (g: G, tag: string) => g.options.find((o) => o.misconception === tag);
const gen = (seed: number) => nbt5TenMoreOrLess.generate(makeRng(seed));

function parse(prompt: string) {
  const m = /^What is 10 (more|less) than (\d+)\?$/.exec(prompt);
  if (!m) throw new Error(`unparsable prompt: ${prompt}`);
  return { direction: m[1] as 'more' | 'less', n: Number(m[2]) };
}

describe('g1.nbt5.ten-more-or-less', () => {
  it('bumps its content version: its draw space changed', () => {
    expect(nbt5TenMoreOrLess.contentVersion).toBe(2);
  });

  it('is sound at every seed', () => {
    assertTemplateSound(nbt5TenMoreOrLess);
  });

  it('is deterministic in its seed', () => {
    expect(gen(42)).toEqual(gen(42));
  });

  it('keeps every prompt readable for a six-year-old, at every seed', () => {
    assertGradeOneReadable(Array.from({ length: 300 }, (_, seed) => ({ id: `seed ${seed}`, prompt: gen(seed).prompt })));
  });

  it('is filed under NC.1.NBT.5', () => {
    expect(nbt5TenMoreOrLess.standardCode).toBe('NC.1.NBT.5');
  });

  // Ruling 23-8: draws a two-digit number 10-99.
  it('draws a two-digit number from 10 to 99, and answers with the right direction', () => {
    for (let seed = 0; seed < 2000; seed++) {
      const g = gen(seed);
      const { direction, n } = parse(g.prompt);
      expect(n, `seed ${seed}`).toBeGreaterThanOrEqual(10);
      expect(n, `seed ${seed}`).toBeLessThanOrEqual(99);
      expect(Number(g.answerText), `seed ${seed}`).toBe(direction === 'more' ? n + 10 : n - 10);
    }
  });

  it('gives each distractor the value its tag names, at every seed', () => {
    for (let seed = 0; seed < 2000; seed++) {
      const g = gen(seed);
      const { direction, n } = parse(g.prompt);
      const opposite = direction === 'more' ? n - 10 : n + 10;
      const onesShift = direction === 'more' ? n + 1 : n - 1;
      expect(byTag(g, 'gave-10-less-instead-of-10-more')!.text, `seed ${seed}`).toBe(`${opposite}`);
      expect(byTag(g, 'changed-the-ones-digit-instead-of-the-tens-digit')!.text, `seed ${seed}`).toBe(`${onesShift}`);
      expect(byTag(g, 'restated-a-known-number-instead-of-solving')!.text, `seed ${seed}`).toBe(`${n}`);
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

  it('never counts past 0 going down or drops a ones digit going up', () => {
    for (let seed = 0; seed < 2000; seed++) {
      const g = gen(seed);
      expect(Number(g.answerText), `seed ${seed}`).toBeGreaterThanOrEqual(0);
      for (const o of g.options) expect(Number(o.text), `seed ${seed}: ${o.text}`).toBeGreaterThanOrEqual(0);
    }
  });

  // content-g1 audit (Medium): "10 more than 94 = 104" needs the Grade 2 idea
  // of trading ten tens for a hundred, and the old step "only the tens digit
  // changes" was false there.
  it('F: 10 more never reaches 100, so only the tens digit changes', () => {
    expect(TEN_DRAWS.some((d) => d.direction === 'more' && d.n + 10 >= 100)).toBe(false);
    for (let seed = 0; seed < 2000; seed++) {
      const g = gen(seed);
      const { direction, n } = parse(g.prompt);
      if (direction === 'more') expect(Number(g.answerText), `seed ${seed}`).toBeLessThanOrEqual(99);
      else expect(n, `seed ${seed}`).toBeGreaterThanOrEqual(10);
    }
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

  it('has no colliding option anywhere in its draw space', () => {
    // LITERAL: 90 numbers (10-99) x 2 directions = 180, minus the ten "10 more"
    // draws of 90-99 that would reach 100 or more = 170. None of the 170
    // collide or go negative (10 less than 10 is 0, and its ones-shift
    // distractor is 9).
    expect(ALL_TEN_DRAWS.length).toBe(180);
    expect(TEN_DRAWS.length).toBe(170);
    for (let seed = 0; seed < 3000; seed++) {
      const g = gen(seed);
      expect(new Set(g.options.map((o) => o.text)).size, `seed ${seed}`).toBe(4);
    }
  });

  // STANDING RULING: fixed-seed pins on LITERAL strings, obtained by running
  // the generator, never hand-derived.
  it('pins seed 3', () => {
    const g = gen(3);
    expect(g.prompt).toBe('What is 10 more than 71?');
    expect(g.answerText).toBe('81');
    expect(g.options.map((o) => o.text)).toEqual(['72', '71', '61', '81']);
  });

  it('pins seed 50', () => {
    const g = gen(50);
    expect(g.prompt).toBe('What is 10 more than 56?');
    expect(g.answerText).toBe('66');
    expect(g.options.map((o) => o.text)).toEqual(['57', '56', '46', '66']);
  });
});
