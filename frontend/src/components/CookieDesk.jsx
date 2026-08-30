import React, { useState, useEffect } from 'react';
import { 
  Cookie, 
  Copy, 
  Check, 
  Sliders, 
  Globe, 
  ShieldCheck, 
  ExternalLink,
  Save
} from 'lucide-react';
import { api } from '../lib/api';

export default function CookieDesk({ tenant }) {
  const [banner, setBanner] = useState(null);
  const [embedCode, setEmbedCode] = useState('');
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [notification, setNotification] = useState(null);

  const [formData, setFormData] = useState({
    domain: 'https://apexmfb.ng',
    theme_color: '#059669',
    position: 'bottom_bar',
    privacy_policy_url: 'https://apexmfb.ng/privacy',
    company_display_name: 'Apex Microfinance Bank',
    custom_notice_text: 'We use necessary cookies for secure digital banking and analytics cookies to enhance performance in compliance with NDPA 2023.',
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const bRes = await api.getCookieConfig();
      if (bRes.success) {
        setBanner(bRes.banner);
        setEmbedCode(bRes.embed_code);
        setFormData({
          domain: bRes.banner.domain,
          theme_color: bRes.banner.theme_color,
          position: bRes.banner.position,
          privacy_policy_url: bRes.banner.privacy_policy_url || '',
          company_display_name: bRes.banner.company_display_name || '',
          custom_notice_text: bRes.banner.custom_notice_text || '',
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
        setNotification({ type: 'success', message: 'Cookie consent banner preferences saved.' });
        loadData();
      }
    } catch (err) {
      setNotification({ type: 'error', message: err.message });
    }
  };

  const copyEmbedCode = () => {
    navigator.clipboard.writeText(embedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Toast */}
      {notification && (
        <div className={`p-4 rounded-2xl flex items-center justify-between text-xs font-semibold ${
          notification.type === 'success' ? 'bg-brand-950/90 text-brand-300 border border-brand-800' : 'bg-red-950/90 text-red-300 border border-red-800'
        }`}>
          <span>{notification.message}</span>
          <button onClick={() => setNotification(null)} className="text-slate-400 hover:text-white">&times;</button>
        </div>
      )}

      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-bold text-white tracking-tight">Zero-Dependency Cookie Consent Client SDK</h2>
          <span className="text-[11px] bg-brand-950 text-brand-400 border border-brand-800 px-2 py-0.5 rounded font-mono font-bold">
            NDPA & GAID READY
          </span>
        </div>
        <p className="text-xs text-slate-400 mt-0.5">
          Deploy an ultra-lightweight Vanilla JS banner on client websites. Automatically logs immutable proof-of-consent records for NDPC audits.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Banner Customizer Form */}
        <div className="glass-panel p-6 rounded-3xl">
          <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
            <Sliders className="w-4 h-4 text-brand-400" />
            <span>Banner Customization & Branding</span>
          </h3>

          <form onSubmit={handleSave} className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Company / Display Name</label>
              <input
                type="text"
                value={formData.company_display_name}
                onChange={(e) => setFormData({ ...formData, company_display_name: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:border-brand-500 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Primary Theme Color</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={formData.theme_color}
                    onChange={(e) => setFormData({ ...formData, theme_color: e.target.value })}
                    className="w-9 h-9 rounded-lg bg-transparent cursor-pointer"
                  />
                  <input
                    type="text"
                    value={formData.theme_color}
                    onChange={(e) => setFormData({ ...formData, theme_color: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Banner Layout Position</label>
                <select
                  value={formData.position}
                  onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:border-brand-500 focus:outline-none"
                >
                  <option value="bottom_bar">Bottom Bar</option>
                  <option value="floating_bottom_left">Floating Bottom Left</option>
                  <option value="floating_bottom_right">Floating Bottom Right</option>
                  <option value="center_modal">Center Preferences Modal</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Privacy Notice Link URL</label>
              <input
                type="text"
                value={formData.privacy_policy_url}
                onChange={(e) => setFormData({ ...formData, privacy_policy_url: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:border-brand-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Custom Notice Text</label>
              <textarea
                rows="2"
                value={formData.custom_notice_text}
                onChange={(e) => setFormData({ ...formData, custom_notice_text: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:border-brand-500 focus:outline-none"
              />
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                className="px-5 py-2 bg-brand-600 hover:bg-brand-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-brand-950"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save Banner Settings</span>
              </button>
            </div>
          </form>
        </div>

        {/* Client Website Embed Tag */}
        <div className="glass-panel p-6 rounded-3xl flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-white mb-2 flex items-center gap-2">
              <Globe className="w-4 h-4 text-sky-400" />
              <span>Embed Tag Generator</span>
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Paste this zero-dependency lightweight snippet before the closing <code>&lt;/body&gt;</code> tag of your corporate website:
            </p>

            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 font-mono text-[11px] text-cyan-300 relative group overflow-x-auto">
              <pre className="whitespace-pre-wrap">{embedCode || 'Loading snippet...'}</pre>
            </div>

            <div className="mt-4 p-3 bg-brand-950/40 border border-brand-800/60 rounded-2xl text-xs text-brand-300">
              <strong>NDPA Compliance Feature:</strong> Supports granular category selection (Strictly Necessary, Functional, Analytics, Marketing) with instant localStorage caching and asynchronous backend API proof-of-consent dispatch.
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
            <span className="text-[11px] text-slate-400 font-mono">Size: &lt; 4.2 KB (Zero dependencies)</span>
            <button
              onClick={copyEmbedCode}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold flex items-center gap-1.5"
            >
              {copied ? <Check className="w-4 h-4 text-brand-400" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Copied Embed Tag' : 'Copy HTML Snippet'}</span>
            </button>
          </div>
        </div>

      </div>

      {/* Proof of Consent Audit Trail */}
      <div className="glass-panel p-6 rounded-3xl">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-white">Immutable Proof-of-Consent Log</h3>
            <p className="text-xs text-slate-400">Timestamped proof records generated by website visitors for NDPC audit defense.</p>
          </div>
          <span className="text-xs font-mono font-bold text-brand-400 bg-brand-950 px-2.5 py-1 rounded-full border border-brand-800">
            {analytics?.total_consents || 0} Total Consents Logged
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900 border-b border-slate-800 text-slate-400 uppercase font-semibold">
              <tr>
                <th className="py-2.5 px-3">Visitor UUID</th>
                <th className="py-2.5 px-3">Categories Accepted</th>
                <th className="py-2.5 px-3">Anonymized IP Hash</th>
                <th className="py-2.5 px-3">Consented At</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
              {analytics?.recent_logs?.slice(0, 5).map((log) => (
                <tr key={log.id} className="text-slate-300">
                  <td className="py-2 px-3 text-slate-400">{log.visitor_uuid.substring(0, 16)}...</td>
                  <td className="py-2 px-3">
                    <span className="text-brand-400">
                      {Object.keys(log.accepted_categories).filter(k => log.accepted_categories[k]).join(', ')}
                    </span>
                  </td>
                  <td className="py-2 px-3 text-slate-500">{log.ip_hash?.substring(0, 16)}...</td>
                  <td className="py-2 px-3 text-slate-400">{new Date(log.consented_at).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
