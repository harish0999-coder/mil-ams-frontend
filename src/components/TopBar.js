import React from 'react';
import { useLocation } from 'react-router-dom';

const pageTitles = {
  '/': 'Dashboard',
  '/purchases': 'Purchases',
  '/transfers': 'Transfers',
  '/assignments': 'Assignments & Expenditures',
  '/admin/users': 'User Management',
  '/admin/audit': 'Audit Logs',
};

export default function TopBar() {
  const location = useLocation();
  const title = pageTitles[location.pathname] || 'MIL-AMS';
  const now = new Date();

  return (
    <div className="top-bar">
      <div className="top-bar-left">
        <div className="breadcrumb">MIL-AMS / <span>{title}</span></div>
      </div>
      <div className="top-bar-right">
        <div className="system-status">
          <span className="status-dot dot-green" style={{ width: 6, height: 6 }}></span>
          SYSTEM ONLINE
        </div>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-muted)' }}>
          {now.toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}
        </div>
      </div>
    </div>
  );
}
