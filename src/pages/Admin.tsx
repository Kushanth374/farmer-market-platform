import React, { useEffect, useMemo, useState } from 'react';
import { Shield, Users, Store, Trash2, Save, RotateCcw, PencilLine, Download, Search, Receipt, TrendingUp, AlertTriangle, Clock } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { useTranslations } from '../i18n';
import { readJson } from '../app/api';

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

type AdminOrder = {
  id: number;
  buyerPhone: string;
  sellerPhone: string;
  listingId: number | null;
  crop: string;
  qty: string;
  unitPrice: number;
  totalPrice: number;
  txId: string;
  sellerName: string;
  sellerAddress: string;
  status: string;
  createdAt: string;
};

const toCsvValue = (value: unknown) => {
  const text = String(value ?? '');
  const escaped = text.replace(/"/g, '""');
  return `"${escaped}"`;
};

const downloadCsv = (filename: string, rows: Record<string, unknown>[]) => {
  if (!rows.length) return;
  const headers = Object.keys(rows[0]);
  const lines = [
    headers.map(toCsvValue).join(','),
    ...rows.map((row) => headers.map((h) => toCsvValue(row[h])).join(',')),
  ];
  const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
};

const formatWhen = (iso: string) => {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleString('en-IN', { month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit' });
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

  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'listings' | 'orders'>('overview');
  const [editingPhone, setEditingPhone] = useState<string | null>(null);
  const [accountDraft, setAccountDraft] = useState<AccountDraft | null>(null);
  const [editingListingId, setEditingListingId] = useState<number | null>(null);
  const [listingDraft, setListingDraft] = useState<ListingDraft | null>(null);
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [isOrdersLoading, setIsOrdersLoading] = useState(false);
  const [ordersError, setOrdersError] = useState<string | null>(null);
  const [query, setQuery] = useState('');

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

  useEffect(() => {
    setIsOrdersLoading(true);
    setOrdersError(null);
    void readJson<{ orders: AdminOrder[] }>('/api/orders')
      .then((data) => setOrders(Array.isArray(data.orders) ? data.orders : []))
      .catch((err: unknown) => {
        const message = err instanceof Error ? err.message : 'Failed to load orders';
        setOrdersError(message);
      })
      .finally(() => setIsOrdersLoading(false));
  }, []);

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

  const normalizedQuery = query.trim().toLowerCase();
  const filteredAccounts = useMemo(() => {
    if (!normalizedQuery) return accountsList;
    return accountsList.filter((a) => {
      return (
        a.name.toLowerCase().includes(normalizedQuery) ||
        a.phone.toLowerCase().includes(normalizedQuery) ||
        a.address.toLowerCase().includes(normalizedQuery) ||
        a.primaryCrop.toLowerCase().includes(normalizedQuery)
      );
    });
  }, [accountsList, normalizedQuery]);

  const filteredListings = useMemo(() => {
    if (!normalizedQuery) return marketListings;
    return marketListings.filter((l) => {
      const hay = `${l.crop} ${l.qty} ${l.price} ${l.details} ${l.farmer} ${l.ownerPhone} ${l.address}`.toLowerCase();
      return hay.includes(normalizedQuery);
    });
  }, [marketListings, normalizedQuery]);

  const filteredOrders = useMemo(() => {
    if (!normalizedQuery) return orders;
    return orders.filter((o) => {
      const hay = `${o.crop} ${o.qty} ${o.txId} ${o.buyerPhone} ${o.sellerPhone} ${o.sellerName} ${o.sellerAddress} ${o.status}`.toLowerCase();
      return hay.includes(normalizedQuery);
    });
  }, [orders, normalizedQuery]);

  const totals = useMemo(() => {
    const orderCount = orders.length;
    const revenue = orders.reduce((sum, o) => sum + (Number(o.totalPrice) || 0), 0);
    const uniqueSellers = new Set(orders.map((o) => o.sellerPhone).filter(Boolean)).size;
    const uniqueBuyers = new Set(orders.map((o) => o.buyerPhone).filter(Boolean)).size;
    return { orderCount, revenue, uniqueSellers, uniqueBuyers };
  }, [orders]);

  const topCrops = useMemo(() => {
    const counts = new Map<string, number>();
    orders.forEach((o) => {
      const crop = String(o.crop || '').trim() || 'Unknown';
      counts.set(crop, (counts.get(crop) || 0) + 1);
    });
    return [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 4);
  }, [orders]);

  const recentOrders = useMemo(() => {
    return [...orders]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 6);
  }, [orders]);

  const recentListings = useMemo(() => {
    return [...marketListings].slice(0, 6);
  }, [marketListings]);

  return (
    <div className="max-w-4xl mx-auto pb-12">
      <div className="admin-hero card mb-6">
        <div className="admin-hero-top">
          <div className="admin-hero-title">
            <div className="admin-hero-icon">
              <Shield size={22} />
            </div>
            <div>
              <h2 className="heading-1" style={{ color: 'white', marginBottom: '0.25rem' }}>{t('admin.title')}</h2>
              <p style={{ opacity: 0.9, margin: 0, color: 'rgba(255,255,255,0.85)' }}>{t('admin.subtitle')}</p>
            </div>
          </div>
          <div className="admin-hero-actions">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => {
                downloadCsv('kisanbandhu_users.csv', accountsList);
                addToast('Exported users CSV', 'success');
              }}
              style={{ padding: '0.55rem 0.85rem' }}
            >
              <Download size={16} /> Export users
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => {
                downloadCsv(
                  'kisanbandhu_orders.csv',
                  orders.map((o) => ({
                    id: o.id,
                    createdAt: o.createdAt,
                    crop: o.crop,
                    qty: o.qty,
                    totalPrice: o.totalPrice,
                    buyerPhone: o.buyerPhone,
                    sellerPhone: o.sellerPhone,
                    txId: o.txId,
                    status: o.status,
                  })),
                );
                addToast('Exported orders CSV', 'success');
              }}
              style={{ padding: '0.55rem 0.85rem' }}
              disabled={orders.length === 0}
            >
              <Receipt size={16} /> Export orders
            </button>
            <button
              className="btn"
              type="button"
              onClick={async () => {
                await resetMarketListings();
                addToast(t('admin.toastListingsReset'), 'info');
              }}
              style={{ padding: '0.55rem 0.95rem' }}
            >
              <RotateCcw size={16} /> Reset listings
            </button>
          </div>
        </div>

        <div className="admin-kpis">
          <div className="admin-kpi">
            <div className="admin-kpi-label">{t('admin.registeredUsers')}</div>
            <div className="admin-kpi-value-row">
              <div className="admin-kpi-value">{accountsList.length}</div>
              <div className="admin-kpi-badge">
                <Users size={14} />
              </div>
            </div>
            <div className="admin-kpi-meta">Profiles in database</div>
          </div>
          <div className="admin-kpi">
            <div className="admin-kpi-label">{t('admin.activeListings')}</div>
            <div className="admin-kpi-value-row">
              <div className="admin-kpi-value">{marketListings.length}</div>
              <div className="admin-kpi-badge">
                <Store size={14} />
              </div>
            </div>
            <div className="admin-kpi-meta">Live market cards</div>
          </div>
          <div className="admin-kpi">
            <div className="admin-kpi-label">Total orders</div>
            <div className="admin-kpi-value-row">
              <div className="admin-kpi-value">{totals.orderCount}</div>
              <div className="admin-kpi-badge">
                <Receipt size={14} />
              </div>
            </div>
            <div className="admin-kpi-meta">Buyers {totals.uniqueBuyers} · Sellers {totals.uniqueSellers}</div>
          </div>
          <div className="admin-kpi admin-kpi-accent">
            <div className="admin-kpi-label">Revenue (demo)</div>
            <div className="admin-kpi-value-row">
              <div className="admin-kpi-value">₹{totals.revenue.toLocaleString('en-IN')}</div>
              <div className="admin-kpi-badge">
                <TrendingUp size={14} />
              </div>
            </div>
            <div className="admin-kpi-meta">Sum of paid totals</div>
          </div>
        </div>

        <div className="admin-tabs">
          {(
            [
              { id: 'overview', label: 'Overview' },
              { id: 'users', label: 'Users' },
              { id: 'listings', label: 'Listings' },
              { id: 'orders', label: 'Orders' },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              type="button"
              className={`admin-tab ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}

          <div className="admin-search">
            <Search size={16} />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search users, listings, orders…"
              aria-label="Search admin data"
            />
          </div>
        </div>
      </div>

      {activeTab === 'overview' && (
        <div className="admin-grid">
          <div className="card admin-panel">
            <div className="admin-panel-head">
              <div>
                <div className="admin-panel-title">Recent orders</div>
                <div className="admin-panel-subtitle"><Clock size={14} /> Latest payments & invoices</div>
              </div>
              <span className="badge badge-blue" style={{ textTransform: 'none' }}>{orders.length} total</span>
            </div>

            {isOrdersLoading ? (
              <div className="text-muted">Loading orders…</div>
            ) : ordersError ? (
              <div className="admin-alert">
                <AlertTriangle size={16} /> {ordersError}
              </div>
            ) : recentOrders.length === 0 ? (
              <div className="text-muted">No orders yet.</div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>When</th>
                      <th>Crop</th>
                      <th>Qty</th>
                      <th>Total</th>
                      <th>Buyer</th>
                      <th>TXN</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentOrders.map((o) => (
                      <tr key={o.id}>
                        <td>{formatWhen(o.createdAt)}</td>
                        <td style={{ fontWeight: 900 }}>{o.crop}</td>
                        <td>{o.qty}</td>
                        <td style={{ fontWeight: 900, color: 'var(--primary)' }}>₹{Number(o.totalPrice || 0).toLocaleString('en-IN')}</td>
                        <td className="admin-mono">{o.buyerPhone}</td>
                        <td className="admin-mono">{o.txId}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="card admin-panel">
            <div className="admin-panel-head">
              <div>
                <div className="admin-panel-title">Top crops</div>
                <div className="admin-panel-subtitle">Order frequency</div>
              </div>
            </div>
            {topCrops.length === 0 ? (
              <div className="text-muted">No order data yet.</div>
            ) : (
              <div style={{ display: 'grid', gap: '0.65rem' }}>
                {topCrops.map(([crop, count]) => (
                  <div key={crop} className="admin-rank-row">
                    <div style={{ fontWeight: 900 }}>{crop}</div>
                    <div className="admin-rank-bar">
                      <div className="admin-rank-fill" style={{ width: `${Math.min(100, (count / Math.max(1, topCrops[0][1])) * 100)}%` }} />
                    </div>
                    <div className="admin-rank-count">{count}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="card admin-panel admin-panel-wide">
            <div className="admin-panel-head">
              <div>
                <div className="admin-panel-title">Recent listings</div>
                <div className="admin-panel-subtitle"><Store size={14} /> Latest items posted</div>
              </div>
              <button
                type="button"
                className="btn btn-secondary"
                style={{ padding: '0.45rem 0.75rem', fontSize: '0.85rem' }}
                onClick={() => downloadCsv('kisanbandhu_listings.csv', marketListings as any)}
              >
                <Download size={14} /> Export listings
              </button>
            </div>

            {recentListings.length === 0 ? (
              <div className="text-muted">No listings available.</div>
            ) : (
              <div className="admin-cards">
                {recentListings.map((l) => (
                  <div key={l.id} className="admin-mini-card">
                    <div style={{ fontWeight: 950 }}>{l.crop}</div>
                    <div className="text-muted" style={{ fontSize: '0.85rem' }}>{l.qty} · <span style={{ color: 'var(--primary)', fontWeight: 900 }}>{l.price}</span></div>
                    <div className="text-muted" style={{ fontSize: '0.8rem' }}>By {l.farmer}</div>
                    <div className="admin-mono" style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{l.ownerPhone}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'users' && (
        <div className="card mb-6 admin-panel">
          <div className="admin-panel-head">
            <div>
              <div className="admin-panel-title">{t('admin.manageUsers')}</div>
              <div className="admin-panel-subtitle"><Users size={14} /> Search, edit, and remove profiles</div>
            </div>
            <span className="badge badge-success" style={{ textTransform: 'none' }}>{filteredAccounts.length} shown</span>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table className="admin-table admin-table-dense">
              <thead>
                <tr>
                  <th>{t('admin.name')}</th>
                  <th>{t('admin.phone')}</th>
                  <th>{t('admin.address')}</th>
                  <th>{t('admin.land')}</th>
                  <th>{t('admin.crop')}</th>
                  <th style={{ width: 240 }}>{t('admin.actions')}</th>
                </tr>
              </thead>
              <tbody>
                {filteredAccounts.map((account) => {
                  const isEditing = editingPhone === account.phone;
                  return (
                    <tr key={account.phone}>
                      <td>
                        {isEditing ? (
                          <input
                            className="input-field"
                            value={accountDraft?.name || ''}
                            onChange={(e) => setAccountDraft((prev) => (prev ? { ...prev, name: e.target.value } : prev))}
                          />
                        ) : (
                          <span style={{ fontWeight: 900 }}>{account.name}</span>
                        )}
                      </td>
                      <td className="admin-mono">{account.phone}</td>
                      <td style={{ minWidth: 220 }}>
                        {isEditing ? (
                          <input
                            className="input-field"
                            value={accountDraft?.address || ''}
                            onChange={(e) => setAccountDraft((prev) => (prev ? { ...prev, address: e.target.value } : prev))}
                          />
                        ) : (
                          account.address
                        )}
                      </td>
                      <td style={{ minWidth: 120 }}>
                        {isEditing ? (
                          <input
                            className="input-field"
                            value={accountDraft?.landSize || ''}
                            onChange={(e) => setAccountDraft((prev) => (prev ? { ...prev, landSize: e.target.value } : prev))}
                          />
                        ) : (
                          account.landSize
                        )}
                      </td>
                      <td style={{ minWidth: 140 }}>
                        {isEditing ? (
                          <input
                            className="input-field"
                            value={accountDraft?.primaryCrop || ''}
                            onChange={(e) => setAccountDraft((prev) => (prev ? { ...prev, primaryCrop: e.target.value } : prev))}
                          />
                        ) : (
                          <span className="badge badge-success" style={{ textTransform: 'none' }}>{account.primaryCrop || '—'}</span>
                        )}
                      </td>
                      <td>
                        <div className="flex items-center gap-2" style={{ flexWrap: 'wrap' }}>
                          {isEditing ? (
                            <>
                              <button className="btn btn-secondary" type="button" onClick={saveAccount} style={{ padding: '0.45rem 0.7rem', fontSize: '0.85rem' }}>
                                <Save size={14} /> {t('admin.save')}
                              </button>
                              <button
                                className="btn btn-secondary"
                                type="button"
                                onClick={() => {
                                  setEditingPhone(null);
                                  setAccountDraft(null);
                                }}
                                style={{ padding: '0.45rem 0.7rem', fontSize: '0.85rem' }}
                              >
                                {t('admin.cancel')}
                              </button>
                            </>
                          ) : (
                            <button className="btn btn-secondary" type="button" onClick={() => startAccountEdit(account.phone)} style={{ padding: '0.45rem 0.7rem', fontSize: '0.85rem' }}>
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
                            style={{ padding: '0.45rem 0.7rem', fontSize: '0.85rem' }}
                          >
                            <Trash2 size={14} /> {t('admin.delete')}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {filteredAccounts.length === 0 && (
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
      )}

      {activeTab === 'listings' && (
        <div className="card admin-panel">
          <div className="admin-panel-head">
            <div>
              <div className="admin-panel-title">{t('admin.manageListings')}</div>
              <div className="admin-panel-subtitle"><Store size={14} /> Moderate and curate market listings</div>
            </div>
            <span className="badge badge-success" style={{ textTransform: 'none' }}>{filteredListings.length} shown</span>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table className="admin-table admin-table-dense">
              <thead>
                <tr>
                  <th>{t('admin.crop')}</th>
                  <th>{t('admin.qty')}</th>
                  <th>{t('admin.price')}</th>
                  <th>{t('admin.farmer')}</th>
                  <th>{t('admin.details')}</th>
                  <th style={{ width: 240 }}>{t('admin.actions')}</th>
                </tr>
              </thead>
              <tbody>
                {filteredListings.map((listing) => {
                  const isEditing = editingListingId === listing.id;
                  return (
                    <tr key={listing.id}>
                      <td style={{ minWidth: 120 }}>
                        {isEditing ? (
                          <input
                            className="input-field"
                            value={listingDraft?.crop || ''}
                            onChange={(e) => setListingDraft((prev) => (prev ? { ...prev, crop: e.target.value } : prev))}
                          />
                        ) : (
                          <span style={{ fontWeight: 900 }}>{listing.crop}</span>
                        )}
                      </td>
                      <td style={{ minWidth: 120 }}>
                        {isEditing ? (
                          <input
                            className="input-field"
                            value={listingDraft?.qty || ''}
                            onChange={(e) => setListingDraft((prev) => (prev ? { ...prev, qty: e.target.value } : prev))}
                          />
                        ) : (
                          listing.qty
                        )}
                      </td>
                      <td style={{ minWidth: 130, fontWeight: 900, color: 'var(--primary)' }}>
                        {isEditing ? (
                          <input
                            className="input-field"
                            value={listingDraft?.price || ''}
                            onChange={(e) => setListingDraft((prev) => (prev ? { ...prev, price: e.target.value } : prev))}
                          />
                        ) : (
                          listing.price
                        )}
                      </td>
                      <td style={{ minWidth: 160 }}>{listing.farmer}</td>
                      <td style={{ minWidth: 260 }}>
                        {isEditing ? (
                          <input
                            className="input-field"
                            value={listingDraft?.details || ''}
                            onChange={(e) => setListingDraft((prev) => (prev ? { ...prev, details: e.target.value } : prev))}
                          />
                        ) : (
                          <span className="text-muted" style={{ fontSize: '0.9rem' }}>{listing.details || '—'}</span>
                        )}
                      </td>
                      <td>
                        <div className="flex items-center gap-2" style={{ flexWrap: 'wrap' }}>
                          {isEditing ? (
                            <>
                              <button className="btn btn-secondary" type="button" onClick={saveListing} style={{ padding: '0.45rem 0.7rem', fontSize: '0.85rem' }}>
                                <Save size={14} /> {t('admin.save')}
                              </button>
                              <button
                                className="btn btn-secondary"
                                type="button"
                                onClick={() => {
                                  setEditingListingId(null);
                                  setListingDraft(null);
                                }}
                                style={{ padding: '0.45rem 0.7rem', fontSize: '0.85rem' }}
                              >
                                {t('admin.cancel')}
                              </button>
                            </>
                          ) : (
                            <button className="btn btn-secondary" type="button" onClick={() => startListingEdit(listing.id)} style={{ padding: '0.45rem 0.7rem', fontSize: '0.85rem' }}>
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
                            style={{ padding: '0.45rem 0.7rem', fontSize: '0.85rem' }}
                          >
                            <Trash2 size={14} /> {t('admin.delete')}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {filteredListings.length === 0 && (
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
      )}

      {activeTab === 'orders' && (
        <div className="card admin-panel">
          <div className="admin-panel-head">
            <div>
              <div className="admin-panel-title">Orders & invoices</div>
              <div className="admin-panel-subtitle"><Receipt size={14} /> All payments (demo) recorded in DB</div>
            </div>
            <span className="badge badge-success" style={{ textTransform: 'none' }}>{filteredOrders.length} shown</span>
          </div>

          {isOrdersLoading ? (
            <div className="text-muted">Loading orders…</div>
          ) : ordersError ? (
            <div className="admin-alert">
              <AlertTriangle size={16} /> {ordersError}
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="text-muted">No orders found.</div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table className="admin-table admin-table-dense">
                <thead>
                  <tr>
                    <th>When</th>
                    <th>Status</th>
                    <th>Crop</th>
                    <th>Qty</th>
                    <th>Total</th>
                    <th>Buyer</th>
                    <th>Seller</th>
                    <th>TXN</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders
                    .slice()
                    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                    .map((o) => (
                      <tr key={o.id}>
                        <td>{formatWhen(o.createdAt)}</td>
                        <td>
                          <span className="badge badge-success" style={{ textTransform: 'uppercase' }}>{String(o.status || 'paid')}</span>
                        </td>
                        <td style={{ fontWeight: 900 }}>{o.crop}</td>
                        <td>{o.qty}</td>
                        <td style={{ fontWeight: 900, color: 'var(--primary)' }}>₹{Number(o.totalPrice || 0).toLocaleString('en-IN')}</td>
                        <td className="admin-mono">{o.buyerPhone}</td>
                        <td className="admin-mono">{o.sellerPhone}</td>
                        <td className="admin-mono">{o.txId}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      <style>{`
        .admin-hero {
          padding: 1rem;
          border: 1px solid rgba(255,255,255,0.65);
          background:
            radial-gradient(circle at 20% 10%, rgba(116, 166, 59, 0.35), transparent 42%),
            radial-gradient(circle at 85% 30%, rgba(47, 111, 62, 0.3), transparent 45%),
            linear-gradient(135deg, #103021, #1a3d24 50%, #2f6f3e);
          color: white;
          overflow: hidden;
          position: relative;
        }

        .admin-hero::after {
          content: '';
          position: absolute;
          inset: -40% -30%;
          background: linear-gradient(120deg, transparent 45%, rgba(255,255,255,0.18) 52%, transparent 60%);
          transform: rotate(8deg);
          opacity: 0.7;
          pointer-events: none;
        }

        .admin-hero::before {
          content: '';
          position: absolute;
          inset: 0;
          pointer-events: none;
          opacity: 0.6;
          background-image:
            radial-gradient(rgba(255,255,255,0.14) 1px, transparent 1px);
          background-size: 18px 18px;
          mask-image: radial-gradient(circle at 30% 20%, black, transparent 70%);
        }

        .admin-hero-top {
          position: relative;
          z-index: 1;
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 1rem;
          flex-wrap: wrap;
        }

        .admin-hero-title {
          display: flex;
          align-items: center;
          gap: 0.85rem;
        }

        .admin-hero-icon {
          width: 44px;
          height: 44px;
          border-radius: 14px;
          display: grid;
          place-items: center;
          background: rgba(255,255,255,0.14);
          border: 1px solid rgba(255,255,255,0.2);
          box-shadow: 0 16px 36px rgba(0,0,0,0.22);
        }

        .admin-hero-actions {
          display: flex;
          gap: 0.5rem;
          flex-wrap: wrap;
        }

        .admin-hero .btn-secondary {
          background: rgba(255, 255, 255, 0.14);
          color: white;
          border-color: rgba(255,255,255,0.22);
        }

        .admin-hero .btn-secondary:hover {
          background: rgba(255, 255, 255, 0.2);
        }

        .admin-kpis {
          position: relative;
          z-index: 1;
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 0.75rem;
          margin-top: 1rem;
        }

        .admin-kpi {
          padding: 0.75rem 0.85rem;
          border-radius: 16px;
          background: rgba(255,255,255,0.12);
          border: 1px solid rgba(255,255,255,0.18);
          backdrop-filter: blur(10px);
          position: relative;
          overflow: hidden;
        }

        .admin-kpi-accent {
          background: rgba(116, 166, 59, 0.18);
          border-color: rgba(116, 166, 59, 0.28);
        }

        .admin-kpi::after {
          content: '';
          position: absolute;
          inset: auto -30% -55% auto;
          width: 180px;
          height: 180px;
          border-radius: 999px;
          background: radial-gradient(circle, rgba(255,255,255,0.14), transparent 65%);
          transform: rotate(12deg);
        }

        .admin-kpi-label {
          font-size: 0.72rem;
          font-weight: 950;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.78);
          margin-bottom: 0.35rem;
        }

        .admin-kpi-value-row {
          position: relative;
          z-index: 1;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 0.75rem;
        }

        .admin-kpi-value {
          font-size: 1.4rem;
          font-weight: 950;
          letter-spacing: -0.03em;
          color: white;
        }

        .admin-kpi-meta {
          margin-top: 0.35rem;
          position: relative;
          z-index: 1;
          font-size: 0.82rem;
          font-weight: 700;
          color: rgba(255,255,255,0.75);
        }

        .admin-kpi-badge {
          width: 34px;
          height: 34px;
          border-radius: 12px;
          display: grid;
          place-items: center;
          background: rgba(255,255,255,0.14);
          border: 1px solid rgba(255,255,255,0.2);
          box-shadow: 0 12px 24px rgba(0,0,0,0.18);
          flex-shrink: 0;
        }

        .admin-tabs {
          position: relative;
          z-index: 1;
          margin-top: 1rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 0.75rem;
          flex-wrap: wrap;
        }

        .admin-tab {
          border: 1px solid rgba(255,255,255,0.22);
          background: rgba(255,255,255,0.1);
          color: rgba(255,255,255,0.88);
          padding: 0.45rem 0.7rem;
          border-radius: 12px;
          font-weight: 900;
          cursor: pointer;
        }

        .admin-tab.active {
          background: rgba(255,255,255,0.18);
          border-color: rgba(255,255,255,0.32);
          color: white;
        }

        .admin-search {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.45rem 0.7rem;
          border-radius: 12px;
          border: 1px solid rgba(255,255,255,0.22);
          background: rgba(255,255,255,0.1);
          min-width: min(360px, 100%);
        }

        .admin-search svg {
          color: rgba(255,255,255,0.82);
          flex-shrink: 0;
        }

        .admin-search input {
          width: 100%;
          border: 0;
          outline: none;
          background: transparent;
          color: white;
          font-weight: 800;
          padding: 0;
        }

        .admin-search input::placeholder {
          color: rgba(255,255,255,0.7);
          font-weight: 700;
        }

        .admin-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 1rem;
        }

        .admin-panel {
          box-shadow: var(--shadow-md);
        }

        .admin-panel-wide {
          grid-column: 1 / -1;
        }

        .admin-panel-head {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 1rem;
          margin-bottom: 0.85rem;
        }

        .admin-panel-title {
          font-weight: 950;
          color: var(--text-main);
          font-size: 1.05rem;
        }

        .admin-panel-subtitle {
          margin-top: 0.25rem;
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          color: var(--text-muted);
          font-weight: 700;
          font-size: 0.85rem;
        }

        .admin-alert {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 0.9rem;
          border-radius: 14px;
          background: rgba(245, 158, 11, 0.12);
          border: 1px solid rgba(245, 158, 11, 0.22);
          color: #92400e;
          font-weight: 800;
        }

        .admin-table {
          width: 100%;
          border-collapse: collapse;
          background: transparent;
        }

        .admin-table th {
          text-align: left;
          font-size: 0.72rem;
          font-weight: 950;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: var(--text-muted);
          padding: 0.7rem 0.6rem;
          border-bottom: 1px solid var(--border);
          white-space: nowrap;
        }

        .admin-table td {
          padding: 0.65rem 0.6rem;
          border-bottom: 1px solid var(--border);
          vertical-align: top;
          color: var(--text-main);
          font-size: 0.92rem;
        }

        .admin-table-dense td {
          padding: 0.6rem 0.6rem;
        }

        .admin-mono {
          font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
          font-size: 0.85rem;
          color: var(--text-muted);
          font-weight: 800;
        }

        .admin-cards {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 0.75rem;
        }

        .admin-mini-card {
          padding: 0.85rem;
          border-radius: 16px;
          background: rgba(237, 245, 234, 0.46);
          border: 1px solid rgba(42, 79, 51, 0.12);
        }

        .admin-rank-row {
          display: grid;
          grid-template-columns: 1fr 2fr auto;
          gap: 0.75rem;
          align-items: center;
        }

        .admin-rank-bar {
          height: 10px;
          border-radius: 999px;
          background: rgba(42, 79, 51, 0.12);
          overflow: hidden;
        }

        .admin-rank-fill {
          height: 100%;
          border-radius: 999px;
          background: linear-gradient(135deg, #2f6f3e, #74a63b);
        }

        .admin-rank-count {
          font-weight: 950;
          color: var(--text-main);
          min-width: 2ch;
          text-align: right;
        }

        @media (min-width: 1024px) {
          .admin-kpis {
            grid-template-columns: repeat(4, minmax(0, 1fr));
          }

          .admin-grid {
            grid-template-columns: 1.3fr 0.7fr;
            gap: 1.25rem;
          }

          .admin-cards {
            grid-template-columns: repeat(3, minmax(0, 1fr));
          }
        }
      `}</style>
    </div>
  );
};
