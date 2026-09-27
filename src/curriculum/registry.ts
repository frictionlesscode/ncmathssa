import type { Grade, GradeCurriculum, DomainId, StandardInfo } from './types';
import { GRADE_2 } from './grade2';
import { GRADE_3 } from './grade3';
import { GRADE_4 } from './grade4';
import { GRADE_5 } from './grade5';

const CURRICULA: Partial<Record<Grade, GradeCurriculum>> = {
  2: GRADE_2,
  3: GRADE_3,
  4: GRADE_4,
  5: GRADE_5,
};

export function getCurriculum(grade: Grade): GradeCurriculum {
  const c = CURRICULA[grade];
  if (!c) throw new Error(`No curriculum module for grade ${grade}`);
  return c;
}

export function listCurricula(): GradeCurriculum[] {
  return Object.values(CURRICULA).sort((a, b) => a.grade - b.grade);
}

export function standardsOf(c: GradeCurriculum): StandardInfo[] {
  return c.domains.flatMap((d) => d.standards);
}

/** Percentage weight of a domain within its grade, 0-100.
 *
 *  A domain in a weightGroup shares one published band with its siblings, so
 *  the group midpoint is divided among them by standard count. Returning the
 *  group midpoint for each member would total well over 100. */
export function domainWeight(c: GradeCurriculum, domainId: DomainId): number {
  const domain = c.domains.find((d) => d.id === domainId);
  if (!domain) return 0;
  if (c.weighting.kind === 'ncdpi-blueprint') {
    if (!domain.weightGroup) return domain.officialWeightMidpoint;
    const siblings = c.domains.filter((d) => d.weightGroup === domain.weightGroup);
    const groupStandards = siblings.reduce((n, d) => n + d.standards.length, 0);
    if (groupStandards === 0) return 0;
    return domain.officialWeightMidpoint * (domain.standards.length / groupStandards);
  }
  const total = standardsOf(c).length;
  if (total === 0) return 0;
  return (domain.standards.length / total) * 100;
}

/** The weight band as it should be shown to a reader. A grouped domain is
 *  labelled with its group, because NCDPI publishes no weight for it alone
 *  and the app presents these as official blueprint figures. */
export function weightLabel(c: GradeCurriculum, domainId: DomainId): string {
  const domain = c.domains.find((d) => d.id === domainId);
  if (!domain) return '';
  if (domain.weightGroup && domain.weightGroupLabel) {
    return `${domain.officialWeightRange} (${domain.weightGroupLabel})`;
  }
  return domain.officialWeightRange;
}

/** What to call the weight column for this grade. NCDPI publishes EOG
 *  blueprints for grades 3-8 only, so below grade 3 the figure is our own
 *  even split by standard count and must not be labelled official. */
export function weightHeading(c: GradeCurriculum): string {
  return c.weighting.kind === 'ncdpi-blueprint'
    ? 'NC Blueprint Weight'
    : 'Share of Grade Standards';
}

/** The weight VALUE to print beside weightHeading(). A blueprint grade cites
 *  its published band via weightLabel(). An unweighted grade has no band to
 *  cite, so replacing only the heading (weightHeading) and leaving the value
 *  as weightLabel() would print domain.officialWeightRange's placeholder
 *  string verbatim - a parent reading "Share of Grade Standards: No state
 *  assessment at this grade" (Ruling 21-3). This renders domainWeight()'s
 *  computed share instead, so the value always answers the heading's
 *  question with a real number. */
export function weightValue(c: GradeCurriculum, domainId: DomainId): string {
  if (c.weighting.kind === 'ncdpi-blueprint') return weightLabel(c, domainId);
  return `${Math.round(domainWeight(c, domainId))}%`;
}
