import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ProgressProvider } from '../context/ProgressContext';
import { StudyGuideModal } from './StudyGuideModal';
import { newProfile, saveState } from '../state/storage';
import type { AppStateV2 } from '../state/types';
import type { Grade } from '../curriculum/types';

function stateForGrade(grade: Grade): AppStateV2 {
  const profile = newProfile({ id: `p-${grade}`, studentName: 'Test', grade });
  return { version: 2, profiles: [profile], activeProfileId: profile.id };
}

const renderGuide = (standardCode: string) =>
  render(
    <ProgressProvider>
      <StudyGuideModal standardCode={standardCode} onClose={vi.fn()} onStartStandardDrill={vi.fn()} />
    </ProgressProvider>
  );

describe('StudyGuideModal common-traps heading (Finding F2)', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('derives the traps heading from the active grade for grade 5 too (Finding F2)', () => {
    // Neither of F2's two acceptable fixes (derive from curriculum.grade, or
    // drop the grade entirely) preserves the old hardcoded "4th/5th Grade"
    // string, so this is one of the few spots the Task 21 standing rule
    // ("Grade 5 output must not change") does not apply to verbatim - F2
    // says so by construction, not by exemption clause.
    saveState(localStorage, stateForGrade(5));
    renderGuide('NC.5.OA.2');
    expect(screen.getByText('Common Grade 5 Traps to Avoid')).toBeInTheDocument();
    expect(screen.queryByText(/4th\/5th/)).not.toBeInTheDocument();
  });

  it('never tells a grade 2 parent their child is making "4th/5th grade" traps', () => {
    // NC.2.OA.1's guide has commonTraps, and previously hardcoded "Common
    // 4th/5th Grade Traps to Avoid" regardless of the actual grade.
    saveState(localStorage, stateForGrade(2));
    renderGuide('NC.2.OA.1');
    expect(screen.queryByText(/4th\/5th/)).not.toBeInTheDocument();
    expect(screen.getByText('Common Grade 2 Traps to Avoid')).toBeInTheDocument();
  });
});
