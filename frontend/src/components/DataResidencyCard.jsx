import React, { useState, useEffect } from 'react';
import { api } from '../lib/api';

export default function DataResidencyCard({ onResidencyChanged }) {
  const [residency, setResidency] = useState(null);
  const [loading, setLoading] = useState(true);
  const [switching, setSwitching] = useState(false);
  const [showSwitchModal, setShowSwitchModal] = useState(false);
  const [targetResidency, setTargetResidency] = useState('global_aws');
  const [message, setMessage] = useState(null);

  const fetchStatus = async () => {
    try {
      setLoading(true);
      const res = await api.getLocalizationStatus();
      if (res.success && res.data) {
        setResidency(res.data);
      }
    } catch (err) {
      console.error('Failed to load localization status', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  const handleOpenSwitchModal = (target) => {
    setTargetResidency(target);
    setShowSwitchModal(true);
  };

  const handleConfirmSwitch = async () => {
    setSwitching(true);
    setMessage(null);
    try {
      const res = await api.switchLocalizationResidency(targetResidency);
      if (res.success) {
        setMessage({
          type: 'success',
          text: `Data residency successfully switched to ${targetResidency === 'local_galaxy_backbone' ? '🇳🇬 Galaxy Backbone Nigeria' : '☁️ AWS eu-west-1 (Ireland)'}.`
        });
        setShowSwitchModal(false);
        await fetchStatus();
        if (onResidencyChanged) onResidencyChanged(targetResidency);
      } else {
        setMessage({ type: 'error', text: res.message || 'Failed to switch data residency.' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Switching residency failed.' });
    } finally {
      setSwitching(false);
      setTimeout(() => setMessage(null), 6000);
    }
  };

  const isOnshore = residency?.is_onshore !== false;

  return (
    <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-7 shadow-xs relative overflow-hidden">
      {/* Background Sovereign Watermark Accent */}
      <div className={`absolute top-0 right-0 w-64 h-64 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20 ${
        isOnshore ? 'bg-emerald-500/10' : 'bg-sky-500/10'
      }`}></div>

      {/* Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl shadow-xs ${
            isOnshore 
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
              : 'bg-sky-50 text-sky-700 border border-sky-200'
          }`}>
            <i className={`fa-solid ${isOnshore ? 'fa-building-shield' : 'fa-cloud-arrow-up'}`}></i>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-slate-900">Dual-Residency Data Localization</h3>
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wide border flex items-center gap-1 ${
                isOnshore
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                  : 'bg-sky-50 text-sky-800 border-sky-300'
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full ${isOnshore ? 'bg-emerald-600 animate-pulse' : 'bg-sky-600'}`}></span>
                {isOnshore ? '🇳🇬 Onshore Sovereign Node' : '☁️ Global AWS Node'}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              NDPA 2023 Section 20 Compliance • Statutory Cross-Border Data Transfer Engine
            </p>
          </div>
        </div>

        {/* Quick Switch Action Button */}
        <div>
          <button
            onClick={() => handleOpenSwitchModal(isOnshore ? 'global_aws' : 'local_galaxy_backbone')}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-2 cursor-pointer"
          >
            <i className="fa-solid fa-arrows-rotate text-xs"></i>
            <span>Switch to {isOnshore ? 'Global AWS (Ireland)' : 'Galaxy Backbone (Nigeria)'}</span>
          </button>
        </div>
      </div>

      {/* Notification Toast */}
      {message && (
        <div className={`mt-4 p-3.5 rounded-xl text-xs flex items-center gap-2.5 animate-in fade-in ${
          message.type === 'success'
            ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
            : 'bg-rose-50 border border-rose-200 text-rose-800'
        }`}>
          <i className={`fa-solid ${message.type === 'success' ? 'fa-circle-check text-emerald-600' : 'fa-triangle-exclamation text-rose-600'}`}></i>
          <span className="font-medium">{message.text}</span>
        </div>
      )}

      {/* Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-5">
        
        {/* Card 1: Active Infrastructure */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col justify-between">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Primary Data Host</span>
          <div className="mt-2">
            <span className="text-sm font-black text-slate-900 block truncate">
              {isOnshore ? 'Galaxy Backbone Tier-III' : 'AWS Cloud (eu-west-1)'}
            </span>
            <span className="text-[11px] text-slate-500 block mt-0.5">
              {isOnshore ? 'Abuja National Datacenter' : 'Dublin, Ireland'}
            </span>
          </div>
        </div>

        {/* Card 2: Sovereignty Tier */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col justify-between">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Sovereignty Tier</span>
          <div className="mt-2">
            <span className="text-sm font-black text-slate-900 block truncate">
              {isOnshore ? 'Tier 1 Sovereign Onshore' : 'Tier 2 Global Enterprise'}
            </span>
            <span className="text-[11px] text-emerald-700 font-bold block mt-0.5 flex items-center gap-1">
              <i className="fa-solid fa-check-double text-[10px]"></i>
              NDPA Section 20 Certified
            </span>
          </div>
        </div>

        {/* Card 3: Encryption Standard */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col justify-between">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Cryptographic Standard</span>
          <div className="mt-2">
            <span className="text-sm font-black text-slate-900 block">AES-256 / TLS 1.3</span>
            <span className="text-[11px] text-slate-500 block mt-0.5">Hardware Security Module (HSM)</span>
          </div>
        </div>

        {/* Card 4: Disaster Recovery Node */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col justify-between">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Disaster Recovery (DR)</span>
          <div className="mt-2">
            <span className="text-sm font-black text-slate-900 block truncate">
              {isOnshore ? 'MainOne MDXi Tier-III' : 'AWS Frankfurt (eu-central-1)'}
            </span>
            <span className="text-[11px] text-slate-500 block mt-0.5">
              {isOnshore ? 'Lekki Peninsula, Lagos' : 'Germany Cloud Region'}
            </span>
          </div>
        </div>

      </div>

      {/* Confirmation & Statutory Switch Modal */}
      {showSwitchModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 max-w-lg w-full p-6 sm:p-7 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center text-sm">
                  <i className="fa-solid fa-scale-balanced"></i>
                </div>
                <h4 className="text-sm font-bold text-slate-900">Change Data Residency Node</h4>
              </div>
              <button
                onClick={() => setShowSwitchModal(false)}
                className="text-slate-400 hover:text-slate-600 text-sm"
              >
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>

            <div className="py-4 space-y-3.5 text-xs text-slate-600 leading-relaxed">
              <p>
                You are about to switch your organization's primary data storage location to:{' '}
                <strong className="text-slate-900 font-bold">
                  {targetResidency === 'local_galaxy_backbone'
                    ? '🇳🇬 Local Onshore (Galaxy Backbone / MainOne Nigeria)'
                    : '☁️ Global Cloud (AWS eu-west-1 Ireland)'}
                </strong>.
              </p>

              <div className="p-3.5 bg-amber-50 rounded-2xl border border-amber-200 text-amber-900 space-y-1.5">
                <p className="font-bold flex items-center gap-1.5">
                  <i className="fa-solid fa-triangle-exclamation text-amber-600"></i> Statutory NDPA Notice:
                </p>
                <p className="text-[11px] text-amber-800 leading-snug">
                  {targetResidency === 'global_aws'
                    ? 'Routing data to Global AWS involves cross-border transfer governed by NDPA Section 41-43. Ensure an adequacy assessment or Standard Contractual Clauses (SCC) are registered in your audit filing.'
                    : 'Routing data to Galaxy Backbone keeps all PII 100% within Nigerian territorial borders, fulfilling Section 20 Major Data Controller sovereignty guidelines.'}
                </p>
              </div>

              <p className="text-[11px] text-slate-500">
                This change updates routing headers instantly without downtime. Encrypted replication will sync across the primary node.
              </p>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
              <button
                onClick={() => setShowSwitchModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmSwitch}
                disabled={switching}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-2 disabled:opacity-50"
              >
                {switching ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Switching Sovereign Node...</span>
                  </>
                ) : (
                  <>
                    <i className="fa-solid fa-check text-xs"></i>
                    <span>Confirm & Switch Node</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
