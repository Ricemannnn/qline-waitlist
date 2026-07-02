import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

// Support both naming conventions
const CLOVER_CLIENT_ID = process.env.CLOVER_APP_ID || process.env.CLOVER_CLIENT_ID;
const CLOVER_CLIENT_SECRET = process.env.CLOVER_APP_SECRET || process.env.CLOVER_CLIENT_SECRET;
const CLOVER_ENVIRONMENT = process.env.CLOVER_ENVIRONMENT || 'sandbox'; // 'sandbox' or 'prod'

// Auto-select API URL based on environment
const CLOVER_API_URL = CLOVER_ENVIRONMENT === 'sandbox' 
  ? 'https://sandbox.dev.clover.com' 
  : 'https://api.clover.com';

const getCloverOAuthUrl = (redirectUri) => {
  const baseUrl = CLOVER_ENVIRONMENT === 'sandbox' 
    ? 'https://sandbox.dev.clover.com' 
    : 'https://www.clover.com';
  
  return `${baseUrl}/oauth/authorize?client_id=${CLOVER_CLIENT_ID}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code`;
};

const exchangeCodeForToken = async (code) => {
  const baseUrl = CLOVER_ENVIRONMENT === 'sandbox' 
    ? 'https://sandbox.dev.clover.com' 
    : 'https://www.clover.com';

  console.log(`Exchanging code for token at ${baseUrl}...`);

  try {
    const response = await axios.get(`${baseUrl}/oauth/token`, {
      params: {
        client_id: CLOVER_CLIENT_ID,
        client_secret: CLOVER_CLIENT_SECRET,
        code: code
      }
    });

    return response.data; // { access_token: '...', ... }
  } catch (error) {
    console.error('Clover Token Exchange Error details:', error.response?.data || error.message);
    throw error;
  }
};

const getMerchantInfo = async (merchantId, accessToken) => {
  const response = await axios.get(`${CLOVER_API_URL}/v3/merchants/${merchantId}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`
    }
  });

  return response.data;
};

const getTables = async (merchantId, accessToken) => {
  const response = await axios.get(`${CLOVER_API_URL}/v3/merchants/${merchantId}/tables`, {
    headers: {
      Authorization: `Bearer ${accessToken}`
    }
  });

  return response.data;
};

/**
 * Build a condensed dietary note string from reservation_dietary data
 * Format: "Dietary: GF, NF | Allergies: Peanut (severe) | EpiPen carried | Other needs"
 */
const buildDietaryNote = (dietaryData, restrictionLabels = {}, allergyLabels = {}) => {
  const parts = [];

  if (dietaryData.dietary_restrictions && dietaryData.dietary_restrictions.length > 0) {
    const labels = dietaryData.dietary_restrictions.map(code => restrictionLabels[code] || code);
    parts.push(`Dietary: ${labels.join(', ')}`);
  }

  if (dietaryData.allergies && dietaryData.allergies.length > 0) {
    const allergyParts = dietaryData.allergies.map(allergy => {
      const code = typeof allergy === 'string' ? allergy : allergy.code;
      const severity = typeof allergy === 'object' ? allergy.severity : null;
      const carriesEpiPen = typeof allergy === 'object' ? allergy.carries_epipen : false;
      const label = allergyLabels[code] || code;
      let text = label;
      if (severity) text += ` (${severity})`;
      return text;
    });
    parts.push(`Allergies: ${allergyParts.join(', ')}`);

    // Check if any allergy carries epipen
    const hasEpiPen = dietaryData.allergies.some(a => typeof a === 'object' && a.carries_epipen);
    if (hasEpiPen) {
      parts.push('EpiPen carried');
    }
  }

  if (dietaryData.other_needs && dietaryData.other_needs.trim()) {
    parts.push(`Other: ${dietaryData.other_needs.trim()}`);
  }

  return parts.join(' | ') || 'No dietary restrictions';
};

/**
 * Add a note to a Clover order
 * https://docs.clover.com/reference/orders-1
 */
const addOrderNote = async (merchantId, accessToken, orderId, note) => {
  try {
    // Clover API: Add a line item note or update order with note
    // We add a custom note by updating the order with a note field
    const response = await axios.post(
      `${CLOVER_API_URL}/v3/merchants/${merchantId}/orders/${orderId}/notes`,
      { text: note },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      }
    );
    return response.data;
  } catch (error) {
    console.error('Clover Add Order Note Error:', error.response?.data || error.message);
    throw error;
  }
};

/**
 * Create a pending Clover order with dietary notes
 * Used when no order exists yet for the reservation
 */
const createOrderWithNote = async (merchantId, accessToken, note, guestName) => {
  try {
    const response = await axios.post(
      `${CLOVER_API_URL}/v3/merchants/${merchantId}/orders`,
      {
        title: guestName ? `Qline - ${guestName}` : 'Qline Reservation',
        note: note,
        state: 'open'
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      }
    );
    return response.data;
  } catch (error) {
    console.error('Clover Create Order Error:', error.response?.data || error.message);
    throw error;
  }
};

export {
  getCloverOAuthUrl,
  exchangeCodeForToken,
  getMerchantInfo,
  getTables,
  addOrderNote,
  createOrderWithNote,
  buildDietaryNote
};
