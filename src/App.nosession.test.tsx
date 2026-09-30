import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DISCLAIMER_STORAGE_KEY, DISCLAIMER_VERSION } from './components/DisclaimerGate';
import { newProfile, saveState } from './state/storage';

vi.mock('./engine/pathSession', () => ({ sessionForStep: () => null }));

import { App } from './App';

describe('App when no session can be built', () => {
  beforeEach(() => localStorage.clear());

  it('tells the parent instead of doing nothing', async () => {
    localStorage.setItem(DISCLAIMER_STORAGE_KEY,
      JSON.stringify({ version: DISCLAIMER_VERSION, acceptedAt: '2026-09-30T00:00:00.000Z' }));
    const p = newProfile({ id: 'a', studentName: 'Alex' });
    saveState(localStorage, { version: 2, profiles: [p], activeProfileId: p.id });
    render(<App />);
    await userEvent.click(screen.getByRole('button', { name: /start the check-up/i }));
    expect(screen.getByRole('alert')).toHaveTextContent(/couldn't build that session/i);
    expect(screen.getByText(/alex · grade 5 math/i)).toBeInTheDocument();
  });

  it('clears the notice when leaving the home screen', async () => {
    localStorage.setItem(DISCLAIMER_STORAGE_KEY,
      JSON.stringify({ version: DISCLAIMER_VERSION, acceptedAt: '2026-09-30T00:00:00.000Z' }));
    const p = newProfile({ id: 'a', studentName: 'Alex' });
    saveState(localStorage, { version: 2, profiles: [p], activeProfileId: p.id });
    render(<App />);
    await userEvent.click(screen.getByRole('button', { name: /start the check-up/i }));
    expect(screen.getByRole('alert')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: /detailed view/i }));
    await userEvent.click(screen.getByRole('button', { name: /back/i }));
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });
});
