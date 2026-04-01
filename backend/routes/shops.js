require('dotenv').config();
const express = require('express');
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcryptjs');
const db = require('../db/database');
const { authMiddleware } = require('../middleware/auth');
const { managerOnly } = require('../middleware/roleGuard');

const router = express.Router();

// GET /api/shops — manager sees all shops
router.get('/', authMiddleware, managerOnly, (req, res) => {
  try {
    const shops = db.prepare(`
      SELECT s.*, 
        COUNT(DISTINCT CASE WHEN u.role='owner' THEN u.id END) AS ownerCount,
        COUNT(DISTINCT CASE WHEN u.role='employee' THEN u.id END) AS employeeCount
      FROM shops s
      LEFT JOIN users u ON u.shop_id = s.id
      GROUP BY s.id
      ORDER BY s.createdAt DESC
    `).all();
    res.json(shops);
  } catch (err) {
    console.error('GET /shops error:', err);
    res.status(500).json({ error: 'Failed to fetch shops' });
  }
});

// POST /api/shops — manager creates a new shop
router.post('/', authMiddleware, managerOnly, (req, res) => {
  try {
    const { name } = req.body;
    if (!name?.trim()) return res.status(400).json({ error: 'Shop name is required' });

    const existing = db.prepare('SELECT id FROM shops WHERE name = ?').get(name.trim());
    if (existing) return res.status(409).json({ error: `Shop "${name.trim()}" already exists` });

    const id = uuidv4();
    db.prepare('INSERT INTO shops (id, name) VALUES (?, ?)').run(id, name.trim());
    const shop = db.prepare('SELECT * FROM shops WHERE id = ?').get(id);
    res.status(201).json(shop);
  } catch (err) {
    console.error('POST /shops error:', err);
    res.status(500).json({ error: 'Failed to create shop' });
  }
});

// DELETE /api/shops/:id — manager deletes a shop (cascades to users, products, sales)
router.delete('/:id', authMiddleware, managerOnly, (req, res) => {
  try {
    const shop = db.prepare('SELECT * FROM shops WHERE id = ?').get(req.params.id);
    if (!shop) return res.status(404).json({ error: 'Shop not found' });
    db.prepare('DELETE FROM shops WHERE id = ?').run(req.params.id);
    res.json({ message: `Shop "${shop.name}" deleted` });
  } catch (err) {
    console.error('DELETE /shops/:id error:', err);
    res.status(500).json({ error: 'Failed to delete shop' });
  }
});

// POST /api/shops/:id/owners — manager adds an owner to a shop
router.post('/:id/owners', authMiddleware, managerOnly, async (req, res) => {
  try {
    const shop = db.prepare('SELECT * FROM shops WHERE id = ?').get(req.params.id);
    if (!shop) return res.status(404).json({ error: 'Shop not found' });

    const { name, password, email, phone } = req.body;
    if (!name?.trim() || !password?.trim()) return res.status(400).json({ error: 'Name and password required' });

    const existing = db.prepare('SELECT id FROM users WHERE name = ?').get(name.trim());
    if (existing) return res.status(409).json({ error: `Username "${name.trim()}" already taken` });

    const id = uuidv4();
    const hashed = await bcrypt.hash(password, 10);
    db.prepare(
      'INSERT INTO users (id, name, password, role, email, phone, shop_id) VALUES (?, ?, ?, ?, ?, ?, ?)'
    ).run(id, name.trim(), hashed, 'owner', email || null, phone || null, req.params.id);

    const user = db.prepare('SELECT id, name, role, email, phone, shop_id FROM users WHERE id = ?').get(id);
    res.status(201).json(user);
  } catch (err) {
    console.error('POST /shops/:id/owners error:', err);
    res.status(500).json({ error: 'Failed to add owner' });
  }
});

// GET /api/shops/:id/users — manager gets all users of a shop
router.get('/:id/users', authMiddleware, managerOnly, (req, res) => {
  try {
    const users = db.prepare(
      'SELECT id, name, role, email, phone, shop_id FROM users WHERE shop_id = ?'
    ).all(req.params.id);
    res.json(users);
  } catch {
    res.status(500).json({ error: 'Failed to fetch shop users' });
  }
});

module.exports = router;
