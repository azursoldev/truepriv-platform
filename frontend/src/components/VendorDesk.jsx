import React, { useState, useEffect } from 'react';
import { api } from '../lib/api';

export default function VendorDesk({ onRefreshMetrics }) {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [notification, setNotification] = useState(null);

  const [formData, setFormData] = useState({
    vendor_name: '',
    service_category: 'Cloud Hosting',
    contact_person: '',
    contact_email: '',
    data_types_processed: 'Customer BVN, KYC Selfies, Transaction Logs',
    dpa_signed: true,
    dpa_signed_date: new Date().toISOString().slice(0, 10),
    risk_rating: 'low',
    hosting_country: 'Ireland',
    is_cross_border: true,
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await api.getVendors();
      if (res.success) {
        setVendors(res.data);
      }
    } catch (err) {
      console.error('Error loading vendors:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        data_types_processed: formData.data_types_processed.split(',').map(s => s.trim()),
      };

      const res = await api.createVendor(payload);
      if (res.success) {
        setNotification({ type: 'success', message: 'Vendor processor registered.' });
        setShowCreateModal(false);
        loadData();
        if (onRefreshMetrics) onRefreshMetrics();
      }
    } catch (err) {
      setNotification({ type: 'error', message: err.message });
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to remove this vendor?')) return;
    try {
      const res = await api.deleteVendor(id);
      if (res.success) {
        setNotification({ type: 'success', message: 'Vendor removed.' });
        loadData();
        if (onRefreshMetrics) onRefreshMetrics();
      }
    } catch (err) {
      setNotification({ type: 'error', message: err.message });
    }
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
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Third-Party Data Processors & TPRM Risk</h2>
            <span className="text-[11px] bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded font-mono font-bold">
              NDPA SEC 29
            </span>
          </div>
          <p className="text-xs text-slate-600 mt-0.5">
            Maintain inventory of external vendors, signed DPAs, cross-border safeguards, and security ratings.
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs"
        >
          <i className="fa-solid fa-plus text-xs"></i>
          <span>Add Processor</span>
        </button>
      </div>

      {/* Vendor Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {loading ? (
          <div className="col-span-3 py-12 text-center text-slate-500 text-xs font-medium">Loading processors...</div>
        ) : vendors.length === 0 ? (
          <div className="col-span-3 bg-white border border-slate-200 rounded-3xl p-12 text-center shadow-xs">
            <i className="fa-solid fa-handshake-simple text-slate-300 text-3xl mb-2"></i>
            <h4 className="text-sm font-bold text-slate-800">No third-party processors recorded</h4>
            <p className="text-xs text-slate-500 mt-1">Record cloud providers, SMS gateways, and SaaS vendors processing personal data.</p>
          </div>
        ) : (
          vendors.map((v) => (
            <div
              key={v.id}
              className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-2.5">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-mono text-slate-500 uppercase font-bold">{v.service_category}</span>
                    <h3 className="text-base font-bold text-slate-900 mt-0.5">{v.vendor_name}</h3>
                  </div>
                  <span className={`text-[11px] font-mono uppercase px-2 py-0.5 rounded-full font-bold ${
                    v.risk_rating === 'high' ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  }`}>
                    {v.risk_rating} Risk
                  </span>
                </div>

                <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs space-y-1">
                  <div className="text-slate-600"><strong>Data Handled:</strong> {v.data_types_processed?.join(', ')}</div>
                  <div className="text-slate-600 flex items-center gap-1 mt-1">
                    <i className="fa-solid fa-globe text-slate-400"></i>
                    <span>Hosting Location: <strong className="text-slate-900">{v.hosting_country || 'Nigeria'}</strong></span>
                  </div>
                </div>

                {/* DPA Status */}
                <div className="p-2.5 rounded-xl border flex items-center justify-between text-xs font-semibold bg-emerald-50 text-emerald-900 border-emerald-200">
                  <span className="flex items-center gap-1.5">
                    <i className="fa-solid fa-file-contract text-emerald-600"></i>
                    <span>Executed DPA on File</span>
                  </span>
                  <span className="text-[10px] font-mono font-bold">✓ Signed</span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span className="truncate">{v.contact_email || 'vendor@support.com'}</span>
                <button
                  onClick={() => handleDelete(v.id)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                >
                  <i className="fa-solid fa-trash-can text-xs"></i>
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Vendor Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-lg bg-white border border-slate-200 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="text-base font-bold text-slate-900">Add Third-Party Data Processor</h3>
              <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-slate-700">
                <i className="fa-solid fa-xmark text-base"></i>
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Processor / Vendor Name:</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. AWS Cloud EMEA or Twilio SMS"
                  value={formData.vendor_name}
                  onChange={(e) => setFormData({ ...formData, vendor_name: e.target.value })}
                  className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-slate-900 focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Service Category:</label>
                  <input
                    type="text"
                    value={formData.service_category}
                    onChange={(e) => setFormData({ ...formData, service_category: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Hosting Country:</label>
                  <input
                    type="text"
                    value={formData.hosting_country}
                    onChange={(e) => setFormData({ ...formData, hosting_country: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-slate-900"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-xl text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow-xs"
                >
                  Register Processor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
