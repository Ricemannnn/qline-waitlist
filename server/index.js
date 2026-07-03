import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import { body, validationResult } from 'express-validator';
import db from './db.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
import { getCloverOAuthUrl, exchangeCodeForToken, getMerchantInfo, getTables, addOrderNote, createOrderWithNote, buildDietaryNote } from './clover.js';
import { sendSMS } from './notifications.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const BASE_URL = process.env.BASE_URL || (process.env.REPL_SLUG ? `https://${process.env.REPL_SLUG}.${process.env.REPL_OWNER}.repl.co` : `http://localhost:${PORT}`);

const distPath = path.join(__dirname, '../client/dist');

// Static files from the React app - serve these before CORS/middleware
app.use(express.static(distPath, {
  setHeaders: (res, path) => {
    if (path.endsWith('.html')) {
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    }
  }
}));

// SECURITY: Configuration checks
if (process.env.NODE_ENV === 'production') {
  console.log('Production mode detected.');
  console.log('Serving static files from:', distPath);
  if (!fs.existsSync(distPath)) {
    console.error('CRITICAL: dist directory does not exist at', distPath);
  } else {
    const assetsPath = path.join(distPath, 'assets');
    if (fs.existsSync(assetsPath)) {
      console.log('Assets directory found at', assetsPath);
      console.log('Assets files:', fs.readdirSync(assetsPath));
    } else {
      console.warn('WARNING: assets directory not found inside dist.');
    }
  }
  if (!process.env.JWT_SECRET) {
    console.warn('-------------------------------------------------------------------');
    console.warn('WARNING: JWT_SECRET is not defined. Using a temporary insecure secret.');
    console.warn('Please set JWT_SECRET in your environment variables for production.');
    console.warn('-------------------------------------------------------------------');
  }
  if (!process.env.BASE_URL && !process.env.REPL_SLUG) {
    console.warn('WARNING: BASE_URL is not defined. Clover OAuth may fail.');
  }
}
const JWT_SECRET = process.env.JWT_SECRET || 'qline-default-production-secret-change-me';

// SECURITY: CORS Configuration
const allowedOrigins = process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : [];

// Add BASE_URL to allowed origins if it exists
if (process.env.BASE_URL) {
  try {
    allowedOrigins.push(new URL(process.env.BASE_URL).origin);
  } catch (e) {
    allowedOrigins.push(process.env.BASE_URL);
  }
}

// Add common dev ports
allowedOrigins.push('http://localhost:5173', 'http://localhost:3000', 'http://localhost:3001');

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl)
    if (!origin) return callback(null, true);
    
    // Check if origin is in allowed list
    const isAllowed = allowedOrigins.indexOf(origin) !== -1 || 
                     (process.env.NODE_ENV !== 'production') ||
                     (origin.includes('onrender.com')) ||
                     (origin.includes('repl.co'));

    if (isAllowed) {
      callback(null, true);
    } else {
      console.error(`CORS Error: Origin ${origin} not in allowed list:`, allowedOrigins);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

app.use(express.json());
app.use(cookieParser());
app.use(morgan('dev'));

// Rate Limiting
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // limit each IP to 10 requests per windowMs
  message: { error: 'Too many attempts, please try again after 15 minutes' }
});

// --- Auth Middleware ---
const authenticateToken = (req, res, next) => {
  // SECURITY: Read from httpOnly cookie instead of Header
  const token = req.cookies.qline_session;

  if (!token) return res.status(401).json({ error: 'Access denied' });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid or expired session' });
    req.user = user;
    next();
  });
};

// Validation Middleware
const validate = (validations) => {
  return async (req, res, next) => {
    await Promise.all(validations.map(validation => validation.run(req)));
    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }
    res.status(400).json({ error: errors.array()[0].msg });
  };
};

// Basic health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// --- Auth Endpoints ---

// Register
app.post('/api/auth/register', authLimiter, validate([
  body('email').isEmail().withMessage('Enter a valid email'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('restaurant_id').notEmpty().withMessage('Restaurant ID is required').matches(/^[a-z0-9-]+$/).withMessage('Invalid restaurant ID format')
]), async (req, res) => {
  const { email, password, restaurant_id, name } = req.body;

  try {
    let restaurant = db.prepare('SELECT * FROM restaurants WHERE id = ?').get(restaurant_id);
    if (!restaurant) {
      db.prepare('INSERT INTO restaurants (id, name) VALUES (?, ?)').run(restaurant_id, name || 'New Restaurant');
      db.prepare('INSERT INTO settings (restaurant_id) VALUES (?)').run(restaurant_id);
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const result = db.prepare('INSERT INTO users (email, password_hash, restaurant_id) VALUES (?, ?, ?)')
      .run(email, hashedPassword, restaurant_id);

    res.status(201).json({ success: true, userId: result.lastInsertRowid });
  } catch (error) {
    console.error('Registration Error:', error);
    if (error.message.includes('UNIQUE constraint failed')) {
      return res.status(400).json({ error: 'Email already registered' });
    }
    res.status(500).json({ error: 'Registration failed' });
  }
});

// Login
app.post('/api/auth/login', authLimiter, validate([
  body('email').isEmail().withMessage('Enter a valid email'),
  body('password').notEmpty().withMessage('Password is required')
]), async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = db.prepare('SELECT u.*, r.name as restaurant_name FROM users u JOIN restaurants r ON u.restaurant_id = r.id WHERE u.email = ?').get(email);
    
    if (!user || !(await bcrypt.compare(password, user.password_hash))) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, restaurant_id: user.restaurant_id },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    // SECURITY: Set httpOnly cookie
    res.cookie('qline_session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    });

    res.json({
      user: {
        id: user.id,
        email: user.email,
        restaurant_id: user.restaurant_id,
        restaurant_name: user.restaurant_name
      }
    });
  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Logout
app.post('/api/auth/logout', (req, res) => {
  res.clearCookie('qline_session');
  res.json({ success: true });
});

// Get current user session
app.get('/api/auth/me', authenticateToken, (req, res) => {
  const user = db.prepare('SELECT u.id, u.email, u.restaurant_id, r.name as restaurant_name FROM users u JOIN restaurants r ON u.restaurant_id = r.id WHERE u.id = ?').get(req.user.id);
  
  if (user) {
    const tableCount = db.prepare('SELECT COUNT(*) as count FROM tables WHERE restaurant_id = ?').get(user.restaurant_id).count;
    user.new_account = tableCount === 0;
  }
  
  res.json(user);
});

// --- Clover OAuth Routes ---
app.get('/api/auth/clover', (req, res) => {
  const redirectUri = `${BASE_URL}/api/auth/clover/callback`;
  const url = getCloverOAuthUrl(redirectUri);
  res.redirect(url);
});

app.get('/api/auth/clover/callback', async (req, res) => {
  const { code, merchant_id } = req.query;

  if (!code) {
    return res.status(400).send('No code provided');
  }

  try {
    const tokenData = await exchangeCodeForToken(code);
    const accessToken = tokenData.access_token;

    const merchantInfo = await getMerchantInfo(merchant_id, accessToken);

    const existingRestaurant = db.prepare('SELECT * FROM restaurants WHERE clover_merchant_id = ?').get(merchant_id);

    if (existingRestaurant) {
      db.prepare('UPDATE restaurants SET clover_access_token = ?, name = ? WHERE clover_merchant_id = ?')
        .run(accessToken, merchantInfo.name, merchant_id);
    } else {
      db.prepare('INSERT INTO restaurants (id, name, clover_merchant_id, clover_access_token) VALUES (?, ?, ?, ?)')
        .run(merchant_id, merchantInfo.name, merchant_id, accessToken);
        
      db.prepare('INSERT INTO settings (restaurant_id, wait_time_per_party) VALUES (?, ?)').run(merchant_id, 10);
    }

    // Set session for Clover user too if we want unified auth
    const token = jwt.sign(
      { id: merchant_id, clover: true, restaurant_id: merchant_id },
      JWT_SECRET,
      { expiresIn: '24h' }
    );
    res.cookie('qline_session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 * 1000
    });

    res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/host?merchantId=${merchant_id}`);
  } catch (error) {
    console.error('Clover OAuth Error:', error.response?.data || error.message);
    res.status(500).send('Authentication failed');
  }
});

// Check if merchant is connected to Clover
app.get('/api/auth/clover/status/:merchantId', (req, res) => {
  const { merchantId } = req.params;
  // Try finding by clover_merchant_id first, then by internal id
  let restaurant = db.prepare('SELECT * FROM restaurants WHERE clover_merchant_id = ?').get(merchantId);
  if (!restaurant) {
    restaurant = db.prepare('SELECT * FROM restaurants WHERE id = ?').get(merchantId);
  }
  
  if (restaurant) {
    res.json({ 
      connected: !!restaurant.clover_access_token, 
      merchantName: restaurant.name 
    });
  } else {
    res.json({ connected: false });
  }
});

// Manually add dietary note to a Clover order
app.post('/api/clover/:restaurantId/add-dietary-note', authenticateToken, async (req, res) => {
  const { restaurantId } = req.params;
  if (req.user.restaurant_id !== restaurantId) return res.status(403).json({ error: 'Unauthorized' });

  const { order_id, reservation_id } = req.body;
  
  if (!reservation_id) {
    return res.status(400).json({ error: 'reservation_id is required' });
  }

  try {
    // Get restaurant Clover credentials
    const restaurant = db.prepare('SELECT * FROM restaurants WHERE id = ?').get(restaurantId);
    if (!restaurant || !restaurant.clover_access_token) {
      return res.status(400).json({ error: 'Restaurant not connected to Clover' });
    }

    // Get dietary data for the reservation
    const dietaryData = db.prepare(`
      SELECT rd.*, r.guest_name 
      FROM reservation_dietary rd
      JOIN reservations r ON rd.reservation_id = r.id
      WHERE rd.reservation_id = ?
    `).get(reservation_id);

    if (!dietaryData) {
      return res.status(404).json({ error: 'No dietary data found for this reservation' });
    }

    // Parse JSON fields
    const parsedDietary = {
      ...dietaryData,
      dietary_restrictions: dietaryData.dietary_restrictions ? JSON.parse(dietaryData.dietary_restrictions) : [],
      allergies: dietaryData.allergies ? JSON.parse(dietaryData.allergies) : []
    };

    const note = buildDietaryNote(parsedDietary);
    const merchantId = restaurant.clover_merchant_id || restaurant.id;

    let result;
    if (order_id) {
      // Add note to existing order
      result = await addOrderNote(merchantId, restaurant.clover_access_token, order_id, note);
    } else {
      // Create a new order with note
      result = await createOrderWithNote(merchantId, restaurant.clover_access_token, note, dietaryData.guest_name);
    }

    res.json({ 
      success: true, 
      order_id: result?.id || order_id,
      note 
    });
  } catch (error) {
    console.error('Add dietary note error:', error);
    res.status(500).json({ error: 'Failed to add dietary note to Clover order' });
  }
});

// Seed demo data
const seedDemo = async () => {
  const demoId = 'demo-1';
  const row = db.prepare('SELECT * FROM restaurants WHERE id = ?').get(demoId);
  if (!row) {
    db.prepare('INSERT INTO restaurants (id, name) VALUES (?, ?)').run(demoId, 'The Golden Fork');
  }
  
  const settings = db.prepare('SELECT * FROM settings WHERE restaurant_id = ?').get(demoId);
  if (!settings) {
    db.prepare('INSERT INTO settings (restaurant_id, wait_time_per_party) VALUES (?, ?)').run(demoId, 10);
  }

  const demoEmail = 'admin@goldenfork.com';
  const existingUser = db.prepare('SELECT * FROM users WHERE email = ?').get(demoEmail);
  if (!existingUser) {
    const hashedPass = await bcrypt.hash('password123', 10);
    db.prepare('INSERT INTO users (email, password_hash, restaurant_id) VALUES (?, ?, ?)').run(demoEmail, hashedPass, demoId);
    console.log('Demo user seeded: admin@goldenfork.com / password123');
  }
};
seedDemo();

// --- Main App Endpoints ---

// Settings API
app.get('/api/settings/:restaurantId', (req, res) => {
  const { restaurantId } = req.params;
  let settings = db.prepare('SELECT * FROM settings WHERE restaurant_id = ?').get(restaurantId);
  
  if (!settings) {
    settings = {
      restaurant_id: restaurantId,
      wait_time_per_party: 10,
      total_tables: 10,
      sms_template: 'Hi {guest_name}, your table at {restaurant_name} is ready!'
    };
  }
  
  res.json(settings);
});

app.post('/api/settings/:restaurantId', authenticateToken, validate([
  body('wait_time_per_party').isInt({ min: 1, max: 120 }),
  body('total_tables').isInt({ min: 1, max: 500 }),
  body('menu_url').optional({ checkFalsy: true }).isURL().withMessage('Enter a valid URL for the menu')
]), (req, res) => {
  const { restaurantId } = req.params;
  const { wait_time_per_party, total_tables, menu_url, sms_template } = req.body;
  
  // SECURITY: Ensure user can only update their own restaurant
  if (req.user.restaurant_id !== restaurantId) {
    return res.status(403).json({ error: 'Unauthorized' });
  }

  const existing = db.prepare('SELECT * FROM settings WHERE restaurant_id = ?').get(restaurantId);
  
  if (existing) {
    db.prepare('UPDATE settings SET wait_time_per_party = ?, total_tables = ?, menu_url = ?, sms_template = ?, updated_at = CURRENT_TIMESTAMP WHERE restaurant_id = ?')
      .run(wait_time_per_party, total_tables, menu_url || null, sms_template, restaurantId);
  } else {
    db.prepare('INSERT INTO settings (restaurant_id, wait_time_per_party, total_tables, menu_url, sms_template) VALUES (?, ?, ?, ?, ?)')
      .run(restaurantId, wait_time_per_party, total_tables, menu_url || null, sms_template);
  }
  
  res.json({ success: true });
});

// Tables API
app.get('/api/tables/:restaurantId', (req, res) => {
  const { restaurantId } = req.params;
  const tables = db.prepare('SELECT * FROM tables WHERE restaurant_id = ?').all(restaurantId);
  res.json(tables);
});

app.post('/api/tables/:restaurantId', authenticateToken, validate([
  body('name').notEmpty().trim().escape(),
  body('capacity').isInt({ min: 1, max: 50 })
]), (req, res) => {
  const { restaurantId } = req.params;
  if (req.user.restaurant_id !== restaurantId) return res.status(403).json({ error: 'Unauthorized' });

  const { name, capacity, status, x, y } = req.body;
  
  const result = db.prepare('INSERT INTO tables (restaurant_id, name, capacity, status, x, y) VALUES (?, ?, ?, ?, ?, ?)')
    .run(restaurantId, name, capacity, status || 'available', x || 0, y || 0);
  
  res.json({ id: result.lastInsertRowid });
});

app.patch('/api/tables/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  
  // Verify ownership
  const table = db.prepare('SELECT restaurant_id FROM tables WHERE id = ?').get(id);
  if (!table || table.restaurant_id !== req.user.restaurant_id) {
    return res.status(403).json({ error: 'Unauthorized' });
  }

  const { status, name, capacity, x, y } = req.body;
  
  let query = 'UPDATE tables SET ';
  const params = [];
  const updates = [];
  
  if (status) { updates.push('status = ?'); params.push(status); }
  if (name) { updates.push('name = ?'); params.push(name); }
  if (capacity) { updates.push('capacity = ?'); params.push(capacity); }
  if (x !== undefined) { updates.push('x = ?'); params.push(x); }
  if (y !== undefined) { updates.push('y = ?'); params.push(y); }
  
  if (updates.length === 0) return res.json({ success: true });
  
  query += updates.join(', ') + ' WHERE id = ?';
  params.push(id);
  
  db.prepare(query).run(...params);
  res.json({ success: true });
});

// Waitlist API
app.get('/api/waitlist/:restaurantId', (req, res) => {
  const { restaurantId } = req.params;
  const list = db.prepare("SELECT * FROM waitlist WHERE restaurant_id = ? AND status = 'waiting' ORDER BY joined_at ASC").all(restaurantId);
  
  const settings = db.prepare('SELECT wait_time_per_party FROM settings WHERE restaurant_id = ?').get(restaurantId);
  const waitTimePerParty = settings ? settings.wait_time_per_party : 10;
  
  const enrichedList = list.map((item, index) => ({
    ...item,
    estimated_wait: index * waitTimePerParty
  }));
  
  res.json({
    entries: enrichedList,
    summary: {
      total_waiting: list.length,
      next_estimated_wait: list.length * waitTimePerParty
    }
  });
});

app.post('/api/waitlist/:restaurantId/join', validate([
  body('guest_name').notEmpty().trim().escape(),
  body('party_size').isInt({ min: 1, max: 100 }),
  body('phone_number').optional({ checkFalsy: true }).isMobilePhone()
]), (req, res) => {
  const { restaurantId } = req.params;
  const { guest_name, party_size, phone_number } = req.body;

  // Verify restaurant exists
  const restaurant = db.prepare('SELECT id FROM restaurants WHERE id = ?').get(restaurantId);
  if (!restaurant) {
    return res.status(404).json({ error: 'This restaurant hasn\'t set up their Qline waitlist yet.' });
  }

  try {
    const result = db.prepare(
      'INSERT INTO waitlist (restaurant_id, guest_name, party_size, phone_number) VALUES (?, ?, ?, ?)'
    ).run(restaurantId, guest_name, party_size, phone_number);

    res.status(201).json({ id: result.lastInsertRowid, status: 'waiting' });
  } catch (error) {
    console.error('Join Waitlist Error:', error);
    res.status(500).json({ error: 'Failed to join the waitlist. Please try again.' });
  }
});

app.patch('/api/waitlist/status/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  
  const guest = db.prepare('SELECT restaurant_id FROM waitlist WHERE id = ?').get(id);
  if (!guest || guest.restaurant_id !== req.user.restaurant_id) return res.status(403).json({ error: 'Unauthorized' });

  db.prepare('UPDATE waitlist SET status = ? WHERE id = ?').run(status, id);
  res.json({ success: true });
});

// Public endpoint for guests to cancel their own waitlist entry
app.post('/api/waitlist/guest/:id/cancel', (req, res) => {
  const { id } = req.params;
  
  try {
    const result = db.prepare("UPDATE waitlist SET status = 'cancelled' WHERE id = ? AND status = 'waiting'").run(id);
    if (result.changes > 0) {
      res.json({ success: true });
    } else {
      // Check if it exists at all to give better error
      const guest = db.prepare('SELECT status FROM waitlist WHERE id = ?').get(id);
      if (!guest) {
        return res.status(404).json({ error: 'Waitlist entry not found.' });
      }
      res.status(400).json({ error: `Cannot cancel entry with status: ${guest.status}` });
    }
  } catch (error) {
    console.error('Cancel Error:', error);
    res.status(500).json({ error: 'Failed to leave waitlist.' });
  }
});

app.get('/api/waitlist/guest/:id', (req, res) => {
  const { id } = req.params;
  const guest = db.prepare('SELECT * FROM waitlist WHERE id = ?').get(id);

  if (!guest) {
    return res.status(404).json({ error: 'Guest not found' });
  }

  if (guest.status !== 'waiting') {
    return res.json({ guest, position: 0, ahead: 0 });
  }

  const allWaiting = db.prepare("SELECT id FROM waitlist WHERE restaurant_id = ? AND status = 'waiting' ORDER BY joined_at ASC").all(guest.restaurant_id);
  const position = allWaiting.findIndex(g => g.id === parseInt(id)) + 1;
  const ahead = position - 1;

  const settings = db.prepare('SELECT wait_time_per_party, menu_url FROM settings WHERE restaurant_id = ?').get(guest.restaurant_id);
  const waitTimePerParty = settings ? settings.wait_time_per_party : 10;

  res.json({
    guest,
    position,
    ahead,
    estimated_wait: ahead * waitTimePerParty,
    menu_url: settings ? settings.menu_url : null
  });
});

// Reservations API (with dietary support - see enhanced endpoints below)

app.patch('/api/reservations/status/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  
  const resv = db.prepare('SELECT restaurant_id FROM reservations WHERE id = ?').get(id);
  if (!resv || resv.restaurant_id !== req.user.restaurant_id) return res.status(403).json({ error: 'Unauthorized' });

  db.prepare('UPDATE reservations SET status = ? WHERE id = ?').run(status, id);

  // If seating a reservation, try to sync dietary notes to Clover
  if (status === 'seated') {
    try {
      const restaurant = db.prepare('SELECT * FROM restaurants WHERE id = ?').get(resv.restaurant_id);
      
      if (restaurant && restaurant.clover_access_token) {
        // Check if there's dietary data for this reservation
        const dietaryData = db.prepare(`
          SELECT rd.*, r.guest_name 
          FROM reservation_dietary rd
          JOIN reservations r ON rd.reservation_id = r.id
          WHERE rd.reservation_id = ?
        `).get(id);
        
        if (dietaryData) {
          // Parse JSON fields
          const parsedDietary = {
            ...dietaryData,
            dietary_restrictions: dietaryData.dietary_restrictions ? JSON.parse(dietaryData.dietary_restrictions) : [],
            allergies: dietaryData.allergies ? JSON.parse(dietaryData.allergies) : []
          };

          // Build the note
          const note = buildDietaryNote(parsedDietary);
          
          // Try to add a note to Clover order (non-blocking - log on failure)
          // Pass 'null' for orderId to indicate we create a new order
          try {
            await createOrderWithNote(
              restaurant.clover_merchant_id || restaurant.id,
              restaurant.clover_access_token,
              note,
              dietaryData.guest_name
            );
            console.log(`Clover order created with dietary note for reservation ${id}`);
          } catch (cloverErr) {
            console.warn(`Clover sync note (non-blocking): ${cloverErr.message}`);
          }
        }
      }
    } catch (syncErr) {
      // Non-blocking - don't fail the status update if Clover sync fails
      console.warn('Could not sync dietary notes to Clover:', syncErr.message);
    }
  }

  res.json({ success: true });
});

// --- Dietary & Allergy Endpoints ---

// Helper: Build dietary summary text for SMS
const buildDietarySMSText = (dietaryData) => {
  if (!dietaryData) return '';
  
  const restrictions = dietaryData.dietary_restrictions ? 
    (typeof dietaryData.dietary_restrictions === 'string' ? JSON.parse(dietaryData.dietary_restrictions) : dietaryData.dietary_restrictions) : [];
  const allergies = dietaryData.allergies ? 
    (typeof dietaryData.allergies === 'string' ? JSON.parse(dietaryData.allergies) : dietaryData.allergies) : [];
  const otherNeeds = dietaryData.other_needs || '';
  
  const parts = [];
  
  if (restrictions.length > 0) {
    // Get labels from DB
    const labels = restrictions.map(code => {
      const r = db.prepare('SELECT label FROM dietary_restrictions WHERE code = ?').get(code);
      return r ? r.label : code;
    });
    parts.push(labels.join(', '));
  }
  
  if (allergies.length > 0) {
    const allergyLabels = allergies.map(a => {
      const code = typeof a === 'string' ? a : a.code;
      const severity = typeof a === 'object' && a.severity ? ` (${a.severity})` : '';
      const r = db.prepare('SELECT label FROM allergies WHERE code = ?').get(code);
      return r ? `${r.label}${severity}` : `${code}${severity}`;
    });
    parts.push(`Allergies: ${allergyLabels.join(', ')}`);
  }
  
  if (otherNeeds.trim()) {
    parts.push(otherNeeds.trim());
  }
  
  if (parts.length === 0) return '';
  return ` Dietary needs noted: ${parts.join('. ')}.`;
};

// 1. GET /api/dietary-restrictions/:restaurantId — Returns all dietary restrictions and allergies
app.get('/api/dietary-restrictions/:restaurantId', (req, res) => {
  const { restaurantId } = req.params;
  
  // Verify restaurant exists
  const restaurant = db.prepare('SELECT id FROM restaurants WHERE id = ?').get(restaurantId);
  if (!restaurant) {
    return res.status(404).json({ error: 'Restaurant not found' });
  }
  
  const dietaryRestrictions = db.prepare('SELECT * FROM dietary_restrictions ORDER BY category, code').all();
  const allergies = db.prepare('SELECT * FROM allergies ORDER BY category, code').all();
  
  res.json({ dietary_restrictions: dietaryRestrictions, allergies });
});

// 2. POST /api/reservations/:restaurantId/dietary — Save dietary data for a reservation
app.post('/api/reservations/:restaurantId/dietary', authenticateToken, validate([
  body('reservation_id').isInt({ min: 1 }).withMessage('Valid reservation_id is required'),
  body('dietary_restrictions').optional().isArray(),
  body('allergies').optional().isArray(),
  body('other_needs').optional().isString()
]), (req, res) => {
  const { restaurantId } = req.params;
  if (req.user.restaurant_id !== restaurantId) return res.status(403).json({ error: 'Unauthorized' });
  
  const { reservation_id, dietary_restrictions, allergies, other_needs } = req.body;
  
  // Verify reservation exists and belongs to this restaurant
  const reservation = db.prepare('SELECT id FROM reservations WHERE id = ? AND restaurant_id = ?').get(reservation_id, restaurantId);
  if (!reservation) {
    return res.status(404).json({ error: 'Reservation not found' });
  }
  
  try {
    const existing = db.prepare('SELECT id FROM reservation_dietary WHERE reservation_id = ?').get(reservation_id);
    
    if (existing) {
      db.prepare(`
        UPDATE reservation_dietary 
        SET dietary_restrictions = ?, allergies = ?, other_needs = ?
        WHERE reservation_id = ?
      `).run(
        JSON.stringify(dietary_restrictions || []),
        JSON.stringify(allergies || []),
        other_needs || '',
        reservation_id
      );
    } else {
      db.prepare(`
        INSERT INTO reservation_dietary (reservation_id, dietary_restrictions, allergies, other_needs)
        VALUES (?, ?, ?, ?)
      `).run(
        reservation_id,
        JSON.stringify(dietary_restrictions || []),
        JSON.stringify(allergies || []),
        other_needs || ''
      );
    }
    
    res.json({ success: true });
  } catch (error) {
    console.error('Save dietary data error:', error);
    res.status(500).json({ error: 'Failed to save dietary data' });
  }
});

// 3. GET /api/reservations/:restaurantId/dietary/:reservationId — Get dietary data for a reservation
app.get('/api/reservations/:restaurantId/dietary/:reservationId', (req, res) => {
  const { restaurantId, reservationId } = req.params;
  
  const reservation = db.prepare(`
    SELECT r.*, rd.id as dietary_id, rd.dietary_restrictions, rd.allergies, rd.other_needs,
           rd.experience_suitable, rd.modification_requested, rd.modification_approved
    FROM reservations r
    LEFT JOIN reservation_dietary rd ON r.id = rd.reservation_id
    WHERE r.id = ? AND r.restaurant_id = ?
  `).get(reservationId, restaurantId);
  
  if (!reservation) {
    return res.status(404).json({ error: 'Reservation not found' });
  }
  
  // Parse JSON fields
  const result = {
    ...reservation,
    dietary_restrictions: reservation.dietary_restrictions ? JSON.parse(reservation.dietary_restrictions) : [],
    allergies: reservation.allergies ? JSON.parse(reservation.allergies) : []
  };
  delete result.dietary_id;
  
  res.json(result);
});

// 4. PUT /api/customers/:restaurantId/dietary-profile — Upsert customer dietary profile
app.put('/api/customers/:restaurantId/dietary-profile', authenticateToken, validate([
  body('guest_name').notEmpty().trim().escape(),
  body('guest_phone').optional({ checkFalsy: true }),
  body('dietary_restrictions').optional().isArray(),
  body('allergies').optional().isArray(),
  body('other_needs').optional().isString(),
  body('restaurant_notes').optional().isString()
]), (req, res) => {
  const { restaurantId } = req.params;
  if (req.user.restaurant_id !== restaurantId) return res.status(403).json({ error: 'Unauthorized' });
  
  const { guest_name, guest_phone, dietary_restrictions, allergies, other_needs, restaurant_notes } = req.body;
  
  try {
    // Match by guest_name + guest_phone combo
    let existing;
    if (guest_phone) {
      existing = db.prepare('SELECT id FROM customer_dietary_profiles WHERE restaurant_id = ? AND guest_name = ? AND guest_phone = ?')
        .get(restaurantId, guest_name, guest_phone);
    } else {
      existing = db.prepare('SELECT id FROM customer_dietary_profiles WHERE restaurant_id = ? AND guest_name = ? AND (guest_phone IS NULL OR guest_phone = ?)')
        .get(restaurantId, guest_name, '');
    }
    
    if (existing) {
      db.prepare(`
        UPDATE customer_dietary_profiles 
        SET dietary_restrictions = ?, allergies = ?, other_needs = ?, restaurant_notes = ?, last_updated = CURRENT_TIMESTAMP
        WHERE id = ?
      `).run(
        JSON.stringify(dietary_restrictions || []),
        JSON.stringify(allergies || []),
        other_needs || '',
        restaurant_notes || '',
        existing.id
      );
    } else {
      db.prepare(`
        INSERT INTO customer_dietary_profiles (restaurant_id, guest_name, guest_phone, dietary_restrictions, allergies, other_needs, restaurant_notes)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).run(
        restaurantId,
        guest_name,
        guest_phone || null,
        JSON.stringify(dietary_restrictions || []),
        JSON.stringify(allergies || []),
        other_needs || '',
        restaurant_notes || ''
      );
    }
    
    res.json({ success: true });
  } catch (error) {
    console.error('Upsert dietary profile error:', error);
    res.status(500).json({ error: 'Failed to save dietary profile' });
  }
});

// 5. GET /api/customers/:restaurantId/dietary-profile/:phone — Get customer dietary profile by phone
app.get('/api/customers/:restaurantId/dietary-profile/:phone', (req, res) => {
  const { restaurantId, phone } = req.params;
  
  const profiles = db.prepare(`
    SELECT * FROM customer_dietary_profiles 
    WHERE restaurant_id = ? AND guest_phone = ?
    ORDER BY last_updated DESC
  `).all(restaurantId, phone);
  
  if (profiles.length === 0) {
    return res.status(404).json({ error: 'No dietary profile found for this phone number' });
  }
  
  // Parse JSON fields
  const result = profiles.map(p => ({
    ...p,
    dietary_restrictions: p.dietary_restrictions ? JSON.parse(p.dietary_restrictions) : [],
    allergies: p.allergies ? JSON.parse(p.allergies) : []
  }));
  
  res.json(result);
});

// 6. PATCH /api/reservations/dietary/:reservationId/modification — Approve/deny modification requests
app.patch('/api/reservations/dietary/:reservationId/modification', authenticateToken, validate([
  body('modification_approved').isIn(['approved', 'denied']).withMessage('Must be "approved" or "denied"')
]), (req, res) => {
  const { reservationId } = req.params;
  const { modification_approved } = req.body;
  
  const rd = db.prepare(`
    SELECT rd.id, r.restaurant_id FROM reservation_dietary rd
    JOIN reservations r ON rd.reservation_id = r.id
    WHERE rd.reservation_id = ?
  `).get(reservationId);
  
  if (!rd) {
    return res.status(404).json({ error: 'Dietary data for reservation not found' });
  }
  
  if (rd.restaurant_id !== req.user.restaurant_id) {
    return res.status(403).json({ error: 'Unauthorized' });
  }
  
  db.prepare('UPDATE reservation_dietary SET modification_approved = ? WHERE reservation_id = ?')
    .run(modification_approved, reservationId);
  
  res.json({ success: true, modification_approved });
});

// 7. POST /api/analytics/:restaurantId/dietary — Dietary analytics
app.post('/api/analytics/:restaurantId/dietary', (req, res) => {
  const { restaurantId } = req.params;
  
  try {
    // Get all reservation_dietary records for this restaurant
    const rdRecords = db.prepare(`
      SELECT rd.dietary_restrictions, rd.allergies, r.reservation_time
      FROM reservation_dietary rd
      JOIN reservations r ON rd.reservation_id = r.id
      WHERE r.restaurant_id = ?
    `).all(restaurantId);
    
    // Count dietary restrictions
    const restrictionCounts = {};
    const allergyCounts = {};
    const restrictionsByDay = {};
    
    for (const record of rdRecords) {
      const restrictions = record.dietary_restrictions ? JSON.parse(record.dietary_restrictions) : [];
      const allergies = record.allergies ? JSON.parse(record.allergies) : [];
      const date = record.reservation_time ? record.reservation_time.substring(0, 10) : 'unknown';
      
      // Count restrictions
      for (const code of restrictions) {
        restrictionCounts[code] = (restrictionCounts[code] || 0) + 1;
      }
      
      // Count allergies
      for (const allergy of allergies) {
        const code = typeof allergy === 'string' ? allergy : allergy.code;
        if (code) {
          allergyCounts[code] = (allergyCounts[code] || 0) + 1;
        }
      }
      
      // Count restrictions by day
      if (!restrictionsByDay[date]) {
        restrictionsByDay[date] = {};
      }
      for (const code of restrictions) {
        restrictionsByDay[date][code] = (restrictionsByDay[date][code] || 0) + 1;
      }
    }
    
    // Enrich with labels from dietary_restrictions and allergies tables
    const allRestrictions = db.prepare('SELECT code, label FROM dietary_restrictions').all();
    const restrictionLabels = {};
    for (const r of allRestrictions) { restrictionLabels[r.code] = r.label; }
    
    const allAllergies = db.prepare('SELECT code, label FROM allergies').all();
    const allergyLabels = {};
    for (const a of allAllergies) { allergyLabels[a.code] = a.label; }
    
    const enrichedRestrictionCounts = Object.entries(restrictionCounts)
      .map(([code, count]) => ({ code, label: restrictionLabels[code] || code, count }))
      .sort((a, b) => b.count - a.count);
    
    const enrichedAllergyCounts = Object.entries(allergyCounts)
      .map(([code, count]) => ({ code, label: allergyLabels[code] || code, count }))
      .sort((a, b) => b.count - a.count);
    
    res.json({
      total_reservations_with_dietary: rdRecords.length,
      most_common_restrictions: enrichedRestrictionCounts,
      most_common_allergies: enrichedAllergyCounts,
      restrictions_by_day: restrictionsByDay
    });
  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({ error: 'Failed to generate dietary analytics' });
  }
});

// Override POST /api/reservations/:restaurantId with dietary support
app.post('/api/reservations/:restaurantId', validate([
  body('guest_name').notEmpty().trim().escape(),
  body('party_size').isInt({ min: 1, max: 100 }),
  body('reservation_time').isISO8601(),
  body('dietary_restrictions').optional().isArray(),
  body('allergies').optional().isArray(),
  body('other_needs').optional().isString()
]), (req, res) => {
  const { restaurantId } = req.params;
  const { guest_name, party_size, phone_number, reservation_time, dietary_restrictions, allergies, other_needs } = req.body;

  try {
    const result = db.prepare(
      'INSERT INTO reservations (restaurant_id, guest_name, party_size, phone_number, reservation_time) VALUES (?, ?, ?, ?, ?)'
    ).run(restaurantId, guest_name, party_size, phone_number, reservation_time);

    const reservationId = result.lastInsertRowid;
    let dietaryText = '';

    // Save dietary data if provided
    if ((dietary_restrictions && dietary_restrictions.length > 0) || 
        (allergies && allergies.length > 0) || 
        (other_needs && other_needs.trim())) {
      db.prepare(`
        INSERT OR IGNORE INTO reservation_dietary (reservation_id, dietary_restrictions, allergies, other_needs)
        VALUES (?, ?, ?, ?)
      `).run(
        reservationId,
        JSON.stringify(dietary_restrictions || []),
        JSON.stringify(allergies || []),
        other_needs || ''
      );

      // Build dietary SMS text if phone provided
      if (phone_number) {
        dietaryText = buildDietarySMSText({
          dietary_restrictions,
          allergies,
          other_needs
        });
      }
    }

    // Send SMS confirmation with dietary info if phone provided
    if (phone_number) {
      const restaurant = db.prepare('SELECT name FROM restaurants WHERE id = ?').get(restaurantId);
      const restaurantName = restaurant ? restaurant.name : 'Qline';
      const time = new Date(reservation_time).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
      const message = `Your reservation at ${restaurantName} at ${time}.${dietaryText} See you soon! - Qline`;
      
      sendSMS(phone_number, message).catch(err => console.warn('SMS confirmation send failed:', err.message));
    }

    res.status(201).json({ id: reservationId, status: 'confirmed' });
  } catch (error) {
    console.error('Create reservation error:', error);
    res.status(500).json({ error: 'Failed to create reservation' });
  }
});

// Override GET /api/reservations/:restaurantId with dietary data via LEFT JOIN
app.get('/api/reservations/:restaurantId', (req, res) => {
  const { restaurantId } = req.params;
  try {
    const list = db.prepare(`
      SELECT r.*, rd.id as dietary_id, rd.dietary_restrictions, rd.allergies, rd.other_needs,
             rd.experience_suitable, rd.modification_requested, rd.modification_approved
      FROM reservations r
      LEFT JOIN reservation_dietary rd ON r.id = rd.reservation_id
      WHERE r.restaurant_id = ?
      ORDER BY r.reservation_time ASC
    `).all(restaurantId);
    
    // Parse JSON fields
    const enriched = list.map(item => ({
      ...item,
      dietary_restrictions: item.dietary_restrictions ? JSON.parse(item.dietary_restrictions) : [],
      allergies: item.allergies ? JSON.parse(item.allergies) : [],
      dietary_id: undefined // Remove the join column
    }));
    
    res.json(enriched);
  } catch (error) {
    console.error('Get reservations error:', error);
    res.status(500).json({ error: 'Failed to fetch reservations' });
  }
});

// --- Experience & Modification Endpoints ---

// Experiences CRUD
app.get('/api/experiences/:restaurantId', (req, res) => {
  const { restaurantId } = req.params;
  const list = db.prepare('SELECT * FROM experiences WHERE restaurant_id = ? ORDER BY created_at DESC').all(restaurantId);
  // Parse JSON fields
  const enriched = list.map(e => ({
    ...e,
    suitable_for: e.suitable_for ? JSON.parse(e.suitable_for) : [],
    not_suitable_for: e.not_suitable_for ? JSON.parse(e.not_suitable_for) : []
  }));
  res.json(enriched);
});

app.post('/api/experiences/:restaurantId', authenticateToken, validate([
  body('name').notEmpty().trim().escape(),
  body('description').optional().isString(),
  body('suitable_for').optional().isArray(),
  body('not_suitable_for').optional().isArray(),
  body('substitutions_available').optional().isBoolean(),
  body('prep_notes').optional().isString()
]), (req, res) => {
  const { restaurantId } = req.params;
  if (req.user.restaurant_id !== restaurantId) return res.status(403).json({ error: 'Unauthorized' });
  
  const { name, description, suitable_for, not_suitable_for, substitutions_available, prep_notes } = req.body;
  
  try {
    const result = db.prepare(`
      INSERT INTO experiences (restaurant_id, name, description, suitable_for, not_suitable_for, substitutions_available, prep_notes)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(restaurantId, name, description || '', JSON.stringify(suitable_for || []), JSON.stringify(not_suitable_for || []), substitutions_available ? 1 : 0, prep_notes || '');
    
    res.status(201).json({ id: result.lastInsertRowid });
  } catch (error) {
    console.error('Create experience error:', error);
    res.status(500).json({ error: 'Failed to create experience' });
  }
});

// Guest submits a modification request
app.post('/api/reservations/dietary/:reservationId/request-modification', validate([
  body('modification_requested').notEmpty().isString()
]), (req, res) => {
  const { reservationId } = req.params;
  const { modification_requested } = req.body;
  
  const existing = db.prepare('SELECT id FROM reservation_dietary WHERE reservation_id = ?').get(reservationId);
  
  try {
    if (existing) {
      db.prepare('UPDATE reservation_dietary SET modification_requested = ?, modification_approved = ? WHERE reservation_id = ?')
        .run(modification_requested, 'pending', reservationId);
    } else {
      db.prepare('INSERT INTO reservation_dietary (reservation_id, modification_requested, modification_approved) VALUES (?, ?, ?)')
        .run(reservationId, modification_requested, 'pending');
    }
    res.json({ success: true });
  } catch (error) {
    console.error('Modification request error:', error);
    res.status(500).json({ error: 'Failed to submit modification request' });
  }
});

// List pending modification requests for the kitchen
app.get('/api/reservations/:restaurantId/dietary/modifications/pending', (req, res) => {
  const { restaurantId } = req.params;
  const pending = db.prepare(`
    SELECT r.id, r.guest_name, r.party_size, r.reservation_time, r.phone_number,
           rd.modification_requested, rd.dietary_restrictions, rd.allergies, rd.other_needs
    FROM reservations r
    JOIN reservation_dietary rd ON r.id = rd.reservation_id
    WHERE r.restaurant_id = ? AND rd.modification_approved = 'pending' AND rd.modification_requested != ''
    ORDER BY r.reservation_time ASC
  `).all(restaurantId);
  
  res.json(pending);
});

// Update waitlist notify to include dietary info
app.post('/api/waitlist/:restaurantId/notify/:id', authenticateToken, async (req, res) => {
  const { restaurantId, id } = req.params;
  if (req.user.restaurant_id !== restaurantId) return res.status(403).json({ error: 'Unauthorized' });
  
  const guest = db.prepare('SELECT * FROM waitlist WHERE id = ?').get(id);
  
  if (!guest) return res.status(404).json({ error: 'Guest not found' });
  if (!guest.phone_number) return res.status(400).json({ error: 'Guest does not have a phone number' });

  try {
    const restaurant = db.prepare('SELECT name FROM restaurants WHERE id = ?').get(restaurantId);
    const settings = db.prepare('SELECT sms_template FROM settings WHERE restaurant_id = ?').get(restaurantId);
    
    let message = (settings && settings.sms_template) ? settings.sms_template : 'Hi {guest_name}, your table at {restaurant_name} is ready!';
    message = message.replace('{guest_name}', guest.guest_name);
    message = message.replace('{restaurant_name}', restaurant ? restaurant.name : 'Qline');

    await sendSMS(guest.phone_number, message);
    db.prepare('UPDATE waitlist SET status = ? WHERE id = ?').run('notified', id);
    res.json({ success: true });
  } catch (error) {
    console.error('Notification Error:', error);
    const errorDetail = error.message || 'Failed to send notification';
    res.status(500).json({ error: `SMS Error: ${errorDetail}` });
  }
});

// --- Kitchen Dietary Dashboard API ---

// GET /api/kitchen/:restaurantId — Get today's reservations with dietary data for kitchen prep
app.get('/api/kitchen/:restaurantId', (req, res) => {
  const { restaurantId } = req.params;
  
  try {
    const today = new Date();
    const todayStart = today.toISOString().substring(0, 10);
    
    const kitchenData = db.prepare(`
      SELECT r.id, r.guest_name, r.party_size, r.reservation_time, r.status,
             rd.dietary_restrictions, rd.allergies, rd.other_needs,
             rd.experience_suitable, rd.modification_requested, rd.modification_approved,
             cd.restaurant_notes as profile_notes
      FROM reservations r
      LEFT JOIN reservation_dietary rd ON r.id = rd.reservation_id
      LEFT JOIN customer_dietary_profiles cd ON cd.restaurant_id = r.restaurant_id 
        AND (cd.guest_name = r.guest_name OR cd.guest_phone = r.phone_number)
      WHERE r.restaurant_id = ? AND DATE(r.reservation_time) = ?
      ORDER BY r.reservation_time ASC
    `).all(restaurantId, todayStart);

    // Parse JSON fields and enrich
    const enriched = kitchenData.map(item => {
      const restrictions = item.dietary_restrictions ? JSON.parse(item.dietary_restrictions) : [];
      const allergies = item.allergies ? JSON.parse(item.allergies) : [];
      
      // Get labels from reference tables
      const restrictionLabels = restrictions.map(code => {
        const dr = db.prepare('SELECT code, label, icon FROM dietary_restrictions WHERE code = ?').get(code);
        return dr || { code, label: code, icon: code.substring(0, 2).toUpperCase() };
      });
      
      const allergyLabels = allergies.map(code => {
        const a = db.prepare('SELECT code, label FROM allergies WHERE code = ?').get(code);
        return a || { code, label: code };
      });
      
      return {
        ...item,
        dietary_restrictions: restrictionLabels,
        allergies: allergyLabels,
        has_restrictions: restrictionLabels.length > 0,
        has_allergies: allergyLabels.length > 0,
        has_severe_allergy: allergyLabels.some(a => ['peanut', 'tree-nut', 'shellfish'].includes(a.code))
      };
    });

    // Stats
    const totalGuests = enriched.filter(r => r.status !== 'cancelled').length;
    const withRestrictions = enriched.filter(r => r.has_restrictions && r.status !== 'cancelled').length;
    const withAllergies = enriched.filter(r => r.has_allergies && r.status !== 'cancelled').length;
    const severeAllergies = enriched.filter(r => r.has_severe_allergy && r.status !== 'cancelled').length;

    res.json({
      today: todayStart,
      total_guests: totalGuests,
      guests_with_dietary_needs: withRestrictions + withAllergies,
      guests_with_restrictions: withRestrictions,
      guests_with_allergies: withAllergies,
      guests_with_severe_allergies: severeAllergies,
      entries: enriched
    });
  } catch (error) {
    console.error('Kitchen API error:', error);
    res.status(500).json({ error: 'Failed to fetch kitchen data' });
  }
});

// PATCH /api/tables/:id/link-reservation — Link a reservation to a table
app.patch('/api/tables/:id/link-reservation', authenticateToken, (req, res) => {
  const { id } = req.params;
  const { reservation_id } = req.body;
  
  const table = db.prepare('SELECT restaurant_id FROM tables WHERE id = ?').get(id);
  if (!table || table.restaurant_id !== req.user.restaurant_id) {
    return res.status(403).json({ error: 'Unauthorized' });
  }
  
  db.prepare('UPDATE tables SET current_guest_reservation_id = ? WHERE id = ?').run(reservation_id || null, id);
  res.json({ success: true, reservation_id: reservation_id || null });
});

// GET /api/analytics/:restaurantId/dietary — Dietary analytics (POST already exists, add GET variant)
app.get('/api/analytics/:restaurantId/dietary', (req, res) => {
  const { restaurantId } = req.params;
  
  try {
    const rdRecords = db.prepare(`
      SELECT rd.dietary_restrictions, rd.allergies, r.reservation_time
      FROM reservation_dietary rd
      JOIN reservations r ON rd.reservation_id = r.id
      WHERE r.restaurant_id = ?
    `).all(restaurantId);
    
    const restrictionCounts = {};
    const allergyCounts = {};
    const restrictionsByPeriod = { lunch: 0, dinner: 0 };
    let totalWithRestrictions = 0;
    let totalWithAllergies = 0;
    let totalSevere = 0;
    
    const severeCodes = ['peanut', 'tree-nut', 'shellfish'];
    
    for (const record of rdRecords) {
      const restrictions = record.dietary_restrictions ? JSON.parse(record.dietary_restrictions) : [];
      const allergies = record.allergies ? JSON.parse(record.allergies) : [];
      const hour = record.reservation_time ? new Date(record.reservation_time).getHours() : 12;
      
      if (restrictions.length > 0) totalWithRestrictions++;
      if (allergies.length > 0) totalWithAllergies++;
      
      // Check severe
      const allergyCodes = allergies.map(a => typeof a === 'string' ? a : a.code);
      if (allergyCodes.some(a => severeCodes.includes(a))) totalSevere++;
      
      // Count restrictions
      for (const code of restrictions) {
        restrictionCounts[code] = (restrictionCounts[code] || 0) + 1;
      }
      
      // Count allergies  
      for (const allergy of allergies) {
        const code = typeof allergy === 'string' ? allergy : allergy.code;
        if (code) allergyCounts[code] = (allergyCounts[code] || 0) + 1;
      }
      
      // Period
      if (hour >= 11 && hour < 15) restrictionsByPeriod.lunch++;
      else if (hour >= 15 && hour < 22) restrictionsByPeriod.dinner++;
    }
    
    // Enrich with labels
    const allRestrictions = db.prepare('SELECT code, label FROM dietary_restrictions').all();
    const restrictionLabels = {};
    for (const r of allRestrictions) restrictionLabels[r.code] = r.label;
    
    const allAllergies = db.prepare('SELECT code, label FROM allergies').all();
    const allergyLabels = {};
    for (const a of allAllergies) allergyLabels[a.code] = a.label;
    
    const enrichedRestrictions = Object.entries(restrictionCounts)
      .map(([code, count]) => ({ code, label: restrictionLabels[code] || code, count }))
      .sort((a, b) => b.count - a.count);
    
    const enrichedAllergies = Object.entries(allergyCounts)
      .map(([code, count]) => ({ code, label: allergyLabels[code] || code, count }))
      .sort((a, b) => b.count - a.count);

    const mostCommonRestriction = enrichedRestrictions.length > 0 ? enrichedRestrictions[0].label : 'None';
    
    // Get all guest names with dietary needs for kitchen
    const today = new Date().toISOString().substring(0, 10);
    const todayDietary = db.prepare(`
      SELECT r.guest_name, r.reservation_time, rd.dietary_restrictions, rd.allergies
      FROM reservation_dietary rd
      JOIN reservations r ON rd.reservation_id = r.id
      WHERE r.restaurant_id = ? AND DATE(r.reservation_time) = ?
    `).all(restaurantId, today);
    
    const todayWithDietary = todayDietary.filter(d => {
      const restrictions = d.dietary_restrictions ? JSON.parse(d.dietary_restrictions) : [];
      const allergies = d.allergies ? JSON.parse(d.allergies) : [];
      return restrictions.length > 0 || allergies.length > 0;
    }).length;

    res.json({
      total_guests_with_restrictions: totalWithRestrictions,
      total_guests_with_allergies: totalWithAllergies,
      total_guests_severe_allergies: totalSevere,
      most_common_restriction: mostCommonRestriction,
      most_common_restrictions: enrichedRestrictions,
      most_common_allergies: enrichedAllergies,
      today_guests_with_dietary: todayWithDietary,
      by_period: restrictionsByPeriod,
      total_records_analyzed: rdRecords.length
    });
  } catch (error) {
    console.error('Dietary analytics error:', error);
    res.status(500).json({ error: 'Failed to generate dietary analytics' });
  }
});

// Catch-all - serve index.html for client-side routing
app.get('*', (req, res) => {
  // If requesting a file (with extension) that wasn't found in static, return 404
  if (req.path.includes('.') && !req.path.endsWith('.html')) {
    return res.status(404).send('Not found');
  }
  
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.sendFile(path.join(distPath, 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://0.0.0.0:${PORT}`);
});
