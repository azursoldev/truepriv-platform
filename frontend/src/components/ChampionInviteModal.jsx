import React, { useState, useEffect } from 'react';
import { api } from '../lib/api';

export default function ChampionInviteModal({ isOpen, onClose }) {
  const [invitations, setInvitations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [department, setDepartment] = useState('HR');
  const [notes, setNotes] = useState('');
  const [copiedToken, setCopiedToken] = useState(null);
  const [latestInviteUrl, setLatestInviteUrl] = useState(null);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadInvitations();
    }
  }, [isOpen]);

  const loadInvitations = async () => {
    setLoading(true);
    try {
      const res = await api.getInvitations();
      if (res.success) {
        setInvitations(res.data);
      }
    } catch (err) {
      console.error('Failed to load champion invitations', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSendInvite = async (e) => {
    e.preventDefault();
    if (!email) return;

    setSending(true);
    try {
      const res = await api.createInvitation({
        email,
        department_assigned: department,
        notes,
        expires_days: 7,
      });

      if (res.success) {
        setLatestInviteUrl(res.invite_url);
        setEmail('');
        setNotes('');
        loadInvitations();
      }
    } catch (err) {
      console.error('Failed to generate invite', err);
    } finally {
      setSending(false);
    }
  };

  const handleCopy = (url, token) => {
    navigator.clipboard.writeText(url);
    setCopiedToken(token);
    setTimeout(() => setCopiedToken(null), 2500);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="w-full max-w-2xl bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-50 text-purple-700 border border-purple-200 rounded-xl flex items-center justify-center">
              <i className="fa-solid fa-users text-lg"></i>
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 tracking-tight">Department Champions Invitation Portal</h3>
              <p className="text-xs text-slate-500">Invite HR, IT, Finance & Operations leads to contribute department processing activities.</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <i className="fa-solid fa-xmark text-base"></i>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto space-y-6 pr-1">
          
          {/* Invite Form */}
          <form onSubmit={handleSendInvite} className="p-5 bg-slate-50 border border-slate-200 rounded-2xl space-y-4">
            <div className="text-xs font-bold text-slate-700 uppercase tracking-wider">Generate Tokenized Champion Link</div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Champion Work Email:</label>
                <input
                  type="email"
                  required
                  placeholder="e.g. hr.lead@company.ng"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Department Scope:</label>
                <select
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-emerald-600"
                >
                  <option value="HR">Human Resources (HR & Payroll)</option>
                  <option value="IT">Information Technology & Security</option>
                  <option value="Finance">Finance, Accounting & Treasury</option>
                  <option value="Operations">Operations & Customer Support</option>
                  <option value="Legal">Legal, Risk & Compliance</option>
                  <option value="Marketing">Marketing, Growth & Sales</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Assignment Note / Data Collection Instructions:</label>
              <input
                type="text"
                placeholder="e.g. Please log all employee onboarding biometric records and third-party payroll processors"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-emerald-600"
              />
            </div>

            <button
              type="submit"
              disabled={sending}
              className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-xs disabled:opacity-50"
            >
              <i className="fa-solid fa-paper-plane text-xs"></i>
              <span>{sending ? 'Generating Invitation...' : 'Generate 7-Day Champion Access Token'}</span>
            </button>
          </form>

          {/* Newly Generated URL Banner */}
          {latestInviteUrl && (
            <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-2xl flex items-center justify-between gap-3 animate-in fade-in">
              <div className="overflow-hidden">
                <div className="text-xs font-bold text-emerald-900 flex items-center gap-1.5 mb-1">
                  <i className="fa-solid fa-circle-check text-emerald-600"></i>
                  <span>Invitation Link Ready:</span>
                </div>
                <div className="text-[11px] font-mono text-slate-700 truncate max-w-md">{latestInviteUrl}</div>
              </div>
              <button
                type="button"
                onClick={() => handleCopy(latestInviteUrl, 'latest')}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1 flex-shrink-0"
              >
                <span>{copiedToken === 'latest' ? 'Copied!' : 'Copy Link'}</span>
              </button>
            </div>
          )}

          {/* Existing Invitations List */}
          <div className="space-y-3">
            <div className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center justify-between">
              <span>Active Department Invitations ({invitations.length})</span>
              <span className="text-[10px] text-slate-500 font-normal">7-day auto-expiry</span>
            </div>

            {loading ? (
              <div className="text-center py-6 text-slate-500 text-xs">Loading invitations...</div>
            ) : invitations.length === 0 ? (
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl text-center text-xs text-slate-500">
                No active department invitations. Generate a tokenized link above.
              </div>
            ) : (
              <div className="space-y-2">
                {invitations.map((inv) => (
                  <div key={inv.id} className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center font-bold text-xs text-purple-700 shadow-2xs">
                        {inv.department_assigned}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-900">{inv.email}</div>
                        <div className="text-[10px] text-slate-500 flex items-center gap-2 mt-0.5">
                          <span>Department: <strong className="text-slate-800">{inv.department_assigned}</strong></span>
                          <span>&bull;</span>
                          <span className={inv.status === 'accepted' ? 'text-emerald-700 font-semibold' : 'text-amber-700 font-semibold'}>
                            {inv.status === 'accepted' ? 'Accepted / Data Logged' : 'Pending Intake'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleCopy(`${window.location.origin}/portal/champion-intake?token=${inv.invitation_token}`, inv.id)}
                      className="p-2 bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 rounded-lg text-xs flex items-center gap-1.5 transition-colors"
                      title="Copy Invite URL"
                    >
                      <i className="fa-solid fa-copy text-xs text-slate-500"></i>
                      <span className="text-[10px] font-semibold">{copiedToken === inv.id ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* Footer */}
        <div className="border-t border-slate-200 pt-4 mt-6 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
}
