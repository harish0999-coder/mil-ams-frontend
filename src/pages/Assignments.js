import React, { useState, useEffect, useCallback } from 'react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';

function AssignModal({ bases, assets, onClose, onSaved }) {
  const { user } = useAuth();
  const [form, setForm] = useState({ asset: '', base: user?.assignedBase?._id || '', assignedTo: '', personnelId: '', rank: '', quantity: '', assignmentDate: '', notes: '' });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault(); setError(''); setSaving(true);
    try {
      await api.post('/assignments', form);
      onSaved();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create assignment');
    } finally { setSaving(false); }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">◎ CREATE ASSIGNMENT</div>
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
                <label className="form-label">Assigned To *</label>
                <input className="form-control" value={form.assignedTo} onChange={e => set('assignedTo', e.target.value)} placeholder="Personnel or unit name" required />
              </div>
              <div className="form-group">
                <label className="form-label">Rank</label>
                <input className="form-control" value={form.rank} onChange={e => set('rank', e.target.value)} placeholder="Rank/title" />
              </div>
            </div>
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Personnel ID</label>
                <input className="form-control" value={form.personnelId} onChange={e => set('personnelId', e.target.value)} placeholder="P-XXXX" />
              </div>
              <div className="form-group">
                <label className="form-label">Quantity *</label>
                <input className="form-control" type="number" min="1" value={form.quantity} onChange={e => set('quantity', e.target.value)} required />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Assignment Date</label>
              <input className="form-control" type="date" value={form.assignmentDate} onChange={e => set('assignmentDate', e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Notes</label>
              <textarea className="form-control" value={form.notes} onChange={e => set('notes', e.target.value)} />
            </div>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button type="button" className="btn btn-secondary" onClick={onClose}>CANCEL</button>
              <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'SAVING...' : 'CREATE ASSIGNMENT'}</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

function ExpendModal({ assignment, onClose, onSaved }) {
  const [quantity, setQuantity] = useState(1);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault(); setSaving(true);
    try {
      await api.patch(`/assignments/${assignment._id}/expend`, { quantity: Number(quantity) });
      onSaved();
    } catch (err) { console.error(err); }
    finally { setSaving(false); }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" style={{ maxWidth: 400 }} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title" style={{ color: 'var(--accent-red)' }}>✕ MARK EXPENDED</div>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">
          <p style={{ color: 'var(--text-secondary)', marginBottom: 16, fontSize: 14 }}>
            Mark units as expended from assignment: <strong style={{ color: 'var(--text-primary)' }}>{assignment.asset?.name}</strong> → {assignment.assignedTo}
          </p>
          <div style={{ background: 'var(--bg-secondary)', borderRadius: 6, padding: 12, marginBottom: 16, fontFamily: 'var(--font-mono)', fontSize: 12 }}>
            <div>Assigned: {assignment.quantity} | Expended: {assignment.expended || 0} | Remaining: {assignment.quantity - (assignment.expended || 0)}</div>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Quantity to Expend *</label>
              <input className="form-control" type="number" min="1" max={assignment.quantity - (assignment.expended || 0)} value={quantity} onChange={e => setQuantity(e.target.value)} required />
            </div>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button type="button" className="btn btn-secondary" onClick={onClose}>CANCEL</button>
              <button type="submit" className="btn btn-danger" disabled={saving}>{saving ? 'SAVING...' : 'CONFIRM EXPEND'}</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

const statusBadge = { active: 'badge-green', returned: 'badge-blue', expended: 'badge-red' };
const typeClass = { weapon: 'badge-red', vehicle: 'badge-blue', ammunition: 'badge-amber', equipment: 'badge-green' };

export default function Assignments() {
  const { user } = useAuth();
  const [assignments, setAssignments] = useState([]);
  const [bases, setBases] = useState([]);
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [expendTarget, setExpendTarget] = useState(null);
  const [filters, setFilters] = useState({ base: '', type: '', status: '', startDate: '', endDate: '' });

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const params = Object.fromEntries(Object.entries(filters).filter(([, v]) => v));
      const [aRes, bRes, asRes] = await Promise.all([
        api.get('/assignments', { params }),
        api.get('/admin/bases'),
        api.get('/admin/assets')
      ]);
      setAssignments(aRes.data); setBases(bRes.data); setAssets(asRes.data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [filters]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const handleReturn = async (id) => {
    if (!window.confirm('Mark this assignment as returned?')) return;
    try { await api.patch(`/assignments/${id}/return`); fetchAll(); } catch (e) { console.error(e); }
  };

  const totalExpended = assignments.reduce((s, a) => s + (a.expended || 0), 0);
  const totalAssigned = assignments.filter(a => a.status === 'active').reduce((s, a) => s + a.quantity, 0);

  return (
    <div>
      <div className="page-header">
        <div className="page-title-block">
          <div className="page-title">◎ ASSIGNMENTS & EXPENDITURES</div>
          <div className="page-subtitle">// PERSONNEL ASSET TRACKING</div>
        </div>
        {['admin', 'base_commander'].includes(user?.role) && (
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>+ CREATE ASSIGNMENT</button>
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
              <option value="active">Active</option>
              <option value="returned">Returned</option>
              <option value="expended">Expended</option>
            </select>
          </div>
          <div className="filter-group">
            <div className="filter-label">Type</div>
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
          <button className="btn btn-secondary btn-sm" onClick={() => setFilters({ base: '', type: '', status: '', startDate: '', endDate: '' })}>RESET</button>
        </div>

        <div style={{ display: 'flex', gap: 16, marginBottom: 20 }}>
          {[
            { label: 'Total Assignments', value: assignments.length, color: 'var(--text-primary)' },
            { label: 'Currently Assigned', value: totalAssigned, color: 'var(--accent-amber)' },
            { label: 'Total Expended', value: totalExpended, color: 'var(--accent-red)' },
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
                  <tr><th>Asset</th><th>Type</th><th>Base</th><th>Assigned To</th><th>Rank/ID</th><th>Qty</th><th>Expended</th><th>Status</th><th>Date</th><th>Actions</th></tr>
                </thead>
                <tbody>
                  {assignments.length === 0 && (
                    <tr><td colSpan={10} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 32, fontFamily: 'var(--font-mono)' }}>NO ASSIGNMENTS FOUND</td></tr>
                  )}
                  {assignments.map(a => (
                    <tr key={a._id}>
                      <td className="td-bold">{a.asset?.name}</td>
                      <td><span className={`badge ${typeClass[a.asset?.type]}`}>{a.asset?.type?.toUpperCase()}</span></td>
                      <td style={{ fontSize: 13 }}>{a.base?.name}</td>
                      <td style={{ color: 'var(--text-primary)', fontSize: 13 }}>{a.assignedTo}</td>
                      <td style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-muted)' }}>{a.rank} {a.personnelId && `| ${a.personnelId}`}</td>
                      <td style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent-amber)', fontWeight: 700 }}>{a.quantity}</td>
                      <td style={{ fontFamily: 'var(--font-mono)', color: a.expended > 0 ? 'var(--accent-red)' : 'var(--text-muted)' }}>
                        {a.expended > 0 ? `-${a.expended}` : '0'}
                      </td>
                      <td><span className={`badge ${statusBadge[a.status]}`}>{a.status?.toUpperCase()}</span></td>
                      <td style={{ fontFamily: 'var(--font-mono)', fontSize: 12 }}>{new Date(a.assignmentDate).toLocaleDateString()}</td>
                      <td>
                        {a.status === 'active' && ['admin', 'base_commander'].includes(user?.role) && (
                          <div style={{ display: 'flex', gap: 6 }}>
                            <button className="btn btn-danger btn-sm" onClick={() => setExpendTarget(a)}>EXPEND</button>
                            <button className="btn btn-secondary btn-sm" onClick={() => handleReturn(a._id)}>RETURN</button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {showModal && <AssignModal bases={bases} assets={assets} onClose={() => setShowModal(false)} onSaved={() => { setShowModal(false); fetchAll(); }} />}
      {expendTarget && <ExpendModal assignment={expendTarget} onClose={() => setExpendTarget(null)} onSaved={() => { setExpendTarget(null); fetchAll(); }} />}
    </div>
  );
}
