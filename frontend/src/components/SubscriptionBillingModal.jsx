import React, { useState, useEffect } from 'react';
import { api } from '../lib/api';

export default function SubscriptionBillingModal({ isOpen, onClose, onSubscriptionUpdated }) {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [billingCycle, setBillingCycle] = useState('annual');
  const [upgradingTier, setUpgradingTier] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  useEffect(() => {
    if (isOpen) {
      loadSubscription();
    }
  }, [isOpen]);

  const loadSubscription = async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const res = await api.getSubscription();
      if (res.success) {
        setData(res.data);
      }
    } catch (err) {
      setErrorMessage(err.message || 'Failed to load subscription details.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpgrade = async (tier) => {
    setUpgradingTier(tier);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      // 1. Initialize Paystack Transaction Payload
      const initRes = await api.initializePaystack({
        plan_tier: tier,
        billing_cycle: billingCycle,
      });

      if (!initRes.success) {
        throw new Error(initRes.message || 'Payment initialization failed.');
      }

      const reference = initRes.data.reference;

      // 2. Perform Secure Verified Upgrade & Payment Logging
      const upgradeRes = await api.upgradeSubscription({
        plan_tier: tier,
        billing_cycle: billingCycle,
        payment_gateway: 'paystack',
        transaction_reference: reference,
      });

      if (upgradeRes.success) {
        setSuccessMessage(upgradeRes.message || 'Subscription successfully upgraded!');
        await loadSubscription();
        if (onSubscriptionUpdated) {
          onSubscriptionUpdated(upgradeRes.data);
        }
      } else {
        setErrorMessage(upgradeRes.message || 'Upgrade processing failed.');
      }
    } catch (err) {
      setErrorMessage(err.message || 'Failed to complete payment.');
    } finally {
      setUpgradingTier(null);
    }
  };

  if (!isOpen) return null;

  const currentSub = data?.subscription;
  const currentTier = currentSub?.plan_tier || 'starter_corporate';
  const isPaidActive = data?.is_active_paid;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-white rounded-3xl border border-slate-200 max-w-4xl w-full my-8 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 flex flex-col max-h-[90vh]">

        {/* Modal Header */}
        <div className="bg-slate-900 text-white p-6 sm:p-7 flex items-center justify-between relative overflow-hidden flex-shrink-0">
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>

          <div className="flex items-center gap-3.5 relative z-10">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-400/30 text-emerald-400 flex items-center justify-center text-xl shadow-xs">
              <i className="fa-solid fa-credit-card"></i>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg sm:text-xl font-black tracking-tight">
                  Subscription & Statutory Entitlements
                </h3>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 font-mono">
                  Paystack NGN Gateway
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Unlock official NDPC compliance audit exports (PDF/CSV), dual-residency sovereignty, and unlimited ROPA.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-2 rounded-xl hover:bg-slate-800 transition-colors z-10 cursor-pointer"
          >
            <i className="fa-solid fa-xmark text-lg"></i>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 sm:p-8 overflow-y-auto space-y-6">

          {/* Alert Banners */}
          {successMessage && (
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center justify-between animate-in fade-in">
              <div className="flex items-center gap-2.5">
                <i className="fa-solid fa-circle-check text-emerald-600 text-base"></i>
                <span className="font-semibold">{successMessage}</span>
              </div>
              <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-md font-mono text-[10px] font-bold">
                AUDIT REPORTS UNLOCKED
              </span>
            </div>
          )}

          {errorMessage && (
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2.5 animate-in fade-in">
              <i className="fa-solid fa-triangle-exclamation text-rose-600 text-base"></i>
              <span className="font-semibold">{errorMessage}</span>
            </div>
          )}

          {/* Current Status Strip */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-700 shadow-2xs">
                <i className={`fa-solid ${isPaidActive ? 'fa-crown text-amber-500' : 'fa-hourglass-half text-sky-600'}`}></i>
              </div>
              <div>
                <div className="text-xs text-slate-500 font-medium">Current Active Subscription</div>
                <div className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                  <span className="capitalize">{currentTier.replace(/_/g, ' ')}</span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase ${
                    isPaidActive 
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' 
                      : 'bg-amber-100 text-amber-800 border border-amber-200'
                  }`}>
                    {currentSub?.status || 'Trialing'}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4 sm:border-l sm:border-slate-200 sm:pl-4">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Remaining Period</span>
                <span className="text-xs font-mono font-bold text-slate-800">
                  {data?.days_remaining !== null ? `${data.days_remaining} Days Left` : 'Active'}
                </span>
              </div>

              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Report Export Entitlement</span>
                <span className={`text-xs font-bold flex items-center gap-1 ${data?.can_export_reports ? 'text-emerald-700' : 'text-slate-400'}`}>
                  <i className={`fa-solid ${data?.can_export_reports ? 'fa-circle-check text-emerald-600' : 'fa-lock'}`}></i>
                  {data?.can_export_reports ? 'Unlocked (Official PDF/CSV)' : 'Restricted (Upgrade Required)'}
                </span>
              </div>
            </div>
          </div>

          {/* Billing Cycle Switcher */}
          <div className="flex items-center justify-center">
            <div className="bg-slate-100 p-1 rounded-2xl border border-slate-200 flex items-center gap-1">
              <button
                onClick={() => setBillingCycle('annual')}
                className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  billingCycle === 'annual'
                    ? 'bg-white text-slate-900 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span>Annual Billing</span>
                <span className="ml-1.5 px-1.5 py-0.2 bg-emerald-100 text-emerald-800 text-[10px] rounded-full font-mono">
                  Save 20%
                </span>
              </button>
              <button
                onClick={() => setBillingCycle('monthly')}
                className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  billingCycle === 'monthly'
                    ? 'bg-white text-slate-900 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Monthly Billing
              </button>
            </div>
          </div>

          {/* Pricing Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

            {/* Plan 1: Starter Corporate (Pilot) */}
            <div className={`p-6 rounded-3xl border flex flex-col justify-between transition-all ${
              currentTier === 'starter_corporate'
                ? 'bg-slate-50 border-slate-300 ring-2 ring-slate-400/20'
                : 'bg-white border-slate-200'
            }`}>
              <div>
                <div className="flex justify-between items-center mb-3">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Pilot Trial</span>
                  {currentTier === 'starter_corporate' && (
                    <span className="text-[10px] font-mono font-bold bg-slate-200 text-slate-700 px-2 py-0.5 rounded-full">
                      CURRENT
                    </span>
                  )}
                </div>
                <h4 className="text-base font-black text-slate-900">Starter Corporate</h4>
                <div className="mt-2.5 mb-4">
                  <span className="text-2xl font-black text-slate-900">₦0</span>
                  <span className="text-xs text-slate-400"> / 14 Days</span>
                </div>
                <p className="text-xs text-slate-500 mb-4 leading-relaxed">
                  Basic sandbox testing for in-house teams exploring NDPA compliance features.
                </p>

                <ul className="space-y-2 text-xs text-slate-600 mb-6">
                  <li className="flex items-center gap-2">
                    <i className="fa-solid fa-check text-emerald-600 text-[11px]"></i>
                    <span>Up to 3 Third-Party Processors</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <i className="fa-solid fa-check text-emerald-600 text-[11px]"></i>
                    <span>Single Department ROPA Registry</span>
                  </li>
                  <li className="flex items-center gap-2 text-slate-400">
                    <i className="fa-solid fa-xmark text-rose-400 text-[11px]"></i>
                    <span className="line-through">Official PDF/CSV Audit Filings</span>
                  </li>
                </ul>
              </div>

              <button
                disabled
                className="w-full py-2.5 bg-slate-200 text-slate-500 font-bold text-xs rounded-xl cursor-default"
              >
                {currentTier === 'starter_corporate' ? 'Active Pilot' : 'Included'}
              </button>
            </div>

            {/* Plan 2: Growth Enterprise (MDC) - FEATURED */}
            <div className={`p-6 rounded-3xl border flex flex-col justify-between transition-all relative overflow-hidden ${
              currentTier === 'growth_enterprise'
                ? 'bg-emerald-50/40 border-emerald-500 ring-2 ring-emerald-500/20'
                : 'bg-white border-emerald-300 shadow-md ring-1 ring-emerald-500/20'
            }`}>
              <div className="absolute top-0 right-0 bg-emerald-600 text-white text-[9px] font-black uppercase px-3 py-1 rounded-bl-xl tracking-wider">
                RECOMMENDED FOR MDC
              </div>

              <div>
                <div className="flex justify-between items-center mb-3">
                  <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">Corporate MDC</span>
                </div>
                <h4 className="text-base font-black text-slate-900">Growth Enterprise</h4>
                <div className="mt-2.5 mb-4">
                  <span className="text-2xl font-black text-slate-900 font-mono">
                    {billingCycle === 'annual' ? '₦450,000' : '₦45,000'}
                  </span>
                  <span className="text-xs text-slate-500"> / {billingCycle === 'annual' ? 'year' : 'month'}</span>
                </div>
                <p className="text-xs text-slate-500 mb-4 leading-relaxed">
                  Full statutory suite for Nigerian Major Data Controllers (MDC-Ultra & MDC-Extra).
                </p>

                <ul className="space-y-2.5 text-xs text-slate-700 mb-6">
                  <li className="flex items-center gap-2">
                    <i className="fa-solid fa-circle-check text-emerald-600 text-xs"></i>
                    <span className="font-semibold text-slate-900">Official PDF/CSV NDPC Filing Packs</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <i className="fa-solid fa-circle-check text-emerald-600 text-xs"></i>
                    <span>Unlimited Third-Party Vendors</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <i className="fa-solid fa-circle-check text-emerald-600 text-xs"></i>
                    <span>Department Champions Intake Desk</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <i className="fa-solid fa-circle-check text-emerald-600 text-xs"></i>
                    <span>Galaxy Backbone Onshore Residency</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <i className="fa-solid fa-circle-check text-emerald-600 text-xs"></i>
                    <span>Zero-GTM Cookie Consent CMP</span>
                  </li>
                </ul>
              </div>

              <button
                onClick={() => handleUpgrade('growth_enterprise')}
                disabled={upgradingTier === 'growth_enterprise' || (currentTier === 'growth_enterprise' && isPaidActive)}
                className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
              >
                {upgradingTier === 'growth_enterprise' ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Processing with Paystack...</span>
                  </>
                ) : currentTier === 'growth_enterprise' && isPaidActive ? (
                  <span>Current Active Plan</span>
                ) : (
                  <>
                    <i className="fa-solid fa-bolt text-xs"></i>
                    <span>Upgrade to Growth Enterprise</span>
                  </>
                )}
              </button>
            </div>

            {/* Plan 3: Licensed DPCO Suite */}
            <div className={`p-6 rounded-3xl border flex flex-col justify-between transition-all ${
              currentTier === 'dpco_audit_suite' || currentTier === 'dpo_unlimited'
                ? 'bg-purple-50/40 border-purple-500 ring-2 ring-purple-500/20'
                : 'bg-white border-slate-200'
            }`}>
              <div>
                <div className="flex justify-between items-center mb-3">
                  <span className="text-xs font-bold text-purple-800 uppercase tracking-wider">DPCO & DPO</span>
                </div>
                <h4 className="text-base font-black text-slate-900">Licensed DPCO Practice</h4>
                <div className="mt-2.5 mb-4">
                  <span className="text-2xl font-black text-slate-900 font-mono">
                    {billingCycle === 'annual' ? '₦1,250,000' : '₦125,000'}
                  </span>
                  <span className="text-xs text-slate-500"> / {billingCycle === 'annual' ? 'year' : 'month'}</span>
                </div>
                <p className="text-xs text-slate-500 mb-4 leading-relaxed">
                  For licensed DPCO firms conducting external audits and filing before the statutory March 15 deadline.
                </p>

                <ul className="space-y-2 text-xs text-slate-700 mb-6">
                  <li className="flex items-center gap-2">
                    <i className="fa-solid fa-circle-check text-purple-600 text-xs"></i>
                    <span>Unlimited Corporate Audit Clients</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <i className="fa-solid fa-circle-check text-purple-600 text-xs"></i>
                    <span>GAID 5-Domain Statutory Audit Engine</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <i className="fa-solid fa-circle-check text-purple-600 text-xs"></i>
                    <span>TruePriv Autonomous AI Privacy Copilot</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <i className="fa-solid fa-circle-check text-purple-600 text-xs"></i>
                    <span>Digital Auditor Evidence Locker & Stamp</span>
                  </li>
                </ul>
              </div>

              <button
                onClick={() => handleUpgrade('dpco_audit_suite')}
                disabled={upgradingTier === 'dpco_audit_suite' || (currentTier === 'dpco_audit_suite' && isPaidActive)}
                className="w-full py-3 bg-purple-700 hover:bg-purple-600 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
              >
                {upgradingTier === 'dpco_audit_suite' ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Processing with Paystack...</span>
                  </>
                ) : currentTier === 'dpco_audit_suite' && isPaidActive ? (
                  <span>Current Active Plan</span>
                ) : (
                  <>
                    <i className="fa-solid fa-building-columns text-xs"></i>
                    <span>Upgrade to DPCO Suite</span>
                  </>
                )}
              </button>
            </div>

          </div>

          {/* Payment History Log */}
          {data?.payments_history && data.payments_history.length > 0 && (
            <div className="pt-6 border-t border-slate-100">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">
                Recent Paystack Transactions
              </h4>
              <div className="border border-slate-200 rounded-2xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold">
                    <tr>
                      <th className="p-3">Reference</th>
                      <th className="p-3">Gateway</th>
                      <th className="p-3">Amount</th>
                      <th className="p-3">Date</th>
                      <th className="p-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {data.payments_history.map((p) => (
                      <tr key={p.id} className="hover:bg-slate-50/60">
                        <td className="p-3 font-mono font-medium text-slate-800">{p.transaction_reference}</td>
                        <td className="p-3 uppercase font-bold text-emerald-800 text-[11px]">{p.payment_gateway}</td>
                        <td className="p-3 font-mono font-bold text-slate-900">₦{Number(p.amount_paid).toLocaleString()}</td>
                        <td className="p-3 text-slate-500">{new Date(p.paid_at || p.created_at).toLocaleDateString()}</td>
                        <td className="p-3">
                          <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-md font-mono text-[10px] font-bold">
                            {p.gateway_status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-6 sm:px-8 py-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 flex-shrink-0">
          <div className="flex items-center gap-2">
            <i className="fa-solid fa-shield-check text-emerald-600"></i>
            <span>256-bit SSL Encrypted • Direct CBN & NDPC Compliant Billing</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl font-bold text-slate-700 transition-colors"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
}
