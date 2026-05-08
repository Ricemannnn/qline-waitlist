import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const CLOVER_CLIENT_ID = process.env.CLOVER_CLIENT_ID;
const CLOVER_CLIENT_SECRET = process.env.CLOVER_CLIENT_SECRET;
const CLOVER_API_URL = process.env.CLOVER_API_URL || 'https://api.clover.com';
const CLOVER_ENVIRONMENT = process.env.CLOVER_ENVIRONMENT || 'sandbox'; // 'sandbox' or 'prod'

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

  const response = await axios.get(`${baseUrl}/oauth/token`, {
    params: {
      client_id: CLOVER_CLIENT_ID,
      client_secret: CLOVER_CLIENT_SECRET,
      code: code
    }
  });

  return response.data; // { access_token: '...', ... }
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
