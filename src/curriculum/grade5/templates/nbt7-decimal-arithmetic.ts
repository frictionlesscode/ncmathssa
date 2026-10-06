import type { Rng } from '../../../engine/rng';
import type { QuestionTemplate, GeneratedQuestion } from '../../../engine/template';
import { labelOptions } from '../../../engine/questionModel';
import { decimalString } from './decimalFormat';

/** Column addition with every carry dropped. */
function addWithoutCarrying(a: number, b: number): number {
  let out = 0;
  let place = 1;
  let x = a;
  let y = b;
  while (x > 0 || y > 0) {
    out += (((x % 10) + (y % 10)) % 10) * place;
    place *= 10;
    x = Math.floor(x / 10);
    y = Math.floor(y / 10);
  }
  return out;
}

/** Column subtraction that always takes the smaller digit from the larger
 *  rather than regrouping. */
function subtractWithoutRegrouping(a: number, b: number): number {
  let out = 0;
  let place = 1;
  let x = a;
  let y = b;
  while (x > 0 || y > 0) {
    out += Math.abs((x % 10) - (y % 10)) * place;
    place *= 10;
    x = Math.floor(x / 10);
    y = Math.floor(y / 10);
  }
  return out;
}

/**
 * NC.5.NBT.7 — adding and subtracting decimals to hundredths.
 *
 * Every value is an integer number of cents; nothing is divided until the
 * text is formatted, so no float can ever drift the "correct" answer.
 *
 * One operand is printed to tenths (cents value `short`, always a multiple
 * of 10) and the other to hundredths (`long`), which is what makes aligning
 * on the last digit a visible, separate error from aligning on the point.
 *
 *   answer      short + long          or  long - short
 *   no point    the same digits, written with no decimal point at all
 *   right-align short/10 +- long      the short number slid one place right
 *   no regroup  column work with every carry (or borrow) dropped
 *
 * Distinctness. The "no point" option is the only one printed without a
 * decimal point, so it can never tie any other. For the remaining three:
 *
 *   answer vs right-align: they differ by 0.9 * short, and short > 0.
 *   answer vs no regroup:  addition draws the tenths digits with z + x >= 10
 *                          and subtraction draws them with z > x, so at least
 *                          one column always regroups. Dropping regroups
 *                          changes the total by 10 * (sum of the carrying
 *                          place values) for addition, and by
 *                          2 * (z - x) * 10 for subtraction — both non-zero.
 *   right-align vs no regroup: the first sits 9*(10*wT + z) away from the
 *                          answer, a non-zero multiple of 9. The second sits
 *                          10*(a sum of distinct powers of ten) away for
 *                          addition — digit sum at most 3, so never a
 *                          multiple of 9 — and 20*(z - x) away for
 *                          subtraction, which is a multiple of 9 only at
 *                          z - x = 9, and that would force 10*wT + z = 20,
 *                          which has no solution with z = 9.
 *
 * An exhaustive sweep of all 49,050 admissible draws confirms no collision
 * and no negative difference.
 */
export const nbt7DecimalArithmetic: QuestionTemplate = {
  id: 'g5.nbt7.decimal-arithmetic',
  standardCode: 'NC.5.NBT.7',
  domainId: 'NBT',
  difficulty: 'mastery',
  calculatorAllowed: false,
  isStretch: false,

  generate(rng: Rng): GeneratedQuestion {
    const adding = rng.next() < 0.5;

    let shortWhole: number;
    let shortTenths: number;
    let longWhole: number;
    let longTenths: number;
    let longHundredths: number;

    if (adding) {
      shortWhole = rng.int(1, 9);
      shortTenths = rng.int(1, 9);
      longWhole = rng.int(1, 9);
      // Force a carry out of the tenths column.
      longTenths = rng.int(10 - shortTenths, 9);
      longHundredths = rng.int(0, 9);
    } else {
      shortWhole = rng.int(1, 7);
      // Two clear wholes above the subtrahend keeps the difference positive
      // and keeps the ones column from needing its own borrow.
      longWhole = rng.int(shortWhole + 2, 9);
      longTenths = rng.int(0, 8);
      // Force a borrow out of the tenths column.
      shortTenths = rng.int(longTenths + 1, 9);
      longHundredths = rng.int(0, 9);
    }

    const short = shortWhole * 100 + shortTenths * 10;
    const long = longWhole * 100 + longTenths * 10 + longHundredths;

    const shortText = `${shortWhole}.${shortTenths}`;
    const longText = `${longWhole}.${longTenths}${longHundredths}`;

    const answerCents = adding ? short + long : long - short;
    // Columns added or subtracted correctly, decimal point never written.
    const pointOmitted = `${answerCents}`;
    // Aligned on the last digit instead of the point, sliding the number
    // printed to tenths one place to the right.
    const rightAligned = adding ? short / 10 + long : long - short / 10;
    const withoutRegroup = adding
      ? addWithoutCarrying(short, long)
      : subtractWithoutRegrouping(long, short);

    const money = (cents: number) => decimalString(cents, -2);
    const answer = money(answerCents);

    const candidates = [
      { text: answer, isCorrect: true },
      { text: pointOmitted, isCorrect: false, misconception: 'decimal-point-misplaced' },
      {
        text: money(rightAligned),
        isCorrect: false,
        misconception: 'place-value-shift-wrong-direction',
      },
      {
        text: money(withoutRegroup),
        isCorrect: false,
        misconception: adding ? 'added-without-carrying' : 'subtracted-without-regrouping',
      },
    ];

    const texts = candidates.map((c) => c.text);
    if (new Set(texts).size !== texts.length) {
      throw new Error(`g5.nbt7.decimal-arithmetic: option collision [${texts.join(' | ')}]`);
    }

    const left = adding ? shortText : longText;
    const right = adding ? longText : shortText;
    const operator = adding ? '+' : '-';

    const steps = adding
      ? [
          `Step 1: Line up the decimal points, not the last digits. Write ${shortText} as ${shortText}0 so both numbers reach hundredths.`,
          `Step 2: Hundredths: 0 + ${longHundredths} = ${longHundredths}.`,
          `Step 3: Tenths: ${shortTenths} + ${longTenths} = ${shortTenths + longTenths}, which is ten or more, so write ${(shortTenths + longTenths) % 10} and carry one whole into the ones place.`,
          `Step 4: Ones: ${shortWhole} + ${longWhole} + 1 (carried) = ${shortWhole + longWhole + 1}, so ${shortText} + ${longText} = ${answer}.`,
        ]
      : [
          `Step 1: Line up the decimal points, not the last digits. Write ${shortText} as ${shortText}0 so both numbers reach hundredths.`,
          `Step 2: Hundredths: ${longHundredths} − 0 = ${longHundredths}.`,
          `Step 3: Tenths: ${longTenths} is less than ${shortTenths}, so regroup one whole into ten tenths: ${10 + longTenths} − ${shortTenths} = ${10 + longTenths - shortTenths}.`,
          `Step 4: Ones: ${longWhole} − 1 (regrouped) − ${shortWhole} = ${longWhole - 1 - shortWhole}, so ${longText} − ${shortText} = ${answer}.`,
        ];

    return {
      prompt: adding ? 'Add the decimals.' : 'Subtract the decimals.',
      promptDetails: `${left} ${operator} ${right}`,
      options: labelOptions(rng.shuffle(candidates)),
      answerText: answer,
      explanation: {
        stepByStep: steps,
        conceptSummary:
          'Decimals are added and subtracted place by place, so the decimal points — not the last digits — have to line up. Padding the shorter number with a zero makes the columns match without changing its value.',
        commonMisconception:
          'Lining the numbers up on their right-hand ends quietly moves one of them a whole place, which is why 4.5 and 2.36 must be written as 4.50 and 2.36 before adding.',
      },
    };
  },
};
