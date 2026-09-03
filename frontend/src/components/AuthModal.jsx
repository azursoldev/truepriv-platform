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
      title: 'Corporate Data Controller',
      icon: 'fa-solid fa-building text-emerald-700',
      org: 'Apex Microfinance Bank Ltd',
      role: 'Corporate Admin / DPO',
      email: 'compliance@apexmfb.ng',
      desc: 'Manages internal NDPA RoPA, DPIAs, 30d DSAR pipeline & breach clock.',
      color: 'border-emerald-200 bg-emerald-50/70 text-emerald-900'
    },
    {
      title: 'Outsourced DPO Practice',
      icon: 'fa-solid fa-user-shield text-blue-700',
      org: 'Fortress Data Protection Advisory',
      role: 'Lead DPO Consultant',
      email: 'lead.dpo@fortressadvisory.ng',
      desc: 'Multi-client portfolio desk managing advisory for 4 client businesses.',
      color: 'border-blue-200 bg-blue-50/70 text-blue-900'
    },
    {
      title: 'Licensed DPCO Firm',
      icon: 'fa-solid fa-building-columns text-purple-700',
      org: 'Vanguard Compliance Partners DPCO',
      role: 'Managing Audit Partner',
      email: 'lead.partner@vanguarddpco.ng',
      desc: 'Conducts statutory GAID annual audits and issues NDPC filing packs.',
      color: 'border-purple-200 bg-purple-50/70 text-purple-900'
    },
    {
      title: 'System Super Administrator',
      icon: 'fa-solid fa-crown text-amber-700',
      org: 'Truepriv Platform Authority',
      role: 'Platform Super Admin',
      email: 'admin@dpodpco.ng',
      desc: 'Global multi-tenant governance, live audit stream & template licensing.',
      color: 'border-amber-200 bg-amber-50/70 text-amber-900'
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
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-3 sm:p-6 lg:p-8 selection:bg-emerald-500 selection:text-white">
      {/* 2-Column Auth Container */}
      <div className="w-full max-w-5xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[620px]">
        
        {/* =========================================================================
           LEFT COLUMN: PROFESSIONAL DATA PROTECTION IMAGE HERO BANNER
           ========================================================================= */}
        <div className="lg:col-span-5 relative text-white p-8 lg:p-10 flex flex-col justify-between overflow-hidden bg-slate-950">
          
          {/* High-Resolution Enterprise Cybersecurity / Data Protection Background Image */}
          <div 
            className="absolute inset-0 bg-cover bg-center transition-transform duration-700 scale-105 opacity-40"
            style={{
              backgroundImage: `url('https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=1200&q=80')`
            }}
          />

          {/* Deep Slate / Emerald Rich High-Contrast Gradient & Backdrop Blur */}
          <div className="absolute inset-0 bg-gradient-to-b from-slate-950/95 via-slate-900/90 to-emerald-950/95 backdrop-blur-[2px]" />

          {/* Topographic Vector Art & Glowing Accents */}
          <div className="absolute inset-0 opacity-10 pointer-events-none">
            <svg className="w-full h-full" viewBox="0 0 400 600" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M-50 100 C 100 200, 300 50, 450 150 C 600 250, 350 450, 450 550" stroke="white" strokeWidth="2" fill="none" />
              <path d="M-100 250 C 50 350, 250 200, 400 300 C 550 400, 300 600, 400 700" stroke="white" strokeWidth="1.5" fill="none" />
              <path d="M-20 400 C 120 500, 280 380, 480 480" stroke="white" strokeWidth="2" fill="none" />
              <circle cx="50" cy="80" r="3" fill="white" />
              <circle cx="70" cy="80" r="3" fill="white" />
              <circle cx="90" cy="80" r="3" fill="white" />
              <circle cx="50" cy="100" r="3" fill="white" />
              <circle cx="70" cy="100" r="3" fill="white" />
              <circle cx="90" cy="100" r="3" fill="white" />
              <circle cx="340" cy="380" r="4" stroke="white" strokeWidth="1.5" />
              <circle cx="300" cy="120" r="6" stroke="white" strokeWidth="1.5" />
            </svg>
          </div>

          {/* Top Brand Logo */}
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-11 h-11 rounded-2xl bg-slate-900/80 backdrop-blur-md border border-emerald-500/40 flex items-center justify-center text-white shadow-lg">
                <i className="fa-solid fa-shield-halved text-emerald-400 text-xl"></i>
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-lg tracking-tight font-sans text-white drop-shadow-sm">TRUEPRIV</span>
                  <span className="text-[8px] font-extrabold tracking-wider uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 px-1.5 py-0.2 rounded font-mono shadow-xs">
                    NDPA 2023
                  </span>
                </div>
                <div className="text-[10px] text-slate-300 font-medium">Truepriv Technologies Limited</div>
              </div>
            </div>

            {/* Main Welcome Message with High Contrast Drop Shadows */}
            <div className="mt-8 space-y-3">
              <h2 className="text-3xl lg:text-4xl font-extrabold tracking-tight leading-tight text-white drop-shadow-md">
                {mode === 'login' ? 'Welcome back!' : 'Join Truepriv'}
              </h2>
              <p className="text-xs text-slate-200 font-medium leading-relaxed max-w-sm drop-shadow-xs">
                {mode === 'login'
                  ? 'Sign in to access your statutory compliance workspace, manage RoPA inventories, DPIAs, and NDPC filings.'
                  : 'Get started with rule-based automated compliance, multi-tenant advisory, and statutory GAID audit filing.'}
              </p>
            </div>
          </div>

          {/* Feature Highlights with Frosted Glass Badges for Crystal Clear Readability */}
          <div className="relative z-10 my-6 space-y-2.5">
            <div className="flex items-center gap-3 bg-slate-950/75 backdrop-blur-md border border-white/15 rounded-xl px-3.5 py-2.5 shadow-md">
              <div className="w-5 h-5 rounded-full bg-emerald-500/30 border border-emerald-400/50 flex items-center justify-center text-[10px] text-emerald-300 flex-shrink-0">
                <i className="fa-solid fa-check"></i>
              </div>
              <span className="text-xs font-semibold text-white tracking-tight">80% Automated Rule-Based RoPA Engine</span>
            </div>

            <div className="flex items-center gap-3 bg-slate-950/75 backdrop-blur-md border border-white/15 rounded-xl px-3.5 py-2.5 shadow-md">
              <div className="w-5 h-5 rounded-full bg-emerald-500/30 border border-emerald-400/50 flex items-center justify-center text-[10px] text-emerald-300 flex-shrink-0">
                <i className="fa-solid fa-check"></i>
              </div>
              <span className="text-xs font-semibold text-white tracking-tight">72-Hour Statutory Breach Incident Clock</span>
            </div>

            <div className="flex items-center gap-3 bg-slate-950/75 backdrop-blur-md border border-white/15 rounded-xl px-3.5 py-2.5 shadow-md">
              <div className="w-5 h-5 rounded-full bg-emerald-500/30 border border-emerald-400/50 flex items-center justify-center text-[10px] text-emerald-300 flex-shrink-0">
                <i className="fa-solid fa-check"></i>
              </div>
              <span className="text-xs font-semibold text-white tracking-tight">GAID 5-Domain NDPC Filing Pack Generator</span>
            </div>
          </div>

          {/* Bottom Residency Badge */}
          <div className="relative z-10 pt-4 border-t border-white/15 flex items-center justify-between text-[10px] text-slate-300 font-mono font-medium">
            <span>🇳🇬 Galaxy Tier-III Sovereign DC</span>
            <span>v1.0.0 Enterprise</span>
          </div>
        </div>

        {/* =========================================================================
           RIGHT COLUMN: CLEAN WHITE AUTH FORM & INSTANT MULTI-TENANT PERSONAS
           ========================================================================= */}
        <div className="lg:col-span-7 bg-white p-6 sm:p-8 lg:p-10 flex flex-col justify-between overflow-y-auto max-h-[85vh] lg:max-h-none">
          
          <div>
            {/* Error Notification */}
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 font-medium flex items-center justify-between">
                <span>{error}</span>
                <button onClick={() => setError(null)} className="text-red-400 hover:text-red-700 font-bold">&times;</button>
              </div>
            )}

            {mode === 'login' ? (
              /* =========================================================================
                 SIGN IN FORM & INSTANT MULTI-TENANT PERSONAS
                 ========================================================================= */
              <div className="space-y-5">
                <div>
                  <h3 className="text-2xl font-bold text-slate-900 tracking-tight">Sign In</h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Enter your official credentials to access your designated workspace.
                  </p>
                </div>

                <form onSubmit={(e) => { e.preventDefault(); handleLogin(); }} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Official Email Address</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                        <i className="fa-solid fa-envelope text-xs"></i>
                      </div>
                      <input
                        type="email"
                        required
                        placeholder="compliance@apexmfb.ng"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-9 pr-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-emerald-600 focus:bg-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Password</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                        <i className="fa-solid fa-lock text-xs"></i>
                      </div>
                      <input
                        type="password"
                        required
                        placeholder="••••••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-9 pr-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-emerald-600 focus:bg-white"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" defaultChecked className="w-4 h-4 rounded accent-slate-900" />
                      <span>Remember me</span>
                    </label>
                    <span className="text-slate-400">Default: Password123!</span>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all shadow-md disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    <span>{loading ? 'Authenticating...' : 'Sign In to Workspace'}</span>
                    <i className="fa-solid fa-arrow-right text-xs"></i>
                  </button>
                </form>

                {/* Switch to Register */}
                <div className="text-center text-xs text-slate-600 pt-1">
                  New to Truepriv?{' '}
                  <button
                    type="button"
                    onClick={() => { setMode('register'); setError(null); }}
                    className="text-emerald-700 font-bold hover:underline"
                  >
                    Create an Account
                  </button>
                </div>

                {/* Quick 1-Click Multi-Tenant Personas */}
                <div className="pt-3 border-t border-slate-200">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                    <span>1-Click Multi-Tenant Personas</span>
                    <span className="text-[10px] text-emerald-700 font-bold">Instant Login</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {demoPersonas.map((p, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleLogin(p.email)}
                        className={`text-left p-2.5 rounded-xl border ${p.color} hover:scale-[1.01] transition-transform`}
                      >
                        <div className="font-bold text-xs flex items-center gap-1.5">
                          <i className={`${p.icon} text-xs`}></i>
                          <span>{p.title}</span>
                        </div>
                        <div className="text-[11px] text-slate-700 truncate mt-0.5">{p.org}</div>
                        <div className="text-[10px] text-slate-500 mt-1 truncate">{p.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              /* =========================================================================
                 CREATE ACCOUNT FORM WITH COUNTRY SELECTOR & RADIO CARDS
                 ========================================================================= */
              <div className="space-y-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-mono text-slate-400 font-bold">§24</span>
                    <h3 className="text-2xl font-serif font-bold text-slate-900 tracking-tight">Create your account</h3>
                  </div>
                  <p className="text-xs text-slate-600">
                    Your answers here decide which product you receive. Everything else can be changed later.
                  </p>
                </div>

                <form onSubmit={handleRegister} className="space-y-3.5">
                  
                  {/* 1. FULL NAME */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-[10px] font-bold text-slate-700 uppercase tracking-wider">FULL NAME</label>
                      <span className="text-[10px] text-slate-400">Required</span>
                    </div>
                    <input
                      type="text"
                      required
                      placeholder="Bisi Adeyemi"
                      value={regData.name}
                      onChange={(e) => setRegData({ ...regData, name: e.target.value })}
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-emerald-600 shadow-2xs"
                    />
                  </div>

                  {/* 2. WORK EMAIL */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-[10px] font-bold text-slate-700 uppercase tracking-wider">WORK EMAIL</label>
                      <span className="text-[10px] text-slate-400">Required</span>
                    </div>
                    <input
                      type="email"
                      required
                      placeholder="b.adeyemi@alphaltd.ng"
                      value={regData.email}
                      onChange={(e) => setRegData({ ...regData, email: e.target.value })}
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-emerald-600 shadow-2xs"
                    />
                  </div>

                  {/* 3. PHONE & PASSWORD ROW */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-[10px] font-bold text-slate-700 uppercase tracking-wider">PHONE</label>
                        <span className="text-[10px] text-slate-400">Required</span>
                      </div>
                      
                      {/* Country Code Select + Phone */}
                      <div className="flex rounded-xl border border-slate-300 focus-within:border-emerald-600 shadow-2xs overflow-hidden bg-white">
                        <select
                          value={selectedCountry.code}
                          onChange={(e) => {
                            const found = countryList.find(c => c.code === e.target.value) || countryList[0];
                            setSelectedCountry(found);
                            setRegData({ ...regData, phone: `${found.dial} ${localPhone}` });
                          }}
                          className="bg-slate-50 border-r border-slate-200 px-2 py-2 text-xs text-slate-800 font-bold focus:outline-none cursor-pointer flex-shrink-0"
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
                          className="w-full px-2.5 py-2 text-xs text-slate-900 focus:outline-none bg-transparent"
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-[10px] font-bold text-slate-700 uppercase tracking-wider">PASSWORD</label>
                        <span className="text-[10px] text-slate-400">Required</span>
                      </div>
                      <input
                        type="password"
                        required
                        placeholder="••••••••••••"
                        value={regData.password}
                        onChange={(e) => setRegData({ ...regData, password: e.target.value })}
                        className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-emerald-600 shadow-2xs"
                      />
                      <div className="flex items-center gap-1.5 mt-1">
                        <div className="flex items-center gap-0.5">
                          <span className="w-3 h-0.5 rounded-full bg-emerald-600"></span>
                          <span className="w-3 h-0.5 rounded-full bg-emerald-600"></span>
                          <span className="w-3 h-0.5 rounded-full bg-emerald-600"></span>
                        </div>
                        <span className="text-[10px] font-semibold text-emerald-700">Strong</span>
                      </div>
                    </div>
                  </div>

                  {/* 4. DEPARTMENT & ORGANIZATION PROFILE ROW */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-[10px] font-bold text-slate-700 uppercase tracking-wider">DEPARTMENT</label>
                        <span className="text-[10px] text-slate-400">Profile</span>
                      </div>
                      <select
                        value={regData.department || 'Compliance & Risk'}
                        onChange={(e) => setRegData({ ...regData, department: e.target.value })}
                        className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-emerald-600 shadow-2xs"
                      >
                        <option value="Compliance & Risk">Compliance & Risk</option>
                        <option value="Information Technology">Information Technology</option>
                        <option value="Human Resources">Human Resources</option>
                        <option value="Finance & Accounting">Finance & Accounting</option>
                        <option value="Operations">Operations</option>
                        <option value="Legal">Legal & Regulatory</option>
                      </select>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-[10px] font-bold text-slate-700 uppercase tracking-wider">ORGANIZATION</label>
                        <span className="text-[10px] text-slate-400">Optional</span>
                      </div>
                      <input
                        type="text"
                        placeholder="e.g. Alpha Global Ltd"
                        value={regData.organization_name || ''}
                        onChange={(e) => setRegData({ ...regData, organization_name: e.target.value })}
                        className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-emerald-600 shadow-2xs"
                      />
                    </div>
                  </div>

                  {/* 4. WHICH DESCRIBES YOU? RADIO CARDS */}
                  <div className="pt-1">
                    <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      WHICH DESCRIBES YOU?
                    </label>

                    <div className="border border-slate-300 rounded-2xl overflow-hidden divide-y divide-slate-200 bg-white">
                      {/* Option 1: Corporate */}
                      <div
                        onClick={() => setRegData({ ...regData, tenant_type: 'corporate' })}
                        className={`p-2.5 flex items-center justify-between cursor-pointer transition-all ${
                          regData.tenant_type === 'corporate'
                            ? 'bg-sky-50/70 border-l-4 border-amber-600'
                            : 'hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                            regData.tenant_type === 'corporate' ? 'border-slate-900 bg-slate-900' : 'border-slate-400'
                          }`}>
                            {regData.tenant_type === 'corporate' && <div className="w-1 h-1 rounded-full bg-white"></div>}
                          </div>
                          <div>
                            <div className="text-xs font-bold text-slate-900">A corporate company</div>
                            <div className="text-[10px] text-slate-500">We handle our own compliance in-house.</div>
                          </div>
                        </div>
                        <span className="text-[9px] font-mono font-bold text-slate-600">ENTERPRISE</span>
                      </div>

                      {/* Option 2: DPO */}
                      <div
                        onClick={() => setRegData({ ...regData, tenant_type: 'outsourced_dpo' })}
                        className={`p-2.5 flex items-center justify-between cursor-pointer transition-all ${
                          regData.tenant_type === 'outsourced_dpo'
                            ? 'bg-sky-50/70 border-l-4 border-amber-600'
                            : 'hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                            regData.tenant_type === 'outsourced_dpo' ? 'border-slate-900 bg-slate-900' : 'border-slate-400'
                          }`}>
                            {regData.tenant_type === 'outsourced_dpo' && <div className="w-1 h-1 rounded-full bg-white"></div>}
                          </div>
                          <div>
                            <div className="text-xs font-bold text-slate-900">An independent outsourced DPO</div>
                            <div className="text-[10px] text-slate-500">I run compliance for several clients.</div>
                          </div>
                        </div>
                        <span className="text-[9px] font-mono font-bold text-slate-600">DPO_CONSOLE</span>
                      </div>

                      {/* Option 3: DPCO */}
                      <div
                        onClick={() => setRegData({ ...regData, tenant_type: 'dpco_firm' })}
                        className={`p-2.5 flex items-center justify-between cursor-pointer transition-all ${
                          regData.tenant_type === 'dpco_firm'
                            ? 'bg-sky-50/70 border-l-4 border-amber-600'
                            : 'hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                            regData.tenant_type === 'dpco_firm' ? 'border-slate-900 bg-slate-900' : 'border-slate-400'
                          }`}>
                            {regData.tenant_type === 'dpco_firm' && <div className="w-1 h-1 rounded-full bg-white"></div>}
                          </div>
                          <div>
                            <div className="text-xs font-bold text-slate-900">A licensed DPCO firm</div>
                            <div className="text-[10px] text-slate-500">Licensed by NDPC to file audits.</div>
                          </div>
                        </div>
                        <span className="text-[9px] font-mono font-bold text-slate-600">DPCO_MASTER</span>
                      </div>
                    </div>

                    <p className="text-[10px] text-slate-500 mt-1.5 leading-tight">
                      {getWorkspaceFootnote()}
                    </p>
                  </div>

                  {/* Submit Button & Switcher */}
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
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
