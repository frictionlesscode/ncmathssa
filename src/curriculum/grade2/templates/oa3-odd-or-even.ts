import type { Rng } from '../../../engine/rng';
import type { QuestionTemplate, GeneratedQuestion } from '../../../engine/template';
import { labelOptions } from '../../../engine/questionModel';

const EVENS = [2, 4, 6, 8, 10, 12, 14, 16, 18, 20];
const ODDS = [1, 3, 5, 7, 9, 11, 13, 15, 17, 19];

/**
 * NC.2.OA.3 — "Determine whether a group of objects, within 20, has an odd
 * or even number of members," via pairing objects and counting by 2s.
 *
 * Covers the pairing/counting-by-2s half of the standard with fresh numbers
 * on every draw; the third bullet (writing an even number as a sum of two
 * equal addends) is a distinct skill authored by hand in
 * ../authored.oa.ts (g2-oa3-04), per ruling 17-2 — a generator that only
 * varied the number would not exercise writing the equation.
 *
 * Asks for EVEN about half the time and ODD the other half, rather than
 * always the same direction, so a child cannot learn "always pick the
 * biggest number" or any other position-based shortcut. All four candidate
 * numbers are drawn from 1-20 and are pairwise distinct by construction: the
 * three wrong numbers are a shuffled sample of the 10 numbers of the WRONG
 * parity, which can never collide with the correct number (which has the
 * target parity) or with each other (sampled without replacement).
 */
export const oa3OddOrEven: QuestionTemplate = {
  id: 'g2.oa3.odd-or-even',
  standardCode: 'NC.2.OA.3',
  domainId: 'OA',
  difficulty: 'mastery',
  calculatorAllowed: false,
  isStretch: false,

  generate(rng: Rng): GeneratedQuestion {
    const wantEven = rng.pick([true, false]);
    const correctPool = wantEven ? EVENS : ODDS;
    const wrongPool = wantEven ? ODDS : EVENS;

    const correctNum = rng.pick(correctPool);
    const wrongNums = rng.shuffle(wrongPool).slice(0, 3);

    const answerText = `${correctNum}`;
    const parityWord = wantEven ? 'even' : 'odd';

    const candidates = [
      { text: answerText, isCorrect: true },
      ...wrongNums.map((n) => ({
        text: `${n}`,
        isCorrect: false,
        misconception: 'miscounted-while-pairing-the-objects',
      })),
    ];

    const texts = candidates.map((x) => x.text);
    if (new Set(texts).size !== texts.length) {
      throw new Error(`g2.oa3.odd-or-even: option collision [${texts.join(' | ')}]`);
    }

    const half = Math.floor(correctNum / 2);

    return {
      prompt: `Which of these numbers is ${parityWord.toUpperCase()}?`,
      options: labelOptions(rng.shuffle(candidates)),
      answerText,
      explanation: {
        stepByStep: [
          `Step 1: A number is even if a group that size can be paired up with none left over, and odd if one is always left over.`,
          wantEven
            ? `Step 2: ${correctNum} objects pair up into exactly ${half} pairs, with none left over.`
            : `Step 2: ${correctNum} objects pair up into ${half} pairs, with 1 object left over.`,
          `Step 3: The other numbers in the list are the opposite: each one always has ${wantEven ? 'one left over' : 'none left over'} when paired up.`,
          `Step 4: The ${parityWord} number is ${answerText}.`,
        ],
        conceptSummary:
          'Pairing objects up and checking for a leftover is a direct test for odd or even: nothing left over means even, and one object left alone means odd.',
        commonMisconception:
          'A quick guess based on how big a number looks, instead of actually pairing it up, is the fastest way to mix up odd and even.',
      },
    };
  },
};
