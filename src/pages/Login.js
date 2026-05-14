import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      await login(username, password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  const quickLogin = (u, p) => { setUsername(u); setPassword(p); };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-header">
          <div className="login-emblem">M</div>
          <div className="login-title">MILITARY AMS</div>
          <div className="login-sub">Asset Management System</div>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Username</label>
            <input className="form-control" value={username} onChange={e => setUsername(e.target.value)} placeholder="Enter username" required />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input className="form-control" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Enter password" required />
          </div>
          <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: 8 }} disabled={loading}>
            {loading ? 'AUTHENTICATING...' : 'SECURE LOGIN'}
          </button>
        </form>

        <div style={{ marginTop: 24, padding: 16, background: 'var(--bg-secondary)', borderRadius: 8, border: '1px solid var(--border)' }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: 10 }}>Quick Access — Demo Credentials</div>
          {[
            ['admin', 'Admin@1234', 'Administrator', 'green'],
            ['alpha_cmd', 'Commander@1', 'Base Commander', 'blue'],
            ['logistics1', 'Logistics@1', 'Logistics Officer', 'amber'],
          ].map(([u, p, label, color]) => (
            <button key={u} onClick={() => quickLogin(u, p)}
              style={{ display: 'block', width: '100%', textAlign: 'left', marginBottom: 6, padding: '8px 12px', background: 'var(--bg-card)', border: `1px solid var(--border)`, borderRadius: 5, cursor: 'pointer', color: `var(--accent-${color})`, fontSize: 12, fontFamily: 'var(--font-mono)' }}>
              [{label}] {u}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
