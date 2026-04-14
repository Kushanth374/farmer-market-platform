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
    <div className="max-w-4xl mx-auto">
      <div className="card mb-6" style={{ background: 'linear-gradient(to right, var(--primary), var(--primary-hover))', color: 'white', border: 'none' }}>
        <h2 className="heading-1" style={{ color: 'white' }}>{t('registration.welcomeTitle')}</h2>
        <p style={{ opacity: 0.9 }}>{t('registration.welcomeText')}</p>
      </div>

      <div style={{ maxWidth: '820px', margin: '0 auto' }}>
        <div className="card" style={{ padding: '1.25rem' }}>
          <div className="flex items-center gap-2 mb-6" style={{ color: 'var(--primary)' }}>
            <User />
            <h3 className="heading-1" style={{ fontSize: '1.25rem', margin: 0, color: 'var(--text-main)' }}>{t('registration.details')}</h3>
          </div>
          <form onSubmit={handleSave}>
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

            <div className="flex items-center gap-2 mb-4 mt-6" style={{ color: 'var(--primary)', marginTop: '1rem' }}>
              <Map />
              <h3 className="heading-1" style={{ fontSize: '1.1rem', margin: 0, color: 'var(--text-main)' }}>{t('registration.farmDetails')}</h3>
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

            <button type="submit" className="btn w-full" disabled={isSaving}>
              <Save size={18} /> {isSaving ? t('registration.saving') : t('registration.save')}
            </button>

            <div style={{ textAlign: 'center', marginTop: '1.5rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              Already have an account?{' '}
              <button 
                type="button" 
                onClick={() => navigate('/login')}
                style={{ background: 'none', border: 'none', color: 'var(--primary)', fontWeight: 'bold', cursor: 'pointer', padding: 0 }}
              >
                {t('registration.goToLogin')}
              </button>
            </div>
          </form>
        </div>
      </div>

      <style>{`
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
      `}</style>
    </div>
  );
};
