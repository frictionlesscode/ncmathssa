import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { ProgressProvider, useProgress } from './ProgressContext';

function Probe() {
  const { profile, curriculum, readiness, addProfile, switchProfile, state } = useProgress();
  return (
    <div>
      <span data-testid="name">{profile.studentName}</span>
      <span data-testid="grade">{curriculum.grade}</span>
      <span data-testid="pass">{curriculum.ssa.passingPercent}</span>
      <span data-testid="readiness">{readiness}</span>
      <span data-testid="count">{state.profiles.length}</span>
      <button onClick={() => addProfile('Second', 5)}>add</button>
      <button onClick={() => switchProfile(state.profiles[0].id)}>first</button>
    </div>
  );
}

const renderApp = () => render(<ProgressProvider><Probe /></ProgressProvider>);

describe('ProgressProvider', () => {
  beforeEach(() => localStorage.clear());

  it('supplies the active profile curriculum, not a hardcoded grade 5 import', () => {
    renderApp();
    expect(screen.getByTestId('grade')).toHaveTextContent('5');
    expect(screen.getByTestId('pass')).toHaveTextContent('80');
  });

  it('starts at zero readiness with no attempts', () => {
    renderApp();
    expect(screen.getByTestId('readiness')).toHaveTextContent('0');
  });

  it('adds and switches profiles', () => {
    renderApp();
    act(() => screen.getByText('add').click());
    expect(screen.getByTestId('count')).toHaveTextContent('2');
    expect(screen.getByTestId('name')).toHaveTextContent('Second');
    act(() => screen.getByText('first').click());
    expect(screen.getByTestId('name')).not.toHaveTextContent('Second');
  });

  it('persists across a remount', () => {
    const { unmount } = renderApp();
    act(() => screen.getByText('add').click());
    unmount();
    renderApp();
    expect(screen.getByTestId('count')).toHaveTextContent('2');
  });
});
