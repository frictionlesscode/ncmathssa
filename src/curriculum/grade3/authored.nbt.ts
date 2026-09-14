import type { Question } from '../../engine/questionModel';
import { labelOptions } from '../../engine/questionModel';

/**
 * The authored Grade 3 Number & Operations in Base Ten bank.
 *
 * Grade 3 NBT is a two-standard domain carrying a 9–13% band, so almost all of
 * it is NC.3.NBT.2. Scope is bounded by the sourced NCDPI wording in
 * `./standards.ts`:
 *
 *   NC.3.NBT.2 — add and subtract whole numbers up to and including 1,000,
 *                with three keyConcepts: use ESTIMATION STRATEGIES to assess
 *                the reasonableness of answers; model and explain how the
 *                RELATIONSHIP BETWEEN ADDITION AND SUBTRACTION can be applied;
 *                use EXPANDED FORM to decompose numbers and then find sums and
 *                differences.
 *   NC.3.NBT.3 — the product of a one-digit whole number by a MULTIPLE OF 10
 *                IN THE RANGE 10–90, using concrete and pictorial models based
 *                on place value and the properties of operations.
 *
 * And nothing else. Three boundaries are worth stating out loud:
 *
 *  - THERE IS NO ROUNDING HERE. CCSS 3.NBT.A.1 is "use place value
 *    understanding to round whole numbers to the nearest 10 or 100"; NC has no
 *    rounding standard at any grade in this plan, and the plan's Global
 *    Constraints record that a rounding standard written from recall has
 *    already shipped once. A rounding item would be on-code and off-standard,
 *    which passes every other test in the suite. The sibling test scans every
 *    item for the word.
 *
 *    That is not the same as excluding estimation. NC.3.NBT.2's own first
 *    keyConcept is estimation for reasonableness, so `g3-nbt2-01` estimates —
 *    but it does it the way the standard does, by asking which hundred each
 *    number is CLOSE TO and adding those, not by applying a rounding rule.
 *
 *  - NC.3.NBT.2 IS NOT "DO THE ALGORITHM". Its three keyConcepts are
 *    estimation, the inverse relationship, and expanded form; none of them is
 *    "get the right sum". The two generators under `./templates/` carry the
 *    computation, so the four items here carry one keyConcept each (with the
 *    fourth applying the whole of it inside a word problem). The sibling test
 *    asserts all three appear, because three fluency items would mark the
 *    standard covered with two thirds of its sourced text unwritten.
 *
 *  - NC.3.NBT.3's multiple of 10 is IN THE RANGE 10–90, so the largest legal
 *    product is 9 × 90 = 810 — which `g3-nbt3-03` deliberately sits on. A
 *    multiple of 100, or a two-digit second factor that is not a multiple of
 *    10, is NC.4.NBT.5 a grade on.
 *
 * Every incorrect option is the value a Grade 3 student actually arrives at by
 * making one named error, with a `//` comment above it showing the arithmetic.
 * Age note: these are read by an eight-year-old — short sentences, one clause
 * each, and every number inside the standard's stated range.
 *
 * The correct option sits at a varied position and is never always A.
 */
export const GRADE_3_NBT_AUTHORED: Question[] = [
  // ==========================================
  // Standard: NC.3.NBT.2 — Add & Subtract within 1,000
  // ==========================================
  {
    id: 'g3-nbt2-01',
    standardCode: 'NC.3.NBT.2',
    domainId: 'NBT',
    // keyConcept 1: "Use estimation strategies to assess reasonableness of
    // answers." No generator can ask this, because the whole question is which
    // easier numbers to put in place of the given ones.
    prompt:
      'Lena wants to estimate 512 + 289 before she adds. She uses the hundred that each number is closest to. Which estimate should she get?',
    options: labelOptions([
      // 500 + 200 = 700: kept the hundreds digit of each number and threw the
      // 12 and the 89 away, so the estimate comes out low.
      { text: '700', isCorrect: false, misconception: 'used-only-the-hundreds-digit' },
      // 600 + 300 = 900: moved both numbers up to the next hundred, but 512 is
      // closest to 500, not to 600.
      { text: '900', isCorrect: false, misconception: 'took-both-numbers-up-to-the-next-hundred' },
      { text: '800', isCorrect: true },
      // 512 + 289 = 801: the exact sum, which is not an estimate and cannot be
      // used to check one.
      { text: '801', isCorrect: false, misconception: 'gave-the-exact-sum-instead-of-an-estimate' },
    ]),
    calculatorAllowed: false,
    isStretch: false,
    difficulty: 'mastery',
    explanation: {
      stepByStep: [
        'Step 1: 512 sits between 500 and 600. It is only 12 past 500, so 500 is the hundred it is closest to.',
        'Step 2: 289 sits between 200 and 300. It is only 11 away from 300, so 300 is the hundred it is closest to.',
        'Step 3: Add the two easy numbers: 500 + 300.',
        'Step 4: Lena should get the estimate 800.',
      ],
      conceptSummary:
        'An estimate is for checking, so it has to be made of numbers that are easy to add in your head. Each number is swapped for the nearest hundred first, and then the two hundreds are added.',
      commonMisconception:
        'Keeping only the hundreds digit turns 289 into 200 and loses almost a whole hundred, so the estimate lands 100 below the real sum instead of beside it.',
    },
  },
  {
    id: 'g3-nbt2-02',
    standardCode: 'NC.3.NBT.2',
    domainId: 'NBT',
    // keyConcept 2: "Model and explain how the relationship between addition
    // and subtraction can be applied to solve addition and subtraction
    // problems." The question is which equation CHECKS the work, not what the
    // difference is — so every option is a true-looking equation and only one
    // of them is a check.
    prompt: 'Tia worked out 742 − 268 and got 474. Which equation can she use to check her answer?',
    options: labelOptions([
      { text: '474 + 268 = 742', isCorrect: true },
      // 742 + 268 = 1,010: added the two numbers from the problem instead of
      // putting the answer back together with the part that was taken away.
      { text: '742 + 268 = 1,010', isCorrect: false, misconception: 'added-instead-of-subtracted' },
      // 474 + 742 = 1,216: picked up the number she started from instead of
      // the part she took away.
      { text: '474 + 742 = 1,216', isCorrect: false, misconception: 'used-the-wrong-given-quantity' },
      // 474 + 268 with no carrying: 4 + 8 = 12 written as 2, 7 + 6 = 13
      // written as 3, 4 + 2 = 6, giving 632. The right check, added wrong.
      { text: '474 + 268 = 632', isCorrect: false, misconception: 'added-without-carrying' },
    ]),
    calculatorAllowed: false,
    isStretch: false,
    difficulty: 'mastery',
    explanation: {
      stepByStep: [
        'Step 1: Subtracting takes a part away from a whole. Here 742 is the whole and 268 is the part taken away.',
        'Step 2: Adding puts the two parts back together. So the answer and the part taken away should rebuild the whole.',
        'Step 3: Add the answer to the part taken away: 474 + 268.',
        'Step 4: 474 + 268 = 742, and that is back where she started, so 474 + 268 = 742 is the check that works.',
      ],
      conceptSummary:
        'Addition and subtraction undo each other. That is what makes checking possible: if the answer and the part taken away add back up to the number you started with, the subtraction was right.',
      commonMisconception:
        'Adding the two numbers printed in the problem, 742 + 268, never uses the answer at all — so it cannot tell you whether the answer is right.',
    },
  },
  {
    id: 'g3-nbt2-03',
    standardCode: 'NC.3.NBT.2',
    domainId: 'NBT',
    // keyConcept 3: "Use expanded form to decompose numbers and then find sums
    // and differences." The decomposition is given, so the mathematics is
    // putting the pieces back together — including the 13 ones that have to
    // become one ten and three ones.
    prompt: 'Use the expanded form below to find 356 + 237.',
    promptDetails: '356 = 300 + 50 + 6\n237 = 200 + 30 + 7',
    options: labelOptions([
      // 500 + 80 + 3 = 583: the 13 ones were written as 3 and the ten inside
      // them was never added into the tens.
      { text: '583', isCorrect: false, misconception: 'added-without-carrying' },
      // 500 + 100 + 80 + 3 = 683: the ten from 6 + 7 was put in with the
      // hundreds instead of with the tens.
      { text: '683', isCorrect: false, misconception: 'carried-into-the-wrong-column' },
      // 500 + 80 = 580: stopped after the hundreds and the tens and never
      // added the ones.
      { text: '580', isCorrect: false, misconception: 'forgot-the-final-step' },
      { text: '593', isCorrect: true },
    ]),
    calculatorAllowed: false,
    isStretch: false,
    difficulty: 'advanced',
    explanation: {
      stepByStep: [
        'Step 1: Add the hundreds: 300 + 200 = 500.',
        'Step 2: Add the tens: 50 + 30 = 80.',
        'Step 3: Add the ones: 6 + 7 = 13. That is 1 ten and 3 ones, so the ten joins the tens: 80 + 10 = 90.',
        'Step 4: Put the pieces together: 500 + 90 + 3 = 593.',
      ],
      conceptSummary:
        'Expanded form splits a number into its hundreds, tens and ones so each place can be added on its own. Ten of any place becomes one of the next place left, which is why 13 ones turn into a ten and three ones.',
      commonMisconception:
        'Writing 13 ones as a 3 and moving on loses the ten hiding inside them, which is exactly the ten that makes 583 into 593.',
    },
  },
  {
    id: 'g3-nbt2-04',
    standardCode: 'NC.3.NBT.2',
    domainId: 'NBT',
    // Subtraction across a zero, inside a word problem the generator cannot
    // pose. 605 − 248 = 357.
    prompt:
      'A library has 605 books on its shelves. 248 of them are checked out. How many books are left on the shelves?',
    options: labelOptions([
      // Every column done smaller-from-larger: 8 − 5 = 3, 4 − 0 = 4, 6 − 2 = 4.
      { text: '443', isCorrect: false, misconception: 'subtracted-without-regrouping' },
      { text: '357', isCorrect: true },
      // Traded a hundred straight down to the ones past the 0: hundreds 5 − 2
      // = 3, tens left as 0 so 0 and 4 became 4, ones 15 − 8 = 7.
      { text: '347', isCorrect: false, misconception: 'lost-the-regrouping-across-a-zero' },
      // 605 + 248 = 853: added instead of taking away.
      { text: '853', isCorrect: false, misconception: 'added-instead-of-subtracted' },
    ]),
    calculatorAllowed: false,
    isStretch: false,
    difficulty: 'advanced',
    explanation: {
      stepByStep: [
        'Step 1: 605 is the whole collection and 248 are gone, so this is 605 − 248.',
        'Step 2: There are 5 ones and 8 are needed, and the tens place has a 0 to borrow from — so trade one hundred first: 605 is 5 hundreds, 10 tens and 5 ones.',
        'Step 3: Now trade one of those tens: 5 hundreds, 9 tens and 15 ones.',
        'Step 4: 15 − 8 = 7 ones, 9 − 4 = 5 tens, 5 − 2 = 3 hundreds, so 357 books are left.',
      ],
      conceptSummary:
        'A 0 in the tens has nothing to lend, so the trade has to come from the hundreds first. One hundred becomes ten tens, and then one of those tens becomes ten ones.',
      commonMisconception:
        'Trading a hundred straight into the ones and leaving the 0 alone skips a step: the hundred has to stop in the tens on its way, which is what turns the 0 into a 9.',
    },
  },

  // ==========================================
  // Standard: NC.3.NBT.3 — One-Digit Number × a Multiple of 10 (10–90)
  // ==========================================
  {
    id: 'g3-nbt3-01',
    standardCode: 'NC.3.NBT.3',
    domainId: 'NBT',
    prompt: 'A school buys 7 boxes of pencils. Each box holds 50 pencils. How many pencils is that?',
    options: labelOptions([
      // 7 × 5 = 35: multiplied by the 5 in the tens place but reported it as
      // ones, dropping the place the 5 was standing in.
      { text: '35', isCorrect: false, misconception: 'dropped-the-zero-from-the-multiple-of-ten' },
      // 7 + 50 = 57: added the two numbers instead of multiplying them.
      { text: '57', isCorrect: false, misconception: 'added-instead-of-multiplied' },
      // 6 × 50 = 300: skip counted by 50 but stopped one box early.
      { text: '300', isCorrect: false, misconception: 'skip-counted-one-group-short' },
      { text: '350', isCorrect: true },
    ]),
    calculatorAllowed: false,
    isStretch: false,
    difficulty: 'mastery',
    explanation: {
      stepByStep: [
        'Step 1: 7 boxes with 50 in each box is 7 × 50.',
        'Step 2: 50 is 5 tens, so this is 7 groups of 5 tens.',
        'Step 3: 7 × 5 tens = 35 tens.',
        'Step 4: 35 tens is 350, so there are 350 pencils.',
      ],
      conceptSummary:
        'A multiple of 10 is a number of TENS. Multiplying by it counts tens instead of ones, and 35 tens is written as 350 — the same digits, standing one place further left.',
      commonMisconception:
        'Answering 35 is the right count of the wrong unit: 35 is how many tens there are, not how many pencils.',
    },
  },
  {
    id: 'g3-nbt3-02',
    standardCode: 'NC.3.NBT.3',
    domainId: 'NBT',
    // The properties-of-operations half of the standard: a known fact scaled
    // by ten, rather than a fresh product.
    prompt: 'Ben already knows that 8 × 9 = 72. What is 8 × 90?',
    options: labelOptions([
      // 8 × 9 = 72: gave the fact back unchanged, as if 90 and 9 were the same
      // number.
      { text: '72', isCorrect: false, misconception: 'dropped-the-zero-from-the-multiple-of-ten' },
      { text: '720', isCorrect: true },
      // 8 + 90 = 98: added the two numbers instead of multiplying them.
      { text: '98', isCorrect: false, misconception: 'added-instead-of-multiplied' },
      // 7 × 90 = 630: skip counted by 90 but stopped one group early.
      { text: '630', isCorrect: false, misconception: 'skip-counted-one-group-short' },
    ]),
    calculatorAllowed: false,
    isStretch: false,
    difficulty: 'advanced',
    explanation: {
      stepByStep: [
        'Step 1: 90 is 9 tens, so 8 × 90 is 8 groups of 9 tens.',
        'Step 2: Ben already knows 8 × 9 = 72, so 8 groups of 9 tens is 72 tens.',
        'Step 3: 72 tens is 72 written one place to the left, with a 0 holding the ones place.',
        'Step 4: So 8 × 90 = 720.',
      ],
      conceptSummary:
        'A fact you already know does the work. Because 90 is ten times 9, the product 8 × 90 is ten times 8 × 9 — the same digits, counting tens instead of ones.',
      commonMisconception:
        'Answering 72 uses the fact but forgets what changed: the 9 became 9 TENS, and the answer has to grow by the same ten times.',
    },
  },
  {
    id: 'g3-nbt3-03',
    standardCode: 'NC.3.NBT.3',
    domainId: 'NBT',
    // The top of the sourced range: a multiple of 10 "in the range 10–90"
    // times a one-digit number is at most 9 × 90 = 810.
    prompt: 'A bookcase has 9 shelves. Each shelf holds 90 books. How many books does it hold in all?',
    options: labelOptions([
      // 9 + 90 = 99: added the two numbers instead of multiplying them.
      { text: '99', isCorrect: false, misconception: 'added-instead-of-multiplied' },
      // 9 × 9 = 81: multiplied by the 9 in the tens place but reported it as
      // ones.
      { text: '81', isCorrect: false, misconception: 'dropped-the-zero-from-the-multiple-of-ten' },
      { text: '810', isCorrect: true },
      // 8 × 90 = 720: skip counted by 90 but left one shelf out.
      { text: '720', isCorrect: false, misconception: 'skip-counted-one-group-short' },
    ]),
    calculatorAllowed: false,
    isStretch: false,
    difficulty: 'advanced',
    explanation: {
      stepByStep: [
        'Step 1: 9 shelves with 90 books on each is 9 × 90.',
        'Step 2: 90 is 9 tens, so this is 9 groups of 9 tens.',
        'Step 3: 9 × 9 tens = 81 tens.',
        'Step 4: 81 tens is 810, so the bookcase holds 810 books.',
      ],
      conceptSummary:
        'Every product in this standard is a one-digit number times a number of tens, so the answer is always some number of tens. 9 × 90 is the largest one there is: 81 tens, or 810.',
      commonMisconception:
        'Answering 81 stops at "81 tens" and never writes what 81 tens is worth.',
    },
  },
];
