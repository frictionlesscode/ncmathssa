import type { Rng } from '../../../engine/rng';
import type { QuestionTemplate, GeneratedQuestion } from '../../../engine/template';
import { labelOptions } from '../../../engine/questionModel';

/**
 * NC.1.OA.6 — "Add and subtract, within 20, using strategies." NOT fluency
 * within 10: that is NC.1.OA.9, and the Task 22 brief had the two codes the
 * wrong way round (ruling 22-1). This standard's keyConcepts are the
 * strategies themselves, so this generator drills one of them by name —
 * MAKING TEN — on a one-digit + one-digit fact that crosses 10, and its
 * worked solution says so in its first step (ruling 22-4).
 *
 * Addition only. Subtraction by getting to 10 first is its own template,
 * `./oa6-get-to-ten-subtract.ts`, because a review key is seedless: one
 * template drawing both would let a child who failed the take-away be
 * re-served an addition, pass it, and have the failure retired.
 *
 * ---------------------------------------------------------------------------
 * a, b in 2..9 with a + b >= 11, either order. Let big = max(a, b),
 * small = min(a, b), need = 10 − big (what big needs to make 10, 1..8) and
 * rest = small − need = a + b − 10 (what is left, 1..8). 36 ordered facts.
 *
 *   answer                                          10 + rest
 *   used-the-wrong-part-after-making-ten            10 + need   (= 20 − big)
 *   used-the-whole-number-after-breaking-it-apart   10 + small
 *   counted-the-start-number-as-a-hop               a + b − 1   (counting on
 *                                                   small from big, saying big)
 *   or counted-on-by-ones-one-too-many              a + b + 1   (coin flip)
 *
 * Collisions, solved:
 *
 *   10 + need  = 10 + rest     =>  need = rest, small = 2.need.
 *                                  EXCLUDED always: 9+2, 8+4, 7+6, both ways (6).
 *   10 + need  = a + b − 1     =>  need = rest − 1, small = 2.need + 1.
 *                                  EXCLUDED from the hop: 9+3, 8+5 both ways,
 *                                  and 7+7 (5).
 *   10 + need  = a + b + 1     =>  need = rest + 1, small = 2.need − 1.
 *                                  EXCLUDED from the over-count: 8+3, 7+5,
 *                                  both ways (4).
 *   10 + small = a + b + 1     =>  need = 1, big = 9.
 *                                  EXCLUDED from the over-count: every fact
 *                                  with a 9 (15, two already gone above).
 *   10 + small = a + b or a + b − 1  =>  need = 0 or −1.   Never.
 *   10 + small = 10 + need     =>  rest = 0.   Never: a + b >= 11.
 *
 * 25 facts remain for the hop and 13 for the over-count. They are removed
 * when the lists are built, never by resampling, and the sibling test shows
 * each removed fact really collides.
 *
 * NO SIZE TELL. Adding all of small always overshoots, but the wrong part
 * lands above the key when need > rest and below it when need < rest, and the
 * counting slip lands on either side, so the key is the smallest, second or
 * third option depending on the draw.
 */
export interface MakeTenFact {
  a: number;
  b: number;
}

export const ALL_MAKE_TEN_FACTS: MakeTenFact[] = [];
for (let a = 2; a <= 9; a++) {
  for (let b = 2; b <= 9; b++) {
    if (a + b >= 11) ALL_MAKE_TEN_FACTS.push({ a, b });
  }
}

function collides({ a, b }: MakeTenFact, slip: 'hop' | 'over'): boolean {
  const big = Math.max(a, b);
  const small = Math.min(a, b);
  const need = 10 - big;
  const rest = small - need;
  if (need === rest) return true;
  if (slip === 'hop') return need === rest - 1;
  return need === rest + 1 || big === 9;
}

export const MAKE_TEN_DRAWS: Record<'hop' | 'over', MakeTenFact[]> = {
  hop: ALL_MAKE_TEN_FACTS.filter((f) => !collides(f, 'hop')),
  over: ALL_MAKE_TEN_FACTS.filter((f) => !collides(f, 'over')),
};

export const oa6MakeTenAdd: QuestionTemplate = {
  id: 'g1.oa6.make-ten-add',
  standardCode: 'NC.1.OA.6',
  domainId: 'OA',
  difficulty: 'mastery',
  calculatorAllowed: false,
  isStretch: false,

  generate(rng: Rng): GeneratedQuestion {
    const slip = rng.pick(['hop', 'over'] as const);
    const { a, b } = rng.pick(MAKE_TEN_DRAWS[slip]);
    const big = Math.max(a, b);
    const small = Math.min(a, b);
    const need = 10 - big;
    const rest = small - need;
    const sum = a + b;

    const answerText = `${sum}`;
    const candidates = [
      { text: answerText, isCorrect: true },
      // 10 + need: added the part that already went into the ten.
      { text: `${10 + need}`, isCorrect: false, misconception: 'used-the-wrong-part-after-making-ten' },
      // 10 + small: made the ten, then added all of small again.
      { text: `${10 + small}`, isCorrect: false, misconception: 'used-the-whole-number-after-breaking-it-apart' },
      slip === 'hop'
        ? // Counting on small from big, saying big as the first count.
          { text: `${sum - 1}`, isCorrect: false, misconception: 'counted-the-start-number-as-a-hop' }
        : { text: `${sum + 1}`, isCorrect: false, misconception: 'counted-on-by-ones-one-too-many' },
    ];

    const texts = candidates.map((c) => c.text);
    if (new Set(texts).size !== texts.length) {
      throw new Error(`g1.oa6.make-ten-add: option collision [${texts.join(' | ')}]`);
    }

    return {
      prompt: `Make a ten to help. What is ${a} + ${b}?`,
      options: labelOptions(rng.shuffle(candidates)),
      answerText,
      explanation: {
        stepByStep: [
          `Step 1: Use making ten. Start with ${big}: it needs ${need} more to make 10.`,
          `Step 2: Break ${small} into ${need} and ${rest}.`,
          `Step 3: ${big} + ${need} = 10, and 10 + ${rest} = ${sum}.`,
          `Step 4: ${a} + ${b} = ${sum}.`,
        ],
        conceptSummary:
          'Making ten turns a hard fact into an easy one: fill the bigger number up to 10, then add what is left. Ten plus a number is quick to know.',
        commonMisconception: `Making the ten uses ${need} of the ${small}, so only ${rest} is left to add. Adding all ${small} again gives ${10 + small}.`,
      },
    };
  },
};
