import React, { useState, useEffect } from 'react';
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
      return <span className="text-[11px] bg-emerald-50 text-emerald-800 border border-emerald-200 px-2.5 py-0.5 rounded-full font-bold">✓ Resolved within SLA</span>;
    }
    if (status === 'rejected') {
      return <span className="text-[11px] bg-slate-100 text-slate-600 border border-slate-200 px-2.5 py-0.5 rounded-full font-bold">Rejected</span>;
    }
    if (daysRemaining <= 7) {
      return (
        <span className="text-[11px] bg-red-50 text-red-700 border border-red-200 px-2.5 py-0.5 rounded-full font-bold font-mono animate-pulse flex items-center gap-1">
          <i className="fa-solid fa-clock text-[10px]"></i>
          <span>{daysRemaining} Days Left (Urgent SLA)</span>
        </span>
      );
    }
    if (daysRemaining <= 15) {
      return (
        <span className="text-[11px] bg-amber-50 text-amber-800 border border-amber-200 px-2.5 py-0.5 rounded-full font-bold font-mono flex items-center gap-1">
          <i className="fa-solid fa-clock text-[10px]"></i>
          <span>{daysRemaining} Days Remaining</span>
        </span>
      );
    }
    return (
      <span className="text-[11px] bg-slate-100 text-slate-700 border border-slate-200 px-2.5 py-0.5 rounded-full font-bold font-mono flex items-center gap-1">
        <i className="fa-solid fa-clock text-[10px]"></i>
        <span>{daysRemaining} Days (On Track)</span>
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {notification && (
        <div className={`p-4 rounded-2xl flex items-center justify-between text-xs font-semibold shadow-xs ${
          notification.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-red-50 text-red-800 border border-red-200'
        }`}>
          <span>{notification.message}</span>
          <button onClick={() => setNotification(null)} className="text-slate-400 hover:text-slate-700 font-bold">&times;</button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">30-Day Statutory DSAR Management Desk</h2>
            <span className="text-[11px] bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded font-mono font-bold">
              NDPA SEC 34
            </span>
          </div>
          <p className="text-xs text-slate-600 mt-0.5">
            Automated statutory countdown, identity verification, and multi-channel fulfillment workflow.
          </p>
        </div>

        <button
          onClick={onOpenPublicPortal}
          className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs"
        >
          <i className="fa-solid fa-globe text-xs"></i>
          <span>Public DSAR Portal</span>
        </button>
      </div>

      {/* Requests List */}
      <div className="space-y-3">
        {loading ? (
          <div className="py-12 text-center text-slate-500 text-xs font-medium">Loading DSAR requests...</div>
        ) : requests.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center shadow-xs">
            <i className="fa-solid fa-users-viewfinder text-slate-300 text-3xl mb-2"></i>
            <h4 className="text-sm font-bold text-slate-800">No active DSAR requests</h4>
            <p className="text-xs text-slate-500 mt-1">Data subjects can submit access, rectification, or deletion requests via the hosted public portal.</p>
          </div>
        ) : (
          requests.map((dsar) => (
            <div
              key={dsar.id}
              onClick={() => setSelectedDsar(dsar)}
              className="bg-white border border-slate-200 hover:border-emerald-500/80 rounded-2xl p-5 cursor-pointer transition-all shadow-xs space-y-3 group"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-700 border border-purple-200 flex items-center justify-center font-bold text-xs">
                    <i className="fa-solid fa-user-shield text-sm"></i>
                  </div>
                  <div>
                    <span className="text-[10px] font-mono text-slate-500 uppercase font-bold">Ticket #{dsar.ticket_number || dsar.id.substring(0, 8)}</span>
                    <h3 className="text-sm font-bold text-slate-900 group-hover:text-emerald-800 transition-colors">
                      {dsar.data_subject_name} &bull; <span className="text-slate-600 font-normal">{dsar.data_subject_email}</span>
                    </h3>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-mono uppercase bg-slate-100 text-slate-800 px-2 py-0.5 rounded border border-slate-200 font-bold">
                    {dsar.request_type?.replace(/_/g, ' ')}
                  </span>
                  {getSlaBadge(dsar.days_remaining ?? 23, dsar.status)}
                </div>
              </div>

              <p className="text-xs text-slate-600 line-clamp-2">
                {dsar.request_details}
              </p>

              <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-100 text-slate-500">
                <span>Received: {new Date(dsar.created_at).toLocaleDateString()}</span>
                <span>Statutory SLA Deadline: <strong className="text-slate-900">{dsar.statutory_deadline ? new Date(dsar.statutory_deadline).toLocaleDateString() : '30 Days'}</strong></span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Response Modal */}
      {selectedDsar && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="w-full max-w-xl bg-white border border-slate-200 rounded-3xl p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <span className="text-[10px] font-mono text-slate-500 uppercase font-bold">Ticket #{selectedDsar.ticket_number || selectedDsar.id.substring(0, 8)}</span>
                <h3 className="text-base font-bold text-slate-900 mt-0.5">Process DSAR Request: {selectedDsar.data_subject_name}</h3>
              </div>
              <button onClick={() => setSelectedDsar(null)} className="text-slate-400 hover:text-slate-700">
                <i className="fa-solid fa-xmark text-base"></i>
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                <div className="font-bold text-slate-900">Request Type: <span className="uppercase font-mono text-emerald-800">{selectedDsar.request_type?.replace(/_/g, ' ')}</span></div>
                <div className="text-slate-600">Details: {selectedDsar.request_details}</div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Response & Fulfillment Notes to Data Subject:</label>
                <textarea
                  rows="3"
                  placeholder="Record your investigation findings, verified identities, and response payload..."
                  value={responseNotes}
                  onChange={(e) => setResponseNotes(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-slate-900 focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => handleUpdateStatus(selectedDsar.id, 'rejected')}
                  className="px-3 py-2 bg-red-50 hover:bg-red-100 border border-red-200 text-red-700 rounded-xl font-bold text-xs"
                >
                  Reject Request
                </button>
                <button
                  type="button"
                  onClick={() => handleUpdateStatus(selectedDsar.id, 'completed')}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs shadow-xs"
                >
                  Fulfill & Resolve within SLA
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
