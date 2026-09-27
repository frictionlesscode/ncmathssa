import type { Rng } from '../../../engine/rng';
import type { QuestionTemplate, GeneratedQuestion } from '../../../engine/template';
import { labelOptions } from '../../../engine/questionModel';

/**
 * NC.2.MD.1 — "Measure the length of an object in standard units by selecting
 * and using appropriate tools such as rulers, yardsticks, meter sticks, and
 * measuring tapes."
 *
 * This generator is the USING half: reading a ruler, in one standard unit
 * (inches or centimeters) per question. The SELECTING half — which tool suits
 * a hallway, a crayon, a rug, and why a footstep is not a foot — is a question
 * about the tool rather than about a number, and is authored in
 * `../authored.md.ts` (g2-md1-01..03). NC.2.MD.2 (the same object in two
 * units) has its own generator, `./md2-two-units.ts`, and never shares this
 * review key (ruling 19-2).
 *
 * THE OBJECT NEVER STARTS AT 0. Its left end sits on a mark from 2 to 5, which
 * is what makes the brief's first named error — "measuring from the end of a
 * ruler rather than from zero" — a live option at every seed: a child who
 * reads the number under the object's right end has counted every unit from 0
 * as if the object began there.
 *
 * ---------------------------------------------------------------------------
 * THE DRAW SPACE
 *
 *   s  the start mark, 2..5
 *   d  the length, 2..7, d != s    so e = s + d, the end mark, is at most 12
 *   and a coin flip choosing which mark-counting error is offered.
 *
 * d != s keeps the key off every number the figure prints: a child who
 * answers with the mark the object starts on never lands on the right answer
 * by accident. (The key can never be e, since s >= 2, nor 0 or 12.)
 *
 *   answer                                          d
 *   read-the-end-mark-without-starting-at-zero      e = s + d
 *   added-instead-of-subtracted                     e + s = 2s + d
 *   counted-the-ruler-marks-not-the-spaces          d + 1   (flip = over)
 *   counted-only-the-marks-between-the-ends         d - 1   (flip = under)
 *
 * WHY THE FLIP. Every other ruler error overshoots. With only overshooting
 * distractors the answer would be the smallest option at every seed, and
 * "pick the smallest" would answer the whole template without a ruler in
 * sight. The undercount moves the key between smallest and second smallest.
 * Both flips ask the identical question — the length of an object on a ruler
 * — and share two of their three distractors; the third is one error,
 * counting marks instead of spaces, in its two directions. So one review key
 * still means one skill. The cost, stated plainly: a child who chose d + 1 may
 * be re-served the other flip, where d + 1 is not on offer. What that re-serve
 * retests is still reading the same ruler, not a different operation — unlike
 * an addition/subtraction coin flip, which is why this is not split into two
 * templates.
 *
 * Pairwise distinctness, with s >= 2 and d >= 2:
 *
 *   d     = e          =>  s = 0.            Never: s >= 2.
 *   d     = 2s + d     =>  s = 0.            Never.
 *   d     = d +- 1                           Never.
 *   e     = 2s + d     =>  s = 0.            Never.
 *   e     = d + 1      =>  s = 1.            EXCLUDED: s starts at 2.
 *   e     = d - 1      =>  s = -1.           Never.
 *   2s+d  = d + 1      =>  2s = 1.           Never.
 *   2s+d  = d - 1      =>  2s = -1.          Never.
 *
 * So the only option collision is a start mark of 1, where the end-mark
 * reading and the counted-marks count are the same number; the draw space
 * starts at 2 by construction and nothing is resampled. d >= 2 keeps the undercount d - 1 at
 * 1 or more, so no option is ever a zero length. 4 start marks x 6 lengths,
 * less the 4 spans with d = s, leaves 20; the sibling test walks all 20 in
 * both flips and shows the excluded s = 1 really collides.
 */
export interface RulerSpan {
  /** The mark the object's left end sits on. */
  s: number;
  /** The object's length in whole units. */
  d: number;
}

export const RULER_SPANS: RulerSpan[] = [];
for (let s = 2; s <= 5; s++) {
  for (let d = 2; d <= 7; d++) {
    if (d === s) continue; // the key would be the start mark the figure prints
    RULER_SPANS.push({ s, d });
  }
}

interface Unit {
  singular: string;
  plural: string;
}

const UNITS: Unit[] = [
  { singular: 'inch', plural: 'inches' },
  { singular: 'centimeter', plural: 'centimeters' },
];

/** Things a child lays along a ruler that are sensibly 2 to 7 inches or
 *  centimeters long. */
const OBJECTS = ['ribbon', 'piece of yarn', 'twig', 'feather', 'leaf', 'strip of paper'];

export const md1ReadARuler: QuestionTemplate = {
  id: 'g2.md1.read-a-ruler',
  standardCode: 'NC.2.MD.1',
  domainId: 'MD',
  difficulty: 'mastery',
  calculatorAllowed: false,
  isStretch: false,

  generate(rng: Rng): GeneratedQuestion {
    const object = rng.pick(OBJECTS);
    const unit = rng.pick(UNITS);
    const { s, d } = rng.pick(RULER_SPANS);
    const over = rng.int(0, 1) === 1;
    const e = s + d;

    const length = (n: number) => `${n} ${n === 1 ? unit.singular : unit.plural}`;
    const answerText = length(d);

    const candidates = [
      { text: answerText, isCorrect: true },
      // e: read the number under the object's right end, counting every unit
      // from 0 although the object starts at s.
      {
        text: length(e),
        isCorrect: false,
        misconception: 'read-the-end-mark-without-starting-at-zero',
      },
      // e + s: added the two mark numbers instead of taking one from the other.
      { text: length(e + s), isCorrect: false, misconception: 'added-instead-of-subtracted' },
      over
        ? // d + 1: counted the marks from s to e, both ends included.
          {
            text: length(d + 1),
            isCorrect: false,
            misconception: 'counted-the-ruler-marks-not-the-spaces',
          }
        : // d - 1: counted only the marks strictly between s and e.
          {
            text: length(d - 1),
            isCorrect: false,
            misconception: 'counted-only-the-marks-between-the-ends',
          },
    ];

    const texts = candidates.map((c) => c.text);
    if (new Set(texts).size !== texts.length) {
      throw new Error(`g2.md1.read-a-ruler: option collision [${texts.join(' | ')}]`);
    }

    const jumps = Array.from({ length: d }, (_, i) => s + i + 1).join(', ');

    return {
      prompt: `Use the ruler. How long is the ${object}?`,
      promptDetails: `A ruler marked in ${unit.plural}. The marks are numbered 0 to 12, one ${unit.singular} apart. The ${object} lies along the ruler. Its left end is at the ${s} mark. Its right end is at the ${e} mark.`,
      options: labelOptions(rng.shuffle(candidates)),
      answerText,
      explanation: {
        stepByStep: [
          `Step 1: The ${object} does not start at 0. Its left end is at the ${s} mark, so the ${unit.plural} before that are not part of it.`,
          `Step 2: Count the spaces from the ${s} mark to the ${e} mark, not the marks: ${jumps}. That is ${length(d)}.`,
          `Step 3: Check by subtracting the start from the end: ${e} − ${s} = ${d}.`,
          `Step 4: The ${object} is ${answerText} long.`,
        ],
        conceptSummary:
          'A length is how many unit spaces an object covers. When it does not start at 0, count the spaces from where it really starts — or subtract the start mark from the end mark.',
        commonMisconception: `Reading the ${e} at the right end gives ${length(e)}, but that counts from 0, and the ${object} starts at the ${s} mark.`,
      },
    };
  },
};
