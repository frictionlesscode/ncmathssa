import type { GradeCurriculum } from '../types';
import { GRADE_5_DOMAINS } from './standards';

export { GRADE_5_DOMAINS, GRADE_5_STANDARDS, getStandardByCode, getDomainById } from './standards';

export const GRADE_5: GradeCurriculum = {
  grade: 5,
  label: 'Grade 5 Mathematics',
  ssa: { passingPercent: 80, targetsGrade: 5 },
  weighting: {
    kind: 'ncdpi-blueprint',
    source: 'NCDPI Grade 5 Mathematics EOG Assessment Blueprint',
  },
  contentComplete: true,
  domains: GRADE_5_DOMAINS,
};
