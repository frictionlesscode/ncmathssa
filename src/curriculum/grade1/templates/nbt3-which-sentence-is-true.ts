import type { Rng } from '../../../engine/rng';
import type { QuestionTemplate, GeneratedQuestion } from '../../../engine/template';
import { labelOptions } from '../../../engine/questionModel';
import { unitCount } from './placeValue';

/**
 * NC.1.NBT.3 — "Compare two two-digit numbers based on the value of the tens
 * and ones digits, recording the results of comparisons with the symbols
 * >, =, and <."
 *
 * Ruling 23-6: a symbol has only three possible answers, so this is asked as
 * "Which sentence is true?" with four complete comparison sentences, exactly
 * one of them true. The two numbers are always the same two digits, swapped
 * (43 and 34), so comparing digit by digit without minding PLACE goes wrong
 * every time, and reading the two numbers as equal because they share the
 * same digits is a live trap.
 *
 * ---------------------------------------------------------------------------
 *   answer                             greater > less  or  less < greater
 *   compared-the-wrong-place-first     less > greater   (the ones-bigger number
 *                                                        called greater)
 *   reversed-the-inequality-symbol     greater < less   (right numbers, wrong
 *                                                        symbol)
 *   same-digits-read-as-the-same-number  first = second  (same digits, so
 *                                                          "the same number")
 *
 * NO SIZE TELL: the true sentence is written as "greater > less" or
 * "less < greater" on a coin flip, and the numbers are named in whichever
 * order the draw put them, so the key is never always the first-named number
 * or always the ">" sentence.
 */
export interface CompareDraw {
  /** Tens digit of the number named first in the prompt. */
  d1: number;
  /** Tens digit of the number named second (also the first number's ones digit). */
  d2: number;
  keyForm: 'gt' | 'lt';
}

export const COMPARE_DRAWS: CompareDraw[] = [];
for (let d1 = 1; d1 <= 9; d1++) {
  for (let d2 = 1; d2 <= 9; d2++) {
    if (d1 === d2) continue;
    for (const keyForm of ['gt', 'lt'] as const) {
      COMPARE_DRAWS.push({ d1, d2, keyForm });
    }
  }
}

export const nbt3WhichSentenceIsTrue: QuestionTemplate = {
  id: 'g1.nbt3.which-sentence-is-true',
  standardCode: 'NC.1.NBT.3',
  domainId: 'NBT',
  difficulty: 'mastery',
  calculatorAllowed: false,
  isStretch: false,

  generate(rng: Rng): GeneratedQuestion {
    const { d1, d2, keyForm } = rng.pick(COMPARE_DRAWS);
    const first = 10 * d1 + d2;
    const second = 10 * d2 + d1;
    const greater = Math.max(first, second);
    const less = Math.min(first, second);

    const trueText = keyForm === 'gt' ? `${greater} > ${less}` : `${less} < ${greater}`;
    const candidates = [
      { text: trueText, isCorrect: true },
      { text: `${less} > ${greater}`, isCorrect: false, misconception: 'compared-the-wrong-place-first' },
      { text: `${greater} < ${less}`, isCorrect: false, misconception: 'reversed-the-inequality-symbol' },
      { text: `${first} = ${second}`, isCorrect: false, misconception: 'same-digits-read-as-the-same-number' },
    ];

    const texts = candidates.map((c) => c.text);
    if (new Set(texts).size !== texts.length) {
      throw new Error(`g1.nbt3.which-sentence-is-true: option collision [${texts.join(' | ')}]`);
    }

    return {
      prompt: `Which sentence about ${first} and ${second} is true?`,
      options: labelOptions(rng.shuffle(candidates)),
      answerText: trueText,
      explanation: {
        stepByStep: [
          `Step 1: ${greater} has ${unitCount(Math.floor(greater / 10), 'ten')} and ${less} has ${unitCount(Math.floor(less / 10), 'ten')}.`,
          `Step 2: ${Math.floor(greater / 10)} is more tens than ${Math.floor(less / 10)}, so ${greater} is greater than ${less}.`,
          `Step 3: The true sentence is ${trueText}.`,
        ],
        conceptSummary:
          'Comparing two-digit numbers starts with the tens digit, not the ones digit. Whichever number has more tens is the greater one, no matter what the ones digits say.',
        commonMisconception: `Comparing the ones digits first would call ${less} the greater number, but the tens digit decides a comparison first.`,
      },
    };
  },
};
