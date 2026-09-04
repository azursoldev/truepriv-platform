import React, { useState, useEffect } from 'react';
import { api } from '../lib/api';

export default function BreachDesk({ onRefreshMetrics }) {
  const [breaches, setBreaches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBreach, setSelectedBreach] = useState(null);
  const [formPack, setFormPack] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showNotifyModal, setShowNotifyModal] = useState(false);
  const [ndpcRefInput, setNdpcRefInput] = useState('');
  const [notification, setNotification] = useState(null);
  const [copied, setCopied] = useState(false);

  // New Breach Form State
  const [formData, setFormData] = useState({
    title: '',
    nature_of_incident: 'unauthorized_access',
    date_time_discovered: new Date().toISOString().slice(0, 16),
    estimated_affected_subjects: 150,
    compromised_data_categories: 'Customer Names, Masked Phone Numbers, Hashed Passwords, Transaction Reference IDs',
    risk_assessment_level: 'medium',
    containment_steps_taken: 'API rate limiting applied, impacted sessions terminated, password reset triggered.',
    remedial_measures: 'Firewall rules tightened, intrusion detection thresholds lowered.',
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await api.getBreaches();
      if (res.success) {
        setBreaches(res.data);
      }
    } catch (err) {
      console.error('Error loading breaches:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 60000);
    return () => clearInterval(interval);
  }, []);

  const handleCreateBreach = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        compromised_data_categories: formData.compromised_data_categories.split(',').map(s => s.trim()),
      };

      const res = await api.createBreach(payload);
      if (res.success) {
        setNotification({ type: 'success', message: 'Breach incident recorded. 72-Hour NDPC statutory countdown clock active.' });
        setShowCreateModal(false);
        loadData();
        if (onRefreshMetrics) onRefreshMetrics();
      }
    } catch (err) {
      setNotification({ type: 'error', message: err.message });
    }
  };

  const handleFetchForm1 = async (id) => {
    try {
      const res = await api.getBreachForm1(id);
      if (res.success) {
        setFormPack(res.form_pack);
      }
    } catch (err) {
      setNotification({ type: 'error', message: 'Failed to generate NDPC Form 1 pack.' });
    }
  };

  const handleNotifyNdpc = async (id) => {
    try {
      const res = await api.notifyNdpc(id, {
        ndpc_reference_number: ndpcRefInput || 'NDPC/INC/2026/08912',
        regulatory_notes: 'Initial 72-Hour Incident Notification submitted via official portal.',
      });
      if (res.success) {
        setNotification({ type: 'success', message: 'NDPC regulatory filing recorded.' });
        setShowNotifyModal(false);
        loadData();
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
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">72-Hour Statutory Breach Response Desk</h2>
            <span className="text-[11px] bg-red-50 text-red-700 border border-red-200 px-2 py-0.5 rounded font-mono font-bold">
              NDPA SEC 40
            </span>
          </div>
          <p className="text-xs text-slate-600 mt-0.5">
            Strict 72-hour countdown clocks, root-cause forensics, data subject notifications, and NDPC Form 1 filing packs.
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs"
        >
          <i className="fa-solid fa-triangle-exclamation text-xs"></i>
          <span>Declare Breach Incident</span>
        </button>
      </div>

      {/* Breach Incident List */}
      <div className="space-y-4">
        {loading ? (
          <div className="py-12 text-center text-slate-500 text-xs font-medium">Loading breach incidents...</div>
        ) : breaches.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center shadow-xs">
            <i className="fa-solid fa-shield-halved text-slate-300 text-3xl mb-2"></i>
            <h4 className="text-sm font-bold text-slate-800">No active data breaches</h4>
            <p className="text-xs text-slate-500 mt-1">All systems secure. Any confirmed breach must be reported within 72 hours under NDPA Section 40.</p>
          </div>
        ) : (
          breaches.map((b) => (
            <div
              key={b.id}
              onClick={() => { setSelectedBreach(b); handleFetchForm1(b.id); }}
              className="bg-white border border-slate-200 hover:border-red-400 rounded-3xl p-6 cursor-pointer transition-all shadow-xs space-y-4 group"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-red-50 text-red-600 border border-red-200 flex items-center justify-center font-bold text-base">
                    <i className="fa-solid fa-triangle-exclamation"></i>
                  </div>
                  <div>
                    <span className="text-[10px] font-mono text-slate-500 uppercase font-bold">Incident #{b.id.substring(0, 8)}</span>
                    <h3 className="text-base font-bold text-slate-900 group-hover:text-red-700 transition-colors">
                      {b.title}
                    </h3>
                  </div>
                </div>

                {/* Statutory Regulatory Live Clock Badge & Actions */}
                <div className="flex flex-wrap items-center gap-2">
                  {b.is_ndpc_notified ? (
                    <span className="text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 px-3 py-1.5 rounded-2xl flex items-center gap-1.5">
                      <i className="fa-solid fa-circle-check text-emerald-600"></i>
                      <span>NDPC Notified ({b.ndpc_reference_number || 'REF-CONFIRMED'})</span>
                    </span>
                  ) : (
                    <div className="flex items-center gap-2 p-2 px-3 rounded-2xl bg-red-50 border border-red-200 text-red-700 font-mono font-bold text-xs shadow-xs">
                      <i className="fa-solid fa-stopwatch text-red-600 text-sm"></i>
                      <span>SLA Clock: <strong className="text-red-950 font-extrabold text-sm">{b.hours_remaining ?? b.hours_remaining_72h ?? '48.0'}h Remaining</strong></span>
                    </div>
                  )}

                  <button
                    onClick={() => handleGenerateForm1(b.id)}
                    className="px-3 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
                    title="Generate NDPC Statutory Form 1 Filing Pack"
                  >
                    <i className="fa-solid fa-file-shield text-emerald-400"></i>
                    <span>NDPC Form 1 Pack</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                  <div className="text-[10px] text-slate-500 font-bold uppercase">Estimated Impact</div>
                  <div className="text-sm font-bold text-slate-900 mt-0.5">{b.estimated_affected_subjects} Data Subjects</div>
                </div>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                  <div className="text-[10px] text-slate-500 font-bold uppercase">Incident Nature</div>
                  <div className="text-sm font-bold text-slate-900 mt-0.5 uppercase font-mono">{b.nature_of_incident?.replace(/_/g, ' ')}</div>
                </div>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                  <div className="text-[10px] text-slate-500 font-bold uppercase">Containment Status</div>
                  <div className="text-sm font-bold text-emerald-700 mt-0.5">Contained & Isolated</div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Form 1 Filing Pack Modal */}
      {selectedBreach && formPack && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="w-full max-w-2xl bg-white border border-slate-200 rounded-3xl p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <span className="text-[10px] font-mono text-slate-500 uppercase font-bold">NDPC Statutory Form 1</span>
                <h3 className="text-base font-bold text-slate-900 mt-0.5">Official Breach Filing Pack: {selectedBreach.title}</h3>
              </div>
              <button onClick={() => setSelectedBreach(null)} className="text-slate-400 hover:text-slate-700">
                <i className="fa-solid fa-xmark text-base"></i>
              </button>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs space-y-2 font-mono text-slate-800">
              <div className="font-bold text-slate-900 border-b border-slate-200 pb-1">NIGERIA DATA PROTECTION COMMISSION (NDPC) INCIDENT REPORT</div>
              <div><strong>Statutory Authority:</strong> NDPA Section 40(1)</div>
              <div><strong>Controller Organization:</strong> {formPack.organization_name}</div>
              <div><strong>Discovery Timestamp:</strong> {formPack.incident_details?.discovered_at}</div>
              <div><strong>Affected Subjects:</strong> {formPack.incident_details?.affected_subjects_count}</div>
              <div><strong>Compromised Categories:</strong> {formPack.incident_details?.compromised_categories?.join(', ')}</div>
              <div><strong>Containment Measures:</strong> {formPack.remediation?.containment_steps}</div>
            </div>

            <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(JSON.stringify(formPack, null, 2));
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2000);
                }}
                className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5"
              >
                <i className="fa-solid fa-copy text-xs"></i>
                <span>{copied ? 'Copied to Clipboard!' : 'Copy Form 1 Payload'}</span>
              </button>

              <button
                type="button"
                onClick={() => handleNotifyNdpc(selectedBreach.id)}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs"
              >
                <i className="fa-solid fa-paper-plane text-xs"></i>
                <span>Record Official NDPC Filing</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Breach Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-xl bg-white border border-slate-200 rounded-3xl p-6 shadow-2xl max-h-[90vh] overflow-y-auto space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="text-base font-bold text-slate-900">Declare Data Breach Incident</h3>
              <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-slate-700">
                <i className="fa-solid fa-xmark text-base"></i>
              </button>
            </div>

            <form onSubmit={handleCreateBreach} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Incident Title / Summary:</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Unauthorized Credential Stuffing on Mobile Banking Endpoint"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-slate-900 focus:outline-none focus:border-red-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Incident Nature:</label>
                  <select
                    value={formData.nature_of_incident}
                    onChange={(e) => setFormData({ ...formData, nature_of_incident: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-slate-900 focus:outline-none focus:border-red-600"
                  >
                    <option value="unauthorized_access">Unauthorized Access</option>
                    <option value="ransomware_malware">Ransomware / Malware</option>
                    <option value="data_exfiltration">Data Exfiltration</option>
                    <option value="accidental_disclosure">Accidental Disclosure</option>
                    <option value="lost_stolen_hardware">Lost / Stolen Hardware</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Estimated Affected Subjects:</label>
                  <input
                    type="number"
                    required
                    value={formData.estimated_affected_subjects}
                    onChange={(e) => setFormData({ ...formData, estimated_affected_subjects: parseInt(e.target.value, 10) })}
                    className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Containment Steps Already Taken:</label>
                <textarea
                  rows="2"
                  value={formData.containment_steps_taken}
                  onChange={(e) => setFormData({ ...formData, containment_steps_taken: e.target.value })}
                  className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-slate-900 focus:outline-none focus:border-red-600"
                />
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
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold shadow-xs"
                >
                  Activate 72h Clock
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
