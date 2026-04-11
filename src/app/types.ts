export type Role = "farmer" | "buyer";
export type Screen = "landing" | "login" | "signup" | "farmer" | "buyer";

export type PriceSignal = {
  crop: string;
  mandi: string;
  today: number;
  weeklyTrend: string;
  demandIndex: number;
  alert: string;
};

export type Listing = {
  id: string;
  crop: string;
  quantity: string;
  price: number;
  buyer: string;
  location: string;
  demand: "High" | "Medium" | "Stable";
};

export type FarmerProfile = {
  name: string;
  district: string;
  state: string;
  language: string;
  landAcres: string;
  crop: string;
  irrigation: "Canal" | "Rain-fed" | "Drip" | "Borewell";
  annualIncome: string;
  aadhaarLinked: boolean;
  soilHealthCard: boolean;
  hasKcc: boolean;
  organic: boolean;
};

export type LoanOption = {
  id: string;
  name: string;
  amount: string;
  purpose: string;
  reason: string;
  nextStep: string;
};

export type Scheme = {
  id: string;
  name: string;
  tag: string;
  benefit: string;
  nextStep: string;
};

export type FarmerResponse = {
  farmer: {
    id: string;
    name: string;
    email: string;
  };
  profile: FarmerProfile;
  profileComplete: boolean;
  matchedSchemes: Scheme[];
  matchedLoans: LoanOption[];
  loanScore: number;
  topSignal: PriceSignal;
  priceSignals: PriceSignal[];
  marketListings: Listing[];
};

export type BootstrapResponse = {
  priceSignals: PriceSignal[];
  marketListings: Listing[];
  topSignal: PriceSignal;
};

export const emptyProfile: FarmerProfile = {
  name: "",
  district: "",
  state: "",
  language: "English",
  landAcres: "",
  crop: "",
  irrigation: "Rain-fed",
  annualIncome: "",
  aadhaarLinked: false,
  soilHealthCard: false,
  hasKcc: false,
  organic: false,
};
