import { describe, it, expect } from 'vitest';
import { makeRng } from '../../../engine/rng';
import { assertTemplateSound } from '../../../engine/templateTesting';
import { nf1AddUnlike } from './nf1-add-unlike';

describe('nf1AddUnlike', () => {
  it('satisfies every template invariant across 300 seeds', () => {
    assertTemplateSound(nf1AddUnlike);
  });

  it('is deterministic in its seed', () => {
    const a = nf1AddUnlike.generate(makeRng(777));
    const b = nf1AddUnlike.generate(makeRng(777));
    expect(a).toEqual(b);
  });

  it('always uses related denominators, as NC.5.NF.1 requires', () => {
    // NC limits grade 5 to denominators where one is a multiple of the
    // other; a generator emitting 2/5 + 1/3 would be off-standard.
    for (let seed = 0; seed < 200; seed++) {
      const g = nf1AddUnlike.generate(makeRng(seed));
      const dens = [...(g.promptDetails ?? '').matchAll(/\d+\/(\d+)/g)].map((m) => Number(m[1]));
      expect(dens).toHaveLength(2);
      const [d1, d2] = dens;
      expect(Math.max(d1, d2) % Math.min(d1, d2), `seed ${seed}: ${d1}, ${d2}`).toBe(0);
      expect(d1).not.toBe(d2);
    }
  });

  it('produces the added-across distractor', () => {
    const g = nf1AddUnlike.generate(makeRng(3));
    const tags = g.options.filter((o) => !o.isCorrect).map((o) => o.misconception);
    expect(tags).toContain('added-numerators-and-denominators');
  });
});
