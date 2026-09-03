import React, { useState, useRef, useEffect } from 'react';

export default function Header({ 
  user, 
  tenant, 
  accessibleClients, 
  onSwitchTenant, 
  onLogout, 
  onOpenPublicPortal, 
  onOpenOnboarding, 
  onOpenChampions,
  isSidebarCollapsed,
  onToggleSidebar
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
    if (user?.role === 'super_admin') {
      return (
        <span className="inline-flex items-center gap-1 text-[9px] font-bold bg-amber-50 text-amber-900 border border-amber-300 px-1.5 py-0.5 rounded whitespace-nowrap">
          <i className="fa-solid fa-crown text-[8px] text-amber-600"></i> SUPER ADMIN
        </span>
      );
    }

    switch (type) {
      case 'dpco_firm':
        return (
          <span className="inline-flex items-center gap-1 text-[9px] font-bold bg-purple-50 text-purple-700 border border-purple-200 px-1.5 py-0.5 rounded whitespace-nowrap">
            <i className="fa-solid fa-building-columns text-[8px]"></i> DPCO
          </span>
        );
      case 'outsourced_dpo':
        return (
          <span className="inline-flex items-center gap-1 text-[9px] font-bold bg-blue-50 text-blue-700 border border-blue-200 px-1.5 py-0.5 rounded whitespace-nowrap">
            <i className="fa-solid fa-user-shield text-[8px]"></i> DPO
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[9px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 px-1.5 py-0.5 rounded whitespace-nowrap">
            <i className="fa-solid fa-building text-[8px]"></i> MDC
          </span>
        );
    }
  };

  return (
    <header className="h-16 border-b border-slate-200 bg-white px-3 sm:px-5 flex items-center justify-between sticky top-0 z-40 shadow-xs">
      
      {/* 1. Left Brand & Company Identity */}
      <div className="flex items-center gap-2.5 flex-shrink-0">
        {/* Sidebar Toggle Button */}
        <button
          onClick={onToggleSidebar}
          title={isSidebarCollapsed ? "Open Sidebar Menu" : "Close Sidebar Menu"}
          className="w-8 h-8 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 hover:border-slate-300 text-slate-600 hover:text-slate-900 transition-all flex items-center justify-center flex-shrink-0 shadow-2xs"
        >
          <i className={`fa-solid ${isSidebarCollapsed ? 'fa-bars' : 'fa-bars-staggered'} text-xs text-slate-700`}></i>
        </button>

        <div className="relative flex-shrink-0">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-slate-900 flex items-center justify-center text-white shadow-xs">
            <i className="fa-solid fa-shield-halved text-emerald-400 text-base"></i>
          </div>
          <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 bg-emerald-500 border-2 border-white rounded-full"></span>
        </div>

        <div className="flex flex-col justify-center">
          <div className="flex items-center gap-1.5">
            <span className="font-extrabold text-sm sm:text-base text-slate-900 tracking-tight font-sans whitespace-nowrap">TRUEPRIV</span>
            <span className="text-[8px] sm:text-[9px] font-extrabold tracking-wider uppercase bg-emerald-50 text-emerald-800 border border-emerald-200 px-1.5 py-0.2 rounded font-mono whitespace-nowrap">
              NDPA 2023
            </span>
          </div>
          <p className="hidden md:block text-[10px] text-slate-500 font-medium tracking-tight whitespace-nowrap">
            Truepriv Technologies &bull; <span className="text-slate-600 font-mono">truepriv.com</span>
          </p>
        </div>
      </div>

      {/* 2. Right Context & Navigation Group */}
      <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0" ref={dropdownRef}>
        
        {/* Data Residency Indicator Pill (Shown on large screens) */}
        {tenant && (
          <div 
            title="Section 20 Data Localization: Galaxy Backbone Tier-III Sovereign Hosting"
            className="hidden 2xl:flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs whitespace-nowrap flex-shrink-0"
          >
            <span className="relative flex h-2 w-2 flex-shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-slate-500 text-[10px] font-medium">Residency:</span>
            <span className="text-slate-800 text-[10px] font-bold inline-flex items-center gap-1">
              <i className={`fa-solid ${tenant.data_residency === 'global_aws' ? 'fa-cloud text-sky-600' : 'fa-server text-emerald-600'} text-[9px]`}></i>
              <span>{tenant.data_residency === 'global_aws' ? 'AWS Global' : 'Galaxy Sovereign'}</span>
            </span>
          </div>
        )}

        {/* Active Workspace / Client Selector Dropdown */}
        {tenant && (
          <div className="relative flex-shrink-0">
            <button 
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className={`flex items-center gap-2 bg-slate-50 hover:bg-slate-100 border ${
                dropdownOpen ? 'border-emerald-500 ring-2 ring-emerald-500/20 bg-white' : 'border-slate-200'
              } px-2.5 py-1.5 rounded-xl text-left transition-all group`}
            >
              <div className="w-7 h-7 rounded-lg bg-slate-900 flex items-center justify-center text-emerald-400 font-bold text-xs shadow-xs flex-shrink-0">
                {tenant.name.substring(0, 2).toUpperCase()}
              </div>

              <div className="hidden md:flex flex-col justify-center text-left">
                <div className="text-xs font-bold text-slate-900 leading-tight whitespace-nowrap">
                  {tenant.name}
                </div>
                <div className="flex items-center gap-1.5 text-[10px] text-slate-500 leading-tight mt-0.5 whitespace-nowrap">
                  <span>{tenant.industry || 'Fintech & Payment Service Providers'}</span>
                  <span>&bull;</span>
                  {getTenantTypeBadge(tenant.type)}
                </div>
              </div>

              {accessibleClients && accessibleClients.length > 0 && (
                <i className={`fa-solid fa-chevron-down text-[9px] text-slate-400 group-hover:text-slate-700 transition-transform duration-200 ${
                  dropdownOpen ? 'rotate-180' : ''
                }`}></i>
              )}
            </button>

            {/* Client Workspaces Dropdown */}
            {dropdownOpen && accessibleClients && accessibleClients.length > 0 && (
              <div className="absolute right-0 mt-2 w-72 bg-white border border-slate-200 rounded-2xl shadow-xl py-2 z-50 animate-in fade-in slide-in-from-top-2">
                <div className="px-3 py-1.5 border-b border-slate-100 flex items-center justify-between text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  <span>Switch Client Workspace</span>
                  <span className="text-emerald-600 font-mono">{accessibleClients.length} Clients</span>
                </div>

                <div className="max-h-60 overflow-y-auto py-1 divide-y divide-slate-100">
                  {accessibleClients.map((client) => {
                    const isCurrent = client.client_id === tenant.id;
                    return (
                      <button
                        key={client.client_id}
                        onClick={() => {
                          onSwitchTenant(client.client_id);
                          setDropdownOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2 flex items-center justify-between hover:bg-slate-50 transition-colors ${
                          isCurrent ? 'bg-emerald-50/70 border-l-2 border-emerald-600' : ''
                        }`}
                      >
                        <div>
                          <div className="text-xs font-semibold text-slate-900 whitespace-nowrap">{client.name}</div>
                          <div className="text-[10px] text-slate-500 flex items-center gap-1.5 mt-0.5 whitespace-nowrap">
                            <span>{client.industry}</span>
                            <span>&bull;</span>
                            <span className="text-emerald-700 font-mono font-semibold">{client.compliance_score}%</span>
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
        <div className="flex items-center bg-slate-100/90 border border-slate-200 p-0.5 rounded-xl shadow-2xs gap-0.5 flex-shrink-0">
          {/* NDPA Wizard */}
          <button
            onClick={onOpenOnboarding}
            title="Run NDPA Readiness & MDC Tier Calculator"
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-bold text-emerald-900 hover:text-emerald-950 hover:bg-white rounded-lg transition-all shadow-2xs whitespace-nowrap"
          >
            <i className="fa-solid fa-scale-balanced text-emerald-600 text-xs"></i>
            <span className="hidden sm:inline">NDPA Wizard</span>
          </button>

          {/* Department Champions */}
          <button
            onClick={onOpenChampions}
            title="Invite Department Champions (HR, IT, Finance)"
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-bold text-purple-900 hover:text-purple-950 hover:bg-white rounded-lg transition-all shadow-2xs whitespace-nowrap"
          >
            <i className="fa-solid fa-users text-purple-600 text-xs"></i>
            <span className="hidden sm:inline">Champions</span>
          </button>

          {/* Public DSAR */}
          <button
            onClick={onOpenPublicPortal}
            title="Open Hosted DSAR Self-Service Portal"
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-bold text-sky-900 hover:text-sky-950 hover:bg-white rounded-lg transition-all shadow-2xs whitespace-nowrap"
          >
            <i className="fa-solid fa-globe text-sky-600 text-xs"></i>
            <span className="hidden sm:inline">Public DSAR</span>
          </button>
        </div>

        {/* 4. User Profile & Guaranteed-Visible Logout */}
        <div className="flex items-center gap-1.5 pl-1 sm:pl-2 border-l border-slate-200 flex-shrink-0">
          
          {/* User Badge with Full Name & Role */}
          <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-slate-50 border border-slate-200 whitespace-nowrap flex-shrink-0">
            <div className="w-7 h-7 rounded-lg bg-slate-900 flex items-center justify-center font-bold text-xs text-white flex-shrink-0">
              {user?.name ? user.name.substring(0, 2).toUpperCase() : 'TU'}
            </div>
            <div className="hidden lg:flex flex-col justify-center text-left">
              <div className="text-xs font-bold text-slate-900 leading-tight whitespace-nowrap">
                {user?.name || 'System Administrator'}
              </div>
              <div className="text-[9px] text-slate-500 capitalize font-semibold leading-tight mt-0.5 whitespace-nowrap">
                {user?.role?.replace(/_/g, ' ') || 'Super Admin'}
              </div>
            </div>
          </div>

          {/* Guaranteed Visible Logout Button */}
          <button 
            onClick={onLogout}
            title="Sign Out of Session"
            className="w-8 h-8 rounded-xl bg-slate-50 hover:bg-red-50 border border-slate-200 hover:border-red-200 text-slate-600 hover:text-red-600 transition-all flex items-center justify-center flex-shrink-0"
          >
            <i className="fa-solid fa-arrow-right-from-bracket text-xs"></i>
          </button>

        </div>

      </div>
    </header>
  );
}
