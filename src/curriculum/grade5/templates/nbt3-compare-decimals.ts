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
 *   whole   w.t          t in 6..8            true greatest
 *   twoDp   w.{b}9       b in 1..t-1          largest LAST digit
 *   threeDp w.1{x}{y}    y in 0..8            largest digit STRING
 *   zeroDp  w.09{z}      z in 0..8            largest once the placeholder
 *                                             zero is dropped
 *
 * Working in thousandths (T = 100t, B = 100b + 90, A = 100 + 10x + y,
 * C = 90 + z):
 *
 *   true greatest   T >= 600, while B <= 100t - 10 < T, A <= 198 and
 *                   C <= 98, so the answer is T at every draw.
 *   digit string    A's digits read 100..198; T reads t <= 8, B reads
 *                   10b + 9 <= 89, and C's leading zero leaves 90 + z <= 98.
 *                   A wins strictly.
 *   last digit      B ends in 9; t <= 8, y <= 8 and z <= 8, so B wins
 *                   strictly.
 *   dropped zero    only C has a zero after the point; re-read it is
 *                   900 + 10z >= 900, above T <= 800, B <= 790 and A <= 198.
 *
 * Each rule therefore selects a different number, and none selects the
 * answer. The four option texts are distinct by construction too: T is the
 * only one printed to tenths, B the only one to hundredths, and A and C are
 * separated by their tenths digit (1 against 0).
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
    const b = rng.int(1, t - 1);
    const x = rng.int(0, 9);
    const y = rng.int(0, 8);
    const z = rng.int(0, 8);

    const answer = `${whole}.${t}`;
    const longestDigitString = `${whole}.1${x}${y}`;
    const largestLastDigit = `${whole}.${b}9`;
    const hiddenByPlaceholderZero = `${whole}.09${z}`;

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

    const texts = candidates.map((c) => c.text);
    if (new Set(texts).size !== texts.length) {
      throw new Error(`g5.nbt3.compare-decimals: option collision [${texts.join(' | ')}]`);
    }

    // One order for both the listed numbers and the options, so the prompt
    // and the choices always agree.
    const ordered = rng.shuffle(candidates);
    const listed = ordered.map((c) => c.text);
    const padded = listed.map((v) => {
      const [w, frac] = v.split('.');
      return `${w}.${frac.padEnd(3, '0')}`;
    });

    return {
      prompt: 'Which decimal is the greatest?',
      promptDetails: listed.join(', '),
      options: labelOptions(ordered),
      answerText: answer,
      explanation: {
        stepByStep: [
          `Step 1: Every number has ${whole} whole${whole === 1 ? '' : 's'}, so the comparison is decided after the decimal point.`,
          `Step 2: Write each one to thousandths so the places line up: ${padded.join(', ')}.`,
          `Step 3: Compare the tenths place first: ${padded.map((v) => v[v.indexOf('.') + 1]).join(', ')}. The largest tenths digit is ${t}.`,
          `Step 4: Only one number has ${t} tenths, so the greatest is ${answer}.`,
        ],
        conceptSummary:
          'A decimal is compared place by place from the left, starting with the largest place. Padding with zeros to the same length makes the places line up without changing any value.',
        commonMisconception:
          'More digits after the point does not mean a larger number: 0.195 is less than 0.8, because tenths outweigh everything to their right.',
      },
    };
  },
};
