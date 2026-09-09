import React, { useState, useEffect } from 'react';
import { api } from '../lib/api';

const LEGAL_BASES = [
  { value: 'contract', label: 'Contractual Obligation', desc: 'Processing necessary for the performance of an employment or customer contract.' },
  { value: 'legal_obligation', label: 'Legal Obligation', desc: 'Compliance with Nigerian statutory laws (e.g., NDPA, CAMA, Tax, CBN guidelines).' },
  { value: 'consent', label: 'Explicit Consent', desc: 'The data subject has provided clear, affirmative consent for this specific purpose.' },
  { value: 'legitimate_interest', label: 'Legitimate Interest', desc: 'Necessary for commercial operations where interests do not override privacy rights.' },
  { value: 'vital_interest', label: 'Vital Interest', desc: 'Essential to protect the life or physical integrity of the individual.' },
  { value: 'public_interest', label: 'Public Interest', desc: 'Carried out in the public interest or under statutory mandate.' },
];

const COMMON_DATA_ELEMENTS = [
  'Full Name',
  'Email Address',
  'Phone Number',
  'National ID (NIN)',
  'Bank Verification Number (BVN)',
  'Bank Account Details',
  'Home Address',
  'Salary / Compensation',
  'Employment History',
  'Biometrics / Photos',
  'Health / Medical Data',
  'Next of Kin Details',
];

export default function PublicChampionIntakePortal({ token }) {
  const [loading, setLoading] = useState(true);
  const [invitation, setInvitation] = useState(null);
  const [loadError, setLoadError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(null);
  const [submitError, setSubmitError] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    process_name: '',
    business_purpose: '',
    legal_basis: 'contract',
    personal_data_elements: ['Full Name', 'Email Address'],
    storage_location: '',
    retention_period: '7 Years post-termination (Statutory)',
    notes: '',
  });

  const [customElementInput, setCustomElementInput] = useState('');

  useEffect(() => {
    if (!token) {
      setLoadError('No invitation token provided. Please use the complete link provided by your Compliance Officer.');
      setLoading(false);
      return;
    }
    resolveToken(token);
  }, [token]);

  const resolveToken = async (invToken) => {
    setLoading(true);
    setLoadError(null);
    try {
      const res = await api.resolvePublicInvitation(invToken);
      if (res.success) {
        setInvitation(res.data);
        // If already accepted
        if (res.data.status === 'accepted') {
          setSubmitSuccess({
            alreadyAccepted: true,
            message: 'This invitation has already been submitted and accepted into the compliance register.'
          });
        }
      } else {
        setLoadError(res.message || 'Invalid or expired invitation token.');
      }
    } catch (err) {
      setLoadError(err.message || 'Unable to verify invitation. Please contact your DPO.');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleElement = (element) => {
    setFormData(prev => {
      const exists = prev.personal_data_elements.includes(element);
      return {
        ...prev,
        personal_data_elements: exists
          ? prev.personal_data_elements.filter(e => e !== element)
          : [...prev.personal_data_elements, element]
      };
    });
  };

  const handleAddCustomElement = (e) => {
    e.preventDefault();
    if (!customElementInput.trim()) return;
    if (!formData.personal_data_elements.includes(customElementInput.trim())) {
      setFormData(prev => ({
        ...prev,
        personal_data_elements: [...prev.personal_data_elements, customElementInput.trim()]
      }));
    }
    setCustomElementInput('');
  };

  const handleRemoveElement = (element) => {
    setFormData(prev => ({
      ...prev,
      personal_data_elements: prev.personal_data_elements.filter(e => e !== element)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.personal_data_elements.length === 0) {
      setSubmitError('Please select at least one personal data element processed.');
      return;
    }

    setSubmitting(true);
    setSubmitError(null);

    try {
      const res = await api.submitPublicChampionData(token, formData);
      if (res.success) {
        setSubmitSuccess({
          message: res.message,
          data: res.data
        });
      } else {
        setSubmitError(res.message || 'Submission failed.');
      }
    } catch (err) {
      setSubmitError(err.message || 'Failed to submit department data.');
    } finally {
      setSubmitting(false);
    }
  };

  // 1. Loading View
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col items-center justify-center p-6">
        <div className="w-12 h-12 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <h2 className="text-base font-semibold text-slate-300">Verifying Department Privacy Token...</h2>
        <p className="text-xs text-slate-500 mt-1">Connecting to TruePriv Compliance Sovereign Node</p>
      </div>
    );
  }

  // 2. Token Error View
  if (loadError) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-slate-900 border border-rose-500/30 rounded-3xl p-8 text-center shadow-2xl">
          <div className="w-16 h-16 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-2xl flex items-center justify-center mx-auto mb-5">
            <i className="fa-solid fa-triangle-exclamation text-2xl"></i>
          </div>
          <h2 className="text-lg font-bold text-white mb-2">Invitation Unavailable</h2>
          <p className="text-xs text-slate-400 mb-6 leading-relaxed">{loadError}</p>
          <div className="p-4 bg-slate-950/60 rounded-2xl border border-slate-800 text-left text-xs text-slate-400 space-y-2">
            <p className="font-semibold text-slate-300 flex items-center gap-2">
              <i className="fa-solid fa-circle-info text-sky-400"></i> What to do next:
            </p>
            <p>1. Ensure you copied the full link sent by your Data Protection Officer.</p>
            <p>2. If the link expired (valid for 7 days by default), request a fresh link from your compliance team.</p>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="mt-6 w-full py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl transition-all"
          >
            Retry Verification
          </button>
        </div>
      </div>
    );
  }

  // 3. Success / Already Accepted View
  if (submitSuccess) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-6 selection:bg-emerald-500 selection:text-white">
        <div className="max-w-lg w-full bg-slate-900 border border-emerald-500/30 rounded-3xl p-8 text-center shadow-2xl">
          <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-2xl flex items-center justify-center mx-auto mb-5 animate-bounce">
            <i className="fa-solid fa-shield-check text-3xl"></i>
          </div>
          <span className="px-3 py-1 bg-emerald-950/80 text-emerald-300 border border-emerald-500/40 rounded-full text-[11px] font-bold tracking-wide uppercase">
            Submission Confirmed
          </span>
          <h2 className="text-xl font-bold text-white mt-3 mb-2">Department Processing Recorded</h2>
          <p className="text-xs text-slate-400 mb-6 leading-relaxed">
            {submitSuccess.message || 'Your department processing activity has been logged into the central ROPA compliance register.'}
          </p>

          <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-5 text-left space-y-3 mb-6">
            <div className="flex justify-between items-center text-xs pb-2 border-b border-slate-800">
              <span className="text-slate-400">Organization:</span>
              <span className="font-bold text-slate-200">{invitation?.tenant_name}</span>
            </div>
            <div className="flex justify-between items-center text-xs pb-2 border-b border-slate-800">
              <span className="text-slate-400">Department:</span>
              <span className="font-bold text-emerald-400">{invitation?.department}</span>
            </div>
            <div className="flex justify-between items-center text-xs pb-2 border-b border-slate-800">
              <span className="text-slate-400">Champion:</span>
              <span className="text-slate-300">{invitation?.email}</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-400">Review Status:</span>
              <span className="px-2 py-0.5 bg-amber-500/10 text-amber-300 border border-amber-500/30 rounded-md font-mono text-[10px]">
                Draft (Pending DPO Audit)
              </span>
            </div>
          </div>

          <div className="p-4 bg-emerald-950/20 border border-emerald-500/20 rounded-2xl text-left text-xs text-slate-300 space-y-1.5">
            <p className="font-semibold text-emerald-300 flex items-center gap-2">
              <i className="fa-solid fa-circle-check text-emerald-400"></i> Next Step:
            </p>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Your Data Protection Officer (DPO) will review this inventory for NDPA Section 24 compliance and merge it into the official Record of Processing Activities (ROPA). You may now close this window.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // 4. Main Public Intake Form View
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center py-10 px-4 sm:px-6 selection:bg-emerald-500 selection:text-white">
      {/* Container */}
      <div className="max-w-3xl w-full space-y-6">

        {/* Top Header Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-2xl flex items-center justify-center shadow-inner">
                <i className="fa-solid fa-users-gear text-xl"></i>
              </div>
              <div>
                <span className="text-[11px] font-bold text-emerald-400 tracking-wider uppercase flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  NDPA Compliance Champion Intake
                </span>
                <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  Department Data Processing Register
                </h1>
              </div>
            </div>

            <div className="text-right">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Authorized Scope</span>
              <span className="text-xs font-bold text-slate-200 bg-slate-800 px-3 py-1 rounded-full border border-slate-700">
                {invitation?.department || 'Department'} Division
              </span>
            </div>
          </div>

          {/* Invitation Metadata Strip */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-5 text-xs">
            <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
              <span className="text-slate-500 text-[10px] block uppercase font-medium">Data Controller</span>
              <span className="font-bold text-slate-200 truncate block mt-0.5">{invitation?.tenant_name}</span>
            </div>
            <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
              <span className="text-slate-500 text-[10px] block uppercase font-medium">Assigned Champion</span>
              <span className="font-bold text-emerald-400 truncate block mt-0.5">{invitation?.email}</span>
            </div>
            <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
              <span className="text-slate-500 text-[10px] block uppercase font-medium">Statutory Authority</span>
              <span className="font-bold text-sky-400 truncate block mt-0.5">Nigeria NDPA 2023 Sec 24</span>
            </div>
          </div>

          <p className="text-xs text-slate-400 mt-4 leading-relaxed bg-slate-950/40 p-3.5 rounded-xl border border-slate-800/60">
            <i className="fa-solid fa-shield-halved text-emerald-400 mr-1.5"></i>
            As your department's designated Privacy Champion, please record the personal data processing activities conducted within your department (e.g. employee records, client onboarding, vendor management). This information will be reviewed by your DPO to maintain your organization's statutory compliance.
          </p>
        </div>

        {/* Error Alert */}
        {submitError && (
          <div className="bg-rose-500/10 border border-rose-500/30 text-rose-400 p-4 rounded-2xl text-xs flex items-center gap-3">
            <i className="fa-solid fa-circle-exclamation text-base"></i>
            <span>{submitError}</span>
          </div>
        )}

        {/* Form Container */}
        <form onSubmit={handleSubmit} className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-7">

          {/* Section 1: Process Identity */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
              <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs font-bold">1</span>
              <h3 className="text-sm font-bold text-white tracking-wide">Processing Activity Details</h3>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Process / Activity Name <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Staff Payroll & Pension Disbursement, Customer KYC Verification, Sales Outreach"
                  value={formData.process_name}
                  onChange={(e) => setFormData({ ...formData, process_name: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Business Purpose <span className="text-rose-400">*</span>
                </label>
                <textarea
                  required
                  rows="3"
                  placeholder="Why does your department collect and use this data? (e.g., Monthly compensation, tax deduction, statutory audit reporting)"
                  value={formData.business_purpose}
                  onChange={(e) => setFormData({ ...formData, business_purpose: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all leading-relaxed"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Lawful Basis under NDPA */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
              <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs font-bold">2</span>
              <h3 className="text-sm font-bold text-white tracking-wide">Lawful Basis under NDPA 2023</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {LEGAL_BASES.map((lb) => {
                const isSelected = formData.legal_basis === lb.value;
                return (
                  <label
                    key={lb.value}
                    onClick={() => setFormData({ ...formData, legal_basis: lb.value })}
                    className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between ${
                      isSelected
                        ? 'bg-emerald-950/40 border-emerald-500 text-white shadow-sm ring-1 ring-emerald-500'
                        : 'bg-slate-950/70 border-slate-800 hover:border-slate-700 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-bold flex items-center gap-2">
                        <i className={`fa-solid fa-${isSelected ? 'circle-check text-emerald-400' : 'circle text-slate-600'} text-xs`}></i>
                        {lb.label}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-snug">{lb.desc}</p>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Section 3: Personal Data Elements */}
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs font-bold">3</span>
                <h3 className="text-sm font-bold text-white tracking-wide">
                  Personal Data Elements Processed <span className="text-rose-400">*</span>
                </h3>
              </div>
              <span className="text-[10px] text-slate-400 font-mono">
                {formData.personal_data_elements.length} selected
              </span>
            </div>

            {/* Predefined Chips */}
            <div className="flex flex-wrap gap-2 pt-1">
              {COMMON_DATA_ELEMENTS.map((elem) => {
                const active = formData.personal_data_elements.includes(elem);
                return (
                  <button
                    type="button"
                    key={elem}
                    onClick={() => handleToggleElement(elem)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all flex items-center gap-1.5 ${
                      active
                        ? 'bg-emerald-500/20 border border-emerald-500/50 text-emerald-300'
                        : 'bg-slate-950 border border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                    }`}
                  >
                    <i className={`fa-solid fa-${active ? 'check' : 'plus'} text-[10px]`}></i>
                    <span>{elem}</span>
                  </button>
                );
              })}
            </div>

            {/* Custom Data Element Adder */}
            <div className="pt-2">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Type custom data element (e.g. Passport Number, Driver License)..."
                  value={customElementInput}
                  onChange={(e) => setCustomElementInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddCustomElement(e); } }}
                  className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
                <button
                  type="button"
                  onClick={handleAddCustomElement}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl transition-all"
                >
                  Add
                </button>
              </div>

              {/* Selected Chips with Delete */}
              {formData.personal_data_elements.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-3 p-3 bg-slate-950/60 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-500 w-full mb-1">Active Payload Elements:</span>
                  {formData.personal_data_elements.map((elem) => (
                    <span
                      key={elem}
                      className="px-2.5 py-1 bg-slate-900 border border-slate-700 text-slate-200 rounded-lg text-xs flex items-center gap-2 group"
                    >
                      <span>{elem}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveElement(elem)}
                        className="text-slate-500 group-hover:text-rose-400 transition-colors"
                      >
                        <i className="fa-solid fa-xmark text-[10px]"></i>
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Section 4: Storage & Retention */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
              <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs font-bold">4</span>
              <h3 className="text-sm font-bold text-white tracking-wide">Storage, Retention & Systems</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Storage Location & Software Used <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., BambooHR Cloud, Internal Shared Drive, File Cabinets"
                  value={formData.storage_location}
                  onChange={(e) => setFormData({ ...formData, storage_location: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Retention Period <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., 7 Years post-termination, 1 Year after KYC, Indefinite"
                  value={formData.retention_period}
                  onChange={(e) => setFormData({ ...formData, retention_period: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Additional Notes & Department Safeguards (Optional)
              </label>
              <textarea
                rows="2"
                placeholder="Mention any access controls (e.g. 2FA, encrypted drives, restricted folder permissions)..."
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 leading-relaxed"
              />
            </div>
          </div>

          {/* Submit Action */}
          <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-[11px] text-slate-400">
              <i className="fa-solid fa-lock text-emerald-400 mr-1.5"></i>
              Your submission will be securely transmitted directly to your DPO.
            </p>

            <button
              type="submit"
              disabled={submitting}
              className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Transmitting to DPO...</span>
                </>
              ) : (
                <>
                  <i className="fa-solid fa-paper-plane text-xs"></i>
                  <span>Submit Department Processing Inventory</span>
                </>
              )}
            </button>
          </div>

        </form>

        {/* Footer */}
        <div className="text-center text-[11px] text-slate-500 pb-8">
          Powered by TruePriv Sovereign DPODPCO Compliance Engine • Nigerian Data Protection Act (NDPA) 2023
        </div>

      </div>
    </div>
  );
}
