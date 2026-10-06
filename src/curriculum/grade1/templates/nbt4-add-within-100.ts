import type { Rng } from '../../../engine/rng';
import type { QuestionTemplate, GeneratedQuestion } from '../../../engine/template';
import { labelOptions } from '../../../engine/questionModel';
import { unitCount } from './placeValue';

/**
 * NC.1.NBT.4 — "Using concrete models or drawings, strategies based on place
 * value, properties of operations, and explaining the reasoning used, add
 * within 100."
 *
 * RULING 23-2 IS THE STANDARD. "Within 100" is the ceiling, not the licence:
 * the keyConcepts bound the second addend to a ONE-DIGIT NUMBER or a MULTIPLE
 * OF 10. NC Grade 1 never adds two arbitrary two-digit numbers (that regroups,
 * and regrouping is NC.2.NBT.5) — every draw here is a two-digit number A
 * (10-89) plus either a one-digit number (1-9) or a multiple of 10 (10-90),
 * with the sum never exceeding 99.
 *
 * The two addend shapes are ONE skill — add within 100 — with different
 * errors, because a one-digit addend invites adding into the wrong PLACE and
 * a multiple-of-ten addend invites reading its own tens digit as a ones
 * value. Draws that would make two of the four options collide are left out
 * of the pool entirely (never resampled); the sibling test proves the excluded
 * draws really do collide.
 *
 * ---------------------------------------------------------------------------
 * shape 'ones' (b is 1-9):
 *   answer                                       A + b
 *   left-one-of-the-addends-out                  A            (b never added)
 *   added-the-second-addend-into-the-tens-place   (tensDigit(A)+b)*10 + onesDigit(A)
 *   dropped-the-tens-digit-when-adding            onesDigit(A) + b
 *
 * shape 'tens' (b is a multiple of 10, 10-90):
 *   answer                                       A + b
 *   left-one-of-the-addends-out                  A            (b never added)
 *   used-the-tens-digit-as-ones                   A + b/10     (30 added as 3)
 *   dropped-the-ones-digit-of-the-two-digit-number (A - onesDigit(A)) + b
 */
export interface AddDraw {
  a: number;
  shape: 'ones' | 'tens';
  b: number;
}

function tensDigit(n: number): number {
  return Math.floor(n / 10);
}
function onesDigit(n: number): number {
  return n % 10;
}

function optionsFor(a: number, shape: 'ones' | 'tens', b: number): string[] {
  const sum = a + b;
  if (shape === 'ones') {
    return [
      `${sum}`,
      `${a}`,
      `${(tensDigit(a) + b) * 10 + onesDigit(a)}`,
      `${onesDigit(a) + b}`,
    ];
  }
  return [`${sum}`, `${a}`, `${a + b / 10}`, `${a - onesDigit(a) + b}`];
}

export const ALL_ADD_DRAWS: AddDraw[] = [];
for (let a = 10; a <= 89; a++) {
  for (let b = 1; b <= 9; b++) {
    if (a + b <= 99) ALL_ADD_DRAWS.push({ a, shape: 'ones', b });
  }
  for (let b = 10; b <= 90; b += 10) {
    if (a + b <= 99) ALL_ADD_DRAWS.push({ a, shape: 'tens', b });
  }
}

export const ADD_DRAWS: AddDraw[] = ALL_ADD_DRAWS.filter(
  (d) => new Set(optionsFor(d.a, d.shape, d.b)).size === 4,
);

export const nbt4AddWithin100: QuestionTemplate = {
  id: 'g1.nbt4.add-within-100',
  standardCode: 'NC.1.NBT.4',
  domainId: 'NBT',
  difficulty: 'mastery',
  calculatorAllowed: false,
  isStretch: false,

  generate(rng: Rng): GeneratedQuestion {
    const { a, shape, b } = rng.pick(ADD_DRAWS);
    const sum = a + b;
    const answerText = `${sum}`;
    const [correctText, leftOutText, placeText, digitText] = optionsFor(a, shape, b);

    const candidates =
      shape === 'ones'
        ? [
            { text: correctText, isCorrect: true },
            { text: leftOutText, isCorrect: false, misconception: 'left-one-of-the-addends-out' },
            { text: placeText, isCorrect: false, misconception: 'added-the-second-addend-into-the-tens-place' },
            { text: digitText, isCorrect: false, misconception: 'dropped-the-tens-digit-when-adding' },
          ]
        : [
            { text: correctText, isCorrect: true },
            { text: leftOutText, isCorrect: false, misconception: 'left-one-of-the-addends-out' },
            { text: placeText, isCorrect: false, misconception: 'used-the-tens-digit-as-ones' },
            { text: digitText, isCorrect: false, misconception: 'dropped-the-ones-digit-of-the-two-digit-number' },
          ];

    const texts = candidates.map((c) => c.text);
    if (new Set(texts).size !== texts.length) {
      throw new Error(`g1.nbt4.add-within-100: option collision [${texts.join(' | ')}]`);
    }

    const middle =
      shape === 'ones'
        ? [
            `Step 2: Add the ones: ${onesDigit(a)} + ${b} = ${onesDigit(a) + b}.`,
            `Step 3: ${unitCount(tensDigit(a), 'ten')} and ${unitCount(onesDigit(a) + b, 'one')} is ${sum}.`,
          ]
        : [
            `Step 2: ${b} is ${unitCount(b / 10, 'ten')}.`,
            `Step 3: ${unitCount(tensDigit(a) + b / 10, 'ten')} and ${unitCount(onesDigit(a), 'one')} is ${sum}.`,
          ];

    return {
      prompt: `Find the total: ${a} + ${b}.`,
      options: labelOptions(rng.shuffle(candidates)),
      answerText,
      explanation: {
        stepByStep: [
          `Step 1: ${a} is ${unitCount(tensDigit(a), 'ten')} and ${unitCount(onesDigit(a), 'one')}.`,
          ...middle,
          `Step 4: ${a} + ${b} = ${sum}.`,
        ],
        conceptSummary:
          shape === 'ones'
            ? 'Adding a one-digit number changes the ONES digit of a two-digit number. The tens digit only changes if the ones add up to 10 or more.'
            : 'Adding a multiple of 10 changes the TENS digit of a two-digit number. The ones digit never changes.',
        commonMisconception:
          shape === 'ones'
            ? `Leaving ${b} out entirely gives ${a} back unchanged.`
            : `Reading ${b} by its tens digit alone, as ${b / 10}, adds far less than ${b} really is.`,
      },
    };
  },
};
