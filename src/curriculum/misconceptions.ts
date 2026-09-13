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
  | 'patterns-and-sequences';

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
      'axes-swapped',
      'coordinate-plane',
      'Swapped the x- and y-axes, treating the first coordinate as the vertical move and the second as horizontal.',
    ),
    entry(
      'borrowed-without-reducing-the-whole',
      'fraction-operations',
      'Regrouped one whole into the fraction part but forgot to reduce the whole-number part by one.',
    ),
    entry(
      'classified-by-one-property-only',
      'shape-classification',
      "Classified the shape using only one of its properties instead of checking every property needed for the most specific name.",
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
      'dropped-a-fraction-part',
      'fraction-operations',
      'Left out one of the fractional parts while combining the whole-number parts of a mixed-number problem.',
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
      'Evaluated the expression without respecting parentheses or brackets, as if the grouping symbols were not there.',
    ),
    entry(
      'ignored-remainder',
      'remainder-handling',
      'Dropped the remainder from a division instead of accounting for the leftover amount.',
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
      'order-of-operations-left-to-right',
      'order-of-operations',
      'Evaluated the expression strictly left to right, ignoring the standard precedence of multiplication and division over addition and subtraction.',
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
      'reported-remainder-without-interpreting',
      'remainder-handling',
      'Reported the raw quotient and remainder without interpreting what they mean for the situation in the problem.',
    ),
    entry(
      'reported-the-estimate',
      'remainder-handling',
      'Rounded the numbers and reported an estimate instead of computing the exact answer the problem required.',
    ),
    entry(
      'reported-the-measurement-not-the-total',
      'geometry-and-measurement',
      'Reported a single measurement from the data instead of the total or subtotal the question actually asked for.',
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
      'squared-the-base-area',
      'geometry-and-measurement',
      'Multiplied the base area by itself instead of by the height when finding volume.',
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
      'subtracted-instead-of-divided',
      'operation-choice',
      'Subtracted the two quantities instead of dividing one by the other.',
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
      'Swapped which decimal place two digits belong in, such as writing tenths where thousandths belong.',
    ),
    entry(
      'unit-conversion-inverted',
      'unit-conversion',
      'Applied a unit conversion in the wrong direction, dividing by the conversion factor when multiplying was needed (or vice versa).',
    ),
    entry(
      'used-area-not-volume',
      'geometry-and-measurement',
      'Computed the area of one face of the solid instead of its volume.',
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
      'used-the-denominator-as-the-new-numerator',
      'fraction-operations',
      "When rescaling a fraction to a new denominator, mistakenly used the denominator's value as the new numerator.",
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
