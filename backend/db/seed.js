require('dotenv').config();
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const db = require('./database');

async function seed() {
  // ── SHOPS ──────────────────────────────────────────────────────────────────
  const shopCount = db.prepare('SELECT COUNT(*) AS cnt FROM shops').get();
  if (shopCount.cnt === 0) {
    console.log('Seeding shops...');
    const shopId = uuidv4();
    db.prepare('INSERT INTO shops (id, name) VALUES (?, ?)').run(shopId, 'Main Street Store');
    console.log('✓ Shops seeded');

    // ── USERS ─────────────────────────────────────────────────────────────────
    const userCount = db.prepare('SELECT COUNT(*) AS cnt FROM users').get();
    if (userCount.cnt === 0) {
      console.log('Seeding users...');
      const users = [
        // Manager — no shop_id (manages ALL shops)
        { id: uuidv4(), name: 'manager', password: 'MANAGER123',  role: 'manager',  email: 'manager@gmail.com',   phone: '9900000000', shop_id: null   },
        // Owner — tied to the sample shop
        { id: uuidv4(), name: 'owner1',  password: 'owner123',    role: 'owner',    email: 'owner@retailflow.in',  phone: '9900000001', shop_id: shopId },
        // Employee — tied to the sample shop
        { id: uuidv4(), name: 'priya',   password: 'priya123',    role: 'employee', email: 'priya@retailflow.in',  phone: '9900000002', shop_id: shopId },
      ];

      const insertUser = db.prepare(
        'INSERT INTO users (id, name, password, role, email, phone, shop_id) VALUES (?, ?, ?, ?, ?, ?, ?)'
      );

      for (const u of users) {
        const hashed = await bcrypt.hash(u.password, 10);
        insertUser.run(u.id, u.name, hashed, u.role, u.email, u.phone, u.shop_id);
      }
      console.log('✓ Users seeded');

      // ── PRODUCTS ────────────────────────────────────────────────────────────
      console.log('Seeding products...');
      const now = new Date().toISOString();
      const products = [
        { name: 'Basmati Rice (5kg)',   price: 450,  qty: 120, category: 'Grains'    },
        { name: 'Wheat Flour (10kg)',   price: 380,  qty: 85,  category: 'Grains'    },
        { name: 'Toor Dal (1kg)',       price: 160,  qty: 200, category: 'Pulses'    },
        { name: 'Moong Dal (1kg)',      price: 145,  qty: 150, category: 'Pulses'    },
        { name: 'Mustard Oil (1L)',     price: 185,  qty: 90,  category: 'Oils'      },
        { name: 'Sunflower Oil (1L)',   price: 165,  qty: 110, category: 'Oils'      },
        { name: 'Salt (1kg)',           price: 25,   qty: 300, category: 'Spices'    },
        { name: 'Turmeric Powder',      price: 85,   qty: 7,   category: 'Spices'    },
        { name: 'Red Chilli Powder',    price: 120,  qty: 5,   category: 'Spices'    },
        { name: 'Sugar (1kg)',          price: 55,   qty: 180, category: 'Sweeteners'},
        { name: 'Tea Leaves (500g)',    price: 220,  qty: 60,  category: 'Beverages' },
        { name: 'Biscuits Pack',        price: 40,   qty: 250, category: 'Snacks'    },
        { name: 'Soap Bar (Pack of 4)', price: 110,  qty: 80,  category: 'Personal'  },
        { name: 'Shampoo (200ml)',      price: 145,  qty: 40,  category: 'Personal'  },
        { name: 'Toothpaste (150g)',    price: 95,   qty: 70,  category: 'Personal'  },
      ];

      const insertProd = db.prepare(
        'INSERT INTO products (id, name, price, quantity, category, shop_id, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
      );

      for (const p of products) {
        insertProd.run(uuidv4(), p.name, p.price, p.qty, p.category, shopId, now, now);
      }
      console.log(`✓ ${products.length} products seeded`);
    }
  } else {
    console.log('Database already seeded, skipping...');
  }
}

module.exports = seed;
