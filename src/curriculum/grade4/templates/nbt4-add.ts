import type { Rng } from '../../../engine/rng';
import type { QuestionTemplate, GeneratedQuestion } from '../../../engine/template';
import { labelOptions } from '../../../engine/questionModel';
import { fmt } from './numberFormat';

/**
 * NC.4.NBT.4 — ADD multi-digit whole numbers to 100,000 by the standard
 * algorithm.
 *
 * Addition and subtraction are separate templates on purpose, even though
 * NC.4.NBT.4 names both. `ReviewKey` is seedless (see questionModel.ts), and
 * the session composer re-realizes a due review at a fresh random seed — so one
 * template covering both operations files ONE review key for two skills, and a
 * child who missed a borrow could be reviewed with an addition item, promoted
 * for getting it right, and retired as mastered without the borrowing ever
 * being retested. The tell is that the two operations emit disjoint
 * misconception sets. Mastery is tracked per standard, so splitting costs
 * nothing there. See ./nbt4-subtract.ts for the other half.
 *
 * Digits are drawn so the ones column carries (n0 + m0 >= 10) and no other
 * column does. The tens and hundreds are held to a sum of 8 rather than 9, so
 * that a carry MISPLACED into the hundreds cannot cascade any further and the
 * distractor stays exactly one slip from the answer.
 *
 *   answer       n + m
 *   no carry     answer - 10    the ten was never carried into the tens column
 *   wrong column answer + 90    the carry was written above the hundreds column
 *                               instead of the tens: -10 in the tens, +100 in
 *                               the hundreds
 *   subtracted   answer - 2m    addition read as subtraction
 *
 * Pairwise: -10, +90 and -2m are three non-zero gaps from the answer (m >= 1000);
 * -10 != 90; -10 = -2m needs m = 5; 90 = -2m needs m negative. So the four are
 * distinct for every m >= 1000 with nothing excluded at all. The gaps are
 * functions of m alone, so the collision space is m in [1000, 9999] and an
 * exhaustive sweep of all 9,000 values confirms it.
 *
 * Nothing printed in the item runs past the standard's ceiling of 100,000.
 * The largest number the item can show is the "wrong column" distractor, and
 * the column caps bound the answer at 9*10^4 + 9*10^3 + 8*10^2 + 8*10 + 18 =
 * 99,898, so that distractor is at most 99,988.
 */
export const nbt4Add: QuestionTemplate = {
  id: 'g4.nbt4.add',
  standardCode: 'NC.4.NBT.4',
  domainId: 'NBT',
  difficulty: 'mastery',
  calculatorAllowed: false,
  isStretch: false,

  generate(rng: Rng): GeneratedQuestion {
    const n0 = rng.int(1, 9);
    const m0 = rng.int(10 - n0, 9);
    const n1 = rng.int(0, 8);
    const m1 = rng.int(0, 8 - n1);
    const n2 = rng.int(0, 8);
    const m2 = rng.int(0, 8 - n2);
    const m3 = rng.int(1, 9);
    const n3 = rng.int(0, 9 - m3);
    const n4 = rng.int(1, 9);

    const n = n4 * 10000 + n3 * 1000 + n2 * 100 + n1 * 10 + n0;
    const m = m3 * 1000 + m2 * 100 + m1 * 10 + m0;

    const answer = n + m;
    const noCarry = answer - 10;
    const wrongColumn = answer + 90;
    const subtractedInstead = n - m;

    const answerText = fmt(answer);

    const candidates = [
      { text: answerText, isCorrect: true },
      // The ones column gave n0 + m0, so its ten belonged in the tens column;
      // the tens column was added as n1 + m1 with nothing carried in, leaving
      // the total ten short.
      { text: fmt(noCarry), isCorrect: false, misconception: 'added-without-carrying' },
      // The carried ten was written above the hundreds column instead of the
      // tens: the tens come out ten too small and the hundreds a hundred too
      // large, a net ninety too much.
      {
        text: fmt(wrongColumn),
        isCorrect: false,
        misconception: 'carried-into-the-wrong-column',
      },
      // n - m: the two numbers were subtracted.
      {
        text: fmt(subtractedInstead),
        isCorrect: false,
        misconception: 'subtracted-instead-of-added',
      },
    ];

    const texts = candidates.map((c) => c.text);
    if (new Set(texts).size !== texts.length) {
      throw new Error(`g4.nbt4.add: option collision [${texts.join(' | ')}]`);
    }

    return {
      prompt: 'Add.',
      promptDetails: `${fmt(n)} + ${fmt(m)}`,
      options: labelOptions(rng.shuffle(candidates)),
      answerText,
      explanation: {
        stepByStep: [
          `Step 1: Line the numbers up by place value and start at the ones: ${n0} + ${m0} = ${n0 + m0}.`,
          `Step 2: That is more than 9, so write ${n0 + m0 - 10} in the ones place and carry the ten into the TENS column.`,
          `Step 3: ${n1} + ${m1} + 1 = ${n1 + m1 + 1} tens; then ${n2} + ${m2} = ${n2 + m2} hundreds, ${n3} + ${m3} = ${n3 + m3} thousands, and ${n4} ten thousands.`,
          `Step 4: ${fmt(n)} + ${fmt(m)} = ${answerText}.`,
        ],
        conceptSummary:
          'A carry is ten of one place becoming one of the next place left — which is why it lands in the column immediately beside it and never one column further along.',
        commonMisconception:
          `Both carry slips leave the ones digit correct and the TENS digit wrong, so re-adding the ones column will not find either one. The check that does is to re-add the tens column and ask whether the ten from ${n0} + ${m0} was counted there — ${n1} + ${m1} + 1 = ${n1 + m1 + 1}, not ${n1 + m1}.`,
      },
    };
  },
};
