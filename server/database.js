import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dataDirectory = path.join(__dirname, "data");
const databaseFile = path.join(dataDirectory, "db.json");

const defaultMarketListings = [
  {
    id: 1,
    crop: "Wheat",
    qty: "50 Quintals",
    price: "Rs 2,200/qtl",
    details: "Clean grain and ready for dispatch.",
    farmer: "Rajesh Kumar",
    ownerPhone: "919876543210",
    address: "Ullal, Mangaluru, Karnataka",
    rating: 4.8,
    image: "https://images.pexels.com/photos/9456236/pexels-photo-9456236.jpeg?auto=compress&cs=tinysrgb&w=1200",
  },
  {
    id: 2,
    crop: "Rice",
    qty: "30 Quintals",
    price: "Rs 3,100/qtl",
    details: "Fresh harvest with organic practices.",
    farmer: "Suresh Patil",
    ownerPhone: "919812345678",
    address: "Surathkal, Mangaluru, Karnataka",
    rating: 4.9,
    image: "https://images.pexels.com/photos/4110251/pexels-photo-4110251.jpeg?auto=compress&cs=tinysrgb&w=1200",
  },
  {
    id: 3,
    crop: "Cotton",
    qty: "20 Quintals",
    price: "Rs 7,500/qtl",
    details: "Good quality cotton bales available.",
    farmer: "Ramesh Singh",
    ownerPhone: "919998887776",
    address: "Kadri, Mangaluru, Karnataka",
    rating: 4.5,
    image: "https://images.pexels.com/photos/10287682/pexels-photo-10287682.jpeg?auto=compress&cs=tinysrgb&w=1200",
  },
];

function createDefaultDatabase() {
  return {
    version: 1,
    accounts: {},
    farmers: {},
    buyers: {},
    marketListings: defaultMarketListings,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

function ensureDatabaseFile() {
  if (!fs.existsSync(dataDirectory)) {
    fs.mkdirSync(dataDirectory, { recursive: true });
  }

  if (!fs.existsSync(databaseFile)) {
    fs.writeFileSync(databaseFile, JSON.stringify(createDefaultDatabase(), null, 2));
  }
}

function loadDatabase() {
  ensureDatabaseFile();

  try {
    const raw = fs.readFileSync(databaseFile, "utf8");
    const parsed = JSON.parse(raw);
    return {
      ...createDefaultDatabase(),
      ...parsed,
      accounts: parsed.accounts || {},
      farmers: parsed.farmers || {},
      buyers: parsed.buyers || {},
      marketListings: Array.isArray(parsed.marketListings) ? parsed.marketListings : defaultMarketListings,
    };
  } catch (_error) {
    const fallback = createDefaultDatabase();
    fs.writeFileSync(databaseFile, JSON.stringify(fallback, null, 2));
    return fallback;
  }
}

let database = loadDatabase();

function saveDatabase() {
  database.updatedAt = new Date().toISOString();
  fs.writeFileSync(databaseFile, JSON.stringify(database, null, 2));
}

export function getDatabase() {
  return database;
}

export function updateDatabase(mutator) {
  const nextValue = mutator(database);
  if (nextValue) {
    database = nextValue;
  }
  saveDatabase();
  return database;
}

export function resetMarketListings() {
  database.marketListings = defaultMarketListings.map((listing) => ({ ...listing }));
  saveDatabase();
  return database.marketListings;
}

export function getDefaultMarketListings() {
  return defaultMarketListings.map((listing) => ({ ...listing }));
}

export function getDatabaseFilePath() {
  return databaseFile;
}
