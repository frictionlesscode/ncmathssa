import type { Rng } from '../../../engine/rng';
import type { QuestionTemplate, GeneratedQuestion } from '../../../engine/template';
import { labelOptions } from '../../../engine/questionModel';
import { unitCount } from './placeValue';

/**
 * NC.1.NBT.6 — "Subtract multiples of 10 in the range 10-90 from multiples
 * of 10 in the range 10-90, explaining the reasoning."
 *
 * Ruling 23-5: both operands are multiples of 10 in 10-90, and the minuend
 * is always at least the subtrahend. NO NEGATIVE DISTRACTORS — negative
 * numbers appear in no NC K-5 standard, so "20 - 50 = -30" is not a value a
 * first-grader can even read, and offering it would leave the item with only
 * three readable options.
 *
 * ---------------------------------------------------------------------------
 *   answer                                                 minuend - subtrahend
 *   added-instead-of-subtracted-the-multiples-of-ten        minuend + subtrahend
 *   subtracted-the-tens-digits-without-the-zeros            (minuend/10) - (subtrahend/10)
 *   restated-a-known-number-instead-of-solving              minuend  OR  subtrahend
 *
 * NO NEGATIVE DISTRACTORS: none of the three distractors above can go
 * negative — the added form only grows, the tens-only form subtracts a
 * smaller digit from a larger one, and restating either operand is itself
 * never negative.
 *
 * NO SIZE TELL: which operand gets restated is a coin flip. Restating the
 * minuend always lands ABOVE the key; restating the subtrahend lands above
 * the key when the subtrahend is the larger half of the minuend and below it
 * otherwise, so the key is not reliably the smallest or the second-smallest
 * option.
 *
 * When minuend equals subtrahend, the answer is 0 and the tens-only
 * distractor also comes out 0, colliding with the key; that draw is left out
 * of the pool rather than resampled, same as any other draw whose four
 * options fail to come out distinct.
 */
export interface SubtractTensDraw {
  minuend: number;
  subtrahend: number;
  restate: 'minuend' | 'subtrahend';
}

export const ALL_SUBTRACT_DRAWS: SubtractTensDraw[] = [];
for (let minuend = 10; minuend <= 90; minuend += 10) {
  for (let subtrahend = 10; subtrahend <= 90; subtrahend += 10) {
    if (subtrahend > minuend) continue;
    for (const restate of ['minuend', 'subtrahend'] as const) {
      ALL_SUBTRACT_DRAWS.push({ minuend, subtrahend, restate });
    }
  }
}

function optionsFor(d: SubtractTensDraw): string[] {
  return [
    `${d.minuend - d.subtrahend}`,
    `${d.minuend + d.subtrahend}`,
    `${d.minuend / 10 - d.subtrahend / 10}`,
    `${d.restate === 'minuend' ? d.minuend : d.subtrahend}`,
  ];
}

export const SUBTRACT_DRAWS: SubtractTensDraw[] = ALL_SUBTRACT_DRAWS.filter(
  (d) => new Set(optionsFor(d)).size === 4,
);

export const nbt6SubtractMultiplesOfTen: QuestionTemplate = {
  id: 'g1.nbt6.subtract-multiples-of-ten',
  standardCode: 'NC.1.NBT.6',
  domainId: 'NBT',
  difficulty: 'mastery',
  calculatorAllowed: false,
  isStretch: false,

  generate(rng: Rng): GeneratedQuestion {
    const d = rng.pick(SUBTRACT_DRAWS);
    const { minuend, subtrahend } = d;
    const [answerText, addedText, tensOnlyText, restatedText] = optionsFor(d);

    const candidates = [
      { text: answerText, isCorrect: true },
      { text: addedText, isCorrect: false, misconception: 'added-instead-of-subtracted-the-multiples-of-ten' },
      { text: tensOnlyText, isCorrect: false, misconception: 'subtracted-the-tens-digits-without-the-zeros' },
      { text: restatedText, isCorrect: false, misconception: 'restated-a-known-number-instead-of-solving' },
    ];

    const texts = candidates.map((c) => c.text);
    if (new Set(texts).size !== texts.length) {
      throw new Error(`g1.nbt6.subtract-multiples-of-ten: option collision [${texts.join(' | ')}]`);
    }

    const minuendTens = minuend / 10;
    const subtrahendTens = subtrahend / 10;
    const diffTens = minuendTens - subtrahendTens;

    return {
      prompt: `Find the difference: ${minuend} − ${subtrahend}.`,
      options: labelOptions(rng.shuffle(candidates)),
      answerText,
      explanation: {
        stepByStep: [
          `Step 1: ${minuend} is ${unitCount(minuendTens, 'ten')}. ${subtrahend} is ${unitCount(subtrahendTens, 'ten')}.`,
          `Step 2: ${unitCount(minuendTens, 'ten')} take away ${unitCount(subtrahendTens, 'ten')} is ${unitCount(diffTens, 'ten')}.`,
          `Step 3: ${unitCount(diffTens, 'ten')} is ${answerText}.`,
        ],
        conceptSummary:
          'Subtracting one multiple of 10 from another works on the tens digits, the same as subtracting ones. 3 tens take away 1 ten is 2 tens, so 30 − 10 = 20.',
        commonMisconception: `Adding instead of subtracting gives ${addedText}, more than either number the problem started with.`,
      },
    };
  },
};
