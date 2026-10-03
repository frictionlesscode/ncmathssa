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
  /** Bump when a rewrite changes the key, the options or the math. Answers
   *  recorded against an older version stop counting toward mastery, and a
   *  saved session built on an older version cannot be resumed. Absent means 1. */
  contentVersion?: number;
}

/** The content version of a question, an answer or a template: absent is 1. */
export function contentVersionOf(x: { contentVersion?: number }): number {
  const v = x.contentVersion;
  return typeof v === 'number' && Number.isInteger(v) && v >= 1 ? v : 1;
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

/** Encodes a QuestionRef as a single string id that survives a round trip
 *  through anything that only carries `string[]` question ids (a
 *  QuizDefinition's `questionIds`, in particular). Deliberately reuses the
 *  exact `${templateId}#${seed}` format `realize()` already assigns as a
 *  generated Question's own `id`, so `parseQuestionRef` is a true inverse
 *  of both this function and of reading `.id` off a resolved Question. */
export function questionRefId(ref: QuestionRef): string {
  return ref.kind === 'authored' ? ref.id : `${ref.templateId}#${ref.seed}`;
}

export function parseQuestionRef(id: string): QuestionRef {
  const hashIdx = id.indexOf('#');
  if (hashIdx === -1) return { kind: 'authored', id };
  const templateId = id.slice(0, hashIdx);
  const seed = Number(id.slice(hashIdx + 1));
  return { kind: 'generated', templateId, seed };
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
