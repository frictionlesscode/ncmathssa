import type { StudyGuideSection } from '../../types';

/** One revision guide per Grade 3 standard, written to be read by a nine-year-old
 *  and a parent together at the kitchen table.
 *
 *  Four rules bind every entry:
 *
 *  1. The mathematics comes from this grade's `standards.ts` - the sourced NC
 *     text and its `keyConcepts` - never from what a code is assumed to mean.
 *     NC's Grade 3 differs from Common Core's in several places: NC.3.OA.8 is
 *     two-step problems with addition, subtraction and multiplication ONLY,
 *     NC.3.NF.4 compares fractions with the same numerator or the same
 *     denominator, NC.3.MD.1 keeps time intervals inside one hour, NC.3.MD.2
 *     is CUSTOMARY measurement, and NC has no rounding standard at any grade.
 *  2. Every percentage traces to `docs/sources/nc-eog-blueprint.json`:
 *     OA 32–36%, NF 28–32%, NBT 9–13%, and Measurement & Data together with
 *     Geometry as ONE 23–27% band. The MD and G guides cite the pair and name
 *     both domains in the same sentence; a figure attached to either domain
 *     alone would be one NCDPI never published.
 *  3. Every figure inside a `commonTraps` line is true of the worked example in
 *     that same guide - a parent checks a trap against the example three inches
 *     above it, and a number borrowed from a different problem fails in ten
 *     seconds.
 *  4. `commonTraps` echo the wording of the Grade 3 authored banks'
 *     `commonMisconception` lines, so a child who missed an item meets their
 *     own mistake again here in the same words.
 */
export const GRADE_3_STUDY_GUIDES: Record<string, StudyGuideSection> = {
  // ----------------------------------------------------------------------
  // Operations & Algebraic Thinking (32–36%)
  // ----------------------------------------------------------------------
  'NC.3.OA.1': {
    standardCode: 'NC.3.OA.1',
    title: 'Multiplication Means Equal Groups',
    coreConcept:
      'Multiplication is a fast way to count equal groups. In 8 × 6, the two numbers do two different jobs: one says how many groups there are, and the other says how many things are in each group. The groups must all be the same size - that is what makes it multiplication instead of plain adding.',
    rulesAndFormulas: [
      { label: 'Groups × size of each group', detail: '8 trays with 6 muffins on each tray is 8 × 6. The FIRST number always counts the groups and the SECOND always says how many are in one group. Keep that order every time and the two jobs never get swapped.' },
      { label: 'Repeated addition', detail: '8 × 6 is the same as 6 + 6 + 6 + 6 + 6 + 6 + 6 + 6. Multiplication just saves you writing it out.' },
      { label: 'Arrays', detail: 'Rows of dots show it best: 8 rows with 6 dots in each row is 8 × 6 dots altogether.' },
      { label: 'Order does not change the answer', detail: '8 × 6 and 6 × 8 both give 48. That is the commutative property, and it means you may turn a hard fact round into an easier one.' },
      { label: 'Breaking a factor apart', detail: '8 × 6 is hard? Split the 8: 5 × 6 = 30 and 3 × 6 = 18, and 30 + 18 = 48.' },
    ],
    stepByStepMethod: [
      'Step 1: Find the number of equal groups - trays, bags, rows, plates.',
      'Step 2: Find how many things are in ONE group.',
      'Step 3: Write it as groups × size, and check the groups really are all the same size.',
      'Step 4: Skip count by the size of a group, making exactly one jump for each group. Keep the jumps on your fingers.',
      'Step 5: Say the answer with the thing being counted: "48 muffins", not just "48".',
    ],
    commonTraps: [
      'Stopping the skip count early. Saying 6, 12, 18, 24, 30 is only 5 of the 8 trays, and adding the leftover 3 to get 33 counts three single muffins instead of three more groups of 6.',
      'Writing 6 × 6 = 36. That uses the repeated number twice and never counts how many times it repeats - the 8 is the number that says how many times.',
      'Answering 8, or answering 6. Both numbers were printed in the question; the answer is the total you have to work out from them.',
      'Adding instead of multiplying: 8 + 6 = 14 joins one tray to one number of muffins, not eight trays of six.',
    ],
    workedExample: {
      problem: 'A baker fills 8 trays. Each tray holds 6 muffins. How many muffins are there altogether?',
      steps: [
        '1. The equal groups are the trays: there are 8 of them.',
        '2. Each group holds 6 muffins.',
        '3. That is 8 groups of 6, written 8 × 6.',
        '4. Skip count by 6, one jump per tray: 6, 12, 18, 24, 30, 36, 42, 48. That is 8 jumps.',
        '5. Eight trays of six muffins is 48 muffins.',
      ],
      answer: '48 muffins',
      whyItMattersForSSA:
        'Operations and Algebraic Thinking is the biggest reporting category on the Grade 3 EOG at 32–36%, and equal groups is the idea the whole band is built on - division, unknown factors and two-step problems all read groups and group size off the story first.',
    },
  },

  'NC.3.OA.2': {
    standardCode: 'NC.3.OA.2',
    title: 'Division Means Sharing into Equal Groups',
    coreConcept:
      'Division splits a total into equal groups. The total always goes first. The other number tells you one of two things - either how many groups to make, or how many to put in each group - and the answer tells you the one you were not told. In Grade 3 the divisor and the answer are both single digits, 10 or less.',
    rulesAndFormulas: [
      { label: 'Total ÷ number of groups = size of each group', detail: '42 stickers shared fairly between 6 friends is 42 ÷ 6 = 7 stickers each. As a multiplication that is 6 × 7 = 42: 6 groups of 7.' },
      { label: 'Total ÷ size of each group = number of groups', detail: '42 stickers packed 6 to a bag is 42 ÷ 6 = 7 bags. As a multiplication that is 7 × 6 = 42: 7 groups of 6.' },
      { label: 'Division undoes multiplication', detail: 'Because 6 × 7 = 42, you already know 42 ÷ 6 = 7 and 42 ÷ 7 = 6.' },
      { label: 'Repeated subtraction', detail: 'Take 6 away from 42 again and again: 36, 30, 24, 18, 12, 6, 0. You did it 7 times, so the answer is 7.' },
      { label: 'Fair shares', detail: 'Sharing only counts as division when every group ends up with exactly the same amount.' },
    ],
    stepByStepMethod: [
      'Step 1: Find the total - the whole amount that is being split up. It goes first in the division.',
      'Step 2: Read what the other number tells you: the number of GROUPS, or the number in EACH group.',
      'Step 3: Turn it into a multiplication with a missing number, keeping groups first and group size second. "6 friends" means 6 groups, so 6 × ? = 42. "6 in each bag" means groups OF 6, so ? × 6 = 42.',
      'Step 4: Use a fact you know, or skip count, to fill the missing number.',
      'Step 5: Check by multiplying back, then say what your answer counts - friends, stickers, bags.',
    ],
    commonTraps: [
      'Subtracting instead of dividing. Taking 6 away from 42 once gives 36, which hands one friend their stickers and leaves the other five friends out of the story.',
      'Swapping the two jobs - calling the 6 the number of stickers each friend gets. The 6 counts the friends here, and 6 is not the answer.',
      'Answering 42. That is everyone\'s stickers together, not one person\'s share.',
      'Sharing unevenly and calling it done. If one friend ends up with 8 and another with 6, it is not division.',
    ],
    workedExample: {
      problem: 'Amir has 42 stickers. He shares them equally between 6 friends. How many stickers does each friend get?',
      steps: [
        '1. The total is 42 stickers.',
        '2. The 6 tells us how many GROUPS - one group for each friend.',
        '3. Groups first: 6 groups of something make 42, so 6 × ? = 42, which is 42 ÷ 6.',
        '4. Count by 6s: 6, 12, 18, 24, 30, 36, 42 - that is 7 jumps.',
        '5. Check: 6 × 7 = 42 - six friends with seven each - and every friend got the same amount.',
      ],
      answer: '7 stickers each',
      whyItMattersForSSA:
        'Division questions are all through the 32–36% Operations and Algebraic Thinking band on the Grade 3 EOG, and knowing which number counts the groups is what separates a right answer from one of the two numbers the question already gave you.',
    },
  },

  'NC.3.OA.3': {
    standardCode: 'NC.3.OA.3',
    title: 'One-Step Word Problems: Multiply or Divide?',
    coreConcept:
      'A one-step word problem hides one multiplication or one division inside a story. Your job is to find the equal groups, work out which number is missing - the total, the number of groups, or the size of a group - and then choose the operation that finds it.',
    rulesAndFormulas: [
      { label: 'Total missing → multiply', detail: '7 tanks with 9 fish in each: the total is missing, so 7 × 9 = 63.' },
      { label: 'Number of groups missing → divide', detail: '56 rolls packed 8 to a bag: 56 ÷ 8 = 7 bags. Groups first, so the equation is b × 8 = 56.' },
      { label: 'Size of group missing → divide', detail: '56 rolls shared into 8 bags: 56 ÷ 8 = 7 rolls in each bag. Groups first, so the equation is 8 × r = 56.' },
      { label: 'Use a symbol for the unknown', detail: 'Write 7 × 9 = f, or b × 8 = 56. The letter or box stands for the number you are looking for, and the groups still come first.' },
      { label: 'Draw it', detail: 'An array, a picture of the groups, or a bar split into equal parts turns the words into something you can count.' },
    ],
    stepByStepMethod: [
      'Step 1: Read the whole problem once for the story, without touching the numbers.',
      'Step 2: Read it again and find the equal groups: what is being repeated, and how many are in one of them?',
      'Step 3: Decide which number the question is asking for: the total, the number of groups, or how many in each group.',
      'Step 4: Write an equation with a symbol for the missing number. Total missing means multiply; anything else means divide.',
      'Step 5: Work it out with a known fact or by skip counting.',
      'Step 6: Answer in the words of the question, with the unit attached.',
    ],
    commonTraps: [
      'Adding the two numbers: 7 + 9 = 16 counts the seven tanks once and one tank of fish once, instead of all seven tanks of nine.',
      'Answering 7, which just repeats the number of tanks the question already gave you.',
      'Answering 9, which is the number of fish in ONE tank - true, but it is not what was asked.',
      'Grabbing the numbers before reading the story. "How many in each" and "how many groups" both divide, but they are answers to different questions.',
    ],
    workedExample: {
      problem: 'A pet shop has 7 fish tanks. Each tank holds 9 fish. How many fish are in the shop?',
      steps: [
        '1. The story: a shop with several tanks of fish.',
        '2. The equal groups are the tanks: 7 groups, with 9 fish in each.',
        '3. The question asks for the TOTAL, and the total is missing.',
        '4. Total missing means multiply: 7 × 9 = f.',
        '5. 7 × 9 = 63.',
        '6. There are 63 fish in the shop.',
      ],
      answer: '63 fish',
      whyItMattersForSSA:
        'Most of the 32–36% Operations and Algebraic Thinking band on the Grade 3 EOG is word problems rather than bare facts, so reading a story and choosing the operation is worth more marks than any single times table.',
    },
  },

  'NC.3.OA.6': {
    standardCode: 'NC.3.OA.6',
    title: 'Finding the Missing Factor',
    coreConcept:
      'Sometimes the equation shows you the answer and hides one of the factors: 6 × ? = 42. The box is asking "how many groups of 6 make 42?" You can find it by dividing, or by skip counting up to the total and counting your jumps. Multiplication and division are two ways of looking at the very same fact.',
    rulesAndFormulas: [
      { label: 'Missing factor → divide', detail: 'In 6 × ? = 42, divide the total by the factor you can see: 42 ÷ 6 = 7. Read it groups first: 6 groups of 7 make 42.' },
      { label: 'Rewrite a division as a multiplication', detail: '56 ÷ ? = 8 means ? × 8 = 56, so divide the total by 8: 56 ÷ 8 = 7.' },
      { label: 'Skip counting counts the jumps', detail: 'Count 6, 12, 18, 24, 30, 36, 42. You said seven numbers, so the missing factor is 7. (Counting by 6 finds it because 6 sevens and 7 sixes both make 42 - that is the commutative property at work.)' },
      { label: 'Fact families', detail: '6 × 7 = 42, 7 × 6 = 42, 42 ÷ 6 = 7 and 42 ÷ 7 = 6 are all the same fact wearing different clothes.' },
      { label: 'Always check by multiplying', detail: 'Put your answer in the box and multiply. If you do not get the total back, it is not the missing factor.' },
    ],
    stepByStepMethod: [
      'Step 1: Find the box and say the equation out loud, groups first: 6 × ? = 42 is "6 groups of how many make 42?"',
      'Step 2: If the box is inside a division, rewrite it as a multiplication first - 56 ÷ ? = 8 becomes ? × 8 = 56.',
      'Step 3: Divide the total by the factor you can see.',
      'Step 4: If you do not know that fact yet, skip count by the visible factor until you reach the total, counting the jumps as you go.',
      'Step 5: Put your answer in the box and multiply to check you get the total back.',
    ],
    commonTraps: [
      'Dividing by the wrong number. 42 ÷ 7 = 6 is a true fact, but it gives back the 6 that was already printed in the equation rather than the number hidden in the box.',
      'Subtracting: 42 − 6 = 36, which is not a number of groups at all.',
      'Stopping the skip count one jump short. 6, 12, 18, 24, 30, 36 is six jumps and only reaches 36, so answering 6 leaves you 6 short of 42.',
      'Answering 42 or 6 - the two numbers the equation already showed you.',
    ],
    workedExample: {
      problem: 'Find the missing number: 6 × ? = 42.',
      steps: [
        '1. Read it groups first: 6 groups of how many make 42?',
        '2. The box is a missing factor, so divide the total by the factor I can see: 42 ÷ 6.',
        '3. Skip count by 6 and count the jumps: 6, 12, 18, 24, 30, 36, 42 - seven jumps.',
        '4. So the box is 7.',
        '5. Check: 6 × 7 = 42 - six groups of seven. It matches the total, so 7 is right.',
      ],
      answer: '7',
      whyItMattersForSSA:
        'Unknown-factor equations show up right across the 32–36% Operations and Algebraic Thinking band on the Grade 3 EOG, and the same move - swapping a multiplication for a division - is how every division fact you will ever meet gets checked.',
    },
  },

  'NC.3.OA.7': {
    standardCode: 'NC.3.OA.7',
    title: 'Knowing Your Facts to 10 × 10',
    coreConcept:
      'Fluency means you can find any product or quotient with factors up to 10 quickly and correctly - most of them straight from memory, the rest from a fact you do know. Fluency is not speed for its own sake: it frees your head to think about the hard part of a word problem instead of the times table.',
    rulesAndFormulas: [
      { label: 'Know the products to 10 × 10', detail: 'Every product from 1 × 1 to 10 × 10, and the divisions that go with them.' },
      { label: 'The whole fact family', detail: '9 × 4 = 36, 4 × 9 = 36, 36 ÷ 4 = 9, 36 ÷ 9 = 4. Learning one fact gives you four.' },
      { label: 'Turn it round', detail: 'If 9 × 4 feels hard, do 4 × 9 instead. The answer is the same.' },
      { label: 'Lean on a fact you know', detail: 'Stuck on 9 × 4? Do 10 × 4 = 40 and take one 4 away: 40 − 4 = 36.' },
      { label: 'A missing total in a division', detail: 'In ? ÷ 4 = 9, the total is missing, so multiply what you can see: 9 × 4 = 36.' },
    ],
    stepByStepMethod: [
      'Step 1: Look at the equation and name which number is missing: the total, or one of the other two.',
      'Step 2: If the TOTAL of a multiplication is missing (7 × 8 = ?), multiply.',
      'Step 3: If a FACTOR is missing (? × 6 = 54), divide the total by the factor you can see.',
      'Step 4: If the total of a DIVISION is missing (? ÷ 4 = 9), multiply the two numbers you can see.',
      'Step 5: Say the whole fact family out loud to check your answer fits every version of it.',
    ],
    commonTraps: [
      'Adding 9 and 4 to get 13. That treats the equation as if any operation would do - check it and 13 ÷ 4 is not 9.',
      'Subtracting to get 5, for the same reason: 5 ÷ 4 is not 9 either.',
      'Stopping the skip count one jump early: 4, 8, 12, 16, 20, 24, 28, 32 is only eight fours and lands on 32, one four short of 36.',
      'Counting the number you start on as a jump. Saying 4 is already one four, not zero fours, so counting it as a jump makes the answer come out one too big - 10 fours instead of 9.',
    ],
    workedExample: {
      problem: 'Find the unknown number: ? ÷ 4 = 9.',
      steps: [
        '1. The missing number is the TOTAL - it is the number being divided up.',
        '2. A missing total in a division means multiplying the two numbers I can see: 9 × 4.',
        '3. 9 × 4: I know 10 × 4 = 40, so take one 4 away - 40 − 4 = 36.',
        '4. So the unknown number is 36.',
        '5. Check the fact family: 9 × 4 = 36, 4 × 9 = 36, 36 ÷ 4 = 9. It fits.',
      ],
      answer: '36',
      whyItMattersForSSA:
        'Fluency sits inside the 32–36% Operations and Algebraic Thinking band on the Grade 3 EOG, and it quietly decides the rest of the paper too - area, perimeter and fraction questions all stall if a times table has to be rebuilt from scratch each time.',
    },
  },

  'NC.3.OA.8': {
    standardCode: 'NC.3.OA.8',
    title: 'Two-Step Word Problems',
    coreConcept:
      'A two-step problem asks a question you cannot answer straight away, because something in the middle has to be worked out first. In Grade 3 the two steps use adding, subtracting and multiplying. Find the hidden middle question, answer it, write that number down, and only then take the second step.',
    rulesAndFormulas: [
      { label: 'The hidden middle question', detail: 'Ask: what do I need to know BEFORE I can answer what was asked? That is step one.' },
      { label: 'Label the middle number', detail: 'Write "markers in the packs = 32" rather than a bare 32. A labelled number is much harder to use in the wrong place.' },
      { label: 'One equation, two steps', detail: '(4 × 8) + 5 = m. The brackets show which part happens first.' },
      { label: 'Equal groups first, then the extra', detail: 'Anything already owned, or given away, is added or subtracted AFTER the groups are counted - not built into each group.' },
      { label: 'Estimate as a safety net', detail: '4 packs of 8 is about 30, plus a few, so the answer should be in the thirties. A number in the fifties means something went wrong.' },
    ],
    stepByStepMethod: [
      'Step 1: Read the problem and say out loud what it finally asks for.',
      'Step 2: Find the hidden middle question - the thing you must know before you can answer that.',
      'Step 3: Do that first step and WRITE THE ANSWER DOWN with a label.',
      'Step 4: Use that labelled number in the second step, together with whatever is left over from the story.',
      'Step 5: Write one equation with a symbol for the unknown, using brackets to show which step came first.',
      'Step 6: Check the size of your answer against the story - should it be bigger or smaller than the middle number?',
    ],
    commonTraps: [
      'Adding the 5 before multiplying gives 52, because it turns the 5 markers already at home into 5 extra markers in every pack: (8 + 5) × 4 = 52.',
      'Stopping after the first step and answering 32. The middle number is a stepping stone, not the answer - the 5 markers at home still count.',
      'Adding all three numbers, 5 + 4 + 8 = 17. That is one step done three times, not two different steps.',
      'Doing the two steps the wrong way round. In a two-step problem the order matters, and swapping it changes the answer.',
    ],
    workedExample: {
      problem: 'Maya already has 5 markers at home. She buys 4 packs of markers with 8 markers in each pack. How many markers does she have now?',
      steps: [
        '1. The question finally asks: how many markers in all?',
        '2. Hidden middle question: how many markers are in the 4 packs?',
        '3. First step: 4 × 8 = 32. Markers in the packs = 32.',
        '4. Second step: add the 5 she already had. 32 + 5 = 37.',
        '5. As one equation: (4 × 8) + 5 = m.',
        '6. Check: 37 is a little more than 32, which is exactly what adding 5 should do.',
      ],
      answer: '37 markers',
      whyItMattersForSSA:
        'Two-step problems are the hardest questions in the 32–36% Operations and Algebraic Thinking band on the Grade 3 EOG, because a child can do both calculations perfectly and still lose the mark by answering the middle question instead of the real one.',
    },
  },

  'NC.3.OA.9': {
    standardCode: 'NC.3.OA.9',
    title: 'Patterns on the Hundreds Board and the Times Table',
    coreConcept:
      'The multiplication table and the hundreds board are full of patterns, and every one of them has a reason. Spotting the pattern is the easy half; the standard asks you to EXPLAIN it, using equal groups. Once you can say why, you can also say when the pattern stops working.',
    rulesAndFormulas: [
      { label: 'Each step adds one more group', detail: 'Going along the row for 4, every number is 4 more than the one before, because you have added one more group of 4.' },
      { label: 'Even rows stay even', detail: 'Every multiple of an even number is even, because you keep adding an even amount to an even amount.' },
      { label: 'Counting by 5 on a hundreds board', detail: 'The shaded squares make two straight columns, ending in 5 and 0, because two steps of 5 make exactly one full row of ten.' },
      { label: 'The table is symmetrical', detail: 'The row for 4 and the column for 4 hold the same numbers, because 4 × 7 and 7 × 4 are equal.' },
      { label: 'Test the other way round', detail: 'A pattern that runs one way often does not run back. Always try a number that should NOT be in the row.' },
    ],
    stepByStepMethod: [
      'Step 1: Write out the row, or the shaded numbers, in order.',
      'Step 2: Work out how much each one goes up by. That step size is the number the row belongs to.',
      'Step 3: Describe what you notice in words - all even, ones digits repeating, two straight columns.',
      'Step 4: Explain WHY using equal groups: the next number is one more group of that size.',
      'Step 5: Test your rule on a number that is not in the row, to see whether the pattern also works backwards.',
    ],
    commonTraps: [
      'Turning the statement round. "Every number in the row for 4 is even" is true, but "every even number is in the row for 4" is false - 6 is even and never appears in that row.',
      'Writing 44 as the last number in the row. The table stops at 10 × 4 = 40; counting 44 means counting eleven fours, which happens when the first number in the row is counted as a jump instead of as the first stop.',
      'Spotting without interpreting. "They all end in 4, 8, 2, 6, 0" is a real pattern, but the standard asks why - because each step adds 4 more, and after ten steps the ones digits start over.',
      'Trusting a pattern after one example. Two numbers in a row can agree by accident; check at least three, and check one that should fail.',
    ],
    workedExample: {
      problem: 'The row for 4 in the multiplication table reads 4, 8, 12, 16, 20, 24, 28, 32, 36, 40. Every number in it is even. Explain why - and say whether every even number appears in this row.',
      steps: [
        '1. The first number, 4, is even: it is 2 groups of 2.',
        '2. Each next number adds another 4, and 4 is even.',
        '3. Adding an even amount to an even amount always leaves you with an even number, so every number in the row must be even.',
        '4. Now try it backwards: is every even number here? 6 is even, but the row jumps from 4 straight to 8, so 6 is missing.',
        '5. So the pattern runs one way only: all multiples of 4 are even, but not all even numbers are multiples of 4.',
      ],
      answer: 'Every number in the row is even, because each step adds another even group of 4 - but the reverse is false, since 6 is even and is not in the row.',
      whyItMattersForSSA:
        'Pattern questions inside the 32–36% Operations and Algebraic Thinking band on the Grade 3 EOG almost always ask for the reason, not the pattern, so a child who can only point at it will lose a mark they very nearly had.',
    },
  },

  // ----------------------------------------------------------------------
  // Number & Operations - Fractions (28–32%)
  // ----------------------------------------------------------------------
  'NC.3.NF.1': {
    standardCode: 'NC.3.NF.1',
    title: 'Unit Fractions: One Equal Piece',
    coreConcept:
      'A unit fraction is ONE piece of a whole that has been split into equal parts. The bottom number says how many equal parts the whole was cut into, and it tells you how BIG each piece is. In Grade 3 that bottom number is 2, 3, 4, 6 or 8. The parts must be equal - four pieces of different sizes are not fourths.',
    rulesAndFormulas: [
      { label: 'The bottom number names the size', detail: 'Cut into 8 equal parts and one piece is 1/8, said "one eighth".' },
      { label: 'The top number is 1', detail: 'A unit fraction is always 1 over something - 1/2, 1/3, 1/4, 1/6, 1/8.' },
      { label: 'More parts means smaller parts', detail: 'From the same pizza, 1/8 is a smaller slice than 1/4, because it was cut into more pieces.' },
      { label: 'Equal parts only', detail: 'If the pieces are different sizes, the shape has no fraction name at all.' },
      { label: 'Area model and length model', detail: 'A fraction can be part of a shape (one slice of a pizza) or part of a length (one piece of a ribbon). Both work the same way.' },
    ],
    stepByStepMethod: [
      'Step 1: Find the whole - the one thing that is being cut up.',
      'Step 2: Check that all the parts are the same size. If they are not, stop: this has no fraction name.',
      'Step 3: Count the equal parts. That count goes on the BOTTOM.',
      'Step 4: One single part is written with a 1 on top: 1 over the count.',
      'Step 5: To compare two unit fractions of the same whole, remember that more parts means each part is smaller.',
    ],
    commonTraps: [
      'Calling unequal pieces eighths. Eight pieces of different sizes are still eight pieces, but they are not eighths - nothing is an eighth until every piece is the same size.',
      'Writing 8/1 instead of 1/8. That puts the size of the pieces on top and the count underneath, which names eight whole pizzas instead of one small piece of one.',
      'Reading the 8 as "more". That is the natural move with whole numbers and the wrong one here: more pieces cut from the same pizza means each piece is smaller, so 1/8 is less than 1/4.',
      'Forgetting to ask which whole. One slice of a giant pizza and one slice of a tiny one are both 1/8, but they are not the same amount of pizza.',
    ],
    workedExample: {
      problem: 'A pizza is cut into 8 equal slices. Write one slice as a fraction. Then say whether one slice of this pizza is bigger or smaller than one slice of the same size pizza cut into 4.',
      steps: [
        '1. The whole is one pizza.',
        '2. All 8 slices are the same size, so the pizza really is in eighths.',
        '3. There are 8 equal parts, so 8 goes on the bottom.',
        '4. One slice is 1 of those parts: 1/8.',
        '5. Cutting the same pizza into only 4 pieces makes each piece bigger, so 1/8 is smaller than 1/4.',
      ],
      answer: '1/8, and it is smaller than 1/4',
      whyItMattersForSSA:
        'Fractions are 28–32% of the Grade 3 EOG, and unit fractions are the first brick in that wall - every other fraction on the paper is just a count of unit fractions, so a shaky 1/8 makes 5/8 shaky too.',
    },
  },

  'NC.3.NF.2': {
    standardCode: 'NC.3.NF.2',
    title: 'Reading Fractions from Pictures and Number Lines',
    coreConcept:
      'Once you know what one part is worth, a fraction is just a count of those parts. In 4/6, the 6 says the whole was split into sixths and the 4 says you have four of them. On a number line, the 4 means four jumps of one sixth, starting at 0.',
    rulesAndFormulas: [
      { label: 'Top = how many, bottom = what size', detail: '4/6 is four one-sixths. The bottom names the piece; the top counts them.' },
      { label: 'Part compared to the WHOLE', detail: 'A fraction always compares the part to the whole thing, never to the leftover part.' },
      { label: 'On a number line, count SPACES', detail: 'Split the line from 0 to 1 into equal spaces. There is always one more tick mark than there are spaces, because 0 gets a mark of its own.' },
      { label: 'Jumps from 0', detail: 'To show 4/6, start at 0 and take 4 jumps of one sixth each.' },
      { label: 'Check against a half and a whole', detail: 'Half of 6 is 3, so 3/6 is a half. 4/6 is a bit more than half, and less than a whole.' },
    ],
    stepByStepMethod: [
      'Step 1: Decide whether the model is an AREA (a shape cut up) or a LENGTH (a number line or strip).',
      'Step 2: Count the equal parts in ONE whole - the spaces on a number line, not the tick marks. Write that number on the bottom.',
      'Step 3: Count how many of those parts are shaded, or how many jumps you take from 0. Write that on top.',
      'Step 4: Say the fraction as a count of unit fractions: "four one-sixths".',
      'Step 5: Check it against 1/2 and 1 to make sure the size is sensible.',
    ],
    commonTraps: [
      'Writing 4/2, which compares the pieces eaten to the pieces left over. A fraction always compares a part to the WHOLE, which here is all 6 pieces.',
      'Counting tick marks instead of spaces on the number line. The line from 0 to 1 in sixths has 7 marks and only 6 spaces, so counting marks makes every fraction come out one part too big.',
      'Reading 4/6 as "four and six". A fraction is ONE number, not two, and reading it as two loses the only thing the symbol is for: saying how many parts of what size.',
      'Putting the bigger number on top out of habit. 6/4 is more than one whole pizza, and Mia only ate part of one.',
    ],
    workedExample: {
      problem: 'Mia\'s pizza was cut into 6 equal slices and she ate 4 of them. Write the fraction she ate, then show it on a number line from 0 to 1.',
      steps: [
        '1. The pizza is an area model, cut into 6 equal slices, so the pieces are sixths and 6 goes on the bottom.',
        '2. She ate 4 of those sixths, so 4 goes on top: 4/6.',
        '3. On a number line from 0 to 1, make 6 equal SPACES - that needs 7 tick marks, counting the one at 0.',
        '4. Start at 0 and take 4 jumps of one sixth.',
        '5. You land past the halfway mark (3/6 is a half) and before 1, which is exactly where 4/6 should be.',
      ],
      answer: '4/6',
      whyItMattersForSSA:
        'Number-line fraction questions are some of the most-missed items in the 28–32% fractions band on the Grade 3 EOG, and nearly all of the misses come from counting marks instead of spaces.',
    },
  },

  'NC.3.NF.3': {
    standardCode: 'NC.3.NF.3',
    title: 'Equivalent Fractions: Same Amount, Different Pieces',
    coreConcept:
      'Two fractions can name exactly the same amount even though one whole was cut into more pieces. Cutting each piece into smaller pieces gives you MORE parts, each SMALLER, so the shaded amount never changes. Grade 3 uses related families: halves, fourths and eighths, and thirds and sixths.',
    rulesAndFormulas: [
      { label: 'Multiply both numbers by the same factor', detail: 'Each fourth cut into 2 gives eighths, so 3/4 = (3 × 2)/(4 × 2) = 6/8.' },
      { label: 'The related families', detail: 'Halves, fourths and eighths belong together; thirds and sixths belong together. Those are the ones Grade 3 re-cuts.' },
      { label: 'Same top and bottom is one whole', detail: '8/8 is one whole strip, and 4/4, 6/6 and 3/3 are all 1 as well.' },
      { label: 'Whole numbers as fractions', detail: '3 whole strips in fourths is 3 × 4 = 12 fourths, written 12/4.' },
      { label: 'Adding is not allowed', detail: 'Adding the same number to the top and the bottom changes the amount. Only multiplying both by the same factor keeps it.' },
    ],
    stepByStepMethod: [
      'Step 1: Check the two models really are the same whole - the same size strip, or the same size shape.',
      'Step 2: Work out how many new parts each old part was cut into: divide the new bottom number by the old one.',
      'Step 3: Multiply the top number by that same factor, because each shaded part became that many shaded parts.',
      'Step 4: Write the new fraction and say both out loud - they name the same amount.',
      'Step 5: For a whole number, use the same idea: n wholes in bths is n × b parts, so 3 in fourths is 12/4. And if the top and the bottom match, the fraction is exactly 1.',
    ],
    commonTraps: [
      'Adding 4 to both numbers to get 7/8. It looks fair but it is not: the parts got smaller, so the count has to grow by the same factor - doubling - not by the same amount.',
      'Answering 1/8. That names one single piece rather than counting how many are shaded; the top number is a count, and here the count is 6.',
      'Keeping the old top number and writing 3/8. Drawing extra pencil lines cannot un-shade anything, and 3/8 is less than half while 3/4 is nearly a whole.',
      'Writing 3 whole strips as 3/4. Three wholes in fourths is 3 × 4 = 12 fourths, or 12/4; 3/4 is not even one whole strip.',
    ],
    workedExample: {
      problem: 'Strip A is cut into 4 equal parts and 3 of them are shaded. Strip B is exactly the same length, cut into 8 equal parts. How many parts of Strip B must be shaded to show the same amount?',
      steps: [
        '1. Both strips are the same length, so they are the same whole and can be compared.',
        '2. 8 ÷ 4 = 2, so each fourth was cut into 2 eighths.',
        '3. Each of the 3 shaded fourths becomes 2 shaded eighths: 3 × 2 = 6.',
        '4. So 6 parts of Strip B are shaded, and 3/4 = 6/8.',
        '5. Check the size: 6/8 is more than half (4/8 is half) and less than a whole, just like 3/4.',
      ],
      answer: '6 parts shaded, because 3/4 = 6/8',
      whyItMattersForSSA:
        'Equivalence is the tool the rest of the 28–32% fractions band on the Grade 3 EOG leans on, and it is the piece Grade 4 picks up first - comparing and adding fractions both start by re-cutting one of them.',
    },
  },

  'NC.3.NF.4': {
    standardCode: 'NC.3.NF.4',
    title: 'Comparing Fractions with a Matching Top or Bottom',
    coreConcept:
      'In Grade 3 you compare two fractions when something about them matches: either the same top number (the same NUMBER of pieces) or the same bottom number (the same SIZE of pieces). Look for the match first. And a comparison only means anything if both fractions come from the same size whole.',
    rulesAndFormulas: [
      { label: 'Same bottom: more pieces wins', detail: 'The pieces are the same size, so 5/6 > 2/6.' },
      { label: 'Same top: the SMALLER bottom wins', detail: 'The same number of pieces, but bigger ones: 3/4 > 3/8.' },
      { label: 'The bottom number is a size, not a count', detail: 'A bigger bottom number means the whole was cut into more pieces, so each piece is smaller.' },
      { label: 'Same whole', detail: 'Comparisons are valid only when the two fractions refer to the same whole. Half of a small bar is not more than a quarter of a giant one.' },
      { label: 'Point the symbol at the smaller one', detail: 'The wide end of > or < faces the bigger fraction: 3/4 > 3/8 and 3/8 < 3/4 say exactly the same thing.' },
    ],
    stepByStepMethod: [
      'Step 1: Check both fractions are parts of the same size whole. If they are not, no symbol is correct.',
      'Step 2: Look for the match: is it the top numbers that are the same, or the bottom numbers?',
      'Step 3: If the BOTTOMS match, the pieces are the same size, so the fraction with more pieces is bigger.',
      'Step 4: If the TOPS match, the number of pieces is the same, so the fraction with the SMALLER bottom number is bigger, because its pieces are bigger.',
      'Step 5: If BOTH numbers match, the two fractions are the same fraction, so the answer is =.',
      'Step 6: Otherwise write > or < so that it opens toward the bigger fraction, then read the whole thing out loud to check it.',
    ],
    commonTraps: [
      'Reading 3/8 as bigger because 8 is bigger than 4. With whole numbers 8 really is more than 4, and that habit is what makes 3/8 look bigger than 3/4. The bottom number is not a count; it is a size.',
      'Comparing across different wholes. Two fractions that look identical can still name different amounts, so before comparing, ask what each one is a fraction of.',
      'Working out correctly that eighths are smaller pieces and then answering 3/8 anyway - the last step is saying which fraction is bigger, not which number is bigger.',
      'Pointing the symbol the wrong way. Writing 3/4 < 3/8 says the opposite of what you worked out.',
    ],
    workedExample: {
      problem: 'Compare 3/4 and 3/8 using >, < or =. Both are fractions of the same size chocolate bar.',
      steps: [
        '1. Both fractions are parts of the same size bar, so the comparison is allowed.',
        '2. The top numbers match: 3 pieces each.',
        '3. The bottoms are 4 and 8. A bar cut into 8 has smaller pieces than the same bar cut into 4.',
        '4. Three big pieces beat three small pieces, so 3/4 is bigger.',
        '5. Picture check: 3/4 is nearly the whole bar, while 3/8 is less than half (4/8 is half).',
      ],
      answer: '3/4 > 3/8',
      whyItMattersForSSA:
        'Comparison items appear all through the 28–32% fractions band on the Grade 3 EOG, and the "bigger bottom number means smaller pieces" idea is the single most common place a child loses a fraction mark.',
    },
  },

  // ----------------------------------------------------------------------
  // Measurement & Data - weighted with Geometry as one 23–27% band
  // ----------------------------------------------------------------------
  'NC.3.MD.1': {
    standardCode: 'NC.3.MD.1',
    title: 'Telling Time and Working Out How Long',
    coreConcept:
      'The short hand tells you the hour and the long hand tells you the minutes - but the numbers round the clock count in FIVES for the long hand. Once you can read two times, you can work out how long something lasted. In Grade 3 both times are inside the same hour, so the hour never changes and only the minutes do any work.',
    rulesAndFormulas: [
      { label: 'The long hand counts fives', detail: 'The long hand on the 10 means 50 minutes, not 10. Count 5, 10, 15... round the clock, then single minutes past the number.' },
      { label: 'How long = end minutes − start minutes', detail: 'From 2:15 to 2:50 is 50 − 15 = 35 minutes.' },
      { label: 'End time = start + how long', detail: 'Starting at 2:15 for 35 minutes ends at 2:50.' },
      { label: 'Start time = end − how long', detail: 'Ending at 2:50 after 35 minutes means starting at 2:15.' },
      { label: 'The hour stays put', detail: 'Both times are in the same hour, so it is the same in the answer and plays no part in the subtraction.' },
    ],
    stepByStepMethod: [
      'Step 1: Write down what you know, keeping the hour and the minutes apart.',
      'Step 2: Decide which of the three things is missing: how LONG it lasted, the END time, or the START time.',
      'Step 3: Because both times are inside the same hour, ignore the hour and work only with the minutes.',
      'Step 4: If the LENGTH is missing, subtract the start minutes from the end minutes.',
      'Step 5: If the END time is missing, add the length to the start minutes and keep the same hour.',
      'Step 6: If the START time is missing, subtract the length from the end minutes and keep the same hour.',
      'Step 7: Check by counting on from the earlier time in fives and ones, and see that you land on the later one.',
    ],
    commonTraps: [
      'Reading the number the long hand points at as the minutes. At 2:50 the long hand is on the 10, and on a clock the 10 means 50 minutes.',
      'Writing the answer as "2:35". Thirty-five is how LONG the club lasted, not a time of day - the club was already over by 2:50.',
      'Counting the numbers on the clock face instead of the minutes. The long hand travels from the 3 round to the 10, which is 7 steps, so the answer looks like 7 minutes - but each step is worth five minutes, and seven fives are 35.',
      'Comparing two starting times when the question asks which activity lasted longer. Starting later does not mean lasting longer, because when each one ended matters too.',
    ],
    workedExample: {
      problem: 'Reading club starts at 2:15 and finishes at 2:50. How long does reading club last?',
      steps: [
        '1. Start 2:15, finish 2:50. Hours: 2 and 2. Minutes: 15 and 50.',
        '2. The missing thing is how LONG it lasted.',
        '3. Both times are in the 2 o\'clock hour, so I only work with the minutes.',
        '4. 50 − 15 = 35.',
        '5. Check by counting on from :15 in fives - 20, 25, 30, 35, 40, 45, 50 - that is seven fives, and seven fives make 35.',
      ],
      answer: '35 minutes',
      whyItMattersForSSA:
        'Measurement and Data is weighted together with Geometry as one band worth 23–27% of the Grade 3 EOG, and time questions are on practically every form — usually asking how long something lasted rather than just what the clock says.',
    },
  },

  'NC.3.MD.2': {
    standardCode: 'NC.3.MD.2',
    title: 'Measuring with Inches, Pounds and Cups',
    coreConcept:
      'North Carolina Grade 3 measures in customary units: inches, feet and yards for length; ounces and pounds for weight; cups, pints, quarts and gallons for how much something holds. You measure lengths to the nearest half-inch or quarter-inch, and every measurement in a problem stays in the SAME unit.',
    rulesAndFormulas: [
      { label: 'Quarter-inch marks', detail: 'When an inch is split into 4 equal parts, each small mark is one quarter of an inch. Three of them make 3/4 of an inch.' },
      { label: 'Half-inch marks', detail: 'When an inch is split into 2 equal parts, each mark is one half of an inch.' },
      { label: 'Length units', detail: 'Inches for small things, feet for a door or a table, yards for a room or a garden.' },
      { label: 'Weight units', detail: 'Ounces for light things, pounds for heavy ones. A bag of apples is measured in pounds.' },
      { label: 'Capacity units', detail: 'Cups, pints, quarts and gallons say how much a container holds.' },
      { label: 'Same unit throughout', detail: 'Grade 3 problems keep every measurement in the same unit, so you never have to swap feet into inches before adding.' },
    ],
    stepByStepMethod: [
      'Step 1: Ask what is being measured: how LONG (inches, feet, yards), how HEAVY (ounces, pounds), or how MUCH IT HOLDS (cups, pints, quarts, gallons).',
      'Step 2: If you are reading a ruler, find the last whole inch before the end of the object, then count the small marks past it and check how many parts each inch is cut into.',
      'Step 3: Write the measurement as whole units plus a fraction of a unit - a half or a quarter.',
      'Step 4: If it is a word problem, check every measurement is in the same unit, then decide: joining (add), taking away (subtract), equal groups (multiply) or sharing (divide).',
      'Step 5: Ask whether the answer makes sense for the real object, and always write the unit next to the number.',
    ],
    commonTraps: [
      'Answering 7 inches by adding the 4 whole inches to the 3 small marks. A small mark is only a quarter of an inch, so three of them are nowhere near three inches.',
      'Answering 4 and 3/8 inches. That counts the marks as eighths when this inch is cut into only 4 parts - count the SPACES inside one inch before naming what a mark is worth.',
      'Starting the measurement at the end of the ruler instead of at the 0 mark, which makes everything come out too short.',
      'Picking a unit that does not fit the object. A crayon is about 5 inches long; a door is taller than a person, so a door is measured in feet.',
    ],
    workedExample: {
      problem: 'A crayon is lined up with 0 on a ruler. Its tip is 3 small marks past the 4-inch line, and each inch on this ruler is split into 4 equal parts. How long is the crayon?',
      steps: [
        '1. This is a length, so the unit is inches.',
        '2. The last whole inch line before the tip is 4, so the crayon is more than 4 inches.',
        '3. Each inch is cut into 4 equal parts, so one small mark is a quarter of an inch.',
        '4. The tip is 3 small marks past 4, which is 3 quarters of an inch more.',
        '5. Put them together: 4 and 3/4 inches. That is nearly 5 inches, which looks right for a crayon.',
      ],
      answer: '4 and 3/4 inches',
      whyItMattersForSSA:
        'Measurement and Data shares a single 23–27% band with Geometry on the Grade 3 EOG, and ruler questions are the ones children practise least, because most home practice is arithmetic on paper rather than measuring real objects.',
    },
  },

  'NC.3.MD.3': {
    standardCode: 'NC.3.MD.3',
    title: 'Reading Scaled Picture Graphs and Bar Graphs',
    coreConcept:
      'A scaled graph saves space by letting one picture, or one gridline, stand for more than one thing. The key on a picture graph and the numbers up the side of a bar graph both tell you how much one step is worth. Read that FIRST - otherwise every number you take off the graph will be too small.',
    rulesAndFormulas: [
      { label: 'Find the key first', detail: 'If each star stands for 6 books, a row of 7 stars means 7 × 6 = 42 books.' },
      { label: 'Bar graphs have a scale too', detail: 'The numbers up the side may go up in 2s, 5s or 10s. One gridline is not always one.' },
      { label: 'How many more', detail: 'Change both rows into real amounts first, then subtract. Never subtract the pictures.' },
      { label: 'Half a picture', detail: 'Half a star is half of what a whole star is worth - with a key of 6, half a star is 3 books.' },
      { label: 'A good data question', detail: 'Collecting data means asking a question with several different answers that sort into up to four groups, such as "which of these four fruits is your favourite?"' },
    ],
    stepByStepMethod: [
      'Step 1: Read the title so you know what is being counted.',
      'Step 2: Find the key on a picture graph, or the numbers up the side of a bar graph, and say out loud what ONE picture or one gridline is worth.',
      'Step 3: For "how many", count the pictures in that row and multiply by the key - or read where the bar ends against the scale.',
      'Step 4: For "how many more" or "how many fewer", turn BOTH rows into real amounts first, then subtract.',
      'Step 5: Write your answer using the words from the title - books, votes, students.',
    ],
    commonTraps: [
      'Answering 7 books by counting the stars themselves. Seven stars is 7 × 6 = 42 books, because the key gives each star a value of 6.',
      'Answering 3 for "how many more". Three more stars is a difference of 3 × 6 = 18 books, not 3.',
      'Reading a bar graph as if every gridline were worth 1. The scale up the side does the same job as the key here, so check it before reading any bar.',
      'Asking a question with only one answer, such as "How many students are in our class?" One number is not a data set, and there is nothing to put in four bars.',
    ],
    workedExample: {
      problem: 'A picture graph shows books read. The key says each star stands for 6 books. Lin\'s row has 7 stars and Ravi\'s row has 4 stars. How many books did Lin read, and how many more did Lin read than Ravi?',
      steps: [
        '1. The title says the graph counts books read.',
        '2. The key says one star is worth 6 books.',
        '3. Lin: 7 stars, so 7 × 6 = 42 books.',
        '4. Ravi: 4 stars, so 4 × 6 = 24 books.',
        '5. How many more: 42 − 24 = 18 books. (Check: Lin has 3 more stars, and 3 × 6 = 18.)',
      ],
      answer: 'Lin read 42 books, which is 18 more than Ravi',
      whyItMattersForSSA:
        'Measurement and Data and Geometry share one 23–27% band on the Grade 3 EOG, and graph questions turn up in it every year — nearly every lost mark comes from counting the pictures instead of using the key.',
    },
  },

  'NC.3.MD.5': {
    standardCode: 'NC.3.MD.5',
    title: 'Area by Covering a Shape with Unit Squares',
    coreConcept:
      'Area is how much flat space is inside a shape, and you measure it by covering the shape with unit squares - all the same size, with no gaps and no overlaps - and counting them. That is why area is written in SQUARE units.',
    rulesAndFormulas: [
      { label: 'Unit square', detail: 'One square that is 1 unit on every side. Its area is 1 square unit.' },
      { label: 'No gaps, no overlaps', detail: 'The tiles must cover the shape exactly. An overlap counts the same space twice and a gap misses some.' },
      { label: 'All tiles the same size', detail: 'Tiles of different sizes cannot be counted together, because they are not worth the same amount of space.' },
      { label: 'Count by rows', detail: 'Every row holds the same number of tiles, so skip counting by that number is faster and safer than counting one at a time.' },
      { label: 'Say "square units"', detail: 'An area of 24 is 24 SQUARE units. Without the word "square" the number could be a length.' },
    ],
    stepByStepMethod: [
      'Step 1: Check that all the tiles are the same size, and that they cover the shape with no gaps and no overlaps.',
      'Step 2: Count the tiles in ONE row.',
      'Step 3: Count how many rows there are.',
      'Step 4: Skip count by the number in a row, making one jump for each row - then count a few tiles one by one to be sure.',
      'Step 5: Write the answer with the words "square units".',
    ],
    commonTraps: [
      'Adding the two counts: 6 + 4 = 10. Adding a row count to a row number counts nothing on the tiling; the area is every tile in the rectangle.',
      'Counting only the top row and answering 6, or only the left column and answering 4. Both are parts of the picture, not the whole area.',
      'Counting a covering made of big tiles and small tiles. It can still hide the rectangle completely, but counting those tiles measures nothing, because the tiles are not all worth the same amount of space.',
      'Leaving the word "square" off the answer. "24 units" sounds like a distance; the area is 24 square units.',
    ],
    workedExample: {
      problem: 'A rectangle is completely covered by unit squares that are all the same size. There are 4 rows, and each row has 6 squares. What is the area of the rectangle?',
      steps: [
        '1. The tiles are all the same size and there are no gaps or overlaps, so counting them measures the area.',
        '2. One row holds 6 squares.',
        '3. There are 4 rows.',
        '4. Skip count by 6, one jump per row: 6, 12, 18, 24.',
        '5. So 24 tiles cover the rectangle.',
      ],
      answer: '24 square units',
      whyItMattersForSSA:
        'Area is brand new in Grade 3, and it sits in the 23–27% band that Measurement and Data shares with Geometry on the EOG — counting tiles is the picture that has to be solid before area becomes a multiplication.',
    },
  },

  'NC.3.MD.7': {
    standardCode: 'NC.3.MD.7',
    title: 'Area by Multiplying, and Splitting a Shape in Two',
    coreConcept:
      'Tiling a rectangle in rows shows you why multiplying works: the tiles in one row, multiplied by the number of rows, gives every tile. And when a shape is not a rectangle, you can cut it into two rectangles, find each area on its own, and ADD the two areas together.',
    rulesAndFormulas: [
      { label: 'Area of a rectangle = side × side', detail: 'A 6 ft by 7 ft rectangle has an area of 6 × 7 = 42 square feet.' },
      { label: 'Why it works', detail: 'One side tells you how many tiles are in a row and the other tells you how many rows there are.' },
      { label: 'Split an odd shape into two rectangles', detail: 'One straight cut makes two rectangles. Work out each area, then add them.' },
      { label: 'Each rectangle uses its OWN two sides', detail: 'Never multiply a side of one rectangle by a side of the other - that rectangle is not in the picture.' },
      { label: 'Areas add; they never multiply', detail: 'Two pieces of space joined together make the sum of the two spaces.' },
      { label: 'Square units again', detail: 'Sides in feet give an area in square feet.' },
    ],
    stepByStepMethod: [
      'Step 1: If the shape is a single rectangle, multiply its two side lengths and you are done.',
      'Step 2: If it is not a rectangle, draw ONE straight line to cut it into two rectangles.',
      'Step 3: Write down the two side lengths of each rectangle separately, so they do not get mixed up.',
      'Step 4: Multiply each rectangle\'s own two sides to get its own area.',
      'Step 5: ADD the two areas together.',
      'Step 6: Write the answer in square units, and check it against a quick tiling picture if you can.',
    ],
    commonTraps: [
      'Answering 480 square feet by multiplying all four numbers together, 8 × 5 × 3 × 4. Each small rectangle needs its OWN two sides multiplied, and then the two areas are ADDED, not multiplied.',
      'Answering 20 square feet by adding one side from each rectangle, 8 + 5 + 3 + 4. Adding side lengths measures the distance around a shape, not the space inside it.',
      'Multiplying 8 × 4, which takes one side from each rectangle and matches no rectangle anywhere in the picture.',
      'Thinking a bigger distance around means more space inside. The distance around a shape does not decide how much space is inside it.',
    ],
    workedExample: {
      problem: 'An L-shaped garden splits into two rectangles: a big one 8 feet by 5 feet, and a small one 3 feet by 4 feet. What is the total area of the garden?',
      steps: [
        '1. The garden is not a rectangle, but it is already cut into two rectangles.',
        '2. Big rectangle sides: 8 feet and 5 feet. Small rectangle sides: 3 feet and 4 feet.',
        '3. Big rectangle: 8 × 5 = 40 square feet.',
        '4. Small rectangle: 3 × 4 = 12 square feet.',
        '5. Add the two areas: 40 + 12 = 52 square feet.',
      ],
      answer: '52 square feet',
      whyItMattersForSSA:
        'Splitting a shape into two rectangles is the hardest thing in the 23–27% band that Measurement and Data shares with Geometry on the Grade 3 EOG, and it is the idea Grade 4 and Grade 5 build every area formula on top of.',
    },
  },

  'NC.3.MD.8': {
    standardCode: 'NC.3.MD.8',
    title: 'Perimeter: All the Way Around',
    coreConcept:
      'Perimeter is the distance all the way around the outside of a shape, and you find it by ADDING every side. If the perimeter is given and one side is missing, add up the sides you know and take that away from the perimeter - what is left has to be the missing side.',
    rulesAndFormulas: [
      { label: 'Perimeter = add every side', detail: 'Go round the shape once, in order, and add all the side lengths.' },
      { label: 'Count your numbers', detail: 'A five-sided figure needs five numbers in the addition. Four numbers means a side got missed.' },
      { label: 'Missing side = perimeter − the known sides', detail: 'With a perimeter of 30 inches and known sides of 8, 5 and 9: 30 − 22 = 8 inches.' },
      { label: 'Perimeter is not area', detail: 'Perimeter is a distance, found by adding, and it is measured in inches. Area is the space inside, found by multiplying, and it is measured in square inches.' },
      { label: 'Check by going round again', detail: 'Add every side including the one you just found. You should land exactly on the perimeter.' },
    ],
    stepByStepMethod: [
      'Step 1: Decide which is missing: the perimeter, or one of the side lengths.',
      'Step 2: If the PERIMETER is missing, list every side in order all the way round, check you have one number per side, and add them all.',
      'Step 3: If a SIDE is missing, add up all the sides you DO know.',
      'Step 4: Subtract that total from the perimeter. What is left is the missing side.',
      'Step 5: Check by adding every side, the one you found included, and seeing that you get the perimeter back.',
    ],
    commonTraps: [
      'Answering 22 inches. That is the total of the three sides you already knew - how much of the perimeter is used up - not the side that is left.',
      'Adding instead of subtracting: 30 + 22 = 52 inches is longer than the whole way round the figure.',
      'Leaving a side out of the known total. Adding only 8 + 5 = 13 and then doing 30 − 13 = 17 forgets the 9-inch side, which is still part of the trip round the shape.',
      'Mixing up perimeter and area. For a different rectangle, 6 inches by 4 inches, the perimeter is 6 + 4 + 6 + 4 = 20 inches and the area is 6 × 4 = 24 square inches - the same two numbers doing two different jobs.',
    ],
    workedExample: {
      problem: 'A four-sided figure has a perimeter of 30 inches. Three of its sides measure 8 inches, 5 inches and 9 inches. How long is the fourth side?',
      steps: [
        '1. The perimeter is given, so the missing thing is a side length.',
        '2. Add the sides I know: 8 + 5 = 13, and 13 + 9 = 22 inches.',
        '3. Those three sides use up 22 inches of the 30-inch trip around.',
        '4. What is left is the fourth side: 30 − 22 = 8 inches.',
        '5. Check all the way round: 8 + 5 + 9 + 8 = 30 inches. It matches the perimeter.',
      ],
      answer: '8 inches',
      whyItMattersForSSA:
        'Finding a missing side is the version of perimeter the Grade 3 EOG asks about most often inside the 23–27% band that Measurement and Data shares with Geometry, because it needs both the adding and the subtracting rather than one lap round a shape.',
    },
  },

  // ----------------------------------------------------------------------
  // Geometry - weighted with Measurement & Data as one 23–27% band
  // ----------------------------------------------------------------------
  'NC.3.G.1': {
    standardCode: 'NC.3.G.1',
    title: 'Quadrilaterals: Shapes That Have More Than One Name',
    coreConcept:
      'A quadrilateral is any closed shape with four straight sides. The different kinds - rectangle, square, rhombus, parallelogram, trapezoid - are named by what their sides and corners do, not by how they are turned on the page. A shape can belong to more than one group at once, and having something EXTRA never throws it out of a group.',
    rulesAndFormulas: [
      { label: 'Quadrilateral', detail: 'Four straight sides, closed up, no gaps.' },
      { label: 'Rectangle', detail: 'A quadrilateral with four square corners.' },
      { label: 'Square', detail: 'Four square corners AND four equal sides. So every square is also a rectangle.' },
      { label: 'Rhombus', detail: 'Four equal sides. A tilted rhombus is still a rhombus - turning a shape never changes its name.' },
      { label: 'Parallelogram', detail: 'Two pairs of parallel sides - sides that stay the same distance apart forever.' },
      { label: 'Trapezoid', detail: 'In North Carolina, a quadrilateral with AT LEAST one pair of parallel sides.' },
      { label: 'Composing and decomposing', detail: 'Two triangles can be joined into a quadrilateral, and a quadrilateral can be cut into smaller shapes.' },
    ],
    stepByStepMethod: [
      'Step 1: Count the sides. Four straight sides makes it a quadrilateral.',
      'Step 2: Check the corners: are they square corners, like the corner of a book?',
      'Step 3: Check the sides: which ones are the same length, and which pairs stay the same distance apart the whole way (parallel)?',
      'Step 4: Match what you found against the names - rectangle for four square corners, square for four square corners and four equal sides, rhombus for four equal sides, parallelogram for two pairs of parallel sides, trapezoid for at least one pair.',
      'Step 5: Remember that more than one name can be right at once, and that the special name never cancels the general one.',
    ],
    commonTraps: [
      'Calling a square "not a rectangle" because its sides are all equal. A square has everything a rectangle needs and one thing more, so every square is a rectangle.',
      'Turning it round and saying every rectangle is a square. Containment runs one way only: the more special shape belongs to the more general group, never the reverse.',
      'Expecting two squares joined along a full side to make a bigger square. Joining them doubles the length but not the height, so the new shape is a rectangle.',
      'Assuming every cut across a quadrilateral makes two triangles. A cut from corner to corner does, but a cut from the middle of one side to the middle of the opposite side leaves two four-sided shapes.',
      'Using the "exactly one pair of parallel sides" definition of a trapezoid from another book. North Carolina uses "at least one pair", so shapes with two pairs count too.',
    ],
    workedExample: {
      problem: 'Jo says a square is not a rectangle, because a square has four equal sides. Is Jo right? Then say what shape you get when two identical squares are joined along a whole side.',
      steps: [
        '1. What does a rectangle need? Four straight sides and four square corners.',
        '2. A square has four straight sides and four square corners, so it passes every test.',
        '3. Its four equal sides are one thing MORE, not one thing missing, so it stays a rectangle. Jo is wrong.',
        '4. Now join two identical squares along a whole side: the shape gets twice as long but it is not any taller.',
        '5. The new shape still has four square corners, but its sides are no longer all equal - so it is a rectangle, not a bigger square.',
      ],
      answer: 'Jo is wrong: every square is a rectangle. Two squares joined along a full side make a rectangle.',
      whyItMattersForSSA:
        'Geometry is a single standard at Grade 3 and it is weighted together with Measurement and Data in one 23–27% band on the EOG, so quadrilateral naming carries real marks even though it takes up the least class time.',
    },
  },

  // ----------------------------------------------------------------------
  // Number & Operations in Base Ten (9–13%)
  // ----------------------------------------------------------------------
  'NC.3.NBT.2': {
    standardCode: 'NC.3.NBT.2',
    title: 'Adding and Subtracting up to 1,000',
    coreConcept:
      'Numbers up to 1,000 are made of hundreds, tens and ones, and you can add or subtract each of those parts separately before putting them back together. Estimate first so you know roughly where the answer should land, and check afterwards with the opposite operation - addition and subtraction undo each other.',
    rulesAndFormulas: [
      { label: 'Estimate first', detail: 'Swap each number for a friendly number close to it that ends in 0: 347 + 289 is about 350 + 290 = 640.' },
      { label: 'Expanded form', detail: '347 = 300 + 40 + 7. Splitting both numbers this way turns one hard sum into three easy ones.' },
      { label: 'Trading up', detail: '40 + 80 = 120, which is one hundred and two tens. The extra hundred moves along to the hundreds.' },
      { label: 'Trading down', detail: 'To subtract when a part is too small, trade before you start. 402 has no tens to take from, so trade a hundred into the tens and a ten into the ones: 402 = 300 + 90 + 12. Now 402 − 176 = 200 + 20 + 6 = 226.' },
      { label: 'Addition and subtraction undo each other', detail: 'If 347 + 289 = 636, then 636 − 289 must give 347 back. That is how you check.' },
    ],
    stepByStepMethod: [
      'Step 1: Estimate first. Swap each number for a friendly number close to it that ends in 0, add or subtract those, and keep the estimate where you can see it.',
      'Step 2: Break both numbers into hundreds, tens and ones.',
      'Step 3: If it is a SUBTRACTION, check each part before you take anything away: is the ones part big enough? Is the tens part? Wherever it is not, trade first - one ten becomes ten ones, and one hundred becomes ten tens - and rewrite the expanded form before you go on. (If the tens part is 0, the hundred has to stop there on its way to the ones.)',
      'Step 4: Now add or subtract the hundreds, then the tens, then the ones, keeping the three parts separate. After Step 3 every part is big enough to take from.',
      'Step 5: Put the parts back together, trading UP whenever a part reaches ten or more: twelve tens is one hundred and two tens.',
      'Step 6: Compare the result with your estimate. If they are far apart, find the mistake before going on.',
      'Step 7: Check with the opposite operation: check an addition by subtracting, and a subtraction by adding.',
    ],
    commonTraps: [
      'Estimating by keeping only the hundreds digit. Turning 347 into 300 and 289 into 200 gives 500, which is more than 130 below the real answer of 636, while 350 + 290 = 640 sits right beside it.',
      'Writing the 16 ones as a 6 and moving on. That loses the ten hiding inside them, and it is exactly the ten that turns 626 into 636.',
      'Checking by adding the same two numbers again. Doing 347 + 289 a second time never uses the answer at all, so it cannot tell you whether the answer is right - subtract instead, and 636 − 289 should give 347.',
      'In a subtraction with a 0 in the tens, trading a hundred straight into the ones and leaving the 0 alone. That skips a step: the hundred has to stop in the tens on its way, which is exactly what turns the 0 in 402 into the 90 you take the 70 from.',
    ],
    workedExample: {
      problem: 'Estimate 347 + 289 first, then work out the exact answer and check that your estimate was close.',
      steps: [
        '1. Estimate: 347 is close to 350 and 289 is close to 290, so the answer should be near 350 + 290 = 640.',
        '2. Expanded form: 347 = 300 + 40 + 7, and 289 = 200 + 80 + 9.',
        '3. This is an addition, not a subtraction, so there is nothing to trade down before starting.',
        '4. Hundreds: 300 + 200 = 500. Tens: 40 + 80 = 120. Ones: 7 + 9 = 16.',
        '5. Put them back, trading up: 500 + 120 = 620, and 620 + 16 = 636.',
        '6. Compare with the estimate: 636 is very close to 640, so it is reasonable.',
        '7. Check by subtracting: 636 − 289 = 347, the number we started with.',
      ],
      answer: '636 (estimated at about 640)',
      whyItMattersForSSA:
        'Base Ten is the smallest band on the Grade 3 EOG at 9–13%, and this standard is most of it - but the estimate-and-check habit it teaches is what catches mistakes in the other three bands, where the marks are.',
    },
  },

  'NC.3.NBT.3': {
    standardCode: 'NC.3.NBT.3',
    title: 'Multiplying by 10, 20, 30 and Friends',
    coreConcept:
      'A multiple of 10 is just a number of tens: 50 is 5 tens, and 90 is 9 tens. So 7 × 50 is 7 × 5 tens, which is 35 tens - and 35 tens is 350. You already know the fact; place value does the rest. Grade 3 uses multiples of 10 from 10 up to 90.',
    rulesAndFormulas: [
      { label: 'Say the multiple of 10 as tens', detail: '50 is 5 tens, 30 is 3 tens, 90 is 9 tens.' },
      { label: 'Use the fact you know', detail: '7 × 50 becomes 7 × 5 tens, and 7 × 5 = 35.' },
      { label: 'Then write what those tens are worth', detail: '35 tens is 350, because 35 groups of ten is 3 hundreds and 5 tens.' },
      { label: 'One zero, because one ten', detail: '50 holds a single ten, so the answer picks up a single zero at the end - never two.' },
      { label: 'The range at Grade 3', detail: 'Multiples of 10 from 10 to 90, with a one-digit number. The biggest one you will meet is 9 × 90 = 810.' },
    ],
    stepByStepMethod: [
      'Step 1: Say the multiple of 10 as a number of tens - 50 is 5 tens.',
      'Step 2: Multiply the one-digit number by that number of tens using a fact you already know: 7 × 5 = 35.',
      'Step 3: Remember that your answer so far is counted in TENS: 35 tens.',
      'Step 4: Write what that many tens is worth by putting a zero on the end: 350.',
      'Step 5: Check with place value - 35 tens is 3 hundreds and 5 tens, which really is 350.',
    ],
    commonTraps: [
      'Answering 35. That is the right count of the wrong unit: 35 is how many TENS there are, not how many pencils.',
      'Answering 57 by adding 7 and 50. Seven equal groups of 50 are joined by multiplying, not by adding once.',
      'Answering 3,500 by putting on two zeros. 50 contains only one ten, so only one zero joins the answer.',
      'Using the fact but forgetting what changed. 7 × 5 = 35 is right, and the 5 became 5 TENS, so the answer has to grow ten times as well.',
    ],
    workedExample: {
      problem: 'A school has 7 boxes of pencils, with 50 pencils in each box. How many pencils does the school have?',
      steps: [
        '1. 50 is 5 tens.',
        '2. So 7 × 50 is 7 × 5 tens.',
        '3. 7 × 5 = 35, so this is 35 tens.',
        '4. 35 tens is 350.',
        '5. Place value check: 35 tens is 3 hundreds and 5 tens, which is 350 pencils.',
      ],
      answer: '350 pencils',
      whyItMattersForSSA:
        'Base Ten is the smallest band on the Grade 3 EOG at 9–13%, and this is the standard that turns a fact you already know into a three-digit answer - the place-value reasoning every bit of Grade 4 multiplication is built on.',
    },
  },
};
