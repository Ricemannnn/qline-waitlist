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
`);

// Migration: Add columns to settings if they don't exist
try {
  db.prepare('ALTER TABLE settings ADD COLUMN total_tables INTEGER DEFAULT 10').run();
} catch (e) {}

try {
  db.prepare('ALTER TABLE settings ADD COLUMN menu_url TEXT').run();
} catch (e) {}

export default db;
