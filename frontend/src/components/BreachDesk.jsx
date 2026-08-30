import React, { useState, useEffect } from 'react';
import { 
  Flame, 
  Clock, 
  AlertTriangle, 
  FileText, 
  CheckCircle2, 
  Plus, 
  Send,
  Download,
  Copy,
  Check
} from 'lucide-react';
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
    // Refresh countdown every 60 seconds
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
      console.error('Error fetching Form 1:', err);
    }
  };

  const handleRecordNotification = async (e) => {
    e.preventDefault();
    if (!selectedBreach) return;
    try {
      const res = await api.notifyNdpc(selectedBreach.id, {
        ndpc_reference_number: ndpcRefInput,
      });
      if (res.success) {
        setNotification({ type: 'success', message: res.message });
        setShowNotifyModal(false);
        loadData();
        if (onRefreshMetrics) onRefreshMetrics();
      }
    } catch (err) {
      setNotification({ type: 'error', message: err.message });
    }
  };

  const copyFormText = () => {
    if (!formPack) return;
    navigator.clipboard.writeText(JSON.stringify(formPack, null, 2));
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
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-white tracking-tight">Personal Data Breach Incident Management</h2>
            <span className="text-[11px] bg-red-950 text-red-400 border border-red-800 px-2 py-0.5 rounded font-mono font-bold">
              NDPA SEC 40 (72-HOUR CLOCK)
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Evaluate incident severity, track the mandatory 72-hour regulatory notification SLA, and generate the official NDPC Form 1.
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg shadow-red-950/50 transition-all"
        >
          <Flame className="w-4 h-4" />
          <span>Report Security Incident</span>
        </button>
      </div>

      {/* Breaches List */}
      <div className="space-y-4">
        {loading ? (
          <div className="glass-panel p-12 text-center text-slate-400">Loading breach incidents...</div>
        ) : breaches.length === 0 ? (
          <div className="glass-panel p-12 text-center rounded-3xl">
            <CheckCircle2 className="w-10 h-10 text-brand-500 mx-auto mb-2" />
            <h3 className="text-base font-bold text-slate-200">No Active Data Breach Incidents</h3>
            <p className="text-xs text-slate-400 mt-1">All systems secure. Any reported incidents will start the statutory 72-hour countdown.</p>
          </div>
        ) : (
          breaches.map((breach) => {
            const hoursLeft = breach.hours_remaining;
            const isUrgent = hoursLeft <= 24 && !breach.is_ndpc_notified;

            return (
              <div 
                key={breach.id}
                className={`p-6 rounded-3xl border transition-all ${
                  breach.is_ndpc_notified 
                    ? 'glass-panel' 
                    : isUrgent 
                    ? 'glass-panel-danger' 
                    : 'glass-panel-warning'
                }`}
              >
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="text-xs font-mono font-bold bg-slate-900 px-2 py-0.5 rounded border border-slate-700 text-white">
                        {breach.incident_number}
                      </span>
                      <span className="text-[11px] uppercase font-mono bg-red-950 text-red-400 border border-red-800 px-2 py-0.5 rounded">
                        {breach.nature_of_incident?.replace(/_/g, ' ')}
                      </span>
                      <span className="text-xs text-slate-400 font-medium">
                        Affected Records: <strong className="text-white">{breach.estimated_affected_subjects}</strong>
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-white tracking-tight">{breach.title}</h3>
                    <p className="text-xs text-slate-300 mt-1">
                      <strong>Containment:</strong> {breach.containment_steps_taken || 'Immediate isolation initiated.'}
                    </p>
                  </div>

                  {/* 72-Hour Live Clock Component */}
                  <div className="flex flex-col items-end gap-2 flex-shrink-0">
                    {breach.is_ndpc_notified ? (
                      <div className="flex items-center gap-1.5 bg-emerald-950 text-brand-400 border border-emerald-800 px-3.5 py-1.5 rounded-full text-xs font-bold font-mono">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>NDPC Notified (Ref: {breach.ndpc_reference_number})</span>
                      </div>
                    ) : (
                      <div className={`flex items-center gap-2 px-4 py-2 rounded-2xl border font-mono font-extrabold text-sm ${
                        isUrgent 
                          ? 'bg-red-950 text-red-300 border-red-600 animate-pulse' 
                          : 'bg-amber-950 text-amber-300 border-amber-600'
                      }`}>
                        <Clock className="w-4 h-4" />
                        <span>{hoursLeft} Hours Remaining on 72h Clock</span>
                      </div>
                    )}

                    <div className="flex items-center gap-2 mt-1">
                      <button
                        onClick={() => {
                          setSelectedBreach(breach);
                          handleFetchForm1(breach.id);
                        }}
                        className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold flex items-center gap-1"
                      >
                        <FileText className="w-3.5 h-3.5 text-brand-400" />
                        <span>NDPC Form 1</span>
                      </button>

                      {!breach.is_ndpc_notified && (
                        <button
                          onClick={() => {
                            setSelectedBreach(breach);
                            setShowNotifyModal(true);
                          }}
                          className="px-3 py-1.5 bg-brand-600 hover:bg-brand-500 text-white rounded-xl text-xs font-bold flex items-center gap-1"
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>Record Filing</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* NDPC Form 1 Preview Modal */}
      {formPack && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
              <div>
                <span className="text-[10px] font-mono bg-red-950 text-red-400 px-2 py-0.5 rounded border border-red-800">
                  STATUTORY FILING PACK
                </span>
                <h3 className="text-base font-bold text-white mt-1">{formPack.form_title}</h3>
              </div>
              <button onClick={() => setFormPack(null)} className="text-slate-400 hover:text-white">&times;</button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 font-mono text-[11px] text-slate-300 overflow-x-auto">
                <pre>{JSON.stringify(formPack, null, 2)}</pre>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-800">
                <span className="text-slate-400 text-[11px]">NDPA 2023 Section 40 Statutory Notice Standard</span>
                <button
                  onClick={copyFormText}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold flex items-center gap-1.5"
                >
                  {copied ? <Check className="w-4 h-4 text-brand-400" /> : <Copy className="w-4 h-4" />}
                  <span>{copied ? 'Copied Form JSON' : 'Copy Notification Pack'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Record Notification Modal */}
      {showNotifyModal && selectedBreach && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-white">Record Official NDPC Filing</h3>
              <button onClick={() => setShowNotifyModal(false)} className="text-slate-400 hover:text-white">&times;</button>
            </div>

            <form onSubmit={handleRecordNotification} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">NDPC Filing Reference / Acknowledgement Number *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. NDPC/BR/2026/0491"
                  value={ndpcRefInput}
                  onChange={(e) => setNdpcRefInput(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:border-brand-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowNotifyModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-brand-600 hover:bg-brand-500 text-white rounded-xl text-xs font-bold"
                >
                  Confirm Notification
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Incident Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-white">Report Personal Data Security Breach</h3>
              <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-white">&times;</button>
            </div>

            <form onSubmit={handleCreateBreach} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Incident Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Credential stuffing anomaly detected on mobile API"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:border-red-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Nature of Incident *</label>
                  <select
                    value={formData.nature_of_incident}
                    onChange={(e) => setFormData({ ...formData, nature_of_incident: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:border-red-500 focus:outline-none"
                  >
                    <option value="unauthorized_access">Unauthorized Access</option>
                    <option value="ransomware_malware">Ransomware / Malware</option>
                    <option value="phishing_credential_theft">Phishing / Credential Theft</option>
                    <option value="lost_stolen_device">Lost / Stolen Device</option>
                    <option value="accidental_disclosure_email">Accidental Disclosure</option>
                    <option value="insider_threat">Insider Threat</option>
                    <option value="misconfigured_cloud_bucket">Misconfigured Cloud Bucket</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Date/Time Discovered *</label>
                  <input
                    type="datetime-local"
                    required
                    value={formData.date_time_discovered}
                    onChange={(e) => setFormData({ ...formData, date_time_discovered: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:border-red-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Estimated Affected Subjects *</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={formData.estimated_affected_subjects}
                    onChange={(e) => setFormData({ ...formData, estimated_affected_subjects: parseInt(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:border-red-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Assessed Risk to Rights/Freedoms *</label>
                  <select
                    value={formData.risk_assessment_level}
                    onChange={(e) => setFormData({ ...formData, risk_assessment_level: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:border-red-500 focus:outline-none"
                  >
                    <option value="low">Low Risk</option>
                    <option value="medium">Medium Risk</option>
                    <option value="high_to_rights_freedoms">High Risk to Rights & Freedoms</option>
                    <option value="critical_systemic">Critical Systemic Breach</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Compromised Data Categories (comma separated) *</label>
                <input
                  type="text"
                  required
                  value={formData.compromised_data_categories}
                  onChange={(e) => setFormData({ ...formData, compromised_data_categories: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:border-red-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Immediate Containment Steps *</label>
                <textarea
                  rows="2"
                  required
                  value={formData.containment_steps_taken}
                  onChange={(e) => setFormData({ ...formData, containment_steps_taken: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:border-red-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-red-950"
                >
                  Start 72-Hour Clock
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
