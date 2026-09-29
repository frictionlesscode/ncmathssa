import type { Question } from '../../engine/questionModel';
import { labelOptions } from '../../engine/questionModel';

/**
 * The authored Grade 3 Geometry bank.
 *
 * Geometry at Grade 3 is ONE standard, and it shares a 23–27% blueprint band
 * with Measurement & Data, so neither domain may cite a weight of its own. One
 * standard carrying that much means a single off-standard item here is a third
 * of everything a child ever sees of Grade 3 Geometry.
 *
 * NC.3.G.1, from `./standards.ts`, has exactly two keyConcepts:
 *
 *   - "Investigate, describe, and reason about COMPOSING triangles and
 *      quadrilaterals and DECOMPOSING quadrilaterals."
 *   - "Recognize and draw EXAMPLES AND NON-EXAMPLES of types of quadrilaterals
 *      including rhombuses, rectangles, squares, parallelograms, and
 *      trapezoids."
 *
 * RULING 14-3. The task brief named "partitioning a shape into unequal parts
 * and calling each a quarter" as one of this domain's two headline errors.
 * That is Common Core 3.G.A.2 — partitioning shapes into equal areas and
 * naming each part a unit fraction of the whole — and NC does not have it at
 * Grade 3 in ANY domain. An item testing it would sit under a real NC code,
 * pass every test in this suite, and teach a third of Grade 3 Geometry
 * off-standard. Nothing here partitions a shape, and ./authored.g.test.ts
 * fails the bank if any item names a fractional part of one.
 *
 * The errors NC.3.G.1 ACTUALLY produces are definitional, and every one of
 * them turns on judging a shape by how it looks instead of by its properties:
 *
 *   - a square called "not a rectangle", because it does not look like the
 *     picture in a child's head (g3-g1-01, g3-g1-04, g3-g1-05)
 *   - a tilted rectangle or rhombus denied its name because it is turned
 *     (g3-g1-01, g3-g1-04)
 *   - a shape built from two shapes expected to keep their name (g3-g1-02,
 *     g3-g1-03)
 *   - the EXCLUSIVE definition of a trapezoid (g3-g1-05)
 *
 * ON THE TRAPEZOID. NC uses the INCLUSIVE definition — at least one pair of
 * parallel sides — which the shipped misconception tag
 * `exclusive-trapezoid-definition` already records. Under it every
 * parallelogram, and so every rectangle, rhombus and square, IS a trapezoid.
 * That makes a prose classification bank one careless option away from two
 * correct answers, because these categories overlap: every square is a
 * rectangle AND a rhombus. Every item below was re-solved option by option
 * against that hierarchy, and ./authored.g.test.ts pins each item in a
 * second-true-answer review so that adding one means restating why its three
 * wrong options are false.
 *
 * Age note: an eight-year-old reads these. Shapes are described in words, not
 * drawn, and every description carries the properties needed to answer.
 */
export const GRADE_3_G_AUTHORED: Question[] = [
  // ==========================================
  // Standard: NC.3.G.1 — Reason with Two-Dimensional Shapes
  // ==========================================
  {
    id: 'g3-g1-01',
    standardCode: 'NC.3.G.1',
    domainId: 'G',
    // A NON-EXAMPLE question, which is the standard's own word. The three
    // wrong options are all genuine rectangles that do not look like the
    // picture of one a child carries around, and each is rejected for a
    // different wrong reason.
    prompt: 'Which of these shapes is NOT a rectangle?',
    options: labelOptions([
      // Four sides, two long and two short, but no square corners: this is a
      // parallelogram, and a rectangle must have four square corners.
      {
        text: 'A four-sided shape with two long sides and two short sides, whose corners are not square corners.',
        isCorrect: true,
      },
      // A square has four square corners and two pairs of equal opposite
      // sides, so it meets every part of the definition of a rectangle.
      {
        text: 'A square.',
        isCorrect: false,
        misconception: 'hierarchy-too-narrow',
      },
      // Being turned does not change what a shape is.
      {
        text: 'A rectangle turned so that it stands on one of its corners.',
        isCorrect: false,
        misconception: 'judged-the-shape-by-its-orientation',
      },
      // Being unusually long does not change what a shape is either.
      {
        text: 'A rectangle that is ten times as long as it is tall.',
        isCorrect: false,
        misconception: 'classified-the-shape-by-how-it-looks',
      },
    ]),
    calculatorAllowed: false,
    isStretch: false,
    difficulty: 'mastery',
    explanation: {
      stepByStep: [
        'Step 1: A rectangle is a four-sided shape with four square corners.',
        'Step 2: Check the square. It has four sides and four square corners, so a square IS a rectangle - a special one whose sides are all equal.',
        'Step 3: Check the turned rectangle and the very long rectangle. Turning a shape or stretching it does not take away its square corners, so both are still rectangles.',
        'Step 4: That leaves one shape: A four-sided shape with two long sides and two short sides, whose corners are not square corners. Without four square corners it is not a rectangle.',
      ],
      conceptSummary:
        'A shape is named by the properties it has, not by how it is sitting on the page or how much like the usual picture it looks. For a rectangle the property that matters is four square corners.',
      commonMisconception:
        'Calling a square "not a rectangle" is the commonest answer here. A square has everything a rectangle needs and one thing more, so every square is a rectangle.',
    },
  },
  {
    id: 'g3-g1-02',
    standardCode: 'NC.3.G.1',
    domainId: 'G',
    // COMPOSING, the first half of the first keyConcept. Two squares joined on
    // a whole side make a 1-by-2 rectangle - not a square, not an eight-sided
    // shape, not a rhombus.
    prompt:
      'Jae has two identical squares. He slides them together so that a whole side of one touches a whole side of the other. What shape has Jae made?',
    options: labelOptions([
      // Expected the new shape to keep the name of the shapes it was built
      // from.
      {
        text: 'A bigger square.',
        isCorrect: false,
        misconception: 'expected-the-new-shape-to-keep-the-old-name',
      },
      // Counted 4 sides and 4 sides, without noticing the two touching sides
      // are now inside the new shape.
      {
        text: 'A shape with 8 sides, because each square had 4 sides.',
        isCorrect: false,
        misconception: 'added-the-sides-of-both-shapes',
      },
      {
        text: 'A rectangle that is twice as long as it is tall.',
        isCorrect: true,
      },
      // A rhombus needs all four sides equal, and this shape's long sides are
      // twice its short ones.
      {
        text: 'A rhombus, because all four of its sides are still equal.',
        isCorrect: false,
        misconception: 'hierarchy-too-broad',
      },
    ]),
    calculatorAllowed: false,
    isStretch: false,
    difficulty: 'mastery',
    explanation: {
      stepByStep: [
        'Step 1: Picture the two squares pushed together along one whole side.',
        'Step 2: The two sides that touch are now inside the new shape, so they are not sides of it any more. The new shape has 4 sides, not 8.',
        'Step 3: It is as tall as one square, but twice as long, so its sides are not all equal - it is not a square and not a rhombus.',
        'Step 4: Jae has made this: A rectangle that is twice as long as it is tall.',
      ],
      conceptSummary:
        'Putting shapes together makes a new shape with a name of its own, decided by the sides and corners it ends up with. The edges where the pieces meet stop being sides at all.',
      commonMisconception:
        'Answering "a bigger square" expects two squares to make a square. Joining them doubles the length but not the height, so the new shape is a rectangle.',
    },
  },
  {
    id: 'g3-g1-03',
    standardCode: 'NC.3.G.1',
    domainId: 'G',
    // DECOMPOSING a quadrilateral, which the keyConcept names separately from
    // composing. The cut is described precisely, because the cut a child
    // pictures by default is the diagonal one.
    prompt:
      'Priya cuts a square in one straight line, from the middle of its top side to the middle of its bottom side. What two shapes does she make?',
    options: labelOptions([
      // Pictured the diagonal cut instead of the one described.
      {
        text: 'Two triangles.',
        isCorrect: false,
        misconception: 'cut-the-shape-along-the-wrong-line',
      },
      {
        text: 'Two rectangles, each half as wide as the square and just as tall.',
        isCorrect: true,
      },
      // Expected the pieces of a square to be squares.
      {
        text: 'Two smaller squares.',
        isCorrect: false,
        misconception: 'expected-the-new-shape-to-keep-the-old-name',
      },
      // Ignored "from the middle", which is what makes the two pieces the
      // same.
      {
        text: 'One rectangle and one square.',
        isCorrect: false,
        misconception: 'ignored-a-constraint',
      },
    ]),
    calculatorAllowed: false,
    isStretch: false,
    difficulty: 'advanced',
    explanation: {
      stepByStep: [
        'Step 1: The cut is straight down from the middle of the top side to the middle of the bottom side.',
        'Step 2: Each piece keeps the full height of the square and half of its width.',
        'Step 3: Each piece still has four square corners, so each one is a rectangle - but its sides are no longer all equal, so neither is a square.',
        'Step 4: Priya makes these: Two rectangles, each half as wide as the square and just as tall.',
      ],
      conceptSummary:
        'Cutting a quadrilateral gives two new shapes, and which shapes they are depends entirely on where the cut runs. A straight cut between two opposite sides keeps the square corners; a cut corner to corner does not.',
      commonMisconception:
        'Answering "two triangles" is the cut most people picture first - corner to corner. This cut runs from the middle of one side to the middle of the opposite side, so both pieces keep four corners.',
    },
  },
  {
    id: 'g3-g1-04',
    standardCode: 'NC.3.G.1',
    domainId: 'G',
    // Straight examples and non-examples, as statements. Each wrong option is
    // a different way of getting the containments between quadrilaterals
    // backwards, and only one of the four statements is true.
    prompt: 'Which statement about quadrilaterals is true?',
    options: labelOptions([
      // The containment only runs one way: a rectangle 6 by 2 is no square.
      {
        text: 'Every rectangle is also a square.',
        isCorrect: false,
        misconception: 'hierarchy-inverted',
      },
      // A rhombus is a quadrilateral with four equal sides, and both pairs of
      // its opposite sides are parallel - tilted or not.
      {
        text: 'A rhombus that is tilted on its corner is not a parallelogram.',
        isCorrect: false,
        misconception: 'judged-the-shape-by-its-orientation',
      },
      // Four sides makes a quadrilateral, and nothing more.
      {
        text: 'Any shape with four sides is a rectangle.',
        isCorrect: false,
        misconception: 'hierarchy-too-broad',
      },
      // A square has four square corners and two pairs of equal opposite
      // sides, which is everything "rectangle" asks for.
      { text: 'Every square is also a rectangle.', isCorrect: true },
    ]),
    calculatorAllowed: false,
    isStretch: false,
    difficulty: 'advanced',
    explanation: {
      stepByStep: [
        'Step 1: A rectangle is a quadrilateral with four square corners. A square has four square corners, so Every square is also a rectangle.',
        'Step 2: The other way round fails: a rectangle 6 units by 2 units has four square corners but not four equal sides, so it is not a square.',
        'Step 3: A rhombus has both pairs of opposite sides parallel, which makes it a parallelogram. Turning it on its corner changes nothing about its sides.',
        'Step 4: And four sides alone only makes a quadrilateral - so the one true statement is that Every square is also a rectangle.',
      ],
      conceptSummary:
        'Quadrilateral names sit inside one another. Squares are inside rectangles and inside rhombuses, because a square has every property those names ask for and some extra ones of its own.',
      commonMisconception:
        'It is easy to read "every square is a rectangle" as also meaning "every rectangle is a square". Containment runs one way only: the more special shape belongs to the more general group, never the reverse.',
    },
  },
  {
    id: 'g3-g1-05',
    standardCode: 'NC.3.G.1',
    domainId: 'G',
    // The trapezoid, which the standard names explicitly and which NC defines
    // INCLUSIVELY: at least one pair of parallel sides. Under that definition
    // a square is a trapezoid, which is the single most surprising fact in
    // this standard and the one a bank written from memory gets backwards.
    // Re-solved against the hierarchy: a square IS a rhombus (four equal
    // sides, both pairs of opposite sides parallel), so option 3 is false, and
    // a rhombus 2 units on a side with no square corners is no square, so
    // option 4 is false.
    prompt: 'Which statement about a square is true?',
    options: labelOptions([
      {
        text: 'A square is not a trapezoid, because a trapezoid must have exactly one pair of parallel sides.',
        isCorrect: false,
        misconception: 'exclusive-trapezoid-definition',
      },
      {
        text: 'A square is not a rhombus, because its corners are square corners.',
        isCorrect: false,
        misconception: 'hierarchy-too-narrow',
      },
      {
        text: 'A square is a trapezoid, because it has at least one pair of parallel sides.',
        isCorrect: true,
      },
      {
        text: 'Every rhombus is a square, because both of them have four equal sides.',
        isCorrect: false,
        misconception: 'hierarchy-inverted',
      },
    ]),
    calculatorAllowed: false,
    isStretch: true,
    difficulty: 'stretch',
    explanation: {
      stepByStep: [
        'Step 1: In North Carolina a trapezoid is a quadrilateral with AT LEAST one pair of parallel sides.',
        'Step 2: A square has two pairs of parallel sides, and two pairs is certainly at least one.',
        'Step 3: A square also has four equal sides, which is what a rhombus needs, so a square is a rhombus as well - square corners do not stop it.',
        'Step 4: So the true statement is that A square is a trapezoid, because it has at least one pair of parallel sides.',
      ],
      conceptSummary:
        'A shape belongs to every group whose rules it follows, and it can belong to several at once. A square follows the rules for rectangles, rhombuses, parallelograms and trapezoids all at the same time.',
      commonMisconception:
        'Many books define a trapezoid as having EXACTLY one pair of parallel sides, which would leave squares out. North Carolina uses "at least one pair", so shapes with two pairs count too.',
    },
  },
];
