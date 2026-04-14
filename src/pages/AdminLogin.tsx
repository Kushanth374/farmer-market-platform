import React, { useMemo, useState } from 'react';
import { ShieldCheck, LockKeyhole, ArrowRight, KeyRound, Tractor } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { useTranslations } from '../i18n';

export const AdminLogin: React.FC = () => {
  const [pin, setPin] = useState('');
  const { adminSignIn, addToast } = useAppContext();
  const { t } = useTranslations();
  const navigate = useNavigate();

  const maskedPinPreview = useMemo(() => {
    const clean = pin.replace(/\s/g, '');
    const dots = '•'.repeat(Math.min(clean.length, 6));
    return dots.padEnd(6, '•');
  }, [pin]);

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
    <div className="admin-login-wrap">
      <div className="admin-login-card card">
        <div className="admin-login-brand" aria-label="Kisan Bandhu Admin">
          <span className="admin-login-brand-mark" aria-hidden="true">
            <Tractor size={18} />
          </span>
          <span className="admin-login-brand-text">
            <strong>Kisan Bandhu</strong>
            <small>Admin Portal</small>
          </span>
        </div>

        <div className="admin-login-head">
          <div className="admin-login-mark">
            <ShieldCheck size={22} />
          </div>
          <div style={{ minWidth: 0 }}>
            <h2 className="heading-1 admin-login-title">{t('adminLogin.title')}</h2>
            <p className="admin-login-subtitle">{t('adminLogin.subtitle')}</p>
          </div>
        </div>

        <div className="admin-login-preview" aria-hidden="true">
          <div className="admin-login-preview-label">PIN</div>
          <div className="admin-login-preview-dots">{maskedPinPreview}</div>
          <div className="admin-login-preview-hint">Enter admin PIN to continue</div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="input-group" style={{ marginBottom: '0.9rem' }}>
            <label className="input-label">{t('adminLogin.pinLabel')}</label>
            <div className="admin-login-input-row">
              <span className="admin-login-input-icon" aria-hidden="true">
                <KeyRound size={16} />
              </span>
              <input
                type="password"
                inputMode="numeric"
                className="input-field admin-login-input"
                placeholder={t('adminLogin.pinPlaceholder')}
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                required
              />
            </div>
          </div>

          <button type="submit" className="btn w-full" style={{ borderRadius: '14px' }}>
            <LockKeyhole size={16} /> {t('adminLogin.signIn')} <ArrowRight size={16} />
          </button>
        </form>
      </div>

      <style>{`
        .admin-login-wrap {
          max-width: 860px;
          margin: 0 auto;
          padding: 2rem 0 3rem;
          display: grid;
          place-items: start center;
        }

        .admin-login-card {
          width: min(720px, 100%);
          padding: 1.25rem;
          box-shadow: var(--shadow-lg);
          border: 1px solid rgba(255, 255, 255, 0.72);
          background:
            radial-gradient(circle at 20% 20%, rgba(116, 166, 59, 0.12), transparent 38%),
            radial-gradient(circle at 90% 60%, rgba(47, 111, 62, 0.12), transparent 40%),
            rgba(255, 255, 255, 0.78);
        }

        .admin-login-brand {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.85rem 0.95rem;
          border-radius: 18px;
          margin-bottom: 1rem;
          background: rgba(255, 255, 255, 0.55);
          border: 1px solid rgba(42, 79, 51, 0.12);
          box-shadow: 0 14px 30px rgba(16, 35, 29, 0.08);
        }

        .admin-login-brand-mark {
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

        .admin-login-brand-text {
          display: grid;
          gap: 2px;
          min-width: 0;
        }

        .admin-login-brand-text strong {
          color: var(--text-main);
          font-weight: 950;
          letter-spacing: -0.01em;
          line-height: 1.1;
        }

        .admin-login-brand-text small {
          color: var(--text-muted);
          font-weight: 800;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          font-size: 0.72rem;
        }

        .admin-login-head {
          display: flex;
          align-items: center;
          gap: 0.9rem;
          margin-bottom: 1rem;
        }

        .admin-login-mark {
          width: 44px;
          height: 44px;
          border-radius: 14px;
          display: grid;
          place-items: center;
          background: rgba(47, 111, 62, 0.1);
          border: 1px solid rgba(42, 79, 51, 0.12);
          color: var(--primary);
          box-shadow: 0 14px 30px rgba(16, 35, 29, 0.12);
          flex-shrink: 0;
        }

        .admin-login-title {
          margin: 0;
          font-size: 1.35rem;
        }

        .admin-login-subtitle {
          margin: 0.25rem 0 0 0;
          color: var(--text-muted);
          font-weight: 600;
          font-size: 0.92rem;
        }

        .admin-login-preview {
          border-radius: 18px;
          padding: 1rem 1.1rem;
          margin: 0 0 1rem 0;
          border: 1px solid rgba(42, 79, 51, 0.12);
          background:
            linear-gradient(135deg, rgba(16, 48, 33, 0.96), rgba(47, 111, 62, 0.86));
          color: white;
          overflow: hidden;
          position: relative;
        }

        .admin-login-preview::after {
          content: '';
          position: absolute;
          inset: -80% -40%;
          background: radial-gradient(circle, rgba(255,255,255,0.16), transparent 60%);
          transform: rotate(12deg);
          opacity: 0.9;
          pointer-events: none;
        }

        .admin-login-preview-label {
          font-size: 0.72rem;
          font-weight: 950;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.8);
        }

        .admin-login-preview-dots {
          margin-top: 0.35rem;
          font-size: 1.35rem;
          font-weight: 950;
          letter-spacing: 0.25em;
        }

        .admin-login-preview-hint {
          margin-top: 0.4rem;
          font-size: 0.85rem;
          color: rgba(255,255,255,0.82);
          font-weight: 650;
        }

        .admin-login-input-row {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .admin-login-input-icon {
          width: 42px;
          height: 42px;
          border-radius: 12px;
          display: grid;
          place-items: center;
          background: rgba(47, 111, 62, 0.08);
          border: 1px solid rgba(42, 79, 51, 0.12);
          color: var(--primary);
          flex-shrink: 0;
        }

        .admin-login-input {
          height: 42px;
          padding: 0.75rem 0.9rem;
          font-weight: 800;
        }

        @media (max-width: 768px) {
          .admin-login-wrap {
            padding: 1rem 0 2rem;
          }
          .admin-login-card {
            padding: 1rem;
          }
          .admin-login-brand {
            padding: 0.75rem 0.85rem;
          }
        }
      `}</style>
    </div>
  );
};
