import React, { useState } from 'react';

export const DISCLAIMER_STORAGE_KEY = 'nc_math_ssa_disclaimer';
// Bump when the disclaimer text changes materially, so every visitor is
// asked to agree to the new wording.
export const DISCLAIMER_VERSION = 1;

// Storage can be missing or throw (private windows, blocked site data). A
// failed read means "not accepted yet" and a failed write only costs the
// visitor seeing the disclaimer again next time.
function hasAccepted(): boolean {
  try {
    const raw = localStorage.getItem(DISCLAIMER_STORAGE_KEY);
    return raw !== null && JSON.parse(raw)?.version === DISCLAIMER_VERSION;
  } catch {
    return false;
  }
}

function recordAcceptance(): void {
  try {
    localStorage.setItem(
      DISCLAIMER_STORAGE_KEY,
      JSON.stringify({ version: DISCLAIMER_VERSION, acceptedAt: new Date().toISOString() }),
    );
  } catch {
    // See hasAccepted.
  }
}

export const DisclaimerGate: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [accepted, setAccepted] = useState(hasAccepted);
  const [agreed, setAgreed] = useState(false);

  if (accepted) return <>{children}</>;

  const handleContinue = (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreed) return;
    recordAcceptance();
    setAccepted(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-lg bg-white rounded-xl shadow-sm border border-slate-200 p-6 sm:p-8 space-y-5">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Before you begin</h1>
          <p className="mt-1 text-sm text-slate-600">
            Please read this disclaimer. You must agree to it to use NC Math SSA Practice.
          </p>
        </div>

        <div className="space-y-3 text-sm text-slate-700">
          <p>
            <strong>Unofficial.</strong> This is an independent practice tool. It is not affiliated
            with, endorsed by, or produced by the Wake County Public School System, the NC
            Department of Public Instruction, CASE, or any school or district.
          </p>
          <p>
            <strong>Built from public sources only.</strong> The questions were written using
            publicly available information: the published NC Standard Course of Study and public
            descriptions of the assessment. The actual test is secure and is not public. Nothing
            here is a real test question, and the test may differ in content, format, and
            difficulty.
          </p>
          <p>
            <strong>No guarantee.</strong> This tool is provided &ldquo;as is&rdquo;, without
            warranty of any kind. There is no guarantee that its questions, answers, explanations,
            or scores are accurate, complete, or current, or that a score here predicts any test
            result or placement decision.
          </p>
          <p>
            <strong>Use at your own risk.</strong> You are responsible for how you use this tool.
            It does not replace guidance from your child&rsquo;s school.
          </p>
          <p>
            <strong>Hold harmless.</strong> By using this tool, you agree that its author is not
            liable for any loss, damage, or outcome arising from its use, including test results
            or placement decisions, and you agree to hold the author harmless from any such claim.
          </p>
        </div>

        <form onSubmit={handleContinue} className="space-y-4 pt-2 border-t border-slate-100">
          <label className="flex items-start gap-2 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              className="mt-0.5 h-4 w-4 rounded border-slate-300"
            />
            <span>
              I am a parent, guardian, or other adult, and I have read and agree to this
              disclaimer.
            </span>
          </label>
          <button
            type="submit"
            disabled={!agreed}
            className="w-full rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-700"
          >
            Agree and continue
          </button>
        </form>
      </div>
    </div>
  );
};
