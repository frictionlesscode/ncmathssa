import type { Question } from '../../engine/questionModel';
import { labelOptions } from '../../engine/questionModel';

/**
 * The authored Grade 2 Measurement & Data bank — nine standards, the largest
 * domain in the grade.
 *
 * A seven-year-old reads these. Sentences are short, every figure (a ruler, a
 * clock face, a number line, a graph) is written out in words in
 * `promptDetails` so a screen reader can read it and no picture is needed,
 * and coins are always named in words. Every incorrect option is the value a
 * real Grade 2 student reaches by one named error, with the arithmetic in a
 * `//` comment above it.
 *
 * Scope comes from the sourced NC text in `./standards.ts`, which WINS over
 * the task brief (rulings 19-1..19-5 of
 * `.superpowers/sdd/2026-09-13-grades-1-4-content/task-17-21-rulings.md`):
 *
 *   NC.2.MD.1  — measure length by SELECTING and USING a standard tool
 *                (ruler, yardstick, meter stick, measuring tape). Selecting
 *                is here; reading a ruler is the generator's.
 *   NC.2.MD.2  — measure ONE object TWICE with units of different lengths,
 *                and relate the counts to the unit size: a smaller unit gives
 *                a larger count. Not a fixed-unit standard (ruling 19-2), so
 *                every item here measures "the same" object twice.
 *   NC.2.MD.3  — ESTIMATE in inches, feet, yards, centimeters and meters.
 *   NC.2.MD.4  — measure BOTH objects, then say how much longer one is, in a
 *                standard unit.
 *   NC.2.MD.5  — length word problems WITHIN 100, all lengths in ONE unit,
 *                each with an equation using a symbol (☐) for the unknown.
 *   NC.2.MD.6  — the NUMBER LINE: whole numbers as lengths from 0, and sums
 *                and differences within 100 as jumps.
 *   NC.2.MD.7  — TIME to the nearest five minutes, with a.m. and p.m.
 *   NC.2.MD.8  — MONEY: coins within 99¢ written with ¢, or whole dollars
 *                written with $, never both in one question.
 *   NC.2.MD.10 — ORGANIZE, REPRESENT and interpret data in up to four
 *                categories on a single-unit scale. There is no NC.2.MD.9 and
 *                no line plot anywhere in NC Grade 2.
 *
 * RULING 19-1, THE ONE THING TO KNOW ABOUT THIS FILE: MD.6 IS THE NUMBER
 * LINE, MD.7 IS TIME, MD.8 IS MONEY. The brief cycled those three codes by
 * one. A clock item filed as NC.2.MD.6 is valid TypeScript under a real Grade
 * 2 code and passes every test that only checks the code exists; it would
 * record a child who cannot read a clock as weak on number lines. The sibling
 * test reads the topic of every item back out of its own words and checks it
 * against the code.
 *
 * NC Grade 2 is BI-SYSTEMIC (ruling 19-3): inches, feet and yards AND
 * centimeters and meters. Between them the MD.1 and MD.3 items use all five.
 *
 * Every option set here is either all amounts or all words, and a numeric
 * option's value appears once — "4 inches" and "4 feet" would parse as the
 * same number, which is why the estimation items write "About 4 inches".
 *
 * The correct option sits at a varied position: of the 34 items, 8 key A, 9 B,
 * 9 C and 8 D.
 */
export const GRADE_2_MD_AUTHORED: Question[] = [
  // ==========================================
  // Standard: NC.2.MD.1 — Measure Length with Standard Tools
  // ==========================================
  {
    id: 'g2-md1-01',
    standardCode: 'NC.2.MD.1',
    domainId: 'MD',
    // keyConcept 2: "Choosing the tool that suits the object being measured".
    prompt: 'Mr. Ruiz wants to measure how long the school hallway is, in feet. Which tool is the best choice?',
    options: labelOptions([
      // A 12-inch ruler is only 1 foot long: it measures in feet, but it would
      // have to be moved over and over along a hallway.
      { text: 'A 12-inch ruler', isCorrect: false, misconception: 'chose-a-tool-too-short-for-the-job' },
      { text: 'A measuring tape', isCorrect: true },
      // A bathroom scale measures how heavy something is, not how long.
      {
        text: 'A bathroom scale',
        isCorrect: false,
        misconception: 'chose-a-tool-that-measures-something-else',
      },
      // "In feet" heard as "with your feet". A footstep is not the standard
      // unit called a foot, and no two people's steps are the same size.
      { text: 'His own footsteps', isCorrect: false, misconception: 'measured-with-a-non-standard-unit' },
    ]),
    calculatorAllowed: false,
    isStretch: false,
    difficulty: 'mastery',
    explanation: {
      stepByStep: [
        'Step 1: A hallway is long — many feet from one end to the other.',
        'Step 2: A 12-inch ruler is only 1 foot long, so it would have to be picked up and moved again and again, and it is easy to lose count.',
        'Step 3: A bathroom scale tells how heavy something is, not how long. Footsteps are not all the same size, so they are not a standard unit.',
        'Step 4: A measuring tape is long and marked in feet, so it is the best choice.',
      ],
      conceptSummary:
        'Choose a tool that fits the job: it must measure length, be marked in standard units, and be long enough for the thing being measured.',
      commonMisconception:
        'A 12-inch ruler does measure in feet — it is exactly 1 foot long — but a hallway would need it moved many times, and every move is a chance to lose count.',
    },
  },
  {
    id: 'g2-md1-02',
    standardCode: 'NC.2.MD.1',
    domainId: 'MD',
    // The tool has to be marked in the unit asked for — here centimeters.
    prompt: 'Lena wants to measure the length of a crayon in centimeters. Which tool should she use?',
    options: labelOptions([
      // A yardstick like this is marked in inches, so it measures the crayon
      // in the wrong unit.
      {
        text: 'A yardstick marked in inches',
        isCorrect: false,
        misconception: 'chose-a-tool-marked-in-the-wrong-unit',
      },
      // A measuring cup measures how much a container holds, not length.
      {
        text: 'A measuring cup',
        isCorrect: false,
        misconception: 'chose-a-tool-that-measures-something-else',
      },
      // Paper clips are not a standard unit: they come in different sizes.
      {
        text: 'Paper clips laid end to end',
        isCorrect: false,
        misconception: 'measured-with-a-non-standard-unit',
      },
      { text: 'A centimeter ruler', isCorrect: true },
    ]),
    calculatorAllowed: false,
    isStretch: false,
    difficulty: 'advanced',
    explanation: {
      stepByStep: [
        'Step 1: The question asks for centimeters, so the tool must be marked in centimeters.',
        'Step 2: A yardstick marked in inches measures in the wrong unit, and a measuring cup measures how much a container holds, not length.',
        'Step 3: Paper clips are not a standard unit. A centimeter is the same size everywhere, but paper clips come in different sizes.',
        'Step 4: A centimeter ruler is marked in centimeters and is the right size for a crayon, so it is the tool to use.',
      ],
      conceptSummary:
        'The tool has to match the unit the question asks for. A length in centimeters needs a tool marked in centimeters.',
      commonMisconception:
        'A yardstick is a real measuring tool, but its marks are inches. Measuring with it gives an answer in inches, not the centimeters the question asks for.',
    },
  },
  {
    id: 'g2-md1-03',
    standardCode: 'NC.2.MD.1',
    domainId: 'MD',
    // The standard's own list names yardsticks and meter sticks side by side;
    // they look alike, and they measure in different units.
    prompt: 'Mr. Kim wants to measure the classroom rug in yards. Which tool should he use?',
    options: labelOptions([
      { text: 'A yardstick', isCorrect: true },
      // A meter stick measures meters. A meter is a little longer than a yard.
      {
        text: 'A meter stick',
        isCorrect: false,
        misconception: 'chose-a-tool-marked-in-the-wrong-unit',
      },
      // A clock measures time.
      { text: 'A clock', isCorrect: false, misconception: 'chose-a-tool-that-measures-something-else' },
      // Hand spans are a different size for every person.
      { text: 'His hand spans', isCorrect: false, misconception: 'measured-with-a-non-standard-unit' },
    ]),
    calculatorAllowed: false,
    isStretch: false,
    difficulty: 'mastery',
    explanation: {
      stepByStep: [
        'Step 1: The question asks for yards, and a yardstick is exactly 1 yard long.',
        'Step 2: Lay the yardstick down end to end along the rug and count how many times it fits.',
        'Step 3: A meter stick measures meters, not yards. A clock measures time. Hand spans are different for every person.',
        'Step 4: A yardstick is the tool that measures in yards.',
      ],
      conceptSummary:
        'A standard unit is the same size for everyone, and a yardstick is one yard long. Choosing the tool that matches the unit asked for makes the count mean what the question wants.',
      commonMisconception:
        'A meter stick looks almost the same as a yardstick, but a meter is a little longer than a yard. Measuring with it counts meters, not yards.',
    },
  },

  // ==========================================
  // Standard: NC.2.MD.2 — Measure with Two Different Units
  // ==========================================
  {
    id: 'g2-md2-01',
    standardCode: 'NC.2.MD.2',
    domainId: 'MD',
    // Two units of different lengths, and the count tells which is shorter.
    // The generator gives the unit sizes and asks for the counts; this runs
    // the other way.
    prompt:
      'Ben and Tia measure the same rug with their own shoes, heel to toe. The rug is 9 of Ben’s shoes long. It is 12 of Tia’s shoes long. What does this tell you?',
    options: labelOptions([
      // Tia's count is bigger, so her shoe "must be" bigger too.
      {
        text: 'Tia’s shoe is longer than Ben’s shoe.',
        isCorrect: false,
        misconception: 'expected-a-longer-unit-to-give-a-bigger-count',
      },
      // A bigger count read as a longer rug.
      {
        text: 'The rug is longer when Tia measures it.',
        isCorrect: false,
        misconception: 'thought-the-object-changed-length-with-the-unit',
      },
      { text: 'Tia’s shoe is shorter than Ben’s shoe.', isCorrect: true },
      // The same rug "should" give the same number, so someone slipped.
      {
        text: 'Their shoes are the same size, so one of them counted wrong.',
        isCorrect: false,
        misconception: 'expected-the-count-to-stay-the-same-in-a-new-unit',
      },
    ]),
    calculatorAllowed: false,
    isStretch: false,
    difficulty: 'mastery',
    explanation: {
      stepByStep: [
        'Step 1: Ben and Tia measured the same rug, so the rug is the same length both times.',
        'Step 2: Tia needed more shoes to cover it: 12 is more than 9.',
        'Step 3: When more units fit along the same length, each unit must be shorter.',
        'Step 4: So Tia’s shoe is shorter than Ben’s shoe.',
      ],
      conceptSummary:
        'The shorter the unit, the more of them it takes to cover the same length. A bigger count means a smaller unit, not a longer object.',
      commonMisconception:
        'A bigger number feels like it should go with a bigger shoe. It is the other way round: small shoes fit along the rug more times.',
    },
  },
  {
    id: 'g2-md2-02',
    standardCode: 'NC.2.MD.2',
    domainId: 'MD',
    // keyConcept 2: "Describing how the two measurements relate to the size of
    // the unit chosen." 4 feet and 48 inches are both right.
    prompt:
      'Jada measures the same table two times. In inches, the table is 48 inches long. In feet, it is 4 feet long. Why is the number of feet so much smaller?',
    options: labelOptions([
      { text: 'A foot is longer than an inch, so fewer feet fit along the table.', isCorrect: true },
      // To explain a smaller count with "a smaller unit gives a smaller
      // count", the foot would have to be the shorter unit.
      {
        text: 'A foot is shorter than an inch, so fewer feet fit along the table.',
        isCorrect: false,
        misconception: 'expected-a-longer-unit-to-give-a-bigger-count',
      },
      // A smaller number read as a shorter table.
      {
        text: 'The table got shorter between the two measurements.',
        isCorrect: false,
        misconception: 'thought-the-object-changed-length-with-the-unit',
      },
      // Two different numbers for one table must mean a mistake.
      {
        text: 'Jada made a mistake. The same table should give the same number in any unit.',
        isCorrect: false,
        misconception: 'expected-the-count-to-stay-the-same-in-a-new-unit',
      },
    ]),
    calculatorAllowed: false,
    isStretch: false,
    difficulty: 'advanced',
    explanation: {
      stepByStep: [
        'Step 1: Jada measured the same table both times, so its length did not change.',
        'Step 2: A foot is longer than an inch. Each foot covers more of the table than each inch does.',
        'Step 3: Longer units fit fewer times along the same length, so the count in feet is smaller: 4 is less than 48.',
        'Step 4: The reason is: A foot is longer than an inch, so fewer feet fit along the table.',
      ],
      conceptSummary:
        'Two measurements of one object in two different units can both be right. The longer unit always gives the smaller number.',
      commonMisconception:
        'A smaller number does not mean something went wrong or that the table shrank. It means each unit was longer.',
    },
  },
  {
    id: 'g2-md2-03',
    standardCode: 'NC.2.MD.2',
    domainId: 'MD',
    // Predicting the second measurement before it is taken, from a big unit
    // down to a much smaller one. Yards and inches are a pair the generator
    // never draws (it uses inch/foot, foot/yard, cm/m and cm/inch), and none
    // of its names is Hana, so this is not a copy of a generated question. A
    // rug 3 yards long is 108 inches.
    prompt:
      'Hana measures the same rug two times. First she measures it in yards and gets 3. Then she measures it in inches. A yard is much longer than an inch. What will happen?',
    options: labelOptions([
      // The shorter unit "should" give the smaller count — the longer unit
      // the bigger one.
      {
        text: 'She will count fewer than 3 inches.',
        isCorrect: false,
        misconception: 'expected-a-longer-unit-to-give-a-bigger-count',
      },
      // The count belongs to the rug, so it stays 3.
      {
        text: 'She will count exactly 3 inches.',
        isCorrect: false,
        misconception: 'expected-the-count-to-stay-the-same-in-a-new-unit',
      },
      // A bigger count read as a longer rug.
      {
        text: 'The rug will be longer in inches.',
        isCorrect: false,
        misconception: 'thought-the-object-changed-length-with-the-unit',
      },
      { text: 'She will count more than 3 inches.', isCorrect: true },
    ]),
    calculatorAllowed: false,
    isStretch: false,
    difficulty: 'mastery',
    explanation: {
      stepByStep: [
        'Step 1: The rug stays the same length. Only the unit changes.',
        'Step 2: An inch is much shorter than a yard, so each inch covers only a little of the rug.',
        'Step 3: Shorter units fit more times, so the count will be more than 3.',
        'Step 4: She will count more than 3 inches.',
      ],
      conceptSummary:
        'Switching to a shorter unit makes the count go up; switching to a longer unit makes it go down. The object itself never changes.',
      commonMisconception:
        'An inch is the smaller unit, and it is tempting to think the smaller unit gives the smaller number. Smaller units give bigger counts.',
    },
  },

  // ==========================================
  // Standard: NC.2.MD.3 — Estimate Lengths in Standard Units
  // ==========================================
  {
    id: 'g2-md3-01',
    standardCode: 'NC.2.MD.3',
    domainId: 'MD',
    // Inches. A new crayon is a little under 4 inches. Asked as "how long",
    // the words a child uses, which is what makes the minutes option a real
    // error rather than a filler.
    prompt: 'About how long is a new crayon?',
    options: labelOptions([
      // A length unit, but far too big: 4 yards is longer than a bed.
      { text: 'About 4 yards', isCorrect: false, misconception: 'chose-a-unit-of-the-wrong-size' },
      { text: 'About 4 inches', isCorrect: true },
      // The right unit with a number ten times too big: taller than a small
      // child.
      { text: 'About 40 inches', isCorrect: false, misconception: 'estimated-ten-times-too-large' },
      // "How long" heard as a question about time.
      { text: 'About 4 minutes', isCorrect: false, misconception: 'measured-length-with-a-unit-of-time' },
    ]),
    calculatorAllowed: false,
    isStretch: false,
    difficulty: 'mastery',
    explanation: {
      stepByStep: [
        'Step 1: A length needs a length unit, so minutes are out — minutes measure time, not how far something stretches.',
        'Step 2: An inch is about as wide as a thumb. A new crayon is about as long as four thumbs side by side.',
        'Step 3: 40 inches is taller than a small child, and 4 yards is longer than a bed, so both are far too long for a crayon.',
        'Step 4: About 4 inches is the best estimate.',
      ],
      conceptSummary:
        'A good estimate uses a length unit of the right size. Picturing a benchmark — about 1 inch across a thumb — keeps the number sensible.',
      commonMisconception:
        '"How long" can be about time as well as length, so 4 minutes can sound right. A crayon’s length is how far it stretches, so it needs inches, not minutes.',
    },
  },
  {
    id: 'g2-md3-02',
    standardCode: 'NC.2.MD.3',
    domainId: 'MD',
    // Feet. A school bus is about 35 to 45 feet long.
    prompt: 'Which is the best estimate for the length of a school bus?',
    options: labelOptions([
      // Ten times too long: longer than a whole football field.
      { text: 'About 400 feet', isCorrect: false, misconception: 'estimated-ten-times-too-large' },
      // The same number in a far smaller unit: shorter than a grown-up.
      { text: 'About 40 inches', isCorrect: false, misconception: 'chose-a-unit-of-the-wrong-size' },
      { text: 'About 40 feet', isCorrect: true },
      // Ten times too short: shorter than a grown-up is tall.
      { text: 'About 4 feet', isCorrect: false, misconception: 'estimated-ten-times-too-small' },
    ]),
    calculatorAllowed: false,
    isStretch: false,
    difficulty: 'mastery',
    explanation: {
      stepByStep: [
        'Step 1: A foot is about the length of a grown-up’s shoe. A school bus is much longer than a car.',
        'Step 2: 4 feet is shorter than a grown-up is tall, and 40 inches is shorter still, so both are far too small for a bus.',
        'Step 3: 400 feet is longer than a football field — ten times too long.',
        'Step 4: About 40 feet is the best estimate.',
      ],
      conceptSummary:
        'Estimating means choosing a sensible number AND a sensible unit. Comparing with something you know — a shoe, a car, a person — checks both.',
      commonMisconception:
        'Adding or taking away a zero changes an estimate ten times over. 4 feet and 400 feet are both far from the length of a real bus.',
    },
  },
  {
    id: 'g2-md3-03',
    standardCode: 'NC.2.MD.3',
    domainId: 'MD',
    // Meters. A classroom is about 10 big steps across.
    prompt: 'Which is the best estimate for the length of a classroom?',
    options: labelOptions([
      { text: 'About 10 meters', isCorrect: true },
      // The same number in a far smaller unit: shorter than a pencil.
      { text: 'About 10 centimeters', isCorrect: false, misconception: 'chose-a-unit-of-the-wrong-size' },
      // Ten times too short: one big step.
      { text: 'About 1 meter', isCorrect: false, misconception: 'estimated-ten-times-too-small' },
      // Ten times too long: as long as a soccer field.
      { text: 'About 100 meters', isCorrect: false, misconception: 'estimated-ten-times-too-large' },
    ]),
    calculatorAllowed: false,
    isStretch: false,
    difficulty: 'advanced',
    explanation: {
      stepByStep: [
        'Step 1: A meter is about as long as one big step for a grown-up.',
        'Step 2: A classroom is about 10 big steps from one wall to the other.',
        'Step 3: 1 meter is only one step, and 10 centimeters is shorter than a pencil, so both are far too small. 100 meters is about as long as a soccer field, which is far too big.',
        'Step 4: About 10 meters is the best estimate.',
      ],
      conceptSummary:
        'Meters are for long things like rooms and hallways; centimeters are for small things like crayons and erasers. Picking the unit comes before picking the number.',
      commonMisconception:
        'About 1 meter uses a sensible unit with a number ten times too small — one big step does not reach across a classroom.',
    },
  },
  {
    id: 'g2-md3-04',
    standardCode: 'NC.2.MD.3',
    domainId: 'MD',
    // Yards. A car is about 15 feet, which is 5 big steps. Asked as "how
    // long", so the minutes option is the error its tag names.
    prompt: 'About how long is a car?',
    options: labelOptions([
      // A far smaller unit: shorter than a pencil.
      { text: 'About 5 inches', isCorrect: false, misconception: 'chose-a-unit-of-the-wrong-size' },
      // Ten times too long: half a football field.
      { text: 'About 50 yards', isCorrect: false, misconception: 'estimated-ten-times-too-large' },
      // "How long" heard as time — a car does take minutes to go places.
      { text: 'About 5 minutes', isCorrect: false, misconception: 'measured-length-with-a-unit-of-time' },
      { text: 'About 5 yards', isCorrect: true },
    ]),
    calculatorAllowed: false,
    isStretch: false,
    difficulty: 'advanced',
    explanation: {
      stepByStep: [
        'Step 1: A yard is about as long as a baseball bat, or one big step.',
        'Step 2: A car is about 5 big steps from front to back, so about 5 yards.',
        'Step 3: 5 inches is shorter than a pencil, 50 yards is half a football field, and minutes measure time, not length.',
        'Step 4: About 5 yards is the best estimate.',
      ],
      conceptSummary:
        'Yards and feet are for bigger things; inches are for small ones. The unit has to fit the size of the object before the number can.',
      commonMisconception:
        'A car does take minutes to drive somewhere, but "how long is a car" asks how far it stretches from front to back, which is a length.',
    },
  },
  {
    id: 'g2-md3-05',
    standardCode: 'NC.2.MD.3',
    domainId: 'MD',
    // Centimeters as the KEYED unit — keyConcept 2 is "estimating in
    // centimeters and meters", and until this item centimeters only ever
    // appeared as a wrong option. A new pencil is about 19 centimeters.
    prompt: 'Which is the best estimate for the length of a new pencil?',
    options: labelOptions([
      // The same number in a far bigger unit: longer than a classroom.
      { text: 'About 20 meters', isCorrect: false, misconception: 'chose-a-unit-of-the-wrong-size' },
      // Ten times too long: taller than a grown-up.
      { text: 'About 200 centimeters', isCorrect: false, misconception: 'estimated-ten-times-too-large' },
      { text: 'About 20 centimeters', isCorrect: true },
      // Ten times too short: only two fingertips wide.
      { text: 'About 2 centimeters', isCorrect: false, misconception: 'estimated-ten-times-too-small' },
    ]),
    calculatorAllowed: false,
    isStretch: false,
    difficulty: 'mastery',
    explanation: {
      stepByStep: [
        'Step 1: A centimeter is about as wide as the tip of your little finger.',
        'Step 2: A new pencil is about as long as 20 of those fingertips in a row.',
        'Step 3: 2 centimeters is shorter than a paper clip, 200 centimeters is taller than a grown-up, and 20 meters is longer than a whole classroom.',
        'Step 4: About 20 centimeters is the best estimate.',
      ],
      conceptSummary:
        'Centimeters are the small metric unit, for things that fit in your hand. Picturing one fingertip-width and counting how many would fit keeps a centimeter estimate sensible.',
      commonMisconception:
        'About 20 meters has the right number in the wrong unit. A meter is about one big step, and a pencil is nowhere near 20 big steps long.',
    },
  },

  // ==========================================
  // Standard: NC.2.MD.4 — Compare Lengths of Two Objects
  // ==========================================
  {
    id: 'g2-md4-01',
    standardCode: 'NC.2.MD.4',
    domainId: 'MD',
    // keyConcept 1: "Measuring both objects before comparing."
    prompt: 'How much longer is the pencil than the crayon?',
    promptDetails:
      'A pencil and a crayon lie along the same ruler, marked in inches. Both start at the 0 mark. The pencil ends at the 8 mark. The crayon ends at the 3 mark.',
    options: labelOptions([
      // 8 + 3 = 11: put the two lengths together.
      { text: '11 inches', isCorrect: false, misconception: 'added-instead-of-subtracted' },
      // 8: measured the pencil and stopped before comparing.
      { text: '8 inches', isCorrect: false, misconception: 'forgot-the-final-step' },
      { text: '5 inches', isCorrect: true },
      // 6: counted the marks 3, 4, 5, 6, 7, 8 between the two ends instead of
      // the 5 spaces.
      { text: '6 inches', isCorrect: false, misconception: 'counted-the-ruler-marks-not-the-spaces' },
    ]),
    calculatorAllowed: false,
    isStretch: false,
    difficulty: 'mastery',
    explanation: {
      stepByStep: [
        'Step 1: Measure each one first. Both start at 0, so the pencil is 8 inches long and the crayon is 3 inches long.',
        'Step 2: "How much longer" asks for the difference between the two lengths.',
        'Step 3: Count the spaces from the 3 mark to the 8 mark, or subtract: 8 − 3 = 5.',
        'Step 4: The pencil is 5 inches longer than the crayon.',
      ],
      conceptSummary:
        'To compare two lengths, measure both in the same unit, then subtract the shorter from the longer. The answer says how many units longer, with the unit.',
      commonMisconception:
        'Counting the marks from 3 to 8 counts 6 marks, but only 5 spaces lie between them — and it is the spaces that are inches.',
    },
  },
  {
    id: 'g2-md4-02',
    standardCode: 'NC.2.MD.4',
    domainId: 'MD',
    // One object does not start at 0, so it has to be measured properly
    // before the two can be compared.
    prompt: 'How much longer is the red ribbon than the blue ribbon?',
    promptDetails:
      'Two ribbons lie along the same ruler, marked in centimeters. The red ribbon starts at the 2 mark and ends at the 9 mark. The blue ribbon starts at the 0 mark and ends at the 5 mark.',
    options: labelOptions([
      // Took the red ribbon as 9, the mark where it ends: 9 − 5 = 4.
      {
        text: '4 centimeters',
        isCorrect: false,
        misconception: 'read-the-end-mark-without-starting-at-zero',
      },
      { text: '2 centimeters', isCorrect: true },
      // 7 + 5 = 12: put the two lengths together.
      { text: '12 centimeters', isCorrect: false, misconception: 'added-instead-of-subtracted' },
      // 7: measured the red ribbon and stopped before comparing.
      { text: '7 centimeters', isCorrect: false, misconception: 'forgot-the-final-step' },
    ]),
    calculatorAllowed: false,
    isStretch: false,
    difficulty: 'advanced',
    explanation: {
      stepByStep: [
        'Step 1: The red ribbon does not start at 0. From the 2 mark to the 9 mark is 9 − 2 = 7 centimeters.',
        'Step 2: The blue ribbon starts at 0 and ends at 5, so it is 5 centimeters long.',
        'Step 3: Now compare: 7 − 5 = 2.',
        'Step 4: The red ribbon is 2 centimeters longer than the blue ribbon.',
      ],
      conceptSummary:
        'Measure each object from where it really starts. Only then compare the two lengths by subtracting.',
      commonMisconception:
        'Reading 9 as the red ribbon’s length counts the 2 centimeters before it starts. That makes the difference 9 − 5 = 4 instead of 2.',
    },
  },
  {
    id: 'g2-md4-03',
    standardCode: 'NC.2.MD.4',
    domainId: 'MD',
    // keyConcept 2: "Expressing the difference in a standard length unit" —
    // which object, how much, and in what unit.
    prompt:
      'Kim measures a table and a desk with a measuring tape marked in feet. The table is 5 feet long. The desk is 3 feet long. Which sentence is true?',
    options: labelOptions([
      // Found the difference of 2 but gave it to the shorter object.
      {
        text: 'The desk is 2 feet longer than the table.',
        isCorrect: false,
        misconception: 'reversed-which-one-is-longer',
      },
      // 5 + 3 = 8.
      {
        text: 'The table is 8 feet longer than the desk.',
        isCorrect: false,
        misconception: 'added-instead-of-subtracted',
      },
      // The right difference in a unit the measurements were never in.
      {
        text: 'The table is 2 inches longer than the desk.',
        isCorrect: false,
        misconception: 'mislabeled-the-unit',
      },
      { text: 'The table is 2 feet longer than the desk.', isCorrect: true },
    ]),
    calculatorAllowed: false,
    isStretch: false,
    difficulty: 'advanced',
    explanation: {
      stepByStep: [
        'Step 1: Both lengths are in feet: the table is 5 feet and the desk is 3 feet.',
        'Step 2: The table is the longer one, because 5 is more than 3.',
        'Step 3: Subtract to find how much longer: 5 − 3 = 2, and the unit is still feet.',
        'Step 4: The table is 2 feet longer than the desk.',
      ],
      conceptSummary:
        'A length difference is stated in the same standard unit as the measurements, and it says which object is the longer one.',
      commonMisconception:
        'The 2 is right in "2 inches longer", but the measurements were in feet, so the difference is 2 feet — and an inch is much shorter than a foot.',
    },
  },

  // ==========================================
  // Standard: NC.2.MD.5 — Length Word Problems within 100
  // ==========================================
  {
    id: 'g2-md5-01',
    standardCode: 'NC.2.MD.5',
    domainId: 'MD',
    // PUT TOGETHER, result unknown — a shape the generator (compare, smaller
    // unknown) never draws.
    prompt:
      'Sam lays a 38-foot rope and a 45-foot rope end to end in one long line. The equation 38 + 45 = ☐ shows this. How long is the line?',
    options: labelOptions([
      { text: '83 feet', isCorrect: true },
      // 8 + 5 = 13, wrote the 3 and never carried the ten: 30 + 40 + 3 = 73.
      { text: '73 feet', isCorrect: false, misconception: 'added-without-carrying' },
      // 45 − 38 = 7: subtracted the two lengths.
      { text: '7 feet', isCorrect: false, misconception: 'subtracted-instead-of-added' },
      // 45: gave back one of the lengths the equation already shows.
      { text: '45 feet', isCorrect: false, misconception: 'restated-a-known-number-instead-of-solving' },
    ]),
    calculatorAllowed: false,
    isStretch: false,
    difficulty: 'mastery',
    explanation: {
      stepByStep: [
        'Step 1: The ☐ stands for the length of the whole line: both ropes together.',
        'Step 2: Ones: 8 + 5 = 13. That is 1 ten and 3 ones.',
        'Step 3: Tens: 3 tens + 4 tens + the 1 new ten = 8 tens. So 38 + 45 = 83.',
        'Step 4: The line is 83 feet long.',
      ],
      conceptSummary:
        'Putting two lengths end to end makes one length that is their sum, so the story is an addition. Both lengths are in feet, so the answer is in feet too.',
      commonMisconception:
        'Answering 73 feet adds the ones to get 13 but writes only the 3, so the extra ten never reaches the tens place.',
    },
  },
  {
    id: 'g2-md5-02',
    standardCode: 'NC.2.MD.5',
    domainId: 'MD',
    // Ruling 19-5: the description mandates "equations with a symbol for the
    // unknown number to represent the problem", so here the four options ARE
    // the equations. COMPARE, BIGGER unknown. The other correct form,
    // ☐ − 17 = 26, is deliberately not on offer: exactly one option may
    // represent the story.
    prompt:
      'The red ribbon is 26 inches long. The green ribbon is 30 inches long. The blue ribbon is 17 inches longer than the red ribbon. Which equation shows how long the blue ribbon is?',
    options: labelOptions([
      // Subtracted: "longer than" treated as a take-away.
      { text: '26 − 17 = ☐', isCorrect: false, misconception: 'subtracted-instead-of-added' },
      // Added every number in the story, the green ribbon's 30 included.
      { text: '26 + 17 + 30 = ☐', isCorrect: false, misconception: 'added-every-number-in-the-story' },
      { text: '26 + 17 = ☐', isCorrect: true },
      // Built the blue ribbon on the green one instead of the red one.
      { text: '30 + 17 = ☐', isCorrect: false, misconception: 'used-the-wrong-given-quantity' },
    ]),
    calculatorAllowed: false,
    isStretch: false,
    difficulty: 'advanced',
    explanation: {
      stepByStep: [
        'Step 1: The blue ribbon is 17 inches longer than the RED ribbon, so the green ribbon is not part of this question.',
        'Step 2: Longer means the blue ribbon is the red ribbon’s 26 inches and 17 inches more.',
        'Step 3: The ☐ stands for the blue ribbon’s length, so the equation adds: 26 + 17 = ☐, and ☐ is 43.',
        'Step 4: The equation is 26 + 17 = ☐.',
      ],
      conceptSummary:
        'An equation with a ☐ tells the story in numbers: each number stands for something in the problem, and the ☐ stands for what the question asks.',
      commonMisconception:
        '"Longer than the red ribbon" compares the blue ribbon with the red one only. The green ribbon’s 30 inches is extra information here.',
    },
  },
  {
    id: 'g2-md5-03',
    standardCode: 'NC.2.MD.5',
    domainId: 'MD',
    // TAKE FROM, START unknown: the length before the cut.
    prompt:
      'Dad cuts 25 centimeters off a board. Now the board is 48 centimeters long. The equation ☐ − 25 = 48 shows this. How long was the board before Dad cut it?',
    options: labelOptions([
      // 48 − 25 = 23: the minus sign in the equation followed instead of
      // undone.
      { text: '23 centimeters', isCorrect: false, misconception: 'subtracted-instead-of-added' },
      { text: '73 centimeters', isCorrect: true },
      // 48: gave back the length the problem already told.
      {
        text: '48 centimeters',
        isCorrect: false,
        misconception: 'restated-a-known-number-instead-of-solving',
      },
      // 8 + 5 = 13, wrote the 3 and never carried the ten: 40 + 20 + 3 = 63.
      { text: '63 centimeters', isCorrect: false, misconception: 'added-without-carrying' },
    ]),
    calculatorAllowed: false,
    isStretch: false,
    difficulty: 'advanced',
    explanation: {
      stepByStep: [
        'Step 1: The ☐ is the board’s length before the cut.',
        'Step 2: Cutting took 25 centimeters away and left 48, so putting the 25 back gives the starting length: 48 + 25.',
        'Step 3: Ones: 8 + 5 = 13, which is 1 ten and 3 ones. Tens: 4 + 2 + 1 = 7 tens. So 48 + 25 = 73, and 73 − 25 = 48 checks.',
        'Step 4: The board was 73 centimeters long.',
      ],
      conceptSummary:
        'When the starting length is the unknown, undo what happened: a length that was cut shorter gets the cut piece added back.',
      commonMisconception:
        'The minus sign in the equation makes subtracting feel right, but 48 − 25 = 23 would make the board shorter than the piece that is left.',
    },
  },

  // ==========================================
  // Standard: NC.2.MD.6 — Whole Numbers as Lengths on a Number Line
  // ==========================================
  {
    id: 'g2-md6-01',
    standardCode: 'NC.2.MD.6',
    domainId: 'MD',
    // A SUM within 100 as jumps: 23 + 14 as one jump of 10 and four of 1.
    prompt:
      'Ava starts at 23 on a number line. She makes one jump of 10. Then she makes 4 jumps of 1. Where does she land?',
    options: labelOptions([
      // Counted the 33 she was standing on as the first of the four jumps:
      // 33, 34, 35, 36.
      { text: '36', isCorrect: false, misconception: 'counted-the-number-line-marks-not-the-jumps' },
      // Stopped after the jump of 10.
      { text: '33', isCorrect: false, misconception: 'forgot-the-final-step' },
      // 10 + 4 = 14: how far she jumped, as if she had started at 0.
      { text: '14', isCorrect: false, misconception: 'left-out-the-number-line-starting-point' },
      { text: '37', isCorrect: true },
    ]),
    calculatorAllowed: false,
    isStretch: false,
    difficulty: 'mastery',
    explanation: {
      stepByStep: [
        'Step 1: Start at 23.',
        'Step 2: One jump of 10 lands on 33.',
        'Step 3: Four jumps of 1: 34, 35, 36, 37. Count the jumps, not the mark you start on.',
        'Step 4: Ava lands on 37.',
      ],
      conceptSummary:
        'On a number line, adding is jumping to the right. A jump of 10 and four jumps of 1 show 23 + 14, and the landing point is the sum.',
      commonMisconception:
        'Saying "one" on the 33 before jumping counts a mark instead of a jump, so the count ends on 36, one short of where the fourth jump really lands.',
    },
  },
  {
    id: 'g2-md6-02',
    standardCode: 'NC.2.MD.6',
    domainId: 'MD',
    // A DIFFERENCE within 100 as jumps back toward 0: 52 − 30.
    prompt: 'Ben starts at 52 on a number line. He makes 3 jumps of 10 back toward 0. Where does he land?',
    options: labelOptions([
      { text: '22', isCorrect: true },
      // Jumped forward instead of back: 52 + 30 = 82.
      { text: '82', isCorrect: false, misconception: 'added-instead-of-subtracted' },
      // Each jump of 10 counted as a jump of 1: 52 − 3 = 49.
      { text: '49', isCorrect: false, misconception: 'counted-each-jump-as-one-not-its-size' },
      // Counted 52 as the first jump: "one" on 52, "two" on 42, "three" on 32.
      { text: '32', isCorrect: false, misconception: 'counted-the-number-line-marks-not-the-jumps' },
    ]),
    calculatorAllowed: false,
    isStretch: false,
    difficulty: 'mastery',
    explanation: {
      stepByStep: [
        'Step 1: Start at 52. Jumping back toward 0 means subtracting.',
        'Step 2: Each jump is 10: 52 to 42, 42 to 32, 32 to 22.',
        'Step 3: That is 3 jumps of 10, so the number line shows 52 − 30.',
        'Step 4: Ben lands on 22.',
      ],
      conceptSummary:
        'Jumps to the left on a number line show subtraction. Three jumps of 10 take away 30 in all, one ten at a time.',
      commonMisconception:
        'Counting 52 as the first jump stops on 32 after only two real jumps. The count starts with the first move, not the starting mark.',
    },
  },
  {
    id: 'g2-md6-03',
    standardCode: 'NC.2.MD.6',
    domainId: 'MD',
    // Representing a sum on a number line, with the diagrams described in
    // words.
    prompt: 'Which number line diagram shows 45 + 30?',
    options: labelOptions([
      // Jumped back instead of forward: 45 − 30 = 15.
      {
        text: 'Start at 45. Make 3 jumps of 10 back. Land on 15.',
        isCorrect: false,
        misconception: 'subtracted-instead-of-added',
      },
      { text: 'Start at 45. Make 3 jumps of 10 forward. Land on 75.', isCorrect: true },
      // Left the 45 out: the jumps alone, from 0.
      {
        text: 'Start at 0. Make 3 jumps of 10 forward. Land on 30.',
        isCorrect: false,
        misconception: 'left-out-the-number-line-starting-point',
      },
      // 30 shown as 3 jumps of 1: 45 + 3 = 48.
      {
        text: 'Start at 45. Make 3 jumps of 1 forward. Land on 48.',
        isCorrect: false,
        misconception: 'counted-each-jump-as-one-not-its-size',
      },
    ]),
    calculatorAllowed: false,
    isStretch: false,
    difficulty: 'advanced',
    explanation: {
      stepByStep: [
        'Step 1: Adding 30 starts at the first number, 45.',
        'Step 2: 30 is 3 tens, so make 3 jumps of 10 to the right: 55, 65, 75.',
        'Step 3: Forward (to the right) is adding; back (to the left) would be subtracting.',
        'Step 4: The right diagram is: Start at 45. Make 3 jumps of 10 forward. Land on 75.',
      ],
      conceptSummary:
        'A sum on a number line starts at one number and jumps forward by the other. The jumps show the second number, and the landing point is the answer.',
      commonMisconception:
        'Starting at 0 shows only the 30. The jumps have to start from 45, or the first number is lost.',
    },
  },
  {
    id: 'g2-md6-04',
    standardCode: 'NC.2.MD.6',
    domainId: 'MD',
    // keyConcepts 1 and 2: a whole number as a LENGTH FROM 0, on a line with
    // equally spaced points that go up by 5.
    prompt: 'Lily draws an arrow on a number line. What whole number does her arrow show?',
    promptDetails:
      'A number line with equally spaced marks. The marks are labeled 0, 5, 10, 15, and so on, going up by 5 each time. Lily’s arrow starts at 0 and stretches across 7 of the spaces between marks.',
    options: labelOptions([
      // Counted the 7 spaces as 7 ones.
      { text: '7', isCorrect: false, misconception: 'counted-each-jump-as-one-not-its-size' },
      // Counted the 0 mark as the first of seven: 0, 5, 10, 15, 20, 25, 30.
      { text: '30', isCorrect: false, misconception: 'counted-the-number-line-marks-not-the-jumps' },
      { text: '35', isCorrect: true },
      // Skip-counted by 10s on a line that goes up by 5s: 7 tens is 70.
      { text: '70', isCorrect: false, misconception: 'skip-counted-by-the-wrong-step' },
    ]),
    calculatorAllowed: false,
    isStretch: false,
    difficulty: 'advanced',
    explanation: {
      stepByStep: [
        'Step 1: The arrow starts at 0, so the number it shows is its length.',
        'Step 2: Each space between marks is 5, because the labels go up by 5.',
        'Step 3: Count 7 spaces by fives: 5, 10, 15, 20, 25, 30, 35.',
        'Step 4: The arrow shows 35.',
      ],
      conceptSummary:
        'A whole number can be shown as a length from 0 on a number line. When the marks go up by 5, each space is worth 5, not 1.',
      commonMisconception:
        'Answering 7 counts the spaces but forgets what each one is worth. On this line every space stands for 5.',
    },
  },

  // ==========================================
  // Standard: NC.2.MD.7 — Tell Time to Five Minutes (a.m. & p.m.)
  // ==========================================
  {
    id: 'g2-md7-01',
    standardCode: 'NC.2.MD.7',
    domainId: 'MD',
    // Early in the hour, which the generator (:35 to :55) never draws, with a
    // wrong a.m./p.m. label on offer.
    prompt: 'Nora looks at her clock in the morning. What time is it?',
    promptDetails:
      'A clock with two hands. The short hour hand is just past the 8. The long minute hand points straight at the 3.',
    options: labelOptions([
      // The 3 the minute hand points at read as 3 minutes.
      { text: '8:03 a.m.', isCorrect: false, misconception: 'read-the-minute-hand-as-the-number-it-points-to' },
      // The long hand read as the hour (3), the short hand's 8 as 8 fives of
      // minutes (40).
      { text: '3:40 a.m.', isCorrect: false, misconception: 'swapped-the-hour-and-minute-hands' },
      { text: '8:15 a.m.', isCorrect: true },
      // Morning written as p.m.
      { text: '8:15 p.m.', isCorrect: false, misconception: 'mixed-up-a-m-and-p-m' },
    ]),
    calculatorAllowed: false,
    isStretch: false,
    difficulty: 'mastery',
    explanation: {
      stepByStep: [
        'Step 1: The short hand tells the hour. It is just past the 8, so the hour is 8.',
        'Step 2: The long hand tells the minutes. Count by fives to the 3: 5, 10, 15.',
        'Step 3: It is morning, and morning times are a.m.',
        'Step 4: The time is 8:15 a.m.',
      ],
      conceptSummary:
        'The hour hand says which hour it is; the minute hand counts fives of minutes around the clock. a.m. names the times from midnight to noon, and p.m. the times from noon to midnight.',
      commonMisconception:
        'The minute hand pointing at the 3 does not mean 3 minutes. Each number around the clock is 5 more minutes, so the 3 means 15.',
    },
  },
  {
    id: 'g2-md7-02',
    standardCode: 'NC.2.MD.7',
    domainId: 'MD',
    // Late in the hour, where the hour hand sits near the NEXT number.
    prompt:
      'Jaden’s soccer game starts in the afternoon at the time this clock shows. What time does the game start?',
    promptDetails:
      'A clock with two hands. The short hour hand is between the 3 and the 4, closer to the 4. The long minute hand points straight at the 9.',
    options: labelOptions([
      // Read the 4 the hour hand is heading for.
      { text: '4:45 p.m.', isCorrect: false, misconception: 'read-the-next-hour-from-the-hour-hand' },
      // The 9 the minute hand points at read as 9 minutes.
      { text: '3:09 p.m.', isCorrect: false, misconception: 'read-the-minute-hand-as-the-number-it-points-to' },
      // An afternoon game written as a.m.
      { text: '3:45 a.m.', isCorrect: false, misconception: 'mixed-up-a-m-and-p-m' },
      { text: '3:45 p.m.', isCorrect: true },
    ]),
    calculatorAllowed: false,
    isStretch: false,
    difficulty: 'advanced',
    explanation: {
      stepByStep: [
        'Step 1: The short hand is between the 3 and the 4. It has passed the 3 but has not reached the 4, so the hour is still 3.',
        'Step 2: The long hand points at the 9. Count by fives: 5, 10, 15, 20, 25, 30, 35, 40, 45.',
        'Step 3: The game is in the afternoon, so the time is p.m.',
        'Step 4: The game starts at 3:45 p.m.',
      ],
      conceptSummary:
        'Late in an hour, the hour hand creeps close to the next number. The hour is still the number it has passed, until the minute hand comes all the way round to the 12.',
      commonMisconception:
        'The hour hand is close to the 4, but it is not there yet. Reading 4:45 jumps ahead a whole hour.',
    },
  },
  {
    id: 'g2-md7-03',
    standardCode: 'NC.2.MD.7',
    domainId: 'MD',
    // On the hour: the minute hand at the 12 means :00.
    prompt: 'Mia goes to bed at night at the time this clock shows. What time does Mia go to bed?',
    promptDetails:
      'A clock with two hands. The short hour hand points straight at the 8. The long minute hand points straight at the 12.',
    options: labelOptions([
      { text: '8:00 p.m.', isCorrect: true },
      // The long hand read as the hour (12), the short hand's 8 as 8 fives of
      // minutes (40).
      { text: '12:40 p.m.', isCorrect: false, misconception: 'swapped-the-hour-and-minute-hands' },
      // The 12 the minute hand points at read as 12 minutes.
      { text: '8:12 p.m.', isCorrect: false, misconception: 'read-the-minute-hand-as-the-number-it-points-to' },
      // Night-time written as a.m.
      { text: '8:00 a.m.', isCorrect: false, misconception: 'mixed-up-a-m-and-p-m' },
    ]),
    calculatorAllowed: false,
    isStretch: false,
    difficulty: 'mastery',
    explanation: {
      stepByStep: [
        'Step 1: The short hand points at the 8, so the hour is 8.',
        'Step 2: The long hand points at the 12. That means 0 minutes past the hour — 8 o’clock.',
        'Step 3: Bedtime at night comes after noon, so the time is p.m.',
        'Step 4: Mia goes to bed at 8:00 p.m.',
      ],
      conceptSummary:
        'When the minute hand points at the 12, the time is exactly on the hour, written :00. a.m. and p.m. tell which 8 o’clock it is — morning or night.',
      commonMisconception:
        'When the long hand points at the 12 at the top of the clock, it means 0 minutes, not 12 minutes.',
    },
  },
  {
    id: 'g2-md7-04',
    standardCode: 'NC.2.MD.7',
    domainId: 'MD',
    // Half past: the hour hand exactly halfway to the next number.
    prompt:
      'Ms. Ortiz’s class goes out to recess in the afternoon at the time this clock shows. What time does recess start?',
    promptDetails:
      'A clock with two hands. The short hour hand is exactly halfway between the 2 and the 3. The long minute hand points straight at the 6.',
    options: labelOptions([
      // The long hand read as the hour (6), the short hand's 2 as 2 fives of
      // minutes (10).
      { text: '6:10 p.m.', isCorrect: false, misconception: 'swapped-the-hour-and-minute-hands' },
      { text: '2:30 p.m.', isCorrect: true },
      // Read the 3 the hour hand is heading for.
      { text: '3:30 p.m.', isCorrect: false, misconception: 'read-the-next-hour-from-the-hour-hand' },
      // The 6 the minute hand points at read as 6 minutes.
      { text: '2:06 p.m.', isCorrect: false, misconception: 'read-the-minute-hand-as-the-number-it-points-to' },
    ]),
    calculatorAllowed: false,
    isStretch: false,
    difficulty: 'advanced',
    explanation: {
      stepByStep: [
        'Step 1: The short hand is halfway between the 2 and the 3. It has passed the 2 and not reached the 3, so the hour is 2.',
        'Step 2: The long hand points at the 6. Count by fives: 5, 10, 15, 20, 25, 30.',
        'Step 3: Recess is in the afternoon, so the time is p.m.',
        'Step 4: Recess starts at 2:30 p.m.',
      ],
      conceptSummary:
        'At half past the hour the minute hand points straight down at the 6 and the hour hand sits halfway to the next number. The hour is still the number it has passed.',
      commonMisconception:
        'Halfway to the 3 is not at the 3. Reading 3:30 counts an hour that has not happened yet.',
    },
  },
  {
    id: 'g2-md7-05',
    standardCode: 'NC.2.MD.7',
    domainId: 'MD',
    // A five-minute mark that is not a quarter or a half: :25. The generator
    // draws only :35 to :55, and the other authored items read :00, :15 and
    // :30, so without this item a child would never count fives to anything
    // but a quarter-hour in the first half of the hour.
    prompt:
      'Leo’s class goes to the library in the morning at the time this clock shows. What time does the class go?',
    promptDetails:
      'A clock with two hands. The short hour hand is a little past the 10, not yet halfway to the 11. The long minute hand points straight at the 5.',
    options: labelOptions([
      // The 5 the minute hand points at read as 5 minutes.
      { text: '10:05 a.m.', isCorrect: false, misconception: 'read-the-minute-hand-as-the-number-it-points-to' },
      { text: '10:25 a.m.', isCorrect: true },
      // The long hand read as the hour (5), the short hand's 10 as 10 fives of
      // minutes (50).
      { text: '5:50 a.m.', isCorrect: false, misconception: 'swapped-the-hour-and-minute-hands' },
      // A morning trip written as p.m.
      { text: '10:25 p.m.', isCorrect: false, misconception: 'mixed-up-a-m-and-p-m' },
    ]),
    calculatorAllowed: false,
    isStretch: false,
    difficulty: 'mastery',
    explanation: {
      stepByStep: [
        'Step 1: The short hand tells the hour. It is a little past the 10, so the hour is 10.',
        'Step 2: The long hand points at the 5. Count by fives: 5, 10, 15, 20, 25.',
        'Step 3: The class goes in the morning, and morning times are a.m.',
        'Step 4: The class goes to the library at 10:25 a.m.',
      ],
      conceptSummary:
        'Every number around the clock is 5 more minutes for the long hand. Counting by fives from the 12 to the number it points at gives the minutes past the hour.',
      commonMisconception:
        'The long hand pointing at the 5 does not mean 5 minutes. Five fives make 25, so the time is 25 minutes past 10.',
    },
  },

  // ==========================================
  // Standard: NC.2.MD.8 — Money Word Problems: Coins & Dollars
  // ==========================================
  {
    id: 'g2-md8-01',
    standardCode: 'NC.2.MD.8',
    domainId: 'MD',
    // keyConcept 1: cents within 99¢, "using ¢ symbols appropriately".
    prompt: 'Ella has 60¢. She buys an eraser for 25¢. How much money does she have left?',
    options: labelOptions([
      // 60 + 25 = 85: added the price on instead of taking it away.
      { text: '85¢', isCorrect: false, misconception: 'added-instead-of-subtracted' },
      { text: '35¢', isCorrect: true },
      // Ones: 0 − 5 will not go, so took 5 − 0 = 5 instead; tens 6 − 2 = 4.
      { text: '45¢', isCorrect: false, misconception: 'subtracted-without-regrouping' },
      // The right number with the dollar sign: thirty-five whole dollars.
      { text: '$35', isCorrect: false, misconception: 'used-the-wrong-money-symbol' },
    ]),
    calculatorAllowed: false,
    isStretch: false,
    difficulty: 'mastery',
    explanation: {
      stepByStep: [
        'Step 1: Ella spends 25¢, so take 25¢ away from 60¢.',
        'Step 2: Ones: 0 − 5 will not go, so trade 1 ten for 10 ones: 10 − 5 = 5.',
        'Step 3: Tens: 5 − 2 = 3. So 60 − 25 = 35.',
        'Step 4: Ella has 35¢ left.',
      ],
      conceptSummary:
        'Money in cents is added and subtracted like any other numbers within 100. The ¢ sign after the number says the amount is cents.',
      commonMisconception:
        '$35 means thirty-five whole dollars — a hundred times more than 35 cents. Amounts less than a dollar are written with the ¢ sign.',
    },
  },
  {
    id: 'g2-md8-02',
    standardCode: 'NC.2.MD.8',
    domainId: 'MD',
    // keyConcept 2: whole dollars with $, in a two-step story.
    prompt: 'Omar has $45. He earns $30 more. Then he spends $18 on a book. How much money does Omar have now?',
    options: labelOptions([
      // 45 + 30 = 75, and stopped before paying for the book.
      { text: '$75', isCorrect: false, misconception: 'forgot-the-final-step' },
      // 45 + 30 + 18 = 93: added the $18 spent as well.
      { text: '$93', isCorrect: false, misconception: 'added-instead-of-subtracted' },
      { text: '$57', isCorrect: true },
      // 75 − 18: ones 5 − 8 will not go, so took 8 − 5 = 3; tens 7 − 1 = 6.
      { text: '$63', isCorrect: false, misconception: 'subtracted-without-regrouping' },
    ]),
    calculatorAllowed: false,
    isStretch: false,
    difficulty: 'advanced',
    explanation: {
      stepByStep: [
        'Step 1: First, Omar earns $30: $45 + $30 = $75.',
        'Step 2: Then he spends $18, so take it away: $75 − $18.',
        'Step 3: Ones: 5 − 8 will not go, so trade a ten: 15 − 8 = 7. Tens: 6 − 1 = 5. So $75 − $18 = $57.',
        'Step 4: Omar has $57 now.',
      ],
      conceptSummary:
        'A two-step money problem is done one step at a time: earning adds, spending takes away. Whole-dollar amounts are written with the $ sign in front.',
      commonMisconception:
        'Stopping at $75 answers how much Omar had after earning, before the book. The question asks about after he pays for it.',
    },
  },
  {
    id: 'g2-md8-03',
    standardCode: 'NC.2.MD.8',
    domainId: 'MD',
    // Whole dollars, put together.
    prompt: 'A kite costs $28. A ball costs $45. How much do the kite and the ball cost together?',
    options: labelOptions([
      // 45 − 28 = 17: subtracted the two prices.
      { text: '$17', isCorrect: false, misconception: 'subtracted-instead-of-added' },
      // The right number with the cent sign: less than one dollar.
      { text: '73¢', isCorrect: false, misconception: 'used-the-wrong-money-symbol' },
      // 8 + 5 = 13, wrote the 3 and never carried the ten: 20 + 40 + 3 = 63.
      { text: '$63', isCorrect: false, misconception: 'added-without-carrying' },
      { text: '$73', isCorrect: true },
    ]),
    calculatorAllowed: false,
    isStretch: false,
    difficulty: 'mastery',
    explanation: {
      stepByStep: [
        'Step 1: "Together" means add: $28 + $45.',
        'Step 2: Ones: 8 + 5 = 13. That is 1 ten and 3 ones.',
        'Step 3: Tens: 2 + 4 + 1 = 7 tens. So 28 + 45 = 73.',
        'Step 4: Together they cost $73.',
      ],
      conceptSummary:
        'Whole-dollar amounts add like whole numbers, and the answer keeps the $ sign in front because it is still dollars.',
      commonMisconception:
        '73¢ is less than one dollar. The prices are in dollars, so the total is $73, not 73 cents.',
    },
  },
  {
    id: 'g2-md8-04',
    standardCode: 'NC.2.MD.8',
    domainId: 'MD',
    // Coins named in words, counted by value, then a "how much more" step.
    //
    // The coins and price are chosen so each wrong option has ONE cause. None
    // of 35, 48 or 20 is a number the prompt prints (1, 1, 50), a coin's value
    // (25, 10), what leaving a coin out gives (50 − 25 = 25, 50 − 10 = 40),
    // adding the price on (50 + 35 = 85), or the no-regrouping slip on
    // 50 − 35 (tens 5 − 3, ones 5 − 0: 25). With 2 dimes and a 60¢ price
    // instead, counting a dime as 5¢ and leaving one dime out BOTH gave 25¢,
    // and 25¢ was also the quarter's own value — so the tag could name an
    // error the child did not make.
    prompt: 'Rae has 1 quarter and 1 dime. A sticker costs 50¢. How much more money does Rae need?',
    options: labelOptions([
      { text: '15¢', isCorrect: true },
      // 25 + 10 = 35: counted her coins and stopped before comparing.
      { text: '35¢', isCorrect: false, misconception: 'forgot-the-final-step' },
      // 2 coins counted as 2¢: 50 − 2 = 48.
      { text: '48¢', isCorrect: false, misconception: 'counted-the-coins-not-their-value' },
      // The dime counted as 5¢: 25 + 5 = 30, and 50 − 30 = 20.
      { text: '20¢', isCorrect: false, misconception: 'mixed-up-the-values-of-a-nickel-and-a-dime' },
    ]),
    calculatorAllowed: false,
    isStretch: false,
    difficulty: 'advanced',
    explanation: {
      stepByStep: [
        'Step 1: Count Rae’s coins by value: the quarter is 25¢, and the dime is 10¢ more: 35¢.',
        'Step 2: Rae has 35¢.',
        'Step 3: The sticker costs 50¢. Count up from 35¢ to 50¢: 50 − 35 = 15.',
        'Step 4: Rae needs 15¢ more.',
      ],
      conceptSummary:
        'Coins are counted by what each one is worth, not by how many there are. Then "how much more" is the difference between the price and the money counted.',
      commonMisconception:
        'Two coins is not 2¢. A quarter is worth 25¢ and a dime 10¢, so these two coins are worth 35¢.',
    },
  },

  // ==========================================
  // Standard: NC.2.MD.10 — Picture Graphs & Bar Graphs
  // ==========================================
  {
    id: 'g2-md10-01',
    standardCode: 'NC.2.MD.10',
    domainId: 'MD',
    // Ruling 19-4: the ORGANIZE AND REPRESENT half. The data set is given and
    // the options are candidate bar graphs, described in words.
    prompt: 'The tally chart shows how Mr. Bell’s class voted for a class pet. Which bar graph shows the same data?',
    promptDetails:
      'Tally chart titled "Our Class Pet". Dog: a bundle of 5 tally marks and 2 more marks. Cat: 4 tally marks. Fish: a bundle of 5 tally marks. Bird: 3 tally marks.',
    options: labelOptions([
      // Each bundle counted as 4, missing the mark across it: dog 4 + 2 = 6,
      // fish 4.
      {
        text: 'Dog bar to 6, cat bar to 4, fish bar to 4, bird bar to 3',
        isCorrect: false,
        misconception: 'counted-a-tally-bundle-as-four',
      },
      // Each bundle counted as a single mark: dog 1 + 2 = 3, fish 1.
      {
        text: 'Dog bar to 3, cat bar to 4, fish bar to 1, bird bar to 3',
        isCorrect: false,
        misconception: 'counted-a-tally-bundle-as-one-mark',
      },
      // The right counts, with cat's and fish's bars swapped.
      {
        text: 'Dog bar to 7, cat bar to 5, fish bar to 4, bird bar to 3',
        isCorrect: false,
        misconception: 'put-a-count-on-the-wrong-bar',
      },
      { text: 'Dog bar to 7, cat bar to 4, fish bar to 5, bird bar to 3', isCorrect: true },
    ]),
    calculatorAllowed: false,
    isStretch: false,
    difficulty: 'mastery',
    explanation: {
      stepByStep: [
        'Step 1: A bundle of tally marks is 5: four marks with a fifth drawn across them.',
        'Step 2: Dog: 5 + 2 = 7. Cat: 4. Fish: 5. Bird: 3.',
        'Step 3: Each bar goes up to its own animal’s count, on a scale that counts by ones.',
        'Step 4: The matching graph is: Dog bar to 7, cat bar to 4, fish bar to 5, bird bar to 3.',
      ],
      conceptSummary:
        'A bar graph shows the same counts as a tally chart, one bar for each category. Get the counts right first, then match each count to its own label.',
      commonMisconception:
        'The line drawn across a bundle is the fifth mark, not a decoration. Leaving it out turns every 5 into a 4.',
    },
  },
  {
    id: 'g2-md10-02',
    standardCode: 'NC.2.MD.10',
    domainId: 'MD',
    // PUT TOGETHER, read off a picture graph on a scale of one.
    prompt: 'How many books did Ana and Cal read in all?',
    promptDetails:
      'Picture graph titled "Books We Read". Each book picture stands for 1 book. Ana: 6 book pictures. Ben: 4 book pictures. Cal: 7 book pictures.',
    options: labelOptions([
      // 6 + 4 + 7 = 17: added Ben's row as well.
      { text: '17 books', isCorrect: false, misconception: 'summed-all-data-points' },
      { text: '13 books', isCorrect: true },
      // 7 − 6 = 1: compared the two rows instead of putting them together.
      { text: '1 book', isCorrect: false, misconception: 'subtracted-instead-of-added' },
      // 7: read Cal's row and stopped before adding Ana's.
      { text: '7 books', isCorrect: false, misconception: 'forgot-the-final-step' },
    ]),
    calculatorAllowed: false,
    isStretch: false,
    difficulty: 'mastery',
    explanation: {
      stepByStep: [
        'Step 1: Each picture is 1 book, so count the pictures in each row.',
        'Step 2: Ana read 6 books. Cal read 7 books.',
        'Step 3: "In all" means put them together: 6 + 7 = 13.',
        'Step 4: Ana and Cal read 13 books in all.',
      ],
      conceptSummary:
        'On a picture graph where each picture stands for 1, each row shows its count as that many pictures. A put-together question adds only the rows it names.',
      commonMisconception: 'Adding Ben’s row too gives 17, but the question asks only about Ana and Cal.',
    },
  },
  {
    id: 'g2-md10-03',
    standardCode: 'NC.2.MD.10',
    domainId: 'MD',
    // TAKE APART: the total is known and one bar is missing.
    prompt:
      'There are 20 students in Ms. Fox’s class. Each student voted once for the best part of the school day. The bar for recess is missing from the graph. How many students voted for recess?',
    promptDetails:
      'Bar graph titled "Best Part of the Day". The scale counts by ones. Art: the bar reaches 6. Music: the bar reaches 4. Gym: the bar reaches 7. Recess: the bar is missing.',
    options: labelOptions([
      { text: '3 students', isCorrect: true },
      // 20 + 17 = 37: added the class to the three bars.
      { text: '37 students', isCorrect: false, misconception: 'added-instead-of-subtracted' },
      // 6 + 4 + 7 = 17: found the three bars' total and stopped.
      { text: '17 students', isCorrect: false, misconception: 'forgot-the-final-step' },
      // Left gym out: 6 + 4 = 10, and 20 − 10 = 10.
      { text: '10 students', isCorrect: false, misconception: 'left-one-of-the-addends-out' },
    ]),
    calculatorAllowed: false,
    isStretch: false,
    difficulty: 'advanced',
    explanation: {
      stepByStep: [
        'Step 1: Add the bars that are there: 6 + 4 + 7 = 17 students.',
        'Step 2: All 20 students voted, so everyone else voted for recess.',
        'Step 3: Take the 17 away from the 20: 20 − 17 = 3.',
        'Step 4: So 3 students voted for recess.',
      ],
      conceptSummary:
        'When the total is known, a missing part is the total take away all the parts that are shown — a take-apart problem read off the graph.',
      commonMisconception:
        'Stopping at 17 finds how many voted for the other three choices. The question asks for the students who are left over.',
    },
  },
  {
    id: 'g2-md10-04',
    standardCode: 'NC.2.MD.10',
    domainId: 'MD',
    // COMPARE, asked as "how many fewer" — the generator only asks "how many
    // more".
    prompt: 'How many fewer rainy days than cloudy days were there?',
    promptDetails:
      'Bar graph titled "Our Weather in May". The scale counts by ones. Sunny: the bar reaches 8. Rainy: the bar reaches 2. Windy: the bar reaches 4. Cloudy: the bar reaches 7.',
    options: labelOptions([
      // 7 + 2 = 9: put the two bars together.
      { text: '9 days', isCorrect: false, misconception: 'added-instead-of-subtracted' },
      // 2: read the rainy bar and stopped.
      { text: '2 days', isCorrect: false, misconception: 'forgot-the-final-step' },
      { text: '5 days', isCorrect: true },
      // 8 − 2 = 6: compared rainy with the sunny bar, not the cloudy one.
      { text: '6 days', isCorrect: false, misconception: 'used-the-wrong-given-quantity' },
    ]),
    calculatorAllowed: false,
    isStretch: false,
    difficulty: 'advanced',
    explanation: {
      stepByStep: [
        'Step 1: Read the rainy bar: 2 days.',
        'Step 2: Read the cloudy bar: 7 days.',
        'Step 3: "How many fewer" means find the difference: 7 − 2 = 5.',
        'Step 4: The difference is 5 days, so there were 5 fewer rainy days.',
      ],
      conceptSummary:
        '"How many fewer" is a compare question, just like "how many more": find both bars, then subtract the smaller from the larger.',
      commonMisconception:
        'The sunny bar is the tallest, but the question compares rainy days with CLOUDY days. Using the sunny bar gives 8 − 2 = 6.',
    },
  },
];
