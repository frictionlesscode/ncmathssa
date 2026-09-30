import { describe, it, expect, vi } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { ProgressProvider, useProgress } from './ProgressContext';
import { SaveBanner } from '../components/SaveBanner';
import { createMemoryStorage } from '../state/memoryStorage';
import { saveState, newProfile, STORAGE_KEY_V2 } from '../state/storage';

function Probe() {
  const { state, updateActiveProfile } = useProgress();
  return (
    <div>
      <span data-testid="count">{state.profiles.length}</span>
      <button onClick={() => updateActiveProfile({ studentName: 'Changed' })}>change</button>
    </div>
  );
}
const renderWith = (access: () => Storage) =>
  render(<ProgressProvider storageAccess={access}><SaveBanner /><Probe /></ProgressProvider>);

describe('saving', () => {
  it('logic-flows High: does not write anything on mount, only after the first change', () => {
    const s = createMemoryStorage();
    saveState(s, { version: 2, activeProfileId: 'p', profiles: [newProfile({ id: 'p', studentName: 'Alex' })] });
    const setItem = vi.spyOn(s, 'setItem');
    renderWith(() => s);
    expect(setItem).not.toHaveBeenCalled();
    act(() => screen.getByText('change').click());
    expect(setItem).toHaveBeenCalledWith(STORAGE_KEY_V2, expect.any(String));
  });

  it('logic-flows Medium: a failing write shows the persistent banner and the app keeps running', () => {
    const s = createMemoryStorage();
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(s, 'setItem').mockImplementation(() => { throw new DOMException('QuotaExceededError'); });
    renderWith(() => s);
    expect(screen.queryByText(/isn't being saved/i)).not.toBeInTheDocument();
    act(() => screen.getByText('change').click());
    expect(screen.getByRole('alert')).toHaveTextContent("Progress isn't being saved on this device");
    expect(screen.getByRole('button', { name: /export/i })).toBeInTheDocument();
    expect(screen.getByTestId('count')).toHaveTextContent('1');
  });

  it('logic-flows Medium: blocked localStorage falls back to memory and shows the banner at once', () => {
    renderWith(() => { throw new DOMException('denied', 'SecurityError'); });
    expect(screen.getByRole('alert')).toHaveTextContent(/isn't being saved/i);
    act(() => screen.getByText('change').click());
    expect(screen.getByTestId('count')).toHaveTextContent('1');
  });
});
