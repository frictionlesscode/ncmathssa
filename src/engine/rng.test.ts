import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { makeRng, mulberry32 } from './rng';

describe('mulberry32', () => {
  it('produces the same sequence for the same seed', () => {
    const a = mulberry32(12345);
    const b = mulberry32(12345);
    const seqA = [a(), a(), a(), a(), a()];
    const seqB = [b(), b(), b(), b(), b()];
    expect(seqA).toEqual(seqB);
  });

  it('produces different sequences for different seeds', () => {
    const a = mulberry32(1);
    const b = mulberry32(2);
    expect([a(), a(), a()]).not.toEqual([b(), b(), b()]);
  });

  it('always returns values in [0, 1)', () => {
    fc.assert(
      fc.property(fc.integer({ min: 0, max: 2 ** 31 }), (seed) => {
        const r = mulberry32(seed);
        for (let i = 0; i < 50; i++) {
          const v = r();
          expect(v).toBeGreaterThanOrEqual(0);
          expect(v).toBeLessThan(1);
        }
      }),
      { numRuns: 200 },
    );
  });
});

describe('makeRng', () => {
  it('int() stays within the inclusive bounds', () => {
    fc.assert(
      fc.property(fc.integer({ min: 0, max: 10000 }), (seed) => {
        const rng = makeRng(seed);
        for (let i = 0; i < 50; i++) {
          const v = rng.int(3, 7);
          expect(v).toBeGreaterThanOrEqual(3);
          expect(v).toBeLessThanOrEqual(7);
          expect(Number.isInteger(v)).toBe(true);
        }
      }),
      { numRuns: 200 },
    );
  });

  it('int() can reach both endpoints', () => {
    const seen = new Set<number>();
    const rng = makeRng(99);
    for (let i = 0; i < 500; i++) seen.add(rng.int(1, 4));
    expect(seen).toEqual(new Set([1, 2, 3, 4]));
  });

  it('shuffle() preserves every element and does not mutate the input', () => {
    const input = [1, 2, 3, 4, 5, 6, 7, 8];
    const frozen = [...input];
    const out = makeRng(7).shuffle(input);
    expect(input).toEqual(frozen);
    expect([...out].sort((a, b) => a - b)).toEqual(frozen);
  });

  it('is fully reproducible from the seed', () => {
    const run = (seed: number) => {
      const r = makeRng(seed);
      return [r.int(1, 100), r.pick(['a', 'b', 'c']), r.shuffle([1, 2, 3, 4])];
    };
    expect(run(42)).toEqual(run(42));
  });
});
