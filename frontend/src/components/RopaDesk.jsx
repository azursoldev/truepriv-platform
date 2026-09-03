import React, { useState, useEffect } from 'react';
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
        return <span className="text-[11px] bg-emerald-50 text-emerald-800 border border-emerald-200 px-2.5 py-0.5 rounded-full font-semibold flex items-center gap-1"><i className="fa-solid fa-circle-check text-emerald-600 text-[10px]"></i> Approved Active</span>;
      case 'verified_by_dpo':
        return <span className="text-[11px] bg-sky-50 text-sky-800 border border-sky-200 px-2.5 py-0.5 rounded-full font-semibold flex items-center gap-1"><i className="fa-solid fa-shield-halved text-sky-600 text-[10px]"></i> DPO Verified</span>;
      case 'reviewed_by_dept':
        return <span className="text-[11px] bg-indigo-50 text-indigo-800 border border-indigo-200 px-2.5 py-0.5 rounded-full font-semibold flex items-center gap-1"><i className="fa-solid fa-users text-indigo-600 text-[10px]"></i> Dept Reviewed</span>;
      default:
        return <span className="text-[11px] bg-slate-100 text-slate-700 border border-slate-200 px-2.5 py-0.5 rounded-full font-semibold flex items-center gap-1"><i className="fa-solid fa-file-pen text-slate-500 text-[10px]"></i> Draft</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Notification Toast */}
      {notification && (
        <div className={`p-4 rounded-2xl flex items-center justify-between text-xs font-semibold shadow-xs ${
          notification.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-red-50 text-red-800 border border-red-200'
        }`}>
          <span>{notification.message}</span>
          <button onClick={() => setNotification(null)} className="text-slate-400 hover:text-slate-700 font-bold">&times;</button>
        </div>
      )}

      {/* Header & 1-Click Automation Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Record of Processing Activities (RoPA)</h2>
            <span className="text-[11px] bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded font-mono font-bold">
              NDPA SEC 24
            </span>
          </div>
          <p className="text-xs text-slate-600 mt-0.5">
            Maintain regulatory inventory of all personal data flows, legal bases, retention schedules, and safeguards.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {/* 1-Click Industry Preset Autofill Button */}
          <button
            onClick={() => setShowAutoFillModal(true)}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-xs transition-all"
          >
            <i className="fa-solid fa-wand-magic-sparkles text-xs"></i>
            <span>1-Click Industry Autofill</span>
          </button>

          <button
            onClick={() => setShowCreateModal(true)}
            className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs"
          >
            <i className="fa-solid fa-plus text-xs"></i>
            <span>New Activity</span>
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white border border-slate-200 p-4 rounded-2xl flex flex-wrap items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-2 flex-1 min-w-[240px]">
          <i className="fa-solid fa-magnifying-glass text-slate-400 text-xs"></i>
          <input
            type="text"
            placeholder="Search by activity name or business purpose..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && loadData()}
            className="bg-transparent border-none text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none w-full"
          />
        </div>

        <div className="flex items-center gap-3">
          <select
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 text-slate-700 text-xs rounded-xl px-3 py-1.5 focus:outline-none focus:border-emerald-600"
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
            className="bg-slate-50 border border-slate-200 text-slate-700 text-xs rounded-xl px-3 py-1.5 focus:outline-none focus:border-emerald-600"
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
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase tracking-wider font-bold">
              <tr>
                <th className="py-3 px-4">Processing Activity & Purpose</th>
                <th className="py-3 px-4">Dept</th>
                <th className="py-3 px-4">NDPA Legal Basis</th>
                <th className="py-3 px-4">Safeguards & Storage</th>
                <th className="py-3 px-4">Status & Review</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="6" className="py-8 text-center text-slate-500 font-medium">Loading RoPA activities...</td>
                </tr>
              ) : activities.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center">
                    <i className="fa-solid fa-file-shield text-slate-300 text-3xl mb-2"></i>
                    <p className="text-sm font-bold text-slate-800">No processing activities found</p>
                    <p className="text-xs text-slate-500 mt-1">Use the 1-Click Industry Autofill button to populate standard records.</p>
                  </td>
                </tr>
              ) : (
                activities.map((act) => (
                  <tr 
                    key={act.id} 
                    className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                    onClick={() => setSelectedActivity(act)}
                  >
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900 group-hover:text-emerald-800 transition-colors">
                        {act.process_name}
                      </div>
                      <div className="text-[11px] text-slate-600 line-clamp-1 mt-0.5">
                        {act.business_purpose}
                      </div>
                      <div className="flex items-center gap-2 mt-1.5">
                        {act.special_category_data && (
                          <span className="text-[10px] bg-red-50 text-red-800 border border-red-200 px-1.5 py-0.2 rounded font-mono font-bold">
                            ⚠️ Special Category PII
                          </span>
                        )}
                        {act.requires_dpia && (
                          <span className="text-[10px] bg-blue-50 text-blue-800 border border-blue-200 px-1.5 py-0.2 rounded font-mono font-bold">
                            DPIA Mandated
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-slate-700 whitespace-nowrap font-medium">
                      {act.department}
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className="text-[11px] font-mono uppercase bg-slate-100 text-slate-800 px-2 py-0.5 rounded border border-slate-200 font-bold">
                        {act.legal_basis?.replace(/_/g, ' ')}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="text-slate-900 font-mono text-[11px] font-semibold">{act.storage_location}</div>
                      <div className="text-[10px] text-slate-500 mt-0.5">Retention: {act.retention_period}</div>
                      {act.cross_border_transfer && (
                        <div className="text-[10px] text-amber-800 flex items-center gap-1 mt-0.5">
                          <i className="fa-solid fa-globe text-amber-600"></i>
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
                            className="p-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-700"
                          >
                            <i className="fa-solid fa-check text-xs"></i>
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(act.id)}
                          title="Delete Activity"
                          className="p-1.5 rounded-lg bg-slate-100 hover:bg-red-50 text-slate-500 hover:text-red-700 border border-slate-200"
                        >
                          <i className="fa-solid fa-trash-can text-xs"></i>
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
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex justify-end animate-in fade-in">
          <div className="w-full max-w-xl bg-white border-l border-slate-200 h-full overflow-y-auto p-6 flex flex-col justify-between shadow-2xl">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-slate-200">
                <div>
                  <span className="text-[10px] font-mono uppercase bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded border border-emerald-200 font-bold">
                    RoPA Record #{selectedActivity.id.substring(0, 8)}
                  </span>
                  <h3 className="text-lg font-bold text-slate-900 mt-1">{selectedActivity.process_name}</h3>
                </div>
                <button 
                  onClick={() => setSelectedActivity(null)}
                  className="p-1.5 rounded-lg bg-slate-100 text-slate-500 hover:text-slate-800"
                >
                  <i className="fa-solid fa-xmark text-base"></i>
                </button>
              </div>

              <div className="space-y-4 py-4 text-xs">
                <div>
                  <label className="text-slate-600 font-bold block mb-1">Business Purpose:</label>
                  <p className="text-slate-800 bg-slate-50 p-3 rounded-xl border border-slate-200 leading-relaxed">
                    {selectedActivity.business_purpose}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-slate-600 font-bold block mb-1">Department:</label>
                    <div className="text-slate-800 bg-slate-50 p-2.5 rounded-xl border border-slate-200 font-medium">
                      {selectedActivity.department}
                    </div>
                  </div>
                  <div>
                    <label className="text-slate-600 font-bold block mb-1">Legal Basis (NDPA Sec 25):</label>
                    <div className="text-emerald-800 font-bold bg-slate-50 p-2.5 rounded-xl border border-slate-200 uppercase font-mono">
                      {selectedActivity.legal_basis?.replace(/_/g, ' ')}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-slate-600 font-bold block mb-1">Personal Data Elements Collected:</label>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedActivity.personal_data_elements?.map((el, i) => (
                      <span key={i} className="bg-slate-100 text-slate-800 px-2.5 py-1 rounded-lg border border-slate-200 font-medium">
                        {el}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-slate-600 font-bold block mb-1">Data Subject Categories:</label>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedActivity.data_subject_categories?.map((subj, i) => (
                      <span key={i} className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md border border-slate-200">
                        {subj}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-slate-600 font-bold block mb-1">Storage & Retention:</label>
                  <p className="text-slate-800 bg-slate-50 p-3 rounded-xl border border-slate-200">
                    <strong>Location:</strong> {selectedActivity.storage_location}<br />
                    <strong>Retention Period:</strong> {selectedActivity.retention_period}
                  </p>
                </div>

                <div>
                  <label className="text-slate-600 font-bold block mb-1">Security Controls & Encryption:</label>
                  <p className="text-slate-800 bg-slate-50 p-3 rounded-xl border border-slate-200">
                    {selectedActivity.security_measures || 'AES-256 encryption, TLS 1.3, Strict RBAC'}
                  </p>
                </div>
              </div>
            </div>

            {/* Workflow Action Buttons */}
            <div className="pt-4 border-t border-slate-200 flex items-center justify-between gap-3">
              <div className="text-xs text-slate-600">
                Current Status: <strong className="text-slate-900">{selectedActivity.status}</strong>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleUpdateStatus(selectedActivity.id, 'verified_by_dpo')}
                  className="px-3 py-2 bg-sky-50 hover:bg-sky-100 border border-sky-300 text-sky-800 rounded-xl text-xs font-bold"
                >
                  Verify as DPO
                </button>
                <button
                  onClick={() => handleUpdateStatus(selectedActivity.id, 'approved_active')}
                  className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs"
                >
                  Approve for NDPC
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 1-Click Industry Autofill Modal */}
      {showAutoFillModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-lg bg-white border border-slate-200 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2">
                <i className="fa-solid fa-wand-magic-sparkles text-emerald-600 text-base"></i>
                <h3 className="text-base font-bold text-slate-900">1-Click Nigerian Industry RoPA Presets</h3>
              </div>
              <button onClick={() => setShowAutoFillModal(false)} className="text-slate-400 hover:text-slate-700">
                <i className="fa-solid fa-xmark text-base"></i>
              </button>
            </div>

            <p className="text-xs text-slate-600">
              Select your organization's primary industry sector to instantly auto-populate compliant processing activities mapped to NDPA 2023 legal grounds.
            </p>

            <div className="space-y-2">
              {templates.map((tpl) => (
                <div
                  key={tpl.slug}
                  onClick={() => setSelectedTemplate(tpl.slug)}
                  className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                    selectedTemplate === tpl.slug 
                      ? 'border-emerald-600 bg-emerald-50/70 text-emerald-900' 
                      : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <div>
                    <div className="text-xs font-bold">{tpl.industry_name}</div>
                    <div className="text-[11px] text-slate-500">{tpl.default_ropa?.length || 0} pre-configured processing items</div>
                  </div>
                  {selectedTemplate === tpl.slug && (
                    <i className="fa-solid fa-circle-check text-emerald-600 text-sm"></i>
                  )}
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
              <button
                onClick={() => setShowAutoFillModal(false)}
                className="px-4 py-2 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-xl text-xs font-bold"
              >
                Cancel
              </button>
              <button
                onClick={handleApplyTemplate}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs"
              >
                Apply Industry Template
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Manual Create Activity Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-xl bg-white border border-slate-200 rounded-3xl p-6 shadow-2xl max-h-[90vh] overflow-y-auto space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="text-base font-bold text-slate-900">Record New Processing Activity</h3>
              <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-slate-700">
                <i className="fa-solid fa-xmark text-base"></i>
              </button>
            </div>

            <form onSubmit={handleCreateActivity} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Process / Activity Name:</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Employee Payroll Processing & Tax Remittance"
                  value={formData.process_name}
                  onChange={(e) => setFormData({ ...formData, process_name: e.target.value })}
                  className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-slate-900 focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Department:</label>
                  <select
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-slate-900 focus:outline-none focus:border-emerald-600"
                  >
                    <option value="Operations">Operations</option>
                    <option value="Compliance & Risk">Compliance & Risk</option>
                    <option value="Engineering & Payments">Engineering & Payments</option>
                    <option value="Human Resources & Finance">Human Resources & Finance</option>
                    <option value="Credit & Data Science">Credit & Data Science</option>
                    <option value="Customer Experience">Customer Experience</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Lawful Basis (NDPA Sec 25):</label>
                  <select
                    value={formData.legal_basis}
                    onChange={(e) => setFormData({ ...formData, legal_basis: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-slate-900 focus:outline-none focus:border-emerald-600"
                  >
                    <option value="contract">Performance of Contract</option>
                    <option value="legal_obligation">Legal Obligation</option>
                    <option value="consent">Explicit Consent</option>
                    <option value="vital_interest">Vital Interest</option>
                    <option value="public_interest">Public Interest</option>
                    <option value="legitimate_interest">Legitimate Interest</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Business Purpose:</label>
                <textarea
                  required
                  rows="2"
                  placeholder="Explain why this data is collected and processed..."
                  value={formData.business_purpose}
                  onChange={(e) => setFormData({ ...formData, business_purpose: e.target.value })}
                  className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-slate-900 focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Storage Location:</label>
                  <input
                    type="text"
                    required
                    value={formData.storage_location}
                    onChange={(e) => setFormData({ ...formData, storage_location: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-slate-900 focus:outline-none focus:border-emerald-600"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Retention Period:</label>
                  <input
                    type="text"
                    required
                    value={formData.retention_period}
                    onChange={(e) => setFormData({ ...formData, retention_period: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-slate-900 focus:outline-none focus:border-emerald-600"
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
                  Record Activity
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
