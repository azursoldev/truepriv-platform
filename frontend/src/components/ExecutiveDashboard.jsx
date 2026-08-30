import React from 'react';
import { 
  ShieldCheck, 
  AlertTriangle, 
  Clock, 
  Flame, 
  Users, 
  FileSpreadsheet, 
  ClipboardCheck, 
  CheckCircle2, 
  ArrowRight,
  TrendingUp,
  Sparkles,
  ExternalLink
} from 'lucide-react';

export default function ExecutiveDashboard({ metrics, onNavigate, onAutoFillRopa }) {
  const score = metrics?.compliance_gauge?.score || 78.5;
  const circumference = 2 * Math.PI * 46;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  const scoreColor = score >= 80 ? '#10b981' : score >= 50 ? '#f59e0b' : '#ef4444';

  return (
    <div className="space-y-6">
      {/* Top Banner Alert if active breaches or urgent DSARs */}
      {metrics?.breaches?.active_72h_clocks > 0 && (
        <div className="glass-panel-danger p-4 rounded-2xl flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-red-950/80 border border-red-800 text-red-400 rounded-xl">
              <Flame className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-red-300">Mandatory 72-Hour NDPC Breach Notification Clock Active!</h4>
              <p className="text-xs text-red-200/80">
                You have {metrics.breaches.active_72h_clocks} active breach incident requiring regulatory filing under NDPA Section 40.
              </p>
            </div>
          </div>
          <button 
            onClick={() => onNavigate('breaches')}
            className="px-3.5 py-1.5 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shadow-lg shadow-red-950"
          >
            <span>Open Incident Triage</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Main Grid: Compliance Readiness Gauge & Quick Action Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Card 1: Official NDPA Compliance Readiness Gauge */}
        <div className="glass-panel-glow p-6 rounded-3xl lg:col-span-2 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-brand-500/10 rounded-full blur-3xl -z-10" />
          
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-mono font-bold bg-brand-950 text-brand-400 border border-brand-800/80 px-2.5 py-0.5 rounded-full">
                  🇳🇬 STATUTORY SCORECARD
                </span>
                <span className="text-xs text-slate-400">NDPA 2023 / NDPC Framework</span>
              </div>
              <h2 className="text-2xl font-bold text-white tracking-tight">
                NDPA Compliance Readiness Index
              </h2>
              <p className="text-sm text-slate-300 mt-1 max-w-md">
                Automated evaluation across RoPA coverage, executed DPAs, conducted DPIAs, and resolved statutory audit non-conformities.
              </p>

              <div className="mt-4 flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-1.5 text-xs bg-slate-900/80 border border-slate-800 px-3 py-1.5 rounded-xl">
                  <CheckCircle2 className="w-4 h-4 text-brand-400" />
                  <span className="text-slate-300">Status: <strong>{metrics?.compliance_gauge?.status || 'Substantially Compliant'}</strong></span>
                </div>
                <div className="flex items-center gap-1.5 text-xs bg-slate-900/80 border border-slate-800 px-3 py-1.5 rounded-xl">
                  <Clock className="w-4 h-4 text-amber-400" />
                  <span className="text-slate-300">Next Audit Deadline: <strong>March 15, 2027</strong></span>
                </div>
              </div>
            </div>

            {/* Circular Gauge */}
            <div className="relative flex items-center justify-center flex-shrink-0">
              <svg className="w-36 h-36 transform -rotate-90">
                <circle
                  cx="72"
                  cy="72"
                  r="46"
                  stroke="#1e293b"
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
              <div className="absolute flex flex-col items-center justify-center text-center">
                <span className="text-3xl font-extrabold font-mono text-white tracking-tight">
                  {score}%
                </span>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Readiness
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Card 2: 70-80% Automation Fast-Track Actions */}
        <div className="glass-panel p-6 rounded-3xl flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-4 h-4 text-brand-400" />
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Smart Automation Engine</h3>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Skip blank form fatigue. Apply Nigerian industry templates to auto-draft RoPA, risk matrices, and NDPC statutory audit packs.
            </p>

            <div className="space-y-2 mt-4">
              <button
                onClick={() => onNavigate('ropa')}
                className="w-full text-left p-3 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 transition-all flex items-center justify-between group"
              >
                <div className="flex items-center gap-2.5">
                  <FileSpreadsheet className="w-4 h-4 text-brand-400" />
                  <div>
                    <div className="text-xs font-semibold text-slate-200">1-Click Industry RoPA</div>
                    <div className="text-[10px] text-slate-400">Autofill 15-30 processing items</div>
                  </div>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-white transition-transform group-hover:translate-x-0.5" />
              </button>

              <button
                onClick={() => onNavigate('audits')}
                className="w-full text-left p-3 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 transition-all flex items-center justify-between group"
              >
                <div className="flex items-center gap-2.5">
                  <ClipboardCheck className="w-4 h-4 text-purple-400" />
                  <div>
                    <div className="text-xs font-semibold text-slate-200">NDPC Audit Filing Report</div>
                    <div className="text-[10px] text-slate-400">Generate certified statutory PDF</div>
                  </div>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-white transition-transform group-hover:translate-x-0.5" />
              </button>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
            <span>Principle:</span>
            <span className="font-semibold text-brand-400">Review → Verify → Approve</span>
          </div>
        </div>

      </div>

      {/* 4 Operations Quadrants */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* Quadrant 1: RoPA */}
        <div 
          onClick={() => onNavigate('ropa')}
          className="glass-panel p-5 rounded-2xl cursor-pointer hover:border-brand-500/50 hover:bg-slate-850 transition-all group"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="p-2.5 bg-emerald-950/70 border border-emerald-800/60 text-brand-400 rounded-xl">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <span className="text-xs font-mono font-bold text-slate-400">{metrics?.ropa?.approved || 0}/{metrics?.ropa?.total || 0} Approved</span>
          </div>
          <div className="text-2xl font-bold text-white font-mono">{metrics?.ropa?.total || 0}</div>
          <div className="text-xs font-semibold text-slate-200 mt-0.5">Records of Processing (RoPA)</div>
          <div className="text-[11px] text-slate-400 mt-1 flex items-center justify-between">
            <span>Special Data: {metrics?.ropa?.special_category_data_count || 0}</span>
            <span>Cross-border: {metrics?.ropa?.cross_border_count || 0}</span>
          </div>
        </div>

        {/* Quadrant 2: DPIA Risk */}
        <div 
          onClick={() => onNavigate('dpia')}
          className="glass-panel p-5 rounded-2xl cursor-pointer hover:border-sky-500/50 hover:bg-slate-850 transition-all group"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="p-2.5 bg-sky-950/70 border border-sky-800/60 text-sky-400 rounded-xl">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <span className="text-xs font-mono font-bold text-slate-400">{metrics?.dpia?.approved || 0} Signed-off</span>
          </div>
          <div className="text-2xl font-bold text-white font-mono">{metrics?.dpia?.total || 0}</div>
          <div className="text-xs font-semibold text-slate-200 mt-0.5">DPIA Impact Assessments</div>
          <div className="text-[11px] text-slate-400 mt-1 flex items-center justify-between">
            <span>High Residual Risk:</span>
            <span className="font-bold text-amber-400 font-mono">{metrics?.dpia?.high_residual_risk || 0}</span>
          </div>
        </div>

        {/* Quadrant 3: 30-Day DSAR Pipeline */}
        <div 
          onClick={() => onNavigate('dsar')}
          className="glass-panel p-5 rounded-2xl cursor-pointer hover:border-indigo-500/50 hover:bg-slate-850 transition-all group"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="p-2.5 bg-indigo-950/70 border border-indigo-800/60 text-indigo-400 rounded-xl">
              <Users className="w-5 h-5" />
            </div>
            <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded-full ${
              (metrics?.dsar?.urgent_under_7_days || 0) > 0 ? 'bg-amber-950 text-amber-300 border border-amber-800' : 'text-slate-400'
            }`}>
              {metrics?.dsar?.urgent_under_7_days || 0} Urgent (&lt;7d)
            </span>
          </div>
          <div className="text-2xl font-bold text-white font-mono">{metrics?.dsar?.open_requests || 0}</div>
          <div className="text-xs font-semibold text-slate-200 mt-0.5">Active DSAR Requests</div>
          <div className="text-[11px] text-slate-400 mt-1 flex items-center justify-between">
            <span>Completed to date:</span>
            <span className="font-bold text-brand-400 font-mono">{metrics?.dsar?.completed || 0}</span>
          </div>
        </div>

        {/* Quadrant 4: Vendor & TPRM DPA Status */}
        <div 
          onClick={() => onNavigate('vendors')}
          className="glass-panel p-5 rounded-2xl cursor-pointer hover:border-purple-500/50 hover:bg-slate-850 transition-all group"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="p-2.5 bg-purple-950/70 border border-purple-800/60 text-purple-400 rounded-xl">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <span className="text-xs font-mono font-bold text-slate-400">{metrics?.vendors?.dpa_executed_count || 0} Signed DPAs</span>
          </div>
          <div className="text-2xl font-bold text-white font-mono">{metrics?.vendors?.total_processors || 0}</div>
          <div className="text-xs font-semibold text-slate-200 mt-0.5">Third-Party Processors</div>
          <div className="text-[11px] text-slate-400 mt-1 flex items-center justify-between">
            <span>Missing DPAs:</span>
            <span className="font-bold text-red-400 font-mono">{metrics?.vendors?.missing_dpa_count || 0}</span>
          </div>
        </div>

      </div>

      {/* Statutory GAID Audit Findings & Remediation Section */}
      <div className="glass-panel p-6 rounded-3xl">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-white">NDPC Statutory Audit & Remediation Queue</h3>
            <p className="text-xs text-slate-400">Open non-conformities identified during annual DPCO compliance fieldwork.</p>
          </div>
          <button 
            onClick={() => onNavigate('audits')}
            className="text-xs text-brand-400 hover:text-brand-300 font-semibold flex items-center gap-1"
          >
            <span>View Full Audit Desk</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-2xl">
            <div className="text-xs text-slate-400">Open Non-Conformities</div>
            <div className="text-2xl font-bold text-white mt-1 font-mono">{metrics?.audits?.open_findings || 1}</div>
            <div className="text-[11px] text-amber-400 mt-1">Requiring remediation before filing</div>
          </div>
          <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-2xl">
            <div className="text-xs text-slate-400">Critical / High Severity</div>
            <div className="text-2xl font-bold text-red-400 mt-1 font-mono">{metrics?.audits?.critical_high_findings || 1}</div>
            <div className="text-[11px] text-slate-400 mt-1">DPA execution with SMS provider</div>
          </div>
          <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-2xl">
            <div className="text-xs text-slate-400">DPCO Audit Certification Status</div>
            <div className="text-sm font-bold text-purple-300 mt-2 flex items-center gap-1.5">
              <span>🏛️ Vanguard Compliance Partners</span>
            </div>
            <div className="text-[11px] text-brand-400 mt-1">Fieldwork 78.5% Complete</div>
          </div>
        </div>
      </div>

    </div>
  );
}
