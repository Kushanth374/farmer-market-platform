import React, { useMemo, useState } from 'react';
import { Shield, Users, Store, Trash2, Save, RotateCcw, PencilLine } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { useTranslations } from '../i18n';

type AccountDraft = {
  name: string;
  address: string;
  landSize: string;
  primaryCrop: string;
};

type ListingDraft = {
  crop: string;
  qty: string;
  price: string;
  details: string;
};

export const Admin: React.FC = () => {
  const { t } = useTranslations();
  const {
    accounts,
    marketListings,
    updateAccount,
    removeAccount,
    updateMarketListing,
    removeMarketListing,
    resetMarketListings,
    addToast,
  } = useAppContext();

  const [editingPhone, setEditingPhone] = useState<string | null>(null);
  const [accountDraft, setAccountDraft] = useState<AccountDraft | null>(null);
  const [editingListingId, setEditingListingId] = useState<number | null>(null);
  const [listingDraft, setListingDraft] = useState<ListingDraft | null>(null);

  const accountsList = useMemo(
    () =>
      Object.entries(accounts).map(([phone, account]) => ({
        phone,
        name: account.name,
        address: account.address,
        landSize: account.landSize,
        primaryCrop: account.primaryCrop,
      })),
    [accounts]
  );

  const startAccountEdit = (phone: string) => {
    const target = accounts[phone];
    if (!target) return;
    setEditingPhone(phone);
    setAccountDraft({
      name: target.name,
      address: target.address,
      landSize: target.landSize,
      primaryCrop: target.primaryCrop,
    });
  };

  const saveAccount = async () => {
    if (!editingPhone || !accountDraft) return;
    const success = await updateAccount(editingPhone, accountDraft);
    if (!success) {
      addToast(t('admin.toastAccountUpdateFailed'), 'error');
      return;
    }
    addToast(t('admin.toastAccountUpdated'), 'success');
    setEditingPhone(null);
    setAccountDraft(null);
  };

  const startListingEdit = (id: number) => {
    const target = marketListings.find((item) => item.id === id);
    if (!target) return;
    setEditingListingId(id);
    setListingDraft({
      crop: target.crop,
      qty: target.qty,
      price: target.price,
      details: target.details,
    });
  };

  const saveListing = () => {
    if (editingListingId === null || !listingDraft) return;
    updateMarketListing(editingListingId, listingDraft);
    addToast(t('admin.toastListingUpdated'), 'success');
    setEditingListingId(null);
    setListingDraft(null);
  };

  return (
    <div className="max-w-4xl mx-auto pb-12">
      <div className="card mb-6" style={{ background: 'linear-gradient(to right, #1e293b, #0f766e)', color: 'white', border: 'none' }}>
        <div className="flex items-center gap-3">
          <Shield size={24} />
          <div>
            <h2 className="heading-1" style={{ color: 'white', marginBottom: '0.3rem' }}>{t('admin.title')}</h2>
            <p style={{ opacity: 0.9, margin: 0 }}>{t('admin.subtitle')}</p>
          </div>
        </div>
      </div>

      <div className="grid-cols-3 mb-6">
        <div className="card">
          <p className="text-muted" style={{ fontSize: '0.8rem', textTransform: 'uppercase' }}>{t('admin.registeredUsers')}</p>
          <h3 style={{ fontSize: '1.5rem', margin: 0 }}>{accountsList.length}</h3>
        </div>
        <div className="card">
          <p className="text-muted" style={{ fontSize: '0.8rem', textTransform: 'uppercase' }}>{t('admin.activeListings')}</p>
          <h3 style={{ fontSize: '1.5rem', margin: 0 }}>{marketListings.length}</h3>
        </div>
        <div className="card">
          <p className="text-muted" style={{ fontSize: '0.8rem', textTransform: 'uppercase' }}>{t('admin.adminActions')}</p>
          <button
            className="btn btn-secondary w-full"
            type="button"
            onClick={async () => {
              await resetMarketListings();
              addToast(t('admin.toastListingsReset'), 'info');
            }}
          >
            <RotateCcw size={14} /> {t('admin.resetListings')}
          </button>
        </div>
      </div>

      <div className="card mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Users size={20} />
          <h3 className="heading-1" style={{ fontSize: '1.1rem', margin: 0 }}>{t('admin.manageUsers')}</h3>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--border)' }}>
                <th style={{ padding: '0.6rem' }}>{t('admin.name')}</th>
                <th style={{ padding: '0.6rem' }}>{t('admin.phone')}</th>
                <th style={{ padding: '0.6rem' }}>{t('admin.address')}</th>
                <th style={{ padding: '0.6rem' }}>{t('admin.land')}</th>
                <th style={{ padding: '0.6rem' }}>{t('admin.crop')}</th>
                <th style={{ padding: '0.6rem' }}>{t('admin.actions')}</th>
              </tr>
            </thead>
            <tbody>
              {accountsList.map((account) => {
                const isEditing = editingPhone === account.phone;
                return (
                  <tr key={account.phone} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '0.6rem' }}>
                      {isEditing ? (
                        <input
                          className="input-field"
                          value={accountDraft?.name || ''}
                          onChange={(e) => setAccountDraft((prev) => prev ? { ...prev, name: e.target.value } : prev)}
                        />
                      ) : (
                        account.name
                      )}
                    </td>
                    <td style={{ padding: '0.6rem' }}>{account.phone}</td>
                    <td style={{ padding: '0.6rem', minWidth: '200px' }}>
                      {isEditing ? (
                        <input
                          className="input-field"
                          value={accountDraft?.address || ''}
                          onChange={(e) => setAccountDraft((prev) => prev ? { ...prev, address: e.target.value } : prev)}
                        />
                      ) : (
                        account.address
                      )}
                    </td>
                    <td style={{ padding: '0.6rem', minWidth: '120px' }}>
                      {isEditing ? (
                        <input
                          className="input-field"
                          value={accountDraft?.landSize || ''}
                          onChange={(e) => setAccountDraft((prev) => prev ? { ...prev, landSize: e.target.value } : prev)}
                        />
                      ) : (
                        account.landSize
                      )}
                    </td>
                    <td style={{ padding: '0.6rem', minWidth: '140px' }}>
                      {isEditing ? (
                        <input
                          className="input-field"
                          value={accountDraft?.primaryCrop || ''}
                          onChange={(e) => setAccountDraft((prev) => prev ? { ...prev, primaryCrop: e.target.value } : prev)}
                        />
                      ) : (
                        account.primaryCrop
                      )}
                    </td>
                    <td style={{ padding: '0.6rem', minWidth: '180px' }}>
                      <div className="flex items-center gap-2">
                        {isEditing ? (
                          <>
                            <button className="btn btn-secondary" type="button" onClick={saveAccount}>
                              <Save size={14} /> {t('admin.save')}
                            </button>
                            <button
                              className="btn btn-secondary"
                              type="button"
                              onClick={() => {
                                setEditingPhone(null);
                                setAccountDraft(null);
                              }}
                            >
                              {t('admin.cancel')}
                            </button>
                          </>
                        ) : (
                          <button className="btn btn-secondary" type="button" onClick={() => startAccountEdit(account.phone)}>
                            <PencilLine size={14} /> {t('admin.edit')}
                          </button>
                        )}
                        <button
                          className="btn btn-secondary"
                          type="button"
                          onClick={async () => {
                            if (!window.confirm(t('admin.confirmDeleteAccount', { name: account.name }))) return;
                            const success = await removeAccount(account.phone);
                            if (!success) {
                              addToast(t('admin.toastAccountRemoveFailed'), 'error');
                              return;
                            }
                            addToast(t('admin.toastAccountRemoved'), 'warning');
                            if (editingPhone === account.phone) {
                              setEditingPhone(null);
                              setAccountDraft(null);
                            }
                          }}
                        >
                          <Trash2 size={14} /> {t('admin.delete')}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {accountsList.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ padding: '1rem', textAlign: 'center' }} className="text-muted">
                    {t('admin.noUsers')}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card">
        <div className="flex items-center gap-2 mb-4">
          <Store size={20} />
          <h3 className="heading-1" style={{ fontSize: '1.1rem', margin: 0 }}>{t('admin.manageListings')}</h3>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--border)' }}>
                <th style={{ padding: '0.6rem' }}>{t('admin.crop')}</th>
                <th style={{ padding: '0.6rem' }}>{t('admin.qty')}</th>
                <th style={{ padding: '0.6rem' }}>{t('admin.price')}</th>
                <th style={{ padding: '0.6rem' }}>{t('admin.farmer')}</th>
                <th style={{ padding: '0.6rem' }}>{t('admin.details')}</th>
                <th style={{ padding: '0.6rem' }}>{t('admin.actions')}</th>
              </tr>
            </thead>
            <tbody>
              {marketListings.map((listing) => {
                const isEditing = editingListingId === listing.id;
                return (
                  <tr key={listing.id} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '0.6rem', minWidth: '120px' }}>
                      {isEditing ? (
                        <input
                          className="input-field"
                          value={listingDraft?.crop || ''}
                          onChange={(e) => setListingDraft((prev) => prev ? { ...prev, crop: e.target.value } : prev)}
                        />
                      ) : (
                        listing.crop
                      )}
                    </td>
                    <td style={{ padding: '0.6rem', minWidth: '120px' }}>
                      {isEditing ? (
                        <input
                          className="input-field"
                          value={listingDraft?.qty || ''}
                          onChange={(e) => setListingDraft((prev) => prev ? { ...prev, qty: e.target.value } : prev)}
                        />
                      ) : (
                        listing.qty
                      )}
                    </td>
                    <td style={{ padding: '0.6rem', minWidth: '130px' }}>
                      {isEditing ? (
                        <input
                          className="input-field"
                          value={listingDraft?.price || ''}
                          onChange={(e) => setListingDraft((prev) => prev ? { ...prev, price: e.target.value } : prev)}
                        />
                      ) : (
                        listing.price
                      )}
                    </td>
                    <td style={{ padding: '0.6rem' }}>{listing.farmer}</td>
                    <td style={{ padding: '0.6rem', minWidth: '220px' }}>
                      {isEditing ? (
                        <input
                          className="input-field"
                          value={listingDraft?.details || ''}
                          onChange={(e) => setListingDraft((prev) => prev ? { ...prev, details: e.target.value } : prev)}
                        />
                      ) : (
                        listing.details
                      )}
                    </td>
                    <td style={{ padding: '0.6rem', minWidth: '180px' }}>
                      <div className="flex items-center gap-2">
                        {isEditing ? (
                          <>
                            <button className="btn btn-secondary" type="button" onClick={saveListing}>
                              <Save size={14} /> {t('admin.save')}
                            </button>
                            <button
                              className="btn btn-secondary"
                              type="button"
                              onClick={() => {
                                setEditingListingId(null);
                                setListingDraft(null);
                              }}
                            >
                              {t('admin.cancel')}
                            </button>
                          </>
                        ) : (
                          <button className="btn btn-secondary" type="button" onClick={() => startListingEdit(listing.id)}>
                            <PencilLine size={14} /> {t('admin.edit')}
                          </button>
                        )}
                        <button
                          className="btn btn-secondary"
                          type="button"
                          onClick={() => {
                            if (!window.confirm(t('admin.confirmDeleteListing', { crop: listing.crop, farmer: listing.farmer }))) return;
                            removeMarketListing(listing.id);
                            addToast(t('admin.toastListingRemoved'), 'warning');
                            if (editingListingId === listing.id) {
                              setEditingListingId(null);
                              setListingDraft(null);
                            }
                          }}
                        >
                          <Trash2 size={14} /> {t('admin.delete')}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {marketListings.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ padding: '1rem', textAlign: 'center' }} className="text-muted">
                    {t('admin.noListings')}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
