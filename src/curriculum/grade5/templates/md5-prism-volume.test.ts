import { describe, it, expect } from 'vitest';
import { makeRng } from '../../../engine/rng';
import { assertTemplateSound } from '../../../engine/templateTesting';
import { md5PrismVolume } from './md5-prism-volume';

function parse(details: string) {
  const m = details.match(/^l = (\d+), w = (\d+), h = (\d+)$/);
  if (!m) throw new Error(`unparsable promptDetails: ${details}`);
  const [, l, w, h] = m.map(Number);
  return { l, w, h };
}

const optionTexts = (g: ReturnType<typeof md5PrismVolume.generate>, tag: string): string[] =>
  g.options.filter((o) => o.misconception === tag).map((o) => o.text);

describe('md5PrismVolume', () => {
  it('satisfies every template invariant across 300 seeds', () => {
    assertTemplateSound(md5PrismVolume);
  });

  it('is deterministic in its seed', () => {
    const a = md5PrismVolume.generate(makeRng(777));
    const b = md5PrismVolume.generate(makeRng(777));
    expect(a).toEqual(b);
  });

  it('never draws a prism where two of the four values coincide', () => {
    // Ruling F6 replaced l*w*h/h, which is just l*w. The replacements can
    // still tie one another for some triples (l*w = l+w+h at 3x3x3, for
    // instance), so the height is drawn from the values that cannot.
    for (let seed = 0; seed < 300; seed++) {
      const g = md5PrismVolume.generate(makeRng(seed));
      const { l, w, h } = parse(g.promptDetails ?? '');
      for (const d of [l, w, h]) {
        expect(d, `seed ${seed}: ${l}x${w}x${h}`).toBeGreaterThanOrEqual(2);
        expect(d).toBeLessThanOrEqual(12);
      }
      const values = [l * w * h, l * w, 2 * (l + w + h), l + w + h];
      expect(new Set(values).size, `seed ${seed}: ${values.join(', ')}`).toBe(4);
      expect(g.answerText).toBe(String(l * w * h));
    }
  });

  describe('every distractor value matches the error its tag names', () => {
    for (const seed of [9, 64, 333, 4912, 8675309]) {
      it(`seed ${seed}`, () => {
        const g = md5PrismVolume.generate(makeRng(seed));
        const { l, w, h } = parse(g.promptDetails ?? '');

        expect(g.answerText).toBe(String(l * w * h));
        // One face instead of the whole solid.
        expect(optionTexts(g, 'used-area-not-volume')).toEqual([String(l * w)]);
        // Both perimeter-shaped slips: the edge sum, and twice it.
        expect(new Set(optionTexts(g, 'used-perimeter-formula'))).toEqual(
          new Set([String(2 * (l + w + h)), String(l + w + h)]),
        );
      });
    }
  });
});
