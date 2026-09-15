import { describe, it, expect } from 'vitest';
import { assertTemplateSound } from '../../../engine/templateTesting';
import { makeRng } from '../../../engine/rng';
import { oa2FluencyFact } from './oa2-fluency-fact';

describe('g2.oa2.fluency-fact', () => {
  it('is sound at every seed', () => {
    assertTemplateSound(oa2FluencyFact);
  });

  it('is deterministic in its seed', () => {
    expect(oa2FluencyFact.generate(makeRng(42))).toEqual(oa2FluencyFact.generate(makeRng(42)));
  });

  it('emits exactly this question at seed 7 (addition)', () => {
    const g = oa2FluencyFact.generate(makeRng(7));
    expect(g.prompt).toBe('What is 2 + 9?');
    expect(g.answerText).toBe('11');
    expect(g.options.map((o) => [o.label, o.text, o.isCorrect, o.misconception ?? null])).toEqual([
      ['A', '7', false, 'subtracted-instead-of-added'],
      ['B', '11', true, null],
      ['C', '10', false, 'counted-on-by-ones-and-stopped-one-short'],
      ['D', '12', false, 'counted-on-by-ones-one-too-many'],
    ]);
  });

  it('emits exactly this question at seed 123 (subtraction)', () => {
    const g = oa2FluencyFact.generate(makeRng(123));
    expect(g.prompt).toBe('What is 12 − 5?');
    expect(g.answerText).toBe('7');
    expect(g.options.map((o) => [o.label, o.text, o.isCorrect, o.misconception ?? null])).toEqual([
      ['A', '17', false, 'added-instead-of-subtracted'],
      ['B', '6', false, 'counted-on-by-ones-one-too-many'],
      ['C', '8', false, 'counted-on-by-ones-and-stopped-one-short'],
      ['D', '7', true, null],
    ]);
  });

  it('stays within 20 on both operations, at every seed', () => {
    for (let seed = 0; seed < 500; seed++) {
      const g = oa2FluencyFact.generate(makeRng(seed));
      const m = /What is (\d+) ([+−]) (\d+)\?/.exec(g.prompt)!;
      const a = Number(m[1]);
      const op = m[2];
      const b = Number(m[3]);
      const correct = Number(g.answerText);
      if (op === '+') {
        expect(a + b, `seed ${seed}`).toBe(correct);
        expect(a + b).toBeLessThanOrEqual(20);
      } else {
        expect(a - b, `seed ${seed}`).toBe(correct);
        expect(correct).toBeGreaterThanOrEqual(2);
      }
    }
  });
});
