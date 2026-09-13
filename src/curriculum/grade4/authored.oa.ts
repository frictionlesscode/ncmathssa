import type { Question } from '../../engine/questionModel';
import { labelOptions } from '../../engine/questionModel';

/**
 * The authored Grade 4 Operations & Algebraic Thinking bank.
 *
 * Every item is multiple choice, because the NC EOG and the CASE assessment
 * used for Single Subject Acceleration are multiple choice. Every incorrect
 * option is the value (or statement) a Grade 4 student actually arrives at by
 * making one specific, named error — never a filler number, and never the
 * answer nudged by one to look plausible. The `//` comment above each wrong
 * option shows the arithmetic that produces it, and the `misconception` tag
 * names the procedure the app should tell the student to repair.
 *
 * Scope is bounded by the sourced NCDPI wording in `./standards.ts`:
 *   NC.4.OA.1 — interpret a multiplication equation as a comparison; multiply
 *               or divide to solve multiplicative comparison word problems;
 *               equations with a symbol for the unknown; distinguish
 *               multiplicative comparison from additive comparison.
 *   NC.4.OA.3 — two-step word problems with the four operations; estimation
 *               for reasonableness; interpreting remainders; equations with a
 *               letter for the unknown.
 *   NC.4.OA.4 — all factor pairs for whole numbers up to and including 50; a
 *               whole number is a multiple of each of its factors; whether a
 *               number is a multiple of a given one-digit number; prime or
 *               composite.
 *   NC.4.OA.5 — generate and analyze a number or shape pattern that follows a
 *               given rule.
 * Nothing here asks beyond that text. In particular NC.4.OA.5 items stay
 * inside ONE pattern: comparing corresponding terms of two patterns is
 * NC.5.OA.3, a grade above.
 *
 * Every tag below is declared in `../misconceptions.ts`. Most are reused from
 * the shared cross-grade vocabulary on purpose, so that "you did this six
 * times this week" stays meaningful; four are new, because Grade 4 OA is the
 * first content to need names for stopping a divisor search too soon, swapping
 * factor with multiple, counting a pattern's terms instead of its steps, and
 * dropping the term a pattern started from.
 *
 * The correct option is deliberately placed at a varied position; it is not
 * always A.
 */
export const GRADE_4_OA_AUTHORED: Question[] = [
  // ==========================================
  // Standard: NC.4.OA.1 — Multiplicative Comparison
  // ==========================================
  {
    id: 'g4-oa1-01',
    standardCode: 'NC.4.OA.1',
    domainId: 'OA',
    prompt:
      'A blue climbing rope at the gym is 24 feet long. A red climbing rope is 6 times as long as the blue rope. How long is the red rope?',
    options: labelOptions([
      // 24 + 6 = 30: read "6 times as long" as "6 feet longer than".
      { text: '30 feet', isCorrect: false, misconception: 'confused-times-with-more' },
      // 24 ÷ 6 = 4: the phrase "as long as" triggered a comparison by division,
      // even though the blue rope is the shorter one being scaled up.
      { text: '4 feet', isCorrect: false, misconception: 'divided-instead-of-multiplied' },
      { text: '144 feet', isCorrect: true },
      // 24 × 6 with the carry added before multiplying: ones 4 × 6 = 24, write
      // 4 and carry 2; tens (2 + 2) × 6 = 24, written as 24 tens -> 244.
      { text: '244 feet', isCorrect: false, misconception: 'added-carry-before-multiplying' },
    ]),
    calculatorAllowed: false,
    isStretch: false,
    difficulty: 'mastery',
    explanation: {
      stepByStep: [
        'Step 1: "6 times as long" is a multiplicative comparison, so the blue rope\'s length is multiplied by 6.',
        'Step 2: Write the equation with the unknown: r = 6 × 24.',
        'Step 3: 6 × 24 = 6 × 20 + 6 × 4 = 120 + 24 = 144.',
        'Step 4: The red rope is 144 feet long.',
      ],
      conceptSummary:
        '"Times as long" scales a length by a factor; "longer than" adds to it. NC.4.OA.1 asks a student to tell the two apart before computing anything.',
      commonMisconception:
        'Reading "6 times as long" as "6 feet longer" turns a multiplication into an addition and gives 30 feet instead of 144.',
    },
  },
  {
    id: 'g4-oa1-02',
    standardCode: 'NC.4.OA.1',
    domainId: 'OA',
    prompt:
      'A school library has 96 nonfiction books and 12 fiction books. The number of nonfiction books is how many times the number of fiction books?',
    options: labelOptions([
      // 96 - 12 = 84: answered with the additive difference when the question
      // asked "how many times", which is a multiplicative comparison.
      { text: '84 times', isCorrect: false, misconception: 'additive-instead-of-multiplicative-relationship' },
      // 96 × 12 = 1,152: multiplied the two counts instead of dividing to find
      // the unknown factor.
      { text: '1,152 times', isCorrect: false, misconception: 'multiplied-instead-of-divided' },
      // 96 ÷ 2 = 48: divided by only the 2 of the divisor 12.
      { text: '48 times', isCorrect: false, misconception: 'divided-by-only-one-digit-of-the-divisor' },
      { text: '8 times', isCorrect: true },
    ]),
    calculatorAllowed: false,
    isStretch: false,
    difficulty: 'mastery',
    explanation: {
      stepByStep: [
        'Step 1: "How many times" asks for the unknown factor in 12 × n = 96.',
        'Step 2: An unknown factor is found by dividing: n = 96 ÷ 12.',
        'Step 3: 12 × 8 = 96, so 96 ÷ 12 = 8.',
        'Step 4: There are 8 times as many nonfiction books as fiction books.',
      ],
      conceptSummary:
        'A multiplicative comparison with the factor unknown is solved by division; the difference between the two counts answers a different question entirely.',
      commonMisconception:
        'Subtracting to get 84 answers "how many more", not "how many times as many".',
    },
  },
  {
    id: 'g4-oa1-03',
    standardCode: 'NC.4.OA.1',
    domainId: 'OA',
    prompt:
      'A farmer planted 72 tomato plants. That is 8 times as many tomato plants as pepper plants. How many pepper plants did the farmer plant?',
    options: labelOptions([
      // 72 × 8 = 576: the words "8 times" triggered multiplication, even though
      // 72 is already the larger of the two amounts.
      { text: '576 pepper plants', isCorrect: false, misconception: 'multiplied-instead-of-divided' },
      { text: '9 pepper plants', isCorrect: true },
      // 72 - 8 = 64: used the additive reading of the comparison.
      { text: '64 pepper plants', isCorrect: false, misconception: 'additive-instead-of-multiplicative-relationship' },
      // 72 + 8 = 80: read "8 times as many" as "8 more than".
      { text: '80 pepper plants', isCorrect: false, misconception: 'confused-times-with-more' },
    ]),
    calculatorAllowed: false,
    isStretch: false,
    difficulty: 'mastery',
    explanation: {
      stepByStep: [
        'Step 1: The tomato plants are the larger group: 72 is 8 times the number of pepper plants.',
        'Step 2: Write the comparison with a symbol for the unknown: 8 × p = 72.',
        'Step 3: Divide to find the unknown factor: p = 72 ÷ 8 = 9.',
        'Step 4: The farmer planted 9 pepper plants.',
      ],
      conceptSummary:
        'When the larger quantity is the one given, a multiplicative comparison is undone by dividing. Checking which group is larger before choosing an operation is the whole skill.',
      commonMisconception:
        'Multiplying 72 by 8 gives 576 pepper plants, far more than the tomato plants they were supposed to be 8 times fewer than.',
    },
  },
  {
    id: 'g4-oa1-04',
    standardCode: 'NC.4.OA.1',
    domainId: 'OA',
    prompt:
      "A sunflower in a garden is 63 inches tall. The sunflower is 7 times as tall as a marigold in the same garden. Which equation uses n for the marigold's height in inches and correctly represents this comparison?",
    options: labelOptions([
      { text: 'n × 7 = 63', isCorrect: true },
      // Applied the factor 7 to the sunflower, the plant that is already the
      // taller one, so the marigold comes out taller than the sunflower.
      { text: 'n = 63 × 7', isCorrect: false, misconception: 'reversed-the-relationship' },
      // Read "7 times as tall" as "7 inches taller".
      { text: 'n = 63 + 7', isCorrect: false, misconception: 'confused-times-with-more' },
      // Same additive reading, run the other direction: 63 - 7.
      { text: 'n = 63 - 7', isCorrect: false, misconception: 'additive-instead-of-multiplicative-relationship' },
    ]),
    calculatorAllowed: false,
    isStretch: false,
    difficulty: 'advanced',
    explanation: {
      stepByStep: [
        'Step 1: Name the unknown: n is the marigold\'s height in inches.',
        'Step 2: The sunflower is 7 times the marigold, so 7 copies of n make 63.',
        'Step 3: That is the equation n × 7 = 63.',
        'Step 4: The equation n × 7 = 63 represents the comparison (and solving it gives n = 9 inches).',
      ],
      conceptSummary:
        'NC.4.OA.1 asks for the equation, not just the number: the unknown gets a symbol and the multiplier is attached to the SMALLER quantity, because that is the one being scaled up.',
      commonMisconception:
        'Writing n = 63 × 7 scales the taller plant up again, which would make the marigold 441 inches tall.',
    },
  },

  // ==========================================
  // Standard: NC.4.OA.3 — Two-Step Word Problems, All Four Operations
  // ==========================================
  {
    id: 'g4-oa3-01',
    standardCode: 'NC.4.OA.3',
    domainId: 'OA',
    prompt:
      'A bakery baked 8 trays of muffins with 12 muffins on each tray. The bakery sold 37 muffins before noon. How many muffins are left?',
    options: labelOptions([
      // 8 × 12 = 96: answered the first step and stopped before subtracting.
      { text: '96 muffins', isCorrect: false, misconception: 'forgot-the-final-step' },
      { text: '59 muffins', isCorrect: true },
      // 96 + 37 = 133: added the muffins sold instead of taking them away.
      { text: '133 muffins', isCorrect: false, misconception: 'added-instead-of-subtracted' },
      // 96 - 37 done column by column without regrouping: ones 7 - 6 = 1,
      // tens 9 - 3 = 6, giving 61.
      { text: '61 muffins', isCorrect: false, misconception: 'subtracted-without-regrouping' },
    ]),
    calculatorAllowed: false,
    isStretch: false,
    difficulty: 'mastery',
    explanation: {
      stepByStep: [
        'Step 1: Find how many muffins were baked: 8 × 12 = 96.',
        'Step 2: Take away the muffins that were sold: 96 - 37.',
        'Step 3: Regroup to subtract the ones: 16 - 7 = 9, and 8 - 3 = 5.',
        'Step 4: 59 muffins are left.',
      ],
      conceptSummary:
        'A two-step problem has two questions inside it. The first answer, 96, is a stepping stone; the question asked for what is left.',
      commonMisconception:
        'Stopping at 96 answers "how many were baked", which is the step before the one the problem asked about.',
    },
  },
  {
    id: 'g4-oa3-02',
    standardCode: 'NC.4.OA.3',
    domainId: 'OA',
    prompt:
      'A teacher is taking 148 students on a field trip. Each van holds 9 students. How many vans are needed so that every student has a seat?',
    options: labelOptions([
      // 148 ÷ 9 = 16 R 4; the remainder was dropped, leaving 4 students behind.
      { text: '16 vans', isCorrect: false, misconception: 'ignored-remainder' },
      // The raw division result was handed back without asking what a leftover
      // of 4 students means for a van.
      { text: '16 R 4 vans', isCorrect: false, misconception: 'reported-remainder-without-interpreting' },
      // Rounded to 150 ÷ 10 = 15 and reported the estimate as the answer.
      { text: '15 vans', isCorrect: false, misconception: 'reported-the-estimate' },
      { text: '17 vans', isCorrect: true },
    ]),
    calculatorAllowed: false,
    isStretch: false,
    difficulty: 'mastery',
    explanation: {
      stepByStep: [
        'Step 1: Divide the students among the vans: 148 ÷ 9.',
        'Step 2: 9 × 16 = 144, and 148 - 144 = 4, so 148 ÷ 9 = 16 R 4.',
        'Step 3: Sixteen vans seat 144 students; 4 students still have no seat.',
        'Step 4: Those 4 students need one more van, so 17 vans are needed.',
      ],
      conceptSummary:
        'Interpreting a remainder means asking what the leftover means here. When everyone must be seated, the quotient rounds UP.',
      commonMisconception:
        'Answering 16 leaves four children standing on the sidewalk; the remainder has to be given a van of its own.',
    },
  },
  {
    id: 'g4-oa3-03',
    standardCode: 'NC.4.OA.3',
    domainId: 'OA',
    prompt:
      'A factory packs 250 crayons into boxes of 8. Every crayon left over after the last full box is put into a sample bag. How many crayons go into the sample bag?',
    options: labelOptions([
      // 250 ÷ 8 = 31 R 2; the remainder is the answer here, but it was dropped
      // and the quotient was reported instead.
      { text: '31 crayons', isCorrect: false, misconception: 'ignored-remainder' },
      // The raw division result handed back without deciding which part of it
      // the sample bag actually holds.
      { text: '31 R 2 crayons', isCorrect: false, misconception: 'reported-remainder-without-interpreting' },
      { text: '2 crayons', isCorrect: true },
      // Partial quotients stopped too soon: 8 × 30 = 240 and 250 - 240 = 10, so
      // 10 was reported even though another full box of 8 still fits.
      { text: '10 crayons', isCorrect: false, misconception: 'forgot-the-final-step' },
    ]),
    calculatorAllowed: false,
    isStretch: false,
    difficulty: 'advanced',
    explanation: {
      stepByStep: [
        'Step 1: Divide to fill boxes: 250 ÷ 8.',
        'Step 2: 8 × 30 = 240 with 10 left, and 10 still holds one more box: 8 × 31 = 248.',
        'Step 3: 250 - 248 = 2, so 250 ÷ 8 = 31 R 2.',
        'Step 4: The full boxes hold 248 crayons, so 2 crayons go into the sample bag.',
      ],
      conceptSummary:
        'Sometimes the remainder IS the answer. The same division, 31 R 2, answers "how many boxes" with 31 and "how many left over" with 2, so the question decides which part to report.',
      commonMisconception:
        'Stopping the division at 8 × 30 leaves 10 crayons, but 10 is more than 8 — another whole box still fits.',
    },
  },
  {
    id: 'g4-oa3-04',
    standardCode: 'NC.4.OA.3',
    domainId: 'OA',
    prompt:
      'A club had some members. Then 27 new members joined. The club then split into 6 equal teams with 14 members on each team. Which equation uses m for the number of members the club started with?',
    options: labelOptions([
      { text: '(m + 27) ÷ 6 = 14', isCorrect: true },
      // Without the parentheses only the 27 is divided by 6, so the new members
      // are split into teams and the original members are not.
      { text: 'm + 27 ÷ 6 = 14', isCorrect: false, misconception: 'ignored-grouping-symbols' },
      // Splitting into equal teams is a division; multiplying by 6 instead
      // makes the club grow when it was being shared out.
      { text: '(m + 27) × 6 = 14', isCorrect: false, misconception: 'multiplied-instead-of-divided' },
      // "6 teams of 14" was written as 6 + 14 rather than 6 × 14.
      { text: 'm + 27 = 6 + 14', isCorrect: false, misconception: 'added-instead-of-multiplied' },
    ]),
    calculatorAllowed: false,
    isStretch: true,
    difficulty: 'stretch',
    explanation: {
      stepByStep: [
        'Step 1: Let m stand for the members the club started with.',
        'Step 2: After 27 joined, the club has m + 27 members, and that whole amount is split into teams.',
        'Step 3: Grouping symbols are what make the WHOLE amount get divided: (m + 27) ÷ 6.',
        'Step 4: Each team has 14 members, so the equation is (m + 27) ÷ 6 = 14 (and m = 57).',
      ],
      conceptSummary:
        'NC.4.OA.3 asks students to represent the problem with an equation and a letter for the unknown. The parentheses are not decoration: they record that the joining happened before the splitting.',
      commonMisconception:
        'Writing m + 27 ÷ 6 = 14 divides only the 27, which describes a different story than the one in the problem.',
    },
  },
  {
    id: 'g4-oa3-05',
    standardCode: 'NC.4.OA.3',
    domainId: 'OA',
    prompt:
      'A theater sold 312 tickets on Friday and 289 tickets on Saturday. Each ticket cost $7. Exactly how much money did the theater collect on the two days?',
    options: labelOptions([
      { text: '$4,207', isCorrect: true },
      // Rounded 601 to 600 and reported 600 × 7 = 4,200, but the question
      // asked for the exact amount, not an estimate.
      { text: '$4,200', isCorrect: false, misconception: 'reported-the-estimate' },
      // 312 + 289 = 601: answered the first step and never multiplied by $7.
      { text: '$601', isCorrect: false, misconception: 'forgot-the-final-step' },
      // 312 + 289 added without carrying gives 591, and 591 × 7 = 4,137.
      { text: '$4,137', isCorrect: false, misconception: 'added-without-carrying' },
    ]),
    calculatorAllowed: false,
    isStretch: false,
    difficulty: 'mastery',
    explanation: {
      stepByStep: [
        'Step 1: Add the two days of ticket sales: 312 + 289. The ones carry: 2 + 9 = 11.',
        'Step 2: 312 + 289 = 601 tickets.',
        'Step 3: Multiply by the price: 601 × 7 = 4,200 + 7 = 4,207.',
        'Step 4: The theater collected $4,207.',
      ],
      conceptSummary:
        'Estimation is for checking an answer, not for producing one. Rounding to 600 × 7 = $4,200 confirms $4,207 is reasonable; it does not replace it.',
      commonMisconception:
        'Giving $4,200 answers "about how much", but this problem used the word "exactly".',
    },
  },

  // ==========================================
  // Standard: NC.4.OA.4 — Factor Pairs, Multiples, Prime & Composite
  // ==========================================
  {
    id: 'g4-oa4-01',
    standardCode: 'NC.4.OA.4',
    domainId: 'OA',
    prompt:
      'Exactly one of the numbers below is a prime number. Which one is it?',
    options: labelOptions([
      // 49 = 7 × 7. Tested 2, 3 and 5 as divisors, found none, and stopped
      // before reaching 7.
      { text: '49', isCorrect: false, misconception: 'stopped-the-divisor-check-early' },
      { text: '47', isCorrect: true },
      // 51 = 3 × 17. Checked only "is it even?" and "does it end in 5?", so the
      // divisor 3 was never tested.
      { text: '51', isCorrect: false, misconception: 'stopped-the-divisor-check-early' },
      // 33 = 3 × 11. Same two-check habit: odd and not ending in 5, so it was
      // called prime without dividing by anything.
      { text: '33', isCorrect: false, misconception: 'stopped-the-divisor-check-early' },
    ]),
    calculatorAllowed: false,
    isStretch: false,
    difficulty: 'mastery',
    explanation: {
      stepByStep: [
        'Step 1: A prime number has exactly one factor pair: 1 and itself.',
        'Step 2: 33 = 3 × 11 and 51 = 3 × 17, so both are composite (their digits add to 6, a multiple of 3).',
        'Step 3: 49 = 7 × 7, so it is composite too — this one is missed by anyone who only tests 2, 3 and 5.',
        'Step 4: 47 has no factor pair other than 1 × 47, so 47 is the prime number.',
      ],
      conceptSummary:
        'Testing whether a number is prime means testing divisors upward until the divisor squared passes the number — for 47 that is 2, 3, 5 and 7, because 7 × 7 = 49 is already larger than 47.',
      commonMisconception:
        'Every wrong choice here comes from the same habit: stopping the divisor check too early. 49 in particular survives the 2, 3 and 5 tests.',
    },
  },
  {
    id: 'g4-oa4-02',
    standardCode: 'NC.4.OA.4',
    domainId: 'OA',
    prompt: 'Which list shows ALL of the factor pairs of 24?',
    options: labelOptions([
      // The search stopped after 3, so 4 × 6 was never found.
      { text: '1 × 24, 2 × 12, 3 × 8', isCorrect: false, misconception: 'stopped-the-divisor-check-early' },
      // 24 ÷ 5 = 4 with 4 left over; the leftover was dropped and 5 × 4 was
      // recorded as if it were a factor pair (5 × 4 is 20, not 24).
      { text: '1 × 24, 2 × 12, 3 × 8, 4 × 6, 5 × 4', isCorrect: false, misconception: 'ignored-remainder' },
      { text: '1 × 24, 2 × 12, 3 × 8, 4 × 6', isCorrect: true },
      // These are the first multiples of 24, not its factors: the two ends of
      // the factor/multiple relationship were swapped.
      { text: '24, 48, 72, 96', isCorrect: false, misconception: 'confused-factor-with-multiple' },
    ]),
    calculatorAllowed: false,
    isStretch: false,
    difficulty: 'mastery',
    explanation: {
      stepByStep: [
        'Step 1: Test each whole number in order: 24 ÷ 1 = 24, so 1 × 24 is a pair.',
        'Step 2: 24 ÷ 2 = 12 and 24 ÷ 3 = 8, giving 2 × 12 and 3 × 8.',
        'Step 3: 24 ÷ 4 = 6, giving 4 × 6. 24 ÷ 5 leaves a remainder, so 5 is not a factor.',
        'Step 4: The next divisor, 6, gives back 6 × 4 — a pair already listed — so the search is finished: 1 × 24, 2 × 12, 3 × 8, 4 × 6.',
      ],
      conceptSummary:
        'Testing divisors in order guarantees no pair is missed, and the search can stop as soon as the pairs start repeating in the other order.',
      commonMisconception:
        'Recording 5 × 4 counts a division that did not come out even; a factor pair must multiply back to exactly 24.',
    },
  },
  {
    id: 'g4-oa4-03',
    standardCode: 'NC.4.OA.4',
    domainId: 'OA',
    prompt:
      'The factor pairs of 30 are 1 × 30, 2 × 15, 3 × 10, and 5 × 6. Which statement is true?',
    options: labelOptions([
      // A factor and a multiple are opposite ends of the same relationship;
      // this names the smaller number as the multiple.
      { text: '5 is a multiple of 30, because 5 is one of its factors', isCorrect: false, misconception: 'confused-factor-with-multiple' },
      // 30 + 6 = 36: an added difference used where a multiplicative
      // relationship was needed. 36 is not 30 times anything whole.
      { text: '36 is a multiple of 30, because 30 + 6 = 36', isCorrect: false, misconception: 'additive-instead-of-multiplicative-relationship' },
      // 30 ÷ 4 = 7 with 2 left over, so 4 is not a factor at all; the leftover
      // was dropped and the division was called even.
      { text: '4 is a factor of 30, because 30 ÷ 4 is 7 with 2 left over', isCorrect: false, misconception: 'ignored-remainder' },
      { text: '30 is a multiple of 5, because 5 × 6 = 30', isCorrect: true },
    ]),
    calculatorAllowed: false,
    isStretch: false,
    difficulty: 'mastery',
    explanation: {
      stepByStep: [
        'Step 1: 5 × 6 = 30, so 5 is a factor of 30.',
        'Step 2: A whole number is a multiple of each of its factors, so 30 is a multiple of 5.',
        'Step 3: The multiple is always the bigger number — it is what the factor is counted up to.',
        'Step 4: The true statement is: 30 is a multiple of 5, because 5 × 6 = 30.',
      ],
      conceptSummary:
        'Factor and multiple describe one relationship from two ends: if 5 is a factor of 30, then 30 is a multiple of 5. Never the other way around.',
      commonMisconception:
        'Saying "5 is a multiple of 30" flips the relationship — you would have to count by 30 to reach 5.',
    },
  },
  {
    id: 'g4-oa4-04',
    standardCode: 'NC.4.OA.4',
    domainId: 'OA',
    prompt:
      'Ms. Ruiz has 45 chairs. She wants to put them into equal rows with no chairs left over. Which number of rows will work?',
    options: labelOptions([
      { text: '9 rows', isCorrect: true },
      // 45 ÷ 6 = 7 with 3 chairs left over; the leftover was ignored.
      { text: '6 rows', isCorrect: false, misconception: 'ignored-remainder' },
      // 45 ÷ 4 = 11 with 1 chair left over; the same leftover was ignored.
      { text: '4 rows', isCorrect: false, misconception: 'ignored-remainder' },
      // 45 × 2 = 90: a multiple of 45 was named where a factor was needed, so
      // there would be more rows than chairs.
      { text: '90 rows', isCorrect: false, misconception: 'confused-factor-with-multiple' },
    ]),
    calculatorAllowed: false,
    isStretch: false,
    difficulty: 'advanced',
    explanation: {
      stepByStep: [
        'Step 1: Rows with none left over means the number of rows must be a factor of 45.',
        'Step 2: Test the choices: 45 ÷ 6 = 7 R 3 and 45 ÷ 4 = 11 R 1, so neither divides evenly.',
        'Step 3: 90 is a multiple of 45, not a factor — 90 rows for 45 chairs is impossible.',
        'Step 4: 45 ÷ 9 = 5 exactly, so 9 rows will work, with 5 chairs in each row.',
      ],
      conceptSummary:
        'Asking whether an arrangement comes out even is the same as asking whether a number is a factor: the division must leave no remainder.',
      commonMisconception:
        'A division that "almost" works, like 45 ÷ 6 = 7 R 3, still leaves chairs over, so 6 is not a factor of 45.',
    },
  },

  // ==========================================
  // Standard: NC.4.OA.5 — Generate & Analyze Patterns
  // ==========================================
  {
    id: 'g4-oa5-01',
    standardCode: 'NC.4.OA.5',
    domainId: 'OA',
    prompt:
      'A number pattern follows the rule "multiply by 3". The first term is 2. What are the next three terms?',
    options: labelOptions([
      // 2 + 3 = 5, 5 + 3 = 8, 8 + 3 = 11: added 3 each time instead of
      // multiplying by 3.
      { text: '5, 8, 11', isCorrect: false, misconception: 'added-instead-of-multiplied' },
      // 2 × 3 = 6 for the first term, then 6 was added repeatedly: 12, 18. The
      // rule was turned into an additive one after a single application.
      { text: '6, 12, 18', isCorrect: false, misconception: 'additive-instead-of-multiplicative-relationship' },
      // The given first term 2 was counted as one of the "next three", so the
      // list stops at 18 and the third new term, 54, was never generated.
      { text: '2, 6, 18', isCorrect: false, misconception: 'forgot-the-final-step' },
      { text: '6, 18, 54', isCorrect: true },
    ]),
    calculatorAllowed: false,
    isStretch: false,
    difficulty: 'mastery',
    explanation: {
      stepByStep: [
        'Step 1: The rule is applied to the term before it, starting from 2.',
        'Step 2: 2 × 3 = 6.',
        'Step 3: 6 × 3 = 18, and 18 × 3 = 54.',
        'Step 4: The next three terms are 6, 18, 54.',
      ],
      conceptSummary:
        'A rule is applied to the term you just made, not to the starting term over and over, and the first term given in the problem is not one of the new terms.',
      commonMisconception:
        'Adding 3 each time gives 5, 8, 11 — a pattern that follows the rule "add 3", not "multiply by 3".',
    },
  },
  {
    id: 'g4-oa5-02',
    standardCode: 'NC.4.OA.5',
    domainId: 'OA',
    prompt:
      'A number pattern follows the rule "multiply by 5". The 4th term is 250. What is the FIRST term?',
    options: labelOptions([
      // 250 ÷ 5 = 50: stepped back once and stopped, two steps short of the
      // first term.
      { text: '50', isCorrect: false, misconception: 'forgot-the-final-step' },
      // 250 × 5 = 1,250: ran the rule forward from the 4th term instead of
      // undoing it backward.
      { text: '1,250', isCorrect: false, misconception: 'multiplied-instead-of-divided' },
      { text: '2', isCorrect: true },
      // 250 - 5 - 5 - 5 = 235: treated "multiply by 5" as "add 5" and undid it
      // by subtracting.
      { text: '235', isCorrect: false, misconception: 'additive-instead-of-multiplicative-relationship' },
    ]),
    calculatorAllowed: false,
    isStretch: false,
    difficulty: 'advanced',
    explanation: {
      stepByStep: [
        'Step 1: Three steps separate the 1st term from the 4th term.',
        'Step 2: Going backward undoes the rule, so divide by 5 each step: 250 ÷ 5 = 50.',
        'Step 3: 50 ÷ 5 = 10, and 10 ÷ 5 = 2.',
        'Step 4: The first term is 2 (check forward: 2, 10, 50, 250).',
      ],
      conceptSummary:
        'Analyzing a pattern means being able to run its rule in both directions, and counting the STEPS between terms — three steps from the 1st term to the 4th, not four.',
      commonMisconception:
        'Dividing once gives 50, which is the 3rd term, not the 1st.',
    },
  },
  {
    id: 'g4-oa5-03',
    standardCode: 'NC.4.OA.5',
    domainId: 'OA',
    prompt:
      'A shape pattern follows the rule "each figure is made of twice as many squares as the figure before it". Figure 1 is made of 3 squares. How many squares make up Figure 5?',
    options: labelOptions([
      // 3, 6, 12, 24: stopped at Figure 4.
      { text: '24 squares', isCorrect: false, misconception: 'forgot-the-final-step' },
      { text: '48 squares', isCorrect: true },
      // Read "twice as many" as "2 more": 3, 5, 7, 9, 11.
      { text: '11 squares', isCorrect: false, misconception: 'confused-times-with-more' },
      // 3 × 2 × 2 × 2 × 2 × 2 = 96: doubled once for each of the five figures
      // instead of once for each of the four steps between Figure 1 and
      // Figure 5.
      { text: '96 squares', isCorrect: false, misconception: 'counted-terms-not-steps' },
    ]),
    calculatorAllowed: false,
    isStretch: false,
    difficulty: 'mastery',
    explanation: {
      stepByStep: [
        'Step 1: Figure 1 has 3 squares, and each figure doubles the one before it.',
        'Step 2: Figure 2 has 3 × 2 = 6 squares; Figure 3 has 6 × 2 = 12 squares.',
        'Step 3: Figure 4 has 12 × 2 = 24 squares.',
        'Step 4: Figure 5 has 24 × 2 = 48 squares.',
      ],
      conceptSummary:
        'A shape pattern follows a rule exactly the way a number pattern does; counting the squares in each figure turns the shapes into the sequence 3, 6, 12, 24, 48.',
      commonMisconception:
        '"Twice as many" doubles the figure before it. Reading it as "2 more" gives 3, 5, 7, 9, 11 and a pattern that grows far too slowly.',
    },
  },
  {
    id: 'g4-oa5-04',
    standardCode: 'NC.4.OA.5',
    domainId: 'OA',
    prompt: 'A number pattern begins 3, 12, 48, 192. Which rule generates this pattern?',
    options: labelOptions([
      { text: 'Multiply by 4', isCorrect: true },
      // 3 + 9 = 12 checks out, so the rule was accepted after testing only the
      // first step. The second step fails: 12 + 9 = 21, not 48.
      { text: 'Add 9', isCorrect: false, misconception: 'forgot-the-final-step' },
      // Listed the differences between consecutive terms instead of naming the
      // one multiplicative rule that produces them.
      { text: 'Add 9, then add 36, then add 144', isCorrect: false, misconception: 'additive-instead-of-multiplicative-relationship' },
      // Right factor, wrong direction: dividing by 4 runs the pattern backward.
      { text: 'Divide by 4', isCorrect: false, misconception: 'divided-instead-of-multiplied' },
    ]),
    calculatorAllowed: false,
    isStretch: false,
    difficulty: 'advanced',
    explanation: {
      stepByStep: [
        'Step 1: A rule must work for EVERY step, so test more than the first one.',
        'Step 2: 3 × 4 = 12, and 12 × 4 = 48.',
        'Step 3: 48 × 4 = 192, so the same rule holds all the way through.',
        'Step 4: The rule that generates the pattern is Multiply by 4.',
      ],
      conceptSummary:
        'Analyzing a pattern means finding the one rule that holds at every step. The gaps between terms (9, 36, 144) are themselves growing, which is the signal that the rule is multiplicative, not additive.',
      commonMisconception:
        '"Add 9" fits the very first step and nothing after it — a rule confirmed on one step has not been confirmed at all.',
    },
  },
  {
    id: 'g4-oa5-05',
    standardCode: 'NC.4.OA.5',
    domainId: 'OA',
    prompt:
      'A number pattern follows the rule "add 7". The first term is 4. What is the 10th term?',
    options: labelOptions([
      // 4 + 7 × 10 = 74: the rule was applied once for each of the ten terms
      // instead of once for each of the nine steps between them.
      { text: '74', isCorrect: false, misconception: 'counted-terms-not-steps' },
      { text: '67', isCorrect: true },
      // 7 × 9 = 63: nine steps counted correctly, but the pattern was started
      // from 0 and the first term of 4 was never included.
      { text: '63', isCorrect: false, misconception: 'ignored-the-starting-term' },
      // 4 + 7 × 8 = 60: this is the 9th term, one step short of the one asked
      // for.
      { text: '60', isCorrect: false, misconception: 'forgot-the-final-step' },
    ]),
    calculatorAllowed: false,
    isStretch: false,
    difficulty: 'advanced',
    explanation: {
      stepByStep: [
        'Step 1: List a few terms to see the structure: 4, 11, 18, 25, ...',
        'Step 2: Count the STEPS, not the terms. Getting from the 1st term to the 10th takes 9 steps, because the 1st term is already there before any adding happens.',
        'Step 3: Nine steps of 7 add 9 × 7 = 63 to the starting value.',
        'Step 4: 4 + 63 = 67, so the 10th term is 67.',
      ],
      conceptSummary:
        'The number of times a rule is applied is always one less than the term number, because the first term is given rather than generated. Both parts matter: the steps AND the value the pattern started from.',
      commonMisconception:
        'Adding 7 ten times gives 74, and leaving off the starting 4 gives 63. The 10th term needs nine steps added to the 4 the pattern began with.',
    },
  },
];
