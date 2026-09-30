import React, { useState } from 'react';
import { useProgress } from '../context/ProgressContext';
import { Navbar, type NavTab } from './Navbar';
import { Dashboard } from './Dashboard';
import { CurriculumView } from './CurriculumView';
import { QuizzesListView } from './QuizzesListView';
import { WeakSpotsView } from './WeakSpotsView';
import { StudyGuideModal } from './StudyGuideModal';
import { StudyPaceModal } from './StudyPaceModal';
import { PrintReportModal } from './PrintReportModal';
import type { QuizDefinition } from '../types';
import type { QuestionRef } from '../engine/questionModel';
import { createAdaptiveSessionDrill, createMissedQuestionsDrill, createStandardDrill } from '../engine/drills';

/** Today's full tab UI (codes, study guides, per-standard drills), kept for
 *  parents who want the detail, reached from the home page footer (spec 4.4). */
export const DetailedView: React.FC<{ onStartQuiz: (quiz: QuizDefinition) => void; onBack: () => void }> = ({ onStartQuiz, onBack }) => {
  const { curriculum } = useProgress();
  const [currentTab, setCurrentTab] = useState<NavTab>('dashboard');
  const [studyGuideStandard, setStudyGuideStandard] = useState<string | null>(null);
  const [isPaceModalOpen, setIsPaceModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  const startQuizById = (quizId: string) => {
    const quiz = curriculum.quizzes.find((q) => q.id === quizId);
    if (quiz) onStartQuiz(quiz);
  };
  const startStandardDrill = (code: string) => onStartQuiz(createStandardDrill(code, curriculum));
  const startCustom = (ids: string[]) => onStartQuiz(createMissedQuestionsDrill(ids));
  const startAdaptive = (refs: QuestionRef[]) => onStartQuiz(createAdaptiveSessionDrill(refs));

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col selection:bg-blue-500 selection:text-white">
      <div className="bg-slate-800 px-4 py-2">
        <button onClick={onBack} className="text-sm text-white underline">← Back to home</button>
      </div>
      <Navbar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        onOpenPaceModal={() => setIsPaceModalOpen(true)}
        onOpenReportModal={() => setIsReportModalOpen(true)}
      />
      <main className="flex-1">
        {currentTab === 'dashboard' && (
          <Dashboard
            onStartQuiz={startQuizById}
            onOpenStudyGuide={setStudyGuideStandard}
            onNavigateTab={setCurrentTab}
            onOpenPaceModal={() => setIsPaceModalOpen(true)}
            onOpenReportModal={() => setIsReportModalOpen(true)}
          />
        )}
        {currentTab === 'curriculum' && (
          <CurriculumView onStartStandardDrill={startStandardDrill} onOpenStudyGuide={setStudyGuideStandard} />
        )}
        {currentTab === 'quizzes' && (
          <QuizzesListView
            onStartQuiz={startQuizById}
            onStartStandardDrill={startStandardDrill}
            onStartAdaptiveSession={startAdaptive}
          />
        )}
        {currentTab === 'weakspots' && (
          <WeakSpotsView onStartCustomQuiz={startCustom} onOpenStudyGuide={setStudyGuideStandard} />
        )}
      </main>
      <StudyGuideModal
        standardCode={studyGuideStandard}
        onClose={() => setStudyGuideStandard(null)}
        onStartStandardDrill={startStandardDrill}
      />
      <StudyPaceModal isOpen={isPaceModalOpen} onClose={() => setIsPaceModalOpen(false)} />
      <PrintReportModal isOpen={isReportModalOpen} onClose={() => setIsReportModalOpen(false)} />
    </div>
  );
};

export default DetailedView;
