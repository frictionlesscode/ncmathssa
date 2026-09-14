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

/** The whole option list, in order, as plain data a literal pin can compare
 *  against: label, text, whether it is the key, and its misconception tag. */
const shape = (g: { options: { label: string; text: string; isCorrect: boolean; misconception?: string }[] }) =>
  g.options.map((o) => [o.label, o.text, o.isCorrect, o.misconception ?? null]);

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

  // LITERAL pins, not self-consistency checks. Every other test in this file
  // reads the numbers back out of the generator's own output, so a change to
  // the seed -> pair mapping, to CONTEXTS, to rng.pick ordering, or to the
  // whole wording of the question would leave them all green. These two hold
  // the exact bytes at two seeds, so any of those changes goes red and has to
  // be looked at on purpose. The strings were taken from a real run, not
  // written out from what the code looks like it should produce.
  it('emits exactly this question at seed 7', () => {
    const g = oa1EqualGroupsArray.generate(makeRng(7));
    expect(g.prompt).toBe(
      'The stickers below are arranged in equal rows. How many stickers are there in all?',
    );
    expect(g.promptDetails).toBe('★ ★ ★ ★ ★ ★ ★\n★ ★ ★ ★ ★ ★ ★\n★ ★ ★ ★ ★ ★ ★');
    expect(g.answerText).toBe('21 stickers');
    expect(shape(g)).toEqual([
      ['A', '21 stickers', true, null],
      ['B', '10 stickers', false, 'added-instead-of-multiplied'],
      ['C', '14 stickers', false, 'skip-counted-one-group-short'],
      ['D', '7 stickers', false, 'counted-only-one-group'],
    ]);
  });

  it('emits exactly this question at seed 123', () => {
    const g = oa1EqualGroupsArray.generate(makeRng(123));
    expect(g.prompt).toBe(
      'The tiles below are arranged in equal rows. How many tiles are there in all?',
    );
    expect(g.promptDetails).toBe(
      '▲ ▲ ▲ ▲ ▲ ▲ ▲\n▲ ▲ ▲ ▲ ▲ ▲ ▲\n▲ ▲ ▲ ▲ ▲ ▲ ▲\n▲ ▲ ▲ ▲ ▲ ▲ ▲',
    );
    expect(g.answerText).toBe('28 tiles');
    expect(shape(g)).toEqual([
      ['A', '7 tiles', false, 'counted-only-one-group'],
      ['B', '21 tiles', false, 'skip-counted-one-group-short'],
      ['C', '28 tiles', true, null],
      ['D', '11 tiles', false, 'added-instead-of-multiplied'],
    ]);
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
