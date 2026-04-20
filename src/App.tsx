import React, { useEffect, useState } from 'react';
import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { Sidebar } from './components/Navbar';
import { ToastContainer } from './components/Toast';
import { Menu } from 'lucide-react';
import { Landing } from './pages/Landing';
import { Registration } from './pages/Registration';
import { Login } from './pages/Login';
import { Schemes } from './pages/Schemes';
import { Market } from './pages/Market';
import { Dashboard } from './pages/Dashboard';
import { Admin } from './pages/Admin';
import { AdminLogin } from './pages/AdminLogin';
import { Orders } from './pages/Orders';
import { useTranslations } from './i18n';
import { useAppContext } from './context/AppContext';
import { AppLoader } from './components/AppLoader';
import { ParticlesLeaves } from './components/ParticlesLeaves';

export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isBooting, setIsBooting] = useState(true);
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window === 'undefined') {
      return false;
    }

    return window.innerWidth <= 768;
  });
  const location = useLocation();
  const { t, language } = useTranslations();
  const { isAdmin } = useAppContext();

  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const bootTimer = window.setTimeout(() => setIsBooting(false), 1400);
    return () => window.clearTimeout(bootTimer);
  }, []);

  useEffect(() => {
    const syncViewport = () => {
      setIsMobile(window.innerWidth <= 768);
      document.body.classList.toggle('mobile-optimized', window.innerWidth <= 768);
    };

    syncViewport();
    window.addEventListener('resize', syncViewport);
    return () => window.removeEventListener('resize', syncViewport);
  }, []);

  useEffect(() => {
    const supportsMotion = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!supportsMotion || isMobile) {
      return;
    }

    const clickableSelector = [
      'button',
      'a',
      '[role="button"]',
      'input[type="button"]',
      'input[type="submit"]',
      'input[type="reset"]',
      'summary',
      '.click-animate',
    ].join(', ');

    const cleanupEffect = (effect: HTMLElement, timeout = 900) => {
      window.setTimeout(() => {
        effect.remove();
      }, timeout);
    };

    const spawnClickBurst = (event: MouseEvent) => {
      const target = event.target;
      if (!(target instanceof Element)) {
        return;
      }

      const clickable = target.closest(clickableSelector);
      if (!(clickable instanceof HTMLElement)) {
        return;
      }

      clickable.classList.remove('click-press-animate');
      void clickable.offsetWidth;

      const rect = clickable.getBoundingClientRect();
      clickable.style.setProperty('--click-x', `${event.clientX - rect.left}px`);
      clickable.style.setProperty('--click-y', `${event.clientY - rect.top}px`);
      clickable.classList.add('click-press-animate');

      window.setTimeout(() => {
        clickable.classList.remove('click-press-animate');
      }, 520);

      const ripple = document.createElement('span');
      ripple.className = 'click-target-ripple click-effect-layer';
      ripple.style.left = `${event.clientX - rect.left}px`;
      ripple.style.top = `${event.clientY - rect.top}px`;
      clickable.appendChild(ripple);

      const halo = document.createElement('span');
      halo.className = 'click-target-halo click-effect-layer';
      halo.style.left = `${event.clientX - rect.left}px`;
      halo.style.top = `${event.clientY - rect.top}px`;
      clickable.appendChild(halo);

      const sweep = document.createElement('span');
      sweep.className = 'click-target-sheen click-effect-layer';
      clickable.appendChild(sweep);

      cleanupEffect(ripple, 650);
      cleanupEffect(halo, 720);
      cleanupEffect(sweep, 700);
    };

    document.addEventListener('pointerdown', spawnClickBurst);
    return () => document.removeEventListener('pointerdown', spawnClickBurst);
  }, [isMobile]);

  const getPageTitle = () => {
    switch (location.pathname) {
      case '/':
        return t('page.landing');
      case '/registration':
        return t('page.registration');
      case '/login':
        return t('page.login');
      case '/schemes':
        return t('page.schemes');
      case '/market':
        return t('page.market');
      case '/orders':
        return t('page.orders');
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

  const globalNatureBackground = (
    <div className="global-nature-bg" aria-hidden="true">
      <div className="greenery-mist-layer" />
      {!isMobile && location.pathname !== '/' && <ParticlesLeaves />}
    </div>
  );

  if (isBooting) {
    return <AppLoader />;
  }

  if (location.pathname === '/') {
    return (
      <>
        {globalNatureBackground}
        <div className="app-shell-layer">
          <Landing />
          <ToastContainer />
        </div>
      </>
    );
  }

  const isAdminRoute = location.pathname.startsWith('/admin');

  if (isAdminRoute) {
    return (
      <>
        {globalNatureBackground}
        <div className="app-shell-layer">
          <main className="main-content" style={{ width: '100%' }}>
            <div key={location.pathname} className="page-content route-transition" style={{ paddingTop: '2.25rem' }}>
              <Routes>
                <Route path="/admin-login" element={isAdmin ? <Navigate to="/admin" replace /> : <AdminLogin />} />
                <Route path="/admin" element={isAdmin ? <Admin /> : <Navigate to="/admin-login" replace />} />
              </Routes>
            </div>
          </main>
          <ToastContainer />
        </div>
      </>
    );
  }

  return (
    <>
      {globalNatureBackground}
      <div className="app-shell-layer">
        <div className="app-container">
          <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
          {sidebarOpen && <button className="sidebar-backdrop" aria-label={t('nav.closeNavigation')} onClick={() => setSidebarOpen(false)} />}

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

            <div key={location.pathname} className="page-content route-transition">
              <Routes>
                <Route path="/registration" element={<Registration />} />
                <Route path="/login" element={<Login />} />
                <Route path="/schemes" element={<Schemes />} />
                <Route path="/market" element={<Market />} />
                <Route path="/orders" element={<Orders />} />
                <Route path="/dashboard" element={<Dashboard />} />
              </Routes>
            </div>
          </main>
        </div>
        <ToastContainer />
      </div>
    </>
  );
}
