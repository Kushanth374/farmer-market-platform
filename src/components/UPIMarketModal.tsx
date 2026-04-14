import React, { useMemo, useState } from 'react';
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
  const { t } = useTranslations();
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
    return 'Units';
  }, [listing.qty]);
  const [selectedQty, setSelectedQty] = useState(1);

  // Extract numeric unit price from "Rs 2,200/qtl"
  const unitPrice = parseInt(listing.price.replace(/[^0-9]/g, '')) || 1000;
  const totalPrice = selectedQty * unitPrice;
  const formattedTotalPrice = `Rs ${totalPrice.toLocaleString()}`;

  const sellerAddress = useMemo(() => {
    const fromListing = String(listing.address || '').trim();
    if (fromListing) return fromListing;

    const fromAccount = String(accounts[listing.ownerPhone]?.address || '').trim();
    return fromAccount || 'Location unavailable';
  }, [accounts, listing.address, listing.ownerPhone]);

  const sellerMapsQuery = useMemo(() => encodeURIComponent(sellerAddress), [sellerAddress]);
  const googleMapsUrl = useMemo(
    () => `https://www.google.com/maps/search/?api=1&query=${sellerMapsQuery}`,
    [sellerMapsQuery],
  );
  const googleMapsEmbedUrl = useMemo(
    () => `https://www.google.com/maps?q=${sellerMapsQuery}&output=embed`,
    [sellerMapsQuery],
  );

  const upiId = "kushanthgowda261@okaxis"; 
  const upiString = `upi://pay?pa=${upiId}&pn=Kisan%20Bandhu&am=${totalPrice}&cu=INR`;
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(upiString)}`;

  const handleVerify = () => {
    setStatus('verifying');
    setTimeout(() => {
      setStatus('success');
      setTimeout(() => {
        onSuccess(
          `TXN${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
          `${selectedQty} ${unit}`
        );
      }, 1500);
    }, 2000);
  };

  return (
    <div className="modal-overlay" style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(15, 30, 20, 0.65)',
      backdropFilter: 'blur(12px)',
      display: 'grid',
      placeItems: 'center',
      zIndex: 1000,
      padding: '1rem'
    }}>
      <div className="card" style={{
        width: 'min(420px, 100%)',
        padding: '0',
        overflow: 'hidden',
        border: '1px solid rgba(255, 255, 255, 0.4)',
        boxShadow: '0 20px 50px rgba(0,0,0,0.3)',
        animation: 'sectionLiftIn 0.5s cubic-bezier(0.2, 0.8, 0.2, 1) both'
      }}>
        <div style={{
          background: 'linear-gradient(135deg, #2f6f3e, #74a63b)',
          padding: '1.5rem',
          color: 'white',
          position: 'relative'
        }}>
          <button 
            onClick={onClose}
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

        <div style={{ padding: '1.75rem' }}>
          {status === 'quantity' && (
            <div className="animate-fade-in">
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
                  aria-label="Decrease quantity"
                  title="Decrease"
                >
                  <Minus size={16} />
                </button>

                <div className="upi-qty-input-wrap">
                  <label className="upi-qty-input-label" htmlFor="upi-qty-input">
                    Qty
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
                    Max {maxQty}
                  </div>
                </div>

                <button
                  type="button"
                  className="btn btn-secondary upi-qty-stepper-btn"
                  onClick={() => setSelectedQty((q) => Math.min(maxQty, q + 1))}
                  disabled={selectedQty >= maxQty}
                  aria-label="Increase quantity"
                  title="Increase"
                >
                  <Plus size={16} />
                </button>
              </div>

              <div className="upi-qty-breakdown" role="group" aria-label="Order summary">
                <div className="upi-qty-breakdown-row">
                  <span className="upi-qty-breakdown-label">{t('market.askingPrice')}</span>
                  <span className="upi-qty-breakdown-value">Rs {unitPrice.toLocaleString()}/{unit}</span>
                </div>
                <div className="upi-qty-breakdown-row">
                  <span className="upi-qty-breakdown-label">Quantity</span>
                  <span className="upi-qty-breakdown-value">{selectedQty} {unit}</span>
                </div>
                <div className="upi-qty-breakdown-divider" />
                <div className="upi-qty-breakdown-row upi-qty-breakdown-total">
                  <span className="upi-qty-breakdown-label">{t('market.orderTotal')}</span>
                  <span className="upi-qty-breakdown-value">{formattedTotalPrice}</span>
                </div>
              </div>

              <div className="upi-seller-location" role="group" aria-label="Seller location">
                <div className="upi-seller-location-head">
                  <div className="upi-seller-location-title">
                    <MapPin size={16} /> Seller location
                  </div>
                  <a
                    className="upi-seller-location-link"
                    href={googleMapsUrl}
                    target="_blank"
                    rel="noreferrer"
                    aria-label="Open seller location in Google Maps"
                    title="Open in Google Maps"
                  >
                    Open <ExternalLink size={14} />
                  </a>
                </div>
                <div className="upi-seller-location-address">{sellerAddress}</div>
                {sellerAddress !== 'Location unavailable' && (
                  <div className="upi-seller-location-map">
                    <iframe
                      title="Seller location map"
                      src={googleMapsEmbedUrl}
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                      style={{ width: '100%', height: '100%', border: 0, borderRadius: '12px' }}
                    />
                  </div>
                )}
              </div>

              <button className="btn w-full" onClick={() => setStatus('scan')}>
                {t('common.applyNow')} <ArrowRight size={18} />
              </button>
            </div>
          )}

          {status === 'scan' && (
            <div className="animate-fade-in">
              <div className="upi-pay-layout">
                <div className="upi-pay-card upi-pay-card--pickup">
                  <div className="upi-pay-card-head">
                    <div className="upi-pay-card-title">
                      <MapPin size={16} /> Pickup location
                    </div>
                    <a
                      className="upi-pay-inline-link"
                      href={googleMapsUrl}
                      target="_blank"
                      rel="noreferrer"
                      aria-label="Open pickup location in Google Maps"
                      title="Open in Google Maps"
                    >
                      Maps <ExternalLink size={14} />
                    </a>
                  </div>
                  <div className="upi-pay-card-subtitle">{sellerAddress}</div>
                </div>

                <div className="upi-pay-qr-wrap" aria-label="UPI QR code">
                  <div className="upi-pay-qr-card">
                    <img className="upi-pay-qr" src={qrUrl} alt="UPI QR Code" />
                  </div>
                </div>

                <div className="upi-pay-card upi-pay-card--amount" role="group" aria-label="Payment summary">
                  <div className="upi-pay-amount-kicker">{t('upi.amount')}</div>
                  <div className="upi-pay-amount">{formattedTotalPrice}</div>
                  <div className="upi-pay-upi">{t('upi.id', { id: upiId })}</div>
                </div>

                <div className="upi-pay-tip" role="note">
                  {t('upi.instruction')}
                </div>

                <button className="btn w-full upi-pay-cta" onClick={handleVerify}>
                  <ShieldCheck size={18} /> {t('upi.verify')}
                </button>
              </div>
            </div>
          )}

          {status === 'verifying' && (
            <div className="animate-fade-in" style={{ padding: '3rem 0' }}>
              <div 
                className="app-loader-ring" 
                style={{ 
                  position: 'relative', 
                  width: '60px', 
                  height: '60px', 
                  margin: '0 auto 1.5rem' 
                }} 
              />
              <p style={{ fontWeight: 600, color: 'var(--text-main)' }}>{t('upi.waiting')}</p>
            </div>
          )}

          {status === 'success' && (
            <div className="animate-fade-in" style={{ padding: '2rem 0' }}>
              <div style={{ color: '#22c55e', marginBottom: '1rem' }}>
                <CheckCircle2 size={64} style={{ margin: '0 auto' }} />
              </div>
              <h4 style={{ fontSize: '1.25rem', fontWeight: 700, margin: '0 0 0.5rem 0' }}>{t('payment.success')}</h4>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Redirecting to your invoice...</p>
            </div>
          )}
        </div>

        <div style={{ 
          padding: '1rem', 
          background: 'var(--bg-color)', 
          fontSize: '0.75rem', 
          textAlign: 'center',
          color: 'var(--text-muted)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '4px'
        }}>
          <ShieldCheck size={14} /> Secured by Kisan Bandhu UPI Gateway
        </div>
      </div>

      <style>{`
        .upi-qty-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 1rem;
          margin-bottom: 1.25rem;
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
          margin-bottom: 1rem;
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
          padding: 1rem;
          box-shadow: 0 8px 24px rgba(16, 35, 29, 0.06);
          margin: 1rem 0 1.25rem;
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

        .upi-seller-location {
          background: rgba(255, 255, 255, 0.72);
          border: 1px solid rgba(42, 79, 51, 0.12);
          border-radius: 14px;
          padding: 1rem;
          box-shadow: 0 8px 24px rgba(16, 35, 29, 0.06);
          margin: 0 0 1.25rem;
          text-align: left;
        }

        .upi-seller-location-head {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 0.75rem;
          margin-bottom: 0.6rem;
        }

        .upi-seller-location-title {
          display: inline-flex;
          align-items: center;
          gap: 0.45rem;
          font-weight: 900;
          color: var(--text-main);
          font-size: 0.95rem;
        }

        .upi-seller-location-link {
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
          font-weight: 800;
          font-size: 0.85rem;
          color: var(--primary);
          text-decoration: none;
          padding: 0.25rem 0.4rem;
          border-radius: 8px;
        }

        .upi-seller-location-link:hover {
          background: rgba(47, 111, 62, 0.08);
        }

        .upi-seller-location-address {
          color: var(--text-muted);
          font-size: 0.9rem;
          font-weight: 600;
        }

        .upi-seller-location-map {
          margin-top: 0.85rem;
          width: 100%;
          height: 180px;
          border-radius: 12px;
          overflow: hidden;
          border: 1px solid rgba(42, 79, 51, 0.12);
          background: rgba(255, 255, 255, 0.75);
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
          display: grid;
          gap: 1rem;
          text-align: left;
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
      `}</style>
    </div>
  );
};
