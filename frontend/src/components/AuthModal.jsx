import React, { useState, useEffect } from 'react';
import { api, setAuthToken, setActiveTenantId } from '../lib/api';

const countryList = [
  { code: 'NG', name: 'Nigeria', dial: '+234', flag: '🇳🇬', placeholder: '803 114 2290' },
  { code: 'GH', name: 'Ghana', dial: '+233', flag: '🇬🇭', placeholder: '24 123 4567' },
  { code: 'KE', name: 'Kenya', dial: '+254', flag: '🇰🇪', placeholder: '712 345 678' },
  { code: 'ZA', name: 'South Africa', dial: '+27', flag: '🇿🇦', placeholder: '82 123 4567' },
  { code: 'GB', name: 'United Kingdom', dial: '+44', flag: '🇬🇧', placeholder: '7911 123456' },
  { code: 'US', name: 'United States', dial: '+1', flag: '🇺🇸', placeholder: '(555) 123-4567' },
  { code: 'CA', name: 'Canada', dial: '+1', flag: '🇨🇦', placeholder: '(555) 123-4567' },
  { code: 'AE', name: 'UAE', dial: '+971', flag: '🇦🇪', placeholder: '50 123 4567' },
  { code: 'PK', name: 'Pakistan', dial: '+92', flag: '🇵🇰', placeholder: '300 1234567' },
  { code: 'IN', name: 'India', dial: '+91', flag: '🇮🇳', placeholder: '98765 43210' },
  { code: 'DE', name: 'Germany', dial: '+49', flag: '🇩🇪', placeholder: '151 12345678' },
  { code: 'FR', name: 'France', dial: '+33', flag: '🇫🇷', placeholder: '6 12 34 56 78' },
  { code: 'EG', name: 'Egypt', dial: '+20', flag: '🇪🇬', placeholder: '100 123 4567' },
  { code: 'RW', name: 'Rwanda', dial: '+250', flag: '🇷🇼', placeholder: '788 123 456' },
];

export default function AuthModal({ onLoginSuccess }) {
  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [email, setEmail] = useState('compliance@apexmfb.ng');
  const [password, setPassword] = useState('Password123!');
  const [features, setFeatures] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Country selector state for phone
  const [selectedCountry, setSelectedCountry] = useState(countryList[0]);
  const [localPhone, setLocalPhone] = useState('803 114 2290');

  // Exact Registration State Matching Screenshot
  const [regData, setRegData] = useState({
    name: 'Bisi Adeyemi',
    email: 'b.adeyemi@alphaltd.ng',
    phone: '+234 803 114 2290',
    password: 'Password123!',
    tenant_type: 'corporate', // 'corporate' | 'outsourced_dpo' | 'dpco_firm'
  });

  const demoPersonas = [
    {
      title: '🏢 Corporate Data Controller',
      org: 'Apex Microfinance Bank Nigeria Ltd',
      role: 'Corporate Admin / DPO',
      email: 'compliance@apexmfb.ng',
      desc: 'Manages internal NDPA RoPA, DPIAs, 30d DSAR pipeline, 72h breach clock, and vendor risk.',
      color: 'border-emerald-200 bg-emerald-50/70 text-emerald-900'
    },
    {
      title: '🛡️ Outsourced DPO Firm',
      org: 'Fortress Data Protection Advisory LLP',
      role: 'Lead DPO Consultant',
      email: 'lead.dpo@fortressadvisory.ng',
      desc: 'Multi-client portfolio desk managing DPO advisory for 4 corporate client organizations.',
      color: 'border-blue-200 bg-blue-50/70 text-blue-900'
    },
    {
      title: '🏛️ Licensed DPCO Firm',
      org: 'Vanguard Compliance Partners DPCO',
      role: 'Managing Audit Partner',
      email: 'lead.partner@vanguarddpco.ng',
      desc: 'Conducts statutory GAID annual compliance audits and issues certified NDPC filing packs.',
      color: 'border-purple-200 bg-purple-50/70 text-purple-900'
    },
    {
      title: '👑 System Super Administrator',
      org: 'DPODPCO Platform Authority',
      role: 'Platform Super Admin',
      email: 'admin@dpodpco.ng',
      desc: 'Global multi-tenant governance, industry template management, and audit licensing.',
      color: 'border-amber-200 bg-amber-50/70 text-amber-900'
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
      const fullPhone = `${selectedCountry.dial} ${localPhone}`.trim();
      const res = await api.register({ ...regData, phone: fullPhone });
      if (res.success) {
        setAuthToken(res.token);
        if (res.tenant) {
          setActiveTenantId(res.tenant.id);
        }
        onLoginSuccess(res.user, res.tenant, res.accessible_clients);
      }
    } catch (err) {
      setError(err.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  const getWorkspaceFootnote = () => {
    switch (regData.tenant_type) {
      case 'outsourced_dpo':
        return "You'll get the DPO console: multi-client workspace switching, client onboarding, and bulk RoPA.";
      case 'dpco_firm':
        return "You'll get the DPCO master suite: client audit project management, statutory reporting, and NDPC submission desk.";
      default:
        return "You'll get the enterprise workspace: your own records, documents, DSARs and returns.";
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="w-full max-w-xl bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-2xl overflow-hidden max-h-[95vh] overflow-y-auto">
        
        {/* Top Header Section */}
        {mode === 'login' ? (
          <div className="text-center mb-6">
            <div className="w-12 h-12 rounded-2xl bg-slate-900 text-white mx-auto flex items-center justify-center mb-3 shadow-md">
              <i className="fa-solid fa-shield-halved text-emerald-400 text-xl"></i>
            </div>
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">TRUEPRIV PLATFORM</h2>
            <p className="text-xs text-slate-500 mt-1">Multi-Tenant NDPA 2023 Compliance & Statutory Auditing Suite</p>
          </div>
        ) : (
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-mono text-slate-400 font-bold">§24</span>
              <h2 className="text-2xl font-serif font-bold text-slate-900 tracking-tight">Create your account</h2>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Your answers here decide which product you receive, so take the profile question slowly. Everything else can be changed later.
            </p>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 font-medium">
            {error}
          </div>
        )}

        {mode === 'login' ? (
          /* =========================================================================
             LOGIN FORM & QUICK PERSONAS
             ========================================================================= */
          <div className="space-y-6">
            <form onSubmit={(e) => { e.preventDefault(); handleLogin(); }} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Official Email</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-sm text-slate-900 focus:outline-none focus:border-emerald-600 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Password</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-sm text-slate-900 focus:outline-none focus:border-emerald-600 focus:bg-white"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all shadow-md disabled:opacity-50"
              >
                {loading ? 'Authenticating...' : 'Sign In to Workspace'}
              </button>
            </form>

            <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-200">
              <span className="text-slate-500">Need a new workspace?</span>
              <button
                type="button"
                onClick={() => { setMode('register'); setError(null); }}
                className="text-emerald-700 font-bold hover:underline"
              >
                Create your account
              </button>
            </div>

            {/* Quick Demo Personas */}
            <div className="pt-3 border-t border-slate-200">
              <div className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                <span>Instant Multi-Tenant Personas</span>
                <span className="text-[10px] text-emerald-700 font-bold">1-Click Login</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {demoPersonas.map((p, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleLogin(p.email)}
                    className={`text-left p-2.5 rounded-xl border ${p.color} hover:scale-[1.01] transition-transform`}
                  >
                    <div className="font-bold text-xs">{p.title}</div>
                    <div className="text-[11px] text-slate-700 truncate mt-0.5">{p.org}</div>
                    <div className="text-[10px] text-slate-500 mt-1 truncate">{p.desc}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          /* =========================================================================
             CREATE YOUR ACCOUNT — WITH COUNTRY CODE SELECTOR & LIVE PHONE FORMATTING
             ========================================================================= */
          <form onSubmit={handleRegister} className="space-y-4">
            
            {/* 1. FULL NAME */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">FULL NAME</label>
                <span className="text-[11px] text-slate-400">Required</span>
              </div>
              <input
                type="text"
                required
                placeholder="Bisi Adeyemi"
                value={regData.name}
                onChange={(e) => setRegData({ ...regData, name: e.target.value })}
                className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-emerald-600 shadow-2xs"
              />
            </div>

            {/* 2. WORK EMAIL */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">WORK EMAIL</label>
                <span className="text-[11px] text-slate-400">Required</span>
              </div>
              <input
                type="email"
                required
                placeholder="b.adeyemi@alphaltd.ng"
                value={regData.email}
                onChange={(e) => setRegData({ ...regData, email: e.target.value })}
                className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-emerald-600 shadow-2xs"
              />
              <p className="text-[11px] text-slate-500 mt-1">
                We use this address for filing receipts, so use one that will outlive the project.
              </p>
            </div>

            {/* 3. PHONE WITH COUNTRY SELECTOR & PASSWORD ROW */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">PHONE</label>
                  <span className="text-[11px] text-slate-400">Required</span>
                </div>
                
                {/* Interactive Country Code Selector + Phone Input */}
                <div className="flex rounded-xl border border-slate-300 focus-within:border-emerald-600 focus-within:ring-2 focus-within:ring-emerald-500/20 shadow-2xs overflow-hidden bg-white">
                  <select
                    value={selectedCountry.code}
                    onChange={(e) => {
                      const found = countryList.find(c => c.code === e.target.value) || countryList[0];
                      setSelectedCountry(found);
                      setRegData({ ...regData, phone: `${found.dial} ${localPhone}` });
                    }}
                    className="bg-slate-50 hover:bg-slate-100 border-r border-slate-200 px-2.5 py-2.5 text-xs text-slate-800 font-bold focus:outline-none cursor-pointer flex-shrink-0"
                    title="Select Country Dial Code"
                  >
                    {countryList.map((c) => (
                      <option key={c.code} value={c.code}>
                        {c.flag} {c.dial}
                      </option>
                    ))}
                  </select>

                  <input
                    type="tel"
                    required
                    placeholder={selectedCountry.placeholder}
                    value={localPhone}
                    onChange={(e) => {
                      setLocalPhone(e.target.value);
                      setRegData({ ...regData, phone: `${selectedCountry.dial} ${e.target.value}` });
                    }}
                    className="w-full px-3 py-2.5 text-sm text-slate-900 focus:outline-none bg-transparent"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">PASSWORD</label>
                  <span className="text-[11px] text-slate-400">Required</span>
                </div>
                <input
                  type="password"
                  required
                  placeholder="••••••••••••••••"
                  value={regData.password}
                  onChange={(e) => setRegData({ ...regData, password: e.target.value })}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-emerald-600 shadow-2xs"
                />
                <div className="flex items-center gap-1.5 mt-1.5">
                  <div className="flex items-center gap-1">
                    <span className="w-4 h-1 rounded-full bg-emerald-600"></span>
                    <span className="w-4 h-1 rounded-full bg-emerald-600"></span>
                    <span className="w-4 h-1 rounded-full bg-emerald-600"></span>
                  </div>
                  <span className="text-[11px] font-semibold text-emerald-700">Strong</span>
                </div>
              </div>
            </div>

            {/* 4. WHICH DESCRIBES YOU? RADIO CARDS */}
            <div className="pt-2">
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-2">
                WHICH DESCRIBES YOU?
              </label>

              <div className="border border-slate-300 rounded-2xl overflow-hidden divide-y divide-slate-200 bg-white">
                
                {/* Option 1: A corporate company */}
                <div
                  onClick={() => setRegData({ ...regData, tenant_type: 'corporate' })}
                  className={`p-3.5 flex items-center justify-between cursor-pointer transition-all ${
                    regData.tenant_type === 'corporate'
                      ? 'bg-sky-50/70 border-l-4 border-amber-600'
                      : 'hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                      regData.tenant_type === 'corporate'
                        ? 'border-slate-900 bg-slate-900'
                        : 'border-slate-400 bg-transparent'
                    }`}>
                      {regData.tenant_type === 'corporate' && (
                        <div className="w-1.5 h-1.5 rounded-full bg-white"></div>
                      )}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900">A corporate company</div>
                      <div className="text-[11px] text-slate-600">We handle our own compliance in-house.</div>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono font-bold text-slate-600 tracking-wider">
                    ENTERPRISE
                  </span>
                </div>

                {/* Option 2: An independent outsourced DPO */}
                <div
                  onClick={() => setRegData({ ...regData, tenant_type: 'outsourced_dpo' })}
                  className={`p-3.5 flex items-center justify-between cursor-pointer transition-all ${
                    regData.tenant_type === 'outsourced_dpo'
                      ? 'bg-sky-50/70 border-l-4 border-amber-600'
                      : 'hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                      regData.tenant_type === 'outsourced_dpo'
                        ? 'border-slate-900 bg-slate-900'
                        : 'border-slate-400 bg-transparent'
                    }`}>
                      {regData.tenant_type === 'outsourced_dpo' && (
                        <div className="w-1.5 h-1.5 rounded-full bg-white"></div>
                      )}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900">An independent outsourced DPO</div>
                      <div className="text-[11px] text-slate-600">I run compliance for several client businesses.</div>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono font-bold text-slate-600 tracking-wider">
                    DPO_CONSOLE
                  </span>
                </div>

                {/* Option 3: A licensed DPCO firm */}
                <div
                  onClick={() => setRegData({ ...regData, tenant_type: 'dpco_firm' })}
                  className={`p-3.5 flex items-center justify-between cursor-pointer transition-all ${
                    regData.tenant_type === 'dpco_firm'
                      ? 'bg-sky-50/70 border-l-4 border-amber-600'
                      : 'hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                      regData.tenant_type === 'dpco_firm'
                        ? 'border-slate-900 bg-slate-900'
                        : 'border-slate-400 bg-transparent'
                    }`}>
                      {regData.tenant_type === 'dpco_firm' && (
                        <div className="w-1.5 h-1.5 rounded-full bg-white"></div>
                      )}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900">A licensed DPCO firm</div>
                      <div className="text-[11px] text-slate-600">We are licensed by the NDPC to file audits.</div>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono font-bold text-slate-600 tracking-wider">
                    DPCO_MASTER
                  </span>
                </div>

              </div>

              {/* Dynamic Footnote */}
              <p className="text-[11px] text-slate-500 mt-2 leading-relaxed">
                {getWorkspaceFootnote()}
              </p>
            </div>

            {/* 5. CREATE ACCOUNT BUTTON & LOGIN SWITCHER */}
            <div className="pt-2 flex items-center gap-4">
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all shadow-md disabled:opacity-50"
              >
                {loading ? 'Creating account...' : 'Create account'}
              </button>

              <div className="text-xs text-slate-500">
                Already registered?{' '}
                <button
                  type="button"
                  onClick={() => { setMode('login'); setError(null); }}
                  className="text-emerald-700 font-bold hover:underline"
                >
                  Log in
                </button>
              </div>
            </div>

          </form>
        )}

      </div>
    </div>
  );
}
