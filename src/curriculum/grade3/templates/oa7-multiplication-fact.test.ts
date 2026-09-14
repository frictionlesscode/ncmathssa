import { describe, it, expect } from 'vitest';
import { assertTemplateSound } from '../../../engine/templateTesting';
import { makeRng } from '../../../engine/rng';
import { oa7MultiplicationFact } from './oa7-multiplication-fact';

/** Reads the fact back out of the prompt, independently of the generator. */
function parse(prompt: string): { a: number; b: number } {
  const m = /^What is (\d+) × (\d+)\?$/.exec(prompt);
  if (!m) throw new Error(`unparsable prompt: ${prompt}`);
  return { a: Number(m[1]), b: Number(m[2]) };
}

const optionValue = (
  g: ReturnType<typeof oa7MultiplicationFact.generate>,
  tag: string,
): number => {
  const opt = g.options.find((o) => o.misconception === tag);
  if (!opt) throw new Error(`no option tagged ${tag}`);
  return Number(opt.text);
};

describe('g3.oa7.multiplication-fact', () => {
  it('is sound at every seed', () => {
    assertTemplateSound(oa7MultiplicationFact);
  });

  it('is deterministic in its seed', () => {
    expect(oa7MultiplicationFact.generate(makeRng(42))).toEqual(
      oa7MultiplicationFact.generate(makeRng(42)),
    );
  });

  it('produces a known question at a pinned seed', () => {
    const g = oa7MultiplicationFact.generate(makeRng(7));
    expect(g.options.find((o) => o.isCorrect)!.text).toBe(g.answerText);
    const { a, b } = parse(g.prompt);
    expect(g.answerText).toBe(`${a * b}`);
  });

  // NC.3.OA.7 caps factors at 10. A fact outside that is another grade's.
  it('never asks a fact outside the 10 by 10 table', () => {
    for (let seed = 0; seed < 300; seed++) {
      const { a, b } = parse(oa7MultiplicationFact.generate(makeRng(seed)).prompt);
      expect(a, `seed ${seed}: a=${a}`).toBeGreaterThanOrEqual(2);
      expect(a).toBeLessThanOrEqual(10);
      expect(b, `seed ${seed}: b=${b}`).toBeGreaterThanOrEqual(2);
      expect(b).toBeLessThanOrEqual(10);
    }
  });

  it('has no colliding option values anywhere in its draw space', () => {
    let drawn = 0;
    for (let a = 2; a <= 10; a++) {
      for (let b = 2; b <= 10; b++) {
        if ((a === 2 && b === 2) || (a === 3 && b === 3) || (a === 4 && b === 2)) continue;
        drawn++;
        const values = [a * b, a + b, (a - 1) * b, (a + 1) * b];
        expect(new Set(values).size, `(a=${a}, b=${b}) collides: ${values.join(', ')}`).toBe(4);
      }
    }
    expect(drawn, 'draw space size').toBe(78);
  });

  describe('every distractor is the value its tag names', () => {
    for (const seed of [3, 61, 904, 15207, 88888]) {
      it(`seed ${seed}`, () => {
        const g = oa7MultiplicationFact.generate(makeRng(seed));
        const { a, b } = parse(g.prompt);
        expect(optionValue(g, 'added-instead-of-multiplied')).toBe(a + b);
        expect(optionValue(g, 'skip-counted-one-group-short')).toBe((a - 1) * b);
        expect(optionValue(g, 'skip-counted-one-group-too-many')).toBe((a + 1) * b);
      });
    }
  });
});
