import React, { useState } from 'react';
import { ShieldCheck, LockKeyhole } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { useTranslations } from '../i18n';

export const AdminLogin: React.FC = () => {
  const [pin, setPin] = useState('');
  const { adminSignIn, addToast } = useAppContext();
  const { t } = useTranslations();
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const ok = adminSignIn(pin);
    if (!ok) {
      addToast(t('adminLogin.invalidPin'), 'error');
      return;
    }

    addToast(t('adminLogin.accessGranted'), 'success');
    navigate('/admin');
  };

  return (
    <div className="max-w-xl mx-auto pb-12">
      <div className="card" style={{ marginTop: '2rem' }}>
        <div className="flex items-center gap-2 mb-4" style={{ color: 'var(--primary)' }}>
          <ShieldCheck size={22} />
          <h2 className="heading-1" style={{ fontSize: '1.2rem', margin: 0 }}>{t('adminLogin.title')}</h2>
        </div>
        <p className="text-muted" style={{ marginBottom: '1rem' }}>
          {t('adminLogin.subtitle')}
        </p>

        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label className="input-label">{t('adminLogin.pinLabel')}</label>
            <input
              type="password"
              className="input-field"
              placeholder={t('adminLogin.pinPlaceholder')}
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="btn w-full">
            <LockKeyhole size={16} /> {t('adminLogin.signIn')}
          </button>
        </form>
      </div>
    </div>
  );
};
