import { describe, it, expect } from 'vitest';
import { assertTemplateSound } from '../../../engine/templateTesting';
import { makeRng } from '../../../engine/rng';
import { oa2EqualShares } from './oa2-equal-shares';

/** Reads the two given numbers back out of the prompt, independently of the
 *  generator, so this test cannot inherit a bug from the code it checks. */
function parse(prompt: string): { n: number; d: number } {
  const m = /^(\d+) \w+ are shared equally among (\d+) /.exec(prompt);
  if (!m) throw new Error(`unparsable prompt: ${prompt}`);
  return { n: Number(m[1]), d: Number(m[2]) };
}

const optionValue = (g: ReturnType<typeof oa2EqualShares.generate>, tag: string): number => {
  const opt = g.options.find((o) => o.misconception === tag);
  if (!opt) throw new Error(`no option tagged ${tag}`);
  return Number(opt.text.split(' ')[0]);
};

describe('g3.oa2.equal-shares', () => {
  it('is sound at every seed', () => {
    assertTemplateSound(oa2EqualShares);
  });

  it('is deterministic in its seed', () => {
    expect(oa2EqualShares.generate(makeRng(42))).toEqual(oa2EqualShares.generate(makeRng(42)));
  });

  it('produces a known question at a pinned seed', () => {
    const g = oa2EqualShares.generate(makeRng(7));
    expect(g.options.find((o) => o.isCorrect)!.text).toBe(g.answerText);
    const { n, d } = parse(g.prompt);
    expect(g.answerText.startsWith(`${n / d} `)).toBe(true);
  });

  // NC.3.OA.2 says "a one-digit divisor and a one-digit quotient" in so many
  // words. A 100 / 4 item is out of range even though it is easy.
  it('keeps the divisor and the quotient to one digit', () => {
    for (let seed = 0; seed < 300; seed++) {
      const g = oa2EqualShares.generate(makeRng(seed));
      const { n, d } = parse(g.prompt);
      const q = n / d;
      expect(Number.isInteger(q), `seed ${seed}: ${n} / ${d} is not whole`).toBe(true);
      expect(d, `seed ${seed}: divisor ${d}`).toBeGreaterThanOrEqual(2);
      expect(d).toBeLessThanOrEqual(9);
      expect(q, `seed ${seed}: quotient ${q}`).toBeGreaterThanOrEqual(3);
      expect(q).toBeLessThanOrEqual(9);
      // The figure has to show exactly the groups the prompt names.
      expect(g.promptDetails!.split('\n')[0]).toBe(`${n} ${g.answerText.split(' ')[1]} in all`);
      expect(g.promptDetails!.split('[').length - 1, `seed ${seed}: groups drawn`).toBe(d);
    }
  });

  // Ruling 12-3: no option may be a value a Grade 3 child cannot write.
  it('never prints a decimal or a negative option', () => {
    for (let seed = 0; seed < 300; seed++) {
      for (const o of oa2EqualShares.generate(makeRng(seed)).options) {
        expect(/^\d+ /.test(o.text), `seed ${seed}: option "${o.text}"`).toBe(true);
      }
    }
  });

  // The header's algebra reduces to two exclusions. The draw space is 42
  // pairs, so it is checked in FULL: a property run that never happens to draw
  // d = q - 1 proves nothing about it.
  it('has no colliding option values anywhere in its draw space', () => {
    let drawn = 0;
    for (let q = 3; q <= 9; q++) {
      for (let d = 2; d <= 9; d++) {
        if (d === q || d === q - 1) continue;
        drawn++;
        const values = [q, d * q - d, d, q - 1];
        expect(new Set(values).size, `(d=${d}, q=${q}) collides: ${values.join(', ')}`).toBe(4);
      }
    }
    expect(drawn, 'draw space size').toBe(42);
  });

  describe('every distractor is the value its tag names', () => {
    for (const seed of [3, 61, 904, 15207, 88888]) {
      it(`seed ${seed}`, () => {
        const g = oa2EqualShares.generate(makeRng(seed));
        const { n, d } = parse(g.prompt);
        expect(optionValue(g, 'subtracted-instead-of-divided')).toBe(n - d);
        expect(optionValue(g, 'answered-with-the-number-of-groups')).toBe(d);
        expect(optionValue(g, 'skip-counted-one-group-short')).toBe(n / d - 1);
      });
    }
  });
});
