import { describe, it, expect } from 'vitest';
import { assertTemplateSound } from '../../../engine/templateTesting';
import { makeRng } from '../../../engine/rng';
import { assertGradeOneReadable } from '../../authoredBank.testkit';
import { md2MeasureWithUnits, ALL_MEASURE_DRAWS, MEASURE_DRAWS } from './md2-measure-with-units';

const gen = (seed: number) => md2MeasureWithUnits.generate(makeRng(seed));
const byTag = (g: ReturnType<typeof gen>, tag: string) => g.options.find((o) => o.misconception === tag);

function parseDetails(details: string) {
  const m = /^(\d+) (.+?) are laid end to end with no gaps or overlaps to measure the (\S+)\. Nearby, (\d+) .+? measure a different (\S+) the same way\.$/.exec(
    details,
  );
  if (!m) throw new Error(`unparsable promptDetails: ${details}`);
  return { n: Number(m[1]), unit: m[2], object: m[3], m: Number(m[4]), object2: m[5] };
}

describe('g1.md2.measure-with-units', () => {
  it('is sound at every seed', () => {
    assertTemplateSound(md2MeasureWithUnits);
  });

  it('is deterministic in its seed', () => {
    expect(gen(42)).toEqual(gen(42));
  });

  it('keeps every prompt readable for a six-year-old, at every seed', () => {
    assertGradeOneReadable(
      Array.from({ length: 300 }, (_, seed) => ({ id: `seed ${seed}`, prompt: gen(seed).prompt })),
    );
  });

  it('is filed under NC.1.MD.2', () => {
    expect(md2MeasureWithUnits.standardCode).toBe('NC.1.MD.2');
  });

  // RULING 24-9: the "no gaps or overlaps" figure lives in promptDetails, not
  // the length-checked prompt.
  it('keeps the figure out of the readability-checked prompt', () => {
    for (let seed = 0; seed < 300; seed++) {
      const g = gen(seed);
      expect(g.prompt).not.toMatch(/gaps|overlaps/i);
      expect(g.promptDetails).toMatch(/no gaps or overlaps/);
    }
  });

  it('answers with the correct object\'s own count, at every seed', () => {
    for (let seed = 0; seed < 2000; seed++) {
      const g = gen(seed);
      const { n } = parseDetails(g.promptDetails!);
      expect(Number(g.answerText), `seed ${seed}`).toBe(n);
      expect(n, `seed ${seed}`).toBeGreaterThanOrEqual(3);
      expect(n, `seed ${seed}`).toBeLessThanOrEqual(12);
    }
  });

  it('gives each distractor the value its tag names, at every seed', () => {
    for (let seed = 0; seed < 2000; seed++) {
      const g = gen(seed);
      const { n, m } = parseDetails(g.promptDetails!);
      expect(byTag(g, 'counted-a-unit-that-was-not-there')!.text, `seed ${seed}`).toBe(`${n + 1}`);
      expect(byTag(g, 'left-out-the-last-unit-while-counting')!.text, `seed ${seed}`).toBe(`${n - 1}`);
      expect(byTag(g, 'read-the-count-for-the-wrong-object')!.text, `seed ${seed}`).toBe(`${m}`);
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
    // LITERAL: n in 3-12, m in 3-12, m != n, n-1, n+1.
    expect(ALL_MEASURE_DRAWS.length).toBe(100);
    expect(MEASURE_DRAWS.length).toBeGreaterThan(0);
    expect(MEASURE_DRAWS.length).toBeLessThan(ALL_MEASURE_DRAWS.length);
    for (let seed = 0; seed < 2000; seed++) {
      const g = gen(seed);
      expect(new Set(g.options.map((o) => o.text)).size, `seed ${seed}`).toBe(4);
    }
  });

  // STANDING RULING: fixed-seed pins on LITERAL strings, obtained by running
  // the generator, never hand-derived.
  it('pins seed 3', () => {
    const g = gen(3);
    expect(g.prompt).toBe('How many paper clips long is the crayon?');
    expect(g.promptDetails).toBe(
      '10 paper clips are laid end to end with no gaps or overlaps to measure the crayon. Nearby, 4 paper clips measure a different pencil the same way.',
    );
    expect(g.answerText).toBe('10');
    expect(g.options.map((o) => o.text)).toEqual(['4', '9', '10', '11']);
  });

  it('pins seed 50', () => {
    const g = gen(50);
    expect(g.prompt).toBe('How many paper clips long is the string?');
    expect(g.promptDetails).toBe(
      '8 paper clips are laid end to end with no gaps or overlaps to measure the string. Nearby, 6 paper clips measure a different spoon the same way.',
    );
    expect(g.answerText).toBe('8');
    expect(g.options.map((o) => o.text)).toEqual(['7', '9', '6', '8']);
  });
});
