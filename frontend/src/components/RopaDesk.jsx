import React, { useState, useEffect } from 'react';
import { 
  FileSpreadsheet, 
  Sparkles, 
  Plus, 
  Search, 
  Filter, 
  CheckCircle, 
  Check, 
  AlertCircle, 
  Globe, 
  ShieldAlert, 
  Clock, 
  Edit3, 
  Trash2,
  X,
  ExternalLink
} from 'lucide-react';
import { api } from '../lib/api';

export default function RopaDesk({ onRefreshMetrics }) {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [showAutoFillModal, setShowAutoFillModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [templates, setTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState('fintech-payments');
  const [notification, setNotification] = useState(null);

  // Form state for creating activity
  const [formData, setFormData] = useState({
    process_name: '',
    department: 'Operations',
    business_purpose: '',
    legal_basis: 'contract',
    legal_basis_rationale: '',
    data_subject_categories: 'Customers, Account Signatories',
    personal_data_elements: 'Full Name, BVN, Phone Number, Email Address',
    special_category_data: false,
    cross_border_transfer: false,
    transfer_destination_countries: 'United States, Ireland',
    transfer_safeguards: 'standard_contractual_clauses',
    storage_location: 'AWS Cloud / Local Encrypted DC',
    retention_period: '6 years after relationship termination',
    security_measures: 'AES-256 encryption at rest, TLS 1.3, strict RBAC',
    requires_dpia: false,
  });

  const loadData = async () => {
    setLoading(true);
    try {
      let query = `?search=${encodeURIComponent(search)}`;
      if (departmentFilter) query += `&department=${departmentFilter}`;
      if (statusFilter) query += `&status=${statusFilter}`;
      
      const res = await api.getRopa(query);
      if (res.success) {
        setActivities(res.data);
      }
      const tRes = await api.getTemplates();
      if (tRes.success) {
        setTemplates(tRes.data);
      }
    } catch (err) {
      console.error('Error loading RoPA:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [departmentFilter, statusFilter]);

  const handleApplyTemplate = async () => {
    try {
      const res = await api.applyIndustryTemplate(selectedTemplate, false);
      if (res.success) {
        setNotification({ type: 'success', message: res.message });
        setShowAutoFillModal(false);
        loadData();
        if (onRefreshMetrics) onRefreshMetrics();
      }
    } catch (err) {
      setNotification({ type: 'error', message: err.message || 'Failed to apply template.' });
    }
  };

  const handleUpdateStatus = async (id, newStatus) => {
    try {
      const res = await api.updateRopaStatus(id, newStatus);
      if (res.success) {
        setNotification({ type: 'success', message: res.message });
        loadData();
        if (selectedActivity && selectedActivity.id === id) {
          setSelectedActivity({ ...selectedActivity, status: newStatus });
        }
        if (onRefreshMetrics) onRefreshMetrics();
      }
    } catch (err) {
      setNotification({ type: 'error', message: err.message });
    }
  };

  const handleCreateActivity = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        data_subject_categories: formData.data_subject_categories.split(',').map(s => s.trim()),
        personal_data_elements: formData.personal_data_elements.split(',').map(s => s.trim()),
        transfer_destination_countries: formData.cross_border_transfer 
          ? formData.transfer_destination_countries.split(',').map(s => s.trim()) 
          : [],
      };

      const res = await api.createRopa(payload);
      if (res.success) {
        setNotification({ type: 'success', message: 'Processing activity recorded successfully.' });
        setShowCreateModal(false);
        loadData();
        if (onRefreshMetrics) onRefreshMetrics();
      }
    } catch (err) {
      setNotification({ type: 'error', message: err.message });
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this processing activity from RoPA?')) return;
    try {
      const res = await api.deleteRopa(id);
      if (res.success) {
        setNotification({ type: 'success', message: 'Activity deleted.' });
        if (selectedActivity?.id === id) setSelectedActivity(null);
        loadData();
        if (onRefreshMetrics) onRefreshMetrics();
      }
    } catch (err) {
      setNotification({ type: 'error', message: err.message });
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'approved_active':
        return <span className="text-[11px] bg-emerald-950/80 text-brand-400 border border-emerald-800/60 px-2 py-0.5 rounded-full font-semibold flex items-center gap-1">✓ Approved Active</span>;
      case 'verified_by_dpo':
        return <span className="text-[11px] bg-sky-950/80 text-sky-400 border border-sky-800/60 px-2 py-0.5 rounded-full font-semibold flex items-center gap-1">🛡️ DPO Verified</span>;
      case 'reviewed_by_dept':
        return <span className="text-[11px] bg-indigo-950/80 text-indigo-400 border border-indigo-800/60 px-2 py-0.5 rounded-full font-semibold flex items-center gap-1">👥 Dept Reviewed</span>;
      default:
        return <span className="text-[11px] bg-slate-800 text-slate-300 border border-slate-700 px-2 py-0.5 rounded-full font-semibold flex items-center gap-1">📝 Draft</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Notification Toast */}
      {notification && (
        <div className={`p-4 rounded-2xl flex items-center justify-between text-xs font-semibold ${
          notification.type === 'success' ? 'bg-brand-950/90 text-brand-300 border border-brand-800' : 'bg-red-950/90 text-red-300 border border-red-800'
        }`}>
          <span>{notification.message}</span>
          <button onClick={() => setNotification(null)} className="text-slate-400 hover:text-white">&times;</button>
        </div>
      )}

      {/* Header & 1-Click Automation Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-white tracking-tight">Record of Processing Activities (RoPA)</h2>
            <span className="text-[11px] bg-brand-950 text-brand-400 border border-brand-800 px-2 py-0.5 rounded font-mono font-bold">
              NDPA SEC 24
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Maintain regulatory inventory of all personal data flows, legal bases, retention schedules, and safeguards.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {/* 1-Click Industry Preset Autofill Button */}
          <button
            onClick={() => setShowAutoFillModal(true)}
            className="px-4 py-2 bg-gradient-to-r from-brand-600 to-emerald-500 hover:from-brand-500 hover:to-emerald-400 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg shadow-brand-950/50 transition-all group"
          >
            <Sparkles className="w-4 h-4 text-emerald-100 group-hover:rotate-12 transition-transform" />
            <span>1-Click Industry Autofill</span>
          </button>

          <button
            onClick={() => setShowCreateModal(true)}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all"
          >
            <Plus className="w-4 h-4 text-brand-400" />
            <span>New Activity</span>
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="glass-panel p-4 rounded-2xl flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by activity name or business purpose..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && loadData()}
            className="bg-transparent border-none text-xs text-white placeholder:text-slate-500 focus:outline-none w-full"
          />
        </div>

        <div className="flex items-center gap-3">
          <select
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
            className="bg-slate-900 border border-slate-700 text-slate-300 text-xs rounded-xl px-3 py-1.5 focus:outline-none"
          >
            <option value="">All Departments</option>
            <option value="Compliance & Risk">Compliance & Risk</option>
            <option value="Engineering & Payments">Engineering & Payments</option>
            <option value="Human Resources & Finance">Human Resources & Finance</option>
            <option value="Credit & Data Science">Credit & Data Science</option>
            <option value="Customer Experience">Customer Experience</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-900 border border-slate-700 text-slate-300 text-xs rounded-xl px-3 py-1.5 focus:outline-none"
          >
            <option value="">All Statuses</option>
            <option value="draft">Draft</option>
            <option value="reviewed_by_dept">Reviewed by Dept</option>
            <option value="verified_by_dpo">Verified by DPO</option>
            <option value="approved_active">Approved Active</option>
          </select>
        </div>
      </div>

      {/* RoPA Interactive Data Table */}
      <div className="glass-panel rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/90 border-b border-slate-800 text-slate-400 uppercase tracking-wider font-semibold">
              <tr>
                <th className="py-3 px-4">Processing Activity & Purpose</th>
                <th className="py-3 px-4">Dept</th>
                <th className="py-3 px-4">NDPA Legal Basis</th>
                <th className="py-3 px-4">Safeguards & Storage</th>
                <th className="py-3 px-4">Status & Review</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {loading ? (
                <tr>
                  <td colSpan="6" className="py-8 text-center text-slate-400">Loading RoPA activities...</td>
                </tr>
              ) : activities.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center">
                    <FileSpreadsheet className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                    <p className="text-sm font-semibold text-slate-300">No processing activities found</p>
                    <p className="text-xs text-slate-500 mt-1">Use the 1-Click Industry Autofill button to populate standard records.</p>
                  </td>
                </tr>
              ) : (
                activities.map((act) => (
                  <tr 
                    key={act.id} 
                    className="hover:bg-slate-850/60 transition-colors cursor-pointer group"
                    onClick={() => setSelectedActivity(act)}
                  >
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-100 group-hover:text-brand-300 transition-colors">
                        {act.process_name}
                      </div>
                      <div className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                        {act.business_purpose}
                      </div>
                      <div className="flex items-center gap-2 mt-1.5">
                        {act.special_category_data && (
                          <span className="text-[10px] bg-red-950 text-red-400 border border-red-800/60 px-1.5 py-0.2 rounded font-mono font-bold">
                            ⚠️ Special Category PII
                          </span>
                        )}
                        {act.requires_dpia && (
                          <span className="text-[10px] bg-sky-950 text-sky-400 border border-sky-800/60 px-1.5 py-0.2 rounded font-mono">
                            DPIA Mandated
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-slate-300 whitespace-nowrap">
                      {act.department}
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className="text-[11px] font-mono uppercase bg-slate-800 text-slate-300 px-2 py-0.5 rounded border border-slate-700">
                        {act.legal_basis?.replace(/_/g, ' ')}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="text-slate-300 font-mono text-[11px]">{act.storage_location}</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">Retention: {act.retention_period}</div>
                      {act.cross_border_transfer && (
                        <div className="text-[10px] text-amber-400 flex items-center gap-1 mt-0.5">
                          <Globe className="w-3 h-3" />
                          <span>Cross-border ({act.transfer_destination_countries?.join(', ')})</span>
                        </div>
                      )}
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {getStatusBadge(act.status)}
                    </td>

                    <td className="py-3.5 px-4 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1.5">
                        {act.status !== 'approved_active' && (
                          <button
                            onClick={() => handleUpdateStatus(act.id, act.status === 'draft' ? 'verified_by_dpo' : 'approved_active')}
                            title={act.status === 'draft' ? 'Verify as DPO' : 'Approve for NDPC RoPA'}
                            className="p-1.5 rounded-lg bg-emerald-950 hover:bg-emerald-900 border border-emerald-800 text-brand-400"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(act.id)}
                          title="Delete Activity"
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-red-950 text-slate-400 hover:text-red-400"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Activity Detail Drawer */}
      {selectedActivity && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex justify-end animate-in fade-in">
          <div className="w-full max-w-xl bg-slate-900 border-l border-slate-800 h-full overflow-y-auto p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <div>
                  <span className="text-[10px] font-mono uppercase bg-brand-950 text-brand-400 px-2 py-0.5 rounded border border-brand-800">
                    RoPA Record #{selectedActivity.id.substring(0, 8)}
                  </span>
                  <h3 className="text-lg font-bold text-white mt-1">{selectedActivity.process_name}</h3>
                </div>
                <button 
                  onClick={() => setSelectedActivity(null)}
                  className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4 py-4 text-xs">
                <div>
                  <label className="text-slate-400 font-semibold block mb-1">Business Purpose:</label>
                  <p className="text-slate-200 bg-slate-950/80 p-3 rounded-xl border border-slate-800 leading-relaxed">
                    {selectedActivity.business_purpose}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-slate-400 font-semibold block mb-1">Department:</label>
                    <div className="text-slate-200 bg-slate-950/80 p-2.5 rounded-xl border border-slate-800">
                      {selectedActivity.department}
                    </div>
                  </div>
                  <div>
                    <label className="text-slate-400 font-semibold block mb-1">Legal Basis (NDPA Sec 25):</label>
                    <div className="text-brand-400 font-semibold bg-slate-950/80 p-2.5 rounded-xl border border-slate-800 uppercase font-mono">
                      {selectedActivity.legal_basis?.replace(/_/g, ' ')}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-slate-400 font-semibold block mb-1">Personal Data Elements Collected:</label>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedActivity.personal_data_elements?.map((el, i) => (
                      <span key={i} className="bg-slate-800 text-slate-200 px-2.5 py-1 rounded-lg border border-slate-700">
                        {el}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-slate-400 font-semibold block mb-1">Data Subject Categories:</label>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedActivity.data_subject_categories?.map((subj, i) => (
                      <span key={i} className="bg-slate-800 text-slate-300 px-2 py-0.5 rounded-md border border-slate-700">
                        {subj}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-slate-400 font-semibold block mb-1">Storage & Retention:</label>
                  <p className="text-slate-300 bg-slate-950/80 p-3 rounded-xl border border-slate-800">
                    <strong>Location:</strong> {selectedActivity.storage_location}<br />
                    <strong>Retention Period:</strong> {selectedActivity.retention_period}
                  </p>
                </div>

                <div>
                  <label className="text-slate-400 font-semibold block mb-1">Security Controls & Encryption:</label>
                  <p className="text-slate-300 bg-slate-950/80 p-3 rounded-xl border border-slate-800">
                    {selectedActivity.security_measures || 'AES-256 encryption, TLS 1.3, Strict RBAC'}
                  </p>
                </div>
              </div>
            </div>

            {/* Workflow Action Buttons */}
            <div className="pt-4 border-t border-slate-800 flex items-center justify-between gap-3">
              <div className="text-xs text-slate-400">
                Current Status: <strong>{selectedActivity.status}</strong>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleUpdateStatus(selectedActivity.id, 'verified_by_dpo')}
                  className="px-3 py-2 bg-sky-950 hover:bg-sky-900 border border-sky-800 text-sky-300 rounded-xl text-xs font-semibold"
                >
                  Verify as DPO
                </button>
                <button
                  onClick={() => handleUpdateStatus(selectedActivity.id, 'approved_active')}
                  className="px-4 py-2 bg-brand-600 hover:bg-brand-500 text-white rounded-xl text-xs font-bold"
                >
                  Approve Record
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 1-Click Industry Preset Autofill Modal */}
      {showAutoFillModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-brand-400" />
                <h3 className="text-lg font-bold text-white">1-Click Industry RoPA Autofill</h3>
              </div>
              <button onClick={() => setShowAutoFillModal(false)} className="text-slate-400 hover:text-white">&times;</button>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed mb-4">
              Select your business sector. The NDPA automation engine will instantly populate standard processing activities, legal bases, retention schedules, and safeguard policies.
            </p>

            <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1 mb-6">
              {templates.map((tpl) => (
                <label 
                  key={tpl.slug}
                  onClick={() => setSelectedTemplate(tpl.slug)}
                  className={`p-3.5 rounded-2xl border flex items-start gap-3 cursor-pointer transition-all ${
                    selectedTemplate === tpl.slug 
                      ? 'bg-brand-950/40 border-brand-500 shadow-md shadow-brand-950' 
                      : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <input 
                    type="radio" 
                    name="industry" 
                    checked={selectedTemplate === tpl.slug}
                    onChange={() => setSelectedTemplate(tpl.slug)}
                    className="mt-1"
                  />
                  <div>
                    <div className="text-sm font-semibold text-white">{tpl.industry_name}</div>
                    <div className="text-xs text-slate-400 mt-0.5">{tpl.description}</div>
                    <div className="text-[10px] font-mono text-brand-400 mt-1">
                      Includes {tpl.default_ropa?.length || 0} standard processing activities
                    </div>
                  </div>
                </label>
              ))}
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
              <button 
                onClick={() => setShowAutoFillModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button 
                onClick={handleApplyTemplate}
                className="px-5 py-2 bg-brand-600 hover:bg-brand-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-brand-950 flex items-center gap-2"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Apply & Populate RoPA</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create New Activity Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-white">Record New Processing Activity</h3>
              <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-white">&times;</button>
            </div>

            <form onSubmit={handleCreateActivity} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Activity / Process Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Employee Biometric Time Attendance & Access Control"
                  value={formData.process_name}
                  onChange={(e) => setFormData({ ...formData, process_name: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:border-brand-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Department *</label>
                  <input
                    type="text"
                    required
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:border-brand-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">NDPA Legal Basis (Section 25) *</label>
                  <select
                    value={formData.legal_basis}
                    onChange={(e) => setFormData({ ...formData, legal_basis: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:border-brand-500 focus:outline-none"
                  >
                    <option value="consent">Consent (Section 25(1)(a))</option>
                    <option value="contract">Performance of Contract (Section 25(1)(a))</option>
                    <option value="legal_obligation">Legal Obligation (Section 25(1)(b))</option>
                    <option value="vital_interest">Vital Interests (Section 25(1)(c))</option>
                    <option value="public_interest">Public Interest (Section 25(1)(d))</option>
                    <option value="legitimate_interest">Legitimate Interests (Section 25(1)(f))</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Business Purpose & Legal Rationale *</label>
                <textarea
                  rows="2"
                  required
                  placeholder="Explain why this processing is necessary and proportionate..."
                  value={formData.business_purpose}
                  onChange={(e) => setFormData({ ...formData, business_purpose: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:border-brand-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Personal Data Elements (comma separated) *</label>
                <input
                  type="text"
                  required
                  value={formData.personal_data_elements}
                  onChange={(e) => setFormData({ ...formData, personal_data_elements: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:border-brand-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Storage Location *</label>
                  <input
                    type="text"
                    value={formData.storage_location}
                    onChange={(e) => setFormData({ ...formData, storage_location: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:border-brand-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Retention Period *</label>
                  <input
                    type="text"
                    value={formData.retention_period}
                    onChange={(e) => setFormData({ ...formData, retention_period: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:border-brand-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center gap-6 pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.special_category_data}
                    onChange={(e) => setFormData({ ...formData, special_category_data: e.target.checked })}
                  />
                  <span className="text-slate-300 font-medium">Special Category / Biometrics</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.cross_border_transfer}
                    onChange={(e) => setFormData({ ...formData, cross_border_transfer: e.target.checked })}
                  />
                  <span className="text-slate-300 font-medium">Cross-Border Transfer</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.requires_dpia}
                    onChange={(e) => setFormData({ ...formData, requires_dpia: e.target.checked })}
                  />
                  <span className="text-slate-300 font-medium">Requires DPIA</span>
                </label>
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
                  className="px-5 py-2 bg-brand-600 hover:bg-brand-500 text-white rounded-xl text-xs font-bold"
                >
                  Save to RoPA
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
