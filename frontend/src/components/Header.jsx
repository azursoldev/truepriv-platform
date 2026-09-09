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
  onOpenProfile,
  onOpenAiCopilot,
  onOpenBilling,
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
    <header className="bg-white border-b border-slate-200 px-3 sm:px-6 py-2.5 flex items-center justify-between sticky top-0 z-30 shadow-2xs">
      
      {/* 1. Left: Brand & Sidebar Toggle */}
      <div className="flex items-center gap-2 sm:gap-3">
        <button
          onClick={onToggleSidebar}
          className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
          title={isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <i className="fa-solid fa-bars text-sm"></i>
        </button>

        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-700 flex items-center justify-center text-white font-bold text-sm shadow-2xs">
            <i className="fa-solid fa-shield-halved"></i>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-black tracking-tight text-slate-900">TRUEPRIV</span>
              <span className="text-[9px] font-bold bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded font-mono">
                NDPA 2023
              </span>
            </div>
            <div className="text-[10px] text-slate-400 font-mono leading-none">
              Truepriv Technologies &bull; truepriv.com
            </div>
          </div>
        </div>
      </div>

      {/* 2. Middle: Active Workspace Selector */}
      <div className="flex items-center gap-2 sm:gap-3">
        {tenant && (
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => accessibleClients.length > 1 && setDropdownOpen(!dropdownOpen)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border transition-all text-left ${
                accessibleClients.length > 1
                  ? 'bg-slate-50 hover:bg-slate-100 border-slate-300 cursor-pointer shadow-2xs'
                  : 'bg-slate-50/50 border-slate-200 cursor-default'
              }`}
            >
              <div className="w-6 h-6 rounded-lg bg-slate-900 text-white text-[10px] font-bold flex items-center justify-center font-mono">
                {tenant.name?.substring(0, 2).toUpperCase() || 'TP'}
              </div>
              <div className="hidden md:block">
                <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <span className="truncate max-w-[160px]">{tenant.name}</span>
                  {accessibleClients.length > 1 && (
                    <i className="fa-solid fa-chevron-down text-[10px] text-slate-400"></i>
                  )}
                </div>
                <div className="text-[10px] text-slate-500 flex items-center gap-1 mt-0.2">
                  <span>{tenant.industry || 'Compliance Workspace'}</span>
                  <span>&bull;</span>
                  {getTenantTypeBadge(tenant.type)}
                </div>
              </div>
            </button>

            {/* Dropdown Menu */}
            {dropdownOpen && accessibleClients.length > 1 && (
              <div className="absolute top-full left-0 mt-2 w-72 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 overflow-hidden animate-in fade-in duration-100">
                <div className="p-2.5 bg-slate-50 border-b border-slate-100 text-[11px] font-bold text-slate-700 flex items-center justify-between">
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
          
          {/* TruePriv AI Agent (Marquee Trigger) */}
          <button
            onClick={onOpenAiCopilot}
            title="Open TruePriv Autonomous Privacy AI Agent"
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-extrabold text-sky-900 hover:text-sky-950 bg-sky-50 hover:bg-white border border-sky-200/80 rounded-lg transition-all shadow-2xs whitespace-nowrap"
          >
            <span className="w-2 h-2 rounded-full bg-sky-500 animate-pulse"></span>
            <i className="fa-solid fa-brain text-sky-600 text-xs"></i>
            <span>TruePriv AI Agent</span>
          </button>

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
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-bold text-slate-700 hover:text-slate-900 hover:bg-white rounded-lg transition-all shadow-2xs whitespace-nowrap"
          >
            <i className="fa-solid fa-globe text-slate-500 text-xs"></i>
            <span className="hidden sm:inline">Public DSAR</span>
          </button>

          {/* Milestone 2: Subscription & Paystack Billing */}
          {onOpenBilling && (
            <button
              onClick={onOpenBilling}
              title="Manage Plan & Statutory Compliance Entitlements"
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-bold text-amber-900 hover:text-amber-950 bg-amber-50 hover:bg-amber-100/80 border border-amber-300/80 rounded-lg transition-all shadow-2xs whitespace-nowrap cursor-pointer"
            >
              <i className="fa-solid fa-crown text-amber-600 text-xs"></i>
              <span className="hidden sm:inline">Plan & Billing</span>
            </button>
          )}
        </div>

        {/* 4. User Profile & Guaranteed-Visible Logout */}
        <div className="flex items-center gap-1.5 pl-1 sm:pl-2 border-l border-slate-200 flex-shrink-0">
          
          {/* User Badge with Full Name & Role (Click to Edit Profile) */}
          <button
            onClick={onOpenProfile}
            title="Click to Edit My Profile & Account Settings"
            className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 hover:border-slate-300 border border-slate-200 whitespace-nowrap flex-shrink-0 transition-all cursor-pointer group text-left"
          >
            {user?.avatar_url ? (
              <img
                src={user.avatar_url}
                alt={user.name}
                className="w-7 h-7 rounded-lg object-cover border border-emerald-500/50 flex-shrink-0"
              />
            ) : (
              <div className="w-7 h-7 rounded-lg bg-slate-900 group-hover:bg-emerald-700 flex items-center justify-center font-bold text-xs text-white flex-shrink-0 transition-colors">
                {user?.name ? user.name.substring(0, 2).toUpperCase() : 'TU'}
              </div>
            )}
            <div className="hidden lg:flex flex-col justify-center text-left">
              <div className="text-xs font-bold text-slate-900 leading-tight whitespace-nowrap group-hover:text-emerald-700 transition-colors">
                {user?.name || 'System Administrator'}
              </div> 
              <div className="text-[9px] text-slate-500 capitalize font-semibold leading-tight mt-0.5 whitespace-nowrap">
                {user?.role?.replace(/_/g, ' ') || 'Super Admin'}
              </div>
            </div>
          </button>

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
