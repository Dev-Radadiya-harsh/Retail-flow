require('dotenv').config();
const fs = require('fs');
const Database = require('better-sqlite3');
const path = require('path');

// Default: repo-local file. Production (e.g. Render): set DATABASE_PATH to a file on a persistent disk, e.g. /var/data/retailflow.db
const DB_PATH = process.env.DATABASE_PATH
  ? path.resolve(process.env.DATABASE_PATH)
  : path.join(__dirname, 'retailflow.db');

const dbDir = path.dirname(DB_PATH);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

if (process.env.NODE_ENV === 'production') {
  console.log('[database] SQLite file:', DB_PATH);
}

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
    billNumber TEXT,
    dateTime TEXT NOT NULL,
    items TEXT NOT NULL,
    totalAmount REAL NOT NULL,
    customerName TEXT DEFAULT '',
    customerPhone TEXT DEFAULT '',
    createdBy TEXT NOT NULL,
    sessionId TEXT,
    shop_id TEXT DEFAULT NULL,
    FOREIGN KEY(createdBy) REFERENCES users(id),
    FOREIGN KEY(shop_id) REFERENCES shops(id) ON DELETE CASCADE
  );
`);

function addColumnIfMissing(table, columnName, definition) {
  const cols = db.prepare(`PRAGMA table_info(${table})`).all();
  const exists = cols.some((c) => c.name === columnName);
  if (!exists) {
    db.exec(`ALTER TABLE ${table} ADD COLUMN ${columnName} ${definition}`);
  }
}

addColumnIfMissing('sales', 'billNumber', "TEXT");
addColumnIfMissing('sales', 'customerName', "TEXT DEFAULT ''");
addColumnIfMissing('sales', 'customerPhone', "TEXT DEFAULT ''");

// Backfill sales.shop_id for rows created before we started scoping by shop.
// Older code inserted sales with shop_id = NULL; we can infer it from the user who created the sale.
try {
  db.prepare(`
    UPDATE sales
    SET shop_id = (
      SELECT shop_id FROM users WHERE users.id = sales.createdBy
    )
    WHERE shop_id IS NULL
  `).run();
} catch (err) {
  // Not fatal for new deployments; just log.
  console.warn('[database] shop_id backfill skipped:', err?.message || err);
}

// Backfill products.shop_id based on sales history.
// Products created before scoping may have shop_id = NULL; once they appear in a sale,
// we can infer their shop from the sale.shop_id.
try {
  db.prepare(`
    UPDATE products
    SET shop_id = (
      SELECT s.shop_id
      FROM sales s
      JOIN json_each(s.items) je
      WHERE products.shop_id IS NULL
        AND json_extract(je.value, '$.productId') = products.id
        AND s.shop_id IS NOT NULL
      LIMIT 1
    )
    WHERE shop_id IS NULL
  `).run();
} catch (err) {
  console.warn('[database] products.shop_id backfill skipped:', err?.message || err);
}

module.exports = db;
