import React, { useState, useEffect } from 'react';
import { api } from '../lib/api';

export default function OnboardingWizard({ onNavigateBack, onComplete }) {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [step, setStep] = useState(1);
  const [answers, setAnswers] = useState({});
  const [annualDataSubjects, setAnnualDataSubjects] = useState(50000);
  const [processesSpecialPii, setProcessesSpecialPii] = useState(true);
  const [isCriticalInfra, setIsCriticalInfra] = useState(false);
  const [result, setResult] = useState(null);

  useEffect(() => {
    loadQuestions();
  }, []);

  const loadQuestions = async () => {
    setLoading(true);
    try {
      const res = await api.getOnboardingQuestions();
      if (res.success) {
        setQuestions(res.data);
        const initialAnswers = {};
        res.data.forEach((q) => {
          initialAnswers[q.id] = {
            question_id: q.id,
            response_choice: 'yes',
            evidence_notes: '',
          };
        });
        setAnswers(initialAnswers);
      }
    } catch (err) {
      console.error('Failed to load onboarding questions', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOptionChange = (questionId, choice) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: {
        ...prev[questionId],
        response_choice: choice,
      },
    }));
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const payload = {
        answers: Object.values(answers),
        annual_data_subjects: parseInt(annualDataSubjects, 10),
        processes_special_pii: processesSpecialPii,
        is_critical_infrastructure: isCriticalInfra,
      };

      const res = await api.submitOnboardingAnswers(payload);
      if (res.success) {
        setResult(res.data);
        setStep(3); // Result summary
        if (onComplete) {
          onComplete(res.data);
        }
      }
    } catch (err) {
      console.error('Failed to submit onboarding assessment', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in max-w-5xl mx-auto">
      
      {/* Top Navigation & Step Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-white border border-slate-200 p-6 rounded-3xl shadow-xs">
        <div className="flex items-center gap-3">
          {onNavigateBack && (
            <button
              onClick={onNavigateBack}
              className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
            >
              <i className="fa-solid fa-arrow-left text-xs"></i>
              <span>Back to Dashboard</span>
            </button>
          )}
          <div className="h-5 w-px bg-slate-200 hidden md:block"></div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 px-2.5 py-0.5 rounded-full font-mono flex items-center gap-1.5">
                <i className="fa-solid fa-scale-balanced text-emerald-600 text-[10px]"></i>
                <span>NDPA SECTION 48 STATUTORY DESK</span>
              </span>
            </div>
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight mt-1">
              Statutory Readiness & MDC Classification Desk
            </h2>
            <p className="text-xs text-slate-500">
              Evaluate baseline compliance, compute Major Data Controller tier, and establish March 15 statutory filing schedule.
            </p>
          </div>
        </div>

        {/* Stepper Pill Indicators */}
        <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-2xl text-xs font-bold">
          <div className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 ${
            step === 1 ? 'bg-white text-emerald-800 shadow-2xs' : 'text-slate-500'
          }`}>
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
              step > 1 ? 'bg-emerald-600 text-white' : step === 1 ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'
            }`}>1</span>
            <span className="hidden sm:inline">Baseline Audit</span>
          </div>

          <div className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 ${
            step === 2 ? 'bg-white text-blue-800 shadow-2xs' : 'text-slate-500'
          }`}>
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
              step > 2 ? 'bg-emerald-600 text-white' : step === 2 ? 'bg-blue-100 text-blue-800' : 'bg-slate-200 text-slate-600'
            }`}>2</span>
            <span className="hidden sm:inline">MDC Scope</span>
          </div>

          <div className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 ${
            step === 3 ? 'bg-white text-purple-800 shadow-2xs' : 'text-slate-500'
          }`}>
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
              step === 3 ? 'bg-purple-600 text-white' : 'bg-slate-200 text-slate-600'
            }`}>3</span>
            <span className="hidden sm:inline">Statutory Result</span>
          </div>
        </div>
      </div>

      {/* Main Step Content Body */}
      {loading ? (
        <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center text-slate-500 text-sm">
          <i className="fa-solid fa-circle-notch fa-spin text-2xl text-emerald-600 mb-3"></i>
          <p className="font-bold text-slate-800">Loading statutory assessment framework...</p>
        </div>
      ) : step === 1 ? (
        /* =========================================================================
           STEP 1: BASELINE OPERATIONAL READINESS QUESTIONS
           ========================================================================= */
        <div className="space-y-6">
          <div className="bg-emerald-50/80 border border-emerald-200 p-5 rounded-3xl flex items-start gap-4 shadow-xs">
            <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center text-lg flex-shrink-0 mt-0.5">
              <i className="fa-solid fa-list-check"></i>
            </div>
            <div>
              <h4 className="text-sm font-bold text-emerald-950 uppercase tracking-wider">
                Baseline Operational Readiness Assessment
              </h4>
              <p className="text-xs text-slate-700 leading-relaxed mt-1">
                Answer the following core regulatory questions to automatically initialize your organization's statutory NDPA compliance scorecard and establish initial baseline telemetry.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {questions.map((q, idx) => (
              <div key={q.id} className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4 hover:border-slate-300 transition-all">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div>
                    <div className="text-xs font-mono font-bold text-emerald-700 mb-1 flex items-center gap-1.5">
                      <i className="fa-solid fa-shield-check text-emerald-600 text-xs"></i>
                      <span>{q.category} &bull; Question {idx + 1}</span>
                    </div>
                    <h4 className="text-base font-bold text-slate-900 leading-snug">{q.question_text}</h4>
                    <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">{q.explanation_guide}</p>
                  </div>
                  <span className="text-xs font-mono bg-slate-50 text-slate-700 border border-slate-200 px-3 py-1 rounded-full flex-shrink-0 font-bold self-start">
                    {q.weight_points} points
                  </span>
                </div>

                <div className="pt-2 border-t border-slate-100 flex flex-wrap gap-3">
                  {['yes', 'partial', 'no'].map((choice) => (
                    <button
                      key={choice}
                      type="button"
                      onClick={() => handleOptionChange(q.id, choice)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all flex items-center gap-2 ${
                        answers[q.id]?.response_choice === choice
                          ? choice === 'yes'
                            ? 'bg-emerald-600 text-white border-emerald-700 shadow-xs'
                            : choice === 'partial'
                            ? 'bg-amber-500 text-white border-amber-600 shadow-xs'
                            : 'bg-red-600 text-white border-red-700 shadow-xs'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      <i className={`fa-solid ${
                        choice === 'yes' ? 'fa-circle-check' : choice === 'partial' ? 'fa-hourglass-half' : 'fa-circle-xmark'
                      } text-xs`}></i>
                      <span>{choice === 'yes' ? 'Implemented' : choice === 'partial' ? 'In Progress' : 'Not Started'}</span>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Step 1 Bottom Action Toolbar */}
          <div className="bg-white border border-slate-200 p-4 sm:p-6 rounded-3xl flex items-center justify-between shadow-xs">
            <span className="text-xs text-slate-500 font-medium">
              {questions.length} core questions answered.
            </span>
            <button
              type="button"
              onClick={() => setStep(2)}
              className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-md transition-all"
            >
              <span>Proceed to Scope & Volume Parameters</span>
              <i className="fa-solid fa-arrow-right text-xs"></i>
            </button>
          </div>
        </div>
      ) : step === 2 ? (
        /* =========================================================================
           STEP 2: PROCESSING VOLUME & SCOPE PARAMETERS
           ========================================================================= */
        <div className="space-y-6">
          <div className="bg-blue-50/80 border border-blue-200 p-5 rounded-3xl flex items-start gap-4 shadow-xs">
            <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center text-lg flex-shrink-0 mt-0.5">
              <i className="fa-solid fa-sliders"></i>
            </div>
            <div>
              <h4 className="text-sm font-bold text-blue-950 uppercase tracking-wider">
                NDPA Section 48 Scope Parameters
              </h4>
              <p className="text-xs text-slate-700 leading-relaxed mt-1">
                These statutory parameters determine whether your organization is legally designated as an <strong>MDC (Extra-High, High, or Medium)</strong> with mandatory March 15 annual audit filing obligations.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {/* Volume Selection Card */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-3">
              <label className="block text-sm font-bold text-slate-900">
                1. Estimated Annual Data Subjects Processed:
              </label>
              <p className="text-xs text-slate-500">
                Count unique Nigerian individuals whose personal information (customers, employees, vendors) is stored or processed annually.
              </p>
              <select
                value={annualDataSubjects}
                onChange={(e) => setAnnualDataSubjects(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-3 text-xs font-bold text-slate-900 focus:outline-none focus:border-emerald-600 focus:bg-white"
              >
                <option value="5000">Less than 10,000 Data Subjects &bull; (Standard Data Controller)</option>
                <option value="25000">10,000 to 49,999 Data Subjects &bull; (MDC Medium Category)</option>
                <option value="100000">50,000 to 249,999 Data Subjects &bull; (MDC High Category)</option>
                <option value="500000">250,000+ Data Subjects &bull; (MDC Extra-High — High Volume Tier)</option>
              </select>
            </div>

            {/* Special PII Toggle Card */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs flex items-center justify-between gap-4">
              <div>
                <h5 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <i className="fa-solid fa-fingerprint text-purple-600"></i>
                  <span>Processes Biometric, Facial KYC, Health, or Financial Data?</span>
                </h5>
                <p className="text-xs text-slate-500 mt-1">
                  Triggers mandatory high-risk screening, Data Protection Impact Assessments (DPIAs), and DPCO audit certification.
                </p>
              </div>
              <input
                type="checkbox"
                checked={processesSpecialPii}
                onChange={(e) => setProcessesSpecialPii(e.target.checked)}
                className="w-6 h-6 accent-emerald-600 rounded cursor-pointer flex-shrink-0"
              />
            </div>

            {/* Critical Infrastructure Card */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs flex items-center justify-between gap-4">
              <div>
                <h5 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <i className="fa-solid fa-tower-cell text-blue-600"></i>
                  <span>Operates Designated Critical National Infrastructure (CNI)?</span>
                </h5>
                <p className="text-xs text-slate-500 mt-1">
                  Commercial Banks, Payment Switches, Telecommunications Operators, Aviation, and Federal Agencies.
                </p>
              </div>
              <input
                type="checkbox"
                checked={isCriticalInfra}
                onChange={(e) => setIsCriticalInfra(e.target.checked)}
                className="w-6 h-6 accent-emerald-600 rounded cursor-pointer flex-shrink-0"
              />
            </div>
          </div>

          {/* Step 2 Bottom Action Toolbar */}
          <div className="bg-white border border-slate-200 p-4 sm:p-6 rounded-3xl flex items-center justify-between shadow-xs">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all"
            >
              <i className="fa-solid fa-arrow-left text-xs"></i>
              <span>Back to Assessment</span>
            </button>

            <button
              type="button"
              onClick={handleSubmit}
              disabled={submitting}
              className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-md transition-all disabled:opacity-50"
            >
              <i className="fa-solid fa-calculator text-xs"></i>
              <span>{submitting ? 'Evaluating NDPA Profile...' : 'Calculate MDC Tier & Finalize'}</span>
            </button>
          </div>
        </div>
      ) : (
        /* =========================================================================
           STEP 3: STATUTORY CLASSIFICATION RESULTS
           ========================================================================= */
        result && (
          <div className="space-y-6">
            <div className="bg-white border border-slate-200 rounded-3xl p-8 sm:p-12 text-center shadow-xs space-y-6">
              <div className="w-20 h-20 rounded-3xl bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center justify-center mx-auto text-3xl shadow-xs">
                <i className="fa-solid fa-trophy"></i>
              </div>

              <div>
                <span className="text-xs font-mono font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 px-3 py-1 rounded-full uppercase">
                  Statutory Evaluation Verified
                </span>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-3">
                  Statutory NDPA Assessment Complete
                </h2>
                <p className="text-xs text-slate-600 max-w-lg mx-auto mt-2 leading-relaxed">
                  Your organization's operational readiness and processing scope have been evaluated against NDPA 2023 Section 24, 32, & 48 criteria.
                </p>
              </div>

              {/* 3 Metric Scorecards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-left pt-2">
                <div className="p-5 bg-slate-50 border border-slate-200 rounded-2xl">
                  <div className="text-[10px] uppercase font-bold text-slate-500 flex items-center justify-between">
                    <span>Readiness Score</span>
                    <i className="fa-solid fa-chart-pie text-emerald-600"></i>
                  </div>
                  <div className="text-3xl font-extrabold font-mono text-emerald-700 mt-2">
                    {result.readiness_score}%
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1">Operational Readiness</div>
                </div>

                <div className="p-5 bg-slate-50 border border-slate-200 rounded-2xl">
                  <div className="text-[10px] uppercase font-bold text-slate-500 flex items-center justify-between">
                    <span>MDC Classification</span>
                    <i className="fa-solid fa-shield-halved text-amber-600"></i>
                  </div>
                  <div className="text-xl font-bold font-mono text-amber-900 mt-2 uppercase">
                    {result.mdc_tier?.replace(/_/g, ' ')}
                  </div>
                  <div className="text-[11px] text-amber-700 font-semibold mt-1">Major Data Controller</div>
                </div>

                <div className="p-5 bg-slate-50 border border-slate-200 rounded-2xl">
                  <div className="text-[10px] uppercase font-bold text-slate-500 flex items-center justify-between">
                    <span>Next Audit Filing</span>
                    <i className="fa-solid fa-calendar-check text-blue-600"></i>
                  </div>
                  <div className="text-xl font-bold font-mono text-blue-900 mt-2">
                    {result.next_audit_deadline || 'March 15, 2027'}
                  </div>
                  <div className="text-[11px] text-blue-700 font-semibold mt-1">Statutory NDPC Deadline</div>
                </div>
              </div>

              {/* Legal Filing Box */}
              <div className="p-5 bg-emerald-50/80 border border-emerald-200 rounded-2xl text-left space-y-2">
                <div className="text-xs font-bold text-emerald-950 flex items-center gap-2">
                  <i className="fa-solid fa-gavel text-emerald-700"></i>
                  <span>Statutory NDPC Filing Obligation:</span>
                </div>
                <p className="text-xs text-slate-700 leading-relaxed">
                  {result.filing_requirement || "As a designated Major Data Controller, your organization is mandated to maintain active RoPA inventories, conduct DPIAs for high-risk processing, and file an accredited DPCO statutory audit report by March 15 annually."}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 flex flex-wrap items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all"
                >
                  Re-evaluate Assessment
                </button>

                {onNavigateBack && (
                  <button
                    type="button"
                    onClick={onNavigateBack}
                    className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow-md transition-all flex items-center gap-2"
                  >
                    <span>Return to Executive Dashboard</span>
                    <i className="fa-solid fa-arrow-right text-xs"></i>
                  </button>
                )}
              </div>
            </div>
          </div>
        )
      )}

    </div>
  );
}
