import React, { useState, useEffect } from 'react';
import { api } from '../lib/api';

export default function PolicyDesk({ tenant }) {
  const [policies, setPolicies] = useState([]);
  const [selectedPolicy, setSelectedPolicy] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [notification, setNotification] = useState(null);

  const policyTypes = [
    { id: 'privacy_notice_website', label: 'Website Privacy Notice', desc: 'Public customer-facing privacy policy tailored to your live RoPA data flows.' },
    { id: 'employee_privacy_policy', label: 'Employee Workplace Policy', desc: 'Internal staff privacy & acceptable data handling obligations.' },
    { id: 'data_retention_schedule', label: 'Data Retention & Disposal Schedule', desc: 'Statutory matrix compliant with CBN, FIRS and NDPA retention standards.' },
    { id: 'incident_response_policy', label: '72-Hour Breach Response Protocol', desc: 'Internal procedure for triage and mandatory NDPC Section 40 notifications.' },
    { id: 'data_protection_agreement_dpa', label: 'Standard Vendor DPA Schedule', desc: 'Contractual template to execute with third-party data processors.' },
  ];

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await api.getPolicies();
      if (res.success) {
        setPolicies(res.data);
        if (res.data.length > 0 && !selectedPolicy) {
          setSelectedPolicy(res.data[0]);
        }
      }
    } catch (err) {
      console.error('Error loading policies:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleGenerate = async (type) => {
    setGenerating(true);
    try {
      const res = await api.generatePolicy({
        policy_type: type,
        dpo_name: 'Amina Bello (Certified DPO)',
        dpo_email: 'dpo@apexmfb.ng',
      });
      if (res.success) {
        setNotification({ type: 'success', message: 'Policy auto-generated successfully.' });
        loadData();
      }
    } catch (err) {
      setNotification({ type: 'error', message: err.message });
    } finally {
      setGenerating(false);
    }
  };

  const handleCopy = () => {
    if (!selectedPolicy) return;
    navigator.clipboard.writeText(selectedPolicy.generated_content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {notification && (
        <div className={`p-4 rounded-2xl flex items-center justify-between text-xs font-semibold shadow-xs ${
          notification.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-red-50 text-red-800 border border-red-200'
        }`}>
          <span>{notification.message}</span>
          <button onClick={() => setNotification(null)} className="text-slate-400 hover:text-slate-700 font-bold">&times;</button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Statutory Policy & Privacy Notice Auto-Generator</h2>
            <span className="text-[11px] bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded font-mono font-bold">
              NDPA TEMPLATES
            </span>
          </div>
          <p className="text-xs text-slate-600 mt-0.5">
            Auto-generate compliant Nigerian legal documentation tailored directly from your active RoPA database.
          </p>
        </div>
      </div>

      {/* Main Grid: Policy Library & Viewer */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left: Policy Template List */}
        <div className="space-y-3">
          <div className="text-xs font-bold text-slate-700 uppercase tracking-wider px-1">Available Document Types</div>
          {policyTypes.map((pt) => {
            const isSelected = selectedPolicy?.policy_type === pt.id;
            return (
              <div
                key={pt.id}
                onClick={() => {
                  const existing = policies.find(p => p.policy_type === pt.id);
                  if (existing) {
                    setSelectedPolicy(existing);
                  } else {
                    handleGenerate(pt.id);
                  }
                }}
                className={`p-4 rounded-2xl border cursor-pointer transition-all shadow-2xs ${
                  isSelected
                    ? 'bg-emerald-50/80 border-emerald-500 ring-2 ring-emerald-500/20'
                    : 'bg-white border-slate-200 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <h4 className="text-xs font-bold text-slate-900">{pt.label}</h4>
                  <i className="fa-solid fa-wand-magic-sparkles text-emerald-600 text-xs"></i>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed">{pt.desc}</p>
              </div>
            );
          })}
        </div>

        {/* Right: Policy Document Previewer */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-3xl p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
              <div>
                <span className="text-[10px] font-mono text-slate-500 uppercase font-bold">Document Preview</span>
                <h3 className="text-base font-bold text-slate-900 mt-0.5">
                  {selectedPolicy?.title || 'Website Privacy Notice (NDPA Compliant)'}
                </h3>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopy}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5"
                >
                  <i className="fa-solid fa-copy text-xs"></i>
                  <span>{copied ? 'Copied!' : 'Copy Text'}</span>
                </button>
              </div>
            </div>

            {generating ? (
              <div className="py-24 text-center text-slate-500 text-xs">Generating policy document from RoPA data...</div>
            ) : selectedPolicy ? (
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 text-xs text-slate-800 leading-relaxed font-mono whitespace-pre-wrap max-h-[500px] overflow-y-auto">
                {selectedPolicy.generated_content}
              </div>
            ) : (
              <div className="py-24 text-center text-slate-500 text-xs">Select a policy template on the left to generate or view.</div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
