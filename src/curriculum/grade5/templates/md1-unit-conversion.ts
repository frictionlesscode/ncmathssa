import type { Rng } from '../../../engine/rng';
import type { QuestionTemplate, GeneratedQuestion } from '../../../engine/template';
import { labelOptions } from '../../../engine/questionModel';
import { trimmedDecimal } from './decimalFormat';

interface UnitPair {
  big: string;
  bigSingular: string;
  small: string;
  factor: number;
}

const UNIT_PAIRS: UnitPair[] = [
  { big: 'yards', bigSingular: 'yard', small: 'feet', factor: 3 },
  { big: 'gallons', bigSingular: 'gallon', small: 'quarts', factor: 4 },
  { big: 'quarts', bigSingular: 'quart', small: 'cups', factor: 4 },
  { big: 'feet', bigSingular: 'foot', small: 'inches', factor: 12 },
  { big: 'pounds', bigSingular: 'pound', small: 'ounces', factor: 16 },
  { big: 'meters', bigSingular: 'meter', small: 'centimeters', factor: 100 },
  { big: 'kilometers', bigSingular: 'kilometer', small: 'meters', factor: 1000 },
  { big: 'kilograms', bigSingular: 'kilogram', small: 'grams', factor: 1000 },
  { big: 'liters', bigSingular: 'liter', small: 'milliliters', factor: 1000 },
];

/**
 * NC.5.MD.1 — converting within one measurement system.
 *
 * Every value is carried as an integer number of thousandths and divided
 * only when the text is formatted, so nothing here can drift.
 *
 * The four values are the answer A, the inverted conversion, A/10 and A*10,
 * which are pairwise distinct whenever A > 0 and the inverted value is not
 * A, A/10 or A*10. Inverting swaps a multiply for a divide, so the inverted
 * value is A / factor^2 (converting to the smaller unit) or A * factor^2
 * (to the larger). Since every factor is at least 3, factor^2 is at least 9
 * and is never 1, 10 or 1/10 — no factor squared equals ten — so no pair can
 * coincide. An exhaustive sweep of all 144 draws confirms it, and confirms
 * every value stays an exact number of thousandths.
 *
 * The quantity is chosen so that the inverted division lands exactly: a
 * multiple of the factor for the customary pairs, and any whole number for
 * the metric ones, where dividing by a power of ten is exact anyway.
 */
export const md1UnitConversion: QuestionTemplate = {
  id: 'g5.md1.unit-conversion',
  standardCode: 'NC.5.MD.1',
  domainId: 'MD',
  difficulty: 'mastery',
  calculatorAllowed: true,
  isStretch: false,

  generate(rng: Rng): GeneratedQuestion {
    const pair = rng.pick(UNIT_PAIRS);
    const { big, bigSingular, small, factor } = pair;
    const m = rng.int(2, 9);
    const toSmall = rng.next() < 0.5;
    const powerOfTen = factor % 10 === 0;

    // In thousandths throughout.
    const scale = 1000;
    const quantity = toSmall && powerOfTen ? m * scale : factor * m * scale;
    const answer = toSmall ? quantity * factor : quantity / factor;
    const inverted = toSmall ? quantity / factor : quantity * factor;

    const from = toSmall ? big : small;
    const to = toSmall ? small : big;

    const answerText = trimmedDecimal(answer, -3);

    const candidates = [
      { text: answerText, isCorrect: true },
      { text: trimmedDecimal(inverted, -3), isCorrect: false, misconception: 'unit-conversion-inverted' },
      { text: trimmedDecimal(answer / 10, -3), isCorrect: false, misconception: 'decimal-point-misplaced' },
      { text: trimmedDecimal(answer * 10, -3), isCorrect: false, misconception: 'wrong-power-of-ten' },
    ];

    const texts = candidates.map((c) => c.text);
    if (new Set(texts).size !== texts.length) {
      throw new Error(`g5.md1.unit-conversion: option collision [${texts.join(' | ')}]`);
    }

    const quantityText = trimmedDecimal(quantity, -3);

    return {
      prompt: `Convert the measurement to ${to}.`,
      promptDetails: `${quantityText} ${from} = ? ${to}`,
      options: labelOptions(rng.shuffle(candidates)),
      answerText,
      explanation: {
        stepByStep: [
          `Step 1: 1 ${bigSingular} = ${factor} ${small}.`,
          toSmall
            ? `Step 2: ${small.charAt(0).toUpperCase()}${small.slice(1)} are smaller than ${big}, so the same length needs more of them — multiply by ${factor}.`
            : `Step 2: ${big.charAt(0).toUpperCase()}${big.slice(1)} are larger than ${small}, so the same amount needs fewer of them — divide by ${factor}.`,
          toSmall
            ? `Step 3: ${quantityText} × ${factor} = ${answerText}.`
            : `Step 3: ${quantityText} ÷ ${factor} = ${answerText}.`,
          `Step 4: ${quantityText} ${from} = ${answerText} ${to}.`,
        ],
        conceptSummary:
          'Converting to a smaller unit takes more of them, and converting to a larger unit takes fewer. Deciding which way the number should move before calculating settles whether to multiply or divide.',
        commonMisconception:
          'An answer that moved the wrong way is worth catching before any arithmetic: 5 kilograms cannot become 0.005 grams.',
      },
    };
  },
};
