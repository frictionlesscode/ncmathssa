import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ProgressProvider } from '../context/ProgressContext';
import { Navbar } from './Navbar';
import { newProfile, saveState } from '../state/storage';
import type { AppStateV2 } from '../state/types';
import type { Grade } from '../curriculum/types';

function stateForGrade(grade: Grade): AppStateV2 {
  const profile = newProfile({ id: `p-${grade}`, studentName: 'Test', grade });
  return { version: 2, profiles: [profile], activeProfileId: profile.id };
}

const renderNavbar = () =>
  render(
    <ProgressProvider>
      <Navbar
        currentTab="dashboard"
        onSelectTab={vi.fn()}
        onOpenPaceModal={vi.fn()}
        onOpenReportModal={vi.fn()}
      />
    </ProgressProvider>
  );

describe('Navbar top banner (Finding F7)', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('keeps the exact "Blueprint" banner wording for grade 5, which has a real blueprint', () => {
    saveState(localStorage, stateForGrade(5));
    renderNavbar();
    expect(screen.getByText('Grade 5 Mathematics Blueprint (targets Grade 5)')).toBeInTheDocument();
  });

  it('never says "blueprint" in the top banner for grade 2, which has none', () => {
    saveState(localStorage, stateForGrade(2));
    renderNavbar();
    expect(screen.queryByText(/blueprint/i)).not.toBeInTheDocument();
    expect(screen.getByText('Grade 2 Mathematics Standards (targets Grade 2)')).toBeInTheDocument();
  });
});
