import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import type {
  AppState,
  DomainMastery,
  QuizAttempt,
  StandardMastery,
  UserSettings
} from '../types';

import { GRADE_5_STANDARDS, GRADE_5_DOMAINS } from '../curriculum/grade5';
import { GRADE_5_AUTHORED } from '../curriculum/grade5/authored';

const STORAGE_KEY = 'nc_math_ssa_prep_state_v1';

const DEFAULT_SETTINGS: UserSettings = {
  studentName: 'Student',
  currentGrade: 4,
  targetGrade: 5,
  targetExamDate: '2026-05-01', // Typical Spring SSA testing window
  weeklyStudyGoalHours: 4,
  dailyQuestionGoal: 10
};

interface ProgressContextType {
  state: AppState;
  recordQuizAttempt: (attempt: QuizAttempt) => void;
  clearMissedQuestion: (questionId: string) => void;
  updateSettings: (newSettings: Partial<UserSettings>) => void;
  resetAllProgress: () => void;
  loadDemoData: () => void;
  exportDataJson: () => string;
  importDataJson: (json: string) => boolean;
  getStandardMastery: (standardCode: string) => StandardMastery;
  getDomainMastery: (domainId: string) => DomainMastery;
  overallReadiness: {
    weightedScore: number;
    isAccelerationReady: boolean; // >= 80%
    masteredStandardsCount: number;
    totalStandardsCount: number;
    totalQuestionsAnswered: number;
    totalCorrectAnswered: number;
    overallAccuracy: number;
    daysUntilExam: number;
    dailyQuestionsPace: number;
  };
}

const ProgressContext = createContext<ProgressContextType | undefined>(undefined);

export const ProgressProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AppState>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.error('Failed to load state from localStorage', e);
    }
    return {
      settings: DEFAULT_SETTINGS,
      attempts: [],
      missedQuestionIds: [],
      activeQuizAttempt: null
    };
  });

  // Save to localStorage on state changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      console.error('Failed to persist state', e);
    }
  }, [state]);

  const recordQuizAttempt = (attempt: QuizAttempt) => {
    setState(prev => {
      const newAttempts = [attempt, ...prev.attempts];

      // Update missed questions:
      const updatedMissed = new Set(prev.missedQuestionIds);
      Object.entries(attempt.answers).forEach(([qId, ans]) => {
        if (!ans.isCorrect) {
          updatedMissed.add(qId);
        } else {
          // If the student correctly answered it now, remove it from missed bank!
          updatedMissed.delete(qId);
        }
      });

      return {
        ...prev,
        attempts: newAttempts,
        missedQuestionIds: Array.from(updatedMissed)
      };
    });
  };

  const clearMissedQuestion = (questionId: string) => {
    setState(prev => ({
      ...prev,
      missedQuestionIds: prev.missedQuestionIds.filter(id => id !== questionId)
    }));
  };

  const updateSettings = (newSettings: Partial<UserSettings>) => {
    setState(prev => ({
      ...prev,
      settings: { ...prev.settings, ...newSettings }
    }));
  };

  const resetAllProgress = () => {
    if (window.confirm('Are you sure you want to reset all quiz scores and study progress? This cannot be undone.')) {
      setState({
        settings: DEFAULT_SETTINGS,
        attempts: [],
        missedQuestionIds: [],
        activeQuizAttempt: null
      });
    }
  };

  const exportDataJson = (): string => {
    return JSON.stringify(state, null, 2);
  };

  const importDataJson = (json: string): boolean => {
    try {
      const parsed = JSON.parse(json);
      if (parsed.settings && Array.isArray(parsed.attempts)) {
        setState(parsed);
        return true;
      }
    } catch (e) {
      console.error('Invalid JSON import', e);
    }
    return false;
  };

  // Load realistic sample data for instant exploration/testing
  const loadDemoData = () => {
    const demoAttempts: QuizAttempt[] = [
      {
        id: 'demo-diag-1',
        quizId: 'diagnostic-01',
        quizTitle: 'Baseline SSA Diagnostic Assessment',
        completedAt: new Date(Date.now() - 86400000 * 3).toISOString(),
        scoreRaw: 13,
        scoreTotal: 16,
        scorePercent: 81.25,
        isPassingSSA: true,
        timeElapsedSeconds: 1650,
        answers: {
          'oa2-01': { questionId: 'oa2-01', studentAnswer: 'A', isCorrect: true },
          'oa3-01': { questionId: 'oa3-01', studentAnswer: 'A', isCorrect: true },
          'nbt1-01': { questionId: 'nbt1-01', studentAnswer: 'A', isCorrect: true },
          'nbt3-01': { questionId: 'nbt3-01', studentAnswer: 'A', isCorrect: true },
          'nbt5-01': { questionId: 'nbt5-01', studentAnswer: '23976', isCorrect: true },
          'nbt6-01': { questionId: 'nbt6-01', studentAnswer: '212', isCorrect: true },
          'nbt7-01': { questionId: 'nbt7-01', studentAnswer: '53.25', isCorrect: false }, // Missed
          'nf1-01': { questionId: 'nf1-01', studentAnswer: '4 7/12', isCorrect: true },
          'nf3-01': { questionId: 'nf3-01', studentAnswer: 'A', isCorrect: true },
          'nf4-01': { questionId: 'nf4-01', studentAnswer: '12', isCorrect: true },
          'nf7-01': { questionId: 'nf7-01', studentAnswer: '24', isCorrect: true },
          'md1-01': { questionId: 'md1-01', studentAnswer: '6000', isCorrect: true },
          'md2-01': { questionId: 'md2-01', studentAnswer: 'A', isCorrect: true },
          'md4-01': { questionId: 'md4-01', studentAnswer: '160', isCorrect: true },
          'md5-01': { questionId: 'md5-01', studentAnswer: '1440', isCorrect: true },
          'g1-01': { questionId: 'g1-01', studentAnswer: 'B', isCorrect: false } // Missed
        }
      },
      {
        id: 'demo-oa-1',
        quizId: 'mod-oa-01',
        quizTitle: 'Module 1: Operations & Algebraic Thinking Drill',
        domainId: 'OA',
        completedAt: new Date(Date.now() - 86400000 * 1).toISOString(),
        scoreRaw: 6,
        scoreTotal: 7,
        scorePercent: 85.7,
        isPassingSSA: true,
        timeElapsedSeconds: 840,
        answers: {
          'oa2-01': { questionId: 'oa2-01', studentAnswer: 'A', isCorrect: true },
          'oa2-02': { questionId: 'oa2-02', studentAnswer: 'A', isCorrect: true },
          'oa2-03': { questionId: 'oa2-03', studentAnswer: '33', isCorrect: true },
          'oa2-04': { questionId: 'oa2-04', studentAnswer: 'A', isCorrect: true },
          'oa3-01': { questionId: 'oa3-01', studentAnswer: 'A', isCorrect: true },
          'oa3-02': { questionId: 'oa3-02', studentAnswer: '105', isCorrect: true },
          'oa3-03': { questionId: 'oa3-03', studentAnswer: '75', isCorrect: false } // Missed
        }
      }
    ];

    setState(prev => ({
      ...prev,
      attempts: demoAttempts,
      missedQuestionIds: ['nbt7-01', 'g1-01', 'oa3-03']
    }));
  };

  // Compute standard mastery from all question attempts
  const getStandardMastery = (standardCode: string): StandardMastery => {
    let totalAttempts = 0;
    let correctAttempts = 0;
    let lastTestedAt: string | undefined = undefined;

    // Iterate through all attempts in reverse chronological order
    for (const attempt of state.attempts) {
      for (const [qId, ans] of Object.entries(attempt.answers)) {
        const q = GRADE_5_AUTHORED.find(item => item.id === qId);
        if (q && q.standardCode === standardCode) {
          totalAttempts++;
          if (ans.isCorrect) {
            correctAttempts++;
          }
          if (!lastTestedAt) {
            lastTestedAt = attempt.completedAt;
          }
        }
      }
    }

    if (totalAttempts === 0) {
      return {
        standardCode,
        totalAttempts: 0,
        correctAttempts: 0,
        masteryPercent: 0,
        status: 'untested'
      };
    }

    const masteryPercent = Math.round((correctAttempts / totalAttempts) * 100);
    let status: StandardMastery['status'] = 'needs-focus';
    if (masteryPercent >= 80) {
      status = 'acceleration-ready';
    } else if (masteryPercent >= 65) {
      status = 'approaching';
    }

    return {
      standardCode,
      totalAttempts,
      correctAttempts,
      masteryPercent,
      status,
      lastTestedAt
    };
  };

  // Compute domain mastery
  const getDomainMastery = (domainId: string): DomainMastery => {
    const domain = GRADE_5_DOMAINS.find(d => d.id === domainId);
    if (!domain) {
      return {
        domainId,
        masteryPercent: 0,
        totalQuestionsAnswered: 0,
        totalCorrect: 0,
        status: 'untested',
        standardsCount: 0,
        standardsMastered: 0
      };
    }

    let totalAnswered = 0;
    let totalCorrect = 0;

    for (const attempt of state.attempts) {
      for (const [qId, ans] of Object.entries(attempt.answers)) {
        const q = GRADE_5_AUTHORED.find(item => item.id === qId);
        if (q && q.domainId === domainId) {
          totalAnswered++;
          if (ans.isCorrect) totalCorrect++;
        }
      }
    }

    let standardsMastered = 0;
    domain.standards.forEach(std => {
      const sm = getStandardMastery(std.code);
      if (sm.status === 'acceleration-ready') {
        standardsMastered++;
      }
    });

    if (totalAnswered === 0) {
      return {
        domainId,
        masteryPercent: 0,
        totalQuestionsAnswered: 0,
        totalCorrect: 0,
        status: 'untested',
        standardsCount: domain.standards.length,
        standardsMastered: 0
      };
    }

    const masteryPercent = Math.round((totalCorrect / totalAnswered) * 100);
    let status: DomainMastery['status'] = 'needs-focus';
    if (masteryPercent >= 80) {
      status = 'acceleration-ready';
    } else if (masteryPercent >= 65) {
      status = 'approaching';
    }

    return {
      domainId,
      masteryPercent,
      totalQuestionsAnswered: totalAnswered,
      totalCorrect,
      status,
      standardsCount: domain.standards.length,
      standardsMastered
    };
  };

  // Compute overall NC EOG blueprint weighted readiness
  const overallReadiness = useMemo(() => {
    let totalWeight = 0;
    let weightedSum = 0;
    let totalQuestionsAnswered = 0;
    let totalCorrectAnswered = 0;

    GRADE_5_DOMAINS.forEach(domain => {
      const dm = getDomainMastery(domain.id);
      totalQuestionsAnswered += dm.totalQuestionsAnswered;
      totalCorrectAnswered += dm.totalCorrect;

      if (dm.status !== 'untested') {
        weightedSum += dm.masteryPercent * domain.officialWeightMidpoint;
        totalWeight += domain.officialWeightMidpoint;
      }
    });

    const weightedScore = totalWeight > 0 ? Math.round(weightedSum / totalWeight) : 0;
    const isAccelerationReady = weightedScore >= 80;

    // Count total mastered standards
    let masteredStandardsCount = 0;
    GRADE_5_STANDARDS.forEach(std => {
      const sm = getStandardMastery(std.code);
      if (sm.status === 'acceleration-ready') {
        masteredStandardsCount++;
      }
    });

    const overallAccuracy = totalQuestionsAnswered > 0
      ? Math.round((totalCorrectAnswered / totalQuestionsAnswered) * 100)
      : 0;

    // Days until target exam date
    const targetDate = new Date(state.settings.targetExamDate);
    const now = new Date();
    const diffTime = targetDate.getTime() - now.getTime();
    const daysUntilExam = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));

    // Pace recommendation: target at least 150 total questions practiced before exam
    const remainingToPractice = Math.max(0, 150 - totalQuestionsAnswered);
    const dailyQuestionsPace = daysUntilExam > 0 ? Math.ceil(remainingToPractice / daysUntilExam) : 5;

    return {
      weightedScore,
      isAccelerationReady,
      masteredStandardsCount,
      totalStandardsCount: GRADE_5_STANDARDS.length,
      totalQuestionsAnswered,
      totalCorrectAnswered,
      overallAccuracy,
      daysUntilExam,
      dailyQuestionsPace
    };
  }, [state.attempts, state.settings.targetExamDate]);

  return (
    <ProgressContext.Provider
      value={{
        state,
        recordQuizAttempt,
        clearMissedQuestion,
        updateSettings,
        resetAllProgress,
        loadDemoData,
        exportDataJson,
        importDataJson,
        getStandardMastery,
        getDomainMastery,
        overallReadiness
      }}
    >
      {children}
    </ProgressContext.Provider>
  );
};

export const useProgress = () => {
  const context = useContext(ProgressContext);
  if (!context) {
    throw new Error('useProgress must be used within a ProgressProvider');
  }
  return context;
};
