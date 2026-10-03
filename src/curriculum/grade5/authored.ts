import type { Question } from '../../engine/questionModel';
import { labelOptions } from '../../engine/questionModel';

/**
 * The authored Grade 5 question bank.
 *
 * Every item is multiple choice, because the NC EOG and the CASE assessment
 * used for Single Subject Acceleration are multiple choice. Every incorrect
 * option is the value (or statement) a student actually arrives at by making
 * one specific, named error — never a filler number. The `misconception` tag
 * on each wrong option is drawn from the shared vocabulary documented in the
 * task brief, so a distractor chosen repeatedly across different items names
 * the single procedure the student needs to repair.
 *
 * The correct option is deliberately placed at a varied position; it is not
 * always A.
 */
export const GRADE_5_AUTHORED: Question[] = [
  // ==========================================
  // DOMAIN: OPERATIONS & ALGEBRAIC THINKING (OA)
  // Standard: NC.5.OA.2
  // ==========================================
  {
    id: 'oa2-01',
    standardCode: 'NC.5.OA.2',
    domainId: 'OA',
    prompt: 'Evaluate the expression below following the standard order of operations:',
    promptDetails: '6 × (12 - 4)',
    options: labelOptions([
      // Parentheses ignored: 6 × 12 = 72, then 72 - 4 = 68.
      { text: '68', isCorrect: false, misconception: 'ignored-grouping-symbols' },
      // Stopped after the parentheses: 12 - 4 = 8.
      { text: '8', isCorrect: false, misconception: 'forgot-the-final-step' },
      // Key: (12 - 4) = 8, then 6 × 8 = 48.
      { text: '48', isCorrect: true },
      // Added instead of multiplying: 6 + 12 - 4 = 14.
      { text: '14', isCorrect: false, misconception: 'added-instead-of-multiplied' },
    ]),
    calculatorAllowed: false,
    isStretch: false,
    difficulty: 'mastery',
    contentVersion: 2,
    explanation: {
      stepByStep: [
        'Step 1: Evaluate inside the parentheses first: (12 - 4) = 8. The expression is now: 6 × 8.',
        'Step 2: Multiply: 6 × 8 = 48.'
      ],
      conceptSummary: 'Operations inside parentheses take highest priority. Do them first, then finish the expression.',
      commonMisconception: 'Multiplying 6 × 12 = 72 first and then subtracting 4 gives 68, which ignores the parentheses.'
    }
  },
  {
    id: 'oa2-02',
    standardCode: 'NC.5.OA.2',
    domainId: 'OA',
    prompt: 'Which numerical expression represents the statement: "Subtract 8 from 32, then divide the difference by 6"?',
    options: labelOptions([
      // Key: the difference (32 - 8) is grouped, then divided by 6. Value 4.
      { text: '(32 - 8) ÷ 6', isCorrect: true },
      // Left the difference ungrouped, so only the 8 is divided by 6.
      { text: '32 - 8 ÷ 6', isCorrect: false, misconception: 'ignored-grouping-symbols' },
      // Read "subtract 8 from 32" as 8 - 32.
      { text: '(8 - 32) ÷ 6', isCorrect: false, misconception: 'reversed-the-subtraction' },
      // Grouped the 8 with the 6 instead of with the 32.
      { text: '32 ÷ (8 - 6)', isCorrect: false, misconception: 'misgrouped-the-subtraction' },
    ]),
    calculatorAllowed: false,
    isStretch: false,
    difficulty: 'mastery',
    contentVersion: 2,
    explanation: {
      stepByStep: [
        'Step 1: "Subtract 8 from 32" is written 32 - 8.',
        'Step 2: "The difference" is the whole result of that subtraction, so it needs grouping symbols: (32 - 8).',
        'Step 3: "Divide by 6" applies to the whole difference: (32 - 8) ÷ 6.'
      ],
      conceptSummary: 'Grouping symbols show which part of a statement is done first and treated as one quantity.',
      commonMisconception: 'Choice C reverses the subtraction ("subtract 8 from 32" starts with 32 and takes away 8).'
    }
  },
  {
    id: 'oa2-03',
    standardCode: 'NC.5.OA.2',
    domainId: 'OA',
    prompt: 'Evaluate the expression without using a calculator:',
    promptDetails: '5 × (1.5 + 0.75)',
    options: labelOptions([
      // Parentheses ignored: 5 × 1.5 = 7.5, then 7.5 + 0.75 = 8.25.
      { text: '8.25', isCorrect: false, misconception: 'ignored-grouping-symbols' },
      // Stopped after the parentheses: 1.5 + 0.75 = 2.25.
      { text: '2.25', isCorrect: false, misconception: 'forgot-the-final-step' },
      // Added instead of multiplying: 5 + 1.5 + 0.75 = 7.25.
      { text: '7.25', isCorrect: false, misconception: 'added-instead-of-multiplied' },
      // Key: (1.5 + 0.75) = 2.25, then 5 × 2.25 = 11.25.
      { text: '11.25', isCorrect: true },
    ]),
    calculatorAllowed: false,
    isStretch: false,
    difficulty: 'advanced',
    contentVersion: 2,
    explanation: {
      stepByStep: [
        'Step 1: Parentheses first. Line up the decimal points: 1.50 + 0.75 = 2.25. The expression is now: 5 × 2.25.',
        'Step 2: Multiply: 5 × 2 = 10 and 5 × 0.25 = 1.25, so 5 × 2.25 = 11.25.'
      ],
      conceptSummary: 'Evaluate the parentheses first, then finish the expression. The numbers inside can be decimals.',
      commonMisconception: 'Multiplying 5 × 1.5 = 7.5 first and then adding 0.75 gives 8.25, which ignores the parentheses.'
    }
  },
  {
    id: 'oa2-04',
    standardCode: 'NC.5.OA.2',
    domainId: 'OA',
    prompt: 'Without calculating the exact values, compare Expression P and Expression Q:',
    promptDetails: 'Expression P: 4 × (12,840 + 675)\nExpression Q: 12,840 + 675',
    options: labelOptions([
      // Read the multiplier 4 as an addend.
      { text: 'Expression P is 4 more than Expression Q', isCorrect: false, misconception: 'confused-times-with-more' },
      { text: 'Expression P is 4 times as large as Expression Q', isCorrect: true },
      // Named the wrong expression as the larger one.
      { text: 'Expression Q is 4 times as large as Expression P', isCorrect: false, misconception: 'reversed-the-relationship' },
      // Saw the shared quantity (12,840 + 675) in both and overlooked the × 4.
      { text: 'Both expressions are equal in value', isCorrect: false, misconception: 'ignored-the-multiplier' },
    ]),
    calculatorAllowed: false,
    isStretch: false,
    difficulty: 'mastery',
    explanation: {
      stepByStep: [
        'Step 1: Notice that both expressions contain the common quantity (12,840 + 675).',
        'Step 2: Expression P multiplies this quantity by 4.',
        'Step 3: Therefore, Expression P is exactly 4 times the value of Expression Q.'
      ],
      conceptSummary: 'NC.5.OA.2 expects students to interpret expressions structurally without performing large multi-digit arithmetic.',
      commonMisconception: 'Confusing "4 times as large" with "4 more than".'
    }
  },

  // Standard: NC.5.OA.3
  {
    id: 'oa3-01',
    standardCode: 'NC.5.OA.3',
    domainId: 'OA',
    prompt: 'Two patterns are described below:\n• Pattern X: Starts at 0, add 4\n• Pattern Y: Starts at 0, add 12\n\nWhich statement describes the relationship between corresponding terms of Pattern X and Pattern Y?',
    options: labelOptions([
      // Used the difference of the two rules (12 - 4 = 8) instead of their ratio.
      { text: 'Each term in Pattern Y is 8 more than the corresponding term in Pattern X', isCorrect: false, misconception: 'additive-instead-of-multiplicative-relationship' },
      // Correct factor, wrong direction.
      { text: 'Each term in Pattern X is 3 times the corresponding term in Pattern Y', isCorrect: false, misconception: 'reversed-the-relationship' },
      // Used Pattern X's own step size (4) as the scale factor instead of 12 ÷ 4.
      { text: 'Each term in Pattern Y is 4 times the corresponding term in Pattern X', isCorrect: false, misconception: 'used-the-step-size-as-the-factor' },
      { text: 'Each term in Pattern Y is 3 times the corresponding term in Pattern X', isCorrect: true },
    ]),
    calculatorAllowed: false,
    isStretch: false,
    difficulty: 'mastery',
    explanation: {
      stepByStep: [
        'Step 1: Write terms for Pattern X: 0, 4, 8, 12, 16, 20...',
        'Step 2: Write terms for Pattern Y: 0, 12, 24, 36, 48, 60...',
        'Step 3: Compare corresponding terms: 12 ÷ 4 = 3; 24 ÷ 8 = 3; 36 ÷ 12 = 3.',
        'Step 4: Each term in Pattern Y is exactly 3 times the corresponding term in Pattern X.'
      ],
      conceptSummary: 'Comparing rate of change (+12 vs +4) identifies the multiplicative scaling factor: 12 / 4 = 3.',
      commonMisconception: 'Looking only at the first non-zero difference (12 - 4 = 8) and mistakenly thinking the relationship is "+8". The relationship between terms must be consistent across all pairs.'
    }
  },
  {
    id: 'oa3-02',
    standardCode: 'NC.5.OA.3',
    domainId: 'OA',
    prompt: 'Pattern A begins at 0 and adds 5. Pattern B begins at 0 and adds 15. An ordered pair (x, y) is formed where x is a term from Pattern A and y is the corresponding term from Pattern B. If x = 35, what is the value of y?',
    options: labelOptions([
      { text: '105', isCorrect: true },
      // 35 + (15 - 5) = 45: added the difference of the rules instead of scaling.
      { text: '45', isCorrect: false, misconception: 'additive-instead-of-multiplicative-relationship' },
      // 35 × 15 = 525: scaled by Pattern B's step instead of the ratio 15 ÷ 5 = 3.
      { text: '525', isCorrect: false, misconception: 'used-the-step-size-as-the-factor' },
      // 35 ÷ 5 = 7 steps, then reported the step count as the answer.
      { text: '7', isCorrect: false, misconception: 'forgot-the-final-step' },
    ]),
    calculatorAllowed: false,
    isStretch: false,
    difficulty: 'advanced',
    explanation: {
      stepByStep: [
        'Step 1: Find the multiplicative rule: Pattern B adds 15 for every 5 added in Pattern A.',
        'Step 2: 15 ÷ 5 = 3, so y = 3 × x for all corresponding terms.',
        'Step 3: For x = 35: y = 3 × 35 = 105.'
      ],
      conceptSummary: 'Corresponding terms of proportional patterns maintain a constant ratio (y/x = constant).',
      commonMisconception: 'Adding the difference between the rules (35 + 10 = 45) instead of scaling: y is always 3 times x.'
    }
  },
  {
    id: 'oa3-03',
    standardCode: 'NC.5.OA.3',
    domainId: 'OA',
    prompt: 'Two patterns start at 0. Pattern 1 adds 6 each time. Pattern 2 adds 9 each time. If the points (x, y) are plotted on a coordinate plane with Pattern 1 on the x-axis and Pattern 2 on the y-axis, what is the y-coordinate when the x-coordinate is 48?',
    options: labelOptions([
      // 48 + (9 - 6) = 51.
      { text: '51', isCorrect: false, misconception: 'additive-instead-of-multiplicative-relationship' },
      // 48 × 9 = 432: scaled by Pattern 2's step instead of the ratio 9 ÷ 6.
      { text: '432', isCorrect: false, misconception: 'used-the-step-size-as-the-factor' },
      { text: '72', isCorrect: true },
      // 48 × 6/9 = 32: used the reciprocal of the correct ratio.
      { text: '32', isCorrect: false, misconception: 'inverted-the-ratio' },
    ]),
    calculatorAllowed: false,
    isStretch: true,
    difficulty: 'stretch',
    explanation: {
      stepByStep: [
        'Step 1: Find how many steps Pattern 1 took to reach 48: 48 ÷ 6 = 8 steps.',
        'Step 2: Apply the same 8 steps to Pattern 2: 8 × 9 = 72.',
        'Step 3: Alternatively, notice the ratio y/x = 9/6 = 3/2 = 1.5. 48 × 1.5 = 72.'
      ],
      conceptSummary: 'When two patterns both start at 0, each y is the same number of times its x. Here y is always 1.5 times x, so the points line up in a straight line.',
      commonMisconception: 'Adding 3 (the difference between 9 and 6) to 48 instead of using multiplicative scaling.'
    }
  },

  // ==========================================
  // DOMAIN: NUMBER & OPERATIONS IN BASE TEN (NBT)
  // Standard: NC.5.NBT.1
  // ==========================================
  {
    id: 'nbt1-01',
    standardCode: 'NC.5.NBT.1',
    domainId: 'NBT',
    prompt: 'In the number 8,840.35, how does the value of the 8 in the thousands place compare to the value of the 8 in the hundreds place?',
    options: labelOptions([
      // Counted two place-value jumps instead of one.
      { text: 'It is 100 times greater', isCorrect: false, misconception: 'wrong-power-of-ten' },
      { text: 'It is 10 times greater', isCorrect: true },
      // Compared right-to-left instead of left-to-right.
      { text: 'It is 1/10 of the value', isCorrect: false, misconception: 'place-value-shift-wrong-direction' },
      // Reported the hundreds digit's value (800) as if it were the ratio.
      { text: 'It is 800 times greater', isCorrect: false, misconception: 'used-place-value-as-the-factor' },
    ]),
    calculatorAllowed: false,
    isStretch: false,
    difficulty: 'mastery',
    explanation: {
      stepByStep: [
        'Step 1: The 8 in the thousands place has a value of 8,000.',
        'Step 2: The 8 in the hundreds place has a value of 800.',
        'Step 3: 8,000 ÷ 800 = 10.',
        'Step 4: The 8 in the thousands place is 10 times greater than the 8 in the hundreds place.'
      ],
      conceptSummary: 'In base ten, each step to the left represents a value 10 times greater than the place to its right.',
      commonMisconception: 'Confusing 10 times greater with 100 times greater when adjacent places are compared.'
    }
  },
  {
    id: 'nbt1-02',
    standardCode: 'NC.5.NBT.1',
    domainId: 'NBT',
    prompt: 'What is the value of the expression below?',
    promptDetails: '47.62 ÷ 100',
    options: labelOptions([
      // Multiplied by 100 instead of dividing: moved the decimal 2 places right.
      { text: '4,762', isCorrect: false, misconception: 'place-value-shift-wrong-direction' },
      // Moved the decimal left only 1 place.
      { text: '4.762', isCorrect: false, misconception: 'wrong-power-of-ten' },
      // Moved the decimal left 3 places.
      { text: '0.04762', isCorrect: false, misconception: 'wrong-power-of-ten' },
      // Key: 47.62 -> 4.762 (1 place) -> 0.4762 (2 places).
      { text: '0.4762', isCorrect: true },
    ]),
    calculatorAllowed: false,
    isStretch: false,
    difficulty: 'mastery',
    contentVersion: 2,
    explanation: {
      stepByStep: [
        'Step 1: 100 has two zeros, so dividing by 100 moves every digit 2 places to the right (the decimal point moves 2 places to the left).',
        'Step 2: 47.62 -> 4.762 (1 place) -> 0.4762 (2 places).',
        'Step 3: 47.62 ÷ 100 = 0.4762.'
      ],
      conceptSummary: 'Dividing by 10 or 100 moves the decimal point 1 or 2 places to the left, inserting a leading zero when needed.',
      commonMisconception: 'Moving the decimal 1 place or 3 places instead of 2, or moving it to the right instead of the left.'
    }
  },
  {
    id: 'nbt1-03',
    standardCode: 'NC.5.NBT.1',
    domainId: 'NBT',
    prompt: 'A science laboratory measured the mass of a chemical sample as 0.06 grams. A second sample had a mass of 0.006 grams. Which statement correctly describes the relationship between the two samples?',
    options: labelOptions([
      // Read the place-value move in the wrong direction: one place right means smaller.
      { text: 'The second sample has a mass that is 10 times the first sample', isCorrect: false, misconception: 'place-value-shift-wrong-direction' },
      // Correct factor, wrong subject: named the first sample as the smaller one.
      { text: 'The first sample has a mass that is 1/10 of the second sample', isCorrect: false, misconception: 'reversed-the-relationship' },
      { text: 'The second sample has a mass that is 1/10 of the first sample', isCorrect: true },
      // Counted two place-value jumps between hundredths and thousandths.
      { text: 'The second sample has a mass that is 1/100 of the first sample', isCorrect: false, misconception: 'wrong-power-of-ten' },
    ]),
    calculatorAllowed: false,
    isStretch: false,
    difficulty: 'mastery',
    explanation: {
      stepByStep: [
        'Step 1: Sample 1 is 0.06 (6 hundredths).',
        'Step 2: Sample 2 is 0.006 (6 thousandths).',
        'Step 3: 0.006 is one place value to the right of 0.06.',
        'Step 4: Moving one place to the right means the value is 1/10 of the place to its left.'
      ],
      conceptSummary: 'The thousandths place is 1/10 of the hundredths place.',
      commonMisconception: 'Selecting Choice B by reading the statement backwards.'
    }
  },

  // Standard: NC.5.NBT.3
  {
    id: 'nbt3-01',
    standardCode: 'NC.5.NBT.3',
    domainId: 'NBT',
    prompt: 'Which inequality correctly compares the numbers below?',
    promptDetails: 'Number P: 3.084\nNumber Q: 3.804',
    options: labelOptions([
      { text: '3.084 < 3.804', isCorrect: true },
      // Compared from the rightmost digit: 4 = 4, then 8 > 0, so P was called larger.
      { text: '3.084 > 3.804', isCorrect: false, misconception: 'compared-decimals-right-to-left' },
      // Ordered the two numbers correctly but read "<" as "is greater than".
      { text: '3.804 < 3.084', isCorrect: false, misconception: 'reversed-the-inequality-symbol' },
      // Both numbers use the digits 3, 0, 8 and 4, so they were called equal.
      { text: '3.084 = 3.804', isCorrect: false, misconception: 'same-digits-read-as-equal' },
    ]),
    calculatorAllowed: false,
    isStretch: false,
    difficulty: 'mastery',
    explanation: {
      stepByStep: [
        'Step 1: Compare ones place: both have 3.',
        'Step 2: Compare tenths place: Number P has 0 tenths, Number Q has 8 tenths.',
        'Step 3: Since 0 < 8, 3.084 < 3.804.'
      ],
      conceptSummary: 'Compare decimals starting from left to right at the highest place value where digits differ.',
      commonMisconception: 'Focusing on the digits 84 vs 804 without aligning decimal place values.'
    }
  },
  {
    id: 'nbt3-02',
    standardCode: 'NC.5.NBT.3',
    domainId: 'NBT',
    prompt: 'Write the number "six and forty-five thousandths" in standard decimal form.',
    options: labelOptions([
      // Wrote 45 in the tenths and hundredths places, omitting the placeholder zero.
      { text: '6.45', isCorrect: false, misconception: 'word-form-place-value-shifted' },
      { text: '6.045', isCorrect: true },
      // Wrote two placeholder zeros before the 45 (one too many), as if it were ten-thousandths.
      { text: '6.0045', isCorrect: false, misconception: 'wrong-power-of-ten' },
      // Read the phrase as "six hundred forty-five thousandths".
      { text: '0.645', isCorrect: false, misconception: 'read-the-whole-number-as-part-of-the-fraction' },
    ]),
    calculatorAllowed: false,
    isStretch: false,
    difficulty: 'mastery',
    explanation: {
      stepByStep: [
        'Step 1: "Six" is 6 whole units before the decimal point: 6.',
        'Step 2: "Thousandths" means three digits behind the decimal point (__ __ __).',
        'Step 3: "Forty-five thousandths" means 45 placed in the hundredths and thousandths spots: 0 tenths, 4 hundredths, 5 thousandths.',
        'Step 4: Standard form is 6.045.'
      ],
      conceptSummary: 'Decimals in word form require a placeholder zero in the tenths place when expressing 45 thousandths.',
      commonMisconception: 'Writing 6.45 (which is six and forty-five hundredths).'
    }
  },
  {
    id: 'nbt3-03',
    standardCode: 'NC.5.NBT.3',
    domainId: 'NBT',
    prompt: 'What decimal number is represented by this expanded form expression?',
    promptDetails: '(7 × 10) + (4 × 1) + (2 × 0.1) + (8 × 0.001)',
    options: labelOptions([
      // Wrote the decimal digits 2 and 8 side by side, skipping the empty hundredths place.
      { text: '74.28', isCorrect: false, misconception: 'omitted-placeholder-zero' },
      // Matched 8 to the tenths place and 2 to the thousandths place.
      { text: '74.802', isCorrect: false, misconception: 'swapped-the-decimal-place-values' },
      // Counted 0.001 as the ten-thousandths place.
      { text: '74.2008', isCorrect: false, misconception: 'wrong-power-of-ten' },
      { text: '74.208', isCorrect: true },
    ]),
    calculatorAllowed: false,
    isStretch: true,
    difficulty: 'stretch',
    explanation: {
      stepByStep: [
        'Step 1: Tens place: 7 × 10 = 70.',
        'Step 2: Ones place: 4 × 1 = 4. Whole number part = 74.',
        'Step 3: Tenths place: 2 × 0.1 = 0.2.',
        'Step 4: Hundredths place: 0 × 0.01 (no hundredths term is given, so 0).',
        'Step 5: Thousandths place: 8 × 0.001 = 0.008.',
        'Step 6: Combine: 74 + 0.2 + 0.008 = 74.208.'
      ],
      conceptSummary: 'When an expanded form skips a place value (like hundredths here), a zero must be placed in that position.',
      commonMisconception: 'Writing 74.28 because the 0 for hundredths was omitted.'
    }
  },

  // Standard: NC.5.NBT.5
  {
    id: 'nbt5-01',
    standardCode: 'NC.5.NBT.5',
    domainId: 'NBT',
    prompt: 'Multiply the numbers using the standard algorithm:',
    promptDetails: '648 × 37',
    options: labelOptions([
      // 4,536 + 1,944 = 6,480: the tens row was written without its placeholder zero.
      { text: '6,480', isCorrect: false, misconception: 'dropped-partial-product-zero' },
      // Reported only the first partial product, 648 × 7.
      { text: '4,536', isCorrect: false, misconception: 'forgot-the-final-step' },
      { text: '23,976', isCorrect: true },
      // Carry added before multiplying: 648 × 7 -> 8,436 and 648 × 3 -> 2,184; 8,436 + 21,840.
      { text: '30,276', isCorrect: false, misconception: 'added-carry-before-multiplying' },
    ]),
    calculatorAllowed: false,
    isStretch: false,
    difficulty: 'mastery',
    explanation: {
      stepByStep: [
        'Step 1: Multiply 648 by 7: 648 × 7 = 4,536.',
        'Step 2: Place a 0 in the ones place of the second partial product.',
        'Step 3: Multiply 648 by 30: 648 × 3 = 1,944 -> 19,440.',
        'Step 4: Add partial products: 4,536 + 19,440 = 23,976.'
      ],
      conceptSummary: 'Multi-digit multiplication requires computing two partial products and adding them accurately.',
      commonMisconception: 'Forgetting the placeholder 0 for the tens row.'
    }
  },
  {
    id: 'nbt5-02',
    standardCode: 'NC.5.NBT.5',
    domainId: 'NBT',
    prompt: 'An auditorium has 28 rows of seats with 345 seats in each row. For a special concert, 15 seats are removed for sound equipment. How many seats are available for the concert?',
    options: labelOptions([
      { text: '9,645', isCorrect: true },
      // Found 345 × 28 = 9,660 and stopped before removing the 15 seats.
      { text: '9,660', isCorrect: false, misconception: 'forgot-the-final-step' },
      // 9,660 + 15: added the removed seats instead of subtracting them.
      { text: '9,675', isCorrect: false, misconception: 'added-instead-of-subtracted' },
      // 2,760 + 690 = 3,450 (tens row missing its zero), then 3,450 - 15.
      { text: '3,435', isCorrect: false, misconception: 'dropped-partial-product-zero' },
    ]),
    calculatorAllowed: false,
    isStretch: false,
    difficulty: 'mastery',
    explanation: {
      stepByStep: [
        'Step 1: Find total seats before removal: 345 × 28.',
        'Step 2: 345 × 8 = 2,760; 345 × 20 = 6,900. Total = 2,760 + 6,900 = 9,660.',
        'Step 3: Subtract the 15 removed seats: 9,660 - 15 = 9,645.'
      ],
      conceptSummary: 'Multi-step multiplication word problems require calculating the total product and then adjusting for the condition.',
      commonMisconception: 'Forgetting to subtract the 15 removed seats (selecting Choice B).'
    }
  },

  // Standard: NC.5.NBT.6
  {
    id: 'nbt6-01',
    standardCode: 'NC.5.NBT.6',
    domainId: 'NBT',
    prompt: 'Divide the numbers:',
    promptDetails: '3,816 ÷ 18',
    options: labelOptions([
      // Divided by only the 8 of the divisor: 3,816 ÷ 8 = 477.
      { text: '477', isCorrect: false, misconception: 'divided-by-only-one-digit-of-the-divisor' },
      { text: '212', isCorrect: true },
      // Wrote 0 for the 21 ÷ 18 step, then recorded only the last digit of 216 ÷ 18 = 12.
      { text: '202', isCorrect: false, misconception: 'misplaced-digits-in-the-quotient' },
      // Appended an extra zero when the final digit was brought down.
      { text: '2,120', isCorrect: false, misconception: 'wrong-power-of-ten' },
    ]),
    calculatorAllowed: false,
    isStretch: false,
    difficulty: 'mastery',
    explanation: {
      stepByStep: [
        'Step 1: 18 goes into 38 two times (2 × 18 = 36). Remainder 2.',
        'Step 2: Bring down 1 to get 21. 18 goes into 21 one time (1 × 18 = 18). Remainder 3.',
        'Step 3: Bring down 6 to get 36. 18 goes into 36 two times (2 × 18 = 36). Remainder 0.',
        'Step 4: The quotient is 212.'
      ],
      conceptSummary: 'Step-by-step long division or partial quotients strategy with 2-digit divisor.',
      commonMisconception: 'Computational errors when multiplying 18 by 2.'
    }
  },
  {
    id: 'nbt6-02',
    standardCode: 'NC.5.NBT.6',
    domainId: 'NBT',
    prompt: 'A distributor is packing 1,480 books into storage cartons. Each carton holds exactly 32 books. How many cartons are needed to pack ALL the books so none are left out?',
    options: labelOptions([
      // 1,480 ÷ 32 = 46 R 8; dropped the remainder and left 8 books unpacked.
      { text: '46 cartons', isCorrect: false, misconception: 'ignored-remainder' },
      // Reported the bare quotient and remainder instead of a whole number of cartons.
      { text: '46 R 8 cartons', isCorrect: false, misconception: 'reported-remainder-without-interpreting' },
      // Estimated 1,500 ÷ 30 = 50 and gave the estimate as the answer.
      { text: '50 cartons', isCorrect: false, misconception: 'reported-the-estimate' },
      { text: '47 cartons', isCorrect: true },
    ]),
    calculatorAllowed: false,
    isStretch: false,
    difficulty: 'mastery',
    explanation: {
      stepByStep: [
        'Step 1: Divide total books by capacity per carton: 1,480 ÷ 32.',
        'Step 2: 32 goes into 148 four times (4 × 32 = 128). 148 - 128 = 20.',
        'Step 3: Bring down 0 to make 200. 32 goes into 200 six times (6 × 32 = 192). 200 - 192 = 8 books left over.',
        'Step 4: 1,480 ÷ 32 = 46 R8.',
        'Step 5: Since all books must be packed, the remaining 8 books require 1 additional carton: 46 + 1 = 47 cartons.'
      ],
      conceptSummary: 'Interpreting remainders in context: when all items must be accommodated, round the quotient UP to the next whole number.',
      commonMisconception: 'Giving 46 as the answer (leaving 8 books unpacked).'
    }
  },
  {
    id: 'nbt6-03',
    standardCode: 'NC.5.NBT.6',
    domainId: 'NBT',
    prompt: 'Calculate the quotient of 6,240 ÷ 26.',
    options: labelOptions([
      { text: '240', isCorrect: true },
      // Stopped after 104 ÷ 26 = 4 and never recorded the 0 for the final brought-down digit.
      { text: '24', isCorrect: false, misconception: 'dropped-zero-in-quotient' },
      // Recorded one zero too many in the quotient.
      { text: '2,400', isCorrect: false, misconception: 'wrong-power-of-ten' },
      // Divided by only the 6 of the divisor: 6,240 ÷ 6 = 1,040.
      { text: '1,040', isCorrect: false, misconception: 'divided-by-only-one-digit-of-the-divisor' },
    ]),
    calculatorAllowed: false,
    isStretch: false,
    difficulty: 'mastery',
    explanation: {
      stepByStep: [
        'Step 1: 26 into 62 goes 2 times: 2 × 26 = 52. 62 - 52 = 10.',
        'Step 2: Bring down 4 to make 104. 26 into 104 goes 4 times: 4 × 26 = 104. 104 - 104 = 0.',
        'Step 3: Bring down 0. 26 into 0 goes 0 times. Record 0 in the ones place.',
        'Step 4: Quotient is 240.'
      ],
      conceptSummary: 'Remembering to write 0 in the quotient when bringing down a final zero.',
      commonMisconception: 'Writing 24 instead of 240.'
    }
  },

  // Standard: NC.5.NBT.7
  {
    id: 'nbt7-01',
    standardCode: 'NC.5.NBT.7',
    domainId: 'NBT',
    prompt: 'Calculate the difference without a calculator:',
    promptDetails: '80.4 - 27.65',
    options: labelOptions([
      // Took the smaller digit from the larger in every column: 8-2, 7-0, 6-4, 5-0.
      { text: '67.25', isCorrect: false, misconception: 'subtracted-without-regrouping' },
      // Truncated 27.65 to 27.6 rather than padding 80.4 to 80.40: 80.4 - 27.6.
      { text: '52.8', isCorrect: false, misconception: 'dropped-the-extra-decimal-place' },
      { text: '52.75', isCorrect: true },
      // 80.40 + 27.65: added instead of subtracting.
      { text: '108.05', isCorrect: false, misconception: 'added-instead-of-subtracted' },
    ]),
    calculatorAllowed: false,
    isStretch: false,
    difficulty: 'mastery',
    explanation: {
      stepByStep: [
        'Step 1: Line up the decimal points and append a trailing zero: 80.40 - 27.65.',
        'Step 2: Regroup across places: 0 in hundredths borrows to become 10; 10 - 5 = 5.',
        'Step 3: 3 in tenths borrows from 80 to become 13; 13 - 6 = 7.',
        'Step 4: 79 - 27 = 52.',
        'Step 5: Combine: 52.75.'
      ],
      conceptSummary: 'Always align decimal points vertically and pad with trailing zeros before subtracting.',
      commonMisconception: 'Taking the smaller digit from the larger in every column (0 and 5 give 5) instead of regrouping, which gives 67.25.'
    }
  },
  {
    id: 'nbt7-02',
    standardCode: 'NC.5.NBT.7',
    domainId: 'NBT',
    prompt: 'Multiply: 4.35 × 0.8',
    options: labelOptions([
      // 435 × 8 = 3,480 with only 2 decimal places counted instead of 3.
      { text: '34.8', isCorrect: false, misconception: 'decimal-point-misplaced' },
      { text: '3.48', isCorrect: true },
      // 4 × 0.8 = 3.2, then the 0.35 was appended rather than multiplied: 3.2 + 0.35.
      { text: '3.55', isCorrect: false, misconception: 'multiplied-only-the-whole-number-part' },
      // 4.35 + 0.8: added instead of multiplying.
      { text: '5.15', isCorrect: false, misconception: 'added-instead-of-multiplied' },
    ]),
    calculatorAllowed: false,
    isStretch: false,
    difficulty: 'mastery',
    explanation: {
      stepByStep: [
        'Step 1: Multiply as whole numbers: 435 × 8.',
        'Step 2: 435 × 8 = 3,480.',
        'Step 3: Count total decimal places in both factors: 4.35 has 2 decimal places, 0.8 has 1 decimal place (total = 3 decimal places).',
        'Step 4: Move the decimal point 3 places to the left: 3.480 = 3.48.'
      ],
      conceptSummary: 'Decimal product place value rule: total decimal places in factors equals total decimal places in product.',
      commonMisconception: 'Lining up decimals during multiplication instead of placing the decimal at the end.'
    }
  },
  {
    id: 'nbt7-03',
    standardCode: 'NC.5.NBT.7',
    domainId: 'NBT',
    prompt: 'Marcus bought 3 packages of markers for $4.75 each and 2 notebooks for $2.40 each. He paid with a $50 bill. How much change should Marcus receive?',
    options: labelOptions([
      // Found the total cost, $14.25 + $4.80, and stopped there.
      { text: '$19.05', isCorrect: false, misconception: 'forgot-the-final-step' },
      // Bought one of each: $50.00 - ($4.75 + $2.40) = $42.85.
      { text: '$42.85', isCorrect: false, misconception: 'ignored-the-quantity-multipliers' },
      // 3 × 4.75 + 2 × 2.40 read left to right: (14.25 + 2) × 2.40 = 39.00; 50 - 39.
      { text: '$11.00', isCorrect: false, misconception: 'order-of-operations-left-to-right' },
      { text: '$30.95', isCorrect: true },
    ]),
    calculatorAllowed: true,
    isStretch: false,
    difficulty: 'mastery',
    explanation: {
      stepByStep: [
        'Step 1: Cost of markers: 3 × $4.75 = $14.25.',
        'Step 2: Cost of notebooks: 2 × $2.40 = $4.80.',
        'Step 3: Total cost: $14.25 + $4.80 = $19.05.',
        'Step 4: Change from $50: $50.00 - $19.05 = $30.95.'
      ],
      conceptSummary: 'Multi-step money problem requiring decimal multiplication, addition, and subtraction from a whole number.',
      commonMisconception: 'Forgetting to subtract from $50.00 or making a subtraction regrouping error.'
    }
  },
  {
    id: 'nbt7-04',
    standardCode: 'NC.5.NBT.7',
    domainId: 'NBT',
    prompt: 'A roll holds 6 meters of ribbon. Each bow uses 0.25 meter of ribbon. How many bows can be made from the roll?',
    options: labelOptions([
      // 6 × 0.25 = 1.5: multiplied instead of dividing.
      { text: '1.5 bows', isCorrect: false, misconception: 'multiplied-instead-of-divided' },
      // Shifted the divisor to 25 but left the dividend at 6: 6 ÷ 25 = 0.24.
      { text: '0.24 bows', isCorrect: false, misconception: 'decimal-point-misplaced' },
      // Key: 6 ÷ 0.25 = 600 ÷ 25 = 24.
      { text: '24 bows', isCorrect: true },
      // Shifted the divisor one place (2.5) instead of two: 6 ÷ 2.5 = 2.4.
      { text: '2.4 bows', isCorrect: false, misconception: 'wrong-power-of-ten' },
    ]),
    calculatorAllowed: false,
    isStretch: false,
    difficulty: 'advanced',
    contentVersion: 2,
    explanation: {
      stepByStep: [
        'Step 1: The question asks how many 0.25-meter pieces fit into 6 meters: 6 ÷ 0.25.',
        'Step 2: 0.25 is one fourth, so 1 meter holds 4 bows (0.25 + 0.25 + 0.25 + 0.25 = 1).',
        'Step 3: 6 meters hold 6 × 4 = 24 bows. Repeated subtraction agrees: taking 0.25 away from 6 twenty-four times leaves 0.',
        'Step 4: 6 ÷ 0.25 = 24 bows.'
      ],
      conceptSummary: 'Dividing a whole number by a decimal asks how many of the decimal fit into the whole. Repeated subtraction or an area model shows it.',
      commonMisconception: 'Dividing 6 by 25 without also moving the decimal point in the dividend, which gives 0.24 instead of 24.'
    }
  },

  // ==========================================
  // DOMAIN: NUMBER & OPERATIONS — FRACTIONS (NF)
  // Standard: NC.5.NF.1
  // ==========================================
  {
    id: 'nf1-01',
    standardCode: 'NC.5.NF.1',
    domainId: 'NF',
    prompt: 'Evaluate the sum. Express your answer as a simplified mixed number or fraction:',
    promptDetails: '2 3/4 + 1 5/8',
    options: labelOptions([
      // (3 + 5)/(4 + 8) = 8/12 = 2/3 added straight across, wholes 2 + 1 = 3.
      { text: '3 2/3', isCorrect: false, misconception: 'added-numerators-and-denominators' },
      // Denominators changed to 8 but 3/4 kept its numerator: 3/8 + 5/8 = 8/8 = 1; 3 + 1 = 4.
      { text: '4', isCorrect: false, misconception: 'common-denominator-numerator-not-scaled' },
      // Key: 3/4 = 6/8; 6/8 + 5/8 = 11/8 = 1 3/8; 2 + 1 + 1 3/8 = 4 3/8.
      { text: '4 3/8', isCorrect: true },
      // Doubled the numerator of the fraction already in eighths: (3 + 10)/8 = 13/8 = 1 5/8; 3 + 1 5/8.
      { text: '4 5/8', isCorrect: false, misconception: 'scaled-the-wrong-addend' },
    ]),
    calculatorAllowed: false,
    isStretch: false,
    difficulty: 'mastery',
    contentVersion: 2,
    explanation: {
      stepByStep: [
        'Step 1: 8 is a multiple of 4, so use eighths as the common denominator.',
        'Step 2: Convert 3/4 to eighths: 3/4 = 6/8 (multiply the top and bottom by 2). 5/8 stays the same.',
        'Step 3: Add the whole numbers: 2 + 1 = 3.',
        'Step 4: Add the fractions: 6/8 + 5/8 = 11/8.',
        'Step 5: Convert 11/8 to a mixed number: 1 3/8.',
        'Step 6: Combine: 3 + 1 3/8 = 4 3/8.'
      ],
      conceptSummary: 'Adding mixed numbers with related denominators by renaming to the larger denominator and regrouping an improper fraction sum.',
      commonMisconception: 'Adding across numerators and denominators, (3+5)/(4+8) = 8/12, which is incorrect.'
    }
  },
  {
    id: 'nf1-02',
    standardCode: 'NC.5.NF.1',
    domainId: 'NF',
    prompt: 'Solve the subtraction problem. Express your answer as a fraction or mixed number in simplest form:',
    promptDetails: '6 1/4 - 2 5/8',
    options: labelOptions([
      // No borrowing: 6 - 2 = 4 and the smaller fraction taken from the larger, 5/8 - 2/8 = 3/8.
      { text: '4 3/8', isCorrect: false, misconception: 'forgot-to-regroup' },
      // Key: 6 2/8 = 5 10/8; 5 10/8 - 2 5/8 = 3 5/8.
      { text: '3 5/8', isCorrect: true },
      // Denominators changed to 8 but 1/4 kept its numerator: 6 1/8 - 2 5/8 = 5 9/8 - 2 5/8 = 3 4/8 = 3 1/2.
      { text: '3 1/2', isCorrect: false, misconception: 'common-denominator-numerator-not-scaled' },
      // Borrowed 8/8 to make 10/8 but forgot to drop the 6 to 5: 6 10/8 - 2 5/8 = 4 5/8.
      { text: '4 5/8', isCorrect: false, misconception: 'borrowed-without-reducing-the-whole' },
    ]),
    calculatorAllowed: false,
    isStretch: false,
    difficulty: 'mastery',
    contentVersion: 2,
    explanation: {
      stepByStep: [
        'Step 1: 8 is a multiple of 4, so use eighths as the common denominator.',
        'Step 2: Convert 1/4 to eighths: 1/4 = 2/8. The expression is: 6 2/8 - 2 5/8.',
        'Step 3: Since 2/8 < 5/8, regroup 1 whole (8/8) from the 6: 6 2/8 = 5 + 8/8 + 2/8 = 5 10/8.',
        'Step 4: Subtract the whole numbers: 5 - 2 = 3.',
        'Step 5: Subtract the fractions: 10/8 - 5/8 = 5/8.',
        'Step 6: Combine: 3 5/8.'
      ],
      conceptSummary: 'Regrouping mixed numbers requires converting 1 borrowed whole into equivalent units of the common denominator.',
      commonMisconception: 'Subtracting the smaller fraction from the larger one (5/8 - 2/8 = 3/8) instead of regrouping, which gives 4 3/8.'
    }
  },
  {
    id: 'nf1-03',
    standardCode: 'NC.5.NF.1',
    domainId: 'NF',
    prompt: 'Kaitlyn had a 5-pound bag of flour. She used 1 3/8 pounds for a cake and 2 1/4 pounds for bread. How many pounds of flour are left in the bag?',
    options: labelOptions([
      // Found the total used and stopped there.
      { text: '3 5/8 pounds', isCorrect: false, misconception: 'forgot-the-final-step' },
      // Added only the whole 2, dropping the 1/4: 5 - 3 3/8 = 1 5/8.
      { text: '1 5/8 pounds', isCorrect: false, misconception: 'dropped-a-fraction-part' },
      // Rescaled 1/4 to 4/8 instead of 2/8: 3/8 + 4/8 = 7/8; 5 - 3 7/8 = 1 1/8.
      { text: '1 1/8 pounds', isCorrect: false, misconception: 'used-the-denominator-as-the-new-numerator' },
      { text: '1 3/8 pounds', isCorrect: true },
    ]),
    calculatorAllowed: false,
    isStretch: false,
    difficulty: 'mastery',
    explanation: {
      stepByStep: [
        'Step 1: Find total flour used: 1 3/8 + 2 1/4.',
        'Step 2: Common denominator is 8. 2 1/4 = 2 2/8.',
        'Step 3: Total used = 1 3/8 + 2 2/8 = 3 5/8 pounds.',
        'Step 4: Subtract from starting 5 pounds: 5 - 3 5/8.',
        'Step 5: Rewrite 5 as 4 8/8. 4 8/8 - 3 5/8 = 1 3/8 pounds.'
      ],
      conceptSummary: 'Two-step fraction word problem combining addition of unlike fractions and subtraction from a whole integer.',
      commonMisconception: 'Stopping after finding the total used (3 5/8) instead of finding the remainder.'
    }
  },
  {
    id: 'nf1-04',
    standardCode: 'NC.5.NF.1',
    domainId: 'NF',
    prompt: 'Using benchmark fractions (0, 1/2, 1), which is the best estimate of the sum 7/12 + 5/6?',
    options: labelOptions([
      // Rounded 5/6 down to 1/2 (it is closer to 1): 1/2 + 1/2 = 1.
      { text: '1', isCorrect: false, misconception: 'estimated-to-the-wrong-benchmark' },
      // Key: 7/12 is close to 1/2 and 5/6 is close to 1, so 1/2 + 1 = 1 1/2.
      { text: '1 1/2', isCorrect: true },
      // Rounded 7/12 up to 1 (it is closer to 1/2): 1 + 1 = 2.
      { text: '2', isCorrect: false, misconception: 'estimated-to-the-wrong-benchmark' },
      // (7 + 5)/(12 + 6) = 12/18 = 2/3: added straight across.
      { text: '2/3', isCorrect: false, misconception: 'added-numerators-and-denominators' },
    ]),
    calculatorAllowed: false,
    isStretch: false,
    difficulty: 'advanced',
    contentVersion: 2,
    explanation: {
      stepByStep: [
        'Step 1: 7/12 is slightly greater than 6/12, so it is approximately 1/2.',
        'Step 2: 5/6 is very close to 6/6, so it is approximately 1.',
        'Step 3: Sum of benchmarks: 1/2 + 1 = 1 1/2.',
        'Step 4: Reasonableness check: each addend is more than 1/2, so the sum must be more than 1. That rules out 1 and 2/3.'
      ],
      conceptSummary: 'Benchmark estimation tests number sense to check if computed answers are mathematically reasonable.',
      commonMisconception: 'Adding across, (7+5)/(12+6) = 2/3, gives a sum smaller than either addend, which cannot be right.'
    }
  },

  // Standard: NC.5.NF.3
  {
    id: 'nf3-01',
    standardCode: 'NC.5.NF.3',
    domainId: 'NF',
    prompt: 'Five friends share 3 large pizzas equally. Which expression and fraction shows how much pizza each friend receives?',
    options: labelOptions([
      { text: '3 ÷ 5 = 3/5 of a pizza', isCorrect: true },
      // Divided the number of sharers by the amount being shared.
      { text: '5 ÷ 3 = 1 2/3 pizzas', isCorrect: false, misconception: 'reversed-dividend-and-divisor' },
      { text: '3 × 5 = 15 slices', isCorrect: false, misconception: 'multiplied-instead-of-divided' },
      { text: '5 - 3 = 2 pizzas', isCorrect: false, misconception: 'subtracted-instead-of-divided' },
    ]),
    calculatorAllowed: false,
    isStretch: false,
    difficulty: 'mastery',
    explanation: {
      stepByStep: [
        'Step 1: Identify the quantity being shared (dividend / numerator): 3 pizzas.',
        'Step 2: Identify the number of shares (divisor / denominator): 5 friends.',
        'Step 3: Division statement is 3 ÷ 5.',
        'Step 4: As a fraction, 3 ÷ 5 = 3/5 pizza per friend.'
      ],
      conceptSummary: 'A fraction a/b directly represents the division a ÷ b where a is the shared item and b is the number of recipients.',
      commonMisconception: 'Dividing 5 by 3 because 5 is larger, which would give each friend more pizza than exists in total.'
    }
  },
  {
    id: 'nf3-02',
    standardCode: 'NC.5.NF.3',
    domainId: 'NF',
    prompt: 'A chef divides an 18-pound block of cheddar cheese equally into 8 portions for catering orders. How many pounds of cheese are in each portion? Express your answer as a simplified mixed number.',
    options: labelOptions([
      // 18 ÷ 8 = 2 R 2; dropped the remainder instead of making it the fraction.
      { text: '2 pounds', isCorrect: false, misconception: 'ignored-remainder' },
      // 8 ÷ 18 = 8/18 = 4/9: divided the portions by the pounds.
      { text: '4/9 pound', isCorrect: false, misconception: 'reversed-dividend-and-divisor' },
      { text: '2 1/4 pounds', isCorrect: true },
      // Wrote the long-division result "2 R 2" as the decimal 2.2.
      { text: '2.2 pounds', isCorrect: false, misconception: 'remainder-written-as-a-decimal' },
    ]),
    calculatorAllowed: false,
    isStretch: false,
    difficulty: 'mastery',
    explanation: {
      stepByStep: [
        'Step 1: 18 pounds shared among 8 portions: 18 ÷ 8 = 18/8.',
        'Step 2: Convert to mixed number: 18 ÷ 8 = 2 with remainder 2 -> 2 2/8.',
        'Step 3: Simplify the fractional part: 2/8 = 1/4.',
        'Step 4: The answer is 2 1/4 pounds.'
      ],
      conceptSummary: 'Division of whole numbers resulting in mixed numbers in simplified form.',
      commonMisconception: 'Ignoring the remainder entirely (2 pounds) or writing the leftover as a decimal (2.2 pounds) instead of converting it to the fraction 1/4.'
    }
  },

  // Standard: NC.5.NF.4
  {
    id: 'nf4-01',
    standardCode: 'NC.5.NF.4',
    domainId: 'NF',
    prompt: 'A rectangular desktop measures 4 1/2 feet long and 2 2/3 feet wide. What is the area of the desktop in square feet? Express your answer as a whole number or mixed number.',
    options: labelOptions([
      // 4 × 2 = 8 and 1/2 × 2/3 = 1/3, multiplied as separate pieces.
      { text: '8 1/3', isCorrect: false, misconception: 'multiplied-whole-and-fraction-parts-separately' },
      // 2 × (4 1/2 + 2 2/3) = 14 1/3: found the perimeter instead of the area.
      { text: '14 1/3', isCorrect: false, misconception: 'used-perimeter-formula' },
      // 4 1/2 -> 5/2 and 2 2/3 -> 4/3 by adding whole to numerator; 5/2 × 4/3 = 20/6.
      { text: '3 1/3', isCorrect: false, misconception: 'converted-mixed-number-by-adding' },
      { text: '12', isCorrect: true },
    ]),
    calculatorAllowed: false,
    isStretch: false,
    difficulty: 'mastery',
    explanation: {
      stepByStep: [
        'Step 1: Area of rectangle = length × width = 4 1/2 × 2 2/3.',
        'Step 2: Convert both mixed numbers to improper fractions: 4 1/2 = 9/2, and 2 2/3 = 8/3.',
        'Step 3: Multiply fractions: (9/2) × (8/3) = (9 × 8) / (2 × 3) = 72 / 6.',
        'Step 4: 72 ÷ 6 = 12 square feet.'
      ],
      conceptSummary: 'Fraction multiplication with area models requires converting mixed numbers to improper fractions.',
      commonMisconception: 'Multiplying 4 × 2 = 8 and 1/2 × 2/3 = 2/6 to get 8 1/3. You must convert to improper fractions first!'
    }
  },
  {
    id: 'nf4-02',
    standardCode: 'NC.5.NF.4',
    domainId: 'NF',
    prompt: 'Without multiplying, choose the statement that correctly compares the product to the factor 16:\n\n16 × 7/8',
    options: labelOptions([
      { text: 'The product is less than 16 because 7/8 is less than 1', isCorrect: true },
      { text: 'The product is greater than 16 because multiplying always increases value', isCorrect: false, misconception: 'multiplication-always-increases' },
      { text: 'The product is equal to 16 because 7/8 is close to 1', isCorrect: false, misconception: 'rounded-the-factor-to-one' },
      // Read the numerator 7 as an amount to take away from 16.
      { text: 'The product is 7 less than 16', isCorrect: false, misconception: 'used-the-numerator-as-a-whole-number' },
    ]),
    calculatorAllowed: false,
    isStretch: false,
    difficulty: 'mastery',
    contentVersion: 2,
    explanation: {
      stepByStep: [
        'Step 1: Examine the multiplier: 7/8 is less than 1 whole (7/8 < 1).',
        'Step 2: Multiplying a non-zero quantity by a fraction less than 1 scales the quantity down.',
        'Step 3: Therefore, 16 × 7/8 will be strictly less than 16.'
      ],
      conceptSummary: 'Scaling reasoning: multiplying by a factor < 1 reduces the original value.',
      commonMisconception: 'Believing the 4th-grade rule of thumb that "multiplication always makes numbers bigger".'
    }
  },
  {
    id: 'nf4-03',
    standardCode: 'NC.5.NF.4',
    domainId: 'NF',
    prompt: 'Solve and simplify: 3/4 × 2/3',
    options: labelOptions([
      // (3 + 2)/(4 + 3) = 5/7: added straight across instead of multiplying.
      { text: '5/7', isCorrect: false, misconception: 'added-numerators-and-denominators' },
      // Key: (3 × 2)/(4 × 3) = 6/12 = 1/2.
      { text: '1/2', isCorrect: true },
      // (3 × 3)/(4 × 2) = 9/8: multiplied crosswise instead of straight across.
      { text: '9/8', isCorrect: false, misconception: 'multiplied-crosswise' },
      // Found the common denominator 12 and added: 9/12 + 8/12 = 17/12.
      { text: '17/12', isCorrect: false, misconception: 'added-instead-of-multiplied' },
    ]),
    calculatorAllowed: false,
    isStretch: false,
    difficulty: 'mastery',
    contentVersion: 2,
    explanation: {
      stepByStep: [
        'Step 1: Multiply numerators: 3 × 2 = 6.',
        'Step 2: Multiply denominators: 4 × 3 = 12.',
        'Step 3: Simplify 6/12 by dividing numerator and denominator by 6: 6/12 = 1/2.',
        'Step 4: Alternatively, cross-cancel first: the 3 on top and the 3 on the bottom cancel, and the 2 on top and the 4 on the bottom become 1 and 2. That leaves (1 × 1) / (2 × 1) = 1/2.'
      ],
      conceptSummary: 'Multiplying proper fractions and simplifying by finding common factors.',
      commonMisconception: 'Finding a common denominator and adding (9/12 + 8/12 = 17/12) instead of multiplying.'
    }
  },

  // Standard: NC.5.NF.7
  {
    id: 'nf7-01',
    standardCode: 'NC.5.NF.7',
    domainId: 'NF',
    prompt: 'A chef has 6 pounds of ground beef. Each burger patty requires 1/4 pound of meat. How many patties can the chef make?',
    options: labelOptions([
      // 6 × 1/4 = 1 1/2: answered "what is 1/4 of 6" instead of "how many 1/4s in 6".
      { text: '1 1/2 patties', isCorrect: false, misconception: 'multiplied-instead-of-divided' },
      // Found that 1 pound holds 4 fourths and never scaled up to 6 pounds.
      { text: '4 patties', isCorrect: false, misconception: 'forgot-to-scale-by-the-whole-number' },
      { text: '24 patties', isCorrect: true },
      // (1/4) ÷ 6 = 1/24: divided the patty size by the pounds.
      { text: '1/24 of a patty', isCorrect: false, misconception: 'reversed-dividend-and-divisor' },
    ]),
    calculatorAllowed: false,
    isStretch: false,
    difficulty: 'mastery',
    explanation: {
      stepByStep: [
        'Step 1: Division expression: 6 ÷ (1/4).',
        'Step 2: This asks: "How many 1/4s are in 6 wholes?"',
        'Step 3: Each 1 pound contains 4 fourths. In 6 pounds, there are 6 × 4 = 24 fourths.',
        'Step 4: 6 ÷ (1/4) = 24 patties.'
      ],
      conceptSummary: 'Dividing a whole number by a unit fraction produces a larger whole number quotient.',
      commonMisconception: 'Multiplying 6 × 1/4 = 1.5, which answers "what is 1/4 of 6" rather than "how many 1/4s in 6".'
    }
  },
  {
    id: 'nf7-02',
    standardCode: 'NC.5.NF.7',
    domainId: 'NF',
    prompt: 'Lillian has 1/5 of a bottle of juice. She divides it equally among herself and 2 friends (3 people total). What fraction of the original full bottle of juice does each person receive?',
    options: labelOptions([
      // 1/5 × 3 = 3/5: multiplied instead of dividing.
      { text: '3/5', isCorrect: false, misconception: 'multiplied-instead-of-divided' },
      // (1/5) ÷ 2 = 1/10: shared among the 2 friends only, leaving Lillian out.
      { text: '1/10', isCorrect: false, misconception: 'divided-by-wrong-count' },
      // 1/(5 + 3) = 1/8: added the 3 to the denominator instead of multiplying.
      { text: '1/8', isCorrect: false, misconception: 'added-to-the-denominator-instead-of-multiplying' },
      { text: '1/15', isCorrect: true },
    ]),
    calculatorAllowed: false,
    isStretch: false,
    difficulty: 'mastery',
    explanation: {
      stepByStep: [
        'Step 1: Starting amount is 1/5 bottle of juice.',
        'Step 2: Shared equally among 3 people: (1/5) ÷ 3.',
        'Step 3: Dividing 1/5 into 3 equal shares means each person gets 1/3 of the 1/5.',
        'Step 4: (1/5) × (1/3) = 1/15 of the bottle.'
      ],
      conceptSummary: 'Dividing a unit fraction by a whole number yields an even smaller unit fraction: (1/d) ÷ W = 1/(d × W).',
      commonMisconception: 'Dividing by 2 instead of 3 ("herself and 2 friends" = 3 people).'
    }
  },
  {
    id: 'nf7-03',
    standardCode: 'NC.5.NF.7',
    domainId: 'NF',
    prompt: 'A ribbon is 5 yards long. It is cut into pieces that are each 1/6 yard long. How many pieces are there?',
    options: labelOptions([
      // 1 yard holds 6 pieces; never scaled up to 5 yards.
      { text: '6 pieces', isCorrect: false, misconception: 'forgot-to-scale-by-the-whole-number' },
      // 5 × 1/6 = 5/6: multiplied instead of dividing.
      { text: '5/6 of a piece', isCorrect: false, misconception: 'multiplied-instead-of-divided' },
      // Key: 5 ÷ 1/6 = 5 × 6 = 30.
      { text: '30 pieces', isCorrect: true },
      // (1/6) ÷ 5 = 1/30: divided the piece size by the length.
      { text: '1/30 of a piece', isCorrect: false, misconception: 'inverted-wrong-factor' },
    ]),
    calculatorAllowed: false,
    isStretch: false,
    difficulty: 'advanced',
    contentVersion: 2,
    explanation: {
      stepByStep: [
        'Step 1: 5 ÷ 1/6 asks how many sixths fit into 5 yards.',
        'Step 2: Each yard holds 6 pieces that are 1/6 yard long.',
        'Step 3: 5 yards hold 5 × 6 = 30 pieces.',
        'Step 4: 5 ÷ 1/6 = 30 pieces.'
      ],
      conceptSummary: 'Dividing a whole number by a unit fraction counts how many of those pieces fit, so the answer is larger than the whole number.',
      commonMisconception: 'Stopping at 6 pieces (the number in 1 yard) and never scaling up to 5 yards.'
    }
  },

  // ==========================================
  // DOMAIN: MEASUREMENT & DATA (MD)
  // Standard: NC.5.MD.1
  // ==========================================
  {
    id: 'md1-01',
    standardCode: 'NC.5.MD.1',
    domainId: 'MD',
    prompt: 'A runner completes a 6-kilometer road race. How many meters did the runner travel?',
    options: labelOptions([
      // Used 100 meters per kilometer: 6 × 100.
      { text: '600 meters', isCorrect: false, misconception: 'used-wrong-conversion-factor' },
      { text: '6,000 meters', isCorrect: true },
      // Multiplied by 10,000 instead of 1,000.
      { text: '60,000 meters', isCorrect: false, misconception: 'wrong-power-of-ten' },
      // 6 ÷ 1,000: divided when going from the larger unit to the smaller unit.
      { text: '0.006 meters', isCorrect: false, misconception: 'unit-conversion-inverted' },
    ]),
    calculatorAllowed: false,
    isStretch: false,
    difficulty: 'mastery',
    explanation: {
      stepByStep: [
        'Step 1: 1 kilometer = 1,000 meters.',
        'Step 2: Converting from larger unit (km) to smaller unit (m) requires multiplication.',
        'Step 3: 6 × 1,000 = 6,000 meters.'
      ],
      conceptSummary: 'Metric length conversion using powers of 10.',
      commonMisconception: 'Using 100 instead of 1,000 (confusing meters in a kilometer with centimeters in a meter).'
    }
  },
  {
    id: 'md1-02',
    standardCode: 'NC.5.MD.1',
    domainId: 'MD',
    prompt: 'A school cafeteria prepares 5 gallons of vegetable soup. They serve the soup in 1-cup bowls. How many full 1-cup bowls can they serve?',
    options: labelOptions([
      // Used 4 cups per gallon (confused quarts with cups): 5 × 4.
      { text: '20 bowls', isCorrect: false, misconception: 'used-wrong-conversion-factor' },
      // Stopped at pints: 5 gallons = 40 pints, then reported pints as cups.
      { text: '40 bowls', isCorrect: false, misconception: 'stopped-at-an-intermediate-unit' },
      { text: '80 bowls', isCorrect: true },
      // Doubled once too often (gal -> qt -> pt -> cup -> half cup): 5 × 64.
      { text: '320 bowls', isCorrect: false, misconception: 'applied-an-extra-conversion-step' },
    ]),
    calculatorAllowed: false,
    isStretch: false,
    difficulty: 'mastery',
    explanation: {
      stepByStep: [
        'Step 1: Convert gallons to cups using customary conversion factors: 1 gallon = 4 quarts.',
        'Step 2: 1 quart = 2 pints, so 1 gallon = 4 × 2 = 8 pints.',
        'Step 3: 1 pint = 2 cups, so 1 gallon = 8 × 2 = 16 cups.',
        'Step 4: For 5 gallons: 5 × 16 = 80 cups.'
      ],
      conceptSummary: 'Multi-step customary capacity conversion (gallons -> quarts -> pints -> cups).',
      commonMisconception: 'Thinking there are 4 cups in a gallon (confusing quarts with cups).'
    }
  },
  {
    id: 'md1-03',
    standardCode: 'NC.5.MD.1',
    domainId: 'MD',
    prompt: 'A carpenter has a board that is 4 yards 2 feet long. She cuts off a piece that is 5 feet 8 inches long. What is the length of the remaining board in inches?',
    options: labelOptions([
      // 168 + 68: added the cut piece instead of removing it.
      { text: '236 inches', isCorrect: false, misconception: 'added-instead-of-subtracted' },
      // Read "5 feet 8 inches" as 58 inches: 168 - 58.
      { text: '110 inches', isCorrect: false, misconception: 'concatenated-the-mixed-units' },
      // Converted only the 4 yards (144 inches) and left out the 2 feet: 144 - 68.
      { text: '76 inches', isCorrect: false, misconception: 'omitted-part-of-the-measurement' },
      { text: '100 inches', isCorrect: true },
    ]),
    calculatorAllowed: true,
    isStretch: true,
    difficulty: 'stretch',
    explanation: {
      stepByStep: [
        'Step 1: Convert initial board length to inches. 1 yard = 36 inches; 1 foot = 12 inches.',
        'Step 2: 4 yards = 4 × 36 = 144 inches. 2 feet = 2 × 12 = 24 inches. Total initial = 144 + 24 = 168 inches.',
        'Step 3: Convert cut piece to inches: 5 feet = 5 × 12 = 60 inches. Plus 8 inches = 68 inches.',
        'Step 4: Subtract: 168 - 68 = 100 inches.'
      ],
      conceptSummary: 'Multi-step customary length conversions with mixed units.',
      commonMisconception: 'Mixing up inches and feet conversion factors.'
    }
  },

  // Standard: NC.5.MD.2
  {
    id: 'md2-01',
    standardCode: 'NC.5.MD.2',
    domainId: 'MD',
    prompt: 'Students in a science club measured the lengths of pencil stubs to the nearest 1/8 inch:\n\n1/8, 1/4, 3/8, 1/4, 1/2, 3/8, 1/8, 1/4\n\nWhat is the total length in inches of all the pencil stubs that measured EXACTLY 1/4 inch?',
    options: labelOptions([
      { text: '3/4 inch', isCorrect: true },
      // Reported the measurement itself rather than the total of the three stubs.
      { text: '1/4 inch', isCorrect: false, misconception: 'reported-the-measurement-not-the-total' },
      // Counted only 2 of the three 1/4-inch stubs: 2 × 1/4.
      { text: '1/2 inch', isCorrect: false, misconception: 'miscounted-the-frequency' },
      // Added all eight stubs: 18/8 = 2 1/4 inches.
      { text: '2 1/4 inches', isCorrect: false, misconception: 'summed-all-data-points' },
    ]),
    calculatorAllowed: false,
    isStretch: false,
    difficulty: 'mastery',
    explanation: {
      stepByStep: [
        'Step 1: Count how many pencil stubs measure exactly 1/4 inch in the data list: there are 3 stubs.',
        'Step 2: Calculate total length: 3 × 1/4 = 3/4 inch.'
      ],
      conceptSummary: 'Interpreting line plot frequency and computing subtotal for a given measurement.',
      commonMisconception: 'Summing all stubs rather than only those measuring 1/4 inch.'
    }
  },
  {
    id: 'md2-02',
    standardCode: 'NC.5.MD.2',
    domainId: 'MD',
    prompt: 'A line plot records the weights of 6 seed packages in ounces:\n3/8, 1/2, 3/4, 3/8, 7/8, 1/2\n\nWhat is the difference between the heaviest seed package and the lightest seed package? Express as a fraction in simplest form.',
    options: labelOptions([
      // Totalled all six packages (27/8) instead of finding the range.
      { text: '3 3/8 ounces', isCorrect: false, misconception: 'summed-all-data-points' },
      // 7/8 + 3/8 = 10/8: added the extremes instead of subtracting.
      { text: '1 1/4 ounces', isCorrect: false, misconception: 'added-instead-of-subtracted' },
      { text: '1/2 ounce', isCorrect: true },
      // Took 3/4 as the heaviest package: 3/4 - 3/8 = 3/8.
      { text: '3/8 ounce', isCorrect: false, misconception: 'misidentified-the-extreme' },
    ]),
    calculatorAllowed: false,
    isStretch: false,
    difficulty: 'mastery',
    explanation: {
      stepByStep: [
        'Step 1: Convert all fractions to eighths to compare: 3/8, 4/8, 6/8, 3/8, 7/8, 4/8.',
        'Step 2: Heaviest package = 7/8 ounce.',
        'Step 3: Lightest package = 3/8 ounce.',
        'Step 4: Difference = 7/8 - 3/8 = 4/8.',
        'Step 5: Simplify 4/8 = 1/2 ounce.'
      ],
      conceptSummary: 'Finding range on fractional line plot data and simplifying fractions.',
      commonMisconception: 'Leaving answer as 4/8 without simplifying.'
    }
  },

  // Standard: NC.5.MD.4
  {
    id: 'md4-01',
    standardCode: 'NC.5.MD.4',
    domainId: 'MD',
    prompt: 'A right rectangular prism is completely packed without gaps using 1-centimeter unit cubes. The base layer contains 5 rows with 8 cubes in each row. The prism is packed 4 layers tall. What is the volume of the prism in cubic centimeters?',
    options: labelOptions([
      // 5 × 8 = 40: counted the base layer only and never used the 4 layers.
      { text: '40 cubic centimeters', isCorrect: false, misconception: 'used-area-not-volume' },
      { text: '160 cubic centimeters', isCorrect: true },
      // 40 + 4 = 44: added the layers instead of multiplying by them.
      { text: '44 cubic centimeters', isCorrect: false, misconception: 'added-instead-of-multiplied' },
      // 5 + 8 + 4 = 17: added the dimensions.
      { text: '17 cubic centimeters', isCorrect: false, misconception: 'used-perimeter-formula' },
    ]),
    calculatorAllowed: false,
    isStretch: false,
    difficulty: 'mastery',
    explanation: {
      stepByStep: [
        'Step 1: Cubes in the bottom layer: 5 rows × 8 cubes = 40 unit cubes.',
        'Step 2: Number of identical layers: 4.',
        'Step 3: Total volume = 40 × 4 = 160 unit cubes = 160 cm³.'
      ],
      conceptSummary: 'Volume by packing unit cubes: Base Area (B) × Height (h).',
      commonMisconception: 'Adding layers instead of multiplying (40 + 4 = 44).'
    }
  },

  // Standard: NC.5.MD.5
  {
    id: 'md5-01',
    standardCode: 'NC.5.MD.5',
    domainId: 'MD',
    prompt: 'A shipping carton has a length of 15 inches, a width of 12 inches, and a height of 8 inches. What is the volume of the carton in cubic inches?',
    options: labelOptions([
      // 15 × 12 = 180: found the base area and stopped.
      { text: '180 cubic inches', isCorrect: false, misconception: 'used-area-not-volume' },
      // 15 + 12 + 8 = 35: added the dimensions.
      { text: '35 cubic inches', isCorrect: false, misconception: 'used-perimeter-formula' },
      // 2(180 + 120 + 96) = 792: found surface area instead of volume.
      { text: '792 cubic inches', isCorrect: false, misconception: 'computed-surface-area' },
      { text: '1,440 cubic inches', isCorrect: true },
    ]),
    calculatorAllowed: true,
    isStretch: false,
    difficulty: 'mastery',
    explanation: {
      stepByStep: [
        'Step 1: Formula for volume of a rectangular prism is V = l × w × h.',
        'Step 2: Multiply length and width: 15 × 12 = 180 square inches.',
        'Step 3: Multiply base area by height: 180 × 8 = 1,440 cubic inches.'
      ],
      conceptSummary: 'Standard volume formula application V = l × w × h.',
      commonMisconception: 'Arithmetic error when multiplying 180 × 8.'
    }
  },
  {
    id: 'md5-02',
    standardCode: 'NC.5.MD.5',
    domainId: 'MD',
    prompt: 'A rectangular aquarium has a base area of 240 square inches. If the aquarium has a height of 15 inches, what is its volume in cubic inches?',
    options: labelOptions([
      { text: '3,600 cubic inches', isCorrect: true },
      // 240 + 15 = 255: added base area and height.
      { text: '255 cubic inches', isCorrect: false, misconception: 'added-instead-of-multiplied' },
      // 240 ÷ 15 = 16: divided instead of multiplying.
      { text: '16 cubic inches', isCorrect: false, misconception: 'divided-instead-of-multiplied' },
      // 240 × 240 = 57,600: squared the base area rather than using B × h.
      { text: '57,600 cubic inches', isCorrect: false, misconception: 'squared-the-base-area' },
    ]),
    calculatorAllowed: true,
    isStretch: false,
    difficulty: 'mastery',
    explanation: {
      stepByStep: [
        'Step 1: Recall the volume formula relating base area B and height h: V = B × h.',
        'Step 2: V = 240 × 15.',
        'Step 3: 240 × 10 = 2,400; 240 × 5 = 1,200. 2,400 + 1,200 = 3,600 cubic inches.'
      ],
      conceptSummary: 'Applying V = B × h directly when base area is given.',
      commonMisconception: 'Trying to square or divide 240, not realizing base area is already l × w.'
    }
  },
  {
    id: 'md5-03',
    standardCode: 'NC.5.MD.5',
    domainId: 'MD',
    prompt: 'A solid wooden step structure is made of two joined rectangular prisms. Prism 1 measures 10 inches long, 6 inches wide, and 4 inches high. Prism 2 sits next to it and measures 8 inches long, 6 inches wide, and 7 inches high. What is the total combined volume of the wooden structure in cubic inches?',
    options: labelOptions([
      // 10 × 6 × 4 = 240: found Prism 1 only and never added Prism 2.
      { text: '240 cubic inches', isCorrect: false, misconception: 'omitted-one-part-of-composite' },
      // 10 + 6 + 4 + 8 + 6 + 7 = 41: added every dimension.
      { text: '41 cubic inches', isCorrect: false, misconception: 'used-perimeter-formula' },
      { text: '576 cubic inches', isCorrect: true },
      // 10 × 6 × 4 × 8 × 7 = 13,440: multiplied the numbers together instead of decomposing.
      { text: '13,440 cubic inches', isCorrect: false, misconception: 'multiplied-all-dimensions-together' },
    ]),
    calculatorAllowed: true,
    isStretch: true,
    difficulty: 'stretch',
    explanation: {
      stepByStep: [
        'Step 1: Calculate volume of Prism 1: 10 × 6 × 4 = 240 cubic inches.',
        'Step 2: Calculate volume of Prism 2: 8 × 6 × 7 = 336 cubic inches.',
        'Step 3: Add the two non-overlapping volumes: 240 + 336 = 576 cubic inches.'
      ],
      conceptSummary: 'Additive volume of composite rectangular prisms.',
      commonMisconception: 'Multiplying all numbers together (10 × 6 × 4 × 8 × 7) instead of decomposing into two distinct prisms.'
    }
  },

  // ==========================================
  // DOMAIN: GEOMETRY (G)
  // Standard: NC.5.G.1
  // ==========================================
  {
    id: 'g1-01',
    standardCode: 'NC.5.G.1',
    domainId: 'G',
    prompt: 'Which statement correctly describes how to plot the point (4, 7) on a coordinate plane starting from the origin (0, 0)?',
    options: labelOptions([
      // Moved 7 across and 4 up, landing on (7, 4).
      { text: 'Move 7 units right along the x-axis, then 4 units up parallel to the y-axis', isCorrect: false, misconception: 'coordinates-reversed' },
      { text: 'Move 4 units right along the x-axis, then 7 units up parallel to the y-axis', isCorrect: true },
      // Treated the first coordinate as the vertical move, again landing on (7, 4).
      { text: 'Move 4 units up along the y-axis, then 7 units right', isCorrect: false, misconception: 'axes-swapped' },
      // 4 + 7 = 11: added the two coordinates into a single distance.
      { text: 'Move 11 units diagonally from origin', isCorrect: false, misconception: 'added-the-coordinates' },
    ]),
    calculatorAllowed: false,
    isStretch: false,
    difficulty: 'mastery',
    explanation: {
      stepByStep: [
        'Step 1: In the ordered pair (x, y), x represents the first coordinate and y represents the second coordinate.',
        'Step 2: Here x = 4, so move 4 units horizontally to the right from (0,0).',
        'Step 3: y = 7, so move 7 units vertically up.'
      ],
      conceptSummary: 'Coordinate plane plotting: (x, y) = (horizontal distance, vertical distance).',
      commonMisconception: 'Reversing the order of coordinates (plotting 4 up and 7 right).'
    }
  },
  {
    id: 'g1-02',
    standardCode: 'NC.5.G.1',
    domainId: 'G',
    prompt: 'Point J is located at (2, 5) and Point K is located at (8, 5) on a coordinate grid. What is the distance in units between Point J and Point K?',
    options: labelOptions([
      // 8 + 2 = 10: added the x-coordinates instead of subtracting.
      { text: '10 units', isCorrect: false, misconception: 'added-the-coordinates' },
      // Counted the grid marks 2, 3, 4, 5, 6, 7, 8 instead of the 6 gaps between them.
      { text: '7 units', isCorrect: false, misconception: 'counted-endpoints-not-intervals' },
      // 8 - 5 = 3: subtracted a y-coordinate from an x-coordinate.
      { text: '3 units', isCorrect: false, misconception: 'subtracted-the-wrong-coordinates' },
      { text: '6 units', isCorrect: true },
    ]),
    calculatorAllowed: false,
    isStretch: false,
    difficulty: 'mastery',
    explanation: {
      stepByStep: [
        'Step 1: Both points have the same y-coordinate (y = 5), meaning they lie on the same horizontal line.',
        'Step 2: The horizontal distance is the difference between their x-coordinates: 8 - 2 = 6 units.'
      ],
      conceptSummary: 'Distance between horizontal or vertical points on the coordinate grid.',
      commonMisconception: 'Adding the x-coordinates (8 + 2 = 10) instead of subtracting.'
    }
  },
  {
    id: 'g1-03',
    standardCode: 'NC.5.G.1',
    domainId: 'G',
    prompt: 'Three vertices of a rectangle are plotted on a coordinate grid at (3, 2), (9, 2), and (9, 7). What are the coordinates (x, y) of the fourth vertex?',
    options: labelOptions([
      { text: '(3, 7)', isCorrect: true },
      // Found the right pair of numbers and wrote them as (y, x).
      { text: '(7, 3)', isCorrect: false, misconception: 'coordinates-reversed' },
      // Took the missing x from the y-value 2 shared by the bottom two vertices.
      { text: '(2, 7)', isCorrect: false, misconception: 'reused-a-coordinate-from-the-wrong-axis' },
      // Reported the side lengths (6 wide, 5 tall) as the coordinates.
      { text: '(6, 5)', isCorrect: false, misconception: 'used-the-side-lengths-as-coordinates' },
    ]),
    calculatorAllowed: false,
    isStretch: true,
    difficulty: 'stretch',
    explanation: {
      stepByStep: [
        'Step 1: A rectangle has opposite sides that are equal and parallel.',
        'Step 2: Bottom horizontal side runs from (3, 2) to (9, 2) (length = 6).',
        'Step 3: Right vertical side runs from (9, 2) to (9, 7) (height = 5).',
        'Step 4: The top horizontal side must run from (9, 7) leftward by 6 units to (3, 7).',
        'Step 5: The left vertical side connects (3, 2) and (3, 7).'
      ],
      conceptSummary: 'Coordinate geometry: using properties of rectangles to locate missing vertices.',
      commonMisconception: 'Miscalculating the x-coordinate as 2 or y-coordinate as 9.'
    }
  },

  // Standard: NC.5.G.3
  {
    id: 'g3-01',
    standardCode: 'NC.5.G.3',
    domainId: 'G',
    prompt: 'Which statement about two-dimensional figures is ALWAYS true based on the geometric hierarchy?',
    options: labelOptions([
      // Reversed the direction of containment: every square is a rectangle, not the reverse.
      { text: 'Every rectangle is a square', isCorrect: false, misconception: 'hierarchy-inverted' },
      // Applied a rectangle's defining property to the whole parent category.
      { text: 'Every parallelogram has four right angles', isCorrect: false, misconception: 'property-inherited-upward' },
      { text: 'Every square is both a rectangle and a rhombus', isCorrect: true },
      // Denied a containment that the hierarchy requires.
      { text: 'A trapezoid can never be a quadrilateral', isCorrect: false, misconception: 'hierarchy-too-narrow' },
    ]),
    calculatorAllowed: false,
    isStretch: false,
    difficulty: 'mastery',
    explanation: {
      stepByStep: [
        'Step 1: A square has 4 equal sides (satisfying the definition of a rhombus).',
        'Step 2: A square has 4 right angles (satisfying the definition of a rectangle).',
        'Step 3: Therefore, every square belongs to both subcategories: rectangles and rhombuses.'
      ],
      conceptSummary: 'Subcategory hierarchy: squares inherit all properties of both rhombuses and rectangles.',
      commonMisconception: 'Thinking that being a rectangle means a shape cannot also be a rhombus.'
    }
  },
  {
    id: 'g3-02',
    standardCode: 'NC.5.G.3',
    domainId: 'G',
    prompt: 'A student claims: "All parallelograms are trapezoids, but not all trapezoids are parallelograms." Under North Carolina\'s standard course of study definition (where a trapezoid is a quadrilateral with exactly one pair of parallel sides), is the student\'s claim true or false?',
    // Solved: a parallelogram has two pairs of parallel sides, which is not
    // exactly one pair, so no parallelogram is a trapezoid (NC-R2). The first
    // half of the claim is false, so the whole claim is false.
    options: labelOptions([
      // Applied the inclusive definition ("at least one pair of parallel sides"), which NC does not use.
      { text: 'True, because parallelograms have 2 pairs of parallel sides, which satisfies the requirement of having at least 1 pair', isCorrect: false, misconception: 'inclusive-trapezoid-definition' },
      { text: 'False, because a parallelogram has 2 pairs of parallel sides, and a trapezoid has exactly 1 pair', isCorrect: true },
      // Right verdict, wrong reason: denied that parallelograms sit inside the quadrilateral category at all.
      { text: 'False, because parallelograms are not quadrilaterals', isCorrect: false, misconception: 'hierarchy-too-narrow' },
      // A quadrilateral with no parallel sides is not a trapezoid either.
      { text: 'True, because all four-sided shapes are trapezoids', isCorrect: false, misconception: 'hierarchy-too-broad' },
    ]),
    calculatorAllowed: false,
    isStretch: false,
    difficulty: 'mastery',
    contentVersion: 2, // NC-R2: the key flipped from the inclusive to the exclusive definition
    explanation: {
      stepByStep: [
        'Step 1: In North Carolina (exclusive definition), a trapezoid is defined as having exactly one pair of parallel sides.',
        'Step 2: A parallelogram has two pairs of parallel sides, which is not exactly one pair.',
        'Step 3: So a parallelogram is not a trapezoid, and the claim is false. Trapezoids and parallelograms are separate branches of the quadrilateral family.'
      ],
      conceptSummary: 'NC exclusive trapezoid definition: exactly one pair of parallel sides, so trapezoids and parallelograms are separate groups of quadrilaterals.',
      commonMisconception: 'Using the inclusive trapezoid definition ("at least one pair of parallel sides"), which North Carolina does not use.'
    }
  },
  {
    id: 'g3-03',
    standardCode: 'NC.5.G.3',
    domainId: 'G',
    prompt: 'A four-sided polygon has diagonals that are perpendicular and bisect each other, and all 4 of its sides are equal in length (12 cm), but none of its interior angles are 90°. What is the most specific geometric name for this polygon?',
    options: labelOptions([
      // Used the 4 equal sides and ignored the stated "no 90° angles" condition.
      { text: 'Square', isCorrect: false, misconception: 'ignored-a-constraint' },
      { text: 'Rhombus', isCorrect: true },
      // A true category for this figure, but not the most specific one.
      { text: 'Parallelogram', isCorrect: false, misconception: 'named-a-broader-category' },
      // Classified from the perpendicular diagonals alone.
      { text: 'Kite', isCorrect: false, misconception: 'classified-by-one-property-only' },
    ]),
    calculatorAllowed: false,
    isStretch: true,
    difficulty: 'stretch',
    explanation: {
      stepByStep: [
        'Step 1: 4 sides = quadrilateral.',
        'Step 2: 4 equal sides = rhombus (or square).',
        'Step 3: Since none of the angles are 90 degrees, it cannot be a square or rectangle.',
        'Step 4: The most specific classification is a rhombus.'
      ],
      conceptSummary: 'Classifying quadrilaterals by specific property constraints (equal sides without right angles).',
      commonMisconception: 'Calling it a parallelogram or quadrilateral (correct categories, but not the MOST SPECIFIC name).'
    }
  }
];
