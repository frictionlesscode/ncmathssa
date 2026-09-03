import React from 'react';
import {
  BookOpen,
  Calendar,
  GraduationCap,
  Layers,
  Printer,
  RotateCcw,
  Sparkles,
  Target
} from 'lucide-react';
import { useProgress } from '../context/ProgressContext';

export type NavTab = 'dashboard' | 'curriculum' | 'quizzes' | 'weakspots';

interface NavbarProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  onOpenPaceModal: () => void;
  onOpenReportModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onSelectTab,
  onOpenPaceModal,
  onOpenReportModal
}) => {
  const { state, overallReadiness, loadDemoData, resetAllProgress } = useProgress();

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      {/* Top Notification / SSA Context Bar */}
      <div className="bg-slate-900 text-slate-300 text-xs px-4 py-1.5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-semibold text-white">Wake County (WCPSS) Single Subject Acceleration:</span>
          <span className="hidden sm:inline text-slate-300">Grade 4 testing into Grade 6 Math (Grade 5 NCSCOS Blueprint)</span>
        </div>
        <div className="flex items-center gap-3 text-[11px]">
          <span className="font-bold text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/20">
            Qualifying Cutoff: 80%
          </span>
          <button
            onClick={onOpenPaceModal}
            className="flex items-center gap-1 text-slate-300 hover:text-white transition-colors"
          >
            <Calendar className="w-3.5 h-3.5 text-emerald-400" />
            <span>{overallReadiness.daysUntilExam} days left</span>
          </button>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Title */}
          <div
            onClick={() => onSelectTab('dashboard')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-base font-black tracking-tight text-slate-900">
                  NC Math SSA
                </span>
                <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.5 bg-blue-100 text-blue-800 rounded border border-blue-200">
                  Grade 5 Mastery
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium">
                North Carolina Acceleration Prep
              </p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 bg-slate-100/80 p-1 rounded-2xl border border-slate-200">
            <button
              onClick={() => onSelectTab('dashboard')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                currentTab === 'dashboard'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Target className="w-4 h-4" />
              Overview
            </button>

            <button
              onClick={() => onSelectTab('curriculum')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                currentTab === 'curriculum'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              Curriculum (5 Domains)
            </button>

            <button
              onClick={() => onSelectTab('quizzes')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                currentTab === 'quizzes'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Layers className="w-4 h-4" />
              Quizzes & Tests
            </button>

            <button
              onClick={() => onSelectTab('weakspots')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                currentTab === 'weakspots'
                  ? 'bg-white text-rose-600 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <RotateCcw className="w-4 h-4" />
              Weak Spots
              {state.missedQuestionIds.length > 0 && (
                <span className="px-1.5 py-0.2 bg-rose-500 text-white rounded-full text-[10px] font-extrabold">
                  {state.missedQuestionIds.length}
                </span>
              )}
            </button>
          </nav>

          {/* Right Action Tools */}
          <div className="flex items-center gap-2.5">
            {/* Readiness Gauge Pill */}
            <div
              onClick={onOpenReportModal}
              className="cursor-pointer hidden sm:flex items-center gap-2 px-3 py-1.5 bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-xl transition-all shadow-xs"
              title="Click to view full parent progress report"
            >
              <div className="text-right">
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Readiness
                </div>
                <div className="text-xs font-black text-slate-800 leading-none">
                  {overallReadiness.weightedScore}%
                </div>
              </div>
              <div className={`w-3 h-3 rounded-full border-2 ${
                overallReadiness.isAccelerationReady
                  ? 'bg-emerald-500 border-emerald-300'
                  : 'bg-amber-500 border-amber-300'
              }`} />
            </div>

            {/* Parent Report Button */}
            <button
              onClick={onOpenReportModal}
              className="flex items-center gap-1.5 px-3 py-2 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-xl text-xs font-bold transition-colors border border-blue-200"
              title="Print official progress report"
            >
              <Printer className="w-3.5 h-3.5" />
              <span className="hidden lg:inline">Report</span>
            </button>

            {/* Pace Button */}
            <button
              onClick={onOpenPaceModal}
              className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors"
              title="Study pace & test date settings"
            >
              <Calendar className="w-4 h-4" />
            </button>

            {/* Demo Data Button (if no attempts yet) */}
            {state.attempts.length === 0 && (
              <button
                onClick={loadDemoData}
                className="hidden xl:flex items-center gap-1 px-2.5 py-1.5 bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200 rounded-xl text-[11px] font-semibold transition-colors"
                title="Load sample score data for preview"
              >
                <Sparkles className="w-3 h-3 text-amber-600" />
                Preview Demo Data
              </button>
            )}

            {/* Reset button (subtle) */}
            {state.attempts.length > 0 && (
              <button
                onClick={resetAllProgress}
                className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                title="Reset all test history"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Mobile Navigation Row */}
        <div className="flex md:hidden items-center justify-around py-2 border-t border-slate-100 text-xs font-bold text-slate-600">
          <button
            onClick={() => onSelectTab('dashboard')}
            className={`px-3 py-1 rounded-lg ${currentTab === 'dashboard' ? 'text-blue-600 bg-blue-50' : ''}`}
          >
            Overview
          </button>
          <button
            onClick={() => onSelectTab('curriculum')}
            className={`px-3 py-1 rounded-lg ${currentTab === 'curriculum' ? 'text-blue-600 bg-blue-50' : ''}`}
          >
            Curriculum
          </button>
          <button
            onClick={() => onSelectTab('quizzes')}
            className={`px-3 py-1 rounded-lg ${currentTab === 'quizzes' ? 'text-blue-600 bg-blue-50' : ''}`}
          >
            Quizzes
          </button>
          <button
            onClick={() => onSelectTab('weakspots')}
            className={`px-3 py-1 rounded-lg ${currentTab === 'weakspots' ? 'text-rose-600 bg-rose-50' : ''}`}
          >
            Weak Spots ({state.missedQuestionIds.length})
          </button>
        </div>
      </div>
    </header>
  );
};
