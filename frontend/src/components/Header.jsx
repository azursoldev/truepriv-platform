import React, { useState, useRef, useEffect } from 'react';

export default function Header({ 
  user, 
  tenant, 
  accessibleClients, 
  onSwitchTenant, 
  onLogout, 
  onOpenPublicPortal, 
  onOpenOnboarding, 
  onOpenChampions 
}) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getTenantTypeBadge = (type) => {
    switch (type) {
      case 'dpco_firm':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-semibold bg-purple-50 text-purple-700 border border-purple-200 px-2 py-0.5 rounded-full">
            <i className="fa-solid fa-building-columns text-[9px]"></i> DPCO Firm
          </span>
        );
      case 'outsourced_dpo':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-semibold bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded-full">
            <i className="fa-solid fa-user-shield text-[9px]"></i> Outsourced DPO
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full">
            <i className="fa-solid fa-building text-[9px]"></i> Corporate MDC
          </span>
        );
    }
  };

  return (
    <header className="h-16 border-b border-slate-200 bg-white px-4 sm:px-6 flex items-center justify-between sticky top-0 z-40 shadow-xs">
      
      {/* 1. Left Brand & Company Identity */}
      <div className="flex items-center gap-3.5">
        <div className="relative flex-shrink-0">
          <div className="w-9 h-9 rounded-xl bg-slate-900 flex items-center justify-center text-white shadow-sm">
            <i className="fa-solid fa-shield-halved text-emerald-400 text-lg"></i>
          </div>
          <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 border-2 border-white rounded-full"></span>
        </div>

        <div>
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-base text-slate-900 tracking-tight font-sans">TRUEPRIV</span>
            <span className="text-[9px] font-extrabold tracking-widest uppercase bg-emerald-50 text-emerald-700 border border-emerald-200 px-1.5 py-0.2 rounded font-mono">
              NDPA 2023
            </span>
          </div>
          <p className="text-[11px] text-slate-500 font-medium tracking-tight">
            Truepriv Technologies Limited &bull; <span className="text-slate-600 font-mono">truepriv.com</span>
          </p>
        </div>
      </div>

      {/* 2. Right Context & Navigation Group */}
      <div className="flex items-center gap-2 sm:gap-3" ref={dropdownRef}>
        
        {/* Data Residency Indicator Pill */}
        {tenant && (
          <div 
            title="Section 20 Data Localization: Galaxy Backbone Tier-III Sovereign Hosting"
            className="hidden xl:flex items-center gap-2 px-3 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-xs transition-all"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-slate-500 text-[11px] font-medium">Residency:</span>
            <span className="text-slate-800 text-[11px] font-semibold tracking-tight">
              {tenant.data_residency === 'global_aws' ? '☁️ AWS eu-west-1' : '🇳🇬 Galaxy Backbone'}
            </span>
          </div>
        )}

        {/* Active Workspace / Client Selector Dropdown */}
        {tenant && (
          <div className="relative">
            <button 
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className={`flex items-center gap-2.5 bg-slate-50 hover:bg-slate-100 border ${
                dropdownOpen ? 'border-emerald-500 ring-2 ring-emerald-500/20 bg-white' : 'border-slate-200'
              } px-3 py-1.5 rounded-xl text-left transition-all group`}
            >
              <div className="w-7 h-7 rounded-lg bg-slate-900 flex items-center justify-center text-emerald-400 font-bold text-xs shadow-xs">
                {tenant.name.substring(0, 2).toUpperCase()}
              </div>

              <div className="hidden md:block max-w-[210px] text-left">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-slate-900 truncate">{tenant.name}</span>
                </div>
                <div className="flex items-center gap-1.5 text-[10px] text-slate-500">
                  <span className="truncate max-w-[120px]">{tenant.industry || 'Financial Services'}</span>
                  <span>&bull;</span>
                  {getTenantTypeBadge(tenant.type)}
                </div>
              </div>

              {accessibleClients && accessibleClients.length > 0 && (
                <i className={`fa-solid fa-chevron-down text-[10px] text-slate-400 group-hover:text-slate-700 transition-transform duration-200 ${
                  dropdownOpen ? 'rotate-180' : ''
                }`}></i>
              )}
            </button>

            {/* Client Workspaces Dropdown */}
            {dropdownOpen && accessibleClients && accessibleClients.length > 0 && (
              <div className="absolute right-0 mt-2 w-80 bg-white border border-slate-200 rounded-2xl shadow-xl py-2 z-50 animate-in fade-in slide-in-from-top-2">
                <div className="px-3.5 py-2 border-b border-slate-100 flex items-center justify-between text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <span>Switch Client Workspace</span>
                  <span className="text-[10px] text-emerald-600 font-mono font-bold">{accessibleClients.length} Clients</span>
                </div>

                <div className="max-h-64 overflow-y-auto py-1 divide-y divide-slate-100">
                  {accessibleClients.map((client) => {
                    const isCurrent = client.client_id === tenant.id;
                    return (
                      <button
                        key={client.client_id}
                        onClick={() => {
                          onSwitchTenant(client.client_id);
                          setDropdownOpen(false);
                        }}
                        className={`w-full text-left px-3.5 py-2.5 flex items-center justify-between hover:bg-slate-50 transition-colors ${
                          isCurrent ? 'bg-emerald-50/60 border-l-2 border-emerald-600' : ''
                        }`}
                      >
                        <div>
                          <div className="text-xs font-semibold text-slate-900">{client.name}</div>
                          <div className="text-[10px] text-slate-500 flex items-center gap-2 mt-0.5">
                            <span>{client.industry}</span>
                            <span>&bull;</span>
                            <span className="text-emerald-700 font-mono font-semibold">{client.compliance_score}% NDPA</span>
                          </div>
                        </div>
                        {isCurrent ? (
                          <i className="fa-solid fa-check text-emerald-600 text-xs"></i>
                        ) : (
                          <i className="fa-solid fa-chevron-right text-slate-300 text-[10px]"></i>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* 3. Action Buttons Segmented Toolbar */}
        <div className="flex items-center bg-slate-100/90 border border-slate-200 p-0.5 rounded-xl shadow-2xs gap-0.5">
          {/* NDPA Wizard */}
          <button
            onClick={onOpenOnboarding}
            title="Run NDPA Readiness & MDC Tier Calculator"
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-800 hover:text-emerald-950 hover:bg-white rounded-lg transition-all shadow-2xs"
          >
            <i className="fa-solid fa-scale-balanced text-emerald-600 text-xs"></i>
            <span className="hidden lg:inline">NDPA Wizard</span>
          </button>

          {/* Department Champions */}
          <button
            onClick={onOpenChampions}
            title="Invite Department Champions (HR, IT, Finance)"
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-purple-800 hover:text-purple-950 hover:bg-white rounded-lg transition-all shadow-2xs"
          >
            <i className="fa-solid fa-users text-purple-600 text-xs"></i>
            <span className="hidden lg:inline">Champions</span>
          </button>

          {/* Public DSAR */}
          <button
            onClick={onOpenPublicPortal}
            title="Open Hosted DSAR Self-Service Portal"
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-sky-800 hover:text-sky-950 hover:bg-white rounded-lg transition-all shadow-2xs"
          >
            <i className="fa-solid fa-globe text-sky-600 text-xs"></i>
            <span className="hidden lg:inline">Public DSAR</span>
          </button>
        </div>

        {/* 4. User Profile & Logout */}
        <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
          <div className="hidden lg:flex items-center gap-2.5 px-2 py-1 rounded-xl bg-slate-50 border border-slate-200/80">
            <div className="w-7 h-7 rounded-lg bg-slate-800 flex items-center justify-center font-bold text-xs text-white">
              {user?.name ? user.name.substring(0, 2).toUpperCase() : 'CU'}
            </div>
            <div className="text-left pr-1">
              <div className="text-xs font-bold text-slate-800 max-w-[110px] truncate leading-tight">
                {user?.name || 'Compliance User'}
              </div>
              <div className="text-[10px] text-slate-500 capitalize font-medium leading-tight">
                {user?.role?.replace(/_/g, ' ') || 'Admin'}
              </div>
            </div>
          </div>

          <button 
            onClick={onLogout}
            title="Sign Out of Session"
            className="p-2 rounded-xl bg-slate-50 hover:bg-red-50 border border-slate-200 hover:border-red-200 text-slate-500 hover:text-red-600 transition-all"
          >
            <i className="fa-solid fa-arrow-right-from-bracket text-xs"></i>
          </button>
        </div>

      </div>
    </header>
  );
}
