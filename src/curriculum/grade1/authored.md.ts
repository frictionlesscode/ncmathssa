import type { Question } from '../../engine/questionModel';
import { labelOptions } from '../../engine/questionModel';

/**
 * The authored Grade 1 Measurement & Data bank.
 *
 * Scope is read from the sourced text in `./standards.ts`, NOT from the Task
 * 24 brief. RULING 24-1 of
 * `.superpowers/sdd/2026-09-13-grades-1-4-content/task-22-26-rulings.md`
 * swaps two of the brief's codes: NC.1.MD.3 is TIME to the hour and
 * half-hour; NC.1.MD.5 is COINS. The brief's own Step 4 calls MD.5 "Time" and
 * MD.3 "money or coin recognition" — backward.
 *
 *   NC.1.MD.1  order three objects by length, and compare two objects
 *              indirectly through a third. RULING 24-2/24-3: this is fully
 *              authored (no generator) because the natural prompt is three
 *              clauses of held state, over the two-sentence readability cap.
 *              As ruling 24-9 does for NC.1.MD.2, the held facts live in
 *              `promptDetails`; `prompt` itself stays a short question.
 *   NC.1.MD.2  measure length with non-standard units. The generator
 *              (`./templates/md2-measure-with-units.ts`) always lays the
 *              units out correctly and asks for a count; this bank takes the
 *              standard's OTHER named error - judging whether gaps,
 *              overlaps, or stacking make a measurement wrong.
 *   NC.1.MD.3  tell time to the hour and half-hour, analog and digital alike.
 *              Fully authored: a generator here would only relabel a clock
 *              face, never draw a different NUMBER.
 *   NC.1.MD.5  identify quarters, dimes and nickels and relate their values
 *              to pennies (ruling 24-4: at least one item is explicitly
 *              value-in-pennies). OUT OF SCOPE, and never written here: $ or
 *              ¢ symbols, adding coin values together, or a money word
 *              problem - all of that is NC.2.MD.8, not this standard.
 *   NC.1.MD.4  organize, represent and interpret data in up to three
 *              categories. The generator
 *              (`./templates/md4-read-the-data.ts`) always uses three
 *              categories; this bank uses two-category graphs, a
 *              take-apart shape (the total is given and one category is
 *              missing), and "how many fewer" phrasing the generator never
 *              asks.
 *
 * Every prompt passes `assertGradeOneReadable` (under 90 characters, at most
 * one setup sentence and one question, no word over 10 letters) - ruling
 * "Apply assertGradeOneReadable to every MD and G prompt, authored and
 * generated."
 */
export const GRADE_1_MD_AUTHORED: Question[] = [
  // ==========================================
  // Standard: NC.1.MD.1 — Order & Compare Lengths Indirectly
  // ==========================================
  {
    id: 'g1-md1-01',
    standardCode: 'NC.1.MD.1',
    domainId: 'MD',
    prompt: 'Which one is the longest?',
    promptDetails: 'The pencil is longer than the crayon. The crayon is longer than the eraser.',
    options: labelOptions([
      { text: 'The pencil', isCorrect: true },
      // Compared only the crayon and the eraser, and picked the longer of
      // that one pair without checking the pencil too.
      { text: 'The crayon', isCorrect: false, misconception: 'compared-only-two-of-three-objects' },
      // Read "longer than" backward.
      { text: 'The eraser', isCorrect: false, misconception: 'reversed-a-length-comparison' },
      { text: 'There is no way to tell', isCorrect: false, misconception: 'denied-transitivity-of-length' },
    ]),
    calculatorAllowed: false,
    isStretch: false,
    difficulty: 'mastery',
    explanation: {
      stepByStep: [
        'Step 1: The pencil is longer than the crayon.',
        'Step 2: The crayon is longer than the eraser.',
        'Step 3: So the pencil is longer than the crayon, which is longer than the eraser.',
        'Step 4: The pencil is the longest.',
      ],
      conceptSummary:
        'When one object is longer than a second, and that second object is longer than a third, the first is longer than the third too — checking all three, not just one pair, finds the longest.',
      commonMisconception:
        'Comparing only the crayon and the eraser finds the crayon is longer than the eraser, but misses that the pencil is longer than both.',
    },
  },
  {
    id: 'g1-md1-02',
    standardCode: 'NC.1.MD.1',
    domainId: 'MD',
    prompt: 'Which one is the shortest?',
    promptDetails: 'The rope is longer than the ribbon. The ribbon is longer than the string.',
    options: labelOptions([
      { text: 'The rope', isCorrect: false, misconception: 'reversed-a-length-comparison' },
      // Compared only the rope and the ribbon, and picked the shorter of
      // that one pair without checking the string too.
      { text: 'The ribbon', isCorrect: false, misconception: 'compared-only-two-of-three-objects' },
      { text: 'The string', isCorrect: true },
      { text: 'There is no way to tell', isCorrect: false, misconception: 'denied-transitivity-of-length' },
    ]),
    calculatorAllowed: false,
    isStretch: false,
    difficulty: 'advanced',
    explanation: {
      stepByStep: [
        'Step 1: The rope is longer than the ribbon.',
        'Step 2: The ribbon is longer than the string.',
        'Step 3: So the rope is longer than the ribbon, which is longer than the string.',
        'Step 4: The string is the shortest.',
      ],
      conceptSummary:
        'The shortest of three objects is found the same way as the longest: use both comparisons together, not just one of them.',
      commonMisconception:
        'Comparing only the rope and the ribbon finds the ribbon is shorter than the rope, but misses that the string is shorter still.',
    },
  },
  {
    id: 'g1-md1-03',
    standardCode: 'NC.1.MD.1',
    domainId: 'MD',
    // "Compare the lengths of two objects indirectly by using a third
    // object": the bookshelf and the lamp are never compared directly.
    prompt: 'Which is taller, the bookshelf or the lamp?',
    promptDetails: 'The bookshelf is taller than the desk. The lamp is shorter than the desk.',
    options: labelOptions([
      // Picked the desk, the object used to compare, instead of one of the
      // two objects the question actually asked about.
      { text: 'The desk', isCorrect: false, misconception: 'compared-only-two-of-three-objects' },
      { text: 'The bookshelf', isCorrect: true },
      { text: 'The lamp', isCorrect: false, misconception: 'reversed-a-length-comparison' },
      { text: 'There is no way to tell', isCorrect: false, misconception: 'denied-transitivity-of-length' },
    ]),
    calculatorAllowed: false,
    isStretch: false,
    difficulty: 'mastery',
    explanation: {
      stepByStep: [
        'Step 1: The bookshelf is taller than the desk.',
        'Step 2: The lamp is shorter than the desk.',
        'Step 3: The desk is a third object used to compare the other two indirectly.',
        'Step 4: The bookshelf is taller than the lamp.',
      ],
      conceptSummary:
        'Two objects that are never measured against each other can still be compared indirectly, through a third object each one was compared to.',
      commonMisconception:
        'The desk is only the object used to compare with — the question asks about the bookshelf and the lamp, not the desk.',
    },
  },

  // ==========================================
  // Standard: NC.1.MD.2 — Measure Length with Non-Standard Units
  // ==========================================
  {
    id: 'g1-md2-01',
    standardCode: 'NC.1.MD.2',
    domainId: 'MD',
    prompt: 'Which way of measuring the ribbon with paper clips is correct?',
    options: labelOptions([
      { text: 'Leave a small gap between each paper clip', isCorrect: false, misconception: 'left-gaps-between-the-units-while-iterating' },
      { text: 'Lay the paper clips end to end, with no gaps or overlaps', isCorrect: true },
      { text: 'Let each paper clip overlap the one before it', isCorrect: false, misconception: 'overlapped-the-units-while-iterating' },
      { text: 'Stack the paper clips on top of each other', isCorrect: false, misconception: 'stacked-the-units-instead-of-laying-them-end-to-end' },
    ]),
    calculatorAllowed: false,
    isStretch: false,
    difficulty: 'mastery',
    explanation: {
      stepByStep: [
        'Step 1: Measuring by iteration means laying copies of a unit along the whole length.',
        'Step 2: A gap leaves part of the length uncovered, and an overlap covers part of it twice.',
        'Step 3: Stacking the paper clips does not follow the length at all.',
        'Step 4: Lay the paper clips end to end, with no gaps or overlaps.',
      ],
      conceptSummary:
        'Measuring by iteration means laying copies of one unit end to end along the whole length, with no gaps and no overlaps, so the count matches the length exactly.',
      commonMisconception:
        'A small gap between paper clips seems harmless, but it leaves part of the ribbon uncovered by any unit at all.',
    },
  },
  {
    id: 'g1-md2-02',
    standardCode: 'NC.1.MD.2',
    domainId: 'MD',
    prompt: 'Does leaving a gap between each eraser make Zoe\'s count too high or too low?',
    promptDetails: 'Zoe measures a ribbon with 5 erasers end to end, but leaves a small gap after each one.',
    options: labelOptions([
      { text: 'Too high', isCorrect: false, misconception: 'reversed-the-effect-of-gaps-on-the-count' },
      { text: 'The gaps make no difference', isCorrect: false, misconception: 'denied-that-placement-affects-the-count' },
      { text: 'Too low', isCorrect: true },
      { text: 'Her count of 5 is exactly right', isCorrect: false, misconception: 'blamed-a-miscount-instead-of-the-gaps' },
    ]),
    calculatorAllowed: false,
    isStretch: true,
    difficulty: 'stretch',
    explanation: {
      stepByStep: [
        'Step 1: The erasers and their gaps together reach the end of the ribbon.',
        'Step 2: Since some of that length is gap, not eraser, the erasers alone cover less than the full ribbon.',
        'Step 3: A count of 5 erasers, end to end with no gaps, would reach less far than the actual ribbon.',
        'Step 4: Too low.',
      ],
      conceptSummary:
        'Gaps between units eat into the length without being counted, so counting units that have gaps between them undercounts the true length.',
      commonMisconception:
        'It can feel like a gap should not matter, since Zoe still counted every eraser — but the gap is real length that no unit covers.',
    },
  },
  {
    id: 'g1-md2-03',
    standardCode: 'NC.1.MD.2',
    domainId: 'MD',
    prompt: 'How long is the desk, in blocks?',
    promptDetails: 'Ben measures his desk with 8 blocks laid end to end, with no gaps or overlaps.',
    options: labelOptions([
      { text: '7 blocks', isCorrect: false, misconception: 'left-out-the-last-unit-while-counting' },
      { text: '9 blocks', isCorrect: false, misconception: 'counted-a-unit-that-was-not-there' },
      { text: 'It cannot be told without a ruler', isCorrect: false, misconception: 'denied-that-non-standard-units-can-measure-length' },
      { text: '8 blocks', isCorrect: true },
    ]),
    calculatorAllowed: false,
    isStretch: false,
    difficulty: 'advanced',
    explanation: {
      stepByStep: [
        'Step 1: The blocks are laid end to end with no gaps or overlaps.',
        'Step 2: Count every block laid along the desk: 8.',
        'Step 3: A whole number of same-sized non-standard units, laid this way, measures a length just as a ruler would.',
        'Step 4: The desk is 8 blocks long.',
      ],
      conceptSummary:
        'A length can be expressed as a whole number of non-standard units, as long as those units are laid end to end with no gaps or overlaps.',
      commonMisconception:
        'A ruler is not the only way to measure — same-sized blocks laid end to end with no gaps or overlaps measure the desk too.',
    },
  },

  // ==========================================
  // Standard: NC.1.MD.3 — Tell Time to the Hour & Half-Hour
  // ==========================================
  {
    id: 'g1-md3-01',
    standardCode: 'NC.1.MD.3',
    domainId: 'MD',
    prompt: 'What time does the clock show?',
    promptDetails: 'The short hour hand points exactly at the 3. The long minute hand points exactly at the 12.',
    options: labelOptions([
      { text: '4:00', isCorrect: false, misconception: 'misread-the-hour-hand-by-one-number' },
      { text: '3:00', isCorrect: true },
      { text: '12:03', isCorrect: false, misconception: 'swapped-the-hour-and-minute-hands' },
      { text: '3:12', isCorrect: false, misconception: 'read-the-minute-hand-as-the-number-it-points-to' },
    ]),
    calculatorAllowed: false,
    isStretch: false,
    difficulty: 'mastery',
    explanation: {
      stepByStep: [
        'Step 1: The short hand tells the hour. It points exactly at the 3.',
        'Step 2: The long hand points at the 12, which means 0 minutes past the hour.',
        'Step 3: The time is exactly on the hour.',
        'Step 4: The time is 3:00.',
      ],
      conceptSummary:
        'When the minute hand points at the 12, the time is exactly on the hour, and the hour hand names which hour it is.',
      commonMisconception:
        'The long hand pointing at the 12 does not mean 12 minutes — it means 0 minutes past the hour.',
    },
  },
  {
    id: 'g1-md3-02',
    standardCode: 'NC.1.MD.3',
    domainId: 'MD',
    // THE brief's own named half-hour error: reading the hour hand as if it
    // pointed exactly at a number, when at half past it sits between two.
    prompt: 'What time does the clock show?',
    promptDetails: 'The short hour hand points halfway between the 7 and the 8. The long minute hand points exactly at the 6.',
    options: labelOptions([
      { text: '7:00', isCorrect: false, misconception: 'read-the-hour-hand-as-pointing-exactly-at-a-number' },
      { text: '8:00', isCorrect: false, misconception: 'read-the-next-hour-from-the-hour-hand' },
      { text: '7:06', isCorrect: false, misconception: 'read-the-minute-hand-as-the-number-it-points-to' },
      { text: '7:30', isCorrect: true },
    ]),
    calculatorAllowed: false,
    isStretch: false,
    difficulty: 'advanced',
    explanation: {
      stepByStep: [
        'Step 1: The short hand sits halfway between the 7 and the 8, not exactly at either one.',
        'Step 2: The long hand points at the 6, which means half past the hour.',
        'Step 3: A half-past hour hand always sits halfway between the hour it has passed and the next one.',
        'Step 4: The time is 7:30.',
      ],
      conceptSummary:
        'At half past the hour, the hour hand sits halfway between two numbers — not exactly on the one it has passed, and not exactly on the next one either.',
      commonMisconception:
        'The hour hand has clearly passed the 7, but reading it as still exactly AT the 7 loses the half hour it has already moved.',
    },
  },
  {
    id: 'g1-md3-03',
    standardCode: 'NC.1.MD.3',
    domainId: 'MD',
    prompt: 'What time does the clock show?',
    promptDetails: 'The short hour hand points halfway between the 10 and the 11. The long minute hand points exactly at the 6.',
    options: labelOptions([
      { text: '10:00', isCorrect: false, misconception: 'read-the-hour-hand-as-pointing-exactly-at-a-number' },
      { text: '11:00', isCorrect: false, misconception: 'read-the-next-hour-from-the-hour-hand' },
      { text: '10:30', isCorrect: true },
      { text: '10:06', isCorrect: false, misconception: 'read-the-minute-hand-as-the-number-it-points-to' },
    ]),
    calculatorAllowed: false,
    isStretch: false,
    difficulty: 'advanced',
    explanation: {
      stepByStep: [
        'Step 1: The short hand sits halfway between the 10 and the 11.',
        'Step 2: The long hand points at the 6, which means half past the hour.',
        'Step 3: The hour has passed 10 but not yet reached 11.',
        'Step 4: The time is 10:30.',
      ],
      conceptSummary:
        'The same half-hour pattern holds at every hour: the hour hand sits halfway between the hour just passed and the next one, whenever the minute hand points at the 6.',
      commonMisconception:
        'Rounding up to 11:00 treats the hour hand as if it had already finished the trip to the next number, when it is only halfway there.',
    },
  },
  {
    id: 'g1-md3-04',
    standardCode: 'NC.1.MD.3',
    domainId: 'MD',
    // "Analog and digital clocks alike" — given a digital time, place the
    // analog hour hand.
    prompt: 'Where does the hour hand point on an analog clock?',
    promptDetails: 'A digital clock shows 4:30.',
    options: labelOptions([
      { text: 'Exactly at the 4', isCorrect: false, misconception: 'read-the-hour-hand-as-pointing-exactly-at-a-number' },
      { text: 'Halfway between the 4 and the 5', isCorrect: true },
      { text: 'Exactly at the 5', isCorrect: false, misconception: 'read-the-next-hour-from-the-hour-hand' },
      { text: 'Exactly at the 6', isCorrect: false, misconception: 'swapped-the-hour-and-minute-hands' },
    ]),
    calculatorAllowed: false,
    isStretch: false,
    difficulty: 'mastery',
    explanation: {
      stepByStep: [
        'Step 1: The digital clock shows 4:30, which is half past 4.',
        'Step 2: On an analog clock, half past the hour means the hour hand has moved halfway toward the next hour.',
        'Step 3: The next hour after 4 is 5.',
        'Step 4: Halfway between the 4 and the 5.',
      ],
      conceptSummary:
        'A digital time and an analog clock show the same moment two ways. At half past, the analog hour hand always sits halfway between the two hours the time is between.',
      commonMisconception:
        'The 6 in "4:30" belongs to the minute hand\'s position, not the hour hand — placing the hour hand at the 6 mixes up the two hands.',
    },
  },

  // ==========================================
  // Standard: NC.1.MD.5 — Identify Coins & Relate Them to Pennies
  // ==========================================
  {
    id: 'g1-md5-01',
    standardCode: 'NC.1.MD.5',
    domainId: 'MD',
    prompt: 'Which coin is worth 5 pennies?',
    options: labelOptions([
      { text: 'A dime', isCorrect: false, misconception: 'confused-a-coin-with-a-different-value' },
      { text: 'A quarter', isCorrect: false, misconception: 'confused-a-coin-with-a-different-value' },
      { text: 'A nickel', isCorrect: true },
      { text: 'A penny', isCorrect: false, misconception: 'confused-a-coin-with-a-different-value' },
    ]),
    calculatorAllowed: false,
    isStretch: false,
    difficulty: 'mastery',
    explanation: {
      stepByStep: [
        'Step 1: Each coin has its own fixed value in pennies.',
        'Step 2: A penny is worth 1, a nickel is worth 5, a dime is worth 10, and a quarter is worth 25.',
        'Step 3: The coin worth 5 pennies is the nickel.',
        'Step 4: A nickel is worth 5 pennies.',
      ],
      conceptSummary:
        'Every coin has a fixed value in pennies: penny 1, nickel 5, dime 10, quarter 25. Knowing all four values is what tells them apart.',
      commonMisconception:
        'A dime is worth more than a nickel, not the same — mixing the two up gives the wrong number of pennies.',
    },
  },
  {
    id: 'g1-md5-02',
    standardCode: 'NC.1.MD.5',
    domainId: 'MD',
    // Ruling 24-4: an explicit value-in-pennies item.
    prompt: 'A dime is worth how many pennies?',
    options: labelOptions([
      { text: '5', isCorrect: false, misconception: 'confused-a-coin-with-a-different-value' },
      { text: '10', isCorrect: true },
      { text: '25', isCorrect: false, misconception: 'confused-a-coin-with-a-different-value' },
      { text: '1', isCorrect: false, misconception: 'confused-a-coin-with-a-different-value' },
    ]),
    calculatorAllowed: false,
    isStretch: false,
    difficulty: 'mastery',
    explanation: {
      stepByStep: [
        'Step 1: A dime is one of the four coins with a fixed value in pennies.',
        'Step 2: A dime is worth the same as 10 pennies.',
        'Step 3: 5 pennies is a nickel\'s value, and 25 pennies is a quarter\'s value.',
        'Step 4: A dime is worth 10 pennies.',
      ],
      conceptSummary:
        'Relating a coin to pennies means naming how many pennies match its value: a dime always relates to 10 pennies.',
      commonMisconception:
        'A nickel is worth 5 pennies, not a dime — a dime is worth twice as many.',
    },
  },
  {
    id: 'g1-md5-03',
    standardCode: 'NC.1.MD.5',
    domainId: 'MD',
    prompt: 'Which coin is worth 25 pennies?',
    options: labelOptions([
      { text: 'A quarter', isCorrect: true },
      { text: 'A dime', isCorrect: false, misconception: 'confused-a-coin-with-a-different-value' },
      { text: 'A nickel', isCorrect: false, misconception: 'confused-a-coin-with-a-different-value' },
      { text: 'A penny', isCorrect: false, misconception: 'confused-a-coin-with-a-different-value' },
    ]),
    calculatorAllowed: false,
    isStretch: false,
    difficulty: 'advanced',
    explanation: {
      stepByStep: [
        'Step 1: Each coin\'s value in pennies is fixed: penny 1, nickel 5, dime 10, quarter 25.',
        'Step 2: The coin worth 25 pennies is the quarter.',
        'Step 3: None of the other three coins reach 25 pennies.',
        'Step 4: A quarter is worth 25 pennies.',
      ],
      conceptSummary:
        'The quarter is worth the most of the four coins in pennies: 25, more than five times a nickel\'s value.',
      commonMisconception:
        'A dime looks similar in size to a quarter but is worth far fewer pennies: 10, not 25.',
    },
  },
  {
    id: 'g1-md5-04',
    standardCode: 'NC.1.MD.5',
    domainId: 'MD',
    prompt: 'Which is worth more pennies, a dime or a nickel?',
    options: labelOptions([
      { text: 'A nickel', isCorrect: false, misconception: 'reversed-a-coin-value-comparison' },
      { text: 'They are worth the same', isCorrect: false, misconception: 'treated-different-coins-as-equal-value' },
      { text: 'It cannot be told', isCorrect: false, misconception: 'denied-that-coin-values-can-be-compared' },
      { text: 'A dime', isCorrect: true },
    ]),
    calculatorAllowed: false,
    isStretch: false,
    difficulty: 'advanced',
    explanation: {
      stepByStep: [
        'Step 1: A dime is worth 10 pennies.',
        'Step 2: A nickel is worth 5 pennies.',
        'Step 3: 10 pennies is more than 5 pennies.',
        'Step 4: A dime is worth more pennies than a nickel.',
      ],
      conceptSummary:
        'Because every coin\'s value in pennies is fixed, any two coins can be compared by comparing those fixed values.',
      commonMisconception:
        'A nickel is bigger in size than a dime, but size does not decide value — a dime is worth twice as many pennies.',
    },
  },

  // ==========================================
  // Standard: NC.1.MD.4 — Organize & Interpret Data in Three Categories
  // ==========================================
  {
    id: 'g1-md4-01',
    standardCode: 'NC.1.MD.4',
    domainId: 'MD',
    // Two categories, where the generator always uses three.
    prompt: 'How many children have a cat?',
    promptDetails: 'A graph shows pets owned by Mr. Lin\'s class: 5 children have a dog, and 3 children have a cat.',
    options: labelOptions([
      { text: '5', isCorrect: false, misconception: 'used-the-wrong-given-quantity' },
      { text: '3', isCorrect: true },
      { text: '8', isCorrect: false, misconception: 'summed-all-data-points' },
      { text: '2', isCorrect: false, misconception: 'miscounted-while-reading-the-graph' },
    ]),
    calculatorAllowed: false,
    isStretch: false,
    difficulty: 'mastery',
    explanation: {
      stepByStep: [
        'Step 1: Find the cat row on the graph.',
        'Step 2: 3 children have a cat.',
        'Step 3: 5 is the dog row, not the cat row, and 8 is both rows added together.',
        'Step 4: 3 children have a cat.',
      ],
      conceptSummary:
        'A question about one category is answered by reading that category alone, not a different one and not the whole graph added together.',
      commonMisconception:
        'Reading 5, the dog row, answers about the wrong pet.',
    },
  },
  {
    id: 'g1-md4-02',
    standardCode: 'NC.1.MD.4',
    domainId: 'MD',
    prompt: 'How many days does the graph show in all?',
    promptDetails: 'A graph shows the weather this week: 4 sunny days and 3 rainy days.',
    options: labelOptions([
      { text: '4', isCorrect: false, misconception: 'forgot-the-final-step' },
      { text: '3', isCorrect: false, misconception: 'forgot-the-final-step' },
      { text: '7', isCorrect: true },
      { text: '1', isCorrect: false, misconception: 'subtracted-instead-of-added' },
    ]),
    calculatorAllowed: false,
    isStretch: false,
    difficulty: 'mastery',
    explanation: {
      stepByStep: [
        'Step 1: The graph shows 4 sunny days and 3 rainy days.',
        'Step 2: "In all" adds every category together.',
        'Step 3: 4 + 3 = 7.',
        'Step 4: The graph shows 7 days in all.',
      ],
      conceptSummary:
        'The total is every category added together, not just one of them read alone.',
      commonMisconception:
        'Reporting only 4, the sunny days, stops after reading one row instead of adding both.',
    },
  },
  {
    id: 'g1-md4-03',
    standardCode: 'NC.1.MD.4',
    domainId: 'MD',
    // "How many fewer", where the generator only ever asks "how many more".
    prompt: 'How many fewer kids picked grape than orange?',
    promptDetails: 'A graph shows favorite juices: 6 kids picked apple, 4 picked grape, and 9 picked orange.',
    options: labelOptions([
      { text: '13', isCorrect: false, misconception: 'added-instead-of-subtracted' },
      { text: '9', isCorrect: false, misconception: 'gave-an-amount-instead-of-the-difference' },
      { text: '4', isCorrect: false, misconception: 'gave-an-amount-instead-of-the-difference' },
      { text: '5', isCorrect: true },
    ]),
    calculatorAllowed: false,
    isStretch: false,
    difficulty: 'advanced',
    explanation: {
      stepByStep: [
        'Step 1: 4 kids picked grape, and 9 picked orange.',
        'Step 2: "How many fewer" asks for the difference: 9 − 4.',
        'Step 3: 9 − 4 = 5.',
        'Step 4: 5 fewer kids picked grape than orange.',
      ],
      conceptSummary:
        '"How many fewer" is a compare question just like "how many more": subtract the smaller category from the larger one.',
      commonMisconception:
        'Answering 9, the orange row, gives an amount instead of the difference between the two rows.',
    },
  },
  {
    id: 'g1-md4-04',
    standardCode: 'NC.1.MD.4',
    domainId: 'MD',
    // Take-apart shape: the total is given and one category is missing.
    prompt: 'How many students like painting best?',
    promptDetails: 'In Ms. Ruiz\'s class of 10 students, 4 like reading best and 3 like drawing best. The rest like painting best.',
    options: labelOptions([
      { text: '6', isCorrect: false, misconception: 'subtracted-only-one-of-two-known-parts' },
      { text: '3', isCorrect: true },
      { text: '7', isCorrect: false, misconception: 'subtracted-only-one-of-two-known-parts' },
      { text: '17', isCorrect: false, misconception: 'added-instead-of-subtracted' },
    ]),
    calculatorAllowed: false,
    isStretch: true,
    difficulty: 'stretch',
    explanation: {
      stepByStep: [
        'Step 1: 4 students like reading and 3 like drawing: 4 + 3 = 7.',
        'Step 2: All 10 students answered, so the rest picked painting.',
        'Step 3: 10 − 7 = 3.',
        'Step 4: 3 students like painting best.',
      ],
      conceptSummary:
        'When the total is known and every category but one is given, the missing category is the total take away all the categories that are shown.',
      commonMisconception:
        'Leaving drawing\'s 3 out of the subtraction gives 10 − 4 = 6, which is the wrong number of students left over.',
    },
  },
];
