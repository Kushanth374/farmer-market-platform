import React, { useEffect, useState } from 'react';
import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { Sidebar } from './components/Navbar';
import { ToastContainer } from './components/Toast';
import { Menu } from 'lucide-react';
import { Landing } from './pages/Landing';
import { Registration } from './pages/Registration';
import { Schemes } from './pages/Schemes';
import { Market } from './pages/Market';
import { Dashboard } from './pages/Dashboard';
import { Admin } from './pages/Admin';
import { AdminLogin } from './pages/AdminLogin';
import { useTranslations } from './i18n';
import { useAppContext } from './context/AppContext';

export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const { t, language } = useTranslations();
  const { isAdmin } = useAppContext();

  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  const getPageTitle = () => {
    switch (location.pathname) {
      case '/':
        return t('page.landing');
      case '/registration':
        return t('page.registration');
      case '/schemes':
        return t('page.schemes');
      case '/market':
        return t('page.market');
      case '/dashboard':
        return t('page.dashboard');
      case '/admin':
        return t('page.admin');
      case '/admin-login':
        return t('page.adminLogin');
      default:
        return t('page.dashboard');
    }
  };

  if (location.pathname === '/') {
    return (
      <>
        <Landing />
        <ToastContainer />
      </>
    );
  }

  return (
    <div className="app-container">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      {sidebarOpen && <button className="sidebar-backdrop" aria-label="Close navigation" onClick={() => setSidebarOpen(false)} />}

      <main className="main-content">
        <header className="top-nav">
          <div className="top-nav-group flex items-center gap-4">
            <button
              className="top-nav-menu btn-secondary"
              aria-label={t('nav.navigation')}
              style={{ padding: '0.5rem', display: 'flex', borderRadius: '8px', border: '1px solid var(--border)', background: 'transparent', cursor: 'pointer' }}
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              <Menu size={20} />
            </button>
            <h2 className="top-nav-title heading-1" style={{ fontSize: '1.25rem', margin: 0 }}>{getPageTitle()}</h2>
          </div>
          <div className="top-nav-actions flex items-center gap-4">
            <div className="top-nav-language" title={t('lang.label')} style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', textTransform: 'uppercase' }}>
              {language}
            </div>
          </div>
        </header>

        <div className="page-content animate-fade-in">
          <Routes>
            <Route path="/registration" element={<Registration />} />
            <Route path="/schemes" element={<Schemes />} />
            <Route path="/market" element={<Market />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/admin-login" element={isAdmin ? <Navigate to="/admin" replace /> : <AdminLogin />} />
            <Route path="/admin" element={isAdmin ? <Admin /> : <Navigate to="/admin-login" replace />} />
          </Routes>
        </div>
      </main>

      <ToastContainer />
    </div>
  );
}
