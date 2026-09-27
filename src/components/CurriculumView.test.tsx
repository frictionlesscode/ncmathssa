import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ProgressProvider } from '../context/ProgressContext';
import { CurriculumView } from './CurriculumView';
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
      <CurriculumView onStartStandardDrill={vi.fn()} onOpenStudyGuide={vi.fn()} />
    </ProgressProvider>
  );

describe('CurriculumView weight labeling', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('still calls it the NC Blueprint Weight for grade 5, which has a real blueprint', () => {
    // Grade 5's behaviour must not change (Task 21 constraint): the
    // published blueprint band still reads as official.
    saveState(localStorage, stateForGrade(5));
    renderView();
    expect(screen.getAllByText(/NC Blueprint Weight:/).length).toBeGreaterThan(0);
    // The domain filter pills also cite a real band for grade 5.
    expect(screen.getByRole('button', { name: /^NF \(/ })).toBeInTheDocument();
  });

  it('never claims a blueprint for grade 2, which NCDPI does not publish one for', () => {
    saveState(localStorage, stateForGrade(2));
    renderView();
    expect(screen.queryByText(/NC Blueprint Weight/)).not.toBeInTheDocument();
    // "Content Blueprint" / "Standard Blueprints" in the page chrome name
    // the curriculum document itself (true at every grade, per Dashboard's
    // equivalent NCSCOS reference); only the WEIGHT claim is grade-specific.
    expect(screen.queryByText(/blueprint weight/i)).not.toBeInTheDocument();
    // The heading calls the figure what it is...
    expect(screen.getAllByText(/Share of Grade Standards:/).length).toBeGreaterThan(0);
    // ...and the value beside it is a real computed share, never the
    // placeholder string glued onto an honest heading (Ruling 21-3).
    expect(screen.queryByText(/No state assessment at this grade/)).not.toBeInTheDocument();
    // The domain filter pills carry the same fix.
    expect(screen.getByRole('button', { name: /^OA \(\d+%\)$/ })).toBeInTheDocument();
  });
});
