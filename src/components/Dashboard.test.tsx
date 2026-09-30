import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ProgressProvider } from '../context/ProgressContext';
import { Dashboard } from './Dashboard';
import { newProfile, saveState } from '../state/storage';
import type { AppStateV2 } from '../state/types';
import type { Grade } from '../curriculum/types';
import { getCurriculum } from '../curriculum/registry';
import { buildReadinessAttempt } from '../state/readiness.testkit';
import type { QuizAttempt } from '../types';

function stateForGrade(grade: Grade): AppStateV2 {
  const profile = newProfile({ id: `p-${grade}`, studentName: 'Test', grade });
  return { version: 2, profiles: [profile], activeProfileId: profile.id };
}

// Reaching the "what to do next" hero's below-bar branch (F5) requires a
// profile that has taken its diagnostic but scores under the passing bar -
// a fresh profile never leaves the "Take the Baseline Diagnostic" branch.
function stateHavingTakenDiagnostic(grade: Grade): AppStateV2 {
  const diagnosticId = getCurriculum(grade).quizzes.find((q) => q.isDiagnostic)!.id;
  const profile = newProfile({
    id: `p-${grade}-taken`,
    studentName: 'Test',
    grade,
    attempts: [
      {
        id: 'a1',
        quizId: diagnosticId,
        quizTitle: 'Baseline SSA Diagnostic Assessment',
        completedAt: new Date().toISOString(),
        scoreRaw: 1,
        scoreTotal: 10,
        scorePercent: 10,
        isPassingSSA: false,
        timeElapsedSeconds: 60,
        answers: {},
      },
    ],
  });
  return { version: 2, profiles: [profile], activeProfileId: profile.id };
}

const renderDashboard = () =>
  render(
    <ProgressProvider>
      <Dashboard
        onStartQuiz={vi.fn()}
        onOpenStudyGuide={vi.fn()}
        onNavigateTab={vi.fn()}
        onOpenPaceModal={vi.fn()}
        onOpenReportModal={vi.fn()}
      />
    </ProgressProvider>
  );

describe('Dashboard topic copy', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('F10: topics are compared with a goal, not claimed as an SSA benchmark', () => {
    saveState(localStorage, stateForGrade(5));
    renderDashboard();
    expect(screen.queryByText(/strictly benchmarked/i)).not.toBeInTheDocument();
    expect(
      screen.getByText(/Each topic is compared with the 80% goal; only full practice tests say whether you're ready for SSA\./),
    ).toBeInTheDocument();
  });
});

describe('Dashboard weight labeling', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('claims official NC EOG blueprint weighting only for grade 5, which has one', () => {
    // Grade 5's behaviour must not change (Task 21 constraint).
    saveState(localStorage, stateForGrade(5));
    renderDashboard();
    expect(screen.getByText('Weighted by official NC EOG blueprint domain weights')).toBeInTheDocument();
  });

  it('does not claim official NC EOG blueprint weighting for grade 2', () => {
    saveState(localStorage, stateForGrade(2));
    renderDashboard();
    expect(
      screen.queryByText(/Weighted by official NC EOG blueprint domain weights/),
    ).not.toBeInTheDocument();
    // Nor does any domain card fall back to the raw, unlabelled placeholder
    // string that officialWeightRange holds for an unweighted grade.
    expect(screen.queryByText(/No state assessment at this grade/)).not.toBeInTheDocument();
    // The gauge subtitle instead tells the truth about what it weights by.
    expect(
      screen.getByText(/Weighted by each domain's share of Grade 2 standards/),
    ).toBeInTheDocument();
  });

  it('compacts the grouped MD/G domain card badge onto one line (Finding F1)', () => {
    // Regression from Task 21: the raw weightValue() (= weightLabel()) full
    // wording wrapped the badge to two lines and pushed the card titles
    // below their neighbours.
    saveState(localStorage, stateForGrade(5));
    renderDashboard();
    expect(screen.getByText('MD • 19–23% with G Weight')).toBeInTheDocument();
    expect(screen.getByText('G • 19–23% with MD Weight')).toBeInTheDocument();
  });

  it('pins the grade 2 domain card badge exactly, unaffected by the F1 compact fix', () => {
    saveState(localStorage, stateForGrade(2));
    renderDashboard();
    expect(screen.getByText('OA • 17% Weight')).toBeInTheDocument();
  });

  it('says "standards", never "blueprint", in the hero banner at grade 2 (Finding F7)', () => {
    saveState(localStorage, stateForGrade(2));
    renderDashboard();
    expect(screen.queryByText(/blueprint/i)).not.toBeInTheDocument();
  });

  it('keeps the exact hero banner wording for grade 5, which has a real blueprint (Finding F7)', () => {
    saveState(localStorage, stateForGrade(5));
    renderDashboard();
    expect(
      screen.getByText(/North Carolina Standard Course of Study \(NCSCOS\) Grade 5 Mathematics/),
    ).toBeInTheDocument();
    expect(screen.getByText(/blueprint with multi-step reasoning/)).toBeInTheDocument();
  });

  it('advises the domains furthest below the bar for grade 2, not "high-weight domains" (Finding F5)', () => {
    saveState(localStorage, stateHavingTakenDiagnostic(2));
    renderDashboard();
    expect(screen.queryByText(/High-Weight Domains/)).not.toBeInTheDocument();
    expect(screen.getByText(/Domains Furthest Below/)).toBeInTheDocument();
  });

  it('keeps the exact "Drill High-Weight Domains" wording for grade 5 (Finding F5)', () => {
    saveState(localStorage, stateHavingTakenDiagnostic(5));
    renderDashboard();
    expect(screen.getByText(/Drill High-Weight Domains to Reach the \d+% Benchmark/)).toBeInTheDocument();
  });
});

describe('Dashboard readiness labels (F3, F4)', () => {
  beforeEach(() => localStorage.clear());

  it('F4: a domain with 3 of 3 right is not labelled Ready', () => {
    const code = getCurriculum(5).domains.find((d) => d.id === 'NF')!.standards[0].code;
    const attempt: QuizAttempt = {
      id: 'a1', quizId: 'x', quizTitle: 'x', completedAt: '2026-09-30T00:00:00.000Z',
      scoreRaw: 3, scoreTotal: 3, scorePercent: 100, isPassingSSA: true, timeElapsedSeconds: 1,
      answers: Object.fromEntries([0, 1, 2].map((i) => [`q${i}`, { questionId: `q${i}`, studentAnswer: 'A', isCorrect: true, standardCode: code }])),
    };
    saveState(localStorage, { version: 2, activeProfileId: 'p', profiles: [newProfile({ id: 'p', studentName: 'T', attempts: [attempt] })] });
    renderDashboard();
    expect(screen.getByText('Needs more answers')).toBeInTheDocument();
    expect(screen.queryByText('Ready')).not.toBeInTheDocument();
  });

  it('F3: at 79.6% the headline, badge and gap all say "not there yet"', () => {
    const diagnosticId = getCurriculum(5).quizzes.find((q) => q.isDiagnostic)!.id;
    saveState(localStorage, {
      version: 2, activeProfileId: 'p',
      profiles: [newProfile({ id: 'p', studentName: 'T', attempts: [buildReadinessAttempt(250, 199, diagnosticId)] })],
    });
    renderDashboard();
    expect(screen.getByTestId('readiness-badge')).toHaveAttribute('data-readiness-state', 'building');
    expect(screen.getByText(/Current Composite: 79%/)).toBeInTheDocument();
    expect(screen.getByText(/Need 1% more for SSA threshold/)).toBeInTheDocument();
    expect(screen.queryByText(/Acceleration Ready!/)).not.toBeInTheDocument();
    expect(screen.getByText(/Drill High-Weight Domains/)).toBeInTheDocument();
  });
});

describe('Dashboard history chips (F10)', () => {
  beforeEach(() => localStorage.clear());
  it('F10: a passed drill is not labelled "SSA Passed"', () => {
    const attempt: QuizAttempt = {
      id: 'd1', quizId: 'drill-nf1', quizTitle: 'NF drill', completedAt: '2026-09-30T00:00:00.000Z',
      scoreRaw: 4, scoreTotal: 5, scorePercent: 80, isPassingSSA: true, timeElapsedSeconds: 60, answers: {},
    };
    saveState(localStorage, { version: 2, activeProfileId: 'p', profiles: [newProfile({ id: 'p', studentName: 'T', attempts: [attempt] })] });
    renderDashboard();
    expect(screen.queryByText(/SSA Passed/)).not.toBeInTheDocument();
    expect(screen.getByText('Practice')).toBeInTheDocument();
  });
});

describe('Dashboard quizzes taken (F14)', () => {
  beforeEach(() => localStorage.clear());
  const at = (id: string, code: string): QuizAttempt => ({
    id, quizId: 'x', quizTitle: 'x', completedAt: '2026-09-30T00:00:00.000Z', scoreRaw: 1, scoreTotal: 1, scorePercent: 100,
    isPassingSSA: true, timeElapsedSeconds: 1,
    answers: { q: { questionId: 'q', studentAnswer: 'A', isCorrect: true, standardCode: code } },
  });
  it('F14: counts only the current grade attempts', () => {
    saveState(localStorage, { version: 2, activeProfileId: 'p', profiles: [newProfile({
      id: 'p', studentName: 'T', grade: 5, attempts: [at('a', 'NC.5.NF.1'), at('b', 'NC.5.NBT.1'), at('c', 'NC.3.OA.1')],
    })] });
    renderDashboard();
    expect(screen.getByText('2 Quizzes Taken')).toBeInTheDocument();
  });
});
