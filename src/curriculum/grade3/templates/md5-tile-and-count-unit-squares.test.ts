import { describe, it, expect } from 'vitest';
import { assertTemplateSound } from '../../../engine/templateTesting';
import { makeRng } from '../../../engine/rng';
import { md5TileAndCountUnitSquares, TILINGS } from './md5-tile-and-count-unit-squares';
import { md7AreaByMultiplyingSideLengths } from './md7-area-by-multiplying-side-lengths';

/** Reads the figure back: how many rows, and how many tiles in each. */
function readFigure(details: string | undefined): { r: number; c: number } {
  const rows = (details ?? '').split('\n');
  const widths = new Set(rows.map((row) => row.split(' ').length));
  if (widths.size !== 1) throw new Error(`ragged figure: ${details}`);
  return { r: rows.length, c: [...widths][0] };
}

const shape = (g: {
  options: { label: string; text: string; isCorrect: boolean; misconception?: string }[];
}) => g.options.map((o) => [o.label, o.text, o.isCorrect, o.misconception ?? null]);

const optionValue = (
  g: ReturnType<typeof md5TileAndCountUnitSquares.generate>,
  tag: string,
): number => {
  const opt = g.options.find((o) => o.misconception === tag);
  if (!opt) throw new Error(`no option tagged ${tag}`);
  return Number(opt.text.split(' ')[0]);
};

describe('g3.md5.tile-and-count-unit-squares', () => {
  it('is sound at every seed', () => {
    assertTemplateSound(md5TileAndCountUnitSquares);
  });

  it('is deterministic in its seed', () => {
    expect(md5TileAndCountUnitSquares.generate(makeRng(42))).toEqual(
      md5TileAndCountUnitSquares.generate(makeRng(42)),
    );
  });

  // LITERAL pins, taken from a real run.
  it('emits exactly this question at seed 7', () => {
    const g = md5TileAndCountUnitSquares.generate(makeRng(7));
    expect(g.prompt).toBe(
      'The rectangle below is covered with unit squares that do not overlap. How many unit squares cover it?',
    );
    expect(g.promptDetails).toBe('[] [] []\n[] [] []');
    expect(g.answerText).toBe('6 unit squares');
    expect(shape(g)).toEqual([
      ['A', '10 unit squares', false, 'used-perimeter-formula'],
      ['B', '5 unit squares', false, 'added-instead-of-multiplied'],
      ['C', '3 unit squares', false, 'counted-only-one-group'],
      ['D', '6 unit squares', true, null],
    ]);
    expect(g.explanation.stepByStep[3]).toBe(
      'Step 4: Counting every row, 2 rows of 3 is 6, so 6 unit squares cover the rectangle.',
    );
  });

  it('emits exactly this question at seed 123', () => {
    const g = md5TileAndCountUnitSquares.generate(makeRng(123));
    expect(g.promptDetails).toBe(
      '[] [] [] [] [] []\n[] [] [] [] [] []\n[] [] [] [] [] []\n[] [] [] [] [] []\n[] [] [] [] [] []\n[] [] [] [] [] []\n[] [] [] [] [] []',
    );
    expect(g.answerText).toBe('42 unit squares');
    expect(shape(g)).toEqual([
      ['A', '6 unit squares', false, 'counted-only-one-group'],
      ['B', '26 unit squares', false, 'used-perimeter-formula'],
      ['C', '13 unit squares', false, 'added-instead-of-multiplied'],
      ['D', '42 unit squares', true, null],
    ]);
  });

  // RULING 14-5, verified rather than asserted in a docstring. NC.3.MD.5 is
  // tile-and-COUNT; NC.3.MD.7 is area by MULTIPLYING side lengths. The
  // separation here is that this generator's question carries no numbers at
  // all - the tiles are the only data, so counting them is the only route to
  // the answer, and a child who can multiply but cannot count unit squares
  // gets nothing for free.
  it('puts no number in its question at all', () => {
    for (let seed = 0; seed < 600; seed++) {
      const g = md5TileAndCountUnitSquares.generate(makeRng(seed));
      expect(/\d/.test(g.prompt), `seed ${seed}: "${g.prompt}" carries a number`).toBe(false);
      expect(/\d/.test(g.promptDetails ?? ''), `seed ${seed}: figure carries a number`).toBe(false);
      expect(/[×x*]/.test(g.prompt), `seed ${seed}: prompt shows a multiplication`).toBe(false);
    }
  });

  // The same ruling from the other side: the two generators cannot emit the
  // same question, because neither one contains the other's data. Checked as a
  // sweep here as well as in ./index.test.ts, because this is the pair the
  // ruling is about.
  it('can never emit the NC.3.MD.7 generator question', () => {
    const tiling = new Set<string>();
    for (let seed = 0; seed < 600; seed++) {
      const g = md5TileAndCountUnitSquares.generate(makeRng(seed));
      tiling.add(`${g.prompt}\n${g.promptDetails ?? ''}`);
    }
    for (let seed = 0; seed < 600; seed++) {
      const g = md7AreaByMultiplyingSideLengths.generate(makeRng(seed));
      expect(
        tiling.has(`${g.prompt}\n${g.promptDetails ?? ''}`),
        `NC.3.MD.7 @ seed ${seed} reproduces a tiling question`,
      ).toBe(false);
      // And the converse of the check above: MD.7 always names its side
      // lengths as numerals and never draws a tile.
      expect(/\d+ \w+ long and \d+ \w+ wide/.test(g.prompt)).toBe(true);
      expect(g.promptDetails).toBe(undefined);
    }
  });

  it('draws exactly the rectangle the answer counts', () => {
    for (let seed = 0; seed < 400; seed++) {
      const g = md5TileAndCountUnitSquares.generate(makeRng(seed));
      const { r, c } = readFigure(g.promptDetails);
      expect(Number(g.answerText.split(' ')[0]), `seed ${seed}`).toBe(r * c);
      expect((g.promptDetails ?? '').replace(/[[\] \n]/g, ''), `seed ${seed}`).toBe('');
      expect(r).toBeGreaterThanOrEqual(2);
      expect(r).toBeLessThanOrEqual(8);
      expect(c).toBeGreaterThanOrEqual(2);
      expect(c).toBeLessThanOrEqual(8);
    }
  });

  // The whole 7 x 7 space, and the exclusions in both directions: the pairs
  // left out must be exactly the four the file comment's algebra names, and
  // every other pair must really be present.
  it('excludes exactly the four pairs the algebra says it must', () => {
    const kept = new Set(TILINGS.map(({ r, c }) => `${r}x${c}`));
    const excluded: string[] = [];
    for (let r = 2; r <= 8; r++) {
      for (let c = 2; c <= 8; c++) {
        const values = [r * c, r + c, c, 2 * (r + c)];
        if (new Set(values).size === 4) {
          expect(kept.has(`${r}x${c}`), `(${r}, ${c}) is legal but missing`).toBe(true);
        } else {
          excluded.push(`${r}x${c}`);
          expect(kept.has(`${r}x${c}`), `(${r}, ${c}) collides but is kept`).toBe(false);
        }
      }
    }
    expect(excluded.sort()).toEqual(['2x2', '3x6', '4x4', '6x3']);
    expect(TILINGS.length, 'draw space size').toBe(49 - 4);
  });

  describe('every distractor is the value its tag names', () => {
    for (const seed of [3, 61, 904, 15207, 88888]) {
      it(`seed ${seed}`, () => {
        const g = md5TileAndCountUnitSquares.generate(makeRng(seed));
        const { r, c } = readFigure(g.promptDetails);
        expect(Number(g.answerText.split(' ')[0])).toBe(r * c);
        expect(optionValue(g, 'added-instead-of-multiplied')).toBe(r + c);
        expect(optionValue(g, 'counted-only-one-group')).toBe(c);
        expect(optionValue(g, 'used-perimeter-formula')).toBe(2 * (r + c));
      });
    }
  });
});
