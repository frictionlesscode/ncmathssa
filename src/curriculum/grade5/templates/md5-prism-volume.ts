import type { Rng } from '../../../engine/rng';
import type { QuestionTemplate, GeneratedQuestion } from '../../../engine/template';
import { labelOptions } from '../../../engine/questionModel';

const DIMENSIONS = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

/**
 * Heights that would make two of the four option values equal, for a given
 * base. Solving each possible collision for h and refusing those heights is
 * what makes the options distinct by construction.
 *
 *   l*w   = l + w + h        => h = (l-1)(w-1) - 1
 *   l*w   = 2(l + w + h)     => h = (l*w - 2l - 2w) / 2
 *   l*w*h = 2(l + w + h)     => h = 2(l + w) / (l*w - 2)
 *   l*w*h = l + w + h        => h = (l + w) / (l*w - 1)
 *
 * The other two pairs cannot tie at all: l*w*h = l*w needs h = 1, below the
 * range, and l + w + h never equals 2(l + w + h) for a positive sum. At most
 * four heights are ever excluded from eleven, and a sweep of every base
 * shows at least ten always remain.
 */
function excludedHeights(l: number, w: number): Set<number> {
  const out = new Set<number>();
  out.add((l - 1) * (w - 1) - 1);
  const twiceSum = (l * w - 2 * l - 2 * w) / 2;
  if (Number.isInteger(twiceSum)) out.add(twiceSum);
  const volumeTwiceSum = (2 * (l + w)) / (l * w - 2);
  if (Number.isInteger(volumeTwiceSum)) out.add(volumeTwiceSum);
  const volumeSum = (l + w) / (l * w - 1);
  if (Number.isInteger(volumeSum)) out.add(volumeSum);
  return out;
}

/**
 * NC.5.MD.5 — volume of a right rectangular prism.
 *
 * Ruling F6: the brief's third distractor, l*w*h/h, is algebraically l*w and
 * would have duplicated the used-area-not-volume option at every seed. The
 * replacements are the edge sum and twice the edge sum, which share a tag —
 * two options may share a tag, but never a value.
 *
 * An exhaustive sweep of all 1,269 admissible (l, w, h) triples finds no
 * collision; unconstrained, 62 of 1,331 collide.
 */
export const md5PrismVolume: QuestionTemplate = {
  id: 'g5.md5.prism-volume',
  standardCode: 'NC.5.MD.5',
  domainId: 'MD',
  difficulty: 'mastery',
  calculatorAllowed: true,
  isStretch: false,

  generate(rng: Rng): GeneratedQuestion {
    const l = rng.int(2, 12);
    const w = rng.int(2, 12);
    const barred = excludedHeights(l, w);
    const h = rng.pick(DIMENSIONS.filter((d) => !barred.has(d)));

    const baseArea = l * w;
    const edgeSum = l + w + h;
    const volume = baseArea * h;

    const candidates = [
      { text: `${volume}`, isCorrect: true },
      { text: `${baseArea}`, isCorrect: false, misconception: 'used-area-not-volume' },
      { text: `${2 * edgeSum}`, isCorrect: false, misconception: 'used-perimeter-formula' },
      { text: `${edgeSum}`, isCorrect: false, misconception: 'used-perimeter-formula' },
    ];

    const texts = candidates.map((c) => c.text);
    if (new Set(texts).size !== texts.length) {
      throw new Error(`g5.md5.prism-volume: option collision [${texts.join(' | ')}]`);
    }

    return {
      prompt:
        'A right rectangular prism is built from unit cubes. What is its volume, in cubic units?',
      promptDetails: `l = ${l}, w = ${w}, h = ${h}`,
      options: labelOptions(rng.shuffle(candidates)),
      answerText: `${volume}`,
      explanation: {
        stepByStep: [
          `Step 1: Volume counts the unit cubes that fill the solid, so all three dimensions are used: V = l × w × h.`,
          `Step 2: One layer on the base holds ${l} × ${w} = ${baseArea} cubes.`,
          `Step 3: The prism is ${h} layers tall: ${baseArea} × ${h} = ${volume}.`,
          `Step 4: The volume is ${volume} cubic units.`,
        ],
        conceptSummary:
          'Volume is the base area repeated once for every layer of height, which is why all three dimensions multiply together. Adding the dimensions instead measures edges, not space.',
        commonMisconception:
          'Units are the giveaway: a sum of lengths is still units, an area is square units, and only a three-way product gives cubic units.',
      },
    };
  },
};
