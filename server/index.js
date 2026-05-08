import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import db from './db.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
import { getCloverOAuthUrl, exchangeCodeForToken, getMerchantInfo, getTables } from './clover.js';
import { sendSMS, sendTableReadyNotification } from './notifications.js';

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
        
      // Initialize default settings for new restaurant
      db.prepare('INSERT INTO settings (restaurant_id, wait_time_per_party) VALUES (?, ?)').run(merchant_id, 10);
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
  
  // Seed default settings for demo
  const settings = db.prepare('SELECT * FROM settings WHERE restaurant_id = ?').get(demoId);
  if (!settings) {
    db.prepare('INSERT INTO settings (restaurant_id, wait_time_per_party) VALUES (?, ?)').run(demoId, 10);
    console.log('Demo settings seeded.');
  }
};
seedDemo();

// Settings API
app.get('/api/settings/:restaurantId', (req, res) => {
  const { restaurantId } = req.params;
  let settings = db.prepare('SELECT * FROM settings WHERE restaurant_id = ?').get(restaurantId);
  
  if (!settings) {
    // Return defaults if not found
    settings = {
      restaurant_id: restaurantId,
      wait_time_per_party: 10,
      sms_template: 'Hi {guest_name}, your table at {restaurant_name} is ready!'
    };
  }
  
  res.json(settings);
});

app.post('/api/settings/:restaurantId', (req, res) => {
  const { restaurantId } = req.params;
  const { wait_time_per_party, sms_template } = req.body;
  
  const existing = db.prepare('SELECT * FROM settings WHERE restaurant_id = ?').get(restaurantId);
  
  if (existing) {
    db.prepare('UPDATE settings SET wait_time_per_party = ?, sms_template = ?, updated_at = CURRENT_TIMESTAMP WHERE restaurant_id = ?')
      .run(wait_time_per_party, sms_template, restaurantId);
  } else {
    db.prepare('INSERT INTO settings (restaurant_id, wait_time_per_party, sms_template) VALUES (?, ?, ?)')
      .run(restaurantId, wait_time_per_party, sms_template);
  }
  
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
  const { status } = req.body; // seated, cancelled, notified

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
    // Get settings for custom SMS template
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
  const { status } = req.body; // confirmed, seated, cancelled, no-show

  db.prepare('UPDATE reservations SET status = ? WHERE id = ?').run(status, id);
  res.json({ success: true });
});

// All other GET requests not handled before will return our React app
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/dist/index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://0.0.0.0:${PORT}`);
});
