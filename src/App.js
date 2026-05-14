import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Sidebar from './components/Sidebar';
import TopBar from './components/TopBar';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Purchases from './pages/Purchases';
import Transfers from './pages/Transfers';
import Assignments from './pages/Assignments';
import AdminUsers from './pages/AdminUsers';
import AuditLogs from './pages/AuditLogs';
import './index.css';

function ProtectedLayout({ children, roles }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="loading-screen"><div className="spinner" /><span>INITIALIZING...</span></div>;
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />;
  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <TopBar />
        <div className="page-body" style={{ padding: 0 }}>
          {children}
        </div>
      </div>
    </div>
  );
}

function AppRoutes() {
  const { user } = useAuth();
  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/" /> : <Login />} />
      <Route path="/" element={<ProtectedLayout><Dashboard /></ProtectedLayout>} />
      <Route path="/purchases" element={<ProtectedLayout roles={['admin', 'logistics_officer']}><Purchases /></ProtectedLayout>} />
      <Route path="/transfers" element={<ProtectedLayout roles={['admin', 'logistics_officer', 'base_commander']}><Transfers /></ProtectedLayout>} />
      <Route path="/assignments" element={<ProtectedLayout roles={['admin', 'base_commander']}><Assignments /></ProtectedLayout>} />
      <Route path="/admin/users" element={<ProtectedLayout roles={['admin']}><AdminUsers /></ProtectedLayout>} />
      <Route path="/admin/audit" element={<ProtectedLayout roles={['admin']}><AuditLogs /></ProtectedLayout>} />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}
