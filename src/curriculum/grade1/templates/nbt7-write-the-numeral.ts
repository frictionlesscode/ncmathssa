import type { Rng } from '../../../engine/rng';
import type { QuestionTemplate, GeneratedQuestion } from '../../../engine/template';
import { labelOptions } from '../../../engine/questionModel';
import { unitCount, numberName } from './placeValue';

/**
 * NC.1.NBT.7 — "Read and write numerals, and represent a number of objects
 * with a written numeral, to 100."
 *
 * Ruling 23-1: reading and writing numerals is NC.1.NBT.7, not NC.1.NBT.1
 * (counting), and ruling 23-4 keeps its range to 0-100, never inheriting
 * NC.1.NBT.1's 150. This draws two-digit numbers with two different, nonzero
 * digits, so the number name always hyphenates ("forty-seven") and a swap
 * always makes a different, valid number.
 *
 * ---------------------------------------------------------------------------
 *   answer                                       10*tens + ones
 *   swapped-the-tens-and-the-ones                 10*ones + tens
 *   wrote-each-part-of-the-number-side-by-side    "{10*tens}{ones}"
 *   left-off-part-of-the-number-name              10*tens  OR  ones (both offered
 *                                                  across the draw space)
 */
export interface NumeralDraw {
  tens: number;
  ones: number;
  leftOff: 'tens' | 'ones';
}

export const NUMERAL_DRAWS: NumeralDraw[] = [];
for (let tens = 2; tens <= 9; tens++) {
  for (let ones = 1; ones <= 9; ones++) {
    if (ones === tens) continue;
    for (const leftOff of ['tens', 'ones'] as const) {
      NUMERAL_DRAWS.push({ tens, ones, leftOff });
    }
  }
}

export const nbt7WriteTheNumeral: QuestionTemplate = {
  id: 'g1.nbt7.write-the-numeral',
  standardCode: 'NC.1.NBT.7',
  domainId: 'NBT',
  difficulty: 'mastery',
  calculatorAllowed: false,
  isStretch: false,

  generate(rng: Rng): GeneratedQuestion {
    const { tens, ones, leftOff } = rng.pick(NUMERAL_DRAWS);
    const n = 10 * tens + ones;
    const name = numberName(n);
    const [tensWord, onesWord] = name.split('-');

    const answerText = `${n}`;
    const candidates = [
      { text: answerText, isCorrect: true },
      { text: `${10 * ones + tens}`, isCorrect: false, misconception: 'swapped-the-tens-and-the-ones' },
      { text: `${10 * tens}${ones}`, isCorrect: false, misconception: 'wrote-each-part-of-the-number-side-by-side' },
      leftOff === 'tens'
        ? { text: `${10 * tens}`, isCorrect: false, misconception: 'left-off-part-of-the-number-name' }
        : { text: `${ones}`, isCorrect: false, misconception: 'left-off-part-of-the-number-name' },
    ];

    const texts = candidates.map((c) => c.text);
    if (new Set(texts).size !== texts.length) {
      throw new Error(`g1.nbt7.write-the-numeral: option collision [${texts.join(' | ')}]`);
    }

    return {
      prompt: `Which number is ${name}?`,
      options: labelOptions(rng.shuffle(candidates)),
      answerText,
      explanation: {
        stepByStep: [
          `Step 1: ${tensWord[0].toUpperCase()}${tensWord.slice(1)} is ${unitCount(tens, 'ten')}. ${unitCount(tens, 'ten')} is ${10 * tens}.`,
          `Step 2: ${onesWord[0].toUpperCase()}${onesWord.slice(1)} is ${unitCount(ones, 'one')}.`,
          `Step 3: ${unitCount(tens, 'ten')} and ${unitCount(ones, 'one')} is written ${n}.`,
        ],
        conceptSummary:
          'A number name has a tens word and a ones word. Writing the numeral means writing how many tens, then how many ones, as one number.',
        commonMisconception: `Swapping the digits writes ${10 * ones + tens}, which trades what the tens word and the ones word each stand for.`,
      },
    };
  },
};
