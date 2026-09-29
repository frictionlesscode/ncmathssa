import type { Rng } from './rng';
import type { StandardCode, DomainId } from '../curriculum/types';
import type { AnswerOption, Explanation, Difficulty, Question } from './questionModel';

export interface GeneratedQuestion {
  prompt: string;
  promptDetails?: string;
  options: AnswerOption[];
  explanation: Explanation;
  answerText: string;
}

export interface QuestionTemplate {
  id: string;
  standardCode: StandardCode;
  domainId: DomainId;
  difficulty: Difficulty;
  calculatorAllowed: boolean;
  isStretch: boolean;
  generate(rng: Rng): GeneratedQuestion;
}

/** Throws if two of a generated question's option texts are identical.
 *  Most templates across `curriculum/*\/templates` inline this exact check
 *  (`new Set(texts).size !== texts.length`) once per generator; a template
 *  with more than one branch, such as Grade 1's `md4-read-the-data`, needs it
 *  once per branch, which is where copying the inline form starts to drift.
 *  Extracted here so those repeats share one implementation; new multi-branch
 *  templates should call this instead of reintroducing the inline form. */
export function assertNoOptionCollision(templateId: string, texts: string[]): void {
  if (new Set(texts).size !== texts.length) {
    throw new Error(`${templateId}: option collision [${texts.join(' | ')}]`);
  }
}

/** Materialize a template at a seed into a full Question. */
export function realize(t: QuestionTemplate, seed: number, rng: Rng): Question {
  const g = t.generate(rng);
  return {
    id: `${t.id}#${seed}`,
    standardCode: t.standardCode,
    domainId: t.domainId,
    prompt: g.prompt,
    promptDetails: g.promptDetails,
    options: g.options,
    calculatorAllowed: t.calculatorAllowed,
    isStretch: t.isStretch,
    difficulty: t.difficulty,
    explanation: g.explanation,
  };
}
