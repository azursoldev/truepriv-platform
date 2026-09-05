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
  var POSITION = SCRIPT_TAG ? (SCRIPT_TAG.getAttribute('data-position') || 'bottom_bar') : 'bottom_bar';

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

    // Dispatch event to page scripts
    var event = new CustomEvent('dpConsentUpdated', { detail: consentData });
    window.dispatchEvent(event);

    // Automatically unblock gated scripts matching consented categories
    unblockScripts(categories);

    // Asynchronously log consent to backend API for NDPA audit trail
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

  function unblockScripts(categories) {
    if (!categories) return;
    try {
      var scripts = document.querySelectorAll('script[type="text/plain"][data-dp-category]');
      for (var i = 0; i < scripts.length; i++) {
        var s = scripts[i];
        var cat = s.getAttribute('data-dp-category');
        if (categories[cat]) {
          var newScript = document.createElement('script');
          for (var j = 0; j < s.attributes.length; j++) {
            var attr = s.attributes[j];
            if (attr.name !== 'type') {
              newScript.setAttribute(attr.name, attr.value);
            }
          }
          newScript.type = 'text/javascript';
          if (s.src) {
            newScript.src = s.src;
          } else {
            newScript.textContent = s.textContent;
          }
          s.parentNode.replaceChild(newScript, s);
        }
      }
    } catch (e) {
      console.warn('[DPConsent] Script unblocking error:', e);
    }
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
        background: #ffffff;
        box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1), 0 0 0 1px rgba(0,0,0,0.06);
        padding: 24px;
        display: flex;
        flex-direction: column;
        gap: 16px;
        animation: dpSlideUp 0.35s cubic-bezier(0.16, 1, 0.3, 1);
        z-index: 9999999;
      }
      .dp-pos-bottom_bar {
        bottom: 0;
        left: 0;
        right: 0;
        max-width: 100%;
        border-radius: 0;
        border-top: 1px solid #e2e8f0;
      }
      .dp-pos-floating_bottom_left {
        bottom: 24px;
        left: 24px;
        right: auto;
        max-width: 480px;
        border-radius: 16px;
        border: 1px solid #e2e8f0;
      }
      .dp-pos-floating_bottom_right {
        bottom: 24px;
        right: 24px;
        left: auto;
        max-width: 480px;
        border-radius: 16px;
        border: 1px solid #e2e8f0;
      }
      .dp-pos-center_modal {
        top: 50%;
        left: 50%;
        bottom: auto;
        right: auto;
        transform: translate(-50%, -50%);
        max-width: 540px;
        width: 90%;
        border-radius: 20px;
        border: 1px solid #e2e8f0;
        box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25);
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
      /* Preferences Modal */
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
      input:checked + .dp-slider {
        background-color: ${THEME_COLOR};
      }
      input:checked + .dp-slider:before {
        transform: translateX(20px);
      }
      input:disabled + .dp-slider {
        opacity: 0.6;
        cursor: not-allowed;
      }
      @keyframes dpSlideUp {
        from { transform: translateY(40px); opacity: 0; }
        to { transform: translateY(0); opacity: 1; }
      }
      @keyframes dpFadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }
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
    if (getStoredConsent()) return; // Already answered
    injectStyles();
    removeBanner();

    var bannerRoot = document.createElement('div');
    bannerRoot.id = 'dp-consent-banner-root';
    var posClass = 'dp-pos-' + (POSITION || 'bottom_bar');
    bannerRoot.innerHTML = `
      <div class="dp-banner-container ${posClass}">
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

  // Public SDK methods exposed on window
  window.DPConsent = {
    showBanner: showBanner,
    openPreferences: showPreferencesModal,
    getConsent: getStoredConsent,
    unblockScripts: unblockScripts,
    resetConsent: function () {
      try { localStorage.removeItem(STORAGE_KEY); } catch (e) {}
      showBanner();
    },
    hasConsented: function (category) {
      var consent = getStoredConsent();
      if (!consent || !consent.categories) return false;
      return !!consent.categories[category];
    }
  };

  // Check stored consent to immediately unblock consented scripts on page load
  var currentStoredConsent = getStoredConsent();
  if (currentStoredConsent && currentStoredConsent.categories) {
    unblockScripts(currentStoredConsent.categories);
  }

  // Auto-run on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', showBanner);
  } else {
    showBanner();
  }

})(window, document);
