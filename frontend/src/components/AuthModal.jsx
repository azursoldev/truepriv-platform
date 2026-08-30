import React, { useState } from 'react';
import { Shield, Lock, Building2, User, Sparkles, ArrowRight } from 'lucide-react';
import { api, setAuthToken, setActiveTenantId } from '../lib/api';

export default function AuthModal({ onLoginSuccess }) {
  const [email, setEmail] = useState('compliance@apexmfb.ng');
  const [password, setPassword] = useState('Password123!');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const demoPersonas = [
    {
      title: '🏢 Corporate Data Controller',
      org: 'Apex Microfinance Bank Nigeria Ltd',
      role: 'Corporate Admin / DPO',
      email: 'compliance@apexmfb.ng',
      desc: 'Manages internal NDPA RoPA, DPIAs, 30d DSAR pipeline, 72h breach clock, and vendor risk.',
      color: 'border-emerald-500/50 bg-emerald-950/20 text-emerald-300'
    },
    {
      title: '🛡️ Outsourced DPO Firm',
      org: 'Fortress Data Protection Advisory LLP',
      role: 'Lead DPO Consultant',
      email: 'lead.dpo@fortressadvisory.ng',
      desc: 'Multi-client portfolio desk managing DPO advisory for 4 corporate client organizations.',
      color: 'border-blue-500/50 bg-blue-950/20 text-blue-300'
    },
    {
      title: '🏛️ Licensed DPCO Firm',
      org: 'Vanguard Compliance Partners DPCO',
      role: 'Managing Audit Partner',
      email: 'lead.partner@vanguarddpco.ng',
      desc: 'Conducts statutory GAID annual compliance audits and issues certified NDPC filing packs.',
      color: 'border-purple-500/50 bg-purple-950/20 text-purple-300'
    },
    {
      title: '👑 System Super Administrator',
      org: 'DPODPCO Platform Authority',
      role: 'Platform Super Admin',
      email: 'admin@dpodpco.ng',
      desc: 'Global multi-tenant governance, industry template management, and audit licensing.',
      color: 'border-amber-500/50 bg-amber-950/20 text-amber-300'
    }
  ];

  const handleLogin = async (overrideEmail = null) => {
    setLoading(true);
    setError(null);
    const loginEmail = overrideEmail || email;

    try {
      const res = await api.login({ email: loginEmail, password });
      if (res.success) {
        setAuthToken(res.token);
        if (res.tenant) {
          setActiveTenantId(res.tenant.id);
        }
        onLoginSuccess(res.user, res.tenant, res.accessible_clients);
      }
    } catch (err) {
      setError(err.message || 'Invalid credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-md flex items-center justify-center p-4">
      <div className="max-w-xl w-full bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
        
        {/* Header */}
        <div className="text-center">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-700 via-brand-500 to-emerald-400 p-0.5 shadow-xl shadow-brand-950 mx-auto mb-3 flex items-center justify-center">
            <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
              <Shield className="w-6 h-6 text-brand-400" />
            </div>
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">Sign In to DPODPCO Platform</h2>
          <p className="text-xs text-slate-400 mt-1">
            Nigeria Data Protection Act (NDPA 2023) Compliance & Audit Management SaaS
          </p>
        </div>

        {/* 1-Click Demo Persona Switcher */}
        <div>
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-brand-400" />
            <span>Select Demo Compliance Persona (1-Click Login):</span>
          </div>

          <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
            {demoPersonas.map((p) => (
              <button
                key={p.email}
                type="button"
                onClick={() => {
                  setEmail(p.email);
                  handleLogin(p.email);
                }}
                className={`w-full text-left p-3 rounded-2xl border transition-all hover:scale-[1.01] ${p.color} hover:bg-slate-800/80`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs">{p.title}</span>
                  <span className="text-[10px] font-mono text-slate-400 font-semibold">{p.email}</span>
                </div>
                <div className="text-xs font-semibold text-slate-200 mt-0.5">{p.org}</div>
                <div className="text-[11px] text-slate-400 mt-0.5">{p.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Manual Login Form */}
        <form onSubmit={(e) => { e.preventDefault(); handleLogin(); }} className="space-y-3 pt-2 border-t border-slate-800 text-xs">
          {error && (
            <div className="p-2.5 bg-red-950/80 border border-red-800 rounded-xl text-red-300 text-xs">
              {error}
            </div>
          )}

          <div>
            <label className="block text-slate-300 font-semibold mb-1">Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:border-brand-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:border-brand-500 focus:outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-brand-600 hover:bg-brand-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-brand-950 flex items-center justify-center gap-1.5 transition-all disabled:opacity-50"
          >
            <span>{loading ? 'Authenticating...' : 'Sign In to Workspace'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </form>

      </div>
    </div>
  );
}
