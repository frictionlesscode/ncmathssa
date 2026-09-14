import { describe, it, expect } from 'vitest';
import { assertTemplateSound } from '../../../engine/templateTesting';
import { makeRng } from '../../../engine/rng';
import { oa3OneStepWordProblem } from './oa3-one-step-word-problem';

/** Reads the two numbers back out of the story, independently of the
 *  generator, so this test cannot inherit a bug from the code it checks. */
function parse(prompt: string): { k: number; m: number } {
  const m = /has (\d+) /.exec(prompt);
  const k = /(?:holds|seats) (\d+) /.exec(prompt);
  if (!m || !k) throw new Error(`unparsable prompt: ${prompt}`);
  return { k: Number(k[1]), m: Number(m[1]) };
}

const optionValue = (
  g: ReturnType<typeof oa3OneStepWordProblem.generate>,
  tag: string,
): number => {
  const opt = g.options.find((o) => o.misconception === tag);
  if (!opt) throw new Error(`no option tagged ${tag}`);
  return Number(opt.text.split(' ')[0]);
};

describe('g3.oa3.one-step-word-problem', () => {
  it('is sound at every seed', () => {
    assertTemplateSound(oa3OneStepWordProblem);
  });

  it('is deterministic in its seed', () => {
    expect(oa3OneStepWordProblem.generate(makeRng(42))).toEqual(
      oa3OneStepWordProblem.generate(makeRng(42)),
    );
  });

  it('produces a known question at a pinned seed', () => {
    const g = oa3OneStepWordProblem.generate(makeRng(7));
    expect(g.options.find((o) => o.isCorrect)!.text).toBe(g.answerText);
    const { k, m } = parse(g.prompt);
    expect(g.answerText.startsWith(`${k * m} `)).toBe(true);
  });

  it('stays a ONE-step problem with factors inside 1-10', () => {
    for (let seed = 0; seed < 300; seed++) {
      const g = oa3OneStepWordProblem.generate(makeRng(seed));
      const { k, m } = parse(g.prompt);
      expect(k, `seed ${seed}: k=${k}`).toBeGreaterThanOrEqual(2);
      expect(k).toBeLessThanOrEqual(10);
      expect(m, `seed ${seed}: m=${m}`).toBeGreaterThanOrEqual(2);
      expect(m).toBeLessThanOrEqual(10);
      expect(g.answerText).toBe(`${k * m} ${g.answerText.split(' ')[1]}`);
      // A one-step problem gives exactly two numbers and no figure.
      expect(g.promptDetails, `seed ${seed} has a figure`).toBeUndefined();
      expect((g.prompt.match(/\d+/g) ?? []).length, `seed ${seed}: numbers in prompt`).toBe(2);
    }
  });

  // The header's algebra reduces to two exclusions. 71 pairs is small enough
  // to check in full, so the property run is a regression guard, not the proof.
  it('has no colliding option values anywhere in its draw space', () => {
    let drawn = 0;
    for (let k = 2; k <= 10; k++) {
      for (let m = 2; m <= 10; m++) {
        if (k === m) continue;
        if (k === 2 && m === 4) continue;
        drawn++;
        const values = [k * m, k + m, Math.abs(k - m), (m - 1) * k];
        expect(new Set(values).size, `(k=${k}, m=${m}) collides: ${values.join(', ')}`).toBe(4);
      }
    }
    expect(drawn, 'draw space size').toBe(71);
  });

  describe('every distractor is the value its tag names', () => {
    for (const seed of [3, 61, 904, 15207, 88888]) {
      it(`seed ${seed}`, () => {
        const g = oa3OneStepWordProblem.generate(makeRng(seed));
        const { k, m } = parse(g.prompt);
        expect(optionValue(g, 'added-instead-of-multiplied')).toBe(k + m);
        expect(optionValue(g, 'subtracted-instead-of-multiplied')).toBe(Math.abs(k - m));
        expect(optionValue(g, 'skip-counted-one-group-short')).toBe((m - 1) * k);
      });
    }
  });
});
