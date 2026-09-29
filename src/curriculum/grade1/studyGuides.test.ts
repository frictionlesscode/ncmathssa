import { describe, it, expect } from 'vitest';
import { GRADE_1_DOMAINS } from './standards';
import { GRADE_1_STUDY_GUIDES } from './studyGuides';
import { assertGradeOneReadable, GRADE_1_G_VOCAB_ALLOWLIST } from '../authoredBank.testkit';

const STANDARDS = GRADE_1_DOMAINS.flatMap((d) => d.standards);

/** The domain a standard belongs to, for checking its whyItMattersForSSA
 *  cites that domain's own share of the grade's 23 standards. */
const DOMAIN_OF = new Map(
  GRADE_1_DOMAINS.flatMap((d) => d.standards.map((s) => [s.code, d] as const)),
);

describe('grade 1 study guides', () => {
  it('writes one guide per standard, keyed by its own code', () => {
    for (const s of STANDARDS) {
      const guide = GRADE_1_STUDY_GUIDES[s.code];
      expect(guide, `no study guide for ${s.code}`).toBeTruthy();
      expect(guide.standardCode).toBe(s.code);
    }
    expect(Object.keys(GRADE_1_STUDY_GUIDES).length).toBe(STANDARDS.length);
  });

  // A bare array-length check passes on [''] or a whitespace-only element, so
  // every element gets its own .trim().length check too (Grade 2's ruling
  // 20-2 pattern).
  it('fills every section of every guide', () => {
    for (const [code, g] of Object.entries(GRADE_1_STUDY_GUIDES)) {
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

  // A guide heading need not repeat the standard's formal title, but a
  // parent has to be able to tell twenty-three guides apart in a list.
  it('gives every guide its own distinct heading', () => {
    const titles = Object.values(GRADE_1_STUDY_GUIDES).map((g) => g.title);
    expect(new Set(titles).size, 'two guides share a title').toBe(titles.length);
  });

  // Ruling 25-1: Grade 1 has no NCDPI blueprint (NCDPI publishes no blueprint
  // below Grade 3), so no guide may cite a percentage anywhere - not even
  // outside whyItMattersForSSA - and none may claim a blueprint exists. The
  // percentage check scans the WHOLE guide via JSON.stringify, not one
  // field, so a fabricated weight hiding in coreConcept or a trap is caught
  // too, and it also catches a spelled-out weight like "about 35 percent".
  it('cites no assessment weight, because grade 1 has no state assessment', () => {
    for (const [code, g] of Object.entries(GRADE_1_STUDY_GUIDES)) {
      const whole = JSON.stringify(g);
      expect(/%|per\s?cent/i.test(whole), `${code} cites a percentage somewhere in the guide`).toBe(false);
      expect(/blueprint/i.test(whole), `${code} mentions a blueprint`).toBe(false);
    }
  });

  // Ruling 25-2: whyItMattersForSSA must cite a real figure - for Grade 1
  // that is the domain's share of the grade's 23 standards, given as a COUNT
  // (OA 8 of 23, NBT 7 of 23, MD 5 of 23, G 3 of 23) rather than a
  // percentage, so the guard above stays green.
  it('states its own domain’s share of the 23 standards in whyItMattersForSSA', () => {
    for (const [code, g] of Object.entries(GRADE_1_STUDY_GUIDES)) {
      const domain = DOMAIN_OF.get(code);
      expect(domain, `${code} is not a grade 1 standard`).toBeTruthy();
      const expected = `${domain!.standards.length} of the ${STANDARDS.length}`;
      expect(
        g.workedExample.whyItMattersForSSA.includes(expected),
        `${code} whyItMattersForSSA does not contain "${expected}"`,
      ).toBe(true);
    }
  });

  // Fix 2a (whole-branch review, polish): assertGradeOneReadable already
  // guards every authored bank and every template; the study guides' own
  // worked-example prompts were only ever checked by an uncommitted script.
  it('keeps every worked example readable for a six-year-old', () => {
    assertGradeOneReadable(
      Object.entries(GRADE_1_STUDY_GUIDES).map(([code, g]) => ({
        id: code,
        prompt: g.workedExample.problem,
      })),
      { allowlist: GRADE_1_G_VOCAB_ALLOWLIST },
    );
  });
});
