import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import type { LanguageCode } from '../i18n';

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
  registerUser: (user: User) => void;
  accessAccount: (phone: string, password: string) =>  'success' | 'invalid_password' | 'not_found';
  signOut: () => void;
  adminSignIn: (pin: string) => boolean;
  adminSignOut: () => void;
  updateAccount: (phone: string, updates: Partial<Pick<User, 'name' | 'address' | 'landSize' | 'primaryCrop'>>) => void;
  removeAccount: (phone: string) => void;
  addMarketListing: (listing: Omit<MarketListing, 'id' | 'farmer' | 'ownerPhone' | 'rating' | 'image' | 'address'>) => void;
  updateMarketListing: (id: number, updates: Partial<Pick<MarketListing, 'crop' | 'qty' | 'price' | 'details'>>) => void;
  removeMarketListing: (id: number) => void;
  resetMarketListings: () => void;
  toasts: Toast[];
  addToast: (message: string, type: Toast['type']) => void;
  removeToast: (id: number) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const ACCOUNTS_KEY = 'kisanhub_accounts';
const SESSION_KEY = 'kisanhub_current_phone';
const ADMIN_SESSION_KEY = 'kisanhub_admin_session';
const LISTINGS_KEY = 'kisanhub_market_listings';
const LANGUAGE_KEY = 'kisanhub_language';
const ADMIN_PIN = 'admin@123';

const cropImageMap: Record<string, string> = {
  wheat: 'https://images.pexels.com/photos/326082/pexels-photo-326082.jpeg?auto=compress&cs=tinysrgb&w=1200',
  rice: 'https://images.pexels.com/photos/723198/pexels-photo-723198.jpeg?auto=compress&cs=tinysrgb&w=1200',
  cotton: 'https://images.pexels.com/photos/39353/cotton-plant-cotton-bolls-cotton-open-39353.jpeg?auto=compress&cs=tinysrgb&w=1200',
  sugarcane: 'https://images.pexels.com/photos/5503257/pexels-photo-5503257.jpeg?auto=compress&cs=tinysrgb&w=1200',
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

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<LanguageCode>('en');
  const [accounts, setAccounts] = useState<StoredAccounts>({});
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [marketListings, setMarketListings] = useState<MarketListing[]>(DEFAULT_LISTINGS);
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    const savedAccounts = window.localStorage.getItem(ACCOUNTS_KEY);
    const savedSessionPhone = window.localStorage.getItem(SESSION_KEY);
    const savedListings = window.localStorage.getItem(LISTINGS_KEY);
    const savedAdminSession = window.localStorage.getItem(ADMIN_SESSION_KEY);
    const savedLanguage = window.localStorage.getItem(LANGUAGE_KEY) as LanguageCode | null;

    if (savedAccounts) {
      const parsedAccounts = JSON.parse(savedAccounts) as StoredAccounts;
      setAccounts(parsedAccounts);

      if (savedSessionPhone && parsedAccounts[savedSessionPhone]) {
        setUser(parsedAccounts[savedSessionPhone]);
      }
    }

    if (savedListings) {
      const parsedAccounts = savedAccounts ? (JSON.parse(savedAccounts) as StoredAccounts) : {};
      // Migrate old listings that were saved before the 'address' field was added
      const rawListings = JSON.parse(savedListings) as MarketListing[];
      const migratedListings = rawListings.map((listing) => {
        if (!listing.address) {
          // Try to find the address from the registered account
          const ownerAccount = parsedAccounts[listing.ownerPhone];
          return { ...listing, address: ownerAccount?.address || 'Mangaluru, Karnataka' };
        }
        return listing;
      });
      setMarketListings(migratedListings);
    }

    if (savedLanguage) {
      setLanguageState(savedLanguage);
    }

    if (savedAdminSession === 'true') {
      setIsAdmin(true);
    }
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

  const registerUser = (nextUser: User) => {
    const normalizedPhone = nextUser.phone.trim();
    const updatedUser = { ...nextUser, phone: normalizedPhone };
    const nextAccounts = { ...accounts, [normalizedPhone]: updatedUser };

    setAccounts(nextAccounts);
    setUser(updatedUser);
    window.localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(nextAccounts));
    window.localStorage.setItem(SESSION_KEY, normalizedPhone);
  };

  const accessAccount = (phone: string, password: string) => {
    const normalizedPhone = phone.trim();
    const existingUser = accounts[normalizedPhone];

    if (!existingUser) {
      return 'not_found';
    }

    if (existingUser.password !== password) {
      return 'invalid_password';
    }

    setUser(existingUser);
    window.localStorage.setItem(SESSION_KEY, normalizedPhone);
    return 'success';
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

  const updateAccount = (
    phone: string,
    updates: Partial<Pick<User, 'name' | 'address' | 'landSize' | 'primaryCrop'>>
  ) => {
    const normalizedPhone = phone.trim();

    setAccounts((prevAccounts) => {
      const existing = prevAccounts[normalizedPhone];
      if (!existing) return prevAccounts;

      const nextAccounts: StoredAccounts = {
        ...prevAccounts,
        [normalizedPhone]: {
          ...existing,
          ...updates,
        },
      };

      window.localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(nextAccounts));

      const currentPhone = window.localStorage.getItem(SESSION_KEY);
      if (currentPhone === normalizedPhone) {
        setUser(nextAccounts[normalizedPhone]);
      }

      return nextAccounts;
    });
  };

  const removeAccount = (phone: string) => {
    const normalizedPhone = phone.trim();

    setAccounts((prevAccounts) => {
      if (!prevAccounts[normalizedPhone]) return prevAccounts;

      const { [normalizedPhone]: _removedAccount, ...remainingAccounts } = prevAccounts;
      window.localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(remainingAccounts));

      const currentPhone = window.localStorage.getItem(SESSION_KEY);
      if (currentPhone === normalizedPhone) {
        setUser(null);
        window.localStorage.removeItem(SESSION_KEY);
      }

      return remainingAccounts;
    });

    setMarketListings((prevListings) => {
      const nextListings = prevListings.filter((listing) => listing.ownerPhone !== normalizedPhone);
      window.localStorage.setItem(LISTINGS_KEY, JSON.stringify(nextListings));
      return nextListings;
    });
  };

  const addMarketListing = (listing: Omit<MarketListing, 'id' | 'farmer' | 'ownerPhone' | 'rating' | 'image' | 'address'>) => {
    if (!user) return;

    const nextListings: MarketListing[] = [
      {
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
      },
      ...marketListings,
    ];

    setMarketListings(nextListings);
    window.localStorage.setItem(LISTINGS_KEY, JSON.stringify(nextListings));
  };

  const updateMarketListing = (
    id: number,
    updates: Partial<Pick<MarketListing, 'crop' | 'qty' | 'price' | 'details'>>
  ) => {
    setMarketListings((prevListings) => {
      const nextListings = prevListings.map((listing) => {
        if (listing.id !== id) return listing;
        const nextCrop = updates.crop ?? listing.crop;
        return {
          ...listing,
          ...updates,
          crop: nextCrop,
          image: getCropImage(nextCrop),
        };
      });
      window.localStorage.setItem(LISTINGS_KEY, JSON.stringify(nextListings));
      return nextListings;
    });
  };

  const removeMarketListing = (id: number) => {
    setMarketListings((prevListings) => {
      const nextListings = prevListings.filter((listing) => listing.id !== id);
      window.localStorage.setItem(LISTINGS_KEY, JSON.stringify(nextListings));
      return nextListings;
    });
  };

  const resetMarketListings = () => {
    setMarketListings(DEFAULT_LISTINGS);
    window.localStorage.setItem(LISTINGS_KEY, JSON.stringify(DEFAULT_LISTINGS));
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
