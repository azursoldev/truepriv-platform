import React, { useState, useEffect, useRef } from 'react';
import Sidebar from './components/Sidebar';
import ExecutiveDashboard from './components/ExecutiveDashboard';
import AdminUserDesk from './components/AdminUserDesk';          // M1: RBAC
import AuditDesk from './components/AuditDesk';                  // M3: Audit Logging
import PublicChampionIntakePortal from './components/PublicChampionIntakePortal'; // M3: Guest Intake
import ChampionInviteModal from './components/ChampionInviteModal';               // M3: Guest Invitations
import AuthModal from './components/AuthModal';                  // M2: Login/Register
import MyProfileDetailDesk from './components/MyProfileDetailDesk'; // M2: Profile Types
import PortfolioDesk from './components/PortfolioDesk';          // M2: DPO & DPCO Portals (PDF Sec 10)
import DataResidencyCard from './components/DataResidencyCard';  // M3: Data Residency (PDF Sec 11)
import RopaDesk from './components/RopaDesk';                    // M2/M3: Processing
import VendorDesk from './components/VendorDesk';                // M2/M3: Vendors
import DsarDesk from './components/DsarDesk';
import BreachDesk from './components/BreachDesk';
import DpiaDesk from './components/DpiaDesk';
import ModulePreviewDesk from './components/ModulePreviewDesk';  // TruePriv Screens
import SubscriptionBillingDesk from './components/SubscriptionBillingDesk'; // Milestone 4: Subscriptions & Billing Full Page
import InteractiveTourGuide from './components/InteractiveTourGuide';      // Interactive Dashboard Tour & Guidance
import { api, getAuthToken, removeAuthToken, setActiveTenantId } from './lib/api';

export default function App() {
  const [user, setUser] = useState(null);
  const [tenant, setTenant] = useState(null);
  const [accessibleClients, setAccessibleClients] = useState([]);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [settingsSubTab, setSettingsSubTab] = useState('users');
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [dismissGlobalSubBanner, setDismissGlobalSubBanner] = useState(false);
  const [isTourOpen, setIsTourOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef(null);

  // Close profile dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(e.target)) {
        setIsProfileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const initApp = async () => {
    setLoading(true);
    const token = getAuthToken();
    if (!token) {
      setShowAuthModal(true);
      setLoading(false);
      return;
    }

    try {
      const meRes = await api.getMe();
      if (meRes.success) {
        setUser(meRes.user);
        setTenant(meRes.tenant);
        setShowAuthModal(false);

        // Fetch accessible clients if DPO or DPCO
        const isDpoOrDpco = ['outsourced_dpo', 'dpco_firm', 'dpco_lead_auditor', 'dpco_staff'].includes(meRes.tenant?.type || meRes.user?.role);
        if (isDpoOrDpco) {
          const pRes = await api.getPortfolioClients().catch(() => null);
          if (pRes && pRes.success) {
            setAccessibleClients(pRes.clients);
          }
        }

        // Fetch dashboard metrics
        await refreshMetrics();

        // Trigger welcome onboarding tour if first visit and not dismissed
        const tourCompleted = localStorage.getItem('truepriv_tour_completed');
        const tourDismissed = sessionStorage.getItem('truepriv_tour_dismissed');
        if (!tourCompleted && !tourDismissed) {
          setIsTourOpen(true);
        }
      }
    } catch (err) {
      console.warn('Session expired or unauthenticated:', err);
      removeAuthToken();
      setShowAuthModal(true);
    } finally {
      setLoading(false);
    }
  };

  const refreshMetrics = async () => {
    try {
      const res = await api.getDashboardMetrics();
      if (res.success) {
        setMetrics(res);
        if (res.tenant) {
          setTenant(prev => ({ ...prev, ...res.tenant }));
        }
      }
    } catch (err) {
      console.error('Error fetching metrics:', err);
    }
  };

  useEffect(() => {
    initApp();
  }, []);

  const handleLoginSuccess = (loggedInUser, loggedInTenant, clients = []) => {
    setUser(loggedInUser);
    setTenant(loggedInTenant);
    setAccessibleClients(clients);
    setShowAuthModal(false);
    setActiveTab('dashboard');
    refreshMetrics();
  };

  const handleSwitchTenant = async (newTenantId) => {
    setActiveTenantId(newTenantId);
    setLoading(true);
    try {
      const meRes = await api.getMe();
      if (meRes.success) {
        setTenant(meRes.tenant);
        await refreshMetrics();
        setActiveTab('dashboard');
      }
    } catch (err) {
      console.error('Failed to switch tenant context:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await api.logout();
    } catch (e) {}
    removeAuthToken();
    setUser(null);
    setTenant(null);
    setMetrics(null);
    setShowAuthModal(true);
  };

  // Standalone Public Champion Intake Portal
  const urlParams = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '');
  const intakeToken = urlParams.get('token');
  const isChampionIntakeRoute = typeof window !== 'undefined' && (
    window.location.pathname.includes('champion-intake') || 
    (intakeToken && (!getAuthToken() || urlParams.get('scope') === 'champion'))
  );

  if (isChampionIntakeRoute) {
    return <PublicChampionIntakePortal token={intakeToken} />;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex flex-col items-center justify-center text-slate-700 space-y-3">
        <div className="w-9 h-9 rounded-xl border-2 border-[#ea580c] border-t-transparent animate-spin" />
        <div className="text-xs font-mono tracking-wider text-slate-500">Loading TruePriv Workspace...</div>
      </div>
    );
  }

  if (!user || showAuthModal) {
    return <AuthModal onLoginSuccess={handleLoginSuccess} />;
  }

  const userRole = user?.role || 'corporate_admin';
  const isSuperAdmin = userRole === 'super_admin';
  const isCorporateAdmin = userRole === 'corporate_admin';
  const isComplianceOfficer = userRole === 'compliance_officer';
  const isDpo = userRole === 'outsourced_dpo';
  const isDpco = userRole === 'dpco_lead_auditor' || userRole === 'dpco_staff' || tenant?.type === 'dpco_firm';
  const isConsultancy = isDpo || isDpco || tenant?.type === 'outsourced_dpo';
  const isChampion = userRole === 'dept_champion';

  // Role permissions
  const canAccessClientPortfolio = isConsultancy || isSuperAdmin;
  const canAccessDpoProgramme = isDpo || isSuperAdmin;
  const canAccessProspects = isConsultancy || isSuperAdmin;
  const canAccessBilling = isSuperAdmin || isCorporateAdmin;
  const canAccessSettings = isSuperAdmin || isCorporateAdmin;

  // Milestone 4 Point 5: Global Expiration & Warning Alert Status
  const sub = metrics?.subscription;
  const isGlobalExpired = sub?.is_expired || sub?.status === 'expired' || (sub?.days_remaining === 0 && sub?.plan_tier !== 'starter_corporate' && sub?.status !== 'grace_period');
  const isGlobalGrace = sub?.is_grace_period || sub?.status === 'grace_period';
  const isGlobalUrgent = !isGlobalExpired && !isGlobalGrace && sub?.days_remaining > 0 && sub?.days_remaining <= 7 && sub?.plan_tier !== 'starter_corporate';
  const showGlobalAlert = !dismissGlobalSubBanner && (isGlobalExpired || isGlobalGrace || isGlobalUrgent) && activeTab !== 'billing';

  const renderAccessDenied = (featureTitle, requiredRoleText) => (
    <div className="max-w-2xl mx-auto my-12 bg-white border border-slate-200/90 rounded-3xl p-8 text-center shadow-xs animate-in fade-in">
      <div className="w-14 h-14 bg-rose-50 border border-rose-200 text-rose-600 rounded-2xl flex items-center justify-center text-2xl mx-auto mb-4">
        <i className="fa-solid fa-shield-halved"></i>
      </div>
      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 text-[10px] font-bold uppercase tracking-wider mb-2">
        Role Permission Guard • NDPA RBAC
      </div>
      <h2 className="text-xl font-bold text-slate-900 tracking-tight">Access Restricted</h2>
      <p className="text-xs text-slate-500 mt-2 max-w-md mx-auto leading-relaxed">
        Your current account is assigned the <strong className="text-slate-800">{userRole.replace('_', ' ').toUpperCase()}</strong> role.
        The <strong className="text-slate-800">{featureTitle}</strong> page is restricted to <strong className="text-slate-800">{requiredRoleText}</strong>.
      </p>
      <div className="mt-6 flex justify-center gap-3">
        <button
          onClick={() => setActiveTab('dashboard')}
          className="px-4 py-2 bg-[#ea580c] hover:bg-[#c2410c] text-white rounded-xl text-xs font-bold transition-all shadow-2xs flex items-center gap-2 cursor-pointer"
        >
          <i className="fa-solid fa-arrow-left text-xs"></i>
          <span>Return to Overview Dashboard</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 flex antialiased">
      
      {/* 1. Left Sidebar Navigation (Matches TruePriv Screenshot) */}
      <Sidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        tenant={tenant}
        user={user}
        accessibleClients={accessibleClients}
        onSwitchTenant={handleSwitchTenant}
        onLogout={handleLogout}
        isCollapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      {/* 2. Main Content Workspace */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen overflow-x-hidden">
        
        {/* Mobile Top Toggle Header (hidden on desktop) */}
        <div className="md:hidden bg-white border-b border-slate-200/90 px-4 py-3 flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="p-1.5 text-slate-500 hover:text-slate-900 rounded-lg hover:bg-slate-50"
            >
              <i className="fa-solid fa-bars text-sm"></i>
            </button>
            <span className="text-sm font-bold text-slate-900">TruePriv</span>
          </div>
          <span className="text-xs font-medium text-slate-500 truncate max-w-[150px]">
            {tenant?.name || 'DPCO TEST ACCOUNT'}
          </span>
        </div>

        {/* Workspace Top Bar (With Role Indicators & Authorized Actions) */}
        <div className="bg-white border-b border-slate-200/90 px-4 sm:px-8 py-3.5 flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-slate-800 hidden sm:inline">Workspace:</span>
            <span id="tour-workspace" className="text-xs font-semibold text-slate-900 bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-lg">
              {tenant?.name || (isSuperAdmin ? 'GLOBAL PLATFORM ROOT' : 'APEX MICROFINANCE BANK NIGERIA')}
            </span>
            {isSuperAdmin && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-50 text-amber-900 border border-amber-300">
                <i className="fa-solid fa-crown text-[10px] text-amber-600"></i>
                Super Admin Mode
              </span>
            )}
          </div>

          <div className="flex items-center gap-2.5">
            {/* Interactive Guided Tour / Tooltips Button */}
            <button
              id="tour-header-guide"
              onClick={() => setIsTourOpen(true)}
              title="Start Interactive Portal Walkthrough"
              className="px-3 py-1.5 rounded-xl border border-orange-200 hover:border-orange-300 bg-orange-50/70 hover:bg-orange-100 text-[#ea580c] text-xs font-bold flex items-center gap-1.5 transition-all shadow-2xs cursor-pointer"
            >
              <i className="fa-solid fa-compass text-[#ea580c]"></i>
              <span>Guided Tour</span>
            </button>

            {/* Subscription & Plans: Super Admin & Corporate Admin only */}
            {canAccessBilling && (
              <button
                id="tour-header-billing"
                onClick={() => setActiveTab('billing')}
                className={`px-3.5 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-2 transition-all shadow-2xs cursor-pointer ${
                  activeTab === 'billing'
                    ? 'bg-[#ea580c] text-white border-[#ea580c]'
                    : 'bg-white hover:bg-slate-50 text-slate-800 border-slate-200'
                }`}
              >
                <i className="fa-solid fa-credit-card text-[#ea580c]"></i>
                <span className="hidden sm:inline">Subscription & Plans</span>
                <span className={`px-1.5 py-0.2 rounded text-[10px] font-mono ${
                  activeTab === 'billing' ? 'bg-white/20 text-white' : 'bg-[#ea580c] text-white'
                }`}>
                  365-Day Plan
                </span>
              </button>
            )}

            {/* User Profile & Workspace Settings Dropdown */}
            <div className="relative" ref={profileMenuRef}>
              <button
                id="tour-header-profile"
                onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                title="Account Settings & Profile"
                className={`flex items-center gap-2 pl-2 pr-2.5 py-1.5 rounded-xl border transition-all cursor-pointer shadow-2xs group ${
                  isProfileMenuOpen
                    ? 'border-[#ea580c] bg-orange-50/60 ring-2 ring-orange-500/20'
                    : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50 bg-white'
                }`}
              >
                <div className="w-6 h-6 rounded-lg bg-[#ea580c] text-white flex items-center justify-center text-xs font-black font-mono shadow-2xs">
                  {user?.name ? user.name.charAt(0).toUpperCase() : 'T'}
                </div>
                <div className="text-left hidden md:block">
                  <div className="text-xs font-bold text-slate-800 leading-none group-hover:text-[#ea580c] transition-colors">
                    {user?.name || 'Tunde Bakare'}
                  </div>
                </div>
                <i className={`fa-solid fa-chevron-down text-[10px] text-slate-400 transition-transform duration-200 ${isProfileMenuOpen ? 'rotate-180 text-[#ea580c]' : ''}`}></i>
              </button>

              {/* Profile & Settings Dropdown Menu */}
              {isProfileMenuOpen && (
                <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-slate-200/90 py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                  {/* User Identity Header */}
                  <div className="px-4 py-3 border-b border-slate-100 flex items-center gap-3 bg-slate-50/60">
                    <div className="w-10 h-10 rounded-xl bg-[#ea580c] text-white flex items-center justify-center text-base font-black font-mono shadow-xs flex-shrink-0">
                      {user?.name ? user.name.charAt(0).toUpperCase() : 'T'}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-bold text-slate-900 truncate">
                        {user?.name || 'Tunde Bakare'}
                      </div>
                      <div className="text-[11px] text-slate-500 truncate">
                        {user?.email || 'compliance@apexmfb.ng'}
                      </div>
                      <div className="inline-block px-2 py-0.5 mt-1 rounded text-[10px] font-bold bg-orange-50 text-orange-700 border border-orange-200 uppercase tracking-tight">
                        {user?.role?.replace(/_/g, ' ') || 'Corporate Admin'}
                      </div>
                    </div>
                  </div>

                  {/* Settings & Team Access Group */}
                  <div className="py-1.5 px-1.5 space-y-0.5">
                    <div className="px-2.5 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">
                      Settings & Governance
                    </div>
                    
                    <button
                      onClick={() => {
                        setActiveTab('settings');
                        setSettingsSubTab('users');
                        setIsProfileMenuOpen(false);
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition-all text-left cursor-pointer"
                    >
                      <i className="fa-solid fa-gear text-slate-400 w-4 text-center"></i>
                      <span>Workspace Settings</span>
                    </button>

                    <button
                      onClick={() => {
                        setActiveTab('settings');
                        setSettingsSubTab('users');
                        setIsProfileMenuOpen(false);
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition-all text-left cursor-pointer"
                    >
                      <i className="fa-solid fa-users-gear text-slate-400 w-4 text-center"></i>
                      <span>Users & Roles (RBAC)</span>
                    </button>

                    <button
                      onClick={() => {
                        setActiveTab('settings');
                        setSettingsSubTab('audit');
                        setIsProfileMenuOpen(false);
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition-all text-left cursor-pointer"
                    >
                      <i className="fa-solid fa-shield-halved text-slate-400 w-4 text-center"></i>
                      <span>Security Audit Logs</span>
                    </button>

                    <button
                      onClick={() => {
                        setActiveTab('settings');
                        setSettingsSubTab('guests');
                        setIsProfileMenuOpen(false);
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition-all text-left cursor-pointer"
                    >
                      <i className="fa-solid fa-user-plus text-slate-400 w-4 text-center"></i>
                      <span>Guest Link Invitations</span>
                    </button>

                    {isSuperAdmin && (
                      <button
                        onClick={() => {
                          setActiveTab('settings');
                          setSettingsSubTab('residency');
                          setIsProfileMenuOpen(false);
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition-all text-left cursor-pointer"
                      >
                        <i className="fa-solid fa-building-shield text-slate-400 w-4 text-center"></i>
                        <span>Data Residency Node</span>
                      </button>
                    )}
                  </div>

                  {/* Billing & Documentation Group */}
                  <div className="py-1.5 px-1.5 border-t border-slate-100 space-y-0.5">
                    <div className="px-2.5 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">
                      Billing & Resources
                    </div>

                    <button
                      onClick={() => {
                        setActiveTab('billing');
                        setIsProfileMenuOpen(false);
                      }}
                      className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition-all text-left cursor-pointer"
                    >
                      <div className="flex items-center gap-2.5">
                        <i className="fa-solid fa-credit-card text-slate-400 w-4 text-center"></i>
                        <span>Subscription & Plans</span>
                      </div>
                      <span className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-[#ea580c] text-white font-bold">
                        365-Day Plan
                      </span>
                    </button>

                    <button
                      onClick={() => {
                        setActiveTab('help');
                        setIsProfileMenuOpen(false);
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition-all text-left cursor-pointer"
                    >
                      <i className="fa-regular fa-circle-question text-slate-400 w-4 text-center"></i>
                      <span>Help Centre & Guides</span>
                    </button>
                  </div>

                  {/* Sign Out */}
                  <div className="pt-1.5 px-1.5 border-t border-slate-100">
                    <button
                      onClick={() => {
                        setIsProfileMenuOpen(false);
                        handleLogout();
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 transition-all text-left cursor-pointer"
                    >
                      <i className="fa-solid fa-arrow-right-from-bracket text-rose-500 w-4 text-center"></i>
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Client Portfolio shortcut for DPO / DPCO */}
            {canAccessClientPortfolio && !canAccessBilling && (
              <button
                onClick={() => setActiveTab('portfolio-desk')}
                className={`px-3.5 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-2 transition-all shadow-2xs cursor-pointer ${
                  activeTab === 'portfolio-desk'
                    ? 'bg-[#ea580c] text-white border-[#ea580c]'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                }`}
              >
                <i className="fa-regular fa-folder-closed"></i>
                <span>Client Portfolio</span>
              </button>
            )}

            {/* Role indicator badge for Compliance Officer */}
            {isComplianceOfficer && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold">
                <i className="fa-solid fa-shield-halved text-blue-600"></i>
                Compliance Officer Desk
              </span>
            )}

            {/* Role indicator badge for Dept Champion */}
            {isChampion && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-50 border border-purple-200 text-purple-700 text-xs font-bold">
                <i className="fa-solid fa-users text-purple-600"></i>
                Dept Intake Seat
              </span>
            )}
          </div>
        </div>

        {/* Milestone 4 Point 5: Top Global Subscription Expiry & Compliance Lock Banner */}
        {showGlobalAlert && (
          <div className={`px-4 sm:px-6 py-2.5 text-xs font-bold transition-all shadow-xs flex items-center justify-between gap-3 ${
            isGlobalExpired 
              ? 'bg-rose-600 text-white' 
              : isGlobalGrace 
                ? 'bg-amber-600 text-white' 
                : 'bg-orange-600 text-white'
          }`}>
            <div className="flex items-center gap-2.5 max-w-5xl mx-auto flex-1">
              <span className="w-6 h-6 rounded-lg bg-white/20 flex items-center justify-center text-xs flex-shrink-0 animate-pulse">
                <i className={`fa-solid ${isGlobalExpired ? 'fa-lock' : isGlobalGrace ? 'fa-hourglass-half' : 'fa-triangle-exclamation'}`}></i>
              </span>
              <span className="font-semibold text-[11px] sm:text-xs">
                {isGlobalExpired && (
                  <span>
                    <strong>COMPLIANCE EXPORT LOCK ENFORCED:</strong> Your organization's statutory NDPA subscription has expired. Official NDPC PDF/CSV reports and auditor digital seal exports are locked.
                  </span>
                )}
                {isGlobalGrace && (
                  <span>
                    <strong>STATUTORY GRACE PERIOD ACTIVE:</strong> Your annual compliance subscription cycle has concluded. Settle renewal payment within 7 days to avoid automated regulatory export lockdown.
                  </span>
                )}
                {isGlobalUrgent && (
                  <span>
                    <strong>CRITICAL NOTICE:</strong> Only {sub?.days_remaining} days remaining on your TruePriv statutory license before regulatory compliance export restriction.
                  </span>
                )}
              </span>
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                onClick={() => setActiveTab('billing')}
                className="px-3 py-1 rounded-lg bg-white text-slate-900 hover:bg-slate-100 text-[11px] font-black tracking-tight transition-all shadow-2xs flex items-center gap-1.5 cursor-pointer"
              >
                <span>{isGlobalExpired ? 'Reactivate Now' : 'Renew Subscription'}</span>
                <i className="fa-solid fa-arrow-right text-[9px]"></i>
              </button>
              <button
                onClick={() => setDismissGlobalSubBanner(true)}
                className="w-6 h-6 rounded-lg hover:bg-white/20 flex items-center justify-center text-white/80 hover:text-white transition-all cursor-pointer text-xs"
                title="Dismiss Banner"
              >
                &times;
              </button>
            </div>
          </div>
        )}

        {/* Dynamic Workspace Container */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <div id={`tour-page-${activeTab}`} className="h-full">
          
          {/* A. Overview (Exact Client Screenshot Match) */}
          {(activeTab === 'dashboard' || activeTab === 'overview') && (
            <ExecutiveDashboard
              metrics={metrics}
              userRole={user?.role}
              tenantType={tenant?.type}
              tenant={tenant}
              onNavigate={setActiveTab}
              onOpenTour={() => setIsTourOpen(true)}
            />
          )}

          {/* B. My work */}
          {activeTab === 'work' && (
            <ModulePreviewDesk
              moduleKey="work"
              title="My work & Actions"
              subtitle="See the tasks, assessments, and statutory deadlines that need your attention."
              badge="Work Queue"
              tenant={tenant}
              onNavigate={setActiveTab}
            />
          )}

          {/* C. Calendar */}
          {activeTab === 'calendar' && (
            <ModulePreviewDesk
              moduleKey="calendar"
              title="Compliance Calendar"
              subtitle="Track statutory audit deadlines, recurring review cycles, and guest token expirations."
              badge="Schedule"
              tenant={tenant}
              onNavigate={setActiveTab}
            />
          )}

          {/* D. Client portfolio (M2: DPO & DPCO Console) */}
          {activeTab === 'portfolio-desk' && (
            canAccessClientPortfolio ? (
              <PortfolioDesk
                onSwitchTenant={handleSwitchTenant}
                tenantType={tenant?.type}
                userRole={user?.role}
              />
            ) : (
              renderAccessDenied('Client Portfolio Console', 'Outsourced DPOs, DPCO Auditors, or Super Admin')
            )
          )}

          {/* E. Processing activities (RoPA) */}
          {activeTab === 'processing' && (
            <RopaDesk onRefreshMetrics={refreshMetrics} />
          )}

          {/* F. Systems */}
          {activeTab === 'systems' && (
            <div id="tour-systems-inventory">
              <ModulePreviewDesk
                moduleKey="systems"
                title="Systems & Data Assets"
                subtitle="Maintain systems, servers, and data repositories used across your processing records."
                badge="Asset Inventory"
                tenant={tenant}
                onNavigate={setActiveTab}
              />
            </div>
          )}

          {/* G. Vendors */}
          {activeTab === 'vendors' && (
            <VendorDesk onRefreshMetrics={refreshMetrics} />
          )}

          {/* H. Transfers */}
          {activeTab === 'transfers' && (
            <ModulePreviewDesk
              moduleKey="transfers"
              title="International Data Transfers"
              subtitle="Assess cross-border personal data transfers and document legal safeguards under NDPA Section 41–43."
              badge="Cross-Border"
              tenant={tenant}
              onNavigate={setActiveTab}
            />
          )}

          {/* I. Contracts */}
          {activeTab === 'contracts' && (
            <ModulePreviewDesk
              moduleKey="contracts"
              title="Privacy Contracts & DPAs"
              subtitle="Track data processing addendums, processor agreements, and privacy clauses."
              badge="Agreements"
              tenant={tenant}
              onNavigate={setActiveTab}
            />
          )}

          {/* J. Assessments Group */}
          {activeTab === 'dpia' && (
            <DpiaDesk onRefreshMetrics={refreshMetrics} />
          )}
          {activeTab === 'lia' && (
            <ModulePreviewDesk
              moduleKey="lia"
              title="Legitimate Interest Assessment (LIA)"
              subtitle="Evaluate necessity, proportionality, and balancing tests before relying on legitimate interests."
              badge="Assessment"
              tenant={tenant}
              onNavigate={setActiveTab}
            />
          )}
          {activeTab === 'tia' && (
            <ModulePreviewDesk
              moduleKey="tia"
              title="Transfer Impact Assessment (TIA)"
              subtitle="Assess destination country adequacy, supplementary measures, and third-party access risks."
              badge="Cross-Border"
              tenant={tenant}
              onNavigate={setActiveTab}
            />
          )}
          {activeTab === 'vra' && (
            <ModulePreviewDesk
              moduleKey="vra"
              title="Vendor Risk Assessment (VRA)"
              subtitle="Evaluate third-party processor security safeguards, DPAs, and compliance posture."
              badge="Vendor Risk"
              tenant={tenant}
              onNavigate={setActiveTab}
            />
          )}

          {/* K. Respond Group */}
          {activeTab === 'dsar' && (
            <DsarDesk onRefreshMetrics={refreshMetrics} />
          )}
          {activeTab === 'breach' && (
            <BreachDesk onRefreshMetrics={refreshMetrics} />
          )}
          {activeTab === 'regulatory-filings' && (
            <ModulePreviewDesk
              moduleKey="reports"
              title="Regulatory Filings & CAR Desk"
              subtitle="Prepare validated compliance packages, DPCO audit returns, and statutory NDPC filings."
              badge="Statutory"
              tenant={tenant}
              onNavigate={setActiveTab}
            />
          )}

          {/* L. Improve Group (Upcoming Milestones - Inactive) */}

          {/* M. Consultancy Group */}
          {activeTab === 'prospects' && (
            canAccessProspects ? (
              <ModulePreviewDesk
                moduleKey="work"
                title="Client Prospects & Pre-Onboarding"
                subtitle="Assess potential clients, send questionnaire invitations, and evaluate initial tier classification."
                badge="Consultancy"
                tenant={tenant}
                onNavigate={setActiveTab}
              />
            ) : (
              renderAccessDenied('Client Prospects & Pre-Onboarding', 'Consultancy Practices or Super Admin')
            )
          )}

          {/* N. Reports */}
          {activeTab === 'reports' && (
            <ModulePreviewDesk
              moduleKey="reports"
              title="Reports & Executive Analytics"
              subtitle="Generate executive privacy summaries, statutory RoPA exports, and evidence bundles."
              badge="Reporting"
              tenant={tenant}
              onNavigate={setActiveTab}
            />
          )}

          {/* K. Settings (M1-M3: Users, RBAC, Audit Logs, Guest Links, Data Residency) */}
          {activeTab === 'settings' && (
            canAccessSettings ? (
              <div className="space-y-6">
                
                {/* Settings Navigation Tabs */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/90 pb-3">
                  <div>
                    <h1 className="text-xl font-bold tracking-tight text-slate-900">Workspace Settings & Governance</h1>
                    <p className="text-xs text-slate-500 mt-1">Configure staff access, review security audit trails, and manage tenant preferences.</p>
                  </div>

                  <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl text-xs font-medium self-start sm:self-auto">
                    <button
                      onClick={() => setSettingsSubTab('users')}
                      className={`px-3 py-1.5 rounded-lg transition-all ${
                        settingsSubTab === 'users' ? 'bg-white text-slate-900 font-bold shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <i className="fa-solid fa-users-gear mr-1.5 text-slate-500"></i> Users & Roles
                    </button>
                    <button
                      onClick={() => setSettingsSubTab('audit')}
                      className={`px-3 py-1.5 rounded-lg transition-all ${
                        settingsSubTab === 'audit' ? 'bg-white text-slate-900 font-bold shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <i className="fa-solid fa-shield-halved mr-1.5 text-slate-500"></i> Audit Logs
                    </button>
                    <button
                      onClick={() => setSettingsSubTab('guests')}
                      className={`px-3 py-1.5 rounded-lg transition-all ${
                        settingsSubTab === 'guests' ? 'bg-white text-slate-900 font-bold shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <i className="fa-solid fa-user-plus mr-1.5 text-slate-500"></i> Guest Links
                    </button>
                    {isSuperAdmin && (
                      <button
                        onClick={() => setSettingsSubTab('residency')}
                        className={`px-3 py-1.5 rounded-lg transition-all ${
                          settingsSubTab === 'residency' ? 'bg-white text-slate-900 font-bold shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        <i className="fa-solid fa-building-shield mr-1.5 text-slate-500"></i> Data Residency
                      </button>
                    )}
                  </div>
                </div>

                {/* Subtab Content */}
                {settingsSubTab === 'users' && (
                  <AdminUserDesk currentUser={user} onRefreshMetrics={refreshMetrics} />
                )}
                {settingsSubTab === 'audit' && (
                  <AuditDesk onRefreshMetrics={refreshMetrics} />
                )}
                {settingsSubTab === 'guests' && (
                  <ChampionInviteModal onNavigateBack={() => setSettingsSubTab('users')} />
                )}
                {settingsSubTab === 'residency' && isSuperAdmin && (
                  <div className="space-y-4">
                    <div className="border-b border-slate-200 pb-3">
                      <h2 className="text-base font-bold text-slate-900">Platform Data Residency Node</h2>
                      <p className="text-xs text-slate-500 mt-0.5">Dual-residency in-country localization control under NDPA Section 20.</p>
                    </div>
                    <DataResidencyCard onResidencyChanged={refreshMetrics} />
                  </div>
                )}

              </div>
            ) : (
              renderAccessDenied('Workspace Settings & RBAC', 'Corporate Administrators and Super Administrators')
            )
          )}

          {/* L. Help centre */}
          {activeTab === 'help' && (
            <ModulePreviewDesk
              moduleKey="help"
              title="Help Centre & Regulatory Guidance"
              subtitle="Quick reference documentation for NDPA 2023 compliance, role duties, and data protection workflows."
              badge="Documentation"
              tenant={tenant}
              onNavigate={setActiveTab}
            />
          )}

          {/* M. Milestone 4: Subscription & Multi-Gateway Billing Desk (Full-Page View) */}
          {activeTab === 'billing' && (
            canAccessBilling ? (
              <SubscriptionBillingDesk
                onRefreshMetrics={refreshMetrics}
                onNavigate={setActiveTab}
                currentUser={user}
                tenant={tenant}
              />
            ) : (
              renderAccessDenied('Subscription & Plans', 'Corporate Administrators and Super Administrators')
            )
          )}
          </div>

        </main>
      </div>

      {/* Interactive Tour Guide Walkthrough Modal & Tooltips */}
      <InteractiveTourGuide
        isOpen={isTourOpen}
        onClose={() => setIsTourOpen(false)}
        onComplete={() => setIsTourOpen(false)}
        activeTab={activeTab}
        onNavigate={setActiveTab}
      />

    </div>
  );
}
