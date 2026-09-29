import type { Rng } from '../../../engine/rng';
import type { QuestionTemplate, GeneratedQuestion } from '../../../engine/template';
import { labelOptions } from '../../../engine/questionModel';
import { unitCount, tensAndOnes } from './placeValue';

/**
 * NC.1.NBT.2 — "Understand that the two digits of a two-digit number
 * represent amounts of tens and ones." Ruling 23-7: needs a TEEN item (tens
 * digit 1, the shape "13 read as 31" lives in) as well as a decade item; the
 * draw table below includes both, since tens ranges from 1.
 *
 * Neither digit is 0 (a decade is the authored bank's) and the two digits
 * always differ, so every draw's swap really is a different number.
 *
 * ---------------------------------------------------------------------------
 *   answer                                          10*tens + ones
 *   swapped-the-tens-and-the-ones                    10*ones + tens
 *   used-the-tens-digit-as-ones                       tens + ones
 *   wrote-each-part-of-the-number-side-by-side        "{10*tens}{ones}"
 *
 * NO SIZE TELL: the swap sits above the key when ones > tens and below it
 * otherwise, so the key's rank moves with the draw.
 */
export interface TensOnesDraw {
  tens: number;
  ones: number;
}

export const TENS_AND_ONES: TensOnesDraw[] = [];
for (let tens = 1; tens <= 9; tens++) {
  for (let ones = 1; ones <= 9; ones++) {
    if (ones !== tens) TENS_AND_ONES.push({ tens, ones });
  }
}

export const nbt2TensAndOnes: QuestionTemplate = {
  id: 'g1.nbt2.tens-and-ones',
  standardCode: 'NC.1.NBT.2',
  domainId: 'NBT',
  difficulty: 'mastery',
  calculatorAllowed: false,
  isStretch: false,

  generate(rng: Rng): GeneratedQuestion {
    const { tens, ones } = rng.pick(TENS_AND_ONES);
    const n = 10 * tens + ones;

    const answerText = `${n}`;
    const candidates = [
      { text: answerText, isCorrect: true },
      { text: `${10 * ones + tens}`, isCorrect: false, misconception: 'swapped-the-tens-and-the-ones' },
      { text: `${tens + ones}`, isCorrect: false, misconception: 'used-the-tens-digit-as-ones' },
      { text: `${10 * tens}${ones}`, isCorrect: false, misconception: 'wrote-each-part-of-the-number-side-by-side' },
    ];

    const texts = candidates.map((c) => c.text);
    if (new Set(texts).size !== texts.length) {
      throw new Error(`g1.nbt2.tens-and-ones: option collision [${texts.join(' | ')}]`);
    }

    return {
      prompt: `What number is ${unitCount(tens, 'ten')} and ${unitCount(ones, 'one')}?`,
      options: labelOptions(rng.shuffle(candidates)),
      answerText,
      explanation: {
        stepByStep: [
          `Step 1: ${tensAndOnes(n)} is written ${n}.`,
          `Step 2: ${unitCount(tens, 'ten')} is ${10 * tens}. ${unitCount(ones, 'one')} is ${ones}.`,
          `Step 4: The number is ${n}.`,
        ],
        conceptSummary:
          'A two-digit number is made of tens and ones. The tens digit says how many groups of ten, and the ones digit says how many are left over.',
        commonMisconception: `Swapping the digits gives ${10 * ones + tens}, which trades the tens and the ones.`,
      },
    };
  },
};
