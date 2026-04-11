import express from "express";

const app = express();
const port = 3001;

app.use(express.json());

const farmers = new Map();
const buyers = new Map();

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

const marketListings = [
  {
    id: "1",
    crop: "Onion",
    quantity: "120 quintals",
    price: 1725,
    buyer: "Nashik Fresh Aggregates",
    location: "Nashik",
    demand: "High",
  },
  {
    id: "2",
    crop: "Tomato",
    quantity: "80 crates",
    price: 980,
    buyer: "Pune Urban Retail",
    location: "Pune",
    demand: "Medium",
  },
];

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
    marketListings,
    topSignal: getTopSignal(),
  });
});

app.post("/api/auth/signup", (req, res) => {
  const { role, name, email } = req.body;
  const id = `${role}-${Date.now()}`;

  if (role === "farmer") {
    farmers.set(id, {
      id,
      role,
      name,
      email,
      profile: createEmptyProfile(name || "Farmer"),
    });
  } else {
    buyers.set(id, { id, role, name, email });
  }

  res.json({ userId: id, role });
});

app.post("/api/auth/login", (req, res) => {
  const { role, identifier } = req.body;
  const store = role === "farmer" ? farmers : buyers;
  const existing = [...store.values()].find((item) => item.email === identifier || item.name === identifier);

  if (existing) {
    return res.json({ userId: existing.id, role });
  }

  if (role === "farmer") {
    const id = `farmer-demo-${Date.now()}`;
    farmers.set(id, {
      id,
      role,
      name: "New Farmer",
      email: identifier,
      profile: createEmptyProfile("New Farmer"),
    });
    return res.json({ userId: id, role });
  }

  const id = `buyer-demo-${Date.now()}`;
  buyers.set(id, { id, role, name: "Buyer", email: identifier });
  return res.json({ userId: id, role });
});

app.get("/api/farmer/:id", (req, res) => {
  const farmer = farmers.get(req.params.id);
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
    marketListings,
  });
});

app.put("/api/farmer/:id/profile", (req, res) => {
  const farmer = farmers.get(req.params.id);
  if (!farmer) {
    return res.status(404).json({ message: "Farmer not found" });
  }

  farmer.profile = {
    ...farmer.profile,
    ...req.body,
  };

  res.json({
    profile: farmer.profile,
    profileComplete: isProfileComplete(farmer.profile),
    matchedSchemes: getMatchedSchemes(farmer.profile),
    matchedLoans: getMatchedLoans(farmer.profile),
    loanScore: getLoanScore(farmer.profile),
  });
});

app.listen(port, () => {
  console.log(`FarmSetu API running on http://localhost:${port}`);
});
