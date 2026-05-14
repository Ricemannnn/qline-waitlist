import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import db from './db.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
import { getCloverOAuthUrl, exchangeCodeForToken, getMerchantInfo, getTables } from './clover.js';
import { sendSMS, sendTableReadyNotification } from './notifications.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;
const BASE_URL = process.env.BASE_URL || `http://localhost:${PORT}`;
const JWT_SECRET = process.env.JWT_SECRET || 'qline-super-secret-key';

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Static files from the React app
app.use(express.static(path.join(__dirname, '../client/dist')));

// --- Auth Middleware ---
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ error: 'Access denied' });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid token' });
    req.user = user;
    next();
  });
};

// Basic health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// --- Auth Endpoints ---

// Register (Linked to a restaurant ID)
app.post('/api/auth/register', async (req, res) => {
  const { email, password, restaurant_id, name } = req.body;

  if (!email || !password || !restaurant_id) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    // Check if restaurant exists, if not create a placeholder
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
app.post('/api/auth/login', async (req, res) => {
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

    res.json({
      token,
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

// Get current user session
app.get('/api/auth/me', authenticateToken, (req, res) => {
  const user = db.prepare('SELECT u.id, u.email, u.restaurant_id, r.name as restaurant_name FROM users u JOIN restaurants r ON u.restaurant_id = r.id WHERE u.id = ?').get(req.user.id);
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

    // Fetch merchant details
    const merchantInfo = await getMerchantInfo(merchant_id, accessToken);

    // Save or update restaurant in DB
    const existingRestaurant = db.prepare('SELECT * FROM restaurants WHERE clover_merchant_id = ?').get(merchant_id);

    if (existingRestaurant) {
      db.prepare('UPDATE restaurants SET clover_access_token = ?, name = ? WHERE clover_merchant_id = ?')
        .run(accessToken, merchantInfo.name, merchant_id);
    } else {
      db.prepare('INSERT INTO restaurants (id, name, clover_merchant_id, clover_access_token) VALUES (?, ?, ?, ?)')
        .run(merchant_id, merchantInfo.name, merchant_id, accessToken);
        
      db.prepare('INSERT INTO settings (restaurant_id, wait_time_per_party) VALUES (?, ?)').run(merchant_id, 10);
    }

    res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/host?merchantId=${merchant_id}`);
  } catch (error) {
    console.error('Clover OAuth Error:', error.response?.data || error.message);
    res.status(500).send('Authentication failed');
  }
});

// Check if merchant is connected to Clover
app.get('/api/auth/clover/status/:merchantId', (req, res) => {
  const { merchantId } = req.params;
  const restaurant = db.prepare('SELECT * FROM restaurants WHERE clover_merchant_id = ?').get(merchantId);
  
  if (restaurant && restaurant.clover_access_token) {
    res.json({ connected: true, merchantName: restaurant.name });
  } else {
    res.json({ connected: false });
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

  // Add a demo user for password login
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

app.post('/api/settings/:restaurantId', (req, res) => {
  const { restaurantId } = req.params;
  const { wait_time_per_party, total_tables, sms_template } = req.body;
  
  const existing = db.prepare('SELECT * FROM settings WHERE restaurant_id = ?').get(restaurantId);
  
  if (existing) {
    db.prepare('UPDATE settings SET wait_time_per_party = ?, total_tables = ?, sms_template = ?, updated_at = CURRENT_TIMESTAMP WHERE restaurant_id = ?')
      .run(wait_time_per_party, total_tables || 10, sms_template, restaurantId);
  } else {
    db.prepare('INSERT INTO settings (restaurant_id, wait_time_per_party, total_tables, sms_template) VALUES (?, ?, ?, ?)')
      .run(restaurantId, wait_time_per_party, total_tables || 10, sms_template);
  }
  
  res.json({ success: true });
});

// Tables API
app.get('/api/tables/:restaurantId', (req, res) => {
  const { restaurantId } = req.params;
  const tables = db.prepare('SELECT * FROM tables WHERE restaurant_id = ?').all(restaurantId);
  res.json(tables);
});

app.post('/api/tables/:restaurantId', (req, res) => {
  const { restaurantId } = req.params;
  const { name, capacity, status, x, y } = req.body;
  
  const result = db.prepare('INSERT INTO tables (restaurant_id, name, capacity, status, x, y) VALUES (?, ?, ?, ?, ?, ?)')
    .run(restaurantId, name, capacity || 4, status || 'available', x || 0, y || 0);
  
  res.json({ id: result.lastInsertRowid });
});

app.patch('/api/tables/:id', (req, res) => {
  const { id } = req.params;
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

app.post('/api/waitlist/:restaurantId/join', (req, res) => {
  const { restaurantId } = req.params;
  const { guest_name, party_size, phone_number } = req.body;
  
  if (!guest_name || !party_size) {
    return res.status(400).json({ error: 'Guest name and party size are required.' });
  }

  const result = db.prepare(
    'INSERT INTO waitlist (restaurant_id, guest_name, party_size, phone_number) VALUES (?, ?, ?, ?)'
  ).run(restaurantId, guest_name, party_size, phone_number);

  res.status(201).json({ id: result.lastInsertRowid, status: 'waiting' });
});

app.patch('/api/waitlist/status/:id', (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  db.prepare('UPDATE waitlist SET status = ? WHERE id = ?').run(status, id);
  res.json({ success: true });
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

  const settings = db.prepare('SELECT wait_time_per_party FROM settings WHERE restaurant_id = ?').get(guest.restaurant_id);
  const waitTimePerParty = settings ? settings.wait_time_per_party : 10;

  res.json({
    guest,
    position,
    ahead,
    estimated_wait: ahead * waitTimePerParty
  });
});

app.post('/api/waitlist/:restaurantId/notify/:id', async (req, res) => {
  const { restaurantId, id } = req.params;
  
  const guest = db.prepare('SELECT * FROM waitlist WHERE id = ?').get(id);
  
  if (!guest) {
    return res.status(404).json({ error: 'Guest not found' });
  }
  
  if (!guest.phone_number) {
    return res.status(400).json({ error: 'Guest does not have a phone number' });
  }

  try {
    const restaurant = db.prepare('SELECT name FROM restaurants WHERE id = ?').get(restaurantId);
    const settings = db.prepare('SELECT sms_template FROM settings WHERE restaurant_id = ?').get(restaurantId);
    
    let message = settings ? settings.sms_template : 'Hi {guest_name}, your table at {restaurant_name} is ready!';
    message = message.replace('{guest_name}', guest.guest_name);
    message = message.replace('{restaurant_name}', restaurant ? restaurant.name : 'Qline');

    await sendSMS(guest.phone_number, message);
    db.prepare('UPDATE waitlist SET status = ? WHERE id = ?').run('notified', id);
    res.json({ success: true });
  } catch (error) {
    console.error('Notification Error:', error);
    res.status(500).json({ error: 'Failed to send notification' });
  }
});

// Reservations API
app.get('/api/reservations/:restaurantId', (req, res) => {
  const { restaurantId } = req.params;
  const list = db.prepare('SELECT * FROM reservations WHERE restaurant_id = ? ORDER BY reservation_time ASC').all(restaurantId);
  res.json(list);
});

app.post('/api/reservations/:restaurantId', (req, res) => {
  const { restaurantId } = req.params;
  const { guest_name, party_size, phone_number, reservation_time } = req.body;

  if (!guest_name || !party_size || !reservation_time) {
    return res.status(400).json({ error: 'Guest name, party size, and time are required.' });
  }

  const result = db.prepare(
    'INSERT INTO reservations (restaurant_id, guest_name, party_size, phone_number, reservation_time) VALUES (?, ?, ?, ?, ?)'
  ).run(restaurantId, guest_name, party_size, phone_number, reservation_time);

  res.status(201).json({ id: result.lastInsertRowid, status: 'confirmed' });
});

app.patch('/api/reservations/status/:id', (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  db.prepare('UPDATE reservations SET status = ? WHERE id = ?').run(status, id);
  res.json({ success: true });
});

// Catch-all to serve React app
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/dist/index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://0.0.0.0:${PORT}`);
});
