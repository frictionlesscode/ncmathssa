import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ProgressProvider } from '../context/ProgressContext';
import { QuizzesListView } from './QuizzesListView';
import { newProfile, saveState } from '../state/storage';
import type { AppStateV2 } from '../state/types';
import type { Grade } from '../curriculum/types';

function stateForGrade(grade: Grade): AppStateV2 {
  const profile = newProfile({ id: `p-${grade}`, studentName: 'Test', grade });
  return { version: 2, profiles: [profile], activeProfileId: profile.id };
}

const renderView = () =>
  render(
    <ProgressProvider>
      <QuizzesListView
        onStartQuiz={vi.fn()}
        onStartStandardDrill={vi.fn()}
        onStartAdaptiveSession={vi.fn()}
      />
    </ProgressProvider>
  );

describe('QuizzesListView module drill weight labeling', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("labels grade 5's grouped MD+G drill cards through weightLabel, not a bare band", () => {
    // Grade 5's behaviour must not change (Task 21 constraint), and this
    // also closes Ruling 21-8: MD and G share one published band, so a bare
    // `officialWeightRange` on the module card understates that it is
    // shared - `weightValue` (which defers to `weightLabel` for a
    // blueprint grade) must print the "combined" annotation.
    saveState(localStorage, stateForGrade(5));
    renderView();
    // Both the MD and the G module drill cards share the one published
    // band, so the annotation appears once per card.
    expect(screen.getAllByText(/Measurement & Data and Geometry combined/).length).toBe(2);
  });

  it('never shows the unweighted placeholder string on a grade 2 module drill card', () => {
    saveState(localStorage, stateForGrade(2));
    renderView();
    expect(screen.queryByText(/No state assessment at this grade/)).not.toBeInTheDocument();
    // No card claims an official blueprint weight; the mock exam's own
    // subtitle is allowed to *disclaim* one ("no official state blueprint
    // to allocate against"), so this checks the specific false-claim
    // phrase, not the bare word.
    expect(screen.queryByText(/blueprint weight/i)).not.toBeInTheDocument();
    // Every module drill card instead shows a real computed percentage.
    expect(screen.getByText(/OA •/)).toBeInTheDocument();
  });
});
