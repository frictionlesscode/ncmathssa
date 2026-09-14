import { describe, it, expect } from 'vitest';
import { assertTemplateSound } from '../../../engine/templateTesting';
import { makeRng } from '../../../engine/rng';
import { nf3EquivalentFraction, BASES } from './nf3-equivalent-fraction';

/** Ruling 13-2, narrowed further for NF.3 to the RELATED families the sourced
 *  text names: halves/fourths/eighths, and thirds/sixths. */
const FAMILY_OF: Record<number, string> = { 2: 'halves', 4: 'halves', 8: 'halves', 3: 'thirds', 6: 'thirds' };

const shape = (g: {
  options: { label: string; text: string; isCorrect: boolean; misconception?: string }[];
}) => g.options.map((o) => [o.label, o.text, o.isCorrect, o.misconception ?? null]);

function textOf(g: ReturnType<typeof nf3EquivalentFraction.generate>): string {
  return [
    g.prompt,
    g.promptDetails ?? '',
    ...g.options.map((o) => o.text),
    ...g.explanation.stepByStep,
    g.explanation.conceptSummary,
    g.explanation.commonMisconception ?? '',
  ].join(' ');
}

/** Reads the base fraction back out of the prompt, independently of the code. */
function parse(prompt: string): { n: number; d: number } {
  const m = /^Which fraction names the same amount as (\d+)\/(\d+)\?$/.exec(prompt);
  if (!m) throw new Error(`unparsable prompt: ${prompt}`);
  return { n: Number(m[1]), d: Number(m[2]) };
}

const value = (text: string): number => {
  const m = /^(\d+)\/(\d+)$/.exec(text)!;
  return Number(m[1]) / Number(m[2]);
};

describe('g3.nf3.equivalent-fraction', () => {
  it('is sound at every seed', () => {
    assertTemplateSound(nf3EquivalentFraction);
  });

  it('is deterministic in its seed', () => {
    expect(nf3EquivalentFraction.generate(makeRng(42))).toEqual(
      nf3EquivalentFraction.generate(makeRng(42)),
    );
  });

  // LITERAL pins, taken from a real run - including the bar, because the bar is
  // the "area model" the standard asks for and a silent change to its geometry
  // would leave every other test here green.
  it('emits exactly this question at seed 7', () => {
    const g = nf3EquivalentFraction.generate(makeRng(7));
    expect(g.prompt).toBe('Which fraction names the same amount as 1/2?');
    expect(g.promptDetails).toBe(
      '|████████████|            |\nThe bar is cut into 2 equal parts, and 1 of them is shaded.',
    );
    expect(g.answerText).toBe('2/4');
    expect(shape(g)).toEqual([
      ['A', '2/2', false, 'scaled-the-numerator-but-not-the-denominator'],
      ['B', '1/4', false, 'changed-the-denominator-but-not-the-numerator'],
      ['C', '3/4', false, 'added-to-both-parts-instead-of-multiplying'],
      ['D', '2/4', true, null],
    ]);
    expect(g.explanation.stepByStep[3]).toBe('Step 4: The same amount is shaded, so 1/2 = 2/4.');
  });

  it('emits exactly this question at seed 123', () => {
    const g = nf3EquivalentFraction.generate(makeRng(123));
    expect(g.prompt).toBe('Which fraction names the same amount as 3/4?');
    expect(g.promptDetails).toBe(
      '|██████|██████|██████|      |\nThe bar is cut into 4 equal parts, and 3 of them are shaded.',
    );
    expect(g.answerText).toBe('6/8');
    expect(shape(g)).toEqual([
      ['A', '7/8', false, 'added-to-both-parts-instead-of-multiplying'],
      ['B', '6/4', false, 'scaled-the-numerator-but-not-the-denominator'],
      ['C', '3/8', false, 'changed-the-denominator-but-not-the-numerator'],
      ['D', '6/8', true, null],
    ]);
  });

  // The key must name the SAME AMOUNT as the base fraction. This is the one
  // assertion in the file that checks the mathematics rather than the shape.
  it('always keys the option equal in value to the base fraction', () => {
    for (let seed = 0; seed < 400; seed++) {
      const g = nf3EquivalentFraction.generate(makeRng(seed));
      const { n, d } = parse(g.prompt);
      const correct = g.options.find((o) => o.isCorrect)!;
      expect(Math.abs(value(correct.text) - n / d), `seed ${seed}: ${correct.text} != ${n}/${d}`)
        .toBeLessThan(1e-9);
    }
  });

  // Equivalent fractions name the same number, so two options in different form
  // can be one answer - the sharpest risk in this whole domain. Compare by
  // VALUE, never by text.
  it('never offers two options that name the same amount', () => {
    for (let seed = 0; seed < 400; seed++) {
      const g = nf3EquivalentFraction.generate(makeRng(seed));
      const values = g.options.map((o) => value(o.text));
      expect(new Set(values).size, `seed ${seed}: ${g.options.map((o) => o.text).join(' | ')}`).toBe(
        4,
      );
    }
  });

  // Ruling 13-2, and the tighter "RELATED fractions" wording of NC.3.NF.3's own
  // first keyConcept: every denominator printed anywhere must not only be one
  // of the five, it must be in the SAME family as the base. Rescaling 1/2 into
  // sixths is Grade 4.
  it('never leaves the related family it started in', () => {
    for (let seed = 0; seed < 400; seed++) {
      const g = nf3EquivalentFraction.generate(makeRng(seed));
      const { d } = parse(g.prompt);
      const family = FAMILY_OF[d];
      expect(family, `seed ${seed}: base denominator ${d} is not a Grade 3 denominator`).toBeTruthy();
      for (const m of textOf(g).matchAll(/(\d+)\s*\/\s*(\d+)/g)) {
        expect(
          FAMILY_OF[Number(m[2])],
          `seed ${seed}: ${m[0]} is outside the ${family} family`,
        ).toBe(family);
      }
    }
  });

  // The full 6-triple draw space, not a sample - and an explicit check that the
  // one collision the algebra predicts (d = n(k+1), i.e. 1/3 into sixths) is
  // absent by construction rather than by luck.
  it('has no colliding option values anywhere in its draw space', () => {
    for (const { n, d, target } of BASES) {
      const k = target / d;
      const values = [(n * k) / target, n / target, (n + target - d) / target, (n * k) / d];
      expect(new Set(values).size, `${n}/${d} -> ${target} collides: ${values.join(', ')}`).toBe(4);
      expect(d, `${n}/${d} -> ${target} hits the d = n(k+1) collision`).not.toBe(n * (k + 1));
      expect(n, `${n}/${d} is not a proper fraction`).toBeLessThan(d);
      expect(target % d, `${target} is not a multiple of ${d}`).toBe(0);
      expect(FAMILY_OF[target], `${target} leaves the family of ${d}`).toBe(FAMILY_OF[d]);
    }
    expect(BASES.length, 'draw space size').toBe(6);
  });

  describe('every distractor is the value its tag names', () => {
    for (const seed of [3, 61, 904, 15207, 88888]) {
      it(`seed ${seed}`, () => {
        const g = nf3EquivalentFraction.generate(makeRng(seed));
        const { n, d } = parse(g.prompt);
        const target = Number(/\/(\d+)$/.exec(g.answerText)![1]);
        const k = target / d;
        const by = (tag: string) => g.options.find((o) => o.misconception === tag)!.text;

        expect(g.answerText).toBe(`${n * k}/${target}`);
        // Recut the bar, carried the old count over.
        expect(by('changed-the-denominator-but-not-the-numerator')).toBe(`${n}/${target}`);
        // Added the same amount to the top and the bottom.
        expect(by('added-to-both-parts-instead-of-multiplying')).toBe(
          `${n + target - d}/${target}`,
        );
        // Multiplied the top, left the bottom alone.
        expect(by('scaled-the-numerator-but-not-the-denominator')).toBe(`${n * k}/${d}`);
      });
    }
  });
});
