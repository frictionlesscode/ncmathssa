import { describe, it, expect } from 'vitest';
import { GRADE_4_DOMAINS } from './standards';
import { GRADE_4_STUDY_GUIDES } from './studyGuides';

const STANDARDS = GRADE_4_DOMAINS.flatMap((d) => d.standards);

/** The domain a standard belongs to, for checking a cited weight against the
 *  band that domain actually carries in `nc-eog-blueprint.json`. */
const DOMAIN_OF = new Map(
  GRADE_4_DOMAINS.flatMap((d) => d.standards.map((s) => [s.code, d] as const)),
);

/** 80% is the SSA qualifying bar and 100% is the "practice to full mastery"
 *  framing. Both are in front of every author via the plan's Global
 *  Constraints and neither is a blueprint weight, so they are removed before
 *  anything is read as a domain band (Ruling 10.4). */
const SSA_FRAMING = /\b(?:80|100)\s*%/g;

/** Every percentage figure in a sentence, as the string that was written and
 *  the numbers inside it: "30–34%" -> { matched: '30–34%', numbers: ['30','34'] }. */
function citedPercents(text: string): { matched: string; numbers: string[] }[] {
  const cleaned = text.replace(SSA_FRAMING, '');
  return [...cleaned.matchAll(/(\d+)(?:\s*[-–—]\s*(\d+))?\s*%/g)].map((m) => ({
    matched: m[0].trim(),
    numbers: [m[1], m[2]].filter((n): n is string => Boolean(n)),
  }));
}

/** The two endpoints of an `officialWeightRange` such as "30–34%". Compared as
 *  a PAIR, never as a substring of the range string: "30–34%".includes('3') is
 *  true, so a substring test would pass "Fractions are 3% of the test", and
 *  "25–29%".includes('25') would pass the point value 25% that NCDPI never
 *  published for Base Ten (its midpoint is 27). */
function bandEndpoints(range: string): [string, string] {
  const m = /^(\d+)\s*[-–—]\s*(\d+)\s*%$/.exec(range.trim());
  if (!m) throw new Error(`officialWeightRange "${range}" is not a band`);
  return [m[1], m[2]];
}

/** Ruling 10.1 binds the SENTENCE carrying the figure, not the field: "Geometry
 *  is 23–27%. Measurement and Data is tested alongside it." makes the banned
 *  single-domain claim while the field as a whole names both domains. */
function sentencesOf(text: string): string[] {
  return text.split(/(?<=[.!?])\s+/).filter((s) => s.trim().length > 0);
}

describe('grade 4 study guides', () => {
  it('writes one guide per standard, keyed by its own code', () => {
    for (const s of STANDARDS) {
      const guide = GRADE_4_STUDY_GUIDES[s.code];
      expect(guide, `no study guide for ${s.code}`).toBeTruthy();
      expect(guide.standardCode).toBe(s.code);
    }
    expect(Object.keys(GRADE_4_STUDY_GUIDES).length).toBe(STANDARDS.length);
  });

  it('fills every section of every guide', () => {
    for (const [code, g] of Object.entries(GRADE_4_STUDY_GUIDES)) {
      expect(g.title.trim().length, `${code} title`).toBeGreaterThan(0);
      expect(g.coreConcept.trim().length, `${code} coreConcept`).toBeGreaterThan(0);
      expect(g.rulesAndFormulas.length, `${code} rulesAndFormulas`).toBeGreaterThan(0);
      expect(g.stepByStepMethod.length, `${code} stepByStepMethod`).toBeGreaterThan(1);
      expect(g.commonTraps.length, `${code} commonTraps`).toBeGreaterThan(0);
      expect(g.workedExample.problem.trim().length, `${code} worked problem`).toBeGreaterThan(0);
      expect(g.workedExample.steps.length, `${code} worked steps`).toBeGreaterThan(1);
      expect(g.workedExample.answer.trim().length, `${code} worked answer`).toBeGreaterThan(0);
      expect(g.workedExample.whyItMattersForSSA.trim().length, `${code} why`).toBeGreaterThan(0);
    }
  });

  // A guide heading need NOT equal the standard's formal title - Grade 5
  // deliberately rewords some of its own (Ruling 10.3). It must still be a
  // heading a child can tell apart from the other twenty-four.
  it('gives every guide its own distinct heading', () => {
    const titles = Object.values(GRADE_4_STUDY_GUIDES).map((g) => g.title);
    expect(new Set(titles).size, 'two guides share a title').toBe(titles.length);
  });

  // Grade 5 shipped seventeen invented per-standard shares before a test
  // caught them. Every figure a guide quotes has to be the band NCDPI
  // actually published for that standard's own domain (Ruling 10.2).
  it('quotes only its own domain band, and quotes it', () => {
    for (const [code, g] of Object.entries(GRADE_4_STUDY_GUIDES)) {
      const domain = DOMAIN_OF.get(code);
      expect(domain, `${code} is not a grade 4 standard`).toBeTruthy();
      const [low, high] = bandEndpoints(domain!.officialWeightRange);
      const cited = citedPercents(g.workedExample.whyItMattersForSSA);
      expect(cited.length, `${code} cites no blueprint figure`).toBeGreaterThan(0);
      for (const { matched, numbers } of cited) {
        // The whole expression must be the band - both endpoints, in order.
        // A lone endpoint is a point value the blueprint does not publish.
        expect(
          numbers.length === 2 && numbers[0] === low && numbers[1] === high,
          `${code} cites "${matched}", which is not the ${domain!.id} band ${domain!.officialWeightRange}`,
        ).toBe(true);
      }
    }
  });

  // MD and Geometry share one 23-27% band at grade 4. The pair's figure is
  // real and citable; a figure attached to one of them alone is not, because
  // NCDPI never published it - the defect corrected in commit 6a851cf. So a
  // percentage in one of these guides must name both domains (Ruling 10.1).
  it('names both domains whenever it cites the shared MD+G band', () => {
    for (const [code, g] of Object.entries(GRADE_4_STUDY_GUIDES)) {
      const domain = DOMAIN_OF.get(code);
      if (!domain?.weightGroup) continue;
      for (const sentence of sentencesOf(g.workedExample.whyItMattersForSSA)) {
        for (const { matched } of citedPercents(sentence)) {
          expect(
            /measurement/i.test(sentence) && /geometry/i.test(sentence),
            `${code} cites "${matched}" in a sentence that does not name both ` +
              `Measurement and Geometry, which claims a weight for one domain ` +
              `inside a combined band: "${sentence.trim()}"`,
          ).toBe(true);
        }
      }
    }
  });
});
