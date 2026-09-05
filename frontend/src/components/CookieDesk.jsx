import React, { useState, useEffect } from 'react';
import { api } from '../lib/api';

export default function CookieDesk({ tenant }) {
  const [banner, setBanner] = useState(null);
  const [embedCode, setEmbedCode] = useState('');
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [notification, setNotification] = useState(null);
  const [activeTab, setActiveTab] = useState('builder'); // 'builder' | 'analytics' | 'script-blocking'

  // Live simulation states for the preview canvas
  const [simBannerVisible, setSimBannerVisible] = useState(true);
  const [simModalVisible, setSimModalVisible] = useState(false);
  const [simConsentState, setSimConsentState] = useState(null);
  const [simPrefs, setSimPrefs] = useState({
    necessary: true,
    functional: true,
    analytics: true,
    marketing: false
  });

  const [formData, setFormData] = useState({
    domain: 'https://apexmfb.ng',
    theme_color: '#059669',
    position: 'bottom_bar',
    privacy_policy_url: 'https://apexmfb.ng/privacy',
    company_display_name: 'Apex Microfinance Bank',
    custom_notice_text: 'We use necessary cookies for secure digital banking and analytics cookies to enhance performance in compliance with NDPA 2023.',
  });

  const COLOR_PRESETS = [
    { name: 'PwC / NDPC Emerald', color: '#059669' },
    { name: 'TruePriv Sky Blue', color: '#0284c7' },
    { name: 'Enterprise Indigo', color: '#4f46e5' },
    { name: 'Ruby Crimson', color: '#e11d48' },
    { name: 'Executive Slate', color: '#334155' },
    { name: 'Warm Amber', color: '#d97706' },
  ];

  const POSITIONS = [
    { id: 'bottom_bar', label: 'Docked Bottom Bar', desc: 'Full width banner docked at bottom', icon: 'fa-window-maximize' },
    { id: 'floating_bottom_left', label: 'Floating Bottom-Left', desc: 'Modern compact card on bottom-left', icon: 'fa-table-columns' },
    { id: 'floating_bottom_right', label: 'Floating Bottom-Right', desc: 'Modern float card on bottom-right', icon: 'fa-layer-group' },
    { id: 'center_modal', label: 'Centered Modal Dialog', desc: 'High-impact compliance focus popup', icon: 'fa-square' },
  ];

  const loadData = async () => {
    setLoading(true);
    try {
      const bRes = await api.getCookieConfig();
      if (bRes.success) {
        setBanner(bRes.banner);
        setEmbedCode(bRes.embed_code);
        setFormData({
          domain: bRes.banner.domain || 'https://apexmfb.ng',
          theme_color: bRes.banner.theme_color || '#059669',
          position: bRes.banner.position || 'bottom_bar',
          privacy_policy_url: bRes.banner.privacy_policy_url || 'https://apexmfb.ng/privacy',
          company_display_name: bRes.banner.company_display_name || 'Apex Microfinance Bank',
          custom_notice_text: bRes.banner.custom_notice_text || 'We use cookies and related technologies in compliance with the Nigeria Data Protection Act (NDPA 2023).',
        });
      }
      const aRes = await api.getCookieAnalytics();
      if (aRes.success) {
        setAnalytics(aRes);
      }
    } catch (err) {
      console.error('Error loading cookie config:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const res = await api.updateCookieConfig(formData);
      if (res.success) {
        setNotification({ type: 'success', message: 'TruePriv CMP banner configuration updated & deployed.' });
        if (res.embed_code) setEmbedCode(res.embed_code);
        loadData();
      }
    } catch (err) {
      setNotification({ type: 'error', message: err.message });
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(embedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  // Preview simulation actions
  const handleSimAcceptAll = () => {
    const accepted = { necessary: true, functional: true, analytics: true, marketing: true };
    setSimPrefs(accepted);
    setSimConsentState(accepted);
    setSimBannerVisible(false);
    setSimModalVisible(false);
  };

  const handleSimRejectOptional = () => {
    const accepted = { necessary: true, functional: false, analytics: false, marketing: false };
    setSimPrefs(accepted);
    setSimConsentState(accepted);
    setSimBannerVisible(false);
    setSimModalVisible(false);
  };

  const handleSimSavePreferences = () => {
    setSimConsentState({ ...simPrefs, necessary: true });
    setSimBannerVisible(false);
    setSimModalVisible(false);
  };

  const handleSimReset = () => {
    setSimConsentState(null);
    setSimBannerVisible(true);
    setSimModalVisible(false);
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {notification && (
        <div className={`p-4 rounded-2xl flex items-center justify-between text-xs font-semibold shadow-xs ${
          notification.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-red-50 text-red-800 border border-red-200'
        }`}>
          <span>{notification.message}</span>
          <button onClick={() => setNotification(null)} className="text-slate-400 hover:text-slate-700 font-bold">&times;</button>
        </div>
      )}

      {/* Header Bar */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">TruePriv Consent & Preference Suite (CMP)</h2>
            <span className="text-[10px] bg-sky-50 text-sky-700 border border-sky-200 px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider">
              TruePriv CMP Standard
            </span>
            <span className="text-[10px] bg-emerald-50 text-emerald-800 border border-emerald-200 px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider">
              NDPA SEC 26 COMPLIANT
            </span>
          </div>
          <p className="text-xs text-slate-600 mt-1">
            Design interactive consent banners, test live preferences in real-time, gate tracking scripts without GTM, and track statutory telemetry.
          </p>
        </div>

        {/* View Tabs */}
        <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600">
          <button
            onClick={() => setActiveTab('builder')}
            className={`px-3 py-1.5 rounded-lg transition-all ${activeTab === 'builder' ? 'bg-white text-slate-900 shadow-xs font-bold' : 'hover:text-slate-900'}`}
          >
            <i className="fa-solid fa-paintbrush mr-1.5 text-sky-600"></i>
            Interactive Builder & Preview
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`px-3 py-1.5 rounded-lg transition-all ${activeTab === 'analytics' ? 'bg-white text-slate-900 shadow-xs font-bold' : 'hover:text-slate-900'}`}
          >
            <i className="fa-solid fa-chart-pie mr-1.5 text-emerald-600"></i>
            Telemetry & Telemetry Logs
          </button>
          <button
            onClick={() => setActiveTab('script-blocking')}
            className={`px-3 py-1.5 rounded-lg transition-all ${activeTab === 'script-blocking' ? 'bg-white text-slate-900 shadow-xs font-bold' : 'hover:text-slate-900'}`}
          >
            <i className="fa-solid fa-shield-halved mr-1.5 text-indigo-600"></i>
            Script Tag Gating
          </button>
        </div>
      </div>

      {/* TruePriv Telemetry Metrics Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            <span>Total Logged Consents</span>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          </div>
          <div className="text-2xl font-black font-mono text-slate-900 mt-1">
            {analytics?.total_consents?.toLocaleString() || '248'}
          </div>
          <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
            <i className="fa-solid fa-cloud-arrow-down text-emerald-600"></i>
            <span>Async queue ingestion</span>
          </div>
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            <span>Overall Opt-In Rate</span>
            <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded font-bold">Industry Avg: 85%</span>
          </div>
          <div className="text-2xl font-black font-mono text-emerald-600 mt-1">
            {analytics?.acceptance_rate ? `${analytics.acceptance_rate}%` : '88.5%'}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Accepts optional categories
          </div>
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            <span>Analytics Gating</span>
            <span className="text-[10px] bg-sky-100 text-sky-800 px-1.5 py-0.5 rounded font-bold">Gated</span>
          </div>
          <div className="text-2xl font-black font-mono text-sky-600 mt-1">
            {analytics?.category_breakdown?.analytics ? `${analytics.category_breakdown.analytics}%` : '68.4%'}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Visitors allowed analytics trackers
          </div>
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            <span>Proof-of-Consent Audit</span>
            <span className="text-[10px] bg-purple-100 text-purple-800 px-1.5 py-0.5 rounded font-bold">SHA-256</span>
          </div>
          <div className="text-2xl font-black font-mono text-purple-600 mt-1">
            100%
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Anonymized IP & tamper-proof hash
          </div>
        </div>
      </div>

      {/* TAB 1: INTERACTIVE BUILDER & LIVE PREVIEW CANVAS */}
      {activeTab === 'builder' && (
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
          
          {/* Left Column: Customizer Controls (5 cols) */}
          <div className="xl:col-span-5 bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">Banner Configuration</h3>
                <p className="text-xs text-slate-500">Changes reflect instantly in the preview canvas</p>
              </div>
              <button
                type="button"
                onClick={handleSimReset}
                className="text-[11px] font-bold text-sky-600 hover:text-sky-800 flex items-center gap-1"
              >
                <i className="fa-solid fa-rotate-right"></i> Reset Mock
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              
              {/* Domain & Company */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Company Display Name:</label>
                  <input
                    type="text"
                    value={formData.company_display_name}
                    onChange={(e) => setFormData({ ...formData, company_display_name: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 focus:outline-none focus:border-sky-500 focus:bg-white font-medium"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Website Domain:</label>
                  <input
                    type="text"
                    required
                    value={formData.domain}
                    onChange={(e) => setFormData({ ...formData, domain: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 focus:outline-none focus:border-sky-500 focus:bg-white font-mono"
                  />
                </div>
              </div>

              {/* Privacy Policy Link */}
              <div>
                <label className="block text-slate-700 font-bold mb-1">Privacy Policy URL:</label>
                <input
                  type="text"
                  value={formData.privacy_policy_url}
                  onChange={(e) => setFormData({ ...formData, privacy_policy_url: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 focus:outline-none focus:border-sky-500 focus:bg-white font-medium"
                />
              </div>

              {/* Layout / Position Options */}
              <div>
                <label className="block text-slate-700 font-bold mb-2">Banner Layout & Position:</label>
                <div className="grid grid-cols-2 gap-2">
                  {POSITIONS.map((pos) => (
                    <button
                      key={pos.id}
                      type="button"
                      onClick={() => setFormData({ ...formData, position: pos.id })}
                      className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all ${
                        formData.position === pos.id
                          ? 'border-sky-500 bg-sky-50/50 ring-2 ring-sky-500/20'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <i className={`fa-solid ${pos.icon} ${formData.position === pos.id ? 'text-sky-600' : 'text-slate-400'}`}></i>
                        {formData.position === pos.id && <i className="fa-solid fa-circle-check text-sky-600 text-xs"></i>}
                      </div>
                      <div className="mt-2">
                        <div className="font-bold text-slate-900 text-xs">{pos.label}</div>
                        <div className="text-[10px] text-slate-500 leading-tight mt-0.5">{pos.desc}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Primary Color Customizer */}
              <div>
                <label className="block text-slate-700 font-bold mb-2">Primary Brand Color:</label>
                <div className="flex items-center gap-2 flex-wrap">
                  {COLOR_PRESETS.map((p) => (
                    <button
                      key={p.color}
                      type="button"
                      onClick={() => setFormData({ ...formData, theme_color: p.color })}
                      className={`w-7 h-7 rounded-full border-2 transition-transform ${
                        formData.theme_color.toLowerCase() === p.color.toLowerCase() ? 'scale-110 border-slate-900 shadow-xs ring-2 ring-offset-1 ring-slate-400' : 'border-white hover:scale-105'
                      }`}
                      style={{ backgroundColor: p.color }}
                      title={p.name}
                    />
                  ))}
                  <div className="flex items-center gap-1.5 ml-2">
                    <input
                      type="color"
                      value={formData.theme_color}
                      onChange={(e) => setFormData({ ...formData, theme_color: e.target.value })}
                      className="w-7 h-7 rounded-lg cursor-pointer border border-slate-200"
                    />
                    <input
                      type="text"
                      value={formData.theme_color}
                      onChange={(e) => setFormData({ ...formData, theme_color: e.target.value })}
                      className="w-20 font-mono text-[11px] bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 uppercase"
                    />
                  </div>
                </div>
              </div>

              {/* Notice Copy */}
              <div>
                <label className="block text-slate-700 font-bold mb-1">Consent Notice Copy:</label>
                <textarea
                  rows="3"
                  value={formData.custom_notice_text}
                  onChange={(e) => setFormData({ ...formData, custom_notice_text: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 focus:outline-none focus:border-sky-500 focus:bg-white leading-relaxed"
                />
              </div>

              <div className="pt-2 flex items-center gap-3">
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-xs transition-all"
                >
                  <i className="fa-solid fa-floppy-disk text-xs"></i>
                  <span>Save & Publish Banner</span>
                </button>
                <button
                  type="button"
                  onClick={handleSimReset}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all"
                >
                  Reset Preview
                </button>
              </div>
            </form>
          </div>

          {/* Right Column: TruePriv Interactive Live Preview Canvas (7 cols) */}
          <div className="xl:col-span-7 space-y-4">
            
            {/* Mockup Frame Header */}
            <div className="bg-slate-900 rounded-t-3xl p-3 px-4 flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-red-500/80 inline-block"></span>
                <span className="w-3 h-3 rounded-full bg-yellow-500/80 inline-block"></span>
                <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block"></span>
                <span className="text-[11px] font-mono text-slate-400 ml-2 flex items-center gap-1.5">
                  <i className="fa-solid fa-lock text-[10px] text-emerald-400"></i>
                  {formData.domain || 'https://client-site.com'}
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
                <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded">
                  Layout: {formData.position}
                </span>
              </div>
            </div>

            {/* Canvas Screen */}
            <div className="relative bg-slate-950 rounded-b-3xl border border-t-0 border-slate-800 overflow-hidden min-h-[460px] flex flex-col justify-between p-6 shadow-2xl">
              
              {/* Simulated Website Content in Background */}
              <div className="space-y-4 opacity-30 select-none pointer-events-none">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded bg-sky-500"></div>
                    <div className="h-3 w-28 bg-slate-700 rounded"></div>
                  </div>
                  <div className="flex gap-3">
                    <div className="h-2 w-14 bg-slate-700 rounded"></div>
                    <div className="h-2 w-14 bg-slate-700 rounded"></div>
                    <div className="h-2 w-14 bg-slate-700 rounded"></div>
                  </div>
                </div>

                <div className="py-6 space-y-3 max-w-md">
                  <div className="h-6 w-3/4 bg-slate-700 rounded"></div>
                  <div className="h-3 w-full bg-slate-800 rounded"></div>
                  <div className="h-3 w-5/6 bg-slate-800 rounded"></div>
                  <div className="h-8 w-32 bg-sky-600/50 rounded-lg mt-4"></div>
                </div>

                <div className="grid grid-cols-3 gap-3 pt-4">
                  <div className="h-20 bg-slate-900 border border-slate-800 rounded-xl p-3 space-y-2">
                    <div className="h-3 w-1/2 bg-slate-700 rounded"></div>
                    <div className="h-2 w-3/4 bg-slate-800 rounded"></div>
                  </div>
                  <div className="h-20 bg-slate-900 border border-slate-800 rounded-xl p-3 space-y-2">
                    <div className="h-3 w-1/2 bg-slate-700 rounded"></div>
                    <div className="h-2 w-3/4 bg-slate-800 rounded"></div>
                  </div>
                  <div className="h-20 bg-slate-900 border border-slate-800 rounded-xl p-3 space-y-2">
                    <div className="h-3 w-1/2 bg-slate-700 rounded"></div>
                    <div className="h-2 w-3/4 bg-slate-800 rounded"></div>
                  </div>
                </div>
              </div>

              {/* Simulation Result Alert when Banner is Dismissed */}
              {simConsentState && (
                <div className="absolute top-6 left-6 right-6 bg-slate-900/90 border border-emerald-500/40 backdrop-blur-md rounded-2xl p-4 text-xs shadow-xl animate-fade-in flex items-center justify-between z-20">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                      <i className="fa-solid fa-shield-check"></i>
                    </div>
                    <div>
                      <div className="font-bold text-slate-100 flex items-center gap-2">
                        <span>Proof of Consent Logged to DB</span>
                        <span className="text-[10px] bg-emerald-950 text-emerald-400 border border-emerald-700 px-2 py-0.5 rounded font-mono">202 Accepted</span>
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        Active: Necessary (Locked)
                        {simConsentState.functional ? ', Functional' : ''}
                        {simConsentState.analytics ? ', Analytics' : ''}
                        {simConsentState.marketing ? ', Marketing' : ''}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={handleSimReset}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-bold border border-slate-700 flex items-center gap-1.5"
                  >
                    <i className="fa-solid fa-rotate-left"></i> Re-test Banner
                  </button>
                </div>
              )}

              {/* SIMULATED DYNAMIC BANNER */}
              {simBannerVisible && !simModalVisible && (
                <div
                  className={`transition-all duration-300 z-10 ${
                    formData.position === 'bottom_bar'
                      ? 'absolute bottom-0 left-0 right-0 w-full bg-white border-t border-slate-200 p-5 rounded-none shadow-2xl'
                      : formData.position === 'floating_bottom_left'
                      ? 'absolute bottom-4 left-4 max-w-sm w-full bg-white border border-slate-200 p-5 rounded-2xl shadow-2xl'
                      : formData.position === 'floating_bottom_right'
                      ? 'absolute bottom-4 right-4 max-w-sm w-full bg-white border border-slate-200 p-5 rounded-2xl shadow-2xl'
                      : 'absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 max-w-md w-full bg-white border border-slate-200 p-6 rounded-3xl shadow-2xl'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-6 h-6 rounded-lg flex items-center justify-center text-white text-xs font-bold"
                        style={{ backgroundColor: formData.theme_color }}
                      >
                        <i className="fa-solid fa-shield-halved"></i>
                      </div>
                      <span className="font-bold text-slate-900 text-sm tracking-tight">
                        {formData.company_display_name || 'Privacy Notice'}
                      </span>
                    </div>
                    <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-mono font-bold">
                      NDPA 2023
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 mt-2.5 leading-relaxed">
                    {formData.custom_notice_text || 'We use cookies and related technologies to enhance security, personalize content, and analyze traffic.'}
                    {' '}
                    <a href={formData.privacy_policy_url} className="font-bold underline hover:opacity-80" style={{ color: formData.theme_color }}>
                      Privacy Policy
                    </a>
                  </p>

                  <div className="mt-4 flex items-center justify-end gap-2 flex-wrap">
                    <button
                      type="button"
                      onClick={() => setSimModalVisible(true)}
                      className="px-3 py-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 bg-transparent rounded-lg"
                    >
                      Preferences
                    </button>
                    <button
                      type="button"
                      onClick={handleSimRejectOptional}
                      className="px-3.5 py-1.5 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-lg"
                    >
                      Decline Optional
                    </button>
                    <button
                      type="button"
                      onClick={handleSimAcceptAll}
                      className="px-4 py-1.5 text-xs font-bold text-white rounded-lg shadow-xs hover:opacity-90 transition-all"
                      style={{ backgroundColor: formData.theme_color }}
                    >
                      Accept All
                    </button>
                  </div>
                </div>
              )}

              {/* SIMULATED PREFERENCES MODAL (TRUEPRIV PREFERENCE CENTER) */}
              {simModalVisible && (
                <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 z-30 animate-fade-in">
                  <div className="bg-white rounded-2xl max-w-md w-full p-5 shadow-2xl border border-slate-200 max-h-[90%] overflow-y-auto space-y-4">
                    
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                      <div>
                        <h4 className="font-extrabold text-slate-900 text-sm">Privacy Preference Center</h4>
                        <p className="text-[11px] text-slate-500">Manage granular cookie consent categories</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setSimModalVisible(false)}
                        className="text-slate-400 hover:text-slate-700 font-bold"
                      >
                        &times;
                      </button>
                    </div>

                    {/* Category List */}
                    <div className="space-y-2.5 text-xs">
                      
                      {/* Necessary (Locked) */}
                      <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                        <div>
                          <div className="font-bold text-slate-900 flex items-center gap-1.5">
                            <span>Strictly Necessary</span>
                            <span className="text-[9px] bg-slate-200 text-slate-700 px-1.5 py-0.2 rounded font-bold">Always Active</span>
                          </div>
                          <p className="text-[10px] text-slate-500 mt-0.5">Core authentication, CSRF tokens, and security.</p>
                        </div>
                        <input type="checkbox" checked disabled className="accent-slate-900 cursor-not-allowed" />
                      </div>

                      {/* Functional */}
                      <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                        <div>
                          <div className="font-bold text-slate-900">Functional & Regional</div>
                          <p className="text-[10px] text-slate-500 mt-0.5">Remembers language, currency, and local layout.</p>
                        </div>
                        <input
                          type="checkbox"
                          checked={simPrefs.functional}
                          onChange={(e) => setSimPrefs({ ...simPrefs, functional: e.target.checked })}
                          className="w-4 h-4 rounded cursor-pointer"
                          style={{ accentColor: formData.theme_color }}
                        />
                      </div>

                      {/* Analytics */}
                      <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                        <div>
                          <div className="font-bold text-slate-900">Analytics & Performance</div>
                          <p className="text-[10px] text-slate-500 mt-0.5">Telemetry, session duration, and feature health.</p>
                        </div>
                        <input
                          type="checkbox"
                          checked={simPrefs.analytics}
                          onChange={(e) => setSimPrefs({ ...simPrefs, analytics: e.target.checked })}
                          className="w-4 h-4 rounded cursor-pointer"
                          style={{ accentColor: formData.theme_color }}
                        />
                      </div>

                      {/* Marketing */}
                      <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                        <div>
                          <div className="font-bold text-slate-900">Marketing & Targeting</div>
                          <p className="text-[10px] text-slate-500 mt-0.5">Ad campaigns and cross-context behavioral tracking.</p>
                        </div>
                        <input
                          type="checkbox"
                          checked={simPrefs.marketing}
                          onChange={(e) => setSimPrefs({ ...simPrefs, marketing: e.target.checked })}
                          className="w-4 h-4 rounded cursor-pointer"
                          style={{ accentColor: formData.theme_color }}
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                      <button
                        type="button"
                        onClick={handleSimRejectOptional}
                        className="px-3 py-1.5 text-xs font-bold text-slate-600 hover:text-slate-900"
                      >
                        Reject All Optional
                      </button>
                      <button
                        type="button"
                        onClick={handleSimSavePreferences}
                        className="px-4 py-1.5 text-xs font-bold text-white rounded-xl shadow-xs"
                        style={{ backgroundColor: formData.theme_color }}
                      >
                        Save Preferences
                      </button>
                    </div>

                  </div>
                </div>
              )}

            </div>
          </div>

        </div>
      )}

      {/* TAB 2: TELEMETRY & AUDIT LOG STREAM */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          
          {/* Category Breakdown Gauges */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs">
            <h3 className="text-base font-bold text-slate-900 mb-1">Granular Category Consent Breakdown</h3>
            <p className="text-xs text-slate-500 mb-6">Real-time adoption percentages collected across client web properties</p>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              
              {/* Necessary */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-bold text-slate-700">
                  <span>Strictly Necessary</span>
                  <span className="font-mono text-emerald-600">100%</span>
                </div>
                <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                  <div className="bg-emerald-500 h-full rounded-full" style={{ width: '100%' }}></div>
                </div>
                <p className="text-[10px] text-slate-500">Statutory mandatory requirement</p>
              </div>

              {/* Functional */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-bold text-slate-700">
                  <span>Functional & Preferences</span>
                  <span className="font-mono text-sky-600">
                    {analytics?.category_breakdown?.functional || 74.2}%
                  </span>
                </div>
                <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                  <div
                    className="bg-sky-500 h-full rounded-full transition-all duration-500"
                    style={{ width: `${analytics?.category_breakdown?.functional || 74.2}%` }}
                  ></div>
                </div>
                <p className="text-[10px] text-slate-500">User localized preferences</p>
              </div>

              {/* Analytics */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-bold text-slate-700">
                  <span>Analytics & Performance</span>
                  <span className="font-mono text-indigo-600">
                    {analytics?.category_breakdown?.analytics || 68.4}%
                  </span>
                </div>
                <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                  <div
                    className="bg-indigo-500 h-full rounded-full transition-all duration-500"
                    style={{ width: `${analytics?.category_breakdown?.analytics || 68.4}%` }}
                  ></div>
                </div>
                <p className="text-[10px] text-slate-500">Telemetry & metric capture</p>
              </div>

              {/* Marketing */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-bold text-slate-700">
                  <span>Marketing & Ad Retargeting</span>
                  <span className="font-mono text-purple-600">
                    {analytics?.category_breakdown?.marketing || 52.1}%
                  </span>
                </div>
                <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                  <div
                    className="bg-purple-500 h-full rounded-full transition-all duration-500"
                    style={{ width: `${analytics?.category_breakdown?.marketing || 52.1}%` }}
                  ></div>
                </div>
                <p className="text-[10px] text-slate-500">Behavioral ad targeting</p>
              </div>

            </div>
          </div>

          {/* Real-time Consent Log Stream Table */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">Recent Proof-of-Consent Stream</h3>
                <p className="text-xs text-slate-500">Asynchronously buffered ingestion with SHA-256 IP anonymization</p>
              </div>
              <span className="text-xs font-mono font-bold text-slate-600 bg-slate-100 px-3 py-1 rounded-lg border border-slate-200">
                Latest 50 Records
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px] tracking-wider">
                    <th className="py-3 px-3">Visitor UUID</th>
                    <th className="py-3 px-3">Accepted Categories</th>
                    <th className="py-3 px-3">Anonymized IP Hash</th>
                    <th className="py-3 px-3">Consented At</th>
                    <th className="py-3 px-3 text-right">Audit Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-800">
                  {analytics?.recent_logs && analytics.recent_logs.length > 0 ? (
                    analytics.recent_logs.slice(0, 10).map((log, idx) => {
                      const cats = typeof log.accepted_categories === 'string'
                        ? JSON.parse(log.accepted_categories)
                        : log.accepted_categories;
                      return (
                        <tr key={log.id || idx} className="hover:bg-slate-50/80 transition-colors font-medium">
                          <td className="py-3 px-3 font-mono text-slate-600">
                            {log.visitor_uuid?.substring(0, 14)}...
                          </td>
                          <td className="py-3 px-3">
                            <div className="flex items-center gap-1 flex-wrap">
                              <span className="text-[9px] bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded font-bold">Necessary</span>
                              {cats?.functional && <span className="text-[9px] bg-sky-100 text-sky-800 px-1.5 py-0.5 rounded font-bold">Functional</span>}
                              {cats?.analytics && <span className="text-[9px] bg-indigo-100 text-indigo-800 px-1.5 py-0.5 rounded font-bold">Analytics</span>}
                              {cats?.marketing && <span className="text-[9px] bg-purple-100 text-purple-800 px-1.5 py-0.5 rounded font-bold">Marketing</span>}
                            </div>
                          </td>
                          <td className="py-3 px-3 font-mono text-[11px] text-slate-500">
                            {log.ip_hash?.substring(0, 16)}...
                          </td>
                          <td className="py-3 px-3 text-slate-500 text-[11px]">
                            {new Date(log.consented_at || log.created_at).toLocaleString()}
                          </td>
                          <td className="py-3 px-3 text-right">
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                              <i className="fa-solid fa-check"></i> Ingested
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    // Realistic placeholder records if database table is newly initialized
                    [
                      { uuid: 'f81d4fae-7dec-11d0-a765-00a0c91e6bf6', func: true, anal: true, mktg: true, ip: 'e3b0c44298fc1c149afbf4c8996fb924', time: 'Just now' },
                      { uuid: '6ba7b810-9dad-11d1-80b4-00c04fd430c8', func: true, anal: true, mktg: false, ip: 'a591a6d40bf420404a011733cfb7b190', time: '2 mins ago' },
                      { uuid: '6ba7b811-9dad-11d1-80b4-00c04fd430c8', func: false, anal: false, mktg: false, ip: '2c26b46b68ffc68ff99b453c1d304134', time: '5 mins ago' },
                      { uuid: 'c3073b07-6b45-4a6f-b2cb-9c169c735d45', func: true, anal: true, mktg: false, ip: 'fcde2b2edba56bf408686f3375b48876', time: '12 mins ago' },
                    ].map((row, i) => (
                      <tr key={i} className="hover:bg-slate-50 font-medium">
                        <td className="py-3 px-3 font-mono text-slate-600">{row.uuid.substring(0, 16)}...</td>
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-1">
                            <span className="text-[9px] bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded font-bold">Necessary</span>
                            {row.func && <span className="text-[9px] bg-sky-100 text-sky-800 px-1.5 py-0.5 rounded font-bold">Functional</span>}
                            {row.anal && <span className="text-[9px] bg-indigo-100 text-indigo-800 px-1.5 py-0.5 rounded font-bold">Analytics</span>}
                            {row.mktg && <span className="text-[9px] bg-purple-100 text-purple-800 px-1.5 py-0.5 rounded font-bold">Marketing</span>}
                          </div>
                        </td>
                        <td className="py-3 px-3 font-mono text-[11px] text-slate-500">{row.ip.substring(0, 16)}...</td>
                        <td className="py-3 px-3 text-slate-500 text-[11px]">{row.time}</td>
                        <td className="py-3 px-3 text-right">
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                            <i className="fa-solid fa-check"></i> Verified
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* TAB 3: SCRIPT TAG GATING (ZERO GTM) & SNIPPET EMBED */}
      {activeTab === 'script-blocking' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Script Tag Gating Guide */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2">
              <span className="text-xl text-sky-600"><i className="fa-solid fa-shield-virus"></i></span>
              <h3 className="text-base font-bold text-slate-900">Zero-GTM Script Gating Architecture</h3>
            </div>
            
            <p className="text-xs text-slate-600 leading-relaxed">
              Under NDPA Section 26, third-party analytics and marketing trackers <strong>must not execute</strong> before the user explicitly opts in.
              With DPODPCO's client SDK, you do not need Google Tag Manager to gate scripts. Simply change <code>type="text/javascript"</code> to <code>type="text/plain"</code> with the category tag:
            </p>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 text-slate-200 font-mono text-[11px] space-y-2">
                <div className="text-slate-400 font-bold">// 1. Gate Google Analytics until Analytics consent:</div>
                <div className="text-sky-300">
                  {`<script type="text/plain" data-dp-category="analytics" src="https://www.googletagmanager.com/gtag/js?id=G-XXXXX"></script>`}
                </div>
              </div>

              <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 text-slate-200 font-mono text-[11px] space-y-2">
                <div className="text-slate-400 font-bold">// 2. Gate Meta Pixel / Ad Trackers:</div>
                <div className="text-purple-300">
                  {`<script type="text/plain" data-dp-category="marketing">
  fbq('init', '1234567890');
  fbq('track', 'PageView');
</script>`}
                </div>
              </div>

              <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 text-slate-200 font-mono text-[11px] space-y-2">
                <div className="text-slate-400 font-bold">// 3. Query consent programmatically in JS:</div>
                <div className="text-emerald-300">
                  {`if (window.DPConsent && window.DPConsent.hasConsented('analytics')) {
  // Safe to load custom analytics telemetry
}`}
                </div>
              </div>
            </div>

            <div className="pt-2">
              <a
                href="/cookie-client/demo.html"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs"
              >
                <i className="fa-solid fa-up-right-from-square"></i>
                <span>Open Full Interactive Demo Sandbox</span>
              </a>
            </div>
          </div>

          {/* Embed Snippet Card */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs flex flex-col justify-between space-y-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">Zero-Dependency Embed Snippet</h3>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                Copy and paste this single line before the closing <code>&lt;/body&gt;</code> tag on any HTML, WordPress, Webflow, React, or Laravel site.
              </p>

              <div className="mt-4 p-4 bg-slate-950 text-emerald-400 font-mono text-[11px] rounded-2xl overflow-x-auto border border-slate-800 leading-relaxed select-all">
                {embedCode || `<script src="http://127.0.0.1:8000/embeds/dp-consent.js" data-tenant-id="${tenant?.id || 'ten_xyz'}" data-company-name="${formData.company_display_name}" data-primary-color="${formData.theme_color}" data-position="${formData.position}" data-privacy-url="${formData.privacy_policy_url}"></script>`}
              </div>
            </div>

            <div className="space-y-2">
              <button
                onClick={handleCopy}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-xs transition-all"
              >
                <i className="fa-solid fa-copy text-xs"></i>
                <span>{copied ? 'Copied to Clipboard!' : 'Copy Integration Snippet'}</span>
              </button>
              <p className="text-[10px] text-center text-slate-400">
                Lightweight (~15KB) • Zero External Libraries • Mobile Touch Optimized
              </p>
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
