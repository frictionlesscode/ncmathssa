import React from 'react';
import type { QuizAttempt } from '../types';

export const ENCOURAGEMENT = {
  high: ['Amazing work today!', 'You are on fire!', 'Math superstar!'],
  mid: ['Great effort. Keep it up!', 'You are getting stronger every time.', 'Nice job sticking with it!'],
  low: ['Tough ones today, and you kept going!', 'Every question makes your brain stronger.', 'Practice is how we grow. Great job trying!'],
};

export function encouragementFor(correct: number, total: number): string {
  const pct = total === 0 ? 0 : (correct / total) * 100;
  const list = pct >= 80 ? ENCOURAGEMENT.high : pct >= 50 ? ENCOURAGEMENT.mid : ENCOURAGEMENT.low;
  return list[total % list.length];
}

/** The child's end-of-session screen (spec 6.3). */
export const KidDone: React.FC<{ attempt: QuizAttempt; onHandBack: () => void }> = ({ attempt, onHandBack }) => (
  <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
    <div className="max-w-md w-full bg-white rounded-2xl border border-slate-200 p-8 text-center space-y-4">
      <h1 className="text-3xl font-bold text-slate-900">You did it!</h1>
      <p className="text-2xl text-slate-800">{attempt.scoreRaw} out of {attempt.scoreTotal} ⭐</p>
      <p className="text-slate-600">{encouragementFor(attempt.scoreRaw, attempt.scoreTotal)}</p>
      <button onClick={onHandBack} className="w-full rounded-xl bg-blue-600 px-4 py-3 text-lg font-semibold text-white hover:bg-blue-700">
        Hand back to your grown-up
      </button>
    </div>
  </div>
);

export default KidDone;
