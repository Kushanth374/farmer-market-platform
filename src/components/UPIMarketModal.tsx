import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Smartphone, CheckCircle2, ShieldCheck, X, ShoppingCart, ArrowRight, Minus, Plus, MapPin, ExternalLink } from 'lucide-react';
import { useTranslations } from '../i18n';
import { MarketListing } from '../context/AppContext';
import { useAppContext } from '../context/AppContext';

interface UPIMarketModalProps {
  listing: MarketListing;
  onSuccess: (txId: string, quantity: string) => void;
  onClose: () => void;
}

export const UPIMarketModal: React.FC<UPIMarketModalProps> = ({ listing, onSuccess, onClose }) => {
  const { t, language } = useTranslations();
  const { accounts } = useAppContext();
  const [status, setStatus] = useState<'quantity' | 'scan' | 'verifying' | 'success'>('quantity');
  
  // Parse available quantity (e.g., "50 Quintals" -> 50)
  const maxQty = useMemo(() => {
    const parsed = parseInt(String(listing.qty).replace(/[^\d]/g, ''), 10);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
  }, [listing.qty]);

  const unit = useMemo(() => {
    const raw = String(listing.qty || '').trim();
    const parts = raw.split(/\s+/).filter(Boolean);
    if (parts.length >= 2) return parts.slice(1).join(' ');
    return t('market.units');
  }, [listing.qty, language]);
  const [selectedQty, setSelectedQty] = useState(1);

  // Extract numeric unit price from "Rs 2,200/qtl"
  const unitPrice = parseInt(listing.price.replace(/[^0-9]/g, '')) || 1000;
  const totalPrice = selectedQty * unitPrice;
  const formattedTotalPrice = `Rs ${totalPrice.toLocaleString()}`;

  const locationUnavailable = t('common.locationUnavailable');

  const sellerAddress = useMemo(() => {
    const fromListing = String(listing.address || '').trim();
    if (fromListing) return fromListing;

    const fromAccount = String(accounts[listing.ownerPhone]?.address || '').trim();
    return fromAccount || locationUnavailable;
  }, [accounts, listing.address, listing.ownerPhone, locationUnavailable]);

  const sellerMapsQuery = useMemo(() => encodeURIComponent(sellerAddress), [sellerAddress]);
  const googleMapsUrl = useMemo(
    () => `https://www.google.com/maps/search/?api=1&query=${sellerMapsQuery}`,
    [sellerMapsQuery],
  );

  const upiId = "kushanthgowda261@okaxis"; 
  const upiString = `upi://pay?pa=${upiId}&pn=Kisan%20Bandhu&am=${totalPrice}&cu=INR`;
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(upiString)}`;
  const verifyTimerRef = useRef<number | null>(null);
  const successTimerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (verifyTimerRef.current) {
        window.clearTimeout(verifyTimerRef.current);
      }
      if (successTimerRef.current) {
        window.clearTimeout(successTimerRef.current);
      }
    };
  }, []);

  const handleVerify = () => {
    if (status === 'verifying' || status === 'success') return;
    setStatus('verifying');
    verifyTimerRef.current = window.setTimeout(() => {
      setStatus('success');
      successTimerRef.current = window.setTimeout(() => {
        onSuccess(
          `TXN${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
          `${selectedQty} ${unit}`
        );
      }, 3400);
    }, 1800);
  };

  const modalContent = (
    <div
      className="modal-overlay"
      onClick={onClose}
      style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(15, 30, 20, 0.65)',
      backdropFilter: 'blur(12px)',
      display: 'grid',
      placeItems: 'center',
      zIndex: 1000,
      padding: '1rem'
    }}
    >
      <div
        className="card upi-market-modal-card"
        onClick={(e) => e.stopPropagation()}
        style={{
        width: 'min(420px, 100%)',
        padding: '0',
        overflow: 'hidden',
        border: '1px solid rgba(255, 255, 255, 0.4)',
        boxShadow: '0 20px 50px rgba(0,0,0,0.3)',
        animation: 'upiModalPop 320ms cubic-bezier(0.2, 0.8, 0.2, 1) both',
        height: 'min(92vh, 720px)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden'
      }}
      >
        <div style={{
          background: 'linear-gradient(135deg, #2f6f3e, #74a63b)',
          padding: '1rem 1.2rem',
          color: 'white',
          position: 'sticky',
          top: 0,
          zIndex: 2
        }}>
          <button 
            type="button"
            onClick={onClose}
            aria-label={t('bill.close')}
            style={{ 
              position: 'absolute', 
              right: '1rem', 
              top: '1rem', 
              background: 'rgba(255,255,255,0.2)', 
              border: 'none', 
              color: 'white', 
              borderRadius: '50%', 
              padding: '4px',
              cursor: 'pointer'
            }}
          >
            <X size={18} />
          </button>
          <div className="flex items-center gap-3">
            {status === 'quantity' ? <ShoppingCart size={24} /> : <Smartphone size={24} />}
            <div>
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700 }}>
                {status === 'quantity' ? t('market.selectQuantity') : t('payment.title')}
              </h3>
              <p style={{ margin: 0, fontSize: '0.8rem', opacity: 0.9 }}>
                {listing.crop} - {listing.farmer}
              </p>
            </div>
          </div>
        </div>

        <div style={{ padding: '1rem 1.2rem', overflow: 'hidden', flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
          {status === 'quantity' && (
            <div className="animate-fade-in upi-qty-screen-fit">
              <div className="upi-qty-header">
                <div>
                  <div className="upi-qty-title">{t('market.selectQuantity')}</div>
                  <div className="upi-qty-subtitle">
                    {t('market.available')}: <strong>{listing.qty}</strong>
                  </div>
                </div>
                <div className="upi-qty-unit-pill" title={unit}>
                  {unit}
                </div>
              </div>

              <div className="upi-qty-stepper-wrap" aria-label={t('market.selectQuantity')}>
                <button
                  type="button"
                  className="btn btn-secondary upi-qty-stepper-btn"
                  onClick={() => setSelectedQty((q) => Math.max(1, q - 1))}
                  disabled={selectedQty <= 1}
                  aria-label={t('upi.decreaseQty')}
                  title={t('upi.decreaseQty')}
                >
                  <Minus size={16} />
                </button>

                <div className="upi-qty-input-wrap">
                  <label className="upi-qty-input-label" htmlFor="upi-qty-input">
                    {t('upi.qtyShort')}
                  </label>
                  <input
                    id="upi-qty-input"
                    type="number"
                    inputMode="numeric"
                    min={1}
                    max={maxQty}
                    value={selectedQty}
                    onChange={(e) => {
                      const next = parseInt(e.target.value, 10);
                      if (!Number.isFinite(next)) {
                        setSelectedQty(1);
                        return;
                      }
                      setSelectedQty(Math.min(maxQty, Math.max(1, next)));
                    }}
                    className="input-field upi-qty-input"
                    aria-describedby="upi-qty-help"
                  />
                  <div id="upi-qty-help" className="upi-qty-help">
                    {t('upi.maxQty', { max: maxQty })}
                  </div>
                </div>

                <button
                  type="button"
                  className="btn btn-secondary upi-qty-stepper-btn"
                  onClick={() => setSelectedQty((q) => Math.min(maxQty, q + 1))}
                  disabled={selectedQty >= maxQty}
                  aria-label={t('upi.increaseQty')}
                  title={t('upi.increaseQty')}
                >
                  <Plus size={16} />
                </button>
              </div>

              <div className="upi-qty-breakdown" role="group" aria-label={t('upi.orderSummaryAria')}>
                <div className="upi-qty-breakdown-row">
                  <span className="upi-qty-breakdown-label">{t('market.askingPrice')}</span>
                  <span className="upi-qty-breakdown-value">Rs {unitPrice.toLocaleString()}/{unit}</span>
                </div>
                <div className="upi-qty-breakdown-row">
                  <span className="upi-qty-breakdown-label">{t('market.quantity')}</span>
                  <span className="upi-qty-breakdown-value">{selectedQty} {unit}</span>
                </div>
                <div className="upi-qty-breakdown-divider" />
                <div className="upi-qty-breakdown-row upi-qty-breakdown-total">
                  <span className="upi-qty-breakdown-label">{t('market.orderTotal')}</span>
                  <span className="upi-qty-breakdown-value">{formattedTotalPrice}</span>
                </div>
              </div>

              <div className="upi-qty-actions" role="group" aria-label={t('upi.sellerLocationTitle')}>
                <div className="upi-qty-location">
                  <div className="upi-qty-location-title">
                    <MapPin size={15} /> {t('upi.sellerLocationTitle')}
                  </div>
                  <div className="upi-qty-location-address">{sellerAddress}</div>
                </div>
                <div className="upi-qty-action-buttons">
                  <a
                    className="btn btn-secondary upi-qty-map-btn"
                    href={googleMapsUrl}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={t('upi.openMapsTitle')}
                    title={t('upi.openMapsTitle')}
                  >
                    {t('upi.openMaps')} <ExternalLink size={14} />
                  </a>
                  <button className="btn upi-qty-pay-btn" onClick={() => setStatus('scan')}>
                    {t('common.applyNow')} <ArrowRight size={16} />
                  </button>
                </div>
              </div>
            </div>
          )}

          {status === 'scan' && (
            <div className="animate-fade-in">
              <div className="upi-pay-layout">
                <div className="upi-pay-scroll">
                  <div className="upi-pay-card upi-pay-card--pickup">
                    <div className="upi-pay-card-head">
                      <div className="upi-pay-card-title">
                        <MapPin size={16} /> {t('upi.pickupLocation')}
                      </div>
                      <a
                        className="upi-pay-inline-link"
                        href={googleMapsUrl}
                        target="_blank"
                        rel="noreferrer"
                        aria-label={t('upi.openMapsTitle')}
                        title={t('upi.openMapsTitle')}
                      >
                        {t('orders.map')} <ExternalLink size={14} />
                      </a>
                    </div>
                    <div className="upi-pay-card-subtitle">{sellerAddress}</div>
                  </div>

                  <div className="upi-pay-qr-wrap" aria-label={t('upi.qrCodeAlt')}>
                    <div className="upi-pay-qr-card">
                      <img className="upi-pay-qr" src={qrUrl} alt={t('upi.qrCodeAlt')} />
                    </div>
                  </div>

                  <div className="upi-pay-card upi-pay-card--amount" role="group" aria-label={t('payment.title')}>
                    <div className="upi-pay-amount-kicker">{t('upi.amount')}</div>
                    <div className="upi-pay-amount">{formattedTotalPrice}</div>
                    <div className="upi-pay-upi">{t('upi.id', { id: upiId })}</div>
                  </div>

                  <div className="upi-pay-tip" role="note">
                    {t('upi.instruction')}
                  </div>
                </div>

                <div className="upi-pay-cta-wrap">
                  <button className="btn w-full upi-pay-cta" onClick={handleVerify}>
                    <ShieldCheck size={18} /> {t('upi.verify')}
                  </button>
                </div>
              </div>
            </div>
          )}

          {status === 'verifying' && (
            <div className="animate-fade-in upi-status-screen">
              <div className="upi-status-processing-wrap">
                <div className="upi-status-glow" />
                <div className="upi-status-orbit">
                  <div className="upi-status-orbit-dot" />
                </div>
                <div className="upi-status-core-ring" />
              </div>
              <p className="upi-status-title">{t('upi.waiting')}</p>
              <p className="upi-status-subtitle">{t('payment.title')}</p>
              <div className="upi-status-progress" aria-hidden="true">
                <div className="upi-status-progress-bar" />
              </div>
            </div>
          )}

          {status === 'success' && (
            <div className="animate-fade-in upi-status-screen">
              <div className="upi-success-wrap">
                <div className="upi-success-ripple upi-success-ripple--one" />
                <div className="upi-success-ripple upi-success-ripple--two" />
                <div className="upi-success-mark">
                  <CheckCircle2 size={68} />
                </div>
              </div>
              <h4 className="upi-status-title">{t('payment.success')}</h4>
              <p className="upi-status-subtitle">{t('upi.redirectingInvoice')}</p>
            </div>
          )}
        </div>

        {status !== 'quantity' && status !== 'scan' && (
          <div style={{ 
            padding: '0.85rem 1rem', 
            background: 'var(--bg-color)', 
            fontSize: '0.75rem', 
            textAlign: 'center',
            color: 'var(--text-muted)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '4px'
          }}>
            <ShieldCheck size={14} /> {t('upi.securedFooter')}
          </div>
        )}
      </div>

      <style>{`
        .upi-qty-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 1rem;
          margin-bottom: 0.8rem;
        }

        .upi-market-modal-card {
          margin: 0 auto;
        }

        .upi-qty-screen-fit {
          display: grid;
          gap: 0.75rem;
          height: 100%;
          align-content: start;
          grid-template-rows: auto auto auto 1fr;
        }

        .upi-qty-title {
          font-weight: 800;
          font-size: 1rem;
          color: var(--text-main);
          margin-bottom: 0.25rem;
        }

        .upi-qty-subtitle {
          font-size: 0.85rem;
          color: var(--text-muted);
        }

        .upi-qty-unit-pill {
          flex-shrink: 0;
          padding: 0.35rem 0.6rem;
          border-radius: 999px;
          font-size: 0.75rem;
          font-weight: 800;
          letter-spacing: 0.02em;
          color: var(--primary);
          background: rgba(47, 111, 62, 0.08);
          border: 1px solid rgba(42, 79, 51, 0.12);
          max-width: 45%;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .upi-qty-stepper-wrap {
          display: grid;
          grid-template-columns: 44px 1fr 44px;
          align-items: center;
          gap: 0.75rem;
          margin-bottom: 0.65rem;
        }

        .upi-qty-stepper-btn {
          padding: 0.55rem;
          width: 44px;
          height: 44px;
          border-radius: 12px;
        }

        .upi-qty-stepper-btn:disabled {
          opacity: 0.55;
          cursor: not-allowed;
          transform: none;
        }

        .upi-qty-input-wrap {
          display: grid;
          gap: 0.35rem;
        }

        .upi-qty-input-label {
          font-size: 0.75rem;
          font-weight: 800;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: var(--text-muted);
        }

        .upi-qty-input {
          text-align: center;
          font-size: 1.15rem;
          font-weight: 800;
          padding: 0.7rem 0.9rem;
        }

        .upi-qty-help {
          font-size: 0.75rem;
          color: var(--text-muted);
        }

        .upi-qty-breakdown {
          background: rgba(255, 255, 255, 0.72);
          border: 1px solid rgba(42, 79, 51, 0.12);
          border-radius: 14px;
          padding: 0.85rem;
          box-shadow: 0 8px 24px rgba(16, 35, 29, 0.06);
          margin: 0.15rem 0 0.3rem;
        }

        .upi-qty-breakdown-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 0.75rem;
          padding: 0.35rem 0;
          font-size: 0.9rem;
        }

        .upi-qty-breakdown-label {
          color: var(--text-muted);
          font-weight: 600;
        }

        .upi-qty-breakdown-value {
          color: var(--text-main);
          font-weight: 800;
          text-align: right;
        }

        .upi-qty-breakdown-divider {
          height: 1px;
          background: rgba(42, 79, 51, 0.12);
          margin: 0.6rem 0;
        }

        .upi-qty-breakdown-total .upi-qty-breakdown-value {
          color: var(--primary);
          font-size: 1.15rem;
        }

        .upi-qty-actions {
          align-self: end;
          background: rgba(255, 255, 255, 0.72);
          border: 1px solid rgba(42, 79, 51, 0.12);
          border-radius: 14px;
          padding: 0.75rem;
          box-shadow: 0 8px 24px rgba(16, 35, 29, 0.06);
          display: grid;
          gap: 0.7rem;
        }

        .upi-qty-location-title {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          color: var(--text-main);
          font-size: 0.85rem;
          font-weight: 800;
          margin-bottom: 0.2rem;
        }

        .upi-qty-location-address {
          color: var(--text-muted);
          font-size: 0.8rem;
          font-weight: 600;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .upi-qty-action-buttons {
          display: grid;
          gap: 0.6rem;
          grid-template-columns: 1fr 1fr;
        }

        .upi-qty-map-btn,
        .upi-qty-pay-btn {
          width: 100%;
          padding: 0.75rem 0.7rem;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 0.4rem;
          font-size: 0.86rem;
        }

        .upi-seller-location-scan {
          text-align: left;
          background: rgba(47, 111, 62, 0.05);
          border: 1px dashed rgba(47, 111, 62, 0.45);
          padding: 1rem;
          border-radius: 14px;
          margin-bottom: 1.25rem;
        }

        .upi-pay-layout {
          display: flex;
          flex-direction: column;
          gap: 0.85rem;
          text-align: left;
          height: 100%;
          min-height: 0;
          flex: 1;
        }

        .upi-pay-scroll {
          overflow-y: auto;
          padding-right: 0.2rem;
          display: grid;
          gap: 0.85rem;
          min-height: 0;
        }

        .upi-pay-cta-wrap {
          flex-shrink: 0;
          padding-top: 0.15rem;
          background: linear-gradient(180deg, rgba(255,255,255,0), rgba(255,255,255,0.88) 32%);
          position: sticky;
          bottom: 0;
        }

        .upi-pay-card {
          background: rgba(255, 255, 255, 0.78);
          border: 1px solid rgba(42, 79, 51, 0.12);
          border-radius: 16px;
          padding: 1rem;
          box-shadow: 0 10px 26px rgba(16, 35, 29, 0.06);
        }

        .upi-pay-card-head {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 0.75rem;
          margin-bottom: 0.5rem;
        }

        .upi-pay-card-title {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          font-weight: 900;
          color: var(--text-main);
          font-size: 0.95rem;
        }

        .upi-pay-card-subtitle {
          color: var(--text-muted);
          font-size: 0.9rem;
          font-weight: 700;
          overflow-wrap: anywhere;
        }

        .upi-pay-inline-link {
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
          font-weight: 800;
          font-size: 0.85rem;
          color: var(--primary);
          text-decoration: none;
          padding: 0.25rem 0.5rem;
          border-radius: 10px;
          background: rgba(47, 111, 62, 0.06);
          border: 1px solid rgba(42, 79, 51, 0.1);
        }

        .upi-pay-inline-link:hover {
          background: rgba(47, 111, 62, 0.1);
        }

        .upi-pay-qr-wrap {
          display: grid;
          place-items: center;
        }

        .upi-pay-qr-card {
          background: white;
          padding: 0.9rem;
          border-radius: 18px;
          border: 1px solid rgba(15, 23, 42, 0.08);
          box-shadow: 0 16px 38px rgba(0,0,0,0.1);
        }

        .upi-pay-qr {
          width: 190px;
          height: 190px;
          display: block;
        }

        .upi-pay-card--amount {
          text-align: center;
          padding: 1.1rem 1rem;
          background: linear-gradient(180deg, rgba(47, 111, 62, 0.06), rgba(255, 255, 255, 0.78));
        }

        .upi-pay-amount-kicker {
          font-size: 0.8rem;
          font-weight: 900;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: var(--text-muted);
          margin-bottom: 0.4rem;
        }

        .upi-pay-amount {
          margin: 0;
          font-size: 1.8rem;
          font-weight: 950;
          color: var(--primary);
          letter-spacing: -0.02em;
        }

        .upi-pay-upi {
          margin-top: 0.35rem;
          font-size: 0.8rem;
          color: var(--text-muted);
          font-weight: 700;
          overflow-wrap: anywhere;
        }

        .upi-pay-tip {
          background: rgba(47, 111, 62, 0.05);
          border: 1px dashed rgba(47, 111, 62, 0.35);
          padding: 0.9rem 1rem;
          border-radius: 16px;
          color: var(--text-main);
          font-weight: 700;
          font-size: 0.9rem;
          text-align: center;
        }

        .upi-pay-cta {
          padding: 0.9rem 1rem;
          border-radius: 14px;
        }

        .upi-status-screen {
          padding: 2.1rem 0 1.4rem;
          display: grid;
          justify-items: center;
          text-align: center;
          gap: 0.8rem;
        }

        .upi-status-orbit {
          width: 72px;
          height: 72px;
          border: 4px solid rgba(47, 111, 62, 0.2);
          border-top-color: var(--primary);
          border-radius: 999px;
          animation: upiSpin 0.9s linear infinite;
          position: relative;
        }

        .upi-status-orbit-dot {
          position: absolute;
          top: 6px;
          left: 50%;
          transform: translateX(-50%);
          width: 8px;
          height: 8px;
          border-radius: 999px;
          background: var(--primary);
          box-shadow: 0 0 0 8px rgba(47, 111, 62, 0.13);
        }

        .upi-status-processing-wrap {
          position: relative;
          width: 96px;
          height: 96px;
          display: grid;
          place-items: center;
        }

        .upi-status-glow {
          position: absolute;
          inset: 0;
          border-radius: 999px;
          background: radial-gradient(circle, rgba(47,111,62,0.28), rgba(47,111,62,0.04) 62%, transparent 78%);
          animation: upiPulseGlow 1.5s ease-in-out infinite;
        }

        .upi-status-core-ring {
          position: absolute;
          width: 58px;
          height: 58px;
          border-radius: 999px;
          border: 2px solid rgba(47, 111, 62, 0.28);
          border-bottom-color: rgba(47, 111, 62, 0.06);
          animation: upiSpinReverse 1.2s linear infinite;
        }

        .upi-status-title {
          margin: 0;
          font-size: 1.08rem;
          font-weight: 800;
          color: var(--text-main);
        }

        .upi-status-subtitle {
          margin: 0;
          color: var(--text-muted);
          font-size: 0.9rem;
          font-weight: 600;
        }

        .upi-status-progress {
          width: min(280px, 82%);
          height: 8px;
          border-radius: 999px;
          background: rgba(42, 79, 51, 0.12);
          overflow: hidden;
        }

        .upi-status-progress-bar {
          width: 55%;
          height: 100%;
          border-radius: 999px;
          background: linear-gradient(90deg, #2f6f3e, #74a63b);
          animation: upiProgress 1.2s ease-in-out infinite;
        }

        .upi-success-wrap {
          position: relative;
          width: 104px;
          height: 104px;
          display: grid;
          place-items: center;
        }

        .upi-success-ripple {
          position: absolute;
          inset: 0;
          border-radius: 999px;
          border: 2px solid rgba(34, 197, 94, 0.3);
          animation: upiSuccessRipple 1.8s ease-out infinite;
        }

        .upi-success-ripple--two {
          animation-delay: 0.55s;
        }

        .upi-success-mark {
          color: #22c55e;
          animation: upiSuccessPop 420ms cubic-bezier(0.2, 0.8, 0.2, 1) both;
          filter: drop-shadow(0 10px 16px rgba(34, 197, 94, 0.24));
        }

        @keyframes upiSpin {
          to {
            transform: rotate(360deg);
          }
        }

        @keyframes upiProgress {
          0% {
            transform: translateX(-120%);
          }
          100% {
            transform: translateX(260%);
          }
        }

        @keyframes upiPulseGlow {
          0%, 100% {
            transform: scale(0.92);
            opacity: 0.75;
          }
          50% {
            transform: scale(1.04);
            opacity: 1;
          }
        }

        @keyframes upiSpinReverse {
          to {
            transform: rotate(-360deg);
          }
        }

        @keyframes upiSuccessPop {
          0% {
            opacity: 0;
            transform: scale(0.6);
          }
          60% {
            transform: scale(1.08);
          }
          100% {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes upiSuccessRipple {
          0% {
            transform: scale(0.75);
            opacity: 0.9;
          }
          100% {
            transform: scale(1.22);
            opacity: 0;
          }
        }

        @keyframes upiModalPop {
          0% {
            opacity: 0;
            transform: translateY(18px) scale(0.97);
          }
          100% {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @media (max-width: 640px) {
          .upi-market-modal-card {
            width: 100%;
            height: min(94vh, 700px) !important;
          }

          .upi-qty-action-buttons {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );

  return createPortal(modalContent, document.body);
};
