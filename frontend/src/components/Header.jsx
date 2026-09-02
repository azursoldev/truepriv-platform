import React, { useState, useRef, useEffect } from 'react';
import { 
  Shield, 
  Building2, 
  User, 
  ChevronDown, 
  Check, 
  LogOut, 
  Globe, 
  Scale, 
  Users,
  Sparkles,
  Server,
  Layers,
  ChevronRight
} from 'lucide-react';

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
  const [residencyDropdownOpen, setResidencyDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
        setResidencyDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getTenantTypeBadge = (type) => {
    switch (type) {
      case 'dpco_firm':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-semibold bg-purple-500/10 text-purple-400 border border-purple-500/20 px-2 py-0.5 rounded-full">
            🏛️ DPCO Firm
          </span>
        );
      case 'outsourced_dpo':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2 py-0.5 rounded-full">
            🛡️ Outsourced DPO
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full">
            🏢 Corporate MDC
          </span>
        );
    }
  };

  return (
    <header className="h-16 border-b border-slate-800/80 bg-slate-950/90 backdrop-blur-xl px-4 sm:px-6 flex items-center justify-between sticky top-0 z-40 transition-all">
      
      {/* 1. Left Brand & Company Identity */}
      <div className="flex items-center gap-3.5">
        <div className="relative flex-shrink-0">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 via-brand-500 to-teal-400 p-[1px] shadow-md shadow-brand-950/50">
            <div className="w-full h-full bg-slate-950 rounded-[11px] flex items-center justify-center">
              <Shield className="w-4.5 h-4.5 text-brand-400" />
            </div>
          </div>
          <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 border-2 border-slate-950 rounded-full"></span>
        </div>

        <div>
          <div className="flex items-center gap-2">
            <span className="font-black text-base text-white tracking-wider font-mono">TRUEPRIV</span>
            <span className="text-[9px] font-extrabold tracking-widest uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 px-1.5 py-0.2 rounded font-mono">
              NDPA 2023
            </span>
          </div>
          <p className="text-[11px] text-slate-400 font-medium tracking-tight">
            Truepriv Technologies Limited &bull; <span className="text-slate-400 font-mono">truepriv.com</span>
          </p>
        </div>
      </div>

      {/* 2. Right Context & Navigation Group */}
      <div className="flex items-center gap-2 sm:gap-3" ref={dropdownRef}>
        
        {/* Data Residency Indicator Pill */}
        {tenant && (
          <div 
            title="Section 20 Data Localization: Galaxy Backbone Tier-III Sovereign Hosting"
            className="hidden xl:flex items-center gap-2 px-3 py-1.5 bg-slate-900/90 hover:bg-slate-900 border border-slate-800 hover:border-slate-700/80 rounded-xl text-xs transition-all shadow-inner"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-slate-400 text-[11px] font-medium">Residency:</span>
            <span className="text-emerald-400 text-[11px] font-semibold tracking-tight">
              {tenant.data_residency === 'global_aws' ? '☁️ AWS eu-west-1' : '🇳🇬 Galaxy Backbone'}
            </span>
          </div>
        )}

        {/* Active Workspace / Client Selector Dropdown */}
        {tenant && (
          <div className="relative">
            <button 
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className={`flex items-center gap-2.5 bg-slate-900/90 hover:bg-slate-800/80 border ${
                dropdownOpen ? 'border-brand-500/60 ring-2 ring-brand-500/20' : 'border-slate-800 hover:border-slate-700'
              } px-3 py-1.5 rounded-xl text-left transition-all group`}
            >
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700/70 flex items-center justify-center text-brand-400 font-bold text-xs shadow-inner">
                {tenant.name.substring(0, 2).toUpperCase()}
              </div>

              <div className="hidden md:block max-w-[210px] text-left">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-white truncate">{tenant.name}</span>
                </div>
                <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
                  <span className="truncate max-w-[120px]">{tenant.industry || 'Financial Services'}</span>
                  <span>&bull;</span>
                  {getTenantTypeBadge(tenant.type)}
                </div>
              </div>

              {accessibleClients && accessibleClients.length > 0 && (
                <ChevronDown className={`w-3.5 h-3.5 text-slate-400 group-hover:text-white transition-transform duration-200 ${
                  dropdownOpen ? 'rotate-180' : ''
                }`} />
              )}
            </button>

            {/* Client Workspaces Dropdown */}
            {dropdownOpen && accessibleClients && accessibleClients.length > 0 && (
              <div className="absolute right-0 mt-2 w-80 bg-slate-900/95 backdrop-blur-xl border border-slate-700/90 rounded-2xl shadow-2xl py-2 z-50 animate-in fade-in slide-in-from-top-2">
                <div className="px-3.5 py-2 border-b border-slate-800/80 flex items-center justify-between text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  <span>Switch Client Workspace</span>
                  <span className="text-[10px] text-brand-400 font-mono">{accessibleClients.length} Clients</span>
                </div>

                <div className="max-h-64 overflow-y-auto py-1 divide-y divide-slate-800/40">
                  {accessibleClients.map((client) => {
                    const isCurrent = client.client_id === tenant.id;
                    return (
                      <button
                        key={client.client_id}
                        onClick={() => {
                          onSwitchTenant(client.client_id);
                          setDropdownOpen(false);
                        }}
                        className={`w-full text-left px-3.5 py-2.5 flex items-center justify-between hover:bg-slate-800/60 transition-colors ${
                          isCurrent ? 'bg-brand-950/40 border-l-2 border-brand-500' : ''
                        }`}
                      >
                        <div>
                          <div className="text-xs font-semibold text-white">{client.name}</div>
                          <div className="text-[10px] text-slate-400 flex items-center gap-2 mt-0.5">
                            <span>{client.industry}</span>
                            <span>&bull;</span>
                            <span className="text-emerald-400 font-mono font-semibold">{client.compliance_score}% NDPA</span>
                          </div>
                        </div>
                        {isCurrent ? (
                          <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                        ) : (
                          <ChevronRight className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
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
        <div className="flex items-center bg-slate-900/80 border border-slate-800/90 p-0.5 rounded-xl shadow-inner gap-0.5">
          {/* NDPA Wizard */}
          <button
            onClick={onOpenOnboarding}
            title="Run NDPA Readiness & MDC Tier Calculator"
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-300 hover:text-white hover:bg-emerald-950/50 rounded-lg transition-all"
          >
            <Scale className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden lg:inline">NDPA Wizard</span>
          </button>

          {/* Department Champions */}
          <button
            onClick={onOpenChampions}
            title="Invite Department Champions (HR, IT, Finance)"
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-purple-300 hover:text-white hover:bg-purple-950/50 rounded-lg transition-all"
          >
            <Users className="w-3.5 h-3.5 text-purple-400" />
            <span className="hidden lg:inline">Champions</span>
          </button>

          {/* Public DSAR */}
          <button
            onClick={onOpenPublicPortal}
            title="Open Hosted DSAR Self-Service Portal"
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-sky-300 hover:text-white hover:bg-sky-950/50 rounded-lg transition-all"
          >
            <Globe className="w-3.5 h-3.5 text-sky-400" />
            <span className="hidden lg:inline">Public DSAR</span>
          </button>
        </div>

        {/* 4. User Profile & Logout */}
        <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
          <div className="hidden lg:flex items-center gap-2.5 px-2 py-1 rounded-xl bg-slate-900/40 border border-slate-800/60">
            <div className="w-7 h-7 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-xs text-slate-200">
              {user?.name ? user.name.substring(0, 2).toUpperCase() : 'CU'}
            </div>
            <div className="text-left pr-1">
              <div className="text-xs font-bold text-slate-100 max-w-[110px] truncate leading-tight">
                {user?.name || 'Compliance User'}
              </div>
              <div className="text-[10px] text-slate-400 capitalize font-medium leading-tight">
                {user?.role?.replace(/_/g, ' ') || 'Admin'}
              </div>
            </div>
          </div>

          <button 
            onClick={onLogout}
            title="Sign Out of Session"
            className="p-2 rounded-xl bg-slate-900 hover:bg-red-950/50 border border-slate-800 hover:border-red-800/60 text-slate-400 hover:text-red-400 transition-all"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>

      </div>
    </header>
  );
}
