import React from 'react';

export default function ExecutiveDashboard({
  metrics,
  userRole,
  tenantType,
  onNavigate,
}) {
  const isSuperAdmin = userRole === 'super_admin';
  const isDpo = userRole === 'outsourced_dpo' || tenantType === 'outsourced_dpo';
  const isDpco = ['dpco_lead_auditor', 'dpco_staff'].includes(userRole) || tenantType === 'dpco_firm';

  /* =========================================================================
     1. SUPER ADMIN — Global Platform Hub (M1-M3)
     ========================================================================= */
  if (isSuperAdmin) {
    return (
      <div className="space-y-6 animate-in fade-in">

        {/* Header */}
        <div className="bg-slate-900 text-white p-6 sm:p-8 rounded-3xl shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2.5 py-0.5 rounded-full uppercase tracking-wider inline-flex items-center gap-1.5">
                <i className="fa-solid fa-crown text-amber-300 text-[10px]"></i>
                <span>GLOBAL AUTHORITY CONTROL HUB</span>
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">DPODPCO Platform Authority</h2>
            <p className="text-xs text-slate-300 max-w-xl leading-relaxed">
              Global oversight across all registered corporate organizations, licensed DPCO firms, and outsourced DPO practices.
            </p>
          </div>
          <button
            onClick={() => onNavigate('admin-users')}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-2"
          >
            <i className="fa-solid fa-users-gear text-xs"></i>
            <span>User & Tenant Governance</span>
          </button>
        </div>

        {/* M1: Platform Foundation KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-xs">
            <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase">
              <span>Total Tenants</span>
              <i className="fa-solid fa-building text-slate-400"></i>
            </div>
            <div className="text-2xl font-extrabold font-mono text-slate-900 mt-2">
              {metrics?.summary?.total_tenants ?? 4}
            </div>
            <div className="text-[11px] text-emerald-700 font-semibold mt-1">Multi-Tenant Isolation Active</div>
          </div>

          <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-xs">
            <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase">
              <span>Provisioned Users</span>
              <i className="fa-solid fa-users text-emerald-600"></i>
            </div>
            <div className="text-2xl font-extrabold font-mono text-slate-900 mt-2">
              {metrics?.summary?.total_users ?? 0}
            </div>
            <div className="text-[11px] text-slate-500 mt-1">RBAC Roles Enforced</div>
          </div>

          <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-xs">
            <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase">
              <span>Active Guest Links</span>
              <i className="fa-solid fa-link text-purple-600"></i>
            </div>
            <div className="text-2xl font-extrabold font-mono text-slate-900 mt-2">
              {metrics?.summary?.active_invitations ?? 0}
            </div>
            <div className="text-[11px] text-purple-700 font-semibold mt-1">30-Day Expiry Enforced</div>
          </div>

          <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-xs">
            <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase">
              <span>Audit Events</span>
              <i className="fa-solid fa-shield-halved text-sky-600"></i>
            </div>
            <div className="text-2xl font-extrabold font-mono text-slate-900 mt-2">
              {metrics?.summary?.total_audit_events ?? 0}
            </div>
            <div className="text-[11px] text-sky-700 font-semibold mt-1">Audit Logging Active</div>
          </div>
        </div>

        {/* M2: Portal Types */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs">
          <h3 className="text-base font-bold text-slate-900 mb-4">Registered Portal Types</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl">
              <i className="fa-solid fa-building text-emerald-600 text-lg mb-2"></i>
              <div className="text-xs font-bold text-slate-900">Corporate Controller Portal</div>
              <div className="text-[11px] text-slate-500 mt-1">In-house data controller operations</div>
            </div>
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-2xl">
              <i className="fa-solid fa-user-shield text-blue-600 text-lg mb-2"></i>
              <div className="text-xs font-bold text-slate-900">Outsourced DPO Portal</div>
              <div className="text-[11px] text-slate-500 mt-1">Multi-client DPO advisory desk</div>
            </div>
            <div className="p-4 bg-purple-50 border border-purple-200 rounded-2xl">
              <i className="fa-solid fa-building-columns text-purple-600 text-lg mb-2"></i>
              <div className="text-xs font-bold text-slate-900">DPCO Firm Portal</div>
              <div className="text-[11px] text-slate-500 mt-1">Licensed statutory audit suite</div>
            </div>
          </div>
        </div>

        {/* M3: Security Controls */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs">
          <h3 className="text-base font-bold text-slate-900 mb-4">Platform Security & Multi-Tenancy Controls</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              { label: 'Tenant Isolation', icon: 'fa-layer-group', color: 'emerald', desc: 'TenantScope enforced on all queries' },
              { label: 'Laravel Authorization', icon: 'fa-lock', color: 'blue', desc: 'Policy-based RBAC active' },
              { label: 'Guest Invitations', icon: 'fa-users', color: 'purple', desc: 'Tokenized 30-day links' },
              { label: 'Audit Logging', icon: 'fa-clipboard-list', color: 'sky', desc: 'All events captured' },
            ].map((item) => (
              <div key={item.label} className={`p-4 bg-${item.color}-50 border border-${item.color}-200 rounded-2xl`}>
                <i className={`fa-solid ${item.icon} text-${item.color}-600 text-base mb-2`}></i>
                <div className="text-xs font-bold text-slate-900">{item.label}</div>
                <div className="text-[11px] text-slate-500 mt-0.5">{item.desc}</div>
                <div className={`mt-2 text-[10px] font-bold text-${item.color}-700 flex items-center gap-1`}>
                  <i className="fa-solid fa-circle-check"></i> Active
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    );
  }

  /* =========================================================================
     2. OUTSOURCED DPO — M1-M3 Dashboard
     ========================================================================= */
  if (isDpo) {
    return (
      <div className="space-y-6 animate-in fade-in">
        <div className="bg-gradient-to-r from-blue-900 to-slate-900 text-white p-6 sm:p-8 rounded-3xl shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <span className="text-[10px] font-mono font-bold bg-blue-400/20 text-blue-300 border border-blue-400/30 px-2.5 py-0.5 rounded-full uppercase tracking-wider inline-flex items-center gap-1.5">
              <i className="fa-solid fa-user-shield text-blue-300 text-[10px]"></i>
              OUTSOURCED DPO PRACTICE CONSOLE
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">DPO Advisory Portal</h2>
            <p className="text-xs text-slate-300 max-w-xl leading-relaxed">
              Multi-tenant DPO advisory desk. Manage users, roles, and guest champions across your retained clients.
            </p>
          </div>
          <button
            onClick={() => onNavigate('admin-users')}
            className="px-5 py-3 bg-blue-500 hover:bg-blue-400 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-2"
          >
            <i className="fa-solid fa-users-gear text-xs"></i>
            <span>Team & Role Governance</span>
          </button>
        </div>

        {/* M1-M3 KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-xs">
            <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase">
              <span>Team Members</span>
              <i className="fa-solid fa-users text-blue-600"></i>
            </div>
            <div className="text-2xl font-extrabold font-mono text-slate-900 mt-2">
              {metrics?.summary?.total_users ?? 0}
            </div>
            <div className="text-[11px] text-emerald-700 font-semibold mt-1">RBAC Roles Assigned</div>
          </div>

          <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-xs">
            <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase">
              <span>Active Guest Links</span>
              <i className="fa-solid fa-link text-purple-600"></i>
            </div>
            <div className="text-2xl font-extrabold font-mono text-slate-900 mt-2">
              {metrics?.summary?.active_invitations ?? 0}
            </div>
            <div className="text-[11px] text-purple-700 font-semibold mt-1">30-Day Expiry Window</div>
          </div>

          <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-xs">
            <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase">
              <span>Audit Events</span>
              <i className="fa-solid fa-clipboard-list text-sky-600"></i>
            </div>
            <div className="text-2xl font-extrabold font-mono text-slate-900 mt-2">
              {metrics?.summary?.total_audit_events ?? 0}
            </div>
            <div className="text-[11px] text-sky-700 font-semibold mt-1">Security Audit Logging</div>
          </div>
        </div>

        {/* M3 Security Status */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs">
          <h3 className="text-base font-bold text-slate-900 mb-4">Security & Data Boundary Controls</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: 'Tenant Isolation', icon: 'fa-layer-group', status: 'Active' },
              { label: 'Authorization', icon: 'fa-lock', status: 'Enforced' },
              { label: 'Guest Invitations', icon: 'fa-users', status: 'Ready' },
              { label: 'Audit Logging', icon: 'fa-clipboard-list', status: 'Live' },
            ].map((item) => (
              <div key={item.label} className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-center">
                <i className={`fa-solid ${item.icon} text-emerald-600 text-lg mb-2`}></i>
                <div className="text-xs font-bold text-slate-900">{item.label}</div>
                <div className="text-[10px] font-bold text-emerald-700 mt-1 flex items-center justify-center gap-1">
                  <i className="fa-solid fa-circle-check"></i> {item.status}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  /* =========================================================================
     3. LICENSED DPCO — M1-M3 Dashboard
     ========================================================================= */
  if (isDpco) {
    return (
      <div className="space-y-6 animate-in fade-in">
        <div className="bg-gradient-to-r from-purple-950 to-slate-900 text-white p-6 sm:p-8 rounded-3xl shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <span className="text-[10px] font-mono font-bold bg-purple-400/20 text-purple-300 border border-purple-400/30 px-2.5 py-0.5 rounded-full uppercase tracking-wider inline-flex items-center gap-1.5">
              <i className="fa-solid fa-building-columns text-purple-300 text-[10px]"></i>
              LICENSED DPCO SUITE
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">DPCO Audit Portal</h2>
            <p className="text-xs text-slate-300 max-w-xl leading-relaxed">
              Statutory audit practice desk. Manage team roles, guest champion invitations, and platform security.
            </p>
          </div>
          <button
            onClick={() => onNavigate('admin-users')}
            className="px-5 py-3 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-2"
          >
            <i className="fa-solid fa-users-gear text-xs"></i>
            <span>Team & Role Governance</span>
          </button>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-xs">
            <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase">
              <span>Team Members</span>
              <i className="fa-solid fa-users text-purple-600"></i>
            </div>
            <div className="text-2xl font-extrabold font-mono text-slate-900 mt-2">
              {metrics?.summary?.total_users ?? 0}
            </div>
            <div className="text-[11px] text-emerald-700 font-semibold mt-1">Roles Enforced</div>
          </div>

          <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-xs">
            <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase">
              <span>Active Guest Links</span>
              <i className="fa-solid fa-link text-purple-600"></i>
            </div>
            <div className="text-2xl font-extrabold font-mono text-slate-900 mt-2">
              {metrics?.summary?.active_invitations ?? 0}
            </div>
            <div className="text-[11px] text-purple-700 font-semibold mt-1">30-Day Expiry Window</div>
          </div>

          <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-xs">
            <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase">
              <span>Audit Events</span>
              <i className="fa-solid fa-clipboard-list text-sky-600"></i>
            </div>
            <div className="text-2xl font-extrabold font-mono text-slate-900 mt-2">
              {metrics?.summary?.total_audit_events ?? 0}
            </div>
            <div className="text-[11px] text-sky-700 font-semibold mt-1">Security Audit Logging</div>
          </div>
        </div>

        {/* M3 Security */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs">
          <h3 className="text-base font-bold text-slate-900 mb-4">Security & Data Boundary Controls</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: 'Tenant Isolation', icon: 'fa-layer-group' },
              { label: 'Authorization', icon: 'fa-lock' },
              { label: 'Guest Invitations', icon: 'fa-users' },
              { label: 'Audit Logging', icon: 'fa-clipboard-list' },
            ].map((item) => (
              <div key={item.label} className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-center">
                <i className={`fa-solid ${item.icon} text-emerald-600 text-lg mb-2`}></i>
                <div className="text-xs font-bold text-slate-900">{item.label}</div>
                <div className="text-[10px] font-bold text-emerald-700 mt-1 flex items-center justify-center gap-1">
                  <i className="fa-solid fa-circle-check"></i> Active
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  /* =========================================================================
     4. CORPORATE CONTROLLER — M1-M3 Dashboard
     ========================================================================= */
  return (
    <div className="space-y-6 animate-in fade-in">

      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 to-emerald-900 text-white p-6 sm:p-8 rounded-3xl shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2">
          <span className="text-[10px] font-mono font-bold bg-emerald-400/20 text-emerald-300 border border-emerald-400/30 px-2.5 py-0.5 rounded-full uppercase tracking-wider inline-flex items-center gap-1.5">
            <i className="fa-solid fa-building text-emerald-300 text-[10px]"></i>
            CORPORATE CONTROLLER PORTAL
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Executive Overview</h2>
          <p className="text-xs text-slate-300 max-w-xl leading-relaxed">
            Manage your organization's users, roles, guest champions, and platform security controls.
          </p>
        </div>
        {userRole === 'corporate_admin' && (
          <button
            onClick={() => onNavigate('admin-users')}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-2"
          >
            <i className="fa-solid fa-users-gear text-xs"></i>
            <span>Team & Role Governance</span>
          </button>
        )}
      </div>

      {/* M1-M3 KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

        {/* Users */}
        <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase">
            <span>Team Members</span>
            <i className="fa-solid fa-users text-emerald-600"></i>
          </div>
          <div className="text-2xl font-extrabold font-mono text-slate-900 mt-2">
            {metrics?.summary?.total_users ?? 0}
          </div>
          <div className="text-[11px] text-emerald-700 font-semibold mt-1">Provisioned Accounts</div>
        </div>

        {/* Active Invitations */}
        <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase">
            <span>Active Guest Links</span>
            <i className="fa-solid fa-link text-purple-600"></i>
          </div>
          <div className="text-2xl font-extrabold font-mono text-slate-900 mt-2">
            {metrics?.summary?.active_invitations ?? 0}
          </div>
          <div className="text-[11px] text-purple-700 font-semibold mt-1">30-Day Expiry Window</div>
        </div>

        {/* Audit Events */}
        <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase">
            <span>Audit Events</span>
            <i className="fa-solid fa-clipboard-list text-sky-600"></i>
          </div>
          <div className="text-2xl font-extrabold font-mono text-slate-900 mt-2">
            {metrics?.summary?.total_audit_events ?? 0}
          </div>
          <div className="text-[11px] text-sky-700 font-semibold mt-1">All Actions Logged</div>
        </div>

        {/* Tenant */}
        <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase">
            <span>Tenant Status</span>
            <i className="fa-solid fa-shield-halved text-emerald-600"></i>
          </div>
          <div className="text-2xl font-extrabold font-mono text-slate-900 mt-2">Isolated</div>
          <div className="text-[11px] text-emerald-700 font-semibold mt-1">Tenant Scope Active</div>
        </div>

      </div>

      {/* Security Controls Status */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs">
        <h3 className="text-base font-bold text-slate-900 mb-1">Security & Data Boundary Controls</h3>
        <p className="text-xs text-slate-500 mb-4">Enterprise-grade tenant isolation, RBAC policies, and audit logging active.</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { label: 'Tenant Isolation', icon: 'fa-layer-group', desc: 'Data scoped per tenant' },
            { label: 'Laravel Authorization', icon: 'fa-lock', desc: 'Policy-based RBAC active' },
            { label: 'Guest Invitations', icon: 'fa-users', desc: '30-day tokenized links' },
            { label: 'Audit Logging', icon: 'fa-clipboard-list', desc: 'All events captured' },
          ].map((item) => (
            <div key={item.label} className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl">
              <i className={`fa-solid ${item.icon} text-emerald-600 text-lg mb-2`}></i>
              <div className="text-xs font-bold text-slate-900">{item.label}</div>
              <div className="text-[11px] text-slate-500 mt-0.5">{item.desc}</div>
              <div className="mt-2 text-[10px] font-bold text-emerald-700 flex items-center gap-1">
                <i className="fa-solid fa-circle-check"></i> Verified ✅
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Portal & Role Info */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs">
        <h3 className="text-base font-bold text-slate-900 mb-4">Authentication & Role Privilege Governance</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl">
            <i className="fa-solid fa-right-to-bracket text-slate-600 text-lg mb-2"></i>
            <div className="text-xs font-bold text-slate-900">Registration & Login</div>
            <div className="text-[11px] text-slate-500 mt-0.5">Secure token-based auth</div>
            <div className="mt-2 text-[10px] font-bold text-emerald-700 flex items-center gap-1">
              <i className="fa-solid fa-circle-check"></i> Active
            </div>
          </div>
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl">
            <i className="fa-solid fa-id-card text-slate-600 text-lg mb-2"></i>
            <div className="text-xs font-bold text-slate-900">Profile Types & Roles</div>
            <div className="text-[11px] text-slate-500 mt-0.5">Admin, Officer, Champion</div>
            <div className="mt-2 text-[10px] font-bold text-emerald-700 flex items-center gap-1">
              <i className="fa-solid fa-circle-check"></i> Configured
            </div>
          </div>
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl">
            <i className="fa-solid fa-gauge-high text-slate-600 text-lg mb-2"></i>
            <div className="text-xs font-bold text-slate-900">Dashboard Structures</div>
            <div className="text-[11px] text-slate-500 mt-0.5">Per-role dashboard views</div>
            <div className="mt-2 text-[10px] font-bold text-emerald-700 flex items-center gap-1">
              <i className="fa-solid fa-circle-check"></i> Deployed
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
