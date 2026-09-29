import type { Rng } from '../../../engine/rng';
import type { QuestionTemplate, GeneratedQuestion } from '../../../engine/template';
import { labelOptions } from '../../../engine/questionModel';

/**
 * NC.4.NF.6 — "use equivalent fractions to add two fractions with denominators
 * of 10 or 100", and the tenths/hundredths equivalence that makes it possible.
 * This is the ONE pair of unlike denominators Grade 4 adds; everything else of
 * that shape is NC.5.NF.1, a grade above.
 *
 * The four option values, for a/10 + b/100 with a and b both single digits:
 *
 *   answer      (10a + b)/100   tenths rescaled to hundredths, then added
 *   across      (a + b)/110     both rows added straight across
 *   notScaled   (a + b)/100     100 taken as the denominator, a never rescaled
 *   wrongScaled (a + 10b)/100   the hundredths numerator scaled instead of the
 *                               tenths one
 *
 * All six pairs, with a, b >= 1:
 *
 *   answer    = notScaled    => 10a + b = a + b => a = 0. Impossible.
 *   answer    = wrongScaled  => 10a + b = a + 10b => a = b. EXCLUDED below.
 *   notScaled = wrongScaled  => a + b = a + 10b => b = 0. Impossible.
 *   answer    = across       => 110(10a + b) = 100(a + b) => 1000a = -10b.
 *                               Impossible for a, b >= 1.
 *   notScaled = across       => 110(a + b) = 100(a + b) => a + b = 0. Impossible.
 *   wrongScaled = across     => 110(a + 10b) = 100(a + b) => 10a = -1000b.
 *                               Impossible for a, b >= 1.
 *
 * So one exclusion carries it: a must not equal b. The parameter space is
 * exactly (a, b) in 1..9 x 1..9 — 81 pairs, of which 72 are admissible and the
 * 9 barred ones all really do collide. The sibling test sweeps all 81.
 *
 * One template, one skill (spec 6.5): every draw is the same procedure, and
 * the tenths always come first, so a child never has to decide which addend
 * needs rescaling — that decision would be a second skill.
 *
 * Largest number printed: 110, the denominator of the added-straight-across
 * distractor.
 */
export const nf6AddTenthsHundredths: QuestionTemplate = {
  id: 'g4.nf6.add-tenths-hundredths',
  standardCode: 'NC.4.NF.6',
  domainId: 'NF',
  difficulty: 'mastery',
  calculatorAllowed: false,
  isStretch: false,

  generate(rng: Rng): GeneratedQuestion {
    const a = rng.int(1, 9);
    // Deterministically off a, which is the single exclusion the algebra in
    // the docstring needs. Never a resampling loop.
    const bRaw = rng.int(1, 8);
    const b = bRaw < a ? bRaw : bRaw + 1;

    const answer = `${10 * a + b}/100`;

    const candidates = [
      { text: answer, isCorrect: true },
      // Numerators and denominators both added straight across:
      // a + b over 10 + 100.
      {
        text: `${a + b}/110`,
        isCorrect: false,
        misconception: 'added-numerators-and-denominators',
      },
      // 100 taken as the common denominator, but the a tenths never rescaled
      // to 10a hundredths.
      {
        text: `${a + b}/100`,
        isCorrect: false,
        misconception: 'common-denominator-numerator-not-scaled',
      },
      // The wrong addend rescaled: the b hundredths multiplied by 10 and the
      // a tenths left alone.
      {
        text: `${a + 10 * b}/100`,
        isCorrect: false,
        misconception: 'scaled-the-wrong-addend',
      },
    ];

    // Distinct BY CONSTRUCTION; a collision means a !== b stopped holding.
    const texts = candidates.map((c) => c.text);
    if (new Set(texts).size !== texts.length) {
      throw new Error(`g4.nf6.add-tenths-hundredths: option collision [${texts.join(' | ')}]`);
    }

    return {
      prompt: 'Add the fractions. Write the sum in hundredths.',
      promptDetails: `${a}/10 + ${b}/100`,
      options: labelOptions(rng.shuffle(candidates)),
      answerText: answer,
      explanation: {
        stepByStep: [
          `Step 1: Tenths and hundredths are different sized parts, so one has to be renamed before anything is added.`,
          `Step 2: Each tenth is 10 hundredths, so ${a}/10 = ${10 * a}/100.`,
          `Step 3: Now both are counted in hundredths: ${10 * a}/100 + ${b}/100 = ${10 * a + b}/100.`,
          `Step 4: ${a}/10 + ${b}/100 = ${answer}, which is written as the decimal 0.${10 * a + b}.`,
        ],
        conceptSummary:
          'Tenths and hundredths sit one place apart in the same base-ten system, so a tenth is simply ten hundredths. That single fact is what lets Grade 4 add these two denominators, and it is the same fact that makes 0.6 and 0.60 equal.',
        commonMisconception:
          'Adding the numerators without rescaling treats a tenth as if it were a hundredth, and it is ten times bigger. The renaming has to happen first, not after.',
      },
    };
  },
};
