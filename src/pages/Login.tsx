import React, { useEffect, useMemo, useState } from 'react';
import { Eye, EyeOff, KeyRound, LogIn, ShieldCheck, UserPlus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { useTranslations } from '../i18n';

const SAVED_PHONE_KEY = 'harvestlink_saved_phone';
const LAST_SUCCESS_PHONE_KEY = 'harvestlink_last_login_phone';

export const Login: React.FC = () => {
  const { accessAccount, addToast, accounts } = useAppContext();
  const { t } = useTranslations();
  const navigate = useNavigate();
  const [isAccessing, setIsAccessing] = useState(false);
  const [accessPhone, setAccessPhone] = useState('');
  const [accessPassword, setAccessPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberPhone, setRememberPhone] = useState(true);
  const [phoneError, setPhoneError] = useState('');

  const knownPhones = useMemo(() => Object.keys(accounts), [accounts]);
  const lastSuccessPhone = window.localStorage.getItem(LAST_SUCCESS_PHONE_KEY) ?? '';

  useEffect(() => {
    const rememberedPhone = window.localStorage.getItem(SAVED_PHONE_KEY);
    if (rememberedPhone) {
      setAccessPhone(rememberedPhone);
      setRememberPhone(true);
    }
  }, []);

  const isValidPhone = (phone: string) => /^\+?\d{10,15}$/.test(phone.trim());

  const handleAccessAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    const normalizedPhone = accessPhone.trim();

    if (!isValidPhone(normalizedPhone)) {
      setPhoneError(t('login.phoneInvalid'));
      addToast(t('login.phoneInvalid'), 'warning');
      return;
    }

    setPhoneError('');
    setIsAccessing(true);

    try {
      const result = await accessAccount(normalizedPhone, accessPassword);

      if (result === 'success') {
        if (rememberPhone) {
          window.localStorage.setItem(SAVED_PHONE_KEY, normalizedPhone);
        } else {
          window.localStorage.removeItem(SAVED_PHONE_KEY);
        }
        window.localStorage.setItem(LAST_SUCCESS_PHONE_KEY, normalizedPhone);
        addToast(t('toast.welcomeBack'), 'success');
        navigate('/market');
        return;
      }

      if (result === 'invalid_password') {
        addToast(t('toast.invalidPassword'), 'error');
        return;
      }

      addToast(t('toast.accountNotFound'), 'warning');
    } catch (error) {
      console.error('Failed to access account:', error);
      addToast(t('toast.loginUnavailable'), 'error');
    } finally {
      setIsAccessing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="card mb-6" style={{ background: 'linear-gradient(to right, var(--primary), var(--primary-hover))', color: 'white', border: 'none' }}>
        <h2 className="heading-1" style={{ color: 'white' }}>{t('login.welcomeTitle')}</h2>
        <p style={{ opacity: 0.9 }}>{t('login.welcomeText')}</p>
      </div>

      <div className="card max-w-2xl mx-auto">
        <div className="flex items-center gap-2 mb-6" style={{ color: 'var(--primary)' }}>
          <LogIn />
          <h3 className="heading-1" style={{ fontSize: '1.25rem', margin: 0, color: 'var(--text-main)' }}>{t('registration.accessTitle')}</h3>
        </div>

        <div className="card mb-4" style={{ background: 'rgba(47, 111, 62, 0.06)', border: '1px solid var(--border)' }}>
          <div className="flex items-center gap-2" style={{ marginBottom: '0.5rem', color: 'var(--primary)' }}>
            <ShieldCheck size={16} />
            <strong style={{ fontSize: '0.9rem' }}>{t('login.securityTitle')}</strong>
          </div>
          <p className="text-muted" style={{ marginBottom: 0 }}>
            {t('login.securityText')}
          </p>
        </div>

        <form onSubmit={handleAccessAccount}>
          <div className="input-group">
            <label className="input-label">{t('registration.phone')}</label>
            <input
              type="tel"
              className="input-field"
              value={accessPhone}
              onChange={(e) => setAccessPhone(e.target.value)}
              placeholder="+919876543210"
              list="known-login-phones"
              required
            />
            <datalist id="known-login-phones">
              {knownPhones.map((phone) => (
                <option value={phone} key={phone} />
              ))}
            </datalist>
            {phoneError ? <p style={{ color: '#b45309', fontSize: '0.82rem', marginTop: '0.4rem' }}>{phoneError}</p> : null}
          </div>

          <div className="input-group">
            <label className="input-label">{t('registration.accessPassword')}</label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                className="input-field"
                value={accessPassword}
                onChange={(e) => setAccessPassword(e.target.value)}
                placeholder={t('registration.accessPasswordPlaceholder')}
                required
                style={{ paddingRight: '3rem' }}
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                aria-label={showPassword ? t('login.hidePassword') : t('login.showPassword')}
                className="btn-secondary"
                style={{
                  position: 'absolute',
                  right: '0.4rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  borderRadius: '6px',
                  padding: '0.35rem',
                  border: 'none',
                  background: 'transparent',
                  boxShadow: 'none',
                }}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between mb-4" style={{ flexWrap: 'wrap', gap: '0.75rem' }}>
            <label className="flex items-center gap-2" style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
              <input type="checkbox" checked={rememberPhone} onChange={(e) => setRememberPhone(e.target.checked)} />
              {t('login.rememberPhone')}
            </label>
            <button
              type="button"
              onClick={() => addToast(t('login.resetHint'), 'info')}
              className="btn-secondary"
              style={{ border: 'none', padding: 0, background: 'transparent', boxShadow: 'none', color: 'var(--primary)', fontSize: '0.9rem' }}
            >
              <KeyRound size={14} /> {t('login.forgotPassword')}
            </button>
          </div>

          {lastSuccessPhone && (
            <button
              type="button"
              className="btn btn-secondary w-full mb-4"
              onClick={() => setAccessPhone(lastSuccessPhone)}
            >
              {t('login.useLastAccount')}: {lastSuccessPhone}
            </button>
          )}

          <button type="submit" className="btn w-full" disabled={isAccessing}>
            <LogIn size={18} /> {isAccessing ? t('registration.checking') : t('registration.access')}
          </button>
        </form>

        <button type="button" className="btn btn-secondary w-full mt-4" onClick={() => navigate('/registration')}>
          <UserPlus size={18} /> {t('login.createNewAccount')}
        </button>
      </div>
    </div>
  );
};
