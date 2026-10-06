import React, { useState, useEffect } from 'react';
import Header from './components/Header';
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
import { api, getAuthToken, removeAuthToken, setActiveTenantId } from './lib/api';

export default function App() {
  const [user, setUser] = useState(null);
  const [tenant, setTenant] = useState(null);
  const [accessibleClients, setAccessibleClients] = useState([]);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAuthModal, setShowAuthModal] = useState(false);

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
    setActiveTab('dashboard'); // M2: Always go to dashboard after login
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
      {/* Top Navigation — M1-M3 */}
      <Header
        user={user}
        tenant={tenant}
        accessibleClients={accessibleClients}
        onSwitchTenant={handleSwitchTenant}
        onLogout={handleLogout}
        onOpenChampions={() => setActiveTab('champions-desk')} // M3: Guest Invitations
        onOpenProfile={() => setActiveTab('my-profile')}       // M2: Profile
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
          {/* M2: Dashboard Structures */}
          {activeTab === 'dashboard' && (
            <ExecutiveDashboard
              metrics={metrics}
              userRole={user?.role}
              tenantType={tenant?.type}
              onNavigate={setActiveTab}
            />
          )}

          {/* M1+M3: User & Role Management + RBAC */}
          {activeTab === 'admin-users' && (
            <AdminUserDesk currentUser={user} onRefreshMetrics={refreshMetrics} />
          )}

          {/* M3: Audit Logging Foundation */}
          {activeTab === 'audit-logs' && (
            <AuditDesk onRefreshMetrics={refreshMetrics} />
          )}

          {/* M3: Guest Invitations (Champions) */}
          {activeTab === 'champions-desk' && (
            <ChampionInviteModal
              onNavigateBack={() => setActiveTab('dashboard')}
            />
          )}

          {/* M2: Profile Types */}
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

          {/* M2: DPO & DPCO Multi-Client Portfolio Workspace (PDF Sec 10) */}
          {activeTab === 'portfolio-desk' && (
            <PortfolioDesk
              onSwitchTenant={handleSwitchTenant}
              tenantType={tenant?.type}
              userRole={user?.role}
            />
          )}

          {/* M3: Data Residency & Sovereign Node Control (PDF Sec 11) — Reserved for Super Admin */}
          {activeTab === 'data-residency' && (
            user?.role === 'super_admin' ? (
              <div className="space-y-6">
                <div className="border-b border-slate-200 pb-4">
                  <h2 className="text-xl font-black text-slate-900">Data Residency & Sovereign Node Deployment</h2>
                  <p className="text-xs text-slate-500 mt-1">Configure in-country data localization, encryption standards, and cross-border statutory nodes as specified in PDF Section 11.</p>
                </div>
                <DataResidencyCard onResidencyChanged={() => refreshMetrics()} />
              </div>
            ) : (
              <div className="bg-white border border-slate-200 rounded-3xl p-8 text-center max-w-2xl mx-auto my-8 shadow-xs">
                <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mx-auto mb-4 text-2xl">
                  <i className="fa-solid fa-lock"></i>
                </div>
                <h3 className="text-xl font-bold text-slate-900 tracking-tight">Access Restricted: Super Admin Required</h3>
                <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                  Platform Data Residency node controls are strictly reserved for <strong>Super Administrator</strong> accounts.
                </p>
              </div>
            )
          )}
        </main>
      </div>
    </div>
  );
}
