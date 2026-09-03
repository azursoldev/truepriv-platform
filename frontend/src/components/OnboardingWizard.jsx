import React, { useState, useEffect } from 'react';
import { api } from '../lib/api';

export default function OnboardingWizard({ isOpen, onClose, onComplete }) {
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
    if (isOpen) {
      loadQuestions();
    }
  }, [isOpen]);

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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="w-full max-w-3xl bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl flex items-center justify-center">
              <i className="fa-solid fa-scale-balanced text-lg"></i>
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 tracking-tight">NDPA Statutory Readiness & Classification Wizard</h3>
              <p className="text-xs text-slate-500">Step {step} of 3 &bull; Section 48 Major Data Controller Tier Calculator</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <i className="fa-solid fa-xmark text-base"></i>
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto space-y-6 pr-1">
          {loading ? (
            <div className="text-center py-12 text-slate-500 text-sm">Loading baseline regulatory assessment...</div>
          ) : step === 1 ? (
            /* STEP 1: Assessment Questions */
            <div className="space-y-4">
              <div className="bg-emerald-50/70 border border-emerald-200 p-4 rounded-2xl">
                <h4 className="text-xs font-bold text-emerald-900 uppercase tracking-wider mb-1">Baseline Operational Readiness</h4>
                <p className="text-xs text-slate-700 leading-relaxed">
                  Answer the following core questions to automatically initialize your organization's statutory NDPA compliance scorecard.
                </p>
              </div>

              <div className="space-y-3">
                {questions.map((q, idx) => (
                  <div key={q.id} className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="text-xs font-mono font-bold text-emerald-700 mb-0.5">{q.category} &bull; Q{idx + 1}</div>
                        <h4 className="text-sm font-bold text-slate-900">{q.question_text}</h4>
                        <p className="text-xs text-slate-600 mt-1">{q.explanation_guide}</p>
                      </div>
                      <span className="text-[10px] font-mono bg-white text-slate-600 border border-slate-200 px-2 py-0.5 rounded-full flex-shrink-0 font-bold">
                        {q.weight_points} pts
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-2 pt-1">
                      {['yes', 'partial', 'no'].map((choice) => (
                        <button
                          key={choice}
                          type="button"
                          onClick={() => handleOptionChange(q.id, choice)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all flex items-center gap-1.5 ${
                            answers[q.id]?.response_choice === choice
                              ? choice === 'yes'
                                ? 'bg-emerald-600 text-white border-emerald-700 shadow-xs'
                                : choice === 'partial'
                                ? 'bg-amber-500 text-white border-amber-600 shadow-xs'
                                : 'bg-red-600 text-white border-red-700 shadow-xs'
                              : 'bg-white text-slate-700 border-slate-300 hover:border-slate-400'
                          }`}
                        >
                          <i className={`fa-solid ${
                            choice === 'yes' ? 'fa-circle-check text-emerald-300' : choice === 'partial' ? 'fa-hourglass-half text-amber-200' : 'fa-circle-xmark text-red-300'
                          } text-xs`}></i>
                          <span>{choice === 'yes' ? 'Implemented' : choice === 'partial' ? 'In Progress' : 'Not Started'}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : step === 2 ? (
            /* STEP 2: Processing Volume & Scope Details */
            <div className="space-y-5">
              <div className="bg-blue-50/70 border border-blue-200 p-4 rounded-2xl">
                <h4 className="text-xs font-bold text-blue-900 uppercase tracking-wider mb-1">NDPA Section 48 Scope Parameters</h4>
                <p className="text-xs text-slate-700 leading-relaxed">
                  These parameters determine whether your organization is legally classified as an <strong>MDC (Extra-High, High, or Medium)</strong> with mandatory March 15 annual audit filing obligations.
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
                    Estimated Annual Data Subjects Processed:
                  </label>
                  <select
                    value={annualDataSubjects}
                    onChange={(e) => setAnnualDataSubjects(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-xl px-4 py-3 text-sm text-slate-900 focus:outline-none focus:border-emerald-600"
                  >
                    <option value="5000">Less than 10,000 (Standard Controller)</option>
                    <option value="25000">10,000 to 49,999 (MDC Medium)</option>
                    <option value="100000">50,000 to 249,999 (MDC High)</option>
                    <option value="500000">250,000+ (MDC Extra-High — High Volume)</option>
                  </select>
                </div>

                <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between">
                  <div>
                    <h5 className="text-sm font-bold text-slate-900">Processes Biometric, Facial KYC, or Health Data?</h5>
                    <p className="text-xs text-slate-600">Triggers mandatory high-risk screening and DPIA obligations.</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={processesSpecialPii}
                    onChange={(e) => setProcessesSpecialPii(e.target.checked)}
                    className="w-5 h-5 accent-emerald-600 rounded cursor-pointer"
                  />
                </div>

                <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between">
                  <div>
                    <h5 className="text-sm font-bold text-slate-900">Operates Designated Critical National Infrastructure (CNI)?</h5>
                    <p className="text-xs text-slate-600">Commercial Banks, Payment Switches, Telecommunications, Government.</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={isCriticalInfra}
                    onChange={(e) => setIsCriticalInfra(e.target.checked)}
                    className="w-5 h-5 accent-emerald-600 rounded cursor-pointer"
                  />
                </div>
              </div>
            </div>
          ) : (
            /* STEP 3: Classification Result Summary */
            result && (
              <div className="space-y-6 text-center py-4">
                <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto text-2xl shadow-xs">
                  <i className="fa-solid fa-trophy"></i>
                </div>

                <div>
                  <h3 className="text-xl font-extrabold text-slate-900">Statutory Assessment Complete</h3>
                  <p className="text-xs text-slate-600 mt-1">Your organization has been classified under NDPA 2023 regulations.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-left">
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl">
                    <div className="text-[10px] uppercase font-bold text-slate-500">Initial Readiness Score</div>
                    <div className="text-2xl font-extrabold font-mono text-emerald-700 mt-1">{result.readiness_score}%</div>
                  </div>
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl">
                    <div className="text-[10px] uppercase font-bold text-slate-500">MDC Classification Tier</div>
                    <div className="text-sm font-bold font-mono text-amber-800 mt-1 uppercase">{result.mdc_tier.replace('_', ' ')}</div>
                  </div>
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl">
                    <div className="text-[10px] uppercase font-bold text-slate-500">Next Audit Deadline</div>
                    <div className="text-sm font-bold font-mono text-blue-700 mt-1">{result.next_audit_deadline}</div>
                  </div>
                </div>

                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-left">
                  <div className="text-xs font-bold text-emerald-900 mb-1">Statutory Filing Requirement:</div>
                  <div className="text-xs text-slate-700">{result.filing_requirement}</div>
                </div>
              </div>
            )
          )}
        </div>

        {/* Modal Footer */}
        <div className="border-t border-slate-200 pt-4 mt-6 flex items-center justify-between">
          {step > 1 && step < 3 ? (
            <button
              type="button"
              onClick={() => setStep((s) => s - 1)}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5"
            >
              <i className="fa-solid fa-arrow-left text-xs"></i> Back
            </button>
          ) : <div></div>}

          {step === 1 ? (
            <button
              type="button"
              onClick={() => setStep(2)}
              className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-xs"
            >
              <span>Proceed to Scope & Volume</span>
              <i className="fa-solid fa-arrow-right text-xs"></i>
            </button>
          ) : step === 2 ? (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={submitting}
              className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-xs disabled:opacity-50"
            >
              <span>{submitting ? 'Evaluating NDPA Profile...' : 'Calculate MDC Tier & Finalize'}</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold"
            >
              Return to Executive Dashboard
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
