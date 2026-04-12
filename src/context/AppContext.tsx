import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import type { LanguageCode } from '../i18n';
import sugarcaneImage from '../assets/sugarcane-botanical.webp';
import { readJson, sendJson, sendNoContent } from '../app/api';

export type User = {
  name: string;
  phone: string;
  address: string;
  password: string;
  landSize: string;
  primaryCrop: string;
};

export type MarketListing = {
  id: number;
  crop: string;
  qty: string;
  price: string;
  details: string;
  farmer: string;
  ownerPhone: string;
  address: string;
  rating: number;
  image: string;
};

type StoredAccounts = Record<string, User>;

interface Toast {
  id: number;
  message: string;
  type: 'success' | 'info' | 'warning' | 'error';
}

interface AppContextType {
  language: LanguageCode;
  setLanguage: (lang: LanguageCode) => void;
  user: User | null;
  isAdmin: boolean;
  accounts: StoredAccounts;
  marketListings: MarketListing[];
  refreshMarketListings: () => Promise<MarketListing[] | null>;
  registerUser: (user: User) => Promise<boolean>;
  accessAccount: (phone: string, password: string) => Promise<'success' | 'invalid_password' | 'not_found'>;
  signOut: () => void;
  adminSignIn: (pin: string) => boolean;
  adminSignOut: () => void;
  updateAccount: (phone: string, updates: Partial<Pick<User, 'name' | 'address' | 'landSize' | 'primaryCrop'>>) => Promise<boolean>;
  removeAccount: (phone: string) => Promise<boolean>;
  addMarketListing: (listing: Omit<MarketListing, 'id' | 'farmer' | 'ownerPhone' | 'rating' | 'image' | 'address'>) => void;
  updateMarketListing: (id: number, updates: Partial<Pick<MarketListing, 'crop' | 'qty' | 'price' | 'details'>>) => void;
  removeMarketListing: (id: number) => void;
  resetMarketListings: () => Promise<void>;
  toasts: Toast[];
  addToast: (message: string, type: Toast['type']) => void;
  removeToast: (id: number) => void;
  isMarketLive: boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const SESSION_KEY = 'kisanhub_current_phone';
const ADMIN_SESSION_KEY = 'kisanhub_admin_session';
const LISTINGS_KEY = 'kisanhub_market_listings';
const LANGUAGE_KEY = 'kisanhub_language';
const ADMIN_PIN = 'admin@123';

const cropImageMap: Record<string, string> = {
  wheat: 'https://images.pexels.com/photos/9456236/pexels-photo-9456236.jpeg?auto=compress&cs=tinysrgb&w=1200',
  rice: 'https://images.pexels.com/photos/4110251/pexels-photo-4110251.jpeg?auto=compress&cs=tinysrgb&w=1200',
  cotton: 'https://images.pexels.com/photos/10287682/pexels-photo-10287682.jpeg?auto=compress&cs=tinysrgb&w=1200',
  sugarcane: sugarcaneImage,
  soybean: 'https://images.pexels.com/photos/7421208/pexels-photo-7421208.jpeg?auto=compress&cs=tinysrgb&w=1200',
  default: 'https://images.pexels.com/photos/2132250/pexels-photo-2132250.jpeg?auto=compress&cs=tinysrgb&w=1200',
};

const getCropImage = (crop: string) => {
  const normalized = crop.trim().toLowerCase();
  return cropImageMap[normalized] || cropImageMap.default;
};

const DEFAULT_LISTINGS: MarketListing[] = [
  { id: 1, crop: 'Wheat', qty: '50 Quintals', price: 'Rs 2,200/qtl', details: 'Clean grain and ready for dispatch.', farmer: 'Rajesh Kumar', ownerPhone: '919876543210', address: 'Ullal, Mangaluru, Karnataka', rating: 4.8, image: cropImageMap.wheat },
  { id: 2, crop: 'Rice', qty: '30 Quintals', price: 'Rs 3,100/qtl', details: 'Fresh harvest with organic practices.', farmer: 'Suresh Patil', ownerPhone: '919812345678', address: 'Surathkal, Mangaluru, Karnataka', rating: 4.9, image: cropImageMap.rice },
  { id: 3, crop: 'Cotton', qty: '20 Quintals', price: 'Rs 7,500/qtl', details: 'Good quality cotton bales available.', farmer: 'Ramesh Singh', ownerPhone: '919998887776', address: 'Kadri, Mangaluru, Karnataka', rating: 4.5, image: cropImageMap.cotton },
];

type MarketListingsResponse = {
  listings: MarketListing[];
  lastUpdated: string;
};

type AccountsResponse = {
  accounts: StoredAccounts;
  databaseFile: string;
  lastUpdated: string;
};

type AccountResponse = {
  account: User;
};

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<LanguageCode>('en');
  const [accounts, setAccounts] = useState<StoredAccounts>({});
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [marketListings, setMarketListings] = useState<MarketListing[]>(DEFAULT_LISTINGS);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [isMarketLive, setIsMarketLive] = useState(false);

  const persistListings = (listings: MarketListing[]) => {
    setMarketListings(listings);
    window.localStorage.setItem(LISTINGS_KEY, JSON.stringify(listings));
  };

  const syncMarketListings = async () => {
    try {
      const data = await readJson<MarketListingsResponse>('/api/market-listings');
      persistListings(data.listings);
      setIsMarketLive(true);
      return data.listings;
    } catch (error) {
      console.error('Failed to sync market listings:', error);
      setIsMarketLive(false);
      return null;
    }
  };

  const syncAccounts = async (sessionPhone?: string | null) => {
    try {
      const data = await readJson<AccountsResponse>('/api/accounts');
      setAccounts(data.accounts);
      setIsMarketLive(true);

      const activePhone = (sessionPhone ?? window.localStorage.getItem(SESSION_KEY) ?? '').trim();
      if (activePhone && data.accounts[activePhone]) {
        setUser(data.accounts[activePhone]);
      } else if (activePhone) {
        setUser(null);
        window.localStorage.removeItem(SESSION_KEY);
      }

      return data.accounts;
    } catch (error) {
      console.error('Failed to sync accounts:', error);
      setIsMarketLive(false);
      return null;
    }
  };

  useEffect(() => {
    const savedSessionPhone = window.localStorage.getItem(SESSION_KEY);
    const savedListings = window.localStorage.getItem(LISTINGS_KEY);
    const savedAdminSession = window.localStorage.getItem(ADMIN_SESSION_KEY);
    const savedLanguage = window.localStorage.getItem(LANGUAGE_KEY) as LanguageCode | null;

    if (savedListings) {
      // Migrate old listings that were saved before the 'address' field was added
      const rawListings = JSON.parse(savedListings) as MarketListing[];
      const migratedListings = rawListings.map((listing) => {
        return {
          ...listing,
          address: listing.address || 'Mangaluru, Karnataka',
          image: getCropImage(listing.crop),
        };
      });
      setMarketListings(migratedListings);
      window.localStorage.setItem(LISTINGS_KEY, JSON.stringify(migratedListings));
    }

    if (savedLanguage) {
      setLanguageState(savedLanguage);
    }

    if (savedAdminSession === 'true') {
      setIsAdmin(true);
    }

    void syncAccounts(savedSessionPhone);
    void syncMarketListings();
  }, []);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      void syncMarketListings();
    }, 30000);

    return () => window.clearInterval(intervalId);
  }, []);

  useEffect(() => {
    window.localStorage.setItem(LANGUAGE_KEY, language);
    document.documentElement.lang = language;
  }, [language]);

  const addToast = (message: string, type: Toast['type'] = 'info') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      removeToast(id);
    }, 5000);
  };

  const removeToast = (id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const setLanguage = (lang: LanguageCode) => {
    setLanguageState(lang);
  };

  const registerUser = async (nextUser: User) => {
    const normalizedPhone = nextUser.phone.trim();
    const updatedUser = { ...nextUser, phone: normalizedPhone };
    const result = await sendJson<AccountResponse>('/api/accounts/register', {
      method: 'POST',
      body: JSON.stringify(updatedUser),
    });

    setAccounts((prevAccounts) => ({
      ...prevAccounts,
      [normalizedPhone]: result.account,
    }));
    window.localStorage.setItem(SESSION_KEY, normalizedPhone);
    setUser(result.account);
    await syncMarketListings();
    void syncAccounts(normalizedPhone);
    return true;
  };

  const accessAccount = async (phone: string, password: string) => {
    const normalizedPhone = phone.trim();
    try {
      const result = await sendJson<AccountResponse>('/api/accounts/login', {
        method: 'POST',
        body: JSON.stringify({ phone: normalizedPhone, password }),
      });
      setAccounts((prevAccounts) => ({
        ...prevAccounts,
        [normalizedPhone]: result.account,
      }));
      setUser(result.account);
      window.localStorage.setItem(SESSION_KEY, normalizedPhone);
      await syncMarketListings();
      void syncAccounts(normalizedPhone);
      return 'success';
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes('401')) {
          return 'invalid_password';
        }
        if (error.message.includes('404')) {
          return 'not_found';
        }
      }
      console.error('Failed to access account:', error);
      return 'not_found';
    }
  };

  const signOut = () => {
    setUser(null);
    window.localStorage.removeItem(SESSION_KEY);
  };

  const adminSignIn = (pin: string) => {
    const isValid = pin === ADMIN_PIN;
    if (!isValid) return false;

    setIsAdmin(true);
    window.localStorage.setItem(ADMIN_SESSION_KEY, 'true');
    return true;
  };

  const adminSignOut = () => {
    setIsAdmin(false);
    window.localStorage.removeItem(ADMIN_SESSION_KEY);
  };

  const updateAccount = async (
    phone: string,
    updates: Partial<Pick<User, 'name' | 'address' | 'landSize' | 'primaryCrop'>>
  ) => {
    const normalizedPhone = phone.trim();
    try {
      const data = await sendJson<AccountResponse>(`/api/accounts/${normalizedPhone}`, {
        method: 'PUT',
        body: JSON.stringify(updates),
      });
      setAccounts((prevAccounts) => ({
        ...prevAccounts,
        [normalizedPhone]: data.account,
      }));

      if (window.localStorage.getItem(SESSION_KEY) === normalizedPhone) {
        setUser(data.account);
      }
      return true;
    } catch (error) {
      console.error('Failed to update account:', error);
      setIsMarketLive(false);
      return false;
    }
  };

  const removeAccount = async (phone: string) => {
    const normalizedPhone = phone.trim();
    try {
      await sendNoContent(`/api/accounts/${normalizedPhone}`, {
        method: 'DELETE',
      });

      setAccounts((prevAccounts) => {
        const { [normalizedPhone]: _removedAccount, ...remainingAccounts } = prevAccounts;
        return remainingAccounts;
      });

      if (window.localStorage.getItem(SESSION_KEY) === normalizedPhone) {
        setUser(null);
        window.localStorage.removeItem(SESSION_KEY);
      }

      setMarketListings((prevListings) => {
        const nextListings = prevListings.filter((listing) => listing.ownerPhone !== normalizedPhone);
        window.localStorage.setItem(LISTINGS_KEY, JSON.stringify(nextListings));
        return nextListings;
      });

      return true;
    } catch (error) {
      console.error('Failed to remove account:', error);
      setIsMarketLive(false);
      return false;
    }
  };

  const addMarketListing = (listing: Omit<MarketListing, 'id' | 'farmer' | 'ownerPhone' | 'rating' | 'image' | 'address'>) => {
    if (!user) return;

    const optimisticListing: MarketListing = {
      id: Date.now(),
      crop: listing.crop,
      qty: listing.qty,
      price: listing.price,
      details: listing.details,
      farmer: user.name,
      ownerPhone: user.phone,
      address: user.address,
      rating: 5.0,
      image: getCropImage(listing.crop),
    };

    setMarketListings((currentListings) => {
      const nextListings = [optimisticListing, ...currentListings];
      window.localStorage.setItem(LISTINGS_KEY, JSON.stringify(nextListings));
      return nextListings;
    });

    void sendJson<{ listing: MarketListing }>('/api/market-listings', {
      method: 'POST',
      body: JSON.stringify({
        ...optimisticListing,
        id: undefined,
      }),
    })
      .then((data) => {
        setMarketListings((currentListings) => {
          const nextListings = currentListings.map((currentListing) =>
            currentListing.id === optimisticListing.id ? data.listing : currentListing,
          );
          window.localStorage.setItem(LISTINGS_KEY, JSON.stringify(nextListings));
          return nextListings;
        });
        setIsMarketLive(true);
      })
      .catch((error) => {
        console.error('Failed to create market listing:', error);
        setIsMarketLive(false);
      });
  };

  const updateMarketListing = (
    id: number,
    updates: Partial<Pick<MarketListing, 'crop' | 'qty' | 'price' | 'details'>>
  ) => {
    const previousListings = marketListings;
    const nextListings = marketListings.map((listing) => {
      if (listing.id !== id) return listing;
      const nextCrop = updates.crop ?? listing.crop;
      return {
        ...listing,
        ...updates,
        crop: nextCrop,
        image: getCropImage(nextCrop),
      };
    });

    persistListings(nextListings);

    void sendJson<{ listing: MarketListing }>(`/api/market-listings/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    })
      .then((data) => {
        persistListings(nextListings.map((listing) => (listing.id === id ? data.listing : listing)));
        setIsMarketLive(true);
      })
      .catch((error) => {
        console.error('Failed to update market listing:', error);
        persistListings(previousListings);
        setIsMarketLive(false);
      });
  };

  const removeMarketListing = (id: number) => {
    const previousListings = marketListings;
    const nextListings = marketListings.filter((listing) => listing.id !== id);
    persistListings(nextListings);

    void sendNoContent(`/api/market-listings/${id}`, {
      method: 'DELETE',
    })
      .then(() => {
        setIsMarketLive(true);
      })
      .catch((error) => {
        console.error('Failed to remove market listing:', error);
        persistListings(previousListings);
        setIsMarketLive(false);
      });
  };

  const resetMarketListings = async () => {
    try {
      const data = await sendJson<{ listings: MarketListing[] }>('/api/market-listings/reset', {
        method: 'POST',
      });
      persistListings(data.listings);
      setIsMarketLive(true);
    } catch (error) {
      console.error('Failed to reset market listings:', error);
      persistListings(DEFAULT_LISTINGS);
      setIsMarketLive(false);
    }
  };

  return (
    <AppContext.Provider
      value={{
        language,
        setLanguage,
        user,
        isAdmin,
        accounts,
        marketListings,
        refreshMarketListings: syncMarketListings,
        registerUser,
        accessAccount,
        signOut,
        adminSignIn,
        adminSignOut,
        updateAccount,
        removeAccount,
        addMarketListing,
        updateMarketListing,
        removeMarketListing,
        resetMarketListings,
        toasts,
        addToast,
        removeToast,
        isMarketLive,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};
