/**
 * DPODPCO Platform — Zero-Dependency Cookie Consent Client SDK
 * Nigeria Data Protection Act (NDPA 2023) Compliant
 * (c) 2026 DPODPCO Platform. All rights reserved.
 */
(function (window, document) {
  'use strict';

  var SCRIPT_TAG = document.currentScript || (function () {
    var scripts = document.getElementsByTagName('script');
    return scripts[scripts.length - 1];
  })();

  var TENANT_ID = SCRIPT_TAG ? SCRIPT_TAG.getAttribute('data-tenant-id') : null;
  var API_BASE = SCRIPT_TAG ? (SCRIPT_TAG.getAttribute('data-api-url') || 'http://127.0.0.1:8000/api/v1') : 'http://127.0.0.1:8000/api/v1';
  var STORAGE_KEY = 'dp_consent_' + (TENANT_ID || 'default');
  var THEME_COLOR = SCRIPT_TAG ? (SCRIPT_TAG.getAttribute('data-primary-color') || '#059669') : '#059669';
  var PRIVACY_URL = SCRIPT_TAG ? (SCRIPT_TAG.getAttribute('data-privacy-url') || '#privacy-policy') : '#privacy-policy';
  var COMPANY_NAME = SCRIPT_TAG ? (SCRIPT_TAG.getAttribute('data-company-name') || 'This Website') : 'This Website';

  var CONSENT_CATEGORIES = {
    necessary: { label: 'Strictly Necessary', desc: 'Essential for core website operation and security. Cannot be disabled.', required: true, default: true },
    functional: { label: 'Functional & Preferences', desc: 'Remembers user preferences such as language, theme and region.', required: false, default: false },
    analytics: { label: 'Analytics & Performance', desc: 'Helps us understand how visitors interact with the website to improve user experience.', required: false, default: false },
    marketing: { label: 'Marketing & Advertising', desc: 'Used to deliver relevant advertisements and track campaign effectiveness.', required: false, default: false }
  };

  function getUUID() {
    var d = new Date().getTime();
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      var r = (d + Math.random() * 16) % 16 | 0;
      d = Math.floor(d / 16);
      return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
    });
  }

  function getStoredConsent() {
    try {
      var item = localStorage.getItem(STORAGE_KEY);
      return item ? JSON.parse(item) : null;
    } catch (e) {
      return null;
    }
  }

  function saveConsent(categories) {
    var visitorId = (getStoredConsent() && getStoredConsent().visitorId) || getUUID();
    var consentData = {
      visitorId: visitorId,
      tenantId: TENANT_ID,
      categories: categories,
      timestamp: new Date().toISOString(),
      version: '1.0'
    };

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(consentData));
    } catch (e) {
      console.warn('[DPConsent] LocalStorage unavailable');
    }

    var event = new CustomEvent('dpConsentUpdated', { detail: consentData });
    window.dispatchEvent(event);

    if (TENANT_ID && API_BASE) {
      try {
        fetch(API_BASE + '/cookie-consent/log', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
          body: JSON.stringify({
            tenant_id: TENANT_ID,
            visitor_uuid: visitorId,
            accepted_categories: categories,
            consented_at: consentData.timestamp,
            user_agent: navigator.userAgent
          })
        }).catch(function () {});
      } catch (err) {}
    }

    removeBanner();
    removePreferencesModal();
  }

  function removeBanner() {
    var banner = document.getElementById('dp-consent-banner-root');
    if (banner) banner.remove();
  }

  function removePreferencesModal() {
    var modal = document.getElementById('dp-consent-modal-root');
    if (modal) modal.remove();
  }

  function injectStyles() {
    if (document.getElementById('dp-consent-styles')) return;
    var css = `
      #dp-consent-banner-root, #dp-consent-modal-root {
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
        color: #1e293b;
        box-sizing: border-box;
        z-index: 9999999;
      }
      #dp-consent-banner-root * , #dp-consent-modal-root * {
        box-sizing: border-box;
      }
      .dp-banner-container {
        position: fixed;
        bottom: 24px;
        left: 24px;
        right: 24px;
        max-width: 820px;
        margin: 0 auto;
        background: #ffffff;
        border-radius: 16px;
        box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1), 0 0 0 1px rgba(0,0,0,0.06);
        padding: 24px;
        display: flex;
        flex-direction: column;
        gap: 16px;
        animation: dpSlideUp 0.35s cubic-bezier(0.16, 1, 0.3, 1);
      }
      @media (min-width: 640px) {
        .dp-banner-header { display: flex; align-items: flex-start; justify-content: space-between; gap: 16px; }
      }
      .dp-banner-title {
        font-size: 17px;
        font-weight: 700;
        color: #0f172a;
        margin: 0 0 6px 0;
        display: flex;
        align-items: center;
        gap: 8px;
      }
      .dp-shield-icon {
        width: 20px;
        height: 20px;
        fill: ${THEME_COLOR};
        flex-shrink: 0;
      }
      .dp-banner-text {
        font-size: 13.5px;
        line-height: 1.55;
        color: #475569;
        margin: 0;
      }
      .dp-banner-text a {
        color: ${THEME_COLOR};
        text-decoration: underline;
        font-weight: 500;
      }
      .dp-banner-actions {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: 10px;
        justify-content: flex-end;
      }
      .dp-btn {
        padding: 9px 18px;
        border-radius: 9px;
        font-size: 13.5px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.15s ease;
        border: 1px solid transparent;
      }
      .dp-btn-primary {
        background-color: ${THEME_COLOR};
        color: #ffffff;
      }
      .dp-btn-primary:hover {
        opacity: 0.92;
        transform: translateY(-1px);
      }
      .dp-btn-secondary {
        background-color: #f1f5f9;
        color: #334155;
        border-color: #e2e8f0;
      }
      .dp-btn-secondary:hover {
        background-color: #e2e8f0;
      }
      .dp-btn-text {
        background: none;
        color: #64748b;
        padding: 9px 12px;
      }
      .dp-btn-text:hover {
        color: #0f172a;
      }
      .dp-modal-backdrop {
        position: fixed;
        inset: 0;
        background: rgba(15, 23, 42, 0.65);
        backdrop-filter: blur(4px);
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 16px;
        z-index: 10000000;
        animation: dpFadeIn 0.2s ease;
      }
      .dp-modal-box {
        background: #ffffff;
        border-radius: 20px;
        max-width: 600px;
        width: 100%;
        max-height: 90vh;
        overflow-y: auto;
        padding: 28px;
        box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25);
      }
      .dp-category-card {
        background: #f8fafc;
        border: 1px solid #e2e8f0;
        border-radius: 12px;
        padding: 14px 16px;
        margin-bottom: 12px;
      }
      .dp-category-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
      }
      .dp-category-title {
        font-weight: 600;
        font-size: 14.5px;
        color: #1e293b;
      }
      .dp-category-desc {
        font-size: 12.5px;
        color: #64748b;
        margin-top: 4px;
        line-height: 1.45;
      }
      .dp-switch {
        position: relative;
        display: inline-block;
        width: 44px;
        height: 24px;
      }
      .dp-switch input { opacity: 0; width: 0; height: 0; }
      .dp-slider {
        position: absolute;
        cursor: pointer;
        top: 0; left: 0; right: 0; bottom: 0;
        background-color: #cbd5e1;
        transition: .2s;
        border-radius: 24px;
      }
      .dp-slider:before {
        position: absolute;
        content: "";
        height: 18px;
        width: 18px;
        left: 3px;
        bottom: 3px;
        background-color: white;
        transition: .2s;
        border-radius: 50%;
      }
      input:checked + .dp-slider { background-color: ${THEME_COLOR}; }
      input:checked + .dp-slider:before { transform: translateX(20px); }
      input:disabled + .dp-slider { opacity: 0.6; cursor: not-allowed; }
      @keyframes dpSlideUp { from { transform: translateY(40px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
      @keyframes dpFadeIn { from { opacity: 0; } to { opacity: 1; } }
    `;
    var styleEl = document.createElement('style');
    styleEl.id = 'dp-consent-styles';
    styleEl.textContent = css;
    document.head.appendChild(styleEl);
  }

  function showPreferencesModal() {
    injectStyles();
    removePreferencesModal();

    var current = (getStoredConsent() && getStoredConsent().categories) || {
      necessary: true,
      functional: false,
      analytics: false,
      marketing: false
    };

    var modalRoot = document.createElement('div');
    modalRoot.id = 'dp-consent-modal-root';
    modalRoot.innerHTML = `
      <div class="dp-modal-backdrop" id="dp-modal-backdrop">
        <div class="dp-modal-box">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px;">
            <h3 style="margin:0; font-size:19px; font-weight:700; color:#0f172a;">Data Privacy & Cookie Preferences</h3>
            <button id="dp-modal-close" style="background:none; border:none; font-size:22px; cursor:pointer; color:#94a3b8;">&times;</button>
          </div>
          <p style="font-size:13.5px; color:#64748b; line-height:1.5; margin-bottom:20px;">
            In accordance with the <strong>Nigeria Data Protection Act (NDPA 2023)</strong>, you have full control over the cookies and tracking technologies used during your visit. Strictly necessary cookies cannot be deactivated.
          </p>
          <div id="dp-category-list">
            ${Object.keys(CONSENT_CATEGORIES).map(function (catKey) {
              var cat = CONSENT_CATEGORIES[catKey];
              var isChecked = cat.required ? true : !!current[catKey];
              var isDisabled = cat.required ? 'disabled' : '';
              return `
                <div class="dp-category-card">
                  <div class="dp-category-header">
                    <span class="dp-category-title">${cat.label} ${cat.required ? '<span style="font-size:11px; background:#e2e8f0; color:#475569; padding:2px 6px; border-radius:6px; margin-left:6px;">Required</span>' : ''}</span>
                    <label class="dp-switch">
                      <input type="checkbox" id="dp-cat-${catKey}" ${isChecked ? 'checked' : ''} ${isDisabled}>
                      <span class="dp-slider"></span>
                    </label>
                  </div>
                  <div class="dp-category-desc">${cat.desc}</div>
                </div>
              `;
            }).join('')}
          </div>
          <div style="display:flex; justify-content:flex-end; gap:10px; margin-top:24px;">
            <button id="dp-modal-reject-all" class="dp-btn dp-btn-secondary">Reject Optional</button>
            <button id="dp-modal-save" class="dp-btn dp-btn-primary">Save Preferences</button>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(modalRoot);

    document.getElementById('dp-modal-close').onclick = removePreferencesModal;
    document.getElementById('dp-modal-backdrop').onclick = function (e) {
      if (e.target.id === 'dp-modal-backdrop') removePreferencesModal();
    };

    document.getElementById('dp-modal-reject-all').onclick = function () {
      saveConsent({ necessary: true, functional: false, analytics: false, marketing: false });
    };

    document.getElementById('dp-modal-save').onclick = function () {
      var categories = {
        necessary: true,
        functional: document.getElementById('dp-cat-functional') ? document.getElementById('dp-cat-functional').checked : false,
        analytics: document.getElementById('dp-cat-analytics') ? document.getElementById('dp-cat-analytics').checked : false,
        marketing: document.getElementById('dp-cat-marketing') ? document.getElementById('dp-cat-marketing').checked : false
      };
      saveConsent(categories);
    };
  }

  function showBanner() {
    if (getStoredConsent()) return;
    injectStyles();
    removeBanner();

    var bannerRoot = document.createElement('div');
    bannerRoot.id = 'dp-consent-banner-root';
    bannerRoot.innerHTML = `
      <div class="dp-banner-container">
        <div class="dp-banner-header">
          <div>
            <div class="dp-banner-title">
              <svg class="dp-shield-icon" viewBox="0 0 24 24"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z"/></svg>
              <span>NDPA Compliance & Privacy Notice</span>
            </div>
            <p class="dp-banner-text">
              ${COMPANY_NAME} uses cookies and related technologies to enhance security, personalize content, and analyze traffic in compliance with the <strong>Nigeria Data Protection Act (NDPA 2023)</strong>. Read our <a href="${PRIVACY_URL}" target="_blank">Privacy Policy</a>.
            </p>
          </div>
        </div>
        <div class="dp-banner-actions">
          <button id="dp-btn-customize" class="dp-btn dp-btn-text">Customize</button>
          <button id="dp-btn-reject" class="dp-btn dp-btn-secondary">Decline Optional</button>
          <button id="dp-btn-accept-all" class="dp-btn dp-btn-primary">Accept All Cookies</button>
        </div>
      </div>
    `;

    document.body.appendChild(bannerRoot);

    document.getElementById('dp-btn-accept-all').onclick = function () {
      saveConsent({ necessary: true, functional: true, analytics: true, marketing: true });
    };

    document.getElementById('dp-btn-reject').onclick = function () {
      saveConsent({ necessary: true, functional: false, analytics: false, marketing: false });
    };

    document.getElementById('dp-btn-customize').onclick = function () {
      showPreferencesModal();
    };
  }

  window.DPConsent = {
    showBanner: showBanner,
    openPreferences: showPreferencesModal,
    getConsent: getStoredConsent,
    hasConsented: function (category) {
      var consent = getStoredConsent();
      if (!consent || !consent.categories) return false;
      return !!consent.categories[category];
    }
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', showBanner);
  } else {
    showBanner();
  }

})(window, document);
