import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const dbPath = join(__dirname, 'qline.db');

const db = new Database(dbPath);

// Initialize database schema
db.exec(`
  CREATE TABLE IF NOT EXISTS restaurants (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    clover_merchant_id TEXT UNIQUE,
    clover_access_token TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    restaurant_id TEXT NOT NULL,
    role TEXT DEFAULT 'admin',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (restaurant_id) REFERENCES restaurants (id)
  );

  CREATE TABLE IF NOT EXISTS waitlist (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    restaurant_id TEXT NOT NULL,
    guest_name TEXT NOT NULL,
    party_size INTEGER NOT NULL,
    phone_number TEXT,
    status TEXT DEFAULT 'waiting', -- waiting, seated, cancelled, notified
    joined_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (restaurant_id) REFERENCES restaurants (id)
  );

  CREATE TABLE IF NOT EXISTS reservations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    restaurant_id TEXT NOT NULL,
    guest_name TEXT NOT NULL,
    party_size INTEGER NOT NULL,
    phone_number TEXT,
    reservation_time DATETIME NOT NULL,
    status TEXT DEFAULT 'confirmed', -- confirmed, seated, cancelled, no-show
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (restaurant_id) REFERENCES restaurants (id)
  );

  CREATE TABLE IF NOT EXISTS settings (
    restaurant_id TEXT PRIMARY KEY,
    wait_time_per_party INTEGER DEFAULT 10,
    total_tables INTEGER DEFAULT 10,
    menu_url TEXT,
    sms_template TEXT DEFAULT 'Hi {guest_name}, your table at {restaurant_name} is ready!',
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (restaurant_id) REFERENCES restaurants (id)
  );

  CREATE TABLE IF NOT EXISTS tables (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    restaurant_id TEXT NOT NULL,
    name TEXT NOT NULL,
    capacity INTEGER DEFAULT 4,
    status TEXT DEFAULT 'available', -- available, occupied, reserved
    x INTEGER DEFAULT 0,
    y INTEGER DEFAULT 0,
    FOREIGN KEY (restaurant_id) REFERENCES restaurants (id)
  );

  CREATE TABLE IF NOT EXISTS dietary_restrictions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    code TEXT UNIQUE NOT NULL,
    label TEXT NOT NULL,
    category TEXT NOT NULL CHECK(category IN ('primary', 'secondary')),
    icon TEXT
  );

  CREATE TABLE IF NOT EXISTS allergies (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    code TEXT UNIQUE NOT NULL,
    label TEXT NOT NULL,
    category TEXT NOT NULL CHECK(category IN ('common', 'other'))
  );

  CREATE TABLE IF NOT EXISTS customer_dietary_profiles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    restaurant_id TEXT NOT NULL,
    guest_phone TEXT,
    guest_name TEXT NOT NULL,
    dietary_restrictions TEXT DEFAULT '[]',
    allergies TEXT DEFAULT '[]',
    other_needs TEXT DEFAULT '',
    restaurant_notes TEXT DEFAULT '',
    last_updated DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (restaurant_id) REFERENCES restaurants(id)
  );

  CREATE TABLE IF NOT EXISTS reservation_dietary (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    reservation_id INTEGER NOT NULL UNIQUE,
    dietary_restrictions TEXT DEFAULT '[]',
    allergies TEXT DEFAULT '[]',
    other_needs TEXT DEFAULT '',
    experience_suitable INTEGER DEFAULT 1,
    modification_requested TEXT DEFAULT '',
    modification_approved TEXT DEFAULT 'pending',
    FOREIGN KEY (reservation_id) REFERENCES reservations(id)
  );

  CREATE TABLE IF NOT EXISTS experiences (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    restaurant_id TEXT NOT NULL,
    name TEXT NOT NULL,
    description TEXT DEFAULT '',
    suitable_for TEXT DEFAULT '[]',
    not_suitable_for TEXT DEFAULT '[]',
    substitutions_available INTEGER DEFAULT 0,
    prep_notes TEXT DEFAULT '',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (restaurant_id) REFERENCES restaurants(id)
  );
  `);

  // Seed dietary_restrictions
  const drCount = db.prepare('SELECT COUNT(*) as count FROM dietary_restrictions').get();
  if (drCount.count === 0) {
  const insertDR = db.prepare('INSERT INTO dietary_restrictions (code, label, category, icon) VALUES (?, ?, ?, ?)');
  const dietaryItems = [
    ['gluten-free', 'Gluten-Free', 'primary', 'GF'],
    ['vegan', 'Vegan', 'primary', 'VG'],
    ['vegetarian', 'Vegetarian', 'primary', 'V'],
    ['pescatarian', 'Pescatarian', 'primary', 'P'],
    ['dairy-free', 'Dairy-Free', 'primary', 'DF'],
    ['soy-free', 'Soy-Free', 'primary', 'SF'],
    ['nut-free', 'Nut-Free', 'primary', 'NF'],
    ['halal', 'Halal', 'primary', 'HL'],
    ['kosher', 'Kosher', 'primary', 'KS'],
    ['low-sodium', 'Low-Sodium', 'secondary', 'LS'],
    ['low-carb', 'Low-Carb', 'secondary', 'LC'],
    ['keto', 'Keto', 'secondary', 'KT'],
    ['paleo', 'Paleo', 'secondary', 'PL'],
  ];
  const insertMany = db.transaction((items) => {
    for (const item of items) {
      insertDR.run(...item);
    }
  });
  insertMany(dietaryItems);
  }

  // Seed allergies
  const allergyCount = db.prepare('SELECT COUNT(*) as count FROM allergies').get();
  if (allergyCount.count === 0) {
  const insertAllergy = db.prepare('INSERT INTO allergies (code, label, category) VALUES (?, ?, ?)');
  const allergyItems = [
    ['peanut', 'Peanut', 'common'],
    ['tree-nut', 'Tree Nut', 'common'],
    ['shellfish', 'Shellfish', 'common'],
    ['fish', 'Fish', 'common'],
    ['egg', 'Egg', 'common'],
    ['milk', 'Milk', 'common'],
    ['soy', 'Soy', 'common'],
    ['wheat', 'Wheat', 'common'],
    ['sesame', 'Sesame', 'common'],
    ['alcohol', 'Alcohol', 'other'],
    ['garlic', 'Garlic', 'other'],
    ['onion', 'Onion', 'other'],
    ['nightshades', 'Nightshades', 'other'],
  ];
  const insertMany = db.transaction((items) => {
    for (const item of items) {
      insertAllergy.run(...item);
    }
  });
  insertMany(allergyItems);
  }

// Migration: Add columns to settings if they don't exist
try {
  db.prepare('ALTER TABLE settings ADD COLUMN total_tables INTEGER DEFAULT 10').run();
} catch (e) {}

try {
  db.prepare('ALTER TABLE settings ADD COLUMN menu_url TEXT').run();
} catch (e) {}

// Migration: Add current_guest_reservation_id to tables
try {
  db.prepare('ALTER TABLE tables ADD COLUMN current_guest_reservation_id INTEGER').run();
} catch (e) {}

export default db;
