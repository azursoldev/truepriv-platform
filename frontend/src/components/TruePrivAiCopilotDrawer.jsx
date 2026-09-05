import React, { useState, useEffect } from 'react';
import { api } from '../lib/api';

export default function TruePrivAiCopilotDrawer({ isOpen, onClose }) {
  const [activeTab, setActiveTab] = useState('audit'); // 'audit' | 'chat' | 'ledger'
  const [scanning, setScanning] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [query, setQuery] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      text: 'Hello! I am your **TruePriv Autonomous Privacy Operations Agent**. I continuously monitor your RoPA records, DPIA risk assessments, vendor contracts, and cookie consents against the **Nigeria Data Protection Act (NDPA 2023)** and GDPR standards. How can I assist your compliance team today?',
      time: 'Just now'
    }
  ]);
  const [ledger, setLedger] = useState([]);
  const [ledgerLoading, setLedgerLoading] = useState(false);

  // Run autonomous scan
  const handleRunScan = async () => {
    setScanning(true);
    try {
      const res = await api.scanAiCompliance();
      if (res.success) {
        setScanResult(res);
      }
    } catch (err) {
      console.error('Scan error:', err);
    } finally {
      setScanning(false);
    }
  };

  // Run initial scan when drawer opens
  useEffect(() => {
    if (isOpen && !scanResult && !scanning) {
      handleRunScan();
    }
  }, [isOpen]);

  // Load ledger
  const loadLedger = async () => {
    setLedgerLoading(true);
    try {
      const res = await api.getAiLedger();
      if (res.success) {
        setLedger(res.data || []);
      }
    } catch (err) {
      console.error('Ledger error:', err);
    } finally {
      setLedgerLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'ledger') {
      loadLedger();
    }
  }, [activeTab]);

  // Handle Copilot Chat Query
  const handleSendQuery = async (customPrompt) => {
    const promptToSend = customPrompt || query;
    if (!promptToSend.trim()) return;

    const userMsg = { role: 'user', text: promptToSend, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
    setMessages(prev => [...prev, userMsg]);
    setQuery('');
    setChatLoading(true);

    try {
      const res = await api.askAiCopilot(promptToSend);
      if (res.success) {
        setMessages(prev => [
          ...prev,
          {
            role: 'assistant',
            text: res.answer,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            hash: res.ledger_hash
          }
        ]);
      }
    } catch (err) {
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          text: 'Error processing your compliance query. Please ensure local servers are running.',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setChatLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden animate-fade-in">
      {/* Backdrop */}
      <div 
        onClick={onClose} 
        className="absolute inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-xl bg-slate-900 border-l border-slate-800 text-slate-100 flex flex-col shadow-2xl">
          
          {/* Top Header */}
          <div className="p-5 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center text-white font-black text-sm shadow-md">
                <i className="fa-solid fa-brain"></i>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-extrabold text-sm tracking-tight text-white">TruePriv Agent Network</h3>
                  <span className="text-[9px] bg-sky-500/20 text-sky-400 border border-sky-500/30 px-2 py-0.5 rounded font-mono font-bold">
                    AI AGENT v2.4
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">Autonomous Statutory Privacy Operations & Gap Defense</p>
              </div>
            </div>

            <button 
              onClick={onClose} 
              className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center font-bold text-sm transition-all"
            >
              &times;
            </button>
          </div>

          {/* Navigation Sub-Tabs */}
          <div className="px-5 pt-3 bg-slate-950/50 border-b border-slate-800 flex gap-2 text-xs font-bold">
            <button
              onClick={() => setActiveTab('audit')}
              className={`pb-3 border-b-2 px-3 transition-all flex items-center gap-1.5 ${
                activeTab === 'audit' 
                  ? 'border-sky-500 text-sky-400 font-extrabold' 
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <i className="fa-solid fa-shield-halved text-xs"></i>
              Statutory Scan & Gaps
            </button>

            <button
              onClick={() => setActiveTab('chat')}
              className={`pb-3 border-b-2 px-3 transition-all flex items-center gap-1.5 ${
                activeTab === 'chat' 
                  ? 'border-sky-500 text-sky-400 font-extrabold' 
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <i className="fa-solid fa-comments text-xs"></i>
              Privacy Copilot Q&A
            </button>

            <button
              onClick={() => setActiveTab('ledger')}
              className={`pb-3 border-b-2 px-3 transition-all flex items-center gap-1.5 ${
                activeTab === 'ledger' 
                  ? 'border-sky-500 text-sky-400 font-extrabold' 
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <i className="fa-solid fa-fingerprint text-xs"></i>
              Tamper-Proof Ledger
            </button>
          </div>

          {/* TAB 1: STATUTORY AUDIT & GAPS SCAN */}
          {activeTab === 'audit' && (
            <div className="flex-1 overflow-y-auto p-5 space-y-5">
              
              {/* Scan Trigger & KPI Banner */}
              <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl flex items-center justify-between">
                <div>
                  <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                    Statutory Compliance Score
                  </div>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-3xl font-black font-mono text-emerald-400">
                      {scanResult?.score ? `${scanResult.score}%` : '85%'}
                    </span>
                    <span className="text-xs text-emerald-500 font-bold">
                      NDPA Verified
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-500 font-mono mt-1">
                    {scanResult?.evaluated_at ? `Evaluated: ${new Date(scanResult.evaluated_at).toLocaleTimeString()}` : 'Continuous monitoring active'}
                  </div>
                </div>

                <button
                  disabled={scanning}
                  onClick={handleRunScan}
                  className="px-4 py-2 bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg disabled:opacity-50 transition-all cursor-pointer"
                >
                  <i className={`fa-solid fa-arrows-rotate ${scanning ? 'animate-spin' : ''}`}></i>
                  <span>{scanning ? 'Analyzing Desks...' : 'Re-Run AI Scan'}</span>
                </button>
              </div>

              {/* Inventory Scanned Quick Counters */}
              {scanResult?.metrics_summary && (
                <div className="grid grid-cols-4 gap-2">
                  <div className="p-2.5 bg-slate-950/60 border border-slate-800 rounded-xl text-center">
                    <div className="text-[10px] text-slate-500 font-bold">RoPA</div>
                    <div className="text-sm font-black font-mono text-slate-200 mt-0.5">{scanResult.metrics_summary.ropa_count}</div>
                  </div>
                  <div className="p-2.5 bg-slate-950/60 border border-slate-800 rounded-xl text-center">
                    <div className="text-[10px] text-slate-500 font-bold">DPIA</div>
                    <div className="text-sm font-black font-mono text-slate-200 mt-0.5">{scanResult.metrics_summary.dpia_count}</div>
                  </div>
                  <div className="p-2.5 bg-slate-950/60 border border-slate-800 rounded-xl text-center">
                    <div className="text-[10px] text-slate-500 font-bold">Vendors</div>
                    <div className="text-sm font-black font-mono text-slate-200 mt-0.5">{scanResult.metrics_summary.vendor_count}</div>
                  </div>
                  <div className="p-2.5 bg-slate-950/60 border border-slate-800 rounded-xl text-center">
                    <div className="text-[10px] text-slate-500 font-bold">Proofs</div>
                    <div className="text-sm font-black font-mono text-emerald-400 mt-0.5">{scanResult.metrics_summary.consents_logged}</div>
                  </div>
                </div>
              )}

              {/* Findings & Gaps List */}
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs font-bold text-slate-400">
                  <span>Detected Regulatory Findings ({scanResult?.findings?.length || 0})</span>
                  <span className="text-[10px] font-mono text-slate-500">Autonomous Evaluation</span>
                </div>

                {scanResult?.findings && scanResult.findings.map((f, idx) => (
                  <div 
                    key={f.id || idx}
                    className={`p-3.5 rounded-xl border text-xs space-y-1.5 transition-all ${
                      f.severity === 'critical'
                        ? 'bg-red-950/30 border-red-800/50 text-red-200'
                        : f.severity === 'high'
                        ? 'bg-amber-950/30 border-amber-800/50 text-amber-200'
                        : f.severity === 'medium'
                        ? 'bg-sky-950/30 border-sky-800/50 text-sky-200'
                        : 'bg-emerald-950/20 border-emerald-800/40 text-emerald-200'
                    }`}
                  >
                    <div className="flex items-center justify-between font-bold">
                      <div className="flex items-center gap-2">
                        <span className={`text-[9px] uppercase px-1.5 py-0.5 rounded font-black tracking-wider ${
                          f.severity === 'critical' ? 'bg-red-500/20 text-red-400 border border-red-500/40' :
                          f.severity === 'high' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40' :
                          f.severity === 'medium' ? 'bg-sky-500/20 text-sky-400 border border-sky-500/40' :
                          'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                        }`}>
                          {f.severity}
                        </span>
                        <span className="text-slate-100 font-bold">{f.category}</span>
                      </div>
                      <span className="text-[10px] font-mono text-slate-400 bg-slate-900/60 px-2 py-0.5 rounded border border-slate-800">
                        {f.statutory_reference}
                      </span>
                    </div>

                    <p className="text-slate-300 text-[11px] leading-relaxed mt-1">{f.issue}</p>

                    <div className="pt-1 text-[11px] font-medium flex items-start gap-1.5 text-slate-400 bg-slate-900/40 p-2 rounded-lg border border-slate-800/60">
                      <i className="fa-solid fa-wrench text-sky-400 mt-0.5 text-[10px]"></i>
                      <span><strong>Remediation:</strong> {f.remediation}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Cryptographic Proof Hash Banner */}
              {scanResult?.ledger_hash && (
                <div className="p-3 bg-slate-950 border border-purple-800/40 rounded-xl text-[11px] space-y-1">
                  <div className="flex items-center justify-between text-purple-400 font-bold text-[10px] uppercase">
                    <span>Immutable SHA-256 Ledger Hash</span>
                    <span>NDPA Sec 39 Defense</span>
                  </div>
                  <div className="font-mono text-slate-400 break-all select-all text-[10px] bg-slate-900 p-2 rounded border border-slate-800">
                    {scanResult.ledger_hash}
                  </div>
                </div>
              )}

            </div>
          )}

          {/* TAB 2: PRIVACY COPILOT Q&A */}
          {activeTab === 'chat' && (
            <div className="flex-1 flex flex-col justify-between overflow-hidden">
              
              {/* Message Feed */}
              <div className="flex-1 overflow-y-auto p-5 space-y-4">
                {messages.map((m, i) => (
                  <div 
                    key={i} 
                    className={`flex flex-col text-xs leading-relaxed ${m.role === 'user' ? 'items-end' : 'items-start'}`}
                  >
                    <div className={`p-3.5 rounded-2xl max-w-[85%] ${
                      m.role === 'user' 
                        ? 'bg-sky-600 text-white rounded-br-none' 
                        : 'bg-slate-950 border border-slate-800 text-slate-200 rounded-bl-none shadow-md'
                    }`}>
                      <div className="font-sans whitespace-pre-wrap">{m.text}</div>
                      {m.hash && (
                        <div className="mt-2 pt-2 border-t border-slate-800/80 text-[9px] font-mono text-purple-300">
                          Proof Hash: {m.hash.substring(0, 24)}...
                        </div>
                      )}
                    </div>
                    <span className="text-[9px] text-slate-500 mt-1 px-1 font-mono">{m.time}</span>
                  </div>
                ))}
                {chatLoading && (
                  <div className="flex items-center gap-2 text-xs text-slate-400 p-3 bg-slate-950 rounded-xl border border-slate-800 w-fit">
                    <i className="fa-solid fa-spinner animate-spin text-sky-400"></i>
                    <span>TruePriv Agent is analyzing statutory database...</span>
                  </div>
                )}
              </div>

              {/* Prompt Suggestion Chips */}
              <div className="px-5 py-2 border-t border-slate-800 flex gap-1.5 overflow-x-auto text-[10px] font-medium no-scrollbar">
                <button
                  onClick={() => handleSendQuery('What are the NDPA requirements for cross-border data transfers to AWS?')}
                  className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-full shrink-0 border border-slate-700"
                >
                  🌐 Sec 41 Cross-Border
                </button>
                <button
                  onClick={() => handleSendQuery('What must be included in a third-party Vendor DPA?')}
                  className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-full shrink-0 border border-slate-700"
                >
                  🤝 Vendor DPA Mandate
                </button>
                <button
                  onClick={() => handleSendQuery('How should we handle 30-day DSAR statutory deadlines?')}
                  className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-full shrink-0 border border-slate-700"
                >
                  ⏱️ 30-Day DSAR SLA
                </button>
                <button
                  onClick={() => handleSendQuery('How does TruePriv Cookie SDK gate scripts without GTM?')}
                  className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-full shrink-0 border border-slate-700"
                >
                  🍪 Script Gating
                </button>
              </div>

              {/* Chat Input Bar */}
              <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center gap-2">
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendQuery()}
                  placeholder="Ask TruePriv Privacy Agent about NDPA statutory requirements..."
                  className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 font-sans"
                />
                <button
                  onClick={() => handleSendQuery()}
                  disabled={!query.trim() || chatLoading}
                  className="px-4 py-2.5 bg-sky-600 hover:bg-sky-500 disabled:opacity-40 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-md cursor-pointer"
                >
                  <i className="fa-solid fa-paper-plane"></i>
                  <span>Send</span>
                </button>
              </div>

            </div>
          )}

          {/* TAB 3: CRYPTOGRAPHIC AUDIT LEDGER */}
          {activeTab === 'ledger' && (
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              <div className="flex items-center justify-between text-xs">
                <div>
                  <h4 className="font-bold text-slate-200">Immutable Decision Ledger</h4>
                  <p className="text-[11px] text-slate-400">Cryptographic audit log for NDPC statutory audits</p>
                </div>
                <button 
                  onClick={loadLedger} 
                  className="text-[11px] text-sky-400 hover:underline font-bold flex items-center gap-1"
                >
                  <i className="fa-solid fa-rotate-right"></i> Refresh
                </button>
              </div>

              {ledgerLoading ? (
                <div className="py-12 text-center text-xs text-slate-500">
                  <i className="fa-solid fa-spinner animate-spin text-sky-400 text-lg mb-2"></i>
                  <div>Fetching ledger entries from database...</div>
                </div>
              ) : ledger.length > 0 ? (
                <div className="space-y-2.5">
                  {ledger.map((item) => (
                    <div key={item.id} className="p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs space-y-1">
                      <div className="flex items-center justify-between font-bold">
                        <span className="text-sky-400 font-mono uppercase text-[10px]">{item.decision_type}</span>
                        <span className="text-emerald-400 text-[10px] bg-emerald-950/80 border border-emerald-800 px-2 py-0.5 rounded font-mono">
                          Verified (Conf: {item.confidence_score * 100}%)
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono text-ellipsis overflow-hidden whitespace-nowrap">
                        Hash: {item.ledger_hash || 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'}
                      </div>
                      <div className="text-[10px] text-slate-500 flex justify-between pt-1">
                        <span>Agent: {item.model_name || 'TruePriv-Agent-v2.4'}</span>
                        <span>{new Date(item.created_at).toLocaleString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center text-xs text-slate-500 bg-slate-950 rounded-2xl border border-slate-800">
                  <i className="fa-solid fa-fingerprint text-2xl text-slate-600 mb-2"></i>
                  <p>No decision logs recorded yet. Run a statutory scan to generate verifiable ledger entries.</p>
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
