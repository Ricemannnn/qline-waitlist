import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import db from './db.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
import { getCloverOAuthUrl, exchangeCodeForToken, getMerchantInfo, getTables } from './clover.js';
import { sendTableReadyNotification } from './notifications.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;
const BASE_URL = process.env.BASE_URL || `http://localhost:${PORT}`;

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Static files from the React app
app.use(express.static(path.join(__dirname, '../client/dist')));

// Basic health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Clover OAuth Routes
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
      // For new restaurants, use merchant_id as the internal id if not already used
      db.prepare('INSERT INTO restaurants (id, name, clover_merchant_id, clover_access_token) VALUES (?, ?, ?, ?)')
        .run(merchant_id, merchantInfo.name, merchant_id, accessToken);
    }

    // Redirect to the frontend dashboard or a success page
    res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/host?merchantId=${merchant_id}`);
  } catch (error) {
    console.error('Clover OAuth Error:', error.response?.data || error.message);
    res.status(500).send('Authentication failed');
  }
});

// Clover Integration Endpoints
app.get('/api/clover/tables/:merchantId', async (req, res) => {
  const { merchantId } = req.params;
  const restaurant = db.prepare('SELECT * FROM restaurants WHERE clover_merchant_id = ?').get(merchantId);

  if (!restaurant || !restaurant.clover_access_token) {
    return res.status(401).json({ error: 'Clover access token not found for this merchant' });
  }

  try {
    const tables = await getTables(merchantId, restaurant.clover_access_token);
    res.json(tables);
  } catch (error) {
    console.error('Error fetching Clover tables:', error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to fetch tables from Clover' });
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

// Seed demo restaurant if not exists
const seedDemo = () => {
  const demoId = 'demo-1';
  const row = db.prepare('SELECT * FROM restaurants WHERE id = ?').get(demoId);
  if (!row) {
    db.prepare('INSERT INTO restaurants (id, name) VALUES (?, ?)').run(demoId, 'The Golden Fork');
    console.log('Demo restaurant seeded.');
  }
};
seedDemo();

// Waitlist API
app.get('/api/waitlist/:restaurantId', (req, res) => {
  const { restaurantId } = req.params;
  const list = db.prepare('SELECT * FROM waitlist WHERE restaurant_id = ? AND status = \'waiting\' ORDER BY joined_at ASC').all(restaurantId);
  res.json(list);
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
  const { status } = req.body; // seated, cancelled, notified

  db.prepare('UPDATE waitlist SET status = ? WHERE id = ?').run(status, id);
  res.json({ success: true });
});

app.post('/api/waitlist/:restaurantId/notify/:id', async (req, res) => {
  const { id } = req.params;
  
  const guest = db.prepare('SELECT * FROM waitlist WHERE id = ?').get(id);
  
  if (!guest) {
    return res.status(404).json({ error: 'Guest not found' });
  }
  
  if (!guest.phone_number) {
    return res.status(400).json({ error: 'Guest does not have a phone number' });
  }

  try {
    await sendTableReadyNotification(guest.phone_number, guest.guest_name);
    db.prepare('UPDATE waitlist SET status = ? WHERE id = ?').run('notified', id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to send notification' });
  }
});

// Reservations API
app.get('/api/reservations/:restaurantId', (req, res) => {
  const { restaurantId } = req.params;
  const list = db.prepare('SELECT * FROM reservations WHERE restaurant_id = ? ORDER BY reservation_time ASC').all(restaurantId);
  res.json(list);
});

// All other GET requests not handled before will return our React app
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/dist/index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://0.0.0.0:${PORT}`);
});
