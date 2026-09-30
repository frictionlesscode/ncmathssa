import React, { useEffect, useState } from 'react';
import { ProgressProvider, useProgress } from './context/ProgressContext';
import { DisclaimerGate } from './components/DisclaimerGate';
import { FirstRunScreen } from './components/FirstRunScreen';
import { WhoIsPracticing } from './components/WhoIsPracticing';
import { ParentHome } from './components/ParentHome';
import { KidPractice } from './components/KidPractice';
import { KidDone } from './components/KidDone';
import { SessionSummary } from './components/SessionSummary';
import { QuizRunner } from './components/QuizRunner';
import { QuizResults } from './components/QuizResults';
import { StudyGuideModal } from './components/StudyGuideModal';
import { DetailedView } from './components/DetailedView';
import type { QuizAttempt, QuizDefinition } from './types';
import { parseQuestionRef } from './engine/questionModel';
import { buildPath, type NextStep, type Round } from './engine/path';
import { sessionForStep } from './engine/pathSession';
import { sessionFromQuiz, sessionSizeOf, type ActiveSession } from './engine/activeSession';
import { createStandardDrill } from './engine/drills';
import { standardsOf } from './curriculum/registry';

type Screen =
  | { kind: 'who' }
  | { kind: 'setup' }            // adding another student
  | { kind: 'home' }
  | { kind: 'session' }          // reads profile.activeSession
  | { kind: 'kid-done'; attempt: QuizAttempt; readinessBefore: number; roundBefore: Round | 'test' }
  | { kind: 'summary'; attempt: QuizAttempt; readinessBefore: number; roundBefore: Round | 'test' }
  | { kind: 'detailed' }
  | { kind: 'results'; attempt: QuizAttempt };

const MainApp: React.FC = () => {
  const {
    state, profile, curriculum, mastery, readiness,
    updateActiveProfile, addProfile, completeSession,
  } = useProgress();
  const [screen, setScreen] = useState<Screen>(() => (state.profiles.length > 1 ? { kind: 'who' } : { kind: 'home' }));
  const [studyGuideStandard, setStudyGuideStandard] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  // The "couldn't build" notice belongs to the home screen and one student.
  useEffect(() => { setNotice(null); }, [profile.id]);
  useEffect(() => { if (screen.kind !== 'home') setNotice(null); }, [screen.kind]);

  const currentPath = () =>
    buildPath({ curriculum, attempts: profile.attempts, checkupSkipped: Boolean(profile.checkupSkipped),
      testDate: profile.targetExamDate, now: new Date() });

  const begin = (s: ActiveSession | null) => {
    if (!s) {
      setNotice("We couldn't build that session right now — try the practice test or Detailed view.");
      return;
    }
    setNotice(null);
    if (profile.activeSession && !window.confirm('A session is already in progress. Throw it away and start this one?')) return;
    updateActiveProfile({ activeSession: s });
    setScreen({ kind: 'session' });
  };

  const startStep = (step: NextStep) =>
    begin(sessionForStep({
      step, curriculum, mastery, queue: profile.reviewQueue,
      activeDomains: currentPath().activeDomains,
      size: sessionSizeOf(profile), now: new Date(), seed: Date.now() % 2 ** 31,
    }));

  const startDrill = (quiz: QuizDefinition) => begin(sessionFromQuiz(quiz, 'drill', new Date()));

  const finish = (session: ActiveSession, attempt: QuizAttempt) => {
    const readinessBefore = readiness;
    const roundBefore = currentPath().currentRound;
    const results = Object.entries(attempt.answers).map(([id, a]) => ({ ref: parseQuestionRef(id), wasCorrect: a.isCorrect }));
    completeSession(attempt, results);
    setScreen(session.kind === 'drill'
      ? { kind: 'results', attempt }
      : { kind: 'kid-done', attempt, readinessBefore, roundBefore });
  };

  const discardSession = () => {
    updateActiveProfile({ activeSession: undefined });
    setScreen({ kind: 'home' });
  };

  const homeScreen = (
    <>
    {notice && <div role="alert" className="bg-amber-50 border-b border-amber-200 px-4 py-3 text-center text-sm text-amber-900">{notice}</div>}
    <ParentHome
      onStartStep={startStep}
      onContinue={() => setScreen({ kind: 'session' })}
      onOpenDetailed={() => setScreen({ kind: 'detailed' })}
      onSwitchStudent={() => setScreen({ kind: 'who' })}
      onAddStudent={() => setScreen({ kind: 'setup' })}
    />
    </>
  );

  // First run: nothing typed yet and no history for this profile.
  if (!profile.studentName.trim() && profile.attempts.length === 0) {
    return <FirstRunScreen onComplete={({ studentName, grade }) => updateActiveProfile({ studentName, grade })} />;
  }

  switch (screen.kind) {
    case 'who':
      return <WhoIsPracticing onChosen={() => setScreen({ kind: 'home' })} onAddStudent={() => setScreen({ kind: 'setup' })} />;

    case 'setup':
      return (
        <FirstRunScreen
          onComplete={({ studentName, grade }) => { addProfile(studentName, grade); setScreen({ kind: 'home' }); }}
          onCancel={() => setScreen({ kind: 'home' })}
        />
      );

    case 'session': {
      const s = profile.activeSession;
      if (!s) return homeScreen;
      const save = (next: ActiveSession) => updateActiveProfile({ activeSession: next });
      return s.kind === 'practice' ? (
        <KidPractice
          session={s}
          studentName={profile.studentName}
          onChange={save}
          onFinish={(a) => finish(s, a)}
          onDiscard={discardSession}
        />
      ) : (
        <QuizRunner
          key={s.startedAt}
          session={s}
          onChange={save}
          onFinish={(a) => finish(s, a)}
          onPause={() => setScreen(s.kind === 'drill' ? { kind: 'detailed' } : { kind: 'home' })}
          onDiscard={discardSession}
        />
      );
    }

    case 'kid-done':
      return <KidDone attempt={screen.attempt} onHandBack={() => setScreen({ ...screen, kind: 'summary' })} />;

    case 'summary':
      return (
        <SessionSummary
          attempt={screen.attempt}
          readinessBefore={screen.readinessBefore}
          roundBefore={screen.roundBefore}
          onHome={() => setScreen({ kind: 'home' })}
        />
      );

    case 'detailed':
      return <DetailedView onStartQuiz={startDrill} onBack={() => setScreen({ kind: 'home' })} />;

    case 'results': {
      const attempt = screen.attempt;
      const retake = () => {
        const fallback = attempt.standardCode ?? standardsOf(curriculum)[0]?.code;
        const quiz = curriculum.quizzes.find((q) => q.id === attempt.quizId)
          ?? (fallback ? createStandardDrill(fallback, curriculum) : undefined);
        if (quiz) startDrill(quiz);
      };
      return (
        <>
          <QuizResults
            attempt={attempt}
            onRetake={retake}
            onStartStandardDrill={(code) => startDrill(createStandardDrill(code, curriculum))}
            onOpenStudyGuide={setStudyGuideStandard}
            onDone={() => setScreen({ kind: 'detailed' })}
          />
          <StudyGuideModal
            standardCode={studyGuideStandard}
            onClose={() => setStudyGuideStandard(null)}
            onStartStandardDrill={(code) => startDrill(createStandardDrill(code, curriculum))}
          />
        </>
      );
    }

    case 'home':
    default:
      return homeScreen;
  }
};

export function App() {
  return (
    <DisclaimerGate>
      <ProgressProvider>
        <MainApp />
      </ProgressProvider>
    </DisclaimerGate>
  );
}

export default App;
