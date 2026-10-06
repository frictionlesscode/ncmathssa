import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ProgressProvider, useProgress } from '../context/ProgressContext';
import { DetailedView } from './DetailedView';
import { newProfile, saveState } from '../state/storage';

const Switcher = () => {
  const { switchProfile } = useProgress();
  return <button onClick={() => switchProfile('b')}>switch to Sam</button>;
};

describe('DetailedView settings modal', () => {
  beforeEach(() => localStorage.clear());

  it('logic-flows High: opens with the ACTIVE student, not the one shown when the view mounted', async () => {
    saveState(localStorage, {
      version: 2, activeProfileId: 'a',
      profiles: [newProfile({ id: 'a', studentName: 'Alex' }), newProfile({ id: 'b', studentName: 'Sam' })],
    });
    render(<ProgressProvider><DetailedView onStartQuiz={vi.fn()} onBack={vi.fn()} /><Switcher /></ProgressProvider>);
    act(() => screen.getByText('switch to Sam').click());
    await userEvent.click(screen.getByTitle(/study pace & test date settings/i));
    expect(screen.getByLabelText(/student name/i)).toHaveValue('Sam');
    expect(screen.queryByDisplayValue('Alex')).not.toBeInTheDocument();
  });
});
