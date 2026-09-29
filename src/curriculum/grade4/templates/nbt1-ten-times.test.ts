import { describe, it, expect } from 'vitest';
import { assertTemplateSound } from '../../../engine/templateTesting';
import { makeRng } from '../../../engine/rng';
import { nbt1TenTimes } from './nbt1-ten-times';

/** Independent parser, so this test cannot inherit a bug from the generator. */
function parse(prompt: string): { n: number; digit: number; lowPlace: string } {
  const m = prompt.match(
    /^In ([\d,]+), the digit (\d) is in the [a-z ]+ place and again in the ([a-z ]+) place\./,
  );
  if (!m) throw new Error(`unparsable prompt: ${prompt}`);
  return { n: Number(m[1].replace(/,/g, '')), digit: Number(m[2]), lowPlace: m[3] };
}

const PLACE_VALUE: Record<string, number> = { tens: 10, hundreds: 100 };

const bare = (s: string): number => Number(s.replace(/,/g, ''));

const taggedValue = (
  g: ReturnType<typeof nbt1TenTimes.generate>,
  tag: string,
): number => {
  const opt = g.options.find((o) => o.misconception === tag);
  if (!opt) throw new Error(`no option tagged ${tag}`);
  return bare(opt.text);
};

describe('g4.nbt1.ten-times', () => {
  it('is sound at every seed', () => {
    assertTemplateSound(nbt1TenTimes);
  });

  it('is deterministic in its seed', () => {
    expect(nbt1TenTimes.generate(makeRng(42))).toEqual(nbt1TenTimes.generate(makeRng(42)));
  });

  it('produces a known question at a pinned seed', () => {
    const g = nbt1TenTimes.generate(makeRng(11));
    expect(g.options.find((o) => o.isCorrect)!.text).toBe(g.answerText);
    expect(g.prompt.length).toBeGreaterThan(0);
  });

  it('stays inside the standard: whole numbers to 100,000, adjacent places only', () => {
    for (let seed = 0; seed < 300; seed++) {
      const g = nbt1TenTimes.generate(makeRng(seed));
      const { n, digit, lowPlace } = parse(g.prompt);
      expect(n, `seed ${seed}`).toBeLessThanOrEqual(100000);
      expect(n, `seed ${seed}`).toBeGreaterThanOrEqual(10000);
      expect(digit, `seed ${seed}`).toBeGreaterThanOrEqual(2);
      // The two places named are always neighbours, which is the only
      // relationship NC.4.NBT.1 covers.
      expect(['tens', 'hundreds'], `seed ${seed}`).toContain(lowPlace);
      // No value anywhere in the item may run past the standard's ceiling.
      for (const o of g.options) expect(bare(o.text), `seed ${seed}`).toBeLessThanOrEqual(100000);
    }
  });

  it('the numeral really carries that digit in both named places, and nowhere else', () => {
    for (let seed = 0; seed < 300; seed++) {
      const g = nbt1TenTimes.generate(makeRng(seed));
      const { n, digit, lowPlace } = parse(g.prompt);
      const lo = PLACE_VALUE[lowPlace];
      expect(Math.floor(n / lo) % 10, `seed ${seed}`).toBe(digit);
      expect(Math.floor(n / (lo * 10)) % 10, `seed ${seed}`).toBe(digit);
      const occurrences = [...`${n}`].filter((c) => c === `${digit}`).length;
      expect(occurrences, `seed ${seed}: digit appears in a third place`).toBe(2);
    }
  });

  describe('every distractor is the value its tag names', () => {
    for (const seed of [3, 61, 904, 15207, 88888]) {
      it(`seed ${seed}`, () => {
        const g = nbt1TenTimes.generate(makeRng(seed));
        const { digit, lowPlace } = parse(g.prompt);
        const lo = PLACE_VALUE[lowPlace];

        expect(bare(g.answerText)).toBe(digit * lo);
        // The other of the two places: ten times the answer.
        expect(taggedValue(g, 'place-value-shift-wrong-direction')).toBe(digit * lo * 10);
        // The shift counted twice.
        expect(taggedValue(g, 'wrong-power-of-ten')).toBe(digit * lo * 100);
        // The digit, not what it is worth.
        expect(taggedValue(g, 'wrote-the-digit-not-its-value')).toBe(digit);
      });
    }
  });

  it('sweeps its whole parameter space without a collision', () => {
    // The option values are d * 10^lo, d * 10^(lo+1), d * 10^(lo+2) and d, so
    // they depend on (d, lo) alone; the numeral's other three digits appear in
    // the prompt only. That makes 8 x 2 = 16 combinations the entire space.
    let checked = 0;
    for (let d = 2; d <= 9; d++) {
      for (let lo = 1; lo <= 2; lo++) {
        const values = [d * 10 ** lo, d * 10 ** (lo + 1), d * 10 ** (lo + 2), d];
        expect(new Set(values).size, `d=${d} lo=${lo}`).toBe(4);
        checked++;
      }
    }
    expect(checked).toBe(16);
  });
});
