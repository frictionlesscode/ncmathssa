export type Grade = 1 | 2 | 3 | 4 | 5;

/** A domain key such as 'NF'. Deliberately a string, not a union:
 *  grades 1-2 have no Fractions domain and grades 6+ use different
 *  domains entirely. Validity is asserted by the integrity test. */
export type DomainId = string;

/** A standard code such as 'NC.5.NF.1'. */
export type StandardCode = string;

export interface StandardInfo {
  code: StandardCode;
  domainId: DomainId;
  title: string;
  description: string;
  weightCategory: string;
  keyConcepts: string[];
}

export interface DomainInfo {
  id: DomainId;
  name: string;
  shortName: string;
  /** The published band, e.g. '19–23%'. When this domain belongs to a
   *  weightGroup the band describes the GROUP, not this domain alone -
   *  render it through weightLabel() so the reader is told so. */
  officialWeightRange: string;
  /** Midpoint of officialWeightRange. Group-wide when weightGroup is set. */
  officialWeightMidpoint: number;
  /** NCDPI weights some domains as one band (grades 3-5 combine
   *  Measurement & Data with Geometry). Domains sharing a weightGroup share
   *  one published band; no member has a weight of its own to cite. */
  weightGroup?: string;
  /** Prose naming the members of the group, for display. */
  weightGroupLabel?: string;
  description: string;
  color: string;
  badgeBg: string;
  standards: StandardInfo[];
}

/**
 * NCDPI publishes EOG blueprints for grades 3-8 only. Grades 1-2 have no
 * state assessment, so there is no official weight to cite and the UI must
 * not imply one exists.
 */
export type Weighting =
  | { kind: 'ncdpi-blueprint'; source: string }
  | { kind: 'even-by-standard-count' };

import type { QuestionSource } from '../engine/questionSource';

export interface GradeCurriculum {
  grade: Grade;
  label: string;
  ssa: {
    /** WCPSS SSA policy figure; per-grade, not a global constant. */
    passingPercent: number;
    /** Mastering this curriculum accelerates past this grade. */
    targetsGrade: number;
  };
  weighting: Weighting;
  /** Gates the coverage assertion in the integrity test. Flip to true
   *  only when every standard in this grade has at least one source. */
  contentComplete: boolean;
  domains: DomainInfo[];
  source: QuestionSource;
}
