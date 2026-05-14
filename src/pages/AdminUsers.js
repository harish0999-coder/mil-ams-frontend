import React, { useState, useEffect } from 'react';
import api from '../utils/api';

const roleColor = { admin: 'badge-green', base_commander: 'badge-blue', logistics_officer: 'badge-amber' };
const roleLabel = { admin: 'ADMINISTRATOR', base_commander: 'BASE COMMANDER', logistics_officer: 'LOGISTICS OFFICER' };

function UserModal({ bases, onClose, onSaved }) {
  const [form, setForm] = useState({ username: '', password: '', name: '', email: '', role: 'logistics_officer', assignedBase: '' });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault(); setError(''); setSaving(true);
    try {
      await api.post('/admin/users', form);
      onSaved();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create user');
    } finally { setSaving(false); }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">◉ CREATE USER</div>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">
          {error && <div className="alert alert-error">{error}</div>}
          <form onSubmit={handleSubmit}>
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Full Name *</label>
                <input className="form-control" value={form.name} onChange={e => set('name', e.target.value)} required />
              </div>
              <div className="form-group">
                <label className="form-label">Username *</label>
                <input className="form-control" value={form.username} onChange={e => set('username', e.target.value)} required />
              </div>
            </div>
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Email *</label>
                <input className="form-control" type="email" value={form.email} onChange={e => set('email', e.target.value)} required />
              </div>
              <div className="form-group">
                <label className="form-label">Password *</label>
                <input className="form-control" type="password" value={form.password} onChange={e => set('password', e.target.value)} required />
              </div>
            </div>
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Role *</label>
                <select className="form-control" value={form.role} onChange={e => set('role', e.target.value)}>
                  <option value="admin">Administrator</option>
                  <option value="base_commander">Base Commander</option>
                  <option value="logistics_officer">Logistics Officer</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Assigned Base</label>
                <select className="form-control" value={form.assignedBase} onChange={e => set('assignedBase', e.target.value)}>
                  <option value="">None</option>
                  {bases.map(b => <option key={b._id} value={b._id}>{b.name}</option>)}
                </select>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button type="button" className="btn btn-secondary" onClick={onClose}>CANCEL</button>
              <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'CREATING...' : 'CREATE USER'}</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [bases, setBases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [uRes, bRes] = await Promise.all([api.get('/admin/users'), api.get('/admin/bases')]);
      setUsers(uRes.data); setBases(bRes.data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchAll(); }, []);

  return (
    <div>
      <div className="page-header">
        <div className="page-title-block">
          <div className="page-title">◉ USER MANAGEMENT</div>
          <div className="page-subtitle">// ROLE-BASED ACCESS CONTROL</div>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>+ ADD USER</button>
      </div>
      <div className="page-body" style={{ paddingTop: 0 }}>
        <div className="card">
          {loading ? <div className="loading-screen"><div className="spinner" /><span>LOADING...</span></div> : (
            <div className="table-container">
              <table>
                <thead><tr><th>Name</th><th>Username</th><th>Email</th><th>Role</th><th>Assigned Base</th><th>Status</th><th>Created</th></tr></thead>
                <tbody>
                  {users.map(u => (
                    <tr key={u._id}>
                      <td className="td-bold">{u.name}</td>
                      <td style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--accent-blue)' }}>{u.username}</td>
                      <td style={{ fontSize: 13, color: 'var(--text-muted)' }}>{u.email}</td>
                      <td><span className={`badge ${roleColor[u.role]}`}>{roleLabel[u.role]}</span></td>
                      <td style={{ fontSize: 13 }}>{u.assignedBase?.name || '—'}</td>
                      <td><span className={`badge ${u.isActive ? 'badge-green' : 'badge-red'}`}>{u.isActive ? 'ACTIVE' : 'INACTIVE'}</span></td>
                      <td style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text-muted)' }}>{new Date(u.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
      {showModal && <UserModal bases={bases} onClose={() => setShowModal(false)} onSaved={() => { setShowModal(false); fetchAll(); }} />}
    </div>
  );
}
