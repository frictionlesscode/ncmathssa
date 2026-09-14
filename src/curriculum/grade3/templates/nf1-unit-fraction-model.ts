import type { Rng } from '../../../engine/rng';
import type { QuestionTemplate, GeneratedQuestion } from '../../../engine/template';
import { labelOptions } from '../../../engine/questionModel';

/**
 * NC.3.NF.1 — "Interpret unit fractions with denominators of 2, 3, 4, 6, and 8
 * as quantities formed when a whole is partitioned into equal parts", whose
 * keyConcepts are "explain that a unit fraction is one of those parts",
 * "represent and identify unit fractions using AREA AND LENGTH MODELS", and
 * "the whole is partitioned into EQUAL parts".
 *
 * So this generator is a MODEL-MATCHING question: it gives the symbol and asks
 * which picture it describes. That shape is chosen for two reasons.
 *
 * First, it is the standard's own. "Identify unit fractions using area and
 * length models" is matching a symbol to a picture, and the three ways a child
 * can get it wrong — unequal parts, the denominator read as a count of whole
 * things, and the symbol read as two separate numbers — are each a picture that
 * can be put on the page beside the right one.
 *
 * Second, it is the ONLY shape on which reading 1/4 as "one and four" can
 * honestly be tagged (ruling 13-6). That error has no numeric value: there is
 * no number a child who makes it arrives at. On "What is 1/4 of 8?" the tag
 * could only ever be filed against a number some OTHER mistake produced, and a
 * mis-filed tag tells a parent their child made a mistake they did not make.
 * Here the child can pick it, so here it can be tagged.
 *
 * ---------------------------------------------------------------------------
 * Construction. The denominator d is drawn from {2, 3, 4, 6, 8} — the exact set
 * the sourced text names, and the whole of it. Fifths, tenths, twelfths and
 * hundredths are NC.4.NF content.
 *
 * The four options are four pictures, distinct as text at every draw because
 * each one begins differently and the shape word is shared by all of them:
 *
 *   answer                                one whole, d equal parts, 1 shaded
 *   counted-parts-without-checking-       one whole, d parts of DIFFERENT
 *     they-are-equal                      sizes, 1 shaded
 *   treated-the-denominator-as-a-         d WHOLE shapes, 1 of them shaded
 *     count-of-wholes
 *   read-the-fraction-as-two-whole-       1 whole shaded, and d more beside it
 *     numbers                             ("one and four")
 *
 * Nothing is excluded and nothing is resampled: the draw space is
 * 5 denominators x 4 shapes = 20 questions, swept in full by the sibling test.
 */
interface Shape {
  one: string;
  many: string;
}

export const SHAPES: Shape[] = [
  { one: 'rectangle', many: 'rectangles' },
  { one: 'circle', many: 'circles' },
  { one: 'square', many: 'squares' },
  { one: 'paper strip', many: 'paper strips' },
];

/** Ruling 13-2: the denominators NC.3.NF.1 names, and only those. */
export const DENOMINATORS = [2, 3, 4, 6, 8];

/** What one of the d parts is CALLED. English does not build these from the
 *  numeral, so they are written out: "a 2th of the rectangle" is not a sentence
 *  an eight-year-old should be asked to read. */
const PART_NAMES: Record<number, string> = {
  2: 'half',
  3: 'third',
  4: 'fourth',
  6: 'sixth',
  8: 'eighth',
};

export const nf1UnitFractionModel: QuestionTemplate = {
  id: 'g3.nf1.unit-fraction-model',
  standardCode: 'NC.3.NF.1',
  domainId: 'NF',
  difficulty: 'mastery',
  calculatorAllowed: false,
  isStretch: false,

  generate(rng: Rng): GeneratedQuestion {
    const d = rng.pick(DENOMINATORS);
    const s = rng.pick(SHAPES);

    const answerText = `One ${s.one} cut into ${d} equal parts, with 1 part shaded.`;

    const candidates = [
      { text: answerText, isCorrect: true },
      // d parts, but not equal ones - so no single part is a 1/d of anything.
      {
        text: `One ${s.one} cut into ${d} parts of different sizes, with 1 part shaded.`,
        isCorrect: false,
        misconception: 'counted-parts-without-checking-they-are-equal',
      },
      // The d read as a number of whole things instead of parts of one whole.
      {
        text: `${d} whole ${s.many}, with 1 of them shaded.`,
        isCorrect: false,
        misconception: 'treated-the-denominator-as-a-count-of-wholes',
      },
      // "one and d": the symbol pulled apart into two separate whole numbers.
      {
        text: `1 whole ${s.one} shaded, and ${d} more ${s.many} beside it.`,
        isCorrect: false,
        misconception: 'read-the-fraction-as-two-whole-numbers',
      },
    ];

    const texts = candidates.map((c) => c.text);
    if (new Set(texts).size !== texts.length) {
      throw new Error(`g3.nf1.unit-fraction-model: option collision [${texts.join(' | ')}]`);
    }

    return {
      prompt: `Which one shows 1/${d} of a whole ${s.one}?`,
      options: labelOptions(rng.shuffle(candidates)),
      answerText,
      explanation: {
        stepByStep: [
          `Step 1: The bottom number, ${d}, says ONE whole ${s.one} is cut into ${d} parts.`,
          `Step 2: Those ${d} parts have to be the same size. If they are not, no single part is a ${PART_NAMES[d]} of the ${s.one}.`,
          'Step 3: The top number, 1, says how many of those parts are counted: just one of them.',
          `Step 4: So the picture is One ${s.one} cut into ${d} equal parts, with 1 part shaded.`,
        ],
        conceptSummary:
          'A unit fraction is ONE of the equal parts that a single whole has been cut into. The bottom number says how many parts the whole was cut into, and the top number says how many of them are being counted.',
        commonMisconception: `${d} separate ${s.many} is ${d} wholes, not one whole cut into ${d} parts — and 1/${d} is a fraction OF one whole, not a count of several.`,
      },
    };
  },
};
