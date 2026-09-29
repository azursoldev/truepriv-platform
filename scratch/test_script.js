
    // Feature Detailed Data (PDF Section 7 & 26)
    const featureDetails = {
      ropa: {
        title: "RoPA and Data Mapping",
        headline: "Build a processing record that stays useful.",
        desc: "Ask process owners how information is collected, used, shared, retained and protected. Reuse approved systems and vendor details, identify missing answers and prepare a RoPA entry for review. Update the record when an activity changes and export its approved version with supporting evidence.",
        workflow: [
          "Select or create the processing activity.",
          "Invite departmental owners to answer role-specific questions.",
          "Reuse approved information about systems, vendors, locations and controls.",
          "Generate the RoPA record and identify missing or inconsistent responses.",
          "Screen the activity against jurisdiction-specific DPIA triggers.",
          "Export the approved RoPA with evidence and audit history."
        ]
      },
      dpia: {
        title: "DPIA and Risk Assessments",
        headline: "Assess privacy risk before decisions are final.",
        desc: "Screen a new or changed activity against the applicable criteria. Where a deeper assessment is appropriate, gather facts from the right owners and generate a draft analysis of purpose, necessity, proportionality, risks and safeguards. Review assumptions, assign mitigations and record approval or escalation.",
        workflow: [
          "Screen activity against jurisdiction-specific DPIA triggers.",
          "Identify necessity, proportionality and high-risk processing factors.",
          "Gather input from system architects and process leads.",
          "Generate draft necessity, proportionality, risk and safeguards analysis.",
          "Assign mitigation measures and route material decisions for approval.",
          "Export approved DPIA pack with verifiable audit history."
        ]
      },
      dpo: {
        title: "DPO Work Management",
        headline: "Give DPO work a clear plan and decision trail.",
        desc: "Organise recurring tasks, reviews, consultations and reports in one workspace. Record advice, supporting evidence and whether recommendations were accepted. Track deadlines and escalate unresolved matters while preserving the DPO's reporting and independence requirements.",
        workflow: [
          "Establish the annual compliance & monitoring schedule.",
          "Log advisory requests and formal privacy recommendations.",
          "Track whether management accepted or rejected recommendations.",
          "Maintain escalation records for high residual risk matters.",
          "Assemble executive reports preserving statutory independence."
        ]
      },
      dsar: {
        title: "Rights Requests (DSAR)",
        headline: "Coordinate rights requests from receipt to response.",
        desc: "Capture a request, identify the relevant jurisdiction and track identity checks, assignment, information gathering, review and response. Keep deadlines and decisions visible, including any reason for an extension or refusal that requires professional review. Preserve a record of the final response.",
        workflow: [
          "Capture incoming request via secure intake portal.",
          "Verify identity of data subject and assess statutory jurisdiction.",
          "Route retrieval tasks to relevant system owners.",
          "Review collected records and redact third-party data.",
          "Deliver formal response within the legal timeline with audit logging."
        ]
      },
      incidents: {
        title: "Incidents and Breaches",
        headline: "Make incident decisions timely and traceable.",
        desc: "Record what happened, the affected information, containment measures and the people involved. Guide investigation and assessment of potential notification duties, assign actions and document why a decision was made. Keep evidence and an event history available for later review.",
        workflow: [
          "Record incident facts and containment actions taken.",
          "Calculate 72-hour statutory notification countdown clock.",
          "Evaluate severity, likelihood, and potential adverse impact on subjects.",
          "Document management decision regarding regulatory or individual notice.",
          "Preserve post-incident remediation evidence and lessons learned."
        ]
      },
      vendors: {
        title: "Vendors and Contracts",
        headline: "Know who handles data on your behalf.",
        desc: "Build a vendor inventory, capture the processing purpose and location, and review relevant contracts and safeguards. Assign follow-up actions for missing information, renewals or changed services. Link a vendor to the processing activities and assessments that depend on it.",
        workflow: [
          "Maintain centralized processor & third-party registry.",
          "Review Data Processing Agreements (DPAs) and transfer mechanisms.",
          "Conduct periodic vendor security & privacy due diligence questionnaires.",
          "Monitor contract renewal dates and subprocessor changes.",
          "Link processors directly to related RoPA records and DPIAs."
        ]
      },
      policies: {
        title: "Policies, Training and Evidence",
        headline: "Keep policies, learning and proof connected.",
        desc: "Manage approved policy versions, assign training or acknowledgement where appropriate and keep completion evidence alongside the relevant obligation. Review dates, responsible owners and updates help teams see what needs attention before an audit or management report.",
        workflow: [
          "Draft, version, and approve internal and external privacy policies.",
          "Distribute policies to employees with digital acknowledgement tracking.",
          "Store staff privacy training completion certificates.",
          "Map active policies directly to regulatory control mandates.",
          "Retrieve verified compliance bundles for auditors."
        ]
      },
      regulatory: {
        title: "Regulatory Readiness & Audit Packs",
        headline: "Generate audit packs, returns and regulator-ready exports.",
        desc: "Generate management reports, statutory returns, and regulator-ready exports directly from approved platform records without last-minute scrambling.",
        workflow: [
          "Compile approved RoPA entries and completed DPIAs.",
          "Attach processor due diligence and staff acknowledgement records.",
          "Format according to jurisdiction guidelines (e.g. NDPC statutory filing pack).",
          "Executive sign-off and verifiable timestamp generation."
        ]
      }
    };

    // Legal Content Data (PDF Section 21 & 26)
    const legalNotices = {
      privacy: {
        title: "Privacy Notice",
        subtitle: "How TruePriv collects, uses, and protects personal data.",
        body: `<p><strong>1. Controller Identity & Contact:</strong> TruePriv Technology Limited is committed to protecting the privacy of visitors to our marketing website. For enquiries, contact <a href="mailto:privacy@truepriv.com" style="color:var(--tp-orange)">privacy@truepriv.com</a>.</p>
        <p style="margin-top:12px;"><strong>2. Visitor Data Categories:</strong> We collect business contact information (name, work email, organisation, phone number) when you voluntarily submit our 'Book a Demo' or 'Contact' forms, as well as necessary technical telemetry for website reliability.</p>
        <p style="margin-top:12px;"><strong>3. Purposes & Lawful Basis:</strong> Information submitted through demo and contact forms is processed under legitimate business interests to review your requirements, coordinate product demonstrations, and respond to sales and partnership enquiries.</p>
        <p style="margin-top:12px;"><strong>4. Data Retention & Transfers:</strong> Contact submissions are retained only as long as necessary to manage your enquiry. Data is processed within secure sovereign infrastructure with strict cryptographic safeguards.</p>`
      },
      cookies: {
        title: "Cookie Notice",
        subtitle: "Information regarding trackers and cookies used on this website.",
        body: `<p>This marketing website utilizes essential first-party cookies necessary for routing, form security (CSRF protection), and site performance. We do not engage in non-essential third-party tracking or behavioral advertising without prior explicit consent.</p>`
      },
      terms: {
        title: "Terms of Use",
        subtitle: "Terms and conditions governing access to this website.",
        body: `<p>All materials, workflows, interface designs, text, and graphics on this website are the intellectual property of TruePriv Technology Limited. Content on this site is provided for informational purposes only and does not constitute formal legal advice or statutory DPCO certification.</p>`
      },
      'acceptable-use': {
        title: "Acceptable Use Policy",
        subtitle: "Standards for interacting with TruePriv public forms and resources.",
        body: `<p>Visitors may not submit misleading, abusive, or malicious code through demo or contact forms. Submitting passwords or confidential customer records through public contact forms is strictly prohibited.</p>`
      },
      'security-info': {
        title: "Security Information",
        subtitle: "Overview of technical safeguards and vulnerability reporting.",
        body: `<p>TruePriv enforces multi-tenant logical isolation, TLS 1.3 transit encryption, AES-256 rest encryption, and strict role-based access control. If you identify a security concern, report it immediately to <a href="mailto:security@truepriv.com" style="color:var(--tp-orange)">security@truepriv.com</a>.</p>`
      },
      subprocessors: {
        title: "Subprocessors",
        subtitle: "Infrastructure providers supporting the TruePriv marketing website.",
        body: `<p>The public website is hosted on high-availability global CDN infrastructure (Vercel) with strictly audited edge security. The authenticated SaaS application operates under separate, verified sovereign hosting agreements.</p>`
      }
    };

    // Advanced HTML5 History API Router matching Client Sitemap
    const routeTitles = {
      '/': 'TruePriv | Turn Privacy Obligations into Work That Gets Done',
      '/platform': 'Platform Overview | TruePriv Privacy Operating System',
      '/features': 'Features Overview | TruePriv Compliance Modules',
      '/features/ropa-data-mapping': 'RoPA and Data Mapping | TruePriv Features',
      '/features/dpia-risk-assessments': 'DPIA and Risk Assessments | TruePriv Features',
      '/features/dpo-work-management': 'DPO Work Management | TruePriv Features',
      '/features/rights-requests': 'Rights Requests (DSAR) | TruePriv Features',
      '/features/incidents-breaches': 'Incidents and Breaches | TruePriv Features',
      '/features/vendors-contracts': 'Vendors and Contracts | TruePriv Features',
      '/features/policies-training-evidence': 'Policies, Training & Evidence | TruePriv Features',
      '/solutions/organisations': 'Solutions for Organisations | TruePriv',
      '/solutions/privacy-professionals': 'Solutions for Privacy Professionals & DPCOs | TruePriv',
      '/data-residency': 'Data Residency & Deployment | TruePriv',
      '/security': 'Security & Layered Governance | TruePriv',
      '/pricing': 'Pricing & Operating Plans | TruePriv',
      '/countries/nigeria': 'Nigeria Privacy Compliance (NDPA 2023) | TruePriv',
      '/countries': 'Pan-Africa Regulatory Jurisdictions Hub | TruePriv',
      '/resources/insights': 'Practical Privacy Insights | TruePriv',
      '/resources/regulatory-library': 'Pan-African Regulatory Library | TruePriv',
      '/help': 'Help Centre & Workflow Guides | TruePriv',
      '/about': 'About TruePriv | Making Privacy Operational Across Africa',
      '/partners': 'Partnerships & DPCO Network | TruePriv',
      '/book-demo': 'Book an Interactive Demonstration | TruePriv',
      '/contact': 'Contact Us & Departmental Routing | TruePriv',
      '/legal/privacy': 'Privacy Notice | TruePriv Legal',
      '/legal/cookies': 'Cookie Notice | TruePriv Legal',
      '/legal/terms': 'Terms of Use | TruePriv Legal',
      '/legal/acceptable-use': 'Acceptable Use Policy | TruePriv Legal',
      '/legal/security-information': 'Security Information | TruePriv Legal',
      '/legal/subprocessors': 'Subprocessor Directory | TruePriv Legal'
    };

        function renderRoute(pathname) {
      // Normalize pathname
      let cleanPath = pathname || '/';
      cleanPath = cleanPath.replace(/\/index\.html$/, '');
      if (cleanPath.endsWith('/') && cleanPath.length > 1) {
        cleanPath = cleanPath.slice(0, -1);
      }
      if (!cleanPath) cleanPath = '/';

      // Update browser document title
      if (routeTitles[cleanPath]) {
        document.title = routeTitles[cleanPath];
      }

      // Hide all standard views
      document.querySelectorAll('.tp-view').forEach(function(v) {
        v.classList.remove('active');
      });

      // Close feature modal by default
      const modal = document.getElementById('feature-modal');
      if (modal) modal.style.display = 'none';

      // Check Feature Detail routes
      if (cleanPath.startsWith('/features/')) {
        const featureSlug = cleanPath.replace('/features/', '');
        const featureKeyMap = {
          'ropa-data-mapping': 'ropa',
          'dpia-risk-assessments': 'dpia',
          'dpo-work-management': 'dpo',
          'rights-requests': 'dsar',
          'incidents-breaches': 'incidents',
          'vendors-contracts': 'vendors',
          'policies-training-evidence': 'policies'
        };
        const key = featureKeyMap[featureSlug];
        if (key && featureDetails[key]) {
          // Show features view in background and popup modal
          const fView = document.getElementById('view-features');
          if (fView) fView.classList.add('active');
          openFeatureModal(key, false);
          return;
        }
      }

      // Check Legal routes
      if (cleanPath.startsWith('/legal/')) {
        const legalSlug = cleanPath.replace('/legal/', '');
        const legalKeyMap = {
          'privacy': 'privacy',
          'cookies': 'cookies',
          'terms': 'terms',
          'acceptable-use': 'acceptable-use',
          'security-information': 'security-info',
          'subprocessors': 'subprocessors'
        };
        const key = legalKeyMap[legalSlug] || 'privacy';
        openLegal(key, false);
        return;
      }

      // Standard View Map
      const viewMap = {
        '/': 'view-home',
        '/platform': 'view-platform',
        '/features': 'view-features',
        '/solutions/organisations': 'view-solutions-organisations',
        '/solutions/privacy-professionals': 'view-solutions-privacy-professionals',
        '/data-residency': 'view-data-residency',
        '/security': 'view-security',
        '/pricing': 'view-pricing',
        '/countries/nigeria': 'view-countries',
        '/countries': 'view-countries',
        '/resources/insights': 'view-insights',
        '/resources/regulatory-library': 'view-regulatory-library',
        '/help': 'view-help',
        '/about': 'view-about',
        '/partners': 'view-partners',
        '/book-demo': 'view-book-demo',
        '/contact': 'view-contact'
      };

      const viewId = viewMap[cleanPath] || 'view-home';
      const target = document.getElementById(viewId);
      if (target) {
        target.classList.add('active');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }

    function navigateTo(path) {
      if (!path) path = '/';
      if (!path.startsWith('/')) {
        path = '/' + path;
      }
      try {
        if (window.location.pathname !== path) {
          window.history.pushState({ path: path }, '', path);
        }
      } catch (err) {
        console.warn('History pushState error:', err);
      }
      renderRoute(path);
    }

    function openFeatureModal(featureKey, pushUrl) {
      if (pushUrl === undefined) pushUrl = true;
      const slugMap = {
        'ropa': '/features/ropa-data-mapping',
        'dpia': '/features/dpia-risk-assessments',
        'dpo': '/features/dpo-work-management',
        'dsar': '/features/rights-requests',
        'incidents': '/features/incidents-breaches',
        'vendors': '/features/vendors-contracts',
        'policies': '/features/policies-training-evidence',
        'regulatory': '/features'
      };
      const path = slugMap[featureKey];
      if (pushUrl && path) {
        try {
          window.history.pushState({ path: path }, '', path);
        } catch(e) {}
        if (routeTitles[path]) {
          document.title = routeTitles[path];
        }
      }
      const data = featureDetails[featureKey];
      if (!data) return;
      const modal = document.getElementById('feature-modal');
      const content = document.getElementById('feature-modal-content');
      
      let stepsHtml = data.workflow.map(function(s, idx) {
        return '<div style="display:flex; gap:12px; margin-bottom:12px; font-size:13px; color:var(--tp-text-secondary);">' +
          '<span style="font-family:var(--font-mono); font-weight:700; color:var(--tp-orange); width:20px;">0' + (idx+1) + '</span>' +
          '<span>' + s + '</span>' +
        '</div>';
      }).join('');

      content.innerHTML = 
        '<div style="font-family:var(--font-mono); font-size:11px; font-weight:700; color:var(--tp-orange); text-transform:uppercase; margin-bottom:6px;">Feature Detail Workflow</div>' +
        '<h2 style="font-family:var(--font-display); font-size:26px; font-weight:800; color:var(--tp-dark); margin-bottom:8px;">' + data.title + '</h2>' +
        '<h4 style="font-size:15px; font-weight:600; color:var(--tp-orange); margin-bottom:16px;">' + data.headline + '</h4>' +
        '<p style="font-size:14px; line-height:1.6; color:var(--tp-text-secondary); margin-bottom:24px;">' + data.desc + '</p>' +
        '<h4 style="font-family:var(--font-display); font-size:15px; font-weight:700; margin-bottom:14px;">5-to-7 Step Operational Workflow:</h4>' +
        '<div style="background:var(--tp-bg-alt); padding:20px; border-radius:12px; border:1px solid var(--tp-border); margin-bottom:24px;">' +
          stepsHtml +
        '</div>' +
        '<div style="display:flex; justify-content:space-between; align-items:center;">' +
          '<button class="tp-btn-primary" onclick="closeFeatureModal(); navigateTo(\'/book-demo\');">Book a Demo</button>' +
          '<button class="tp-btn-outline" onclick="closeFeatureModal();">Close</button>' +
        '</div>';
      modal.style.display = 'flex';
    }

    function closeFeatureModal() {
      const modal = document.getElementById('feature-modal');
      if (modal) modal.style.display = 'none';
      if (window.location.pathname.startsWith('/features/')) {
        try {
          window.history.pushState({ path: '/features' }, '', '/features');
        } catch(e) {}
        if (routeTitles['/features']) {
          document.title = routeTitles['/features'];
        }
      }
    }

    function openLegal(key, pushUrl) {
      if (pushUrl === undefined) pushUrl = true;
      const legalSlugMap = {
        'privacy': '/legal/privacy',
        'cookies': '/legal/cookies',
        'terms': '/legal/terms',
        'acceptable-use': '/legal/acceptable-use',
        'security-info': '/legal/security-information',
        'subprocessors': '/legal/subprocessors'
      };
      const path = legalSlugMap[key];
      if (pushUrl && path) {
        try {
          window.history.pushState({ path: path }, '', path);
        } catch(e) {}
        if (routeTitles[path]) {
          document.title = routeTitles[path];
        }
      }
      const data = legalNotices[key];
      if (!data) return;
      document.getElementById('legal-title').innerText = data.title;
      document.getElementById('legal-subtitle').innerText = data.subtitle;
      document.getElementById('legal-body').innerHTML = data.body;
      document.querySelectorAll('.tp-view').forEach(function(v) {
        v.classList.remove('active');
      });
      const target = document.getElementById('view-legal');
      if (target) target.classList.add('active');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    function handleDemoSubmit(e) {
      e.preventDefault();
      document.getElementById('demo-success').style.display = 'block';
      e.target.reset();
    }

    function handleContactSubmit(e) {
      e.preventDefault();
      document.getElementById('contact-success').style.display = 'block';
      e.target.reset();
    }

    function toggleMobileMenu() {
      const nav = document.querySelector('.tp-nav');
      if (!nav) return;
      if (nav.style.display === 'flex') {
        nav.style.display = 'none';
      } else {
        nav.style.display = 'flex';
        nav.style.flexDirection = 'column';
        nav.style.position = 'absolute';
        nav.style.top = '72px';
        nav.style.left = '0';
        nav.style.right = '0';
        nav.style.background = '#ffffff';
        nav.style.padding = '20px';
        nav.style.borderBottom = '1px solid var(--tp-border)';
      }
    }

    // Handle Back / Forward browser buttons
    window.addEventListener('popstate', function(e) {
      renderRoute(window.location.pathname);
    });

    // Initial load
    window.addEventListener('DOMContentLoaded', function() {
      renderRoute(window.location.pathname);
    });
  