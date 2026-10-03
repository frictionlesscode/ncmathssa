import { describe, it, expect } from 'vitest';
import { GRADE_3_DOMAINS } from './standards';
import { GRADE_3_STUDY_GUIDES } from './studyGuides';
import { GRADE_3_AUTHORED } from './authored';
import { topicName } from '../registry';

// Regression tests for docs/superpowers/audits/2026-09-30/content-g3.md.

const item = (id: string) => GRADE_3_AUTHORED.find((q) => q.id === id)!;
const guide = (code: string) => GRADE_3_STUDY_GUIDES[code];

describe('content-g3 audit: NC-R13c, no rounding standard at Grade 3', () => {
  it('Medium: no domain is named, described or shown to a parent as "rounding"', () => {
    for (const d of GRADE_3_DOMAINS) {
      const shown = [d.name, d.shortName, d.parentName ?? '', topicName(d), d.description].join(' ');
      expect(shown, d.id).not.toMatch(/round/i);
    }
    expect(GRADE_3_DOMAINS.find((d) => d.id === 'NBT')!.parentName).toBe('Adding, subtracting & multiples of 10');
  });
});

describe('content-g3 audit: authored items', () => {
  it('Medium g3-md1-01: the hour hand at 2:43 is most of the way to the 3', () => {
    const q = item('g3-md1-01');
    expect(q.options.find((o) => o.isCorrect)!.text).toBe('2:43');
    expect(q.promptDetails).toMatch(/most of the way to the 3/);
    expect(q.promptDetails).not.toMatch(/a little way past the 2/);
  });

  it('Medium g3-oa9-03: the two rows are printed to the same number, so the claim can be checked', () => {
    const p = item('g3-oa9-03').prompt;
    const row3 = /row for 3 reads ([\d, ]+),/.exec(p)![1].split(',').map((n) => Number(n.trim()));
    const row6 = /row for 6 reads ([\d, ]+)\./.exec(p)![1].split(',').map((n) => Number(n.trim()));
    expect(Math.max(...row3)).toBe(Math.max(...row6));
    for (const n of row6) expect(row3, `${n} is in the row for 6 but not printed in the row for 3`).toContain(n);
  });

});

describe('content-g3 audit: study guides', () => {
  it('High NBT.3: 50 is 5 tens, so no guide text says it holds a single ten', () => {
    const text = JSON.stringify(guide('NC.3.NBT.3'));
    expect(text).not.toMatch(/holds a single ten|contains only one ten|only one ten|because one ten/i);
    expect(guide('NC.3.NBT.3').rulesAndFormulas.some((r) => /one zero/i.test(r.label + r.detail))).toBe(true);
  });

  it('Medium OA.2: 10 is not a single digit', () => {
    expect(guide('NC.3.OA.2').coreConcept).not.toMatch(/single digits, 10 or less/);
  });

  it('Medium OA.9: the row for 4 repeats its ones digits every FIVE steps', () => {
    const trap = guide('NC.3.OA.9').commonTraps.find((t) => /ones digits start over/.test(t))!;
    expect(trap).toMatch(/after five steps/);
    // 4, 8, 12, 16, 20, 24: the ones digits 4, 8, 2, 6, 0 then 4 again.
    const ones = [1, 2, 3, 4, 5, 6].map((k) => (4 * k) % 10);
    expect(ones[5]).toBe(ones[0]);
  });

  it('Medium: no whyItMattersForSSA states an unsourced statistic about the EOG as fact', () => {
    const unsourced =
      /most[- ]missed|practically every|every year|asks? (?:about )?most often|almost always|nearly (?:all|every)|single most common|hardest (?:questions?|thing)|practise least|show(?:s)? up right across|all through|least class time|worth more marks/i;
    for (const [code, g] of Object.entries(GRADE_3_STUDY_GUIDES)) {
      expect(g.workedExample.whyItMattersForSSA, code).not.toMatch(unsourced);
    }
  });

  it('Low: American spelling, and a crayon is not 5 inches long', () => {
    const all = JSON.stringify(GRADE_3_STUDY_GUIDES);
    expect(all).not.toMatch(/favourite|practise/i);
    expect(all).not.toMatch(/crayon is about 5 inches/);
  });
});
