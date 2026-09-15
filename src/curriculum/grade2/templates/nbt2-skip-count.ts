import type { Rng } from '../../../engine/rng';
import type { QuestionTemplate, GeneratedQuestion } from '../../../engine/template';
import { labelOptions } from '../../../engine/questionModel';

/**
 * NC.2.NBT.2 — "Count within 1000; skip-count by 5s, 10s, and 100s."
 *
 * The skip-counting half. Plain counting within 1,000 is authored by hand
 * (g2-nbt2-01), because the interesting case is the single moment a hundred
 * rolls over and a generator drawing random start values would almost never
 * land on it.
 *
 * All three intervals the standard names are drawn with equal probability. For
 * 10s and 100s the start is never a multiple of the step — its ones digit (and
 * for 100s its tens digit too) is always non-zero — so a child cannot answer by
 * reciting 10, 20, 30 or 100, 200, 300 from memory; the count has to carry the
 * lower digits along, which is the whole difficulty. A count by 5s does start
 * on a multiple of 5, because that is what counting by fives means.
 *
 * ---------------------------------------------------------------------------
 * Ranges. Every number printed — in the prompt and in all four options — must
 * stay inside the standard's 1,000. The largest thing printed is the third
 * number of the wrong-step list, start + 3 x 100, so every start is capped at
 * 699 whatever its own step is:
 *
 *   step 5     start = 5 x [21..139]                      -> 105 .. 695
 *   step 10    start = 10 x [10..68] + [1..9]             -> 101 .. 689
 *   step 100   start = 100 x [1..6] + 10 x [1..9] + [1..9] -> 111 .. 699
 *
 * The step-10 start always has a non-zero ones digit and the step-100 start
 * always has non-zero tens AND ones, so in both cases the count carries those
 * digits along — which is the whole difficulty of skip-counting from a number
 * that is not a round one.
 *
 *   answer                                 s+k, s+2k, s+3k
 *   counted-by-ones-instead-of-the-given-step   s+1, s+2, s+3
 *   skip-counted-by-the-wrong-step         s+w, s+2w, s+3w   (w != k, from the
 *                                                             other two steps)
 *   listed-the-starting-number-as-the-first-count  s, s+k, s+2k
 *
 * Distinctness. The first numbers of the four lists are s+k, s+1, s+w and s,
 * and k, 1, w and 0 are four different offsets for every draw (k and w are
 * both in {5,10,100} and differ; neither is 1 or 0), so no two option strings
 * can ever be equal. Nothing is resampled and nothing is excluded.
 */
export const SKIP_STEPS = [5, 10, 100] as const;

/** The three numbers a count of `step` from `start` produces, as one string. */
function listFrom(start: number, step: number): string {
  return `${start + step}, ${start + 2 * step}, ${start + 3 * step}`;
}

export const nbt2SkipCount: QuestionTemplate = {
  id: 'g2.nbt2.skip-count',
  standardCode: 'NC.2.NBT.2',
  domainId: 'NBT',
  difficulty: 'mastery',
  calculatorAllowed: false,
  isStretch: false,

  generate(rng: Rng): GeneratedQuestion {
    const step = rng.pick(SKIP_STEPS);

    let start: number;
    if (step === 5) {
      start = 5 * rng.int(21, 139);
    } else if (step === 10) {
      start = 10 * rng.int(10, 68) + rng.int(1, 9);
    } else {
      start = 100 * rng.int(1, 6) + 10 * rng.int(1, 9) + rng.int(1, 9);
    }

    const wrongStep = rng.pick(SKIP_STEPS.filter((s) => s !== step));
    const answerText = listFrom(start, step);

    const candidates = [
      { text: answerText, isCorrect: true },
      // Counted on by ones rather than taking steps of `step`.
      {
        text: `${start + 1}, ${start + 2}, ${start + 3}`,
        isCorrect: false,
        misconception: 'counted-by-ones-instead-of-the-given-step',
      },
      // Stepped by one of the other two intervals the standard names.
      {
        text: listFrom(start, wrongStep),
        isCorrect: false,
        misconception: 'skip-counted-by-the-wrong-step',
      },
      // Wrote the number the count starts FROM as the first number counted, so
      // the whole list sits one step early.
      {
        text: `${start}, ${start + step}, ${start + 2 * step}`,
        isCorrect: false,
        misconception: 'listed-the-starting-number-as-the-first-count',
      },
    ];

    const texts = candidates.map((c) => c.text);
    if (new Set(texts).size !== texts.length) {
      throw new Error(`g2.nbt2.skip-count: option collision [${texts.join(' | ')}]`);
    }

    const placeMoved =
      step === 100
        ? 'Only the hundreds digit changes; the tens and the ones ride along unchanged.'
        : step === 10
          ? 'Only the tens change; the ones digit rides along unchanged.'
          : 'Every number counted by 5s from here ends in the same two digits, over and over.';

    return {
      prompt: 'Skip-count. What are the next three numbers?',
      promptDetails: `Start at ${start} and count by ${step}s`,
      options: labelOptions(rng.shuffle(candidates)),
      answerText,
      explanation: {
        stepByStep: [
          `Step 1: Skip-counting by ${step}s means adding ${step} each time.`,
          `Step 2: ${start} + ${step} = ${start + step}. ${placeMoved}`,
          `Step 3: ${start + step} + ${step} = ${start + 2 * step}, and ${start + 2 * step} + ${step} = ${start + 3 * step}.`,
          `Step 4: The next three numbers are ${answerText}.`,
        ],
        conceptSummary:
          'A skip count is the same amount added over and over. Starting from a number that is not a multiple of the step is no harder — the step still lands on the same place value every time.',
        commonMisconception: `The number you start from is not one of the numbers you say next, so ${start} does not belong in the list. Putting it first pushes every other number one step too early.`,
      },
    };
  },
};
