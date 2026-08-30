import React from 'react';
import { 
  LayoutDashboard, 
  FileSpreadsheet, 
  ShieldAlert, 
  ClipboardCheck, 
  Users, 
  Flame, 
  Truck, 
  Cookie, 
  FileText, 
  Briefcase,
  ExternalLink
} from 'lucide-react';

export default function Sidebar({ activeTab, onTabChange, tenantType, metrics }) {
  const navItems = [
    { id: 'dashboard', label: 'Executive Overview', icon: LayoutDashboard },
    { id: 'ropa', label: 'Automated RoPA', icon: FileSpreadsheet, count: metrics?.ropa?.total },
    { id: 'dpia', label: 'DPIA Risk Matrix', icon: ShieldAlert, count: metrics?.dpia?.total },
    { id: 'audits', label: 'NDPC Statutory Audits', icon: ClipboardCheck, badge: metrics?.compliance_gauge?.score ? `${metrics.compliance_gauge.score}%` : null },
    { id: 'dsar', label: '30-Day DSAR Desk', icon: Users, count: metrics?.dsar?.open_requests, urgent: metrics?.dsar?.urgent_under_7_days > 0 },
    { id: 'breaches', label: '72-Hour Breach Clock', icon: Flame, count: metrics?.breaches?.active_incidents, alert: metrics?.breaches?.active_72h_clocks > 0 },
    { id: 'vendors', label: 'Vendor & TPRM Risk', icon: Truck, count: metrics?.vendors?.total_processors },
    { id: 'cookies', label: 'Cookie Consent SDK', icon: Cookie },
    { id: 'policies', label: 'Policy Auto-Generator', icon: FileText },
  ];

  // If user is Outsourced DPO or Licensed DPCO Firm, show Portfolio Desk tab
  if (['outsourced_dpo', 'dpco_firm'].includes(tenantType)) {
    navItems.splice(1, 0, {
      id: 'portfolio',
      label: tenantType === 'dpco_firm' ? 'DPCO Client Audit Desk' : 'DPO Multi-Client Portfolio',
      icon: Briefcase,
      highlight: true,
    });
  }

  return (
    <aside className="w-64 border-r border-slate-800 bg-slate-900/50 backdrop-blur-md flex flex-col justify-between p-4 min-h-[calc(100vh-4rem)]">
      <div className="space-y-6">
        {/* Navigation Section */}
        <div>
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-3 mb-2">
            Compliance Operations
          </div>
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => onTabChange(item.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all group ${
                    isActive
                      ? 'bg-gradient-to-r from-brand-600/20 to-brand-600/5 text-brand-400 border border-brand-500/30 shadow-lg shadow-brand-950/50'
                      : item.highlight
                      ? 'bg-purple-950/20 text-purple-300 border border-purple-800/40 hover:bg-purple-950/40'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 transition-colors ${
                      isActive ? 'text-brand-400' : item.highlight ? 'text-purple-400' : 'text-slate-400 group-hover:text-slate-200'
                    }`} />
                    <span>{item.label}</span>
                  </div>

                  {/* Badges / Counts */}
                  <div className="flex items-center gap-1.5">
                    {item.badge && (
                      <span className="text-[11px] font-mono bg-brand-950 text-brand-400 border border-brand-800/60 px-1.5 py-0.2 rounded font-semibold">
                        {item.badge}
                      </span>
                    )}
                    {item.count !== undefined && item.count > 0 && (
                      <span className={`text-[11px] font-mono px-2 py-0.5 rounded-full font-bold ${
                        item.alert 
                          ? 'bg-red-950 text-red-400 border border-red-800 animate-pulse' 
                          : item.urgent 
                          ? 'bg-amber-950 text-amber-400 border border-amber-800' 
                          : 'bg-slate-800 text-slate-300'
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
      <div className="glass-panel p-3.5 rounded-2xl border-slate-800 bg-gradient-to-br from-slate-900/90 to-slate-950">
        <div className="flex items-center gap-2 mb-1.5">
          <div className="w-2 h-2 rounded-full bg-brand-400 animate-ping" />
          <span className="text-xs font-semibold text-slate-200">NDPA 2023 Active</span>
        </div>
        <p className="text-[11px] text-slate-400 leading-relaxed">
          Rule-based 80% automation engine active. Review → Verify → Correct → Approve.
        </p>
        <div className="mt-2.5 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-500 font-mono">
          <span>NDPC GAID v1.2</span>
          <span>SLA SEC-40</span>
        </div>
      </div>
    </aside>
  );
}
