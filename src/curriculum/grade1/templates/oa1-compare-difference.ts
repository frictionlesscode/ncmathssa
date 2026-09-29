import type { Rng } from '../../../engine/rng';
import type { QuestionTemplate, GeneratedQuestion } from '../../../engine/template';
import { labelOptions } from '../../../engine/questionModel';

/**
 * NC.1.OA.1 — "Represent and solve addition and subtraction word problems,
 * within 20, with unknowns". The sourced keyConcepts name three problem types
 * and ruling 22-2 makes them the substance of the standard. The authored bank
 * (`../authored.oa.ts`) writes one of each by hand; this generator gives fresh
 * numbers to ONE of them, COMPARE — DIFFERENCE UNKNOWN, "the type
 * first-graders fail most" (ruling 22-2): "Ana has 9 cars and Ben has 14. How
 * many more cars does Ben have than Ana?"
 *
 * One problem type, not a coin flip between three. A review key is seedless
 * (`{kind:'generated', templateId}`), so a template that sometimes asked a
 * take-from problem would let a child who failed a compare item be re-served
 * the easier type, pass it, and have the compare failure retired as mastered.
 * "More" and "fewer" are both drawn because they ask for the SAME number and
 * share every misconception tag; the words differ, the skill does not.
 *
 * ---------------------------------------------------------------------------
 * THE DRAW SPACE — within 20
 *
 * small in 2..18 and big in small+2..20, so d = big − small is at least 2 and
 * the short count d − 1 is at least 1. 153 pairs.
 *
 *   answer                                     d = big − small
 *   added-instead-of-subtracted                small + big
 *   gave-an-amount-instead-of-the-difference   the ASKED child's amount:
 *                                              big for "more", small for "fewer"
 *   counted-the-start-number-as-a-hop          d + 1   (counting up from
 *                                              small and saying small first)
 *   or counted-on-by-ones-and-stopped-one-short   d − 1 (coin flip)
 *
 * Collisions, solved:
 *
 *   small + big vs the rest:  small + big > big >= d + 2, and > small.  Never.
 *   big ("more") vs d:        big = big − small  => small = 0.   Never.
 *   big ("more") vs d ± 1:    small = ∓1.                   Never.
 *   small ("fewer") vs d:     small = big − small => big = 2.small.
 *                             EXCLUDED from both "fewer" lists (9 pairs).
 *   small vs d + 1 (hop):     big = 2.small − 1.  EXCLUDED from fewer-hop (8).
 *   small vs d − 1 (short):   big = 2.small + 1.  EXCLUDED from fewer-short (8).
 *
 * The pairs are removed when the four lists are built, never by resampling,
 * and the sibling test shows each removed pair really collides.
 *
 * NO SIZE TELL. The sum and the "more" amount always sit above the key, but
 * the counting slip lands on either side of it and a "fewer" question's
 * amount (the smaller one) lands on either side too, so the key is the
 * smallest, second or third option depending on the draw. Which child is
 * named first is drawn as well, so the first number read is not always the
 * smaller one.
 */
export interface ComparePair {
  small: number;
  big: number;
}

export type CompareMode = 'more' | 'fewer';
export type CountSlip = 'hop' | 'short';

export const ALL_COMPARE_PAIRS: ComparePair[] = [];
for (let small = 2; small <= 18; small++) {
  for (let big = small + 2; big <= 20; big++) ALL_COMPARE_PAIRS.push({ small, big });
}

function collides({ small, big }: ComparePair, mode: CompareMode, slip: CountSlip): boolean {
  if (mode === 'more') return false;
  const d = big - small;
  return small === d || small === (slip === 'hop' ? d + 1 : d - 1);
}

export const COMPARE_DRAWS: Record<`${CompareMode}-${CountSlip}`, ComparePair[]> = {
  'more-hop': ALL_COMPARE_PAIRS.filter((p) => !collides(p, 'more', 'hop')),
  'more-short': ALL_COMPARE_PAIRS.filter((p) => !collides(p, 'more', 'short')),
  'fewer-hop': ALL_COMPARE_PAIRS.filter((p) => !collides(p, 'fewer', 'hop')),
  'fewer-short': ALL_COMPARE_PAIRS.filter((p) => !collides(p, 'fewer', 'short')),
};

const NAMES = ['Ana', 'Ben', 'Kim', 'Leo', 'Max', 'Mia', 'Sam', 'Zoe'];
const NOUNS = ['cars', 'shells', 'books', 'rocks', 'beads', 'cards'];

export const oa1CompareDifference: QuestionTemplate = {
  id: 'g1.oa1.compare-difference',
  standardCode: 'NC.1.OA.1',
  domainId: 'OA',
  difficulty: 'mastery',
  calculatorAllowed: false,
  isStretch: false,

  generate(rng: Rng): GeneratedQuestion {
    const mode = rng.pick(['more', 'fewer'] as const);
    const slip = rng.pick(['hop', 'short'] as const);
    const { small, big } = rng.pick(COMPARE_DRAWS[`${mode}-${slip}`]);
    const noun = rng.pick(NOUNS);
    const bigName = rng.pick(NAMES);
    const smallName = rng.pick(NAMES.filter((n) => n !== bigName));
    const bigFirst = rng.pick([true, false]);
    const d = big - small;

    const setup = bigFirst
      ? `${bigName} has ${big} ${noun} and ${smallName} has ${small}.`
      : `${smallName} has ${small} ${noun} and ${bigName} has ${big}.`;
    const question =
      mode === 'more'
        ? `How many more ${noun} does ${bigName} have than ${smallName}?`
        : `How many fewer ${noun} does ${smallName} have than ${bigName}?`;

    const answerText = `${d}`;
    const candidates = [
      { text: answerText, isCorrect: true },
      // small + big: "more" (or any comparing) read as "put them together".
      { text: `${small + big}`, isCorrect: false, misconception: 'added-instead-of-subtracted' },
      // How many the child in the question HAS, not how many more or fewer.
      {
        text: `${mode === 'more' ? big : small}`,
        isCorrect: false,
        misconception: 'gave-an-amount-instead-of-the-difference',
      },
      slip === 'hop'
        ? // Counting up from small to big and saying small as the first count:
          // small, small+1, ..., big is d + 1 numbers.
          { text: `${d + 1}`, isCorrect: false, misconception: 'counted-the-start-number-as-a-hop' }
        : // Counting up from small and stopping one number before big.
          { text: `${d - 1}`, isCorrect: false, misconception: 'counted-on-by-ones-and-stopped-one-short' },
    ];

    const texts = candidates.map((c) => c.text);
    if (new Set(texts).size !== texts.length) {
      throw new Error(`g1.oa1.compare-difference: option collision [${texts.join(' | ')}]`);
    }

    return {
      prompt: `${setup} ${question}`,
      options: labelOptions(rng.shuffle(candidates)),
      answerText,
      explanation: {
        stepByStep: [
          `Step 1: ${bigName} has ${big} ${noun}. ${smallName} has ${small} ${noun}.`,
          // NC.1.OA.1 is solved "using ... equations with a symbol for the
          // unknown number": the gap is what goes with the smaller amount to
          // make the bigger one, for "more" and "fewer" alike.
          `Step 2: Write it as ${small} + ☐ = ${big}.`,
          `Step 3: Count on from ${small} up to ${big}. The first number to say is ${small + 1}.`,
          `Step 4: That is ${d} counts, so ${big} − ${small} = ${d}.`,
          mode === 'more'
            ? `Step 5: ${bigName} has ${d} more ${noun} than ${smallName}.`
            : `Step 5: ${smallName} has ${d} fewer ${noun} than ${bigName}.`,
        ],
        conceptSummary:
          '"How many more" and "how many fewer" both ask for the difference between two amounts, and it is the same number either way. Counting on from the smaller amount up to the bigger one finds it.',
        commonMisconception: `Adding ${small} + ${big} = ${small + big} finds how many ${noun} there are in all, not how many ${mode} one child has than the other.`,
      },
    };
  },
};
