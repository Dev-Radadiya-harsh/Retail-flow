const express = require('express');
const { v4: uuidv4 } = require('uuid');
const db = require('../db/database');
const { authMiddleware } = require('../middleware/auth');
const { ownerOnly } = require('../middleware/roleGuard');

const router = express.Router();

// GET /api/products/low-stock — returns products with quantity < 10
router.get('/low-stock', authMiddleware, (req, res) => {
  try {
    const items = db.prepare(
      'SELECT * FROM products WHERE quantity < 10 ORDER BY quantity ASC'
    ).all();
    res.json(items);
  } catch (err) {
    console.error('GET /products/low-stock error:', err);
    res.status(500).json({ error: 'Failed to fetch low stock products' });
  }
});

// GET /api/products — all authenticated users
router.get('/', authMiddleware, (req, res) => {
  try {
    const products = db.prepare('SELECT * FROM products ORDER BY createdAt DESC').all();
    res.json(products);
  } catch (err) {
    console.error('GET /products error:', err);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

// POST /api/products — owner only
router.post('/', authMiddleware, ownerOnly, (req, res) => {
  try {
    const { name, price, quantity, category } = req.body;

    if (!name || name.trim() === '') {
      return res.status(400).json({ error: 'Product name is required' });
    }
    if (price === undefined || price === null || isNaN(price) || Number(price) < 0) {
      return res.status(400).json({ error: 'Price must be a non-negative number' });
    }
    if (quantity === undefined || quantity === null || isNaN(quantity) || Number(quantity) < 0 || !Number.isInteger(Number(quantity))) {
      return res.status(400).json({ error: 'Quantity must be a non-negative integer' });
    }

    const now = new Date().toISOString();
    const id = uuidv4();

    db.prepare(
      'INSERT INTO products (id, name, price, quantity, category, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?)'
    ).run(id, name.trim(), Number(price), Number(quantity), category || '', now, now);

    const product = db.prepare('SELECT * FROM products WHERE id = ?').get(id);
    res.status(201).json(product);
  } catch (err) {
    console.error('POST /products error:', err);
    res.status(500).json({ error: 'Failed to create product' });
  }
});

// PUT /api/products/:id — owner only
router.put('/:id', authMiddleware, ownerOnly, (req, res) => {
  try {
    const { id } = req.params;
    const { name, price, quantity, category } = req.body;

    const existing = db.prepare('SELECT * FROM products WHERE id = ?').get(id);
    if (!existing) {
      return res.status(404).json({ error: 'Product not found' });
    }

    if (!name || name.trim() === '') {
      return res.status(400).json({ error: 'Product name is required' });
    }
    if (price === undefined || price === null || isNaN(price) || Number(price) < 0) {
      return res.status(400).json({ error: 'Price must be a non-negative number' });
    }
    if (quantity === undefined || quantity === null || isNaN(quantity) || Number(quantity) < 0 || !Number.isInteger(Number(quantity))) {
      return res.status(400).json({ error: 'Quantity must be a non-negative integer' });
    }

    const updatedAt = new Date().toISOString();

    db.prepare(
      'UPDATE products SET name = ?, price = ?, quantity = ?, category = ?, updatedAt = ? WHERE id = ?'
    ).run(name.trim(), Number(price), Number(quantity), category || '', updatedAt, id);

    const product = db.prepare('SELECT * FROM products WHERE id = ?').get(id);
    res.json(product);
  } catch (err) {
    console.error(`PUT /products/${req.params.id} error:`, err);
    res.status(500).json({ error: 'Failed to update product' });
  }
});

// DELETE /api/products/:id — owner only
router.delete('/:id', authMiddleware, ownerOnly, (req, res) => {
  try {
    const { id } = req.params;

    const existing = db.prepare('SELECT * FROM products WHERE id = ?').get(id);
    if (!existing) {
      return res.status(404).json({ error: 'Product not found' });
    }

    db.prepare('DELETE FROM products WHERE id = ?').run(id);
    res.json({ message: 'Product deleted successfully' });
  } catch (err) {
    console.error(`DELETE /products/${req.params.id} error:`, err);
    res.status(500).json({ error: 'Failed to delete product' });
  }
});

module.exports = router;
