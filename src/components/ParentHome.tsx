import React, { useMemo, useState } from 'react';
import { useProgress } from '../context/ProgressContext';
import { buildPath, localDayKey, timeLeftText, roundRank, ROUND_SAMPLE, type NextStep, type Round } from '../engine/path';
import { computePace, type PaceStatus } from '../engine/pace';
import { answeredCount, sessionSizeOf } from '../engine/activeSession';
import { formatPercent, readinessStatus, type MasteryStatus } from '../engine/mastery';
import { StudyPaceModal } from './StudyPaceModal';
import { PrintReportModal } from './PrintReportModal';

interface ParentHomeProps {
  onStartStep: (step: NextStep) => void;
  onContinue: () => void;
  onOpenDetailed: () => void;
  onSwitchStudent: () => void;
  onAddStudent: () => void;
}

const STATUS_LABEL: Record<MasteryStatus, string> = {
  'acceleration-ready': '✅ Strong',
  approaching: '🟡 Getting there',
  'needs-focus': '🔴 Needs work',
  untested: 'Not checked yet',
};
const PACE_LABEL: Record<PaceStatus, string> = {
  'on-track': '✅ On track',
  behind: '⚠️ A bit behind',
  ahead: '🚀 Ahead',
};

function formatDate(ymd: string): string {
  const [y, m, d] = ymd.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

function formatTimestamp(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

function stepLabel(step: NextStep): string {
  switch (step.kind) {
    case 'checkup': return 'Start the check-up';
    case 'practice': return `Start today's practice (Round ${step.round})`;
    case 'round3': return 'Start test-ready practice (Round 3)';
    case 'practice-test': return 'Start the practice test';
  }
}

const link = 'text-sm text-blue-700 underline hover:text-blue-900';

/** The parent's home page (spec 4): tracker, topics, path, one button. */
export const ParentHome: React.FC<ParentHomeProps> = ({
  onStartStep, onContinue, onOpenDetailed, onSwitchStudent, onAddStudent,
}) => {
  const { state, profile, curriculum, readiness, updateActiveProfile } = useProgress();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const passing = curriculum.ssa.passingPercent;

  const now = new Date();
  const dayKey = localDayKey(now);
  const path = useMemo(
    () => buildPath({ curriculum, attempts: profile.attempts, checkupSkipped: Boolean(profile.checkupSkipped),
      testDate: profile.targetExamDate, now }),
    // `now` changes every render; the inputs that matter are listed.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [curriculum, profile.attempts, profile.checkupSkipped, profile.targetExamDate, dayKey],
  );
  const pace = computePace({ path, attempts: profile.attempts, testDate: profile.targetExamDate, now,
    sessionSize: sessionSizeOf(profile), curriculum });
  const saved = profile.activeSession;

  const dateInput = (
    <input
      type="date"
      aria-label="Test date"
      value={profile.targetExamDate}
      onChange={(e) => updateActiveProfile({ targetExamDate: e.target.value })}
      className="ml-2 rounded border border-slate-300 px-2 py-1 text-sm"
    />
  );

  const discard = () => {
    if (window.confirm('Start fresh? The unfinished session will be thrown away.')) {
      updateActiveProfile({ activeSession: undefined });
    }
  };

  const rounds: { round: Round; label: string }[] = [
    { round: 1, label: `Round 1: Try every topic${path.round1Skipped ? ' (skipped)' : ''}` },
    { round: 2, label: `Round 2: Get every topic to ${passing}%` },
    { round: 3, label: `Round 3: Test-ready${path.shortOnTime ? ' (optional)' : ''}` },
  ];
  const marker = (r: Round) =>
    r === 1 && path.round1Skipped ? '–' : roundRank(path.currentRound) > r ? '✔' : path.currentRound === r ? '●' : '○';

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
        {/* 1. Tracker */}
        <section data-testid="readiness-tracker" data-readiness-state={readinessStatus(readiness, passing)} className="bg-white rounded-xl border border-slate-200 p-5 space-y-3">
          <h1 className="text-xl font-bold text-slate-900">{profile.studentName} · Grade {curriculum.grade} math</h1>
          <div>
            <div className="relative h-3 rounded-full bg-slate-200 overflow-hidden" aria-hidden="true">
              <div className="h-full bg-blue-600" style={{ width: `${Math.min(100, readiness)}%` }} />
              <div className="absolute top-0 h-full w-0.5 bg-slate-800" style={{ left: `${passing}%` }} />
            </div>
            <p className="mt-2 text-slate-800">
              <strong>{formatPercent(readiness)} ready</strong> — goal: {passing}%
            </p>
            <p className="text-xs text-slate-500">This is practice readiness, not a prediction of the real test.</p>
          </div>
          {path.practiceTestPassedAt && <p className="font-semibold text-emerald-700">Ready to try for SSA 🎉 (passed {formatTimestamp(path.practiceTestPassedAt)})</p>}
          <div className="text-sm text-slate-700">
            {pace.dateState === 'none' && <p>Add a test date to get a weekly plan {dateInput}</p>}
            {pace.dateState === 'passed' && <p>Test date passed — update it? {dateInput}</p>}
            {(pace.dateState === 'normal' || pace.dateState === 'short') && (
              <>
                <p>
                  Test date: {formatDate(profile.targetExamDate)} · {timeLeftText(pace.daysLeft!)} · {PACE_LABEL[pace.status!]}
                </p>
                {pace.dateState === 'normal' ? (
                  <p>
                    Plan: about {pace.sessionsPerWeek} {pace.sessionsPerWeek === 1 ? 'session' : 'sessions'} a week, ~20 minutes each
                  </p>
                ) : (
                  <p>Short on time: focus on the 🔴 topics, then take the practice test.</p>
                )}
              </>
            )}
          </div>
        </section>

        {/* 2. Topics */}
        <section className="bg-white rounded-xl border border-slate-200 p-5">
          <h2 className="font-semibold text-slate-900 mb-2">Topics</h2>
          <ul className="divide-y divide-slate-100">
            {path.topics.map((t) => (
              <li key={t.domainId} className="flex justify-between py-2 text-sm">
                <span className="text-slate-800">{t.name}</span>
                <span className="text-slate-600">{STATUS_LABEL[t.status]}</span>
              </li>
            ))}
          </ul>
          <p className="mt-2 text-xs text-slate-500">
            Topics are labelled from all answers so far. A round counts as finished when the most recent {ROUND_SAMPLE} answers are strong.
          </p>
        </section>

        {/* 3. Path */}
        <section className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
          <h2 className="font-semibold text-slate-900">The path</h2>
          <ol className="space-y-1 text-sm text-slate-700">
            <li>{path.checkupDone ? '✔' : profile.checkupSkipped ? '–' : '●'} Check-up{profile.checkupSkipped && !path.checkupDone ? ' (skipped)' : ''}</li>
            {rounds.map(({ round, label }) => (
              <li key={round} className={path.currentRound === round ? 'font-semibold text-slate-900' : ''}>
                {marker(round)} {label}
                {path.currentRound === round && ` (${path.roundTopicsDone} of ${path.topics.length} topics)`}
              </li>
            ))}
            <li className={path.currentRound === 'test' ? 'font-semibold text-slate-900' : ''}>
              {path.practiceTestPassedAt ? '✔' : path.currentRound === 'test' ? '●' : '○'} Practice test
            </li>
          </ol>

          {saved ? (
            <div className="space-y-2">
              <button onClick={onContinue} className="w-full rounded-xl bg-blue-600 px-4 py-3 text-lg font-semibold text-white hover:bg-blue-700">
                Continue — {answeredCount(saved)} of {saved.refs.length} done
              </button>
              <button onClick={discard} className={link}>Start fresh instead</button>
            </div>
          ) : (
            <div className="space-y-2">
              {path.practiceTestRepeat && path.next.kind === 'practice-test' && (
                <p className="text-xs text-slate-600">
                  You&rsquo;ve seen this test before &mdash; the score may be higher than on a new test.
                </p>
              )}
              <button onClick={() => onStartStep(path.next)} className="w-full rounded-xl bg-blue-600 px-4 py-3 text-lg font-semibold text-white hover:bg-blue-700">
                {stepLabel(path.next)} ▶
              </button>
              {path.next.kind === 'checkup' && (
                <button onClick={() => updateActiveProfile({ checkupSkipped: true })} className={link}>
                  Skip and start practicing
                </button>
              )}
              {path.practiceTestQuizId && path.next.kind !== 'practice-test' && (
                <div>
                  <button onClick={() => onStartStep({ kind: 'practice-test', quizId: path.practiceTestQuizId! })} className={link}>
                    Try a practice test now
                  </button>
                </div>
              )}
            </div>
          )}
        </section>

        {/* 4. Footer */}
        <footer className="flex flex-wrap gap-4 justify-center">
          <button onClick={onOpenDetailed} className={link}>Detailed view</button>
          <button onClick={() => setReportOpen(true)} className={link}>Print report</button>
          <button onClick={() => setSettingsOpen(true)} className={link}>Settings</button>
          {state.profiles.length > 1 && <button onClick={onSwitchStudent} className={link}>Switch student</button>}
          <button onClick={onAddStudent} className={link}>Add another student</button>
        </footer>
      </div>

      {settingsOpen && <StudyPaceModal isOpen onClose={() => setSettingsOpen(false)} />}
      {reportOpen && <PrintReportModal isOpen onClose={() => setReportOpen(false)} />}
    </div>
  );
};

export default ParentHome;
