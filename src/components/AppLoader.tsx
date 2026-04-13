import React from 'react';
import { Leaf, Tractor } from 'lucide-react';
import { useTranslations } from '../i18n';

export const AppLoader: React.FC = () => {
  const { t } = useTranslations();

  return (
    <div className="app-loader-screen" role="status" aria-live="polite" aria-label={t('loader.aria')}>
      <div className="app-loader-core">
        <div className="app-loader-ring" />
        <div className="app-loader-icon">
          <Tractor size={28} />
        </div>
        <span className="app-loader-leaf app-loader-leaf-one">
          <Leaf size={18} />
        </span>
        <span className="app-loader-leaf app-loader-leaf-two">
          <Leaf size={16} />
        </span>
      </div>
      <h2 className="app-loader-title">{t('loader.title')}</h2>
      <p className="app-loader-subtitle">{t('loader.subtitle')}</p>
    </div>
  );
};
