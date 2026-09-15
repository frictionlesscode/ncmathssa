import { describe, it, expect } from 'vitest';
import { assertTemplateSound } from '../../../engine/templateTesting';
import { makeRng } from '../../../engine/rng';
import { oa3OddOrEven } from './oa3-odd-or-even';

describe('g2.oa3.odd-or-even', () => {
  it('is sound at every seed', () => {
    assertTemplateSound(oa3OddOrEven);
  });

  it('is deterministic in its seed', () => {
    expect(oa3OddOrEven.generate(makeRng(42))).toEqual(oa3OddOrEven.generate(makeRng(42)));
  });

  it('emits exactly this question at seed 7 (even)', () => {
    const g = oa3OddOrEven.generate(makeRng(7));
    expect(g.prompt).toBe('Which of these numbers is EVEN?');
    expect(g.answerText).toBe('2');
    expect(g.options.map((o) => [o.label, o.text, o.isCorrect, o.misconception ?? null])).toEqual([
      ['A', '7', false, 'miscounted-while-pairing-the-objects'],
      ['B', '15', false, 'miscounted-while-pairing-the-objects'],
      ['C', '1', false, 'miscounted-while-pairing-the-objects'],
      ['D', '2', true, null],
    ]);
  });

  it('emits exactly this question at seed 123 (odd)', () => {
    const g = oa3OddOrEven.generate(makeRng(123));
    expect(g.prompt).toBe('Which of these numbers is ODD?');
    expect(g.answerText).toBe('3');
    expect(g.options.map((o) => [o.label, o.text, o.isCorrect, o.misconception ?? null])).toEqual([
      ['A', '2', false, 'miscounted-while-pairing-the-objects'],
      ['B', '18', false, 'miscounted-while-pairing-the-objects'],
      ['C', '3', true, null],
      ['D', '4', false, 'miscounted-while-pairing-the-objects'],
    ]);
  });

  it('draws every option from 1-20, and only the correct option matches the asked-for parity', () => {
    for (let seed = 0; seed < 500; seed++) {
      const g = oa3OddOrEven.generate(makeRng(seed));
      const wantsEven = g.prompt.includes('EVEN');
      for (const o of g.options) {
        const n = Number(o.text);
        expect(n, `seed ${seed}: ${n}`).toBeGreaterThanOrEqual(1);
        expect(n).toBeLessThanOrEqual(20);
        expect(n % 2 === 0, `seed ${seed}: ${n} even=${n % 2 === 0}, isCorrect=${o.isCorrect}`).toBe(
          o.isCorrect ? wantsEven : !wantsEven,
        );
      }
    }
  });
});
