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

/** The whole option list, in order, as plain data a literal pin can compare
 *  against: label, text, whether it is the key, and its misconception tag. */
const shape = (g: { options: { label: string; text: string; isCorrect: boolean; misconception?: string }[] }) =>
  g.options.map((o) => [o.label, o.text, o.isCorrect, o.misconception ?? null]);

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

  // LITERAL pins. Every other test here reads the equation back out of the
  // generator's own prompt, so it would stay green through a change to the
  // seed -> pair mapping, to rng.pick ordering, or to the entire wording.
  // These two hold the exact bytes at two seeds. Taken from a real run, not
  // written out from what the code looks like it should produce.
  it('emits exactly this question at seed 7', () => {
    const g = oa6MissingFactor.generate(makeRng(7));
    expect(g.prompt).toBe('What number goes in the box to make the equation 2 × ☐ = 8 true?');
    expect(g.promptDetails).toBe('2 × ☐ = 8');
    expect(g.answerText).toBe('4');
    expect(shape(g)).toEqual([
      ['A', '6', false, 'subtracted-instead-of-divided'],
      ['B', '3', false, 'skip-counted-one-group-short'],
      ['C', '5', false, 'skip-counted-one-group-too-many'],
      ['D', '4', true, null],
    ]);
  });

  it('emits exactly this question at seed 123', () => {
    const g = oa6MissingFactor.generate(makeRng(123));
    expect(g.prompt).toBe('What number goes in the box to make the equation 9 × ☐ = 27 true?');
    expect(g.promptDetails).toBe('9 × ☐ = 27');
    expect(g.answerText).toBe('3');
    expect(shape(g)).toEqual([
      ['A', '4', false, 'skip-counted-one-group-too-many'],
      ['B', '18', false, 'subtracted-instead-of-divided'],
      ['C', '2', false, 'skip-counted-one-group-short'],
      ['D', '3', true, null],
    ]);
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
