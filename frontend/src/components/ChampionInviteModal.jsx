import React, { useState, useEffect } from 'react';
import { api } from '../lib/api';

export default function ChampionInviteModal({ onNavigateBack }) {
  const [invitations, setInvitations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [department, setDepartment] = useState('HR');
  const [notes, setNotes] = useState('');
  const [copiedToken, setCopiedToken] = useState(null);
  const [latestInviteUrl, setLatestInviteUrl] = useState(null);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    loadInvitations();
  }, []);

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

  const acceptedCount = invitations.filter(i => i.status === 'accepted').length;
  const pendingCount = invitations.length - acceptedCount;

  return (
    <div className="space-y-6 animate-in fade-in max-w-7xl mx-auto">
      
      {/* Top Header & Navigation */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white border border-slate-200 p-6 rounded-3xl shadow-xs">
        <div className="flex items-center gap-3">
          {onNavigateBack && (
            <button
              onClick={onNavigateBack}
              className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
            >
              <i className="fa-solid fa-arrow-left text-xs"></i>
              <span>Back to Dashboard</span>
            </button>
          )}
          <div className="h-5 w-px bg-slate-200 hidden sm:block"></div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold bg-purple-50 text-purple-800 border border-purple-200 px-2.5 py-0.5 rounded-full font-mono flex items-center gap-1.5">
                <i className="fa-solid fa-users text-purple-600 text-[10px]"></i>
                <span>NDPA SECTION 24 INTAKE DESK</span>
              </span>
            </div>
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight mt-1">
              Department Champions Invitation & Intake Desk
            </h2>
            <p className="text-xs text-slate-500">
              Decentralize compliance data collection by issuing tokenized intake links to HR, IT, Finance, and Operations leads.
            </p>
          </div>
        </div>

        <button
          onClick={loadInvitations}
          className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-2xs"
        >
          <i className="fa-solid fa-arrows-rotate text-xs"></i>
          <span>Refresh Links</span>
        </button>
      </div>

      {/* 3 Metrics Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-slate-500 font-bold uppercase">Total Issued Tokens</span>
            <i className="fa-solid fa-link text-purple-500"></i>
          </div>
          <div className="text-2xl font-extrabold font-mono text-slate-900 mt-1">
            {invitations.length}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Department Access Keys</div>
        </div>

        <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-slate-500 font-bold uppercase">Accepted & Logged</span>
            <i className="fa-solid fa-circle-check text-emerald-600"></i>
          </div>
          <div className="text-2xl font-extrabold font-mono text-emerald-700 mt-1">
            {acceptedCount}
          </div>
          <div className="text-[11px] text-emerald-700 font-semibold mt-1">RoPA Activities Ingested</div>
        </div>

        <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-slate-500 font-bold uppercase">Pending Department Intake</span>
            <i className="fa-solid fa-hourglass-half text-amber-500"></i>
          </div>
          <div className="text-2xl font-extrabold font-mono text-amber-700 mt-1">
            {pendingCount}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">7-Day Expiry Window</div>
        </div>
      </div>

      {/* Main 2-Column Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT COLUMN: Generate Tokenized Invitation (5 Columns) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <i className="fa-solid fa-paper-plane text-purple-600"></i>
                <span>Generate Tokenized Champion Link</span>
              </h3>
              <span className="text-[10px] text-purple-700 uppercase font-bold font-mono">7-Day Expiry</span>
            </div>

            <form onSubmit={handleSendInvite} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Champion Work Email</label>
                <input
                  type="email"
                  required
                  placeholder="e.g. hr.lead@company.ng"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-900 font-semibold focus:outline-none focus:border-emerald-600 focus:bg-white transition-colors"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Department Scope</label>
                <select
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-900 font-bold focus:outline-none focus:border-emerald-600 focus:bg-white transition-colors"
                >
                  <option value="HR">Human Resources (HR & Payroll Processing)</option>
                  <option value="IT">Information Technology & Cloud Infrastructure</option>
                  <option value="Finance">Finance, Accounting & Treasury</option>
                  <option value="Operations">Operations & Business Support</option>
                  <option value="Legal">Legal, Risk & Regulatory Compliance</option>
                  <option value="Marketing">Marketing, Lead Gen & Analytics</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Assignment Note & Guidance</label>
                <textarea
                  rows={3}
                  placeholder="e.g. Please document all employee onboarding biometric records, third-party payroll processors, and CCTV logs for our annual NDPA RoPA inventory."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-900 focus:outline-none focus:border-emerald-600 focus:bg-white transition-colors"
                ></textarea>
              </div>

              <div className="p-3 bg-purple-50/70 border border-purple-200 rounded-xl text-[11px] text-purple-900">
                <i className="fa-solid fa-lock mr-1 text-purple-600"></i>
                Tokenized links bypass password creation and grant temporary scoped access strictly to their department's data intake form.
              </div>

              <button
                type="submit"
                disabled={sending}
                className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-md transition-all disabled:opacity-50"
              >
                <i className="fa-solid fa-key text-xs"></i>
                <span>{sending ? 'Generating Access Token...' : 'Generate 7-Day Access Link'}</span>
              </button>
            </form>
          </div>

          {/* Newly Generated URL Banner */}
          {latestInviteUrl && (
            <div className="p-5 bg-emerald-50 border border-emerald-300 rounded-3xl space-y-2 animate-in fade-in shadow-xs">
              <div className="flex items-center justify-between">
                <div className="text-xs font-bold text-emerald-950 flex items-center gap-1.5">
                  <i className="fa-solid fa-circle-check text-emerald-600"></i>
                  <span>Invitation Link Generated:</span>
                </div>
                <div className="flex items-center gap-2">
                  <a
                    href={latestInviteUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-1 bg-white hover:bg-slate-100 border border-emerald-300 text-emerald-900 rounded-lg text-xs font-bold flex items-center gap-1 shadow-2xs"
                  >
                    <i className="fa-solid fa-arrow-up-right-from-square text-xs text-emerald-700"></i>
                    <span>Open Form</span>
                  </a>
                  <button
                    type="button"
                    onClick={() => handleCopy(latestInviteUrl, 'latest')}
                    className="px-3 py-1 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <i className="fa-solid fa-copy text-xs"></i>
                    <span>{copiedToken === 'latest' ? 'Copied!' : 'Copy Link'}</span>
                  </button>
                </div>
              </div>
              <div className="p-2.5 bg-white border border-emerald-200 rounded-xl text-[11px] font-mono text-slate-800 break-all select-all">
                {latestInviteUrl}
              </div>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: Active Department Invitations List (7 Columns) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <i className="fa-solid fa-list-check text-emerald-600"></i>
                <span>Active Department Intake Invitations</span>
              </h3>
              <span className="text-xs font-mono font-bold text-slate-500">
                {invitations.length} Total
              </span>
            </div>

            {loading ? (
              <div className="py-12 text-center text-slate-500 text-xs">
                <i className="fa-solid fa-circle-notch fa-spin text-lg text-emerald-600 mb-2"></i>
                <p>Loading active invitations...</p>
              </div>
            ) : invitations.length === 0 ? (
              <div className="py-12 text-center text-slate-500 text-xs bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                <i className="fa-solid fa-paper-plane text-2xl text-slate-300 mb-2"></i>
                <p className="font-bold text-slate-800">No active invitations</p>
                <p className="text-slate-500 mt-0.5">Use the form on the left to generate your first department token.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {invitations.map((inv) => (
                  <div key={inv.id} className="p-4 bg-slate-50 hover:bg-slate-100/80 border border-slate-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors">
                    <div className="flex items-start sm:items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-900 flex items-center justify-center font-bold text-xs flex-shrink-0 shadow-2xs">
                        {inv.department_assigned}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-900">{inv.email}</div>
                        <div className="text-[11px] text-slate-500 flex flex-wrap items-center gap-2 mt-0.5">
                          <span>Dept: <strong className="text-slate-800">{inv.department_assigned}</strong></span>
                          <span>&bull;</span>
                          <span className={`inline-flex items-center gap-1 font-bold ${
                            inv.status === 'accepted' ? 'text-emerald-700' : 'text-amber-700'
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${inv.status === 'accepted' ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
                            {inv.status === 'accepted' ? 'Accepted / Data Logged' : 'Pending Intake'}
                          </span>
                        </div>
                        {inv.notes && (
                          <div className="text-[10px] text-slate-600 mt-1 italic line-clamp-1">
                            "{inv.notes}"
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center">
                      <a
                        href={`${window.location.origin}/portal/champion-intake?token=${inv.invitation_token}`}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-2xs transition-colors"
                        title="Open Intake Form in New Tab"
                      >
                        <i className="fa-solid fa-arrow-up-right-from-square text-xs text-slate-500"></i>
                        <span>Open Form</span>
                      </a>
                      <button
                        type="button"
                        onClick={() => handleCopy(`${window.location.origin}/portal/champion-intake?token=${inv.invitation_token}`, inv.id)}
                        className="px-3 py-1.5 bg-white hover:bg-slate-200 border border-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
                        title="Copy Invite URL"
                      >
                        <i className="fa-solid fa-copy text-xs text-purple-600"></i>
                        <span>{copiedToken === inv.id ? 'Copied Link!' : 'Copy Link'}</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
