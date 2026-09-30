import React, { useEffect, useState } from 'react';
import { ProgressProvider, useProgress } from './context/ProgressContext';
import { FirstRunScreen } from './components/FirstRunScreen';
import { DisclaimerGate } from './components/DisclaimerGate';
import { Navbar } from './components/Navbar';
import type { NavTab } from './components/Navbar';
import { Dashboard } from './components/Dashboard';
import { CurriculumView } from './components/CurriculumView';
import { QuizzesListView } from './components/QuizzesListView';
import { WeakSpotsView } from './components/WeakSpotsView';
import { QuizRunner } from './components/QuizRunner';
import { QuizResults } from './components/QuizResults';
import { StudyGuideModal } from './components/StudyGuideModal';
import { StudyPaceModal } from './components/StudyPaceModal';
import { PrintReportModal } from './components/PrintReportModal';
import type { QuizAttempt, QuizDefinition } from './types';
import { standardsOf } from './curriculum/registry';
import { parseQuestionRef } from './engine/questionModel';
import type { QuestionRef } from './engine/questionModel';
import { sessionFromQuiz } from './engine/activeSession';
import {
  createAdaptiveSessionDrill,
  createMissedQuestionsDrill,
  createStandardDrill
} from './engine/drills';

const MainApp: React.FC = () => {
  const { recordAttempt, curriculum, profile, updateActiveProfile } = useProgress();

  const [currentTab, setCurrentTab] = useState<NavTab>('dashboard');
  const [activeQuiz, setActiveQuiz] = useState<QuizDefinition | null>(null);
  const [completedAttempt, setCompletedAttempt] = useState<QuizAttempt | null>(null);

  // Modals
  const [studyGuideStandard, setStudyGuideStandard] = useState<string | null>(null);
  const [isPaceModalOpen, setIsPaceModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  // Warn before an in-progress quiz can be silently discarded (e.g. the
  // browser back button). There is no router, so this is the only guard.
  useEffect(() => {
    if (!activeQuiz) return;
    const warn = (e: BeforeUnloadEvent) => { e.preventDefault(); e.returnValue = ''; };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [activeQuiz]);

  // A quiz id is only meaningful within the active grade: `g4-mod-nf-01`
  // exists in Grade 4's set and nowhere else, so the lookup runs over
  // `curriculum.quizzes` rather than over one grade's exported bank.
  const findQuiz = (quizId: string) => curriculum.quizzes.find(q => q.id === quizId);

  // Launch a pre-defined quiz
  const handleStartQuiz = (quizId: string) => {
    const quiz = findQuiz(quizId);
    if (quiz) {
      setCompletedAttempt(null);
      setActiveQuiz(quiz);
    }
  };

  // Launch a standard-specific drill
  const handleStartStandardDrill = (standardCode: string) => {
    const drill = createStandardDrill(standardCode, curriculum);
    setCompletedAttempt(null);
    setActiveQuiz(drill);
  };

  // Launch custom quiz for missed questions
  const handleStartCustomQuiz = (questionIds: string[]) => {
    const drill = createMissedQuestionsDrill(questionIds);
    setCompletedAttempt(null);
    setActiveQuiz(drill);
  };

  // Launch an adaptive daily-practice session built by selectSession.
  const handleStartAdaptiveSession = (refs: QuestionRef[]) => {
    const drill = createAdaptiveSessionDrill(refs);
    setCompletedAttempt(null);
    setActiveQuiz(drill);
  };

  // Handle quiz completion. Most answer ids are authored ids, but a custom
  // "practice due reviews" drill can carry generated refs too (encoded as
  // `templateId#seed`), so every id is parsed back into its QuestionRef
  // rather than assumed authored.
  const handleFinishQuiz = (attempt: QuizAttempt) => {
    const results = Object.entries(attempt.answers).map(([questionId, ans]) => ({
      ref: parseQuestionRef(questionId),
      wasCorrect: ans.isCorrect
    }));
    recordAttempt(attempt, results);
    setCompletedAttempt(attempt);
    setActiveQuiz(null);
  };

  // Retake currently viewed attempt
  const handleRetake = () => {
    if (completedAttempt) {
      const fallbackStandard = completedAttempt.standardCode ?? standardsOf(curriculum)[0]?.code;
      const quiz = findQuiz(completedAttempt.quizId)
        || (fallbackStandard ? createStandardDrill(fallbackStandard, curriculum) : undefined);
      if (quiz) {
        setCompletedAttempt(null);
        setActiveQuiz(quiz);
      }
    }
  };

  // First-run: nothing typed yet and no history for this profile. Shown
  // before anything else so a visitor sees it before any quiz UI.
  if (!profile.studentName.trim() && profile.attempts.length === 0) {
    return (
      <FirstRunScreen
        onComplete={({ studentName, grade }) => updateActiveProfile({ studentName, grade })}
      />
    );
  }

  // Render Test Runner if quiz is active
  if (activeQuiz) {
    return (
      <QuizRunner
        session={sessionFromQuiz(activeQuiz, 'drill', new Date())}
        onChange={() => {}}
        onFinish={handleFinishQuiz}
        onPause={() => setActiveQuiz(null)}
        onDiscard={() => setActiveQuiz(null)}
      />
    );
  }

  // Render Post-Quiz Results if recently completed
  if (completedAttempt) {
    return (
      <QuizResults
        attempt={completedAttempt}
        onRetake={handleRetake}
        onStartStandardDrill={handleStartStandardDrill}
        onOpenStudyGuide={setStudyGuideStandard}
        onDone={() => setCompletedAttempt(null)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col selection:bg-blue-500 selection:text-white">
      {/* Top Navigation */}
      <Navbar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        onOpenPaceModal={() => setIsPaceModalOpen(true)}
        onOpenReportModal={() => setIsReportModalOpen(true)}
      />

      {/* Main Tab Content */}
      <main className="flex-1">
        {currentTab === 'dashboard' && (
          <Dashboard
            onStartQuiz={handleStartQuiz}
            onOpenStudyGuide={setStudyGuideStandard}
            onNavigateTab={setCurrentTab}
            onOpenPaceModal={() => setIsPaceModalOpen(true)}
            onOpenReportModal={() => setIsReportModalOpen(true)}
          />
        )}

        {currentTab === 'curriculum' && (
          <CurriculumView
            onStartStandardDrill={handleStartStandardDrill}
            onOpenStudyGuide={setStudyGuideStandard}
          />
        )}

        {currentTab === 'quizzes' && (
          <QuizzesListView
            onStartQuiz={handleStartQuiz}
            onStartStandardDrill={handleStartStandardDrill}
            onStartAdaptiveSession={handleStartAdaptiveSession}
          />
        )}

        {currentTab === 'weakspots' && (
          <WeakSpotsView
            onStartCustomQuiz={handleStartCustomQuiz}
            onOpenStudyGuide={setStudyGuideStandard}
          />
        )}
      </main>

      {/* Modals */}
      <StudyGuideModal
        standardCode={studyGuideStandard}
        onClose={() => setStudyGuideStandard(null)}
        onStartStandardDrill={handleStartStandardDrill}
      />

      <StudyPaceModal
        isOpen={isPaceModalOpen}
        onClose={() => setIsPaceModalOpen(false)}
      />

      <PrintReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
      />
    </div>
  );
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
