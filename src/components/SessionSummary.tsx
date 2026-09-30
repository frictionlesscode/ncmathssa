import React, { useMemo } from 'react';
import type { QuizAttempt } from '../types';
import { useProgress } from '../context/ProgressContext';
import { summarizeAttempt } from '../engine/sessionSummary';
import { buildPath, roundRank, type Round } from '../engine/path';
import { formatPercent } from '../engine/mastery';

interface SessionSummaryProps {
  attempt: QuizAttempt;
  readinessBefore: number;
  roundBefore: Round | 'test';
  onHome: () => void;
}

/** The parent's plain-English end-of-session summary (spec 6.3). */
export const SessionSummary: React.FC<SessionSummaryProps> = ({ attempt, readinessBefore, roundBefore, onHome }) => {
  const { curriculum, readiness, profile } = useProgress();
  const summary = useMemo(() => summarizeAttempt(attempt, curriculum), [attempt, curriculum]);
  const path = useMemo(
    () => buildPath({ curriculum, attempts: profile.attempts, checkupSkipped: Boolean(profile.checkupSkipped),
      testDate: profile.targetExamDate, now: new Date() }),
    [curriculum, profile.attempts, profile.checkupSkipped, profile.targetExamDate],
  );
  const finishedRound = roundRank(path.currentRound) > roundRank(roundBefore) && roundBefore !== 'test' ? roundBefore : null;

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-10">
      <div className="max-w-lg w-full bg-white rounded-xl border border-slate-200 p-6 space-y-5">
        <h1 className="text-xl font-bold text-slate-900">{profile.studentName}&rsquo;s session</h1>
        <p className="text-slate-700">{summary.correct} out of {summary.total} right.</p>

        {finishedRound !== null && <p className="text-lg font-semibold text-emerald-700">Round {finishedRound} finished! 🎉</p>}

        {summary.strong.length > 0 && (
          <div>
            <h2 className="font-semibold text-slate-800">Strong today ✅</h2>
            <ul className="mt-1 space-y-1">{summary.strong.map((t) => <li key={t.domainId}>{t.name}</li>)}</ul>
          </div>
        )}

        {summary.tricky.length > 0 && (
          <div>
            <h2 className="font-semibold text-slate-800">Tricky</h2>
            <ul className="mt-1 space-y-1">
              {summary.tricky.map((t) => (
                <li key={t.domainId}>{t.name} <span className="text-slate-500">(missed {t.total - t.correct})</span></li>
              ))}
            </ul>
            <p className="mt-1 text-sm text-slate-600">These will come back next time.</p>
          </div>
        )}

        <p className="text-slate-700">Readiness: {formatPercent(readinessBefore)} → {formatPercent(readiness)}</p>

        <button onClick={onHome} className="w-full rounded-md bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-700">
          Back to home
        </button>
      </div>
    </div>
  );
};

export default SessionSummary;
