import type { Question } from '../../engine/questionModel';
import { labelOptions } from '../../engine/questionModel';

/**
 * The authored Grade 4 Measurement & Data bank.
 *
 * WEIGHTING. NCDPI publishes ONE band of 23-27% covering Measurement & Data
 * and Geometry TOGETHER (see `weightGroup: 'MD+G'` in ./standards.ts). That
 * figure is not MD's own share and nothing in this file claims it is; MD's
 * individual weight is not published at all.
 *
 * SCOPE IS THE SOURCED TEXT IN ./standards.ts, AND NOTHING ELSE. Grade 4 MD is
 * a domain where recall of the Common Core wording is actively misleading,
 * because NC rewrote it. Four places where this file deliberately does NOT do
 * what a memory of 4.MD would do:
 *
 *   NC.4.MD.1 and NC.4.MD.2 are METRIC ONLY. The sourced keyConcepts name six
 *   units and only six: centimeter, meter, gram, kilogram, liter, milliliter.
 *   There is no customary conversion at this grade and none appears below -
 *   no inches, feet, yards, ounces, pounds, cups, quarts or gallons. Note that
 *   the list also excludes the KILOMETER, so no item measures a distance in
 *   kilometers either.
 *
 *   NC.4.MD.2 converts in ONE DIRECTION: "convert metric measurements from a
 *   larger unit to a smaller unit". At this grade the conversion is therefore
 *   always MULTIPLICATIVE, and the characteristic error is DIVIDING where
 *   multiplying was needed - not the reverse. Every NC.4.MD.2 item below
 *   converts larger to smaller, and the `unit-conversion-inverted` distractors
 *   in g4-md2-01 (0.3 centimeters) and g4-md2-02 (0.006 grams) are the
 *   divide-instead-of-multiply value.
 *
 *   NC.4.MD.4 is WHOLE NUMBERS ONLY: "Represent and interpret data using whole
 *   numbers." Common Core's 4.MD.B.4 puts fractional measurements on a line
 *   plot at this grade. NC does not, so there is no line plot in halves,
 *   quarters or eighths of an inch anywhere below; g4-md4-03's line plot is
 *   marked in whole minutes.
 *
 *   NC.4.MD.8 is TIME INTERVALS THAT CROSS THE HOUR, and NC.4.MD.3 is AREA AND
 *   PERIMETER. That is the numbering in ./standards.ts and it is what this
 *   file follows. (Common Core numbers area and perimeter as 4.MD.A.3, which
 *   is how the two get transposed.)
 *
 * FIGURES ARE TEXT. This app has no image assets and will not get any. Every
 * item that describes a figure, a table, a bar graph, a line plot or an angle
 * diagram puts the whole of it in `promptDetails`, written so a screen reader
 * can read it aloud and a child can answer from the words alone. Nothing below
 * needs a picture to be answerable, and any question that would has been
 * replaced rather than illustrated.
 *
 * THE TRAP THIS DOMAIN SETS is a SECOND RIGHT ANSWER hiding behind a unit.
 * 1.5 kg and 1500 g are one quantity wearing two labels, and an item offering
 * both marks a child wrong for being right. The shared kit's numericValue()
 * cannot see this: it strips the unit words and compares bare numbers, so it
 * reads "1.5 kg" as 1.5 and "1500 g" as 1500 and finds them different. The
 * same blindness runs the other way - it reads "6 m" and "6 cm" as equal and
 * would fail an item that offered both, though they are different lengths.
 *
 * Two rules keep this file clear of both halves of that trap, and
 * `authored.md.test.ts` checks them rather than trusting this paragraph:
 *   1. Where an item's options are quantities at all, all four carry the SAME
 *      unit, so no two options can name one quantity under two labels and no
 *      two distinct quantities can collide as bare numbers.
 *   2. The test re-parses every option into a canonical quantity - metric
 *      lengths to centimetres, masses to grams, capacities to millilitres,
 *      durations and clock times to minutes, rectangles to a sorted pair of
 *      dimensions - and requires the four to be pairwise distinct AS
 *      QUANTITIES, which is a strictly stronger check than the kit's.
 *
 * Options the test cannot canonicalise are prose, and an item is required to
 * be all-canonical or all-prose so that no item is half-guarded. The three
 * all-prose items are g4-md1-02 (four unit NAMES, no quantities) and
 * g4-md1-03 and g4-md4-04 (four sentences each), and they are checked by
 * hand: in each, the four options are plainly different statements, not one
 * statement twice.
 *
 * One deliberate exception is recorded in the test: g4-md8-01 offers
 * "4:95 p.m." beside the key "5:35 p.m.". As instants those are the same
 * moment, but 4:95 is not a time any clock shows - it is exactly the artifact
 * of never trading 60 minutes for an hour, which is the whole of NC.4.MD.8 -
 * so it is keyed by its literal text and not normalised. The explanation for
 * that item says in so many words why it is not a real time.
 *
 * EVERY DISTRACTOR'S `//` COMMENT RECOMPUTES TO THAT EXACT OPTION. A comment
 * naming an error that cannot produce the number beside it tells a child they
 * made a mistake they did not make, which is worse than saying nothing. Three
 * places below where the arithmetic is easy to get wrong while writing it:
 *   - g4-md6-01: subtracting 130 - 45 column by column WITHOUT regrouping
 *     gives 115 (ones |0-5| = 5, tens |3-4| = 1, hundreds 1), not 95.
 *   - g4-md6-01: assuming a straight angle replaces the GIVEN whole angle with
 *     180, so the distractor is 180 - 45 = 135, not 180 - 130 = 50.
 *   - g4-md4-02: counting the zero line itself as the first gridline puts the
 *     "7th gridline" six intervals up, 6 x 5 = 30.
 *
 * Twenty-seven tags used here and in ./templates are new, declared in
 * ../misconceptions.ts. Measurement at Grade 5 gave the vocabulary good names
 * for volume and for multi-step conversion; it had no name at all for the
 * errors that define Grade 4 MD - never trading 60 minutes for an hour,
 * reading a scaled graph by counting its gridlines, reading the protractor's
 * other scale, or choosing a unit that measures the wrong attribute. Stretching
 * a volume tag over an angle error would tell a parent their child has a
 * problem they do not have.
 *
 * Four of these six standards have a generator (see ./templates): NC.4.MD.1,
 * NC.4.MD.2, NC.4.MD.3 and NC.4.MD.6. NC.4.MD.4 and NC.4.MD.8 are authored
 * only, because what they teach lives in the wording - which survey question
 * yields numerical data, and what "crosses the hour" means in a real
 * afternoon - not in the numbers. The scheduler keys authored items as
 * {authored, id} and generated ones as {generated, templateId}, so a question
 * reachable both ways is served to one child twice under two identities; the
 * test checks every item below against 2,000 seeds of every Grade 4 template
 * rather than trusting prompt shape.
 *
 * The correct option is deliberately placed at a varied position; it is not
 * always A.
 */
export const GRADE_4_MD_AUTHORED: Question[] = [
  // ==========================================
  // Standard: NC.4.MD.1 — Metric Measurement & Relative Unit Sizes
  // Sourced: know relative sizes of metric units (centimeter, meter, gram,
  // kilogram, liter, milliliter), and add, subtract, multiply and divide to
  // solve ONE-STEP word problems with WHOLE-NUMBER metric measurements.
  // ==========================================
  {
    id: 'g4-md1-01',
    standardCode: 'NC.4.MD.1',
    domainId: 'MD',
    prompt:
      'A 2,000-milliliter jug of lemonade is poured equally into 8 cups. How many milliliters of lemonade are in each cup?',
    options: labelOptions([
      // Multiplied the two numbers instead of dividing: 2,000 × 8 = 16,000.
      {
        text: '16,000 milliliters',
        isCorrect: false,
        misconception: 'multiplied-instead-of-divided',
      },
      // Subtracted instead of dividing: 2,000 − 8 = 1,992.
      {
        text: '1,992 milliliters',
        isCorrect: false,
        misconception: 'subtracted-instead-of-divided',
      },
      { text: '250 milliliters', isCorrect: true },
      // Divided 2,000 by 8 but stopped after the 25 and never recorded the
      // final zero of the quotient: 250 written as 25.
      {
        text: '25 milliliters',
        isCorrect: false,
        misconception: 'dropped-zero-in-quotient',
      },
    ]),
    calculatorAllowed: false,
    isStretch: false,
    difficulty: 'mastery',
    explanation: {
      stepByStep: [
        'Step 1: One jug is being shared equally among 8 cups, so this is a division problem: 2,000 ÷ 8.',
        'Step 2: 2,000 ÷ 8 is easier as 20 hundreds ÷ 8 = 2 hundreds with 4 hundreds left over, and 400 ÷ 8 = 50.',
        'Step 3: 200 + 50 = 250, and checking, 250 × 8 = 2,000.',
        'Step 4: Each cup holds 250 milliliters.',
      ],
      conceptSummary:
        'Sharing one measured amount equally among a number of containers is division. Multiplying the check back — each cup × the number of cups — should return the amount you started with.',
      commonMisconception:
        'An answer of 25 milliliters is worth catching without any arithmetic: 8 cups of 25 milliliters is only 200 milliliters, nowhere near a 2,000-milliliter jug.',
    },
  },
  {
    id: 'g4-md1-02',
    standardCode: 'NC.4.MD.1',
    domainId: 'MD',
    prompt:
      'Ms. Carver wants to record the mass of a single paper clip. Which metric unit should she use?',
    // All four options are unit NAMES, not quantities, so the test's canonical
    // parser returns null for every one and the item is checked by hand: four
    // different units, no two of which name the same thing.
    options: labelOptions([
      { text: 'Grams', isCorrect: true },
      // Kilograms measure mass, which is the right attribute, but a paper clip
      // is about one gram — a thousandth of a kilogram.
      {
        text: 'Kilograms',
        isCorrect: false,
        misconception: 'chose-a-unit-of-the-wrong-size',
      },
      // Liters measure capacity, not mass.
      {
        text: 'Liters',
        isCorrect: false,
        misconception: 'chose-a-unit-for-the-wrong-attribute',
      },
      // Meters measure length, not mass.
      {
        text: 'Meters',
        isCorrect: false,
        misconception: 'chose-a-unit-for-the-wrong-attribute',
      },
    ]),
    calculatorAllowed: false,
    isStretch: false,
    difficulty: 'mastery',
    explanation: {
      stepByStep: [
        'Step 1: The question asks for MASS — how much matter the paper clip has — so the unit has to be a mass unit. That rules out meters (length) and liters (capacity).',
        'Step 2: The two metric mass units at this grade are grams and kilograms, and 1 kilogram = 1,000 grams.',
        'Step 3: A paper clip is tiny. Measuring it in kilograms would give a number far less than 1, while in grams it is about 1.',
        'Step 4: Grams is the sensible unit for the mass of a paper clip.',
      ],
      conceptSummary:
        'Choosing a unit takes two decisions, not one: first which attribute is being measured — length, mass or capacity — and then which size of unit gives a number that is easy to say.',
      commonMisconception:
        'Liters and kilograms both sound like "big" units, but they are not interchangeable: liters measure how much space something fills and kilograms measure how much matter it has.',
    },
  },
  {
    id: 'g4-md1-03',
    standardCode: 'NC.4.MD.1',
    domainId: 'MD',
    prompt:
      'A recipe needs 250 milliliters of milk for one batch. Priya wants to know how much milk 5 batches need. She writes 250 × 5 = 1,250 and says the answer is 1,250 liters. Which statement about her work is correct?',
    // All four options are sentences, so the canonical parser returns null for
    // every one. Checked by hand: the four make four different claims.
    options: labelOptions([
      // Her arithmetic is right, but she attached a unit that was never in the
      // problem: the measurements were given in millilitres.
      {
        text: 'Her multiplication is right, and 1,250 liters is correct.',
        isCorrect: false,
        misconception: 'mislabeled-the-unit',
      },
      {
        text: 'Her multiplication is right, but the answer is 1,250 milliliters, not liters.',
        isCorrect: true,
      },
      // Added the two numbers instead of multiplying: 250 + 5 = 255.
      {
        text: 'She should have added: 250 + 5 = 255 milliliters.',
        isCorrect: false,
        misconception: 'added-instead-of-multiplied',
      },
      // Divided instead of multiplying: 250 ÷ 5 = 50.
      {
        text: 'She should have divided: 250 ÷ 5 = 50 milliliters.',
        isCorrect: false,
        misconception: 'divided-instead-of-multiplied',
      },
    ]),
    calculatorAllowed: false,
    isStretch: false,
    difficulty: 'advanced',
    explanation: {
      stepByStep: [
        'Step 1: Five batches each needing the same amount is five equal groups, so multiplying is the right operation: 250 × 5.',
        'Step 2: 250 × 5 = 1,250, so Priya’s arithmetic is correct.',
        'Step 3: The 250 in the problem is 250 MILLILITERS, so the product is 1,250 milliliters. Nothing in the problem was measured in liters.',
        'Step 4: Her multiplication is right, but the answer is 1,250 milliliters, not liters.',
      ],
      conceptSummary:
        'A measurement answer is a number AND a unit, and the unit comes from the measurements you multiplied — it is not chosen afterwards to suit the size of the number.',
      commonMisconception:
        'A big number invites a big-sounding unit. But 1,250 liters of milk would fill a small swimming pool; 1,250 milliliters is a little over a liter, which is about right for five batches.',
    },
  },

  // ==========================================
  // Standard: NC.4.MD.2 — Convert Metric Units (Larger to Smaller)
  // Sourced: multiplicative reasoning to convert from a LARGER unit to a
  // SMALLER unit, using place value, two-column tables and length models.
  // Every item here converts larger -> smaller. None converts back.
  // ==========================================
  {
    id: 'g4-md2-01',
    standardCode: 'NC.4.MD.2',
    domainId: 'MD',
    // A word problem with a length model (the meter stick), NOT a bare
    // "30 meters = ? centimeters". The generator g4.md2.metric-convert already
    // serves bare conversions, and a quantity of 30 is outside the range it
    // draws from, so no seed of it can reproduce this item's numbers either.
    prompt:
      'Mr. Hale lays a meter stick end over end along a hallway and finds it is exactly 30 meters long. How many centimeters long is the hallway?',
    options: labelOptions([
      // Shifted one place too few: multiplied by 10 instead of 100.
      {
        text: '300 centimeters',
        isCorrect: false,
        misconception: 'wrong-power-of-ten',
      },
      // Used 1,000 — the kilogram-to-gram and liter-to-milliliter factor —
      // where meters to centimeters needs 100: 30 × 1,000 = 30,000.
      {
        text: '30,000 centimeters',
        isCorrect: false,
        misconception: 'used-wrong-conversion-factor',
      },
      // Divided by 100 where multiplying was needed: 30 ÷ 100 = 0.3. Going to
      // a SMALLER unit must give MORE of them, so the number has to grow.
      {
        text: '0.3 centimeters',
        isCorrect: false,
        misconception: 'unit-conversion-inverted',
      },
      { text: '3,000 centimeters', isCorrect: true },
    ]),
    calculatorAllowed: false,
    isStretch: false,
    difficulty: 'mastery',
    explanation: {
      stepByStep: [
        'Step 1: 1 meter = 100 centimeters, which is what one meter stick is marked off into.',
        'Step 2: A centimeter is smaller than a meter, so the same length takes MORE centimeters than meters. The number has to get bigger, which means multiplying.',
        'Step 3: 30 × 100 = 3,000.',
        'Step 4: The hallway is 3,000 centimeters long.',
      ],
      conceptSummary:
        'Converting from a larger unit to a smaller one always multiplies, because it takes more of a small unit to cover the same amount. Deciding whether the number should grow or shrink BEFORE calculating settles which operation to use.',
      commonMisconception:
        'Dividing gives 0.3 centimeters, which is thinner than a pencil. A 30-meter hallway cannot become a number smaller than 30 just by renaming its unit.',
    },
  },
  {
    id: 'g4-md2-02',
    standardCode: 'NC.4.MD.2',
    domainId: 'MD',
    prompt: 'The two-column table converts kilograms to grams. What number belongs in the empty cell?',
    promptDetails:
      'Table with two columns, Kilograms and Grams. Row 1: 1 kilogram, 1,000 grams. Row 2: 2 kilograms, 2,000 grams. Row 3: 3 kilograms, 3,000 grams. Row 4: 6 kilograms, empty cell.',
    options: labelOptions([
      // Shifted one place too few: 6 × 100 = 600.
      {
        text: '600 grams',
        isCorrect: false,
        misconception: 'wrong-power-of-ten',
      },
      { text: '6,000 grams', isCorrect: true },
      // Continued the table additively — 3,000 + 1,000 = 4,000 — instead of
      // applying the rule "multiply by 1,000" to the new value, 6.
      {
        text: '4,000 grams',
        isCorrect: false,
        misconception: 'extended-the-table-one-row-at-a-time',
      },
      // Divided by 1,000 where multiplying was needed: 6 ÷ 1,000 = 0.006.
      {
        text: '0.006 grams',
        isCorrect: false,
        misconception: 'unit-conversion-inverted',
      },
    ]),
    calculatorAllowed: false,
    isStretch: false,
    difficulty: 'mastery',
    explanation: {
      stepByStep: [
        'Step 1: Read the rule off the rows that are already filled in: 1 kilogram goes to 1,000 grams, 2 to 2,000, 3 to 3,000. Each grams entry is the kilograms entry × 1,000.',
        'Step 2: The rule is multiplicative, not "add 1,000 each row". The rows happen to step by one kilogram at the top, but row 4 jumps to 6.',
        'Step 3: 6 × 1,000 = 6,000.',
        'Step 4: The empty cell holds 6,000 grams.',
      ],
      conceptSummary:
        'A two-column conversion table shows one multiplication repeated, not a running total. The rule has to be applied to the new value, however far it jumps from the row above.',
      commonMisconception:
        'Adding 1,000 to the row above gives 4,000, which is the answer for 4 kilograms, not 6. Checking the rule against EVERY filled row, not just the last one, catches this.',
    },
  },
  {
    id: 'g4-md2-03',
    standardCode: 'NC.4.MD.2',
    domainId: 'MD',
    prompt:
      'A cooler holds 4 liters 250 milliliters of sports drink. How many milliliters does the cooler hold in all?',
    options: labelOptions([
      { text: '4,250 milliliters', isCorrect: true },
      // Converted the 4 liters and then forgot to add the 250 milliliters
      // that were already there: 4 × 1,000 = 4,000.
      {
        text: '4,000 milliliters',
        isCorrect: false,
        misconception: 'omitted-part-of-the-measurement',
      },
      // Added the two numbers as they stand, never converting the liters:
      // 4 + 250 = 254.
      {
        text: '254 milliliters',
        isCorrect: false,
        misconception: 'added-without-converting',
      },
      // Used 100 — the meter-to-centimeter factor — for liters to milliliters:
      // 4 × 100 = 400, then 400 + 250 = 650.
      {
        text: '650 milliliters',
        isCorrect: false,
        misconception: 'used-wrong-conversion-factor',
      },
    ]),
    calculatorAllowed: false,
    isStretch: false,
    difficulty: 'advanced',
    explanation: {
      stepByStep: [
        'Step 1: The measurement is in two units, so convert the larger one first: 1 liter = 1,000 milliliters.',
        'Step 2: 4 × 1,000 = 4,000 milliliters for the liters part.',
        'Step 3: The 250 milliliters is already in the unit asked for, so add it on: 4,000 + 250 = 4,250.',
        'Step 4: The cooler holds 4,250 milliliters.',
      ],
      conceptSummary:
        'A measurement written in two units is converted one part at a time and then combined. Only the part in the larger unit gets multiplied; the part already in the smaller unit is added on unchanged.',
      commonMisconception:
        'Converting the liters and then stopping loses the 250 milliliters entirely. Every number given in the problem has to end up somewhere in the calculation.',
    },
  },

  // ==========================================
  // Standard: NC.4.MD.8 — Time Intervals That Cross the Hour
  // Sourced: word problems adding and subtracting time intervals that cross
  // from one hour into the next. Every item below crosses an hour boundary,
  // which is the whole point of the standard.
  // ==========================================
  {
    id: 'g4-md8-01',
    standardCode: 'NC.4.MD.8',
    domainId: 'MD',
    prompt:
      'Basketball practice starts at 4:45 p.m. and lasts 50 minutes. What time does practice end?',
    options: labelOptions([
      // Added 45 + 50 = 95 and wrote it straight into the minutes place
      // without trading 60 of those minutes for an hour.
      {
        text: '4:95 p.m.',
        isCorrect: false,
        misconception: 'counted-past-sixty-minutes',
      },
      // Subtracted the 50 minutes instead of adding them: 4:45 − 50 = 3:55.
      {
        text: '3:55 p.m.',
        isCorrect: false,
        misconception: 'subtracted-instead-of-added',
      },
      { text: '5:35 p.m.', isCorrect: true },
      // Traded the 60 minutes correctly — 95 − 60 = 35 — but left the hour at
      // 4 instead of moving it to 5.
      {
        text: '4:35 p.m.',
        isCorrect: false,
        misconception: 'regrouped-the-minutes-but-not-the-hours',
      },
    ]),
    calculatorAllowed: false,
    isStretch: false,
    difficulty: 'mastery',
    explanation: {
      stepByStep: [
        'Step 1: Practice starts at 4:45, and 15 more minutes reaches 5:00. That uses 15 of the 50 minutes.',
        'Step 2: 50 − 15 = 35 minutes are still left after 5:00.',
        'Step 3: 35 minutes past 5:00 is 5:35.',
        'Step 4: Practice ends at 5:35 p.m.',
      ],
      conceptSummary:
        'Crossing the hour is easiest in two hops: first jump to the next whole hour, then spend whatever time is left. Sixty minutes always trade for exactly one hour.',
      commonMisconception:
        'Adding 45 + 50 straight down gives "4:95", and no clock ever shows 4:95 — once the minutes reach 60 they become an hour. Any answer with 60 or more minutes is a signal to trade.',
    },
  },
  {
    id: 'g4-md8-02',
    standardCode: 'NC.4.MD.8',
    domainId: 'MD',
    prompt: 'A movie starts at 1:40 p.m. and ends at 3:15 p.m. How long is the movie?',
    options: labelOptions([
      // Took each column the easy way round instead of regrouping: hours
      // 3 − 1 = 2, minutes 40 − 15 = 25 (the larger minute figure minus the
      // smaller, ignoring which time they belong to).
      {
        text: '2 hours 25 minutes',
        isCorrect: false,
        misconception: 'subtracted-without-regrouping',
      },
      // Added the two clock readings instead of subtracting: 1:40 + 3:15
      // gives 4 hours 55 minutes.
      {
        text: '4 hours 55 minutes',
        isCorrect: false,
        misconception: 'added-instead-of-subtracted',
      },
      // Borrowed 60 minutes into the minutes column — 75 − 40 = 35 — but left
      // the hours as 3 − 1 = 2 instead of reducing the 3 to a 2 first.
      {
        text: '2 hours 35 minutes',
        isCorrect: false,
        misconception: 'regrouped-the-minutes-but-not-the-hours',
      },
      { text: '1 hour 35 minutes', isCorrect: true },
    ]),
    calculatorAllowed: false,
    isStretch: false,
    difficulty: 'mastery',
    explanation: {
      stepByStep: [
        'Step 1: From 1:40 p.m., one whole hour later is 2:40 p.m.',
        'Step 2: From 2:40 p.m. to 3:00 p.m. is 20 more minutes, and from 3:00 p.m. to 3:15 p.m. is 15 more.',
        'Step 3: 20 + 15 = 35 minutes on top of the 1 hour.',
        'Step 4: The movie is 1 hour 35 minutes long.',
      ],
      conceptSummary:
        'Elapsed time is counted forward from the start, not subtracted column by column. Counting up in convenient hops — whole hours first, then to the next hour, then the remainder — never needs borrowing at all.',
      commonMisconception:
        'Writing the two times in columns and taking 40 − 15 gives 2 hours 25 minutes, which is longer than the real gap. The minutes of the START time cannot simply be subtracted from the minutes of the END time when the end has fewer.',
    },
  },
  {
    id: 'g4-md8-03',
    standardCode: 'NC.4.MD.8',
    domainId: 'MD',
    prompt:
      'Jordan must arrive at school by 8:10 a.m. His ride takes 35 minutes, and he needs 20 minutes to get ready before he leaves the house. What is the latest time he can start getting ready?',
    options: labelOptions([
      // Added the 55 minutes to the arrival time instead of subtracting them:
      // 8:10 + 55 = 9:05.
      {
        text: '9:05 a.m.',
        isCorrect: false,
        misconception: 'added-instead-of-subtracted',
      },
      { text: '7:15 a.m.', isCorrect: true },
      // Subtracted the 35-minute ride and stopped, never taking off the 20
      // minutes of getting ready: 8:10 − 35 = 7:35.
      {
        text: '7:35 a.m.',
        isCorrect: false,
        misconception: 'forgot-the-final-step',
      },
      // Borrowed 60 minutes into the minutes column — 70 − 55 = 15 — but left
      // the hour at 8 instead of reducing it to 7.
      {
        text: '8:15 a.m.',
        isCorrect: false,
        misconception: 'regrouped-the-minutes-but-not-the-hours',
      },
    ]),
    calculatorAllowed: false,
    isStretch: false,
    difficulty: 'advanced',
    explanation: {
      stepByStep: [
        'Step 1: Two things happen before 8:10 a.m., so both have to come off: 35 minutes of riding and 20 minutes of getting ready.',
        'Step 2: 35 + 20 = 55 minutes in total.',
        'Step 3: Counting back from 8:10 a.m., 10 minutes reaches 8:00 a.m., and 45 minutes more reaches 7:15 a.m. (10 + 45 = 55).',
        'Step 4: The latest Jordan can start getting ready is 7:15 a.m.',
      ],
      conceptSummary:
        'Working backwards from a deadline means subtracting every interval, and it is the same skill as counting forward — just run in reverse, stopping at the whole hour on the way.',
      commonMisconception:
        'Taking off only the ride leaves 7:35 a.m., which does not give Jordan the 20 minutes he needs to get ready. A multi-step problem is not finished until every interval named in it has been used.',
    },
  },
  {
    id: 'g4-md8-04',
    standardCode: 'NC.4.MD.8',
    domainId: 'MD',
    prompt:
      "Ava's chorus rehearsal runs from 10:50 a.m. until 12:05 p.m. How long does the rehearsal last?",
    options: labelOptions([
      { text: '1 hour 15 minutes', isCorrect: true },
      // Took each column the easy way round: hours 12 − 10 = 2, minutes
      // 50 − 5 = 45.
      {
        text: '2 hours 45 minutes',
        isCorrect: false,
        misconception: 'subtracted-without-regrouping',
      },
      // Borrowed 60 minutes into the minutes column — 65 − 50 = 15 — but left
      // the hours as 12 − 10 = 2 instead of reducing the 12 to an 11.
      {
        text: '2 hours 15 minutes',
        isCorrect: false,
        misconception: 'regrouped-the-minutes-but-not-the-hours',
      },
      // Counted the 50 minutes already showing on the clock as the time up to
      // 11:00 instead of the 10 minutes still to come: 50 + 60 + 5 = 115
      // minutes, which is 1 hour 55 minutes.
      {
        text: '1 hour 55 minutes',
        isCorrect: false,
        misconception: 'used-the-minutes-past-the-hour-not-the-minutes-left',
      },
    ]),
    calculatorAllowed: false,
    isStretch: false,
    difficulty: 'advanced',
    explanation: {
      stepByStep: [
        'Step 1: From 10:50 a.m., 10 minutes reaches 11:00 a.m. — the 50 on the clock is how far PAST 10:00 it is, not how far it is to 11:00.',
        'Step 2: From 11:00 a.m. to 12:00 p.m. is one whole hour.',
        'Step 3: From 12:00 p.m. to 12:05 p.m. is 5 more minutes, so the minutes total 10 + 5 = 15.',
        'Step 4: The rehearsal lasts 1 hour 15 minutes.',
      ],
      conceptSummary:
        'Bridging an hour uses the minutes LEFT until the next hour, which is 60 minus the minutes showing. Crossing from a.m. to p.m. at noon works exactly the same way — 11:00 a.m. to 12:00 p.m. is one ordinary hour.',
      commonMisconception:
        'Using the 50 that is showing on the clock instead of the 10 minutes remaining overshoots by 40 minutes every time. The minutes displayed and the minutes remaining always add to 60.',
    },
  },

  // ==========================================
  // Standard: NC.4.MD.3 — Area & Perimeter Problems
  // Sourced: areas of rectilinear figures from known side lengths; a fixed
  // area with varying perimeters and a fixed perimeter with varying areas;
  // the area and perimeter formulas for rectangles in real problems.
  //
  // In the three numeric items the four options all carry the unit of the
  // CORRECT answer, so the label never gives the answer away. A distractor is
  // the NUMBER a wrong method produces, not a claim that that number is
  // genuinely an area or genuinely a length.
  // ==========================================
  {
    id: 'g4-md3-01',
    standardCode: 'NC.4.MD.3',
    domainId: 'MD',
    // 14 by 6 is outside the rectangle pool ./templates/md3-rectangle-area.ts
    // draws from (lengths 4 to 12), so no seed of that generator can reproduce
    // this item's numbers or its four options.
    prompt:
      'A rectangular parking lot is 14 meters long and 6 meters wide. The whole lot is going to be resurfaced. How many square meters of surface will be resurfaced?',
    options: labelOptions([
      // Found the perimeter instead of the area: 2 × (14 + 6) = 40.
      {
        text: '40 square meters',
        isCorrect: false,
        misconception: 'used-perimeter-formula',
      },
      // Added the length and the width once each: 14 + 6 = 20, which is half
      // the perimeter and not an area at all.
      {
        text: '20 square meters',
        isCorrect: false,
        misconception: 'added-only-the-two-given-sides',
      },
      // Doubled only the length while finding a perimeter: 2 × 14 + 6 = 34.
      {
        text: '34 square meters',
        isCorrect: false,
        misconception: 'doubled-only-one-dimension',
      },
      { text: '84 square meters', isCorrect: true },
    ]),
    calculatorAllowed: false,
    isStretch: false,
    difficulty: 'mastery',
    explanation: {
      stepByStep: [
        'Step 1: Area counts the square meters that COVER the lot, so it comes from multiplying the two side lengths.',
        'Step 2: Area = length × width = 14 × 6.',
        'Step 3: 14 × 6 = 84.',
        'Step 4: The area of the parking lot is 84 square meters.',
      ],
      conceptSummary:
        'Area is a covering and perimeter is a border. Area multiplies the two dimensions and is measured in SQUARE units; perimeter adds all four sides and is measured in plain length units.',
      commonMisconception:
        'Adding 14 + 6 + 14 + 6 gives 40, the distance around the lot — the length of its edge, not the amount of surface inside it.',
    },
  },
  {
    id: 'g4-md3-02',
    standardCode: 'NC.4.MD.3',
    domainId: 'MD',
    // 13 by 9 is outside the rectangle pool the perimeter generator draws from
    // (lengths 4 to 12), so no seed of it can reproduce this item.
    prompt:
      'A rectangular banquet room floor is 13 meters long and 9 meters wide. Ms. Patel wants to run a braided trim all the way around its edge. How many meters of trim does she need?',
    options: labelOptions([
      // Added the length and the width once each: 13 + 9 = 22, half the
      // perimeter.
      {
        text: '22 meters',
        isCorrect: false,
        misconception: 'added-only-the-two-given-sides',
      },
      // Doubled only the length: 2 × 13 + 9 = 35, leaving one width out.
      {
        text: '35 meters',
        isCorrect: false,
        misconception: 'doubled-only-one-dimension',
      },
      { text: '44 meters', isCorrect: true },
      // Multiplied the two sides, finding the area 13 × 9 = 117, when the trim
      // goes around the edge.
      {
        text: '117 meters',
        isCorrect: false,
        misconception: 'used-area-formula-for-perimeter',
      },
    ]),
    calculatorAllowed: false,
    isStretch: false,
    difficulty: 'mastery',
    explanation: {
      stepByStep: [
        'Step 1: Trim goes around the EDGE of the floor, so this asks for the perimeter.',
        'Step 2: A rectangle has two lengths and two widths: 13 + 9 + 13 + 9, or 2 × (13 + 9).',
        'Step 3: 2 × 22 = 44.',
        'Step 4: Ms. Patel needs 44 meters of trim.',
      ],
      conceptSummary:
        'Deciding between area and perimeter is a question about the situation, not the numbers: something that covers a surface needs area, and something that runs around an edge needs perimeter.',
      commonMisconception:
        'Multiplying 13 × 9 gives 117, the number of square meters of floor — which would be the right question if she were carpeting the room, not trimming its edge.',
    },
  },
  {
    id: 'g4-md3-03',
    standardCode: 'NC.4.MD.3',
    domainId: 'MD',
    prompt: 'What is the total area of the reading nook floor?',
    promptDetails:
      'Figure description: an L-shaped floor made of two rectangles joined along part of one edge, with no overlap. The larger rectangle measures 7 meters by 5 meters. The smaller rectangle measures 4 meters by 2 meters.',
    options: labelOptions([
      // Multiplied all four given side lengths together in one product:
      // 7 × 5 × 4 × 2 = 280.
      {
        text: '280 square meters',
        isCorrect: false,
        misconception: 'multiplied-every-side-length-together',
      },
      { text: '43 square meters', isCorrect: true },
      // Found the larger rectangle, 7 × 5 = 35, and stopped there.
      {
        text: '35 square meters',
        isCorrect: false,
        misconception: 'omitted-one-part-of-composite',
      },
      // Took the two part areas apart instead of putting them together:
      // 35 − 8 = 27.
      {
        text: '27 square meters',
        isCorrect: false,
        misconception: 'subtracted-instead-of-added',
      },
    ]),
    calculatorAllowed: false,
    isStretch: false,
    difficulty: 'advanced',
    explanation: {
      stepByStep: [
        'Step 1: An L-shaped figure splits into two rectangles that do not overlap, so its area is the sum of the two rectangle areas.',
        'Step 2: Larger rectangle: 7 × 5 = 35 square meters.',
        'Step 3: Smaller rectangle: 4 × 2 = 8 square meters.',
        'Step 4: 35 + 8 = 43, so the total area of the reading nook floor is 43 square meters.',
      ],
      conceptSummary:
        'A rectilinear figure is a set of rectangles in disguise. Cut it into rectangles that do not overlap, find each area with length × width, and add — the pieces cover the whole floor exactly once.',
      commonMisconception:
        'Multiplying all four side lengths together gives 280, which is nearly seven times the real floor. Each rectangle uses only its OWN two dimensions.',
    },
  },
  {
    id: 'g4-md3-04',
    standardCode: 'NC.4.MD.3',
    domainId: 'MD',
    prompt:
      'Mr. Ruiz has exactly 24 meters of fencing for a rectangular pen with whole-number side lengths. He wants to use all 24 meters and enclose the greatest possible area. Which pen should he build?',
    // Every option is a pair of dimensions, which the test canonicalises as a
    // sorted pair, so all four are compared as shapes.
    options: labelOptions([
      { text: '6 meters by 6 meters', isCorrect: true },
      // Perimeter 2 × (11 + 1) = 24, so it does use all the fencing — but its
      // area is only 11 square meters. The longest side does not win.
      {
        text: '11 meters by 1 meter',
        isCorrect: false,
        misconception: 'assumed-longer-side-means-greater-area',
      },
      // Halved the 24 meters and used 12 for each side, as if a rectangle had
      // only two sides. Its perimeter is 2 × (12 + 12) = 48, twice the
      // fencing available.
      {
        text: '12 meters by 12 meters',
        isCorrect: false,
        misconception: 'used-half-the-perimeter-as-each-side',
      },
      // Perimeter 2 × (6 + 4) = 20, so 4 meters of fencing would be left over
      // and the problem says all 24 must be used.
      {
        text: '6 meters by 4 meters',
        isCorrect: false,
        misconception: 'ignored-the-fixed-perimeter',
      },
    ]),
    calculatorAllowed: false,
    isStretch: true,
    difficulty: 'stretch',
    explanation: {
      stepByStep: [
        'Step 1: "All 24 meters of fencing" fixes the PERIMETER at 24, so 2 × (length + width) = 24 and length + width = 12.',
        'Step 2: Check each pen against that. 6 + 6 = 12 and 11 + 1 = 12, so those two use all the fencing. 12 + 12 = 24 needs 48 meters, and 6 + 4 = 10 uses only 20 meters, so both are out.',
        'Step 3: Compare the areas of the two that fit: 6 × 6 = 36 square meters against 11 × 1 = 11 square meters.',
        'Step 4: He should build the pen that is 6 meters by 6 meters.',
      ],
      conceptSummary:
        'A fixed perimeter does not fix the area. Among rectangles with the same perimeter, the one closest to a square encloses the most, and the long thin ones enclose the least.',
      commonMisconception:
        'A long pen looks roomier because one side is big, but 11 by 1 encloses only 11 square meters — less than a third of what the same fencing gives as a 6 by 6 square.',
    },
  },

  // ==========================================
  // Standard: NC.4.MD.4 — Represent & Interpret Data
  // Sourced: represent and interpret data USING WHOLE NUMBERS, in a frequency
  // table, scaled bar graph and/or line plot; and decide whether a survey
  // question yields categorical or numerical data.
  //
  // NC does NOT put fractional measurements on a line plot at Grade 4 — that
  // is Common Core's 4.MD.B.4, not this standard — so g4-md4-03's line plot is
  // marked in whole minutes and every count below is a whole number.
  // ==========================================
  {
    id: 'g4-md4-01',
    standardCode: 'NC.4.MD.4',
    domainId: 'MD',
    prompt:
      'The frequency table shows how many books the students in one class read last month. How many students read 3 or more books?',
    promptDetails:
      'Frequency table with two columns, Books read and Number of students. Row 1: 1 book, 6 students. Row 2: 2 books, 9 students. Row 3: 3 books, 5 students. Row 4: 4 books, 3 students. Row 5: 5 books, 2 students.',
    options: labelOptions([
      // Added every frequency in the table: 6 + 9 + 5 + 3 + 2 = 25, the whole
      // class rather than the part asked about.
      {
        text: '25 students',
        isCorrect: false,
        misconception: 'summed-all-data-points',
      },
      // Added the BOOK COUNTS 3 + 4 + 5 = 12 instead of the numbers of
      // students recorded beside them.
      {
        text: '12 students',
        isCorrect: false,
        misconception: 'used-the-data-values-not-their-frequencies',
      },
      { text: '10 students', isCorrect: true },
      // Read only the "3 books" row and stopped, ignoring "or more".
      {
        text: '5 students',
        isCorrect: false,
        misconception: 'reported-the-measurement-not-the-total',
      },
    ]),
    calculatorAllowed: false,
    isStretch: false,
    difficulty: 'mastery',
    explanation: {
      stepByStep: [
        'Step 1: "3 or more books" covers three rows of the table: 3 books, 4 books and 5 books.',
        'Step 2: The number of STUDENTS in those rows is 5, 3 and 2 — the left column holds books, not students.',
        'Step 3: 5 + 3 + 2 = 10.',
        'Step 4: 10 students read 3 or more books.',
      ],
      conceptSummary:
        'A frequency table has two different kinds of number in it: what was measured, and how many times it happened. Almost every question asks about the second column, using the first only to pick the rows.',
      commonMisconception:
        'Adding 3 + 4 + 5 = 12 adds up books, not students, and there is no way for 12 students to come from rows holding 5, 3 and 2 of them.',
    },
  },
  {
    id: 'g4-md4-02',
    standardCode: 'NC.4.MD.4',
    domainId: 'MD',
    prompt: 'How many cans did Room 12 collect?',
    promptDetails:
      'Scaled bar graph titled "Cans collected". The scale runs up the side with gridlines labeled 0, 5, 10, 15, 20, 25, 30, 35 and 40, so each gridline above the last stands for 5 more cans. Room 10’s bar reaches the 4th gridline above zero. Room 11’s bar reaches the 3rd gridline above zero. Room 12’s bar reaches the 7th gridline above zero. Room 13’s bar reaches the 2nd gridline above zero.',
    options: labelOptions([
      // Counted how many gridlines the bar reached and reported that count
      // instead of the value it stands for: 7.
      {
        text: '7 cans',
        isCorrect: false,
        misconception: 'read-the-scale-by-counting-ticks',
      },
      // Counted the zero line itself as the first gridline, so the "7th
      // gridline above zero" was read as only 6 intervals up: 6 × 5 = 30.
      {
        text: '30 cans',
        isCorrect: false,
        misconception: 'off-by-one-gridline',
      },
      // Read Room 10's bar instead of Room 12's: 4 gridlines × 5 = 20.
      {
        text: '20 cans',
        isCorrect: false,
        misconception: 'used-the-wrong-given-quantity',
      },
      { text: '35 cans', isCorrect: true },
    ]),
    calculatorAllowed: false,
    isStretch: false,
    difficulty: 'mastery',
    explanation: {
      stepByStep: [
        'Step 1: Find the scale first. The labels go 0, 5, 10, 15 and so on, so one gridline is worth 5 cans, not 1.',
        'Step 2: Room 12’s bar reaches the 7th gridline above zero.',
        'Step 3: 7 gridlines × 5 cans each = 35.',
        'Step 4: Room 12 collected 35 cans.',
      ],
      conceptSummary:
        'On a scaled graph the gridlines are a ruler, not a tally. Reading one means multiplying how many gridlines up it is by what each gridline is worth, which the labels always tell you.',
      commonMisconception:
        'Answering 7 counts the gridlines themselves. That would only be right on a graph whose scale went up by one, and this one goes up by five.',
    },
  },
  {
    id: 'g4-md4-03',
    standardCode: 'NC.4.MD.4',
    domainId: 'MD',
    prompt:
      'How many more students read for 20 minutes than read for 35 minutes?',
    promptDetails:
      'Line plot titled "Minutes spent reading on Monday". The number line is marked 15, 20, 25, 30 and 35, and each student is one X above their mark. Above 15 there are 2 X’s. Above 20 there are 6 X’s. Above 25 there are 4 X’s. Above 30 there are 3 X’s. Above 35 there is 1 X.',
    options: labelOptions([
      { text: '5 students', isCorrect: true },
      // Added the two counts instead of subtracting: 6 + 1 = 7.
      {
        text: '7 students',
        isCorrect: false,
        misconception: 'added-instead-of-subtracted',
      },
      // Subtracted the NUMBERS ON THE NUMBER LINE rather than the numbers of
      // X's above them: 35 − 20 = 15.
      {
        text: '15 students',
        isCorrect: false,
        misconception: 'used-the-data-values-not-their-frequencies',
      },
      // Counted every X on the plot: 2 + 6 + 4 + 3 + 1 = 16.
      {
        text: '16 students',
        isCorrect: false,
        misconception: 'summed-all-data-points',
      },
    ]),
    calculatorAllowed: false,
    isStretch: false,
    difficulty: 'advanced',
    explanation: {
      stepByStep: [
        'Step 1: Each X is one student, so count the X’s above 20: there are 6.',
        'Step 2: Count the X’s above 35: there is 1.',
        'Step 3: "How many more" asks for the difference: 6 − 1 = 5.',
        'Step 4: The difference is 5 students, so 5 more students read for 20 minutes than for 35 minutes.',
      ],
      conceptSummary:
        'On a line plot the number line says WHAT was measured and the stack of X’s says HOW MANY. A "how many more" question always compares the heights of two stacks, never the labels underneath them.',
      commonMisconception:
        'Subtracting 35 − 20 = 15 compares minutes, not students, and the plot only has 16 students on it altogether.',
    },
  },
  {
    id: 'g4-md4-04',
    standardCode: 'NC.4.MD.4',
    domainId: 'MD',
    prompt:
      'Ms. Okafor wants each student in her class to answer a survey question that will give her NUMERICAL data. Which question should she ask?',
    // All four options are questions, not quantities, so the canonical parser
    // returns null for every one. Checked by hand: four different questions.
    options: labelOptions([
      // The answers are names of animals — categories, not numbers.
      {
        text: 'What is your favorite kind of pet?',
        isCorrect: false,
        misconception: 'confused-categorical-with-numerical',
      },
      { text: 'How many pets do you have at home?', isCorrect: true },
      // A "how many" phrasing, but it asks for one total about the whole
      // class rather than a response from each student, so no data set is
      // collected at all.
      {
        text: 'How many students in our class own a dog?',
        isCorrect: false,
        misconception: 'asked-for-a-single-total-not-data',
      },
      // The answers are "a dog" or "a cat" — two categories.
      {
        text: 'Would you rather have a dog or a cat?',
        isCorrect: false,
        misconception: 'confused-categorical-with-numerical',
      },
    ]),
    calculatorAllowed: false,
    isStretch: false,
    difficulty: 'mastery',
    explanation: {
      stepByStep: [
        'Step 1: Numerical data means every answer is a number that can be counted or measured, and those numbers can be put on a number line.',
        'Step 2: "Favorite kind of pet" and "a dog or a cat" are answered with names, so they collect categorical data — good for a bar graph, but not numerical.',
        'Step 3: "How many students in our class own a dog?" has one answer for the whole class, so it is not something each student can respond to and it produces no data set.',
        'Step 4: She should ask: How many pets do you have at home?',
      ],
      conceptSummary:
        'A survey question yields numerical data only if each person answers it with a number of their own. Counting up categories afterwards does not make the data numerical — the ANSWERS have to be the numbers.',
      commonMisconception:
        'Any question can end up as a count, because you can always tally how many people said "cat". That tally is a count of a category, not a measurement each student reported.',
    },
  },

  // ==========================================
  // Standard: NC.4.MD.6 — Angles & Measuring with a Protractor
  // Sourced: angles are formed where two rays share an endpoint and are
  // measured in degrees; measure and sketch angles in WHOLE-NUMBER degrees
  // with a protractor; add and subtract to find unknown angles on a diagram.
  //
  // Options say "degrees" rather than the degree symbol so a screen reader
  // reads them aloud correctly.
  // ==========================================
  {
    id: 'g4-md6-01',
    standardCode: 'NC.4.MD.6',
    domainId: 'MD',
    prompt: 'What is the measure of angle BPC?',
    promptDetails:
      'Angle description: ray PA and ray PC share the endpoint P and form angle APC, which measures 130 degrees. Ray PB also starts at P and lies inside angle APC, splitting it into two smaller angles that do not overlap: angle APB and angle BPC. Angle APB measures 45 degrees.',
    options: labelOptions([
      // Added the two given measures instead of subtracting: 130 + 45 = 175.
      {
        text: '175 degrees',
        isCorrect: false,
        misconception: 'added-instead-of-subtracted',
      },
      // Took 130 − 45 column by column without regrouping: ones |0 − 5| = 5,
      // tens |3 − 4| = 1, hundreds 1, giving 115.
      {
        text: '115 degrees',
        isCorrect: false,
        misconception: 'subtracted-without-regrouping',
      },
      // Used 180 as the whole angle instead of the 130 the diagram gives:
      // 180 − 45 = 135.
      {
        text: '135 degrees',
        isCorrect: false,
        misconception: 'assumed-a-straight-angle',
      },
      { text: '85 degrees', isCorrect: true },
    ]),
    calculatorAllowed: false,
    isStretch: false,
    difficulty: 'mastery',
    explanation: {
      stepByStep: [
        'Step 1: Ray PB splits angle APC into two parts that do not overlap, so angle APB + angle BPC = angle APC.',
        'Step 2: That is 45 + angle BPC = 130, so angle BPC = 130 − 45.',
        'Step 3: 130 − 45: take 45 off 130 by going to 100 first (30), then 15 more, giving 85.',
        'Step 4: Angle BPC measures 85 degrees.',
      ],
      conceptSummary:
        'When a ray splits an angle, the two parts add up to the whole. Finding a missing part is therefore subtraction, and finding the whole is addition.',
      commonMisconception:
        'Answering 135 degrees assumes the outer rays form a straight line. The diagram says angle APC is 130 degrees, and a part of an angle can never be bigger than the whole it sits inside.',
    },
  },
  {
    id: 'g4-md6-02',
    standardCode: 'NC.4.MD.6',
    domainId: 'MD',
    prompt: 'What is the measure of the angle Kiran is measuring?',
    promptDetails:
      'Kiran puts the center of a protractor on the vertex of an angle and lines one ray up with the zero mark on the INNER scale. The other ray crosses the protractor where the inner scale reads 35 and the outer scale reads 145. The angle is clearly smaller than a right angle.',
    options: labelOptions([
      // Reported how far the angle falls short of a right angle: 90 − 35 = 55.
      {
        text: '55 degrees',
        isCorrect: false,
        misconception: 'assumed-a-right-angle',
      },
      // Subtracted the two scale readings from each other: 145 − 35 = 110.
      {
        text: '110 degrees',
        isCorrect: false,
        misconception: 'subtracted-the-two-protractor-readings',
      },
      { text: '35 degrees', isCorrect: true },
      // Read the outer scale, which gives the angle's supplement, because the
      // ray was lined up with zero on the INNER scale.
      {
        text: '145 degrees',
        isCorrect: false,
        misconception: 'read-the-wrong-protractor-scale',
      },
    ]),
    calculatorAllowed: false,
    isStretch: false,
    difficulty: 'advanced',
    explanation: {
      stepByStep: [
        'Step 1: A protractor carries two scales running opposite ways, and they always add to 180 at any mark: 35 + 145 = 180.',
        'Step 2: The scale to read is the one whose ZERO the first ray is lined up with. Kiran lined his ray up with zero on the inner scale, so the inner scale is the one to use.',
        'Step 3: Check it against the picture: the angle is smaller than a right angle, so its measure must be less than 90. Only 35 fits; 145 is obtuse.',
        'Step 4: The angle measures 35 degrees.',
      ],
      conceptSummary:
        'Reading a protractor is two steps: line one ray up with a zero, then read the scale that zero belongs to. Deciding first whether the angle is acute or obtuse tells you at once whether the number you read is believable.',
      commonMisconception:
        'The two numbers where a ray crosses the protractor always add to 180, so picking the wrong one gives the supplement of the angle instead of the angle.',
    },
  },
  {
    id: 'g4-md6-03',
    standardCode: 'NC.4.MD.6',
    domainId: 'MD',
    prompt: 'What is the measure of angle RST?',
    promptDetails:
      'Angle description: ray SR, ray SU and ray ST all share the endpoint S. Ray SU lies between the other two, so angle RSU and angle UST do not overlap and together they make angle RST. Angle RSU measures 68 degrees and angle UST measures 47 degrees.',
    options: labelOptions([
      { text: '115 degrees', isCorrect: true },
      // Subtracted the two parts instead of adding them: 68 − 47 = 21.
      {
        text: '21 degrees',
        isCorrect: false,
        misconception: 'subtracted-instead-of-added',
      },
      // Added the columns without carrying: 60 + 40 = 100, then 8 + 7 = 15
      // with only the 5 written down, giving 105.
      {
        text: '105 degrees',
        isCorrect: false,
        misconception: 'added-without-carrying',
      },
      // Assumed the two outer rays form a straight line, so the whole angle
      // "must" be 180 — which the two given parts do not add up to.
      {
        text: '180 degrees',
        isCorrect: false,
        misconception: 'assumed-a-straight-angle',
      },
    ]),
    calculatorAllowed: false,
    isStretch: false,
    difficulty: 'advanced',
    explanation: {
      stepByStep: [
        'Step 1: Ray SU lies between ray SR and ray ST, so the two smaller angles join to make the whole: angle RSU + angle UST = angle RST.',
        'Step 2: 68 + 47.',
        'Step 3: 8 + 7 = 15, so write the 5 and carry the ten: 60 + 40 + 10 = 110, then 110 + 5 = 115.',
        'Step 4: Angle RST measures 115 degrees.',
      ],
      conceptSummary:
        'Two angles that share a ray and do not overlap add to the angle they make together. Nothing about the picture is needed beyond knowing which ray sits in the middle.',
      commonMisconception:
        'Answering 180 degrees assumes ray SR and ray ST point in exactly opposite directions. They do not: 68 + 47 is 115, so the outer rays are well short of a straight line.',
    },
  },
];
