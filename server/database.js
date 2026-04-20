import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { neon } from "@neondatabase/serverless";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dataDirectory = path.join(__dirname, "data");
const databaseFile = path.join(dataDirectory, "db.json");
const databaseUrl = process.env.DATABASE_URL || "";
const isHostedDatabaseEnabled = Boolean(databaseUrl);
const isVercelDeployment = Boolean(process.env.VERCEL);

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
    marketListings: defaultMarketListings.map((listing) => ({ ...listing })),
    orders: [],
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

function loadFileDatabase() {
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
      marketListings: Array.isArray(parsed.marketListings) ? parsed.marketListings : defaultMarketListings.map((listing) => ({ ...listing })),
      orders: Array.isArray(parsed.orders) ? parsed.orders : [],
    };
  } catch (_error) {
    const fallback = createDefaultDatabase();
    fs.writeFileSync(databaseFile, JSON.stringify(fallback, null, 2));
    return fallback;
  }
}

let fileDatabase = loadFileDatabase();

function createStorageConfigurationError() {
  const error = new Error(
    "This Vercel deployment is missing DATABASE_URL. Add a hosted Postgres connection string in Vercel Project Settings, then redeploy.",
  );
  error.statusCode = 503;
  return error;
}

function assertWritableDatabaseAvailable() {
  if (isVercelDeployment && !isHostedDatabaseEnabled) {
    throw createStorageConfigurationError();
  }
}

function saveFileDatabase() {
  fileDatabase.updatedAt = new Date().toISOString();
  fs.writeFileSync(databaseFile, JSON.stringify(fileDatabase, null, 2));
}

const sql = isHostedDatabaseEnabled ? neon(databaseUrl) : null;
let hostedInitPromise = null;

function toAccountRecord(row) {
  return {
    name: row.name,
    phone: row.phone,
    address: row.address,
    password: row.password,
    landSize: row.land_size,
    primaryCrop: row.primary_crop,
  };
}

function toFarmerRecord(row) {
  return {
    id: row.id,
    role: row.role,
    name: row.name,
    email: row.email,
    profile: row.profile || {},
  };
}

function toBuyerRecord(row) {
  return {
    id: row.id,
    role: row.role,
    name: row.name,
    email: row.email,
  };
}

function toMarketListingRecord(row) {
  return {
    id: Number(row.id),
    crop: row.crop,
    qty: row.qty,
    price: row.price,
    details: row.details || "",
    farmer: row.farmer,
    ownerPhone: row.owner_phone,
    address: row.address,
    rating: Number(row.rating ?? 5),
    image: row.image,
  };
}

function toOrderRecord(row) {
  return {
    id: Number(row.id),
    buyerPhone: row.buyer_phone,
    sellerPhone: row.seller_phone,
    listingId: row.listing_id == null ? null : Number(row.listing_id),
    crop: row.crop,
    qty: row.qty,
    unitPrice: Number(row.unit_price ?? 0),
    totalPrice: Number(row.total_price ?? 0),
    txId: row.tx_id,
    sellerName: row.seller_name || "",
    sellerAddress: row.seller_address || "",
    status: row.status || "paid",
    createdAt: new Date(row.created_at).toISOString(),
  };
}

async function ensureHostedDatabase() {
  if (!isHostedDatabaseEnabled) {
    return;
  }

  if (!hostedInitPromise) {
    hostedInitPromise = (async () => {
      const localSeed = loadFileDatabase();

      await sql`
        CREATE TABLE IF NOT EXISTS app_meta (
          id SMALLINT PRIMARY KEY,
          created_at TIMESTAMPTZ NOT NULL,
          updated_at TIMESTAMPTZ NOT NULL
        )
      `;
      await sql`
        CREATE TABLE IF NOT EXISTS accounts (
          phone TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          address TEXT NOT NULL,
          password TEXT NOT NULL,
          land_size TEXT NOT NULL,
          primary_crop TEXT NOT NULL
        )
      `;
      await sql`
        CREATE TABLE IF NOT EXISTS farmers (
          id TEXT PRIMARY KEY,
          role TEXT NOT NULL,
          name TEXT NOT NULL,
          email TEXT NOT NULL,
          profile JSONB NOT NULL DEFAULT '{}'::jsonb
        )
      `;
      await sql`
        CREATE TABLE IF NOT EXISTS buyers (
          id TEXT PRIMARY KEY,
          role TEXT NOT NULL,
          name TEXT NOT NULL,
          email TEXT NOT NULL
        )
      `;
      await sql`
        CREATE TABLE IF NOT EXISTS market_listings (
          id BIGINT PRIMARY KEY,
          crop TEXT NOT NULL,
          qty TEXT NOT NULL,
          price TEXT NOT NULL,
          details TEXT NOT NULL DEFAULT '',
          farmer TEXT NOT NULL,
          owner_phone TEXT NOT NULL,
          address TEXT NOT NULL,
          rating DOUBLE PRECISION NOT NULL DEFAULT 5,
          image TEXT NOT NULL
        )
      `;
      await sql`
        CREATE TABLE IF NOT EXISTS orders (
          id BIGINT PRIMARY KEY,
          buyer_phone TEXT NOT NULL,
          seller_phone TEXT NOT NULL,
          listing_id BIGINT,
          crop TEXT NOT NULL,
          qty TEXT NOT NULL,
          unit_price DOUBLE PRECISION NOT NULL DEFAULT 0,
          total_price DOUBLE PRECISION NOT NULL DEFAULT 0,
          tx_id TEXT NOT NULL,
          seller_name TEXT NOT NULL DEFAULT '',
          seller_address TEXT NOT NULL DEFAULT '',
          status TEXT NOT NULL DEFAULT 'paid',
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )
      `;

      const metaRows = await sql`SELECT id FROM app_meta WHERE id = 1`;
      if (metaRows.length === 0) {
        const now = new Date().toISOString();
        await sql`
          INSERT INTO app_meta (id, created_at, updated_at)
          VALUES (1, ${now}, ${now})
        `;
      }

      const accountRows = await sql`SELECT phone FROM accounts LIMIT 1`;
      if (accountRows.length === 0) {
        for (const account of Object.values(localSeed.accounts || {})) {
          await sql`
            INSERT INTO accounts (phone, name, address, password, land_size, primary_crop)
            VALUES (
              ${String(account.phone || "").trim()},
              ${String(account.name || "").trim()},
              ${String(account.address || "").trim()},
              ${String(account.password || "")},
              ${String(account.landSize || "").trim()},
              ${String(account.primaryCrop || "").trim()}
            )
          `;
        }
      }

      const farmerRows = await sql`SELECT id FROM farmers LIMIT 1`;
      if (farmerRows.length === 0) {
        for (const farmer of Object.values(localSeed.farmers || {})) {
          await sql`
            INSERT INTO farmers (id, role, name, email, profile)
            VALUES (
              ${String(farmer.id || "")},
              ${String(farmer.role || "farmer")},
              ${String(farmer.name || "")},
              ${String(farmer.email || "")},
              ${JSON.stringify(farmer.profile || {})}::jsonb
            )
          `;
        }
      }

      const buyerRows = await sql`SELECT id FROM buyers LIMIT 1`;
      if (buyerRows.length === 0) {
        for (const buyer of Object.values(localSeed.buyers || {})) {
          await sql`
            INSERT INTO buyers (id, role, name, email)
            VALUES (
              ${String(buyer.id || "")},
              ${String(buyer.role || "buyer")},
              ${String(buyer.name || "")},
              ${String(buyer.email || "")}
            )
          `;
        }
      }

      const listingRows = await sql`SELECT id FROM market_listings LIMIT 1`;
      if (listingRows.length === 0) {
        for (const listing of localSeed.marketListings || defaultMarketListings) {
          await sql`
            INSERT INTO market_listings (id, crop, qty, price, details, farmer, owner_phone, address, rating, image)
            VALUES (
              ${listing.id},
              ${listing.crop},
              ${listing.qty},
              ${listing.price},
              ${listing.details || ""},
              ${listing.farmer},
              ${listing.ownerPhone},
              ${listing.address},
              ${listing.rating ?? 5},
              ${listing.image}
            )
          `;
        }
      }

      const orderRows = await sql`SELECT id FROM orders LIMIT 1`;
      if (orderRows.length === 0) {
        for (const order of localSeed.orders || []) {
          await sql`
            INSERT INTO orders (
              id,
              buyer_phone,
              seller_phone,
              listing_id,
              crop,
              qty,
              unit_price,
              total_price,
              tx_id,
              seller_name,
              seller_address,
              status,
              created_at
            )
            VALUES (
              ${Number(order.id)},
              ${String(order.buyerPhone || "")},
              ${String(order.sellerPhone || "")},
              ${order.listingId == null ? null : Number(order.listingId)},
              ${String(order.crop || "")},
              ${String(order.qty || "")},
              ${Number(order.unitPrice || 0)},
              ${Number(order.totalPrice || 0)},
              ${String(order.txId || "")},
              ${String(order.sellerName || "")},
              ${String(order.sellerAddress || "")},
              ${String(order.status || "paid")},
              ${order.createdAt ? new Date(order.createdAt).toISOString() : new Date().toISOString()}
            )
          `;
        }
      }
    })();
  }

  await hostedInitPromise;
}

async function markHostedDatabaseUpdated() {
  const now = new Date().toISOString();
  await sql`UPDATE app_meta SET updated_at = ${now} WHERE id = 1`;
}

async function loadHostedDatabase() {
  await ensureHostedDatabase();

  const [metaRows, accountRows, farmerRows, buyerRows, listingRows, orderRows] = await Promise.all([
    sql`SELECT created_at, updated_at FROM app_meta WHERE id = 1`,
    sql`SELECT * FROM accounts`,
    sql`SELECT * FROM farmers`,
    sql`SELECT * FROM buyers`,
    sql`SELECT * FROM market_listings ORDER BY id DESC`,
    sql`SELECT * FROM orders ORDER BY created_at DESC, id DESC`,
  ]);

  const meta = metaRows[0];
  const accounts = Object.fromEntries(accountRows.map((row) => [row.phone, toAccountRecord(row)]));
  const farmers = Object.fromEntries(farmerRows.map((row) => [row.id, toFarmerRecord(row)]));
  const buyers = Object.fromEntries(buyerRows.map((row) => [row.id, toBuyerRecord(row)]));

  return {
    version: 1,
    accounts,
    farmers,
    buyers,
    marketListings: listingRows.map(toMarketListingRecord),
    orders: orderRows.map(toOrderRecord),
    createdAt: new Date(meta?.created_at || new Date().toISOString()).toISOString(),
    updatedAt: new Date(meta?.updated_at || new Date().toISOString()).toISOString(),
  };
}

async function saveHostedDatabase(database) {
  await ensureHostedDatabase();

  await sql`TRUNCATE TABLE accounts`;
  for (const account of Object.values(database.accounts || {})) {
    await sql`
      INSERT INTO accounts (phone, name, address, password, land_size, primary_crop)
      VALUES (
        ${String(account.phone || "").trim()},
        ${String(account.name || "").trim()},
        ${String(account.address || "").trim()},
        ${String(account.password || "")},
        ${String(account.landSize || "").trim()},
        ${String(account.primaryCrop || "").trim()}
      )
    `;
  }

  await sql`TRUNCATE TABLE farmers`;
  for (const farmer of Object.values(database.farmers || {})) {
    await sql`
      INSERT INTO farmers (id, role, name, email, profile)
      VALUES (
        ${String(farmer.id || "")},
        ${String(farmer.role || "farmer")},
        ${String(farmer.name || "")},
        ${String(farmer.email || "")},
        ${JSON.stringify(farmer.profile || {})}::jsonb
      )
    `;
  }

  await sql`TRUNCATE TABLE buyers`;
  for (const buyer of Object.values(database.buyers || {})) {
    await sql`
      INSERT INTO buyers (id, role, name, email)
      VALUES (
        ${String(buyer.id || "")},
        ${String(buyer.role || "buyer")},
        ${String(buyer.name || "")},
        ${String(buyer.email || "")}
      )
    `;
  }

  await sql`TRUNCATE TABLE market_listings`;
  for (const listing of database.marketListings || []) {
    await sql`
      INSERT INTO market_listings (id, crop, qty, price, details, farmer, owner_phone, address, rating, image)
      VALUES (
        ${Number(listing.id)},
        ${String(listing.crop || "")},
        ${String(listing.qty || "")},
        ${String(listing.price || "")},
        ${String(listing.details || "")},
        ${String(listing.farmer || "")},
        ${String(listing.ownerPhone || "")},
        ${String(listing.address || "")},
        ${Number(listing.rating ?? 5)},
        ${String(listing.image || "")}
      )
    `;
  }

  await sql`TRUNCATE TABLE orders`;
  for (const order of database.orders || []) {
    await sql`
      INSERT INTO orders (
        id,
        buyer_phone,
        seller_phone,
        listing_id,
        crop,
        qty,
        unit_price,
        total_price,
        tx_id,
        seller_name,
        seller_address,
        status,
        created_at
      )
      VALUES (
        ${Number(order.id)},
        ${String(order.buyerPhone || "")},
        ${String(order.sellerPhone || "")},
        ${order.listingId == null ? null : Number(order.listingId)},
        ${String(order.crop || "")},
        ${String(order.qty || "")},
        ${Number(order.unitPrice || 0)},
        ${Number(order.totalPrice || 0)},
        ${String(order.txId || "")},
        ${String(order.sellerName || "")},
        ${String(order.sellerAddress || "")},
        ${String(order.status || "paid")},
        ${order.createdAt ? new Date(order.createdAt).toISOString() : new Date().toISOString()}
      )
    `;
  }

  await markHostedDatabaseUpdated();
}

export async function getDatabase() {
  if (!isHostedDatabaseEnabled) {
    return fileDatabase;
  }

  return loadHostedDatabase();
}

export async function updateDatabase(mutator) {
  assertWritableDatabaseAvailable();

  if (!isHostedDatabaseEnabled) {
    const nextValue = await mutator(fileDatabase);
    if (nextValue) {
      fileDatabase = nextValue;
    }
    saveFileDatabase();
    return fileDatabase;
  }

  const database = await loadHostedDatabase();
  const nextValue = await mutator(database);
  const finalValue = nextValue || database;
  await saveHostedDatabase(finalValue);
  return finalValue;
}

export async function resetMarketListings() {
  assertWritableDatabaseAvailable();

  if (!isHostedDatabaseEnabled) {
    fileDatabase.marketListings = defaultMarketListings.map((listing) => ({ ...listing }));
    saveFileDatabase();
    return fileDatabase.marketListings;
  }

  const database = await loadHostedDatabase();
  database.marketListings = defaultMarketListings.map((listing) => ({ ...listing }));
  await saveHostedDatabase(database);
  return database.marketListings;
}

export function getDefaultMarketListings() {
  return defaultMarketListings.map((listing) => ({ ...listing }));
}

export function getDatabaseFilePath() {
  return isHostedDatabaseEnabled ? "hosted-postgres" : databaseFile;
}

export function isUsingHostedDatabase() {
  return isHostedDatabaseEnabled;
}
