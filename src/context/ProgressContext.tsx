import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import type { Grade, GradeCurriculum, StandardCode } from '../curriculum/types';
import { getCurriculum, standardsOf } from '../curriculum/registry';
import type { AppStateV2, Profile } from '../state/types';
import { loadState, saveState, newProfile } from '../state/storage';
import type { QuizAttempt } from '../types';
import type { QuestionRef } from '../engine/questionModel';
import { masteryByStandard, overallReadiness, type StandardMastery } from '../engine/mastery';
import { recordResult } from '../engine/scheduler';

export interface ProgressContextValue {
  state: AppStateV2;
  profile: Profile;
  curriculum: GradeCurriculum;
  mastery: Map<StandardCode, StandardMastery>;
  readiness: number;
  switchProfile(id: string): void;
  addProfile(name: string, grade: Grade): void;
  recordAttempt(attempt: QuizAttempt, results: { ref: QuestionRef; wasCorrect: boolean }[]): void;
  /** Patches the active profile's own fields (name, target exam date, daily
   *  goal). Not part of the Task 13 interface contract, but every settings
   *  UI needs some way to persist an edit, and the profile record is where
   *  those fields now live. */
  updateActiveProfile(patch: Partial<Omit<Profile, 'id' | 'attempts' | 'reviewQueue'>>): void;
  /** Erases the active profile's attempt history and review queue, in
   *  service of the first-run promise that "everything stays on this
   *  device" — a promise that has to include the ability to remove it. */
  clearActiveProfileHistory(): void;
  /** Deletes a profile entirely. Refuses to delete the last remaining
   *  profile (there must always be at least one), and reassigns
   *  activeProfileId to another profile if the active one is removed. */
  deleteProfile(id: string): void;
}

const ProgressContext = createContext<ProgressContextValue | undefined>(undefined);

export const ProgressProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AppStateV2>(() => loadState(localStorage));

  useEffect(() => {
    saveState(localStorage, state);
  }, [state]);

  const profile = useMemo(
    () => state.profiles.find((p) => p.id === state.activeProfileId) ?? state.profiles[0],
    [state.profiles, state.activeProfileId],
  );

  const curriculum = useMemo(() => getCurriculum(profile.grade), [profile.grade]);

  const mastery = useMemo(
    () => masteryByStandard(profile.attempts, curriculum),
    [profile.attempts, curriculum],
  );

  const readiness = useMemo(() => overallReadiness(mastery, curriculum), [mastery, curriculum]);

  const switchProfile = useCallback((id: string) => {
    setState((prev) => (prev.profiles.some((p) => p.id === id) ? { ...prev, activeProfileId: id } : prev));
  }, []);

  const addProfile = useCallback((name: string, grade: Grade) => {
    setState((prev) => {
      const p = newProfile({ studentName: name, grade });
      return { ...prev, profiles: [...prev.profiles, p], activeProfileId: p.id };
    });
  }, []);

  const recordAttempt = useCallback(
    (attempt: QuizAttempt, results: { ref: QuestionRef; wasCorrect: boolean }[]) => {
      setState((prev) => {
        const now = new Date();
        return {
          ...prev,
          profiles: prev.profiles.map((p) => {
            if (p.id !== prev.activeProfileId) return p;
            let queue = p.reviewQueue;
            for (const r of results) {
              queue = recordResult(queue, r.ref, r.wasCorrect, now);
            }
            return { ...p, attempts: [attempt, ...p.attempts], reviewQueue: queue };
          }),
        };
      });
    },
    [],
  );

  const updateActiveProfile = useCallback(
    (patch: Partial<Omit<Profile, 'id' | 'attempts' | 'reviewQueue'>>) => {
      setState((prev) => ({
        ...prev,
        profiles: prev.profiles.map((p) => (p.id === prev.activeProfileId ? { ...p, ...patch } : p)),
      }));
    },
    [],
  );

  const clearActiveProfileHistory = useCallback(() => {
    setState((prev) => ({
      ...prev,
      profiles: prev.profiles.map((p) =>
        p.id === prev.activeProfileId ? { ...p, attempts: [], reviewQueue: {} } : p,
      ),
    }));
  }, []);

  const deleteProfile = useCallback((id: string) => {
    setState((prev) => {
      if (prev.profiles.length <= 1) return prev;
      const profiles = prev.profiles.filter((p) => p.id !== id);
      if (profiles.length === prev.profiles.length) return prev;
      const activeProfileId =
        prev.activeProfileId === id ? profiles[0].id : prev.activeProfileId;
      return { ...prev, profiles, activeProfileId };
    });
  }, []);

  const value: ProgressContextValue = useMemo(
    () => ({
      state,
      profile,
      curriculum,
      mastery,
      readiness,
      switchProfile,
      addProfile,
      recordAttempt,
      updateActiveProfile,
      clearActiveProfileHistory,
      deleteProfile,
    }),
    [
      state,
      profile,
      curriculum,
      mastery,
      readiness,
      switchProfile,
      addProfile,
      recordAttempt,
      updateActiveProfile,
      clearActiveProfileHistory,
      deleteProfile,
    ],
  );

  return <ProgressContext.Provider value={value}>{children}</ProgressContext.Provider>;
};

export const useProgress = (): ProgressContextValue => {
  const context = useContext(ProgressContext);
  if (!context) {
    throw new Error('useProgress must be used within a ProgressProvider');
  }
  return context;
};

// Moved to the engine so pure modules (engine/path.ts) can use it without
// importing React context; re-exported so existing imports keep working.
export { domainStatsFor } from '../engine/mastery';
export type { DomainStats } from '../engine/mastery';

/** Composite readiness figures the old context exposed as a single
 *  `overallReadiness` object. Every field is derived from the primitives
 *  the new context provides (`mastery`, `curriculum`, `readiness`,
 *  `profile`), so it works for any grade rather than assuming Grade 5. */
export interface ReadinessSummary {
  weightedScore: number;
  isAccelerationReady: boolean;
  masteredStandardsCount: number;
  totalStandardsCount: number;
  totalQuestionsAnswered: number;
  totalCorrectAnswered: number;
  overallAccuracy: number;
  daysUntilExam: number;
  dailyQuestionsPace: number;
}

/** Target total practice volume before an exam, used to recommend a daily
 *  pace. Matches the figure the old single-grade context used. */
const TARGET_PRACTICE_VOLUME = 150;

export function useReadinessSummary(): ReadinessSummary {
  const { curriculum, mastery, readiness, profile } = useProgress();

  return useMemo(() => {
    let totalQuestionsAnswered = 0;
    let totalCorrectAnswered = 0;
    let masteredStandardsCount = 0;

    for (const m of mastery.values()) {
      totalQuestionsAnswered += m.total;
      totalCorrectAnswered += m.correct;
      if (m.status === 'acceleration-ready') masteredStandardsCount += 1;
    }

    const overallAccuracy =
      totalQuestionsAnswered > 0 ? Math.round((totalCorrectAnswered / totalQuestionsAnswered) * 100) : 0;

    const targetDate = profile.targetExamDate ? new Date(profile.targetExamDate) : null;
    const daysUntilExam =
      targetDate && !Number.isNaN(targetDate.getTime())
        ? Math.max(0, Math.ceil((targetDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
        : 0;

    const remainingToPractice = Math.max(0, TARGET_PRACTICE_VOLUME - totalQuestionsAnswered);
    const dailyQuestionsPace =
      daysUntilExam > 0 ? Math.ceil(remainingToPractice / daysUntilExam) : profile.dailyQuestionGoal;

    return {
      weightedScore: Math.round(readiness),
      isAccelerationReady: readiness >= curriculum.ssa.passingPercent,
      masteredStandardsCount,
      totalStandardsCount: standardsOf(curriculum).length,
      totalQuestionsAnswered,
      totalCorrectAnswered,
      overallAccuracy,
      daysUntilExam,
      dailyQuestionsPace,
    };
  }, [curriculum, mastery, readiness, profile.targetExamDate, profile.dailyQuestionGoal]);
}
