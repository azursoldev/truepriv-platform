/**
 * Amstel Consulting — Standalone Header Component
 * Single Source of Truth for Header HTML, Navigation & Interactive Logic
 */
(function () {
  const headerHTML = `


  <!-- 2. Top Utility Bar (PwC Standard) -->
  <div class="top-bar">
    <span class="top-bar-item"><i class="fa-solid fa-location-dot"></i> Nigeria</span>
    <span class="top-bar-item"><i class="fa-solid fa-globe"></i> EN</span>
  </div>

  <!-- 3. Main Navigation Header -->
  <header class="header">
    <a href="index.html" class="brand-logo-link">
      <img src="logo.jpg" alt="Amstel Consulting" class="brand-logo-img">
      <span class="brand-logo-text"><span class="brand-mstel">mstel</span> <span class="brand-consulting">Consulting</span></span>
    </a>

    <ul class="main-nav">
      <!-- 1. Services Mega-Dropdown (3 Columns from PDF) -->
      <li class="nav-item-dropdown">
        <a href="index.html#services" class="nav-dropdown-trigger">
          <span>Services</span>
          <i class="fa-solid fa-chevron-down nav-chevron"></i>
        </a>
        
        <div class="mega-dropdown-menu">
          <div class="mega-dropdown-grid">
            
            <!-- Column 1: Regulatory & Audit -->
            <div>
              <h5 class="mega-col-heading">Regulatory &amp; Audit</h5>
              <ul class="mega-subnav-list">
                <li><a href="service-car.html">Compliance Audit Return (CAR)</a></li>
                <li><a href="service-audit.html">Data Protection Audit</a></li>
                <li><a href="service-training.html">Data Protection Training</a></li>
                <li><a href="service-policies.html">Privacy Policies &amp; Notices</a></li>
              </ul>
            </div>

            <!-- Column 2: Governance & Operations -->
            <div>
              <h5 class="mega-col-heading">Governance &amp; Operations</h5>
              <ul class="mega-subnav-list">
                <li><a href="service-ropa.html">ROPA Data Lineage</a></li>
                <li><a href="service-dpia.html">DPIA &amp; LIA Assessments</a></li>
                <li><a href="service-dpo.html">Outsourced DPO (DPOaaS)</a></li>
              </ul>
            </div>

            <!-- Column 3: Advanced Advisory -->
            <div>
              <h5 class="mega-col-heading">Advanced Advisory</h5>
              <ul class="mega-subnav-list">
                <li><a href="service-ai.html">AI Consulting</a></li>
                <li><a href="service-cyber.html">Cybersecurity &amp; Pen Testing</a></li>
                <li><a href="service-gov.html">Corporate Governance</a></li>
                <li><a href="index.html#service-cookie">Cookie Consent Compliance</a></li>
              </ul>
            </div>

          </div>
        </div>
      </li>

      <!-- 2. Blog Dropdown (Connecting dedicated pages) -->
      <li class="nav-item-dropdown">
        <a href="topics.html" class="nav-dropdown-trigger">
          <span>Blog</span>
          <i class="fa-solid fa-chevron-down nav-chevron"></i>
        </a>

        <div class="simple-dropdown-menu">
          <ul class="simple-dropdown-list">
            <li><a href="service-ai.html">Artificial Intelligence for Business</a></li>
            <li><a href="service-cyber.html">Cyber Security</a></li>
            <li><a href="service-policies.html">Data Protection Laws</a></li>
            <li><a href="service-gov.html">Risks</a></li>
            <li><a href="publication-detail.html">Regulatory Guidance: NDPC updates</a></li>
          </ul>
        </div>
      </li>

      <!-- 3. Our Organisation Dropdown (4 Dedicated Pages) -->
      <li class="nav-item-dropdown">
        <a href="organisation.html" class="nav-dropdown-trigger">
          <span>Our organisation</span>
          <i class="fa-solid fa-chevron-down nav-chevron"></i>
        </a>

        <div class="simple-dropdown-menu">
          <ul class="simple-dropdown-list">
            <li><a href="organisation-board.html">Advisory Board</a></li>
            <li><a href="organisation-consultants.html">Consultants</a></li>
            <li><a href="organisation-values.html">Purpose &amp; Values</a></li>
            <li><a href="organisation-governance.html">Governance (Licensed DPCO)</a></li>
          </ul>
        </div>
      </li>

      <!-- 4. Contact -->
      <li><a href="contact.html">Contact</a></li>
    </ul>

    <div class="header-right">
      <div class="header-search-wrap">
        <button class="header-search-trigger" onclick="openSearchModal()" aria-label="Search site">
          <i class="fa-solid fa-magnifying-glass"></i>
          <span>Search</span>
        </button>
      </div>
      <a href="contact.html" class="btn-contact-nav btn-header-cta">File CAR Before Deadline</a>
      <button class="mobile-menu-btn" onclick="toggleMobileMenu()" aria-label="Toggle navigation menu">
        <i class="fa-solid fa-bars"></i>
      </button>
    </div>
  </header>

  <!-- 4. Responsive Mobile Slideout Drawer -->
  <div id="mobileNavOverlay" class="mobile-nav-overlay" onclick="if(event.target === this) toggleMobileMenu()">
    <div class="mobile-nav-drawer">
      <div class="mobile-drawer-header">
        <a href="index.html" class="brand-logo-link">
          <img src="logo.jpg" alt="Amstel Consulting" class="brand-logo-img">
          <span class="brand-logo-text"><span class="brand-mstel">mstel</span> <span class="brand-consulting">Consulting</span></span>
        </a>
        <button class="mobile-drawer-close" onclick="toggleMobileMenu()" aria-label="Close menu">&times;</button>
      </div>
      <div class="mobile-drawer-body">
        <div>
          <div class="mobile-nav-group-title">Services</div>
          <ul class="mobile-nav-links">
            <li><a href="service-car.html" onclick="toggleMobileMenu()">Compliance Audit Return (CAR) <i class="fa-solid fa-chevron-right text-xs"></i></a></li>
            <li><a href="service-audit.html" onclick="toggleMobileMenu()">Data Protection Audit <i class="fa-solid fa-chevron-right text-xs"></i></a></li>
            <li><a href="service-training.html" onclick="toggleMobileMenu()">Data Protection Training <i class="fa-solid fa-chevron-right text-xs"></i></a></li>
            <li><a href="service-policies.html" onclick="toggleMobileMenu()">Privacy Policies &amp; Notices <i class="fa-solid fa-chevron-right text-xs"></i></a></li>
            <li><a href="service-ropa.html" onclick="toggleMobileMenu()">ROPA Data Lineage <i class="fa-solid fa-chevron-right text-xs"></i></a></li>
            <li><a href="service-dpia.html" onclick="toggleMobileMenu()">DPIA &amp; LIA Assessments <i class="fa-solid fa-chevron-right text-xs"></i></a></li>
            <li><a href="service-dpo.html" onclick="toggleMobileMenu()">Outsourced DPO (DPOaaS) <i class="fa-solid fa-chevron-right text-xs"></i></a></li>
            <li><a href="service-cyber.html" onclick="toggleMobileMenu()">Cybersecurity &amp; Pen-Testing <i class="fa-solid fa-chevron-right text-xs"></i></a></li>
            <li><a href="service-gov.html" onclick="toggleMobileMenu()">Corporate Governance <i class="fa-solid fa-chevron-right text-xs"></i></a></li>
            <li><a href="index.html#service-cookie" onclick="toggleMobileMenu()">Cookie &amp; Consent Compliance <i class="fa-solid fa-chevron-right text-xs"></i></a></li>
          </ul>
        </div>
        <div>
          <div class="mobile-nav-group-title">Our Organisation</div>
          <ul class="mobile-nav-links">
            <li><a href="organisation-board.html" onclick="toggleMobileMenu()">Advisory Board <i class="fa-solid fa-chevron-right text-xs"></i></a></li>
            <li><a href="organisation-consultants.html" onclick="toggleMobileMenu()">Consultants <i class="fa-solid fa-chevron-right text-xs"></i></a></li>
            <li><a href="organisation-values.html" onclick="toggleMobileMenu()">Purpose &amp; Values <i class="fa-solid fa-chevron-right text-xs"></i></a></li>
            <li><a href="organisation-governance.html" onclick="toggleMobileMenu()">Licensed DPCO Credentials <i class="fa-solid fa-chevron-right text-xs"></i></a></li>
          </ul>
        </div>
        <div>
          <div class="mobile-nav-group-title">Blog &amp; Insights</div>
          <ul class="mobile-nav-links">
            <li><a href="service-ai.html" onclick="toggleMobileMenu()">Artificial Intelligence for Business <i class="fa-solid fa-chevron-right text-xs"></i></a></li>
            <li><a href="service-cyber.html" onclick="toggleMobileMenu()">Cyber Security <i class="fa-solid fa-chevron-right text-xs"></i></a></li>
            <li><a href="service-policies.html" onclick="toggleMobileMenu()">Data Protection Laws <i class="fa-solid fa-chevron-right text-xs"></i></a></li>
            <li><a href="service-gov.html" onclick="toggleMobileMenu()">Risks <i class="fa-solid fa-chevron-right text-xs"></i></a></li>
            <li><a href="publication-detail.html" onclick="toggleMobileMenu()">Regulatory Guidance: NDPC Updates <i class="fa-solid fa-chevron-right text-xs"></i></a></li>
          </ul>
        </div>
        <div>
          <div class="mobile-nav-group-title">Direct Inquiries</div>
          <ul class="mobile-nav-links">
            <li><a href="contact.html" onclick="toggleMobileMenu()">Contact &amp; Practice Offices <i class="fa-solid fa-chevron-right text-xs"></i></a></li>
          </ul>
        </div>
      </div>
      <div class="mobile-drawer-footer">
        <a href="index.html#contact" onclick="toggleMobileMenu()" class="btn-mobile-car">
          <span>File CAR Before deadline</span>
          <i class="fa-solid fa-arrow-right"></i>
        </a>
      </div>
    </div>
  </div>

  <!-- 5. Site-Wide Search Modal Overlay -->
  <div id="searchModalOverlay" class="search-modal-overlay" onclick="if(event.target === this) closeSearchModal()">
    <div class="search-modal-card">
      <div class="search-input-wrap">
        <i class="fa-solid fa-magnifying-glass"></i>
        <input type="text" id="siteSearchInput" placeholder="Search services, NDPA regulations, DPCO audit rules..." oninput="handleSearch(this.value)">
        <button onclick="closeSearchModal()" class="search-close-btn" aria-label="Close search">&times;</button>
      </div>
      <div id="searchResults" class="search-results-list">
        <div style="color: #64748b; font-size: 0.9rem; text-align: center; padding: 2rem 0;">Type to search across services, regulations, and insights...</div>
        <div class="search-quick-links">
          <span>Popular:</span>
          <a href="service-car.html">CAR Filing</a>
          <a href="service-audit.html">NDPA Audit</a>
          <a href="service-dpo.html">DPO Retainer</a>
          <a href="service-ai.html">AI Governance</a>
          <a href="service-training.html">Training</a>
        </div>
      </div>
    </div>
  </div>
  `;

  // Mount Header to DOM
  const mount = document.getElementById('site-header');
  if (mount) {
    mount.outerHTML = headerHTML;
  } else {
    document.body.insertAdjacentHTML('afterbegin', headerHTML);
  }

  // Interactive Logic: Mobile Drawer
  window.toggleMobileMenu = function () {
    const overlay = document.getElementById('mobileNavOverlay');
    if (overlay) {
      overlay.classList.toggle('open');
      document.body.style.overflow = overlay.classList.contains('open') ? 'hidden' : '';
    }
  };

  // Interactive Logic: Search Modal
  window.openSearchModal = function () {
    const overlay = document.getElementById('searchModalOverlay');
    if (overlay) {
      overlay.classList.add('open');
      document.body.style.overflow = 'hidden';
      const input = document.getElementById('siteSearchInput');
      if (input) {
        input.value = '';
        setTimeout(() => input.focus(), 50);
      }
    }
  };

  window.closeSearchModal = function () {
    const overlay = document.getElementById('searchModalOverlay');
    if (overlay) {
      overlay.classList.remove('open');
      document.body.style.overflow = '';
    }
  };

  // Search indexing & execution
  const searchIndex = [
    { title: 'Compliance Audit Return (CAR)', url: 'service-car.html', desc: 'Statutory annual NDPA compliance audit return filing desk.' },
    { title: 'Data Protection Audit', url: 'service-audit.html', desc: 'Comprehensive Article 30/31 technical & organizational privacy audit.' },
    { title: 'Data Protection Training', url: 'service-training.html', desc: 'Certified executive and workforce data privacy training programs.' },
    { title: 'Privacy Policies & Notices', url: 'service-policies.html', desc: 'Drafting statutory NDPA external notices and internal governance policies.' },
    { title: 'ROPA Data Lineage', url: 'service-ropa.html', desc: 'Article 24 Records of Processing Activities mapping and data registers.' },
    { title: 'DPIA & LIA Assessments', url: 'service-dpia.html', desc: 'Data Protection Impact Assessments for high-risk data processing.' },
    { title: 'Outsourced DPO (DPOaaS)', url: 'service-dpo.html', desc: 'Certified external Data Protection Officer statutory representation.' },
    { title: 'Cybersecurity & Pen-Testing', url: 'service-cyber.html', desc: 'Section 39 vulnerability assessments, threat mitigation, and pen-tests.' },
    { title: 'Corporate Governance', url: 'service-gov.html', desc: 'Boardroom oversight, privacy governance risk matrices, and compliance.' },
    { title: 'Advisory Board', url: 'organisation-board.html', desc: 'Distinguished governance and privacy leadership advisory board.' },
    { title: 'Consultants', url: 'organisation-consultants.html', desc: 'Certified privacy engineers, legal counsels, and security architects.' },
    { title: 'Purpose & Values', url: 'organisation-values.html', desc: 'Our mission, ethical values, and regulatory integrity commitments.' },
    { title: 'Licensed DPCO Credentials', url: 'organisation-governance.html', desc: 'Official NDPC accreditation license DPCO/XXXX/2026.' },
    { title: 'Artificial Intelligence for Business', url: 'service-ai.html', desc: 'AI compliance, algorithmic accountability, and automated decision rights.' },
    { title: 'Regulatory Guidance: NDPC Updates', url: 'publication-detail.html', desc: 'Official guidance, compliance circulars, and enforcement advisories.' },
    { title: 'Contact & Practice Offices', url: 'contact.html', desc: 'Engage our licensed DPCO practice partners and request a formal RFP.' }
  ];

  window.handleSearch = function (query) {
    const resultsContainer = document.getElementById('searchResults');
    if (!resultsContainer) return;

    const q = query.toLowerCase().trim();
    if (!q) {
      resultsContainer.innerHTML = `
        <div style="color: #64748b; font-size: 0.9rem; text-align: center; padding: 2rem 0;">Type to search across services, regulations, and insights...</div>
        <div class="search-quick-links">
          <span>Popular:</span>
          <a href="service-car.html">CAR Filing</a>
          <a href="service-audit.html">NDPA Audit</a>
          <a href="service-dpo.html">DPO Retainer</a>
          <a href="service-ai.html">AI Governance</a>
          <a href="service-training.html">Training</a>
        </div>
      `;
      return;
    }

    const matched = searchIndex.filter(item =>
      item.title.toLowerCase().includes(q) || item.desc.toLowerCase().includes(q)
    );

    if (matched.length === 0) {
      resultsContainer.innerHTML = `<div style="padding: 2rem 0; text-align: center; color: #64748b; font-size: 0.95rem;">No direct matches found for "<strong>\${q}</strong>". <br><a href="contact.html" style="color: var(--pwc-orange); font-weight: 700; margin-top: 0.5rem; display: inline-block;">Speak with a consultant &rarr;</a></div>`;
      return;
    }

    resultsContainer.innerHTML = matched.map(m => `
      <a href="\${m.url}" style="display: block; padding: 0.85rem 1rem; border-radius: 8px; text-decoration: none; margin-bottom: 0.5rem; background: #f8fafc; transition: background 0.15s ease;" onmouseover="this.style.background='#fff5ee'" onmouseout="this.style.background='#f8fafc'">
        <div style="font-weight: 700; color: #0f172a; font-size: 0.95rem; margin-bottom: 0.2rem;">\${m.title}</div>
        <div style="font-size: 0.82rem; color: #64748b; line-height: 1.4;">\${m.desc}</div>
      </a>
    `).join('');
  };

  // Keyboard shortcut: Escape to close modals
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      window.closeSearchModal();
      const overlay = document.getElementById('mobileNavOverlay');
      if (overlay && overlay.classList.contains('open')) {
        window.toggleMobileMenu();
      }
    }
  });
})();
