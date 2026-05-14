import React, { useState, useEffect, useCallback } from 'react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';

function PurchaseModal({ bases, assets, onClose, onSaved }) {
  const { user } = useAuth();
  const [form, setForm] = useState({ asset: '', base: user?.assignedBase?._id || '', quantity: '', unitCost: '', supplier: '', purchaseDate: '', referenceNumber: '', notes: '' });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault(); setError(''); setSaving(true);
    try {
      await api.post('/purchases', form);
      onSaved();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to record purchase');
    } finally { setSaving(false); }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">▣ RECORD PURCHASE</div>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">
          {error && <div className="alert alert-error">{error}</div>}
          <form onSubmit={handleSubmit}>
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Asset *</label>
                <select className="form-control" value={form.asset} onChange={e => set('asset', e.target.value)} required>
                  <option value="">Select asset</option>
                  {assets.map(a => <option key={a._id} value={a._id}>[{a.type.toUpperCase()}] {a.name}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Base *</label>
                <select className="form-control" value={form.base} onChange={e => set('base', e.target.value)} required disabled={user?.role === 'base_commander'}>
                  <option value="">Select base</option>
                  {bases.map(b => <option key={b._id} value={b._id}>{b.name}</option>)}
                </select>
              </div>
            </div>
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Quantity *</label>
                <input className="form-control" type="number" min="1" value={form.quantity} onChange={e => set('quantity', e.target.value)} required />
              </div>
              <div className="form-group">
                <label className="form-label">Unit Cost ($)</label>
                <input className="form-control" type="number" min="0" value={form.unitCost} onChange={e => set('unitCost', e.target.value)} />
              </div>
            </div>
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Supplier</label>
                <input className="form-control" value={form.supplier} onChange={e => set('supplier', e.target.value)} placeholder="Supplier name" />
              </div>
              <div className="form-group">
                <label className="form-label">Reference No.</label>
                <input className="form-control" value={form.referenceNumber} onChange={e => set('referenceNumber', e.target.value)} placeholder="PO-XXXX" />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Purchase Date</label>
              <input className="form-control" type="date" value={form.purchaseDate} onChange={e => set('purchaseDate', e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Notes</label>
              <textarea className="form-control" value={form.notes} onChange={e => set('notes', e.target.value)} />
            </div>
            <div className="modal-footer" style={{ padding: 0 }}>
              <button type="button" className="btn btn-secondary" onClick={onClose}>CANCEL</button>
              <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'SAVING...' : 'RECORD PURCHASE'}</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function Purchases() {
  const { user } = useAuth();
  const [purchases, setPurchases] = useState([]);
  const [bases, setBases] = useState([]);
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [filters, setFilters] = useState({ base: '', type: '', startDate: '', endDate: '' });

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const params = Object.fromEntries(Object.entries(filters).filter(([, v]) => v));
      const [pRes, bRes, aRes] = await Promise.all([
        api.get('/purchases', { params }),
        api.get('/admin/bases'),
        api.get('/admin/assets')
      ]);
      setPurchases(pRes.data);
      setBases(bRes.data);
      setAssets(aRes.data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [filters]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const typeClass = { weapon: 'badge-red', vehicle: 'badge-blue', ammunition: 'badge-amber', equipment: 'badge-green' };

  return (
    <div>
      <div className="page-header">
        <div className="page-title-block">
          <div className="page-title">▣ PURCHASES</div>
          <div className="page-subtitle">// ASSET PROCUREMENT RECORDS</div>
        </div>
        {['admin', 'logistics_officer'].includes(user?.role) && (
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>+ RECORD PURCHASE</button>
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
          <button className="btn btn-secondary btn-sm" onClick={() => setFilters({ base: '', type: '', startDate: '', endDate: '' })}>RESET</button>
        </div>

        {/* Summary */}
        <div style={{ display: 'flex', gap: 16, marginBottom: 20 }}>
          {[{ label: 'Total Records', value: purchases.length, color: 'var(--text-primary)' },
            { label: 'Total Units', value: purchases.reduce((s, p) => s + p.quantity, 0), color: 'var(--accent-green)' },
            { label: 'Total Value', value: '$' + (purchases.reduce((s, p) => s + (p.quantity * p.unitCost || 0), 0)).toLocaleString(), color: 'var(--accent-amber)' }
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
                  <tr><th>Ref No.</th><th>Asset</th><th>Type</th><th>Base</th><th>Qty</th><th>Unit Cost</th><th>Supplier</th><th>Date</th><th>Recorded By</th></tr>
                </thead>
                <tbody>
                  {purchases.length === 0 && (
                    <tr><td colSpan={9} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 32, fontFamily: 'var(--font-mono)' }}>NO RECORDS FOUND</td></tr>
                  )}
                  {purchases.map(p => (
                    <tr key={p._id}>
                      <td><span style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent-amber)', fontSize: 12 }}>{p.referenceNumber || '—'}</span></td>
                      <td className="td-bold">{p.asset?.name}</td>
                      <td><span className={`badge ${typeClass[p.asset?.type]}`}>{p.asset?.type?.toUpperCase()}</span></td>
                      <td>{p.base?.name}</td>
                      <td style={{ color: 'var(--accent-green)', fontFamily: 'var(--font-mono)', fontWeight: 700 }}>+{p.quantity}</td>
                      <td style={{ fontFamily: 'var(--font-mono)', fontSize: 12 }}>{p.unitCost ? '$' + p.unitCost.toLocaleString() : '—'}</td>
                      <td>{p.supplier || '—'}</td>
                      <td style={{ fontFamily: 'var(--font-mono)', fontSize: 12 }}>{new Date(p.purchaseDate).toLocaleDateString()}</td>
                      <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>{p.recordedBy?.name}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {showModal && <PurchaseModal bases={bases} assets={assets} onClose={() => setShowModal(false)} onSaved={() => { setShowModal(false); fetchAll(); }} />}
    </div>
  );
}
