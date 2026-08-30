import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  FileText, 
  Send, 
  Search,
  ExternalLink,
  Shield
} from 'lucide-react';
import { api } from '../lib/api';

export default function DsarDesk({ onOpenPublicPortal, onRefreshMetrics }) {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDsar, setSelectedDsar] = useState(null);
  const [notification, setNotification] = useState(null);
  const [responseNotes, setResponseNotes] = useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await api.getDsars();
      if (res.success) {
        setRequests(res.data);
      }
    } catch (err) {
      console.error('Error loading DSARs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleUpdateStatus = async (id, status) => {
    try {
      const res = await api.updateDsarStatus(id, {
        status,
        response_summary: responseNotes || 'Request investigated and response delivered to data subject.',
        id_verified: true,
      });
      if (res.success) {
        setNotification({ type: 'success', message: 'DSAR request status updated.' });
        loadData();
        if (selectedDsar?.id === id) setSelectedDsar(null);
        if (onRefreshMetrics) onRefreshMetrics();
      }
    } catch (err) {
      setNotification({ type: 'error', message: err.message });
    }
  };

  const getSlaBadge = (daysRemaining, status) => {
    if (status === 'completed') {
      return <span className="text-[11px] bg-emerald-950 text-brand-400 border border-emerald-800 px-2.5 py-0.5 rounded-full font-bold">✓ Resolved within SLA</span>;
    }
    if (status === 'rejected') {
      return <span className="text-[11px] bg-slate-800 text-slate-400 border border-slate-700 px-2.5 py-0.5 rounded-full font-bold">Rejected</span>;
    }
    if (daysRemaining <= 7) {
      return (
        <span className="text-[11px] bg-red-950 text-red-400 border border-red-800 px-2.5 py-0.5 rounded-full font-bold font-mono animate-pulse flex items-center gap-1">
          <Clock className="w-3 h-3" />
          <span>{daysRemaining} Days Left (Urgent SLA)</span>
        </span>
      );
    }
    if (daysRemaining <= 15) {
      return (
        <span className="text-[11px] bg-amber-950 text-amber-400 border border-amber-800 px-2.5 py-0.5 rounded-full font-bold font-mono flex items-center gap-1">
          <Clock className="w-3 h-3" />
          <span>{daysRemaining} Days Remaining</span>
        </span>
      );
    }
    return (
      <span className="text-[11px] bg-emerald-950 text-brand-400 border border-emerald-800 px-2.5 py-0.5 rounded-full font-bold font-mono flex items-center gap-1">
        <Clock className="w-3 h-3" />
        <span>{daysRemaining} Days on 30d Clock</span>
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Toast */}
      {notification && (
        <div className={`p-4 rounded-2xl flex items-center justify-between text-xs font-semibold ${
          notification.type === 'success' ? 'bg-brand-950/90 text-brand-300 border border-brand-800' : 'bg-red-950/90 text-red-300 border border-red-800'
        }`}>
          <span>{notification.message}</span>
          <button onClick={() => setNotification(null)} className="text-slate-400 hover:text-white">&times;</button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-white tracking-tight">Data Subject Access Request (DSAR) Pipeline</h2>
            <span className="text-[11px] bg-indigo-950 text-indigo-400 border border-indigo-800 px-2 py-0.5 rounded font-mono font-bold">
              NDPA SEC 34 (30-DAY SLA)
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Process statutory requests for access, rectification, erasure, and data portability within 30 calendar days.
          </p>
        </div>

        <button
          onClick={onOpenPublicPortal}
          className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg shadow-indigo-950/50 transition-all"
        >
          <ExternalLink className="w-4 h-4" />
          <span>Launch Hosted Public DSAR Portal</span>
        </button>
      </div>

      {/* Requests List */}
      <div className="space-y-3">
        {loading ? (
          <div className="glass-panel p-12 text-center text-slate-400">Loading DSAR requests...</div>
        ) : requests.length === 0 ? (
          <div className="glass-panel p-12 text-center rounded-3xl">
            <Users className="w-10 h-10 text-slate-600 mx-auto mb-2" />
            <h3 className="text-base font-bold text-slate-200">No Active Data Subject Requests</h3>
            <p className="text-xs text-slate-400 mt-1">Data subjects can submit requests through your hosted public DSAR portal.</p>
          </div>
        ) : (
          requests.map((dsar) => (
            <div 
              key={dsar.id}
              onClick={() => {
                setSelectedDsar(dsar);
                setResponseNotes(dsar.response_summary || '');
              }}
              className="glass-panel p-5 rounded-3xl hover:border-indigo-500/40 hover:bg-slate-850/70 transition-all cursor-pointer flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-white bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
                    {dsar.ticket_number}
                  </span>
                  <span className="text-[10px] uppercase font-mono bg-indigo-950 text-indigo-300 border border-indigo-800 px-2 py-0.5 rounded">
                    {dsar.request_type?.replace(/_/g, ' ')}
                  </span>
                  <span className="text-xs text-slate-400">({dsar.subject_relationship})</span>
                </div>
                <h4 className="text-sm font-bold text-slate-100">{dsar.data_subject_name} ({dsar.data_subject_email})</h4>
                <p className="text-xs text-slate-300 line-clamp-1">{dsar.request_details}</p>
              </div>

              <div className="flex flex-col md:items-end gap-2 flex-shrink-0">
                {getSlaBadge(dsar.days_remaining, dsar.status)}
                <div className="text-[11px] text-slate-400">
                  Status: <strong className="text-slate-200 capitalize">{dsar.status?.replace(/_/g, ' ')}</strong>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* DSAR Detail & Action Modal */}
      {selectedDsar && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-xl w-full p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
              <div>
                <span className="text-[10px] font-mono bg-indigo-950 text-indigo-400 px-2 py-0.5 rounded border border-indigo-800">
                  {selectedDsar.ticket_number}
                </span>
                <h3 className="text-base font-bold text-white mt-1">Process Data Subject Request</h3>
              </div>
              <button onClick={() => setSelectedDsar(null)} className="text-slate-400 hover:text-white">&times;</button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-slate-950/80 rounded-2xl border border-slate-800 space-y-1.5">
                <div><strong>Subject:</strong> {selectedDsar.data_subject_name} ({selectedDsar.data_subject_email})</div>
                <div><strong>Phone:</strong> {selectedDsar.data_subject_phone || 'N/A'}</div>
                <div><strong>Type:</strong> <span className="uppercase font-mono text-indigo-400">{selectedDsar.request_type}</span></div>
                <div><strong>Details:</strong> <span className="text-slate-300">{selectedDsar.request_details}</span></div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">DPO Response & Action Dispatch Summary:</label>
                <textarea
                  rows="3"
                  value={responseNotes}
                  onChange={(e) => setResponseNotes(e.target.value)}
                  placeholder="Record verification actions taken, requested data files dispatched, or reasons for rejection..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => handleUpdateStatus(selectedDsar.id, 'rejected')}
                  className="px-3.5 py-2 bg-red-950 hover:bg-red-900 border border-red-800 text-red-300 rounded-xl text-xs font-semibold"
                >
                  Reject Request (Valid Grounds)
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleUpdateStatus(selectedDsar.id, 'investigating')}
                    className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold"
                  >
                    Mark Investigating
                  </button>
                  <button
                    type="button"
                    onClick={() => handleUpdateStatus(selectedDsar.id, 'completed')}
                    className="px-4 py-2 bg-brand-600 hover:bg-brand-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-brand-950"
                  >
                    Complete & Dispatch
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
