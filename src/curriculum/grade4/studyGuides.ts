import type { StudyGuideSection } from '../../types';

/** One revision guide per Grade 4 standard, written to be read by a child and
 *  a parent together at the kitchen table.
 *
 *  Two rules bind every entry:
 *
 *  1. The mathematics comes from this grade's `standards.ts` - the sourced NC
 *     text and its keyConcepts - not from what a code is assumed to mean.
 *  2. Every percentage traces to `docs/sources/nc-eog-blueprint.json`.
 *     Measurement & Data and Geometry share ONE 23-27% band at grade 4, so
 *     those guides cite the pair and name both domains; a figure attached to
 *     either domain alone would be one NCDPI never published.
 *
 *  `commonTraps` deliberately echo the wording of the authored banks'
 *  `commonMisconception` lines, so a child who missed an item meets their own
 *  mistake again here in the same words.
 */
export const GRADE_4_STUDY_GUIDES: Record<string, StudyGuideSection> = {
  // ----------------------------------------------------------------------
  // Number & Operations - Fractions (30-34%)
  // ----------------------------------------------------------------------
  'NC.4.NF.1': {
    standardCode: 'NC.4.NF.1',
    title: 'Equivalent Fractions: Same Amount, Different Pieces',
    coreConcept:
      'Two fractions can name exactly the same amount even though one whole was cut into more pieces than the other. When you cut every piece into the same number of smaller pieces, you get more parts AND smaller parts at the same time, so the shaded amount never changes.',
    rulesAndFormulas: [
      { label: 'Multiply both parts by the same factor', detail: 'a/b = (a x n)/(b x n). Cutting each of 3 parts into 4 gives 12 parts, and each shaded part becomes 4 shaded parts.' },
      { label: 'Area model', detail: 'Shade the fraction of a rectangle, then draw new lines straight across every part. The shaded region does not move - only the count of parts changes.' },
      { label: 'Length model', detail: 'On a number line, 2/3 and 8/12 land on exactly the same point. Equivalent fractions are the same distance from 0.' },
      { label: 'Adding is NOT allowed', detail: 'Adding the same number to the top and the bottom changes the amount. Only multiplying (or dividing) both parts by the same factor keeps it.' },
    ],
    stepByStepMethod: [
      'Step 1: Ask how many smaller pieces each original piece was cut into. That number is your factor.',
      'Step 2: Multiply the denominator by the factor - this is the new total number of parts.',
      'Step 3: Multiply the numerator by the same factor - each shaded part became that many shaded parts.',
      'Step 4: Check with a size test: both fractions should sit in the same place on the strip (a bit past half, nearly a whole, and so on).',
    ],
    commonTraps: [
      'Adding the same number to both parts instead of multiplying: 2/3 becomes 11/12, which is nearly a whole, while 2/3 is only a little over half. Adding the same amount to both parts does not preserve a fraction; only multiplying does.',
      'Keeping the old numerator after the parts are re-cut. Answering 3/12 when the rectangle was re-cut shades only half as much as before - the new lines cannot have removed any shading.',
      'Using the denominator as the new numerator, as if the bottom number told you how many parts are shaded.',
      'Comparing numerators only, or denominators only. Neither number decides anything on its own - more parts, each smaller, can land on exactly the same amount.',
    ],
    workedExample: {
      problem:
        'Sofia shades 2 of the 3 equal parts of a rectangle. She then draws lines that cut each of the 3 parts into 4 smaller parts. Write the fraction that is now shaded, and explain why it equals 2/3.',
      steps: [
        '1. Each of the 3 parts became 4 parts, so the whole rectangle now has 3 x 4 = 12 equal parts.',
        '2. Each of the 2 shaded parts also became 4 shaded parts, so 2 x 4 = 8 parts are shaded.',
        '3. The new fraction is 8/12, which is 2/3 x 4/4.',
        '4. The pencil lines added no paint. The number of parts went up and the size of each part went down, so the shaded amount is unchanged: 2/3 = 8/12.',
      ],
      answer: '8/12 (the same amount as 2/3)',
      whyItMattersForSSA:
        'Fractions are the largest reporting category on the Grade 4 EOG at 30–34%, and equivalence is the tool every other fraction question leans on - comparing, adding and rewriting tenths as hundredths all start here.',
    },
  },

  'NC.4.NF.2': {
    standardCode: 'NC.4.NF.2',
    title: 'Comparing Fractions with Different Tops and Bottoms',
    coreConcept:
      'You cannot compare two fractions by looking at one number at a time. Either rewrite them so they share a denominator (same size pieces) or share a numerator (same number of pieces), or use a benchmark like 0, 1/2 and 1 to separate them. A comparison only means something when both fractions describe the same whole.',
    rulesAndFormulas: [
      { label: 'Same denominator', detail: 'When the pieces are the same size, more pieces wins: 15/24 < 16/24.' },
      { label: 'Same numerator', detail: 'When the number of pieces is the same, BIGGER denominator means smaller pieces, so the fraction is smaller: 3/8 < 3/5.' },
      { label: 'Benchmarks 0, 1/2, 1', detail: 'A fraction is more than 1/2 when the numerator is more than half the denominator. Benchmarks settle it only when the two fractions land on opposite sides.' },
      { label: 'Same whole', detail: 'Half of a small pizza is not more than a quarter of a large one. Comparisons are valid only when both fractions refer to the same whole.' },
      { label: 'Symbols', detail: 'Record the result with >, = or <, and say which fraction is bigger out loud to check the symbol points at the smaller one.' },
    ],
    stepByStepMethod: [
      'Step 1: Check that both fractions are parts of the same whole. If they are not, no symbol is correct.',
      'Step 2: Try benchmarks first. If one fraction is below 1/2 and the other is above it, you are done.',
      'Step 3: If both are on the same side, find a common denominator - a number both denominators divide into, such as 8 x 3 = 24.',
      'Step 4: Multiply the top and bottom of each fraction by whatever it takes to reach that denominator.',
      'Step 5: Compare the numerators and record the result with >, = or <.',
    ],
    commonTraps: [
      'Reading 1/8 > 1/3 off the digits 8 and 3. The bigger the denominator, the more pieces the whole was cut into, and so the SMALLER each piece is.',
      'Benchmarks left unfinished. Benchmarks are a real strategy, but they only finish the job when the two fractions land on OPPOSITE sides of 1/2. Both above 1/2 means the comparison still has to be made.',
      'Comparing numerators only - picking the biggest top number - or picking the smallest denominator. Both rules work sometimes, and neither is reliable.',
      'Comparing across different wholes, so a fraction of a small thing is judged against a fraction of a large one.',
    ],
    workedExample: {
      problem: 'Compare 5/8 and 2/3 using >, = or <. Both fractions describe the same size chocolate bar.',
      steps: [
        '1. Benchmark check: 5/8 is more than half (half of 8 is 4), and 2/3 is more than half too. Both are on the same side, so benchmarks do not settle it.',
        '2. Find a common denominator: 8 x 3 = 24 works.',
        '3. 5/8 = (5 x 3)/(8 x 3) = 15/24.',
        '4. 2/3 = (2 x 8)/(3 x 8) = 16/24.',
        '5. Same size pieces now, so compare the counts: 15 pieces < 16 pieces.',
      ],
      answer: '5/8 < 2/3',
      whyItMattersForSSA:
        'Comparison items appear all through the fractions band, which is 30–34% of the Grade 4 EOG, and the same left-to-right place value habit is what carries a child through comparing decimals later in the year.',
    },
  },

  'NC.4.NF.3': {
    standardCode: 'NC.4.NF.3',
    title: 'Breaking Apart, Adding and Subtracting Fractions',
    coreConcept:
      'Adding fractions is joining parts of the same whole and subtracting is separating them, so the size of the pieces - the denominator - never changes. Any fraction can also be broken into a sum of smaller pieces in more than one way, and the check is always the same: add the pieces back up and see whether you get the fraction you started with.',
    rulesAndFormulas: [
      { label: 'Like denominators', detail: 'a/d + b/d = (a + b)/d and a/d - b/d = (a - b)/d. Add or subtract the numerators; keep the denominator.' },
      { label: 'Decomposing', detail: '3/4 = 1/4 + 1/4 + 1/4, and also 3/4 = 2/4 + 1/4. There is more than one right decomposition.' },
      { label: 'Mixed number to fraction', detail: '3 1/5 = 15/5 + 1/5 = 16/5. Replace the whole number with an equivalent fraction when you need to regroup.' },
      { label: 'Regrouping across the whole', detail: 'To take 4/5 from 3 1/5, trade one whole for 5/5: 3 1/5 becomes 2 6/5.' },
      { label: 'Word problems', detail: 'Write the equation from the picture first - a bar or number line - then compute.' },
    ],
    stepByStepMethod: [
      'Step 1: Check that both fractions have the same denominator. At Grade 4 they always will.',
      'Step 2: If it is a subtraction and the top fraction is too small, trade one whole for that many fifths, eighths or twelfths first.',
      'Step 3: Add or subtract the whole numbers.',
      'Step 4: Add or subtract the numerators only. Write the same denominator underneath.',
      'Step 5: If the fraction part came out bigger than one whole, trade it back into the whole number.',
      'Step 6: Check by adding your answer to what you took away - you should land back on the starting amount.',
    ],
    commonTraps: [
      'Operating on the like denominators too. Adding the denominators gives 5/16, which is less than the 3/8 you started with - pouring water into milk cannot leave you with less liquid than the milk alone.',
      'Forgetting to regroup, and dodging it by taking the smaller number from the larger inside the fraction part. Add the answer back to check it.',
      'Decomposing the denominator as well as the numerator. Splitting tenths into fifths doubles the size of every piece, so the total grows.',
      'Writing 4 copies of 1/4 when the fraction to decompose was 3/4 - that decomposes the WHOLE, not the fraction you were given.',
      'Dropping one part of the problem, so one of the days or one of the jars never gets counted.',
    ],
    workedExample: {
      problem: 'A jug held 3 1/5 liters of juice. The family drank 1 4/5 liters. How much juice is left?',
      steps: [
        '1. Write the subtraction: 3 1/5 - 1 4/5.',
        '2. 1/5 is smaller than 4/5, so trade one whole for 5/5: 3 1/5 = 2 and 1/5 + 5/5 = 2 6/5.',
        '3. Whole numbers: 2 - 1 = 1.',
        '4. Fifths: 6/5 - 4/5 = 2/5. The denominator stays 5.',
        '5. Answer: 1 2/5 liters.',
        '6. Check: 1 2/5 + 1 4/5 = 2 6/5 = 3 1/5, exactly what the jug held.',
      ],
      answer: '1 2/5 liters',
      whyItMattersForSSA:
        'Fraction addition and subtraction with regrouping is the most heavily tested idea inside the 30–34% fractions band, and it is the skill Grade 5 builds unlike denominators on top of.',
    },
  },

  'NC.4.NF.4': {
    standardCode: 'NC.4.NF.4',
    title: 'Multiplying a Fraction by a Whole Number',
    coreConcept:
      'Multiplying by a whole number is repeated copying, so 7 x 3/8 means seven copies of 3/8. Each copy is made of the same size pieces, so you count up the pieces - the numerator grows and the denominator, which only says how big each piece is, stays exactly where it is.',
    rulesAndFormulas: [
      { label: 'Whole number x fraction', detail: 'n x a/b = (n x a)/b. Multiply the numerator only.' },
      { label: 'Unit fractions first', detail: '3/8 = 3 x 1/8, so 7 x 3/8 = 21 x 1/8 = 21/8. Counting eighths is what makes it work.' },
      { label: 'Improper to mixed', detail: '21/8 = 16/8 + 5/8 = 2 5/8. Divide the numerator by the denominator: 21 / 8 = 2 remainder 5.' },
      { label: 'Estimate to bracket the answer', detail: '3/8 is between 1/4 and 1/2, so 7 copies must land between 1 3/4 and 3 1/2.' },
    ],
    stepByStepMethod: [
      'Step 1: Say the problem out loud as repeated copies: "seven lots of three eighths".',
      'Step 2: Multiply the whole number by the numerator.',
      'Step 3: Write that result over the SAME denominator.',
      'Step 4: If the numerator is bigger than the denominator, change it to a mixed number.',
      'Step 5: Estimate to check. The answer must be bigger than the fraction you started with, because you made several copies of it.',
    ],
    commonTraps: [
      'Multiplying the denominator too. 4 x 2/5 written as 8/20 is the same amount as 2/5 - one serving. Four servings must be MORE than one, so that answer fails before any arithmetic is checked.',
      'Borrowing the rule "do the same thing to the top and the bottom" from equivalent fractions. Applied to multiplication it undoes itself and the answer comes back unchanged.',
      'Adding when the problem says "times as much", so 7 x 3/8 becomes 7 + 3/8.',
      'Forgetting to scale by the whole number at all and reporting the single share as the total.',
    ],
    workedExample: {
      problem: 'Amira runs 3/8 of a mile each lap. She runs 7 laps. How far does she run altogether?',
      steps: [
        '1. Seven copies of 3/8: 7 x 3/8.',
        '2. Each lap is 3 eighths, so 7 laps is 7 x 3 = 21 eighths.',
        '3. Write it over the same denominator: 21/8.',
        '4. Change to a mixed number: 21 / 8 = 2 remainder 5, so 21/8 = 2 5/8.',
        '5. Estimate check: 3/8 is between 1/4 and 1/2, so 7 laps must be between 1 3/4 and 3 1/2 miles. 2 5/8 sits inside that range.',
      ],
      answer: '2 5/8 miles',
      whyItMattersForSSA:
        'This is the first multiplication of a fraction a child ever meets, and it sits inside the 30–34% fractions band; Grade 5 extends exactly this reasoning to a fraction times a fraction.',
    },
  },

  'NC.4.NF.6': {
    standardCode: 'NC.4.NF.6',
    title: 'Tenths, Hundredths and Decimal Notation',
    coreConcept:
      'A tenth and a hundredth are two ways of slicing the same whole, and one tenth is worth exactly ten hundredths. That is why 4/10 can be rewritten as 40/100, and why two fractions with denominators of 10 and 100 can be added once they are both in hundredths. The decimal point is just another way of writing the same two places.',
    rulesAndFormulas: [
      { label: 'Tenths to hundredths', detail: '4/10 = (4 x 10)/(10 x 10) = 40/100. Multiply BOTH parts by 10.' },
      { label: 'Fraction to decimal', detail: '7/10 = 0.7 (one place). 47/100 = 0.47 (two places).' },
      { label: 'The placeholder zero', detail: '9/100 = 0.09, not 0.9. The zero holds the tenths place open so the 9 stays in hundredths.' },
      { label: 'Adding tenths and hundredths', detail: 'Rewrite the tenths as hundredths first, then add: 4/10 + 7/100 = 40/100 + 7/100.' },
      { label: 'Models', detail: 'A 10 x 10 grid: one column is a tenth, one small square is a hundredth. Shade to see why ten squares make one column.' },
    ],
    stepByStepMethod: [
      'Step 1: Look at the denominators. If one is 10 and the other is 100, the tenths have to be rescaled.',
      'Step 2: Multiply both the numerator and the denominator of the tenths fraction by 10.',
      'Step 3: Now that both are hundredths, add the numerators and keep the denominator 100.',
      'Step 4: Write the decimal: the tenths digit first, then the hundredths digit. Insert a zero in any empty place.',
      'Step 5: Check the size of your answer against the story. Does the number make sense for a pencil, a coin or a bottle?',
    ],
    commonTraps: [
      'Adding 4 and 7 to get 11 hundredths. That treats a tenth as though it were a hundredth. One tenth is ten times bigger, and the rescaling has to happen before anything is added.',
      'Scaling the denominator only: turning 6/10 into 6/100, which is a tenth of the amount you started with. Rescaling means multiplying BOTH parts by the same factor.',
      'Omitting the placeholder zero, so 9/100 is written 0.9. That shades nine whole columns - ninety squares instead of nine.',
      'Swapping the place values and reading the second decimal digit as tenths.',
      'Ignoring the size of the answer. Writing 1.8 for the length of a pencil says it is nearly two meters long.',
    ],
    workedExample: {
      problem: 'A ribbon is 4/10 of a meter long. Another piece is 7/100 of a meter. Write the total length as a fraction and as a decimal.',
      steps: [
        '1. The denominators are different sizes, so rewrite the tenths as hundredths.',
        '2. 4/10 = (4 x 10)/(10 x 10) = 40/100.',
        '3. Now add: 40/100 + 7/100 = 47/100.',
        '4. As a decimal, 47/100 has 4 tenths and 7 hundredths: 0.47.',
        '5. Size check: 0.47 is a little under half a meter, which is sensible for two short ribbons.',
      ],
      answer: '47/100 of a meter, or 0.47 m',
      whyItMattersForSSA:
        'Decimal notation belongs to the fractions band, which is 30–34% of the Grade 4 EOG - the biggest on the test - and every Grade 5 decimal operation assumes a child can already move between 4/10, 40/100 and 0.40.',
    },
  },

  'NC.4.NF.7': {
    standardCode: 'NC.4.NF.7',
    title: 'Comparing Decimals to Hundredths',
    coreConcept:
      'Decimals are compared place by place from the LEFT, exactly like whole numbers - tenths first, then hundredths. The number of digits after the point tells you nothing about size. Padding the shorter decimal with a zero makes the two numbers the same shape so the comparison is honest, and both decimals must describe the same whole.',
    rulesAndFormulas: [
      { label: 'Pad with a zero', detail: '0.5 = 0.50. A trailing zero changes nothing about the value and makes both numbers comparable.' },
      { label: 'Compare from the left', detail: 'Tenths decide first. Only if the tenths are equal do the hundredths matter.' },
      { label: 'Read it aloud', detail: '0.25 is "twenty-five hundredths"; 0.50 is "fifty hundredths". Said aloud, the bigger one is obvious.' },
      { label: 'Same whole', detail: '0.4 of a small bottle is not more than 0.05 of a swimming pool. The comparison is only valid when both refer to the same whole.' },
      { label: 'Symbols', detail: 'Record with >, = or <, then reread it to be sure the open end faces the larger number.' },
    ],
    stepByStepMethod: [
      'Step 1: Check that both decimals describe the same whole.',
      'Step 2: Write them one above the other with the decimal points lined up.',
      'Step 3: Pad the shorter one with a zero so both have two decimal places.',
      'Step 4: Compare the tenths digits. If they differ, you already have the answer.',
      'Step 5: If the tenths match, compare the hundredths digits.',
      'Step 6: Record the result with >, = or <.',
    ],
    commonTraps: [
      'Reading the digits after the point as whole numbers, so "twenty-five" beats "five". Padding 0.5 out to 0.50 makes the comparison honest: 50 hundredths against 25 hundredths.',
      'Comparing by digit count, as if a longer decimal must be bigger.',
      'Starting from the right and comparing the last digits first.',
      'Skipping over the placeholder zero, so 0.09 looks like the biggest number on the page. That zero says there are no tenths at all.',
      'Comparing across different wholes, and treating the answer about numbers as the answer about amounts of liquid.',
    ],
    workedExample: {
      problem: 'Two beakers of the same size are filled from the same jug. One holds 0.25 liters and one holds 0.5 liters. Compare them using >, = or <.',
      steps: [
        '1. Same size beakers, same whole, so the comparison is valid.',
        '2. Line them up and pad: 0.25 and 0.50.',
        '3. Tenths: 2 against 5. They are different, so this decides it.',
        '4. 2 tenths is less than 5 tenths, so 0.25 is the smaller amount.',
        '5. Said aloud: twenty-five hundredths against fifty hundredths.',
      ],
      answer: '0.25 < 0.5',
      whyItMattersForSSA:
        'Decimal comparison is assessed inside the 30–34% fractions band, and the "longer means bigger" error it targets is the single commonest decimal mistake children carry into Grade 5 and beyond.',
    },
  },

  // ----------------------------------------------------------------------
  // Number & Operations in Base Ten (25-29%)
  // ----------------------------------------------------------------------
  'NC.4.NBT.1': {
    standardCode: 'NC.4.NBT.1',
    title: 'Place Value: Ten Times as Much',
    coreConcept:
      'In a multi-digit number, the same digit is worth ten times as much in each place you move to the left. A 5 in the thousands place is worth 5,000; move it one place left into the ten-thousands and it is worth 50,000 - ten times as much, not ten more.',
    rulesAndFormulas: [
      { label: 'One place left', detail: 'x 10. Tens are ten times ones, hundreds are ten times tens, and so on up to 100,000.' },
      { label: 'One place right', detail: 'Divided by 10, or one tenth of. The smaller value is one tenth of its neighbor to the left.' },
      { label: 'Two places', detail: 'Two hops left is 10 x 10 = 100 times as much, not 20 times.' },
      { label: 'Digit vs value', detail: 'The digit 5 is the same in both places. What changes is its VALUE, and that is the whole point of the standard.' },
    ],
    stepByStepMethod: [
      'Step 1: Name the two places being compared out loud: "ten-thousands" and "thousands".',
      'Step 2: Write the VALUE of the digit in each place, not just the digit: 50,000 and 5,000.',
      'Step 3: Count the hops between the places. Each hop to the left is x 10.',
      'Step 4: Divide the larger value by the smaller to confirm: 50,000 / 5,000 = 10.',
      'Step 5: Say the answer in the direction the question asked - "ten times as much as" or "one tenth of".',
    ],
    commonTraps: [
      'Subtracting instead of dividing. 50,000 - 5,000 = 45,000 answers how much BIGGER one value is, not how many TIMES bigger.',
      'Getting the factor right and the direction backwards, which makes the smaller number the bigger one.',
      'Writing the digit rather than its value. The digit is the same in both places; telling them apart is the entire point.',
      'Using the wrong power of ten - saying two places is 20 times instead of 10 x 10 = 100 times.',
    ],
    workedExample: {
      problem: 'In the number 55,120, how does the value of the 5 in the ten-thousands place compare with the value of the 5 in the thousands place?',
      steps: [
        '1. The 5 in the ten-thousands place is worth 50,000.',
        '2. The 5 in the thousands place is worth 5,000.',
        '3. They are one place apart, and one hop to the left is x 10.',
        '4. Check by dividing: 50,000 / 5,000 = 10.',
        '5. So the first 5 is ten times as much as the second - and the second is one tenth of the first.',
      ],
      answer: '10 times as much (and the thousands 5 is one tenth of the ten-thousands 5)',
      whyItMattersForSSA:
        'Base Ten is 25–29% of the Grade 4 EOG, and this relationship is what makes every algorithm in the band - regrouping, partial products, partial quotients - make sense rather than be memorised.',
    },
  },

  'NC.4.NBT.2': {
    standardCode: 'NC.4.NBT.2',
    title: 'Reading and Writing Numbers to 100,000',
    coreConcept:
      'The same number can be written three ways: as numerals (60,318), as words (sixty thousand, three hundred eighteen) and in expanded form (60,000 + 300 + 10 + 8). Moving between them works only if every place is held open - including the empty ones, which need a zero.',
    rulesAndFormulas: [
      { label: 'Standard form', detail: 'Digits with a comma before the last three: 60,318.' },
      { label: 'Word form', detail: 'Say the thousands, say "thousand", then say the rest. No "and" in a whole number.' },
      { label: 'Expanded form', detail: 'Add the value of each non-zero digit: 60,000 + 300 + 10 + 8.' },
      { label: 'The zero place', detail: 'A place you do not hear still needs a 0. Sixty thousand, three hundred eighteen has no thousands digit of its own beyond the 60, so the places must be counted, not guessed.' },
      { label: 'Range', detail: 'Grade 4 works up to and including 100,000.' },
    ],
    stepByStepMethod: [
      'Step 1: Draw five or six place value boxes: hundred-thousands, ten-thousands, thousands, hundreds, tens, ones.',
      'Step 2: Fill in every place you actually hear in the words.',
      'Step 3: Put a 0 in every box you did NOT hear. Nothing may be left blank.',
      'Step 4: Read your boxes back as numerals, with a comma before the last three digits.',
      'Step 5: For expanded form, write the value of each non-zero box and join them with plus signs.',
    ],
    commonTraps: [
      'Writing the digits in the order you hear them, so a place that was never spoken is quietly skipped and the number comes out nearly a thousand too large.',
      'Reading two spoken digits as neighbors when a zero sits between them - that zero is worth a whole place.',
      'Writing just the digits that appear, giving a number about a hundred times too small, because two empty places were never held open.',
      'Stopping at standard form when the question also asked for expanded form.',
    ],
    workedExample: {
      problem: 'Write "sixty thousand, three hundred eighteen" in numerals and in expanded form.',
      steps: [
        '1. Place value boxes: ten-thousands, thousands, hundreds, tens, ones.',
        '2. "Sixty thousand" fills the ten-thousands with 6 and the thousands with 0.',
        '3. "Three hundred" puts 3 in the hundreds.',
        '4. "Eighteen" is 1 ten and 8 ones.',
        '5. Numerals: 60,318. Note the 0 holding the thousands place.',
        '6. Expanded form: 60,000 + 300 + 10 + 8.',
      ],
      answer: '60,318 = 60,000 + 300 + 10 + 8',
      whyItMattersForSSA:
        'Reading and writing large numbers is Base Ten work, and Base Ten is 25–29% of the Grade 4 EOG; a skipped zero place here turns into a wrong comparison or a wrong sum later in the same test.',
    },
  },

  'NC.4.NBT.7': {
    standardCode: 'NC.4.NBT.7',
    title: 'Comparing Numbers up to 100,000',
    coreConcept:
      'To compare two whole numbers, start at the LEFT and compare the value in each place. The first place where the digits differ decides the whole comparison, and nothing to the right of it can change the answer. A digit only means something once you know which place it is sitting in.',
    rulesAndFormulas: [
      { label: 'Count the digits first', detail: 'More digits means a bigger number: 60,318 has five digits and 6,894 has four, so 60,318 is larger before any digit is compared.' },
      { label: 'Then compare from the left', detail: 'Ten-thousands, then thousands, then hundreds, then tens, then ones.' },
      { label: 'First difference wins', detail: 'Once a place differs, stop. Digits further right are too small to matter.' },
      { label: 'Symbols', detail: '> means greater than, < means less than, = means equal. The open end always faces the larger number.' },
      { label: 'Ordering', detail: 'For "least to greatest", write the smallest first. Check the direction the question asked for before you answer.' },
    ],
    stepByStepMethod: [
      'Step 1: Line the two numbers up so their ones digits sit under each other.',
      'Step 2: Count the digits. If one number has more, it is greater and you are finished.',
      'Step 3: If they have the same number of digits, compare the leftmost place.',
      'Step 4: If those digits are equal, move one place right and compare again.',
      'Step 5: Stop at the first place where the digits differ. That place decides it.',
      'Step 6: Write the symbol, then read the sentence back to check the open end faces the larger number.',
    ],
    commonTraps: [
      'Starting at the ones digit, which gets it exactly backwards - 8 ones look bigger than 0 ones while 0 tens are what actually decide it.',
      'Reading the digits straight across without counting places, so a big digit in a small place wins an argument it should lose.',
      'Being fooled by a large leading digit: a leading 9 makes 9,984 look like the biggest number on the page when it is the smallest by about 61,000.',
      'Stopping the comparison too soon, before reaching the first place where the numbers actually differ.',
      'Ordering from the wrong end when the question asked for least to greatest.',
    ],
    workedExample: {
      problem: 'Compare 47,215 and 47,251 using >, = or <.',
      steps: [
        '1. Both numbers have five digits, so the digit count does not settle it.',
        '2. Ten-thousands: 4 and 4. Equal, keep going.',
        '3. Thousands: 7 and 7. Equal, keep going.',
        '4. Hundreds: 2 and 2. Equal, keep going.',
        '5. Tens: 1 against 5. Different - this place decides it. 1 ten is less than 5 tens.',
        '6. The ones digits (5 and 1) cannot change the result; they are worth too little.',
      ],
      answer: '47,215 < 47,251',
      whyItMattersForSSA:
        'Comparison items are a steady presence in the Base Ten band at 25–29% of the Grade 4 EOG, and the left-to-right place value habit is exactly what NC.4.NF.7 asks for again with decimals.',
    },
  },

  'NC.4.NBT.4': {
    standardCode: 'NC.4.NBT.4',
    title: 'Adding and Subtracting Big Numbers (Standard Algorithm)',
    coreConcept:
      'The standard algorithm works column by column from the right, and every carry or borrow is a trade between neighboring places: ten ones for one ten, one thousand for ten hundreds. When a place has nothing to give, you have to keep moving left until you find a place that does.',
    rulesAndFormulas: [
      { label: 'Line up the places', detail: 'Ones under ones, tens under tens. Never line numbers up by their left edge.' },
      { label: 'Carrying', detail: 'When a column adds to 10 or more, write the ones digit and carry the ten into the next column to the LEFT.' },
      { label: 'Borrowing', detail: 'Take 1 from the place to the left - it arrives as 10 in your column - and reduce that place by 1.' },
      { label: 'Borrowing across a zero', detail: 'If the neighbor is 0, keep going left. That 0 becomes 9 once it has passed the ten along.' },
      { label: 'Check by adding back', detail: 'Difference + the number you subtracted should equal what you started with.' },
    ],
    stepByStepMethod: [
      'Step 1: Write the numbers one above the other with the place values lined up, largest number on top for a subtraction.',
      'Step 2: Estimate first so you know roughly what to expect (24,600 - 18,475 is about 25,000 - 18,000 = 7,000).',
      'Step 3: Work from the ones column leftward, one column at a time.',
      'Step 4: Carry or borrow as needed, and write the change down - do not hold it in your head.',
      'Step 5: When a borrow crosses a 0, pass the trade along and reduce EVERY place it passed through.',
      'Step 6: Check by adding your answer back, and compare it to your estimate.',
    ],
    commonTraps: [
      'Subtracting without regrouping - taking the smaller digit from the larger one in each column because it is easier.',
      'Borrowing without reducing the next column, so the number you borrowed from is used at full value twice.',
      'Carrying into the wrong column, which moves the regrouped ten into a place it was never worth.',
      'Adding when the story called for subtracting, or the other way round.',
      'Forgetting the final step, so a two-part story stops in the middle - answering what the library had after giving books away, rather than what the question asked.',
    ],
    workedExample: {
      problem: 'A stadium sold 24,600 tickets for the season. 18,475 of them were sold online. How many were not sold online?',
      steps: [
        '1. Estimate: about 25,000 - 18,000 = 7,000, so expect an answer near seven thousand.',
        '2. Ones: 0 - 5 needs a trade. The tens are 0 too, so borrow from the hundreds: 6 hundreds become 5, the tens become 10, then the tens give one to the ones - tens become 9, ones become 10. 10 - 5 = 5.',
        '3. Tens: 9 - 7 = 2.',
        '4. Hundreds: 5 - 4 = 1.',
        '5. Thousands: 4 - 8 needs a trade. Borrow from the ten-thousands: 2 becomes 1, thousands become 14. 14 - 8 = 6.',
        '6. Ten-thousands: 1 - 1 = 0.',
        '7. Result: 6,125. Check: 18,475 + 6,125 = 24,600.',
      ],
      answer: '6,125 tickets',
      whyItMattersForSSA:
        'Multi-digit addition and subtraction is core Base Ten work, and Base Ten is 25–29% of the Grade 4 EOG; much of it is assessed without a calculator, so accuracy on paper is what counts.',
    },
  },

  'NC.4.NBT.5': {
    standardCode: 'NC.4.NBT.5',
    title: 'Multiplying Multi-Digit Numbers with Partial Products',
    coreConcept:
      'Multiplying 36 by 24 means multiplying 36 by 4 AND by 20, then adding the two results. An area model shows why: the rectangle splits into pieces, and the total area is the sum of the pieces. The placeholder zero is not decoration - it is what says you multiplied by 20 and not by 2.',
    rulesAndFormulas: [
      { label: 'Partial products', detail: '36 x 24 = (36 x 4) + (36 x 20) = 144 + 720 = 864.' },
      { label: 'Area model', detail: 'Draw a rectangle split into 30 + 6 by 20 + 4. The four small areas add to the answer.' },
      { label: 'Placeholder zero', detail: 'When multiplying by the tens digit, write a 0 in the ones place first, because you are multiplying by 20, not 2.' },
      { label: 'Carrying in multiplication', detail: 'Multiply the column FIRST, then add the carried digit to that product. Never the other way round.' },
      { label: 'Estimate to check', detail: '36 x 24 is close to 40 x 25 = 1,000, so an answer near 864 is believable and 216 is not.' },
    ],
    stepByStepMethod: [
      'Step 1: Estimate by rounding both factors so you know the size of the answer.',
      'Step 2: Multiply the top number by the ones digit of the bottom number. Write that partial product.',
      'Step 3: Write a 0 in the ones place of the next line.',
      'Step 4: Multiply the top number by the tens digit and write it beside that 0.',
      'Step 5: Add the partial products together.',
      'Step 6: Compare with your estimate. If they are far apart, look for a dropped zero or a mis-added carry.',
    ],
    commonTraps: [
      'Adding a carry before multiplying instead of after. A carry is added AFTER the next column is multiplied, never before - adding it first turns 40 x 8 into 90 x 8.',
      'Dropping the partial product zero, which makes the second line ten times too small. An estimate catches it instantly: 36 x 24 is close to 1,000, so 216 is nowhere near right.',
      'Multiplying each digit without carrying at all.',
      'Multiplying by the tens digit and then ADDING the ones digit instead of multiplying by it.',
      'Adding the two factors instead of multiplying them.',
    ],
    workedExample: {
      problem: 'A theatre has 24 rows with 36 seats in each row. How many seats are there in total?',
      steps: [
        '1. Estimate: 40 x 25 = 1,000, so expect something under about a thousand.',
        '2. Ones digit: 36 x 4 = 144.',
        '3. Write a 0 in the ones place of the next line, because the 2 in 24 means 20.',
        '4. Tens digit: 36 x 2 = 72, so the line reads 720 (which is 36 x 20).',
        '5. Add the partial products: 144 + 720 = 864.',
        '6. Check against the estimate: 864 is close to 1,000, so it is believable.',
      ],
      answer: '864 seats',
      whyItMattersForSSA:
        'Multi-digit multiplication is one of the most frequently assessed skills in the Base Ten band, which carries 25–29% of the Grade 4 EOG, and it feeds straight into the division and area questions elsewhere on the test.',
    },
  },

  'NC.4.NBT.6': {
    standardCode: 'NC.4.NBT.6',
    title: 'Dividing by a One-Digit Number, Remainders and All',
    coreConcept:
      'Division asks how many equal groups fit, and multiplication is the way to find out. Partial quotients let you take out easy chunks - ten groups, then five more - until what is left is smaller than the divisor. Whatever is left over is the remainder, and the story decides what to do with it.',
    rulesAndFormulas: [
      { label: 'Partial quotients', detail: '175 / 6: take out 20 groups (120), then 9 more groups (54). 20 + 9 = 29, with 1 left.' },
      { label: 'The remainder rule', detail: 'The remainder must always be SMALLER than the divisor. If it is not, another whole group still fits.' },
      { label: 'Check by multiplying back', detail: 'quotient x divisor + remainder = dividend. 29 x 6 + 1 = 175.' },
      { label: 'Interpreting the remainder', detail: 'Sometimes you round up (another van, another box), sometimes you drop it, sometimes the remainder IS the answer. Reread the question.' },
      { label: 'Zeros in the quotient', detail: 'If a place holds no groups, write a 0 there. Skipping it makes the answer ten times too small.' },
    ],
    stepByStepMethod: [
      'Step 1: Estimate. How many groups of the divisor roughly fit? 6 x 30 = 180, so the answer is a bit under 30.',
      'Step 2: Take out an easy chunk of groups and subtract what it uses up.',
      'Step 3: Repeat with the amount that is left, taking out more groups.',
      'Step 4: Stop when what is left is SMALLER than the divisor. That is the remainder.',
      'Step 5: Add up all the chunks of groups - that is the quotient.',
      'Step 6: Reread the question and decide what the remainder means before writing the answer.',
    ],
    commonTraps: [
      'Stopping the division too early, so the remainder is bigger than the divisor. A remainder larger than the divisor always means another group still fits.',
      'Ignoring the remainder, which leaves children standing on the sidewalk or without a bed. A remainder that represents people always needs a place of its own.',
      'Reporting the remainder without interpreting it, when the question asked how many vans or boxes are needed.',
      'Dropping a zero in the quotient. Multiplying the quotient back by the divisor catches it in one step: 26 x 4 = 104, nowhere near 824.',
      'Subtracting or multiplying when the story called for dividing.',
    ],
    workedExample: {
      problem: 'A teacher shares 175 stickers equally among 6 children. How many stickers does each child get, and how many are left over?',
      steps: [
        '1. Estimate: 6 x 30 = 180, which is just over 175, so the answer is a little under 30.',
        '2. Take out 20 groups: 20 x 6 = 120. 175 - 120 = 55 left.',
        '3. Take out 9 more groups: 9 x 6 = 54. 55 - 54 = 1 left.',
        '4. 1 is smaller than 6, so no more whole groups fit. That 1 is the remainder.',
        '5. Add the chunks: 20 + 9 = 29 stickers each.',
        '6. Check: 29 x 6 + 1 = 174 + 1 = 175.',
      ],
      answer: '29 stickers each, with 1 sticker left over',
      whyItMattersForSSA:
        'Division with remainders sits in the Base Ten band at 25–29% of the Grade 4 EOG, and the remainder-interpreting questions in Operations and Algebraic Thinking assume this procedure is already automatic.',
    },
  },

  // ----------------------------------------------------------------------
  // Measurement & Data - weighted with Geometry as one band (23-27%)
  // ----------------------------------------------------------------------
  'NC.4.MD.1': {
    standardCode: 'NC.4.MD.1',
    title: 'Metric Units and Choosing a Sensible One',
    coreConcept:
      'Every metric unit measures one particular attribute: centimeters and meters measure LENGTH, grams and kilograms measure MASS, milliliters and liters measure CAPACITY. Choosing a unit means getting the attribute right first and the size right second, and then the arithmetic in a measurement word problem is ordinary arithmetic with a label attached.',
    rulesAndFormulas: [
      { label: 'Length', detail: 'centimeter (cm) for a pencil, meter (m) for a room. 100 cm = 1 m.' },
      { label: 'Mass', detail: 'gram (g) for a paperclip, kilogram (kg) for a school bag. 1,000 g = 1 kg.' },
      { label: 'Capacity', detail: 'milliliter (mL) for a spoonful, liter (L) for a big bottle. 1,000 mL = 1 L.' },
      { label: 'One-step word problems', detail: 'Add, subtract, multiply or divide the measurements, then write the unit on the answer.' },
      { label: 'Label the answer', detail: 'A number without a unit is not a measurement. Always write the unit down.' },
    ],
    stepByStepMethod: [
      'Step 1: Decide WHAT is being measured - length, mass or capacity. That rules out most of the units straight away.',
      'Step 2: Picture the object. Is it small enough for the small unit, or big enough for the big one?',
      'Step 3: For a word problem, decide the operation from the story: equal sharing divides, repeated groups multiply.',
      'Step 4: Do the arithmetic.',
      'Step 5: Write the unit on the answer, and check it against the real world - would that amount fill a cup or a swimming pool?',
    ],
    commonTraps: [
      'Choosing a unit for the wrong attribute. Liters and kilograms both sound like "big" units, but liters measure how much space something fills and kilograms measure how much matter it has.',
      'Choosing a unit of the wrong size. A big number invites a big-sounding unit, but 1,250 liters of milk would fill a small swimming pool.',
      'Mislabeling the answer - right number, wrong unit.',
      'Multiplying when the story shares something out equally, or dividing when it repeats a group.',
      'Not sanity-checking the size: 8 cups of 25 milliliters is only 200 milliliters, nowhere near a 2,000-milliliter jug.',
    ],
    workedExample: {
      problem: 'A jug holds 2,000 milliliters of lemonade. It is poured equally into 8 cups. How much lemonade is in each cup?',
      steps: [
        '1. The attribute is capacity, so the answer will be in milliliters or liters.',
        '2. "Poured equally into 8 cups" is equal sharing, so divide.',
        '3. 2,000 / 8 = 250.',
        '4. Write the unit: 250 milliliters per cup.',
        '5. Sanity check: 8 cups x 250 mL = 2,000 mL, exactly the jug. A cup holding only 25 mL would leave the jug almost full.',
      ],
      answer: '250 milliliters in each cup',
      whyItMattersForSSA:
        'Measurement and Data and Geometry are weighted together by NCDPI as a single reporting category worth 23–27% of the Grade 4 EOG, and unit choice is the part of it a child can lose marks on even when the arithmetic is perfect.',
    },
  },

  'NC.4.MD.2': {
    standardCode: 'NC.4.MD.2',
    title: 'Converting Metric Units from Larger to Smaller',
    coreConcept:
      'Going from a larger unit to a smaller one always MULTIPLIES, because it takes more of a small unit to make the same amount. One meter is 100 centimeters, so 30 meters must be 30 x 100 centimeters. A two-column table makes the multiplication visible: every row is the same times-1,000 or times-100 rule, not a step up by one.',
    rulesAndFormulas: [
      { label: 'Length', detail: 'meters to centimeters: x 100. 30 m = 3,000 cm.' },
      { label: 'Mass', detail: 'kilograms to grams: x 1,000. 6 kg = 6,000 g.' },
      { label: 'Capacity', detail: 'liters to milliliters: x 1,000. 3 L = 3,000 mL.' },
      { label: 'Two-column table', detail: 'Write the larger unit in the left column and the smaller in the right. The same rule turns EVERY left value into its right value.' },
      { label: 'Mixed measurements', detail: '3 L 250 mL means 3,000 mL AND 250 mL: 3,250 mL. Neither part may be left behind.' },
    ],
    stepByStepMethod: [
      'Step 1: Decide which unit is larger. You are going from it to the smaller one, so the number must get BIGGER.',
      'Step 2: Recall the conversion factor: 100 for meters to centimeters, 1,000 for kilograms to grams and liters to milliliters.',
      'Step 3: Multiply the measurement by that factor.',
      'Step 4: If the measurement has two parts (3 L 250 mL), convert the large part and then ADD the small part.',
      'Step 5: Check the direction: the answer in the smaller unit must be a bigger number than you started with.',
    ],
    commonTraps: [
      'Inverting the conversion and dividing. That gives 0.3 centimeters for a 30-meter hallway, which is thinner than a pencil - a hallway cannot become a number smaller than 30 just by renaming its unit.',
      'Using the wrong conversion factor, such as 100 where the conversion needs 1,000.',
      'Extending the table one row at a time by adding, so 4,000 is copied down to the 6 kilogram row. Check the rule against EVERY filled row, not just the last one.',
      'Omitting part of the measurement - converting the liters and then forgetting the 250 milliliters entirely.',
      'Adding two measurements without converting them to the same unit first.',
    ],
    workedExample: {
      problem: 'Complete the table for kilograms to grams, then write 3 liters 250 milliliters entirely in milliliters.',
      steps: [
        '1. Larger to smaller means multiply, and 1 kg = 1,000 g, so the rule is x 1,000.',
        '2. Table: 1 kg = 1,000 g, 4 kg = 4,000 g, 6 kg = 6 x 1,000 = 6,000 g.',
        '3. Check the rule on every row, not just the last: 4 x 1,000 = 4,000 is right, so the rule holds.',
        '4. For the capacity: 3 L = 3 x 1,000 = 3,000 mL.',
        '5. The measurement also has 250 mL, so add it: 3,000 + 250 = 3,250 mL.',
      ],
      answer: '6 kg = 6,000 g; 3 L 250 mL = 3,250 mL',
      whyItMattersForSSA:
        'Conversion questions come up throughout Measurement and Data, which NCDPI weights together with Geometry as one 23–27% reporting category on the Grade 4 EOG, and a converted measurement is often only step one of a longer problem.',
    },
  },

  'NC.4.MD.8': {
    standardCode: 'NC.4.MD.8',
    title: 'Elapsed Time That Crosses the Hour',
    coreConcept:
      'Time is not base ten - sixty minutes make an hour, not a hundred. The easiest way across an hour boundary is to jump to the next full hour first, see how much of the interval you have used, and then carry the rest into the new hour.',
    rulesAndFormulas: [
      { label: 'The trade', detail: '60 minutes = 1 hour. Any answer with 60 or more minutes in it has to be traded.' },
      { label: 'Minutes to the next hour', detail: 'From 3:45, the minutes REMAINING to 4:00 are 60 - 45 = 15, not the 45 showing on the clock.' },
      { label: 'Jump strategy', detail: 'Jump to the next full hour, then add what is left of the interval.' },
      { label: 'Column subtraction with a trade', detail: 'To take 40 minutes from 2:15, borrow an hour: 2:15 becomes 1 hour and 75 minutes.' },
      { label: 'Check by going back', detail: 'Add the interval to the start time again and see if you land on the end time.' },
    ],
    stepByStepMethod: [
      'Step 1: Write down the start time and what the question is really asking - an end time, a start time, or how long something lasted.',
      'Step 2: Find the minutes REMAINING to the next full hour: 60 minus the minutes showing.',
      'Step 3: Take that many minutes out of the interval and move the clock to that full hour.',
      'Step 4: Add whatever is left of the interval into the new hour.',
      'Step 5: Check that your minutes are under 60, and check by working backwards.',
    ],
    commonTraps: [
      'Adding the minutes straight down to get something like "4:95". No clock ever shows 4:95 - once the minutes reach 60 they become an hour. Any answer with 60 or more minutes is a signal to trade.',
      'Using the minutes PAST the hour instead of the minutes LEFT in it. The minutes displayed and the minutes remaining always add to 60.',
      'Regrouping the minutes but not the hours, so the hour column never loses the hour that was borrowed.',
      'Subtracting the start minutes from the end minutes in columns when the end has fewer, which makes the gap look longer than it is.',
      'Forgetting the final step - taking off the ride but not the getting-ready time. A multi-step problem is not finished until every interval named in it has been used.',
    ],
    workedExample: {
      problem: 'A film starts at 3:45 p.m. and lasts 50 minutes. What time does it finish?',
      steps: [
        '1. Start at 3:45 p.m. and the interval is 50 minutes.',
        '2. Minutes remaining to 4:00: 60 - 45 = 15 minutes.',
        '3. Use 15 of the 50 minutes to reach 4:00 p.m. That leaves 50 - 15 = 35 minutes.',
        '4. Add the remaining 35 minutes into the new hour: 4:00 + 35 minutes = 4:35 p.m.',
        '5. Check backwards: from 3:45 to 4:35 is 15 + 35 = 50 minutes.',
      ],
      answer: '4:35 p.m.',
      whyItMattersForSSA:
        'Elapsed time lives in Measurement and Data, which NCDPI weights together with Geometry as one reporting category worth 23–27% of the Grade 4 EOG, and it is the standard where a child who is fluent in base ten still has to remember that sixty, not a hundred, makes the next unit.',
    },
  },

  'NC.4.MD.3': {
    standardCode: 'NC.4.MD.3',
    title: 'Area and Perimeter: Inside versus Around',
    coreConcept:
      'Perimeter is the distance all the way AROUND a figure and is measured in ordinary units; area is the amount of surface INSIDE it and is measured in square units. The same rectangle has both, they are not related in any simple way, and the first job in every problem is deciding which one the question wants.',
    rulesAndFormulas: [
      { label: 'Area of a rectangle', detail: 'A = length x width. Units are square units (square meters, square centimeters).' },
      { label: 'Perimeter of a rectangle', detail: 'P = 2 x (length + width), or just add all four sides.' },
      { label: 'Rectilinear figures', detail: 'Split an L-shape into rectangles, find each area, then ADD them. Every part must be counted.' },
      { label: 'Fixed perimeter, changing area', detail: 'With 24 m of fencing, 6 x 6 gives 36 square meters but 11 x 1 gives only 11. The squarest rectangle holds the most.' },
      { label: 'Fixed area, changing perimeter', detail: 'A fixed number of square tiles can be arranged into many rectangles, each needing a different length of edging.' },
    ],
    stepByStepMethod: [
      'Step 1: Underline the words that say what is wanted - carpet, paint and tiles mean AREA; fence, trim, ribbon and border mean PERIMETER.',
      'Step 2: Sketch the figure and label every side length you know.',
      'Step 3: For an L-shape, cut it into rectangles and label the missing sides by subtracting.',
      'Step 4: Apply the right formula to each rectangle.',
      'Step 5: For an area problem, add the pieces. For a perimeter problem, go around the OUTSIDE edge only.',
      'Step 6: Write the unit - square units for area, plain units for perimeter.',
    ],
    commonTraps: [
      'Using the area formula when the question asked for perimeter. Multiplying 13 x 9 gives 117, the number of square meters of floor - which would be right if she were carpeting the room, not trimming its edge.',
      'Using the perimeter formula when the question asked for area.',
      'Adding the length and the width once each, which reports half of a perimeter.',
      'Multiplying every side length together. That gives 280 for a 13 by 9 room, nearly seven times the real floor - each rectangle uses only its OWN two dimensions.',
      'Omitting one part of a composite figure, so a whole rectangle of the L-shape is never counted.',
      'Assuming a longer side means a greater area. A long pen looks roomier, but 11 by 1 encloses only 11 square meters - less than a third of what the same fencing gives as a 6 by 6 square.',
    ],
    workedExample: {
      problem: 'A rectangular room measures 13 meters by 9 meters. Mrs Patel wants wooden trim around the edge of the floor, and carpet to cover it. How much trim does she need, and how much carpet?',
      steps: [
        '1. "Around the edge" is perimeter; "cover it" is area. This question wants both.',
        '2. Perimeter: 2 x (13 + 9) = 2 x 22 = 44.',
        '3. Trim is a length, so the unit is meters: 44 meters.',
        '4. Area: 13 x 9 = 117.',
        '5. Carpet covers a surface, so the unit is square meters: 117 square meters.',
        '6. Check the two are not mixed up: the area number is much larger, as it should be for a room this size.',
      ],
      answer: '44 meters of trim and 117 square meters of carpet',
      whyItMattersForSSA:
        'Area and perimeter are among the most frequently assessed ideas in Measurement and Data, which NCDPI weights together with Geometry as a single 23–27% reporting category on the Grade 4 EOG.',
    },
  },

  'NC.4.MD.4': {
    standardCode: 'NC.4.MD.4',
    title: 'Reading Frequency Tables, Bar Graphs and Line Plots',
    coreConcept:
      'A graph is only readable once you know its scale. On a scaled bar graph each gridline may be worth 5 or 10, so the height of a bar is a count of gridlines multiplied by the scale, never the count of gridlines itself. And before you can graph anything, you need a question that yields numbers - numerical data - rather than labels.',
    rulesAndFormulas: [
      { label: 'Read the scale first', detail: 'Look at the numbers on the axis. If they go 0, 5, 10, 15, each gridline is worth 5.' },
      { label: 'Value of a bar', detail: 'gridlines counted x scale. Seven gridlines on a scale of 5 is 7 x 5 = 35.' },
      { label: 'Frequency table', detail: 'The frequency column says HOW MANY, not how much. Total the frequencies to count the people.' },
      { label: 'Line plot', detail: 'Each X is one data point sitting above the measurement it had. Count the Xs, not the numbers on the line.' },
      { label: 'Numerical vs categorical', detail: '"How many minutes did you read?" gives numbers. "What is your favorite pet?" gives categories, which cannot be plotted on a number line.' },
    ],
    stepByStepMethod: [
      'Step 1: Read the title and the axis labels so you know what is being counted.',
      'Step 2: Work out the scale from two numbers on the axis.',
      'Step 3: For each bar you need, count gridlines from zero and multiply by the scale.',
      'Step 4: Answer the question that was actually asked - a total, a difference, or a single value.',
      'Step 5: Sanity check against the graph: your answer should sit in the range the bars cover.',
    ],
    commonTraps: [
      'Reading the scale by counting ticks. Answering 7 counts the gridlines themselves - that would only be right on a graph whose scale went up by one, and this one goes up by five.',
      'Being off by one gridline, usually by counting the line at zero.',
      'Summing all the data points when the question asked for a difference, or comparing minutes when the question asked about students.',
      'Using the data values instead of their frequencies, so the numbers on a line plot are added instead of the Xs being counted.',
      'Confusing categorical with numerical data. Any question can end up as a count, because you can always tally how many people said "cat" - but that tally is a count of a category, not a measurement each student reported.',
    ],
    workedExample: {
      problem: 'A scaled bar graph shows books read in March. The axis is labeled 0, 5, 10, 15, 20 and so on. The bar for Maya reaches the 7th gridline above zero and the bar for Ben reaches the 4th. How many more books did Maya read than Ben?',
      steps: [
        '1. Read the scale: the axis goes up in fives, so each gridline is worth 5 books.',
        '2. Maya: 7 gridlines x 5 = 35 books.',
        '3. Ben: 4 gridlines x 5 = 20 books.',
        '4. "How many more" means subtract: 35 - 20 = 15.',
        '5. Check: 3 gridlines of difference x 5 books each = 15, which agrees.',
      ],
      answer: '15 more books',
      whyItMattersForSSA:
        'Data representation belongs to Measurement and Data, which NCDPI weights together with Geometry as one reporting category worth 23–27% of the Grade 4 EOG, and scale-reading errors cost marks on questions whose arithmetic a child could do easily.',
    },
  },

  'NC.4.MD.6': {
    standardCode: 'NC.4.MD.6',
    title: 'Angles, Protractors and Adding Angle Measures',
    coreConcept:
      'An angle is the amount of turn between two rays that share an endpoint, and it is measured in degrees. When a ray is drawn inside an angle it splits that angle into two parts, and the two parts add up to the whole - which means a missing part can always be found by subtracting.',
    rulesAndFormulas: [
      { label: 'What an angle is', detail: 'Two rays sharing a common endpoint (the vertex). Measured in degrees, written with a small circle: 75 degrees.' },
      { label: 'Benchmarks', detail: 'A right angle is 90 degrees, a straight angle is 180 degrees. Less than 90 is acute; between 90 and 180 is obtuse.' },
      { label: 'Part + part = whole', detail: 'If ray PB is inside angle APC, then angle APB + angle BPC = angle APC.' },
      { label: 'Two protractor scales', detail: 'A protractor shows two numbers at every mark, and they always add to 180. Use the scale that starts at 0 on your first ray.' },
      { label: 'A part is never bigger than the whole', detail: 'If your answer for a part exceeds the whole angle, something has gone wrong.' },
    ],
    stepByStepMethod: [
      'Step 1: Find the vertex - the point where the rays meet - and put the centre of the protractor on it.',
      'Step 2: Line one ray up with the zero line of the protractor.',
      'Step 3: Read the scale that starts at 0 on that ray, and follow it round to the second ray.',
      'Step 4: For a missing angle on a diagram, write the part-plus-part-equals-whole equation.',
      'Step 5: Subtract the known part from the whole.',
      'Step 6: Check by adding the two parts back together - they must give the whole.',
    ],
    commonTraps: [
      'Reading the wrong protractor scale. The two numbers where a ray crosses the protractor always add to 180, so picking the wrong one gives the supplement of the angle instead of the angle.',
      'Assuming a straight angle. Answering 180 degrees assumes the two outer rays point in exactly opposite directions, which a diagram has to actually say.',
      'Assuming a right angle where the diagram never marked one.',
      'Answering with a part bigger than the whole. A part of an angle can never be bigger than the angle it sits inside.',
      'Adding when the diagram calls for subtracting, or subtracting the two protractor readings in the wrong order.',
    ],
    workedExample: {
      problem: 'Ray PB lies inside angle APC. Angle APC measures 130 degrees and angle APB measures 55 degrees. What is the measure of angle BPC?',
      steps: [
        '1. Ray PB is inside the big angle, so it splits it into two parts: APB and BPC.',
        '2. Write the relationship: angle APB + angle BPC = angle APC.',
        '3. Substitute what is known: 55 + angle BPC = 130.',
        '4. Subtract: angle BPC = 130 - 55 = 75 degrees.',
        '5. Check: 55 + 75 = 130, which is the whole angle. And 75 is less than 130, as a part must be.',
      ],
      answer: '75 degrees',
      whyItMattersForSSA:
        'Angle measurement is assessed within Measurement and Data, which NCDPI weights together with Geometry as a single 23–27% reporting category on the Grade 4 EOG, and the part-plus-part-equals-whole reasoning returns in every later geometry course.',
    },
  },

  // ----------------------------------------------------------------------
  // Geometry - weighted with Measurement & Data as one band (23-27%)
  // ----------------------------------------------------------------------
  'NC.4.G.1': {
    standardCode: 'NC.4.G.1',
    title: 'Points, Lines, Rays, Angles and Special Pairs of Lines',
    coreConcept:
      'Geometry has exact names, and the dots and arrowheads in a drawing are what tell you which name is right. A line goes on forever both ways, a segment stops at two endpoints, and a ray starts at one endpoint and goes on forever the other way. Two lines are parallel if they never meet, and perpendicular only if they meet at a square corner.',
    rulesAndFormulas: [
      { label: 'Point', detail: 'A single location, named with one capital letter: point A.' },
      { label: 'Line', detail: 'Straight, endless in both directions, arrowheads at both ends: line AB.' },
      { label: 'Line segment', detail: 'A straight piece with an endpoint at EACH end: segment AB.' },
      { label: 'Ray', detail: 'One endpoint and one arrowhead. Ray AB starts at A and goes through B - the FIRST letter is always the endpoint.' },
      { label: 'Angle', detail: 'Two rays sharing an endpoint. Named with three letters, the vertex in the middle: angle ABC has its vertex at B.' },
      { label: 'Parallel lines', detail: 'Always the same distance apart and never meeting, however far you extend them.' },
      { label: 'Perpendicular lines', detail: 'Meeting at a square corner - a right angle. Crossing alone is not enough.' },
    ],
    stepByStepMethod: [
      'Step 1: Look at the ends of the figure. Two arrowheads means a line; two dots means a segment; one of each means a ray.',
      'Step 2: For a ray, find the dot. That endpoint is the first letter of the name.',
      'Step 3: For an angle, find the vertex where the two rays meet; its letter goes in the middle.',
      'Step 4: For a pair of lines, ask first whether they would ever meet. If not, they are parallel.',
      'Step 5: If they do meet, look for a square corner mark. Only then are they perpendicular.',
    ],
    commonTraps: [
      'Naming a ray from the wrong endpoint. Ray AB and ray BA are not two names for one figure - they start at different endpoints and point opposite ways.',
      'Accepting any crossing as perpendicular. Two lines that meet at a slant do intersect, but only lines that meet at a square corner are perpendicular.',
      'Treating adjacent sides of a shape as parallel. Two sides that meet at a corner are not parallel, although the two sides across from each other still are.',
      'Assuming a figure named with two letters must be a segment. The letters only say which points are on it; the dots and arrowheads say what it is.',
      'Confusing parallel with perpendicular, or counting an arrowhead as an endpoint.',
    ],
    workedExample: {
      problem: 'A figure has a solid dot at point A and an arrowhead beyond point B. Rectangle WXYZ is labeled clockwise from the top left. (a) Name the first figure. (b) Name a pair of parallel sides and a pair of perpendicular sides in WXYZ.',
      steps: [
        '1. The figure has one endpoint and one arrowhead, so it is a ray, not a line and not a segment.',
        '2. The endpoint is at A, and the first letter of a ray name is always the endpoint: ray AB.',
        '3. In rectangle WXYZ the sides in order are WX, XY, YZ and ZW.',
        '4. WX is the top and YZ is the bottom. They are opposite sides, always the same distance apart, so they are parallel.',
        '5. WX and XY meet at corner X, and every corner of a rectangle is a square corner, so they are perpendicular.',
      ],
      answer: '(a) ray AB   (b) WX is parallel to YZ; WX is perpendicular to XY',
      whyItMattersForSSA:
        'Geometry is weighted by NCDPI together with Measurement and Data as one reporting category worth 23–27% of the Grade 4 EOG, and this vocabulary is what the classification and symmetry questions in the same band are written in.',
    },
  },

  'NC.4.G.2': {
    standardCode: 'NC.4.G.2',
    title: 'Classifying Triangles and Quadrilaterals',
    coreConcept:
      'A shape is classified by checking its properties - the size of its angles, the lengths of its sides, and whether its sides are parallel or perpendicular - and a name is only correct once EVERY property it requires has been checked. North Carolina uses the inclusive definition of a trapezoid: at least one pair of parallel sides.',
    rulesAndFormulas: [
      { label: 'Triangles by angle', detail: 'Acute: all three angles under 90 degrees. Right: exactly one 90 degree angle. Obtuse: one angle over 90 degrees.' },
      { label: 'Triangles by side', detail: 'Equilateral: three equal sides. Isosceles: at least two equal sides. Scalene: no two sides equal.' },
      { label: 'Trapezoid (NC inclusive)', detail: 'At least one pair of parallel sides - which makes every parallelogram a trapezoid as well.' },
      { label: 'Parallelogram', detail: 'Both pairs of opposite sides parallel. Opposite sides are also equal.' },
      { label: 'Rhombus', detail: 'A parallelogram with all FOUR sides equal. It need not have right angles.' },
      { label: 'Rectangle and square', detail: 'A rectangle is a parallelogram with four right angles. A square has four right angles AND four equal sides, so it is both a rectangle and a rhombus.' },
    ],
    stepByStepMethod: [
      'Step 1: Count the sides - three means a triangle, four means a quadrilateral.',
      'Step 2: For a triangle, check every angle first, then the side lengths. Both names may be wanted.',
      'Step 3: For a quadrilateral, mark which sides are parallel.',
      'Step 4: Check which corners are square.',
      'Step 5: Compare the side lengths.',
      'Step 6: Give the most specific name that ALL the checked properties support, and list any broader names the question asks for.',
    ],
    commonTraps: [
      'Classifying by one property only, so a name is chosen before every property has been checked.',
      'Using the exclusive trapezoid definition. Books outside North Carolina often define a trapezoid as having only one pair of parallel sides; the NC standards use the inclusive definition, which makes every parallelogram a trapezoid as well.',
      'Confusing "opposite sides equal" with "all four sides equal". Only the second one makes a rhombus.',
      'Assuming equal sides force square corners. A rhombus can lean over as far as you like and still have four sides the same length.',
      'Naming a triangle by its two smaller angles. Every triangle has at least two acute angles, including every obtuse one, so the largest angle is the one that decides the name.',
      'Assuming the longest side makes an angle obtuse, or treating any unequal sides as scalene when two of the three sides still match.',
    ],
    workedExample: {
      problem: 'Triangle RST has angles of 40, 55 and 85 degrees and sides of 5 cm, 5 cm and 7 cm. Quadrilateral JKLM has four sides of 6 cm each, both pairs of opposite sides parallel, and no right angles. Classify each shape as precisely as you can.',
      steps: [
        '1. Triangle angles: 40 + 55 + 85 = 180, so the measurements are possible.',
        '2. Every angle is under 90 degrees - including the largest, 85 - so RST is ACUTE. Two small angles alone would not have told us this.',
        '3. Two of its sides are 5 cm and one is 7 cm, so exactly two sides match: RST is ISOSCELES.',
        '4. JKLM has both pairs of opposite sides parallel, so it is a parallelogram.',
        '5. All four sides are equal, so it is more precisely a RHOMBUS. No right angles means it is not a square.',
        '6. Under the NC inclusive definition it is also a trapezoid, because it has at least one pair of parallel sides.',
      ],
      answer: 'Triangle RST is acute and isosceles. JKLM is a rhombus (also a parallelogram, and a trapezoid under the NC inclusive definition).',
      whyItMattersForSSA:
        'Classification questions are a reliable part of Geometry, which NCDPI weights together with Measurement and Data as one 23–27% reporting category on the Grade 4 EOG, and the inclusive trapezoid definition is a place where a confident answer learned elsewhere can be the wrong one here.',
    },
  },

  'NC.4.G.3': {
    standardCode: 'NC.4.G.3',
    title: 'Lines of Symmetry',
    coreConcept:
      'A line of symmetry is a fold line: fold the figure along it and the two halves land exactly on top of each other, point for point. Cutting a shape into two pieces of the same SIZE is not the same thing, and a figure may have no lines of symmetry, one, or several - so the search is not finished at the first one you find.',
    rulesAndFormulas: [
      { label: 'The fold test', detail: 'Fold along the line. Every point of one half must land on a matching point of the other.' },
      { label: 'Rectangle (not a square)', detail: 'Exactly 2 lines of symmetry - one across and one up and down, each through the midpoints of opposite sides.' },
      { label: 'Square', detail: '4 lines of symmetry - two through midpoints of sides and two along the diagonals.' },
      { label: 'Diagonals are not automatic', detail: 'A rectangle diagonal splits it into two equal triangles, but folding along it does NOT make the halves match.' },
      { label: 'Letters', detail: 'A and T fold up and down; B and C fold across; H, I and X fold both ways; F, G, J, L, P and R have none.' },
    ],
    stepByStepMethod: [
      'Step 1: Draw the figure and mark the midpoints of its sides.',
      'Step 2: Try a vertical fold line. Do the left and right halves match exactly?',
      'Step 3: Try a horizontal fold line. Do the top and bottom halves match?',
      'Step 4: Try each diagonal, and actually test the fold rather than assume it works.',
      'Step 5: Count only the lines that passed the fold test, and keep going until every possible line has been tried.',
    ],
    commonTraps: [
      'Counting a diagonal as a line of symmetry. Cutting a figure into two pieces of equal size is not the same as folding it into two halves that match.',
      'Stopping after the first line of symmetry when the question asked how many there are.',
      'Treating equal halves as symmetry, so any line through the middle is counted.',
      'Finding symmetry in the wrong direction. Having a line of symmetry is not the same as having the one you were asked for - A and T are symmetric letters, but their fold line runs up and down, not across.',
      'Requiring all sides to be equal before a figure can be symmetric, or judging symmetry by appearance without testing the fold.',
    ],
    workedExample: {
      problem: 'A rectangle measures 8 cm by 3 cm. How many lines of symmetry does it have? Explain why its diagonals are not among them.',
      steps: [
        '1. Vertical fold through the midpoints of the two long sides: the left 4 cm lands exactly on the right 4 cm. That is one line of symmetry.',
        '2. Horizontal fold through the midpoints of the two short sides: the top strip lands exactly on the bottom strip. That is a second.',
        '3. Try a diagonal fold. The two triangles it makes are the same size, but the long 8 cm side would have to land on the short 3 cm side, and it cannot.',
        '4. The second diagonal fails for the same reason.',
        '5. No other line works, so the count is 2. (A SQUARE would have 4, because its sides are all equal and the diagonal fold does work.)',
      ],
      answer: '2 lines of symmetry',
      whyItMattersForSSA:
        'Symmetry sits in Geometry, which NCDPI weights together with Measurement and Data as a single reporting category worth 23–27% of the Grade 4 EOG, and it is the one Grade 4 geometry idea a child usually has to test rather than recall.',
    },
  },

  // ----------------------------------------------------------------------
  // Operations & Algebraic Thinking (14-18%)
  // ----------------------------------------------------------------------
  'NC.4.OA.1': {
    standardCode: 'NC.4.OA.1',
    title: 'Times As Many: Multiplicative Comparison',
    coreConcept:
      '"Times as many" and "more than" ask two completely different questions. "7 times as tall" means multiplying or dividing; "7 inches taller" means adding or subtracting. A multiplication equation like 63 = 7 x n can always be read as a comparison sentence, and the unknown can sit in any of its three places.',
    rulesAndFormulas: [
      { label: 'The comparison equation', detail: 'bigger = factor x smaller. So 63 = 7 x n says 63 is 7 times as much as n.' },
      { label: 'Finding the smaller amount', detail: 'Divide: n = 63 / 7.' },
      { label: 'Finding the bigger amount', detail: 'Multiply: if the marigold is 9 inches and the sunflower is 7 times as tall, the sunflower is 9 x 7.' },
      { label: 'Multiplicative vs additive', detail: '"3 times as many" multiplies; "3 more" adds. The words decide the operation.' },
      { label: 'Symbol for the unknown', detail: 'Write n, or a box, in the place the question leaves empty, then solve for it.' },
    ],
    stepByStepMethod: [
      'Step 1: Find the comparison words and decide: is this "times as many" (multiply or divide) or "more than" (add or subtract)?',
      'Step 2: Decide which quantity is the BIGGER one. It is the one being described as several times the other.',
      'Step 3: Write the equation bigger = factor x smaller, with a letter for whatever is unknown.',
      'Step 4: If the unknown is the smaller amount, divide. If it is the bigger amount, multiply.',
      'Step 5: Check by reading your answer back into the sentence - does the bigger number really come out that many times the smaller one?',
    ],
    commonTraps: [
      'Reading "4 times as many" as "4 more", which turns a multiplication into an addition.',
      'Subtracting instead. Subtracting answers "how many more", not "how many times as many".',
      'Reversing the relationship: writing n = 63 x 7 when the sunflower is already the taller plant scales the taller one up again, which would make the marigold 441 inches tall.',
      'Multiplying when the unknown is the SMALLER quantity, which gives an answer far bigger than the number it was supposed to be several times less than.',
      'Halving instead of dividing by the actual factor.',
    ],
    workedExample: {
      problem: 'A sunflower is 63 inches tall. That is 7 times as tall as a marigold. How tall is the marigold?',
      steps: [
        '1. "Times as tall" means this is a multiplicative comparison, not an additive one.',
        '2. The sunflower is the bigger quantity, and the marigold is the unknown smaller one. Call it n.',
        '3. Equation: 63 = 7 x n.',
        '4. The unknown is the smaller amount, so divide: n = 63 / 7 = 9.',
        '5. Check: 9 x 7 = 63. The sunflower really is 7 times the marigold height.',
      ],
      answer: '9 inches',
      whyItMattersForSSA:
        'Operations and Algebraic Thinking carries 14–18% of the Grade 4 EOG, and multiplicative comparison is the idea that becomes ratio and proportional reasoning in middle school, which is exactly what an acceleration decision is looking at.',
    },
  },

  'NC.4.OA.3': {
    standardCode: 'NC.4.OA.3',
    title: 'Two-Step Word Problems with All Four Operations',
    coreConcept:
      'A two-step problem hides a question inside a question: you have to answer the first one to get the number the second one needs. The commonest way to lose the mark is to solve step one correctly and hand it in, so the last thing to do before writing an answer is to reread what was actually asked.',
    rulesAndFormulas: [
      { label: 'Write one equation', detail: 'Use a letter for the final unknown: m = 8 x 12 - 27. Grouping matters - m + 27 / 6 divides only the 27.' },
      { label: 'Estimate for reasonableness', detail: 'Round the numbers and check the size of your answer, but only report the exact value if the question said "exactly".' },
      { label: 'Interpret the remainder', detail: 'Round up for vans and boxes, drop it when it cannot be used, or report it when the question asks what is left over.' },
      { label: 'Repeated groups multiply', detail: '8 trays of 12 is 8 x 12, not 8 + 12.' },
      { label: 'Underline the question', detail: 'Mark the sentence with the question mark before you start calculating.' },
    ],
    stepByStepMethod: [
      'Step 1: Read the whole problem once without touching a pencil.',
      'Step 2: Underline the final question so you know where you are heading.',
      'Step 3: Work out what you must find FIRST before that question can be answered.',
      'Step 4: Do step one, and label the number you get with what it means.',
      'Step 5: Do step two using that number.',
      'Step 6: Reread the underlined question and check your answer actually answers it - including what any remainder means.',
    ],
    commonTraps: [
      'Forgetting the final step. Stopping at 96 answers "how many were baked", which is the step before the one the problem asked about.',
      'Ignoring the remainder, which leaves four children standing on the sidewalk when the remainder needed a van of its own.',
      'Reporting the remainder without interpreting it, when the question asked how many vans are needed.',
      'Reporting the estimate. An estimate answers "about how much", and some problems use the word "exactly".',
      'Writing the equation without grouping, so only part of it is operated on.',
      'Choosing the wrong operation, usually adding two numbers that describe repeated groups.',
    ],
    workedExample: {
      problem: 'A bakery fills 8 trays with 12 muffins each. By lunchtime 27 muffins have been sold. Write an equation and find how many muffins are left.',
      steps: [
        '1. The final question is how many are LEFT, so that is where we are heading.',
        '2. First we need how many were baked: 8 trays of 12 is repeated groups, so 8 x 12 = 96 muffins.',
        '3. One equation for the whole story: m = 8 x 12 - 27. The multiplication has to happen before the subtraction.',
        '4. Second step: 96 - 27 = 69.',
        '5. Reread the question: it asked how many are left, not how many were baked. 69 is the answer, not 96.',
        '6. Check: 69 + 27 = 96, which is what 8 trays hold.',
      ],
      answer: '69 muffins, from m = 8 x 12 - 27',
      whyItMattersForSSA:
        'Two-step problems are the heart of the Operations and Algebraic Thinking band at 14–18% of the Grade 4 EOG, and they are where reading carefully earns as many marks as arithmetic does.',
    },
  },

  'NC.4.OA.4': {
    standardCode: 'NC.4.OA.4',
    title: 'Factor Pairs, Multiples, Prime and Composite',
    coreConcept:
      'A factor pair is two whole numbers that multiply to give your number exactly, with nothing left over. Finding all of them means testing the divisors in order and not stopping early. A number with exactly one factor pair, 1 and itself, is prime; a number with more than one is composite.',
    rulesAndFormulas: [
      { label: 'Factor pair', detail: 'Two numbers whose product is exactly your number: 5 x 9 = 45, so 5 and 9 are a factor pair of 45.' },
      { label: 'Test in order', detail: 'Try 1, 2, 3, 4, 5, 6... and keep going until the two numbers in the pair meet or cross.' },
      { label: 'Factor vs multiple', detail: '5 is a FACTOR of 30; 30 is a MULTIPLE of 5. A number is a multiple of each of its factors.' },
      { label: 'Prime', detail: 'Exactly two factors: 1 and itself. 2, 3, 5, 7, 11, 13, 17, 19, 23... 1 itself is neither prime nor composite.' },
      { label: 'Composite', detail: 'More than two factors. 45 is composite because 3 and 5 divide it as well as 1 and 45.' },
      { label: 'Quick divisibility checks', detail: 'Even numbers divide by 2; digits summing to a multiple of 3 divide by 3; numbers ending in 0 or 5 divide by 5.' },
    ],
    stepByStepMethod: [
      'Step 1: Start at 1. Its partner is always the number itself.',
      'Step 2: Try 2. Does it divide exactly, with no remainder?',
      'Step 3: Keep going up through 3, 4, 5, 6 and so on, writing down every pair that comes out even.',
      'Step 4: Stop when the two numbers in a pair meet or would cross over - after that you are just repeating pairs backwards.',
      'Step 5: Count the pairs. One pair means prime; more than one means composite.',
      'Step 6: Check each pair by multiplying it back.',
    ],
    commonTraps: [
      'Stopping the divisor check too early. A number like 49 survives the 2, 3 and 5 tests and still is not prime, because 7 x 7 = 49.',
      'Counting an uneven division as a factor. Recording 3 x 16 for 49 counts a division that did not come out even; a factor pair must multiply back to exactly the number.',
      'Accepting a division that "almost" works. 45 / 6 = 7 remainder 3 still leaves chairs over, so 6 is not a factor of 45.',
      'Flipping factor and multiple. Saying "5 is a multiple of 30" reverses the relationship - you would have to count by 30 to reach 5.',
      'Forgetting that 1 is neither prime nor composite.',
    ],
    workedExample: {
      problem: 'Find all the factor pairs of 45, then say whether 45 is prime or composite.',
      steps: [
        '1. 1 x 45 = 45. First pair: 1 and 45.',
        '2. Try 2: 45 is odd, so 2 does not divide it exactly.',
        '3. Try 3: 4 + 5 = 9, a multiple of 3, and 45 / 3 = 15 exactly. Pair: 3 and 15.',
        '4. Try 4: 45 / 4 = 11 remainder 1, so no.',
        '5. Try 5: 45 ends in 5, and 45 / 5 = 9 exactly. Pair: 5 and 9.',
        '6. Try 6: 45 / 6 = 7 remainder 3, so no. Try 7: 45 / 7 = 6 remainder 3, so no. The partners have now met, so we can stop.',
        '7. Three factor pairs means far more than two factors, so 45 is composite.',
      ],
      answer: '1 x 45, 3 x 15 and 5 x 9. 45 is composite.',
      whyItMattersForSSA:
        'Factors and multiples belong to Operations and Algebraic Thinking, which is 14–18% of the Grade 4 EOG, and they are the groundwork for the common denominators and simplifying that Grade 5 fraction work depends on.',
    },
  },

  'NC.4.OA.5': {
    standardCode: 'NC.4.OA.5',
    title: 'Generating and Analyzing Patterns',
    coreConcept:
      'A pattern needs two things: a starting number and a rule. Generating it means applying the rule again and again from that start; analyzing it means finding a feature the rule creates. The counting trap is that getting to the 10th term takes only NINE steps, because the starting number is already the 1st term.',
    rulesAndFormulas: [
      { label: 'Steps versus terms', detail: 'The nth term needs (n - 1) applications of the rule. The 10th term of "start at 4, add 7" is 4 + 9 x 7.' },
      { label: 'Additive rule', detail: '"Add 7" grows by the same amount each time: 4, 11, 18, 25...' },
      { label: 'Multiplicative rule', detail: '"Multiply by 3" or "twice as many" grows by a factor each time: 5, 15, 45... Not the same as "add 3".' },
      { label: 'Test a rule on every step', detail: 'A rule that fits only the first gap has not been confirmed at all. Check it against each pair of neighbors.' },
      { label: 'Shape patterns', detail: 'The same idea with figures: count the squares or dots in each stage and look for the rule in those numbers.' },
    ],
    stepByStepMethod: [
      'Step 1: Write the starting number down and label it "term 1".',
      'Step 2: Read the rule carefully - does it ADD an amount or MULTIPLY by a factor?',
      'Step 3: Apply the rule once to get term 2, again for term 3, and keep a numbered list.',
      'Step 4: For a far-off term, count the STEPS needed: term 10 takes 9 steps from term 1.',
      'Step 5: Check the rule against every gap in your list, not just the first one.',
      'Step 6: Answer the question asked - a particular term, the rule itself, or a feature such as "all the terms are even".',
    ],
    commonTraps: [
      'Counting terms instead of steps. Adding 7 ten times gives 74; the 10th term needs nine steps added to the 4 the pattern began with.',
      'Ignoring the starting term and reporting only the total the rule added, which gives 63 instead of 67.',
      'Treating a multiplicative rule as additive. Adding 3 each time gives 5, 8, 11 - a pattern that follows "add 3", not "multiply by 3". "Twice as many" doubles the figure before it; read as "2 more" it grows far too slowly.',
      'Checking only the first step. A rule like "add 9" can fit the very first gap and nothing after it - a rule confirmed on one step has not been confirmed at all.',
      'Reversing the relationship between the two sequences, or dividing once and reporting a term from the wrong position.',
    ],
    workedExample: {
      problem: 'A pattern starts at 4 and follows the rule "add 7". What is the 10th term?',
      steps: [
        '1. Term 1 is the starting number itself: 4.',
        '2. The rule is additive, so each step adds 7: 4, 11, 18, 25, 32...',
        '3. Getting from term 1 to term 10 is 10 - 1 = 9 steps, not 10.',
        '4. Nine steps add 9 x 7 = 63.',
        '5. 10th term = 4 + 63 = 67.',
        '6. Check by listing: 4, 11, 18, 25, 32, 39, 46, 53, 60, 67 - the tenth number is 67.',
      ],
      answer: '67',
      whyItMattersForSSA:
        'Pattern questions carry part of the 14–18% Operations and Algebraic Thinking band on the Grade 4 EOG, and the step-counting they test is the same reasoning that becomes writing a rule as an expression in later grades.',
    },
  },
};
