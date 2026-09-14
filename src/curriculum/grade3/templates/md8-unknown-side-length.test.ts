import { describe, it, expect } from 'vitest';
import { assertTemplateSound } from '../../../engine/templateTesting';
import { makeRng } from '../../../engine/rng';
import { METRIC_UNIT } from '../metricGuard';
import { md8UnknownSideLength, UNKNOWN_SIDE_CASES } from './md8-unknown-side-length';
import { md8PerimeterOfARectangle } from './md8-perimeter-of-a-rectangle';

/** Reads the perimeter and the given side back out of the prompt. */
function parse(prompt: string): { P: number; L: number; unit: string } {
  const m = /perimeter of (\d+) (\w+)\. Its long side is (\d+) (\w+)\./.exec(prompt);
  if (!m) throw new Error(`unparsable prompt: ${prompt}`);
  if (m[2] !== m[4]) throw new Error(`two different units in: ${prompt}`);
  return { P: Number(m[1]), L: Number(m[3]), unit: m[2] };
}

const shape = (g: {
  options: { label: string; text: string; isCorrect: boolean; misconception?: string }[];
}) => g.options.map((o) => [o.label, o.text, o.isCorrect, o.misconception ?? null]);

const optionValue = (
  g: ReturnType<typeof md8UnknownSideLength.generate>,
  tag: string,
): number => {
  const opt = g.options.find((o) => o.misconception === tag);
  if (!opt) throw new Error(`no option tagged ${tag}`);
  return Number(opt.text.split(' ')[0]);
};


describe('g3.md8.unknown-side-length', () => {
  it('is sound at every seed', () => {
    assertTemplateSound(md8UnknownSideLength);
  });

  it('is deterministic in its seed', () => {
    expect(md8UnknownSideLength.generate(makeRng(42))).toEqual(
      md8UnknownSideLength.generate(makeRng(42)),
    );
  });

  // LITERAL pins, taken from a real run.
  it('emits exactly this question at seed 7', () => {
    const g = md8UnknownSideLength.generate(makeRng(7));
    expect(g.prompt).toBe(
      'A rectangle has a perimeter of 18 inches. Its long side is 5 inches. How long is its short side?',
    );
    expect(g.promptDetails).toBe(undefined);
    expect(g.answerText).toBe('4 inches');
    expect(shape(g)).toEqual([
      ['A', '4 inches', true, null],
      ['B', '9 inches', false, 'used-half-the-perimeter-as-each-side'],
      ['C', '8 inches', false, 'forgot-the-final-step'],
      ['D', '13 inches', false, 'subtracted-one-side-from-the-whole-perimeter'],
    ]);
    expect(g.explanation.stepByStep[3]).toBe(
      'Step 4: One short side is half of that: 8 ÷ 2 = 4, so the short side is 4 inches.',
    );
  });

  it('emits exactly this question at seed 123', () => {
    const g = md8UnknownSideLength.generate(makeRng(123));
    expect(g.prompt).toBe(
      'A rectangle has a perimeter of 26 yards. Its long side is 7 yards. How long is its short side?',
    );
    expect(g.answerText).toBe('6 yards');
    expect(shape(g)).toEqual([
      ['A', '19 yards', false, 'subtracted-one-side-from-the-whole-perimeter'],
      ['B', '12 yards', false, 'forgot-the-final-step'],
      ['C', '6 yards', true, null],
      ['D', '13 yards', false, 'used-half-the-perimeter-as-each-side'],
    ]);
  });

  // The perimeter handed to the child must belong to a real rectangle whose
  // long side really is the one named, or the question has no answer.
  it('always states a perimeter a real rectangle has', () => {
    for (let seed = 0; seed < 600; seed++) {
      const g = md8UnknownSideLength.generate(makeRng(seed));
      const { P, L, unit } = parse(g.prompt);
      expect(['inches', 'feet', 'yards']).toContain(unit);
      expect(METRIC_UNIT.exec(g.prompt)?.[0], `seed ${seed}`).toBe(undefined);
      expect(P % 2, `seed ${seed}: ${P} is not twice a whole half-perimeter`).toBe(0);
      const W = P / 2 - L;
      expect(W, `seed ${seed}: short side ${W} is not shorter than ${L}`).toBeLessThan(L);
      expect(W, `seed ${seed}: short side ${W} is not a real length`).toBeGreaterThanOrEqual(2);
      expect(Number(g.answerText.split(' ')[0]), `seed ${seed}`).toBe(W);
      for (const o of g.options) expect(o.text).toMatch(new RegExp(`^\\d+ ${unit}$`));
    }
  });

  // RULING 14-6: this and ./md8-perimeter-of-a-rectangle.ts are two templates
  // because they are two skills, and a review key is seedless. Neither may be
  // able to emit the other's question.
  it('can never emit the forwards perimeter question', () => {
    const forwards = new Set<string>();
    for (let seed = 0; seed < 600; seed++) {
      const g = md8PerimeterOfARectangle.generate(makeRng(seed));
      forwards.add(`${g.prompt}\n${g.promptDetails ?? ''}`);
    }
    for (let seed = 0; seed < 600; seed++) {
      const g = md8UnknownSideLength.generate(makeRng(seed));
      expect(forwards.has(`${g.prompt}\n${g.promptDetails ?? ''}`), `seed ${seed}`).toBe(false);
    }
  });

  // The whole draw space. The algebra in the file comment says nothing
  // collides anywhere, so nothing may be missing from the list either.
  it('keeps its whole draw space, because nothing in it collides', () => {
    const kept = new Set(UNKNOWN_SIDE_CASES.map(({ L, W }) => `${L}x${W}`));
    let expected = 0;
    for (let L = 4; L <= 14; L++) {
      for (let W = 2; W < L; W++) {
        const P = 2 * (L + W);
        const values = [W, P / 2, P - 2 * L, P - L];
        expect(new Set(values).size, `(${L}, ${W}) collides: ${values.join(', ')}`).toBe(4);
        expect(Math.min(...values), `(${L}, ${W}) has a non-positive option`).toBeGreaterThan(0);
        expect(kept.has(`${L}x${W}`), `(${L}, ${W}) is legal but missing`).toBe(true);
        expected++;
      }
    }
    expect(UNKNOWN_SIDE_CASES.length, 'draw space size').toBe(expected);
    expect(expected).toBe(77);
  });

  describe('every distractor is the value its tag names', () => {
    for (const seed of [3, 61, 904, 15207, 88888]) {
      it(`seed ${seed}`, () => {
        const g = md8UnknownSideLength.generate(makeRng(seed));
        const { P, L } = parse(g.prompt);
        expect(Number(g.answerText.split(' ')[0])).toBe(P / 2 - L);
        expect(optionValue(g, 'used-half-the-perimeter-as-each-side')).toBe(P / 2);
        expect(optionValue(g, 'forgot-the-final-step')).toBe(P - 2 * L);
        expect(optionValue(g, 'subtracted-one-side-from-the-whole-perimeter')).toBe(P - L);
      });
    }
  });
});
