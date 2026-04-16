import React, { useMemo } from 'react';
import { Package, Calendar, IndianRupee, MapPin, ExternalLink } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { useTranslations } from '../i18n';
import type { LanguageCode } from '../i18n';

const localeByLanguage: Record<LanguageCode, string> = {
  en: 'en-IN',
  hi: 'hi-IN',
  mr: 'mr-IN',
  kn: 'kn-IN',
  ml: 'ml-IN',
  ta: 'ta-IN',
  te: 'te-IN',
};

const formatDateTime = (iso: string, locale: string) => {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleString(locale, { year: 'numeric', month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit' });
};

export const Orders: React.FC = () => {
  const { user, orders, language } = useAppContext();
  const { t } = useTranslations();
  const dateLocale = useMemo(() => localeByLanguage[language] ?? 'en-IN', [language]);
  const locationUnavailable = t('common.locationUnavailable');

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="card">
          <h2 className="heading-1" style={{ fontSize: '1.35rem' }}>{t('page.orders')}</h2>
          <p className="text-muted">{t('orders.loginPrompt')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="heading-1">{t('page.orders')}</h2>
          <p className="text-muted" style={{ fontSize: '0.9rem' }}>
            {t('orders.showingFor')} <strong>{user.phone}</strong>
          </p>
        </div>
      </div>

      {orders.length === 0 ? (
        <div className="card">
          <p className="text-muted">{t('orders.empty')}</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '1rem' }}>
          {orders.map((order) => {
            const mapsQuery = encodeURIComponent(order.sellerAddress || '');
            const mapsUrl = order.sellerAddress ? `https://www.google.com/maps/search/?api=1&query=${mapsQuery}` : undefined;
            const displayAddress = order.sellerAddress || locationUnavailable;

            return (
              <div key={order.id} className="card" style={{ boxShadow: 'var(--shadow-md)' }}>
                <div className="flex justify-between" style={{ gap: '1rem', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
                      <span className="badge badge-success" style={{ textTransform: 'none' }}>
                        {String(order.status || 'paid').toUpperCase()}
                      </span>
                      <span style={{ fontWeight: 900, fontSize: '1.05rem' }}>{order.crop}</span>
                      <span className="text-muted" style={{ fontWeight: 700 }}>{order.qty}</span>
                    </div>
                    <div className="text-muted" style={{ marginTop: '0.35rem', fontSize: '0.9rem' }}>
                      {t('orders.seller')} <strong style={{ color: 'var(--text-main)' }}>{order.sellerName || order.sellerPhone}</strong>
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', fontWeight: 900, color: 'var(--primary)' }}>
                      <IndianRupee size={16} />
                      Rs {Number(order.totalPrice || 0).toLocaleString('en-IN')}
                    </div>
                    <div className="text-muted" style={{ marginTop: '0.35rem', fontSize: '0.8rem', fontWeight: 700 }}>
                      TXN: {order.txId}
                    </div>
                  </div>
                </div>

                <div className="grid-cols-2" style={{ gap: '0.75rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem' }}>
                    <Calendar size={16} color="var(--text-muted)" />
                    <span className="text-muted" style={{ fontWeight: 700 }}>{formatDateTime(order.createdAt, dateLocale)}</span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem', minWidth: 0 }}>
                      <MapPin size={16} color="var(--text-muted)" />
                      <span className="text-muted" style={{ fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {displayAddress}
                      </span>
                    </div>
                    {mapsUrl && (
                      <a className="btn btn-secondary" href={mapsUrl} target="_blank" rel="noreferrer" style={{ padding: '0.45rem 0.75rem', fontSize: '0.85rem' }}>
                        {t('orders.map')} <ExternalLink size={16} />
                      </a>
                    )}
                  </div>
                </div>

                <div style={{ marginTop: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.65rem', color: 'var(--text-muted)', fontWeight: 700, fontSize: '0.85rem' }}>
                  <Package size={16} /> {t('orders.unitPrice')} Rs {Number(order.unitPrice || 0).toLocaleString('en-IN')}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
