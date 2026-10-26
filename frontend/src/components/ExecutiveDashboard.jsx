import React from 'react';

export default function ExecutiveDashboard({
  metrics,
  userRole,
  tenantType,
  tenant,
  onNavigate,
  onOpenTour,
}) {
  const isSuperAdmin = userRole === 'super_admin';
  const tenantName = tenant?.name || 'DPCO TEST ACCOUNT';

  const sourceRecordsCount = metrics?.summary?.total_ropa_activities ?? 1;
  const preparedDraftsCount = metrics?.summary?.pending_drafts ?? 1;
  const factsReusedCount = metrics?.summary?.reused_facts ?? 4;
  const needsDecisionCount = metrics?.summary?.decisions_needed ?? 1;

  return (
    <div className="space-y-6 animate-in fade-in pb-10">
      
      {/* 1. Four Top Metric Cards (Matches Screenshot Pixel-by-Pixel) */}
      <div id="tour-metric-cards" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: Source records */}
        <div id="tour-metric-source" className="p-5 bg-white border border-slate-200/90 rounded-2xl shadow-2xs hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Source records</span>
            <i className="fa-solid fa-database text-slate-400 text-sm"></i>
          </div>
          <div className="text-3xl font-extrabold text-slate-900 mt-2 tracking-tight">
            {sourceRecordsCount}
          </div>
          <div className="text-[11px] text-slate-400 mt-1.5 font-normal">
            Current visible workspace
          </div>
        </div>

        {/* Card 2: Prepared drafts */}
        <div id="tour-metric-drafts" className="p-5 bg-white border border-slate-200/90 rounded-2xl shadow-2xs hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Prepared drafts</span>
            <i className="fa-solid fa-bolt text-slate-400 text-sm"></i>
          </div>
          <div className="text-3xl font-extrabold text-slate-900 mt-2 tracking-tight">
            {preparedDraftsCount}
          </div>
          <div className="text-[11px] text-slate-400 mt-1.5 font-normal">
            Current visible workspace
          </div>
        </div>

        {/* Card 3: Facts reused */}
        <div id="tour-metric-facts" className="p-5 bg-white border border-slate-200/90 rounded-2xl shadow-2xs hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Facts reused</span>
            <i className="fa-solid fa-link text-slate-400 text-sm"></i>
          </div>
          <div className="text-3xl font-extrabold text-slate-900 mt-2 tracking-tight">
            {factsReusedCount}
          </div>
          <div className="text-[11px] text-slate-400 mt-1.5 font-normal">
            Populated fields in generated records
          </div>
        </div>

        {/* Card 4: Needs a decision */}
        <div id="tour-metric-decisions" className="p-5 bg-white border border-slate-200/90 rounded-2xl shadow-2xs hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Needs a decision</span>
            <i className="fa-solid fa-check text-slate-400 text-sm"></i>
          </div>
          <div className="text-3xl font-extrabold text-slate-900 mt-2 tracking-tight">
            {needsDecisionCount}
          </div>
          <div className="text-[11px] text-slate-400 mt-1.5 font-normal">
            Current visible workspace
          </div>
        </div>

      </div>

      {/* 2. Main 2-Column Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column: Your decision queue */}
        <div id="tour-decision-queue" className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-base font-bold text-slate-900">Your decision queue</h2>
            <button 
              id="tour-decision-allwork"
              onClick={() => onNavigate('work')}
              className="text-xs font-semibold text-[#ea580c] hover:text-[#c2410c] hover:underline transition-all cursor-pointer"
            >
              All work
            </button>
          </div>

          {/* Primary Decision Card matching screenshot */}
          <div 
            id="tour-decision-card"
            onClick={() => onNavigate('contracts')}
            className="p-4 bg-white border border-slate-200/90 hover:border-slate-300 rounded-2xl shadow-2xs hover:shadow-xs transition-all cursor-pointer flex items-center justify-between gap-4 group"
          >
            <div className="flex items-start gap-3.5">
              <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500 flex-shrink-0 mt-0.5 group-hover:bg-orange-50 group-hover:text-orange-600 transition-colors">
                <i className="fa-regular fa-file-lines text-base"></i>
              </div>
              <div className="space-y-1">
                <div className="text-xs font-bold text-slate-900 group-hover:text-orange-600 transition-colors">
                  Policies · {tenantName}
                </div>
                <div className="text-xs font-semibold text-amber-700">
                  2 missing answers · 4 facts reused
                </div>
                <p className="text-xs text-slate-500 leading-relaxed max-w-lg">
                  Prepare an internal programme summary from the organisation profile and current inventory. This is not an approved privacy notice.
                </p>
              </div>
            </div>
            <i className="fa-solid fa-chevron-right text-xs text-slate-400 group-hover:text-slate-700 transition-colors flex-shrink-0"></i>
          </div>


        </div>

        {/* Right Column: One source, connected outputs */}
        <div id="tour-connected-outputs" className="lg:col-span-5">
          <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-2xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900">
              One source, connected outputs
            </h3>

            <div className="space-y-3.5">
              
              {/* Output 1: Vendor -> VRA */}
              <div 
                id="tour-output-vendor"
                onClick={() => onNavigate('vendors')}
                className="flex items-start gap-3 p-2 rounded-xl hover:bg-slate-50 cursor-pointer transition-colors"
              >
                <div className="w-7 h-7 rounded-lg bg-slate-100 text-slate-500 flex items-center justify-center text-xs flex-shrink-0 mt-0.5">
                  <i className="fa-solid fa-bolt"></i>
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900">
                    Vendor → VRA
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                    Reuses linked systems, services and data categories.
                  </div>
                </div>
              </div>

              {/* Output 2: Activity -> DPIA / LIA */}
              <div 
                id="tour-output-activity"
                onClick={() => onNavigate('processing')}
                className="flex items-start gap-3 p-2 rounded-xl hover:bg-slate-50 cursor-pointer transition-colors"
              >
                <div className="w-7 h-7 rounded-lg bg-slate-100 text-slate-500 flex items-center justify-center text-xs flex-shrink-0 mt-0.5">
                  <i className="fa-solid fa-bolt"></i>
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900">
                    Activity → DPIA / LIA
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                    Sensitive processing signals prepare DPIA candidates. Legitimate interests prepares an LIA.
                  </div>
                </div>
              </div>

              {/* Output 3: Transfer -> TIA */}
              <div 
                id="tour-output-transfer"
                onClick={() => onNavigate('transfers')}
                className="flex items-start gap-3 p-2 rounded-xl hover:bg-slate-50 cursor-pointer transition-colors"
              >
                <div className="w-7 h-7 rounded-lg bg-slate-100 text-slate-500 flex items-center justify-center text-xs flex-shrink-0 mt-0.5">
                  <i className="fa-solid fa-bolt"></i>
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900">
                    Transfer → TIA
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                    A different destination country prepares a transfer assessment candidate.
                  </div>
                </div>
              </div>

              {/* Output 4: Request -> response task */}
              <div 
                id="tour-output-request"
                onClick={() => onNavigate('work')}
                className="flex items-start gap-3 p-2 rounded-xl hover:bg-slate-50 cursor-pointer transition-colors"
              >
                <div className="w-7 h-7 rounded-lg bg-slate-100 text-slate-500 flex items-center justify-center text-xs flex-shrink-0 mt-0.5">
                  <i className="fa-solid fa-bolt"></i>
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900">
                    Request → response task
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                    Keeps the source request linked to its response work.
                  </div>
                </div>
              </div>

              {/* Output 5: Incident -> triage task */}
              <div 
                id="tour-output-incident"
                onClick={() => onNavigate('work')}
                className="flex items-start gap-3 p-2 rounded-xl hover:bg-slate-50 cursor-pointer transition-colors"
              >
                <div className="w-7 h-7 rounded-lg bg-slate-100 text-slate-500 flex items-center justify-center text-xs flex-shrink-0 mt-0.5">
                  <i className="fa-solid fa-bolt"></i>
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900">
                    Incident → triage task
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                    Prepares containment and notification review work.
                  </div>
                </div>
              </div>

            </div>

            {/* Subtle disclaimer note */}
            <div id="tour-output-disclaimer" className="pt-3 border-t border-slate-100 text-[11px] text-slate-400 leading-relaxed">
              Screening rules identify work to review. They do not make final legal decisions.
            </div>

          </div>
        </div>

      </div>

    </div>
  );
}
