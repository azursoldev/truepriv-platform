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

  // Modals
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

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
    e.preventDefault();
    if (!editingUser) return;

    try {
      const res = await api.updateUser(editingUser.id, {
        name: editingUser.name,
        role: editingUser.role,
        department: editingUser.department,
        phone: editingUser.phone,
        is_active: editingUser.is_active,
      });

      if (res.success) {
        setNotification({ type: 'success', message: res.message });
        setEditingUser(null);
        loadData();
      }
    } catch (err) {
      setNotification({ type: 'error', message: err.message || 'Failed to update user.' });
    }
  };

  const handleToggleStatus = async (user) => {
    try {
      const res = await api.updateUser(user.id, { is_active: !user.is_active });
      if (res.success) {
        setNotification({ 
          type: 'success', 
          message: `User ${user.name} status changed to ${!user.is_active ? 'Active' : 'Suspended'}.` 
        });
        loadData();
      }
    } catch (err) {
      setNotification({ type: 'error', message: err.message });
    }
  };

  const handleDeleteUser = async (id, name) => {
    if (!confirm(`Are you sure you want to remove user "${name}" from this workspace?`)) return;
    try {
      const res = await api.deleteUser(id);
      if (res.success) {
        setNotification({ type: 'success', message: res.message });
        loadData();
      }
    } catch (err) {
      setNotification({ type: 'error', message: err.message });
    }
  };

  const getRoleBadge = (role) => {
    switch (role) {
      case 'super_admin':
        return <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-amber-50 text-amber-900 border border-amber-200 px-2 py-0.5 rounded-full"><i className="fa-solid fa-crown text-amber-600 text-[10px]"></i> Super Admin</span>;
      case 'corporate_admin':
        return <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded-full"><i className="fa-solid fa-building text-emerald-600 text-[10px]"></i> Corporate Admin</span>;
      case 'compliance_officer':
        return <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-sky-50 text-sky-800 border border-sky-200 px-2 py-0.5 rounded-full"><i className="fa-solid fa-shield-halved text-sky-600 text-[10px]"></i> Compliance Officer</span>;
      case 'dept_champion':
        return <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-purple-50 text-purple-800 border border-purple-200 px-2 py-0.5 rounded-full"><i className="fa-solid fa-users text-purple-600 text-[10px]"></i> Dept Champion</span>;
      case 'dpco_lead_auditor':
        return <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-purple-100 text-purple-900 border border-purple-300 px-2 py-0.5 rounded-full"><i className="fa-solid fa-building-columns text-purple-700 text-[10px]"></i> DPCO Lead Auditor</span>;
      case 'dpco_staff':
        return <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-indigo-50 text-indigo-800 border border-indigo-200 px-2 py-0.5 rounded-full"><i className="fa-solid fa-clipboard-check text-indigo-600 text-[10px]"></i> DPCO Staff</span>;
      case 'outsourced_dpo':
        return <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-blue-50 text-blue-800 border border-blue-200 px-2 py-0.5 rounded-full"><i className="fa-solid fa-user-shield text-blue-600 text-[10px]"></i> Outsourced DPO</span>;
      default:
        return <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-200 px-2 py-0.5 rounded-full"><i className="fa-solid fa-eye text-slate-500 text-[10px]"></i> Auditor Viewer</span>;
    }
  };

  const getActionBadge = (action) => {
    if (action.includes('breach')) return <span className="text-[10px] font-mono font-bold bg-red-50 text-red-700 border border-red-200 px-2 py-0.5 rounded">BREACH CLOCK</span>;
    if (action.includes('dpia')) return <span className="text-[10px] font-mono font-bold bg-purple-50 text-purple-700 border border-purple-200 px-2 py-0.5 rounded">DPIA STAMP</span>;
    if (action.includes('ropa')) return <span className="text-[10px] font-mono font-bold bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded">ROPA EVENT</span>;
    if (action.includes('user')) return <span className="text-[10px] font-mono font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded">USER RBAC</span>;
    if (action.includes('dsar')) return <span className="text-[10px] font-mono font-bold bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded">DSAR SLA</span>;
    if (action.includes('cookie')) return <span className="text-[10px] font-mono font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 px-2 py-0.5 rounded">COOKIE CONSENT</span>;
    return <span className="text-[10px] font-mono font-bold bg-slate-100 text-slate-700 border border-slate-200 px-2 py-0.5 rounded">SYSTEM TELEMETRY</span>;
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
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Master Administrator Governance & User Center</h2>
            <span className="text-[11px] bg-amber-50 text-amber-900 border border-amber-200 px-2 py-0.5 rounded font-mono font-bold">
              ADMIN ONLY
            </span>
          </div>
          <p className="text-xs text-slate-600 mt-0.5">
            Full dynamic visibility into portal activities, real-time audit logs, user management, and role permissions.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Tabs Switcher */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs">
            <button
              onClick={() => setActiveTab('directory')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                activeTab === 'directory' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <i className="fa-solid fa-users mr-1.5 text-slate-600"></i> Users
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
                      <tr key={u.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center font-bold text-xs">
                              {u.name.substring(0, 2).toUpperCase()}
                            </div>
                            <div>
                              <div className="font-bold text-slate-900">{u.name}</div>
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

                        <td className="py-3.5 px-4 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => setEditingUser(u)}
                              title="Edit User Role & Details (Admin Only)"
                              className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 border border-slate-200"
                            >
                              <i className="fa-solid fa-pen-to-square text-xs"></i>
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
                              onClick={() => handleDeleteUser(u.id, u.name)}
                              title="Remove User from Organization"
                              className="p-1.5 rounded-lg bg-slate-100 hover:bg-red-50 border border-slate-200 hover:border-red-200 text-slate-500 hover:text-red-700"
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
        </div>
      )}

      {activeTab === 'audit-trail' && (
        /* =========================================================================
           DYNAMIC LIVE SYSTEM ACTIVITY & AUDIT TRAIL STREAM (ADMIN ONLY)
           ========================================================================= */
        <div className="space-y-4">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <i className="fa-solid fa-tower-broadcast text-emerald-600"></i>
                  Live Dynamic System Activity & Audit Stream
                </h3>
                <p className="text-xs text-slate-600 mt-0.5">
                  Chronological telemetry recording every login, RoPA modification, DPIA stamp, DSAR ticket, and breach alert across the portal.
                </p>
              </div>
              <button
                onClick={loadAuditLogs}
                disabled={logsLoading}
                className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-2xs"
              >
                <i className={`fa-solid fa-arrows-rotate text-xs ${logsLoading ? 'animate-spin' : ''}`}></i>
                <span>Refresh Stream</span>
              </button>
            </div>

            <div className="space-y-3 pt-2">
              {logsLoading ? (
                <div className="py-8 text-center text-xs text-slate-500">Updating live stream...</div>
              ) : auditLogs.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-500">No system events recorded yet.</div>
              ) : (
                auditLogs.map((log) => {
                  const actorName = log.user?.name || log.new_values?.actor_name || 'System Actor';
                  const actorRole = log.user?.role || log.new_values?.actor_role || 'system';
                  const summary = log.new_values?.summary || log.action;
                  const timeFormatted = new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
                  const dateFormatted = new Date(log.created_at).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });

                  return (
                    <div key={log.id} className="p-4 bg-slate-50 hover:bg-slate-100/70 border border-slate-200 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 transition-colors">
                      <div className="flex items-start gap-3">
                        <div className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold text-xs flex-shrink-0 mt-0.5">
                          <i className="fa-solid fa-bolt text-emerald-400"></i>
                        </div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-xs text-slate-900">{actorName}</span>
                            {getRoleBadge(actorRole)}
                            {getActionBadge(log.action)}
                          </div>
                          <p className="text-xs text-slate-700 mt-1 font-medium">{summary}</p>
                          <div className="flex items-center gap-3 text-[10px] text-slate-500 font-mono mt-1">
                            <span><i className="fa-solid fa-network-wired text-[9px] mr-1"></i> IP: {log.ip_address || '127.0.0.1'}</span>
                            <span><i className="fa-solid fa-cube text-[9px] mr-1"></i> Entity: {log.entity_type ? log.entity_type.split('\\').pop() : 'System'}</span>
                          </div>
                        </div>
                      </div>

                      <div className="text-right flex-shrink-0 self-end sm:self-center">
                        <div className="text-xs font-mono font-bold text-slate-900">{timeFormatted}</div>
                        <div className="text-[10px] text-slate-500">{dateFormatted}</div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'matrix' && (
        /* =========================================================================
           ROLES & PERMISSIONS MATRIX TAB
           ========================================================================= */
        <div className="space-y-4">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">8 Granular NDPA 2023 System Roles & Permissions Matrix</h3>
              <p className="text-xs text-slate-600 mt-1">
                Roles are pre-configured to adhere to the Nigeria Data Protection Act segregation-of-duties mandate.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {rolesMatrix.map((r) => (
                <div key={r.role} className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="text-[10px] uppercase font-bold text-slate-500">{r.category}</div>
                      <h4 className="text-sm font-bold text-slate-900 mt-0.5">{r.title}</h4>
                      <div className="text-[11px] font-mono text-emerald-800 font-semibold">{r.role}</div>
                    </div>
                    {getRoleBadge(r.role)}
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed">
                    {r.description}
                  </p>

                  <div className="pt-2 border-t border-slate-200/80 grid grid-cols-2 gap-2 text-[11px]">
                    <div className="flex items-center gap-1.5">
                      <i className={`fa-solid ${r.permissions.declare_breaches ? 'fa-circle-check text-emerald-600' : 'fa-circle-xmark text-slate-300'}`}></i>
                      <span className={r.permissions.declare_breaches ? 'text-slate-800 font-medium' : 'text-slate-400'}>72h Breach Triage</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <i className={`fa-solid ${r.permissions.certify_dpco_audits ? 'fa-circle-check text-emerald-600' : 'fa-circle-xmark text-slate-300'}`}></i>
                      <span className={r.permissions.certify_dpco_audits ? 'text-slate-800 font-medium' : 'text-slate-400'}>Certify NDPC Audits</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <i className={`fa-solid ${r.permissions.manage_users_roles ? 'fa-circle-check text-emerald-600' : 'fa-circle-xmark text-slate-300'}`}></i>
                      <span className={r.permissions.manage_users_roles ? 'text-slate-800 font-medium' : 'text-slate-400'}>Manage Users & Roles</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <i className={`fa-solid ${r.permissions.edit_industry_templates ? 'fa-circle-check text-emerald-600' : 'fa-circle-xmark text-slate-300'}`}></i>
                      <span className={r.permissions.edit_industry_templates ? 'text-slate-800 font-medium' : 'text-slate-400'}>Edit Global Templates</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Provision New User Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-lg bg-white border border-slate-200 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2">
                <i className="fa-solid fa-user-plus text-emerald-600"></i>
                <h3 className="text-base font-bold text-slate-900">Provision Organization Team Member</h3>
              </div>
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
                  placeholder="e.g. Babatunde Adeyemi"
                  value={inviteForm.name}
                  onChange={(e) => setInviteForm({ ...inviteForm, name: e.target.value })}
                  className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-slate-900 focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Work Email Address:</label>
                <input
                  type="email"
                  required
                  placeholder="e.g. b.adeyemi@company.ng"
                  value={inviteForm.email}
                  onChange={(e) => setInviteForm({ ...inviteForm, email: e.target.value })}
                  className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-slate-900 focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">NDPA Assigned Role:</label>
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

      {/* Edit User Modal */}
      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-lg bg-white border border-slate-200 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="text-base font-bold text-slate-900">Edit User Role & Permissions (Admin Only)</h3>
              <button onClick={() => setEditingUser(null)} className="text-slate-400 hover:text-slate-700">
                <i className="fa-solid fa-xmark text-base"></i>
              </button>
            </div>

            <form onSubmit={handleUpdateUser} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Full Name:</label>
                <input
                  type="text"
                  required
                  value={editingUser.name}
                  onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })}
                  className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Assigned Role:</label>
                  <select
                    value={editingUser.role}
                    onChange={(e) => setEditingUser({ ...editingUser, role: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-slate-900"
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
                    value={editingUser.department || 'Compliance & Risk'}
                    onChange={(e) => setEditingUser({ ...editingUser, department: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-slate-900"
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

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                <div>
                  <div className="font-bold text-slate-900">Account Active Status</div>
                  <div className="text-slate-500">Allow user to sign in and interact with workspace</div>
                </div>
                <input
                  type="checkbox"
                  checked={editingUser.is_active}
                  onChange={(e) => setEditingUser({ ...editingUser, is_active: e.target.checked })}
                  className="w-5 h-5 accent-emerald-600 rounded cursor-pointer"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-xl text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
