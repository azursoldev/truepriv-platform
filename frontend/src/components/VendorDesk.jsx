import React, { useState, useEffect } from 'react';
import { 
  Truck, 
  CheckCircle2, 
  AlertCircle, 
  Plus, 
  Globe, 
  ShieldCheck, 
  FileText,
  Trash2
} from 'lucide-react';
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
    if (!confirm('Are you sure you want to delete this vendor record?')) return;
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
            <h2 className="text-xl font-bold text-white tracking-tight">Third-Party Processors & Vendor Risk (TPRM)</h2>
            <span className="text-[11px] bg-purple-950 text-purple-400 border border-purple-800 px-2 py-0.5 rounded font-mono font-bold">
              NDPA SEC 29 (DPA OBLIGATION)
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Monitor sub-processors, track binding Data Processing Agreements (DPAs), and evaluate cross-border transfer safeguards.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-[11px] bg-slate-800/80 text-slate-300 border border-slate-700 px-2.5 py-1 rounded-lg font-mono font-semibold">
            Capacity: <strong className={vendors.length >= 3 ? "text-amber-400 font-bold" : "text-brand-400"}>{vendors.length}</strong> / 3 (Starter Quota)
          </span>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg shadow-purple-950/50 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Register Processor</span>
          </button>
        </div>
      </div>

      {/* Vendors Table */}
      <div className="glass-panel rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/90 border-b border-slate-800 text-slate-400 uppercase tracking-wider font-semibold">
              <tr>
                <th className="py-3 px-4">Vendor & Category</th>
                <th className="py-3 px-4">Data Types Processed</th>
                <th className="py-3 px-4">DPA Status (NDPA Sec 29)</th>
                <th className="py-3 px-4">Hosting & Cross-Border</th>
                <th className="py-3 px-4">Risk Rating</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {loading ? (
                <tr>
                  <td colSpan="6" className="py-8 text-center text-slate-400">Loading vendor records...</td>
                </tr>
              ) : vendors.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-slate-400">No third-party processors registered.</td>
                </tr>
              ) : (
                vendors.map((v) => (
                  <tr key={v.id} className="hover:bg-slate-850/60 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-white">{v.vendor_name}</div>
                      <div className="text-[11px] text-slate-400">{v.service_category}</div>
                      <div className="text-[10px] text-slate-500">{v.contact_email}</div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="flex flex-wrap gap-1 max-w-xs">
                        {v.data_types_processed?.map((dt, i) => (
                          <span key={i} className="text-[10px] bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded border border-slate-700">
                            {dt}
                          </span>
                        ))}
                      </div>
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {v.dpa_signed ? (
                        <span className="text-[11px] bg-emerald-950 text-brand-400 border border-emerald-800 px-2 py-0.5 rounded-full font-semibold flex items-center gap-1 w-max">
                          ✓ DPA Executed ({v.dpa_signed_date})
                        </span>
                      ) : (
                        <span className="text-[11px] bg-red-950 text-red-400 border border-red-800 px-2 py-0.5 rounded-full font-bold animate-pulse flex items-center gap-1 w-max">
                          ⚠️ Missing Signed DPA
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="text-slate-200">{v.hosting_country}</div>
                      {v.is_cross_border && (
                        <span className="text-[10px] text-amber-400 flex items-center gap-1 mt-0.5">
                          <Globe className="w-3 h-3" />
                          <span>Cross-border transfer</span>
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full uppercase ${
                        v.risk_rating === 'critical' || v.risk_rating === 'high' 
                          ? 'bg-red-950 text-red-400 border border-red-800' 
                          : 'bg-emerald-950 text-brand-400 border border-emerald-800'
                      }`}>
                        {v.risk_rating}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <button
                        onClick={() => handleDelete(v.id)}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-red-950 text-slate-400 hover:text-red-400"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-white">Register Third-Party Processor</h3>
              <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-white">&times;</button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Vendor / Entity Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. AWS Europe / Interswitch"
                  value={formData.vendor_name}
                  onChange={(e) => setFormData({ ...formData, vendor_name: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:border-purple-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Service Category *</label>
                  <input
                    type="text"
                    required
                    value={formData.service_category}
                    onChange={(e) => setFormData({ ...formData, service_category: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:border-purple-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Risk Rating *</label>
                  <select
                    value={formData.risk_rating}
                    onChange={(e) => setFormData({ ...formData, risk_rating: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:border-purple-500 focus:outline-none"
                  >
                    <option value="low">Low Risk</option>
                    <option value="medium">Medium Risk</option>
                    <option value="high">High Risk</option>
                    <option value="critical">Critical Risk</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Personal Data Elements Processed *</label>
                <input
                  type="text"
                  required
                  value={formData.data_types_processed}
                  onChange={(e) => setFormData({ ...formData, data_types_processed: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:border-purple-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-6 pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.dpa_signed}
                    onChange={(e) => setFormData({ ...formData, dpa_signed: e.target.checked })}
                  />
                  <span className="text-slate-300 font-medium">NDPA-Compliant DPA Executed</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.is_cross_border}
                    onChange={(e) => setFormData({ ...formData, is_cross_border: e.target.checked })}
                  />
                  <span className="text-slate-300 font-medium">Cross-Border Transfer</span>
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold"
                >
                  Register Vendor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
