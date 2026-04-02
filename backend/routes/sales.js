const express = require('express');
const { v4: uuidv4 } = require('uuid');
const db = require('../db/database');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// POST /api/sales — create sale + deduct stock (all authenticated users)
router.post('/', authMiddleware, (req, res) => {
  try {
    const { items, sessionId, customerName = '', customerPhone = '' } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Sale must include at least one item' });
    }

    // Validate all items and check stock in a transaction
    const createSale = db.transaction(() => {
      let totalAmount = 0;
      const validatedItems = [];

      for (const item of items) {
        const product = db.prepare('SELECT * FROM products WHERE id = ?').get(item.productId);

        if (!product) {
          throw new Error(`Product not found: ${item.productId}`);
        }
        if (item.quantity < 1) {
          throw new Error(`Invalid quantity for ${product.name}`);
        }
        if (item.quantity > product.quantity) {
          throw new Error(`Insufficient stock for ${product.name}. Only ${product.quantity} available.`);
        }

        const itemTotal = product.price * item.quantity;
        totalAmount += itemTotal;

        validatedItems.push({
          productId: product.id,
          productName: product.name,
          price: product.price,
          quantity: item.quantity,
          total: itemTotal
        });

        // Deduct stock
        db.prepare(
          'UPDATE products SET quantity = quantity - ?, updatedAt = ? WHERE id = ?'
        ).run(item.quantity, new Date().toISOString(), product.id);
      }

      // Record the sale
      const saleId = uuidv4();
      const dateTime = new Date().toISOString();
      const billNumber = `BILL-${Date.now().toString().slice(-8)}`;

      db.prepare(
        'INSERT INTO sales (id, billNumber, dateTime, items, totalAmount, customerName, customerPhone, createdBy, sessionId) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)'
      ).run(
        saleId,
        billNumber,
        dateTime,
        JSON.stringify(validatedItems),
        totalAmount,
        String(customerName || '').trim(),
        String(customerPhone || '').trim(),
        req.user.id,
        sessionId || null
      );

      return db.prepare('SELECT * FROM sales WHERE id = ?').get(saleId);
    });

    const sale = createSale();
    // Parse items back to array before sending
    const result = {
      ...sale,
      total: sale.totalAmount,
      items: JSON.parse(sale.items)
    };
    res.status(201).json(result);
  } catch (err) {
    console.error('POST /sales error:', err.message);
    res.status(400).json({ error: err.message || 'Failed to create sale' });
  }
});

// GET /api/sales — owner & manager see all; employee sees own sales only
router.get('/', authMiddleware, (req, res) => {
  try {
    let sales;

    if (req.user.role === 'owner' || req.user.role === 'manager') {
      sales = db.prepare('SELECT * FROM sales ORDER BY dateTime DESC').all();
    } else {
      sales = db.prepare(
        'SELECT * FROM sales WHERE createdBy = ? ORDER BY dateTime DESC'
      ).all(req.user.id);
    }

    // Parse items JSON for each sale
    const parsed = sales.map(sale => ({
      ...sale,
      total: sale.totalAmount,
      items: JSON.parse(sale.items)
    }));

    res.json(parsed);
  } catch (err) {
    console.error('GET /sales error:', err);
    res.status(500).json({ error: 'Failed to fetch sales' });
  }
});

module.exports = router;
