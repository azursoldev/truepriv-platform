import React, { useState } from 'react';
import { 
  Shield, 
  Send, 
  CheckCircle2, 
  AlertCircle, 
  ArrowLeft, 
  Lock,
  FileCheck
} from 'lucide-react';
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
    <div className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-md overflow-y-auto p-4 flex items-center justify-center animate-in fade-in">
      <div className="max-w-xl w-full bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative my-8">
        
        {/* Back button */}
        <button
          onClick={onClose}
          className="absolute top-6 left-6 text-xs text-slate-400 hover:text-white flex items-center gap-1.5 bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-700"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to App</span>
        </button>

        {/* Portal Header */}
        <div className="text-center pt-8 pb-6 border-b border-slate-800">
          <div className="w-12 h-12 rounded-2xl bg-brand-950 border border-brand-800 flex items-center justify-center mx-auto mb-3 shadow-lg shadow-brand-950">
            <Shield className="w-6 h-6 text-brand-400" />
          </div>
          <div className="text-xs font-mono font-bold text-brand-400 uppercase tracking-wider">
            {tenant?.name || 'Apex Microfinance Bank'}
          </div>
          <h2 className="text-xl font-bold text-white mt-1">Data Subject Rights Portal</h2>
          <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
            Exercise your statutory privacy rights under Section 34 of the <strong>Nigeria Data Protection Act (NDPA 2023)</strong>.
          </p>
        </div>

        {/* Success View */}
        {successResult ? (
          <div className="py-8 text-center space-y-4">
            <div className="w-14 h-14 rounded-full bg-emerald-950/80 border border-emerald-700 flex items-center justify-center mx-auto text-brand-400 shadow-xl shadow-brand-950">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-white">Request Submitted Successfully!</h3>
            <p className="text-xs text-slate-300 max-w-md mx-auto leading-relaxed">
              Your request has been securely logged with our Data Protection Officer. Under the NDPA 2023, you will receive a verified response within <strong>30 calendar days</strong>.
            </p>

            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 inline-block text-center font-mono">
              <div className="text-[11px] text-slate-400">Tracking Reference Number:</div>
              <div className="text-lg font-bold text-brand-400 mt-0.5">{successResult.ticket_number}</div>
            </div>

            <div className="pt-4">
              <button
                onClick={() => setSuccessResult(null)}
                className="px-6 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold"
              >
                Submit Another Request
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 pt-6 text-xs">
            {error && (
              <div className="p-3 bg-red-950/80 border border-red-800 rounded-xl text-red-300">
                {error}
              </div>
            )}

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Right You Wish to Exercise (NDPA Sections 34-38) *</label>
              <select
                value={formData.request_type}
                onChange={(e) => setFormData({ ...formData, request_type: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:border-brand-500 focus:outline-none"
              >
                <option value="access_copy">Right of Access (Receive copy of personal data)</option>
                <option value="rectification">Right to Rectification (Correct inaccurate records)</option>
                <option value="erasure">Right to Erasure ('Right to be Forgotten')</option>
                <option value="objection">Right to Object to Processing / Direct Marketing</option>
                <option value="restrict_processing">Right to Restrict Processing</option>
                <option value="data_portability">Right to Data Portability (Export structured data)</option>
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Full Legal Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Babatunde Adeyemi"
                  value={formData.data_subject_name}
                  onChange={(e) => setFormData({ ...formData, data_subject_name: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:border-brand-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Email Address *</label>
                <input
                  type="email"
                  required
                  placeholder="babatunde@example.com"
                  value={formData.data_subject_email}
                  onChange={(e) => setFormData({ ...formData, data_subject_email: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:border-brand-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Phone Number</label>
                <input
                  type="tel"
                  placeholder="+234 800 000 0000"
                  value={formData.data_subject_phone}
                  onChange={(e) => setFormData({ ...formData, data_subject_phone: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:border-brand-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Relationship to Organization *</label>
                <select
                  value={formData.subject_relationship}
                  onChange={(e) => setFormData({ ...formData, subject_relationship: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:border-brand-500 focus:outline-none"
                >
                  <option value="customer">Current Customer / Account Holder</option>
                  <option value="former_customer">Former Customer</option>
                  <option value="employee">Current Employee / Staff</option>
                  <option value="job_applicant">Job Applicant</option>
                  <option value="other">Website Visitor / Other</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Request Details & Description *</label>
              <textarea
                rows="3"
                required
                placeholder="Please describe the specific records or rectification requested..."
                value={formData.request_details}
                onChange={(e) => setFormData({ ...formData, request_details: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:border-brand-500 focus:outline-none"
              />
            </div>

            <div className="pt-2 flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                <Lock className="w-3.5 h-3.5 text-brand-400" />
                <span>Encrypted 256-bit submission</span>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-2.5 bg-gradient-to-r from-brand-600 to-emerald-500 hover:from-brand-500 hover:to-emerald-400 text-white rounded-xl text-xs font-bold shadow-lg shadow-brand-950 flex items-center gap-1.5 disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{submitting ? 'Submitting Request...' : 'Submit Statutory DSAR'}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
