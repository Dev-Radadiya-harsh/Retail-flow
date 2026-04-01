require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const seed = require('./db/seed');

const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const salesRoutes = require('./routes/sales');
const userRoutes = require('./routes/users');
const shopRoutes = require('./routes/shops');

const app = express();
const PORT = process.env.PORT || 3001;

// ── Security & Logging Middleware ────────────────────────────────────────────
app.use(helmet());
app.use(morgan('dev'));  // Logs every request: GET /api/products 200 5ms
// Comma-separated list, e.g. https://yourapp.web.app,http://localhost:5173
const FRONTEND_ORIGINS = (process.env.FRONTEND_ORIGIN || 'http://localhost:5173')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);
app.use(
  cors({
    origin: (origin, cb) => {
      if (!origin || FRONTEND_ORIGINS.includes(origin)) return cb(null, true);
      return cb(null, false);
    },
    credentials: true,
  })
);
app.use(express.json());

// ── Routes ───────────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/sales', salesRoutes);
app.use('/api/users', userRoutes);
app.use('/api/shops', shopRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ── Global Error Handler ─────────────────────────────────────────────────────
app.use((err, req, res, _next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// ── Start ────────────────────────────────────────────────────────────────────
async function start() {
  await seed();
  app.listen(PORT, () => {
    console.log(`✅  RetailFlow API  →  http://localhost:${PORT}`);
    console.log(`📚  Endpoints: /api/auth  /api/products  /api/sales  /api/users`);
  });
}

start().catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
