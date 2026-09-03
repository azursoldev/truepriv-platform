import React, { useState, useEffect } from 'react';
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
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
              {tenantType === 'dpco_firm' ? 'Licensed DPCO Client Audit Portfolio' : 'Outsourced DPO Multi-Client Desk'}
            </h2>
            <span className="text-[11px] bg-purple-50 text-purple-800 border border-purple-200 px-2 py-0.5 rounded font-mono font-bold">
              MULTI-TENANT ISOLATED
            </span>
          </div>
          <p className="text-xs text-slate-600 mt-0.5">
            Switch between client corporate workspaces in 1 click with strict data boundary isolation.
          </p>
        </div>

        <div className="relative min-w-[240px]">
          <i className="fa-solid fa-magnifying-glass text-slate-400 text-xs absolute left-3 top-3"></i>
          <input
            type="text"
            placeholder="Filter clients by name or sector..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white border border-slate-300 rounded-xl pl-8 pr-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-emerald-600 shadow-2xs"
          />
        </div>
      </div>

      {/* Clients Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <div className="col-span-3 py-16 text-center text-slate-500 text-xs font-medium">Loading portfolio client workspaces...</div>
        ) : filtered.length === 0 ? (
          <div className="col-span-3 bg-white border border-slate-200 rounded-3xl p-12 text-center shadow-xs">
            <i className="fa-solid fa-network-wired text-slate-300 text-3xl mb-2"></i>
            <h4 className="text-sm font-bold text-slate-800">No client organizations matched</h4>
          </div>
        ) : (
          filtered.map((client) => (
            <div
              key={client.client_id}
              className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4 flex flex-col justify-between hover:border-purple-300 transition-all"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="w-10 h-10 rounded-2xl bg-slate-900 text-emerald-400 font-bold text-sm flex items-center justify-center shadow-xs">
                    {client.client_name.substring(0, 2).toUpperCase()}
                  </div>
                  <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                    {client.compliance_score}% NDPA
                  </span>
                </div>

                <h3 className="text-base font-bold text-slate-900 mt-1">{client.client_name}</h3>
                <div className="text-xs text-slate-500 mt-0.5">{client.industry} &bull; MDC Tier: <span className="uppercase font-mono font-semibold">{client.mdc_tier}</span></div>

                <div className="mt-4 grid grid-cols-2 gap-2 p-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs">
                  <div>
                    <span className="text-[10px] text-slate-500 font-bold uppercase">RoPA Coverage</span>
                    <div className="font-bold text-slate-900 mt-0.5">{client.ropa_count} Activities</div>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 font-bold uppercase">Open Findings</span>
                    <div className="font-bold text-amber-700 mt-0.5">{client.open_findings || 0} Items</div>
                  </div>
                </div>
              </div>

              <button
                onClick={() => onSwitchTenant(client.client_id)}
                className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-xs transition-all"
              >
                <span>Switch to Client Workspace</span>
                <i className="fa-solid fa-arrow-right text-xs"></i>
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
