import { describe, it, expect } from 'vitest';
import { getCurriculum, listCurricula } from './registry';
import { masteryByStandard } from '../engine/mastery';
import type { QuizAttempt } from '../types';
import type { Question } from '../engine/questionModel';
import { GRADE_1_STUDY_GUIDES } from './grade1/studyGuides';
import { MISCONCEPTIONS } from './misconceptions';

// NC-R2 (docs/superpowers/audits/2026-09-30/nc-rules.md): "North Carolina has
// adopted the exclusive definition for a trapezoid. A trapezoid is a
// quadrilateral with exactly one pair of parallel sides." Identical note in
// the NC DPI unpacking documents for grades 1 to 5. No parallelogram,
// rectangle, rhombus or square is a trapezoid. This sweep is what would have
// caught the inclusive definition being taught in three grades at once.

const INCLUSIVE = /at least (?:one|1) pair of parallel/i;
const CALLS_A_PARALLELOGRAM_A_TRAPEZOID =
  /(?:parallelograms?|rectangles?|rhombus(?:es)?|squares?)\s+(?:is|are)\s+(?:also\s+)?(?:a\s+|an\s+)?trapezoids?/i;

function everyQuestion(): Question[] {
  const out: Question[] = [];
  for (const c of listCurricula()) {
    for (const d of c.domains) {
      for (const s of d.standards) {
        for (const ref of c.source.authoredFor(s.code)) out.push(c.source.resolve(ref));
      }
    }
    for (const t of c.source.templates()) {
      for (let seed = 0; seed < 30; seed++) out.push(c.source.resolve({ kind: 'generated', templateId: t.id, seed }));
    }
  }
  return out;
}

describe('NC-R2: the trapezoid is exclusive in every grade', () => {
  it('no key, explanation or concept summary teaches the inclusive definition', () => {
    for (const q of everyQuestion()) {
      const key = q.options.find((o) => o.isCorrect)!.text;
      const taught = [q.prompt.replace(/"[^"]*"/g, ''), key, ...q.explanation.stepByStep, q.explanation.conceptSummary].join(' ');
      expect(INCLUSIVE.test(taught), `${q.id} teaches the inclusive trapezoid definition`).toBe(false);
      expect(CALLS_A_PARALLELOGRAM_A_TRAPEZOID.test(taught), `${q.id} calls a parallelogram a trapezoid`).toBe(false);
    }
  });

  it('no study guide teaches it outside a "common trap" warning, and each guide that defines one says exactly one pair', () => {
    for (const c of listCurricula()) {
      for (const [code, g] of Object.entries(c.studyGuides)) {
        const taught = JSON.stringify({ ...g, commonTraps: [] });
        expect(INCLUSIVE.test(taught), `${code} teaches the inclusive trapezoid definition`).toBe(false);
        expect(CALLS_A_PARALLELOGRAM_A_TRAPEZOID.test(taught), `${code} calls a parallelogram a trapezoid`).toBe(false);
        const defines = g.rulesAndFormulas.find((r) => /^trapezoid/i.test(r.label));
        if (defines) expect(defines.detail, code).toMatch(/exactly (?:one|1) pair/i);
      }
    }
  });

  it('every trap that mentions the inclusive wording also says the NC rule', () => {
    for (const c of listCurricula()) {
      for (const [code, g] of Object.entries(c.studyGuides)) {
        for (const trap of g.commonTraps.filter((t) => INCLUSIVE.test(t))) {
          expect(trap, `${code}`).toMatch(/exactly (?:one|1) pair/i);
        }
      }
    }
  });

  it('no standard keyConcept states the inclusive definition', () => {
    for (const c of listCurricula()) {
      for (const d of c.domains) {
        for (const s of d.standards) {
          expect(INCLUSIVE.test(s.keyConcepts.join(' ')), s.code).toBe(false);
        }
      }
    }
  });

  it('the grades that name trapezoids still say so in their study guides', () => {
    // Grade 1 names trapezoids as a shape to build, without defining them.
    expect(JSON.stringify(GRADE_1_STUDY_GUIDES['NC.1.G.1'])).not.toMatch(INCLUSIVE);
    for (const [grade, code] of [[3, 'NC.3.G.1'], [4, 'NC.4.G.2'], [5, 'NC.5.G.3']] as const) {
      const c = listCurricula().find((x) => x.grade === grade)!;
      expect(JSON.stringify(c.studyGuides[code]), `grade ${grade}`).toMatch(/exactly (?:one|1) pair/i);
    }
  });

  it('the registry keeps the inclusive slip and no longer describes the exclusive one as a slip', () => {
    expect(MISCONCEPTIONS['inclusive-trapezoid-definition']?.description).toMatch(/at least one pair/i);
    expect(MISCONCEPTIONS['exclusive-trapezoid-definition']).toBeUndefined();
  });
});

// Spec 3.3: the three items whose key flipped are version 2, so an answer a
// child gave under the old key (stored with no version, meaning 1) stops
// counting toward mastery, and an answer recorded under the new key counts.
describe('NC-R2: answers recorded against the inclusive key stop counting', () => {
  const cases = [
    [3, 'g3-g1-05', 'NC.3.G.1'],
    [4, 'g4-g2-02', 'NC.4.G.2'],
    [5, 'g3-02', 'NC.5.G.3'],
  ] as const;
  const attemptWith = (id: string, code: string, contentVersion?: number): QuizAttempt => ({
    id: 'a', quizId: 'q', quizTitle: 't', completedAt: '2026-09-30T12:00:00.000Z',
    scoreRaw: 1, scoreTotal: 1, scorePercent: 100, isPassingSSA: true, timeElapsedSeconds: 1,
    answers: {
      [id]: { questionId: id, studentAnswer: 'A', isCorrect: true, standardCode: code, ...(contentVersion ? { contentVersion } : {}) },
    },
  });

  it.each(cases)('grade %s %s: a version-less answer is ignored and a version 2 answer counts', (grade, id, code) => {
    const c = getCurriculum(grade);
    expect(c.source.versionOf({ kind: 'authored', id })).toBe(2);
    expect(masteryByStandard([attemptWith(id, code)], c).get(code)!.total).toBe(0);
    expect(masteryByStandard([attemptWith(id, code, 2)], c).get(code)!.total).toBe(1);
  });
});
