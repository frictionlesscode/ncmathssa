import type { Question } from '../../engine/questionModel';
import { labelOptions } from '../../engine/questionModel';

/**
 * The authored Grade 4 Number & Operations in Base Ten bank.
 *
 * Every item is multiple choice, because the NC EOG and the CASE assessment
 * used for Single Subject Acceleration are multiple choice. Every incorrect
 * option is the number a Grade 4 student actually arrives at by making one
 * specific, named error — never a filler number, and never the answer nudged
 * by one to look plausible. The `//` comment above each wrong option shows the
 * arithmetic that produces it, and the `misconception` tag names the procedure
 * the app should tell the student to repair.
 *
 * Scope is bounded by the sourced NCDPI wording in `./standards.ts`:
 *   NC.4.NBT.1 — a digit in one place represents 10 times as much as it does
 *                in the place to its right, to 100,000.
 *   NC.4.NBT.2 — read and write whole numbers to 100,000 in numerals, number
 *                names and expanded form.
 *   NC.4.NBT.7 — compare two whole numbers to 100,000 by the values of the
 *                digits in each place, recording with >, = and <.
 *   NC.4.NBT.4 — add and subtract whole numbers to 100,000 by the standard
 *                algorithm, with place value understanding behind regrouping.
 *   NC.4.NBT.5 — up to three digits by one digit, and two two-digit numbers,
 *                through area models, partial products and the properties of
 *                operations.
 *   NC.4.NBT.6 — whole-number quotients and remainders, up to three-digit
 *                dividends and ONE-digit divisors.
 * Nothing here asks beyond that text. In particular NC.4.NBT.6 items never use
 * a two-digit divisor: that is NC.5.NBT.6, a grade above. And no NC.4.NBT.1
 * item compares places two columns apart — the standard's own wording is about
 * a place and "the place to its right".
 *
 * Every one of these six standards also has a generator (see ./templates), so
 * the two have to stay out of each other's way: the scheduler keys authored
 * items as {authored, id} and generated ones as {generated, templateId}, and a
 * question reachable both ways is served to a child twice under two
 * identities. Every generator here emits either a bare computational prompt
 * ('Add.', 'Subtract.', 'Multiply.', 'Divide. Write the quotient and the
 * remainder.', 'Order these numbers from LEAST to GREATEST.') or a fixed
 * sentence about a numeral. Every item below is a word problem, an error
 * analysis, or a differently worded stem, so no prompt can coincide.
 * `authored.nbt.test.ts` checks that against 2,000 seeds of every template
 * rather than trusting this paragraph.
 *
 * Ten tags used here are new, declared in `../misconceptions.ts`. Base Ten is
 * the algorithm-heavy domain and its errors are procedural slips that the
 * existing vocabulary — written first for Grade 5, where every place-value tag
 * is about the DECIMAL part of a number — had no honest name for. A Grade 4
 * child comparing 62,408 with 62,480 has not made a decimal error.
 *
 * The correct option is deliberately placed at a varied position; it is not
 * always A.
 */
export const GRADE_4_NBT_AUTHORED: Question[] = [
  // ==========================================
  // Standard: NC.4.NBT.1 — Place Value: 10 Times as Much
  // ==========================================
  {
    id: 'g4-nbt1-01',
    standardCode: 'NC.4.NBT.1',
    domainId: 'NBT',
    prompt:
      'In 55,000, the value of the 5 in the ten thousands place is how many times the value of the 5 in the thousands place?',
    options: labelOptions([
      // 10 × 10 = 100: the one-place shift was counted twice, as though the
      // two 5s were two columns apart instead of side by side.
      { text: '100 times', isCorrect: false, misconception: 'wrong-power-of-ten' },
      { text: '10 times', isCorrect: true },
      // The thousands place is worth 1,000, and that place value was handed
      // back as the scale factor instead of the ratio 50,000 ÷ 5,000.
      { text: '1,000 times', isCorrect: false, misconception: 'used-place-value-as-the-factor' },
      // 50,000 - 5,000 = 45,000: answered "how much more" when the question
      // asked "how many times".
      {
        text: '45,000 times',
        isCorrect: false,
        misconception: 'additive-instead-of-multiplicative-relationship',
      },
    ]),
    calculatorAllowed: false,
    isStretch: false,
    difficulty: 'mastery',
    explanation: {
      stepByStep: [
        'Step 1: Find what each 5 is worth. The 5 in the ten thousands place is worth 50,000.',
        'Step 2: The 5 in the thousands place, one column to its right, is worth 5,000.',
        'Step 3: "How many times" asks for the unknown factor in 5,000 × n = 50,000, so divide: 50,000 ÷ 5,000 = 10.',
        'Step 4: The 5 in the ten thousands place is worth 10 times as much as the 5 in the thousands place.',
      ],
      conceptSummary:
        'Every place is worth ten times the place to its right, so the same digit written one column further left is worth ten times as much. That single relationship is what builds the whole base-ten system.',
      commonMisconception:
        'Subtracting gives 45,000, which answers how much BIGGER one value is, not how many TIMES bigger.',
    },
  },
  {
    id: 'g4-nbt1-02',
    standardCode: 'NC.4.NBT.1',
    domainId: 'NBT',
    prompt:
      'In 3,300, the 3 in the thousands place has a value of 3,000 and the 3 in the hundreds place has a value of 300. Which sentence describes the relationship between those two values?',
    options: labelOptions([
      { text: '3,000 is 10 times as much as 300', isCorrect: true },
      // Counted the shift as two places rather than one; 100 times 300 is
      // 30,000, not 3,000.
      {
        text: '3,000 is 100 times as much as 300',
        isCorrect: false,
        misconception: 'wrong-power-of-ten',
      },
      // The relationship read from right to left: the smaller value named as
      // the ten-times-bigger one.
      {
        text: '300 is 10 times as much as 3,000',
        isCorrect: false,
        misconception: 'place-value-shift-wrong-direction',
      },
      // 3,000 - 300 = 2,700: an added difference where a multiplicative
      // relationship was asked for.
      {
        text: '3,000 is 2,700 more than 300',
        isCorrect: false,
        misconception: 'additive-instead-of-multiplicative-relationship',
      },
    ]),
    calculatorAllowed: false,
    isStretch: false,
    difficulty: 'mastery',
    explanation: {
      stepByStep: [
        'Step 1: The two values are 3,000 and 300, and 3,000 is the larger one.',
        'Step 2: Ask what 300 must be multiplied by to reach 3,000: 300 × 10 = 3,000.',
        'Step 3: The thousands place sits one column to the LEFT of the hundreds place, and one column left always means ten times as much.',
        'Step 4: So 3,000 is 10 times as much as 300.',
      ],
      conceptSummary:
        'NC.4.NBT.1 asks a student to explain the relationship between adjacent places, not only to name them. Left is ten times bigger; right is ten times smaller; the direction is half the statement.',
      commonMisconception:
        'Saying "300 is 10 times as much as 3,000" gets the factor right and the direction backwards, which makes the smaller number the bigger one.',
    },
  },
  {
    id: 'g4-nbt1-03',
    standardCode: 'NC.4.NBT.1',
    domainId: 'NBT',
    prompt:
      'In 66,000, the 6 in the ten thousands place has a value of 60,000. What is the value of the 6 in the place to its RIGHT?',
    options: labelOptions([
      // 60,000 × 10 = 600,000: moved one column to the LEFT instead of the
      // right, so the value grew where it should have shrunk.
      {
        text: '600,000',
        isCorrect: false,
        misconception: 'place-value-shift-wrong-direction',
      },
      // Reported the digit itself where the amount it stands for was asked
      // for.
      { text: '6', isCorrect: false, misconception: 'wrote-the-digit-not-its-value' },
      { text: '6,000', isCorrect: true },
      // 60,000 ÷ 10 ÷ 10 = 600: counted two columns to the right instead of
      // one.
      { text: '600', isCorrect: false, misconception: 'wrong-power-of-ten' },
    ]),
    calculatorAllowed: false,
    isStretch: false,
    difficulty: 'advanced',
    explanation: {
      stepByStep: [
        'Step 1: The place to the right of the ten thousands place is the thousands place, and 66,000 has a 6 there too.',
        'Step 2: A digit one place to the right is worth one tenth as much, because the place to its LEFT is worth ten times as much.',
        'Step 3: 60,000 ÷ 10 = 6,000.',
        'Step 4: The 6 in the thousands place is worth 6,000.',
      ],
      conceptSummary:
        'The 10-times rule runs both ways: reading it left to right multiplies by 10, and reading it right to left divides by 10. The same two 6s carry completely different amounts.',
      commonMisconception:
        'Answering 6 gives the digit rather than its value; the digit is the same in both places, and telling them apart is the entire point of the standard.',
    },
  },

  // ==========================================
  // Standard: NC.4.NBT.2 — Read & Write Numbers to 100,000
  // ==========================================
  {
    id: 'g4-nbt2-01',
    standardCode: 'NC.4.NBT.2',
    domainId: 'NBT',
    prompt: 'Which numeral is the number name forty thousand, ninety-three?',
    options: labelOptions([
      // Wrote 9 and 3 straight after the comma, so the zero that has to hold
      // the empty hundreds place was pushed down into the ones place instead:
      // 40,930.
      { text: '40,930', isCorrect: false, misconception: 'skipped-the-zero-place' },
      // Wrote "forty thousand" with the 4 in the thousands place rather than
      // the ten thousands place, making the number ten times too small.
      { text: '4,093', isCorrect: false, misconception: 'wrong-power-of-ten' },
      // Wrote the thousands part and stopped there; the ninety-three was
      // never written at all.
      { text: '40,000', isCorrect: false, misconception: 'forgot-the-final-step' },
      { text: '40,093', isCorrect: true },
    ]),
    calculatorAllowed: false,
    isStretch: false,
    difficulty: 'mastery',
    explanation: {
      stepByStep: [
        'Step 1: "Forty thousand" fills the thousands period: 4 ten thousands and 0 thousands, written 40 before the comma.',
        'Step 2: "Ninety-three" is 93, which needs the tens and ones places.',
        'Step 3: That leaves the hundreds place empty, and an empty place is written 0 — without it the 9 and 3 slide one column to the left.',
        'Step 4: The number is 40,093.',
      ],
      conceptSummary:
        'A number name says which places are FILLED; a numeral has to show every place, including the empty ones. The zero is not a spare digit, it is what holds the other digits where they belong.',
      commonMisconception:
        'Writing the digits in the order you hear them gives 40,930, a number nearly a thousand larger, because nothing is holding the hundreds place.',
    },
  },
  {
    id: 'g4-nbt2-02',
    standardCode: 'NC.4.NBT.2',
    domainId: 'NBT',
    prompt: 'Which number name matches 30,506?',
    options: labelOptions([
      { text: 'thirty thousand, five hundred six', isCorrect: true },
      // Read the 3 as though it sat in the thousands place instead of the ten
      // thousands place, naming 3,506.
      {
        text: 'three thousand, five hundred six',
        isCorrect: false,
        misconception: 'wrong-power-of-ten',
      },
      // Read 506 as 56, closing up the zero that holds the tens place, and
      // named 30,056.
      {
        text: 'thirty thousand, fifty-six',
        isCorrect: false,
        misconception: 'skipped-the-zero-place',
      },
      // Closed up the other zero instead: read 305 as 35 and named 35,006.
      {
        text: 'thirty-five thousand, six',
        isCorrect: false,
        misconception: 'skipped-the-zero-place',
      },
    ]),
    calculatorAllowed: false,
    isStretch: false,
    difficulty: 'mastery',
    explanation: {
      stepByStep: [
        'Step 1: Split the numeral at the comma: 30 thousands, then 506.',
        'Step 2: 30 thousands is read "thirty thousand" — the 3 is in the ten thousands place and the thousands place is empty.',
        'Step 3: 506 is 5 hundreds, 0 tens and 6 ones, read "five hundred six". The empty tens place is simply not said aloud.',
        'Step 4: 30,506 is read thirty thousand, five hundred six.',
      ],
      conceptSummary:
        'Reading a numeral aloud drops the empty places, which is exactly why writing one back down is the harder direction: the reader has to remember to put the zeros back.',
      commonMisconception:
        '"Thirty-five thousand, six" comes from reading 3 and 5 as neighbours. They are not — a zero sits between them, and it is worth a whole place.',
    },
  },
  {
    id: 'g4-nbt2-03',
    standardCode: 'NC.4.NBT.2',
    domainId: 'NBT',
    prompt: 'A number is written in expanded form as 90,000 + 600 + 2. Which numeral is that number?',
    options: labelOptions([
      // Wrote only the digits that were named — 9, 6 and 2 — so nothing held
      // the empty thousands and tens places.
      { text: '962', isCorrect: false, misconception: 'skipped-the-zero-place' },
      { text: '90,602', isCorrect: true },
      // 90,000 + 60 + 2: the 600 was written into the tens place, one column
      // too low.
      { text: '90,062', isCorrect: false, misconception: 'wrong-power-of-ten' },
      // Wrote the first part of the sum and stopped, never adding the 600 and
      // the 2.
      { text: '90,000', isCorrect: false, misconception: 'forgot-the-final-step' },
    ]),
    calculatorAllowed: false,
    isStretch: false,
    difficulty: 'mastery',
    explanation: {
      stepByStep: [
        'Step 1: Each part of the expanded form names one place: 90,000 is 9 ten thousands, 600 is 6 hundreds, 2 is 2 ones.',
        'Step 2: The thousands place and the tens place are not named, so both hold 0.',
        'Step 3: Write the five places in order: 9 ten thousands, 0 thousands, 6 hundreds, 0 tens, 2 ones.',
        'Step 4: The numeral is 90,602.',
      ],
      conceptSummary:
        'Expanded form lists only the places that carry something. Turning it back into a numeral means restoring every place it stayed silent about, in order, with a zero.',
      commonMisconception:
        'Writing just the digits that appear gives 962 — a number about a hundred times too small, because two empty places were never held open.',
    },
  },

  // ==========================================
  // Standard: NC.4.NBT.7 — Compare Multi-Digit Numbers to 100,000
  // ==========================================
  {
    id: 'g4-nbt7-01',
    standardCode: 'NC.4.NBT.7',
    domainId: 'NBT',
    prompt: 'Which comparison is true?',
    options: labelOptions([
      { text: '62,408 < 62,480', isCorrect: true },
      // Compared the ones digits first: 8 is more than 0, so 62,408 was called
      // the larger number.
      {
        text: '62,408 > 62,480',
        isCorrect: false,
        misconception: 'compared-the-wrong-place-first',
      },
      // The 6, the 2 and the 4 match, and the comparison stopped there —
      // before reaching the tens place, where 0 and 8 finally differ.
      {
        text: '62,408 = 62,480',
        isCorrect: false,
        misconception: 'stopped-comparing-too-soon',
      },
      // 8 is more than 6, so the four-digit number was called the greater one
      // without counting that 8,997 has one place fewer.
      {
        text: '8,997 > 62,480',
        isCorrect: false,
        misconception: 'compared-leading-digits-without-place-value',
      },
    ]),
    calculatorAllowed: false,
    isStretch: false,
    difficulty: 'mastery',
    explanation: {
      stepByStep: [
        'Step 1: Count places first. 8,997 has four digits and both other numbers have five, so 8,997 is smaller than either of them.',
        'Step 2: Compare 62,408 and 62,480 from the greatest place: 6 = 6, 2 = 2, 4 = 4.',
        'Step 3: Keep going to the tens place, the first place where they differ: 0 tens against 8 tens.',
        'Step 4: 0 is less than 8, so 62,408 < 62,480.',
      ],
      conceptSummary:
        'Comparing means working left to right and stopping at the first place where the digits differ. Everything to the right of that place is irrelevant — 80 more can never overturn a difference of 80 in the tens.',
      commonMisconception:
        'Starting at the ones digit gets this exactly backwards, because 8 ones look bigger than 0 ones while 0 tens are what actually decide it.',
    },
  },
  {
    id: 'g4-nbt7-02',
    standardCode: 'NC.4.NBT.7',
    domainId: 'NBT',
    prompt:
      'Three towns recorded their populations as 71,036; 71,360; and 9,984. Which list shows the three populations in order from GREATEST to LEAST?',
    options: labelOptions([
      // Ordered by the ones digit: 6, then 4, then 0.
      {
        text: '71,036; 9,984; 71,360',
        isCorrect: false,
        misconception: 'compared-the-wrong-place-first',
      },
      // The correct order, run from least to greatest when greatest to least
      // was asked for.
      {
        text: '9,984; 71,036; 71,360',
        isCorrect: false,
        misconception: 'ordered-from-the-wrong-end',
      },
      { text: '71,360; 71,036; 9,984', isCorrect: true },
      // 9 beats 7, so 9,984 was put first without counting that it has four
      // places against the others' five.
      {
        text: '9,984; 71,360; 71,036',
        isCorrect: false,
        misconception: 'compared-leading-digits-without-place-value',
      },
    ]),
    calculatorAllowed: false,
    isStretch: false,
    difficulty: 'mastery',
    explanation: {
      stepByStep: [
        'Step 1: 9,984 has four digits; the other two have five. Any five-digit number is at least 10,000, so 9,984 is the least of the three.',
        'Step 2: 71,036 and 71,360 agree in the ten thousands place (7) and the thousands place (1).',
        'Step 3: The hundreds place decides it: 0 hundreds against 3 hundreds, so 71,036 is less than 71,360.',
        'Step 4: From greatest to least: 71,360; 71,036; 9,984.',
      ],
      conceptSummary:
        'How many places a number has settles a comparison before any digit is looked at. Only once two numbers have the same number of places does the digit-by-digit comparison begin.',
      commonMisconception:
        'A leading 9 makes 9,984 look like the biggest number on the page; it is the smallest, by about 61,000.',
    },
  },
  {
    id: 'g4-nbt7-03',
    standardCode: 'NC.4.NBT.7',
    domainId: 'NBT',
    prompt:
      'Which list shows 60,318; 6,894; 60,381; and 59,997 in order from LEAST to GREATEST?',
    options: labelOptions([
      // Compared the leading digits without counting places: 5 is the
      // smallest first digit, so 59,997 went first, and 6,894 went last
      // because its second digit, 8, beats the 0 in both 60,318 and 60,381.
      {
        text: '59,997; 60,318; 60,381; 6,894',
        isCorrect: false,
        misconception: 'compared-leading-digits-without-place-value',
      },
      // Ordered by the ones digit: 1, then 4, then 7, then 8.
      {
        text: '60,381; 6,894; 59,997; 60,318',
        isCorrect: false,
        misconception: 'compared-the-wrong-place-first',
      },
      // The correct order, run from greatest to least.
      {
        text: '60,381; 60,318; 59,997; 6,894',
        isCorrect: false,
        misconception: 'ordered-from-the-wrong-end',
      },
      { text: '6,894; 59,997; 60,318; 60,381', isCorrect: true },
    ]),
    calculatorAllowed: false,
    isStretch: false,
    difficulty: 'advanced',
    explanation: {
      stepByStep: [
        'Step 1: 6,894 has four digits, so it is the least of the four no matter what it starts with.',
        'Step 2: Among the five-digit numbers, compare the ten thousands place: 5 in 59,997 against 6 in both 60,318 and 60,381, so 59,997 comes next.',
        'Step 3: 60,318 and 60,381 agree at 6, 0 and 3, so the tens place decides: 1 ten against 8 tens.',
        'Step 4: From least to greatest: 6,894; 59,997; 60,318; 60,381.',
      ],
      conceptSummary:
        'Ordering several numbers is the two-number comparison done repeatedly: count the places, then walk left to right to the first place where the digits disagree.',
      commonMisconception:
        'Reading the digits straight across without counting places puts 6,894 last, because its 8 beats the 0 in 60,318 — but those digits are not even in the same place.',
    },
  },

  // ==========================================
  // Standard: NC.4.NBT.4 — Add & Subtract Multi-Digit Numbers
  // ==========================================
  {
    id: 'g4-nbt4-01',
    standardCode: 'NC.4.NBT.4',
    domainId: 'NBT',
    prompt:
      'A stadium has 24,600 seats. For Friday night\'s game, 18,475 of the seats were filled. How many seats were empty?',
    options: labelOptions([
      // Every column took the smaller digit from the larger one, with no
      // regrouping anywhere: |0-5| = 5, |0-7| = 7, |6-4| = 2, |4-8| = 4,
      // |2-1| = 1, giving 14,275.
      {
        text: '14,275 seats',
        isCorrect: false,
        misconception: 'subtracted-without-regrouping',
      },
      { text: '6,125 seats', isCorrect: true },
      // The thousands column borrowed correctly (14 - 8 = 6) but the 2 in the
      // ten thousands place was never reduced to 1, so 2 - 1 = 1 was written
      // there instead of 0: 16,125.
      {
        text: '16,125 seats',
        isCorrect: false,
        misconception: 'borrowed-without-reducing-the-next-column',
      },
      // 24,600 + 18,475 = 43,075: added when the question asked what was left.
      { text: '43,075 seats', isCorrect: false, misconception: 'added-instead-of-subtracted' },
    ]),
    calculatorAllowed: false,
    isStretch: false,
    difficulty: 'mastery',
    explanation: {
      stepByStep: [
        'Step 1: Empty seats are total seats minus filled seats: 24,600 - 18,475.',
        'Step 2: The ones column needs a ten, and the tens column has none, so regroup from the hundreds: 600 becomes 5 hundreds, 9 tens and 10 ones. Then 10 - 5 = 5 and 9 - 7 = 2 and 5 - 4 = 1.',
        'Step 3: The thousands column needs a thousand: 4 becomes 14, and the ten thousands drop from 2 to 1. Then 14 - 8 = 6 and 1 - 1 = 0.',
        'Step 4: 24,600 - 18,475 = 6,125, so 6,125 seats were empty.',
      ],
      conceptSummary:
        'Regrouping moves a value from one place to the next without changing the number: ten of anything becomes one of the thing to its left. The digit you borrow from must go down at the same moment the digit you borrow into goes up.',
      commonMisconception:
        'Adding the answer back to 18,475 should give 24,600 exactly. It catches 16,125 at once: that total would come to 34,600.',
    },
  },
  {
    id: 'g4-nbt4-02',
    standardCode: 'NC.4.NBT.4',
    domainId: 'NBT',
    prompt:
      'A museum counted 36,847 visitors in June and 28,596 visitors in July. How many visitors did it count over the two months?',
    options: labelOptions([
      // Every carry dropped: 7+6 = 13 write 3, 4+9 = 13 write 3, 8+5 = 13
      // write 3, 6+8 = 14 write 4, 3+2 = 5, giving 54,333.
      { text: '54,333 visitors', isCorrect: false, misconception: 'added-without-carrying' },
      // 36,847 - 28,596 = 8,251: subtracted when the two months had to be
      // combined.
      { text: '8,251 visitors', isCorrect: false, misconception: 'subtracted-instead-of-added' },
      { text: '65,443 visitors', isCorrect: true },
      // The carry out of the hundreds column (8+5+1 = 14) was written above
      // the ten thousands column instead of the thousands column: the
      // thousands then gave 6+8 = 14, write 4 carry 1, and the ten thousands
      // gave 3+2+1+1 = 7, for 74,443.
      {
        text: '74,443 visitors',
        isCorrect: false,
        misconception: 'carried-into-the-wrong-column',
      },
    ]),
    calculatorAllowed: false,
    isStretch: false,
    difficulty: 'mastery',
    explanation: {
      stepByStep: [
        'Step 1: Over two months means the two counts are combined: 36,847 + 28,596.',
        'Step 2: Ones: 7 + 6 = 13, write 3 and carry 1 into the tens. Tens: 4 + 9 + 1 = 14, write 4 and carry 1 into the hundreds.',
        'Step 3: Hundreds: 8 + 5 + 1 = 14, write 4 and carry 1 into the thousands. Thousands: 6 + 8 + 1 = 15, write 5 and carry 1 into the ten thousands.',
        'Step 4: Ten thousands: 3 + 2 + 1 = 6, so the museum counted 65,443 visitors.',
      ],
      conceptSummary:
        'A carry is ten of one place becoming one of the next place left — which is why it lands in the column immediately beside it and never one column further along.',
      commonMisconception:
        'Rounding checks the answer: 37,000 + 29,000 is about 66,000. That single estimate rules out 54,333 and 74,443 without adding anything twice.',
    },
  },
  {
    id: 'g4-nbt4-03',
    standardCode: 'NC.4.NBT.4',
    domainId: 'NBT',
    prompt:
      'A library had 50,000 books. It gave 12,485 books to other branches and then received 3,260 new books. How many books does the library have now?',
    options: labelOptions([
      { text: '40,775 books', isCorrect: true },
      // 50,000 - 12,485 = 37,515: answered the first step and stopped before
      // adding the new books.
      { text: '37,515 books', isCorrect: false, misconception: 'forgot-the-final-step' },
      // 37,515 - 3,260 = 34,255: the new books were taken away as well,
      // instead of added.
      { text: '34,255 books', isCorrect: false, misconception: 'subtracted-instead-of-added' },
      // 50,000 - 12,485 worked column by column with no regrouping gives
      // |0-5| = 5, |0-8| = 8, |0-4| = 4, |0-2| = 2, |5-1| = 4, that is 42,485;
      // then 42,485 + 3,260 = 45,745.
      {
        text: '45,745 books',
        isCorrect: false,
        misconception: 'subtracted-without-regrouping',
      },
    ]),
    calculatorAllowed: false,
    isStretch: false,
    difficulty: 'advanced',
    explanation: {
      stepByStep: [
        'Step 1: Books given away are taken off the total: 50,000 - 12,485.',
        'Step 2: Every column of 50,000 below the ten thousands is a zero, so the regrouping runs the whole way across: 50,000 becomes 4 ten thousands, 9 thousands, 9 hundreds, 9 tens and 10 ones. That gives 37,515.',
        'Step 3: The new books are added on: 37,515 + 3,260.',
        'Step 4: 37,515 + 3,260 = 40,775, so the library has 40,775 books.',
      ],
      conceptSummary:
        'Subtracting across a row of zeros is one regrouping passed along: there is nothing in the tens or hundreds to borrow from, so the ten thousands place has to supply all of them at once.',
      commonMisconception:
        'Stopping at 37,515 answers what the library had after giving books away, which is the middle of the story rather than the end of it.',
    },
  },

  // ==========================================
  // Standard: NC.4.NBT.5 — Multiply Multi-Digit Whole Numbers
  // ==========================================
  {
    id: 'g4-nbt5-01',
    standardCode: 'NC.4.NBT.5',
    domainId: 'NBT',
    prompt:
      'A warehouse has 8 shelves, and each shelf holds 247 boxes. How many boxes does the warehouse hold in all?',
    options: labelOptions([
      // Each carry added into the next digit BEFORE multiplying it: ones
      // 7 × 8 = 56, write 6 carry 5; tens (4+5) × 8 = 72, write 2 carry 7;
      // hundreds (2+7) × 8 = 72. That reads 7,226.
      { text: '7,226 boxes', isCorrect: false, misconception: 'added-carry-before-multiplying' },
      // Each digit multiplied on its own with only the ones digit of each
      // product written down: 7 × 8 = 56 → 6, 4 × 8 = 32 → 2, 2 × 8 = 16 → 6,
      // giving 626.
      {
        text: '626 boxes',
        isCorrect: false,
        misconception: 'multiplied-each-digit-without-carrying',
      },
      // 247 + 8 = 255: added the two numbers in the problem.
      { text: '255 boxes', isCorrect: false, misconception: 'added-instead-of-multiplied' },
      { text: '1,976 boxes', isCorrect: true },
    ]),
    calculatorAllowed: false,
    isStretch: false,
    difficulty: 'mastery',
    explanation: {
      stepByStep: [
        'Step 1: Eight shelves of 247 boxes each is 247 × 8.',
        'Step 2: Break 247 apart by place value: 200 + 40 + 7.',
        'Step 3: 200 × 8 = 1,600, 40 × 8 = 320, and 7 × 8 = 56.',
        'Step 4: 1,600 + 320 + 56 = 1,976, so the warehouse holds 1,976 boxes.',
      ],
      conceptSummary:
        'Partial products show what the standard algorithm is doing underneath: each digit of 247 is multiplied at its own place value, and the three results are added.',
      commonMisconception:
        'A carry is added AFTER the next column is multiplied, never before. Adding it first turns 40 × 8 into 90 × 8 and inflates the answer to 7,226.',
    },
  },
  {
    id: 'g4-nbt5-02',
    standardCode: 'NC.4.NBT.5',
    domainId: 'NBT',
    prompt: 'A theater has 36 rows of seats with 24 seats in each row. How many seats does the theater have?',
    options: labelOptions([
      // 36 × 4 = 144 for the ones row, and the tens row written as 36 × 2 = 72
      // without its placeholder zero: 144 + 72 = 216.
      { text: '216 seats', isCorrect: false, misconception: 'dropped-partial-product-zero' },
      { text: '864 seats', isCorrect: true },
      // 36 × 4 = 144: the ones row was found and reported as the product, with
      // the tens row never written.
      { text: '144 seats', isCorrect: false, misconception: 'forgot-the-final-step' },
      // 36 × 20 = 720, then the 4 was ADDED instead of multiplied: 720 + 4.
      {
        text: '724 seats',
        isCorrect: false,
        misconception: 'added-the-ones-digit-instead-of-multiplying',
      },
    ]),
    calculatorAllowed: false,
    isStretch: false,
    difficulty: 'mastery',
    explanation: {
      stepByStep: [
        'Step 1: 36 rows of 24 seats is 36 × 24.',
        'Step 2: Break 24 apart by place value: 24 = 20 + 4.',
        'Step 3: 36 × 4 = 144, and 36 × 20 = 720 — twenty of them, not two, which is what the placeholder zero records.',
        'Step 4: 144 + 720 = 864, so the theater has 864 seats.',
      ],
      conceptSummary:
        'Multiplying by a two-digit number is two multiplications added together, one for each place of the second factor. The second row counts TENS of the first factor, which is why it ends in a zero.',
      commonMisconception:
        'An estimate catches a dropped placeholder zero: 36 × 24 is close to 40 × 25 = 1,000, so 216 is nowhere near right.',
    },
  },
  {
    id: 'g4-nbt5-03',
    standardCode: 'NC.4.NBT.5',
    domainId: 'NBT',
    prompt:
      'Ravi is multiplying 53 × 27 with partial products. He has written 53 × 7 = 371, and then he multiplied 53 by the 2 in 27 and got 106. What is 53 × 27?',
    options: labelOptions([
      { text: '1,431', isCorrect: true },
      // 371 + 106 = 477: Ravi's second row was kept as 53 × 2 instead of
      // 53 × 20, so the tens partial product lost its placeholder zero.
      { text: '477', isCorrect: false, misconception: 'dropped-partial-product-zero' },
      // Reported the ones row on its own and never added the tens row.
      { text: '371', isCorrect: false, misconception: 'forgot-the-final-step' },
      // 53 × 30 = 1,590: rounded 27 up to 30 and reported the estimate as the
      // product.
      { text: '1,590', isCorrect: false, misconception: 'reported-the-estimate' },
    ]),
    calculatorAllowed: false,
    isStretch: false,
    difficulty: 'advanced',
    explanation: {
      stepByStep: [
        'Step 1: The 2 in 27 is 2 TENS, so the second partial product is 53 × 20, not 53 × 2.',
        'Step 2: Ravi\'s 106 is 53 × 2. Multiplying by twenty instead of two makes it ten times larger: 53 × 20 = 1,060.',
        'Step 3: Add the two partial products: 371 + 1,060.',
        'Step 4: 53 × 27 = 1,431.',
      ],
      conceptSummary:
        'A digit in the tens place of a factor contributes tens, not ones. Finding 53 × 2 is a perfectly good intermediate step — it just has to be scaled by ten before it is added in.',
      commonMisconception:
        'Adding 371 + 106 gives 477, which is less than 53 × 10. Checking the answer against 50 × 27 = 1,350 rules it out immediately.',
    },
  },

  // ==========================================
  // Standard: NC.4.NBT.6 — Divide by One-Digit Divisors with Remainders
  // ==========================================
  {
    id: 'g4-nbt6-01',
    standardCode: 'NC.4.NBT.6',
    domainId: 'NBT',
    prompt:
      'A baker has 175 rolls and packs them into bags of 6. How many rolls are left over after he fills as many bags as he can?',
    options: labelOptions([
      // 175 ÷ 6 = 29 R 1: the quotient was reported where the question asked
      // for the leftover, so the remainder was thrown away.
      { text: '29 rolls', isCorrect: false, misconception: 'ignored-remainder' },
      // The raw result handed back without deciding which part of it the
      // question was asking for.
      {
        text: '29 R 1 rolls',
        isCorrect: false,
        misconception: 'reported-remainder-without-interpreting',
      },
      { text: '1 roll', isCorrect: true },
      // Partial quotients stopped at 6 × 28 = 168, leaving 175 - 168 = 7 —
      // but 7 is more than 6, so another whole bag still fits.
      { text: '7 rolls', isCorrect: false, misconception: 'forgot-the-final-step' },
    ]),
    calculatorAllowed: false,
    isStretch: false,
    difficulty: 'mastery',
    explanation: {
      stepByStep: [
        'Step 1: Filling bags of 6 from 175 rolls is 175 ÷ 6.',
        'Step 2: 6 × 29 = 174, the largest multiple of 6 that is not more than 175.',
        'Step 3: 175 - 174 = 1, and 1 is less than 6, so no further bag can be filled: 175 ÷ 6 = 29 R 1.',
        'Step 4: The baker fills 29 bags, and 1 roll is left over.',
      ],
      conceptSummary:
        'One division answers two different questions. Here 29 is how many bags and 1 is how many rolls are left; the question decides which half of "29 R 1" to report.',
      commonMisconception:
        'Stopping at 6 × 28 = 168 leaves 7 rolls, and 7 is more than 6 — a remainder larger than the divisor always means another group still fits.',
    },
  },
  {
    id: 'g4-nbt6-02',
    standardCode: 'NC.4.NBT.6',
    domainId: 'NBT',
    prompt:
      'A school has 824 pencils to share equally among 4 classrooms. How many pencils does each classroom get?',
    options: labelOptions([
      // 8 hundreds ÷ 4 = 2 hundreds, then 2 tens will not make a group of 4,
      // and no 0 was recorded in the tens place of the quotient, so the
      // answer was written as 26.
      { text: '26 pencils', isCorrect: false, misconception: 'dropped-zero-in-quotient' },
      // 824 × 4 = 3,296: multiplied where the sharing called for division.
      { text: '3,296 pencils', isCorrect: false, misconception: 'multiplied-instead-of-divided' },
      // 824 - 4 = 820: subtracted the number of classrooms instead of
      // dividing by it.
      { text: '820 pencils', isCorrect: false, misconception: 'subtracted-instead-of-divided' },
      { text: '206 pencils', isCorrect: true },
    ]),
    calculatorAllowed: false,
    isStretch: false,
    difficulty: 'mastery',
    explanation: {
      stepByStep: [
        'Step 1: Sharing 824 pencils equally among 4 classrooms is 824 ÷ 4.',
        'Step 2: 800 ÷ 4 = 200, so the quotient starts with 2 hundreds.',
        'Step 3: The 2 tens that are left cannot make a group of 4 tens, so the tens place of the quotient is 0 — that zero has to be written, or everything after it slides left.',
        'Step 4: 24 ÷ 4 = 6, so 824 ÷ 4 = 206 and each classroom gets 206 pencils.',
      ],
      conceptSummary:
        'A quotient has a digit for every place of the dividend that was divided, including the places where the answer is zero. Leaving a zero out shrinks the quotient by a factor of ten.',
      commonMisconception:
        '26 × 4 = 104, nowhere near 824. Multiplying the quotient back by the divisor catches a dropped zero in one step.',
    },
  },
  {
    id: 'g4-nbt6-03',
    standardCode: 'NC.4.NBT.6',
    domainId: 'NBT',
    prompt:
      'A camp has 138 campers. Each cabin sleeps 8 campers. How many cabins are needed so that every camper has a bed?',
    options: labelOptions([
      // 138 ÷ 8 = 17 R 2: the remainder was dropped, which leaves 2 campers
      // with nowhere to sleep.
      { text: '17 cabins', isCorrect: false, misconception: 'ignored-remainder' },
      { text: '18 cabins', isCorrect: true },
      // The raw result handed back without asking what 2 leftover campers
      // mean for the number of cabins.
      {
        text: '17 R 2 cabins',
        isCorrect: false,
        misconception: 'reported-remainder-without-interpreting',
      },
      // Partial quotients stopped at 8 × 16 = 128, leaving 138 - 128 = 10 —
      // and 10 is more than 8, so another full cabin still fits.
      { text: '16 cabins', isCorrect: false, misconception: 'forgot-the-final-step' },
    ]),
    calculatorAllowed: false,
    isStretch: false,
    difficulty: 'advanced',
    explanation: {
      stepByStep: [
        'Step 1: Dividing the campers among cabins of 8 is 138 ÷ 8.',
        'Step 2: 8 × 17 = 136, and 138 - 136 = 2, so 138 ÷ 8 = 17 R 2.',
        'Step 3: Seventeen cabins sleep 136 campers, and 2 campers still have no bed.',
        'Step 4: Those 2 campers need a cabin of their own, so 18 cabins are needed.',
      ],
      conceptSummary:
        'Interpreting a remainder means asking what the leftover means in this situation. When everybody must be housed, the quotient rounds UP, even for a remainder of 2.',
      commonMisconception:
        'Answering 17 leaves two children without a bed; a remainder that represents people always needs a place of its own.',
    },
  },
];
