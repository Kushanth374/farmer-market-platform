import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { getDatabase, getDatabaseFilePath, resetMarketListings, updateDatabase } from "./database.js";

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..");
const distDirectory = path.join(projectRoot, "dist");
const port = Number(process.env.PORT || 3001);

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    return res.status(204).send();
  }

  next();
});

app.use(express.json());

const mandis = [
  { id: 1, name: "Lasalgaon", city: "Nashik", state: "Maharashtra", commodities: ["Onion"] },
  { id: 2, name: "Pimpalgaon", city: "Nashik", state: "Maharashtra", commodities: ["Tomato", "Onion"] },
  { id: 3, name: "Indore", city: "Indore", state: "Madhya Pradesh", commodities: ["Wheat", "Soybean", "Potato"] },
  { id: 4, name: "Khanna", city: "Khanna", state: "Punjab", commodities: ["Wheat", "Rice"] },
  { id: 5, name: "Unjha", city: "Unjha", state: "Gujarat", commodities: ["Cumin", "Mustard"] },
  { id: 6, name: "Warangal", city: "Warangal", state: "Telangana", commodities: ["Cotton", "Chilli"] },
  { id: 7, name: "Guntur", city: "Guntur", state: "Andhra Pradesh", commodities: ["Chilli", "Cotton"] },
  { id: 8, name: "Azadpur", city: "Delhi", state: "Delhi", commodities: ["Potato", "Tomato", "Apple"] },
  { id: 9, name: "Jalna", city: "Jalna", state: "Maharashtra", commodities: ["Soybean", "Sweet Lime"] },
  { id: 10, name: "Amritsar", city: "Amritsar", state: "Punjab", commodities: ["Rice", "Wheat"] },
  { id: 11, name: "Solapur", city: "Solapur", state: "Maharashtra", commodities: ["Onion", "Pomegranate"] },
  { id: 12, name: "Rajkot", city: "Rajkot", state: "Gujarat", commodities: ["Cotton", "Groundnut"] },
  { id: 13, name: "Kurnool", city: "Kurnool", state: "Andhra Pradesh", commodities: ["Onion", "Paddy"] },
  { id: 14, name: "Ujjain", city: "Ujjain", state: "Madhya Pradesh", commodities: ["Wheat", "Soybean"] },
  { id: 15, name: "Yeshwanthpur", city: "Bangalore", state: "Karnataka", commodities: ["Potato", "Onion"] }
];

const basePrices = {
  Wheat: 2350,
  Rice: 3100,
  Cotton: 7100,
  Soybean: 4600,
  Sugarcane: 315,
  Onion: 1850,
  Tomato: 1100,
  Potato: 1400,
  Chilli: 18000,
  Cumin: 28000
};

const priceSignals = [
  { crop: "Onion", mandi: "Lasalgaon", demandIndex: 91, trend: "up", price: 1850 },
  { crop: "Wheat", mandi: "Khanna", demandIndex: 84, trend: "up", price: 2350 },
  { crop: "Cotton", mandi: "Warangal", demandIndex: 79, trend: "down", price: 7100 },
  { crop: "Soybean", mandi: "Indore", demandIndex: 82, trend: "up", price: 4600 },
];

function getSimulatedPrice(commodity) {
  const base = basePrices[commodity] || 1000;
  // Fluctuate by +/- 2%
  const variance = (Math.random() * 0.04 - 0.02) * base;
  return Math.round(base + variance);
}

function getMandiIntelligence(searchTerm = "") {
  const filteredMandis = searchTerm 
    ? mandis.filter(m => 
        m.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        m.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.state.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : mandis.slice(0, 8);

  return filteredMandis.map(mandi => ({
    ...mandi,
    prices: mandi.commodities.map(comm => ({
      commodity: comm,
      price: getSimulatedPrice(comm),
      trend: Math.random() > 0.4 ? "up" : "down",
      variance: (Math.random() * 5).toFixed(1)
    }))
  }));
}

function getMarketSummary() {
  return {
    averages: {
      Wheat: getSimulatedPrice("Wheat"),
      Rice: getSimulatedPrice("Rice"),
      Cotton: getSimulatedPrice("Cotton"),
      Soybean: getSimulatedPrice("Soybean"),
    },
    trends: {
      Wheat: "+1.2%",
      Rice: "+2.5%",
      Cotton: "-0.8%",
      Soybean: "+1.8%"
    },
    lastUpdated: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
  };
}

function getCropImage(crop = "") {
  const normalized = crop.trim().toLowerCase();
  const images = {
    wheat: "https://images.pexels.com/photos/9456236/pexels-photo-9456236.jpeg?auto=compress&cs=tinysrgb&w=1200",
    rice: "https://images.pexels.com/photos/4110251/pexels-photo-4110251.jpeg?auto=compress&cs=tinysrgb&w=1200",
    cotton: "https://images.pexels.com/photos/10287682/pexels-photo-10287682.jpeg?auto=compress&cs=tinysrgb&w=1200",
    sugarcane: "https://images.pexels.com/photos/14593317/pexels-photo-14593317.jpeg?auto=compress&cs=tinysrgb&w=1200",
    soybean: "https://images.pexels.com/photos/7421208/pexels-photo-7421208.jpeg?auto=compress&cs=tinysrgb&w=1200",
    default: "https://images.pexels.com/photos/2132250/pexels-photo-2132250.jpeg?auto=compress&cs=tinysrgb&w=1200",
  };
  return images[normalized] || images.default;
}

function normalizeMarketListing(listing) {
  return {
    id: Number(listing.id),
    crop: listing.crop,
    qty: listing.qty,
    price: listing.price,
    details: listing.details || "",
    farmer: listing.farmer,
    ownerPhone: listing.ownerPhone,
    address: listing.address || "Mangaluru, Karnataka",
    rating: Number(listing.rating ?? 5),
    image: listing.image || getCropImage(listing.crop),
  };
}

function getMarketListings() {
  return getDatabase().marketListings;
}

function getAccounts() {
  return getDatabase().accounts;
}

function getFarmers() {
  return getDatabase().farmers;
}

function getBuyers() {
  return getDatabase().buyers;
}

function createEmptyProfile(name = "Farmer") {
  return {
    name,
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
}

function getTopSignal() {
  return [...priceSignals].sort((a, b) => b.demandIndex - a.demandIndex)[0];
}

function isProfileComplete(profile) {
  return Boolean(
    profile.name?.trim() &&
      profile.district?.trim() &&
      profile.state?.trim() &&
      profile.crop?.trim() &&
      Number(profile.landAcres) > 0 &&
      Number(profile.annualIncome) > 0,
  );
}

function getMatchedSchemes(profile) {
  const schemes = [];

  if (Number(profile.landAcres) <= 5 && profile.aadhaarLinked) {
    schemes.push({
      id: "pm-kisan",
      name: "PM-KISAN Income Support",
      tag: "Income",
      benefit: "Direct income support for small and marginal farmers.",
      nextStep: "Verify land records and bank seeding to receive the next installment.",
    });
  }

  if (profile.crop?.trim()) {
    schemes.push({
      id: "pmfby",
      name: "Pradhan Mantri Fasal Bima Yojana",
      tag: "Insurance",
      benefit: "Crop insurance support against weather and seasonal loss.",
      nextStep: "Register the notified crop and sowing details for your district.",
    });
  }

  if (profile.irrigation !== "Drip" && profile.crop?.trim()) {
    schemes.push({
      id: "micro-irrigation",
      name: "Micro Irrigation Subsidy",
      tag: "Subsidy",
      benefit: "Support for drip and sprinkler infrastructure.",
      nextStep: "Prepare a vendor estimate and irrigation requirement note.",
    });
  }

  return schemes;
}

function getLoanScore(profile) {
  if (!isProfileComplete(profile)) {
    return 0;
  }

  let score = 40;
  if (profile.aadhaarLinked) score += 20;
  if (profile.soilHealthCard) score += 10;
  if (Number(profile.landAcres) >= 2) score += 10;
  if (Number(profile.annualIncome) > 0 && Number(profile.annualIncome) < 250000) score += 10;
  if (!profile.hasKcc) score += 5;
  return Math.min(score, 100);
}

function getMatchedLoans(profile) {
  if (!isProfileComplete(profile)) {
    return [];
  }

  const loans = [
    {
      id: "seasonal-crop-loan",
      name: "Seasonal Crop Loan",
      amount: "Up to Rs 3,00,000",
      purpose: "Seeds, fertilizer, labor and seasonal crop operations.",
      reason: "Matched because crop, land acres and annual income details are available.",
      nextStep: "Take land proof, crop plan and bank details to a rural bank or cooperative branch.",
    },
  ];

  if (profile.aadhaarLinked && !profile.hasKcc) {
    loans.push({
      id: "kcc",
      name: "Kisan Credit Card",
      amount: "Flexible revolving crop credit",
      purpose: "Recurring working capital for crop cultivation.",
      reason: "Matched because Aadhaar is linked and no existing KCC is marked.",
      nextStep: "Apply with Aadhaar, land ownership records and cultivation details.",
    });
  }

  if (profile.irrigation !== "Drip" && Number(profile.landAcres) >= 1) {
    loans.push({
      id: "irrigation-upgrade-loan",
      name: "Irrigation Upgrade Loan",
      amount: "Up to Rs 2,50,000",
      purpose: "Water-efficiency upgrades like drip, pump or irrigation systems.",
      reason: "Matched because irrigation can be improved for the current farm setup.",
      nextStep: "Prepare an irrigation estimate and land details before applying.",
    });
  }

  return loans;
}

app.get("/api/market-intelligence", (req, res) => {
  const search = req.query.search || "";
  res.json({
    summary: getMarketSummary(),
    mandis: getMandiIntelligence(search)
  });
});

app.get("/api/bootstrap", (_req, res) => {
  res.json({
    marketSummary: getMarketSummary(),
    marketListings: getMarketListings().map(normalizeMarketListing),
    topSignal: getTopSignal(),
  });
});

app.get("/api/market-listings", (_req, res) => {
  res.json({
    listings: getMarketListings().map(normalizeMarketListing),
    lastUpdated: new Date().toISOString(),
  });
});

app.post("/api/market-listings", (req, res) => {
  const { crop, qty, price, details, farmer, ownerPhone, address, rating, image } = req.body || {};

  if (!crop || !qty || !price || !farmer || !ownerPhone) {
    return res.status(400).json({ message: "crop, qty, price, farmer and ownerPhone are required" });
  }

  const nextListing = normalizeMarketListing({
    id: Date.now(),
    crop,
    qty,
    price,
    details,
    farmer,
    ownerPhone,
    address,
    rating,
    image,
  });

  updateDatabase((db) => {
    db.marketListings = [nextListing, ...db.marketListings];
  });
  res.status(201).json({ listing: nextListing });
});

app.put("/api/market-listings/:id", (req, res) => {
  const marketListings = getMarketListings();
  const index = marketListings.findIndex((listing) => String(listing.id) === req.params.id);
  if (index === -1) {
    return res.status(404).json({ message: "Listing not found" });
  }

  const existing = marketListings[index];
  const updated = normalizeMarketListing({
    ...existing,
    ...req.body,
    id: existing.id,
  });

  updateDatabase((db) => {
    db.marketListings[index] = updated;
  });
  res.json({ listing: updated });
});

app.delete("/api/market-listings/:id", (req, res) => {
  const marketListings = getMarketListings();
  const existing = marketListings.find((listing) => String(listing.id) === req.params.id);
  if (!existing) {
    return res.status(404).json({ message: "Listing not found" });
  }

  updateDatabase((db) => {
    db.marketListings = db.marketListings.filter((listing) => String(listing.id) !== req.params.id);
  });
  res.status(204).send();
});

app.post("/api/market-listings/reset", (_req, res) => {
  const listings = resetMarketListings().map(normalizeMarketListing);
  res.json({ listings });
});

app.get("/api/accounts", (_req, res) => {
  res.json({
    accounts: getAccounts(),
    databaseFile: getDatabaseFilePath(),
    lastUpdated: getDatabase().updatedAt,
  });
});

app.post("/api/accounts/register", (req, res) => {
  const { name, phone, address, password, landSize, primaryCrop } = req.body || {};
  const normalizedPhone = String(phone || "").trim();

  if (!name || !normalizedPhone || !address || !password || !landSize || !primaryCrop) {
    return res.status(400).json({ message: "name, phone, address, password, landSize and primaryCrop are required" });
  }

  const account = {
    name: String(name).trim(),
    phone: normalizedPhone,
    address: String(address).trim(),
    password: String(password),
    landSize: String(landSize).trim(),
    primaryCrop: String(primaryCrop).trim(),
  };

  updateDatabase((db) => {
    db.accounts[normalizedPhone] = account;
  });

  res.status(201).json({ account });
});

app.post("/api/accounts/login", (req, res) => {
  const { phone, password } = req.body || {};
  const normalizedPhone = String(phone || "").trim();
  const account = getAccounts()[normalizedPhone];

  if (!account) {
    return res.status(404).json({ message: "Account not found", code: "not_found" });
  }

  if (account.password !== password) {
    return res.status(401).json({ message: "Invalid password", code: "invalid_password" });
  }

  res.json({ account });
});

app.put("/api/accounts/:phone", (req, res) => {
  const normalizedPhone = String(req.params.phone || "").trim();
  const accounts = getAccounts();
  const existing = accounts[normalizedPhone];

  if (!existing) {
    return res.status(404).json({ message: "Account not found" });
  }

  const updatedAccount = {
    ...existing,
    ...req.body,
    phone: normalizedPhone,
  };

  updateDatabase((db) => {
    db.accounts[normalizedPhone] = updatedAccount;
  });

  res.json({ account: updatedAccount });
});

app.delete("/api/accounts/:phone", (req, res) => {
  const normalizedPhone = String(req.params.phone || "").trim();
  const accounts = getAccounts();

  if (!accounts[normalizedPhone]) {
    return res.status(404).json({ message: "Account not found" });
  }

  updateDatabase((db) => {
    delete db.accounts[normalizedPhone];
    db.marketListings = db.marketListings.filter((listing) => listing.ownerPhone !== normalizedPhone);
  });

  res.status(204).send();
});

app.post("/api/auth/signup", (req, res) => {
  const { role, name, email } = req.body;
  const id = `${role}-${Date.now()}`;

  if (role === "farmer") {
    updateDatabase((db) => {
      db.farmers[id] = {
        id,
        role,
        name,
        email,
        profile: createEmptyProfile(name || "Farmer"),
      };
    });
  } else {
    updateDatabase((db) => {
      db.buyers[id] = { id, role, name, email };
    });
  }

  res.json({ userId: id, role });
});

app.post("/api/auth/login", (req, res) => {
  const { role, identifier } = req.body;
  const store = role === "farmer" ? getFarmers() : getBuyers();
  const existing = Object.values(store).find((item) => item.email === identifier || item.name === identifier);

  if (existing) {
    return res.json({ userId: existing.id, role });
  }

  if (role === "farmer") {
    const id = `farmer-demo-${Date.now()}`;
    updateDatabase((db) => {
      db.farmers[id] = {
        id,
        role,
        name: "New Farmer",
        email: identifier,
        profile: createEmptyProfile("New Farmer"),
      };
    });
    return res.json({ userId: id, role });
  }

  const id = `buyer-demo-${Date.now()}`;
  updateDatabase((db) => {
    db.buyers[id] = { id, role, name: "Buyer", email: identifier };
  });
  return res.json({ userId: id, role });
});

app.get("/api/farmer/:id", (req, res) => {
  const farmer = getFarmers()[req.params.id];
  if (!farmer) {
    return res.status(404).json({ message: "Farmer not found" });
  }

  const profile = farmer.profile;
  res.json({
    farmer: {
      id: farmer.id,
      name: farmer.name,
      email: farmer.email,
    },
    profile,
    profileComplete: isProfileComplete(profile),
    matchedSchemes: getMatchedSchemes(profile),
    matchedLoans: getMatchedLoans(profile),
    loanScore: getLoanScore(profile),
    topSignal: getTopSignal(),
    marketSummary: getMarketSummary(),
    mandiIntelligence: getMandiIntelligence(),
    marketListings: getMarketListings().map(normalizeMarketListing),
  });
});

app.put("/api/farmer/:id/profile", (req, res) => {
  const farmer = getFarmers()[req.params.id];
  if (!farmer) {
    return res.status(404).json({ message: "Farmer not found" });
  }

  farmer.profile = {
    ...farmer.profile,
    ...req.body,
  };

  updateDatabase((db) => {
    db.farmers[req.params.id] = farmer;
  });

  res.json({
    profile: farmer.profile,
    profileComplete: isProfileComplete(farmer.profile),
    matchedSchemes: getMatchedSchemes(farmer.profile),
    matchedLoans: getMatchedLoans(farmer.profile),
    loanScore: getLoanScore(farmer.profile),
  });
});

app.use(express.static(distDirectory));

app.get(/^(?!\/api).*/, (_req, res, next) => {
  res.sendFile(path.join(distDirectory, "index.html"), (error) => {
    if (error) {
      next(error);
    }
  });
});

app.listen(port, "0.0.0.0", () => {
  console.log(`FarmSetu app running on http://localhost:${port}`);
});
