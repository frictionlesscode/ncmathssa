import type { Rng } from '../../../engine/rng';
import type { QuestionTemplate, GeneratedQuestion } from '../../../engine/template';
import { labelOptions } from '../../../engine/questionModel';

/**
 * NC.2.MD.10 — "Organize, represent, and interpret data with up to four
 * categories." keyConcepts: draw a picture graph and a bar graph with a
 * SINGLE-UNIT scale; solve simple put-together, take-apart and compare
 * problems using a picture and a bar graph.
 *
 * This generator is ONE of those problem types — COMPARE, "how many more" —
 * read off a bar graph of four categories on a scale that counts by ones from
 * 0 to 15. Put-together and take-apart are different operations with
 * different errors, and a seedless review key could otherwise re-serve a
 * failed subtraction as an addition, so they are authored in
 * `../authored.md.ts` along with the "organize and represent" half of the
 * standard (ruling 19-4: given a tally chart, which bar graph shows it?).
 *
 * No scale of 2 or 5 (that is Grade 3's NC.3.MD.3), no fifth category, and no
 * line plot — NC.2.MD.9 does not exist in NC.
 *
 * ---------------------------------------------------------------------------
 * THE DRAW
 *
 * The question compares category A with category B; a third category C is
 * the "wrong bar", and a fourth, D, fills the graph. With bar heights a, b, c
 * and d, all from 1..15:
 *
 *   answer                            a - b
 *   added-instead-of-subtracted       a + b
 *   forgot-the-final-step             a        (read the first bar, stopped)
 *   used-the-wrong-given-quantity     a - c    (subtracted a bar the question
 *                                               did not ask about)
 *
 * (a, b, c) comes from BAR_TRIPLES, built once:
 *
 *   b < a,  c < a,  b != c
 *   a != b + c          else a - b = c and a - c = b
 *   a != 2b, a != 2c    else a - b = b, or a - c = c
 *
 * and d is drawn from the heights left over once a, b, c, a - b, a - c and
 * a + b are all taken out — at least 9 of the 15 always remain. The four
 * heights are then dealt to the four categories in a shuffled order.
 *
 * Those exclusions are about the FIGURE, not just the options: apart from a
 * itself, which is the forgot-the-final-step reading by design, no option is
 * the height of any bar on the graph. Without them a child who read the wrong
 * bar could land on the key by accident, or a child who read bar B and
 * stopped could land on an option tagged with some other error — and the tag
 * would then tell a parent the wrong story.
 *
 * Pairwise distinctness of the four options, with a, b, c >= 1 all different:
 *
 *   a - b = a + b  =>  b = 0.       Never.
 *   a - b = a      =>  b = 0.       Never.
 *   a - b = a - c  =>  b = c.       Never: b != c.
 *   a + b = a      =>  b = 0.       Never.
 *   a + b = a - c  =>  b = -c.      Never.
 *   a     = a - c  =>  c = 0.       Never.
 *
 * Of the 910 ordered triples with b, c < a and b != c, 98 have a = b + c and
 * 84 more have a = 2b or a = 2c; 728 remain. Nothing is resampled.
 *
 * NO SIZE TELL. a + b and a are always above the key, but a - c is below it
 * when c > b and above it when c < b — exactly half the triples each way — so
 * the key is sometimes the smallest option and sometimes the second smallest.
 */
export interface Survey {
  title: string;
  voters: string;
  voterSingular: string;
  /** In-sentence (lower case) names of the four categories. */
  categories: [string, string, string, string];
}

export const SURVEYS: Survey[] = [
  {
    title: 'Our Favorite Fruit',
    voters: 'students',
    voterSingular: 'student',
    categories: ['apples', 'bananas', 'grapes', 'oranges'],
  },
  {
    title: 'Our Favorite Pets',
    voters: 'children',
    voterSingular: 'child',
    categories: ['dogs', 'cats', 'fish', 'birds'],
  },
  {
    title: 'Our Favorite Seasons',
    voters: 'students',
    voterSingular: 'student',
    categories: ['spring', 'summer', 'fall', 'winter'],
  },
  {
    title: 'Our Favorite Recess Games',
    voters: 'kids',
    voterSingular: 'kid',
    categories: ['tag', 'soccer', 'jump rope', 'hopscotch'],
  },
  {
    title: 'Our Favorite Colors',
    voters: 'students',
    voterSingular: 'student',
    categories: ['red', 'blue', 'green', 'yellow'],
  },
];

/** The top of the scale. Every bar is 1..SCALE_TOP on a scale of one. */
export const SCALE_TOP = 15;

const HEIGHTS = Array.from({ length: SCALE_TOP }, (_, i) => i + 1);

export interface BarTriple {
  /** The first bar named — always the taller of the two compared. */
  a: number;
  /** The second bar named. */
  b: number;
  /** The bar the question does not ask about. */
  c: number;
}

export const BAR_TRIPLES: BarTriple[] = [];
for (let a = 2; a <= SCALE_TOP; a++) {
  for (let b = 1; b < a; b++) {
    for (let c = 1; c < a; c++) {
      if (b === c) continue;
      if (a === b + c) continue; // a - b would be bar C, and a - c bar B
      if (a === 2 * b || a === 2 * c) continue; // a - b would be bar B, or a - c bar C
      BAR_TRIPLES.push({ a, b, c });
    }
  }
}

const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

export const md10BarGraphHowManyMore: QuestionTemplate = {
  id: 'g2.md10.bar-graph-how-many-more',
  standardCode: 'NC.2.MD.10',
  domainId: 'MD',
  difficulty: 'mastery',
  calculatorAllowed: false,
  isStretch: false,

  generate(rng: Rng): GeneratedQuestion {
    const survey = rng.pick(SURVEYS);
    const { a, b, c } = rng.pick(BAR_TRIPLES);
    // The fourth bar may not be any option's value either.
    const taken = new Set([a, b, c, a - b, a - c, a + b]);
    const d = rng.pick(HEIGHTS.filter((h) => !taken.has(h)));

    // Deal a, b, c, d to the four categories in a shuffled order.
    const slots = rng.shuffle([0, 1, 2, 3]);
    const heights: number[] = [];
    [a, b, c, d].forEach((h, i) => {
      heights[slots[i]] = h;
    });
    const nameA = survey.categories[slots[0]];
    const nameB = survey.categories[slots[1]];

    const count = (n: number) => `${n} ${n === 1 ? survey.voterSingular : survey.voters}`;
    const answerText = count(a - b);

    const candidates = [
      { text: answerText, isCorrect: true },
      // Put the two bars together instead of comparing them.
      { text: count(a + b), isCorrect: false, misconception: 'added-instead-of-subtracted' },
      // Read the first bar named and stopped there.
      { text: count(a), isCorrect: false, misconception: 'forgot-the-final-step' },
      // Took away a bar the question did not ask about.
      { text: count(a - c), isCorrect: false, misconception: 'used-the-wrong-given-quantity' },
    ];

    const texts = candidates.map((x) => x.text);
    if (new Set(texts).size !== texts.length) {
      throw new Error(`g2.md10.bar-graph-how-many-more: option collision [${texts.join(' | ')}]`);
    }

    const bars = survey.categories
      .map((cat, i) => `${capitalize(cat)}: the bar reaches ${heights[i]}.`)
      .join(' ');

    return {
      prompt: `Use the bar graph. How many more ${survey.voters} chose ${nameA} than ${nameB}?`,
      promptDetails: `Bar graph titled "${survey.title}". The scale counts by ones, from 0 to ${SCALE_TOP}. ${bars}`,
      options: labelOptions(rng.shuffle(candidates)),
      answerText,
      explanation: {
        stepByStep: [
          `Step 1: Find the ${nameA} bar. It reaches ${a}.`,
          `Step 2: Find the ${nameB} bar. It reaches ${b}.`,
          `Step 3: "How many more" means find the difference: ${a} − ${b} = ${a - b}.`,
          `Step 4: The difference is ${answerText}. That is how many more ${survey.voters} chose ${nameA} than ${nameB}.`,
        ],
        conceptSummary:
          'A "how many more" question compares two bars. Read both off the scale, then subtract the shorter bar from the taller one — the difference is how far the taller bar sticks up past the shorter one.',
        commonMisconception: `Adding the two bars gives ${a + b}, which is how many ${survey.voters} chose ${nameA} or ${nameB} altogether — not how many more chose ${nameA}.`,
      },
    };
  },
};
