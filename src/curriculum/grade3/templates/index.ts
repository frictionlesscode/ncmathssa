import type { QuestionTemplate } from '../../../engine/template';
import { oa1EqualGroupsArray } from './oa1-equal-groups-array';
import { oa2EqualShares } from './oa2-equal-shares';
import { oa3OneStepWordProblem } from './oa3-one-step-word-problem';
import { oa6MissingFactor } from './oa6-missing-factor';
import { oa7MultiplicationFact } from './oa7-multiplication-fact';
import { nbt2AddWithin1000 } from './nbt2-add-within-1000';
import { nbt2SubtractWithin1000 } from './nbt2-subtract-within-1000';
import { nbt3MultiplyByMultipleOfTen } from './nbt3-multiply-by-multiple-of-ten';
import { nf1UnitFractionModel } from './nf1-unit-fraction-model';
import { nf2FractionOnANumberLine } from './nf2-fraction-on-a-number-line';
import { nf3EquivalentFraction } from './nf3-equivalent-fraction';
import { nf4CompareLikeParts } from './nf4-compare-like-parts';

/** Every parameterized Grade 3 template. Generated items cover the standards
 *  whose practice value is in fresh numbers; reasoning standards and
 *  multi-step word problems stay hand-authored, because there the wording
 *  carries the mathematics.
 *
 *  Operations & Algebraic Thinking is the largest band at Grade 3 (32-36%) and
 *  five of its seven standards have a generator here. Each one has a DISTINCT
 *  QUESTION SHAPE, and that is load-bearing rather than decorative. A review
 *  key is seedless, so if two generators could emit the same question, one
 *  question would sit under two review keys and a child who answered it once
 *  would be credited with both standards. Grade 3 OA is the worst case for
 *  that in this curriculum: factors 1-10 is only 100 products in total, so
 *  every generator here is drawing from very nearly the same numbers. What
 *  keeps them apart is the shape of the question, not the arithmetic:
 *
 *    NC.3.OA.1  an ARRAY drawn in promptDetails, product unknown
 *    NC.3.OA.2  EQUAL GROUPS drawn in promptDetails, share unknown
 *    NC.3.OA.3  a one-step WORD PROBLEM, no figure and no equation printed
 *    NC.3.OA.6  a bare EQUATION WITH A BOX, `a × ☐ = p`
 *    NC.3.OA.7  a BARE FACT, `a × b`
 *
 *  Only OA.7 is bare-fact recall, because fluency is the only one of the five
 *  that is genuinely about recall with nothing attached. ./index.test.ts
 *  asserts the five prompt sets are pairwise disjoint over a seed sweep rather
 *  than leaving that to inspection.
 *
 *  Two OA standards have NO generator, and deliberately:
 *
 *  NC.3.OA.8 ("Solve two-step word problems using addition, subtraction, and
 *  multiplication") is a multi-step word problem, which the plan's Content
 *  Contract reserves for authoring throughout — Grade 4 decided the analogous
 *  NC.4.OA.3 the same way. Swapping the numbers in a two-step problem does not
 *  change what it teaches; the wording is the difficulty. Note also that NC's
 *  OA.8 is +, - and × only. CCSS 3.OA.8 says "the four operations", and that
 *  is the version a generator written from memory would produce.
 *
 *  NC.3.OA.9 ("Interpret patterns of multiplication on a hundreds board and/or
 *  multiplication table") is a reasoning standard whose own third keyConcept is
 *  "interpreting, not just spotting, the pattern found". A generator can vary
 *  which pattern is shown but not what makes explaining it hard, so the whole
 *  standard lives in ../authored.oa.ts, including the hundreds-board half that
 *  a times-table-only bank would quietly drop.
 *
 *  ---------------------------------------------------------------------------
 *  BASE TEN (Task 13). Both standards have a generator, and NC.3.NBT.2 has two.
 *
 *    NC.3.NBT.2  ADD., three digits, exactly one carry out of the ones
 *    NC.3.NBT.2  SUBTRACT., always across a 0 in the tens
 *    NC.3.NBT.3  a PICTORIAL MODEL of a tens, with the product asked for
 *
 *  Addition and subtraction are two templates rather than one for the reason
 *  that governs this whole file: a review key is seedless, so one template
 *  spanning both operations would let a child who cannot subtract across a
 *  zero be re-served an addition question and retired as having mastered the
 *  standard. They are also the two halves that go wrong differently — a carry
 *  lands in the wrong column, a trade gets lost past a 0 — and one template
 *  cannot diagnose both.
 *
 *  But NC.3.NBT.2 IS NOT "DO THE ALGORITHM", and the generators are therefore
 *  the smaller half of it. Its three keyConcepts are estimation for
 *  reasonableness, the addition/subtraction inverse relationship, and
 *  expanded-form decomposition; all three are authored, because in each of them
 *  the wording is the mathematics and swapping the numbers changes nothing.
 *
 *  NC.3.NBT.3's multiple of 10 is "in the range 10–90", so the generator draws
 *  its second factor from 10, 20, ..., 90 and its largest product is 9 × 90 =
 *  810. Nothing in this directory rounds anything: CCSS 3.NBT.A.1 is rounding
 *  and NC has it at no grade in this plan.
 *
 *  ---------------------------------------------------------------------------
 *  FRACTIONS (Task 13). All four standards have a generator, because this is a
 *  child's first year of fractions and fresh numbers are exactly what the
 *  practice needs — but each one is narrowed hard by its sourced text.
 *
 *    NC.3.NF.1  MODEL MATCHING: given 1/d, which picture is it?
 *    NC.3.NF.2  a NUMBER LINE with a point on it, fraction asked for
 *    NC.3.NF.3  a SHADED BAR, the same amount in a related denominator
 *    NC.3.NF.4  four COMPARISON STATEMENTS, one of them true
 *
 *  Two constraints bind all four, and both are places where the Grade 4
 *  version of the mathematics is one careless line away.
 *
 *  DENOMINATORS ARE {2, 3, 4, 6, 8}, narrowed to the related families {2,4,8}
 *  and {3,6} for NF.3 and NF.4. Fifths, tenths, twelfths and hundredths are
 *  NC.4.NF. Each sibling test sweeps its generator's whole draw space and
 *  asserts that every denominator printed — in the key, in the distractors and
 *  in the worked solution — is one of the five.
 *
 *  NC.3.NF.4 COMPARES ONLY FRACTIONS SHARING A NUMERATOR OR A DENOMINATOR.
 *  Comparing 2/3 to 3/4 is NC.4.NF.2, which already has a landed Grade 4
 *  generator. A general comparator is the single likeliest defect here, so
 *  g3.nf4.compare-like-parts never holds two fractions from different families
 *  in one statement, and its test checks every statement it can emit.
 *
 *  NC.3.NF.1's generator is also the one place a generator can honestly tag
 *  reading 1/4 as "one and four": that error has no numeric value, so on a
 *  "what is 1/4 of 8?" item the tag could only be filed against a number some
 *  other mistake produced. Model matching is a shape where a child can pick it.
 *
 *  NC.3.NF.3 has three keyConcepts and the generator covers ONE of them
 *  (equivalence). "A fraction with the same numerator and denominator equals
 *  one whole" and "expressing whole numbers as fractions" are authored, so the
 *  standard is not marked covered by three equivalence items.
 *
 *  ---------------------------------------------------------------------------
 *  Task 14 appends MD and Geometry generators to this array. */
export const GRADE_3_TEMPLATES: QuestionTemplate[] = [
  oa1EqualGroupsArray,
  oa2EqualShares,
  oa3OneStepWordProblem,
  oa6MissingFactor,
  oa7MultiplicationFact,
  nbt2AddWithin1000,
  nbt2SubtractWithin1000,
  nbt3MultiplyByMultipleOfTen,
  nf1UnitFractionModel,
  nf2FractionOnANumberLine,
  nf3EquivalentFraction,
  nf4CompareLikeParts,
];

export {
  oa1EqualGroupsArray,
  oa2EqualShares,
  oa3OneStepWordProblem,
  oa6MissingFactor,
  oa7MultiplicationFact,
  nbt2AddWithin1000,
  nbt2SubtractWithin1000,
  nbt3MultiplyByMultipleOfTen,
  nf1UnitFractionModel,
  nf2FractionOnANumberLine,
  nf3EquivalentFraction,
  nf4CompareLikeParts,
};
