import React, { useState, useEffect } from 'react';
import { useAppContext, User } from '../context/AppContext';
import {
  Calculator, Award, CheckCircle, Info, ExternalLink,
  ShieldCheck, ChevronDown, ChevronUp, Landmark, TrendingUp,
  Sprout, Zap, Bell, RefreshCw, Clock
} from 'lucide-react';
import { useTranslations } from '../i18n';

// ─── Static Government Scheme Database ─────────────────────────────────────
interface Scheme {
  id: string;
  name: string;
  desc: string;
  eligibility: { landSizeMax?: number; landSizeMin?: number };
  whyMatch: string;
  docs: string[];
  link: string;
  tag: string;
  tagColor: string;
}

const SCHEMES_DATABASE: Scheme[] = [
  {
    id: 'pm-kisan',
    name: 'PM-Kisan Samman Nidhi',
    desc: 'Direct income support of ₹6,000/year for all landholding farmer families across India.',
    eligibility: { landSizeMax: 100 },
    whyMatch: 'Available to all verified landholding farmers regardless of land size.',
    docs: ['Land Ownership Proof', 'Aadhaar Card', 'Bank Account Details'],
    link: 'https://pmkisan.gov.in/',
    tag: 'Income Support',
    tagColor: '#16a34a',
  },
  {
    id: 'pmfby',
    name: 'Pradhan Mantri Fasal Bima Yojana',
    desc: 'Comprehensive crop insurance covering risks from pre-sowing to post-harvest losses.',
    eligibility: { landSizeMin: 0 },
    whyMatch: 'Essential protection for your current crop against natural calamities and pests.',
    docs: ['Crop Sowing Certificate', 'Land Records', 'Bank Passbook', 'ID Proof'],
    link: 'https://pmfby.gov.in/',
    tag: 'Crop Insurance',
    tagColor: '#0891b2',
  },
  {
    id: 'pm-kusum',
    name: 'PM-KUSUM (Solar Pumps)',
    desc: 'Up to 60% subsidy for installation of solar pumps and grid-connected solar plants.',
    eligibility: { landSizeMin: 0.5 },
    whyMatch: 'Applicable for farmers looking to reduce dependency on diesel or grid electricity.',
    docs: ['Land Registry', 'Soil/Water Report', 'Caste Certificate (if applicable)'],
    link: 'https://pmkusum.mnre.gov.in/',
    tag: 'Subsidy',
    tagColor: '#d97706',
  },
];

// ─── Real Loan Products with direct bank links ─────────────────────────────
interface LoanProduct {
  id: string;
  bank: string;
  logo: string;
  schemeName: string;
  interestRate: string;
  maxAmount: string;
  tenure: string;
  purpose: string;
  highlights: string[];
  applyLink: string;
  isNew?: boolean;
  cropLinked?: string;
}

const BASE_LOAN_PRODUCTS: LoanProduct[] = [
  {
    id: 'agri-canara-portal',
    bank: 'Canara Bank',
    logo: '🏦',
    schemeName: 'Canara Agri Digital Loan Portal',
    interestRate: 'As per product and eligibility',
    maxAmount: 'As per scheme',
    tenure: 'As per selected loan product',
    purpose: 'Digital application for agriculture-linked loan products',
    highlights: ['Direct online portal', 'Digital application flow', 'Suitable for Karnataka applicants'],
    applyLink: 'https://portal.digiloans.canarabank.bank.in/ALOSportal',
  },
  {
    id: 'agri-pnb-online',
    bank: 'Punjab National Bank',
    logo: '🌾',
    schemeName: 'PNB Online Agriculture Loan Application',
    interestRate: 'As per bank norms',
    maxAmount: 'As per eligibility',
    tenure: 'As per selected product',
    purpose: 'Online agriculture loan application through PNB portal',
    highlights: ['Direct online application', 'KCC and agriculture loan categories', 'Official bank portal'],
    applyLink: 'https://weblens.pnb.bank.in/lendperfect/home',
  },
  {
    id: 'agri-hdfc-kisan-shakti',
    bank: 'HDFC Bank',
    logo: '🌻',
    schemeName: 'Kisan Shakti Loan',
    interestRate: 'As per bank norms',
    maxAmount: 'As per eligibility',
    tenure: 'As per product terms',
    purpose: 'Farm development and agriculture-linked financing',
    highlights: ['Apply online available', 'Rural/agri-focused product', 'Official bank page'],
    applyLink: 'https://www.hdfcbank.com/personal/borrow/popular-loans/ruralloans/kisan-shakti-loan',
  },
  {
    id: 'agri-hdfc-retail',
    bank: 'HDFC Bank',
    logo: '🏛️',
    schemeName: 'Retail Agri Loan (Kisan Card / Gold Card)',
    interestRate: 'As per bank norms',
    maxAmount: 'As per eligibility',
    tenure: 'As per product terms',
    purpose: 'Crop and farm-expense financing for eligible farmers',
    highlights: ['Apply online available', 'Agri-focused product page', 'Official bank page'],
    applyLink: 'https://www.hdfcbank.com/sme/borrow/popular-loans/retail-agri-loans/eligibility',
  },
  {
    id: 'agri-canara-vehicle',
    bank: 'Canara Bank',
    logo: '🌿',
    schemeName: 'Canara Vehicle to Agriculturists',
    interestRate: 'As per bank norms',
    maxAmount: 'As per eligibility',
    tenure: 'As per product terms',
    purpose: 'Loan support for agricultural vehicle needs',
    highlights: ['Apply online available', 'Agriculturist-focused product', 'Official bank page'],
    applyLink: 'https://www.canarabank.bank.in/loans/vehicle-loans/canara-vehicle-to-agriculturists',
  },
];

// ─── Market-linked loan generator ─────────────────────────────────────────
const generateMarketLoan = (crop: string, farmer: string, qty: string): LoanProduct => {
  const cropLoanMap: Record<string, Partial<LoanProduct>> = {
    wheat: {
      schemeName: `Wheat Season Working Capital Loan`,
      interestRate: '4% p.a.',
      maxAmount: '₹5 Lakhs',
      purpose: `Post-harvest wheat storage & transport financing`,
      applyLink: 'https://portal.digiloans.canarabank.bank.in/ALOSportal',
    },
    rice: {
      schemeName: `Paddy Procurement Finance`,
      interestRate: '5% p.a.',
      maxAmount: '₹8 Lakhs',
      purpose: `Rice milling and warehousing support`,
      applyLink: 'https://weblens.pnb.bank.in/lendperfect/home',
    },
    cotton: {
      schemeName: `Cotton Crop Pledge Financing`,
      interestRate: '6% p.a.',
      maxAmount: '₹15 Lakhs',
      purpose: `Cotton bale storage & gin processing loans`,
      applyLink: 'https://www.hdfcbank.com/personal/borrow/popular-loans/ruralloans/kisan-shakti-loan',
    },
    sugarcane: {
      schemeName: `Sugarcane Crop Loan`,
      interestRate: '4% p.a.',
      maxAmount: '₹10 Lakhs',
      purpose: `Sugarcane cultivation & crushing season finance`,
      applyLink: 'https://portal.digiloans.canarabank.bank.in/ALOSportal',
    },
    soybean: {
      schemeName: `Oilseed Pledge Loan`,
      interestRate: '5.5% p.a.',
      maxAmount: '₹6 Lakhs',
      purpose: `Soybean storage & oil extraction financing`,
      applyLink: 'https://www.hdfcbank.com/sme/borrow/popular-loans/retail-agri-loans/eligibility',
    },
  };

  const normalizedCrop = crop.trim().toLowerCase();
  const mapped = cropLoanMap[normalizedCrop] || cropLoanMap['wheat'];

  return {
    id: `market-${Date.now()}-${crop}`,
    bank: 'Market-Linked Opportunity',
    logo: '📈',
    schemeName: mapped.schemeName || `${crop} Season Loan`,
    interestRate: mapped.interestRate || '5% p.a.',
    maxAmount: mapped.maxAmount || '₹5 Lakhs',
    tenure: '6–12 Months',
    purpose: mapped.purpose || `Financing for ${crop} sale listing by ${farmer}`,
    highlights: [
      `Triggered by new ${crop} listing (${qty})`,
      `Farmer: ${farmer}`,
      'Apply directly via bank portal',
    ],
    applyLink: mapped.applyLink || 'https://portal.digiloans.canarabank.bank.in/ALOSportal',
    isNew: true,
    cropLinked: crop,
  };
};

// ─── Component ─────────────────────────────────────────────────────────────
export const Schemes: React.FC = () => {
  const { user, marketListings } = useAppContext();
  const { t } = useTranslations();
  const [loanAmount, setLoanAmount] = useState('100000');
  const [duration, setDuration] = useState('12');
  const [expandedScheme, setExpandedScheme] = useState<string | null>(null);
  const [loanProducts, setLoanProducts] = useState<LoanProduct[]>(BASE_LOAN_PRODUCTS);
  const [seenListingIds, setSeenListingIds] = useState<Set<number>>(new Set([1, 2, 3]));
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [activeTab, setActiveTab] = useState<'schemes' | 'loans'>('loans');

  // ── Auto-detect new market listings & add linked loans ────────────────
  useEffect(() => {
    const newListings = marketListings.filter((l) => !seenListingIds.has(l.id));
    if (newListings.length === 0) return;

    const newLoans = newListings.map((listing) =>
      generateMarketLoan(listing.crop, listing.farmer, listing.qty)
    );

    setLoanProducts((prev) => [...newLoans, ...prev]);
    setSeenListingIds((prev) => {
      const updated = new Set(prev);
      newListings.forEach((l) => updated.add(l.id));
      return updated;
    });
    setLastUpdated(new Date());
  }, [marketListings]);

  // ── EMI Calculator ────────────────────────────────────────────────────
  const interestRate = 4.0;
  const monthlyInterest = interestRate / 100 / 12;
  const numMonths = parseInt(duration, 10);
  const principal = parseInt(loanAmount, 10) || 0;
  const emi =
    principal > 0 && numMonths > 0
      ? (principal * monthlyInterest * Math.pow(1 + monthlyInterest, numMonths)) /
        (Math.pow(1 + monthlyInterest, numMonths) - 1)
      : 0;
  const totalAmount = emi * numMonths;

  // ── Scheme match score ────────────────────────────────────────────────
  const getMatchScore = (scheme: Scheme, u: User | null) => {
    if (!u) return 50;
    let score = 50;
    const land = parseFloat(u.landSize);
    if (scheme.eligibility.landSizeMin !== undefined && land >= scheme.eligibility.landSizeMin) score += 20;
    if (scheme.eligibility.landSizeMax !== undefined && land <= scheme.eligibility.landSizeMax) score += 20;
    if (u.primaryCrop) score += 10;
    return Math.min(score, 100);
  };

  const getLoanEligibility = (u: User | null) => {
    if (!u) return { score: 0, status: 'low' };
    let score = 30;
    const land = parseFloat(u.landSize);
    if (land > 0) score += 20;
    if (land > 2.5) score += 20;
    if (u.primaryCrop) score += 20;
    if (u.name) score += 10;
    return { score, status: score > 70 ? 'high' : score > 40 ? 'medium' : 'low' };
  };

  const eligibility = getLoanEligibility(user);

  return (
    <div className="max-w-4xl mx-auto pb-12">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="heading-1">{t('schemes.title')}</h2>
          <div className="flex items-center gap-2 mt-1">
            <span className="flex items-center gap-1 text-xs font-semibold px-2 py-0.5 bg-green-100 text-green-700 rounded-full animate-pulse">
              ● LIVE
            </span>
            <span className="text-muted" style={{ fontSize: '0.8rem' }}>
              Updated {lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        </div>
        {!user && (
          <span className="badge badge-warning">{t('schemes.completeProfile')}</span>
        )}
      </div>

      {/* Tab Switcher */}
      <div style={{ display: 'flex', background: 'var(--surface)', borderRadius: '10px', border: '1px solid var(--border)', padding: '4px', marginBottom: '2rem', width: 'fit-content' }}>
        <button
          className={`btn ${activeTab === 'loans' ? '' : 'btn-secondary'}`}
          style={{ padding: '0.5rem 1.5rem', borderRadius: '6px', border: 'none', boxShadow: 'none', display: 'flex', alignItems: 'center', gap: '6px' }}
          onClick={() => setActiveTab('loans')}
        >
          <Landmark size={16} /> Loan Applications
        </button>
        <button
          className={`btn ${activeTab === 'schemes' ? '' : 'btn-secondary'}`}
          style={{ padding: '0.5rem 1.5rem', borderRadius: '6px', border: 'none', boxShadow: 'none', display: 'flex', alignItems: 'center', gap: '6px' }}
          onClick={() => setActiveTab('schemes')}
        >
          <Award size={16} /> Govt Schemes
        </button>
      </div>

      {/* ── LOANS TAB ─────────────────────────────────────────────────────── */}
      {activeTab === 'loans' && (
        <div className="grid-cols-2 gap-8 items-start">
          {/* Loan Products List */}
          <div className="space-y-4" style={{ gridColumn: '1 / 2' }}>
            <div className="flex items-center gap-2 mb-2">
              <Landmark size={20} style={{ color: 'var(--primary)' }} />
              <h3 className="font-bold text-lg">Available Loan Schemes</h3>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                {loanProducts.length} Active
              </span>
            </div>

            {loanProducts.map((loan) => (
              <div
                key={loan.id}
                className="card"
                style={{
                  padding: '1.25rem',
                  border: loan.isNew ? '2px solid var(--primary)' : '1px solid var(--border)',
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                {/* New badge */}
                {loan.isNew && (
                  <div
                    style={{
                      position: 'absolute',
                      top: 0,
                      right: 0,
                      background: 'var(--primary)',
                      color: 'white',
                      fontSize: '0.65rem',
                      fontWeight: 800,
                      padding: '3px 10px',
                      borderBottomLeftRadius: '8px',
                      letterSpacing: '0.05em',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    <Bell size={10} /> NEW · MARKET LINKED
                  </div>
                )}

                <div className="flex items-start gap-3 mb-3">
                  <span style={{ fontSize: '2rem', lineHeight: 1 }}>{loan.logo}</span>
                  <div className="flex-1">
                    <h4 className="font-bold text-stone-800" style={{ fontSize: '1rem' }}>{loan.schemeName}</h4>
                    <p className="text-muted" style={{ fontSize: '0.78rem' }}>{loan.bank}</p>
                  </div>
                </div>

                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr 1fr',
                    gap: '0.5rem',
                    background: 'var(--bg-color)',
                    borderRadius: '10px',
                    padding: '0.75rem',
                    marginBottom: '0.75rem',
                  }}
                >
                  <div>
                    <p style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Interest</p>
                    <p style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--primary)' }}>{loan.interestRate}</p>
                  </div>
                  <div>
                    <p style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Max Amount</p>
                    <p style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-main)' }}>{loan.maxAmount}</p>
                  </div>
                  <div>
                    <p style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Tenure</p>
                    <p style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-main)' }}>{loan.tenure}</p>
                  </div>
                </div>

                <p className="text-muted" style={{ fontSize: '0.82rem', marginBottom: '0.75rem' }}>
                  <strong>Purpose:</strong> {loan.purpose}
                </p>

                <div className="space-y-1 mb-4">
                  {loan.highlights.map((h, i) => (
                    <div key={i} className="flex items-center gap-2" style={{ fontSize: '0.8rem', color: '#374151' }}>
                      <CheckCircle size={13} style={{ color: 'var(--primary)', flexShrink: 0 }} />
                      {h}
                    </div>
                  ))}
                </div>

                <button
                  className="btn w-full"
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                  onClick={() => window.open(loan.applyLink, '_blank')}
                >
                  Apply Online <ExternalLink size={14} />
                </button>
              </div>
            ))}
          </div>

          {/* Right Panel: Eligibility + Calculator */}
          <div className="space-y-6" style={{ gridColumn: '2 / 3' }}>
            {/* Eligibility Card */}
            <div className="card overflow-hidden">
              <div className="flex items-center gap-2 mb-4" style={{ color: 'var(--primary)' }}>
                <ShieldCheck size={22} />
                <h3 className="font-bold text-lg" style={{ margin: 0, color: 'var(--text-main)' }}>
                  {t('schemes.guidance')}
                </h3>
              </div>

              <div className="text-center py-4 bg-stone-50 rounded-2xl border border-stone-100 mb-4">
                <p className="text-xs font-bold text-stone-500 uppercase tracking-widest mb-1">
                  {t('schemes.probability')}
                </p>
                <div className="flex items-center justify-center gap-2">
                  <div
                    className={`text-3xl font-black ${
                      eligibility.status === 'high'
                        ? 'text-green-600'
                        : eligibility.status === 'medium'
                        ? 'text-blue-600'
                        : 'text-amber-600'
                    }`}
                  >
                    {t(`schemes.${eligibility.status}`).toUpperCase()}
                  </div>
                  <div className="text-stone-400 text-2xl font-light">/</div>
                  <div className="text-stone-700 text-2xl font-bold">{eligibility.score}%</div>
                </div>
              </div>

              <ul className="space-y-3">
                <li className="flex items-start gap-3 text-sm">
                  <CheckCircle size={16} className={user ? 'text-green-500 shrink-0 mt-0.5' : 'text-stone-300 shrink-0 mt-0.5'} />
                  <span className={user ? 'text-stone-700' : 'text-stone-400'}>Farmer Profile Registered</span>
                </li>
                <li className="flex items-start gap-3 text-sm">
                  <CheckCircle size={16} className={user?.primaryCrop ? 'text-green-500 shrink-0 mt-0.5' : 'text-stone-300 shrink-0 mt-0.5'} />
                  <span className={user?.primaryCrop ? 'text-stone-700' : 'text-stone-400'}>Primary Crop Added</span>
                </li>
                <li className="flex items-start gap-3 text-sm">
                  <CheckCircle size={16} className={user && parseFloat(user.landSize) > 0 ? 'text-green-500 shrink-0 mt-0.5' : 'text-stone-300 shrink-0 mt-0.5'} />
                  <span className={user && parseFloat(user.landSize) > 0 ? 'text-stone-700' : 'text-stone-400'}>Land Size Verified</span>
                </li>
              </ul>
            </div>

            {/* EMI Calculator */}
            <div className="card">
              <div className="flex items-center gap-2 mb-5" style={{ color: 'var(--primary)' }}>
                <Calculator size={22} />
                <h3 className="font-bold text-lg" style={{ margin: 0, color: 'var(--text-main)' }}>
                  {t('schemes.calculator')}
                </h3>
              </div>

              <div className="input-group">
                <label className="input-label">{t('schemes.loanAmount')}</label>
                <input
                  type="number"
                  className="input-field"
                  value={loanAmount}
                  onChange={(e) => setLoanAmount(e.target.value)}
                />
              </div>

              <div className="input-group mb-6">
                <label className="input-label">{t('schemes.duration')}</label>
                <input
                  type="range"
                  style={{ width: '100%', accentColor: 'var(--primary)' }}
                  min="6"
                  max="60"
                  step="6"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                />
                <div className="flex justify-between text-muted" style={{ fontSize: '0.8rem', marginTop: '0.5rem' }}>
                  <span>6 {t('schemes.mos')}</span>
                  <span style={{ fontWeight: 700, color: 'var(--primary)' }}>{duration} {t('schemes.mos')}</span>
                  <span>60 {t('schemes.mos')}</span>
                </div>
              </div>

              <div style={{ background: 'var(--bg-color)', padding: '1.25rem', borderRadius: '12px', border: '1px solid var(--border)' }}>
                <div className="flex justify-between mb-2">
                  <span className="text-muted text-sm">{t('schemes.interestRate')}</span>
                  <span className="font-bold text-sm">4% p.a.</span>
                </div>
                <div className="flex justify-between mb-4">
                  <span className="text-muted text-sm">{t('schemes.estimatedEmi')}</span>
                  <span style={{ fontWeight: 800, color: 'var(--primary)', fontSize: '1.25rem' }}>
                    ₹{Math.round(emi).toLocaleString()}
                  </span>
                </div>
                <div style={{ height: '1px', background: 'var(--border)', margin: '0.75rem 0' }} />
                <div className="flex justify-between">
                  <span className="text-muted text-sm">{t('schemes.totalRepayment')}</span>
                  <span className="font-bold text-sm">₹{Math.round(totalAmount).toLocaleString()}</span>
                </div>
              </div>

              <div className="mt-6">
                <h4 className="font-bold text-sm mb-3 uppercase tracking-wider text-stone-500">
                  {t('schemes.checklist')}
                </h4>
                <div className="space-y-2">
                  {[t('schemes.docLand'), t('schemes.docAadhaar'), t('schemes.docPhoto')].map((doc) => (
                    <div key={doc} className="flex items-center gap-3 text-sm text-stone-600 bg-stone-50 p-2.5 rounded-lg border border-stone-100">
                      <CheckCircle size={16} className="text-green-500" /> {doc}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── SCHEMES TAB ───────────────────────────────────────────────────── */}
      {activeTab === 'schemes' && (
        <div className="grid-cols-2 gap-8 items-start">
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <Award size={20} style={{ color: 'var(--primary)' }} />
              <h3 className="font-bold text-lg">Government Schemes</h3>
            </div>

            {SCHEMES_DATABASE.map((scheme) => {
              const isExpanded = expandedScheme === scheme.id;
              const score = getMatchScore(scheme, user);
              return (
                <div
                  key={scheme.id}
                  className="border border-stone-200 rounded-xl overflow-hidden transition-all hover:border-primary/50"
                  style={{ background: 'white' }}
                >
                  <div
                    className="p-4 cursor-pointer flex justify-between items-center"
                    onClick={() => setExpandedScheme(isExpanded ? null : scheme.id)}
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <h4 className="font-bold text-stone-800">{scheme.name}</h4>
                        <span
                          className="text-[10px] font-bold px-1.5 py-0.5 rounded"
                          style={{ background: `${scheme.tagColor}18`, color: scheme.tagColor }}
                        >
                          {scheme.tag}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                            score > 80 ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                          }`}
                        >
                          {score}% MATCH
                        </span>
                      </div>
                      <p className="text-xs text-muted line-clamp-1">{scheme.desc}</p>
                    </div>
                    {isExpanded ? <ChevronUp size={20} className="text-muted" /> : <ChevronDown size={20} className="text-muted" />}
                  </div>

                  {isExpanded && (
                    <div className="px-4 pb-4 pt-2 bg-stone-50 border-t border-stone-100">
                      <div className="mb-4">
                        <h5 className="text-xs font-bold uppercase text-stone-500 mb-2 flex items-center gap-1">
                          <Info size={12} /> {t('schemes.whyMatched')}
                        </h5>
                        <p className="text-sm text-stone-700 bg-white p-2 rounded-lg border border-stone-200">{scheme.whyMatch}</p>
                      </div>
                      <div className="mb-4">
                        <h5 className="text-xs font-bold uppercase text-stone-500 mb-2 flex items-center gap-1">
                          <CheckCircle size={12} /> {t('schemes.documentation')}
                        </h5>
                        <div className="space-y-1">
                          {scheme.docs.map((doc) => (
                            <div key={doc} className="flex items-center gap-2 text-sm text-stone-600">
                              <span className="w-1.5 h-1.5 rounded-full bg-primary" /> {doc}
                            </div>
                          ))}
                        </div>
                      </div>
                      <button
                        className="btn w-full flex items-center justify-center gap-2"
                        onClick={() => window.open(scheme.link, '_blank')}
                      >
                        {t('common.applyNow')} <ExternalLink size={14} />
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Right: Eligibility + Financial Partners */}
          <div className="space-y-6">
            <div className="card overflow-hidden">
              <div className="flex items-center gap-2 mb-4" style={{ color: 'var(--primary)' }}>
                <ShieldCheck size={22} />
                <h3 className="font-bold text-lg" style={{ margin: 0, color: 'var(--text-main)' }}>
                  {t('schemes.guidance')}
                </h3>
              </div>
              <div className="text-center py-4 bg-stone-50 rounded-2xl border border-stone-100 mb-4">
                <p className="text-xs font-bold text-stone-500 uppercase tracking-widest mb-1">{t('schemes.probability')}</p>
                <div className="flex items-center justify-center gap-2">
                  <div className={`text-3xl font-black ${eligibility.status === 'high' ? 'text-green-600' : eligibility.status === 'medium' ? 'text-blue-600' : 'text-amber-600'}`}>
                    {t(`schemes.${eligibility.status}`).toUpperCase()}
                  </div>
                  <div className="text-stone-400 text-2xl font-light">/</div>
                  <div className="text-stone-700 text-2xl font-bold">{eligibility.score}%</div>
                </div>
              </div>
              <ul className="space-y-3">
                <li className="flex items-start gap-3 text-sm">
                  <CheckCircle size={16} className={user ? 'text-green-500 shrink-0 mt-0.5' : 'text-stone-300 shrink-0 mt-0.5'} />
                  <span className={user ? 'text-stone-700' : 'text-stone-400'}>Farmer Profile Registered</span>
                </li>
                <li className="flex items-start gap-3 text-sm">
                  <CheckCircle size={16} className={user?.primaryCrop ? 'text-green-500 shrink-0 mt-0.5' : 'text-stone-300 shrink-0 mt-0.5'} />
                  <span className={user?.primaryCrop ? 'text-stone-700' : 'text-stone-400'}>Primary Crop Added</span>
                </li>
                <li className="flex items-start gap-3 text-sm">
                  <CheckCircle size={16} className={user && parseFloat(user.landSize) > 0 ? 'text-green-500 shrink-0 mt-0.5' : 'text-stone-300 shrink-0 mt-0.5'} />
                  <span className={user && parseFloat(user.landSize) > 0 ? 'text-stone-700' : 'text-stone-400'}>Land Size Verified</span>
                </li>
              </ul>
            </div>

            <div className="card">
              <h3 className="font-bold text-lg mb-4">{t('schemes.partners')}</h3>
              <div className="space-y-2">
                {[
                  { name: 'Canara Bank - Agri Digital Portal', link: 'https://portal.digiloans.canarabank.bank.in/ALOSportal' },
                  { name: 'PNB - Online Agriculture Loan Application', link: 'https://weblens.pnb.bank.in/lendperfect/home' },
                  { name: 'HDFC Bank - Kisan Shakti Loan', link: 'https://www.hdfcbank.com/personal/borrow/popular-loans/ruralloans/kisan-shakti-loan' },
                  { name: 'HDFC Bank - Retail Agri Loan', link: 'https://www.hdfcbank.com/sme/borrow/popular-loans/retail-agri-loans/eligibility' },
                  { name: 'Canara Bank - Vehicle to Agriculturists', link: 'https://www.canarabank.bank.in/loans/vehicle-loans/canara-vehicle-to-agriculturists' },
                ].map((partner) => (
                  <div key={partner.name} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100">
                    <span className="font-medium text-stone-700">{partner.name}</span>
                    <button
                      className="text-primary text-xs font-bold flex items-center gap-1"
                      onClick={() => window.open(partner.link, '_blank')}
                    >
                      {t('schemes.visitBank')} <ExternalLink size={12} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
