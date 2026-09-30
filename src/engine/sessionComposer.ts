import type { DomainId, GradeCurriculum, StandardCode } from '../curriculum/types';
import { domainWeight, standardsOf } from '../curriculum/registry';
import type { Difficulty, QuestionRef } from './questionModel';
import { questionRefId } from './questionModel';
import type { StandardMastery } from './mastery';
import type { ReviewQueue } from './scheduler';
import { dueEntries } from './scheduler';
import { makeRng } from './rng';
import type { AnswerOrigin } from '../types';

/** A bad week should not turn every session into remediation. */
export const MAX_REVIEW_FRACTION = 0.4;

interface ScoredStandard {
  code: StandardCode;
  score: number;
}

/** Narrows a composed session to the path's current round (spec 5.3). Due
 *  reviews are not filtered: spaced review of any topic stays valuable. */
export interface SessionPlan {
  domains: ReadonlySet<DomainId>;
  /** A draw outside these is retried up to PREFER_RETRIES times, then kept,
   *  so thin content degrades to "any difficulty" rather than a short session. */
  prefer?: readonly Difficulty[];
}

const PREFER_RETRIES = 3;

export interface SelectSessionInput {
  curriculum: GradeCurriculum;
  mastery: Map<StandardCode, StandardMastery>;
  queue: ReviewQueue;
  size: number;
  now: Date;
  seed: number;
  plan?: SessionPlan;
}

export interface ComposedRef {
  ref: QuestionRef;
  origin: AnswerOrigin;
}

/** The refs of composeSession, for callers that do not care where each came from. */
export function selectSession(input: SelectSessionInput): QuestionRef[] {
  return composeSession(input).map((c) => c.ref);
}

export function composeSession(input: SelectSessionInput): ComposedRef[] {
  const { curriculum: c, mastery, queue, size, now, seed, plan } = input;
  const rng = makeRng(seed);
  const refs: ComposedRef[] = [];

  // Every ref already chosen, keyed by its exact identity (template + seed
  // for a generated ref, id for an authored one) — a session must never
  // show the very same question instance twice, whether it arrived as a
  // due review or as new content (Ruling F17). This is deliberately NOT
  // the seedless review key: two different seeds of one template are
  // different questions, and a template with many possible instances
  // should be able to contribute more than one of them to a session.
  const used = new Set<string>();

  // 1. Due reviews, most overdue first, capped.
  const reviewCap = Math.ceil(size * MAX_REVIEW_FRACTION);
  for (const entry of dueEntries(queue, now).slice(0, reviewCap)) {
    const ref: QuestionRef =
      entry.key.kind === 'authored'
        ? { kind: 'authored', id: entry.key.id }
        : { kind: 'generated', templateId: entry.key.templateId, seed: rng.int(0, 2 ** 31 - 1) };
    refs.push({ ref, origin: 'review' });
    used.add(questionRefId(ref));
  }

  // 2-4. Fill the rest in tiers (spec §7.3, Ruling F18): standards the
  // child is actively struggling with outrank untested ones, which
  // outrank standards already going well — regardless of blueprint
  // weight. Weight only breaks ties within a tier.
  const withContent = new Set(c.source.allStandardsWithContent());
  const eligible = standardsOf(c).filter(
    (s) => withContent.has(s.code) && (!plan || plan.domains.has(s.domainId)),
  );

  const jitter = () => rng.next() * 5;

  const struggling: ScoredStandard[] = [];
  const untested: ScoredStandard[] = [];
  const coverage: ScoredStandard[] = [];

  for (const s of eligible) {
    const m = mastery.get(s.code);
    const weight = domainWeight(c, s.domainId);
    if (m && m.total > 0 && (m.status === 'needs-focus' || m.status === 'approaching')) {
      struggling.push({ code: s.code, score: ((100 - m.percent) * weight) / 100 + jitter() });
    } else if (!m || m.total === 0) {
      untested.push({ code: s.code, score: weight + jitter() });
    } else {
      coverage.push({ code: s.code, score: weight + jitter() });
    }
  }

  struggling.sort((a, b) => b.score - a.score);
  untested.sort((a, b) => b.score - a.score);
  coverage.sort((a, b) => b.score - a.score);

  let i = 0;
  let preferMisses = 0;
  const maxDraws = size * (plan?.prefer ? 40 : 10);
  for (const tier of [struggling, untested, coverage]) {
    if (refs.length >= size) break;
    if (tier.length === 0) continue;

    let idx = 0;
    let stall = 0;
    // A tier is "exhausted" once a full lap or two of its standards
    // produces nothing new; the global i > size * 10 escape below is
    // the final backstop.
    const stallLimit = Math.max(tier.length, 4) * 3;

    while (refs.length < size && stall < stallLimit) {
      const s = tier[idx % tier.length];
      idx += 1;
      i += 1;
      if (i > maxDraws) return refs.slice(0, size); // every standard exhausted; stop rather than spin

      const [ref] = c.source.itemsFor(s.code, { count: 1, seedBase: rng.int(0, 2 ** 31 - 1) });
      if (!ref) { stall += 1; continue; }
      if (
        plan?.prefer &&
        preferMisses < PREFER_RETRIES &&
        !plan.prefer.includes(c.source.resolve(ref).difficulty)
      ) {
        preferMisses += 1;
        continue;
      }
      preferMisses = 0;

      const key = questionRefId(ref);
      if (used.has(key)) { stall += 1; continue; }

      refs.push({ ref, origin: 'new' });
      used.add(key);
      stall = 0;
    }
  }

  return refs.slice(0, size);
}
