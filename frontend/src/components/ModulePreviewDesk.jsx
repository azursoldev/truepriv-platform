import React from 'react';

export default function ModulePreviewDesk({ 
  moduleKey, 
  title, 
  subtitle, 
  icon, 
  badge,
  actionLabel, 
  onAction,
  onNavigate,
  tenant
}) {
  const tenantName = tenant?.name || 'DPCO TEST ACCOUNT';

  // Specific content templates according to PRD section 12.5 and Milestone 1-3 agreement
  const getModuleContent = () => {
    switch (moduleKey) {
      case 'work':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 bg-white border border-slate-200/90 rounded-2xl shadow-2xs">
                <span className="text-xs text-slate-500 font-medium">Assigned to me</span>
                <div className="text-2xl font-extrabold text-slate-900 mt-1">2</div>
                <span className="text-[11px] text-amber-700 font-semibold">1 urgent item</span>
              </div>
              <div className="p-4 bg-white border border-slate-200/90 rounded-2xl shadow-2xs">
                <span className="text-xs text-slate-500 font-medium">Under Review</span>
                <div className="text-2xl font-extrabold text-slate-900 mt-1">1</div>
                <span className="text-[11px] text-slate-400">Awaiting independent review</span>
              </div>
              <div className="p-4 bg-white border border-slate-200/90 rounded-2xl shadow-2xs">
                <span className="text-xs text-slate-500 font-medium">Completed this month</span>
                <div className="text-2xl font-extrabold text-slate-900 mt-1">5</div>
                <span className="text-[11px] text-slate-700 font-semibold">100% on schedule</span>
              </div>
            </div>

            <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-2xs space-y-3">
              <h3 className="text-sm font-bold text-slate-900">Active Task Queue</h3>
              <div className="space-y-2.5">
                {[
                  { title: 'Prepare RoPA Summary for HR Staff Data', tag: 'High Priority', due: 'In 3 days', type: 'Review' },
                  { title: 'Verify Data Residency Routing Configuration', tag: 'Milestone 3', due: 'In 7 days', type: 'Governance' },
                  { title: 'Review 30-Day Guest Link for External Assessor', tag: 'Active Guest', due: 'In 12 days', type: 'Access' },
                ].map((task, i) => (
                  <div key={i} className="p-3.5 border border-slate-200/70 hover:border-slate-300 rounded-xl flex items-center justify-between gap-3 transition-all">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center text-xs">
                        <i className="fa-regular fa-clipboard"></i>
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-900">{task.title}</div>
                        <div className="text-[11px] text-slate-400 mt-0.5">Due: {task.due} &bull; Type: {task.type}</div>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                      {task.tag}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 'calendar':
        return (
          <div className="space-y-4">
            <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-2xs">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-slate-900">Statutory & Operational Schedule</h3>
                <span className="text-xs text-slate-500 font-medium">October 2026</span>
              </div>
              <div className="space-y-3">
                {[
                  { date: 'Oct 24, 2026', title: 'NDPA Section 24 Segregation of Duties Review', status: 'Scheduled', badge: 'Governance' },
                  { date: 'Nov 02, 2026', title: '30-Day Guest Token Expiration Check', status: 'Upcoming', badge: 'Security' },
                  { date: 'Nov 15, 2026', title: 'Quarterly Dual-Residency Node Connectivity Audit', status: 'Upcoming', badge: 'Infrastructure' },
                ].map((item, idx) => (
                  <div key={idx} className="p-3 border border-slate-100 rounded-xl flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="text-center px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono font-bold text-slate-700">
                        {item.date}
                      </div>
                      <span className="text-xs font-bold text-slate-800">{item.title}</span>
                    </div>
                    <span className="text-[10px] font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-full">
                      {item.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 'systems':
        return (
          <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900">Systems & Infrastructure Inventory</h3>
              <span className="text-xs text-slate-400">3 Registered Systems</span>
            </div>
            <div className="space-y-2.5">
              {[
                { name: 'Core Banking & Payment Gateway', host: 'Nigeria Onshore (Galaxy Backbone)', status: 'Active', category: 'High Sensitivity' },
                { name: 'Internal HR Portal & Payroll DB', host: 'Local Nigeria Datacenter', status: 'Active', category: 'Employee PII' },
                { name: 'Customer Support Desk', host: 'Cloud Infrastructure', status: 'Active', category: 'Customer Contact Info' },
              ].map((sys, idx) => (
                <div key={idx} className="p-3.5 border border-slate-200/80 rounded-xl flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-slate-900">{sys.name}</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">Location: {sys.host} &bull; Classification: {sys.category}</div>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                    {sys.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        );

      case 'transfers':
        return (
          <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900">Cross-Border Data Transfer Register</h3>
              <span className="text-xs text-slate-400">NDPA Section 41–43</span>
            </div>
            <p className="text-xs text-slate-500">
              Track international data flows and recorded safeguards. Onshore residency keeps primary data 100% within Nigerian territorial boundaries.
            </p>
            <div className="p-4 bg-orange-50/70 border border-orange-200/80 rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <i className="fa-solid fa-building-shield text-orange-600 text-lg"></i>
                <div>
                  <div className="text-xs font-bold text-slate-900">Primary Node: Local Nigeria Storage</div>
                  <div className="text-[11px] text-slate-600">No unauthorized cross-border replication active for current tenant.</div>
                </div>
              </div>
              <span className="text-[10px] font-bold text-slate-700 bg-white px-2 py-1 rounded-lg border border-slate-200">
                100% Localized
              </span>
            </div>
          </div>
        );

      case 'contracts':
        return (
          <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900">Privacy Contracts & DPAs</h3>
              <span className="text-xs text-slate-400">Data Processing Agreements</span>
            </div>
            <div className="space-y-2.5">
              {[
                { name: 'Core Cloud Provider Data Processing Addendum', parties: 'Organization & Cloud Host', status: 'Executed', date: 'Oct 2026' },
                { name: 'Payment Gateway Processor Agreement', parties: 'Organization & PSP', status: 'Under Review', date: 'Pending DPO' },
              ].map((c, idx) => (
                <div key={idx} className="p-3.5 border border-slate-200/80 rounded-xl flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-slate-900">{c.name}</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">Parties: {c.parties} &bull; Signed: {c.date}</div>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    c.status === 'Executed' ? 'bg-slate-100 text-slate-700 border border-slate-200' : 'bg-amber-50 text-amber-700 border border-amber-200'
                  }`}>
                    {c.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        );

      case 'reports':
        return (
          <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900">Audit & Management Reports</h3>
              <button className="text-xs font-semibold text-[#ea580c] hover:underline">
                Generate New Report
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-4 border border-slate-200/80 rounded-xl hover:border-slate-300 transition-all">
                <i className="fa-solid fa-file-pdf text-rose-500 text-lg mb-2"></i>
                <div className="text-xs font-bold text-slate-900">NDPA Executive Compliance Summary</div>
                <div className="text-[11px] text-slate-500 mt-1">Full breakdown of verified RoPA records, roles, and security audit telemetry.</div>
                <button className="mt-3 text-[11px] font-bold text-[#ea580c] flex items-center gap-1">
                  <i className="fa-solid fa-download"></i> Download PDF
                </button>
              </div>
              <div className="p-4 border border-slate-200/80 rounded-xl hover:border-slate-300 transition-all">
                <i className="fa-solid fa-file-excel text-slate-700 text-lg mb-2"></i>
                <div className="text-xs font-bold text-slate-900">Statutory RoPA Register Export</div>
                <div className="text-[11px] text-slate-500 mt-1">Export structured processing inventory in standard XLSX / CSV format.</div>
                <button className="mt-3 text-[11px] font-bold text-[#ea580c] flex items-center gap-1">
                  <i className="fa-solid fa-download"></i> Export Data
                </button>
              </div>
            </div>
          </div>
        );

      case 'help':
        return (
          <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-2xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900">TruePriv Help Centre & Regulatory Guidelines</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-xl">
                <div className="font-bold text-slate-900 mb-1">Getting Started with RoPA</div>
                <p className="text-slate-500 text-[11px]">Learn how to record data processing activities, map storage locations, and assign accountable owners.</p>
              </div>
              <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-xl">
                <div className="font-bold text-slate-900 mb-1">NDPA Section 24 & 48 RBAC</div>
                <p className="text-slate-500 text-[11px]">Guidance on role segregation of duties across Corporate Admins, Compliance Officers, and DPCO Auditors.</p>
              </div>
              <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-xl">
                <div className="font-bold text-slate-900 mb-1">30-Day Guest Assessor Tokens</div>
                <p className="text-slate-500 text-[11px]">How tokenized time-limited invitation links work without exposing billing or sensitive settings.</p>
              </div>
              <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-xl">
                <div className="font-bold text-slate-900 mb-1">Dual-Residency Data Localization</div>
                <p className="text-slate-500 text-[11px]">Technical explanation of Nigerian onshore storage with Galaxy Backbone and cross-border provisions.</p>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in pb-10">
      
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-slate-900">{title}</h1>
            {badge && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-orange-50 text-orange-700 border border-orange-200">
                {badge}
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-1">{subtitle}</p>
        </div>

        {actionLabel && (
          <button
            onClick={onAction}
            className="px-4 py-2 bg-[#ea580c] hover:bg-[#c2410c] text-white rounded-xl text-xs font-bold transition-all shadow-2xs flex items-center gap-1.5 self-start sm:self-auto"
          >
            <i className="fa-solid fa-plus text-xs"></i>
            <span>{actionLabel}</span>
          </button>
        )}
      </div>

      {/* Module Content */}
      {getModuleContent()}

    </div>
  );
}
