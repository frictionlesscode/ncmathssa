import type { StandardCode, DomainId } from '../curriculum/types';

export type Difficulty = 'mastery' | 'advanced' | 'stretch';

export interface AnswerOption {
  label: string;
  text: string;
  isCorrect: boolean;
  /** Names the specific error that produces this option. Required on
   *  every incorrect option: it is what makes a wrong answer diagnostic
   *  rather than merely wrong. */
  misconception?: string;
}

export interface Explanation {
  stepByStep: string[];
  conceptSummary: string;
  commonMisconception?: string;
}

export interface Question {
  id: string;
  standardCode: StandardCode;
  domainId: DomainId;
  prompt: string;
  promptDetails?: string;
  options: AnswerOption[];
  calculatorAllowed: boolean;
  isStretch: boolean;
  difficulty: Difficulty;
  explanation: Explanation;
}

export type QuestionRef =
  | { kind: 'authored'; id: string }
  | { kind: 'generated'; templateId: string; seed: number };

/** A schedulable identity. Deliberately seedless: review re-serves a
 *  fresh instance of a template, which must match the same queue entry. */
export type ReviewKey =
  | { kind: 'authored'; id: string }
  | { kind: 'generated'; templateId: string };

export function reviewKeyOf(ref: QuestionRef): ReviewKey {
  return ref.kind === 'authored'
    ? { kind: 'authored', id: ref.id }
    : { kind: 'generated', templateId: ref.templateId };
}

export function reviewKeyId(key: ReviewKey): string {
  return key.kind === 'authored' ? `a:${key.id}` : `g:${key.templateId}`;
}

export function correctOption(q: Question): AnswerOption {
  const correct = q.options.filter((o) => o.isCorrect);
  if (correct.length !== 1) {
    throw new Error(
      `Question ${q.id} must have exactly one correct option, found ${correct.length}`,
    );
  }
  return correct[0];
}

const LABELS = ['A', 'B', 'C', 'D', 'E', 'F'];

export function labelOptions(
  texts: { text: string; isCorrect: boolean; misconception?: string }[],
): AnswerOption[] {
  return texts.map((t, i) => {
    if (!t.isCorrect && !t.misconception) {
      throw new Error(`Incorrect option "${t.text}" is missing a misconception tag`);
    }
    return { label: LABELS[i], text: t.text, isCorrect: t.isCorrect, misconception: t.misconception };
  });
}
