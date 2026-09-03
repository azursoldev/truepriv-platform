/**
 * Central API Client for DPODPCO Platform REST API
 * Handles Bearer Token Auth, Active Tenant Context (X-Tenant-ID), and Error Handling.
 */

const API_BASE = '/api/v1';

export const getAuthToken = () => localStorage.getItem('dp_auth_token');
export const setAuthToken = (token) => localStorage.setItem('dp_auth_token', token);
export const removeAuthToken = () => localStorage.removeItem('dp_auth_token');

export const getActiveTenantId = () => localStorage.getItem('dp_active_tenant_id');
export const setActiveTenantId = (id) => localStorage.setItem('dp_active_tenant_id', id);

async function request(endpoint, options = {}) {
  const token = getAuthToken();
  const activeTenantId = getActiveTenantId();

  const headers = {
    'Accept': 'application/json',
    ...(options.headers || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  if (activeTenantId) {
    headers['X-Tenant-ID'] = activeTenantId;
  }

  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const error = new Error((data && data.message) || 'API Request failed');
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}

export const api = {
  // Auth & Platform Features
  login: (credentials) => request('/auth/login', { method: 'POST', body: JSON.stringify(credentials) }),
  register: (payload) => request('/auth/register', { method: 'POST', body: JSON.stringify(payload) }),
  getFeatures: () => request('/features'),
  getMe: () => request('/auth/me'),
  logout: () => request('/auth/logout', { method: 'POST' }),

  // Dashboard & Portfolio
  getDashboardMetrics: () => request('/dashboard/metrics'),
  getPortfolioClients: () => request('/dashboard/portfolio'),

  // Templates
  getTemplates: () => request('/templates'),
  getTemplate: (slug) => request(`/templates/${slug}`),

  // RoPA
  getRopa: (params = '') => request(`/ropa${params}`),
  createRopa: (data) => request('/ropa', { method: 'POST', body: JSON.stringify(data) }),
  applyIndustryTemplate: (industrySlug, overwrite = false) => 
    request('/ropa/apply-template', { method: 'POST', body: JSON.stringify({ industry_slug: industrySlug, overwrite }) }),
  updateRopa: (id, data) => request(`/ropa/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  updateRopaStatus: (id, status) => request(`/ropa/${id}/status`, { method: 'PUT', body: JSON.stringify({ status }) }),
  deleteRopa: (id) => request(`/ropa/${id}`, { method: 'DELETE' }),

  // DPIA
  getDpia: () => request('/dpia'),
  createDpia: (data) => request('/dpia', { method: 'POST', body: JSON.stringify(data) }),
  signOffDpia: (id, data) => request(`/dpia/${id}/sign-off`, { method: 'POST', body: JSON.stringify(data) }),

  // Statutory Audits
  getAudits: () => request('/audits'),
  getAudit: (id) => request(`/audits/${id}`),
  updateChecklistItem: (itemId, data) => request(`/audits/checklist/${itemId}`, { method: 'PUT', body: JSON.stringify(data) }),
  storeFinding: (projectId, data) => request(`/audits/${projectId}/findings`, { method: 'POST', body: JSON.stringify(data) }),
  updateFinding: (findingId, data) => request(`/audits/findings/${findingId}`, { method: 'PUT', body: JSON.stringify(data) }),
  uploadEvidence: (projectId, formData) => request(`/audits/${projectId}/evidence`, { method: 'POST', body: formData }),
  certifyAudit: (projectId, data) => request(`/audits/${projectId}/certify`, { method: 'POST', body: JSON.stringify(data) }),

  // DSAR
  getDsars: (params = '') => request(`/dsars${params}`),
  updateDsarStatus: (id, data) => request(`/dsars/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  publicSubmitDsar: (formData) => request('/public/dsar/submit', { method: 'POST', body: formData }),

  // Breach Incidents
  getBreaches: () => request('/breaches'),
  createBreach: (data) => request('/breaches', { method: 'POST', body: JSON.stringify(data) }),
  notifyNdpc: (id, data) => request(`/breaches/${id}/notify-ndpc`, { method: 'POST', body: JSON.stringify(data) }),
  getBreachForm1: (id) => request(`/breaches/${id}/form1`),

  // Vendors
  getVendors: (params = '') => request(`/vendors${params}`),
  createVendor: (data) => request('/vendors', { method: 'POST', body: JSON.stringify(data) }),
  updateVendor: (id, data) => request(`/vendors/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteVendor: (id) => request(`/vendors/${id}`, { method: 'DELETE' }),

  // Cookie SDK
  getCookieConfig: () => request('/cookies/config'),
  updateCookieConfig: (data) => request('/cookies/config', { method: 'PUT', body: JSON.stringify(data) }),
  getCookieAnalytics: () => request('/cookies/analytics'),

  // Policies
  getPolicies: () => request('/policies'),
  generatePolicy: (data) => request('/policies/generate', { method: 'POST', body: JSON.stringify(data) }),
  updatePolicy: (id, data) => request(`/policies/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

  // Milestone 2: Onboarding & Classification
  getOnboardingQuestions: () => request('/onboarding/questions'),
  submitOnboardingAnswers: (data) => request('/onboarding/submit', { method: 'POST', body: JSON.stringify(data) }),
  getOnboardingClassification: () => request('/onboarding/classification'),

  // Milestone 2: Department Champion Invitations
  getInvitations: () => request('/invitations'),
  createInvitation: (data) => request('/invitations', { method: 'POST', body: JSON.stringify(data) }),
  resolvePublicInvitation: (token) => request(`/public/invitations/${token}`),
  submitPublicChampionData: (token, data) => request(`/public/invitations/${token}/submit`, { method: 'POST', body: JSON.stringify(data) }),

  // Milestone 2: Dual-Residency Data Localization
  getLocalizationStatus: () => request('/localization/status'),
  switchLocalizationResidency: (residency) => request('/localization/switch', { method: 'PUT', body: JSON.stringify({ data_residency: residency }) }),

  // User & Role Management / Administration
  getUsers: (params = '') => request(`/users${params}`),
  createUser: (data) => request('/users', { method: 'POST', body: JSON.stringify(data) }),
  updateUser: (id, data) => request(`/users/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteUser: (id) => request(`/users/${id}`, { method: 'DELETE' }),
  getRolesMatrix: () => request('/roles/matrix'),
};
