import type { Question } from '../../engine/questionModel';
import { labelOptions } from '../../engine/questionModel';

/**
 * The authored Grade 4 Geometry bank.
 *
 * WEIGHTING. NCDPI publishes ONE band of 23-27% covering Measurement & Data
 * and Geometry TOGETHER (see `weightGroup: 'MD+G'` in ./standards.ts). That
 * figure is not Geometry's own share and nothing in this file claims it is;
 * Geometry's individual weight is not published at all.
 *
 * AUTHORED ONLY, BY DESIGN. This domain ships no generator and ./templates
 * has no `g*` file. Every one of these three standards is classification and
 * vocabulary - what a ray is, which quadrilateral a figure is, where a fold
 * line falls - and fresh numbers change nothing about any of them. A generator
 * here would produce interchangeable items whose only variation is a letter
 * name. `CurriculumView` badges the domain "Fixed Question Set", which is the
 * honest description.
 *
 * SCOPE IS THE SOURCED TEXT IN ./standards.ts, AND NOTHING ELSE. Three places
 * where this file deliberately does NOT do what a memory of "grade-school
 * geometry" would do:
 *
 *   NC.4.G.1 is a SIX-OBJECT standard: "Draw and identify points, lines, line
 *   segments, rays, angles, and perpendicular and parallel lines." Two of its
 *   four keyConcepts are the perpendicular and the parallel one. It is not a
 *   ray-vocabulary standard, and the four items below cover both halves - the
 *   ray/segment/line distinction AND telling parallel from perpendicular.
 *
 *   NC.4.G.2 classifies "quadrilaterals AND TRIANGLES based on ANGLE MEASURE,
 *   SIDE LENGTHS, and the presence or absence of PARALLEL OR PERPENDICULAR
 *   lines." Triangles are in the sourced text, so two of the five items below
 *   are triangle classification, and all three criteria are exercised rather
 *   than side length alone.
 *
 *   NC.4.G is TWO-DIMENSIONAL. There is no solid, no volume and no coordinate
 *   plane at this grade - those are NC.5.MD and NC.5.G - and the test guards
 *   the vocabulary rather than trusting this paragraph.
 *
 * THE TRAPEZOID IS INCLUSIVE. North Carolina defines a trapezoid as a
 * quadrilateral with AT LEAST one pair of parallel sides, so every
 * parallelogram is a trapezoid. g4-g2-02 is built on that, and the exclusive
 * definition ("exactly one pair") appears only as a distractor, never in a key
 * and never in a worked solution.
 *
 * FIGURES ARE TEXT. This app has no image assets and will not get any. Every
 * item that describes a figure puts the whole of it in `promptDetails`,
 * written so a screen reader can read it aloud and a child can answer from the
 * words alone. Nothing below needs a picture to be answerable.
 *
 * THE TRAP THIS DOMAIN SETS is a SECOND TRUE STATEMENT, not a second equal
 * number. Every option in this bank is prose, so the shared kit's numeric
 * second-right-answer guard never fires here - the test says so out loud and
 * checks instead that no two options state one fact in two wordings. The
 * hierarchy items are where this bites: "parallelogram" IS true of a
 * rectangle, so every such item asks for the MOST SPECIFIC name and the
 * broader-but-true option is tagged `named-a-broader-category`. Two places
 * where an option was deliberately rejected while writing this file:
 *   - g4-g2-02 could not offer "trapezoid" as a false option about a
 *     parallelogram, because under NC's inclusive definition it is true.
 *   - g4-g3-01 offers only ONE of the rectangle's two real fold lines as an
 *     option; offering both the vertical and the horizontal midline would put
 *     two correct answers in one item.
 *
 * EVERY DISTRACTOR'S `//` COMMENT NAMES THE ERROR THAT REACHES THAT OPTION.
 * Eighteen tags used here are new, declared in ../misconceptions.ts. The
 * registry had good names for the polygon hierarchy - `named-a-broader-
 * category`, `hierarchy-too-narrow`, `exclusive-trapezoid-definition` - and
 * none at all for this grade's other two standards: nothing for symmetry,
 * nothing for naming a ray, nothing for confusing parallel with perpendicular.
 * Stretching a hierarchy tag over a symmetry error would tell a parent their
 * child has a polygon-classification problem when the child eyeballed a fold
 * line, so the new tags are declared instead.
 *
 * The new tags split across two families. The four classification tags join
 * `shape-classification`, which is about what a shape IS and where it sits in
 * the hierarchy. The line-vocabulary and symmetry tags join
 * `geometry-and-measurement`: they are not hierarchy errors, and a family is
 * what a parent reads on a report, where "Geometry And Measurement" is a true
 * description of mistaking a diagonal for a fold line while
 * "Shape Classification" would not be.
 *
 * The correct option is deliberately placed at a varied position; it is not
 * always A.
 */
export const GRADE_4_G_AUTHORED: Question[] = [
  // ==========================================
  // Standard: NC.4.G.1 — Points, Lines, Rays & Angles
  // Sourced: draw and identify points, lines, line segments, rays, angles,
  // and PERPENDICULAR AND PARALLEL lines.
  // ==========================================
  {
    id: 'g4-g1-01',
    standardCode: 'NC.4.G.1',
    domainId: 'G',
    prompt: 'Ms. Ruiz draws the figure described below on the board. What is the correct name for her figure?',
    promptDetails:
      'The figure is a straight path. It begins at a dot labeled A, passes through a dot labeled B, and has an arrowhead past B to show that it keeps going forever in that direction. There is no arrowhead at A.',
    options: labelOptions([
      // Read the arrowhead past B as a second endpoint, which makes the figure
      // look like a piece with an end at each side.
      {
        text: 'Line segment AB',
        isCorrect: false,
        misconception: 'counted-an-arrow-as-an-endpoint',
      },
      // Overlooked the dot at A where the figure begins, so the path seemed to
      // run on forever in both directions.
      {
        text: 'Line AB',
        isCorrect: false,
        misconception: 'ignored-the-endpoints-of-the-figure',
      },
      { text: 'Ray AB', isCorrect: true },
      // Started naming at the arrow end instead of at the endpoint, giving BA
      // — which is the ray pointing the opposite way.
      {
        text: 'Ray BA',
        isCorrect: false,
        misconception: 'named-a-ray-from-the-wrong-endpoint',
      },
    ]),
    calculatorAllowed: false,
    isStretch: false,
    difficulty: 'mastery',
    explanation: {
      stepByStep: [
        'Step 1: A line segment has an endpoint at each end, a line has no endpoints and runs on forever both ways, and a ray has exactly one endpoint and runs on forever the other way.',
        'Step 2: This figure has one endpoint, the dot at A, and one arrowhead, past B. One endpoint and one arrowhead makes it a ray.',
        'Step 3: A ray is always named with its endpoint first, so A comes before the point B that the ray passes through.',
        'Step 4: The figure is Ray AB.',
      ],
      conceptSummary:
        'The dots and arrowheads at the ends of a drawing are not decoration: they are what tells you whether a figure stops or keeps going, and that is the whole difference between a line, a ray and a line segment.',
      commonMisconception:
        'Ray AB and ray BA are not two names for one figure. They start at different endpoints and point opposite ways.',
    },
  },
  {
    id: 'g4-g1-02',
    standardCode: 'NC.4.G.1',
    domainId: 'G',
    prompt: 'Which of these best shows a pair of perpendicular lines?',
    options: labelOptions([
      // The two long edges of a ruler stay the same distance apart and never
      // meet: that is parallel, the opposite situation.
      {
        text: 'The two long edges of a ruler',
        isCorrect: false,
        misconception: 'confused-parallel-with-perpendicular',
      },
      { text: 'The two strokes of a block capital letter T', isCorrect: true },
      // The two strokes of a V do meet, but they lean together into a sharp
      // point, so the corner they make is not a square corner.
      {
        text: 'The two strokes of a block capital letter V',
        isCorrect: false,
        misconception: 'accepted-any-crossing-as-perpendicular',
      },
      // Rails run side by side the whole way and never meet: parallel again.
      {
        text: 'The two rails of a straight railroad track',
        isCorrect: false,
        misconception: 'confused-parallel-with-perpendicular',
      },
    ]),
    calculatorAllowed: false,
    isStretch: false,
    difficulty: 'mastery',
    explanation: {
      stepByStep: [
        'Step 1: Perpendicular lines cross, and where they cross they make square corners — the same corners you see at the corner of a sheet of paper.',
        "Step 2: A ruler's two long edges and a railroad's two rails never meet at all, however far you follow them. Lines like that are parallel, which is the opposite situation.",
        'Step 3: The two strokes of a V do meet, but they lean together into a sharp point, so that corner is not square.',
        'Step 4: Only one pair meets at a square corner: The two strokes of a block capital letter T.',
      ],
      conceptSummary:
        'Parallel and perpendicular describe two different things a pair of lines can do: parallel lines stay the same distance apart forever, while perpendicular lines cross and make square corners where they meet.',
      commonMisconception:
        'Crossing is not enough. Two lines that meet at a slant do intersect, but only lines that meet at a square corner are perpendicular.',
    },
  },
  {
    id: 'g4-g1-03',
    standardCode: 'NC.4.G.1',
    domainId: 'G',
    prompt: 'Which statement about rectangle JKLM is true?',
    promptDetails:
      'Rectangle JKLM has J at the top left corner, K at the top right, L at the bottom right and M at the bottom left. Its four sides are JK across the top, KL down the right, LM across the bottom, and MJ up the left.',
    options: labelOptions([
      { text: 'JK is parallel to LM, and JK is perpendicular to KL.', isCorrect: true },
      // Swapped the two words, calling the pair that never meets perpendicular
      // and the pair that makes a square corner parallel.
      {
        text: 'JK is perpendicular to LM, and JK is parallel to KL.',
        isCorrect: false,
        misconception: 'confused-parallel-with-perpendicular',
      },
      // Took "opposite sides are parallel" to mean every pair of sides is
      // parallel, including two sides that meet at a corner.
      {
        text: 'JK is parallel to KL, and KL is parallel to LM.',
        isCorrect: false,
        misconception: 'treated-adjacent-sides-as-parallel',
      },
      // Read "parallel lines never meet" as a statement about the whole
      // figure, so sides joined at the corners could not count as parallel.
      {
        text: 'None of the sides are parallel, because all four sides meet at the corners.',
        isCorrect: false,
        misconception: 'treated-connected-sides-as-not-parallel',
      },
    ]),
    calculatorAllowed: false,
    isStretch: false,
    difficulty: 'advanced',
    explanation: {
      stepByStep: [
        'Step 1: The top and bottom sides, JK and LM, run in the same direction and stay the same distance apart. Extended forever they would never meet, so they are parallel — and so are the left and right sides, MJ and KL.',
        'Step 2: Sides that meet at a corner are a different story. JK and KL meet at corner K, and every corner of a rectangle is a square corner, so JK and KL are perpendicular.',
        'Step 3: JK cannot be parallel to KL: the two sides touch at K, and parallel lines never meet.',
        'Step 4: The true statement is: JK is parallel to LM, and JK is perpendicular to KL.',
      ],
      conceptSummary:
        'A rectangle holds both relationships at once. Its opposite sides are parallel and the sides that meet are perpendicular, which is exactly what makes every one of its corners square.',
      commonMisconception:
        '"Parallel lines never meet" is about the two lines themselves, not about the whole shape. Two sides that meet at a corner are not parallel, but the two sides across from each other still are.',
    },
  },
  {
    id: 'g4-g1-04',
    standardCode: 'NC.4.G.1',
    domainId: 'G',
    prompt: "Mia and her partner each draw one figure. Which choice names Mia's figure and then her partner's figure?",
    promptDetails:
      'Mia draws a straight path that begins at point R, passes through point S, and has an arrowhead past S. Her partner draws a straight path between point T and point U, with a dot at each end and no arrowheads.',
    options: labelOptions([
      // Named Mia's ray from the arrow end instead of from its endpoint: ray SR
      // would begin at S and point back toward R.
      {
        text: 'Ray SR and line segment TU',
        isCorrect: false,
        misconception: 'named-a-ray-from-the-wrong-endpoint',
      },
      // Treated the arrowhead past S as a second endpoint, which turns Mia's
      // ray into a line segment.
      {
        text: 'Line segment RS and line segment TU',
        isCorrect: false,
        misconception: 'counted-an-arrow-as-an-endpoint',
      },
      // Ignored the dots at T and U that stop the partner's figure, letting it
      // run on forever as a line.
      {
        text: 'Ray RS and line TU',
        isCorrect: false,
        misconception: 'ignored-the-endpoints-of-the-figure',
      },
      { text: 'Ray RS and line segment TU', isCorrect: true },
    ]),
    calculatorAllowed: false,
    isStretch: false,
    difficulty: 'advanced',
    explanation: {
      stepByStep: [
        "Step 1: Mia's path stops at R and has an arrowhead at the other end. One endpoint plus one arrowhead means a ray.",
        "Step 2: A ray is named endpoint first, so Mia's figure is ray RS. Ray SR would begin at S and point back the other way, which is not what she drew.",
        "Step 3: Her partner's path has a dot at each end and no arrowheads, so it stops at both ends. Two endpoints means a line segment, not a line.",
        'Step 4: The pair is Ray RS and line segment TU.',
      ],
      conceptSummary:
        'Counting the endpoints answers the question every time: two endpoints is a line segment, one endpoint is a ray, and no endpoints is a line.',
      commonMisconception:
        'A figure named with two letters is not automatically a segment. The letters only say which points are on it; the dots and arrowheads say what it is.',
    },
  },

  // ==========================================
  // Standard: NC.4.G.2 — Classify Triangles & Quadrilaterals
  // Sourced: classify quadrilaterals AND TRIANGLES based on angle measure,
  // side lengths, and the presence or absence of parallel or perpendicular
  // lines. NC's trapezoid definition is INCLUSIVE: at least one pair of
  // parallel sides.
  // ==========================================
  {
    id: 'g4-g2-01',
    standardCode: 'NC.4.G.2',
    domainId: 'G',
    prompt:
      'A quadrilateral has four square corners. Its opposite sides are equal in length, but its four sides are not all the same length. What is the most specific name for this shape?',
    options: labelOptions([
      // A square needs all four sides the same length, and the problem says
      // they are not.
      { text: 'Square', isCorrect: false, misconception: 'ignored-a-constraint' },
      // Saw "opposite sides are equal" and stopped there; a rhombus needs all
      // four sides equal, not just the opposite pairs.
      {
        text: 'Rhombus',
        isCorrect: false,
        misconception: 'classified-by-one-property-only',
      },
      { text: 'Rectangle', isCorrect: true },
      // True of this shape, but every rectangle is a parallelogram, so
      // parallelogram is not the most specific name it has.
      {
        text: 'Parallelogram',
        isCorrect: false,
        misconception: 'named-a-broader-category',
      },
    ]),
    calculatorAllowed: false,
    isStretch: false,
    difficulty: 'mastery',
    explanation: {
      stepByStep: [
        'Step 1: Four square corners means all four angles are right angles. The quadrilaterals with four right angles are the rectangles — and squares, which are the rectangles whose four sides are all equal.',
        'Step 2: The sides here are not all equal, so this shape is not a square.',
        'Step 3: A rhombus needs all four sides equal as well, so it is not a rhombus. Parallelogram is true of it, but that group also holds shapes with no right angles at all, so it is not the most specific name.',
        'Step 4: The most specific name is Rectangle.',
      ],
      conceptSummary:
        '"Most specific" means the smallest group the shape still fits in. A rectangle really is a parallelogram, but calling it one throws away the fact that all four of its corners are square.',
      commonMisconception:
        'Opposite sides being equal is not the same as all four sides being equal, and only the second one makes a rhombus.',
    },
  },
  {
    id: 'g4-g2-02',
    standardCode: 'NC.4.G.2',
    domainId: 'G',
    prompt:
      'Quadrilateral PQRS has two pairs of parallel sides. Riley says PQRS cannot be called a trapezoid. Is Riley right?',
    options: labelOptions([
      {
        text: 'No. A trapezoid has at least one pair of parallel sides, and PQRS has two pairs.',
        isCorrect: true,
      },
      // Used the exclusive definition taught outside North Carolina, under
      // which a shape with two pairs of parallel sides is ruled out.
      {
        text: 'Yes. To be a trapezoid, a shape must have exactly one pair of parallel sides.',
        isCorrect: false,
        misconception: 'exclusive-trapezoid-definition',
      },
      // Treated the quadrilateral groups as separate boxes, so a shape that is
      // already a parallelogram cannot also be a trapezoid.
      {
        text: 'Yes. PQRS is a parallelogram, and a shape cannot be in two quadrilateral groups at once.',
        isCorrect: false,
        misconception: 'hierarchy-too-narrow',
      },
      // Stretched the trapezoid group over every quadrilateral, which is wider
      // than its definition allows: a quadrilateral with no parallel sides at
      // all is not a trapezoid.
      {
        text: 'No. Every quadrilateral is a trapezoid, because every four-sided shape has parallel sides.',
        isCorrect: false,
        misconception: 'hierarchy-too-broad',
      },
    ]),
    calculatorAllowed: false,
    isStretch: false,
    difficulty: 'advanced',
    explanation: {
      stepByStep: [
        'Step 1: North Carolina defines a trapezoid as a quadrilateral with AT LEAST one pair of parallel sides.',
        'Step 2: PQRS has two pairs of parallel sides, and two pairs is certainly at least one pair, so PQRS fits that definition.',
        'Step 3: Having a second name does not cancel the first. PQRS is a parallelogram and a trapezoid and a quadrilateral all at once, the way a robin is a bird and an animal at once.',
        'Step 4: That does not make every quadrilateral a trapezoid. A quadrilateral with no parallel sides at all still fails the definition.',
        'Step 5: Riley is wrong: No. A trapezoid has at least one pair of parallel sides, and PQRS has two pairs.',
      ],
      conceptSummary:
        'Quadrilateral names are groups inside groups, not separate boxes. A shape belongs to every group whose definition it meets, and the definition of a trapezoid asks for at least one pair of parallel sides.',
      commonMisconception:
        'Books outside North Carolina often define a trapezoid as having only one pair of parallel sides. The NC standards use the inclusive definition — at least one pair — which makes every parallelogram a trapezoid as well.',
    },
  },
  {
    id: 'g4-g2-03',
    standardCode: 'NC.4.G.2',
    domainId: 'G',
    prompt: 'Which statement about quadrilateral ABCD is true?',
    promptDetails:
      'In quadrilateral ABCD, all four sides are 6 centimeters long. Side AB is parallel to side DC, and side AD is parallel to side BC. None of its four corners is a square corner.',
    options: labelOptions([
      // Used the equal side lengths on their own and never checked the angles,
      // which a square also requires.
      {
        text: 'ABCD is a square, because all four of its sides are the same length.',
        isCorrect: false,
        misconception: 'classified-by-one-property-only',
      },
      // Assumed the corners are square corners even though the problem says
      // none of them is; perpendicular sides would make one.
      {
        text: 'ABCD is a rhombus, and side AB is perpendicular to side BC.',
        isCorrect: false,
        misconception: 'assumed-square-corners-where-none-were-given',
      },
      // Took the rectangle's square corners to be a requirement of every
      // parallelogram, which is a property the broader group does not have.
      {
        text: 'ABCD is not a parallelogram, because a parallelogram must have square corners.',
        isCorrect: false,
        misconception: 'property-inherited-upward',
      },
      {
        text: 'ABCD is a rhombus, and none of its sides are perpendicular to each other.',
        isCorrect: true,
      },
    ]),
    calculatorAllowed: false,
    isStretch: false,
    difficulty: 'advanced',
    explanation: {
      stepByStep: [
        'Step 1: All four sides are equal and both pairs of opposite sides are parallel. That is exactly the definition of a rhombus.',
        'Step 2: A square is a rhombus with four square corners. This shape has none, so it is not a square.',
        'Step 3: Two perpendicular sides would make a square corner where they meet. The problem says there are no square corners, so no two sides of ABCD are perpendicular.',
        'Step 4: A parallelogram only needs two pairs of parallel sides — square corners are not required — so ABCD is a parallelogram as well as a rhombus.',
        'Step 5: The true statement is: ABCD is a rhombus, and none of its sides are perpendicular to each other.',
      ],
      conceptSummary:
        'A rhombus is fixed by its sides — four equal ones, with the opposite pairs parallel — and says nothing about its angles. Add four square corners to a rhombus and it becomes a square.',
      commonMisconception:
        'Equal sides do not force square corners. A rhombus can lean over as far as you like and still have four sides the same length.',
    },
  },
  {
    id: 'g4-g2-04',
    standardCode: 'NC.4.G.2',
    domainId: 'G',
    prompt:
      'One angle of a triangle measures 103°. Each of its other two angles measures less than 90°. Based on its angles, what is the most specific name for this triangle?',
    options: labelOptions([
      // Named the triangle from the two angles under 90° and never used the
      // 103° angle, which is the one that decides the name.
      {
        text: 'Acute triangle',
        isCorrect: false,
        misconception: 'named-a-triangle-by-its-smaller-angles',
      },
      { text: 'Obtuse triangle', isCorrect: true },
      // Treated the one big angle as "the right angle" of the triangle without
      // checking that a right angle measures exactly 90°, not 103°.
      {
        text: 'Right triangle',
        isCorrect: false,
        misconception: 'called-a-large-angle-a-right-angle',
      },
      // Answered with a side-length name when the question asked how the
      // triangle is classified by its angles.
      {
        text: 'Scalene triangle',
        isCorrect: false,
        misconception: 'classified-by-the-wrong-attribute',
      },
    ]),
    calculatorAllowed: false,
    isStretch: false,
    difficulty: 'mastery',
    explanation: {
      stepByStep: [
        'Step 1: Triangles are named by their angles in three ways: acute, with all three angles under 90°; right, with one angle exactly 90°; and obtuse, with one angle greater than 90°.',
        'Step 2: 103° is greater than 90°, so this triangle has an obtuse angle. It is not acute, and it is not right, because 103° is not 90°.',
        'Step 3: A triangle can have only one angle of 90° or more, because its three angles add to 180°, so that one obtuse angle settles the name.',
        'Step 4: Scalene tells you about side lengths, not angles, and this question asked about angles.',
        'Step 5: The name is Obtuse triangle.',
      ],
      conceptSummary:
        "A triangle's angle name is decided by its LARGEST angle. The other two are always acute, so they can never be what names the triangle.",
      commonMisconception:
        'Two small angles do not make an acute triangle. Every triangle has at least two acute angles, including every obtuse one.',
    },
  },
  {
    id: 'g4-g2-05',
    standardCode: 'NC.4.G.2',
    domainId: 'G',
    prompt:
      'A triangle has two sides that are 5 centimeters long and one side that is 6 centimeters long. All three of its angles measure less than 90°. Which pair of names describes this triangle?',
    options: labelOptions([
      // Read "two sides the same" as "all sides the same" and ignored the
      // 6-centimeter side that an equilateral triangle cannot have.
      {
        text: 'Equilateral and acute',
        isCorrect: false,
        misconception: 'ignored-a-constraint',
      },
      // Decided the angle name from the side lengths — the 6-centimeter side is
      // the longest, so the angle across from it was assumed to be large —
      // instead of using the angle measures the problem gives.
      {
        text: 'Isosceles and obtuse',
        isCorrect: false,
        misconception: 'classified-by-the-wrong-attribute',
      },
      { text: 'Isosceles and acute', isCorrect: true },
      // Saw that the three sides are not all the same and called it scalene,
      // without noticing the two sides that do match.
      {
        text: 'Scalene and acute',
        isCorrect: false,
        misconception: 'treated-any-unequal-sides-as-scalene',
      },
    ]),
    calculatorAllowed: false,
    isStretch: false,
    difficulty: 'advanced',
    explanation: {
      stepByStep: [
        'Step 1: The side names count how many sides match: equilateral is all three, isosceles is at least two, and scalene is none.',
        'Step 2: Two sides here are 5 centimeters and the third is 6, so exactly two match. That is isosceles — not equilateral, and not scalene.',
        'Step 3: The angle name comes from the angles themselves, and all three are under 90°, so the triangle is acute.',
        'Step 4: The pair of names is Isosceles and acute.',
      ],
      conceptSummary:
        'A triangle carries two names at once, one from its sides and one from its angles, and each name has to be read off the thing it is about.',
      commonMisconception:
        'Having a longest side does not by itself make an angle obtuse. This triangle has a longest side of 6 centimeters and is still acute.',
    },
  },

  // ==========================================
  // Standard: NC.4.G.3 — Lines of Symmetry
  // Sourced: recognize symmetry in a two-dimensional figure, and identify and
  // draw lines of symmetry.
  // ==========================================
  {
    id: 'g4-g3-01',
    standardCode: 'NC.4.G.3',
    domainId: 'G',
    prompt: 'Which statement about the rectangle described below is true?',
    promptDetails:
      'The rectangle is 12 centimeters long and 5 centimeters wide, so it is much longer than it is wide.',
    options: labelOptions([
      {
        text: 'It has exactly 2 lines of symmetry: one straight down the middle and one straight across the middle.',
        isCorrect: true,
      },
      // Counted the two diagonals as fold lines as well, 2 + 2 = 4. A diagonal
      // of a rectangle this shape does not fold the halves onto each other.
      {
        text: 'It has exactly 4 lines of symmetry: the two through the middle and its two diagonals.',
        isCorrect: false,
        misconception: 'counted-a-diagonal-as-a-line-of-symmetry',
      },
      // Found the fold straight down the middle, stopped there, and never
      // tested the fold straight across.
      {
        text: 'It has exactly 1 line of symmetry, the one straight down the middle.',
        isCorrect: false,
        misconception: 'stopped-after-the-first-line-of-symmetry',
      },
      // Decided a figure cannot be symmetric unless all of its sides are the
      // same length.
      {
        text: 'It has no lines of symmetry, because its length and its width are different.',
        isCorrect: false,
        misconception: 'required-all-sides-equal-for-symmetry',
      },
    ]),
    calculatorAllowed: false,
    isStretch: false,
    difficulty: 'mastery',
    explanation: {
      stepByStep: [
        'Step 1: A line of symmetry is a fold line: fold the figure along it and the two halves have to land exactly on top of each other.',
        'Step 2: Fold this rectangle straight down the middle and the left half lands on the right half. Fold it straight across the middle and the top half lands on the bottom half. Both folds work.',
        'Step 3: Now try a diagonal, corner to opposite corner. It does cut the rectangle into two triangles of the same size, but folding along it lays a 12-centimeter side onto a 5-centimeter side, and those do not match.',
        'Step 4: So there are two fold lines and no more: It has exactly 2 lines of symmetry: one straight down the middle and one straight across the middle.',
      ],
      conceptSummary:
        'Symmetry is tested by folding, not by looking. A fold line counts only when every point of one half lands on a matching point of the other half.',
      commonMisconception:
        "A diagonal of a square IS a line of symmetry, which is why a rectangle's diagonal looks like one too. It is not, unless that rectangle happens to be a square.",
    },
  },
  {
    id: 'g4-g3-02',
    standardCode: 'NC.4.G.3',
    domainId: 'G',
    prompt:
      'Mateo folds a square along one of its diagonals and the two halves match exactly. He folds a rectangle that is much longer than it is wide along one of its diagonals, and the halves do not match. Which statement explains what he found?',
    options: labelOptions([
      // Kept the square's diagonal fold and applied it to every rectangle,
      // blaming the mismatch on careless folding.
      {
        text: 'A diagonal is a line of symmetry of every rectangle, so Mateo must have folded the second one carelessly.',
        isCorrect: false,
        misconception: 'counted-a-diagonal-as-a-line-of-symmetry',
      },
      // Separated the two groups instead of seeing that a square is a
      // rectangle with the extra property that all four sides are equal.
      {
        text: 'A square is not a rectangle, so the two shapes do not follow the same rules.',
        isCorrect: false,
        misconception: 'hierarchy-too-narrow',
      },
      // Treated a line that cuts the figure into two pieces of the same size as
      // a line of symmetry, without checking that the halves land on each other.
      {
        text: 'Both folds work, because a diagonal always cuts a rectangle into two pieces of the same size.',
        isCorrect: false,
        misconception: 'treated-equal-halves-as-symmetry',
      },
      {
        text: 'A diagonal is a line of symmetry of a square, but not of a rectangle whose sides are not all equal.',
        isCorrect: true,
      },
    ]),
    calculatorAllowed: false,
    isStretch: false,
    difficulty: 'advanced',
    explanation: {
      stepByStep: [
        'Step 1: Folding along a diagonal lays one pair of sides on top of the other pair.',
        'Step 2: In a square all four sides are the same length, so the sides that land on each other match and the halves fit exactly.',
        'Step 3: In a long rectangle a long side lands on a short side. The two triangles are the same size, but they are turned differently, so they do not fit on top of each other.',
        'Step 4: Same size is not the same as matching. A fold line has to land the halves on each other point for point.',
        'Step 5: Mateo found this: A diagonal is a line of symmetry of a square, but not of a rectangle whose sides are not all equal.',
      ],
      conceptSummary:
        "Every square is a rectangle, but a rectangle only gets the square's diagonal fold lines when its four sides are equal. The extra property brings the extra symmetry with it.",
      commonMisconception:
        'Cutting a figure into two pieces of equal size is not the same as folding it into two halves that match.',
    },
  },
  {
    id: 'g4-g3-03',
    standardCode: 'NC.4.G.3',
    domainId: 'G',
    prompt:
      'Which block capital letter has a horizontal line of symmetry — a fold line straight across, so that the top half lands exactly on the bottom half?',
    options: labelOptions([
      // A does have a line of symmetry, but it is the fold straight down the
      // middle, not the fold straight across.
      {
        text: 'Capital A',
        isCorrect: false,
        misconception: 'found-symmetry-in-the-wrong-direction',
      },
      { text: 'Capital E', isCorrect: true },
      // P looks balanced around its bowl, but no fold of a P in any direction
      // makes the two halves match.
      {
        text: 'Capital P',
        isCorrect: false,
        misconception: 'judged-symmetry-by-appearance',
      },
      // T, like A, folds only down the middle; folding it across would leave
      // the crossbar with nothing to land on.
      {
        text: 'Capital T',
        isCorrect: false,
        misconception: 'found-symmetry-in-the-wrong-direction',
      },
    ]),
    calculatorAllowed: false,
    isStretch: false,
    difficulty: 'advanced',
    explanation: {
      stepByStep: [
        'Step 1: A horizontal fold line runs side to side, and the test is whether the top half lands exactly on the bottom half.',
        'Step 2: Fold a block capital E across its middle. The top arm lands on the bottom arm and the upright stroke lands on itself, so the two halves match.',
        'Step 3: A and T do have a line of symmetry, but it runs up and down — they fold down the middle, not across it — so neither answers this question.',
        'Step 4: P has no line of symmetry at all: no fold of a P, in any direction, makes the halves match.',
        'Step 5: The letter that folds across the middle is Capital E.',
      ],
      conceptSummary:
        'A figure can be symmetric in one direction and not in another, so a question about symmetry has to say which fold it means.',
      commonMisconception:
        'Having a line of symmetry is not the same as having the one you were asked for. A and T are symmetric letters, but their fold line runs up and down, not across.',
    },
  },
];
