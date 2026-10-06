import { describe, it, expect } from 'vitest';
import { assertTemplateSound } from '../../../engine/templateTesting';
import { makeRng } from '../../../engine/rng';
import { nf1UnitFractionModel, DENOMINATORS, SHAPES } from './nf1-unit-fraction-model';

/** Ruling 13-2: halves, thirds, fourths, sixths and eighths, and nothing else.
 *  Fifths, tenths, twelfths and hundredths are NC.4.NF content. */
const LEGAL_DENOMINATORS = new Set([2, 3, 4, 6, 8]);

const shape = (g: {
  options: { label: string; text: string; isCorrect: boolean; misconception?: string }[];
}) => g.options.map((o) => [o.label, o.text, o.isCorrect, o.misconception ?? null]);

/** Everything a child reads, joined, so a denominator cannot hide in a step. */
function textOf(g: ReturnType<typeof nf1UnitFractionModel.generate>): string {
  return [
    g.prompt,
    g.promptDetails ?? '',
    ...g.options.map((o) => o.text),
    ...g.explanation.stepByStep,
    g.explanation.conceptSummary,
    g.explanation.commonMisconception ?? '',
  ].join(' ');
}

describe('g3.nf1.unit-fraction-model', () => {
  // content-g3 audit (Medium): "2 whole rectangles, with 1 of them shaded" is 1/2
  // of a set of rectangles, which a careful child can defend against "1/2 of a
  // whole rectangle".
  it('F: no wrong option describes one of several shapes shaded', () => {
    for (let seed = 0; seed < 400; seed++) {
      const g = nf1UnitFractionModel.generate(makeRng(seed));
      for (const o of g.options) expect(o.text, `seed ${seed}`).not.toMatch(/with 1 of them shaded/);
      expect(nf1UnitFractionModel.contentVersion).toBe(2);
    }
  });
  it('is sound at every seed', () => {
    assertTemplateSound(nf1UnitFractionModel);
  });

  it('is deterministic in its seed', () => {
    expect(nf1UnitFractionModel.generate(makeRng(42))).toEqual(
      nf1UnitFractionModel.generate(makeRng(42)),
    );
  });

  // LITERAL pins, taken from a real run. The sweeps below read the denominator
  // back out of the generator's own prompt, so none of them would notice a
  // change to the shape list, to rng.pick ordering, or to the wording of a
  // picture. These two hold the exact bytes.
  it('emits exactly this question at seed 7', () => {
    const g = nf1UnitFractionModel.generate(makeRng(7));
    expect(g.prompt).toBe('Which one shows 1/2 of a whole rectangle?');
    expect(g.promptDetails).toBeUndefined();
    expect(g.answerText).toBe('One rectangle cut into 2 equal parts, with 1 part shaded.');
    expect(shape(g)).toEqual([
      ['A', 'One rectangle cut into 2 equal parts, with 1 part shaded.', true, null],
      [
        'B',
        'One rectangle cut into 2 parts of different sizes, with 1 part shaded.',
        false,
        'counted-parts-without-checking-they-are-equal',
      ],
      ['C', '2 whole rectangles, all shaded.', false, 'treated-the-denominator-as-a-count-of-wholes'],
      [
        'D',
        '1 whole rectangle shaded, and 2 more rectangles beside it.',
        false,
        'read-the-fraction-as-two-whole-numbers',
      ],
    ]);
    expect(g.explanation.stepByStep[1]).toBe(
      'Step 2: Those 2 parts have to be the same size. If they are not, no single part is a half of the rectangle.',
    );
  });

  it('emits exactly this question at seed 123', () => {
    const g = nf1UnitFractionModel.generate(makeRng(123));
    expect(g.prompt).toBe('Which one shows 1/6 of a whole rectangle?');
    expect(g.answerText).toBe('One rectangle cut into 6 equal parts, with 1 part shaded.');
    expect(shape(g)).toEqual([
      [
        'A',
        '1 whole rectangle shaded, and 6 more rectangles beside it.',
        false,
        'read-the-fraction-as-two-whole-numbers',
      ],
      ['B', '6 whole rectangles, all shaded.', false, 'treated-the-denominator-as-a-count-of-wholes'],
      ['C', 'One rectangle cut into 6 equal parts, with 1 part shaded.', true, null],
      [
        'D',
        'One rectangle cut into 6 parts of different sizes, with 1 part shaded.',
        false,
        'counted-parts-without-checking-they-are-equal',
      ],
    ]);
  });

  // Ruling 13-2, swept rather than trusted: no fraction anywhere in the
  // question may have a denominator outside the five the standard names.
  it('writes no denominator outside halves, thirds, fourths, sixths and eighths', () => {
    for (let seed = 0; seed < 400; seed++) {
      const g = nf1UnitFractionModel.generate(makeRng(seed));
      const fractions = [...textOf(g).matchAll(/(\d+)\s*\/\s*(\d+)/g)];
      expect(fractions.length, `seed ${seed}: no fraction in the question at all`).toBeGreaterThan(
        0,
      );
      for (const m of fractions) {
        expect(
          LEGAL_DENOMINATORS.has(Number(m[2])),
          `seed ${seed}: ${m[0]} is not a Grade 3 denominator`,
        ).toBe(true);
      }
    }
  });

  // Ruling 13-6: the "one and four" tag only means anything on an item where a
  // child can actually choose it. It is a PICTURE here, not a number, which is
  // the whole reason this generator has the shape it has.
  it('always offers the "one and four" reading as a picture, never as a number', () => {
    for (let seed = 0; seed < 400; seed++) {
      const g = nf1UnitFractionModel.generate(makeRng(seed));
      const opt = g.options.find(
        (o) => o.misconception === 'read-the-fraction-as-two-whole-numbers',
      );
      expect(opt, `seed ${seed}: the tag is missing`).toBeTruthy();
      expect(/^\d+(\.\d+)?$/.test(opt!.text.trim()), `seed ${seed}: tagged a bare number`).toBe(
        false,
      );
    }
  });

  // The full 20-question draw space, not a sample. Every option is prose, so
  // "distinct" here is distinct text - and it has to hold for the two-word
  // shape name as well as the one-word ones.
  it('has no colliding option text anywhere in its draw space', () => {
    let drawn = 0;
    for (const d of DENOMINATORS) {
      for (const s of SHAPES) {
        const texts = [
          `One ${s.one} cut into ${d} equal parts, with 1 part shaded.`,
          `One ${s.one} cut into ${d} parts of different sizes, with 1 part shaded.`,
          `${d} whole ${s.many}, all shaded.`,
          `1 whole ${s.one} shaded, and ${d} more ${s.many} beside it.`,
        ];
        expect(new Set(texts).size, `(1/${d}, ${s.one}) collides`).toBe(4);
        drawn++;
      }
    }
    expect(DENOMINATORS, 'the sourced denominator set').toEqual([2, 3, 4, 6, 8]);
    expect(drawn, 'draw space size').toBe(20);
  });

  describe('every distractor is the picture its tag names', () => {
    for (const seed of [3, 61, 904, 15207, 88888]) {
      it(`seed ${seed}`, () => {
        const g = nf1UnitFractionModel.generate(makeRng(seed));
        const d = Number(/1\/(\d+)/.exec(g.prompt)![1]);
        const by = (tag: string) => g.options.find((o) => o.misconception === tag)!.text;

        // Unequal parts: d parts, but not a fraction of anything.
        expect(by('counted-parts-without-checking-they-are-equal')).toContain(
          `${d} parts of different sizes`,
        );
        // The denominator read as a count of whole things.
        expect(by('treated-the-denominator-as-a-count-of-wholes')).toMatch(
          new RegExp(`^${d} whole `),
        );
        // "one and d": one whole thing, and then d more.
        expect(by('read-the-fraction-as-two-whole-numbers')).toMatch(
          new RegExp(`^1 whole .*, and ${d} more `),
        );
      });
    }
  });
});
