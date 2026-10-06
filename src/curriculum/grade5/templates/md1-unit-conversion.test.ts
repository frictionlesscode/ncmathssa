import { describe, it, expect } from 'vitest';
import { makeRng } from '../../../engine/rng';
import { assertTemplateSound } from '../../../engine/templateTesting';
import { md1UnitConversion } from './md1-unit-conversion';

/** The conversion table, restated here so the test does not lean on the
 *  generator's own copy. */
const FACTORS = new Map<string, number>([
  ['yards->feet', 3],
  ['gallons->quarts', 4],
  ['quarts->cups', 4],
  ['feet->inches', 12],
  ['pounds->ounces', 16],
  ['meters->centimeters', 100],
  ['kilometers->meters', 1000],
  ['kilograms->grams', 1000],
  ['liters->milliliters', 1000],
]);

/** Exact text for `thousandths / 1000`, written independently of the
 *  generator's formatter. */
function fromThousandths(thousandths: number): string {
  if (!Number.isInteger(thousandths)) throw new Error(`not exact: ${thousandths}`);
  const whole = Math.floor(thousandths / 1000);
  const frac = String(thousandths % 1000).padStart(3, '0').replace(/0+$/, '');
  return frac.length === 0 ? `${whole}` : `${whole}.${frac}`;
}

function parse(details: string) {
  const m = details.match(/^([\d.]+) ([a-z]+) = \? ([a-z]+)$/);
  if (!m) throw new Error(`unparsable promptDetails: ${details}`);
  const [, qtyText, from, to] = m;
  const toSmall = FACTORS.has(`${from}->${to}`);
  const factor = toSmall ? FACTORS.get(`${from}->${to}`) : FACTORS.get(`${to}->${from}`);
  if (factor === undefined) throw new Error(`no factor for ${from} -> ${to}`);
  const [whole, frac = ''] = qtyText.split('.');
  const qtyThousandths = Number(whole) * 1000 + Number(frac.padEnd(3, '0') || '0');
  return { qtyThousandths, factor, toSmall, from, to };
}

const optionText = (g: ReturnType<typeof md1UnitConversion.generate>, tag: string): string => {
  const opt = g.options.find((o) => o.misconception === tag);
  if (!opt) throw new Error(`no option tagged ${tag}`);
  return opt.text;
};

describe('md1UnitConversion', () => {
  it('satisfies every template invariant across 300 seeds', () => {
    assertTemplateSound(md1UnitConversion);
  });

  it('is deterministic in its seed', () => {
    const a = md1UnitConversion.generate(makeRng(777));
    const b = md1UnitConversion.generate(makeRng(777));
    expect(a).toEqual(b);
  });

  it('converts between a real pair of units, in both directions', () => {
    // NC.5.MD.1 is within one measurement system, so the two units must be
    // a genuine pair from the table rather than an arbitrary combination.
    let seen = 0;
    for (let seed = 0; seed < 300; seed++) {
      const g = md1UnitConversion.generate(makeRng(seed));
      const { toSmall, from, to, factor } = parse(g.promptDetails ?? '');
      expect(from).not.toBe(to);
      expect(factor).toBeGreaterThan(1);
      seen |= toSmall ? 1 : 2;
      // Every option must be exactly representable, never a repeating or
      // drifting decimal.
      for (const o of g.options) expect(o.text).toMatch(/^\d+(\.\d{1,3})?$/);
    }
    expect(seen, 'both conversion directions should appear').toBe(3);
  });

  describe('every distractor value matches the error its tag names', () => {
    for (const seed of [8, 73, 1000, 4912, 55555]) {
      it(`seed ${seed}`, () => {
        const g = md1UnitConversion.generate(makeRng(seed));
        const { qtyThousandths, factor, toSmall } = parse(g.promptDetails ?? '');

        const answer = toSmall ? qtyThousandths * factor : qtyThousandths / factor;
        // Divided where multiplying was needed, or the reverse.
        const inverted = toSmall ? qtyThousandths / factor : qtyThousandths * factor;

        expect(g.answerText).toBe(fromThousandths(answer));
        expect(optionText(g, 'unit-conversion-inverted')).toBe(fromThousandths(inverted));
        // One place short of the shift the conversion needs.
        expect(optionText(g, 'decimal-point-misplaced')).toBe(fromThousandths(answer / 10));
        // One place too far.
        expect(optionText(g, 'wrong-power-of-ten')).toBe(fromThousandths(answer * 10));
      });
    }
  });

  it('md1 template: the explanation never says "same length" (the units include weight and capacity)', () => {
    for (let seed = 0; seed < 300; seed++) {
      const g = md1UnitConversion.generate(makeRng(seed));
      expect(g.explanation.stepByStep.join(' '), `seed ${seed}`).not.toMatch(/same length/);
    }
  });
});
