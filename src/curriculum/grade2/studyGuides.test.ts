import { describe, it, expect } from 'vitest';
import { GRADE_2_DOMAINS } from './standards';
import { GRADE_2_STUDY_GUIDES } from './studyGuides';

const STANDARDS = GRADE_2_DOMAINS.flatMap((d) => d.standards);

/** The domain a standard belongs to, for checking its whyItMattersForSSA
 *  cites that domain's own share of the grade's 23 standards. */
const DOMAIN_OF = new Map(
  GRADE_2_DOMAINS.flatMap((d) => d.standards.map((s) => [s.code, d] as const)),
);

describe('grade 2 study guides', () => {
  it('writes one guide per standard, keyed by its own code', () => {
    for (const s of STANDARDS) {
      const guide = GRADE_2_STUDY_GUIDES[s.code];
      expect(guide, `no study guide for ${s.code}`).toBeTruthy();
      expect(guide.standardCode).toBe(s.code);
    }
    expect(Object.keys(GRADE_2_STUDY_GUIDES).length).toBe(STANDARDS.length);
  });

  // Ruling 20-2: a bare array-length check passes on [''] or
  // [{ label: '', detail: '' }] — a whitespace-only element. Every element
  // gets its own .trim().length check too.
  it('fills every section of every guide', () => {
    for (const [code, g] of Object.entries(GRADE_2_STUDY_GUIDES)) {
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
  // has to be able to tell twenty-three guides apart in a list (Grade 3's
  // sibling test does the same).
  it('gives every guide its own distinct heading', () => {
    const titles = Object.values(GRADE_2_STUDY_GUIDES).map((g) => g.title);
    expect(new Set(titles).size, 'two guides share a title').toBe(titles.length);
  });

  // Ruling 20-1: Grade 2 has no NCDPI blueprint, so no guide may cite a
  // percentage anywhere — not even outside whyItMattersForSSA — and none may
  // claim one exists via the word "blueprint". Ruling 20-3: the percentage
  // check scans the WHOLE guide via JSON.stringify, not one field, so a
  // fabricated weight hiding in coreConcept or a trap is caught too. M2: the
  // guard also catches a spelled-out weight like "about 35 percent", which a
  // bare /%/ test would miss.
  it('cites no assessment weight, because grade 2 has no state assessment', () => {
    for (const [code, g] of Object.entries(GRADE_2_STUDY_GUIDES)) {
      const whole = JSON.stringify(g);
      expect(/%|per\s?cent/i.test(whole), `${code} cites a percentage somewhere in the guide`).toBe(false);
      expect(/blueprint/i.test(whole), `${code} mentions a blueprint`).toBe(false);
    }
  });

  // M1 (Task 20 fix round 1): ruling 20-1's own figure was unguarded — a
  // guide could drop "N of 23" or cite the wrong domain's count and every
  // other test would stay green. Each guide must state its own domain's
  // exact share of the grade's 23 standards.
  it('states its own domain’s share of the 23 standards in whyItMattersForSSA', () => {
    for (const [code, g] of Object.entries(GRADE_2_STUDY_GUIDES)) {
      const domain = DOMAIN_OF.get(code);
      expect(domain, `${code} is not a grade 2 standard`).toBeTruthy();
      const expected = `${domain!.standards.length} of the ${STANDARDS.length}`;
      expect(
        g.workedExample.whyItMattersForSSA.includes(expected),
        `${code} whyItMattersForSSA does not contain "${expected}"`,
      ).toBe(true);
    }
  });
});
