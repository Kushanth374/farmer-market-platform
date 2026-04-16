import React, { useEffect, useMemo, useState } from 'react';
import { Eye, EyeOff, KeyRound, LogIn, ShieldCheck, UserPlus, Tractor, ArrowRight } from 'lucide-react';
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
    <div className="login-wrap">
      <div className="login-card card">
        <div className="login-brand" aria-label={`${t('brand.name')} ${t('login.brandSubtitle')}`}>
          <span className="login-brand-mark" aria-hidden="true">
            <Tractor size={18} className="brand-tractor-icon" />
          </span>
          <span className="login-brand-text">
            <strong>{t('brand.name')}</strong>
            <small>{t('login.brandSubtitle')}</small>
          </span>
        </div>

        <div className="login-head">
          <div className="login-head-icon" aria-hidden="true">
            <LogIn size={18} />
          </div>
          <div style={{ minWidth: 0 }}>
            <h2 className="heading-1 login-title">{t('login.welcomeTitle')}</h2>
            <p className="login-subtitle">{t('login.welcomeText')}</p>
          </div>
        </div>

        <div className="login-note">
          <div className="login-note-head">
            <ShieldCheck size={16} />
            <strong>{t('login.securityTitle')}</strong>
          </div>
          <p className="login-note-text">{t('login.securityText')}</p>
        </div>

        <form onSubmit={handleAccessAccount} className="login-form">
          <div className="input-group" style={{ marginBottom: 0 }}>
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

          <div className="input-group" style={{ marginBottom: 0 }}>
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
                  borderRadius: '10px',
                  padding: '0.35rem',
                  border: '1px solid rgba(42, 79, 51, 0.12)',
                  background: 'rgba(255,255,255,0.65)',
                  boxShadow: 'none',
                }}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div className="login-row">
            <label className="flex items-center gap-2" style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
              <input type="checkbox" checked={rememberPhone} onChange={(e) => setRememberPhone(e.target.checked)} />
              {t('login.rememberPhone')}
            </label>
            <button
              type="button"
              onClick={() => addToast(t('login.resetHint'), 'info')}
              className="login-link"
            >
              <KeyRound size={14} /> {t('login.forgotPassword')}
            </button>
          </div>

          {lastSuccessPhone && (
            <button type="button" className="btn btn-secondary w-full" onClick={() => setAccessPhone(lastSuccessPhone)}>
              {t('login.useLastAccount')}: {lastSuccessPhone}
            </button>
          )}

          <button type="submit" className="btn w-full" disabled={isAccessing} style={{ borderRadius: '14px' }}>
            <LogIn size={18} /> {isAccessing ? t('registration.checking') : t('registration.access')} <ArrowRight size={18} />
          </button>
        </form>

        <button type="button" className="btn btn-secondary w-full" onClick={() => navigate('/registration')}>
          <UserPlus size={18} /> {t('login.createNewAccount')}
        </button>
      </div>

      <style>{`
        .login-wrap {
          max-width: 920px;
          margin: 0 auto;
          padding: 1.5rem 0 2.5rem;
          display: grid;
          place-items: start center;
        }

        .login-card {
          width: min(720px, 100%);
          padding: 1.1rem;
          border: 1px solid rgba(255, 255, 255, 0.72);
          box-shadow: var(--shadow-lg);
          background:
            radial-gradient(circle at 18% 20%, rgba(116, 166, 59, 0.12), transparent 36%),
            radial-gradient(circle at 88% 58%, rgba(47, 111, 62, 0.12), transparent 38%),
            rgba(255, 255, 255, 0.78);
        }

        .login-brand {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.75rem 0.9rem;
          border-radius: 18px;
          margin-bottom: 0.9rem;
          background: rgba(255, 255, 255, 0.55);
          border: 1px solid rgba(42, 79, 51, 0.12);
          box-shadow: 0 14px 30px rgba(16, 35, 29, 0.08);
        }

        .login-brand-mark {
          width: 42px;
          height: 42px;
          border-radius: 14px;
          display: grid;
          place-items: center;
          color: #fffdf7;
          background: linear-gradient(135deg, #2f6f3e, #74a63b);
          box-shadow: 0 18px 34px rgba(47, 111, 62, 0.18);
          flex-shrink: 0;
        }

        .login-brand-text {
          display: grid;
          gap: 2px;
          min-width: 0;
        }

        .login-brand-text strong {
          color: var(--text-main);
          font-weight: 950;
          letter-spacing: -0.01em;
          line-height: 1.1;
        }

        .login-brand-text small {
          color: var(--text-muted);
          font-weight: 800;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          font-size: 0.72rem;
        }

        .login-head {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-bottom: 0.85rem;
        }

        .login-head-icon {
          width: 42px;
          height: 42px;
          border-radius: 14px;
          display: grid;
          place-items: center;
          background: rgba(47, 111, 62, 0.1);
          border: 1px solid rgba(42, 79, 51, 0.12);
          color: var(--primary);
          box-shadow: 0 14px 30px rgba(16, 35, 29, 0.12);
          flex-shrink: 0;
        }

        .login-title {
          margin: 0;
          font-size: 1.25rem;
        }

        .login-subtitle {
          margin: 0.25rem 0 0 0;
          color: var(--text-muted);
          font-weight: 650;
          font-size: 0.9rem;
        }

        .login-note {
          border-radius: 18px;
          padding: 0.85rem 0.95rem;
          margin-bottom: 0.9rem;
          border: 1px solid rgba(42, 79, 51, 0.12);
          background: linear-gradient(135deg, rgba(16, 48, 33, 0.96), rgba(47, 111, 62, 0.86));
          color: white;
          position: relative;
          overflow: hidden;
        }

        .login-note::after {
          content: '';
          position: absolute;
          inset: -80% -40%;
          background: radial-gradient(circle, rgba(255,255,255,0.16), transparent 60%);
          transform: rotate(12deg);
          opacity: 0.9;
          pointer-events: none;
        }

        .login-note-head {
          position: relative;
          z-index: 1;
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          font-weight: 900;
          margin-bottom: 0.25rem;
        }

        .login-note-text {
          position: relative;
          z-index: 1;
          margin: 0;
          font-size: 0.88rem;
          color: rgba(255,255,255,0.84);
          font-weight: 650;
        }

        .login-form {
          display: grid;
          gap: 0.85rem;
          margin-bottom: 0.85rem;
        }

        .login-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 0.75rem;
          flex-wrap: wrap;
        }

        .login-link {
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
          border: 0;
          padding: 0;
          background: transparent;
          color: var(--primary);
          font-weight: 800;
          cursor: pointer;
          font-size: 0.9rem;
        }

        @media (max-width: 768px) {
          .login-wrap {
            padding: 1rem 0 2rem;
          }
          .login-card {
            padding: 1rem;
          }
        }
      `}</style>
    </div>
  );
};
