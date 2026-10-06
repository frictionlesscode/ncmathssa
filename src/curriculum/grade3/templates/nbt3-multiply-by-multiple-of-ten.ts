import type { Rng } from '../../../engine/rng';
import type { QuestionTemplate, GeneratedQuestion } from '../../../engine/template';
import { labelOptions } from '../../../engine/questionModel';

/**
 * NC.3.NBT.3 — "Use concrete and pictorial models, based on place value and
 * the properties of operations, to find the product of a one-digit whole
 * number by a MULTIPLE OF 10 IN THE RANGE 10–90."
 *
 * The range is the whole of ruling 13-4: the second factor is 10, 20, ..., 90
 * and nothing else, so the largest legal product is 9 × 90 = 810. A multiple of
 * 100, or a two-digit factor that is not a multiple of 10, is NC.4.NBT.5 a
 * grade on.
 *
 * The standard says "concrete and PICTORIAL models", so the question draws the
 * tens rather than only naming them: `promptDetails` shows `a` rows of `t`
 * ten-rods, and the child can count 6 groups of 4 tens before multiplying
 * anything. That also keeps this generator's question shape distinct from every
 * other Grade 3 generator's — `../authored.oa.ts`'s neighbours draw arrays of
 * single objects, and NC.3.OA.7's generator asks a bare fact with no figure.
 *
 * ---------------------------------------------------------------------------
 * Construction. a in 2..9 is the one-digit factor; t in 1..9 gives the multiple
 * m = 10·t, so m runs over 10..90 exactly.
 *
 *   answer                              a·m = 10·a·t
 *   dropped-the-zero-from-the-           a·t     multiplied by the tens digit
 *     multiple-of-ten                            and reported it as ones
 *   added-instead-of-multiplied          a + m
 *   skip-counted-one-group-short        (a-1)·m  one whole group left out
 *
 * Distinctness, exhaustively, for a in 2..9 and t in 1..9:
 *
 *   a·m = a·t          =>  10at = at  =>  at = 0.             Never.
 *   a·m = (a-1)·m      =>  m = 0.                             Never.
 *   a·m = a + m        =>  10t(a-1) = a. LHS >= 10, a <= 9.    Never.
 *   a·t = (a-1)·m      =>  at = 10t(a-1)  =>  9a = 10.        Never.
 *   a·t = a + m        =>  a(t-1) = 10t  =>  a = 10t/(t-1),
 *                          which is 20, 15, 13.3..., 12.5, ... for t >= 2 and
 *                          undefined at t = 1. Never <= 9.    Never.
 *   a + m = (a-1)·m    =>  a = 10t(a-2). At a = 2 the right side is 0; for
 *                          a >= 3 it is at least 10 > a.      Never.
 *
 * So nothing is excluded and nothing is resampled: the draw space is the full
 * 8 × 9 = 72 pairs, swept in full by the sibling test. The largest product it
 * can emit is 9 × 90 = 810, the largest the standard allows.
 */
interface Factors {
  a: number;
  t: number;
}

export const FACTOR_PAIRS: Factors[] = [];
for (let a = 2; a <= 9; a++) {
  for (let t = 1; t <= 9; t++) FACTOR_PAIRS.push({ a, t });
}

/** "1 ten" but "3 tens": the multiple of 10 can be a single ten, and a prompt
 *  that reads "shows 1 tens" is a prompt an eight-year-old is reading. */
function tens(n: number): string {
  return `${n} ten${n === 1 ? '' : 's'}`;
}

/** One row of the pictorial model: `t` ten-rods. */
function tenRods(t: number): string {
  return Array.from({ length: t }, () => '[10]').join(' ');
}

export const nbt3MultiplyByMultipleOfTen: QuestionTemplate = {
  id: 'g3.nbt3.multiply-by-multiple-of-ten',
  standardCode: 'NC.3.NBT.3',
  domainId: 'NBT',
  difficulty: 'mastery',
  calculatorAllowed: false,
  isStretch: false,

  generate(rng: Rng): GeneratedQuestion {
    const { a, t } = rng.pick(FACTOR_PAIRS);
    const m = 10 * t;

    const product = a * m;
    const answerText = `${product}`;
    const figure = Array.from({ length: a }, () => tenRods(t)).join('\n');

    const candidates = [
      { text: answerText, isCorrect: true },
      // a * t: multiplied by the tens digit but wrote the answer as if those
      // were ones, so the product is ten times too small.
      {
        text: `${a * t}`,
        isCorrect: false,
        misconception: 'dropped-the-zero-from-the-multiple-of-ten',
      },
      // a + m: added the two numbers instead of multiplying them.
      { text: `${a + m}`, isCorrect: false, misconception: 'added-instead-of-multiplied' },
      // (a - 1) * m: skip counted by m but stopped one group early.
      {
        text: `${(a - 1) * m}`,
        isCorrect: false,
        misconception: 'skip-counted-one-group-short',
      },
    ];

    const texts = candidates.map((c) => c.text);
    if (new Set(texts).size !== texts.length) {
      throw new Error(`g3.nbt3.multiply-by-multiple-of-ten: option collision [${texts.join(' | ')}]`);
    }

    return {
      prompt: `Each group below shows ${tens(t)}. What is ${a} × ${m}?`,
      promptDetails: figure,
      options: labelOptions(rng.shuffle(candidates)),
      answerText,
      explanation: {
        stepByStep: [
          `Step 1: ${m} is ${tens(t)}, so ${a} × ${m} is ${a} equal groups of ${tens(t)}.`,
          `Step 2: Count the tens with a fact you already know: ${a} × ${t} = ${a * t}.`,
          `Step 3: So there are ${tens(a * t)} altogether, and ${tens(a * t)} is worth ${product}.`,
          `Step 4: ${a} × ${m} = ${answerText}.`,
        ],
        conceptSummary:
          'Multiplying by a multiple of 10 counts TENS instead of ones. Find how many tens there are with a fact you already know, then write that many tens — the same digits, standing one place further left.',
        commonMisconception: `Answering ${a * t} is the right count of the wrong unit: ${a * t} is how many TENS there are, and ${tens(a * t)} is worth ${product}.`,
      },
    };
  },
};
