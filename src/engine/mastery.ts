import type { StandardCode, GradeCurriculum } from '../curriculum/types';
import { domainWeight, standardsOf } from '../curriculum/registry';
import type { QuizAttempt } from '../types';
import { familyOf, type MisconceptionFamily } from '../curriculum/misconceptions';

export type MasteryStatus = 'acceleration-ready' | 'approaching' | 'needs-focus' | 'untested';

/** Below this many attempts, a perfect score is noise rather than mastery. */
const MIN_SAMPLE_FOR_MASTERY = 4;

export interface StandardMastery {
  standardCode: StandardCode;
  total: number;
  correct: number;
  percent: number;
  status: MasteryStatus;
  lastTestedAt?: string;
  misconceptions: Record<string, number>;
}

export function masteryStatus(percent: number, total: number, passing: number): MasteryStatus {
  if (total === 0) return 'untested';
  if (percent >= passing && total >= MIN_SAMPLE_FOR_MASTERY) return 'acceleration-ready';
  if (percent >= 60) return 'approaching';
  return 'needs-focus';
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
    m.status = masteryStatus(m.percent, m.total, c.ssa.passingPercent);
  }
  return out;
}

/** Blueprint-weighted composite, 0-100. Untested standards count as 0:
 *  readiness means readiness for the whole assessment. */
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
  return Math.round(total * 10) / 10;
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
