import type { Question } from '../../engine/questionModel';
import { labelOptions } from '../../engine/questionModel';

/**
 * The authored Grade 2 Geometry bank.
 *
 * NC.2.G.1 and NC.2.G.3, from `./standards.ts` (there is no NC.2.G.2):
 *
 *   NC.2.G.1 — recognize and draw triangles, quadrilaterals, pentagons and
 *              hexagons having specified attributes; recognize and describe
 *              attributes of rectangular prisms and cubes. RULING 17-6: this
 *              spans BOTH 2-D polygons and 3-D solids, so the floor here is
 *              raised beyond the brief's 3 to 5, with at least one item on
 *              the 3-D half.
 *   NC.2.G.3 — partition circles and rectangles into two, three or four
 *              equal shares; describe the whole as two halves, three thirds,
 *              four fourths; explain that equal shares of identical wholes
 *              need not have the same shape. RULING 17-5: that third bullet
 *              is the domain's one reasoning idea and is covered below
 *              (g2-g3-04).
 *
 * RULING 17-7: every item here is NON-IMAGE. Figures a child would otherwise
 * see are described in words in the prompt, screen-reader safe, exactly as
 * the domain's own MD siblings do for tables and graphs.
 *
 * Two new families of tag are introduced here, both declared in the Grade 2
 * Geometry block of `../misconceptions.ts`: confusing a shape's NAME with its
 * side count, and confusing a solid's FACES with its edges or corners —
 * neither of which any earlier grade's geometry needed, because Grade 3's
 * G.1 is entirely about quadrilaterals and never counts a solid's parts.
 *
 * Age note: a seven-year-old reads these. Shapes are described in words, and
 * every description carries the properties needed to answer.
 */
export const GRADE_2_G_AUTHORED: Question[] = [
  // ==========================================
  // Standard: NC.2.G.1 — Recognize & Draw Shapes by Attributes
  // ==========================================
  {
    id: 'g2-g1-01',
    standardCode: 'NC.2.G.1',
    domainId: 'G',
    prompt: 'Which shape has exactly 5 sides and 5 corners?',
    options: labelOptions([
      { text: 'Pentagon', isCorrect: true },
      { text: 'Hexagon', isCorrect: false, misconception: 'confused-the-shape-name-with-its-side-count' },
      { text: 'Quadrilateral', isCorrect: false, misconception: 'confused-the-shape-name-with-its-side-count' },
      { text: 'Triangle', isCorrect: false, misconception: 'confused-the-shape-name-with-its-side-count' },
    ]),
    calculatorAllowed: false,
    isStretch: false,
    difficulty: 'mastery',
    explanation: {
      stepByStep: [
        'Step 1: Each shape name tells exactly how many straight sides it has.',
        'Step 2: A triangle has 3 sides, a quadrilateral has 4, a pentagon has 5, and a hexagon has 6.',
        'Step 3: The shape in the question has 5 sides and 5 corners.',
        'Step 4: The shape with 5 sides is a Pentagon.',
      ],
      conceptSummary:
        'A polygon\'s name is a direct label for how many straight sides it has. Counting the sides is enough to find the right name.',
      commonMisconception:
        'Hexagon and pentagon sound alike and are easy to swap; a hexagon has one more side than a pentagon, not the same number.',
    },
  },
  {
    id: 'g2-g1-02',
    standardCode: 'NC.2.G.1',
    domainId: 'G',
    prompt: 'Which of these is NOT a quadrilateral?',
    options: labelOptions([
      // Four sides, but unusually long and thin — still a quadrilateral.
      {
        text: 'A four-sided shape that is very long and thin.',
        isCorrect: false,
        misconception: 'classified-the-shape-by-how-it-looks',
      },
      { text: 'A shape with three straight sides and three corners.', isCorrect: true },
      // Four sides, just turned — still a quadrilateral.
      {
        text: 'A four-sided shape turned so it balances on one corner.',
        isCorrect: false,
        misconception: 'judged-the-shape-by-its-orientation',
      },
      // Four sides of unequal lengths — still a quadrilateral; nothing about
      // "quadrilateral" requires equal sides.
      {
        text: 'A four-sided shape where the opposite sides are not the same length.',
        isCorrect: false,
        misconception: 'classified-the-shape-by-how-it-looks',
      },
    ]),
    calculatorAllowed: false,
    isStretch: false,
    difficulty: 'mastery',
    explanation: {
      stepByStep: [
        'Step 1: A quadrilateral is any shape with exactly 4 straight sides — nothing more is required.',
        'Step 2: Check each choice for its number of sides, not its size or how it sits on the page.',
        'Step 3: Three of the choices have 4 sides, however long, thin, tilted, or unequal they are.',
        'Step 4: The one choice with only 3 sides is not a quadrilateral: A shape with three straight sides and three corners.',
      ],
      conceptSummary:
        'Being a quadrilateral depends on one fact only — having 4 straight sides. Shape, size, tilt and equal or unequal sides do not change that.',
      commonMisconception:
        'A very long, thin, or tilted four-sided shape can look unfamiliar, which tempts a reader into rejecting it, but it still has exactly 4 sides.',
    },
  },
  {
    id: 'g2-g1-03',
    standardCode: 'NC.2.G.1',
    domainId: 'G',
    // Fix 1 (whole-branch review, Important): shortened from 161 to under 160
    // characters.
    prompt: 'A rectangular prism has a flat face on every side, even ones hidden in a picture. How many faces does it have in all?',
    options: labelOptions([
      // Counted only the faces visible in a typical picture (front, top, side).
      { text: '4 faces', isCorrect: false, misconception: 'counted-only-the-visible-faces' },
      // A rectangular prism has 8 corners (vertices); counted those instead.
      { text: '8 faces', isCorrect: false, misconception: 'counted-the-corners-instead-of-the-faces' },
      { text: '6 faces', isCorrect: true },
      // A rectangular prism has 12 edges; counted those instead.
      { text: '12 faces', isCorrect: false, misconception: 'counted-the-edges-instead-of-the-faces' },
    ]),
    calculatorAllowed: false,
    isStretch: false,
    difficulty: 'advanced',
    explanation: {
      stepByStep: [
        'Step 1: A face is one whole flat side of the solid, like one side of a cardboard box.',
        'Step 2: A rectangular prism has a top, a bottom, a front, a back, and two ends — six flat sides in all.',
        'Step 3: A picture only shows three of those faces at once; the other three are hidden behind them.',
        'Step 4: Counting every face, hidden ones included, a rectangular prism has 6 faces.',
      ],
      conceptSummary:
        'Attributes of a solid — its faces, its edges, its corners — are properties of the whole solid, not just of what a single picture happens to show.',
      commonMisconception:
        'A drawing of a box usually shows only 3 of its 6 faces, so counting straight from the picture undercounts by half.',
    },
  },
  {
    id: 'g2-g1-04',
    standardCode: 'NC.2.G.1',
    domainId: 'G',
    prompt:
      'Which shape has 4 sides that are all the same length, but none of its corners are square corners?',
    options: labelOptions([
      // A square has 4 equal sides, but ALSO 4 square corners, which this
      // shape does not have.
      { text: 'Square', isCorrect: false, misconception: 'assumed-square-corners-where-none-were-given' },
      // A rectangle's opposite sides are equal, but a rectangle needs 4
      // square corners, which this shape does not have either.
      { text: 'Rectangle', isCorrect: false, misconception: 'classified-the-shape-by-how-it-looks' },
      // Wrong side count entirely.
      { text: 'Triangle', isCorrect: false, misconception: 'confused-the-shape-name-with-its-side-count' },
      { text: 'Rhombus', isCorrect: true },
    ]),
    calculatorAllowed: false,
    isStretch: false,
    difficulty: 'mastery',
    explanation: {
      stepByStep: [
        'Step 1: The shape has 4 sides, all the same length, so it is a quadrilateral with equal sides.',
        'Step 2: Its corners are not square corners, so it cannot be a square or a rectangle — both of those need 4 square corners.',
        'Step 3: A shape with 4 equal sides and no square corners is a rhombus.',
        'Step 4: The shape is a Rhombus.',
      ],
      conceptSummary:
        'Two properties together — 4 equal sides, and corners that are not square — point to exactly one shape name. Checking only one property at a time can point to the wrong one.',
      commonMisconception:
        'Equal sides alone makes a reader think "square," but a square also needs square corners, which this shape was told not to have.',
    },
  },
  {
    id: 'g2-g1-05',
    standardCode: 'NC.2.G.1',
    domainId: 'G',
    prompt: 'Which shape has exactly 6 sides and 6 corners?',
    options: labelOptions([
      { text: 'Hexagon', isCorrect: true },
      { text: 'Pentagon', isCorrect: false, misconception: 'confused-the-shape-name-with-its-side-count' },
      { text: 'Quadrilateral', isCorrect: false, misconception: 'confused-the-shape-name-with-its-side-count' },
      { text: 'Triangle', isCorrect: false, misconception: 'confused-the-shape-name-with-its-side-count' },
    ]),
    calculatorAllowed: false,
    isStretch: false,
    difficulty: 'mastery',
    explanation: {
      stepByStep: [
        'Step 1: Each shape name tells exactly how many straight sides it has.',
        'Step 2: A triangle has 3 sides, a quadrilateral has 4, a pentagon has 5, and a hexagon has 6.',
        'Step 3: The shape in the question has 6 sides and 6 corners.',
        'Step 4: The shape with 6 sides is a Hexagon.',
      ],
      conceptSummary:
        'The same rule that names a 5-sided shape a pentagon names a 6-sided shape a hexagon — one more side, one step further down the list of names.',
      commonMisconception:
        'Guessing "pentagon" for 6 sides mixes it up with the shape one side smaller.',
    },
  },

  // ==========================================
  // Standard: NC.2.G.3 — Partition Circles & Rectangles into Equal Shares
  // ==========================================
  {
    id: 'g2-g3-01',
    standardCode: 'NC.2.G.3',
    domainId: 'G',
    prompt:
      'A rectangle is cut into two pieces. One piece is much bigger than the other. Can both pieces correctly be called halves?',
    options: labelOptions([
      // Called unequal parts halves because there happen to be two of them.
      {
        text: 'Yes, because there are two pieces.',
        isCorrect: false,
        misconception: 'called-unequal-parts-equal-shares',
      },
      { text: 'No, because halves have to be the same size.', isCorrect: true },
      // Confuses the count of pieces needed for "halves" with fourths.
      {
        text: 'No, because there should be four pieces to call them halves.',
        isCorrect: false,
        misconception: 'miscounted-the-number-of-equal-shares',
      },
      // Called unequal parts halves because together they still make the whole.
      {
        text: "Yes, because the two pieces together make the whole rectangle.",
        isCorrect: false,
        misconception: 'called-unequal-parts-equal-shares',
      },
    ]),
    calculatorAllowed: false,
    isStretch: false,
    difficulty: 'mastery',
    explanation: {
      stepByStep: [
        'Step 1: "Halves" does not just mean "cut into two pieces" — it means cut into two EQUAL pieces.',
        'Step 2: This rectangle is cut into two pieces, but one is much bigger than the other.',
        'Step 3: Because the pieces are not the same size, they are not halves, no matter how many pieces there are.',
        'Step 4: No, because halves have to be the same size.',
      ],
      conceptSummary:
        'A share word like "half," "third," or "fourth" names both how many pieces there are AND that every piece is the same size. Getting the count right is not enough on its own.',
      commonMisconception:
        'Seeing two pieces and calling them halves skips the part of the definition that matters most: whether the two pieces are actually equal.',
    },
  },
  {
    id: 'g2-g3-02',
    standardCode: 'NC.2.G.3',
    domainId: 'G',
    prompt:
      'A circle is cut into 3 equal pieces. What is each piece called, and what is the whole circle made of?',
    options: labelOptions([
      // Miscounted 3 pieces as 4.
      {
        text: 'Each piece is a fourth, and the whole circle is four fourths.',
        isCorrect: false,
        misconception: 'miscounted-the-number-of-equal-shares',
      },
      // Miscounted 3 pieces as 2.
      {
        text: 'Each piece is a half, and the whole circle is two halves.',
        isCorrect: false,
        misconception: 'miscounted-the-number-of-equal-shares',
      },
      { text: 'Each piece is a third, and the whole circle is three thirds.', isCorrect: true },
      // Used the right share word but denied the pieces are actually equal.
      {
        text: 'Each piece is a third, even though the three pieces are different sizes.',
        isCorrect: false,
        misconception: 'called-unequal-parts-equal-shares',
      },
    ]),
    calculatorAllowed: false,
    isStretch: false,
    difficulty: 'mastery',
    explanation: {
      stepByStep: [
        'Step 1: The circle is cut into 3 equal pieces.',
        'Step 2: When a whole is split into 3 equal pieces, each piece is called a third.',
        'Step 3: All 3 of the equal pieces together make up the whole circle.',
        'Step 4: Each piece is a third, and the whole circle is three thirds.',
      ],
      conceptSummary:
        'The number of equal pieces decides the share word: two equal pieces are halves, three are thirds, four are fourths. Counting the pieces correctly is what makes the word correct.',
      commonMisconception:
        'Fourths is a share word a child hears often and can slip in even when a picture clearly shows 3 pieces, not 4.',
    },
  },
  {
    id: 'g2-g3-03',
    standardCode: 'NC.2.G.3',
    domainId: 'G',
    prompt: 'A rectangle is cut into 4 equal pieces. What do we call the whole rectangle, using those pieces?',
    options: labelOptions([
      // Miscounted 4 pieces as 2, but kept the word "fourths".
      {
        text: 'Four halves.',
        isCorrect: false,
        misconception: 'miscounted-the-number-of-equal-shares',
      },
      {
        text: 'Two fourths.',
        isCorrect: false,
        misconception: 'miscounted-the-number-of-equal-shares',
      },
      // Named it correctly but denied the pieces are actually equal.
      {
        text: 'Four fourths, even though one piece is bigger than the rest.',
        isCorrect: false,
        misconception: 'called-unequal-parts-equal-shares',
      },
      { text: 'Four fourths.', isCorrect: true },
    ]),
    calculatorAllowed: false,
    isStretch: false,
    difficulty: 'mastery',
    explanation: {
      stepByStep: [
        'Step 1: The rectangle is split into 4 equal pieces.',
        'Step 2: Four equal pieces are called fourths, one for each piece.',
        'Step 3: All 4 of the equal fourths together make up the whole rectangle.',
        'Step 4: The whole rectangle is Four fourths.',
      ],
      conceptSummary:
        'Just as 2 equal pieces make "two halves" and 3 equal pieces make "three thirds," 4 equal pieces make "four fourths" — the count of equal pieces and the count word always match.',
      commonMisconception:
        'Mixing up "half" and "fourth" is common because both start from cutting a shape in two; a fourth needs the shape split in two, and then in two again.',
    },
  },
  {
    id: 'g2-g3-04',
    standardCode: 'NC.2.G.3',
    domainId: 'G',
    // "Explain that equal shares of identical wholes need not have the same
    // shape" — the standard's third bullet, per ruling 17-5.
    // Fix 1 (whole-branch review, Important): shortened from 227 characters
    // and 4 sentences to 3 sentences, keeping both cuts and the reasoning
    // question unchanged. The "identical square" premise stays in the prompt:
    // Step 1 and the standard's "identical wholes" both depend on it.
    prompt:
      'Two identical square pizzas: Pizza 1 is cut into 2 matching rectangles, Pizza 2 corner to corner into 2 matching triangles. Are both cut into equal halves?',
    options: labelOptions([
      {
        text: 'Yes, because each half is the same size, even if the shapes differ.',
        isCorrect: true,
      },
      // Assumed equal shares from identical wholes must look alike.
      {
        text: "No, because Pizza 2's halves are triangles, not rectangles like Pizza 1's.",
        isCorrect: false,
        misconception: 'expected-equal-shares-to-look-alike',
      },
      // Judged equal size by appearance rather than by checking the cuts.
      {
        text: "No, because a triangle piece looks smaller than a rectangle piece.",
        isCorrect: false,
        misconception: 'called-unequal-parts-equal-shares',
      },
      // Confused the shape of the cut with the number of pieces it makes.
      {
        text: "No, because a corner-to-corner cut makes thirds, not halves.",
        isCorrect: false,
        misconception: 'miscounted-the-number-of-equal-shares',
      },
    ]),
    calculatorAllowed: false,
    isStretch: true,
    difficulty: 'stretch',
    contentVersion: 2,
    explanation: {
      stepByStep: [
        'Step 1: Both pizzas start out identical, and each is cut into exactly 2 pieces.',
        'Step 2: Pizza 1\'s straight cut makes 2 same-size rectangles; Pizza 2\'s corner-to-corner cut makes 2 same-size triangles.',
        'Step 3: In both pizzas, the two pieces from one pizza match each other in size, even though a rectangle and a triangle do not look alike.',
        'Step 4: Yes, because each half is the same size, even if the shapes differ.',
      ],
      conceptSummary:
        'Equal shares of the same whole do not have to look like each other, and equal shares of two identical wholes do not have to be cut the same way. What makes a share a half is being one of two equal-size pieces — not matching a particular shape.',
      commonMisconception:
        "Expecting Pizza 2's triangles to look like Pizza 1's rectangles mixes up 'equal size' with 'the same shape,' which the standard treats as two different things.",
    },
  },
];
