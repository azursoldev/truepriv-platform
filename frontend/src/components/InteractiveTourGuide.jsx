import React, { useState, useEffect, useRef } from 'react';

export const COMPREHENSIVE_TOUR_STEPS = [
  // ==========================================
  // 1. TOP HEADER & WORKSPACE BAR
  // ==========================================
  {
    id: 'header-workspace',
    tab: 'dashboard',
    targetId: 'tour-workspace',
    pageName: 'Top Bar',
    sectionBadge: 'FIELD 1 • WORKSPACE CONTEXT',
    icon: 'fa-solid fa-building-columns',
    title: 'Active Organization Context',
    meaning: 'Displays the currently verified legal entity under active compliance review. Ensures strict tenant data isolation between different client databases.',
    bullets: [
      'Confirms which organization’s records are active',
      'Protects data isolation for multi-client DPCO firms',
    ],
  },
  {
    id: 'header-tour-btn',
    tab: 'dashboard',
    targetId: 'tour-header-tour-btn',
    pageName: 'Top Bar',
    sectionBadge: 'BUTTON 2 • GUIDED TOUR',
    icon: 'fa-solid fa-compass',
    title: 'Interactive Guided Tour Trigger',
    meaning: 'Launch this guided walkthrough anytime to explore every feature, statutory calculation, and compliance workflow across all platform desks.',
    bullets: [
      'Interactive walkthrough covering all platform modules',
      'Keyboard navigation with Left/Right arrows and Esc',
    ],
  },
  {
    id: 'header-champions-btn',
    tab: 'dashboard',
    targetId: 'tour-header-champions',
    pageName: 'Top Bar',
    sectionBadge: 'BUTTON 3 • GUEST INTAKE',
    icon: 'fa-solid fa-user-plus',
    title: 'Department Champions Guest Invites',
    meaning: 'Generate tokenized, time-limited invitation links for department heads (HR, IT, Sales) to input departmental data flows without full system access.',
    bullets: [
      'Secure 30-day time-limited guest invitations',
      'Eliminates password sharing for departmental data collection',
    ],
  },
  {
    id: 'header-billing-btn',
    tab: 'dashboard',
    targetId: 'tour-header-billing',
    pageName: 'Top Bar',
    sectionBadge: 'BUTTON 4 • 365-DAY LICENSE',
    icon: 'fa-solid fa-credit-card',
    title: 'Subscription Status & Checkout',
    meaning: 'Monitors your 365-day statutory compliance license. Click anytime to view pricing plans, renew via Paystack/Flutterwave, or download tax invoices.',
    bullets: [
      'Live status badge showing active subscription tier',
      'Instant access to corporate tax receipts and wire proofs',
    ],
  },
  {
    id: 'header-profile-menu',
    tab: 'dashboard',
    targetId: 'tour-header-profile',
    pageName: 'Top Bar',
    sectionBadge: 'MENU 5 • PROFILE & SETTINGS',
    icon: 'fa-solid fa-user-gear',
    title: 'Profile & Governance Dropdown',
    meaning: 'Your workspace settings control room. Access User Roles (RBAC), Security Audit Trails, Guest Link Invites, and 1-click Sign Out.',
    bullets: [
      'Manage staff access and assign role permissions',
      'Inspect tamper-evident security audit logs',
    ],
  },

  // ==========================================
  // 2. DASHBOARD SUMMARY TELEMETRY CARDS
  // ==========================================
  {
    id: 'metric-source-records',
    tab: 'dashboard',
    targetId: 'tour-metric-source',
    pageName: 'Dashboard',
    sectionBadge: 'CARD 1 • SOURCE RECORDS',
    icon: 'fa-solid fa-database',
    title: 'Source Records Telemetry',
    meaning: 'The single source of truth for your compliance program. Counts all personal data processing operations logged across HR, IT, Finance, and Operations.',
    bullets: [
      'Baseline inventory required under NDPA Section 24',
      'Catalogs customer, employee, and vendor data flows',
    ],
  },
  {
    id: 'metric-prepared-drafts',
    tab: 'dashboard',
    targetId: 'tour-metric-drafts',
    pageName: 'Dashboard',
    sectionBadge: 'CARD 2 • AUTONOMOUS DRAFTS',
    icon: 'fa-solid fa-bolt',
    title: 'Prepared Drafts Telemetry',
    meaning: 'Automated intelligence metric. Measures draft policies, notices, and assessment candidates pre-built by system screening waiting for legal officer sign-off.',
    bullets: [
      'Pre-generated drafts waiting for human legal review',
      'Eliminates over 80% of manual documentation time',
    ],
  },
  {
    id: 'metric-facts-reused',
    tab: 'dashboard',
    targetId: 'tour-metric-facts',
    pageName: 'Dashboard',
    sectionBadge: 'CARD 3 • FACTS REUSED',
    icon: 'fa-solid fa-link',
    title: 'Facts Reused Telemetry',
    meaning: 'Zero-redundancy automation. When you enter a server location or retention duration once, Truepriv automatically syncs it across DPIAs, LIAs, and TIAs.',
    bullets: [
      'Shared data points populated automatically across forms',
      'Guarantees consistency across audits and government filings',
    ],
  },
  {
    id: 'metric-needs-decision',
    tab: 'dashboard',
    targetId: 'tour-metric-decisions',
    pageName: 'Dashboard',
    sectionBadge: 'CARD 4 • ACTION ITEMS',
    icon: 'fa-solid fa-check',
    title: 'Needs a Decision Telemetry',
    meaning: 'Urgent compliance alert. High-priority records where lawful bases, retention schedules, or DPO approvals are missing before statutory submission.',
    bullets: [
      'Flags records requiring immediate officer attention',
      'Directly links to items in your Decision Queue below',
    ],
  },

  // ==========================================
  // 3. YOUR DECISION QUEUE SECTION
  // ==========================================
  {
    id: 'decision-allwork-btn',
    tab: 'dashboard',
    targetId: 'tour-decision-allwork',
    pageName: 'Dashboard',
    sectionBadge: 'BUTTON • WORKSPACE QUEUE',
    icon: 'fa-solid fa-arrow-right',
    title: '"All Work" Task Shortcut',
    meaning: 'Direct shortcut to your personal work desk. Click to view all open compliance tasks, filter by priority, and track pending regulatory deadlines.',
    bullets: [
      '1-Click jump to your personal daily compliance queue',
      'Monitor tasks currently under review by DPCO auditors',
    ],
  },
  {
    id: 'decision-card-item',
    tab: 'dashboard',
    targetId: 'tour-decision-card',
    pageName: 'Dashboard',
    sectionBadge: 'CARD • ACTIONABLE REMEDIATION',
    icon: 'fa-regular fa-file-lines',
    title: 'Actionable Decision Card',
    meaning: 'Highlights specific missing statutory fields (e.g. 2 missing answers). Clicking this card opens the target document immediately for completion.',
    bullets: [
      'Shows exactly what information is missing before filing',
      'Clicking opens the document directly for resolution',
    ],
  },

  // ==========================================
  // 4. ONE SOURCE, CONNECTED OUTPUTS SECTION
  // ==========================================
  {
    id: 'output-vendor-item',
    tab: 'dashboard',
    targetId: 'tour-output-vendor',
    pageName: 'Dashboard',
    sectionBadge: 'LINKAGE 1 • VENDOR TO VRA',
    icon: 'fa-solid fa-bolt',
    title: 'Vendor → VRA Automated Linkage',
    meaning: 'Automated third-party risk pipeline. Registering an outside vendor automatically prepares a Vendor Risk Assessment using linked system data.',
    bullets: [
      'Reuses linked systems and personal data categories',
      'Click to jump directly to the Vendor directory',
    ],
  },
  {
    id: 'output-activity-item',
    tab: 'dashboard',
    targetId: 'tour-output-activity',
    pageName: 'Dashboard',
    sectionBadge: 'LINKAGE 2 • ACTIVITY TO DPIA',
    icon: 'fa-solid fa-bolt',
    title: 'Activity → DPIA / LIA Linkage',
    meaning: 'Sensitive processing screening. High-risk signals (biometrics, AI profiling) automatically prepare a DPIA, while commercial processing prepares an LIA.',
    bullets: [
      'High-risk signals trigger automated DPIA drafting',
      'Click to jump directly to the RoPA Activities ledger',
    ],
  },
  {
    id: 'output-transfer-item',
    tab: 'dashboard',
    targetId: 'tour-output-transfer',
    pageName: 'Dashboard',
    sectionBadge: 'LINKAGE 3 • TRANSFER TO TIA',
    icon: 'fa-solid fa-bolt',
    title: 'Transfer → TIA Linkage',
    meaning: 'Cross-border intelligence. Routing personal data to foreign cloud servers automatically drafts a Transfer Impact Assessment assessing foreign adequacy.',
    bullets: [
      'Detects foreign destinations and cross-border clouds',
      'Click to inspect Cross-Border International Transfers',
    ],
  },
  {
    id: 'output-request-item',
    tab: 'dashboard',
    targetId: 'tour-output-request',
    pageName: 'Dashboard',
    sectionBadge: 'LINKAGE 4 • REQUEST TO TASK',
    icon: 'fa-solid fa-bolt',
    title: 'Request → Response Task Linkage',
    meaning: 'Citizen privacy rights automation. Customer requests (DSAR) create linked response tasks with legal deadlines to prevent statutory fines.',
    bullets: [
      'Keeps customer requests linked to departmental tasks',
      'Click to view active rights requests and deadlines',
    ],
  },
  {
    id: 'output-incident-item',
    tab: 'dashboard',
    targetId: 'tour-output-incident',
    pageName: 'Dashboard',
    sectionBadge: 'LINKAGE 5 • INCIDENT TO TRIAGE',
    icon: 'fa-solid fa-bolt',
    title: 'Incident → Triage Task Linkage',
    meaning: 'Emergency incident response pipeline. Logging a suspected data breach initiates the statutory 72-hour NDPC countdown and damage containment checklist.',
    bullets: [
      'Automates forensic checklists and containment steps',
      'Click to view emergency triage tasks in your queue',
    ],
  },
  {
    id: 'output-disclaimer-item',
    tab: 'dashboard',
    targetId: 'tour-output-disclaimer',
    pageName: 'Dashboard',
    sectionBadge: 'NOTE • SCREENING BOUNDARY',
    icon: 'fa-solid fa-circle-info',
    title: 'Regulatory Screening Disclaimer',
    meaning: 'Statutory boundary notice. Truepriv AI screening flags candidates for review, but does not make final legal decisions without certified human sign-off.',
    bullets: [
      'Ensures accountability under NDPA segregation of duties',
      'Final sign-offs remain with accredited DPO officers',
    ],
  },

  // ==========================================
  // 5. MY WORK PAGE
  // ==========================================
  {
    id: 'work-assigned-card',
    tab: 'work',
    targetId: 'tour-work-assigned',
    pageName: 'My Work',
    sectionBadge: 'METRIC 1 • ASSIGNED TASKS',
    icon: 'fa-regular fa-file-lines',
    title: 'Assigned to Me Work Desk',
    meaning: 'Direct operational tasks assigned to your desk requiring action or updates under NDPA compliance timelines.',
    bullets: [
      'Priority items requiring your direct completion',
      'Flags overdue or urgent compliance actions',
    ],
  },
  {
    id: 'work-review-card',
    tab: 'work',
    targetId: 'tour-work-review',
    pageName: 'My Work',
    sectionBadge: 'METRIC 2 • UNDER REVIEW',
    icon: 'fa-solid fa-magnifying-glass',
    title: 'Independent Review Queue',
    meaning: 'Submissions waiting for independent DPO verification or external DPCO auditor review before approval.',
    bullets: [
      'Maintains segregation of duties under Section 24',
      'Awaiting independent sign-off from compliance officers',
    ],
  },
  {
    id: 'work-completed-card',
    tab: 'work',
    targetId: 'tour-work-completed',
    pageName: 'My Work',
    sectionBadge: 'METRIC 3 • COMPLETED ITEMS',
    icon: 'fa-solid fa-circle-check',
    title: 'Completed Compliance Desk',
    meaning: 'Records and tasks completed on schedule during the active audit period, proving continuous regulatory compliance.',
    bullets: [
      '100% on-schedule audit progression metric',
      'Feeds directly into statutory annual compliance reports',
    ],
  },
  {
    id: 'work-queue-card',
    tab: 'work',
    targetId: 'tour-work-queue',
    pageName: 'My Work',
    sectionBadge: 'QUEUE • ACTIVE TASK LIST',
    icon: 'fa-solid fa-list-check',
    title: 'Active Task Queue & Priority Tracker',
    meaning: 'Live operational task queue. Displays task titles, due dates, statutory categories (Review, Governance, Rights), and priority tags.',
    bullets: [
      'Tasks prioritized by statutory deadlines',
      'Click any task to inspect details and complete work',
    ],
  },

  // ==========================================
  // 6. CALENDAR PAGE
  // ==========================================
  {
    id: 'calendar-schedule-card',
    tab: 'calendar',
    targetId: 'tour-page-calendar',
    pageName: 'Calendar',
    sectionBadge: 'TIMETABLE • STATUTORY SCHEDULE',
    icon: 'fa-regular fa-calendar',
    title: 'Statutory Calendar & Milestones',
    meaning: 'Chronological timetable tracking annual NDPC filing deadlines, recurring review cycles, and 30-day guest token expirations.',
    bullets: [
      'Government filing deadlines (NDPC Annual CAR)',
      'Vendor security certificate renewal schedules',
    ],
  },

  // ==========================================
  // 7. PROCESSING ACTIVITIES (ROPA)
  // ==========================================
  {
    id: 'ropa-presets-section',
    tab: 'processing',
    targetId: 'tour-ropa-presets',
    pageName: 'RoPA',
    sectionBadge: 'BUTTON 1 • 1-CLICK PRESETS',
    icon: 'fa-solid fa-wand-magic-sparkles',
    title: '1-Click Industry Presets',
    meaning: 'Pre-configured compliance presets for Nigerian Banks, FinTechs, and Healthcare providers. Imports banking data flows (BVN, KYC, Payroll) in seconds.',
    bullets: [
      '1-Click statutory bank/fintech/healthcare presets',
      'Eliminates over 90% of manual inventory entry',
    ],
  },
  {
    id: 'ropa-new-activity-section',
    tab: 'processing',
    targetId: 'tour-ropa-new-activity',
    pageName: 'RoPA',
    sectionBadge: 'BUTTON 2 • NEW ACTIVITY',
    icon: 'fa-solid fa-plus',
    title: 'Create New Processing Activity',
    meaning: 'Open the manual processing activity wizard to record custom data flows. Document lawful bases, PII categories, retention periods, and storage locations.',
    bullets: [
      'Bespoke wizard for departmental data flow intake',
      'Assigns accountable department owners and lawful bases',
    ],
  },
  {
    id: 'ropa-filter-section',
    tab: 'processing',
    targetId: 'tour-ropa-search-filters',
    pageName: 'RoPA',
    sectionBadge: 'FILTERS • SEARCH & DEPT',
    icon: 'fa-solid fa-filter',
    title: 'Search & Department / Status Filters',
    meaning: 'Instantly filter activities by keyword, department (HR, Finance, Tech, Operations), or regulatory stage (Draft, Dept Review, DPO Verified, Approved).',
    bullets: [
      'Search by activity name or business purpose',
      'Filter by department and statutory progression stages',
    ],
  },
  {
    id: 'ropa-table-section',
    tab: 'processing',
    targetId: 'tour-ropa-table',
    pageName: 'RoPA',
    sectionBadge: 'LEDGER • MASTER INVENTORY',
    icon: 'fa-solid fa-table-list',
    title: 'Master Processing Activities Ledger',
    meaning: 'The central master inventory required under NDPA Section 24. Displays data flows, lawful bases, retention periods, and approval progression status.',
    bullets: [
      'Live status progression: Draft → Dept Review → Approved',
      'Exportable to government-certified regulatory formats',
    ],
  },
  {
    id: 'ropa-first-row-section',
    tab: 'processing',
    targetId: 'tour-ropa-first-row',
    pageName: 'RoPA',
    sectionBadge: 'ROW • DETAILS & APPROVAL',
    icon: 'fa-solid fa-check-double',
    title: 'Activity Inspection & DPO Approval',
    meaning: 'Click any row in the ledger to open the complete details drawer. Authorized compliance officers can verify, approve, or delete records directly.',
    bullets: [
      'Click row to inspect full statutory details drawer',
      '1-Click DPO audit checkmark and approval progression',
    ],
  },

  // ==========================================
  // 8. SYSTEMS & IT ASSETS
  // ==========================================
  {
    id: 'systems-inventory-section',
    tab: 'systems',
    targetId: 'tour-systems-inventory',
    pageName: 'Systems',
    sectionBadge: 'INVENTORY • SERVERS & DBs',
    icon: 'fa-solid fa-layer-group',
    title: 'Systems Inventory & Data Sovereignty',
    meaning: 'Catalogs where personal data lives. Tracks core banking servers, customer databases, and verifies Nigerian onshore residency (e.g. Galaxy Backbone).',
    bullets: [
      'Inventory of databases, cloud apps, and servers',
      'Verifies Nigerian onshore data sovereignty compliance',
    ],
  },

  // ==========================================
  // 9. THIRD-PARTY VENDORS
  // ==========================================
  {
    id: 'vendors-directory-section',
    tab: 'vendors',
    targetId: 'tour-page-vendors',
    pageName: 'Vendors',
    sectionBadge: 'DIRECTORY • VENDOR RISK',
    icon: 'fa-solid fa-building',
    title: 'Third-Party Processors & Risk Matrix',
    meaning: 'Directory of external partners handling data on your behalf (cloud hosts, SMS gateways, PSPs). Tracks signed DPAs and objective security risk scores.',
    bullets: [
      'Monitors signed Data Processing Agreements (DPAs)',
      'Assigns risk scores to protect against supply-chain leaks',
    ],
  },

  // ==========================================
  // 10. TRANSFERS (CROSS-BORDER)
  // ==========================================
  {
    id: 'transfers-register-section',
    tab: 'transfers',
    targetId: 'tour-page-transfers',
    pageName: 'Transfers',
    sectionBadge: 'REGISTER • CROSS-BORDER',
    icon: 'fa-solid fa-arrow-right-arrow-left',
    title: 'Cross-Border Transfer Register',
    meaning: 'Tracks international data flows outside Nigeria. Documents mandatory legal safeguards and adequacy determinations required under NDPA Sections 41–43.',
    bullets: [
      'Logs overseas cloud destinations and global partners',
      'Verifies 100% localized primary storage safeguards',
    ],
  },

  // ==========================================
  // 11. PRIVACY CONTRACTS & DPAs
  // ==========================================
  {
    id: 'contracts-archive-section',
    tab: 'contracts',
    targetId: 'tour-page-contracts',
    pageName: 'Contracts',
    sectionBadge: 'ARCHIVE • DPAs & AGREEMENTS',
    icon: 'fa-solid fa-file-contract',
    title: 'Privacy Contracts & DPA Repository',
    meaning: 'Central archive for Data Processing Agreements (DPAs), confidentiality clauses, and vendor contracts. Tracks execution status and renewal dates.',
    bullets: [
      'Archive for DPAs with cloud providers and contractors',
      'Ensures vendors are legally bound to protect customer data',
    ],
  },

  // ==========================================
  // 12. DPIA (IMPACT ASSESSMENTS)
  // ==========================================
  {
    id: 'dpia-matrix-section',
    tab: 'dpia',
    targetId: 'tour-dpia-desk',
    pageName: 'DPIA',
    sectionBadge: 'ASSESSMENT • 5X5 MATRIX',
    icon: 'fa-solid fa-clipboard-check',
    title: '5×5 Risk Matrix & Certified DPO Seal',
    meaning: 'Mandatory risk evaluation before launching high-risk projects (biometrics, AI profiling). Evaluates likelihood vs impact with formal DPCO auditor seals.',
    bullets: [
      '5×5 Likelihood vs Impact statutory risk matrix',
      'Official digital seal from certified DPCO Lead Auditors',
    ],
  },

  // ==========================================
  // 13. LIA (LEGITIMATE INTEREST)
  // ==========================================
  {
    id: 'lia-desk-section',
    tab: 'lia',
    targetId: 'tour-page-lia',
    pageName: 'LIA',
    sectionBadge: 'ASSESSMENT • 3-PART TEST',
    icon: 'fa-solid fa-scale-balanced',
    title: 'Three-Part Balancing Test Desk',
    meaning: 'Used when relying on legitimate interests instead of explicit consent. Executes the 3-part statutory test (Purpose, Necessity, Balancing).',
    bullets: [
      'Validates commercial necessity vs individual privacy',
      'Documents statutory justifications to prevent regulatory fines',
    ],
  },

  // ==========================================
  // 14. TIA (TRANSFER IMPACT)
  // ==========================================
  {
    id: 'tia-desk-section',
    tab: 'tia',
    targetId: 'tour-page-tia',
    pageName: 'TIA',
    sectionBadge: 'ASSESSMENT • ADEQUACY',
    icon: 'fa-solid fa-globe',
    title: 'Transfer Impact Assessment Desk',
    meaning: 'Evaluates destination country privacy laws before transferring data abroad. Recommends supplementary technical measures like end-to-end encryption.',
    bullets: [
      'Evaluates foreign government surveillance laws',
      'Ensures cross-border cloud storage complies with NDPA',
    ],
  },

  // ==========================================
  // 15. VRA (VENDOR RISK)
  // ==========================================
  {
    id: 'vra-desk-section',
    tab: 'vra',
    targetId: 'tour-page-vra',
    pageName: 'VRA',
    sectionBadge: 'ASSESSMENT • SUPPLIER AUDIT',
    icon: 'fa-solid fa-shield-virus',
    title: 'Vendor Security Health Checks',
    meaning: 'Standardized security health checks evaluating outside processors’ firewalls, staff training, and data protection posture with objective risk scoring.',
    bullets: [
      'Standardized security questionnaires sent to suppliers',
      'Computes objective risk ratings: Low, Medium, High',
    ],
  },

  // ==========================================
  // 16. RIGHTS REQUESTS (DSAR)
  // ==========================================
  {
    id: 'dsar-desk-section',
    tab: 'dsar',
    targetId: 'tour-dsar-desk',
    pageName: 'Rights Requests',
    sectionBadge: 'DESK • CITIZEN RIGHTS',
    icon: 'fa-solid fa-user-shield',
    title: 'Citizen Privacy Rights & Timers',
    meaning: 'Manages citizen requests for data access, correction, or deletion within statutory deadlines. Generates verified response letters.',
    bullets: [
      'Logs customer requests (Data Access, Erasure, Correction)',
      'Live statutory countdown clock to prevent penalties',
    ],
  },

  // ==========================================
  // 17. INCIDENTS (BREACH)
  // ==========================================
  {
    id: 'breach-desk-section',
    tab: 'breach',
    targetId: 'tour-breach-desk',
    pageName: 'Incidents',
    sectionBadge: 'EMERGENCY • 72-HOUR DESK',
    icon: 'fa-solid fa-triangle-exclamation',
    title: '72-Hour Breach Countdown & Form 1',
    meaning: 'Emergency incident response center. Nigerian law mandates notifying the NDPC within 72 hours of a breach. Generates official Form 1 filing documents.',
    bullets: [
      'Live 72-hour countdown triggered on breach confirmation',
      'Auto-generates official NDPC Form 1 filing documents',
    ],
  },

  // ==========================================
  // 18. REGULATORY FILINGS (CAR)
  // ==========================================
  {
    id: 'regulatory-filings-section',
    tab: 'regulatory-filings',
    targetId: 'tour-page-regulatory-filings',
    pageName: 'Regulatory Filings',
    sectionBadge: 'GOVERNMENT • ANNUAL CAR',
    icon: 'fa-solid fa-file-invoice',
    title: 'Annual Compliance Audit Returns (CAR)',
    meaning: 'Official portal for annual government compliance submissions. Compiles your entire year’s privacy records into certified packages ready for NDPC filing.',
    bullets: [
      'Compiles annual Compliance Audit Returns (CAR)',
      'Includes formal digital seals from licensed DPCO firms',
    ],
  },

  // ==========================================
  // 19. REPORTS & ANALYTICS
  // ==========================================
  {
    id: 'reports-desk-section',
    tab: 'reports',
    targetId: 'tour-page-reports',
    pageName: 'Reports',
    sectionBadge: 'ANALYTICS • BOARD EXPORTS',
    icon: 'fa-solid fa-chart-pie',
    title: 'Board Presentations & Evidence Bundles',
    meaning: 'Converts compliance records into clear visual charts, percentages, and downloadable PDF reports for company directors, executive board members, and auditors.',
    bullets: [
      'Executive compliance scorecards for senior leadership',
      'Downloadable PDF summaries proving regulatory due diligence',
    ],
  },

  // ==========================================
  // 20. SETTINGS & RBAC
  // ==========================================
  {
    id: 'settings-desk-section',
    tab: 'settings',
    targetId: 'tour-page-settings',
    pageName: 'Settings',
    sectionBadge: 'ADMIN • ACCESS CONTROL',
    icon: 'fa-solid fa-gear',
    title: 'User Roles, RBAC & Security Audit Logs',
    meaning: 'The administrative control room. Add staff members, assign role permissions (Administrator, Champion, Auditor), and review security audit trails.',
    bullets: [
      'User management and role-based access control (RBAC)',
      'Tamper-evident audit logs tracking every change and login',
    ],
  },

  // ==========================================
  // 21. SUBSCRIPTION & BILLING (3 SECTIONS)
  // ==========================================
  {
    id: 'billing-license-section',
    tab: 'billing',
    targetId: 'tour-billing-card',
    pageName: 'Subscription',
    sectionBadge: 'CARD • 365-DAY LICENSE',
    icon: 'fa-solid fa-certificate',
    title: '365-Day Statutory License & Countdown',
    meaning: 'Monitors your 365-day statutory compliance license, active countdown, and cryptographic NDPC license key. Restricts report exports upon expiration.',
    bullets: [
      'Live days countdown with 30-day and 7-day warning phases',
      'Protective compliance lock preserving audit readiness',
    ],
  },
  {
    id: 'billing-pricing-section',
    tab: 'billing',
    targetId: 'tour-billing-pricing',
    pageName: 'Subscription',
    sectionBadge: 'CHECKOUT • MULTI-GATEWAY',
    icon: 'fa-solid fa-credit-card',
    title: 'Multi-Gateway Checkout Engine',
    meaning: 'Select between Annual (₦450,000/yr) or Monthly plans. Supports instant activation via Paystack (Cards/USSD), Flutterwave, and direct Nigerian Bank Wire.',
    bullets: [
      'Paystack & Flutterwave: Instant automated license renewal',
      'Bank Wire Transfer: Direct proof slip upload & approval',
    ],
  },
  {
    id: 'billing-ledger-section',
    tab: 'billing',
    targetId: 'tour-billing-ledger',
    pageName: 'Subscription',
    sectionBadge: 'LEDGER • TAX INVOICES',
    icon: 'fa-solid fa-receipt',
    title: 'Payment History & FIRS 7.5% VAT Invoices',
    meaning: 'Official corporate tax invoice repository and payment history ledger. Automatically calculates Nigerian 7.5% FIRS VAT and generates certified printable PDF receipts.',
    bullets: [
      'Itemized FIRS 7.5% VAT breakdown (Net + 7.5% VAT)',
      '1-Click official corporate invoice modal with PDF download',
    ],
  },

  // ==========================================
  // 22. HELP CENTRE
  // ==========================================
  {
    id: 'help-guide-section',
    tab: 'help',
    targetId: 'tour-page-help',
    pageName: 'Help Centre',
    sectionBadge: 'KNOWLEDGE • SUPPORT DESK',
    icon: 'fa-regular fa-circle-question',
    title: 'NDPA Guidance & Knowledge Base',
    meaning: 'Your built-in knowledge library. Clear explanations of all NDPA 2023 legal obligations, assessment walkthroughs, and direct contact channels for DPCO support.',
    bullets: [
      'Plain-English legal obligations and walkthrough guides',
      'Direct channels for dedicated DPCO compliance assistance',
    ],
  },
];

export default function InteractiveTourGuide({
  isOpen,
  onClose,
  onComplete,
  activeTab,
  onNavigate,
}) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [spotlightRect, setSpotlightRect] = useState(null);
  const [popoverPos, setPopoverPos] = useState({ top: 100, left: 100, placement: 'bottom', arrowStyle: {} });
  const popoverRef = useRef(null);

  const currentStep = COMPREHENSIVE_TOUR_STEPS[currentStepIndex];
  const totalSteps = COMPREHENSIVE_TOUR_STEPS.length;

  // Reset to initial step when tour opens
  useEffect(() => {
    if (isOpen) {
      setCurrentStepIndex(0);
    }
  }, [isOpen]);

  // When step changes, automatically navigate to the target page tab!
  useEffect(() => {
    if (!isOpen || !currentStep) return;

    if (currentStep.tab && onNavigate && activeTab !== currentStep.tab) {
      onNavigate(currentStep.tab);
    }
  }, [isOpen, currentStepIndex, currentStep, activeTab, onNavigate]);

  // Driver.js / Stripe Style Precision Tethering & Pointer Anchor Calculation
  useEffect(() => {
    if (!isOpen || !currentStep) {
      setSpotlightRect(null);
      return;
    }

    const updatePositionAndSpotlight = () => {
      let targetEl = document.getElementById(currentStep.targetId);
      if (!targetEl) {
        targetEl = document.getElementById(`tour-page-${currentStep.tab}`);
      }

      if (targetEl) {
        targetEl.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' });
        const rect = targetEl.getBoundingClientRect();
        const padding = 8;
        const boundedRect = {
          top: Math.max(0, rect.top - padding),
          left: Math.max(0, rect.left - padding),
          width: rect.width + padding * 2,
          height: rect.height + padding * 2,
          bottom: rect.bottom + padding,
          right: rect.right + padding,
        };

        setSpotlightRect(boundedRect);

        // Compute Tethered Tooltip Coordinates with Arrow Pointer
        const popoverWidth = Math.min(310, window.innerWidth - 32);
        // Measure real card height or fallback to 250
        const cardHeight = popoverRef.current ? popoverRef.current.offsetHeight : 250;
        const offset = 14; // distance from target
        const vpWidth = window.innerWidth;
        const vpHeight = window.innerHeight;

        const spaceBelow = vpHeight - boundedRect.bottom;
        const spaceAbove = boundedRect.top;
        const spaceRight = vpWidth - boundedRect.right;
        const spaceLeft = boundedRect.left;

        const targetCenterX = boundedRect.left + boundedRect.width / 2;
        const targetCenterY = boundedRect.top + boundedRect.height / 2;

        let placement = 'bottom';
        let top = 0;
        let left = 0;
        let arrowStyle = {};

        // Intelligent placement determination:
        // 1. If element is in the RIGHT half of viewport and we have space on the LEFT:
        if (targetCenterX > vpWidth / 2 && spaceLeft >= popoverWidth + offset) {
          placement = 'left';
          left = boundedRect.left - popoverWidth - offset;
          top = targetCenterY - cardHeight / 2;
        }
        // 2. If element is in the LEFT half of viewport and we have space on the RIGHT:
        else if (targetCenterX <= vpWidth / 2 && spaceRight >= popoverWidth + offset) {
          placement = 'right';
          left = boundedRect.right + offset;
          top = targetCenterY - cardHeight / 2;
        }
        // 3. If element is in upper part of screen and space below is plenty:
        else if (spaceBelow >= cardHeight + offset + 20) {
          placement = 'bottom';
          top = boundedRect.bottom + offset;
          left = targetCenterX - popoverWidth / 2;
        }
        // 4. If space below is tight but space above is plenty:
        else if (spaceAbove >= cardHeight + offset + 20) {
          placement = 'top';
          top = boundedRect.top - cardHeight - offset;
          left = targetCenterX - popoverWidth / 2;
        }
        // 5. Fallback: place where there is more vertical room
        else {
          if (spaceBelow >= spaceAbove) {
            placement = 'bottom';
            top = boundedRect.bottom + offset;
          } else {
            placement = 'top';
            top = boundedRect.top - cardHeight - offset;
          }
          left = targetCenterX - popoverWidth / 2;
        }

        // STRICT VIEWPORT CLAMPING:
        // Top must NEVER push the card or footer past the bottom of the viewport!
        const maxAllowedTop = Math.max(16, vpHeight - cardHeight - 16);
        top = Math.max(75, Math.min(maxAllowedTop, top));
        left = Math.max(16, Math.min(vpWidth - popoverWidth - 16, left));

        // Compute Pointer Arrow Position pointing directly at target element
        if (placement === 'bottom') {
          const arrowX = Math.max(16, Math.min(popoverWidth - 24, targetCenterX - left));
          arrowStyle = {
            top: '-5px',
            left: `${arrowX}px`,
            transform: 'translateX(-50%) rotate(45deg)',
          };
        } else if (placement === 'top') {
          const arrowX = Math.max(16, Math.min(popoverWidth - 24, targetCenterX - left));
          arrowStyle = {
            bottom: '-5px',
            left: `${arrowX}px`,
            transform: 'translateX(-50%) rotate(45deg)',
          };
        } else if (placement === 'right') {
          const arrowY = Math.max(16, Math.min(cardHeight - 24, targetCenterY - top));
          arrowStyle = {
            left: '-5px',
            top: `${arrowY}px`,
            transform: 'translateY(-50%) rotate(45deg)',
          };
        } else if (placement === 'left') {
          const arrowY = Math.max(16, Math.min(cardHeight - 24, targetCenterY - top));
          arrowStyle = {
            right: '-5px',
            top: `${arrowY}px`,
            transform: 'translateY(-50%) rotate(45deg)',
          };
        }

        setPopoverPos({ top, left, placement, arrowStyle });
      } else {
        setSpotlightRect(null);
      }
    };

    const timer = setTimeout(updatePositionAndSpotlight, 160);
    window.addEventListener('resize', updatePositionAndSpotlight);
    window.addEventListener('scroll', updatePositionAndSpotlight, true);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', updatePositionAndSpotlight);
      window.removeEventListener('scroll', updatePositionAndSpotlight, true);
    };
  }, [isOpen, currentStepIndex, currentStep, activeTab]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowRight' || e.key === 'Enter') {
        handleNext();
      } else if (e.key === 'ArrowLeft') {
        handlePrev();
      } else if (e.key === 'Escape') {
        handleClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, currentStepIndex]);

  if (!isOpen || !currentStep) return null;

  const handleNext = () => {
    if (currentStepIndex < totalSteps - 1) {
      setCurrentStepIndex((prev) => prev + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrev = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex((prev) => prev - 1);
    }
  };

  const handleComplete = () => {
    localStorage.setItem('truepriv_tour_completed', 'true');
    sessionStorage.setItem('truepriv_tour_dismissed', 'true');
    if (onComplete) onComplete();
    onClose();
  };

  const handleClose = () => {
    sessionStorage.setItem('truepriv_tour_dismissed', 'true');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[9999] pointer-events-none select-none">
      {/* 1. Precision Spotlight Cutout on Target Element */}
      {spotlightRect && (
        <div
          style={{
            top: `${spotlightRect.top}px`,
            left: `${spotlightRect.left}px`,
            width: `${spotlightRect.width}px`,
            height: `${spotlightRect.height}px`,
          }}
          className="fixed rounded-2xl pointer-events-none transition-all duration-300 ease-out border-2 border-[#ea580c] ring-4 ring-orange-500/40 shadow-[0_0_0_9999px_rgba(15,23,42,0.50)] z-[9998]"
        >
          {/* Target Element Floating Pill */}
          <div className="absolute -top-3 left-3 bg-gradient-to-r from-[#ea580c] to-amber-600 text-white text-[9px] font-extrabold font-mono tracking-wider uppercase px-2 py-0.5 rounded-full shadow-lg flex items-center gap-1.5 animate-pulse">
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping"></span>
            <span className="truncate max-w-[200px]">{currentStep.title}</span>
          </div>
        </div>
      )}

      {/* 2. Stripe & Driver.js Style Compact Tethered Tooltip with Arrow */}
      <div
        ref={popoverRef}
        style={{
          top: `${popoverPos.top}px`,
          left: `${popoverPos.left}px`,
          width: 'min(310px, calc(100vw - 32px))',
          maxHeight: 'calc(100vh - 90px)',
          position: 'fixed',
        }}
        className="pointer-events-auto bg-white rounded-2xl shadow-2xl border border-slate-200/90 z-[10000] animate-in fade-in zoom-in-95 duration-200 flex flex-col overflow-visible"
      >
        {/* Dynamic Pointer Arrow (Directly points at target element!) */}
        <div
          style={popoverPos.arrowStyle}
          className="absolute w-2.5 h-2.5 bg-white border-l border-t border-slate-200 shadow-2xs z-[10001]"
        />

        {/* Compact Card Header: flex-shrink-0 */}
        <div className="p-3 pb-2 border-b border-slate-100 flex items-start justify-between gap-2 bg-gradient-to-r from-slate-900 to-slate-800 text-white rounded-t-2xl flex-shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-6 h-6 rounded-lg bg-orange-500/20 text-orange-400 border border-orange-400/40 flex items-center justify-center text-xs flex-shrink-0">
              <i className={currentStep.icon}></i>
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1 text-[9px] text-orange-400 font-mono font-bold uppercase tracking-wider">
                <span>{currentStepIndex + 1}/{totalSteps}</span>
                <span>•</span>
                <span className="truncate max-w-[120px]">{currentStep.sectionBadge}</span>
              </div>
              <h4 className="text-xs font-bold text-white tracking-tight truncate">
                {currentStep.title}
              </h4>
            </div>
          </div>

          <button
            onClick={handleClose}
            title="Exit Tour (Esc)"
            className="w-5 h-5 rounded-md bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center text-[10px] transition-colors cursor-pointer flex-shrink-0"
          >
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>

        {/* Quick Jump Selector Bar: flex-shrink-0 */}
        <div className="px-3 py-1 bg-slate-50 border-b border-slate-100 flex items-center justify-between gap-1.5 text-[10px] flex-shrink-0">
          <span className="text-slate-400 font-mono font-bold uppercase">Jump:</span>
          <select
            value={currentStepIndex}
            onChange={(e) => setCurrentStepIndex(Number(e.target.value))}
            className="bg-white border border-slate-200 rounded px-1.5 py-0.5 text-[10px] font-semibold text-slate-700 focus:outline-none focus:border-orange-500 cursor-pointer max-w-[190px] truncate"
          >
            {COMPREHENSIVE_TOUR_STEPS.map((step, idx) => (
              <option key={step.id} value={idx}>
                {idx + 1}. {step.pageName}: {step.title}
              </option>
            ))}
          </select>
        </div>

        {/* Compact Card Body: overflow-y-auto max-h-[160px] flex-1 */}
        <div className="p-3 space-y-2 text-left overflow-y-auto max-h-[160px] flex-1">
          {/* 1-2 Crisp Sentences Meaning */}
          <p className="text-xs text-slate-700 font-medium leading-relaxed">
            {currentStep.meaning}
          </p>

          {/* 2 Key Action Highlights */}
          <div className="space-y-1 bg-slate-50 rounded-lg p-2 border border-slate-100">
            {currentStep.bullets.slice(0, 2).map((b, i) => (
              <div key={i} className="flex items-start gap-1.5 text-[11px] text-slate-600">
                <i className="fa-solid fa-circle-check text-emerald-600 text-[9px] mt-0.5 flex-shrink-0"></i>
                <span className="leading-snug">{b}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Compact Card Footer: flex-shrink-0 (NEVER CUT OFF) */}
        <div className="p-2.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-2 rounded-b-2xl flex-shrink-0">
          <button
            type="button"
            onClick={handleClose}
            className="text-[11px] font-semibold text-slate-400 hover:text-slate-700 px-1 py-0.5 transition-colors cursor-pointer"
          >
            Skip
          </button>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={handlePrev}
              disabled={currentStepIndex === 0}
              className={`px-2 py-0.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                currentStepIndex === 0
                  ? 'opacity-30 cursor-not-allowed text-slate-400 bg-slate-100'
                  : 'text-slate-700 bg-white border border-slate-200 hover:bg-slate-100 cursor-pointer shadow-2xs'
              }`}
            >
              <i className="fa-solid fa-arrow-left text-[9px]"></i>
              <span>Back</span>
            </button>

            <button
              type="button"
              onClick={handleNext}
              className="px-3 py-1 rounded-lg text-xs font-bold text-white bg-[#ea580c] hover:bg-[#c2410c] transition-all shadow-xs flex items-center gap-1 cursor-pointer"
            >
              <span>{currentStepIndex === totalSteps - 1 ? 'Done' : 'Next'}</span>
              <i className={`fa-solid ${currentStepIndex === totalSteps - 1 ? 'fa-check' : 'fa-arrow-right'} text-[9px]`}></i>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
