import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Sparkles, 
  Download, 
  Check, 
  Edit3, 
  Copy, 
  Clock,
  Shield
} from 'lucide-react';
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
        setSelectedPolicy(res.policy);
      }
    } catch (err) {
      setNotification({ type: 'error', message: err.message });
    } finally {
      setGenerating(false);
    }
  };

  const copyContent = () => {
    if (!selectedPolicy) return;
    navigator.clipboard.writeText(selectedPolicy.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Toast */}
      {notification && (
        <div className={`p-4 rounded-2xl flex items-center justify-between text-xs font-semibold ${
          notification.type === 'success' ? 'bg-brand-950/90 text-brand-300 border border-brand-800' : 'bg-red-950/90 text-red-300 border border-red-800'
        }`}>
          <span>{notification.message}</span>
          <button onClick={() => setNotification(null)} className="text-slate-400 hover:text-white">&times;</button>
        </div>
      )}

      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-bold text-white tracking-tight">Automated NDPA Policy & Governance Generator</h2>
          <span className="text-[11px] bg-brand-950 text-brand-400 border border-brand-800 px-2 py-0.5 rounded font-mono font-bold">
            1-CLICK GOVERNANCE
          </span>
        </div>
        <p className="text-xs text-slate-400 mt-0.5">
          Generate compliant statutory notices and policy documents auto-filled with your organization's verified RoPA inventory.
        </p>
      </div>

      {/* 1-Click Policy Generator Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-3">
        {policyTypes.map((pt) => {
          const existing = policies.find(p => p.type === pt.id);

          return (
            <div 
              key={pt.id}
              className="glass-panel p-4 rounded-2xl flex flex-col justify-between hover:border-brand-500/40 transition-all"
            >
              <div>
                <h4 className="text-xs font-bold text-white">{pt.label}</h4>
                <p className="text-[11px] text-slate-400 mt-1 leading-snug">{pt.desc}</p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between">
                {existing ? (
                  <span className="text-[10px] text-brand-400 font-semibold font-mono">v{existing.version} Generated</span>
                ) : (
                  <span className="text-[10px] text-slate-500 font-mono">Not Drafted</span>
                )}
                
                <button
                  onClick={() => handleGenerate(pt.id)}
                  disabled={generating}
                  className="p-1.5 rounded-lg bg-brand-950 hover:bg-brand-900 border border-brand-800 text-brand-400 disabled:opacity-50"
                  title="Generate or Refresh Policy"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Policy Previewer & Editor */}
      {selectedPolicy ? (
        <div className="glass-panel p-6 rounded-3xl">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
            <div>
              <span className="text-[10px] font-mono uppercase bg-slate-800 text-slate-300 px-2 py-0.5 rounded border border-slate-700">
                {selectedPolicy.status?.toUpperCase()} — v{selectedPolicy.version}
              </span>
              <h3 className="text-base font-bold text-white mt-1">{selectedPolicy.title}</h3>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={copyContent}
                className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold flex items-center gap-1.5"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-brand-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy Text'}</span>
              </button>
            </div>
          </div>

          <div className="mt-4 bg-slate-950 p-6 rounded-2xl border border-slate-800 text-xs text-slate-300 leading-relaxed font-sans whitespace-pre-wrap max-h-[500px] overflow-y-auto">
            {selectedPolicy.content}
          </div>
        </div>
      ) : (
        <div className="glass-panel p-12 text-center rounded-3xl text-slate-400">
          Click any card above to auto-generate a Nigerian NDPA-compliant policy.
        </div>
      )}
    </div>
  );
}
