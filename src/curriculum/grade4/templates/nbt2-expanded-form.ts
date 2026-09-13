import type { Rng } from '../../../engine/rng';
import type { QuestionTemplate, GeneratedQuestion } from '../../../engine/template';
import { labelOptions } from '../../../engine/questionModel';
import { fmt } from './numberFormat';

/**
 * NC.4.NBT.2 — read and write whole numbers to 100,000 in numerals, number
 * names and expanded form. This generator takes the numeral and asks for the
 * expanded form.
 *
 * The numeral is always a * 10^4 + b * 10^3 + e * 10 + f with a in 2..9 and
 * b, e, f in 1..9 — five digits with a ZERO in the hundreds place and no other
 * zero. The zero is the whole point: an empty place is what separates a
 * student who reads by place value from one who reads the digits in a row.
 * The largest numeral is 99,099, inside the standard's ceiling of 100,000.
 *
 * The four options are four expanded-form STRINGS, so the distinctness
 * argument is over their first term, which is the only term whose place
 * differs between them:
 *
 *   answer      a*10^4 + b*10^3 + e*10 + f      the empty place written as
 *                                               nothing, as expanded form does
 *   zero place  a*10^3 + b*10^2 + e*10 + f      the numeral read as the
 *               skipped                         four-digit number "abef"
 *   digits      a + b + 0 + e + f               the digits themselves added
 *   one place   a*10^5 + b*10^4 + e*10^2 + f*10 every place counted one too
 *               too high                        high
 *
 * The four leading terms are a*10^4, a*10^3, a and a*10^5. For any a >= 1
 * these are four different numbers (a*10^i = a*10^j forces i = j), so the four
 * strings differ in their very first token and can never coincide. Nothing is
 * excluded, and nothing is resampled.
 *
 * An exhaustive sweep of all 8 * 9 * 9 * 9 = 5,832 admissible (a, b, e, f)
 * quadruples confirms it: no collision at any of them.
 */
export const nbt2ExpandedForm: QuestionTemplate = {
  id: 'g4.nbt2.expanded-form',
  standardCode: 'NC.4.NBT.2',
  domainId: 'NBT',
  difficulty: 'mastery',
  calculatorAllowed: false,
  isStretch: false,

  generate(rng: Rng): GeneratedQuestion {
    const a = rng.int(2, 9);
    const b = rng.int(1, 9);
    const e = rng.int(1, 9);
    const f = rng.int(1, 9);

    const n = a * 10000 + b * 1000 + e * 10 + f;

    const answerText = `${fmt(a * 10000)} + ${fmt(b * 1000)} + ${fmt(e * 10)} + ${f}`;

    const candidates = [
      { text: answerText, isCorrect: true },
      // The hundreds place holds nothing, so the numeral was read as the
      // four-digit number "abef": a thousands, b hundreds, e tens, f ones.
      {
        text: `${fmt(a * 1000)} + ${fmt(b * 100)} + ${fmt(e * 10)} + ${f}`,
        isCorrect: false,
        misconception: 'skipped-the-zero-place',
      },
      // The digits listed instead of the amounts they stand for. This sum is
      // a + b + e + f, nowhere near the number itself.
      {
        text: `${a} + ${b} + 0 + ${e} + ${f}`,
        isCorrect: false,
        misconception: 'wrote-the-digit-not-its-value',
      },
      // Every place counted one column too high: the ten thousands digit
      // expanded as hundred thousands, and so on down the numeral.
      {
        text: `${fmt(a * 100000)} + ${fmt(b * 10000)} + ${fmt(e * 100)} + ${fmt(f * 10)}`,
        isCorrect: false,
        misconception: 'wrong-power-of-ten',
      },
    ];

    const texts = candidates.map((c) => c.text);
    if (new Set(texts).size !== texts.length) {
      throw new Error(`g4.nbt2.expanded-form: option collision [${texts.join(' | ')}]`);
    }

    return {
      prompt: `Which shows ${fmt(n)} written in expanded form?`,
      options: labelOptions(rng.shuffle(candidates)),
      answerText,
      explanation: {
        stepByStep: [
          `Step 1: Name what each digit of ${fmt(n)} is worth, starting from the left: ${a} ten thousands, ${b} thousands, 0 hundreds, ${e} tens, ${f} ones.`,
          `Step 2: ${a} ten thousands is ${fmt(a * 10000)}, and ${b} thousands is ${fmt(b * 1000)}.`,
          `Step 3: There are no hundreds, so the hundreds place contributes nothing and is left out; ${e} tens is ${fmt(e * 10)} and ${f} ones is ${f}.`,
          `Step 4: ${fmt(n)} = ${answerText}.`,
        ],
        conceptSummary:
          'Expanded form writes what each digit is worth, not the digit. A place holding a zero contributes nothing to the sum, but it still holds every digit to its left in position.',
        commonMisconception:
          `Reading the digits in a row and ignoring the empty hundreds place turns ${fmt(n)} into ${fmt(a * 1000 + b * 100 + e * 10 + f)} — a four-digit number where a five-digit one belongs.`,
      },
    };
  },
};
