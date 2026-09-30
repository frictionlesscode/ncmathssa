import type { StandardCode, GradeCurriculum, DomainInfo } from '../curriculum/types';
import { domainWeight, standardsOf } from '../curriculum/registry';
import type { QuizAttempt } from '../types';
import { familyOf, type MisconceptionFamily } from '../curriculum/misconceptions';

export type MasteryStatus = 'acceleration-ready' | 'approaching' | 'needs-focus' | 'untested';


export interface StandardMastery {
  standardCode: StandardCode;
  total: number;
  correct: number;
  percent: number;
  status: MasteryStatus;
  lastTestedAt?: string;
  misconceptions: Record<string, number>;
}

/** Below this many attempts, a perfect score is noise rather than mastery. */
export const MIN_SAMPLE_FOR_MASTERY = 4;
/** Accuracy at which a topic stops being "needs focus". */
export const APPROACHING_PERCENT = 60;
/** Weights sum to 100 only up to floating-point noise (Grade 4 sums to 99.99999999999999). */
const READINESS_EPSILON = 1e-9;

/** True when correct/total meets the bar exactly. Integer arithmetic, so no
 *  rounding or floating-point error can move a boundary. */
export function isPassing(correct: number, total: number, passing: number): boolean {
  return total > 0 && correct * 100 >= passing * total;
}

export function masteryStatus(correct: number, total: number, passing: number): MasteryStatus {
  if (total === 0) return 'untested';
  if (total >= MIN_SAMPLE_FOR_MASTERY && isPassing(correct, total, passing)) return 'acceleration-ready';
  if (correct * 100 >= APPROACHING_PERCENT * total) return 'approaching';
  return 'needs-focus';
}

export type ReadinessStatus = 'ready' | 'building';

/** The one place that decides whether an overall readiness value meets the goal. */
export function readinessStatus(readiness: number, passing: number): ReadinessStatus {
  return readiness + READINESS_EPSILON >= passing ? 'ready' : 'building';
}

/** Readiness as shown to people: floored, so a value below the goal never displays as the goal. */
export function displayPercent(value: number): number {
  return Math.floor(value + READINESS_EPSILON);
}

export function formatPercent(value: number): string {
  return `${displayPercent(value)}%`;
}

/** Whole points still needed to reach the goal (0 once reached). */
export function pointsToGoal(readiness: number, passing: number): number {
  return Math.max(0, Math.ceil(passing - readiness - READINESS_EPSILON));
}

export function masteryByStandard(
  attempts: QuizAttempt[],
  c: GradeCurriculum,
): Map<StandardCode, StandardMastery> {
  const out = new Map<StandardCode, StandardMastery>();
  for (const s of standardsOf(c)) {
    out.set(s.code, {
      standardCode: s.code, total: 0, correct: 0, percent: 0,
      status: 'untested', misconceptions: {},
    });
  }

  for (const attempt of attempts) {
    for (const ans of Object.values(attempt.answers)) {
      const code = (ans as { standardCode?: StandardCode }).standardCode;
      if (!code) continue;
      const m = out.get(code);
      if (!m) continue;               // content from another grade; ignore
      m.total += 1;
      if (ans.isCorrect) m.correct += 1;
      const tag = (ans as { misconception?: string }).misconception;
      if (!ans.isCorrect && tag) m.misconceptions[tag] = (m.misconceptions[tag] ?? 0) + 1;
      if (!m.lastTestedAt || attempt.completedAt > m.lastTestedAt) {
        m.lastTestedAt = attempt.completedAt;
      }
    }
  }

  for (const m of out.values()) {
    m.percent = m.total === 0 ? 0 : (m.correct / m.total) * 100;
    m.status = masteryStatus(m.correct, m.total, c.ssa.passingPercent);
  }
  return out;
}

/** Blueprint-weighted composite, 0-100. Untested standards count as 0:
 *  readiness means readiness for the whole assessment. Unrounded: compare it
 *  with readinessStatus and show it with formatPercent. */
export function overallReadiness(
  mastery: Map<StandardCode, StandardMastery>,
  c: GradeCurriculum,
): number {
  let total = 0;
  for (const d of c.domains) {
    const weight = domainWeight(c, d.id);
    if (d.standards.length === 0) continue;
    const domainPercent =
      d.standards.reduce((sum, s) => sum + (mastery.get(s.code)?.percent ?? 0), 0) /
      d.standards.length;
    total += (weight / 100) * domainPercent;
  }
  return total;
}

export function topMisconceptions(
  mastery: Map<StandardCode, StandardMastery>,
  limit: number,
): { tag: string; count: number }[] {
  const tally = new Map<string, number>();
  for (const m of mastery.values()) {
    for (const [tag, n] of Object.entries(m.misconceptions)) {
      tally.set(tag, (tally.get(tag) ?? 0) + n);
    }
  }
  return [...tally.entries()]
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag))
    .slice(0, limit);
}

export interface FamilyTally {
  family: MisconceptionFamily;
  count: number;
  /** The specific tags that rolled up into this family, most frequent first. */
  tags: { tag: string; count: number }[];
}

/** Rolls raw misconception tags up to their coarse family (Ruling F14): the
 *  bank has 93 distinct tags, 66 of them appearing exactly once, so ranking
 *  raw tags surfaces a list of singletons instead of a diagnosis. A tag with
 *  no registry entry is skipped rather than thrown on - a report screen is
 *  the wrong place to crash over a content/registry drift that Task 6's own
 *  test already guards against. */
export function topMisconceptionFamilies(
  mastery: Map<StandardCode, StandardMastery>,
  limit: number,
): FamilyTally[] {
  const byFamily = new Map<MisconceptionFamily, Map<string, number>>();

  for (const m of mastery.values()) {
    for (const [tag, n] of Object.entries(m.misconceptions)) {
      const family = familyOf(tag);
      if (!family) continue; // unregistered tag: skip, don't throw
      const tags = byFamily.get(family) ?? new Map<string, number>();
      tags.set(tag, (tags.get(tag) ?? 0) + n);
      byFamily.set(family, tags);
    }
  }

  return [...byFamily.entries()]
    .map(([family, tags]) => {
      const tagList = [...tags.entries()]
        .map(([tag, count]) => ({ tag, count }))
        .sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag));
      return {
        family,
        count: tagList.reduce((sum, t) => sum + t.count, 0),
        tags: tagList,
      };
    })
    .sort((a, b) => b.count - a.count || a.family.localeCompare(b.family))
    .slice(0, limit);
}

/** Domain-level rollup of the per-standard mastery map. Components used to
 *  get this from a single-grade `getDomainMastery` helper on the old
 *  context; it is derived here from the same `mastery` map every component
 *  already reads, so it works for any grade's domain shape. */
export interface DomainStats {
  masteryPercent: number;
  totalQuestionsAnswered: number;
  totalCorrect: number;
  status: MasteryStatus;
  standardsCount: number;
  standardsMastered: number;
}

export function domainStatsFor(
  domain: DomainInfo,
  mastery: Map<StandardCode, StandardMastery>,
  passingPercent: number,
): DomainStats {
  let totalQuestionsAnswered = 0;
  let totalCorrect = 0;
  let standardsMastered = 0;

  for (const s of domain.standards) {
    const m = mastery.get(s.code);
    if (!m) continue;
    totalQuestionsAnswered += m.total;
    totalCorrect += m.correct;
    if (m.status === 'acceleration-ready') standardsMastered += 1;
  }

  const masteryPercent =
    totalQuestionsAnswered === 0 ? 0 : Math.round((totalCorrect / totalQuestionsAnswered) * 100);

  return {
    masteryPercent,
    totalQuestionsAnswered,
    totalCorrect,
    status: masteryStatus(totalCorrect, totalQuestionsAnswered, passingPercent),
    standardsCount: domain.standards.length,
    standardsMastered,
  };
}
