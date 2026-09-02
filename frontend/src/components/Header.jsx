import React, { useState } from 'react';
import { Shield, Building2, User, ChevronDown, Check, LogOut, Globe, AlertTriangle, Clock } from 'lucide-react';

export default function Header({ user, tenant, accessibleClients, onSwitchTenant, onLogout, onOpenPublicPortal }) {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const getTenantTypeBadge = (type) => {
    switch (type) {
      case 'dpco_firm':
        return <span className="text-xs bg-purple-950/80 text-purple-300 border border-purple-800/60 px-2.5 py-0.5 rounded-full font-medium flex items-center gap-1">🏛️ Licensed DPCO Firm</span>;
      case 'outsourced_dpo':
        return <span className="text-xs bg-blue-950/80 text-blue-300 border border-blue-800/60 px-2.5 py-0.5 rounded-full font-medium flex items-center gap-1">🛡️ Outsourced DPO Firm</span>;
      default:
        return <span className="text-xs bg-emerald-950/80 text-emerald-300 border border-emerald-800/60 px-2.5 py-0.5 rounded-full font-medium flex items-center gap-1">🏢 Corporate Data Controller</span>;
    }
  };

  return (
    <header className="h-16 border-b border-slate-800 bg-slate-900/90 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-30">
      {/* Brand Logo & Name */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-700 via-brand-500 to-emerald-400 p-0.5 shadow-lg shadow-brand-900/30 flex items-center justify-center">
          <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
            <Shield className="w-5 h-5 text-brand-400" />
          </div>
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-lg text-white tracking-tight">TRUEPRIV</span>
            <span className="text-[10px] bg-brand-900/80 text-brand-300 border border-brand-700/50 px-1.5 py-0.5 rounded font-mono font-bold tracking-wider">NDPA 2023</span>
          </div>
          <p className="text-[11px] text-slate-400 -mt-0.5">Truepriv Technologies Limited &bull; truepriv.com</p>
        </div>
      </div>

      {/* Active Workspace / Tenant Context Switcher & Infrastructure Badge */}
      <div className="flex items-center gap-3">
        {tenant && (
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-slate-800/80 border border-slate-700/80 rounded-xl text-xs text-slate-300">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-slate-400">Residency:</span>
            <strong className="text-emerald-400 font-semibold">
              {tenant.data_residency === 'global_aws' 
                ? '☁️ Global AWS (eu-west-1)' 
                : '🇳🇬 Local Onshore (Galaxy Backbone)'}
            </strong>
          </div>
        )}

        {tenant && (
          <div className="relative">
            <button 
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-3 bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 hover:border-slate-600 px-3.5 py-1.5 rounded-xl text-left transition-all group"
            >
              <div className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-700 flex items-center justify-center text-brand-400 font-bold text-xs">
                {tenant.name.substring(0, 2).toUpperCase()}
              </div>
              <div className="hidden sm:block">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-white max-w-[200px] truncate">{tenant.name}</span>
                  {getTenantTypeBadge(tenant.type)}
                </div>
                <span className="text-[11px] text-slate-400">{tenant.industry || 'Data Controller'}</span>
              </div>
              {accessibleClients && accessibleClients.length > 0 && (
                <ChevronDown className="w-4 h-4 text-slate-400 group-hover:text-white transition-transform" />
              )}
            </button>

            {/* Switchable Client Organizations Dropdown */}
            {dropdownOpen && accessibleClients && accessibleClients.length > 0 && (
              <div className="absolute right-0 mt-2 w-80 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl py-2 z-50 animate-in fade-in slide-in-from-top-2">
                <div className="px-3 py-2 border-b border-slate-800 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  Switch Client Organization Workspace
                </div>
                <div className="max-h-60 overflow-y-auto py-1">
                  {accessibleClients.map((client) => {
                    const isCurrent = client.client_id === tenant.id;
                    return (
                      <button
                        key={client.client_id}
                        onClick={() => {
                          onSwitchTenant(client.client_id);
                          setDropdownOpen(false);
                        }}
                        className={`w-full text-left px-3.5 py-2.5 flex items-center justify-between hover:bg-slate-800/70 transition-colors ${
                          isCurrent ? 'bg-brand-950/40 border-l-2 border-brand-500' : ''
                        }`}
                      >
                        <div>
                          <div className="text-sm font-medium text-slate-200">{client.name}</div>
                          <div className="text-xs text-slate-400 flex items-center gap-2 mt-0.5">
                            <span>{client.industry}</span>
                            <span>•</span>
                            <span className="text-brand-400 font-mono font-semibold">{client.compliance_score}% NDPA</span>
                          </div>
                        </div>
                        {isCurrent && <Check className="w-4 h-4 text-brand-400" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Public DSAR Portal Launcher */}
        <button
          onClick={onOpenPublicPortal}
          title="Open Hosted Data Subject Access Request (DSAR) Portal"
          className="hidden md:flex items-center gap-1.5 text-xs bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 px-3 py-2 rounded-xl transition-all"
        >
          <Globe className="w-3.5 h-3.5 text-sky-400" />
          <span>Public DSAR Portal</span>
        </button>

        {/* User Profile & Logout */}
        <div className="flex items-center gap-2 pl-3 border-l border-slate-800">
          <div className="text-right hidden lg:block">
            <div className="text-xs font-semibold text-slate-200">{user?.name || 'Compliance User'}</div>
            <div className="text-[10px] text-slate-400 capitalize">{user?.role?.replace(/_/g, ' ') || 'Admin'}</div>
          </div>
          <button 
            onClick={onLogout}
            title="Sign Out"
            className="p-2 rounded-xl bg-slate-800/60 hover:bg-red-950/40 border border-slate-700 hover:border-red-800 text-slate-400 hover:text-red-400 transition-all"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
