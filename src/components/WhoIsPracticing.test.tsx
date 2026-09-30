import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ProgressProvider, useProgress } from '../context/ProgressContext';
import { WhoIsPracticing } from './WhoIsPracticing';
import { newProfile, saveState } from '../state/storage';

const ActiveName = () => <p data-testid="active">{useProgress().profile.studentName}</p>;

describe('WhoIsPracticing', () => {
  beforeEach(() => localStorage.clear());

  it('switches to the chosen student', async () => {
    saveState(localStorage, { version: 2, activeProfileId: 'a',
      profiles: [newProfile({ id: 'a', studentName: 'Alex', grade: 5 }), newProfile({ id: 's', studentName: 'Sam', grade: 3 })] });
    const onChosen = vi.fn();
    render(<ProgressProvider><WhoIsPracticing onChosen={onChosen} onAddStudent={vi.fn()} /><ActiveName /></ProgressProvider>);
    expect(screen.getByRole('heading', { name: /who.s practicing today\?/i })).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: /sam/i }));
    expect(screen.getByTestId('active')).toHaveTextContent('Sam');
    expect(onChosen).toHaveBeenCalledTimes(1);
  });
});
