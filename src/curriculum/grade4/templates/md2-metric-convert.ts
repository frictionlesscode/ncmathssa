import type { Rng } from '../../../engine/rng';
import type { QuestionTemplate, GeneratedQuestion } from '../../../engine/template';
import { labelOptions } from '../../../engine/questionModel';

export interface Pair {
  big: string;
  small: string;
  factor: 100 | 1000;
  /** The most this pair's quantity may be, chosen so no printed number here
   *  ever reaches the 100,000 ceiling Grade 4 works within. */
  maxQuantity: number;
}

/**
 * The three larger-to-smaller conversions available inside NC.4.MD.1's six
 * sourced units — centimeter, meter, gram, kilogram, liter, milliliter.
 *
 * There is no kilometer here because that unit is not in the sourced list, and
 * no customary pair because NC.4.MD.2 is metric only.
 */
export const PAIRS: Pair[] = [
  { big: 'meters', small: 'centimeters', factor: 100, maxQuantity: 25 },
  { big: 'kilograms', small: 'grams', factor: 1000, maxQuantity: 9 },
  { big: 'liters', small: 'milliliters', factor: 1000, maxQuantity: 9 },
];

const withCommas = (n: number): string => n.toLocaleString('en-US');

/**
 * NC.4.MD.2 — converting a metric measurement from a LARGER unit to a SMALLER
 * unit, which is the only direction the sourced text asks for at this grade.
 *
 * Because the direction is fixed, the conversion is always MULTIPLICATIVE, and
 * the errors worth modelling are errors about WHICH multiplication:
 *
 *   factor 100 (meters to centimeters)
 *     q x 10    — shifted one place too few. No pair among the six sourced
 *                 units converts by ten, so this is a place-value slip, not a
 *                 confusion between two real factors: `wrong-power-of-ten`.
 *     q x 1,000 — that IS a real factor, the one kilograms-to-grams and
 *                 liters-to-milliliters use, applied to the wrong pair:
 *                 `used-wrong-conversion-factor`.
 *   factor 1,000 (kilograms to grams, liters to milliliters)
 *     q x 100    — again a real factor belonging to the other pair:
 *                 `used-wrong-conversion-factor`.
 *     q x 10,000 — one place too far, and no unit pair uses ten thousand:
 *                 `wrong-power-of-ten`.
 *
 * The two tags therefore swap places with the factor, and each one names
 * exactly the error that produces the number beside it. The fourth option is
 * the quantity left alone: `left-the-measurement-unconverted`.
 *
 * WHAT IS DELIBERATELY NOT HERE. The characteristic NC.4.MD.2 error is
 * DIVIDING where multiplying was needed — the sourced wording is "use
 * multiplicative reasoning to convert ... from a larger unit to a smaller
 * unit", so the child who divides has inverted the one direction the standard
 * teaches. That error is modelled in the authored bank instead (g4-md2-01's
 * `0.3 centimeters` and g4-md2-02's `0.006 grams`), because dividing by 1,000
 * produces a value in THOUSANDTHS, and thousandths are NC.5.NBT.3. Two hand-
 * written items can print one on purpose and explain it; a generator printing
 * one on every 1,000-factor draw would put a grade-above place value in front
 * of a child several times a session.
 *
 * Bounds. Every printed number: the quantity is at most 25 (factor 100) or 9
 * (factor 1,000); the answer is at most 2,500 or 9,000; the largest distractor
 * is q x 1,000 = 25,000 for the first and q x 10,000 = 90,000 for the others.
 * All are inside the 100,000 Grade 4 Base Ten works within.
 */
export const md2MetricConvert: QuestionTemplate = {
  id: 'g4.md2.metric-convert',
  standardCode: 'NC.4.MD.2',
  domainId: 'MD',
  difficulty: 'mastery',
  calculatorAllowed: false,
  isStretch: false,

  generate(rng: Rng): GeneratedQuestion {
    const pair = rng.pick(PAIRS);
    const { big, small, factor } = pair;
    const quantity = rng.int(2, pair.maxQuantity);

    const answer = quantity * factor;
    const answerText = withCommas(answer);
    const tooFew = quantity * (factor / 10);
    const tooMany = quantity * (factor * 10);

    const candidates = [
      { text: answerText, isCorrect: true },
      {
        text: withCommas(tooFew),
        isCorrect: false,
        misconception:
          factor === 100 ? 'wrong-power-of-ten' : 'used-wrong-conversion-factor',
      },
      {
        text: withCommas(tooMany),
        isCorrect: false,
        misconception:
          factor === 100 ? 'used-wrong-conversion-factor' : 'wrong-power-of-ten',
      },
      // Copied the number across without converting it at all.
      {
        text: withCommas(quantity),
        isCorrect: false,
        misconception: 'left-the-measurement-unconverted',
      },
    ];

    const texts = candidates.map((c) => c.text);
    if (new Set(texts).size !== texts.length) {
      throw new Error(`g4.md2.metric-convert: option collision [${texts.join(' | ')}]`);
    }

    return {
      prompt: 'Convert this measurement to the smaller unit.',
      promptDetails: `${quantity} ${big} = ? ${small}`,
      options: labelOptions(rng.shuffle(candidates)),
      answerText,
      explanation: {
        stepByStep: [
          `Step 1: 1 ${big.slice(0, -1)} = ${withCommas(factor)} ${small}.`,
          `Step 2: ${small.charAt(0).toUpperCase()}${small.slice(1)} are SMALLER than ${big}, so the same amount takes more of them. The number has to grow, which means multiplying.`,
          `Step 3: ${quantity} × ${withCommas(factor)} = ${answerText}.`,
          `Step 4: ${quantity} ${big} = ${answerText} ${small}.`,
        ],
        conceptSummary:
          'Going from a larger unit to a smaller one always multiplies, because it takes more small units to make the same amount. The only decision left is which factor: 100 between meters and centimeters, 1,000 between kilograms and grams and between liters and milliliters.',
        commonMisconception:
          'Mixing up 100 and 1,000 gives an answer ten times off. Naming the pair out loud first — "meters and centimeters, so a hundred" — settles it before any multiplying starts.',
      },
    };
  },
};
