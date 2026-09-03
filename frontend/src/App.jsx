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
import AuthModal from './components/AuthModal';
import OnboardingWizard from './components/OnboardingWizard';
import ChampionInviteModal from './components/ChampionInviteModal';
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

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center text-slate-700 space-y-3">
        <div className="w-10 h-10 rounded-xl border-2 border-emerald-600 border-t-transparent animate-spin" />
        <div className="text-xs font-mono tracking-wider text-slate-500">Loading Truepriv Platform...</div>
      </div>
    );
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
        onOpenPublicPortal={() => setShowPublicPortal(true)}
        onOpenOnboarding={() => setShowOnboarding(true)}
        onOpenChampions={() => setShowChampions(true)}
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
        <main className="flex-1 p-6 lg:p-8 max-w-7xl mx-auto w-full overflow-y-auto">
          {activeTab === 'dashboard' && (
            <ExecutiveDashboard
              metrics={metrics}
              userRole={user?.role}
              tenantType={tenant?.type}
              onNavigate={setActiveTab}
              onAutoFillRopa={() => setActiveTab('ropa')}
              onOpenOnboarding={() => setShowOnboarding(true)}
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
              onOpenPublicPortal={() => setShowPublicPortal(true)}
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
        </main>
      </div>

      {/* Onboarding & MDC Classification Wizard Overlay */}
      {showOnboarding && (
        <OnboardingWizard
          isOpen={showOnboarding}
          onClose={() => setShowOnboarding(false)}
          onComplete={async () => {
            await refreshMetrics();
          }}
        />
      )}

      {/* Department Champion Invites Overlay */}
      {showChampions && (
        <ChampionInviteModal
          isOpen={showChampions}
          onClose={() => setShowChampions(false)}
        />
      )}

      {/* Public DSAR Portal Overlay */}
      {showPublicPortal && (
        <PublicDsarPortal
          tenant={tenant}
          onClose={() => setShowPublicPortal(false)}
        />
      )}

      {/* Auth & Persona Switcher Modal */}
      {showAuthModal && (
        <AuthModal onLoginSuccess={handleLoginSuccess} />
      )}
    </div>
  );
}
