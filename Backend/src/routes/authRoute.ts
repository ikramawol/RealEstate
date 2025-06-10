import { Router, RequestHandler } from 'express';
import {
  userSignup,
  userLogin,
  adminSignup,
  adminLogin,
  refreshAccessToken
} from '../controllers/authController';

const router = Router();

// User Routes
router.post('/signup', userSignup as RequestHandler);
router.post('/login', userLogin as RequestHandler);

// Admin Routes
router.post('/admin/signup', adminSignup as RequestHandler);
router.post('/admin/login', adminLogin as RequestHandler);

// Token Refresh Route (shared for both user and admin)
router.post('/refresh-token', refreshAccessToken as RequestHandler);

export default router;
