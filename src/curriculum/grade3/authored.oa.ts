import type { Question } from '../../engine/questionModel';
import { labelOptions } from '../../engine/questionModel';

/**
 * The authored Grade 3 Operations & Algebraic Thinking bank.
 *
 * Every item is multiple choice, because the NC EOG and the CASE assessment
 * used for Single Subject Acceleration are multiple choice. Every incorrect
 * option is the value (or statement) a Grade 3 student actually arrives at by
 * making one specific, named error — never a filler number, and never the key
 * nudged by one to look plausible. The `//` comment above each wrong option
 * shows the arithmetic that produces it, and the `misconception` tag names the
 * error the app should tell the student to repair.
 *
 * Scope is bounded by the sourced NCDPI wording in `./standards.ts`, which
 * differs from Common Core's Grade 3 in more places than any other grade in
 * this plan. Nothing here asks beyond that text:
 *
 *   NC.3.OA.1 — interpret products with two factors up to and including 10;
 *               the factors as the number of equal groups and the number in
 *               each group; arrays, repeated addition, decomposing a factor,
 *               and the commutative and associative properties.
 *   NC.3.OA.2 — interpret quotients with a ONE-DIGIT divisor and a ONE-DIGIT
 *               quotient; the divisor and quotient as the number of equal
 *               groups and the number in each group; arrays, repeated addition
 *               or subtraction.
 *   NC.3.OA.3 — represent, interpret and solve ONE-STEP multiplication and
 *               division word problems, with a symbol for the unknown.
 *   NC.3.OA.6 — solve an unknown-factor problem using division strategies
 *               and/or by changing it to a multiplication problem; the two
 *               operations as inverses.
 *   NC.3.OA.7 — fluency with factors, quotients and divisors up to and
 *               including 10; the relationship between multiplication and
 *               division; the unknown in an equation relating three whole
 *               numbers.
 *   NC.3.OA.8 — TWO-STEP word problems using ADDITION, SUBTRACTION AND
 *               MULTIPLICATION, with equations using a symbol for the unknown.
 *   NC.3.OA.9 — interpret patterns of multiplication on a HUNDREDS BOARD
 *               AND/OR MULTIPLICATION TABLE.
 *
 * Two boundaries are worth stating out loud, because both are places the
 * Common Core version of the standard would lead an author astray:
 *
 *  - NC.3.OA.8 has NO DIVISION in it. CCSS 3.OA.8 says "the four operations";
 *    NC's says "using addition, subtraction, and multiplication". The
 *    wrong-order distractor on those items is therefore about doing the two
 *    STEPS in the wrong order, not about order of operations in an expression
 *    — evaluating a bare `3 + 4 × 2` is NC.5.OA.2, two grades on. The sibling
 *    test asserts no OA.8 item mentions division at all.
 *  - NC.3.OA.9 is "a hundreds board AND/OR multiplication table", so the bank
 *    carries both; a times-table-only bank would cover half the sourced text
 *    and still look complete. The sibling test asserts both halves appear.
 *
 * There is deliberately no "division is commutative" distractor anywhere here.
 * Answering `12 ÷ 3` as if it were `3 ÷ 12` gives 0.25, and a Grade 3 student
 * has no decimals, so it is not a value any child reaches and cannot honestly
 * be printed as an option. Where that error would have gone, the bank offers
 * the whole-number errors a child really makes: answering with the divisor,
 * reading the quotient as the total, or reading it as the leftover.
 *
 * Five of these seven standards also have a generator under `./templates/`.
 * An authored item a generator can also emit reaches the scheduler under two
 * review keys, so the child gets it twice; the sibling test sweeps 2,000 seeds
 * of every generator against these prompts. The authored items are therefore
 * written to do what a generator cannot — interpret, represent, choose the
 * operation, check the work, and explain a pattern.
 *
 * Age note: these are read by an eight-year-old. Short sentences, one clause
 * each, every number inside the standard's stated range, and no item that
 * needs a paragraph read before the arithmetic can start.
 *
 * The correct option is deliberately placed at a varied position; it is not
 * always A.
 */
export const GRADE_3_OA_AUTHORED: Question[] = [
  // ==========================================
  // Standard: NC.3.OA.1 — Multiplication as Equal Groups
  // ==========================================
  {
    id: 'g3-oa1-01',
    standardCode: 'NC.3.OA.1',
    domainId: 'OA',
    // "Decomposing a factor" is one of NC.3.OA.1's named strategies, and it is
    // the one no generator here covers: g3.oa1.equal-groups-array draws the
    // array instead.
    prompt:
      'Ava wants to find 8 × 6. She breaks the 8 into 5 and 3, and works out that 5 × 6 = 30. What is 8 × 6?',
    options: labelOptions([
      // 30: stopped after the first partial product and never multiplied the
      // 3 that was left.
      { text: '30', isCorrect: false, misconception: 'forgot-the-final-step' },
      // 30 + 3 = 33: added the leftover piece of the factor instead of
      // multiplying it by 6.
      { text: '33', isCorrect: false, misconception: 'multiplied-only-part-of-the-decomposed-factor' },
      { text: '48', isCorrect: true },
      // 8 + 6 = 14: added the two factors instead of multiplying them.
      { text: '14', isCorrect: false, misconception: 'added-instead-of-multiplied' },
    ]),
    calculatorAllowed: false,
    isStretch: false,
    difficulty: 'mastery',
    explanation: {
      stepByStep: [
        'Step 1: Breaking a factor apart means 8 groups of 6 becomes 5 groups of 6 plus 3 groups of 6.',
        'Step 2: Ava already found the first piece: 5 × 6 = 30.',
        'Step 3: Find the second piece the same way: 3 × 6 = 18.',
        'Step 4: Put the two pieces back together: 30 + 18 = 48, so 8 × 6 = 48.',
      ],
      conceptSummary:
        'A hard fact can be broken into two easy ones. Splitting a factor splits the groups, so both pieces must be multiplied and then added back together.',
      commonMisconception:
        'Stopping at 30 finds only 5 of the 8 groups, and adding the leftover 3 to get 33 counts three single objects instead of three more groups of 6.',
    },
  },
  {
    id: 'g3-oa1-02',
    standardCode: 'NC.3.OA.1',
    domainId: 'OA',
    prompt: 'Which multiplication equation matches this repeated addition?',
    promptDetails: '9 + 9 + 9 + 9 + 9 + 9',
    options: labelOptions([
      { text: '6 × 9 = 54', isCorrect: true },
      // Used the repeated number as both factors, so how many times it repeats
      // was never counted: 9 × 9 = 81.
      { text: '9 × 9 = 81', isCorrect: false, misconception: 'used-the-addend-as-both-factors' },
      // Counted only five 9s instead of six: 5 × 9 = 45.
      { text: '5 × 9 = 45', isCorrect: false, misconception: 'skip-counted-one-group-short' },
      // Added the count of groups to the size of a group: 6 + 9 = 15.
      { text: '6 + 9 = 15', isCorrect: false, misconception: 'added-instead-of-multiplied' },
    ]),
    calculatorAllowed: false,
    isStretch: false,
    difficulty: 'mastery',
    explanation: {
      stepByStep: [
        'Step 1: Count how many 9s are being added. There are six of them.',
        'Step 2: One factor tells how many equal groups there are: 6.',
        'Step 3: The other factor tells how many are in each group: 9.',
        'Step 4: Six groups of nine is written 6 × 9 = 54.',
      ],
      conceptSummary:
        'Multiplication is a short way of writing repeated addition. One factor counts the groups and the other gives the size of each group, so both numbers have to come out of the addition.',
      commonMisconception:
        'Writing 9 × 9 uses the repeated number twice and never counts how many times it repeats.',
    },
  },
  {
    id: 'g3-oa1-03',
    standardCode: 'NC.3.OA.1',
    domainId: 'OA',
    prompt:
      'Maria has 3 boxes. Each box holds 2 trays, and each tray holds 5 muffins. Maria first works out that 3 × 2 = 6 trays. How many muffins does Maria have in all?',
    options: labelOptions([
      // Stopped at 6, which counts trays, and reported it as muffins.
      { text: '6 muffins', isCorrect: false, misconception: 'forgot-the-final-step' },
      // 6 + 5 = 11: added the last two numbers instead of multiplying.
      { text: '11 muffins', isCorrect: false, misconception: 'added-instead-of-multiplied' },
      // 3 × 5 = 15: multiplied boxes by muffins per tray and left the trays
      // out of the problem altogether.
      { text: '15 muffins', isCorrect: false, misconception: 'left-out-a-factor' },
      { text: '30 muffins', isCorrect: true },
    ]),
    calculatorAllowed: false,
    isStretch: false,
    difficulty: 'advanced',
    explanation: {
      stepByStep: [
        'Step 1: Maria grouped the first two numbers: 3 boxes × 2 trays in each box = 6 trays.',
        'Step 2: Every one of those 6 trays holds 5 muffins, so the trays are the equal groups now.',
        'Step 3: 6 × 5 = 30.',
        'Step 4: Maria has 30 muffins in all.',
      ],
      conceptSummary:
        'When three numbers are multiplied, any two of them may be grouped and multiplied first — that is the associative property — but every one of the three has to be used.',
      commonMisconception:
        'Answering 6 stops at the number of trays, which is only half of the work; answering 15 skips the trays entirely.',
    },
  },

  // ==========================================
  // Standard: NC.3.OA.2 — Division as Sharing into Equal Groups
  // ==========================================
  {
    id: 'g3-oa2-01',
    standardCode: 'NC.3.OA.2',
    domainId: 'OA',
    prompt:
      'Sam has 24 stickers. He wants to give the same number of stickers to each of his 6 friends. Which number sentence should Sam use to find how many stickers each friend gets?',
    options: labelOptions([
      // 24 - 6: took one friend's worth away once instead of dividing.
      { text: '24 − 6', isCorrect: false, misconception: 'subtracted-instead-of-divided' },
      { text: '24 ÷ 6', isCorrect: true },
      // 24 x 6: multiplied the two numbers in the story because both were
      // there, which makes the pile of stickers bigger rather than sharing it.
      { text: '24 × 6', isCorrect: false, misconception: 'multiplied-instead-of-divided' },
      // 24 + 6: added the two numbers instead of dividing.
      { text: '24 + 6', isCorrect: false, misconception: 'added-instead-of-divided' },
    ]),
    calculatorAllowed: false,
    isStretch: false,
    difficulty: 'mastery',
    explanation: {
      stepByStep: [
        'Step 1: The 24 stickers are the total, and they are being broken into 6 equal parts.',
        'Step 2: Breaking a total into equal parts is division, not addition or subtraction.',
        'Step 3: The total goes first in a division, then the number of equal groups.',
        'Step 4: Sam should use 24 ÷ 6, which gives 4 stickers for each friend.',
      ],
      conceptSummary:
        'Sharing a total equally is division: the divisor says how many equal groups there are, and the answer says how many go in each group.',
      commonMisconception:
        'Subtracting 6 takes one friend’s stickers away once and leaves the other five friends out of the story.',
    },
  },
  {
    id: 'g3-oa2-02',
    standardCode: 'NC.3.OA.2',
    domainId: 'OA',
    prompt:
      'The picture shows 18 acorns placed into 6 equal piles. Dana writes 18 ÷ 6 = 3. In Dana’s equation, what does the 3 stand for?',
    promptDetails:
      'Pile 1: ● ● ●\nPile 2: ● ● ●\nPile 3: ● ● ●\nPile 4: ● ● ●\nPile 5: ● ● ●\nPile 6: ● ● ●',
    options: labelOptions([
      // Read the quotient as the count of groups, which is what the 6 says.
      {
        text: 'The number of piles',
        isCorrect: false,
        misconception: 'swapped-the-number-of-groups-with-the-group-size',
      },
      // Read the answer as the amount Dana started with, which is the 18.
      {
        text: 'The number of acorns Dana started with',
        isCorrect: false,
        misconception: 'confused-the-quotient-with-the-dividend',
      },
      { text: 'The number of acorns in each pile', isCorrect: true },
      // Read the answer as what is left over once the piles are made, which
      // here is nothing at all.
      {
        text: 'The number of acorns left over after the piles are made',
        isCorrect: false,
        misconception: 'read-the-quotient-as-the-leftover',
      },
    ]),
    calculatorAllowed: false,
    isStretch: false,
    difficulty: 'mastery',
    explanation: {
      stepByStep: [
        'Step 1: The 18 is the total number of acorns, before any piles are made.',
        'Step 2: The 6 is the divisor. It says how many equal piles there are, and the picture shows six.',
        'Step 3: The answer to the division says how many acorns go in one pile. Count a pile in the picture: three.',
        'Step 4: So the 3 stands for one thing only: The number of acorns in each pile.',
      ],
      conceptSummary:
        'Each number in a division equation has a job: the total, the number of equal groups, and the size of one group. Naming which is which is what makes the equation mean something.',
      commonMisconception:
        'Calling the 3 the number of piles swaps the two jobs — the picture has six piles, not three.',
    },
  },
  {
    id: 'g3-oa2-03',
    standardCode: 'NC.3.OA.2',
    domainId: 'OA',
    prompt:
      'Priya has 35 beads. She puts 7 beads on each bracelet. She takes 7 beads away again and again until none are left. How many bracelets did Priya make?',
    promptDetails: '35 − 7 = 28\n28 − 7 = 21\n21 − 7 = 14\n14 − 7 = 7\n7 − 7 = 0',
    options: labelOptions([
      { text: '5 bracelets', isCorrect: true },
      // Answered 7, which is how many beads go on one bracelet, not how many
      // bracelets there are.
      {
        text: '7 bracelets',
        isCorrect: false,
        misconception: 'swapped-the-number-of-groups-with-the-group-size',
      },
      // Counted the starting 35 as one of the takeaways, so the five
      // subtractions were counted as six.
      { text: '6 bracelets', isCorrect: false, misconception: 'skip-counted-one-group-too-many' },
      // Stopped after the first subtraction and reported 28.
      { text: '28 bracelets', isCorrect: false, misconception: 'forgot-the-final-step' },
    ]),
    calculatorAllowed: false,
    isStretch: false,
    difficulty: 'advanced',
    explanation: {
      stepByStep: [
        'Step 1: Each time Priya takes 7 beads away, she has made one more bracelet.',
        'Step 2: Count the take-aways in the list: 35 − 7, 28 − 7, 21 − 7, 14 − 7, 7 − 7. That is five of them.',
        'Step 3: Taking 7 away five times is the same as 35 ÷ 7 = 5.',
        'Step 4: Priya made 5 bracelets.',
      ],
      conceptSummary:
        'Repeated subtraction and division are the same question asked two ways: how many groups of this size can be taken out of the total?',
      commonMisconception:
        'Answering 7 gives the number of beads on one bracelet, which the question already told you, instead of the number of bracelets.',
    },
  },

  // ==========================================
  // Standard: NC.3.OA.3 — One-Step Word Problems
  // ==========================================
  {
    id: 'g3-oa3-01',
    standardCode: 'NC.3.OA.3',
    domainId: 'OA',
    // The generator for this standard covers its multiplication half; its
    // division half is authored here and at g3-oa3-03, one problem of each
    // kind: how many in each group, and how many groups.
    prompt:
      'A teacher has 48 crayons to share equally among 6 tables. How many crayons will be on each table?',
    options: labelOptions([
      // 48 - 6 = 42: subtracted one table's worth once instead of dividing.
      { text: '42 crayons', isCorrect: false, misconception: 'subtracted-instead-of-divided' },
      // 48 x 6 = 288: multiplied the two numbers in the story instead of
      // sharing the crayons out.
      { text: '288 crayons', isCorrect: false, misconception: 'multiplied-instead-of-divided' },
      // Answered with the number of tables, which the question already gave.
      {
        text: '6 crayons',
        isCorrect: false,
        misconception: 'swapped-the-number-of-groups-with-the-group-size',
      },
      { text: '8 crayons', isCorrect: true },
    ]),
    calculatorAllowed: false,
    isStretch: false,
    difficulty: 'mastery',
    explanation: {
      stepByStep: [
        'Step 1: The 48 crayons are the total and the 6 tables are the equal groups.',
        'Step 2: Write the equation with a symbol for the unknown: 48 ÷ 6 = c.',
        'Step 3: Ask which number times 6 gives 48. Since 6 × 8 = 48, the answer is 8.',
        'Step 4: There will be 8 crayons on each table.',
      ],
      conceptSummary:
        'A one-step sharing problem is solved by dividing the total by the number of equal groups. Finding that quotient is the same as finding the missing factor.',
      commonMisconception:
        'Answering 6 repeats the number of tables the question gave instead of working out how many crayons each table gets.',
    },
  },
  {
    id: 'g3-oa3-02',
    standardCode: 'NC.3.OA.3',
    domainId: 'OA',
    prompt:
      'There are 7 fish tanks at a pet store, and each tank has 9 fish. Let f stand for the total number of fish. Which equation and answer are correct?',
    options: labelOptions([
      // 7 + 9 = 16: added the number of tanks to the number in one tank.
      { text: 'f = 7 + 9, so f = 16', isCorrect: false, misconception: 'added-instead-of-multiplied' },
      { text: 'f = 7 × 9, so f = 63', isCorrect: true },
      // 9 - 7 = 2: subtracted the two numbers, which answers "how many more".
      {
        text: 'f = 9 − 7, so f = 2',
        isCorrect: false,
        misconception: 'subtracted-instead-of-multiplied',
      },
      // 6 x 9 = 54: counted only six tanks, leaving one group out.
      { text: 'f = 6 × 9, so f = 54', isCorrect: false, misconception: 'skip-counted-one-group-short' },
    ]),
    calculatorAllowed: false,
    isStretch: false,
    difficulty: 'mastery',
    explanation: {
      stepByStep: [
        'Step 1: There are 7 equal groups — the tanks — with 9 fish in each group.',
        'Step 2: Equal groups are put together by multiplying, so the equation is f = 7 × 9.',
        'Step 3: 7 × 9 = 63.',
        'Step 4: The correct choice is f = 7 × 9, so f = 63.',
      ],
      conceptSummary:
        'Writing the equation first, with a letter standing for the unknown, is what turns a story into mathematics. The arithmetic comes after the equation, not before it.',
      commonMisconception:
        'Adding gives 16, which counts the tanks once and one tank of fish once, instead of all seven tanks of nine.',
    },
  },
  {
    id: 'g3-oa3-03',
    standardCode: 'NC.3.OA.3',
    domainId: 'OA',
    prompt:
      'A bakery packs 56 rolls into bags. Each bag holds 8 rolls. How many bags does the bakery fill?',
    options: labelOptions([
      // 56 - 8 = 48: filled one bag and subtracted once, instead of dividing.
      { text: '48 bags', isCorrect: false, misconception: 'subtracted-instead-of-divided' },
      // Answered with the number in each bag, which the question already gave.
      {
        text: '8 bags',
        isCorrect: false,
        misconception: 'swapped-the-number-of-groups-with-the-group-size',
      },
      { text: '7 bags', isCorrect: true },
      // Skip counted 8, 16, 24, 32, 40, 48 and stopped one bag short of 56.
      { text: '6 bags', isCorrect: false, misconception: 'skip-counted-one-group-short' },
    ]),
    calculatorAllowed: false,
    isStretch: false,
    difficulty: 'advanced',
    explanation: {
      stepByStep: [
        'Step 1: This time the size of each group is known — 8 rolls — and the number of groups is the unknown.',
        'Step 2: Write the equation with a symbol for the unknown: 8 × b = 56, or 56 ÷ 8 = b.',
        'Step 3: Skip count by 8: 8, 16, 24, 32, 40, 48, 56. That is seven jumps.',
        'Step 4: The bakery fills 7 bags.',
      ],
      conceptSummary:
        'Division answers two different questions. Sometimes the number of groups is known and the share is the unknown; here the share is known and the number of groups is the unknown.',
      commonMisconception:
        'Answering 8 gives the number of rolls in one bag, which the question told you, rather than the number of bags.',
    },
  },

  // ==========================================
  // Standard: NC.3.OA.6 — Unknown-Factor Problems
  // ==========================================
  {
    id: 'g3-oa6-01',
    standardCode: 'NC.3.OA.6',
    domainId: 'OA',
    prompt:
      'Elena is solving 6 × ☐ = 42. She says, "I can find the missing number by dividing." Which division does Elena mean, and what is the missing number?',
    options: labelOptions([
      { text: '42 ÷ 6, and the missing number is 7', isCorrect: true },
      // 42 / 7 = 6 is a true fact, but 6 is the factor the equation already
      // showed, not the one hidden in the box. Reached either by dividing by
      // the wrong one of the two factors, or by finding 7 correctly and then
      // reporting the other end of the fact family.
      {
        text: '42 ÷ 7, and the missing number is 6',
        isCorrect: false,
        misconception: 'reported-the-factor-that-was-already-given',
      },
      // 42 - 6 = 36: undid the multiplication by subtracting once.
      {
        text: '42 − 6, and the missing number is 36',
        isCorrect: false,
        misconception: 'subtracted-instead-of-divided',
      },
      // 42 x 6 = 252: multiplied the two numbers already in the equation.
      {
        text: '42 × 6, and the missing number is 252',
        isCorrect: false,
        misconception: 'multiplied-instead-of-divided',
      },
    ]),
    calculatorAllowed: false,
    isStretch: false,
    difficulty: 'mastery',
    explanation: {
      stepByStep: [
        'Step 1: In 6 × ☐ = 42, the 42 is the product and the 6 is the factor you already know.',
        'Step 2: To find a missing factor, divide the product by the factor you know.',
        'Step 3: 42 ÷ 6, and since 6 × 7 = 42, the quotient is 7.',
        'Step 4: So the correct choice is 42 ÷ 6, and the missing number is 7.',
      ],
      conceptSummary:
        'Multiplication and division undo each other. An unknown factor can always be found by dividing the product by the factor that is known.',
      commonMisconception:
        'Dividing 42 by 7 is a true fact, but it gives back the 6 that was already printed in the equation rather than the number hidden in the box.',
    },
  },
  {
    id: 'g3-oa6-02',
    standardCode: 'NC.3.OA.6',
    domainId: 'OA',
    prompt:
      'Marcus puts 4 toy cars on each shelf and uses 36 cars in all. He writes 4 × ☐ = 36. How many shelves does Marcus fill?',
    options: labelOptions([
      // 36 - 4 = 32: subtracted one shelf's worth once instead of dividing.
      { text: '32 shelves', isCorrect: false, misconception: 'subtracted-instead-of-divided' },
      // 36 x 4 = 144: multiplied the two numbers already in the equation.
      { text: '144 shelves', isCorrect: false, misconception: 'multiplied-instead-of-divided' },
      // Skip counted 4, 8, 12, 16, 20, 24, 28, 32 and stopped one short of 36.
      { text: '8 shelves', isCorrect: false, misconception: 'skip-counted-one-group-short' },
      { text: '9 shelves', isCorrect: true },
    ]),
    calculatorAllowed: false,
    isStretch: false,
    difficulty: 'mastery',
    explanation: {
      stepByStep: [
        'Step 1: The box in 4 × ☐ = 36 stands for the number of shelves.',
        'Step 2: Change the unknown-factor problem into a division: 36 ÷ 4.',
        'Step 3: Skip count by 4 and keep track of the jumps: 4, 8, 12, 16, 20, 24, 28, 32, 36. That is nine jumps.',
        'Step 4: Marcus fills 9 shelves.',
      ],
      conceptSummary:
        'An unknown-factor problem and a division problem are the same problem written two ways, so either one can be used to solve the other.',
      commonMisconception:
        'Stopping the skip count at 32 lands one jump short and gives 8 shelves, which only holds 32 of the 36 cars.',
    },
  },
  {
    id: 'g3-oa6-03',
    standardCode: 'NC.3.OA.6',
    domainId: 'OA',
    prompt: 'Lily is solving ☐ × 7 = 63. She says the missing number is 9. How can Lily check that she is right?',
    options: labelOptions([
      // 9 + 7 = 16, not 63: added the two numbers instead of multiplying them.
      {
        text: 'Add 9 + 7 and see whether the answer is 63.',
        isCorrect: false,
        misconception: 'added-instead-of-multiplied',
      },
      { text: 'Multiply 9 × 7 and see whether the answer is 63.', isCorrect: true },
      // 63 - 7 = 56, not 9: undid the multiplication by subtracting once.
      {
        text: 'Subtract 63 − 7 and see whether the answer is 9.',
        isCorrect: false,
        misconception: 'subtracted-instead-of-divided',
      },
      // 63 x 7 = 441, not 9: multiplied where dividing was needed.
      {
        text: 'Multiply 63 × 7 and see whether the answer is 9.',
        isCorrect: false,
        misconception: 'multiplied-instead-of-divided',
      },
    ]),
    calculatorAllowed: false,
    isStretch: false,
    difficulty: 'advanced',
    explanation: {
      stepByStep: [
        'Step 1: Lily is claiming that 9 is the missing factor in ☐ × 7 = 63.',
        'Step 2: A missing factor is checked by putting it back into the equation.',
        'Step 3: Putting 9 in the box gives 9 × 7, and 9 × 7 = 63, which matches the product.',
        'Step 4: So the way to check is: Multiply 9 × 7 and see whether the answer is 63.',
      ],
      conceptSummary:
        'Checking an answer means putting it back where it came from. Because multiplication and division undo each other, either operation can be used to test the other.',
      commonMisconception:
        'Subtracting 7 from 63 gives 56, which tells you nothing about whether 9 groups of 7 make 63.',
    },
  },

  // ==========================================
  // Standard: NC.3.OA.7 — Fluency to 10
  // ==========================================
  {
    id: 'g3-oa7-01',
    standardCode: 'NC.3.OA.7',
    domainId: 'OA',
    // The generator for this standard covers multiplication facts. Division
    // fluency and the unknown-in-an-equation keyConcept are authored here.
    prompt: 'What is 63 ÷ 9?',
    options: labelOptions([
      // Skip counted 9, 18, 27, 36, 45, 54 and stopped one jump short of 63.
      { text: '6', isCorrect: false, misconception: 'skip-counted-one-group-short' },
      // Counted the 0 the skip count starts from as a jump of its own.
      { text: '8', isCorrect: false, misconception: 'skip-counted-one-group-too-many' },
      { text: '7', isCorrect: true },
      // 63 - 9 = 54: subtracted once instead of dividing.
      { text: '54', isCorrect: false, misconception: 'subtracted-instead-of-divided' },
    ]),
    calculatorAllowed: false,
    isStretch: false,
    difficulty: 'mastery',
    explanation: {
      stepByStep: [
        'Step 1: 63 ÷ 9 asks how many groups of 9 make 63.',
        'Step 2: Use the multiplication fact instead: 9 × ? = 63.',
        'Step 3: Skip count by 9: 9, 18, 27, 36, 45, 54, 63. That is seven jumps.',
        'Step 4: 63 ÷ 9 = 7.',
      ],
      conceptSummary:
        'Fluency means the division facts to 10 come from the multiplication facts you already know, without counting them out each time.',
      commonMisconception:
        'Stopping the skip count at 54 gives 6, and counting the starting point as a jump gives 8; both mean the jumps, not the numbers, were miscounted.',
    },
  },
  {
    id: 'g3-oa7-02',
    standardCode: 'NC.3.OA.7',
    domainId: 'OA',
    prompt: 'What number belongs in the box to make 48 ÷ ☐ = 6 true?',
    options: labelOptions([
      { text: '8', isCorrect: true },
      // 48 - 6 = 42: subtracted the two numbers shown instead of dividing.
      { text: '42', isCorrect: false, misconception: 'subtracted-instead-of-divided' },
      // 48 x 6 = 288: multiplied the two numbers shown instead of dividing.
      { text: '288', isCorrect: false, misconception: 'multiplied-instead-of-divided' },
      // Skip counted 6, 12, 18, 24, 30, 36, 42 and stopped one jump short.
      { text: '7', isCorrect: false, misconception: 'skip-counted-one-group-short' },
    ]),
    calculatorAllowed: false,
    isStretch: false,
    difficulty: 'mastery',
    explanation: {
      stepByStep: [
        'Step 1: The box is the divisor: 48 shared into some number of equal groups gives 6 in each group.',
        'Step 2: The three numbers 48, 6 and the box make a fact family, so 6 × ☐ = 48 asks the same thing.',
        'Step 3: Skip count by 6: 6, 12, 18, 24, 30, 36, 42, 48. That is eight jumps.',
        'Step 4: The number that belongs in the box is 8.',
      ],
      conceptSummary:
        'Three whole numbers that make a multiplication fact also make two division facts, so the unknown can sit in any of the three places and still be found the same way.',
      commonMisconception:
        'Subtracting 6 from 48 gives 42, which is not a number of groups at all.',
    },
  },
  {
    id: 'g3-oa7-03',
    standardCode: 'NC.3.OA.7',
    domainId: 'OA',
    prompt: 'Ana wrote ☐ ÷ 4 = 9. What number belongs in the box?',
    options: labelOptions([
      // 9 + 4 = 13: added the two numbers shown instead of multiplying them.
      { text: '13', isCorrect: false, misconception: 'added-instead-of-multiplied' },
      // 9 - 4 = 5: subtracted the two numbers shown.
      { text: '5', isCorrect: false, misconception: 'subtracted-instead-of-multiplied' },
      // Skip counted 4, 8, 12, 16, 20, 24, 28, 32 and stopped one group short
      // of the nine groups of 4.
      { text: '32', isCorrect: false, misconception: 'skip-counted-one-group-short' },
      { text: '36', isCorrect: true },
    ]),
    calculatorAllowed: false,
    isStretch: false,
    difficulty: 'advanced',
    explanation: {
      stepByStep: [
        'Step 1: This time the unknown is the total being shared, not the answer.',
        'Step 2: ☐ ÷ 4 = 9 means 9 groups of 4 were made, so the total is 4 × 9.',
        'Step 3: 4 × 9 = 36.',
        'Step 4: The number that belongs in the box is 36.',
      ],
      conceptSummary:
        'The unknown in an equation relating three whole numbers can be the total, the number of groups, or the size of a group. Which operation finds it depends on which one is missing.',
      commonMisconception:
        'Adding 9 and 4 to get 13 treats the equation as if any operation would do; 13 ÷ 4 is not 9.',
    },
  },

  // ==========================================
  // Standard: NC.3.OA.8 — Two-Step Word Problems (+, −, × only)
  // ==========================================
  {
    id: 'g3-oa8-01',
    standardCode: 'NC.3.OA.8',
    domainId: 'OA',
    prompt:
      'Jenna buys 4 packs of markers. Each pack has 8 markers. She already had 5 markers at home. How many markers does Jenna have now?',
    options: labelOptions([
      // 4 x 8 = 32: did the first step and stopped, never adding the 5.
      { text: '32 markers', isCorrect: false, misconception: 'forgot-the-final-step' },
      { text: '37 markers', isCorrect: true },
      // 4 x (8 + 5) = 52: added the 5 first and then multiplied, so the 5
      // markers at home were multiplied by 4 as well.
      { text: '52 markers', isCorrect: false, misconception: 'did-the-two-steps-in-the-wrong-order' },
      // 4 + 8 + 5 = 17: added all three numbers instead of multiplying first.
      { text: '17 markers', isCorrect: false, misconception: 'added-instead-of-multiplied' },
    ]),
    calculatorAllowed: false,
    isStretch: false,
    difficulty: 'mastery',
    explanation: {
      stepByStep: [
        'Step 1: First step — find how many markers are in the packs: 4 × 8 = 32.',
        'Step 2: Hold on to that 32. It is the result of the first step, not the answer.',
        'Step 3: Second step — add the 5 markers Jenna already had: 32 + 5 = 37.',
        'Step 4: Jenna now has 37 markers.',
      ],
      conceptSummary:
        'A two-step problem needs the result of the first step kept in mind while the second step is carried out. Writing the first result down before starting the second step is what keeps it from being lost.',
      commonMisconception:
        'Adding the 5 before multiplying gives 52, because it turns the 5 markers already at home into 5 extra markers in every pack.',
    },
  },
  {
    id: 'g3-oa8-02',
    standardCode: 'NC.3.OA.8',
    domainId: 'OA',
    prompt:
      'There are 6 groups of students. Each group made 9 paper cranes. Then 7 of the cranes were given away. How many paper cranes are left?',
    options: labelOptions([
      // 6 x 9 = 54: did the first step and stopped, never giving any away.
      { text: '54 cranes', isCorrect: false, misconception: 'forgot-the-final-step' },
      // 6 + 9 - 7 = 8: added the groups to the cranes per group instead of
      // multiplying, then subtracted.
      { text: '8 cranes', isCorrect: false, misconception: 'added-instead-of-multiplied' },
      { text: '47 cranes', isCorrect: true },
      // 6 x (9 - 7) = 12: took the 7 away first, as if each group had given
      // 7 cranes away rather than 7 in total.
      { text: '12 cranes', isCorrect: false, misconception: 'did-the-two-steps-in-the-wrong-order' },
    ]),
    calculatorAllowed: false,
    isStretch: false,
    difficulty: 'mastery',
    explanation: {
      stepByStep: [
        'Step 1: First step — find how many cranes were made altogether: 6 × 9 = 54.',
        'Step 2: The 7 given away are 7 cranes in total, not 7 from each group.',
        'Step 3: Second step — take them away from the whole pile: 54 − 7 = 47.',
        'Step 4: There are 47 cranes left.',
      ],
      conceptSummary:
        'In a two-step problem the order of the steps is part of the mathematics. Taking away before combining removes far more than the story says was removed.',
      commonMisconception:
        'Working out 9 − 7 first gives 12, which takes 7 cranes from every one of the 6 groups instead of 7 in all.',
    },
  },
  {
    id: 'g3-oa8-03',
    standardCode: 'NC.3.OA.8',
    domainId: 'OA',
    prompt:
      'A store has 5 boxes of pencils with 6 pencils in each box. The store also has 12 loose pencils. Let p stand for the total number of pencils. Which equation and answer are correct?',
    options: labelOptions([
      { text: 'p = (5 × 6) + 12, so p = 42', isCorrect: true },
      // 5 x (6 + 12) = 90: added the loose pencils into every box first.
      {
        text: 'p = 5 × (6 + 12), so p = 90',
        isCorrect: false,
        misconception: 'did-the-two-steps-in-the-wrong-order',
      },
      // 5 + 6 + 12 = 23: added all three numbers instead of multiplying first.
      {
        text: 'p = 5 + 6 + 12, so p = 23',
        isCorrect: false,
        misconception: 'added-instead-of-multiplied',
      },
      // 5 x 6 = 30: did the first step only and never added the loose pencils.
      { text: 'p = 5 × 6, so p = 30', isCorrect: false, misconception: 'forgot-the-final-step' },
    ]),
    calculatorAllowed: false,
    isStretch: false,
    difficulty: 'advanced',
    explanation: {
      stepByStep: [
        'Step 1: The boxed pencils are equal groups: 5 boxes of 6, which is 5 × 6.',
        'Step 2: The 12 loose pencils are not in any box, so they are added on afterwards.',
        'Step 3: The equation that says both of those things is p = (5 × 6) + 12, and 30 + 12 = 42.',
        'Step 4: The correct choice is p = (5 × 6) + 12, so p = 42.',
      ],
      conceptSummary:
        'Writing a two-step problem as one equation with a letter for the unknown shows which step happens first, and the brackets are how the equation says so.',
      commonMisconception:
        'Putting the 12 inside the brackets gives 90, because it puts 12 extra pencils into every one of the 5 boxes.',
    },
  },

  // ==========================================
  // Standard: NC.3.OA.9 — Patterns on a Hundreds Board and Multiplication Table
  // ==========================================
  {
    id: 'g3-oa9-01',
    standardCode: 'NC.3.OA.9',
    domainId: 'OA',
    // Ruling 12-6: the sourced text is "a hundreds board AND/OR multiplication
    // table", so the bank has to carry the hundreds-board half too. This is it.
    prompt:
      'On a hundreds board, Mia shades every number she says when she counts by 2s: 2, 4, 6, 8, and so on. Ravi shades every number he says when he counts by 5s: 5, 10, 15, 20, and so on. Which of these numbers will BOTH Mia and Ravi shade?',
    options: labelOptions([
      // 24 is in Mia's count but not Ravi's: checked one pattern and stopped.
      { text: '24', isCorrect: false, misconception: 'checked-only-one-of-the-two-patterns' },
      // 35 is in Ravi's count but not Mia's: the same error on the other side.
      { text: '35', isCorrect: false, misconception: 'checked-only-one-of-the-two-patterns' },
      // 2 + 5 = 7: added the two counting steps together instead of looking
      // for a number that appears in both counts.
      { text: '7', isCorrect: false, misconception: 'added-the-two-step-sizes' },
      { text: '30', isCorrect: true },
    ]),
    calculatorAllowed: false,
    isStretch: false,
    difficulty: 'mastery',
    explanation: {
      stepByStep: [
        'Step 1: Mia shades the numbers you say counting by 2s, so every number she shades is even.',
        'Step 2: Ravi shades the numbers you say counting by 5s, so every number he shades ends in 5 or 0.',
        'Step 3: A number both of them shade has to be even AND end in 5 or 0, so it has to end in 0.',
        'Step 4: Of the choices, only 30 ends in 0, so both Mia and Ravi shade 30.',
      ],
      conceptSummary:
        'Each skip count shades its own pattern of columns on a hundreds board. Where two counts overlap, the number belongs to both patterns at once.',
      commonMisconception:
        'Checking only one of the two counts is enough to accept 24 or 35, but a number has to pass both tests to be shaded twice.',
    },
  },
  {
    id: 'g3-oa9-02',
    standardCode: 'NC.3.OA.9',
    domainId: 'OA',
    prompt:
      'Sara is filling in the row for 4 on a multiplication table: 4, 8, 12, 16, 20, and so on. What is the tenth number in that row?',
    options: labelOptions([
      // 11 jumps of 4 instead of 10: counted the starting point as a jump.
      { text: '44', isCorrect: false, misconception: 'skip-counted-one-group-too-many' },
      { text: '40', isCorrect: true },
      // 9 jumps of 4: stopped one place short of the tenth number.
      { text: '36', isCorrect: false, misconception: 'skip-counted-one-group-short' },
      // 10 + 4 = 14: added the place number to the step size.
      { text: '14', isCorrect: false, misconception: 'added-instead-of-multiplied' },
    ]),
    calculatorAllowed: false,
    isStretch: false,
    difficulty: 'mastery',
    explanation: {
      stepByStep: [
        'Step 1: In a multiplication table, the row for 4 lists 4 × 1, 4 × 2, 4 × 3, and so on.',
        'Step 2: The tenth number in the row is therefore 4 × 10.',
        'Step 3: 4 × 10 = 40.',
        'Step 4: The tenth number in the row for 4 is 40.',
      ],
      conceptSummary:
        'Each row of a multiplication table is a skip count, and the place a number holds in the row is the factor it is multiplied by. That is what makes the table a table and not just a list.',
      commonMisconception:
        'Answering 44 counts eleven fours, which happens when the first number in the row is counted as a jump instead of as the first stop.',
    },
  },
  {
    id: 'g3-oa9-03',
    standardCode: 'NC.3.OA.9',
    domainId: 'OA',
    prompt:
      'On a multiplication table, the row for 3 reads 3, 6, 9, 12, 15, 18, 21, 24, and the row for 6 reads 6, 12, 18, 24, 30, 36. Every number in the row for 6 also appears in the row for 3. Which statement explains why?',
    options: labelOptions([
      // Both rows are said to be even, which is false for the row for 3
      // (3, 9, 15 and 21 are odd) - a rule taken from part of the pattern.
      {
        text: 'Because both rows are made up of even numbers.',
        isCorrect: false,
        misconception: 'checked-only-part-of-the-pattern',
      },
      // The containment stated backwards: 9 is in the row for 3 and not in
      // the row for 6.
      {
        text: 'Because every number in the row for 3 also appears in the row for 6.',
        isCorrect: false,
        misconception: 'reversed-the-direction-of-the-pattern',
      },
      { text: 'Because 6 is 2 × 3, so every group of 6 is two groups of 3.', isCorrect: true },
      // Treats the relationship between the rows as an addition, 3 + 3 = 6,
      // rather than as one factor being a multiple of the other.
      {
        text: 'Because 3 + 3 = 6, so adding the two rows together gives the same numbers.',
        isCorrect: false,
        misconception: 'additive-instead-of-multiplicative-relationship',
      },
    ]),
    calculatorAllowed: false,
    isStretch: false,
    difficulty: 'advanced',
    explanation: {
      stepByStep: [
        'Step 1: Look at one number in the row for 6, say 18. It is 6 × 3.',
        'Step 2: Six is itself 2 × 3, so six of anything is the same as two groups of three of it.',
        'Step 3: That means 18 is also 3 × 6, which is why it turns up in the row for 3 as well.',
        'Step 4: The same works for every number in the row: Because 6 is 2 × 3, so every group of 6 is two groups of 3.',
      ],
      conceptSummary:
        'Rows of the multiplication table sit inside one another whenever one factor is a multiple of the other. Spotting that a row repeats is the easy part; saying why it has to is what the standard asks for.',
      commonMisconception:
        'Turning the statement round — claiming every number in the row for 3 is in the row for 6 — is false: 9 is in the row for 3 and never appears in the row for 6.',
    },
  },
];
