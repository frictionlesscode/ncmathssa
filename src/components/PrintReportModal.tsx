import React from 'react';
import { Printer, X, Award, CheckCircle, AlertTriangle, HelpCircle } from 'lucide-react';
import { useProgress } from '../context/ProgressContext';
import { GRADE_5_STANDARDS, GRADE_5_DOMAINS } from '../curriculum/grade5';

interface PrintReportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PrintReportModal: React.FC<PrintReportModalProps> = ({ isOpen, onClose }) => {
  const { state, overallReadiness, getStandardMastery, getDomainMastery } = useProgress();

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const todayStr = new Date().toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[95vh] flex flex-col overflow-hidden my-auto">
        {/* Modal Controls (Hidden in Print) */}
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between no-print">
          <div className="flex items-center gap-2 text-slate-700 font-bold text-sm">
            <Award className="w-5 h-5 text-blue-600" />
            Official Progress & Readiness Report
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-sm transition-colors"
            >
              <Printer className="w-4 h-4" /> Print or Save as PDF
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-200 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Report Document */}
        <div className="flex-1 overflow-y-auto p-8 space-y-6 text-slate-900 custom-scrollbar print:p-0 print:overflow-visible">
          {/* Document Header */}
          <div className="border-b-2 border-slate-800 pb-5">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[11px] font-mono font-bold tracking-widest text-blue-700 uppercase">
                  Wake County Public School System (WCPSS)
                </span>
                <h1 className="text-2xl font-black tracking-tight text-slate-900 mt-0.5">
                  Single Subject Acceleration (SSA) Readiness Evaluation
                </h1>
                <p className="text-xs text-slate-600 mt-1">
                  Comprehensive mastery report aligned to the North Carolina Standard Course of Study (NCSCOS) for Grade 5 Mathematics.
                </p>
              </div>
              <div className="text-right">
                <div className="text-xs text-slate-500 font-semibold">Report Generated</div>
                <div className="text-sm font-bold text-slate-800">{todayStr}</div>
              </div>
            </div>

            {/* Student & Target Details Bar */}
            <div className="grid grid-cols-4 gap-4 mt-5 p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs">
              <div>
                <span className="text-slate-500 block">Student:</span>
                <span className="font-bold text-slate-900 text-sm">{state.settings.studentName}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Current Grade:</span>
                <span className="font-bold text-slate-900 text-sm">Grade {state.settings.currentGrade}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Target Assessment:</span>
                <span className="font-bold text-slate-900 text-sm">Grade {state.settings.targetGrade} (Skip to 6th)</span>
              </div>
              <div>
                <span className="text-slate-500 block">SSA Qualifying Bar:</span>
                <span className="font-bold text-emerald-700 text-sm">80% or Higher</span>
              </div>
            </div>
          </div>

          {/* Readiness Summary Banner */}
          <div className={`p-6 rounded-2xl border flex items-center justify-between ${
            overallReadiness.isAccelerationReady
              ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
              : 'bg-amber-50 border-amber-300 text-amber-950'
          }`}>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider block opacity-75">
                Composite Grade-Level Readiness
              </span>
              <h2 className="text-3xl font-black mt-1">
                {overallReadiness.weightedScore}% Weighted Readiness
              </h2>
              <p className="text-xs mt-1 font-medium max-w-lg">
                {overallReadiness.isAccelerationReady
                  ? 'Candidate has achieved the 80% acceleration threshold across tested standards. Continue maintaining readiness with timed full mock exams.'
                  : `Currently ${80 - overallReadiness.weightedScore}% below the 80% WCPSS qualifying bar. Focused drill on high-weight domains (Fractions & Base Ten) is recommended.`}
              </p>
            </div>
            <div className="text-right flex flex-col items-end">
              <span className={`px-3.5 py-1.5 rounded-full text-xs font-extrabold uppercase tracking-wide border shadow-xs ${
                overallReadiness.isAccelerationReady
                  ? 'bg-emerald-600 text-white border-emerald-700'
                  : 'bg-amber-500 text-white border-amber-600'
              }`}>
                {overallReadiness.isAccelerationReady ? 'SSA Ready (Level 5)' : 'Approaching Benchmark'}
              </span>
              <span className="text-xs font-semibold text-slate-600 mt-2">
                {overallReadiness.masteredStandardsCount} of {overallReadiness.totalStandardsCount} Standards Mastered
              </span>
            </div>
          </div>

          {/* Domain Breakdown Table */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
              Performance by NCSCOS Domain
            </h3>
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-100 border-b border-slate-300 text-slate-700">
                  <th className="p-2.5 font-bold">Domain</th>
                  <th className="p-2.5 font-bold">NC Blueprint Weight</th>
                  <th className="p-2.5 font-bold">Questions Practiced</th>
                  <th className="p-2.5 font-bold">Mastery Score</th>
                  <th className="p-2.5 font-bold text-right">SSA Status (Bar: 80%)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {GRADE_5_DOMAINS.map(domain => {
                  const dm = getDomainMastery(domain.id);
                  return (
                    <tr key={domain.id} className="hover:bg-slate-50">
                      <td className="p-2.5 font-bold text-slate-900">
                        {domain.name} ({domain.id})
                      </td>
                      <td className="p-2.5 text-slate-600 font-mono">
                        {domain.officialWeightRange}
                      </td>
                      <td className="p-2.5 text-slate-600">
                        {dm.totalQuestionsAnswered} ({dm.totalCorrect} correct)
                      </td>
                      <td className="p-2.5 font-bold">
                        {dm.status === 'untested' ? (
                          <span className="text-slate-400">Untested</span>
                        ) : (
                          <span className={dm.masteryPercent >= 80 ? 'text-emerald-600 font-extrabold' : 'text-amber-600 font-extrabold'}>
                            {dm.masteryPercent}%
                          </span>
                        )}
                      </td>
                      <td className="p-2.5 text-right font-semibold">
                        {dm.status === 'acceleration-ready' && (
                          <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                            Ready (≥80%)
                          </span>
                        )}
                        {dm.status === 'approaching' && (
                          <span className="text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                            Approaching
                          </span>
                        )}
                        {dm.status === 'needs-focus' && (
                          <span className="text-rose-700 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200">
                            Needs Focus
                          </span>
                        )}
                        {dm.status === 'untested' && (
                          <span className="text-slate-400 italic">Not tested</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Standard-by-Standard Detail */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
              Individual NCSCOS Standards Checklist (16 Total)
            </h3>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {GRADE_5_STANDARDS.map(std => {
                const sm = getStandardMastery(std.code);
                return (
                  <div
                    key={std.code}
                    className="p-2.5 rounded-xl border border-slate-200 bg-white flex items-center justify-between"
                  >
                    <div>
                      <span className="font-mono font-bold text-slate-900 mr-2">{std.code}</span>
                      <span className="text-slate-600 text-[11px] truncate inline-block max-w-[200px] align-middle">
                        {std.title}
                      </span>
                    </div>
                    <div>
                      {sm.status === 'acceleration-ready' ? (
                        <span className="flex items-center gap-1 text-emerald-600 font-bold text-[11px]">
                          <CheckCircle className="w-3.5 h-3.5" /> {sm.masteryPercent}%
                        </span>
                      ) : sm.status === 'untested' ? (
                        <span className="text-slate-400 text-[11px] flex items-center gap-1">
                          <HelpCircle className="w-3.5 h-3.5" /> Untested
                        </span>
                      ) : (
                        <span className="text-amber-600 font-bold text-[11px] flex items-center gap-1">
                          <AlertTriangle className="w-3.5 h-3.5" /> {sm.masteryPercent}%
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Parent Strategy Recommendations */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs text-slate-700 space-y-1.5">
            <h4 className="font-bold text-slate-900">Next Steps & Testing Recommendation:</h4>
            <p className="leading-relaxed">
              1. <strong>Fractions Priority:</strong> Number and Operations—Fractions accounts for ~41% of the total exam weight. Focus heavily on unlike denominator mixed number subtraction with regrouping (NC.5.NF.1) and fraction division (NC.5.NF.7).
            </p>
            <p className="leading-relaxed">
              2. <strong>Calculator Inactive Mastery:</strong> Ensure all multi-digit multiplication (NC.5.NBT.5) and division (NC.5.NBT.6) are completed accurately on paper without using a calculator.
            </p>
            <p className="leading-relaxed">
              3. <strong>Timed Mock Testing:</strong> Have the student complete at least two full 40-question mock exams within a 60-minute window before the Wake County test day.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
