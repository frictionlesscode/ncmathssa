import type { Rng } from '../../../engine/rng';
import type { QuestionTemplate, GeneratedQuestion } from '../../../engine/template';
import { labelOptions } from '../../../engine/questionModel';

/**
 * NC.3.MD.7 — "Relate area to the operations of multiplication and addition",
 * whose second keyConcept is "MULTIPLY SIDE LENGTHS to find areas of rectangles
 * with whole-number side lengths IN THE CONTEXT OF SOLVING PROBLEMS."
 *
 * RULING 14-5. This is the half of Grade 3 area that is about not counting:
 * the child is given two side lengths as numbers, in a context, with no tiles
 * drawn anywhere, and multiplies. ./md5-tile-and-count-unit-squares.ts is the
 * other half and prints no numbers at all — see its file comment for why the
 * two cannot be one generator.
 *
 * NC.3.MD.7's THIRD keyConcept, decomposing a rectangle into two smaller ones
 * and adding their areas, is NOT generated. It is a reasoning move about why
 * area behaves that way, and fresh numbers do not change what makes it hard,
 * so it is authored as `g3-md7-02` in ../authored.md.ts. A bank of three
 * length-times-width items would have marked the standard covered with a third
 * of its sourced text unwritten.
 *
 * UNITS ARE CUSTOMARY (ruling 14-1). Grade 3's measurement units in NC are
 * inches, feet and yards; centimeters and meters are Grade 4's NC.4.MD.1, and
 * ../authored.md.test.ts sweeps every seed of this generator for one.
 *
 * ---------------------------------------------------------------------------
 * Construction. L and W in 2..9 with L != W, so the figure is a genuine
 * rectangle rather than a square and "long" and "wide" mean something.
 *
 *   answer                                L*W
 *   added-only-the-two-given-sides        L + W     added the two numbers
 *                                                   given, which is half a
 *                                                   perimeter and no area
 *   used-perimeter-formula                2(L+W)    found the distance around
 *                                                   instead of the space inside
 *   skip-counted-one-group-short          (L-1)*W   skip-counted the rows of W
 *                                                   but stopped a row early
 *
 * Collisions, over L != W in 2..9:
 *
 *   L*W = L + W        =>  (L-1)(W-1) = 1  =>  L = W = 2.   Never: L != W.
 *   L*W = 2(L+W)       =>  L = 2W/(W-2), whole in range at
 *                          (6,3), (4,4) and (3,6).           (4,4) is already
 *                                                            out; (6,3) and
 *                                                            (3,6) EXCLUDED.
 *   L*W = (L-1)*W      =>  W = 0.                            Never.
 *   L + W = 2(L+W)     =>  L + W = 0.                        Never.
 *   L + W = (L-1)*W    =>  L = 2W/(W-1), whole in range at
 *                          (4,2) and (3,3).                  (3,3) is already
 *                                                            out; (4,2)
 *                                                            EXCLUDED.
 *   2(L+W) = (L-1)*W   =>  L(W-2) = 3W  =>  L = 3W/(W-2),
 *                          which is 9, 6, 5, 4.5, ... for
 *                          W = 3, 4, 5, 6 and 4 at W = 8.
 *                          In range and with L != W:
 *                          (9,3), (6,4) and (4,8).           EXCLUDED.
 *
 * So SIX pairs are excluded beyond L != W: (6,3), (3,6), (4,2), (9,3), (6,4)
 * and (4,8), leaving 8*8 - 8 - 6 = 50. The exclusion is a filter applied once
 * when RECTANGLES is built, never a resample, and the sibling test sweeps the
 * whole space and asserts the excluded set is exactly those six — in both
 * directions, so a pair silently dropped later fails too.
 */
export interface Rect {
  L: number;
  W: number;
}

function optionValues({ L, W }: Rect): number[] {
  return [L * W, L + W, 2 * (L + W), (L - 1) * W];
}

export const RECTANGLES: Rect[] = [];
for (let L = 2; L <= 9; L++) {
  for (let W = 2; W <= 9; W++) {
    if (L === W) continue;
    const values = optionValues({ L, W });
    if (new Set(values).size !== values.length) continue;
    RECTANGLES.push({ L, W });
  }
}

type UnitKey = 'inches' | 'feet' | 'yards';

/** Rectangular things in a child's world, each one something whose area is a
 *  reason to measure it, with the customary units a side of 2 to 9 of them
 *  makes sense in. "A bulletin board 8 yards long" and "a patio 3 inches
 *  wide" are not things a child has seen. */
const THINGS: { thing: string; units: UnitKey[] }[] = [
  { thing: 'vegetable garden', units: ['feet', 'yards'] },
  { thing: 'sandbox', units: ['feet'] },
  { thing: 'bedroom rug', units: ['feet'] },
  { thing: 'patio', units: ['feet', 'yards'] },
  { thing: 'bulletin board', units: ['feet'] },
  { thing: 'flower bed', units: ['feet', 'yards'] },
  { thing: 'chicken run', units: ['feet', 'yards'] },
  { thing: 'reading corner', units: ['feet'] },
  { thing: 'postcard', units: ['inches'] },
  { thing: 'picture frame', units: ['inches'] },
];

const NAMES = ['Ana', 'Theo', 'Rosa', 'Malik', 'Nina', 'Caleb', 'Sofia', 'Isaac'];

/** Customary length units only (ruling 14-1), each with the singular a
 *  "1 ___ on each side" sentence needs — "1 feet" is not English. */
const UNITS: Record<UnitKey, { plural: string; singular: string }> = {
  inches: { plural: 'inches', singular: 'inch' },
  feet: { plural: 'feet', singular: 'foot' },
  yards: { plural: 'yards', singular: 'yard' },
};

export const md7AreaByMultiplyingSideLengths: QuestionTemplate = {
  id: 'g3.md7.area-by-multiplying-side-lengths',
  standardCode: 'NC.3.MD.7',
  domainId: 'MD',
  difficulty: 'mastery',
  calculatorAllowed: false,
  isStretch: false,

  generate(rng: Rng): GeneratedQuestion {
    const name = rng.pick(NAMES);
    const { thing, units } = rng.pick(THINGS);
    const { plural: unit, singular } = UNITS[rng.pick(units)];
    const { L, W } = rng.pick(RECTANGLES);

    const squareUnit = `square ${unit}`;
    const area = L * W;
    const answerText = `${area} ${squareUnit}`;

    const candidates = [
      { text: answerText, isCorrect: true },
      // L + W: added the two numbers the question gave, which is half the way
      // around the rectangle and none of the way across it.
      {
        text: `${L + W} ${squareUnit}`,
        isCorrect: false,
        misconception: 'added-only-the-two-given-sides',
      },
      // 2(L + W): found the distance AROUND the rectangle instead of the
      // space inside it.
      {
        text: `${2 * (L + W)} ${squareUnit}`,
        isCorrect: false,
        misconception: 'used-perimeter-formula',
      },
      // (L - 1) * W: skip-counted rows of W but stopped one row early.
      {
        text: `${(L - 1) * W} ${squareUnit}`,
        isCorrect: false,
        misconception: 'skip-counted-one-group-short',
      },
    ];

    const texts = candidates.map((x) => x.text);
    if (new Set(texts).size !== texts.length) {
      throw new Error(
        `g3.md7.area-by-multiplying-side-lengths: option collision [${texts.join(' | ')}]`,
      );
    }

    return {
      prompt: `${name}'s ${thing} is a rectangle ${L} ${unit} long and ${W} ${unit} wide. What is its area?`,
      options: labelOptions(rng.shuffle(candidates)),
      answerText,
      explanation: {
        stepByStep: [
          `Step 1: Picture the rectangle covered in squares that are 1 ${singular} on each side.`,
          `Step 2: Each row across holds ${W} of those squares, and there are ${L} rows going down.`,
          `Step 3: ${L} rows of ${W} squares is ${L} × ${W}, so there is no need to count them one at a time.`,
          `Step 4: ${L} × ${W} = ${area}, so the area is ${answerText}.`,
        ],
        conceptSummary:
          'Multiplying the two side lengths counts the same unit squares that tiling counts, just faster: one side length says how many squares are in a row, the other says how many rows there are.',
        commonMisconception: `Answering ${2 * (L + W)} ${squareUnit} finds the PERIMETER - how far it is around the edge. Area measures the space inside, and the two are different questions about the same rectangle.`,
      },
    };
  },
};
