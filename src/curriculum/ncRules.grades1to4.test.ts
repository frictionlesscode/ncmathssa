import { describe, it, expect } from 'vitest';
import { getCurriculum } from './registry';
import type { Grade } from './types';
import type { Question } from '../engine/questionModel';

// NC rules NC-R12a/b, NC-R13a/b/c and NC-R14 from
// docs/superpowers/audits/2026-09-30/nc-rules.md, checked over every authored
// question and 200 instances of every generator. Plan C generalises this into
// the full rules suite; these are the grade 1 to 4 rules Plan B1 applies.

const SEEDS = 200;

function everyQuestion(grade: Grade): Question[] {
  const c = getCurriculum(grade);
  const out: Question[] = [];
  for (const s of c.domains.flatMap((d) => d.standards)) {
    for (const ref of c.source.authoredFor(s.code)) out.push(c.source.resolve(ref));
  }
  for (const t of c.source.templates()) {
    for (let seed = 0; seed < SEEDS; seed++) {
      out.push(c.source.resolve({ kind: 'generated', templateId: t.id, seed }));
    }
  }
  return out;
}

/** What the child is asked and what the key says. Distractors and worked steps
 *  may name other denominators (a wrong answer, a common denominator). */
const asked = (q: Question) => `${q.prompt} ${q.promptDetails ?? ''} ${q.options.find((o) => o.isCorrect)!.text}`;

const denominatorsIn = (text: string) => [...text.matchAll(/\b(\d+)\s*\/\s*(\d+)\b/g)].map((m) => Number(m[2]));

describe('NC-R12a: Grade 4 fraction denominators', () => {
  const ALLOWED = [2, 3, 4, 5, 6, 8, 10, 12, 100];
  it('every fraction a Grade 4 fraction question asks or keys has a denominator in {2, 3, 4, 5, 6, 8, 10, 12, 100}', () => {
    for (const q of everyQuestion(4).filter((x) => x.standardCode.startsWith('NC.4.NF'))) {
      for (const d of denominatorsIn(asked(q))) {
        expect(ALLOWED, `${q.id}: denominator ${d} in "${asked(q)}"`).toContain(d);
      }
    }
  });

  it('g4-nf4-02: sevenths are gone', () => {
    const q = getCurriculum(4).source.resolve({ kind: 'authored', id: 'g4-nf4-02' });
    expect(asked(q)).not.toMatch(/\/7|\/21/);
    expect(q.contentVersion).toBe(2);
  });
});

describe('NC-R12b: Grade 4 whole numbers stop at 100,000', () => {
  it('no Grade 4 base-ten question asks a number above 100,000', () => {
    for (const q of everyQuestion(4).filter((x) => x.standardCode.startsWith('NC.4.NBT'))) {
      for (const m of `${q.prompt} ${q.promptDetails ?? ''}`.matchAll(/\b\d{1,3}(?:,\d{3})+\b|\b\d{4,}\b/g)) {
        expect(Number(m[0].replace(/,/g, '')), `${q.id}: ${m[0]}`).toBeLessThanOrEqual(100000);
      }
    }
  });
});

describe('NC-R13a: Grade 3 fraction denominators', () => {
  it('every fraction a Grade 3 fraction question asks or keys has a denominator in {2, 3, 4, 6, 8}', () => {
    for (const q of everyQuestion(3).filter((x) => x.standardCode.startsWith('NC.3.NF'))) {
      for (const d of denominatorsIn(asked(q))) {
        expect([2, 3, 4, 6, 8], `${q.id}: denominator ${d} in "${asked(q)}"`).toContain(d);
      }
    }
  });
});

describe('NC-R13b: Grade 3 equivalence and comparison use related families only', () => {
  it('g3-nf4-03: NC-R13b every NF.3 and NF.4 question stays inside {2, 4, 8} or inside {3, 6}', () => {
    for (const q of everyQuestion(3).filter((x) => x.standardCode === 'NC.3.NF.3' || x.standardCode === 'NC.3.NF.4')) {
      const dens = denominatorsIn(asked(q));
      const inFamily = (family: number[]) => dens.every((d) => family.includes(d));
      expect(inFamily([2, 4, 8]) || inFamily([3, 6]), `${q.id}: ${dens.join(', ')} in "${asked(q)}"`).toBe(true);
    }
  });
});

describe('NC-R13b: g3-nf4-03', () => {
  it('g3-nf4-03: NC-R13b compares fourths with eighths, not sixths, and bumps its version', () => {
    const q = getCurriculum(3).source.resolve({ kind: 'authored', id: 'g3-nf4-03' });
    expect(q.prompt).toMatch(/3\/4 or 3\/8/);
    expect(q.options.find((o) => o.isCorrect)!.text).toMatch(/fourths are longer steps than eighths/);
    expect(`${q.prompt} ${q.options.map((o) => o.text).join(' ')}`).not.toMatch(/sixths|\b\d+\/6\b/);
    expect(q.contentVersion).toBe(2);
  });
});

describe('NC-R13c: Grade 3 has no rounding standard', () => {
  it('no Grade 3 question asks a child to round', () => {
    for (const q of everyQuestion(3)) {
      const text = `${q.prompt} ${q.promptDetails ?? ''} ${q.options.map((o) => o.text).join(' ')}`;
      expect(text, q.id).not.toMatch(/\bround(?:s|ed|ing)?\b/i);
    }
  });
});

describe('NC-R14: Grade 1 addition stays within 100', () => {
  it('every NC.1.NBT.4 key is at most 100', () => {
    for (const q of everyQuestion(1).filter((x) => x.standardCode === 'NC.1.NBT.4')) {
      expect(Number(q.options.find((o) => o.isCorrect)!.text), q.id).toBeLessThanOrEqual(100);
    }
  });
});
