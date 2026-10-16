const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const routes = require('./routes');
const { notFound, errorHandler } = require('./middlewares/errorHandler');
const { CLIENT_ORIGIN, NODE_ENV } = require('./config/env');

const app = express();

/* =========================
   SECURITY
========================= */
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", 'data:', 'https:'],
        connectSrc: ["'self'", 'http://localhost:5000'],
        fontSrc: ["'self'", 'data:'],
        objectSrc: ["'none'"],
        baseUri: ["'self'"],
        frameAncestors: ["'self'"],
      },
    },
  })
);

/* =========================
   CORS

   The normal browser flow is same-origin because Express serves
   the frontend from this same server. CORS is kept for development
   tools / a separately served frontend if needed later.
========================= */
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (origin === CLIENT_ORIGIN) return callback(null, true);
      if (/^https?:\/\/localhost(?::\d+)?$/.test(origin)) {
        return callback(null, true);
      }
      return callback(new Error('CORS not allowed'));
    },
    credentials: true,
  })
);

app.use(compression());
app.use(morgan(NODE_ENV === 'production' ? 'combined' : 'dev'));
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

/* =========================
   RATE LIMIT - API ONLY
========================= */
app.use(
  '/api',
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 500,
    standardHeaders: true,
  })
);

/* =========================
   UPLOADS
========================= */
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

/* =========================
   FRONTEND

   Project structure:

   technova/
   ├── backend/
   │   └── src/app.js       <-- __dirname = backend/src
   └── frontend/

   Therefore ../../frontend points to the frontend directory.
========================= */
const frontendPath = path.resolve(__dirname, '../../frontend');

console.log(`Frontend: ${frontendPath}`);

// Serve index.html, login.html, register.html, admin.html,
// css/, js/, images/, favicon, etc.
app.use(express.static(frontendPath));

/* =========================
   API
========================= */
app.use('/api', routes);

/* =========================
   FRONTEND ROUTES
========================= */

// Storefront
app.get('/', (req, res) => {
  res.sendFile(path.join(frontendPath, 'index.html'));
});

// Shared authentication pages: customer and admin use the same login.
app.get('/login', (req, res) => {
  res.sendFile(path.join(frontendPath, 'login.html'));
});

app.get('/register', (req, res) => {
  res.sendFile(path.join(frontendPath, 'register.html'));
});

// Admin - support both clean URL and the actual HTML file URL.
app.get('/admin', (req, res) => {
  res.sendFile(path.join(frontendPath, 'admin.html'));
});

app.get('/admin.html', (req, res) => {
  res.sendFile(path.join(frontendPath, 'admin.html'));
});

/* =========================
   HEALTH CHECK
========================= */
app.get('/health', (req, res) => {
  res.json({
    success: true,
    status: 'ok',
    service: 'technova-backend',
    time: new Date(),
  });
});

/* =========================
   HTML 404 page, API 404 remains JSON
========================= */
app.use((req, res, next) => {
  if (req.method === 'GET' && !req.path.startsWith('/api') && req.accepts('html')) {
    return res.status(404).sendFile(path.join(frontendPath, '404.html'));
  }
  next();
});

app.use(notFound);
app.use(errorHandler);

module.exports = app;
