import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const CHAPA_SECRET_KEY = process.env.CHAPA_SECRET_KEY!;
const CHAPA_BASE_URL = 'https://api.chapa.co/v1';

const chapa = axios.create({
  baseURL: CHAPA_BASE_URL,
  headers: {
    Authorization: `Bearer ${CHAPA_SECRET_KEY}`,
    'Content-Type': 'application/json',
  },
});

export interface ChapaPaymentData {
  amount: number;
  currency: string;
  email: string;
  first_name: string;
  last_name: string;
  tx_ref: string;
  callback_url: string;
  return_url: string;
  customization?: {
    title?: string;
    description?: string;
  };
}

export const initializePayment = async (data: ChapaPaymentData) => {
  try {
    const response = await chapa.post('/transaction/initialize', data);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Payment initialization failed');
  }
};

export const verifyPayment = async (txRef: string) => {
  try {
    const response = await chapa.get(`/transaction/verify/${txRef}`);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Payment verification failed');
  }
};

export default chapa; 