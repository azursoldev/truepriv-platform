import React, { useState, useEffect } from 'react';
import { api } from '../lib/api';

const PLAN_CONFIG = {
  starter_corporate: {
    name: 'Starter Corporate (Pilot)',
    tag: 'Pilot Trial',
    annual_price: 0,
    monthly_price: 0,
    features: [
      'Up to 3 Third-Party Processors',
      'Single Department ROPA Registry',
      'Standard Cookie Banner CMP',
    ],
  },
  growth_enterprise: {
    name: 'Growth Enterprise',
    tag: 'Corporate Tier',
    annual_price: 450000,
    monthly_price: 45000,
    features: [
      'Official PDF/CSV NDPC Filing Packs',
      'Unlimited Third-Party Vendors',
      'Department Champions Intake Desk',
      'Galaxy Backbone Onshore Residency',
      'Zero-GTM Cookie Consent CMP',
    ],
  },
  dpco_audit_suite: {
    name: 'Licensed DPCO Practice',
    tag: 'DPCO & DPO',
    annual_price: 1250000,
    monthly_price: 125000,
    features: [
      'Unlimited Corporate Audit Clients',
      'GAID 5-Domain Statutory Audit Engine',
      'TruePriv Autonomous AI Privacy Copilot',
      'Digital Auditor Evidence Locker & Stamp',
    ],
  },
};

export default function SubscriptionBillingModal({ isOpen, onClose, onSubscriptionUpdated }) {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [billingCycle, setBillingCycle] = useState('annual');
  const [selectedPlanForCheckout, setSelectedPlanForCheckout] = useState(null);
  const [selectedGateway, setSelectedGateway] = useState('paystack'); // 'paystack' | 'flutterwave' | 'bank_transfer'
  const [upgradingTier, setUpgradingTier] = useState(null);
  const [bankInfo, setBankInfo] = useState(null);
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

  const handleSelectPlan = (tier) => {
    setSelectedPlanForCheckout(tier);
    setSelectedGateway('paystack');
    setErrorMessage(null);
    setSuccessMessage(null);
    setBankInfo(null);
  };

  const handleProceedPayment = async () => {
    if (!selectedPlanForCheckout) return;

    setUpgradingTier(selectedPlanForCheckout);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      // 1. Initialize Multi-Gateway Transaction Payload
      const initRes = await api.initializePayment({
        plan_tier: selectedPlanForCheckout,
        billing_cycle: billingCycle,
        gateway: selectedGateway,
      });

      if (!initRes.success) {
        throw new Error(initRes.message || 'Payment initialization failed.');
      }

      const reference = initRes.data.reference;

      // Direct Bank Transfer Handling
      if (selectedGateway === 'bank_transfer') {
        setBankInfo(initRes.data);
        setUpgradingTier(null);
        return;
      }

      // Online Gateways: Paystack / Flutterwave
      const upgradeRes = await api.upgradeSubscription({
        plan_tier: selectedPlanForCheckout,
        billing_cycle: billingCycle,
        payment_gateway: selectedGateway,
        transaction_reference: reference,
      });

      if (upgradeRes.success) {
        setSuccessMessage(upgradeRes.message || 'Subscription successfully activated for 365 Days!');
        setSelectedPlanForCheckout(null);
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

  const activeCheckoutPlan = selectedPlanForCheckout ? PLAN_CONFIG[selectedPlanForCheckout] : null;
  const checkoutPrice = activeCheckoutPlan
    ? (billingCycle === 'annual' ? activeCheckoutPlan.annual_price : activeCheckoutPlan.monthly_price)
    : 0;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-white rounded-3xl border border-slate-200 max-w-4xl w-full my-8 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 flex flex-col max-h-[90vh]">

        {/* Modal Header */}
        <div className="bg-slate-900 text-white p-6 sm:p-7 flex items-center justify-between relative overflow-hidden flex-shrink-0">
          <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>

          <div className="flex items-center gap-3.5 relative z-10">
            <div className="w-12 h-12 rounded-2xl bg-orange-500/20 border border-orange-400/30 text-orange-400 flex items-center justify-center text-xl shadow-xs">
              <i className="fa-solid fa-credit-card"></i>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg sm:text-xl font-black tracking-tight">
                  Subscription & Multi-Gateway Billing
                </h3>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-orange-500/20 text-orange-300 border border-orange-400/30 font-mono">
                  Paystack • Flutterwave • Bank Wire
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Full 365-day subscription lifecycle with instant card checkout or manual corporate wire verification.
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              setSelectedPlanForCheckout(null);
              setBankInfo(null);
              onClose();
            }}
            className="text-slate-400 hover:text-white p-2 rounded-xl hover:bg-slate-800 transition-colors z-10 cursor-pointer"
          >
            <i className="fa-solid fa-xmark text-lg"></i>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 sm:p-8 overflow-y-auto space-y-6">

          {/* Alert Banners */}
          {successMessage && (
            <div className="p-4 rounded-2xl bg-orange-50 border border-orange-200 text-orange-950 text-xs flex items-center justify-between animate-in fade-in">
              <div className="flex items-center gap-2.5">
                <i className="fa-solid fa-circle-check text-[#ea580c] text-base"></i>
                <span className="font-semibold">{successMessage}</span>
              </div>
              <span className="px-2 py-0.5 bg-orange-100 text-orange-800 rounded-md font-mono text-[10px] font-bold">
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

          {/* CHECKOUT SCREEN (WHEN A PLAN IS SELECTED) */}
          {selectedPlanForCheckout ? (
            <div className="space-y-6 animate-in fade-in">
              {/* Back Bar */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                <button
                  onClick={() => {
                    setSelectedPlanForCheckout(null);
                    setBankInfo(null);
                  }}
                  className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-[#ea580c] transition-colors"
                >
                  <i className="fa-solid fa-arrow-left"></i>
                  <span>Back to Plan Selection</span>
                </button>
                <span className="text-xs font-mono font-bold text-slate-500">
                  Step 2 of 2: Select Payment Method
                </span>
              </div>

              {/* Selected Plan Summary Banner */}
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#ea580c]">
                    Target Subscription
                  </span>
                  <h4 className="text-base font-black text-slate-900 mt-0.5">
                    {activeCheckoutPlan?.name}
                  </h4>
                  <div className="text-xs text-slate-500 mt-1">
                    Duration: {billingCycle === 'annual' ? '365 Days (Full Annual Access)' : '30 Days (Monthly Access)'}
                  </div>
                </div>

                <div className="text-left sm:text-right">
                  <div className="text-2xl font-black text-slate-900 font-mono">
                    ₦{checkoutPrice.toLocaleString()}
                  </div>
                  <span className="text-[11px] text-slate-500 font-medium">
                    {billingCycle === 'annual' ? 'Billed annually (Save 20%)' : 'Billed monthly'}
                  </span>
                </div>
              </div>

              {/* Gateway Selection Grid */}
              <div className="space-y-3">
                <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Select Payment Gateway / Method:
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  
                  {/* Gateway 1: Paystack */}
                  <div
                    onClick={() => {
                      setSelectedGateway('paystack');
                      setBankInfo(null);
                    }}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                      selectedGateway === 'paystack'
                        ? 'border-[#ea580c] bg-orange-50/40 ring-2 ring-[#ea580c]/20 shadow-xs'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="w-8 h-8 rounded-xl bg-orange-100 text-[#ea580c] flex items-center justify-center font-bold text-sm">
                        <i className="fa-solid fa-credit-card"></i>
                      </div>
                      <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded bg-orange-100 text-[#ea580c]">
                        INSTANT
                      </span>
                    </div>
                    <div className="font-bold text-slate-900 text-xs">Paystack Gateway</div>
                    <div className="text-[11px] text-slate-500 mt-1">
                      Nigerian Debit Cards, USSD, Direct Bank Transfer & Apple Pay.
                    </div>
                  </div>

                  {/* Gateway 2: Flutterwave */}
                  <div
                    onClick={() => {
                      setSelectedGateway('flutterwave');
                      setBankInfo(null);
                    }}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                      selectedGateway === 'flutterwave'
                        ? 'border-[#ea580c] bg-orange-50/40 ring-2 ring-[#ea580c]/20 shadow-xs'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold text-sm">
                        <i className="fa-solid fa-money-bill-transfer"></i>
                      </div>
                      <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-800">
                        INSTANT
                      </span>
                    </div>
                    <div className="font-bold text-slate-900 text-xs">Flutterwave Gateway</div>
                    <div className="text-[11px] text-slate-500 mt-1">
                      Mastercard, Visa, Verve, Mobile Money, and Barter.
                    </div>
                  </div>

                  {/* Gateway 3: Direct Bank Wire */}
                  <div
                    onClick={() => {
                      setSelectedGateway('bank_transfer');
                    }}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                      selectedGateway === 'bank_transfer'
                        ? 'border-[#ea580c] bg-orange-50/40 ring-2 ring-[#ea580c]/20 shadow-xs'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-sm">
                        <i className="fa-solid fa-building-columns"></i>
                      </div>
                      <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded bg-slate-200 text-slate-700">
                        OFFLINE
                      </span>
                    </div>
                    <div className="font-bold text-slate-900 text-xs">Bank Wire Transfer</div>
                    <div className="text-[11px] text-slate-500 mt-1">
                      Wire to Apex MFB / Corporate Account and upload payment slip.
                    </div>
                  </div>

                </div>
              </div>

              {/* Direct Bank Wire Details Screen (If Bank Transfer Chosen & Clicked) */}
              {bankInfo && selectedGateway === 'bank_transfer' ? (
                <div className="p-5 rounded-2xl bg-amber-50/60 border border-amber-200 space-y-3 animate-in fade-in">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-amber-900 uppercase tracking-wider flex items-center gap-1.5">
                      <i className="fa-solid fa-building-columns text-[#ea580c]"></i>
                      Corporate Bank Wire Instructions
                    </span>
                    <span className="text-[10px] font-mono bg-amber-100 text-amber-900 px-2 py-0.5 rounded border border-amber-300">
                      Narration Reference: {bankInfo.reference}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1">
                    <div className="p-3 bg-white rounded-xl border border-amber-200">
                      <span className="text-[10px] text-slate-400 block font-bold uppercase">Bank Name</span>
                      <span className="font-bold text-slate-900">{bankInfo.bank_details?.bank_name || 'Apex Microfinance Bank / Wema Bank'}</span>
                    </div>
                    <div className="p-3 bg-white rounded-xl border border-amber-200">
                      <span className="text-[10px] text-slate-400 block font-bold uppercase">Account Name</span>
                      <span className="font-bold text-slate-900">{bankInfo.bank_details?.account_name || 'TruePriv Compliance Technologies Ltd'}</span>
                    </div>
                    <div className="p-3 bg-white rounded-xl border border-amber-200">
                      <span className="text-[10px] text-slate-400 block font-bold uppercase">Account Number</span>
                      <span className="font-mono font-black text-slate-900 text-sm">{bankInfo.bank_details?.account_number || '0123456789'}</span>
                    </div>
                    <div className="p-3 bg-white rounded-xl border border-amber-200">
                      <span className="text-[10px] text-slate-400 block font-bold uppercase">Amount to Wire</span>
                      <span className="font-mono font-black text-[#ea580c] text-sm">₦{checkoutPrice.toLocaleString()}</span>
                    </div>
                  </div>

                  <div className="p-3 bg-white/80 rounded-xl border border-amber-200 text-[11px] text-slate-600 space-y-1">
                    <div className="font-bold text-slate-800">Next Steps:</div>
                    <div>1. Transfer exact amount using the narration reference <strong>{bankInfo.reference}</strong>.</div>
                    <div>2. Save payment confirmation / transfer slip (PDF or image).</div>
                    <div>3. You will upload this slip in Point 3 for instant admin review and 365-day activation.</div>
                  </div>
                </div>
              ) : null}

              {/* Action Buttons */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedPlanForCheckout(null);
                    setBankInfo(null);
                  }}
                  className="w-full sm:w-auto px-5 py-3 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={handleProceedPayment}
                  disabled={upgradingTier !== null}
                  className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#ea580c] hover:bg-[#c2410c] text-white text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {upgradingTier ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Connecting to {selectedGateway.toUpperCase()}...</span>
                    </>
                  ) : selectedGateway === 'bank_transfer' ? (
                    <>
                      <i className="fa-solid fa-arrow-right text-xs"></i>
                      <span>Generate Bank Narration & View Details</span>
                    </>
                  ) : (
                    <>
                      <i className="fa-solid fa-lock text-xs"></i>
                      <span>Pay ₦{checkoutPrice.toLocaleString()} via {selectedGateway === 'paystack' ? 'Paystack' : 'Flutterwave'}</span>
                    </>
                  )}
                </button>
              </div>

            </div>
          ) : (
            /* DEFAULT VIEW: PLANS SELECTION & PRICING GRID */
            <>
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
                          ? 'bg-orange-100 text-orange-800 border border-orange-200' 
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
                      {data?.days_remaining != null ? `${data.days_remaining} Days Left` : (loading ? 'Loading...' : 'Active')}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Report Export Entitlement</span>
                    <span className={`text-xs font-bold flex items-center gap-1 ${data?.can_export_reports ? 'text-[#ea580c]' : 'text-slate-400'}`}>
                      <i className={`fa-solid ${data?.can_export_reports ? 'fa-circle-check text-[#ea580c]' : 'fa-lock'}`}></i>
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
                    <span>Annual (365-Day Plan)</span>
                    <span className="ml-1.5 px-1.5 py-0.2 bg-orange-100 text-orange-800 text-[10px] rounded-full font-mono">
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
                    Monthly Plan
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
                        <i className="fa-solid fa-check text-slate-600 text-[11px]"></i>
                        <span>Up to 3 Third-Party Processors</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <i className="fa-solid fa-check text-slate-600 text-[11px]"></i>
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

                {/* Plan 2: Growth Enterprise - FEATURED */}
                <div className={`p-6 rounded-3xl border flex flex-col justify-between transition-all relative overflow-hidden ${
                  currentTier === 'growth_enterprise'
                    ? 'bg-orange-50/40 border-[#ea580c] ring-2 ring-[#ea580c]/20'
                    : 'bg-white border-orange-300 shadow-md ring-1 ring-[#ea580c]/20'
                }`}>
                  <div className="absolute top-0 right-0 bg-[#ea580c] text-white text-[9px] font-black uppercase px-3 py-1 rounded-bl-xl tracking-wider">
                    POPULAR CHOICE
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-xs font-bold text-[#ea580c] uppercase tracking-wider">Corporate Tier</span>
                    </div>
                    <h4 className="text-base font-black text-slate-900">Growth Enterprise</h4>
                    <div className="mt-2.5 mb-4">
                      <span className="text-2xl font-black text-slate-900 font-mono">
                        {billingCycle === 'annual' ? '₦450,000' : '₦45,000'}
                      </span>
                      <span className="text-xs text-slate-500"> / {billingCycle === 'annual' ? '365 days' : 'month'}</span>
                    </div>
                    <p className="text-xs text-slate-500 mb-4 leading-relaxed">
                      Full compliance management suite with automated reporting and department intake.
                    </p>

                    <ul className="space-y-2.5 text-xs text-slate-700 mb-6">
                      <li className="flex items-center gap-2">
                        <i className="fa-solid fa-circle-check text-[#ea580c] text-xs"></i>
                        <span className="font-semibold text-slate-900">Official PDF/CSV NDPC Filing Packs</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <i className="fa-solid fa-circle-check text-[#ea580c] text-xs"></i>
                        <span>Unlimited Third-Party Vendors</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <i className="fa-solid fa-circle-check text-[#ea580c] text-xs"></i>
                        <span>Department Champions Intake Desk</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <i className="fa-solid fa-circle-check text-[#ea580c] text-xs"></i>
                        <span>Galaxy Backbone Onshore Residency</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <i className="fa-solid fa-circle-check text-[#ea580c] text-xs"></i>
                        <span>Zero-GTM Cookie Consent CMP</span>
                      </li>
                    </ul>
                  </div>

                  <button
                    onClick={() => handleSelectPlan('growth_enterprise')}
                    disabled={currentTier === 'growth_enterprise' && isPaidActive}
                    className="w-full py-3 bg-[#ea580c] hover:bg-[#c2410c] text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                  >
                    {currentTier === 'growth_enterprise' && isPaidActive ? (
                      <span>Current Active Plan</span>
                    ) : (
                      <>
                        <i className="fa-solid fa-bolt text-xs"></i>
                        <span>Select Plan & Choose Gateway</span>
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
                      <span className="text-xs text-slate-500"> / {billingCycle === 'annual' ? '365 days' : 'month'}</span>
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
                    onClick={() => handleSelectPlan('dpco_audit_suite')}
                    disabled={currentTier === 'dpco_audit_suite' && isPaidActive}
                    className="w-full py-3 bg-purple-700 hover:bg-purple-600 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                  >
                    {currentTier === 'dpco_audit_suite' && isPaidActive ? (
                      <span>Current Active Plan</span>
                    ) : (
                      <>
                        <i className="fa-solid fa-building-columns text-xs"></i>
                        <span>Select Plan & Choose Gateway</span>
                      </>
                    )}
                  </button>
                </div>

              </div>
            </>
          )}

          {/* Payment History Log */}
          {data?.payments_history && data.payments_history.length > 0 && !selectedPlanForCheckout && (
            <div className="pt-6 border-t border-slate-100">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">
                Recent Gateway Transactions & Ledger
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
                    {data?.payments_history?.map((p) => (
                      <tr key={p.id} className="hover:bg-slate-50/60">
                        <td className="p-3 font-mono font-medium text-slate-800">{p.transaction_reference}</td>
                        <td className="p-3 uppercase font-bold text-slate-800 text-[11px]">{p.payment_gateway}</td>
                        <td className="p-3 font-mono font-bold text-slate-900">₦{Number(p.amount_paid).toLocaleString()}</td>
                        <td className="p-3 text-slate-500">{new Date(p.paid_at || p.created_at).toLocaleDateString()}</td>
                        <td className="p-3">
                          <span className="px-2 py-0.5 bg-slate-100 text-slate-700 border border-slate-200 rounded-md font-mono text-[10px] font-bold">
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
            <i className="fa-solid fa-shield-check text-[#ea580c]"></i>
            <span>256-bit SSL Encrypted • Direct CBN & NDPC Compliant Billing</span>
          </div>
          <button
            onClick={() => {
              setSelectedPlanForCheckout(null);
              setBankInfo(null);
              onClose();
            }}
            className="px-4 py-2 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl font-bold text-slate-700 transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
}
