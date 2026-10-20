import React, { useState, useRef, useEffect } from 'react';

export default function Sidebar({ 
  activeTab, 
  onTabChange, 
  tenant,
  user,
  accessibleClients = [],
  onSwitchTenant,
  onLogout,
  isCollapsed, 
  onToggle 
}) {
  const [workspaceDropdownOpen, setWorkspaceDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setWorkspaceDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const userRole = user?.role || 'corporate_admin';
  const isSuperAdmin = userRole === 'super_admin';
  const isCorporateAdmin = userRole === 'corporate_admin';
  const isComplianceOfficer = userRole === 'compliance_officer';
  const isDpo = userRole === 'outsourced_dpo';
  const isDpco = userRole === 'dpco_lead_auditor' || userRole === 'dpco_staff' || tenant?.type === 'dpco_firm';
  const isConsultancy = isDpo || isDpco || tenant?.type === 'outsourced_dpo';
  const isChampion = userRole === 'dept_champion';

  const accountTypeLabel = isSuperAdmin 
    ? 'Global authority account' 
    : isConsultancy 
    ? 'Consultancy account' 
    : isComplianceOfficer
    ? 'Compliance officer seat'
    : isChampion
    ? 'Department champion seat'
    : 'Organisation account';

  // Role permissions
  const canAccessClientPortfolio = isConsultancy || isSuperAdmin;
  const canAccessDpoProgramme = isDpo || isSuperAdmin;
  const canAccessProspects = isConsultancy || isSuperAdmin;
  const canAccessBilling = isSuperAdmin || isCorporateAdmin;
  const canAccessSettings = isSuperAdmin || isCorporateAdmin;

  // 1. WORKSPACE GROUP
  const workspaceItems = [
    { id: 'dashboard', label: 'Overview', icon: 'fa-solid fa-table-cells-large' },
    { id: 'work', label: 'My work', icon: 'fa-regular fa-file-lines' },
  ];
  if (!isChampion) {
    workspaceItems.push({ id: 'calendar', label: 'Calendar', icon: 'fa-regular fa-calendar' });
  }
  // Client Portfolio is ONLY visible for Consultant accounts (DPO & DPCO) & Super Admin
  if (canAccessClientPortfolio) {
    workspaceItems.push({ id: 'portfolio-desk', label: 'Client portfolio', icon: 'fa-regular fa-folder-closed' });
  }

  // 2. INVENTORY GROUP
  const inventoryItems = isChampion 
    ? [
        { id: 'processing', label: 'Processing activities', icon: 'fa-solid fa-database' },
      ]
    : isDpco 
    ? [
        { id: 'processing', label: 'Processing activities', icon: 'fa-solid fa-database' },
        { id: 'systems', label: 'Systems', icon: 'fa-solid fa-layer-group' },
        { id: 'contracts', label: 'Contracts', icon: 'fa-solid fa-file-contract' },
      ]
    : [
        { id: 'processing', label: 'Processing activities', icon: 'fa-solid fa-database' },
        { id: 'systems', label: 'Systems', icon: 'fa-solid fa-layer-group' },
        { id: 'vendors', label: 'Vendors', icon: 'fa-solid fa-building' },
        { id: 'transfers', label: 'Transfers', icon: 'fa-solid fa-arrow-right-arrow-left' },
        { id: 'contracts', label: 'Contracts', icon: 'fa-solid fa-file-contract' },
      ];

  // 3. ASSESSMENTS GROUP
  const assessmentItems = isChampion 
    ? [] 
    : [
        { id: 'dpia', label: 'DPIA', icon: 'fa-solid fa-clipboard-check' },
        { id: 'lia', label: 'LIA', icon: 'fa-solid fa-scale-balanced' },
        { id: 'tia', label: 'TIA', icon: 'fa-solid fa-earth-africa' },
        { id: 'vra', label: 'VRA', icon: 'fa-solid fa-expand' },
      ];

  // 4. RESPOND GROUP
  const respondItems = isChampion 
    ? [] 
    : isDpco 
    ? [
        { id: 'regulatory-filings', label: 'Regulatory filings', icon: 'fa-regular fa-file-lines' },
      ]
    : [
        { id: 'dsar', label: 'Rights requests', icon: 'fa-regular fa-circle-check' },
        { id: 'breach', label: 'Incidents', icon: 'fa-regular fa-shield' },
        { id: 'regulatory-filings', label: 'Regulatory filings', icon: 'fa-regular fa-file-lines' },
      ];

  // 5. IMPROVE GROUP
  const improveItems = isChampion
    ? []
    : isDpco
    ? [
        { id: 'controls', label: 'Controls', icon: 'fa-solid fa-shield-halved' },
        { id: 'evidence', label: 'Evidence', icon: 'fa-regular fa-eye' },
        { id: 'audits', label: 'Audits', icon: 'fa-solid fa-building-columns' },
      ]
    : [
        { id: 'risks', label: 'Risks', icon: 'fa-solid fa-layer-group' },
        { id: 'controls', label: 'Controls', icon: 'fa-solid fa-shield-halved' },
        { id: 'actions', label: 'Actions', icon: 'fa-solid fa-list-check' },
        { id: 'evidence', label: 'Evidence', icon: 'fa-regular fa-eye' },
        { id: 'audits', label: 'Audits', icon: 'fa-solid fa-building-columns' },
        { id: 'training', label: 'Training', icon: 'fa-solid fa-graduation-cap' },
      ];

  if (canAccessDpoProgramme) {
    improveItems.push({ id: 'dpo-prog', label: 'DPO programme', icon: 'fa-solid fa-user-shield' });
  }

  // 6. CONSULTANCY GROUP (Strictly for Consultant accounts and Super Admin only)
  const consultancyItems = [];
  if (canAccessProspects) {
    consultancyItems.push({ id: 'prospects', label: 'Prospects', icon: 'fa-solid fa-briefcase' });
  }

  // 7. BOTTOM STANDALONE ITEMS (Strictly Role Permission Guarded)
  const bottomItems = [];
  if (!isChampion) {
    bottomItems.push({ id: 'reports', label: 'Reports', icon: 'fa-regular fa-file-lines' });
  }
  if (canAccessSettings) {
    bottomItems.push({ id: 'settings', label: 'Settings', icon: 'fa-solid fa-gear' });
  }
  if (canAccessBilling) {
    bottomItems.push({ id: 'billing', label: 'Subscription & Plans', icon: 'fa-solid fa-credit-card' });
  }
  bottomItems.push({ id: 'help', label: 'Help centre', icon: 'fa-regular fa-circle-question' });

  const renderNavSection = (title, items) => {
    if (!items || items.length === 0) return null;
    return (
      <div className="space-y-0.5 pt-2">
        {!isCollapsed && title && (
          <div className="text-[10px] font-bold text-slate-400 tracking-wider uppercase px-3 py-1 select-none">
            {title}
          </div>
        )}
        {items.map((item) => {
          const isActive = activeTab === item.id || (item.id === 'dashboard' && activeTab === 'overview');
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              title={isCollapsed ? item.label : undefined}
              className={`w-full flex items-center ${
                isCollapsed ? 'justify-center p-2.5' : 'gap-3 px-3 py-2'
              } rounded-xl text-xs font-medium transition-all ${
                isActive
                  ? 'bg-[#fff7ed] text-[#ea580c] font-bold shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <i className={`${item.icon} text-sm ${isActive ? 'text-[#ea580c]' : 'text-slate-400'} flex-shrink-0 w-4 text-center`}></i>
              {!isCollapsed && <span className="truncate">{item.label}</span>}
            </button>
          );
        })}
      </div>
    );
  };

  return (
    <aside 
      className={`${
        isCollapsed ? 'w-20' : 'w-64'
      } transition-all duration-300 ease-in-out border-r border-slate-200/90 bg-white flex flex-col justify-between min-h-screen h-screen sticky top-0 shadow-2xs flex-shrink-0 z-20`}
    >
      <div className="flex flex-col flex-1 overflow-y-auto">
        
        {/* 1. Brand Logo */}
        <div className="p-4 pb-2 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#ea580c] flex items-center justify-center text-white font-black text-lg shadow-xs select-none">
              T
            </div>
            {!isCollapsed && (
              <span className="text-xl font-bold tracking-tight text-slate-900">
                TruePriv
              </span>
            )}
          </div>
          {onToggle && (
            <button
              onClick={onToggle}
              title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
              className="text-slate-400 hover:text-slate-700 p-1 rounded-lg text-xs md:hidden"
            >
              <i className={`fa-solid ${isCollapsed ? 'fa-angles-right' : 'fa-angles-left'}`}></i>
            </button>
          )}
        </div>

        {/* 2. Workspace Selector */}
        {!isCollapsed && (
          <div className="px-4 py-3" ref={dropdownRef}>
            <div className="text-[10px] font-bold text-slate-400 tracking-wider uppercase mb-1.5 select-none">
              WORKSPACE
            </div>
            <div className="relative">
              <button
                onClick={() => accessibleClients.length > 1 && setWorkspaceDropdownOpen(!workspaceDropdownOpen)}
                className={`w-full flex items-center justify-between px-3 py-2 bg-white border border-slate-200 ${
                  accessibleClients.length > 1 ? 'hover:border-slate-300 cursor-pointer' : 'cursor-default'
                } rounded-xl text-left shadow-2xs transition-all`}
              >
                <span className="text-xs font-bold text-slate-800 uppercase tracking-tight truncate">
                  {tenant?.name || (isConsultancy ? 'DPCO TEST ACCOUNT' : 'APEX MICROFINANCE BANK')}
                </span>
                {accessibleClients.length > 1 && (
                  <i className="fa-solid fa-chevron-down text-[10px] text-slate-400 ml-1.5 flex-shrink-0"></i>
                )}
              </button>

              <div className="text-xs text-slate-500 mt-1 pl-0.5">
                {accountTypeLabel}
              </div>

              {/* Accessible Clients Dropdown */}
              {workspaceDropdownOpen && accessibleClients.length > 1 && (
                <div className="absolute top-full left-0 right-0 mt-1.5 bg-white border border-slate-200 rounded-2xl shadow-xl p-2 z-50 animate-in fade-in space-y-1">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2 py-1">
                    Switch Workspace
                  </div>
                  {accessibleClients.map((client) => {
                    const isSelected = (client.tenant_id || client.id) === tenant?.id;
                    return (
                      <button
                        key={client.tenant_id || client.id}
                        onClick={() => {
                          onSwitchTenant(client.tenant_id || client.id);
                          setWorkspaceDropdownOpen(false);
                        }}
                        className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium flex items-center justify-between transition-all ${
                          isSelected ? 'bg-orange-50 text-orange-700 font-bold' : 'hover:bg-slate-50 text-slate-700'
                        }`}
                      >
                        <span className="truncate">{client.tenant_name || client.name}</span>
                        {isSelected && <i className="fa-solid fa-check text-[10px] text-orange-600"></i>}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* 3. Navigation Sections (Matching Client's Exact Groupings) */}
        <nav className="px-3 py-2 space-y-2 flex-1 pb-4">
          {renderNavSection(null, workspaceItems)}
          {renderNavSection('INVENTORY', inventoryItems)}
          {renderNavSection('ASSESSMENTS', assessmentItems)}
          {renderNavSection('RESPOND', respondItems)}
          {renderNavSection('IMPROVE', improveItems)}
          {consultancyItems.length > 0 && renderNavSection('CONSULTANCY', consultancyItems)}
          
          {/* Bottom Standalone items */}
          <div className="pt-2 border-t border-slate-100">
            {bottomItems.map((item) => {
              const isActive = activeTab === item.id || (item.id === 'settings' && ['admin-users', 'audit-logs', 'champions-desk', 'data-residency', 'my-profile'].includes(activeTab));
              return (
                <button
                  key={item.id}
                  onClick={() => onTabChange(item.id)}
                  title={isCollapsed ? item.label : undefined}
                  className={`w-full flex items-center ${
                    isCollapsed ? 'justify-center p-2.5' : 'gap-3 px-3 py-2'
                  } rounded-xl text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-[#fff7ed] text-[#ea580c] font-bold shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <i className={`${item.icon} text-sm ${isActive ? 'text-[#ea580c]' : 'text-slate-400'} flex-shrink-0 w-4 text-center`}></i>
                  {!isCollapsed && <span className="truncate">{item.label}</span>}
                </button>
              );
            })}
          </div>
        </nav>
      </div>

      {/* 4. Bottom User Profile Capsule */}
      <div className="p-3 border-t border-slate-100 bg-white">
        <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'} gap-2`}>
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 text-slate-700 flex items-center justify-center font-bold text-xs flex-shrink-0 select-none">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'E'}
            </div>
            {!isCollapsed && (
              <div className="min-w-0">
                <div className="text-xs font-bold text-slate-900 truncate">
                  {user?.name || 'Esmee de Jong'}
                </div>
                <div className="text-[11px] text-slate-400 truncate">
                  {user?.email || 'esmee.dejong92@gmail.com'}
                </div>
                <div className="mt-0.5">
                  {isSuperAdmin && (
                    <span className="inline-flex items-center gap-1 text-[9px] font-bold text-amber-800 bg-amber-50 border border-amber-300 px-1.5 py-0.2 rounded">
                      <i className="fa-solid fa-crown text-[8px] text-amber-600"></i> Super Admin
                    </span>
                  )}
                  {isCorporateAdmin && (
                    <span className="inline-flex items-center gap-1 text-[9px] font-bold text-[#ea580c] bg-orange-50 border border-orange-200 px-1.5 py-0.2 rounded">
                      Corporate Admin
                    </span>
                  )}
                  {isComplianceOfficer && (
                    <span className="inline-flex items-center gap-1 text-[9px] font-bold text-blue-700 bg-blue-50 border border-blue-200 px-1.5 py-0.2 rounded">
                      Compliance Officer
                    </span>
                  )}
                  {isDpo && (
                    <span className="inline-flex items-center gap-1 text-[9px] font-bold text-sky-700 bg-sky-50 border border-sky-200 px-1.5 py-0.2 rounded">
                      Outsourced DPO
                    </span>
                  )}
                  {isDpco && (
                    <span className="inline-flex items-center gap-1 text-[9px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-1.5 py-0.2 rounded">
                      DPCO Auditor
                    </span>
                  )}
                  {isChampion && (
                    <span className="inline-flex items-center gap-1 text-[9px] font-bold text-purple-700 bg-purple-50 border border-purple-200 px-1.5 py-0.2 rounded">
                      Dept Champion
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
          {!isCollapsed && (
            <button 
              onClick={onLogout} 
              className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
              title="Sign out of TruePriv"
            >
              <i className="fa-solid fa-arrow-right-from-bracket text-sm"></i>
            </button>
          )}
        </div>
      </div>
    </aside>
  );
}
