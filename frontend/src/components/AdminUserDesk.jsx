import React, { useState, useEffect } from 'react';
import { api } from '../lib/api';

export default function AdminUserDesk({ currentUser, onRefreshMetrics }) {
  const isAdmin = ['super_admin', 'corporate_admin'].includes(currentUser?.role);

  const [users, setUsers] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [activeTab, setActiveTab] = useState('directory'); // 'directory' | 'matrix' | 'audit-trail'
  const [rolesMatrix, setRolesMatrix] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [logsLoading, setLogsLoading] = useState(false);
  const [notification, setNotification] = useState(null);

  // Modals & User Detail Page State
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [savingUser, setSavingUser] = useState(false);

  // Invite Form State
  const [inviteForm, setInviteForm] = useState({
    name: '',
    email: '',
    role: 'compliance_officer',
    department: 'Compliance & Risk',
    phone: '',
    password: 'Password123!',
  });

  const loadData = async () => {
    if (!isAdmin) return;
    setLoading(true);
    try {
      let query = `?search=${encodeURIComponent(search)}`;
      if (roleFilter) query += `&role=${roleFilter}`;
      if (departmentFilter) query += `&department=${departmentFilter}`;

      const res = await api.getUsers(query);
      if (res.success) {
        setUsers(res.data);
        setSummary(res.summary);
      }

      const mRes = await api.getRolesMatrix();
      if (mRes.success) {
        setRolesMatrix(mRes.data);
      }
    } catch (err) {
      console.error('Error loading users:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadAuditLogs = async () => {
    if (!isAdmin) return;
    setLogsLoading(true);
    try {
      const res = await api.getAdminAuditLogs();
      if (res.success) {
        setAuditLogs(res.data);
      }
    } catch (err) {
      console.error('Error loading audit logs:', err);
    } finally {
      setLogsLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      loadData();
      if (activeTab === 'audit-trail') {
        loadAuditLogs();
      }
    }
  }, [roleFilter, departmentFilter, activeTab]);

  // Security Guard for Non-Admin Users
  if (!isAdmin) {
    return (
      <div className="bg-white border border-slate-200 rounded-3xl p-8 sm:p-12 text-center max-w-2xl mx-auto my-8 shadow-xs">
        <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mx-auto mb-4 text-2xl">
          <i className="fa-solid fa-lock"></i>
        </div>
        <h3 className="text-xl font-bold text-slate-900 tracking-tight">Access Restricted: Administrator Role Required</h3>
        <p className="text-xs text-slate-600 mt-2 leading-relaxed">
          Your account is logged in as <span className="font-bold text-slate-900">{currentUser?.name}</span> with role <span className="font-mono font-bold text-emerald-700">[{currentUser?.role}]</span>.
          User provisioning, deprovisioning, role privilege configuration, and system telemetry are strictly reserved for <strong>Organization Administrators</strong>.
        </p>
        <div className="mt-6 p-4 bg-slate-50 border border-slate-200 rounded-2xl text-left text-xs text-slate-600">
          <div className="font-bold text-slate-800 mb-1 flex items-center gap-1.5">
            <i className="fa-solid fa-shield-halved text-emerald-600"></i> NDPA 2023 Segregation-of-Duties:
          </div>
          Compliance Officers and Department Champions are restricted from modifying tenant access controls to prevent unauthorized privilege escalation.
        </div>
      </div>
    );
  }

  const handleInviteSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.createUser(inviteForm);
      if (res.success) {
        setNotification({ type: 'success', message: res.message });
        setShowInviteModal(false);
        setInviteForm({
          name: '',
          email: '',
          role: 'compliance_officer',
          department: 'Compliance & Risk',
          phone: '',
          password: 'Password123!',
        });
        loadData();
      }
    } catch (err) {
      setNotification({ type: 'error', message: err.message || 'Failed to create user.' });
    }
  };

  const handleUpdateUser = async (e) => {
    if (e) e.preventDefault();
    if (!editingUser) return;
    setSavingUser(true);

    try {
      const res = await api.updateUser(editingUser.id, {
        name: editingUser.name,
        role: editingUser.role,
        department: editingUser.department,
        phone: editingUser.phone,
        is_active: editingUser.is_active,
        password: editingUser.new_password || undefined,
      });

      if (res.success) {
        setNotification({ type: 'success', message: res.message || 'User details updated successfully.' });
        setEditingUser(null);
        loadData();
        if (onRefreshMetrics) onRefreshMetrics();
      }
    } catch (err) {
      setNotification({ type: 'error', message: err.message || 'Failed to update user.' });
    } finally {
      setSavingUser(false);
    }
  };

  const handleToggleStatus = async (user) => {
    try {
      const res = await api.updateUser(user.id, {
        is_active: !user.is_active,
      });
      if (res.success) {
        setNotification({
          type: 'success',
          message: `User ${user.name} is now ${!user.is_active ? 'Active' : 'Suspended'}.`,
        });
        loadData();
      }
    } catch (err) {
      setNotification({ type: 'error', message: err.message || 'Failed to toggle status.' });
    }
  };

  const handleDeleteUser = async (user) => {
    if (!window.confirm(`Are you sure you want to permanently delete user "${user.name}"? This action cannot be undone and is recorded in the NDPA audit trail.`)) {
      return;
    }

    try {
      const res = await api.deleteUser(user.id);
      if (res.success) {
        setNotification({ type: 'success', message: res.message });
        if (editingUser?.id === user.id) {
          setEditingUser(null);
        }
        loadData();
      }
    } catch (err) {
      setNotification({ type: 'error', message: err.message || 'Failed to delete user.' });
    }
  };

  const getRoleBadge = (role) => {
    switch (role) {
      case 'super_admin':
        return (
          <span className="inline-flex items-center gap-1.5 text-[10px] font-bold bg-amber-50 text-amber-900 border border-amber-300 px-2.5 py-0.5 rounded-full">
            <i className="fa-solid fa-crown text-[9px] text-amber-600"></i> Super Admin
          </span>
        );
      case 'corporate_admin':
        return (
          <span className="inline-flex items-center gap-1.5 text-[10px] font-bold bg-emerald-50 text-emerald-900 border border-emerald-300 px-2.5 py-0.5 rounded-full">
            <i className="fa-solid fa-building text-[9px] text-emerald-600"></i> Corporate Admin
          </span>
        );
      case 'compliance_officer':
        return (
          <span className="inline-flex items-center gap-1.5 text-[10px] font-bold bg-blue-50 text-blue-900 border border-blue-300 px-2.5 py-0.5 rounded-full">
            <i className="fa-solid fa-shield-halved text-[9px] text-blue-600"></i> Compliance Officer
          </span>
        );
      case 'dept_champion':
        return (
          <span className="inline-flex items-center gap-1.5 text-[10px] font-bold bg-purple-50 text-purple-900 border border-purple-300 px-2.5 py-0.5 rounded-full">
            <i className="fa-solid fa-users text-[9px] text-purple-600"></i> Dept Champion
          </span>
        );
      case 'dpco_lead_auditor':
        return (
          <span className="inline-flex items-center gap-1.5 text-[10px] font-bold bg-indigo-50 text-indigo-900 border border-indigo-300 px-2.5 py-0.5 rounded-full">
            <i className="fa-solid fa-building-columns text-[9px] text-indigo-600"></i> DPCO Lead Auditor
          </span>
        );
      case 'outsourced_dpo':
        return (
          <span className="inline-flex items-center gap-1.5 text-[10px] font-bold bg-sky-50 text-sky-900 border border-sky-300 px-2.5 py-0.5 rounded-full">
            <i className="fa-solid fa-user-shield text-[9px] text-sky-600"></i> Outsourced DPO
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200 px-2.5 py-0.5 rounded-full">
            <i className="fa-solid fa-eye text-[9px] text-slate-500"></i> Auditor Viewer
          </span>
        );
    }
  };

  const getRolePermissionsList = (role) => {
    switch (role) {
      case 'super_admin':
        return [
          { name: 'Global Multi-Tenant Authority', allowed: true },
          { name: 'Tenant Provisioning & Seat Limits', allowed: true },
          { name: 'System Telemetry & Live Stream', allowed: true },
          { name: 'Master RoPA Industry Templates', allowed: true },
          { name: 'National Incident Intake Desk', allowed: true },
          { name: 'License & Statutory Seal Issuance', allowed: true },
        ];
      case 'corporate_admin':
        return [
          { name: 'Manage Organization Users & Seats', allowed: true },
          { name: 'Execute RoPA Mappings & DPIAs', allowed: true },
          { name: 'Approve 30-Day DSAR Responses', allowed: true },
          { name: '72-Hour Breach Triage & Filing', allowed: true },
          { name: 'Vendor TPRM & Contract Execution', allowed: true },
          { name: 'Invite Department Champions', allowed: true },
        ];
      case 'compliance_officer':
        return [
          { name: 'Execute RoPA Mappings & DPIAs', allowed: true },
          { name: 'Process 30-Day DSAR Requests', allowed: true },
          { name: '72-Hour Breach Triage & Filing', allowed: true },
          { name: 'Vendor TPRM Risk Questionnaires', allowed: true },
          { name: 'Manage Organization Users', allowed: false },
          { name: 'Global Multi-Tenant Authority', allowed: false },
        ];
      case 'outsourced_dpo':
        return [
          { name: 'Multi-Client Portfolio Switching', allowed: true },
          { name: 'DPIA 5x5 Digital Sign-off & Seal', allowed: true },
          { name: 'Cross-Client RoPA Oversight', allowed: true },
          { name: 'Client Breach SLA Monitoring', allowed: true },
          { name: 'Manage Internal Client Staff', allowed: false },
          { name: 'Global Platform Licensing', allowed: false },
        ];
      case 'dpco_lead_auditor':
        return [
          { name: 'GAID 5-Domain Fieldwork Scoring', allowed: true },
          { name: 'Collect & Stamp Audit Evidence', allowed: true },
          { name: 'Issue Certified NDPC Filing Packs', allowed: true },
          { name: 'March 15 Deadline Submissions', allowed: true },
          { name: 'Modify Client RoPA Records', allowed: false },
          { name: 'Delete Client User Accounts', allowed: false },
        ];
      default:
        return [
          { name: 'Read-Only Audit Pack Inspection', allowed: true },
          { name: 'Read-Only RoPA Activity Viewing', allowed: true },
          { name: 'Read-Only DPIA Matrix Viewing', allowed: true },
          { name: 'Modify System Records', allowed: false },
          { name: 'Trigger 72h Breach Clocks', allowed: false },
          { name: 'User Management Privileges', allowed: false },
        ];
    }
  };

  /* =========================================================================
     DEDICATED FULL USER DETAIL & GOVERNANCE PAGE (When editingUser is set)
     ========================================================================= */
  if (editingUser) {
    const permissions = getRolePermissionsList(editingUser.role);

    return (
      <div className="space-y-6 animate-in fade-in">
        
        {/* Top Navigation & Action Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white border border-slate-200 p-4 sm:p-6 rounded-3xl shadow-xs">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setEditingUser(null)}
              className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
            >
              <i className="fa-solid fa-arrow-left text-xs"></i>
              <span>Back to Directory</span>
            </button>
            <div className="h-5 w-px bg-slate-200 hidden sm:block"></div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
                <span>User Governance & Access Detail</span>
                {getRoleBadge(editingUser.role)}
              </h2>
              <p className="text-xs text-slate-500">Configure NDPA permissions, contact details, and security controls.</p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={() => handleToggleStatus(editingUser)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 ${
                editingUser.is_active
                  ? 'bg-amber-50 hover:bg-amber-100 border-amber-200 text-amber-800'
                  : 'bg-emerald-50 hover:bg-emerald-100 border-emerald-200 text-emerald-800'
              }`}
            >
              <i className={`fa-solid ${editingUser.is_active ? 'fa-ban' : 'fa-check'}`}></i>
              <span>{editingUser.is_active ? 'Suspend Account' : 'Activate Account'}</span>
            </button>

            <button
              type="button"
              onClick={() => handleDeleteUser(editingUser)}
              className="px-3.5 py-2 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
            >
              <i className="fa-solid fa-trash-can"></i>
              <span className="hidden md:inline">Delete</span>
            </button>

            <button
              type="button"
              onClick={handleUpdateUser}
              disabled={savingUser}
              className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow-md transition-all flex items-center gap-2 disabled:opacity-50"
            >
              <i className="fa-solid fa-floppy-disk text-xs"></i>
              <span>{savingUser ? 'Saving...' : 'Save All Changes'}</span>
            </button>
          </div>
        </div>

        {/* Hero Identity Overview Card */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-extrabold text-2xl shadow-md flex-shrink-0">
                {editingUser.name ? editingUser.name.substring(0, 2).toUpperCase() : 'US'}
              </div>
              <div>
                <div className="flex items-center gap-2.5">
                  <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                    {editingUser.name}
                  </h1>
                  <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                    editingUser.is_active ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-red-50 text-red-800 border border-red-200'
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${editingUser.is_active ? 'bg-emerald-500' : 'bg-red-500'}`}></span>
                    {editingUser.is_active ? 'Active Account' : 'Suspended Access'}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mt-1">
                  <span><i className="fa-solid fa-envelope text-slate-400 mr-1"></i> {editingUser.email}</span>
                  <span>&bull;</span>
                  <span><i className="fa-solid fa-phone text-slate-400 mr-1"></i> {editingUser.phone || 'No phone recorded'}</span>
                  <span>&bull;</span>
                  <span><i className="fa-solid fa-building text-slate-400 mr-1"></i> {editingUser.department || 'Compliance & Risk'}</span>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 text-xs font-mono bg-slate-50 border border-slate-200 p-3 rounded-2xl">
              <div>
                <div className="text-[10px] text-slate-400 uppercase font-bold">User UUID:</div>
                <div className="text-slate-800 font-semibold truncate max-w-[140px]">{editingUser.id}</div>
              </div>
              <div className="border-l border-slate-200 pl-3">
                <div className="text-[10px] text-slate-400 uppercase font-bold">2FA Security:</div>
                <div className="text-emerald-700 font-bold">NDPA Enforced</div>
              </div>
            </div>
          </div>
        </div>

        {/* Main 2-Column Detail Configuration Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* LEFT COLUMN: Personal Details & Role Governance (7 Columns) */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* 1. Personal & Contact Information Card */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <i className="fa-solid fa-id-card text-emerald-600"></i>
                  <span>Personal & Professional Profile</span>
                </h3>
                <span className="text-[10px] text-slate-400 uppercase font-bold">Editable</span>
              </div>

              <div className="space-y-3.5 text-xs">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Full Legal Name</label>
                  <input
                    type="text"
                    required
                    value={editingUser.name}
                    onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-900 font-semibold focus:outline-none focus:border-emerald-600 focus:bg-white transition-colors"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Official Work Email</label>
                    <input
                      type="email"
                      disabled
                      value={editingUser.email}
                      className="w-full bg-slate-100 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-600 cursor-not-allowed"
                    />
                    <span className="text-[10px] text-slate-400 mt-0.5 block">Primary identity handle</span>
                  </div>

                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Contact Phone Number</label>
                    <input
                      type="text"
                      placeholder="+234 803 114 2290"
                      value={editingUser.phone || ''}
                      onChange={(e) => setEditingUser({ ...editingUser, phone: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-900 focus:outline-none focus:border-emerald-600 focus:bg-white transition-colors"
                    />
                    <span className="text-[10px] text-slate-400 mt-0.5 block">Statutory SMS alerts</span>
                  </div>
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Assigned Department</label>
                  <select
                    value={editingUser.department || 'Compliance & Risk'}
                    onChange={(e) => setEditingUser({ ...editingUser, department: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-900 font-semibold focus:outline-none focus:border-emerald-600 focus:bg-white transition-colors"
                  >
                    <option value="Compliance & Risk">Compliance & Risk</option>
                    <option value="Information Technology">Information Technology (IT / SecOps)</option>
                    <option value="Human Resources">Human Resources (HR / People)</option>
                    <option value="Finance & Accounting">Finance & Accounting</option>
                    <option value="Operations">Operations & Business Lines</option>
                    <option value="Legal">Legal & Regulatory Affairs</option>
                    <option value="Executive Management">Executive Management</option>
                  </select>
                </div>
              </div>
            </div>

            {/* 2. Role & Access Privilege Assignment Card */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <i className="fa-solid fa-shield-halved text-blue-600"></i>
                  <span>Role & Access Privilege Governance</span>
                </h3>
                <span className="text-[10px] text-emerald-700 uppercase font-bold">Admin Authority</span>
              </div>

              <div className="space-y-3.5 text-xs">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Assigned System Role</label>
                  <select
                    value={editingUser.role}
                    onChange={(e) => setEditingUser({ ...editingUser, role: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-900 font-bold focus:outline-none focus:border-emerald-600 focus:bg-white transition-colors"
                  >
                    <option value="corporate_admin">Corporate Admin (Full Org Control)</option>
                    <option value="compliance_officer">Compliance Officer (RoPA, DPIA, DSAR)</option>
                    <option value="dept_champion">Department Champion (Data Inputs)</option>
                    <option value="auditor_viewer">Auditor Viewer (Read-Only Evidence)</option>
                    <option value="dpco_lead_auditor">DPCO Lead Auditor (Statutory Audit)</option>
                    <option value="dpco_staff">DPCO Staff Auditor</option>
                    <option value="outsourced_dpo">Outsourced DPO Practice</option>
                    <option value="super_admin">System Super Administrator</option>
                  </select>
                </div>

                <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                  <div className="font-bold text-slate-900 flex items-center gap-2">
                    <i className="fa-solid fa-circle-info text-blue-600"></i>
                    <span>Role Boundary & Scope:</span>
                  </div>
                  <p className="text-slate-600 leading-relaxed text-[11px]">
                    {editingUser.role === 'corporate_admin' && "Full administrative control over tenant workspace, user provisioning, RoPA mapping, DPIA authorizations, and 72h breach filings."}
                    {editingUser.role === 'compliance_officer' && "Authorizations to create and edit RoPA activities, submit DPIA risk assessments, process DSAR tickets, and handle breach intakes."}
                    {editingUser.role === 'dept_champion' && "Scoped to department processing inputs (HR, IT, Finance). Cannot modify global compliance settings or delete tenant records."}
                    {editingUser.role === 'outsourced_dpo' && "Multi-client advisory authority. Digital sign-off seals on DPIA high-risk flows and client compliance oversight."}
                    {editingUser.role === 'dpco_lead_auditor' && "Accredited DPCO auditor suite: scoring GAID 5-domain checklists, attaching audit evidence, and generating certified NDPC filing packs."}
                    {editingUser.role === 'super_admin' && "Platform-wide master authority: cross-tenant access, tenant provisioning, system telemetry stream, and industry template management."}
                    {editingUser.role === 'auditor_viewer' && "Read-only access to compliance scorecards, audit evidence vault, and statutory filing packs."}
                  </p>
                </div>
              </div>
            </div>

          </div>

          {/* RIGHT COLUMN: Security Controls, Permissions Checklist & Telemetry (5 Columns) */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* 1. Account Security & Password Reset Card */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <i className="fa-solid fa-lock text-purple-600"></i>
                  <span>Security & Account Status</span>
                </h3>
              </div>

              <div className="space-y-3.5 text-xs">
                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between">
                  <div>
                    <div className="font-bold text-slate-900">Account Active State</div>
                    <div className="text-[11px] text-slate-500">Enable or disable workspace access</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={editingUser.is_active}
                    onChange={(e) => setEditingUser({ ...editingUser, is_active: e.target.checked })}
                    className="w-5 h-5 accent-emerald-600 rounded cursor-pointer"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Set Temporary Password (Optional)</label>
                  <input
                    type="password"
                    placeholder="Leave blank to preserve existing password"
                    value={editingUser.new_password || ''}
                    onChange={(e) => setEditingUser({ ...editingUser, new_password: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-900 focus:outline-none focus:border-emerald-600 focus:bg-white transition-colors"
                  />
                  <span className="text-[10px] text-slate-400 mt-0.5 block">Minimum 8 characters</span>
                </div>
              </div>
            </div>

            {/* 2. Effective Role Permissions Checklist */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <i className="fa-solid fa-list-check text-emerald-600"></i>
                  <span>Effective Permissions</span>
                </h3>
                <span className="text-[10px] font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  Real-Time
                </span>
              </div>

              <div className="space-y-2 text-xs">
                {permissions.map((p, idx) => (
                  <div key={idx} className="p-2.5 rounded-xl border border-slate-100 bg-slate-50/60 flex items-center justify-between">
                    <span className="text-slate-800 font-medium">{p.name}</span>
                    {p.allowed ? (
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <i className="fa-solid fa-check text-[9px]"></i> Granted
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold text-slate-400 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <i className="fa-solid fa-xmark text-[9px]"></i> Restricted
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>

      </div>
    );
  }

  /* =========================================================================
     MAIN USER DIRECTORY & RBAC VIEW
     ========================================================================= */
  return (
    <div className="space-y-6">
      
      {/* Toast Notification */}
      {notification && (
        <div className={`p-4 rounded-2xl border text-xs font-semibold flex items-center justify-between shadow-xs animate-in fade-in ${
          notification.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : 'bg-red-50 border-red-200 text-red-900'
        }`}>
          <div className="flex items-center gap-2">
            <i className={`fa-solid ${notification.type === 'success' ? 'fa-circle-check text-emerald-600' : 'fa-circle-exclamation text-red-600'}`}></i>
            <span>{notification.message}</span>
          </div>
          <button onClick={() => setNotification(null)} className="text-slate-400 hover:text-slate-700 font-bold">&times;</button>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-7 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 px-2.5 py-0.5 rounded-full font-mono flex items-center gap-1.5">
              <i className="fa-solid fa-users-gear text-emerald-600 text-[10px]"></i>
              <span>ADMIN USER & ROLE GOVERNANCE</span>
            </span>
            <span className="text-xs text-slate-500 font-medium">NDPA 2023 RBAC System</span>
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            User Access & Permissions Desk
          </h2>
          <p className="text-xs text-slate-600 mt-1 max-w-xl leading-relaxed">
            Provision staff accounts, configure role segregation-of-duties under NDPA Section 24 & 48, and inspect immutable system audit telemetry in real time.
          </p>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="bg-slate-100 p-1 rounded-xl flex items-center text-xs">
            <button
              onClick={() => setActiveTab('directory')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                activeTab === 'directory' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <i className="fa-solid fa-users mr-1.5 text-slate-600"></i> User Directory
            </button>
            <button
              onClick={() => setActiveTab('audit-trail')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                activeTab === 'audit-trail' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <i className="fa-solid fa-tower-broadcast mr-1.5 text-slate-600"></i> Dynamic Live Logs
            </button>
            <button
              onClick={() => setActiveTab('matrix')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                activeTab === 'matrix' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <i className="fa-solid fa-table-cells mr-1.5 text-slate-600"></i> Role Matrix
            </button>
          </div>

          <button
            onClick={() => setShowInviteModal(true)}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all"
          >
            <i className="fa-solid fa-user-plus text-xs"></i>
            <span>Provision User</span>
          </button>
        </div>
      </div>

      {/* 4 User Metric Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-slate-500 font-bold uppercase">Total Provisioned Users</span>
            <i className="fa-solid fa-users text-slate-400"></i>
          </div>
          <div className="text-2xl font-extrabold font-mono text-slate-900 mt-1">
            {summary?.total_users || users.length} <span className="text-xs text-slate-400 font-normal">/ {summary?.seat_capacity || 25} Seats</span>
          </div>
          <div className="text-[11px] text-emerald-700 font-semibold mt-1">
            {summary?.active_users || users.length} Active Accounts
          </div>
        </div>

        <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-slate-500 font-bold uppercase">Workspace Administrators</span>
            <i className="fa-solid fa-building text-emerald-600"></i>
          </div>
          <div className="text-2xl font-extrabold font-mono text-slate-900 mt-1">
            {summary?.admins || 2}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Full Organization Governance</div>
        </div>

        <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-slate-500 font-bold uppercase">Compliance Officers & DPOs</span>
            <i className="fa-solid fa-shield-halved text-sky-600"></i>
          </div>
          <div className="text-2xl font-extrabold font-mono text-slate-900 mt-1">
            {summary?.compliance_officers || 2}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">RoPA, DPIA & DSAR Leads</div>
        </div>

        <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-slate-500 font-bold uppercase">Live Audit Stream</span>
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
          </div>
          <div className="text-2xl font-extrabold font-mono text-slate-900 mt-1">
            {auditLogs.length || 7} Events
          </div>
          <div className="text-[11px] text-emerald-700 font-semibold mt-1">Real-Time Telemetry Active</div>
        </div>
      </div>

      {activeTab === 'directory' && (
        /* =========================================================================
           USER DIRECTORY TAB (ADMIN ONLY)
           ========================================================================= */
        <div className="space-y-4">
          
          {/* Search & Filters */}
          <div className="bg-white border border-slate-200 p-4 rounded-2xl flex flex-wrap items-center justify-between gap-3 shadow-xs">
            <div className="flex items-center gap-2 flex-1 min-w-[240px]">
              <i className="fa-solid fa-magnifying-glass text-slate-400 text-xs"></i>
              <input
                type="text"
                placeholder="Search staff by name or email address..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && loadData()}
                className="bg-transparent border-none text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none w-full"
              />
            </div>

            <div className="flex items-center gap-3">
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="bg-slate-50 border border-slate-200 text-slate-700 text-xs rounded-xl px-3 py-1.5 focus:outline-none"
              >
                <option value="">All Roles</option>
                <option value="corporate_admin">Corporate Admin</option>
                <option value="compliance_officer">Compliance Officer</option>
                <option value="dept_champion">Department Champion</option>
                <option value="auditor_viewer">Auditor Viewer</option>
                <option value="dpco_lead_auditor">DPCO Lead Auditor</option>
                <option value="outsourced_dpo">Outsourced DPO</option>
              </select>

              <select
                value={departmentFilter}
                onChange={(e) => setDepartmentFilter(e.target.value)}
                className="bg-slate-50 border border-slate-200 text-slate-700 text-xs rounded-xl px-3 py-1.5 focus:outline-none"
              >
                <option value="">All Departments</option>
                <option value="Compliance & Risk">Compliance & Risk</option>
                <option value="Information Technology">Information Technology</option>
                <option value="Human Resources">Human Resources</option>
                <option value="Finance & Accounting">Finance & Accounting</option>
                <option value="Operations">Operations</option>
                <option value="Legal">Legal</option>
              </select>
            </div>
          </div>

          {/* User Table */}
          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase tracking-wider font-bold">
                  <tr>
                    <th className="py-3 px-4">User Name & Email</th>
                    <th className="py-3 px-4">Assigned Role</th>
                    <th className="py-3 px-4">Department</th>
                    <th className="py-3 px-4">Phone Number</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Admin Controls</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {loading ? (
                    <tr>
                      <td colSpan="6" className="py-8 text-center text-slate-500 font-medium">Loading user directory...</td>
                    </tr>
                  ) : users.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="py-12 text-center text-slate-500">
                        <i className="fa-solid fa-users-slash text-2xl text-slate-300 mb-2"></i>
                        <p className="font-bold text-slate-800">No users found</p>
                      </td>
                    </tr>
                  ) : (
                    users.map((u) => (
                      <tr 
                        key={u.id} 
                        className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                        onClick={() => setEditingUser(u)}
                      >
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center font-bold text-xs flex-shrink-0">
                              {u.name.substring(0, 2).toUpperCase()}
                            </div>
                            <div>
                              <div className="font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">{u.name}</div>
                              <div className="text-[11px] text-slate-500">{u.email}</div>
                            </div>
                          </div>
                        </td>

                        <td className="py-3.5 px-4 whitespace-nowrap">
                          {getRoleBadge(u.role)}
                        </td>

                        <td className="py-3.5 px-4 text-slate-700 font-medium whitespace-nowrap">
                          {u.department || 'Compliance'}
                        </td>

                        <td className="py-3.5 px-4 text-slate-600 font-mono text-[11px]">
                          {u.phone || '—'}
                        </td>

                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            u.is_active ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-red-50 text-red-800 border border-red-200'
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${u.is_active ? 'bg-emerald-500' : 'bg-red-500'}`}></span>
                            {u.is_active ? 'Active' : 'Suspended'}
                          </span>
                        </td>

                        <td className="py-3.5 px-4 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => setEditingUser(u)}
                              title="Open User Detail & Governance Page (Admin Only)"
                              className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 border border-slate-200 font-bold text-[11px] flex items-center gap-1"
                            >
                              <i className="fa-solid fa-pen-to-square text-xs text-emerald-600"></i>
                              <span>Detail</span>
                            </button>

                            <button
                              onClick={() => handleToggleStatus(u)}
                              title={u.is_active ? "Suspend User Access" : "Activate User Access"}
                              className={`p-1.5 rounded-lg border text-xs ${
                                u.is_active 
                                  ? 'bg-amber-50 hover:bg-amber-100 border-amber-200 text-amber-700' 
                                  : 'bg-emerald-50 hover:bg-emerald-100 border-emerald-200 text-emerald-700'
                              }`}
                            >
                              <i className={`fa-solid ${u.is_active ? 'fa-ban' : 'fa-check'}`}></i>
                            </button>

                            <button
                              onClick={() => handleDeleteUser(u)}
                              title="Permanently Delete User Account"
                              className="p-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 text-xs"
                            >
                              <i className="fa-solid fa-trash-can"></i>
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
        </div>
      )}

      {activeTab === 'audit-trail' && (
        /* =========================================================================
           DYNAMIC LIVE SYSTEM AUDIT TRAIL TAB (ADMIN ONLY)
           ========================================================================= */
        <div className="space-y-4">
          <div className="bg-white border border-slate-200 p-4 rounded-2xl flex items-center justify-between shadow-xs">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <i className="fa-solid fa-tower-broadcast text-emerald-600"></i>
                <span>Live Telemetry & Audit Stream</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">Chronological immutable audit records of all user and compliance activities.</p>
            </div>
            <button
              onClick={loadAuditLogs}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5"
            >
              <i className="fa-solid fa-arrows-rotate text-xs"></i>
              <span>Refresh Logs</span>
            </button>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
            <div className="divide-y divide-slate-100">
              {logsLoading ? (
                <div className="p-8 text-center text-slate-500 text-xs">Loading live telemetry stream...</div>
              ) : auditLogs.length === 0 ? (
                <div className="p-8 text-center text-slate-500 text-xs">No audit logs recorded yet.</div>
              ) : (
                auditLogs.map((log) => (
                  <div key={log.id} className="p-4 hover:bg-slate-50/70 transition-colors flex items-start justify-between gap-4 text-xs">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-xl bg-slate-100 border border-slate-200 text-slate-700 flex items-center justify-center font-bold text-xs flex-shrink-0 mt-0.5">
                        <i className={`fa-solid ${
                          log.action.includes('user') ? 'fa-user-shield text-emerald-600' :
                          log.action.includes('ropa') ? 'fa-file-shield text-blue-600' :
                          log.action.includes('dpia') ? 'fa-shield-halved text-purple-600' :
                          log.action.includes('breach') ? 'fa-triangle-exclamation text-amber-600' :
                          'fa-clipboard-check text-slate-600'
                        }`}></i>
                      </div>
                      <div>
                        <div className="font-bold text-slate-900 flex items-center gap-2">
                          <span>{log.action}</span>
                          <span className="text-[10px] font-mono text-slate-400">ID: {log.id.substring(0, 8)}</span>
                        </div>
                        <div className="text-slate-600 text-[11px] mt-0.5">
                          Triggered by: <strong>{log.user_name}</strong> ({log.user_email}) &bull; IP: <span className="font-mono">{log.ip_address}</span>
                        </div>
                        {log.new_values && Object.keys(log.new_values).length > 0 && (
                          <div className="mt-1.5 p-2 bg-slate-50 rounded-lg font-mono text-[10px] text-slate-700 border border-slate-200">
                            {JSON.stringify(log.new_values)}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="text-[10px] font-mono text-slate-400 whitespace-nowrap flex-shrink-0">
                      {new Date(log.created_at).toLocaleTimeString()}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'matrix' && (
        /* =========================================================================
           8-ROLE PERMISSIONS MATRIX TAB (ADMIN ONLY)
           ========================================================================= */
        <div className="space-y-4">
          <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <i className="fa-solid fa-table-cells text-emerald-600"></i>
              <span>NDPA 2023 Statutory Role-Based Access Matrix (8 Personas)</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Granular permission allocation enforcing strict separation of duties across controllers, DPOs, and DPCO auditors.
            </p>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase tracking-wider font-bold">
                  <tr>
                    <th className="py-3 px-4">Role Persona</th>
                    <th className="py-3 px-4">Description</th>
                    <th className="py-3 px-4">Assigned Active Users</th>
                    <th className="py-3 px-4">NDPA Statutory Scope</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {rolesMatrix.map((r) => (
                    <tr key={r.role} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-slate-900 whitespace-nowrap">
                        {getRoleBadge(r.role)}
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 leading-relaxed max-w-sm">
                        {r.description}
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold text-emerald-700 whitespace-nowrap">
                        {r.active_user_count} Users
                      </td>
                      <td className="py-3.5 px-4 text-[11px] text-slate-500">
                        {r.role.includes('admin') ? 'Full System Governance & Provisioning' :
                         r.role.includes('dpo') ? 'Advisory, RoPA Review & DPIA Digital Seal' :
                         r.role.includes('dpco') ? 'Accredited Statutory GAID Audit Filing' :
                         'Department Champion Operations'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Provision User Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-lg bg-white border border-slate-200 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <i className="fa-solid fa-user-plus text-emerald-600"></i>
                <span>Provision New User Account</span>
              </h3>
              <button onClick={() => setShowInviteModal(false)} className="text-slate-400 hover:text-slate-700">
                <i className="fa-solid fa-xmark text-base"></i>
              </button>
            </div>

            <form onSubmit={handleInviteSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Full Legal Name:</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Babatunde Lawal"
                  value={inviteForm.name}
                  onChange={(e) => setInviteForm({ ...inviteForm, name: e.target.value })}
                  className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-slate-900 focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Official Work Email:</label>
                <input
                  type="email"
                  required
                  placeholder="b.lawal@organization.ng"
                  value={inviteForm.email}
                  onChange={(e) => setInviteForm({ ...inviteForm, email: e.target.value })}
                  className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-slate-900 focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Assigned Role:</label>
                  <select
                    value={inviteForm.role}
                    onChange={(e) => setInviteForm({ ...inviteForm, role: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-slate-900 focus:outline-none focus:border-emerald-600"
                  >
                    <option value="corporate_admin">Corporate Admin</option>
                    <option value="compliance_officer">Compliance Officer</option>
                    <option value="dept_champion">Department Champion</option>
                    <option value="auditor_viewer">Auditor Viewer</option>
                    <option value="dpco_lead_auditor">DPCO Lead Auditor</option>
                    <option value="dpco_staff">DPCO Staff</option>
                    <option value="outsourced_dpo">Outsourced DPO</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Department:</label>
                  <select
                    value={inviteForm.department}
                    onChange={(e) => setInviteForm({ ...inviteForm, department: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-slate-900 focus:outline-none focus:border-emerald-600"
                  >
                    <option value="Compliance & Risk">Compliance & Risk</option>
                    <option value="Information Technology">Information Technology</option>
                    <option value="Human Resources">Human Resources</option>
                    <option value="Finance & Accounting">Finance & Accounting</option>
                    <option value="Operations">Operations</option>
                    <option value="Legal">Legal</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Phone Number:</label>
                  <input
                    type="text"
                    placeholder="+234 803 114 2290"
                    value={inviteForm.phone}
                    onChange={(e) => setInviteForm({ ...inviteForm, phone: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-slate-900 focus:outline-none focus:border-emerald-600"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Temporary Password:</label>
                  <input
                    type="text"
                    required
                    value={inviteForm.password}
                    onChange={(e) => setInviteForm({ ...inviteForm, password: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-slate-900 focus:outline-none focus:border-emerald-600"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowInviteModal(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-xl text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow-xs"
                >
                  Provision User Access
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
