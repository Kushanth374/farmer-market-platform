import React, { useEffect, useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { Save, User, Map, Leaf, ArrowRight, LogIn } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTranslations } from '../i18n';

export const Registration: React.FC = () => {
  const { user, registerUser, addToast } = useAppContext();
  const { t, translateCrop } = useTranslations();
  const navigate = useNavigate();
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    address: user?.address || '',
    password: user?.password || '',
    landSize: user?.landSize || '',
    primaryCrop: user?.primaryCrop || '',
  });

  useEffect(() => {
    setFormData({
      name: user?.name || '',
      phone: user?.phone || '',
      address: user?.address || '',
      password: user?.password || '',
      landSize: user?.landSize || '',
      primaryCrop: user?.primaryCrop || '',
    });
  }, [user]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await registerUser(formData);
      addToast(t('toast.registrationSaved'), 'success');
      navigate('/market');
    } catch (error) {
      console.error('Failed to save registration:', error);
      addToast(t('toast.registrationSaveFailed'), 'error');
    } finally {
      setIsSaving(false);
    }
  };

  if (user) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="card mb-6" style={{ background: 'linear-gradient(to right, var(--primary), var(--primary-hover))', color: 'white', border: 'none' }}>
          <h2 className="heading-1" style={{ color: 'white' }}>{t('registration.completedTitle')}</h2>
          <p style={{ opacity: 0.9 }}>{t('registration.completedText')}</p>
        </div>

        <div className="grid-cols-2">
          <div className="card">
            <h3 className="heading-1" style={{ fontSize: '1.25rem' }}>{t('registration.yourAccount')}</h3>
            <div style={{ display: 'grid', gap: '0.9rem', marginTop: '1rem' }}>
              <p><strong>{t('registration.name')}:</strong> {user.name}</p>
              <p><strong>{t('registration.phone')}:</strong> {user.phone}</p>
              <p><strong>{t('registration.address')}:</strong> {user.address}</p>
              <p><strong>{t('registration.crop')}:</strong> {translateCrop(user.primaryCrop)}</p>
              <p><strong>{t('registration.land')}:</strong> {user.landSize} {t('registration.acres')}</p>
            </div>
            <button type="button" className="btn w-full mt-6" onClick={() => navigate('/market')}>
              <ArrowRight size={18} /> {t('registration.goToMarket')}
            </button>
          </div>

          <div className="card">
            <div className="flex items-center gap-2 mb-6" style={{ color: 'var(--primary)' }}>
              <Leaf />
            <h3 className="heading-1" style={{ fontSize: '1.25rem', margin: 0, color: 'var(--text-main)' }}>{t('registration.status')}</h3>
            </div>

            <div style={{ textAlign: 'center', padding: '2rem 1rem' }}>
              <div style={{ width: '120px', height: '120px', borderRadius: '50%', border: '8px solid var(--primary)', margin: '0 auto 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--primary)' }}>100%</span>
              </div>
              <h4 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.5rem' }}>
                {t('registration.accountReady')}
              </h4>
              <p className="text-muted">{t('registration.accountReadyText')}</p>
            </div>
            <button type="button" className="btn btn-secondary w-full mt-2 registration-login-cta" onClick={() => navigate('/login')}>
              <LogIn size={18} /> {t('registration.goToLogin')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="registration-wrap">
      <div className="registration-card card">
        <div className="registration-brand" aria-label={t('brand.name')}>
          <span className="registration-brand-mark" aria-hidden="true">
            <Leaf size={18} />
          </span>
          <span className="registration-brand-text">
            <strong>{t('brand.name')}</strong>
            <small>{t('registration.welcomeTitle')}</small>
          </span>
        </div>

        <div className="registration-head">
          <div className="registration-head-icon" aria-hidden="true">
            <User size={18} />
          </div>
          <div style={{ minWidth: 0 }}>
            <h2 className="heading-1 registration-title">{t('registration.details')}</h2>
            <p className="registration-subtitle">{t('registration.welcomeText')}</p>
          </div>
        </div>

        <div className="registration-note">
          <div className="registration-note-head">
            <Map size={16} />
            <strong>{t('registration.farmDetails')}</strong>
          </div>
          <p className="registration-note-text">{t('registration.accountReadyText')}</p>
        </div>

        <form onSubmit={handleSave} className="registration-form">
          <section className="registration-section">
            <div className="registration-section-title">
              <User size={16} />
              <span>{t('registration.details')}</span>
            </div>
            <div className="registration-form-grid">
              <div className="input-group">
                <label className="input-label">{t('registration.fullName')}</label>
                <input
                  type="text"
                  className="input-field"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  placeholder={t('registration.fullNamePlaceholder')}
                />
              </div>
              <div className="input-group">
                <label className="input-label">{t('registration.phone')}</label>
                <input
                  type="tel"
                  className="input-field"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  required
                  placeholder="+91"
                />
              </div>
              <div className="input-group registration-address">
                <label className="input-label">{t('registration.address')}</label>
                <textarea
                  className="input-field"
                  style={{ resize: 'none', height: '64px' }}
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  required
                  placeholder={t('registration.addressPlaceholder')}
                />
              </div>
              <div className="input-group">
                <label className="input-label">{t('registration.password')}</label>
                <input
                  type="password"
                  className="input-field"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                  placeholder={t('registration.passwordPlaceholder')}
                />
              </div>
            </div>
          </section>

          <section className="registration-section">
            <div className="registration-section-title">
              <Map size={16} />
              <span>{t('registration.farmDetails')}</span>
            </div>
            <div className="registration-form-grid">
              <div className="input-group">
                <label className="input-label">{t('registration.landSize')}</label>
                <input
                  type="number"
                  step="0.1"
                  className="input-field"
                  value={formData.landSize}
                  onChange={(e) => setFormData({ ...formData, landSize: e.target.value })}
                  required
                  placeholder={t('registration.landPlaceholder')}
                />
              </div>
              <div className="input-group mb-6">
                <label className="input-label">{t('registration.primaryCrop')}</label>
                <select
                  className="input-field"
                  value={formData.primaryCrop}
                  onChange={(e) => setFormData({ ...formData, primaryCrop: e.target.value })}
                  required
                >
                  <option value="">{t('crop.select')}</option>
                  <option value="Wheat">{t('crop.wheat')}</option>
                  <option value="Rice">{t('crop.rice')}</option>
                  <option value="Cotton">{t('crop.cotton')}</option>
                  <option value="Sugarcane">{t('crop.sugarcane')}</option>
                  <option value="Soybean">{t('crop.soybean')}</option>
                </select>
              </div>
            </div>
          </section>

          <button type="submit" className="btn w-full" disabled={isSaving} style={{ borderRadius: '14px' }}>
            <Save size={18} /> {isSaving ? t('registration.saving') : t('registration.save')} <ArrowRight size={18} />
          </button>

          <button type="button" className="btn btn-secondary w-full" onClick={() => navigate('/login')}>
            <LogIn size={18} /> {t('registration.goToLogin')}
          </button>
        </form>
      </div>

      <style>{`
        .registration-wrap {
          max-width: 920px;
          margin: 0 auto;
          padding: 1.5rem 0 2.5rem;
          display: grid;
          place-items: start center;
        }

        .registration-card {
          width: min(780px, 100%);
          padding: 1.1rem;
          border: 1px solid rgba(255, 255, 255, 0.72);
          box-shadow: var(--shadow-lg);
          background:
            radial-gradient(circle at 18% 20%, rgba(116, 166, 59, 0.12), transparent 36%),
            radial-gradient(circle at 88% 58%, rgba(47, 111, 62, 0.12), transparent 38%),
            rgba(255, 255, 255, 0.78);
        }

        .registration-brand {
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

        .registration-brand-mark {
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

        .registration-brand-text {
          display: grid;
          gap: 2px;
          min-width: 0;
        }

        .registration-brand-text strong {
          color: var(--text-main);
          font-weight: 950;
          letter-spacing: -0.01em;
          line-height: 1.1;
        }

        .registration-brand-text small {
          color: var(--text-muted);
          font-weight: 800;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          font-size: 0.72rem;
        }

        .registration-head {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-bottom: 0.85rem;
        }

        .registration-head-icon {
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

        .registration-title {
          margin: 0;
          font-size: 1.25rem;
        }

        .registration-subtitle {
          margin: 0.25rem 0 0 0;
          color: var(--text-muted);
          font-weight: 650;
          font-size: 0.9rem;
        }

        .registration-note {
          border-radius: 18px;
          padding: 0.85rem 0.95rem;
          margin-bottom: 0.9rem;
          border: 1px solid rgba(42, 79, 51, 0.12);
          background: linear-gradient(135deg, rgba(16, 48, 33, 0.96), rgba(47, 111, 62, 0.86));
          color: white;
          position: relative;
          overflow: hidden;
        }

        .registration-note::after {
          content: '';
          position: absolute;
          inset: -80% -40%;
          background: radial-gradient(circle, rgba(255,255,255,0.16), transparent 60%);
          transform: rotate(12deg);
          opacity: 0.9;
          pointer-events: none;
        }

        .registration-note-head {
          position: relative;
          z-index: 1;
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          font-weight: 900;
          margin-bottom: 0.25rem;
        }

        .registration-note-text {
          position: relative;
          z-index: 1;
          margin: 0;
          font-size: 0.88rem;
          color: rgba(255,255,255,0.84);
          font-weight: 650;
        }

        .registration-form {
          display: grid;
          gap: 0.85rem;
        }

        .registration-section {
          border-radius: 16px;
          padding: 0.9rem;
          border: 1px solid rgba(42, 79, 51, 0.12);
          background: rgba(255, 255, 255, 0.56);
        }

        .registration-section-title {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          margin-bottom: 0.75rem;
          color: var(--text-main);
          font-weight: 900;
          font-size: 0.95rem;
        }

        .registration-form-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 0.85rem;
        }

        .registration-form-grid .input-group {
          margin-bottom: 0;
        }

        .registration-form-grid .input-group.mb-6 {
          margin-bottom: 1.25rem;
        }

        .registration-address {
          grid-column: 1 / -1;
        }

        @media (min-width: 900px) {
          .registration-form-grid {
            grid-template-columns: 1fr 1fr;
            gap: 1rem;
          }
        }

        @media (max-width: 768px) {
          .registration-wrap {
            padding: 1rem 0 2rem;
          }
          .registration-card {
            padding: 1rem;
          }
        }
      `}</style>
    </div>
  );
};
