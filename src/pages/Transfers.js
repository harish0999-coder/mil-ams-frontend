import React, { useState, useEffect, useCallback } from 'react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';

function TransferModal({ bases, assets, onClose, onSaved }) {
  const [form, setForm] = useState({ asset: '', fromBase: '', toBase: '', quantity: '', transferDate: '', notes: '', referenceNumber: '' });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault(); setError(''); setSaving(true);
    try {
      await api.post('/transfers', form);
      onSaved();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create transfer');
    } finally { setSaving(false); }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">⇄ CREATE TRANSFER</div>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">
          {error && <div className="alert alert-error">{error}</div>}
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Asset *</label>
              <select className="form-control" value={form.asset} onChange={e => set('asset', e.target.value)} required>
                <option value="">Select asset</option>
                {assets.map(a => <option key={a._id} value={a._id}>[{a.type.toUpperCase()}] {a.name}</option>)}
              </select>
            </div>
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">From Base *</label>
                <select className="form-control" value={form.fromBase} onChange={e => set('fromBase', e.target.value)} required>
                  <option value="">Select source</option>
                  {bases.map(b => <option key={b._id} value={b._id}>{b.name}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">To Base *</label>
                <select className="form-control" value={form.toBase} onChange={e => set('toBase', e.target.value)} required>
                  <option value="">Select destination</option>
                  {bases.filter(b => b._id !== form.fromBase).map(b => <option key={b._id} value={b._id}>{b.name}</option>)}
                </select>
              </div>
            </div>
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Quantity *</label>
                <input className="form-control" type="number" min="1" value={form.quantity} onChange={e => set('quantity', e.target.value)} required />
              </div>
              <div className="form-group">
                <label className="form-label">Reference No.</label>
                <input className="form-control" value={form.referenceNumber} onChange={e => set('referenceNumber', e.target.value)} placeholder="TR-XXXX" />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Transfer Date</label>
              <input className="form-control" type="date" value={form.transferDate} onChange={e => set('transferDate', e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Notes</label>
              <textarea className="form-control" value={form.notes} onChange={e => set('notes', e.target.value)} />
            </div>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button type="button" className="btn btn-secondary" onClick={onClose}>CANCEL</button>
              <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'PROCESSING...' : 'INITIATE TRANSFER'}</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

const statusBadge = { completed: 'badge-green', in_transit: 'badge-amber', pending: 'badge-blue', cancelled: 'badge-red' };
const typeClass = { weapon: 'badge-red', vehicle: 'badge-blue', ammunition: 'badge-amber', equipment: 'badge-green' };

export default function Transfers() {
  const { user } = useAuth();
  const [transfers, setTransfers] = useState([]);
  const [bases, setBases] = useState([]);
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [filters, setFilters] = useState({ base: '', type: '', startDate: '', endDate: '', status: '' });

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const params = Object.fromEntries(Object.entries(filters).filter(([, v]) => v));
      const [tRes, bRes, aRes] = await Promise.all([
        api.get('/transfers', { params }),
        api.get('/admin/bases'),
        api.get('/admin/assets')
      ]);
      setTransfers(tRes.data); setBases(bRes.data); setAssets(aRes.data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [filters]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  return (
    <div>
      <div className="page-header">
        <div className="page-title-block">
          <div className="page-title">⇄ TRANSFERS</div>
          <div className="page-subtitle">// INTER-BASE ASSET MOVEMENTS</div>
        </div>
        {['admin', 'logistics_officer'].includes(user?.role) && (
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>+ INITIATE TRANSFER</button>
        )}
      </div>

      <div className="page-body" style={{ paddingTop: 0 }}>
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
            <div className="filter-label">Status</div>
            <select className="filter-control" value={filters.status} onChange={e => setFilters(f => ({ ...f, status: e.target.value }))}>
              <option value="">All Status</option>
              <option value="completed">Completed</option>
              <option value="in_transit">In Transit</option>
              <option value="pending">Pending</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
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
            <div className="filter-label">From</div>
            <input type="date" className="filter-control" value={filters.startDate} onChange={e => setFilters(f => ({ ...f, startDate: e.target.value }))} />
          </div>
          <div className="filter-group">
            <div className="filter-label">To</div>
            <input type="date" className="filter-control" value={filters.endDate} onChange={e => setFilters(f => ({ ...f, endDate: e.target.value }))} />
          </div>
          <button className="btn btn-secondary btn-sm" onClick={() => setFilters({ base: '', type: '', startDate: '', endDate: '', status: '' })}>RESET</button>
        </div>

        {/* Summary cards */}
        <div style={{ display: 'flex', gap: 16, marginBottom: 20 }}>
          {[
            { label: 'Total Transfers', value: transfers.length, color: 'var(--text-primary)' },
            { label: 'Completed', value: transfers.filter(t => t.status === 'completed').length, color: 'var(--accent-green)' },
            { label: 'In Transit', value: transfers.filter(t => t.status === 'in_transit').length, color: 'var(--accent-amber)' },
          ].map(s => (
            <div key={s.label} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, padding: '12px 20px', flex: 1 }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: 4 }}>{s.label}</div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 700, color: s.color }}>{s.value}</div>
            </div>
          ))}
        </div>

        <div className="card">
          {loading ? (
            <div className="loading-screen"><div className="spinner" /><span>LOADING...</span></div>
          ) : (
            <div className="table-container">
              <table>
                <thead>
                  <tr><th>Ref No.</th><th>Asset</th><th>Type</th><th>From</th><th>Arrow</th><th>To</th><th>Qty</th><th>Status</th><th>Date</th><th>Initiated By</th></tr>
                </thead>
                <tbody>
                  {transfers.length === 0 && (
                    <tr><td colSpan={10} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 32, fontFamily: 'var(--font-mono)' }}>NO TRANSFERS FOUND</td></tr>
                  )}
                  {transfers.map(t => (
                    <tr key={t._id}>
                      <td><span style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent-amber)', fontSize: 12 }}>{t.referenceNumber || '—'}</span></td>
                      <td className="td-bold">{t.asset?.name}</td>
                      <td><span className={`badge ${typeClass[t.asset?.type]}`}>{t.asset?.type?.toUpperCase()}</span></td>
                      <td style={{ color: 'var(--accent-red)', fontSize: 13 }}>{t.fromBase?.name}</td>
                      <td style={{ color: 'var(--text-muted)', fontSize: 16, textAlign: 'center' }}>→</td>
                      <td style={{ color: 'var(--accent-green)', fontSize: 13 }}>{t.toBase?.name}</td>
                      <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--accent-blue)' }}>{t.quantity}</td>
                      <td><span className={`badge ${statusBadge[t.status]}`}>{t.status?.replace('_', ' ').toUpperCase()}</span></td>
                      <td style={{ fontFamily: 'var(--font-mono)', fontSize: 12 }}>{new Date(t.transferDate).toLocaleDateString()}</td>
                      <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>{t.initiatedBy?.name}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {showModal && <TransferModal bases={bases} assets={assets} onClose={() => setShowModal(false)} onSaved={() => { setShowModal(false); fetchAll(); }} />}
    </div>
  );
}
