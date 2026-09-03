import React from 'react';
import { BookOpen, CheckCircle, AlertTriangle, Lightbulb, X, ArrowRight } from 'lucide-react';
import { STUDY_GUIDES } from '../data/studyGuides';
import { getStandardByCode } from '../data/ncStandards';

interface StudyGuideModalProps {
  standardCode: string | null;
  onClose: () => void;
  onStartStandardDrill?: (standardCode: string) => void;
}

export const StudyGuideModal: React.FC<StudyGuideModalProps> = ({
  standardCode,
  onClose,
  onStartStandardDrill
}) => {
  if (!standardCode) return null;

  const guide = STUDY_GUIDES[standardCode];
  const standard = getStandardByCode(standardCode);

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 bg-gradient-to-r from-blue-50 via-indigo-50 to-white flex items-start justify-between">
          <div className="flex items-start gap-3.5">
            <div className="p-3 bg-blue-600 text-white rounded-2xl shadow-md shadow-blue-500/20 mt-0.5">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="font-mono text-xs font-bold px-2.5 py-1 bg-blue-100 text-blue-800 rounded-full border border-blue-200">
                  {standardCode}
                </span>
                <span className="text-xs font-semibold text-slate-500">
                  {standard?.weightCategory}
                </span>
              </div>
              <h2 className="text-xl font-extrabold text-slate-900">
                {guide?.title || standard?.title}
              </h2>
              <p className="text-xs text-slate-600 mt-1 max-w-xl">
                {standard?.description}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar text-sm">
          {guide ? (
            <>
              {/* Core Concept */}
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5 flex items-center gap-1.5">
                  <Lightbulb className="w-4 h-4 text-amber-500" />
                  Core NCSCOS Concept
                </h4>
                <p className="text-slate-800 font-medium leading-relaxed">
                  {guide.coreConcept}
                </p>
              </div>

              {/* Rules & Key Formulas */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4 text-emerald-500" />
                  Key Rules & Mathematical Formulas
                </h4>
                <div className="grid sm:grid-cols-2 gap-3">
                  {guide.rulesAndFormulas.map((rule, idx) => (
                    <div key={idx} className="p-3.5 bg-white rounded-xl border border-slate-200 shadow-xs hover:border-blue-200 transition-colors">
                      <p className="font-bold text-slate-900 mb-1 text-xs">{rule.label}</p>
                      <p className="text-slate-600 text-xs leading-relaxed">{rule.detail}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Step-by-Step Strategy */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
                  Step-by-Step Test Strategy
                </h4>
                <div className="space-y-2 bg-indigo-50/50 rounded-2xl p-4 border border-indigo-100">
                  {guide.stepByStepMethod.map((step, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-slate-700 text-xs leading-relaxed">
                      <span className="flex-shrink-0 w-5 h-5 bg-indigo-600 text-white rounded-full flex items-center justify-center font-bold text-[10px]">
                        {idx + 1}
                      </span>
                      <span>{step}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Common Pitfalls & Traps */}
              {guide.commonTraps && guide.commonTraps.length > 0 && (
                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-amber-900 mb-2 flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                    Common 4th/5th Grade Traps to Avoid
                  </h4>
                  <ul className="space-y-1.5 text-xs text-amber-950 list-disc list-inside">
                    {guide.commonTraps.map((trap, idx) => (
                      <li key={idx} className="leading-relaxed">{trap}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Worked Example */}
              <div className="border border-slate-200 rounded-2xl p-5 bg-gradient-to-b from-white to-slate-50">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-blue-700">
                    Worked Authentic SSA Practice Problem
                  </h4>
                  <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    Target Answer: {guide.workedExample.answer}
                  </span>
                </div>
                <p className="font-semibold text-slate-900 mb-3 text-sm bg-white p-3 rounded-xl border border-slate-200">
                  {guide.workedExample.problem}
                </p>
                <div className="space-y-1.5 mb-3">
                  {guide.workedExample.steps.map((st, idx) => (
                    <p key={idx} className="text-xs text-slate-600 pl-3 border-l-2 border-blue-400">
                      {st}
                    </p>
                  ))}
                </div>
                <div className="mt-3 pt-3 border-t border-slate-200 text-xs text-slate-500 italic">
                  💡 <span className="font-semibold text-slate-700">Why it matters for SSA:</span> {guide.workedExample.whyItMattersForSSA}
                </div>
              </div>
            </>
          ) : (
            <div className="p-8 text-center text-slate-500">
              <p>Study guide details currently loading for this standard.</p>
            </div>
          )}
        </div>

        {/* Modal Footer with Drill Trigger */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 rounded-xl transition-colors"
          >
            Close Guide
          </button>
          {onStartStandardDrill && (
            <button
              onClick={() => {
                onClose();
                onStartStandardDrill(standardCode);
              }}
              className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-500/20 transition-all hover:gap-2.5"
            >
              Start Drill on {standardCode} <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
