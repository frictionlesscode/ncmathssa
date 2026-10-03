import type { StudyGuideSection } from '../../types';

/** One revision guide per Grade 1 standard.
 *
 *  AUDIENCE: at this grade the study guide's real reader is the parent.
 *  `coreConcept` and `commonTraps` are written to be read aloud or
 *  paraphrased by an adult sitting beside a six-year-old - they name the
 *  error a real child makes, in words a parent will recognize the moment it
 *  happens again. `workedExample.problem` is pitched at the CHILD'S reading
 *  level: short, concrete, and solvable out loud.
 *
 *  Four rules bind every entry:
 *
 *  1. The mathematics comes from `./standards.ts` - the sourced NC text and
 *     its `keyConcepts` - never from what a code is assumed to mean or from
 *     the Common Core standard sharing its number. Rulings 22-1, 23-1 and
 *     24-1 of
 *     `.superpowers/sdd/2026-09-13-grades-1-4-content/task-22-26-rulings.md`
 *     record three code swaps the brief got backward: NC.1.OA.6 is "add and
 *     subtract within 20 using strategies" (fluency-within-10 is NC.1.OA.9);
 *     NC.1.NBT.1 is counting to 150 from any start (NC.1.NBT.7 is reading
 *     and writing numerals to 100); NC.1.MD.3 is telling time
 *     (NC.1.MD.5 is coins).
 *  2. Ruling 25-1: NCDPI publishes no blueprint below Grade 3, so no guide
 *     cites a percentage anywhere, and none claims a "blueprint" exists.
 *     Ruling 25-2: `whyItMattersForSSA` instead cites the domain's share of
 *     the grade's 23 standards as a COUNT - OA 8 of 23, NBT 7 of 23, MD 5 of
 *     23, G 3 of 23 - the same arithmetic as `domainWeight()`'s
 *     even-by-standard-count branch.
 *  3. No guide makes a claim about what comes before or after a standard
 *     that `standards.ts` does not itself support - no "the next standard
 *     builds on this" and no "in Grade 2 you'll...". Every `commonTraps`
 *     line instead echoes the wording of this grade's authored banks'
 *     `commonMisconception` lines (`./authored.oa.ts`, `./authored.nbt.ts`,
 *     `./authored.md.ts`, `./authored.g.ts`), and every worked example is
 *     solved fresh here and checked step by step.
 *  4. Every rule stated to a child or parent is checked at its edges before
 *     it is written down - crossing a ten, crossing a hundred, equal
 *     numbers, zero - so nothing here is a rule that is only true most of
 *     the time (e.g. "10 more only changes the tens digit" is stated with
 *     its own edge case, 10 less from a number in the teens, spelled out
 *     rather than silently true "usually").
 */
export const GRADE_1_STUDY_GUIDES: Record<string, StudyGuideSection> = {
  // ----------------------------------------------------------------------
  // Operations & Algebraic Thinking (8 of 23 standards)
  // ----------------------------------------------------------------------
  'NC.1.OA.1': {
    standardCode: 'NC.1.OA.1',
    title: 'Three Kinds of Word Problems within 20',
    coreConcept:
      'A word problem tells a short story with one number missing. In Grade 1 there are three shapes that missing number can take: something happened and you need to find what changed (Add to/Take from), a group is made of two smaller groups and one of those parts is missing (Put together/Take Apart), or two amounts are being compared and the missing number is how much bigger or smaller one is than the other. Before solving, find which of these three shapes the story is.',
    rulesAndFormulas: [
      { label: 'Change unknown', detail: 'The story gives a starting amount and an ending amount; the missing number is what happened in between.' },
      { label: 'Addend unknown', detail: 'A total is made of two parts, one part is known, and the missing number is the other part.' },
      { label: 'Difference unknown', detail: 'Two amounts are compared, and the missing number is how many more or fewer one has than the other.' },
    ],
    stepByStepMethod: [
      'Step 1: Read the whole story before touching any numbers.',
      'Step 2: Decide which of the three shapes it is: something changing, two parts of a whole, or a comparison.',
      'Step 3: Write it as an equation with a box for the missing number.',
      'Step 4: Solve for the box, then check the answer makes sense in the story.',
    ],
    commonTraps: [
      'Adding the two numbers in the story out of habit, even when the story is really asking for a difference or for what changed.',
      'Answering with a number the story already gave instead of solving for the missing one - for example answering 5 in a "how many did she eat" problem because 5 is the number left, not the number eaten.',
      'Counting on or back by ones and stopping one count short or going one count too many.',
    ],
    workedExample: {
      problem: 'Ana read 14 books and Ben read 9. How many more did Ana read?',
      steps: [
        '1. This is a comparison: two amounts, and the missing number is how many more.',
        '2. Write it as 9 + ☐ = 14.',
        '3. Count on from 9 to 14: 10, 11, 12, 13, 14. That is 5 counts.',
        '4. Ana read 5 more books than Ben.',
      ],
      answer: '5 books',
      whyItMattersForSSA:
        'Operations & Algebraic Thinking is 8 of the 23 Grade 1 standards, and telling these three problem shapes apart - especially the compare shape, which is the one first-graders find hardest - is what makes a word problem solvable instead of a guessing game.',
    },
  },

  'NC.1.OA.2': {
    standardCode: 'NC.1.OA.2',
    title: 'Adding Three Numbers by Finding a Ten',
    coreConcept:
      'When a story adds three numbers whose total is 20 or less, the three numbers do not have to be added in the order the story tells them. Looking for two of the three that make 10 - wherever they sit in the story - turns the problem into 10 plus one more number, which is quicker to add.',
    rulesAndFormulas: [
      { label: 'Three addends, one problem', detail: 'In this standard, the three numbers in a problem total 20 or less.' },
      { label: 'Any order, any grouping', detail: 'The three numbers can be added in whatever order is easiest, and the total stays the same.' },
      { label: 'Look for a ten', detail: 'If two of the three numbers make 10, add those first, then add the third number to 10.' },
    ],
    stepByStepMethod: [
      'Step 1: Write the three numbers as one addition problem.',
      'Step 2: Look for any two of the three that add to 10, even if they are not next to each other in the story.',
      'Step 3: Add those two first, then add the remaining number to 10.',
    ],
    commonTraps: [
      'Adding only two of the three numbers and leaving the third one out of the total.',
      'Using one of the numbers twice - once inside the pair that made 10, and then again on its own.',
      'Counting on by ones through the last addend and landing one number too high or too low.',
    ],
    workedExample: {
      problem: 'Rosa picked 5 apples, then 3, then 5 more. How many in all?',
      steps: [
        '1. Write it as 5 + 3 + 5 = ☐.',
        '2. The two 5s make 10, so add those first: 5 + 5 = 10.',
        '3. 10 + 3 = 13.',
        '4. Rosa picked 13 apples in all.',
      ],
      answer: '13 apples',
      whyItMattersForSSA:
        'Operations & Algebraic Thinking is 8 of the 23 Grade 1 standards, and looking past the order numbers appear in a story for a pair that makes 10 is the same "find a ten" habit that makes every fact within 20 faster to add.',
    },
  },

  'NC.1.OA.3': {
    standardCode: 'NC.1.OA.3',
    title: 'Adding in Any Order, Grouping in Any Way',
    coreConcept:
      'Two numbers being added can be turned around without changing the total, and three numbers being added can be grouped in any way without changing the total either. These are strategies for making an addition problem easier, not vocabulary words a child needs to name - the goal is using the idea, not saying "commutative" or "associative" out loud.',
    rulesAndFormulas: [
      { label: 'Turn the order around', detail: 'Two addends can switch places and the total is the same: 4 + 9 = 9 + 4.' },
      { label: 'Group any way', detail: 'Three addends can be grouped in any pairing and the total is the same: 7 + 6 + 3 is the same whether the 7 and 3 are added first or the 7 and 6 are.' },
      { label: 'Applies to adding', detail: 'These two strategies are for addition problems, the way the standard uses them.' },
    ],
    stepByStepMethod: [
      'Step 1: Look at the numbers being added.',
      'Step 2: If turning two of them around, or starting with a different pair, makes an easier sum - usually a ten - do that first.',
      'Step 3: Finish the easier sum, and know the total is exactly the same as it would have been in the original order.',
    ],
    commonTraps: [
      'Starting to count on from the smaller number instead of the bigger one, making the count longer than it needs to be.',
      'Treating the equal sign as "write the first answer" instead of checking both full sides are the same amount.',
      'After grouping two numbers into a ten, adding one of those two numbers again instead of just the ten and what is left.',
    ],
    workedExample: {
      problem: 'What is 7 + 6 + 3? Try grouping two into a ten first.',
      steps: [
        '1. Look for two numbers that make 10: 7 + 3 = 10.',
        '2. Numbers can be grouped in any way, so add the 7 and 3 first.',
        '3. That leaves 10 and the 6: 10 + 6 = 16.',
        '4. 7 + 6 + 3 = 16.',
      ],
      answer: '16',
      whyItMattersForSSA:
        'Operations & Algebraic Thinking is 8 of the 23 Grade 1 standards, and using these two strategies - without needing their names - is what turns a three-number sum into an easy "10 plus something" problem.',
    },
  },

  'NC.1.OA.4': {
    standardCode: 'NC.1.OA.4',
    title: 'Finding the Missing Addend',
    coreConcept:
      'An unknown-addend problem asks what number, added to a known number, makes a given total. It can be solved with an addition strategy - like counting on or making a ten - or by rewriting it as a take-away problem, since addition and subtraction are related: 8 + ☐ = 13 asks the same question as 13 − 8.',
    rulesAndFormulas: [
      { label: 'Add on to find it', detail: 'From the known addend, count or jump forward to the total, and the missing addend is however far that took.' },
      { label: 'Rewrite as a take-away', detail: '8 + ☐ = 13 can be answered by finding 13 − 8 instead.' },
      { label: 'Addition and subtraction are related', detail: 'The same three numbers appear in both the addition sentence and its matching subtraction sentence.' },
    ],
    stepByStepMethod: [
      'Step 1: Find the known addend and the total in the equation.',
      'Step 2: Either add on from the known addend up to the total, or rewrite the problem as the total minus the known addend.',
      'Step 3: Solve, then check that the known addend plus your answer really does make the total.',
    ],
    commonTraps: [
      'Adding the known addend and the total together instead of finding the difference between them.',
      'Writing a number that is already in the problem into the box instead of solving for the missing addend.',
      'Making a ten while adding on, then forgetting to also count the second jump from ten up to the total.',
    ],
    workedExample: {
      problem: 'What number makes 8 + ☐ = 13 true? Think: 13 − 8.',
      steps: [
        '1. 8 + ☐ = 13 asks what goes with 8 to make 13.',
        '2. Rewrite it as a take-away: ☐ is 13 − 8.',
        '3. Take 8 away from 13 in two jumps: 13 − 3 = 10, and 10 − 5 = 5.',
        '4. The number in the box is 5.',
      ],
      answer: '5',
      whyItMattersForSSA:
        'Operations & Algebraic Thinking is 8 of the 23 Grade 1 standards, and seeing that a missing addend can be found by subtracting is the same addition-subtraction relationship the equal-sign and unknown-number standards in this same domain use.',
    },
  },

  'NC.1.OA.9': {
    standardCode: 'NC.1.OA.9',
    title: 'Fast, Sure Facts within 10',
    coreConcept:
      'Fluency within 10 means knowing addition and subtraction facts up to 10 accurately and quickly, by recall rather than by counting one at a time. A fact family - like 5 + 3 = 8 and 8 − 3 = 5 - uses the same three numbers both ways, and any number take away itself always leaves 0.',
    rulesAndFormulas: [
      { label: 'Addition facts within 10', detail: 'Sums up to 10, known well enough to answer without counting.' },
      { label: 'Subtraction facts within 10', detail: 'Differences within 10, known the same way.' },
      { label: 'A number minus itself is 0', detail: '7 − 7 = 0, and this holds for every number.' },
    ],
    stepByStepMethod: [
      'Step 1: Look at the fact and try to recall it right away, before counting.',
      'Step 2: If it is part of a fact family you know, use the related fact to find it.',
      'Step 3: Only count on fingers or by ones as a last check, not as the main way to solve it.',
    ],
    commonTraps: [
      'Counting on or back by ones for a fact that should be recalled quickly, and losing the count partway through.',
      'Adding when a subtraction fact family member is asked for, or the reverse.',
      'Writing one of the two given numbers back as the answer instead of working out the fact.',
    ],
    workedExample: {
      problem: 'What is 7 − 7?',
      steps: [
        '1. Start with 7 and take all 7 away.',
        '2. Nothing is left.',
        '3. 7 − 7 = 0.',
      ],
      answer: '0',
      whyItMattersForSSA:
        'Operations & Algebraic Thinking is 8 of the 23 Grade 1 standards, and quick, accurate facts within 10 are the building blocks every strategy for adding and subtracting within 20 in this same domain is built from.',
    },
  },

  'NC.1.OA.6': {
    standardCode: 'NC.1.OA.6',
    title: 'Strategies for Adding and Subtracting within 20',
    coreConcept:
      'There is more than one good way to add or subtract within 20: counting on, making a ten, decomposing a number to get to a ten, using the connection between addition and subtraction, using a number line, or turning a problem into an easier one with the same answer. Picking a strategy that fits the numbers - and using it correctly all the way through - is the point.',
    rulesAndFormulas: [
      { label: 'Counting on', detail: 'Start at the bigger number and count forward the smaller number of times - the starting number itself is not one of the counts.' },
      { label: 'Making ten', detail: 'Break one addend apart so part of it fills the other up to 10, then add what is left.' },
      { label: 'Decomposing to a ten', detail: 'In subtraction, break the number being subtracted apart to land on 10 first, then finish subtracting what is left.' },
      { label: 'Addition and subtraction connection', detail: 'A subtraction fact can be checked, or found, using its related addition fact.' },
      { label: 'A number line', detail: 'Jumps forward show adding, and jumps backward show subtracting.' },
      { label: 'An equivalent, simpler sum', detail: 'A hard fact can be replaced with an easier one that has the same answer, such as using a doubles fact you already know.' },
    ],
    stepByStepMethod: [
      'Step 1: Look at both numbers and pick a strategy that fits them - close to a ten, a near-double, or easiest to count on.',
      'Step 2: Apply that strategy one step at a time.',
      'Step 3: Combine the parts back together for the final answer.',
    ],
    commonTraps: [
      'Counting on by ones and losing track, landing one number too high or too low.',
      'After making a ten, adding the whole original number again instead of only what was left over.',
      'Stopping after the first jump of a two-jump strategy and reporting that partial amount as the final answer.',
    ],
    workedExample: {
      problem: 'What is 15 + 3? Count on from 15.',
      steps: [
        '1. Use counting on: start at 15 and count forward 3.',
        '2. The first number to say is 16: 16, 17, 18.',
        '3. 15 + 3 = 18.',
      ],
      answer: '18',
      whyItMattersForSSA:
        'Operations & Algebraic Thinking is 8 of the 23 Grade 1 standards, and having several strategies to choose from - rather than counting by ones every time - is what makes adding and subtracting within 20 fast and reliable.',
    },
  },

  'NC.1.OA.7': {
    standardCode: 'NC.1.OA.7',
    title: 'What the Equal Sign Really Means',
    coreConcept:
      'The equal sign means both sides have the same value - it does not mean "write the answer next." An equation can have adding or subtracting on either side, or both sides, and the answer can even come first. Deciding whether an equation is true means working out each side and checking they match.',
    rulesAndFormulas: [
      { label: 'Same value, not "answer next"', detail: 'The equal sign says both sides are equal amounts, wherever the operations sit.' },
      { label: 'True or false', detail: 'Work out each side on its own, then compare the two results.' },
      { label: 'Operations on both sides', detail: 'An equation can have adding or subtracting on the left, the right, or both.' },
    ],
    stepByStepMethod: [
      'Step 1: Work out the value of the left side by itself.',
      'Step 2: Work out the value of the right side by itself.',
      'Step 3: Compare the two values to decide if the equation is true.',
    ],
    commonTraps: [
      'Checking only part of one side and assuming the equation is true once that part looks right.',
      'Expecting every equation to have a single number on the right, and being confused when the answer comes first or both sides have operations.',
      'Reading a minus sign as a plus sign, or a plus sign as a minus sign, while working out a side.',
    ],
    workedExample: {
      problem: 'Is 9 = 5 + 4 true?',
      steps: [
        '1. Work out the right side: 5 + 4 = 9.',
        '2. Work out the left side: 9.',
        '3. Both sides equal 9.',
        '4. The equation is true.',
      ],
      answer: 'True',
      whyItMattersForSSA:
        'Operations & Algebraic Thinking is 8 of the 23 Grade 1 standards, and understanding the equal sign as "the same amount as" rather than "answer goes here" is what makes finding an unknown number in any position, in this same domain, possible.',
    },
  },

  'NC.1.OA.8': {
    standardCode: 'NC.1.OA.8',
    title: 'Finding the Unknown, Wherever It Sits',
    coreConcept:
      'An equation can relate three whole numbers with addition or subtraction, and the missing number - the unknown - can sit in any position: on the left, on the right, first, last, or in the middle. The way to solve it stays the same no matter where the box is: figure out what the other side or the other two numbers require.',
    rulesAndFormulas: [
      { label: 'The unknown can be anywhere', detail: '☐ = 9 − 3 and 9 − 3 = ☐ ask exactly the same question.' },
      { label: 'Addition and subtraction alike', detail: 'The unknown can appear in either an addition equation or a subtraction equation.' },
      { label: 'Solve the known side first', detail: 'When the unknown is alone on one side, work out the other side completely, and that value is the answer.' },
    ],
    stepByStepMethod: [
      'Step 1: Find where the box sits in the equation.',
      'Step 2: Work out the side of the equation that does not contain the box.',
      'Step 3: The unknown equals whatever that other side works out to.',
    ],
    commonTraps: [
      'Assuming the unknown only ever comes last, and getting stuck when it is on the left instead.',
      'Reading a minus sign as a plus sign while working out the known side.',
      'Writing one of the given numbers into the box instead of solving for what is actually missing.',
    ],
    workedExample: {
      problem: 'What number makes ☐ = 9 − 3 true?',
      steps: [
        '1. The box is on the left, but the equation still says both sides are equal.',
        '2. Work out the right side: 9 − 3 = 6.',
        '3. The box must also equal 6.',
      ],
      answer: '6',
      whyItMattersForSSA:
        'Operations & Algebraic Thinking is 8 of the 23 Grade 1 standards, and solving for an unknown no matter where it sits in the equation uses the very meaning of the equal sign that this same domain\'s equal-sign standard teaches.',
    },
  },

  // ----------------------------------------------------------------------
  // Number & Operations in Base Ten (7 of 23 standards)
  // ----------------------------------------------------------------------
  'NC.1.NBT.1': {
    standardCode: 'NC.1.NBT.1',
    title: 'Counting All the Way to 150',
    coreConcept:
      'Counting on by ones works the same way no matter where you start or how far you go - all the way to 150. Sometimes the very next number crosses into a new ten (89 to 90), and sometimes it crosses into a new hundred (99 to 100). Going from 129 to 130 crosses a ten inside the hundred, and the hundreds digit stays 1. All of these are still just "the next number," counted the same way.',
    rulesAndFormulas: [
      { label: 'Start anywhere below 150', detail: 'Counting on by ones can begin at any number less than 150, not only at 1.' },
      { label: 'Crossing a ten', detail: 'After 89 comes 90 - the ones digit resets to 0 and the tens digit goes up by one.' },
      { label: 'Crossing into the hundreds', detail: 'After 99 comes 100, and the hundreds digit goes up by one. After 129 comes 130, which crosses a ten: the hundreds digit stays 1 and the tens digit goes up by one.' },
    ],
    stepByStepMethod: [
      'Step 1: Say the number you are on.',
      'Step 2: Count on by one to find the very next number.',
      'Step 3: If a 9 in the ones or tens place is about to move on, expect the next place over to go up by one too.',
    ],
    commonTraps: [
      'Going back to the start of the current ten instead of moving on to the next one - saying 80 after 89 instead of 90.',
      'Skipping a whole ten while counting on, such as jumping straight from 89 to 100.',
      'Skipping over a single number while counting on, such as going from 89 straight to 91.',
    ],
    workedExample: {
      problem: 'Mia counts 128, 129. What comes next?',
      steps: [
        '1. Count on by one from 129.',
        '2. 129 is followed by 130, the same way 9 is followed by 10.',
        '3. The next number is 130.',
      ],
      answer: '130',
      whyItMattersForSSA:
        'Number & Operations in Base Ten is 7 of the 23 Grade 1 standards, and counting past 99 into the hundreds, and past 129 into a new ten, the same way the count crosses every other ten is what lets a child count all the way to 150 without getting stuck at the trickiest spots.',
    },
  },

  'NC.1.NBT.7': {
    standardCode: 'NC.1.NBT.7',
    title: 'Reading and Writing Numbers to 100',
    coreConcept:
      'A number from 0 to 100 can be read aloud, written as digits, or shown by counting a group of objects. A teen number is a ten and some ones, and it is written with the 1 for the ten first, then the ones digit - not the other way around. A decade word like "seventy" and a teen word like "seventeen" sound alike but are different amounts.',
    rulesAndFormulas: [
      { label: 'Teen numbers write the ten first', detail: 'Thirteen is 1 ten and 3 ones, written 13 - not 31.' },
      { label: 'Teens and decades sound alike but differ', detail: 'Seventeen is a teen number (17); seventy is 7 tens (70).' },
      { label: 'A numeral represents a count', detail: 'A group of 3 tens and 6 ones of objects is represented by the numeral 36.' },
    ],
    stepByStepMethod: [
      'Step 1: Figure out how many tens and how many ones the number has.',
      'Step 2: Write the tens digit first, then the ones digit.',
      'Step 3: Read the written numeral back to check it matches what was meant.',
    ],
    commonTraps: [
      'Writing the digits in the order they were said instead of tens-then-ones, turning thirteen into 31.',
      'Mixing up a teen number with its decade, such as writing 70 for seventeen.',
      'Writing only part of the number name, such as writing 7 for seventeen and leaving out the ten.',
    ],
    workedExample: {
      problem: 'Which number is thirteen?',
      steps: [
        '1. Thirteen is 1 ten and 3 ones.',
        '2. 1 ten and 3 ones is written 13.',
        '3. Thirteen is written 13.',
      ],
      answer: '13',
      whyItMattersForSSA:
        'Number & Operations in Base Ten is 7 of the 23 Grade 1 standards, and writing the tens digit before the ones digit is the exact habit that keeps every two-digit number in this domain - comparing, adding, finding 10 more - from being written backward.',
    },
  },

  'NC.1.NBT.2': {
    standardCode: 'NC.1.NBT.2',
    title: 'What Each Digit Is Worth: Tens and Ones',
    coreConcept:
      'A two-digit number is made of tens and ones. Every teen number from 11 to 19 is one ten together with some ones - 13 is a ten and 3 more ones. A number like 10, 20, 30, up through 90 is made of that many tens and zero leftover ones, with nothing in the ones place.',
    rulesAndFormulas: [
      { label: 'Ten ones make a ten', detail: 'A collection of ten ones can be treated as one group: a ten.' },
      { label: 'Teens are a ten plus ones', detail: '11 through 19 are each 1 ten together with 1 through 9 more ones.' },
      { label: 'Multiples of ten have zero ones', detail: '10, 20, 30 ... 90 are that many tens with nothing left over in the ones place.' },
    ],
    stepByStepMethod: [
      'Step 1: Decide how many whole tens are in the number.',
      'Step 2: Decide how many ones are left over.',
      'Step 3: State the number as that many tens and that many ones.',
    ],
    commonTraps: [
      'Reading a teen number backward, treating 13 as if it were 3 tens and 1 one instead of 1 ten and 3 ones.',
      'Answering a "how many tens" question with the ones digit instead, such as saying 0 tens are in 70.',
      'Writing the digits in the order objects were counted rather than tens-then-ones, turning 4 tens and 2 ones into 24 instead of 42.',
    ],
    workedExample: {
      problem: '13 is 1 ten and how many ones?',
      steps: [
        '1. 13 is made of 1 ten and some ones.',
        '2. The ones part of 13 is 3.',
        '3. 13 is 1 ten and 3 ones.',
      ],
      answer: '3 ones',
      whyItMattersForSSA:
        'Number & Operations in Base Ten is 7 of the 23 Grade 1 standards, and seeing a two-digit number as tens and ones is what makes comparing two-digit numbers and finding 10 more or 10 less, both elsewhere in this domain, possible at all.',
    },
  },

  'NC.1.NBT.3': {
    standardCode: 'NC.1.NBT.3',
    title: 'Comparing Two-Digit Numbers, Tens First',
    coreConcept:
      'To compare two two-digit numbers, look at the tens digit first, not the ones digit. Whichever number has more tens is greater, no matter what its ones digit is. Only when the tens digits match does the ones digit decide it. The results are recorded with the symbols >, =, and <.',
    rulesAndFormulas: [
      { label: 'Compare tens first', detail: 'The tens digit decides the comparison before the ones digit gets a turn.' },
      { label: 'Ones digit as a tiebreaker', detail: 'Only when both tens digits match does the ones digit decide which number is greater.' },
      { label: 'Record with symbols', detail: 'Comparisons are written using >, =, and <, always opening toward the greater number.' },
    ],
    stepByStepMethod: [
      'Step 1: Compare the tens digits of the two numbers.',
      'Step 2: If they differ, the number with more tens is greater - stop there.',
      'Step 3: If the tens digits match, compare the ones digits instead.',
      'Step 4: Write the comparison with >, =, or <.',
    ],
    commonTraps: [
      'Comparing the ones digits first and being misled when one number happens to have a big ones digit, like 38 next to 52.',
      'Assuming two numbers built from the same two digits must be equal, when 47 and 74 are not the same amount.',
      'Picking the least number when the question asked for the greatest, or the reverse.',
    ],
    workedExample: {
      problem: 'Which number is greater, 52 or 38?',
      steps: [
        '1. Compare the tens digits: 52 has 5 tens, and 38 has 3 tens.',
        '2. 5 tens is more than 3 tens.',
        '3. 52 is greater than 38.',
      ],
      answer: '52',
      whyItMattersForSSA:
        'Number & Operations in Base Ten is 7 of the 23 Grade 1 standards, and comparing the tens digit first is the same "what is each digit worth" thinking that finding 10 more or 10 less, elsewhere in this domain, depends on.',
    },
  },

  'NC.1.NBT.4': {
    standardCode: 'NC.1.NBT.4',
    title: 'Adding within 100: a One-Digit Number or a Multiple of Ten',
    coreConcept:
      'This standard adds a two-digit number to either a one-digit number or a multiple of 10 - never two arbitrary two-digit numbers added together. Adding a one-digit number can add up to 10 or more in the ones place, which trades for a new ten. Adding a multiple of 10 only ever changes the tens digit.',
    rulesAndFormulas: [
      { label: 'A two-digit number plus a one-digit number', detail: 'Add onto the ones place; if the ones reach 10 or more, trade ten ones for one more ten.' },
      { label: 'A two-digit number plus a multiple of 10', detail: 'Add onto the tens place only - the ones digit does not change.' },
      { label: 'A ten is traded, not written beside', detail: 'When ones reach 10, they become one more ten - they are not written as a separate "10" next to the existing tens.' },
    ],
    stepByStepMethod: [
      'Step 1: Decide whether the number being added is a one-digit number or a multiple of 10.',
      'Step 2: Add it to the matching place - ones for a one-digit number, tens for a multiple of 10.',
      'Step 3: If the ones reach 10 or more, trade 10 ones for 1 new ten and add that ten in with the rest.',
    ],
    commonTraps: [
      'Writing the new group of 10 ones as a separate "10" next to the existing tens digit instead of trading it into one more ten - turning 19 + 1 into 110 instead of 20.',
      'Adding a one-digit number into the tens place instead of the ones place.',
      'Dropping the ones digit already in the number when adding a multiple of 10 to it.',
    ],
    workedExample: {
      problem: 'What is 19 + 1?',
      steps: [
        '1. 19 is 1 ten and 9 ones. Adding 1 more one makes 10 ones.',
        '2. 10 ones trade for 1 new ten, leaving 2 tens and 0 ones.',
        '3. 19 + 1 = 20.',
      ],
      answer: '20',
      whyItMattersForSSA:
        'Number & Operations in Base Ten is 7 of the 23 Grade 1 standards, and trading 10 ones for a new ten here builds on the same tens-and-ones thinking the mental "10 more" standard in this domain uses.',
    },
  },

  'NC.1.NBT.5': {
    standardCode: 'NC.1.NBT.5',
    title: '10 More or 10 Less, Found Mentally',
    coreConcept:
      '10 more or 10 less than a two-digit number is found without counting, and it usually only changes the tens digit - the ones digit stays the same. Right at the edge, this needs one more step: if the tens digit is already 1, 10 less leaves only the ones (13 − 10 = 3). The number you start from is a two-digit number, so 10 more stays below 100.',
    rulesAndFormulas: [
      { label: 'Usually, only the tens digit moves', detail: '47 + 10 = 57 and 47 − 10 = 37: the 7 ones never change.' },
      { label: 'The biggest tens digit', detail: 'The tens digit can go up to 9 when you add 10 to a number in the eighties: 84 + 10 = 94.' },
      { label: 'Down to just the ones', detail: 'When the tens digit is 1, 10 less removes that whole ten, leaving only the ones: 13 − 10 = 3.' },
    ],
    stepByStepMethod: [
      'Step 1: Find the tens digit and the ones digit of the number.',
      'Step 2: Move the tens digit up by one for 10 more, or down by one for 10 less.',
      'Step 3: Check the edge case - a tens digit already at 1 (subtracting) leaves only the ones, as in 13 − 10 = 3.',
      'Step 4: The ones digit stays exactly the same throughout.',
    ],
    commonTraps: [
      'Changing the ones digit instead of the tens digit, turning 10 more into just 1 more.',
      'Moving in the wrong direction - giving 10 less when 10 more was asked for, or the reverse.',
      'Forgetting that taking 10 from a number in the teens leaves only the ones, and writing 0 or a wrong digit in the tens place.',
    ],
    workedExample: {
      problem: 'There are 84 pretzels, and 10 more are added. How many now?',
      steps: [
        '1. 84 is 8 tens and 4 ones.',
        '2. 10 more than 8 tens is 9 tens.',
        '3. 10 more than 84 is 94.',
      ],
      answer: '94',
      whyItMattersForSSA:
        'Number & Operations in Base Ten is 7 of the 23 Grade 1 standards, and knowing that 10 more only moves the tens digit is what lets a child add a multiple of 10 within 100, elsewhere in this domain, without counting.',
    },
  },

  'NC.1.NBT.6': {
    standardCode: 'NC.1.NBT.6',
    title: 'Subtracting Multiples of Ten',
    coreConcept:
      'Subtracting one multiple of 10 from another - both between 10 and 90, with the first never smaller than the second - works on the tens the same way ones subtract from ones. The answer is reported as a whole multiple of 10, with a 0 in the ones place, not as a single leftover digit.',
    rulesAndFormulas: [
      { label: 'Tens take away tens', detail: '6 tens take away 2 tens leaves 4 tens.' },
      { label: 'Report the full value', detail: '4 tens is written 40, not just the digit 4.' },
      { label: 'Both numbers are multiples of 10, from 10 to 90', detail: 'The number subtracted never leaves an amount below 0.' },
    ],
    stepByStepMethod: [
      'Step 1: Say how many tens are in each number.',
      'Step 2: Subtract the smaller number of tens from the larger.',
      'Step 3: Write the result as that many tens, with a 0 in the ones place.',
    ],
    commonTraps: [
      'Reporting just the digit left over, such as 4, instead of what it is worth, 40.',
      'Adding the two multiples of 10 together instead of subtracting them.',
      'Restating one of the two given numbers instead of solving for how many are left.',
    ],
    workedExample: {
      problem: 'There are 60 apples, and 20 are sold. How many are left?',
      steps: [
        '1. 60 is 6 tens. 20 is 2 tens.',
        '2. 6 tens take away 2 tens is 4 tens.',
        '3. 4 tens is 40, so 40 apples are left.',
      ],
      answer: '40 apples',
      whyItMattersForSSA:
        'Number & Operations in Base Ten is 7 of the 23 Grade 1 standards, and subtracting tens from tens uses the very same place-value thinking that comparing two-digit numbers, elsewhere in this domain, relies on.',
    },
  },

  // ----------------------------------------------------------------------
  // Measurement & Data (5 of 23 standards)
  // ----------------------------------------------------------------------
  'NC.1.MD.1': {
    standardCode: 'NC.1.MD.1',
    title: 'Comparing Lengths Using a Third Object',
    coreConcept:
      'Three objects can be put in order by length, and two objects that were never measured against each other directly can still be compared using a third object both were compared to. If one object is longer than a second, and that second is longer than a third, then the first is also longer than the third - checking all the given comparisons, not just one pair, is what finds the answer.',
    rulesAndFormulas: [
      { label: 'Order three by length', detail: 'Three objects can be placed in order from shortest to longest, or the reverse.' },
      { label: 'Compare indirectly', detail: 'Two objects can be compared through a third object that was measured against both.' },
      { label: 'Chaining comparisons', detail: 'If A is longer than B, and B is longer than C, then A is longer than C too.' },
    ],
    stepByStepMethod: [
      'Step 1: Write down every comparison the problem gives.',
      'Step 2: Chain the comparisons together rather than stopping after just one.',
      'Step 3: Decide the answer using all of the comparisons together.',
    ],
    commonTraps: [
      'Comparing only two of the three objects and answering from that one pair, missing what the third comparison shows.',
      'Reading a "longer than" comparison backward, as if it meant "shorter than."',
      'Concluding there is no way to tell, when the given comparisons actually do decide the answer once they are chained together.',
    ],
    workedExample: {
      problem: 'The pencil is longer than the crayon, which is longer than the eraser. Which is longest?',
      steps: [
        '1. The pencil is longer than the crayon.',
        '2. The crayon is longer than the eraser.',
        '3. Chaining those two facts: the pencil is longer than the crayon, which is longer than the eraser.',
        '4. The pencil is the longest.',
      ],
      answer: 'The pencil',
      whyItMattersForSSA:
        'Measurement & Data is 5 of the 23 Grade 1 standards, and chaining two given comparisons together to reach a third is the reasoning every "which is longer" question in this domain that does not hand over a direct comparison depends on.',
    },
  },

  'NC.1.MD.2': {
    standardCode: 'NC.1.MD.2',
    title: 'Measuring Length by Laying Units End to End',
    coreConcept:
      'A length can be measured with a non-standard unit - like a paper clip or a block - by laying repeated copies of that unit end to end along the whole length, with no gaps and no overlaps, and counting how many it took. The count is a whole number of that unit.',
    rulesAndFormulas: [
      { label: 'Whole-number count', detail: 'A measured length is expressed as a whole number of the unit used.' },
      { label: 'End to end, no gaps or overlaps', detail: 'Each copy of the unit sits right where the last one ended, with nothing skipped and nothing doubled up.' },
    ],
    stepByStepMethod: [
      'Step 1: Choose a unit and lay the first copy at the very start of the object.',
      'Step 2: Lay the next copy right where the last one ended, with no gap and no overlap.',
      'Step 3: Keep going to the end of the object, then count the copies used.',
    ],
    commonTraps: [
      'Leaving a small gap between each unit, which leaves part of the length uncovered and makes the count too low.',
      'Overlapping the units, which covers part of the length twice and makes the count too high.',
      'Stacking the units on top of each other instead of laying them along the length, which does not measure the length at all.',
    ],
    workedExample: {
      // Fix 2b (whole-branch review, polish): this was a statement with no
      // question; a question is added and stays within assertGradeOneReadable.
      problem: 'Ben measures his desk with 8 blocks laid end to end, with no gaps. How long is the desk?',
      steps: [
        '1. The blocks are laid end to end with no gaps or overlaps.',
        '2. Count every block laid along the desk: 8.',
        '3. The desk is 8 blocks long.',
      ],
      answer: '8 blocks',
      whyItMattersForSSA:
        'Measurement & Data is 5 of the 23 Grade 1 standards, and laying same-sized units end to end with no gaps or overlaps is what lets a non-standard unit measure a length as reliably as a ruler would.',
    },
  },

  'NC.1.MD.3': {
    standardCode: 'NC.1.MD.3',
    title: 'Telling Time to the Hour and Half-Hour',
    coreConcept:
      'The short hour hand names the hour, and the long minute hand shows whether it is exactly on the hour or half past. When the minute hand points at the 12, it is exactly on the hour. When the minute hand points at the 6, it is half past the hour - and at half past, the hour hand always sits halfway between the hour it just passed and the next one, on an analog clock.',
    rulesAndFormulas: [
      { label: 'Minute hand at 12', detail: 'Exactly on the hour, written with :00.' },
      { label: 'Minute hand at 6', detail: 'Half past the hour, written with :30.' },
      { label: 'Hour hand at half past', detail: 'Sits halfway between the hour just passed and the next hour - not exactly on either one.' },
    ],
    stepByStepMethod: [
      'Step 1: Find the hour hand and note which hour it has passed, or sits between.',
      'Step 2: Find the minute hand: at the 12 means :00, at the 6 means :30.',
      'Step 3: Put the hour and the minutes together for the full time.',
    ],
    commonTraps: [
      'Reading the hour hand as if it pointed exactly at a number, when at half past it sits between two numbers.',
      'Swapping the two hands, reading the long hand\'s position as the hour.',
      'Reading the number the minute hand points to as the minutes itself, instead of only checking whether it is at the 12 or the 6.',
    ],
    workedExample: {
      // Fix 2b (whole-branch review, polish): this was a statement with no
      // question. assertGradeOneReadable allows at most 2 sentences, so the
      // two original setup sentences are merged into one before the question.
      problem: 'The hour hand is halfway between 7 and 8, and the minute hand is at 6. What time is it?',
      steps: [
        '1. The minute hand points at the 6, which means half past the hour.',
        '2. The hour hand sits halfway between 7 and 8, matching half past 7.',
        '3. The time is 7:30.',
      ],
      answer: '7:30',
      whyItMattersForSSA:
        'Measurement & Data is 5 of the 23 Grade 1 standards, and reading the hour hand as sitting between two numbers at half past is exactly what keeps a half-hour time from being read as a whole hour.',
    },
  },

  'NC.1.MD.5': {
    standardCode: 'NC.1.MD.5',
    title: 'Coins and Their Value in Pennies',
    coreConcept:
      'A quarter, a dime, and a nickel each have a fixed value measured in pennies: a nickel is worth 5 pennies, a dime is worth 10 pennies, and a quarter is worth 25 pennies. The penny itself is the unit everything else is measured against. This grade identifies coins and relates each one to pennies - it does not add coin values together, use the $ or ¢ symbols, or solve money word problems.',
    rulesAndFormulas: [
      { label: 'Nickel', detail: 'Worth 5 pennies.' },
      { label: 'Dime', detail: 'Worth 10 pennies.' },
      { label: 'Quarter', detail: 'Worth 25 pennies.' },
      { label: 'Penny', detail: 'The unit of value every other coin is compared against.' },
    ],
    stepByStepMethod: [
      'Step 1: Identify which coin is being asked about.',
      'Step 2: Recall its fixed value in pennies.',
      'Step 3: If comparing two coins, compare those values directly.',
    ],
    commonTraps: [
      'Mixing up a dime\'s value with a nickel\'s, or another coin pair, since neither coin\'s size tells you its value.',
      'Assuming the bigger-looking coin is worth more - a nickel is larger than a dime but is worth fewer pennies.',
      'Confusing which coin a value belongs to, such as saying a dime is worth 25 pennies.',
    ],
    workedExample: {
      problem: 'Which coin is worth 10 pennies?',
      steps: [
        '1. Each coin has its own fixed value in pennies.',
        '2. A nickel is worth 5, a dime is worth 10, and a quarter is worth 25.',
        '3. The coin worth 10 pennies is the dime.',
      ],
      answer: 'A dime',
      whyItMattersForSSA:
        'Measurement & Data is 5 of the 23 Grade 1 standards, and knowing each coin\'s fixed value in pennies is what makes telling coins apart by worth, rather than by size, possible.',
    },
  },

  'NC.1.MD.4': {
    standardCode: 'NC.1.MD.4',
    title: 'Reading a Graph: Total, Each Category, and the Difference',
    coreConcept:
      'A graph organized into up to three categories can answer three kinds of questions: how many data points there are in all, how many are in one particular category, and how many more or fewer are in one category than another. Each of the three needs a different move: adding every category for the total, reading one category alone for its own count, or subtracting to compare two categories.',
    rulesAndFormulas: [
      { label: 'Total', detail: 'Add every category together to find the total number of data points.' },
      { label: 'One category', detail: 'Read that category\'s own count - not another category, and not the whole graph.' },
      { label: 'More or fewer', detail: 'Subtract the smaller category\'s count from the larger one\'s to find the difference.' },
    ],
    stepByStepMethod: [
      'Step 1: Read what each category shows.',
      'Step 2: Decide which of the three questions is being asked: total, one category, or a comparison.',
      'Step 3: Add, read alone, or subtract, matching the question asked.',
    ],
    commonTraps: [
      'Reading the wrong category\'s count when a question names one specific category.',
      'Adding every category together when the question only asked about one of them.',
      'Adding two categories instead of subtracting them when asked how many more or fewer one has than another.',
    ],
    workedExample: {
      problem: 'A graph shows 4 sunny days and 3 rainy days. How many days in all?',
      steps: [
        '1. The graph shows 4 sunny days and 3 rainy days.',
        '2. "In all" adds every category together.',
        '3. 4 + 3 = 7.',
      ],
      answer: '7 days',
      whyItMattersForSSA:
        'Measurement & Data is 5 of the 23 Grade 1 standards, and telling apart these three graph questions - total, one category, and a comparison - is what keeps the right operation attached to the right question.',
    },
  },

  // ----------------------------------------------------------------------
  // Geometry (3 of 23 standards)
  // ----------------------------------------------------------------------
  'NC.1.G.1': {
    standardCode: 'NC.1.G.1',
    title: 'Defining Attributes: What Makes a Shape That Shape',
    coreConcept:
      'A defining attribute is something a shape must have no matter its color, size, or how it is turned - like a triangle always having 3 straight sides. A non-defining attribute, like color or size, can change without changing what the shape is. Naming a shape sometimes takes more than one defining attribute at once: a 4-sided shape is not automatically a rectangle unless its corners are square too. This covers flat shapes - triangles, rectangles, squares, trapezoids, hexagons, circles - and solid shapes - cubes, rectangular prisms, cones, spheres, and cylinders.',
    rulesAndFormulas: [
      { label: 'Defining vs. non-defining', detail: 'A defining attribute belongs to every example of the shape; color, size, and orientation do not.' },
      { label: 'Sometimes more than one attribute is needed', detail: '4 straight sides alone is not enough to be a rectangle - it also needs 4 square corners.' },
      { label: 'Flat and solid shapes both have defining attributes', detail: 'A cube\'s 6 flat square faces are as defining as a triangle\'s 3 straight sides.' },
    ],
    stepByStepMethod: [
      'Step 1: Ask whether the attribute would still be true if the shape\'s color, size, or orientation changed.',
      'Step 2: If yes, it is defining. If it could change without changing what the shape is, it is not.',
      'Step 3: For a shape name that needs more than one attribute, check every one of them before deciding.',
    ],
    commonTraps: [
      'Treating a shape\'s color, size, or the way it is tilted as if it decided what shape it is.',
      'Assuming a 4-sided shape must be a rectangle without checking that its corners are square too.',
      // Fix 2c (whole-branch review, polish): "pentagon" is not in G.1's own
      // keyConcepts (triangles, rectangles, squares, trapezoids, hexagons,
      // circles), so the trap now names two shapes G.1 actually covers.
      'Mixing up two shape names that share a lot of attributes, such as square and rectangle.',
    ],
    workedExample: {
      problem: 'A shape has 4 straight sides. Must it be a rectangle?',
      steps: [
        '1. A rectangle needs more than one defining attribute.',
        '2. Having 4 straight sides is one of them, but not the only one.',
        '3. A rectangle also needs 4 square corners, which a 4-sided shape does not always have.',
      ],
      answer: 'No - it also needs 4 square corners',
      whyItMattersForSSA:
        'Geometry is 3 of the 23 Grade 1 standards, and checking every defining attribute a shape\'s name requires - not just one - is what keeps a four-sided shape with no square corners from being mistaken for a rectangle.',
    },
  },

  'NC.1.G.2': {
    standardCode: 'NC.1.G.2',
    title: 'Building New Shapes by Joining Old Ones',
    coreConcept:
      'Joining shapes together makes a new composite shape with its own identity - the new shape is not called by the name of just one of the pieces that built it. Composite shapes can be flat, built from rectangles, squares, trapezoids, triangles, and half-circles, or solid, built from cubes, rectangular prisms, cones, and cylinders. Naming the components of a composite shape means naming the separate pieces used to build it, which is a different question from naming the new shape itself.',
    rulesAndFormulas: [
      { label: 'A new shape, a new name', detail: 'Two half-circles joined along their straight edges make a whole circle - not "two half-circles."' },
      { label: 'Naming components is different from naming the whole', detail: 'The components of a shape made from a triangle and a square are "a triangle and a square," not the name of the outline they form.' },
      { label: 'Solid composites too', detail: 'A toy built from a cube and a cone stacked together is named by both of those solid shapes.' },
    ],
    stepByStepMethod: [
      'Step 1: Look at the shapes that were joined together.',
      'Step 2: If asked to name the new whole shape, describe what the combined figure looks like.',
      'Step 3: If asked to name the components, list every separate piece that was joined - not the new outline.',
    ],
    commonTraps: [
      'Keeping the name of just one piece for the whole new shape, like still calling two joined half-circles a half-circle.',
      'Naming the overall new shape when the question actually asked which pieces built it.',
      'Leaving out one of the pieces when naming the components of a composite shape.',
    ],
    workedExample: {
      problem: 'Two half-circles join along their straight edges. What shape do they make?',
      steps: [
        '1. Each half-circle is exactly half of a circle.',
        '2. Joining the two matching halves along their straight edges puts the whole circle back together.',
        '3. The new shape is a circle, not a half-circle.',
      ],
      answer: 'A circle',
      whyItMattersForSSA:
        'Geometry is 3 of the 23 Grade 1 standards, and recognizing that a composite shape earns its own new name is what keeps a joined shape from being described as still being one of its own pieces.',
    },
  },

  'NC.1.G.3': {
    standardCode: 'NC.1.G.3',
    title: 'Halves and Fourths: Equal Shares of a Whole',
    coreConcept:
      'A circle or rectangle split into 2 equal pieces has halves - the whole is described as two halves. Split into 4 equal pieces, each piece is a fourth, and the whole is four fourths. Both words require the pieces to be exactly the same size, not just the right number of pieces. Splitting the same whole into more equal shares always makes each individual share smaller, not bigger.',
    rulesAndFormulas: [
      { label: 'Halves', detail: '2 equal pieces; the whole is described as two halves.' },
      { label: 'Fourths', detail: '4 equal pieces; the whole is described as four fourths.' },
      { label: 'Equal size matters, not just count', detail: 'Two pieces that are different sizes are never halves, no matter how many pieces there are.' },
      { label: 'More shares means smaller shares', detail: 'Splitting the same whole into 4 equal pieces instead of 2 makes each piece smaller, not bigger.' },
    ],
    stepByStepMethod: [
      'Step 1: Count how many pieces the whole is split into.',
      'Step 2: Check that every piece is really the same size.',
      'Step 3: Match the count to its word - 2 equal pieces are halves, 4 equal pieces are fourths.',
    ],
    commonTraps: [
      'Calling two pieces halves just because there are two of them, without checking that they are the same size.',
      'Expecting a whole split into more pieces to have bigger pieces, when more equal pieces always means smaller ones.',
      'Mixing up how many pieces make a half versus how many make a fourth.',
    ],
    workedExample: {
      problem: 'Same-size cakes: Cake A is cut into 2 pieces, Cake B into 4. Which has bigger pieces?',
      steps: [
        '1. Both cakes start out the same size.',
        '2. Cake A is split into fewer equal pieces than Cake B.',
        '3. Splitting the same whole into more equal pieces makes each piece smaller, not bigger.',
      ],
      answer: 'Cake A',
      whyItMattersForSSA:
        'Geometry is 3 of the 23 Grade 1 standards, and knowing that more equal shares means smaller shares - not bigger ones - is the exact idea that keeps a child from expecting a fourth to be more than a half.',
    },
  },
};
