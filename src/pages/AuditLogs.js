import React, { useState, useEffect } from 'react';
import api from '../utils/api';

const actionColor = {
  LOGIN: 'badge-green', LOGIN_FAILED: 'badge-red',
  CREATE_PURCHASE: 'badge-blue', CREATE_TRANSFER: 'badge-amber',
  CREATE_ASSIGNMENT: 'badge-purple', EXPEND_ASSET: 'badge-red'
};

export default function AuditLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/audit-logs').then(r => setLogs(r.data)).catch(console.error).finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <div className="page-header">
        <div className="page-title-block">
          <div className="page-title">▣ AUDIT LOGS</div>
          <div className="page-subtitle">// SYSTEM TRANSACTION HISTORY</div>
        </div>
      </div>
      <div className="page-body" style={{ paddingTop: 0 }}>
        <div className="card">
          {loading ? <div className="loading-screen"><div className="spinner" /><span>LOADING...</span></div> : (
            <div className="table-container">
              <table>
                <thead><tr><th>Timestamp</th><th>Action</th><th>Module</th><th>User</th><th>Role</th><th>IP</th><th>Result</th></tr></thead>
                <tbody>
                  {logs.map(log => (
                    <tr key={log._id}>
                      <td style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-muted)' }}>{new Date(log.timestamp).toLocaleString()}</td>
                      <td><span className={`badge ${actionColor[log.action] || 'badge-gray'}`}>{log.action}</span></td>
                      <td style={{ fontSize: 13, fontFamily: 'var(--font-mono)', color: 'var(--accent-blue)' }}>{log.module}</td>
                      <td style={{ fontFamily: 'var(--font-display)', fontWeight: 600 }}>{log.username || '—'}</td>
                      <td style={{ fontSize: 12, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{log.role || '—'}</td>
                      <td style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-muted)' }}>{log.ipAddress || '—'}</td>
                      <td><span className={`badge ${log.success ? 'badge-green' : 'badge-red'}`}>{log.success ? 'SUCCESS' : 'FAILED'}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
