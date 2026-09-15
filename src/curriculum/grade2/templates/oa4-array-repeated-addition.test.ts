import { describe, it, expect } from 'vitest';
import { assertTemplateSound } from '../../../engine/templateTesting';
import { makeRng } from '../../../engine/rng';
import { oa4ArrayRepeatedAddition } from './oa4-array-repeated-addition';

function readFigure(details: string): { r: number; c: number } {
  const lines = details.split('\n');
  const widths = new Set(lines.map((l) => l.split(' ').length));
  expect(widths.size, `rows are not all the same length: ${details}`).toBe(1);
  return { r: lines.length, c: [...widths][0] };
}

describe('g2.oa4.array-repeated-addition', () => {
  it('is sound at every seed', () => {
    assertTemplateSound(oa4ArrayRepeatedAddition);
  });

  it('is deterministic in its seed', () => {
    expect(oa4ArrayRepeatedAddition.generate(makeRng(42))).toEqual(
      oa4ArrayRepeatedAddition.generate(makeRng(42)),
    );
  });

  it('emits exactly this question at seed 7', () => {
    const g = oa4ArrayRepeatedAddition.generate(makeRng(7));
    expect(g.prompt).toBe(
      'The tiles below are arranged in equal rows. Find the total by adding, not by counting one by one.',
    );
    expect(g.promptDetails).toBe('■ ■\n■ ■\n■ ■');
    expect(g.answerText).toBe('6 tiles');
    expect(g.options.map((o) => [o.label, o.text, o.isCorrect, o.misconception ?? null])).toEqual([
      ['A', '6 tiles', true, null],
      ['B', '5 tiles', false, 'added-rows-and-columns-instead-of-repeated-addition'],
      ['C', '4 tiles', false, 'skip-counted-one-group-short'],
      ['D', '2 tiles', false, 'counted-only-one-group'],
    ]);
  });

  it('emits exactly this question at seed 123', () => {
    const g = oa4ArrayRepeatedAddition.generate(makeRng(123));
    expect(g.prompt).toBe(
      'The stamps below are arranged in equal rows. Find the total by adding, not by counting one by one.',
    );
    expect(g.promptDetails).toBe('▲ ▲ ▲ ▲\n▲ ▲ ▲ ▲\n▲ ▲ ▲ ▲');
    expect(g.answerText).toBe('12 stamps');
    expect(g.options.map((o) => [o.label, o.text, o.isCorrect, o.misconception ?? null])).toEqual([
      ['A', '4 stamps', false, 'counted-only-one-group'],
      ['B', '8 stamps', false, 'skip-counted-one-group-short'],
      ['C', '12 stamps', true, null],
      ['D', '7 stamps', false, 'added-rows-and-columns-instead-of-repeated-addition'],
    ]);
  });

  it('draws the picture the prompt describes, 3-5 rows by 2-5 columns', () => {
    for (let seed = 0; seed < 500; seed++) {
      const g = oa4ArrayRepeatedAddition.generate(makeRng(seed));
      const { r, c } = readFigure(g.promptDetails!);
      expect(r, `seed ${seed}: ${r} rows`).toBeGreaterThanOrEqual(3);
      expect(r).toBeLessThanOrEqual(5);
      expect(c, `seed ${seed}: ${c} per row`).toBeGreaterThanOrEqual(2);
      expect(c).toBeLessThanOrEqual(5);
      expect(g.answerText).toBe(`${r * c} ${g.answerText.split(' ')[1]}`);
    }
  });

  it('has no colliding option values, or duplicate texts, anywhere in its draw space', () => {
    for (let r = 3; r <= 5; r++) {
      for (let c = 2; c <= 5; c++) {
        if ((r === 3 && c === 3) || (r === 4 && c === 2)) continue;
        const values = [r * c, r + c, (r - 1) * c, c];
        expect(new Set(values).size, `(${r}, ${c}) collides: ${values.join(', ')}`).toBe(4);
      }
    }
  });

  it('never draws an excluded pair', () => {
    for (let seed = 0; seed < 1000; seed++) {
      const { r, c } = readFigure(oa4ArrayRepeatedAddition.generate(makeRng(seed)).promptDetails!);
      expect(`${r},${c}`, `seed ${seed} drew an excluded pair`).not.toBe('3,3');
      expect(`${r},${c}`).not.toBe('4,2');
    }
  });
});
