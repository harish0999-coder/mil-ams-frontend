import React, { useState, useEffect, useCallback } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';

const typeColors = { weapon: '#ff3355', vehicle: '#0099ff', ammunition: '#ffaa00', equipment: '#00ff88' };

function NetMovementModal({ data, onClose }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" style={{ maxWidth: 700 }} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title" style={{ color: 'var(--accent-amber)' }}>◈ NET MOVEMENT DETAILS</div>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">
          <div className="nm-detail-grid">
            <div className="nm-detail-item">
              <div className="nm-detail-label">Purchases</div>
              <div className="nm-detail-value" style={{ color: 'var(--accent-green)' }}>+{data?.totalPurchases || 0}</div>
            </div>
            <div className="nm-detail-item">
              <div className="nm-detail-label">Transfer In</div>
              <div className="nm-detail-value" style={{ color: 'var(--accent-blue)' }}>+{data?.totalTransferIn || 0}</div>
            </div>
            <div className="nm-detail-item">
              <div className="nm-detail-label">Transfer Out</div>
              <div className="nm-detail-value" style={{ color: 'var(--accent-red)' }}>-{data?.totalTransferOut || 0}</div>
            </div>
          </div>

          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-muted)', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '1.5px' }}>Recent Purchases</div>
          <div className="table-container" style={{ maxHeight: 200, overflow: 'auto', marginBottom: 16 }}>
            <table>
              <thead><tr><th>Asset</th><th>Base</th><th>Qty</th><th>Date</th></tr></thead>
              <tbody>
                {(data?.netMovementDetails?.purchases || []).slice(0, 5).map(p => (
                  <tr key={p._id}>
                    <td className="td-bold">{p.asset?.name}</td>
                    <td>{p.base?.name}</td>
                    <td style={{ color: 'var(--accent-green)' }}>+{p.quantity}</td>
                    <td>{new Date(p.purchaseDate).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-muted)', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '1.5px' }}>Transfer Movements</div>
          <div className="table-container" style={{ maxHeight: 200, overflow: 'auto' }}>
            <table>
              <thead><tr><th>Asset</th><th>From</th><th>To</th><th>Qty</th></tr></thead>
              <tbody>
                {[...(data?.netMovementDetails?.transfersIn || []), ...(data?.netMovementDetails?.transfersOut || [])].slice(0, 5).map(t => (
                  <tr key={t._id}>
                    <td className="td-bold">{t.asset?.name}</td>
                    <td>{t.fromBase?.name}</td>
                    <td>{t.toBase?.name}</td>
                    <td>{t.quantity}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState(null);
  const [bases, setBases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showNMModal, setShowNMModal] = useState(false);
  const [filters, setFilters] = useState({ base: '', startDate: '', endDate: '', type: '' });

  const fetchMetrics = useCallback(async () => {
    setLoading(true);
    try {
      const params = Object.fromEntries(Object.entries(filters).filter(([, v]) => v));
      const [mRes, bRes] = await Promise.all([
        api.get('/dashboard/metrics', { params }),
        api.get('/admin/bases')
      ]);
      setMetrics(mRes.data);
      setBases(bRes.data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [filters]);

  useEffect(() => { fetchMetrics(); }, [fetchMetrics]);

  const typeBreakdown = metrics?.typeBreakdown || [];

  return (
    <div>
      <div className="page-header">
        <div className="page-title-block">
          <div className="page-title">⬡ OPERATIONS DASHBOARD</div>
          <div className="page-subtitle">// ASSET MANAGEMENT OVERVIEW — REAL-TIME INTELLIGENCE</div>
        </div>
      </div>

      <div className="page-body" style={{ paddingTop: 0 }}>
        {/* Filters */}
        <div className="filters-bar">
          {user?.role === 'admin' && (
            <div className="filter-group">
              <div className="filter-label">Base</div>
              <select className="filter-control" value={filters.base} onChange={e => setFilters(f => ({ ...f, base: e.target.value }))}>
                <option value="">All Bases</option>
                {bases.map(b => <option key={b._id} value={b._id}>{b.name}</option>)}
              </select>
            </div>
          )}
          <div className="filter-group">
            <div className="filter-label">Equipment Type</div>
            <select className="filter-control" value={filters.type} onChange={e => setFilters(f => ({ ...f, type: e.target.value }))}>
              <option value="">All Types</option>
              <option value="weapon">Weapon</option>
              <option value="vehicle">Vehicle</option>
              <option value="ammunition">Ammunition</option>
              <option value="equipment">Equipment</option>
            </select>
          </div>
          <div className="filter-group">
            <div className="filter-label">From Date</div>
            <input type="date" className="filter-control" value={filters.startDate} onChange={e => setFilters(f => ({ ...f, startDate: e.target.value }))} />
          </div>
          <div className="filter-group">
            <div className="filter-label">To Date</div>
            <input type="date" className="filter-control" value={filters.endDate} onChange={e => setFilters(f => ({ ...f, endDate: e.target.value }))} />
          </div>
          <button className="btn btn-secondary btn-sm" onClick={() => setFilters({ base: '', startDate: '', endDate: '', type: '' })}>RESET</button>
        </div>

        {loading ? (
          <div className="loading-screen"><div className="spinner" /><span>LOADING INTELLIGENCE...</span></div>
        ) : (
          <>
            {/* Metric Cards */}
            <div className="metrics-grid" style={{ marginBottom: 20 }}>
              <div className="metric-card amber" title="Net Movement = Purchases + Transfer In - Transfer Out" onClick={() => setShowNMModal(true)}
                style={{ cursor: 'pointer' }}>
                <div className="metric-label">◈ Net Movement</div>
                <div className="metric-value">{metrics?.netMovement ?? 0}</div>
                <div className="metric-sub">Click for breakdown ↗</div>
              </div>
              <div className="metric-card green">
                <div className="metric-label">⬡ Closing Balance</div>
                <div className="metric-value">{metrics?.closingBalance ?? 0}</div>
                <div className="metric-sub">Current total assets</div>
              </div>
              <div className="metric-card blue">
                <div className="metric-label">▣ Purchases</div>
                <div className="metric-value">{metrics?.totalPurchases ?? 0}</div>
                <div className="metric-sub">Units acquired</div>
              </div>
              <div className="metric-card purple">
                <div className="metric-label">⇄ Transfer In</div>
                <div className="metric-value">{metrics?.totalTransferIn ?? 0}</div>
                <div className="metric-sub">Received at base</div>
              </div>
              <div className="metric-card red">
                <div className="metric-label">⇄ Transfer Out</div>
                <div className="metric-value">{metrics?.totalTransferOut ?? 0}</div>
                <div className="metric-sub">Dispatched from base</div>
              </div>
              <div className="metric-card amber">
                <div className="metric-label">◎ Assigned</div>
                <div className="metric-value">{metrics?.totalAssigned ?? 0}</div>
                <div className="metric-sub">Active assignments</div>
              </div>
              <div className="metric-card red">
                <div className="metric-label">✕ Expended</div>
                <div className="metric-value">{metrics?.totalExpended ?? 0}</div>
                <div className="metric-sub">Consumed/used</div>
              </div>
            </div>

            {/* Charts + Recent Activity */}
            <div className="grid-2" style={{ marginBottom: 20 }}>
              {/* Type Breakdown Chart */}
              <div className="card">
                <div className="section-header">
                  <div className="section-title">Asset Type Breakdown</div>
                </div>
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart data={typeBreakdown} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                    <XAxis dataKey="type" tick={{ fill: 'var(--text-muted)', fontSize: 11, fontFamily: 'Share Tech Mono' }} />
                    <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 11 }} />
                    <Tooltip
                      contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 6, fontFamily: 'Share Tech Mono', fontSize: 12 }}
                      labelStyle={{ color: 'var(--text-primary)' }}
                    />
                    <Bar dataKey="purchases" name="Purchases" radius={[3, 3, 0, 0]}>
                      {typeBreakdown.map((entry, i) => <Cell key={i} fill={typeColors[entry.type] || '#fff'} fillOpacity={0.8} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Recent Activity */}
              <div className="card">
                <div className="section-header">
                  <div className="section-title">Recent Activity</div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 260, overflow: 'auto' }}>
                  {[...(metrics?.recentPurchases || []).map(p => ({ type: 'purchase', item: p })),
                    ...(metrics?.recentTransfers || []).map(t => ({ type: 'transfer', item: t }))]
                    .sort((a, b) => new Date(b.item.createdAt) - new Date(a.item.createdAt))
                    .slice(0, 8)
                    .map(({ type, item }, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
                        <span style={{ fontSize: 14, width: 20, textAlign: 'center' }}>{type === 'purchase' ? '▣' : '⇄'}</span>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 13, fontFamily: 'var(--font-display)', fontWeight: 600, color: 'var(--text-primary)' }}>
                            {type === 'purchase' ? `Purchased ${item.quantity} × ${item.asset?.name}` : `Transfer: ${item.asset?.name} (×${item.quantity})`}
                          </div>
                          <div style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                            {type === 'purchase' ? item.base?.name : `${item.fromBase?.name} → ${item.toBase?.name}`}
                          </div>
                        </div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                          {new Date(item.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>

            {/* Type breakdown table */}
            <div className="card">
              <div className="section-header">
                <div className="section-title">Equipment Movement by Type</div>
              </div>
              <div className="table-container">
                <table>
                  <thead>
                    <tr><th>Type</th><th>Purchases</th><th>Transfer In</th><th>Transfer Out</th><th>Net Movement</th></tr>
                  </thead>
                  <tbody>
                    {typeBreakdown.map(row => (
                      <tr key={row.type}>
                        <td><span className={`badge badge-${row.type === 'weapon' ? 'red' : row.type === 'vehicle' ? 'blue' : row.type === 'ammunition' ? 'amber' : 'green'}`}>{row.type.toUpperCase()}</span></td>
                        <td style={{ color: 'var(--accent-green)' }}>+{row.purchases}</td>
                        <td style={{ color: 'var(--accent-blue)' }}>+{row.transferIn}</td>
                        <td style={{ color: 'var(--accent-red)' }}>-{row.transferOut}</td>
                        <td className="td-bold" style={{ color: row.net >= 0 ? 'var(--accent-green)' : 'var(--accent-red)' }}>{row.net >= 0 ? '+' : ''}{row.net}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>

      {showNMModal && <NetMovementModal data={metrics} onClose={() => setShowNMModal(false)} />}
    </div>
  );
}
