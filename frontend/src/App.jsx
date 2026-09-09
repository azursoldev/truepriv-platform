import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import ExecutiveDashboard from './components/ExecutiveDashboard';
import RopaDesk from './components/RopaDesk';
import DpiaDesk from './components/DpiaDesk';
import AuditDesk from './components/AuditDesk';
import DsarDesk from './components/DsarDesk';
import BreachDesk from './components/BreachDesk';
import VendorDesk from './components/VendorDesk';
import CookieDesk from './components/CookieDesk';
import PolicyDesk from './components/PolicyDesk';
import PortfolioDesk from './components/PortfolioDesk';
import AdminUserDesk from './components/AdminUserDesk';
import PublicDsarPortal from './components/PublicDsarPortal';
import PublicChampionIntakePortal from './components/PublicChampionIntakePortal';
import AuthModal from './components/AuthModal';
import OnboardingWizard from './components/OnboardingWizard';
import ChampionInviteModal from './components/ChampionInviteModal';
import MyProfileDetailDesk from './components/MyProfileDetailDesk';
import TruePrivAiCopilotDrawer from './components/TruePrivAiCopilotDrawer';
import SubscriptionBillingModal from './components/SubscriptionBillingModal';
import { api, getAuthToken, removeAuthToken, setActiveTenantId } from './lib/api';

export default function App() {
  const [user, setUser] = useState(null);
  const [tenant, setTenant] = useState(null);
  const [accessibleClients, setAccessibleClients] = useState([]);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showPublicPortal, setShowPublicPortal] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showChampions, setShowChampions] = useState(false);
  const [showAiCopilot, setShowAiCopilot] = useState(false);
  const [showBillingModal, setShowBillingModal] = useState(false);

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
        if (['outsourced_dpo', 'dpco_firm'].includes(meRes.tenant?.type)) {
          const pRes = await api.getPortfolioClients().catch(() => null);
          if (pRes && pRes.success) {
            setAccessibleClients(pRes.clients);
          }
        }

        // Fetch dashboard metrics
        await refreshMetrics();
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
    setActiveTab(loggedInTenant?.type === 'dpco_firm' || loggedInTenant?.type === 'outsourced_dpo' ? 'portfolio' : 'dashboard');
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

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Standalone Public Champion Intake Portal (Bypasses Admin Login)
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
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center text-slate-700 space-y-3">
        <div className="w-10 h-10 rounded-xl border-2 border-emerald-600 border-t-transparent animate-spin" />
        <div className="text-xs font-mono tracking-wider text-slate-500">Loading Truepriv Platform...</div>
      </div>
    );
  }

  // Standalone Full-Screen 2-Column Authentication Page (Matches User's Mockup)
  if (!user || showAuthModal) {
    return <AuthModal onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col selection:bg-emerald-500 selection:text-white">
      {/* Top Navigation */}
      <Header
        user={user}
        tenant={tenant}
        accessibleClients={accessibleClients}
        onSwitchTenant={handleSwitchTenant}
        onLogout={handleLogout}
        onOpenPublicPortal={() => setActiveTab('public-dsar')}
        onOpenOnboarding={() => setActiveTab('ndpa-wizard')}
        onOpenChampions={() => setActiveTab('champions-desk')}
        onOpenProfile={() => setActiveTab('my-profile')}
        onOpenAiCopilot={() => setShowAiCopilot(true)}
        onOpenBilling={() => setShowBillingModal(true)}
        isSidebarCollapsed={sidebarCollapsed}
        onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      {/* Main Layout */}
      <div className="flex flex-1">
        {/* Side Navigation */}
        <Sidebar
          activeTab={activeTab}
          onTabChange={setActiveTab}
          tenantType={tenant?.type}
          userRole={user?.role}
          metrics={metrics}
          isCollapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        />

        {/* Dynamic Main Workspace Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
          {activeTab === 'dashboard' && (
            <ExecutiveDashboard
              metrics={metrics}
              userRole={user?.role}
              tenantType={tenant?.type}
              onNavigate={setActiveTab}
              onAutoFillRopa={() => setActiveTab('ropa')}
              onOpenOnboarding={() => setActiveTab('ndpa-wizard')}
            />
          )}

          {activeTab === 'portfolio' && (
            <PortfolioDesk
              onSwitchTenant={handleSwitchTenant}
              tenantType={tenant?.type}
            />
          )}

          {activeTab === 'ropa' && (
            <RopaDesk onRefreshMetrics={refreshMetrics} />
          )}

          {activeTab === 'dpia' && (
            <DpiaDesk onRefreshMetrics={refreshMetrics} />
          )}

          {activeTab === 'audits' && (
            <AuditDesk onRefreshMetrics={refreshMetrics} />
          )}

          {activeTab === 'dsar' && (
            <DsarDesk
              onOpenPublicPortal={() => setActiveTab('public-dsar')}
              onRefreshMetrics={refreshMetrics}
            />
          )}

          {activeTab === 'breaches' && (
            <BreachDesk onRefreshMetrics={refreshMetrics} />
          )}

          {activeTab === 'vendors' && (
            <VendorDesk onRefreshMetrics={refreshMetrics} />
          )}

          {activeTab === 'cookies' && (
            <CookieDesk tenant={tenant} />
          )}

          {activeTab === 'policies' && (
            <PolicyDesk tenant={tenant} />
          )}

          {activeTab === 'admin-users' && (
            <AdminUserDesk currentUser={user} onRefreshMetrics={refreshMetrics} />
          )}

          {activeTab === 'my-profile' && (
            <MyProfileDetailDesk
              user={user}
              tenant={tenant}
              onUpdateUser={(updatedUser) => {
                setUser(updatedUser);
              }}
              onNavigateBack={() => setActiveTab('dashboard')}
            />
          )}

          {activeTab === 'ndpa-wizard' && (
            <OnboardingWizard
              onNavigateBack={() => setActiveTab('dashboard')}
              onComplete={async () => {
                await refreshMetrics();
              }}
            />
          )}

          {activeTab === 'champions-desk' && (
            <ChampionInviteModal
              onNavigateBack={() => setActiveTab('dashboard')}
            />
          )}

          {activeTab === 'public-dsar' && (
            <PublicDsarPortal
              tenant={tenant}
              onNavigateBack={() => setActiveTab('dashboard')}
            />
          )}
        </main>
      </div>

      {/* Floating TruePriv AI Agent Trigger */}
      <button
        onClick={() => setShowAiCopilot(true)}
        title="Open TruePriv Autonomous Privacy AI Agent"
        className="fixed bottom-6 right-6 z-40 bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white p-3.5 px-4 rounded-full shadow-2xl flex items-center gap-2.5 font-bold text-xs border border-sky-400/40 transition-all hover:scale-105 group cursor-pointer"
      >
        <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
        <i className="fa-solid fa-brain text-sm"></i>
        <span>TruePriv AI Agent</span>
      </button>

      {/* TruePriv AI Copilot Drawer */}
      <TruePrivAiCopilotDrawer
        isOpen={showAiCopilot}
        onClose={() => setShowAiCopilot(false)}
      />

      {/* Subscription & Paystack NGN Billing Modal */}
      <SubscriptionBillingModal
        isOpen={showBillingModal}
        onClose={() => setShowBillingModal(false)}
        onSubscriptionUpdated={async () => {
          await refreshMetrics();
        }}
      />
    </div>
  );
}
