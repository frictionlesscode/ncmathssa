import { describe, it, expect } from 'vitest';
import { GRADE_3_DOMAINS } from './standards';
import { METRIC_UNIT } from './metricGuard';
import { GRADE_3_STUDY_GUIDES } from './studyGuides';
import type { StudyGuideSection } from '../../types';

const STANDARDS = GRADE_3_DOMAINS.flatMap((d) => d.standards);

/** The domain a standard belongs to, for checking a cited weight against the
 *  band that domain actually carries in `nc-eog-blueprint.json`. */
const DOMAIN_OF = new Map(
  GRADE_3_DOMAINS.flatMap((d) => d.standards.map((s) => [s.code, d] as const)),
);

/** 80% is the WCPSS Single Subject Acceleration qualifying bar and 100% is the
 *  "practice to full mastery" framing. Both are in front of every author via
 *  the plan's Global Constraints and neither is a blueprint weight, so they
 *  are removed before anything is read as a domain band (Ruling 15-1, and the
 *  same carve-out grade 4 needed). */
const SSA_FRAMING = /\b(?:80|100)\s*%/g;

/** Every percentage figure in a piece of text, as the string that was written
 *  and the numbers inside it: "32–36%" -> { matched: '32–36%', numbers: ['32','36'] }. */
function citedPercents(text: string): { matched: string; numbers: string[] }[] {
  const cleaned = text.replace(SSA_FRAMING, '');
  return [...cleaned.matchAll(/(\d+)(?:\s*[-–—]\s*(\d+))?\s*%/g)].map((m) => ({
    matched: m[0].trim(),
    numbers: [m[1], m[2]].filter((n): n is string => Boolean(n)),
  }));
}

/** The two endpoints of an `officialWeightRange` such as "32–36%", compared as
 *  a PAIR and never as a substring of the range string: "32–36%".includes('3')
 *  is true, so a substring test would pass "Fractions are 3% of the test".
 *  Note the EN DASH (U+2013) the blueprint and `standards.ts` both use - a
 *  literal written with a hyphen does not match either of them. */
function bandEndpoints(range: string): [string, string] {
  const m = /^(\d+)\s*[-–—]\s*(\d+)\s*%$/.exec(range.trim());
  if (!m) throw new Error(`officialWeightRange "${range}" is not a band`);
  return [m[1], m[2]];
}

/** Ruling 15-1 binds the CLAUSE carrying the figure, not the field: "Geometry
 *  is 23–27% of the EOG. Measurement and Data is tested alongside it." makes
 *  the banned single-domain claim while the field as a whole names both
 *  domains. A semicolon joins two independent clauses exactly as a period
 *  does, so it splits here too. */
function clausesOf(text: string): string[] {
  return text.split(/\s*;\s*|(?<=[.!?])\s+/).filter((s) => s.trim().length > 0);
}

/** Every string a guide prints, for the sweeps that must see all of it. */
function allText(g: StudyGuideSection): string[] {
  return [
    g.title,
    g.coreConcept,
    ...g.rulesAndFormulas.flatMap((r) => [r.label, r.detail]),
    ...g.stepByStepMethod,
    ...g.commonTraps,
    g.workedExample.problem,
    ...g.workedExample.steps,
    g.workedExample.answer,
    g.workedExample.whyItMattersForSSA,
  ];
}

describe('grade 3 study guides', () => {
  it('writes one guide per standard, keyed by its own code', () => {
    for (const s of STANDARDS) {
      const guide = GRADE_3_STUDY_GUIDES[s.code];
      expect(guide, `no study guide for ${s.code}`).toBeTruthy();
      expect(guide.standardCode).toBe(s.code);
    }
    expect(Object.keys(GRADE_3_STUDY_GUIDES).length).toBe(STANDARDS.length);
  });

  // Ruling 15-2: a length check alone passes on [{ label: '', detail: '' }]
  // and on [''], so every element is checked for content of its own.
  it('fills every section of every guide', () => {
    for (const [code, g] of Object.entries(GRADE_3_STUDY_GUIDES)) {
      expect(g.title.trim().length, `${code} title`).toBeGreaterThan(0);
      expect(g.coreConcept.trim().length, `${code} coreConcept`).toBeGreaterThan(0);

      expect(g.rulesAndFormulas.length, `${code} rulesAndFormulas`).toBeGreaterThan(0);
      g.rulesAndFormulas.forEach((r, i) => {
        expect(r.label.trim().length, `${code} rulesAndFormulas[${i}].label`).toBeGreaterThan(0);
        expect(r.detail.trim().length, `${code} rulesAndFormulas[${i}].detail`).toBeGreaterThan(0);
      });

      expect(g.stepByStepMethod.length, `${code} stepByStepMethod`).toBeGreaterThan(1);
      g.stepByStepMethod.forEach((s, i) => {
        expect(s.trim().length, `${code} stepByStepMethod[${i}]`).toBeGreaterThan(0);
      });

      expect(g.commonTraps.length, `${code} commonTraps`).toBeGreaterThan(0);
      g.commonTraps.forEach((t, i) => {
        expect(t.trim().length, `${code} commonTraps[${i}]`).toBeGreaterThan(0);
      });

      expect(g.workedExample.problem.trim().length, `${code} worked problem`).toBeGreaterThan(0);
      expect(g.workedExample.steps.length, `${code} worked steps`).toBeGreaterThan(1);
      g.workedExample.steps.forEach((s, i) => {
        expect(s.trim().length, `${code} worked steps[${i}]`).toBeGreaterThan(0);
      });
      expect(g.workedExample.answer.trim().length, `${code} worked answer`).toBeGreaterThan(0);
      expect(g.workedExample.whyItMattersForSSA.trim().length, `${code} why`).toBeGreaterThan(0);
    }
  });

  // A guide heading need not repeat the standard's formal title, but a child
  // has to be able to tell twenty guides apart in a list.
  it('gives every guide its own distinct heading', () => {
    const titles = Object.values(GRADE_3_STUDY_GUIDES).map((g) => g.title);
    expect(new Set(titles).size, 'two guides share a title').toBe(titles.length);
  });

  // Grade 5 shipped seventeen invented per-standard shares before a test
  // caught them. Every figure a guide quotes has to be the band NCDPI
  // actually published for that standard's own domain.
  it('quotes only its own domain band, and quotes it', () => {
    for (const [code, g] of Object.entries(GRADE_3_STUDY_GUIDES)) {
      const domain = DOMAIN_OF.get(code);
      expect(domain, `${code} is not a grade 3 standard`).toBeTruthy();
      const [low, high] = bandEndpoints(domain!.officialWeightRange);
      const cited = citedPercents(g.workedExample.whyItMattersForSSA);
      expect(cited.length, `${code} cites no blueprint figure`).toBeGreaterThan(0);
      for (const { matched, numbers } of cited) {
        // The whole matched expression must be the band - both endpoints, in
        // order. A lone endpoint is a point value the blueprint never publishes.
        expect(
          numbers.length === 2 && numbers[0] === low && numbers[1] === high,
          `${code} cites "${matched}", which is not the ${domain!.id} band ${domain!.officialWeightRange}`,
        ).toBe(true);
      }
    }
  });

  // Measurement & Data and Geometry share ONE 23–27% band at grade 3. The
  // pair's figure is published and citable; a figure attached to one of them
  // alone is not. So the test checks ATTRIBUTION, not presence (Ruling 15-1):
  // a percentage in one of these seven guides must sit in a clause that names
  // both domains.
  it('names both domains whenever it cites the shared MD+G band', () => {
    for (const [code, g] of Object.entries(GRADE_3_STUDY_GUIDES)) {
      const domain = DOMAIN_OF.get(code);
      if (!domain?.weightGroup) continue;
      for (const clause of clausesOf(g.workedExample.whyItMattersForSSA)) {
        for (const { matched } of citedPercents(clause)) {
          expect(
            /measurement/i.test(clause) && /geometry/i.test(clause),
            `${code} cites "${matched}" in a clause that does not name both ` +
              `Measurement and Geometry, which claims a weight for one domain ` +
              `inside a combined band: "${clause.trim()}"`,
          ).toBe(true);
        }
      }
    }
  });

  // Ruling 14-1: NC.3.MD.2 is CUSTOMARY measurement. Grams, liters and
  // centimeters are Common Core 3.MD.A.2's vocabulary and NC's metric work is
  // grade 4's NC.4.MD.1. The item banks are guarded against metric units by
  // ./metricGuard.ts; a study guide teaching the metric version of a standard
  // whose items can never use it would be the same defect one file over, so
  // the same pattern guards every string of every grade 3 guide.
  it('teaches no metric unit anywhere', () => {
    for (const [code, g] of Object.entries(GRADE_3_STUDY_GUIDES)) {
      for (const text of allText(g)) {
        const hit = METRIC_UNIT.exec(text);
        expect(
          hit,
          `${code} prints the metric unit "${hit?.[0]}" - grade 3 NC measurement is customary: "${text}"`,
        ).toBeNull();
      }
    }
  });
});
