/** Coarse grouping used for ranking a student's most frequent errors.
 *  Specific tags stay precise for explaining a single item; families are
 *  what make "you did this 6 times this week" meaningful. */
export type MisconceptionFamily =
  | 'fraction-operations'
  | 'place-value-and-decimals'
  | 'operation-choice'
  | 'multi-digit-algorithm'
  | 'remainder-handling'
  | 'geometry-and-measurement'
  | 'unit-conversion'
  | 'order-of-operations'
  | 'coordinate-plane'
  | 'incomplete-procedure'
  /** Reasoning about what a shape IS - its definition and its place in the
   *  polygon hierarchy (e.g. "is every square a rectangle?") - as distinct
   *  from measuring or computing with a shape once it's identified. */
  | 'shape-classification'
  /** Which whole numbers divide which - factor pairs, multiples, prime and
   *  composite. Added for NC.4.OA.4, an entire standard about this that had
   *  no home: its errors are neither a choice of operation (the child knows
   *  to divide) nor a slip in an algorithm (the division is usually right).
   *  What goes wrong is the divisor SEARCH, or which end of the
   *  factor/multiple relationship a number sits on. Grades 3 and 5 touch the
   *  same topic, so this will not stay a one-standard family. */
  | 'factors-and-multiples'
  /** Generating and analyzing a sequence from a rule: how many times the rule
   *  is applied, where the count starts, and whether the rule is additive or
   *  multiplicative. Added for NC.4.OA.5. The nearest existing tag for its
   *  commonest error, counted-endpoints-not-intervals, sits in
   *  'coordinate-plane' - filing a pattern error there would tell a parent
   *  their child has a graphing problem when they have a counting-the-steps
   *  problem, and to a parent a mis-filed tag is worse than no tag. */
  | 'patterns-and-sequences'
  /** Adding and subtracting clock times and elapsed-time intervals: trading
   *  60 minutes for an hour, and counting across an hour boundary. Added for
   *  NC.4.MD.8, which is entirely about intervals that CROSS the hour and had
   *  no family that fit. 'unit-conversion' is the nearest, and it is wrong:
   *  the hour/minute trade is a conversion, but the error that defines this
   *  standard - counting the minutes already past the hour instead of the
   *  minutes left until it - is a reading-the-clock error with no conversion
   *  in it. 'geometry-and-measurement' would tell a parent their child has a
   *  shape or measuring problem. Grade 3 measures time too, so this will not
   *  stay a one-standard family. */
  | 'time-intervals'
  /** Carrying out a problem that takes more than one step: which step goes
   *  first, and holding the result of the first one while the second is done.
   *  Added for NC.3.OA.8, whose own third keyConcept is "keeping track of the
   *  result of the first step before taking the second".
   *
   *  Not 'order-of-operations', even though that family is literally "which
   *  operation first". The family LABEL is the headline a parent reads - it is
   *  the bold line in WeakSpotsView and in the printed report, with the tag
   *  description beneath - so filing a Grade 3 step-sequencing error there
   *  tells a parent their eight-year-old has an order-of-operations problem.
   *  NC does not introduce order of operations until NC.5.OA.2, and that
   *  family already holds order-of-operations-left-to-right, a genuine PEMDAS
   *  tag, so a parent following the label would land two grades away.
   *
   *  Not 'incomplete-procedure' either: a child who does both steps in the
   *  wrong order has not left the procedure unfinished, and telling a parent
   *  their child stopped early would be just as wrong in the other direction.
   *  forgot-the-final-step stays where it is for exactly that reason - it
   *  really is the unfinished case, and the two halves of a two-step failure
   *  deserve to be told apart.
   *
   *  Grades 4 and 5 both carry multi-step word problems, so this will not stay
   *  a one-standard family. */
  | 'multi-step-problems';

export interface MisconceptionInfo {
  tag: string;
  family: MisconceptionFamily;
  /** One sentence, addressed to a parent or teacher. */
  description: string;
}

function entry(
  tag: string,
  family: MisconceptionFamily,
  description: string,
): MisconceptionInfo {
  return { tag, family, description };
}

export const MISCONCEPTIONS: Record<string, MisconceptionInfo> = Object.fromEntries(
  [
    entry(
      'accepted-any-crossing-as-perpendicular',
      'geometry-and-measurement',
      'Treated any two lines that cross as perpendicular, without checking that they meet at a square corner.',
    ),
    entry(
      'added-carry-before-multiplying',
      'multi-digit-algorithm',
      'Added a carried digit into the next column before multiplying, inflating a partial product in a multi-digit multiplication.',
    ),
    entry(
      'added-instead-of-multiplied',
      'operation-choice',
      'Added the two numbers together when the problem called for multiplying them.',
    ),
    entry(
      'added-instead-of-subtracted',
      'operation-choice',
      'Added the two values instead of subtracting one from the other.',
    ),
    entry(
      'added-numerators-and-denominators',
      'fraction-operations',
      'Added the numerators and the denominators straight across instead of finding a common denominator first.',
    ),
    entry(
      'added-only-the-two-given-sides',
      'geometry-and-measurement',
      'Added the length and the width once each, reporting half of a perimeter instead of the perimeter or the area that was asked for.',
    ),
    entry(
      'added-the-coordinates',
      'coordinate-plane',
      'Added the two coordinate values together instead of treating them as separate horizontal and vertical moves.',
    ),
    entry(
      'added-the-ones-digit-instead-of-multiplying',
      'multi-digit-algorithm',
      'Multiplied by the tens digit of the second factor but then added its ones digit instead of multiplying by it.',
    ),
    entry(
      'added-to-both-parts-instead-of-multiplying',
      'fraction-operations',
      'Built an equivalent fraction by adding the same number to the numerator and to the denominator instead of multiplying both by the same factor, which changes the amount the fraction names.',
    ),
    entry(
      'added-to-the-denominator-instead-of-multiplying',
      'fraction-operations',
      'Added the whole number into the denominator instead of multiplying to find the divided share.',
    ),
    entry(
      'added-without-carrying',
      'multi-digit-algorithm',
      'Added the columns without ever carrying the regrouped ten into the next place.',
    ),
    entry(
      'added-without-converting',
      'unit-conversion',
      'Added the two parts of a mixed-unit measurement together without first converting them into the same unit.',
    ),
    entry(
      'additive-instead-of-multiplicative-relationship',
      'operation-choice',
      'Described the relationship between two quantities as an added difference instead of a multiplicative ratio.',
    ),
    entry(
      'applied-an-extra-conversion-step',
      'unit-conversion',
      'Applied one extra unit-conversion step beyond what the problem required, over-converting the amount.',
    ),
    entry(
      // The mirror image of larger-denominator-means-larger-fraction, and a
      // rule that is perfectly true for unit fractions: 1/8 really is less
      // than 1/3. The error is carrying it over to fractions whose numerators
      // differ, where the count of parts can outweigh their size (3/4 > 1/3
      // even though quarters are smaller than thirds).
      'applied-the-unit-fraction-rule-to-unlike-numerators',
      'fraction-operations',
      'Ordered fractions by denominator alone on the rule "bigger denominator, smaller fraction", which holds only when the numerators match, so the number of parts was never counted.',
    ),
    entry(
      'asked-for-a-single-total-not-data',
      'geometry-and-measurement',
      'Chose a question that produces one summary number rather than one response from each person surveyed, so there is no data set to represent.',
    ),
    entry(
      'assumed-a-right-angle',
      'geometry-and-measurement',
      'Used 90 degrees as the whole angle, reporting how far the given angle falls short of a right angle instead of using the measure the problem states.',
    ),
    entry(
      'assumed-a-straight-angle',
      'geometry-and-measurement',
      'Used 180 degrees as the whole angle instead of the measure the problem states, as if two rays that meet always formed a straight line.',
    ),
    entry(
      'assumed-longer-side-means-greater-area',
      'geometry-and-measurement',
      'Assumed the rectangle with the longest side encloses the most area, when among rectangles of equal perimeter the most square one encloses the most.',
    ),
    entry(
      'assumed-square-corners-where-none-were-given',
      'shape-classification',
      "Treated a figure's corners as square corners when the problem says they are not, and named it a shape that requires right angles.",
    ),
    entry(
      'axes-swapped',
      'coordinate-plane',
      'Swapped the x- and y-axes, treating the first coordinate as the vertical move and the second as horizontal.',
    ),
    entry(
      // NC.4.NF.2 lists benchmark fractions as one of its three strategies, so
      // this is the error the strategy itself invites: the benchmark sorts the
      // two fractions onto the same side and the comparison is abandoned there.
      // Distinct from stopped-comparing-too-soon, which is about place value
      // in whole numbers and lives in another family.
      'benchmark-comparison-left-unfinished',
      'fraction-operations',
      'Checked both fractions against a benchmark such as 1/2, found they fall on the same side of it, and stopped there — calling them equal instead of finishing the comparison.',
    ),
    entry(
      'borrowed-without-reducing-the-whole',
      'fraction-operations',
      'Regrouped one whole into the fraction part but forgot to reduce the whole-number part by one.',
    ),
    entry(
      // Distinct from borrowed-without-reducing-the-whole, which is the
      // fraction version of the same instinct and lives in a different family.
      // A parent shown that tag would be told their child has a fractions
      // problem when what they have is a subtraction-algorithm problem.
      'borrowed-without-reducing-the-next-column',
      'multi-digit-algorithm',
      'Regrouped into a column of a subtraction but never reduced the digit in the place to its left that the amount was taken from, so the answer came out one unit of that place too large.',
    ),
    entry(
      'called-a-large-angle-a-right-angle',
      'geometry-and-measurement',
      'Called the biggest angle in a figure a right angle instead of checking that it measures exactly 90 degrees.',
    ),
    entry(
      'carried-into-the-wrong-column',
      'multi-digit-algorithm',
      'Wrote a carried ten above the wrong column, so one place came out short and the place beyond it came out long.',
    ),
    entry(
      'checked-only-the-first-step',
      'patterns-and-sequences',
      'Accepted a rule because it worked for the first pair of terms, without checking that it still works for the rest of the pattern.',
    ),
    entry(
      'chose-a-unit-for-the-wrong-attribute',
      'geometry-and-measurement',
      'Picked a unit that measures a different attribute — length, mass, or capacity — than the one the object is being measured for.',
    ),
    entry(
      'chose-a-unit-of-the-wrong-size',
      'geometry-and-measurement',
      'Picked a unit that measures the right attribute but is far too large or too small for the object being measured.',
    ),
    entry(
      'classified-by-one-property-only',
      'shape-classification',
      "Classified the shape using only one of its properties instead of checking every property needed for the most specific name.",
    ),
    entry(
      'classified-by-the-wrong-attribute',
      'shape-classification',
      'Answered with a side-length name when the question asked how a figure is classified by its angles, or the other way round.',
    ),
    entry(
      'common-denominator-numerator-not-scaled',
      'fraction-operations',
      'Switched to a common denominator but forgot to rescale the numerators to match it.',
    ),
    entry(
      'compared-by-digit-count',
      'place-value-and-decimals',
      'Judged a decimal as larger because its decimal part has more digits, reading those digits as a whole number instead of by place value.',
    ),
    entry(
      'compared-decimals-right-to-left',
      'place-value-and-decimals',
      'Compared the decimals starting from the rightmost digit instead of the leftmost, most significant place.',
    ),
    entry(
      // The three tags below name whole-number comparison errors. The nearest
      // existing tags - compared-by-digit-count, compared-decimals-right-to-
      // left, same-digits-read-as-equal - are all about the decimal PART of a
      // number, which is Grade 5 material a Grade 4 student has not met. A
      // child comparing 62,408 with 62,480 has not made a decimal error, and
      // telling a parent they did is worse than telling them nothing.
      'compared-leading-digits-without-place-value',
      'place-value-and-decimals',
      'Compared the leftmost digits of two numbers without first counting how many places each one has, so a shorter number starting with a big digit looked like the larger one.',
    ),
    entry(
      // Both NC.4.NF.2 and NC.4.NF.7 state in their own sourced wording that a
      // comparison is valid only when the two amounts refer to the same whole,
      // so the error of ignoring that has to have a name of its own. It is not
      // a comparison error - the child's rule for the fractions may be
      // perfectly sound - it is a failure to notice the rule does not apply.
      'compared-across-different-wholes',
      'fraction-operations',
      'Compared two fractions or decimals that refer to different wholes, where the numbers alone cannot decide which amount is larger.',
    ),
    entry(
      'compared-numerators-only',
      'fraction-operations',
      'Compared or ordered fractions by their numerators alone, ignoring that the denominators make the parts being counted different sizes.',
    ),
    entry(
      'compared-the-wrong-place-first',
      'place-value-and-decimals',
      'Compared two whole numbers starting from the ones digit instead of from the greatest place, so the comparison came out backwards.',
    ),
    entry(
      'confused-categorical-with-numerical',
      'geometry-and-measurement',
      'Chose a survey question whose answers are names or categories when numerical data was asked for, or the reverse.',
    ),
    entry(
      'counted-past-sixty-minutes',
      'time-intervals',
      'Let a count of minutes run past 60 instead of trading 60 minutes for one hour, producing a time no clock shows.',
    ),
    entry(
      'doubled-only-one-dimension',
      'geometry-and-measurement',
      "Doubled just one of a rectangle's two dimensions when finding its perimeter, instead of doubling both.",
    ),
    entry(
      'extended-the-table-one-row-at-a-time',
      'unit-conversion',
      'Continued a conversion table by adding the same amount to the previous row instead of applying the multiplicative rule to the new value.',
    ),
    entry(
      'ignored-the-fixed-perimeter',
      'geometry-and-measurement',
      'Chose a rectangle without checking that its perimeter matched the fixed amount of fencing or border the problem allows.',
    ),
    entry(
      'left-the-measurement-unconverted',
      'unit-conversion',
      'Reported the original number unchanged, without carrying out the conversion the question asked for.',
    ),
    entry(
      'mislabeled-the-unit',
      'geometry-and-measurement',
      'Carried out the arithmetic correctly but labeled the answer with a unit the measurements were never given in.',
    ),
    entry(
      'multiplied-every-side-length-together',
      'geometry-and-measurement',
      "Multiplied all of the given side lengths together in one product instead of finding each part's area and adding them.",
    ),
    entry(
      'off-by-one-gridline',
      'geometry-and-measurement',
      'Landed one gridline off when reading a scaled graph, by counting the zero line itself as the first mark above zero.',
    ),
    entry(
      'read-the-scale-by-counting-ticks',
      'geometry-and-measurement',
      'Reported how many gridlines a bar or point reached instead of the value that gridline stands for on a scaled graph.',
    ),
    entry(
      'read-the-wrong-protractor-scale',
      'geometry-and-measurement',
      "Read the protractor's other scale, reporting the angle's supplement instead of the angle itself.",
    ),
    entry(
      'regrouped-the-minutes-but-not-the-hours',
      'time-intervals',
      'Traded 60 minutes when regrouping a time but left the hours unchanged, so the calculation never crossed the hour.',
    ),
    entry(
      'stopped-comparing-too-soon',
      'place-value-and-decimals',
      'Stopped comparing two numbers before reaching the first place where their digits actually differ, and called them equal.',
    ),
    entry(
      'computed-exactly-instead-of-estimating',
      'incomplete-procedure',
      'Calculated the exact answer instead of using benchmark fractions to estimate as the problem asked.',
    ),
    entry(
      'computed-surface-area',
      'geometry-and-measurement',
      'Calculated the surface area of the solid instead of its volume.',
    ),
    entry(
      'concatenated-the-mixed-units',
      'unit-conversion',
      'Ran two units together as if they were digits of one number, instead of converting each unit separately.',
    ),
    entry(
      'confused-factor-with-multiple',
      'factors-and-multiples',
      'Mixed up factors and multiples, naming a number the pattern counts UP to where a number that divides into it was needed (or the other way round).',
    ),
    entry(
      'confused-parallel-with-perpendicular',
      'geometry-and-measurement',
      'Swapped the two line relationships, calling lines that cross at a square corner parallel or calling lines that never meet perpendicular.',
    ),
    entry(
      'confused-times-with-more',
      'operation-choice',
      'Read a multiplication relationship ("times as many") as if it were an addition relationship ("more than").',
    ),
    entry(
      'converted-mixed-number-by-adding',
      'fraction-operations',
      'Converted a mixed number to an improper fraction by adding the whole number and numerator instead of multiplying first.',
    ),
    entry(
      'converted-only-second-fraction',
      'fraction-operations',
      'Rescaled only one of the two fractions to the common denominator and left the other unchanged.',
    ),
    entry(
      'coordinates-reversed',
      'coordinate-plane',
      'Reversed the order of the x- and y-coordinates, landing on or naming the mirrored point.',
    ),
    entry(
      'counted-a-diagonal-as-a-line-of-symmetry',
      'geometry-and-measurement',
      'Counted a diagonal as a line of symmetry; folding a rectangle that is not a square along its diagonal does not make the halves match.',
    ),
    entry(
      'counted-an-arrow-as-an-endpoint',
      'geometry-and-measurement',
      'Read the arrowhead that shows a figure keeps going forever as if it were an endpoint, so a ray was named a line segment.',
    ),
    entry(
      'counted-an-uneven-division-as-a-factor',
      'factors-and-multiples',
      'Counted a number as a factor even though dividing by it left something over, so the pair does not multiply back to the number they started with.',
    ),
    entry(
      'counted-endpoints-not-intervals',
      'coordinate-plane',
      'Counted the marks between two points instead of the spaces between them, overstating the distance by one.',
    ),
    entry(
      'counted-terms-not-steps',
      'patterns-and-sequences',
      "Counted the terms of a pattern instead of the steps between them, so the pattern's rule was applied one time too many.",
    ),
    entry(
      // The exact inverse of operated-on-the-like-denominators-too: that tag
      // names a child who ADDS denominators when joining fractions, this one
      // names a child who SPLITS a denominator when breaking one apart
      // (7/12 given as 3/6 + 4/6). Same misunderstanding of what a
      // denominator is, opposite direction, and a parent needs to be told
      // which one their child did.
      'decomposed-the-denominator-too',
      'fraction-operations',
      'Split the denominator as well as the numerator when decomposing a fraction, so the pieces came out a different size from the parts being broken up and no longer add back to the fraction they came from.',
    ),
    entry(
      'decimal-point-misplaced',
      'place-value-and-decimals',
      'Placed the decimal point in the wrong position by miscounting how many places it should shift.',
    ),
    entry(
      'divided-by-only-one-digit-of-the-divisor',
      'multi-digit-algorithm',
      'Divided by only one digit of a multi-digit divisor instead of the whole divisor.',
    ),
    entry(
      'divided-by-wrong-count',
      'operation-choice',
      'Divided by the wrong count of people or groups named in the problem.',
    ),
    entry(
      'divided-instead-of-multiplied',
      'operation-choice',
      'Divided the two values instead of multiplying them.',
    ),
    entry(
      // Broadened when NC.4.NF.3 decomposition arrived: the same omission
      // happens when a fraction is broken INTO pieces (9/10 given as
      // 3/10 + 5/10) as when mixed numbers are combined. One error, one tag,
      // and the description has to cover both uses rather than only the first.
      'dropped-a-fraction-part',
      'fraction-operations',
      'Left out one of the fractional parts — when combining the whole-number parts of a mixed-number problem, or when breaking a fraction into pieces that have to add back to it.',
    ),
    entry(
      'dropped-partial-product-zero',
      'multi-digit-algorithm',
      "Left out the placeholder zero on a partial-product row of a multi-digit multiplication, shrinking that row's value tenfold.",
    ),
    entry(
      'dropped-the-extra-decimal-place',
      'place-value-and-decimals',
      'Dropped a decimal place instead of padding the shorter number with a zero before subtracting.',
    ),
    entry(
      'dropped-zero-in-quotient',
      'multi-digit-algorithm',
      'Stopped the division early and never recorded a zero digit that belonged in the quotient.',
    ),
    entry(
      'estimated-to-the-wrong-benchmark',
      'fraction-operations',
      'Rounded a fraction to the wrong benchmark value, such as rounding down when it was closer to the next whole number.',
    ),
    entry(
      'exclusive-trapezoid-definition',
      'shape-classification',
      "Used the exclusive definition of a trapezoid (exactly one pair of parallel sides) instead of NC's inclusive definition (at least one pair).",
    ),
    entry(
      'forgot-the-final-step',
      'incomplete-procedure',
      'Completed an early step of a multi-step problem and reported that intermediate result instead of finishing the procedure.',
    ),
    entry(
      'forgot-to-regroup',
      'fraction-operations',
      'Subtracted the fraction parts without regrouping (borrowing) even though the first fraction was smaller than the second.',
    ),
    entry(
      'forgot-to-scale-by-the-whole-number',
      'fraction-operations',
      'Found the per-unit amount correctly but never scaled it up by the whole-number quantity in the problem.',
    ),
    entry(
      'found-symmetry-in-the-wrong-direction',
      'geometry-and-measurement',
      'Chose a figure that is symmetric, but along a fold in a different direction from the one the question asked about.',
    ),
    entry(
      'halved-instead-of-dividing',
      'operation-choice',
      'Halved the bigger number instead of dividing it by the number the problem actually gave, because halving is the division they can do in their head.',
    ),
    entry(
      'hierarchy-inverted',
      'shape-classification',
      'Reversed a shape-category containment relationship, claiming the broader category is a member of the narrower one.',
    ),
    entry(
      'hierarchy-too-broad',
      'shape-classification',
      'Applied a shape category to a broader set of shapes than its definition actually allows.',
    ),
    entry(
      'hierarchy-too-narrow',
      'shape-classification',
      'Denied a valid containment between shape categories, treating them as more separate than they really are.',
    ),
    entry(
      'ignored-a-constraint',
      'shape-classification',
      "Used some of the shape's given properties but ignored one stated definitional constraint that ruled out the chosen answer.",
    ),
    entry(
      'ignored-grouping-symbols',
      'order-of-operations',
      'Treated the expression as if the parentheses were not there — either ignoring them when working it out, or leaving them out when writing an equation that needed them to group the whole quantity.',
    ),
    entry(
      'ignored-remainder',
      'remainder-handling',
      'Dropped the remainder from a division instead of accounting for the leftover amount.',
    ),
    entry(
      'ignored-the-endpoints-of-the-figure',
      'geometry-and-measurement',
      'Overlooked the endpoints that show where a figure stops, naming a ray or a line segment a line, which runs on forever both ways.',
    ),
    entry(
      'ignored-the-multiplier',
      'operation-choice',
      'Noticed a quantity shared between two expressions but overlooked the multiplier that made one actually larger than the other.',
    ),
    entry(
      'ignored-the-quantity-multipliers',
      'operation-choice',
      'Used one of each item instead of multiplying by the actual quantities given in the problem.',
    ),
    entry(
      'ignored-the-starting-term',
      'patterns-and-sequences',
      'Applied the rule the right number of times but started from zero, leaving out the number the pattern actually began with.',
    ),
    entry(
      'incomplete-grouping-evaluation',
      'order-of-operations',
      'Evaluated only part of what was inside a grouping symbol, dropping one of the operations that belonged inside it.',
    ),
    entry(
      'inverted-both-fractions',
      'fraction-operations',
      'Took the reciprocal of both fractions instead of leaving them as written — division flips only the divisor, and multiplication flips nothing.',
    ),
    entry(
      'inverted-the-ratio',
      'operation-choice',
      'Used the reciprocal of the correct scale factor, inverting the ratio between two related quantities.',
    ),
    entry(
      'inverted-wrong-factor',
      'fraction-operations',
      'Took the reciprocal of the dividend instead of the divisor when dividing fractions.',
    ),
    entry(
      'judged-symmetry-by-appearance',
      'geometry-and-measurement',
      'Decided a figure was symmetric because it looks balanced, without checking that a fold lands the two halves on each other.',
    ),
    entry(
      'larger-denominator-means-larger-fraction',
      'fraction-operations',
      'Treated the larger denominator as the larger fraction — judging 1/8 greater than 1/3 because 8 is greater than 3 — reading the denominator as a count of parts owned rather than as the size of each part.',
    ),
    entry(
      'miscounted-the-frequency',
      'geometry-and-measurement',
      'Miscounted how many data points shared a given measurement, undercounting the total.',
    ),
    entry(
      'misgrouped-the-subtraction',
      'order-of-operations',
      'Applied a subtraction to the wrong part of the expression instead of to the whole product or sum it belonged with.',
    ),
    entry(
      'misidentified-the-extreme',
      'geometry-and-measurement',
      'Picked the wrong data point as the maximum or minimum when finding a range.',
    ),
    entry(
      'misplaced-digits-in-the-quotient',
      'multi-digit-algorithm',
      'Recorded the digits of a long-division quotient in the wrong place-value positions.',
    ),
    entry(
      'multiplication-always-increases',
      'operation-choice',
      'Assumed multiplying always makes a number larger, missing that multiplying by a fraction less than one makes it smaller.',
    ),
    entry(
      'multiplied-all-dimensions-together',
      'geometry-and-measurement',
      "Multiplied every dimension of a composite solid together in one product instead of computing and summing each part's volume.",
    ),
    entry(
      'multiplied-crosswise',
      'fraction-operations',
      'Cross-multiplied the fractions, multiplying the numerator of one by the denominator of the other, instead of multiplying straight across.',
    ),
    entry(
      'multiplied-each-digit-without-carrying',
      'multi-digit-algorithm',
      'Multiplied each digit of the larger factor separately and wrote only the ones digit of each product, never carrying the tens into the next column.',
    ),
    entry(
      'multiplied-instead-of-divided',
      'operation-choice',
      'Multiplied the two quantities instead of dividing one by the other.',
    ),
    entry(
      'multiplied-only-the-whole-number-part',
      'fraction-operations',
      'Multiplied only the whole-number part of a decimal or mixed number and left the fractional part unchanged.',
    ),
    entry(
      // Worded for repetition rather than for multiplication alone, because
      // g4-nf3-05 commits the same error while DECOMPOSING: asked for 3/4 as
      // three pieces, the child writes 1/12 + 1/12 + 1/12, scaling the
      // denominator by the number of copies. Same error, no multiplication
      // sign in sight.
      'multiplied-the-denominator-too',
      'fraction-operations',
      'Scaled the denominator as well as the numerator when a fraction was being repeated — multiplied by a whole number, or written out as a sum of copies — though taking more parts changes only how many there are, never how big each one is.',
    ),
    entry(
      'multiplied-the-denominators-instead-of-keeping-them',
      'fraction-operations',
      'Multiplied the two denominators together when adding or subtracting fractions that already shared one denominator, instead of keeping the common denominator unchanged.',
    ),
    entry(
      'multiplied-whole-and-fraction-parts-separately',
      'fraction-operations',
      'Multiplied the whole-number parts and the fraction parts of two mixed numbers separately instead of converting to improper fractions first.',
    ),
    entry(
      'named-a-broader-category',
      'shape-classification',
      'Gave a true but less specific shape name instead of the most specific category that fits every given property.',
    ),
    entry(
      'named-a-ray-from-the-wrong-endpoint',
      'geometry-and-measurement',
      'Named a ray starting from the point it passes through instead of from its endpoint, which names the ray pointing the opposite way.',
    ),
    entry(
      'named-a-triangle-by-its-smaller-angles',
      'shape-classification',
      'Named a triangle from its two smaller angles instead of its largest one, so a triangle with an obtuse or right angle was called acute.',
    ),
    entry(
      'omitted-one-part-of-composite',
      'geometry-and-measurement',
      'Computed and reported only one part of a composite figure, leaving out another piece entirely.',
    ),
    entry(
      'omitted-part-of-the-measurement',
      'unit-conversion',
      'Converted only part of a mixed-unit measurement and left another part out of the calculation.',
    ),
    entry(
      'omitted-placeholder-zero',
      'place-value-and-decimals',
      'Left out a placeholder zero in a decimal place value, shifting the remaining digits into the wrong positions.',
    ),
    entry(
      // Distinct from added-numerators-and-denominators, which names the error
      // made when the denominators are UNLIKE and the child skips finding a
      // common one. Here the denominators already match, so there is nothing to
      // find: the child operates on them anyway, out of the habit of doing
      // something to every number in sight. Telling a Grade 4 child adding
      // eighths to eighths that they "forgot to find a common denominator"
      // would name a step the problem never had.
      //
      // Named for the operation on the DENOMINATORS rather than for addition,
      // because the same instinct fires in both directions: 11/12 - 4/12
      // written as 7/8 is this error subtracting. A description that said only
      // "added" would be wrong for some of the items that use it.
      'operated-on-the-like-denominators-too',
      'fraction-operations',
      'Added or subtracted the denominators as well as the numerators even though both fractions were already counted in the same-size parts, so the answer names parts of a different size from the ones being joined or separated.',
    ),
    entry(
      'order-of-operations-left-to-right',
      'order-of-operations',
      'Evaluated the expression strictly left to right, ignoring the standard precedence of multiplication and division over addition and subtraction.',
    ),
    entry(
      'ordered-from-the-wrong-end',
      'place-value-and-decimals',
      'Put the numbers in the correct order but ran the list the wrong way, giving greatest-to-least where least-to-greatest was asked for, or the reverse.',
    ),
    entry(
      'place-value-shift-wrong-direction',
      'place-value-and-decimals',
      "Shifted a value's place value in the wrong direction, treating a move that should shrink the number as one that grows it (or vice versa).",
    ),
    entry(
      'property-inherited-upward',
      'shape-classification',
      "Applied a special shape's property to the whole broader category it belongs to, when the property does not hold for every member.",
    ),
    entry(
      'read-the-whole-number-as-part-of-the-fraction',
      'place-value-and-decimals',
      'Read the whole-number part of a word-form number as if it were part of the decimal fraction.',
    ),
    entry(
      'remainder-written-as-a-decimal',
      'remainder-handling',
      'Wrote a division remainder directly as a decimal digit instead of converting it correctly into a fraction or decimal amount.',
    ),
    entry(
      'repeated-the-whole-fraction-not-the-unit-fraction',
      'fraction-operations',
      'Decomposed a fraction into copies of the whole fraction instead of copies of its unit fraction, so the pieces add up to far more than the fraction they came from.',
    ),
    entry(
      'reported-remainder-without-interpreting',
      'remainder-handling',
      'Reported the raw quotient and remainder without interpreting what they mean for the situation in the problem.',
    ),
    entry(
      // Filed under remainder-handling until 2026-09-13 because its first two
      // uses happened to be division problems. The error has nothing to do
      // with remainders - one use is 601 x 7 - and its exact mirror image,
      // computed-exactly-instead-of-estimating, was already here. Grouping
      // them apart told a parent their child struggles with remainders when
      // what they actually do is stop at an approximation.
      'reported-the-estimate',
      'incomplete-procedure',
      'Rounded the numbers and reported an estimate instead of computing the exact answer the problem required.',
    ),
    entry(
      'reported-the-measurement-not-the-total',
      'geometry-and-measurement',
      'Reported a single measurement from the data instead of the total or subtotal the question actually asked for.',
    ),
    entry(
      'required-all-sides-equal-for-symmetry',
      'geometry-and-measurement',
      'Decided a figure cannot have a line of symmetry unless all of its sides are the same length.',
    ),
    entry(
      'reused-a-coordinate-from-the-wrong-axis',
      'coordinate-plane',
      'Reused a coordinate value shared between two points on the wrong axis when finding a missing vertex.',
    ),
    entry(
      'reversed-dividend-and-divisor',
      'fraction-operations',
      'Divided the two numbers in the wrong order, swapping which one is the dividend and which is the divisor.',
    ),
    entry(
      'reversed-the-inequality-symbol',
      'place-value-and-decimals',
      'Ordered the two numbers correctly but read the inequality symbol backwards, reversing which side is greater.',
    ),
    entry(
      // Distinct from common-denominator-numerator-not-scaled, which is the
      // same slip committed DURING an addition, where a common denominator is
      // being looked for. This one is the whole task: asked to rename a
      // fraction in larger parts, the child rewrites the denominator and
      // copies the numerator across unchanged.
      'scaled-the-denominator-only',
      'fraction-operations',
      'Multiplied the denominator by the scaling factor but carried the numerator over unchanged, so the renamed fraction is smaller than the one it was meant to equal.',
    ),
    entry(
      'scaled-the-wrong-addend',
      'fraction-operations',
      "Rescaled the second fraction's numerator by the common-denominator factor instead of the first fraction's, scaling the wrong addend to the common denominator.",
    ),
    entry(
      'reversed-the-relationship',
      'operation-choice',
      'Found the correct factor or ratio between two quantities but assigned it to the wrong one, reversing which quantity is larger.',
    ),
    entry(
      'reversed-the-subtraction',
      'order-of-operations',
      'Read "subtract A from B" as "subtract B from A", reversing the order of a subtraction phrase.',
    ),
    entry(
      'rounded-the-factor-to-one',
      'fraction-operations',
      'Treated a fraction that is close to one as if it were exactly one, losing the small difference that changes the answer.',
    ),
    entry(
      'same-digits-read-as-equal',
      'place-value-and-decimals',
      'Judged two decimals as equal because they use the same digits, ignoring that place value makes their order different.',
    ),
    entry(
      // Deliberately broader than "reading": a zero place is skipped just as
      // often mid-algorithm (405 x 7 worked as 45 x 7) as it is mid-numeral,
      // and it is the same error to repair either way. Broad on DIRECTION too:
      // closing up an empty place while reading a numeral drops later digits a
      // column, while doing it when writing a number name pushes them up one
      // ("forty thousand, ninety-three" written 40,930). Same error, and the
      // description must not name a direction it only sometimes has.
      'skipped-the-zero-place',
      'place-value-and-decimals',
      'Closed up a place holding a zero instead of letting it hold that place open, so the digits past it landed in the wrong columns.',
    ),
    entry(
      'squared-the-base-area',
      'geometry-and-measurement',
      'Multiplied the base area by itself instead of by the height when finding volume.',
    ),
    entry(
      'stopped-after-the-first-line-of-symmetry',
      'geometry-and-measurement',
      'Stopped after finding one line of symmetry instead of testing every direction the figure can fold.',
    ),
    entry(
      'stopped-at-an-intermediate-unit',
      'unit-conversion',
      'Converted partway through a chain of units and reported that intermediate unit instead of continuing to the requested unit.',
    ),
    entry(
      'stopped-the-divisor-check-early',
      'factors-and-multiples',
      'Stopped testing divisors too soon, so a factor the number really has was never found and the number was called prime or its list of factor pairs came up short.',
    ),
    entry(
      'subtracted-instead-of-added',
      'operation-choice',
      'Subtracted one quantity from the other when the problem called for adding them together.',
    ),
    entry(
      'subtracted-instead-of-divided',
      'operation-choice',
      'Subtracted the two quantities instead of dividing one by the other.',
    ),
    entry(
      'subtracted-instead-of-multiplied',
      'operation-choice',
      'Subtracted the two numbers when the problem called for multiplying them.',
    ),
    entry(
      'subtracted-the-two-protractor-readings',
      'geometry-and-measurement',
      "Subtracted the protractor's two scale readings from each other instead of reading the one scale that starts at zero on the angle's ray.",
    ),
    entry(
      'subtracted-the-wrong-coordinates',
      'coordinate-plane',
      'Subtracted the wrong pair of coordinate values instead of the ones that measure the actual distance between the points.',
    ),
    entry(
      'subtracted-without-regrouping',
      'multi-digit-algorithm',
      'Subtracted the smaller digit from the larger one in every column instead of regrouping when the top digit is smaller.',
    ),
    entry(
      'summed-all-data-points',
      'geometry-and-measurement',
      'Added every data point together instead of using only the specific ones the question asked about.',
    ),
    entry(
      'swapped-the-decimal-place-values',
      'place-value-and-decimals',
      'Swapped which decimal place two digits belong in — writing 0.81 where 0.18 belongs, or putting tenths where thousandths go.',
    ),
    entry(
      'treated-adjacent-sides-as-parallel',
      'geometry-and-measurement',
      'Took "opposite sides are parallel" to mean every pair of sides is parallel, including two sides that meet at a corner.',
    ),
    entry(
      'treated-any-unequal-sides-as-scalene',
      'shape-classification',
      'Called a triangle scalene because its three sides are not all the same length, without checking whether two of them match.',
    ),
    entry(
      'treated-connected-sides-as-not-parallel',
      'geometry-and-measurement',
      'Read "parallel lines never meet" as a rule about the whole figure, so sides joined at the corners could not count as parallel.',
    ),
    entry(
      'treated-equal-halves-as-symmetry',
      'geometry-and-measurement',
      'Treated any line that cuts a figure into two pieces of the same size as a line of symmetry, without folding to check that the halves match.',
    ),
    entry(
      'unit-conversion-inverted',
      'unit-conversion',
      'Applied a unit conversion in the wrong direction, dividing by the conversion factor when multiplying was needed (or vice versa).',
    ),
    entry(
      'used-area-formula-for-perimeter',
      'geometry-and-measurement',
      'Multiplied the length by the width, finding the area, when the perimeter was what the question asked for.',
    ),
    entry(
      'used-area-not-volume',
      'geometry-and-measurement',
      'Computed the area of one face of the solid instead of its volume.',
    ),
    entry(
      'used-half-the-perimeter-as-each-side',
      'geometry-and-measurement',
      'Halved the perimeter and used that as each side length, as if a rectangle had only two sides to fence.',
    ),
    entry(
      'used-perimeter-formula',
      'geometry-and-measurement',
      'Added the side lengths together as if finding a perimeter, instead of using the multiplication needed for area or volume.',
    ),
    entry(
      'used-place-value-as-the-factor',
      'place-value-and-decimals',
      "Reported a digit's place value itself as the scale factor between two numbers instead of computing the actual ratio.",
    ),
    entry(
      'used-the-data-values-not-their-frequencies',
      'geometry-and-measurement',
      'Calculated with the measurements labeled on the graph instead of with how many data points were recorded at each one.',
    ),
    entry(
      // Broadened when NC.4.NF.3 decomposition arrived. The error is one
      // substitution - the denominator put where the numerator belongs - and
      // it shows up both when renaming a fraction and when decomposing one
      // (9/10 split as 5/10 + 5/10, which decomposes the 10 and not the 9).
      'used-the-denominator-as-the-new-numerator',
      'fraction-operations',
      "Used the denominator's value where the numerator's was needed — as the new numerator when renaming a fraction in smaller parts, or as the amount being split up when decomposing one.",
    ),
    entry(
      'used-the-minutes-past-the-hour-not-the-minutes-left',
      'time-intervals',
      'Counted the minutes already past the hour instead of the minutes remaining until the next hour when bridging an hour boundary.',
    ),
    entry(
      'used-the-numerator-as-a-whole-number',
      'fraction-operations',
      "Treated a fraction's numerator as if it were a whole-number amount being removed, rather than part of a multiplicative comparison.",
    ),
    entry(
      'used-the-side-lengths-as-coordinates',
      'coordinate-plane',
      "Reported a rectangle's side lengths as if they were the coordinates of the missing vertex.",
    ),
    entry(
      'used-the-step-size-as-the-factor',
      'operation-choice',
      "Used one pattern's own step size as the multiplicative factor between two related patterns, instead of the ratio between their step sizes.",
    ),
    entry(
      'used-the-wrong-given-quantity',
      'operation-choice',
      'Picked up a number the question was not about and worked with it instead of the one that was asked for.',
    ),
    entry(
      'used-wrong-conversion-factor',
      'unit-conversion',
      'Applied the conversion factor for a different pair of units than the ones actually in the problem.',
    ),
    entry(
      'word-form-place-value-shifted',
      'place-value-and-decimals',
      'Shifted the digits of a word-form number into the wrong decimal places, such as omitting a placeholder zero.',
    ),
    entry(
      'wrong-power-of-ten',
      'place-value-and-decimals',
      'Shifted a value by the wrong number of powers of ten, moving one place too many or too few.',
    ),
    entry(
      // The example has to run BOTH ways. Its first uses were whole numbers,
      // where the digit is smaller than the value it stands for; in g4-nf6-04
      // the same error writes 9.0 where 0.09 belongs, and the digit is a
      // hundred times larger. A parent reads this string, and an example that
      // only scales one way describes the opposite of what their child did.
      'wrote-the-digit-not-its-value',
      'place-value-and-decimals',
      'Reported a digit itself where the amount that digit stands for in its place was asked for — answering 6 instead of 6,000, or 9.0 instead of 0.09.',
    ),
    entry(
      'wrote-the-product-as-a-mixed-number',
      'fraction-operations',
      'Wrote the whole number and the fraction side by side as a mixed number instead of multiplying them, which adds the fraction to the whole number rather than taking that many copies of it.',
    ),

    // ── Grade 3 Operations & Algebraic Thinking ──────────────────────────
    // Grade 3 is the year multiplication and division begin, so its errors are
    // about what those operations MEAN - which number counts the groups, which
    // counts what is in a group, and whether the count of groups was kept
    // straight - rather than about an algorithm going wrong. None of the
    // existing tags named any of that: the nearest, forgot-the-final-step and
    // divided-by-wrong-count, describe different mistakes, and a mis-filed tag
    // tells a parent their child made an error they did not make.
    entry(
      'skip-counted-one-group-short',
      'incomplete-procedure',
      'Skip-counted the equal groups but left one group out, so the count stopped one whole group short of the full amount.',
    ),
    entry(
      'skip-counted-one-group-too-many',
      'incomplete-procedure',
      'Skip-counted the equal groups but counted one group too many, usually by counting the number the count starts from as a group of its own.',
    ),
    entry(
      'counted-only-one-group',
      'incomplete-procedure',
      'Counted a single row or group and reported that number, instead of going on to find how many there are in all of the equal groups together.',
    ),
    entry(
      'multiplied-only-part-of-the-decomposed-factor',
      'incomplete-procedure',
      'Broke a factor into two smaller pieces, multiplied by the first piece, and then added the second piece on instead of multiplying by it too.',
    ),
    entry(
      'left-out-a-factor',
      'operation-choice',
      'Multiplied only two of the three quantities in the problem and left the third one out of the calculation entirely.',
    ),
    entry(
      'swapped-the-number-of-groups-with-the-group-size',
      'operation-choice',
      'Swapped the two roles the numbers play in equal groups, reading the count of groups as the amount in each group or the other way round.',
    ),
    entry(
      // Ruling 12-3 retired the "division is commutative" distractor this
      // replaces: 3 / 12 is 0.25, and a Grade 3 child has no decimals, so it
      // was never a value a student reaches. This one is - the divisor is
      // printed right there in the question.
      'answered-with-the-number-of-groups',
      'operation-choice',
      'Answered an equal-sharing question with the number of groups, which the question already gave, instead of working out how many go in each group.',
    ),
    entry(
      // Not used-the-wrong-given-quantity, which is about working with a
      // number the question was not about. Here the division may be chosen
      // perfectly well; what goes wrong is which of the two factors gets
      // reported as the missing one, and that is the whole of NC.3.OA.6.
      'reported-the-factor-that-was-already-given',
      'operation-choice',
      'Answered an unknown-factor problem with the factor the equation already showed, instead of the one hidden in the box.',
    ),
    entry(
      'confused-the-quotient-with-the-dividend',
      'operation-choice',
      'Read the answer to a division as the total the problem started with, rather than as the share each group receives.',
    ),
    entry(
      'read-the-quotient-as-the-leftover',
      'remainder-handling',
      'Read the answer to an equal-sharing problem as the amount left over at the end, rather than as the size of each equal share.',
    ),
    entry(
      'added-instead-of-divided',
      'operation-choice',
      'Added the two numbers together when the problem called for dividing one of them by the other.',
    ),
    entry(
      'used-the-addend-as-both-factors',
      'operation-choice',
      'Turned a repeated addition into a multiplication by using the repeated number as BOTH factors, so the count of how many times it repeats was never used.',
    ),
    entry(
      // Family chosen for the parent-facing label, not the taxonomy: see the
      // note on 'multi-step-problems' above. NC.3.OA.8 is two-step WORD
      // problems using addition, subtraction and multiplication; evaluating a
      // bare expression such as 3 + 4 x 2 is NC.5.OA.2, two grades on.
      'did-the-two-steps-in-the-wrong-order',
      'multi-step-problems',
      'Carried out the second step of a two-step problem before the first, so the wrong quantity was multiplied or taken away.',
    ),
    entry(
      'checked-only-part-of-the-pattern',
      'patterns-and-sequences',
      'Formed a rule from only some of the numbers in a pattern, without checking that the rule still holds for the rest of them.',
    ),
    entry(
      'checked-only-one-of-the-two-patterns',
      'patterns-and-sequences',
      'Checked a number against only one of the two patterns being compared, and stopped before checking whether it appears in the other one as well.',
    ),
    entry(
      'added-the-two-step-sizes',
      'patterns-and-sequences',
      'Added the two counting numbers together to find a number belonging to both counts, instead of looking for a number that actually appears in both.',
    ),
    entry(
      'reversed-the-direction-of-the-pattern',
      'patterns-and-sequences',
      'Turned around which of two skip counts contains the other, saying every number counted by the smaller step also appears in the larger step’s count, when it is only true the other way round.',
    ),
    // Grade 3 Base Ten. NC.3.NBT.2 is estimation for reasonableness, the
    // addition/subtraction inverse relationship and expanded-form decomposition;
    // NC.3.NBT.3 is a one-digit number times a multiple of 10 in the range 10-90.
    entry(
      'dropped-the-zero-from-the-multiple-of-ten',
      'multi-digit-algorithm',
      'Multiplied by the tens digit of a multiple of 10 but dropped its place, answering 6 x 40 as 24 instead of 240.',
    ),
    entry(
      'lost-the-regrouping-across-a-zero',
      'multi-digit-algorithm',
      'Regrouped straight from the hundreds into the ones past a 0 in the tens, leaving the tens digit untouched instead of trading it down to 9.',
    ),
    entry(
      'used-only-the-hundreds-digit',
      'place-value-and-decimals',
      'Kept just the hundreds digit of each number when estimating and threw the rest away, so the estimate always comes out too small.',
    ),
    entry(
      'took-both-numbers-up-to-the-next-hundred',
      'place-value-and-decimals',
      'Moved both numbers up to the next hundred when estimating, instead of to the hundred each one is actually closest to, so the estimate came out too big.',
    ),
    entry(
      'gave-the-exact-sum-instead-of-an-estimate',
      'incomplete-procedure',
      'Worked out the exact answer when the question asked for an estimate, so the reasonableness check the estimate was for never happened.',
    ),
    // Grade 3 Fractions - a child's FIRST year of fractions, so these are
    // foundational: what the two numbers in the symbol mean, what counts as an
    // equal part, and which whole the fraction is a fraction OF.
    entry(
      'read-the-fraction-as-two-whole-numbers',
      'fraction-operations',
      'Read a fraction as two separate whole numbers - 1/4 as "one and four" - rather than as one number naming one of four equal parts.',
    ),
    entry(
      'treated-the-denominator-as-a-count-of-wholes',
      'fraction-operations',
      'Read the denominator as a number of whole things rather than the number of equal parts one whole is cut into, so 1/3 became one of three whole circles.',
    ),
    entry(
      'counted-parts-without-checking-they-are-equal',
      'fraction-operations',
      'Counted how many pieces a whole was cut into without checking that the pieces are the same size, which is what makes any one of them a fraction of the whole.',
    ),
    entry(
      'wrote-the-fraction-upside-down',
      'fraction-operations',
      'Wrote the number of equal parts on top and the number of parts counted underneath, turning 1/8 into 8/1.',
    ),
    entry(
      'named-the-unshaded-part',
      'fraction-operations',
      'Named the part that was left over instead of the part the question asked about, counting the pieces still there rather than the pieces taken.',
    ),
    entry(
      'named-the-whole-not-one-part',
      'fraction-operations',
      'Named the whole thing instead of one of its equal parts, writing 8/8 where 1/8 was asked for.',
    ),
    entry(
      'named-the-unit-fraction-not-the-count',
      'fraction-operations',
      'Named one single part instead of counting how many of those parts the question was about, answering 1/6 where 6/6 was asked for.',
    ),
    entry(
      'used-the-denominator-as-the-count',
      'fraction-operations',
      'Used the denominator as the number of unit fractions being counted, instead of as the size of each one, so 5/8 was read as eight eighths.',
    ),
    entry(
      'compared-the-part-to-the-rest',
      'fraction-operations',
      'Wrote the fraction as the parts counted against the parts left over instead of against the whole, so 4 of 6 pieces became 4/2 rather than 4/6.',
    ),
    entry(
      'read-the-numerator-as-the-whole-number-value',
      'fraction-operations',
      'Read the number on top as the value of the whole fraction, so 3/3 was read as 3 rather than as one whole.',
    ),
    entry(
      'wrote-the-whole-number-over-the-denominator',
      'fraction-operations',
      'Wrote a whole number as that number over the parts in one whole - 3 as 3/2 - instead of counting how many of those parts make the whole number.',
    ),
    // Number-line errors. NC.3.NF.2 asks a child to read a fraction as a number
    // of unit-fraction LENGTHS from 0, and each of these counts the wrong thing
    // along the line.
    entry(
      'counted-tick-marks-not-intervals',
      'fraction-operations',
      'Counted the tick marks on a number line, including the one at 0, instead of the equal spaces between them, so the fraction came out one part too big.',
    ),
    entry(
      'started-the-count-at-the-first-tick-not-at-zero',
      'fraction-operations',
      'Began counting the equal parts on a number line at the first tick mark after 0 instead of at 0 itself, so the fraction came out one part too small.',
    ),
    entry(
      'counted-back-from-the-whole',
      'fraction-operations',
      'Counted the equal parts between the point and 1 instead of the parts from 0 up to the point, naming the part of the whole that is left over.',
    ),
    // Equivalence errors (NC.3.NF.3).
    entry(
      'changed-the-denominator-but-not-the-numerator',
      'fraction-operations',
      'Rewrote a fraction with a new denominator but left the numerator alone, so the new fraction names a smaller amount than the one it was supposed to match.',
    ),
    entry(
      'scaled-the-numerator-but-not-the-denominator',
      'fraction-operations',
      'Multiplied the numerator to build an equivalent fraction but left the denominator alone, so the new fraction names a larger amount than the one it came from.',
    ),
    // Comparison errors (NC.3.NF.4). larger-denominator-means-larger-fraction and
    // compared-numerators-only already exist and carry the two headline errors;
    // these are the ones the sourced Grade 3 text adds on top of them.
    entry(
      'compared-denominators-only',
      'fraction-operations',
      'Called two fractions equal because their denominators match, ignoring that the numerators count different numbers of those parts.',
    ),
    entry(
      'compared-in-the-wrong-direction',
      'fraction-operations',
      'Worked out correctly which of two fractions is bigger, then answered with the other one - or pointed the > or < symbol at the wrong fraction.',
    ),
    entry(
      'treated-different-cuts-as-different-wholes',
      'fraction-operations',
      'Decided two fractions could not be compared because the wholes were cut into different numbers of parts, even though the wholes themselves were the same size.',
    ),
    entry(
      'ignored-the-size-of-the-whole',
      'fraction-operations',
      'Compared two fractions of different-sized wholes as if the wholes were the same, treating 1/2 of a small pizza as equal to 1/2 of a large one.',
    ),

    // -- Grade 3 Measurement & Data: telling time (NC.3.MD.1) ------------
    // NC.3.MD.1 is time to the NEAREST MINUTE and intervals WITHIN THE SAME
    // HOUR. The existing 'time-intervals' tags were all written for NC.4.MD.8,
    // which is entirely about crossing the hour - counted-past-sixty-minutes,
    // used-the-minutes-past-the-hour-not-the-minutes-left and
    // regrouped-the-minutes-but-not-the-hours all describe an hour boundary
    // that a Grade 3 question never has. Filing a Grade 3 clock-reading error
    // under one of them would tell a parent their child cannot trade 60
    // minutes for an hour when their child has never been asked to.
    entry(
      'read-the-clock-time-as-the-interval',
      'time-intervals',
      'Reported the clock reading at the end of an activity as how long the activity lasted, so "it ended at 47 minutes past" became "it took 47 minutes".',
    ),
    entry(
      'read-the-clock-to-the-nearest-five-minutes',
      'time-intervals',
      'Read the clock only to the nearest five-minute mark instead of to the nearest minute, losing the few extra minutes past that mark.',
    ),
    entry(
      'read-the-minute-hand-as-the-number-it-points-to',
      'time-intervals',
      'Read the number the minute hand points at as the minutes themselves, so a minute hand at the 8 was read as 8 minutes rather than 40.',
    ),
    entry(
      'swapped-the-hour-and-minute-hands',
      'time-intervals',
      'Took the short hand for the minute hand and the long hand for the hour hand, so the two parts of the time changed places.',
    ),
    entry(
      'used-the-duration-as-the-end-time',
      'time-intervals',
      'Wrote how long something lasted as the minutes of the ending time, ignoring the minutes that had already gone by when it started.',
    ),
    entry(
      'compared-the-start-times-not-the-lengths',
      'time-intervals',
      'Compared two activities by how far apart they started rather than by how long each one lasted.',
    ),

    // -- Grade 3 Measurement & Data: customary measurement (NC.3.MD.2) ---
    // NOT 'added-without-converting', whose description fits this error but
    // whose FAMILY is 'unit-conversion'. The family label is the bold headline
    // a parent reads in WeakSpotsView, and converting between customary units
    // is exactly what ruling 14-1 establishes is NC.4.MD.1 - next year. Filing
    // a Grade 3 ruler-reading error there would tell a parent their
    // eight-year-old is weak at a skill NC does not teach yet. Same resolution
    // as Task 12 took with 'order-of-operations'.
    entry(
      'counted-each-ruler-mark-as-a-whole-unit',
      'geometry-and-measurement',
      'Counted each small mark on the ruler as a whole unit and added it to the whole inches, so three quarter-inch marks past the 4 were read as three more inches.',
    ),
    entry(
      'estimated-ten-times-too-large',
      'geometry-and-measurement',
      'Picked the right unit but a number about ten times bigger than the object really measures, so the estimate is not a sensible size.',
    ),

    // -- Grade 3 Measurement & Data: scaled graphs (NC.3.MD.3) -----------
    entry(
      'counted-the-symbols-instead-of-using-the-key',
      'geometry-and-measurement',
      'Counted the pictures in a picture graph as if each one stood for a single item, instead of multiplying by the amount the key gives each picture.',
    ),
    entry(
      'left-the-categories-open',
      'geometry-and-measurement',
      'Chose a survey question whose answers cannot be sorted into the few categories the graph has room for, so the data will not fit the bars.',
    ),

    // -- Grade 3 Measurement & Data: area by tiling (NC.3.MD.5) ----------
    // The standard's own first keyConcept is "tiling a rectangle WITHOUT GAPS
    // OR OVERLAPS", so each of the three ways a covering can fail that rule is
    // its own error rather than one lumped "bad tiling" tag.
    entry(
      'left-gaps-between-the-tiles',
      'geometry-and-measurement',
      'Covered the shape with tiles that had spaces left between them, so counting the tiles misses the parts the gaps cover.',
    ),
    entry(
      'overlapped-the-tiles',
      'geometry-and-measurement',
      'Covered the shape with tiles that sat on top of one another, so some of the space was counted more than once.',
    ),
    entry(
      'used-tiles-of-different-sizes',
      'geometry-and-measurement',
      'Covered the shape with tiles that were not all the same size, so counting them does not measure anything - area counts how many of ONE size of square fit.',
    ),
    entry(
      'compared-the-side-lengths-not-the-tile-counts',
      'geometry-and-measurement',
      'Compared two shapes by how far their longest sides reach instead of by how many unit squares cover each one.',
    ),
    entry(
      'counted-the-figure-as-a-full-rectangle',
      'geometry-and-measurement',
      'Counted the squares of the whole rectangle the figure sits inside, including the corner squares the figure does not actually cover.',
    ),
    entry(
      'counted-the-rows-not-the-squares',
      'geometry-and-measurement',
      'Reported how many rows of tiles there are instead of how many tiles there are altogether.',
    ),

    // -- Grade 3 Measurement & Data: perimeter (NC.3.MD.8) ---------------
    entry(
      'left-out-a-side-length',
      'geometry-and-measurement',
      'Went around the figure adding side lengths but missed one side out of the total.',
    ),
    entry(
      'subtracted-one-side-from-the-whole-perimeter',
      'geometry-and-measurement',
      'Took one known side away from the whole perimeter and called what was left a single side, as if only one side of the figure remained.',
    ),

    // -- Grade 3 Geometry (NC.3.G.1) ------------------------------------
    // NC.3.G.1 is composing and decomposing triangles and quadrilaterals, and
    // examples and non-examples of the named quadrilaterals. The errors it
    // actually produces are about JUDGING BY APPEARANCE rather than by
    // properties, and about what happens to a name when shapes are joined or
    // cut. Partitioning a shape into equal parts and calling each part a
    // quarter is CCSS 3.G.A.2, which NC does not have at this grade in any
    // domain, so no tag here names it.
    entry(
      'classified-the-shape-by-how-it-looks',
      'shape-classification',
      'Decided what a shape is by whether it looks like the usual picture of one, instead of checking the properties its name requires.',
    ),
    entry(
      'judged-the-shape-by-its-orientation',
      'shape-classification',
      'Refused a shape its name because it was tilted or standing on a corner, as though turning a shape could change what it is.',
    ),
    entry(
      'expected-the-new-shape-to-keep-the-old-name',
      'shape-classification',
      'Expected a shape built from two smaller shapes, or cut out of a bigger one, to have the same name as the shapes it came from.',
    ),
    entry(
      'added-the-sides-of-both-shapes',
      'shape-classification',
      'Added up the sides of both shapes being joined, without noticing that the two sides pressed together stop being sides of the new shape.',
    ),
    entry(
      'cut-the-shape-along-the-wrong-line',
      'shape-classification',
      'Pictured the cut running corner to corner when the problem describes a cut straight across between two sides, or the other way round.',
    ),

    // -- Grade 2 Operations & Algebraic Thinking (NC.2.OA.1-4) -----------
    // Grade 2's errors are about the counting PROCESS, not an algorithm going
    // wrong - the existing operation-choice and incomplete-procedure tags were
    // built for multi-digit and multiplicative work and have nothing for a
    // seven-year-old counting on by ones and losing the count by one.
    entry(
      'counted-on-by-ones-and-stopped-one-short',
      'incomplete-procedure',
      'Counted on or back by ones to solve a fact within 20 and stopped one count short of the correct total.',
    ),
    entry(
      'counted-on-by-ones-one-too-many',
      'incomplete-procedure',
      'Counted on or back by ones to solve a fact within 20 and took one extra count past the correct total.',
    ),
    entry(
      'restated-a-known-number-instead-of-solving',
      'incomplete-procedure',
      'Answered a missing-number equation with one of the numbers the problem already gave, instead of solving for the unknown.',
    ),
    entry(
      'miscounted-while-pairing-the-objects',
      'incomplete-procedure',
      'Lost track while pairing up a group of objects to check for odd or even, and reported the opposite of what the group actually pairs into.',
    ),
    entry(
      'judged-the-total-by-the-count-of-pairs',
      'incomplete-procedure',
      "Decided odd or even from whether the number of PAIRS is odd or even, instead of from whether any object is left without a partner.",
    ),
    entry(
      'added-rows-and-columns-instead-of-repeated-addition',
      'operation-choice',
      'Added the number of rows to the number of columns instead of writing the array as one row size repeated once for every row.',
    ),

    // -- Grade 2 Geometry (NC.2.G.1, NC.2.G.3) ----------------------------
    // G.1 spans flat shapes named by side count AND the faces/edges/corners of
    // rectangular prisms and cubes; G.3 is partitioning into equal shares. Both
    // are new topics for this vocabulary - Grade 5 never counts a solid's faces
    // or names a fraction of a whole from a picture instead of a number.
    entry(
      'confused-the-shape-name-with-its-side-count',
      'shape-classification',
      'Matched a shape to the wrong name for its number of sides, such as calling a five-sided shape a hexagon or a six-sided shape a pentagon.',
    ),
    entry(
      'counted-only-the-visible-faces',
      'shape-classification',
      'Counted only the faces of a solid that are visible in a picture of it, instead of counting the faces hidden from view as well.',
    ),
    entry(
      'counted-the-corners-instead-of-the-faces',
      'shape-classification',
      "Counted a solid's corners (vertices) and reported that count as its number of faces.",
    ),
    entry(
      'counted-the-edges-instead-of-the-faces',
      'shape-classification',
      "Counted a solid's edges and reported that count as its number of faces.",
    ),
    entry(
      'called-unequal-parts-equal-shares',
      'geometry-and-measurement',
      'Split a shape into parts of different sizes but named them halves, thirds, or fourths anyway, because the shape was cut into the right number of pieces.',
    ),
    entry(
      'miscounted-the-number-of-equal-shares',
      'geometry-and-measurement',
      'Miscounted how many equal parts a shape was split into, and so used the wrong share word (halves, thirds, or fourths) for it.',
    ),
    entry(
      'expected-equal-shares-to-look-alike',
      'geometry-and-measurement',
      'Assumed that two equal shares of the same whole must be the same shape, and rejected a correct, equally-sized split because its pieces look different.',
    ),

    // -- Grade 2 Number & Operations in Base Ten (NC.2.NBT.1-8) -----------
    // Grade 2 is the year place value begins, and almost none of the existing
    // place-value vocabulary fits it. Those tags were written for DECIMALS
    // (compared-by-digit-count, same-digits-read-as-equal, word-form-place-
    // value-shifted all name the decimal part of a number) or for Grade 3
    // estimation and multiples of ten. A seven-year-old who loses a hundred
    // inside a trade, restarts a count at the top of a hundred, or reads
    // "four hundred seven" as forty-seven has made none of those mistakes, and
    // the family label is the bold headline a parent reads.
    //
    // A handful of existing tags DO fit exactly and are reused rather than
    // duplicated: skipped-the-zero-place, wrote-the-digit-not-its-value,
    // wrong-power-of-ten, compared-the-wrong-place-first,
    // stopped-comparing-too-soon, added-without-carrying,
    // carried-into-the-wrong-column, subtracted-without-regrouping,
    // borrowed-without-reducing-the-next-column and forgot-the-final-step.

    // NC.2.NBT.1 — hundreds, tens and ones; unitizing and various groupings.
    entry(
      'counted-the-tens-as-ones',
      'place-value-and-decimals',
      'Reported how many groups of ten there are when the question asked how many single ones they make altogether, so the tens were never unitized back into ones.',
    ),
    entry(
      'added-the-two-tens-instead-of-unitizing',
      'place-value-and-decimals',
      'Added the two tens printed in the problem — 10 bundles and 10 in each — instead of taking ten groups OF ten, so ten tens came out as 20 rather than 100.',
    ),
    entry(
      'copied-the-digit-into-every-place',
      'place-value-and-decimals',
      'Read a number whose other places hold zeros as if its one non-zero digit filled every place, so 400 was read as 4 hundreds, 4 tens, and 4 ones.',
    ),
    entry(
      // The two halves of a hundreds/tens trade, told apart on purpose. A
      // parent needs to know whether their child dropped a hundred or counted
      // one twice; both are "regrouping", and they need opposite repairs.
      'lost-the-hundred-in-the-trade',
      'place-value-and-decimals',
      'Traded between hundreds and tens when regrouping a number, but counted only one side of the trade, so a whole hundred went missing from the number.',
    ),
    entry(
      'kept-the-hundred-and-the-ten-tens-both',
      'place-value-and-decimals',
      'Traded one hundred for ten tens but kept the hundred as well, counting the same hundred twice and making the number 100 too large.',
    ),
    entry(
      'traded-a-hundred-for-one-ten',
      'place-value-and-decimals',
      'Traded one hundred for a single ten instead of for ten tens, so the number lost 90 in a trade that should have changed nothing.',
    ),
    entry(
      'wrote-the-digits-side-by-side-instead-of-adding-the-values',
      'place-value-and-decimals',
      'Wrote the counts of hundreds, tens and ones next to each other as digits instead of adding what each group is worth, so 4 hundreds and 12 tens was written 412 rather than 520.',
    ),

    // NC.2.NBT.2 — counting and skip-counting within 1,000. The three
    // sequence-shaped errors below are filed under patterns-and-sequences,
    // whose own note describes it as "how many times the rule is applied,
    // where the count starts, and whether the rule is additive" — which is
    // exactly what goes wrong in a skip count. The two that are really about
    // a hundred rolling over stay in place value.
    entry(
      'restarted-the-count-at-the-start-of-the-hundred',
      'place-value-and-decimals',
      'Reached the end of a hundred while counting and went back to the start of that same hundred instead of moving on into the next one, so 599 was followed by 500.',
    ),
    entry(
      'wrote-the-next-hundred-beside-the-old-one',
      'place-value-and-decimals',
      'Counted past the end of a hundred by writing another hundred next to the one already there — 599 followed by 5,100 — instead of trading up to 600.',
    ),
    entry(
      'counted-by-ones-instead-of-the-given-step',
      'patterns-and-sequences',
      'Counted on by ones when the question asked for a skip count, so the numbers went up by 1 each time instead of by the step named.',
    ),
    entry(
      'skip-counted-by-the-wrong-step',
      'patterns-and-sequences',
      'Skip-counted by a different amount from the one asked for, such as stepping by 10s when the question said 5s.',
    ),
    entry(
      'listed-the-starting-number-as-the-first-count',
      'patterns-and-sequences',
      'Wrote the number the count starts FROM as the first number counted, so every number in the list came out one step early.',
    ),
    entry(
      'changed-the-hundreds-digit-and-dropped-the-rest',
      'place-value-and-decimals',
      'Counted by hundreds by reciting 100, 200, 300 instead of adding 100 to the number given, so the tens and ones were thrown away — 380 counted on as 400, 500, 600 rather than 480, 580, 680.',
    ),
    entry(
      'jumped-to-the-next-ten-instead-of-adding-ten',
      'place-value-and-decimals',
      'Jumped to the next number ending in 0 instead of adding 10 to the number given, so the first step was short and the whole count sat on the wrong numbers.',
    ),

    // NC.2.NBT.3 — reading and writing within 1,000 in numerals, number names
    // and expanded form.
    entry(
      // Broad on direction on purpose: the same substitution happens writing a
      // numeral from its name (470 for four hundred seven) and reading a
      // numeral out (521 for 512). Naming one direction would describe the
      // opposite of what half the children who make it actually did.
      'put-a-digit-in-the-wrong-place',
      'place-value-and-decimals',
      'Wrote a digit in the wrong place-value column when moving between a number and its name or its expanded form, so the digits are all right and the number is not.',
    ),
    entry(
      'left-off-part-of-the-number-name',
      'place-value-and-decimals',
      'Left part of a number out when moving between its digits and its name — writing 400 for four hundred seven, or reading 512 as five hundred two.',
    ),
    entry(
      'read-the-digits-one-at-a-time',
      'place-value-and-decimals',
      'Read the digits of a number out separately, the way a phone number is read, so 512 became "five hundred one two" instead of five hundred twelve.',
    ),

    // NC.2.NBT.4 — comparing three-digit numbers by the VALUE of each place.
    entry(
      // Not same-digits-read-as-equal, which is that tag's decimal sibling and
      // whose description names decimals outright. A Grade 2 child comparing
      // 638 with 683 has never met a decimal.
      'same-digits-read-as-the-same-number',
      'place-value-and-decimals',
      'Called two whole numbers equal because they are written with the same digits, without checking what each digit is worth in the place it sits.',
    ),
    entry(
      // Not compared-by-digit-count, which is likewise about a decimal part.
      'compared-by-digit-count-not-place-value',
      'place-value-and-decimals',
      'Settled a comparison by counting how many digits each number has instead of comparing the hundreds, then the tens, then the ones.',
    ),
    entry(
      'answered-with-the-least-instead-of-the-greatest',
      'place-value-and-decimals',
      'Ordered the numbers correctly but answered with the smallest one where the greatest was asked for, or the other way round.',
    ),
    entry(
      // compared-the-wrong-place-first already names starting from the ONES.
      // This is the same instinct one column over, and it is the commoner of
      // the two once three-digit numbers arrive.
      'compared-the-tens-before-the-hundreds',
      'place-value-and-decimals',
      'Compared the tens digits and stopped there, without first comparing the hundreds, which decide a three-digit comparison before the tens get a turn.',
    ),

    // NC.2.NBT.5 and NC.2.NBT.7 — the strategy standards. These name what goes
    // wrong in CHOOSING or ADJUSTING a strategy, which is what those standards
    // actually ask for, rather than a slip inside an algorithm.
    entry(
      'counted-on-by-ones-instead-of-using-place-value',
      'place-value-and-decimals',
      'Reached for counting on or back by ones when a place-value strategy was available, which is slow and loses the count on numbers this size.',
    ),
    entry(
      'compensated-in-the-wrong-direction',
      'multi-digit-algorithm',
      'Rounded a number to a friendly ten or hundred and then adjusted the wrong way — adding the extra on instead of taking it back off, or taking it off twice — so the answer moved further from the true one.',
    ),
    entry(
      'did-not-balance-the-move-between-the-addends',
      'multi-digit-algorithm',
      'Made one addend friendlier without taking the same amount off the other one, so the total changed instead of staying put.',
    ),

    // NC.2.NBT.6 — up to three two-digit numbers.
    entry(
      'left-one-of-the-addends-out',
      'incomplete-procedure',
      'Added only some of the numbers in the problem and left at least one addend out of the total entirely.',
    ),

    // NC.2.NBT.8 — mentally adding or subtracting 10 or 100, which the sourced
    // text requires be done WITHOUT counting on.
    entry(
      'counted-by-ones-and-lost-the-count',
      'incomplete-procedure',
      'Counted on or back by ones instead of taking the whole ten or hundred at once, and lost the count along the way, landing a step short of the right number.',
    ),
  ].map((info) => [info.tag, info]),
);

export function familyOf(tag: string): MisconceptionFamily | undefined {
  return MISCONCEPTIONS[tag]?.family;
}

/** Human-readable label for a misconception family, e.g.
 *  'fraction-operations' -> 'Fraction Operations'. Shared by every screen
 *  that renders `topMisconceptionFamilies` output to a parent. */
export function familyLabel(family: MisconceptionFamily): string {
  return family
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}
