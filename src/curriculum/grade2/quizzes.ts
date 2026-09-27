import type { QuizDefinition } from '../../types';
import type { GradeCurriculum } from '../types';

/** Grade 2's quiz set.
 *
 *  Every id below is an AUTHORED item id from the Grade 2 banks. A quiz may
 *  not cite a template id: `integrity.test.ts` builds its valid-id set from
 *  `source.authoredFor(code)` alone, and generated items are drawn by seed at
 *  run time rather than pinned into a fixed form.
 *
 *  Ids use a HYPHEN after the grade prefix (`g2-oa1-01`), matching every
 *  shipped Grade 2 item (Ruling 21-2); only template ids use dots.
 *
 *  Grade 2 has NO NCDPI blueprint (NCDPI publishes EOG blueprints for grades
 *  3-8 only). Nothing here may claim an official weight - subtitles cite
 *  each domain's share of the grade's 23 standards as a COUNT, the same
 *  figure the study guides use (Ruling 20-1), never a percentage dressed up
 *  as official.
 *
 *  Nothing here imports `standardsOf` from ../registry: the registry imports
 *  ./index, which imports this file, so importing the registry here closes a
 *  cycle that leaves `CURRICULA[2]` undefined whenever grade2/index is the
 *  first module of the graph to load. Standard counts are taken off
 *  `c.domains` instead, exactly as Grade 3 and Grade 4's quizzes do. */

// One item per standard (23 total), all the "-01" authored item, matching
// Grade 3 and Grade 4's diagnostic convention.
const DIAGNOSTIC_QUESTION_IDS = [
  'g2-oa1-01', 'g2-oa2-01', 'g2-oa3-01', 'g2-oa4-01',
  'g2-nbt1-01', 'g2-nbt2-01', 'g2-nbt3-01', 'g2-nbt4-01',
  'g2-nbt5-01', 'g2-nbt6-01', 'g2-nbt7-01', 'g2-nbt8-01',
  'g2-md1-01', 'g2-md2-01', 'g2-md3-01', 'g2-md4-01', 'g2-md5-01',
  'g2-md6-01', 'g2-md7-01', 'g2-md8-01', 'g2-md10-01',
  'g2-g1-01', 'g2-g3-01',
];

const MOD_OA_QUESTION_IDS = [
  'g2-oa1-01', 'g2-oa1-02', 'g2-oa1-03', 'g2-oa1-04', 'g2-oa1-05',
  'g2-oa2-01', 'g2-oa2-02', 'g2-oa2-03',
  'g2-oa3-01', 'g2-oa3-02', 'g2-oa3-03', 'g2-oa3-04',
  'g2-oa4-01', 'g2-oa4-02', 'g2-oa4-03', 'g2-oa4-04',
];

const MOD_NBT_QUESTION_IDS = [
  'g2-nbt1-01', 'g2-nbt1-02', 'g2-nbt1-03', 'g2-nbt1-04',
  'g2-nbt2-01', 'g2-nbt2-02', 'g2-nbt2-03', 'g2-nbt2-04',
  'g2-nbt3-01', 'g2-nbt3-02', 'g2-nbt3-03', 'g2-nbt3-04',
  'g2-nbt4-01', 'g2-nbt4-02', 'g2-nbt4-03', 'g2-nbt4-04',
  'g2-nbt5-01', 'g2-nbt5-02', 'g2-nbt5-03', 'g2-nbt5-04',
  'g2-nbt6-01', 'g2-nbt6-02', 'g2-nbt6-03',
  'g2-nbt7-01', 'g2-nbt7-02', 'g2-nbt7-03', 'g2-nbt7-04',
  'g2-nbt8-01', 'g2-nbt8-02', 'g2-nbt8-03', 'g2-nbt8-04',
];

const MOD_MD_QUESTION_IDS = [
  'g2-md1-01', 'g2-md1-02', 'g2-md1-03',
  'g2-md2-01', 'g2-md2-02', 'g2-md2-03',
  'g2-md3-01', 'g2-md3-02', 'g2-md3-03', 'g2-md3-04', 'g2-md3-05',
  'g2-md4-01', 'g2-md4-02', 'g2-md4-03',
  'g2-md5-01', 'g2-md5-02', 'g2-md5-03',
  'g2-md6-01', 'g2-md6-02', 'g2-md6-03', 'g2-md6-04',
  'g2-md7-01', 'g2-md7-02', 'g2-md7-03', 'g2-md7-04', 'g2-md7-05',
  'g2-md8-01', 'g2-md8-02', 'g2-md8-03', 'g2-md8-04',
  'g2-md10-01', 'g2-md10-02', 'g2-md10-03', 'g2-md10-04',
];

const MOD_G_QUESTION_IDS = [
  'g2-g1-01', 'g2-g1-02', 'g2-g1-03', 'g2-g1-04', 'g2-g1-05',
  'g2-g3-01', 'g2-g3-02', 'g2-g3-03', 'g2-g3-04',
];

/** The full simulation, allocated to each domain's share of the 23
 *  standards - there is no blueprint to allocate against (Ruling 21-6):
 *
 *    OA  4/23 = 17.4%  -> 4.3 of 25 items  -> 4  (floor)
 *    NBT 8/23 = 34.8%  -> 8.7 of 25 items  -> 9  (ceil)
 *    MD  9/23 = 39.1%  -> 9.8 of 25 items  -> 10 (ceil)
 *    G   2/23 =  8.7%  -> 2.2 of 25 items  -> 2  (floor)
 *
 *  4 + 9 + 10 + 2 = 25. Geometry is rounded UP from 2.2's floor only in the
 *  sense that 2 is already its own floor and ceiling would be 3; picking the
 *  floor here (2, never 0) is what keeps the total at 25 once NBT and MD
 *  round up from their own fractions - Geometry does not disappear the way
 *  it would under naive rounding of an 8.7% share to the nearest whole
 *  percent of a smaller form. None of these 25 items appears in the
 *  diagnostic: a child who has just sat the baseline should meet fresh items
 *  in the simulation, not be re-scored on the ones that set the baseline. */
const MOCK_SSA_01_QUESTION_IDS = [
  // Operations & Algebraic Thinking - 4
  'g2-oa1-02', 'g2-oa2-02', 'g2-oa3-02', 'g2-oa4-02',
  // Base Ten - 9
  'g2-nbt1-02', 'g2-nbt2-02', 'g2-nbt3-02', 'g2-nbt4-02',
  'g2-nbt5-02', 'g2-nbt5-03', 'g2-nbt6-02', 'g2-nbt7-02', 'g2-nbt8-02',
  // Measurement & Data - 10
  'g2-md1-02', 'g2-md2-02', 'g2-md3-02', 'g2-md4-02', 'g2-md5-02',
  'g2-md6-02', 'g2-md7-02', 'g2-md7-03', 'g2-md8-02', 'g2-md10-02',
  // Geometry - 2
  'g2-g1-02', 'g2-g3-02',
];

export const GRADE_2_QUIZZES: QuizDefinition[] = [
  {
    id: 'g2-diagnostic-01',
    title: 'Baseline SSA Diagnostic Assessment',
    // Both counts come from the active curriculum, not a grade-2 literal
    // (Ruling F11 / 21-5): this quiz happens to test one item per standard,
    // so the question count and the standard count are the same figure but
    // are still each derived independently.
    subtitle: (c: GradeCurriculum) =>
      `${DIAGNOSTIC_QUESTION_IDS.length}-question diagnostic covering all ${c.domains.reduce((n, d) => n + d.standards.length, 0)} Grade ${c.grade} NCSCOS standards to determine your initial baseline.`,
    isDiagnostic: true,
    timeLimitMinutes: 35,
    questionIds: DIAGNOSTIC_QUESTION_IDS,
  },
  {
    id: 'g2-mod-oa-01',
    title: 'Module 1: Addition, Subtraction & Arrays Drill',
    subtitle:
      'Operations & Algebraic Thinking (4 of 23 Grade 2 standards): addition and subtraction word problems within 100 with the unknown in every position, fluency within 20, odd and even numbers, and rectangular arrays as repeated addition.',
    domainId: 'OA',
    timeLimitMinutes: 25,
    questionIds: MOD_OA_QUESTION_IDS,
  },
  {
    id: 'g2-mod-nbt-01',
    title: 'Module 2: Place Value & Base Ten to 1,000 Drill',
    subtitle:
      'Number & Operations in Base Ten (8 of 23 Grade 2 standards, the second-largest domain in the grade): hundreds, tens and ones; counting and skip-counting within 1,000; comparing three-digit numbers; and adding and subtracting within 100 and within 1,000.',
    domainId: 'NBT',
    timeLimitMinutes: 45,
    questionIds: MOD_NBT_QUESTION_IDS,
  },
  {
    id: 'g2-mod-md-01',
    title: 'Module 3: Measurement, Time & Money Drill',
    subtitle:
      'Measurement & Data (9 of 23 Grade 2 standards, the largest domain in the grade): measuring and estimating length with standard tools, telling time to five minutes, solving money word problems, and reading picture and bar graphs.',
    domainId: 'MD',
    timeLimitMinutes: 45,
    questionIds: MOD_MD_QUESTION_IDS,
  },
  {
    id: 'g2-mod-g-01',
    title: 'Module 4: Shapes & Equal Shares Drill',
    subtitle:
      'Geometry (2 of 23 Grade 2 standards): recognizing and drawing shapes by their attributes, describing rectangular prisms and cubes, and partitioning circles and rectangles into halves, thirds and fourths.',
    domainId: 'G',
    timeLimitMinutes: 15,
    questionIds: MOD_G_QUESTION_IDS,
  },
  {
    id: 'g2-mock-ssa-01',
    title: 'Full Practice Assessment (Form A)',
    // No blueprint exists at this grade (Ruling 21-6), so the allocation is
    // stated honestly as proportional to standard count, not as a blueprint
    // weight. Neither the standard total nor the passing bar is a grade-2
    // literal (Ruling F11 / 21-5).
    subtitle: (c: GradeCurriculum) =>
      `Comprehensive ${MOCK_SSA_01_QUESTION_IDS.length}-item practice test with items allocated across domains in proportion to each domain's share of the ${c.domains.reduce((n, d) => n + d.standards.length, 0)} Grade ${c.grade} standards - there is no official state blueprint to allocate against at this grade. Benchmarked against the ${c.ssa.passingPercent}% passing bar.`,
    isMockAssessment: true,
    timeLimitMinutes: 40,
    questionIds: MOCK_SSA_01_QUESTION_IDS,
  },
];
