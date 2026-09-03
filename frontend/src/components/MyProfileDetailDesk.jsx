import React, { useState } from 'react';
import { api } from '../lib/api';

const avatarPresets = [
  { id: 'av1', label: 'Executive DPO', url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&h=200&q=80' },
  { id: 'av2', label: 'Compliance Lead', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&h=200&q=80' },
  { id: 'av3', label: 'Security Auditor', url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&h=200&q=80' },
  { id: 'av4', label: 'DPCO Partner', url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&h=200&q=80' },
  { id: 'av5', label: 'Legal Counsel', url: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=200&h=200&q=80' },
  { id: 'av6', label: 'Tech Champion', url: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=200&h=200&q=80' },
];

export default function MyProfileDetailDesk({ user, tenant, onUpdateUser, onNavigateBack }) {
  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    department: user?.department || 'Compliance & Risk',
    avatar_url: user?.avatar_url || '',
    password: '',
    confirmPassword: '',
  });

  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  // Handle local image file upload
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      setErrorMsg('Image size must be less than 2MB.');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData((prev) => ({ ...prev, avatar_url: reader.result }));
    };
    reader.readAsDataURL(file);
  };

  const handleSelectPreset = (url) => {
    setFormData((prev) => ({ ...prev, avatar_url: url }));
  };

  const handleRemoveAvatar = () => {
    setFormData((prev) => ({ ...prev, avatar_url: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMsg(null);
    setErrorMsg(null);

    if (formData.password && formData.password !== formData.confirmPassword) {
      setErrorMsg('Password confirmation does not match.');
      return;
    }

    if (formData.password && formData.password.length < 8) {
      setErrorMsg('New password must be at least 8 characters.');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        name: formData.name,
        phone: formData.phone,
        department: formData.department,
        avatar_url: formData.avatar_url,
      };

      if (formData.password) {
        payload.password = formData.password;
      }

      const res = await api.updateMyProfile(payload);
      if (res.success) {
        setSuccessMsg('Your profile and DP photo have been updated successfully.');
        if (onUpdateUser) {
          onUpdateUser(res.user);
        }
      }
    } catch (err) {
      setErrorMsg(err.message || 'Failed to update profile.');
    } finally {
      setLoading(false);
    }
  };

  const getRoleBadge = (role) => {
    switch (role) {
      case 'super_admin':
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-bold bg-amber-50 text-amber-900 border border-amber-300 px-3 py-1 rounded-full">
            <i className="fa-solid fa-crown text-xs text-amber-600"></i> Super Admin
          </span>
        );
      case 'corporate_admin':
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-bold bg-emerald-50 text-emerald-900 border border-emerald-300 px-3 py-1 rounded-full">
            <i className="fa-solid fa-building text-xs text-emerald-600"></i> Corporate Admin
          </span>
        );
      case 'dpco_lead_auditor':
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-bold bg-purple-50 text-purple-900 border border-purple-300 px-3 py-1 rounded-full">
            <i className="fa-solid fa-building-columns text-xs text-purple-600"></i> DPCO Lead Auditor
          </span>
        );
      case 'outsourced_dpo':
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-bold bg-blue-50 text-blue-900 border border-blue-300 px-3 py-1 rounded-full">
            <i className="fa-solid fa-user-shield text-xs text-blue-600"></i> Outsourced DPO
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-bold bg-slate-100 text-slate-800 border border-slate-300 px-3 py-1 rounded-full">
            <i className="fa-solid fa-shield-halved text-xs text-slate-600"></i> {user?.role?.replace(/_/g, ' ')?.toUpperCase() || 'COMPLIANCE OFFICER'}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      
      {/* Top Navigation & Actions Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white border border-slate-200 p-4 sm:p-6 rounded-3xl shadow-xs">
        <div className="flex items-center gap-3">
          <button
            onClick={onNavigateBack}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
          >
            <i className="fa-solid fa-arrow-left text-xs"></i>
            <span>Back to Dashboard</span>
          </button>
          <div className="h-5 w-px bg-slate-200 hidden sm:block"></div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <span>My Profile & Account Studio</span>
              {getRoleBadge(user?.role)}
            </h2>
            <p className="text-xs text-slate-500">Manage your DP avatar photo, contact info, security credentials, and NDPA preferences.</p>
          </div>
        </div>

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow-md transition-all flex items-center gap-2 disabled:opacity-50"
        >
          <i className="fa-solid fa-floppy-disk text-xs"></i>
          <span>{loading ? 'Saving Changes...' : 'Save Profile Changes'}</span>
        </button>
      </div>

      {/* Notifications */}
      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-2xl text-xs font-semibold flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2">
            <i className="fa-solid fa-circle-check text-emerald-600 text-sm"></i>
            <span>{successMsg}</span>
          </div>
          <button onClick={() => setSuccessMsg(null)} className="text-slate-400 hover:text-slate-700">&times;</button>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-900 rounded-2xl text-xs font-semibold flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2">
            <i className="fa-solid fa-circle-exclamation text-red-600 text-sm"></i>
            <span>{errorMsg}</span>
          </div>
          <button onClick={() => setErrorMsg(null)} className="text-slate-400 hover:text-slate-700">&times;</button>
        </div>
      )}

      {/* Hero DP / Avatar Studio & Identity Card */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 pb-6 border-b border-slate-100">
          
          {/* Left: Avatar Photo Display & Details */}
          <div className="flex items-center gap-5">
            <div className="relative group">
              {formData.avatar_url ? (
                <img
                  src={formData.avatar_url}
                  alt={formData.name}
                  className="w-20 h-20 rounded-3xl object-cover border-2 border-emerald-500 shadow-md"
                />
              ) : (
                <div className="w-20 h-20 rounded-3xl bg-slate-900 text-white flex items-center justify-center font-extrabold text-2xl shadow-md">
                  {formData.name ? formData.name.substring(0, 2).toUpperCase() : 'TU'}
                </div>
              )}

              {/* Status Badge */}
              <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-white border-2 border-white shadow-xs flex items-center justify-center">
                <span className="w-3.5 h-3.5 rounded-full bg-emerald-500"></span>
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                  {formData.name || 'User Profile'}
                </h1>
                <span className="text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 px-2.5 py-0.5 rounded-full font-mono">
                  Verified Identity
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mt-1">
                <span><i className="fa-solid fa-envelope text-slate-400 mr-1"></i> {user?.email}</span>
                <span>&bull;</span>
                <span><i className="fa-solid fa-building text-slate-400 mr-1"></i> {tenant?.name || 'Truepriv Enterprise'}</span>
                <span>&bull;</span>
                <span><i className="fa-solid fa-calendar-check text-slate-400 mr-1"></i> Joined {new Date().getFullYear()}</span>
              </div>
            </div>
          </div>

          {/* Right: Upload Photo / Choose Presets Studio */}
          <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl w-full lg:w-auto space-y-3">
            <div className="flex items-center justify-between gap-4">
              <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <i className="fa-solid fa-camera text-emerald-600"></i>
                <span>Profile Photo (DP) Studio</span>
              </span>
              {formData.avatar_url && (
                <button
                  type="button"
                  onClick={handleRemoveAvatar}
                  className="text-[10px] text-red-600 font-bold hover:underline"
                >
                  Remove DP
                </button>
              )}
            </div>

            {/* Upload Button */}
            <div className="flex items-center gap-2">
              <label className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold cursor-pointer transition-all shadow-2xs flex items-center gap-1.5">
                <i className="fa-solid fa-arrow-up-from-bracket text-xs"></i>
                <span>Upload Custom Image</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
              <span className="text-[10px] text-slate-400">JPG, PNG, WebP (Max 2MB)</span>
            </div>

            {/* Quick Avatar Presets */}
            <div>
              <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                Or Select Professional Preset:
              </div>
              <div className="flex items-center gap-2">
                {avatarPresets.map((preset) => (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => handleSelectPreset(preset.url)}
                    title={preset.label}
                    className={`w-9 h-9 rounded-xl overflow-hidden border-2 transition-all hover:scale-105 ${
                      formData.avatar_url === preset.url ? 'border-emerald-600 ring-2 ring-emerald-500/30' : 'border-slate-200 opacity-80 hover:opacity-100'
                    }`}
                  >
                    <img src={preset.url} alt={preset.label} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Main 2-Column Detail Settings Form */}
      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT COLUMN: Personal Details & Professional Role (7 Columns) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* 1. Personal & Contact Info Card */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <i className="fa-solid fa-id-card text-emerald-600"></i>
                <span>Personal & Professional Profile</span>
              </h3>
              <span className="text-[10px] text-slate-400 uppercase font-bold">Live Editable</span>
            </div>

            <div className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Full Legal Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-900 font-semibold focus:outline-none focus:border-emerald-600 focus:bg-white transition-colors"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Official Work Email</label>
                  <input
                    type="email"
                    disabled
                    value={user?.email || ''}
                    className="w-full bg-slate-100 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-500 cursor-not-allowed"
                  />
                  <span className="text-[10px] text-slate-400 mt-0.5 block">Managed by Organization Admin</span>
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Contact Phone Number</label>
                  <input
                    type="tel"
                    placeholder="+234 803 114 2290"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-900 focus:outline-none focus:border-emerald-600 focus:bg-white transition-colors"
                  />
                  <span className="text-[10px] text-slate-400 mt-0.5 block">For statutory 72h SMS alerts</span>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Assigned Department</label>
                <select
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-900 font-semibold focus:outline-none focus:border-emerald-600 focus:bg-white transition-colors"
                >
                  <option value="Compliance & Risk">Compliance & Risk</option>
                  <option value="Information Technology">Information Technology (IT / SecOps)</option>
                  <option value="Human Resources">Human Resources (HR / People)</option>
                  <option value="Finance & Accounting">Finance & Accounting</option>
                  <option value="Operations">Operations & Business Lines</option>
                  <option value="Legal">Legal & Regulatory Affairs</option>
                  <option value="Executive Management">Executive Management</option>
                </select>
              </div>
            </div>
          </div>

          {/* 2. Statutory Role Information */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <i className="fa-solid fa-shield-halved text-blue-600"></i>
                <span>Statutory Role & Access Privileges</span>
              </h3>
              <span className="text-[10px] text-slate-400 font-mono font-bold">NDPA 2023</span>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900">Current Role Authority:</span>
                {getRoleBadge(user?.role)}
              </div>
              <p className="text-slate-600 leading-relaxed text-[11px] pt-1">
                Your role determines which regulatory desks, RoPA inventories, DPIA sign-off workflows, and DPCO audit packs you can execute within the <strong>{tenant?.name}</strong> workspace.
              </p>
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: Password Reset, 2FA & Notification Alerts (5 Columns) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* 1. Change Password & Security Card */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <i className="fa-solid fa-lock text-purple-600"></i>
                <span>Security & Password Management</span>
              </h3>
              <span className="text-[10px] text-slate-400">Optional</span>
            </div>

            <div className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-700 font-bold mb-1">New Password</label>
                <input
                  type="password"
                  placeholder="••••••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-900 focus:outline-none focus:border-emerald-600 focus:bg-white transition-colors"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Confirm New Password</label>
                <input
                  type="password"
                  placeholder="••••••••••••"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-900 focus:outline-none focus:border-emerald-600 focus:bg-white transition-colors"
                />
              </div>

              <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <i className="fa-solid fa-shield-check text-emerald-600"></i>
                  <span className="font-bold text-emerald-950">Statutory 2FA Protection</span>
                </div>
                <span className="text-[10px] font-bold text-emerald-800 font-mono">ENFORCED</span>
              </div>
            </div>
          </div>

          {/* 2. Statutory Alerts & Notifications Card */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <i className="fa-solid fa-bell text-amber-600"></i>
                <span>Statutory Notification Channels</span>
              </h3>
            </div>

            <div className="space-y-2.5 text-xs">
              <label className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between cursor-pointer">
                <div>
                  <div className="font-bold text-slate-900">72-Hour Breach Emergency SMS</div>
                  <div className="text-[10px] text-slate-500">Urgent notification on Section 40 breach incidents</div>
                </div>
                <input type="checkbox" defaultChecked className="w-4 h-4 accent-emerald-600 rounded" />
              </label>

              <label className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between cursor-pointer">
                <div>
                  <div className="font-bold text-slate-900">30-Day DSAR SLA Alerts</div>
                  <div className="text-[10px] text-slate-500">Reminders when data subject requests reach 20 days</div>
                </div>
                <input type="checkbox" defaultChecked className="w-4 h-4 accent-emerald-600 rounded" />
              </label>

              <label className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between cursor-pointer">
                <div>
                  <div className="font-bold text-slate-900">Weekly Executive Digest</div>
                  <div className="text-[10px] text-slate-500">Summary of RoPA additions and DPIA sign-offs</div>
                </div>
                <input type="checkbox" defaultChecked className="w-4 h-4 accent-emerald-600 rounded" />
              </label>
            </div>
          </div>

        </div>

      </form>

    </div>
  );
}
