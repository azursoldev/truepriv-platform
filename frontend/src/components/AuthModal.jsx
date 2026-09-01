import React, { useState, useEffect } from 'react';
import { Shield, Lock, Building2, User, Sparkles, ArrowRight, Globe, Server, CheckCircle2 } from 'lucide-react';
import { api, setAuthToken, setActiveTenantId } from '../lib/api';

export default function AuthModal({ onLoginSuccess }) {
  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [email, setEmail] = useState('compliance@apexmfb.ng');
  const [password, setPassword] = useState('Password123!');
  const [features, setFeatures] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Registration State
  const [regData, setRegData] = useState({
    organization_name: '',
    tenant_type: 'corporate',
    name: '',
    email: '',
    password: '',
    rc_number: '',
    data_residency: 'local_nigeria',
  });

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

  useEffect(() => {
    const fetchFeatures = async () => {
      try {
        const res = await api.getFeatures();
        if (res.success) {
          setFeatures(res.features);
        }
      } catch (err) {
        console.warn('Feature flags load failed:', err);
      }
    };
    fetchFeatures();
  }, []);

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

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await api.register(regData);
      if (res.success) {
        setAuthToken(res.token);
        if (res.tenant) {
          setActiveTenantId(res.tenant.id);
        }
        onLoginSuccess(res.user, res.tenant, []);
      }
    } catch (err) {
      setError(err.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="max-w-xl w-full bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-5 my-8">
        
        {/* Header */}
        <div className="text-center">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-700 via-brand-500 to-emerald-400 p-0.5 shadow-xl shadow-brand-950 mx-auto mb-3 flex items-center justify-center">
            <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
              <Shield className="w-6 h-6 text-brand-400" />
            </div>
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            {mode === 'login' ? 'Sign In to DPODPCO Platform' : 'Provision Compliance Workspace'}
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Nigeria Data Protection Act (NDPA 2023) Compliance SaaS
          </p>

          {/* Mode Switcher Tabs */}
          <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 mt-4 max-w-xs mx-auto">
            <button
              type="button"
              onClick={() => { setMode('login'); setError(null); }}
              className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                mode === 'login' ? 'bg-brand-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              Sign In (Demo)
            </button>
            <button
              type="button"
              onClick={() => { setMode('register'); setError(null); }}
              className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                mode === 'register' ? 'bg-brand-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              Register Workspace
            </button>
          </div>
        </div>

        {error && (
          <div className="p-2.5 bg-red-950/80 border border-red-800 rounded-xl text-red-300 text-xs">
            {error}
          </div>
        )}

        {mode === 'login' ? (
          <>
            {/* 1-Click Demo Persona Switcher */}
            <div>
              <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-brand-400" />
                <span>Select Demo Compliance Persona (1-Click Login):</span>
              </div>

              <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
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
          </>
        ) : (
          /* Registration Form with Dynamic Residency Detection */
          <form onSubmit={handleRegister} className="space-y-3 text-xs">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Organization Legal Name</label>
              <input
                type="text"
                required
                placeholder="e.g. Sterling Microfinance Bank Ltd"
                value={regData.organization_name}
                onChange={(e) => setRegData({ ...regData, organization_name: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:border-brand-500 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Account Type</label>
                <select
                  value={regData.tenant_type}
                  onChange={(e) => setRegData({ ...regData, tenant_type: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:border-brand-500 focus:outline-none"
                >
                  <option value="corporate">Corporate Data Controller</option>
                  <option value="outsourced_dpo">Outsourced DPO Advisory</option>
                  <option value="dpco_firm">Licensed DPCO Firm</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">CAC RC-Number (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. RC-1489201"
                  value={regData.rc_number}
                  onChange={(e) => setRegData({ ...regData, rc_number: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:border-brand-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Administrator Name</label>
                <input
                  type="text"
                  required
                  placeholder="Full Name"
                  value={regData.name}
                  onChange={(e) => setRegData({ ...regData, name: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:border-brand-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Official Email</label>
                <input
                  type="email"
                  required
                  placeholder="admin@company.ng"
                  value={regData.email}
                  onChange={(e) => setRegData({ ...regData, email: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:border-brand-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Secure Password</label>
              <input
                type="password"
                required
                placeholder="Minimum 8 characters"
                value={regData.password}
                onChange={(e) => setRegData({ ...regData, password: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:border-brand-500 focus:outline-none"
              />
            </div>

            {/* Dynamic Data Residency Selection (Controlled by Feature Flag) */}
            <div className="pt-2 border-t border-slate-800">
              <label className="block text-slate-300 font-semibold mb-1.5 flex items-center justify-between">
                <span>Infrastructure & Data Residency</span>
                <span className="text-[10px] text-emerald-400 font-mono font-medium">NDPA Section 20</span>
              </label>

              {features?.dual_residency_enabled ? (
                /* Feature Flag ACTIVE: Dynamic Multi-Region Selector */
                <div className="grid grid-cols-2 gap-2">
                  <div
                    onClick={() => setRegData({ ...regData, data_residency: 'local_nigeria' })}
                    className={`p-2.5 rounded-xl border cursor-pointer transition-all ${
                      regData.data_residency === 'local_nigeria'
                        ? 'border-emerald-500 bg-emerald-950/30 text-emerald-300'
                        : 'border-slate-800 bg-slate-950 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div className="font-bold flex items-center gap-1 text-[11px]">
                      <span>🇳🇬 Nigerian Onshore</span>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-0.5">Galaxy Backbone / MainOne</p>
                  </div>

                  <div
                    onClick={() => setRegData({ ...regData, data_residency: 'global_aws' })}
                    className={`p-2.5 rounded-xl border cursor-pointer transition-all ${
                      regData.data_residency === 'global_aws'
                        ? 'border-blue-500 bg-blue-950/30 text-blue-300'
                        : 'border-slate-800 bg-slate-950 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div className="font-bold flex items-center gap-1 text-[11px]">
                      <span>☁️ Global Cloud (AWS)</span>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-0.5">eu-west-1 (Ireland)</p>
                  </div>
                </div>
              ) : (
                /* Feature Flag INACTIVE (Default Launch): Single Onshore Nigerian Routing */
                <div className="p-2.5 rounded-xl border border-emerald-500/40 bg-emerald-950/20 text-emerald-300 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Server className="w-4 h-4 text-emerald-400" />
                    <div>
                      <div className="font-bold text-[11px] text-white">Primary Nigerian Onshore Datacenter</div>
                      <div className="text-[10px] text-slate-400">Galaxy Backbone / MainOne — 100% Native NDPA Localization</div>
                    </div>
                  </div>
                  <span className="text-[10px] bg-emerald-900/60 text-emerald-300 px-2 py-0.5 rounded font-mono font-semibold">Active</span>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-emerald-950 flex items-center justify-center gap-1.5 transition-all disabled:opacity-50 mt-2"
            >
              <span>{loading ? 'Provisioning...' : 'Provision 14-Day Starter Trial Workspace'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>
        )}

        {/* Dynamic Launch Strategy Pill */}
        <div className="pt-2 text-center text-[10px] text-slate-500 flex items-center justify-center gap-1.5">
          <Globe className="w-3 h-3 text-slate-400" />
          <span>
            Strategy: {features?.dual_residency_enabled
              ? 'Multi-Region Routing Active'
              : 'Single Onshore Nigerian Infrastructure (Milestone 2 Flag Gated)'}
          </span>
        </div>

      </div>
    </div>
  );
}
