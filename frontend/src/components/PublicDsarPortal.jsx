import React, { useState } from 'react';
import { api } from '../lib/api';

export default function PublicDsarPortal({ tenant, onClose }) {
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
      Object.keys(formData).forEach(key => {
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
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs overflow-y-auto p-4 flex items-center justify-center animate-in fade-in">
      <div className="max-w-xl w-full bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-2xl relative my-8">
        
        {/* Back button */}
        <button
          onClick={onClose}
          className="absolute top-6 left-6 text-xs text-slate-600 hover:text-slate-900 flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-xl border border-slate-200"
        >
          <i className="fa-solid fa-arrow-left text-xs"></i>
          <span>Back to App</span>
        </button>

        {successResult ? (
          <div className="text-center py-8 space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto text-2xl shadow-xs">
              <i className="fa-solid fa-circle-check"></i>
            </div>
            <h3 className="text-xl font-bold text-slate-900">Request Submitted Successfully</h3>
            <p className="text-xs text-slate-600 max-w-sm mx-auto">
              Your statutory Data Subject Access Request has been registered under NDPA 2023 guidelines.
            </p>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl text-left space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Tracking Ticket Number:</span>
                <strong className="font-mono text-emerald-700">{successResult.ticket_number}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Statutory SLA Deadline:</span>
                <strong className="text-slate-900">{successResult.statutory_deadline_date} (30 Days)</strong>
              </div>
            </div>

            <button
              onClick={onClose}
              className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow-xs"
            >
              Return to Platform
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="text-center pt-8">
              <div className="w-12 h-12 rounded-2xl bg-slate-900 text-white mx-auto flex items-center justify-center mb-2 shadow-xs">
                <i className="fa-solid fa-shield-halved text-emerald-400 text-xl"></i>
              </div>
              <h2 className="text-xl font-extrabold text-slate-900">Data Subject Rights Self-Service Desk</h2>
              <p className="text-xs text-slate-500 mt-1">
                Exercise your NDPA 2023 statutory privacy rights with {tenant?.name || 'Apex Microfinance Bank'}.
              </p>
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Select Right to Exercise:</label>
                <select
                  value={formData.request_type}
                  onChange={(e) => setFormData({ ...formData, request_type: e.target.value })}
                  className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-slate-900 focus:outline-none focus:border-emerald-600"
                >
                  <option value="access_copy">Right of Access (Copy of Personal Data)</option>
                  <option value="rectification">Right to Rectification (Correct Inaccuracies)</option>
                  <option value="erasure_deletion">Right to Erasure / Deletion (Right to be Forgotten)</option>
                  <option value="object_processing">Right to Object to Processing / Profiling</option>
                  <option value="data_portability">Right to Data Portability (Export Machine-Readable File)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Your Full Legal Name:</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Babatunde Lawal"
                    value={formData.data_subject_name}
                    onChange={(e) => setFormData({ ...formData, data_subject_name: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-slate-900 focus:outline-none focus:border-emerald-600"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Official Email Address:</label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. b.lawal@domain.ng"
                    value={formData.data_subject_email}
                    onChange={(e) => setFormData({ ...formData, data_subject_email: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-slate-900 focus:outline-none focus:border-emerald-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Details & Scope of Request:</label>
                <textarea
                  required
                  rows="3"
                  placeholder="Please specify account numbers, transaction references, or specific processing activities..."
                  value={formData.request_details}
                  onChange={(e) => setFormData({ ...formData, request_details: e.target.value })}
                  className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-slate-900 focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-[11px] text-emerald-900 leading-tight">
                🔒 <strong>Statutory SLA:</strong> Your request will be fulfilled within 30 calendar days as mandated by Section 34 of the Nigeria Data Protection Act 2023.
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all shadow-md disabled:opacity-50"
              >
                {submitting ? 'Transmitting Request...' : 'Submit Statutory Privacy Request'}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
