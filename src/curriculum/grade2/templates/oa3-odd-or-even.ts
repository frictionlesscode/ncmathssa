import type { Rng } from '../../../engine/rng';
import type { QuestionTemplate, GeneratedQuestion } from '../../../engine/template';
import { labelOptions } from '../../../engine/questionModel';

/**
 * NC.2.OA.3 — "Determine whether a group of objects, within 20, has an odd
 * or even number of members," via pairing objects and counting by 2s.
 *
 * The item is about a GROUP OF OBJECTS that a child pairs up, not four bare
 * numerals (the old "Which of these numbers is EVEN?" invited a last-digit
 * rule and gave all three distractors one generic tag). The four options are
 * sentences, each one a different way to reason about the pairing:
 *
 *   key                  They pair up with <none|1> left over, so N is <even|odd>.
 *   swapped-the-words-odd-and-even
 *                        the pairing is read right, the word is swapped
 *   miscounted-while-pairing-the-objects
 *                        the leftover is claimed wrongly, the conclusion is
 *                        the key's (so it is a false statement, not a slip of
 *                        the answer alone)
 *   judged-the-total-by-the-count-of-pairs
 *                        "They make H pairs, and H is <odd|even>, so N is
 *                        <odd|even>": the parity of the PAIRS is used
 *
 * DRAW SPACE. The pairs-count distractor is only a wrong answer when the
 * parity of H differs from the parity of N. For N = 2H that is H odd, so N is
 * in {2, 6, 10, 14, 18}; for N = 2H + 1 it is H even, so N is in
 * {5, 9, 13, 17} (1 is left out: it makes 0 pairs). That keeps every option
 * false except the key, and it makes exactly two of the four sentences end in
 * "even" and two in "odd", so the conclusion alone never points at the key.
 */
export const EVEN_DRAWS = [2, 6, 10, 14, 18];
export const ODD_DRAWS = [5, 9, 13, 17];

const OBJECTS = ['pencils', 'stickers', 'shells', 'buttons', 'marbles'];
const NAMES = ['Rosa', 'Kai', 'Maya', 'Leo', 'Nia', 'Omar'];

const pairWord = (k: number) => `${k} ${k === 1 ? 'pair' : 'pairs'}`;

export const oa3OddOrEven: QuestionTemplate = {
  id: 'g2.oa3.odd-or-even',
  standardCode: 'NC.2.OA.3',
  domainId: 'OA',
  difficulty: 'mastery',
  calculatorAllowed: false,
  isStretch: false,
  contentVersion: 2, // rebuilt: objects and sentence options instead of four numerals

  generate(rng: Rng): GeneratedQuestion {
    const wantEven = rng.pick([true, false]);
    const n = rng.pick(wantEven ? EVEN_DRAWS : ODD_DRAWS);
    const name = rng.pick(NAMES);
    const objects = rng.pick(OBJECTS);

    const pairs = Math.floor(n / 2);
    const word = wantEven ? 'even' : 'odd';
    const other = wantEven ? 'odd' : 'even';
    const leftKey = wantEven ? 'none left over' : '1 left over';
    const leftWrong = wantEven ? '1 left over' : 'none left over';
    // By construction the parity of the pairs is the OTHER word.
    const pairsParity = pairs % 2 === 0 ? 'even' : 'odd';

    const answerText = `They pair up with ${leftKey}, so ${n} is ${word}.`;

    const candidates = [
      { text: answerText, isCorrect: true },
      {
        text: `They pair up with ${leftKey}, so ${n} is ${other}.`,
        isCorrect: false,
        misconception: 'swapped-the-words-odd-and-even',
      },
      {
        text: `They pair up with ${leftWrong}, so ${n} is ${word}.`,
        isCorrect: false,
        misconception: 'miscounted-while-pairing-the-objects',
      },
      {
        text: `They make ${pairWord(pairs)}, and ${pairs} is ${pairsParity}, so ${n} is ${pairsParity}.`,
        isCorrect: false,
        misconception: 'judged-the-total-by-the-count-of-pairs',
      },
    ];

    const texts = candidates.map((x) => x.text);
    if (new Set(texts).size !== texts.length) {
      throw new Error(`g2.oa3.odd-or-even: option collision [${texts.join(' | ')}]`);
    }

    return {
      prompt: `${name} has ${n} ${objects}. ${name} puts them into pairs. Which sentence is true?`,
      options: labelOptions(rng.shuffle(candidates)),
      answerText,
      explanation: {
        stepByStep: [
          `Step 1: To check odd or even, put the ${objects} into pairs and see if any is left without a partner.`,
          `Step 2: ${n} ${objects} make ${pairWord(pairs)}, with ${wantEven ? 'none left over' : '1 left over'}.`,
          wantEven
            ? 'Step 3: Nothing is left over, so the number is even.'
            : 'Step 3: One is left over, so the number is odd.',
          `Step 4: ${answerText}`,
        ],
        conceptSummary:
          'Pairing objects up and checking for a leftover is a direct test for odd or even: nothing left over means even, and one object left alone means odd.',
        commonMisconception: `Whether the number of pairs is odd or even does not decide it: the number of pairs, ${pairs}, is ${pairsParity}, but ${n} is ${word}. Look for an object left without a partner.`,
      },
    };
  },
};
