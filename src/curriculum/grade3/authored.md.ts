import type { Question } from '../../engine/questionModel';
import { labelOptions } from '../../engine/questionModel';

/**
 * The authored Grade 3 Measurement & Data bank.
 *
 * MD and Geometry share ONE blueprint band at Grade 3 — 23–27%, weighted
 * together — so neither domain may cite a weight of its own, and between them
 * they carry a quarter of the EOG. Six of the seven standards in that band are
 * here.
 *
 * Scope is taken from the sourced NCDPI wording in `./standards.ts`, which
 * differs from Common Core's Grade 3 in the single most consequential place in
 * this whole plan:
 *
 *   NC.3.MD.1 — tell and write time TO THE NEAREST MINUTE; add and subtract
 *               time intervals WITHIN THE SAME HOUR.
 *   NC.3.MD.2 — CUSTOMARY measurement. Lengths to the quarter-inch and
 *               half-inch, and feet and yards to the whole unit; capacity and
 *               weight in cups, pints, quarts, gallons, ounces and pounds;
 *               one-step word problems IN THE SAME CUSTOMARY UNITS.
 *   NC.3.MD.3 — scaled picture and bar graphs: ask a question yielding up to
 *               four categories, represent and interpret the data, and solve
 *               "how many more" and "how many less" problems from it.
 *   NC.3.MD.5 — area by TILING without gaps or overlaps and COUNTING unit
 *               squares.
 *   NC.3.MD.7 — relate area to multiplication AND addition, including
 *               partitioning a rectangle into two smaller rectangles whose
 *               areas add to the whole.
 *   NC.3.MD.8 — perimeters of polygons, BOTH from the side lengths and
 *               backwards to an unknown side.
 *
 * THE ONE THING TO KNOW ABOUT THIS FILE: NC.3.MD.2 IS CUSTOMARY.
 *
 * The task brief called it "mass or volume word problems". That is Common Core
 * 3.MD.A.2's vocabulary — grams, kilograms, liters — and NC does not have it at
 * Grade 3 in any domain. NC's metric work is Grade 4's NC.4.MD.1, and it
 * already ships as ../grade4/templates/md2-metric-convert.ts. Two words of
 * recalled vocabulary would have redirected an entire standard inside a 23–27%
 * band to another curriculum and another grade, and every test in the suite
 * would have stayed green, because a metric unit is perfectly valid TypeScript
 * under an NC code. ./authored.md.test.ts reads every string in this file and
 * 400 seeds of every MD generator looking for one.
 *
 * Three more boundaries, each a grade away:
 *
 *  - TIME INTERVALS STAY INSIDE ONE HOUR. Crossing the hour is NC.4.MD.8,
 *    which has its own shipped Grade 4 items and its own misconception tags.
 *    Every clock time printed by an MD.1 item here names the same hour, and the
 *    sibling test checks it by reading the times back out.
 *
 *  - TILING AND MULTIPLYING ARE DIFFERENT SKILLS. NC.3.MD.5 is counting unit
 *    squares; NC.3.MD.7 is multiplying side lengths. "6 × 4 = 24 square units"
 *    satisfies both as a string and neither as a skill, so no MD.5 item here
 *    hands a child two side lengths as numbers.
 *
 *  - NO ROUNDING ANYWHERE. CCSS 3.NBT.A.1 rounds to the nearest ten or
 *    hundred; NC has rounding at no grade in this plan.
 *
 * Age note: these are read by an eight-year-old. Every figure is written out in
 * `promptDetails` as words a screen reader can read, and every figure carries
 * enough to answer the question without seeing a picture.
 */
export const GRADE_3_MD_AUTHORED: Question[] = [
  // ==========================================
  // Standard: NC.3.MD.1 — Time to the Nearest Minute & Time Intervals
  // ==========================================
  {
    id: 'g3-md1-01',
    standardCode: 'NC.3.MD.1',
    domainId: 'MD',
    // Ruling 14-4's second half. "Tell and write time to the nearest minute"
    // is the FIRST of this standard's three keyConcepts, and a bank of nothing
    // but elapsed-time problems would mark it covered without ever asking a
    // child to read a clock. The generator does intervals; this does the
    // reading, and the two distractors below are the two ways a clock face is
    // misread before any arithmetic starts.
    prompt: 'What time does the clock show?',
    promptDetails:
      'A clock with two hands. The short hour hand is a little way past the 2. The long minute hand is pointing at the third small mark after the 8. Each small mark on this clock is one minute, and four small marks sit between one number and the next, splitting that gap into five minutes.',
    options: labelOptions([
      // The minute hand at the 8 is 8 fives, which is 40 minutes; three small
      // marks more is 43. The hour hand is past the 2, so the hour is 2.
      { text: '2:43', isCorrect: true },
      // Read the 8 the minute hand points at as 8 minutes.
      {
        text: '2:08',
        isCorrect: false,
        misconception: 'read-the-minute-hand-as-the-number-it-points-to',
      },
      // Counted by fives to the 8 and stopped there, ignoring the three small
      // marks past it - which is exactly what "to the nearest minute" forbids.
      {
        text: '2:40',
        isCorrect: false,
        misconception: 'read-the-clock-to-the-nearest-five-minutes',
      },
      // Took the hand near the 8 for the hour hand and the hand near the 2 for
      // the minute hand: 8 o'clock, 2 fives past.
      {
        text: '8:10',
        isCorrect: false,
        misconception: 'swapped-the-hour-and-minute-hands',
      },
    ]),
    calculatorAllowed: false,
    isStretch: false,
    difficulty: 'mastery',
    explanation: {
      stepByStep: [
        'Step 1: The SHORT hand tells the hour. It is past the 2 and has not reached the 3, so the hour is 2.',
        'Step 2: The LONG hand tells the minutes. Count by fives to the number it has passed: 5, 10, 15, 20, 25, 30, 35, 40 at the 8.',
        'Step 3: It is three small marks further on, and each small mark is one minute: 40 + 3 = 43 minutes.',
        'Step 4: The clock shows 2:43.',
      ],
      conceptSummary:
        'The two hands answer two different questions. The short hand says which hour it is, and the long hand says how many minutes past that hour - counted by fives to the nearest number, then one at a time from there.',
      commonMisconception:
        'Answering 2:08 reads the 8 that the minute hand points at as 8 minutes. The numbers around a clock count hours for the short hand and FIVES of minutes for the long one.',
    },
  },
  {
    id: 'g3-md1-02',
    standardCode: 'NC.3.MD.1',
    domainId: 'MD',
    // The generator asks for the LENGTH of an interval given both times. This
    // asks for the END TIME given a start and a length, which is the direction
    // the generator never runs and the one where the duration itself gets
    // mistaken for the answer. Start 3:30 plus 25 minutes lands at 3:55, and
    // every option below is inside that same hour (ruling 14-4).
    prompt: 'Soccer practice starts at 3:30 and lasts 25 minutes. What time does soccer practice end?',
    options: labelOptions([
      // Wrote the 25 minutes as the minutes of the ending time, ignoring the
      // 30 minutes that had already gone by when practice started.
      { text: '3:25', isCorrect: false, misconception: 'used-the-duration-as-the-end-time' },
      // Took the 25 minutes away from 3:30 instead of adding them on.
      { text: '3:05', isCorrect: false, misconception: 'subtracted-instead-of-added' },
      // 30 + 25 = 55 minutes past 3.
      { text: '3:55', isCorrect: true },
      // Counted on by fives - 35, 40, 45, 50 - and stopped one five short of
      // the 25 minutes.
      { text: '3:50', isCorrect: false, misconception: 'skip-counted-one-group-short' },
    ]),
    calculatorAllowed: false,
    isStretch: false,
    difficulty: 'advanced',
    explanation: {
      stepByStep: [
        'Step 1: Practice starts 30 minutes past 3 o’clock, and it lasts 25 more minutes.',
        'Step 2: Add the minutes: 30 + 25 = 55.',
        'Step 3: 55 minutes is still less than a whole hour, so the hour stays at 3.',
        'Step 4: Soccer practice ends at 3:55.',
      ],
      conceptSummary:
        'Adding a length of time to a starting time means adding the minutes to the minutes already past the hour. As long as the total stays under 60, the hour does not change.',
      commonMisconception:
        'Answering 3:25 writes the 25 minutes of practice as the time on the clock. Practice did not start at the top of the hour, so the 30 minutes already gone by still count.',
    },
  },
  {
    id: 'g3-md1-03',
    standardCode: 'NC.3.MD.1',
    domainId: 'MD',
    // The standard's third keyConcept is "word problems set in real contexts",
    // and comparing two intervals is the hardest honest version of that which
    // stays inside one hour. Both activities sit between 1:10 and 1:55.
    prompt:
      'Reading time ran from 1:10 to 1:55. Writing time ran from 1:20 to 1:50. How many more minutes long was reading time than writing time?',
    options: labelOptions([
      // Reported writing time's length and stopped before comparing.
      { text: '30 minutes', isCorrect: false, misconception: 'forgot-the-final-step' },
      // Reading lasted 45 minutes, writing lasted 30, and 45 - 30 = 15.
      { text: '15 minutes', isCorrect: true },
      // Compared the two START times, 1:20 against 1:10, instead of the two
      // lengths.
      {
        text: '10 minutes',
        isCorrect: false,
        misconception: 'compared-the-start-times-not-the-lengths',
      },
      // Added the two lengths, 45 + 30, instead of finding the difference.
      { text: '75 minutes', isCorrect: false, misconception: 'added-instead-of-subtracted' },
    ]),
    calculatorAllowed: false,
    isStretch: true,
    difficulty: 'stretch',
    explanation: {
      stepByStep: [
        'Step 1: Find how long reading time was. From 1:10 to 1:55 is 55 - 10 = 45 minutes, all inside the same hour.',
        'Step 2: Find how long writing time was. From 1:20 to 1:50 is 50 - 20 = 30 minutes.',
        'Step 3: "How many more" means compare the two lengths: 45 - 30.',
        'Step 4: Reading time was 15 minutes longer.',
      ],
      conceptSummary:
        'Comparing two activities means comparing how LONG each one lasted, not when each one began. Work out both lengths first, then compare those two numbers.',
      commonMisconception:
        'Answering 10 minutes compares the two starting times. Writing time began 10 minutes later than reading time, but it also ended earlier, and neither fact on its own says which lasted longer.',
    },
  },

  // ==========================================
  // Standard: NC.3.MD.2 — Customary Measurement: Length, Weight & Capacity
  // ==========================================
  {
    id: 'g3-md2-01',
    standardCode: 'NC.3.MD.2',
    domainId: 'MD',
    // Ruling 14-2. The standard's FIRST keyConcept is measuring lengths "in
    // customary units to the quarter-inch and half-inch", and a bank of cups
    // and pounds would clear the floor with that third of the standard
    // unwritten. The ruler is described in full so the item can be answered
    // without seeing it.
    prompt: 'How long is the ribbon?',
    promptDetails:
      'A ribbon lies along a ruler marked in inches. The left end of the ribbon is at 0. Between each inch mark and the next there are three small marks, which split every inch into 4 equal parts. The right end of the ribbon is at the third small mark after the 4.',
    options: labelOptions([
      // Named one part - one fourth - without counting that there are three of
      // them past the 4.
      {
        text: '4 1/4 inches',
        isCorrect: false,
        misconception: 'named-the-unit-fraction-not-the-count',
      },
      // Started counting the inches at the 1 mark instead of at 0, so every
      // whole inch came out one short.
      {
        text: '3 3/4 inches',
        isCorrect: false,
        misconception: 'started-the-count-at-the-first-tick-not-at-zero',
      },
      // Counted each of the 3 small marks as a whole inch and added them to
      // the 4: 4 + 3 = 7. NOT tagged added-without-converting - that tag's
      // family is 'unit-conversion', and converting between customary units is
      // NC.4.MD.1, a grade on. The family label is what a parent reads.
      {
        text: '7 inches',
        isCorrect: false,
        misconception: 'counted-each-ruler-mark-as-a-whole-unit',
      },
      // Three of the four equal parts past 4 inches is 4 and 3/4 inches.
      { text: '4 3/4 inches', isCorrect: true },
    ]),
    calculatorAllowed: false,
    isStretch: false,
    difficulty: 'mastery',
    explanation: {
      stepByStep: [
        'Step 1: The ribbon starts at 0, so the mark its other end reaches is its length.',
        'Step 2: The end is past the 4 inch mark, so the ribbon is more than 4 inches long.',
        'Step 3: Each inch is split into 4 equal parts, so one small step is 1/4 inch. The end is 3 small steps past the 4.',
        'Step 4: 3 steps of 1/4 inch is 3/4 inch, so the ribbon is 4 3/4 inches long.',
      ],
      conceptSummary:
        'Measuring to the quarter-inch means counting the whole inches first and then counting how many of the four equal parts of the next inch are used. The small marks are worth 1/4 inch each because four of them make one whole inch.',
      commonMisconception:
        'Answering 7 inches adds the 4 whole inches to the 3 small marks. A small mark is only a quarter of an inch, so three of them are nowhere near three inches.',
    },
  },
  {
    id: 'g3-md2-02',
    standardCode: 'NC.3.MD.2',
    domainId: 'MD',
    // "ESTIMATE and measure lengths in customary units... and feet and yards to
    // the whole unit" is the standard's own wording, so estimation is in scope
    // and needs an item where choosing the unit IS the question. This is the
    // one item in the standard allowed to print more than one customary unit,
    // and ./authored.md.test.ts names it as the exception.
    prompt: 'Which is the best estimate for the height of a classroom door?',
    options: labelOptions([
      // The right kind of unit, but a number ten times too big - 70 feet is
      // taller than most buildings.
      { text: 'About 70 feet', isCorrect: false, misconception: 'estimated-ten-times-too-large' },
      // A door is a little taller than a grown-up, so about 7 feet.
      { text: 'About 7 feet', isCorrect: true },
      // Inches measure length, but 7 inches is shorter than a pencil.
      { text: 'About 7 inches', isCorrect: false, misconception: 'chose-a-unit-of-the-wrong-size' },
      // Pounds measure weight, not height.
      {
        text: 'About 7 pounds',
        isCorrect: false,
        misconception: 'chose-a-unit-for-the-wrong-attribute',
      },
    ]),
    calculatorAllowed: false,
    isStretch: false,
    difficulty: 'mastery',
    explanation: {
      stepByStep: [
        'Step 1: Height is a LENGTH, so the unit has to be one that measures length: inches, feet or yards.',
        'Step 2: That rules out pounds straight away, because pounds measure how heavy something is.',
        'Step 3: Picture a grown-up standing in the doorway. A door is a little taller than they are, and a grown-up is about 6 feet tall.',
        'Step 4: About 7 feet is the sensible estimate.',
      ],
      conceptSummary:
        'A good estimate needs two right choices: a unit that measures the right thing, and a unit the right size for the object. Comparing the object with something familiar is how the size gets checked.',
      commonMisconception:
        'Answering About 7 inches picks a length unit but far too small a one. Seven inches is about the length of a pencil, and a door is taller than a person.',
    },
  },
  {
    id: 'g3-md2-03',
    standardCode: 'NC.3.MD.2',
    domainId: 'MD',
    // Weight, in pounds - the standard's second keyConcept names ounces and
    // pounds, and neither appears in the generator, which does capacity. One
    // step, one unit throughout (the third keyConcept).
    prompt:
      'Each bag of apples weighs 3 pounds. Mr. Chen buys 7 bags. How many pounds of apples does he buy?',
    options: labelOptions([
      // Added the two numbers instead of multiplying them.
      { text: '10 pounds', isCorrect: false, misconception: 'added-instead-of-multiplied' },
      // Skip counted 3, 6, 9, 12, 15, 18 and stopped one bag short.
      { text: '18 pounds', isCorrect: false, misconception: 'skip-counted-one-group-short' },
      // 7 groups of 3 pounds: 7 x 3 = 21.
      { text: '21 pounds', isCorrect: true },
      // Reported the weight of one bag without going on to all seven.
      { text: '3 pounds', isCorrect: false, misconception: 'counted-only-one-group' },
    ]),
    calculatorAllowed: false,
    isStretch: false,
    difficulty: 'advanced',
    explanation: {
      stepByStep: [
        'Step 1: There are 7 equal bags, and each one weighs the same 3 pounds, so this is 7 equal groups.',
        'Step 2: Equal groups means multiply: 7 x 3.',
        'Step 3: 7 x 3 = 21.',
        'Step 4: Both amounts were already in pounds, so the answer is 21 pounds.',
      ],
      conceptSummary:
        'A measurement word problem is solved like any other word problem, with the unit carried along. When every group weighs the same, multiply the number of groups by the weight of one.',
      commonMisconception:
        'Answering 3 pounds gives the weight of a single bag. The question asks about all seven bags together.',
    },
  },
  {
    id: 'g3-md2-04',
    standardCode: 'NC.3.MD.2',
    domainId: 'MD',
    // The standard's third keyConcept lists FOUR operations - "add, subtract,
    // multiply, OR divide" - so division needs an item. The generator
    // subtracts and g3-md2-03 multiplies.
    prompt:
      'A cooler holds 24 quarts of water. Each bottle holds 3 quarts. How many bottles can be filled from the cooler?',
    options: labelOptions([
      // Multiplied the two numbers instead of dividing.
      { text: '72 bottles', isCorrect: false, misconception: 'multiplied-instead-of-divided' },
      // Took 3 away from 24 instead of finding how many 3s fit inside it.
      { text: '21 bottles', isCorrect: false, misconception: 'subtracted-instead-of-divided' },
      // Answered with the size of one bottle, which is the number the question
      // divides BY and not the number it asks for.
      { text: '3 bottles', isCorrect: false, misconception: 'used-the-wrong-given-quantity' },
      // 24 quarts shared into groups of 3: 24 / 3 = 8.
      { text: '8 bottles', isCorrect: true },
    ]),
    calculatorAllowed: false,
    isStretch: false,
    difficulty: 'advanced',
    explanation: {
      stepByStep: [
        'Step 1: The 24 quarts are being shared out into equal 3 quart bottles, so this is division.',
        'Step 2: Ask how many 3s fit inside 24.',
        'Step 3: 3 x 8 = 24, so 24 / 3 = 8.',
        'Step 4: 8 bottles can be filled.',
      ],
      conceptSummary:
        'When a total measurement is split into equal-sized amounts, dividing says how many of those amounts there are. Both measurements are in quarts already, so nothing needs changing first.',
      commonMisconception:
        'Answering 72 bottles multiplies instead of dividing. Filling bottles takes water OUT of the cooler, so the answer has to be smaller than 24, not much larger.',
    },
  },
  {
    id: 'g3-md2-05',
    standardCode: 'NC.3.MD.2',
    domainId: 'MD',
    // Ruling 14-2's other half: "feet and YARDS to the whole unit". Yards
    // appear nowhere else in this bank. One unit throughout - this is a
    // comparison in yards, not a conversion, because converting between
    // customary units is NC.4.MD.1.
    prompt:
      'Coach Ellis marks a running lane 68 yards long. The second lane is 25 yards longer than the first. How many yards long is the second lane?',
    options: labelOptions([
      // 68 + 25 = 93.
      { text: '93 yards', isCorrect: true },
      // Added the ones as 8 + 5 = 13, wrote the 3, and never carried the ten.
      { text: '83 yards', isCorrect: false, misconception: 'added-without-carrying' },
      // Took 25 away from 68 instead of adding it on.
      { text: '43 yards', isCorrect: false, misconception: 'subtracted-instead-of-added' },
      // Reported the length that was given rather than the one asked for.
      {
        text: '68 yards',
        isCorrect: false,
        misconception: 'reported-the-measurement-not-the-total',
      },
    ]),
    calculatorAllowed: false,
    isStretch: false,
    difficulty: 'advanced',
    explanation: {
      stepByStep: [
        'Step 1: "Longer than" means the second lane is the first lane plus more, so add: 68 + 25.',
        'Step 2: Add the ones: 8 + 5 = 13, which is 1 ten and 3 ones. Write the 3 and carry the ten.',
        'Step 3: Add the tens: 6 + 2 = 8, plus the carried ten makes 9 tens.',
        'Step 4: The second lane is 93 yards long.',
      ],
      conceptSummary:
        'Both lanes are measured in yards, so they can be added directly. Comparing lengths only works when the two lengths are measured in the same unit.',
      commonMisconception:
        'Answering 83 yards adds the ones correctly but leaves the carried ten behind. 8 + 5 is 13, and that extra ten belongs in the tens column.',
    },
  },

  // ==========================================
  // Standard: NC.3.MD.3 — Scaled Picture & Bar Graphs
  // ==========================================
  {
    id: 'g3-md3-01',
    standardCode: 'NC.3.MD.3',
    domainId: 'MD',
    // A SCALED bar graph, which is the whole difficulty of this standard: the
    // gridlines do not step by one. The scale is stated in the figure so the
    // item can be answered without seeing the picture.
    prompt: 'How many students voted for apples?',
    promptDetails:
      'Bar graph titled "Our Favorite Fruit". The line up the side is labeled 0, 4, 8, 12, 16, 20, so each gridline stands for 4 votes. The apple bar reaches the 3rd gridline above zero. The banana bar reaches the 5th gridline. The grape bar reaches the 2nd gridline.',
    options: labelOptions([
      // Reported how many gridlines the bar reached instead of what they stand
      // for.
      { text: '3 votes', isCorrect: false, misconception: 'read-the-scale-by-counting-ticks' },
      // 3 gridlines, each worth 4 votes: 3 x 4 = 12.
      { text: '12 votes', isCorrect: true },
      // Counted the zero line itself as the first gridline, landing one
      // gridline too high: 4 gridlines of 4 is 16.
      { text: '16 votes', isCorrect: false, misconception: 'off-by-one-gridline' },
      // Read the tallest bar - bananas - instead of the one the question asks
      // about.
      { text: '20 votes', isCorrect: false, misconception: 'used-the-wrong-given-quantity' },
    ]),
    calculatorAllowed: false,
    isStretch: false,
    difficulty: 'mastery',
    explanation: {
      stepByStep: [
        'Step 1: Read the scale first. The labels go 0, 4, 8, 12, 16, 20, so one gridline is worth 4 votes, not 1.',
        'Step 2: Find the apple bar. It reaches the 3rd gridline above zero.',
        'Step 3: 3 gridlines, each worth 4 votes: 3 x 4 = 12.',
        'Step 4: 12 votes were cast for apples.',
      ],
      conceptSummary:
        'On a scaled graph the height of a bar is not the answer - the scale turns that height into a number. Always read the labels up the side before reading any bar.',
      commonMisconception:
        'Answering 3 votes counts the gridlines instead of using them. Each gridline on this graph stands for 4 votes, so 3 gridlines is 12.',
    },
  },
  {
    id: 'g3-md3-02',
    standardCode: 'NC.3.MD.3',
    domainId: 'MD',
    // The standard's third keyConcept, word for word: "solve one and two-step
    // 'how many more' and 'how many less' problems using information from these
    // graphs."
    prompt: 'How many more students chose swimming than basketball?',
    promptDetails:
      'Bar graph titled "Our Favorite Sport". The line up the side is labeled 0, 5, 10, 15, 20, 25, 30, so each gridline stands for 5 students. The soccer bar reaches 25. The basketball bar reaches 15. The swimming bar reaches 30. The tennis bar reaches 10.',
    options: labelOptions([
      // Subtracted the gridline counts, 6 - 3, instead of the values they
      // stand for.
      { text: '3 students', isCorrect: false, misconception: 'read-the-scale-by-counting-ticks' },
      // Read swimming's total off the graph and stopped before comparing it
      // with basketball.
      { text: '30 students', isCorrect: false, misconception: 'forgot-the-final-step' },
      // 30 - 15 = 15.
      { text: '15 students', isCorrect: true },
      // Put the two bars together instead of finding the difference.
      { text: '45 students', isCorrect: false, misconception: 'added-instead-of-subtracted' },
    ]),
    calculatorAllowed: false,
    isStretch: false,
    difficulty: 'advanced',
    explanation: {
      stepByStep: [
        'Step 1: Read swimming off the graph: its bar reaches 30 students.',
        'Step 2: Read basketball off the graph: its bar reaches 15 students.',
        'Step 3: "How many more" means find the difference: 30 - 15.',
        'Step 4: 15 students more chose swimming.',
      ],
      conceptSummary:
        'A "how many more" question takes two steps: read both values off the graph, then compare them. The comparing is done with the real numbers the scale gives, never with the heights of the bars.',
      commonMisconception:
        'Answering 3 students subtracts the gridlines rather than the numbers of students. Three gridlines apart on this graph means 15 students apart.',
    },
  },
  {
    id: 'g3-md3-03',
    standardCode: 'NC.3.MD.3',
    domainId: 'MD',
    // The standard names "scaled PICTURE graph" as well as a scaled bar graph,
    // and a picture graph fails differently: the key, not a side axis, carries
    // the scale.
    prompt: 'How many books did Ana and Cal read altogether?',
    promptDetails:
      'Picture graph titled "Books Read This Month". The key says: each star stands for 6 books. Ana: 4 stars. Ben: 2 stars. Cal: 3 stars.',
    options: labelOptions([
      // Counted the stars, 4 + 3, without using the key at all.
      {
        text: '7 books',
        isCorrect: false,
        misconception: 'counted-the-symbols-instead-of-using-the-key',
      },
      // Added every row on the graph instead of only the two the question asks
      // about: 24 + 12 + 18.
      { text: '54 books', isCorrect: false, misconception: 'summed-all-data-points' },
      // Worked out Ana's 24 books and stopped before adding Cal's.
      { text: '24 books', isCorrect: false, misconception: 'forgot-the-final-step' },
      // Ana 4 x 6 = 24, Cal 3 x 6 = 18, and 24 + 18 = 42.
      { text: '42 books', isCorrect: true },
    ]),
    calculatorAllowed: false,
    isStretch: true,
    difficulty: 'stretch',
    explanation: {
      stepByStep: [
        'Step 1: Read the key. On this graph one star is not one book - it stands for 6 books.',
        'Step 2: Ana has 4 stars, so Ana read 4 x 6 = 24 books.',
        'Step 3: Cal has 3 stars, so Cal read 3 x 6 = 18 books.',
        'Step 4: Together they read 24 + 18 = 42 books.',
      ],
      conceptSummary:
        'On a picture graph the key does the same job the side scale does on a bar graph: it says what one picture is worth. Every count of pictures has to go through the key before it means anything.',
      commonMisconception:
        'Answering 7 books counts the stars themselves. Seven stars is 7 x 6 = 42 books, because the key gives each star a value of 6.',
    },
  },
  {
    id: 'g3-md3-04',
    standardCode: 'NC.3.MD.3',
    domainId: 'MD',
    // The standard's FIRST keyConcept: "collect data by asking a question that
    // yields data in UP TO FOUR CATEGORIES." Three graph-reading items would
    // have marked the standard covered with this third of it unwritten.
    prompt:
      'Ms. Patel’s class wants to make a bar graph with four bars, one for each answer people give. Which question should they ask?',
    options: labelOptions([
      {
        text: 'Which of these four snacks is your favorite: pretzels, apples, cheese, or popcorn?',
        isCorrect: true,
      },
      // A question with one answer for the whole class, so there is no data
      // set to graph at all.
      {
        text: 'How many students are in our class?',
        isCorrect: false,
        misconception: 'asked-for-a-single-total-not-data',
      },
      // Every answer is a different number, which is not a set of categories a
      // four-bar graph can hold.
      {
        text: 'How tall are you in inches?',
        isCorrect: false,
        misconception: 'confused-categorical-with-numerical',
      },
      // Categories, but no list to choose from, so there could be thirty
      // different answers and only four bars.
      {
        text: 'What is your favorite snack of any kind?',
        isCorrect: false,
        misconception: 'left-the-categories-open',
      },
    ]),
    calculatorAllowed: false,
    isStretch: false,
    difficulty: 'advanced',
    explanation: {
      stepByStep: [
        'Step 1: A bar graph needs one answer from each person, so the question has to be asked of everybody.',
        'Step 2: It needs categories, not numbers, because each bar is labeled with an answer.',
        'Step 3: It needs no more than four different answers, because the graph has four bars.',
        'Step 4: Only "Which of these four snacks is your favorite: pretzels, apples, cheese, or popcorn?" gives one answer per person from exactly four choices.',
      ],
      conceptSummary:
        'The graph is decided before any data is collected. A good survey question gives every person exactly one answer, out of a small set of answers fixed in advance.',
      commonMisconception:
        'Asking "How many students are in our class?" has a single answer for the whole class. One number is not a data set, and there is nothing to put in four bars.',
    },
  },

  // ==========================================
  // Standard: NC.3.MD.5 — Area by Tiling with Unit Squares
  // ==========================================
  {
    id: 'g3-md5-01',
    standardCode: 'NC.3.MD.5',
    domainId: 'MD',
    // The standard's own first keyConcept is "tiling a rectangle WITHOUT GAPS
    // OR OVERLAPS", and this is the item that asks what that clause is for.
    // Nothing in it is a count, so it cannot be the generator's question, and
    // nothing in it is a multiplication, so it cannot be NC.3.MD.7's.
    prompt:
      'Devon wants to find the area of a rectangle by covering it with tiles and counting them. Which covering will give the right area?',
    options: labelOptions([
      // Gaps mean parts of the rectangle are never covered, so the count is
      // too small.
      {
        text: 'Tiles that are all the same size, laid with small spaces left between them.',
        isCorrect: false,
        misconception: 'left-gaps-between-the-tiles',
      },
      {
        text: 'Tiles that are all the same size, laid side by side with no spaces and no tile on top of another.',
        isCorrect: true,
      },
      // Overlaps mean some of the rectangle is counted twice.
      {
        text: 'Tiles that are all the same size, laid so that each one covers a corner of the tile before it.',
        isCorrect: false,
        misconception: 'overlapped-the-tiles',
      },
      // Mixed sizes mean the count is not a count of anything.
      {
        text: 'Big tiles and small tiles, laid side by side so that they cover the rectangle exactly.',
        isCorrect: false,
        misconception: 'used-tiles-of-different-sizes',
      },
    ]),
    calculatorAllowed: false,
    isStretch: false,
    difficulty: 'mastery',
    explanation: {
      stepByStep: [
        'Step 1: Area counts how many unit squares cover a shape, so every tile counted has to be the same size as every other one.',
        'Step 2: If there are spaces between the tiles, part of the rectangle is never covered and the count comes out too small.',
        'Step 3: If tiles sit on top of one another, part of the rectangle is covered twice and the count comes out too big.',
        'Step 4: The right covering is this one: Tiles that are all the same size, laid side by side with no spaces and no tile on top of another.',
      ],
      conceptSummary:
        'Counting tiles only measures area when the tiles are identical and cover the shape exactly once - no gaps, no overlaps. That is why the standard says it in those words.',
      commonMisconception:
        'A covering made of big tiles and small tiles can still hide the rectangle completely, but counting those tiles measures nothing, because the tiles are not all worth the same amount of space.',
    },
  },
  {
    id: 'g3-md5-02',
    standardCode: 'NC.3.MD.5',
    domainId: 'MD',
    // Two tiled rectangles compared BY COUNT. The trap is deliberate: rectangle
    // A stretches further across than B does, and B is the one with more tiles.
    // A child who compares the longest sides gets the wrong answer, which is
    // exactly the reasoning that has to be given up before NC.3.MD.7 makes
    // sense.
    prompt:
      'Rectangle A and Rectangle B are covered with the same size unit squares. How many more unit squares cover Rectangle B than Rectangle A?',
    promptDetails:
      'Rectangle A: 2 rows of tiles, with 9 tiles in each row.\nRectangle B: 4 rows of tiles, with 5 tiles in each row.',
    options: labelOptions([
      // Compared the longest sides, 9 against 5, instead of the tile counts.
      {
        text: '4 unit squares',
        isCorrect: false,
        misconception: 'compared-the-side-lengths-not-the-tile-counts',
      },
      // Counted B's tiles and stopped before comparing.
      { text: '20 unit squares', isCorrect: false, misconception: 'forgot-the-final-step' },
      // A is covered by 18 tiles, B by 20, and 20 - 18 = 2.
      { text: '2 unit squares', isCorrect: true },
      // Put the two counts together instead of finding the difference.
      { text: '38 unit squares', isCorrect: false, misconception: 'added-instead-of-subtracted' },
    ]),
    calculatorAllowed: false,
    isStretch: false,
    difficulty: 'advanced',
    explanation: {
      stepByStep: [
        'Step 1: Count Rectangle A. Two rows of 9 tiles is 9 + 9 = 18 unit squares.',
        'Step 2: Count Rectangle B. Four rows of 5 tiles is 5 + 5 + 5 + 5 = 20 unit squares.',
        'Step 3: "How many more" means compare the two counts: 20 - 18.',
        'Step 4: Rectangle B is covered by 2 unit squares more than Rectangle A.',
      ],
      conceptSummary:
        'Area is how many unit squares cover a shape, and nothing else about the shape decides it. A long thin rectangle can be covered by fewer squares than a shorter, fatter one.',
      commonMisconception:
        'Answering 4 unit squares compares how far each rectangle stretches, 9 against 5. Rectangle A reaches further across but has only two rows, so it ends up with fewer tiles.',
    },
  },
  {
    id: 'g3-md5-03',
    standardCode: 'NC.3.MD.5',
    domainId: 'MD',
    // A figure that is NOT a full rectangle. No single multiplication reaches
    // 16, so counting the unit squares is the only route - which is what keeps
    // this item inside NC.3.MD.5 and out of NC.3.MD.7, and what keeps it from
    // being the tiling generator's question in other words: that generator
    // always draws a complete rectangle.
    prompt: 'The shape below is covered with unit squares laid with no gaps and no overlaps. How many unit squares cover the shape?',
    promptDetails:
      'Row 1: 5 tiles.\nRow 2: 5 tiles.\nRow 3: 3 tiles, lined up under the left end of the rows above.\nRow 4: 3 tiles, lined up under the left end of the rows above.',
    options: labelOptions([
      // Treated the shape as the full 4 by 5 rectangle it sits inside,
      // counting four corner squares that are not there.
      {
        text: '20 unit squares',
        isCorrect: false,
        misconception: 'counted-the-figure-as-a-full-rectangle',
      },
      // Counted the two long rows and left the two short ones out.
      { text: '10 unit squares', isCorrect: false, misconception: 'omitted-one-part-of-composite' },
      // Counted the rows instead of the tiles.
      { text: '4 unit squares', isCorrect: false, misconception: 'counted-the-rows-not-the-squares' },
      // 5 + 5 + 3 + 3 = 16.
      { text: '16 unit squares', isCorrect: true },
    ]),
    calculatorAllowed: false,
    isStretch: false,
    difficulty: 'advanced',
    explanation: {
      stepByStep: [
        'Step 1: This shape is not a rectangle, so there is no pair of side lengths to multiply. Count the tiles row by row.',
        'Step 2: The two long rows hold 5 tiles each: 5 + 5 = 10.',
        'Step 3: The two short rows hold 3 tiles each: 3 + 3 = 6.',
        'Step 4: 10 + 6 = 16, so 16 unit squares cover the shape.',
      ],
      conceptSummary:
        'Area is a count of unit squares for ANY shape made of them, not only for rectangles. When the shape is not a rectangle, the count is still the answer; it just has to be done a row at a time.',
      commonMisconception:
        'Answering 20 unit squares counts the whole rectangle this shape sits inside. The four squares at the bottom right are not part of the shape, so they are not part of its area.',
    },
  },

  // ==========================================
  // Standard: NC.3.MD.7 — Relate Area to Multiplication & Addition
  // ==========================================
  {
    id: 'g3-md7-01',
    standardCode: 'NC.3.MD.7',
    domainId: 'MD',
    // The first keyConcept runs backwards here: the area is known and one side
    // is known, so the other side is the unknown factor. That is the hardest
    // honest way to ask whether a child really believes area is the product of
    // the sides, and it is a direction the generator never runs.
    prompt:
      'Rosa tiled a rectangle with unit squares and counted 24 of them. Her rectangle is 4 unit squares wide. How many unit squares long is it?',
    options: labelOptions([
      // 4 x 6 = 24, so the missing side is 6.
      { text: '6 unit squares', isCorrect: true },
      // Took 4 away from 24 instead of asking how many 4s fit inside it.
      { text: '20 unit squares', isCorrect: false, misconception: 'subtracted-instead-of-divided' },
      // Multiplied the two numbers given instead of dividing.
      { text: '96 unit squares', isCorrect: false, misconception: 'multiplied-instead-of-divided' },
      // Answered with the side length the question had already given.
      {
        text: '4 unit squares',
        isCorrect: false,
        misconception: 'reported-the-factor-that-was-already-given',
      },
    ]),
    calculatorAllowed: false,
    isStretch: false,
    difficulty: 'mastery',
    explanation: {
      stepByStep: [
        'Step 1: Area is the number of squares in one row times the number of rows, so 4 times the missing length is 24.',
        'Step 2: Ask what 4 is multiplied by to make 24.',
        'Step 3: 4 x 6 = 24, so the missing length is 6.',
        'Step 4: The rectangle is 6 unit squares long.',
      ],
      conceptSummary:
        'Because area is the two side lengths multiplied together, knowing the area and one side is enough to find the other. It is the same multiplication fact read from the other end.',
      commonMisconception:
        'Answering 20 unit squares takes 4 away from 24. The 4 is not part of the 24 to be removed - it says how many squares sit in each row.',
    },
  },
  {
    id: 'g3-md7-02',
    standardCode: 'NC.3.MD.7',
    domainId: 'MD',
    // The standard's THIRD keyConcept, which the task brief never mentions:
    // "the area of a rectangle can be found by partitioning it into two smaller
    // rectangles, and the area of the large rectangle is the SUM of the two
    // smaller rectangles." This is the "and addition" half of the standard's
    // own title, and three length-times-width items would have buried it.
    prompt: 'What is the area of the whole large rectangle?',
    promptDetails:
      'A large rectangle is split into two smaller rectangles by one straight line. The left rectangle is 5 feet tall and 3 feet wide. The right rectangle is 5 feet tall and 4 feet wide. The two together fill the large rectangle exactly.',
    options: labelOptions([
      // Found the left rectangle's area and stopped.
      { text: '15 square feet', isCorrect: false, misconception: 'omitted-one-part-of-composite' },
      // 5 x 3 = 15 and 5 x 4 = 20, and 15 + 20 = 35.
      { text: '35 square feet', isCorrect: true },
      // Multiplied all four given side lengths together: 5 x 3 x 5 x 4.
      {
        text: '300 square feet',
        isCorrect: false,
        misconception: 'multiplied-every-side-length-together',
      },
      // Added the four side lengths as if finding a distance around.
      { text: '17 square feet', isCorrect: false, misconception: 'used-perimeter-formula' },
    ]),
    calculatorAllowed: false,
    isStretch: false,
    difficulty: 'advanced',
    explanation: {
      stepByStep: [
        'Step 1: Find the area of the left rectangle: 5 x 3 = 15 square feet.',
        'Step 2: Find the area of the right rectangle: 5 x 4 = 20 square feet.',
        'Step 3: The two pieces fill the large rectangle exactly and do not overlap, so their areas add: 15 + 20.',
        'Step 4: The large rectangle has an area of 35 square feet.',
      ],
      conceptSummary:
        'Cutting a rectangle into two pieces does not change how much space it covers, so the two smaller areas always add back up to the big one. That is why a hard multiplication can be broken into two easy ones.',
      commonMisconception:
        'Answering 300 square feet multiplies all four numbers together. Each small rectangle needs its OWN two sides multiplied, and then the two areas are added, not multiplied.',
    },
  },
  {
    id: 'g3-md7-03',
    standardCode: 'NC.3.MD.7',
    domainId: 'MD',
    // Two rectangles with EQUAL perimeters and different areas, so every wrong
    // answer below is a piece of true arithmetic pointed at the wrong question.
    // The second keyConcept's "in the context of solving problems" is what this
    // item is for: knowing the formula is not the same as knowing which
    // measurement answers the question.
    prompt:
      'Rectangle P is 7 inches long and 4 inches wide. Rectangle Q is 6 inches long and 5 inches wide. Which rectangle has the greater area?',
    options: labelOptions([
      // Both perimeters really are 22 inches - and equal perimeters say
      // nothing at all about area.
      {
        text: 'They have the same area, because both rectangles have a perimeter of 22 inches.',
        isCorrect: false,
        misconception: 'used-perimeter-formula',
      },
      // 7 + 4 and 6 + 5 really are both 11, which is half a perimeter and no
      // area at all.
      {
        text: 'They have the same area, because 7 + 4 and 6 + 5 are both 11.',
        isCorrect: false,
        misconception: 'added-only-the-two-given-sides',
      },
      {
        text: 'Rectangle Q, because 6 x 5 = 30 square inches is more than 7 x 4 = 28 square inches.',
        isCorrect: true,
      },
      // Rectangle P does have the longest single side, and it still covers
      // less space.
      {
        text: 'Rectangle P, because its longest side is longer than any side of Rectangle Q.',
        isCorrect: false,
        misconception: 'assumed-longer-side-means-greater-area',
      },
    ]),
    calculatorAllowed: false,
    isStretch: true,
    difficulty: 'stretch',
    explanation: {
      stepByStep: [
        'Step 1: Area is found by multiplying the two side lengths, so work out both.',
        'Step 2: Rectangle P: 7 x 4 = 28 square inches.',
        'Step 3: Rectangle Q: 6 x 5 = 30 square inches.',
        'Step 4: 30 is more than 28, so Rectangle Q, because 6 x 5 = 30 square inches is more than 7 x 4 = 28 square inches.',
      ],
      conceptSummary:
        'Two rectangles can go the same distance around and still cover different amounts of space. Only multiplying the side lengths answers a question about area.',
      commonMisconception:
        'Both rectangles really do have a perimeter of 22 inches, and that is exactly the trap: the distance around a shape does not decide how much space is inside it.',
    },
  },

  // ==========================================
  // Standard: NC.3.MD.8 — Perimeter of Polygons
  // ==========================================
  {
    id: 'g3-md8-01',
    standardCode: 'NC.3.MD.8',
    domainId: 'MD',
    // The standard says "perimeters of POLYGONS", not of rectangles. Both
    // generators draw rectangles, where a child can lean on the two-pairs rule;
    // on a pentagon there is nothing to lean on but adding every side.
    prompt: 'What is the perimeter of the pentagon?',
    promptDetails:
      'A pentagon with all five of its sides labeled. Going around the figure, the sides measure 6 inches, 4 inches, 7 inches, 5 inches, and 3 inches.',
    options: labelOptions([
      // Went around the figure but never added the last side: 6 + 4 + 7 + 5.
      { text: '22 inches', isCorrect: false, misconception: 'left-out-a-side-length' },
      // Answered with how many sides the figure has.
      { text: '5 inches', isCorrect: false, misconception: 'used-the-wrong-given-quantity' },
      // Reported the longest single side instead of the total distance around.
      {
        text: '7 inches',
        isCorrect: false,
        misconception: 'reported-the-measurement-not-the-total',
      },
      // 6 + 4 + 7 + 5 + 3 = 25.
      { text: '25 inches', isCorrect: true },
    ]),
    calculatorAllowed: false,
    isStretch: false,
    difficulty: 'mastery',
    explanation: {
      stepByStep: [
        'Step 1: Perimeter is the distance all the way around, so every side has to be added exactly once.',
        'Step 2: Add them in order: 6 + 4 = 10, then 10 + 7 = 17.',
        'Step 3: Keep going: 17 + 5 = 22, then 22 + 3 = 25.',
        'Step 4: The perimeter of the pentagon is 25 inches.',
      ],
      conceptSummary:
        'Perimeter works the same way for every polygon: add the length of each side once. A rectangle only looks different because its sides come in two equal pairs.',
      commonMisconception:
        'Answering 22 inches stops one side early. Going around a five-sided figure means adding five numbers, and it is easy to lose the last one.',
    },
  },
  {
    id: 'g3-md8-02',
    standardCode: 'NC.3.MD.8',
    domainId: 'MD',
    // Grade 3 is where area and perimeter first collide, and the brief asks
    // for that error to be NAMED rather than merely producing a wrong number.
    // Here both numbers are computed and the child has to say which is which.
    prompt:
      'A rectangle is 6 inches long and 4 inches wide. Ella says its perimeter and its area are the same, because both are worked out from the 6 and the 4. Is Ella right?',
    options: labelOptions([
      // Multiplied for both, so the perimeter came out as the area.
      {
        text: 'Yes. The perimeter and the area are both 24.',
        isCorrect: false,
        misconception: 'used-area-formula-for-perimeter',
      },
      { text: 'No. The perimeter is 20 inches and the area is 24 square inches.', isCorrect: true },
      // Added all four sides for both, so the area came out as the perimeter.
      {
        text: 'Yes. The perimeter and the area are both 20.',
        isCorrect: false,
        misconception: 'used-perimeter-formula',
      },
      // Added the two given numbers once each, which is half the perimeter.
      {
        text: 'No. The perimeter is 10 inches and the area is 24 square inches.',
        isCorrect: false,
        misconception: 'added-only-the-two-given-sides',
      },
    ]),
    calculatorAllowed: false,
    isStretch: false,
    difficulty: 'advanced',
    explanation: {
      stepByStep: [
        'Step 1: Perimeter is the distance around, so add all four sides: 6 + 4 + 6 + 4 = 20 inches.',
        'Step 2: Area is the space inside, so multiply the two side lengths: 6 x 4 = 24 square inches.',
        'Step 3: 20 and 24 are different numbers, and they are not even measured in the same kind of unit.',
        'Step 4: No. The perimeter is 20 inches and the area is 24 square inches.',
      ],
      conceptSummary:
        'Perimeter and area use the same two side lengths and answer different questions. Perimeter is a distance, measured in inches; area is a count of squares, measured in square inches.',
      commonMisconception:
        'Ella is right that both are worked out from the 6 and the 4, and wrong that this makes them the same. One adds the sides and one multiplies them.',
    },
  },
  {
    id: 'g3-md8-03',
    standardCode: 'NC.3.MD.8',
    domainId: 'MD',
    // Ruling 14-6, the backwards direction, on a figure that is not a
    // rectangle: the perimeter is given and a side is missing. The generator
    // does this for rectangles, where the answer needs halving at the end; on a
    // triangle there is nothing to halve, and the errors are different ones.
    prompt:
      'A triangle has a perimeter of 20 inches. Two of its sides are 8 inches and 5 inches long. How long is the third side?',
    options: labelOptions([
      // Added the two known sides and reported that total instead of taking it
      // away from the perimeter.
      { text: '13 inches', isCorrect: false, misconception: 'forgot-the-final-step' },
      // Took only one of the two known sides off the perimeter: 20 - 8.
      { text: '12 inches', isCorrect: false, misconception: 'left-out-a-side-length' },
      // 8 + 5 = 13, and 20 - 13 = 7.
      { text: '7 inches', isCorrect: true },
      // Added everything in the question: 20 + 8 + 5.
      { text: '33 inches', isCorrect: false, misconception: 'added-instead-of-subtracted' },
    ]),
    calculatorAllowed: false,
    isStretch: true,
    difficulty: 'stretch',
    explanation: {
      stepByStep: [
        'Step 1: The perimeter is the three sides added together, so the three sides make 20 inches in all.',
        'Step 2: Add the two sides that are known: 8 + 5 = 13 inches.',
        'Step 3: The rest of the 20 inches belongs to the third side: 20 - 13.',
        'Step 4: The third side is 7 inches long.',
      ],
      conceptSummary:
        'A perimeter is a total, so a missing side can be found by taking every known side away from it. Add all the known sides first, then subtract once.',
      commonMisconception:
        'Answering 13 inches stops after adding the two known sides. That total is how much of the perimeter is already used up, not the side that is left.',
    },
  },
];
