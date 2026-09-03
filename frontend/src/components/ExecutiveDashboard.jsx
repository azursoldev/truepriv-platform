import React from 'react';

export default function ExecutiveDashboard({ metrics, onNavigate, onAutoFillRopa, onOpenOnboarding }) {
  const score = metrics?.compliance_gauge?.score || 78.5;
  const circumference = 2 * Math.PI * 46;
  const strokeDashoffset = circumference - (score / 100) * circumference;
  const scoreColor = score >= 80 ? '#059669' : score >= 50 ? '#d97706' : '#dc2626';

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
                    <span>Status: <strong className="text-slate-900">{metrics?.compliance_gauge?.status || 'Substantially Compliant'}</strong></span>
                  </div>
                  <div className="flex items-center gap-2 text-xs bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl font-medium text-slate-700">
                    <i className="fa-solid fa-clock text-amber-600"></i>
                    <span>Next Audit Deadline: <strong className="text-slate-900">March 15, 2027</strong></span>
                  </div>
                </div>
              </div>

              {/* Circular Gauge */}
              <div className="relative flex items-center justify-center flex-shrink-0 self-center md:self-auto">
                <svg className="w-36 h-36 transform -rotate-90">
                  <circle
                    cx="72"
                    cy="72"
                    r="46"
                    stroke="#e2e8f0"
                    strokeWidth="10"
                    fill="transparent"
                  />
                  <circle
                    cx="72"
                    cy="72"
                    r="46"
                    stroke={scoreColor}
                    strokeWidth="10"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    fill="transparent"
                    className="transition-all duration-1000 ease-out"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <span className="text-3xl font-extrabold font-mono text-slate-900 tracking-tight">{score}%</span>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Readiness</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span className="flex items-center gap-1.5">
              <i className="fa-solid fa-scale-balanced text-emerald-600"></i>
              <span>Section 48 Major Data Controller (MDC) Compliant</span>
            </span>
            <button
              onClick={onOpenOnboarding}
              className="text-emerald-700 hover:text-emerald-900 font-bold hover:underline flex items-center gap-1"
            >
              <span>Recalculate Scorecard</span>
              <i className="fa-solid fa-arrow-right text-[10px]"></i>
            </button>
          </div>
        </div>

        {/* Card 2: Smart Automation Engine */}
        <div className="bg-white border border-slate-200 p-6 rounded-3xl shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center">
                <i className="fa-solid fa-wand-magic-sparkles text-sm"></i>
              </div>
              <h3 className="text-base font-bold text-slate-900">Smart Automation Engine</h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Skip blank form fatigue. Apply Nigerian industry templates to auto-draft RoPA, risk matrices, and NDPC statutory audit packs.
            </p>

            <div className="mt-4 space-y-2.5">
              <button
                onClick={() => onNavigate('ropa')}
                className="w-full text-left p-3 rounded-2xl bg-slate-50 hover:bg-emerald-50/60 border border-slate-200 hover:border-emerald-300 transition-all flex items-center justify-between group"
              >
                <div className="flex items-center gap-3">
                  <i className="fa-solid fa-file-shield text-emerald-600 text-sm"></i>
                  <div>
                    <div className="text-xs font-bold text-slate-900 group-hover:text-emerald-900">1-Click Industry RoPA</div>
                    <div className="text-[11px] text-slate-500">Autofill 15–30 processing items</div>
                  </div>
                </div>
                <i className="fa-solid fa-chevron-right text-slate-400 group-hover:text-emerald-600 text-xs"></i>
              </button>

              <button
                onClick={() => onNavigate('audits')}
                className="w-full text-left p-3 rounded-2xl bg-slate-50 hover:bg-purple-50/60 border border-slate-200 hover:border-purple-300 transition-all flex items-center justify-between group"
              >
                <div className="flex items-center gap-3">
                  <i className="fa-solid fa-file-export text-purple-600 text-sm"></i>
                  <div>
                    <div className="text-xs font-bold text-slate-900 group-hover:text-purple-900">NDPC Audit Filing Report</div>
                    <div className="text-[11px] text-slate-500">Generate certified statutory PDF</div>
                  </div>
                </div>
                <i className="fa-solid fa-chevron-right text-slate-400 group-hover:text-purple-600 text-xs"></i>
              </button>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span>Principle:</span>
            <strong className="text-emerald-700 font-mono font-semibold">Review &rarr; Verify &rarr; Approve</strong>
          </div>
        </div>

      </div>

      {/* 3. Gamification Quest Card */}
      <div className="bg-white border border-slate-200 p-6 rounded-3xl shadow-xs">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-2 flex-1">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-900 text-xs font-bold flex items-center gap-1.5">
                <i className="fa-solid fa-trophy text-amber-600"></i> Level 3 &bull; NDPA Assurance Champion
              </span>
              <span className="px-3 py-1 rounded-full bg-orange-50 border border-orange-200 text-orange-900 text-xs font-bold flex items-center gap-1.5">
                <i className="fa-solid fa-fire text-orange-600"></i> 14-Day Compliance Streak
              </span>
            </div>
            
            <h3 className="text-lg font-bold text-slate-900 tracking-tight">Compliance Gamification & Mastery Quest</h3>
            <p className="text-xs text-slate-600 max-w-xl leading-relaxed">
              Earn compliance XP, unlock regulatory armor badges, and level up your organization towards certified <strong>NDPC Audit Mastery</strong>.
            </p>

            <div className="pt-2">
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="text-slate-600 font-medium">XP Progress to Level 4 (Certified Master):</span>
                <span className="font-mono font-bold text-emerald-700">785 / 1000 XP</span>
              </div>
              <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden border border-slate-200">
                <div className="bg-emerald-600 h-full rounded-full transition-all duration-500" style={{ width: '78.5%' }} />
              </div>
            </div>
          </div>

          {/* Achievement Badges */}
          <div className="flex items-center gap-3 overflow-x-auto pb-1 max-w-full">
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl text-center min-w-[85px] shadow-2xs">
              <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center mx-auto mb-1">
                <i className="fa-solid fa-trophy text-xs"></i>
              </div>
              <div className="text-[11px] font-bold text-slate-900">RoPA Master</div>
              <div className="text-[9px] text-emerald-700 font-semibold uppercase">Unlocked</div>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl text-center min-w-[85px] shadow-2xs">
              <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center mx-auto mb-1">
                <i className="fa-solid fa-shield-halved text-xs"></i>
              </div>
              <div className="text-[11px] font-bold text-slate-900">DPIA Shield</div>
              <div className="text-[9px] text-emerald-700 font-semibold uppercase">Unlocked</div>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl text-center min-w-[85px] shadow-2xs">
              <div className="w-8 h-8 rounded-full bg-red-100 text-red-800 flex items-center justify-center mx-auto mb-1">
                <i className="fa-solid fa-bolt text-xs"></i>
              </div>
              <div className="text-[11px] font-bold text-slate-900">72h Sentinel</div>
              <div className="text-[9px] text-emerald-700 font-semibold uppercase">Unlocked</div>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl text-center min-w-[85px] shadow-2xs">
              <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-800 flex items-center justify-center mx-auto mb-1">
                <i className="fa-solid fa-handshake text-xs"></i>
              </div>
              <div className="text-[11px] font-bold text-slate-900">DPA Guardian</div>
              <div className="text-[9px] text-emerald-700 font-semibold uppercase">Unlocked</div>
            </div>

            <div className="p-3 bg-slate-50/50 border border-slate-200/80 rounded-2xl text-center min-w-[85px] opacity-60">
              <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-500 flex items-center justify-center mx-auto mb-1">
                <i className="fa-solid fa-crown text-xs"></i>
              </div>
              <div className="text-[11px] font-bold text-slate-600">NDPC Master</div>
              <div className="text-[9px] text-slate-400 font-mono">Unlock @ 90%</div>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Four Core Operational Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* RoPA Metric */}
        <div 
          onClick={() => onNavigate('ropa')}
          className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-slate-300 transition-all cursor-pointer shadow-xs group"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center">
              <i className="fa-solid fa-file-shield text-base"></i>
            </div>
            <span className="text-xs font-mono font-semibold text-slate-500">
              {metrics?.ropa?.verified || 2}/{metrics?.ropa?.total || 3} Approved
            </span>
          </div>
          <div className="text-2xl font-extrabold font-mono text-slate-900">{metrics?.ropa?.total || 3}</div>
          <div className="text-xs font-bold text-slate-700 mt-0.5">Records of Processing (RoPA)</div>
          <div className="text-[11px] text-slate-500 mt-2 flex items-center justify-between border-t border-slate-100 pt-2">
            <span>Special Data: {metrics?.ropa?.special_category_count || 1}</span>
            <span>Cross-border: {metrics?.ropa?.cross_border_count || 1}</span>
          </div>
        </div>

        {/* DPIA Metric */}
        <div 
          onClick={() => onNavigate('dpia')}
          className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-slate-300 transition-all cursor-pointer shadow-xs group"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 border border-blue-200 flex items-center justify-center">
              <i className="fa-solid fa-shield-halved text-base"></i>
            </div>
            <span className="text-xs font-mono font-semibold text-slate-500">
              {metrics?.dpia?.signed_off || 1} Signed-off
            </span>
          </div>
          <div className="text-2xl font-extrabold font-mono text-slate-900">{metrics?.dpia?.total || 1}</div>
          <div className="text-xs font-bold text-slate-700 mt-0.5">DPIA Impact Assessments</div>
          <div className="text-[11px] text-slate-500 mt-2 flex items-center justify-between border-t border-slate-100 pt-2">
            <span>High Residual Risk:</span>
            <strong className="text-emerald-600 font-mono">0</strong>
          </div>
        </div>

        {/* DSAR Metric */}
        <div 
          onClick={() => onNavigate('dsar')}
          className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-slate-300 transition-all cursor-pointer shadow-xs group"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-700 border border-purple-200 flex items-center justify-center">
              <i className="fa-solid fa-users-viewfinder text-base"></i>
            </div>
            <span className="text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 rounded-full">
              1 Urgent (&lt;7d)
            </span>
          </div>
          <div className="text-2xl font-extrabold font-mono text-slate-900">{metrics?.dsar?.total || 2}</div>
          <div className="text-xs font-bold text-slate-700 mt-0.5">Active DSAR Requests</div>
          <div className="text-[11px] text-slate-500 mt-2 flex items-center justify-between border-t border-slate-100 pt-2">
            <span>Completed to date:</span>
            <strong className="text-slate-700 font-mono">{metrics?.dsar?.completed || 0}</strong>
          </div>
        </div>

        {/* TPRM Vendors Metric */}
        <div 
          onClick={() => onNavigate('vendors')}
          className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-slate-300 transition-all cursor-pointer shadow-xs group"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 border border-teal-200 flex items-center justify-center">
              <i className="fa-solid fa-handshake-simple text-base"></i>
            </div>
            <span className="text-xs font-mono font-semibold text-slate-500">
              {metrics?.vendors?.with_signed_dpa || 2} Signed DPAs
            </span>
          </div>
          <div className="text-2xl font-extrabold font-mono text-slate-900">{metrics?.vendors?.total_processors || 3}</div>
          <div className="text-xs font-bold text-slate-700 mt-0.5">Third-Party Processors</div>
          <div className="text-[11px] text-slate-500 mt-2 flex items-center justify-between border-t border-slate-100 pt-2">
            <span>Missing DPAs:</span>
            <strong className="text-red-600 font-mono">{metrics?.vendors?.missing_dpa_count || 1}</strong>
          </div>
        </div>

      </div>

      {/* 5. Statutory Audit & Remediation Queue */}
      <div className="bg-white border border-slate-200 p-6 rounded-3xl shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">NDPC Statutory Audit & Remediation Queue</h3>
            <p className="text-xs text-slate-600 mt-0.5">Open non-conformities identified during annual DPCO compliance fieldwork.</p>
          </div>
          <button
            onClick={() => onNavigate('audits')}
            className="text-xs font-bold text-emerald-700 hover:text-emerald-900 hover:underline flex items-center gap-1"
          >
            <span>View Full Audit Desk</span>
            <i className="fa-solid fa-arrow-right text-[10px]"></i>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl">
            <div className="text-[11px] text-slate-500 font-semibold">Open Non-Conformities</div>
            <div className="text-xl font-bold font-mono text-slate-900 mt-1">1</div>
            <div className="text-[11px] text-amber-700 font-medium mt-1">Requiring remediation before filing</div>
          </div>

          <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl">
            <div className="text-[11px] text-slate-500 font-semibold">Critical / High Severity</div>
            <div className="text-xl font-bold font-mono text-red-600 mt-1">1</div>
            <div className="text-[11px] text-slate-600 mt-1">DPA execution with SMS provider</div>
          </div>

          <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl">
            <div className="text-[11px] text-slate-500 font-semibold">DPCO Audit Certification Status</div>
            <div className="text-sm font-bold text-slate-900 mt-1 flex items-center gap-1.5">
              <i className="fa-solid fa-building-columns text-purple-600"></i>
              <span>Vanguard Compliance Partners</span>
            </div>
            <div className="text-[11px] text-emerald-700 font-semibold mt-1">Fieldwork 78.5% Complete</div>
          </div>
        </div>
      </div>

    </div>
  );
}
