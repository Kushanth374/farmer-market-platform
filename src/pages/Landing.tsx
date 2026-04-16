import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, CheckCircle2, Play, ShieldCheck, Tractor, TrendingUp, WalletCards } from 'lucide-react';
import { useTranslations } from '../i18n';
import { ParticlesLeaves } from '../components/ParticlesLeaves';
import { ParticlesBubbles } from '../components/ParticlesBubbles';
import { AppLoader } from '../components/AppLoader';

export const Landing: React.FC = () => {
  const { t } = useTranslations();
  const navigate = useNavigate();
  const [isStartingNow, setIsStartingNow] = useState(false);
  const heroImageUrl =
    'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=2200&q=90';

  const heroPoints = [t('landing.point1'), t('landing.point2'), t('landing.point3')];
  const features = [
    { icon: ShieldCheck, title: t('landing.feature1Title'), text: t('landing.feature1Text') },
    { icon: WalletCards, title: t('landing.feature2Title'), text: t('landing.feature2Text') },
    { icon: TrendingUp, title: t('landing.feature3Title'), text: t('landing.feature3Text') },
  ];
  const stats = [
    { value: t('landing.stat1Value'), label: t('landing.stat1Label') },
    { value: t('landing.stat2Value'), label: t('landing.stat2Label') },
    { value: t('landing.stat3Value'), label: t('landing.stat3Label') },
  ];

  useEffect(() => {
    if (!isStartingNow) return;
    const timerId = window.setTimeout(() => navigate('/registration'), 1200);
    return () => window.clearTimeout(timerId);
  }, [isStartingNow, navigate]);

  if (isStartingNow) {
    return <AppLoader />;
  }

  return (
    <div className="landing-page-pro">
      <div className="landing-leaf-overlay" aria-hidden="true">
        <ParticlesLeaves />
        <ParticlesBubbles />
      </div>
      <div className="landing-ambient landing-ambient-one" aria-hidden="true" />
      <div className="landing-ambient landing-ambient-two" aria-hidden="true" />
      <div className="landing-grid-overlay" aria-hidden="true" />
      <div className="wind-trail wind-trail-one" aria-hidden="true" />
      <div className="wind-trail wind-trail-two" aria-hidden="true" />
      <div className="leaf leaf-one" aria-hidden="true" />
      <div className="leaf leaf-two" aria-hidden="true" />
      <div className="leaf leaf-three" aria-hidden="true" />

      <header className="landing-topbar-pro">
        <Link to="/" className="landing-brand-pro">
          <span className="landing-brand-mark">
            <Tractor size={22} className="brand-tractor-icon" />
          </span>
          <span>
            <strong>{t('brand.name')}</strong>
            <small>{t('brand.tagline')}</small>
          </span>
        </Link>

        <nav className="landing-nav-pro">
          <a href="#features">{t('landing.featuresLink')}</a>
          <a href="#preview">{t('landing.previewLink')}</a>
          <button type="button" className="landing-nav-cta" onClick={() => setIsStartingNow(true)}>
            {t('landing.startNow')}
          </button>
        </nav>
      </header>

      <main className="landing-main-pro">
        <section className="hero-pro">
          <div className="hero-copy-pro landing-reveal landing-reveal-1">
            <div className="hero-kicker">
              <span>{t('landing.kicker')}</span>
            </div>

            <h1 className="hero-title-animated">
              <span>{t('landing.heroLine1')}</span>
              <span>{t('landing.heroLine2')}</span>
              <span>{t('landing.heroLine3')}</span>
            </h1>

            <p className="hero-text-pro">{t('landing.heroText')}</p>

            <div className="hero-actions-pro">
              <Link to="/registration" className="hero-primary-link">
                {t('landing.getStarted')}
                <ArrowRight size={18} />
              </Link>
              <a href="#preview" className="hero-secondary-link">
                <Play size={16} />
                {t('landing.viewPreview')}
              </a>
            </div>

            <div className="hero-proof-list">
              {heroPoints.map((item) => (
                <div key={item} className="hero-proof-item">
                  <CheckCircle2 size={18} />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="hero-visual-pro landing-reveal landing-reveal-2" id="preview">
            <div
              className="hero-photo-panel"
              style={{
                backgroundImage: `linear-gradient(rgba(20, 48, 24, 0.14), rgba(20, 48, 24, 0.14)), url(${heroImageUrl})`,
              }}
            >
              <div className="hero-photo-overlay">
                <p>{t('landing.overlayText')}</p>
                <strong>{t('landing.overlayStrong')}</strong>
              </div>
            </div>
          </div>
        </section>

        <section className="trust-strip-pro landing-reveal landing-reveal-3">
          {stats.map((metric) => (
            <article key={metric.label}>
              <strong>{metric.value}</strong>
              <span>{metric.label}</span>
            </article>
          ))}
        </section>

        <section className="section-pro landing-reveal landing-reveal-4" id="features">
          <div className="section-heading-pro">
            <p>{t('landing.sectionLabel')}</p>
            <h2>{t('landing.sectionTitle')}</h2>
          </div>

          <div className="pillar-grid-pro">
            {features.map(({ icon: Icon, title, text }) => (
              <article key={title} className="pillar-card-pro">
                <span className="pillar-icon">
                  <Icon size={20} />
                </span>
                <h3>{title}</h3>
                <p>{text}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="section-pro split-section-pro landing-reveal landing-reveal-5">
          <div className="story-card-pro image-story-card">
            <p className="story-label">{t('landing.storyLabel')}</p>
            <h2>{t('landing.storyTitle')}</h2>
            <p>{t('landing.storyText')}</p>
          </div>

          <div className="stats-card-pro">
            <div className="secondary-photo-panel" style={{ backgroundImage: `linear-gradient(rgba(28, 57, 26, 0.12), rgba(28, 57, 26, 0.12)), url(${heroImageUrl})` }} />
          </div>
        </section>

        <section className="cta-panel-pro landing-reveal landing-reveal-6">
          <div>
            <p>{t('landing.ready')}</p>
            <h2>{t('landing.ctaTitle')}</h2>
          </div>
          <div className="cta-actions-pro">
            <Link to="/registration" className="hero-primary-link">
              {t('landing.goToRegistration')}
              <ArrowRight size={18} />
            </Link>
            <Link to="/market" className="hero-secondary-link">
              {t('landing.viewMarket')}
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
};
