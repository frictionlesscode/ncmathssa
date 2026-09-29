import type { Rng } from '../../../engine/rng';
import type { QuestionTemplate, GeneratedQuestion } from '../../../engine/template';
import { labelOptions } from '../../../engine/questionModel';

/**
 * NC.4.NF.7 — compare two decimals to hundredths by reasoning about their
 * size, and record the result. Four decimals share a whole-number part, so the
 * comparison can only be settled after the point; nothing here reaches
 * thousandths, which is NC.5.NBT.3 a grade above.
 *
 * Each wrong option is the decimal a specific faulty rule picks as the
 * greatest, and the answer is deliberately the SHORTEST of the four, which is
 * the shape of the error the brief names: 0.5 judged smaller than 0.25 because
 * it has fewer digits.
 *
 *   answer     w.t        t in 3..7           true greatest
 *   digits     w.{t-1}q   q in 0..8           largest digit STRING after the
 *                                             point
 *   lastDig    w.e9       e in 1..t-2         largest LAST digit
 *   zeroLed    w.0z       z in t+1..8         largest once the placeholder
 *                                             zero is dropped
 *
 * Working in hundredths (answer = 10t, digits = 10(t-1) + q, lastDig = 10e + 9,
 * zeroLed = z):
 *
 *   true greatest  answer - digits = 10 - q >= 2, since q <= 8;
 *                  digits - lastDig = 10(t-1-e) + q - 9 >= 1, since e <= t-2;
 *                  lastDig >= 19 > 8 >= zeroLed. So answer > digits >
 *                  lastDig > zeroLed strictly, at every draw.
 *   digit string   digits reads 10(t-1) + q >= 20, against answer's t <= 7,
 *                  lastDig's 10e + 9 <= 10(t-2) + 9 = 10(t-1) - 1 < digits,
 *                  and zeroLed's leading zero leaving z <= 8. Strict win.
 *   last digit     lastDig ends in 9; t <= 7, q <= 8 and z <= 8. Strict win.
 *   dropped zero   only zeroLed has a zero straight after the point — the
 *                  answer has one decimal place, digits starts with
 *                  t-1 >= 2 and lastDig with e >= 1. Re-read, zeroLed is
 *                  z/10 with z >= t+1 > t, which beats the answer and so
 *                  beats everything. Strict win.
 *
 * Each rule therefore selects a different decimal and none selects the answer.
 * The four texts are distinct too: only the answer has one decimal place, and
 * the other three differ in their tenths digit (t-1 >= 2, e <= t-2, and 0).
 *
 * The parameter space is (w, t, e, z, q) with 0 <= w <= 9, and the sweep runs
 * all 3,150 of them: 35 admissible (t, e, z) triples times 9 values of q times
 * 10 whole-number parts. Nothing is excluded, because the ranges above are
 * already the exclusion — see the sibling test, which checks every draw.
 *
 * Largest number printed: 9 in the question, and the two-digit padded decimal
 * parts up to 99 in the worked solution.
 */
export const nf7CompareDecimals: QuestionTemplate = {
  id: 'g4.nf7.compare-decimals',
  standardCode: 'NC.4.NF.7',
  domainId: 'NF',
  difficulty: 'mastery',
  calculatorAllowed: false,
  isStretch: false,

  generate(rng: Rng): GeneratedQuestion {
    const whole = rng.int(0, 9);
    // t >= 3 leaves room for e in 1..t-2; t <= 7 leaves room for z in t+1..8.
    const t = rng.int(3, 7);
    const e = rng.int(1, t - 2);
    const z = rng.int(t + 1, 8);
    // At most 8, so the last-digit rule has a unique winner in the 9 of w.e9.
    const q = rng.int(0, 8);

    const answer = `${whole}.${t}`;
    const longestDigitString = `${whole}.${t - 1}${q}`;
    const largestLastDigit = `${whole}.${e}9`;
    const hiddenByPlaceholderZero = `${whole}.0${z}`;

    const candidates = [
      { text: answer, isCorrect: true },
      // The digits after the point read as a whole number: 10(t-1) + q is the
      // biggest such string on the page, though it is worth less than 10t.
      {
        text: longestDigitString,
        isCorrect: false,
        misconception: 'compared-by-digit-count',
      },
      // Compared from the right-hand end: this is the only option ending in 9.
      {
        text: largestLastDigit,
        isCorrect: false,
        misconception: 'compared-decimals-right-to-left',
      },
      // The zero holding the tenths place ignored, so w.0z is read as w.z,
      // which is larger than every other option.
      {
        text: hiddenByPlaceholderZero,
        isCorrect: false,
        misconception: 'omitted-placeholder-zero',
      },
    ];

    // Distinct BY CONSTRUCTION; a collision means the ranges drawn above and
    // the algebra in the docstring have drifted apart.
    const texts = candidates.map((c) => c.text);
    if (new Set(texts).size !== texts.length) {
      throw new Error(`g4.nf7.compare-decimals: option collision [${texts.join(' | ')}]`);
    }

    // One order for both the listed decimals and the options, so the prompt
    // and the choices always agree.
    const ordered = rng.shuffle(candidates);
    const listed = ordered.map((c) => c.text);
    const padded = listed.map((v) => {
      const [w, frac] = v.split('.');
      return `${w}.${frac.padEnd(2, '0')}`;
    });

    return {
      // The stem says nothing about wholes. An earlier version claimed these
      // were "parts of the same size whole", which is false the moment the
      // whole-number part is 1 or more — most of these values are not parts of
      // anything. NC.4.NF.7's same-whole requirement is real and is taught
      // where it can be taught honestly: the authored item g4-nf7-05.
      prompt: 'Which of these decimals is the greatest?',
      promptDetails: listed.join(', '),
      options: labelOptions(ordered),
      answerText: answer,
      explanation: {
        stepByStep: [
          `Step 1: Every number has ${whole} whole${whole === 1 ? '' : 's'}, so the comparison is decided after the decimal point.`,
          `Step 2: Write each one to hundredths so the places line up: ${padded.join(', ')}. Adding a zero on the end changes nothing about a decimal's value.`,
          `Step 3: Compare the tenths place, which is worth the most: ${padded.map((v) => v[v.indexOf('.') + 1]).join(', ')}.`,
          `Step 4: The largest tenths digit is ${t}, and only one number has it, so the greatest decimal is ${answer}.`,
        ],
        conceptSummary:
          'Decimals are compared place by place from the left, and the first place where they differ settles it. How many digits a decimal has says nothing about its size — 0.5 is twice 0.25.',
        commonMisconception:
          'Reading the digits after the point as a whole number makes the longest string look biggest. Padding every number to the same length first makes that reading honest instead of misleading.',
      },
    };
  },
};
