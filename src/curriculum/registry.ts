import type { Grade, GradeCurriculum, DomainId, StandardInfo, DomainInfo } from './types';
import { GRADE_1 } from './grade1';
import { GRADE_2 } from './grade2';
import { GRADE_3 } from './grade3';
import { GRADE_4 } from './grade4';
import { GRADE_5 } from './grade5';

const CURRICULA: Partial<Record<Grade, GradeCurriculum>> = {
  1: GRADE_1,
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
 *  question with a real number.
 *
 *  Agrees with weightLabel() on an unknown domain: both return '' rather
 *  than one of them inventing a "0%" that reads as a real, if tiny, weight
 *  (Finding F9). */
export function weightValue(c: GradeCurriculum, domainId: DomainId): string {
  const domain = c.domains.find((d) => d.id === domainId);
  if (!domain) return '';
  if (c.weighting.kind === 'ncdpi-blueprint') return weightLabel(c, domainId);
  return `${Math.round(domainWeight(c, domainId))}%`;
}

/** The compact, one-line form for tight spots that cannot fit weightLabel()'s
 *  full "(Measurement & Data and Geometry combined)" wording without
 *  breaking layout: CurriculumView's domain filter pills, Dashboard's domain
 *  card badges, and QuizzesListView's module-drill badges (Finding F1). A
 *  domain outside a weightGroup renders exactly what weightValue() already
 *  gives ("17%", "39–43%") - Grade 1-2 values are unaffected. A grouped
 *  domain still marks the band as shared ("with G"/"with MD") instead of
 *  repeating the bare band as if it belonged to this domain alone; the full
 *  wording stays available via weightLabel()/weightValue() wherever there is
 *  room, and may be surfaced here as a `title` attribute by the caller. */
export function weightCompactLabel(c: GradeCurriculum, domainId: DomainId): string {
  const domain = c.domains.find((d) => d.id === domainId);
  if (!domain) return '';
  if (!domain.weightGroup) return weightValue(c, domainId);
  const otherIds = c.domains
    .filter((d) => d.weightGroup === domain.weightGroup && d.id !== domain.id)
    .map((d) => d.id);
  return `${domain.officialWeightRange} with ${otherIds.join(' & ')}`;
}

/** The parent-facing name of a topic (domain): plain words, never a code. */
export function topicName(domain: DomainInfo): string {
  return domain.parentName ?? domain.shortName;
}
