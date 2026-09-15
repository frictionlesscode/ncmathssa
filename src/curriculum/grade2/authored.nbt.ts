import type { Question } from '../../engine/questionModel';
import { labelOptions } from '../../engine/questionModel';

/**
 * The authored Grade 2 Number & Operations in Base Ten bank.
 *
 * This is the year place value starts. A seven-year-old reads these, so the
 * sentences are short and one-clause, every number sits inside the standard's
 * own stated range, and every incorrect option is the value a real Grade 2
 * student reaches by one named error — stated precisely, with the arithmetic
 * written out in a `//` comment above it.
 *
 * Scope, from the sourced NC text in `./standards.ts` (which WINS over any
 * brief, and over recall of the Common Core standard that shares the number):
 *
 *   NC.2.NBT.1 — the three digits of a three-digit number as hundreds, tens
 *                and ones. Three keyConcepts, one item each, plus a fourth:
 *                unitizing (ten tens make a hundred); 100, 200 … 900 as N
 *                hundreds with 0 tens and 0 ones; and COMPOSE AND DECOMPOSE
 *                USING VARIOUS GROUPINGS. That third bullet — 243 is 2
 *                hundreds + 4 tens + 3 ones AND ALSO 1 hundred + 14 tens + 3
 *                ones — is the hardest and most-assessed part of the standard
 *                and the easiest to skip, so it carries TWO items here
 *                (g2-nbt1-03, g2-nbt1-04) and the generator as well.
 *   NC.2.NBT.2 — count within 1,000, AND skip-count by 5s, 10s and 100s.
 *                Plain counting is half the sourced sentence and is not
 *                skip-counting, so g2-nbt2-01 is a counting item; the other
 *                three take one interval each.
 *   NC.2.NBT.3 — read and write within 1,000 in base-ten numerals, number
 *                names AND expanded form. All three representations appear:
 *                name -> numeral (01), numeral -> name (02), expanded form
 *                (03, 04).
 *   NC.2.NBT.4 — compare two three-digit numbers BY THE VALUE of the
 *                hundreds, tens and ones digits. The sourced third keyConcept
 *                is "comparing place by place rather than by digit count
 *                alone", so every option here carries its reasoning and the
 *                digit-count shortcut is on offer as a named wrong answer.
 *   NC.2.NBT.5 — fluency within 100. A STRATEGY standard, not a drill: its
 *                three keyConcepts are using strategies flexibly, COMPARING
 *                strategies and explaining why they work, and SELECTING an
 *                appropriate one. See the division of labour note below.
 *   NC.2.NBT.6 — add up to THREE two-digit numbers. Three, not four: CCSS
 *                2.NBT.B.6 says four and NC cut it down, and `standards.ts`
 *                is the ground truth. Nothing here or in the generator ever
 *                adds a fourth addend.
 *   NC.2.NBT.7 — add and subtract within 1,000, RELATING THE STRATEGY TO A
 *                WRITTEN METHOD. The second strategy standard; same division
 *                of labour.
 *   NC.2.NBT.8 — mentally add 10 OR 100, and mentally subtract 10 OR 100,
 *                for a number 100–900. "10 or 100", not "10 and 100": the
 *                child has to know WHICH place moves, so g2-nbt8-04 changes
 *                one then the other and every item offers the other amount
 *                as a distractor.
 *
 * DIVISION OF LABOUR on NC.2.NBT.5 and NC.2.NBT.7 (ruling 18-7). Both are
 * strategy standards whose sourced keyConcepts ask a child to compare, select
 * and explain — none of which a generator can ask, because the whole question
 * is the wording. Both keep a generator, which drills the arithmetic on fresh
 * numbers, and the "explain / compare / select" half lives here: g2-nbt5-02
 * selects a strategy, g2-nbt5-04 compares two and says why the answer is
 * unchanged, g2-nbt7-03 relates a counting-up strategy to the written method,
 * and g2-nbt7-04 selects one. The same split is written up in
 * `./templates/index.ts`.
 *
 * The errors themselves are mostly new vocabulary, declared in the Grade 2
 * Base Ten block of `../misconceptions.ts`. Grade 3's place-value tags were
 * written for estimation and for multiplying by a multiple of ten; almost
 * nothing in them names a seven-year-old losing a hundred inside a trade, or
 * restarting a count at the top of a hundred.
 *
 * The correct option sits at a varied position and is never always A.
 */
export const GRADE_2_NBT_AUTHORED: Question[] = [
  // ==========================================
  // Standard: NC.2.NBT.1 — Hundreds, Tens & Ones
  // ==========================================
  {
    id: 'g2-nbt1-01',
    standardCode: 'NC.2.NBT.1',
    domainId: 'NBT',
    // keyConcept 1: "Unitize by making a hundred from a collection of ten tens."
    prompt:
      'A teacher has 10 bundles of straws. Each bundle holds 10 straws. She unties every bundle and puts all the straws in one pile. How many straws are in the pile?',
    options: labelOptions([
      // Counted the bundles and reported that, so the tens were never turned
      // back into single straws.
      { text: '10', isCorrect: false, misconception: 'counted-the-tens-as-ones' },
      // 10 + 10 = 20: added the two tens printed in the problem instead of
      // taking ten groups OF ten.
      { text: '20', isCorrect: false, misconception: 'added-the-two-tens-instead-of-unitizing' },
      { text: '100', isCorrect: true },
      // Treated each bundle as a hundred, so ten bundles came out as 1,000 —
      // one place too far.
      { text: '1,000', isCorrect: false, misconception: 'wrong-power-of-ten' },
    ]),
    calculatorAllowed: false,
    isStretch: false,
    difficulty: 'mastery',
    explanation: {
      stepByStep: [
        'Step 1: Each bundle holds 10 straws, and there are 10 bundles.',
        'Step 2: Count the bundles by tens: 10, 20, 30, 40, 50, 60, 70, 80, 90, 100.',
        'Step 3: Ten tens make one new unit — one hundred.',
        'Step 4: The pile has 100 straws.',
      ],
      conceptSummary:
        'Ten ones make one ten, and ten tens make one hundred. That is what a hundred IS: not a bigger pile of ones you have to count, but ten tens counted as one new thing.',
      commonMisconception:
        'Seeing two 10s in the problem and adding them gives 20, but the second 10 counts the bundles, not straws. Ten OF something is very different from ten MORE.',
    },
  },
  {
    id: 'g2-nbt1-02',
    standardCode: 'NC.2.NBT.1',
    domainId: 'NBT',
    // keyConcept 2: "the numbers 100, 200 … 900 refer to one … nine hundreds,
    // with 0 tens and 0 ones."
    prompt: 'Rosa writes the number 400. What do the three digits in 400 mean?',
    options: labelOptions([
      { text: '4 hundreds, 0 tens, and 0 ones', isCorrect: true },
      // Read the one non-zero digit as if it filled every place.
      { text: '4 hundreds, 4 tens, and 4 ones', isCorrect: false, misconception: 'copied-the-digit-into-every-place' },
      // Put the 4 in the tens place instead of the hundreds place, one place
      // short.
      { text: '4 tens, 0 hundreds, and 0 ones', isCorrect: false, misconception: 'wrong-power-of-ten' },
      // Reported the digit 4 as 4 ones, ignoring the place it sits in.
      { text: '4 ones, 0 hundreds, and 0 tens', isCorrect: false, misconception: 'wrote-the-digit-not-its-value' },
    ]),
    calculatorAllowed: false,
    isStretch: false,
    difficulty: 'mastery',
    explanation: {
      stepByStep: [
        'Step 1: In a three-digit number, the places from left to right are hundreds, tens, and ones.',
        'Step 2: The 4 in 400 sits in the hundreds place, so it means 4 hundreds.',
        'Step 3: The two zeros hold the tens place and the ones place open. They say there are none of those.',
        'Step 4: So 400 means 4 hundreds, 0 tens, and 0 ones.',
      ],
      conceptSummary:
        'Every number 100, 200, 300 … 900 is simply that many hundreds, with nothing in the tens place and nothing in the ones place. The zeros are not empty space — they are what keeps the 4 sitting in the hundreds.',
      commonMisconception:
        'A zero in a number does not mean "the same digit again". It means none of that place, and it is the reason the digit beside it counts for a hundred and not for one.',
    },
  },
  {
    id: 'g2-nbt1-03',
    standardCode: 'NC.2.NBT.1',
    domainId: 'NBT',
    // keyConcept 3: "Compose and decompose numbers using VARIOUS GROUPINGS of
    // hundreds, tens, and ones." 243 = 2 H + 4 T + 3 O = 1 H + 14 T + 3 O.
    prompt:
      'Jae shows 243 with blocks: 2 hundreds, 4 tens, and 3 ones. Then Jae trades one hundred for ten tens. Which grouping still shows 243?',
    options: labelOptions([
      // 143: gave the hundred up but never counted the ten tens it turned into,
      // so a whole hundred went missing.
      { text: '1 hundred, 4 tens, and 3 ones', isCorrect: false, misconception: 'lost-the-hundred-in-the-trade' },
      { text: '1 hundred, 14 tens, and 3 ones', isCorrect: true },
      // 343: took the ten tens but kept the hundred as well, counting it twice.
      { text: '2 hundreds, 14 tens, and 3 ones', isCorrect: false, misconception: 'kept-the-hundred-and-the-ten-tens-both' },
      // 153: traded the hundred for a single ten instead of for ten tens, so
      // the number lost 90.
      { text: '1 hundred, 5 tens, and 3 ones', isCorrect: false, misconception: 'traded-a-hundred-for-one-ten' },
    ]),
    calculatorAllowed: false,
    isStretch: false,
    difficulty: 'advanced',
    explanation: {
      stepByStep: [
        'Step 1: Jae starts with 2 hundreds, 4 tens, and 3 ones. That is 200 + 40 + 3 = 243.',
        'Step 2: One hundred is traded away, so 1 hundred is left.',
        'Step 3: That hundred does not disappear. It comes back as ten tens, and 4 tens + 10 tens = 14 tens.',
        'Step 4: The same number, grouped a new way, is 1 hundred, 14 tens, and 3 ones.',
      ],
      conceptSummary:
        'The same number can be grouped in more than one way. Trading one hundred for ten tens changes how the blocks look but not how many there are, because a hundred and ten tens are worth exactly the same.',
      commonMisconception:
        'A trade always has two halves: something goes and something the same size comes back. Doing only half of it — dropping the hundred, or keeping it as well — changes the number by 100 in one direction or the other.',
    },
  },
  {
    id: 'g2-nbt1-04',
    standardCode: 'NC.2.NBT.1',
    domainId: 'NBT',
    // Various groupings again, this time composing: more than 9 tens are given
    // and the child has to build the number rather than read it off.
    prompt: 'Priya has 4 hundreds and 12 tens. What number does Priya have?',
    options: labelOptions([
      // 400 + 120 = 520.
      { text: '520', isCorrect: true },
      // Wrote the counts side by side as digits — a 4 and then a 12 — instead
      // of adding 400 and 120.
      { text: '412', isCorrect: false, misconception: 'wrote-the-digits-side-by-side-instead-of-adding-the-values' },
      // Read the 12 tens as 1 hundred and 2 ONES: 400 + 100 + 2 = 502.
      { text: '502', isCorrect: false, misconception: 'wrong-power-of-ten' },
      // Made a hundred out of ten of the tens and wrote the 2 tens that were
      // left, but never added the new hundred in: 400 + 20 = 420.
      { text: '420', isCorrect: false, misconception: 'lost-the-hundred-in-the-trade' },
    ]),
    calculatorAllowed: false,
    isStretch: true,
    difficulty: 'stretch',
    explanation: {
      stepByStep: [
        'Step 1: 4 hundreds is 400.',
        'Step 2: 12 tens is 120, because ten of those tens make one hundred and 2 tens are left over.',
        'Step 3: So Priya has 400 + 100 + 20.',
        'Step 4: Priya has 520.',
      ],
      conceptSummary:
        'A number can be given with more than 9 of a place. Ten of those tens are traded up into one hundred, and what is left stays in the tens — the amount never changes, only the way it is written.',
      commonMisconception:
        'Writing "4" and "12" next to each other gives 412, but that puts the 1 of the 12 into the tens place and the 2 into the ones. Twelve tens is 120, not 12.',
    },
  },

  // ==========================================
  // Standard: NC.2.NBT.2 — Count & Skip-Count within 1,000
  // ==========================================
  {
    id: 'g2-nbt2-01',
    standardCode: 'NC.2.NBT.2',
    domainId: 'NBT',
    // "Count within 1000" — the half of the standard that is not skip-counting,
    // asked at the place counting is hardest: the top of a hundred.
    prompt: 'Ben counts by ones. He says 597, 598, 599. What number does Ben say next?',
    options: labelOptions([
      // Reached the end of the hundred and went back to its start.
      { text: '500', isCorrect: false, misconception: 'restarted-the-count-at-the-start-of-the-hundred' },
      // Bumped the hundreds digit instead of counting on one: 599 + 100.
      { text: '699', isCorrect: false, misconception: 'wrong-power-of-ten' },
      { text: '600', isCorrect: true },
      // Said "five hundred, one hundred" and wrote it down that way instead of
      // trading up to the next hundred.
      { text: '5,100', isCorrect: false, misconception: 'wrote-the-next-hundred-beside-the-old-one' },
    ]),
    calculatorAllowed: false,
    isStretch: false,
    difficulty: 'mastery',
    explanation: {
      stepByStep: [
        'Step 1: 599 is 5 hundreds, 9 tens, and 9 ones.',
        'Step 2: One more makes 10 ones. Ten ones trade up into one more ten, giving 10 tens.',
        'Step 3: Ten tens trade up again into one more hundred, so the 5 hundreds become 6 hundreds and the tens and ones are 0.',
        'Step 4: Ben says 600 next.',
      ],
      conceptSummary:
        'Counting past 599 is two trades in a row: ten ones become a ten, and then ten tens become a hundred. Every place rolls over to 0 and the place to its left goes up by one.',
      commonMisconception:
        'The count does not start over at 500 when the 99 runs out. The hundreds digit goes up by one and the count carries straight on into the next hundred.',
    },
  },
  {
    id: 'g2-nbt2-02',
    standardCode: 'NC.2.NBT.2',
    domainId: 'NBT',
    // Skip-counting by 5s.
    prompt: 'Nia begins at 245 and skip-counts by 5s. Which list shows the next three numbers Nia says?',
    options: labelOptions([
      // Counted on by ones instead of taking steps of 5.
      { text: '246, 247, 248', isCorrect: false, misconception: 'counted-by-ones-instead-of-the-given-step' },
      { text: '250, 255, 260', isCorrect: true },
      // Stepped by 10 instead of by 5.
      { text: '255, 265, 275', isCorrect: false, misconception: 'skip-counted-by-the-wrong-step' },
      // Wrote the number Nia started from as the first number she says, so the
      // list is one step behind all the way along.
      { text: '245, 250, 255', isCorrect: false, misconception: 'listed-the-starting-number-as-the-first-count' },
    ]),
    calculatorAllowed: false,
    isStretch: false,
    difficulty: 'mastery',
    explanation: {
      stepByStep: [
        'Step 1: Skip-counting by 5s means adding 5 each time.',
        'Step 2: 245 + 5 = 250.',
        'Step 3: 250 + 5 = 255, and 255 + 5 = 260.',
        'Step 4: The next three numbers are 250, 255, 260.',
      ],
      conceptSummary:
        'A skip count is repeated addition of the same step. Starting from 245, every number counted by 5s ends in a 0 or a 5.',
      commonMisconception:
        'The number you start from is not one of the numbers you say next. Listing it first pushes every other number in the list one step too early.',
    },
  },
  {
    id: 'g2-nbt2-03',
    standardCode: 'NC.2.NBT.2',
    domainId: 'NBT',
    // Skip-counting by 100s from a number that is NOT a multiple of 100 — the
    // case where changing the hundreds digit and restarting the count look the
    // same to a child and are not.
    prompt: 'Omar begins at 380 and skip-counts by 100s. Which list shows the next three numbers Omar says?',
    options: labelOptions([
      { text: '480, 580, 680', isCorrect: true },
      // Changed the hundreds digit but threw the 80 away, as if counting by
      // hundreds meant reciting 400, 500, 600.
      { text: '400, 500, 600', isCorrect: false, misconception: 'changed-the-hundreds-digit-and-dropped-the-rest' },
      // Stepped by 10 instead of by 100.
      { text: '390, 400, 410', isCorrect: false, misconception: 'skip-counted-by-the-wrong-step' },
      // Wrote the starting number as the first count.
      { text: '380, 480, 580', isCorrect: false, misconception: 'listed-the-starting-number-as-the-first-count' },
    ]),
    calculatorAllowed: false,
    isStretch: false,
    difficulty: 'mastery',
    explanation: {
      stepByStep: [
        'Step 1: Skip-counting by 100s means adding 100 each time.',
        'Step 2: 380 + 100 = 480. The 8 tens stay exactly where they are.',
        'Step 3: 480 + 100 = 580, and 580 + 100 = 680.',
        'Step 4: The next three numbers are 480, 580, 680.',
      ],
      conceptSummary:
        'Adding 100 changes only the hundreds place. The tens and the ones do not move, which is why a count by hundreds from 380 keeps the 80 the whole way.',
      commonMisconception:
        'Counting by hundreds is not the same as reciting 100, 200, 300. Starting from 380, the count goes 480, 580, 680 — the 80 rides along.',
    },
  },
  {
    id: 'g2-nbt2-04',
    standardCode: 'NC.2.NBT.2',
    domainId: 'NBT',
    // Skip-counting by 10s from a number with a non-zero ones digit.
    prompt: 'Lia begins at 462 and skip-counts by 10s. Which list shows the next three numbers Lia says?',
    options: labelOptions([
      // Counted on by ones instead of by tens.
      { text: '463, 464, 465', isCorrect: false, misconception: 'counted-by-ones-instead-of-the-given-step' },
      // Jumped to the next number ending in 0 instead of adding 10 to 462.
      { text: '470, 480, 490', isCorrect: false, misconception: 'jumped-to-the-next-ten-instead-of-adding-ten' },
      // Stepped by 100 instead of by 10.
      { text: '562, 662, 762', isCorrect: false, misconception: 'skip-counted-by-the-wrong-step' },
      { text: '472, 482, 492', isCorrect: true },
    ]),
    calculatorAllowed: false,
    isStretch: false,
    difficulty: 'mastery',
    explanation: {
      stepByStep: [
        'Step 1: Skip-counting by 10s means adding 10 each time.',
        'Step 2: 462 + 10 = 472. Only the tens digit changes.',
        'Step 3: 472 + 10 = 482, and 482 + 10 = 492.',
        'Step 4: The next three numbers are 472, 482, 492.',
      ],
      conceptSummary:
        'Adding 10 moves the tens place up by one and leaves the ones alone. A count by 10s does not have to land on numbers ending in 0 — it keeps whatever ones digit it started with.',
      commonMisconception:
        'Jumping from 462 straight to 470 is a step of 8, not a step of 10. Counting by tens from 462 gives 472, and every number in the count still ends in 2.',
    },
  },

  // ==========================================
  // Standard: NC.2.NBT.3 — Read & Write Numbers within 1,000
  // ==========================================
  {
    id: 'g2-nbt3-01',
    standardCode: 'NC.2.NBT.3',
    domainId: 'NBT',
    // Number name -> base-ten numeral, across a zero place. The classic error
    // is reading "four hundred seven" as forty-seven.
    prompt: 'Which number is four hundred seven?',
    options: labelOptions([
      // Closed the empty tens place up, so the 7 slid into the tens.
      { text: '47', isCorrect: false, misconception: 'skipped-the-zero-place' },
      { text: '407', isCorrect: true },
      // Put the 7 in the tens place and a 0 in the ones.
      { text: '470', isCorrect: false, misconception: 'put-a-digit-in-the-wrong-place' },
      // Wrote "four hundred" and stopped, leaving the seven off.
      { text: '400', isCorrect: false, misconception: 'left-off-part-of-the-number-name' },
    ]),
    calculatorAllowed: false,
    isStretch: false,
    difficulty: 'mastery',
    explanation: {
      stepByStep: [
        'Step 1: "Four hundred" means 4 in the hundreds place.',
        'Step 2: The name says nothing about tens, so the tens place holds 0.',
        'Step 3: "Seven" means 7 in the ones place.',
        'Step 4: Four hundred seven is written 407.',
      ],
      conceptSummary:
        'A number name only says the places that have something in them. Every place it skips still needs a 0 written in, or the digits after it land in the wrong columns.',
      commonMisconception:
        'Leaving the tens place out turns 407 into 47 — a number ten times smaller, and not even a three-digit number any more. The 0 is doing real work.',
    },
  },
  {
    id: 'g2-nbt3-02',
    standardCode: 'NC.2.NBT.3',
    domainId: 'NBT',
    // Base-ten numeral -> number name, the other direction.
    prompt: 'How is 512 written in words?',
    options: labelOptions([
      { text: 'Five hundred twelve', isCorrect: true },
      // Swapped the tens and ones digits: 521 read out.
      { text: 'Five hundred twenty-one', isCorrect: false, misconception: 'put-a-digit-in-the-wrong-place' },
      // Read the three digits one at a time instead of reading 12 as twelve.
      { text: 'Five hundred one two', isCorrect: false, misconception: 'read-the-digits-one-at-a-time' },
      // Read the 1 in the tens place as nothing at all, so the ten fell out of
      // the name.
      { text: 'Five hundred two', isCorrect: false, misconception: 'left-off-part-of-the-number-name' },
    ]),
    calculatorAllowed: false,
    isStretch: false,
    difficulty: 'mastery',
    explanation: {
      stepByStep: [
        'Step 1: 512 is 5 hundreds, 1 ten, and 2 ones.',
        'Step 2: The 5 hundreds is read "five hundred".',
        'Step 3: The 1 ten and the 2 ones are read together as one word, "twelve", not as "one" and "two".',
        'Step 4: 512 is written Five hundred twelve.',
      ],
      conceptSummary:
        'The last two digits of a three-digit number are read together as one number name. That is why 512 is "five hundred twelve" and not "five hundred one two".',
      commonMisconception:
        'Reading digits one at a time works for a phone number, not for a number name. A digit gets its name from the place it sits in.',
    },
  },
  {
    id: 'g2-nbt3-03',
    standardCode: 'NC.2.NBT.3',
    domainId: 'NBT',
    // Expanded form.
    prompt: 'Ravi writes 364 in expanded form. Which one did Ravi write?',
    options: labelOptions([
      // Wrote the digits themselves instead of what each one is worth.
      { text: '3 + 6 + 4', isCorrect: false, misconception: 'wrote-the-digit-not-its-value' },
      // Gave every digit a hundreds value, so the tens and ones came out a
      // hundred times too big.
      { text: '300 + 600 + 400', isCorrect: false, misconception: 'wrong-power-of-ten' },
      { text: '300 + 60 + 4', isCorrect: true },
      // Swapped the hundreds and ones digits before expanding.
      { text: '400 + 60 + 3', isCorrect: false, misconception: 'put-a-digit-in-the-wrong-place' },
    ]),
    calculatorAllowed: false,
    isStretch: false,
    difficulty: 'mastery',
    explanation: {
      stepByStep: [
        'Step 1: 364 has a 3 in the hundreds place, a 6 in the tens place, and a 4 in the ones place.',
        'Step 2: The 3 is worth 300, the 6 is worth 60, and the 4 is worth 4.',
        'Step 3: Expanded form writes those three values added together.',
        'Step 4: Ravi wrote 300 + 60 + 4.',
      ],
      conceptSummary:
        'Expanded form pulls a number apart into what each digit is worth. Adding the parts back up has to give the number you started with — 300 + 60 + 4 = 364.',
      commonMisconception:
        'Writing 3 + 6 + 4 gives 13, nowhere near 364. A digit on its own is not its value; the place it sits in is what tells you what it is worth.',
    },
  },
  {
    id: 'g2-nbt3-04',
    standardCode: 'NC.2.NBT.3',
    domainId: 'NBT',
    // Expanded form read backwards, across a zero place.
    prompt: 'Which number is the same as 600 + 5?',
    options: labelOptions([
      // Closed the empty tens place up, so the 5 slid into the tens.
      { text: '65', isCorrect: false, misconception: 'skipped-the-zero-place' },
      // Put the 5 in the tens place and a 0 in the ones.
      { text: '650', isCorrect: false, misconception: 'put-a-digit-in-the-wrong-place' },
      { text: '605', isCorrect: true },
      // Wrote the 600 and left the 5 off.
      { text: '600', isCorrect: false, misconception: 'left-off-part-of-the-number-name' },
    ]),
    calculatorAllowed: false,
    isStretch: false,
    difficulty: 'mastery',
    explanation: {
      stepByStep: [
        'Step 1: 600 puts a 6 in the hundreds place.',
        'Step 2: There is no tens part in 600 + 5, so the tens place holds 0.',
        'Step 3: The 5 goes in the ones place.',
        'Step 4: 600 + 5 is the same as 605.',
      ],
      conceptSummary:
        'Putting an expanded form back together means writing each part in its own column. A place with nothing in it gets a 0 so the other digits stay where they belong.',
      commonMisconception:
        'Squeezing 600 and 5 together into 65 drops a whole place. 65 is sixty-five; 605 is six hundred five.',
    },
  },

  // ==========================================
  // Standard: NC.2.NBT.4 — Compare Three-Digit Numbers
  // ==========================================
  {
    id: 'g2-nbt4-01',
    standardCode: 'NC.2.NBT.4',
    domainId: 'NBT',
    // Same hundreds digit, same three digits in a different order: digit count
    // and hundreds place are both useless, so the tens place has to decide it.
    prompt: 'Which sentence about 638 and 683 is TRUE?',
    options: labelOptions([
      // Compared the ones digits, 8 against 3, and stopped there.
      { text: '638 > 683, because 8 ones is more than 3 ones', isCorrect: false, misconception: 'compared-the-wrong-place-first' },
      { text: '638 < 683, because 3 tens is less than 8 tens', isCorrect: true },
      // Stopped after the hundreds place, where the digits match.
      { text: '638 = 683, because both numbers have 6 hundreds', isCorrect: false, misconception: 'stopped-comparing-too-soon' },
      // Same digits, so same number — place value never entered into it.
      { text: '638 = 683, because both numbers use the digits 6, 3, and 8', isCorrect: false, misconception: 'same-digits-read-as-the-same-number' },
    ]),
    calculatorAllowed: false,
    isStretch: false,
    difficulty: 'mastery',
    explanation: {
      stepByStep: [
        'Step 1: Start at the greatest place. Both numbers have 6 hundreds, so the hundreds cannot decide it.',
        'Step 2: Move right to the tens. 638 has 3 tens and 683 has 8 tens.',
        'Step 3: 3 tens is 30 and 8 tens is 80, so 683 is the greater number.',
        'Step 4: 638 < 683, because 3 tens is less than 8 tens.',
      ],
      conceptSummary:
        'Comparing goes left to right: hundreds first, then tens, then ones. The first place where the digits differ settles it, and nothing to the right of that can change the answer.',
      commonMisconception:
        'Two numbers made of the same digits are almost never equal. 638 and 683 both use 6, 3 and 8, but the 8 is worth 80 in one of them and only 8 in the other.',
    },
  },
  {
    id: 'g2-nbt4-02',
    standardCode: 'NC.2.NBT.4',
    domainId: 'NBT',
    // keyConcept 3: "Comparing place by place rather than by digit count
    // alone." Both numbers have three digits, so the digit-count shortcut is
    // on offer and gets the right answer for the wrong reason.
    prompt: 'Deja says 419 is greater than 462 because 9 is greater than 2. Which sentence is true?',
    options: labelOptions([
      { text: 'No. 419 < 462, because 1 ten is less than 6 tens', isCorrect: true },
      // Agreed with Deja: compared the ones digits and ignored the tens.
      { text: 'Yes. 419 > 462, because 9 ones is more than 2 ones', isCorrect: false, misconception: 'compared-the-wrong-place-first' },
      // Counted digits instead of comparing places — and both numbers have
      // three digits, so there is nothing to count.
      { text: 'Yes. 419 > 462, because 419 has more digits than 462', isCorrect: false, misconception: 'compared-by-digit-count-not-place-value' },
      // Stopped after the hundreds place, where the digits match.
      { text: 'No. 419 = 462, because both numbers have 4 hundreds', isCorrect: false, misconception: 'stopped-comparing-too-soon' },
    ]),
    calculatorAllowed: false,
    isStretch: false,
    difficulty: 'advanced',
    explanation: {
      stepByStep: [
        'Step 1: Both numbers have 4 hundreds, so the hundreds place does not decide it.',
        'Step 2: Look at the tens next. 419 has 1 ten and 462 has 6 tens.',
        'Step 3: 1 ten is 10 and 6 tens is 60, so 419 is the smaller number. The ones digits never get a turn.',
        'Step 4: No. 419 < 462, because 1 ten is less than 6 tens.',
      ],
      conceptSummary:
        'The ones place only matters when the hundreds and the tens are both tied. A big ones digit cannot rescue a number that is already behind in the tens.',
      commonMisconception:
        'Counting how many digits a number has decides nothing here — 419 and 462 both have three. Comparing means going place by place, starting from the greatest.',
    },
  },
  {
    id: 'g2-nbt4-03',
    standardCode: 'NC.2.NBT.4',
    domainId: 'NBT',
    prompt: 'Which of these numbers is the GREATEST: 538, 509, 472, or 461?',
    options: labelOptions([
      // Picked the number with the biggest ones digit.
      { text: '509', isCorrect: false, misconception: 'compared-the-wrong-place-first' },
      // Picked the number with the biggest tens digit, without checking the
      // hundreds first.
      { text: '472', isCorrect: false, misconception: 'compared-the-tens-before-the-hundreds' },
      // Found the right order but answered with the smallest number.
      { text: '461', isCorrect: false, misconception: 'answered-with-the-least-instead-of-the-greatest' },
      { text: '538', isCorrect: true },
    ]),
    calculatorAllowed: false,
    isStretch: false,
    difficulty: 'mastery',
    explanation: {
      stepByStep: [
        'Step 1: Compare the hundreds first. 538 and 509 have 5 hundreds; 472 and 461 have only 4.',
        'Step 2: So the greatest number is 538 or 509, and the other two are out.',
        'Step 3: Both have 5 hundreds, so compare the tens: 3 tens beats 0 tens.',
        'Step 4: The greatest number is 538.',
      ],
      conceptSummary:
        'The hundreds place outranks everything to its right. A number with 5 hundreds beats every number with 4 hundreds, no matter what its tens and ones digits look like.',
      commonMisconception:
        'The 9 in 509 and the 7 in 472 are the biggest single digits on the page, and neither one matters. A digit is only worth as much as the place it sits in.',
    },
  },

  // ==========================================
  // Standard: NC.2.NBT.5 — Fluency with Addition & Subtraction within 100
  // ==========================================
  {
    id: 'g2-nbt5-01',
    standardCode: 'NC.2.NBT.5',
    domainId: 'NBT',
    // keyConcept 1: a strategy "based on place value" — break both numbers into
    // tens and ones, add each, and put them back together.
    prompt: 'Ana adds 38 + 27 by breaking the numbers apart. She works out 30 + 20 = 50 and 8 + 7 = 15. What is 38 + 27?',
    options: labelOptions([
      // Stopped after the tens and reported 50.
      { text: '50', isCorrect: false, misconception: 'forgot-the-final-step' },
      // 50 - 15 = 35: subtracted the two parts instead of adding them.
      { text: '35', isCorrect: false, misconception: 'subtracted-instead-of-added' },
      { text: '65', isCorrect: true },
      // 50 + 5 = 55: wrote only the 5 ones from 15 and never carried the ten
      // inside it into the tens.
      { text: '55', isCorrect: false, misconception: 'added-without-carrying' },
    ]),
    calculatorAllowed: false,
    isStretch: false,
    difficulty: 'mastery',
    explanation: {
      stepByStep: [
        'Step 1: Ana split both numbers by place value: 38 is 30 and 8, and 27 is 20 and 7.',
        'Step 2: The tens add to 50 and the ones add to 15.',
        'Step 3: Now put the two parts back together: 50 + 15.',
        'Step 4: 38 + 27 = 65.',
      ],
      conceptSummary:
        'Breaking numbers into tens and ones turns one hard addition into two easy ones. The last step is the one that finishes it — the two parts have to be added back together.',
      commonMisconception:
        'The 15 from the ones is not 5. It is one ten and five ones, so the ten it holds has to join the tens: 50 + 15 = 65, not 55.',
    },
  },
  {
    id: 'g2-nbt5-02',
    standardCode: 'NC.2.NBT.5',
    domainId: 'NBT',
    // keyConcept 3: "Selecting an appropriate strategy in order to efficiently
    // compute sums and differences." The question is which strategy, not what
    // the sum is, so no generator can ask it.
    prompt: 'Sam wants to work out 46 + 29 in his head. Which way is quickest?',
    options: labelOptions([
      // Counting 29 separate ones is slow and loses count easily — the very
      // thing a place-value strategy exists to avoid.
      { text: 'Count on 29 ones from 46', isCorrect: false, misconception: 'counted-on-by-ones-instead-of-using-place-value' },
      { text: 'Add 46 + 30, then take away 1', isCorrect: true },
      // Rounded 29 up to 30 and then added the extra 1 on as well, instead of
      // taking it back off.
      { text: 'Add 46 + 30, then add 1 more', isCorrect: false, misconception: 'compensated-in-the-wrong-direction' },
      // Reached for the wrong operation entirely.
      { text: 'Take away 29 from 46', isCorrect: false, misconception: 'subtracted-instead-of-added' },
    ]),
    calculatorAllowed: false,
    isStretch: false,
    difficulty: 'advanced',
    explanation: {
      stepByStep: [
        'Step 1: 29 is only 1 away from 30, and adding 30 is easy in your head.',
        'Step 2: 46 + 30 = 76.',
        'Step 3: But 30 is 1 more than 29 was, so 1 extra got added. Take it back off: 76 - 1 = 75.',
        'Step 4: Add 46 + 30, then take away 1 — that gives 75.',
      ],
      conceptSummary:
        'Choosing a strategy is part of the mathematics. Rounding one number up to a friendly ten makes the addition easy, as long as the extra that was added gets taken back off at the end.',
      commonMisconception:
        'If you add too much, you must take some back. Adding 1 more after adding 30 moves the answer further away instead of correcting it.',
    },
  },
  {
    id: 'g2-nbt5-03',
    standardCode: 'NC.2.NBT.5',
    domainId: 'NBT',
    // keyConcept 1 again, this time "the relationship between addition and
    // subtraction": a subtraction answered by thinking of the matching addition.
    prompt: 'Rico works out 72 - 35 by thinking "what plus 35 makes 72?" What is 72 - 35?',
    options: labelOptions([
      { text: '37', isCorrect: true },
      // 7 - 3 = 4 tens and 5 - 2 = 3 ones: took the smaller digit from the
      // larger in each column instead of regrouping.
      { text: '43', isCorrect: false, misconception: 'subtracted-without-regrouping' },
      // 72 + 35 = 107: added instead of subtracting.
      { text: '107', isCorrect: false, misconception: 'added-instead-of-subtracted' },
      // Regrouped for the ones (12 - 5 = 7) but left the 7 tens untouched, so
      // 7 - 3 = 4 tens: the answer came out one ten too large.
      { text: '47', isCorrect: false, misconception: 'borrowed-without-reducing-the-next-column' },
    ]),
    calculatorAllowed: false,
    isStretch: false,
    difficulty: 'mastery',
    explanation: {
      stepByStep: [
        'Step 1: Rico turns the subtraction into an addition: 35 + ? = 72.',
        'Step 2: From 35, add 5 to reach 40. That is 5 so far.',
        'Step 3: From 40, add 32 more to reach 72. Altogether that is 5 + 32.',
        'Step 4: 72 - 35 = 37.',
      ],
      conceptSummary:
        'Addition and subtraction undo each other. Any subtraction can be solved by asking what has to be added to the smaller number to reach the bigger one — and the answer checks itself, because 37 + 35 = 72.',
      commonMisconception:
        'In 72 - 35 the ones column asks for 2 - 5, not 5 - 2. Flipping it to whichever way is easier gives 43, which is 6 too big, and a check by addition catches it at once.',
    },
  },
  {
    id: 'g2-nbt5-04',
    standardCode: 'NC.2.NBT.5',
    domainId: 'NBT',
    // keyConcept 2: "Comparing addition and subtraction strategies, and
    // explaining why they work." The answer is never computed here — the
    // question is why the two expressions must give the same total.
    prompt: 'Mia changes 39 + 44 into 40 + 43 and gets the same answer. Which sentence tells what Mia did?',
    options: labelOptions([
      // Adding 1 to both addends adds 2 to the total, so the answer changes.
      { text: 'She added 1 to both numbers', isCorrect: false, misconception: 'did-not-balance-the-move-between-the-addends' },
      // Moving the 1 the other way gives 38 + 45, not 40 + 43.
      { text: 'She moved 1 from 39 onto 44', isCorrect: false, misconception: 'compensated-in-the-wrong-direction' },
      { text: 'She moved 1 from 44 onto 39', isCorrect: true },
      // Counting 44 ones is not what Mia did, and it is the slow way besides.
      { text: 'She counted on 44 ones from 39', isCorrect: false, misconception: 'counted-on-by-ones-instead-of-using-place-value' },
    ]),
    calculatorAllowed: false,
    isStretch: false,
    difficulty: 'advanced',
    explanation: {
      stepByStep: [
        'Step 1: 39 became 40, so 1 was added to the first number.',
        'Step 2: 44 became 43, so 1 was taken off the second number.',
        'Step 3: The 1 did not appear or disappear — it moved across, so the total is untouched. Both equal 83.',
        'Step 4: She moved 1 from 44 onto 39.',
      ],
      conceptSummary:
        'Moving an amount from one addend to the other keeps the total the same, because nothing was added or taken away overall. That is what lets 39 + 44 be swapped for the much easier 40 + 43.',
      commonMisconception:
        'Adding 1 to both numbers is not the same move. That really does add 2 to the total, and 40 + 45 is 85, not 83.',
    },
  },

  // ==========================================
  // Standard: NC.2.NBT.6 — Add Up to Three Two-Digit Numbers
  // ==========================================
  {
    id: 'g2-nbt6-01',
    standardCode: 'NC.2.NBT.6',
    domainId: 'NBT',
    // Three two-digit numbers — the most the standard allows. Never four.
    prompt: 'What is 27 + 35 + 13?',
    options: labelOptions([
      // Ones 7 + 5 + 3 = 15, written as 5 with the ten thrown away; tens
      // 2 + 3 + 1 = 6, giving 65.
      { text: '65', isCorrect: false, misconception: 'added-without-carrying' },
      { text: '75', isCorrect: true },
      // That same ten written in the hundreds column instead of the tens:
      // 65 + 100 = 165.
      { text: '165', isCorrect: false, misconception: 'carried-into-the-wrong-column' },
      // 27 + 35 = 62: added only two of the three numbers.
      { text: '62', isCorrect: false, misconception: 'left-one-of-the-addends-out' },
    ]),
    calculatorAllowed: false,
    isStretch: false,
    difficulty: 'mastery',
    explanation: {
      stepByStep: [
        'Step 1: Add the ones first: 7 + 5 + 3 = 15.',
        'Step 2: 15 is 1 ten and 5 ones. Write the 5 and carry the ten into the tens column.',
        'Step 3: Add the tens with that carried ten: 2 + 3 + 1 + 1 = 7 tens.',
        'Step 4: 27 + 35 + 13 = 75.',
      ],
      conceptSummary:
        'Three numbers add the same way two do: every ones digit into the ones column, every tens digit into the tens column, and any ten made in the ones column carried into the column right next door.',
      commonMisconception:
        'With three numbers the ones column can pass 10 easily. Writing only the 5 from 15 and moving on loses a whole ten, and the answer comes out 10 short.',
    },
  },
  {
    id: 'g2-nbt6-02',
    standardCode: 'NC.2.NBT.6',
    domainId: 'NBT',
    // keyConcept 3: "Properties of operations, such as adding in a convenient
    // order." Jo reorders the three addends to make a friendly ten first.
    prompt: 'Jo adds 18 + 45 + 22. She adds 18 and 22 first because they make 40. What is the total?',
    options: labelOptions([
      // Stopped after the friendly pair and never added the 45.
      { text: '40', isCorrect: false, misconception: 'forgot-the-final-step' },
      // 18 + 45 = 63: added only two of the three numbers.
      { text: '63', isCorrect: false, misconception: 'left-one-of-the-addends-out' },
      { text: '85', isCorrect: true },
      // Added left to right with no carry: 18 + 45 = 53, then 53 + 22 = 75.
      { text: '75', isCorrect: false, misconception: 'added-without-carrying' },
    ]),
    calculatorAllowed: false,
    isStretch: false,
    difficulty: 'mastery',
    explanation: {
      stepByStep: [
        'Step 1: 8 ones and 2 ones make 10, so 18 + 22 = 40. That is why Jo picked that pair.',
        'Step 2: Now only one addition is left: 40 + 45.',
        'Step 3: 40 + 45 needs no carrying at all, because 4 tens + 4 tens = 8 tens and 0 + 5 = 5.',
        'Step 4: 18 + 45 + 22 = 85.',
      ],
      conceptSummary:
        'Numbers being added can be taken in any order. Looking for two whose ones make ten first turns a three-number addition into one easy step, and the total is the same whichever order is used.',
      commonMisconception:
        'Finding the friendly pair is only the start. The third number still has to join in, so 40 is halfway, not the answer.',
    },
  },
  {
    id: 'g2-nbt6-03',
    standardCode: 'NC.2.NBT.6',
    domainId: 'NBT',
    // Three two-digit numbers whose total passes 100, where the ones column
    // carries two tens rather than one.
    prompt:
      'Three classes collected cans. Class A collected 46 cans, Class B collected 38 cans, and Class C collected 57 cans. How many cans did the three classes collect in all?',
    options: labelOptions([
      { text: '141', isCorrect: true },
      // Ones 6 + 8 + 7 = 21, written as 1 with the 2 tens thrown away; tens
      // 4 + 3 + 5 = 12 tens, giving 121.
      { text: '121', isCorrect: false, misconception: 'added-without-carrying' },
      // Those 2 tens written in the hundreds column instead of the tens:
      // 121 + 200 = 321.
      { text: '321', isCorrect: false, misconception: 'carried-into-the-wrong-column' },
      // 46 + 38 = 84: Class C never got added.
      { text: '84', isCorrect: false, misconception: 'left-one-of-the-addends-out' },
    ]),
    calculatorAllowed: false,
    isStretch: false,
    difficulty: 'advanced',
    explanation: {
      stepByStep: [
        'Step 1: Add the ones: 6 + 8 + 7 = 21.',
        'Step 2: 21 is 2 tens and 1 one. Write the 1 and carry 2 tens into the tens column.',
        'Step 3: Add the tens with the carry: 4 + 3 + 5 + 2 = 14 tens, which is 1 hundred and 4 tens.',
        'Step 4: The three classes collected 141 cans.',
      ],
      conceptSummary:
        'Adding three two-digit numbers can carry more than one ten out of the ones column, and the tens column can then make a whole hundred. Each carry always lands in the column immediately to the left.',
      commonMisconception:
        'The carry out of 21 is 2 tens, not 1 — and it belongs in the tens column. Dropping it loses 20; writing it in the hundreds adds 180 too many.',
    },
  },

  // ==========================================
  // Standard: NC.2.NBT.7 — Add & Subtract within 1,000
  // ==========================================
  {
    id: 'g2-nbt7-01',
    standardCode: 'NC.2.NBT.7',
    domainId: 'NBT',
    // keyConcept 1: "Concrete models or drawings" tied to the written method —
    // the standard's own phrase is "relating the strategy to a written method".
    prompt:
      'Sam adds 236 + 147 with base-ten blocks. He puts the hundreds together, the tens together, and the ones together. The 13 ones become 1 ten and 3 ones. What is 236 + 147?',
    options: labelOptions([
      // The ten inside the 13 ones was never added to the tens: 383 - 10.
      { text: '373', isCorrect: false, misconception: 'added-without-carrying' },
      { text: '383', isCorrect: true },
      // That ten written in the hundreds column instead of the tens:
      // 373 + 100 = 473.
      { text: '473', isCorrect: false, misconception: 'carried-into-the-wrong-column' },
      // 236 - 147 = 89: subtracted instead of adding.
      { text: '89', isCorrect: false, misconception: 'subtracted-instead-of-added' },
    ]),
    calculatorAllowed: false,
    isStretch: false,
    difficulty: 'mastery',
    explanation: {
      stepByStep: [
        'Step 1: Ones first: 6 + 7 = 13 ones. Trade ten of them for 1 ten, leaving 3 ones.',
        'Step 2: Tens: 3 + 4 = 7 tens, plus the traded ten makes 8 tens.',
        'Step 3: Hundreds: 2 + 1 = 3 hundreds.',
        'Step 4: 236 + 147 = 383.',
      ],
      conceptSummary:
        'What the blocks do and what the written method does are the same thing. Trading ten ones for one ten on the table is exactly the little 1 written above the tens column on paper.',
      commonMisconception:
        'The traded ten has to go into the TENS. Put in the hundreds it adds 100 instead of 10, and left out altogether it loses 10 — both leave the ones digit right, so re-checking the ones will not find either mistake.',
    },
  },
  {
    id: 'g2-nbt7-02',
    standardCode: 'NC.2.NBT.7',
    domainId: 'NBT',
    // Subtraction within 1,000 that regroups twice.
    prompt: 'What is 412 - 158?',
    options: labelOptions([
      // 4 - 1 = 3, 5 - 1 = 4, 8 - 2 = 6: took the smaller digit from the larger
      // in every column instead of regrouping.
      { text: '346', isCorrect: false, misconception: 'subtracted-without-regrouping' },
      // Regrouped into the ones but left the tens digit as 1, then regrouped
      // properly from the hundreds: one ten too large.
      { text: '264', isCorrect: false, misconception: 'borrowed-without-reducing-the-next-column' },
      // 412 + 158 = 570: added instead of subtracting.
      { text: '570', isCorrect: false, misconception: 'added-instead-of-subtracted' },
      { text: '254', isCorrect: true },
    ]),
    calculatorAllowed: false,
    isStretch: false,
    difficulty: 'mastery',
    explanation: {
      stepByStep: [
        'Step 1: Ones: 2 - 8 will not go, so trade a ten. The 1 ten becomes 0 tens and the ones become 12. Now 12 - 8 = 4.',
        'Step 2: Tens: 0 - 5 will not go either, so trade a hundred. The 4 hundreds become 3 and the tens become 10. Now 10 - 5 = 5.',
        'Step 3: Hundreds: 3 - 1 = 2.',
        'Step 4: 412 - 158 = 254.',
      ],
      conceptSummary:
        'Regrouping takes one unit of a place and hands it to the place on its right as ten. Each trade costs the left-hand column exactly one — that reduction is the half of the trade most easily forgotten.',
      commonMisconception:
        'A column where the top digit is smaller cannot simply be flipped round. Taking 2 from 8 instead of 8 from 2 gives 346, which is 92 too big, and adding 158 back does not return 412.',
    },
  },
  {
    id: 'g2-nbt7-03',
    standardCode: 'NC.2.NBT.7',
    domainId: 'NBT',
    // keyConcept 4: "Relationship between addition and subtraction", worked as
    // counting up in place-value jumps and then related to the answer.
    prompt: 'Ben works out 300 - 168 by counting up. He goes from 168 to 200, which is 32, and then from 200 to 300, which is 100. What is 300 - 168?',
    options: labelOptions([
      // Reported only the second jump and left the 32 out.
      { text: '100', isCorrect: false, misconception: 'forgot-the-final-step' },
      // 3 - 1 = 2, 6 - 0 = 6, 8 - 0 = 8: took the smaller digit from the larger
      // in every column instead of regrouping across the two zeros.
      { text: '268', isCorrect: false, misconception: 'subtracted-without-regrouping' },
      { text: '132', isCorrect: true },
      // 300 + 168 = 468: added instead of subtracting.
      { text: '468', isCorrect: false, misconception: 'added-instead-of-subtracted' },
    ]),
    calculatorAllowed: false,
    isStretch: false,
    difficulty: 'mastery',
    explanation: {
      stepByStep: [
        'Step 1: Counting up asks how far it is from 168 to 300.',
        'Step 2: The first jump, 168 to 200, is 32.',
        'Step 3: The second jump, 200 to 300, is 100. Both jumps count, so add them: 32 + 100.',
        'Step 4: 300 - 168 = 132.',
      ],
      conceptSummary:
        'Counting up in place-value jumps gives the same answer as the written method, and on a number like 300 it is far easier — no column needs regrouping because the jumps land on friendly numbers.',
      commonMisconception:
        'Every jump made along the way is part of the distance. Reporting only the 100 leaves out the 32 that got the count to 200 in the first place.',
    },
  },
  {
    id: 'g2-nbt7-04',
    standardCode: 'NC.2.NBT.7',
    domainId: 'NBT',
    // Selecting a strategy within 1,000 — the half of this standard a generator
    // cannot ask (ruling 18-7).
    prompt: 'Which way is easiest for working out 500 - 298 in your head?',
    options: labelOptions([
      // Counting back 298 separate ones is the strategy place value exists to
      // replace.
      { text: 'Count back 298 ones from 500', isCorrect: false, misconception: 'counted-on-by-ones-instead-of-using-place-value' },
      // Took 300 off and then took 2 more off, instead of putting the 2 back:
      // 500 - 300 - 2 = 198.
      { text: 'Take 300 away, then take 2 more away', isCorrect: false, misconception: 'compensated-in-the-wrong-direction' },
      // 5 - 2 = 3, 9 - 0 = 9, 8 - 0 = 8 gives 398, and none of it is mental
      // arithmetic.
      { text: 'Subtract the smaller digit from the larger in each column', isCorrect: false, misconception: 'subtracted-without-regrouping' },
      { text: 'Count up from 298 to 300, then to 500', isCorrect: true },
    ]),
    calculatorAllowed: false,
    isStretch: false,
    difficulty: 'advanced',
    explanation: {
      stepByStep: [
        'Step 1: 298 is very close to 300, so counting up from it is short.',
        'Step 2: 298 to 300 is 2.',
        'Step 3: 300 to 500 is 200. Together that is 2 + 200 = 202.',
        'Step 4: Count up from 298 to 300, then to 500 — that gives 202.',
      ],
      conceptSummary:
        'When the two numbers are close to a friendly hundred, counting up beats writing the subtraction down. Choosing the strategy that suits the numbers is part of the mathematics, not a shortcut around it.',
      commonMisconception:
        'Rounding 298 up to 300 means 2 too much was taken away, so the 2 has to be given back, not taken again. Taking it twice lands on 198 instead of 202.',
    },
  },

  // ==========================================
  // Standard: NC.2.NBT.8 — Mentally Add or Subtract 10 and 100
  // ==========================================
  {
    id: 'g2-nbt8-01',
    standardCode: 'NC.2.NBT.8',
    domainId: 'NBT',
    // Adding 10 where the tens place is already 9, so the ten has to roll into
    // the hundreds.
    prompt: 'What is 10 more than 395?',
    options: labelOptions([
      // 9 tens + 1 ten = 10 tens; wrote the 0 and never traded the ten tens up
      // into a hundred, giving 305.
      { text: '305', isCorrect: false, misconception: 'added-without-carrying' },
      { text: '405', isCorrect: true },
      // Added 100 rather than 10 — one place too far.
      { text: '495', isCorrect: false, misconception: 'wrong-power-of-ten' },
      // Took 10 away instead of adding it.
      { text: '385', isCorrect: false, misconception: 'subtracted-instead-of-added' },
    ]),
    calculatorAllowed: false,
    isStretch: false,
    difficulty: 'mastery',
    explanation: {
      stepByStep: [
        'Step 1: Adding 10 adds one ten, so look at the tens place. 395 has 9 tens.',
        'Step 2: 9 tens + 1 ten = 10 tens.',
        'Step 3: Ten tens are one hundred, so the 3 hundreds become 4 hundreds and the tens go to 0. The 5 ones never move.',
        'Step 4: 10 more than 395 is 405.',
      ],
      conceptSummary:
        'Adding 10 changes only the tens — unless the tens place is already 9, and then the ten it makes rolls up into the hundreds. That roll-over is why this has to be thought about rather than counted.',
      commonMisconception:
        'Writing 305 keeps the 3 hundreds and throws the new hundred away. Ten tens do not sit in the tens place; they become one more hundred.',
    },
  },
  {
    id: 'g2-nbt8-02',
    standardCode: 'NC.2.NBT.8',
    domainId: 'NBT',
    // Subtracting 100. The standard says mentally, "without counting on".
    prompt: 'What is 100 less than 342?',
    options: labelOptions([
      { text: '242', isCorrect: true },
      // Changed the tens digit instead of the hundreds, so only 10 came off.
      { text: '332', isCorrect: false, misconception: 'wrong-power-of-ten' },
      // Added 100 instead of taking it away.
      { text: '442', isCorrect: false, misconception: 'added-instead-of-subtracted' },
      // Counted back by ones instead of taking the whole hundred off at once,
      // and stopped one count short at 243.
      { text: '243', isCorrect: false, misconception: 'counted-by-ones-and-lost-the-count' },
    ]),
    calculatorAllowed: false,
    isStretch: false,
    difficulty: 'mastery',
    explanation: {
      stepByStep: [
        'Step 1: Taking 100 away takes one hundred away, so look at the hundreds place.',
        'Step 2: 342 has 3 hundreds. One less is 2 hundreds.',
        'Step 3: The 4 tens and the 2 ones do not change at all.',
        'Step 4: 100 less than 342 is 242.',
      ],
      conceptSummary:
        'Taking 100 away moves only the hundreds digit down by one. Nothing else in the number moves, which is what makes it a mental step rather than something to count out.',
      commonMisconception:
        'Counting back 100 ones one at a time is slow and almost always loses the count. Knowing that only the hundreds digit changes makes the whole thing a single thought.',
    },
  },
  {
    id: 'g2-nbt8-03',
    standardCode: 'NC.2.NBT.8',
    domainId: 'NBT',
    // Adding 10 across a hundred boundary, with the other amount on offer.
    prompt: 'What is 10 more than 590?',
    options: labelOptions([
      // 9 tens + 1 ten = 10 tens; wrote the 0 in the tens and never made the
      // new hundred, giving 500.
      { text: '500', isCorrect: false, misconception: 'added-without-carrying' },
      // Added 100 rather than 10.
      { text: '690', isCorrect: false, misconception: 'wrong-power-of-ten' },
      { text: '600', isCorrect: true },
      // Took 10 away instead of adding it.
      { text: '580', isCorrect: false, misconception: 'subtracted-instead-of-added' },
    ]),
    calculatorAllowed: false,
    isStretch: false,
    difficulty: 'mastery',
    explanation: {
      stepByStep: [
        'Step 1: Adding 10 adds one ten. 590 has 9 tens.',
        'Step 2: 9 tens + 1 ten = 10 tens.',
        'Step 3: Ten tens make one hundred, so 5 hundreds become 6 hundreds and the tens place goes to 0.',
        'Step 4: 10 more than 590 is 600.',
      ],
      conceptSummary:
        'Ten more and a hundred more are different moves. Ten more touches the tens place first, and only reaches the hundreds when the tens place is full.',
      commonMisconception:
        'Writing 500 keeps 5 hundreds and 0 tens, which is 90 less than 590 rather than 10 more. The ten tens have to be traded up.',
    },
  },
  {
    id: 'g2-nbt8-04',
    standardCode: 'NC.2.NBT.8',
    domainId: 'NBT',
    // "10 OR 100", not "10 and 100": one of each, in turn, so the child has to
    // keep straight which place each amount moves.
    prompt: 'Start at 264. Add 100. Then take away 10. What number do you end on?',
    options: labelOptions([
      // Added the 100 and stopped, never taking the 10 off.
      { text: '364', isCorrect: false, misconception: 'forgot-the-final-step' },
      // Swapped the two amounts: 264 + 10 = 274, then 274 - 100 = 174.
      { text: '174', isCorrect: false, misconception: 'wrong-power-of-ten' },
      { text: '354', isCorrect: true },
      // Added the 10 as well instead of taking it away: 264 + 100 + 10 = 374.
      { text: '374', isCorrect: false, misconception: 'added-instead-of-subtracted' },
    ]),
    calculatorAllowed: false,
    isStretch: false,
    difficulty: 'advanced',
    explanation: {
      stepByStep: [
        'Step 1: Start at 264 and add 100. Only the hundreds change: 264 becomes 364.',
        'Step 2: Now take 10 away from 364. Only the tens change.',
        'Step 3: 6 tens - 1 ten = 5 tens, so 364 becomes 354. The 4 ones never moved at any point.',
        'Step 4: You end on 354.',
      ],
      conceptSummary:
        'A hundred and a ten live in different places. Adding 100 moves the hundreds digit; taking 10 away moves the tens digit. Doing one after the other leaves the ones digit exactly where it started.',
      commonMisconception:
        'Mixing the two amounts up gives 174 instead of 354 — a difference of 180 — because the 100 was applied to the tens and the 10 to the hundreds.',
    },
  },
];
