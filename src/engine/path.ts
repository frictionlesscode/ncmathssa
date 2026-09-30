import type { DomainId, GradeCurriculum, StandardCode } from '../curriculum/types';
import { topicName } from '../curriculum/registry';
import type { QuizAttempt } from '../types';
import { domainStatsFor, masteryByStandard, type MasteryStatus } from './mastery';

/** How many recent answers a round's exit rule looks at (spec 5.3). */
export const ROUND_SAMPLE = 8;
/** A test date this close switches the path to short-on-time mode (spec 5.5). */
export const SHORT_ON_TIME_DAYS = 14;
/** quizId prefixes for sessions the path composes, so history can tell a
 *  Round 3 (test-style) session apart from ordinary practice. */
export const PRACTICE_QUIZ_PREFIX = 'path-practice-';
export const ROUND3_QUIZ_PREFIX = 'path-round3-';

export type Round = 1 | 2 | 3;

export interface TopicProgress {
  domainId: DomainId;
  name: string;
  status: MasteryStatus;
  answered: number;
  /** The first round this topic has not finished, or 'done'. */
  round: Round | 'done';
  roundsFinished: number;
  strongFromCheckup: boolean;
}

export type NextStep =
  | { kind: 'checkup'; quizId: string }
  | { kind: 'practice'; round: 1 | 2 }
  | { kind: 'round3' }
  | { kind: 'practice-test'; quizId: string };

export interface PathState {
  topics: TopicProgress[];
  checkupDone: boolean;
  checkupQuizId?: string;
  currentRound: Round | 'test';
  /** Topics still working on currentRound; what the next session draws from. */
  activeDomains: DomainId[];
  roundTopicsDone: number;
  /** Topic-rounds finished and available, for the pace estimate. */
  roundsFinished: number;
  roundsTotal: number;
  shortOnTime: boolean;
  /** The practice-test form to offer next (least recently taken). */
  practiceTestQuizId?: string;
  practiceTestPassedAt?: string;
  next: NextStep;
}

export const DAY_MS = 86_400_000;

/** Sort key for a path round, with the practice test after Round 3. */
export function roundRank(r: Round | 'test'): number {
  return r === 'test' ? 4 : r;
}

/** Whole local days from today to a 'YYYY-MM-DD' date (negative once it has
 *  passed), or null when no valid date is set. */
export function daysUntil(date: string, now: Date): number | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return null;
  const [y, m, d] = date.split('-').map(Number);
  const target = new Date(y, m - 1, d);
  if (Number.isNaN(target.getTime())) return null;
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return Math.round((target.getTime() - today.getTime()) / DAY_MS);
}

/** Text for a signed day count: null when no date; passed / today / n. Never
 *  renders "0 days". `unit` is the trailing phrase for the positive case. */
export function countdownText(days: number | null, unit: string): string | null {
  if (days === null) return null;
  if (days < 0) return 'Test date passed';
  if (days === 0) return 'Test is today';
  return `${days} ${days === 1 ? unit.replace(/^days/, 'day') : unit}`;
}

export function isShortOnTime(testDate: string, now: Date): boolean {
  const d = daysUntil(testDate, now);
  return d !== null && d >= 0 && d <= SHORT_ON_TIME_DAYS;
}

/** The answer count a round's exit rule uses for one topic: ROUND_SAMPLE,
 *  or fewer when the topic has fewer distinct questions than that, so a
 *  thin topic can never stall the path (spec 5.3). */
export function sampleSizeFor(c: GradeCurriculum, standards: StandardCode[]): number {
  if (standards.some((s) => c.source.hasGenerator(s))) return ROUND_SAMPLE;
  const authored = standards.reduce((n, s) => n + c.source.authoredFor(s).length, 0);
  return Math.max(1, Math.min(ROUND_SAMPLE, authored));
}

function percent(xs: boolean[]): number {
  return xs.length === 0 ? 0 : (xs.filter(Boolean).length / xs.length) * 100;
}

function push<K, V>(m: Map<K, V[]>, k: K, v: V) {
  const list = m.get(k);
  if (list) list.push(v);
  else m.set(k, [v]);
}

export function buildPath(input: {
  curriculum: GradeCurriculum;
  attempts: QuizAttempt[];
  checkupSkipped: boolean;
  testDate: string;
  now: Date;
}): PathState {
  const { curriculum: c, attempts, checkupSkipped, testDate, now } = input;
  const passing = c.ssa.passingPercent;
  const shortOnTime = isShortOnTime(testDate, now);
  const withContent = new Set(c.source.allStandardsWithContent());

  const domainByStandard = new Map<StandardCode, DomainId>();
  for (const d of c.domains) for (const s of d.standards) domainByStandard.set(s.code, d.id);

  // Stored newest-first; the exit rules need oldest-first.
  const chronological = [...attempts].sort((a, b) => a.completedAt.localeCompare(b.completedAt));

  const diagnostic = c.quizzes.find((q) => q.isDiagnostic);
  const checkups = diagnostic ? chronological.filter((a) => a.quizId === diagnostic.id) : [];
  const lastCheckup = checkups[checkups.length - 1];

  const all = new Map<DomainId, boolean[]>();
  const round3 = new Map<DomainId, boolean[]>();
  for (const a of chronological) {
    const isRound3 = a.quizId.startsWith(ROUND3_QUIZ_PREFIX);
    for (const ans of Object.values(a.answers)) {
      const d = domainByStandard.get(ans.standardCode);
      if (!d) continue; // another grade's content
      push(all, d, ans.isCorrect);
      if (isRound3) push(round3, d, ans.isCorrect);
    }
  }

  const checkupStrong = new Set<DomainId>();
  if (lastCheckup) {
    const byDomain = new Map<DomainId, boolean[]>();
    for (const ans of Object.values(lastCheckup.answers)) {
      const d = domainByStandard.get(ans.standardCode);
      if (d) push(byDomain, d, ans.isCorrect);
    }
    for (const [d, xs] of byDomain) if (percent(xs) >= passing) checkupStrong.add(d);
  }

  const mastery = masteryByStandard(attempts, c);
  const maxRounds = shortOnTime ? 2 : 3;

  const topics: TopicProgress[] = c.domains
    .map((d) => ({ d, codes: d.standards.map((s) => s.code).filter((code) => withContent.has(code)) }))
    .filter(({ codes }) => codes.length > 0)
    .map(({ d, codes }) => {
      const need = sampleSizeFor(c, codes);
      const xs = all.get(d.id) ?? [];
      const r3xs = round3.get(d.id) ?? [];
      const passes = (list: boolean[]) => list.length >= need && percent(list.slice(-need)) >= passing;
      const status = domainStatsFor(d, mastery, passing).status;
      const strongFromCheckup = checkupStrong.has(d.id);

      const r1 = shortOnTime || strongFromCheckup || xs.length >= need;
      // Short on time: Round 2 is only for the red and yellow topics.
      const r2 = r1 && (passes(xs) || (shortOnTime && status === 'acceleration-ready'));
      const r3 = r2 && passes(r3xs);
      const roundsFinished = r3 ? 3 : r2 ? 2 : r1 ? 1 : 0;
      return {
        domainId: d.id,
        name: topicName(d),
        status,
        answered: xs.length,
        round: r3 ? 'done' : ((roundsFinished + 1) as Round),
        roundsFinished,
        strongFromCheckup,
      } satisfies TopicProgress;
    });

  // Short on time, Round 3 is optional, so it never holds the path back.
  const open = topics.filter((t) => t.round !== 'done' && !(shortOnTime && t.round === 3));
  const currentRound: Round | 'test' =
    open.length === 0 ? 'test' : (Math.min(...open.map((t) => t.round as Round)) as Round);
  const activeDomains =
    currentRound === 'test' ? [] : topics.filter((t) => t.round === currentRound).map((t) => t.domainId);

  const mocks = c.quizzes.filter((q) => q.isMockAssessment);
  const lastTaken = (id: string) => {
    const xs = chronological.filter((a) => a.quizId === id);
    return xs.length ? xs[xs.length - 1].completedAt : '';
  };
  // Stable sort: never-taken forms keep their declared order.
  const nextMock = [...mocks].sort((a, b) => lastTaken(a.id).localeCompare(lastTaken(b.id)))[0];
  const mockIds = new Set(mocks.map((m) => m.id));
  const passedMock = chronological.filter((a) => mockIds.has(a.quizId) && a.isPassingSSA).pop();

  const checkupDone = checkups.length > 0;
  let next: NextStep;
  if (diagnostic && !checkupDone && !checkupSkipped) next = { kind: 'checkup', quizId: diagnostic.id };
  else if (currentRound === 1 || currentRound === 2) next = { kind: 'practice', round: currentRound };
  else if (currentRound === 3) next = { kind: 'round3' };
  else next = nextMock ? { kind: 'practice-test', quizId: nextMock.id } : { kind: 'round3' };

  return {
    topics,
    checkupDone,
    checkupQuizId: diagnostic?.id,
    currentRound,
    activeDomains,
    roundTopicsDone: topics.length - activeDomains.length,
    roundsFinished: topics.reduce((n, t) => n + Math.min(t.roundsFinished, maxRounds), 0),
    roundsTotal: topics.length * maxRounds,
    shortOnTime,
    practiceTestQuizId: nextMock?.id,
    practiceTestPassedAt: passedMock?.completedAt,
    next,
  };
}
