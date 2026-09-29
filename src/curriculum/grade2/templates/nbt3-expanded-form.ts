import type { Rng } from '../../../engine/rng';
import type { QuestionTemplate, GeneratedQuestion } from '../../../engine/template';
import { labelOptions } from '../../../engine/questionModel';

/**
 * NC.2.NBT.3 — "Read and write numbers, within 1000, using base-ten numerals,
 * number names, and expanded form."
 *
 * The EXPANDED FORM third. The other two thirds are authored: writing a
 * numeral from its name and reading a numeral out in words both turn on
 * English number words ("four hundred seven" heard as forty-seven, 512 read as
 * five hundred twelve rather than five hundred one two), and a generator that
 * had to spell number names would be generating English, not mathematics.
 * Expanded form is pure place value and is exactly what fresh numbers help.
 *
 * ---------------------------------------------------------------------------
 * Ranges. h in [1,9], t in [1,9], o in [1,9], with h != o. The number is
 * n = 100h + 10t + o, so n runs from 111 to 999, and every digit is non-zero:
 * a zero place would put "0 +" in the expanded form, which is a different
 * question (it is the one g2-nbt3-04 asks by hand, from the other direction).
 * h != o is what keeps the swapped-digits distractor from reproducing the
 * answer.
 *
 *   answer                          100h + 10t + o      e.g. 300 + 60 + 4
 *   wrote-the-digit-not-its-value     h  +   t  + o      e.g.   3 +  6 + 4
 *   wrong-power-of-ten              100h + 100t + 100o   e.g. 300 + 600 + 400
 *   put-a-digit-in-the-wrong-place   100o + 10t + h      e.g. 400 + 60 + 3
 *
 * Distinctness, exhaustively. The four strings start with 100h, h, 100h and
 * 100o. The first and the third share a first term, and differ in their
 * second: 10t is never 100t for t >= 1. The fourth starts 100o, which equals
 * 100h only when o = h, which the draw excludes. The second starts with a
 * bare h, one or two characters, where every other string starts with a
 * multiple of 100 (at least three characters), so it can never match. The
 * draw space is 9 x 9 x 8 = 648 questions and the sibling test walks all of it.
 */
export const nbt3ExpandedForm: QuestionTemplate = {
  id: 'g2.nbt3.expanded-form',
  standardCode: 'NC.2.NBT.3',
  domainId: 'NBT',
  difficulty: 'mastery',
  calculatorAllowed: false,
  isStretch: false,

  generate(rng: Rng): GeneratedQuestion {
    const h = rng.int(1, 9);
    const t = rng.int(1, 9);
    // o != h, drawn without rejection: pick from the 8 remaining digits.
    const others = [1, 2, 3, 4, 5, 6, 7, 8, 9].filter((d) => d !== h);
    const o = rng.pick(others);

    const n = 100 * h + 10 * t + o;
    const answerText = `${100 * h} + ${10 * t} + ${o}`;

    const candidates = [
      { text: answerText, isCorrect: true },
      // Wrote each digit instead of what the digit is worth in its place.
      { text: `${h} + ${t} + ${o}`, isCorrect: false, misconception: 'wrote-the-digit-not-its-value' },
      // Gave every digit a hundreds value, so the tens and ones came out a
      // hundred times too big.
      {
        text: `${100 * h} + ${100 * t} + ${100 * o}`,
        isCorrect: false,
        misconception: 'wrong-power-of-ten',
      },
      // Swapped the hundreds and ones digits before expanding.
      {
        text: `${100 * o} + ${10 * t} + ${h}`,
        isCorrect: false,
        misconception: 'put-a-digit-in-the-wrong-place',
      },
    ];

    const texts = candidates.map((c) => c.text);
    if (new Set(texts).size !== texts.length) {
      throw new Error(`g2.nbt3.expanded-form: option collision [${texts.join(' | ')}]`);
    }

    return {
      prompt: 'Which one shows this number in expanded form?',
      promptDetails: `${n}`,
      options: labelOptions(rng.shuffle(candidates)),
      answerText,
      explanation: {
        stepByStep: [
          `Step 1: ${n} has a ${h} in the hundreds place, a ${t} in the tens place, and a ${o} in the ones place.`,
          `Step 2: The ${h} is worth ${100 * h}, the ${t} is worth ${10 * t}, and the ${o} is worth ${o}.`,
          `Step 3: Expanded form writes those three values added together, and they must add back to ${n}.`,
          `Step 4: ${n} in expanded form is ${answerText}.`,
        ],
        conceptSummary:
          'Expanded form pulls a number apart into what each digit is worth, so it shows the place value that the digits alone hide. Adding the parts back up has to return the number you started with.',
        commonMisconception: `Writing ${h} + ${t} + ${o} adds up to ${h + t + o}, nowhere near ${n}. A digit on its own is not its value — the place it sits in is what decides what it is worth.`,
      },
    };
  },
};
