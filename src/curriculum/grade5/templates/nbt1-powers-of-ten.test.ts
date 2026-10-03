import { describe, it, expect } from 'vitest';
import { makeRng } from '../../../engine/rng';
import { assertTemplateSound } from '../../../engine/templateTesting';
import { nbt1PowersOfTen } from './nbt1-powers-of-ten';

/** Independent decimal formatter, written from scratch here so this test
 *  cannot inherit a bug from the generator's own helper. */
function shift(digits: string, exponent: number): string {
  if (exponent >= 0) return digits + '0'.repeat(exponent);
  const places = -exponent;
  const padded = digits.length <= places ? '0'.repeat(places - digits.length + 1) + digits : digits;
  const cut = padded.length - places;
  return `${padded.slice(0, cut)}.${padded.slice(cut)}`;
}

/** NC.5.NBT.1 (NC-R4) names exactly these moves: multiply by 1,000, 100, 10,
 *  0.1 and 0.01, divide by 10 and 100. The value is how many places the
 *  digits' value moves (positive = larger). Restated here, not imported. */
const ALLOWED_MOVES = new Map<string, number>([
  ['× 1,000', 3],
  ['× 100', 2],
  ['× 10', 1],
  ['× 0.1', -1],
  ['× 0.01', -2],
  ['÷ 10', -1],
  ['÷ 100', -2],
]);

function parse(details: string) {
  const m = details.match(/^([\d.]+) ([×÷]) ([\d.,]+)$/);
  if (!m) throw new Error(`unparsable promptDetails: ${details}`);
  const [, base, op, label] = m;
  const digits = base.replace('.', '');
  const places = base.length - base.indexOf('.') - 1;
  const move = `${op} ${label}`;
  const k = ALLOWED_MOVES.get(move);
  if (k === undefined) throw new Error(`out-of-scope move "${move}" in ${details}`);
  return { digits, places, move, k };
}

const optionText = (g: ReturnType<typeof nbt1PowersOfTen.generate>, tag: string): string => {
  const opt = g.options.find((o) => o.misconception === tag);
  if (!opt) throw new Error(`no option tagged ${tag}`);
  return opt.text;
};

describe('nbt1PowersOfTen', () => {
  it('satisfies every template invariant across 500 seeds', () => {
    assertTemplateSound(nbt1PowersOfTen, { runs: 500 });
  });

  it('is deterministic in its seed', () => {
    const a = nbt1PowersOfTen.generate(makeRng(777));
    const b = nbt1PowersOfTen.generate(makeRng(777));
    expect(a).toEqual(b);
  });

  it('nbt1 template: NC-R4 only the seven NC moves, never 10^n, and every move is reached', () => {
    const seen = new Set<string>();
    for (let seed = 0; seed < 500; seed++) {
      const g = nbt1PowersOfTen.generate(makeRng(seed));
      expect(JSON.stringify(g), `seed ${seed}: exponent notation`).not.toContain('^');
      const m = (g.promptDetails ?? '').match(/^[\d.]+ ([×÷] [\d.,]+)$/);
      expect(m, `seed ${seed}: ${g.promptDetails}`).toBeTruthy();
      const move = m![1];
      expect(ALLOWED_MOVES.has(move), `seed ${seed}: "${move}" is outside NC.5.NBT.1`).toBe(true);
      seen.add(move);
    }
    expect([...seen].sort()).toEqual([...ALLOWED_MOVES.keys()].sort());
  });

  it('changes only place value: every option keeps the same significant digits', () => {
    // NC.5.NBT.1 is about the decimal point moving, not about the digits
    // changing. An option whose digits differ would be a different kind of
    // error and would let a student eliminate it without reasoning about
    // place value at all.
    for (let seed = 0; seed < 200; seed++) {
      const g = nbt1PowersOfTen.generate(makeRng(seed));
      const { digits } = parse(g.promptDetails ?? '');
      for (const o of g.options) {
        const bare = o.text.replace('.', '').replace(/^0+/, '').replace(/0+$/, '');
        expect(bare, `seed ${seed}: option ${o.text} against base digits ${digits}`).toBe(digits);
      }
      expect(new Set(g.options.map((o) => o.text)).size).toBe(4);
    }
  });

  it('the last step states the answer and the direction matches the size change', () => {
    for (let seed = 0; seed < 200; seed++) {
      const g = nbt1PowersOfTen.generate(makeRng(seed));
      const { k } = parse(g.promptDetails ?? '');
      const steps = g.explanation.stepByStep.join(' ');
      expect(steps, `seed ${seed}`).toContain(k > 0 ? 'makes the number larger' : 'makes the number smaller');
      expect(steps, `seed ${seed}`).toContain(k > 0 ? 'to the left' : 'to the right');
    }
  });

  describe('every distractor value matches the error its tag names', () => {
    for (const seed of [1, 17, 205, 4912, 99991]) {
      it(`seed ${seed}`, () => {
        const g = nbt1PowersOfTen.generate(makeRng(seed));
        const { digits, places, k } = parse(g.promptDetails ?? '');
        const s = Math.sign(k);

        // Answer: the digits shift k places (left when the number grows).
        expect(g.answerText).toBe(shift(digits, -places + k));
        // Shifted the same distance the other way.
        expect(optionText(g, 'place-value-shift-wrong-direction')).toBe(shift(digits, -places - k));
        // Right direction, one place short.
        expect(optionText(g, 'decimal-point-misplaced')).toBe(shift(digits, -places + k - s));
        // Right direction, one place too far.
        expect(optionText(g, 'wrong-power-of-ten')).toBe(shift(digits, -places + k + s));
      });
    }
  });
});
