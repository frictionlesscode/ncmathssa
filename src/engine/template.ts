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
