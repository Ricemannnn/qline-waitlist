import twilio from 'twilio';
import dotenv from 'dotenv';

dotenv.config();

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const fromPhone = process.env.TWILIO_PHONE_NUMBER;

const isConfigured = accountSid && accountSid.startsWith("AC") && 
                     authToken && !authToken.includes('YOUR_') &&
                     fromPhone && !fromPhone.includes('YOUR_');

const client = isConfigured ? twilio(accountSid, authToken) : null;

const normalizePhone = (phone) => {
  if (!phone) return phone;
  // If it already looks like E.164, leave it
  if (phone.startsWith('+')) return phone;
  
  const digits = phone.replace(/\D/g, '');
  // Default to US (+1) if 10 digits
  if (digits.length === 10) return `+1${digits}`;
  // If 11 digits and starts with 1, it's already got the country code
  if (digits.length === 11 && digits.startsWith('1')) return `+${digits}`;
  
  return phone; 
};

export const sendSMS = async (to, message) => {
  const formattedTo = normalizePhone(to);
  
  if (!client) {
    console.log(`[Mock SMS] To: ${formattedTo}, Message: ${message}`);
    return { sid: 'mock-sid', status: 'sent' };
  }

  try {
    const result = await client.messages.create({
      body: message,
      from: fromPhone,
      to: formattedTo
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
