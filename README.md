# Qline - Reservation & Waitlist System

Qline is a professional reservation and waitlist management system built for high-volume restaurants. It integrates seamlessly with Clover POS to streamline front-of-house operations.

## Features
- **Real-time Waitlist:** Guests can join via QR code and track their spot in line.
- **SMS Notifications:** Automatically text guests when their table is ready (Twilio integration).
- **Clover Integration:** Sync merchant data and authorization via Clover OAuth.
- **Host Dashboard:** Easy-to-use interface for managing active queues and reservations.

## Tech Stack
- **Frontend:** React (Vite), Tailwind CSS, Lucide Icons, Radix UI.
- **Backend:** Node.js, Express, Better-SQLite3.
- **Integrations:** Clover API, Twilio SMS API.

## Getting Started

### 1. Prerequisites
- Node.js (v18 or higher)
- Clover Developer Account (for OAuth credentials)
- Twilio Account (for SMS capability)

### 2. Installation
```bash
# Install dependencies for the server
cd server
npm install

# Install dependencies for the client
cd ../client
npm install
```

### 3. Configuration
Copy `.env.example` to `server/.env` and fill in your credentials:
```bash
cp .env.example server/.env
```

### 4. Running the App
**Development Mode:**
```bash
# Run backend and frontend simultaneously
./start.sh
```
The frontend will be available at `http://localhost:5173` and the backend at `http://localhost:3001`.

**Production Build:**
```bash
# Build the frontend
cd client
npm run build

# Start the backend (which can serve the static files if configured, or run separately)
cd ../server
npm start
```

## Clover App Store Submission
To prepare for submission:
1. Ensure your Clover App ID and Secret are correctly configured in `.env`.
2. Configure the Redirect URL in your Clover Developer Dashboard to match your production `BASE_URL`.
3. Test the "Connect with Clover" flow from the landing page.
