import React, { useState, useEffect } from 'react';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { TrendingUp, TrendingDown, Activity, Search, MapPin, RefreshCw, AlertTriangle } from 'lucide-react';
import { useTranslations } from '../i18n';

const PRICE_HISTORY = [
  { month: 'Jan', wheat: 2100, rice: 2900, cotton: 7400, soybean: 4300 },
  { month: 'Feb', wheat: 2150, rice: 2950, cotton: 7300, soybean: 4400 },
  { month: 'Mar', wheat: 2200, rice: 2850, cotton: 7100, soybean: 4500 },
  { month: 'Apr', wheat: 2180, rice: 3000, cotton: 7050, soybean: 4550 },
  { month: 'May', wheat: 2250, rice: 3100, cotton: 7150, soybean: 4620 },
  { month: 'Jun', wheat: 2300, rice: 3050, cotton: 7200, soybean: 4600 },
];

interface MandiPrice {
  commodity: string;
  price: number;
  trend: 'up' | 'down';
  variance: string;
}

interface Mandi {
  id: number;
  name: string;
  city: string;
  state: string;
  prices: MandiPrice[];
}

interface MarketSummary {
  averages: Record<string, number>;
  trends: Record<string, string>;
  lastUpdated: string;
}

interface PriceAlert {
  id: string;
  mandi: string;
  commodity: string;
  movement: 'spike' | 'drop';
  variance: number;
  price: number;
  severity: 'high' | 'medium';
}

const FALLBACK_MANDIS: Mandi[] = [
  {
    id: 1,
    name: 'Yeshwanthpur',
    city: 'Bengaluru',
    state: 'Karnataka',
    prices: [
      { commodity: 'Wheat', price: 2350, trend: 'up', variance: '1.2' },
      { commodity: 'Rice', price: 3120, trend: 'up', variance: '1.8' },
    ],
  },
  {
    id: 2,
    name: 'Mysuru APMC',
    city: 'Mysuru',
    state: 'Karnataka',
    prices: [
      { commodity: 'Sugarcane', price: 320, trend: 'down', variance: '0.5' },
      { commodity: 'Cotton', price: 7050, trend: 'up', variance: '0.9' },
    ],
  },
  {
    id: 3,
    name: 'Hubballi',
    city: 'Hubballi',
    state: 'Karnataka',
    prices: [
      { commodity: 'Soybean', price: 4580, trend: 'up', variance: '1.1' },
      { commodity: 'Onion', price: 1820, trend: 'down', variance: '0.7' },
    ],
  },
];

const FALLBACK_SUMMARY: MarketSummary = {
  averages: {
    Wheat: 2350,
    Rice: 3120,
    Cotton: 7050,
    Soybean: 4580,
  },
  trends: {
    Wheat: '+1.2%',
    Rice: '+1.8%',
    Cotton: '-0.8%',
    Soybean: '+1.1%',
  },
  lastUpdated: 'Offline mode',
};

export const Dashboard: React.FC = () => {
  const { t, translateCrop } = useTranslations();
  const [searchTerm, setSearchTerm] = useState('');
  const [mandis, setMandis] = useState<Mandi[]>([]);
  const [summary, setSummary] = useState<MarketSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isOfflineFallback, setIsOfflineFallback] = useState(false);

  const getAveragePrice = (crop: 'Wheat' | 'Rice' | 'Cotton' | 'Soybean') => {
    const value = summary?.averages?.[crop];
    return typeof value === 'number' && Number.isFinite(value) ? value : null;
  };

  const getTrend = (crop: 'Wheat' | 'Rice' | 'Cotton' | 'Soybean') => {
    const value = summary?.trends?.[crop];
    return typeof value === 'string' && value.trim().length > 0 ? value : '0.0%';
  };

  const fetchIntelligence = async (search = '') => {
    try {
      const resp = await fetch(`/api/market-intelligence?search=${encodeURIComponent(search)}`);
      if (!resp.ok) {
        throw new Error(`Market API returned ${resp.status}`);
      }
      const data = await resp.json();
      setMandis(data.mandis);
      setSummary(data.summary);
      setIsOfflineFallback(false);
    } catch (err) {
      console.error('Failed to fetch intelligence:', err);
      const filteredFallback = search
        ? FALLBACK_MANDIS.filter(
            (m) =>
              m.name.toLowerCase().includes(search.toLowerCase()) ||
              m.city.toLowerCase().includes(search.toLowerCase()) ||
              m.state.toLowerCase().includes(search.toLowerCase())
          )
        : FALLBACK_MANDIS;
      setMandis(filteredFallback);
      setSummary(FALLBACK_SUMMARY);
      setIsOfflineFallback(true);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchIntelligence();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    fetchIntelligence(searchTerm);
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchIntelligence(searchTerm);
  };

  const demandData = summary
    ? [
        { name: translateCrop('Wheat'), value: 80 },
        { name: translateCrop('Rice'), value: 95 },
        { name: translateCrop('Cotton'), value: 65 },
        { name: translateCrop('Soybean'), value: 85 },
      ]
    : [];

  const alerts: PriceAlert[] = mandis
    .flatMap((mandi) =>
      mandi.prices.map((pricePoint) => {
        const variance = Number.parseFloat(pricePoint.variance) || 0;
        const movement: 'spike' | 'drop' = pricePoint.trend === 'up' ? 'spike' : 'drop';
        const severity: 'high' | 'medium' = variance >= 1.5 ? 'high' : 'medium';
        return {
          id: `${mandi.id}-${pricePoint.commodity}-${movement}`,
          mandi: mandi.name,
          commodity: pricePoint.commodity,
          movement,
          variance,
          price: pricePoint.price,
          severity,
        };
      })
    )
    .filter((item) => item.variance >= 0.8)
    .sort((a, b) => b.variance - a.variance)
    .slice(0, 6);

  return (
    <div className="max-w-4xl mx-auto pb-12">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="heading-1">{t('dashboard.title')}</h2>
          <div className="flex items-center gap-2 mt-1">
            <span className="flex items-center gap-1 text-xs font-semibold px-2 py-0.5 bg-green-100 text-green-700 rounded-full animate-pulse">
              {t('dashboard.live')}
            </span>
            <span className="text-muted" style={{ fontSize: '0.8rem' }}>
              {isOfflineFallback
                ? t('dashboard.offlineData')
                : t('dashboard.realtimeUpdated', { time: summary?.lastUpdated || t('dashboard.today') })}
            </span>
          </div>
        </div>
        <button
          onClick={handleRefresh}
          className={`btn btn-secondary p-2 rounded-full ${isRefreshing ? 'animate-spin' : ''}`}
          title={t('dashboard.refreshPrices')}
        >
          <RefreshCw size={18} />
        </button>
      </div>

      <div className="grid-cols-4 mb-8">
        {(['Wheat', 'Rice', 'Cotton', 'Soybean'] as const).map((crop) => (
          <div key={crop} className="card p-4">
            <p className="text-muted mb-1" style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase' }}>
              {translateCrop(crop)}
            </p>
            <div className="flex items-end justify-between">
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>
                {getAveragePrice(crop) !== null ? `Rs ${getAveragePrice(crop)!.toLocaleString('en-IN')}` : '---'}
              </h3>
              <span className={`text-xs font-bold ${getTrend(crop).startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                {getTrend(crop)}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="mb-8">
        <form onSubmit={handleSearch} className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" size={20} />
          <input
            type="text"
            placeholder={t('dashboard.searchPlaceholder')}
            className="input-field pl-12 pr-24 h-14 text-lg shadow-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button type="submit" className="absolute right-2 top-2 bottom-2 btn px-6">
            {t('dashboard.search')}
          </button>
        </form>
      </div>

      <div className="card mb-8">
        <div className="flex items-center gap-2 mb-4" style={{ color: '#b45309' }}>
          <AlertTriangle size={20} />
          <h3 className="heading-1" style={{ fontSize: '1.1rem', margin: 0, color: 'var(--text-main)' }}>
            {t('dashboard.alertsTitle')}
          </h3>
        </div>

        {alerts.length > 0 ? (
          <div className="space-y-3">
            {alerts.map((alert) => (
              <div
                key={alert.id}
                style={{
                  border: '1px solid var(--border)',
                  borderLeft: `5px solid ${alert.movement === 'spike' ? '#16a34a' : '#dc2626'}`,
                  borderRadius: '10px',
                  padding: '0.85rem 1rem',
                  background: 'var(--surface)',
                }}
              >
                <div className="flex items-center justify-between" style={{ marginBottom: '0.35rem' }}>
                  <strong style={{ fontSize: '0.95rem' }}>
                    {translateCrop(alert.commodity)} {alert.movement === 'spike' ? t('dashboard.priceSpike') : t('dashboard.priceDrop')}
                  </strong>
                  <span
                    style={{
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      color: alert.severity === 'high' ? '#b91c1c' : '#b45309',
                    }}
                  >
                    {alert.severity === 'high' ? t('dashboard.highAlert') : t('dashboard.mediumAlert')}
                  </span>
                </div>
                <p className="text-muted" style={{ margin: 0, fontSize: '0.86rem' }}>
                  {t('dashboard.alertLine', {
                    market: alert.mandi,
                    sign: alert.movement === 'spike' ? '+' : '-',
                    variance: alert.variance.toFixed(1),
                    price: alert.price.toLocaleString('en-IN'),
                  })}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-muted" style={{ margin: 0 }}>
            {t('dashboard.noAlerts')}
          </p>
        )}
      </div>

      <div className="grid-cols-2 gap-8 mb-8">
        <div className="card h-fit">
          <div className="flex items-center justify-between mb-6">
            <h3 className="flex items-center gap-2 font-bold text-lg">
              <MapPin size={20} className="text-primary" />
              {t('dashboard.liveMarketPrices')}
            </h3>
            {searchTerm && (
              <button onClick={() => { setSearchTerm(''); fetchIntelligence(''); }} className="text-xs text-primary font-medium">
                {t('dashboard.clearSearch')}
              </button>
            )}
          </div>

          <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
            {isLoading ? (
              <div className="py-20 text-center text-muted">{t('dashboard.searchingMarkets')}</div>
            ) : mandis.length > 0 ? (
              mandis.map((mandi) => (
                <div key={mandi.id} className="p-4 rounded-xl bg-gray-50 border border-gray-100 hover:border-primary/30 transition-colors">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h4 className="font-bold text-stone-800">{mandi.name}</h4>
                      <p className="text-xs text-muted">{mandi.city}, {mandi.state}</p>
                    </div>
                    <span className="text-[10px] bg-stone-200 text-stone-600 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">
                      {t('dashboard.marketLabel', { id: mandi.id })}
                    </span>
                  </div>
                  <div className="space-y-2">
                    {mandi.prices.map((p, idx) => (
                      <div key={idx} className="flex items-center justify-between py-1 border-t border-gray-200/50">
                        <span className="text-sm font-medium text-stone-600">{translateCrop(p.commodity)}</span>
                        <div className="text-right">
                          <span className="text-sm font-bold block">Rs {p.price.toLocaleString('en-IN')}</span>
                          <span className={`text-[10px] flex items-center justify-end gap-0.5 font-bold ${p.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                            {p.trend === 'up' ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                            {p.variance}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            ) : (
              <div className="py-20 text-center">
                <p className="text-muted text-sm">{t('dashboard.noMarketsFound', { search: searchTerm })}</p>
                <button onClick={() => { setSearchTerm(''); fetchIntelligence(''); }} className="mt-2 text-primary text-sm font-bold">
                  {t('dashboard.showAllMarkets')}
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-8">
          <div className="card">
            <div className="flex items-center gap-2 mb-6" style={{ color: 'var(--primary)' }}>
              <Activity size={20} />
              <h3 className="heading-1" style={{ fontSize: '1.1rem', margin: 0, color: 'var(--text-main)' }}>{t('dashboard.priceTrends')}</h3>
            </div>
            <div style={{ height: '240px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={PRICE_HISTORY} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'var(--text-muted)' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'var(--text-muted)' }} />
                  <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }} />
                  <Area type="monotone" dataKey="wheat" stroke="var(--primary)" strokeWidth={2} fillOpacity={1} fill="url(#colorPrice)" />
                  <Line type="monotone" dataKey="rice" stroke="var(--accent)" strokeWidth={2} dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center gap-2 mb-6" style={{ color: 'var(--primary)' }}>
              <Activity size={20} />
              <h3 className="heading-1" style={{ fontSize: '1.1rem', margin: 0, color: 'var(--text-main)' }}>{t('dashboard.currentDemand')}</h3>
            </div>
            <div style={{ height: '240px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={demandData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="var(--border)" />
                  <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'var(--text-muted)' }} />
                  <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'var(--text-muted)' }} width={80} />
                  <Tooltip cursor={{ fill: 'var(--bg-color)' }} contentStyle={{ borderRadius: '8px', border: '1px solid var(--border)' }} />
                  <Bar dataKey="value" fill="var(--primary)" radius={[0, 4, 4, 0]} barSize={24} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
