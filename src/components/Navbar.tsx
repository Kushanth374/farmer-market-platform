import React from 'react';
import { NavLink } from 'react-router-dom';
import { Tractor, Sprout, Store, BarChart3, UserCircle, LogOut, Shield, Package, LogIn } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { LANGUAGE_OPTIONS, useTranslations } from '../i18n';

export const Sidebar: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const { user, signOut, language, setLanguage, isAdmin, adminSignOut } = useAppContext();
  const { t } = useTranslations();

  return (
    <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
      <div style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem', borderBottom: '1px solid var(--border)' }}>
        <Tractor color="var(--primary)" size={32} className="brand-tractor-icon" />
        <h1 className="heading-1 sidebar-brand-title" style={{ marginBottom: 0 }}>{t('brand.name')}</h1>
      </div>

      <div style={{ padding: '1rem', borderBottom: '1px solid var(--border)' }}>
        <p className="text-muted" style={{ marginBottom: '0.5rem', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{t('nav.navigation')}</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          <NavLink to="/" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} onClick={onClose}>
            <Tractor size={20} />
            {t('nav.landing')}
          </NavLink>
          <NavLink to="/registration" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} onClick={onClose}>
            <UserCircle size={20} />
            {t('nav.registration')}
          </NavLink>
          <NavLink to="/login" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} onClick={onClose}>
            <LogIn size={20} />
            {t('nav.login')}
          </NavLink>
          <NavLink to="/schemes" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} onClick={onClose}>
            <Sprout size={20} />
            {t('nav.schemes')}
          </NavLink>
          <NavLink to="/market" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} onClick={onClose}>
            <Store size={20} />
            {t('nav.market')}
          </NavLink>
          <NavLink to="/orders" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} onClick={onClose}>
            <Package size={20} />
            {t('nav.orders')}
          </NavLink>
          <NavLink to="/dashboard" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} onClick={onClose}>
            <BarChart3 size={20} />
            {t('nav.dashboardLong')}
          </NavLink>
        </div>
      </div>

      <div style={{ marginTop: 'auto', padding: '1.5rem', borderTop: '1px solid var(--border)' }}>
        <div className="input-group" style={{ marginBottom: '1rem' }}>
          <label className="input-label">{t('lang.label')}</label>
          <select
            className="input-field"
            value={language}
            onChange={(e) => setLanguage(e.target.value as typeof language)}
            style={{ padding: '0.5rem' }}
          >
            {LANGUAGE_OPTIONS.map((option) => (
              <option key={option.code} value={option.code}>
                {option.nativeLabel} ({option.label})
              </option>
            ))}
          </select>
        </div>

        {user && (
          <button
            className="btn btn-secondary w-full"
            style={{ padding: '0.5rem', fontSize: '0.875rem' }}
            onClick={() => { signOut(); onClose(); }}
          >
            <LogOut size={16} />
            {t('common.signOut')}
          </button>
        )}

        {isAdmin && (
          <button
            className="btn btn-secondary w-full"
            style={{ padding: '0.5rem', fontSize: '0.875rem', marginTop: '0.5rem' }}
            onClick={() => { adminSignOut(); onClose(); }}
          >
            <Shield size={16} />
            {t('admin.signOut')}
          </button>
        )}
      </div>
    </aside>
  );
};
