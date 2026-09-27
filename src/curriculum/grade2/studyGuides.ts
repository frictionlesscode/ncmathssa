import type { StudyGuideSection } from '../../types';

/** One revision guide per Grade 2 standard.
 *
 *  AUDIENCE (Ruling 20-4): `coreConcept` and `stepByStepMethod` are written
 *  to be read ALOUD TO A SEVEN-YEAR-OLD — short sentences, plain narrated or
 *  direct-address wording (not every sentence literally says "you"), no
 *  vocabulary the standard itself does not introduce. Every other field —
 *  `title`, `rulesAndFormulas`, `commonTraps`, and every part of
 *  `workedExample` — addresses the ADULT sitting beside the child: it names
 *  the error a real child makes, in the words that error shows up in, so a
 *  parent recognizes it the moment it happens again.
 *
 *  Four more rules bind every entry:
 *
 *  1. The mathematics comes from this grade's `standards.ts` — the sourced
 *     NC text and its `keyConcepts` — never from what a code is assumed to
 *     mean or from the Common Core standard sharing its number. Per the
 *     Task 17-21 rulings: NC.2.MD.6 is the number line, NC.2.MD.7 is time,
 *     NC.2.MD.8 is money, and NC.2.NBT.6 adds up to THREE two-digit numbers
 *     (never four — that is Common Core's version, not NC's).
 *  2. Grade 2 has NO NCDPI blueprint — no EOG exists below Grade 3 — so no
 *     guide cites a percentage anywhere, and none claims a "blueprint"
 *     exists. Ruling 20-1: `whyItMattersForSSA` instead cites the domain's
 *     share of the grade's 23 standards as a COUNT (OA 4, NBT 8, MD 9, G 2)
 *     and names what the skill unlocks next, exactly as the brief asks.
 *  3. Every `commonTraps` line echoes the wording of this grade's authored
 *     banks' `commonMisconception` lines (`./authored.oa.ts`,
 *     `./authored.nbt.ts`, `./authored.md.ts`, `./authored.g.ts`), so a
 *     child who missed an item meets their own mistake again here in
 *     familiar words, and every worked example is solved fresh and checked
 *     step by step.
 *  4. Every number in a `workedExample` sits inside the range the standard
 *     and this grade's authored/template content actually use — NBT.6 never
 *     adds a fourth addend, OA.4 arrays never exceed 5-by-5, and so on.
 */
export const GRADE_2_STUDY_GUIDES: Record<string, StudyGuideSection> = {
  // ----------------------------------------------------------------------
  // Operations & Algebraic Thinking (4 of 23 standards)
  // ----------------------------------------------------------------------
  'NC.2.OA.1': {
    standardCode: 'NC.2.OA.1',
    title: 'Word Problems: Where Is the Unknown Hiding?',
    coreConcept:
      'A word problem is a math story with one missing number. That missing number can hide at the start of the story, in the middle, or the story might need two steps before you can find it. Look for what happened in the story first, then write an equation with a box for the missing number before you try to solve it.',
    rulesAndFormulas: [
      { label: 'Start unknown', detail: 'Something happened to a number you don’t know yet, and you are told what it became. Work backward from the end to find the start.' },
      { label: 'Compare — bigger unknown', detail: '"5 more than" means add the extra onto the smaller amount to find the bigger one.' },
      { label: 'Compare — smaller unknown', detail: '"6 fewer than" means take the extra away from the bigger amount to find the smaller one.' },
      { label: 'Two steps, in order', detail: 'Some problems need two events solved one after another — find the result of the first event, write it down, and only then start the second.' },
    ],
    stepByStepMethod: [
      'Step 1: Read the whole story first, without touching the numbers.',
      'Step 2: Find the box — the number the story does not tell you.',
      'Step 3: Decide what happened: did something get added, taken away, or compared?',
      'Step 4: Write the equation with a box for the missing number.',
      'Step 5: Solve for the box, then check your answer against the story.',
    ],
    commonTraps: [
      'Adding the two known numbers together when the story actually calls for subtracting — a child spots two numbers and reaches for "add" out of habit instead of reading the comparing words.',
      'Restating a number the problem already gave instead of solving for the box — answering 6 because the story already said "6 more," not because 6 answers how many plums Jayla started with.',
      'Counting on or back by ones and losing the count by one, landing one number too high or one too low.',
      'In a two-step problem, stopping after the first step and reporting the middle number instead of carrying on to the second step.',
    ],
    workedExample: {
      problem: 'Jayla had some plums. She picked 6 more plums. Now she has 14 plums. The equation ☐ + 6 = 14 shows this. How many plums did Jayla start with?',
      steps: [
        '1. The box stands for how many plums Jayla had before she picked any more.',
        '2. She picked 6 more, and ended with 14.',
        '3. Work backward: undo the "picked 6 more" by subtracting. 14 − 6 = 8.',
        '4. Jayla started with 8 plums.',
      ],
      answer: '8 plums',
      whyItMattersForSSA:
        'Operations & Algebraic Thinking is 4 of the 23 Grade 2 standards, and reading a story to find which number is missing — instead of just grabbing the two numbers on the page — is the habit that makes every multi-step word problem in Grade 3 and beyond possible.',
    },
  },

  'NC.2.OA.2': {
    standardCode: 'NC.2.OA.2',
    title: 'Fast Facts: Making a Ten in Your Head',
    coreConcept:
      'Fluency means knowing your addition and subtraction facts within 20 quickly, without counting one by one. The fastest way is to make a ten first — break one number apart so it fills the other one up to 10, then add or subtract whatever is left over.',
    rulesAndFormulas: [
      { label: 'Make a ten to add', detail: '8 + 5: give 8 two from the 5 to make 10, leaving 3. 10 + 3 = 13.' },
      { label: 'Make a ten to subtract', detail: '14 − 6: count back to 10 first (4 of the 6), then back the remaining 2. 10 − 2 = 8.' },
      { label: 'Near doubles', detail: '9 + 7 is 2 more than the double 7 + 7 = 14, so 9 + 7 = 16.' },
      { label: 'No calculator needed', detail: 'This standard is about doing it in your head — mental strategies, not counting one at a time and not a calculator.' },
    ],
    stepByStepMethod: [
      'Step 1: Look at the two numbers. Is one of them close to 10, or close to a double you know?',
      'Step 2: If it is close to 10, break the other number apart to fill it up to 10.',
      'Step 3: Add or subtract what is left onto or from the 10.',
      'Step 4: If the numbers are close to a double, use the double and then add or subtract the small leftover amount.',
    ],
    commonTraps: [
      'Counting on or back by ones one number at a time, which is slow and easy to lose — landing one number too high or one too low is the most common result.',
      'Subtracting when the problem calls for adding, or adding when it calls for subtracting, because the strategy focused on the numbers instead of the operation.',
      'Losing track partway through a near-double adjustment and adding or subtracting the wrong small amount at the end.',
    ],
    workedExample: {
      problem: 'What is 8 + 5?',
      steps: [
        '1. 8 needs 2 more to make 10.',
        '2. Take those 2 from the 5, leaving 3. 8 + 2 = 10 and 5 − 2 = 3.',
        '3. Add the 3 onto the 10. 10 + 3 = 13.',
      ],
      answer: '13',
      whyItMattersForSSA:
        'Operations & Algebraic Thinking is 4 of the 23 Grade 2 standards, and fast, accurate facts within 20 free up a child’s attention for the bigger addition and subtraction strategies within 100 and within 1,000 that come right after this standard in the Base Ten domain.',
    },
  },

  'NC.2.OA.3': {
    standardCode: 'NC.2.OA.3',
    title: 'Odd or Even: Does Everyone Have a Partner?',
    coreConcept:
      'A group of objects is even if every single one can find a partner, with nothing left over. If one object is left standing alone with no partner, the group is odd. You can also check by trying to split the group into two equal piles — and an even number can always be written as two matching addends, like 14 = 7 + 7.',
    rulesAndFormulas: [
      { label: 'Pair them up', detail: 'Put the objects into pairs of 2. Nothing left over means even; one object left over means odd.' },
      { label: 'Two equal groups', detail: 'An even number can always be split into two equal groups with nothing left over.' },
      { label: 'Equal addends', detail: 'An even number can be written as two matching addends: 14 = 7 + 7.' },
      { label: 'What the pair count does NOT tell you', detail: 'The number of pairs you made does not decide odd or even by itself — only whether something is left over decides it.' },
    ],
    stepByStepMethod: [
      'Step 1: Put the objects into pairs of 2, one pair at a time.',
      'Step 2: Check whether anything is left without a partner.',
      'Step 3: Nothing left over means the group is even; one object left over means odd.',
      'Step 4: For an even number, write it as two equal addends by splitting it exactly in half.',
    ],
    commonTraps: [
      'Looking at how many pairs were made rather than whether anything is left over — six pairs is an even number of pairs, but that alone does not decide whether the whole group is odd or even.',
      'Claiming a leftover object when the story or picture already shows every object paired, or the reverse.',
      'Splitting a group into two piles that are not the same size and still calling it two equal groups.',
      'Halving an even number incorrectly when writing the two equal addends — writing 6 + 6 for 14 instead of 7 + 7.',
    ],
    workedExample: {
      problem: 'Mateo has 18 blocks. He wants to split them into two equal groups with none left over. Can he do it, and how many blocks go in each group?',
      steps: [
        '1. 18 is the total number of blocks.',
        '2. Share them one at a time between two groups.',
        '3. 9 go to each group, and 9 + 9 = 18, so nothing is left over.',
      ],
      answer: 'Yes — 9 blocks in each group',
      whyItMattersForSSA:
        'Operations & Algebraic Thinking is 4 of the 23 Grade 2 standards, and seeing a number as two equal parts is the same idea Grade 3 needs for equal groups in multiplication and for fractions that split a whole in half.',
    },
  },

  'NC.2.OA.4': {
    standardCode: 'NC.2.OA.4',
    title: 'Arrays: Adding Equal Rows Instead of Counting One by One',
    coreConcept:
      'Objects arranged in neat rows and columns are called an array. Instead of counting every single object, you can add up the rows — the same number, one more time for every row there is. Arrays in Grade 2 never go past 5 rows or 5 columns.',
    rulesAndFormulas: [
      { label: 'Add one row for every row', detail: '3 rows of 4 is 4 + 4 + 4, not 3 + 4.' },
      { label: 'Count the rows first', detail: 'The number of rows tells you how many times to add the row size.' },
      { label: 'Write it as an equation', detail: 'An array of 4 rows of 3 is written 3 + 3 + 3 + 3 = 12, a sum of equal addends.' },
      { label: 'Up to 5 by 5', detail: 'Grade 2 arrays have at most 5 rows and at most 5 columns.' },
    ],
    stepByStepMethod: [
      'Step 1: Count how many equal rows there are.',
      'Step 2: Count how many objects are in one row.',
      'Step 3: Add the row size once for every row — do not count one by one.',
      'Step 4: Say the total using the equation: the row size added once for every row.',
    ],
    commonTraps: [
      'Adding the row count and the column count together instead of adding a row for every row — 3 rows of 4 is not 3 + 4.',
      'Skip-counting the rows but stopping one row short, leaving a whole row out of the total.',
      'Skip-counting one row too many, adding a row that is not actually in the array.',
      'Counting a single row and reporting that as the whole total.',
    ],
    workedExample: {
      problem: 'An array has 4 equal rows with 3 tiles in each row. Find the total by adding, not by counting one by one.',
      steps: [
        '1. There are 4 equal rows.',
        '2. Each row has 3 tiles.',
        '3. Add the row size once for every row: 3 + 3 + 3 + 3.',
        '4. 3 + 3 + 3 + 3 = 12.',
      ],
      answer: '12 tiles',
      whyItMattersForSSA:
        'Operations & Algebraic Thinking is 4 of the 23 Grade 2 standards, and adding equal rows is the exact idea Grade 3 renames "multiplication" — a child who can add 3 + 3 + 3 + 3 already understands what 4 × 3 means.',
    },
  },

  // ----------------------------------------------------------------------
  // Number & Operations in Base Ten (8 of 23 standards)
  // ----------------------------------------------------------------------
  'NC.2.NBT.1': {
    standardCode: 'NC.2.NBT.1',
    title: 'Hundreds, Tens and Ones — and Trading Between Them',
    coreConcept:
      'A three-digit number is built from hundreds, tens and ones. Ten ones trade for one ten, and ten tens trade for one hundred. The same number can be shown with different groupings — trading a hundred for ten tens does not change how many you have, only how they are grouped.',
    rulesAndFormulas: [
      { label: 'Ten tens make a hundred', detail: '10 bundles of 10 straws is 100 straws — ten of the ten-unit trades up into one new hundred-unit.' },
      { label: 'Round hundreds', detail: '400 means 4 hundreds, 0 tens, 0 ones — the zeros hold those places open at nothing, they don’t repeat the 4.' },
      { label: 'Various groupings', detail: '243 can be 2 hundreds + 4 tens + 3 ones, or trade one hundred for ten tens: 1 hundred + 14 tens + 3 ones. Both are 243.' },
      { label: 'A trade has two halves', detail: 'Whatever leaves one place has to show up in the place next door — nothing may vanish, and nothing may be counted twice.' },
    ],
    stepByStepMethod: [
      'Step 1: Say how many hundreds, tens, and ones you have.',
      'Step 2: If you trade a hundred, remember it becomes exactly ten tens — not one ten.',
      'Step 3: Add what left one place into the place beside it.',
      'Step 4: Check the total is still the same number you started with.',
    ],
    commonTraps: [
      'Dropping the hundred after a trade instead of turning it into ten tens — the number ends up 100 too small.',
      'Keeping the original hundred AND also adding the ten new tens, counting the same value twice.',
      'Trading a hundred for a single ten instead of ten tens, losing 90 in the process.',
      'Reading a digit as if it filled every place, so 400 becomes "4 hundreds, 4 tens, 4 ones" instead of "4 hundreds, 0 tens, 0 ones".',
    ],
    workedExample: {
      problem: 'Priya has 4 hundreds and 12 tens. What number does Priya have?',
      steps: [
        '1. 4 hundreds is 400.',
        '2. 12 tens is 10 tens plus 2 more tens — and 10 tens trade up into 1 more hundred, leaving 2 tens.',
        '3. So Priya really has 5 hundreds and 2 tens: 400 + 100 + 20.',
        '4. Priya has 520.',
      ],
      answer: '520',
      whyItMattersForSSA:
        'Number & Operations in Base Ten is 8 of the 23 Grade 2 standards, the second largest domain in the grade, and trading ten of one place for one of the next is the exact move every later regrouped addition and subtraction standard in this domain depends on.',
    },
  },

  'NC.2.NBT.2': {
    standardCode: 'NC.2.NBT.2',
    title: 'Counting Past a Hundred, and Skip-Counting by 5s, 10s and 100s',
    coreConcept:
      'Counting by ones past a number like 599 takes two trades at once: ten ones become a ten, and ten tens become a hundred, so the very next number is 600. Skip-counting by 5s, 10s or 100s means adding that same amount again and again.',
    rulesAndFormulas: [
      { label: 'Counting into the next hundred', detail: '599, 600 — not 500. The hundreds digit goes up by one and the count carries straight on.' },
      { label: 'Skip-count by 5s', detail: 'Every number ends in a 0 or a 5: 245, 250, 255, 260.' },
      { label: 'Skip-count by 10s', detail: 'The ones digit never changes, and the tens digit goes up by one each time: 462, 472, 482, 492.' },
      { label: 'Skip-counting by 10s can roll into a new hundred', detail: 'If the tens digit reaches 9, the next count of 10 rolls it back to 0 and bumps the hundreds digit by one: 475, 485, 495, 505.' },
      { label: 'Skip-count by 100s', detail: 'Only the hundreds digit changes: 380, 480, 580 — the tens and ones ride along unchanged too.' },
    ],
    stepByStepMethod: [
      'Step 1: Decide the step size: 1, 5, 10, or 100.',
      'Step 2: Add that step size to the number you are on.',
      'Step 3: Say the new number. Usually only one place changes. But if a digit passes 9, the next place over goes up by one too.',
      'Step 4: Repeat for as many numbers as you need.',
    ],
    commonTraps: [
      'Restarting the count at the start of a hundred instead of carrying on — saying 500 after 599 instead of 600.',
      'Counting by ones when the step is 5, 10, or 100, or switching to the wrong step size partway through.',
      'Listing the starting number as if it were the first number counted, which pushes the whole list one step too early.',
      'Jumping to the next number ending in 0 instead of adding exactly 10 to a number that does not already end in 0.',
      'When counting by 10s crosses a hundred, rolling the tens digit back to 0 but forgetting to bump the hundreds digit up — saying 405 instead of 505 right after 495.',
    ],
    workedExample: {
      problem: 'Lia begins at 462 and skip-counts by 10s. What are the next three numbers she says?',
      steps: [
        '1. Skip-counting by 10s means adding 10 each time.',
        '2. 462 + 10 = 472.',
        '3. 472 + 10 = 482, and 482 + 10 = 492.',
      ],
      answer: '472, 482, 492',
      whyItMattersForSSA:
        'Number & Operations in Base Ten is 8 of the 23 Grade 2 standards, and skip-counting by 10s and 100s is the mental shortcut behind "mentally add or subtract 10 or 100" — the last standard in this same domain — and every multiplication table a child meets after this year.',
    },
  },

  'NC.2.NBT.3': {
    standardCode: 'NC.2.NBT.3',
    title: 'Reading and Writing Numbers Three Ways',
    coreConcept:
      'The same number can be written as digits (407), as words (four hundred seven), or pulled apart into what each digit is worth (400 + 0 + 7). A number name only mentions the places that have something in them — any place it skips still needs a zero written in.',
    rulesAndFormulas: [
      { label: 'Numeral to words', detail: '512 is five hundred twelve — the last two digits are read together as one word, not one digit at a time.' },
      { label: 'Words to numeral, with a gap', detail: '"Four hundred seven" mentions no tens, so the tens place gets a 0: 407.' },
      { label: 'Expanded form', detail: '364 = 300 + 60 + 4 — each digit’s own value, not the bare digit.' },
      { label: 'Expanded form back to a numeral', detail: '600 + 5 = 605 — the missing tens place still needs its 0.' },
    ],
    stepByStepMethod: [
      'Step 1: Find the hundreds, tens, and ones in whatever form you are given.',
      'Step 2: If a place is not mentioned at all, its value is 0 — write that 0 in, do not skip the place.',
      'Step 3: Write the number as digits, using each digit’s own place.',
      'Step 4: Check by reading it back the other way.',
    ],
    commonTraps: [
      'Skipping the zero place, so "four hundred seven" is written 47 instead of 407 — the missing tens digit closes the gap.',
      'Reading a two-digit ending one digit at a time instead of as one word, so 512 becomes "five hundred one two" instead of "five hundred twelve".',
      'Writing the bare digits of an expanded form added together, 3 + 6 + 4, instead of what each digit is worth, 300 + 60 + 4.',
      'Putting a digit in the wrong place, swapping the tens and ones when writing or reading a number name.',
    ],
    workedExample: {
      problem: 'Ravi writes 364 in expanded form. What did Ravi write?',
      steps: [
        '1. 364 has a 3 in the hundreds place, a 6 in the tens place, and a 4 in the ones place.',
        '2. The 3 is worth 300, the 6 is worth 60, and the 4 is worth 4.',
        '3. Expanded form writes those three values added together.',
      ],
      answer: '300 + 60 + 4',
      whyItMattersForSSA:
        'Number & Operations in Base Ten is 8 of the 23 Grade 2 standards, and knowing what each digit is worth — not just which digit it is — is what makes comparing three-digit numbers and adding within 100, the next two standards in this domain, possible at all.',
    },
  },

  'NC.2.NBT.4': {
    standardCode: 'NC.2.NBT.4',
    title: 'Comparing Numbers Place by Place',
    coreConcept:
      'To compare two three-digit numbers, start at the hundreds place, not the ones. If the hundreds are the same, move to the tens. Keep moving right until you find a place where the digits are different — that place decides which number is bigger.',
    rulesAndFormulas: [
      { label: 'Start at the greatest place', detail: 'Compare hundreds first, then tens, then ones — never the other way around.' },
      { label: 'The first different place wins', detail: 'Once you find a place where the digits differ, stop — nothing further right can change the answer.' },
      { label: 'Same digits, different order', detail: '638 and 683 use the same three digits, but they are not equal: 638 < 683 because 3 tens is less than 8 tens.' },
      { label: 'Digit count is not value', detail: 'Two numbers can both have three digits without being equal — always compare digit by digit, never just count how many digits each one has.' },
    ],
    stepByStepMethod: [
      'Step 1: Line up the two numbers by place: hundreds, tens, ones.',
      'Step 2: Compare the hundreds digits. If they differ, that decides it.',
      'Step 3: If the hundreds match, compare the tens digits the same way.',
      'Step 4: If the tens match too, compare the ones digits.',
      'Step 5: Write >, <, or = so the symbol opens toward the bigger number.',
    ],
    commonTraps: [
      'Comparing the ones digits first because one looks like the biggest single digit, instead of starting at the hundreds place.',
      'Stopping as soon as one place matches and calling the numbers equal, without checking the places still to the right.',
      'Assuming two numbers built from the same three digits must be equal, when the order those digits sit in changes the value entirely.',
      'Counting how many digits each number has instead of comparing what each digit is worth, place by place.',
    ],
    workedExample: {
      problem: 'Compare 638 and 683. Which is true: 638 > 683, 638 < 683, or 638 = 683?',
      steps: [
        '1. Start at the greatest place. Both numbers have 6 hundreds, so the hundreds cannot decide it.',
        '2. Move right to the tens. 638 has 3 tens and 683 has 8 tens.',
        '3. 3 tens is 30 and 8 tens is 80, so 683 is the greater number.',
      ],
      answer: '638 < 683, because 3 tens is less than 8 tens',
      whyItMattersForSSA:
        'Number & Operations in Base Ten is 8 of the 23 Grade 2 standards, and comparing three-digit numbers place by place uses the same "what is each digit worth" thinking that makes adding and subtracting within 1,000 — worked ones, then tens, then hundreds — come out right, even though the two skills scan the places in opposite directions.',
    },
  },

  'NC.2.NBT.5': {
    standardCode: 'NC.2.NBT.5',
    title: 'Strategies for Adding and Subtracting within 100',
    coreConcept:
      'There is more than one good way to add or subtract two-digit numbers in your head. You can break numbers apart by place value, round one number to a friendly ten and adjust, or think of a subtraction as "what do I add to get there." Picking a strategy that fits the numbers is part of doing the math.',
    rulesAndFormulas: [
      { label: 'Break apart by place value', detail: '38 + 27: add the tens (30 + 20 = 50), add the ones (8 + 7 = 15), then combine the two parts. 50 + 15 = 65.' },
      { label: 'Round and adjust', detail: '46 + 29: add 46 + 30 = 76, then take back the extra 1 that was added. 76 − 1 = 75.' },
      { label: 'Think of the matching addition', detail: '72 − 35: ask "35 plus what makes 72?" Counting up from 35 to 72 finds the answer, 37.' },
      { label: 'Moving an amount between addends', detail: '39 + 44 = 40 + 43: moving 1 from 44 onto 39 does not change the total, because nothing was added or taken away overall.' },
    ],
    stepByStepMethod: [
      'Step 1: Look at both numbers and decide which strategy fits best.',
      'Step 2: If a number is close to a ten, round it and remember to adjust back at the end.',
      'Step 3: If you break the numbers into tens and ones, remember to add the two parts back together.',
      'Step 4: Check your answer using a different strategy or the opposite operation.',
    ],
    commonTraps: [
      'Rounding a number up to make it friendly, then adding the extra back on again instead of taking it away — moving further from the answer instead of correcting it.',
      'Breaking numbers into tens and ones, finding both parts, and stopping there instead of adding the two parts back together.',
      'Taking the smaller digit from the larger digit in a column instead of regrouping, when the top digit is actually smaller.',
      'Counting on by ones through a two-digit amount, which is slow and easy to lose track of.',
    ],
    workedExample: {
      problem: 'Ana adds 38 + 27 by breaking the numbers apart: 30 + 20 = 50 and 8 + 7 = 15. What is 38 + 27?',
      steps: [
        '1. The tens add to 50 and the ones add to 15.',
        '2. Put the two parts back together: 50 + 15.',
        '3. 15 is 1 ten and 5 ones, so 50 + 15 = 65.',
      ],
      answer: '65',
      whyItMattersForSSA:
        'Number & Operations in Base Ten is 8 of the 23 Grade 2 standards, and choosing between these mental strategies is exactly what NBT.6 (adding three two-digit numbers) and then NBT.7 (adding and subtracting within 1,000) build on next, turning mental strategies into a written regrouping method.',
    },
  },

  'NC.2.NBT.6': {
    standardCode: 'NC.2.NBT.6',
    title: 'Adding Three Two-Digit Numbers',
    coreConcept:
      'You can add three two-digit numbers the same way you add two — add all the ones together first, then all the tens. If the ones add up to 10 or more, trade ten of them for one more ten before you finish.',
    rulesAndFormulas: [
      { label: 'Ones column first', detail: 'Add all three ones digits together before touching the tens.' },
      { label: 'Carry into the tens', detail: 'If the ones add to 10 or more, write the leftover ones and carry the ten(s) into the tens column.' },
      { label: 'Then add the tens', detail: 'Add all three tens digits together, plus any tens you carried.' },
      { label: 'Add in a convenient order', detail: 'You can add three numbers in any order. In 27 + 35 + 13, adding 27 and 13 first is easier because they make a friendly 40: 40 + 35 = 75.' },
      { label: 'Up to three addends', detail: 'This standard adds up to THREE two-digit numbers in one problem — never four.' },
    ],
    stepByStepMethod: [
      'Step 1: Add all three ones digits together.',
      'Step 2: If that total is 10 or more, write the ones digit and carry the ten(s) into the tens column.',
      'Step 3: Add all three tens digits together, plus anything carried.',
      'Step 4: Put the tens and ones together for the final answer.',
    ],
    commonTraps: [
      'Adding the ones column, getting a number 10 or greater, and writing only the ones digit without carrying the ten into the tens column.',
      'Carrying a ten into the hundreds column instead of the tens column.',
      'Adding only two of the three numbers and leaving the third one out entirely.',
      'With three addends the ones column can pass 10 by two tens instead of one — dropping either ten, or carrying it to the wrong place, throws the answer off by 10 or more.',
    ],
    workedExample: {
      problem: 'What is 27 + 35 + 13?',
      steps: [
        '1. Add the ones: 7 + 5 + 3 = 15.',
        '2. 15 is 1 ten and 5 ones. Write the 5 and carry the ten into the tens column.',
        '3. Add the tens with that carried ten: 2 + 3 + 1 + 1 = 7 tens.',
      ],
      answer: '75',
      whyItMattersForSSA:
        'Number & Operations in Base Ten is 8 of the 23 Grade 2 standards, and carrying a ten out of a three-number ones column is the same carrying skill the very next standard, adding within 1,000, needs at both the ones place and the tens place.',
    },
  },

  'NC.2.NBT.7': {
    standardCode: 'NC.2.NBT.7',
    title: 'Adding and Subtracting within 1,000',
    coreConcept:
      'Adding or subtracting three-digit numbers works one place at a time: ones, then tens, then hundreds. When ten of one place appear, trade them for one of the next place over — the written method is just a fast way of writing down what base-ten blocks would do.',
    rulesAndFormulas: [
      { label: 'Ones, then tens, then hundreds', detail: 'Work through the places in order, never skipping one.' },
      { label: 'Trading up when adding', detail: '13 ones becomes 1 ten and 3 ones — the traded ten moves into the tens column, not the hundreds.' },
      { label: 'Trading down when subtracting', detail: 'If a column will not subtract, trade one from the place to its left: 1 ten becomes 10 ones.' },
      { label: 'Counting up as a check', detail: '300 − 168 can be found by counting up from 168 to 300 in place-value jumps: 168 to 200 is 32, and 200 to 300 is 100, so 300 − 168 = 132.' },
    ],
    stepByStepMethod: [
      'Step 1: Line the numbers up by place: hundreds, tens, ones.',
      'Step 2: Work the ones first. If adding makes 10 or more, or subtracting will not go, trade with the tens.',
      'Step 3: Work the tens next, including anything traded.',
      'Step 4: Work the hundreds last.',
    ],
    commonTraps: [
      'Adding a column to 10 or more and writing only the ones digit, without carrying the ten into the next column.',
      'Carrying a traded ten into the hundreds column instead of the tens column.',
      'Subtracting the smaller digit from the larger digit in a column instead of trading, when the top digit is actually smaller.',
      'Trading from the next column over without reducing it by one, so the same ten gets used twice.',
    ],
    workedExample: {
      problem: 'What is 412 − 158?',
      steps: [
        '1. Ones: 2 − 8 will not go, so trade a ten. That leaves 0 tens (the 1 ten is gone), and the ones become 12: 12 − 8 = 4.',
        '2. Tens: 0 − 5 will not go either, so trade a hundred. That leaves 3 hundreds (the 4 hundreds lost one), and the tens become 10: 10 − 5 = 5.',
        '3. Hundreds: 3 − 1 = 2.',
      ],
      answer: '254',
      whyItMattersForSSA:
        'Number & Operations in Base Ten is 8 of the 23 Grade 2 standards, and trading between places up to the hundreds is exactly the skill Grade 3’s NC.3.NBT.2 keeps practicing — addition and subtraction within 1,000 again, this time paired with estimating whether the answer is reasonable.',
    },
  },

  'NC.2.NBT.8': {
    standardCode: 'NC.2.NBT.8',
    title: 'Adding or Subtracting 10 or 100 in Your Head',
    coreConcept:
      'Adding or subtracting 10 changes only the tens digit most of the time. But if you are adding and the tens digit is already 9, it rolls into a new hundred. If you are subtracting and the tens digit is already 0, it borrows from the hundreds instead. Adding or subtracting 100 changes only the hundreds digit, every time.',
    rulesAndFormulas: [
      { label: '10 more or less', detail: 'The tens digit moves up by one for more, down by one for less — unless it rolls over into, or borrows from, a hundred.' },
      { label: '100 more or less', detail: 'Only the hundreds digit moves. The tens and ones never change.' },
      { label: 'Rolling over a hundred (adding)', detail: '395 + 10: the tens digit is 9, so 9 tens + 1 ten = 10 tens, which trades up into 1 more hundred: 405.' },
      { label: 'Borrowing across a hundred (subtracting)', detail: '305 − 10: the tens digit is 0, so borrow a ten from the hundreds — 3 hundreds become 2, and the tens becomes 9: 295.' },
      { label: 'The range', detail: 'This standard works with numbers from 100 to 900.' },
    ],
    stepByStepMethod: [
      'Step 1: Decide whether you are changing by 10 or by 100.',
      'Step 2: For 10, look at the tens digit; for 100, look at the hundreds digit.',
      'Step 3: Move that one digit up or down by one.',
      'Step 4: If you are adding and the tens digit was already 9, it rolls into a new hundred. If you are subtracting and the tens digit was already 0, it borrows from the hundreds instead.',
      'Step 5: Leave the other digits exactly where they were.',
    ],
    commonTraps: [
      'Changing the wrong place — moving the tens digit when the problem asks for 100 more or less, or the hundreds digit when it asks for 10.',
      'Adding 10 to a number with 9 tens and writing 0 tens without trading the new ten tens up into another hundred.',
      'Subtracting 10 from a number with 0 tens and writing 9 tens without lowering the hundreds digit by one — turning 305 − 10 into 395 instead of 295.',
      'Counting on or back one at a time instead of moving straight to the one digit that changes, and losing the count along the way.',
      'Mixing up which amount, 10 or 100, goes with which step when a problem asks for both, one after the other.',
    ],
    workedExample: {
      problem: 'Start at 264. Add 100. Then take away 10. What number do you end on?',
      steps: [
        '1. Add 100: only the hundreds digit changes. 264 becomes 364.',
        '2. Take away 10: only the tens digit changes. 6 tens − 1 ten = 5 tens.',
        '3. 364 becomes 354. The ones digit, 4, never moved.',
      ],
      answer: '354',
      whyItMattersForSSA:
        'Number & Operations in Base Ten is 8 of the 23 Grade 2 standards, and knowing which place a 10 or a 100 belongs to without counting is the mental shortcut behind every skip-count by 10s and 100s and every regrouped addition in this whole domain.',
    },
  },

  // ----------------------------------------------------------------------
  // Measurement & Data (9 of 23 standards)
  // ----------------------------------------------------------------------
  'NC.2.MD.1': {
    standardCode: 'NC.2.MD.1',
    title: 'Picking the Right Tool to Measure',
    coreConcept:
      'To measure how long something is, you need a tool that is marked in the right unit and is the right size for the job — a ruler, a yardstick, a meter stick, or a measuring tape. A tool that measures something else, like weight or time, cannot tell you a length no matter how carefully you use it.',
    rulesAndFormulas: [
      { label: 'Match the unit', detail: 'If the question asks for centimeters, the tool has to be marked in centimeters — a ruler marked in inches gives an answer in the wrong unit.' },
      { label: 'Match the size of the job', detail: 'A 12-inch ruler measures a crayon fine, but a hallway needs a longer tool, like a measuring tape.' },
      { label: 'Standard units only', detail: 'Footsteps, hand spans, and paper clips are not standard units — they are a different size for everyone, so they are not real measuring tools here.' },
      { label: 'The tool must measure length', detail: 'A bathroom scale measures weight and a clock measures time — neither one measures how long something is.' },
    ],
    stepByStepMethod: [
      'Step 1: Ask what unit the question wants: inches, feet, yards, centimeters, or meters.',
      'Step 2: Find a tool marked in that unit.',
      'Step 3: Check the tool is a sensible size for the object — not so short it has to be moved many times.',
      'Step 4: Use the tool, lining it up from the very start of the object.',
    ],
    commonTraps: [
      'Choosing a tool that measures the right general idea but the wrong unit, like a yardstick marked in inches when centimeters were asked for.',
      'Choosing a short tool for a long object, which has to be moved and re-lined-up many times, making it easy to lose count.',
      'Reaching for a non-standard unit like footsteps or hand spans, which are a different size for every person.',
      'Picking a tool that measures something else entirely, such as weight or time, because it is a familiar measuring tool.',
    ],
    workedExample: {
      problem: 'Mr. Ruiz wants to measure how long the school hallway is, in feet. Which tool is the best choice: a 12-inch ruler, a measuring tape, a bathroom scale, or his own footsteps?',
      steps: [
        '1. A hallway is long — many feet from one end to the other.',
        '2. A 12-inch ruler is only 1 foot long, so it would need to be moved and re-lined-up again and again.',
        '3. A bathroom scale measures weight, and footsteps are not the same size for everyone, so neither is a standard length tool.',
      ],
      answer: 'A measuring tape',
      whyItMattersForSSA:
        'Measurement & Data is 9 of the 23 Grade 2 standards, the largest domain in the grade, and choosing the right tool and unit here is what every other length standard in this domain — estimating, comparing, and solving word problems — depends on getting right first.',
    },
  },

  'NC.2.MD.2': {
    standardCode: 'NC.2.MD.2',
    title: 'The Same Object, Two Different Units',
    coreConcept:
      'If you measure the very same object twice, once with a small unit and once with a big unit, you will not get the same number both times. The object did not change size — a smaller unit just needs more copies of itself to cover the same length, so it gives a bigger count.',
    rulesAndFormulas: [
      { label: 'Smaller unit, bigger count', detail: 'An inch is smaller than a foot, so the same table measures 48 inches but only 4 feet.' },
      { label: 'Bigger unit, smaller count', detail: 'A foot is bigger than an inch, so measuring in feet gives a smaller number for the exact same length.' },
      { label: 'The object never changes', detail: 'Only the unit changes between the two measurements — the object’s real length stays exactly the same.' },
      { label: 'Comparing two counts', detail: 'If one count is bigger than another for the same object, the bigger count came from the smaller unit.' },
    ],
    stepByStepMethod: [
      'Step 1: Measure the object once with the first unit and note the count.',
      'Step 2: Measure the same object again with a different-sized unit.',
      'Step 3: Compare the two counts — the smaller unit should give the bigger number.',
      'Step 4: Explain the difference by the size of the unit, not by the object changing.',
    ],
    commonTraps: [
      'Expecting the unit that gave the bigger count to be the longer unit, when it is actually the shorter one that needed more copies of itself.',
      'Thinking the object itself got longer or shorter because the number changed, instead of realizing only the unit changed.',
      'Expecting the same object to give the same count in a different unit, and assuming a mistake was made when the numbers do not match.',
    ],
    workedExample: {
      problem: 'Jada measures the same table two times. In inches, the table is 48 inches long. In feet, it is 4 feet long. Why is the number of feet so much smaller?',
      steps: [
        '1. Jada measured the same table both times, so its length did not change.',
        '2. A foot is longer than an inch, so each foot covers more of the table than each inch does.',
        '3. Longer units fit fewer times along the same length, so the count in feet is smaller.',
      ],
      answer: 'A foot is longer than an inch, so fewer feet fit along the table',
      whyItMattersForSSA:
        'Measurement & Data is 9 of the 23 Grade 2 standards, and understanding that a smaller unit gives a bigger count is the idea behind every unit choice a child makes in the estimating standard right next to this one.',
    },
  },

  'NC.2.MD.3': {
    standardCode: 'NC.2.MD.3',
    title: 'Estimating a Length without Measuring',
    coreConcept:
      'Estimating means guessing a sensible length using a mental picture of the unit — about a thumb’s width for an inch, about a big step for a yard or a meter. A good estimate needs both a sensible number AND a sensible unit.',
    rulesAndFormulas: [
      { label: 'Inch benchmark', detail: 'About as wide as a thumb.' },
      { label: 'Foot benchmark', detail: 'About the length of a grown-up’s shoe.' },
      { label: 'Yard and meter benchmark', detail: 'About one big adult step (a meter is a little longer than a yard).' },
      { label: 'Centimeter benchmark', detail: 'About as wide as a fingertip — used for small things like crayons and pencils.' },
    ],
    stepByStepMethod: [
      'Step 1: Decide roughly how big the object is: tiny, medium, or big.',
      'Step 2: Pick the unit that fits that size — inches or centimeters for small things, feet for medium things, yards or meters for bigger things.',
      'Step 3: Picture the benchmark for that unit and count roughly how many would fit.',
      'Step 4: Say the estimate with "about" and the unit.',
    ],
    commonTraps: [
      'Picking a sensible number but a unit that is far too big or far too small for the object, like inches for a school bus.',
      'Being off by a factor of ten — estimating 400 feet for something that is really about 40 feet, or the reverse.',
      'Hearing a length question as a time question, especially with phrasing like "how long" for something that also takes time, such as a car ride.',
    ],
    workedExample: {
      problem: 'About how long is a new crayon: about 4 yards, about 4 inches, about 40 inches, or about 4 minutes?',
      steps: [
        '1. A length needs a length unit, so minutes is out — minutes measure time, not how far something stretches.',
        '2. An inch is about as wide as a thumb. A new crayon is about as long as four thumbs side by side.',
        '3. 40 inches is taller than a small child, and 4 yards is longer than a bed — both are far too long for a crayon.',
      ],
      answer: 'About 4 inches',
      whyItMattersForSSA:
        'Measurement & Data is 9 of the 23 Grade 2 standards, and a solid mental benchmark for each unit is what lets a child catch an answer that is off by ten times before it is even measured.',
    },
  },

  'NC.2.MD.4': {
    standardCode: 'NC.2.MD.4',
    title: 'How Much Longer? Measure Both, Then Subtract',
    coreConcept:
      'To find how much longer one object is than another, you first measure BOTH of them in the same unit. Only after you have both numbers do you subtract the shorter from the longer to find the difference.',
    rulesAndFormulas: [
      { label: 'Measure both first', detail: 'You cannot compare a measured object to one that has not been measured yet.' },
      { label: 'Subtract to compare', detail: 'How much longer = longer length − shorter length.' },
      { label: 'Same unit both times', detail: 'Both objects must be measured in the same unit before subtracting, or the difference means nothing.' },
      { label: 'Say the unit', detail: 'The difference is a length too, so it needs the unit attached: "5 inches longer," not just "5."' },
    ],
    stepByStepMethod: [
      'Step 1: Measure the first object, starting from 0.',
      'Step 2: Measure the second object, starting from 0.',
      'Step 3: Subtract the shorter length from the longer length.',
      'Step 4: Write the answer with its unit, and say which object is the longer one.',
    ],
    commonTraps: [
      'Adding the two lengths together instead of subtracting, when the question asks how much longer one is than the other.',
      'Measuring one object and stopping, reporting that measurement instead of the actual difference between the two.',
      'Not starting the measurement at 0, which makes an object look shorter or longer than it really is.',
      'Finding the right difference but saying the shorter object is the longer one.',
    ],
    workedExample: {
      problem: 'A pencil and a crayon lie along the same ruler, marked in inches. Both start at the 0 mark. The pencil ends at the 8 mark. The crayon ends at the 3 mark. How much longer is the pencil than the crayon?',
      steps: [
        '1. Both start at 0, so the pencil is 8 inches long and the crayon is 3 inches long.',
        '2. "How much longer" asks for the difference between the two lengths.',
        '3. Subtract: 8 − 3 = 5.',
      ],
      answer: '5 inches',
      whyItMattersForSSA:
        'Measurement & Data is 9 of the 23 Grade 2 standards, and comparing two measured lengths by subtracting is the exact move behind the length word problems in the very next standard.',
    },
  },

  'NC.2.MD.5': {
    standardCode: 'NC.2.MD.5',
    title: 'Length Word Problems: Write the Equation First',
    coreConcept:
      'A length word problem tells a story about lengths, all in the same unit, with one number missing. Before you solve anything, write an equation with a box standing for the missing number — that keeps you from grabbing the wrong two numbers to add or subtract.',
    rulesAndFormulas: [
      { label: 'Put together', detail: 'Two lengths joined end to end add: 38 feet + 45 feet = 83 feet.' },
      { label: 'Compare, bigger unknown', detail: '"17 inches longer than the red ribbon" means the blue ribbon is the red ribbon’s length plus 17 — add.' },
      { label: 'Find the start', detail: 'If a length was cut down to what is left, add the cut piece back to find the length before the cut.' },
      { label: 'One symbol, one unknown', detail: 'A ☐ in the equation stands for the one missing length the question asks about — not any other number in the story.' },
    ],
    stepByStepMethod: [
      'Step 1: Read the whole story and find every length mentioned.',
      'Step 2: Decide which length the question is actually asking for.',
      'Step 3: Write an equation with a ☐ for that one missing length.',
      'Step 4: Solve, and check every number in your equation is in the same unit.',
    ],
    commonTraps: [
      'Building a comparison on the wrong given length from the story, when more than one length is mentioned.',
      'Adding without carrying the extra ten out of the ones column, landing 10 short of the true total.',
      'Restating a length the problem already gave instead of solving for the box.',
      'Adding every number that appears in the story instead of only the ones the question is actually asking about.',
    ],
    workedExample: {
      problem: 'Sam lays a 38-foot rope and a 45-foot rope end to end in one long line. The equation 38 + 45 = ☐ shows this. How long is the line?',
      steps: [
        '1. The box stands for the length of the whole line: both ropes together.',
        '2. Ones: 8 + 5 = 13. That is 1 ten and 3 ones.',
        '3. Tens: 3 tens + 4 tens + the 1 new ten = 8 tens.',
      ],
      answer: '83 feet',
      whyItMattersForSSA:
        'Measurement & Data is 9 of the 23 Grade 2 standards, and writing an equation with a symbol before solving is exactly the habit the Operations & Algebraic Thinking word-problem standard asks for too, just applied to lengths.',
    },
  },

  'NC.2.MD.6': {
    standardCode: 'NC.2.MD.6',
    title: 'Whole Numbers and Jumps on a Number Line',
    coreConcept:
      'A number line shows a whole number as a length measured from 0. Adding is jumping to the right, and subtracting is jumping to the left. Each jump’s size is what matters — not how many marks or numbers you pass along the way.',
    rulesAndFormulas: [
      { label: 'A number is a length from 0', detail: 'An arrow starting at 0 and stretching to a point shows that point as a whole number of equally spaced jumps.' },
      { label: 'Adding = jumping right', detail: '23 + 14: one jump of 10 then four jumps of 1, starting at 23, lands on 37.' },
      { label: 'Subtracting = jumping left', detail: '52 − 30: three jumps of 10 backward from 52 lands on 22.' },
      { label: 'Count the jump, not the mark', detail: 'Each jump you make is one count — the spot you start on is not itself a jump.' },
    ],
    stepByStepMethod: [
      'Step 1: Find the starting number on the line.',
      'Step 2: Decide whether you are adding (jump right) or subtracting (jump left).',
      'Step 3: Make jumps of the size given, counting each jump — not the starting mark — as one.',
      'Step 4: Read off where you land — that is the answer.',
    ],
    commonTraps: [
      'Counting the starting mark itself as the first jump, which lands one jump short of the true answer.',
      'Jumping in the wrong direction — right when the problem means subtract, or left when it means add.',
      'Treating a jump of 10 as if it only moved 1, undercounting where the jumps land.',
      'Starting the jumps from 0 instead of from the first number in the problem, which leaves that first number out of the answer entirely.',
    ],
    workedExample: {
      problem: 'Ava starts at 23 on a number line. She makes one jump of 10. Then she makes 4 jumps of 1. Where does she land?',
      steps: [
        '1. Start at 23.',
        '2. One jump of 10 lands on 33.',
        '3. Four jumps of 1: 34, 35, 36, 37.',
      ],
      answer: '37',
      whyItMattersForSSA:
        'Measurement & Data is 9 of the 23 Grade 2 standards, and showing a sum or difference as jumps on a number line is a second, visual way into the exact same addition and subtraction within 100 that the Base Ten domain builds with blocks and columns.',
    },
  },

  'NC.2.MD.7': {
    standardCode: 'NC.2.MD.7',
    title: 'Telling Time to the Nearest Five Minutes',
    coreConcept:
      'The short hand tells the hour, and the long hand tells the minutes — but every number around the clock is worth 5 minutes to the long hand, not 1. Count by fives around to where the long hand points, and don’t forget a.m. for morning or p.m. for afternoon and night.',
    rulesAndFormulas: [
      { label: 'Short hand = hour', detail: 'The hour is whichever number the short hand has already passed, even if it is close to the next one.' },
      { label: 'Long hand = minutes, counted by 5s', detail: 'The long hand on the 3 means 15 minutes, because 5, 10, 15 is three steps of five.' },
      { label: 'Long hand on the 12', detail: 'That means 0 minutes past the hour — written :00.' },
      { label: 'a.m. and p.m.', detail: 'a.m. is midnight to noon (morning); p.m. is noon to midnight (afternoon and night).' },
    ],
    stepByStepMethod: [
      'Step 1: Find the short hand and say which hour it has already passed.',
      'Step 2: Find the long hand and count by fives from the 12 around to where it points.',
      'Step 3: Put the hour and the minutes together.',
      'Step 4: Decide a.m. or p.m. from whether the story is morning or afternoon and night.',
    ],
    commonTraps: [
      'Reading the number the long hand points to as the minutes directly, instead of counting by fives to get there — the 3 means 15 minutes, not 3.',
      'Swapping the two hands, reading the long hand’s position as the hour and the short hand’s as minutes.',
      'Reading the hour as the number the short hand is heading toward instead of the one it has already passed, especially late in the hour.',
      'Mixing up a.m. and p.m. — writing a morning time as p.m. or a nighttime as a.m.',
    ],
    workedExample: {
      problem: 'Nora looks at her clock in the morning. The short hour hand is just past the 8. The long minute hand points straight at the 3. What time is it?',
      steps: [
        '1. The short hand tells the hour. It is just past the 8, so the hour is 8.',
        '2. The long hand tells the minutes. Count by fives to the 3: 5, 10, 15.',
        '3. It is morning, and morning times are a.m.',
      ],
      answer: '8:15 a.m.',
      whyItMattersForSSA:
        'Measurement & Data is 9 of the 23 Grade 2 standards, and counting by fives around a clock face is the same skip-counting skill the Base Ten domain teaches for 245, 250, 255 — just wrapped around a circle instead of a number line.',
    },
  },

  'NC.2.MD.8': {
    standardCode: 'NC.2.MD.8',
    title: 'Money Word Problems: Coins and Dollar Bills',
    coreConcept:
      'Coins are counted by what they are worth, not by how many there are — a quarter and a dime is 35 cents, not 2. Cent amounts under a dollar use the ¢ sign, and whole-dollar amounts use the $ sign, and a problem never mixes the two.',
    rulesAndFormulas: [
      { label: 'Coin values', detail: 'Quarter = 25¢, dime = 10¢, nickel = 5¢, penny = 1¢.' },
      { label: 'Count coins by value', detail: 'A quarter and a dime together are 25¢ + 10¢ = 35¢, not 2 coins.' },
      { label: 'Cents vs. dollars', detail: 'Amounts under a dollar use ¢ (60¢); whole dollar amounts use $ ($45) — never write $ for a cents amount.' },
      { label: 'How much more?', detail: 'Subtract what you have from the price to find how much more is needed.' },
    ],
    stepByStepMethod: [
      'Step 1: Add up the coins or dollars by their value, not by how many there are.',
      'Step 2: Decide what the problem is asking: a total, what is left, or how much more is needed.',
      'Step 3: Add or subtract, working with cents together or dollars together, never a mix.',
      'Step 4: Write the answer with the right symbol, ¢ or $.',
    ],
    commonTraps: [
      'Counting how many coins there are instead of what they are worth — 2 coins is not 2¢ when they are a quarter and a dime.',
      'Mixing up the values of a dime and a nickel, or another coin pair, when adding coins together.',
      'Finding the right amount of money but writing it with the wrong symbol — $35 instead of 35¢, which is a hundred times more.',
      'Counting the coins correctly and stopping there instead of comparing that amount to the price being asked about.',
    ],
    workedExample: {
      problem: 'Rae has 1 quarter and 1 dime. A sticker costs 50¢. How much more money does Rae need?',
      steps: [
        '1. Count Rae’s coins by value: the quarter is 25¢, and the dime is 10¢ more: 35¢.',
        '2. The sticker costs 50¢.',
        '3. Count up from 35¢ to 50¢: 50 − 35 = 15.',
      ],
      answer: '15¢',
      whyItMattersForSSA:
        'Measurement & Data is 9 of the 23 Grade 2 standards, and counting coins by value instead of by count uses the very same within-100 addition and subtraction the Base Ten domain builds, just wearing a ¢ sign.',
    },
  },

  'NC.2.MD.10': {
    standardCode: 'NC.2.MD.10',
    title: 'Picture Graphs and Bar Graphs: Organize, Then Read',
    coreConcept:
      'A picture graph or bar graph organizes data into up to four categories so it is easy to compare. In Grade 2, each picture and each space on the scale stands for exactly 1 — so you can read a count straight off the graph, once you have counted or organized it correctly.',
    rulesAndFormulas: [
      { label: 'Organize the data first', detail: 'Sort what was counted into its categories before drawing a single bar or picture.' },
      { label: 'The scale in Grade 2', detail: 'Every picture and every space on a Grade 2 graph stands for exactly 1. (In Grade 3, a picture can stand for more than 1 — but not yet.)' },
      { label: 'Put together / take apart', detail: 'Add two categories for "in all," or subtract to find a missing category when the total is known.' },
      { label: 'Compare', detail: '"How many more" or "how many fewer" means subtract the smaller bar from the larger one.' },
    ],
    stepByStepMethod: [
      'Step 1: Read the title to know what the graph is counting.',
      'Step 2: For a picture graph or bar graph, each picture or space counts as 1. For a tally chart, a bundle of marks with one line drawn across it counts as 5.',
      'Step 3: Count each category using that value, not by counting marks one at a time.',
      'Step 4: Add, subtract, or compare the categories the question actually asks about.',
    ],
    commonTraps: [
      'Reading a tally bundle of five as four, missing the line drawn across the bundle that makes it the fifth mark.',
      'Adding every category shown instead of only the ones the question names.',
      'Finding a sum or difference for the categories that are shown, then stopping instead of using it to answer the actual question, such as a missing category.',
      'Comparing the wrong two bars — picking the tallest bar instead of the one the question actually names.',
    ],
    workedExample: {
      problem: 'The tally chart "Our Class Pet" shows: Dog, a bundle of 5 tally marks and 2 more marks; Cat, 4 tally marks; Fish, a bundle of 5 tally marks; Bird, 3 tally marks. Draw a bar graph to match. How tall should each bar be?',
      steps: [
        '1. A bundle of tally marks is 5: four marks with a fifth drawn across them.',
        '2. Count each animal by value: Dog = 5 + 2 = 7. Cat = 4. Fish = 5. Bird = 3.',
        '3. Each bar graph space stands for exactly 1, so each bar goes up to its own count.',
      ],
      answer: 'Dog to 7, Cat to 4, Fish to 5, Bird to 3',
      whyItMattersForSSA:
        'Measurement & Data is 9 of the 23 Grade 2 standards, and organizing counted data into a graph — not just reading one someone else already drew — uses the same "put together, take apart, compare" reasoning the length and money word problems in this same domain use, just applied to data instead of numbers.',
    },
  },

  // ----------------------------------------------------------------------
  // Geometry (2 of 23 standards)
  // ----------------------------------------------------------------------
  'NC.2.G.1': {
    standardCode: 'NC.2.G.1',
    title: 'Naming Shapes and Solids by Their Attributes',
    coreConcept:
      'A shape’s name tells you how many straight sides it has. A triangle has 3, a quadrilateral has 4, a pentagon has 5, and a hexagon has 6. It does not matter how the shape is turned, stretched, or tilted. A solid like a rectangular prism or a cube has flat faces, straight edges, and corners. You can count them even when a picture hides some of them from view.',
    rulesAndFormulas: [
      { label: 'Side counts name 2-D shapes', detail: 'Triangle 3, quadrilateral 4, pentagon 5, hexagon 6 — count the straight sides.' },
      { label: 'Size and tilt do not matter', detail: 'A long, thin, or tilted four-sided shape is still a quadrilateral — only the side count decides the name.' },
      { label: 'Rectangular prisms and cubes have faces', detail: 'A rectangular prism has 6 flat faces, even though a single picture only shows 3 of them at once.' },
      { label: 'Combine two attributes', detail: '4 equal sides with square corners is a square; 4 equal sides with NO square corners is a rhombus.' },
      { label: 'Drawing from attributes', detail: 'Asked to draw a shape with certain attributes — like "4 sides, no square corners" — draw ANY shape that fits every attribute given. More than one correct drawing is possible.' },
    ],
    stepByStepMethod: [
      'Step 1: Count the straight sides of the shape.',
      'Step 2: If more than one property is given — like equal sides AND corner type — check both before naming it.',
      'Step 3: For a solid, count faces (flat sides), edges (straight lines where two faces meet), or corners — whichever the question asks for.',
      'Step 4: Remember a picture only shows some of a solid’s faces; the hidden ones still count.',
      'Step 5: If you are asked to DRAW a shape instead of naming one, draw a shape that fits every attribute listed.',
    ],
    commonTraps: [
      'Confusing a shape’s name with its side count — mixing up pentagon (5) and hexagon (6), which sound alike and sit right next to each other.',
      'Judging a shape by how it looks — unusually long, thin, or tilted — rather than by counting its actual sides.',
      'Counting only the faces of a solid visible in a picture instead of every face, including the ones hidden behind it.',
      'Counting a solid’s edges or corners when the question asks for faces, or the reverse.',
      'When drawing a shape from a list of attributes, drawing one that fits only some of them instead of every attribute listed.',
    ],
    workedExample: {
      problem: 'A box shaped like a rectangular prism has a flat face on every side, including the sides hidden from view in a picture of it. How many faces does it have in all?',
      steps: [
        '1. A face is one whole flat side of the solid, like one side of a cardboard box.',
        '2. A rectangular prism has a top, a bottom, a front, a back, and two ends — six flat sides in all.',
        '3. A picture only shows three of those faces at once; the other three are hidden behind them.',
      ],
      answer: '6 faces',
      whyItMattersForSSA:
        'Geometry is 2 of the 23 Grade 2 standards, and naming a shape by its actual attributes rather than how it looks is the reasoning skill Grade 3’s much deeper study of quadrilaterals builds on directly.',
    },
  },

  'NC.2.G.3': {
    standardCode: 'NC.2.G.3',
    title: 'Halves, Thirds, and Fourths: Equal Shares of a Whole',
    coreConcept:
      'A share word like half, third, or fourth means two things at once: how many pieces there are, AND that every piece is exactly the same size. Two pieces that are not the same size are never halves, no matter how many pieces there are.',
    rulesAndFormulas: [
      { label: 'Halves', detail: '2 equal pieces. The whole is two halves.' },
      { label: 'Thirds', detail: '3 equal pieces. The whole is three thirds.' },
      { label: 'Fourths', detail: '4 equal pieces. The whole is four fourths.' },
      { label: 'Equal shares can look different', detail: 'Two identical square pizzas can both be cut into halves — one straight down the middle, one corner to corner — and the pieces are still equal in size even though they are different shapes.' },
    ],
    stepByStepMethod: [
      'Step 1: Count how many pieces the whole is cut into.',
      'Step 2: Check that every piece is really the SAME size — not just the same number of pieces.',
      'Step 3: Match the count to its share word: 2 is halves, 3 is thirds, 4 is fourths.',
      'Step 4: Describe the whole using that word: two halves, three thirds, four fourths.',
    ],
    commonTraps: [
      'Calling unequal pieces halves (or thirds, or fourths) just because there are the right number of them, without checking they are actually the same size.',
      'Miscounting the number of equal shares, mixing up how many pieces make a half versus a third versus a fourth.',
      'Expecting equal shares of two identical wholes to look the same shape, when a whole can be cut into equal pieces more than one way.',
      'Judging whether pieces are equal by how they look instead of checking the actual cuts.',
    ],
    workedExample: {
      problem: 'A circle is cut into 3 equal pieces. What is each piece called, and what is the whole circle made of?',
      steps: [
        '1. The circle is cut into 3 equal pieces.',
        '2. When a whole is split into 3 equal pieces, each piece is called a third.',
        '3. All 3 of the equal pieces together make up the whole circle.',
      ],
      answer: 'Each piece is a third, and the whole circle is three thirds',
      whyItMattersForSSA:
        'Geometry is 2 of the 23 Grade 2 standards, and splitting a whole into equal shares here is the very first step toward the fraction standards — same numerator, same denominator comparisons — that take over a large share of the Grade 3 curriculum.',
    },
  },
};
