import { describe, it, expect } from 'vitest';
import { assertTemplateSound } from '../../../engine/templateTesting';
import { makeRng } from '../../../engine/rng';
import { md7AreaByMultiplyingSideLengths, RECTANGLES } from './md7-area-by-multiplying-side-lengths';

/** Reads the two side lengths and the unit back out of the prompt. */
function parse(prompt: string): { L: number; W: number; unit: string } {
  const m = /is a rectangle (\d+) (\w+) long and (\d+) (\w+) wide\./.exec(prompt);
  if (!m) throw new Error(`unparsable prompt: ${prompt}`);
  if (m[2] !== m[4]) throw new Error(`two different units in: ${prompt}`);
  return { L: Number(m[1]), W: Number(m[3]), unit: m[2] };
}

const shape = (g: {
  options: { label: string; text: string; isCorrect: boolean; misconception?: string }[];
}) => g.options.map((o) => [o.label, o.text, o.isCorrect, o.misconception ?? null]);

const optionValue = (
  g: ReturnType<typeof md7AreaByMultiplyingSideLengths.generate>,
  tag: string,
): number => {
  const opt = g.options.find((o) => o.misconception === tag);
  if (!opt) throw new Error(`no option tagged ${tag}`);
  return Number(opt.text.split(' ')[0]);
};

/** RULING 14-1: Grade 3 measurement is customary. */
const METRIC = /\b(gram|grams|kilogram|kilograms|kg|liter|liters|litre|litres|centimeter|centimeters|meter|meters|metre|metres|milliliter|milliliters|mL)\b/i;
const CUSTOMARY = new Set(['inches', 'feet', 'yards']);

describe('g3.md7.area-by-multiplying-side-lengths', () => {
  it('is sound at every seed', () => {
    assertTemplateSound(md7AreaByMultiplyingSideLengths);
  });

  it('is deterministic in its seed', () => {
    expect(md7AreaByMultiplyingSideLengths.generate(makeRng(42))).toEqual(
      md7AreaByMultiplyingSideLengths.generate(makeRng(42)),
    );
  });

  // LITERAL pins, taken from a real run.
  it('emits exactly this question at seed 7', () => {
    const g = md7AreaByMultiplyingSideLengths.generate(makeRng(7));
    expect(g.prompt).toBe(
      "Ana's vegetable garden is a rectangle 7 yards long and 6 yards wide. What is its area?",
    );
    expect(g.promptDetails).toBe(undefined);
    expect(g.answerText).toBe('42 square yards');
    expect(shape(g)).toEqual([
      ['A', '36 square yards', false, 'skip-counted-one-group-short'],
      ['B', '42 square yards', true, null],
      ['C', '13 square yards', false, 'added-only-the-two-given-sides'],
      ['D', '26 square yards', false, 'used-perimeter-formula'],
    ]);
    expect(g.explanation.stepByStep[3]).toBe('Step 4: 7 × 6 = 42, so the area is 42 square yards.');
  });

  it('emits exactly this question at seed 123', () => {
    const g = md7AreaByMultiplyingSideLengths.generate(makeRng(123));
    expect(g.prompt).toBe(
      "Sofia's sandbox is a rectangle 3 feet long and 8 feet wide. What is its area?",
    );
    expect(g.answerText).toBe('24 square feet');
    expect(shape(g)).toEqual([
      ['A', '24 square feet', true, null],
      ['B', '16 square feet', false, 'skip-counted-one-group-short'],
      ['C', '22 square feet', false, 'used-perimeter-formula'],
      ['D', '11 square feet', false, 'added-only-the-two-given-sides'],
    ]);
  });

  it('never prints a metric unit and always labels the area in square units', () => {
    for (let seed = 0; seed < 600; seed++) {
      const g = md7AreaByMultiplyingSideLengths.generate(makeRng(seed));
      const blob = [
        g.prompt,
        ...g.options.map((o) => o.text),
        ...g.explanation.stepByStep,
        g.explanation.conceptSummary,
        g.explanation.commonMisconception ?? '',
      ].join(' ');
      expect(METRIC.exec(blob)?.[0], `seed ${seed}`).toBe(undefined);
      const { unit } = parse(g.prompt);
      expect(CUSTOMARY.has(unit), `seed ${seed}: ${unit}`).toBe(true);
      for (const o of g.options) {
        expect(o.text, `seed ${seed}`).toMatch(new RegExp(`^\\d+ square ${unit}$`));
      }
    }
  });

  // Ruling 14-5's other half. This generator must carry its two side lengths
  // as NUMBERS and no tiles, so that multiplying them is the skill; the tiling
  // generator carries tiles and no numbers. See
  // ./md5-tile-and-count-unit-squares.test.ts for the disjointness sweep.
  it('always names both side lengths and never draws a figure', () => {
    for (let seed = 0; seed < 600; seed++) {
      const g = md7AreaByMultiplyingSideLengths.generate(makeRng(seed));
      const { L, W } = parse(g.prompt);
      expect(g.promptDetails, `seed ${seed} drew a figure`).toBe(undefined);
      expect(L, `seed ${seed}: L = W makes a square, not a rectangle`).not.toBe(W);
      expect(Number(g.answerText.split(' ')[0])).toBe(L * W);
    }
  });

  // The whole 8 x 8 space, in both directions.
  it('excludes exactly the pairs the algebra says it must', () => {
    const kept = new Set(RECTANGLES.map(({ L, W }) => `${L}x${W}`));
    const excluded: string[] = [];
    for (let L = 2; L <= 9; L++) {
      for (let W = 2; W <= 9; W++) {
        if (L === W) continue;
        const values = [L * W, L + W, 2 * (L + W), (L - 1) * W];
        if (new Set(values).size === 4) {
          expect(kept.has(`${L}x${W}`), `(${L}, ${W}) is legal but missing`).toBe(true);
        } else {
          excluded.push(`${L}x${W}`);
          expect(kept.has(`${L}x${W}`), `(${L}, ${W}) collides but is kept`).toBe(false);
        }
      }
    }
    expect(excluded.sort()).toEqual(['3x6', '4x2', '4x8', '6x3', '6x4', '9x3']);
    expect(RECTANGLES.length, 'draw space size').toBe(8 * 8 - 8 - 6);
  });

  describe('every distractor is the value its tag names', () => {
    for (const seed of [3, 61, 904, 15207, 88888]) {
      it(`seed ${seed}`, () => {
        const g = md7AreaByMultiplyingSideLengths.generate(makeRng(seed));
        const { L, W } = parse(g.prompt);
        expect(Number(g.answerText.split(' ')[0])).toBe(L * W);
        expect(optionValue(g, 'added-only-the-two-given-sides')).toBe(L + W);
        expect(optionValue(g, 'used-perimeter-formula')).toBe(2 * (L + W));
        expect(optionValue(g, 'skip-counted-one-group-short')).toBe((L - 1) * W);
      });
    }
  });
});
