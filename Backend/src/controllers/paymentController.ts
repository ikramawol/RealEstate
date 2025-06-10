import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { initializePayment, verifyPayment } from '../utils/chapa';
import { v4 as uuidv4 } from 'uuid';
import * as crypto from 'crypto'

const prisma = new PrismaClient() as any;
const reference = crypto.randomBytes(32).toString('hex')

export const createPayment = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { propertyId, email, firstName, lastName } = req.body;
    const user = (req as any).user;
    if (!user) return res.status(401).json({ error: 'Unauthorized' });

    // Get property details
    const property = await prisma.propertyDetail.findUnique({
      where: { id: Number(propertyId) }
    });

    if (!property) {
      return res.status(404).json({ error: 'Property not found' });
    }

    // Generate unique transaction reference
    const txRef = `TX-${uuidv4()}`;

    // Initialize payment
    const paymentData = {
      amount: property.price,
      currency: 'ETB',
      email,
      first_name: firstName,
      last_name: lastName,
      tx_ref: txRef,
      callback_url: `${process.env.BASE_URL}/api/payment/verify`,
      return_url: `${process.env.FRONTEND_URL}/payment/success`,
      customization: {
        title: 'Property Payment',
        description: `Payment for property: ${property.description.substring(0, 50)}...`
      }
    };

    const payment = await initializePayment(paymentData);

    // Store payment information
    await prisma.payment.create({
      data: {
        userId: user.id,
        propertyId: property.id,
        amount: property.price,
        txRef,
        status: 'PENDING'
      }
    });

    res.json(payment);
  } catch (error) {
    next(error);
  }
};

export const verifyPaymentStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { tx_ref } = req.query;
    
    if (!tx_ref) {
      return res.status(400).json({ error: 'Transaction reference is required' });
    }

    const verification = await verifyPayment(tx_ref as string);

    // Update payment status in database
    await prisma.payment.update({
      where: { txRef: tx_ref as string },
      data: {
        status: verification.status === 'success' ? 'COMPLETED' : 'FAILED'
      }
    });

    res.json(verification);
  } catch (error) {
    next(error);
  }
}; 