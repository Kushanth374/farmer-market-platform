import React, { useState } from 'react';
import { ShoppingBag, Star, TrendingUp, Tags, Receipt } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { useTranslations } from '../i18n';
import { BillModal } from '../components/BillModal';
import sugarcaneImage from '../assets/sugarcane-botanical.webp';

const marketFallbackImages: Record<string, string> = {
  wheat: 'https://images.pexels.com/photos/9456236/pexels-photo-9456236.jpeg?auto=compress&cs=tinysrgb&w=1200',
  rice: 'https://images.pexels.com/photos/4110251/pexels-photo-4110251.jpeg?auto=compress&cs=tinysrgb&w=1200',
  cotton: 'https://images.pexels.com/photos/10287682/pexels-photo-10287682.jpeg?auto=compress&cs=tinysrgb&w=1200',
  sugarcane: sugarcaneImage,
  soybean: 'https://images.pexels.com/photos/7421208/pexels-photo-7421208.jpeg?auto=compress&cs=tinysrgb&w=1200',
  default: 'https://images.pexels.com/photos/2132250/pexels-photo-2132250.jpeg?auto=compress&cs=tinysrgb&w=1200',
};

const getMarketImageFallback = (crop: string) => {
  const normalized = crop.trim().toLowerCase();
  return marketFallbackImages[normalized] || marketFallbackImages.default;
};

const MarketCardImage: React.FC<{ crop: string; image?: string; height: string }> = ({ crop, image, height }) => {
  const fallbackSrc = getMarketImageFallback(crop);
  const [src, setSrc] = useState(image || fallbackSrc);

  React.useEffect(() => {
    setSrc(image || fallbackSrc);
  }, [image, fallbackSrc]);

  return (
    <img
      src={src}
      alt={crop}
      onError={() => {
        if (src !== fallbackSrc) {
          setSrc(fallbackSrc);
        }
      }}
      style={{
        width: '100%',
        height,
        borderRadius: '12px',
        marginBottom: '1rem',
        objectFit: 'cover',
      }}
    />
  );
};

export const Market: React.FC = () => {
  const { addToast, addMarketListing, marketListings, user, isMarketLive } = useAppContext();
  const { t } = useTranslations();
  const [activeTab, setActiveTab] = useState<'buy' | 'sell'>('buy');
  const [newListing, setNewListing] = useState({ 
    crop: user?.primaryCrop || '', 
    qty: '', 
    price: '', 
    details: '' 
  });
  const [selectedForBill, setSelectedForBill] = useState<any>(null);
  const myListings = user ? marketListings.filter((item) => item.ownerPhone === user.phone) : [];

  const toPhoneDigits = (phone: string) => phone.replace(/\D/g, '');

  const handleWhatsAppContact = (listingPhone: string, crop: string) => {
    const digits = toPhoneDigits(listingPhone);
    if (!digits) {
      addToast(t('toast.phoneUnavailable'), 'warning');
      return;
    }

    const message = encodeURIComponent(`Hello, I am interested in your ${crop} listing on KisanHub.`);
    window.open(`https://wa.me/${digits}?text=${message}`, '_blank');
  };

  const handleCallContact = (listingPhone: string) => {
    const digits = toPhoneDigits(listingPhone);
    if (!digits) {
      addToast(t('toast.phoneUnavailable'), 'warning');
      return;
    }

    window.location.href = `tel:${digits}`;
  };

  const handleCreateListing = (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      addToast(t('toast.registerFirst'), 'warning');
      return;
    }

    addMarketListing({
      crop: newListing.crop,
      qty: newListing.qty,
      price: `Rs ${newListing.price}/qtl`,
      details: newListing.details,
    });
    addToast(t('toast.listingPublished'), 'success');
    setNewListing({ crop: '', qty: '', price: '', details: '' });
    setActiveTab('buy');
  };

  const handlePlaceOrder = (listing: any) => {
    if (!user) {
      addToast(t('toast.registerFirst'), 'warning');
      return;
    }
    setSelectedForBill(listing);
    addToast(t('toast.orderPlaced') || 'Order placed successfully!', 'success');
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="heading-1">{t('market.title')}</h2>
          <p className="text-muted" style={{ fontSize: '0.85rem' }}>
            {isMarketLive ? 'Live listings sync every 30 seconds.' : 'Showing saved listings. Start the API server for live sync.'}
          </p>
        </div>
        <div style={{ display: 'flex', background: 'var(--surface)', borderRadius: '8px', border: '1px solid var(--border)', padding: '4px' }}>
          <button className={`btn ${activeTab === 'buy' ? '' : 'btn-secondary'}`} style={{ padding: '0.5rem 1rem', borderRadius: '4px', border: 'none', boxShadow: 'none' }} onClick={() => setActiveTab('buy')}>
            {t('market.buyerView')}
          </button>
          <button className={`btn ${activeTab === 'sell' ? '' : 'btn-secondary'}`} style={{ padding: '0.5rem 1rem', borderRadius: '4px', border: 'none', boxShadow: 'none' }} onClick={() => setActiveTab('sell')}>
            {t('market.sellProduce')}
          </button>
        </div>
      </div>

      {activeTab === 'buy' ? (
        <div>
          {user && myListings.length > 0 && (
            <div className="card mb-6" style={{ background: 'var(--bg-color)' }}>
              <h3 className="heading-1" style={{ fontSize: '1.15rem' }}>{t('market.myListings')}</h3>
              <p className="text-muted" style={{ marginBottom: '1rem' }}>{t('market.myListingsText')}</p>
              <div className="grid-cols-2">
                {myListings.map((item) => (
                  <div key={item.id} className="card" style={{ boxShadow: 'none' }}>
                    <MarketCardImage crop={item.crop} image={item.image} height="140px" />
                    <h4 style={{ fontWeight: 600, fontSize: '1.05rem', marginBottom: '0.5rem' }}>{item.crop}</h4>
                    <p className="text-muted" style={{ fontSize: '0.875rem' }}>{item.qty}</p>
                    <p style={{ fontWeight: 600, color: 'var(--primary)', margin: '0.4rem 0' }}>{item.price}</p>
                    <p className="text-muted" style={{ fontSize: '0.875rem' }}>{item.details || t('market.noDetails')}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="grid-cols-3">
            {marketListings.map((item) => (
              <div key={item.id} className="card" style={{ display: 'flex', flexDirection: 'column' }}>
                <MarketCardImage crop={item.crop} image={item.image} height="160px" />
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                  <div>
                    <h4 style={{ fontWeight: 600, fontSize: '1.1rem' }}>{item.crop}</h4>
                    <p className="text-muted" style={{ fontSize: '0.875rem' }}>{t('market.byFarmer', { name: item.farmer })}</p>
                  </div>
                  <span className="badge badge-success flex items-center gap-1">
                    <Star size={12} fill="currentColor" /> {item.rating}
                  </span>
                </div>
                <div style={{ background: 'var(--bg-color)', padding: '0.75rem', borderRadius: '8px', marginBottom: '1rem', flex: 1 }}>
                  <div className="flex justify-between mb-2">
                    <span className="text-muted" style={{ fontSize: '0.875rem' }}>{t('market.quantityAvailable')}</span>
                    <span style={{ fontWeight: 500 }}>{item.qty}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted" style={{ fontSize: '0.875rem' }}>{t('market.askingPrice')}</span>
                    <span style={{ fontWeight: 600, color: 'var(--primary)' }}>{item.price}</span>
                  </div>
                  {item.details && <p className="text-muted" style={{ fontSize: '0.875rem', marginTop: '0.75rem' }}>{item.details}</p>}
                </div>
                <div className="grid-cols-2" style={{ gap: '0.75rem', marginBottom: '0.75rem' }}>
                  <button className="btn btn-secondary w-full" type="button" onClick={() => handleWhatsAppContact(item.ownerPhone, item.crop)}>
                    <ShoppingBag size={16} /> {t('common.whatsapp')}
                  </button>
                  <button className="btn btn-secondary w-full" type="button" onClick={() => handleCallContact(item.ownerPhone)}>
                    {t('common.call')}
                  </button>
                </div>
                <button className="btn w-full" type="button" onClick={() => handlePlaceOrder(item)}>
                  <Receipt size={16} /> Place Order
                </button>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="card max-w-2xl mx-auto">
          <div className="flex items-center gap-2 mb-6" style={{ color: 'var(--primary)' }}>
            <Tags />
            <h3 className="heading-1" style={{ fontSize: '1.25rem', margin: 0, color: 'var(--text-main)' }}>{t('market.createListing')}</h3>
          </div>
          <form onSubmit={handleCreateListing}>
            <div className="input-group">
              <label className="input-label">{t('market.cropName')}</label>
              <select 
                className="input-field" 
                required 
                value={newListing.crop} 
                onChange={(e) => setNewListing({ ...newListing, crop: e.target.value })}
              >
                <option value="">{t('crop.select')}</option>
                <option value="Wheat">{t('crop.wheat')}</option>
                <option value="Rice">{t('crop.rice')}</option>
                <option value="Cotton">{t('crop.cotton')}</option>
                <option value="Sugarcane">{t('crop.sugarcane')}</option>
                <option value="Soybean">{t('crop.soybean')}</option>
              </select>
            </div>
            <div className="grid-cols-2 mb-4" style={{ gap: '1rem' }}>
              <div className="input-group mb-0">
                <label className="input-label">{t('market.quantity')}</label>
                <input type="text" className="input-field" placeholder={t('market.quantityPlaceholder')} required value={newListing.qty} onChange={(e) => setNewListing({ ...newListing, qty: e.target.value })} />
              </div>
              <div className="input-group mb-0">
                <label className="input-label">{t('market.expectedPrice')}</label>
                <input type="number" className="input-field" placeholder="Rs" required value={newListing.price} onChange={(e) => setNewListing({ ...newListing, price: e.target.value })} />
              </div>
            </div>
            <div className="input-group mb-6">
              <label className="input-label">{t('market.additionalDetails')}</label>
              <textarea className="input-field" rows={3} placeholder={t('market.detailsPlaceholder')} value={newListing.details} onChange={(e) => setNewListing({ ...newListing, details: e.target.value })}></textarea>
            </div>
            <button type="submit" className="btn w-full"><TrendingUp size={16} /> {t('market.publish')}</button>
          </form>
        </div>
      )}

      {selectedForBill && user && (
        <BillModal 
          listing={selectedForBill} 
          customer={user} 
          onClose={() => setSelectedForBill(null)} 
        />
      )}
    </div>
  );
};
