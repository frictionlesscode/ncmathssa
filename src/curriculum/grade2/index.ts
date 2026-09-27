import type { GradeCurriculum } from '../types';
import { GRADE_2_DOMAINS } from './standards';
import { makeQuestionSource } from '../../engine/questionSource';
import { GRADE_2_AUTHORED } from './authored';
import { GRADE_2_TEMPLATES } from './templates';
import { GRADE_2_STUDY_GUIDES } from './studyGuides';
import { GRADE_2_QUIZZES } from './quizzes';

export { GRADE_2_DOMAINS, GRADE_2_STANDARDS, getStandardByCode, getDomainById } from './standards';

export const GRADE_2: GradeCurriculum = {
  grade: 2,
  label: 'Grade 2 Mathematics',
  ssa: { passingPercent: 80, targetsGrade: 2 },
  // NCDPI publishes no EOG blueprint below grade 3; there is no state
  // assessment to weight against, so domains share weight by standard count.
  weighting: { kind: 'even-by-standard-count' },
  contentComplete: true,
  domains: GRADE_2_DOMAINS,
  studyGuides: GRADE_2_STUDY_GUIDES,
  quizzes: GRADE_2_QUIZZES,
  source: makeQuestionSource(GRADE_2_AUTHORED, GRADE_2_TEMPLATES),
};
