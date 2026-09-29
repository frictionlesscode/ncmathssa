import type { Question } from '../../engine/questionModel';
import { labelOptions } from '../../engine/questionModel';
import { unitCount, tensAndOnes } from './templates/placeValue';

/**
 * The authored Grade 1 Number & Operations in Base Ten bank.
 *
 * Scope is read from the sourced text in `./standards.ts`, NOT from the Task
 * 23 brief. Ruling 23-1 of
 * `.superpowers/sdd/2026-09-13-grades-1-4-content/task-22-26-rulings.md`
 * swaps two of the brief's codes: NC.1.NBT.1 is COUNTING to 150 from any
 * start, and NC.1.NBT.7 is READING AND WRITING NUMERALS to 100. Every item
 * below is written to the standard's own `description` and `keyConcepts`.
 *
 *   NC.1.NBT.1  counting. RULING 23-9's authored/generated split: the
 *               generator always asks for the next THREE numbers; these ask
 *               for a single next number, a crossing at 128-130, and a
 *               "what comes right before" item — none of which the generator
 *               shapes ask.
 *   NC.1.NBT.7  numerals to 100, including the founding "13 read as 31"
 *               error the brief itself names, a decade-vs-teen confusion,
 *               and "representing a number of objects with a written
 *               numeral" (the keyConcept the generator does not touch, since
 *               it always starts from a number NAME).
 *   NC.1.NBT.2  ruling 23-7: a TEEN decomposition item (g1-nbt2-01, where
 *               "13 read as 31" lives again, this time as the distractor)
 *               and a plain decade item (g1-nbt2-02, "70 is 7 tens and 0
 *               ones"), plus the brief's own founding error — 4 tens and 2
 *               ones written 24 — as a word problem (g1-nbt2-03).
 *   NC.1.NBT.3  comparing two-digit numbers, including the founding error the
 *               brief names: comparing by the ONES digit. Shaped as "which
 *               is the greatest/least of four", not the generator's
 *               "which sentence is true" symbol statements.
 *   NC.1.NBT.4  add within 100 (ruling 23-2's shape: a one-digit or
 *               multiple-of-10 second addend). g1-nbt4-01 is the brief's own
 *               founding error — believing 19 + 1 is 110 — and the other two
 *               are word problems, where the generator only ever asks a bare
 *               "Find the total".
 *   NC.1.NBT.5  10 more or 10 less, as word problems, including a case that
 *               crosses into a new hundred (94 and 10 more) and a case that
 *               goes down into single digits (13 and 10 less).
 *   NC.1.NBT.6  subtract two multiples of 10, as word problems.
 *
 * Every prompt passes `assertGradeOneReadable` (under 90 characters, at most
 * one setup sentence and one question, no word over 10 letters).
 *
 * NO ANSWER-SHAPE TELL: the correct option's position is rotated across the
 * bank rather than fixed at one label; `./authored.nbt.test.ts` holds this.
 */
export const GRADE_1_NBT_AUTHORED: Question[] = [
  // ==========================================
  // Standard: NC.1.NBT.1 — Count to 150 from Any Number
  // ==========================================
  {
    id: 'g1-nbt1-01',
    standardCode: 'NC.1.NBT.1',
    domainId: 'NBT',
    prompt: 'Sam counts 87, 88, 89. What comes next?',
    options: labelOptions([
      { text: '90', isCorrect: true },
      // Went back to the start of the 80s instead of moving on.
      { text: '80', isCorrect: false, misconception: 'restarted-the-count-at-the-start-of-the-ten' },
      // Jumped ahead a whole ten instead of the next number.
      { text: '100', isCorrect: false, misconception: 'skipped-a-ten-while-counting' },
      // Skipped over 90 to the number after it.
      { text: '91', isCorrect: false, misconception: 'skipped-a-number-while-counting' },
    ]),
    calculatorAllowed: false,
    isStretch: false,
    difficulty: 'mastery',
    explanation: {
      stepByStep: [
        'Step 1: Count on by ones from 89: the next number is 90.',
        'Step 2: 89 is followed by 90, not by 80 or by 100.',
        'Step 3: The next number is 90.',
      ],
      conceptSummary: 'Counting on by ones moves to the very next number, crossing into a new ten without going back or skipping ahead.',
      commonMisconception: 'Going back to 80 restarts the count instead of moving on to 90.',
    },
  },
  {
    id: 'g1-nbt1-02',
    standardCode: 'NC.1.NBT.1',
    domainId: 'NBT',
    prompt: 'Mia counts 128, 129. What comes next?',
    options: labelOptions([
      { text: '120', isCorrect: false, misconception: 'restarted-the-count-at-the-start-of-the-ten' },
      { text: '130', isCorrect: true },
      { text: '140', isCorrect: false, misconception: 'skipped-a-ten-while-counting' },
      { text: '131', isCorrect: false, misconception: 'skipped-a-number-while-counting' },
    ]),
    calculatorAllowed: false,
    isStretch: false,
    difficulty: 'advanced',
    explanation: {
      stepByStep: [
        'Step 1: Count on by ones from 129: the next number is 130.',
        'Step 2: 129 is followed by 130, even though the count is now three digits.',
        'Step 3: The next number is 130.',
      ],
      conceptSummary: 'Counting past 129 works the same way it does past 29 or 9: the next number after 129 is 130.',
      commonMisconception: 'Jumping to 140 skips a whole ten of counting between 129 and 140.',
    },
  },
  {
    id: 'g1-nbt1-03',
    standardCode: 'NC.1.NBT.1',
    domainId: 'NBT',
    prompt: 'What number comes right before 100?',
    options: labelOptions([
      { text: '100', isCorrect: false, misconception: 'restated-a-known-number-instead-of-solving' },
      { text: '101', isCorrect: false, misconception: 'added-instead-of-subtracted' },
      { text: '99', isCorrect: true },
      { text: '98', isCorrect: false, misconception: 'counted-on-by-ones-one-too-many' },
    ]),
    calculatorAllowed: false,
    isStretch: false,
    difficulty: 'advanced',
    explanation: {
      stepByStep: [
        'Step 1: Counting on, 99 is followed by 100.',
        'Step 2: So the number right before 100 is 99.',
        'Step 3: The number is 99.',
      ],
      conceptSummary: 'The number right before a number is one less than it, found by counting backward one step.',
      commonMisconception: 'Counting back two steps from 100 instead of one lands on 98, not 99.',
    },
  },

  // ==========================================
  // Standard: NC.1.NBT.7 — Read & Write Numerals to 100
  // ==========================================
  {
    id: 'g1-nbt7-01',
    standardCode: 'NC.1.NBT.7',
    domainId: 'NBT',
    prompt: 'Which number is thirteen?',
    options: labelOptions([
      { text: '31', isCorrect: false, misconception: 'swapped-the-tens-and-the-ones' },
      { text: '30', isCorrect: false, misconception: 'confused-a-teen-number-with-its-decade' },
      { text: '3', isCorrect: false, misconception: 'left-off-part-of-the-number-name' },
      { text: '13', isCorrect: true },
    ]),
    calculatorAllowed: false,
    isStretch: false,
    difficulty: 'mastery',
    explanation: {
      stepByStep: [
        'Step 1: Thirteen is 1 ten and 3 ones.',
        'Step 2: 1 ten and 3 ones is written 13.',
        'Step 3: Thirteen is written 13.',
      ],
      conceptSummary: 'A teen number is a ten and some ones. Writing it puts the 1 for the ten first, then the ones digit.',
      commonMisconception: 'Reading the digits in the wrong order writes 31 instead of 13.',
    },
  },
  {
    id: 'g1-nbt7-02',
    standardCode: 'NC.1.NBT.7',
    domainId: 'NBT',
    prompt: 'Which number is seventeen?',
    options: labelOptions([
      { text: '17', isCorrect: true },
      { text: '71', isCorrect: false, misconception: 'swapped-the-tens-and-the-ones' },
      { text: '70', isCorrect: false, misconception: 'confused-a-teen-number-with-its-decade' },
      { text: '7', isCorrect: false, misconception: 'left-off-part-of-the-number-name' },
    ]),
    calculatorAllowed: false,
    isStretch: false,
    difficulty: 'mastery',
    explanation: {
      stepByStep: [
        'Step 1: Seventeen is 1 ten and 7 ones.',
        'Step 2: 1 ten and 7 ones is written 17.',
        'Step 3: Seventeen is written 17.',
      ],
      conceptSummary: 'Seventeen and seventy sound alike but are different amounts: seventeen is a teen number, seventy is 7 tens.',
      commonMisconception: 'Writing only the 7 leaves out the ten that "-teen" stands for.',
    },
  },
  {
    id: 'g1-nbt7-03',
    standardCode: 'NC.1.NBT.7',
    domainId: 'NBT',
    prompt: 'There are 3 tens and 6 ones of stars. Which numeral shows that?',
    options: labelOptions([
      { text: '63', isCorrect: false, misconception: 'swapped-the-tens-and-the-ones' },
      { text: '36', isCorrect: true },
      { text: '9', isCorrect: false, misconception: 'used-the-tens-digit-as-ones' },
      { text: '306', isCorrect: false, misconception: 'wrote-each-part-of-the-number-side-by-side' },
    ]),
    calculatorAllowed: false,
    isStretch: false,
    difficulty: 'advanced',
    explanation: {
      stepByStep: [
        `Step 1: 3 tens and 6 ones is 36.`,
        'Step 2: The numeral for 3 tens and 6 ones is written 36.',
        'Step 3: The numeral is 36.',
      ],
      conceptSummary: 'A written numeral represents a number of objects: the tens digit and the ones digit together, not side by side as separate counts.',
      commonMisconception: 'Adding 3 and 6 as if each ten were a single one gives 9, far fewer than the 36 stars there really are.',
    },
  },

  // ==========================================
  // Standard: NC.1.NBT.2 — Tens & Ones in a Two-Digit Number
  // ==========================================
  {
    id: 'g1-nbt2-01',
    standardCode: 'NC.1.NBT.2',
    domainId: 'NBT',
    prompt: '13 is 1 ten and how many ones?',
    options: labelOptions([
      { text: '13', isCorrect: false, misconception: 'restated-a-known-number-instead-of-solving' },
      { text: '31', isCorrect: false, misconception: 'swapped-the-tens-and-the-ones' },
      { text: '3', isCorrect: true },
      { text: '4', isCorrect: false, misconception: 'counted-on-by-ones-one-too-many' },
    ]),
    calculatorAllowed: false,
    isStretch: false,
    difficulty: 'mastery',
    explanation: {
      stepByStep: [
        `Step 1: ${tensAndOnes(13)}.`,
        'Step 2: The ones part of 13 is 3.',
        'Step 3: 13 is 1 ten and 3 ones.',
      ],
      conceptSummary: 'Every teen number is a ten and some ones: 13 is a ten (10) with 3 more ones.',
      commonMisconception: 'Reading 13 backward as 31 would make it look like 3 tens and 1 one instead of 1 ten and 3 ones.',
    },
  },
  {
    id: 'g1-nbt2-02',
    standardCode: 'NC.1.NBT.2',
    domainId: 'NBT',
    prompt: 'How many tens are in 70?',
    options: labelOptions([
      { text: '70', isCorrect: false, misconception: 'restated-a-known-number-instead-of-solving' },
      { text: '0', isCorrect: false, misconception: 'counted-the-ones-place-instead-of-the-tens-place' },
      { text: '17', isCorrect: false, misconception: 'confused-a-teen-number-with-its-decade' },
      { text: '7', isCorrect: true },
    ]),
    calculatorAllowed: false,
    isStretch: false,
    difficulty: 'mastery',
    explanation: {
      stepByStep: [
        `Step 1: 70 is ${unitCount(7, 'ten')} and ${unitCount(0, 'one')}.`,
        'Step 2: The tens digit of 70 is 7.',
        'Step 3: There are 7 tens in 70.',
      ],
      conceptSummary: 'A multiple of 10 like 70 is made of tens and no leftover ones: 70 is exactly 7 tens.',
      commonMisconception: 'Answering with the ones digit, 0, counts the leftover ones instead of the tens.',
    },
  },
  {
    id: 'g1-nbt2-03',
    standardCode: 'NC.1.NBT.2',
    domainId: 'NBT',
    prompt: 'Zoe has 4 bundles of ten cubes and 2 loose cubes. How many cubes in all?',
    options: labelOptions([
      { text: '42', isCorrect: true },
      { text: '24', isCorrect: false, misconception: 'swapped-the-tens-and-the-ones' },
      { text: '6', isCorrect: false, misconception: 'used-the-tens-digit-as-ones' },
      { text: '402', isCorrect: false, misconception: 'wrote-each-part-of-the-number-side-by-side' },
    ]),
    calculatorAllowed: false,
    isStretch: false,
    difficulty: 'advanced',
    explanation: {
      stepByStep: [
        `Step 1: 4 bundles of ten is 4 tens, and 2 loose cubes is 2 ones.`,
        `Step 2: 4 tens and 2 ones is 42.`,
        'Step 3: Zoe has 42 cubes in all.',
      ],
      conceptSummary: 'A two-digit number is tens and ones together. 4 tens and 2 ones make 42, not 24 — the tens digit comes first.',
      commonMisconception: 'Writing the digits in the order they were counted, ones then tens, gives 24 instead of 42.',
    },
  },

  // ==========================================
  // Standard: NC.1.NBT.3 — Compare Two-Digit Numbers
  // ==========================================
  {
    id: 'g1-nbt3-01',
    standardCode: 'NC.1.NBT.3',
    domainId: 'NBT',
    prompt: 'Which number is the greatest: 52, 25, 38, or 21?',
    options: labelOptions([
      { text: '25', isCorrect: false, misconception: 'same-digits-read-as-the-same-number' },
      { text: '52', isCorrect: true },
      { text: '38', isCorrect: false, misconception: 'compared-the-wrong-place-first' },
      { text: '21', isCorrect: false, misconception: 'picked-the-least-instead-of-the-greatest' },
    ]),
    calculatorAllowed: false,
    isStretch: false,
    difficulty: 'mastery',
    explanation: {
      stepByStep: [
        'Step 1: Compare the tens digits first: 5, 2, 3, and 2.',
        'Step 2: 5 tens is more than 2 tens, 3 tens, or 2 tens, so 52 has the most tens.',
        'Step 3: 52 is the greatest.',
      ],
      conceptSummary: 'Comparing two-digit numbers starts with the tens digit. Whichever number has the most tens is the greatest, no matter what the ones digits say.',
      commonMisconception: 'Comparing the ones digits first makes 38 look big because its ones digit, 8, is the largest ones digit here.',
    },
  },
  {
    id: 'g1-nbt3-02',
    standardCode: 'NC.1.NBT.3',
    domainId: 'NBT',
    prompt: 'Which number is the greatest: 74, 47, 58, or 32?',
    options: labelOptions([
      { text: '47', isCorrect: false, misconception: 'same-digits-read-as-the-same-number' },
      { text: '58', isCorrect: false, misconception: 'compared-the-wrong-place-first' },
      { text: '74', isCorrect: true },
      { text: '32', isCorrect: false, misconception: 'picked-the-least-instead-of-the-greatest' },
    ]),
    calculatorAllowed: false,
    isStretch: false,
    difficulty: 'advanced',
    explanation: {
      stepByStep: [
        'Step 1: Compare the tens digits first: 7, 4, 5, and 3.',
        'Step 2: 7 tens is more than 4 tens, 5 tens, or 3 tens, so 74 has the most tens.',
        'Step 3: 74 is the greatest.',
      ],
      conceptSummary: 'The tens digit decides a comparison before the ones digit gets a turn. 74 has 7 tens, more than any of the others.',
      commonMisconception: '47 has the same digits as 74, but reading them in a different order gives a smaller number, not an equal one.',
    },
  },
  {
    id: 'g1-nbt3-03',
    standardCode: 'NC.1.NBT.3',
    domainId: 'NBT',
    prompt: 'Which number is the least: 38, 83, 91, or 50?',
    options: labelOptions([
      { text: '83', isCorrect: false, misconception: 'same-digits-read-as-the-same-number' },
      { text: '50', isCorrect: false, misconception: 'compared-the-wrong-place-first' },
      { text: '91', isCorrect: false, misconception: 'picked-the-least-instead-of-the-greatest' },
      { text: '38', isCorrect: true },
    ]),
    calculatorAllowed: false,
    isStretch: false,
    difficulty: 'advanced',
    explanation: {
      stepByStep: [
        'Step 1: Compare the tens digits first: 3, 8, 9, and 5.',
        'Step 2: 3 tens is fewer than 8 tens, 9 tens, or 5 tens, so 38 has the fewest tens.',
        'Step 3: 38 is the least.',
      ],
      conceptSummary: 'The number with the fewest tens is the least, even if its ones digit looks small too, like 50\'s 0.',
      commonMisconception: 'Picking 91, the greatest of the four, answers the opposite question from the one that was asked.',
    },
  },

  // ==========================================
  // Standard: NC.1.NBT.4 — Add within 100
  // ==========================================
  {
    id: 'g1-nbt4-01',
    standardCode: 'NC.1.NBT.4',
    domainId: 'NBT',
    prompt: 'What is 19 + 1?',
    options: labelOptions([
      { text: '20', isCorrect: true },
      { text: '110', isCorrect: false, misconception: 'wrote-the-digits-side-by-side-instead-of-adding-the-values' },
      { text: '19', isCorrect: false, misconception: 'restated-a-known-number-instead-of-solving' },
      { text: '21', isCorrect: false, misconception: 'counted-on-by-ones-one-too-many' },
    ]),
    calculatorAllowed: false,
    isStretch: false,
    difficulty: 'mastery',
    explanation: {
      stepByStep: [
        'Step 1: 19 is 1 ten and 9 ones. Adding 1 more one makes 10 ones.',
        'Step 2: 10 ones trade for 1 new ten, so there are now 2 tens and 0 ones.',
        'Step 3: 19 + 1 = 20.',
      ],
      conceptSummary: 'When the ones add up to 10, they trade for a new ten. 19 + 1 makes a new ten, not a "10" written next to the old one.',
      commonMisconception: 'Writing the new "10" ones right next to the old 1 ten, instead of trading, gives 110 instead of 20.',
    },
  },
  {
    id: 'g1-nbt4-02',
    standardCode: 'NC.1.NBT.4',
    domainId: 'NBT',
    prompt: 'Mia has 24 crayons and gets 3 more. How many crayons now?',
    options: labelOptions([
      { text: '21', isCorrect: false, misconception: 'subtracted-instead-of-added' },
      { text: '27', isCorrect: true },
      { text: '54', isCorrect: false, misconception: 'added-the-second-addend-into-the-tens-place' },
      { text: '7', isCorrect: false, misconception: 'dropped-the-tens-digit-when-adding' },
    ]),
    calculatorAllowed: false,
    isStretch: false,
    difficulty: 'advanced',
    explanation: {
      stepByStep: [
        'Step 1: 24 is 2 tens and 4 ones.',
        'Step 2: Add the ones: 4 + 3 = 7.',
        'Step 3: 2 tens and 7 ones is 27, so Mia has 27 crayons.',
      ],
      conceptSummary: 'Adding a one-digit number changes only the ones digit of a two-digit number, as long as the ones do not add up to 10 or more.',
      commonMisconception: 'Adding the 3 into the tens place instead of the ones place gives 54, far more crayons than were added.',
    },
  },
  {
    id: 'g1-nbt4-03',
    standardCode: 'NC.1.NBT.4',
    domainId: 'NBT',
    prompt: 'There are 45 leaves, and 20 more fall. How many leaves now?',
    options: labelOptions([
      { text: '45', isCorrect: false, misconception: 'left-one-of-the-addends-out' },
      { text: '47', isCorrect: false, misconception: 'used-the-tens-digit-as-ones' },
      { text: '65', isCorrect: true },
      { text: '60', isCorrect: false, misconception: 'dropped-the-ones-digit-of-the-two-digit-number' },
    ]),
    calculatorAllowed: false,
    isStretch: false,
    difficulty: 'mastery',
    explanation: {
      stepByStep: [
        'Step 1: 20 is 2 tens.',
        `Step 2: ${unitCount(4, 'ten')} and ${unitCount(2, 'ten')} is ${unitCount(6, 'ten')}.`,
        'Step 3: 6 tens and 5 ones is 65, so there are 65 leaves now.',
      ],
      conceptSummary: 'Adding a multiple of 10 changes only the tens digit of a two-digit number. The ones digit never changes.',
      commonMisconception: 'Dropping the 5 ones of 45 gives 60, losing the ones that were already there.',
    },
  },

  // ==========================================
  // Standard: NC.1.NBT.5 — Mentally Find 10 More or 10 Less
  // ==========================================
  {
    id: 'g1-nbt5-01',
    standardCode: 'NC.1.NBT.5',
    domainId: 'NBT',
    prompt: 'Leo has 47 stickers, and his friend gives him 10 more. How many now?',
    options: labelOptions([
      { text: '37', isCorrect: false, misconception: 'gave-10-less-instead-of-10-more' },
      { text: '48', isCorrect: false, misconception: 'changed-the-ones-digit-instead-of-the-tens-digit' },
      { text: '47', isCorrect: false, misconception: 'restated-a-known-number-instead-of-solving' },
      { text: '57', isCorrect: true },
    ]),
    calculatorAllowed: false,
    isStretch: false,
    difficulty: 'mastery',
    explanation: {
      stepByStep: [
        'Step 1: 10 more only changes the tens digit.',
        `Step 2: 47 is ${unitCount(4, 'ten')} and ${unitCount(7, 'one')}. 10 more is ${unitCount(5, 'ten')} and ${unitCount(7, 'one')}.`,
        'Step 3: 10 more than 47 is 57.',
      ],
      conceptSummary: '10 more than a two-digit number changes only the tens digit. The ones digit, 7, stays the same.',
      commonMisconception: 'Changing the ones digit instead of the tens digit gives 48, which is only 1 more, not 10.',
    },
  },
  {
    id: 'g1-nbt5-02',
    standardCode: 'NC.1.NBT.5',
    domainId: 'NBT',
    prompt: 'There are 94 pretzels, and 10 more are added. How many now?',
    options: labelOptions([
      { text: '104', isCorrect: true },
      { text: '84', isCorrect: false, misconception: 'gave-10-less-instead-of-10-more' },
      { text: '95', isCorrect: false, misconception: 'changed-the-ones-digit-instead-of-the-tens-digit' },
      { text: '94', isCorrect: false, misconception: 'restated-a-known-number-instead-of-solving' },
    ]),
    calculatorAllowed: false,
    isStretch: false,
    difficulty: 'advanced',
    explanation: {
      stepByStep: [
        'Step 1: 94 is 9 tens and 4 ones.',
        'Step 2: 10 more than 9 tens is 10 tens, which trades for 1 new hundred.',
        'Step 3: 10 more than 94 is 104.',
      ],
      conceptSummary: '10 more still works the same way once a number is close to 100 — it just crosses into a new hundred, the same way 9 + 1 crosses into a new ten.',
      commonMisconception: 'Giving 10 less instead of 10 more lands on 84, moving the wrong direction.',
    },
  },
  {
    id: 'g1-nbt5-03',
    standardCode: 'NC.1.NBT.5',
    domainId: 'NBT',
    prompt: 'Ana had 13 crayons and gave 10 away. How many are left?',
    options: labelOptions([
      { text: '23', isCorrect: false, misconception: 'gave-10-less-instead-of-10-more' },
      { text: '3', isCorrect: true },
      { text: '12', isCorrect: false, misconception: 'changed-the-ones-digit-instead-of-the-tens-digit' },
      { text: '13', isCorrect: false, misconception: 'restated-a-known-number-instead-of-solving' },
    ]),
    calculatorAllowed: false,
    isStretch: false,
    difficulty: 'mastery',
    explanation: {
      stepByStep: [
        'Step 1: 13 is 1 ten and 3 ones.',
        'Step 2: 10 less takes away the whole ten, leaving 0 tens and 3 ones.',
        'Step 3: 10 less than 13 is 3.',
      ],
      conceptSummary: '10 less than a two-digit number changes only the tens digit. Once the tens digit reaches 0, only the ones are left.',
      commonMisconception: 'Giving 10 more instead of 10 less lands on 23, moving the wrong direction.',
    },
  },

  // ==========================================
  // Standard: NC.1.NBT.6 — Subtract Multiples of 10
  // ==========================================
  {
    id: 'g1-nbt6-01',
    standardCode: 'NC.1.NBT.6',
    domainId: 'NBT',
    prompt: 'There are 60 apples, and 20 are sold. How many are left?',
    options: labelOptions([
      { text: '80', isCorrect: false, misconception: 'added-instead-of-subtracted-the-multiples-of-ten' },
      { text: '4', isCorrect: false, misconception: 'subtracted-the-tens-digits-without-the-zeros' },
      { text: '40', isCorrect: true },
      { text: '60', isCorrect: false, misconception: 'restated-a-known-number-instead-of-solving' },
    ]),
    calculatorAllowed: false,
    isStretch: false,
    difficulty: 'mastery',
    explanation: {
      stepByStep: [
        `Step 1: 60 is ${unitCount(6, 'ten')}. 20 is ${unitCount(2, 'ten')}.`,
        `Step 2: ${unitCount(6, 'ten')} take away ${unitCount(2, 'ten')} is ${unitCount(4, 'ten')}.`,
        'Step 3: 4 tens is 40, so 40 apples are left.',
      ],
      conceptSummary: 'Subtracting multiples of 10 works on the tens digit, the same way subtracting ones does: 6 tens take away 2 tens is 4 tens.',
      commonMisconception: 'Reporting just the digit, 4, instead of what it is worth, 40, leaves off a whole zero.',
    },
  },
  {
    id: 'g1-nbt6-02',
    standardCode: 'NC.1.NBT.6',
    domainId: 'NBT',
    prompt: 'A garden has 70 flowers, and 40 are picked. How many are left?',
    options: labelOptions([
      { text: '110', isCorrect: false, misconception: 'added-instead-of-subtracted-the-multiples-of-ten' },
      { text: '3', isCorrect: false, misconception: 'subtracted-the-tens-digits-without-the-zeros' },
      { text: '70', isCorrect: false, misconception: 'restated-a-known-number-instead-of-solving' },
      { text: '30', isCorrect: true },
    ]),
    calculatorAllowed: false,
    isStretch: false,
    difficulty: 'advanced',
    explanation: {
      stepByStep: [
        `Step 1: 70 is ${unitCount(7, 'ten')}. 40 is ${unitCount(4, 'ten')}.`,
        `Step 2: ${unitCount(7, 'ten')} take away ${unitCount(4, 'ten')} is ${unitCount(3, 'ten')}.`,
        'Step 3: 3 tens is 30, so 30 flowers are left.',
      ],
      conceptSummary: 'Subtracting one multiple of 10 from another only takes tens away from tens. 7 tens take away 4 tens is 3 tens.',
      commonMisconception: 'Adding instead of subtracting gives 110, more flowers than the garden started with.',
    },
  },
  {
    id: 'g1-nbt6-03',
    standardCode: 'NC.1.NBT.6',
    domainId: 'NBT',
    prompt: 'There were 80 birds, and 30 flew away. How many remain?',
    options: labelOptions([
      { text: '50', isCorrect: true },
      { text: '110', isCorrect: false, misconception: 'added-instead-of-subtracted-the-multiples-of-ten' },
      { text: '5', isCorrect: false, misconception: 'subtracted-the-tens-digits-without-the-zeros' },
      { text: '30', isCorrect: false, misconception: 'restated-a-known-number-instead-of-solving' },
    ]),
    calculatorAllowed: false,
    isStretch: false,
    difficulty: 'mastery',
    explanation: {
      stepByStep: [
        `Step 1: 80 is ${unitCount(8, 'ten')}. 30 is ${unitCount(3, 'ten')}.`,
        `Step 2: ${unitCount(8, 'ten')} take away ${unitCount(3, 'ten')} is ${unitCount(5, 'ten')}.`,
        'Step 3: 5 tens is 50, so 50 birds remain.',
      ],
      conceptSummary: 'Subtracting multiples of 10 is subtracting tens from tens: 8 tens take away 3 tens is 5 tens.',
      commonMisconception: 'Restating the 30 that flew away, instead of solving for how many remain, gives back a number already in the problem.',
    },
  },
];
