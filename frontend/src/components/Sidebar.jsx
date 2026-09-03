import React from 'react';

export default function Sidebar({ activeTab, onTabChange, tenantType, metrics }) {
  const navItems = [
    { id: 'dashboard', label: 'Executive Overview', icon: 'fa-solid fa-gauge-high' },
    { id: 'ropa', label: 'Automated RoPA', icon: 'fa-solid fa-file-shield', count: metrics?.ropa?.total },
    { id: 'dpia', label: 'DPIA Risk Matrix', icon: 'fa-solid fa-shield-halved', count: metrics?.dpia?.total },
    { id: 'audits', label: 'NDPC Statutory Audits', icon: 'fa-solid fa-clipboard-check', badge: metrics?.compliance_gauge?.score ? `${metrics.compliance_gauge.score}%` : null },
    { id: 'dsar', label: '30-Day DSAR Desk', icon: 'fa-solid fa-users-viewfinder', count: metrics?.dsar?.open_requests, urgent: metrics?.dsar?.urgent_under_7_days > 0 },
    { id: 'breaches', label: '72-Hour Breach Clock', icon: 'fa-solid fa-triangle-exclamation', count: metrics?.breaches?.active_incidents, alert: metrics?.breaches?.active_72h_clocks > 0 },
    { id: 'vendors', label: 'Vendor & TPRM Risk', icon: 'fa-solid fa-handshake-simple', count: metrics?.vendors?.total_processors },
    { id: 'cookies', label: 'Cookie Consent SDK', icon: 'fa-solid fa-cookie-bite' },
    { id: 'policies', label: 'Policy Auto-Generator', icon: 'fa-solid fa-file-contract' },
  ];

  // If user is Outsourced DPO or Licensed DPCO Firm, show Portfolio Desk tab
  if (['outsourced_dpo', 'dpco_firm'].includes(tenantType)) {
    navItems.splice(1, 0, {
      id: 'portfolio',
      label: tenantType === 'dpco_firm' ? 'DPCO Client Audit Desk' : 'DPO Multi-Client Portfolio',
      icon: 'fa-solid fa-network-wired',
      highlight: true,
    });
  }

  return (
    <aside className="w-64 border-r border-slate-200 bg-white flex flex-col justify-between p-4 min-h-[calc(100vh-4rem)] shadow-2xs">
      <div className="space-y-6">
        {/* Navigation Section */}
        <div>
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-3 mb-2">
            Compliance Operations
          </div>
          <nav className="space-y-1">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => onTabChange(item.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all group ${
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
                    <span>{item.label}</span>
                  </div>

                  {/* Badges / Counts */}
                  <div className="flex items-center gap-1.5">
                    {item.badge && (
                      <span className="text-[11px] font-mono bg-emerald-100 text-emerald-800 border border-emerald-200 px-1.5 py-0.2 rounded font-semibold">
                        {item.badge}
                      </span>
                    )}
                    {item.count !== undefined && item.count > 0 && (
                      <span className={`text-[11px] font-mono px-2 py-0.5 rounded-full font-bold ${
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
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Statutory Footer Badge */}
      <div className="p-3.5 rounded-2xl border border-slate-200 bg-slate-50">
        <div className="flex items-center gap-2 mb-1.5">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
          <span className="text-xs font-bold text-slate-800">NDPA 2023 Active</span>
        </div>
        <p className="text-[11px] text-slate-500 leading-tight">
          Rule-based 80% automation engine active. Review &rarr; Verify &rarr; Correct &rarr; Approve.
        </p>
        <div className="mt-2 pt-2 border-t border-slate-200/80 flex items-center justify-between text-[10px] text-slate-400 font-mono">
          <span>NDPC GAID v1.2</span>
          <span>SLA SEC-40</span>
        </div>
      </div>
    </aside>
  );
}
