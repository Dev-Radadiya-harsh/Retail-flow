const express = require('express');
const { v4: uuidv4 } = require('uuid');
const db = require('../db/database');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

function getShopIdForUser(userId) {
  const row = db.prepare('SELECT shop_id FROM users WHERE id = ?').get(userId);
  return row?.shop_id ?? null;
}

// POST /api/sales — create sale + deduct stock (all authenticated users)
router.post('/', authMiddleware, (req, res) => {
  try {
    const { items, sessionId, customerName = '', customerPhone = '' } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Sale must include at least one item' });
    }

    // Validate all items and check stock in a transaction
    const createSale = db.transaction(() => {
      const shopId = getShopIdForUser(req.user.id);
      if (!shopId) {
        throw new Error('User not tied to a shop');
      }

      let totalAmount = 0;
      const validatedItems = [];

      for (const item of items) {
        const product = db.prepare('SELECT * FROM products WHERE id = ? AND shop_id = ?').get(item.productId, shopId);

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
          'UPDATE products SET quantity = quantity - ?, updatedAt = ? WHERE id = ? AND shop_id = ?'
        ).run(item.quantity, new Date().toISOString(), product.id, shopId);
      }

      // Record the sale
      const saleId = uuidv4();
      const dateTime = new Date().toISOString();
      const billNumber = `BILL-${Date.now().toString().slice(-8)}`;

      db.prepare(
        'INSERT INTO sales (id, billNumber, dateTime, items, totalAmount, customerName, customerPhone, createdBy, sessionId, shop_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
      ).run(
        saleId,
        billNumber,
        dateTime,
        JSON.stringify(validatedItems),
        totalAmount,
        String(customerName || '').trim(),
        String(customerPhone || '').trim(),
        req.user.id,
        sessionId || null,
        shopId
      );

      return db.prepare('SELECT * FROM sales WHERE id = ? AND shop_id = ?').get(saleId, shopId);
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

    if (req.user.role === 'manager') {
      sales = db.prepare('SELECT * FROM sales ORDER BY dateTime DESC').all();
    } else {
      const shopId = getShopIdForUser(req.user.id);
      if (!shopId) {
        sales = [];
      } else if (req.user.role === 'employee') {
        sales = db.prepare(
          'SELECT * FROM sales WHERE shop_id = ? AND createdBy = ? ORDER BY dateTime DESC'
        ).all(shopId, req.user.id);
      } else {
        // owner
        sales = db.prepare(
          'SELECT * FROM sales WHERE shop_id = ? ORDER BY dateTime DESC'
        ).all(shopId);
      }
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
