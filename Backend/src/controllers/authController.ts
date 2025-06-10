import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { promisify } from 'util';

const prisma = new PrismaClient();

// Environment Variables
const JWT_SECRET = process.env.JWT_SECRET!;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET!;
const JWT_EXPIRES_IN = '15m'; // Short-lived access token
const JWT_REFRESH_EXPIRES_IN = '7d'; // Longer-lived refresh token


// Generate Access Token
const generateAccessToken = (payload: object) => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};

// Generate Refresh Token
const generateRefreshToken = (payload: object) => {
  return jwt.sign(payload, JWT_REFRESH_SECRET, {
    expiresIn: JWT_REFRESH_EXPIRES_IN,
  });
};

// ========== USER SIGNUP ==========
export const userSignup = async (req: Request, res: Response) => {
  const { username, email, password, phoneNumber, profilePicture } = req.body;

  try {
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser)
      return res.status(400).json({ message: 'Email already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
        phoneNumber,
        profilePicture,
      },
    });

    const accessToken = generateAccessToken({ id: user.id, role: 'USER' });
    const refreshToken = generateRefreshToken({ id: user.id, role: 'USER' });

    res.status(201).json({ accessToken, refreshToken, user });
  } catch (err) {
    res.status(500).json({ message: 'User signup failed', error: err });
  }
};

// ========== ADMIN SIGNUP ==========
export const adminSignup = async (req: Request, res: Response) => {
  const { username, email, password } = req.body;

  try {
    const existingAdmin = await prisma.admin.findUnique({ where: { email } });
    if (existingAdmin)
      return res.status(400).json({ message: 'Email already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const admin = await prisma.admin.create({
      data: {
        username,
        email,
        password: hashedPassword,
      },
    });

    const accessToken = generateAccessToken({ id: admin.id, role: 'ADMIN' });
    const refreshToken = generateRefreshToken({ id: admin.id, role: 'ADMIN' });

    res.status(201).json({ accessToken, refreshToken, admin });
  } catch (err) {
    res.status(500).json({ message: 'Admin signup failed', error: err });
  }
};

// ========== USER LOGIN ==========
export const userLogin = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user)
      return res.status(400).json({ message: 'Invalid email or password' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ message: 'Invalid email or password' });

    const accessToken = generateAccessToken({ id: user.id, role: 'USER' });
    const refreshToken = generateRefreshToken({ id: user.id, role: 'USER' });

    res.json({ accessToken, refreshToken, user });
  } catch (err) {
    res.status(500).json({ message: 'Login failed', error: err });
  }
};

// ========== ADMIN LOGIN ==========
export const adminLogin = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  try {
    const admin = await prisma.admin.findUnique({ where: { email } });
    if (!admin)
      return res.status(400).json({ message: 'Invalid email or password' });

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch)
      return res.status(400).json({ message: 'Invalid email or password' });

    const accessToken = generateAccessToken({ id: admin.id, role: 'ADMIN' });
    const refreshToken = generateRefreshToken({ id: admin.id, role: 'ADMIN' });

    res.json({ accessToken, refreshToken, admin });
  } catch (err) {
    res.status(500).json({ message: 'Login failed', error: err });
  }
};

// ========== REFRESH ACCESS TOKEN ==========
export const refreshAccessToken = async (req: Request, res: Response) => {
  const { refreshToken } = req.body;
  if (!refreshToken)
    return res.status(401).json({ message: 'Missing refresh token' });

  try {
    const decoded = jwt.verify(refreshToken, JWT_REFRESH_SECRET) as any;

    const newAccessToken = generateAccessToken({
      id: decoded.id,
      role: decoded.role,
    });

    res.status(200).json({ accessToken: newAccessToken });
  } catch (err) {
    return res
      .status(403)
      .json({ message: 'Invalid or expired refresh token' });
  }
};

// ========== PROTECT MIDDLEWARE ==========
export const protect = async (req: any, res: Response, next: NextFunction) => {
  try {
    let token;
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return next(
        new Error('You are not logged in. Please log in to get access.'),
      );
    }

    const decoded = await verifyToken(token);
    const user = await prisma.admin.findUnique({ where: { id: decoded.id } });

    if (!user) {
      return next(
        new Error('The user belonging to this token does no longer exist.'),
      );
    }

    // if (user.passwordChangedAt && decoded.iat < user.passwordChangedAt.getTime() / 1000) {
    //   return next(new Error('User recently changed password. Please login again.'));
    // }

    req.user = user;
    next();
  } catch (err) {
    next(err);
  }
};
const verifyToken = (token: string): Promise<any> => {
  return new Promise((resolve, reject) => {
    jwt.verify(token, JWT_SECRET, (err, decoded) => {
      if (err) return reject(err);
      resolve(decoded);
    });
  });
};
