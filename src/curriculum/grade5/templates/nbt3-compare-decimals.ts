import type { Rng } from '../../../engine/rng';
import type { QuestionTemplate, GeneratedQuestion } from '../../../engine/template';
import { labelOptions } from '../../../engine/questionModel';

/**
 * NC.5.NBT.3 — comparing decimals to thousandths.
 *
 * Four decimals share a whole-number part, so the comparison can only be
 * settled in the decimal places. Each wrong option is the number a specific
 * faulty comparison rule picks as the greatest:
 *
 *   answer   w.{t}{a}     t in 6..8, a in 1..8   true greatest
 *   digits   w.{t}0{z}    z in 0..8              largest digit STRING
 *   lastDig  w.{b}9       b in 1..t-1            largest LAST digit
 *   zeroLed  w.09{c}      c in 0..8              largest once the
 *                                                placeholder zero is dropped
 *
 * The `digits` option deliberately shares the answer's TENTHS digit. An
 * earlier version drew the answer as w.t with every distractor's tenths digit
 * strictly lower, so the comparison was settled in the tenths place on every
 * one of its draws: the numbers reached thousandths, but a student never had
 * to read past the first decimal place, which is easier than the standard
 * this item is filed under. Now the answer and `digits` tie at tenths and
 * separate at hundredths (a >= 1 against 0), so the comparison always runs at
 * least one place deeper. That is also the classic shape of the error the tag
 * names: 7.604 judged greater than 7.65 because 604 beats 65.
 *
 * Working in thousandths (answer = 100t + 10a, digits = 100t + z,
 * lastDig = 100b + 90, zeroLed = 90 + c):
 *
 *   true greatest  answer >= 610. digits = 100t + z <= 100t + 8 < answer,
 *                  since a >= 1 puts the answer at 100t + 10 or more;
 *                  lastDig <= 100t - 10 < answer; zeroLed <= 98. The answer
 *                  wins strictly at every draw.
 *   digit string   digits reads 100t + z, in 600..808, while the answer reads
 *                  10t + a <= 88, lastDig reads 10b + 9 <= 89, and zeroLed's
 *                  leading zero leaves 90 + c <= 98. Strict win.
 *   last digit     lastDig ends in 9, and a <= 8, z <= 8, c <= 8. Strict win.
 *   dropped zero   only zeroLed has a zero straight after the point; re-read
 *                  it is 900 + 10c >= 900, above the answer's ceiling of 880,
 *                  digits' 808 and lastDig's 790. Strict win.
 *
 * Each rule therefore selects a different number, and none selects the
 * answer. The four texts are distinct by construction too: the two printed to
 * hundredths differ in their tenths digit (t >= 6 against b <= t - 1), and so
 * do the two printed to thousandths (t against 0).
 *
 * A sweep of all 104,976 draws confirms it: no duplicate text, every rule a
 * strict unique maximum, and a tenths tie on every draw.
 */
export const nbt3CompareDecimals: QuestionTemplate = {
  id: 'g5.nbt3.compare-decimals',
  standardCode: 'NC.5.NBT.3',
  domainId: 'NBT',
  difficulty: 'mastery',
  calculatorAllowed: false,
  isStretch: false,

  generate(rng: Rng): GeneratedQuestion {
    const whole = rng.int(1, 9);
    const t = rng.int(6, 8);
    // Non-zero, so the answer sits above the option that ties it at tenths,
    // and at most 8, so that option cannot also win the last-digit rule.
    const a = rng.int(1, 8);
    const b = rng.int(1, t - 1);
    const z = rng.int(0, 8);
    const c = rng.int(0, 8);

    const answer = `${whole}.${t}${a}`;
    const longestDigitString = `${whole}.${t}0${z}`;
    const largestLastDigit = `${whole}.${b}9`;
    const hiddenByPlaceholderZero = `${whole}.09${c}`;

    const candidates = [
      { text: answer, isCorrect: true },
      { text: longestDigitString, isCorrect: false, misconception: 'compared-by-digit-count' },
      {
        text: largestLastDigit,
        isCorrect: false,
        misconception: 'compared-decimals-right-to-left',
      },
      {
        text: hiddenByPlaceholderZero,
        isCorrect: false,
        misconception: 'omitted-placeholder-zero',
      },
    ];

    const texts = candidates.map((c2) => c2.text);
    if (new Set(texts).size !== texts.length) {
      throw new Error(`g5.nbt3.compare-decimals: option collision [${texts.join(' | ')}]`);
    }

    // One order for both the listed numbers and the options, so the prompt
    // and the choices always agree.
    const ordered = rng.shuffle(candidates);
    const listed = ordered.map((c2) => c2.text);
    const padded = listed.map((v) => {
      const [w, frac] = v.split('.');
      return `${w}.${frac.padEnd(3, '0')}`;
    });

    return {
      prompt: 'Which of these decimals is the greatest?',
      promptDetails: listed.join(', '),
      options: labelOptions(ordered),
      answerText: answer,
      explanation: {
        stepByStep: [
          `Step 1: Every number has ${whole} whole${whole === 1 ? '' : 's'}, so the comparison is decided after the decimal point.`,
          `Step 2: Write each one to thousandths so the places line up: ${padded.join(', ')}.`,
          `Step 3: Compare the tenths place first: ${padded.map((v) => v[v.indexOf('.') + 1]).join(', ')}. The largest tenths digit is ${t}, and two numbers have it — ${answer} and ${longestDigitString}.`,
          `Step 4: Those two tie at tenths, so compare hundredths: ${a} against 0. Since ${a} is greater, the greatest number is ${answer}.`,
        ],
        conceptSummary:
          'A decimal is compared place by place from the left, and only a tie moves the comparison one place further right. Padding with zeros to the same length makes the places line up without changing any value.',
        commonMisconception:
          'More digits after the point does not mean a larger number: 7.604 is less than 7.65, because the hundredths place decides it once the tenths match.',
      },
    };
  },
};
