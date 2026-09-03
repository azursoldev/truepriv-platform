import React, { useState, useEffect } from 'react';
import { api, getAuthToken, getActiveTenantId } from '../lib/api';

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
        setNotification({ type: 'success', message: 'Non-conformity finding recorded.' });
        setShowFindingModal(false);
        loadProjectDetails(activeProject.id);
        if (onRefreshMetrics) onRefreshMetrics();
      }
    } catch (err) {
      setNotification({ type: 'error', message: err.message });
    }
  };

  const handleCertify = async () => {
    if (!confirm('Are you sure you want to issue certified audit sign-off for this client?')) return;
    try {
      const res = await api.certifyAudit(activeProject.id, {
        dpco_managing_partner: 'Lead Audit Partner',
        ndpc_license_number: 'DPCO/2026/0491',
        overall_opinion: 'Satisfactory & Substantially Compliant under NDPA 2023',
      });
      if (res.success) {
        setNotification({ type: 'success', message: res.message });
        loadProjectDetails(activeProject.id);
        if (onRefreshMetrics) onRefreshMetrics();
      }
    } catch (err) {
      setNotification({ type: 'error', message: err.message });
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
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Statutory NDPC Compliance Audit & Remediation Desk</h2>
            <span className="text-[11px] bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded font-mono font-bold">
              GAID v1.2
            </span>
          </div>
          <p className="text-xs text-slate-600 mt-0.5">
            Annual statutory verification, 5-domain checklist scoring, evidence vault, and certified NDPC filing packs.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {activeProject && (
            <button
              onClick={handleCertify}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all"
            >
              <i className="fa-solid fa-stamp text-xs"></i>
              <span>Certify Audit Filing</span>
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="py-16 text-center text-slate-500 text-xs font-medium">Loading statutory audit project...</div>
      ) : !activeProject ? (
        <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center shadow-xs">
          <i className="fa-solid fa-clipboard-check text-slate-300 text-3xl mb-2"></i>
          <h4 className="text-sm font-bold text-slate-800">No active audit projects found</h4>
        </div>
      ) : (
        <div className="space-y-6">
          
          {/* Active Audit Overview Card */}
          <div className="bg-white border border-slate-200 p-6 rounded-3xl shadow-xs">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
              <div>
                <span className="text-[10px] font-mono text-slate-500 uppercase font-bold">Audit Project #{activeProject.id.substring(0, 8)}</span>
                <h3 className="text-lg font-bold text-slate-900 mt-0.5">{activeProject.title}</h3>
                <div className="flex items-center gap-3 text-xs text-slate-600 mt-1">
                  <span>Audit Year: <strong className="text-slate-900">{activeProject.audit_year}</strong></span>
                  <span>&bull;</span>
                  <span>DPCO: <strong className="text-purple-700 font-semibold">{activeProject.dpco_license_number || 'Vanguard Partners'}</strong></span>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="text-right">
                  <div className="text-[10px] text-slate-500 uppercase font-bold">Audit Completion Score</div>
                  <div className="text-2xl font-extrabold font-mono text-emerald-700 mt-0.5">
                    {activeProject.overall_audit_score}%
                  </div>
                </div>
              </div>
            </div>

            {/* Statutory Filing Deadline Alert */}
            <div className="mt-4 p-3.5 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <i className="fa-solid fa-clock text-amber-600 text-sm"></i>
                <span className="text-slate-700">Mandatory Annual Filing Deadline: <strong className="text-slate-900">March 15, 2027</strong></span>
              </div>
              <span className="text-[11px] font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                Audit Status: {activeProject.status?.replace(/_/g, ' ').toUpperCase()}
              </span>
            </div>
          </div>

          {/* 5-Domain Checklist & Evidence Scoring */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900">GAID Statutory Audit Checklist & Controls</h3>
              <span className="text-xs text-slate-500">5 Regulatory Domains</span>
            </div>

            <div className="space-y-6">
              {Object.keys(groupedChecklist).map((domain) => (
                <div key={domain} className="space-y-3">
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                    {domain}
                  </h4>

                  <div className="space-y-2">
                    {groupedChecklist[domain].map((item) => (
                      <div key={item.id} className="p-4 bg-white border border-slate-200 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-3 shadow-2xs">
                        <div className="flex-1">
                          <div className="text-xs font-bold text-slate-900">{item.requirement_title}</div>
                          <div className="text-[11px] text-slate-600 mt-0.5">{item.statutory_reference}</div>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono font-bold text-slate-600 px-2">
                            {item.awarded_points}/{item.max_points} pts
                          </span>
                          {['compliant', 'partially_compliant', 'non_compliant'].map((st) => (
                            <button
                              key={st}
                              onClick={() => handleUpdateItemStatus(item.id, st, item.max_points)}
                              className={`px-2.5 py-1 rounded-lg text-xs font-bold capitalize border transition-all ${
                                item.status === st
                                  ? st === 'compliant'
                                    ? 'bg-emerald-600 text-white border-emerald-700 shadow-2xs'
                                    : st === 'partially_compliant'
                                    ? 'bg-amber-500 text-white border-amber-600 shadow-2xs'
                                    : 'bg-red-600 text-white border-red-700 shadow-2xs'
                                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                              }`}
                            >
                              {st.replace(/_/g, ' ')}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}
    </div>
  );
}
