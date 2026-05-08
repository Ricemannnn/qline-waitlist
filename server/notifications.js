import twilio from 'twilio';
import dotenv from 'dotenv';

dotenv.config();

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const fromPhone = process.env.TWILIO_PHONE_NUMBER;

const client = (accountSid && accountSid.startsWith("AC") && authToken) ? twilio(accountSid, authToken) : null;

export const sendSMS = async (to, message) => {
  if (!client) {
    console.log(`[Mock SMS] To: ${to}, Message: ${message}`);
    return { sid: 'mock-sid', status: 'sent' };
  }

  try {
    const result = await client.messages.create({
      body: message,
      from: fromPhone,
      to: to
    });
    return result;
  } catch (error) {
    console.error('Twilio Error:', error.message);
    throw error;
  }
};

export const sendTableReadyNotification = async (phoneNumber, guestName) => {
  const message = `Hi ${guestName}, your table at Qline is ready! Please head to the host stand.`;
  return sendSMS(phoneNumber, message);
};
