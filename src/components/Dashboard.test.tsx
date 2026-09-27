import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ProgressProvider } from '../context/ProgressContext';
import { Dashboard } from './Dashboard';
import { newProfile, saveState } from '../state/storage';
import type { AppStateV2 } from '../state/types';
import type { Grade } from '../curriculum/types';

function stateForGrade(grade: Grade): AppStateV2 {
  const profile = newProfile({ id: `p-${grade}`, studentName: 'Test', grade });
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
});
