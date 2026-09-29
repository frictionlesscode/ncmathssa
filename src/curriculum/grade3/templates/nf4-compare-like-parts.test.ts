import { describe, it, expect } from 'vitest';
import { assertTemplateSound } from '../../../engine/templateTesting';
import { makeRng } from '../../../engine/rng';
import { nf4CompareLikeParts, DENOMINATOR_PAIRS, FAMILIES } from './nf4-compare-like-parts';

/** Ruling 13-2, in the related-family form NC.3.NF.4 uses. */
const FAMILY_OF: Record<number, string> = { 2: 'halves', 4: 'halves', 8: 'halves', 3: 'thirds', 6: 'thirds' };

const shape = (g: {
  options: { label: string; text: string; isCorrect: boolean; misconception?: string }[];
}) => g.options.map((o) => [o.label, o.text, o.isCorrect, o.misconception ?? null]);

interface Claim {
  left: [number, number];
  right: [number, number];
  symbol: string;
}

/** Reads a printed comparison back as a claim, with no help from the generator.
 *  Everything below is decided from this, so a change to how the statements are
 *  built cannot quietly change what is being asserted about them. */
function parseClaim(text: string): Claim {
  const m = /^(\d+)\/(\d+) ([<>=]) (\d+)\/(\d+)$/.exec(text);
  if (!m) throw new Error(`unparsable comparison: ${text}`);
  return {
    left: [Number(m[1]), Number(m[2])],
    right: [Number(m[4]), Number(m[5])],
    symbol: m[3],
  };
}

function isTrue(c: Claim): boolean {
  const l = c.left[0] / c.left[1];
  const r = c.right[0] / c.right[1];
  if (c.symbol === '>') return l > r;
  if (c.symbol === '<') return l < r;
  return Math.abs(l - r) < 1e-9;
}

describe('g3.nf4.compare-like-parts', () => {
  it('is sound at every seed', () => {
    assertTemplateSound(nf4CompareLikeParts);
  });

  it('is deterministic in its seed', () => {
    expect(nf4CompareLikeParts.generate(makeRng(42))).toEqual(
      nf4CompareLikeParts.generate(makeRng(42)),
    );
  });

  // LITERAL pins, taken from a real run. Note that the two of them land on
  // opposite halves of the standard and opposite symbols, which is what the two
  // coin flips inside the generator are for.
  it('emits exactly this question at seed 7', () => {
    const g = nf4CompareLikeParts.generate(makeRng(7));
    expect(g.prompt).toBe('Which comparison is true?');
    expect(g.promptDetails).toBeUndefined();
    expect(g.answerText).toBe('1/2 > 1/4');
    expect(shape(g)).toEqual([
      ['A', '1/2 = 1/4', false, 'compared-numerators-only'],
      ['B', '2/4 > 3/4', false, 'compared-in-the-wrong-direction'],
      ['C', '1/2 > 1/4', true, null],
      ['D', '1/4 > 1/2', false, 'larger-denominator-means-larger-fraction'],
    ]);
    expect(g.explanation.stepByStep[3]).toBe('Step 4: So the true comparison is 1/2 > 1/4.');
  });

  it('emits exactly this question at seed 123', () => {
    const g = nf4CompareLikeParts.generate(makeRng(123));
    expect(g.answerText).toBe('2/6 < 3/6');
    expect(shape(g)).toEqual([
      ['A', '2/6 < 3/6', true, null],
      ['B', '3/6 < 2/6', false, 'compared-in-the-wrong-direction'],
      ['C', '3/6 = 2/6', false, 'compared-denominators-only'],
      ['D', '1/3 < 1/6', false, 'larger-denominator-means-larger-fraction'],
    ]);
  });

  // RULING 13-1, the reason this template exists in this shape. NC.3.NF.4 is
  // "compare two fractions with the same numerator OR the same denominator".
  // Comparing 2/3 to 3/4 is NC.4.NF.2 and has a landed Grade 4 generator. A
  // general comparator here would be next year's mathematics under this year's
  // code, and every other test in the suite would pass.
  it('never compares two fractions sharing neither a numerator nor a denominator', () => {
    for (let seed = 0; seed < 3000; seed++) {
      const g = nf4CompareLikeParts.generate(makeRng(seed));
      for (const o of g.options) {
        const c = parseClaim(o.text);
        expect(
          c.left[0] === c.right[0] || c.left[1] === c.right[1],
          `seed ${seed}: "${o.text}" shares neither part - that is NC.4.NF.2`,
        ).toBe(true);
      }
    }
  });

  // Ruling 13-2, in the related-family form: both denominators in a comparison
  // always come from ONE of the two families, never one from each.
  it('never crosses between the two related families', () => {
    for (let seed = 0; seed < 3000; seed++) {
      const g = nf4CompareLikeParts.generate(makeRng(seed));
      for (const o of g.options) {
        const c = parseClaim(o.text);
        for (const d of [c.left[1], c.right[1]]) {
          expect(FAMILY_OF[d], `seed ${seed}: "${o.text}" uses a denominator of ${d}`).toBeTruthy();
        }
        expect(
          FAMILY_OF[c.left[1]],
          `seed ${seed}: "${o.text}" mixes the two related families`,
        ).toBe(FAMILY_OF[c.right[1]]);
      }
    }
  });

  // The mathematics, evaluated rather than assumed: of the four statements on
  // offer, exactly one is true, and it is the one marked correct. This is the
  // assertion that would catch a wrong key, and it does not trust any of the
  // generator's own reasoning about which fraction is greater.
  it('offers exactly one true statement, and keys it', () => {
    for (let seed = 0; seed < 3000; seed++) {
      const g = nf4CompareLikeParts.generate(makeRng(seed));
      const truths = g.options.map((o) => isTrue(parseClaim(o.text)));
      expect(
        truths.filter(Boolean).length,
        `seed ${seed}: ${g.options.map((o) => `${o.text} [${isTrue(parseClaim(o.text))}]`).join(' | ')}`,
      ).toBe(1);
      const keyed = g.options.findIndex((o) => o.isCorrect);
      expect(truths[keyed], `seed ${seed}: the keyed option "${g.options[keyed].text}" is false`)
        .toBe(true);
      expect(g.answerText, `seed ${seed}`).toBe(g.options[keyed].text);
    }
  });

  // Both halves of the standard, and both symbols, have to actually appear -
  // otherwise the coin flips could silently degenerate and nothing above would
  // notice. The same-denominator half is half the sourced text.
  it('asks both halves of the standard, with both symbols', () => {
    const seen = new Set<string>();
    for (let seed = 0; seed < 300; seed++) {
      const g = nf4CompareLikeParts.generate(makeRng(seed));
      const c = parseClaim(g.answerText);
      seen.add(`${c.left[1] === c.right[1] ? 'same-denominator' : 'same-numerator'}/${c.symbol}`);
    }
    expect([...seen].sort()).toEqual([
      'same-denominator/<',
      'same-denominator/>',
      'same-numerator/<',
      'same-numerator/>',
    ]);
  });

  // The denominator pairs, enumerated rather than sampled: three from the
  // halves family and one from the thirds family, and no pair crossing them.
  it('draws its denominators only from within one family', () => {
    expect(FAMILIES).toEqual([
      [2, 4, 8],
      [3, 6],
    ]);
    expect(DENOMINATOR_PAIRS).toEqual([
      { p: 2, q: 4 },
      { p: 2, q: 8 },
      { p: 4, q: 8 },
      { p: 3, q: 6 },
    ]);
    for (const { p, q } of DENOMINATOR_PAIRS) {
      expect(p, `${p} is not below ${q}`).toBeLessThan(q);
      expect(FAMILY_OF[p], `${p}/${q} crosses families`).toBe(FAMILY_OF[q]);
    }
  });

  describe('every distractor is the error its tag names', () => {
    for (const seed of [3, 61, 904, 15207, 88888]) {
      it(`seed ${seed}`, () => {
        const g = nf4CompareLikeParts.generate(makeRng(seed));
        for (const o of g.options) {
          if (o.isCorrect) continue;
          const c = parseClaim(o.text);
          if (o.misconception === 'larger-denominator-means-larger-fraction') {
            // Same numerator, and the claim favours the larger denominator.
            expect(c.left[0], o.text).toBe(c.right[0]);
            const favoured = c.symbol === '>' ? c.left : c.right;
            const other = c.symbol === '>' ? c.right : c.left;
            expect(favoured[1], `${o.text} does not favour the larger denominator`).toBeGreaterThan(
              other[1],
            );
          } else if (o.misconception === 'compared-in-the-wrong-direction') {
            // Same denominator, and the claim favours the smaller numerator.
            expect(c.left[1], o.text).toBe(c.right[1]);
            const favoured = c.symbol === '>' ? c.left : c.right;
            const other = c.symbol === '>' ? c.right : c.left;
            expect(favoured[0], `${o.text} does not favour the smaller numerator`).toBeLessThan(
              other[0],
            );
          } else if (o.misconception === 'compared-numerators-only') {
            expect(c.symbol, o.text).toBe('=');
            expect(c.left[0], `${o.text} is not a matching-numerator claim`).toBe(c.right[0]);
          } else if (o.misconception === 'compared-denominators-only') {
            expect(c.symbol, o.text).toBe('=');
            expect(c.left[1], `${o.text} is not a matching-denominator claim`).toBe(c.right[1]);
          } else {
            throw new Error(`unexpected tag ${o.misconception} on "${o.text}"`);
          }
        }
      });
    }
  });
});
