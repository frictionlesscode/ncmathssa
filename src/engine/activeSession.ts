import type { DomainId, GradeCurriculum, StandardCode } from '../curriculum/types';
import type { AnswerOrigin, QuizAttempt, QuizAttemptAnswer, QuizDefinition } from '../types';
import { isPassing } from './mastery';
import { checkAnswer } from '../utils/answerChecker';
import {
  contentVersionOf, parseQuestionRef, questionRefId, type Question, type QuestionRef,
} from './questionModel';

export type SessionKind = 'checkup' | 'practice' | 'round3' | 'practice-test' | 'drill';

export interface SessionAnswer {
  selected: string;
  isCorrect: boolean;
}

/** A session in progress, saved on the profile after every interaction so a
 *  closed tab or "Stop for today" loses nothing (spec 7). refs are frozen at
 *  start, so resuming replays exactly the same questions. */
export interface ActiveSession {
  kind: SessionKind;
  quizId: string;
  title: string;
  domainId?: DomainId;
  standardCode?: StandardCode;
  refs: QuestionRef[];
  /** Keyed by Question.id (equal to questionRefId(ref)). */
  answers: Record<string, SessionAnswer>;
  flagged: Record<string, boolean>;
  /** Question.id -> 'review' for refs that came from the due-review queue. Absent means every ref is new. */
  origins?: Record<string, AnswerOrigin>;
  currentIndex: number;
  startedAt: string;
  secondsElapsed: number;
  /** contentVersion of each question (keyed by Question.id) when the session
   *  started. Absent on sessions saved before versions existed: every
   *  question then counts as version 1. */
  versions?: Record<string, number>;
}

export const DEFAULT_SESSION_SIZE = 15;
const MIN_SESSION_SIZE = 5;
const MAX_SESSION_SIZE = 30;

/** The profile's questions-per-session, defaulted and clamped: the value
 *  comes from a free-typed settings field and from older saved data. */
export function sessionSizeOf(profile: { sessionSize?: unknown }): number {
  const n = profile.sessionSize;
  if (typeof n !== 'number' || !Number.isFinite(n)) return DEFAULT_SESSION_SIZE;
  return Math.min(MAX_SESSION_SIZE, Math.max(MIN_SESSION_SIZE, Math.round(n)));
}

/** Test-style sessions hide feedback until the end and pause (not grade) on
 *  "Stop for today". Only path practice is instant-feedback. */
export function isTestStyle(kind: SessionKind): boolean {
  return kind !== 'practice';
}

export function newSession(args: {
  kind: SessionKind;
  quizId: string;
  title: string;
  refs: QuestionRef[];
  now: Date;
  domainId?: DomainId;
  standardCode?: StandardCode;
  origins?: Record<string, AnswerOrigin>;
}): ActiveSession {
  const { now, ...rest } = args;
  return { ...rest, answers: {}, flagged: {}, currentIndex: 0, startedAt: now.toISOString(), secondsElapsed: 0 };
}

export function sessionFromQuiz(quiz: QuizDefinition, kind: SessionKind, now: Date): ActiveSession {
  return newSession({
    kind,
    quizId: quiz.id,
    title: quiz.title,
    refs: quiz.questionIds.map(parseQuestionRef),
    now,
    domainId: quiz.domainId,
    standardCode: quiz.standardCode,
    origins: quiz.origins,
  });
}

export function answeredCount(s: ActiveSession): number {
  return Object.keys(s.answers).length;
}

export function recordAnswer(s: ActiveSession, q: Question, selected: string): ActiveSession {
  return { ...s, answers: { ...s.answers, [q.id]: { selected, isCorrect: checkAnswer(q, selected) } } };
}

/** Records the current content version of every question in the session, so
 *  a later deploy that rewrites one of them is noticed on resume. Call once,
 *  where a session starts. A ref that does not resolve is left out. */
export function stampContentVersions(s: ActiveSession, c: GradeCurriculum): ActiveSession {
  const versions: Record<string, number> = {};
  for (const ref of s.refs) {
    const v = c.source.versionOf(ref);
    if (v !== undefined) versions[questionRefId(ref)] = v;
  }
  return { ...s, versions };
}

/** The session's questions, skipping any ref the current content can no
 *  longer resolve (content changed, or the student's grade changed). A
 *  session in which ANY question was rewritten since it started (its content
 *  version differs from the recorded one, absent meaning 1) yields nothing,
 *  so callers show their "can't continue" screen for the whole session. */
export function resolveSession(s: ActiveSession, c: GradeCurriculum): Question[] {
  const out: Question[] = [];
  for (const ref of s.refs) {
    try {
      const q = c.source.resolve(ref);
      if (contentVersionOf(q) !== (s.versions?.[q.id] ?? 1)) return [];
      out.push(q);
    } catch {
      // Unresolvable: skip. Callers show a "can't continue" state when nothing is left.
    }
  }
  return out;
}

/** Grades a session into a QuizAttempt. answeredOnly grades just the
 *  answered questions (instant practice stopped early); otherwise every
 *  question counts and unanswered ones are wrong, as on the real test. */
export function sessionToAttempt(
  s: ActiveSession,
  questions: Question[],
  passingPercent: number,
  now: Date,
  opts: { answeredOnly: boolean; idSuffix?: string },
): QuizAttempt {
  const graded = opts.answeredOnly ? questions.filter((q) => s.answers[q.id]) : questions;
  const answers: Record<string, QuizAttemptAnswer> = {};
  let raw = 0;
  for (const q of graded) {
    const selected = s.answers[q.id]?.selected ?? '';
    const isCorrect = checkAnswer(q, selected);
    if (isCorrect) raw += 1;
    const chosen = isCorrect
      ? undefined
      : q.options.find(
          (o) =>
            o.label.toLowerCase() === selected.trim().toLowerCase() ||
            o.text.trim().toLowerCase() === selected.trim().toLowerCase(),
        );
    answers[q.id] = {
      questionId: q.id,
      studentAnswer: selected,
      isCorrect,
      standardCode: q.standardCode,
      misconception: chosen?.misconception,
      flaggedForReview: s.flagged[q.id],
      contentVersion: contentVersionOf(q),
      ...(s.origins?.[q.id] === 'review' ? { origin: 'review' as const } : {}),
    };
  }
  const total = graded.length;
  const scorePercent = total === 0 ? 0 : Math.round((raw / total) * 1000) / 10;
  return {
    id: `attempt-${now.getTime()}-${opts.idSuffix ?? Math.random().toString(36).slice(2, 8)}`,
    quizId: s.quizId,
    quizTitle: s.title,
    domainId: s.domainId,
    standardCode: s.standardCode,
    completedAt: now.toISOString(),
    scoreRaw: raw,
    scoreTotal: total,
    scorePercent,
    isPassingSSA: isPassing(raw, total, passingPercent),
    timeElapsedSeconds: s.secondsElapsed,
    answers,
  };
}
