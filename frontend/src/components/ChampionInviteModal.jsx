import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Send, 
  Copy, 
  Check, 
  Clock, 
  ShieldCheck, 
  X, 
  Building, 
  UserCheck 
} from 'lucide-react';
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
      <div className="w-full max-w-2xl glass-panel bg-slate-900 border border-slate-700 rounded-3xl p-6 sm:p-8 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-brand-950 text-brand-400 border border-brand-800/80 rounded-xl">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white tracking-tight">Department Champions Invitation Portal</h3>
              <p className="text-xs text-slate-400">Invite HR, IT, Finance & Operations leads to contribute department processing activities.</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto space-y-6 pr-1">
          
          {/* Invite Form */}
          <form onSubmit={handleSendInvite} className="p-5 bg-slate-950/70 border border-slate-800 rounded-2xl space-y-4">
            <div className="text-xs font-bold text-brand-400 uppercase tracking-wider">Generate Tokenized Champion Link</div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Champion Work Email:</label>
                <input
                  type="email"
                  required
                  placeholder="e.g. hr.lead@company.ng"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Department Scope:</label>
                <select
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-brand-500"
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
              <label className="block text-xs font-semibold text-slate-300 mb-1">Assignment Note / Data Collection Instructions:</label>
              <input
                type="text"
                placeholder="e.g. Please log all employee onboarding biometric records and third-party payroll processors"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-brand-500"
              />
            </div>

            <button
              type="submit"
              disabled={sending}
              className="w-full py-2.5 bg-brand-600 hover:bg-brand-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-brand-900/30 disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              {sending ? 'Generating Invitation...' : 'Generate 7-Day Champion Access Token'}
            </button>
          </form>

          {/* Newly Generated URL Banner */}
          {latestInviteUrl && (
            <div className="p-4 bg-emerald-950/60 border border-emerald-500/50 rounded-2xl flex items-center justify-between gap-3 animate-in fade-in">
              <div className="overflow-hidden">
                <div className="text-xs font-bold text-emerald-300 flex items-center gap-1.5 mb-1">
                  <Check className="w-4 h-4" /> Invitation Link Ready:
                </div>
                <div className="text-[11px] font-mono text-slate-300 truncate max-w-md">{latestInviteUrl}</div>
              </div>
              <button
                type="button"
                onClick={() => handleCopy(latestInviteUrl, 'latest')}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-1 flex-shrink-0"
              >
                {copiedToken === 'latest' ? 'Copied!' : 'Copy Link'}
              </button>
            </div>
          )}

          {/* Existing Invitations List */}
          <div className="space-y-3">
            <div className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center justify-between">
              <span>Active Department Invitations ({invitations.length})</span>
              <span className="text-[10px] text-slate-400 font-normal">7-day auto-expiry</span>
            </div>

            {loading ? (
              <div className="text-center py-6 text-slate-400 text-xs">Loading invitations...</div>
            ) : invitations.length === 0 ? (
              <div className="p-4 bg-slate-950/40 border border-slate-800 rounded-2xl text-center text-xs text-slate-400">
                No active department invitations. Generate a tokenized link above.
              </div>
            ) : (
              <div className="space-y-2">
                {invitations.map((inv) => (
                  <div key={inv.id} className="p-3.5 bg-slate-950/70 border border-slate-800 rounded-xl flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-700 flex items-center justify-center font-bold text-xs text-brand-400">
                        {inv.department_assigned}
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-white">{inv.email}</div>
                        <div className="text-[10px] text-slate-400 flex items-center gap-2 mt-0.5">
                          <span>Department: <strong className="text-slate-200">{inv.department_assigned}</strong></span>
                          <span>&bull;</span>
                          <span className={inv.status === 'accepted' ? 'text-emerald-400' : 'text-amber-400'}>
                            {inv.status === 'accepted' ? 'Accepted / Data Logged' : 'Pending Intake'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleCopy(`${window.location.origin}/portal/champion-intake?token=${inv.invitation_token}`, inv.id)}
                      className="p-2 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white rounded-lg text-xs flex items-center gap-1.5 transition-colors"
                      title="Copy Invite URL"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      <span className="text-[10px]">{copiedToken === inv.id ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* Footer */}
        <div className="border-t border-slate-800 pt-4 mt-6 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
}
