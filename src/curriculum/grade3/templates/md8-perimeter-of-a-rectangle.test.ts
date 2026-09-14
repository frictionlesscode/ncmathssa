import { describe, it, expect } from 'vitest';
import { assertTemplateSound } from '../../../engine/templateTesting';
import { makeRng } from '../../../engine/rng';
import { md8PerimeterOfARectangle, SIDE_PAIRS } from './md8-perimeter-of-a-rectangle';

/** Reads the four labelled sides back out of the figure. */
function readFigure(details: string | undefined): { L: number; W: number; unit: string } {
  const lines = (details ?? '').split('\n');
  const values = lines.map((line) => {
    const m = /^(Top|Right|Bottom|Left) side: (\d+) (\w+)$/.exec(line);
    if (!m) throw new Error(`unparsable figure line: ${line}`);
    return { side: m[1], n: Number(m[2]), unit: m[3] };
  });
  if (values.length !== 4) throw new Error(`expected four sides: ${details}`);
  const units = new Set(values.map((v) => v.unit));
  if (units.size !== 1) throw new Error(`mixed units: ${details}`);
  const [top, right, bottom, left] = values;
  if (top.n !== bottom.n || right.n !== left.n) throw new Error(`not a rectangle: ${details}`);
  return { L: top.n, W: right.n, unit: top.unit };
}

const shape = (g: {
  options: { label: string; text: string; isCorrect: boolean; misconception?: string }[];
}) => g.options.map((o) => [o.label, o.text, o.isCorrect, o.misconception ?? null]);

const optionValue = (
  g: ReturnType<typeof md8PerimeterOfARectangle.generate>,
  tag: string,
): number => {
  const opt = g.options.find((o) => o.misconception === tag);
  if (!opt) throw new Error(`no option tagged ${tag}`);
  return Number(opt.text.split(' ')[0]);
};

const METRIC = /\b(gram|grams|kilogram|kilograms|kg|liter|liters|litre|litres|centimeter|centimeters|meter|meters|metre|metres|milliliter|milliliters|mL)\b/i;

describe('g3.md8.perimeter-of-a-rectangle', () => {
  it('is sound at every seed', () => {
    assertTemplateSound(md8PerimeterOfARectangle);
  });

  it('is deterministic in its seed', () => {
    expect(md8PerimeterOfARectangle.generate(makeRng(42))).toEqual(
      md8PerimeterOfARectangle.generate(makeRng(42)),
    );
  });

  // LITERAL pins, taken from a real run.
  it('emits exactly this question at seed 7', () => {
    const g = md8PerimeterOfARectangle.generate(makeRng(7));
    expect(g.prompt).toBe('The rectangle below has all four of its sides labeled. What is its perimeter?');
    expect(g.promptDetails).toBe(
      'Top side: 5 inches\nRight side: 2 inches\nBottom side: 5 inches\nLeft side: 2 inches',
    );
    expect(g.answerText).toBe('14 inches');
    expect(shape(g)).toEqual([
      ['A', '14 inches', true, null],
      ['B', '10 inches', false, 'used-area-formula-for-perimeter'],
      ['C', '7 inches', false, 'added-only-the-two-given-sides'],
      ['D', '12 inches', false, 'doubled-only-one-dimension'],
    ]);
    expect(g.explanation.stepByStep[3]).toBe('Step 4: The perimeter is 14 inches.');
  });

  it('emits exactly this question at seed 123', () => {
    const g = md8PerimeterOfARectangle.generate(makeRng(123));
    expect(g.promptDetails).toBe(
      'Top side: 7 yards\nRight side: 2 yards\nBottom side: 7 yards\nLeft side: 2 yards',
    );
    expect(g.answerText).toBe('18 yards');
    expect(shape(g)).toEqual([
      ['A', '16 yards', false, 'doubled-only-one-dimension'],
      ['B', '9 yards', false, 'added-only-the-two-given-sides'],
      ['C', '18 yards', true, null],
      ['D', '14 yards', false, 'used-area-formula-for-perimeter'],
    ]);
  });

  // The figure has to be answerable on its own, because a screen reader is all
  // some children have: every one of the four sides is labelled, in one
  // customary unit, and opposite sides agree.
  it('labels all four sides in one customary unit', () => {
    for (let seed = 0; seed < 600; seed++) {
      const g = md8PerimeterOfARectangle.generate(makeRng(seed));
      const { L, W, unit } = readFigure(g.promptDetails);
      expect(['inches', 'feet', 'yards']).toContain(unit);
      expect(METRIC.exec(`${g.prompt} ${g.promptDetails}`)?.[0], `seed ${seed}`).toBe(undefined);
      expect(L, `seed ${seed}: the long side is not longer`).toBeGreaterThan(W);
      expect(Number(g.answerText.split(' ')[0]), `seed ${seed}`).toBe(2 * (L + W));
      for (const o of g.options) expect(o.text).toMatch(new RegExp(`^\\d+ ${unit}$`));
    }
  });

  // The whole draw space, in both directions. The algebra predicts exactly one
  // collision, (6, 3), where 2(L+W) and L*W are both 18.
  it('excludes exactly the pair the algebra says it must', () => {
    const kept = new Set(SIDE_PAIRS.map(({ L, W }) => `${L}x${W}`));
    const excluded: string[] = [];
    for (let L = 3; L <= 12; L++) {
      for (let W = 2; W < L; W++) {
        const values = [2 * (L + W), L * W, L + W, 2 * L + W];
        if (new Set(values).size === 4) {
          expect(kept.has(`${L}x${W}`), `(${L}, ${W}) is legal but missing`).toBe(true);
        } else {
          excluded.push(`${L}x${W}`);
          expect(kept.has(`${L}x${W}`), `(${L}, ${W}) collides but is kept`).toBe(false);
        }
      }
    }
    expect(excluded).toEqual(['6x3']);
    expect(SIDE_PAIRS.length, 'draw space size').toBe(54);
  });

  describe('every distractor is the value its tag names', () => {
    for (const seed of [3, 61, 904, 15207, 88888]) {
      it(`seed ${seed}`, () => {
        const g = md8PerimeterOfARectangle.generate(makeRng(seed));
        const { L, W } = readFigure(g.promptDetails);
        expect(Number(g.answerText.split(' ')[0])).toBe(2 * (L + W));
        // Grade 3 is where area and perimeter first collide, so this one is
        // the exact area rather than merely a wrong number.
        expect(optionValue(g, 'used-area-formula-for-perimeter')).toBe(L * W);
        expect(optionValue(g, 'added-only-the-two-given-sides')).toBe(L + W);
        expect(optionValue(g, 'doubled-only-one-dimension')).toBe(2 * L + W);
      });
    }
  });
});
