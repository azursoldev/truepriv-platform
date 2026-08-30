import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, 
  Plus, 
  CheckCircle, 
  AlertTriangle, 
  Sliders, 
  FileText, 
  ArrowRight,
  Sparkles,
  X
} from 'lucide-react';
import { api } from '../lib/api';

export default function DpiaDesk({ onRefreshMetrics }) {
  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDpia, setSelectedDpia] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [notification, setNotification] = useState(null);

  // New DPIA Form State
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    high_risk_reasons: 'Processing biometric data at scale (NDPA Sec 30), Cross-border cloud data transfer',
    nature_of_processing: '',
    necessity_proportionality_check: '',
    inherent_likelihood: 4,
    inherent_impact: 4,
    mitigation_measures: 'AES-256 field level encryption, Immediate template deletion, Vendor DPA standard contractual clauses, MFA enforcement',
    residual_likelihood: 1,
    residual_impact: 2,
    dpo_recommendations: 'Technical safeguards are proportionate and meet NDPA 2023 requirements.',
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await api.getDpia();
      if (res.success) {
        setAssessments(res.data);
      }
    } catch (err) {
      console.error('Error loading DPIAs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateDpia = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        high_risk_reasons: formData.high_risk_reasons.split(',').map(s => s.trim()),
        mitigation_measures: formData.mitigation_measures.split(',').map(s => s.trim()),
      };

      const res = await api.createDpia(payload);
      if (res.success) {
        setNotification({ type: 'success', message: 'DPIA assessment created.' });
        setShowCreateModal(false);
        loadData();
        if (onRefreshMetrics) onRefreshMetrics();
      }
    } catch (err) {
      setNotification({ type: 'error', message: err.message });
    }
  };

  const handleSignOff = async (id, status) => {
    try {
      const res = await api.signOffDpia(id, {
        status,
        dpo_recommendations: 'Formally approved. Residual risk within acceptable risk appetite.',
        dpco_review_notes: 'Reviewed & verified under NDPC statutory guidelines.',
      });
      if (res.success) {
        setNotification({ type: 'success', message: res.message });
        loadData();
        if (selectedDpia?.id === id) {
          setSelectedDpia({ ...selectedDpia, dpo_sign_off_status: status });
        }
        if (onRefreshMetrics) onRefreshMetrics();
      }
    } catch (err) {
      setNotification({ type: 'error', message: err.message });
    }
  };

  const getRiskBadge = (level) => {
    switch (level) {
      case 'critical':
        return <span className="text-[11px] bg-red-950 text-red-400 border border-red-800 px-2 py-0.5 rounded-full font-bold font-mono">CRITICAL RISK</span>;
      case 'high':
        return <span className="text-[11px] bg-amber-950 text-amber-400 border border-amber-800 px-2 py-0.5 rounded-full font-bold font-mono">HIGH RISK</span>;
      case 'medium':
        return <span className="text-[11px] bg-yellow-950 text-yellow-400 border border-yellow-800 px-2 py-0.5 rounded-full font-bold font-mono">MEDIUM RISK</span>;
      default:
        return <span className="text-[11px] bg-emerald-950 text-brand-400 border border-emerald-800 px-2 py-0.5 rounded-full font-bold font-mono">LOW RISK</span>;
    }
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
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-white tracking-tight">Data Protection Impact Assessment (DPIA)</h2>
            <span className="text-[11px] bg-sky-950 text-sky-400 border border-sky-800 px-2 py-0.5 rounded font-mono font-bold">
              NDPA SEC 28
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Conduct risk scoring and apply technical mitigations for high-risk processing operations (Biometrics, AI profiling, Child data).
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg shadow-sky-950/50 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Conduct New DPIA</span>
        </button>
      </div>

      {/* DPIA Assessments List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {loading ? (
          <div className="col-span-2 py-12 text-center text-slate-400">Loading DPIA Assessments...</div>
        ) : assessments.length === 0 ? (
          <div className="col-span-2 glass-panel p-12 text-center rounded-3xl">
            <ShieldAlert className="w-10 h-10 text-slate-600 mx-auto mb-2" />
            <h3 className="text-base font-bold text-slate-200">No High-Risk DPIAs Registered</h3>
            <p className="text-xs text-slate-400 mt-1">Click above to initiate an automated impact assessment.</p>
          </div>
        ) : (
          assessments.map((dpia) => (
            <div 
              key={dpia.id}
              onClick={() => setSelectedDpia(dpia)}
              className="glass-panel p-5 rounded-3xl hover:border-sky-500/40 hover:bg-slate-850/70 transition-all cursor-pointer flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-[10px] font-mono bg-slate-800 text-slate-300 px-2 py-0.5 rounded border border-slate-700">
                    DPIA #{dpia.id.substring(0, 8)}
                  </span>
                  <div>
                    {dpia.dpo_sign_off_status === 'approved' ? (
                      <span className="text-[11px] bg-emerald-950 text-brand-400 border border-emerald-800 px-2 py-0.5 rounded-full font-semibold">
                        ✓ DPO Approved
                      </span>
                    ) : (
                      <span className="text-[11px] bg-amber-950 text-amber-400 border border-amber-800 px-2 py-0.5 rounded-full font-semibold">
                        Pending Sign-off
                      </span>
                    )}
                  </div>
                </div>

                <h3 className="text-base font-bold text-white tracking-tight">{dpia.title}</h3>
                <p className="text-xs text-slate-300 line-clamp-2 mt-1 leading-relaxed">
                  {dpia.description}
                </p>

                {/* Risk Score Comparison Matrix */}
                <div className="grid grid-cols-2 gap-3 my-4">
                  <div className="bg-slate-950/80 p-3 rounded-2xl border border-slate-800 text-center">
                    <div className="text-[10px] text-slate-400 font-semibold uppercase">Inherent Risk</div>
                    <div className="text-xl font-extrabold text-white font-mono mt-0.5">
                      {dpia.inherent_risk_score} <span className="text-xs font-normal text-slate-500">/ 25</span>
                    </div>
                    <div className="mt-1">{getRiskBadge(dpia.inherent_risk_level)}</div>
                  </div>

                  <div className="bg-slate-950/80 p-3 rounded-2xl border border-slate-800 text-center">
                    <div className="text-[10px] text-slate-400 font-semibold uppercase">Residual Risk</div>
                    <div className="text-xl font-extrabold text-brand-400 font-mono mt-0.5">
                      {dpia.residual_risk_score} <span className="text-xs font-normal text-slate-500">/ 25</span>
                    </div>
                    <div className="mt-1">{getRiskBadge(dpia.residual_risk_level)}</div>
                  </div>
                </div>

                {/* High Risk Screening Triggers */}
                <div>
                  <div className="text-[11px] font-semibold text-slate-400 mb-1">High-Risk Triggers:</div>
                  <div className="flex flex-wrap gap-1.5">
                    {dpia.high_risk_reasons?.map((reason, idx) => (
                      <span key={idx} className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded-md border border-slate-700">
                        {reason}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                <span>Mitigations: <strong>{dpia.mitigation_measures?.length || 0} Safeguards</strong></span>
                <span className="text-sky-400 font-semibold flex items-center gap-1">
                  <span>View Details</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* DPIA Detail Drawer */}
      {selectedDpia && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex justify-end animate-in fade-in">
          <div className="w-full max-w-xl bg-slate-900 border-l border-slate-800 h-full overflow-y-auto p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <div>
                  <span className="text-[10px] font-mono bg-sky-950 text-sky-400 px-2 py-0.5 rounded border border-sky-800">
                    DPIA Assessment Review
                  </span>
                  <h3 className="text-lg font-bold text-white mt-1">{selectedDpia.title}</h3>
                </div>
                <button onClick={() => setSelectedDpia(null)} className="text-slate-400 hover:text-white">&times;</button>
              </div>

              <div className="space-y-4 py-4 text-xs">
                <div>
                  <label className="text-slate-400 font-semibold block mb-1">Impact Description:</label>
                  <p className="text-slate-200 bg-slate-950/80 p-3 rounded-xl border border-slate-800 leading-relaxed">
                    {selectedDpia.description}
                  </p>
                </div>

                <div>
                  <label className="text-slate-400 font-semibold block mb-1">Technical & Organizational Mitigations Applied:</label>
                  <div className="space-y-1.5">
                    {selectedDpia.mitigation_measures?.map((mit, i) => (
                      <div key={i} className="flex items-start gap-2 bg-slate-950/80 p-2.5 rounded-xl border border-slate-800">
                        <CheckCircle className="w-4 h-4 text-brand-400 flex-shrink-0 mt-0.5" />
                        <span className="text-slate-200">{mit}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-slate-400 font-semibold block mb-1">DPO Regulatory Recommendations:</label>
                  <p className="text-slate-200 bg-slate-950/80 p-3 rounded-xl border border-slate-800 leading-relaxed">
                    {selectedDpia.dpo_recommendations || 'Safeguards verified compliant with NDPA 2023 Section 28.'}
                  </p>
                </div>
              </div>
            </div>

            {/* DPO Sign-off Trail */}
            <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
              <div className="text-xs text-slate-400">
                Status: <strong>{selectedDpia.dpo_sign_off_status}</strong>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleSignOff(selectedDpia.id, 'requires_consultation_ndpc')}
                  className="px-3 py-2 bg-amber-950 hover:bg-amber-900 border border-amber-800 text-amber-300 rounded-xl text-xs font-semibold"
                >
                  Request NDPC Consultation
                </button>
                <button
                  onClick={() => handleSignOff(selectedDpia.id, 'approved')}
                  className="px-4 py-2 bg-brand-600 hover:bg-brand-500 text-white rounded-xl text-xs font-bold"
                >
                  Formally Approve DPIA
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create DPIA Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-white">Conduct New Data Protection Impact Assessment</h3>
              <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-white">&times;</button>
            </div>

            <form onSubmit={handleCreateDpia} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">DPIA Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Impact Assessment on Automated Facial Biometric Onboarding"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:border-sky-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">High-Risk Processing Description *</label>
                <textarea
                  rows="2"
                  required
                  placeholder="Describe why this processing introduces potential risk to data subject rights..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:border-sky-500 focus:outline-none"
                />
              </div>

              {/* Inherent Risk Sliders */}
              <div className="p-4 bg-slate-950/80 rounded-2xl border border-slate-800">
                <div className="font-bold text-white mb-2">1. Inherent Risk Evaluation (Before Safeguards)</div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-slate-400 block mb-1">Likelihood (1 to 5): <strong>{formData.inherent_likelihood}</strong></label>
                    <input
                      type="range"
                      min="1"
                      max="5"
                      value={formData.inherent_likelihood}
                      onChange={(e) => setFormData({ ...formData, inherent_likelihood: parseInt(e.target.value) })}
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 block mb-1">Impact Severity (1 to 5): <strong>{formData.inherent_impact}</strong></label>
                    <input
                      type="range"
                      min="1"
                      max="5"
                      value={formData.inherent_impact}
                      onChange={(e) => setFormData({ ...formData, inherent_impact: parseInt(e.target.value) })}
                      className="w-full"
                    />
                  </div>
                </div>
                <div className="mt-2 text-right text-xs text-slate-400 font-mono">
                  Inherent Score: <strong className="text-red-400">{formData.inherent_likelihood * formData.inherent_impact} / 25</strong>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Applied Safeguards & Mitigations (comma separated) *</label>
                <textarea
                  rows="2"
                  required
                  value={formData.mitigation_measures}
                  onChange={(e) => setFormData({ ...formData, mitigation_measures: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:border-sky-500 focus:outline-none"
                />
              </div>

              {/* Residual Risk Sliders */}
              <div className="p-4 bg-slate-950/80 rounded-2xl border border-slate-800">
                <div className="font-bold text-white mb-2">2. Residual Risk Evaluation (After Mitigations)</div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-slate-400 block mb-1">Residual Likelihood (1 to 5): <strong>{formData.residual_likelihood}</strong></label>
                    <input
                      type="range"
                      min="1"
                      max="5"
                      value={formData.residual_likelihood}
                      onChange={(e) => setFormData({ ...formData, residual_likelihood: parseInt(e.target.value) })}
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 block mb-1">Residual Impact (1 to 5): <strong>{formData.residual_impact}</strong></label>
                    <input
                      type="range"
                      min="1"
                      max="5"
                      value={formData.residual_impact}
                      onChange={(e) => setFormData({ ...formData, residual_impact: parseInt(e.target.value) })}
                      className="w-full"
                    />
                  </div>
                </div>
                <div className="mt-2 text-right text-xs text-slate-400 font-mono">
                  Residual Score: <strong className="text-brand-400">{formData.residual_likelihood * formData.residual_impact} / 25</strong>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs font-bold"
                >
                  Record & Calculate DPIA
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
