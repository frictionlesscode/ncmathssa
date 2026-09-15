import type { Rng } from '../../../engine/rng';
import type { QuestionTemplate, GeneratedQuestion } from '../../../engine/template';
import { labelOptions } from '../../../engine/questionModel';

/**
 * NC.2.NBT.1 — "Understand that the three digits of a three-digit number
 * represent amounts of hundreds, tens, and ones."
 *
 * The standard has three keyConcepts. Two of them — unitizing ten tens into a
 * hundred, and 100 … 900 as N hundreds with 0 tens and 0 ones — are single
 * facts a child either knows or does not, and swapping the numbers changes
 * nothing, so they are authored by hand (g2-nbt1-01, g2-nbt1-02). The third,
 * "compose and decompose numbers using VARIOUS GROUPINGS of hundreds, tens,
 * and ones", is the one that genuinely needs fresh numbers: the trade has to
 * be carried out, not recalled, and a child who has only ever seen 243 traded
 * will not transfer it.
 *
 * ---------------------------------------------------------------------------
 * Construction. A number is given as h hundreds, t tens, o ones, and one
 * hundred is traded for ten tens:
 *
 *   h in [2,8]   so h - 1 is still at least 1 and the traded grouping is a
 *                real three-part grouping rather than "0 hundreds".
 *   t in [1,8]   so t + 10 is 11..18, always two digits and never equal to
 *                t + 1, and t itself is never 0 (a grouping with 0 tens makes
 *                the "traded for one ten" distractor read oddly).
 *   o in [1,8]   ones play no part in the trade; they are non-zero only so the
 *                grouping reads as a genuine three-part one.
 *
 * The number is n = 100h + 10t + o, so n runs from 211 to 888.
 *
 *   answer                                  (h-1) H, (t+10) T, o O   = n
 *   lost-the-hundred-in-the-trade           (h-1) H,  t     T, o O   = n - 100
 *   kept-the-hundred-and-the-ten-tens-both   h    H, (t+10) T, o O   = n + 100
 *   traded-a-hundred-for-one-ten            (h-1) H, (t+1)  T, o O   = n - 90
 *
 * Distinctness is by construction and needs no check at draw time: the four
 * option texts differ in their hundreds count (h-1 vs h) or in their tens
 * count (t, t+1, t+10, all distinct for every t), and the four VALUES are
 * n, n-100, n+100 and n-90, four fixed and different offsets. The sibling test
 * sweeps the whole 7 x 8 x 8 = 448-question draw space and checks both.
 */
export const nbt1VariousGroupings: QuestionTemplate = {
  id: 'g2.nbt1.various-groupings',
  standardCode: 'NC.2.NBT.1',
  domainId: 'NBT',
  difficulty: 'mastery',
  calculatorAllowed: false,
  isStretch: false,

  generate(rng: Rng): GeneratedQuestion {
    const h = rng.int(2, 8);
    const t = rng.int(1, 8);
    const o = rng.int(1, 8);

    // A seven-year-old reads these, so "1 tens" is not acceptable output.
    const plural = (count: number, word: string) => `${count} ${word}${count === 1 ? '' : 's'}`;
    const hundredsWord = (count: number) => plural(count, 'hundred');
    const grouping = (hh: number, tt: number) =>
      `${hundredsWord(hh)}, ${plural(tt, 'ten')}, and ${plural(o, 'one')}`;

    const answerText = grouping(h - 1, t + 10);

    const candidates = [
      { text: answerText, isCorrect: true },
      // n - 100: the hundred was given up but the ten tens it turned into were
      // never counted.
      { text: grouping(h - 1, t), isCorrect: false, misconception: 'lost-the-hundred-in-the-trade' },
      // n + 100: the ten tens arrived but the hundred stayed as well.
      {
        text: grouping(h, t + 10),
        isCorrect: false,
        misconception: 'kept-the-hundred-and-the-ten-tens-both',
      },
      // n - 90: the hundred was traded for a single ten instead of ten tens.
      { text: grouping(h - 1, t + 1), isCorrect: false, misconception: 'traded-a-hundred-for-one-ten' },
    ];

    const texts = candidates.map((c) => c.text);
    if (new Set(texts).size !== texts.length) {
      throw new Error(`g2.nbt1.various-groupings: option collision [${texts.join(' | ')}]`);
    }

    return {
      prompt: 'Trade one hundred for ten tens. Which grouping shows the same number?',
      promptDetails: `${hundredsWord(h)}, ${plural(t, 'ten')}, and ${plural(o, 'one')}`,
      options: labelOptions(rng.shuffle(candidates)),
      answerText,
      explanation: {
        stepByStep: [
          `Step 1: The number starts as ${hundredsWord(h)}, ${plural(t, 'ten')}, and ${plural(o, 'one')}, which is ${100 * h + 10 * t + o}.`,
          `Step 2: One hundred is traded away, so ${hundredsWord(h - 1)} ${h - 1 === 1 ? 'is' : 'are'} left.`,
          `Step 3: That hundred comes back as ten tens, so ${t} + 10 = ${t + 10} tens. The ones do not change at all.`,
          `Step 4: The same number, grouped a new way, is ${answerText}.`,
        ],
        conceptSummary:
          'One hundred and ten tens are worth exactly the same, so trading one for the other changes how a number is written without changing the number. This is the same trade that regrouping in addition and subtraction relies on.',
        commonMisconception: `A trade has two halves. Writing ${grouping(h - 1, t)} does the first half only and loses 100; writing ${grouping(h, t + 10)} does the second half only and counts the same hundred twice.`,
      },
    };
  },
};
