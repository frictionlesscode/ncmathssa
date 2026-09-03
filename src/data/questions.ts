import type { Question } from '../types';


export const QUESTIONS_BANK: Question[] = [
  // ==========================================
  // DOMAIN: OPERATIONS & ALGEBRAIC THINKING (OA)
  // Standard: NC.5.OA.2
  // ==========================================
  {
    id: 'oa2-01',
    standardCode: 'NC.5.OA.2',
    domainId: 'OA',
    questionType: 'multiple-choice',
    prompt: 'Evaluate the expression below following the standard order of operations:',
    promptDetails: '24 ÷ [ (7 - 4) × 2 ] + 5 × 3',
    options: [
      'A) 19',
      'B) 17',
      'C) 21',
      'D) 27'
    ],
    correctAnswer: 'A',
    acceptableAnswers: ['A', '19'],
    calculatorAllowed: false,
    isStretch: false,
    difficulty: 'mastery',
    explanation: {
      stepByStep: [
        'Step 1: Evaluate the innermost parentheses: (7 - 4) = 3.',
        'Step 2: Evaluate inside the brackets: [ 3 × 2 ] = 6. The expression is now: 24 ÷ 6 + 5 × 3.',
        'Step 3: Perform multiplication and division from left to right: 24 ÷ 6 = 4, and 5 × 3 = 15.',
        'Step 4: Perform addition: 4 + 15 = 19.'
      ],
      conceptSummary: 'Operations inside parentheses and brackets take highest priority, followed by multiplication/division from left to right, then addition/subtraction.',
      commonMisconception: 'Adding 6 + 5 before multiplying 5 × 3 would result in an incorrect answer.'
    }
  },
  {
    id: 'oa2-02',
    standardCode: 'NC.5.OA.2',
    domainId: 'OA',
    questionType: 'multiple-choice',
    prompt: 'Which numerical expression represents the statement: "Subtract 7 from the product of 9 and 6, then divide by 5"?',
    options: [
      'A) (9 × 6 - 7) ÷ 5',
      'B) 9 × (6 - 7) ÷ 5',
      'C) (7 - 9 × 6) ÷ 5',
      'D) 9 × 6 - (7 ÷ 5)'
    ],
    correctAnswer: 'A',
    acceptableAnswers: ['A'],
    calculatorAllowed: false,
    isStretch: false,
    difficulty: 'mastery',
    explanation: {
      stepByStep: [
        'Step 1: "The product of 9 and 6" is written as (9 × 6).',
        'Step 2: "Subtract 7 from the product" means subtracting 7 from (9 × 6): (9 × 6 - 7).',
        'Step 3: "Then divide by 5" means the entire quantity must be divided by 5, requiring grouping: (9 × 6 - 7) ÷ 5.'
      ],
      conceptSummary: 'Grouping symbols dictate the order in which multi-step verbal statements are carried out.',
      commonMisconception: 'Choice C reverses subtraction ("subtract from" means start with the product and remove 7).'
    }
  },
  {
    id: 'oa2-03',
    standardCode: 'NC.5.OA.2',
    domainId: 'OA',
    questionType: 'open-response',
    prompt: 'Evaluate the expression without using a calculator:',
    promptDetails: '{ [ (18 - 6) ÷ 3 ] + 8 } × 4 - 15',
    correctAnswer: '33',
    acceptableAnswers: ['33'],
    calculatorAllowed: false,
    isStretch: true,
    difficulty: 'stretch',
    explanation: {
      stepByStep: [
        'Step 1: Innermost parentheses: 18 - 6 = 12.',
        'Step 2: Inside brackets: 12 ÷ 3 = 4.',
        'Step 3: Inside braces: 4 + 8 = 12. Expression is now: 12 × 4 - 15.',
        'Step 4: Multiplication: 12 × 4 = 48.',
        'Step 5: Subtraction: 48 - 15 = 33.'
      ],
      conceptSummary: 'Multiple layers of grouping (parentheses, brackets, and braces) must be resolved from inside out before multiplying.',
      commonMisconception: 'Subtracting 15 from 4 before multiplying by 12.'
    }
  },
  {
    id: 'oa2-04',
    standardCode: 'NC.5.OA.2',
    domainId: 'OA',
    questionType: 'multiple-choice',
    prompt: 'Without calculating the exact values, compare Expression P and Expression Q:',
    promptDetails: 'Expression P: 4 × (12,840 + 675)\nExpression Q: 12,840 + 675',
    options: [
      'A) Expression P is 4 times as large as Expression Q',
      'B) Expression P is 4 more than Expression Q',
      'C) Expression Q is 4 times as large as Expression P',
      'D) Both expressions are equal in value'
    ],
    correctAnswer: 'A',
    acceptableAnswers: ['A'],
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
    questionType: 'multiple-choice',
    prompt: 'Two patterns are described below:\n• Pattern X: Starts at 0, add 4\n• Pattern Y: Starts at 0, add 12\n\nWhich statement describes the relationship between corresponding terms of Pattern X and Pattern Y?',
    options: [
      'A) Each term in Pattern Y is 3 times the corresponding term in Pattern X',
      'B) Each term in Pattern Y is 8 more than the corresponding term in Pattern X',
      'C) Each term in Pattern X is 3 times the corresponding term in Pattern Y',
      'D) Each term in Pattern Y is 4 times the corresponding term in Pattern X'
    ],
    correctAnswer: 'A',
    acceptableAnswers: ['A'],
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
    questionType: 'open-response',
    prompt: 'Pattern A begins at 0 and adds 5. Pattern B begins at 0 and adds 15. An ordered pair (x, y) is formed where x is a term from Pattern A and y is the corresponding term from Pattern B. If x = 35, what is the value of y?',
    correctAnswer: '105',
    acceptableAnswers: ['105'],
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
      commonMisconception: 'Listing terms one by one up to 35, which takes unnecessary time and risks counting errors.'
    }
  },
  {
    id: 'oa3-03',
    standardCode: 'NC.5.OA.3',
    domainId: 'OA',
    questionType: 'open-response',
    prompt: 'Two patterns start at 0. Pattern 1 adds 6 each time. Pattern 2 adds 9 each time. If the points (x, y) are plotted on a coordinate plane with Pattern 1 on the x-axis and Pattern 2 on the y-axis, what is the y-coordinate when the x-coordinate is 48?',
    correctAnswer: '72',
    acceptableAnswers: ['72'],
    calculatorAllowed: true,
    isStretch: true,
    difficulty: 'stretch',
    explanation: {
      stepByStep: [
        'Step 1: Find how many steps Pattern 1 took to reach 48: 48 ÷ 6 = 8 steps.',
        'Step 2: Apply the same 8 steps to Pattern 2: 8 × 9 = 72.',
        'Step 3: Alternatively, notice the ratio y/x = 9/6 = 3/2 = 1.5. 48 × 1.5 = 72.'
      ],
      conceptSummary: 'Ordered pairs created by two arithmetic patterns form a straight line with slope equal to (rate 2) / (rate 1).',
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
    questionType: 'multiple-choice',
    prompt: 'In the number 8,840.35, how does the value of the 8 in the thousands place compare to the value of the 8 in the hundreds place?',
    options: [
      'A) It is 10 times greater',
      'B) It is 100 times greater',
      'C) It is 1/10 of the value',
      'D) It is 800 times greater'
    ],
    correctAnswer: 'A',
    acceptableAnswers: ['A'],
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
    questionType: 'open-response',
    prompt: 'What is the value of the expression below?',
    promptDetails: '47.62 ÷ 10^3',
    correctAnswer: '0.04762',
    acceptableAnswers: ['0.04762', '.04762'],
    calculatorAllowed: false,
    isStretch: false,
    difficulty: 'mastery',
    explanation: {
      stepByStep: [
        'Step 1: 10^3 equals 1,000.',
        'Step 2: Dividing by 10^3 shifts the digits 3 places to the right (moves the decimal 3 places to the left).',
        'Step 3: 47.62 -> 4.762 (1 place) -> 0.4762 (2 places) -> 0.04762 (3 places).'
      ],
      conceptSummary: 'Dividing by 10^n moves the decimal point n places to the left, inserting leading zeros as needed.',
      commonMisconception: 'Moving the decimal 2 places instead of 3, or moving to the right instead of left.'
    }
  },
  {
    id: 'nbt1-03',
    standardCode: 'NC.5.NBT.1',
    domainId: 'NBT',
    questionType: 'multiple-choice',
    prompt: 'A science laboratory measured the mass of a chemical sample as 0.06 grams. A second sample had a mass of 0.006 grams. Which statement correctly describes the relationship between the two samples?',
    options: [
      'A) The second sample has a mass that is 1/10 of the first sample',
      'B) The second sample has a mass that is 10 times the first sample',
      'C) The first sample has a mass that is 1/10 of the second sample',
      'D) The second sample has a mass that is 1/100 of the first sample'
    ],
    correctAnswer: 'A',
    acceptableAnswers: ['A'],
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
    questionType: 'multiple-choice',
    prompt: 'Which inequality correctly compares the numbers below?',
    promptDetails: 'Number P: 3.084\nNumber Q: 3.804',
    options: [
      'A) 3.084 < 3.804',
      'B) 3.084 > 3.804',
      'C) 3.804 < 3.084',
      'D) 3.084 = 3.804'
    ],
    correctAnswer: 'A',
    acceptableAnswers: ['A'],
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
    questionType: 'open-response',
    prompt: 'Write the number "six and forty-five thousandths" in standard decimal form.',
    correctAnswer: '6.045',
    acceptableAnswers: ['6.045'],
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
    questionType: 'open-response',
    prompt: 'What decimal number is represented by this expanded form expression?',
    promptDetails: '(7 × 10) + (4 × 1) + (2 × 0.1) + (8 × 0.001)',
    correctAnswer: '74.208',
    acceptableAnswers: ['74.208'],
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
    questionType: 'open-response',
    prompt: 'Multiply the numbers using the standard algorithm:',
    promptDetails: '648 × 37',
    correctAnswer: '23976',
    acceptableAnswers: ['23976', '23,976'],
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
    questionType: 'multiple-choice',
    prompt: 'An auditorium has 28 rows of seats with 345 seats in each row. For a special concert, 15 seats are removed for sound equipment. How many seats are available for the concert?',
    options: [
      'A) 9,645',
      'B) 9,660',
      'C) 9,675',
      'D) 8,645'
    ],
    correctAnswer: 'A',
    acceptableAnswers: ['A', '9645', '9,645'],
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
    questionType: 'open-response',
    prompt: 'Divide the numbers:',
    promptDetails: '3,816 ÷ 18',
    correctAnswer: '212',
    acceptableAnswers: ['212'],
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
    questionType: 'open-response',
    prompt: 'A distributor is packing 1,480 books into storage cartons. Each carton holds exactly 32 books. How many cartons are needed to pack ALL the books so none are left out?',
    correctAnswer: '47',
    acceptableAnswers: ['47', '47 cartons'],
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
    questionType: 'open-response',
    prompt: 'Calculate the quotient of 6,240 ÷ 26.',
    correctAnswer: '240',
    acceptableAnswers: ['240'],
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
    questionType: 'open-response',
    prompt: 'Calculate the difference without a calculator:',
    promptDetails: '80.4 - 27.65',
    correctAnswer: '52.75',
    acceptableAnswers: ['52.75'],
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
      commonMisconception: 'Subtracting 0 - 5 = 5 without regrouping, giving .85 or .25.'
    }
  },
  {
    id: 'nbt7-02',
    standardCode: 'NC.5.NBT.7',
    domainId: 'NBT',
    questionType: 'open-response',
    prompt: 'Multiply: 4.35 × 0.8',
    correctAnswer: '3.48',
    acceptableAnswers: ['3.48', '3.480'],
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
    questionType: 'open-response',
    prompt: 'Marcus bought 3 packages of markers for $4.75 each and 2 notebooks for $2.40 each. He paid with a $50 bill. How much change should Marcus receive?',
    correctAnswer: '30.95',
    acceptableAnswers: ['30.95', '$30.95'],
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
    questionType: 'open-response',
    prompt: 'Solve: 14.76 ÷ 0.12',
    correctAnswer: '123',
    acceptableAnswers: ['123'],
    calculatorAllowed: false,
    isStretch: true,
    difficulty: 'stretch',
    explanation: {
      stepByStep: [
        'Step 1: Make the divisor a whole number by multiplying both dividend and divisor by 100.',
        'Step 2: 14.76 × 100 = 1,476; 0.12 × 100 = 12.',
        'Step 3: Divide: 1,476 ÷ 12.',
        'Step 4: 12 goes into 14 one time (remainder 2). Bring down 7 to make 27. 12 goes into 27 two times (remainder 3). Bring down 6 to make 36. 12 goes into 36 three times.',
        'Step 5: The quotient is 123.'
      ],
      conceptSummary: 'Dividing decimals by shifting decimal points in divisor and dividend by equal powers of 10.',
      commonMisconception: 'Dividing 14.76 by 12 without shifting the dividend by 100.'
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
    questionType: 'open-response',
    prompt: 'Evaluate the sum. Express your answer as a simplified mixed number or fraction:',
    promptDetails: '2 3/4 + 1 5/6',
    correctAnswer: '4 7/12',
    acceptableAnswers: ['4 7/12', '55/12', '4.5833'],
    calculatorAllowed: false,
    isStretch: false,
    difficulty: 'mastery',
    explanation: {
      stepByStep: [
        'Step 1: Find LCM of denominators 4 and 6: LCM is 12.',
        'Step 2: Convert fractions to denominator of 12: 3/4 = 9/12, and 5/6 = 10/12.',
        'Step 3: Add the whole numbers: 2 + 1 = 3.',
        'Step 4: Add the fractions: 9/12 + 10/12 = 19/12.',
        'Step 5: Convert 19/12 to a mixed number: 1 7/12.',
        'Step 6: Combine: 3 + 1 7/12 = 4 7/12.'
      ],
      conceptSummary: 'Adding mixed numbers with unlike denominators by finding LCM and regrouping improper fraction sums.',
      commonMisconception: 'Adding across numerators and denominators (3+5)/(4+6) = 8/10, which is incorrect.'
    }
  },
  {
    id: 'nf1-02',
    standardCode: 'NC.5.NF.1',
    domainId: 'NF',
    questionType: 'open-response',
    prompt: 'Solve the subtraction problem. Express your answer as a fraction or mixed number in simplest form:',
    promptDetails: '6 1/5 - 2 3/4',
    correctAnswer: '3 9/20',
    acceptableAnswers: ['3 9/20', '69/20', '3.45'],
    calculatorAllowed: false,
    isStretch: false,
    difficulty: 'mastery',
    explanation: {
      stepByStep: [
        'Step 1: Find common denominator for 5 and 4: LCM is 20.',
        'Step 2: Convert fractions: 1/5 = 4/20 and 3/4 = 15/20. The expression is: 6 4/20 - 2 15/20.',
        'Step 3: Since 4/20 < 15/20, borrow 1 whole (20/20) from 6: 6 4/20 = 5 + 20/20 + 4/20 = 5 24/20.',
        'Step 4: Subtract whole numbers: 5 - 2 = 3.',
        'Step 5: Subtract fractions: 24/20 - 15/20 = 9/20.',
        'Step 6: Combine: 3 9/20.'
      ],
      conceptSummary: 'Regrouping mixed numbers requires converting 1 borrowed whole into equivalent units of the common denominator.',
      commonMisconception: 'Subtracting smaller fraction from larger fraction (15/20 - 4/20) to get 11/20, ignoring the order.'
    }
  },
  {
    id: 'nf1-03',
    standardCode: 'NC.5.NF.1',
    domainId: 'NF',
    questionType: 'multiple-choice',
    prompt: 'Kaitlyn had a 5-pound bag of flour. She used 1 3/8 pounds for a cake and 2 1/4 pounds for bread. How many pounds of flour are left in the bag?',
    options: [
      'A) 1 3/8 pounds',
      'B) 1 1/8 pounds',
      'C) 3 5/8 pounds',
      'D) 1 5/8 pounds'
    ],
    correctAnswer: 'A',
    acceptableAnswers: ['A', '1 3/8', '11/8'],
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
    questionType: 'open-response',
    prompt: 'Using benchmark fractions (0, 1/2, 1), estimate whether the sum of 7/12 and 9/10 is closer to 1, 1 1/2, or 2. Write your estimate as a number or fraction.',
    correctAnswer: '1 1/2',
    acceptableAnswers: ['1 1/2', '1.5', '3/2'],
    calculatorAllowed: false,
    isStretch: false,
    difficulty: 'advanced',
    explanation: {
      stepByStep: [
        'Step 1: 7/12 is slightly greater than 6/12, so it is approximately 1/2.',
        'Step 2: 9/10 is very close to 10/10, so it is approximately 1.',
        'Step 3: Sum of benchmarks: 1/2 + 1 = 1 1/2.'
      ],
      conceptSummary: 'Benchmark estimation tests number sense to check if computed answers are mathematically reasonable.',
      commonMisconception: 'Computing exact value (1 29/60) when the problem explicitly asked for benchmark reasoning.'
    }
  },

  // Standard: NC.5.NF.3
  {
    id: 'nf3-01',
    standardCode: 'NC.5.NF.3',
    domainId: 'NF',
    questionType: 'multiple-choice',
    prompt: 'Five friends share 3 large pizzas equally. Which expression and fraction shows how much pizza each friend receives?',
    options: [
      'A) 3 ÷ 5 = 3/5 of a pizza',
      'B) 5 ÷ 3 = 1 2/3 pizzas',
      'C) 3 × 5 = 15 slices',
      'D) 5 - 3 = 2 pizzas'
    ],
    correctAnswer: 'A',
    acceptableAnswers: ['A', '3/5'],
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
    questionType: 'open-response',
    prompt: 'A chef divides an 18-pound block of cheddar cheese equally into 8 portions for catering orders. How many pounds of cheese are in each portion? Express your answer as a simplified mixed number.',
    correctAnswer: '2 1/4',
    acceptableAnswers: ['2 1/4', '9/4', '2.25'],
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
      commonMisconception: 'Leaving the answer unsimplified as 18/8 or 2 2/8.'
    }
  },

  // Standard: NC.5.NF.4
  {
    id: 'nf4-01',
    standardCode: 'NC.5.NF.4',
    domainId: 'NF',
    questionType: 'open-response',
    prompt: 'A rectangular desktop measures 4 1/2 feet long and 2 2/3 feet wide. What is the area of the desktop in square feet? Express your answer as a whole number or mixed number.',
    correctAnswer: '12',
    acceptableAnswers: ['12', '12 sq ft', '12 square feet'],
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
    questionType: 'multiple-choice',
    prompt: 'Without multiplying, choose the statement that correctly compares the product to the factor 16:\n\n16 × 7/9',
    options: [
      'A) The product is less than 16 because 7/9 is less than 1',
      'B) The product is greater than 16 because multiplying always increases value',
      'C) The product is equal to 16 because 7/9 is close to 1',
      'D) The product is 7 less than 16'
    ],
    correctAnswer: 'A',
    acceptableAnswers: ['A'],
    calculatorAllowed: false,
    isStretch: false,
    difficulty: 'mastery',
    explanation: {
      stepByStep: [
        'Step 1: Examine the multiplier: 7/9 is less than 1 whole (7/9 < 1).',
        'Step 2: Multiplying a non-zero quantity by a fraction less than 1 scales the quantity down.',
        'Step 3: Therefore, 16 × 7/9 will be strictly less than 16.'
      ],
      conceptSummary: 'Scaling reasoning: multiplying by a factor < 1 reduces the original value.',
      commonMisconception: 'Believing the 4th-grade rule of thumb that "multiplication always makes numbers bigger".'
    }
  },
  {
    id: 'nf4-03',
    standardCode: 'NC.5.NF.4',
    domainId: 'NF',
    questionType: 'open-response',
    prompt: 'Solve and simplify: 5/8 × 4/15',
    correctAnswer: '1/6',
    acceptableAnswers: ['1/6', '0.1667'],
    calculatorAllowed: false,
    isStretch: false,
    difficulty: 'mastery',
    explanation: {
      stepByStep: [
        'Step 1: Multiply numerators: 5 × 4 = 20.',
        'Step 2: Multiply denominators: 8 × 15 = 120.',
        'Step 3: Simplify 20/120 by dividing numerator and denominator by 20: 20/120 = 1/6.',
        'Step 4: Alternatively, simplify by cross-canceling beforehand: 5 and 15 cancel to 1 and 3; 4 and 8 cancel to 1 and 2. (1 × 1) / (2 × 3) = 1/6.'
      ],
      conceptSummary: 'Multiplying proper fractions and simplifying by finding common factors.',
      commonMisconception: 'Attempting to find common denominators before multiplying.'
    }
  },

  // Standard: NC.5.NF.7
  {
    id: 'nf7-01',
    standardCode: 'NC.5.NF.7',
    domainId: 'NF',
    questionType: 'open-response',
    prompt: 'A chef has 6 pounds of ground beef. Each burger patty requires 1/4 pound of meat. How many patties can the chef make?',
    correctAnswer: '24',
    acceptableAnswers: ['24', '24 patties'],
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
    questionType: 'open-response',
    prompt: 'Lillian has 1/5 of a bottle of juice. She divides it equally among herself and 2 friends (3 people total). What fraction of the original full bottle of juice does each person receive?',
    correctAnswer: '1/15',
    acceptableAnswers: ['1/15'],
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
    questionType: 'open-response',
    prompt: '[Above-Grade Stretch] Solve: 3/4 ÷ 2/5. Express your answer as a simplified mixed number or fraction.',
    correctAnswer: '1 7/8',
    acceptableAnswers: ['1 7/8', '15/8', '1.875'],
    calculatorAllowed: false,
    isStretch: true,
    difficulty: 'stretch',
    explanation: {
      stepByStep: [
        'Step 1: In 6th grade math, dividing by any fraction means multiplying by its reciprocal (invert the second fraction).',
        'Step 2: 3/4 ÷ 2/5 = 3/4 × 5/2.',
        'Step 3: Multiply numerators and denominators: (3 × 5) / (4 × 2) = 15/8.',
        'Step 4: Convert 15/8 to a mixed number: 1 7/8.'
      ],
      conceptSummary: 'Fraction division rule (multiply by reciprocal) bridging 5th grade unit fraction division into 6th grade general fraction division.',
      commonMisconception: 'Inverting the first fraction instead of the second fraction.'
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
    questionType: 'open-response',
    prompt: 'A runner completes a 6-kilometer road race. How many meters did the runner travel?',
    correctAnswer: '6000',
    acceptableAnswers: ['6000', '6,000', '6000 meters', '6,000 meters'],
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
    questionType: 'open-response',
    prompt: 'A school cafeteria prepares 5 gallons of vegetable soup. They serve the soup in 1-cup bowls. How many full 1-cup bowls can they serve?',
    correctAnswer: '80',
    acceptableAnswers: ['80', '80 bowls'],
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
    questionType: 'open-response',
    prompt: 'A carpenter has a board that is 4 yards 2 feet long. She cuts off a piece that is 5 feet 8 inches long. What is the length of the remaining board in inches?',
    correctAnswer: '100',
    acceptableAnswers: ['100', '100 inches', '100 in'],
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
    questionType: 'multiple-choice',
    prompt: 'Students in a science club measured the lengths of pencil stubs to the nearest 1/8 inch:\n\n1/8, 1/4, 3/8, 1/4, 1/2, 3/8, 1/8, 1/4\n\nWhat is the total length in inches of all the pencil stubs that measured EXACTLY 1/4 inch?',
    options: [
      'A) 3/4 inch',
      'B) 1/4 inch',
      'C) 1 1/4 inches',
      'D) 1/2 inch'
    ],
    correctAnswer: 'A',
    acceptableAnswers: ['A', '3/4'],
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
    questionType: 'open-response',
    prompt: 'A line plot records the weights of 6 seed packages in ounces:\n3/8, 1/2, 3/4, 3/8, 7/8, 1/2\n\nWhat is the difference between the heaviest seed package and the lightest seed package? Express as a fraction in simplest form.',
    correctAnswer: '1/2',
    acceptableAnswers: ['1/2', '0.5'],
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
    questionType: 'open-response',
    prompt: 'A right rectangular prism is completely packed without gaps using 1-centimeter unit cubes. The base layer contains 5 rows with 8 cubes in each row. The prism is packed 4 layers tall. What is the volume of the prism in cubic centimeters?',
    correctAnswer: '160',
    acceptableAnswers: ['160', '160 cubic cm', '160 cm^3'],
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
    questionType: 'open-response',
    prompt: 'A shipping carton has a length of 15 inches, a width of 12 inches, and a height of 8 inches. What is the volume of the carton in cubic inches?',
    correctAnswer: '1440',
    acceptableAnswers: ['1440', '1,440', '1440 cubic inches', '1,440 cubic inches'],
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
    questionType: 'open-response',
    prompt: 'A rectangular aquarium has a base area of 240 square inches. If the aquarium has a height of 15 inches, what is its volume in cubic inches?',
    correctAnswer: '3600',
    acceptableAnswers: ['3600', '3,600'],
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
    questionType: 'open-response',
    prompt: 'A solid wooden step structure is made of two joined rectangular prisms. Prism 1 measures 10 inches long, 6 inches wide, and 4 inches high. Prism 2 sits next to it and measures 8 inches long, 6 inches wide, and 7 inches high. What is the total combined volume of the wooden structure in cubic inches?',
    correctAnswer: '576',
    acceptableAnswers: ['576', '576 cubic inches'],
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
    questionType: 'multiple-choice',
    prompt: 'Which statement correctly describes how to plot the point (4, 7) on a coordinate plane starting from the origin (0, 0)?',
    options: [
      'A) Move 4 units right along the x-axis, then 7 units up parallel to the y-axis',
      'B) Move 7 units right along the x-axis, then 4 units up parallel to the y-axis',
      'C) Move 4 units up along the y-axis, then 7 units right',
      'D) Move 11 units diagonally from origin'
    ],
    correctAnswer: 'A',
    acceptableAnswers: ['A'],
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
    questionType: 'open-response',
    prompt: 'Point J is located at (2, 5) and Point K is located at (8, 5) on a coordinate grid. What is the distance in units between Point J and Point K?',
    correctAnswer: '6',
    acceptableAnswers: ['6', '6 units'],
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
    questionType: 'open-response',
    prompt: 'Three vertices of a rectangle are plotted on a coordinate grid at (3, 2), (9, 2), and (9, 7). What are the coordinates (x, y) of the fourth vertex? Enter in the format (x, y) or x, y.',
    correctAnswer: '(3, 7)',
    acceptableAnswers: ['(3, 7)', '3, 7', '3,7', '(3,7)'],
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
    questionType: 'multiple-choice',
    prompt: 'Which statement about two-dimensional figures is ALWAYS true based on the geometric hierarchy?',
    options: [
      'A) Every square is both a rectangle and a rhombus',
      'B) Every rectangle is a square',
      'C) Every parallelogram has four right angles',
      'D) A trapezoid can never be a quadrilateral'
    ],
    correctAnswer: 'A',
    acceptableAnswers: ['A'],
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
    questionType: 'multiple-choice',
    prompt: 'A student claims: "All parallelograms are trapezoids, but not all trapezoids are parallelograms." Under North Carolina\'s standard course of study definition (where a trapezoid is a quadrilateral with at least one pair of parallel sides), is the student\'s claim true or false?',
    options: [
      'A) True, because parallelograms have 2 pairs of parallel sides, which satisfies the requirement of having at least 1 pair',
      'B) False, because a trapezoid can never have more than 1 pair of parallel sides',
      'C) False, because parallelograms are not quadrilaterals',
      'D) True, because all four-sided shapes are trapezoids'
    ],
    correctAnswer: 'A',
    acceptableAnswers: ['A'],
    calculatorAllowed: false,
    isStretch: false,
    difficulty: 'mastery',
    explanation: {
      stepByStep: [
        'Step 1: In North Carolina (inclusive definition), a trapezoid is defined as having at least one pair of parallel sides.',
        'Step 2: A parallelogram has two pairs of parallel sides, which fulfills the condition "at least one".',
        'Step 3: Thus, all parallelograms are subcategories of trapezoids.'
      ],
      conceptSummary: 'NC inclusive quadrilateral hierarchy definition for trapezoids.',
      commonMisconception: 'Using the exclusive trapezoid definition ("exactly one pair of parallel sides").'
    }
  },
  {
    id: 'g3-03',
    standardCode: 'NC.5.G.3',
    domainId: 'G',
    questionType: 'open-response',
    prompt: 'A four-sided polygon has diagonals that are perpendicular and bisect each other, and all 4 of its sides are equal in length (12 cm), but none of its interior angles are 90°. What is the most specific geometric name for this polygon?',
    correctAnswer: 'rhombus',
    acceptableAnswers: ['rhombus', 'a rhombus'],
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

export function getQuestionsByDomain(domainId: string): Question[] {
  return QUESTIONS_BANK.filter(q => q.domainId === domainId);
}

export function getQuestionsByStandard(standardCode: string): Question[] {
  return QUESTIONS_BANK.filter(q => q.standardCode === standardCode);
}

export function getQuestionById(id: string): Question | undefined {
  return QUESTIONS_BANK.find(q => q.id === id);
}
