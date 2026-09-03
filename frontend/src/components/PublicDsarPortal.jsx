import React, { useState } from 'react';
import { api } from '../lib/api';

export default function PublicDsarPortal({ tenant, onNavigateBack }) {
  const [formData, setFormData] = useState({
    tenant_slug: tenant?.slug || 'apex-mfb',
    request_type: 'access_copy',
    data_subject_name: '',
    data_subject_email: '',
    data_subject_phone: '',
    subject_relationship: 'customer',
    request_details: '',
  });

  const [submitting, setSubmitting] = useState(false);
  const [successResult, setSuccessResult] = useState(null);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const data = new FormData();
      Object.keys(formData).forEach((key) => {
        data.append(key, formData[key]);
      });

      const res = await api.publicSubmitDsar(data);
      if (res.success) {
        setSuccessResult(res);
      }
    } catch (err) {
      setError(err.message || 'Submission failed. Please check input values.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in max-w-7xl mx-auto">
      
      {/* Top Header & Navigation */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white border border-slate-200 p-6 rounded-3xl shadow-xs">
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
          <div className="h-5 w-px bg-slate-200 hidden sm:block"></div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold bg-sky-50 text-sky-800 border border-sky-200 px-2.5 py-0.5 rounded-full font-mono flex items-center gap-1.5">
                <i className="fa-solid fa-globe text-sky-600 text-[10px]"></i>
                <span>NDPA SECTION 34 PUBLIC PORTAL</span>
              </span>
            </div>
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight mt-1">
              Data Subject Rights (DSAR) Self-Service Desk
            </h2>
            <p className="text-xs text-slate-500">
              Exercise statutory privacy rights with <strong>{tenant?.name || 'Apex Microfinance Bank Nigeria Ltd'}</strong> under the Nigeria Data Protection Act 2023.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 p-2.5 rounded-2xl">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></div>
          <span className="text-xs font-mono font-bold text-slate-800">30-Day Statutory SLA Active</span>
        </div>
      </div>

      {/* Success View */}
      {successResult ? (
        <div className="bg-white border border-slate-200 rounded-3xl p-8 sm:p-12 text-center shadow-xs space-y-6 max-w-2xl mx-auto">
          <div className="w-20 h-20 rounded-3xl bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center justify-center mx-auto text-3xl shadow-xs">
            <i className="fa-solid fa-circle-check"></i>
          </div>

          <div>
            <span className="text-xs font-mono font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 px-3 py-1 rounded-full uppercase">
              Statutory Intake Confirmed
            </span>
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight mt-3">
              Request Submitted Successfully
            </h2>
            <p className="text-xs text-slate-600 max-w-md mx-auto mt-2 leading-relaxed">
              Your statutory Data Subject Access Request has been logged into the compliance queue and assigned a tracking reference.
            </p>
          </div>

          <div className="p-5 bg-slate-50 border border-slate-200 rounded-2xl text-left space-y-3 text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <span className="text-slate-500 font-medium">Tracking Ticket Reference:</span>
              <strong className="font-mono text-base text-emerald-700 font-extrabold">{successResult.ticket_number}</strong>
            </div>
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <span className="text-slate-500 font-medium">Statutory SLA Deadline:</span>
              <strong className="text-slate-900 font-bold">{successResult.statutory_deadline_date || '30 Calendar Days'}</strong>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500 font-medium">Controller Organization:</span>
              <strong className="text-slate-800 font-semibold">{tenant?.name || 'Apex Microfinance Bank'}</strong>
            </div>
          </div>

          <div className="pt-2 flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => setSuccessResult(null)}
              className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all"
            >
              Submit Another Request
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
      ) : (
        /* Main 2-Column DSAR Grid */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* LEFT COLUMN: Request Intake Form (7 Columns) */}
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <i className="fa-solid fa-shield-halved text-sky-600"></i>
                  <span>Exercise NDPA Statutory Right</span>
                </h3>
                <span className="text-[10px] text-emerald-700 font-mono font-bold">Section 34</span>
              </div>

              {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-xs text-red-700 font-semibold flex items-center gap-2">
                  <i className="fa-solid fa-circle-exclamation text-red-600"></i>
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Select Statutory Right to Exercise</label>
                  <select
                    value={formData.request_type}
                    onChange={(e) => setFormData({ ...formData, request_type: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-900 font-bold focus:outline-none focus:border-sky-600 focus:bg-white transition-colors"
                  >
                    <option value="access_copy">Right of Access (Receive Full Copy of My Personal Data)</option>
                    <option value="rectification">Right to Rectification (Correct Inaccurate or Outdated Data)</option>
                    <option value="erasure_deletion">Right to Erasure / Deletion (Right to be Forgotten)</option>
                    <option value="object_processing">Right to Object to Processing / Direct Marketing / Profiling</option>
                    <option value="data_portability">Right to Data Portability (Export Structured Machine-Readable File)</option>
                  </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Full Legal Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Babatunde Lawal"
                      value={formData.data_subject_name}
                      onChange={(e) => setFormData({ ...formData, data_subject_name: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-900 font-semibold focus:outline-none focus:border-sky-600 focus:bg-white transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Official Email Address</label>
                    <input
                      type="email"
                      required
                      placeholder="e.g. b.lawal@domain.ng"
                      value={formData.data_subject_email}
                      onChange={(e) => setFormData({ ...formData, data_subject_email: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-900 font-semibold focus:outline-none focus:border-sky-600 focus:bg-white transition-colors"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Phone Number (Optional)</label>
                    <input
                      type="tel"
                      placeholder="+234 803 114 2290"
                      value={formData.data_subject_phone}
                      onChange={(e) => setFormData({ ...formData, data_subject_phone: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-900 focus:outline-none focus:border-sky-600 focus:bg-white transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Relationship to Organization</label>
                    <select
                      value={formData.subject_relationship}
                      onChange={(e) => setFormData({ ...formData, subject_relationship: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-900 font-semibold focus:outline-none focus:border-sky-600 focus:bg-white transition-colors"
                    >
                      <option value="customer">Existing / Former Customer</option>
                      <option value="employee">Current / Former Employee</option>
                      <option value="job_applicant">Job Applicant</option>
                      <option value="vendor">Vendor / Contractor</option>
                      <option value="other">Other Data Subject</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Details & Scope of Privacy Request</label>
                  <textarea
                    required
                    rows={4}
                    placeholder="Please specify account numbers, employee IDs, transaction dates, or specific processing activities to help our compliance desk locate your records..."
                    value={formData.request_details}
                    onChange={(e) => setFormData({ ...formData, request_details: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-900 focus:outline-none focus:border-sky-600 focus:bg-white transition-colors"
                  ></textarea>
                </div>

                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-start gap-3">
                  <i className="fa-solid fa-lock text-emerald-600 mt-0.5"></i>
                  <div>
                    <div className="font-bold text-emerald-950">Statutory 30-Day SLA Enforced:</div>
                    <div className="text-[11px] text-emerald-800 mt-0.5">
                      As mandated under Section 34 of the Nigeria Data Protection Act 2023, your request will be evaluated, processed, and fulfilled within 30 calendar days at no statutory fee.
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <i className="fa-solid fa-paper-plane text-xs"></i>
                  <span>{submitting ? 'Transmitting Request...' : 'Submit Statutory Privacy Request'}</span>
                </button>
              </form>
            </div>
          </div>

          {/* RIGHT COLUMN: NDPA Statutory Rights Guide (5 Columns) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <i className="fa-solid fa-book-bookmark text-sky-600"></i>
                  <span>NDPA 2023 Statutory Rights Guide</span>
                </h3>
              </div>

              <div className="space-y-3 text-xs">
                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
                  <div className="font-bold text-slate-900 flex items-center gap-1.5">
                    <i className="fa-solid fa-file-lines text-sky-600"></i>
                    <span>Right of Access (§34)</span>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    Request confirmation of whether your personal data is processed, and receive a comprehensive machine-readable copy.
                  </p>
                </div>

                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
                  <div className="font-bold text-slate-900 flex items-center gap-1.5">
                    <i className="fa-solid fa-pen-to-square text-emerald-600"></i>
                    <span>Right to Rectification (§35)</span>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    Require the controller to update or correct inaccurate, misleading, or incomplete personal records.
                  </p>
                </div>

                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
                  <div className="font-bold text-slate-900 flex items-center gap-1.5">
                    <i className="fa-solid fa-trash-can text-red-600"></i>
                    <span>Right to Erasure (§36)</span>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    Request permanent deletion of data when purpose has expired or processing is no longer lawful.
                  </p>
                </div>

                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
                  <div className="font-bold text-slate-900 flex items-center gap-1.5">
                    <i className="fa-solid fa-ban text-amber-600"></i>
                    <span>Right to Object (§37)</span>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    Object to automated profiling, algorithmic credit decisioning, or direct marketing communications.
                  </p>
                </div>
              </div>
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
