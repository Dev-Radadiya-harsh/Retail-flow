require('dotenv').config();
const Database = require('better-sqlite3');
const path = require('path');

const DB_PATH = path.join(__dirname, 'retailflow.db');
const db = new Database(DB_PATH);

db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

db.exec(`
  -- Shops (created by manager, each shop has its own owners + employees)
  CREATE TABLE IF NOT EXISTS shops (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    createdAt TEXT DEFAULT (datetime('now'))
  );

  -- Users table: manager has no shop, owner/employee are tied to a shop
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    role TEXT NOT NULL CHECK(role IN ('manager', 'owner', 'employee')),
    email TEXT DEFAULT NULL,
    phone TEXT DEFAULT NULL,
    shop_id TEXT DEFAULT NULL,
    FOREIGN KEY(shop_id) REFERENCES shops(id) ON DELETE SET NULL
  );

  CREATE TABLE IF NOT EXISTS products (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    price REAL NOT NULL CHECK(price >= 0),
    quantity INTEGER NOT NULL CHECK(quantity >= 0),
    category TEXT DEFAULT '',
    shop_id TEXT DEFAULT NULL,
    createdAt TEXT NOT NULL,
    updatedAt TEXT NOT NULL,
    FOREIGN KEY(shop_id) REFERENCES shops(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS sales (
    id TEXT PRIMARY KEY,
    dateTime TEXT NOT NULL,
    items TEXT NOT NULL,
    totalAmount REAL NOT NULL,
    createdBy TEXT NOT NULL,
    sessionId TEXT,
    shop_id TEXT DEFAULT NULL,
    FOREIGN KEY(createdBy) REFERENCES users(id),
    FOREIGN KEY(shop_id) REFERENCES shops(id) ON DELETE CASCADE
  );
`);

module.exports = db;
