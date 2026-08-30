import React, { useState, useEffect } from 'react';
import { 
  ClipboardCheck, 
  Download, 
  Upload, 
  CheckCircle2, 
  AlertTriangle, 
  FileText, 
  ShieldCheck, 
  Plus,
  ArrowRight,
  Sparkles,
  Award
} from 'lucide-react';
import { api } from '../lib/api';

export default function AuditDesk({ onRefreshMetrics }) {
  const [projects, setProjects] = useState([]);
  const [activeProject, setActiveProject] = useState(null);
  const [groupedChecklist, setGroupedChecklist] = useState({});
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState(null);
  const [showFindingModal, setShowFindingModal] = useState(false);
  const [findingForm, setFindingForm] = useState({
    title: '',
    description: '',
    severity: 'medium',
    recommendation: '',
    remediation_plan: '',
  });

  const loadProjects = async () => {
    setLoading(true);
    try {
      const res = await api.getAudits();
      if (res.success && res.data.length > 0) {
        setProjects(res.data);
        loadProjectDetails(res.data[0].id);
      }
    } catch (err) {
      console.error('Error loading audits:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadProjectDetails = async (id) => {
    try {
      const res = await api.getAudit(id);
      if (res.success) {
        setActiveProject(res.project);
        setGroupedChecklist(res.grouped_checklist);
      }
    } catch (err) {
      console.error('Error loading project details:', err);
    }
  };

  useEffect(() => {
    loadProjects();
  }, []);

  const handleUpdateItemStatus = async (itemId, newStatus, maxPoints) => {
    const points = newStatus === 'compliant' ? maxPoints : (newStatus === 'partially_compliant' ? (maxPoints / 2) : 0);
    try {
      const res = await api.updateChecklistItem(itemId, {
        status: newStatus,
        awarded_points: points,
      });
      if (res.success) {
        setNotification({ type: 'success', message: 'Checklist scored & overall readiness updated.' });
        loadProjectDetails(activeProject.id);
        if (onRefreshMetrics) onRefreshMetrics();
      }
    } catch (err) {
      setNotification({ type: 'error', message: err.message });
    }
  };

  const handleCreateFinding = async (e) => {
    e.preventDefault();
    try {
      const res = await api.storeFinding(activeProject.id, findingForm);
      if (res.success) {
        setNotification({ type: 'success', message: 'Audit finding added to remediation tracker.' });
        setShowFindingModal(false);
        loadProjectDetails(activeProject.id);
        if (onRefreshMetrics) onRefreshMetrics();
      }
    } catch (err) {
      setNotification({ type: 'error', message: err.message });
    }
  };

  const handleDownloadPdf = () => {
    if (!activeProject) return;
    window.open(`/api/v1/audits/${activeProject.id}/report`, '_blank');
  };

  const getDomainTitle = (domain) => {
    switch (domain) {
      case 'governance_accountability':
        return '🏛️ Governance, DPO & Accountability (NDPA Sec 24)';
      case 'lawfulness_consent':
        return '📜 Lawfulness, Legal Bases & Consent (NDPA Sec 25)';
      case 'data_subject_rights':
        return '👤 Data Subject Access Rights & 30d SLA (NDPA Sec 34-38)';
      case 'security_measures':
        return '🔒 Technical Security & Encryption (NDPA Sec 39)';
      case 'third_party_processors':
        return '🤝 Third-Party Processors & DPA (NDPA Sec 29)';
      case 'cross_border_transfers':
        return '🌐 International Data Transfers & Safeguards (NDPA Sec 41-43)';
      default:
        return domain;
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

      {/* Audit Header Banner */}
      <div className="glass-panel p-6 rounded-3xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-mono font-bold bg-purple-950 text-purple-300 border border-purple-800 px-2.5 py-0.5 rounded-full">
                🏛️ NDPC STATUTORY AUDIT DESK
              </span>
              <span className="text-xs text-slate-400">Audit Year {activeProject?.audit_year || 2026}</span>
            </div>
            <h2 className="text-2xl font-bold text-white tracking-tight">
              {activeProject?.title || 'NDPC Statutory Compliance Audit 2026'}
            </h2>
            <p className="text-xs text-slate-300 mt-1 max-w-xl">
              Conduct official assurance against the Nigeria Data Protection Commission GAID guidelines.
              DPCO Firm: <strong className="text-purple-300">{activeProject?.dpco_firm?.name || 'Vanguard Compliance & Audit Partners DPCO'}</strong>
            </p>

            <div className="flex items-center gap-3 mt-4">
              <div className="text-xs bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-800 text-slate-300">
                Seal Code: <strong className="font-mono text-brand-400">{activeProject?.dpco_seal_code || 'DPCO-SEAL-2026-APX-883'}</strong>
              </div>
              <div className="text-xs bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-800 text-slate-300">
                Score: <strong className="font-mono text-brand-400">{activeProject?.overall_score || 78.5}%</strong>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-end gap-3 flex-shrink-0">
            {/* 1-Click Official NDPC PDF Export */}
            <button
              onClick={handleDownloadPdf}
              className="px-5 py-2.5 bg-gradient-to-r from-brand-600 to-emerald-500 hover:from-brand-500 hover:to-emerald-400 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg shadow-brand-950/60 transition-all"
            >
              <Download className="w-4 h-4" />
              <span>Download NDPC Statutory Report (PDF)</span>
            </button>

            <button
              onClick={() => setShowFindingModal(true)}
              className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all"
            >
              <Plus className="w-3.5 h-3.5 text-brand-400" />
              <span>Log Non-Conformity</span>
            </button>
          </div>
        </div>
      </div>

      {/* GAID Audit Checklist Framework */}
      <div className="space-y-6">
        <h3 className="text-base font-bold text-white tracking-tight">NDPC GAID Checklist Domains & Evaluation</h3>

        {Object.keys(groupedChecklist).map((domainKey) => {
          const items = groupedChecklist[domainKey];
          return (
            <div key={domainKey} className="glass-panel rounded-3xl overflow-hidden">
              <div className="bg-slate-900/90 px-6 py-3.5 border-b border-slate-800 flex items-center justify-between">
                <span className="text-sm font-bold text-slate-200">{getDomainTitle(domainKey)}</span>
                <span className="text-xs text-slate-400 font-mono">{items.length} Verification Clauses</span>
              </div>

              <div className="divide-y divide-slate-800/60">
                {items.map((item) => (
                  <div key={item.id} className="p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 hover:bg-slate-850/40 transition-colors">
                    <div className="space-y-1 max-w-2xl">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold text-brand-400 bg-brand-950 px-2 py-0.5 rounded border border-brand-800">
                          {item.section_code}
                        </span>
                        <span className="text-xs text-slate-400">Awarded: <strong>{item.awarded_points} / {item.max_points} pts</strong></span>
                      </div>
                      <h4 className="text-sm font-semibold text-white">{item.question}</h4>
                      {item.auditor_findings && (
                        <p className="text-xs text-slate-400 bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80">
                          <strong className="text-purple-300">DPCO Finding:</strong> {item.auditor_findings}
                        </p>
                      )}
                    </div>

                    {/* Quick Scoring Status Radios */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button
                        onClick={() => handleUpdateItemStatus(item.id, 'compliant', item.max_points)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                          item.status === 'compliant'
                            ? 'bg-emerald-950 text-brand-400 border border-brand-500 shadow-md shadow-brand-950'
                            : 'bg-slate-800 text-slate-400 hover:text-white'
                        }`}
                      >
                        ✓ Compliant
                      </button>

                      <button
                        onClick={() => handleUpdateItemStatus(item.id, 'partially_compliant', item.max_points)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                          item.status === 'partially_compliant'
                            ? 'bg-amber-950 text-amber-400 border border-amber-500 shadow-md shadow-amber-950'
                            : 'bg-slate-800 text-slate-400 hover:text-white'
                        }`}
                      >
                        Partially
                      </button>

                      <button
                        onClick={() => handleUpdateItemStatus(item.id, 'non_compliant', item.max_points)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                          item.status === 'non_compliant'
                            ? 'bg-red-950 text-red-400 border border-red-500 shadow-md shadow-red-950'
                            : 'bg-slate-800 text-slate-400 hover:text-white'
                        }`}
                      >
                        ✕ Non-Compliant
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Non-Conformities & Remediation Tracker */}
      {activeProject?.findings && activeProject.findings.length > 0 && (
        <div className="glass-panel p-6 rounded-3xl">
          <h3 className="text-base font-bold text-white mb-3">Audit Non-Conformities & Action Tracker</h3>
          <div className="space-y-3">
            {activeProject.findings.map((f) => (
              <div key={f.id} className="p-4 bg-slate-900/80 rounded-2xl border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-red-400 uppercase font-mono bg-red-950 px-2 py-0.5 rounded border border-red-800">
                      {f.severity} Severity
                    </span>
                    <span className="text-xs text-slate-400">Status: <strong className="text-amber-400">{f.status}</strong></span>
                  </div>
                  <h4 className="text-sm font-bold text-white mt-1.5">{f.title}</h4>
                  <p className="text-xs text-slate-300 mt-0.5">{f.description}</p>
                  <p className="text-xs text-brand-400 mt-1"><strong>Action Plan:</strong> {f.remediation_plan || f.recommendation}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal to log finding */}
      {showFindingModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-white">Log Audit Non-Conformity</h3>
              <button onClick={() => setShowFindingModal(false)} className="text-slate-400 hover:text-white">&times;</button>
            </div>

            <form onSubmit={handleCreateFinding} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Finding Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Missing DPA with SMS Provider"
                  value={findingForm.title}
                  onChange={(e) => setFindingForm({ ...findingForm, title: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:border-brand-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Severity *</label>
                <select
                  value={findingForm.severity}
                  onChange={(e) => setFindingForm({ ...findingForm, severity: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:border-brand-500 focus:outline-none"
                >
                  <option value="critical">Critical</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                  <option value="observation">Observation</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Description *</label>
                <textarea
                  rows="2"
                  required
                  value={findingForm.description}
                  onChange={(e) => setFindingForm({ ...findingForm, description: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:border-brand-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Auditor Recommendation *</label>
                <textarea
                  rows="2"
                  required
                  value={findingForm.recommendation}
                  onChange={(e) => setFindingForm({ ...findingForm, recommendation: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:border-brand-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowFindingModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-brand-600 hover:bg-brand-500 text-white rounded-xl text-xs font-bold"
                >
                  Save Finding
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
