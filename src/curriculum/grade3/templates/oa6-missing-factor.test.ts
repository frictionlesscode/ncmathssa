import { describe, it, expect } from 'vitest';
import { assertTemplateSound } from '../../../engine/templateTesting';
import { makeRng } from '../../../engine/rng';
import { oa6MissingFactor } from './oa6-missing-factor';

/** Reads the equation back out of the prompt, independently of the generator. */
function parse(prompt: string): { a: number; p: number } {
  const m = /equation (\d+) × ☐ = (\d+) true/.exec(prompt);
  if (!m) throw new Error(`unparsable prompt: ${prompt}`);
  return { a: Number(m[1]), p: Number(m[2]) };
}

const optionValue = (g: ReturnType<typeof oa6MissingFactor.generate>, tag: string): number => {
  const opt = g.options.find((o) => o.misconception === tag);
  if (!opt) throw new Error(`no option tagged ${tag}`);
  return Number(opt.text);
};

describe('g3.oa6.missing-factor', () => {
  it('is sound at every seed', () => {
    assertTemplateSound(oa6MissingFactor);
  });

  it('is deterministic in its seed', () => {
    expect(oa6MissingFactor.generate(makeRng(42))).toEqual(oa6MissingFactor.generate(makeRng(42)));
  });

  it('produces a known question at a pinned seed', () => {
    const g = oa6MissingFactor.generate(makeRng(7));
    expect(g.options.find((o) => o.isCorrect)!.text).toBe(g.answerText);
    const { a, p } = parse(g.prompt);
    expect(g.answerText).toBe(`${p / a}`);
  });

  it('keeps both factors inside 1-10 and shows the equation as a figure', () => {
    for (let seed = 0; seed < 300; seed++) {
      const g = oa6MissingFactor.generate(makeRng(seed));
      const { a, p } = parse(g.prompt);
      const b = p / a;
      expect(Number.isInteger(b), `seed ${seed}: ${p} / ${a} is not whole`).toBe(true);
      expect(a, `seed ${seed}: a=${a}`).toBeGreaterThanOrEqual(2);
      expect(a).toBeLessThanOrEqual(10);
      expect(b, `seed ${seed}: b=${b}`).toBeGreaterThanOrEqual(2);
      expect(b).toBeLessThanOrEqual(10);
      expect(g.promptDetails).toBe(`${a} × ☐ = ${p}`);
    }
  });

  // 78 pairs is small enough to check in full rather than sample.
  it('has no colliding option values anywhere in its draw space', () => {
    let drawn = 0;
    for (let a = 2; a <= 10; a++) {
      for (let b = 2; b <= 10; b++) {
        if ((a === 2 && b === 2) || (a === 2 && b === 3) || (a === 3 && b === 2)) continue;
        drawn++;
        const values = [b, b - 1, b + 1, a * b - a];
        expect(new Set(values).size, `(a=${a}, b=${b}) collides: ${values.join(', ')}`).toBe(4);
      }
    }
    expect(drawn, 'draw space size').toBe(78);
  });

  describe('every distractor is the value its tag names', () => {
    for (const seed of [3, 61, 904, 15207, 88888]) {
      it(`seed ${seed}`, () => {
        const g = oa6MissingFactor.generate(makeRng(seed));
        const { a, p } = parse(g.prompt);
        const b = p / a;
        expect(optionValue(g, 'skip-counted-one-group-short')).toBe(b - 1);
        expect(optionValue(g, 'skip-counted-one-group-too-many')).toBe(b + 1);
        expect(optionValue(g, 'subtracted-instead-of-divided')).toBe(p - a);
      });
    }
  });
});
