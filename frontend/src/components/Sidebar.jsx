import React from 'react';

export default function Sidebar({ 
  activeTab, 
  onTabChange, 
  tenantType, 
  userRole,
  metrics, 
  isCollapsed, 
  onToggle 
}) {
  const isSuperAdmin = userRole === 'super_admin';
  const isCorporate = tenantType === 'corporate' || ['corporate_admin', 'compliance_officer', 'dept_champion'].includes(userRole);
  const isDpo = tenantType === 'outsourced_dpo' || userRole === 'outsourced_dpo';
  const isDpco = tenantType === 'dpco_firm' || ['dpco_lead_auditor', 'dpco_staff'].includes(userRole);

  let navItems = [];
  let sectionTitle = 'Compliance Operations';

  if (isSuperAdmin) {
    // Super Admin: Global Platform Authority, Tenant Management & Data Residency Node
    sectionTitle = 'Global System Authority';
    navItems = [
      { id: 'dashboard', label: 'Global Platform Hub', icon: 'fa-solid fa-crown', highlight: true },
      { id: 'admin-users', label: 'Global Tenants & Users', icon: 'fa-solid fa-building-user' },
      { id: 'audit-logs', label: 'Global Security Logs', icon: 'fa-solid fa-shield-halved' },
      { id: 'data-residency', label: 'Platform Data Residency', icon: 'fa-solid fa-building-shield' },
    ];
  } else if (isDpo) {
    // Outsourced DPO: Multi-Client Portfolio & Advisory Workspace
    sectionTitle = 'DPO Advisory Console';
    navItems = [
      { id: 'portfolio-desk', label: 'Client Workspaces Portfolio', icon: 'fa-solid fa-briefcase', highlight: true },
      { id: 'dashboard', label: 'DPO Practice Metrics', icon: 'fa-solid fa-chart-pie' },
      { id: 'audit-logs', label: 'DPO Audit Trail', icon: 'fa-solid fa-shield-halved' },
    ];
  } else if (isDpco) {
    // DPCO Firm: Statutory Audit Client Portfolio & Suite
    sectionTitle = 'Licensed DPCO Suite';
    navItems = [
      { id: 'portfolio-desk', label: 'Client Audit Registry', icon: 'fa-solid fa-building-columns', highlight: true },
      { id: 'dashboard', label: 'Audit Practice Overview', icon: 'fa-solid fa-gauge-high' },
      { id: 'audit-logs', label: 'Statutory Audit Logs', icon: 'fa-solid fa-clipboard-check' },
    ];
  } else if (userRole === 'dept_champion') {
    // Department Champion: Department Intake
    sectionTitle = 'Department Intake';
    navItems = [
      { id: 'dashboard', label: 'My Department Overview', icon: 'fa-solid fa-user-tag', highlight: true },
    ];
  } else {
    // Corporate Controller: Company Compliance Operations
    sectionTitle = 'Corporate Operations';
    navItems = [
      { id: 'dashboard', label: 'Executive Overview', icon: 'fa-solid fa-gauge-high' },
    ];

    if (userRole === 'corporate_admin') {
      navItems.push({
        id: 'admin-users',
        label: 'Team & Role Governance',
        icon: 'fa-solid fa-users-gear',
        highlight: true,
      });
      navItems.push({
        id: 'audit-logs',
        label: 'Security & Audit Logs',
        icon: 'fa-solid fa-shield-halved',
      });
    } else if (userRole === 'compliance_officer') {
      navItems.push({
        id: 'audit-logs',
        label: 'Security & Audit Logs',
        icon: 'fa-solid fa-shield-halved',
      });
    }
  }

  return (
    <aside 
      className={`${
        isCollapsed ? 'w-18' : 'w-64'
      } transition-all duration-300 ease-in-out border-r border-slate-200 bg-white flex flex-col justify-between p-3 min-h-[calc(100vh-4rem)] shadow-2xs flex-shrink-0`}
    >
      <div className="space-y-4">
        
        {/* Navigation Header & Collapse/Expand Toggle */}
        <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'justify-between px-2'} mb-1`}>
          {!isCollapsed && (
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              {sectionTitle}
            </span>
          )}
          <button
            onClick={onToggle}
            title={isCollapsed ? "Expand Sidebar Menu" : "Collapse Sidebar Menu"}
            className="w-7 h-7 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-500 hover:text-slate-900 transition-all flex items-center justify-center text-xs"
          >
            <i className={`fa-solid ${isCollapsed ? 'fa-angles-right' : 'fa-angles-left'}`}></i>
          </button>
        </div>

        {/* Navigation Item List */}
        <nav className="space-y-1">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                title={isCollapsed ? item.label : undefined}
                className={`w-full flex items-center ${
                  isCollapsed ? 'justify-center p-2.5' : 'justify-between px-3 py-2.5'
                } rounded-xl text-sm font-medium transition-all group relative ${
                  isActive
                    ? 'bg-emerald-50 text-emerald-900 border border-emerald-200 font-semibold shadow-2xs'
                    : item.highlight
                    ? 'bg-purple-50 text-purple-800 border border-purple-200 hover:bg-purple-100'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 border border-transparent'
                }`}
              >
                <div className="flex items-center gap-3">
                  <i className={`${item.icon} text-sm transition-colors ${
                    isActive ? 'text-emerald-700' : item.highlight ? 'text-purple-600' : 'text-slate-400 group-hover:text-slate-700'
                  }`}></i>
                  
                  {!isCollapsed && (
                    <span className="truncate max-w-[140px] text-left text-xs">{item.label}</span>
                  )}
                </div>

                {/* Badges / Counts */}
                {!isCollapsed ? (
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    {item.badge && (
                      <span className="text-[10px] font-mono bg-emerald-100 text-emerald-800 border border-emerald-200 px-1.5 py-0.2 rounded font-semibold">
                        {item.badge}
                      </span>
                    )}
                    {item.count !== undefined && item.count > 0 && (
                      <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full font-bold ${
                        item.alert 
                          ? 'bg-red-100 text-red-700 border border-red-200 animate-pulse' 
                          : item.urgent 
                          ? 'bg-amber-100 text-amber-800 border border-amber-200' 
                          : 'bg-slate-100 text-slate-700 border border-slate-200'
                      }`}>
                        {item.count}
                      </span>
                    )}
                  </div>
                ) : (
                  /* Compact Dot Indicator when collapsed */
                  (item.count > 0 || item.alert || item.urgent) && (
                    <span className={`absolute top-1 right-1 w-2 h-2 rounded-full ${
                      item.alert ? 'bg-red-500 animate-ping' : item.urgent ? 'bg-amber-500' : 'bg-emerald-500'
                    }`} />
                  )
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Statutory Footer Badge */}
      <div className={`rounded-2xl border border-slate-200 bg-slate-50 ${isCollapsed ? 'p-2 text-center' : 'p-3'}`}>
        <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-2 mb-1'}`}>
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-ping flex-shrink-0" />
          {!isCollapsed && (
            <span className="text-xs font-bold text-slate-800">
              {isSuperAdmin ? 'Truepriv Authority' : isDpo ? 'DPO Advisory Mode' : isDpco ? 'Licensed DPCO Suite' : 'NDPA 2023 Active'}
            </span>
          )}
        </div>
        {!isCollapsed && (
          <>
            <p className="text-[10px] text-slate-500 leading-tight mt-1">
              {isSuperAdmin 
                ? 'Master authority console with global multi-tenant controls.' 
                : isDpo
                ? 'Multi-client data protection officer advisory engine active.'
                : isDpco
                ? 'Statutory annual compliance audit & certification active.'
                : 'Rule-based 80% automation engine active. Review &rarr; Approve.'}
            </p>
            <div className="mt-2 pt-2 border-t border-slate-200/80 flex items-center justify-between text-[9px] text-slate-400 font-mono">
              <span>NDPC GAID v1.2</span>
              <span>SLA SEC-40</span>
            </div>
          </>
        )}
      </div>
    </aside>
  );
}
