import type { Rng } from '../../../engine/rng';
import type { QuestionTemplate, GeneratedQuestion } from '../../../engine/template';
import { labelOptions } from '../../../engine/questionModel';

/**
 * NC.2.OA.2 — "Demonstrate fluency with addition and subtraction, within 20,
 * using mental strategies." RULING 17-4: `calculatorAllowed` is false, since
 * a fluency standard answered with a calculator assesses nothing.
 *
 * Draws an addition fact (`a + b`, both addends 2-9, sum <= 20 by
 * construction since 9+9=18) or a subtraction fact (`a - b`, a in 11-19,
 * b in 2-9, a - b >= 2) with equal probability. The two "counted on/back by
 * ones" distractors are +-1 of the correct answer regardless of operation,
 * which is deliberate: whichever direction the mental count runs, losing
 * count by one is the single most common Grade 2 fluency slip, and it always
 * lands one away from the true sum or difference.
 *
 * For addition, `a - b` (b < a is not guaranteed) could go negative as the
 * "wrong operation" distractor; the generator instead always subtracts the
 * SMALLER addend from the larger, matching what a child who reaches for
 * subtraction by mistake would actually compute. For subtraction, the
 * "wrong operation" distractor is simply `a + b`, which is always a larger,
 * clearly-wrong number.
 */
export const oa2FluencyFact: QuestionTemplate = {
  id: 'g2.oa2.fluency-fact',
  standardCode: 'NC.2.OA.2',
  domainId: 'OA',
  difficulty: 'mastery',
  calculatorAllowed: false,
  isStretch: false,

  generate(rng: Rng): GeneratedQuestion {
    const isAddition = rng.pick([true, false]);

    if (isAddition) {
      const a = rng.int(2, 9);
      const b = rng.int(2, 9);
      const correct = a + b;
      const wrongOp = Math.max(a, b) - Math.min(a, b);

      const candidates = [
        { text: `${correct}`, isCorrect: true },
        {
          text: `${correct - 1}`,
          isCorrect: false,
          misconception: 'counted-on-by-ones-and-stopped-one-short',
        },
        { text: `${correct + 1}`, isCorrect: false, misconception: 'counted-on-by-ones-one-too-many' },
        { text: `${wrongOp}`, isCorrect: false, misconception: 'subtracted-instead-of-added' },
      ];
      const texts = candidates.map((x) => x.text);
      if (new Set(texts).size !== texts.length) {
        throw new Error(`g2.oa2.fluency-fact: option collision [${texts.join(' | ')}]`);
      }

      return {
        prompt: `What is ${a} + ${b}?`,
        options: labelOptions(rng.shuffle(candidates)),
        answerText: `${correct}`,
        explanation: {
          stepByStep: [
            `Step 1: A quick mental strategy is to start from the bigger number and count on by the smaller one.`,
            `Step 2: The bigger number here is ${Math.max(a, b)}, so start there.`,
            `Step 3: Count on ${Math.min(a, b)} more from ${Math.max(a, b)}.`,
            `Step 4: ${a} + ${b} = ${correct}.`,
          ],
          conceptSummary:
            'Starting from the bigger addend and counting on by the smaller one means fewer counts than counting on by ones from the first number written — and it is faster and more reliable than counting everything from one.',
          commonMisconception: `Counting on by ones from the first number written, instead of starting from the bigger addend, means more counts and more chances to stop one short or go one too far.`,
        },
      };
    }

    const a = rng.int(11, 19);
    const b = rng.int(2, 9);
    // a in [11,19] and b in [2,9] guarantees a - b >= 2 (the tightest case,
    // a=11 and b=9, gives exactly 2), so the difference never needs guarding.
    const correct = a - b;
    const bSafe = b;
    const wrongOp = a + bSafe;

    const candidates = [
      { text: `${correct}`, isCorrect: true },
      {
        text: `${correct + 1}`,
        isCorrect: false,
        misconception: 'counted-on-by-ones-and-stopped-one-short',
      },
      { text: `${correct - 1}`, isCorrect: false, misconception: 'counted-on-by-ones-one-too-many' },
      { text: `${wrongOp}`, isCorrect: false, misconception: 'added-instead-of-subtracted' },
    ];
    const texts = candidates.map((x) => x.text);
    if (new Set(texts).size !== texts.length) {
      throw new Error(`g2.oa2.fluency-fact: option collision [${texts.join(' | ')}]`);
    }

    return {
      prompt: `What is ${a} − ${bSafe}?`,
      options: labelOptions(rng.shuffle(candidates)),
      answerText: `${correct}`,
      explanation: {
        stepByStep: [
          `Step 1: A quick mental strategy is to think of the matching addition fact instead.`,
          `Step 2: ${a} − ${bSafe} asks: what number plus ${bSafe} makes ${a}?`,
          `Step 3: Count on from ${bSafe} to ${a}, or recall the fact directly.`,
          `Step 4: ${a} − ${bSafe} = ${correct}.`,
        ],
        conceptSummary:
          'Subtraction and addition undo each other, so a subtraction fact can be checked or solved through its matching addition fact instead of counting back by ones.',
        commonMisconception: `Counting back by ones ${bSafe} separate times makes it easy to stop one count short or go one count too far.`,
      },
    };
  },
};
