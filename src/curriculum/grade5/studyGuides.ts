import type { StudyGuideSection } from '../../types';

export const GRADE_5_STUDY_GUIDES: Record<string, StudyGuideSection> = {
  'NC.5.OA.2': {
    standardCode: 'NC.5.OA.2',
    title: 'Order of Operations & Evaluating Numerical Expressions',
    coreConcept: 'Expressions must be evaluated in strict mathematical order (PEMDAS/GEMS). In word problems, operations grouped inside parentheses must happen first.',
    rulesAndFormulas: [
      { label: 'Parentheses ( )', detail: 'Always compute the expressions inside parentheses first.' },
      { label: 'Multiplication & Division (Left to Right)', detail: 'Neither takes priority over the other; compute them in order from left to right as you read.' },
      { label: 'Addition & Subtraction (Left to Right)', detail: 'Compute additions and subtractions from left to right after all multiplication and division are complete.' },
      { label: 'Distributive Property', detail: 'a × (b + c) = (a × b) + (a × c). Often used to break large numbers apart.' }
    ],
    stepByStepMethod: [
      'Step 1: Scan for parentheses. If found, evaluate inside first using standard order of operations.',
      'Step 2: Move left to right, solving any multiplication (×) or division (÷).',
      'Step 3: Move left to right, solving any addition (+) or subtraction (-).'
    ],
    commonTraps: [
      'Performing addition before subtraction simply because "A" comes before "S" in PEMDAS. Remember addition and subtraction have EQUAL priority and go strictly left-to-right!',
      'Forgetting parentheses when translating word problems (e.g. "add 6 and 4, then multiply by 5" is (6 + 4) × 5 = 50, NOT 6 + 4 × 5 = 26).'
    ],
    workedExample: {
      problem: 'Evaluate the expression: 48 ÷ (10 - 4)',
      steps: [
        '1. Parentheses first: (10 - 4) = 6. The expression is now: 48 ÷ 6',
        '2. Divide: 48 ÷ 6 = 8.'
      ],
      answer: '8',
      whyItMattersForSSA: 'Parentheses change which step comes first. Working left to right without them would give 48 ÷ 10 - 4 = 0.8, which is not the same expression.'
    }
  },

  'NC.5.OA.3': {
    standardCode: 'NC.5.OA.3',
    title: 'Numerical Patterns, Rules & Coordinate Graphing',
    coreConcept: 'Two different numerical rules create sequences. Comparing corresponding terms reveals mathematical relationships (like one term being a constant multiple of another), which can be plotted as ordered pairs (x, y).',
    rulesAndFormulas: [
      { label: 'Pattern Generation', detail: 'Apply starting number and rule repeatedly (e.g. Start at 0, add 4: 0, 4, 8, 12, 16...).' },
      { label: 'Corresponding Terms', detail: 'Match term 1 with term 1, term 2 with term 2 to form ordered pairs (x, y).' },
      { label: 'Multiplicative Relationship', detail: 'If Rule 2 is double Rule 1, each y-value is 2 times its corresponding x-value (y = 2x).' }
    ],
    stepByStepMethod: [
      'Step 1: Write out the first 4-5 terms for both sequences clearly in a table.',
      'Step 2: Look across rows to find how term X relates to term Y (multiplication or division factor).',
      'Step 3: Write coordinate pairs (x, y) where x is from sequence 1 and y is from sequence 2.',
      'Step 4: Verify that the line through the points passes through the origin (0,0) if starting at 0.'
    ],
    commonTraps: [
      'Reversing (x, y) coordinate order when plotting.',
      'Looking only at the vertical change (+3, +3, +3) rather than the horizontal relationship between x and y (e.g., y is always 3 times x).'
    ],
    workedExample: {
      problem: 'Rule X starts at 0 and adds 3. Rule Y starts at 0 and adds 12. If the 6th term of Rule X is 15, what is the 6th term of Rule Y, and what is the relationship between the terms?',
      steps: [
        '1. Rule X terms: 0, 3, 6, 9, 12, 15 (6th term is 15).',
        '2. Notice Rule Y adds 12 each step, which is 4 times Rule X (+3 × 4 = +12).',
        '3. Therefore, every term in Rule Y is 4 times the corresponding term in Rule X.',
        '4. 6th term of Rule Y = 15 × 4 = 60.'
      ],
      answer: '60 (Rule Y terms are 4 times Rule X terms)',
      whyItMattersForSSA: 'Seeing that every y is the same number of times its x is what makes the points line up when they are graphed.'
    }
  },

  'NC.5.NBT.1': {
    standardCode: 'NC.5.NBT.1',
    title: 'Place Value Patterns & Powers of 10',
    coreConcept: 'Our base-ten system is built on powers of 10. Moving one place to the left multiplies value by 10 (10x). Moving one place to the right divides value by 10 (one-tenth, 1/10 or 0.1).',
    rulesAndFormulas: [
      { label: 'Left Shift (10×)', detail: 'The digit in the tens place is 10 times greater than the same digit in the ones place.' },
      { label: 'Right Shift (1/10)', detail: 'The digit in the hundredths place is 1/10 of the value of the same digit in the tenths place.' },
      { label: 'Multiplying by 10^n', detail: 'Shifts all digits n places to the left (decimal moves n places right).' },
      { label: 'Dividing by 10^n', detail: 'Shifts all digits n places to the right (decimal moves n places left).' }
    ],
    stepByStepMethod: [
      'Step 1: Identify the two place values being compared.',
      'Step 2: Count how many place value hops separate them.',
      'Step 3: Each hop to the left is ×10. Two hops = ×100. Three hops = ×1,000.',
      'Step 4: Each hop to the right is ×(1/10) or ÷10. Two hops right = ×(1/100).'
    ],
    commonTraps: [
      'Saying 2 places is 20 times instead of 10 × 10 = 100 times.',
      'Confusing "10 times as much as" with "1/10 of". Always check which number is larger!'
    ],
    workedExample: {
      problem: 'In the number 44,720, how does the value of the 4 in the ten-thousands place compare to the value of the 4 in the thousands place?',
      steps: [
        '1. The 4 in the ten-thousands place has a value of 40,000.',
        '2. The 4 in the thousands place has a value of 4,000.',
        '3. 40,000 ÷ 4,000 = 10.',
        '4. The 4 in the ten-thousands place is 10 times greater than the 4 in the thousands place.'
      ],
      answer: '10 times greater (or the thousands 4 is 1/10 of the ten-thousands 4)',
      whyItMattersForSSA: 'Foundational place value reasoning appears throughout calculator-inactive sections.'
    }
  },

  'NC.5.NBT.3': {
    standardCode: 'NC.5.NBT.3',
    title: 'Read, Write, and Compare Decimals to Thousandths',
    coreConcept: 'Decimals extend place value to tenths (0.1), hundredths (0.01), and thousandths (0.001). Comparing decimals requires comparing from left to right at the highest place value where the digits differ.',
    rulesAndFormulas: [
      { label: 'Standard Form', detail: 'Digits written normally, e.g. 5.084.' },
      { label: 'Word Form', detail: 'Say the whole number, say "and" for decimal point, say decimal part followed by the name of the last place value: "five and eighty-four thousandths".' },
      { label: 'Expanded Form', detail: '(5 × 1) + (8 × 0.01) + (4 × 0.001) or 5 + 8/100 + 4/1000.' },
      { label: 'Equivalent Decimals', detail: '5.4 = 5.40 = 5.400 (trailing zeros do not change value).' }
    ],
    stepByStepMethod: [
      'Step 1: Align decimal numbers vertically by their decimal points.',
      'Step 2: Pad with trailing zeros so all numbers have the same number of decimal digits.',
      'Step 3: Compare digits from left to right starting at the highest non-zero place value.',
      'Step 4: The number with the larger digit at the first differing place value is greater.'
    ],
    commonTraps: [
      'Thinking a longer decimal is automatically larger (e.g. thinking 0.125 > 0.4 because 125 > 4). Pad with zeros: 0.125 < 0.400!',
      'Skipping zero place holders in expanded form (e.g. 3.07 is 3 + 7/100, NOT 3 + 7/10).'
    ],
    workedExample: {
      problem: 'Compare 0.509 and 0.59 using >, <, or =.',
      steps: [
        '1. Align decimals: 0.509 and 0.590 (add trailing zero to 0.59).',
        '2. Ones digit: 0 vs 0 (equal).',
        '3. Tenths digit: 5 vs 5 (equal).',
        '4. Hundredths digit: 0 vs 9. Since 9 > 0, 0.590 is greater than 0.509.'
      ],
      answer: '0.509 < 0.59',
      whyItMattersForSSA: 'Decimals to thousandths are heavily assessed; precision in decimal place names is critical.'
    }
  },

  'NC.5.NBT.5': {
    standardCode: 'NC.5.NBT.5',
    title: 'Multi-Digit Whole Number Multiplication Algorithm',
    coreConcept: 'Fluency with the standard multiplication algorithm for up to 3-digit by 2-digit numbers. Place value understanding explains why a placeholder zero is required when multiplying by the tens digit.',
    rulesAndFormulas: [
      { label: 'Partial Products', detail: 'Multiply top number by ones digit, then by tens digit (shift left with zero), then add products.' },
      { label: 'Placeholder Zero', detail: 'When multiplying by tens digit (e.g. the 3 in 34), write a 0 in the ones place first because you are multiplying by 30.' },
      { label: 'Standard Algorithm', detail: '348 × 26 = (348 × 6) + (348 × 20).' }
    ],
    stepByStepMethod: [
      'Step 1: Write the larger factor on top, aligned to the right.',
      'Step 2: Multiply the top number by the ones digit of the bottom number. Regroup carries on top.',
      'Step 3: Put a placeholder 0 in the ones column of the next row.',
      'Step 4: Multiply the top number by the tens digit of the bottom number.',
      'Step 5: Add the two partial products together carefully.'
    ],
    commonTraps: [
      'Forgetting the placeholder 0 when multiplying by the tens digit.',
      'Adding carried numbers before multiplying (always MULTIPLY first, then ADD the carried amount!).'
    ],
    workedExample: {
      problem: 'Calculate 427 × 38 using the standard algorithm.',
      steps: [
        '1. Multiply 427 × 8: 8 × 7 = 56 (write 6, carry 5); 8 × 2 = 16 + 5 = 21 (write 1, carry 2); 8 × 4 = 32 + 2 = 34. First partial product = 3,416.',
        '2. Place 0 in ones place.',
        '3. Multiply 427 × 30: 3 × 7 = 21 (write 1, carry 2); 3 × 2 = 6 + 2 = 8; 3 × 4 = 12. Second partial product = 12,810.',
        '4. Add partial products: 3,416 + 12,810 = 16,226.'
      ],
      answer: '16,226',
      whyItMattersForSSA: 'Calculator-inactive section requires speed and 100% computational accuracy without a calculator.'
    }
  },

  'NC.5.NBT.6': {
    standardCode: 'NC.5.NBT.6',
    title: 'Division with 2-Digit Divisors (Up to 4 Digits)',
    coreConcept: 'Dividing up to 4-digit dividends by 2-digit divisors using partial quotients, area models, or standard long division. Understanding what the remainder represents in real-world contexts.',
    rulesAndFormulas: [
      { label: 'Division Identity', detail: '(Divisor × Quotient) + Remainder = Dividend.' },
      { label: 'Partial Quotients', detail: 'Subtract easy chunks (e.g. 100×, 50×, 20×, 10×) until the remainder is less than the divisor.' },
      { label: 'Remainder in Context', detail: 'If packing boxes or buses, round up if everyone/everything must fit. If asking for full groups, truncate.' }
    ],
    stepByStepMethod: [
      'Step 1: Estimate compatible multiples (e.g. if dividing by 24, think in multiples of 25: 25, 50, 75, 100).',
      'Step 2: Determine how many times the divisor fits into the leading digits of the dividend.',
      'Step 3: Multiply, subtract, and bring down the next digit.',
      'Step 4: Repeat until all digits are brought down. Express remainder as a whole number, fraction (R/Divisor), or decimal.'
    ],
    commonTraps: [
      'Leaving a remainder that is greater than or equal to the divisor (means your quotient digit was too small!).',
      'Misinterpreting word problem remainders (e.g. "How many vans needed for 85 students if each van holds 12?" 85 ÷ 12 = 7 R1, so 8 vans are needed, NOT 7!).'
    ],
    workedExample: {
      problem: 'Divide 2,842 ÷ 14.',
      steps: [
        '1. 14 goes into 28 exactly 2 times (2 × 14 = 28). Subtract 28 - 28 = 0.',
        '2. Bring down 4. 14 goes into 4 exactly 0 times! (Important: write 0 in quotient!).',
        '3. Bring down 2 to make 42. 14 goes into 42 exactly 3 times (3 × 14 = 42).',
        '4. 42 - 42 = 0. Quotient = 203.'
      ],
      answer: '203',
      whyItMattersForSSA: 'Forgetting the zero in the quotient (writing 23 instead of 203) is one of the single most common student mistakes on CASE assessments.'
    }
  },

  'NC.5.NBT.7': {
    standardCode: 'NC.5.NBT.7',
    title: 'Operations with Decimals to Hundredths',
    coreConcept: 'Add, subtract, multiply, and divide decimals to hundredths. Decimal point placement is governed by place value reasoning.',
    rulesAndFormulas: [
      { label: 'Adding & Subtracting Decimals', detail: 'Line up decimal points vertically! Fill empty place values with zeros before subtracting.' },
      { label: 'Multiplying Decimals', detail: 'Multiply as whole numbers. Then count total decimal places in BOTH factors and move decimal left by that sum.' },
      { label: 'Dividing by a Decimal', detail: 'Multiply both divisor and dividend by 10, 100, etc. so the divisor becomes a whole number before dividing.' }
    ],
    stepByStepMethod: [
      'Addition/Subtraction: Line up decimals -> pad with zeros -> compute -> bring decimal straight down.',
      'Multiplication: Ignore decimals -> multiply whole numbers -> count digits behind decimals in factors -> place decimal in product.',
      'Division: Divisor must be whole. Shift decimal right in divisor, shift dividend same number of places -> divide -> place decimal straight up into quotient.'
    ],
    commonTraps: [
      'Not lining up decimal points when adding/subtracting (e.g. adding 14.5 and 2.38 as 14.5 + 23.8).',
      'Forgetting to regroup across zeros when subtracting (e.g. 5.00 - 2.67).'
    ],
    workedExample: {
      problem: 'A rope is 12.5 meters long. Maya cuts 4 pieces that are each 1.65 meters long. How many meters of rope remain?',
      steps: [
        '1. Find total length cut: 4 × 1.65. Multiply 4 × 165 = 660. Since 1.65 has 2 decimal places, 4 × 1.65 = 6.60 meters.',
        '2. Subtract from total: 12.5 - 6.60. Line up decimals: 12.50 - 6.60 = 5.90 meters.'
      ],
      answer: '5.9 meters',
      whyItMattersForSSA: 'Multi-step decimal word problems test whether the student can integrate multiple operations correctly.'
    }
  },

  'NC.5.NF.1': {
    standardCode: 'NC.5.NF.1',
    title: 'Add & Subtract Fractions with Unlike Denominators',
    coreConcept: 'Fractions cannot be added or subtracted until they describe equal-sized parts (common denominator). Convert to equivalent fractions with common denominators before operating.',
    rulesAndFormulas: [
      { label: 'Common Denominators', detail: 'Find Least Common Multiple (LCM) of denominators (e.g. for 4 and 6, LCM = 12).' },
      { label: 'Equivalent Fractions', detail: 'Multiply numerator and denominator by same factor: 3/4 = (3×3)/(4×3) = 9/12.' },
      { label: 'Borrowing for Subtraction', detail: 'If subtracting 1 3/4 from 4 1/4, borrow 1 from 4: 4 1/4 = 3 + 4/4 + 1/4 = 3 5/4.' }
    ],
    stepByStepMethod: [
      'Step 1: Find LCM of the two denominators.',
      'Step 2: Rename each fraction as an equivalent fraction with the common denominator.',
      'Step 3: Add or subtract only the numerators; keep the denominator the same.',
      'Step 4: If mixed numbers, combine whole numbers and fractional parts. Simplify or convert improper fractions.'
    ],
    commonTraps: [
      'Adding across numerators AND denominators (e.g. 1/2 + 1/3 = 2/5 — this is FALSE!).',
      'Forgetting to borrow a whole correctly when the top fraction is smaller in subtraction.'
    ],
    workedExample: {
      problem: 'Solve: 5 1/6 - 2 3/4',
      steps: [
        '1. Find common denominator for 6 and 4: LCM is 12.',
        '2. Convert fractions: 1/6 = 2/12; 3/4 = 9/12. Expression is: 5 2/12 - 2 9/12.',
        '3. Since 2/12 < 9/12, borrow 1 whole from 5: 5 2/12 = 4 + 12/12 + 2/12 = 4 14/12.',
        '4. Subtract whole numbers: 4 - 2 = 2.',
        '5. Subtract fractions: 14/12 - 9/12 = 5/12.',
        '6. Combine: 2 5/12.'
      ],
      answer: '2 5/12',
      whyItMattersForSSA: 'Fractions make up ~41% of the NC Grade 5 assessment. Subtraction with regrouping is the #1 tested concept.'
    }
  },

  'NC.5.NF.3': {
    standardCode: 'NC.5.NF.3',
    title: 'Interpret Fraction as Division (a/b = a ÷ b)',
    coreConcept: 'Any fraction a/b is mathematically equivalent to dividing numerator a by denominator b. When a quantity is shared equally, the answer is a fraction or mixed number.',
    rulesAndFormulas: [
      { label: 'Fraction as Division', detail: 'a/b = a ÷ b. The numerator is the dividend (amount shared), denominator is divisor (number of shares).' },
      { label: 'Mixed Number Conversion', detail: 'Improper fraction 11/4 = 11 ÷ 4 = 2 with remainder 3 = 2 3/4.' }
    ],
    stepByStepMethod: [
      'Step 1: Identify WHAT is being shared (numerator / dividend).',
      'Step 2: Identify WHO or HOW MANY parts it is shared among (denominator / divisor).',
      'Step 3: Write as fraction: (Amount Shared) / (Number of Shares).',
      'Step 4: Convert improper fraction to mixed number if greater than 1.'
    ],
    commonTraps: [
      'Inverting numerator and denominator because students assume the larger number must go on top (e.g. 5 friends share 3 pizzas: each gets 3/5 of a pizza, NOT 5/3!).'
    ],
    workedExample: {
      problem: 'Seven students share 4 bags of craft beads equally. How many bags of beads does each student receive?',
      steps: [
        '1. What is being shared? The 4 bags of beads (Numerator = 4).',
        '2. Who is sharing? The 7 students (Denominator = 7).',
        '3. Division statement: 4 ÷ 7.',
        '4. As a fraction: 4/7 bag of beads.'
      ],
      answer: '4/7 bag of beads',
      whyItMattersForSSA: 'CASE tests will try to trick students into picking 7/4 = 1 3/4 by reversing the scenario.'
    }
  },

  'NC.5.NF.4': {
    standardCode: 'NC.5.NF.4',
    title: 'Multiply Fractions & Mixed Numbers; Area Models',
    coreConcept: 'Multiplying a fraction by a fraction finds a part of a part. Area of a rectangle with fractional sides = base × height. Multiplying by a number < 1 shrinks the value; multiplying by > 1 grows the value.',
    rulesAndFormulas: [
      { label: 'Fraction Multiplication', detail: '(a/b) × (c/d) = (a × c) / (b × d).' },
      { label: 'Mixed Numbers', detail: 'Convert to improper fractions first! 2 1/2 × 1 1/3 = (5/2) × (4/3) = 20/6 = 10/3 = 3 1/3.' },
      { label: 'Scaling Concept', detail: 'If you multiply 8 by 3/4, the product is LESS than 8 because 3/4 < 1.' }
    ],
    stepByStepMethod: [
      'Step 1: Convert any mixed numbers or whole numbers into fractions.',
      'Step 2: Simplify across diagonals before multiplying (cancel common factors).',
      'Step 3: Multiply numerators together, then denominators together.',
      'Step 4: Simplify resulting fraction or convert to mixed number.'
    ],
    commonTraps: [
      'Trying to find a common denominator before multiplying! Common denominators are ONLY for addition and subtraction!',
      'When multiplying mixed numbers like 2 1/2 × 3 1/2, multiplying only whole numbers and only fractions (2×3 + 1/2×1/2). You MUST convert to improper fractions first!'
    ],
    workedExample: {
      problem: 'A rectangular garden bed has a length of 3 1/2 feet and a width of 2 2/3 feet. What is the area of the garden bed in square feet?',
      steps: [
        '1. Area = length × width = 3 1/2 × 2 2/3.',
        '2. Convert to improper fractions: 3 1/2 = 7/2; 2 2/3 = 8/3.',
        '3. Multiply: (7/2) × (8/3) = (7 × 8) / (2 × 3) = 56 / 6.',
        '4. Simplify: 56/6 = 28/3 = 9 1/3 sq ft.'
      ],
      answer: '9 1/3 square feet',
      whyItMattersForSSA: 'Area models with fractional sides connect 2D geometry and fraction operations.'
    }
  },

  'NC.5.NF.7': {
    standardCode: 'NC.5.NF.7',
    title: 'Divide Unit Fractions & Whole Numbers',
    coreConcept: 'Dividing a whole number by a unit fraction (e.g. 5 ÷ 1/4) asks: "How many 1/4s fit into 5?" (Answer: 20). Dividing a unit fraction by a whole number (e.g. 1/4 ÷ 5) asks: "If 1/4 is split into 5 equal parts, what is each part?" (Answer: 1/20).',
    rulesAndFormulas: [
      { label: 'Whole ÷ Unit Fraction', detail: 'W ÷ (1/d) = W × d (Result is a large whole number).' },
      { label: 'Unit Fraction ÷ Whole', detail: '(1/d) ÷ W = 1 / (d × W) (Result is a tiny fraction).' }
    ],
    stepByStepMethod: [
      'Step 1: Identify which comes FIRST: the whole number or the fraction?',
      'Step 2: If WHOLE NUMBER comes first (e.g. 6 ÷ 1/3), the answer will be a WHOLE NUMBER (6 × 3 = 18).',
      'Step 3: If FRACTION comes first (e.g. 1/3 ÷ 6), the answer will be a SMALL FRACTION (1 / (3 × 6) = 1/18).',
      'Step 4: Draw a tape diagram or bar model to verify.'
    ],
    commonTraps: [
      'Getting the reciprocal backwards and confusing 1/12 with 12.',
      'Always remember: if you start with a fraction (1/4), dividing it into parts makes an even smaller fraction (1/20)!'
    ],
    workedExample: {
      problem: 'Chef Andre has 1/3 pan of lasagna left. He divides it equally among 4 kitchen helpers to take home. What fraction of the original whole pan does each helper receive?',
      steps: [
        '1. Starting amount: 1/3 pan (Fraction comes first!).',
        '2. Number of helpers sharing: 4.',
        '3. Division equation: (1/3) ÷ 4.',
        '4. Each helper gets 1/4 of the 1/3: (1/3) × (1/4) = 1/12 of the pan.'
      ],
      answer: '1/12 of the pan',
      whyItMattersForSSA: 'High-frequency question on NC assessments; word problems test conceptual reasoning.'
    }
  },

  'NC.5.MD.1': {
    standardCode: 'NC.5.MD.1',
    title: 'Measurement Unit Conversions (Multiplicative Reasoning)',
    coreConcept: 'Converting between units within the same system. When converting from a larger unit to a smaller unit, multiply. When converting from a smaller unit to a larger unit, divide.',
    rulesAndFormulas: [
      { label: 'Customary Length', detail: '1 ft = 12 in; 1 yd = 3 ft = 36 in; 1 mi = 5,280 ft = 1,760 yd.' },
      { label: 'Customary Weight & Capacity', detail: '1 lb = 16 oz; 1 ton = 2,000 lb. 1 gal = 4 qt = 8 pt = 16 cups; 1 cup = 8 fl oz.' },
      { label: 'Metric System (Powers of 10)', detail: '1 m = 100 cm = 1,000 mm; 1 km = 1,000 m. 1 kg = 1,000 g. 1 L = 1,000 mL.' }
    ],
    stepByStepMethod: [
      'Step 1: Identify starting unit and target unit.',
      'Step 2: Are you converting LARGER -> SMALLER (Multiply!) or SMALLER -> LARGER (Divide!)?',
      'Step 3: Determine the conversion factor (e.g. 12 inches per foot, 1,000 meters per km).',
      'Step 4: Multiply or divide, and include correct unit labels.'
    ],
    commonTraps: [
      'Dividing instead of multiplying (e.g. converting 5 feet to inches by doing 5 ÷ 12 instead of 5 × 12). Tip: "Horse to fly, multiply! Fly to horse, divide of course!"',
      'Mixing up metric prefixes (centimeters = 1/100, millimeters = 1/1,000).'
    ],
    workedExample: {
      problem: 'A punch recipe calls for 3 quarts of lemon-lime soda, 2 pints of orange juice, and 4 cups of pineapple juice. How many total cups of punch will this make?',
      steps: [
        '1. Target unit is cups.',
        '2. Convert 3 quarts to cups: 1 quart = 4 cups, so 3 qt = 3 × 4 = 12 cups.',
        '3. Convert 2 pints to cups: 1 pint = 2 cups, so 2 pt = 2 × 2 = 4 cups.',
        '4. Pineapple juice is already in cups: 4 cups.',
        '5. Total = 12 + 4 + 4 = 20 cups.'
      ],
      answer: '20 cups',
      whyItMattersForSSA: 'Real assessment items are almost always multi-step problems with mixed units.'
    }
  },

  'NC.5.MD.2': {
    standardCode: 'NC.5.MD.2',
    title: 'Represent & Interpret Data with Line Plots (Fractions)',
    coreConcept: 'Line plots display data along a horizontal number line marked with fractional intervals (halves, fourths, eighths). Questions ask to find totals, differences between extreme values, or redistributions.',
    rulesAndFormulas: [
      { label: 'Reading an X', detail: 'Each "X" above a tick mark represents one individual measurement data point.' },
      { label: 'Finding the Total', detail: 'Multiply each fraction value by the count of Xs above it, then sum the products.' },
      { label: 'Range', detail: 'Difference between the largest data point and smallest data point.' }
    ],
    stepByStepMethod: [
      'Step 1: Check the scale of the number line (e.g. increments of 1/8 or 1/4).',
      'Step 2: Count the Xs above each fractional tick mark.',
      'Step 3: Calculate requested quantity (total weight, average, or difference).',
      'Step 4: Use common denominators to perform fraction addition/subtraction.'
    ],
    commonTraps: [
      'Counting the tick marks instead of the number of "X"s.',
      'Forgetting that tick marks without an X are still part of the number line scale.'
    ],
    workedExample: {
      problem: 'A scientist records sample insect lengths in inches: 1/4, 1/2, 3/8, 1/4, 5/8, 1/2, 3/8, 1/4. What is the difference between the longest and shortest insect?',
      steps: [
        '1. Longest insect: 5/8 inch.',
        '2. Shortest insect: 1/4 inch.',
        '3. Difference: 5/8 - 1/4 = 5/8 - 2/8 = 3/8 inch.'
      ],
      answer: '3/8 inch',
      whyItMattersForSSA: 'Combines data interpretation with fraction operations.'
    }
  },

  'NC.5.MD.4': {
    standardCode: 'NC.5.MD.4',
    title: 'Volume Concept & Counting Unit Cubes',
    coreConcept: 'Volume measures the amount of 3D space an object occupies, measured in cubic units (cubic inches, cubic cm). A rectangular prism can be filled completely with unit cubes without gaps or overlaps.',
    rulesAndFormulas: [
      { label: 'Unit Cube', detail: 'A cube with 1 unit length, 1 unit width, and 1 unit height has a volume of 1 cubic unit (1 unit³).' },
      { label: 'Layering Principle', detail: 'Count cubes in the bottom layer (Base = length × width), then multiply by number of layers (height).' }
    ],
    stepByStepMethod: [
      'Step 1: Count cubes along length (row) and width (column) to find cubes in one layer.',
      'Step 2: Count how many layers tall the prism is (height).',
      'Step 3: Total volume = (Cubes in one layer) × (Number of layers).'
    ],
    commonTraps: [
      'Counting only the cubes visible on the outside faces rather than all cubes in the interior.',
      'Confusing square units (area, 2D) with cubic units (volume, 3D).'
    ],
    workedExample: {
      problem: 'A box is packed with unit cubes. The bottom layer has 4 rows with 6 cubes in each row. The box is packed 5 layers high without any gaps. What is the volume of the box?',
      steps: [
        '1. Cubes in bottom layer: 4 × 6 = 24 unit cubes.',
        '2. Number of layers: 5.',
        '3. Total volume = 24 × 5 = 120 cubic units.'
      ],
      answer: '120 cubic units',
      whyItMattersForSSA: 'Builds the conceptual foundation for the volume formula tested on CASE.'
    }
  },

  'NC.5.MD.5': {
    standardCode: 'NC.5.MD.5',
    title: 'Volume Formulas & Composite Rectangular Prisms',
    coreConcept: 'Calculate volume using V = l × w × h or V = B × h (where B is base area). Find volumes of composite solid figures by decomposing them into non-overlapping rectangular prisms and adding the volumes.',
    rulesAndFormulas: [
      { label: 'Volume Formula', detail: 'Volume = length × width × height (V = l × w × h).' },
      { label: 'Base Area Formula', detail: 'Volume = Base Area × height (V = B × h).' },
      { label: 'Additive Volume', detail: 'Total Volume of Composed Figure = Volume(Prism A) + Volume(Prism B).' }
    ],
    stepByStepMethod: [
      'Step 1: For simple prisms: multiply length × width × height.',
      'Step 2: For composite (L-shaped) figures: slice the figure into two clean non-overlapping rectangular prisms.',
      'Step 3: Determine missing edge lengths for each sub-prism by subtracting known parallel edges.',
      'Step 4: Calculate volume of Prism A, volume of Prism B, and add them together.'
    ],
    commonTraps: [
      'Using the full outer dimensions for both sub-prisms when slicing an L-shaped figure.',
      'Multiplying all numbers shown on the diagram blindly without identifying which belong to which prism.'
    ],
    workedExample: {
      problem: 'An L-shaped storage container is composed of two rectangular prisms. Prism A has dimensions 8 ft long by 4 ft wide by 3 ft high. Prism B has dimensions 5 ft long by 4 ft wide by 6 ft high. What is the total volume?',
      steps: [
        '1. Volume of Prism A = 8 × 4 × 3 = 96 cubic feet.',
        '2. Volume of Prism B = 5 × 4 × 6 = 120 cubic feet.',
        '3. Add the non-overlapping volumes: 96 + 120 = 216 cubic feet.'
      ],
      answer: '216 cubic feet',
      whyItMattersForSSA: 'Composite figures are among the highest-discriminating items on the SSA math test.'
    }
  },

  'NC.5.G.1': {
    standardCode: 'NC.5.G.1',
    title: 'Coordinate Plane & Quadrant 1 Coordinates',
    coreConcept: 'The coordinate plane is formed by two perpendicular number lines: the horizontal x-axis and vertical y-axis intersecting at the origin (0,0). An ordered pair (x, y) gives coordinates: x tells how far to move right from origin, y tells how far to move up.',
    rulesAndFormulas: [
      { label: 'Origin', detail: '(0, 0) is the starting reference point.' },
      { label: 'Ordered Pair (x, y)', detail: 'x comes first (horizontal axis, run), y comes second (vertical axis, jump).' },
      { label: 'Distance along axes', detail: 'Distance between (2, 7) and (8, 7) = 8 - 2 = 6 units (horizontal).' }
    ],
    stepByStepMethod: [
      'Step 1: Always start at the origin (0,0).',
      'Step 2: Look at the x-coordinate: move that many units RIGHT along the horizontal axis.',
      'Step 3: Look at the y-coordinate: move that many units UP parallel to the vertical axis.',
      'Step 4: Plot and label your point.'
    ],
    commonTraps: [
      'Reversing x and y (moving up first, then right). Remember: "Walk into the elevator (x) before you ride it up (y)!"',
      'Confusing points on the axes: (0, 4) is on the y-axis (0 right, 4 up); (4, 0) is on the x-axis (4 right, 0 up).'
    ],
    workedExample: {
      problem: 'Point A is located at (3, 8) and Point B is located at (9, 8). Point C is placed to form a right triangle with right angle at Point B, and the vertical distance from B to C is 5 units upward. What are the coordinates of Point C?',
      steps: [
        '1. Point B is at (9, 8).',
        '2. Point C is directly above Point B, so it has the same x-coordinate: x = 9.',
        '3. Vertical distance is 5 units upward from y = 8: y = 8 + 5 = 13.',
        '4. Coordinates of Point C are (9, 13).'
      ],
      answer: '(9, 13)',
      whyItMattersForSSA: 'Connects coordinate plane navigation with geometric properties.'
    }
  },

  'NC.5.G.3': {
    standardCode: 'NC.5.G.3',
    title: 'Classify Quadrilaterals by Properties in a Hierarchy',
    coreConcept: 'Two-dimensional figures are classified based on their geometric properties (parallel sides, perpendicular sides, equal side lengths, right angles). Any property that belongs to a parent category automatically belongs to all of its subcategories.',
    rulesAndFormulas: [
      { label: 'Polygon', detail: 'Closed 2D figure made of straight line segments.' },
      { label: 'Quadrilateral', detail: '4-sided polygon.' },
      { label: 'Trapezoid (NC Definition)', detail: 'A quadrilateral with EXACTLY ONE pair of parallel sides (exclusive definition: parallelograms, rectangles, rhombuses and squares are not trapezoids).' },
      { label: 'Parallelogram', detail: 'A quadrilateral with 2 pairs of parallel sides and opposite sides equal.' },
      { label: 'Rectangle', detail: 'A parallelogram with 4 right angles.' },
      { label: 'Rhombus', detail: 'A parallelogram with 4 equal sides.' },
      { label: 'Square', detail: 'A parallelogram with 4 equal sides AND 4 right angles (both a rectangle AND a rhombus!).' }
    ],
    stepByStepMethod: [
      'Step 1: Check number of sides (must be 4 for quadrilateral).',
      'Step 2: Check pairs of parallel sides (0 = general quadrilateral, 1 = trapezoid, 2 = parallelogram).',
      'Step 3: Check side lengths (4 equal sides = rhombus).',
      'Step 4: Check angles (4 right angles = rectangle).',
      'Step 5: If both 4 equal sides AND 4 right angles = square.'
    ],
    commonTraps: [
      'Thinking a shape can only have ONE name (a square is simultaneously a square, a rectangle, a rhombus, a parallelogram, and a quadrilateral!).',
      'Calling a parallelogram a trapezoid. North Carolina uses the exclusive definition, exactly one pair of parallel sides, so a shape with two pairs is a parallelogram, not a trapezoid.',
      'Thinking all rectangles are squares (False: rectangles do not necessarily have 4 equal sides).'
    ],
    workedExample: {
      problem: 'Is the following statement True or False? Explain: "Every rhombus is a square."',
      steps: [
        '1. A rhombus is defined as a quadrilateral with 4 equal sides.',
        '2. A square requires 4 equal sides AND 4 right angles (90 degrees).',
        '3. A rhombus can have angles that are not 90 degrees (e.g. 60° and 120°).',
        '4. Therefore, not every rhombus is a square (False).'
      ],
      answer: 'False. A rhombus only needs 4 equal sides; it does not require right angles.',
      whyItMattersForSSA: 'CASE questions love logic tests: "All squares are rectangles, but not all rectangles are squares."'
    }
  }
};
