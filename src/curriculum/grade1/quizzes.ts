import type { QuizDefinition } from '../../types';
import type { GradeCurriculum } from '../types';

/** Grade 1's quiz set.
 *
 *  Every id below is an AUTHORED item id from the Grade 1 banks. A quiz may
 *  not cite a template id (Ruling 26-6): `integrity.test.ts` builds its
 *  valid-id set from `source.authoredFor(code)` alone, and generated items
 *  are drawn by seed at run time rather than pinned into a fixed form.
 *
 *  Ids use a HYPHEN after the grade prefix (`g1-oa1-01`), matching every
 *  shipped Grade 1 item (Ruling 26-1); only template ids use dots.
 *
 *  Grade 1 has NO NCDPI blueprint (NCDPI publishes EOG blueprints for grades
 *  3-8 only). Nothing here may claim an official weight - subtitles cite
 *  each domain's share of the grade's 23 standards as a COUNT, the same
 *  figure the study guides use (Ruling 25-2), never a percentage dressed up
 *  as official.
 *
 *  Nothing here imports `standardsOf` from ../registry: the registry imports
 *  ./index, which imports this file, so importing the registry here closes a
 *  cycle that leaves `CURRICULA[1]` undefined whenever grade1/index is the
 *  first module of the graph to load. Standard counts are taken off
 *  `c.domains` instead, exactly as Grade 2, 3 and 4's quizzes do.
 *
 *  Diagnostic and module drills use the "-01" (or, for the module drills,
 *  every) authored item per standard; the mock assessment uses "-02" items
 *  so it never re-scores the questions that set the baseline. Standards.ts
 *  order (OA.1, OA.2, OA.3, OA.4, OA.9, OA.6, OA.7, OA.8; NBT.1, NBT.7,
 *  NBT.2, NBT.3, NBT.4, NBT.5, NBT.6; MD.1, MD.2, MD.3, MD.5, MD.4; G.1,
 *  G.2, G.3) is preserved throughout for readability. */

// One item per standard (23 total), the "-01" authored item, matching
// Grade 2, 3 and 4's diagnostic convention. 30-minute limit, not the
// 35-45 minutes used at higher grades - a first-grader's attention span,
// not a fifth-grader's.
const DIAGNOSTIC_QUESTION_IDS = [
  'g1-oa1-01', 'g1-oa2-01', 'g1-oa3-01', 'g1-oa4-01', 'g1-oa9-01', 'g1-oa6-01', 'g1-oa7-01', 'g1-oa8-01',
  'g1-nbt1-01', 'g1-nbt7-01', 'g1-nbt2-01', 'g1-nbt3-01', 'g1-nbt4-01', 'g1-nbt5-01', 'g1-nbt6-01',
  'g1-md1-01', 'g1-md2-01', 'g1-md3-01', 'g1-md5-01', 'g1-md4-01',
  'g1-g1-01', 'g1-g2-01', 'g1-g3-01',
];

const MOD_OA_QUESTION_IDS = [
  'g1-oa1-01', 'g1-oa1-02', 'g1-oa1-03',
  'g1-oa2-01', 'g1-oa2-02', 'g1-oa2-03',
  'g1-oa3-01', 'g1-oa3-02', 'g1-oa3-03',
  'g1-oa4-01', 'g1-oa4-02', 'g1-oa4-03',
  'g1-oa9-01', 'g1-oa9-02', 'g1-oa9-03',
  'g1-oa6-01', 'g1-oa6-02', 'g1-oa6-03', 'g1-oa6-04',
  'g1-oa7-01', 'g1-oa7-02', 'g1-oa7-03', 'g1-oa7-04',
  'g1-oa8-01', 'g1-oa8-02', 'g1-oa8-03',
];

const MOD_NBT_QUESTION_IDS = [
  'g1-nbt1-01', 'g1-nbt1-02', 'g1-nbt1-03',
  'g1-nbt7-01', 'g1-nbt7-02', 'g1-nbt7-03',
  'g1-nbt2-01', 'g1-nbt2-02', 'g1-nbt2-03',
  'g1-nbt3-01', 'g1-nbt3-02', 'g1-nbt3-03',
  'g1-nbt4-01', 'g1-nbt4-02', 'g1-nbt4-03',
  'g1-nbt5-01', 'g1-nbt5-02', 'g1-nbt5-03',
  'g1-nbt6-01', 'g1-nbt6-02', 'g1-nbt6-03',
];

const MOD_MD_QUESTION_IDS = [
  'g1-md1-01', 'g1-md1-02', 'g1-md1-03',
  'g1-md2-01', 'g1-md2-02', 'g1-md2-03',
  'g1-md3-01', 'g1-md3-02', 'g1-md3-03', 'g1-md3-04',
  'g1-md5-01', 'g1-md5-02', 'g1-md5-03', 'g1-md5-04',
  'g1-md4-01', 'g1-md4-02', 'g1-md4-03', 'g1-md4-04',
];

const MOD_G_QUESTION_IDS = [
  'g1-g1-01', 'g1-g1-02', 'g1-g1-03', 'g1-g1-04',
  'g1-g2-01', 'g1-g2-02', 'g1-g2-03', 'g1-g2-04',
  'g1-g3-01', 'g1-g3-02', 'g1-g3-03', 'g1-g3-04',
];

/** The full simulation: one item for every one of the 23 standards, so each
 *  domain carries exactly its share and a child cannot reach the passing bar
 *  without meeting a standard (it used to leave out NC.1.OA.7, NC.1.NBT.3 and
 *  NC.1.MD.1). There is no blueprint to allocate against. Every id uses the
 *  "-02" authored item so nothing here duplicates the diagnostic's "-01"
 *  items, except NC.1.MD.2, whose "-02" item is an abstract stretch question
 *  about the effect of gaps and is replaced by its plain "-03" item.
 *
 *    OA  8/23 = 34.8%  -> 8 of 23 items
 *    NBT 7/23 = 30.4%  -> 7 of 23 items
 *    MD  5/23 = 21.7%  -> 5 of 23 items
 *    G   3/23 = 13.0%  -> 3 of 23 items
 */
const MOCK_SSA_01_QUESTION_IDS = [
  // Operations & Algebraic Thinking - 8 of 8 standards
  'g1-oa1-02', 'g1-oa2-02', 'g1-oa3-02', 'g1-oa4-02', 'g1-oa9-02', 'g1-oa6-02', 'g1-oa7-02', 'g1-oa8-02',
  // Base Ten - 7 of 7 standards
  'g1-nbt1-02', 'g1-nbt7-02', 'g1-nbt2-02', 'g1-nbt3-02', 'g1-nbt4-02', 'g1-nbt5-02', 'g1-nbt6-02',
  // Measurement & Data - 5 of 5 standards
  'g1-md1-02', 'g1-md2-03', 'g1-md3-02', 'g1-md5-02', 'g1-md4-02',
  // Geometry - 3 of 3 standards
  'g1-g1-02', 'g1-g2-02', 'g1-g3-02',
];

export const GRADE_1_QUIZZES: QuizDefinition[] = [
  {
    id: 'g1-diagnostic-01',
    title: 'Baseline SSA Diagnostic Assessment',
    subtitle: (c: GradeCurriculum) =>
      `${DIAGNOSTIC_QUESTION_IDS.length}-question diagnostic covering all ${c.domains.reduce((n, d) => n + d.standards.length, 0)} Grade ${c.grade} NCSCOS standards to determine your initial baseline.`,
    isDiagnostic: true,
    timeLimitMinutes: 30,
    questionIds: DIAGNOSTIC_QUESTION_IDS,
  },
  {
    id: 'g1-mod-oa-01',
    title: 'Module 1: Addition & Subtraction Drill',
    subtitle:
      'Operations & Algebraic Thinking (8 of 23 Grade 1 standards, the largest domain in the grade): word problems within 20, three-addend sums, the commutative and associative properties, unknown-addend problems, fluency within 10, strategies within 20, the meaning of the equal sign, and finding the unknown number in an equation.',
    domainId: 'OA',
    timeLimitMinutes: 20,
    questionIds: MOD_OA_QUESTION_IDS,
  },
  {
    id: 'g1-mod-nbt-01',
    title: 'Module 2: Place Value & Base Ten to 150 Drill',
    subtitle:
      'Number & Operations in Base Ten (7 of 23 Grade 1 standards): counting to 150, reading and writing numerals to 100, tens and ones in a two-digit number, comparing two-digit numbers, adding within 100, finding 10 more or 10 less, and subtracting multiples of 10.',
    domainId: 'NBT',
    timeLimitMinutes: 20,
    questionIds: MOD_NBT_QUESTION_IDS,
  },
  {
    id: 'g1-mod-md-01',
    title: 'Module 3: Length, Time, Money & Data Drill',
    subtitle:
      'Measurement & Data (5 of 23 Grade 1 standards): ordering and measuring length, telling time to the hour and half-hour, identifying coins and relating their values to pennies, and organizing data in up to three categories.',
    domainId: 'MD',
    timeLimitMinutes: 15,
    questionIds: MOD_MD_QUESTION_IDS,
  },
  {
    id: 'g1-mod-g-01',
    title: 'Module 4: Shapes & Equal Shares Drill',
    subtitle:
      'Geometry (3 of 23 Grade 1 standards): defining and non-defining attributes of shapes, composing two- and three-dimensional shapes, and partitioning circles and rectangles into halves and fourths.',
    domainId: 'G',
    timeLimitMinutes: 10,
    questionIds: MOD_G_QUESTION_IDS,
  },
  {
    id: 'g1-mock-ssa-01',
    title: 'Full Practice Assessment (Form A)',
    subtitle: (c: GradeCurriculum) =>
      `Comprehensive ${MOCK_SSA_01_QUESTION_IDS.length}-item practice test with items allocated across domains in proportion to each domain's share of the ${c.domains.reduce((n, d) => n + d.standards.length, 0)} Grade ${c.grade} standards - there is no official state blueprint to allocate against at this grade. Benchmarked against the ${c.ssa.passingPercent}% passing bar.`,
    isMockAssessment: true,
    timeLimitMinutes: 25,
    questionIds: MOCK_SSA_01_QUESTION_IDS,
  },
];
