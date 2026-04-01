const express = require('express');
const bcrypt  = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const db = require('../db/database');
const { authMiddleware } = require('../middleware/auth');
const { ownerOnly } = require('../middleware/roleGuard');

const router = express.Router();

// GET /api/users/me — returns current user's profile
router.get('/me', authMiddleware, (req, res) => {
  try {
    const user = db.prepare(
      'SELECT id, name, role, email, phone, shop_id FROM users WHERE id = ? OR name = ?'
    ).get(req.user.id, req.user.name);
    if (!user) return res.status(404).json({ error: 'User not found in RetailFlow' });
    res.json(user);
  } catch {
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// GET /api/users — owner sees employees of their own shop
router.get('/', authMiddleware, ownerOnly, (req, res) => {
  try {
    const owner = db.prepare('SELECT shop_id FROM users WHERE id = ?').get(req.user.id);
    const users = db.prepare(
      `SELECT id, name, role, email, phone, shop_id FROM users
       WHERE shop_id = ? AND role IN ('owner','employee')
       ORDER BY role DESC, name ASC`
    ).all(owner?.shop_id);
    res.json(users);
  } catch {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// POST /api/users — owner creates an employee for their shop
router.post('/', authMiddleware, ownerOnly, async (req, res) => {
  try {
    const owner = db.prepare('SELECT shop_id FROM users WHERE id = ?').get(req.user.id);
    if (!owner?.shop_id) return res.status(400).json({ error: 'Owner not tied to a shop' });

    const { name, password, role, email, phone } = req.body;
    if (!name?.trim() || !password || password.length < 4)
      return res.status(400).json({ error: 'Name and password (min 4 chars) required' });
    if (!role || !['employee'].includes(role))
      return res.status(400).json({ error: 'Owner can only create employee accounts' });

    const existing = db.prepare('SELECT id FROM users WHERE name = ?').get(name.trim());
    if (existing) return res.status(409).json({ error: 'Username already taken' });

    const id = uuidv4();
    const hashed = await bcrypt.hash(password, 10);
    db.prepare(
      'INSERT INTO users (id, name, password, role, email, phone, shop_id) VALUES (?, ?, ?, ?, ?, ?, ?)'
    ).run(id, name.trim(), hashed, 'employee', email || null, phone || null, owner.shop_id);

    res.status(201).json({ id, name: name.trim(), role: 'employee', email: email || null, phone: phone || null, shop_id: owner.shop_id });
  } catch {
    res.status(500).json({ error: 'Failed to create employee' });
  }
});

// DELETE /api/users/:id — owner deletes an employee from their shop only
router.delete('/:id', authMiddleware, ownerOnly, (req, res) => {
  try {
    if (req.user.id === req.params.id)
      return res.status(403).json({ error: 'You cannot remove yourself' });

    const owner = db.prepare('SELECT shop_id FROM users WHERE id = ?').get(req.user.id);
    const target = db.prepare('SELECT * FROM users WHERE id = ?').get(req.params.id);
    if (!target) return res.status(404).json({ error: 'User not found' });

    // Only allow deleting users from the same shop, and only employees
    if (target.shop_id !== owner?.shop_id)
      return res.status(403).json({ error: 'User does not belong to your shop' });
    if (target.role !== 'employee')
      return res.status(403).json({ error: 'Owners can only remove employees. Contact manager to remove an owner.' });

    db.prepare('DELETE FROM users WHERE id = ?').run(req.params.id);
    res.json({ message: 'Employee removed successfully' });
  } catch {
    res.status(500).json({ error: 'Failed to remove employee' });
  }
});

module.exports = router;
