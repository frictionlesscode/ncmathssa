import type { DomainId, GradeCurriculum, StandardCode } from '../curriculum/types';
import { topicName } from '../curriculum/registry';
import type { QuizAttempt } from '../types';

export interface TopicResult {
  domainId: DomainId;
  name: string;
  correct: number;
  total: number;
}

export interface SessionSummaryData {
  correct: number;
  total: number;
  strong: TopicResult[];
  tricky: TopicResult[];
}

/** Per-topic results for one finished session, for the parent summary. */
export function summarizeAttempt(attempt: QuizAttempt, c: GradeCurriculum): SessionSummaryData {
  const domainByStandard = new Map<StandardCode, DomainId>();
  for (const d of c.domains) for (const s of d.standards) domainByStandard.set(s.code, d.id);

  const tally = new Map<DomainId, { correct: number; total: number }>();
  for (const ans of Object.values(attempt.answers)) {
    const d = domainByStandard.get(ans.standardCode);
    if (!d) continue;
    const t = tally.get(d) ?? { correct: 0, total: 0 };
    t.total += 1;
    if (ans.isCorrect) t.correct += 1;
    tally.set(d, t);
  }

  const results: TopicResult[] = c.domains
    .filter((d) => tally.has(d.id))
    .map((d) => ({ domainId: d.id, name: topicName(d), ...tally.get(d.id)! }));
  const isStrong = (t: TopicResult) => (t.correct / t.total) * 100 >= c.ssa.passingPercent;

  return {
    correct: results.reduce((n, t) => n + t.correct, 0),
    total: results.reduce((n, t) => n + t.total, 0),
    strong: results.filter(isStrong),
    tricky: results.filter((t) => !isStrong(t)),
  };
}
