import React, { useState, useEffect } from 'react';
import { 
  Briefcase, 
  Building2, 
  CheckCircle2, 
  AlertTriangle, 
  ArrowRight, 
  ShieldCheck, 
  Flame, 
  Users,
  Search,
  ExternalLink
} from 'lucide-react';
import { api } from '../lib/api';

export default function PortfolioDesk({ onSwitchTenant, tenantType }) {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await api.getPortfolioClients();
      if (res.success) {
        setClients(res.clients);
      }
    } catch (err) {
      console.error('Error loading portfolio:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filtered = clients.filter(c => 
    c.client_name.toLowerCase().includes(search.toLowerCase()) ||
    c.industry?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-white tracking-tight">
              {tenantType === 'dpco_firm' ? 'Licensed DPCO Client Audit Portfolio' : 'Outsourced DPO Multi-Client Desk'}
            </h2>
            <span className="text-[11px] bg-purple-950 text-purple-300 border border-purple-800 px-2 py-0.5 rounded font-mono font-bold">
              MULTI-TENANT ISOLATED
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Switch between client corporate workspaces in 1 click with strict data boundary isolation.
          </p>
        </div>

        <div className="text-xs font-mono bg-slate-900 border border-slate-800 px-3.5 py-2 rounded-xl text-slate-300">
          Managing: <strong className="text-brand-400">{clients.length} Client Organizations</strong>
        </div>
      </div>

      {/* Search */}
      <div className="glass-panel p-3.5 rounded-2xl flex items-center gap-2">
        <Search className="w-4 h-4 text-slate-400" />
        <input
          type="text"
          placeholder="Filter client organizations by name or industry..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="bg-transparent border-none text-xs text-white placeholder:text-slate-500 focus:outline-none w-full"
        />
      </div>

      {/* Client Organizations Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {loading ? (
          <div className="col-span-3 py-12 text-center text-slate-400">Loading portfolio organizations...</div>
        ) : filtered.length === 0 ? (
          <div className="col-span-3 glass-panel p-12 text-center rounded-3xl text-slate-400">No matching client organizations found.</div>
        ) : (
          filtered.map((client) => (
            <div 
              key={client.client_tenant_id}
              className="glass-panel p-5 rounded-3xl hover:border-purple-500/50 hover:bg-slate-850/70 transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className="w-9 h-9 rounded-xl bg-slate-900 border border-slate-700 flex items-center justify-center text-purple-400 font-bold text-sm">
                    {client.client_name.substring(0, 2).toUpperCase()}
                  </div>
                  <span className="text-xs font-mono font-bold text-brand-400 bg-brand-950 px-2 py-0.5 rounded border border-brand-800">
                    {client.compliance_score}% NDPA
                  </span>
                </div>

                <h3 className="text-base font-bold text-white tracking-tight group-hover:text-purple-300 transition-colors">
                  {client.client_name}
                </h3>
                <div className="text-xs text-slate-400 mt-0.5">{client.industry}</div>
                <div className="text-[11px] text-slate-500 font-mono mt-1">Ref: {client.contract_ref}</div>

                <div className="grid grid-cols-3 gap-2 my-4 pt-3 border-t border-slate-800/80 text-center">
                  <div className="bg-slate-950/80 p-2 rounded-xl border border-slate-800">
                    <div className="text-[10px] text-slate-400">Breaches</div>
                    <div className={`text-sm font-bold font-mono ${client.active_breaches > 0 ? 'text-red-400 animate-pulse' : 'text-slate-300'}`}>
                      {client.active_breaches}
                    </div>
                  </div>

                  <div className="bg-slate-950/80 p-2 rounded-xl border border-slate-800">
                    <div className="text-[10px] text-slate-400">Open DSARs</div>
                    <div className="text-sm font-bold font-mono text-slate-300">
                      {client.open_dsars}
                    </div>
                  </div>

                  <div className="bg-slate-950/80 p-2 rounded-xl border border-slate-800">
                    <div className="text-[10px] text-slate-400">Findings</div>
                    <div className="text-sm font-bold font-mono text-amber-400">
                      {client.open_findings}
                    </div>
                  </div>
                </div>
              </div>

              <button
                onClick={() => onSwitchTenant(client.client_tenant_id)}
                className="w-full py-2 bg-slate-800 group-hover:bg-purple-600 text-slate-200 group-hover:text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-md"
              >
                <span>Switch to Client Workspace</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
