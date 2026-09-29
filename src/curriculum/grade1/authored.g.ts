import type { Question } from '../../engine/questionModel';
import { labelOptions } from '../../engine/questionModel';

/**
 * The authored Grade 1 Geometry bank — fully authored, no generator.
 *
 * All three Grade 1 Geometry standards (`NC.1.G.1-3`) are described figures
 * and vocabulary: a generator over them would only shuffle labels on a
 * described shape, never draw a genuinely different problem. Scope is read
 * from `./standards.ts`, not the Task 24 brief.
 *
 *   NC.1.G.1  distinguish defining from non-defining attributes, and create
 *             shapes with defining attributes. Covers 2-D (triangles,
 *             rectangles, squares, trapezoids, hexagons, circles) AND, per
 *             ruling 24-6, at least one 3-D item (cubes, rectangular prisms,
 *             cones, spheres, cylinders) — the brief drops the 3-D half.
 *   NC.1.G.2  create composite shapes. Per ruling 24-7, this covers 2-D
 *             composites using half-circles (named in the source, absent
 *             from the brief), 3-D composites, and "naming the components of
 *             the new shape" — an item asking WHICH shapes went into a
 *             composite, not just what to call the composite as a whole.
 *   NC.1.G.3  partition circles and rectangles into TWO and FOUR equal
 *             shares only (ruling 24-8: thirds are out of scope at Grade 1 —
 *             the word "third" does not appear in this file). Covers halves
 *             and fourths, unequal parts wrongly called equal shares, and the
 *             counter-intuitive bullet the brief omits: decomposing into MORE
 *             equal shares makes each share SMALLER, not bigger.
 *
 * Every prompt passes `assertGradeOneReadable`, with an explicit allowlist
 * (`GRADE_1_G_VOCAB_ALLOWLIST`, exported from `../authoredBank.testkit`) for
 * the standard's own vocabulary that exceeds the guard's ten-letter cap —
 * "rectangular" and "half-circles" — sourced from `./standards.ts`, never
 * raising the cap itself.
 */
export const GRADE_1_G_AUTHORED: Question[] = [
  // ==========================================
  // Standard: NC.1.G.1 — Defining & Non-Defining Attributes of Shapes
  // ==========================================
  {
    id: 'g1-g1-01',
    standardCode: 'NC.1.G.1',
    domainId: 'G',
    prompt: 'Which is a defining attribute of a triangle?',
    options: labelOptions([
      { text: 'It has 3 straight sides', isCorrect: true },
      { text: 'It is drawn in red', isCorrect: false, misconception: 'treated-a-non-defining-attribute-as-defining' },
      { text: 'It is small', isCorrect: false, misconception: 'treated-a-non-defining-attribute-as-defining' },
      { text: 'It is tilted on its side', isCorrect: false, misconception: 'treated-a-non-defining-attribute-as-defining' },
    ]),
    calculatorAllowed: false,
    isStretch: false,
    difficulty: 'mastery',
    explanation: {
      stepByStep: [
        'Step 1: A defining attribute belongs to the shape itself, no matter its color, size, or how it is turned.',
        'Step 2: Color, size, and being tilted can all change without changing what the shape is.',
        'Step 3: A triangle is a triangle only because it has 3 straight sides.',
        'Step 4: It has 3 straight sides.',
      ],
      conceptSummary:
        'A defining attribute is one every example of the shape must have, unlike color, size, or orientation, which can be different for two shapes of the same name.',
      commonMisconception:
        'A triangle drawn in red is still a triangle if it is drawn in blue — color never decides what shape it is.',
    },
  },
  {
    id: 'g1-g1-02',
    standardCode: 'NC.1.G.1',
    domainId: 'G',
    prompt: 'A shape has 4 straight sides. Must it be a rectangle?',
    options: labelOptions([
      { text: 'Yes, any 4-sided shape is a rectangle', isCorrect: false, misconception: 'confused-a-defining-attribute-with-a-partial-one' },
      { text: 'No, it also needs 4 square corners', isCorrect: true },
      { text: 'No, it needs 5 sides instead', isCorrect: false, misconception: 'confused-the-shape-name-with-its-side-count' },
      { text: 'Yes, as long as it is drawn neatly', isCorrect: false, misconception: 'treated-a-non-defining-attribute-as-defining' },
    ]),
    calculatorAllowed: false,
    isStretch: false,
    difficulty: 'advanced',
    explanation: {
      stepByStep: [
        'Step 1: A rectangle has more than one defining attribute.',
        'Step 2: Having 4 straight sides is one of them, but not the only one.',
        'Step 3: A rectangle also needs 4 square corners, which a 4-sided shape does not always have.',
        'Step 4: No, it also needs 4 square corners.',
      ],
      conceptSummary:
        'Naming a shape can take more than one defining attribute at once. Checking only one, such as the number of sides, can let in shapes that are not really that shape.',
      commonMisconception:
        'Every rectangle does have 4 sides, but not every 4-sided shape has the square corners a rectangle needs too.',
    },
  },
  {
    id: 'g1-g1-03',
    standardCode: 'NC.1.G.1',
    domainId: 'G',
    // Ruling 24-6: the 3-D half of the standard.
    prompt: 'Which solid shape has 6 flat faces shaped like squares?',
    options: labelOptions([
      { text: 'A sphere', isCorrect: false, misconception: 'confused-a-3-d-shape-with-a-similar-one' },
      { text: 'A cone', isCorrect: false, misconception: 'confused-a-3-d-shape-with-a-similar-one' },
      { text: 'A cube', isCorrect: true },
      { text: 'A cylinder', isCorrect: false, misconception: 'confused-a-3-d-shape-with-a-similar-one' },
    ]),
    calculatorAllowed: false,
    isStretch: false,
    difficulty: 'advanced',
    explanation: {
      stepByStep: [
        'Step 1: A defining attribute of a solid shape can be the shape and number of its flat faces.',
        'Step 2: A sphere has no flat faces at all, and a cone and a cylinder each have curved parts too.',
        'Step 3: A shape with 6 flat square faces is built entirely of squares.',
        'Step 4: A cube.',
      ],
      conceptSummary:
        'Three-dimensional shapes have defining attributes too, such as the shape and number of their flat faces — a cube\'s 6 square faces are what make it a cube.',
      commonMisconception:
        'A cylinder does have 2 flat faces, but they are circles, not squares, and it has a curved surface besides.',
    },
  },
  {
    id: 'g1-g1-04',
    standardCode: 'NC.1.G.1',
    domainId: 'G',
    prompt: 'Which shape has exactly 6 straight sides?',
    options: labelOptions([
      { text: 'Trapezoid', isCorrect: false, misconception: 'confused-the-shape-name-with-its-side-count' },
      { text: 'Hexagon', isCorrect: true },
      { text: 'Triangle', isCorrect: false, misconception: 'confused-the-shape-name-with-its-side-count' },
      { text: 'Circle', isCorrect: false, misconception: 'confused-the-shape-name-with-its-side-count' },
    ]),
    calculatorAllowed: false,
    isStretch: false,
    difficulty: 'mastery',
    explanation: {
      stepByStep: [
        'Step 1: Each shape name tells how many straight sides it has.',
        'Step 2: A triangle has 3, a trapezoid has 4, and a circle has none.',
        'Step 3: The shape with 6 straight sides is different from all three.',
        'Step 4: Hexagon.',
      ],
      conceptSummary:
        'A polygon\'s name is a label for its number of straight sides — counting the sides finds the name.',
      commonMisconception:
        'A trapezoid has 4 sides, not 6, so it is a different shape from the one asked about.',
    },
  },

  // ==========================================
  // Standard: NC.1.G.2 — Compose Two- & Three-Dimensional Shapes
  // ==========================================
  {
    id: 'g1-g2-01',
    standardCode: 'NC.1.G.2',
    domainId: 'G',
    // Ruling 24-7: half-circles, named in the source and absent from the
    // brief.
    prompt: 'Two half-circles are joined along their straight edges. What new shape do they make?',
    options: labelOptions([
      { text: 'A triangle', isCorrect: false, misconception: 'confused-the-shape-name-with-its-side-count' },
      { text: 'A half-circle', isCorrect: false, misconception: 'expected-a-composite-shape-to-keep-its-parts-names' },
      { text: 'A circle', isCorrect: true },
      { text: 'A square', isCorrect: false, misconception: 'confused-the-shape-name-with-its-side-count' },
    ]),
    calculatorAllowed: false,
    isStretch: false,
    difficulty: 'mastery',
    explanation: {
      stepByStep: [
        'Step 1: Each half-circle is exactly half of a circle.',
        'Step 2: Joining two matching half-circles along their straight edges puts the two halves back together.',
        'Step 3: The new shape is not called a half-circle any more, since it is now the whole thing.',
        'Step 4: A circle.',
      ],
      conceptSummary:
        'A composite shape is a new shape built from its parts. Its name comes from what the whole new figure looks like, not from the name of any one part.',
      commonMisconception:
        'Calling the joined shape a half-circle keeps the name of just one of the two pieces, even though together they make a whole circle.',
    },
  },
  {
    id: 'g1-g2-02',
    standardCode: 'NC.1.G.2',
    domainId: 'G',
    // "Naming the components of the new shape" — ruling 24-7.
    prompt: 'A new shape is made from a triangle and a square joined. Which shapes make it up?',
    options: labelOptions([
      { text: 'A triangle and a rectangle', isCorrect: false, misconception: 'misidentified-a-component-shape' },
      { text: 'A pentagon', isCorrect: false, misconception: 'named-the-composite-shape-instead-of-its-parts' },
      { text: 'A square and a circle', isCorrect: false, misconception: 'misidentified-a-component-shape' },
      { text: 'A triangle and a square', isCorrect: true },
    ]),
    calculatorAllowed: false,
    isStretch: false,
    difficulty: 'advanced',
    explanation: {
      stepByStep: [
        'Step 1: The question asks which two shapes were joined, not what the new shape is called overall.',
        'Step 2: A pentagon might describe the outline of the new figure, but it does not name the pieces that built it.',
        'Step 3: The two shapes joined were a triangle and a square.',
        'Step 4: A triangle and a square.',
      ],
      conceptSummary:
        'Naming the components of a composite shape means naming the separate pieces it was built from, which can be different from naming the new outline they make together.',
      commonMisconception:
        'Answering "a pentagon" names the outline the two shapes make together, not the two shapes that were actually joined.',
    },
  },
  {
    id: 'g1-g2-03',
    standardCode: 'NC.1.G.2',
    domainId: 'G',
    // A 3-D composite, per ruling 24-7.
    prompt: 'A toy is built from a cube stacked under a cone. Which shapes make up the toy?',
    options: labelOptions([
      { text: 'A cube and a cone', isCorrect: true },
      { text: 'A cube and a cylinder', isCorrect: false, misconception: 'misidentified-a-component-shape' },
      { text: 'A sphere and a cone', isCorrect: false, misconception: 'misidentified-a-component-shape' },
      { text: 'A cube', isCorrect: false, misconception: 'left-out-a-component-shape' },
    ]),
    calculatorAllowed: false,
    isStretch: false,
    difficulty: 'advanced',
    explanation: {
      stepByStep: [
        'Step 1: The toy is built by stacking two solid shapes together.',
        'Step 2: The bottom part is a cube, and the top part is a cone.',
        'Step 3: Naming only the cube leaves out the piece stacked on top of it.',
        'Step 4: A cube and a cone.',
      ],
      conceptSummary:
        'A three-dimensional composite shape is named by ALL of the solid shapes it was built from, not just one of them.',
      commonMisconception:
        'Naming only "a cube" describes the bottom of the toy but leaves out the cone stacked on top.',
    },
  },
  {
    id: 'g1-g2-04',
    standardCode: 'NC.1.G.2',
    domainId: 'G',
    prompt: 'Is the new shape still just a rectangle?',
    promptDetails: 'Sam joins a rectangle and a triangle to build a new shape, shaped like a little house.',
    options: labelOptions([
      { text: 'Yes, because the rectangle part is still there', isCorrect: false, misconception: 'expected-a-composite-shape-to-keep-its-parts-names' },
      { text: 'No, it is now only a triangle', isCorrect: false, misconception: 'expected-a-composite-shape-to-keep-its-parts-names' },
      { text: 'No, it is a new shape made of both', isCorrect: true },
      { text: 'Yes, because it is bigger now', isCorrect: false, misconception: 'treated-a-non-defining-attribute-as-defining' },
    ]),
    calculatorAllowed: false,
    isStretch: false,
    difficulty: 'mastery',
    explanation: {
      stepByStep: [
        'Step 1: Joining a rectangle and a triangle makes one new composite shape.',
        'Step 2: The new shape is not the same as either of the two pieces used to build it.',
        'Step 3: Its size, or which of the two pieces sits where, does not change this.',
        'Step 4: No, it is a new shape made of both.',
      ],
      conceptSummary:
        'A composite shape gets its own identity from the whole new figure, and does not keep the name of just one of the shapes that built it.',
      commonMisconception:
        'The rectangle part really is still there inside the house shape, but the whole figure is no longer just a rectangle.',
    },
  },

  // ==========================================
  // Standard: NC.1.G.3 — Partition Shapes into Halves & Fourths
  // ==========================================
  {
    id: 'g1-g3-01',
    standardCode: 'NC.1.G.3',
    domainId: 'G',
    prompt: 'A circle is cut into 2 pieces of different sizes. Can each piece be called a half?',
    options: labelOptions([
      { text: 'No, because the pieces are not the same size', isCorrect: true },
      { text: 'Yes, because there are two pieces', isCorrect: false, misconception: 'called-unequal-parts-equal-shares' },
      { text: 'No, because there should be four pieces', isCorrect: false, misconception: 'miscounted-the-number-of-equal-shares' },
      { text: 'Yes, because together they make the whole circle', isCorrect: false, misconception: 'called-unequal-parts-equal-shares' },
    ]),
    calculatorAllowed: false,
    isStretch: false,
    difficulty: 'mastery',
    explanation: {
      stepByStep: [
        'Step 1: "Half" means one of two EQUAL pieces, not just one of two pieces.',
        'Step 2: These two pieces are different sizes.',
        'Step 3: Because they are not equal, neither piece can be called a half, no matter how many pieces there are.',
        'Step 4: No, because the pieces are not the same size.',
      ],
      conceptSummary:
        'A share word like "half" names both how many pieces there are and that every piece is the same size. Two pieces alone is not enough.',
      commonMisconception:
        'Seeing two pieces and calling them halves skips the part of the meaning that matters most — whether the two pieces are actually equal.',
    },
  },
  {
    id: 'g1-g3-02',
    standardCode: 'NC.1.G.3',
    domainId: 'G',
    prompt: 'A rectangle is cut into 4 equal pieces. What is each piece called?',
    options: labelOptions([
      { text: 'A half', isCorrect: false, misconception: 'miscounted-the-number-of-equal-shares' },
      { text: 'A fourth', isCorrect: true },
      { text: 'A whole', isCorrect: false, misconception: 'miscounted-the-number-of-equal-shares' },
      { text: 'A fourth, even though one piece is bigger', isCorrect: false, misconception: 'called-unequal-parts-equal-shares' },
    ]),
    calculatorAllowed: false,
    isStretch: false,
    difficulty: 'mastery',
    explanation: {
      stepByStep: [
        'Step 1: The rectangle is split into 4 equal pieces.',
        'Step 2: When a whole is split into 4 equal pieces, each piece is called a fourth.',
        'Step 3: All 4 equal pieces have to be the same size for the word "fourth" to fit.',
        'Step 4: A fourth.',
      ],
      conceptSummary:
        'The number of equal pieces decides the share word: 2 equal pieces are halves, 4 equal pieces are fourths.',
      commonMisconception:
        'Calling the piece "a half" mixes up the count of pieces — a half comes from splitting into 2 pieces, not 4.',
    },
  },
  {
    id: 'g1-g3-03',
    standardCode: 'NC.1.G.3',
    domainId: 'G',
    // The counter-intuitive bullet the brief omits: more equal shares means
    // smaller shares.
    prompt: 'Which cake has bigger pieces?',
    promptDetails: 'Two same-size cakes are each cut into equal pieces. Cake A is cut into 2 pieces. Cake B is cut into 4 pieces.',
    options: labelOptions([
      { text: 'Cake B, because more pieces means bigger pieces', isCorrect: false, misconception: 'expected-more-shares-to-be-bigger' },
      { text: 'Cake B, because 4 is a bigger number than 2', isCorrect: false, misconception: 'expected-more-shares-to-be-bigger' },
      { text: 'They are the same size, since both cakes started the same', isCorrect: false, misconception: 'assumed-share-size-does-not-depend-on-the-count' },
      { text: 'Cake A', isCorrect: true },
    ]),
    calculatorAllowed: false,
    isStretch: true,
    difficulty: 'stretch',
    explanation: {
      stepByStep: [
        'Step 1: Both cakes start out the same size.',
        'Step 2: Cake A is split into fewer pieces than Cake B: 2 pieces instead of 4.',
        'Step 3: Splitting the same whole into more equal pieces makes each piece smaller, not bigger.',
        'Step 4: Cake A.',
      ],
      conceptSummary:
        'Splitting a whole into more equal shares always makes each share smaller, not bigger — 4 equal pieces of a cake are each smaller than 2 equal pieces of the same cake.',
      commonMisconception:
        '4 is a bigger number than 2, but a bigger number of PIECES means each one gets a smaller amount of the same whole.',
    },
  },
  {
    id: 'g1-g3-04',
    standardCode: 'NC.1.G.3',
    domainId: 'G',
    prompt: 'A rectangle is cut into 2 equal pieces. What is the whole rectangle made of?',
    options: labelOptions([
      { text: 'Four fourths', isCorrect: false, misconception: 'miscounted-the-number-of-equal-shares' },
      { text: 'One half', isCorrect: false, misconception: 'miscounted-the-number-of-equal-shares' },
      { text: 'Two halves', isCorrect: true },
      { text: 'Two fourths', isCorrect: false, misconception: 'miscounted-the-number-of-equal-shares' },
    ]),
    calculatorAllowed: false,
    isStretch: false,
    difficulty: 'advanced',
    explanation: {
      stepByStep: [
        'Step 1: The rectangle is split into 2 equal pieces.',
        'Step 2: Each equal piece, out of 2, is called a half.',
        'Step 3: The two halves together make up the whole rectangle.',
        'Step 4: Two halves.',
      ],
      conceptSummary:
        'Just as 4 equal pieces make "four fourths," 2 equal pieces make "two halves" — the count of equal pieces and the whole\'s description always match.',
      commonMisconception:
        'Naming the whole "four fourths" describes a rectangle split into 4 pieces, not the 2 pieces this one was actually split into.',
    },
  },
];
