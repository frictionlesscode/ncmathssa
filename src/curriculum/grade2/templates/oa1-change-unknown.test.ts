import { describe, it, expect } from 'vitest';
import { assertTemplateSound } from '../../../engine/templateTesting';
import { makeRng } from '../../../engine/rng';
import { oa1ChangeUnknown } from './oa1-change-unknown';

describe('g2.oa1.change-unknown', () => {
  it('is sound at every seed', () => {
    assertTemplateSound(oa1ChangeUnknown);
  });

  it('is deterministic in its seed', () => {
    expect(oa1ChangeUnknown.generate(makeRng(42))).toEqual(oa1ChangeUnknown.generate(makeRng(42)));
  });

  // LITERAL pins, taken from a real run — not derived from the code's own
  // output, per the Content Contract's standing ruling on fixed-seed tests.
  it('emits exactly this question at seed 7', () => {
    const g = oa1ChangeUnknown.generate(makeRng(7));
    expect(g.prompt).toBe(
      'Mia had 14 stickers. Mia gave away some of them. Now Mia has 10 stickers. The equation 14 − ☐ = 10 shows this. How many stickers did Mia give away?',
    );
    expect(g.answerText).toBe('4 stickers');
    expect(g.options.map((o) => [o.label, o.text, o.isCorrect, o.misconception ?? null])).toEqual([
      ['A', '3 stickers', false, 'counted-on-by-ones-and-stopped-one-short'],
      ['B', '4 stickers', true, null],
      ['C', '24 stickers', false, 'added-instead-of-subtracted'],
      ['D', '10 stickers', false, 'restated-a-known-number-instead-of-solving'],
    ]);
  });

  it('emits exactly this question at seed 123', () => {
    const g = oa1ChangeUnknown.generate(makeRng(123));
    expect(g.prompt).toBe(
      'Elena had 22 shells. Elena gave away some of them. Now Elena has 17 shells. The equation 22 − ☐ = 17 shows this. How many shells did Elena give away?',
    );
    expect(g.answerText).toBe('5 shells');
    expect(g.options.map((o) => [o.label, o.text, o.isCorrect, o.misconception ?? null])).toEqual([
      ['A', '4 shells', false, 'counted-on-by-ones-and-stopped-one-short'],
      ['B', '17 shells', false, 'restated-a-known-number-instead-of-solving'],
      ['C', '39 shells', false, 'added-instead-of-subtracted'],
      ['D', '5 shells', true, null],
    ]);
  });

  it('keeps every quantity within 100, start > change > 0', () => {
    for (let seed = 0; seed < 500; seed++) {
      const g = oa1ChangeUnknown.generate(makeRng(seed));
      const start = Number(/had (\d+)/.exec(g.prompt)![1]);
      const change = Number(g.answerText.split(' ')[0]);
      const end = Number(/Now \S+ has (\d+)/.exec(g.prompt)![1]);
      expect(start, `seed ${seed}`).toBeLessThanOrEqual(100);
      expect(change).toBeGreaterThan(0);
      expect(end).toBeGreaterThan(0);
      expect(start - change).toBe(end);
    }
  });
});
