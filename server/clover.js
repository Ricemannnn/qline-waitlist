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

export {
  getCloverOAuthUrl,
  exchangeCodeForToken,
  getMerchantInfo,
  getTables
};
