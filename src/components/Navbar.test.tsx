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

describe('Navbar countdown', () => {
  beforeEach(() => localStorage.clear());

  it('shows "Test date passed" for a past date, never "0 days left"', () => {
    const s = stateForGrade(5);
    s.profiles[0].targetExamDate = '2020-01-01';
    saveState(localStorage, s);
    renderNavbar();
    expect(screen.getByText('Test date passed')).toBeInTheDocument();
    expect(screen.queryByText(/0 days/i)).not.toBeInTheDocument();
  });

  it('shows "Test is today" on the day', () => {
    const d = new Date();
    const s = stateForGrade(5);
    s.profiles[0].targetExamDate = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    saveState(localStorage, s);
    renderNavbar();
    expect(screen.getByText('Test is today')).toBeInTheDocument();
  });
});

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
