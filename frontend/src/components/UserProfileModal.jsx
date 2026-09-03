import React, { useState } from 'react';
import { api } from '../lib/api';

export default function UserProfileModal({ isOpen, onClose, user, onUpdateUser }) {
  if (!isOpen || !user) return null;

  const [formData, setFormData] = useState({
    name: user.name || '',
    phone: user.phone || '',
    department: user.department || 'Compliance & Risk',
    password: '',
    confirmPassword: '',
  });

  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

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
      };

      if (formData.password) {
        payload.password = formData.password;
      }

      const res = await api.updateMyProfile(payload);
      if (res.success) {
        setSuccessMsg('Your profile has been successfully updated.');
        if (onUpdateUser) {
          onUpdateUser(res.user);
        }
        setTimeout(() => {
          onClose();
        }, 1200);
      }
    } catch (err) {
      setErrorMsg(err.message || 'Failed to update profile.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="w-full max-w-xl bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-bold text-lg shadow-md">
              {user.name ? user.name.substring(0, 2).toUpperCase() : 'TU'}
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 tracking-tight">Edit My Account Profile</h3>
              <p className="text-xs text-slate-500">Manage your personal credentials, contact info, and security.</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <i className="fa-solid fa-xmark text-base"></i>
          </button>
        </div>

        {/* Notifications */}
        {successMsg && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-xl text-xs font-semibold flex items-center gap-2">
            <i className="fa-solid fa-circle-check text-emerald-600"></i>
            <span>{successMsg}</span>
          </div>
        )}

        {errorMsg && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-900 rounded-xl text-xs font-semibold flex items-center gap-2">
            <i className="fa-solid fa-circle-exclamation text-red-600"></i>
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Profile Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-700 font-bold mb-1">Full Legal Name</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-900 font-semibold focus:outline-none focus:border-emerald-600 focus:bg-white"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-bold mb-1">Official Work Email</label>
              <input
                type="email"
                disabled
                value={user.email}
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
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-900 focus:outline-none focus:border-emerald-600 focus:bg-white"
              />
              <span className="text-[10px] text-slate-400 mt-0.5 block">For 72h incident SMS alerts</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-bold mb-1">Department</label>
              <select
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-900 font-semibold focus:outline-none focus:border-emerald-600 focus:bg-white"
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

            <div>
              <label className="block text-slate-700 font-bold mb-1">Assigned System Role</label>
              <input
                type="text"
                disabled
                value={user.role?.replace(/_/g, ' ')?.toUpperCase() || 'COMPLIANCE OFFICER'}
                className="w-full bg-slate-100 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-600 font-bold uppercase cursor-not-allowed"
              />
              <span className="text-[10px] text-slate-400 mt-0.5 block">Configured by Organization Admin</span>
            </div>
          </div>

          {/* Change Password Section */}
          <div className="pt-3 border-t border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-800 flex items-center gap-1.5">
                <i className="fa-solid fa-key text-slate-500"></i> Change Password
              </span>
              <span className="text-[10px] text-slate-400">Optional</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-600 mb-1">New Password</label>
                <input
                  type="password"
                  placeholder="••••••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-emerald-600 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-slate-600 mb-1">Confirm New Password</label>
                <input
                  type="password"
                  placeholder="••••••••••••"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-emerald-600 focus:bg-white"
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold transition-all"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold shadow-md transition-all flex items-center gap-2 disabled:opacity-50"
            >
              <i className="fa-solid fa-floppy-disk text-xs"></i>
              <span>{loading ? 'Saving Changes...' : 'Save Profile Changes'}</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
