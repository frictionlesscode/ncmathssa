import { describe, it, expect } from 'vitest';
import { GRADE_5 } from './index';
import { GRADE_5_AUTHORED } from './authored';
import { GRADE_5_STUDY_GUIDES } from './studyGuides';
import { GRADE_5_DOMAINS } from './standards';
import type { Question } from '../../engine/questionModel';
import type { StudyGuideSection } from '../../types';

function questionStrings(q: Question): string[] {
  return [
    q.prompt,
    q.promptDetails ?? '',
    ...q.options.map((o) => o.text),
    ...q.explanation.stepByStep,
    q.explanation.conceptSummary,
    q.explanation.commonMisconception ?? '',
  ];
}

function guideStrings(g: StudyGuideSection): string[] {
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

const standardStrings = GRADE_5_DOMAINS.flatMap((d) => [
  d.description,
  ...d.standards.flatMap((s) => [s.title, s.description, ...s.keyConcepts]),
]);

const quizStrings = GRADE_5.quizzes.flatMap((z) => [
  z.title,
  typeof z.subtitle === 'function' ? z.subtitle(GRADE_5) : z.subtitle,
]);

const everyString = [
  ...GRADE_5_AUTHORED.flatMap(questionStrings),
  ...Object.values(GRADE_5_STUDY_GUIDES).flatMap(guideStrings),
  ...standardStrings,
  ...quizStrings,
];

/** Text Grade 5 must never contain: it is outside the NC standard (rule id in the label). */
const OUT_OF_SCOPE: Array<[string, RegExp]> = [
  ['NC-R4 exponent notation', /\^/],
  ['NC-R1 brackets or braces', /[[\]{}]/],
  ['NC-R5 line plots', /line plots?/i],
  ['reading level: slope', /\bslope\b/i],
  ['grade 6 content named in Grade 5 text', /\b(6th|sixth)[- ]grade\b/i],
];

/** Claims the audit could not source: how often, how hard, or how a test is laid out. */
const UNSUPPORTED_CLAIMS =
  /most common|single most|#1|highest-discriminating|almost always|\blove\b|high-frequency|heavily assessed|will try to|tested concept|calculator-inactive|calculator inactive/i;

describe('Grade 5 text stays inside NC scope', () => {
  it.each(OUT_OF_SCOPE)('%s appears nowhere in Grade 5 questions, guides, standards or quizzes', (_label, pattern) => {
    const hits = everyString.filter((s) => pattern.test(s));
    expect(hits, `matched: ${hits.join(' || ')}`).toEqual([]);
  });

  it('no authored prompt wears an "Above-Grade" label', () => {
    for (const q of GRADE_5_AUTHORED) expect(q.prompt, q.id).not.toMatch(/Above-Grade/);
  });

  it('audit Medium: study guides make no unsupported frequency, difficulty or test-layout claims', () => {
    for (const [code, guide] of Object.entries(GRADE_5_STUDY_GUIDES)) {
      for (const s of guideStrings(guide)) {
        expect(s, `${code}: ${s}`).not.toMatch(UNSUPPORTED_CLAIMS);
      }
    }
  });
});
