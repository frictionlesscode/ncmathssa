import type { DomainId, GradeCurriculum, StandardCode } from '../curriculum/types';
import { topicName } from '../curriculum/registry';
import type { QuizAttempt } from '../types';
import { isPassing } from './mastery';

/** A topic needs at least this many answers in a session to be called strong or tricky. */
export const MIN_ANSWERS_FOR_STRONG = 3;

export interface TopicResult {
  domainId: DomainId;
  name: string;
  correct: number;
  total: number;
  /** Answers left blank (recorded wrong, as on the real test). */
  unanswered: number;
}

export interface SessionSummaryData {
  correct: number;
  total: number;
  /** Questions left blank across the whole session. */
  notAnswered: number;
  strong: TopicResult[];
  tricky: TopicResult[];
  /** Topics with too few answers to judge (1-2). */
  alsoPracticed: TopicResult[];
}

/** Per-topic results for one finished session, for the parent summary. */
export function summarizeAttempt(attempt: QuizAttempt, c: GradeCurriculum): SessionSummaryData {
  const domainByStandard = new Map<StandardCode, DomainId>();
  for (const d of c.domains) for (const s of d.standards) domainByStandard.set(s.code, d.id);

  const tally = new Map<DomainId, { correct: number; total: number; unanswered: number }>();
  for (const ans of Object.values(attempt.answers)) {
    const d = domainByStandard.get(ans.standardCode);
    if (!d) continue;
    const t = tally.get(d) ?? { correct: 0, total: 0, unanswered: 0 };
    t.total += 1;
    if (ans.isCorrect) t.correct += 1;
    if ((ans.studentAnswer ?? '').trim() === '') t.unanswered += 1;
    tally.set(d, t);
  }

  const results: TopicResult[] = c.domains
    .filter((d) => tally.has(d.id))
    .map((d) => ({ domainId: d.id, name: topicName(d), ...tally.get(d.id)! }));
  const passing = c.ssa.passingPercent;
  const enough = (t: TopicResult) => t.total >= MIN_ANSWERS_FOR_STRONG;

  return {
    correct: results.reduce((n, t) => n + t.correct, 0),
    total: results.reduce((n, t) => n + t.total, 0),
    notAnswered: results.reduce((n, t) => n + t.unanswered, 0),
    strong: results.filter((t) => enough(t) && isPassing(t.correct, t.total, passing)),
    tricky: results.filter((t) => enough(t) && !isPassing(t.correct, t.total, passing)),
    alsoPracticed: results.filter((t) => !enough(t)),
  };
}
