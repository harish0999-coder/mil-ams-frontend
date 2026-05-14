import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const navItems = [
  { path: '/', label: 'Dashboard', icon: '⬡', roles: ['admin', 'base_commander', 'logistics_officer'] },
  { path: '/purchases', label: 'Purchases', icon: '◈', roles: ['admin', 'logistics_officer'] },
  { path: '/transfers', label: 'Transfers', icon: '⇄', roles: ['admin', 'logistics_officer', 'base_commander'] },
  { path: '/assignments', label: 'Assignments', icon: '◎', roles: ['admin', 'base_commander'] },
];

const adminItems = [
  { path: '/admin/users', label: 'Users', icon: '◉', roles: ['admin'] },
  { path: '/admin/audit', label: 'Audit Logs', icon: '▣', roles: ['admin'] },
];

const roleLabel = { admin: 'ADMINISTRATOR', base_commander: 'BASE COMMANDER', logistics_officer: 'LOGISTICS OFFICER' };
const roleColor = { admin: 'var(--accent-green)', base_commander: 'var(--accent-blue)', logistics_officer: 'var(--accent-amber)' };

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <div className="sidebar">
      <div className="sidebar-logo">
        <div className="logo-emblem">M</div>
        <div className="logo-text">
          <div className="logo-title">MIL-AMS</div>
          <div className="logo-sub">Asset Management</div>
        </div>
      </div>

      <nav className="sidebar-nav">
        <div className="nav-section-label">Operations</div>
        {navItems.filter(i => i.roles.includes(user?.role)).map(item => (
          <NavLink key={item.path} to={item.path} end={item.path === '/'} className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <span style={{ fontSize: 16 }}>{item.icon}</span>
            {item.label}
          </NavLink>
        ))}

        {user?.role === 'admin' && (
          <>
            <div className="nav-section-label" style={{ marginTop: 8 }}>Administration</div>
            {adminItems.map(item => (
              <NavLink key={item.path} to={item.path} className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                <span style={{ fontSize: 16 }}>{item.icon}</span>
                {item.label}
              </NavLink>
            ))}
          </>
        )}
      </nav>

      <div className="sidebar-user">
        <div className="user-info">
          <div className="user-avatar">{user?.name?.[0] || 'U'}</div>
          <div>
            <div className="user-name">{user?.name}</div>
            <div className="user-role" style={{ color: roleColor[user?.role] }}>{roleLabel[user?.role]}</div>
          </div>
        </div>
        {user?.assignedBase && (
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-muted)', paddingLeft: 2 }}>
            BASE: <span style={{ color: 'var(--accent-blue)' }}>{user.assignedBase.name}</span>
          </div>
        )}
        <button className="btn-logout" onClick={handleLogout}>
          <span>⏻</span> LOGOUT
        </button>
      </div>
    </div>
  );
}
