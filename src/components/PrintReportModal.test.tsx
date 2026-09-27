import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ProgressProvider } from '../context/ProgressContext';
import { PrintReportModal } from './PrintReportModal';
import { newProfile, saveState } from '../state/storage';
import type { AppStateV2 } from '../state/types';
import type { Grade } from '../curriculum/types';

function stateForGrade(grade: Grade): AppStateV2 {
  const profile = newProfile({ id: `p-${grade}`, studentName: 'Test', grade });
  return { version: 2, profiles: [profile], activeProfileId: profile.id };
}

const renderModal = () =>
  render(
    <ProgressProvider>
      <PrintReportModal isOpen onClose={vi.fn()} />
    </ProgressProvider>
  );

describe('PrintReportModal weight labeling', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('still cites the NC Blueprint Weight and the blueprint focus advice for grade 5', () => {
    // Grade 5's behaviour must not change (Task 21 constraint).
    saveState(localStorage, stateForGrade(5));
    renderModal();
    expect(screen.getByText('NC Blueprint Weight')).toBeInTheDocument();
    expect(screen.getByText('Focus by Blueprint Weight:')).toBeInTheDocument();
    expect(screen.getByText(/highest NC EOG blueprint weight/)).toBeInTheDocument();
  });

  it('never claims a blueprint for grade 2 in the printed report', () => {
    saveState(localStorage, stateForGrade(2));
    renderModal();
    // The recommendations paragraph is allowed to *disclaim* a blueprint
    // ("no official state blueprint at this grade to rank by weight"); this
    // checks for the false-claim phrase, not the bare word.
    expect(screen.queryByText(/blueprint weight/i)).not.toBeInTheDocument();
    expect(screen.getByText('Share of Grade Standards')).toBeInTheDocument();
    // Finding F6: "Focus by Standards Share:" contradicted its own sentence,
    // which prioritises the domains furthest below the bar, not the share.
    expect(screen.queryByText('Focus by Standards Share:')).not.toBeInTheDocument();
    expect(screen.getByText('Focus on the Biggest Gaps:')).toBeInTheDocument();
    // The table's weight column must show a real computed share, never the
    // "No state assessment at this grade" placeholder glued to the heading
    // (Ruling 21-3).
    expect(screen.queryByText(/No state assessment at this grade/)).not.toBeInTheDocument();
    expect(screen.getAllByText(/^\d+%$/).length).toBeGreaterThan(0);
  });

  it('recommends the mock-exam count and window it actually has for grade 2 (Finding F4)', () => {
    // Grade 2 has one 40-minute mock, not "two full mock exams within a
    // 60-minute window" (grade 5's own facts).
    saveState(localStorage, stateForGrade(2));
    renderModal();
    expect(
      screen.getByText(/complete at least one full mock exam within a 40-minute window/),
    ).toBeInTheDocument();
  });

  it("keeps grade 5's exact mock-testing sentence unchanged (Finding F4)", () => {
    saveState(localStorage, stateForGrade(5));
    renderModal();
    expect(
      screen.getByText(/Have the student complete at least two full mock exams within a 60-minute window before the Wake County test day\./),
    ).toBeInTheDocument();
  });

  it('advises the domains furthest below the bar, not "high-weight domains", for grade 2 (Finding F5)', () => {
    saveState(localStorage, stateForGrade(2));
    renderModal();
    expect(screen.queryByText(/high-weight domains is recommended/)).not.toBeInTheDocument();
  });

  it('keeps grade 5\'s exact composite-readiness wording unchanged (Finding F5)', () => {
    saveState(localStorage, stateForGrade(5));
    renderModal();
    expect(screen.getByText(/Focused drill on high-weight domains is recommended\./)).toBeInTheDocument();
  });
});
