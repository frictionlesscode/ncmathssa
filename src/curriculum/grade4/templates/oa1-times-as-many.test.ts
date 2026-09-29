import { describe, it, expect } from 'vitest';
import { assertTemplateSound } from '../../../engine/templateTesting';
import { makeRng } from '../../../engine/rng';
import { oa1TimesAsMany } from './oa1-times-as-many';

/** Pulls the two numbers out of the prompt, independently of the generator,
 *  so this test cannot inherit a bug from the code it is checking. */
function parse(prompt: string): { b: number; k: number } {
  const b = prompt.match(/ is (\d+) (?:feet|inches|meters|centimeters)/);
  const k = prompt.match(/ is (\d+) times as /);
  if (!b || !k) throw new Error(`unparsable prompt: ${prompt}`);
  return { b: Number(b[1]), k: Number(k[1]) };
}

const optionValue = (
  g: ReturnType<typeof oa1TimesAsMany.generate>,
  tag: string,
): number => {
  const opt = g.options.find((o) => o.misconception === tag);
  if (!opt) throw new Error(`no option tagged ${tag}`);
  return Number(opt.text.split(' ')[0]);
};

describe('g4.oa1.times-as-many', () => {
  it('is sound at every seed', () => {
    assertTemplateSound(oa1TimesAsMany);
  });

  it('is deterministic in its seed', () => {
    const a = oa1TimesAsMany.generate(makeRng(42));
    const b = oa1TimesAsMany.generate(makeRng(42));
    expect(a).toEqual(b);
  });

  it('produces a known question at a pinned seed', () => {
    const g = oa1TimesAsMany.generate(makeRng(7));
    expect(g.options.find((o) => o.isCorrect)!.text).toBe(g.answerText);
    expect(g.prompt.length).toBeGreaterThan(0);
  });

  it('always picks a length whose ones digit really does carry', () => {
    // The one admissibility rule the collision algebra demands: without a
    // carry, the added-carry-before-multiplying distractor equals the answer.
    for (let seed = 0; seed < 300; seed++) {
      const { b, k } = parse(oa1TimesAsMany.generate(makeRng(seed)).prompt);
      expect(b, `seed ${seed}: ${b} is not two-digit`).toBeGreaterThanOrEqual(10);
      expect(b).toBeLessThanOrEqual(99);
      expect(b % k, `seed ${seed}: ${b} is not divisible by ${k}`).toBe(0);
      expect((b % 10) * k, `seed ${seed}: no carry for ${b} × ${k}`).toBeGreaterThanOrEqual(10);
    }
  });

  describe('every distractor is the value its tag names', () => {
    for (const seed of [3, 61, 904, 15207, 88888]) {
      it(`seed ${seed}`, () => {
        const g = oa1TimesAsMany.generate(makeRng(seed));
        const { b, k } = parse(g.prompt);
        const t = Math.floor(b / 10);
        const u = b % 10;
        const carry = Math.floor((u * k) / 10);

        expect(g.answerText).toBe(`${b * k} ${g.answerText.split(' ')[1]}`);
        expect(optionValue(g, 'confused-times-with-more')).toBe(b + k);
        expect(optionValue(g, 'divided-instead-of-multiplied')).toBe(b / k);
        expect(optionValue(g, 'added-carry-before-multiplying')).toBe(
          10 * ((t + carry) * k) + ((u * k) % 10),
        );
      });
    }
  });
});
