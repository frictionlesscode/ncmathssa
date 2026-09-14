import { describe, it, expect } from 'vitest';
import { assertTemplateSound } from '../../../engine/templateTesting';
import { makeRng } from '../../../engine/rng';
import { oa1EqualGroupsArray } from './oa1-equal-groups-array';

/** Reads the array back out of the FIGURE, not out of the generator, so this
 *  test cannot inherit a bug from the code it is checking. */
function readFigure(details: string): { r: number; c: number } {
  const lines = details.split('\n');
  const widths = new Set(lines.map((l) => l.split(' ').length));
  expect(widths.size, `rows are not all the same length: ${details}`).toBe(1);
  return { r: lines.length, c: [...widths][0] };
}

const optionValue = (
  g: ReturnType<typeof oa1EqualGroupsArray.generate>,
  tag: string,
): number => {
  const opt = g.options.find((o) => o.misconception === tag);
  if (!opt) throw new Error(`no option tagged ${tag}`);
  return Number(opt.text.split(' ')[0]);
};

describe('g3.oa1.equal-groups-array', () => {
  it('is sound at every seed', () => {
    assertTemplateSound(oa1EqualGroupsArray);
  });

  it('is deterministic in its seed', () => {
    expect(oa1EqualGroupsArray.generate(makeRng(42))).toEqual(
      oa1EqualGroupsArray.generate(makeRng(42)),
    );
  });

  it('produces a known question at a pinned seed', () => {
    const g = oa1EqualGroupsArray.generate(makeRng(7));
    expect(g.options.find((o) => o.isCorrect)!.text).toBe(g.answerText);
    const { r, c } = readFigure(g.promptDetails!);
    expect(g.answerText.startsWith(`${r * c} `)).toBe(true);
  });

  it('draws the picture the prompt describes, inside the standard 1-10 range', () => {
    for (let seed = 0; seed < 300; seed++) {
      const g = oa1EqualGroupsArray.generate(makeRng(seed));
      const { r, c } = readFigure(g.promptDetails!);
      expect(r, `seed ${seed}: ${r} rows`).toBeGreaterThanOrEqual(3);
      expect(r).toBeLessThanOrEqual(10);
      expect(c, `seed ${seed}: ${c} per row`).toBeGreaterThanOrEqual(2);
      expect(c).toBeLessThanOrEqual(10);
      expect(g.answerText).toBe(`${r * c} ${g.answerText.split(' ')[1]}`);
    }
  });

  // The collision algebra in the file header reduces to two excluded pairs.
  // The draw space is 70 pairs, so it is checked in FULL rather than sampled:
  // a property run that never happens to draw (3, 3) proves nothing about it.
  it('has no colliding option values anywhere in its draw space', () => {
    for (let r = 3; r <= 10; r++) {
      for (let c = 2; c <= 10; c++) {
        if ((r === 3 && c === 3) || (r === 4 && c === 2)) continue;
        const values = [r * c, r + c, (r - 1) * c, c];
        expect(new Set(values).size, `(${r}, ${c}) collides: ${values.join(', ')}`).toBe(4);
      }
    }
  });

  it('never draws an excluded pair', () => {
    for (let seed = 0; seed < 1000; seed++) {
      const { r, c } = readFigure(oa1EqualGroupsArray.generate(makeRng(seed)).promptDetails!);
      expect(`${r},${c}`, `seed ${seed} drew an excluded pair`).not.toBe('3,3');
      expect(`${r},${c}`).not.toBe('4,2');
    }
  });

  describe('every distractor is the value its tag names', () => {
    for (const seed of [3, 61, 904, 15207, 88888]) {
      it(`seed ${seed}`, () => {
        const g = oa1EqualGroupsArray.generate(makeRng(seed));
        const { r, c } = readFigure(g.promptDetails!);
        expect(optionValue(g, 'added-instead-of-multiplied')).toBe(r + c);
        expect(optionValue(g, 'skip-counted-one-group-short')).toBe((r - 1) * c);
        expect(optionValue(g, 'counted-only-one-group')).toBe(c);
      });
    }
  });
});
