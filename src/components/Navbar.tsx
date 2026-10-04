import React, { useState } from 'react';
import {
  BookOpen,
  Calendar,
  Layers,
  Printer,
  RotateCcw,
  Settings,
  Target,
  Trash2,
  UserPlus,
  X
} from 'lucide-react';
import { useProgress, useReadinessSummary } from '../context/ProgressContext';
import { dueEntries } from '../engine/scheduler';
import { countdownText } from '../engine/path';
import { listCurricula } from '../curriculum/registry';
import type { Grade } from '../curriculum/types';

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
  const {
    state,
    profile,
    curriculum,
    switchProfile,
    addProfile,
    clearActiveProfileHistory,
    deleteProfile
  } = useProgress();
  const readiness = useReadinessSummary();

  const dueReviewCount = dueEntries(profile.reviewQueue, new Date()).length;

  const availableCurricula = listCurricula();
  const [isAddingProfile, setIsAddingProfile] = useState(false);
  const [newProfileName, setNewProfileName] = useState('');
  const [newProfileGrade, setNewProfileGrade] = useState<Grade>(availableCurricula[0].grade);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [confirmingAction, setConfirmingAction] = useState<'clear' | 'delete' | null>(null);

  const handleClearHistory = () => {
    clearActiveProfileHistory();
    setConfirmingAction(null);
    setIsProfileMenuOpen(false);
  };

  const handleDeleteProfile = () => {
    deleteProfile(profile.id);
    setConfirmingAction(null);
    setIsProfileMenuOpen(false);
  };

  const handleSubmitNewProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProfileName.trim()) return;
    addProfile(newProfileName.trim(), newProfileGrade);
    setNewProfileName('');
    setNewProfileGrade(availableCurricula[0].grade);
    setIsAddingProfile(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      {/* Top Notification / SSA Context Bar */}
      <div className="bg-slate-900 text-slate-300 text-xs px-4 py-1.5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-semibold text-white">Wake County (WCPSS) Single Subject Acceleration:</span>
          <span className="hidden sm:inline text-slate-300">
            {curriculum.weighting.kind === 'ncdpi-blueprint'
              ? `${curriculum.label} Blueprint (targets Grade ${curriculum.ssa.targetsGrade})`
              : `${curriculum.label} Standards (targets Grade ${curriculum.ssa.targetsGrade})`}
          </span>
        </div>
        <div className="flex items-center gap-3 text-[11px]">
          <span className="font-bold text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/20">
            Qualifying Cutoff: {curriculum.ssa.passingPercent}%
          </span>
          <button
            onClick={onOpenPaceModal}
            className="flex items-center gap-1 text-slate-300 hover:text-white transition-colors"
          >
            <Calendar className="w-3.5 h-3.5 text-emerald-400" />
            <span>
              {countdownText(readiness.daysUntilExam, 'days left') ?? 'Set test date'}
            </span>
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
            <img src={`${import.meta.env.BASE_URL}favicon.svg`} alt="" className="w-10 h-10 shadow-md shadow-blue-500/20 rounded-[14px] group-hover:scale-105 transition-transform" />
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-base font-black tracking-tight text-slate-900">
                  NC Math SSA
                </span>
                <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.5 bg-blue-100 text-blue-800 rounded border border-blue-200">
                  Grade {curriculum.grade} Mastery
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
              Curriculum ({curriculum.domains.length} Domains)
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
              {dueReviewCount > 0 && (
                <span className="px-1.5 py-0.2 bg-rose-500 text-white rounded-full text-[10px] font-extrabold">
                  {dueReviewCount}
                </span>
              )}
            </button>
          </nav>

          {/* Right Action Tools */}
          <div className="flex items-center gap-2.5 relative">
            {/* Profile Picker */}
            <select
              aria-label="Active student profile"
              value={profile.id}
              onChange={(e) => switchProfile(e.target.value)}
              className="hidden sm:block px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
              title="Switch student profile"
            >
              {state.profiles.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.studentName} (Grade {p.grade})
                </option>
              ))}
            </select>
            <button
              onClick={() => setIsAddingProfile((v) => !v)}
              className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors"
              title="Add a new student profile"
            >
              <UserPlus className="w-4 h-4" />
            </button>

            <button
              onClick={() => {
                setIsProfileMenuOpen((v) => !v);
                setConfirmingAction(null);
              }}
              className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors"
              title="Profile data settings"
              aria-label="Profile data settings"
            >
              <Settings className="w-4 h-4" />
            </button>

            {isProfileMenuOpen && (
              <div className="absolute top-full right-0 mt-2 z-50 bg-white border border-slate-200 rounded-2xl shadow-xl p-4 w-72">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-black text-slate-900">
                    {profile.studentName || 'This profile'}&apos;s data
                  </span>
                  <button
                    onClick={() => {
                      setIsProfileMenuOpen(false);
                      setConfirmingAction(null);
                    }}
                    className="p-1 text-slate-400 hover:text-slate-700 rounded-lg"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
                <p className="text-[11px] text-slate-500 mb-3 leading-relaxed">
                  Everything stays on this device. You can erase it here, any time.
                </p>

                {confirmingAction === 'clear' ? (
                  <div className="space-y-2 mb-2 p-3 bg-rose-50 border border-rose-200 rounded-xl">
                    <p className="text-[11px] font-semibold text-rose-800">
                      Erase all test history and review queue for this profile? This cannot be undone.
                    </p>
                    <div className="flex gap-2">
                      <button
                        onClick={handleClearHistory}
                        className="flex-1 px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-[11px] rounded-lg transition-colors"
                      >
                        Yes, erase history
                      </button>
                      <button
                        onClick={() => setConfirmingAction(null)}
                        className="flex-1 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[11px] rounded-lg transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setConfirmingAction('clear')}
                    className="w-full flex items-center gap-2 px-3 py-2 mb-2 text-left text-xs font-bold text-slate-700 hover:bg-slate-50 rounded-xl transition-colors"
                  >
                    <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
                    Clear this profile&apos;s history
                  </button>
                )}

                {state.profiles.length > 1 && (
                  confirmingAction === 'delete' ? (
                    <div className="space-y-2 p-3 bg-rose-50 border border-rose-200 rounded-xl">
                      <p className="text-[11px] font-semibold text-rose-800">
                        Delete this entire profile, including its history? This cannot be undone.
                      </p>
                      <div className="flex gap-2">
                        <button
                          onClick={handleDeleteProfile}
                          className="flex-1 px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-[11px] rounded-lg transition-colors"
                        >
                          Yes, delete profile
                        </button>
                        <button
                          onClick={() => setConfirmingAction(null)}
                          className="flex-1 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[11px] rounded-lg transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => setConfirmingAction('delete')}
                      className="w-full flex items-center gap-2 px-3 py-2 text-left text-xs font-bold text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Delete this profile
                    </button>
                  )
                )}
              </div>
            )}

            {isAddingProfile && (
              <div className="absolute top-full right-0 mt-2 z-50 bg-white border border-slate-200 rounded-2xl shadow-xl p-4 w-64">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-black text-slate-900">Add Student Profile</span>
                  <button
                    onClick={() => setIsAddingProfile(false)}
                    className="p-1 text-slate-400 hover:text-slate-700 rounded-lg"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
                <form onSubmit={handleSubmitNewProfile} className="space-y-2.5">
                  <input
                    type="text"
                    autoFocus
                    value={newProfileName}
                    onChange={(e) => setNewProfileName(e.target.value)}
                    placeholder="Student name"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                    required
                  />
                  <select
                    aria-label="Grade for new student profile"
                    value={newProfileGrade}
                    onChange={(e) => setNewProfileGrade(Number(e.target.value) as Grade)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                  >
                    {availableCurricula.map((c) => (
                      <option key={c.grade} value={c.grade}>
                        Grade {c.grade} - {c.label}
                      </option>
                    ))}
                  </select>
                  <button
                    type="submit"
                    className="w-full px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl transition-colors"
                  >
                    Add Profile
                  </button>
                </form>
              </div>
            )}

            {/* Readiness Gauge Pill */}
            <div
              onClick={onOpenReportModal}
              data-testid="readiness-pill"
              data-readiness-state={readiness.isAccelerationReady ? 'ready' : 'building'}
              className="cursor-pointer hidden sm:flex items-center gap-2 px-3 py-1.5 bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-xl transition-all shadow-xs"
              title="Click to view full parent progress report"
            >
              <div className="text-right">
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Readiness
                </div>
                <div className="text-xs font-black text-slate-800 leading-none">
                  {readiness.weightedScore}%
                </div>
              </div>
              <div className={`w-3 h-3 rounded-full border-2 ${
                readiness.isAccelerationReady
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
            Weak Spots ({dueReviewCount})
          </button>
        </div>
      </div>
    </header>
  );
};
