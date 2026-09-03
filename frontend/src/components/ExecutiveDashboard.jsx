import React from 'react';

export default function ExecutiveDashboard({ 
  metrics, 
  userRole, 
  tenantType, 
  onNavigate, 
  onAutoFillRopa, 
  onOpenOnboarding 
}) {
  const isSuperAdmin = userRole === 'super_admin';
  const isDpo = userRole === 'outsourced_dpo' || tenantType === 'outsourced_dpo';
  const isDpco = ['dpco_lead_auditor', 'dpco_staff'].includes(userRole) || tenantType === 'dpco_firm';

  const score = metrics?.compliance_gauge?.score || 78.5;
  const circumference = 2 * Math.PI * 46;
  const strokeDashoffset = circumference - (score / 100) * circumference;
  const scoreColor = score >= 80 ? '#059669' : score >= 50 ? '#d97706' : '#dc2626';

  /* =========================================================================
     1. 👑 SUPER ADMIN GLOBAL GOVERNANCE DASHBOARD
     ========================================================================= */
  if (isSuperAdmin) {
    return (
      <div className="space-y-6 animate-in fade-in">
        {/* Top Super Admin Header */}
        <div className="bg-slate-900 text-white p-6 sm:p-8 rounded-3xl shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                👑 GLOBAL AUTHORITY CONTROL HUB
              </span>
              <span className="text-xs text-slate-400">Master Governance Console</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">DPODPCO Platform Authority</h2>
            <p className="text-xs text-slate-300 max-w-xl leading-relaxed">
              Global oversight across all registered corporate organizations, licensed DPCO firms, outsourced DPO practices, and national statutory compliance metrics.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => onNavigate('admin-users')}
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-2"
            >
              <i className="fa-solid fa-users-gear text-xs"></i>
              <span>User & Tenant Governance</span>
            </button>
            <button
              onClick={() => onNavigate('portfolio')}
              className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold transition-all border border-white/10 flex items-center gap-2"
            >
              <i className="fa-solid fa-building-columns text-xs"></i>
              <span>All Tenant Workspaces</span>
            </button>
          </div>
        </div>

        {/* Global Platform KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-xs">
            <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase">
              <span>Total Tenants</span>
              <i className="fa-solid fa-building text-slate-400"></i>
            </div>
            <div className="text-2xl font-extrabold font-mono text-slate-900 mt-2">4 Active</div>
            <div className="text-[11px] text-emerald-700 font-semibold mt-1">Multi-Tenant Isolation Active</div>
          </div>

          <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-xs">
            <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase">
              <span>Provisioned Users</span>
              <i className="fa-solid fa-users text-emerald-600"></i>
            </div>
            <div className="text-2xl font-extrabold font-mono text-slate-900 mt-2">12 Accounts</div>
            <div className="text-[11px] text-slate-500 mt-1">8 Granular Roles Assigned</div>
          </div>

          <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-xs">
            <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase">
              <span>National Readiness Avg</span>
              <i className="fa-solid fa-gauge-high text-sky-600"></i>
            </div>
            <div className="text-2xl font-extrabold font-mono text-slate-900 mt-2">81.2%</div>
            <div className="text-[11px] text-emerald-700 font-semibold mt-1">High Compliance Tier</div>
          </div>

          <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-xs">
            <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase">
              <span>Data Sovereignty</span>
              <i className="fa-solid fa-server text-purple-600"></i>
            </div>
            <div className="text-2xl font-extrabold font-mono text-slate-900 mt-2">Galaxy Tier-III</div>
            <div className="text-[11px] text-slate-500 mt-1">Abuja Sovereign DC</div>
          </div>
        </div>

        {/* Global Action Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="p-6 bg-white border border-slate-200 rounded-3xl shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900">Tenant Organizations Directory</h3>
              <button onClick={() => onNavigate('portfolio')} className="text-xs font-bold text-emerald-700 hover:underline">
                View All &rarr;
              </button>
            </div>
            <div className="space-y-2.5">
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between">
                <div>
                  <div className="font-bold text-xs text-slate-900">Apex Microfinance Bank Ltd</div>
                  <div className="text-[11px] text-slate-500">Corporate Controller &bull; Fintech &bull; Lagos</div>
                </div>
                <span className="text-[11px] font-mono font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded">78.5% Score</span>
              </div>
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between">
                <div>
                  <div className="font-bold text-xs text-slate-900">Fortress Data Protection Advisory</div>
                  <div className="text-[11px] text-slate-500">Outsourced DPO Practice &bull; 4 Retained Clients</div>
                </div>
                <span className="text-[11px] font-mono font-bold bg-blue-50 text-blue-800 border border-blue-200 px-2 py-0.5 rounded">DPO Console</span>
              </div>
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between">
                <div>
                  <div className="font-bold text-xs text-slate-900">Vanguard Compliance Partners</div>
                  <div className="text-[11px] text-slate-500">Licensed DPCO Firm &bull; NDPC License #DPCO-2026-0042</div>
                </div>
                <span className="text-[11px] font-mono font-bold bg-purple-50 text-purple-800 border border-purple-200 px-2 py-0.5 rounded">Licensed DPCO</span>
              </div>
            </div>
          </div>

          <div className="p-6 bg-white border border-slate-200 rounded-3xl shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900">Global System Actions</h3>
              <span className="text-xs text-emerald-700 font-bold">Admin Privileged</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <button onClick={() => onNavigate('admin-users')} className="p-4 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-2xl text-left transition-all">
                <i className="fa-solid fa-user-shield text-emerald-600 text-lg mb-2"></i>
                <div className="text-xs font-bold text-slate-900">Master User RBAC</div>
                <div className="text-[10px] text-slate-500 mt-0.5">Provision & assign roles</div>
              </button>
              <button onClick={() => onNavigate('ropa')} className="p-4 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-2xl text-left transition-all">
                <i className="fa-solid fa-file-shield text-blue-600 text-lg mb-2"></i>
                <div className="text-xs font-bold text-slate-900">RoPA Templates</div>
                <div className="text-[10px] text-slate-500 mt-0.5">Industry preset engines</div>
              </button>
              <button onClick={() => onNavigate('audits')} className="p-4 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-2xl text-left transition-all">
                <i className="fa-solid fa-clipboard-check text-purple-600 text-lg mb-2"></i>
                <div className="text-xs font-bold text-slate-900">Statutory Filing Desk</div>
                <div className="text-[10px] text-slate-500 mt-0.5">March 15 NDPC Registry</div>
              </button>
              <button onClick={() => onNavigate('breaches')} className="p-4 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-2xl text-left transition-all">
                <i className="fa-solid fa-triangle-exclamation text-amber-600 text-lg mb-2"></i>
                <div className="text-xs font-bold text-slate-900">Breach Watch</div>
                <div className="text-[10px] text-slate-500 mt-0.5">National incident intake</div>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* =========================================================================
     2. 🛡️ OUTSOURCED DPO PRACTICE ADVISORY DASHBOARD
     ========================================================================= */
  if (isDpo) {
    return (
      <div className="space-y-6 animate-in fade-in">
        <div className="bg-gradient-to-r from-blue-900 to-slate-900 text-white p-6 sm:p-8 rounded-3xl shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold bg-blue-400/20 text-blue-300 border border-blue-400/30 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                🛡️ OUTSOURCED DPO PRACTICE CONSOLE
              </span>
              <span className="text-xs text-slate-300">Multi-Client Advisory Desk</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Fortress Data Protection Advisory LLP</h2>
            <p className="text-xs text-slate-300 max-w-xl leading-relaxed">
              Active multi-client DPO advisory desk. Managing RoPA inventories, issuing digital DPIA sign-offs, and monitoring 72h regulatory breach timers across 4 client organizations.
            </p>
          </div>

          <button
            onClick={() => onNavigate('portfolio')}
            className="px-5 py-3 bg-blue-500 hover:bg-blue-400 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-2"
          >
            <i className="fa-solid fa-network-wired text-xs"></i>
            <span>Switch Client Workspace</span>
          </button>
        </div>

        {/* DPO KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-xs">
            <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase">
              <span>Retained Clients</span>
              <i className="fa-solid fa-building text-blue-600"></i>
            </div>
            <div className="text-2xl font-extrabold font-mono text-slate-900 mt-2">4 Clients</div>
            <div className="text-[11px] text-emerald-700 font-semibold mt-1">Multi-Client Desk Active</div>
          </div>

          <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-xs">
            <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase">
              <span>DPIA Sign-Off Queue</span>
              <i className="fa-solid fa-shield-halved text-purple-600"></i>
            </div>
            <div className="text-2xl font-extrabold font-mono text-slate-900 mt-2">3 Pending</div>
            <div className="text-[11px] text-purple-700 font-semibold mt-1">DPO Digital Stamp Required</div>
          </div>

          <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-xs">
            <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase">
              <span>Active Client DSARs</span>
              <i className="fa-solid fa-users-viewfinder text-sky-600"></i>
            </div>
            <div className="text-2xl font-extrabold font-mono text-slate-900 mt-2">2 Open</div>
            <div className="text-[11px] text-emerald-700 font-semibold mt-1">Within 30-Day SLA</div>
          </div>

          <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-xs">
            <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase">
              <span>Breach Watches</span>
              <i className="fa-solid fa-triangle-exclamation text-slate-400"></i>
            </div>
            <div className="text-2xl font-extrabold font-mono text-slate-900 mt-2">0 Urgent</div>
            <div className="text-[11px] text-emerald-700 font-semibold mt-1">All SLAs in Order</div>
          </div>
        </div>
      </div>
    );
  }

  /* =========================================================================
     3. 🏛️ LICENSED DPCO AUDIT PRACTICE DASHBOARD
     ========================================================================= */
  if (isDpco) {
    return (
      <div className="space-y-6 animate-in fade-in">
        <div className="bg-gradient-to-r from-purple-950 to-slate-900 text-white p-6 sm:p-8 rounded-3xl shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold bg-purple-400/20 text-purple-300 border border-purple-400/30 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                🏛️ LICENSED DPCO AUDIT SUITE
              </span>
              <span className="text-xs text-slate-300">NDPC License #DPCO-2026-0042</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Vanguard Compliance Partners DPCO</h2>
            <p className="text-xs text-slate-300 max-w-xl leading-relaxed">
              Statutory annual compliance audit practice desk. Scoring GAID 5-domain checklists, collecting evidence, and generating certified NDPC filing packs before the March 15 statutory deadline.
            </p>
          </div>

          <button
            onClick={() => onNavigate('audits')}
            className="px-5 py-3 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-2"
          >
            <i className="fa-solid fa-clipboard-check text-xs"></i>
            <span>Open Audit Certification Desk</span>
          </button>
        </div>

        {/* DPCO KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-xs">
            <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase">
              <span>NDPC March 15 Deadline</span>
              <i className="fa-solid fa-clock text-amber-600"></i>
            </div>
            <div className="text-2xl font-extrabold font-mono text-slate-900 mt-2">March 15</div>
            <div className="text-[11px] text-amber-700 font-semibold mt-1">Statutory Filing Season</div>
          </div>

          <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-xs">
            <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase">
              <span>Audit Projects</span>
              <i className="fa-solid fa-building-columns text-purple-600"></i>
            </div>
            <div className="text-2xl font-extrabold font-mono text-slate-900 mt-2">2 Engagements</div>
            <div className="text-[11px] text-purple-700 font-semibold mt-1">Fieldwork In Progress</div>
          </div>

          <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-xs">
            <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase">
              <span>5-Domain Checklist Avg</span>
              <i className="fa-solid fa-chart-pie text-emerald-600"></i>
            </div>
            <div className="text-2xl font-extrabold font-mono text-slate-900 mt-2">78.5%</div>
            <div className="text-[11px] text-emerald-700 font-semibold mt-1">GAID Scorecard Ready</div>
          </div>

          <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-xs">
            <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase">
              <span>Certified Packs</span>
              <i className="fa-solid fa-file-signature text-blue-600"></i>
            </div>
            <div className="text-2xl font-extrabold font-mono text-slate-900 mt-2">1 Issued</div>
            <div className="text-[11px] text-emerald-700 font-semibold mt-1">Signed by Managing Partner</div>
          </div>
        </div>
      </div>
    );
  }

  /* =========================================================================
     4. 🏢 CORPORATE DATA CONTROLLER IN-HOUSE DASHBOARD
     ========================================================================= */
  return (
    <div className="space-y-6">
      
      {/* 1. Top Emergency Alert if Active 72-Hour Breach Clocks */}
      {metrics?.breaches?.active_72h_clocks > 0 && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 flex items-center justify-between shadow-xs animate-in fade-in">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-red-600 text-white flex items-center justify-center flex-shrink-0 shadow-xs">
              <i className="fa-solid fa-triangle-exclamation text-lg"></i>
            </div>
            <div>
              <h4 className="text-sm font-bold text-red-900">Mandatory 72-Hour NDPC Breach Notification Clock Active!</h4>
              <p className="text-xs text-red-700 mt-0.5">
                You have {metrics.breaches.active_72h_clocks} active breach incident requiring regulatory filing under NDPA Section 40.
              </p>
            </div>
          </div>
          <button 
            onClick={() => onNavigate('breaches')}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs"
          >
            <span>Open Incident Triage</span>
            <i className="fa-solid fa-arrow-right text-xs"></i>
          </button>
        </div>
      )}

      {/* 2. Main Executive Grid: Compliance Readiness Gauge & Smart Automation Engine */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Card 1: Official NDPA Compliance Readiness Gauge */}
        <div className="bg-white border border-slate-200 p-6 rounded-3xl lg:col-span-2 shadow-xs relative overflow-hidden flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2.5">
              <span className="text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 px-2.5 py-0.5 rounded-full font-mono">
                🇳🇬 STATUTORY SCORECARD
              </span>
              <span className="text-xs text-slate-500 font-medium">NDPA 2023 / NDPC Framework</span>
            </div>

            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div>
                <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                  NDPA Compliance Readiness Index
                </h2>
                <p className="text-sm text-slate-600 mt-1.5 max-w-md leading-relaxed">
                  Automated evaluation across RoPA coverage, executed DPAs, conducted DPIAs, and resolved statutory audit non-conformities.
                </p>

                <div className="mt-4 flex flex-wrap items-center gap-3">
                  <div className="flex items-center gap-2 text-xs bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl font-medium text-slate-700">
                    <i className="fa-solid fa-circle-check text-emerald-600"></i>
                    <span>MDC Tier: <strong className="text-slate-900 uppercase">{metrics?.classification?.tier ? metrics.classification.tier.replace('_', ' ') : 'MDC HIGH'}</strong></span>
                  </div>
                  <div className="flex items-center gap-2 text-xs bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl font-medium text-slate-700">
                    <i className="fa-solid fa-building-columns text-emerald-600"></i>
                    <span>DPCO Audit: <strong className="text-slate-900">March 15 Filing Active</strong></span>
                  </div>
                </div>
              </div>

              {/* Circular Gauge Component */}
              <div className="relative flex items-center justify-center flex-shrink-0 self-center">
                <svg className="w-36 h-36 transform -rotate-90">
                  <circle
                    cx="72"
                    cy="72"
                    r="46"
                    stroke="#f1f5f9"
                    strokeWidth="12"
                    fill="transparent"
                  />
                  <circle
                    cx="72"
                    cy="72"
                    r="46"
                    stroke={scoreColor}
                    strokeWidth="12"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    fill="transparent"
                    className="transition-all duration-1000 ease-out"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <span className="text-3xl font-extrabold font-mono text-slate-900 tracking-tight">
                    {score}%
                  </span>
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    Readiness
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 text-slate-600">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Rule-based automated scoring active</span>
            </div>
            <button
              onClick={() => onNavigate('audits')}
              className="text-emerald-700 font-bold hover:underline flex items-center gap-1"
            >
              <span>View Statutory Audit Breakdown</span>
              <i className="fa-solid fa-arrow-right text-[10px]"></i>
            </button>
          </div>
        </div>

        {/* Card 2: Bronze to Gold Quest Progression */}
        <div className="bg-white border border-slate-200 p-6 rounded-3xl shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                COMPLIANCE QUEST
              </span>
              <span className="text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 rounded-full font-mono">
                Level 2 &bull; Silver Tier
              </span>
            </div>

            <h3 className="text-lg font-bold text-slate-900 tracking-tight">
              Path to 100% Gold Seal
            </h3>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed">
              Complete these statutory milestones to achieve full NDPC regulatory assurance before annual filing.
            </p>

            {/* Checklist */}
            <div className="mt-4 space-y-2.5">
              <div className="flex items-center gap-2.5 text-xs text-slate-700">
                <i className="fa-solid fa-circle-check text-emerald-600 text-sm"></i>
                <span className="line-through text-slate-400">Designate Official DPO</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs text-slate-700">
                <i className="fa-solid fa-circle-check text-emerald-600 text-sm"></i>
                <span className="line-through text-slate-400">Complete Section 48 MDC Assessment</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs text-slate-900 font-medium">
                <i className="fa-solid fa-circle-notch text-amber-500 text-sm animate-spin"></i>
                <span>Execute Missing Vendor DPAs (2 Pending)</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs text-slate-600">
                <i className="fa-regular fa-circle text-slate-300 text-sm"></i>
                <span>Sign Off DPIA on Biometric KYC Flow</span>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
            <button
              onClick={onOpenOnboarding}
              className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-2"
            >
              <i className="fa-solid fa-arrows-rotate text-xs"></i>
              <span>Re-run Section 48 MDC Wizard</span>
            </button>
          </div>
        </div>
      </div>

      {/* 3. Operational Performance Row (4 Statutory Desk Metrics) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* RoPA Metric */}
        <div 
          onClick={() => onNavigate('ropa')}
          className="bg-white border border-slate-200 p-5 rounded-2xl shadow-xs hover:border-slate-300 cursor-pointer transition-all group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">RoPA Coverage</span>
            <div className="w-8 h-8 rounded-xl bg-slate-50 text-slate-700 flex items-center justify-center group-hover:bg-slate-900 group-hover:text-white transition-colors">
              <i className="fa-solid fa-file-shield text-sm"></i>
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold font-mono text-slate-900">
              {metrics?.ropa?.total || 3}
            </span>
            <span className="text-xs text-slate-500">Activities Mapped</span>
          </div>
          <div className="mt-2 text-[11px] text-emerald-700 font-semibold flex items-center gap-1">
            <i className="fa-solid fa-check text-[10px]"></i>
            <span>{metrics?.ropa?.active || 3} Active Processing Flows</span>
          </div>
        </div>

        {/* DPIA Metric */}
        <div 
          onClick={() => onNavigate('dpia')}
          className="bg-white border border-slate-200 p-5 rounded-2xl shadow-xs hover:border-slate-300 cursor-pointer transition-all group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">DPIA Risk Matrix</span>
            <div className="w-8 h-8 rounded-xl bg-slate-50 text-slate-700 flex items-center justify-center group-hover:bg-slate-900 group-hover:text-white transition-colors">
              <i className="fa-solid fa-shield-halved text-sm"></i>
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold font-mono text-slate-900">
              {metrics?.dpia?.total || 1}
            </span>
            <span className="text-xs text-slate-500">Evaluations</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-600 font-medium flex items-center gap-1">
            <span className="text-emerald-700 font-bold">{metrics?.dpia?.approved || 1} Signed Off</span>
            <span>&bull; {metrics?.dpia?.high_risk || 0} Critical</span>
          </div>
        </div>

        {/* DSAR SLA Desk */}
        <div 
          onClick={() => onNavigate('dsar')}
          className="bg-white border border-slate-200 p-5 rounded-2xl shadow-xs hover:border-slate-300 cursor-pointer transition-all group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">30-Day DSAR SLA</span>
            <div className="w-8 h-8 rounded-xl bg-slate-50 text-slate-700 flex items-center justify-center group-hover:bg-slate-900 group-hover:text-white transition-colors">
              <i className="fa-solid fa-users-viewfinder text-sm"></i>
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold font-mono text-slate-900">
              {metrics?.dsar?.open_requests || 2}
            </span>
            <span className="text-xs text-slate-500">Open Requests</span>
          </div>
          <div className="mt-2 text-[11px] text-emerald-700 font-semibold flex items-center gap-1">
            <i className="fa-solid fa-clock text-[10px]"></i>
            <span>All within 30-day statutory SLA</span>
          </div>
        </div>

        {/* Vendor & TPRM Risk */}
        <div 
          onClick={() => onNavigate('vendors')}
          className="bg-white border border-slate-200 p-5 rounded-2xl shadow-xs hover:border-slate-300 cursor-pointer transition-all group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Vendor & TPRM</span>
            <div className="w-8 h-8 rounded-xl bg-slate-50 text-slate-700 flex items-center justify-center group-hover:bg-slate-900 group-hover:text-white transition-colors">
              <i className="fa-solid fa-handshake-simple text-sm"></i>
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold font-mono text-slate-900">
              {metrics?.vendors?.total_processors || 4}
            </span>
            <span className="text-xs text-slate-500">Processors</span>
          </div>
          <div className="mt-2 text-[11px] text-amber-700 font-semibold flex items-center gap-1">
            <i className="fa-solid fa-triangle-exclamation text-[10px]"></i>
            <span>{metrics?.vendors?.pending_dpa || 2} Missing Executed DPAs</span>
          </div>
        </div>

      </div>

      {/* 4. Statutory Remediation & Automation Section */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-7 shadow-xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-5 border-b border-slate-100">
          <div>
            <h3 className="text-base font-bold text-slate-900 tracking-tight">
              Statutory NDPC Remediation Queue
            </h3>
            <p className="text-xs text-slate-600 mt-0.5">
              Identified non-conformities requiring immediate corrective action before statutory DPCO audit sign-off.
            </p>
          </div>
          <button
            onClick={() => onNavigate('audits')}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-2"
          >
            <i className="fa-solid fa-clipboard-check text-xs"></i>
            <span>View Full Audit Checklist</span>
          </button>
        </div>

        <div className="mt-4 divide-y divide-slate-100">
          <div className="py-3.5 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="w-2 h-2 rounded-full bg-red-500 flex-shrink-0"></span>
              <div>
                <div className="text-xs font-bold text-slate-900">
                  Missing Executed Data Processing Agreement (DPA) with AWS Ireland
                </div>
                <div className="text-[11px] text-slate-500">
                  Domain: Third-Party Processor Governance &bull; High Severity
                </div>
              </div>
            </div>
            <button 
              onClick={() => onNavigate('vendors')}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-bold whitespace-nowrap transition-colors"
            >
              Upload DPA &rarr;
            </button>
          </div>

          <div className="py-3.5 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="w-2 h-2 rounded-full bg-amber-500 flex-shrink-0"></span>
              <div>
                <div className="text-xs font-bold text-slate-900">
                  DPIA Required on Biometric KYC Verification Flow
                </div>
                <div className="text-[11px] text-slate-500">
                  Domain: High-Risk Processing &bull; Medium Severity
                </div>
              </div>
            </div>
            <button 
              onClick={() => onNavigate('dpia')}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-bold whitespace-nowrap transition-colors"
            >
              Start DPIA &rarr;
            </button>
          </div>

          <div className="py-3.5 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="w-2 h-2 rounded-full bg-amber-500 flex-shrink-0"></span>
              <div>
                <div className="text-xs font-bold text-slate-900">
                  Annual Employee Data Protection Training Log Incomplete
                </div>
                <div className="text-[11px] text-slate-500">
                  Domain: Governance & Awareness &bull; Medium Severity
                </div>
              </div>
            </div>
            <button 
              onClick={() => onNavigate('audits')}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-bold whitespace-nowrap transition-colors"
            >
              Attach Training Evidence &rarr;
            </button>
          </div>
        </div>
      </div>

    </div>
  );
}
