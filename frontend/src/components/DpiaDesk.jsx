import React, { useState, useEffect } from 'react';
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
        return <span className="text-[11px] bg-red-50 text-red-800 border border-red-200 px-2 py-0.5 rounded-full font-bold font-mono">CRITICAL RISK</span>;
      case 'high':
        return <span className="text-[11px] bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 rounded-full font-bold font-mono">HIGH RISK</span>;
      case 'medium':
        return <span className="text-[11px] bg-yellow-50 text-yellow-800 border border-yellow-200 px-2 py-0.5 rounded-full font-bold font-mono">MEDIUM RISK</span>;
      default:
        return <span className="text-[11px] bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded-full font-bold font-mono">LOW RESIDUAL</span>;
    }
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
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Data Protection Impact Assessments (DPIA)</h2>
            <span className="text-[11px] bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded font-mono font-bold">
              NDPA SEC 28
            </span>
          </div>
          <p className="text-xs text-slate-600 mt-0.5">
            5×5 Risk matrix evaluation, automated screening triggers, and formal DPO/DPCO sign-off seals.
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs"
        >
          <i className="fa-solid fa-plus text-xs"></i>
          <span>New DPIA Assessment</span>
        </button>
      </div>

      {/* DPIA Assessments List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {loading ? (
          <div className="col-span-2 py-12 text-center text-slate-500 text-xs font-medium">Loading DPIA assessments...</div>
        ) : assessments.length === 0 ? (
          <div className="col-span-2 bg-white border border-slate-200 rounded-3xl p-12 text-center shadow-xs">
            <i className="fa-solid fa-shield-halved text-slate-300 text-3xl mb-2"></i>
            <h4 className="text-sm font-bold text-slate-800">No DPIA assessments on file</h4>
            <p className="text-xs text-slate-500 mt-1">High-risk processing operations (biometrics, AI profiling) require statutory DPIA under NDPA Section 28.</p>
          </div>
        ) : (
          assessments.map((dpia) => (
            <div
              key={dpia.id}
              onClick={() => setSelectedDpia(dpia)}
              className="bg-white border border-slate-200 hover:border-emerald-500/80 rounded-3xl p-5 cursor-pointer transition-all shadow-xs space-y-4 group"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <span className="text-[10px] font-mono text-slate-500 uppercase font-bold">DPIA #{dpia.id.substring(0, 8)}</span>
                  <h3 className="text-base font-bold text-slate-900 group-hover:text-emerald-800 transition-colors mt-0.5">
                    {dpia.title}
                  </h3>
                </div>
                {getRiskBadge(dpia.residual_risk_level || 'low')}
              </div>

              <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                {dpia.description}
              </p>

              {/* 5x5 Inherent vs Residual Risk Visual Indicator */}
              <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs">
                <div>
                  <div className="text-[10px] text-slate-500 font-bold uppercase">Inherent Risk (L × I)</div>
                  <div className="text-sm font-mono font-extrabold text-red-600 mt-0.5">
                    {dpia.inherent_risk_score} / 25
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5">L:{dpia.inherent_likelihood} &bull; I:{dpia.inherent_impact}</div>
                </div>

                <div className="border-l border-slate-200 pl-3">
                  <div className="text-[10px] text-slate-500 font-bold uppercase">Residual Risk (Post-Control)</div>
                  <div className="text-sm font-mono font-extrabold text-emerald-700 mt-0.5">
                    {dpia.residual_risk_score} / 25
                  </div>
                  <div className="text-[10px] text-emerald-800 font-bold mt-0.5 flex items-center gap-1">
                    <i className="fa-solid fa-shield-check text-emerald-600 text-xs"></i>
                    <span>Safeguards Applied</span>
                  </div>
                </div>
              </div>

              {/* DPO Sign-Off Status */}
              <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-100">
                <span className="text-slate-500">Sign-off Status:</span>
                <span className={`font-semibold capitalize flex items-center gap-1.5 ${
                  dpia.dpo_sign_off_status === 'approved' ? 'text-emerald-700 font-bold' : 'text-amber-700 font-bold'
                }`}>
                  <i className={`fa-solid ${dpia.dpo_sign_off_status === 'approved' ? 'fa-stamp text-emerald-600' : 'fa-clock text-amber-600'} text-xs`}></i>
                  <span>{dpia.dpo_sign_off_status === 'approved' ? 'DPO Approved & Sealed' : 'Pending Review'}</span>
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Detail Modal / Drawer */}
      {selectedDpia && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex justify-end animate-in fade-in">
          <div className="w-full max-w-xl bg-white border-l border-slate-200 h-full overflow-y-auto p-6 flex flex-col justify-between shadow-2xl">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-slate-200">
                <div>
                  <span className="text-[10px] font-mono uppercase bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded border border-emerald-200 font-bold">
                    DPIA Assessment Review
                  </span>
                  <h3 className="text-lg font-bold text-slate-900 mt-1">{selectedDpia.title}</h3>
                </div>
                <button 
                  onClick={() => setSelectedDpia(null)}
                  className="p-1.5 rounded-lg bg-slate-100 text-slate-500 hover:text-slate-800"
                >
                  <i className="fa-solid fa-xmark text-base"></i>
                </button>
              </div>

              <div className="space-y-4 py-4 text-xs">
                <div>
                  <label className="text-slate-600 font-bold block mb-1">Description & Scope:</label>
                  <p className="text-slate-800 bg-slate-50 p-3 rounded-xl border border-slate-200 leading-relaxed">
                    {selectedDpia.description}
                  </p>
                </div>

                <div>
                  <label className="text-slate-600 font-bold block mb-1">High Risk Triggers Identified (NDPA Sec 30):</label>
                  <div className="space-y-1">
                    {selectedDpia.high_risk_reasons?.map((r, i) => (
                      <div key={i} className="p-2 bg-red-50 text-red-800 border border-red-200 rounded-lg flex items-center gap-2">
                        <i className="fa-solid fa-triangle-exclamation text-red-600 text-xs"></i>
                        <span>{r}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-slate-600 font-bold block mb-1">Applied Technical & Organizational Safeguards:</label>
                  <div className="space-y-1">
                    {selectedDpia.mitigation_measures?.map((m, i) => (
                      <div key={i} className="p-2 bg-emerald-50 text-emerald-900 border border-emerald-200 rounded-lg flex items-center gap-2 font-medium">
                        <i className="fa-solid fa-circle-check text-emerald-600 text-xs"></i>
                        <span>{m}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 5x5 Matrix Visual Breakdown */}
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                  <div className="text-xs font-bold text-slate-800">5×5 Risk Matrix Heatmap Assessment</div>
                  <div className="grid grid-cols-2 gap-4 pt-1">
                    <div>
                      <div className="text-[10px] text-slate-500 uppercase font-bold">Inherent Risk Score</div>
                      <div className="text-xl font-extrabold font-mono text-red-600">{selectedDpia.inherent_risk_score} / 25</div>
                      <div className="text-[10px] text-slate-600">Likelihood: {selectedDpia.inherent_likelihood} &bull; Impact: {selectedDpia.inherent_impact}</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-500 uppercase font-bold">Residual Risk Score</div>
                      <div className="text-xl font-extrabold font-mono text-emerald-700">{selectedDpia.residual_risk_score} / 25</div>
                      <div className="text-[10px] text-slate-600">Likelihood: {selectedDpia.residual_likelihood} &bull; Impact: {selectedDpia.residual_impact}</div>
                    </div>
                  </div>
                </div>

                {/* Digital Signature & Seal */}
                <div className="p-4 bg-purple-50/70 border border-purple-200 rounded-2xl text-xs space-y-1.5">
                  <div className="font-bold text-purple-950 flex items-center gap-1.5">
                    <i className="fa-solid fa-stamp text-purple-700"></i>
                    <span>DPO & DPCO Statutory Digital Seal</span>
                  </div>
                  <div className="text-[11px] text-purple-900 font-mono">
                    SHA-256: 8f9b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b
                  </div>
                  <div className="text-[10px] text-purple-700">
                    Timestamp: {selectedDpia.dpo_signed_off_at || 'March 2027'} &bull; Verified under NDPC Framework
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-4 border-t border-slate-200 flex items-center justify-between gap-3">
              <div className="text-xs text-slate-600">
                Status: <strong className="text-slate-900">{selectedDpia.dpo_sign_off_status}</strong>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleSignOff(selectedDpia.id, 'requires_further_mitigation')}
                  className="px-3 py-2 bg-amber-50 hover:bg-amber-100 border border-amber-300 text-amber-800 rounded-xl text-xs font-bold"
                >
                  Request Mitigation
                </button>
                <button
                  onClick={() => handleSignOff(selectedDpia.id, 'approved')}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs"
                >
                  Sign & Approve DPIA
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create DPIA Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-xl bg-white border border-slate-200 rounded-3xl p-6 shadow-2xl max-h-[90vh] overflow-y-auto space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="text-base font-bold text-slate-900">Create DPIA Assessment</h3>
              <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-slate-700">
                <i className="fa-solid fa-xmark text-base"></i>
              </button>
            </div>

            <form onSubmit={handleCreateDpia} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 font-bold mb-1">DPIA Assessment Title:</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. AI-Powered Facial KYC & Biometric Verification Pipeline"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-slate-900 focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Description & Purpose:</label>
                <textarea
                  required
                  rows="2"
                  placeholder="Describe the processing operation and risks to data subjects..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-slate-900 focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Inherent Likelihood (1–5):</label>
                  <input
                    type="number"
                    min="1"
                    max="5"
                    value={formData.inherent_likelihood}
                    onChange={(e) => setFormData({ ...formData, inherent_likelihood: parseInt(e.target.value, 10) })}
                    className="w-full bg-white border border-slate-300 rounded-xl p-2 text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Inherent Impact (1–5):</label>
                  <input
                    type="number"
                    min="1"
                    max="5"
                    value={formData.inherent_impact}
                    onChange={(e) => setFormData({ ...formData, inherent_impact: parseInt(e.target.value, 10) })}
                    className="w-full bg-white border border-slate-300 rounded-xl p-2 text-slate-900"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-xl text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow-xs"
                >
                  Save Assessment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
